import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { reportarFalhaDeTela } from "./lib/producao-erros-navegador";

let escutaGlobalInstalada = false;

export const getRouter = () => {
  // 02/11/2026: ação que falha (salvar, publicar) e leitura que falha deixam de sumir numa mensagem
  // rápida: cada uma é relatada ao banco do app (`audit_logs`, `acao = 'erro_app'`). Só no navegador.
  const noNavegador = typeof window !== "undefined";
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onError: (erro) => {
        if (noNavegador) reportarFalhaDeTela(erro, "acao");
      },
    }),
    queryCache: new QueryCache({
      onError: (erro) => {
        if (noNavegador) reportarFalhaDeTela(erro, "leitura");
      },
    }),
  });

  if (noNavegador && !escutaGlobalInstalada) {
    escutaGlobalInstalada = true;
    window.addEventListener("unhandledrejection", (evento) => {
      reportarFalhaDeTela(evento.reason, "promessa_rejeitada");
    });
  }

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
