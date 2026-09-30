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

/**
 * O projeto Supabase deste aplicativo, declarado no repositório.
 *
 * 26/08/2026 — a Proprietária passou o dia sem conseguir entrar. A causa,
 * comprovada no HTML servido: as variáveis da Vercel apontavam para OUTRO
 * projeto Supabase, vazio, onde a conta dela não existe. O login falhava com
 * "senha ou e-mail incorretos" — e era verdade: a conta não estava lá.
 *
 * Estes valores são a identidade do aplicativo, não segredo:
 *  - `REF` é o mesmo que `supabase/config.toml` declara, e é o projeto onde as
 *    migrations deste repositório foram aplicadas;
 *  - a chave publicável é pública por desenho — ela viaja no navegador de
 *    qualquer visitante e quem protege o dado é o RLS, não o sigilo dela.
 *
 * Chave secreta e service role NUNCA entram aqui, e há teste para isso.
 */
// 14/09/2026 — reinício controlado: o piloto integral roda no ambiente novo.
// O projeto anterior (`zsxpdbhdvbuulwpepemd`) permanece intocado, como legado
// de consulta: nada foi migrado, apagado ou sobrescrito.
export const PROJETO_DECLARADO = {
  ref: "liiqqibnirnpnvjmjrpj",
  url: "https://liiqqibnirnpnvjmjrpj.supabase.co",
  publishableKey: "sb_publishable_ZJlqScMiYsZHudNvBeA1KQ_B4ozV8kh",
} as const;

/** Ambiente anterior, mantido apenas como referência histórica. */
export const PROJETO_LEGADO = { ref: "zsxpdbhdvbuulwpepemd" } as const;

/**
 * A configuração do projeto declarado, só com o que a tela precisa.
 *
 * `ref` fica de fora de propósito: ele é derivável da URL e não tem por que
 * viajar no HTML.
 */
function declarado(): ConfigPublica {
  return { url: PROJETO_DECLARADO.url, publishableKey: PROJETO_DECLARADO.publishableKey };
}

/** Extrai o ref do projeto a partir da URL. */
export function refDaUrl(url: string): string | null {
  const m = /^https:\/\/([a-z0-9]+)\.supabase\.co/i.exec(url.trim());
  return m ? m[1].toLowerCase() : null;
}

/**
 * A chave do ambiente serve ao projeto declarado?
 *
 * 30/09/2026 — "Invalid API key" no preview do App. `alinhado` só conferia o
 * REF da URL: um `.env` com a URL certa e uma chave de OUTRO projeto (ou
 * antiga) passava, e o Supabase recusava cada requisição. A chave JWT carrega
 * o ref do projeto no payload, então dá para recusar a que não é deste
 * projeto, e a `service_role`/`sb_secret_` nunca pode ir ao navegador.
 * Formato `sb_publishable_` é opaco: aceito, sem como conferir o dono.
 */
export function chaveServeAoProjeto(chave: string | undefined | null, ref: string): boolean {
  const c = (chave ?? "").trim();
  if (!c || c.startsWith("sb_secret_")) return false;
  if (c.startsWith("sb_publishable_")) return true;
  if (!c.startsWith("eyJ")) return false;
  try {
    const meio = c.split(".")[1];
    if (!meio) return false;
    const b64 = meio.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4))) as {
      ref?: string;
      role?: string;
    };
    return payload.role === "anon" && payload.ref === ref;
  } catch {
    return false;
  }
}

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
): ConfigPublica {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const publishableKey = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Sem ambiente, vale o projeto declarado no repositório.
  if (!url || !publishableKey) return declarado();

  /*
    O ambiente só prevalece quando aponta para o MESMO projeto que este
    repositório declara. Apontando para outro, o aplicativo estaria falando com
    um banco onde suas próprias migrations nunca rodaram — e foi exatamente
    isso que aconteceu: a Vercel apontava para um projeto vazio, e o login
    dizia "senha incorreta" para uma conta que existe, só que em outro lugar.

    Preferir o declarado é o comportamento seguro: o repositório sabe a que
    banco ele pertence. Para apontar a outro projeto, muda-se `config.toml` e
    estes valores juntos — deliberadamente, não por variável solta.
  */
  return refDaUrl(url) === PROJETO_DECLARADO.ref &&
    chaveServeAoProjeto(publishableKey, PROJETO_DECLARADO.ref)
    ? { url, publishableKey }
    : declarado();
}

/** O ambiente aponta para um projeto diferente do declarado? */
export function ambienteDivergente(
  env: Record<string, string | undefined> = ambienteDoServidor(),
): string | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  if (!url) return null;
  const ref = refDaUrl(url);
  return ref && ref !== PROJETO_DECLARADO.ref ? ref : null;
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
