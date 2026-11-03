import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { listarContratos, obterContrato } from "@/lib/contratos.functions";
import { listarComercial } from "@/lib/comercial.functions";
import { condicaoComercialDoCaso } from "@/lib/condicao-comercial-caso.functions";
import { Selo, moeda } from "@/components/comercial/base";
import {
  alertasDoContrato,
  estadoPrazo,
  formatarDia,
  proximoVencimento,
  rotuloPrazo,
  type FaturaLida,
} from "@/lib/prazos-contratuais";

const TOM = { futuro: "ok", hoje: "alerta", expirado: "erro", sem_data: "neutro" } as const;

/** Prazos restantes de cada contrato do caso — somente leitura, sem envio ou cobrança. */
export function PrazosContratuaisCaso({ caseId }: { caseId: string }) {
  const lerContratos = useServerFn(listarContratos);
  const lerContrato = useServerFn(obterContrato);
  const lerComercial = useServerFn(listarComercial);
  const lerCondicao = useServerFn(condicaoComercialDoCaso);
  const [busca, setBusca] = useState("");

  const q = useQuery({
    queryKey: ["desk-prazos-contratuais", caseId],
    queryFn: async () => {
      const lista = await lerContratos({ data: {} });
      const doCaso = (lista.contratos as any[]).filter((c) => c.case_id === caseId && !c.archived_at);
      const detalhes = await Promise.all(doCaso.map((c) => lerContrato({ data: { id: c.id } })));
      const propostas = ((await lerComercial({ data: { recurso: "proposals" } })) as any[]).filter(
        (p) => p.case_id === caseId,
      );
      let faturas: FaturaLida[] | null = null;
      try {
        faturas = ((await lerComercial({ data: { recurso: "invoices" } })) as any[]).filter(
          (f) => f.case_id === caseId,
        );
      } catch {
        faturas = null; // papel sem acesso financeiro: ausência explícita
      }
      const condicao = await lerCondicao({ data: { caseId } }).then((r) => r.vigente).catch(() => null);
      return { contratos: doCaso, detalhes, propostas, faturas, condicao };
    },
  });

  const proposta = useMemo(() => {
    const ps = (q.data?.propostas ?? []).filter((p) => p.validade);
    ps.sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")));
    return ps[0] ?? null;
  }, [q.data]);

  const termo = busca.trim().toLowerCase();
  const itens = (q.data?.contratos ?? [])
    .map((c, i) => ({ c, d: q.data!.detalhes[i]?.contrato as any }))
    .filter(({ c }) => !termo || `${c.title ?? ""} ${c.contract_number ?? ""}`.toLowerCase().includes(termo));

  return (
    <section aria-labelledby="prazos-contratuais-titulo" className="mt-6 space-y-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="prazos-contratuais-titulo" className="font-display text-lg text-navy">Prazos contratuais</h3>
          <p className="text-xs text-muted-foreground">
            Alertas internos, sem envio ao cliente. Validade da proposta ≠ vigência do contrato.
          </p>
        </div>
        <label className="w-full text-xs sm:w-64">
          <span className="sr-only">Buscar contrato</span>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou número"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      {q.isLoading && <p className="text-sm text-muted-foreground">Carregando prazos…</p>}
      {q.isError && (
        <p className="text-sm text-terracotta">Não foi possível ler os contratos: {String((q.error as Error)?.message)}</p>
      )}
      {q.data && itens.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum contrato registrado para este caso.</p>
      )}

      <ul className="divide-y divide-border">
        {itens.map(({ c, d }) => {
          const faturas = q.data!.faturas?.filter((f) => !f.contract_id || f.contract_id === c.id) ?? null;
          const prox = faturas ? proximoVencimento(faturas) : null;
          const pagas = faturas?.filter((f) => f.paga_em).length ?? 0;
          const validade = proposta?.validade ?? null;
          const fim = d?.effective_end_date ?? null;
          const alertas = alertasDoContrato({ validadeProposta: validade, fimVigencia: fim, faturas: faturas ?? [] });
          const cond = q.data!.condicao;
          return (
            <li key={c.id} className="space-y-2 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link to="/contratos/$id" params={{ id: c.id }} className="min-w-0 font-medium text-navy underline-offset-2 hover:underline">
                  {c.title ?? "Contrato sem título"} {c.contract_number ? `· ${c.contract_number}` : ""}
                </Link>
                <Selo texto={`Situação: ${c.status ?? "Não registrado"}`} />
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Validade da proposta</dt>
                  <dd className="flex flex-wrap items-center gap-1">
                    {formatarDia(validade)} <Selo texto={rotuloPrazo(validade)} tom={TOM[estadoPrazo(validade)]} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Vigência do contrato</dt>
                  <dd className="flex flex-wrap items-center gap-1">
                    {d?.effective_start_date ? `${formatarDia(d.effective_start_date)} → ` : ""}
                    {formatarDia(fim)} <Selo texto={rotuloPrazo(fim)} tom={TOM[estadoPrazo(fim)]} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Próximo vencimento registrado</dt>
                  <dd className="flex flex-wrap items-center gap-1">
                    {faturas === null ? (
                      "Sem acesso financeiro"
                    ) : prox ? (
                      <>
                        {formatarDia(prox.vencimento)} · {moeda(prox.valor)}
                        <Selo texto={rotuloPrazo(prox.vencimento)} tom={TOM[estadoPrazo(prox.vencimento)]} />
                      </>
                    ) : (
                      "Nenhuma fatura registrada em aberto"
                    )}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Pagamentos confirmados: {faturas === null ? "Sem acesso" : pagas}
                {cond?.parcelas && cond?.valorParcela
                  ? ` · Condição prevista: ${cond.parcelas}× ${moeda(cond.valorParcela)} (previsão, não é débito)`
                  : " · Condição prevista: Não registrado"}
              </p>
              {alertas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {alertas.map((a) => (
                    <Selo key={a.texto} texto={a.texto} tom={a.tom} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Link to="/financeiro" className="text-xs text-navy underline">Abrir Financeiro</Link>
    </section>
  );
}
