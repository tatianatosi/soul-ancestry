import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/**
 * Toda resposta de server function é autenticável e pode conter dados
 * pessoais: nada pode ficar em cache de navegador, CDN ou proxy, para que
 * troca de usuário, sessão ou organização nunca reexiba registros anteriores.
 */
const noStoreMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  try {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    setResponseHeader("Pragma", "no-cache");
    setResponseHeader("Expires", "0");
    setResponseHeader("Vary", "Authorization, Cookie");
  } catch {
    /* fora de um contexto de requisição */
  }
  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth, noStoreMiddleware],
  requestMiddleware: [errorMiddleware],
}));

