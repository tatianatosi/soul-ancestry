/**
 * Cálculos do Portal / Configuração Master — funções puras, sem banco.
 *
 * Só conta o que já está gravado: projeções do caso, acessos do titular e
 * e-mails autorizados. Conteúdo despublicado continua no histórico e nunca
 * entra como publicado. Aba sem conteúdo mostra zero declarado, não some.
 */

export type Fatia = { rotulo: string; valor: number };

export type ProjecaoPortal = {
  id: string;
  estado: string;
  tipo?: string | null;
  origem?: string | null;
  despublicadaEm?: string | null;
};

export type AcessoPortal = {
  id: string;
  situacao: string;
  convidadoEm?: string | null;
  ultimoAcesso?: string | null;
  revogadoEm?: string | null;
};

export type EmailAutorizado = { id: string; status: string | null };

const ESTADOS: Array<[RegExp, string]> = [
  [/^draft$|rascunho/i, "Rascunho"],
  [/in_review|revis/i, "Em revisão"],
  [/^approved$|aprovad/i, "Aprovada"],
  [/^published$|publicad/i, "Publicada"],
];

/** Situação humana da projeção; desconhecido não é escondido. */
export function estadoDaPublicacao(estado: string) {
  return ESTADOS.find(([re]) => re.test(estado ?? ""))?.[1] ?? "Sem situação";
}

/**
 * Publicação por estado, sempre com os quatro degraus do contrato visual.
 * Projeção despublicada sai da contagem — ela aparece no histórico à parte.
 */
export function publicacaoPorEstado(projecoes: readonly ProjecaoPortal[]): Fatia[] {
  const vivas = projecoes.filter((p) => !p.despublicadaEm);
  return ["Rascunho", "Em revisão", "Aprovada", "Publicada"].map((rotulo) => ({
    rotulo,
    valor: vivas.filter((p) => estadoDaPublicacao(p.estado) === rotulo).length,
  }));
}

export type ResumoAcesso = {
  convitesAutorizados: number;
  ativos: number;
  revogados: number;
  ultimoAcesso: string | null;
  total: number;
};

/** Convites autorizados, acesso ativo, revogado e último acesso registrado. */
export function acessoAoPortal(
  acessos: readonly AcessoPortal[],
  emails: readonly EmailAutorizado[],
): ResumoAcesso {
  const ultimos = acessos
    .map((a) => a.ultimoAcesso)
    .filter((v): v is string => Boolean(v))
    .sort();
  return {
    convitesAutorizados:
      emails.filter((e) => /aprovad|autoriz|valid/i.test(e.status ?? "")).length +
      acessos.filter((a) => Boolean(a.convidadoEm)).length,
    ativos: acessos.filter((a) => /active|ativo/i.test(a.situacao) && !a.revogadoEm).length,
    revogados: acessos.filter((a) => Boolean(a.revogadoEm) || /revok|revogad/i.test(a.situacao)).length,
    ultimoAcesso: ultimos.length ? ultimos[ultimos.length - 1]! : null,
    total: acessos.length,
  };
}

/** As cinco abas do App que recebem conteúdo publicado do Desk. */
export const ABAS_APP = ["Jornada", "Radar", "Árvore", "Documentos", "Legado"] as const;

function abaDaProjecao(p: ProjecaoPortal): (typeof ABAS_APP)[number] | null {
  const chave = `${p.origem ?? ""} ${p.tipo ?? ""}`.toLowerCase();
  if (/lineage|linhagem|arvore|árvore|relationship/.test(chave)) return "Árvore";
  if (/evidence|evidencia|document/.test(chave)) return "Documentos";
  if (/finding|achado|legado|memoria|memória/.test(chave)) return "Legado";
  if (/milestone|event|caso|case|jornada|resumo/.test(chave)) return "Jornada";
  return null;
}

/**
 * Cobertura do App: conteúdo publicado por aba. Radar não tem projeção
 * própria hoje, então fica em zero — sem gráfico de substituição.
 */
export function coberturaDoApp(projecoes: readonly ProjecaoPortal[]): Fatia[] {
  const publicadas = projecoes.filter(
    (p) => !p.despublicadaEm && estadoDaPublicacao(p.estado) === "Publicada",
  );
  return ABAS_APP.map((aba) => ({
    rotulo: aba,
    valor: publicadas.filter((p) => abaDaProjecao(p) === aba).length,
  }));
}
