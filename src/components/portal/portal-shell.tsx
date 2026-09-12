import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  FileText,
  Receipt,
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
import { MAPA_APP_CLIENTE_KIT, type AbaAppCliente } from "@/lib/portal-mapa-kit";

const ROTULO_ABA: Record<AbaAppCliente, string> = {
  home: COPY_TELAS.home.navegacao,
  jornada: COPY_TELAS.jornada.navegacao,
  radar: COPY_TELAS.radar.navegacao,
  arvore: COPY_TELAS.arvore.navegacao,
  documentos: COPY_TELAS.documentos.navegacao,
  legado: COPY_TELAS.legado.navegacao,
  conta: COPY_TELAS.conta.navegacao,
};

const ICONE_ABA: Record<AbaAppCliente, typeof Home> = {
  home: Home,
  jornada: Route,
  radar: Radar,
  arvore: Trees,
  documentos: FileText,
  legado: BookOpen,
  conta: UserRound,
};

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
  // Rótulo e destino de cada aba vêm do de-para canônico em portal-mapa-kit.
  const nav =
    previa || data?.nivel === "client_workspace"
      ? MAPA_APP_CLIENTE_KIT.map(({ aba, rota }) => ({
          to: rota,
          label: ROTULO_ABA[aba],
          icon: ICONE_ABA[aba],
        }))
      : [{ to: "/portal/proposta", label: COPY_TELAS.proposta.navegacao, icon: Receipt }];

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
    <div className="min-h-screen bg-cream text-navy" data-marca-guia="oki" data-visual-kit="pantone">
      <header className="bg-navy px-4 pt-4 text-cream lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <BrandLogo size={36} variant="client-dark" showText={false} />
            <div className="min-w-0">
              <p className="font-serif text-lg leading-tight text-gold">Clube Ancestral</p>
              <p className="truncate text-[11px] uppercase tracking-widest text-cream/70">
                {previa ? previa.titulo : (data?.cliente?.nome ?? "Aplicativo do cliente")}
              </p>
            </div>
          </div>

          <button
            onClick={sair}
            className="flex items-center gap-2 rounded-lg border border-cream/30 px-3 py-1.5 text-xs text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <LogOut className="h-3.5 w-3.5" /> {COPY_GERAL.sair}
          </button>
        </div>
        {/* Filete gold do guia OKI — âncora sob o header navy. */}
        <div className="h-0.5 w-full bg-gold" aria-hidden="true" />
      </header>

      {previa ? (
        <p
          data-previa-portal
          role="status"
          className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-navy lg:px-8"
        >
          {previa.selo}
        </p>
      ) : null}

      {/*
        Mobile (< sm): barra fixa no rodapé, como no mockup aprovado — ícone
        sobre rótulo, largura igual para cada aba, todas visíveis sem rolagem
        horizontal (era exatamente isso que cortava "Árvore" na barra de topo
        rolável, pensada para desktop). Desktop (>= sm): mantém a barra de
        abas no topo, com espaço de sobra para rótulo ao lado do ícone.
      */}
      <nav
        aria-label="Navegação do aplicativo do cliente"
        className="hidden border-b border-navy/10 bg-cream px-4 sm:block lg:px-8"
      >
        <div className="mx-auto flex max-w-4xl gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to
                  ? "border-gold font-medium text-gold"
                  : "border-transparent text-navy/70 hover:text-navy",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </LinkPortal>
          ))}
        </div>
      </nav>

      <main id="conteudo-portal" className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:pb-6 lg:px-8">
        <h1 className={TIPO_CLIENTE.titulo}>{titulo}</h1>
        {descricao ? <p className={TIPO_CLIENTE.subtitulo}>{descricao}</p> : null}
        <div className="mt-5">{children}</div>
      </main>

      <nav
        aria-label="Navegação do aplicativo do cliente"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-navy/10 bg-cream pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <div className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
          {nav.map(({ to, label, icon: Icon }) => (
            <LinkPortal
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] leading-tight",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rotaAtiva === to ? "font-medium text-gold" : "text-navy/60",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </LinkPortal>
          ))}
        </div>
      </nav>
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
