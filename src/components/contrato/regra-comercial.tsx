import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Painel, Selo, moeda } from "@/components/comercial/base";
import {
  CLAUSULA_DESPESAS_TERCEIROS,
  REGRAS_DESPESAS_TERCEIROS,
  ROTULO_ESTADO_DESPESA,
  pendenciasDespesa,
  type Despesa,
  type EstadoDespesa,
} from "@/lib/despesas-terceiros";
import { REGRAS_PRECO_SKU, ROTULO_FONTE_PRECO, fonteOficialDePreco } from "@/lib/precos-sku";
import { conferirRegraComercial, registrarExcecaoComercial } from "@/lib/regra-comercial.functions";

function faixa(d: Despesa) {
  if (d.estimativa_min == null && d.estimativa_max == null) return "estimativa não registrada";
  if (d.estimativa_min != null && d.estimativa_max != null && d.estimativa_min !== d.estimativa_max) {
    return `${moeda(d.estimativa_min, d.moeda)} a ${moeda(d.estimativa_max, d.moeda)}`;
  }
  return moeda(d.estimativa_min ?? d.estimativa_max, d.moeda);
}

export function RegraComercial({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const conferir = useServerFn(conferirRegraComercial);
  const assumirExcecao = useServerFn(registrarExcecaoComercial);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["regra-comercial", caseId],
    queryFn: () => conferir({ data: { caseId } }),
  });

  const [abrirExcecao, setAbrirExcecao] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [precoTotal, setPrecoTotal] = useState("");
  const [condicaoPagamento, setCondicaoPagamento] = useState("");
  const [validoAte, setValidoAte] = useState("");
  const [erroExcecao, setErroExcecao] = useState<string | null>(null);

  const mExcecao = useMutation({
    mutationFn: (vars: { sku: string }) =>
      assumirExcecao({
        data: {
          caseId,
          sku: vars.sku,
          motivo,
          precoTotal: Number(precoTotal),
          condicaoPagamento,
          validoAte,
        },
      }),
    onSuccess: async () => {
      setErroExcecao(null);
      setAbrirExcecao(false);
      setMotivo("");
      setPrecoTotal("");
      setCondicaoPagamento("");
      setValidoAte("");
      await qc.invalidateQueries({ queryKey: ["regra-comercial", caseId] });
    },
    onError: (e: Error) => setErroExcecao(e.message),
  });

  const preco = data?.preco ?? null;
  const despesas = (data?.despesas ?? []) as Despesa[];

  return (
    <div className="space-y-4">
      <Painel titulo="Despesas de terceiros — cláusula institucional">
        <p className="rounded border border-navy/20 bg-cream p-3 text-sm text-navy">{CLAUSULA_DESPESAS_TERCEIROS}</p>
        <p className="mt-2 text-xs text-navy/60">
          Aplicada automaticamente em <strong>ANX-COMERCIAL</strong> para todos os novos contratos, salvo exceção formal
          aprovada por usuário autorizado (com justificativa, aprovador, validade e auditoria).
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/70">
          {REGRAS_DESPESAS_TERCEIROS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <div className="mt-3 space-y-2">
          {isLoading && <p className="text-sm text-navy/60">Conferindo…</p>}
          {error ? (
            <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-terracotta">
              Não foi possível conferir a regra comercial deste caso. Preço, despesas e exceções abaixo estão
              vazios por falha de leitura, não por ausência de registro.
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium"
              >
                Tentar novamente
              </button>
            </p>
          ) : null}
          {!isLoading && !error && despesas.length === 0 && (
            <p className="text-sm text-navy/60">
              Nenhuma despesa de terceiro registrada neste caso. Estado padrão: “Estimativa pendente” assim que uma despesa
              aplicável for identificada.
            </p>
          )}
          {despesas.map((d) => {
            const pend = pendenciasDespesa(d);
            return (
              <div key={d.id} className="rounded border border-navy/15 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm text-navy">{d.descricao ?? "—"}</strong>
                  <Selo
                    tom={pend.length ? "alerta" : "ok"}
                    texto={ROTULO_ESTADO_DESPESA[d.estado as EstadoDespesa] ?? d.estado}
                  />
                </div>
                <p className="mt-1 text-xs text-navy/70">
                  {d.categoria ? `${d.categoria} · ` : ""}
                  {faixa(d)} · pagador: {d.pagador === "cliente" ? "cliente (direto)" : "exceção aprovada"} ·{" "}
                  {d.aprovado_pelo_cliente_em ? "aprovação registrada" : "sem aprovação registrada"}
                </p>
                {pend.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-terracotta">
                    {pend.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Painel>

      <Painel titulo="Preço e condição do SKU — catálogo homologado">
        {isLoading && <p className="text-sm text-navy/60">Conferindo…</p>}
        {!isLoading && (
          <div className="space-y-2 text-sm text-navy/80">
            <p>
              <strong>Produto-pai:</strong>{" "}
              {data?.produtoPai ?? <span className="text-terracotta">sem reconciliação — pede conferência</span>}
              {data?.produtoPaiStatusReconciliacao ? ` · ${data.produtoPaiStatusReconciliacao}` : ""}
            </p>
            <p>
              <strong>SKU do caso (técnico):</strong>{" "}
              {data?.sku ?? <span className="text-terracotta">não parametrizado</span>}
              {data?.skuOrigem ? ` · origem do parâmetro: ${data.skuOrigem}` : ""}
            </p>
            {data?.conflitoValor?.conflito ? (
              <div className="rounded border border-terracotta/40 bg-terracotta/10 p-2 text-xs text-terracotta">
                <p className="font-semibold">Conciliação proposta × preço homologado</p>
                <p className="mt-1">{data.conflitoValor.motivo}</p>
                <p className="mt-1 text-navy/70">
                  Proposta v{data?.proposta?.versao ?? "?"}: {moeda(data?.proposta?.valor, data?.proposta?.moeda ?? "BRL")} · SKU
                  homologado:{" "}
                  {preco?.ok ? moeda(preco.preco_total, preco.moeda ?? "BRL") : "—"}
                </p>
              </div>
            ) : null}
            {preco?.ok ? (
              <>
                <p>
                  <Selo tom="ok" texto="Preço homologado" />{" "}
                  {moeda(preco.preco_total, preco.moeda ?? "BRL")} · {preco.condicao_pagamento ?? "condição não informada"}
                  {preco.parcelas ? ` · ${preco.parcelas}x` : ""}
                </p>
                <p className="text-xs text-navy/60">
                  Fonte: {ROTULO_FONTE_PRECO[String(preco.fonte)] ?? preco.fonte}
                  {preco.excecao_valida_ate ? ` · exceção válida até ${preco.excecao_valida_ate}` : ""}
                  {fonteOficialDePreco(preco.fonte) ? "" : " (fonte não oficial — bloqueada)"}
                </p>
              </>
            ) : (
              <div className="rounded border border-terracotta/40 bg-terracotta/10 p-2 text-sm text-terracotta">
                <p>
                  {preco?.motivo ?? "SKU sem preço/condição homologados."} Valor, cobrança e checkout permanecem bloqueados.
                </p>
                {/*
                 * 05/09/2026 — CA-BLOQ-ADMIN-ALL-001, categoria autorizada de
                 * afrouxamento comercial: catálogo/preço não homologado nunca
                 * bloqueou por regra de integridade de dado, e sim por
                 * disciplina de processo interno — a própria tela já previa
                 * "exceção comercial aprovada" como fonte oficial de preço
                 * (sku_price_exceptions), mas nenhuma tela chamava essa
                 * gravação. Isto não muda preço de contrato já assinado nem
                 * apaga catálogo: cria uma exceção nova, com motivo,
                 * responsável e validade, exatamente como a regra já exigia.
                 */}
                {data?.sku ? (
                  abrirExcecao ? (
                    <div className="mt-2 space-y-2 rounded border border-terracotta/30 bg-white p-2 text-navy">
                      <label className="block text-xs">
                        Motivo (mínimo 15 caracteres)
                        <textarea
                          className="mt-0.5 w-full rounded border border-navy/20 p-1.5 text-sm"
                          rows={2}
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                        />
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="block text-xs">
                          Preço total (R$)
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="mt-0.5 w-full rounded border border-navy/20 p-1.5 text-sm"
                            value={precoTotal}
                            onChange={(e) => setPrecoTotal(e.target.value)}
                          />
                        </label>
                        <label className="block text-xs">
                          Condição de pagamento
                          <input
                            className="mt-0.5 w-full rounded border border-navy/20 p-1.5 text-sm"
                            value={condicaoPagamento}
                            onChange={(e) => setCondicaoPagamento(e.target.value)}
                          />
                        </label>
                      </div>
                      <label className="block text-xs">
                        Válida até
                        <input
                          type="date"
                          className="mt-0.5 w-full rounded border border-navy/20 p-1.5 text-sm"
                          value={validoAte}
                          onChange={(e) => setValidoAte(e.target.value)}
                        />
                      </label>
                      {erroExcecao ? <p className="text-xs text-terracotta">{erroExcecao}</p> : null}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={mExcecao.isPending}
                          onClick={() => data?.sku && mExcecao.mutate({ sku: data.sku })}
                          className="rounded bg-navy px-2 py-1 text-xs text-cream disabled:opacity-50"
                        >
                          {mExcecao.isPending ? "Registrando…" : "Confirmar exceção"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAbrirExcecao(false);
                            setErroExcecao(null);
                          }}
                          className="rounded border border-navy/15 px-2 py-1 text-xs text-navy"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAbrirExcecao(true)}
                      className="mt-2 rounded border border-terracotta/50 bg-white px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
                    >
                      Assumir exceção comercial
                    </button>
                  )
                ) : null}
              </div>
            )}
            <ul className="list-disc space-y-1 pl-5 text-xs text-navy/70">
              {REGRAS_PRECO_SKU.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {(data?.excecoes ?? []).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-navy">Exceções comerciais registradas</p>
                <ul className="mt-1 space-y-1 text-xs text-navy/70">
                  {data!.excecoes.map((e: Record<string, unknown>) => (
                    <li key={String(e.id)}>
                      {String(e.sku)} · {String(e.status)} · válida até {String(e.valido_ate)} · responsável{" "}
                      {String(e.responsavel)} · motivo: {String(e.motivo)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Painel>
    </div>
  );
}
