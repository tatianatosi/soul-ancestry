import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import {
  Campo,
  FiltroStatus,
  Gaveta,
  Historico,
  Painel,
  ROTULO_CONCILIACAO,
  ROTULO_FATURA,
  ROTULO_PAGAMENTO,
  Selo,
  dataBr,
  inputCls,
  moeda,
} from "@/components/comercial/base";
import { FLUXO } from "@/lib/comercial-fluxo";
import {
  cac,
  cpl,
  formatarIndicador,
  previsoesControladas,
  resultadoCaixa,
  roi,
  type EntradaFinanceira,
} from "@/lib/indicadores-marketing";
import {
  conciliarPagamento,
  listarAjustes,
  listarComercial,
  listarVinculos,
  registrarAjusteFatura,
  salvarFatura,
  salvarPagamento,
} from "@/lib/comercial.functions";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Clube Ancestral" },
      { name: "description", content: "Faturas, pagamentos e conciliação com trilha de auditoria." },
      { property: "og:title", content: "Financeiro — Clube Ancestral" },
      { property: "og:description", content: "Faturas e pagamentos do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinanceiroPage,
});

type Linha = Record<string, unknown>;
type Aba = "faturas" | "pagamentos";

function FinanceiroPage() {
  const { podeFinanceiro } = useSaas();
  const queryClient = useQueryClient();
  const listar = useServerFn(listarComercial);
  const vinculos = useServerFn(listarVinculos);
  const salvarF = useServerFn(salvarFatura);
  const salvarP = useServerFn(salvarPagamento);
  const conciliar = useServerFn(conciliarPagamento);
  const ajustar = useServerFn(registrarAjusteFatura);
  const ajustes = useServerFn(listarAjustes);

  const [aba, setAba] = useState<Aba>("faturas");
  const [status, setStatus] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ajuste, setAjuste] = useState({ valor: "", motivo: "" });
  const [conc, setConc] = useState({ data: "", valor: "", referencia: "" });
  const [realidadeAberta, setRealidadeAberta] = useState(true);
  const [incluirDemos, setIncluirDemos] = useState(false);

  const recurso = aba === "faturas" ? "invoices" : "payments";
  const q = useQuery({
    queryKey: ["financeiro", recurso, status, incluirDemos],
    queryFn: () => listar({ data: { recurso, status: status || undefined, incluirDemos } }),
    enabled: podeFinanceiro,
  });
  const qFaturas = useQuery({
    queryKey: ["financeiro", "invoices", ""],
    queryFn: () => listar({ data: { recurso: "invoices" } }),
    enabled: podeFinanceiro,
  });
  const qPagamentos = useQuery({
    queryKey: ["financeiro", "payments", ""],
    queryFn: () => listar({ data: { recurso: "payments" } }),
    enabled: podeFinanceiro,
  });
  const qv = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => vinculos({}), enabled: podeFinanceiro });
  const qAjustes = useQuery({
    queryKey: ["ajustes"],
    queryFn: () => ajustes({}),
    enabled: aba === "faturas" && Boolean(detalhe?.["id"]),
  });

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["financeiro"] });
    void queryClient.invalidateQueries({ queryKey: ["ajustes"] });
    void queryClient.invalidateQueries({ queryKey: ["historico"] });
  };

  const mSalvar = useMutation({
    mutationFn: (v: { id?: string; dados: Record<string, unknown> }) =>
      aba === "faturas" ? salvarF({ data: v }) : salvarP({ data: v }),
    onSuccess: () => {
      setForm(null);
      setErro(null);
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mConciliar = useMutation({
    mutationFn: (v: { id: string; pago_em: string; valor: number; referencia_externa: string }) =>
      conciliar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setConc({ data: "", valor: "", referencia: "" });
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mAjuste = useMutation({
    mutationFn: (v: { invoice_id: string; valor: number; motivo: string }) => ajustar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setAjuste({ valor: "", motivo: "" });
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  if (!podeFinanceiro) {
    return (
      <SaasShell titulo="Financeiro" descricao="Faturas, pagamentos e conciliação.">
        <EstadoVazio mensagem="Seu papel não inclui acesso financeiro. Solicite a um admin da sua organização." />
      </SaasShell>
    );
  }

  const clientes = qv.data?.clientes ?? [];
  const casos = qv.data?.casos ?? [];
  const faturas = (qFaturas.data ?? []) as Linha[];
  const linhas = (q.data ?? []) as Linha[];
  const nomeCliente = (id: unknown) => clientes.find((c) => c.id === id)?.nome ?? "—";
  const rotuloFatura = (id: unknown) => {
    const f = faturas.find((x) => x["id"] === id);
    return f ? `${String(f["descricao"] ?? f["numero"] ?? "Fatura")} — ${moeda(f["valor"], f["moeda"])}` : "—";
  };
  const rotulos = aba === "faturas" ? ROTULO_FATURA : ROTULO_PAGAMENTO;

  const pagamentos = (qPagamentos.data ?? []) as Linha[];
  const soma = (rows: Linha[], filtro: (l: Linha) => boolean) =>
    rows.filter(filtro).reduce((t, l) => t + (Number(l["valor"]) || 0), 0);
  const recebida = soma(pagamentos, (l) => l["status"] === "confirmado" && Boolean(l["pago_em"]));
  const contratada = soma(faturas, (l) => l["status"] !== "cancelada");
  const pendentes = soma(faturas, (l) => l["status"] === "emitida" || l["status"] === "enviada");
  const vencidas = soma(faturas, (l) => l["status"] === "vencida");
  const base: EntradaFinanceira = {
    receita_recebida: qPagamentos.isLoading ? null : recebida,
    receita_contratada: contratada,
    cobrancas_pendentes: pendentes,
    cobrancas_vencidas: vencidas,
  };
  const previsoes = previsoesControladas({ contratada_nao_recebida: Math.max(contratada - recebida, 0) });

  return (
    <SaasShell
      titulo="Financeiro"
      descricao="Faturas, pagamentos e conciliação. Toda alteração é auditada."
      acoes={
        <button
          onClick={() => {
            setErro(null);
            setForm({ moeda: "BRL" });
          }}
          className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
        >
          {aba === "faturas" ? "Nova fatura" : "Novo pagamento"}
        </button>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["faturas", "pagamentos"] as Aba[]).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAba(a);
                setStatus("");
                setDetalhe(null);
              }}
              className={
                a === aba
                  ? "rounded-lg bg-navy px-3 py-2 text-sm text-cream"
                  : "rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70"
              }
            >
              {a === "faturas" ? "Faturas" : "Pagamentos"}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-navy/10 bg-white p-4">
          <button
            type="button"
            onClick={() => setRealidadeAberta((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-navy">Realidade financeira do Clube Ancestral</span>
            <span className="text-xs text-navy/50">{realidadeAberta ? "recolher" : "expandir"}</span>
          </button>
          <p className="mt-1 text-xs text-navy/55">
            Receita recebida nunca é somada à contratada, previsão não vira caixa e despesa paga diretamente pelo cliente ao terceiro
            não entra como custo do Clube. Indicador sem base declarada aparece como “Sem dados suficientes”.
          </p>
          <p className="mt-1 text-[11px] text-navy/50">
            Recorte único: caixa, previsão e eficiência de mídia usam o mesmo período de apuração (mês corrente). Mídia e aquisição
            não são lidas em janela própria.
          </p>
          {realidadeAberta ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-navy/15 bg-cream/50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  1 · Caixa realizado — dinheiro que entrou e saiu
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      rotulo: "Receita recebida",
                      valor: formatarIndicador(
                        base.receita_recebida === null
                          ? { estado: "sem_dados", motivo: "" }
                          : { estado: "ok", valor: recebida, unidade: "moeda" },
                      ),
                    },
                    { rotulo: "Investimento em mídia", valor: formatarIndicador(base.investimento_midia == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.investimento_midia, unidade: "moeda" }) },
                    { rotulo: "Despesas operacionais", valor: formatarIndicador(base.despesas_operacionais == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.despesas_operacionais, unidade: "moeda" }) },
                  ].map((c) => (
                    <div key={c.rotulo} className="rounded border border-navy/10 bg-white p-3">
                      <p className="text-[11px] uppercase tracking-wide text-navy/45">{c.rotulo}</p>
                      <p className="mt-1 text-sm font-medium text-navy">{c.valor}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 rounded border border-navy/15 bg-white px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Resultado de caixa do período</p>
                  <p className="font-serif text-xl text-navy">{formatarIndicador(resultadoCaixa(base))}</p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-navy/25 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  2 · Em aberto e previsão — ainda não é caixa
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-navy/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-navy/45">Cobranças pendentes</p>
                    <p className="mt-1 text-sm text-navy/75">{moeda(pendentes, "BRL")}</p>
                  </div>
                  <div className="rounded border border-terracotta/30 bg-terracotta/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-navy/45">Cobranças vencidas</p>
                    <p className="mt-1 text-sm text-terracotta">{moeda(vencidas, "BRL")}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-navy/65">
                  {previsoes.map((p) => (
                    <li key={p.chave}>
                      • {p.rotulo}: <strong>{formatarIndicador(p.valor)}</strong> — não conta como receita.
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  3 · Eficiência de mídia — mesmo período do caixa, exige atribuição declarada
                </p>
                <div className="mt-2 grid gap-2 text-[11px] sm:grid-cols-5">
                  {[
                    { rotulo: "Quanto investimos", valor: formatarIndicador(base.investimento_midia == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.investimento_midia, unidade: "moeda" }) },
                    { rotulo: "Quantos chegaram", valor: formatarIndicador(base.leads_atribuiveis == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.leads_atribuiveis, unidade: "numero" }) },
                    { rotulo: "Quantos fizeram Discovery", valor: "Sem dados suficientes" },
                    { rotulo: "Quantos pagaram", valor: formatarIndicador(base.pagamentos_atribuiveis == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.pagamentos_atribuiveis, unidade: "numero" }) },
                    { rotulo: "Quanto entrou", valor: formatarIndicador(base.receita_recebida == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: recebida, unidade: "moeda" }) },
                  ].map((c) => (
                    <div key={c.rotulo} className="rounded border border-navy/10 bg-cream/40 p-2">
                      <p className="uppercase tracking-wide text-navy/45">{c.rotulo}</p>
                      <p className="mt-0.5 text-navy/75">{c.valor}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    { rotulo: "CPL", valor: formatarIndicador(cpl(base)) },
                    { rotulo: "CAC", valor: formatarIndicador(cac(base)) },
                    { rotulo: "ROI de mídia", valor: formatarIndicador(roi(base)) },
                  ].map((c) => (
                    <div key={c.rotulo} className="rounded border border-navy/10 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-navy/45">{c.rotulo}</p>
                      <p className="mt-1 text-sm text-navy/70">{c.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <FiltroStatus rotulos={rotulos} valor={status} aoMudar={setStatus} />

        {erro ? (
          <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            Ação bloqueada: {erro}
          </p>
        ) : null}

        {q.isLoading ? (
          <EstadoVazio mensagem="Carregando…" />
        ) : !linhas.length ? (
          <EstadoVazio mensagem="Nenhum registro neste filtro." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Descrição" : "Fatura"}</th>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Cliente" : "Referência"}</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Vencimento" : "Data"}</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={String(l["id"])} className="border-t border-navy/5">
                    <td className="px-4 py-3">
                      {aba === "faturas" ? String(l["descricao"] ?? "—") : rotuloFatura(l["invoice_id"])}
                    </td>
                    <td className="px-4 py-3">
                      {aba === "faturas" ? nomeCliente(l["client_id"]) : String(l["referencia_externa"] ?? "—")}
                    </td>
                    <td className="px-4 py-3">{moeda(l["valor"], l["moeda"])}</td>
                    <td className="px-4 py-3">{dataBr(l[aba === "faturas" ? "vencimento" : "pago_em"])}</td>
                    <td className="px-4 py-3 space-x-1">
                      <Selo
                        texto={rotulos[String(l["status"])] ?? String(l["status"])}
                        tom={
                          l["status"] === "paga" || l["status"] === "confirmado"
                            ? "ok"
                            : l["status"] === "vencida" || l["status"] === "cancelada"
                              ? "alerta"
                              : "neutro"
                        }
                      />
                      {aba === "pagamentos" ? (
                        <Selo
                          texto={ROTULO_CONCILIACAO[String(l["conciliacao_status"])] ?? String(l["conciliacao_status"] ?? "—")}
                          tom={
                            l["conciliacao_status"] === "conciliado"
                              ? "ok"
                              : l["conciliacao_status"] === "divergente"
                                ? "erro"
                                : "neutro"
                          }
                        />
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setErro(null);
                          setDetalhe(l);
                        }}
                        className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                      >
                        Detalhe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalhe ? (
        <Gaveta titulo={aba === "faturas" ? "Fatura" : "Pagamento"} aoFechar={() => setDetalhe(null)}>
          <Painel titulo="Resumo">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-navy/60">Valor</dt>
                <dd>{moeda(detalhe["valor"], detalhe["moeda"])}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Status</dt>
                <dd>{rotulos[String(detalhe["status"])] ?? String(detalhe["status"])}</dd>
              </div>
              {aba === "faturas" ? (
                <>
                  <div>
                    <dt className="text-navy/60">Cliente</dt>
                    <dd>{nomeCliente(detalhe["client_id"])}</dd>
                  </div>
                  <div>
                    <dt className="text-navy/60">Valor já pago</dt>
                    <dd>{moeda(detalhe["valor_pago"] ?? 0, detalhe["moeda"])}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-navy/60">Fatura</dt>
                    <dd>{rotuloFatura(detalhe["invoice_id"])}</dd>
                  </div>
                  <div>
                    <dt className="text-navy/60">Conciliação</dt>
                    <dd>{ROTULO_CONCILIACAO[String(detalhe["conciliacao_status"])] ?? "—"}</dd>
                  </div>
                </>
              )}
            </dl>
          </Painel>

          {aba === "faturas" ? (
            <>
              <Painel titulo="Mover status">
                <div className="flex flex-wrap gap-2">
                  {(FLUXO["invoices"]?.[String(detalhe["status"])] ?? []).map((destino) => (
                    <button
                      key={destino}
                      disabled={mSalvar.isPending}
                      onClick={() =>
                        mSalvar.mutate({ id: String(detalhe["id"]), dados: { status: destino } })
                      }
                      className="rounded-lg border border-navy/20 px-3 py-2 text-sm hover:bg-navy/5"
                    >
                      {ROTULO_FATURA[destino] ?? destino}
                    </button>
                  ))}
                </div>
              </Painel>

              <Painel titulo="Ajuste de valor (fatura paga)">
                <p className="mb-3 text-xs text-navy/60">
                  Fatura paga não tem o valor editado. Registre um ajuste separado, com motivo e autoria.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo rotulo="Valor do ajuste">
                    <input
                      type="number"
                      className={inputCls}
                      value={ajuste.valor}
                      onChange={(e) => setAjuste({ ...ajuste, valor: e.target.value })}
                    />
                  </Campo>
                  <Campo rotulo="Motivo">
                    <input
                      className={inputCls}
                      value={ajuste.motivo}
                      onChange={(e) => setAjuste({ ...ajuste, motivo: e.target.value })}
                    />
                  </Campo>
                </div>
                <button
                  disabled={mAjuste.isPending}
                  onClick={() =>
                    mAjuste.mutate({
                      invoice_id: String(detalhe["id"]),
                      valor: Number(ajuste.valor),
                      motivo: ajuste.motivo,
                    })
                  }
                  className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                >
                  Registrar ajuste
                </button>
                <ul className="mt-4 space-y-2 text-sm">
                  {((qAjustes.data ?? []) as Linha[])
                    .filter((a) => a["invoice_id"] === detalhe["id"])
                    .map((a) => (
                    <li key={String(a["id"])} className="rounded-lg border border-navy/10 px-3 py-2">
                      {moeda(a["valor"], detalhe["moeda"])} — {String(a["motivo"] ?? "")}{" "}
                      <span className="text-navy/50">{dataBr(a["created_at"])}</span>
                    </li>
                  ))}
                </ul>
              </Painel>
            </>
          ) : (
            <Painel titulo="Conciliar pagamento">
              <p className="mb-3 text-xs text-navy/60">
                Conciliação exige data, valor e referência. Valor diferente da fatura marca divergente e derruba o
                check de pagamento confirmado do caso.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo rotulo="Data">
                  <input
                    type="date"
                    className={inputCls}
                    value={conc.data}
                    onChange={(e) => setConc({ ...conc, data: e.target.value })}
                  />
                </Campo>
                <Campo rotulo="Valor">
                  <input
                    type="number"
                    className={inputCls}
                    value={conc.valor}
                    onChange={(e) => setConc({ ...conc, valor: e.target.value })}
                  />
                </Campo>
                <Campo rotulo="Referência externa">
                  <input
                    className={inputCls}
                    value={conc.referencia}
                    onChange={(e) => setConc({ ...conc, referencia: e.target.value })}
                  />
                </Campo>
              </div>
              <button
                disabled={mConciliar.isPending}
                onClick={() =>
                  mConciliar.mutate({
                    id: String(detalhe["id"]),
                    pago_em: conc.data,
                    valor: Number(conc.valor),
                    referencia_externa: conc.referencia,
                  })
                }
                className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
              >
                Conciliar
              </button>
            </Painel>
          )}

          <Painel titulo="Histórico">
            <Historico entidade={recurso} id={String(detalhe["id"])} />
          </Painel>
        </Gaveta>
      ) : null}

      {form ? (
        <Gaveta titulo={aba === "faturas" ? "Nova fatura" : "Novo pagamento"} aoFechar={() => setForm(null)}>
          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
          {aba === "faturas" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Cliente *">
                <select
                  className={inputCls}
                  value={form["client_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Selecione…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Caso (opcional)">
                <select
                  className={inputCls}
                  value={form["case_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                >
                  <option value="">Sem vínculo</option>
                  {casos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo ?? c.titulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Descrição">
                <input
                  className={inputCls}
                  value={form["descricao"] ?? ""}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Valor">
                <input
                  type="number"
                  className={inputCls}
                  value={form["valor"] ?? ""}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Moeda">
                <select
                  className={inputCls}
                  value={form["moeda"] ?? "BRL"}
                  onChange={(e) => setForm({ ...form, moeda: e.target.value })}
                >
                  {["BRL", "EUR", "USD"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Vencimento">
                <input
                  type="date"
                  className={inputCls}
                  value={form["vencimento"] ?? ""}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                />
              </Campo>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Fatura *">
                <select
                  className={inputCls}
                  value={form["invoice_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
                >
                  <option value="">Selecione…</option>
                  {faturas.map((f) => (
                    <option key={String(f["id"])} value={String(f["id"])}>
                      {String(f["descricao"] ?? f["id"])} — {moeda(f["valor"], f["moeda"])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Valor">
                <input
                  type="number"
                  className={inputCls}
                  value={form["valor"] ?? ""}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Data do pagamento">
                <input
                  type="date"
                  className={inputCls}
                  value={form["pago_em"] ?? ""}
                  onChange={(e) => setForm({ ...form, pago_em: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Referência externa">
                <input
                  className={inputCls}
                  value={form["referencia_externa"] ?? ""}
                  onChange={(e) => setForm({ ...form, referencia_externa: e.target.value })}
                />
              </Campo>
            </div>
          )}
          <button
            disabled={mSalvar.isPending}
            onClick={() => {
              const { id, ...dados } = form;
              mSalvar.mutate({ id: id || undefined, dados });
            }}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
          >
            Salvar
          </button>
        </Gaveta>
      ) : null}
    </SaasShell>
  );
}
