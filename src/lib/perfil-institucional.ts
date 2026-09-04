/**
 * Perfil institucional versionado da contratada.
 *
 * Regras invioláveis:
 *  - o perfil é institucional e versionado: nunca editável dentro de um caso;
 *  - exceção administrativa exige perfil autorizado, motivo, vigência e auditoria;
 *  - nenhum dado pessoal da titular (CPF, RG, telefone/e-mail pessoal) é renderizável;
 *  - o WhatsApp é apenas referência à configuração institucional homologada.
 */

import {
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  violacoesIdentificacao,
  type CampoInstitucional,
  type EstadoVigenciaContratoBase,
} from "@/lib/contrato-base-consolidado";
import { CLAUSULA_DESPESAS_TERCEIROS } from "@/lib/despesas-terceiros";

export { PERFIL_INSTITUCIONAL_VERSAO };

/** Status desta versão do perfil. Só muda por decisão humana registrada. */
export const PERFIL_INSTITUCIONAL_STATUS: EstadoVigenciaContratoBase = "vigente";

export const CAMPOS_INSTITUCIONAIS_OBRIGATORIOS = [
  "razao_empresarial",
  "nome_operacao",
  "cnpj",
  "representante_legal",
  "endereco_institucional",
  "email_oficial",
  "site",
  "whatsapp",
  "titulo",
  "subtitulo",
] as const;

/**
 * Rótulo de estado do perfil institucional. Enquanto o status não for
 * `vigente`, nenhuma tela pode chamá-lo de vigente: usa-se "de referência"
 * (leitura) ou "em revisão" (governança), evitando contradição com o chip
 * `under_legal_review`.
 */
export function rotuloEstadoPerfilInstitucional(
  status: EstadoVigenciaContratoBase = PERFIL_INSTITUCIONAL_STATUS,
): string {
  if (status === "vigente") return "perfil institucional vigente";
  if (status === "under_legal_review") return "perfil institucional em revisão";
  return "perfil institucional de referência";
}

export type PerfilInstitucionalRenderizado = {
  versao: string;
  status: EstadoVigenciaContratoBase;
  vigente: boolean;
  campos: CampoInstitucional[];
  violacoes: string[];
  pendencias: string[];
};

/** Projeção do perfil para prévia/contrato: sem dado pessoal, com verificação defensiva. */
export function perfilInstitucionalRenderizado(
  status: EstadoVigenciaContratoBase = PERFIL_INSTITUCIONAL_STATUS,
): PerfilInstitucionalRenderizado {
  const campos = PERFIL_INSTITUCIONAL.map((c) => ({ ...c }));
  const violacoes = campos.flatMap((c) => violacoesIdentificacao(`${c.rotulo} ${c.valor}`));
  const pendencias: string[] = [];
  for (const campo of CAMPOS_INSTITUCIONAIS_OBRIGATORIOS) {
    const achado = campos.find((c) => c.campo === campo);
    if (!achado || !achado.valor.trim()) pendencias.push(`Campo institucional obrigatório ausente: ${campo}.`);
  }
  if (status !== "vigente") {
    pendencias.push("Perfil institucional não vigente: revisão jurídica pendente bloqueia prévia final e assinatura.");
  }
  return { versao: PERFIL_INSTITUCIONAL_VERSAO, status, vigente: status === "vigente", campos, violacoes, pendencias };
}

/** Edição dentro do caso é sempre negada; exceção administrativa é validada aqui. */
export type ExcecaoInstitucional = {
  perfilAutorizado: boolean;
  motivo?: string | null;
  vigenciaAte?: string | null;
  autor?: string | null;
  registradoEmAuditoria?: boolean;
};

export function edicaoInstitucionalPermitida(
  contexto: "caso" | "administrativo",
  excecao?: ExcecaoInstitucional | null,
): { permitido: boolean; motivo: string } {
  if (contexto === "caso") {
    return { permitido: false, motivo: "Dados institucionais não são editáveis dentro de caso." };
  }
  if (!excecao?.perfilAutorizado) return { permitido: false, motivo: "Exceção exige perfil autorizado." };
  if (!excecao.motivo?.trim()) return { permitido: false, motivo: "Exceção exige motivo registrado." };
  if (!excecao.vigenciaAte?.trim()) return { permitido: false, motivo: "Exceção exige vigência determinada." };
  if (!excecao.autor?.trim()) return { permitido: false, motivo: "Exceção exige autor identificado." };
  if (!excecao.registradoEmAuditoria) return { permitido: false, motivo: "Exceção exige registro de auditoria." };
  return { permitido: true, motivo: "Exceção administrativa válida e auditada." };
}

/* ------------------------------------------------------------------ */
/* Regra institucional comercial                                        */
/* ------------------------------------------------------------------ */

export const REGRA_COMERCIAL_INSTITUCIONAL_ID = "REGRA-COM-TERCEIROS-v1.0";
export const REGRA_COMERCIAL_INSTITUCIONAL = CLAUSULA_DESPESAS_TERCEIROS;

export const REGRA_COMERCIAL_APLICACAO = [
  "Aplicável por padrão a todos os novos contratos.",
  "Exceção exige justificativa, aprovador, validade e auditoria.",
  "Despesa de terceiro nunca é receita, custo, desembolso ou reembolso padrão do Clube.",
  "SKU, valor, condição e link vêm apenas de fonte homologada.",
  "SKU sem preço/condição homologados não gera valor nem cobrança.",
];

export const FONTES_PRECO_HOMOLOGADAS = ["planilha_mestre", "planejador_homologado", "sku_homologado"] as const;

/** Template, WhatsApp, transcrição e preenchimento livre nunca definem preço. */
export function precoDeFonteHomologada(fonte?: string | null): boolean {
  return FONTES_PRECO_HOMOLOGADAS.includes(String(fonte ?? "") as (typeof FONTES_PRECO_HOMOLOGADAS)[number]);
}

export type SkuComercial = {
  sku: string | null;
  precoHomologado: string | null;
  condicaoHomologada: string | null;
  fonte: string | null;
};

export function skuPodeGerarValor(s: SkuComercial | null): { ok: boolean; motivo?: string } {
  if (!s?.sku) return { ok: false, motivo: "SKU ausente: valor não pode ser gerado." };
  if (!precoDeFonteHomologada(s.fonte)) return { ok: false, motivo: "Preço sem fonte homologada: valor não pode ser gerado." };
  if (!s.precoHomologado) return { ok: false, motivo: "SKU sem preço homologado: não gera valor nem cobrança." };
  if (!s.condicaoHomologada) return { ok: false, motivo: "SKU sem condição homologada: não gera valor nem cobrança." };
  return { ok: true };
}

/** Classificação financeira fixa de despesa de terceiro. */
export function despesaTerceiroNoCaixaDoClube(): false {
  return false;
}

/* ------------------------------------------------------------------ */
/* Complemento comercial permitido pela proposta/OS aprovada            */
/* ------------------------------------------------------------------ */

export const CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA = [
  "valor_total_aprovado",
  "forma_pagamento",
  "quantidade_parcelas",
  "valor_mensal_total",
  "quantidade_assinaturas_responsaveis",
  "valor_por_assinatura",
  "regra_despesas_externas",
] as const;

export type CampoComplementavel = (typeof CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA)[number];

export function complementoPropostaPermitido(input: {
  campo: string;
  planejadorTemValor: boolean;
  declaradoExpressamente?: boolean;
}): { permitido: boolean; motivo: string } {
  const campo = input.campo as CampoComplementavel;
  if (!CAMPOS_COMPLEMENTAVEIS_PELA_PROPOSTA.includes(campo)) {
    return { permitido: false, motivo: "Campo não é complementável por proposta/OS." };
  }
  if (input.planejadorTemValor) {
    return { permitido: false, motivo: "Planejador homologado tem valor aplicável: proposta não sobrescreve." };
  }
  if (campo === "regra_despesas_externas" && !input.declaradoExpressamente) {
    return { permitido: false, motivo: "Regra de despesas externas só vale se expressamente declarada." };
  }
  return { permitido: true, motivo: "Complemento permitido na ausência de valor homologado no Planejador." };
}

/** Vencimento nunca é inferido: permanece pendente. */
export function vencimentoInferido(): null {
  return null;
}

export function conflitoPlanejadorProposta(input: {
  campo: string;
  planejador?: string | null;
  proposta?: string | null;
}): { conflito: boolean; motivo?: string } {
  const a = (input.planejador ?? "").trim();
  const b = (input.proposta ?? "").trim();
  if (!a || !b) return { conflito: false };
  if (a === b) return { conflito: false };
  return {
    conflito: true,
    motivo: `Divergência em ${input.campo}: Planejador "${a}" x proposta "${b}". Resolução humana obrigatória — nenhum valor é sobrescrito.`,
  };
}

/* ------------------------------------------------------------------ */
/* Método institucional de assinatura                                   */
/* ------------------------------------------------------------------ */

export type EstadoMetodoAssinatura = "a_configurar" | "configurado";

/**
 * Sem configuração institucional homologada, o método fica `a_configurar`:
 * a assinatura é bloqueada e nenhum valor falso é gravado no rascunho.
 */
export function estadoMetodoAssinatura(metodo?: string | null): {
  estado: EstadoMetodoAssinatura;
  valorRenderizado: string | null;
  bloqueiaAssinatura: boolean;
  motivo: string;
} {
  const ok = Boolean(metodo && metodo.trim());
  return {
    estado: ok ? "configurado" : "a_configurar",
    valorRenderizado: ok ? String(metodo).trim() : null,
    bloqueiaAssinatura: !ok,
    motivo: ok
      ? "Método institucional de assinatura configurado."
      : "Método institucional de assinatura a configurar — assinatura bloqueada; nenhum valor é preenchido no rascunho.",
  };
}
