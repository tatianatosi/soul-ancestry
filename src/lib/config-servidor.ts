/**
 * Resolução da configuração do Supabase **no servidor**.
 *
 * 26/08/2026, segunda rodada. O `config-publica.ts` já fazia o repositório
 * decidir a que banco ele pertence — mas só na configuração injetada no HTML,
 * isto é, só para o NAVEGADOR. O servidor continuou lendo
 * `process.env.SUPABASE_URL` cru, em `auth-middleware.ts` e em
 * `client.server.ts`.
 *
 * O resultado foi um sistema falando com dois bancos ao mesmo tempo:
 *
 *   navegador  →  projeto declarado (correto): o signIn funciona;
 *   servidor   →  projeto do ambiente (vazio): o token recém-emitido não
 *                 pertence a esse projeto, e a validação recusa.
 *
 * Na tela isso apareceu como a mensagem neutra do `catch` do login — nem
 * "senha incorreta", nem sucesso. A senha estava certa o tempo todo.
 *
 * Aqui a mesma regra passa a valer dos dois lados: o ambiente só prevalece
 * quando aponta para o MESMO projeto que o repositório declara.
 *
 * Um limite honesto: isto NÃO conserta a chave secreta. URL e chave publicável
 * são públicas e o repositório pode declará-las; a chave secreta não pode e
 * nunca entra aqui. Se o ambiente tiver o segredo de OUTRO projeto, ele não
 * serve para o projeto declarado — e nenhum código pode inventar o certo.
 * O que este módulo faz nesse caso é tornar a falha legível, em vez de
 * silenciosa: veja `diagnosticoDoServidor()`.
 */
import { PROJETO_DECLARADO, chaveServeAoProjeto, refDaUrl } from "./config-publica";

function ambiente(): Record<string, string | undefined> {
  return typeof process !== "undefined" && process.env ? process.env : {};
}

/** A URL do ambiente, qualquer que seja o projeto a que ela pertença. */
function urlBruta(env = ambiente()): string | undefined {
  return env["SUPABASE_URL"] || env["VITE_SUPABASE_URL"];
}

/**
 * A URL que o servidor deve usar.
 *
 * O ambiente só vale se apontar para o projeto declarado; caso contrário vale
 * o declarado. Nunca devolve indefinido: o repositório sempre sabe responder.
 */
export function urlDoServidor(env = ambiente()): string {
  const url = urlBruta(env);
  if (!url) return PROJETO_DECLARADO.url;
  return refDaUrl(url) === PROJETO_DECLARADO.ref ? url : PROJETO_DECLARADO.url;
}

/**
 * A chave publicável (anon) que o servidor deve usar.
 *
 * Só aproveita a chave do ambiente quando a URL do ambiente é a do projeto
 * declarado. Chave de um projeto com URL de outro não autentica nada — e
 * misturar as duas foi justamente o que produziu o erro mudo.
 */
export function chavePublicavelDoServidor(env = ambiente()): string {
  const url = urlBruta(env);
  const chave = env["SUPABASE_PUBLISHABLE_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !chave) return PROJETO_DECLARADO.publishableKey;
  return refDaUrl(url) === PROJETO_DECLARADO.ref && chaveServeAoProjeto(chave, PROJETO_DECLARADO.ref)
    ? chave
    : PROJETO_DECLARADO.publishableKey;
}

/**
 * A chave secreta (service role), lida só do ambiente.
 *
 * Não há valor declarado e não pode haver: segredo não mora em repositório.
 * Devolve `undefined` quando não existe, para quem chama decidir o que dizer.
 */
export function chaveSecretaDoServidor(env = ambiente()): string | undefined {
  return env["SUPABASE_SERVICE_ROLE_KEY"] || env["SUPABASE_SECRET_KEY"] || undefined;
}

/** Formato da chave, sem revelar a chave. */
export function formatoDaChave(chave: string | undefined): string {
  if (!chave) return "ausente";
  if (chave.startsWith("sb_secret_")) return "sb_secret_";
  if (chave.startsWith("sb_publishable_")) return "sb_publishable_";
  if (chave.startsWith("eyJ")) return "jwt";
  return "desconhecido";
}

export type DiagnosticoServidor = {
  /** Projeto que o repositório declara. Público: viaja em toda requisição. */
  refDeclarado: string;
  /** Projeto que o ambiente aponta, ou null se não houver variável. */
  refDoAmbiente: string | null;
  /** O ambiente concorda com o repositório? */
  ambienteConcorda: boolean;
  /** Projeto efetivamente usado pelo servidor depois da regra. */
  refEmUso: string | null;
  /** Formato da chave publicável em uso — nunca o valor. */
  formatoChavePublicavel: string;
  /** Formato da chave secreta do ambiente — nunca o valor. */
  formatoChaveSecreta: string;
  /**
   * A chave secreta pode servir ao projeto em uso?
   *
   * Só é possível responder "não" com certeza: quando o ambiente aponta para
   * outro projeto, o segredo dele é desse outro projeto. Quando o ambiente
   * concorda, a resposta honesta é "provável" — só uma chamada real confirma.
   */
  segredoPodeServir: "sim" | "nao" | "provavel" | "ausente";
};

/**
 * Retrato do que o servidor tem em mãos, sem expor nenhum segredo.
 *
 * Só refs (que são públicos, aparecem na URL de toda requisição), booleanos e
 * prefixos de formato. Nenhum valor de chave, em nenhum campo.
 */
export function diagnosticoDoServidor(env = ambiente()): DiagnosticoServidor {
  const url = urlBruta(env);
  const refDoAmbiente = url ? refDaUrl(url) : null;
  const ambienteConcorda = refDoAmbiente === PROJETO_DECLARADO.ref;
  const secreta = chaveSecretaDoServidor(env);

  let segredoPodeServir: DiagnosticoServidor["segredoPodeServir"];
  if (!secreta) segredoPodeServir = "ausente";
  else if (!refDoAmbiente) segredoPodeServir = "provavel";
  else segredoPodeServir = ambienteConcorda ? "provavel" : "nao";

  return {
    refDeclarado: PROJETO_DECLARADO.ref,
    refDoAmbiente,
    ambienteConcorda,
    refEmUso: refDaUrl(urlDoServidor(env)),
    formatoChavePublicavel: formatoDaChave(chavePublicavelDoServidor(env)),
    formatoChaveSecreta: formatoDaChave(secreta),
    segredoPodeServir,
  };
}
