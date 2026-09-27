/**
 * Cadeia Caso 360 — camada de leitura unificada (Corte 3, 27/09/2026).
 *
 * Pedido explícito da Proprietária: a visão do caso deve compor, num só
 * lugar, produto-pai, trilha jurídica, plano/jornada, estágio de
 * liberação Desk→App e o raciocínio jurídico automático (Corte 2) — hoje
 * espalhados entre as abas Jornada/Pesquisa/Formalização. Só leitura,
 * nenhum writer novo, nenhuma tabela nova — compõe `case_services`,
 * `citizenship_tracks`, `case_plans`, `app_projections` e o resultado de
 * `raciocinioJuridicoDoCaso`.
 *
 * Reconstruído do zero (não reaproveita a branch abandonada
 * `cadeia-caso-360-planejador-0ed5`, que nunca foi mesclada) contra o
 * schema atual e o escopo de hoje.
 */
import type { RaciocinioJuridicoCaso } from "@/lib/motor-raciocinio-juridico";

export type EstadoCamada = "operavel" | "pendente" | "bloqueado";

export type CaseServiceBruto = {
  product_catalog_id: string | null;
  composicao_familiar: string | null;
  condicao_comercial_aprovada: string | null;
} | null;

export type ProdutoCatalogoBruto = { code: string | null; nome_comercial: string | null } | null;

export type CamadaProdutoPai = {
  estado: EstadoCamada;
  codigo: string | null;
  nomeComercial: string | null;
  composicaoFamiliar: string | null;
  condicaoComercialAprovada: string | null;
};

export function camadaProdutoPai(caseService: CaseServiceBruto, produto: ProdutoCatalogoBruto): CamadaProdutoPai {
  if (!caseService?.product_catalog_id || !produto) {
    return {
      estado: "pendente",
      codigo: null,
      nomeComercial: null,
      composicaoFamiliar: caseService?.composicao_familiar ?? null,
      condicaoComercialAprovada: caseService?.condicao_comercial_aprovada ?? null,
    };
  }
  return {
    estado: caseService.condicao_comercial_aprovada ? "operavel" : "pendente",
    codigo: produto.code ?? null,
    nomeComercial: produto.nome_comercial ?? null,
    composicaoFamiliar: caseService.composicao_familiar ?? null,
    condicaoComercialAprovada: caseService.condicao_comercial_aprovada ?? null,
  };
}

export type CitizenshipTrackBruto = {
  pais: string | null;
  via_preliminar: string | null;
  status_via: string | null;
  lifecycle_status: string | null;
} | null;

export type CamadaTrilhaJuridica = {
  estado: EstadoCamada;
  pais: string | null;
  via: string | null;
  statusVia: string | null;
  lifecycleStatus: string | null;
};

export function camadaTrilhaJuridica(track: CitizenshipTrackBruto): CamadaTrilhaJuridica {
  if (!track) {
    return { estado: "pendente", pais: null, via: null, statusVia: null, lifecycleStatus: null };
  }
  const vigente = track.lifecycle_status === "vigente" || track.lifecycle_status === "homologado";
  const suspensa = track.lifecycle_status === "suspenso" || track.lifecycle_status === "arquivado";
  return {
    estado: vigente ? "operavel" : suspensa ? "bloqueado" : "pendente",
    pais: track.pais ?? null,
    via: track.via_preliminar ?? null,
    statusVia: track.status_via ?? null,
    lifecycleStatus: track.lifecycle_status ?? null,
  };
}

export type CasePlanBruto = {
  produto_pai_id: string | null;
  fase_jornada: string | null;
  status: string | null;
  proxima_acao: string | null;
} | null;

export type CamadaPlano = {
  estado: EstadoCamada;
  produtoPaiId: string | null;
  faseJornada: string | null;
  status: string | null;
  proximaAcao: string | null;
};

export function camadaPlano(plano: CasePlanBruto): CamadaPlano {
  if (!plano) {
    return { estado: "pendente", produtoPaiId: null, faseJornada: null, status: null, proximaAcao: null };
  }
  const estado: EstadoCamada =
    plano.status === "ativo" || plano.status === "concluido"
      ? "operavel"
      : plano.status === "arquivado"
        ? "bloqueado"
        : "pendente";
  return {
    estado,
    produtoPaiId: plano.produto_pai_id ?? null,
    faseJornada: plano.fase_jornada ?? null,
    status: plano.status ?? null,
    proximaAcao: plano.proxima_acao ?? null,
  };
}

export type AppProjecaoBruta = { approval_status: string };

export type CamadaLiberacao = {
  estado: EstadoCamada;
  rascunhos: number;
  aprovadas: number;
  publicadas: number;
};

/** "Estágio de liberação Desk→App": rascunho/aprovado/publicado de app_projections, nunca um envio automático. */
export function camadaLiberacao(projecoes: readonly AppProjecaoBruta[]): CamadaLiberacao {
  const publicadas = projecoes.filter((p) => p.approval_status === "published").length;
  const aprovadas = projecoes.filter((p) => p.approval_status === "approved").length;
  const rascunhos = projecoes.filter((p) => p.approval_status === "draft" || p.approval_status === "in_review").length;
  return {
    estado: publicadas > 0 ? "operavel" : "pendente",
    rascunhos,
    aprovadas,
    publicadas,
  };
}

export type CadeiaCaso360 = {
  produtoPai: CamadaProdutoPai;
  trilhaJuridica: CamadaTrilhaJuridica;
  plano: CamadaPlano;
  liberacao: CamadaLiberacao;
  raciocinioJuridico: RaciocinioJuridicoCaso;
};

export function montarCadeiaCaso360(entrada: {
  caseService: CaseServiceBruto;
  produtoCatalogo: ProdutoCatalogoBruto;
  track: CitizenshipTrackBruto;
  plano: CasePlanBruto;
  projecoes: readonly AppProjecaoBruta[];
  raciocinioJuridico: RaciocinioJuridicoCaso;
}): CadeiaCaso360 {
  return {
    produtoPai: camadaProdutoPai(entrada.caseService, entrada.produtoCatalogo),
    trilhaJuridica: camadaTrilhaJuridica(entrada.track),
    plano: camadaPlano(entrada.plano),
    liberacao: camadaLiberacao(entrada.projecoes),
    raciocinioJuridico: entrada.raciocinioJuridico,
  };
}
