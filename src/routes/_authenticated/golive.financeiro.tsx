/**
 * Financeiro no shell de go-live.
 *
 * Valor e condição são registro manual; faturas, pagamentos e situação vêm
 * do que já está gravado no caso canônico. Nada é cobrado, nada é integrado,
 * nada é estimado. Sem catálogo, SKU ou preço técnico.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Linha as LinhaSerie, Rosca } from "@/components/golive/graficos";
import { contarPor, estaPaga, recebimentoPorMes, totaisFinanceiros } from "@/lib/golive-analitico";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { registrarFaturaGoLive, registrarPagamentoGoLive } from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Go-live Clube Ancestral" },
      { name: "description", content: "Valor, condição, faturas e pagamentos registrados do caso do piloto." },
      { property: "og:title", content: "Financeiro — Go-live Clube Ancestral" },
      { property: "og:description", content: "Valor, condição, faturas e pagamentos do caso do piloto." },
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
  const comValor = faturas.filter((f) => typeof f.valor === "number");
  const total = comValor.reduce((s, f) => s + (f.valor as number), 0);
  const pagas = faturas.filter(estaPaga);
  const totais = totaisFinanceiros(faturas, pagamentos);
  const recebimento = recebimentoPorMes(faturas, pagamentos, 6);
  const situacao = contarPor(faturas, (f) => humano(f.status, ""), "Sem situação");

  const novaFatura = useServerFn(registrarFaturaGoLive);
  const novoPagamento = useServerFn(registrarPagamentoGoLive);

  const acaoFatura = (
    <Acao
      rotulo="Emitir fatura"
      titulo="Cobrança do caso"
      variante="outline"
      campos={[
        { nome: "numero", rotulo: "Número", obrigatorio: true },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", obrigatorio: true },
        { nome: "vencimento", rotulo: "Vencimento", tipo: "data" },
        { nome: "descricao", rotulo: "Descrição" },
      ]}
      aoConfirmar={(v) =>
        novaFatura({
          data: {
            numero: v["numero"] ?? "",
            valor: Number(v["valor"] ?? 0),
            vencimento: v["vencimento"] ?? "",
            descricao: v["descricao"] ?? "",
          },
        })
      }
      confirmacao="Fatura registrada. Nenhuma cobrança foi enviada."
    />
  );

  const acaoPagamento = (
    <Acao
      rotulo="Registrar pagamento manual"
      titulo="Pagamento recebido"
      variante="outline"
      campos={[
        {
          nome: "faturaId",
          rotulo: "Fatura",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: faturas.map((f) => ({ valor: f.id, rotulo: f.numero ?? "Cobrança" })),
        },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero", obrigatorio: true },
        { nome: "metodo", rotulo: "Forma de pagamento", padrao: "pix" },
        { nome: "pagoEm", rotulo: "Data do pagamento", tipo: "data" },
      ]}
      aoConfirmar={(v) =>
        novoPagamento({
          data: {
            faturaId: v["faturaId"] ?? "",
            valor: Number(v["valor"] ?? 0),
            metodo: v["metodo"] ?? "",
            pagoEm: v["pagoEm"] ?? "",
          },
        })
      }
      confirmacao="Pagamento registrado à mão."
    />
  );


  return (
    <GoLiveShell titulo="Financeiro" descricao="Valor, condição, faturas e pagamentos — registro manual.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <Bloco titulo="Valor e condição">
        {comValor.length ? (
          <>
            <p className="text-sm text-navy">
              {MOEDA.format(total)} em {comValor.length} cobrança{comValor.length === 1 ? "" : "s"} registrada
              {comValor.length === 1 ? "" : "s"}.
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { rotulo: "Contratado", valor: totais.contratado },
                { rotulo: "Recebido", valor: totais.pago },
                { rotulo: "Em aberto", valor: totais.emAberto },
                { rotulo: "Vencido", valor: totais.vencido },
              ].map((i) => (
                <div key={i.rotulo} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                  <dt className="text-[11px] uppercase tracking-wide text-navy/50">{i.rotulo}</dt>
                  <dd className="break-words text-sm font-semibold text-navy">{MOEDA.format(i.valor)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <Vazio cta={acaoFatura} />
        )}
      </Bloco>

      {faturas.length ? (
        <Bloco titulo="Situação das cobranças">
          <Rosca titulo="Situação das cobranças" dados={situacao} />
        </Bloco>
      ) : null}

      {recebimento.length ? (
        <Bloco titulo="Recebimento por mês">
          <LinhaSerie titulo="Recebimento por mês" dados={recebimento} />
          <p className="text-xs text-navy/55">Só pagamentos com data de confirmação registrada.</p>
        </Bloco>
      ) : null}

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
          <Vazio cta={acaoFatura} />
        )}
        {faturas.length ? <Acoes>{acaoFatura}</Acoes> : null}
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
        ) : pagas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {pagas.map((f) => (
              <li key={f.id} className="break-words">
                {f.numero ?? "Cobrança"}
                {typeof f.valor === "number" ? ` — ${MOEDA.format(f.valor)}` : ""}{" "}
                <span className="text-navy/55">
                  · {humano(f.status)}
                  {f.pagaEm ? ` · recebido em ${dataHumana(f.pagaEm)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={faturas.length ? acaoPagamento : <span className="text-xs text-navy/55">Emita uma fatura antes de registrar o pagamento.</span>} />
        )}
        {pagas.length ? <Acoes>{acaoPagamento}</Acoes> : null}
      </Bloco>

      <Bloco titulo="Situação do caso">
        <ul className="space-y-1 text-sm text-navy">
          <li>
            Contrato assinado:{" "}
            <span className={caso?.caso.contratoAssinado ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}>
              {caso?.caso.contratoAssinado ? "sim" : "ainda não"}
            </span>
          </li>
          <li>
            Pagamento confirmado:{" "}
            <span className={caso?.caso.pagamentoConfirmado ? "text-navy/70" : "text-[var(--terracota,#9A3A2F)]"}>
              {caso?.caso.pagamentoConfirmado ? "sim" : "ainda não"}
            </span>
          </li>
        </ul>
      </Bloco>
    </GoLiveShell>
  );
}
