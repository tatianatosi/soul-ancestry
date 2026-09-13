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
import { diasEntre, saudeDoPlano, contemConteudoInterno } from "@/lib/onboarding-jornada";
import { publicacoesParaCliente, type ProjecaoBruta, type PublicacaoCliente } from "@/lib/projecoes-cliente";
import type { EixoRadar } from "@/lib/radar-eixos";
import { EIXOS_RADAR_CANONICOS, garantirEixosCanonicos } from "@/lib/radar-eixos";
import type { ProximaAcaoCliente } from "@/lib/motor-caso";

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
  const linha = publicacoesParaCliente(projecoes).filter((p) => !contemConteudoInterno(p.conteudo));
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
  return publicacoesParaCliente(projecoes)
    .filter((p) => !["arvore", "legado"].includes(p.tipo))
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
