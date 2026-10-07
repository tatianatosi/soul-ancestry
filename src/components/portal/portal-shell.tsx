import "./portal-v11.css";

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  FileText,
  Route,
  Radar,
  Trees,
  BookOpen,
  UserRound,
} from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { LinkPortal, useFontePortal, usePreviaPortal } from "@/components/portal/fonte-portal";
import { portalContexto } from "@/lib/portal.functions";
import { cn } from "@/lib/utils";
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-navy" data-marca-guia="oki" data-app-cliente="true">
      {/*
        Faixa navy única e compacta (correção 2026-09-12: duas faixas altas
        empurravam o conteúdo real para baixo da dobra e destoavam do mockup
        3/17, que usa uma só faixa). Logo + "Bem-vinda/nome" no mesmo bloco.
      */}
      <header className="bg-navy text-cream" data-app-cabecalho>
          <div className="mx-auto w-full max-w-[740px] px-4 py-2 sm:px-8 sm:py-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo size={24} variant="client-dark" showText={false} />
              <p className="truncate text-xs text-cream/80">{previa?.titulo ?? data?.cliente?.nome ?? "Clube Ancestral"}</p>
            </div>
            <LinkPortal to="/portal/conta" className="inline-flex min-h-11 shrink-0 items-center text-xs text-cream underline decoration-gold underline-offset-4">Contato</LinkPortal>
          </div>

          <div className="max-w-2xl">
            {rotaAtiva === "/portal" ? <p className="sr-only text-gold">Aplicativo da família</p> : null}
            <h1 className="font-serif text-2xl font-medium leading-tight text-cream sm:text-4xl">{titulo}</h1>
             {descricao ? <p className="mt-2 hidden max-w-[32rem] text-base leading-relaxed text-cream/80 sm:block">{descricao}</p> : null}
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
        25/09/2026 — mesma experiência em qualquer largura (mockup de 17
        páginas): o App do cliente não tem barra lateral, topo administrativo
        nem painel. Em telas largas a leitura só fica mais ampla e centrada,
        e a navegação das 7 abas continua sendo o rodapé único.
      */}
      <div className="mx-auto w-full min-w-0 max-w-[740px]">
         <main id="conteudo-portal" className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-32 sm:pt-8">
          <div>{children}</div>
        </main>
      </div>

      {nav.length > 0 ? (
      <nav
        aria-label="Navegação do aplicativo do cliente"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-card/95 shadow-[0_-4px_16px_color-mix(in_srgb,var(--navy)_10%,transparent)] backdrop-blur"
      >
        <div
          className="mx-auto grid w-full max-w-[740px] px-1 pb-[env(safe-area-inset-bottom)] sm:px-5"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "relative flex min-h-[4rem] min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-2 text-[11px] leading-tight sm:min-h-[4.25rem]",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to
                  ? "after:absolute after:inset-x-2 after:top-0 after:h-0.5 after:bg-gold font-semibold text-gold"
                  : "text-navy/70",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 sm:h-[19px] sm:w-[19px]" aria-hidden="true" />
              <span className="w-full text-center">{to === "/portal/documentos" ? <><span className="sm:hidden">Docs</span><span className="hidden sm:inline">{label}</span></> : label}</span>
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
