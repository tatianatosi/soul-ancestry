/**
 * Apelidos aprovados de pessoa (Corte A / D2, 07/10/2026).
 *
 * Problema real: o deck do Canva (páginas 2 e 6) escreveu "Adair Gomes
 * Silveira"; o cadastro canônico (`clientes`/`contract_parties`) e a condição
 * comercial v2 dizem "Adair Pinto Silveira Júnior". Como o comparador de
 * partes só sabia comparar string, o nome do deck virava **divergência
 * pendente** em toda prévia — uma pendência que nunca fecharia, porque não há
 * nada a corrigir: é a mesma pessoa, e o documento de identidade prevalece
 * sobre o texto do deck.
 *
 * O que este módulo NÃO é: fusão por semelhança. Continua proibido casar
 * pessoa por nome parecido, por endereço, profissão ou filiação. Aqui só
 * entra par de nomes que a Proprietária autenticada declarou ser a mesma
 * pessoa, com data, decisão e base documental — um registro explícito, item
 * por item. Nome fora deste registro continua divergência declarada.
 *
 * O nome canônico é o único que sai para contrato, PDF e App; o apelido só
 * serve para o comparador reconhecer a origem e parar de pedir correção.
 */

export type ApelidoAprovado = {
  /** Nome do cadastro — o único que aparece em qualquer saída. */
  canonico: string;
  /** Nome como a fonte de origem escreveu (deck, planilha, proposta). */
  apelido: string;
  /** Onde o apelido aparece, para quem auditar saber de onde veio. */
  origem: string;
  base: string;
  decisao: string;
  decididoPor: string;
  decididoEm: string;
};

export const APELIDOS_APROVADOS: readonly ApelidoAprovado[] = [
  {
    canonico: "Adair Pinto Silveira Júnior",
    apelido: "Adair Gomes Silveira",
    origem: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1, páginas 2 e 6",
    base: "CNH-e conferida pela Proprietária autenticada; dados civis ficam na Pessoa 360, não neste módulo.",
    decisao: "D2 — mesma pessoa; o documento de identidade prevalece sobre o texto do deck.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-07",
  },
];

function normalizar(nome: unknown): string {
  return String(nome ?? "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

/** Apelido aprovado registrado para este nome, quando existe. */
export function apelidoAprovadoDe(nome: string): ApelidoAprovado | null {
  const n = normalizar(nome);
  if (!n) return null;
  return (
    APELIDOS_APROVADOS.find((a) => normalizar(a.canonico) === n || normalizar(a.apelido) === n) ?? null
  );
}

/** O nome do cadastro para um nome qualquer; devolve o próprio se não houver apelido registrado. */
export function nomeCanonicoAprovado(nome: string): string {
  const a = apelidoAprovadoDe(nome);
  return a ? a.canonico : String(nome ?? "").trim();
}

/**
 * Mesma pessoa: nomes iguais, ou par declarado em `APELIDOS_APROVADOS`.
 * Nunca por semelhança — dois nomes parecidos sem registro seguem diferentes.
 */
export function nomeDaMesmaPessoa(a: string, b: string): boolean {
  const x = normalizar(a);
  const y = normalizar(b);
  if (!x || !y) return false;
  if (x === y) return true;
  return APELIDOS_APROVADOS.some(
    (ap) =>
      (normalizar(ap.canonico) === x && normalizar(ap.apelido) === y) ||
      (normalizar(ap.canonico) === y && normalizar(ap.apelido) === x),
  );
}
