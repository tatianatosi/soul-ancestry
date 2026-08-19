import { useQuery } from "@tanstack/react-query";
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
import { conferirRegraComercial } from "@/lib/regra-comercial.functions";

function faixa(d: Despesa) {
  if (d.estimativa_min == null && d.estimativa_max == null) return "estimativa não registrada";
  if (d.estimativa_min != null && d.estimativa_max != null && d.estimativa_min !== d.estimativa_max) {
    return `${moeda(d.estimativa_min, d.moeda)} a ${moeda(d.estimativa_max, d.moeda)}`;
  }
  return moeda(d.estimativa_min ?? d.estimativa_max, d.moeda);
}

export function RegraComercial({ caseId }: { caseId: string }) {
  const conferir = useServerFn(conferirRegraComercial);
  const { data, isLoading } = useQuery({
    queryKey: ["regra-comercial", caseId],
    queryFn: () => conferir({ data: { caseId } }),
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
          {!isLoading && despesas.length === 0 && (
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
                  <Selo tom={pend.length ? "alerta" : "ok"}>
                    {ROTULO_ESTADO_DESPESA[d.estado as EstadoDespesa] ?? d.estado}
                  </Selo>
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

      <Painel titulo="Preço e condição do SKU — Planilha Mestre">
        {isLoading && <p className="text-sm text-navy/60">Conferindo…</p>}
        {!isLoading && (
          <div className="space-y-2 text-sm text-navy/80">
            <p>
              <strong>SKU do caso:</strong> {data?.sku ?? <span className="text-terracotta">não parametrizado</span>}
              {data?.skuOrigem ? ` · origem do parâmetro: ${data.skuOrigem}` : ""}
            </p>
            {preco?.ok ? (
              <>
                <p>
                  <Selo tom="ok">Preço homologado</Selo>{" "}
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
              <p className="rounded border border-terracotta/40 bg-terracotta/10 p-2 text-sm text-terracotta">
                {preco?.motivo ?? "SKU sem preço/condição homologados."} Valor, cobrança e checkout permanecem bloqueados.
              </p>
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
