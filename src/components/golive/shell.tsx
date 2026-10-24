/**
 * Shell do GoLive — a VIDA COMPLETA de cada cliente (23/10/2026, decisão da
 * Proprietária). Desde 23/10 o GoLive abre DENTRO do Desk V4 (grupo Casos →
 * "GoLive · Vida do cliente"), com a mesma lateral do Desk, um seletor de
 * cliente no topo e as abas da vida do cliente. O caso escolhido viaja na URL
 * (`?casoId=`) e é o mesmo para leitura e gravação. O Caso 360 continua sendo
 * a visão macro (cards-resumo) e aponta para cá.
 */
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

import { SaasShell } from "@/components/saas/shell";
import { useCasoGoLive, useGoLive } from "@/components/golive/dados";
import { cn } from "@/lib/utils";

const TELAS = [
  { to: "/golive", rotulo: "Visão do cliente" },
  { to: "/golive/comercial", rotulo: "Comercial" },
  { to: "/golive/leads", rotulo: "Leads" },
  { to: "/golive/kanban", rotulo: "Kanban" },
  { to: "/golive/pessoa", rotulo: "Pessoa" },
  { to: "/golive/pessoas", rotulo: "Pessoas & Famílias" },
  { to: "/golive/painel-caso", rotulo: "Painel do caso" },
  { to: "/golive/caso", rotulo: "Ficha do caso" },
  { to: "/golive/radar", rotulo: "Radar" },
  { to: "/golive/pesquisa", rotulo: "Pesquisa" },
  { to: "/golive/formalizacao", rotulo: "Formalização" },
  { to: "/golive/juridico", rotulo: "Jurídico" },
  { to: "/golive/financeiro", rotulo: "Financeiro" },
  { to: "/golive/microentregas", rotulo: "Microentregas" },
  { to: "/golive/portal", rotulo: "Portal" },
  { to: "/golive/aprovacoes", rotulo: "Aprovações" },
  { to: "/golive/prontidao", rotulo: "Prontidão para o App" },
  { to: "/golive/app", rotulo: "App Cliente" },
  { to: "/golive/configuracoes", rotulo: "Configurações" },
] as const;

export const TELAS_GOLIVE = TELAS;

function SeletorDeCliente() {
  const casoId = useCasoGoLive();
  const { data } = useGoLive();
  const navigate = useNavigate();
  const rota = useRouterState({ select: (s) => s.location.pathname });
  const carteira = data?.encontrado ? data.carteira : [];
  const atual = data?.encontrado ? data.caso : null;
  const valor = casoId ?? atual?.id ?? "";
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <label className="flex min-w-0 items-center gap-2 text-xs text-navy/70">
        <span className="shrink-0 font-medium">Cliente</span>
        <select
          aria-label="Escolher o cliente do GoLive"
          className="min-w-0 max-w-[22rem] rounded-lg border border-navy/20 bg-white px-2 py-1.5 text-sm text-navy"
          value={valor}
          onChange={(e) => {
            const id = e.target.value;
            void navigate({ to: rota, search: id ? { casoId: id } : {} } as never);
          }}
        >
          {atual && !carteira.some((c) => c.id === atual.id) ? (
            <option value={atual.id}>{[atual.codigo, atual.titulo].filter(Boolean).join(" · ")}</option>
          ) : null}
          {carteira.map((c) => (
            <option key={c.id} value={c.id}>
              {[c.codigo, c.titulo].filter(Boolean).join(" · ") || "Caso sem título"}
            </option>
          ))}
        </select>
      </label>
      {atual ? (
        <Link
          to="/casos/$caseId"
          params={{ caseId: String(atual.id) }}
          className="whitespace-nowrap rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:bg-navy/5"
        >
          Ver no Caso 360 (resumo)
        </Link>
      ) : null}
    </div>
  );
}

export function GoLiveShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  const { data } = useGoLive();
  const atual = data?.encontrado ? data.caso : null;
  const nomeCliente = atual ? [atual.codigo, atual.titulo].filter(Boolean).join(" · ") : null;
  return (
    <SaasShell
      titulo={`GoLive · ${titulo}`}
      descricao={nomeCliente ? `Vida completa do cliente — ${nomeCliente}${descricao ? ` · ${descricao}` : ""}` : descricao}
      acoes={<SeletorDeCliente />}
    >
      <nav aria-label="Abas da vida do cliente (GoLive)" className="-mx-1 mb-4 overflow-x-auto">
        <ul className="flex w-max min-w-full gap-1 px-1 pb-1">
          {TELAS.map((tela) => (
            <li key={tela.to}>
              <Link
                search={true}
                to={tela.to}
                className={cn("block whitespace-nowrap rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70 hover:bg-navy/5")}
                activeOptions={{ exact: tela.to === "/golive", includeSearch: false }}
                activeProps={{
                  className:
                    "block whitespace-nowrap rounded-full border border-gold bg-gold/20 px-3 py-1.5 text-xs font-semibold text-navy",
                }}
              >
                {tela.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-5">{children}</div>
    </SaasShell>
  );
}


export function Vazio({ cta }: { cta: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-white/60 p-6 text-center">
      <p className="text-sm text-navy/70">Sem itens nesta etapa</p>
      <div className="mt-3 flex justify-center">{cta}</div>
    </div>
  );
}

export function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white/70 p-4">
      <h2 className="mb-3 font-serif text-base text-navy">{titulo}</h2>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}

export function GradeDesk({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;
}

export function FaixaKpis({
  itens,
}: {
  itens: Array<{
    rotulo: string;
    valor: string | number;
    tom?: TomSelo;
    fonte?: string;
    formula?: string;
    periodo?: string;
    estado?: string;
  }>;
}) {
  return (
    <section aria-label="Resumo" className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
      {itens.slice(0, 4).map((item) => (
        <div key={item.rotulo} className="min-w-0 border-l-2 border-gold bg-white px-3 py-2 shadow-sm">
          <p className="break-words text-[11px] uppercase text-navy/55">{item.rotulo}</p>
          <p className="mt-1 break-words font-serif text-2xl leading-none text-navy">{item.valor}</p>
          {item.tom ? <Selo tom={item.tom}>{rotuloTom(item.tom)}</Selo> : null}
          <details className="mt-2 border-t border-navy/10 pt-1.5 text-left">
            <summary className="cursor-pointer text-[10px] font-medium text-navy/55">Fonte e cálculo</summary>
            <dl className="mt-1.5 space-y-1 text-[10px] leading-snug text-navy/65">
              <div><dt className="inline font-semibold text-navy">Fonte: </dt><dd className="inline">{item.fonte ?? "Registros reais desta superfície"}</dd></div>
              <div><dt className="inline font-semibold text-navy">Fórmula: </dt><dd className="inline">{item.formula ?? `Contagem dos registros classificados como “${item.rotulo}”`}</dd></div>
              <div><dt className="inline font-semibold text-navy">Período: </dt><dd className="inline">{item.periodo ?? "Estado atual"}</dd></div>
              <div><dt className="inline font-semibold text-navy">Estado: </dt><dd className="inline">{item.estado ?? (item.tom === "cinza" ? "Sem registros" : rotuloTom(item.tom ?? "azul"))}</dd></div>
            </dl>
          </details>
        </div>
      ))}
    </section>
  );
}

export type TomSelo = "azul" | "dourado" | "verde" | "terracota" | "cinza";

function rotuloTom(tom: TomSelo) {
  return {
    azul: "Em andamento",
    dourado: "Aguardando decisão",
    verde: "Concluído",
    terracota: "Atenção",
    cinza: "Sem registros",
  }[tom];
}

export function Selo({ tom, children }: { tom: TomSelo; children: ReactNode }) {
  return (
    <span
      className={cn(
        "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
        tom === "azul" && "border-navy/20 bg-navy/10 text-navy",
        tom === "dourado" && "border-gold/40 bg-gold/20 text-atencao",
        tom === "verde" && "border-sucesso/25 bg-sucesso-suave text-sucesso",
        tom === "terracota" && "border-terracotta/25 bg-critico-suave text-terracotta",
        tom === "cinza" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
