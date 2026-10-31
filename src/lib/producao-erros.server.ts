/**
 * Coletor de erro em produção (#176, prontidão pré-lançamento).
 *
 * Antes deste arquivo, o único caminho de erro em produção era
 * `console.error` (ver `src/start.ts`, `src/server.ts`) e, no navegador,
 * `window.__lovableEvents` (`src/lib/lovable-error-reporting.ts`) — que só
 * existe dentro do ambiente do Lovable e nunca em produção real para um
 * visitante. Sem isso, um erro em produção não chegava a lugar nenhum que
 * alguém olhasse.
 *
 * Implementação deliberadamente sem o SDK oficial do Sentry: este app roda
 * tanto em Node (dev/preview) quanto em runtime de Workers (build do nitro
 * para Cloudflare, ver `wrangler.json` gerado), e o SDK `@sentry/node` usa
 * APIs específicas de Node que não existem em Workers. Um envelope HTTP
 * manual (documentado pelo próprio Sentry) funciona nos dois sem depender de
 * qual SDK combina com qual runtime.
 *
 * Nunca lança: a ausência de `SENTRY_DSN` (não configurado ainda) ou uma
 * falha de rede ao enviar o relato nunca pode virar um segundo erro.
 */

type ContextoErro = Record<string, unknown>;

type DsnPartes = { host: string; chavePublica: string; projetoId: string };

function lerDsn(): DsnPartes | null {
  const dsn = typeof process !== "undefined" ? process.env.SENTRY_DSN : undefined;
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const chavePublica = url.username;
    const projetoId = url.pathname.replace(/^\//, "");
    if (!chavePublica || !projetoId) return null;
    return { host: url.host, chavePublica, projetoId };
  } catch {
    return null;
  }
}

/** Sentry aceita um id hex de 32 caracteres, sem hifens. */
function gerarEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

const TAMANHO_MAXIMO_TEXTO = 8_000;

function truncar(texto: string): string {
  return texto.length > TAMANHO_MAXIMO_TEXTO ? `${texto.slice(0, TAMANHO_MAXIMO_TEXTO)}…` : texto;
}

/**
 * Monta o envelope NDJSON que a API de ingestão do Sentry espera: uma linha
 * de cabeçalho do envelope, uma de cabeçalho do item e uma com o evento.
 *
 * Sem parser de stacktrace em frames: a pilha completa viaja como texto na
 * mensagem. Dá pior agrupamento automático no Sentry do que o SDK oficial
 * faria, mas nenhuma informação se perde — quem olhar o evento vê a pilha
 * inteira.
 */
function montarEnvelope(error: Error, contexto: ContextoErro): string {
  const eventId = gerarEventId();
  const timestamp = new Date().toISOString();
  const mensagemFormatada = truncar(
    [`${error.name || "Error"}: ${error.message}`, error.stack ?? ""].filter(Boolean).join("\n"),
  );
  const evento = {
    event_id: eventId,
    timestamp,
    platform: "javascript",
    level: (contexto.severity as string) ?? "error",
    environment: (contexto.ambiente as string) ?? process.env.NODE_ENV ?? "production",
    message: { formatted: mensagemFormatada },
    extra: { ...contexto, nome: error.name, mensagem: truncar(error.message) },
  };
  const cabecalhoEnvelope = JSON.stringify({ event_id: eventId, sent_at: timestamp });
  const cabecalhoItem = JSON.stringify({ type: "event" });
  return `${cabecalhoEnvelope}\n${cabecalhoItem}\n${JSON.stringify(evento)}`;
}

/**
 * Envia um erro de produção ao Sentry. Nunca lança e nunca bloqueia quem
 * chamou — dispara o POST e segue, com DSN ausente virando no-op silencioso
 * (ainda não configurado é um estado válido, não uma falha).
 */
export function capturarErroProducao(error: unknown, contexto: ContextoErro = {}): void {
  const partes = lerDsn();
  if (!partes) return;
  const erroReal = error instanceof Error ? error : new Error(String(error));
  try {
    const envelope = montarEnvelope(erroReal, contexto);
    const url = `https://${partes.host}/api/${partes.projetoId}/envelope/?sentry_key=${partes.chavePublica}&sentry_version=7`;
    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/x-sentry-envelope" },
      body: envelope,
    }).catch(() => {
      /* falha de rede ao reportar não pode virar um segundo erro */
    });
  } catch {
    /* DSN malformado ou outra falha de montagem: idem, nunca lança */
  }
}
