/**
 * Financeiro no shell de go-live.
 *
 * Três blocos analíticos da prancha v3: valores contratado/recebido/a
 * receber/vencido, recebimento mensal confirmado e situação das faturas.
 *
 * Só leitura do que já está gravado no caso canônico. Nada é cobrado,
 * integrado ou estimado; sem catálogo, SKU, preço provisório ou dado
 * fictício. Nenhuma cobrança, assinatura ou envio externo é disparado aqui.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Linha as LinhaSerie, Rosca } from "@/components/golive/graficos";
import { recebimentoPorMes, situacaoDasFaturas, totaisFinanceiros } from "@/lib/golive-analitico";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Go-live Clube Ancestral" },
      { name: "description", content: "Valores, recebimentos confirmados e situação das faturas do caso do piloto." },
      { property: "og:title", content: "Financeiro — Go-live Clube Ancestral" },
      { property: "og:description", content: "Faturas, pagamentos e recebimento mensal do caso do piloto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinanceiroGoLive,
});

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function FinanceiroGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const faturas = caso?.faturas ?? [];
  const pagamentos = caso?.pagamentos ?? [];
  const totais = totaisFinanceiros(faturas, pagamentos);
  const recebimento = recebimentoPorMes(faturas, pagamentos, 6);
  const situacao = situacaoDasFaturas(faturas);

  const irParaContratos = (
    <Link to="/contratos">
      <Button size="sm">Abrir contratos</Button>
    </Link>
  );

  return (
    <GoLiveShell titulo="Financeiro" descricao="Valores, recebimentos confirmados e situação das faturas.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <Bloco titulo="1. Valores do caso">
        {faturas.length ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { rotulo: "Contratado", valor: totais.contratado },
              { rotulo: "Recebido", valor: totais.pago },
              { rotulo: "A receber", valor: totais.emAberto },
              { rotulo: "Vencido", valor: totais.vencido },
            ].map((i) => (
              <div key={i.rotulo} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-navy/50">{i.rotulo}</dt>
                <dd className="break-words text-sm font-semibold text-navy">{MOEDA.format(i.valor)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="2. Recebimento por mês">
        {recebimento.length ? (
          <>
            <LinhaSerie titulo="Recebimento confirmado" dados={recebimento} />
            <p className="text-xs text-navy/55">Só pagamentos com data de confirmação registrada.</p>
          </>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="3. Situação das faturas">
        {situacao.length ? (
          <Rosca titulo="Situação das faturas" dados={situacao} />
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="Faturas">
        {faturas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {faturas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"}
                {typeof f.valor === "number" ? ` — ${MOEDA.format(f.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(f.status, "sem situação registrada")}
                  {f.vencimento ? ` · vence ${dataHumana(f.vencimento)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>

      <Bloco titulo="Pagamentos">
        {pagamentos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {pagamentos.map((p) => (
              <li key={p.id} className="break-words">
                {faturas.find((f) => f.id === p.faturaId)?.numero ?? "Cobrança"}
                {typeof p.valor === "number" ? ` — ${MOEDA.format(p.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(p.metodo, "forma não informada")}
                  {p.pagoEm ? ` · recebido em ${dataHumana(p.pagoEm)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={irParaContratos} />
        )}
      </Bloco>
    </GoLiveShell>
  );
}
