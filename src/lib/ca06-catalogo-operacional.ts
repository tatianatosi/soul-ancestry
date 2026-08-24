/**
 * CA-06 — Catálogo Operacional 30 + Planejador + Ciclos de Vida (v1.1).
 *
 * PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA.
 * Registro interno, somente leitura. Não cria, edita, publica, cobra, integra
 * nem exclui nada em nenhum sistema externo. Não substitui a Planilha Mestre:
 * preço, link e escopo homologado continuam sendo lidos apenas de lá.
 */

export const CA06_STATUS_PROPOSTA =
  "PROPOSTA — PENDENTE DE VALIDAÇÃO HUMANA" as const;

export const CA06_VERSAO = "1.1 — Execução Econômica" as const;
export const CA06_DATA = "14/08/2026" as const;

export type StatusCatalogo30 = "ATIVO" | "PILOTO" | "CONDICIONAL" | "PENDENTE";
export type DecisaoCatalogo30 = "MANTER" | "PENDENTE";
export type VisibilidadeApp =
  | "JORNADA"
  | "OFERTA_CONDICIONAL"
  | "CONTEÚDO_APROVADO"
  | "NÃO";

export type ItemCatalogo30 = {
  sku_id: string;
  produto_oficial: string;
  produto_mae: string;
  categoria: string;
  papel_no_portfolio:
    | "ENTRADA"
    | "EXECUÇÃO"
    | "COMPLEMENTO"
    | "UPSELL"
    | "UPGRADE"
    | "RECORRÊNCIA";
  status_catalogo_30: StatusCatalogo30;
  decisao: DecisaoCatalogo30;
  ciclo_de_vida: string;
  aplicabilidade: string;
  visibilidade_app: VisibilidadeApp;
  condicao_de_uso: string;
  observacao: string;
};

const APLIC_VIA =
  "todas as vias/países aplicáveis (parâmetro de caso; sem SKU por país)";
const APLIC_ASSINATURA =
  "transversal a país/via (produto de continuidade/assinatura)";
const APLIC_MEMORIA = "transversal a país/via (produto de memória/legado)";
const COND_PADRAO =
  "Preço/link não conciliados — referenciar Planilha Mestre/Asaas antes de expor.";

/** Uso operacional padrão de todo item do Catálogo 30 (exceto pendentes). */
export const CA06_USO_PADRAO = {
  uso_planejador: "SIM — case_id + sku_id + parâmetros de caso",
  uso_crm: "SIM — vinculado a oportunidade/proposta vigente",
  uso_desk: "SIM — tarefa/documento/evidência associados",
  preco_link: "referenciar Planilha Mestre/Asaas",
} as const;

export const CA06_USO_PENDENTE = {
  uso_planejador: "PENDENTE — aguardar decisão sobre status Arquivado",
  uso_crm: "PENDENTE — aguardar decisão sobre status Arquivado",
  uso_desk: "PENDENTE — aguardar decisão sobre status Arquivado",
  preco_link: "referenciar Planilha Mestre/Asaas",
} as const;

/** Entrega A — Catálogo Operacional 30 (os 30 candidatos da Fase 3). */
export const CATALOGO_OPERACIONAL_30: readonly ItemCatalogo30[] = [
  {
    sku_id: "CA-ASS-001",
    produto_oficial: "Plano Essência",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-ASS-002",
    produto_oficial: "Plano Memorias",
    produto_mae: "— (âncora de assinatura)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "PILOTO",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-ASS-003",
    produto_oficial: "Plano Legado",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-ASS-004",
    produto_oficial: "Assinatura Cidadão Pós-Reconhecimento",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-ASS-005",
    produto_oficial: "Plano Anual com Desconto — Memórias",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CID-001",
    produto_oficial: "Consultoria de Cidadania Italiana",
    produto_mae: "— (âncora da família 1)",
    categoria: "1. Diagnóstico e direção",
    papel_no_portfolio: "ENTRADA",
    status_catalogo_30: "ATIVO",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso:
      "Preço documentado diverge entre fontes; fusão proposta com CA-CID-024 ainda depende de decisão humana.",
    observacao: "—",
  },
  {
    sku_id: "CA-CID-002",
    produto_oficial: "Montagem Completa de Pasta para Cidadania",
    produto_mae: "— (âncora da família 2)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "PILOTO",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso:
      "Preço/escopo conflitam (inclui referência R$ 1.436 e alternativa R$ 990); variantes A–D criam sobreposição.",
    observacao: "—",
  },
  {
    sku_id: "CA-CID-003",
    produto_oficial: "AIRE + Agendamento de Passaporte",
    produto_mae: "— (âncora da família 4)",
    categoria: "4. Pós-cidadania e registros",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "ATIVO",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso:
      "Escopo avulso versus bundle e relação com CA-POS-001 requerem decisão humana; links precisam reconciliação.",
    observacao: "—",
  },
  {
    sku_id: "CA-CID-006",
    produto_oficial: "Combo Codice + SPID",
    produto_mae: "CA-CID-003 (mesma família 4)",
    categoria: "4. Pós-cidadania e registros",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CID-009",
    produto_oficial: "Registro de 1o Filho",
    produto_mae: "CA-CID-003 (mesma família 4)",
    categoria: "4. Pós-cidadania e registros",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CID-016",
    produto_oficial: "Registro de Filhos Adicionais (mesmo pedido AIRE)",
    produto_mae: "CA-CID-003 (mesma família 4)",
    categoria: "4. Pós-cidadania e registros",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CID-018",
    produto_oficial:
      "Emissao de Transcricao de Atos no Pais de Origem Europeia",
    produto_mae: "CA-CID-003 (mesma família 4)",
    categoria: "4. Pós-cidadania e registros",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CID-023",
    produto_oficial: "Assessoria Completa de Cidadania Italiana",
    produto_mae: "— (âncora da família 3)",
    categoria: "3. Execução ou acompanhamento principal",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "PILOTO",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso:
      "Preço e escopo de assessoria divergem entre propostas/casos; não usar link isolado como prova de prioridade.",
    observacao: "—",
  },
  {
    sku_id: "CA-CID-025",
    produto_oficial: "Acompanhamento Familiar — Processo Compartilhado",
    produto_mae: "CA-CID-023 (mesma família 3)",
    categoria: "3. Execução ou acompanhamento principal",
    papel_no_portfolio: "UPSELL",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-COMBO-001",
    produto_oficial: "Combo Vó (Restauração + Entrevista + Diário)",
    produto_mae: "CA-MEM-003 (componente central do combo)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "UPSELL",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-CURSO-001",
    produto_oficial: "Kit Pesquisa Faça Você Mesmo",
    produto_mae:
      "— (único candidato da família 6; status oficial Arquivado — ver ressalva)",
    categoria: "6. Autonomia e educação",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "PENDENTE",
    decisao: "PENDENTE",
    ciclo_de_vida: "pendente_validação (conflito de status)",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "NÃO",
    condicao_de_uso:
      "Preço, link e/ou copy podem não estar conciliados; status oficial Arquivado ainda não foi ratificado para reativação; a existência no catálogo não é prova de prioridade comercial.",
    observacao:
      "Status oficial Arquivado conflita com CANDIDATO TOP 30 — decisão humana obrigatória antes de qualquer uso.",
  },
  {
    sku_id: "CA-FAM-002",
    produto_oficial: "Familiar Conectado Plus",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-HIST-001",
    produto_oficial: "Estudo Genealogico e Patrimonial Aprofundado",
    produto_mae: "— (âncora de pesquisa genealógica)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-HIST-002",
    produto_oficial: "Pesquisa Genealogica Extra com Sobrenome Adicional",
    produto_mae: "CA-HIST-001 (extra sobre o mesmo estudo)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "UPSELL",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-HIST-004",
    produto_oficial: "Pacote Família Completa (3 Sobrenomes)",
    produto_mae: "CA-HIST-001 (pacote ampliado)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "UPGRADE",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-HIST-005",
    produto_oficial: "Pesquisa de Base Familiar",
    produto_mae: "CA-HIST-001 (verificar sobreposição de escopo)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "ENTRADA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "JORNADA",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-HIST-006",
    produto_oficial: "Combo Pesquisa + Diagnóstico de Cidadania Italiana",
    produto_mae:
      "CA-HIST-005 (no Catálogo 30) + CA-CID-022 (fora do Catálogo 30)",
    categoria: "2. Estratégia, pesquisa e documentação",
    papel_no_portfolio: "UPSELL",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_VIA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-IND-001",
    produto_oficial: "Autobiografia Guiada — Pacote Express",
    produto_mae: "CA-IND-005 (versão express do livro premium)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-IND-002",
    produto_oficial: "Legado em Vídeo — Mini-Série de Depoimentos",
    produto_mae: "— (formato próprio: vídeo)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-IND-005",
    produto_oficial: "Livro Biográfico Completo — Premium",
    produto_mae: "— (âncora de livro biográfico)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-IND-006",
    produto_oficial: "Memória Empresarial — História da Empresa",
    produto_mae: "— (nicho próprio: memória empresarial)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-MEM-003",
    produto_oficial: "Entrevista Guiada com Idoso",
    produto_mae: "— (âncora de memória/entrevista)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-MEM-004",
    produto_oficial: "Livro da Historia Familiar",
    produto_mae: "— (âncora de livro de história familiar)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "EXECUÇÃO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "canônico",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-MEM-008",
    produto_oficial: "Livro de Memórias Premium",
    produto_mae: "CA-MEM-004 (verificar sobreposição de linha de livro)",
    categoria: "5. História, memória e legado",
    papel_no_portfolio: "COMPLEMENTO",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "complemento ativo",
    aplicabilidade: APLIC_MEMORIA,
    visibilidade_app: "CONTEÚDO_APROVADO",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
  {
    sku_id: "CA-WPP-002",
    produto_oficial: "Pacote WhatsApp Premium",
    produto_mae: "CA-ASS-002 (avaliar consolidação de linha de planos)",
    categoria: "7. Assinaturas e continuidade",
    papel_no_portfolio: "RECORRÊNCIA",
    status_catalogo_30: "CONDICIONAL",
    decisao: "MANTER",
    ciclo_de_vida: "assinatura",
    aplicabilidade: APLIC_ASSINATURA,
    visibilidade_app: "OFERTA_CONDICIONAL",
    condicao_de_uso: COND_PADRAO,
    observacao: "—",
  },
];

export type DestinoForaCatalogo =
  | "ARQUIVAR_HISTÓRICO"
  | "FASE_2"
  | "PENDENTE_DE_VALIDAÇÃO"
  | "FUNDIR";

export type ItemForaCatalogo = {
  sku_id: string;
  produto: string;
  destino: DestinoForaCatalogo;
  produto_mae_referencia: string;
  justificativa_curta: string;
  acao_futura: string;
};

const J_OLD =
  "Linha histórica (-OLD) preservada para rastreabilidade; sem evidência para reexposição comercial.";
const A_OLD =
  "Manter registro no catálogo, sem reexposição; não priorizar no Catálogo 30.";
const J_FASE2 =
  "Sem evidência operacional direta e sem sobreposição comprovada; não integra o núcleo enxuto agora.";
const A_FASE2 = "Reavaliar em ciclo futuro, sem prioridade na fase atual.";
const J_PEND =
  "Dados insuficientes ou decisão não concluída no saneamento; não priorizar sem validação humana.";
const A_PEND =
  "Aguardar decisão humana antes de qualquer uso em Planejador/CRM/Asaas/App.";
const J_VARIANTE =
  "Variante/derivado com sobreposição direta a item do Catálogo 30.";
const J_SOBREPOSICAO =
  "Sobreposição já apontada no saneamento com item canônico; não expor como item separado.";

const old = (sku_id: string, produto: string, mae: string): ItemForaCatalogo => ({
  sku_id,
  produto,
  destino: "ARQUIVAR_HISTÓRICO",
  produto_mae_referencia: mae,
  justificativa_curta: J_OLD,
  acao_futura: A_OLD,
});

const fase2 = (sku_id: string, produto: string): ItemForaCatalogo => ({
  sku_id,
  produto,
  destino: "FASE_2",
  produto_mae_referencia: "—",
  justificativa_curta: J_FASE2,
  acao_futura: A_FASE2,
});

const pendente = (
  sku_id: string,
  produto: string,
  mae = "—",
  justificativa = J_PEND,
): ItemForaCatalogo => ({
  sku_id,
  produto,
  destino: "PENDENTE_DE_VALIDAÇÃO",
  produto_mae_referencia: mae,
  justificativa_curta: justificativa,
  acao_futura: A_PEND,
});

const fundir = (
  sku_id: string,
  produto: string,
  mae: string,
  variante: boolean,
): ItemForaCatalogo => ({
  sku_id,
  produto,
  destino: "FUNDIR",
  produto_mae_referencia: mae,
  justificativa_curta: variante ? J_VARIANTE : J_SOBREPOSICAO,
  acao_futura: variante
    ? `Consolidar em ${mae} mediante decisão humana.`
    : `Consolidar em ${mae} mediante decisão humana; não reexpor isoladamente.`,
});

/** Entrega B — destino dos 61 itens fora do Catálogo 30. */
export const FORA_DO_CATALOGO_30: readonly ItemForaCatalogo[] = [
  old("CA-ASS-004-OLD", "Assinatura Pós-Reconhecimento (Linha Original)", "CA-ASS-004"),
  pendente(
    "CA-ASS-006",
    "Acervo Digital Familiar (Plano SaaS)",
    "—",
    "Conflito de permanência entre catálogo e material histórico; sem decisão comercial reconciliada.",
  ),
  old("CA-ASS-006-OLD", "Acervo Digital Familiar SaaS (Linha Original)", "CA-ASS-006"),
  fundir("CA-CID-002A", "Revisão de Pasta para Cidadania", "CA-CID-002", true),
  fundir("CA-CID-002B", "Atualização de Pasta para Cidadania", "CA-CID-002", true),
  fundir("CA-CID-002C", "Complemento de Pasta para Cidadania", "CA-CID-002", true),
  fundir("CA-CID-002D", "Pasta + Checklist de Pendências", "CA-CID-002", true),
  fundir("CA-CID-004", "Codice Fiscale", "CA-CID-006", false),
  fundir("CA-CID-005", "SPID", "CA-CID-006", false),
  fundir("CA-CID-007", "Certidao Inteiro Teor", "CA-CID-011", false),
  fundir("CA-CID-008", "Transcricao de Certidao", "CA-CID-014", false),
  pendente("CA-CID-010", "Registro de Casamento"),
  fase2("CA-CID-011", "Pedido Unitario de Certidao Inteiro Teor (unitario)"),
  old("CA-CID-011-OLD", "Pedido Unitário de Certidão (Linha Original)", "CA-CID-011"),
  fase2("CA-CID-012", "Atualizacao do Registro Civil"),
  old("CA-CID-012-OLD", "Atualização do Registro Civil (Linha Original)", "CA-CID-012"),
  fase2("CA-CID-013", "Agendamento de Passaporte Europeu (avulso)"),
  old("CA-CID-013-OLD", "Agendamento de Passaporte Avulso (Linha Original)", "CA-CID-013"),
  fase2("CA-CID-014", "Emissao Unitaria de Transcricao de Atos de Nascimento"),
  old("CA-CID-014-OLD", "Emissão Unitária Transcrição (Linha Original)", "CA-CID-014"),
  fase2("CA-CID-015", "Emissao de Certidoes para Deveres como Cidadao Europeu"),
  old("CA-CID-015-OLD", "Certidões para Deveres Cidadão (Linha Original)", "CA-CID-015"),
  fase2("CA-CID-017", "Registro do Divorcio e Segundo Casamento"),
  old("CA-CID-017-OLD", "Registro do Divórcio (Linha Original)", "CA-CID-017"),
  {
    sku_id: "CA-CID-019",
    produto: "Declaracao de Valor - Ensino Fundamental ate Universidade",
    destino: "PENDENTE_DE_VALIDAÇÃO",
    produto_mae_referencia: "CA-CID-020 (mútuo)",
    justificativa_curta:
      "Sobreposição mútua entre dois SKUs de mesmo escopo; falta decisão sobre qual absorve o outro.",
    acao_futura:
      "Decisão humana: definir SKU canônico entre os dois e destino do descartado.",
  },
  {
    sku_id: "CA-CID-020",
    produto: "Consultoria e Declaracao de Valor",
    destino: "PENDENTE_DE_VALIDAÇÃO",
    produto_mae_referencia: "CA-CID-019 (mútuo)",
    justificativa_curta:
      "Sobreposição mútua entre dois SKUs de mesmo escopo; falta decisão sobre qual absorve o outro.",
    acao_futura:
      "Decisão humana: definir SKU canônico entre os dois e destino do descartado.",
  },
  fase2("CA-CID-021", "Combo Starter Cidadania (Códice + SPID + Consultoria Express)"),
  fase2("CA-CID-022", "AncestralScan™ — Scan Completo de Cidadania (5min)"),
  old("CA-CID-022-OLD", "Diagnóstico de Elegibilidade (Linha Original)", "CA-CID-022"),
  pendente("CA-CID-024", "Consultoria Pontual", "CA-CID-001 (proposto)"),
  pendente(
    "CA-CID-026",
    "AncestralScan™ — Diagnóstico Rápido de Cidadania (60s)",
    "—",
    "Piloto/funil gratuito; não é evidência de demanda paga nem de escopo comercial final.",
  ),
  pendente("CA-COMBO-002", "Combo Legado (Livro + Mapa Ancestral)"),
  fase2("CA-COMBO-003", "Voucher Presente — Entrevista de Memória"),
  old("CA-COMBO-003-OLD", "Voucher Presente Entrevista (Linha Original)", "CA-COMBO-003"),
  old("CA-CURSO-001-OLD", "Kit Pesquisa Faça Você Mesmo (Linha Original)", "CA-CURSO-001"),
  fase2("CA-CURSO-002", "Mini-Curso Online: Genealogia Italiana"),
  old("CA-CURSO-002-OLD", "Mini-Curso Online Genealogia (Linha Original)", "CA-CURSO-002"),
  fase2("CA-CURSO-003", "Webinar Mensal: Descubra Suas Raízes Italianas"),
  old("CA-CURSO-003-OLD", "Webinar Mensal Genealogia (Linha Original)", "CA-CURSO-003"),
  pendente("CA-DOC-001", "Pedido de Certidão"),
  pendente("CA-DOC-002", "Combo de Certidões"),
  fundir("CA-FAM-001", "Familiar Conectado", "CA-FAM-002", true),
  fase2("CA-HIST-003", "Relatório Genealógico Rápido (1 Geração)"),
  old("CA-HIST-003-OLD", "Relatório Genealógico Rápido (Linha Original)", "CA-HIST-003"),
  fase2("CA-IND-003", "Diário de Memórias Personalizado"),
  old("CA-IND-003-OLD", "Diário de Memórias Personalizado (Linha Original)", "CA-IND-003"),
  fase2("CA-IND-004", "Presente de História de Vida — Pacote Gift"),
  old("CA-IND-004-OLD", "Presente de História de Vida (Linha Original)", "CA-IND-004"),
  fase2("CA-IND-007", "Carta ao Futuro — Presente Geracional"),
  old("CA-IND-007-OLD", "Carta ao Futuro (Linha Original)", "CA-IND-007"),
  fase2("CA-MEM-001", "Restauracao e Coloracao de Fotos"),
  fundir("CA-MEM-002", "Kit Memoria Digital", "CA-MEM-003", false),
  pendente("CA-MEM-005", "Mini-Documentario Familiar"),
  pendente("CA-MEM-006", "Capsula do Tempo Digital"),
  fase2("CA-MEM-007", "Acervo Digital da Família"),
  old("CA-MEM-007-OLD", "Acervo Digital da Família (Linha Original)", "CA-MEM-007"),
  fase2("CA-MEM-009", "Mapa Ancestral Ilustrado"),
  old("CA-MEM-009-OLD", "Mapa Ancestral Ilustrado (Linha Original)", "CA-MEM-009"),
  pendente(
    "CA-POS-001",
    "AIRE + Passaporte",
    "CA-CID-003",
    "Link coincide com SKU oficial correlato; possível duplicidade, sem decisão humana.",
  ),
  pendente(
    "CA-REG-001",
    "Registro de Filho / Casamento",
    "CA-CID-009 e trilha de registros",
    "Link coincide com SKU oficial correlato; possível duplicidade, sem decisão humana.",
  ),
  fundir("CA-WPP-001", "Pacote WhatsApp Essencial", "CA-WPP-002", true),
];

export type EtapaCicloVida = {
  etapa_da_jornada: string;
  microentrega_existente: string;
  skus_elegiveis: readonly string[];
  regra_pais_via: string;
  sistema_principal: string;
  cliente_ve: VisibilidadeApp;
};

const REGRA_PARAMETRO =
  "Parâmetro configurável de caso (país/via/núcleo familiar); não cria SKU por país.";
const REGRA_TRANSVERSAL =
  "Transversal a país/via (produto de memória/legado); não cria SKU por país.";
const REGRA_TRANSVERSAL_ASS =
  "Transversal a país/via (produto de continuidade/assinatura); não cria SKU por país.";

/** Entrega C — matriz mínima de ciclo de vida. */
export const MATRIZ_CICLO_VIDA: readonly EtapaCicloVida[] = [
  {
    etapa_da_jornada: "Entrada e diagnóstico",
    microentrega_existente: "Consultoria de Cidadania Italiana",
    skus_elegiveis: ["CA-CID-001"],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "CRM (lead/oportunidade/proposta)",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Estratégia e proposta",
    microentrega_existente:
      "Estudo Genealógico e Patrimonial Aprofundado; Pacote Família Completa; Pesquisa Extra; Pesquisa de Base Familiar; Combo Pesquisa+Diagnóstico",
    skus_elegiveis: [
      "CA-HIST-001",
      "CA-HIST-004",
      "CA-HIST-002",
      "CA-HIST-005",
      "CA-HIST-006",
    ],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "CRM + Planejador (proposta vigente + parâmetros)",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Documentação e pendências",
    microentrega_existente: "Montagem Completa de Pasta para Cidadania",
    skus_elegiveis: ["CA-CID-002"],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "Desk (documento/evidência/pendência)",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Execução",
    microentrega_existente:
      "Assessoria Completa de Cidadania Italiana; Acompanhamento Familiar — Processo Compartilhado",
    skus_elegiveis: ["CA-CID-023", "CA-CID-025"],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "Planejador (marcos de caso)",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Formalização e acompanhamento",
    microentrega_existente: "AIRE + Agendamento de Passaporte",
    skus_elegiveis: ["CA-CID-003"],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "Planejador + Asaas (cobrança do marco)",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Pós-reconhecimento",
    microentrega_existente:
      "Combo Codice+SPID; Registro de 1º Filho; Registro de Filhos Adicionais; Emissão de Transcrição de Atos",
    skus_elegiveis: ["CA-CID-006", "CA-CID-009", "CA-CID-016", "CA-CID-018"],
    regra_pais_via: REGRA_PARAMETRO,
    sistema_principal: "Planejador",
    cliente_ve: "JORNADA",
  },
  {
    etapa_da_jornada: "Legado e continuidade",
    microentrega_existente:
      "Entrevista Guiada; Livro da História Familiar; Livro Biográfico Premium; Autobiografia Express; Legado em Vídeo; Memória Empresarial; Livro de Memórias Premium; Combo Vó",
    skus_elegiveis: [
      "CA-MEM-003",
      "CA-MEM-004",
      "CA-IND-005",
      "CA-IND-001",
      "CA-IND-002",
      "CA-IND-006",
      "CA-MEM-008",
      "CA-COMBO-001",
    ],
    regra_pais_via: REGRA_TRANSVERSAL,
    sistema_principal: "Desk (entrega de conteúdo)",
    cliente_ve: "CONTEÚDO_APROVADO",
  },
  {
    etapa_da_jornada: "Legado e continuidade",
    microentrega_existente:
      "Planos de assinatura (Essência, Memórias, Legado, Cidadão Pós-Reconhecimento, Anual com Desconto), Familiar Conectado Plus, Pacote WhatsApp Premium, Kit Pesquisa Faça Você Mesmo (pendente)",
    skus_elegiveis: [
      "CA-ASS-002",
      "CA-ASS-001",
      "CA-ASS-003",
      "CA-ASS-004",
      "CA-ASS-005",
      "CA-FAM-002",
      "CA-WPP-002",
      "CA-CURSO-001",
    ],
    regra_pais_via: REGRA_TRANSVERSAL_ASS,
    sistema_principal: "CRM + Asaas (assinatura/cobrança recorrente)",
    cliente_ve: "OFERTA_CONDICIONAL",
  },
];

export type DecisaoBloqueadora = {
  decisao: string;
  origem_do_conflito: string;
  impacto: string;
  opcoes_ja_existentes: string;
  responsavel_sugerido: string;
};

/** Entrega D — decisões bloqueadoras. */
export const DECISOES_BLOQUEADORAS: readonly DecisaoBloqueadora[] = [
  {
    decisao:
      "Fusão CA-CID-001 + CA-CID-024 (Consultoria de Cidadania vs. Consultoria Pontual)",
    origem_do_conflito:
      "Preço documentado diverge entre fontes; fusão proposta ainda não decidida (saneamento).",
    impacto:
      "Bloqueia a referência de SKU de entrada no Planejador/CRM — é o primeiro contato comercial do funil.",
    opcoes_ja_existentes:
      "Manter os dois separados; fundir CA-CID-024 em CA-CID-001; arquivar CA-CID-024.",
    responsavel_sugerido: "Tatiana (aprovação comercial)",
  },
  {
    decisao: "Preço/escopo de CA-CID-002 (Montagem de Pasta) — variantes A–D",
    origem_do_conflito:
      "Referência R$ 1.436 versus alternativa R$ 990; variantes A–D (CA-CID-002A/B/C/D) sobrepõem escopo.",
    impacto:
      "Bloqueia proposta vigente, contrato e cobrança correta no Asaas para item central da jornada.",
    opcoes_ja_existentes:
      "Adotar um preço único homologado; absorver A–D como itens internos (Desk) sem SKU próprio.",
    responsavel_sugerido: "Tatiana (homologação de preço na Planilha Mestre)",
  },
  {
    decisao:
      "Escopo avulso vs. bundle de CA-CID-003 (AIRE+Passaporte) e sobreposição com CA-POS-001",
    origem_do_conflito:
      "Auditoria-Mãe registra o caso Giovanna com escopo pós-reconhecimento; link de CA-POS-001 coincide com CA-CID-003.",
    impacto:
      "Bloqueia qual SKU é referenciado no Planejador e cobrado no Asaas na etapa de formalização/pós-reconhecimento.",
    opcoes_ja_existentes:
      "Manter CA-CID-003 como canônico e arquivar CA-POS-001; ou reconciliar como variantes formais distintas.",
    responsavel_sugerido: "Tatiana (decisão de escopo)",
  },
  {
    decisao:
      "Status oficial Arquivado de CA-CURSO-001 vs. classificação CANDIDATO TOP 30",
    origem_do_conflito:
      "SANEAMENTO_DE_SKUS.csv registra status Arquivado; a priorização (Fase 3) classificou como candidato.",
    impacto:
      "Bloqueia a inclusão do item no Catálogo Operacional 30 aprovado e sua exposição no App.",
    opcoes_ja_existentes:
      "Reativar formalmente o SKU; manter Arquivado e remover do Catálogo 30; substituir por outro item da família 6.",
    responsavel_sugerido: "Tatiana (decisão de reativação)",
  },
  {
    decisao:
      "Consolidação da linha de Assinaturas (CA-ASS-001/003/004/005, CA-FAM-002, CA-WPP-002 em relação a CA-ASS-002)",
    origem_do_conflito:
      "Catálogo oficial lista seis a sete variantes de plano sem hierarquia declarada nem preço homologado comum.",
    impacto:
      "Bloqueia a jornada de 'Legado e continuidade' e a proposta comercial de recorrência para o primeiro cliente real de assinatura.",
    opcoes_ja_existentes:
      "Consolidar em 1–2 planos âncora; manter todas as variantes ativas; arquivar as menos usadas.",
    responsavel_sugerido: "Tatiana (arquitetura de planos)",
  },
  {
    decisao:
      "Preço/escopo de CA-CID-023 (Assessoria Completa) divergente entre propostas/casos reais",
    origem_do_conflito:
      "Auditoria-Mãe: proposta/assessoria no caso Giovanna com escopos e preços que ainda conflitam.",
    impacto:
      "Bloqueia contrato e cobrança da entrega de execução principal — item central da jornada de assessoria.",
    opcoes_ja_existentes:
      "Homologar escopo e preço único; ou segmentar em variantes formais com preços distintos.",
    responsavel_sugerido: "Tatiana (homologação de escopo/preço)",
  },
];

/** Regras obrigatórias de arquitetura (fonte de verdade por sistema). */
export const REGRAS_ARQUITETURA_CA06: readonly string[] = [
  "Planilha Mestre → SKU, escopo, preço homologado, condição e link.",
  "Planejador → case_id + sku_id + parâmetros + marcos/lançamentos.",
  "CRM → opportunity_id + proposta vigente + referência SKU + lifecycle.",
  "Asaas → cobrança e status transacional.",
  "Desk → caso, tarefa, evidência, documento, pendência e decisão.",
  "App → somente conteúdo aprovado, jornada, checklist e próximo passo.",
];

export const INVARIANTES_CA06: readonly string[] = [
  "Preço e link não são copiados como fonte no CRM ou Planejador.",
  "Pagamento não é inferido; vem da fonte transacional.",
  "Uma proposta vigente por oportunidade.",
  "Caso ativo só abre após condição de formalização definida.",
  "Dados de teste não migram.",
  "IDs duplicados não são reutilizados.",
  "Conteúdo no App exige aprovação humana.",
  "País/via são parâmetros, não um catálogo paralelo.",
  "Drive e Dropbox estão fora do escopo deste CA-06.",
];

export const RISCOS_CA06: readonly string[] = [
  "Preço/escopo não homologados em nenhum dos 30 itens do catálogo — toda exposição comercial depende de reconciliação prévia com a Planilha Mestre/Asaas.",
  "CA-CURSO-001 está classificado como candidato ao Catálogo 30 mas tem status oficial Arquivado — bloqueia inclusão até decisão humana.",
  "Linha de Assinaturas (7 SKUs candidatos) não tem hierarquia nem plano âncora definido — risco de sobreposição comercial na 'Legado e continuidade'.",
  "CA-CID-019 ↔ CA-CID-020 e CA-CID-024 ↔ CA-CID-001 têm sobreposição mútua/fusão proposta sem decisão — risco de duplicidade se ativados no CRM.",
  "Itens PENDENTE_DE_VALIDAÇÃO (Entrega B) não devem ser referenciados por Planejador/CRM/Desk/App até decisão humana.",
];

export const DECISOES_NECESSARIAS_CA06: readonly string[] = [
  "Aprovar ou ajustar os 30 SKUs e seus papéis no portfólio (Entrega A).",
  "Decidir fusão/arquivamento dos 61 itens fora do catálogo (Entrega B).",
  "Resolver as 6 decisões bloqueadoras (Entrega D), com prioridade em CA-CURSO-001 e na linha de Assinaturas.",
  "Homologar preço/link na Planilha Mestre para os 30 itens antes de qualquer exposição comercial.",
  "Definir CRM operacional e corrigir inconsistências do Planejador (fonte de verdade ainda incompleta, conforme Fase 3).",
];

export const ENTRADAS_CA07: readonly string[] = [
  "Catálogo Operacional 30 aprovado.",
  "Matriz de ciclo de vida.",
  "Lista de microentregas existentes.",
  "Regras de visibilidade App/Desk.",
];

/** Contagem por status do Catálogo 30. */
export function resumoCatalogo30(): Record<StatusCatalogo30, number> {
  const base: Record<StatusCatalogo30, number> = {
    ATIVO: 0,
    PILOTO: 0,
    CONDICIONAL: 0,
    PENDENTE: 0,
  };
  for (const item of CATALOGO_OPERACIONAL_30) base[item.status_catalogo_30] += 1;
  return base;
}

/** Contagem por destino dos itens fora do Catálogo 30. */
export function resumoForaCatalogo(): Record<DestinoForaCatalogo, number> {
  const base: Record<DestinoForaCatalogo, number> = {
    ARQUIVAR_HISTÓRICO: 0,
    FASE_2: 0,
    PENDENTE_DE_VALIDAÇÃO: 0,
    FUNDIR: 0,
  };
  for (const item of FORA_DO_CATALOGO_30) base[item.destino] += 1;
  return base;
}

/**
 * Um SKU só pode ser referenciado por Planejador/CRM/Desk quando a decisão
 * do Catálogo 30 não está pendente. Guarda de leitura, sem efeito externo.
 */
export function podeReferenciarSku(skuId: string): boolean {
  const item = CATALOGO_OPERACIONAL_30.find((i) => i.sku_id === skuId);
  if (!item) return false;
  return item.decisao === "MANTER" && item.status_catalogo_30 !== "PENDENTE";
}

/** Exportação CSV somente leitura do Catálogo 30. */
export function csvCatalogo30(): string {
  const cabecalho = [
    "sku_id",
    "produto_oficial",
    "produto_mae",
    "categoria",
    "papel_no_portfolio",
    "status_catalogo_30",
    "decisao",
    "ciclo_de_vida",
    "aplicabilidade",
    "visibilidade_app",
    "condicao_de_uso",
    "observacao",
  ];
  const escapar = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const linhas = CATALOGO_OPERACIONAL_30.map((i) =>
    [
      i.sku_id,
      i.produto_oficial,
      i.produto_mae,
      i.categoria,
      i.papel_no_portfolio,
      i.status_catalogo_30,
      i.decisao,
      i.ciclo_de_vida,
      i.aplicabilidade,
      i.visibilidade_app,
      i.condicao_de_uso,
      i.observacao,
    ]
      .map(escapar)
      .join(","),
  );
  return [cabecalho.join(","), ...linhas].join("\n");
}
