import "./portal-v11.css";
import { AndamentoPublicado } from "@/components/portal/andamento-publicado";

import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
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
import { LinkPortal, useFontePortal, usePortalVivo, usePreviaPortal } from "@/components/portal/fonte-portal";
import { iniciais } from "@/components/portal/elementos-mockup";
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
  const vivo = usePortalVivo();
  const nomeTitular = vivo.data?.resumoCaso?.perfil.nome ?? null;
  const primeiroNome = nomeTitular?.split(/\s+/)[0] ?? null;

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
    <div className="min-h-screen overflow-x-hidden bg-cream text-navy" data-marca-guia="oki" data-app-cliente="true" data-app-editorial={rotaAtiva}>
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
            <LinkPortal to="/portal/conta" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-gold bg-navy-800 font-serif text-sm font-semibold text-gold" aria-label="Abrir Conta e perfil" data-botao-perfil>{nomeTitular ? iniciais(nomeTitular) : <UserRound className="h-5 w-5" aria-hidden="true" />}</LinkPortal>
          </div>

          <div className="app-v11-identidade max-w-2xl">
            {primeiroNome ? <p className="font-serif text-lg text-cream sm:text-xl" data-saudacao>Bem-vinda, {primeiroNome}</p> : null}
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
           className="app-layout-largura mx-auto grid w-full max-w-[740px] px-1 pb-[env(safe-area-inset-bottom,16px)] sm:px-5"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "relative flex min-h-[4rem] min-w-[44px] touch-manipulation flex-col items-center justify-center gap-1 px-0.5 py-2 text-[11px] leading-tight transition-colors duration-200 ease-out sm:min-h-[4.25rem]",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to
                  ? "app-nav-ativo after:absolute after:inset-x-2 after:top-0 after:h-0.5 after:bg-gold font-semibold"
                  : "text-navy/70",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 sm:h-[19px] sm:w-[19px]" aria-hidden="true" />
              <span className="w-full text-center whitespace-nowrap">{to === "/portal/documentos" ? <><span className="sm:hidden">Docs</span><span className="hidden sm:inline">{label}</span></> : label}</span>
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

/**
 * Estado de carregamento padrão do App Cliente.
 *
 * 26/10/2026 — restaurado o esqueleto (silhueta dos cards) da decisão
 * vinculante da Proprietária no parecer de design de 22/10/2026
 * (`badba1c`): um commit de reconciliação do Lovable tinha colapsado de
 * volta para o texto puro. Mantém o texto de leitor de tela.
 */
export function PortalCarregando() {
  return (
    <div className="grid gap-5" role="status" aria-busy="true" data-portal-carregando>
      <span className="sr-only">{COPY_GERAL.carregando}</span>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="app-folha animate-pulse rounded-2xl border border-navy/10 bg-cream/60 p-6"
        >
          <div className="h-3 w-24 rounded-full bg-navy/10" />
          <div className="mt-4 h-5 w-3/5 rounded-full bg-navy/10" />
          <div className="mt-3 h-3 w-full rounded-full bg-navy/[0.07]" />
          <div className="mt-2 h-3 w-4/5 rounded-full bg-navy/[0.07]" />
        </div>
      ))}
    </div>
  );
}

/** Mantido para quem precisa só da frase, sem a silhueta. */
export function PortalCarregandoTexto() {
  return (
    <p className={TIPO_CLIENTE.corpo} role="status">
      {COPY_GERAL.carregando}
    </p>
  );
}
