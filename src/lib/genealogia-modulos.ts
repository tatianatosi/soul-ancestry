/**
 * G-02c — Módulos históricos da Ficha Piloto Genealógica e projeção ao cliente.
 *
 * Todo registro é interno por padrão. Nada aqui inicia pesquisa externa, pedido
 * de certidão, contato com instituição, criação de pasta/documento externo,
 * comunicação ou publicação automática no App Cliente.
 */

import {
  MOTIVO_SEM_PROJECAO,
  rotuloDe,
  type Evento,
  type ItemTimeline,
  type NoArvore,
  type Opcao,
  type Perfil,
  type Relacao,
} from "@/lib/pessoas-linhagens";

/* ------------------------------------------------------------------ */
/* Catálogo fixo dos 13 módulos                                        */
/* ------------------------------------------------------------------ */

export type ModuloHistorico = {
  tabela: string;
  rotulo: string;
  descricao: string;
  subtipos: string[];
};

export const MODULOS_HISTORICOS: ModuloHistorico[] = [
  {
    tabela: "residences_migrations",
    rotulo: "Residências e migrações",
    descricao: "Endereços, mudanças, embarques e fixação de residência.",
    subtipos: ["residência", "mudança interna", "emigração", "imigração", "retorno"],
  },
  {
    tabela: "occupations_assets",
    rotulo: "Trabalho e patrimônio",
    descricao: "Ofícios, vínculos de trabalho, terras e bens declarados.",
    subtipos: ["ofício", "vínculo empregatício", "propriedade rural", "imóvel urbano", "sociedade"],
  },
  {
    tabela: "military_records",
    rotulo: "Vida militar",
    descricao: "Alistamento, serviço, dispensa e registros de leva.",
    subtipos: ["alistamento", "serviço ativo", "dispensa", "reservista", "lista de leva"],
  },
  {
    tabela: "notarial_records",
    rotulo: "Atos notariais",
    descricao: "Escrituras, procurações, inventários e testamentos.",
    subtipos: ["escritura", "procuração", "inventário", "testamento", "partilha"],
  },
  {
    tabela: "cadastral_records",
    rotulo: "Cadastro civil e fiscal",
    descricao: "Recenseamentos, cadastros fiscais e listas nominativas.",
    subtipos: ["censo", "cadastro fiscal", "lista nominativa", "registro eleitoral"],
  },
  {
    tabela: "education_records",
    rotulo: "Educação e formação",
    descricao: "Matrículas, diplomas e formação técnica ou superior.",
    subtipos: ["matrícula", "conclusão", "diploma", "curso técnico"],
  },
  {
    tabela: "cultural_records",
    rotulo: "Cultura e língua",
    descricao: "Língua falada, dialeto, tradições e práticas culturais.",
    subtipos: ["língua", "dialeto", "tradição familiar", "culinária", "ofício cultural"],
  },
  {
    tabela: "religious_records",
    rotulo: "Vida religiosa",
    descricao: "Batismo, crisma, casamento religioso e vínculos de paróquia.",
    subtipos: ["batismo", "crisma", "casamento religioso", "óbito religioso", "paróquia"],
  },
  {
    tabela: "correspondence_records",
    rotulo: "Correspondência e memória escrita",
    descricao: "Cartas, diários, bilhetes e anotações preservadas.",
    subtipos: ["carta", "diário", "bilhete", "caderno", "anotação avulsa"],
  },
  {
    tabela: "social_political_records",
    rotulo: "Vida social e política",
    descricao: "Associações, sindicatos, cargos e participação comunitária.",
    subtipos: ["associação", "sindicato", "cargo público", "clube", "participação comunitária"],
  },
  {
    tabela: "audiovisual_records",
    rotulo: "Acervo audiovisual",
    descricao: "Fotografias, gravações e filmes de família.",
    subtipos: ["fotografia", "gravação de áudio", "filme", "entrevista"],
  },
  {
    tabela: "preserved_objects",
    rotulo: "Objetos preservados",
    descricao: "Objetos de família com valor de memória ou indício documental.",
    subtipos: ["documento físico", "utensílio", "joia", "vestuário", "ferramenta"],
  },
  {
    tabela: "historical_context_events",
    rotulo: "Contexto histórico",
    descricao: "Fatos históricos que afetaram a família, sem juízo de mérito.",
    subtipos: ["guerra", "epidemia", "crise econômica", "política migratória", "desastre natural"],
  },
];

export const MODULOS_POR_TABELA = new Map(MODULOS_HISTORICOS.map((m) => [m.tabela, m]));

export const ehModuloHistorico = (tabela: string) => MODULOS_POR_TABELA.has(tabela);

/* ------------------------------------------------------------------ */
/* Listas controladas                                                  */
/* ------------------------------------------------------------------ */

export const PRECISAO_DATA: Opcao[] = [
  { id: "exata", rotulo: "Exata" },
  { id: "aproximada", rotulo: "Aproximada" },
  { id: "estimada", rotulo: "Estimada" },
  { id: "desconhecida", rotulo: "Desconhecida" },
];

export const STATUS_MODULO: Opcao[] = [
  { id: "confirmado", rotulo: "Confirmado" },
  { id: "provavel", rotulo: "Provável" },
  { id: "hipotese", rotulo: "Hipótese" },
  { id: "pendente", rotulo: "Pendente" },
  { id: "nao_aplicavel", rotulo: "Não aplicável" },
  { id: "refutado", rotulo: "Refutado" },
];

export const VISIBILIDADE_CLIENTE: Opcao[] = [
  { id: "interna", rotulo: "Interna (não projeta)" },
  { id: "sanitizada", rotulo: "Sanitizada (aguarda aprovação)" },
  { id: "aprovada", rotulo: "Aprovada para o App Cliente" },
];

export type RegistroModulo = {
  id: string;
  case_id: string;
  person_id: string | null;
  titulo: string;
  subtipo: string | null;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  data_precisao: string;
  localidade: string | null;
  descricao_interna: string | null;
  evidence_id: string | null;
  source_id: string | null;
  status_verificacao: string;
  client_visibility: string;
  archived_at?: string | null;
};

/* ------------------------------------------------------------------ */
/* Validação (espelha as travas do banco)                              */
/* ------------------------------------------------------------------ */

const vazio = (v: unknown) => v === null || v === undefined || String(v).trim() === "";

export function validarRegistroModulo(r: Partial<RegistroModulo>): string[] {
  const erros: string[] = [];
  if (vazio(r.titulo)) erros.push("Título do registro é obrigatório.");
  if (r.status_verificacao === "confirmado" && vazio(r.evidence_id) && vazio(r.source_id)) {
    erros.push("Registro confirmado exige evidência ou fonte vinculada.");
  }
  if (r.periodo_inicio && r.periodo_fim && r.periodo_fim < r.periodo_inicio) {
    erros.push("Período final não pode ser anterior ao inicial.");
  }
  if (r.client_visibility === "aprovada" && r.status_verificacao !== "confirmado") {
    erros.push("Só registro confirmado pode ser aprovado para o App Cliente.");
  }
  return erros;
}

/* ------------------------------------------------------------------ */
/* Legendas de estado na árvore e na timeline internas                 */
/* ------------------------------------------------------------------ */

export function legendaEstado(status: string): string {
  switch (status) {
    case "confirmado":
      return "Confirmado com evidência";
    case "provavel":
      return "Provável — suporte parcial";
    case "hipotese":
      return "Hipótese de pesquisa";
    case "refutado":
      return "Refutado — fora da árvore ativa";
    case "nao_aplicavel":
      return "Não aplicável";
    default:
      return "Pendente de verificação";
  }
}

/** Relação refutada não entra na árvore ativa; permanece no histórico. */
export const relacaoAtivaNaArvore = (statusPesquisa: string) =>
  statusPesquisa !== "refutado" && statusPesquisa !== "descartado";

/* ------------------------------------------------------------------ */
/* Projeção ao App Cliente — apenas o que foi aprovado                 */
/* ------------------------------------------------------------------ */

export type NoArvoreCliente = {
  personId: string;
  nome: string;
  geracao: number;
  filhos: NoArvoreCliente[];
};

export type ProjecaoCliente = {
  publicavel: boolean;
  motivo: string | null;
  arvore: NoArvoreCliente[];
  timeline: { id: string; pessoa: string; titulo: string; data: string; localidade: string | null }[];
  ocultos: number;
};

const aprovado = (v: unknown) => v === "aprovada";

/**
 * Deriva a projeção cliente da ficha interna: só entram pessoas, relações e
 * eventos marcados como aprovados. Nada é publicado por esta função — ela
 * apenas calcula o que seria visível se houver devolutiva aprovada.
 */
export function projetarParaCliente(
  perfis: Perfil[],
  relacoes: Relacao[],
  eventos: Evento[],
  arvoreInterna: NoArvore[],
): ProjecaoCliente {
  const ativos = <T extends { archived_at?: string | null }>(l: T[]) => l.filter((i) => !i.archived_at);
  const perfisAtivos = ativos(perfis);
  const perfisOk = new Set(
    perfisAtivos
      .filter((p) => aprovado((p as unknown as { client_visibility?: string }).client_visibility))
      .map((p) => p.research_person_id),
  );
  const relacoesOk = new Set(
    ativos(relacoes)
      .filter((r) => aprovado((r as unknown as { client_visibility?: string }).client_visibility))
      .map((r) => `${r.person_from_id}|${r.person_to_id}`),
  );

  const podar = (nos: NoArvore[], geracao = 0): NoArvoreCliente[] =>
    nos
      .filter((n) => perfisOk.has(n.personId))
      .map((n) => ({
        personId: n.personId,
        nome: n.nome,
        geracao,
        filhos: podar(
          n.filhos.filter(
            (f) => relacoesOk.has(`${n.personId}|${f.personId}`) || relacoesOk.has(`${f.personId}|${n.personId}`),
          ),
          geracao + 1,
        ),
      }));

  const arvore = podar(arvoreInterna);
  const nomes = new Map(perfisAtivos.map((p) => [p.research_person_id, p.nome_completo]));
  const eventosOk = ativos(eventos).filter(
    (e) => aprovado((e as unknown as { client_visibility?: string }).client_visibility) && perfisOk.has(e.person_id),
  );
  const timeline = eventosOk
    .map((e) => ({
      id: e.id,
      pessoa: nomes.get(e.person_id) ?? "—",
      titulo: rotuloDe([], e.event_type) === "—" ? e.event_type : e.event_type,
      data: e.start_date ?? e.approximate_date ?? "Data não informada",
      localidade: e.locality,
    }))
    .sort((a, b) => a.data.localeCompare(b.data));

  const ocultos =
    perfisAtivos.length - perfisOk.size + (ativos(eventos).length - eventosOk.length);

  return {
    publicavel: arvore.length > 0 || timeline.length > 0,
    motivo: arvore.length > 0 || timeline.length > 0 ? null : MOTIVO_SEM_PROJECAO,
    arvore,
    timeline,
    ocultos,
  };
}

/** Nenhum item da projeção pode conter nota interna ou juízo de mérito. */
export function projecaoSemConteudoInterno(p: ProjecaoCliente, perfis: Perfil[], eventos: Evento[]): boolean {
  const internos = [
    ...perfis.map((x) => x.internal_notes ?? ""),
    ...eventos.map((x) => x.description_internal ?? ""),
  ].filter((t) => t.trim().length > 0);
  const texto = JSON.stringify(p);
  return internos.every((t) => !texto.includes(t));
}

/** Lacunas específicas dos módulos históricos, sem sugerir consulta externa. */
export function lacunasDosModulos(
  registros: { tabela: string; registro: RegistroModulo }[],
  nomePorPessoa: Map<string, string>,
): { chave: string; pessoa: string | null; descricao: string; prioridade: "alta" | "media" }[] {
  const out: { chave: string; pessoa: string | null; descricao: string; prioridade: "alta" | "media" }[] = [];
  for (const { tabela, registro } of registros) {
    if (registro.archived_at) continue;
    const modulo = MODULOS_POR_TABELA.get(tabela);
    const pessoa = registro.person_id ? (nomePorPessoa.get(registro.person_id) ?? null) : null;
    if (!registro.evidence_id && !registro.source_id) {
      out.push({
        chave: `mod:${tabela}:${registro.id}`,
        pessoa,
        descricao: `${modulo?.rotulo ?? tabela}: “${registro.titulo}” sem evidência ou fonte vinculada.`,
        prioridade: "media",
      });
    }
    if (!registro.periodo_inicio && registro.data_precisao === "desconhecida") {
      out.push({
        chave: `modp:${tabela}:${registro.id}`,
        pessoa,
        descricao: `${modulo?.rotulo ?? tabela}: “${registro.titulo}” sem período nem precisão declarada.`,
        prioridade: "media",
      });
    }
  }
  return out;
}

export type { ItemTimeline };
