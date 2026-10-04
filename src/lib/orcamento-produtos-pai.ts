/**
 * Calculadora de orçamento regida por PRODUTO-PAI e país (v3.0, 04/10/2026).
 *
 * Executa a cláusula `CALCULADORA DE ORÇAMENTO` do documento
 * "Calculadora de Orçamento por Produto-Pai e Tabela de Preços Vigente"
 * (v3.0), que a Proprietária aprovou hoje — e que até agora era especificação
 * lida, não código:
 *
 *   - lê produto_pai, trilhas (país, ramo), módulos e quantidades;
 *   - busca valores apenas em preço VIGENTE e na condição particular do caso;
 *   - nunca consulta Planilha Mestre, OPS ou SKU legado em runtime;
 *   - separa honorários, despesas de terceiros, taxas oficiais e outros;
 *   - cobra a base de pesquisa compartilhada uma única vez por caso;
 *   - aplica redução de base compartilhada somente com aprovação registrada;
 *   - país VIGENTE com todos os valores nulos devolve VALOR_NAO_CADASTRADO;
 *   - condição particular aprovada substitui o total de referência, que fica
 *     só para auditoria.
 *
 * O que mudou em relação à versão de 03/10: o universo deixou de ser o SKU do
 * `product_catalog` (118 linhas, todas `rascunho`, todas da Planilha Mestre) e
 * passou a ser o par **produto-pai × país**, com a tabela de preços que a
 * Proprietária declarou vigente. O SKU legado sobrevive só como de-para em
 * `legacy_sku_mappings` — ele não é chave de cálculo.
 *
 * O que esta camada nunca faz: inventar valor, estimar país sem número,
 * derivar condição comercial do valor de referência, parcelar sem base, gerar
 * cobrança ou link.
 */

/** Os 4 componentes que o resumo separa, sempre, sem fundir. */
export const COMPONENTES_ORCAMENTO = ["honorarios", "despesas_terceiros", "taxas_oficiais", "outros"] as const;
export type ComponenteOrcamento = (typeof COMPONENTES_ORCAMENTO)[number];

/** Sinal honesto quando o país está vigente como trilha, mas sem valor. */
export const VALOR_NAO_CADASTRADO = "VALOR_NAO_CADASTRADO";

/**
 * Produtos-pai da jornada (v3.0 §2). Vocabulário único no Desk, Planejador e
 * proposta. País é trilha, não produto — a regra herdada "país não é SKU".
 */
export const PRODUTOS_PAI_JORNADA = [
  { codigo: "CA-DIAG-001", nome: "Diagnóstico de Cidadania por Etapas", jornada: "Descoberta e diagnóstico" },
  { codigo: "CA-DIAG-002", nome: "Diagnóstico Familiar Multipaís", jornada: "Descoberta e diagnóstico" },
  { codigo: "CA-DIAG-003", nome: "Diagnóstico de Pesquisa de Origem", jornada: "Descoberta e diagnóstico" },
  { codigo: "CA-DIAG-004", nome: "AncestralScan (sem cobrança)", jornada: "Descoberta e diagnóstico" },
  { codigo: "CA-PESQ-001", nome: "Pesquisa de Base", jornada: "Pesquisa e estratégia" },
  { codigo: "CA-PESQ-002", nome: "Pesquisa Familiar Ampliada", jornada: "Pesquisa e estratégia" },
  { codigo: "CA-PESQ-003", nome: "Pesquisa Documental Direcionada", jornada: "Pesquisa e estratégia" },
  { codigo: "CA-PESQ-004", nome: "Pesquisa de Linha Alternativa/Multipaís", jornada: "Pesquisa e estratégia" },
  { codigo: "CA-DOC-001", nome: "Plano Documental", jornada: "Documentação" },
  { codigo: "CA-DOC-002", nome: "Montagem de Pasta", jornada: "Documentação" },
  { codigo: "CA-DOC-003", nome: "Revisão ou Atualização de Pasta", jornada: "Documentação" },
  { codigo: "CA-DOC-004", nome: "Retificação Documental", jornada: "Documentação" },
  { codigo: "CA-DOC-005", nome: "Tradução e Apostilamento", jornada: "Documentação" },
  { codigo: "CA-DOC-006", nome: "Certidões e Registros", jornada: "Documentação" },
  { codigo: "CA-PROT-001", nome: "Assessoria de Protocolo", jornada: "Protocolo e acompanhamento" },
  { codigo: "CA-PROT-002", nome: "Via com Parceiro", jornada: "Protocolo e acompanhamento" },
  { codigo: "CA-PROT-003", nome: "Acompanhamento Familiar Compartilhado", jornada: "Protocolo e acompanhamento" },
  { codigo: "CA-PROT-004", nome: "Entrevista Consular", jornada: "Protocolo e acompanhamento" },
  { codigo: "CA-POS-001", nome: "Regularização Pós-Reconhecimento", jornada: "Pós-reconhecimento" },
  { codigo: "CA-POS-002", nome: "Registros Familiares Derivados", jornada: "Pós-reconhecimento" },
  { codigo: "CA-POS-003", nome: "Passaporte e Registros Consulares", jornada: "Pós-reconhecimento" },
  { codigo: "CA-POS-004", nome: "Continuidade Cidadão", jornada: "Pós-reconhecimento" },
  { codigo: "CA-MEM-001", nome: "Entrevista de Memória Guiada", jornada: "Memória e legado" },
  { codigo: "CA-MEM-002", nome: "Livro de História Familiar", jornada: "Memória e legado" },
  { codigo: "CA-MEM-003", nome: "Livro de Memórias Premium", jornada: "Memória e legado" },
  { codigo: "CA-MEM-004", nome: "Mapa Ancestral Ilustrado", jornada: "Memória e legado" },
  { codigo: "CA-MEM-005", nome: "Legado em Vídeo", jornada: "Memória e legado" },
  { codigo: "CA-MEM-006", nome: "Acervo Digital Familiar", jornada: "Memória e legado" },
  { codigo: "CA-ASS-001", nome: "Plano Essência", jornada: "Continuidade" },
  { codigo: "CA-ASS-002", nome: "Plano Memórias", jornada: "Continuidade" },
  { codigo: "CA-ASS-003", nome: "Plano Legado", jornada: "Continuidade" },
  { codigo: "CA-ASS-004", nome: "Plano Anual Memórias", jornada: "Continuidade" },
  { codigo: "CA-ASS-005", nome: "Assinatura Pós-Reconhecimento", jornada: "Continuidade" },
] as const;

export function produtoPaiDaJornada(codigo: string | null | undefined) {
  if (!codigo) return null;
  return PRODUTOS_PAI_JORNADA.find((p) => p.codigo === codigo) ?? null;
}

/**
 * "Europa geral" fica fora da calculadora por decisão do v3.0 §4: é
 * referência de triagem de origem indefinida, não processo final.
 */
export const PAIS_FORA_DA_CALCULADORA = ["EU"];

/** Processo completo de um país, como a tabela vigente o registra. */
export type ProcessoDoPais = {
  pais: string;
  honorarios: number | null;
  despesas_terceiros: number | null;
  taxas_oficiais: number | null;
  outros: number | null;
  parcelas: number | null;
};

/** Módulo escolhido por produto-pai (valor próprio, quantidade). */
export type ModuloEscolhido = {
  produtoPai: string;
  nome: string;
  pais: string | null;
  valor: number | null;
  quantidade: number;
};

export type TrilhaAdicional = {
  processo: ProcessoDoPais;
  /** Redução por base de pesquisa compartilhada. Só entra com aprovação. */
  reducaoBaseCompartilhada?: number;
  reducaoAprovadaPor?: string | null;
};

export type EntradaOrcamentoProdutoPai = {
  produtoPaiPrincipal: string;
  principal: ProcessoDoPais;
  trilhasAdicionais?: readonly TrilhaAdicional[];
  modulos?: readonly ModuloEscolhido[];
  /** CA-PROT-003 × quantidade (participantes além do titular). */
  participantesAdicionais?: { valor: number | null; quantidade: number } | null;
  descontoAprovado?: number;
  descontoMotivo?: string;
  /** Substitui o total de referência; a referência fica para auditoria. */
  condicaoParticular?: { valor: number; moeda: string; motivo: string } | null;
  parcelas?: number | null;
};

export type ResumoComponentes = Record<ComponenteOrcamento, number>;

export type OrcamentoProdutoPai = {
  produtoPaiPrincipal: string;
  componentes: ResumoComponentes;
  /** Soma dos 4 componentes + módulos + participantes, antes de desconto. */
  totalReferencia: number;
  descontoAprovado: number;
  totalCalculado: number;
  condicaoParticular: { valor: number; moeda: string; motivo: string } | null;
  /** O que de fato vale: condição particular quando houver, senão o calculado. */
  totalFinal: number;
  parcelas: number | null;
  valorDaParcela: number | null;
  /** `VALOR_NAO_CADASTRADO` quando o país vigente não tem nenhum valor. */
  sinal: typeof VALOR_NAO_CADASTRADO | null;
  /** Base de pesquisa compartilhada cobrada uma vez: as reduções aplicadas. */
  reducoesAplicadas: { pais: string; valor: number; aprovadaPor: string }[];
  reducoesRecusadas: { pais: string; valor: number; motivo: string }[];
  avisos: string[];
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const soma = (v: number | null) => v ?? 0;

/** Um país sem nenhum dos 4 componentes preenchidos não tem preço vigente. */
export function semValorCadastrado(p: ProcessoDoPais): boolean {
  return (
    num(p.honorarios) === null && num(p.despesas_terceiros) === null && num(p.taxas_oficiais) === null && num(p.outros) === null
  );
}

export function calcularOrcamentoProdutoPai(e: EntradaOrcamentoProdutoPai): OrcamentoProdutoPai {
  const avisos: string[] = [];
  const componentes: ResumoComponentes = { honorarios: 0, despesas_terceiros: 0, taxas_oficiais: 0, outros: 0 };

  if (PAIS_FORA_DA_CALCULADORA.includes(e.principal.pais)) {
    avisos.push(
      '"Europa geral" é referência de triagem de origem indefinida, não processo final — fica fora da calculadora (v3.0 §4).',
    );
  }

  const faltaValor = semValorCadastrado(e.principal);
  if (faltaValor) {
    avisos.push(
      `${e.principal.pais} está vigente como trilha, mas sem valor de processo cadastrado. ` +
        "Não zero o total em silêncio: preencha honorários, despesas de terceiros e taxas oficiais antes de orçar.",
    );
  }

  componentes.honorarios += soma(num(e.principal.honorarios));
  componentes.despesas_terceiros += soma(num(e.principal.despesas_terceiros));
  componentes.taxas_oficiais += soma(num(e.principal.taxas_oficiais));
  componentes.outros += soma(num(e.principal.outros));

  /*
   * Trilha adicional soma o processo completo do segundo país e subtrai a
   * redução por base compartilhada — que **exige aprovação registrada** (v3.0
   * §8.5: "fica proibido cobrar a base de pesquisa compartilhada duas vezes;
   * a redução por trilha adicional exige aprovação registrada"). Sem autor,
   * a redução não entra, e a recusa é dita.
   */
  const reducoesAplicadas: OrcamentoProdutoPai["reducoesAplicadas"] = [];
  const reducoesRecusadas: OrcamentoProdutoPai["reducoesRecusadas"] = [];
  for (const t of e.trilhasAdicionais ?? []) {
    componentes.honorarios += soma(num(t.processo.honorarios));
    componentes.despesas_terceiros += soma(num(t.processo.despesas_terceiros));
    componentes.taxas_oficiais += soma(num(t.processo.taxas_oficiais));
    componentes.outros += soma(num(t.processo.outros));
    if (semValorCadastrado(t.processo)) {
      avisos.push(`Trilha adicional ${t.processo.pais} está sem valor cadastrado e não somou nada.`);
    }
    const reducao = soma(num(t.reducaoBaseCompartilhada));
    if (reducao > 0) {
      const aprovador = String(t.reducaoAprovadaPor ?? "").trim();
      if (aprovador) reducoesAplicadas.push({ pais: t.processo.pais, valor: reducao, aprovadaPor: aprovador });
      else
        reducoesRecusadas.push({
          pais: t.processo.pais,
          valor: reducao,
          motivo: "redução de base compartilhada exige aprovação registrada — não foi aplicada",
        });
    }
  }
  for (const r of reducoesRecusadas) {
    avisos.push(`Redução de ${r.valor} na trilha ${r.pais} não entrou: ${r.motivo}.`);
  }

  let modulos = 0;
  for (const m of e.modulos ?? []) {
    const q = Math.max(1, Math.trunc(Number(m.quantidade ?? 1)));
    const v = num(m.valor);
    if (v === null) {
      avisos.push(`Módulo “${m.nome}” (${m.produtoPai}) está sem valor cadastrado e ficou fora da soma.`);
      continue;
    }
    modulos += v * q;
  }
  componentes.honorarios += modulos;

  let participantes = 0;
  if (e.participantesAdicionais) {
    const v = num(e.participantesAdicionais.valor);
    const q = Math.max(0, Math.trunc(Number(e.participantesAdicionais.quantidade ?? 0)));
    if (v === null && q > 0) avisos.push("Participante adicional (CA-PROT-003) está sem valor cadastrado.");
    else participantes = soma(v) * q;
  }
  componentes.honorarios += participantes;

  const reducaoTotal = reducoesAplicadas.reduce((s, r) => s + r.valor, 0);
  const totalReferencia =
    componentes.honorarios + componentes.despesas_terceiros + componentes.taxas_oficiais + componentes.outros - reducaoTotal;

  let descontoAprovado = soma(num(e.descontoAprovado));
  if (descontoAprovado > 0 && !String(e.descontoMotivo ?? "").trim()) {
    avisos.push("Desconto informado sem motivo registrado — não foi aplicado.");
    descontoAprovado = 0;
  }
  const totalCalculado = Math.max(0, totalReferencia - descontoAprovado);

  const cp = e.condicaoParticular;
  const condicaoParticular =
    cp && num(cp.valor) !== null && Number(cp.valor) > 0 && String(cp.motivo ?? "").trim()
      ? { valor: Number(cp.valor), moeda: String(cp.moeda || "BRL").toUpperCase(), motivo: String(cp.motivo).trim() }
      : null;
  if (cp && !condicaoParticular) avisos.push("Condição particular sem valor positivo ou sem motivo — não foi aplicada.");
  if (condicaoParticular) {
    avisos.push(
      `Condição particular aprovada substitui o total de referência (${totalReferencia}); a referência fica só para auditoria.`,
    );
  }

  const totalFinal = condicaoParticular ? Math.max(0, condicaoParticular.valor - descontoAprovado) : totalCalculado;
  const parcelas = num(e.parcelas) ?? num(e.principal.parcelas);
  const sinal = faltaValor && !condicaoParticular ? VALOR_NAO_CADASTRADO : null;

  return {
    produtoPaiPrincipal: e.produtoPaiPrincipal,
    componentes,
    totalReferencia,
    descontoAprovado,
    totalCalculado,
    condicaoParticular,
    totalFinal: sinal ? 0 : totalFinal,
    parcelas,
    valorDaParcela: sinal || !parcelas || parcelas <= 0 ? null : Math.round((totalFinal / parcelas) * 100) / 100,
    sinal,
    reducoesAplicadas,
    reducoesRecusadas,
    avisos,
  };
}
