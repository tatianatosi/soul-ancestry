import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { cn } from "@/lib/utils";
import { diasDesde, rotuloIdade, tomIdade } from "@/lib/idade-registro";
import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
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
  criarVersaoAjusteProposta,
  listarComercial,
  restaurarProposta,
  listarVinculos,
  mudarStatusProposta,
  renovarValidadeProposta,
  salvarProposta,
} from "@/lib/comercial.functions";
import { FLUXO } from "@/lib/comercial-fluxo";
import { CAT_ESTADO_PROPOSTA, CAT_FORMA_PAGAMENTO, CAT_MOTIVO_ARQUIVAMENTO } from "@/lib/parametros-catalogos";
import { RegraComercial } from "@/components/contrato/regra-comercial";

const AJUDA_PROPOSTA: Record<string, string> = Object.fromEntries(CAT_ESTADO_PROPOSTA.map((o) => [o.valor, o.ajuda ?? ""]));

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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_proposta_escopo_preco" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const queryClient = useQueryClient();
  const listar = useServerFn(listarComercial);
  const vinculos = useServerFn(listarVinculos);
  const salvar = useServerFn(salvarProposta);
  const mudar = useServerFn(mudarStatusProposta);
  const renovar = useServerFn(renovarValidadeProposta);
  const arquivar = useServerFn(arquivarComercial);
  const versionar = useServerFn(criarVersaoAjusteProposta);
  const restaurar = useServerFn(restaurarProposta);

  const [status, setStatus] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [renovacao, setRenovacao] = useState({ validade: "", motivo: "" });
  const [visao, setVisao] = useState<"ativas" | "todas" | "arquivadas">("ativas");
  const [busca, setBusca] = useState("");

  const q = useQuery({
    queryKey: ["propostas", status, visao],
    queryFn: () =>
      listar({
        data: {
          recurso: "proposals",
          status: status || undefined,
          apenasArquivados: visao === "arquivadas",
          incluirArquivados: visao === "todas",
        },
      }),
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
  const mVersionar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => versionar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mRestaurar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => restaurar({ data: v }),
    onSuccess: () => {
      setErro(null);
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
  const vinculosIndisponiveis = !qv.isLoading && (Boolean(qv.error) || qv.data === undefined);
  const nomeCliente = (id: unknown) => clientes.find((c) => c.id === id)?.nome ?? "—";
  const codigoCaso = (id: unknown) => {
    const c = casos.find((x) => x.id === id);
    return c ? `${c.codigo ?? ""} ${c.titulo}` : "";
  };
  const termo = busca.trim().toLowerCase();
  const linhas = ((q.data ?? []) as Linha[]).filter((l) => {
    if (!termo) return true;
    const alvo = [
      nomeCliente(l["client_id"]),
      codigoCaso(l["case_id"]),
      String(l["case_id"] ?? ""),
      String(l["id"] ?? ""),
    ]
      .join(" ")
      .toLowerCase();
    return alvo.includes(termo);
  });

  return (
    <SaasShell
      titulo="CRM Vivo — Propostas"
      descricao="A proposta comercial é montada no Canva. Aqui ficam versão, status, validade e o vínculo ao caso. A oferta canônica são os produtos-pai do planejador — não SKUs do protótipo Lovable."
      acoes={
        (
          <button
            onClick={() => {
              setErro(null);
              setForm({ moeda: "BRL" });
            }}
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
          >
            Registrar versão no Desk
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
      <div className="space-y-4">
        <div className="rounded-lg border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-navy/80">
          <p>
            <span className="font-medium text-navy">Fonte da proposta:</span> Canva (conteúdo
            comercial personalizado). No Desk, após o aceite, a formalização puxa escopo, entregas e
            anexos em{" "}
            <span className="font-medium">Casos 360 → Preparar contrato</span>. Produtos-pai do
            planejador universal:{" "}
            <Link to="/catalogo" className="font-medium text-navy underline underline-offset-2">
              Catálogo / produtos-pai
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FiltroStatus rotulos={ROTULO_PROPOSTA} valor={status} aoMudar={setStatus} />
          {(["ativas", "todas", "arquivadas"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVisao(v)}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                visao === v ? "border-navy bg-navy text-cream" : "border-navy/20 text-navy/80"
              }`}
            >
              {v === "ativas" ? "Ativas" : v === "todas" ? "Todas" : "Arquivadas"}
            </button>
          ))}
          <input
            className={`${inputCls} md:w-64`}
            value={busca}
            maxLength={120}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou case_id/código do caso"
          />
        </div>
        <p className="text-xs text-navy/60">
          Somente proposta ativa e aceita satisfaz o gate de geração contratual. Proposta arquivada ou substituída sai do filtro padrão
          Ativas, mas continua em Todas, Arquivadas e na busca — com conteúdo, versão, anexos, vínculo, autor, data e auditoria
          preservados, e apta a “Criar versão para ajuste”.
        </p>

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
            Não foi possível carregar clientes e casos vinculados. Nomes e listas de seleção estão vazios por
            falha de leitura, não por ausência de cadastro.
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
          recurso="as propostas"
          vazio="Nenhuma proposta cadastrada ainda."
        >
          {() =>
          !linhas.length ? (
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
                          title={AJUDA_PROPOSTA[String(l["status"])]}
                          texto={ROTULO_PROPOSTA[String(l["status"])] ?? String(l["status"])}
                          tom={l["status"] === "aprovada" ? "ok" : l["status"] === "recusada" ? "alerta" : "neutro"}
                        />
                        {(() => {
                          // Idade da proposta sem retorno: só para status ainda em aberto,
                          // calculada sobre a data de registro já persistida (created_at).
                          const emAberto = l["status"] !== "aprovada" && l["status"] !== "recusada" && l["status"] !== "substituida";
                          if (!emAberto) return null;
                          const dias = diasDesde(l["created_at"]);
                          const rotulo = rotuloIdade(dias);
                          if (!rotulo) return null;
                          return (
                            <span
                              className={cn(
                                "mt-1 block text-[11px]",
                                tomIdade(dias) === "alerta" ? "font-semibold text-terracotta" : "text-navy/55",
                              )}
                            >
                              {rotulo}
                            </span>
                          );
                        })()}
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
        )
          }
        </EstadoDados>
      </div>

      {detalhe ? (
        <Gaveta titulo={`Proposta v${String(detalhe["versao"] ?? 1)}`} aoFechar={() => setDetalhe(null)}>
          <Painel titulo="Resumo">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-navy/60">Cliente</dt>
                <dd>
                  {nomeCliente(detalhe["client_id"])}
                  {detalhe["client_id"] ? (
                    <Link
                      to="/pessoas/$clienteId"
                      params={{ clienteId: String(detalhe["client_id"]) }}
                      className="ml-2 text-xs text-navy underline underline-offset-4"
                    >
                      Ver perfil 360
                    </Link>
                  ) : null}
                </dd>
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

          {detalhe["case_id"] ? (
            <details className="rounded-xl border border-navy/15 bg-cream/40 p-3">
              <summary className="cursor-pointer text-sm font-medium text-navy">
                Conferência comercial legada (SKU) — não é a oferta canônica
              </summary>
              <p className="mt-2 text-xs text-navy/65">
                A oferta vigente são os produtos-pai do planejador. Este bloco permanece só para
                conferência de preço legado / despesas de terceiros; não substitui o Canva nem o
                catálogo.
              </p>
              <div className="mt-3">
                <RegraComercial caseId={String(detalhe["case_id"])} />
              </div>
              <p className="mt-3 text-xs">
                <Link
                  to="/casos/$caseId/contrato/preparar"
                  params={{ caseId: String(detalhe["case_id"]) }}
                  className="font-medium text-navy underline underline-offset-2"
                >
                  Abrir preparação contratual (Canva → parâmetros e anexos)
                </Link>
              </p>
            </details>
          ) : null}

          {(
            <>
              <Painel titulo="Mover status">
                <div className="flex flex-wrap gap-2">
                  {(FLUXO["proposals"]?.[String(detalhe["status"])] ?? []).map((destino) => (
                    <button
                      key={destino}
                      disabled={mStatus.isPending}
                      title={AJUDA_PROPOSTA[destino]}
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
                    const motivo = window.prompt(
                      `Motivo do arquivamento (opcional). Sugestões: ${CAT_MOTIVO_ARQUIVAMENTO.map((m) => m.rotulo).join(" · ")}`,
                    );
                    if (motivo !== null) mArquivar.mutate({ id: String(detalhe["id"]), motivo });
                  }}
                  className="ml-2 rounded-lg border border-navy/20 px-3 py-2 text-sm"
                >
                  Arquivar
                </button>
                {detalhe["archived_at"] ? (
                  <button
                    onClick={() => {
                      const motivo = window.prompt("Motivo da restauração (opcional)");
                      if (motivo !== null) mRestaurar.mutate({ id: String(detalhe["id"]), motivo });
                    }}
                    className="ml-2 rounded-lg border border-gold/60 px-3 py-2 text-sm text-navy"
                  >
                    Restaurar
                  </button>
                ) : null}
              </Painel>

              <Painel titulo="Criar versão para ajuste">
                <p className="text-sm text-navy/70">
                  Duplica esta proposta como rascunho editável. Nada é excluído: a versão anterior permanece no histórico e deixa de
                  valer para gerar contrato.
                  {detalhe["archived_at"]
                    ? " Proposta arquivada continua arquivada e recuperável — o ajuste nasce como rascunho novo."
                    : " A proposta atual é marcada como substituída."}
                </p>
                <div className="mt-3">
                  <AcaoOperacional
                    rotulo="Criar versão para ajuste"
                    size="sm"
                    capacidade="criar_versao_derivada"
                    pendenciaGate={
                      String(detalhe["status"]) === "substituida"
                        ? "Esta proposta já foi substituída: o ajuste nasce como rascunho derivado de uma versão que não vale mais."
                        : null
                    }
                    efeito="Duplica a proposta como rascunho editável e marca a atual como substituída."
                    onConfirmar={async (motivo) => {
                      await mVersionar.mutateAsync({ id: String(detalhe["id"]), motivo });
                    }}
                  />
                </div>
              </Painel>
            </>
          )}

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
              <select
                className={inputCls}
                value={form["forma_pagamento"] ?? ""}
                onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })}
              >
                <option value="">Selecione…</option>
                {form["forma_pagamento"] && !CAT_FORMA_PAGAMENTO.some((o) => o.valor === form["forma_pagamento"]) ? (
                  <option value={form["forma_pagamento"]}>{form["forma_pagamento"]} (valor legado)</option>
                ) : null}
                {CAT_FORMA_PAGAMENTO.map((o) => (
                  <option key={o.valor} value={o.valor} title={o.ajuda}>
                    {o.rotulo}
                  </option>
                ))}
              </select>
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
