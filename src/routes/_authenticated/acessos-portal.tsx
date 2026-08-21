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
  registrarEmailAutorizado,
  reenviarConvitePortal,
  validarEmailAutorizado,
} from "@/lib/portal.functions";
import {
  bloqueioDaPessoa,
  bloqueioDoCaso,
  classificarPessoas,
  emailsElegiveis,
  estadoDoLink,
  EVENTO_LABEL,
  MOTIVO_GATES,
  NIVEL_DESCRICAO,
  NIVEL_LABEL,
  STATUS_ACESSO_LABEL,
  STATUS_AUTORIZACAO_LABEL,
  type AutorizacaoEmail,
  type CasoPortal,
  type NivelPortal,
  type PessoaPortal,
  type PropostaPortal,
} from "@/lib/portal-elegibilidade";


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

const STATUS_LABEL = STATUS_ACESSO_LABEL;
const NIVEL_LABEL_MAP: Record<string, string> = NIVEL_LABEL;

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
  const registrarEmail = useServerFn(registrarEmailAutorizado);
  const validarEmail = useServerFn(validarEmailAutorizado);

  const q = useQuery({ queryKey: ["acessos-portal"], queryFn: () => listar({}) });
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<string | null>(null);

  // Autorização prévia de e-mail
  const [aClientId, setAClientId] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aFinalidade, setAFinalidade] = useState("");
  const [aNivel, setANivel] = useState<NivelPortal>("proposal_portal");
  const [aCasoId, setACasoId] = useState("");

  // Convite
  const [clientId, setClientId] = useState("");
  const [nivel, setNivel] = useState<NivelPortal>("proposal_portal");
  const [autorizacaoId, setAutorizacaoId] = useState("");
  const [casoId, setCasoId] = useState("");
  const [mostrarBloqueados, setMostrarBloqueados] = useState(false);
  const [incluirDemo, setIncluirDemo] = useState(false);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["acessos-portal"] });

  const pessoas = (q.data?.clientes ?? []) as PessoaPortal[];
  const casos = (q.data?.casos ?? []) as CasoPortal[];
  const autorizacoes = (q.data?.autorizacoes ?? []) as AutorizacaoEmail[];
  const propostas = (q.data?.propostas ?? []) as PropostaPortal[];

  const mAutorizacao = useMutation({
    mutationFn: () =>
      registrarEmail({
        data: {
          clientId: aClientId,
          casoId: aCasoId || null,
          email: aEmail,
          finalidade: aFinalidade,
          nivel: aNivel,
        },
      }),
    onSuccess: () => {
      setMsg("E-mail registrado. Falta a validação humana para liberar convites.");
      setErro(null);
      setAEmail("");
      setAFinalidade("");
      setACasoId("");
      invalidar();
    },
    onError: (e: Error) => {
      setErro(e.message);
      setMsg(null);
    },
  });

  const mConvite = useMutation({
    mutationFn: () => criar({ data: { clientId, autorizacaoId, nivel, casoId: casoId || undefined } }),
    onSuccess: () => {
      setMsg("Convite criado e link mágico de uso único enviado (validade de 48h).");
      setErro(null);
      setAutorizacaoId("");
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

  const casosDoCliente = casos.filter((c) => c.cliente_id === clientId);
  const emailsDoCliente = clientId ? emailsElegiveis(autorizacoes, clientId, nivel) : [];
  const grupos = classificarPessoas(pessoas, nivel, autorizacoes, casos, propostas);
  const pessoaSelecionada = pessoas.find((p) => p.id === clientId) ?? null;
  const bloqueioSelecionado = pessoaSelecionada
    ? bloqueioDaPessoa(pessoaSelecionada, nivel, autorizacoes, casos, propostas)
    : null;
  const acessosVisiveis = (q.data?.acessos ?? []).filter((a) => incluirDemo || !a.is_demo);
  const acessosDemoOcultos = (q.data?.acessos ?? []).filter((a) => a.is_demo).length;

  return (
    <SaasShell
      titulo="Acessos ao portal"
      descricao="Clientes entram apenas por link mágico de uso único, enviado a e-mail previamente autorizado e validado."
    >
      {!podeGerir ? (
        <EstadoVazio mensagem="Apenas admin e operações podem gerenciar acessos ao portal." />
      ) : (
        <div className="space-y-8">
          <section className="grid gap-3 md:grid-cols-2">
            {(["proposal_portal", "client_workspace"] as NivelPortal[]).map((n) => (
              <div key={n} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                <p className="font-medium">{NIVEL_LABEL[n]}</p>
                <p className="mt-1 text-sm text-navy/60">{NIVEL_DESCRICAO[n]}</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-navy/10 bg-white p-5">
            <h2 className="font-serif text-xl">E-mails autorizados</h2>
            <p className="mt-1 text-sm text-navy/60">
              Sem senha e sem autocadastro. Todo e-mail precisa de finalidade registrada e validação humana antes de
              qualquer convite. Participante do núcleo familiar não recebe acesso apenas por pertencer ao núcleo.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Pessoa
                <select
                  value={aClientId}
                  onChange={(e) => {
                    setAClientId(e.target.value);
                    setACasoId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="">Selecione…</option>
                  {pessoas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                      {c.classificacao === "participante_familiar" ? " (participante do núcleo)" : ""}
                      {c.is_demo ? " · demo" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                E-mail
                <input
                  type="email"
                  value={aEmail}
                  onChange={(e) => setAEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  placeholder="pessoa@exemplo.com"
                />
              </label>
              <label className="text-sm">
                Nível pretendido
                <select
                  value={aNivel}
                  onChange={(e) => setANivel(e.target.value as NivelPortal)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="proposal_portal">Portal de proposta</option>
                  <option value="client_workspace">Espaço do cliente</option>
                </select>
              </label>
              <label className="text-sm">
                Caso (opcional, restringe a autorização)
                <select
                  value={aCasoId}
                  onChange={(e) => setACasoId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="">Sem caso específico</option>
                  {casos
                    .filter((c) => c.cliente_id === aClientId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo} — {c.titulo}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                Finalidade do acesso
                <input
                  value={aFinalidade}
                  onChange={(e) => setAFinalidade(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                  placeholder="Ex.: leitura da proposta aprovada do caso familiar"
                />
              </label>
            </div>
            <button
              onClick={() => mAutorizacao.mutate()}
              disabled={!aClientId || !aEmail || aFinalidade.trim().length < 5 || mAutorizacao.isPending}
              className="mt-4 rounded-lg border border-navy/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {mAutorizacao.isPending ? "Registrando…" : "Registrar e-mail para validação"}
            </button>

            <ul className="mt-5 space-y-2">
              {autorizacoes.length === 0 ? (
                <li className="text-sm text-navy/60">Nenhum e-mail autorizado registrado.</li>
              ) : (
                autorizacoes.map((a) => {
                  const pessoa = pessoas.find((p) => p.id === a.client_id);
                  return (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0">
                        <strong>{pessoa?.nome ?? "Pessoa"}</strong> · {a.email}
                        <span className="block text-xs text-navy/60">
                          {NIVEL_LABEL[a.nivel_pretendido]} · {STATUS_AUTORIZACAO_LABEL[a.status] ?? a.status} ·{" "}
                          {a.finalidade}
                          {a.is_demo ? " · demo" : ""}
                        </span>
                      </span>
                      <span className="flex gap-2">
                        {a.status !== "aprovado" ? (
                          <button
                            onClick={async () => {
                              try {
                                await validarEmail({ data: { id: a.id, status: "aprovado" } });
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                            className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                          >
                            Aprovar
                          </button>
                        ) : null}
                        {a.status !== "recusado" && a.status !== "revogado" ? (
                          <button
                            onClick={async () => {
                              const motivo = window.prompt("Motivo da recusa/revogação:") ?? "";
                              if (motivo.trim().length < 5) return;
                              try {
                                await validarEmail({
                                  data: { id: a.id, status: a.status === "aprovado" ? "revogado" : "recusado", motivo },
                                });
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                            className="rounded-lg border border-terracotta/40 px-2.5 py-1 text-xs text-terracotta"
                          >
                            {a.status === "aprovado" ? "Revogar" : "Recusar"}
                          </button>
                        ) : null}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-navy/10 bg-white p-5">
            <h2 className="font-serif text-xl">Novo convite</h2>
            <p className="mt-1 text-sm text-navy/60">
              O seletor de pessoa lista somente quem é elegível ao nível escolhido. Registros bloqueados ficam fora da
              lista por padrão e, quando exibidos, aparecem desabilitados com o motivo. Demonstrações ficam isoladas e
              não entram nas métricas de clientes reais.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-navy/70">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={mostrarBloqueados}
                  onChange={(e) => setMostrarBloqueados(e.target.checked)}
                />
                Mostrar bloqueados (somente leitura do motivo)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
                Incluir demonstrações
              </label>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Nível de acesso
                <select
                  value={nivel}
                  onChange={(e) => {
                    setNivel(e.target.value as NivelPortal);
                    setClientId("");
                    setAutorizacaoId("");
                    setCasoId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="proposal_portal">Portal de proposta</option>
                  <option value="client_workspace">Espaço do cliente</option>
                </select>
              </label>
              <label className="text-sm">
                Pessoa
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setAutorizacaoId("");
                    setCasoId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="">Selecione…</option>
                  {grupos.elegiveis.length > 0 ? (
                    <optgroup label="Elegíveis">
                      {grupos.elegiveis.map(({ pessoa }) => (
                        <option key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {mostrarBloqueados && grupos.bloqueadas.length > 0 ? (
                    <optgroup label="Bloqueados (sem elegibilidade operacional)">
                      {grupos.bloqueadas.map(({ pessoa, bloqueio }) => (
                        <option key={pessoa.id} value={pessoa.id} disabled>
                          {pessoa.nome} — {bloqueio.motivos[0]}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {incluirDemo && grupos.demo.length > 0 ? (
                    <optgroup label="Demonstração (fora das métricas reais)">
                      {grupos.demo.map(({ pessoa, bloqueio }) => (
                        <option key={pessoa.id} value={pessoa.id} disabled={bloqueio.bloqueado}>
                          {pessoa.nome} · demo
                          {bloqueio.bloqueado ? ` — ${bloqueio.motivos[0]}` : ""}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                </select>
                {grupos.elegiveis.length === 0 ? (
                  <span className="mt-1 block text-xs text-terracotta">
                    Nenhuma pessoa elegível para {NIVEL_LABEL[nivel]} no momento.
                    {nivel === "client_workspace" ? ` ${MOTIVO_GATES}.` : ""}
                  </span>
                ) : null}
                {!mostrarBloqueados && grupos.bloqueadas.length > 0 ? (
                  <span className="mt-1 block text-xs text-navy/50">
                    {grupos.bloqueadas.length} registro(s) ocultos por falta de elegibilidade.
                  </span>
                ) : null}
              </label>
            </div>
            {bloqueioSelecionado?.bloqueado ? (
              <ul className="mt-3 space-y-1 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-terracotta">
                {bloqueioSelecionado.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-2">

              <label className="text-sm">
                E-mail autorizado
                <select
                  value={autorizacaoId}
                  onChange={(e) => setAutorizacaoId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-navy/20 px-3 py-2"
                >
                  <option value="">Selecione…</option>
                  {emailsDoCliente.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.email} — {a.finalidade}
                    </option>
                  ))}
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
                    {casosDoCliente.map((c) => {
                      const b = bloqueioDoCaso(c);
                      return (
                        <option key={c.id} value={c.id} disabled={b.bloqueado}>
                          {c.codigo} — {c.titulo}
                          {b.bloqueado ? ` — ${b.motivos[0]}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
            </div>
            <button
              onClick={() => mConvite.mutate()}
              disabled={
                !clientId ||
                !autorizacaoId ||
                !!bloqueioSelecionado?.bloqueado ||
                (nivel === "client_workspace" && !casoId) ||
                mConvite.isPending
              }
              className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              {mConvite.isPending ? "Enviando…" : "Criar convite e enviar link"}
            </button>
            {msg ? <p className="mt-3 text-sm text-green-700">{msg}</p> : null}
            {erro ? <p className="mt-3 text-sm text-terracotta">{erro}</p> : null}
          </section>


          <section>
            <h2 className="font-serif text-xl">Acessos</h2>
            {!incluirDemo && acessosDemoOcultos > 0 ? (
              <p className="mt-1 text-sm text-navy/60">
                {acessosDemoOcultos} acesso(s) de demonstração ocultos do painel operacional e das métricas de clientes
                reais. Marque “Incluir demonstrações” acima para exibi-los.
              </p>
            ) : null}
            {q.isLoading ? (
              <p className="mt-3 text-sm text-navy/60">Carregando…</p>
            ) : !acessosVisiveis.length ? (
              <div className="mt-3">
                <EstadoVazio mensagem="Nenhum acesso ao portal criado ainda." />
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {acessosVisiveis.map((a) => {
                  const cliente = q.data!.clientes.find((c) => c.id === a.client_id);
                  const casosVinculados = q.data!.casosAcesso.filter((v) => v.client_portal_access_id === a.id);
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border p-4 ${a.is_demo ? "border-dashed border-gold/60 bg-gold/5" : "border-navy/10 bg-white"}`}
                    >

                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{cliente?.nome ?? "Cliente"}</p>
                          <p className="text-sm text-navy/60">{a.email}</p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-navy/50">
                            {NIVEL_LABEL_MAP[a.access_level]} · {STATUS_LABEL[a.access_status]} · link:{" "}
                            {estadoDoLink(a)}
                            {a.is_demo ? " · demo" : ""}
                            {a.last_authenticated_at
                              ? ` · último acesso ${new Date(a.last_authenticated_at).toLocaleString("pt-BR")}`
                              : ""}
                          </p>
                          {a.finalidade ? <p className="mt-1 text-xs text-navy/60">Finalidade: {a.finalidade}</p> : null}

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
                                {new Date(ev.occurred_at).toLocaleString("pt-BR")} —{" "}
                                {EVENTO_LABEL[ev.event_type] ?? ev.event_type}

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
