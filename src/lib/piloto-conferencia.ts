/**
 * Piloto real Ana Luiza — painel de conferência (gates A–H).
 *
 * Reutiliza os mesmos requisitos de ativação da ficha operacional
 * (`gates-ativacao-ficha`) e os bloqueios já declarados do piloto.
 * É leitura derivada: não altera dado, não libera ação e não executa
 * contrato, cobrança, assinatura, pesquisa externa ou comunicação.
 */

import { BLOQUEIOS_PILOTO, PILOTO_ANA } from "@/lib/piloto-ana";
import { gatesAtivacaoFicha, type CategoriaGate, type GateAtivacao } from "@/lib/gates-ativacao-ficha";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

export const LETRAS_GATE_PILOTO = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type LetraGatePiloto = (typeof LETRAS_GATE_PILOTO)[number];

export type CampoConferencia = {
  campo: string;
  valor: string;
  /** De onde o valor foi lido, em linguagem operacional. */
  origem: string;
  /** Evidência exigida para considerar o campo conferido. */
  evidencia: string;
  conferido: boolean;
};

export type GatePiloto = {
  letra: LetraGatePiloto;
  nome: string;
  categoria: CategoriaGate;
  criterio: string;
  /** Gate crítico: enquanto pendente, a situação operacional permanece NO_GO. */
  critico: boolean;
  ok: boolean;
  campos: CampoConferencia[];
  /** Bloqueios declarados do piloto que pertencem a este gate. */
  bloqueios: { codigo: string; titulo: string; detalhe: string }[];
  /** Requisitos de ativação da ficha vinculados a este gate. */
  requisitos: GateAtivacao[];
};

type Definicao = {
  letra: LetraGatePiloto;
  nome: string;
  categoria: CategoriaGate;
  criterio: string;
  critico: boolean;
  requisitos: string[];
  bloqueios: string[];
};

const DEFINICOES: Definicao[] = [
  {
    letra: "A",
    nome: "Identificação canônica e núcleo familiar",
    categoria: "Operação",
    criterio: "Um único identificador canônico decidido por pessoa autorizada, com aliases preservados e núcleo descrito.",
    critico: true,
    requisitos: [],
    bloqueios: ["nome_alice"],
  },
  {
    letra: "B",
    nome: "Aceite formal e proposta de referência",
    categoria: "Comercial",
    criterio: "Aceite formal registrado e proposta tratada apenas como evidência interna, sem virar preço homologado.",
    critico: true,
    requisitos: ["canva_completo"],
    bloqueios: [],
  },
  {
    letra: "C",
    nome: "Cadastro da contratante e participantes",
    categoria: "Comercial",
    criterio: "Contratante e participantes com dados conferidos; dependentes com representação registrada.",
    critico: true,
    requisitos: ["escopo_sku_preco"],
    bloqueios: ["cadastro_contratante", "representacao_felipe"],
  },
  {
    letra: "D",
    nome: "Instrumentos contratuais (contrato e Anexo I/OS)",
    categoria: "Formalização",
    criterio: "Contrato específico e Anexo I/OS gerados do modelo aprovado, com dados da contratada ativos.",
    critico: true,
    requisitos: ["instrumentos_preparados"],
    bloqueios: ["dados_contratada", "contrato_especifico", "anexo_os"],
  },
  {
    letra: "E",
    nome: "Revisão jurídica",
    categoria: "Formalização",
    criterio: "Revisão humana concluída antes de qualquer envio ou assinatura.",
    critico: true,
    requisitos: [],
    bloqueios: ["revisao_juridica"],
  },
  {
    letra: "F",
    nome: "Método de assinatura",
    categoria: "Formalização",
    criterio: "Método definido e homologado; assinatura registrada com evidência.",
    critico: true,
    requisitos: ["assinatura"],
    bloqueios: ["metodo_assinatura"],
  },
  {
    letra: "G",
    nome: "Reconciliação comercial e financeira",
    categoria: "Financeiro",
    criterio: "SKU, preço, escopo, parcelamento e vencimento reconciliados por fonte homologada; cobrança permanece bloqueada até aprovação.",
    critico: true,
    requisitos: ["cobranca_aprovada", "pagamento_confirmado"],
    bloqueios: ["reconciliacao_comercial", "asaas_bloqueado"],
  },
  {
    letra: "H",
    nome: "Dossiê pré-onboarding e ativação",
    categoria: "Operação",
    criterio: "Dossiê e checklist revisados por pessoa autorizada e ativação aprovada.",
    critico: false,
    requisitos: ["aprovacao_ativacao"],
    bloqueios: ["dossie_pre_onboarding"],
  },
];

const texto = (v: unknown) => (typeof v === "string" && v.trim().length > 0 ? v.trim() : "");

function camposDoGate(letra: LetraGatePiloto, caso: Linha | null): CampoConferencia[] {
  const c = caso ?? {};
  const campo = (
    campoNome: string,
    valor: string,
    origem: string,
    evidencia: string,
    conferido: boolean,
  ): CampoConferencia => ({
    campo: campoNome,
    valor: valor || "—",
    origem,
    evidencia,
    conferido,
  });

  if (letra === "A") {
    const canonico = texto(c["id_canonico_decidido"]) || texto(PILOTO_ANA.id_canonico_decidido ?? "");
    const decisor = texto(c["id_canonico_decidido_por"]);
    return [
      campo(
        "Identificador canônico",
        canonico,
        "Ficha do caso — decisão registrada no Desk",
        "Decisão humana registrada com autor e data",
        Boolean(canonico),
      ),
      campo(
        "Quem decidiu",
        decisor,
        "Ficha do caso — autor da decisão",
        "Nome do responsável autorizado",
        Boolean(decisor),
      ),
      campo(
        "Aliases históricos preservados",
        PILOTO_ANA.ids_historicos.join(" · "),
        "Registro interno do piloto",
        "Identificadores anteriores mantidos como histórico",
        true,
      ),
      campo(
        "Nome completo de Alice",
        "",
        "Cadastro do núcleo familiar",
        "Nome completo e documento da participante",
        false,
      ),
    ];
  }
  if (letra === "B") {
    const aceite = texto(c["data_confirmacao_formal_proposta"]) || PILOTO_ANA.aceite_formal_confirmado_em;
    return [
      campo(
        "Aceite formal",
        aceite,
        "Ficha do caso — confirmação formal da proposta",
        "Data do aceite registrada",
        Boolean(aceite),
      ),
      campo(
        "Proposta de referência",
        PILOTO_ANA.proposta_observacao,
        "Registro interno do piloto",
        "Tratada como evidência interna; não é preço homologado nem cobrança",
        true,
      ),
      campo(
        "Escopo incluído e excluído",
        texto(c["escopo_incluido_resumido"]),
        "Ficha do caso — escopo da proposta",
        "Escopo incluído, excluído e marcos preenchidos",
        Boolean(texto(c["escopo_incluido_resumido"]) && texto(c["escopo_excluido_resumido"])),
      ),
    ];
  }
  if (letra === "C") {
    return [
      campo(
        "Contratante",
        PILOTO_ANA.nome,
        "Cadastro do núcleo familiar",
        "Cadastro completo conferido na ficha",
        false,
      ),
      campo(
        "Participantes adultos",
        "Pai (Adair) · Alice",
        "Cadastro do núcleo familiar",
        "Dados completos e condição de signatário definida",
        false,
      ),
      campo(
        "Representação legal de Felipe",
        "",
        "Cadastro do núcleo familiar",
        "Representação legal do menor registrada",
        false,
      ),
    ];
  }
  if (letra === "D") {
    const prep = texto(c["preparacao_status"]);
    return [
      campo(
        "Preparação dos instrumentos",
        prep,
        "Ficha do caso — preparação contratual",
        "Contrato específico e Anexo I/OS gerados do modelo aprovado",
        ["contrato_preparado", "revisado", "pronto_para_assinatura"].includes(prep),
      ),
      campo(
        "Dados oficiais da contratada",
        "",
        "Perfil institucional versionado",
        "Perfil ativo e aprovado na versão vigente",
        false,
      ),
    ];
  }
  if (letra === "E") {
    return [
      campo(
        "Revisão jurídica",
        texto(c["revisao_juridica_status"]),
        "Fila de revisão jurídica",
        "Parecer humano concluído antes de envio ou assinatura",
        texto(c["revisao_juridica_status"]) === "aprovada",
      ),
    ];
  }
  if (letra === "F") {
    return [
      campo(
        "Método de assinatura",
        texto(c["metodo_assinatura"]),
        "Ficha do caso — formalização",
        "Método definido e homologado",
        Boolean(texto(c["metodo_assinatura"])),
      ),
      campo(
        "Contrato assinado",
        c["contrato_assinado"] ? "sim" : "não",
        "Ficha do caso — formalização",
        "Assinatura registrada com evidência",
        Boolean(c["contrato_assinado"]),
      ),
    ];
  }
  if (letra === "G") {
    return [
      campo(
        "Situação financeira",
        texto(c["situacao_financeira"]),
        "Ficha do caso — financeiro",
        "Cobrança aprovada por fonte homologada",
        ["cobranca_emitida", "pagamento_inicial_confirmado", "pagamento_parcial", "quitado"].includes(
          texto(c["situacao_financeira"]),
        ),
      ),
      campo(
        "Pagamento inicial",
        c["pagamento_confirmado"] ? "confirmado" : "não confirmado",
        "Ficha do caso — financeiro",
        "Confirmação de pagamento registrada",
        Boolean(c["pagamento_confirmado"]),
      ),
      campo(
        "Cobrança externa",
        "bloqueada",
        "Regra permanente do piloto",
        "Nenhum cliente, cobrança ou link é criado nesta entrega",
        false,
      ),
    ];
  }
  return [
    campo(
      "Dossiê pré-onboarding",
      "",
      "Pesquisa do caso",
      "Dossiê e checklist revisados por pessoa autorizada",
      false,
    ),
    campo(
      "Ativação operacional",
      texto(c["ativacao_operacional"]) || (texto(c["ativado_em"]) ? "ativado" : ""),
      "Ficha do caso — operação",
      "Aprovação humana de ativação registrada",
      texto(c["ativacao_operacional"]) === "aprovada" || Boolean(texto(c["ativado_em"])),
    ),
  ];
}

export type ConferenciaPiloto = {
  gates: GatePiloto[];
  concluidos: number;
  total: number;
  /** Situação operacional derivada: NO_GO enquanto houver gate crítico pendente. */
  situacao: "GO" | "NO_GO";
  explicacao: string;
  criticosPendentes: GatePiloto[];
};

export function conferenciaPiloto(caso: Linha | null): ConferenciaPiloto {
  const requisitos = gatesAtivacaoFicha(caso ?? {});
  const porChave = new Map(requisitos.map((r) => [r.chave, r]));

  const gates: GatePiloto[] = DEFINICOES.map((d) => {
    const campos = camposDoGate(d.letra, caso);
    const reqs = d.requisitos.map((k) => porChave.get(k)).filter((r): r is GateAtivacao => Boolean(r));
    const bloqueios = d.bloqueios
      .map((codigo) => BLOQUEIOS_PILOTO.find((b) => b.codigo === codigo))
      .filter((b): b is (typeof BLOQUEIOS_PILOTO)[number] => Boolean(b))
      .map((b) => ({ codigo: b.codigo, titulo: b.titulo, detalhe: b.detalhe }));
    const ok = campos.every((c) => c.conferido) && reqs.every((r) => r.ok) && bloqueios.length === 0;
    return { ...d, ok, campos, bloqueios, requisitos: reqs };
  });

  const criticosPendentes = gates.filter((g) => g.critico && !g.ok);
  const concluidos = gates.filter((g) => g.ok).length;
  const situacao = criticosPendentes.length > 0 ? "NO_GO" : "GO";

  return {
    gates,
    concluidos,
    total: gates.length,
    situacao,
    criticosPendentes,
    explicacao:
      situacao === "NO_GO"
        ? `Situação operacional NO_GO: ${criticosPendentes.length} gate(s) crítico(s) pendente(s) — ${criticosPendentes
            .map((g) => `${g.letra} (${g.nome})`)
            .join(", ")}. Nenhuma ação externa é liberada.`
        : "Todos os gates críticos conferidos. A liberação continua dependendo de decisão humana e é revalidada no servidor.",
  };
}
