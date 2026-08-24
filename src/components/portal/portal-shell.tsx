import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactNode } from "react";
import { FolderOpen, FileText, Receipt, LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { BrandLogo } from "@/components/brand";
import { portalContexto } from "@/lib/portal.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";

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

  useEffect(() => {
    if (isSuccess && data && !data.autorizado) {
      navigate({ to: "/acesso/sem-permissao", replace: true });
    }
  }, [isSuccess, data, navigate]);

  const nav =
    data?.nivel === "client_workspace"
      ? [
          { to: "/portal", label: "Home", icon: FolderOpen },
          { to: "/portal/jornada", label: "Jornada", icon: Route },
          { to: "/portal/radar", label: "Radar", icon: Radar },
          { to: "/portal/arvore", label: "Árvore", icon: Trees },
          { to: "/portal/documentos", label: "Documentos", icon: FileText },
          { to: "/portal/entregas", label: "Entregas da Jornada", icon: PackageCheck },
          { to: "/portal/fase-01", label: "Fase 01", icon: FileText },
          { to: "/portal/fase-02", label: "Fase 02", icon: FileText },
          { to: "/portal/legado", label: "Legado", icon: BookOpen },
          { to: "/portal/conta", label: "Conta", icon: UserRound },
          { to: "/portal/faturas", label: "Faturas", icon: Receipt },
          { to: "/portal/proposta", label: "Proposta", icon: Receipt },
        ]
      : [{ to: "/portal/proposta", label: "Proposta", icon: Receipt }];


  async function sair() {
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
              <p className="truncate text-[11px] uppercase tracking-widest text-cream/60">
                {data?.cliente?.nome ?? "Portal do cliente"}
              </p>
            </div>
          </div>

          <button onClick={sair} className="flex items-center gap-2 rounded-lg border border-cream/25 px-3 py-1.5 text-xs">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <nav className="border-b border-navy/10 bg-white px-4 lg:px-8">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm",
                rota === to ? "border-gold font-medium text-navy" : "border-transparent text-navy/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        <h1 className="font-serif text-2xl">{titulo}</h1>
        {descricao ? <p className="mt-1 text-sm text-navy/60">{descricao}</p> : null}
        <div className="mt-5">{children}</div>
      </main>
    </div>
  );
}

export function PortalVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white/70 p-10 text-center text-sm text-navy/60">
      {mensagem}
    </div>
  );
}
