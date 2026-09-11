/**
 * FECHAMENTO DO CASO — os treze gates de formalização, como tela única do Desk.
 *
 * Função pura, sem I/O. Cada gate declara: estado inicial esperado, condição
 * objetiva de avanço e a ação que o Desk oferece quando ainda está pendente.
 *
 * Regra: nenhum gate avança sozinho. Cobrança, assinatura, pesquisa externa e
 * comunicação continuam sendo atos humanos — aqui só se registra e se bloqueia.
 */

import type { EstadoCaso } from "@/lib/jornada-cliente";

/*
 * 04/09/2026 — 4 gates novos, decisão da Proprietária de executar a régua
 * de cadência D0-D365 (docs/arquitetura/2026-09-03_MAPA-CADENCIAS-D0-D365-ANA-REGRA-UNIVERSAL.md,
 * seção 3): dos 10 critérios de D0 daquela política, 6 já batiam com os 9
 * gates originais (achado registrado em
 * docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md,
 * seção 5) — produto_servico, perfil_institucional, conteudo_portal e
 * sem_bloqueio_critico fecham os 4 que não tinham gate correspondente.
 */
export const GATES_FECHAMENTO = [
  "aceite_comercial",
  "cadastro",
  "produto_servico",
  "perfil_institucional",
  "contrato",
  "cobranca",
  "dossie_mae",
  "familia",
  "pesquisa",
  "onboarding",
  "conteudo_portal",
  "sem_bloqueio_critico",
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
    chave: "produto_servico",
    ordem: 3,
    rotulo: "Produto e escopo",
    estadoInicialEsperado: "Não reconciliado",
    condicaoAvanco: "Produto/SKU e escopo do caso reconciliados com o catálogo homologado",
    acaoDesk: "Reconciliar o serviço do caso com o catálogo (Case Service)",
    depende: ["aceite_comercial"],
  },
  {
    chave: "perfil_institucional",
    ordem: 4,
    rotulo: "Perfil institucional",
    estadoInicialEsperado: "Vigente (fonte institucional)",
    condicaoAvanco: "Perfil institucional da contratada vigente — dado org-wide, não checklist por caso",
    acaoDesk: "Conferir só em Governança se o perfil deixar de estar vigente — não abre tarefa por caso",
    depende: [],
  },
  {
    chave: "contrato",
    ordem: 5,
    rotulo: "Contrato",
    estadoInicialEsperado: "Não criado ou não assinado",
    condicaoAvanco: "Instrumento específico preenchido e assinado",
    acaoDesk: "Vincular link interno do contrato e marcar “Contrato assinado”",
    depende: ["aceite_comercial", "cadastro", "perfil_institucional"],
  },
  {
    chave: "cobranca",
    ordem: 6,
    rotulo: "Cobrança",
    estadoInicialEsperado: "Não ativada",
    condicaoAvanco: "Cobrança criada/validada na plataforma financeira e pagamento inicial confirmado",
    acaoDesk: "Apenas referenciar o evento/status da cobrança — nunca criar cobrança automaticamente",
    depende: ["contrato"],
  },
  {
    chave: "dossie_mae",
    ordem: 7,
    rotulo: "Dossiê-mãe",
    estadoInicialEsperado: "Pré-onboarding a validar",
    condicaoAvanco: "Pasta canônica, acesso, responsável e estrutura de subpastas confirmados",
    acaoDesk: "Converter a pasta de pré-onboarding em “Dossiê ativo”",
    depende: ["aceite_comercial"],
  },
  {
    chave: "familia",
    ordem: 8,
    rotulo: "Família",
    estadoInicialEsperado: "Estrutura a consolidar",
    condicaoAvanco: "Núcleo criado e requerentes individuais vinculados",
    acaoDesk: "Criar o núcleo familiar e vincular cada requerente",
    depende: ["dossie_mae"],
  },
  {
    chave: "pesquisa",
    ordem: 9,
    rotulo: "Pesquisa",
    estadoInicialEsperado: "Bloqueada",
    condicaoAvanco: "Autorização e escopo de pesquisa registrados",
    acaoDesk: "Liberar somente o escopo autorizado",
    depende: ["contrato", "familia"],
  },
  {
    chave: "onboarding",
    ordem: 10,
    rotulo: "Onboarding",
    estadoInicialEsperado: "Não iniciado",
    condicaoAvanco: "Contrato assinado + pagamento inicial + dossiê mínimo",
    acaoDesk: "Enviar boas-vindas, Magic Link, checklist documental e plano inicial",
    depende: ["contrato", "cobranca", "dossie_mae"],
  },
  {
    chave: "conteudo_portal",
    ordem: 11,
    rotulo: "Conteúdo do portal",
    estadoInicialEsperado: "Não aplicável até acesso liberado",
    condicaoAvanco: "Se o acesso ao App Cliente for liberado, existe ao menos uma entrega aprovada/publicada preparada",
    acaoDesk: "Preparar e aprovar a primeira entrega ao cliente antes de liberar o acesso",
    depende: ["onboarding"],
  },
  {
    chave: "sem_bloqueio_critico",
    ordem: 12,
    rotulo: "Sem bloqueio crítico",
    estadoInicialEsperado: "A conferir",
    condicaoAvanco: "Nenhum alerta de criticidade crítica em aberto para o caso",
    acaoDesk: "Resolver ou reclassificar os alertas críticos abertos do caso",
    depende: [],
  },
  {
    chave: "caso_ativo",
    ordem: 13,
    rotulo: "Caso ativo",
    estadoInicialEsperado: "Não iniciar antes dos gates",
    condicaoAvanco: "Onboarding mínimo concluído e sem bloqueio crítico aberto",
    acaoDesk: "Abrir o caso operacional e a cadência de entregas",
    depende: ["onboarding", "sem_bloqueio_critico"],
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
export type EstadoFechamento = EstadoCaso & {
  casoAtivo?: boolean;
  /** Produto/SKU do case_service reconciliado contra o catálogo homologado. */
  produtoServicoReconciliado: boolean;
  /** `perfilInstitucionalRenderizado().vigente` (src/lib/perfil-institucional.ts). */
  perfilInstitucionalVigente: boolean;
  /** Acesso ao App Cliente já foi liberado para este caso (RLS/portal). */
  portalAcessoLiberado: boolean;
  /** Existe ao menos uma entrega (client_deliverables) aprovada ou publicada. */
  conteudoPortalPreparado: boolean;
  /** Nenhum case_alerts com criticidade "critico" e status "pending" para o caso. */
  semBloqueioCritico: boolean;
};

function condicaoDoGate(chave: GateFechamento, e: EstadoFechamento): { ok: boolean; motivo: string } {
  switch (chave) {
    case "aceite_comercial":
      return { ok: e.aceiteComercial, motivo: "Aceite comercial sem evidência registrada." };
    case "cadastro":
      return { ok: e.cadastroCompleto, motivo: "Dados civis, documento, endereço ou contatos ainda não validados." };
    case "produto_servico":
      return { ok: e.produtoServicoReconciliado, motivo: "Produto/SKU e escopo do caso ainda não reconciliados com o catálogo homologado." };
    case "perfil_institucional":
      return { ok: e.perfilInstitucionalVigente, motivo: "Perfil institucional da contratada não está vigente." };
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
    case "conteudo_portal":
      return {
        ok: !e.portalAcessoLiberado || e.conteudoPortalPreparado,
        motivo: "Acesso ao App Cliente liberado sem nenhuma entrega aprovada/publicada preparada.",
      };
    case "sem_bloqueio_critico":
      return { ok: e.semBloqueioCritico, motivo: "Há alerta de criticidade crítica em aberto para o caso." };
    case "caso_ativo":
      return {
        ok: !!e.casoAtivo && e.onboardingMinimoConcluido && e.semBloqueioCritico,
        motivo: "Onboarding mínimo não concluído ou há bloqueio crítico aberto.",
      };
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
      casoAtivo: e.contratoAssinado && e.pagamentoInicialConfirmado && e.onboardingMinimoConcluido && e.semBloqueioCritico,
      pesquisaExterna: e.contratoAssinado && e.autorizacaoPesquisa,
      dossieAtivo: e.dossieMae && e.ambienteDossie && e.nucleoFamiliar,
    },
  };
}
