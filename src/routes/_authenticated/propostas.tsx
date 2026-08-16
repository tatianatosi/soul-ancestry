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
  ROTULO_PROPOSTA,
  Selo,
  dataBr,
  inputCls,
  moeda,
} from "@/components/comercial/base";
import {
  arquivarComercial,
  listarComercial,
  listarVinculos,
  mudarStatusProposta,
  renovarValidadeProposta,
  salvarProposta,
} from "@/lib/comercial.functions";
import { FLUXO } from "@/lib/comercial-fluxo";

export const Route = createFileRoute("/_authenticated/propostas")({
  head: () => ({
    meta: [
      { title: "Propostas — Clube Ancestral" },
      { name: "description", content: "Versões de proposta, escopo, validade e aprovação controlada por cliente." },
      { property: "og:title", content: "Propostas — Clube Ancestral" },
      { property: "og:description", content: "Gestão de propostas comerciais do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PropostasPage,
});

type Linha = Record<string, unknown>;

function PropostasPage() {
  const { podeComercial } = useSaas();
  const queryClient = useQueryClient();
  const listar = useServerFn(listarComercial);
  const vinculos = useServerFn(listarVinculos);
  const salvar = useServerFn(salvarProposta);
  const mudar = useServerFn(mudarStatusProposta);
  const renovar = useServerFn(renovarValidadeProposta);
  const arquivar = useServerFn(arquivarComercial);

  const [status, setStatus] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [renovacao, setRenovacao] = useState({ validade: "", motivo: "" });

  const q = useQuery({
    queryKey: ["propostas", status],
    queryFn: () => listar({ data: { recurso: "proposals", status: status || undefined } }),
  });
  const qv = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => vinculos({}) });

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["propostas"] });
    void queryClient.invalidateQueries({ queryKey: ["historico"] });
  };

  const mSalvar = useMutation({
    mutationFn: (v: { id?: string; dados: Record<string, unknown> }) => salvar({ data: v }),
    onSuccess: () => {
      setForm(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mStatus = useMutation({
    mutationFn: (v: { id: string; status: string }) => mudar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mRenovar = useMutation({
    mutationFn: (v: { id: string; validade: string; motivo: string }) => renovar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setRenovacao({ validade: "", motivo: "" });
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mArquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) =>
      arquivar({ data: { recurso: "proposals", id: v.id, motivo: v.motivo } }),
    onSuccess: () => {
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const clientes = qv.data?.clientes ?? [];
  const casos = qv.data?.casos ?? [];
  const nomeCliente = (id: unknown) => clientes.find((c) => c.id === id)?.nome ?? "—";
  const linhas = (q.data ?? []) as Linha[];

  return (
    <SaasShell
      titulo="Propostas"
      descricao="Versões, escopo, condições e validade. Só uma proposta aprovada por cliente."
      acoes={
        podeComercial ? (
          <button
            onClick={() => {
              setErro(null);
              setForm({ moeda: "BRL" });
            }}
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
          >
            Nova proposta
          </button>
        ) : null
      }
    >
      <div className="space-y-4">
        <FiltroStatus rotulos={ROTULO_PROPOSTA} valor={status} aoMudar={setStatus} />

        {erro ? (
          <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            Ação bloqueada: {erro}
          </p>
        ) : null}

        {q.isLoading ? (
          <EstadoVazio mensagem="Carregando…" />
        ) : !linhas.length ? (
          <EstadoVazio mensagem="Nenhuma proposta neste filtro." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Versão</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Validade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => {
                  const vencida =
                    l["validade"] && new Date(String(l["validade"])) < new Date(new Date().toDateString());
                  return (
                    <tr key={String(l["id"])} className="border-t border-navy/5">
                      <td className="px-4 py-3">{nomeCliente(l["client_id"])}</td>
                      <td className="px-4 py-3">v{String(l["versao"] ?? 1)}</td>
                      <td className="px-4 py-3">{moeda(l["valor"], l["moeda"])}</td>
                      <td className="px-4 py-3">
                        {dataBr(l["validade"])} {vencida ? <Selo texto="vencida" tom="alerta" /> : null}
                      </td>
                      <td className="px-4 py-3">
                        <Selo
                          texto={ROTULO_PROPOSTA[String(l["status"])] ?? String(l["status"])}
                          tom={l["status"] === "aprovada" ? "ok" : l["status"] === "recusada" ? "alerta" : "neutro"}
                        />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detalhe ? (
        <Gaveta titulo={`Proposta v${String(detalhe["versao"] ?? 1)}`} aoFechar={() => setDetalhe(null)}>
          <Painel titulo="Resumo">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-navy/60">Cliente</dt>
                <dd>{nomeCliente(detalhe["client_id"])}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Valor</dt>
                <dd>{moeda(detalhe["valor"], detalhe["moeda"])}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Forma de pagamento</dt>
                <dd>{String(detalhe["forma_pagamento"] ?? "—")}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Validade</dt>
                <dd>{dataBr(detalhe["validade"])}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy/60">Escopo</dt>
                <dd className="whitespace-pre-wrap">{String(detalhe["escopo"] ?? "—")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy/60">Exclusões</dt>
                <dd className="whitespace-pre-wrap">{String(detalhe["exclusoes"] ?? "—")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy/60">Observações ao cliente</dt>
                <dd className="whitespace-pre-wrap">{String(detalhe["observacoes_cliente"] ?? "—")}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy/60">Observações internas (não vão ao cliente)</dt>
                <dd className="whitespace-pre-wrap">{String(detalhe["observacoes_internas"] ?? "—")}</dd>
              </div>
            </dl>
          </Painel>

          {podeComercial ? (
            <>
              <Painel titulo="Mover status">
                <div className="flex flex-wrap gap-2">
                  {(FLUXO["proposals"]?.[String(detalhe["status"])] ?? []).map((destino) => (
                    <button
                      key={destino}
                      disabled={mStatus.isPending}
                      onClick={() => mStatus.mutate({ id: String(detalhe["id"]), status: destino })}
                      className="rounded-lg border border-navy/20 px-3 py-2 text-sm hover:bg-navy/5"
                    >
                      {ROTULO_PROPOSTA[destino] ?? destino}
                    </button>
                  ))}
                  {!(FLUXO["proposals"]?.[String(detalhe["status"])] ?? []).length ? (
                    <p className="text-sm text-navy/60">Estado final: não há transições disponíveis.</p>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-navy/60">
                  Proposta vencida não pode ser aprovada sem renovação de validade registrada, e aprovar substitui
                  automaticamente a proposta aprovada anterior do mesmo cliente.
                </p>
              </Painel>

              <Painel titulo="Renovar validade">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo rotulo="Nova validade">
                    <input
                      type="date"
                      className={inputCls}
                      value={renovacao.validade}
                      onChange={(e) => setRenovacao({ ...renovacao, validade: e.target.value })}
                    />
                  </Campo>
                  <Campo rotulo="Motivo da renovação">
                    <input
                      className={inputCls}
                      value={renovacao.motivo}
                      onChange={(e) => setRenovacao({ ...renovacao, motivo: e.target.value })}
                    />
                  </Campo>
                </div>
                <button
                  disabled={mRenovar.isPending}
                  onClick={() =>
                    mRenovar.mutate({
                      id: String(detalhe["id"]),
                      validade: renovacao.validade,
                      motivo: renovacao.motivo,
                    })
                  }
                  className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                >
                  Registrar renovação
                </button>
              </Painel>

              <Painel titulo="Editar">
                <button
                  onClick={() => {
                    setForm({
                      id: String(detalhe["id"]),
                      client_id: String(detalhe["client_id"] ?? ""),
                      case_id: String(detalhe["case_id"] ?? ""),
                      valor: String(detalhe["valor"] ?? ""),
                      moeda: String(detalhe["moeda"] ?? "BRL"),
                      escopo: String(detalhe["escopo"] ?? ""),
                      exclusoes: String(detalhe["exclusoes"] ?? ""),
                      forma_pagamento: String(detalhe["forma_pagamento"] ?? ""),
                      validade: String(detalhe["validade"] ?? ""),
                      observacoes_cliente: String(detalhe["observacoes_cliente"] ?? ""),
                      observacoes_internas: String(detalhe["observacoes_internas"] ?? ""),
                    });
                    setDetalhe(null);
                  }}
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
                >
                  Editar campos
                </button>
                <button
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento (mínimo 5 caracteres)") ?? "";
                    if (motivo.trim().length >= 5) mArquivar.mutate({ id: String(detalhe["id"]), motivo });
                  }}
                  className="ml-2 rounded-lg border border-navy/20 px-3 py-2 text-sm"
                >
                  Arquivar
                </button>
              </Painel>
            </>
          ) : null}

          <Painel titulo="Histórico">
            <Historico entidade="proposals" id={String(detalhe["id"])} />
          </Painel>
        </Gaveta>
      ) : null}

      {form ? (
        <Gaveta titulo={form["id"] ? "Editar proposta" : "Nova proposta"} aoFechar={() => setForm(null)}>
          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
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
            <Campo rotulo="Forma de pagamento">
              <input
                className={inputCls}
                value={form["forma_pagamento"] ?? ""}
                onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
              />
            </Campo>
            <Campo rotulo="Validade">
              <input
                type="date"
                className={inputCls}
                value={form["validade"] ?? ""}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
              />
            </Campo>
          </div>
          <Campo rotulo="Escopo">
            <textarea
              rows={3}
              className={inputCls}
              value={form["escopo"] ?? ""}
              onChange={(e) => setForm({ ...form, escopo: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Exclusões">
            <textarea
              rows={3}
              className={inputCls}
              value={form["exclusoes"] ?? ""}
              onChange={(e) => setForm({ ...form, exclusoes: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Observações ao cliente">
            <textarea
              rows={2}
              className={inputCls}
              value={form["observacoes_cliente"] ?? ""}
              onChange={(e) => setForm({ ...form, observacoes_cliente: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Observações internas">
            <textarea
              rows={2}
              className={inputCls}
              value={form["observacoes_internas"] ?? ""}
              onChange={(e) => setForm({ ...form, observacoes_internas: e.target.value })}
            />
          </Campo>
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
