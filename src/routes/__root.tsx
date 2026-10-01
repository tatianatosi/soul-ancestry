import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Toaster } from "../components/ui/sonner";
import appCss from "../styles.css?url";

import { destinoLinkAuth } from "../lib/link-auth";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { configPublicaDoServidor, scriptDeConfigPublica } from "@/lib/config-publica";
import { supabase } from "../integrations/supabase/client";
import { ehTransicaoDeIdentidade } from "../lib/guarda-sessao";

/**
 * Reencaminha links oficiais de convite/definição de senha que aterrissam na
 * home (fallback do provedor) para a rota pública correta, sem tocar no token.
 *
 * 16/09/2026 — não interferir dentro do App do cliente nem do Desk: ali a
 * sessão já está sendo montada e um redirecionamento global no meio do
 * caminho descartava o material do link.
 */
const AREAS_COM_SESSAO = ["/portal", "/painel", "/acesso/confirmar"];

function CapturaLinkAuth() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    if (AREAS_COM_SESSAO.some((p) => pathname.startsWith(p))) return;
    const destino = destinoLinkAuth(pathname, search, hash);
    if (destino) window.location.replace(destino);
  }, []);
  return null;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido. Nenhum dado interno é exibido aqui.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error: erroBruto, reset }: { error: unknown; reset: () => void }) {
  const error = erroBruto instanceof Error ? erroBruto : new Error(String(erroBruto));
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Clube Ancestral — Genealogia & Cidadania Europeia" },
      {
        name: "description",
        content:
          "Consultoria em genealogia e cidadania europeia. Reconecte-se à sua história familiar.",
      },
      { name: "author", content: "Clube Ancestral" },
      { property: "og:title", content: "Clube Ancestral" },
      { property: "og:description", content: "Consultoria em genealogia e cidadania europeia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // 26/08/2026 — `twitter:site` declarava "@Lovable" em TODA página, ou
      // seja, a landing pública atribuía a publicação à ferramenta de origem.
      // Removido em vez de substituído: o perfil oficial da Clube Ancestral no
      // X não está definido, e inventar um handle erra de outro jeito.
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Mesmo arquivo do logo de marca (src/lib/brand-asset.ts): um único
      // SVG serve de ícone de aba e de logo, sem cópia duplicada.
      { rel: "icon", href: "/clube-ancestral-logo.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Great+Vibes&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  /*
    A configuração pública do Supabase é injetada aqui, no servidor, para que o
    navegador não dependa de `VITE_*` em tempo de build. Sem isto, uma build
    feita sem essas variáveis — como a da Vercel — entrega um cliente que lança
    antes de qualquer tentativa de login.

    Só entram URL e chave publicável. Chave secreta e service role não passam
    por este caminho, e há teste que verifica isso.
  */
  const config = scriptDeConfigPublica(configPublicaDoServidor());

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {config ? <script dangerouslySetInnerHTML={{ __html: config }} /> : null}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento) => {
      if (!ehTransicaoDeIdentidade(evento)) return;
      if (evento === "SIGNED_OUT") {
        void queryClient.cancelQueries().then(() => queryClient.clear());
      } else {
        void queryClient.invalidateQueries();
      }
      void router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <CapturaLinkAuth />
      <Outlet />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
