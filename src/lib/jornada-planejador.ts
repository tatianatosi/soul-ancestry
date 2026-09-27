/**
 * P4 (25/09/2026) — Jornada do Planejador no Caso 360.
 *
 * `case_plans` já tem todos os campos pedidos (Produto-Pai PP-01–09,
 * país/via, etapa, marco, responsável, bloqueio, próxima ação,
 * micro-entrega) — o que faltava era um leitor estruturado em Caso 360 e
 * uma edição pontual desses campos, sem entrar na máquina de versionamento
 * do formulário grande (`sincronizarPlanejador`, hash + `versao`).
 *
 * Mesmo padrão do reconciliador D7 (`d7-microentrega.server.ts`): grava
 * direto na linha existente por `gravarComVerificacao`, nunca cria linha,
 * nunca toca `plano_hash`/`versao`/`status`.
 */
import type { ProdutoPaiId } from "@/lib/planejador-produtos-pai";

/** Os únicos campos que a edição pontual da jornada grava. */
export const CAMPOS_EDITAVEIS_JORNADA = [
  "etapa",
  "rota_confirmada",
  "produto_pai_id",
  "marco_atual",
  "responsavel_user_id",
  "proxima_acao",
  "prazo_proxima_acao",
] as const;

export type CampoEditavelJornada = (typeof CAMPOS_EDITAVEIS_JORNADA)[number];

export type CamposJornada = {
  etapa?: string | null;
  rota_confirmada?: string | null;
  produto_pai_id?: ProdutoPaiId | null;
  marco_atual?: string | null;
  responsavel_user_id?: string | null;
  proxima_acao?: string | null;
  prazo_proxima_acao?: string | null;
};

/**
 * `motivos_bloqueio` é jsonb — hoje um array de strings (gate D7/onboarding,
 * migration 20260924190000). Nunca escrito por esta jornada; só leitura.
 */
export function bloqueiosDoPlano(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((v) => String(v).trim()).filter(Boolean);
  return [];
}

/** Só o subconjunto realmente editável do payload — nunca versao/hash/status. */
export function patchJornada(campos: CamposJornada): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const chave of CAMPOS_EDITAVEIS_JORNADA) {
    if (chave in campos) {
      const v = (campos as Record<string, unknown>)[chave];
      patch[chave] = typeof v === "string" ? v.trim() || null : (v ?? null);
    }
  }
  return patch;
}

/** Nada para gravar não é erro — é "sem mudança"; a tela não chama o servidor à toa. */
export function jornadaMudou(patch: Record<string, unknown>): boolean {
  return Object.keys(patch).length > 0;
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Próxima ação sem prazo datado é uma pendência, não um erro — mas prazo mal formado é. */
export function prazoValido(prazo: unknown): boolean {
  if (prazo === null || prazo === undefined || prazo === "") return true;
  return DATA_ISO.test(String(prazo));
}

export type OrigemJornada = { texto: string; versao: number };

/** "Atualizado por X em dd/mm/aaaa (versão N)" — a origem do dado (item 3 do prompt). */
export function origemJornada(input: {
  versao: number;
  atualizadoEm: string | null;
  atualizadoPorNome: string | null;
}): OrigemJornada {
  const data = input.atualizadoEm ? new Date(input.atualizadoEm).toLocaleString("pt-BR") : "data não registrada";
  const quem = input.atualizadoPorNome ?? "responsável não identificado";
  return { texto: `Atualizado por ${quem} em ${data} (versão ${input.versao}).`, versao: input.versao };
}

/** Rascunho da tela Jornada do planejador (strings; "" = vazio). */
export type RascunhoJornada = {
  etapa: string;
  rotaConfirmada: string;
  produtoPaiId: string;
  marcoAtual: string;
  responsavelUserId: string;
  proximaAcao: string;
  prazoProximaAcao: string;
};

/** Corte 1: só o que difere do plano relido vai para o servidor. */
export function camposAlterados(
  r: RascunhoJornada,
  plano: {
    etapa?: string | null;
    rotaConfirmada?: string | null;
    produtoPaiId?: string | null;
    marcoAtual?: string | null;
    responsavelUserId?: string | null;
    proximaAcao?: string | null;
    prazoProximaAcao?: string | null;
  } | null,
): CamposJornada {
  const c: CamposJornada = {};
  const p = plano ?? {};
  if (r.etapa !== (p.etapa ?? "")) c.etapa = r.etapa;
  if (r.rotaConfirmada !== (p.rotaConfirmada ?? "")) c.rota_confirmada = r.rotaConfirmada;
  if (r.produtoPaiId !== (p.produtoPaiId ?? "")) c.produto_pai_id = (r.produtoPaiId || null) as never;
  if (r.marcoAtual !== (p.marcoAtual ?? "")) c.marco_atual = r.marcoAtual;
  if (r.responsavelUserId !== (p.responsavelUserId ?? "")) c.responsavel_user_id = r.responsavelUserId || null;
  if (r.proximaAcao !== (p.proximaAcao ?? "")) c.proxima_acao = r.proximaAcao;
  if (r.prazoProximaAcao !== (p.prazoProximaAcao ?? "")) c.prazo_proxima_acao = r.prazoProximaAcao || null;
  return c;
}
