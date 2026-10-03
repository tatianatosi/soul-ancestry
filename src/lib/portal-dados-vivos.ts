/**
 * CA-PORTAL-02 — projeção sanitizada de dados vivos para o App Cliente.
 *
 * Fontes permitidas (todas com RLS de portal comprovada no banco):
 * - `portal_casos` (view security_invoker sobre `crm_casos`, filtro
 *   `portal_caso_permitido(id)`);
 * - `portal_projecoes` (view security_invoker sobre `app_projections`,
 *   policy `app_proj_select_portal`);
 * - `documents` (policy `documents_sel_portal`).
 *
 * Fontes BLOQUEADAS nesta etapa (sem policy de portal no banco): ver
 * `BLOQUEIOS_CA_PORTAL_02`. Enquanto o bloqueio existir, a tela mantém o
 * estado seguro do CA-PORTAL-01 — nada é inferido, estimado ou inventado.
 *
 * Nenhum cálculo de cadência é duplicado: reutiliza `diasEntre` e
 * `saudeDoPlano` de `onboarding-jornada.ts` (mesma régua da equipe), sem
 * expor alerta interno, gate, responsável ou SLA técnico.
 */
import { diasEntre, saudeDoPlano, contemConteudoInterno, FASES_JORNADA } from "@/lib/onboarding-jornada";
import { pontesDeUniaoDeRamos, TIPO_UNIAO_RAMOS, type PonteUniaoRamos } from "@/lib/uniao-ramos";
import { TIPO_ASSINATURA, TIPO_UPSELL } from "@/lib/assinatura-app";
import {
  publicacoesParaCliente,
  TIPOS_ENTREGA_APP,
  type ProjecaoBruta,
  type PublicacaoCliente,
} from "@/lib/projecoes-cliente";
import type { EixoRadar } from "@/lib/radar-eixos";
import { EIXOS_RADAR_CANONICOS, garantirEixosCanonicos } from "@/lib/radar-eixos";
import type { ProximaAcaoCliente } from "@/lib/motor-caso";
import { textoParaCliente } from "@/lib/portal-linguagem-viva";

export type BloqueioFonte = {
  tela: string;
  fonte: string;
  motivo: string;
};

/** Fontes que NÃO podem ser expostas: sem policy de portal comprovada. */
export const BLOQUEIOS_CA_PORTAL_02: BloqueioFonte[] = [
  {
    tela: "Entregas da Jornada",
    fonte: "public.client_deliverables",
    motivo:
      "SELECT apenas por is_org_member(organization_id): não existe policy de portal do cliente. Conteúdo permanece bloqueado. " +
      "09/09/2026: fechamento da cadeia de microentregas usou app_projections/portal_projecoes (já com policy de portal " +
      "comprovada) para Legado, não esta tabela — sem alterar RLS nesta rodada. client_deliverables segue sem uso real.",
  },
  {
    tela: "Árvore (pessoas)",
    fonte: "public.genealogical_person_profiles",
    motivo:
      "SELECT apenas por is_org_member: a árvore só usa a projeção publicada em portal_projecoes (tipo `arvore`).",
  },
  {
    tela: "Fase 01 / Fase 02",
    fonte: "contracts / case_services",
    motivo: "Sem policy de portal para escopo contratado; as fases seguem apenas com estado de visibilidade.",
  },
];

/* ------------------------------------------------------------------ jornada */

export type JornadaCliente = {
  /** Progresso apenas por marcos já publicados, nunca estimativa. */
  marcosPublicados: number;
  ultimaAtualizacaoEm: string | null;
  /** Ritmo derivado da mesma régua interna, traduzido para linguagem humana. */
  proximoPasso: string;
  /**
   * Saúde do ritmo (régua Ana via saudeDoPlano / limiares). Exposta só como
   * estado sanitizado — nunca como D10/D14 ou alerta interno ao cliente.
   */
  ritmo: "regular" | "atencao" | "critico" | "sem_publicacao";
  linha: PublicacaoCliente[];
  /** União de Ramos publicada pelo Desk: vínculo explícito por id, nunca inferido. */
  pontes: PonteUniaoRamos[];
};

const TEXTO_RITMO: Record<"regular" | "atencao" | "critico", string> = {
  regular: "Sua jornada segue em andamento com a equipe.",
  atencao: "A equipe está preparando a próxima atualização do seu acompanhamento.",
  critico: "A equipe está revisando o seu caso para trazer a próxima atualização.",
};

const TEXTO_SEM_PUBLICACAO =
  "Assim que houver uma atualização publicada pela equipe, ela aparece aqui.";

export function jornadaSanitizada(
  projecoes: ProjecaoBruta[],
  hoje = new Date(),
  proximaDoMotor?: Pick<ProximaAcaoCliente, "acao"> | null,
): JornadaCliente {
  const todas = publicacoesParaCliente(projecoes).filter((p) => !contemConteudoInterno(p.conteudo));
  /*
    03/10/2026 — a União de Ramos é a PONTE entre dois marcos, não um marco a
    mais. Sem tirá-la da linha, a mesma publicação apareceria duas vezes:
    como evento solto e como ponte. Ela sai da linha e entra em `pontes`,
    com a legenda já sanitizada pelo mesmo caminho das outras.
  */
  /*
    03/10/2026 — assinatura e upsell (A7) também saem da linha: são blocos da
    Conta, com valor em campo estruturado, e nunca um cartão de entrega na
    Jornada. Sem isto, o preço autorizado só na Conta apareceria na linha da
    jornada como evento.
  */
  const FORA_DA_LINHA = new Set<string>([TIPO_UNIAO_RAMOS, TIPO_ASSINATURA, TIPO_UPSELL]);
  const linha = todas.filter((p) => !FORA_DA_LINHA.has(p.tipo));
  const pontes = pontesDeUniaoDeRamos(
    projecoes,
    linha.map((p) => p.id),
    new Map(todas.filter((p) => p.tipo === TIPO_UNIAO_RAMOS).map((p) => [p.id, p.conteudo])),
  );
  const ultima = linha[0]?.publicadoEm ?? null;
  const dias = diasEntre(ultima, hoje);
  const ritmo =
    dias === null ? ("sem_publicacao" as const) : saudeDoPlano(dias);
  const proximoPasso =
    proximaDoMotor?.acao?.trim() ||
    (ritmo === "sem_publicacao" ? TEXTO_SEM_PUBLICACAO : TEXTO_RITMO[ritmo]);
  return {
    marcosPublicados: linha.length,
    ultimaAtualizacaoEm: ultima,
    proximoPasso,
    ritmo,
    linha,
    pontes,
  };
}

/* -------------------------------------------------------------------- radar */

export type DocumentoPortal = {
  id?: string;
  liberado_cliente?: boolean | null;
  origem?: string | null;
  is_demo?: boolean | null;
};

export type EixoVivo = {
  id: EixoRadar["id"];
  titulo: string;
  resumo: string;
  /** `released` só quando existe dado autorizado; senão estado seguro. */
  estado: "released" | "available_empty" | "in_preparation";
  itens: { rotulo: string; valor: string }[];
};

/**
 * Radar com os quatro eixos canônicos. Nenhum eixo novo, nenhum score
 * inventado: sem fonte autorizada, o eixo fica em estado seguro.
 */
export function radarSanitizado(entrada: {
  projecoes: ProjecaoBruta[];
  documentos: DocumentoPortal[];
}): EixoVivo[] {
  const publicacoes = publicacoesParaCliente(entrada.projecoes);
  const pessoas = publicacoes.filter((p) => p.tipo === "arvore" || p.tipo === "achado");
  const docs = entrada.documentos.filter((d) => d.is_demo !== true);
  const liberados = docs.filter((d) => d.liberado_cliente === true).length;
  const enviados = docs.filter((d) => d.origem === "cliente").length;
  const jornada = jornadaSanitizada(entrada.projecoes);

  return garantirEixosCanonicos(EIXOS_RADAR_CANONICOS.map((eixo): EixoVivo => {
    if (eixo.id === "historia") {
      return {
        ...eixo,
        estado: pessoas.length > 0 ? "released" : "available_empty",
        itens: pessoas.length > 0 ? [{ rotulo: "Registros publicados", valor: String(pessoas.length) }] : [],
      };
    }
    if (eixo.id === "documentos") {
      const temDado = liberados + enviados > 0;
      return {
        ...eixo,
        estado: temDado ? "released" : "available_empty",
        itens: temDado
          ? [
              { rotulo: "Disponíveis para você", valor: String(liberados) },
              { rotulo: "Enviados por você", valor: String(enviados) },
            ]
          : [],
      };
    }
    if (eixo.id === "estrategia") {
      // Nunca parecer jurídico, nunca hipótese: apenas estado institucional.
      return { ...eixo, estado: "in_preparation", itens: [] };
    }
    return {
      ...eixo,
      estado: jornada.marcosPublicados > 0 ? "released" : "available_empty",
      itens:
        jornada.marcosPublicados > 0
          ? [{ rotulo: "Atualizações publicadas", valor: String(jornada.marcosPublicados) }]
          : [],
    };
  }));
}

/* ------------------------------------------------------------------- árvore */

/**
 * Árvore do cliente: somente publicações autorizadas do tipo `arvore`.
 * Nenhuma pessoa, relação ou data vem de tabela interna.
 */
export function arvoreSanitizada(projecoes: ProjecaoBruta[]): PublicacaoCliente[] {
  return publicacoesParaCliente(projecoes)
    .filter((p) => p.tipo === "arvore")
    .filter((p) => !contemConteudoInterno(p.conteudo));
}

/* ------------------------------------------------------------------- legado */

/**
 * Legado do cliente: só publicações autorizadas do tipo `legado`, mesma fonte
 * portal-segura de jornada/árvore (`portal_projecoes`, sem policy nova).
 * Fecha o bloqueio de CA-PORTAL-02 sem tocar `client_deliverables`/
 * `knowledge_items` (sem policy de portal comprovada) — 09/09/2026.
 */
export function legadoSanitizado(projecoes: ProjecaoBruta[]): PublicacaoCliente[] {
  return publicacoesParaCliente(projecoes)
    .filter((p) => p.tipo === "legado")
    .filter((p) => !contemConteudoInterno(p.conteudo));
}

/** Entregas da jornada: publicações do repositório, sem Árvore e sem Legado (abas próprias). */
export function publicacoesDeEntrega(projecoes: ProjecaoBruta[]): PublicacaoCliente[] {
  /*
    03/10/2026 — era filtro por EXCLUSÃO (tirava só `arvore` e `legado`), o
    que fazia qualquer tipo fora da taxonomia contar como entrega ao
    cliente: `contrato`, `proposta`, `resumo_caso` entravam aqui, e só o
    filtro de conteúdo os segurava. Agora é lista PERMITIDA
    (`TIPOS_ENTREGA_APP`): tipo desconhecido não vaza, nem com texto limpo.
  */
  return publicacoesParaCliente(projecoes)
    .filter((p) => TIPOS_ENTREGA_APP.has(p.tipo))
    .filter((p) => !contemConteudoInterno(p.conteudo));
}

/**
 * Microentrega publicada mais recente (a mesma fila do Desk: `app_projections`
 * publicada e vigente, via `portal_projecoes`). Sem publicação real → null;
 * nada é inferido nem preenchido com exemplo.
 */
export function microentregaPublicada(
  projecoes: ProjecaoBruta[],
): PublicacaoCliente | null {
  return publicacoesDeEntrega(projecoes)[0] ?? null;
}


const TIPOS_FASE_01 = new Set(["resumo", "marco", "relatorio_f1", "fase01", "fase_01"]);
const TIPOS_FASE_02 = new Set(["relatorio_f2", "fase02", "fase_02"]);

export function publicacoesDeFase01(projecoes: ProjecaoBruta[]): PublicacaoCliente[] {
  return publicacoesParaCliente(projecoes)
    .filter((p) => TIPOS_FASE_01.has(p.tipo))
    .filter((p) => !contemConteudoInterno(p.conteudo));
}

export function publicacoesDeFase02(projecoes: ProjecaoBruta[]): PublicacaoCliente[] {
  return publicacoesParaCliente(projecoes)
    .filter((p) => TIPOS_FASE_02.has(p.tipo))
    .filter((p) => !contemConteudoInterno(p.conteudo));
}

/**
 * Mockup 17 — Jornada em duas colunas (História | Seu caso).
 * Parte só publicações já sanitizadas; não inventa anos, nomes nem % .
 * Tipos de família/registro → História; acompanhamento operacional → Seu caso.
 * "União de Ramos" só quando as duas colunas têm publicação (encontro real).
 */
const TIPOS_HISTORIA = new Set([
  "arvore",
  "achado",
  "evidencia",
  "linha_tempo",
  "legado",
]);

export type JornadaDuasLinhas = {
  historia: PublicacaoCliente[];
  seuCaso: PublicacaoCliente[];
  uniaoDeRamos: boolean;
};

export function partirJornadaEmDuasLinhas(
  linha: PublicacaoCliente[],
): JornadaDuasLinhas {
  const historia: PublicacaoCliente[] = [];
  const seuCaso: PublicacaoCliente[] = [];
  for (const item of linha) {
    if (TIPOS_HISTORIA.has(item.tipo)) historia.push(item);
    else seuCaso.push(item);
  }
  return {
    historia,
    seuCaso,
    uniaoDeRamos: historia.length > 0 && seuCaso.length > 0,
  };
}

/* ------------------------------------------------- etapa e composição do caso */

/**
 * A etapa da jornada que o cliente lê, derivada de `case_plans.fase_jornada`
 * (CHECK de 8 valores) e projetada pela view `portal_casos`.
 *
 * DIVERGÊNCIA REGISTRADA (§29 do De-Para), não resolvida por invenção:
 * - o mockup 1/7 mostra "Progresso da jornada 65%" e um stepper de 5 passos
 *   (Diagnóstico → Pesquisa → Reconstrução → Validação → Entrega);
 * - o De-Para §3 (linha 2) pede "barra de progresso" e nome da etapa, e §4
 *   (linha 2) pede uma linha de 4 passos (Início, Pesquisa, Conferência,
 *   Entrega);
 * - o dado real tem 8 fases canônicas.
 *
 * Três leituras, nenhuma arquivável. O que esta função faz é o que as três
 * têm em comum e o que o dado sustenta: a posição real do caso no catálogo de
 * 8 fases. A barra é preenchida por essa posição — não por estimativa. E
 * `posicao`/`total` são expostos no lugar de um percentual fabricado, porque
 * a própria seção §3 ("o que fica oculto") proíbe "progresso em percentuais
 * inferidos ou estimados". Um stepper de 5 ou 4 passos exigiria um de-para
 * 8→5 ou 8→4 que ninguém aprovou.
 */
export type EtapaCliente = {
  /** Rótulo voltado ao cliente, do próprio catálogo de fases. */
  rotulo: string;
  /** 1-based, dentro das 8 fases canônicas. */
  posicao: number;
  total: number;
  /** 0..1 — fração das fases já percorridas, incluindo a atual. */
  fracao: number;
};

export function etapaDoCasoCliente(
  faseJornada: string | null | undefined,
): EtapaCliente | null {
  if (!faseJornada) return null;
  const alvo = faseJornada.trim().toLowerCase().replace(/_e_/g, "_");
  const indice = FASES_JORNADA.findIndex(
    (f) => f.id.toLowerCase().replace(/_e_/g, "_") === alvo,
  );
  // Fase fora do catálogo não vira etapa inventada: a tela cai no estado
  // vazio honesto em vez de mostrar uma posição que não existe.
  if (indice < 0) return null;
  const total = FASES_JORNADA.length;
  return {
    rotulo: FASES_JORNADA[indice]!.cliente,
    posicao: indice + 1,
    total,
    fracao: (indice + 1) / total,
  };
}

/**
 * Como o cliente lê a composição do caso (`case_plans.composicao`): o caso é
 * dele, do casal ou da família. Vocabulário fechado em `COMPOSICOES`
 * (`cadeia-operacional.ts`); valor fora dele não vira rótulo inventado.
 */
const ROTULO_COMPOSICAO: Record<string, string> = {
  individual: "Caso individual",
  casal: "Caso do casal",
  nucleo_familiar: "Caso da família",
};

export function composicaoDoCasoCliente(
  composicao: string | null | undefined,
): string | null {
  if (!composicao) return null;
  return ROTULO_COMPOSICAO[composicao.trim().toLowerCase()] ?? null;
}

/**
 * Os 8 rótulos de etapa que o cliente lê, na ordem do catálogo. É a única
 * lista que o App usa para desenhar a jornada — não uma cópia editável.
 */
export const ROTULOS_ETAPA_CLIENTE: readonly string[] = FASES_JORNADA.map((f) => f.cliente);

/**
 * P3 (25/09/2026) — a única coisa da operação interna de micro-entregas que
 * chega ao cliente: a DATA da próxima entrega prevista (coluna
 * `portal_casos.proxima_entrega_prevista_em`). Sem título, responsável,
 * status ou SLA. Data inválida vira `null` (nada inventado).
 */
export function proximaEntregaCliente(
  data: string | null | undefined,
): { data: string; texto: string } | null {
  if (!data) return null;
  const iso = String(data).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [ano, mes, dia] = iso.split("-");
  return { data: iso, texto: `Próxima entrega prevista para ${dia}/${mes}/${ano}.` };
}

/* ------------------------------------------------ documentos solicitados */

export type SolicitacaoDocumentoBruta = {
  id: string;
  titulo?: string | null;
  descricao?: string | null;
  prazo?: string | null;
  status?: string | null;
  motivo_recusa?: string | null;
};

export type SolicitacaoDocumentoCliente = {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  recusado: boolean;
  motivoRecusa: string | null;
};

/**
 * REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — Ficha Piloto campos #6
 * ("Documento foco") e #28 ("Pendência principal"). A aba Documentos só
 * mostrava a frase genérica do motor ("Há 1 documento para você enviar.") —
 * nunca QUAL documento. `portal_document_requests.titulo/descricao/prazo`
 * já é lido pelo cliente na rota profunda `/portal/casos/$id`
 * (`components/portal/caso-detalhe.tsx`), com a policy `pdr_sel_portal`: é
 * conteúdo escrito pela equipe PARA o cliente, não dado interno. Só as
 * abertas (aguardando/recusado), com título; texto passa por
 * `textoParaCliente` como o resto do App.
 */
export function solicitacoesAbertasCliente(
  linhas: SolicitacaoDocumentoBruta[],
): SolicitacaoDocumentoCliente[] {
  return linhas
    .filter((l) => l.status === "aguardando" || l.status === "recusado")
    .map((l) => ({
      id: String(l.id),
      titulo: textoParaCliente(l.titulo ?? "").trim(),
      descricao: textoParaCliente(l.descricao ?? "").trim() || null,
      prazo: l.prazo ? String(l.prazo).slice(0, 10) : null,
      recusado: l.status === "recusado",
      motivoRecusa: l.status === "recusado" ? textoParaCliente(l.motivo_recusa ?? "").trim() || null : null,
    }))
    .filter((s) => s.titulo.length > 0);
}

/* ---------------------------------------------------------------- histórico */

export type EventoTimelinePortal = {
  id: string;
  summary_client_approved?: string | null;
  occurred_at?: string | null;
  created_at?: string | null;
  visibility?: string | null;
};

export type MarcoHistoricoCliente = {
  id: string;
  /** Só o texto aprovado explicitamente para a família — nunca o `title` interno. */
  texto: string;
  data: string | null;
};

/**
 * REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — "Histórico (3 marcos)" da
 * Ficha Piloto da Giovanna (campos #47-49). A tabela `case_timeline_events`,
 * a coluna `summary_client_approved` e a policy de portal `cte_select_portal`
 * já existiam (migration 20260910184500); nenhum escritor jamais gravava
 * `visibility = 'cliente_aprovado'`, então a aba Conta nunca teve o que
 * mostrar e usava um texto fixo duplicado no lugar (não era um estado vazio
 * honesto: era o mesmo texto repetido duas vezes, sem nenhuma consulta).
 *
 * Nunca expõe `title`/`event_type`/`source_entity_*` (jargão interno) — só o
 * resumo que a equipe escreveu explicitamente para a família, na aprovação
 * (`aprovarEventoTimelineParaCliente`). Defesa em profundidade: a RLS já
 * filtra por `visibility = 'cliente_aprovado'`, este filtro repete a regra no
 * app para nunca depender só do banco.
 */
export function historicoSanitizado(
  eventos: EventoTimelinePortal[],
  limite = 3,
): MarcoHistoricoCliente[] {
  return eventos
    .filter((e) => e.visibility === "cliente_aprovado" && Boolean(e.summary_client_approved?.trim()))
    // Mesma fronteira de toda publicação do App: termo interno não atravessa.
    .filter((e) => !contemConteudoInterno(e.summary_client_approved))
    .map((e) => ({
      id: String(e.id),
      texto: textoParaCliente(String(e.summary_client_approved)).trim(),
      data: e.occurred_at ?? e.created_at ?? null,
    }))
    .filter((m) => m.texto.length > 0)
    .sort((a, b) => String(b.data ?? "").localeCompare(String(a.data ?? "")))
    .slice(0, limite);
}
