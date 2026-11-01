import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import { CpfMascarado } from "@/components/campos/cpf-mascarado";

import { SaasShell, useSaas, EstadoVazio } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { PendenciasHumanasCaso } from "@/components/caso/pendencias-humanas-caso";
import { NucleoKitPessoa } from "@/components/desk/kit-conectado";
import { useAutoridade } from "@/components/saas/autoridade";
import { atualizarPessoa, carregarPessoa } from "@/lib/pessoa.functions";
import { salvarLeadDesk } from "@/lib/crm-desk.functions";
import { DecisaoAposSalvarPessoa } from "@/components/pessoa/decisao-apos-salvar";
import { ContatosDaPessoa } from "@/components/pessoa/contatos-pessoa";
import {
  evidenciaDeMesmaPessoa,
  inventarioDocumentalDaPessoa,
  montarLinhaDoTempoDaPessoa,
  type EvidenciaDeElo,
} from "@/lib/pessoa-identidade";
import { TIPOS_DOCUMENTO } from "@/lib/fontes-documentos";
import {
  cepValido,
  cpfValido,
  emailValido,
  formatarCep,
  formatarCpf,
  formatarTelefone,
  rgOrgaoUfValido,
  telefoneValido,
  UFS_BRASIL,
} from "@/lib/validacao-pessoa";
import { rotuloFase } from "@/lib/fase-rotulo";
import { obterProximaAcaoCanonica, SELO_PROXIMA_ACAO, PAPEIS_PESSOA, EIXO_FORMALIZACAO } from "@/lib/caso-ficha";
import { resumoVisaoClienteCaso } from "@/lib/app-cliente-como-pessoa.functions";
import { NOME_RESPONSAVEL_PADRAO } from "@/lib/responsavel-padrao";
import { ordenarPorPrioridade, sinaisDaPessoa, type PrioridadeSinal } from "@/lib/pessoa-sinais";
import { relacoesAprovadas, estadoDeConfirmacao } from "@/lib/golive-pessoas";
import {
  CAMPOS_CIVIS_RECONCILIAVEIS,
  COLUNA_CLIENTE_CIVIL,
  ROTULO_CAMPO_CIVIL,
  sinalCampoCivilDaPessoaPorCaso,
  sinalCepDaPessoaPorCaso,
  sinalCpfDaPessoaPorCaso,
  sinalTelefoneDaPessoaPorCaso,
} from "@/lib/pessoa-vinculo";
import { dossieMaeDoCaso } from "@/lib/nucleo-completude";
import { ComposicaoPessoa360V4 } from "@/components/pessoa/composicao-pessoa360-v4";
import { RELEVANCIAS, STATUS_VALIDACAO, TIPOS_ACHADO } from "@/lib/achados-genealogicos";
import { ROTULO_DEMONSTRACAO, ehFixtureLinha } from "@/lib/fixtures";

const rotulo = (lista: { id: string; rotulo: string }[], id: unknown) =>
  lista.find((x) => x.id === id)?.rotulo ?? String(id ?? "—");

/**
 * A página de uma pessoa.
 *
 * A Proprietária vem dizendo há dois anos que "a Ana Luiza um dia foi lead e
 * depois virou cliente, mas Ana Luiza continua sendo Ana Luiza". O Desk tinha
 * casos e não tinha gente: dava para abrir um caso, nunca uma pessoa.
 *
 * Aqui a história é uma só, mesmo quando os casos são vários — e cada fato
 * continua dizendo de qual caso veio.
 */
export const Route = createFileRoute("/_authenticated/pessoas/$clienteId")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Pessoa — Clube Ancestral" },
      { name: "description", content: "A história de uma pessoa, reunida de todos os casos dela." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pessoa,
});

const FORCA_ROTULO: Record<EvidenciaDeElo["forca"], string> = {
  confirmado: "Mesma pessoa",
  provavel: "Provavelmente a mesma pessoa",
  apenas_indicio: "Só um indício",
};

const ROTULO_PRIORIDADE: Record<PrioridadeSinal, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const CLASSE_PRIORIDADE: Record<PrioridadeSinal, string> = {
  critica: "border-terracotta",
  alta: "border-gold",
  media: "border-navy/40",
  baixa: "border-navy/15",
};

// P31 (26/09/2026) — "Comercial" e "Consentimentos" da Pessoa 360.
// Vocabulário fechado real (CHECK de `clientes.classificacao`, migration
// 20260821184733; CHECK de `consent_records.tipo_consentimento`/`status`,
// migration 20260816202602) — nunca inventado.
const ROTULO_CLASSIFICACAO: Record<string, string> = {
  pre_cliente: "Pré-cliente",
  cliente_ativo: "Cliente ativo",
  participante_familiar: "Participante familiar",
};

// status_comercial é texto livre no schema, mas só 6 valores aparecem no
// código real (trigger fn_cliente_classificacao_guard, mensagem de erro de
// "origem inválida" cita exatamente estes 6 como status comercial válido).
const ROTULO_STATUS_COMERCIAL: Record<string, string> = {
  proposta_enviada: "Proposta enviada",
  proposta_aprovada: "Proposta aprovada",
  aceite_verbal: "Aceite verbal",
  contrato_assinado: "Contrato assinado",
  pagamento_confirmado: "Pagamento confirmado",
  onboarding: "Onboarding",
};

const ROTULO_TIPO_CONSENTIMENTO: Record<string, string> = {
  tratamento_dados: "Tratamento de dados",
  compartilhamento_terceiros: "Compartilhamento com terceiros",
  comunicacoes: "Comunicações",
};

const ROTULO_STATUS_CONSENTIMENTO: Record<string, string> = {
  coletado: "Coletado",
  ativo: "Ativo",
  revogado: "Revogado",
  expirado: "Expirado",
};

const ESTILO_STATUS_CONSENTIMENTO: Record<string, string> = {
  coletado: "border-navy/20 bg-cream/40 text-navy/70",
  ativo: "border-gold/50 bg-gold/10 text-navy/80",
  revogado: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  expirado: "border-terracotta/30 bg-terracotta/5 text-terracotta/80",
};

// CA03-PESSOA-UNICA-VINCULOS (09/09/2026): esta lista de UFs vivia
// hard-coded aqui, separada de `UFS_BRASIL` (validacao-pessoa.ts) — duas
// fontes da mesma taxonomia fechada, podendo divergir em silêncio. Reusa a
// existente; não é frente visual nova, o select continua igual.
const UFS = UFS_BRASIL.map((u) => u.sigla);

/*
  05/09/2026 — achado real reportado pela Proprietária: "sexo" e "estado_civil"
  tinham input de texto livre no formulário, mas o banco só aceita um conjunto
  fechado de valores (clientes_sexo_check, clientes_estado_civil_check,
  clientes_endereco_uf_check). Digitar "Feminino" (maiúsculo) já rejeitava a
  gravação com um erro de constraint técnico. Os três viram select com os
  valores exatos que o banco aceita — impossível digitar um valor inválido.
*/
const CAMPOS_FORM: {
  chave: keyof CamposPessoa;
  rotulo: string;
  tipo?: "data" | "select";
  opcoes?: { valor: string; rotulo: string }[];
  // CA03-PESSOA-UNICA-VINCULOS (09/09/2026): reusa as máscaras já existentes
  // (validacao-pessoa.ts) neste formulário ativo, que já edita CPF/CEP/
  // telefone sem nenhuma — não é frente visual nova, só formata o mesmo input.
  mascara?: (v: string) => string;
}[] = [
  { chave: "nome", rotulo: "Nome completo" },
  { chave: "nome_social", rotulo: "Nome social (se diferente)" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "telefone", rotulo: "Telefone", mascara: formatarTelefone },
  {
    // P31 (26/09/2026): pedido direto — "telefone 55 11 também aplicar se é
    // o WhatsApp ou não". Coluna nova (telefone_whatsapp, migration
    // 20260926190000); três estados, nunca inferido sozinho.
    chave: "telefone_whatsapp",
    rotulo: "É WhatsApp?",
    tipo: "select",
    opcoes: [
      { valor: "true", rotulo: "Sim" },
      { valor: "false", rotulo: "Não" },
    ],
  },
  {
    chave: "sexo",
    rotulo: "Sexo",
    tipo: "select",
    opcoes: [
      { valor: "feminino", rotulo: "Feminino" },
      { valor: "masculino", rotulo: "Masculino" },
      { valor: "nao_informado", rotulo: "Não informado" },
    ],
  },
  { chave: "nacionalidade", rotulo: "Nacionalidade" },
  { chave: "profissao", rotulo: "Profissão" },
  { chave: "data_nascimento", rotulo: "Data de nascimento", tipo: "data" },
  { chave: "cpf", rotulo: "CPF", mascara: formatarCpf },
  { chave: "rg_numero", rotulo: "RG — número" },
  { chave: "rg_orgao_uf", rotulo: "RG — órgão/UF" },
  {
    chave: "estado_civil",
    rotulo: "Estado civil",
    tipo: "select",
    opcoes: [
      { valor: "solteiro", rotulo: "Solteiro(a)" },
      { valor: "casado", rotulo: "Casado(a)" },
      { valor: "divorciado", rotulo: "Divorciado(a)" },
      { valor: "viuvo", rotulo: "Viúvo(a)" },
      { valor: "uniao_estavel", rotulo: "União estável" },
    ],
  },
  { chave: "nome_conjuge", rotulo: "Nome do cônjuge" },
  { chave: "nome_pai", rotulo: "Nome do pai" },
  { chave: "nome_mae", rotulo: "Nome da mãe" },
  { chave: "cidade_nascimento", rotulo: "Cidade de nascimento" },
  { chave: "endereco_logradouro", rotulo: "Endereço — logradouro" },
  { chave: "endereco_numero", rotulo: "Endereço — número" },
  { chave: "endereco_complemento", rotulo: "Endereço — complemento" },
  { chave: "endereco_bairro", rotulo: "Endereço — bairro" },
  { chave: "endereco_cidade", rotulo: "Endereço — cidade" },
  {
    chave: "endereco_uf",
    rotulo: "Endereço — UF",
    tipo: "select",
    opcoes: UFS.map((uf) => ({ valor: uf, rotulo: uf })),
  },
  { chave: "endereco_cep", rotulo: "Endereço — CEP", mascara: formatarCep },
  { chave: "endereco_pais", rotulo: "Endereço — país" },
];

type CamposPessoa = {
  nome: string | null;
  nome_social: string | null;
  email: string | null;
  telefone: string | null;
  // UI-only: representa o boolean real (clientes.telefone_whatsapp) como
  // "true"/"false"/"" no <select> genérico; convertido de volta antes de
  // gravar (ver salvarComValidacao).
  telefone_whatsapp: string | null;
  sexo: string | null;
  nacionalidade: string | null;
  profissao: string | null;
  cpf: string | null;
  rg_numero: string | null;
  rg_orgao_uf: string | null;
  endereco_logradouro: string | null;
  endereco_numero: string | null;
  endereco_complemento: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_uf: string | null;
  endereco_cep: string | null;
  endereco_pais: string | null;
  estado_civil: string | null;
  nome_conjuge: string | null;
  data_nascimento: string | null;
  nome_pai: string | null;
  nome_mae: string | null;
  cidade_nascimento: string | null;
};

function Pessoa() {
  const { clienteId } = Route.useParams();
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca campo ou botão desabilitado.
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua.";
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_pessoas_dependentes_representacao" });
  const qc = useQueryClient();
  const carregar = useServerFn(carregarPessoa);
  const salvar = useServerFn(atualizarPessoa);
  const vincularLead = useServerFn(salvarLeadDesk);
  const q = useQuery({
    queryKey: ["pessoa", clienteId],
    queryFn: () => carregar({ data: { clienteId } }),
  });

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Partial<CamposPessoa>>({});
  /*
   * F5/sair da linha (09/10/2026) — o mesmo padrão já provado em
   * casos.$caseId.index.tsx, generalizado. Pessoa 360 tinha ZERO proteção:
   * recarregar ou trocar de rota com edição pendente perdia o rascunho em
   * silêncio.
   */
  useAvisoEdicaoNaoSalva(Object.keys(form).length > 0);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  // CA03-PESSOA-UNICA-VINCULOS (09/09/2026): confirmação humana do vínculo
  // lead → pessoa. Nunca funde por nome sozinho — só grava quando alguém
  // escolhe explicitamente a qual caso desta pessoa o lead pertence.
  const [casoEscolhido, setCasoEscolhido] = useState<Record<string, string>>({});
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [decisaoAposSalvar, setDecisaoAposSalvar] = useState(false);
  const [buscaDossie, setBuscaDossie] = useState("");

  // CA-VALIDACAO-CPF-CEP (21/09/2026): a máscara já existia, mas nunca havia
  // checagem de dígito/tamanho antes de gravar — dava para salvar um CPF ou
  // CEP com o formato certo e o conteúdo errado. Reusa `cpfValido`/`cepValido`
  // (validacao-pessoa.ts), já existentes e sem uso até agora. Campo vazio
  // continua permitido (o dado é opcional); só bloqueia valor preenchido e
  // inválido.
  // P31 (26/09/2026): "aplique e unifique... revise mais uma vez" — CPF/CEP
  // já validavam antes de gravar; e-mail, telefone e UF do órgão emissor do
  // RG tinham máscara/select mas nunca checagem de conteúdo. Mesmo padrão:
  // campo vazio continua permitido; só bloqueia valor preenchido e inválido.
  const salvarComValidacao = () => {
    if (form.cpf && form.cpf.trim() && !cpfValido(form.cpf)) {
      setErroSalvar("CPF inválido — confira os números digitados.");
      return;
    }
    if (form.endereco_cep && form.endereco_cep.trim() && !cepValido(form.endereco_cep)) {
      setErroSalvar("CEP inválido — precisa ter 8 dígitos.");
      return;
    }
    if (form.email && form.email.trim() && !emailValido(form.email)) {
      setErroSalvar("E-mail inválido — confira o endereço digitado.");
      return;
    }
    if (form.telefone && form.telefone.trim() && !telefoneValido(form.telefone)) {
      setErroSalvar("Telefone inválido — confira o DDD e o número digitados.");
      return;
    }
    if (form.rg_orgao_uf && form.rg_orgao_uf.trim() && !rgOrgaoUfValido(form.rg_orgao_uf)) {
      setErroSalvar("UF do órgão emissor do RG inválida — confira a sigla do estado.");
      return;
    }
    // telefone_whatsapp é boolean no banco; o <select> genérico só trabalha
    // com string — converte aqui, no único ponto de saída do formulário.
    const payload: Record<string, unknown> = { ...form };
    if ("telefone_whatsapp" in payload) {
      payload.telefone_whatsapp = payload.telefone_whatsapp === "true" ? true : payload.telefone_whatsapp === "false" ? false : null;
    }
    mSalvar.mutate(payload as Partial<CamposPessoa>);
  };

  const mSalvar = useMutation({
    mutationFn: (campos: Partial<CamposPessoa>) => salvar({ data: { clienteId, campos } }),
    onSuccess: () => {
      setErroSalvar(null);
      setEditando(false);
      setDecisaoAposSalvar(true);
      void qc.invalidateQueries({ queryKey: ["pessoa", clienteId] });
    },
    onError: (e: Error) => setErroSalvar(e.message),
  });

  const mVincular = useMutation({
    mutationFn: (v: { leadId: string; caseId: string }) =>
      vincularLead({ data: { id: v.leadId, valores: { case_id: v.caseId } } }),
    onSuccess: (r: any) => {
      if (r?.ok === false) {
        setErroVinculo(r.erros?.map((e: any) => e.motivo).join(" · ") ?? "Vínculo não aceito.");
        return;
      }
      setErroVinculo(null);
      void qc.invalidateQueries({ queryKey: ["pessoa", clienteId] });
    },
    onError: (e: Error) => setErroVinculo(e.message),
  });

  if (q.isLoading) {
    return (
      <SaasShell titulo="Pessoa" descricao="Carregando…">
        <p className="text-sm text-navy/55">Lendo a história desta pessoa.</p>
      </SaasShell>
    );
  }

  if (q.isError) {
    return (
      <SaasShell titulo="Pessoa" descricao="Erro ao carregar">
        <p className="text-sm text-terracotta">
          {q.error instanceof Error ? q.error.message : "Não foi possível carregar esta pessoa."}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="mt-3 rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
        >
          Tentar novamente
        </button>
      </SaasShell>
    );
  }

  if (!q.data?.encontrada) {
    return (
      <SaasShell titulo="Pessoa" descricao="Não encontrada">
        <p className="text-sm text-navy/70">
          Não encontrei esta pessoa na carteira desta organização.
        </p>
        <Link
          to="/clientes"
          className="mt-3 inline-block text-sm text-navy underline underline-offset-4"
        >
          Voltar para clientes
        </Link>
      </SaasShell>
    );
  }

  const {
    cliente,
    casos,
    eventos,
    leads,
    nucleoMembros,
    propostas,
    contratos,
    contractParties,
    documentos,
    projecoesPublicadas,
    perfisGenealogicos,
    fichaGenealogica,
    fichaGenealogicaEquipe,
    caseMembers,
    achadosPesquisa,
    materiaisDossie,
    nucleos,
    contatos,
    consentimentos,
  } = q.data;

  // R2 — mesma regra do servidor (estadoCpfMembroCaso); só sinaliza, nunca grava aqui.
  const sinalCpf = sinalCpfDaPessoaPorCaso(caseMembers, cliente.id as string, (cliente.cpf as string | null) ?? null);
  // P28 (26/09/2026): mesmo sinal do CPF, agora também para telefone
  // (mascaras-e-validadores.md §3.2 — "Consolidar em Pessoa").
  const sinalTelefone = sinalTelefoneDaPessoaPorCaso(
    caseMembers,
    cliente.id as string,
    (cliente.telefone as string | null) ?? null,
  );
  // P31 (26/09/2026): mesmo sinal do CPF/telefone, agora também para CEP —
  // pedido direto da Proprietária para não conferir o mesmo dado 3 vezes.
  const sinalCep = sinalCepDaPessoaPorCaso(
    caseMembers,
    cliente.id as string,
    (cliente.endereco_cep as string | null) ?? null,
  );
  // P32 (26/09/2026) — mesmo sinal do CPF/telefone/CEP, agora para os 6
  // campos civis (e-mail, RG, nacionalidade, data de nascimento, profissão,
  // estado civil) que a auditoria confirmou duplicados sem reconciliação.
  const sinaisCivis = CAMPOS_CIVIS_RECONCILIAVEIS.map((campo) => ({
    campo,
    rotulo: ROTULO_CAMPO_CIVIL[campo],
    sinal: sinalCampoCivilDaPessoaPorCaso(
      campo,
      caseMembers,
      cliente.id as string,
      (cliente[COLUNA_CLIENTE_CIVIL[campo]] as string | null) ?? null,
    ),
  }));

  const linha = montarLinhaDoTempoDaPessoa(
    casos.map((c) => ({
      casoCodigo: c.codigo ?? null,
      casoTitulo: c.titulo ?? null,
      eventos: eventos.filter((e) => e.case_id === c.id),
    })),
  );

  /*
    §15 do De-Para (Pessoa 360, zona "Relações"): tipo de vínculo e grau de
    confirmação. `case_members.pai_id/mae_id` (migration 20260816201830) já
    grava isso — o motor aprovado, não pesquisa genealógica — e
    `relacoesAprovadas`/`estadoDeConfirmacao` (golive-pessoas.ts) já sabem
    calcular a partir daí; só nunca tinham sido chamadas por esta rota.
  */
  const membrosDosCasos = caseMembers.map((m) => ({
    id: String(m.id),
    nome: (m.nome as string) ?? "Pessoa sem nome registrado",
    paiId: m.pai_id ? String(m.pai_id) : null,
    maeId: m.mae_id ? String(m.mae_id) : null,
    titular: m.titular === true,
    requerente: m.requerente === true,
    contratante: m.contratante === true,
    verificadoEm: (m.data_verificacao_dado as string) ?? null,
    statusCadastral: (m.status_cadastral as string) ?? null,
  }));
  const nomeComparavel = (cliente.nome_social || cliente.nome || "").trim().toLowerCase();
  const relacoesFamiliaresDestaPessoa = relacoesAprovadas(membrosDosCasos).filter(
    (r) => r.de.trim().toLowerCase() === nomeComparavel || r.para.trim().toLowerCase() === nomeComparavel,
  );
  const meusRegistrosDeCaso = caseMembers.filter((m) => m.cliente_id === cliente.id);
  const grausDeConfirmacao = meusRegistrosDeCaso.map((m) => ({
    casoId: m.case_id as string,
    estado: estadoDeConfirmacao({
      verificadoEm: (m.data_verificacao_dado as string) ?? null,
      statusCadastral: (m.status_cadastral as string) ?? null,
      paiId: m.pai_id ? String(m.pai_id) : null,
      maeId: m.mae_id ? String(m.mae_id) : null,
    }),
  }));

  // Leads que podem ser esta mesma pessoa, com a evidência à vista.
  const candidatos = leads
    .map((l) => ({ lead: l, evidencia: evidenciaDeMesmaPessoa(l, cliente) }))
    .filter((x): x is { lead: typeof x.lead; evidencia: EvidenciaDeElo } => x.evidencia !== null)
    .sort((a, b) => ordemDaForca(a.evidencia.forca) - ordemDaForca(b.evidencia.forca));

  // §15 do De-Para (Pessoa 360, linha Sinais): duplicidade, conflito, lacuna
  // documental, consentimento — cada sinal com prioridade e ação recomendada.
  // Duplicidades vêm de `candidatos` (evidência já calculada acima); os outros
  // três tipos saem da própria pessoa/leads/casos, sem nova query.
  const sinais = ordenarPorPrioridade(
    sinaisDaPessoa({
      cliente: {
        id: cliente.id ? String(cliente.id) : null,
        nome: cliente.nome as string | null | undefined,
        cpf: cliente.cpf as string | null | undefined,
        email: cliente.email as string | null | undefined,
        telefone: cliente.telefone as string | null | undefined,
        data_nascimento: cliente.data_nascimento as string | null | undefined,
        // Corte U3: o que o contrato precisa e só a Pessoa 360 guarda.
        rg_numero: (cliente.rg_numero as string | null | undefined) ?? null,
        nome_mae: (cliente.nome_mae as string | null | undefined) ?? null,
        nome_pai: (cliente.nome_pai as string | null | undefined) ?? null,
        profissao: (cliente.profissao as string | null | undefined) ?? null,
        estado_civil: (cliente.estado_civil as string | null | undefined) ?? null,
        endereco_logradouro: (cliente.endereco_logradouro as string | null | undefined) ?? null,
        endereco_cidade: (cliente.endereco_cidade as string | null | undefined) ?? null,
        endereco_cep: (cliente.endereco_cep as string | null | undefined) ?? null,
      },
      leads: leads.map((l) => ({
        id: l.id ? String(l.id) : null,
        nome: l.nome as string | null | undefined,
        cliente_id: (l as { cliente_id?: string | null }).cliente_id ?? null,
        consentimento_status: (l as { consentimento_status?: string | null }).consentimento_status ?? null,
      })),
      casos: casos.map((c) => ({
        id: c.id ? String(c.id) : null,
        status: (c as { status?: string | null }).status ?? null,
        ativo: c.ativo ?? null,
      })),
      possiveisDuplicidades: candidatos.map((c) => ({
        id: String(c.lead.id),
        nome: (c.lead.nome as string | null) ?? "Sem nome",
        motivo: FORCA_ROTULO[c.evidencia.forca],
      })),
    }),
  );

  const nome = (cliente.nome_social || cliente.nome || "Sem nome").trim();

  return (
    <SaasShell titulo={nome} descricao="A história desta pessoa, reunida de todos os casos dela." visualKit="pantone">
      <div className="space-y-6">
        {/*
          13/10/2026 — Prancha V4: a Pessoa 360 abre com a composição da
          prancha (identidade, parentesco, casos, fontes, localização,
          confiança, completude e rede), lida do que esta rota já carrega.
          A ficha completa (edição, comercial, consentimentos, sinais,
          núcleo, propostas, publicação) continua inteira logo abaixo.
        */}
        <ComposicaoPessoa360V4
          nome={nome}
          dados={{ cliente, casos, caseMembers, documentos }}
          duplicidadesAbertas={candidatos.length}
        />

        <details className="rounded-xl border border-navy/10 bg-card p-4" open={editando || undefined} data-pessoa360-ficha-completa>
          <summary className="cursor-pointer font-serif text-base text-navy">
            Ficha completa: edição, comercial, consentimentos, sinais e históricos
          </summary>
          <div className="mt-4 space-y-6 border-t border-navy/10 pt-4">
        <NucleoKitPessoa clienteId={String(cliente.id)} />

        <CaCard
          titulo="Quem é"
          acao={
            editando ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={mSalvar.isPending}
                  onClick={salvarComValidacao}
                  className="rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
                >
                  {mSalvar.isPending ? "Salvando…" : "Salvar"}
                </button>
                {!podeEscrever ? (
                  <span className="self-center text-[11px] text-navy/50">
                    Pendência registrada: {pendenciaVinculo}
                  </span>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setForm({
                    nome: cliente.nome ?? "",
                    nome_social: cliente.nome_social ?? "",
                    email: cliente.email ?? "",
                    telefone: cliente.telefone ?? "",
                    telefone_whatsapp:
                      cliente.telefone_whatsapp === true ? "true" : cliente.telefone_whatsapp === false ? "false" : "",
                    sexo: cliente.sexo ?? "",
                    nacionalidade: cliente.nacionalidade ?? "",
                    profissao: cliente.profissao ?? "",
                    cpf: cliente.cpf ?? "",
                    rg_numero: cliente.rg_numero ?? "",
                    rg_orgao_uf: cliente.rg_orgao_uf ?? "",
                    endereco_logradouro: cliente.endereco_logradouro ?? "",
                    endereco_numero: cliente.endereco_numero ?? "",
                    endereco_complemento: cliente.endereco_complemento ?? "",
                    endereco_bairro: cliente.endereco_bairro ?? "",
                    endereco_cidade: cliente.endereco_cidade ?? "",
                    endereco_uf: cliente.endereco_uf ?? "",
                    endereco_cep: cliente.endereco_cep ?? "",
                    endereco_pais: cliente.endereco_pais ?? "",
                    estado_civil: cliente.estado_civil ?? "",
                    nome_conjuge: cliente.nome_conjuge ?? "",
                    data_nascimento: cliente.data_nascimento ? String(cliente.data_nascimento).slice(0, 10) : "",
                    nome_pai: cliente.nome_pai ?? "",
                    nome_mae: cliente.nome_mae ?? "",
                    cidade_nascimento: cliente.cidade_nascimento ?? "",
                  });
                  setErroSalvar(null);
                  setEditando(true);
                }}
                className="rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs text-navy hover:bg-gold/20"
              >
                Editar
              </button>
            )
          }
        >
          {erroSalvar ? (
            <p className="mt-2 rounded-md border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
              {erroSalvar}
            </p>
          ) : null}

          {decisaoAposSalvar ? (
            <DecisaoAposSalvarPessoa
              nomePessoa={nome}
              casos={casos.map((c) => ({ id: c.id, codigo: c.codigo, titulo: c.titulo }))}
              onFechou={() => setDecisaoAposSalvar(false)}
            />
          ) : null}

          {editando ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPOS_FORM.map((c) =>
                c.tipo === "select" ? (
                  <label key={c.chave} className="block text-xs text-navy/60">
                    {c.rotulo}
                    <select
                      className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1.5 text-sm text-navy"
                      value={form[c.chave] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [c.chave]: e.target.value }))}
                    >
                      <option value="">—</option>
                      {c.opcoes?.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={c.chave} className="block text-xs text-navy/60">
                    {c.rotulo}
                    <input
                      type={c.tipo === "data" ? "date" : "text"}
                      className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1.5 text-sm text-navy"
                      value={form[c.chave] ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          [c.chave]: c.mascara ? c.mascara(e.target.value) : e.target.value,
                        }))
                      }
                    />
                  </label>
                ),
              )}
            </div>
          ) : (
            <>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Campo rotulo="E-mail" valor={cliente.email?.trim()} />
                {/* P29 (26/09/2026): leitura mostrava telefone/CPF cru — a máscara só era
                    aplicada no modo Editar. mascaras-e-validadores.md exige que a máscara
                    se reutilize também na exibição, não só na digitação. */}
                <Campo rotulo="Telefone" valor={cliente.telefone ? formatarTelefone(String(cliente.telefone)) : cliente.telefone} />
                <Campo
                  rotulo="É WhatsApp?"
                  valor={cliente.telefone_whatsapp === true ? "Sim" : cliente.telefone_whatsapp === false ? "Não" : null}
                />
                <Campo rotulo="Como entrou" valor={cliente.origem} />
                <Campo rotulo="Na carteira desde" valor={formatarDia(cliente.created_at)} />
              </dl>

              {/*
                Pessoa Canônica (dados civis) — os campos já existem no schema
                real (sexo, nacionalidade, CPF, RG, endereço estruturado, estado
                civil, filiação, procurador) desde uma rodada anterior. Editar
                aqui grava na mesma fonte, via atualizarPessoa (05/09/2026) —
                antes desta data não existia nenhuma tela para editar esses
                campos em toda a aplicação.
              */}
              <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-navy/50">
                Dados civis
              </h3>
              <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Campo rotulo="Sexo" valor={cliente.sexo} />
                <Campo rotulo="Nacionalidade" valor={cliente.nacionalidade} />
                <Campo rotulo="Profissão" valor={cliente.profissao} />
                <Campo rotulo="Data de nascimento" valor={formatarDia(cliente.data_nascimento)} />
                <Campo
                  rotulo="CPF"
                  valor={cliente.cpf ? <CpfMascarado cpf={String(cliente.cpf)} /> : null}
                />
                <Campo
                  rotulo="RG"
                  valor={
                    cliente.rg_numero
                      ? `${cliente.rg_numero}${cliente.rg_orgao_uf ? ` (${cliente.rg_orgao_uf})` : ""}`
                      : null
                  }
                />
                <Campo rotulo="Estado civil" valor={cliente.estado_civil} />
                <Campo rotulo="Cônjuge" valor={cliente.nome_conjuge} />
                <Campo rotulo="Nome do pai" valor={cliente.nome_pai} />
                <Campo rotulo="Nome da mãe" valor={cliente.nome_mae} />
                <Campo rotulo="Cidade de nascimento" valor={cliente.cidade_nascimento} />
              </dl>

              {cliente.endereco_logradouro || cliente.endereco_cidade ? (
                <>
                  <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-navy/50">
                    Endereço
                  </h3>
                  <p className="mt-2 text-sm text-navy/80">
                    {[
                      [cliente.endereco_logradouro, cliente.endereco_numero]
                        .filter(Boolean)
                        .join(", "),
                      cliente.endereco_complemento,
                      cliente.endereco_bairro,
                      [cliente.endereco_cidade, cliente.endereco_uf].filter(Boolean).join(" - "),
                      cliente.endereco_cep ? formatarCep(String(cliente.endereco_cep)) : cliente.endereco_cep,
                      cliente.endereco_pais,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </>
              ) : null}
            </>
          )}

          {!editando && cliente.procurador_cliente_id ? (
            <p className="mt-3 text-xs text-navy/60">
              Representada por procurador(a) —{" "}
              <Link
                to="/pessoas/$clienteId"
                params={{ clienteId: cliente.procurador_cliente_id }}
                className="text-navy underline underline-offset-4"
              >
                ver perfil
              </Link>
              {cliente.procurador_escopo ? ` · ${cliente.procurador_escopo}` : ""}
            </p>
          ) : null}
        </CaCard>

        <CaCard titulo="Comercial">
          <p className="text-xs text-navy/55">
            Classificação e status comerciais já existiam em `clientes` sem nenhuma tela — esta
            seção só lê o que já é gravado por outras rotas (Mesa Discovery, conversão de lead,
            ativação de cliente); não duplica CRM Vivo nem cria um segundo controle.
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Campo
              rotulo="Classificação"
              valor={
                cliente.classificacao
                  ? (ROTULO_CLASSIFICACAO[String(cliente.classificacao)] ?? String(cliente.classificacao))
                  : null
              }
            />
            <Campo
              rotulo="Status comercial"
              valor={
                cliente.status_comercial
                  ? (ROTULO_STATUS_COMERCIAL[String(cliente.status_comercial)] ?? String(cliente.status_comercial))
                  : null
              }
            />
            <Campo rotulo="Como entrou" valor={cliente.origem} />
            <Campo rotulo="Origem do dado" valor={cliente.data_origin} />
            {/* Corte A (27/09/2026): lead_id — rastreabilidade até o lead de
                origem, gravado só na criação pelo handoff Discovery. */}
            <Campo
              rotulo="Lead de origem"
              valor={cliente.lead_id ? `Vinculado (#${String(cliente.lead_id).slice(0, 8)})` : "Sem lead de origem registrado"}
            />
            <Campo rotulo="Ativação decidida em" valor={formatarDia(cliente.ativacao_decidida_em)} />
            <Campo rotulo="Justificativa da ativação" valor={cliente.ativacao_justificativa} />
          </dl>
        </CaCard>

        <CaCard
          titulo="Consentimentos"
          acao={<p className="text-xs text-navy/55">{consentimentos.length} registro(s)</p>}
        >
          <p className="text-xs text-navy/55">
            LGPD — `consent_records`, por pessoa (`client_id`), já reaproveitado do mesmo escritor
            genérico que Caso 360 usa. Nunca infere consentimento; só mostra o que já foi coletado
            ou revogado.
          </p>
          {consentimentos.length === 0 ? (
            <div className="mt-3">
              <EstadoVazio mensagem="Nenhum consentimento registrado para esta pessoa ainda." />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {consentimentos.map((c: Record<string, unknown>) => (
                <li
                  key={String(c.id)}
                  className={`rounded-lg border p-2 text-xs ${ESTILO_STATUS_CONSENTIMENTO[String(c.status)] ?? "border-navy/15 bg-white/60 text-navy/80"}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-navy">
                      {ROTULO_TIPO_CONSENTIMENTO[String(c.tipo_consentimento)] ?? String(c.tipo_consentimento)}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide">
                      {ROTULO_STATUS_CONSENTIMENTO[String(c.status)] ?? String(c.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-navy/70">
                    {c.escopo_compartilhamento ? `Escopo: ${c.escopo_compartilhamento} · ` : ""}
                    {c.coletado_em ? `Coletado em ${formatarDia(c.coletado_em as string)}` : "Sem data de coleta"}
                    {c.metodo_coleta ? ` · ${c.metodo_coleta}` : ""}
                  </p>
                  {c.status === "revogado" && c.revogado_em ? (
                    <p className="mt-1 text-terracotta">
                      Revogado em {formatarDia(c.revogado_em as string)}
                      {c.revogacao_motivo ? ` — ${c.revogacao_motivo}` : ""}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        <CaCard
          titulo="Sinais"
          data-pessoa360-sinais
          acao={
            <p className="text-xs text-navy/55">
              {sinais.length === 0 ? "Nenhum sinal aberto" : `${sinais.length} sinal(is)`}
            </p>
          }
        >
          <p className="text-xs text-navy/55">
            Duplicidade, conflito, lacuna documental e consentimento — cada um com prioridade
            e ação recomendada. Nada aqui funde pessoa sozinho.
          </p>
          {sinais.length === 0 ? (
            <div className="mt-3">
              <EstadoVazio mensagem="Nenhum sinal aberto para esta pessoa. Dado canônico completo, sem duplicidade ou conflito detectado." />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {sinais.map((s, idx) => (
                <li
                  key={`${s.tipo}-${idx}`}
                  data-pessoa360-sinal-prioridade={s.prioridade}
                  className={
                    "flex flex-col gap-1 rounded-lg border-l-4 bg-white/60 p-3 text-sm " +
                    CLASSE_PRIORIDADE[s.prioridade]
                  }
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-navy">{s.titulo}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-navy/60">
                      {ROTULO_PRIORIDADE[s.prioridade]}
                    </span>
                  </div>
                  <p className="text-xs text-navy/70">{s.detalhe}</p>
                  <p className="text-xs font-medium text-navy">→ {s.acaoRecomendada}</p>
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        <CaCard titulo="Casos" acao={<p className="text-xs text-navy/55">{casos.length} caso(s)</p>}>
          <p className="text-xs text-navy/55">
            Próxima ação vem do mesmo planejador da ficha do caso (RPC). Responsável padrão da operação:{" "}
            {NOME_RESPONSAVEL_PADRAO}.
          </p>
          {casos.length === 0 ? (
            <div className="mt-2">
              <EstadoVazio mensagem="Nenhum caso aberto para esta pessoa." />
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {casos.map((c) => {
                const rpc = c.proximaAcaoCanonica ?? null;
                const canonica = obterProximaAcaoCanonica({
                  caseId: String(c.id),
                  rpc: rpc
                    ? {
                        nivel: rpc.nivel,
                        motivo: rpc.motivo,
                        origem_tabela: null,
                        origem_id: null,
                        prazo: rpc.prazo,
                      }
                    : null,
                  responsavelPrincipal:
                    (c.proxima_acao_responsavel as string) ||
                    (c.responsavel_principal as string) ||
                    null,
                  dependencia: null,
                  criterioConclusao: null,
                });
                return (
                  <li
                    key={c.id}
                    className="flex flex-col rounded-lg border border-navy/12 bg-cream/25 p-3 transition-colors hover:bg-cream/50"
                  >
                    <Link to="/casos/$caseId" params={{ caseId: c.id }} className="block">
                      {/*
                        Varredura de demonstração (04/10/2026): os casos aqui
                        são os DESTA pessoa, não um seletor global — esconder
                        sumiria com o caso real de quem também tem um de
                        demonstração. O tratamento é o selo, como o módulo de
                        fixtures manda para registro aberto internamente.
                      */}
                      <p className="font-mono text-[11px] text-navy/60">
                        {c.codigo}
                        {ehFixtureLinha(c as never) ? (
                          <span className="ml-2 rounded border border-gold/50 bg-gold/10 px-1 py-0.5 text-[9px] uppercase tracking-wide text-navy/70">
                            {ROTULO_DEMONSTRACAO}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm font-medium text-navy">{c.titulo}</p>
                      <p className="mt-1 text-xs text-navy/55">
                        {[
                          rotuloFase(c.fase as string | null),
                          c.pais,
                          c.data_entrada ? `desde ${formatarDia(c.data_entrada)}` : null,
                          c.ativo ? "ativo" : "em ativação",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </Link>
                    <dl className="mt-3 space-y-1 border-t border-navy/10 pt-2 text-xs text-navy/75">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-navy/45">Próxima ação</dt>
                        <dd className="font-medium text-navy">{canonica.acao}</dd>
                        <dd>
                          {SELO_PROXIMA_ACAO[canonica.origem]} · Responsável:{" "}
                          {canonica.responsavel || NOME_RESPONSAVEL_PADRAO}
                        </dd>
                        <dd>
                          Prazo:{" "}
                          {canonica.prazo
                            ? new Date(String(canonica.prazo)).toLocaleDateString("pt-BR")
                            : c.prazo_proxima_acao
                              ? formatarDia(c.prazo_proxima_acao)
                              : "—"}
                        </dd>
                      </div>
                      {c.eixo_formalizacao ? (
                        <div data-pessoa360-onboarding>
                          <dt className="text-[10px] uppercase tracking-wide text-navy/45">Onboarding</dt>
                          <dd className="font-medium text-navy">
                            {EIXO_FORMALIZACAO.find((o) => o.valor === c.eixo_formalizacao)?.rotulo ?? String(c.eixo_formalizacao)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                    {sinalCpf[c.id] ? (
                      <p
                        data-pessoa360-sinal-cpf
                        className="mt-2 rounded-md border border-terracotta/30 bg-terracotta/5 px-2 py-1 text-[11px] text-navy/80"
                      >
                        {sinalCpf[c.id].conflito > 0
                          ? `CPF deste registro no caso diverge do cadastro da pessoa (${sinalCpf[c.id].conflito}).`
                          : `CPF deste registro no caso ainda vazio (${sinalCpf[c.id].preencher}).`}{" "}
                        <Link
                          to="/casos/$caseId"
                          params={{ caseId: c.id }}
                          hash="pessoas"
                          className="font-medium text-navy underline underline-offset-4"
                        >
                          Conferir
                        </Link>
                      </p>
                    ) : null}
                    {sinalTelefone[c.id] ? (
                      <p
                        data-pessoa360-sinal-telefone
                        className="mt-2 rounded-md border border-terracotta/30 bg-terracotta/5 px-2 py-1 text-[11px] text-navy/80"
                      >
                        {sinalTelefone[c.id].conflito > 0
                          ? `Telefone deste registro no caso diverge do cadastro da pessoa (${sinalTelefone[c.id].conflito}).`
                          : `Telefone deste registro no caso ainda vazio (${sinalTelefone[c.id].preencher}).`}{" "}
                        <Link
                          to="/casos/$caseId"
                          params={{ caseId: c.id }}
                          hash="pessoas"
                          className="font-medium text-navy underline underline-offset-4"
                        >
                          Conferir
                        </Link>
                      </p>
                    ) : null}
                    {sinalCep[c.id] ? (
                      <p
                        data-pessoa360-sinal-cep
                        className="mt-2 rounded-md border border-terracotta/30 bg-terracotta/5 px-2 py-1 text-[11px] text-navy/80"
                      >
                        {sinalCep[c.id].conflito > 0
                          ? `CEP deste registro no caso diverge do cadastro da pessoa (${sinalCep[c.id].conflito}).`
                          : `CEP deste registro no caso ainda vazio (${sinalCep[c.id].preencher}).`}{" "}
                        <Link
                          to="/casos/$caseId"
                          params={{ caseId: c.id }}
                          hash="pessoas"
                          className="font-medium text-navy underline underline-offset-4"
                        >
                          Conferir
                        </Link>
                      </p>
                    ) : null}
                    {(() => {
                      const pendentes = sinaisCivis.filter((s) => s.sinal[c.id]);
                      if (pendentes.length === 0) return null;
                      return (
                        <p
                          data-pessoa360-sinal-civil
                          className="mt-2 rounded-md border border-terracotta/30 bg-terracotta/5 px-2 py-1 text-[11px] text-navy/80"
                        >
                          {pendentes
                            .map((s) =>
                              s.sinal[c.id].conflito > 0
                                ? `${s.rotulo} diverge do cadastro da pessoa`
                                : `${s.rotulo} ainda vazio no caso`,
                            )
                            .join(" · ")}{" "}
                          <Link
                            to="/casos/$caseId"
                            params={{ caseId: c.id }}
                            hash="pessoas"
                            className="font-medium text-navy underline underline-offset-4"
                          >
                            Conferir
                          </Link>
                        </p>
                      );
                    })()}
                    <ExperienciaNoApp caseId={c.id} />
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
                      <Link
                        to="/casos/$caseId"
                        params={{ caseId: c.id }}
                        className="text-navy underline underline-offset-4"
                      >
                        Abrir Caso 360
                      </Link>
                      <Link
                        to="/casos/$caseId/contrato/preparar"
                        params={{ caseId: c.id }}
                        className="text-navy underline underline-offset-4"
                      >
                        Formalização
                      </Link>
                      <Link
                        to="/casos/$caseId"
                        params={{ caseId: c.id }}
                        hash="jornada"
                        className="text-navy underline underline-offset-4"
                      >
                        Jornada
                      </Link>
                      <Link
                        to="/app-cliente-como-pessoa"
                        search={{ casoId: c.id }}
                        className="text-navy underline underline-offset-4"
                      >
                        Abrir Visão Administrativa do Cliente
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
                  {/* Corte U3 (28/09/2026): decisões humanas pendentes de cada caso da pessoa (só leitura). */}
          {casos.length > 0 ? (
            <div className="mt-3 space-y-2">
              {casos.map((c) => (
                <PendenciasHumanasCaso
                  key={`pend-${c.id}`}
                  caseId={String(c.id)}
                  titulo={`Decisões pendentes — ${c.codigo ?? c.titulo ?? "caso"}`}
                />
              ))}
            </div>
          ) : null}
        </CaCard>

        <CaCard
          titulo="Núcleo familiar e papéis"
          acao={<p className="text-xs text-navy/55">{nucleoMembros.length} vínculo(s)</p>}
        >
          {nucleoMembros.length === 0 ? (
            <EstadoVazio mensagem="Esta pessoa não está vinculada a nenhum núcleo familiar." />
          ) : (
            <ul className="space-y-2">
              {nucleoMembros.map((m) => {
                const nucleo = nucleos.find((n) => n.id === m.nucleo_id) ?? null;
                const dossie = dossieMaeDoCaso(nucleo as { id: string; dossie_mae?: string | null; dossie_status?: string | null } | null);
                return (
                  <li key={m.id} className="rounded-lg border border-navy/12 bg-cream/25 p-3">
                    <p className="text-sm font-medium text-navy">
                      {PAPEIS_PESSOA.find((o) => o.valor === m.papel_no_caso)?.rotulo
                        ?? (m.papel_no_caso || (m.papel === "dependente" ? "Dependente" : "Contratante/signatária"))}
                      {nucleo?.nome ? <span className="font-normal text-navy/60"> · {nucleo.nome}</span> : null}
                    </p>
                    <p className="mt-0.5 text-xs text-navy/60">
                      {m.vinculo}
                      {m.processo ? ` · ${m.processo}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-navy/70" data-pessoa360-dossie-mae>
                      Dossiê-mãe do núcleo:{" "}
                      {dossie.fonte === "nucleo"
                        ? `${dossie.referencia} (${dossie.ativo ? "ativo" : (dossie.status ?? "sem situação")})`
                        : "ainda não cadastrado no núcleo"}{" "}
                      <Link to="/nucleos" className="font-medium text-navy underline underline-offset-4">
                        Abrir em Núcleos
                      </Link>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CaCard>

        <CaCard
          titulo="Vínculos familiares do caso"
          data-relacoes-familiares-caso
          acao={<p className="text-xs text-navy/55">{grausDeConfirmacao.length} registro(s)</p>}
        >
          <p className="text-xs text-navy/55">
            Parentesco gravado em case_members (pai/mãe), nunca deduzido por nome — distinto da pesquisa
            genealógica interna.
          </p>
          {relacoesFamiliaresDestaPessoa.length === 0 ? (
            <div className="mt-2">
              <EstadoVazio mensagem="Nenhum vínculo de pai/mãe gravado para esta pessoa nos casos onde ela participa." />
            </div>
          ) : (
            <ul className="mt-3 space-y-1">
              {relacoesFamiliaresDestaPessoa.map((r) => (
                <li key={r.id} className="text-sm text-navy/80">
                  {r.de} é {r.rotulo} de {r.para}
                </li>
              ))}
            </ul>
          )}
          {grausDeConfirmacao.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-navy/10 pt-2">
              {grausDeConfirmacao.map((g, i) => (
                <li key={i} className="text-xs text-navy/60">
                  Grau de confirmação: <span className="font-medium text-navy">{g.estado}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </CaCard>

        <CaCard titulo="Propostas, contratos e documentos" eyebrow="Status aqui; edição e formalização nas rotas de origem (sem formulário duplicado)">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                Propostas
              </p>
              {propostas.length === 0 ? (
                <p className="mt-1 text-sm text-navy/55">Nenhuma proposta.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {propostas.map((p) => (
                    <li key={p.id} className="text-sm text-navy/80">
                      {p.status}
                      {p.valor ? ` · R$ ${p.valor}` : ""}
                      {p.case_id ? (
                        <>
                          {" · "}
                          <Link
                            to="/casos/$caseId/contrato/preparar"
                            params={{ caseId: String(p.case_id) }}
                            className="text-navy underline underline-offset-2"
                          >
                            preparar contrato
                          </Link>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/propostas" className="mt-2 inline-block text-xs font-medium text-navy underline underline-offset-4">
                Abrir Propostas no Desk
              </Link>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                Contratos
              </p>
              {contratos.length === 0 ? (
                <p className="mt-1 text-sm text-navy/55">Nenhum contrato.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {contratos.map((c) => (
                    <li key={c.id} className="text-sm text-navy/80">
                      {c.case_id ? (
                        <Link
                          to="/contratos/$id"
                          params={{ id: String(c.id) }}
                          className="underline underline-offset-2"
                        >
                          {c.status}
                        </Link>
                      ) : (
                        c.status
                      )}
                      {c.signed_at ? ` · assinado em ${formatarDia(c.signed_at)}` : ""}
                      {c.case_id ? (
                        <>
                          {" · "}
                          <Link
                            to="/casos/$caseId/contrato/preparar"
                            params={{ caseId: String(c.case_id) }}
                            className="underline underline-offset-2"
                          >
                            parâmetros
                          </Link>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {contractParties.length > 0 ? (
                <p className="mt-1 text-[11px] text-navy/50">
                  Parte em {contractParties.length} instrumento(s) (
                  {contractParties
                    .map((p) => p.document_type)
                    .filter(Boolean)
                    .join(", ") || "documento não informado"}
                  )
                </p>
              ) : null}
              <Link to="/contratos" className="mt-2 inline-block text-xs font-medium text-navy underline underline-offset-4">
                Abrir Contratos no Desk
              </Link>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">
                Documentos
              </p>
              {documentos.length === 0 ? (
                <p className="mt-1 text-sm text-navy/55">Nenhum documento vinculado.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {documentos.slice(0, 5).map((d) => (
                    <li key={d.id} className="text-sm text-navy/80">
                      {d.titulo}{" "}
                      {d.liberado_cliente ? (
                        <span className="text-[11px] text-navy/50">· liberado ao cliente</span>
                      ) : null}
                      {d.case_id ? (
                        <>
                          {" · "}
                          <Link
                            to="/casos/$caseId"
                            params={{ caseId: String(d.case_id) }}
                            className="underline underline-offset-2"
                          >
                            caso
                          </Link>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/acessos-portal"
                className="mt-2 inline-block text-xs font-medium text-navy underline underline-offset-4"
              >
                Publicar no App Cliente
              </Link>
            </div>
          </div>
        </CaCard>

        <CaCard
          titulo="Conteúdo publicado para o App Cliente"
          acao={<p className="text-xs text-navy/55">{projecoesPublicadas.length} projeção(ões)</p>}
        >
          {projecoesPublicadas.length === 0 ? (
            <EstadoVazio mensagem="Nada foi publicado para o App Cliente nos casos desta pessoa ainda." />
          ) : (
            <ul className="space-y-2">
              {projecoesPublicadas.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-navy/12 bg-cream/25 p-3 text-sm"
                >
                  <span className="text-navy/85">{p.projection_type}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] ${
                      p.approval_status === "published"
                        ? "bg-gold/15 text-navy"
                        : "bg-navy/8 text-navy/70"
                    }`}
                  >
                    {p.approval_status === "published" ? "Publicado" : p.approval_status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        {/*
          05/09/2026 — achado real reportado pela Proprietária: esta seção só
          olhava genealogical_person_profiles por correspondência de NOME
          (uma tabela quase vazia — 2 linhas de teste em toda a organização).
          A ficha genealógica de verdade — a mesma que /pessoas-linhagens usa,
          com Ana, Adair, Alice e Felipe já cadastrados — vive em
          research_people, ligada pelo caso. Corrigido para o vínculo real.
        */}
        {fichaGenealogica.length > 0 ||
        fichaGenealogicaEquipe.length > 0 ||
        perfisGenealogicos.length > 0 ? (
          <CaCard
            titulo="Pesquisa genealógica interna (restrita ao Desk)"
            className="border-dashed border-navy/20 bg-cream/20"
            acao={
              casos[0] ? (
                <Link
                  to="/pessoas-linhagens/$caseId"
                  params={{ caseId: casos[0].id }}
                  className="text-xs text-navy underline underline-offset-4"
                >
                  Abrir ficha completa
                </Link>
              ) : null
            }
          >
            <p className="text-xs text-navy/55">
              Vínculo pelo caso, não por nome — esta camada nunca é exposta ao App Cliente.
            </p>

            {fichaGenealogica.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {fichaGenealogica.map((p) => (
                  <li key={p.id} className="text-sm text-navy/80">
                    {p.canonical_name || p.preferred_display_name}
                    <span className="text-[11px] text-navy/50">
                      {" "}
                      · {p.identity_status}
                      {p.papel_na_linhagem ? ` · ${p.papel_na_linhagem}` : ""}
                      {p.geracao ? ` · geração ${p.geracao}` : ""}
                      {p.birth_place ? ` · nascido(a) em ${p.birth_place}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-navy/60">
                Esta pessoa não está cadastrada na ficha genealógica do caso ainda.
              </p>
            )}

            {/*
              24/09/2026 — corte C: só perfis VINCULADOS a esta pessoa por
              escolha humana (genealogical_person_profiles.client_id). O
              vínculo e o desvínculo acontecem na ficha genealógica do caso,
              nunca aqui e nunca por fusão automática.
            */}
            {perfisGenealogicos.length > 0 ? (
              <ul
                className="mt-3 space-y-1 border-t border-navy/10 pt-2"
                data-pessoa360-perfil-vinculado
              >
                {perfisGenealogicos.map((p) => (
                  <li key={p.id} className="text-sm text-navy/80">
                    Perfil genealógico vinculado: {p.nome_completo}{" "}
                    <span className="text-[11px] text-navy/50">
                      · {p.status_verificacao}
                      {p.nascimento_data || p.nascimento_localidade
                        ? ` · nasc. ${[formatarDia(p.nascimento_data), p.nascimento_localidade].filter(Boolean).join(" em ")}`
                        : ""}
                      {p.morte_data || p.morte_localidade
                        ? ` · falec. ${[formatarDia(p.morte_data), p.morte_localidade].filter(Boolean).join(" em ")}`
                        : ""}
                    </span>
                    {p.case_id ? (
                      <>
                        {" "}
                        <Link
                          to="/pessoas-linhagens/$caseId"
                          params={{ caseId: String(p.case_id) }}
                          className="text-xs text-navy underline underline-offset-4"
                        >
                          Conferir vínculo
                        </Link>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {fichaGenealogicaEquipe.length > 0 ? (
              <p className="mt-3 text-xs text-navy/55">
                Outros membros na mesma pesquisa:{" "}
                {fichaGenealogicaEquipe
                  .map((p) => p.canonical_name || p.preferred_display_name)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
          </CaCard>
        ) : null}

        {/*
          24/09/2026 — decisão explícita da Proprietária: achados de pesquisa
          (genealogical_findings) passam a aparecer também na ficha da
          pessoa, não só por caso em /achados/$caseId. Mesmo isolamento das
          seções acima — camada de pesquisa, nunca vai ao App Cliente por
          aqui. O vínculo (primary_research_person_id → research_people.id)
          já existia no schema; só faltava esta tela consultá-lo.
        */}
        {achadosPesquisa.length > 0 ? (
          <CaCard
            titulo="Achados de pesquisa"
            className="border-dashed border-navy/20 bg-cream/20"
            acao={
              casos[0] ? (
                <Link
                  to="/achados/$caseId"
                  params={{ caseId: casos[0].id }}
                  className="text-xs text-navy underline underline-offset-4"
                >
                  Abrir achados do caso
                </Link>
              ) : null
            }
          >
            <p className="text-xs text-navy/55">
              Vínculo pela ficha genealógica desta pessoa — esta camada nunca é exposta ao App
              Cliente aqui.
            </p>
            <ul className="mt-3 space-y-2">
              {achadosPesquisa.map((a) => (
                <li key={a.id} className="rounded-lg border border-navy/10 bg-white/40 p-2">
                  <p className="text-sm font-medium text-navy/85">{a.title}</p>
                  <p className="text-[11px] text-navy/50">
                    {rotulo(TIPOS_ACHADO, a.finding_type)} · relevância{" "}
                    {rotulo(RELEVANCIAS, a.relevance)} · {rotulo(STATUS_VALIDACAO, a.validation_status)}
                  </p>
                  {a.internal_summary ? (
                    <p className="mt-1 text-xs text-navy/65">{a.internal_summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </CaCard>
        ) : null}

        {/*
          24/09/2026 — Inventário documental da pessoa: leitura agregada de
          case_source_documents já catalogados para esta pessoa (nunca
          Drive/Dropbox), cronológica, com busca por palavra-chave e lacunas
          ditas. Não é o Dossiê-mãe — esse é do núcleo familiar (decisão da
          Proprietária); aqui nada é confirmado nem publicado sozinho.
        */}
        <CaCard titulo="Inventário documental da pessoa" className="border-dashed border-navy/20 bg-cream/20">
          <p className="text-xs text-navy/55">
            O que já está catalogado para esta pessoa (nunca busca fonte externa) — a decisão de
            usar cada material continua humana.
          </p>
          {(() => {
            const inventario = inventarioDocumentalDaPessoa(materiaisDossie);
            const filtro = buscaDossie.trim().toLowerCase();
            const itensFiltrados = filtro
              ? inventario.itens.filter((i) =>
                  [i.titulo, rotulo(TIPOS_DOCUMENTO, i.tipo), i.origem, i.instituicaoEmissora]
                    .filter(Boolean)
                    .some((campo) => String(campo).toLowerCase().includes(filtro)),
                )
              : inventario.itens;
            return (
              <>
                <input
                  type="search"
                  value={buscaDossie}
                  onChange={(e) => setBuscaDossie(e.target.value)}
                  placeholder="Buscar por título, tipo, origem ou instituição"
                  className="mt-3 w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold"
                />
                {inventario.itens.length === 0 ? (
                  <EstadoVazio mensagem="Nenhum material catalogado para esta pessoa ainda." />
                ) : itensFiltrados.length === 0 ? (
                  <p className="mt-2 text-sm text-navy/60">Nenhum material bate com a busca.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {itensFiltrados.map((i) => (
                      <li key={i.id} className="rounded-lg border border-navy/10 bg-white/40 p-2">
                        <p className="text-sm font-medium text-navy/85">{i.titulo}</p>
                        <p className="text-[11px] text-navy/50">
                          {rotulo(TIPOS_DOCUMENTO, i.tipo)}
                          {i.origem ? ` · ${i.origem}` : ""}
                          {i.instituicaoEmissora ? ` · ${i.instituicaoEmissora}` : ""}
                          {i.data ? ` · ${i.data}` : " · sem data"}
                          {i.status ? ` · ${i.status}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {inventario.lacunas.length > 0 ? (
                  <p className="mt-3 text-xs text-navy/55">
                    Ainda sem nenhum material catalogado:{" "}
                    {inventario.lacunas.map((t) => rotulo(TIPOS_DOCUMENTO, t)).join(", ")}.
                  </p>
                ) : null}
              </>
            );
          })()}
        </CaCard>

        <ContatosDaPessoa
          clienteId={cliente.id as string}
          contatos={(contatos ?? []) as any[]}
          podeEscrever={podeEscrever}
          pendencia={pendenciaVinculo}
        />

        {/*
          O elo com o lead. `leads.case_id` era nulo em todo o banco por falta
          de escritor — não por regra de negócio. A tela nunca funde registro
          sozinha: mostra a evidência e só grava o vínculo quando um humano
          escolhe explicitamente o caso desta pessoa (CA03-PESSOA-UNICA-VINCULOS,
          09/09/2026). Nome sozinho nunca é motivo suficiente — por isso o
          botão exige escolher o caso, mesmo quando a evidência já é forte.
        */}
        <CaCard titulo="Antes de virar cliente">
          {erroVinculo ? <p className="mt-2 text-xs text-terracotta">{erroVinculo}</p> : null}
          {candidatos.length === 0 ? (
            <p className="text-sm text-navy/65">
              Nenhum lead desta organização tem e-mail, telefone ou nome que bata com esta pessoa.
              Ela não entrou por lead — a origem registrada é{" "}
              <span className="font-medium">{cliente.origem || "não informada"}</span>.
            </p>
          ) : (
            <ul className="space-y-2">
              {candidatos.map(({ lead, evidencia }) => (
                <li
                  key={lead.id}
                  className={`rounded-lg border p-3 ${
                    evidencia.forca === "confirmado"
                      ? "border-navy/15 bg-cream/25"
                      : "border-gold/40 bg-gold/5"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-navy">{lead.nome}</p>
                    <span className="rounded bg-navy/8 px-1.5 py-0.5 text-[11px] text-navy/70">
                      {FORCA_ROTULO[evidencia.forca]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/60">{evidencia.motivo}</p>
                  <p className="mt-1 text-[11px] text-navy/45">
                    {[
                      lead.estagio ? `estágio ${lead.estagio}` : null,
                      lead.origem,
                      lead.created_at ? `registrado em ${formatarDia(lead.created_at)}` : null,
                      lead.case_id ? "ligado a um caso" : "sem caso ligado",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {lead.case_id ? null : casos.length === 0 ? (
                    <p className="mt-2 text-[11px] text-navy/45">
                      Esta pessoa ainda não tem caso — vínculo fica disponível quando houver um.
                    </p>
                  ) : podeEscrever ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <select
                        value={casoEscolhido[lead.id] ?? ""}
                        onChange={(e) => setCasoEscolhido((s) => ({ ...s, [lead.id]: e.target.value }))}
                        className="rounded-md border border-navy/20 bg-cream px-2 py-1 text-xs text-navy"
                      >
                        <option value="">Escolher o caso desta pessoa…</option>
                        {casos.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.codigo ?? c.titulo ?? c.id}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!casoEscolhido[lead.id] || mVincular.isPending}
                        onClick={() => mVincular.mutate({ leadId: lead.id, caseId: casoEscolhido[lead.id] })}
                        className="rounded-md border border-navy/20 px-2 py-1 text-xs text-navy hover:bg-navy/5 disabled:opacity-40"
                        title="Confirmação humana do vínculo — nunca automática. Preserva origem, Discovery e atividades do lead."
                      >
                        Confirmar vínculo
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-navy/45">
                      Pendência registrada: {pendenciaVinculo}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        <CaCard
          titulo="Linha do tempo"
          acao={
            <p className="text-xs text-navy/55">
              {linha.eventos.length} fato(s)
              {linha.de ? ` · de ${formatarDia(linha.de)} a ${formatarDia(linha.ate!)}` : ""}
              {linha.casos > 1 ? ` · ${linha.casos} casos` : ""}
            </p>
          }
        >
          {linha.semData > 0 ? (
            <p className="text-xs text-navy/50">
              {linha.semData} registro(s) sem data utilizável ficaram fora da ordem cronológica.
            </p>
          ) : null}

          {linha.eventos.length === 0 ? (
            <EstadoVazio mensagem="Ainda não há fatos registrados na linha do tempo dos casos desta pessoa." />
          ) : (
            <ol className="mt-4 space-y-0 border-l border-navy/15 pl-5">
              {linha.eventos.map((e, i) => (
                <li key={`${e.quando}-${i}`} className="relative py-2.5">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1.4rem] top-4 block h-2.5 w-2.5 rounded-full border-2 border-white"
                    style={{ backgroundColor: e.bloqueio ? "#5E1F18" : "#2F4B6E" }}
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-mono text-[11px] tabular-nums text-navy/60">
                      {formatarDia(e.quando)}
                    </span>
                    <p className="text-sm text-navy/85">{e.titulo}</p>
                    {e.bloqueio ? (
                      <span className="rounded bg-[#5E1F18]/10 px-1.5 py-0.5 text-[11px] text-[#5E1F18]">
                        <span aria-hidden="true">!</span> bloqueia
                      </span>
                    ) : null}
                  </div>
                  {e.resumoInterno ? (
                    <p className="mt-0.5 text-xs text-navy/60">{e.resumoInterno}</p>
                  ) : null}
                  <p className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-navy/45">
                    {e.fase ? <span>{e.fase}</span> : null}
                    {e.status ? <span>{e.status}</span> : null}
                    {e.responsavel ? <span>{e.responsavel}</span> : null}
                    {linha.casos > 1 && e.casoCodigo ? (
                      <span className="font-mono">{e.casoCodigo}</span>
                    ) : null}
                    {e.alerta ? <span className="text-terracotta">{e.alerta}</span> : null}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CaCard>
          </div>
        </details>
      </div>
    </SaasShell>
  );
}

function ordemDaForca(f: EvidenciaDeElo["forca"]): number {
  return f === "confirmado" ? 0 : f === "provavel" ? 1 : 2;
}

/**
 * P27 (26/09/2026): "Experiência no App" pedido pelo Pacote de Instruções
 * dentro de Pessoa 360 — reaproveita o mesmo resumoVisaoClienteCaso já usado
 * em Caso 360 (nenhum escritor/consulta novo além do que a função já faz).
 */
function ExperienciaNoApp({ caseId }: { caseId: string }) {
  const carregarFn = useServerFn(resumoVisaoClienteCaso);
  const q = useQuery({
    queryKey: ["ficha-caso-visao-cliente", caseId],
    queryFn: () => carregarFn({ data: { casoId: caseId } }),
    retry: false,
  });
  if (q.isLoading) return <p className="mt-2 text-[11px] text-navy/50">Carregando experiência no App…</p>;
  if (q.isError) return <p className="mt-2 text-[11px] text-terracotta">Não foi possível carregar a experiência no App.</p>;
  const d = q.data;
  return (
    <div className="mt-2 rounded-md border border-navy/10 bg-navy/[0.02] p-2 text-[11px] text-navy/75">
      <p className="font-medium text-navy/60">Experiência no App</p>
      <p>Acesso: {d?.acesso.liberado ? "liberado" : "não liberado"}</p>
      <p>Próximo passo publicado: {d?.proximaAcao?.acao ?? "Sem dados suficientes"}</p>
      <p>Documentos disponíveis: {d?.documentosDisponiveis ?? 0}</p>
      <p>Último acesso do cliente: {d?.acesso.ultimoAcessoEm ? String(d.acesso.ultimoAcessoEm).slice(0, 10) : "sem acesso registrado"}</p>
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-navy/80">{valor || "—"}</dd>
    </div>
  );
}

function formatarDia(valor?: string | null): string {
  if (!valor) return "—";
  const d = new Date(valor.length <= 10 ? `${valor}T12:00:00Z` : valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
