/**
 * Indicadores de marketing, conversão e realidade financeira.
 *
 * Regras de honestidade: nada é inventado. Quando custo, receita, período ou
 * atribuição mínima faltam, o indicador devolve "Sem dados suficientes" — nunca
 * zero. Receita contratada nunca é somada à recebida; previsão nunca vira caixa;
 * despesa de terceiro nunca entra como custo do Clube.
 */

export type Periodo = { inicio: string; fim: string };

export type ValorIndicador =
  | { estado: "ok"; valor: number; unidade: "numero" | "moeda" | "percentual"; denominador?: number }
  | { estado: "sem_dados"; motivo: string };

export const SEM_DADOS = (motivo: string): ValorIndicador => ({ estado: "sem_dados", motivo });

export const numero = (valor: number, denominador?: number): ValorIndicador =>
  denominador === undefined ? { estado: "ok", valor, unidade: "numero" } : { estado: "ok", valor, unidade: "numero", denominador };
export const moeda = (valor: number): ValorIndicador => ({ estado: "ok", valor, unidade: "moeda" });

export function taxa(numerador: number, denominador: number, motivoSemDados = "Denominador indisponível no período."): ValorIndicador {
  if (!Number.isFinite(denominador) || denominador <= 0) return SEM_DADOS(motivoSemDados);
  return { estado: "ok", valor: Math.round((numerador / denominador) * 1000) / 10, unidade: "percentual", denominador };
}

export function formatarIndicador(v: ValorIndicador): string {
  if (v.estado === "sem_dados") return "Sem dados suficientes";
  if (v.unidade === "percentual") return `${v.valor.toFixed(1).replace(".", ",")}%`;
  if (v.unidade === "moeda")
    return v.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return String(v.valor);
}

/** Etapas canônicas do funil — cada passagem exige evento/data válida. */
export const ETAPAS_FUNIL = [
  { chave: "investimento_midia", rotulo: "Investimento em mídia" },
  { chave: "lead_captado", rotulo: "Lead captado" },
  { chave: "lead_qualificado", rotulo: "Lead qualificado/triagem" },
  { chave: "discovery_agendada", rotulo: "Discovery agendada" },
  { chave: "discovery_realizada", rotulo: "Discovery realizada" },
  { chave: "proposta_enviada", rotulo: "Diagnóstico/proposta enviada" },
  { chave: "aceite_verbal", rotulo: "Aceite verbal" },
  { chave: "confirmacao_formal", rotulo: "Confirmação formal" },
  { chave: "contrato_enviado", rotulo: "Contrato enviado" },
  { chave: "contrato_assinado", rotulo: "Contrato assinado" },
  { chave: "pagamento_inicial_confirmado", rotulo: "Pagamento inicial confirmado" },
  { chave: "onboarding_iniciado", rotulo: "Onboarding iniciado" },
  { chave: "caso_ativo", rotulo: "Caso ativo" },
] as const;

export type ChaveEtapa = (typeof ETAPAS_FUNIL)[number]["chave"];

export type BaseFunil = Partial<Record<ChaveEtapa, number>>;

export type EntradaFinanceira = {
  /** Investimento de mídia classificado e com período/categoria. */
  investimento_midia?: number | null;
  /** Leads atribuíveis a mídia (atribuição registrada). */
  leads_atribuiveis?: number | null;
  /** Pagamentos iniciais confirmados atribuíveis a mídia. */
  pagamentos_atribuiveis?: number | null;
  /** Receita recebida atribuível a mídia. */
  receita_atribuivel?: number | null;
  receita_recebida?: number | null;
  receita_contratada?: number | null;
  cobrancas_pendentes?: number | null;
  cobrancas_vencidas?: number | null;
  despesas_operacionais?: number | null;
  /** Fora do caixa do Clube — apresentada apenas como contexto. */
  despesas_terceiros_cliente?: number | null;
};

const val = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? n : null);

export function cpl(f: EntradaFinanceira): ValorIndicador {
  const custo = val(f.investimento_midia);
  const leads = val(f.leads_atribuiveis);
  if (custo === null) return SEM_DADOS("Investimento de mídia não registrado no período.");
  if (leads === null || leads <= 0) return SEM_DADOS("Atribuição incompleta: leads atribuíveis a mídia não registrados.");
  return moeda(Math.round(custo / leads));
}

export function cac(f: EntradaFinanceira): ValorIndicador {
  const custo = val(f.investimento_midia);
  const pagos = val(f.pagamentos_atribuiveis);
  if (custo === null) return SEM_DADOS("Investimento de mídia não registrado no período.");
  if (pagos === null || pagos <= 0) return SEM_DADOS("Atribuição incompleta: pagamentos iniciais atribuíveis não registrados.");
  return moeda(Math.round(custo / pagos));
}

export function roas(f: EntradaFinanceira): ValorIndicador {
  const custo = val(f.investimento_midia);
  const receita = val(f.receita_atribuivel);
  if (custo === null || custo <= 0) return SEM_DADOS("Investimento de mídia não registrado no período.");
  if (receita === null) return SEM_DADOS("Atribuição incompleta: receita recebida atribuível não registrada.");
  return { estado: "ok", valor: Math.round((receita / custo) * 100) / 100, unidade: "numero" };
}

export function roi(f: EntradaFinanceira): ValorIndicador {
  const custo = val(f.investimento_midia);
  const receita = val(f.receita_atribuivel);
  if (custo === null || custo <= 0) return SEM_DADOS("Investimento de mídia não registrado no período.");
  if (receita === null) return SEM_DADOS("Atribuição incompleta: receita recebida atribuível não registrada.");
  return { estado: "ok", valor: Math.round(((receita - custo) / custo) * 1000) / 10, unidade: "percentual" };
}

/** Caixa do período: receita RECEBIDA menos despesas do Clube e mídia. */
export function resultadoCaixa(f: EntradaFinanceira): ValorIndicador {
  const recebida = val(f.receita_recebida);
  if (recebida === null) return SEM_DADOS("Receita recebida não apurada no período.");
  const operacionais = val(f.despesas_operacionais) ?? 0;
  const midia = val(f.investimento_midia) ?? 0;
  return moeda(recebida - operacionais - midia);
}

export type LinhaFunil = {
  chave: ChaveEtapa;
  rotulo: string;
  volume: ValorIndicador;
  taxa_etapa_anterior: ValorIndicador;
};

/** Volume + taxa em relação à etapa anterior, sem inventar zero. */
export function montarFunil(base: BaseFunil): LinhaFunil[] {
  let anterior: number | null = null;
  return ETAPAS_FUNIL.filter((e) => e.chave !== "investimento_midia").map((e) => {
    const v = val(base[e.chave] ?? null);
    const linha: LinhaFunil = {
      chave: e.chave,
      rotulo: e.rotulo,
      volume: v === null ? SEM_DADOS("Etapa sem evento registrado no período.") : numero(v),
      taxa_etapa_anterior:
        v === null || anterior === null
          ? SEM_DADOS("Etapa anterior sem base comparável.")
          : taxa(v, anterior),
    };
    if (v !== null) anterior = v;
    return linha;
  });
}

export type Previsao = { chave: string; rotulo: string; valor: ValorIndicador; conta_como_receita: false };

/** Previsões nunca somam ao caixa. */
export function previsoesControladas(p: {
  contratada_nao_recebida?: number | null;
  em_formalizacao?: number | null;
  em_proposta?: number | null;
}): Previsao[] {
  const item = (chave: string, rotulo: string, n: number | null | undefined): Previsao => ({
    chave,
    rotulo,
    valor: val(n) === null ? SEM_DADOS("Sem base homologada no período.") : moeda(val(n) as number),
    conta_como_receita: false,
  });
  return [
    item("contratada", "Previsão contratada — contratos assinados sem recebimento", p.contratada_nao_recebida),
    item("formalizacao", "Previsão em formalização — não é receita", p.em_formalizacao),
    item("proposta", "Previsão de proposta — não é receita", p.em_proposta),
  ];
}

export type SinalMarketing = {
  codigo: string;
  texto: string;
  rota: string;
  severidade: "critico" | "atencao";
  /** Ação operacional esperada (linguagem de execução, nunca métrica pura). */
  acao?: string;
  /** Rótulo do destino onde a ação é executada. */
  destino?: string;
};

/** Ação e destino operacional de cada sinal — camada de leitura do Painel Hoje. */
export const ACAO_SINAL: Record<string, { acao: string; destino: string }> = {
  midia_sem_leads: { acao: "Revisar atribuição de origem e campanha do período", destino: "Indicadores" },
  origem_ausente: { acao: "Preencher origem do lead na ficha", destino: "CRM de leads" },
  discovery_parada: { acao: "Definir proposta ou decisão da Discovery", destino: "CRM de leads" },
  proposta_sem_followup: { acao: "Cobrar retorno da proposta e registrar o contato", destino: "Conversão" },
  aceite_parado: { acao: "Obter confirmação formal por escrito", destino: "Conversão" },
  contrato_sem_financeiro: { acao: "Vincular referência financeira ao contrato assinado", destino: "Financeiro" },
  pagamento_sem_onboarding: { acao: "Iniciar onboarding do caso pago", destino: "Casos 360" },
  midia_sem_classificacao: { acao: "Classificar custo de mídia por campanha e período", destino: "Financeiro" },
};

/** Sinais diários derivados de marketing e conversão (Painel Hoje e /conversao). */
export function sinaisMarketing(dados: {
  investimento_midia?: number | null;
  leads_atribuiveis?: number | null;
  leads_sem_origem?: number;
  discoveries_sem_desdobramento?: number;
  propostas_sem_followup?: number;
  aceites_verbais_parados?: number;
  contratos_sem_referencia_financeira?: number;
  pagamentos_sem_onboarding?: number;
  custo_midia_sem_classificacao?: number;
}): SinalMarketing[] {
  const s: SinalMarketing[] = [];
  const add = (codigo: string, texto: string, rota: string, severidade: SinalMarketing["severidade"] = "atencao") =>
    s.push({ codigo, texto, rota, severidade, ...(ACAO_SINAL[codigo] ?? {}) });

  if ((val(dados.investimento_midia) ?? 0) > 0 && (val(dados.leads_atribuiveis) ?? 0) === 0)
    add("midia_sem_leads", "Investimento de mídia registrado sem leads atribuídos no período.", "/governanca/indicadores");
  if (dados.leads_sem_origem) add("origem_ausente", `${dados.leads_sem_origem} lead(s) sem origem preenchida.`, "/leads");
  if (dados.discoveries_sem_desdobramento)
    add("discovery_parada", `${dados.discoveries_sem_desdobramento} Discovery realizada sem proposta ou decisão após o prazo.`, "/leads");
  if (dados.propostas_sem_followup)
    add("proposta_sem_followup", `${dados.propostas_sem_followup} proposta(s) com follow-up vencido.`, "/conversao");
  if (dados.aceites_verbais_parados)
    add("aceite_parado", `${dados.aceites_verbais_parados} aceite verbal sem confirmação formal.`, "/conversao");
  if (dados.contratos_sem_referencia_financeira)
    add(
      "contrato_sem_financeiro",
      `${dados.contratos_sem_referencia_financeira} contrato assinado sem referência financeira válida.`,
      "/financeiro",
      "critico",
    );
  if (dados.pagamentos_sem_onboarding)
    add("pagamento_sem_onboarding", `${dados.pagamentos_sem_onboarding} pagamento confirmado sem onboarding iniciado.`, "/casos", "critico");
  if (dados.custo_midia_sem_classificacao)
    add("midia_sem_classificacao", `${dados.custo_midia_sem_classificacao} custo de mídia sem categoria, campanha ou período.`, "/financeiro");
  return s;
}
