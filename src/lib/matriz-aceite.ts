/**
 * Matriz de Renderização e Gates do Motor Contratual v1.0 — especificação de aceite.
 *
 * Consolida, em um único lugar auditável: ordem de fontes, regras dos anexos
 * familiares, gates bloqueantes e critérios de aceite da prévia interna de TESTE.
 * Nada aqui executa assinatura, cobrança, pesquisa externa, portal ou comunicação.
 */

import { MATRIZ_RENDERIZACAO, type LinhaRenderizacao } from "@/lib/contrato-base-consolidado";
import { EVENTOS_GOVERNANCA } from "@/lib/rascunho-contratual";
import type { AnexoGovernado } from "@/lib/anexos-i-v";

export const MATRIZ_ACEITE_VERSAO = "MATRIZ-RENDERIZACAO-E-GATES-v1.0";

/* ---------------- Ordem de fontes ---------------- */

export const ORDEM_FONTES: { ordem: number; fonte: string }[] = [
  { ordem: 1, fonte: "Planejador homologado" },
  { ordem: 2, fonte: "Proposta/OS aprovada vinculada ao mesmo caso" },
  { ordem: 3, fonte: "CRM/cadastro confirmado" },
  { ordem: 4, fonte: "Documento conferido" },
  { ordem: 5, fonte: "Preenchimento humano confirmado" },
  { ordem: 6, fonte: "Importado a confirmar" },
];

export const FONTES_APENAS_APOIO =
  "WhatsApp, transcrições, reuniões e relatos são apoio interno; nunca validam automaticamente dados contratuais.";

/* ---------------- Anexos familiares ---------------- */

export const ANEXOS_FAMILIARES: { anexo: string; regra: string }[] = [
  { anexo: "Anexo I / Ordem de Serviço", regra: "Obrigatório com proposta/OS válida." },
  { anexo: "Anexo II / Despesas", regra: "Conforme despesas externas aplicáveis." },
  { anexo: "Anexo III / Pesquisa", regra: "Antes de pesquisa externa específica." },
  { anexo: "Anexo IV / Procuração", regra: "Somente se finalidade e poderes forem exigidos." },
  { anexo: "Anexo V / Alteração de escopo", regra: "Somente em alteração formal." },
  { anexo: "ANX-INDIVIDUAL", regra: "Uma instância por requerente adulto aplicável." },
  { anexo: "ANX-REPRESENTACAO", regra: "Somente para menor/incapaz quando necessário." },
  { anexo: "ANX-PRIVACIDADE", regra: "Conforme tratamento de dados e política vigente." },
];

/* ---------------- Rascunho e versões ---------------- */

export const REGRAS_RASCUNHO_VERSAO: string[] = [
  "Um único rascunho editável por organização, caso e versão de modelo.",
  "Salvar, importar, confirmar e recalcular atualizam o mesmo rascunho.",
  `Snapshot imutável só nasce em evento de governança: ${EVENTOS_GOVERNANCA.join(", ")}.`,
  "Conteúdo idêntico não gera versão nova.",
  "Rascunho histórico não satisfaz gate de revisão ou assinatura.",
];

/* ---------------- Gates bloqueantes ---------------- */

export const ALVOS_BLOQUEAVEIS = [
  "prévia final",
  "revisão humana",
  "assinatura",
  "financeiro",
  "portal",
  "pesquisa externa",
] as const;

export const GATES_BLOQUEANTES: string[] = [
  "Perfil institucional ausente ou inativo.",
  "Modelo inválido.",
  "Proposta/OS inválida, ausente, arquivada, substituída, recusada, expirada ou de outro caso.",
  "Escopo sem inclusões, exclusões, entregas e limites derivados.",
  "Anexo obrigatório pendente.",
  "Campo obrigatório sem fonte válida.",
  "Conflito crítico de rota, preço, escopo, parte ou proposta.",
  "Condição comercial não confirmada.",
  "Vencimento necessário sem fonte formal.",
  "Método de assinatura institucional ausente.",
  "Revisão humana/jurídica pendente.",
  "Autorização de pesquisa ausente para ação externa aplicável.",
  "Procuração ausente quando exigida.",
  "Representação de menor necessária e não definida.",
];

/* ---------------- Renderização por bloco ---------------- */

export type BlocoRenderizado = LinhaRenderizacao & {
  situacao: "renderizado" | "renderizado_com_pendencia" | "nao_aplicavel";
  motivo: string;
};

/**
 * Avalia os 16 blocos contra os anexos governados do caso.
 * Bloco condicional sem anexo aplicável não vira pendência: sai como não aplicável.
 */
export function blocosRenderizados(
  anexos: AnexoGovernado[],
  pendentesPorBloco: Record<string, string> = {},
): BlocoRenderizado[] {
  return MATRIZ_RENDERIZACAO.map((l) => {
    const anexo = l.anexo ? anexos.find((a) => a.codigo === l.anexo) ?? null : null;
    if (l.renderiza === "quando_aplicavel" && (!anexo || !anexo.aplicavel)) {
      return { ...l, situacao: "nao_aplicavel", motivo: anexo?.motivo ?? "Não aplicável a este caso." };
    }
    const pendManual = pendentesPorBloco[l.bloco];
    const pendAnexo = anexo?.pendencias?.[0];
    const motivo = pendManual ?? pendAnexo;
    if (motivo) return { ...l, situacao: "renderizado_com_pendencia", motivo };
    return { ...l, situacao: "renderizado", motivo: "Bloco derivado de fonte válida." };
  });
}

/* ---------------- Critérios de aceite ---------------- */

export type CriterioAceite = { id: number; criterio: string; atendido: boolean; observacao: string };

export type EntradaAceite = {
  clausulasFixasRenderizadas: boolean;
  variaveisComFonteEstadoVersao: boolean;
  anexosIaVAvaliados: boolean;
  anexosFamiliaresConformes: boolean;
  rascunhosDoCaso: number;
  snapshotsSomentePorEvento: boolean;
  bloqueiosComMotivoResponsavelRota: boolean;
  nenhumaAcaoExternaExecutada: boolean;
};

export function avaliarCriteriosAceite(e: EntradaAceite): CriterioAceite[] {
  const c = (id: number, criterio: string, atendido: boolean, observacao: string): CriterioAceite => ({
    id,
    criterio,
    atendido,
    observacao,
  });
  return [
    c(1, "Todas as cláusulas fixas do contrato-base renderizadas", e.clausulasFixasRenderizadas, "Texto versionado, não editável por caso."),
    c(2, "Fonte, estado e versão das variáveis aplicáveis", e.variaveisComFonteEstadoVersao, "Sem fonte válida, o campo permanece ausente."),
    c(3, "Anexos I–V quando aplicáveis", e.anexosIaVAvaliados, "Condicionais só aparecem quando aplicáveis."),
    c(4, "Anexos individuais e de representação conforme regra familiar", e.anexosFamiliaresConformes, "Um contrato-base; anexos por requerente adulto."),
    c(5, "Um único rascunho de trabalho", e.rascunhosDoCaso === 1, `Rascunhos ativos: ${e.rascunhosDoCaso}.`),
    c(6, "Snapshots somente por evento de governança", e.snapshotsSomentePorEvento, "Conteúdo idêntico não gera versão nova."),
    c(7, "Bloqueios com motivo, responsável e rota de resolução", e.bloqueiosComMotivoResponsavelRota, "Bloqueio sem rota de resolução não é aceitável."),
    c(
      8,
      "Nenhuma assinatura, cobrança, pesquisa externa, portal ou comunicação executada",
      e.nenhumaAcaoExternaExecutada,
      "Motor é interno: nada sai automaticamente.",
    ),
  ];
}

export function aceiteConcluido(criterios: CriterioAceite[]): boolean {
  return criterios.every((c) => c.atendido);
}
