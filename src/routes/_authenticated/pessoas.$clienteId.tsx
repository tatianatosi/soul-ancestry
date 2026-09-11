import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { atualizarPessoa, carregarPessoa } from "@/lib/pessoa.functions";
import { salvarLeadDesk } from "@/lib/crm-desk.functions";
import { DecisaoAposSalvarPessoa } from "@/components/pessoa/decisao-apos-salvar";
import {
  evidenciaDeMesmaPessoa,
  montarLinhaDoTempoDaPessoa,
  type EvidenciaDeElo,
} from "@/lib/pessoa-identidade";
import { formatarCep, formatarCpf, formatarTelefone, UFS_BRASIL } from "@/lib/validacao-pessoa";
import { rotuloFase } from "@/lib/fase-rotulo";
import { obterProximaAcaoCanonica, SELO_PROXIMA_ACAO } from "@/lib/caso-ficha";
import { NOME_RESPONSAVEL_PADRAO } from "@/lib/responsavel-padrao";

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
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  // CA03-PESSOA-UNICA-VINCULOS (09/09/2026): confirmação humana do vínculo
  // lead → pessoa. Nunca funde por nome sozinho — só grava quando alguém
  // escolhe explicitamente a qual caso desta pessoa o lead pertence.
  const [casoEscolhido, setCasoEscolhido] = useState<Record<string, string>>({});
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [decisaoAposSalvar, setDecisaoAposSalvar] = useState(false);

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
  } = q.data;

  const linha = montarLinhaDoTempoDaPessoa(
    casos.map((c) => ({
      casoCodigo: c.codigo ?? null,
      casoTitulo: c.titulo ?? null,
      eventos: eventos.filter((e) => e.case_id === c.id),
    })),
  );

  // Leads que podem ser esta mesma pessoa, com a evidência à vista.
  const candidatos = leads
    .map((l) => ({ lead: l, evidencia: evidenciaDeMesmaPessoa(l, cliente) }))
    .filter((x): x is { lead: typeof x.lead; evidencia: EvidenciaDeElo } => x.evidencia !== null)
    .sort((a, b) => ordemDaForca(a.evidencia.forca) - ordemDaForca(b.evidencia.forca));

  const nome = (cliente.nome_social || cliente.nome || "Sem nome").trim();

  return (
    <SaasShell titulo={nome} descricao="A história desta pessoa, reunida de todos os casos dela.">
      <div className="space-y-6">
        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Quem é</h2>
            {editando ? (
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
                  onClick={() => mSalvar.mutate(form)}
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
                    data_nascimento: cliente.data_nascimento ?? "",
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
            )}
          </div>

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
                <Campo rotulo="Telefone" valor={cliente.telefone} />
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
                <Campo rotulo="CPF" valor={cliente.cpf} />
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
                      cliente.endereco_cep,
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
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Casos</h2>
            <p className="text-xs text-navy/55">{casos.length} caso(s)</p>
          </div>
          <p className="mt-1 text-xs text-navy/55">
            Próxima ação vem do mesmo planejador da ficha do caso (RPC). Responsável padrão da operação:{" "}
            {NOME_RESPONSAVEL_PADRAO}.
          </p>
          {casos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">Nenhum caso aberto para esta pessoa.</p>
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
                      <p className="font-mono text-[11px] text-navy/60">{c.codigo}</p>
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
                    </dl>
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
                        Visão do cliente
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Núcleo familiar e papéis</h2>
            <p className="text-xs text-navy/55">{nucleoMembros.length} vínculo(s)</p>
          </div>
          {nucleoMembros.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">
              Esta pessoa não está vinculada a nenhum núcleo familiar.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {nucleoMembros.map((m) => (
                <li key={m.id} className="rounded-lg border border-navy/12 bg-cream/25 p-3">
                  <p className="text-sm font-medium text-navy">
                    {m.papel === "dependente" ? "Dependente" : "Contratante/signatária"}
                  </p>
                  <p className="mt-0.5 text-xs text-navy/60">
                    {m.vinculo}
                    {m.processo ? ` · ${m.processo}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <h2 className="font-serif text-lg text-navy">Propostas, contratos e documentos</h2>
          <p className="mt-1 text-xs text-navy/55">
            Status aqui; edição e formalização nas rotas de origem (sem formulário duplicado).
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
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
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Conteúdo publicado para o App Cliente</h2>
            <p className="text-xs text-navy/55">{projecoesPublicadas.length} projeção(ões)</p>
          </div>
          {projecoesPublicadas.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">
              Nada foi publicado para o App Cliente nos casos desta pessoa ainda.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
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
        </section>

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
          <section className="rounded-xl border border-dashed border-navy/20 bg-cream/20 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-lg text-navy">
                Pesquisa genealógica interna (restrita ao Desk)
              </h2>
              {casos[0] ? (
                <Link
                  to="/pessoas-linhagens/$caseId"
                  params={{ caseId: casos[0].id }}
                  className="text-xs text-navy underline underline-offset-4"
                >
                  Abrir ficha completa
                </Link>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-navy/55">
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

            {perfisGenealogicos.length > 0 ? (
              <ul className="mt-3 space-y-1 border-t border-navy/10 pt-2">
                {perfisGenealogicos.map((p) => (
                  <li key={p.id} className="text-sm text-navy/80">
                    Perfil 360°: {p.nome_completo}{" "}
                    <span className="text-[11px] text-navy/50">· {p.status_verificacao}</span>
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
          </section>
        ) : null}

        {/*
          O elo com o lead. `leads.case_id` era nulo em todo o banco por falta
          de escritor — não por regra de negócio. A tela nunca funde registro
          sozinha: mostra a evidência e só grava o vínculo quando um humano
          escolhe explicitamente o caso desta pessoa (CA03-PESSOA-UNICA-VINCULOS,
          09/09/2026). Nome sozinho nunca é motivo suficiente — por isso o
          botão exige escolher o caso, mesmo quando a evidência já é forte.
        */}
        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <h2 className="font-serif text-lg text-navy">Antes de virar cliente</h2>
          {erroVinculo ? <p className="mt-2 text-xs text-terracotta">{erroVinculo}</p> : null}
          {candidatos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/65">
              Nenhum lead desta organização tem e-mail, telefone ou nome que bata com esta pessoa.
              Ela não entrou por lead — a origem registrada é{" "}
              <span className="font-medium">{cliente.origem || "não informada"}</span>.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
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
                        className="rounded-md border border-navy/20 bg-white px-2 py-1 text-xs text-navy"
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
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-serif text-lg text-navy">Linha do tempo</h2>
            <p className="text-xs text-navy/55">
              {linha.eventos.length} fato(s)
              {linha.de ? ` · de ${formatarDia(linha.de)} a ${formatarDia(linha.ate!)}` : ""}
              {linha.casos > 1 ? ` · ${linha.casos} casos` : ""}
            </p>
          </div>

          {linha.semData > 0 ? (
            <p className="mt-2 text-xs text-navy/50">
              {linha.semData} registro(s) sem data utilizável ficaram fora da ordem cronológica.
            </p>
          ) : null}

          {linha.eventos.length === 0 ? (
            <p className="mt-2 text-sm text-navy/60">
              Ainda não há fatos registrados na linha do tempo dos casos desta pessoa.
            </p>
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
        </section>
      </div>
    </SaasShell>
  );
}

function ordemDaForca(f: EvidenciaDeElo["forca"]): number {
  return f === "confirmado" ? 0 : f === "provavel" ? 1 : 2;
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
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
