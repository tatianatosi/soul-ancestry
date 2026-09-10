/**
 * Corte curto — 10/09/2026.
 *
 * Classifica o que já está no Desk (sem apagar rota nem tabela) e declara os
 * nove KPIs transversais. Contagem só onde a fila do Painel Hoje já existe;
 * senão o card declara SEM_DADO_SUFICIENTE e ainda assim abre o detalhe.
 */

import type { Fila } from "@/lib/crm-desk";
import { consolidarDia } from "@/lib/painel-dia";

export type NaturezaSuperficie =
  | "OPERACAO"
  | "FILA"
  | "KPI_VIVO"
  | "METRICA_AGREGADA"
  | "DICIONARIO_ADMIN"
  | "LEGADO"
  | "DEMO_LOCAL";

export type CoberturaKpi =
  | "confirmado"
  | "SEM_DADO_SUFICIENTE"
  | "PENDENTE_DE_TESTE"
  | "DEMO_LOCAL"
  | "LEGADO";

export type AbaDesk =
  | "hoje"
  | "comercial"
  | "casos"
  | "pesquisa"
  | "contratos"
  | "governanca"
  | "conta";

export type SuperficieClassificada = {
  rota: string;
  rotulo: string;
  aba: AbaDesk;
  natureza: NaturezaSuperficie;
  abaProprietaria: AbaDesk;
  visivelNoFluxoDiario: boolean;
};

/**
 * Cada atalho do menu. visivelNoFluxoDiario=false = sai do cockpit operacional
 * e permanece só em Governança/conta. A rota continua no repositório.
 */
export const CLASSIFICACAO_SUPERFICIES: readonly SuperficieClassificada[] = [
  { rota: "/painel", rotulo: "Painel Hoje", aba: "hoje", natureza: "FILA", abaProprietaria: "hoje", visivelNoFluxoDiario: true },
  { rota: "/alertas", rotulo: "Alertas", aba: "hoje", natureza: "FILA", abaProprietaria: "hoje", visivelNoFluxoDiario: true },

  { rota: "/marketing", rotulo: "Marketing e aquisição", aba: "comercial", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/leads", rotulo: "Leads e triagem", aba: "comercial", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/calls", rotulo: "Painel de Calls", aba: "comercial", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/propostas", rotulo: "Propostas", aba: "comercial", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/conversao", rotulo: "Conversão e follow-up", aba: "comercial", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/proximas-acoes", rotulo: "Próximas ações dos leads", aba: "comercial", natureza: "FILA", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/crm-mestre", rotulo: "CRM Mestre — mapa de regras", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/governanca/dicionario-calls-crm", rotulo: "Dicionário Calls → CRM", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },

  { rota: "/casos", rotulo: "Casos 360", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/nucleos", rotulo: "Núcleos", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/nucleos-duplicidades", rotulo: "Possíveis duplicidades", aba: "casos", natureza: "FILA", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/clientes", rotulo: "Pessoa 360", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/tarefas", rotulo: "Checklist", aba: "casos", natureza: "FILA", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/ops", rotulo: "Operação", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/ops-excecoes", rotulo: "Exceções", aba: "casos", natureza: "FILA", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/qualidade", rotulo: "Radar Interno", aba: "casos", natureza: "KPI_VIVO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/acessos-portal", rotulo: "Acessos ao portal", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/atendimento", rotulo: "Atendimento e pedidos", aba: "casos", natureza: "FILA", abaProprietaria: "casos", visivelNoFluxoDiario: true },
  { rota: "/app-cliente-como-pessoa", rotulo: "App Cliente como pessoa", aba: "casos", natureza: "OPERACAO", abaProprietaria: "casos", visivelNoFluxoDiario: true },

  { rota: "/biblioteca", rotulo: "Biblioteca Mestre", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/pesquisa-modulo", rotulo: "Pesquisa e evidências", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/pesquisa", rotulo: "Dossiê do Legado", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/fontes-genealogicas", rotulo: "Bases genealógicas", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/evidencias", rotulo: "Evidências", aba: "pesquisa", natureza: "FILA", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/privacidade", rotulo: "Privacidade", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/matriz-juridica", rotulo: "Validação Jurídica", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },
  { rota: "/biblioteca-mensagens", rotulo: "Biblioteca de Mensagens", aba: "pesquisa", natureza: "OPERACAO", abaProprietaria: "comercial", visivelNoFluxoDiario: true },
  { rota: "/relatorios", rotulo: "Relatórios", aba: "pesquisa", natureza: "METRICA_AGREGADA", abaProprietaria: "pesquisa", visivelNoFluxoDiario: true },

  { rota: "/contratos", rotulo: "Contratos", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/contrato-parametros", rotulo: "Parâmetros contratuais", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/ordens-servico", rotulo: "Ordens de serviço", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/governanca/contrato-base", rotulo: "Contrato-base", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/governanca/modelo-individual", rotulo: "Modelo individual", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/governanca/modelo-familiar-casal", rotulo: "Modelo familiar", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/governanca/modelos-contratuais", rotulo: "Matriz de modelos", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/catalogo", rotulo: "Catálogo homologado", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/financeiro", rotulo: "Financeiro", aba: "contratos", natureza: "OPERACAO", abaProprietaria: "contratos", visivelNoFluxoDiario: true },
  { rota: "/homologacao-skus", rotulo: "Homologação de SKUs", aba: "governanca", natureza: "LEGADO", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/conciliacao-catalogo", rotulo: "Conciliação de catálogo", aba: "governanca", natureza: "LEGADO", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/divergencias-catalogo", rotulo: "Divergências de catálogo", aba: "governanca", natureza: "LEGADO", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/escopo-origem", rotulo: "Origem do escopo", aba: "governanca", natureza: "LEGADO", abaProprietaria: "governanca", visivelNoFluxoDiario: false },

  { rota: "/configuracoes", rotulo: "Configurações", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/equipe", rotulo: "Equipe", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/etiquetas", rotulo: "Etiquetas", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/integracoes", rotulo: "Integrações", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/importacoes", rotulo: "Importações", aba: "governanca", natureza: "DICIONARIO_ADMIN", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/metricas", rotulo: "Métricas", aba: "governanca", natureza: "METRICA_AGREGADA", abaProprietaria: "governanca", visivelNoFluxoDiario: false },
  { rota: "/governanca/catalogo-operacional-30", rotulo: "Catálogo 30", aba: "governanca", natureza: "LEGADO", abaProprietaria: "governanca", visivelNoFluxoDiario: false },

  { rota: "/app-cliente-demo", rotulo: "Sessão DEMO", aba: "conta", natureza: "DEMO_LOCAL", abaProprietaria: "conta", visivelNoFluxoDiario: false },
];

export type KpiTransversal = {
  id: string;
  rotulo: string;
  fonte: string;
  abaProprietaria: AbaDesk;
  apareceEm: readonly AbaDesk[];
  rotaAcao: string;
  filas: readonly string[];
  cobertura: CoberturaKpi;
  leitura: string;
};

export const KPIS_TRANSVERSAIS: readonly KpiTransversal[] = [
  {
    id: "acao_vencida_sem_dono",
    rotulo: "Ação vencida ou sem dono",
    fonte: "leads.proxima_acao_em (filas acoes_vencidas) + registros sem responsável no Painel Hoje",
    abaProprietaria: "hoje",
    apareceEm: ["hoje", "casos", "comercial"],
    rotaAcao: "/calls",
    filas: ["acoes_vencidas"],
    cobertura: "confirmado",
    leitura: "Prazo vencido ou registro operacional sem dono. Clique abre a fila, não outro card.",
  },
  {
    id: "bloqueio_ativo",
    rotulo: "Bloqueio ativo",
    fonte: "filas de bloqueio do Painel (contrato, pagamento, onboarding, documento) — um registro, uma exceção",
    abaProprietaria: "casos",
    apareceEm: ["hoje", "casos", "contratos", "pesquisa"],
    rotaAcao: "/ops-excecoes",
    filas: ["contratos_enviados_pendentes", "pagamentos_aguardados", "onboardings_pendentes", "casos_pendencia_documental"],
    cobertura: "confirmado",
    leitura: "Exceção acionável. Motivo e dono estão no Caso 360 / exceções.",
  },
  {
    id: "proximo_marco",
    rotulo: "Próximo marco",
    fonte: "case_plans (Planejador Universal)",
    abaProprietaria: "casos",
    apareceEm: ["hoje", "casos"],
    rotaAcao: "/casos",
    filas: [],
    cobertura: "SEM_DADO_SUFICIENTE",
    leitura: "O Painel Hoje ainda não lê case_plans. Sem número inventado — abre a jornada do caso.",
  },
  {
    id: "lead_discovery_parado",
    rotulo: "Lead/Discovery parado",
    fonte: "leads_sem_proxima_acao + discoveries_sem_desdobramento",
    abaProprietaria: "comercial",
    apareceEm: ["comercial", "hoje"],
    rotaAcao: "/calls",
    filas: ["leads_sem_proxima_acao", "discoveries_sem_desdobramento"],
    cobertura: "confirmado",
    leitura: "Call ou Discovery sem resultado, handoff ou próxima ação.",
  },
  {
    id: "lacuna_probatoria",
    rotulo: "Lacuna probatória prioritária",
    fonte: "casos_pendencia_documental (pedido/documento aguardado)",
    abaProprietaria: "pesquisa",
    apareceEm: ["pesquisa", "casos", "hoje"],
    rotaAcao: "/evidencias",
    filas: ["casos_pendencia_documental"],
    cobertura: "confirmado",
    leitura: "Documento ou evidência aguardada no caso. Abre evidências, não uma segunda lista.",
  },
  {
    id: "entrega_revisao",
    rotulo: "Entrega em revisão ou liberação",
    fonte: "client_deliverables / publicação autorizada",
    abaProprietaria: "casos",
    apareceEm: ["hoje", "casos", "pesquisa"],
    rotaAcao: "/atendimento",
    filas: [],
    cobertura: "SEM_DADO_SUFICIENTE",
    leitura: "O cockpit não conta microentrega aqui. Abre atendimento/publicação do caso.",
  },
  {
    id: "formalizacao_pendente",
    rotulo: "Formalização pendente",
    fonte: "contratos_enviados_pendentes",
    abaProprietaria: "contratos",
    apareceEm: ["contratos", "casos", "hoje"],
    rotaAcao: "/contratos",
    filas: ["contratos_enviados_pendentes"],
    cobertura: "confirmado",
    leitura: "Contrato enviado sem avanço. Não usa status visual sem versão.",
  },
  {
    id: "financeiro_sem_confirmacao",
    rotulo: "Financeiro sem confirmação",
    fonte: "pagamentos_aguardados — só registro transacional, nunca proposta ou previsão",
    abaProprietaria: "contratos",
    apareceEm: ["contratos", "hoje"],
    rotaAcao: "/financeiro",
    filas: ["pagamentos_aguardados"],
    cobertura: "confirmado",
    leitura: "Pagamento inicial aguardado. Não infere caixa por texto de proposta.",
  },
  {
    id: "conteudo_atraso",
    rotulo: "Conteúdo comercial em atraso",
    fonte: "editorial_content_items (Biblioteca de Mensagens)",
    abaProprietaria: "comercial",
    apareceEm: ["comercial", "hoje"],
    rotaAcao: "/biblioteca-mensagens",
    filas: [],
    cobertura: "SEM_DADO_SUFICIENTE",
    leitura: "Sem contagem no Painel. Abre o item editorial. Nada é publicado sozinho.",
  },
];

export type ContextoKpi = {
  daFila: (chave: string) => number;
  semResponsavel: number;
};

export type ValorKpi = {
  total: number | null;
  cobertura: CoberturaKpi;
  destino: string;
};

export function valorDoKpi(kpi: KpiTransversal, ctx: ContextoKpi): ValorKpi {
  if (kpi.cobertura !== "confirmado") {
    return { total: null, cobertura: kpi.cobertura, destino: kpi.rotaAcao };
  }
  if (kpi.id === "acao_vencida_sem_dono") {
    const vencidos = ctx.daFila("acoes_vencidas");
    const total = vencidos + ctx.semResponsavel;
    return {
      total,
      cobertura: "confirmado",
      destino: vencidos > 0 ? "/calls" : "/casos",
    };
  }
  if (kpi.id === "bloqueio_ativo") {
    return {
      total:
        ctx.daFila("contratos_enviados_pendentes") +
        ctx.daFila("pagamentos_aguardados") +
        ctx.daFila("onboardings_pendentes") +
        ctx.daFila("casos_pendencia_documental"),
      cobertura: "confirmado",
      destino: kpi.rotaAcao,
    };
  }
  const total = kpi.filas.reduce((acc, f) => acc + ctx.daFila(f), 0);
  return { total, cobertura: "confirmado", destino: kpi.rotaAcao };
}

export function daFilaDe(filas: Fila[], chave: string, incluirDemo = false): number {
  const itens = filas.find((f) => f.chave === chave)?.itens ?? [];
  if (incluirDemo) return itens.length;
  return itens.filter((i) => !/demo|demonstra|fixture|teste/i.test(i.rotulo)).length;
}

export function contextoDosKpis(filas: Fila[], incluirDemo = false): ContextoKpi {
  const itens = consolidarDia(filas, { incluirDemo });
  return {
    daFila: (chave) => daFilaDe(filas, chave, incluirDemo),
    semResponsavel: itens.filter((i) => i.semResponsavel).length,
  };
}

export function superficiesForaDoFluxoDiario(): readonly SuperficieClassificada[] {
  return CLASSIFICACAO_SUPERFICIES.filter((s) => !s.visivelNoFluxoDiario);
}

export function kpisDaAba(aba: AbaDesk): readonly KpiTransversal[] {
  return KPIS_TRANSVERSAIS.filter((k) => k.apareceEm.includes(aba));
}

/** Destinos de drill-down — rotas já existentes, sem fila copiada. */
export const ROTAS_ACAO_KPI = [
  "/calls",
  "/casos",
  "/ops-excecoes",
  "/evidencias",
  "/atendimento",
  "/contratos",
  "/financeiro",
  "/biblioteca-mensagens",
] as const;

export type RotaAcaoKpi = (typeof ROTAS_ACAO_KPI)[number];

export function rotaAcaoKpi(destino: string): RotaAcaoKpi {
  return (ROTAS_ACAO_KPI as readonly string[]).includes(destino)
    ? (destino as RotaAcaoKpi)
    : "/calls";
}
