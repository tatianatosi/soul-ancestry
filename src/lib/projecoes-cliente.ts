/**
 * Integração Desk Intelligence → App Cliente (projeção autorizada).
 *
 * O Desk é a fonte soberana: o App Cliente só exibe o que foi PUBLICADO
 * explicitamente por uma pessoa da equipe (app_projections com destino "app",
 * approval_status "published" e vigência iniciada). Nada aqui infere prazo,
 * data estimada ou juízo de mérito sobre o caso.
 */

import { sanitizarRotuloCliente } from "./canvas-sanitize";

export type ProjecaoBruta = {
  id: string;
  case_id?: string | null;
  projection_type?: string | null;
  content_sanitized?: string | null;
  effective_from?: string | null;
  updated_at?: string | null;
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
      const conteudo = sanitizarRotuloCliente(String(linha.content_sanitized ?? "").trim() || null);
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
