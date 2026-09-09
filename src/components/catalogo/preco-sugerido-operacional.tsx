/**
 * Painel de leitura — preço sugerido como referência comercial operacional.
 * Somente leitura: não cria preço, condição, cobrança, link ou comunicação.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerPrecoSugeridoCanonico } from "@/lib/preco-sugerido-canonico.functions";
import {
  MATRIZ_PRECEDENCIA_PRECO,
  ROTULO_ESTADO_PRECO_SUGERIDO,
  type EstadoPrecoSugerido,
} from "@/lib/preco-sugerido-canonico";

const CORES: Record<EstadoPrecoSugerido, string> = {
  PRECO_SUGERIDO_DISPONIVEL: "border-emerald-600/30 bg-emerald-50 text-emerald-800",
  PRECO_SUGERIDO_COM_RESSALVA: "border-gold/40 bg-gold/10 text-navy",
  PRECO_SUGERIDO_BLOQUEADO: "border-terracotta/30 bg-terracotta/10 text-terracotta",
};

const moedaBR = (v: number | null, m: string | null) =>
  v === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: m || "BRL" }).format(v);

export function PrecoSugeridoOperacional() {
  const carregar = useServerFn(lerPrecoSugeridoCanonico);
  const q = useQuery({ queryKey: ["preco-sugerido-canonico"], queryFn: () => carregar(), retry: false });

  const totais = q.data?.totais;
  const ana = q.data?.ana ?? null;
  const criticas = q.data?.divergencias_criticas ?? [];

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-4">
      <h2 className="font-serif text-lg text-navy">Preço sugerido — referência comercial operacional</h2>
      <p className="mt-1 text-xs text-navy/60">
        O preço sugerido canônico do catálogo é a referência interna para Planejador, Comercial, Proposta, Anexo I/OS e
        métricas. Não é cobrança, link, assinatura nem valor final: condição e proposta aprovadas prevalecem.
      </p>

      {q.isLoading ? <p className="mt-3 text-sm text-navy/60">Carregando…</p> : null}
      {q.error ? (
        <p role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-sm text-terracotta">
          Não foi possível ler o preço sugerido canônico. Totais e divergências abaixo estão vazios por falha de
          leitura, não por ausência de dado.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}
      {q.error ? <p className="mt-3 text-sm text-terracotta">{(q.error as Error).message}</p> : null}

      {totais ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(Object.keys(totais) as EstadoPrecoSugerido[]).map((e) => (
            <div key={e} className={`rounded-lg border p-3 ${CORES[e]}`}>
              <p className="text-xs uppercase tracking-wide opacity-75">{ROTULO_ESTADO_PRECO_SUGERIDO[e]}</p>
              <p className="mt-1 font-serif text-2xl">{totais[e]}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-navy/10 bg-cream/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Matriz de precedência</p>
        <ol className="mt-2 space-y-1 text-xs text-navy/75">
          {MATRIZ_PRECEDENCIA_PRECO.map((m) => (
            <li key={m.origem}>
              {m.ordem}. {m.regra}
            </li>
          ))}
        </ol>
      </div>

      {ana ? (
        <div className="mt-4 rounded-lg border border-navy/10 p-3 text-xs text-navy/75">
          <p className="font-medium text-navy">Caso piloto {ana.caso} — auditoria sem alteração de valor</p>
          <p className="mt-1">
            Proposta {ana.proposta_status ?? "—"}: {moedaBR(ana.proposta_valor, "BRL")} · condição comercial específica:{" "}
            {ana.condicao_aprovada ? "existente" : "ausente"} · SKU canônico: {ana.sku ?? "não vinculado"}
          </p>
          <p className="mt-1">
            Estado do preço sugerido:{" "}
            <span className="font-medium text-navy">
              {ana.resolucao ? ROTULO_ESTADO_PRECO_SUGERIDO[ana.resolucao.estado] : "—"}
            </span>{" "}
            · origem do valor vigente: {ana.origem_valor}
          </p>
          {ana.resolucao?.motivos?.length ? (
            <ul className="mt-1 list-disc pl-4">
              {ana.resolucao.motivos.map((m) => (
                <li key={m.codigo + m.descricao}>{m.descricao}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {criticas.length ? (
        <div className="mt-4 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-navy/80">
          <p className="font-medium text-terracotta">Divergências críticas pendentes ({criticas.length})</p>
          <ul className="mt-1 list-disc pl-4">
            {criticas.slice(0, 10).map((d, i) => (
              <li key={`${d.sku}-${i}`}>
                {d.sku} — {d.tipo}
                {d.detalhe ? `: ${d.detalhe}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-xs text-navy/55">Nenhuma divergência crítica de preço, moeda ou vigência pendente.</p>
      )}
    </section>
  );
}
