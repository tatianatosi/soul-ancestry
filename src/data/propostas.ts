/**
 * Ancestral Canvas — camada de "proposta por slide".
 *
 * ORIGEM DOS DADOS (nada inventado):
 *  - CA · FIN · Planilha Mestre de Produtos OFICIAL (aba "Catalogo Produtos" e
 *    "SKU · Histórico & Status"): SKU, nome, categoria, família/papel no portfólio,
 *    preço atual e preço sugerido.
 *  - planejador-universal-simulador-todas-cidadanias.xlsx
 *    (PARAMETROS, SKUS_REFERENCIA, CASOS, LANCAMENTOS, RESUMO_CASOS, SIMULADOR_CASO).
 *
 * Todos os valores numéricos derivam de `CASOS`/`PARAMETROS` (src/data/casos.ts),
 * garantindo que app cliente (Conta, Legado) e Desk mostrem exatamente os mesmos números.
 */

import { CASOS, PARAMETROS, resumoCaso, brl, type Caso } from "./casos";

export const ORIGEM_PROPOSTAS = "planilha-mestre-produtos + planejador-universal" as const;

/* ------------------------------------------------------------------ */
/* Planilha Mestre de Produtos — papel de cada SKU no portfólio        */
/* ------------------------------------------------------------------ */

export type PapelPortfolio = "pacote" | "etapa" | "upsell" | "assinatura";

export type ProdutoMestre = {
  sku: string;
  nome: string;
  categoria: string;
  familia: string;
  papel: PapelPortfolio;
  precoAtual: number;
  precoSugerido: number;
  gatilho: string;
};

/** Subconjunto da Planilha Mestre usado nas propostas (status Ativo). */
export const PORTFOLIO_MESTRE: ProdutoMestre[] = [
  // --- Pacotes principais ---
  { sku: "CA-CID-023", nome: "Assessoria Completa de Cidadania Italiana", categoria: "Cidadania Italiana", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 4500, precoSugerido: 4500, gatilho: "Caso italiano com linha confirmada (referência premium)" },
  { sku: "PACOTE-PT-01", nome: "Pacote Cidadania Portuguesa", categoria: "Cidadania Portuguesa", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 3800, precoSugerido: 3800, gatilho: "Descendência direta (Lei nº 37/1981)" },
  { sku: "PACOTE-CROACIA-01", nome: "Pacote Cidadania Croata por Descendência", categoria: "Cidadania Croata", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 4000, precoSugerido: 4000, gatilho: "Descendência croata / Consulado SP" },
  { sku: "PACOTE-DE-01", nome: "Pacote Cidadania Alemã", categoria: "Cidadania Alemã", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 4200, precoSugerido: 4200, gatilho: "Feststellung ou § 13 StAG" },
  { sku: "NAT-BR-01", nome: "Pacote Naturalização Brasileira", categoria: "Naturalização Brasileira", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 900, precoSugerido: 900, gatilho: "Serviço leve de acompanhamento" },
  { sku: "PACOTE-FR-01", nome: "Pacote Naturalização Francesa", categoria: "Naturalização Francesa", familia: "F1 – Consultoria / Decisão", papel: "pacote", precoAtual: 1000, precoSugerido: 1000, gatilho: "Naturalização por residência" },

  // --- Etapas ---
  { sku: "CA-CID-001", nome: "Diagnóstico e Checklist Inicial (Itália)", categoria: "Cidadania Italiana", familia: "F1 – Consultoria / Decisão", papel: "etapa", precoAtual: 247, precoSugerido: 260, gatilho: "Porta de entrada do funil — análise de reconhecimento e pendências" },
  { sku: "CA-HIST-005", nome: "Pesquisa de Base Familiar", categoria: "História da Família", familia: "F2 – Origem / Genealogia", papel: "etapa", precoAtual: 247, precoSugerido: 247, gatilho: "Diagnóstico individual quando o país não tem SKU próprio" },
  { sku: "CA-CID-002D", nome: "Pasta + Checklist de Pendências", categoria: "Cidadania Italiana", familia: "F2 – Execução", papel: "etapa", precoAtual: 390, precoSugerido: 390, gatilho: "Montagem documental" },
  { sku: "CA-CID-002A", nome: "Revisão de Pasta para Cidadania", categoria: "Cidadania Italiana", familia: "F2 – Execução", papel: "etapa", precoAtual: 690, precoSugerido: 690, gatilho: "Pasta existente com pendências" },
  { sku: "CA-CID-002B", nome: "Atualização de Pasta para Cidadania", categoria: "Cidadania Italiana", familia: "F2 – Execução", papel: "etapa", precoAtual: 890, precoSugerido: 890, gatilho: "Pasta antiga a regularizar" },
  { sku: "CA-CID-002", nome: "Montagem Completa de Pasta para Cidadania", categoria: "Cidadania Italiana", familia: "F3 – Documentos / Burocracia", papel: "etapa", precoAtual: 1436, precoSugerido: 990, gatilho: "Do zero até a pasta pronta para uso consular" },
  { sku: "CA-CID-006", nome: "Combo Codice Fiscale + SPID", categoria: "Cidadania Italiana", familia: "F3 – Documentos / Burocracia", papel: "etapa", precoAtual: 280, precoSugerido: 249, gatilho: "Acesso digital italiano (Codice + SPID)" },
  { sku: "CA-CID-003", nome: "AIRE + Agendamento de Passaporte", categoria: "Cidadania Italiana", familia: "F3 – Documentos / Burocracia", papel: "etapa", precoAtual: 530, precoSugerido: 490, gatilho: "Verificação/atualização AIRE após reconhecimento" },
  { sku: "CA-CID-018", nome: "Transcrição de Atos no País de Origem", categoria: "Cidadania Italiana", familia: "F2 – Execução", papel: "etapa", precoAtual: 1588, precoSugerido: 2490, gatilho: "Regularização judicial / Comune quando há atos pendentes" },
  { sku: "CA-CID-DE-001", nome: "Diagnóstico de Linha Alemã", categoria: "Cidadania Alemã", familia: "F1 – Consultoria / Decisão", papel: "etapa", precoAtual: 247, precoSugerido: 247, gatilho: "Elegibilidade Feststellung vs § 13 StAG" },
  { sku: "CA-CID-DE-002", nome: "Pesquisa e Montagem Documental (Alemã)", categoria: "Cidadania Alemã", familia: "F2 – Execução", papel: "etapa", precoAtual: 1290, precoSugerido: 1290, gatilho: "Bundle certidões / tradução / apostilamento" },
  { sku: "CA-CID-DE-003b", nome: "Acompanhamento de Protocolo (Alemã)", categoria: "Cidadania Alemã", familia: "F2 – Execução", papel: "etapa", precoAtual: 890, precoSugerido: 890, gatilho: "Revisão final e agendamento consular" },

  // --- Upsells ---
  { sku: "CA-CID-025", nome: "Acompanhamento Familiar — Processo Compartilhado", categoria: "Cidadania Italiana", familia: "F1 – Consultoria / Decisão", papel: "upsell", precoAtual: 990, precoSugerido: 1190, gatilho: "Extensão familiar: mais de um requerente no mesmo processo" },
  { sku: "CA-CID-016", nome: "Registro de Filhos Adicionais (mesmo pedido AIRE)", categoria: "Cidadania Italiana", familia: "F3 – Documentos / Burocracia", papel: "upsell", precoAtual: 1511, precoSugerido: 2490, gatilho: "Filhos a registrar junto ao pedido AIRE" },
  { sku: "CA-CID-019", nome: "Declaração de Valor — Ensino Fundamental até Universidade", categoria: "Cidadania Italiana", familia: "F3 – Documentos / Burocracia", papel: "upsell", precoAtual: 3881, precoSugerido: 4500, gatilho: "Extensão patrimonial / validação de estudos" },
  { sku: "CA-CID-013", nome: "Agendamento de Passaporte Europeu (avulso)", categoria: "Cidadania Italiana", familia: "F3 – Pós-Cidadania", papel: "upsell", precoAtual: 451, precoSugerido: 490, gatilho: "Pós-reconhecimento" },
  { sku: "CA-HIST-001", nome: "Estudo Genealógico e Patrimonial Aprofundado", categoria: "História da Família", familia: "F2 – Origem / Genealogia", papel: "upsell", precoAtual: 5651, precoSugerido: 4500, gatilho: "Cliente quer legado documentado além do processo" },
  { sku: "CA-HIST-002", nome: "Pesquisa Genealógica Extra com Sobrenome Adicional", categoria: "História da Família", familia: "F2 – Origem / Genealogia", papel: "upsell", precoAtual: 7053, precoSugerido: 7700, gatilho: "Segunda linha / sobrenome adicional" },
  { sku: "CA-MEM-004", nome: "Livro da História Familiar", categoria: "Memória Familiar", familia: "F5 – Memória / Legado", papel: "upsell", precoAtual: 490, precoSugerido: 390, gatilho: "Legado: entrega física da história" },
  { sku: "CA-MEM-008", nome: "Livro de Memórias Premium", categoria: "Memória Familiar", familia: "F5 – Memória / Legado", papel: "upsell", precoAtual: 2990, precoSugerido: 1990, gatilho: "Legado premium" },

  // --- Assinaturas (recorrência) ---
  { sku: "CA-ASS-001", nome: "Plano Essência", categoria: "Assinatura", familia: "F4 – Assinaturas", papel: "assinatura", precoAtual: 179, precoSugerido: 79, gatilho: "Acompanhamento contínuo básico" },
  { sku: "CA-ASS-002", nome: "Plano Memórias", categoria: "Assinatura", familia: "F4 – Assinaturas", papel: "assinatura", precoAtual: 269, precoSugerido: 169, gatilho: "Acompanhamento + memória familiar" },
  { sku: "CA-ASS-003", nome: "Plano Legado", categoria: "Assinatura", familia: "F4 – Assinaturas", papel: "assinatura", precoAtual: 359, precoSugerido: 249, gatilho: "Acompanhamento contínuo premium (legado)" },
  { sku: "CA-ASS-004", nome: "Assinatura Cidadão Pós-Reconhecimento", categoria: "Assinatura", familia: "F3 – Pós-Cidadania", papel: "assinatura", precoAtual: 99, precoSugerido: 99, gatilho: "Após o reconhecimento da cidadania" },

  // --- WhatsApp Familiar (Planilha Mestre · aba "Catalogo Produtos" + "SKU · Histórico & Status") ---
  { sku: "CA-WPP-001", nome: "Pacote WhatsApp Essencial", categoria: "WhatsApp Familiar", familia: "F4 – Memória", papel: "upsell", precoAtual: 79, precoSugerido: 59, gatilho: "Plano individual — alertas básicos e conteúdos semanais (Fase 1 · D1-D30)" },
  { sku: "CA-WPP-002", nome: "Pacote WhatsApp Premium", categoria: "WhatsApp Familiar", familia: "F4 – Memória", papel: "upsell", precoAtual: 149, precoSugerido: 119, gatilho: "Plano individual premium — conteúdo personalizado + acompanhamento (Fase 1 · D1-D30)" },
  { sku: "CA-FAM-001", nome: "Familiar Conectado", categoria: "WhatsApp Familiar", familia: "F4 – Memória", papel: "upsell", precoAtual: 280, precoSugerido: 290, gatilho: "Acesso compartilhado do grupo familiar via WhatsApp (Fase 2 · D31-D60)" },
  { sku: "CA-FAM-002", nome: "Familiar Conectado Plus", categoria: "WhatsApp Familiar", familia: "F4 – Memória", papel: "upsell", precoAtual: 490, precoSugerido: 490, gatilho: "Familiar Conectado premium — conteúdos exclusivos e acompanhamento (Fase 2 · D31-D60)" },
];

/* ------------------------------------------------------------------ */
/* Planos de WhatsApp familiar — valores oficiais (Planilha Mestre)    */
/* Nenhum preço novo: todos vêm de "Catalogo Produtos"/"SKU · Histórico".*/
/* Nos LANCAMENTOS/PAGAMENTOS do planejador universal esses SKUs        */
/* ainda NÃO aparecem — hoje são apenas upsell/recomendação interna.    */
/* ------------------------------------------------------------------ */

export type TipoPlanoWhatsapp = "individual" | "familiar";

export const PLANOS_WHATSAPP: {
  sku: string;
  rotulo: string;
  tipo: TipoPlanoWhatsapp;
  precoAtual: number;
  precoSugerido: number;
  faseGoLive: string;
  contratado: false;
}[] = [
  { sku: "CA-WPP-001", rotulo: "Alertas Básicos (Pacote WhatsApp Essencial)", tipo: "individual", precoAtual: 79, precoSugerido: 59, faseGoLive: "Fase 1 · D1-D30", contratado: false },
  { sku: "CA-WPP-002", rotulo: "Pacote WhatsApp Premium", tipo: "individual", precoAtual: 149, precoSugerido: 119, faseGoLive: "Fase 1 · D1-D30", contratado: false },
  { sku: "CA-FAM-001", rotulo: "Familiar Conectado", tipo: "familiar", precoAtual: 280, precoSugerido: 290, faseGoLive: "Fase 2 · D31-D60", contratado: false },
  { sku: "CA-FAM-002", rotulo: "Familiar Conectado Plus", tipo: "familiar", precoAtual: 490, precoSugerido: 490, faseGoLive: "Fase 2 · D31-D60", contratado: false },
];

export const planoWhatsapp = (sku: string) => PLANOS_WHATSAPP.find((p) => p.sku === sku);

/** Recomendação interna (Desk) — não exibida ao cliente. */
export type RecomendacaoWhatsapp = {
  casoId: string | null;
  cliente: string;
  familiarDireto: string;
  momento: "diagnóstico" | "execução" | "pós-cidadania";
  combinacao: string;
  skus: string[];
  status: "recomendação interna" | "upsell potencial";
  nota: string;
};

export const RECOMENDACOES_WHATSAPP: RecomendacaoWhatsapp[] = [
  {
    casoId: "CA-CID-AT-2026-002",
    cliente: "Ana Luiza Gomes Silveira",
    familiarDireto: "Irmã (familiar direto provável)",
    momento: "diagnóstico",
    combinacao: "Ana Luiza no plano individual + irmã no Familiar Conectado",
    skus: ["CA-WPP-001", "CA-FAM-001"],
    status: "recomendação interna",
    nota:
      "Caso § 58c StbG com dois requerentes da mesma linha: o plano individual cobre os alertas da Ana Luiza e o Familiar Conectado abre o acesso compartilhado à irmã. Alternativa: ambas no Familiar Conectado (CA-FAM-001) quando os dois pedidos correrem juntos. Não ofertar ao cliente nesta rodada.",
  },
  {
    casoId: null,
    cliente: "Lara Ribeiro",
    familiarDireto: "Marido agora; filho na fase seguinte",
    momento: "execução",
    combinacao: "Individual na execução → Familiar Conectado após início do processo / pós-cidadania",
    skus: ["CA-WPP-001", "CA-FAM-001"],
    status: "upsell potencial",
    nota:
      "Cidadania italiana: encaixar o plano individual quando a execução começar e migrar para Familiar Conectado em fase mais avançada (marido e, depois, filho). Nada contratado — apenas potencial de upsell.",
  },
  {
    casoId: "CA-CID-IT-2026-001",
    cliente: "Giovanna Prade",
    familiarDireto: "Pai já italiano (reconhecido nos anos 1980)",
    momento: "execução",
    combinacao: "Plano individual (alertas básicos) como apoio ao acompanhamento",
    skus: ["CA-WPP-001"],
    status: "recomendação interna",
    nota:
      "Caso administrativo, NÃO judicial: foco em verificação/atualização de AIRE, pasta e acompanhamento. O WhatsApp entra como apoio ao acompanhamento do processo, nunca como produto de via judicial.",
  },
];

export const recomendacaoWhatsappPorCaso = (casoId: string) =>
  RECOMENDACOES_WHATSAPP.find((r) => r.casoId === casoId);


export const produtoMestre = (sku: string) => PORTFOLIO_MESTRE.find((p) => p.sku === sku);

/** Pacote principal por tipo de processo (Planilha Mestre × SKUS_REFERENCIA). */
export const PACOTE_PRINCIPAL: Record<string, string | null> = {
  "Cidadania Italiana": "CA-CID-023",
  "Cidadania Portuguesa": "PACOTE-PT-01",
  "Cidadania Croata": "PACOTE-CROACIA-01",
  "Cidadania Alemã": "PACOTE-DE-01",
  "Naturalização Brasileira": "NAT-BR-01",
  "Naturalização Francesa": "PACOTE-FR-01",
  "Cidadania Austríaca": null, // PARAMETROS: "Preencher manualmente"
};

/** Upsells mapeados por tipo de processo. */
const UPSELLS_POR_TIPO: Record<string, string[]> = {
  "Cidadania Italiana": ["CA-CID-025", "CA-CID-016", "CA-CID-019", "CA-CID-013", "CA-ASS-003"],
  "Cidadania Portuguesa": ["CA-CID-025", "CA-HIST-002", "CA-MEM-004", "CA-ASS-002"],
  "Cidadania Croata": ["CA-CID-025", "CA-HIST-001", "CA-MEM-008", "CA-ASS-003"],
  "Cidadania Alemã": ["CA-CID-025", "CA-HIST-002", "CA-ASS-002"],
  "Cidadania Austríaca": ["CA-HIST-001", "CA-MEM-004", "CA-ASS-002"],
  "Naturalização Brasileira": ["CA-MEM-004", "CA-ASS-001"],
  "Naturalização Francesa": ["CA-MEM-004", "CA-ASS-001"],
};

/** SKU de diagnóstico individual por tipo de processo. */
const DIAGNOSTICO_POR_TIPO: Record<string, string> = {
  "Cidadania Italiana": "CA-CID-001",
  "Cidadania Alemã": "CA-CID-DE-001",
};
const DIAGNOSTICO_PADRAO = "CA-HIST-005";

/* ------------------------------------------------------------------ */
/* Estrutura de proposta por slide                                     */
/* ------------------------------------------------------------------ */

export type LinhaSku = { sku: string; nome: string; valor: number; papel: PapelPortfolio; gatilho: string };

export interface PropostaSlide {
  casoId: string;
  cliente: string;
  origem: typeof ORIGEM_PROPOSTAS;
  capa: {
    titulo: string;
    subtitulo: string;
    referenciaTotal: number;
    tipoProcesso: string;
    pais: string;
  };
  visaoGeral: {
    referenciaTotal: number;
    diagnosticoIndividual: number;
    caminhosInvestimento: { formato: "à vista" | "recorrência" | "por etapas"; titulo: string; valor: string; detalhe: string }[];
  };
  diagnostico: { itens: { titulo: string; detalhe: string }[] };
  jornada: { etapas: { etapa: string; titulo: string; sku: string | null; valor: number | null }[] };
  planos: {
    aVista: { valor: number; detalhe: string };
    recorrencia: { valor: number; parcelas: number; detalhe: string };
    porEtapas: { valor: number; detalhe: string; itens: LinhaSku[] };
  };
  resumoFinanceiro: {
    linhaHonorarios: { rotulo: string; valor: number };
    linhaDiagnostico: { rotulo: string; valor: number };
    linhaEntradaEtapas: { rotulo: string; valor: number };
    linhaDespesas: { rotulo: string; valor: number };
    linhaTaxas: { rotulo: string; valor: number };
    linhaTotal: { rotulo: string; valor: number };
    linhaSaldo: { rotulo: string; valor: number };
  };
  formatoRecomendado: "à vista" | "recorrência" | "por etapas";
  skusPrincipais: LinhaSku[];
  upsells: LinhaSku[];
  observacao?: string;
}

const linha = (sku: string): LinhaSku | null => {
  const p = produtoMestre(sku);
  if (!p) return null;
  return { sku: p.sku, nome: p.nome, valor: p.precoAtual, papel: p.papel, gatilho: p.gatilho };
};

const linhas = (skus: string[]) => skus.map(linha).filter((l): l is LinhaSku => l !== null);

const montarProposta = (c: Caso): PropostaSlide => {
  const { previsto, saldo } = resumoCaso(c);
  const param = PARAMETROS[c.tipoProcesso];
  const parcelas = param?.parcelas ?? 3;

  const diagSku = DIAGNOSTICO_POR_TIPO[c.tipoProcesso] ?? DIAGNOSTICO_PADRAO;
  const diagnosticoIndividual = produtoMestre(diagSku)?.precoAtual ?? 0;

  const principais = linhas(c.plano.skus).filter((l) => l.papel !== "upsell");
  const pacoteSku = PACOTE_PRINCIPAL[c.tipoProcesso];
  if (pacoteSku && !principais.some((l) => l.sku === pacoteSku)) {
    const p = linha(pacoteSku);
    if (p) principais.unshift(p);
  }

  const upsellsDoCaso = linhas(c.plano.skus).filter((l) => l.papel === "upsell").map((l) => l.sku);
  const upsells = linhas([...new Set([...upsellsDoCaso, ...(UPSELLS_POR_TIPO[c.tipoProcesso] ?? [])])]);

  const etapasSoma = principais.filter((l) => l.papel === "etapa").reduce((s, l) => s + l.valor, 0);
  const recorrencia = Math.round(c.plano.honorariosBase / parcelas);

  return {
    casoId: c.id,
    cliente: c.cliente,
    origem: ORIGEM_PROPOSTAS,
    capa: {
      titulo: `Proposta ${c.plano.nome}`,
      subtitulo: `${c.cliente} · ${c.id}`,
      referenciaTotal: previsto,
      tipoProcesso: c.tipoProcesso,
      pais: c.pais,
    },
    visaoGeral: {
      referenciaTotal: previsto,
      diagnosticoIndividual,
      caminhosInvestimento: [
        { formato: "à vista", titulo: "À vista", valor: brl(previsto), detalhe: "Honorários + despesas + taxas previstas (RESUMO_CASOS)." },
        { formato: "recorrência", titulo: "Recorrência", valor: `${parcelas}x ${brl(recorrencia)}`, detalhe: `Parcelas padrão do tipo de processo (PARAMETROS: ${parcelas}x).` },
        { formato: "por etapas", titulo: "Por etapas", valor: etapasSoma > 0 ? brl(etapasSoma) : "sob definição", detalhe: "Soma dos SKUs de etapa contratáveis isoladamente." },
      ],
    },
    diagnostico: {
      itens: [
        { titulo: "Base jurídica", detalhe: c.baseJuridica },
        { titulo: "Etapa atual", detalhe: `${c.etapaAtual} · ${c.progresso}% concluído` },
        { titulo: "Próxima ação", detalhe: c.proximaAcao },
        { titulo: "Diagnóstico individual", detalhe: `${diagSku} — ${brl(diagnosticoIndividual)}` },
        ...(param ? [{ titulo: "Parâmetros do processo", detalhe: param.obs }] : []),
      ],
    },
    jornada: {
      etapas: c.linhaProcesso.map((e, i) => {
        const l = principais.filter((x) => x.papel === "etapa")[i] ?? null;
        return { etapa: e.etapa, titulo: l?.nome ?? e.etapa, sku: l?.sku ?? null, valor: l?.valor ?? null };
      }),
    },
    planos: {
      aVista: { valor: previsto, detalhe: "Pagamento único da referência total." },
      recorrencia: { valor: recorrencia, parcelas, detalhe: `Honorários ${brl(c.plano.honorariosBase)} divididos em ${parcelas}x.` },
      porEtapas: { valor: etapasSoma, detalhe: "Cliente contrata etapa a etapa conforme avanço do caso.", itens: principais.filter((l) => l.papel === "etapa") },
    },
    resumoFinanceiro: {
      linhaHonorarios: { rotulo: "Honorários previstos", valor: c.plano.honorariosBase },
      linhaDiagnostico: { rotulo: "Diagnóstico individual", valor: diagnosticoIndividual },
      linhaEntradaEtapas: { rotulo: "Entrada por etapas", valor: etapasSoma },
      linhaDespesas: { rotulo: "Despesas previstas", valor: c.plano.despesasPrevistas },
      linhaTaxas: { rotulo: "Taxas oficiais previstas", valor: c.plano.taxasPrevistas },
      linhaTotal: { rotulo: "Referência total", valor: previsto },
      linhaSaldo: { rotulo: "Saldo em aberto", valor: saldo },
    },
    formatoRecomendado: c.plano.formato,
    skusPrincipais: principais,
    upsells,
    observacao: c.observacoes,
  };
};

export const PROPOSTAS: PropostaSlide[] = CASOS.map(montarProposta);

export const propostaByCaso = (casoId: string) =>
  PROPOSTAS.find((p) => p.casoId === casoId) ?? PROPOSTAS[0];
