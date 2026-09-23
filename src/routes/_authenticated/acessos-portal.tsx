import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { CardIndicador } from "@/components/desk/ui-desk";
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
  resumoPublicacaoPorCaso,
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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "aprovar_projecao_app_cliente" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
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
  const projecoes = (q.data?.projecoes ?? []) as { case_id: string | null; approval_status: string | null; archived_at: string | null }[];
  const resumoPublicacao = resumoPublicacaoPorCaso(projecoes);
  // Último acesso do cliente por caso: caso → client_portal_case_access →
  // client_portal_access.last_authenticated_at (o mais recente, quando há
  // mais de um vínculo de acesso para o mesmo caso).
  const ultimoAcessoPorCaso = new Map<string, string | null>();
  for (const vinculo of q.data?.casosAcesso ?? []) {
    const acesso = (q.data?.acessos ?? []).find((a) => a.id === vinculo.client_portal_access_id);
    const atual = ultimoAcessoPorCaso.get(vinculo.case_id);
    const candidato = acesso?.last_authenticated_at ?? null;
    if (candidato && (!atual || candidato > atual)) ultimoAcessoPorCaso.set(vinculo.case_id, candidato);
    else if (!ultimoAcessoPorCaso.has(vinculo.case_id)) ultimoAcessoPorCaso.set(vinculo.case_id, candidato);
  }
  // Só casos genuinamente conectados ao App (têm vínculo de acesso ao
  // portal) entram no resumo — carteira inteira da organização seria
  // ruído, a maioria nunca usa o App.
  const casosComAcessoPortal = casos.filter((c) => (q.data?.casosAcesso ?? []).some((v) => v.case_id === c.id));

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
      setMsg("Convite criado e link mágico de uso único enviado (validade de 24h; reenvios valem 20 minutos).");
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

  // Cartões de decisão do grupo Cliente — contam só o que já está carregado
  // por listarAcessosPortal; sem fonte real, "Sem dados suficientes".
  const acessosAtivos = q.data ? acessosVisiveis.filter((a) => a.access_status === "active").length : null;
  const convitesPendentes = q.data
    ? acessosVisiveis.filter((a) => a.access_status === "invited" || a.access_status === "pending").length
    : null;
  const emailsAguardandoValidacao = q.data ? autorizacoes.filter((a) => a.status === "pendente").length : null;
  const acessosSuspensos = q.data
    ? acessosVisiveis.filter((a) => ["suspended", "revoked", "expired"].includes(a.access_status)).length
    : null;

  return (
    <SaasShell
      titulo="Acessos ao portal"
      descricao="Clientes entram apenas por link mágico de uso único, enviado a e-mail previamente autorizado e validado."
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os acessos ao portal"
      >
        {() => (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CardIndicador rotulo="Acessos ativos ao portal" valor={acessosAtivos} apoio="Link válido e não revogado" />
            <CardIndicador rotulo="Convites pendentes" valor={convitesPendentes} apoio="Aguardando primeiro acesso" tom="atencao" />
            <CardIndicador
              rotulo="E-mails aguardando validação"
              valor={emailsAguardandoValidacao}
              apoio="Autorização registrada, falta validação humana"
              tom="atencao"
            />
            <CardIndicador rotulo="Acessos suspensos ou revogados" valor={acessosSuspensos} apoio="Sem acesso ativo" tom="critico" />
          </div>

          {/*
            §22 do De-Para (Portal do Cliente — visão interna): "Resumo por
            família/caso — status geral de publicação do App". Divergência
            de vocabulário registrada no comentário de `resumoPublicacaoPorCaso`
            (portal-elegibilidade.ts) — não é a "matriz de módulos" literal
            da prancha, é a contagem real que o dado sustenta.
          */}
          <section className="rounded-xl border border-navy/10 bg-cream/40 p-5" data-resumo-publicacao-por-caso>
            <h2 className="font-serif text-xl">Publicação por caso</h2>
            <p className="mt-1 text-sm text-navy/60">
              Itens publicados, pendentes e arquivados no App Cliente, e último acesso do cliente — só casos com
              vínculo de acesso ao portal.
            </p>
            {casosComAcessoPortal.length === 0 ? (
              <p className="mt-3 text-sm text-navy/60">Nenhum caso com acesso ao portal configurado ainda.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-navy/50">
                      <th className="pb-2 pr-3">Caso</th>
                      <th className="pb-2 pr-3">Publicadas</th>
                      <th className="pb-2 pr-3">Pendentes</th>
                      <th className="pb-2 pr-3">Arquivadas</th>
                      <th className="pb-2">Último acesso do cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {casosComAcessoPortal.map((c) => {
                      const resumo = resumoPublicacao.get(c.id) ?? { publicadas: 0, pendentes: 0, arquivadas: 0 };
                      const ultimoAcesso = ultimoAcessoPorCaso.get(c.id) ?? null;
                      return (
                        <tr key={c.id} className="border-t border-navy/10">
                          <td className="py-2 pr-3">
                            {c.codigo ?? c.titulo ?? c.id}
                          </td>
                          <td className="py-2 pr-3">{resumo.publicadas}</td>
                          <td className="py-2 pr-3">{resumo.pendentes}</td>
                          <td className="py-2 pr-3">{resumo.arquivadas}</td>
                          <td className="py-2 text-navy/70">
                            {ultimoAcesso ? new Date(ultimoAcesso).toLocaleString("pt-BR") : "Nunca acessou"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            {(["proposal_portal", "client_workspace"] as NivelPortal[]).map((n) => (
              <div key={n} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                <p className="font-medium">{NIVEL_LABEL[n]}</p>
                <p className="mt-1 text-sm text-navy/60">{NIVEL_DESCRICAO[n]}</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
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
              disabled={!aClientId || !aEmail || mAutorizacao.isPending}
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
                          <AcaoOperacional
                            rotulo={a.status === "aprovado" ? "Revogar" : "Recusar"}
                            className="rounded-lg border border-terracotta/40 px-2.5 py-1 text-xs text-terracotta"
                            acaoExterna="revogar_ou_recusar_email_autorizado"
                            efeito="Revoga/recusa a autorização deste e-mail ao Portal do Cliente."
                            onConfirmar={async (motivo) => {
                              try {
                                await validarEmail({
                                  data: { id: a.id, status: a.status === "aprovado" ? "revogado" : "recusado", motivo },
                                });
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                          />
                        ) : null}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
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
                        <option key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome} — {bloqueio.motivos[0]}
                        </option>
                      ))}
                    </optgroup>
                  ) : null}
                  {incluirDemo && grupos.demo.length > 0 ? (
                    <optgroup label="Demonstração (fora das métricas reais)">
                      {grupos.demo.map(({ pessoa, bloqueio }) => (
                        <option key={pessoa.id} value={pessoa.id}>
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
                        <option key={c.id} value={c.id}>
                          {c.codigo} — {c.titulo}
                          {b.bloqueado ? ` — ${b.motivos[0]}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ) : null}
            </div>
            <div className="mt-4">
              {!clientId || !autorizacaoId || (nivel === "client_workspace" && !casoId) ? (
                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
                >
                  Criar convite e enviar link
                </button>
              ) : (
                <AcaoOperacional
                  rotulo={mConvite.isPending ? "Enviando…" : "Criar convite e enviar link"}
                  acaoExterna="enviar_email"
                  capacidade="editar_fila_responsavel_prazo"
                  pendenciaGate={
                    bloqueioSelecionado?.bloqueado ? bloqueioSelecionado.motivos.join("; ") : null
                  }
                  efeito="Cria o acesso e envia um link mágico de uso único para o e-mail autorizado (validade de 24h)."
                  onConfirmar={async () => {
                    await mConvite.mutateAsync();
                  }}
                />
              )}
            </div>
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
            {!acessosVisiveis.length ? (
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
                      className={`rounded-xl border p-4 ${a.is_demo ? "border-dashed border-gold/60 bg-gold/5" : "border-navy/10 bg-cream/40"}`}
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
                            <AcaoOperacional
                              rotulo="Suspender"
                              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                              acaoExterna="suspender_acesso_portal"
                              efeito="Suspende o acesso deste cliente ao Portal — ele deixa de conseguir entrar até ser reativado."
                              onConfirmar={async (motivo) => {
                                try {
                                  await alterar({ data: { acessoId: a.id, status: "suspended", motivo } });
                                  invalidar();
                                } catch (e) {
                                  setErro((e as Error).message);
                                }
                              }}
                            />
                          ) : (
                            <AcaoOperacional
                              rotulo="Reativar"
                              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs"
                              acaoExterna="reativar_acesso_portal"
                              efeito="Reativa o acesso deste cliente ao Portal, revalidando elegibilidade e invalidando qualquer link mágico anterior."
                              onConfirmar={async (motivo) => {
                                try {
                                  await alterar({ data: { acessoId: a.id, status: "active", motivo } });
                                  invalidar();
                                } catch (e) {
                                  setErro((e as Error).message);
                                }
                              }}
                            />
                          )}
                          <AcaoOperacional
                            rotulo="Revogar"
                            className="rounded-lg border border-terracotta/40 px-3 py-1.5 text-xs text-terracotta"
                            acaoExterna="revogar_acesso_portal"
                            efeito="Revoga definitivamente o acesso deste cliente ao Portal."
                            onConfirmar={async (motivo) => {
                              try {
                                await alterar({ data: { acessoId: a.id, status: "revoked", motivo } });
                                invalidar();
                              } catch (e) {
                                setErro((e as Error).message);
                              }
                            }}
                          />
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
                                      <AcaoOperacional
                                        rotulo={caso?.app_access_status === "liberado" ? "Bloquear no app" : "Liberar no app"}
                                        className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                                        acaoExterna="liberar_acesso_app_cliente"
                                        efeito={
                                          caso?.app_access_status === "liberado"
                                            ? "Bloqueia o acesso deste caso no App Cliente — o cliente deixa de ver o caso no portal."
                                            : "Libera o acesso deste caso no App Cliente — o cliente passa a ver o caso no portal."
                                        }
                                        onConfirmar={async (motivo) => {
                                          try {
                                            await liberar({
                                              data: {
                                                casoId: v.case_id,
                                                liberado: caso?.app_access_status !== "liberado",
                                                nivel: "workspace",
                                                consentimento: true,
                                                infoLiberada: true,
                                                motivo,
                                              },
                                            });
                                            invalidar();
                                          } catch (e) {
                                            setErro((e as Error).message);
                                          }
                                        }}
                                      />
                                      {v.access_status === "active" ? (
                                        <AcaoOperacional
                                          rotulo="Revogar caso"
                                          className="rounded-lg border border-terracotta/40 px-2.5 py-1 text-xs text-terracotta"
                                          acaoExterna="revogar_caso_do_acesso_portal"
                                          efeito="Revoga o vínculo deste caso ao acesso do cliente — o cliente deixa de ver este caso no portal."
                                          onConfirmar={async (motivo) => {
                                            try {
                                              await definirCaso({
                                                data: { acessoId: a.id, casoId: v.case_id, conceder: false, motivo },
                                              });
                                              invalidar();
                                            } catch (e) {
                                              setErro((e as Error).message);
                                            }
                                          }}
                                        />
                                      ) : (
                                        <AcaoOperacional
                                          rotulo="Reativar caso"
                                          className="rounded-lg border border-navy/20 px-2.5 py-1 text-xs"
                                          acaoExterna="reativar_caso_do_acesso_portal"
                                          efeito="Reativa o vínculo deste caso ao acesso do cliente — o cliente volta a ver este caso no portal."
                                          onConfirmar={async () => {
                                            try {
                                              await definirCaso({
                                                data: { acessoId: a.id, casoId: v.case_id, conceder: true },
                                              });
                                              invalidar();
                                            } catch (e) {
                                              setErro((e as Error).message);
                                            }
                                          }}
                                        />
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
                          <EstadoDados
                            carregando={qEventos.isLoading}
                            erro={qEventos.error}
                            dados={qEventos.data}
                            aoTentarNovamente={() => void qEventos.refetch()}
                            recurso="o histórico de acesso"
                            vazio="Sem eventos registrados."
                          >
                            {(evs) => (
                              <ul className="mt-2 space-y-1 text-sm text-navy/70">
                                {evs.map((ev) => (
                                  <li key={ev.id}>
                                    {new Date(ev.occurred_at).toLocaleString("pt-BR")} —{" "}
                                    {EVENTO_LABEL[ev.event_type] ?? ev.event_type}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </EstadoDados>
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
      </EstadoDados>
    </SaasShell>
  );
}
