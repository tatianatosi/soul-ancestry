import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Rota de saúde pública (#176, item 8 do laudo de prontidão, 27/10/2026):
 * "main pode divergir da produção sem alarme — nenhuma rota de saúde
 * expondo o SHA publicado". Esta rota expõe o commit publicado quando o
 * ambiente de deploy injeta alguma das variáveis comuns de CI/CD.
 *
 * Limite conhecido, documentado em vez de fingido: não há confirmação de
 * que o deploy do Lovable injeta qualquer uma destas variáveis hoje — se
 * nenhuma existir, `sha` responde `null` e `shaConhecida: false`
 * honestamente, em vez de inventar um valor. Se o ambiente de deploy
 * expuser outra variável, basta somar seu nome à lista abaixo.
 */
const VARIAVEIS_SHA = [
  "VERCEL_GIT_COMMIT_SHA",
  "GITHUB_SHA",
  "COMMIT_SHA",
  "SOURCE_VERSION",
  "RENDER_GIT_COMMIT",
] as const;

declare const __BUILD_SHA__: string | null | undefined;

const shaDoBuild = typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : null;

/**
 * Sonda do banco (02/11/2026). "Nada salva em nenhuma tela" pode ser o servidor publicado falando com o
 * projeto errado ou com uma credencial que não serve; até hoje `ok: true` não dizia isso. A resposta não
 * traz nenhum segredo: só o veredito e o formato das chaves. Fica guardada por 60 s, para a rota pública
 * não gastar a credencial do servidor a cada acesso.
 */
type SondaBanco = {
  projetoConfere: boolean;
  credencialServe: "sim" | "nao" | "provavel" | "ausente";
  leituraDoServidor: "ok" | "falhou" | "sem_credencial" | "tempo_esgotado";
};
let cacheBanco: { em: number; valor: SondaBanco } | null = null;

async function sondarBanco(): Promise<SondaBanco> {
  if (cacheBanco && Date.now() - cacheBanco.em < 60_000) return cacheBanco.valor;
  const cfg = await import("@/lib/config-servidor");
  const base = cfg.diagnosticoDoServidor();
  const credencial = cfg.chaveSecretaDoServidor();
  let leitura: SondaBanco["leituraDoServidor"] = "sem_credencial";
  if (credencial) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const servidor = createClient(cfg.urlDoServidor(), credencial, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { apikey: credencial } },
      });
      const resposta = await Promise.race([
        servidor.from("organizations").select("id", { count: "exact", head: true }),
        new Promise<"tempo">((resolver) => setTimeout(() => resolver("tempo"), 4000)),
      ]);
      leitura = resposta === "tempo" ? "tempo_esgotado" : resposta.error ? "falhou" : "ok";
    } catch {
      leitura = "falhou";
    }
  }
  const valor: SondaBanco = {
    projetoConfere: base.ambienteConcorda && base.refEmUso === base.refDeclarado,
    credencialServe: base.segredoPodeServir,
    leituraDoServidor: leitura,
  };
  cacheBanco = { em: Date.now(), valor };
  return valor;
}

export const Route = createFileRoute("/api/saude")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const banco = await sondarBanco().catch((): SondaBanco => ({
          projetoConfere: false,
          credencialServe: "ausente",
          leituraDoServidor: "falhou",
        }));
        const sha =
          VARIAVEIS_SHA.map((v) => process.env[v]).find((v) => Boolean(v)) ?? shaDoBuild ?? null;
        return new Response(
          JSON.stringify({
            ok: true,
            sha,
            shaConhecida: sha !== null,
            banco,
            bancoOk:
              banco.projetoConfere &&
              banco.leituraDoServidor === "ok" &&
              banco.credencialServe !== "nao",
            agora: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
