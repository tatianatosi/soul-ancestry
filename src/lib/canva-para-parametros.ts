/**
 * Canva autorizado → parâmetros do contrato (04/10/2026).
 *
 * Proprietária: "o Canva já está autorizado na proposta para o dossiê, execute
 * tudo do dossiê e checklist da Ana, adicione todos os campos necessários, não
 * somente renderizados".
 *
 * Medido antes de executar: as 7 páginas do Canva do caso dela estão em
 * `proposal_canva_pages` com `extracao_status = extraida` e **carregam** o texto
 * de serviços excluídos (p3), despesas externas (p7), escopos individuais (p4) e
 * as cinco etapas da jornada (p5). Mas:
 *
 *  - `escopo-proposta.ts#propostaComPaginasCanva` só **agrega** esse conteúdo em
 *    `escopo_paginas` para conferência de completude — nada escreve nos
 *    parâmetros do contrato;
 *  - `contract_parameter_values.servicos_excluidos` e `despesas_externas` estão
 *    **vazios**, e serviços excluídos é a única pendência impeditiva de conteúdo
 *    do contrato dela;
 *  - `campos_nao_localizados` marca como "não localizado" exatamente campos cujo
 *    texto está dentro de `page_content_structured` da mesma linha.
 *
 * Este módulo é puro: faz o de-para e decide a ação por campo. Quem grava é
 * `contrato-parametros.functions.ts`, com `gravarComVerificacao` e auditoria.
 *
 * Regras: preenche **só campo vazio**; campo já validado nunca é sobrescrito —
 * divergência vira sinal com as duas versões; e nada é inferido de campo que o
 * Canva não traz (prazo de referência e SKU continuam pendentes, porque o Canva
 * realmente não os tem).
 */

/** Origem gravada: a proposta. Status: a confirmar — não nasce validado. */
export const ORIGEM_CANVA = "proposta" as const;
export const STATUS_CANVA = "importado_a_confirmar" as const;

export type PaginaCanva = {
  page_number: number;
  extracao_status: string;
  page_content_structured: unknown;
  campos_nao_localizados?: unknown;
};

export type LinhaDeParaCanva = {
  /** Campo de `contract_parameter_values`. */
  campo: string;
  grupo: "partes" | "membros" | "objeto" | "servicos" | "comerciais" | "assinatura";
  /** Chaves possíveis dentro de `page_content_structured`, em ordem. */
  chaves: string[];
  /** Páginas onde a chave costuma aparecer — só documental, não restringe. */
  paginas: number[];
  rotulo: string;
};

/**
 * De-para medido contra o conteúdo real das 7 páginas. Só entra campo que o
 * Canva de fato traz — nada de destino hipotético.
 */
export const DE_PARA_CANVA_PARAMETRO: LinhaDeParaCanva[] = [
  { campo: "escopo_resumo", grupo: "objeto", chaves: ["escopo_macro", "caso_contexto"], paginas: [1, 2], rotulo: "Resumo do escopo aprovado" },
  { campo: "servicos_incluidos", grupo: "servicos", chaves: ["servicos_incluidos"], paginas: [3], rotulo: "Serviços incluídos" },
  { campo: "servicos_excluidos", grupo: "servicos", chaves: ["servicos_excluidos"], paginas: [3], rotulo: "Serviços excluídos" },
  { campo: "vinculo_familiar", grupo: "membros", chaves: ["composicao_familiar"], paginas: [4], rotulo: "Vínculo familiar" },
  { campo: "fases_entregas", grupo: "servicos", chaves: ["entregas_jornada"], paginas: [5], rotulo: "Fases e entregas" },
  { campo: "valor_total", grupo: "comerciais", chaves: ["valor_total"], paginas: [6], rotulo: "Valor total" },
  { campo: "forma_pagamento", grupo: "comerciais", chaves: ["forma_pagamento"], paginas: [6], rotulo: "Forma de pagamento" },
  { campo: "parcelas", grupo: "comerciais", chaves: ["parcelas"], paginas: [6], rotulo: "Parcelas e recorrência" },
  { campo: "despesas_externas", grupo: "comerciais", chaves: ["despesas_externas"], paginas: [7], rotulo: "Despesas externas" },
];

/**
 * Campos que o Canva **não** traz e que continuam pendentes por isso. Declarado
 * para ninguém tratar a ausência como falha de extração.
 */
export const CAMPOS_FORA_DO_CANVA = [
  { campo: "produto_sku", motivo: "A proposta da Ana não está condicionada a SKU: o deck não traz código de catálogo." },
  { campo: "prazos_referencia", motivo: "O deck não declara janelas de prazo; dependem do plano do caso." },
  { campo: "dependentes", motivo: "Dependente e representação vêm de case_dependents, não do deck." },
  { campo: "data_assinatura", motivo: "Assinatura é ato externo posterior — nunca vem do deck." },
  { campo: "referencia_assinatura", motivo: "Referência externa de assinatura só existe depois do ato." },
] as const;

function texto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return null;
}

export type ValorDoCanva = { campo: string; valor: string; pagina: number; chave: string };

/** Extrai, do conteúdo já estruturado, um valor por campo do de-para. */
export function valoresDoCanva(paginas: readonly PaginaCanva[]): ValorDoCanva[] {
  const extraidas = paginas.filter((p) => p.extracao_status === "extraida");
  const saida: ValorDoCanva[] = [];
  for (const linha of DE_PARA_CANVA_PARAMETRO) {
    for (const p of extraidas) {
      const conteudo = p.page_content_structured;
      if (!conteudo || typeof conteudo !== "object") continue;
      const mapa = conteudo as Record<string, unknown>;
      const chave = linha.chaves.find((c) => texto(mapa[c]));
      if (!chave) continue;
      saida.push({ campo: linha.campo, valor: texto(mapa[chave])!, pagina: p.page_number, chave });
      break;
    }
  }
  return saida;
}

export type AcaoParametro = "preencher" | "divergente" | "ja_igual" | "sem_conteudo_no_canva";

export type ItemPlanoCanva = {
  campo: string;
  rotulo: string;
  grupo: LinhaDeParaCanva["grupo"];
  acao: AcaoParametro;
  valorCanva: string | null;
  valorAtual: string | null;
  pagina: number | null;
  /** Por que esta ação, em texto que a tela mostra. */
  motivo: string;
};

export type ValorParametroAtual = { campo: string; valor: string | null; status: string | null; origem: string | null };

/**
 * Decide, campo por campo, o que fazer. Nunca sobrescreve: `divergente` é
 * sinal para decisão humana, não uma gravação pendente.
 */
export function planoDePreenchimento(
  paginas: readonly PaginaCanva[],
  atuais: readonly ValorParametroAtual[],
): ItemPlanoCanva[] {
  const doCanva = new Map(valoresDoCanva(paginas).map((v) => [v.campo, v]));
  return DE_PARA_CANVA_PARAMETRO.map((linha) => {
    const atual = atuais.find((a) => a.campo === linha.campo) ?? null;
    const valorAtual = atual?.valor && String(atual.valor).trim() ? String(atual.valor).trim() : null;
    const canva = doCanva.get(linha.campo) ?? null;

    if (!canva) {
      return {
        campo: linha.campo,
        rotulo: linha.rotulo,
        grupo: linha.grupo,
        acao: "sem_conteudo_no_canva" as const,
        valorCanva: null,
        valorAtual,
        pagina: null,
        motivo: `Nenhuma página extraída traz ${linha.chaves.join(" ou ")}.`,
      };
    }
    if (!valorAtual) {
      return {
        campo: linha.campo,
        rotulo: linha.rotulo,
        grupo: linha.grupo,
        acao: "preencher" as const,
        valorCanva: canva.valor,
        valorAtual: null,
        pagina: canva.pagina,
        motivo: `Campo vazio e a página ${canva.pagina} do deck traz o conteúdo. Entra como ${STATUS_CANVA}.`,
      };
    }
    if (valorAtual === canva.valor) {
      return {
        campo: linha.campo,
        rotulo: linha.rotulo,
        grupo: linha.grupo,
        acao: "ja_igual" as const,
        valorCanva: canva.valor,
        valorAtual,
        pagina: canva.pagina,
        motivo: "Já gravado com o mesmo texto do deck.",
      };
    }
    return {
      campo: linha.campo,
      rotulo: linha.rotulo,
      grupo: linha.grupo,
      acao: "divergente" as const,
      valorCanva: canva.valor,
      valorAtual,
      pagina: canva.pagina,
      motivo:
        `O valor gravado difere do texto da página ${canva.pagina}. ` +
        (atual?.status === "validado"
          ? "O campo está validado: nada foi sobrescrito, a divergência precisa de decisão humana."
          : "Nada foi sobrescrito: a divergência precisa de decisão humana."),
    };
  });
}

/** Só o que será gravado. Tudo o mais é sinal. */
export function aPreencher(plano: readonly ItemPlanoCanva[]): ItemPlanoCanva[] {
  return plano.filter((i) => i.acao === "preencher");
}

export function divergencias(plano: readonly ItemPlanoCanva[]): ItemPlanoCanva[] {
  return plano.filter((i) => i.acao === "divergente");
}

/**
 * `campos_nao_localizados` recalculado contra o conteúdo real da página — o
 * defeito medido era marcar como "não localizado" um campo cujo texto está na
 * própria linha.
 */
export function camposNaoLocalizadosReais(pagina: PaginaCanva): string[] {
  const marcados = Array.isArray(pagina.campos_nao_localizados)
    ? (pagina.campos_nao_localizados as unknown[]).map((x) => String(x))
    : [];
  const conteudo = pagina.page_content_structured;
  const mapa = conteudo && typeof conteudo === "object" ? (conteudo as Record<string, unknown>) : {};
  return marcados.filter((c) => !texto(mapa[c]));
}

/** Marcados como não localizados que, na verdade, já estão preenchidos. */
export function falsosNaoLocalizados(pagina: PaginaCanva): string[] {
  const marcados = Array.isArray(pagina.campos_nao_localizados)
    ? (pagina.campos_nao_localizados as unknown[]).map((x) => String(x))
    : [];
  const reais = new Set(camposNaoLocalizadosReais(pagina));
  return marcados.filter((c) => !reais.has(c));
}
