/**
 * FECHAMENTO DO CASO — os nove gates de formalização, como tela única do Desk.
 *
 * Função pura, sem I/O. Cada gate declara: estado inicial esperado, condição
 * objetiva de avanço e a ação que o Desk oferece quando ainda está pendente.
 *
 * Regra: nenhum gate avança sozinho. Cobrança, assinatura, pesquisa externa e
 * comunicação continuam sendo atos humanos — aqui só se registra e se bloqueia.
 */

import type { EstadoCaso } from "@/lib/jornada-cliente";

export const GATES_FECHAMENTO = [
  "aceite_comercial",
  "cadastro",
  "contrato",
  "cobranca",
  "dossie_mae",
  "familia",
  "pesquisa",
  "onboarding",
  "caso_ativo",
] as const;
export type GateFechamento = (typeof GATES_FECHAMENTO)[number];

export type DefinicaoGate = {
  chave: GateFechamento;
  ordem: number;
  rotulo: string;
  estadoInicialEsperado: string;
  condicaoAvanco: string;
  acaoDesk: string;
  /** Gates que precisam estar concluídos antes de este poder avançar. */
  depende: GateFechamento[];
};

export const DEFINICOES_FECHAMENTO: DefinicaoGate[] = [
  {
    chave: "aceite_comercial",
    ordem: 1,
    rotulo: "Aceite comercial",
    estadoInicialEsperado: "Confirmado",
    condicaoAvanco: "Proposta/escopo aprovado registrado",
    acaoDesk: "Preservar evidência do aceite e converter a oportunidade em formalização",
    depende: [],
  },
  {
    chave: "cadastro",
    ordem: 2,
    rotulo: "Cadastro",
    estadoInicialEsperado: "Pendente",
    condicaoAvanco: "Nome civil, CPF e dados necessários, endereço e contatos validados",
    acaoDesk: "Abrir tarefa “Completar cadastro”",
    depende: ["aceite_comercial"],
  },
  {
    chave: "contrato",
    ordem: 3,
    rotulo: "Contrato",
    estadoInicialEsperado: "Não criado ou não assinado",
    condicaoAvanco: "Instrumento específico preenchido e assinado",
    acaoDesk: "Vincular link interno do contrato e marcar “Contrato assinado”",
    depende: ["aceite_comercial", "cadastro"],
  },
  {
    chave: "cobranca",
    ordem: 4,
    rotulo: "Cobrança",
    estadoInicialEsperado: "Não ativada",
    condicaoAvanco: "Cobrança criada/validada na plataforma financeira e pagamento inicial confirmado",
    acaoDesk: "Apenas referenciar o evento/status da cobrança — nunca criar cobrança automaticamente",
    depende: ["contrato"],
  },
  {
    chave: "dossie_mae",
    ordem: 5,
    rotulo: "Dossiê-mãe",
    estadoInicialEsperado: "Pré-onboarding a validar",
    condicaoAvanco: "Pasta canônica, acesso, responsável e estrutura de subpastas confirmados",
    acaoDesk: "Converter a pasta de pré-onboarding em “Dossiê ativo”",
    depende: ["aceite_comercial"],
  },
  {
    chave: "familia",
    ordem: 6,
    rotulo: "Família",
    estadoInicialEsperado: "Estrutura a consolidar",
    condicaoAvanco: "Núcleo criado e requerentes individuais vinculados",
    acaoDesk: "Criar o núcleo familiar e vincular cada requerente",
    depende: ["dossie_mae"],
  },
  {
    chave: "pesquisa",
    ordem: 7,
    rotulo: "Pesquisa",
    estadoInicialEsperado: "Bloqueada",
    condicaoAvanco: "Autorização e escopo de pesquisa registrados",
    acaoDesk: "Liberar somente o escopo autorizado",
    depende: ["contrato", "familia"],
  },
  {
    chave: "onboarding",
    ordem: 8,
    rotulo: "Onboarding",
    estadoInicialEsperado: "Não iniciado",
    condicaoAvanco: "Contrato assinado + pagamento inicial + dossiê mínimo",
    acaoDesk: "Enviar boas-vindas, Magic Link, checklist documental e plano inicial",
    depende: ["contrato", "cobranca", "dossie_mae"],
  },
  {
    chave: "caso_ativo",
    ordem: 9,
    rotulo: "Caso ativo",
    estadoInicialEsperado: "Não iniciar antes dos gates",
    condicaoAvanco: "Onboarding mínimo concluído",
    acaoDesk: "Abrir o caso operacional e a cadência de entregas",
    depende: ["onboarding"],
  },
];

export type SituacaoGate = "concluido" | "pendente" | "bloqueado";

export type GateAvaliado = DefinicaoGate & {
  situacao: SituacaoGate;
  motivo: string | null;
  /** Gates anteriores que impedem este de avançar agora. */
  bloqueadoPor: GateFechamento[];
};

export type ResultadoFechamento = {
  gates: GateAvaliado[];
  rotuloSituacao: string;
  concluidos: number;
  pendentes: number;
  bloqueados: number;
  /** Primeiro gate acionável na ordem normativa. */
  proximoGate: GateAvaliado | null;
  proximaAcao: string;
  permite: { onboarding: boolean; casoAtivo: boolean; pesquisaExterna: boolean; dossieAtivo: boolean };
};

/** Estado adicional necessário só para o fechamento. */
export type EstadoFechamento = EstadoCaso & { casoAtivo?: boolean };

function condicaoDoGate(chave: GateFechamento, e: EstadoFechamento): { ok: boolean; motivo: string } {
  switch (chave) {
    case "aceite_comercial":
      return { ok: e.aceiteComercial, motivo: "Aceite comercial sem evidência registrada." };
    case "cadastro":
      return { ok: e.cadastroCompleto, motivo: "Dados civis, documento, endereço ou contatos ainda não validados." };
    case "contrato":
      return { ok: e.contratoAssinado, motivo: "Instrumento específico não preenchido ou não assinado." };
    case "cobranca":
      return {
        ok: e.cobrancaCriada && e.pagamentoInicialConfirmado,
        motivo: !e.cobrancaCriada
          ? "Cobrança não criada/validada na plataforma financeira."
          : "Pagamento inicial ainda não confirmado.",
      };
    case "dossie_mae":
      return { ok: e.dossieMae && e.ambienteDossie, motivo: "Pasta canônica, acesso ou responsável do dossiê não confirmados." };
    case "familia":
      return { ok: e.nucleoFamiliar && e.requerentes, motivo: "Núcleo familiar ou requerentes individuais ainda não vinculados." };
    case "pesquisa":
      return { ok: e.autorizacaoPesquisa, motivo: "Autorização e escopo de pesquisa não registrados." };
    case "onboarding":
      return { ok: e.onboardingIniciado, motivo: "Onboarding ainda não iniciado." };
    case "caso_ativo":
      return { ok: !!e.casoAtivo && e.onboardingMinimoConcluido, motivo: "Onboarding mínimo não concluído." };
  }
}

export function avaliarFechamento(e: EstadoFechamento): ResultadoFechamento {
  const concluidoPorChave = {} as Record<GateFechamento, boolean>;
  const gates: GateAvaliado[] = [];

  for (const def of [...DEFINICOES_FECHAMENTO].sort((a, b) => a.ordem - b.ordem)) {
    const { ok, motivo } = condicaoDoGate(def.chave, e);
    const bloqueadoPor = def.depende.filter((d) => !concluidoPorChave[d]);
    const situacao: SituacaoGate = ok ? "concluido" : bloqueadoPor.length > 0 ? "bloqueado" : "pendente";
    concluidoPorChave[def.chave] = ok;
    gates.push({
      ...def,
      situacao,
      motivo: ok ? null : situacao === "bloqueado" ? `Depende de: ${bloqueadoPor.join(", ")}.` : motivo,
      bloqueadoPor,
    });
  }

  const proximoGate = gates.find((g) => g.situacao === "pendente") ?? gates.find((g) => g.situacao === "bloqueado") ?? null;
  const todosConcluidos = gates.every((g) => g.situacao === "concluido");

  return {
    gates,
    rotuloSituacao: !e.aceiteComercial
      ? "Oportunidade em negociação"
      : !e.contratoAssinado || !e.pagamentoInicialConfirmado
        ? "Aceite confirmado — formalização pendente"
        : todosConcluidos
          ? "Caso ativo"
          : "Formalizado — onboarding em curso",
    concluidos: gates.filter((g) => g.situacao === "concluido").length,
    pendentes: gates.filter((g) => g.situacao === "pendente").length,
    bloqueados: gates.filter((g) => g.situacao === "bloqueado").length,
    proximoGate,
    proximaAcao: proximoGate ? `${proximoGate.rotulo}: ${proximoGate.acaoDesk}` : "Operar o caso ativo com cadência de entregas.",
    permite: {
      onboarding: e.contratoAssinado && e.pagamentoInicialConfirmado && e.dossieMae,
      casoAtivo: e.contratoAssinado && e.pagamentoInicialConfirmado && e.onboardingMinimoConcluido,
      pesquisaExterna: e.contratoAssinado && e.autorizacaoPesquisa,
      dossieAtivo: e.dossieMae && e.ambienteDossie && e.nucleoFamiliar,
    },
  };
}
