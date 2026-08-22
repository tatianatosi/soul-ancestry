/**
 * Matriz versionada de cláusulas A–P do contrato-base MODELO-ESTUDO + BASE-GEN-V2.
 *
 * Cada cláusula declara fonte, tipo, parâmetros permitidos e efeito nos gates.
 * Cláusula fixa é institucional: nunca vira texto livre por caso.
 */

import { CONTRATO_BASE_MODELO, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import {
  gateLiberado,
  modeloGeraPrevia,
  propostaSatisfazGate,
  type AnexoGovernado,
  type ConflitoFonte,
  type EntradaAnexosIaV,
  type GateContratual,
} from "@/lib/anexos-i-v";
import { perfilInstitucionalRenderizado, precoDeFonteHomologada } from "@/lib/perfil-institucional";

export const MATRIZ_CLAUSULAS_VERSAO = "MATRIZ-CLAUSULAS-v1.0";
export const MATRIZ_CLAUSULAS_MODELO = CONTRATO_BASE_MODELO;

export const FONTES_CLAUSULA = [
  "contrato_base",
  "perfil_institucional",
  "parametro_caso",
  "proposta_os",
  "anx_escopo",
  "anx_comercial",
  "config_juridica",
] as const;
export type FonteClausula = (typeof FONTES_CLAUSULA)[number];

export const ROTULO_FONTE_CLAUSULA: Record<FonteClausula, string> = {
  contrato_base: "Contrato-base",
  perfil_institucional: "Perfil institucional",
  parametro_caso: "Parâmetro de caso",
  proposta_os: "Proposta/OS aprovada",
  anx_escopo: "ANX-ESCOPO",
  anx_comercial: "ANX-COMERCIAL",
  config_juridica: "Configuração jurídica",
};

export type TipoClausula = "fixa" | "parametrizada" | "condicional";
export const ROTULO_TIPO_CLAUSULA: Record<TipoClausula, string> = {
  fixa: "Fixa",
  parametrizada: "Parametrizada",
  condicional: "Condicional",
};

export type StatusClausula = "presente" | "pendente" | "conflito" | "bloqueante";
export const ROTULO_STATUS_CLAUSULA: Record<StatusClausula, string> = {
  presente: "Presente",
  pendente: "Pendente",
  conflito: "Conflito",
  bloqueante: "Bloqueante",
};

export type ClausulaMatriz = {
  id: string; // A..P
  titulo: string;
  fonte: FonteClausula;
  tipo: TipoClausula;
  parametros: string[];
  gates: GateContratual[];
};

export const CLAUSULAS_MATRIZ: ClausulaMatriz[] = [
  { id: "A", titulo: "Qualificação institucional da contratada", fonte: "perfil_institucional", tipo: "fixa", parametros: ["perfil_institucional.versao"], gates: ["previa_final", "revisao_humana", "assinatura"] },
  { id: "B", titulo: "Qualificação das partes, signatários e representação aplicável", fonte: "parametro_caso", tipo: "parametrizada", parametros: ["contratante_nome", "signatarios", "representacao"], gates: ["previa_final", "assinatura"] },
  { id: "C", titulo: "Objeto do estudo/serviço", fonte: "proposta_os", tipo: "parametrizada", parametros: ["objeto_contrato", "escopo_resumo"], gates: ["previa_final"] },
  { id: "D", titulo: "Escopo, entregas e exclusões", fonte: "anx_escopo", tipo: "parametrizada", parametros: ["servicos_incluidos", "servicos_excluidos", "fases_entregas"], gates: ["previa_final", "revisao_humana"] },
  { id: "E", titulo: "Obrigações do contratante", fonte: "contrato_base", tipo: "fixa", parametros: [], gates: [] },
  { id: "F", titulo: "Obrigações do Clube Ancestral", fonte: "contrato_base", tipo: "fixa", parametros: [], gates: [] },
  { id: "G", titulo: "Limitações e ausência de garantia de resultado", fonte: "contrato_base", tipo: "fixa", parametros: [], gates: [] },
  { id: "H", titulo: "Dados, sigilo, LGPD, guarda, retenção e descarte", fonte: "config_juridica", tipo: "condicional", parametros: ["politica_privacidade.versao", "retencao_prazo"], gates: ["previa_final", "revisao_humana"] },
  { id: "I", titulo: "Preço, parcelas, vencimentos, condição de início e regra comercial", fonte: "anx_comercial", tipo: "parametrizada", parametros: ["valor_total", "forma_pagamento", "parcelas", "vencimentos"], gates: ["previa_final", "assinatura", "financeiro"] },
  { id: "J", titulo: "Despesas de terceiros", fonte: "anx_comercial", tipo: "condicional", parametros: ["despesas_externas", "aprovacao_despesa"], gates: ["previa_final", "financeiro"] },
  { id: "K", titulo: "Prazo, marcos, dependência documental e suspensão/ajuste", fonte: "proposta_os", tipo: "parametrizada", parametros: ["prazos_referencia", "condicao_inicio"], gates: ["previa_final"] },
  { id: "L", titulo: "Cumprimento e encerramento do serviço", fonte: "contrato_base", tipo: "fixa", parametros: [], gates: [] },
  { id: "M", titulo: "Propriedade intelectual e materiais", fonte: "contrato_base", tipo: "fixa", parametros: [], gates: [] },
  { id: "N", titulo: "Assinatura, evidência, versão e registros", fonte: "config_juridica", tipo: "condicional", parametros: ["forma_assinatura", "evidencia_externa"], gates: ["assinatura", "financeiro"] },
  { id: "O", titulo: "Foro e disposições finais", fonte: "config_juridica", tipo: "fixa", parametros: ["foro"], gates: ["previa_final", "assinatura"] },
  { id: "P", titulo: "Anexos aplicáveis (ANX-ESCOPO, ANX-PRIVACIDADE, ANX-COMERCIAL, ANX-INDIVIDUAL, ANX-REPRESENTACAO)", fonte: "contrato_base", tipo: "condicional", parametros: ["anexos_aplicaveis"], gates: ["previa_final", "assinatura"] },
];

export const IDS_CLAUSULAS = CLAUSULAS_MATRIZ.map((c) => c.id);

/** Cláusula fixa nunca é editável por caso. */
export function clausulaEditavelPorCaso(id: string): boolean {
  const c = CLAUSULAS_MATRIZ.find((x) => x.id === id);
  if (!c) return false;
  return c.tipo !== "fixa";
}

export type EntradaMatrizClausulas = {
  modelo: string;
  entradaAnexos: EntradaAnexosIaV;
  anexos: AnexoGovernado[];
  conflitos: ConflitoFonte[];
  perfilStatus?: Parameters<typeof perfilInstitucionalRenderizado>[0];
  politicaPrivacidadeVigente: boolean;
  foroConfigurado: boolean;
  metodoAssinaturaConfigurado: boolean;
  revisaoJuridicaAprovada: boolean;
};

export type LinhaClausulaAvaliada = ClausulaMatriz & {
  status: StatusClausula;
  motivo: string;
  origem: string;
  editavelPorCaso: boolean;
};

export function avaliarMatrizClausulas(e: EntradaMatrizClausulas): LinhaClausulaAvaliada[] {
  const perfil = perfilInstitucionalRenderizado(e.perfilStatus);
  const prop = propostaSatisfazGate(e.entradaAnexos.proposta ?? null, e.entradaAnexos.caseId);
  const p = e.entradaAnexos.proposta;
  const anexo = (codigo: string) => e.anexos.find((a) => a.codigo === codigo) ?? null;
  const conflitoDe = (campo: string) => e.conflitos.find((c) => c.campo === campo) ?? null;

  const linha = (
    c: ClausulaMatriz,
    status: StatusClausula,
    motivo: string,
    origem: string,
  ): LinhaClausulaAvaliada => ({ ...c, status, motivo, origem, editavelPorCaso: clausulaEditavelPorCaso(c.id) });

  return CLAUSULAS_MATRIZ.map((c) => {
    switch (c.id) {
      case "A":
        if (perfil.violacoes.length) return linha(c, "bloqueante", perfil.violacoes.join(" "), perfil.versao);
        if (!perfil.vigente) return linha(c, "bloqueante", "Perfil institucional não vigente (revisão jurídica pendente).", perfil.versao);
        return linha(c, "presente", "Qualificação institucional derivada do perfil vigente.", perfil.versao);
      case "B": {
        const nome = e.entradaAnexos.clienteNome;
        if (!nome) return linha(c, "pendente", "Signatário/contratante sem qualificação confirmada.", "Parâmetro de caso");
        return linha(c, "presente", "Partes derivadas de parâmetros confirmados.", "Parâmetro de caso");
      }
      case "C":
        if (!prop.ok) return linha(c, "bloqueante", prop.motivo ?? "Proposta/OS inválida.", "Proposta/OS");
        if (!p?.objetivoEtapa) return linha(c, "pendente", "Objeto não derivado da proposta/OS aprovada.", "Proposta/OS");
        return linha(c, "presente", "Objeto derivado da proposta/OS aprovada.", `Proposta ${p?.versao ?? "sem versão"}`);
      case "D": {
        if (!prop.ok) return linha(c, "bloqueante", prop.motivo ?? "Proposta/OS inválida.", "ANX-ESCOPO");
        if (p?.servicosExcluidos === null) return linha(c, "pendente", "Exclusões não especificadas na proposta/OS — revisão humana necessária.", "ANX-ESCOPO");
        if (!p?.entregaveis?.length) return linha(c, "pendente", "Entregáveis não derivados da proposta/OS.", "ANX-ESCOPO");
        return linha(c, "presente", "Escopo, entregas e exclusões derivados do anexo de escopo.", "ANX-ESCOPO");
      }
      case "E":
      case "F":
      case "G":
      case "L":
      case "M":
        return linha(c, "presente", "Texto fixo institucional versionado; não editável por caso.", `${CONTRATO_BASE_VERSAO}`);
      case "H":
        if (!e.politicaPrivacidadeVigente) {
          return linha(c, "bloqueante", "Política jurídica de retenção/descarte não vigente: prazo não é inventado.", "Configuração jurídica");
        }
        return linha(c, "presente", "Cláusula conforme política jurídica versionada vigente.", "Configuração jurídica");
      case "I": {
        const conf = conflitoDe("valor_total") ?? conflitoDe("preco");
        if (conf)
          return linha(
            c,
            "conflito",
            `Divergência em ${conf.campo}: "${conf.valorAtual ?? "—"}" (${conf.origemAtual}) x "${conf.valorConcorrente ?? "—"}" (${conf.origemConcorrente}). Resolução humana obrigatória — nenhum valor é sobrescrito.`,
            "Planejador x proposta",
          );
        if (!prop.ok) return linha(c, "bloqueante", prop.motivo ?? "Proposta/OS inválida.", "ANX-COMERCIAL");
        if (!precoDeFonteHomologada(p?.fontePreco)) {
          return linha(c, "bloqueante", "Preço sem fonte homologada (template, WhatsApp ou transcrição não definem preço).", "ANX-COMERCIAL");
        }
        if (!p?.primeiroVencimento) return linha(c, "pendente", "Vencimento não formalizado — não inferido pelo número de parcelas.", "ANX-COMERCIAL");
        return linha(c, "presente", "Condição comercial derivada de fonte homologada.", "ANX-COMERCIAL");
      }
      case "J": {
        const a = anexo("ANEXO_II_DESPESAS_EXTERNAS");
        if (a && (a.pendencias.length > 0 || a.estado === "pendente")) {
          return linha(c, "pendente", a.pendencias[0] ?? "Política de despesas de terceiros pendente.", "Regra institucional");
        }
        const semAprovacao = (e.entradaAnexos.despesas ?? []).filter((d) => !d.aprovacaoRegistrada);
        if (semAprovacao.length) {
          return linha(
            c,
            "pendente",
            `Despesa de terceiro sem aprovação registrada: ${semAprovacao.map((d) => d.item).join(", ")}. Não é receita, custo nem reembolso do Clube.`,
            "Regra institucional",
          );
        }
        return linha(c, "presente", "Despesas de terceiros pagas diretamente pelo cliente, mediante aprovação registrada.", "Regra institucional");
      }
      case "K":
        if (!p?.limitesDependencias?.length) return linha(c, "pendente", "Prazos e dependências não formalizados; não inferir.", "Proposta/OS");
        return linha(c, "presente", "Prazos e dependências derivados da proposta/OS.", "Proposta/OS");
      case "N":
        if (!e.metodoAssinaturaConfigurado) return linha(c, "bloqueante", "Método de assinatura institucional ausente.", "Configuração jurídica");
        if (!e.revisaoJuridicaAprovada) return linha(c, "bloqueante", "Revisão jurídica pendente: assinatura bloqueada.", "Configuração jurídica");
        return linha(c, "presente", "Assinatura, evidência e versão configuradas.", "Configuração jurídica");
      case "O":
        if (!e.foroConfigurado) return linha(c, "bloqueante", "Foro/disposições finais sem configuração jurídica autorizada.", "Configuração jurídica");
        return linha(c, "presente", "Foro conforme configuração jurídica autorizada.", "Configuração jurídica");
      case "P": {
        const pendentes = e.anexos.filter((a) => a.obrigatorio && (a.pendencias.length > 0 || a.estado === "pendente"));
        if (pendentes.length) {
          return linha(c, "bloqueante", `Anexo obrigatório pendente: ${pendentes.map((a) => a.titulo).join(", ")}.`, "Regras de aplicabilidade");
        }
        return linha(c, "presente", "Anexos aplicáveis completos.", "Regras de aplicabilidade");
      }
      default:
        return linha(c, "pendente", "Cláusula não avaliada.", "—");
    }
  });
}

/** Gate de prévia final: modelo permitido + nenhuma cláusula em conflito/bloqueio. */
export function previaFinalLiberada(input: {
  modelo: string;
  linhas: LinhaClausulaAvaliada[];
  bloqueiosGates: { gate: GateContratual }[];
}): { liberada: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (!modeloGeraPrevia(input.modelo)) {
    motivos.push(`Modelo não permitido para geração: ${input.modelo || "sem modelo"} (permitidos: MODELO-ESTUDO, BASE-GEN-V2).`);
  }
  for (const l of input.linhas) {
    if (l.status === "bloqueante" || l.status === "conflito" || l.status === "pendente") {
      motivos.push(`Cláusula ${l.id} — ${l.titulo}: ${l.motivo}`);
    }
  }
  if (!gateLiberado("previa_final", input.bloqueiosGates)) motivos.push("Gate de prévia final bloqueado pelos anexos.");
  return { liberada: motivos.length === 0, motivos };
}

/** Financeiro só abre após assinatura externa registrada com data, origem e referência. */
export function financeiroLiberado(a?: { assinadoEm?: string | null; origem?: string | null; referencia?: string | null } | null): boolean {
  return Boolean(a?.assinadoEm && a?.origem && a?.referencia);
}

/* ------------------------------------------------------------------ */
/* Caso familiar                                                        */
/* ------------------------------------------------------------------ */

export type MembroFamiliar = {
  nome: string;
  maiorIdade: boolean;
  requerente: boolean;
  aplicavel: boolean;
  representacaoNecessaria?: boolean;
};

export type EstruturaFamiliarContrato = {
  signatarios: string[];
  naoSignatarios: string[];
  anexosIndividuais: string[];
  representacaoAplicavel: boolean;
  contratosParalelos: 0;
};

export function estruturaContratoFamiliar(membros: MembroFamiliar[]): EstruturaFamiliarContrato {
  const aplicaveis = membros.filter((m) => m.aplicavel);
  return {
    signatarios: aplicaveis.filter((m) => m.maiorIdade).map((m) => m.nome),
    naoSignatarios: aplicaveis.filter((m) => !m.maiorIdade).map((m) => m.nome),
    anexosIndividuais: aplicaveis.filter((m) => m.maiorIdade && m.requerente).map((m) => m.nome),
    representacaoAplicavel: aplicaveis.some((m) => !m.maiorIdade && m.representacaoNecessaria === true),
    contratosParalelos: 0,
  };
}
