import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, PlayCircle, Plug, ShieldCheck, TestTube2 } from "lucide-react";

import {
  CAMPOS_DESTINO,
  CATEGORIAS_INTEGRACAO,
  PAYLOAD_DEMO,
  STATUS_INTEGRACAO,
} from "@/lib/integracoes.server";
import {
  alterarSituacaoIntegracao,
  ativarIntegracao,
  executarDemoFormLead,
  listarIntegracoes,
  resolverRevisaoIntegracao,
  salvarIntegracao,
  testarIntegracao,
} from "@/lib/integracoes.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls = "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm";

const CORES_STATUS: Record<string, string> = {
  desligada: "border-navy/20 bg-cream text-navy/70",
  teste: "border-gold/50 bg-gold/15 text-navy",
  ativa: "border-emerald-600/40 bg-emerald-600/10 text-emerald-800",
  com_erro: "border-terracotta/50 bg-terracotta/10 text-terracotta",
  pausada: "border-navy/30 bg-navy/5 text-navy/70",
};

function Selo({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${CORES_STATUS[status] ?? CORES_STATUS["desligada"]}`}>
      {STATUS_INTEGRACAO[status] ?? status}
    </span>
  );
}

export function CentroIntegracoes() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(listarIntegracoes);
  const salvar = useServerFn(salvarIntegracao);
  const situacao = useServerFn(alterarSituacaoIntegracao);
  const ativar = useServerFn(ativarIntegracao);
  const testar = useServerFn(testarIntegracao);
  const rodarDemo = useServerFn(executarDemoFormLead);
  const resolver = useServerFn(resolverRevisaoIntegracao);

  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mapa, setMapa] = useState<Record<string, string>>({});
  const [owner, setOwner] = useState("");
  const [retry, setRetry] = useState(3);
  const [backoff, setBackoff] = useState(60);
  const [modalAtivar, setModalAtivar] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  const { data, isLoading } = useQuery({ queryKey: ["integracoes"], queryFn: () => carregar({}) });

  const atual = useMemo(
    () => (data?.integracoes ?? []).find((i: any) => i.id === selecionada) ?? null,
    [data, selecionada],
  );

  function abrir(i: any) {
    setSelecionada(i.id);
    setErro(null);
    setResultado(null);
    setMapa({ ...(i.field_map ?? {}) });
    setOwner(i.owner_user_id ?? "");
    setRetry(Number(i.retry_max ?? 3));
    setBackoff(Number(i.retry_backoff_seg ?? 60));
  }

  function recarregar() {
    queryClient.invalidateQueries({ queryKey: ["integracoes"] });
  }
  const falhar = (e: unknown) => setErro((e as Error).message);

  const mSalvar = useMutation({
    mutationFn: () => {
      const pessoa = (data?.equipe ?? []).find((p: any) => p.auth_user_id === owner);
      return salvar({
        data: {
          id: atual.id,
          fieldMap: mapa,
          ownerUserId: owner || null,
          ownerNome: pessoa ? (pessoa.nome ?? pessoa.email) : null,
          retryMax: retry,
          retryBackoff: backoff,
        },
      });
    },
    onSuccess: recarregar,
    onError: falhar,
  });

  const mSituacao = useMutation({
    mutationFn: (p: { status: "desligada" | "teste" | "pausada"; motivo?: string }) =>
      situacao({ data: { id: atual.id, ...p } }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const mAtivar = useMutation({
    mutationFn: () => ativar({ data: { id: atual.id, confirmacao } }),
    onSuccess: () => {
      setModalAtivar(false);
      setConfirmacao("");
      recarregar();
    },
    onError: falhar,
  });

  const mTestar = useMutation({
    mutationFn: () => testar({ data: { id: atual.id } }),
    onSuccess: (r) => {
      setResultado(r);
      recarregar();
    },
    onError: falhar,
  });

  const mDemo = useMutation({
    mutationFn: (forcarFalha: boolean) => rodarDemo({ data: { id: atual.id, forcarFalha } }),
    onSuccess: (r) => {
      setResultado(r);
      recarregar();
    },
    onError: falhar,
  });

  const mResolver = useMutation({
    mutationFn: (p: { id: string; resolucao: string }) => resolver({ data: p }),
    onSuccess: recarregar,
    onError: falhar,
  });

  const execucoes = (data?.execucoes ?? []).filter((e: any) => e.integration_id === selecionada);
  const campos = atual ? (CAMPOS_DESTINO[atual.chave] ?? []) : [];
  const origens = atual ? Object.keys(PAYLOAD_DEMO[atual.chave] ?? {}) : [];

  return (
    <div className="space-y-5">
      <p className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy/80">
        <ShieldCheck className="mr-2 inline h-4 w-4" />
        Todas as integrações começam desligadas e em modo simulado. Enquanto não estiverem ativas, nada é enviado,
        cobrado, sincronizado ou alterado fora do sistema.
      </p>

      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{erro}</p>
      ) : null}

      {(data?.revisao ?? []).length > 0 ? (
        <section className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
          <h2 className="font-serif text-lg text-terracotta">
            <AlertTriangle className="mr-2 inline h-4 w-4" />
            Fila de revisão
          </h2>
          <p className="text-sm text-navy/70">
            Integrações que passaram do limite de tentativas param automaticamente e só voltam por decisão humana.
          </p>
          <ul className="mt-3 space-y-2">
            {(data?.revisao ?? []).map((r: any) => (
              <li key={r.id} className="rounded-lg border border-navy/10 bg-white p-3 text-sm">
                <p className="font-medium">{r.motivo}</p>
                <p className="text-xs text-navy/50">
                  {r.tentativas} tentativas · {new Date(r.created_at).toLocaleString("pt-BR")}
                </p>
                <button
                  onClick={() => {
                    const t = window.prompt("O que foi corrigido? (mínimo 10 caracteres)") ?? "";
                    if (t.trim()) mResolver.mutate({ id: r.id, resolucao: t });
                  }}
                  className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                >
                  Resolver e desligar
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isLoading ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ul className="space-y-2">
          {(data?.integracoes ?? []).map((i: any) => (
            <li key={i.id}>
              <button
                onClick={() => abrir(i)}
                className={`w-full rounded-xl border p-3 text-left ${
                  selecionada === i.id ? "border-navy bg-white" : "border-navy/10 bg-white/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{i.nome}</span>
                  <Selo status={i.status} />
                </div>
                <p className="mt-1 text-xs text-navy/50">
                  {CATEGORIAS_INTEGRACAO[i.categoria] ?? i.categoria}
                  {i.owner_nome ? ` · ${i.owner_nome}` : " · sem responsável"}
                </p>
                <p className="text-xs text-navy/40">
                  Última execução:{" "}
                  {i.ultima_execucao_em ? new Date(i.ultima_execucao_em).toLocaleString("pt-BR") : "nunca"}
                </p>
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          {!atual ? (
            <p className="rounded-xl border border-navy/10 bg-white p-6 text-sm text-navy/60">
              <Plug className="mr-2 inline h-4 w-4" />
              Escolha uma integração para configurar, testar com dados DEMO e ver os logs mascarados.
            </p>
          ) : (
            <>
              <section className="rounded-xl border border-navy/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-serif text-xl">{atual.nome}</h2>
                    <p className="text-sm text-navy/60">{atual.descricao}</p>
                  </div>
                  <Selo status={atual.status} />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label className="text-sm">
                    <span className="text-navy/60">Responsável interno</span>
                    <select value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls}>
                      <option value="">Sem responsável</option>
                      {(data?.equipe ?? []).map((p: any) => (
                        <option key={p.auth_user_id} value={p.auth_user_id}>
                          {p.nome ?? p.email} ({p.role})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-navy/60">Máximo de tentativas</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={retry}
                      onChange={(e) => setRetry(Number(e.target.value))}
                      className={inputCls}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-navy/60">Intervalo entre tentativas (s)</span>
                    <input
                      type="number"
                      min={5}
                      max={3600}
                      value={backoff}
                      onChange={(e) => setBackoff(Number(e.target.value))}
                      className={inputCls}
                    />
                  </label>
                </div>

                <h3 className="mt-5 font-medium">Mapeamento de campos</h3>
                <p className="text-xs text-navy/50">
                  Campo obrigatório sem origem impede qualquer sincronização, mesmo em teste.
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {campos.map((c) => (
                    <label key={c.chave} className="text-sm">
                      <span className="text-navy/60">
                        {c.rotulo}
                        {c.obrigatorio ? " *" : ""}
                      </span>
                      <input
                        list={`origens-${atual.chave}`}
                        value={mapa[c.chave] ?? ""}
                        onChange={(e) => setMapa({ ...mapa, [c.chave]: e.target.value })}
                        placeholder="campo de origem"
                        className={`${inputCls} ${
                          c.obrigatorio && !(mapa[c.chave] ?? "").trim() ? "border-terracotta/50" : ""
                        }`}
                      />
                    </label>
                  ))}
                  <datalist id={`origens-${atual.chave}`}>
                    {origens.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => mSalvar.mutate()}
                    disabled={!data?.podeConfigurar || mSalvar.isPending}
                    className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                  >
                    Salvar configuração
                  </button>
                  <button
                    onClick={() => mTestar.mutate()}
                    disabled={!data?.podeConfigurar || mTestar.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    <TestTube2 className="h-4 w-4" /> Testar com dados DEMO
                  </button>
                  {atual.chave === "demo_form_lead" ? (
                    <>
                      <button
                        onClick={() => mDemo.mutate(false)}
                        disabled={!data?.podeConfigurar || mDemo.isPending}
                        className="inline-flex items-center gap-2 rounded-lg border border-navy/20 px-3 py-2 text-sm disabled:opacity-60"
                      >
                        <PlayCircle className="h-4 w-4" /> Rodar formulário → lead
                      </button>
                      <button
                        onClick={() => mDemo.mutate(true)}
                        disabled={!data?.podeConfigurar || mDemo.isPending}
                        className="rounded-lg border border-terracotta/40 px-3 py-2 text-sm text-terracotta disabled:opacity-60"
                      >
                        Simular falha
                      </button>
                    </>
                  ) : null}
                  <button
                    onClick={() => mSituacao.mutate({ status: "teste" })}
                    disabled={!data?.podeConfigurar}
                    className="rounded-lg border border-navy/20 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    Colocar em teste
                  </button>
                  <button
                    onClick={() => mSituacao.mutate({ status: "desligada" })}
                    disabled={!data?.podeConfigurar}
                    className="rounded-lg border border-navy/20 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    Desligar
                  </button>
                  <button
                    onClick={() => {
                      const m = window.prompt("Motivo da pausa") ?? "";
                      if (m.trim()) mSituacao.mutate({ status: "pausada", motivo: m });
                    }}
                    disabled={!data?.podeConfigurar}
                    className="rounded-lg border border-navy/20 px-3 py-2 text-sm disabled:opacity-60"
                  >
                    Pausar
                  </button>
                  <button
                    onClick={() => setModalAtivar(true)}
                    disabled={!data?.podeAtivar || atual.status === "ativa"}
                    className="rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy disabled:opacity-60"
                  >
                    Ativar em produção
                  </button>
                </div>
                {!data?.podeAtivar ? (
                  <p className="mt-2 text-xs text-navy/50">Somente admin pode ativar uma integração.</p>
                ) : null}
              </section>

              {resultado ? (
                <section className="rounded-xl border border-navy/10 bg-white p-4">
                  <h3 className="font-serif text-lg">Resultado do teste</h3>
                  <p className={`text-sm ${resultado.ok ? "text-emerald-800" : "text-terracotta"}`}>
                    {resultado.mensagem}
                  </p>
                  {resultado.payloadMascarado ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {[
                        ["Payload recebido (mascarado)", resultado.payloadMascarado],
                        ["Depois do mapeamento", resultado.traduzidoMascarado],
                        ["Resposta simulada", resultado.respostaMascarada],
                      ].map(([titulo, valor]) => (
                        <div key={titulo as string}>
                          <p className="text-xs font-medium text-navy/60">{titulo as string}</p>
                          <pre className="mt-1 max-h-56 overflow-auto rounded-lg bg-cream p-2 text-[11px]">
                            {JSON.stringify(valor, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="rounded-xl border border-navy/10 bg-white p-4">
                <h3 className="font-serif text-lg">Logs de execução</h3>
                <p className="text-xs text-navy/50">
                  E-mails, telefones, documentos e tokens já chegam mascarados ao log.
                </p>
                {execucoes.length === 0 ? (
                  <p className="mt-2 text-sm text-navy/60">Nenhuma execução registrada.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {execucoes.map((e: any) => (
                      <li key={e.id} className="rounded-lg border border-navy/10 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium">{e.operacao}</span>
                          <span className="text-xs text-navy/50">
                            {e.ambiente} · tentativa {e.tentativa} · {new Date(e.created_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className={e.resultado === "ok" ? "text-navy/70" : "text-terracotta"}>{e.mensagem}</p>
                        <p className="text-xs text-navy/50">Efeito local: {e.efeito_local ?? "nenhum"}</p>
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-navy/60">Ver payload mascarado</summary>
                          <pre className="mt-1 max-h-56 overflow-auto rounded-lg bg-cream p-2 text-[11px]">
                            {JSON.stringify({ payload: e.payload_mascarado, resposta: e.resposta_mascarada }, null, 2)}
                          </pre>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {modalAtivar && atual ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="font-serif text-xl">Ativar {atual.nome}?</h3>
            <p className="mt-2 text-sm text-navy/70">
              A partir da ativação esta integração pode agir fora do sistema. A ação exige admin, fica registrada em
              auditoria e pode ser revertida a qualquer momento.
            </p>
            <label className="mt-4 block text-sm">
              <span className="text-navy/60">Digite ATIVAR para confirmar</span>
              <input value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className={inputCls} />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalAtivar(false);
                  setConfirmacao("");
                }}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => mAtivar.mutate()}
                disabled={confirmacao.trim().toUpperCase() !== "ATIVAR" || mAtivar.isPending}
                className="rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy disabled:opacity-60"
              >
                Confirmar ativação
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
