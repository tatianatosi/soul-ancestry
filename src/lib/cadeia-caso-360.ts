/**
 * Cadeia canônica do Caso 360 — decisão da proprietária (2026-09-11).
 *
 *   LEGADO (Planilha Mestre, planilhas e arquivos históricos)
 *             ↓ leitura, inventário e migração única
 *   LISTA-ALIMENTO VERSIONADA (`planner_catalog_feed`)
 *             ↓
 *   CATÁLOGO OPERACIONAL DO PLANEJADOR (`product_catalog` homologado + produto-pai)
 *             ↓
 *   CASO 360 = produto-pai + fase + trilha(s) + itens + condição particular
 *             ↓
 *   DESK produz/valida/libera → APP mostra valor autorizado → WhatsApp comunica
 *
 * Legado nunca dirige operação, preço, proposta, App ou WhatsApp.
 * WhatsApp só comunica rascunho da fila humana — envio automático continua desligado.
 */

import { ENVIO_AUTOMATICO_HABILITADO } from "@/lib/fila-comunicacao";
import { PRODUTOS_PAI_CANONICOS } from "@/lib/planejador-produtos-pai";

export const CADEIA_CASO_360_VERSAO = "CADEIA-CASO-360-v1.0";

export const CAMADAS_CADEIA_CASO = [
  "legado",
  "lista_alimento",
  "catalogo_operacional",
  "caso_360",
  "liberacao",
] as const;

export type CamadaCadeiaCaso = (typeof CAMADAS_CADEIA_CASO)[number];

export type EstadoCamada = "operavel" | "pendente" | "legado_somente" | "bloqueado";

export type PecaCaso360 = {
  produtoPai: string | null;
  fase: string | null;
  trilhas: string[];
  itens: string[];
  condicaoParticular: string | null;
};

export type CamadaMontada = {
  id: CamadaCadeiaCaso;
  titulo: string;
  estado: EstadoCamada;
  resumo: string;
  pecas?: PecaCaso360;
};

export type EntradaCadeiaCaso360 = {
  /** Rastreio histórico (versão/linha da planilha). Nunca decide. */
  legado?: { fonteVersao?: string | null; fonteLinha?: string | number | null; aliases?: string[] | null } | null;
  listaAlimento?: {
    itemId?: string | null;
    productParent?: string | null;
    statusDictionary?: string | null;
    journeyPhaseDefault?: string | null;
  } | null;
  catalogoOperacional?: {
    code?: string | null;
    nomeComercial?: string | null;
    statusHomologacao?: string | null;
    elegivelParaProposta?: boolean | null;
    produtoPai?: string | null;
  } | null;
  caso?: {
    produtoPai?: string | null;
    faseJornada?: string | null;
    trilhas?: string[] | null;
    itens?: string[] | null;
    condicaoParticular?: string | null;
  } | null;
  liberacao?: {
    deskProduziu?: number;
    appPublicado?: number;
    whatsappFila?: number;
    whatsappAprovado?: number;
  } | null;
};

const NAO_OFERECER = new Set(["NAO_USAR_NO_MOTOR", "ARQUIVADO_DECISAO_PROPRIETARIA"]);

export function produtoPaiCanonico(nome: string | null | undefined): boolean {
  if (!nome) return false;
  return PRODUTOS_PAI_CANONICOS.some((p) => p.nome === nome || p.id === nome);
}

export function pecasCaso360(caso: NonNullable<EntradaCadeiaCaso360["caso"]>): PecaCaso360 {
  return {
    produtoPai: caso.produtoPai?.trim() || null,
    fase: caso.faseJornada?.trim() || null,
    trilhas: (caso.trilhas ?? []).map((t) => t.trim()).filter(Boolean),
    itens: (caso.itens ?? []).map((i) => i.trim()).filter(Boolean),
    condicaoParticular: caso.condicaoParticular?.trim() || null,
  };
}

export function caso360Completo(pecas: PecaCaso360): boolean {
  return Boolean(
    pecas.produtoPai && pecas.fase && pecas.trilhas.length > 0 && pecas.itens.length > 0 && pecas.condicaoParticular,
  );
}

function camadaLegado(entrada: EntradaCadeiaCaso360): CamadaMontada {
  const l = entrada.legado;
  const temRastro = Boolean(l?.fonteVersao || l?.fonteLinha || (l?.aliases && l.aliases.length));
  return {
    id: "legado",
    titulo: "Legado (Planilha Mestre e arquivos históricos)",
    estado: "legado_somente",
    resumo: temRastro
      ? `Inventário único: ${[l?.fonteVersao, l?.fonteLinha != null ? `linha ${l.fonteLinha}` : null].filter(Boolean).join(" · ")}. Não opera Desk, App nem WhatsApp.`
      : "Sem rastro de planilha neste caso — e não deve voltar como fonte viva.",
  };
}

function camadaListaAlimento(entrada: EntradaCadeiaCaso360): CamadaMontada {
  const a = entrada.listaAlimento;
  if (!a?.itemId) {
    return {
      id: "lista_alimento",
      titulo: "Lista-alimento versionada",
      estado: "pendente",
      resumo: "Nenhum item de planner_catalog_feed ligado a este caso. A lista-alimento é a referência; a Planilha Mestre não substitui.",
    };
  }
  if (a.statusDictionary && NAO_OFERECER.has(a.statusDictionary)) {
    return {
      id: "lista_alimento",
      titulo: "Lista-alimento versionada",
      estado: "bloqueado",
      resumo: `${a.itemId} está ${a.statusDictionary} — não entra no motor.`,
    };
  }
  return {
    id: "lista_alimento",
    titulo: "Lista-alimento versionada",
    estado: "operavel",
    resumo: `${a.itemId}${a.productParent ? ` · ${a.productParent}` : ""}${a.journeyPhaseDefault ? ` · fase padrão ${a.journeyPhaseDefault}` : ""}.`,
  };
}

function camadaCatalogo(entrada: EntradaCadeiaCaso360): CamadaMontada {
  const c = entrada.catalogoOperacional;
  if (!c?.code) {
    return {
      id: "catalogo_operacional",
      titulo: "Catálogo operacional do planejador",
      estado: "pendente",
      resumo: "Sem item homologado de product_catalog neste caso.",
    };
  }
  const homologado = c.statusHomologacao === "homologado" && c.elegivelParaProposta !== false;
  if (!homologado) {
    return {
      id: "catalogo_operacional",
      titulo: "Catálogo operacional do planejador",
      estado: "bloqueado",
      resumo: `${c.nomeComercial ?? c.code} ainda não está homologado/elegível. Preço não sai da Planilha Mestre.`,
    };
  }
  return {
    id: "catalogo_operacional",
    titulo: "Catálogo operacional do planejador",
    estado: "operavel",
    resumo: `${c.nomeComercial ?? c.code}${c.produtoPai ? ` · ${c.produtoPai}` : ""} · homologado.`,
  };
}

function camadaCaso(entrada: EntradaCadeiaCaso360): CamadaMontada {
  const pecas = pecasCaso360(entrada.caso ?? {});
  const faltando: string[] = [];
  if (!pecas.produtoPai) faltando.push("produto-pai");
  if (!pecas.fase) faltando.push("fase");
  if (!pecas.trilhas.length) faltando.push("trilha");
  if (!pecas.itens.length) faltando.push("itens");
  if (!pecas.condicaoParticular) faltando.push("condição particular");
  return {
    id: "caso_360",
    titulo: "Caso 360",
    estado: faltando.length === 0 ? "operavel" : "pendente",
    resumo:
      faltando.length === 0
        ? `${pecas.produtoPai} · ${pecas.fase} · ${pecas.trilhas.join(", ")} · ${pecas.itens.length} item(ns) · condição particular registrada.`
        : `Falta ${faltando.join(", ")}. Caso 360 = produto-pai + fase + trilha(s) + itens + condição particular.`,
    pecas,
  };
}

function camadaLiberacao(entrada: EntradaCadeiaCaso360): CamadaMontada {
  const l = entrada.liberacao ?? { deskProduziu: 0, appPublicado: 0, whatsappFila: 0, whatsappAprovado: 0 };
  const desk = l.deskProduziu ?? 0;
  const app = l.appPublicado ?? 0;
  const fila = l.whatsappFila ?? 0;
  const aprovado = l.whatsappAprovado ?? 0;
  if (ENVIO_AUTOMATICO_HABILITADO) {
    return {
      id: "liberacao",
      titulo: "Desk → App → WhatsApp",
      estado: "bloqueado",
      resumo: "Envio automático de WhatsApp não é autorizado nesta cadeia.",
    };
  }
  if (app > 0) {
    return {
      id: "liberacao",
      titulo: "Desk → App → WhatsApp",
      estado: "operavel",
      resumo: `Desk produziu ${desk}. App mostra ${app} valor(es) autorizado(s). WhatsApp: ${aprovado} aprovado(s) na fila humana, ${fila} rascunho(s) — sem disparo automático.`,
    };
  }
  if (desk > 0) {
    return {
      id: "liberacao",
      titulo: "Desk → App → WhatsApp",
      estado: "pendente",
      resumo: `Desk produziu ${desk}, ainda sem publicação no App. WhatsApp não comunica o que o App não mostra.`,
    };
  }
  return {
    id: "liberacao",
    titulo: "Desk → App → WhatsApp",
    estado: "pendente",
    resumo: "Nada produzido no Desk para liberar. O App só mostra valor autorizado; o WhatsApp só comunica depois da aprovação humana.",
  };
}

export function entradaCadeiaDoCanonico(dados: {
  produtos: Array<{
    id?: string;
    code?: string | null;
    nome_comercial?: string | null;
    status_homologacao?: string | null;
    elegivel_para_proposta?: boolean | null;
    produto_pai?: string | null;
    status_reconciliacao?: string | null;
    fonte_versao?: string | null;
    fonte_linha?: string | number | null;
    journey_phase_default?: string | null;
  }>;
  trilhas: Array<{ id?: string; pais?: string | null; code?: string | null }>;
  servicos: Array<{
    product_catalog_id?: string | null;
    citizenship_track_id?: string | null;
    condicao_comercial_aprovada?: string | null;
    composicao_familiar?: string | null;
  }>;
  planos: Array<{
    fase_jornada?: string | null;
    microentregas?: string[] | null;
    entregas?: string[] | null;
    product_catalog_id?: string | null;
  }>;
  projecoes: Array<{ approval_status?: string | null }>;
  comunicacoes: Array<{
    suggested_channel?: string | null;
    approved_at?: string | null;
    sent_at?: string | null;
    status?: string | null;
  }>;
}): EntradaCadeiaCaso360 {
  const servico = dados.servicos[0];
  const plano = dados.planos[0];
  const produto = dados.produtos.find((p) => String(p.id) === String(servico?.product_catalog_id ?? plano?.product_catalog_id ?? ""));
  const trilha = dados.trilhas.find((t) => String(t.id) === String(servico?.citizenship_track_id ?? ""));
  const itens = [
    produto?.code ?? null,
    ...(plano?.microentregas ?? []),
    ...(plano?.entregas ?? []),
  ].filter((x): x is string => Boolean(x && String(x).trim()));
  const whatsapp = dados.comunicacoes.filter((c) => String(c.suggested_channel ?? "").toLowerCase() === "whatsapp");

  return {
    legado: produto
      ? { fonteVersao: produto.fonte_versao ?? null, fonteLinha: produto.fonte_linha ?? null }
      : null,
    listaAlimento: produto
      ? {
          itemId: produto.code ?? null,
          productParent: produto.produto_pai ?? null,
          statusDictionary: produto.status_reconciliacao ?? null,
          journeyPhaseDefault: produto.journey_phase_default ?? null,
        }
      : null,
    catalogoOperacional: produto
      ? {
          code: produto.code ?? null,
          nomeComercial: produto.nome_comercial ?? null,
          statusHomologacao: produto.status_homologacao ?? null,
          elegivelParaProposta: produto.elegivel_para_proposta ?? null,
          produtoPai: produto.produto_pai ?? null,
        }
      : null,
    caso: {
      produtoPai: produto?.produto_pai ?? null,
      faseJornada: plano?.fase_jornada ?? null,
      trilhas: trilha ? [`${trilha.pais ?? ""} ${trilha.code ?? ""}`.trim()] : [],
      itens,
      condicaoParticular: servico?.condicao_comercial_aprovada ?? servico?.composicao_familiar ?? null,
    },
    liberacao: {
      deskProduziu: dados.projecoes.length,
      appPublicado: dados.projecoes.filter((p) => p.approval_status === "published").length,
      whatsappFila: whatsapp.filter((c) => !c.sent_at).length,
      whatsappAprovado: whatsapp.filter((c) => Boolean(c.approved_at)).length,
    },
  };
}

export function montarCadeiaCaso360(entrada: EntradaCadeiaCaso360): {
  versao: string;
  camadas: CamadaMontada[];
  legadoOpera: false;
  envioAutomaticoWhatsapp: false;
} {
  return {
    versao: CADEIA_CASO_360_VERSAO,
    camadas: [
      camadaLegado(entrada),
      camadaListaAlimento(entrada),
      camadaCatalogo(entrada),
      camadaCaso(entrada),
      camadaLiberacao(entrada),
    ],
    legadoOpera: false,
    envioAutomaticoWhatsapp: false,
  };
}
