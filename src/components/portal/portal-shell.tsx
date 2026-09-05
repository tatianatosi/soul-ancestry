import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import {
  FolderOpen,
  FileText,
  Receipt,
  LogOut,
  Route,
  Radar,
  Trees,
  PackageCheck,
  BookOpen,
  UserRound,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand";
import { usePreviaPortal } from "@/components/portal/fonte-portal";
import { portalContexto } from "@/lib/portal.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";
import { TIPO_CLIENTE } from "@/lib/marca";
import { COPY_GERAL, COPY_TELAS } from "@/lib/portal-copy";
import { useEscopoPortal } from "@/components/portal/portal-visibilidade";
import { visibilidadeTela, type EscopoCliente } from "@/lib/app-visibilidade";

/** Escopo conservador enquanto a leitura não retorna: nenhuma das três abas condicionais aparece. */
const ESCOPO_NAV_INDEFINIDO: EscopoCliente = {
  temAcesso: false,
  entregasLiberadas: 0,
  fase1Contratada: false,
  fase1Status: "nao_prevista",
  escopoIncluiFase2: false,
  fase2Status: "nao_aplicavel",
};

export function usePortal() {
  const carregar = useServerFn(portalContexto);
  return useQuery({ queryKey: ["portal-contexto"], queryFn: () => carregar({}) });
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
  const { data: escopo } = useEscopoPortal();

  useEffect(() => {
    // Em prévia (demo e espelho, dentro do Desk) ninguém é cliente autorizado
    // — a redireção expulsaria a Proprietária da própria tela que ela abriu.
    if (previa) return;
    if (isSuccess && data && !data.autorizado) {
      navigate({ to: "/acesso/sem-permissao", replace: true });
    }
  }, [previa, isSuccess, data, navigate]);

  /*
    Sete abas do mockup aprovado existem desde que o cliente chega — Início,
    Jornada, Radar, Árvore, Documentos, Legado e Conta. Entrega, Fase 01 e
    Fase 02 não são atalho universal: cada uma só entra na navegação quando o
    escopo real do caso (CA-UX-01.2 — mesma fonte que decide o estado dentro
    da própria tela) diz que ela é aplicável a este cliente. Uma data solta de
    início de onboarding não basta — isso mostrava "Fase 02" na entrada para
    qualquer caso que apenas tivesse começado, antes de ela fazer parte de
    fato da jornada contratada.
  */
  const escopoNav = previa ? null : (escopo ?? ESCOPO_NAV_INDEFINIDO);
  const entregaAplicavel = previa || (escopoNav ? visibilidadeTela("entrega", escopoNav).estado !== "not_applicable" : false);
  const fase01Aplicavel = previa || (escopoNav ? visibilidadeTela("relatorio", escopoNav).estado !== "not_applicable" : false);
  const fase02Aplicavel = previa || (escopoNav ? visibilidadeTela("fase02", escopoNav).estado !== "not_applicable" : false);

  const nav =
    previa || data?.nivel === "client_workspace"
      ? [
          { to: "/portal", label: COPY_TELAS.casos.navegacao, icon: FolderOpen },
          { to: "/portal/jornada", label: COPY_TELAS.jornada.navegacao, icon: Route },
          { to: "/portal/radar", label: COPY_TELAS.radar.navegacao, icon: Radar },
          { to: "/portal/arvore", label: COPY_TELAS.arvore.navegacao, icon: Trees },
          { to: "/portal/documentos", label: COPY_TELAS.documentos.navegacao, icon: FileText },
          { to: "/portal/legado", label: COPY_TELAS.legado.navegacao, icon: BookOpen },
          { to: "/portal/conta", label: COPY_TELAS.conta.navegacao, icon: UserRound },
          ...(entregaAplicavel ? [{ to: "/portal/entregas", label: COPY_TELAS.entregas.navegacao, icon: PackageCheck }] : []),
          ...(fase01Aplicavel ? [{ to: "/portal/fase-01", label: COPY_TELAS.fase01.navegacao, icon: FileText }] : []),
          ...(fase02Aplicavel ? [{ to: "/portal/fase-02", label: COPY_TELAS.fase02.navegacao, icon: FileText }] : []),
        ]
      : [{ to: "/portal/proposta", label: COPY_TELAS.proposta.navegacao, icon: Receipt }];

  async function sair() {
    // Em prévia quem está logado é a equipe, no Desk. Encerrar a sessão aqui
    // deslogaria a Proprietária do próprio Desk — o botão apenas fecha a
    // prévia e volta para a superfície interna.
    if (previa) {
      navigate({ to: "/acessos-portal", replace: true });
      return;
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    limparArmazenamentoDaSessao();
    navigate({ to: "/acesso", replace: true });
  }

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="border-b border-navy/10 bg-navy px-4 py-4 text-cream lg:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
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

      <nav className="border-b border-navy/10 bg-white px-4 lg:px-8">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset",
                rota === to
                  ? "border-gold font-medium text-navy"
                  : "border-transparent text-navy/70 hover:text-navy",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main id="conteudo-portal" className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        <h1 className={TIPO_CLIENTE.titulo}>{titulo}</h1>
        {descricao ? <p className={TIPO_CLIENTE.subtitulo}>{descricao}</p> : null}
        <div className="mt-5">{children}</div>
      </main>
    </div>
  );
}

export function PortalVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white/70 p-10 text-center text-sm text-navy/75">
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
