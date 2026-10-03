import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { alertasOps } from "@/lib/ops.functions";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Scale,
  Target,
  Library,
  LogOut,
  Menu,
  ChevronDown,
  ShieldCheck,
  Search,
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
  NAVEGACAO_V4_DESK,
  ROTAS_FORA_DO_MENU,
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

/** A face V4 tem sete destinos; os seis grupos permanecem em contexto recolhido. */
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
  comercial: Target,
  casos: FolderOpen,
  pesquisa: Library,
  contratos: Scale,
  governanca: ShieldCheck,
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
  visualKit,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
  visualKit?: "pantone";
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

  // Admin não ganha aba nova: módulos administrativos entram em Governança.
  // O Desk tem 6 grupos para qualquer papel interno.
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

  // Itens restritos a admin (equipe) só aparecem para admin.
  // O Desk tem 6 grupos para qualquer papel interno.
  const itens: SecaoNav[] = NAV.map((item) => ({
    ...item,
    sub: item.sub.filter((s) => !("to" in s) || !s.adminOnly || ehAdmin),
  }));

  return (
    <div
      className="flex min-h-svh w-full max-w-full overflow-x-clip bg-cream text-navy"
      data-desk-shell="authenticated"
      data-visual-kit={visualKit ?? "pantone"}
    >
      {aberto ? (
        <button
          type="button"
          aria-label="Fechar navegação"
          className="fixed inset-0 z-30 bg-navy/35 md:hidden"
          onClick={() => setAberto(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-full max-w-full shrink-0 flex-col overflow-y-auto border-r border-navy/20 bg-navy px-3 py-5 text-cream md:static md:flex md:w-64",
          aberto ? "flex" : "hidden",
        )}
      >
        <div className="px-2 pb-4" data-marca-guia="oki">
          <BrandLogo size={34} variant="client-dark" showText={false} className="items-center" />
          <p className="mt-2 font-serif text-base leading-tight text-gold">Clube Ancestral</p>
          <p className="mt-0.5 pl-0.5 text-[11px] uppercase tracking-widest text-cream/60">
            Desk Intelligence
          </p>
          <div className="mt-3 h-0.5 w-full bg-gold/80" aria-hidden="true" />
        </div>

        <nav aria-label="Navegação do Desk" className="flex flex-1 flex-col gap-1">
          {NAVEGACAO_V4_DESK.map((item) => {
            const Icon = ICONES[item.icone];
            const ativo = rotaAtendeDestino(rota, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setAberto(false)}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  ativo ? "bg-gold font-semibold text-navy" : "text-cream/80 hover:bg-cream/10",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">{item.label}</span>
                {badgeDe(item.to) > 0 ? <span className="ml-auto text-xs">{badgeDe(item.to)}</span> : null}
              </Link>
            );
          })}
          <details className="mt-4 border-t border-cream/15 pt-3">
            <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-widest text-gold">Áreas de trabalho</summary>
            <div className="mt-1 space-y-1">
          {itens.map((item) => {
            const { to, label, icon: Icon, sub, descricao: descricaoGrupo } = item;
            const ativo = grupoNavAtivo(rota, hash, item);
            const expandida = to in abertosManuais ? abertosManuais[to] : desktop && ativo;
            return (
              <div key={to} className="min-w-0 rounded-lg border border-cream/10 md:border-0">
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
                    "grid min-h-16 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors md:min-h-0 md:text-sm",
                    ativo ? "bg-gold text-navy font-medium" : "text-cream/80 hover:bg-cream/10",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="min-w-0 leading-tight">{label}</span>
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
                {expandida && sub.length ? (
                  <div className="mb-1 space-y-0.5 border-t border-cream/15 px-2 pb-2 pt-1 md:ml-7 md:border-l md:border-t-0 md:px-0 md:pb-0 md:pl-3 md:pt-0">
                    {sub.filter((s) => !("to" in s && ((NAVEGACAO_V4_DESK.some((v) => v.to === s.to && !s.hash)) || (ROTAS_FORA_DO_MENU as readonly string[]).includes(s.to)))).map((s, i) =>
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
            </div>
          </details>
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

      <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-clip">
        <div className="hidden min-h-8 items-center justify-between bg-navy px-8 text-[10px] font-semibold uppercase tracking-widest text-cream/70 md:flex">
          <span>Clube Ancestral · Desk Intelligence</span>
          <span>Genealogia profissional e história familiar</span>
        </div>
        <header className="grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-3 border-b border-navy/10 border-t-4 border-t-gold bg-navy px-4 py-4 text-cream shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(16rem,28rem)_auto] md:bg-card md:px-8 md:text-navy">
          <button
            className="shrink-0 md:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-label="Abrir navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo
            size={30}
            showText={false}
            variant="client-dark"
            className="shrink-0 md:hidden"
          />

          <div className="min-w-0 max-w-full flex-1">
            <h1 className="truncate font-serif text-2xl">{titulo}</h1>
            {descricao ? <p className="overflow-wrap-anywhere text-sm text-cream/70 md:text-navy/60">{descricao}</p> : null}
          </div>
          <div className="hidden min-w-0 items-center gap-2 rounded-md border border-input bg-cream/40 px-3 py-2.5 md:flex" aria-label="Busca no Desk">
            <Search className="h-4 w-4 shrink-0 text-navy/45" aria-hidden="true" />
            <span className="truncate text-xs text-navy/50">Buscar caso, pessoa ou documento</span>
          </div>
          {acoes ? (
            <div className="col-span-full min-w-0 max-w-full md:col-auto">{acoes}</div>
          ) : (
            <div className="hidden min-w-0 rounded-md border border-navy/10 bg-cream/40 px-3 py-2 md:block">
              <p className="max-w-44 truncate text-xs font-medium text-navy">{contexto?.perfil?.email ?? "Conta"}</p>
              <p className="max-w-44 truncate text-[10px] text-navy/50">{contexto?.organizacao?.nome ?? "Clube Ancestral"}</p>
            </div>
          )}
        </header>
        {contexto?.organizacao?.demo ? (
          <div className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-navy lg:px-8">
            DEMO — não usar dados reais
          </div>
        ) : null}
        {/* Identidade de marca aplicada em escopo isolado: somente a área de
            Pesquisa / Gestão de Pesquisa (inclui /evidencias). Demais telas permanecem congeladas. */}
        <main
          className="min-w-0 w-full max-w-full flex-1 overflow-x-clip p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-8 md:pb-8"
          data-desk-content="true"
          data-marca="guia"
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
    <div className="rounded-xl border border-dashed border-navy/20 bg-cream/50 p-10 text-center text-sm text-navy/60">
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
