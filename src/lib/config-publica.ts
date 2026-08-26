/**
 * Configuração pública do Supabase entregue em tempo de execução.
 *
 * 26/08/2026 — a Proprietária relatou que o login só funciona no ambiente do
 * Lovable. A causa, comprovada no bundle: `client.ts` lê
 * `import.meta.env.VITE_SUPABASE_URL`, que o Vite substitui **em tempo de
 * build**. No container do Lovable existe um `.env` com essas variáveis, então
 * a build local as embute e tudo funciona. Na Vercel não existe `.env` e não
 * existem variáveis `VITE_*` — o navegador fica sem URL e sem chave, e o
 * cliente lança antes de qualquer tentativa de login.
 *
 * O caminho alternativo do código (`process.env.SUPABASE_URL`) só vale no
 * servidor: no navegador `process` não existe.
 *
 * Aqui o servidor passa a entregar a mesma configuração ao navegador em tempo
 * de execução, a partir das variáveis de servidor que já existem na Vercel.
 * Com isso a build deixa de precisar de `VITE_*`.
 *
 * Só entra o que é público por desenho:
 *  - a URL do projeto, que já viaja em toda requisição;
 *  - a chave publicável (anon), cuja proteção é o RLS, não o segredo.
 *
 * Chave secreta e service role NUNCA passam por aqui. Há teste para isso.
 */

export type ConfigPublica = { url: string; publishableKey: string };

/** Onde o navegador encontra a configuração injetada pelo servidor. */
export const CHAVE_GLOBAL = "__CA_CONFIG_PUBLICA__";

/**
 * Ambiente do servidor, ou objeto vazio fora dele.
 *
 * `process` não existe no navegador: usar `process.env` como valor padrão
 * direto lançaria ReferenceError se esta função fosse chamada do lado do
 * cliente por engano. Sem fonte, a resposta é "não sei" — nunca uma exceção.
 */
function ambienteDoServidor(): Record<string, string | undefined> {
  return typeof process !== "undefined" && process.env ? process.env : {};
}

/** Lê a configuração pública do ambiente do servidor. */
export function configPublicaDoServidor(
  env: Record<string, string | undefined> = ambienteDoServidor(),
): ConfigPublica | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/**
 * Script que o servidor injeta no HTML.
 *
 * `JSON.stringify` duas vezes: a primeira produz o JSON, a segunda o
 * transforma em literal de string, para o valor entrar via `JSON.parse` em vez
 * de virar código.
 *
 * Isso sozinho NÃO basta, e o teste provou: `</script>` atravessa as duas
 * passagens intacto e fecharia a tag no HTML, abrindo espaço para injeção. Por
 * isso `<` e `>` viram escapes unicode — inertes dentro da string JS e
 * idênticos depois do `JSON.parse`. `&` acompanha para o valor não mudar sob
 * parsing de entidades.
 */
function escaparParaScript(literal: string): string {
  return literal.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function scriptDeConfigPublica(config: ConfigPublica | null): string {
  if (!config) return "";
  const payload = escaparParaScript(JSON.stringify(JSON.stringify(config)));
  return `window[${JSON.stringify(CHAVE_GLOBAL)}]=JSON.parse(${payload});`;
}

/** Lê a configuração no navegador. Devolve null quando não foi injetada. */
export function configPublicaDoNavegador(): ConfigPublica | null {
  if (typeof window === "undefined") return null;
  const bruto = (window as unknown as Record<string, unknown>)[CHAVE_GLOBAL];
  if (!bruto || typeof bruto !== "object") return null;
  const c = bruto as Partial<ConfigPublica>;
  return c.url && c.publishableKey ? { url: c.url, publishableKey: c.publishableKey } : null;
}
