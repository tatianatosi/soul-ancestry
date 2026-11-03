import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import {
  Campo,
  FiltroStatus,
  Gaveta,
  Historico,
  ROTULO_ORDEM,
  Selo,
  dataBr,
  inputCls,
} from "@/components/comercial/base";
import { FLUXO } from "@/lib/comercial-fluxo";
import { semFixtures } from "@/lib/fixtures";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  atualizarObservacaoOrdem,
  criarOrdemServico,
  listarComercial,
  listarVinculos,
  mudarStatusOrdem,
} from "@/lib/comercial.functions";

export const Route = createFileRoute("/_authenticated/ordens-servico")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>) => ({
    caseId: typeof s.caseId === "string" ? s.caseId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ordens de serviço — Clube Ancestral" },
      {
        name: "description",
        content: "Ordens de serviço vinculadas a caso e contrato assinado, com estados controlados.",
      },
      { property: "og:title", content: "Ordens de serviço — Clube Ancestral" },
      { property: "og:description", content: "Execução operacional autorizada por contrato." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdensPage,
});

type Linha = Record<string, unknown>;

function OrdensPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_os_anexos_previa" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const { caseId } = Route.useSearch();
  const queryClient = useQueryClient();
  const listar = useServerFn(listarComercial);
  const vinculos = useServerFn(listarVinculos);
  const criar = useServerFn(criarOrdemServico);
  const mudar = useServerFn(mudarStatusOrdem);
  const atualizarObservacao = useServerFn(atualizarObservacaoOrdem);

  const [status, setStatus] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  const [observacao, setObservacao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [salvoPlanejamento, setSalvoPlanejamento] = useState(false);
  const [form, setForm] = useState<Record<string, string> | null>(caseId ? { case_id: caseId } : null);
  /*
   * F5 / sair da linha (09/10/2026). O form nasce com `case_id` quando a
   * rota recebe o caso: esse valor é estado inicial, não edição. Sujo é
   * qualquer OUTRO campo preenchido — senão a tela travaria ao abrir.
   */
  useAvisoEdicaoNaoSalva(
    form !== null &&
      Object.entries(form).some(([k, v]) => k !== "case_id" && String(v ?? "").trim() !== ""),
  );
  const [erro, setErro] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["ordens", status],
    queryFn: () => listar({ data: { recurso: "service_orders", status: status || undefined } }),
  });
  const qv = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => vinculos({}) });
  const linhasDoCase = caseId ? ((q.data ?? []) as Linha[]).filter((l) => l["case_id"] === caseId) : null;

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["ordens"] });
    void queryClient.invalidateQueries({ queryKey: ["historico"] });
  };

  const mCriar = useMutation({
    mutationFn: (v: { contract_id: string; case_id: string; scope_summary: string }) => criar({ data: v }),
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
  const mObservacao = useMutation({
    mutationFn: (v: { id: string; scope_summary: string }) => atualizarObservacao({ data: v }),
    onSuccess: () => {
      setErro(null);
      setSalvo(true);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mPlanejamento = useMutation({
    mutationFn: (v: { id: string; responsible_user_id: string | null; start_date: string | null; end_date: string | null }) =>
      atualizarObservacao({ data: v }),
    onSuccess: () => {
      setErro(null);
      setSalvoPlanejamento(true);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const contratos = qv.data?.contratos ?? [];
  const casos = qv.data?.casos ?? [];
  const equipe = qv.data?.equipe ?? [];
  const rotuloResponsavel = (id: unknown) => equipe.find((m) => m.authUserId === id)?.nome ?? "—";
  const vinculosIndisponiveis = !qv.isLoading && (Boolean(qv.error) || qv.data === undefined);
  const linhas = linhasDoCase ?? ((q.data ?? []) as Linha[]);
  const rotuloCaso = (id: unknown) => {
    const c = casos.find((x) => x.id === id);
    return c ? (c.codigo ?? c.titulo) : "—";
  };
  const rotuloContrato = (id: unknown) => contratos.find((c) => c.id === id)?.contract_number ?? "—";
  // V4-05: contagem real das ordens já listadas (respeita filtro/caso); sem leitura, traço.
  const kpi = (n: number) => (q.isLoading ? "…" : q.error || q.data === undefined ? "—" : String(n));
  const contarStatus = (...st: string[]) => linhas.filter((l) => st.includes(String(l["status"]))).length;

  return (
    <SaasShell
      titulo="Ordens de serviço"
      descricao={
        caseId
          ? `Mostrando só as ordens do caso ${rotuloCaso(caseId)}.`
          : "Execução só começa com caso vinculado e contrato assinado (ou exceção aprovada)."
      }
      acoes={
        (
          <button
            onClick={() => {
              setErro(null);
              setForm(caseId ? { case_id: caseId } : {});
            }}
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
          >
            Nova ordem
          </button>
        )
      }
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" data-ordens-kpis-v4>
        <Indicador rotulo="Ordens" valor={kpi(linhas.length)} apoio={caseId ? "deste caso" : "conforme o filtro"} />
        <Indicador rotulo="Aguardando aprovação" valor={kpi(contarStatus("draft", "pending_approval"))} />
        <Indicador rotulo="Em execução" valor={kpi(contarStatus("active"))} />
        <Indicador rotulo="Concluídas" valor={kpi(contarStatus("completed"))} />
      </div>
      <div className="space-y-4">
        {!caseId && <FiltroStatus rotulos={ROTULO_ORDEM} valor={status} aoMudar={setStatus} />}
        {erro ? (
          <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            Ação bloqueada: {erro}
          </p>
        ) : null}

        {vinculosIndisponiveis ? (
          <p
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
          >
            Não foi possível carregar contratos e casos vinculados. Os nomes exibidos e as listas de seleção
            estão vazios por falha de leitura, não por ausência de cadastro.
            <button
              type="button"
              onClick={() => void qv.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}

        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data as Linha[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as ordens de serviço"
          vazio="Nenhuma ordem de serviço cadastrada ainda."
        >
          {() =>
          !linhas.length ? (
          <EstadoVazio mensagem="Nenhuma ordem de serviço neste filtro." />
        ) : (
          <CaCard titulo="Ordens de serviço" className="overflow-hidden">
          <div className="-mx-4 overflow-x-auto sm:-mx-5">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Número</th>
                  <th className="px-4 py-3 font-medium">Caso</th>
                  <th className="px-4 py-3 font-medium">Contrato</th>
                  <th className="px-4 py-3 font-medium">Início</th>
                  <th className="px-4 py-3 font-medium">Responsável</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={String(l["id"])} className="border-t border-navy/5">
                    <td className="px-4 py-3">{String(l["service_order_number"] ?? "—")}</td>
                    <td className="px-4 py-3">{rotuloCaso(l["case_id"])}</td>
                    <td className="px-4 py-3">{rotuloContrato(l["contract_id"])}</td>
                    <td className="px-4 py-3">{dataBr(l["start_date"])}</td>
                    <td className="px-4 py-3">{rotuloResponsavel(l["responsible_user_id"])}</td>
                    <td className="px-4 py-3">
                      <Selo
                        texto={ROTULO_ORDEM[String(l["status"])] ?? String(l["status"])}
                        tom={l["status"] === "active" ? "ok" : l["status"] === "cancelled" ? "alerta" : "neutro"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setErro(null);
                          setSalvo(false);
                          setSalvoPlanejamento(false);
                          setObservacao(String(l["scope_summary"] ?? ""));
                          setResponsavel(String(l["responsible_user_id"] ?? ""));
                          setDataInicio(String(l["start_date"] ?? "").slice(0, 10));
                          setDataFim(String(l["end_date"] ?? "").slice(0, 10));
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
          </CaCard>
        )
          }
        </EstadoDados>
      </div>

      {detalhe ? (
        <Gaveta titulo={`OS ${String(detalhe["service_order_number"] ?? "")}`} aoFechar={() => setDetalhe(null)}>
          <CaCard variante="compacto" titulo="Resumo">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-navy/60">Caso</dt>
                <dd>{rotuloCaso(detalhe["case_id"])}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Contrato</dt>
                <dd>{rotuloContrato(detalhe["contract_id"])}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy/60">Condição de início</dt>
                <dd>{String(detalhe["start_condition_status"] ?? "—")}</dd>
              </div>
            </dl>
          </CaCard>

          {(
            <CaCard variante="compacto" titulo="Escopo / observação">
              <textarea
                rows={4}
                className={inputCls}
                value={observacao}
                onChange={(e) => {
                  setObservacao(e.target.value);
                  setSalvo(false);
                }}
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  disabled={mObservacao.isPending}
                  onClick={() => mObservacao.mutate({ id: String(detalhe["id"]), scope_summary: observacao })}
                  className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                >
                  Salvar
                </button>
                {salvo ? <span className="text-xs text-navy/60">Salvo.</span> : null}
              </div>
            </CaCard>
          )}

          {(
            <CaCard variante="compacto" titulo="Planejamento (responsável, início, prazo)">
              <div className="grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-navy/60">
                  Responsável
                  <select
                    className={inputCls}
                    value={responsavel}
                    onChange={(e) => {
                      setResponsavel(e.target.value);
                      setSalvoPlanejamento(false);
                    }}
                  >
                    <option value="">Sem responsável definido</option>
                    {equipe.map((m) => (
                      <option key={m.authUserId} value={m.authUserId}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-navy/60">
                  Início
                  <input
                    type="date"
                    className={inputCls}
                    value={dataInicio}
                    onChange={(e) => {
                      setDataInicio(e.target.value);
                      setSalvoPlanejamento(false);
                    }}
                  />
                </label>
                <label className="text-xs text-navy/60">
                  Prazo
                  <input
                    type="date"
                    className={inputCls}
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setSalvoPlanejamento(false);
                    }}
                  />
                </label>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  disabled={mPlanejamento.isPending}
                  onClick={() =>
                    mPlanejamento.mutate({
                      id: String(detalhe["id"]),
                      responsible_user_id: responsavel || null,
                      start_date: dataInicio || null,
                      end_date: dataFim || null,
                    })
                  }
                  className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                >
                  Salvar
                </button>
                {salvoPlanejamento ? <span className="text-xs text-navy/60">Salvo.</span> : null}
              </div>
              <p className="mt-2 text-xs text-navy/50">
                Dependências entre ordens de serviço ainda não existem como campo estruturado — dívida declarada,
                não inventada aqui.
              </p>
            </CaCard>
          )}

          {(
            <CaCard variante="compacto" titulo="Mover status">
              <div className="flex flex-wrap gap-2">
                {(FLUXO["service_orders"]?.[String(detalhe["status"])] ?? []).map((destino) => (
                  <button
                    key={destino}
                    disabled={mStatus.isPending}
                    onClick={() => mStatus.mutate({ id: String(detalhe["id"]), status: destino })}
                    className="rounded-lg border border-navy/20 px-3 py-2 text-sm hover:bg-navy/5"
                  >
                    {ROTULO_ORDEM[destino] ?? destino}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-navy/60">
                O banco recusa a execução sem contrato assinado ou exceção vigente e sem caso vinculado.
              </p>
            </CaCard>
          )}

          <CaCard variante="compacto" titulo="Histórico">
            <Historico entidade="service_orders" id={String(detalhe["id"])} />
          </CaCard>
        </Gaveta>
      ) : null}

      {form ? (
        <Gaveta titulo="Nova ordem de serviço" aoFechar={() => setForm(null)}>
          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
          <Campo rotulo="Contrato *">
            <select
              className={inputCls}
              value={form["contract_id"] ?? ""}
              onChange={(e) => setForm({ ...form, contract_id: e.target.value })}
            >
              <option value="">Selecione…</option>
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contract_number} — {c.title}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Caso *">
            <select
              className={inputCls}
              value={form["case_id"] ?? ""}
              onChange={(e) => setForm({ ...form, case_id: e.target.value })}
            >
              <option value="">Selecione…</option>
              {semFixtures(casos).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo ?? c.titulo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Escopo da ordem">
            <textarea
              rows={3}
              className={inputCls}
              value={form["scope_summary"] ?? ""}
              onChange={(e) => setForm({ ...form, scope_summary: e.target.value })}
            />
          </Campo>
          <button
            disabled={mCriar.isPending}
            onClick={() =>
              mCriar.mutate({
                contract_id: form["contract_id"] ?? "",
                case_id: form["case_id"] ?? "",
                scope_summary: form["scope_summary"] ?? "",
              })
            }
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
          >
            Criar em rascunho
          </button>
        </Gaveta>
      ) : null}
    </SaasShell>
  );
}
