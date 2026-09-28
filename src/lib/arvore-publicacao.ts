/**
 * Corte 2a (28/09/2026) — nomes da família na aba Árvore do App Cliente
 * (premissa confirmada pela Proprietária: nomes de vivos e falecidos).
 *
 * Regras (valem no servidor e na tela):
 *   - só publica perfil com `client_visibility = 'aprovada'`;
 *   - pessoa `highly_restricted` nunca é publicada;
 *   - menor de idade aparece só pelo primeiro nome;
 *   - geração de 1 (cliente) a 5 (ancestrais), escrita pela equipe;
 *   - contagem no App = pessoas distintas (`pessoa_id`), nunca publicações.
 */
// O App lê `pessoasDaArvore`: nada de módulo de contrato neste arquivo.
import { contemConteudoInterno } from "@/lib/onboarding-jornada";

export const GERACOES_PUBLICAVEIS = [1, 2, 3, 4, 5] as const;
export const SEPARADOR_ARVORE = " · ";

const t = (v: unknown) => (v == null ? "" : String(v).trim());

function idade(nascimento: string | null | undefined, hoje: Date): number | null {
  const d = t(nascimento);
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return null;
  const [a, m, dia] = d.slice(0, 10).split("-").map(Number);
  let anos = hoje.getUTCFullYear() - a!;
  if (hoje.getUTCMonth() + 1 < m! || (hoje.getUTCMonth() + 1 === m && hoje.getUTCDate() < dia!)) anos -= 1;
  return anos;
}

export function ehMenor(p: { is_minor?: boolean | null; nascimento?: string | null }, hoje = new Date()): boolean {
  if (p.is_minor === true) return true;
  const anos = idade(p.nascimento, hoje);
  return anos !== null && anos < 18;
}

/** Menor aparece só pelo primeiro nome. */
export function nomeParaArvore(nome: string, menor: boolean): string {
  const limpo = t(nome).replace(/\s+/g, " ");
  return menor ? (limpo.split(" ")[0] ?? "") : limpo;
}

export function conteudoArvore(nome: string, vinculo?: string | null): string {
  return [t(nome), t(vinculo)].filter(Boolean).join(SEPARADOR_ARVORE);
}

export function validarPublicacaoArvore(entrada: {
  clientVisibility: string | null | undefined;
  sensitivityLevel: string | null | undefined;
  geracao: number;
  nome: string;
  vinculo?: string | null;
}): string[] {
  const erros: string[] = [];
  if (entrada.clientVisibility !== "aprovada")
    erros.push("Só perfil com visibilidade ao cliente “aprovada” pode ir para a árvore do App.");
  if (entrada.sensitivityLevel === "highly_restricted")
    erros.push("Pessoa com sensibilidade “altamente restrita” nunca é publicada no App.");
  if (!(GERACOES_PUBLICAVEIS as readonly number[]).includes(entrada.geracao))
    erros.push("Escolha a geração (1 = cliente … 5 = ancestrais).");
  if (t(entrada.nome).length < 2) erros.push("Informe o nome como deve aparecer para o cliente.");
  const conteudo = conteudoArvore(entrada.nome, entrada.vinculo);
  if (conteudo && contemConteudoInterno(conteudo))
    erros.push("O texto parece conter dado interno (código, preço, nota) — ajuste antes de publicar.");
  return erros;
}

/* ------------------------------------------------------------- App (leitura) */

export type ProjecaoArvore = {
  id: string;
  projection_type?: string | null;
  content_sanitized?: string | null;
  pessoa_id?: string | null;
  geracao_cliente?: number | null;
  effective_from?: string | null;
  updated_at?: string | null;
};

export type PessoaNaArvore = { chave: string; nome: string; vinculo: string | null; geracao: number | null };

/**
 * Pessoas nomeadas publicadas, uma por `pessoa_id` (a mais recente), por
 * geração. Projeção de árvore sem pessoa continua nota, não nó.
 */
export function pessoasDaArvore(projecoes: readonly ProjecaoArvore[]): PessoaNaArvore[] {
  const porPessoa = new Map<string, ProjecaoArvore>();
  const data = (p: ProjecaoArvore) => t(p.effective_from ?? p.updated_at);
  for (const p of projecoes) {
    if (t(p.projection_type).toLowerCase() !== "arvore" || !p.pessoa_id) continue;
    const conteudo = t(p.content_sanitized);
    if (!conteudo || contemConteudoInterno(conteudo)) continue;
    const atual = porPessoa.get(p.pessoa_id);
    if (!atual || data(p) > data(atual)) porPessoa.set(p.pessoa_id, p);
  }
  return [...porPessoa.entries()].map(([chave, p]) => {
    const [nome, ...resto] = t(p.content_sanitized).split(SEPARADOR_ARVORE);
    const g = Number(p.geracao_cliente);
    return {
      chave,
      nome: t(nome),
      vinculo: resto.length ? resto.join(SEPARADOR_ARVORE) : null,
      geracao: Number.isInteger(g) && g >= 1 && g <= 5 ? g : null,
    };
  });
}
