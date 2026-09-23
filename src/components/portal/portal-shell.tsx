import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  FileText,
  
  LogOut,
  Route,
  Radar,
  Trees,
  BookOpen,
  UserRound,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand";
import { LinkPortal, useFontePortal, usePreviaPortal } from "@/components/portal/fonte-portal";
import { portalContexto } from "@/lib/portal.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";
import { TIPO_CLIENTE } from "@/lib/marca";
import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";

export function usePortal() {
  const previa = usePreviaPortal();
  const carregar = useServerFn(portalContexto);
  return useQuery({
    queryKey: ["portal-contexto"],
    queryFn: () => carregar({}),
    enabled: previa === null,
  });
}

export function PortalShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rota = useRouterState({ select: (s) => s.location.pathname });
  const { data, isSuccess } = usePortal();
  const previa = usePreviaPortal();
  const fonte = useFontePortal();
  const rotaAtiva = fonte?.rotaInterna ?? rota;

  useEffect(() => {
    // Em prévia (demo e espelho, dentro do Desk) ninguém é cliente autorizado
    // — a redireção expulsaria a Proprietária da própria tela que ela abriu.
    if (previa) return;
    if (isSuccess && data && !data.autorizado) {
      navigate({ to: "/acesso/sem-permissao", replace: true });
    }
  }, [previa, isSuccess, data, navigate]);

  /*
    Sete abas do mockup aprovado: Home, Jornada, Radar, Árvore, Documentos,
    Legado e Conta. Entregas / Fase 01 / Fase 02 saem da barra — as rotas
    continuam existindo como arquivos, só não ocupam a navegação.
  */
  const acessoCompleto = Boolean(previa) || data?.nivel === "client_workspace";

  /*
     16/09/2026 — quando o acesso é só de proposta, a barra mostrava um único
     item "Proposta": uma 8ª aba fora da taxonomia. Agora esse nível não tem
     barra alguma (é uma leitura única), e a barra, quando existe, é sempre
     igual às sete abas aprovadas.
  */
  const nav = acessoCompleto
    ? [
        { to: "/portal", label: COPY_TELAS.home.navegacao, icon: Home },
        { to: "/portal/jornada", label: COPY_TELAS.jornada.navegacao, icon: Route },
        { to: "/portal/radar", label: COPY_TELAS.radar.navegacao, icon: Radar },
        { to: "/portal/arvore", label: COPY_TELAS.arvore.navegacao, icon: Trees },
        { to: "/portal/documentos", label: COPY_TELAS.documentos.navegacao, icon: FileText },
        { to: "/portal/legado", label: COPY_TELAS.legado.navegacao, icon: BookOpen },
        { to: "/portal/conta", label: COPY_TELAS.conta.navegacao, icon: UserRound },
      ]
    : [];

  async function sair() {
    // Em prévia quem está logado é a equipe, no Desk. Encerrar a sessão aqui
    // deslogaria a Proprietária do próprio Desk — o botão apenas fecha a
    // prévia e volta para a superfície interna.
    if (previa) {
      const destino = previa.destinoSair ?? "/acessos-portal";
      void navigate({ to: destino, replace: true });
      return;
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    limparArmazenamentoDaSessao();
    navigate({ to: "/acesso", replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-navy" data-marca-guia="oki" data-app-cliente="true">
      {/*
        Faixa navy única e compacta (correção 2026-09-12: duas faixas altas
        empurravam o conteúdo real para baixo da dobra e destoavam do mockup
        3/17, que usa uma só faixa). Logo + "Bem-vinda/nome" no mesmo bloco.
      */}
      <header className="bg-navy text-cream shadow-sm" data-app-cabecalho>
        <div className="mx-auto max-w-6xl px-4 pb-5 pt-3 lg:px-8 lg:pb-7 lg:pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <BrandLogo size={30} variant="client-dark" showText />

          <button
            onClick={sair}
            aria-label={COPY_GERAL.sair}
            title={COPY_GERAL.sair}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/60 text-gold transition-colors hover:bg-cream/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy lg:flex lg:h-10 lg:w-auto lg:gap-2 lg:rounded-lg lg:px-3 lg:text-cream"
          >
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden text-xs lg:inline">{COPY_GERAL.sair}</span>
          </button>
          </div>

          <div className="mt-5 max-w-2xl">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gold">Aplicativo da família</p>
            <h1 className="mt-1 font-serif text-[1.7rem] font-medium leading-none text-cream sm:text-3xl">{titulo}</h1>
            {descricao ? <p className="mt-1.5 text-xs leading-relaxed text-cream/70 sm:text-sm">{descricao}</p> : null}
          </div>
        </div>

        {/* Filete gold do guia OKI — âncora sob o header navy. */}
        <div className="h-0.5 w-full bg-gold" aria-hidden="true" />
      </header>

      {previa ? (
        // Selo de dado fictício preservado para prova/acessibilidade (não é
        // opcional — ver portal-demo-sophia.ts), mas fora do fluxo visual:
        // a correção de 2026-09-12 tirou a faixa colorida cheia da
        // superfície, que competia com o mockup aprovado (pág. 3/17).
        <p data-previa-portal role="status" className="sr-only">
          {previa.selo}
        </p>
      ) : null}

      {/*
        Correção 2026-09-12 (desktop): a navegação vira sidebar à esquerda em
        telas largas (lg+), não mais abas horizontais no topo — mais espaço
        para o conteúdo real, sem rolagem de abas. Abaixo de lg: barra fixa
        no rodapé (ícone sobre rótulo, todas visíveis, sem rolagem horizontal
        — era isso que cortava "Árvore" na antiga barra de topo).
      */}
      <div
        className={cn(
          "mx-auto grid w-full max-w-6xl min-w-0 lg:gap-6 lg:px-8",
          nav.length > 0 && "lg:grid-cols-[224px_minmax(0,1fr)]",
        )}
      >
        <aside className={cn("hidden lg:py-0", nav.length > 0 && "lg:block")}>
          <nav
            aria-label="Navegação do aplicativo do cliente"
            className="sticky top-0 min-h-[calc(100vh-65px)] border-x border-navy/20 bg-navy px-3 py-6 shadow-sm"
          >
            <div className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <LinkPortal
                key={to}
                to={to}
                className={cn(
                  "flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                  rotaAtiva === to ? "bg-gold font-medium text-navy" : "text-cream/75 hover:bg-cream/10 hover:text-cream",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </LinkPortal>
            ))}
            </div>
          </nav>
        </aside>

        <main id="conteudo-portal" className="min-w-0 px-4 pb-28 pt-5 sm:px-6 lg:px-0 lg:pb-14 lg:pt-7">
          <div>{children}</div>
        </main>
      </div>

      {nav.length > 0 ? (
      <nav
        aria-label="Navegação do aplicativo do cliente"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/60 bg-card/95 shadow-[0_-4px_16px_color-mix(in_srgb,var(--navy)_10%,transparent)] backdrop-blur lg:hidden"
      >
        <div
          className="mx-auto grid max-w-lg px-1 pb-[env(safe-area-inset-bottom)]"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[9px] leading-tight",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to ? "font-semibold text-gold" : "text-navy/55",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
              <span className="w-full text-center">{label}</span>
            </LinkPortal>
          ))}
        </div>
      </nav>
      ) : null}
    </div>
  );
}

export function PortalVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-cream/50 p-10 text-center text-sm text-navy/75">
      {mensagem}
    </div>
  );
}

/** Estado de carregamento padrão do App Cliente. */
export function PortalCarregando() {
  return (
    <p className={TIPO_CLIENTE.corpo} role="status">
      {COPY_GERAL.carregando}
    </p>
  );
}
