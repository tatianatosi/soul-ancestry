import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getContexto, type Papel } from "@/lib/saas.functions";
import { registrarLogoutEquipe } from "@/lib/equipe.functions";
import { cn } from "@/lib/utils";
import { limparArmazenamentoDaSessao } from "@/lib/limpar-sessao";

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
 * Navegação do Desk: 7 seções principais.
 * Nenhum módulo foi removido — os secundários aparecem como subitens
 * da seção correspondente quando ela está aberta.
 */
type SubItem = { to: string; label: string; hash?: string } | { grupo: string };

type SecaoNav = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  agrupador?: boolean;
  sub: readonly SubItem[];
};

const NAV: readonly SecaoNav[] = [
  {
    to: "/painel",
    label: "Visão geral",
    icon: LayoutDashboard,
    sub: [
      { to: "/painel", label: "Painel Hoje" },
      { to: "/metricas", label: "Métricas comerciais e operacionais" },
      { to: "/relatorios", label: "Relatórios" },
    ],
  },
  {
    to: "/leads",
    label: "Comercial",
    icon: Users,
    sub: [
      { grupo: "CRM Vivo" },
      { to: "/leads", label: "Leads e Discovery" },
      { to: "/calls", label: "Painel de Calls" },
      { to: "/proximas-acoes", label: "Próximas ações dos leads" },
      { to: "/leads", hash: "crm-contatos", label: "Calls, conversas e interações" },
      { to: "/casos", hash: "planejador", label: "Planejador" },
      { to: "/propostas", label: "Propostas" },
      { to: "/conversao", label: "Conversão e follow-up" },
      { grupo: "Relacionamento" },
      { to: "/clientes", label: "Clientes e núcleos vinculados" },
    ],
  },
  {
    to: "/casos",
    label: "Casos e núcleos",
    icon: FolderOpen,
    sub: [
      { to: "/casos", label: "Casos 360" },
      { to: "/nucleos", label: "Pessoas, família e dossiê-mãe" },
      { to: "/tarefas", label: "Jornada e tarefas" },
      { to: "/ops-excecoes", label: "Exceções operacionais" },
      { to: "/qualidade", label: "Qualidade e fechamento" },
      { to: "/piloto", label: "Piloto real" },
      { to: "/piloto-ana", label: "Caso-piloto Ana Luiza" },
    ],
  },
  {
    to: "/pesquisa",
    label: "Pesquisa genealógica",
    icon: FileSearch,
    sub: [
      { to: "/pesquisa-modulo", label: "Visão de pesquisa e plano de ação" },
      { to: "/evidencias", label: "Evidências e documentos" },
      { to: "/fontes-genealogicas", label: "Fontes e consultas" },
      { to: "/privacidade", label: "Privacidade e liberação documental" },
    ],
  },
  {
    to: "/contratos",
    label: "Contratos e financeiro",
    icon: FileSignature,
    sub: [
      { grupo: "Formalização" },
      { to: "/contratos", label: "Contratos, prévia e revisão" },
      { to: "/ordens-servico", label: "Ordens de serviço e anexos" },
      { to: "/escopo-origem", label: "Origem do escopo contratual" },
      { to: "/contrato-parametros", label: "Dados parametrizáveis" },
      { grupo: "Financeiro" },
      { to: "/financeiro", label: "Faturas, pagamentos e condições" },
    ],
  },
  {
    to: "/biblioteca",
    label: "Governança e biblioteca",
    icon: Library,
    agrupador: true,
    sub: [
      { to: "/modo-proprietaria", label: "Modo Proprietária Administradora" },
      { to: "/governanca/contrato-base", label: "Contrato-base consolidado" },
      { to: "/governanca/modelo-individual", label: "Modelo individual + acompanhante" },
      { to: "/governanca/modelo-familiar-casal", label: "Modelo familiar — casal dois adultos" },
      { to: "/governanca/modelos-contratuais", label: "Matriz de modelos contratuais" },
      { to: "/catalogo", label: "Catálogo comercial" },
      { to: "/biblioteca", label: "Biblioteca Mestre" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de Mensagens" },
      { to: "/fontes-genealogicas", label: "Bases Genealógicas" },
      { to: "/matriz-juridica", label: "Matriz jurídica interna" },
      { to: "/governanca/criterios-aceite", label: "Critérios de aceite" },
      { to: "/governanca/matriz-conformidade", label: "Matrizes conceituais" },
      { to: "/governanca/indicadores", label: "Indicadores e métricas" },
      { to: "/governanca/decisoes", label: "Log de decisões" },
      { to: "/governanca/corte-vertical", label: "Corte vertical e fontes" },
      { to: "/governanca/inventario-recuperacao", label: "Inventário e recuperação" },
      { to: "/governanca/inventario-patrimonial", label: "Inventário patrimonial" },
      { to: "/governanca/modulos-contextuais", label: "Módulos contextuais" },
      { to: "/governanca/identificadores", label: "Identificadores" },
      { to: "/governanca/varredura-administracao", label: "Varredura de administração" },
      { to: "/governanca/varredura-completude", label: "Varredura de completude" },
      { to: "/etiquetas", label: "Etiquetas canônicas" },
      { to: "/integracoes", label: "Integrações" },
      { to: "/importacoes", label: "Importações e migração" },
      { to: "/configuracoes", label: "Configurações" },
    ],
  },
  {
    to: "/acessos-portal",
    label: "App Cliente",
    icon: Smartphone,
    sub: [
      { to: "/acessos-portal", label: "Acessos e visibilidade" },
      { to: "/atendimento", label: "Atendimento e publicação" },
    ],
  },
];


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
  // nunca derruba a proprietária para a tela de "sem permissão".
  useEffect(() => {
    if (isLoading) return;
    let cancelado = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      if (!data.session) {
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
  const itens: SecaoNav[] = NAV.map((item) =>
    ehAdmin && item.to === "/biblioteca"
      ? {
          ...item,
          sub: [
            ...item.sub,
            { to: "/equipe", label: "Usuários e papéis" },
            { to: "/auditoria", label: "Auditoria" },
          ],
        }
      : item,
  );


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
            const { to, label, icon: Icon, sub, agrupador } = item;
            const links = sub.filter((s): s is { to: string; label: string; hash?: string } => "to" in s);
            const rotaAtiva = rota === to || links.some((s) => rota.startsWith(s.to));
            const expandida = rotaAtiva || secaoAberta === to;
            return (
              <div key={to}>
                {agrupador ? (
                  <button
                    type="button"
                    onClick={() => setSecaoAberta((v) => (v === to ? null : to))}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      rotaAtiva ? "bg-cream/15 text-cream font-medium" : "text-cream/80 hover:bg-cream/10",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandida ? "" : "-rotate-90")} />
                  </button>
                ) : (
                  <Link
                    to={to}
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
