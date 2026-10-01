/**
 * Integração Desk Intelligence → App Cliente (projeção autorizada).
 *
 * O Desk é a fonte soberana: o App Cliente só exibe o que foi PUBLICADO
 * explicitamente por uma pessoa da equipe (app_projections com destino "app",
 * approval_status "published" e vigência iniciada). Nada aqui infere prazo,
 * data estimada ou juízo de mérito sobre o caso.
 */

import { sanitizarRotuloCliente } from "./canvas-sanitize";
import { textoParaCliente } from "./portal-linguagem-viva";

export type ProjecaoBruta = {
  id: string;
  case_id?: string | null;
  projection_type?: string | null;
  content_sanitized?: string | null;
  effective_from?: string | null;
  updated_at?: string | null;
  /** Corte 2a: só projeções da árvore publicadas pela equipe trazem pessoa e geração. */
  pessoa_id?: string | null;
  geracao_cliente?: number | null;
};

export type PublicacaoCliente = {
  id: string;
  tipo: string;
  tipoRotulo: string;
  conteudo: string;
  publicadoEm: string | null;
};

/** Rótulos cliente-facing por tipo de projeção. Sem jargão interno. */
export const TIPO_PROJECAO_ROTULO: Record<string, string> = {
  linha_tempo: "Linha do tempo",
  arvore: "Árvore da família",
  achado: "Registro encontrado",
  evidencia: "Documento analisado",
  marco: "Marco da jornada",
  resumo: "Resumo do acompanhamento",
  atualizacao: "Atualização da equipe",
  legado: "Entrega de legado",
  // P5 (26/09/2026) — ponte real Relatório de fase → App (Estágio 5 da
  // cadeia de pesquisa), mesmo padrão de `projetarMicroentregaParaApp`.
  relatorio_fase: "Relatório da fase",
  // Corte 3 (01/10/2026) — plano na Conta e União de Ramos na Jornada.
  plano: "Seu plano",
  uniao_ramos: "União de ramos",
};

export function rotuloTipoProjecao(tipo: string | null | undefined): string {
  const bruto = String(tipo ?? "").trim();
  if (!bruto) return "Atualização da equipe";
  // Tipo sem rótulo aprovado nunca vira texto cru na tela do cliente.
  return TIPO_PROJECAO_ROTULO[bruto.toLowerCase()] ?? "Atualização da equipe";
}

/** Aviso fixo exibido junto das publicações no App Cliente. */
export const AVISO_PUBLICACAO_CLIENTE =
  "Conteúdo publicado pela equipe. Registros encontrados são hipóteses em verificação, não confirmação de direito.";

/**
 * Normaliza as publicações vindas da view `portal_projecoes`:
 * descarta conteúdo vazio, sanitiza juízo de mérito e ordena da mais recente
 * para a mais antiga.
 */
export function publicacoesParaCliente(linhas: ProjecaoBruta[]): PublicacaoCliente[] {
  return linhas
    .map((linha) => {
      
      const conteudo = textoParaCliente(
        sanitizarRotuloCliente(String(linha.content_sanitized ?? "").trim() || null),
      );
      if (!conteudo) return null;
      const tipo = String(linha.projection_type ?? "").trim().toLowerCase() || "atualizacao";
      const publicadoEm = linha.effective_from ?? linha.updated_at ?? null;
      return {
        id: String(linha.id),
        tipo,
        tipoRotulo: rotuloTipoProjecao(tipo),
        conteudo,
        publicadoEm,
      } satisfies PublicacaoCliente;
    })
    .filter((p): p is PublicacaoCliente => p !== null)
    .sort((a, b) => String(b.publicadoEm ?? "").localeCompare(String(a.publicadoEm ?? "")));
}

/** Coleções do mockup 17 (Legado, App) e §18 do De-Para (Biblioteca Mestre, Desk). */
export const PRATELEIRAS = [
  {
    id: "cadernos",
    rotulo: "Cadernos de Família",
    dica: "Documentos e cadernos preparados para contar a história da família.",
    match: /caderno|certid|batismo|registro/i,
  },
  {
    id: "relatorios",
    rotulo: "Dossiês e Relatórios",
    dica: "Sínteses da pesquisa preparadas para a sua família.",
    match: /relat[oó]rio|s[ií]ntese|parecer/i,
  },
  {
    id: "narrativas",
    rotulo: "Narrativas de Origem",
    dica: "Histórias e linhas do tempo que aproximam passado e presente.",
    match: /narrativa|hist[oó]ria|linha do tempo|mem[oó]ria familiar/i,
  },
  {
    id: "memoria",
    rotulo: "Memória",
    dica: "Materiais de memória e legado familiar.",
    match: /mem[oó]ria|legado|fam[ií]lia/i,
  },
] as const;

export type PrateleiraId = (typeof PRATELEIRAS)[number]["id"];

/**
 * Classifica uma publicação numa coleção (§18 "Coleções": Cadernos,
 * Relatórios, Narrativas...). Mesma função para App (Legado) e Desk
 * (Biblioteca Mestre) — as duas telas nunca podem divergir sobre em qual
 * coleção um item cai.
 */
export function prateleiraDe(item: Pick<PublicacaoCliente, "conteudo" | "tipoRotulo">): PrateleiraId {
  for (const p of PRATELEIRAS) {
    if (p.match.test(item.conteudo) || p.match.test(item.tipoRotulo)) return p.id;
  }
  return "cadernos";
}

/** Quantidade de publicações por caso, para os cartões da lista de casos. */
export function contarPublicacoesPorCaso(linhas: ProjecaoBruta[]): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const p of publicacoesParaCliente(linhas)) {
    const linha = linhas.find((l) => String(l.id) === p.id);
    const caso = String(linha?.case_id ?? "");
    if (!caso) continue;
    mapa.set(caso, (mapa.get(caso) ?? 0) + 1);
  }
  return mapa;
}
