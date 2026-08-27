/**
 * MARKETING E AQUISIÇÃO — registro canônico (CA-UX-04, aba 2 do Desk).
 *
 * Módulo puro: declara fronteira Marketing × Comercial, o mapa do que existe
 * hoje, as métricas com sua fonte e confiança, e os canais com handoff.
 * Não executa ação externa, não configura campanha, não cria link, não envia
 * WhatsApp e não altera dado. Todo cálculo aqui é derivação de leitura.
 */

import {
  cac as calcularCac,
  roi as calcularRoi,
  formatarIndicador,
  type EntradaFinanceira,
  type ValorIndicador,
} from "@/lib/indicadores-marketing";

export type EstadoItem = "implementado" | "parcial" | "ausente" | "a_confirmar";
export type Confianca = "alta" | "media" | "baixa" | "sem_dados";

export const SEM_DADOS = "Sem dados suficientes";

/* ------------------------------------------------------------------ */
/* Fronteira obrigatória Marketing × Comercial                         */
/* ------------------------------------------------------------------ */

export const FRONTEIRA_MARKETING_COMERCIAL = {
  marketing:
    "Aquisição, campanha, conteúdo, atribuição e análise de canal — antes de existir lead identificado.",
  comercial:
    "Lead identificado, triagem, calls, diagnóstico, proposta, aceite verbal, confirmação formal e formalização.",
  regra:
    "Marketing analisa canal e origem; Comercial é dono do lead. Marketing nunca duplica a lista de leads: só linka para Comercial.",
} as const;

/* ------------------------------------------------------------------ */
/* Seções da aba Marketing                                             */
/* ------------------------------------------------------------------ */

export type SecaoMarketing = {
  hash: string;
  titulo: string;
  descricao: string;
};

export const SECOES_MARKETING: readonly SecaoMarketing[] = [
  {
    // 27/08/2026 — "o que é indicador vira realidade no topo" (Proprietária),
    // mesma lógica já aplicada em Casos 360. Prontidão de atribuição, os 5
    // principais (CAC/ROI incluídos) e desempenho por canal — tudo que já é
    // sinal, não lista — sai do meio da página e vira o primeiro bloco.
    hash: "indicadores",
    titulo: "Indicadores",
    descricao: "Prontidão de atribuição, CAC, ROI e desempenho por canal — tudo que já é sinal, no topo.",
  },
  {
    hash: "visao-geral",
    titulo: "Visão geral de aquisição",
    descricao: "Leitura única do que entrou por aquisição no recorte atual.",
  },
  {
    hash: "canais-campanhas",
    titulo: "Canais e campanhas",
    descricao: "Campanhas, fontes e investimentos registrados. O catálogo de origem em si mora em Atribuição e origem; desempenho por canal mora em Indicadores.",
  },
  {
    hash: "conteudo-ctas",
    titulo: "Conteúdo e CTAs",
    descricao: "Ponte para a Biblioteca de Mensagens e Conteúdos, onde o conteúdo editorial é governado de verdade.",
  },
  {
    hash: "atribuicao",
    titulo: "Atribuição e origem",
    descricao: "UTM, canal e origem atribuída ao contato. Sem captura pública ativa, permanece lacuna declarada.",
  },
  {
    hash: "funil-aquisicao",
    titulo: "Funil de aquisição",
    descricao: "Da origem até o handoff para Comercial, com contagem real de leads sobreposta à referência de risco.",
  },
  {
    hash: "aprendizados",
    titulo: "Aprendizados das campanhas",
    descricao: "Registro interno de leitura de canal. Nenhuma conclusão vira ação automática.",
  },
  {
    hash: "links-comercial",
    titulo: "Links contextuais para Comercial",
    descricao: "Atalhos para a superfície comercial. A lista de leads continua sendo só de Comercial.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* J. Marketing atual → estado → lacuna → destino                      */
/* ------------------------------------------------------------------ */

export type LinhaMapaMarketing = {
  item: string;
  rota: string;
  fonte: string;
  estado: EstadoItem;
  integracao: "real" | "mock" | "inexistente";
  permissao: string;
  dependencia: string;
  riscoDuplicacao: "alto" | "medio" | "baixo" | "nenhum";
  lacuna: string;
  destino: string;
};

export const MAPA_MARKETING: readonly LinhaMapaMarketing[] = [
  {
    item: "Bloco marketing dentro de Conversão",
    rota: "/conversao",
    fonte: "conversion_events, marketing_investments, marketing_campaigns, lead_sources",
    estado: "parcial",
    integracao: "real",
    permissao: "admin, comercial, operações",
    dependencia: "organization_id, catálogo de origens",
    riscoDuplicacao: "alto",
    lacuna: "Aquisição vivia dentro do funil comercial.",
    destino: "Marketing → Visão geral de aquisição",
  },
  {
    item: "Campanhas",
    rota: "/marketing#canais-campanhas",
    fonte: "marketing_campaigns (canal, utm_source, utm_medium, utm_campaign, status)",
    estado: "ausente",
    integracao: "real",
    permissao: "admin, comercial",
    dependencia: "lead_sources",
    riscoDuplicacao: "medio",
    lacuna: "Tabela existe sem registros e sem cadastro na interface.",
    destino: "Marketing → Canais e campanhas",
  },
  {
    item: "Investimento de mídia",
    rota: "/marketing#metricas-canal",
    fonte: "marketing_investments (canal, valor, competência, origem_dado)",
    estado: "ausente",
    integracao: "real",
    permissao: "admin, financeiro",
    dependencia: "competência financeira",
    riscoDuplicacao: "baixo",
    lacuna: "Sem lançamento de custo classificado, CAC e ROI não calculam.",
    destino: "Marketing → Métricas por canal",
  },
  {
    item: "Catálogo de origens de lead",
    rota: "/marketing#atribuicao",
    fonte: "lead_sources (nome, canal, tipo)",
    estado: "ausente",
    integracao: "real",
    permissao: "admin",
    dependencia: "—",
    riscoDuplicacao: "medio",
    lacuna: "Origem do lead é texto livre; sem taxonomia fechada.",
    destino: "Marketing → Atribuição e origem",
  },
  {
    item: "Atribuição e UTM",
    rota: "/marketing#atribuicao",
    fonte: "attribution_records (utm_source, utm_medium, utm_campaign, canal, valor_convertido)",
    estado: "ausente",
    integracao: "real",
    permissao: "admin",
    dependencia: "captura de UTM em formulário público (inexistente)",
    riscoDuplicacao: "baixo",
    lacuna: "UTM só existe como mapa de importação legada.",
    destino: "Marketing → Atribuição e origem",
  },
  {
    item: "Eventos de conversão",
    rota: "/marketing#funil-aquisicao",
    fonte: "conversion_events (origem, canal, lead_source_id)",
    estado: "parcial",
    integracao: "real",
    permissao: "admin, comercial",
    dependencia: "leads, casos",
    riscoDuplicacao: "alto",
    lacuna: "Eventos sem lead_source_id preenchido: leitura por canal fica incompleta.",
    destino: "Marketing → Funil de aquisição (leitura) + link para Comercial",
  },
  {
    // 27/08/2026 — corrigido: esta linha dizia integração "real" com
    // editorial_content_items, mas /marketing nunca consultava essa tabela.
    // Quem consulta de verdade é message-library.functions.ts, em
    // /biblioteca-mensagens. Marketing agora só aponta pra lá (ponte, não
    // consulta própria) — "destino" reflete isso.
    item: "Conteúdo editorial e CTAs",
    rota: "/marketing#conteudo-ctas",
    fonte: "editorial_content_items",
    estado: "ausente",
    integracao: "inexistente",
    permissao: "admin, operações",
    dependencia: "—",
    riscoDuplicacao: "baixo",
    lacuna: "Conteúdo é governado em /biblioteca-mensagens, não em Marketing. Sem CTA rastreável, também não gera origem atribuível.",
    destino: "Biblioteca de Mensagens e Conteúdos (/biblioteca-mensagens) — Marketing só linka",
  },
  {
    item: "Site, landing page e formulário público",
    rota: "/ (vitrine institucional)",
    fonte: "estático",
    estado: "ausente",
    integracao: "mock",
    permissao: "público",
    dependencia: "—",
    riscoDuplicacao: "nenhum",
    lacuna: "Não existe página pública de captura própria nem formulário com UTM.",
    destino: "Marketing → Conteúdo e CTAs (backlog declarado)",
  },
  {
    item: "Google Ads e Meta",
    rota: "/integracoes",
    fonte: "integrations (registro 'WhatsApp / Meta', status desligada)",
    estado: "ausente",
    integracao: "inexistente",
    permissao: "admin",
    dependencia: "decisão externa da Proprietária",
    riscoDuplicacao: "nenhum",
    lacuna: "Sem custo, sem campanha e sem pixel. Nenhuma conexão autorizada.",
    destino: "Marketing → Canais e campanhas (entrada manual antes de qualquer integração)",
  },
  {
    item: "CAC, ROI e ROAS",
    rota: "/marketing#metricas-canal",
    fonte: "marketing_investments + attribution_records + payments confirmados",
    estado: "parcial",
    integracao: "real",
    permissao: "admin, financeiro",
    dependencia: "investimento classificado + atribuição válida",
    riscoDuplicacao: "baixo",
    lacuna: "Definição pronta, dado ausente: exibe “Sem dados suficientes”, nunca estimativa.",
    destino: "Marketing → Métricas por canal",
  },
  {
    item: "Indicação",
    rota: "/marketing#atribuicao",
    fonte: "leads.origem = 'indicacao'",
    estado: "parcial",
    integracao: "real",
    permissao: "admin, comercial",
    dependencia: "registro de quem indicou",
    riscoDuplicacao: "medio",
    lacuna: "Sem indicador identificado, não há crédito nem análise de canal.",
    destino: "Marketing → Atribuição e origem",
  },
  {
    item: "WhatsApp como origem atribuída",
    rota: "/marketing#atribuicao",
    fonte: "leads.origem, conversion_events.canal, attribution_records.canal",
    estado: "ausente",
    integracao: "real",
    permissao: "admin, comercial",
    dependencia: "valor canônico de canal",
    riscoDuplicacao: "medio",
    lacuna: "Nenhum registro atribui WhatsApp como origem.",
    destino: "Marketing → Atribuição e origem",
  },
] as const;

/* ------------------------------------------------------------------ */
/* WhatsApp em camadas separadas (origem ≠ automação)                  */
/* ------------------------------------------------------------------ */

export const CAMADAS_WHATSAPP: readonly {
  camada: string;
  natureza: "marketing" | "comercial" | "operacao" | "externo";
  onde: string;
  estado: EstadoItem;
  regra: string;
}[] = [
  {
    camada: "WhatsApp como origem atribuída",
    natureza: "marketing",
    onde: "leads.origem · conversion_events.canal · attribution_records.canal",
    estado: "ausente",
    regra: "Só classificação de origem. Ser origem de lead não transforma WhatsApp em automação de marketing.",
  },
  {
    camada: "Histórico e registro comercial",
    natureza: "comercial",
    onde: "touchpoints · crm_interactions",
    estado: "implementado",
    regra: "Registro imutável de interação; pertence a Comercial, não a Marketing.",
  },
  {
    camada: "Preview e espelho de comunicação",
    natureza: "operacao",
    onde: "/biblioteca-mensagens · templates de WhatsApp",
    estado: "implementado",
    regra: "Somente leitura e cópia manual. Nenhum disparo.",
  },
  {
    camada: "Fila de mensagens",
    natureza: "operacao",
    onde: "communication_queue · /atendimento",
    estado: "implementado",
    regra: "Rascunho interno aguardando decisão humana. Nunca envia sozinho.",
  },
  {
    camada: "Envio externo real",
    natureza: "externo",
    onde: "integrations (WhatsApp / Meta — desligada)",
    estado: "ausente",
    regra: "Ação externa: exige confirmação final explícita da Proprietária. Não autorizada.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* K. Métrica → fonte → cálculo → confiança                            */
/* ------------------------------------------------------------------ */

export type MetricaMarketing = {
  chave: string;
  nome: string;
  fonte: string;
  calculo: string;
  confianca: Confianca;
  observacao: string;
};

export const METRICAS_MARKETING: readonly MetricaMarketing[] = [
  {
    chave: "leads_por_origem",
    nome: "Leads por origem",
    fonte: "leads.origem",
    calculo: "Contagem de leads por origem no recorte.",
    confianca: "baixa",
    observacao: "Origem é texto livre, sem taxonomia fechada em lead_sources.",
  },
  {
    chave: "conversoes_por_canal",
    nome: "Conversões por origem e canal",
    fonte: "conversion_events",
    calculo: "Agrupa eventos por origem · canal.",
    confianca: "baixa",
    observacao: "Eventos sem lead_source_id não sustentam análise por campanha.",
  },
  {
    chave: "investimento_por_canal",
    nome: "Investimento por canal",
    fonte: "marketing_investments",
    calculo: "Soma de valor por canal e competência.",
    confianca: "sem_dados",
    observacao: "Sem lançamento classificado.",
  },
  {
    chave: "cac",
    nome: "CAC",
    fonte: "marketing_investments + attribution_records",
    calculo: "Investimento classificado ÷ leads atribuíveis no período.",
    confianca: "sem_dados",
    observacao: "Sem custo ou sem atribuição, retorna “Sem dados suficientes” — nunca estimativa.",
  },
  {
    chave: "roi",
    nome: "ROI / ROAS",
    fonte: "marketing_investments + payments confirmados",
    calculo: "Receita atribuída recebida ÷ investimento classificado.",
    confianca: "sem_dados",
    observacao: "Sem atribuição de receita é lacuna de dado, nunca falha comercial.",
  },
  {
    chave: "trafego_whatsapp",
    nome: "Tráfego até WhatsApp",
    fonte: "—",
    calculo: "Cliques rastreados em link de origem até a conversa.",
    confianca: "sem_dados",
    observacao: "Não medível: não há site nem link rastreável próprio.",
  },
  {
    chave: "funil_ate_proposta",
    nome: "Funil até diagnóstico e proposta",
    fonte: "leads, crm_casos, proposals (Comercial)",
    calculo: "Contagem por etapa do funil comercial.",
    confianca: "media",
    observacao: "Dado comercial real; ainda sem eixo de canal de origem.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* L. Canal → origem de lead → handoff → risco                         */
/* ------------------------------------------------------------------ */

export const CANAIS_HANDOFF: readonly {
  canal: string;
  origemGravada: string;
  handoff: string;
  risco: string;
}[] = [
  {
    canal: "Formulário (interno / demo)",
    origemGravada: "formulario",
    handoff: "Cria lead → triagem em Comercial",
    risco: "Integração de formulário desligada; dado demo não pode ser lido como real.",
  },
  {
    canal: "Indicação",
    origemGravada: "indicacao",
    handoff: "Lead → triagem em Comercial",
    risco: "Sem registro de quem indicou; atribuição impossível.",
  },
  {
    canal: "Manual (equipe)",
    origemGravada: "manual",
    handoff: "Lead direto em Comercial",
    risco: "Sem canal real de origem; polui métrica de aquisição.",
  },
  {
    canal: "WhatsApp",
    origemGravada: "não atribuído",
    handoff: "Conversa registrada em touchpoints (Comercial)",
    risco: "Confundir origem com automação; envio externo permanece bloqueado.",
  },
  {
    canal: "Google Ads / Meta",
    origemGravada: "inexistente",
    handoff: "—",
    risco: "Sem UTM na entrada, a atribuição nasceria quebrada.",
  },
  {
    canal: "Conteúdo / orgânico",
    origemGravada: "inexistente",
    handoff: "—",
    risco: "CTA sem link rastreável.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Derivações de leitura                                               */
/* ------------------------------------------------------------------ */

export type LinhaInvestimentoCanal = { canal?: string | null; valor?: number | null };
export type LinhaAtribuicaoCanal = {
  canal?: string | null;
  case_id?: string | null;
  lead_id?: string | null;
  valor_convertido?: number | null;
};
export type LinhaCasoPagamento = { id?: string | null; pagamento_confirmado?: boolean | null };

export type EntradaAquisicao = {
  leads: readonly { origem?: string | null; canal?: string | null }[];
  eventos: readonly { origem?: string | null; canal?: string | null }[];
  investimentos: readonly LinhaInvestimentoCanal[];
  campanhas: readonly unknown[];
  fontes: readonly unknown[];
  atribuicoes: readonly LinhaAtribuicaoCanal[];
  /** Só para checar pagamento confirmado por atribuição — opcional para não quebrar fixture de teste. */
  casos?: readonly LinhaCasoPagamento[];
};

export type ResumoOrigem = { rotulo: string; leads: number; eventos: number };

/** Agrupa leads e eventos por origem·canal. Nunca inventa origem ausente. */
export function resumoPorOrigem(entrada: EntradaAquisicao): ResumoOrigem[] {
  const mapa = new Map<string, ResumoOrigem>();
  const chave = (o?: string | null, c?: string | null) =>
    [o, c].filter(Boolean).join(" · ") || "Origem não informada";
  for (const l of entrada.leads) {
    const k = chave(l.origem, l.canal);
    const atual = mapa.get(k) ?? { rotulo: k, leads: 0, eventos: 0 };
    atual.leads += 1;
    mapa.set(k, atual);
  }
  for (const e of entrada.eventos) {
    const k = chave(e.origem, e.canal);
    const atual = mapa.get(k) ?? { rotulo: k, leads: 0, eventos: 0 };
    atual.eventos += 1;
    mapa.set(k, atual);
  }
  return [...mapa.values()].sort((a, b) => b.leads + b.eventos - (a.leads + a.eventos));
}

export type LeituraMetrica = { chave: string; nome: string; valor: string; confianca: Confianca; nota: string };

/**
 * Valor exibível de cada métrica a partir do que existe hoje.
 * Sem fonte suficiente, devolve exatamente `SEM_DADOS` — nunca estimativa.
 */
export function leituraMetricas(entrada: EntradaAquisicao): LeituraMetrica[] {
  const totalLeads = entrada.leads.length;
  const comOrigem = entrada.leads.filter((l) => Boolean(l.origem)).length;
  const temInvestimento = entrada.investimentos.length > 0;
  const temAtribuicao = entrada.atribuicoes.length > 0;

  return METRICAS_MARKETING.map((m) => {
    switch (m.chave) {
      case "leads_por_origem":
        return {
          chave: m.chave,
          nome: m.nome,
          valor: totalLeads ? `${comOrigem}/${totalLeads} com origem` : SEM_DADOS,
          confianca: totalLeads ? m.confianca : "sem_dados",
          nota: m.observacao,
        };
      case "conversoes_por_canal":
        return {
          chave: m.chave,
          nome: m.nome,
          valor: entrada.eventos.length ? `${entrada.eventos.length} evento(s)` : SEM_DADOS,
          confianca: entrada.eventos.length ? m.confianca : "sem_dados",
          nota: m.observacao,
        };
      case "investimento_por_canal":
        return {
          chave: m.chave,
          nome: m.nome,
          valor: temInvestimento ? `${entrada.investimentos.length} lançamento(s)` : SEM_DADOS,
          confianca: temInvestimento ? "media" : "sem_dados",
          nota: m.observacao,
        };
      case "cac":
      case "roi": {
        const agregado = desempenhoAgregado(entrada);
        const v = m.chave === "cac" ? agregado.cac : agregado.roi;
        return {
          chave: m.chave,
          nome: m.nome,
          valor: formatarIndicador(v),
          confianca: v.estado === "ok" ? "media" : "sem_dados",
          nota: m.observacao,
        };
      }
      default:
        return { chave: m.chave, nome: m.nome, valor: SEM_DADOS, confianca: m.confianca, nota: m.observacao };
    }
  });
}

/** Nenhuma ação externa é oferecida por esta superfície. */
export const ACOES_EXTERNAS_BLOQUEADAS: readonly string[] = [
  "Conectar API de Google Ads ou Meta",
  "Criar ou alterar campanha e anúncio",
  "Criar link rastreável público",
  "Disparar WhatsApp ou qualquer mensagem",
  "Publicar página, conteúdo ou formulário",
] as const;

/* ------------------------------------------------------------------ */
/* Estados vazios canônicos (CA-UX-04)                                 */
/* ------------------------------------------------------------------ */

/** Textos exatos aprovados. Nenhum deles pode ser substituído por estimativa. */
export const VAZIOS_MARKETING = {
  campanhas: "Ainda não há campanhas cadastradas.",
  investimento: "Ainda não há investimento classificado por canal.",
  atribuicao: "Registre campanha e UTM antes de analisar atribuição.",
  cacRoi: "CAC, ROI e ROAS exigem investimento classificado e atribuição confiável.",
  captura: "Não há formulário público ou captura de UTM conectada.",
  whatsapp: "WhatsApp ainda não está atribuído como origem de lead.",
  handoff: "Os leads identificados seguem para o Comercial.",
} as const;

/* ------------------------------------------------------------------ */
/* Catálogo governado de origem (lead_sources) e origem_a_confirmar    */
/* ------------------------------------------------------------------ */

export const ORIGEM_A_CONFIRMAR = "origem_a_confirmar";

/**
 * Catálogo interno de origens. Valores históricos em texto livre continuam
 * gravados: quando não pertencem ao catálogo, a leitura mostra
 * `origem_a_confirmar` sem converter o dado e sem bloquear o Comercial.
 *
 * 27/08/2026 — unificado com `ORIGENS_LEAD` (`crm-desk.ts`, a lista que
 * `/leads` grava de verdade). Antes deste ajuste, um lead com
 * `origem="instagram"` (valor válido em `/leads` e `/metricas`) caía em
 * "origem a confirmar" aqui — mesma pessoa, dois catálogos. Os seis valores
 * que faltavam entraram; nenhum valor existente saiu.
 */
export const CATALOGO_ORIGENS: readonly { valor: string; rotulo: string; observacao: string }[] = [
  { valor: "formulario", rotulo: "Formulário", observacao: "Captura pública não conectada." },
  { valor: "indicacao", rotulo: "Indicação", observacao: "Sem registro de quem indicou." },
  { valor: "manual", rotulo: "Manual (equipe)", observacao: "Entrada operada pela equipe." },
  { valor: "whatsapp", rotulo: "WhatsApp", observacao: "Só vale como origem se o valor canônico for gravado." },
  { valor: "instagram", rotulo: "Instagram", observacao: "Sem investimento/campanha vinculado nesta leitura." },
  { valor: "meta_ads", rotulo: "Meta Ads", observacao: "Atribuição de mídia depende de investimento lançado no período." },
  { valor: "google", rotulo: "Google", observacao: "Atribuição de mídia depende de investimento lançado no período." },
  { valor: "site", rotulo: "Site", observacao: "Captura pública não conectada." },
  { valor: "evento", rotulo: "Evento / encontro", observacao: "Registro manual." },
  { valor: "parceria", rotulo: "Parceria", observacao: "Registro manual." },
  { valor: "base_legada", rotulo: "Base legada/importação", observacao: "Origem histórica migrada, sem atribuição de mídia." },
  { valor: "outra_origem", rotulo: "Outra origem declarada", observacao: "Fora do catálogo padrão; registrada como está." },
] as const;

export type LeituraOrigem = {
  /** Valor exatamente como está gravado (nunca alterado). */
  bruto: string | null;
  /** Valor canônico do catálogo, ou `origem_a_confirmar`. */
  canonico: string;
  rotulo: string;
  noCatalogo: boolean;
};

/** Classifica a origem gravada sem alterar o dado de origem. */
export function classificarOrigem(bruto?: string | null): LeituraOrigem {
  const chave = (bruto ?? "").trim().toLowerCase();
  const item = CATALOGO_ORIGENS.find((c) => c.valor === chave);
  if (!item) {
    return { bruto: bruto ?? null, canonico: ORIGEM_A_CONFIRMAR, rotulo: "Origem a confirmar", noCatalogo: false };
  }
  return { bruto: bruto ?? null, canonico: item.valor, rotulo: item.rotulo, noCatalogo: true };
}

/** Distribuição de origens do recorte, com o balde `origem_a_confirmar`. */
export function distribuicaoOrigens(
  leads: readonly { origem?: string | null }[],
): { canonico: string; rotulo: string; total: number }[] {
  const mapa = new Map<string, { canonico: string; rotulo: string; total: number }>();
  for (const l of leads) {
    const c = classificarOrigem(l.origem);
    const atual = mapa.get(c.canonico) ?? { canonico: c.canonico, rotulo: c.rotulo, total: 0 };
    atual.total += 1;
    mapa.set(c.canonico, atual);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

const CANAL_SEM_ATRIBUICAO_LOCAL = "sem_atribuicao";
const canalDe = (v?: string | null) => (v ?? "").trim() || CANAL_SEM_ATRIBUICAO_LOCAL;

export type DesempenhoCanal = {
  canal: string;
  investimento: ValorIndicador;
  pagamentosAtribuidos: number;
  cac: ValorIndicador;
  roi: ValorIndicador;
};

/**
 * 27/08/2026 — CAC e ROI por canal, de verdade, não a leitura fixa
 * "Calculável — revisar classificação" que existia antes. Investimento vem
 * de `marketing_investments.valor`; pagamento atribuído só conta quando o
 * caso ligado à atribuição tem `pagamento_confirmado = true` — nunca conta
 * lead ou proposta como venda. Sem investimento nem atribuição no canal,
 * devolve "Sem dados suficientes" (nunca estimativa).
 */
function agregarPorCanal(entrada: EntradaAquisicao): Map<string, EntradaFinanceira & { pagamentos: number }> {
  const pagosPorCasoId = new Map<string, boolean>();
  for (const c of entrada.casos ?? []) {
    if (c.id) pagosPorCasoId.set(String(c.id), Boolean(c.pagamento_confirmado));
  }

  const porCanal = new Map<string, EntradaFinanceira & { pagamentos: number }>();
  const linha = (canal: string) => {
    const atual = porCanal.get(canal) ?? {
      investimento_midia: 0,
      pagamentos_atribuiveis: 0,
      receita_atribuivel: 0,
      pagamentos: 0,
    };
    porCanal.set(canal, atual);
    return atual;
  };

  for (const inv of entrada.investimentos) {
    const l = linha(canalDe(inv.canal));
    l.investimento_midia = (l.investimento_midia ?? 0) + (typeof inv.valor === "number" ? inv.valor : 0);
  }

  for (const atr of entrada.atribuicoes) {
    const pago = atr.case_id ? (pagosPorCasoId.get(String(atr.case_id)) ?? false) : false;
    if (!pago) continue;
    const l = linha(canalDe(atr.canal));
    l.pagamentos = (l.pagamentos ?? 0) + 1;
    l.pagamentos_atribuiveis = l.pagamentos;
    l.receita_atribuivel = (l.receita_atribuivel ?? 0) + (typeof atr.valor_convertido === "number" ? atr.valor_convertido : 0);
  }

  return porCanal;
}

/** Desempenho por canal — a mesma leitura que alimenta CAC/ROI, agora por linha, não só o total. */
export function desempenhoPorCanal(entrada: EntradaAquisicao): DesempenhoCanal[] {
  const porCanal = agregarPorCanal(entrada);
  return [...porCanal.entries()]
    .map(([canal, f]) => ({
      canal,
      investimento: f.investimento_midia ? { estado: "ok" as const, valor: f.investimento_midia, unidade: "moeda" as const } : { estado: "sem_dados" as const, motivo: "Sem lançamento de investimento neste canal." },
      pagamentosAtribuidos: f.pagamentos,
      cac: calcularCac(f),
      roi: calcularRoi(f),
    }))
    .sort((a, b) => (b.investimento.estado === "ok" ? b.investimento.valor : 0) - (a.investimento.estado === "ok" ? a.investimento.valor : 0));
}

/** CAC/ROI agregados — todo canal somado, para o card único em "5 principais". */
export function desempenhoAgregado(entrada: EntradaAquisicao): { cac: ValorIndicador; roi: ValorIndicador } {
  const porCanal = agregarPorCanal(entrada);
  const total: EntradaFinanceira = { investimento_midia: 0, pagamentos_atribuiveis: 0, receita_atribuivel: 0 };
  for (const f of porCanal.values()) {
    total.investimento_midia = (total.investimento_midia ?? 0) + (f.investimento_midia ?? 0);
    total.pagamentos_atribuiveis = (total.pagamentos_atribuiveis ?? 0) + (f.pagamentos_atribuiveis ?? 0);
    total.receita_atribuivel = (total.receita_atribuivel ?? 0) + (f.receita_atribuivel ?? 0);
  }
  return { cac: calcularCac(total), roi: calcularRoi(total) };
}

export { formatarIndicador };

/**
 * Aprendizados derivados do desempenho por canal — nunca uma lista fixa.
 * Sem canal com CAC calculável, devolve leitura honesta de lacuna, não uma
 * frase genérica de "aprendizado".
 */
export function aprendizadosCampanha(entrada: EntradaAquisicao): string[] {
  const linhas = desempenhoPorCanal(entrada);
  const comCac = linhas.filter((l) => l.cac.estado === "ok");
  const semRetorno = linhas.filter((l) => l.investimento.estado === "ok" && l.pagamentosAtribuidos === 0);

  if (!linhas.length) return ["Sem investimento ou atribuição registrada — nenhum aprendizado de canal ainda é derivável."];

  const out: string[] = [];
  if (comCac.length) {
    const melhor = [...comCac].sort((a, b) => (a.cac as { valor: number }).valor - (b.cac as { valor: number }).valor)[0];
    out.push(`Melhor CAC apurado: ${melhor.canal} (${formatarIndicador(melhor.cac)}).`);
  }
  for (const l of semRetorno) {
    out.push(`${l.canal} teve investimento lançado sem nenhum pagamento atribuído até agora — revisar antes de repetir aporte.`);
  }
  if (!out.length) out.push("Investimento e atribuição existem, mas nenhum canal tem pagamento confirmado atribuído ainda.");
  return out;
}

/* ------------------------------------------------------------------ */
/* Teto de 5 métricas principais em Marketing                          */
/* ------------------------------------------------------------------ */

export const TETO_METRICAS_MARKETING = 5;

/** Chaves de decisão exibidas no topo. As demais vão para "Histórico e análise". */
export const METRICAS_PRINCIPAIS_MARKETING: readonly string[] = [
  "leads_por_origem",
  "conversoes_por_canal",
  "investimento_por_canal",
  "cac",
  "roi",
] as const;

export function separarMetricas(leitura: readonly LeituraMetrica[]): {
  principais: LeituraMetrica[];
  historico: LeituraMetrica[];
} {
  const principais = leitura.filter((m) => METRICAS_PRINCIPAIS_MARKETING.includes(m.chave));
  const historico = leitura.filter((m) => !METRICAS_PRINCIPAIS_MARKETING.includes(m.chave));
  return { principais: principais.slice(0, TETO_METRICAS_MARKETING), historico };
}
