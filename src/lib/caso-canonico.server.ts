/**
 * Lógica de apoio da ficha operacional canônica (somente servidor).
 * Nada aqui envia mensagem externa: comunicação é sempre rascunho aprovado por humano.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Linha = Record<string, any>;

export async function organizacaoDo(supabase: any) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

const CAMPOS_SERVICO = [
  "product_catalog_id",
  "citizenship_track_id",
  "escopo_aprovado",
  "composicao_familiar",
  "condicao_comercial_aprovada",
  "status",
  "contrato_referencia_interna",
  "observacao_interna",
];

/** Preço nunca vem da tela quando o produto é homologado: é lido do catálogo. */
export function payloadServico(dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const chave of CAMPOS_SERVICO) {
    const valor = dados[chave];
    if (valor === undefined) continue;
    saida[chave] = valor === "" ? null : valor;
  }
  return saida;
}

export const RASCUNHOS: Record<string, { assunto: string; corpo: string }> = {
  solicitar_confirmacao_formal: {
    assunto: "Confirmação formal do estudo",
    corpo:
      "Olá! Para seguirmos com a preparação da formalização, precisamos da sua confirmação formal por escrito do escopo apresentado. Assim que recebermos, organizamos o próximo passo.",
  },
  solicitar_dados_cadastrais: {
    assunto: "Dados cadastrais do núcleo familiar",
    corpo:
      "Olá! Para prepararmos a formalização do estudo familiar, precisamos dos dados cadastrais completos dos participantes (documento, endereço e contato). Qualquer dúvida, estou por aqui.",
  },
  confirmar_assinatura: {
    assunto: "Confirmação de assinatura",
    corpo: "Olá! Confirmamos o recebimento do documento assinado? Assim que confirmado, seguimos com o próximo passo.",
  },
  confirmar_pagamento: {
    assunto: "Confirmação de pagamento inicial",
    corpo: "Olá! Precisamos confirmar o pagamento inicial para liberar a etapa seguinte do estudo.",
  },
  enviar_checklist_inicial: {
    assunto: "Checklist inicial do estudo",
    corpo: "Olá! Preparamos o checklist inicial com os documentos e informações que vamos organizar juntos nesta etapa.",
  },
  solicitar_documentos: {
    assunto: "Documentos para a etapa atual",
    corpo: "Olá! Listamos abaixo os documentos necessários para a etapa atual do estudo.",
  },
  publicar_primeira_micro_entrega: {
    assunto: "Primeira atualização do seu estudo",
    corpo: "Olá! Publicamos a primeira atualização do seu estudo familiar no seu acompanhamento.",
  },
  atualizar_cliente: {
    assunto: "Atualização do seu estudo",
    corpo: "Olá! Trazendo uma atualização do andamento do seu estudo familiar.",
  },
};

export function rascunhoDaAcao(codigo: string) {
  return (
    RASCUNHOS[codigo] ?? {
      assunto: "Atualização interna",
      corpo: "Rascunho a ser redigido pela equipe antes de qualquer aprovação.",
    }
  );
}
