/**
 * Dicionário declarativo dos campos de `contract_case_parameters`.
 *
 * Para cada campo: tipo de entrada, lista controlada (quando classificatório),
 * política de justificativa, origens permitidas, confiança mínima, condição de
 * validação e destino (contrato, anexo, auditoria ou apenas interno).
 *
 * Campos de texto identitário ou redacional (nome civil, CPF/RG, endereço,
 * resumo de escopo, observação técnica, justificativa, descrição de entrega ou
 * texto contratual) NUNCA viram dropdown.
 */

import {
  CAT_CONDICAO_COMERCIAL,
  CAT_FORMA_ASSINATURA,
  CAT_FORMA_PAGAMENTO,
  CAT_PRODUTO_SKU,
  CAT_RESPONSAVEL_PAGAMENTO,
  CAT_ROTA,
  CAT_STATUS_DESPESA_TERCEIRO,
  CAT_TIPO_ANEXO,
  CAT_TIPO_VINCULO,
  type Opcao,
} from "@/lib/parametros-catalogos";

export type TipoCampo =
  | "dropdown"
  | "multiselect"
  | "texto_curto"
  | "texto_longo"
  | "data"
  | "monetario"
  | "pessoa_vinculada"
  | "referencia"
  | "booleano"
  | "url_interna";

export type Destino = "contrato" | "anexo" | "auditoria" | "interno";

export type DefinicaoCampo = {
  campo: string;
  tipo: TipoCampo;
  opcoes?: Opcao[];
  /** Política de justificativa ao salvar. */
  justificativa: "nao_se_aplica" | "opcional" | "obrigatoria";
  /** Origens aceitas para este campo (vazio = todas as origens do catálogo). */
  origens?: string[];
  /** Confiança mínima exigida para validar o campo. */
  confiancaMinima: number;
  /** Condição de validação em linguagem simples. */
  validacao: string;
  destinos: Destino[];
  ajuda?: string;
};

const TODAS_ORIGENS: string[] = [];

export const DICIONARIO_CAMPOS: DefinicaoCampo[] = [
  // A. Partes
  {
    campo: "contratante_nome",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Nome civil exatamente como registrado na fonte; sem abreviação ou alteração.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  {
    campo: "contratante_documento",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm"],
    confiancaMinima: 4,
    validacao: "CPF/RG conforme documento apresentado.",
    destinos: ["contrato", "auditoria"],
  },
  {
    campo: "contratante_endereco",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm", "formulario"],
    confiancaMinima: 3,
    validacao: "Endereço completo com CEP.",
    destinos: ["contrato"],
  },
  {
    campo: "contratante_contato",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["planejador", "crm", "formulario"],
    confiancaMinima: 3,
    validacao: "E-mail e telefone de contato do contratante.",
    destinos: ["contrato", "interno"],
  },
  {
    campo: "contratada_qualificacao",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["perfil_institucional", "planejador", "documento", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Qualificação completa da contratada.",
    destinos: ["contrato"],
  },
  {
    campo: "representacao_legal",
    tipo: "texto_longo",
    justificativa: "obrigatoria",
    origens: ["planejador", "documento", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Só preencher quando houver menor/incapaz representado; exige justificativa registrada.",
    destinos: ["contrato", "anexo", "auditoria"],
    ajuda: "Preenchimento aciona o anexo ANX-REPRESENTACAO.",
  },
  // Membros
  {
    campo: "beneficiarios",
    tipo: "pessoa_vinculada",
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm"],
    confiancaMinima: 4,
    validacao: "Pessoas do caso, separadas por “||”. Cada pessoa gera um ANX-INDIVIDUAL.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "vinculo_familiar",
    tipo: "dropdown",
    opcoes: CAT_TIPO_VINCULO,
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm"],
    confiancaMinima: 4,
    validacao: "Tipo de vínculo controlado; define contrato único x individual.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "ancestral_referencia",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["planejador", "documento"],
    confiancaMinima: 5,
    validacao: "Ancestral declarado com base documental.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "membros_excluidos",
    tipo: "texto_longo",
    justificativa: "obrigatoria",
    origens: TODAS_ORIGENS,
    confiancaMinima: 4,
    validacao: "Exclusão expressa de pessoas exige justificativa.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  // Objeto
  {
    campo: "objeto_contrato",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["planejador", "crm", "proposta"],
    confiancaMinima: 4,
    validacao: "Objeto descrito sem promessa de resultado.",
    destinos: ["contrato"],
  },
  {
    campo: "produto_sku",
    tipo: "dropdown",
    opcoes: CAT_PRODUTO_SKU,
    justificativa: "opcional",
    origens: ["planejador"],
    confiancaMinima: 6,
    validacao: "Somente SKU homologado no Planejador para a rota do caso.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  {
    campo: "pais_rota",
    tipo: "dropdown",
    opcoes: CAT_ROTA,
    justificativa: "obrigatoria",
    origens: ["planejador"],
    confiancaMinima: 6,
    validacao: "Deve ser coerente com o qualificador do código do caso; divergência gera conflito crítico.",
    destinos: ["contrato", "anexo", "auditoria"],
    ajuda: "Alteração manual exige justificativa e fica registrada com valor anterior e novo.",
  },
  {
    campo: "escopo_resumo",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["proposta", "planejador", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Resumo do escopo aprovado, sem juízo de mérito sobre o caso.",
    destinos: ["contrato", "anexo"],
  },
  // Serviços
  {
    campo: "servicos_incluidos",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["planejador", "proposta"],
    confiancaMinima: 4,
    validacao: "Lista de serviços contratados.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "servicos_excluidos",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["planejador", "proposta"],
    confiancaMinima: 4,
    validacao: "Exclusões expressas (certidões, traduções, apostilas, taxas).",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "fases_entregas",
    tipo: "texto_longo",
    justificativa: "opcional",
    origens: ["planejador"],
    confiancaMinima: 6,
    validacao: "Fases homologadas no Planejador.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "anexos_aplicaveis",
    tipo: "multiselect",
    opcoes: CAT_TIPO_ANEXO,
    justificativa: "obrigatoria",
    origens: ["planejador", "calculo_aprovado", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Selecionado por regra de produto/escopo; alteração manual exige justificativa.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  {
    campo: "prazos_referencia",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: TODAS_ORIGENS,
    confiancaMinima: 3,
    validacao: "Prazos de referência; nunca promessa de resultado.",
    destinos: ["contrato", "anexo"],
  },
  // Comerciais
  {
    campo: "valor_total",
    tipo: "monetario",
    justificativa: "obrigatoria",
    origens: ["proposta", "calculo_aprovado", "planejador"],
    confiancaMinima: 4,
    validacao: "Valor total aprovado; divergência da proposta exige justificativa.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  {
    campo: "forma_pagamento",
    tipo: "dropdown",
    opcoes: CAT_FORMA_PAGAMENTO,
    justificativa: "opcional",
    origens: ["proposta", "calculo_aprovado", "planejador"],
    confiancaMinima: 4,
    validacao: "Forma de pagamento controlada conforme condição aprovada.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "parcelas",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["proposta", "calculo_aprovado", "planejador"],
    confiancaMinima: 4,
    validacao: "Quantidade, valor e responsável de cada parcela/assinatura.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "vencimentos",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["proposta", "calculo_aprovado"],
    confiancaMinima: 4,
    validacao: "Datas de vencimento acordadas.",
    destinos: ["contrato", "anexo"],
  },
  {
    campo: "despesas_externas",
    tipo: "dropdown",
    opcoes: CAT_STATUS_DESPESA_TERCEIRO,
    justificativa: "obrigatoria",
    origens: ["proposta", "calculo_aprovado", "planejador"],
    confiancaMinima: 4,
    validacao: "Situação das despesas de terceiros; exige justificativa quando não é “não aplicável”.",
    destinos: ["contrato", "anexo", "auditoria"],
  },
  {
    campo: "excecoes_comerciais",
    tipo: "texto_longo",
    justificativa: "obrigatoria",
    origens: ["calculo_aprovado", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Exceção comercial exige autorização e justificativa registradas.",
    destinos: ["contrato", "auditoria"],
  },
  // Assinatura e controle
  {
    campo: "partes_signatarias",
    tipo: "pessoa_vinculada",
    justificativa: "opcional",
    origens: ["planejador", "documento", "crm"],
    confiancaMinima: 4,
    validacao: "Todas as partes que assinam, com papel declarado.",
    destinos: ["contrato", "auditoria"],
  },
  {
    campo: "forma_assinatura",
    tipo: "dropdown",
    opcoes: CAT_FORMA_ASSINATURA,
    justificativa: "opcional",
    origens: TODAS_ORIGENS,
    confiancaMinima: 4,
    validacao: "Forma controlada de assinatura e registro externo.",
    destinos: ["contrato", "auditoria"],
  },
  {
    campo: "data_assinatura",
    tipo: "data",
    justificativa: "opcional",
    origens: ["documento", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Só é preenchida com comprovante de assinatura registrado.",
    destinos: ["contrato", "auditoria"],
  },
  {
    campo: "referencia_assinatura",
    tipo: "referencia",
    justificativa: "opcional",
    origens: ["documento", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Referência/comprovante externo da assinatura.",
    destinos: ["auditoria"],
  },
  {
    campo: "revisor_responsavel",
    tipo: "texto_curto",
    justificativa: "opcional",
    origens: ["planejador", "preenchimento_humano"],
    confiancaMinima: 4,
    validacao: "Pessoa/área responsável pela revisão humana.",
    destinos: ["auditoria", "interno"],
  },
];

const POR_CAMPO = new Map(DICIONARIO_CAMPOS.map((d) => [d.campo, d]));

/** Definição de um campo; texto curto genérico quando não catalogado. */
export function definicaoCampo(campo: string): DefinicaoCampo {
  return (
    POR_CAMPO.get(campo) ?? {
      campo,
      tipo: "texto_curto",
      justificativa: "opcional",
      confiancaMinima: 3,
      validacao: "Campo não catalogado: tratado como texto curto auditável.",
      destinos: ["interno"],
    }
  );
}

export function ehClassificatorio(campo: string) {
  const t = definicaoCampo(campo).tipo;
  return t === "dropdown" || t === "multiselect" || t === "booleano";
}

export const ROTULO_DESTINO: Record<Destino, string> = {
  contrato: "Contrato",
  anexo: "Anexo",
  auditoria: "Auditoria",
  interno: "Somente interno",
};

export const ROTULO_TIPO: Record<TipoCampo, string> = {
  dropdown: "Lista controlada",
  multiselect: "Lista controlada (múltipla)",
  texto_curto: "Texto curto",
  texto_longo: "Texto longo",
  data: "Data",
  monetario: "Valor monetário",
  pessoa_vinculada: "Pessoa vinculada",
  referencia: "Referência",
  booleano: "Sim/Não",
  url_interna: "URL interna",
};

/**
 * Valida um valor contra o dicionário. `valorAtual` é aceito como legado para
 * não invalidar dados já gravados antes da lista controlada.
 */
export function validarValorCampo(input: {
  campo: string;
  valor: string;
  origem: string;
  justificativa?: string;
  valorAtual?: string | null;
}): { ok: true } | { ok: false; erro: string } {
  const def = definicaoCampo(input.campo);
  const valor = input.valor.trim();

  if (valor && def.origens?.length && !def.origens.includes(input.origem)) {
    return { ok: false, erro: `Origem não permitida para este campo. Permitidas: ${def.origens.join(", ")}.` };
  }

  if (valor && def.justificativa === "obrigatoria" && !(input.justificativa ?? "").trim()) {
    return { ok: false, erro: "Este campo exige justificativa registrada para ser salvo." };
  }

  if (valor && (def.tipo === "dropdown" || def.tipo === "booleano")) {
    const permitidos = (def.opcoes ?? []).map((o) => o.valor);
    if (!permitidos.includes(valor) && valor !== (input.valorAtual ?? "")) {
      return { ok: false, erro: "Campo classificatório: selecione um valor da lista controlada (texto livre não é aceito)." };
    }
  }

  if (valor && def.tipo === "multiselect") {
    const permitidos = (def.opcoes ?? []).map((o) => o.valor);
    const partes = valor.split(",").map((p) => p.trim()).filter(Boolean);
    const invalidos = partes.filter((p) => !permitidos.includes(p));
    if (invalidos.length && valor !== (input.valorAtual ?? "")) {
      return { ok: false, erro: `Valor(es) fora da lista controlada: ${invalidos.join(", ")}.` };
    }
  }

  if (valor && def.tipo === "monetario" && !/^\d+([.,]\d{1,2})?$/.test(valor)) {
    return { ok: false, erro: "Valor monetário inválido: use apenas números (ex.: 9600 ou 9600,00)." };
  }

  if (valor && def.tipo === "data" && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return { ok: false, erro: "Data inválida: use o seletor de data." };
  }

  return { ok: true };
}

/**
 * Corte 1 (27/09/2026): `origem_detalhe` de um parâmetro que a equipe
 * esvaziou de propósito. A pré-carga automática (Planejador/proposta) nunca
 * repreenche uma linha com esta marca.
 */
export const MARCA_ESVAZIADO_PELA_EQUIPE = "Esvaziado pela equipe";
