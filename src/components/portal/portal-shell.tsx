import "./portal-v11.css";
import { AndamentoPublicado } from "@/components/portal/andamento-publicado";

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import {
  BookOpen,
  Compass,
  FileText,
  Flag,
  GitFork,
  Home,
  UserRound,
} from "lucide-react";

import { BrandLogo } from "@/components/brand";
import { LinkPortal, useFontePortal, usePreviaPortal } from "@/components/portal/fonte-portal";
import { portalContexto } from "@/lib/portal.functions";
import { registrarTempoNaAba, type AbaComTelemetria } from "@/lib/portal-cliente.functions";
import { cn } from "@/lib/utils";
import { TIPO_CLIENTE } from "@/lib/marca";
import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";

/*
  Telemetria de permanência (11/10/2026) — pedido cobre onde achados e
  memórias aparecem hoje: Home, Radar e Legado, além da Árvore já pedida
  nominalmente. Não existe aba "descobertas"; nenhuma rota nova foi criada
  para isso. As demais abas (Jornada, Documentos, Conta) não são rastreadas
  até um pedido explícito as incluir.
*/
const ABAS_RASTREADAS: Partial<Record<string, AbaComTelemetria>> = {
  "/portal": "home",
  "/portal/radar": "radar",
  "/portal/arvore": "arvore",
  "/portal/legado": "legado",
};

function useTelemetriaDePermanencia(rotaAtiva: string, bloqueado: boolean) {
  const registrar = useServerFn(registrarTempoNaAba);
  const estadoRef = useRef<{ tab: AbaComTelemetria; desde: number } | null>(null);
  const vigenteRef = useRef({ registrar, bloqueado });

  useEffect(() => {
    vigenteRef.current = { registrar, bloqueado };
  }, [registrar, bloqueado]);

  const enviarEFechar = useCallback(() => {
    const { registrar: enviar, bloqueado: travado } = vigenteRef.current;
    const atual = estadoRef.current;
    estadoRef.current = null;
    if (!atual || travado) return;
    const duracaoMs = Date.now() - atual.desde;
    if (duracaoMs <= 0) return;
    void enviar({ data: { tab: atual.tab, duracaoMs, casoId: null } }).catch(() => {});
  }, []);

  useEffect(() => {
    enviarEFechar();
    const tab = ABAS_RASTREADAS[rotaAtiva];
    estadoRef.current = tab ? { tab, desde: Date.now() } : null;
  }, [rotaAtiva, enviarEFechar]);

  useEffect(() => {
    function aoEsconder() {
      if (document.visibilityState === "hidden") enviarEFechar();
    }
    document.addEventListener("visibilitychange", aoEsconder);
    window.addEventListener("pagehide", enviarEFechar);
    return () => {
      document.removeEventListener("visibilitychange", aoEsconder);
      window.removeEventListener("pagehide", enviarEFechar);
      enviarEFechar();
    };
  }, [enviarEFechar]);
}

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

  useTelemetriaDePermanencia(rotaAtiva, Boolean(previa));

  useEffect(() => {
    // Em prévia (demo e espelho, dentro do Desk) ninguém é cliente autorizado
    // — a redireção expulsaria a Proprietária da própria tela que ela abriu.
    if (previa) return;
    if (isSuccess && data && !data.autorizado) {
      navigate({ to: "/acesso/sem-permissao", replace: true });
    }
  }, [previa, isSuccess, data, navigate]);

  /*
    Sete abas canônicas: Painel, Jornada, Árvore, Descobertas, Documentos,
    Biblioteca e Conta. Entregas / Fase 01 / Fase 02 saem da barra — as rotas
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
        { to: "/portal", label: "Painel", icon: Home },
        { to: "/portal/jornada", label: "Jornada", icon: Flag },
        { to: "/portal/arvore", label: "Árvore", icon: GitFork },
        { to: "/portal/radar", label: "Descobertas", icon: Compass },
        { to: "/portal/documentos", label: "Documentos", icon: FileText },
        { to: "/portal/legado", label: "Biblioteca", icon: BookOpen },
        { to: "/portal/conta", label: "Conta", icon: UserRound },
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
          <div className="app-layout-largura mx-auto w-full max-w-[740px] px-4 py-2 sm:px-8 sm:py-5">
          <div className="app-v11-marca grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo size={40} variant="client-dark" showText />
            </div>
            <LinkPortal to="/portal/conta" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs text-cream underline decoration-gold underline-offset-4"><UserRound className="h-4 w-4" aria-hidden="true" />Conta</LinkPortal>
          </div>

          <div className="app-v11-identidade max-w-2xl">
            <p className="mb-1 text-xs text-gold">{previa?.titulo ?? data?.cliente?.nome ?? "Sua história familiar"}</p>
            {rotaAtiva === "/portal" ? <p className="sr-only text-gold">Aplicativo da família</p> : null}
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
      <div className="app-layout-largura mx-auto w-full min-w-0 max-w-[740px]">
         <main id="conteudo-portal" className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-32 sm:pt-8">
           <div className="app-abertura-tela">
             <h1 className="font-serif text-2xl font-medium leading-tight text-navy sm:text-4xl">{titulo}</h1>
             {descricao ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{descricao}</p> : null}
           </div>
           <AndamentoPublicado rota={rotaAtiva} />
          <div>{children}</div>
        </main>
      </div>

      {nav.length > 0 ? (
      <nav
        aria-label="Navegação do aplicativo do cliente"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/40 bg-card/95 shadow-[0_-4px_16px_color-mix(in_srgb,var(--navy)_10%,transparent)] backdrop-blur"
      >
        <div
           className="app-layout-largura mx-auto grid w-full max-w-[740px] px-1 pb-[env(safe-area-inset-bottom)] sm:px-5"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "relative flex min-h-[4rem] min-w-0 flex-col items-center justify-center gap-1 px-0 py-2 text-[9px] leading-none whitespace-nowrap sm:min-h-[4.25rem] sm:px-0.5 sm:text-[11px] sm:leading-tight",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to
                  ? "after:absolute after:inset-x-2 after:top-0 after:h-0.5 after:bg-gold font-semibold text-gold"
                  : "text-navy/70",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 sm:h-[19px] sm:w-[19px]" aria-hidden="true" />
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
