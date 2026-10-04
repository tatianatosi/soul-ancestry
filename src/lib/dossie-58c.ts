/**
 * Checklist Consolidado §58c StbG — template de dossiê por cliente (04/10/2026).
 *
 * Proprietária: "leia e execute o dossiê da Ana e junto do histórico completo
 * da Ana... anexei também o skill que foi criado para trazer e montar o dossiê
 * de cada cliente".
 *
 * A skill `ca-client-go-live` produz o dossiê como documento no Drive. Aqui ele
 * vira **dado do Desk**: o template é código (reaproveitável por cliente, é a
 * trilha §58c, não a Ana), e as instâncias vivem em `research_pending_items` do
 * caso. Nenhum PII da Ana entra neste arquivo — nome de ascendente, data e
 * localidade vêm de `research_people`/`lineage_paths`, não daqui.
 *
 * Por que isto precisava existir: ela apontou, com razão, que "foi enviado
 * diversos dossiê checklists sobre o caso da Ana, onde os dados ainda não foram
 * migrados pois não se tem campos pra eles". A medição confirmou: o caso dela
 * tinha **6** pendências de pesquisa, todas `resolved`, e os quatro BLOCOS do
 * checklist §58c não tinham nenhuma linha.
 *
 * O que este módulo **não** faz: não consulta fonte externa, não solicita
 * documento, não aprova despesa, não conclui prova. Semear item de checklist é
 * registrar o que falta — nunca afirmar que foi obtido.
 */

/** Categorias reais do CHECK de `research_pending_items.category`. */
export type CategoriaPendencia =
  | "identity"
  | "relationship"
  | "event"
  | "source"
  | "document"
  | "conflict"
  | "authorization"
  | "external_gate"
  | "review"
  | "other";

/** Severidades reais do CHECK de `research_pending_items.severity`. */
export type SeveridadePendencia = "critical" | "high" | "medium" | "low";

/**
 * A quem o item se aplica. Decide quantas instâncias ele gera no caso — e é a
 * razão de o template não citar pessoa: "cada adulto requerente" é resolvido
 * contra `case_members`, nunca contra uma lista escrita no código.
 */
export type AlcanceItem =
  | "cada_adulto_requerente"
  | "cada_dependente"
  | "ascendentes_prioritarios"
  | "cada_elo_da_cadeia"
  | "caso";

export type ItemChecklist58c = {
  /** Estável: é a chave de idempotência do seed, com o alcance resolvido. */
  id: string;
  bloco: 1 | 2 | 3 | 4;
  secao: string;
  titulo: string;
  categoria: CategoriaPendencia;
  severidade: SeveridadePendencia;
  alcance: AlcanceItem;
  /** Instituição/acervo provável, em texto. Nunca URL, nunca ao cliente. */
  fonteProvavel: string | null;
  observacao: string | null;
};

export const BLOCOS_58C = [
  { numero: 1 as const, titulo: "Documentos do requerente", resumo: "Identidade, certidões e antecedentes de cada requerente adulto e do dependente menor." },
  { numero: 2 as const, titulo: "Documentos do ascendente perseguido", resumo: "Cidadania/vínculo austríaco, residência, localidades, arquivo militar e imigração/naturalização." },
  { numero: 3 as const, titulo: "Prova de perseguição", resumo: "Condição perseguida, fontes específicas e o eixo de não naturalização brasileira." },
  { numero: 4 as const, titulo: "Cadeia de descendência", resumo: "Ligação direta do ascendente a cada requerente, elo por elo, sem ruptura." },
];

/**
 * BLOCO 1 — documentos do requerente.
 *
 * `cada_adulto_requerente` substitui as três colunas nominais do checklist
 * original (Ana / pai / irmã): o Desk sabe quem são os requerentes do caso por
 * `case_members`, e um template nominal não serviria ao próximo cliente.
 */
const BLOCO_1: ItemChecklist58c[] = [
  { id: "1.1.anzeige", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Formulário de declaração (Anzeige) do §58c", categoria: "document", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "MA 35 / consulado austríaco", observacao: "Formulário oficial; etapa de formalização, após fechar a pesquisa." },
  { id: "1.1.passaporte", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Passaporte brasileiro válido", categoria: "document", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "Documento em posse do requerente", observacao: "Precisa estar válido no protocolo." },
  { id: "1.1.foto", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Foto atual padrão consular", categoria: "document", severidade: "medium", alcance: "cada_adulto_requerente", fonteProvavel: "Documento em posse do requerente", observacao: "Padrão consular austríaco." },
  { id: "1.1.nascimento", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Certidão de nascimento atualizada", categoria: "document", severidade: "critical", alcance: "cada_adulto_requerente", fonteProvavel: "Registro civil brasileiro", observacao: "Atualizada; prazo curto quando solicitada recente." },
  { id: "1.1.estado_civil", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Certidão de casamento, divórcio, óbito de cônjuge ou união registrada", categoria: "document", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "Registro civil brasileiro", observacao: "Quando aplicável ao estado civil do requerente." },
  { id: "1.1.alteracao_nome", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Documentos que expliquem toda alteração de nome", categoria: "conflict", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "Registro civil brasileiro", observacao: "Inclui retificação, casamento e adoção." },
  { id: "1.1.antecedentes", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Certidão de antecedentes criminais", categoria: "document", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "Órgão competente brasileiro", observacao: "Emitida há no máximo 8 meses no protocolo." },
  { id: "1.1.residencia", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Comprovante de residência atual", categoria: "document", severidade: "medium", alcance: "cada_adulto_requerente", fonteProvavel: "Documento em posse do requerente", observacao: null },
  { id: "1.1.traducao", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Tradução juramentada para o alemão", categoria: "document", severidade: "medium", alcance: "cada_adulto_requerente", fonteProvavel: "Tradutor juramentado", observacao: "Dos documentos que não estejam em alemão ou inglês. Despesa de terceiro." },
  { id: "1.1.apostila", bloco: 1, secao: "1.1 Documentos pessoais de cada adulto", titulo: "Apostila de Haia", categoria: "document", severidade: "medium", alcance: "cada_adulto_requerente", fonteProvavel: "Cartório/tabelionato habilitado", observacao: "Quando exigida para o documento brasileiro. Despesa de terceiro." },

  { id: "1.2.nascimento", bloco: 1, secao: "1.2 Dependente menor", titulo: "Certidão de nascimento do dependente menor", categoria: "document", severidade: "high", alcance: "cada_dependente", fonteProvavel: "Registro civil brasileiro", observacao: "Vinculada ao requerente responsável." },
  { id: "1.2.representacao", bloco: 1, secao: "1.2 Dependente menor", titulo: "Documentação de representação legal do menor", categoria: "identity", severidade: "critical", alcance: "cada_dependente", fonteProvavel: "Documento em posse do responsável legal", observacao: "Menor não assina; representação precisa estar registrada antes de qualquer ato." },
  { id: "1.2.passaporte", bloco: 1, secao: "1.2 Dependente menor", titulo: "Passaporte do dependente, se exigido no protocolo", categoria: "document", severidade: "low", alcance: "cada_dependente", fonteProvavel: "Documento em posse do responsável legal", observacao: "Verificar requisito consular." },

  { id: "1.3.cadastro", bloco: 1, secao: "1.3 Dados de contato do pré-onboarding", titulo: "Dados cadastrais completos (nome, documento, nascimento, estado civil, endereço, contato)", categoria: "identity", severidade: "high", alcance: "cada_adulto_requerente", fonteProvavel: "Pessoa 360 do Desk", observacao: "Coleta do pré-onboarding. Dono do dado é a Pessoa 360 — nenhuma outra ficha guarda cópia." },
];

/** BLOCO 2 — ascendente perseguido. */
const BLOCO_2: ItemChecklist58c[] = [
  { id: "2.1.passaporte_austriaco", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Passaporte austríaco antigo", categoria: "document", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivo familiar", observacao: "Quando mencionado pela família, digitalizar integralmente antes de qualquer conclusão." },
  { id: "2.1.heimatschein", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Heimatschein (certidão de pertença municipal)", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 35 / arquivo municipal", observacao: null },
  { id: "2.1.heimatrolle", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Heimatrollenauszug (extrato do registro de pertença)", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 35", observacao: null },
  { id: "2.1.nachweis", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Staatsbürgerschaftsnachweis (certificado de cidadania)", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 35", observacao: null },
  { id: "2.1.feststellung", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Staatsbürgerschaftsfeststellung (verificação de cidadania)", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 35", observacao: null },
  { id: "2.1.altmatrik", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Registro civil histórico (Geburts-, Heirats-, Sterbematrik)", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 61 / Zivile Altmatrik", observacao: "Para pessoa com evento registrado em Viena." },
  { id: "2.1.zentralkartothek", bloco: 2, secao: "2.1 Cidadania e vínculo austríaco", titulo: "Registro central histórico (Wiener Zentralkartothek)", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivo municipal de Viena", observacao: null },

  { id: "2.2.meldeunterlagen", bloco: 2, secao: "2.2 Residência", titulo: "Ficha histórica de residência (Historische Meldeunterlagen)", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 8 / Arquivo Municipal e Provincial de Viena", observacao: "Período a declarar na solicitação; busca exige dados mínimos." },
  { id: "2.2.meldezettel", bloco: 2, secao: "2.2 Residência", titulo: "Registro de endereço (Melderegister / Meldezettel)", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "MA 8", observacao: "Conforme disponibilidade do acervo." },

  { id: "2.3.localidade_nascimento", bloco: 2, secao: "2.3 Localidades austríacas e sucessoras", titulo: "Certidão de nascimento completa na localidade de origem", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "Registro civil / arquivo local da localidade", observacao: "Localidade e ano vêm de research_people, nunca de lista escrita no código." },
  { id: "2.3.localidade_pertenca", bloco: 2, secao: "2.3 Localidades austríacas e sucessoras", titulo: "Heimatrolle / Heimatschein na localidade de origem", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Município / arquivo regional", observacao: null },
  { id: "2.3.localidade_residencia", bloco: 2, secao: "2.3 Localidades austríacas e sucessoras", titulo: "Registro de residência na localidade de origem", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivo municipal", observacao: null },
  { id: "2.3.localidade_casamento", bloco: 2, secao: "2.3 Localidades austríacas e sucessoras", titulo: "Certidão de casamento na localidade de origem", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Registro civil, paróquia ou comunidade religiosa", observacao: null },
  { id: "2.3.localidade_filiacao", bloco: 2, secao: "2.3 Localidades austríacas e sucessoras", titulo: "Nascimento e filiação em arquivo de Estado sucessor", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivo local/paroquial ou arquivo de Estado sucessor", observacao: "Para localidade hoje fora da Áustria (Morávia, Galícia etc.)." },

  { id: "2.4.servico_militar", bloco: 2, secao: "2.4 Arquivo militar (Kriegsarchiv)", titulo: "Registro de serviço ou alistamento militar", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Kriegsarchiv (ÖStA)", observacao: "Devolve unidade, posto, local e referência arquivística — reforça identidade." },
  { id: "2.4.ficha_pessoal", bloco: 2, secao: "2.4 Arquivo militar (Kriegsarchiv)", titulo: "Ficha pessoal militar", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Kriegsarchiv (ÖStA)", observacao: "Buscar por nome e variações registradas na regra de nomes." },
  { id: "2.4.matriculas", bloco: 2, secao: "2.4 Arquivo militar (Kriegsarchiv)", titulo: "Matrículas militares do período 1914–1918", categoria: "source", severidade: "low", alcance: "ascendentes_prioritarios", fonteProvavel: "Kriegsarchiv (ÖStA)", observacao: "Eventos civis/militares que reforcem identidade." },

  { id: "2.5.imigracao", bloco: 2, secao: "2.5 Imigração e naturalização", titulo: "Registro de imigração com nacionalidade declarada", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "APESP / Arquivo Nacional / Museu da Imigração", observacao: "Prova a nacionalidade austríaca declarada na entrada no Brasil." },
  { id: "2.5.passageiros", bloco: 2, secao: "2.5 Imigração e naturalização", titulo: "Lista de passageiros", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivos de imigração e companhias de navegação", observacao: "Confirma viagem, origem e composição familiar." },
  { id: "2.5.registro_estrangeiro", bloco: 2, secao: "2.5 Imigração e naturalização", titulo: "Registro de estrangeiro no Brasil", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Polícia Federal / arquivo competente", observacao: "Nacionalidade e residência no Brasil." },
  { id: "2.5.consular", bloco: 2, secao: "2.5 Imigração e naturalização", titulo: "Documento consular austríaco no Brasil", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Consulados / Embaixada da Áustria", observacao: "Status consular e nacionalidade." },
];

/** BLOCO 3 — prova de perseguição. */
const BLOCO_3: ItemChecklist58c[] = [
  { id: "3.1.condicao_perseguida", bloco: 3, secao: "3.1 Eixos de evidência persecutória", titulo: "Prova documental da condição perseguida", categoria: "event", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "Registros de comunidade religiosa, cemitério, listas comunitárias", observacao: "Condição relatada pela família não é prova: precisa reforço documental." },
  { id: "3.1.perda_cidadania", bloco: 3, secao: "3.1 Eixos de evidência persecutória", titulo: "Perda de cidadania ou risco persecutório no período nacional-socialista", categoria: "event", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "Fontes oficiais austríacas e dossiê jurídico", observacao: "Forte por conjunto de evidências, não por documento único." },
  { id: "3.1.perseguicao_direta", bloco: 3, secao: "3.1 Eixos de evidência persecutória", titulo: "Perseguição direta (deportação, confisco, expulsão, restrição, perda de bens)", categoria: "event", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arolsen Archives, Yad Vashem, USHMM, arquivos austríacos", observacao: null },
  { id: "3.1.fuga", bloco: 3, secao: "3.1 Eixos de evidência persecutória", titulo: "Fuga ou emigração por motivo de perseguição", categoria: "event", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivos de imigração, registros consulares, arquivo familiar", observacao: "Saída antes de 15/05/1955 é critério quando ocorreu por perseguição." },
  { id: "3.1.depoimentos", bloco: 3, secao: "3.1 Eixos de evidência persecutória", titulo: "Depoimentos e relatos complementares", categoria: "source", severidade: "low", alcance: "ascendentes_prioritarios", fonteProvavel: "Família, comunidades, arquivo", observacao: "Complementar: memória familiar nunca substitui documento." },

  { id: "3.2.arolsen", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta ao Arolsen Archives", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arolsen Archives", observacao: "Resultado negativo também é registrado: busca negativa declara escopo, não conclui." },
  { id: "3.2.yad_vashem", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta ao Yad Vashem", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Yad Vashem", observacao: null },
  { id: "3.2.ushmm", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta ao USHMM", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "USHMM", observacao: null },
  { id: "3.2.comunidade", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta à comunidade religiosa de origem (registros de nascimento, casamento, óbito)", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "IKG Wien / comunidade local", observacao: null },
  { id: "3.2.doew", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta ao DÖW (arquivo de documentação da resistência austríaca)", categoria: "source", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "DÖW", observacao: null },
  { id: "3.2.oesta", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Consulta ao Arquivo Nacional da Áustria (registros de perda de cidadania)", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "ÖStA", observacao: null },
  { id: "3.2.cartao_vitima", bloco: 3, secao: "3.2 Fontes específicas de perseguição", titulo: "Cartão de vítima da República Austríaca", categoria: "document", severidade: "medium", alcance: "ascendentes_prioritarios", fonteProvavel: "Autoridade austríaca / arquivo familiar", observacao: null },

  { id: "3.4.certidao_naturalizacao", bloco: 3, secao: "3.4 Não naturalização brasileira", titulo: "Certidão positiva ou negativa de naturalização brasileira", categoria: "source", severidade: "critical", alcance: "ascendentes_prioritarios", fonteProvavel: "Ministério da Justiça / DEMIG (e-Certidão)", observacao: "Crítico: naturalização anterior a 23/07/1938 pode ter extinguido a cidadania austríaca por ato próprio. Naturalização posterior, por perseguido, não impede o §58c." },
  { id: "3.4.processo_naturalizacao", bloco: 3, secao: "3.4 Não naturalização brasileira", titulo: "Processo de naturalização integral, se houver", categoria: "source", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: "Arquivo Nacional / SIAN", observacao: "Obter cópia integral e a data." },
];

/** BLOCO 4 — cadeia de descendência. */
const BLOCO_4: ItemChecklist58c[] = [
  { id: "4.2.documento_do_elo", bloco: 4, secao: "4.2 Documentos por elo", titulo: "Documento principal do elo (nascimento, casamento ou óbito)", categoria: "relationship", severidade: "critical", alcance: "cada_elo_da_cadeia", fonteProvavel: "Registro civil da jurisdição do elo", observacao: "Um elo sem documento é ruptura declarada, nunca elo presumido." },
  { id: "4.2.complemento_do_elo", bloco: 4, secao: "4.2 Documentos por elo", titulo: "Complementos do elo (identidade, alteração de nome, filiação)", categoria: "relationship", severidade: "high", alcance: "cada_elo_da_cadeia", fonteProvavel: "Registro civil da jurisdição do elo", observacao: null },
  { id: "4.3.ruptura_nome", bloco: 4, secao: "4.3 Pontos de ruptura", titulo: "Conferência de nome de solteira e nome após casamento em cada elo", categoria: "conflict", severidade: "high", alcance: "caso", fonteProvavel: null, observacao: "Divergência de grafia não se resolve por semelhança: exige documento." },
  { id: "4.3.ruptura_datas", bloco: 4, secao: "4.3 Pontos de ruptura", titulo: "Conferência de datas e locais divergentes entre certidões", categoria: "conflict", severidade: "high", alcance: "caso", fonteProvavel: null, observacao: null },
  { id: "4.3.ruptura_filiacao", bloco: 4, secao: "4.3 Pontos de ruptura", titulo: "Conferência de filiação fora do casamento, adoção, reconhecimento ou sentença", categoria: "conflict", severidade: "high", alcance: "caso", fonteProvavel: null, observacao: null },
  { id: "4.3.ruptura_casamento", bloco: 4, secao: "4.3 Pontos de ruptura", titulo: "Localizar certidão de casamento faltante em elo anterior", categoria: "conflict", severidade: "critical", alcance: "caso", fonteProvavel: "Registro civil, paróquia ou arquivo local", observacao: "Lacuna conhecida em cadeias longas: o elo mais antigo é o mais frágil." },
  { id: "4.3.obitos", bloco: 4, secao: "4.3 Pontos de ruptura", titulo: "Certidões de óbito para confirmar identidade e estado civil por geração", categoria: "document", severidade: "medium", alcance: "caso", fonteProvavel: "Registro civil", observacao: null },
  { id: "4.4.variantes_nome", bloco: 4, secao: "4.4 Regra de nomes", titulo: "Registrar variantes de grafia a pesquisar para cada ascendente", categoria: "identity", severidade: "high", alcance: "ascendentes_prioritarios", fonteProvavel: null, observacao: "As variantes vivem em research_people/variantes de nome, não em texto solto." },
];

export const CHECKLIST_58C: ItemChecklist58c[] = [...BLOCO_1, ...BLOCO_2, ...BLOCO_3, ...BLOCO_4];

/** Prefixo que identifica, no título gravado, um item vindo deste template. */
export const MARCA_CHECKLIST_58C = "§58c";

/** Título da instância: `§58c 2.1.heimatschein — <titulo>` (+ pessoa, quando houver). */
export function tituloInstancia(item: ItemChecklist58c, pessoa?: string | null): string {
  const base = `${MARCA_CHECKLIST_58C} ${item.id} — ${item.titulo}`;
  return pessoa && pessoa.trim() ? `${base} · ${pessoa.trim()}` : base;
}

/**
 * De-para dos oito campos que o checklist da Proprietária exige por item.
 *
 * Ela pediu, para cada item: status, responsável, data de solicitação, fonte,
 * custo estimado, aprovação de despesa, arquivo/link e conclusão probatória.
 * Nenhum deles ganhou tabela nova — cada um já tem dono, e dois são **lidos
 * pela FK**, nunca copiados (a classificação M já seguia essa regra).
 */
export const DE_PARA_CAMPOS_CHECKLIST = [
  {
    campo: "status",
    destino: "research_pending_items.status",
    vocabulario: "open · in_progress · blocked · resolved · not_applicable · archived",
    copia: false,
    nota: "Os nove status do documento mapeiam para estes seis; nada de vocabulário novo.",
  },
  {
    campo: "responsável",
    destino: "research_pending_items.responsible_user_id",
    vocabulario: "usuário da organização",
    copia: false,
    nota: "Vazio significa a equipe institucional — não se pergunta de novo a cada item.",
  },
  {
    campo: "data de solicitação",
    destino: "research_document_requests.requested_at",
    vocabulario: "timestamp",
    copia: false,
    nota: "A solicitação é um ato próprio: vive no log de consulta, não no item de checklist.",
  },
  {
    campo: "fonte",
    destino: "research_document_requests.genealogical_source_id → genealogical_sources_catalog",
    vocabulario: "catálogo oficial de fontes",
    copia: false,
    nota: "FK para o catálogo; a fonte provável do template é só sugestão em texto.",
  },
  {
    campo: "custo estimado",
    destino: "genealogical_sources_catalog.custo (por leitura da FK)",
    vocabulario: "texto do catálogo",
    copia: false,
    nota: "O custo é atributo da fonte, não do item. Copiar criaria duas verdades.",
  },
  {
    campo: "aprovação de despesa",
    destino: "research_document_requests.external_gate_status + Anexo II do contrato",
    vocabulario: "pending_authorization · eligible_for_human_release · released_by_authorized_user",
    copia: false,
    nota: "Despesa externa só com aprovação prévia registrada; o Anexo II é o instrumento.",
  },
  {
    campo: "arquivo/link",
    destino: "case_source_documents (+ legibilidade e integridade)",
    vocabulario: "ok · parcial · ilegivel/comprometida · a_avaliar",
    copia: false,
    nota: "Documento recebido e não revisado fica a_avaliar — nunca entra como ok.",
  },
  {
    campo: "conclusão probatória",
    destino: "research_evidence_items.evidence_status / status_pesquisa",
    vocabulario: "a_confirmar · pendente · hipotese · provavel · com_suporte · confirmado · refutado",
    copia: false,
    nota: "Item de checklist nunca conclui prova: a conclusão é da evidência, com revisão humana.",
  },
] as const;

/** Os nove status do documento → os seis do CHECK real. Leitura, não gravação. */
export const DE_PARA_STATUS_DOCUMENTO: Record<string, string> = {
  "Não iniciado": "open",
  "Em coleta": "in_progress",
  "Solicitado": "in_progress",
  "Recebido": "in_progress",
  "Em revisão": "in_progress",
  "Bloqueado": "blocked",
  "Não aplicável": "not_applicable",
  "Concluído": "resolved",
  "Arquivado": "archived",
};

export function itensDoBloco(bloco: 1 | 2 | 3 | 4): ItemChecklist58c[] {
  return CHECKLIST_58C.filter((i) => i.bloco === bloco);
}

export function itensPorAlcance(alcance: AlcanceItem): ItemChecklist58c[] {
  return CHECKLIST_58C.filter((i) => i.alcance === alcance);
}

/**
 * Quantas instâncias o template gera para uma composição de caso. Serve para a
 * tela dizer o tamanho antes de semear, e para o teste não aceitar um seed que
 * cresce sozinho.
 */
export function totalDeInstancias(composicao: {
  adultos: number;
  dependentes: number;
  elos: number;
}): number {
  let total = 0;
  for (const i of CHECKLIST_58C) {
    if (i.alcance === "cada_adulto_requerente") total += composicao.adultos;
    else if (i.alcance === "cada_dependente") total += composicao.dependentes;
    else if (i.alcance === "ascendentes_prioritarios") total += 1;
    else if (i.alcance === "cada_elo_da_cadeia") total += composicao.elos;
    else total += 1;
  }
  return total;
}
