import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { capturarErroProducao } from "@/lib/producao-erros.server";

/**
 * Rota pública para o navegador relatar um erro de produção (#176, item do
 * coletor de erro em produção). Pública e sem sessão de propósito: um erro
 * pode acontecer antes do login carregar, e exigir sessão faria o próprio
 * relato de erro falhar silenciosamente.
 *
 * O corpo é texto já extraído de um `Error` no navegador (mensagem, pilha,
 * rota, mecanismo) — nunca um objeto arbitrário repassado sem checagem, nem
 * dados do usuário (nome, e-mail, caso) que o cliente não precisa enviar
 * para que o erro seja útil.
 */
const TAMANHO_MAXIMO_CORPO = 32_000;

export const Route = createFileRoute("/api/erro")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const bruto = await request.text();
          if (bruto.length > TAMANHO_MAXIMO_CORPO) {
            return new Response(null, { status: 413 });
          }
          const corpo = JSON.parse(bruto) as {
            mensagem?: unknown;
            pilha?: unknown;
            rota?: unknown;
            mecanismo?: unknown;
          };
          const mensagem = typeof corpo.mensagem === "string" ? corpo.mensagem : "Erro no cliente";
          const erro = new Error(mensagem);
          if (typeof corpo.pilha === "string") erro.stack = corpo.pilha;
          capturarErroProducao(erro, {
            origem: "navegador",
            rota: typeof corpo.rota === "string" ? corpo.rota : undefined,
            mecanismo: typeof corpo.mecanismo === "string" ? corpo.mecanismo : "manual",
          });
        } catch {
          /* corpo malformado: nada a relatar, nunca falha visivelmente ao cliente */
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
