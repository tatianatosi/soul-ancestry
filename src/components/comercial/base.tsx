import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { historicoRegistro } from "@/lib/comercial.functions";
import { cn } from "@/lib/utils";

export const ROTULO_PROPOSTA: Record<string, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  enviada: "Enviada",
  em_negociacao: "Em negociação",
  aprovada: "Aceita/aprovada",

  recusada: "Recusada",
  expirada: "Expirada",
  substituida: "Substituída",
};

export const ROTULO_ORDEM: Record<string, string> = {
  draft: "Rascunho",
  pending_approval: "Aguardando aprovação",
  approved: "Pronta",
  active: "Em execução",
  paused: "Pausada",
  completed: "Concluída",
  cancelled: "Cancelada",
  archived: "Arquivada",
};

export const ROTULO_FATURA: Record<string, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
  pendente: "Pendente",
  parcialmente_paga: "Parcialmente paga",
  paga: "Paga",
  vencida: "Vencida",
  cancelada: "Cancelada",
};

export const ROTULO_PAGAMENTO: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  estornado: "Estornado",
  falhou: "Falhou",
};

export const ROTULO_CONCILIACAO: Record<string, string> = {
  nao_conciliado: "Não conciliado",
  sugerido: "Sugerido",
  conciliado: "Conciliado",
  divergente: "Divergente",
};

export function moeda(valor: unknown, sigla: unknown = "BRL") {
  if (valor === null || valor === undefined || valor === "") return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: (typeof sigla === "string" && sigla) || "BRL",
  }).format(Number(valor));
}

export function dataBr(valor: unknown) {
  if (!valor) return "—";
  const d = new Date(String(valor));
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export function Selo({ texto, tom = "neutro", title }: { texto: string; tom?: "neutro" | "ok" | "alerta" | "erro"; title?: string }) {
  return (
    <span
      title={title}
      className={cn(

        "inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-[11px] font-medium",
        tom === "ok" && "bg-gold/20 text-navy",
        tom === "alerta" && "bg-terracotta/15 text-terracotta",
        tom === "erro" && "bg-terracotta text-cream",
        tom === "neutro" && "bg-navy/10 text-navy/70",
      )}
    >
      {texto}
    </span>
  );
}

export function FiltroStatus({
  rotulos,
  valor,
  aoMudar,
}: {
  rotulos: Record<string, string>;
  valor: string;
  aoMudar: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[["", "Todos"], ...Object.entries(rotulos)].map(([v, r]) => (
        <button
          key={v || "todos"}
          onClick={() => aoMudar(v)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs",
            valor === v ? "border-navy bg-navy text-cream" : "border-navy/15 text-navy/70 hover:bg-navy/5",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

export function Painel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-navy/10 bg-card p-4 shadow-sm">
      <h3 className="font-serif text-lg">{titulo}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Historico({ entidade, id }: { entidade: string; id: string }) {
  const carregar = useServerFn(historicoRegistro);
  const q = useQuery({
    queryKey: ["historico", entidade, id],
    queryFn: () => carregar({ data: { entidade, id } }),
  });
  const linhas = q.data ?? [];
  if (q.isLoading) return <p className="text-sm text-navy/60">Carregando histórico…</p>;
  if (q.error)
    return (
      <p role="alert" className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
        Não foi possível carregar o histórico. A lista está vazia por falha de leitura, não por ausência de
        eventos.
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium"
        >
          Tentar novamente
        </button>
      </p>
    );
  if (!linhas.length) return <p className="text-sm text-navy/60">Sem eventos registrados até agora.</p>;
  return (
    <ol className="space-y-2 border-l border-navy/15 pl-4">
      {linhas.map((l) => (
        <li key={l.id} className="text-sm">
          <span className="text-navy/50">{new Date(l.created_at).toLocaleString("pt-BR")}</span>{" "}
          — {l.acao === "insert" ? "criado" : "atualizado"}
          {l.status ? ` · status: ${l.status}` : ""}
        </li>
      ))}
    </ol>
  );
}

export function Gaveta({
  titulo,
  aoFechar,
  children,
}: {
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/50" role="presentation">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-navy/15 bg-card p-5 shadow-xl" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <h2 className="min-w-0 font-serif text-2xl">{titulo}</h2>
          <button onClick={aoFechar} className="rounded-lg border border-navy/20 px-3 py-1 text-sm">
            Fechar
          </button>
        </div>
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-navy/70">{rotulo}</span>
      {children}
    </label>
  );
}

export const inputCls = "w-full rounded-lg border border-navy/20 bg-card px-3 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/25";
