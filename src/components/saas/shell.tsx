import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { alertasOps } from "@/lib/ops.functions";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  ListChecks,
  Scale,
  Target,
  Bell,
  Library,
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
import {
  GRUPOS_DESK,
  MENU_CONTA,
  grupoNavAtivo,
  itemNavAtivo,
  naturezaDaBiblioteca,
  origemDoAtalho,
  rotaAtendeDestino,
  type GrupoDesk,
  type ItemNav,
} from "@/lib/navegacao-desk";
import { AssistenteTransversal } from "@/components/desk/assistente-transversal";
import { BrandLogo } from "@/components/brand";

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
    podeComercial:
      papeis.includes("admin") || papeis.includes("comercial") || papeis.includes("operacoes"),
    podePesquisa:
      papeis.includes("admin") || papeis.includes("operacoes") || papeis.includes("pesquisador"),
    somenteLeitura: papeis.length > 0 && !papeis.some((p) => PAPEIS_ESCRITA.includes(p)),
  };
}

/**
 * Navegação do Desk: 7 telas do mockup aprovado.
 * O registro canônico vive em `src/lib/navegacao-desk.ts`; aqui só há
 * apresentação. Trabalho operacional (Calls, contratos, pesquisa, portal)
 * aparece como subitem da tela correspondente — nenhuma rota some.
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
  "visao-geral": LayoutDashboard,
  casos: FolderOpen,
  checklist: ListChecks,
  validacao: Scale,
  radar: Target,
  alertas: Bell,
  biblioteca: Library,
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
  const hash = useRouterState({ select: (s) => s.location.hash });
  const [aberto, setAberto] = useState(false);
  const [abertosManuais, setAbertosManuais] = useState<Record<string, boolean>>({});
  const [desktop, setDesktop] = useState(false);
  const registrarSaida = useServerFn(registrarLogoutEquipe);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  // Admin não ganha abas novas: os módulos administrativos entram no menu da
  // conta. O Desk mantém as 7 telas do mockup para qualquer papel interno.
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
  // O Desk mantém as 7 telas do mockup para qualquer papel interno.
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
        <div className="px-2 pb-6">
          <BrandLogo size={34} variant="client-dark" className="items-center" />
          <p className="mt-2 pl-0.5 text-[11px] uppercase tracking-widest text-cream/60">
            Desk Intelligence
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {itens.map((item) => {
            const { to, label, icon: Icon, sub, descricao: descricaoGrupo } = item;
            const ativo = grupoNavAtivo(rota, hash, item);
            const expandida = to in abertosManuais ? abertosManuais[to] : desktop && ativo;
            return (
              <div key={to}>
                <button
                  type="button"
                  title={descricaoGrupo}
                  onClick={() => {
                    if (ativo) {
                      setAbertosManuais((v) => ({
                        ...v,
                        [to]: !(to in v ? v[to] : desktop && ativo),
                      }));
                      return;
                    }
                    setAbertosManuais((v) => ({ ...v, [to]: true }));
                    void navigate({ to: to as never });
                    setAberto(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    ativo ? "bg-gold text-navy font-medium" : "text-cream/80 hover:bg-cream/10",
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
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", expandida ? "" : "-rotate-90")}
                  />
                </button>
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
                            itemNavAtivo(rota, hash, s)
                              ? "bg-cream/15 text-cream font-medium"
                              : "text-cream/65 hover:bg-cream/10",
                          )}
                        >
                          {s.label}
                          {/* Atalho para rota que mora em outro grupo: sem esta
                              marca, a repetição deliberada lê-se como
                              duplicação. */}
                          {origemDoAtalho(label, s.to) ? (
                            <span className="ml-1.5 text-[10px] font-normal text-cream/40">
                              ↗ {origemDoAtalho(label, s.to)}
                            </span>
                          ) : null}
                          {/* Biblioteca que um motor chama não se lê igual a
                              biblioteca de referência. Sem a marca, as duas
                              parecem a mesma coisa no menu. */}
                          {naturezaDaBiblioteca(s.to) ? (
                            <span
                              className="ml-1.5 text-[10px] font-normal text-cream/40"
                              title={naturezaDaBiblioteca(s.to)!.nota}
                            >
                              ·{" "}
                              {naturezaDaBiblioteca(s.to)!.natureza === "motor"
                                ? "motor"
                                : "referência"}
                            </span>
                          ) : null}
                        </Link>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="mt-4 border-t border-cream/15 pt-3">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
            {MENU_CONTA.label}
          </p>
          {MENU_CONTA.itens
            .filter((s): s is { to: string; label: string; adminOnly?: boolean } => "to" in s)
            .filter((s) => !s.adminOnly || ehAdmin)
            .map((s) => (
              <Link
                key={s.to}
                to={s.to}
                onClick={() => setAberto(false)}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                  rotaAtendeDestino(rota, s.to)
                    ? "bg-cream/15 text-cream font-medium"
                    : "text-cream/65 hover:bg-cream/10",
                )}
              >
                {s.label}
              </Link>
            ))}
        </div>
        <div className="mt-4 border-t border-cream/15 pt-3 text-xs text-cream/70">
          <p className="truncate font-medium text-cream">{contexto?.perfil?.email ?? "—"}</p>
          <p className="truncate">{contexto?.organizacao?.nome ?? "—"}</p>
          <p className="mt-1 truncate text-cream/60">
            {papeis.length ? papeis.map((p) => PAPEL_LABEL[p] ?? p).join(" · ") : "Sem papel atribuído"}
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
          <button
            className="lg:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-label="Abrir navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo
            size={30}
            showText={false}
            variant="client-light"
            className="shrink-0 lg:hidden"
          />

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
          className="min-w-0 flex-1 p-4 pb-20 lg:p-8"
          data-marca={
            rota.startsWith("/pesquisa") ||
            rota === "/evidencias" ||
            rota.startsWith("/evidencias/")
              ? "guia"
              : undefined
          }
        >
          {children}
        </main>
        {/* CA-UX-03 (adendo v1.0): Assistente transversal — presente nos 8 grupos,
            conforme papel e contexto. Não é aba nem fonte de verdade. */}
        <AssistenteTransversal papeis={papeis} />
      </div>
    </div>
  );
}

export function EstadoVazio({ mensagem, acao }: { mensagem: string; acao?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white/60 p-10 text-center text-sm text-navy/60">
      <p>{mensagem}</p>
      {acao ? <div className="mt-3 flex justify-center">{acao}</div> : null}
    </div>
  );
}

/** Ação padrão para EstadoVazio quando o vazio é, na verdade, erro de carregamento. */
export function BotaoTentarNovamente({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
    >
      Tentar novamente
    </button>
  );
}
