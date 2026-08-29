import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import {
  atualizarCheckAtivacao,
  ativarCasoComChecks,
  obterOnboarding,
  suspenderCaso,
} from "@/lib/onboarding.functions";
import { podeValidar, responsavelDoCheck, type CheckAtivacao, type Papel } from "@/lib/onboarding-regras";

export const Route = createFileRoute("/_authenticated/onboarding/$id")({
  head: () => ({
    meta: [
      { title: "Onboarding do caso — Clube Ancestral" },
      {
        name: "description",
        content: "Requisitos executáveis de ativação: validação, isenções autorizadas e linha do tempo do onboarding.",
      },
      { property: "og:title", content: "Onboarding do caso — Clube Ancestral" },
      { property: "og:description", content: "Painel de ativação de casos com travas de validação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  validado: "Validado",
  isento: "Isento (admin)",
  nao_aplicavel: "Não aplicável",
};

function badge(status: string, expirada: boolean) {
  if (expirada) return "bg-terracotta/15 text-terracotta";
  if (status === "validado") return "bg-emerald-100 text-emerald-800";
  if (status === "isento") return "bg-gold/20 text-navy";
  if (status === "nao_aplicavel") return "bg-navy/10 text-navy/60";
  return "bg-terracotta/10 text-terracotta";
}

function OnboardingPage() {
  const { id } = useParams({ from: "/_authenticated/onboarding/$id" });
  const qc = useQueryClient();
  const carregar = useServerFn(obterOnboarding);
  const atualizar = useServerFn(atualizarCheckAtivacao);
  const ativar = useServerFn(ativarCasoComChecks);
  const suspender = useServerFn(suspenderCaso);

  const [aviso, setAviso] = useState<string | null>(null);
  const [isencaoDe, setIsencaoDe] = useState<CheckAtivacao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [expira, setExpira] = useState("");
  const [motivoSuspensao, setMotivoSuspensao] = useState("");
  const [suspendendo, setSuspendendo] = useState(false);

  const q = useQuery({
    queryKey: ["onboarding", id],
    queryFn: () => carregar({ data: { casoId: id } }),
  });

  const recarregar = () => qc.invalidateQueries({ queryKey: ["onboarding", id] });

  const mAtualizar = useMutation({
    mutationFn: (v: Parameters<typeof atualizarCheckAtivacao>[0]["data"]) => atualizar({ data: v }),
    onSuccess: (r) => {
      setAviso(r.ok ? "Requisito atualizado e registrado em auditoria." : `Bloqueado: ${r.erro}`);
      recarregar();
    },
  });
  const mAtivar = useMutation({
    mutationFn: () => ativar({ data: { casoId: id } }),
    onSuccess: (r) => {
      setAviso(
        r.ok
          ? "Caso ativado. Data de ativação, usuário e evento de auditoria registrados."
          : `Ativação bloqueada: ${r.pendencias.join(" · ")}`,
      );
      recarregar();
    },
  });
  const mSuspender = useMutation({
    mutationFn: () => suspender({ data: { casoId: id, motivo: motivoSuspensao } }),
    onSuccess: (r) => {
      setAviso(
        r.ok ? "Caso suspenso. Tarefa de revisão criada para o responsável." : `Bloqueado: ${r.erro}`,
      );
      if (r.ok) {
        setSuspendendo(false);
        setMotivoSuspensao("");
      }
      recarregar();
    },
  });

  const dados = q.data;
  const papeis = (dados?.papeis ?? []) as Papel[];
  const ehAdmin = papeis.includes("admin");
  const caso = (dados?.caso ?? {}) as Record<string, string | number | boolean | null>;
  const checks = dados?.checks ?? [];
  const pendencias = dados?.pendencias ?? [];
  const pronto = pendencias.length === 0;
  const ativo = Boolean(caso["ativo"]);

  return (
    <SaasShell
      titulo="Onboarding e ativação"
      descricao="A ativação depende de requisitos verificáveis. A interface explica o bloqueio; o banco impede o desvio."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-navy">
            {String(caso["codigo"] ?? "")} — {String(caso["titulo"] ?? "Caso")}
          </p>
          <p className="text-xs text-navy/60">
            Status atual: {String(caso["status"] ?? "—")}
            {caso["data_ativacao"] ? ` · ativado em ${new Date(String(caso["data_ativacao"])).toLocaleString("pt-BR")}` : ""}
          </p>
        </div>
        <Link to="/casos" className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70 hover:bg-navy/5">
          Voltar aos casos
        </Link>
      </div>

      {aviso ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">{aviso}</p>
      ) : null}

      {q.isLoading ? <p className="text-sm text-navy/60">Carregando requisitos…</p> : null}

      {dados ? (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-xl border border-navy/10 bg-white p-4">
            <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-navy">Requisitos de ativação</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  ativo ? "bg-emerald-100 text-emerald-800" : pronto ? "bg-gold/20 text-navy" : "bg-terracotta/10 text-terracotta"
                }`}
              >
                {ativo
                  ? "Caso ativo"
                  : pronto
                    ? "Requisitos completos"
                    : `Não elegível — ativação bloqueada (${pendencias.length} pendência(s))`}
              </span>
            </header>

            {!pronto ? (
              <div className="mb-4 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-navy">
                <p className="font-medium">
                  Não elegível — ativação bloqueada. Painel em modo somente leitura para ativação enquanto houver
                  pendência; datas futuras de contrato, pagamento ou onboarding são previsão condicional.
                </p>
                <ul className="mt-1 list-disc pl-5 text-navy/75">
                  {pendencias.map((p) => (
                    <li key={p.check_key}>
                      {p.label} — {p.motivo}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ul className="divide-y divide-navy/10">
              {checks.map((c) => {
                const expirada =
                  c.status === "isento" && !!c.isencao_expira_em && new Date(c.isencao_expira_em) < new Date();
                return (
                  <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="min-w-[220px]">
                      <p className="text-sm font-medium text-navy">{c.label}</p>
                      <p className="text-xs text-navy/55">
                        Responsável: {responsavelDoCheck(c.dominio)}
                        {c.validado_em ? ` · ${new Date(c.validado_em).toLocaleString("pt-BR")}` : ""}
                        {c.origem_validacao ? ` · origem: ${c.origem_validacao}` : ""}
                      </p>
                      {c.isencao_motivo ? (
                        <p className="text-xs text-navy/55">
                          Isenção: {c.isencao_motivo}
                          {c.isencao_expira_em
                            ? ` · expira em ${new Date(c.isencao_expira_em).toLocaleDateString("pt-BR")}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${badge(c.status, expirada)}`}>
                        {expirada ? "Isenção expirada" : (STATUS_LABEL[c.status] ?? c.status)}
                      </span>
                      {c.status !== "validado" && podeValidar(papeis, c.dominio, "validado") ? (
                        <button
                          onClick={() => mAtualizar.mutate({ checkId: c.id, status: "validado" })}
                          className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                        >
                          Validar
                        </button>
                      ) : null}
                      {ehAdmin && c.status !== "isento" ? (
                        <button
                          onClick={() => {
                            setIsencaoDe(c);
                            setMotivo("");
                            setExpira("");
                          }}
                          className="rounded-md border border-gold/50 px-2 py-1 text-xs text-navy hover:bg-gold/10"
                        >
                          Autorizar isenção
                        </button>
                      ) : null}
                      {ehAdmin && c.status !== "pendente" ? (
                        <button
                          onClick={() => mAtualizar.mutate({ checkId: c.id, status: "pendente" })}
                          className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/60 hover:bg-navy/5"
                        >
                          Reverter
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {dados.podeAtivar && !ativo && pronto ? (
                <button
                  onClick={() => mAtivar.mutate()}
                  className="rounded-md bg-navy px-3 py-1.5 text-sm text-cream"
                >
                  Ativar caso
                </button>
              ) : null}
              {!ativo && !pronto ? (
                <p className="text-xs text-navy/55">
                  Sem botão de ativação: o checklist obrigatório ainda não está completo. A validação final é feita pelo
                  banco de dados.
                </p>
              ) : null}
              {dados.podeAtivar && ativo ? (
                <button
                  onClick={() => setSuspendendo(true)}
                  className="rounded-md border border-terracotta/40 px-3 py-1.5 text-sm text-terracotta hover:bg-terracotta/5"
                >
                  Suspender caso
                </button>
              ) : null}
              {!dados.podeAtivar ? (
                <p className="text-xs text-navy/55">
                  Seu papel não autoriza ativação. Apenas admin ou operações podem ativar um caso.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-navy/10 bg-white p-4">
            <h2 className="mb-3 text-base font-semibold text-navy">Linha do tempo do onboarding</h2>
            <ol className="space-y-3">
              <li className="border-l-2 border-gold/60 pl-3">
                <p className="text-xs text-navy/55">
                  {caso["created_at"] ? new Date(String(caso["created_at"])).toLocaleString("pt-BR") : "—"}
                </p>
                <p className="text-sm text-navy">Caso criado</p>
              </li>
              {dados.timeline.map((e) => (
                <li key={e.id} className="border-l-2 border-navy/15 pl-3">
                  <p className="text-xs text-navy/55">{new Date(e.quando).toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-navy">
                    {e.acao} — {e.detalhe}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}

      {isencaoDe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4">
            <h3 className="text-sm font-semibold text-navy">Autorizar isenção — {isencaoDe.label}</h3>
            <p className="mt-1 text-xs text-navy/60">
              A isenção é registrada com motivo, admin autorizador, data/hora e expiração opcional.
            </p>
            <label className="mt-3 block text-xs text-navy/70">Motivo (opcional)</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
              rows={3}
            />
            <label className="mt-3 block text-xs text-navy/70">Expiração (opcional)</label>
            <input
              type="date"
              value={expira}
              onChange={(e) => setExpira(e.target.value)}
              className="mt-1 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsencaoDe(null)}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
              >
                Cancelar
              </button>
              <button
                disabled={mAtualizar.isPending}
                onClick={() => {
                  mAtualizar.mutate({
                    checkId: isencaoDe.id,
                    status: "isento",
                    isencaoMotivo: motivo,
                    isencaoExpiraEm: expira || null,
                  });
                  setIsencaoDe(null);
                }}
                className="rounded-md bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                Autorizar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {suspendendo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-4">
            <h3 className="text-sm font-semibold text-navy">Suspender caso</h3>
            <p className="mt-1 text-xs text-navy/60">
              O motivo é obrigatório e uma tarefa de revisão será criada para o responsável.
            </p>
            <textarea
              value={motivoSuspensao}
              onChange={(e) => setMotivoSuspensao(e.target.value)}
              className="mt-3 w-full rounded-md border border-navy/15 px-2 py-1 text-sm"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSuspendendo(false)}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
              >
                Cancelar
              </button>
              <button
                disabled={mSuspender.isPending}
                onClick={() => mSuspender.mutate()}
                className="rounded-md bg-terracotta px-3 py-1.5 text-xs text-cream disabled:opacity-40"
              >
                Suspender
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SaasShell>
  );
}
