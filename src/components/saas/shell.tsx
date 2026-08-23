import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { alertasOps } from "@/lib/ops.functions";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileSearch,
  FileSignature,
  Library,
  Smartphone,
  LogOut,
  Menu,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getContexto, type Papel } from "@/lib/saas.functions";
import { registrarLogoutEquipe } from "@/lib/equipe.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";
import { sessaoAusenteConfirmada } from "@/lib/guarda-sessao";
import { GRUPOS_DESK, type GrupoDesk, type ItemNav } from "@/lib/navegacao-desk";

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
  const q = useQuery({
    queryKey: ["saas-contexto"],
    queryFn: () => carregar({}),
    // Falha de rede ou token ainda não anexado não pode derrubar a sessão:
    // tenta novamente antes de qualquer decisão de acesso.
    retry: 3,
    retryDelay: (tentativa) => Math.min(1000 * 2 ** tentativa, 4000),
    staleTime: 30_000,
  });
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

/**
 * Navegação do Desk: 8 grupos principais (CA-UX-03).
 * O registro canônico vive em `src/lib/navegacao-desk.ts`; aqui só há
 * apresentação. Nenhum módulo foi removido — os secundários aparecem como
 * subitens do grupo correspondente.
 */
type SubItem = ItemNav;

type SecaoNav = {
  to: string;
  label: string;
  descricao: string;
  icon: typeof LayoutDashboard;
  agrupador?: boolean;
  sub: readonly SubItem[];
};

const ICONES: Record<GrupoDesk["icone"], typeof LayoutDashboard> = {
  hoje: LayoutDashboard,
  comercial: Users,
  casos: FolderOpen,
  pesquisa: FileSearch,
  contratos: FileSignature,
  cliente: Smartphone,
  governanca: Library,
  administracao: ShieldCheck,
};

const NAV: readonly SecaoNav[] = GRUPOS_DESK.map((g) => ({
  to: g.to,
  label: g.label,
  descricao: g.descricao,
  icon: ICONES[g.icone],
  ...(g.agrupador ? { agrupador: true } : {}),
  sub: g.sub,
}));



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
  const { contexto, papeis, ehAdmin, isLoading, isError, autorizado, refetch } = useSaas();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rota = useRouterState({ select: (s) => s.location.pathname });
  const [aberto, setAberto] = useState(false);
  const [secaoAberta, setSecaoAberta] = useState<string | null>(null);
  const registrarSaida = useServerFn(registrarLogoutEquipe);

  // Só sai da área protegida quando o servidor responde e a autorização não
  // existe. Erro de rede/token com sessão válida apenas refaz a consulta —
  // nunca derruba a proprietária para a tela de "sem permissão". A ausência de
  // sessão precisa ser confirmada em releituras: uma leitura vazia durante a
  // renovação do token não é logout.
  useEffect(() => {
    if (isLoading) return;
    let cancelado = false;
    void (async () => {
      const semSessao = await sessaoAusenteConfirmada(async () => {
        const { data } = await supabase.auth.getSession();
        return Boolean(data.session);
      });
      if (cancelado) return;
      if (semSessao) {
        navigate({ to: "/equipe/entrar", replace: true });
        return;
      }
      if (isError) {
        void refetch();
        return;
      }
      if (!autorizado) {
        navigate({ to: "/equipe/sem-permissao", replace: true });
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [isLoading, isError, autorizado, navigate, refetch]);


  async function sair() {
    try {
      await registrarSaida({});
    } catch {
      /* auditoria de logout é best-effort */
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    limparArmazenamentoDaSessao();
    navigate({ to: "/equipe/entrar", replace: true });
  }



  // Admin não ganha abas novas: os módulos administrativos entram como
  // subitens da seção "Governança e biblioteca" — o Desk mantém 7 abas.
  // Contadores reais no menu: apenas números já existentes no banco (SLA de tarefas
  // e microentregas). Sem dado, nenhum badge é exibido — nunca estimamos.
  const carregarAlertas = useServerFn(alertasOps);
  const alertas = useQuery({
    queryKey: ["shell", "alertas-menu"],
    queryFn: () => carregarAlertas({} as never),
    staleTime: 60_000,
    retry: false,
  });
  const atrasadasCasos =
    (alertas.data?.atrasadas?.length ?? 0) + (alertas.data?.microAtrasadas?.length ?? 0);
  const badgeDe = (to: string): number => (to === "/casos" ? atrasadasCasos : 0);

  // Itens restritos a admin (equipe, auditoria) só aparecem para admin.
  // O Desk mantém exatamente 8 grupos para qualquer papel interno.
  const itens: SecaoNav[] = NAV.map((item) => ({
    ...item,
    sub: item.sub.filter((s) => !("to" in s) || !s.adminOnly || ehAdmin),
  }));


  return (
    <div className="flex min-h-screen bg-cream text-navy">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col overflow-y-auto border-r border-navy/20 bg-navy px-3 py-5 text-cream lg:static lg:flex",
          aberto ? "flex" : "hidden",
        )}
      >
        <div className="px-2 pb-5">
          <p className="font-serif text-xl leading-tight text-gold">Clube Ancestral</p>
          <p className="text-[11px] uppercase tracking-widest text-cream/60">Gestão de pesquisa</p>
        </div>
        <nav className="flex-1 space-y-1">
          {itens.map((item) => {
            const { to, label, icon: Icon, sub, agrupador, descricao: descricaoGrupo } = item;
            const links = sub.filter((s): s is { to: string; label: string; hash?: string } => "to" in s);
            const rotaAtiva = rota === to || links.some((s) => rota.startsWith(s.to));
            const expandida = rotaAtiva || secaoAberta === to;
            return (
              <div key={to}>
                {agrupador ? (
                  <button
                    type="button"
                    title={descricaoGrupo}
                    onClick={() => setSecaoAberta((v) => (v === to ? null : to))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      rotaAtiva ? "bg-cream/15 text-cream font-medium" : "text-cream/80 hover:bg-cream/10",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{label}</span>
                    {badgeDe(to) > 0 ? (
                      <span
                        title={`${badgeDe(to)} item(ns) com prazo vencido`}
                        className="rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-semibold text-cream"
                      >
                        {badgeDe(to)}
                      </span>
                    ) : null}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandida ? "" : "-rotate-90")} />
                  </button>
                ) : (
                  <Link
                    to={to}
                    title={descricaoGrupo}
                    onClick={() => {
                      setAberto(false);
                      setSecaoAberta(to);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      rota === to ? "bg-gold text-navy font-medium" : "text-cream/80 hover:bg-cream/10",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )}
                {expandida && sub.length ? (
                  <div className="mb-1 ml-7 space-y-0.5 border-l border-cream/15 pl-3">
                    {sub.map((s, i) =>
                      "grupo" in s ? (
                        <p
                          key={`g-${s.grupo}`}
                          className="px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-widest text-gold"
                        >
                          {s.grupo}
                        </p>
                      ) : (
                        <Link
                          key={`${s.to}-${s.hash ?? i}`}
                          to={s.to}
                          hash={s.hash}
                          onClick={() => setAberto(false)}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                            rota.startsWith(s.to) ? "bg-cream/15 text-cream font-medium" : "text-cream/65 hover:bg-cream/10",
                          )}
                        >
                          {s.label}
                        </Link>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}

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
        {/* Identidade de marca aplicada em escopo isolado: somente a área de
            Pesquisa / Gestão de Pesquisa (inclui /evidencias). Demais telas permanecem congeladas. */}
        <main
          className="min-w-0 flex-1 p-4 lg:p-8"
          data-marca={
            rota.startsWith("/pesquisa") || rota === "/evidencias" || rota.startsWith("/evidencias/")
              ? "guia"
              : undefined
          }
        >
          {children}
        </main>

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
