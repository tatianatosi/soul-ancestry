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
      "SELECT apenas por is_org_member(organization_id): não existe policy de portal do cliente. Conteúdo permanece bloqueado.",
  },
  {
    tela: "Legado",
    fonte: "public.knowledge_items / client_deliverables",
    motivo: "Sem estado `released_to_client` com policy de portal comprovada no banco.",
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
  linha: PublicacaoCliente[];
};

const TEXTO_RITMO: Record<"regular" | "atencao" | "critico", string> = {
  regular: "Sua jornada segue em andamento com a equipe.",
  atencao: "A equipe está preparando a próxima atualização do seu acompanhamento.",
  critico: "A equipe está revisando o seu caso para trazer a próxima atualização.",
};

const TEXTO_SEM_PUBLICACAO =
  "Assim que houver uma atualização publicada pela equipe, ela aparece aqui.";

export function jornadaSanitizada(projecoes: ProjecaoBruta[], hoje = new Date()): JornadaCliente {
  const linha = publicacoesParaCliente(projecoes).filter((p) => !contemConteudoInterno(p.conteudo));
  const ultima = linha[0]?.publicadoEm ?? null;
  const dias = diasEntre(ultima, hoje);
  const proximoPasso =
    dias === null ? TEXTO_SEM_PUBLICACAO : TEXTO_RITMO[saudeDoPlano(dias)];
  return {
    marcosPublicados: linha.length,
    ultimaAtualizacaoEm: ultima,
    proximoPasso,
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
