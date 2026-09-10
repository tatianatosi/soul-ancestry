/**
 * Governança de Catálogo — camada de referência e bloqueio (somente leitura).
 *
 * Preço, condição, link Asaas e escopo vêm da fonte canônica e não são
 * editáveis aqui. Nada é criado, alterado ou enviado a nenhum sistema externo.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerReferenciaCatalogo } from "@/lib/catalogo-referencia.functions";
import {
  CRITERIOS_LIBERACAO_SKU,
  ROTULO_FILA_REFERENCIA,
  ROTULO_STATUS_LINK,
  ROTULO_STATUS_PRODUTO,
  type FilaReferencia,
} from "@/lib/catalogo-referencia";

const FILAS: FilaReferencia[] = ["ativos_sem_homologacao", "link_pendente_ou_desatualizado", "bloqueados"];

const dinheiro = (v: number | null, moeda: string) =>
  v === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(v);

export function ReferenciaCatalogo() {
  const [incluirTeste, setIncluirTeste] = useState(false);
  const carregar = useServerFn(lerReferenciaCatalogo);
  const q = useQuery({
    queryKey: ["catalogo-referencia", incluirTeste],
    queryFn: () => carregar({ data: { incluirTeste } }),
    retry: false,
  });

  if (q.isLoading) return <p className="mt-6 text-sm text-navy/50">Carregando referência de catálogo…</p>;
  if (q.isError) return <p className="mt-6 text-sm text-terracotta">Referência de catálogo indisponível para este perfil.</p>;

  const itens = q.data?.itens ?? [];
  const filas = q.data?.filas;

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl text-navy">Referência e bloqueio de catálogo</h2>
        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input type="checkbox" checked={incluirTeste} onChange={(e) => setIncluirTeste(e.target.checked)} />
          Incluir demonstrações
        </label>
      </div>
      <p className="text-xs text-navy/60">
        O catálogo homologado (product_catalog) é a fonte canônica de SKU, status, escopo, preço vigente, condição e
        link autorizado — a Planilha Mestre é só a origem histórica desses dados, não uma fonte lida em produção. No
        Desk esses campos são somente leitura: o CRM guarda apenas SKU, versão de vigência e data de última validação.
        SKU é referência técnica: a decisão de oferta por caso é do produto-pai (Planejador).
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {FILAS.map((f) => (
          <div key={f} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{ROTULO_FILA_REFERENCIA[f]}</p>
              <span className="font-serif text-2xl text-navy">{filas?.[f].length ?? 0}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/65">
              {(filas?.[f] ?? []).slice(0, 6).map((i) => (
                <li key={`${f}-${i.sku}`}>
                  <span className="font-mono text-[11px] text-navy/80">{i.sku}</span> — {i.motivo}
                  {i.dados_teste ? <span className="ml-1 rounded bg-gold/15 px-1 text-[10px] text-navy">DEMO</span> : null}
                </li>
              ))}
              {!(filas?.[f] ?? []).length ? <li>Fila vazia.</li> : null}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-navy/10 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">Critérios para liberar um SKU</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-navy/65">
          {CRITERIOS_LIBERACAO_SKU.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-navy/55">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Status do produto</th>
              <th className="px-3 py-2">Homologação</th>
              <th className="px-3 py-2">Preço vigente</th>
              <th className="px-3 py-2">Condição vigente</th>
              <th className="px-3 py-2">Versão / validação</th>
              <th className="px-3 py-2">Link Asaas</th>
              <th className="px-3 py-2">Seletor de oferta nova</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/5 text-navy/70">
            {itens.map((i) => (
              <tr key={i.sku}>
                <td className="px-3 py-2 font-mono text-[11px] text-navy/80">{i.sku}</td>
                <td className="px-3 py-2">
                  {i.nome_produto}
                  {i.dados_teste ? <span className="ml-1 rounded bg-gold/15 px-1 text-[10px] text-navy">DEMO</span> : null}
                </td>
                <td className="px-3 py-2">{ROTULO_STATUS_PRODUTO[i.status_produto]}</td>
                <td className="px-3 py-2">
                  {i.status_efetivo.rotulo}
                  {i.status_efetivo.motivo ? <span className="block text-[11px] text-navy/45">{i.status_efetivo.motivo}</span> : null}
                </td>
                <td className="px-3 py-2">{dinheiro(i.preco_comercial_vigente, i.moeda)}</td>
                <td className="px-3 py-2">{i.condicao_comercial_vigente ?? "—"}</td>
                <td className="px-3 py-2">
                  {i.versao_vigencia ?? "sem versão"} · {i.data_ultima_validacao ? String(i.data_ultima_validacao).slice(0, 10) : "sem validação"}
                </td>
                <td className="px-3 py-2">{ROTULO_STATUS_LINK[i.status_link_asaas]}</td>
                <td className="px-3 py-2">
                  {!i.no_seletor ? (
                    <span className="text-navy/50">Fora do seletor</span>
                  ) : i.selecionavel ? (
                    <span className="text-navy">Selecionável</span>
                  ) : (
                    <span className="text-terracotta">Bloqueado — {i.bloqueios[0]}</span>
                  )}
                </td>
              </tr>
            ))}
            {!itens.length ? (
              <tr>
                <td className="px-3 py-4 text-navy/50" colSpan={9}>
                  Sem dados suficientes.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
