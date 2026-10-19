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
  ShieldCheck,
  Search,
  ChevronDown,
  Users,
  Megaphone,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getContexto, type Papel } from "@/lib/saas.functions";
import { registrarLogoutEquipe } from "@/lib/equipe.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";
import { sessaoAusenteConfirmada } from "@/lib/guarda-sessao";
import {
  MENU_CONTA,
  MENU_LEGADO_DESK,
  rotaAtendeDestino,
  setorDaRota,
  SETORES_DESK,
  destinoDaAba,
  itemNavAtivo,
  type AbaSetor,
  type GrupoDesk,
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

const ICONES: Record<GrupoDesk["icone"], typeof LayoutDashboard> = {
  hoje: LayoutDashboard,
  comercial: Target,
  casos: FolderOpen,
  pesquisa: Library,
  contratos: Scale,
  governanca: ShieldCheck,
  pessoas: Users,
  marketing: Megaphone,
  financeiro: Wallet,
};

/**
 * Navegação do Desk: o shell NÃO guarda lista própria de setores.
 *
 * 06/10/2026 — este arquivo tinha uma segunda lista (`SETORES_DESK`, com os
 * rótulos de 02/10) escrita aqui dentro, concorrendo com `src/lib`. O
 * conteúdo dela foi preservado e movido para `SETORES_DESK_V5` em
 * `navegacao-desk.ts`, junto com a divergência declarada contra o V4 de sete
 * itens. Aqui ficou só o layout.
 */

/** A aba mais específica que casa com a rota (e com a âncora, quando houver) fica ativa. */
function abaAtiva(rota: string, hash: string, aba: AbaSetor, abas: readonly AbaSetor[]): boolean {
  const comHash = abas.find((a) => a.hash && hash && itemNavAtivo(rota.replace(/^\/casos\/[^/]+$/, "/casos"), hash, a));
  if (comHash) return comHash === aba;
  if (aba.hash) return false;
  const melhor = abas
    .filter((a) => !a.hash && (rota === a.to || rota.startsWith(`${a.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return melhor === aba;
}

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
  const hashAtual = useRouterState({ select: (s) => s.location.hash });
  const [aberto, setAberto] = useState(false);
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
  const badgeDe = (id: string): number => (id === "casos" ? atrasadasCasos : 0);

  // Seis setores fixos; o setor ativo define a única linha de abas abaixo do
  // cabeçalho. Abas restritas a admin só aparecem para admin.
  const setorAtivo = setorDaRota(rota);
  const abasSetor = (setorAtivo?.abas ?? []).filter((a) => !a.adminOnly || ehAdmin);
  // Avatar da topbar: só o que o perfil da sessão traz — nada fixo no código.
  const nomeExibido = contexto?.perfil?.nome?.trim() || contexto?.perfil?.email || "Conta";
  const iniciais =
    (contexto?.perfil?.nome?.trim() || contexto?.perfil?.email?.split("@")[0] || "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "·";

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
          {SETORES_DESK.map((setor) => {
            const Icon = ICONES[setor.icone];
            const ativo = setorAtivo?.id === setor.id;
            return (
              <Link
                key={setor.id}
                to={setor.to}
                onClick={() => setAberto(false)}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 font-serif text-sm transition-colors",
                  ativo ? "bg-gold font-semibold text-navy" : "text-cream/80 hover:bg-cream/10",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 leading-tight">{setor.label}</span>
                {badgeDe(setor.id) > 0 ? (
                  <span
                    title={`${badgeDe(setor.id)} item(ns) com prazo vencido`}
                    className="ml-auto rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-semibold text-cream"
                  >
                    {badgeDe(setor.id)}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        {/* De-Para de retirada (13/10/2026): rotas concorrentes fora do menu principal, recolhidas aqui. */}
        <details className="mt-4 border-t border-cream/15 pt-3" data-menu-legado>
          <summary className="flex min-h-11 cursor-pointer items-center px-2 text-[10px] font-semibold uppercase tracking-widest text-cream/60 hover:text-cream">
            {MENU_LEGADO_DESK.label}
          </summary>
          {MENU_LEGADO_DESK.itens.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              onClick={() => setAberto(false)}
              className={cn(
                "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                rotaAtendeDestino(rota, s.to) ? "bg-cream/15 font-medium text-cream" : "text-cream/65 hover:bg-cream/10",
              )}
            >
              {s.label}
            </Link>
          ))}
        </details>
        <div className={cn("mt-4 border-t border-cream/15 pt-3", MENU_CONTA.itens.length === 0 && "hidden")}>
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
        {/*
          Prancha V4 aprovada (13/10/2026): topo limpo em qualquer largura —
          sem o bloco navy que subia no celular. A busca leva ao "Encontrar no
          Desk" que já existe; o avatar mostra o perfil real da sessão.
        */}
        <header className="flex min-w-0 items-center gap-3 border-b border-border bg-card px-4 py-3 md:px-6" data-desk-topbar>
          <button
            className="shrink-0 md:hidden"
            onClick={() => setAberto((v) => !v)}
            aria-label="Abrir navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/painel"
            hash="encontrar-no-desk"
            aria-label="Buscar caso, pessoa ou documento"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-cream/40 px-3 py-1.5 transition-colors hover:border-gold"
          >
            <Search className="h-4 w-4 shrink-0 text-navy/50" aria-hidden="true" />
            <span className="truncate text-xs text-navy/50">Buscar caso, pessoa ou documento</span>
          </Link>
          <details className="relative shrink-0" data-desk-avatar>
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[10px] font-medium text-gold" aria-hidden="true">
                {iniciais}
              </span>
              <span className="hidden max-w-40 truncate text-xs text-navy/70 sm:inline">{nomeExibido}</span>
              <ChevronDown className="h-4 w-4 text-navy/50" aria-hidden="true" />
            </summary>
            <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-navy/10 bg-card p-3 text-sm shadow-lg">
              <p className="truncate font-medium text-navy">{nomeExibido}</p>
              {contexto?.perfil?.email ? <p className="truncate text-xs text-navy/60">{contexto.perfil.email}</p> : null}
              <p className="mt-1 truncate text-xs text-navy/50">{contexto?.organizacao?.nome ?? "Clube Ancestral"}</p>
              <button
                type="button"
                onClick={sair}
                className="mt-3 flex w-full items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm text-navy hover:bg-navy/5"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </details>
        </header>
        <div className="min-w-0 px-4 pt-4 md:px-6 md:pt-6" data-desk-titulo>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words font-serif text-3xl leading-tight text-navy">{titulo}</h1>
              {descricao ? <p className="overflow-wrap-anywhere mt-1 text-xs text-navy/60">{descricao}</p> : null}
            </div>
            {acoes ? <div className="min-w-0 max-w-full">{acoes}</div> : null}
          </div>
          {/* Pílulas da prancha: as abas do setor ativo. */}
          {abasSetor.length ? (
            <nav
              aria-label={`Abas de ${setorAtivo?.label ?? "setor"}`}
              className="mt-4 flex min-w-0 flex-wrap gap-2"
              data-desk-abas-setor={setorAtivo?.id}
            >
              {abasSetor.map((aba) => {
                const ativa = abaAtiva(rota, hashAtual, aba, abasSetor);
                const destino = destinoDaAba(aba, rota);
                return (
                  <Link
                    key={`${aba.to}#${aba.hash ?? ""}`}
                    to={destino.to}
                    params={destino.caseId ? { caseId: destino.caseId } : undefined}
                    hash={destino.hash}
                    data-aba-destino={`${destino.caseId ? `/casos/${destino.caseId}` : destino.to}${destino.hash ? `#${destino.hash}` : ""}`}
                    aria-current={ativa ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[11px] transition-colors",
                      ativa ? "border-navy bg-navy text-white" : "border-navy/15 text-navy/70 hover:bg-cream",
                    )}
                  >
                    {aba.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
        {contexto?.organizacao?.demo ? (
          <div className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-xs font-medium uppercase tracking-wide text-navy lg:px-8">
            DEMO — não usar dados reais
          </div>
        ) : null}
        {/* Identidade de marca aplicada em escopo isolado: somente a área de
            Pesquisa / Gestão de Pesquisa (inclui /evidencias). Demais telas permanecem congeladas. */}
        <main
          className="min-w-0 w-full max-w-full flex-1 overflow-x-clip p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-8 md:pt-5"
          data-desk-content="true"
          data-marca="guia"
        >
          {children}
        </main>
        {/* Prancha V4: no celular a navegação entre setores é a barra fixa de ícones embaixo. */}
        <nav
          aria-label="Setores do Desk"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-8 border-t border-navy/10 bg-card px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-sm md:hidden"
          data-desk-nav-movel
        >
          {SETORES_DESK.map((setor) => {
            const Icon = ICONES[setor.icone];
            const ativo = setorAtivo?.id === setor.id;
            return (
              <Link
                key={setor.id}
                to={setor.to}
                aria-current={ativo ? "page" : undefined}
                aria-label={setor.label}
                className={cn(
                  "flex h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-0.5 text-[8px] font-medium",
                  ativo ? "bg-gold/20 text-navy" : "text-navy/50",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="max-w-full truncate">{setor.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
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
