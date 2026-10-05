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
  /** Corte 3c (02/10/2026): só projeções do tipo uniao_ramos usam as duas pontas. */
  source_entity_id?: string | null;
  vinculo_projecao_id?: string | null;
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
  /*
    A7 liberado em 03/10/2026 com escopo estreito ("somente devemos mostrar
    sua assinatura e possibilidade de upsell com preço"). O valor entra como
    campo numérico estruturado em `assinatura-app.ts`; texto livre continua
    sem preço. Nenhum dos dois rende cartão de entrega na jornada: moram na
    Conta.
  */
  assinatura: "Sua assinatura",
  upsell: "Próximo nível disponível",
  /*
    Varredura de 03/10/2026: estes três tipos já eram esperados por
    `TIPOS_FASE_01`/`TIPOS_FASE_02` e por `TAXONOMIA_ENTREGA`
    (`app-visibilidade.ts`), mas não tinham rótulo aqui — então caíam no
    genérico "Atualização da equipe". A microentrega publicada do caso real
    da Ana é uma delas.
  */
  microentrega: "Da nossa jornada",
  relatorio_f1: "Relatório preparado",
  relatorio_f2: "Atualização seguinte",
};

/**
 * Tipos que NUNCA são conteúdo do App Cliente (decisão da Proprietária,
 * 03/10/2026, lendo o mockup aprovado): "originalmente o cliente não tem
 * acesso a proposta e o contrato no app; parte das informações extraídas da
 * proposta estará na minha conta no app; o contrato ele terá acesso via
 * portal para a sua assinatura".
 *
 * Ou seja: a informação da proposta chega à Conta pelo tipo `plano`
 * (nome + situação + vigência, sem preço — Corte 3a), e o contrato é
 * acessado para assinatura por outro caminho, não como cartão de conteúdo.
 */
export const TIPOS_FORA_DO_APP = new Set(["contrato", "proposta"]);

/**
 * Lista PERMITIDA de tipos que podem chegar ao cliente.
 *
 * Defeito estrutural achado na varredura de 03/10: `publicacoesDeEntrega`
 * filtrava por EXCLUSÃO (tirava só `arvore` e `legado`), então qualquer tipo
 * fora da taxonomia — inclusive `contrato` com preço — já contava como
 * "entrega ao cliente", e a única coisa que o segurava era o filtro de
 * conteúdo. Lista permitida fecha isso: tipo desconhecido não vaza.
 */
export const TIPOS_PROJECAO_APP = new Set(
  Object.keys(TIPO_PROJECAO_ROTULO).filter((t) => !TIPOS_FORA_DO_APP.has(t)),
);

export function tipoChegaAoCliente(tipo: string | null | undefined): boolean {
  return TIPOS_PROJECAO_APP.has(String(tipo ?? "").trim().toLowerCase());
}

/**
 * Subconjunto que rende cartão de ENTREGA na jornada. Fora: `arvore` e
 * `legado` (têm aba própria), `plano` (é da Conta) e `uniao_ramos` (é ponte
 * entre as duas linhas, não entrega).
 */
export const TIPOS_ENTREGA_APP = new Set([
  "resumo",
  "marco",
  "atualizacao",
  "achado",
  "evidencia",
  "linha_tempo",
  "relatorio_fase",
  "relatorio_f1",
  "relatorio_f2",
  "microentrega",
]);

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
      /*
        03/10/2026 — aperto, nunca afrouxamento: tipo que o mockup não dá ao
        cliente (contrato, proposta) não atravessa o normalizador. Antes, um
        resumo de contrato sem preço passaria pelo filtro de conteúdo e
        apareceria como entrega — contrariando o mockup aprovado.
      */
      if (TIPOS_FORA_DO_APP.has(tipo)) return null;
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
