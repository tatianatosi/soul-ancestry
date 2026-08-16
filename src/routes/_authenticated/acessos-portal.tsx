import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import {
  alterarStatusAcessoPortal,
  criarConvitePortal,
  definirCasoDoAcesso,
  definirLiberacaoCaso,
  listarAcessosPortal,
  listarEventosAcesso,
  reenviarConvitePortal,
} from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/acessos-portal")({
  head: () => ({
    meta: [
      { title: "Acessos ao portal — Clube Ancestral" },
      { name: "description", content: "Gestão de convites e autorizações de acesso de clientes ao portal." },
      { property: "og:title", content: "Acessos ao portal — Clube Ancestral" },
      { property: "og:description", content: "Convites por link mágico, casos autorizados e trilha de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessosPortalPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  invited: "Convidado",
  active: "Ativo",
  suspended: "Suspenso",
  revoked: "Revogado",
  expired: "Expirado",
};

const NIVEL_LABEL: Record<string, string> = {
  proposal_portal: "Portal de proposta",
  client_workspace: "Espaço do cliente",
};

function AcessosPortalPage() {
  const { papeis } = useSaas();
  const podeGerir = papeis.includes("admin") || papeis.includes("operacoes");

  const queryClient = useQueryClient();
  const listar = useServerFn(listarAcessosPortal);
  const criar = useServerFn(criarConvitePortal);
  const reenviar = useServerFn(reenviarConvitePortal);
  const alterar = useServerFn(alterarStatusAcessoPortal);
  const definirCaso = useServerFn(definirCasoDoAcesso);
  const liberar = useServerFn(definirLiberacaoCaso);
  const eventos = useServerFn(listarEventosAcesso);

  const q = useQuery({ queryKey: ["acessos-portal"], queryFn: () => listar({}) });
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [email, setEmail] = useState("");
  const [nivel, setNivel] = useState<"proposal_portal" | "client_workspace">("proposal_portal");
  const [casoId, setCasoId] = useState("");

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["acessos-portal"] });

  const mConvite = useMutation({
    mutationFn: () => criar({ data: { clientId, email, nivel, casoId: casoId || undefined } }),
    onSuccess: () => {
      setMsg("Convite criado e link de acesso enviado.");
      setErro(null);
      setEmail("");
      setCasoId("");
      invalidar();
    },
    onError: (e: Error) => {
      setErro(e.message);
      setMsg(null);
    },
  });

  const qEventos = useQuery({
    queryKey: ["acessos-portal-eventos", detalhe],
    queryFn: () => eventos({ data: { acessoId: detalhe! } }),
    enabled: !!detalhe,
  });

  const casosDoCliente = (q.data?.casos ?? []).filter((c) => c.cliente_id === clientId);

  return (
    <SaasShell
      titulo="Acessos ao portal"
      descricao="Clientes entram apenas por link mágico enviado a e-mail previamente autorizado."
    >
      {!podeGerir ? (
        <EstadoVazio mensagem="Apenas admin e operações podem gerenciar acessos ao portal." />
      ) : (
        <div className="space-y-8">
          <section className="rounded-xl border border-navy/10 bg-white p-5">
            <h2 className="font-serif text-xl">Novo convite</h2>
            <p className="mt-1 text-sm text-navy/60">
              Sem senha e sem autocadastro. Para o espaço do cliente é obrigatório associar um caso elegível
              (contrato assinado, pagamento confirmado e documentos mínimos).
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Cliente
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setCasoId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="">Selecione…</option>
                  {(q.data?.clientes ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                E-mail autorizado
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  placeholder="cliente@exemplo.com"
                />
              </label>
              <label className="text-sm">
                Nível de acesso
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as typeof nivel)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="proposal_portal">Portal de proposta</option>
                  <option value="client_workspace">Espaço do cliente</option>
                </select>
              </label>
              {nivel === "client_workspace" ? (
                <label className="text-sm">
                  Caso associado
                  <select
                    value={casoId}
                    onChange={(e) => setCasoId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  >
                    <option value="">Selecione…</option>
                    {casosDoCliente.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.titulo}
                        {c.contrato_assinado && c.pagamento_confirmado ? "" : " (inelegível)"}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>
            <button
              onClick={() => mConvite.mutate()}
              disabled={!clientId || !email || mConvite.isPending}
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              {mConvite.isPending ? "Enviando…" : "Criar convite e enviar link"}
            </button>
            {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
            {erro ? <p className="mt-3 text-sm text-terracotta">{erro}</p> : null}
          </section>

          <section>
            <h2 className="font-serif text-xl">Acessos</h2>
            {q.isLoading ? (
              <p className="mt-3 text-sm text-navy/60">Carregando…</p>
            ) : !q.data?.acessos.length ? (
              <div className="mt-3">
                <EstadoVazio mensagem="Nenhum acesso ao portal criado ainda." />
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {q.data.acessos.map((a) => {
                  const cliente = q.data!.clientes.find((c) => c.id === a.client_id);
                  const casosVinculados = q.data!.casosAcesso.filter((v) => v.client_portal_access_id === a.id);
                  return (
                    <div key={a.id} className="rounded-xl border border-navy/10 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{cliente?.nome ?? "Cliente"}</p>
                          <p className="text-sm text-navy/60">{a.email}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-navy/50">
                            {NIVEL_LABEL[a.access_level]} · {STATUS_LABEL[a.access_status]}
                            {a.last_authenticated_at
                              ? ` · último acesso ${new Date(a.last_authenticated_at).toLocaleString("pt-BR")}`
                              : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await reenviar({ data: { acessoId: a.id } });
                                setMsg("Novo link enviado.");
                                setErro(null);
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                          >
                            Reenviar link
                          </button>
                          {a.access_status !== "suspended" ? (
                            <button
                              onClick={async () => {
                                const motivo = window.prompt("Motivo da suspensão:") ?? "";
                                if (motivo.trim().length < 5) return;
                                try {
                                  await alterar({ data: { acessoId: a.id, status: "suspended", motivo } });
                                  invalidar();
                                } catch (e) {
                                  setErro((e as Error).message);
                                }
                              }}
                              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                            >
                              Suspender
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await alterar({ data: { acessoId: a.id, status: "active" } });
                                invalidar();
                              }}
                              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                            >
                              Reativar
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const motivo = window.prompt("Motivo da revogação:") ?? "";
                              if (motivo.trim().length < 5) return;
                              try {
                                await alterar({ data: { acessoId: a.id, status: "revoked", motivo } });
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                            className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
                          >
                            Revogar
                          </button>
                          <button
                            onClick={() => setDetalhe(detalhe === a.id ? null : a.id)}
                            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                          >
                            {detalhe === a.id ? "Ocultar histórico" : "Histórico"}
                          </button>
                        </div>
                      </div>

                      {a.access_level === "client_workspace" ? (
                        <div className="mt-4 border-t border-navy/10 pt-3">
                          <p className="text-xs uppercase tracking-wide text-navy/50">Casos autorizados</p>
                          <ul className="mt-2 space-y-2">
                            {casosVinculados.length === 0 ? (
                              <li className="text-sm text-navy/60">Nenhum caso autorizado.</li>
                            ) : (
                              casosVinculados.map((v) => {
                                const caso = q.data!.casos.find((c) => c.id === v.case_id);
                                return (
                                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <span>
                                      {caso ? `${caso.codigo} — ${caso.titulo}` : v.case_id}{" "}
                                      <span className="text-navy/50">
                                        ({v.access_status === "active" ? "ativo" : "revogado"}
                                        {caso ? ` · app: ${caso.app_access_status}` : ""})
                                      </span>
                                    </span>
                                    <span className="flex gap-2">
                                      <button
                                        onClick={async () => {
                                          try {
                                            await liberar({
                                              data: {
                                                casoId: v.case_id,
                                                liberado: caso?.app_access_status !== "liberado",
                                                nivel: "workspace",
                                                consentimento: true,
                                                infoLiberada: true,
                                              },
                                            });
                                            invalidar();
                                          } catch (e) {
                                            setErro((e as Error).message);
                                          }
                                        }}
                                        className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                                      >
                                        {caso?.app_access_status === "liberado" ? "Bloquear no app" : "Liberar no app"}
                                      </button>
                                      {v.access_status === "active" ? (
                                        <button
                                          onClick={async () => {
                                            const motivo = window.prompt("Motivo da revogação do caso:") ?? "";
                                            if (motivo.trim().length < 5) return;
                                            try {
                                              await definirCaso({
                                                data: { acessoId: a.id, casoId: v.case_id, conceder: false, motivo },
                                              });
                                              invalidar();
                                            } catch (e) {
                                              setErro((e as Error).message);
                                            }
                                          }}
                                          className="rounded-lg border border-terracotta/40 px-2.5 py-1 text-xs text-terracotta"
                                        >
                                          Revogar caso
                                        </button>
                                      ) : (
                                        <button
                                          onClick={async () => {
                                            try {
                                              await definirCaso({
                                                data: { acessoId: a.id, casoId: v.case_id, conceder: true },
                                              });
                                              invalidar();
                                            } catch (e) {
                                              setErro((e as Error).message);
                                            }
                                          }}
                                          className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                                        >
                                          Reativar caso
                                        </button>
                                      )}
                                    </span>
                                  </li>
                                );
                              })
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {detalhe === a.id ? (
                        <div className="mt-4 border-t border-navy/10 pt-3">
                          <p className="text-xs uppercase tracking-wide text-navy/50">Histórico de acesso</p>
                          <ul className="mt-2 space-y-1 text-sm text-navy/70">
                            {(qEventos.data ?? []).map((ev) => (
                              <li key={ev.id}>
                                {new Date(ev.occurred_at).toLocaleString("pt-BR")} — {ev.event_type}
                              </li>
                            ))}
                            {qEventos.data && qEventos.data.length === 0 ? <li>Sem eventos registrados.</li> : null}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </SaasShell>
  );
}
