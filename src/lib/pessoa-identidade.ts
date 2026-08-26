/**
 * Identidade de pessoa — juntar lead, cliente e casos sem inventar vínculo.
 *
 * A Proprietária repete isto há dois anos, e com razão:
 *
 *   "a Ana Luiza um dia foi lead novo e depois se converte em cliente,
 *    mas Ana Luiza continua sendo Ana Luiza."
 *
 * O sistema hoje tem casos, não tem pessoas. `clientes` é lista; não existe
 * página de alguém. E o elo `leads.case_id`, que ligaria o lead ao caso, está
 * NULO nas sete linhas de lead do banco — a coluna existe, nada a preenche.
 * Então a transição "foi lead, virou cliente" nunca foi gravada.
 *
 * Este módulo não conserta isso escrevendo dado. Ele faz o que é honesto com
 * um vínculo ausente: procura evidência de que dois registros são a mesma
 * pessoa, diz QUAL evidência encontrou e com que confiança, e deixa a decisão
 * para um humano. Nada aqui grava, funde ou arquiva registro.
 *
 * A regra que governa o desenho: fundir duas pessoas diferentes é pior do que
 * deixar duas fichas separadas. Por isso nome nunca basta — homônimo existe, e
 * "Ana Luiza" é dos nomes mais comuns do país.
 */

export type ForcaDoElo =
  /** E-mail idêntico depois de normalizado. Documento ou e-mail é identidade. */
  | "confirmado"
  /** Telefone idêntico. Forte, mas telefone é compartilhado em família. */
  | "provavel"
  /** Só o nome coincide. NUNCA é vínculo — só pista para um humano olhar. */
  | "apenas_indicio";

export type EvidenciaDeElo = {
  forca: ForcaDoElo;
  /** O que casou, em linguagem de gente, para a tela poder mostrar. */
  motivo: string;
};

/**
 * E-mail comparável.
 *
 * O `trim` não é zelo teórico: o e-mail da Ana Luiza está gravado no banco
 * como "analuizabox@gmail.com " — com espaço no fim. Sem normalizar, ela não
 * casa nem consigo mesma.
 */
export function normalizarEmail(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const v = valor.trim().toLowerCase();
  return v.includes("@") ? v : null;
}

/**
 * Telefone comparável: só os dígitos significativos.
 *
 * Compara pelos últimos 8 dígitos porque no Brasil o mesmo número aparece com
 * e sem o nono dígito, com e sem DDI, com e sem zero de operadora. O prefixo
 * varia; o final, não.
 */
export function normalizarTelefone(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length < 8) return null;
  return digitos.slice(-8);
}

/** Nome comparável: sem acento, sem pontuação, espaços colapsados. */
export function normalizarNome(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const v = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return v || null;
}

export type RegistroDePessoa = {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
};

/**
 * Há evidência de que estes dois registros são a mesma pessoa?
 *
 * Devolve null quando não há nenhuma — que é resposta, não falha. Nunca
 * devolve "confirmado" por nome: dois registros com o mesmo nome e nenhum
 * outro dado em comum são, até prova em contrário, duas pessoas.
 */
export function evidenciaDeMesmaPessoa(
  a: RegistroDePessoa,
  b: RegistroDePessoa,
): EvidenciaDeElo | null {
  const emailA = normalizarEmail(a.email);
  const emailB = normalizarEmail(b.email);
  if (emailA && emailB && emailA === emailB) {
    return { forca: "confirmado", motivo: `mesmo e-mail (${emailA})` };
  }

  const telA = normalizarTelefone(a.telefone);
  const telB = normalizarTelefone(b.telefone);
  if (telA && telB && telA === telB) {
    return {
      forca: "provavel",
      motivo: "mesmo telefone — confirme, porque família costuma compartilhar número",
    };
  }

  const nomeA = normalizarNome(a.nome);
  const nomeB = normalizarNome(b.nome);
  if (nomeA && nomeB && nomeA === nomeB) {
    return {
      forca: "apenas_indicio",
      motivo: "só o nome coincide — não é vínculo, é pista para conferir",
    };
  }

  return null;
}

/** O elo é forte o bastante para a tela tratar como a mesma pessoa? */
export function podeTratarComoMesmaPessoa(e: EvidenciaDeElo | null): boolean {
  return e?.forca === "confirmado";
}

export type EventoDePessoa = {
  /** Data do evento, em ISO. */
  quando: string;
  titulo: string;
  /** De qual caso veio, para a linha do tempo não virar sopa. */
  casoCodigo: string | null;
  casoTitulo: string | null;
  fase: string | null;
  status: string | null;
  resumoInterno: string | null;
  responsavel: string | null;
  bloqueio: boolean;
  alerta: string | null;
  /** Origem do registro: qual tabela contou este fato. */
  origem: string;
};

export type LinhaDoTempoDaPessoa = {
  eventos: EventoDePessoa[];
  /** Primeiro e último fato conhecidos, para a tela dizer o período. */
  de: string | null;
  ate: string | null;
  /** Quantos casos diferentes alimentam esta linha. */
  casos: number;
  /** Eventos sem data utilizável — visíveis, nunca descartados em silêncio. */
  semData: number;
};

function soData(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Junta os eventos de todos os casos da pessoa numa linha só.
 *
 * Cada evento continua sabendo de que caso veio. Uma pessoa com dois processos
 * tem uma história, não duas — mas dentro dessa história continua sendo
 * possível saber o que pertence a qual caso.
 */
export function montarLinhaDoTempoDaPessoa(
  entradas: {
    casoCodigo: string | null;
    casoTitulo: string | null;
    eventos: {
      occurred_at?: string | null;
      created_at?: string | null;
      title?: string | null;
      phase?: string | null;
      status?: string | null;
      summary_internal?: string | null;
      responsavel_nome?: string | null;
      bloqueio?: boolean | null;
      alerta?: string | null;
    }[];
  }[],
): LinhaDoTempoDaPessoa {
  const eventos: EventoDePessoa[] = [];
  let semData = 0;

  for (const entrada of entradas) {
    for (const e of entrada.eventos) {
      const quando = soData(e.occurred_at) ?? soData(e.created_at);
      if (!quando) {
        semData += 1;
        continue;
      }
      eventos.push({
        quando,
        titulo: (e.title ?? "").trim() || "Evento sem título",
        casoCodigo: entrada.casoCodigo,
        casoTitulo: entrada.casoTitulo,
        fase: e.phase ?? null,
        status: e.status ?? null,
        resumoInterno: e.summary_internal ?? null,
        responsavel: e.responsavel_nome ?? null,
        bloqueio: e.bloqueio === true,
        alerta: e.alerta ?? null,
        origem: "case_timeline_events",
      });
    }
  }

  eventos.sort((a, b) => a.quando.localeCompare(b.quando));

  return {
    eventos,
    de: eventos[0]?.quando ?? null,
    ate: eventos[eventos.length - 1]?.quando ?? null,
    casos: new Set(entradas.map((e) => e.casoCodigo ?? "")).size,
    semData,
  };
}
