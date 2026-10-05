/**
 * CAMADA DE APRESENTAÇÃO DE DADOS VIVOS AO CLIENTE (CA-PORTAL-04).
 *
 * Toda informação viva — cadência, pesquisa, documentos, entregas, fases e
 * legado — atravessa esta camada antes de chegar à tela do cliente.
 *
 * Ela garante os critérios 11 a 15:
 * - 11: rótulos e copy de cliente, sem termo técnico, ID, código, política,
 *   nome de tabela, SKU ou nota interna;
 * - 12: acesso negado, conteúdo indisponível e conteúdo não liberado usam
 *   exatamente a MESMA mensagem neutra, de modo que a tela nunca revela se
 *   o dado existe, de quem é ou por que foi barrado;
 * - 13/14: a apresentação usa apenas os tokens de marca do CA-PORTAL-01
 *   (`TIPO_CLIENTE`), nunca cor, fonte ou logo paralelos.
 *
 * Biblioteca pura: não lê banco, não persiste, não dispara ação externa.
 */

import { limparCopy } from "@/lib/client-copy";
import { contemTermoProibido } from "@/lib/portal-copy";
import { contemCpf } from "@/lib/validacao-pessoa";

/* ------------------------------------------------- remoção de marcas técnicas */

const MARCAS_TECNICAS: RegExp[] = [
  /\bestado de validação\s*:\s*[^.!?\n]*(?:[.!?]|$)/gi, // observação interna anexada ao texto publicado
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, // UUID
  /\b(?:public|auth|storage|realtime)\.[a-z0-9_]+\b/gi, // nome de tabela/schema
  /\b[a-z0-9]+_(?:id|ids|at|by|status|policy|rls|sel|ins|upd|del)\b/gi, // colunas e policies
  /\bpolicy\s+[a-z0-9_]+\b/gi,
  /\bhttps?:\/\/\S+/gi, // endpoint
  /\/(?:api|rest|functions)\/\S+/gi,
  /\bcase[_-]?id\b/gi,
  /\borg(?:anization)?[_-]?id\b/gi,
  /\b[A-Z]{2,}-[A-Z0-9]{2,}(?:-[A-Z0-9]+)*\b/g, // códigos internos e SKUs
  /\b(?:obs\.?|observação)\s+interna\b[^.]*\.?/gi, // nota da equipe
  /\bnota\s+da\s+equipe\b[^.]*\.?/gi,
  /\bstatus\s*[:=]\s*[a-z0-9_]+/gi,
];

/**
 * Converte um valor vivo em texto exibível ao cliente.
 * Devolve "" quando não sobra conteúdo seguro — a tela então usa o estado
 * vazio canônico em vez de exibir sobra técnica.
 */
export function textoParaCliente(valor: unknown): string {
  if (typeof valor !== "string") return "";
  let s = valor;
  for (const re of MARCAS_TECNICAS) s = s.replace(re, " ");
  s = limparCopy(s);
  if (!s) return "";
  if (contemTermoProibido(s)) return "";
  // P5 (26/09/2026) — esta é a camada mais reutilizada de todas (cadência,
  // pesquisa, documentos, entregas, fases e legado atravessam por aqui);
  // era a que tinha o maior raio de exposição e nenhuma proteção contra CPF.
  // Reaproveita o mesmo detector (validacao-pessoa.ts) usado nos demais
  // filtros cliente-facing, em vez de duplicar regex.
  if (contemCpf(s)) return "";
  // Sobra sem palavra (números, pontuação) é resíduo técnico, não conteúdo.
  if (!/[a-zà-ú]{2,}/i.test(s)) return "";
  return s;
}

/** Aplica `textoParaCliente` a uma lista, descartando o que não sobrevive. */
export function listaParaCliente(valores: unknown[]): string[] {
  const out: string[] = [];
  for (const v of valores) {
    const s = textoParaCliente(v);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

/* -------------------------------------------- estados técnicos → linguagem */

/**
 * Tradução de estados técnicos vivos para linguagem de cliente.
 * Chave sempre em minúsculas; qualquer estado desconhecido cai no rótulo
 * neutro, nunca no valor cru do banco.
 */
export const ROTULO_ESTADO_VIVO: Record<string, string> = {
  // documentos e entregas
  pendente: "Em análise pela equipe",
  em_analise: "Em análise pela equipe",
  recebido: "Recebido",
  aprovado: "Confirmado",
  validado: "Confirmado",
  rejeitado: "Precisa de um novo envio",
  reprovado: "Precisa de um novo envio",
  solicitado: "Solicitado para você",
  liberado: "Disponível para você",
  publicado: "Disponível para você",
  // fases e cadência
  nao_prevista: "Fora do seu percurso atual",
  nao_aplicavel: "Fora do seu percurso atual",
  prevista: "Faz parte da sua jornada",
  em_andamento: "Em andamento",
  em_preparacao: "Em preparação pela equipe",
  entregue: "Concluída",
  concluido: "Concluída",
  disponivel: "Disponível para você",
  // legado
  arquivado: "Guardado com a sua família",
};

/** Rótulo neutro para qualquer estado sem tradução aprovada. */
export const ROTULO_ESTADO_NEUTRO = "Em acompanhamento";

/** Estado técnico vivo → rótulo humano. Nunca devolve o valor cru. */
export function rotuloEstadoVivo(estado: unknown): string {
  if (typeof estado !== "string") return ROTULO_ESTADO_NEUTRO;
  const chave = estado.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const traduzido = ROTULO_ESTADO_VIVO[chave];
  if (traduzido) return traduzido;
  // Rótulo já humano e seguro (ex.: vindo de mapa aprovado) passa adiante.
  const limpo = textoParaCliente(estado);
  if (limpo && /[ áéíóúâêôãõçà]/i.test(limpo) && !/_/.test(limpo)) return limpo;
  return ROTULO_ESTADO_NEUTRO;
}

/* ----------------------------------------------------- mensagens neutras */

/**
 * Mensagem única para acesso negado, conteúdo indisponível e conteúdo não
 * liberado. É deliberadamente idêntica nos três casos: a tela não pode
 * deixar deduzir se o dado existe, a quem pertence ou o que o bloqueou.
 */
export const MENSAGEM_NEUTRA =
  "Este conteúdo não está disponível no seu acesso neste momento. A equipe pode orientar você.";

/** Mensagem de falha: nunca expõe ID, tabela, política, endpoint ou regra. */
export const MENSAGEM_FALHA =
  "Não conseguimos carregar esta parte agora. Tente novamente em instantes — se continuar assim, a equipe pode ajudar você.";

export type MotivoIndisponibilidade = "negado" | "indisponivel" | "nao_liberado";

/** Sempre a mesma frase, qualquer que seja o motivo real. */
export function mensagemIndisponivel(_motivo?: MotivoIndisponibilidade): string {
  return MENSAGEM_NEUTRA;
}

/**
 * Converte qualquer erro em mensagem de cliente. O conteúdo original é
 * descartado por completo — inclusive mensagens de banco e de autorização.
 */
export function mensagemDeFalha(_erro?: unknown): string {
  return MENSAGEM_FALHA;
}
