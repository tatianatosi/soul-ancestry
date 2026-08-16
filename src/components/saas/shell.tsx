import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  FileSearch,
  ListChecks,
  FileSignature,
  Wallet,
  BarChart3,
  BadgeCheck,
  Settings,
  FileText,
  ClipboardList,
  ShieldCheck,
  KeyRound,
  UsersRound,
  MessagesSquare,


  LogOut,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getContexto, type Papel } from "@/lib/saas.functions";
import { registrarLogoutEquipe } from "@/lib/equipe.functions";
import { cn } from "@/lib/utils";

const PAPEIS_ESCRITA: Papel[] = ["admin", "operacoes", "pesquisador", "comercial", "financeiro"];

export const PAPEL_LABEL: Record<Papel, string> = {
  admin: "Admin",
  operacoes: "Operações",
  pesquisador: "Pesquisador",
  comercial: "Comercial",
  financeiro: "Financeiro",
  leitura: "Leitura",
};

export function useSaas() {
  const carregar = useServerFn(getContexto);
  const q = useQuery({ queryKey: ["saas-contexto"], queryFn: () => carregar({}), retry: false });
  const papeis = q.data?.papeis ?? [];
  const statusStaff = q.data?.staff?.status ?? null;
  return {
    ...q,
    contexto: q.data,
    papeis,
    statusStaff,
    autorizado: statusStaff === "active" && papeis.length > 0,
    ehAdmin: papeis.includes("admin"),
    podeEscrever: papeis.some((p) => PAPEIS_ESCRITA.includes(p)),
    podeFinanceiro: papeis.includes("admin") || papeis.includes("financeiro"),
    podeComercial: papeis.includes("admin") || papeis.includes("comercial") || papeis.includes("operacoes"),
    podePesquisa: papeis.includes("admin") || papeis.includes("operacoes") || papeis.includes("pesquisador"),
    somenteLeitura: papeis.length > 0 && !papeis.some((p) => PAPEIS_ESCRITA.includes(p)),
  };
}

const NAV = [
  { to: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/clientes", label: "Clientes", icon: UserCheck },
  { to: "/acessos-portal", label: "Acessos ao portal", icon: KeyRound },

  { to: "/casos", label: "Casos", icon: FolderOpen },
  { to: "/pesquisa", label: "Pesquisa genealógica", icon: FileSearch },
  { to: "/evidencias", label: "Evidências", icon: FileSearch },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/ops", label: "Desk Operacional", icon: ClipboardList },
  { to: "/ops-excecoes", label: "Exceções operacionais", icon: ShieldCheck },
  { to: "/propostas", label: "Propostas", icon: FileText },
  { to: "/contratos", label: "Contratos", icon: FileSignature },
  { to: "/ordens-servico", label: "Ordens de serviço", icon: ClipboardList },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/privacidade", label: "Privacidade e documentos", icon: ShieldCheck },
  { to: "/atendimento", label: "Atendimento ao cliente", icon: MessagesSquare },
  { to: "/qualidade", label: "Qualidade", icon: BadgeCheck },
  { to: "/integracoes", label: "Integrações", icon: Plug },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function SaasShell({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const { contexto, papeis, ehAdmin, isLoading, isError, autorizado } = useSaas();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rota = useRouterState({ select: (s) => s.location.pathname });
  const [aberto, setAberto] = useState(false);
  const registrarSaida = useServerFn(registrarLogoutEquipe);

  // Sessão autenticada sem autorização interna ativa não permanece na área protegida.
  useEffect(() => {
    if (!isLoading && (isError || !autorizado)) {
      navigate({ to: "/equipe/sem-permissao", replace: true });
    }
  }, [isLoading, isError, autorizado, navigate]);

  async function sair() {
    try {
      await registrarSaida({});
    } catch {
      /* auditoria de logout é best-effort */
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/equipe/entrar", replace: true });
  }



  const itens = ehAdmin
    ? [
        ...NAV,
        { to: "/equipe", label: "Usuários e papéis", icon: UsersRound } as const,
        { to: "/auditoria", label: "Auditoria", icon: ShieldCheck } as const,
      ]
    : NAV;


  return (
    <div className="flex min-h-screen bg-cream text-navy">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col border-r border-navy/20 bg-navy px-3 py-5 text-cream lg:static lg:flex",
          aberto ? "flex" : "hidden",
        )}
      >
        <div className="px-2 pb-5">
          <p className="font-serif text-xl leading-tight text-gold">Clube Ancestral</p>
          <p className="text-[11px] uppercase tracking-widest text-cream/60">Gestão de pesquisa</p>
        </div>
        <nav className="flex-1 space-y-1">
          {itens.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setAberto(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                rota === to ? "bg-gold text-navy font-medium" : "text-cream/80 hover:bg-cream/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-cream/15 pt-3 text-xs text-cream/70">
          <p className="truncate font-medium text-cream">{contexto?.perfil?.email ?? "—"}</p>
          <p className="truncate">{contexto?.organizacao?.nome ?? "—"}</p>
          <p className="mt-1 truncate text-cream/60">
            {papeis.length ? papeis.map((p) => PAPEL_LABEL[p]).join(" · ") : "Sem papel atribuído"}
          </p>
          <button
            onClick={sair}
            className="mt-3 flex w-full items-center gap-2 rounded-lg border border-cream/20 px-3 py-2 text-sm text-cream hover:bg-cream/10"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-navy/10 bg-white px-4 py-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setAberto((v) => !v)} aria-label="Abrir navegação">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-2xl">{titulo}</h1>
            {descricao ? <p className="text-sm text-navy/60">{descricao}</p> : null}
          </div>
          {acoes}
        </header>
        {contexto?.organizacao?.demo ? (
          <div className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-navy lg:px-8">
            DEMO — não usar dados reais
          </div>
        ) : null}
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-10 text-center text-sm text-navy/60">
      {mensagem}
    </div>
  );
}
