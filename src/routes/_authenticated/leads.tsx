import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { MultiSelecao, Secao, Selecao, Texto } from "@/components/caso/campos";
import { DerivacaoJornada } from "@/components/crm/derivacao-jornada";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { NovoLeadDialog } from "@/components/crm/novo-lead";
import { TemplatesWhatsapp } from "@/components/crm/templates-whatsapp";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { arquivarLeadDesk, listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import {
  AREAS_RESPONSAVEIS,
  CATALOGOS,
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  MOTIVOS_PERDA,
  NACIONALIDADES,
  OBJETIVOS,
  ORIGENS_LEAD,
  PROXIMAS_ACOES,
  SERVICOS_INICIAIS,
  STATUS_VIA,
  AMBIENTES_DOSSIE,
  NIVEIS_ACESSO_DOSSIE,
  PRODUTOS_RECOMENDADOS,
  DESPESAS_TERCEIROS_STATUS,
  DESPESAS_TERCEIROS_REGRA,
  DESPESAS_TERCEIROS_FAIXA,
  VIAS_JURIDICAS,
  CONSENTIMENTO_STATUS,
  CANAIS_CONSENTIMENTO,
  PAISES_LINHA_PRIORITARIA,
  PESQUISA_PREVIA_AUTORIZACAO,
  PESQUISA_PREVIA_ESCOPO,
  DOCUMENTOS_CHAVE,
  resultadoComercialDerivado,
  rotulo,
  errosBloqueantesAlteracao,
  validarLead,
  type ErroValidacao,
  type LeadDesk,
  type Opcao,
} from "@/lib/crm-desk";
import { ETAPAS_SPIN, progressoSpin, sinaisQualidadeLead, spinDerivadoDoLead } from "@/lib/discovery-roteiro";
import { calcularRadar } from "@/lib/radar-elegibilidade";
import { listarTrilhasJuridicas } from "@/lib/trilhas-juridicas.functions";
import { formatarTelefone } from "@/lib/validacao-pessoa";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "CRM de leads — Clube Ancestral" },
      { name: "description", content: "Desk comercial diário: leads, Discovery, eixos comercial e de formalização." },
      { property: "og:title", content: "CRM de leads — Clube Ancestral" },
      { property: "og:description", content: "Desk comercial diário do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

type LeadComPendencias = LeadDesk & { pendencias?: ErroValidacao[] };

function LeadsPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_fila_responsavel_prazo" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const arquivar = useServerFn(arquivarLeadDesk);
  const qc = useQueryClient();

  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const q = useQuery({
    queryKey: ["leads-desk", mostrarArquivados],
    queryFn: () => carregar({ data: { incluirArquivados: mostrarArquivados } }),
    retry: false,
  });
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [leadPendente, setLeadPendente] = useState<string | null>(null);
  const [filtroEixo, setFiltroEixo] = useState("");
  const [filtroArea, setFiltroArea] = useState("");
  // CA10-MARKETING-CONTEUDO-VIVO (09/09/2026): filtro de origem já existia
  // como campo do lead, nunca como filtro da lista — Marketing agora abre
  // esta tela para o usuário aplicar o mesmo recorte que viu no indicador.
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [novoLeadAberto, setNovoLeadAberto] = useState(false);

  const leads = (q.data ?? []) as LeadComPendencias[];
  const atual = useMemo(() => leads.find((l) => l.id === selecionado) ?? null, [leads, selecionado]);
  const editado = useMemo(() => ({ ...(atual ?? { nome: "" }), ...rascunho }) as LeadDesk, [atual, rascunho]);
  const erros = useMemo(() => (atual || Object.keys(rascunho).length ? validarLead(editado) : []), [editado, atual, rascunho]);
  const errosBloqueantes = useMemo(
    () => errosBloqueantesAlteracao(atual, editado, Object.keys(rascunho)),
    [atual, editado, rascunho],
  );

  const carregarTrilhas = useServerFn(listarTrilhasJuridicas);
  const qTrilhas = useQuery({ queryKey: ["trilhas-juridicas"], queryFn: () => carregarTrilhas(), retry: false });
  const trilhas = qTrilhas.data?.trilhas ?? [];
  const marcos = qTrilhas.data?.marcos ?? [];
  const trilhasIndisponiveis =
    !qTrilhas.isLoading && (Boolean(qTrilhas.error) || qTrilhas.data === undefined);
  const trilhaSelecionada = trilhas.find((t) => t.id === editado.trilha_referencia_id) ?? null;
  const opcoesTrilhas: Opcao[] = trilhas.map((t) => ({
    valor: t.id,
    rotulo: `${t.pais ?? "—"} · ${t.track_name ?? t.code ?? "—"} (${rotulo("status_via", t.status_via)})`,
  }));
  const opcoesMarcos: Opcao[] = marcos
    .filter((m) => !editado.trilha_referencia_id || m.track_id === editado.trilha_referencia_id)
    .map((m) => ({ valor: m.id, rotulo: `${m.label} — ${rotulo("status_marco", m.status)}` }));
  const sinais = useMemo(
    () =>
      atual || Object.keys(rascunho).length
        ? sinaisQualidadeLead(editado, {
            status_via: trilhaSelecionada?.status_via ?? editado.status_via ?? null,
            status_marco: marcos.find((m) => m.id === editado.marco_referencia_id)?.status ?? null,
          })
        : [],
    [editado, atual, rascunho, trilhaSelecionada, marcos],
  );
  const radar = useMemo(
    () =>
      calcularRadar(editado, {
        status_marco: marcos.find((m) => m.id === editado.marco_referencia_id)?.status ?? null,
      }),
    [editado, marcos],
  );
  const mutSalvar = useMutation({
    mutationFn: () =>
      salvar({
        data: { id: atual?.id ?? null, valores: { ...rascunho, ...spinDerivadoDoLead(editado) } },
      }),
    onSuccess: (r) => {
      if (!r.ok) {
        setMsg("Gravação recusada: corrija as pendências listadas.");
        return;
      }
      setMsg("Registro gravado.");
      setSelecionado(r.lead?.id ?? null);
      // Corte 1 (27/09/2026): relê antes de limpar o rascunho — sem voltar
      // a mostrar o valor antigo por um instante depois de "gravado".
      void qc.invalidateQueries({ queryKey: ["leads-desk"] }).then(() => setRascunho({}));
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const mutArquivar = useMutation({
    mutationFn: (motivo: string) => arquivar({ data: { id: String(atual?.id), motivo } }),
    onSuccess: () => {
      setMsg("Lead arquivado (sem exclusão física).");
      setSelecionado(null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const visiveis = leads.filter((l) => {
    if (filtroEixo && l.eixo_comercial !== filtroEixo) return false;
    if (filtroArea && l.area_responsavel !== filtroArea) return false;
    if (filtroOrigem && l.origem !== filtroOrigem) return false;
    if (busca && !`${l.nome} ${l.codigo ?? ""} ${l.email ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const campo = (k: string) => String((editado as Record<string, unknown>)[k] ?? "");
  const set = (k: string) => (v: unknown) => setRascunho((r) => ({ ...r, [k]: v }));
  const bool = (k: string) => Boolean((editado as Record<string, unknown>)[k]);
  const data = (k: string) => String((editado as Record<string, unknown>)[k] ?? "").slice(0, 10);

  return (
    <SaasShell titulo="CRM Vivo — Leads e triagem" descricao="Comercial → CRM Vivo: entrada, Discovery, contatos e conversas, proposta e handoff.">
      {leadPendente ? (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          Há alterações não salvas neste lead.
          <button
            type="button"
            className="rounded-md border border-terracotta/40 px-2 py-1"
            onClick={() => {
              setSelecionado(leadPendente);
              setRascunho({});
              setMsg(null);
              setLeadPendente(null);
            }}
          >
            Descartar e abrir o outro lead
          </button>
          <button type="button" className="underline" onClick={() => setLeadPendente(null)}>
            Continuar editando
          </button>
        </div>
      ) : null}
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <NovoLeadDialog
        aberto={novoLeadAberto}
        onFechar={() => setNovoLeadAberto(false)}
        onCriado={(id) => {
          setNovoLeadAberto(false);
          setRascunho({});
          setSelecionado(id);
          setMsg("Lead criado em Triagem.");
        }}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="space-y-3">
          <Secao titulo="Filtros" descricao="Todos os campos classificatórios são listas fechadas.">
            <div className="grid gap-3">
              <Texto label="Buscar por nome, código ou e-mail" valor={busca} onChange={setBusca} />
              <Selecao label="Eixo comercial" valor={filtroEixo} opcoes={EIXO_COMERCIAL} onChange={setFiltroEixo} />
              <Selecao label="Área responsável" valor={filtroArea} opcoes={AREAS_RESPONSAVEIS} onChange={setFiltroArea} />
              <Selecao label="Origem" valor={filtroOrigem} opcoes={ORIGENS_LEAD} onChange={setFiltroOrigem} />
              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" checked={mostrarArquivados} onChange={(e) => setMostrarArquivados(e.target.checked)} />
                Mostrar arquivados
              </label>
              <button
                type="button"
                className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
                onClick={() => {
                  setNovoLeadAberto(true);
                  setMsg(null);
                }}
              >
                Novo lead
              </button>
            </div>
          </Secao>

          <Secao titulo={`Leads (${visiveis.length})`} descricao="Código único gerado pelo sistema.">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data as LeadComPendencias[] | undefined}
              aoTentarNovamente={() => void q.refetch()}
              recurso="os leads"
              vazio="Nenhum lead cadastrado ainda."
            >
              {() => (
            <ul className="max-h-[520px] space-y-2 overflow-auto">
              {visiveis.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (l.id === selecionado) return;
                      // Corte 1: trocar de lead com edição pendente pede confirmação.
                      if (Object.keys(rascunho).length > 0) {
                        setLeadPendente(l.id ?? null);
                        return;
                      }
                      setSelecionado(l.id ?? null);
                      setRascunho({});
                      setMsg(null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selecionado === l.id ? "border-gold bg-cream/60" : "border-navy/10 bg-cream/40"
                    }`}
                  >
                    <span className="block font-medium text-navy">
                      {l.codigo ?? "—"} · {l.nome}
                      {l.dados_teste ? (
                        <span className="ml-2 rounded border border-navy/20 bg-cream px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wide text-navy/60">
                          dado de teste
                        </span>
                      ) : null}
                    </span>

                    <span className="block text-[11px] text-navy/55">
                      {rotulo("eixo_comercial", l.eixo_comercial)} · {rotulo("eixo_formalizacao", l.eixo_formalizacao)} ·{" "}
                      {resultadoComercialDerivado(l)}
                    </span>
                    {l.pendencias?.length ? (
                      <span className="mt-1 block text-[11px] text-terracotta">{l.pendencias.length} pendência(s)</span>
                    ) : null}
                    {l.archived_at ? <span className="block text-[11px] text-navy/40">Arquivado</span> : null}
                  </button>
                </li>
              ))}
              {!visiveis.length ? (
                <li className="text-sm text-navy/50">Nenhum lead nos filtros.</li>
              ) : null}
            </ul>
              )}
            </EstadoDados>
          </Secao>
        </div>

        <div className="space-y-3">
          {msg ? <p className="rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm text-navy">{msg}</p> : null}

          {atual ? (
            <div className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/40 px-3 py-2 text-xs">
              {atual.case_id ? (
                <Link
                  to="/casos/$caseId"
                  params={{ caseId: atual.case_id }}
                  className="rounded-lg border border-navy/20 px-2.5 py-1.5 font-medium text-navy underline-offset-2 hover:underline"
                >
                  Abrir Caso 360
                </Link>
              ) : (
                <span className="rounded-lg border border-navy/10 px-2.5 py-1.5 text-navy/50">Sem caso vinculado</span>
              )}
              {atual.cliente_id ? (
                <Link
                  to="/pessoas/$clienteId"
                  params={{ clienteId: atual.cliente_id }}
                  className="rounded-lg border border-gold/50 bg-gold/10 px-2.5 py-1.5 font-medium text-navy underline-offset-2 hover:underline"
                >
                  Abrir Pessoa 360
                </Link>
              ) : (
                <span className="rounded-lg border border-navy/10 px-2.5 py-1.5 text-navy/50">
                  Pessoa 360 após vínculo com cliente/caso
                </span>
              )}
            </div>
          ) : null}

          {atual ? <HandoffLead lead={editado} /> : null}

          {atual ? <DerivacaoJornada lead={editado} /> : null}

          <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
            <p className="text-sm font-medium text-navy">SPIN e Mesa de Discovery</p>
            <p className="mt-1 text-xs text-navy/55">
              As perguntas de Situação, Problema, Implicação e Necessidade moram no Painel de Calls,
              uma por vez, com resposta e destino. Aqui só aparece o progresso derivado — sem
              checkbox.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-4">
              {progressoSpin(editado).map((e) => {
                const meta = ETAPAS_SPIN.find((x) => x.chave === e.chave);
                return (
                  <li key={e.chave} className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-navy/50">{e.rotulo}</p>
                    <p className="font-serif text-lg tabular-nums text-navy">
                      {e.preenchidas}/{e.total}
                    </p>
                    <p className="text-[10px] text-navy/50">{meta?.paraQue}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs">
              <Link to="/calls" className="text-navy underline underline-offset-2">
                Abrir a Mesa de Discovery no Painel de Calls
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
            <p className="text-[11px] uppercase tracking-wide text-navy/45">Radar de elegibilidade preliminar</p>
            <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="font-serif text-2xl leading-tight text-navy">{radar.rotulo}</p>
              <p className="text-xs text-navy/55">
                confiança <strong className="text-navy/75">{radar.confianca}</strong> · completude{" "}
                <strong className="text-navy/75">{radar.completude}%</strong> dos fatores registrados
              </p>
            </div>
            <p className="mt-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-navy/75">
              Triagem preliminar interna ({radar.versao}). Não é parecer jurídico, não garante direito e não define prazo,
              produto ou preço. Mesmo um sinal forte depende de documentos, fontes e revisão humana.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">O que favorece</p>
                <ul className="mt-1 space-y-1 text-xs text-navy/70">
                  {radar.favoraveis.length ? (
                    radar.favoraveis.map((f) => <li key={f}>• {f}</li>)
                  ) : (
                    <li>Nenhum fator registrado ainda.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">O que precisa confirmar</p>
                <ul className="mt-1 space-y-1 text-xs text-navy/70">
                  {radar.pendentes.length ? (
                    radar.pendentes.slice(0, 6).map((p) => (
                      <li key={p.fator}>
                        • <strong>{p.fator}</strong>: {p.acao}
                      </li>
                    ))
                  ) : (
                    <li>Sem pendências de fator nesta leitura.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">Próximo passo</p>
                <p className="mt-1 text-xs text-navy/75">
                  {radar.exige_revisao_humana
                    ? "Levar a leitura para revisão humana antes de qualquer recomendação, proposta ou comunicação externa."
                    : radar.pendentes.length
                      ? `Confirmar com o cliente: ${radar.pendentes[0]?.fator}.`
                      : "Registrar decisão de Discovery e encaminhar o handoff comercial."}
                </p>
              </div>
            </div>
            {radar.bloqueios_externos.length ? (
              <ul className="mt-3 space-y-1 rounded-lg border border-terracotta/40 bg-terracotta/5 p-2 text-xs text-terracotta">
                {radar.bloqueios_externos.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-[11px] text-navy/50">{radar.observacao}</p>
          </div>

          {sinais.length ? (
            <div className="rounded-xl border border-gold/50 bg-gold/10 p-4">
              <p className="text-sm font-medium text-navy">Sinais de qualidade da ficha</p>
              <ul className="mt-2 space-y-1 text-xs text-navy/75">
                {sinais.map((s) => (
                  <li key={s.chave}>
                    <strong>{s.rotulo}</strong>: {s.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}


          {erros.length ? (
            <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
              <p className="text-sm font-medium text-terracotta">
                {errosBloqueantes.length ? "Pendências que impedem esta gravação" : "Pendências anteriores da ficha"}
              </p>
              {!errosBloqueantes.length ? (
                <p className="mt-1 text-xs text-navy/65">
                  Você pode salvar os outros campos. Para corrigir uma destas classificações, escolha um valor da lista atual.
                </p>
              ) : null}
              <ul className="mt-2 space-y-1 text-xs text-navy/70">
                {erros.map((e) => (
                  <li key={`${e.campo}-${e.motivo}`}>
                    <strong>{e.campo}</strong>: {e.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Secao titulo="Identificação e responsabilidade" descricao="Lead ativo exige área, responsável e próxima ação datada.">
            <div className="grid gap-3 md:grid-cols-2">
              <Texto label="Nome" valor={campo("nome")} onChange={set("nome")} />
              <Texto label="Código" valor={String(editado.codigo ?? "gerado ao salvar")} onChange={() => {}} desabilitado />
              <Texto label="E-mail" tipo="email" valor={campo("email")} onChange={set("email")} />
              <Texto
                label="Telefone"
                valor={campo("telefone")}
                onChange={(x) => set("telefone")(formatarTelefone(x))}
              />
              <Selecao label="Origem" valor={campo("origem")} opcoes={ORIGENS_LEAD} onChange={set("origem")} />
              <Selecao
                label="Área responsável"
                valor={campo("area_responsavel")}
                opcoes={AREAS_RESPONSAVEIS}
                onChange={set("area_responsavel")}
              />
              <Texto
                label="Responsável nominal"
                valor={campo("responsavel_nome")}
                onChange={set("responsavel_nome")}
              />
              <Selecao
                label="Próxima ação"
                valor={campo("proxima_acao")}
                opcoes={PROXIMAS_ACOES}
                onChange={set("proxima_acao")}
              />
              <Texto
                label="Data da próxima ação"
                tipo="date"
                valor={data("proxima_acao_em")}
                onChange={set("proxima_acao_em")}
              />
              <Texto
                label="Último follow-up"
                tipo="date"
                valor={data("ultimo_followup_em")}
                onChange={set("ultimo_followup_em")}
              />
            </div>
          </Secao>

          <Secao titulo="Objetivo e linha preliminar" descricao="Leitura interna preliminar; não é parecer jurídico.">
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao label="Objetivo" valor={campo("objetivo")} opcoes={OBJETIVOS} onChange={set("objetivo")} />
              <Selecao
                label="Nacionalidade de interesse"
                valor={campo("nacionalidade")}
                opcoes={NACIONALIDADES}
                onChange={set("nacionalidade")}
              />
              <Selecao
                label="Via jurídica preliminar"
                valor={campo("via_juridica_preliminar")}
                opcoes={VIAS_JURIDICAS}
                onChange={set("via_juridica_preliminar")}
              />
              <Selecao
                label="Status da via"
                valor={campo("status_via")}
                opcoes={STATUS_VIA}
                onChange={set("status_via")}
              />
              <div className="md:col-span-2">
                <Texto
                  label="Narrativa familiar (texto livre)"
                  area
                  valor={campo("narrativa_familiar")}
                  onChange={set("narrativa_familiar")}
                />
              </div>
            </div>
          </Secao>

          {/*
            23/09/2026 — R3 (autorização explícita da Proprietária):
            /calls vira a única superfície editável de call, Discovery,
            triagem e elegibilidade preliminar. Os dois formulários que
            viviam aqui (Discovery, Triagem preliminar) tinham o único
            writer destes campos, mas nunca eram a tela usada durante a
            call — mesmo defeito já corrigido para SPIN em 09/09/2026
            (ver bloco "SPIN e Mesa de Discovery" acima). Nenhum dado é
            apagado: os campos e o histórico continuam os mesmos em
            `leads`, só o formulário de edição muda de tela.
          */}
          <Secao
            titulo="Discovery e triagem preliminar"
            descricao="Edição concentrada no Painel de Calls — aqui só o resumo derivado, sem formulário duplicado."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Status da call</p>
                <p className="text-sm text-navy">{rotulo("status_call", editado.status_call)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Resultado da Discovery</p>
                <p className="text-sm text-navy">{rotulo("discovery_resultado", editado.discovery_resultado)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Call agendada em</p>
                <p className="text-sm text-navy">
                  {editado.call_agendada_em ? String(editado.call_agendada_em).slice(0, 16).replace("T", " ") : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Elegibilidade preliminar</p>
                <p className="text-sm text-navy">
                  {rotulo("elegibilidade_preliminar", editado.elegibilidade_preliminar)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs">
              <Link
                to="/calls"
                search={editado.id ? { lead: editado.id } : {}}
                className="text-navy underline underline-offset-2"
              >
                Abrir Discovery e triagem no Painel de Calls
              </Link>
            </p>
            {/*
              24/09/2026 (P1 — uma identidade do lead ao caso): a conversão
              é uma ação só, executarHandoffDiscovery, na Mesa de Discovery.
              Daqui ela abre já com este lead; nenhum segundo writer. Com caso
              já vinculado, mostra o caso em vez de oferecer nova conversão.
            */}
            {editado.id ? (
              <p className="mt-2 text-xs" data-lead-conversao>
                {editado.case_id ? (
                  <Link
                    to="/casos/$caseId"
                    params={{ caseId: String(editado.case_id) }}
                    className="font-medium text-navy underline underline-offset-2"
                  >
                    Convertido: abrir o caso vinculado
                  </Link>
                ) : (
                  <Link
                    to="/calls"
                    search={{ lead: editado.id }}
                    className="font-medium text-navy underline underline-offset-2"
                  >
                    Converter em cliente/pessoa canônica
                  </Link>
                )}
              </p>
            ) : null}
          </Secao>

          <Secao
            titulo="Dossiê-mãe autorizado"
            descricao="Dossiê só fica ativo com identificação, ambiente autorizado, link interno, nível de acesso e responsável nominal. Nada disso aparece em área de cliente."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("dossie_ativo")}
                  onChange={(e) => set("dossie_ativo")(e.target.checked)}
                />
                Dossiê-mãe ativo
              </label>
              <Texto label="Dossiê do cliente (referência interna)" valor={campo("dossie_link_interno")} onChange={set("dossie_link_interno")} />
              <Texto label="ID/nome do dossiê-mãe" valor={campo("dossie_mae_ref")} onChange={set("dossie_mae_ref")} />
              <Selecao
                label="Ambiente autorizado"
                valor={campo("dossie_ambiente")}
                opcoes={AMBIENTES_DOSSIE}
                onChange={set("dossie_ambiente")}
              />
              <Selecao
                label="Nível de acesso"
                valor={campo("dossie_nivel_acesso")}
                opcoes={NIVEIS_ACESSO_DOSSIE}
                onChange={set("dossie_nivel_acesso")}
              />
              <Texto label="Responsável pelo dossiê" valor={campo("dossie_responsavel")} onChange={set("dossie_responsavel")} />
            </div>
          </Secao>


          <Secao
            titulo="Consentimento de gravação e transcrição"
            descricao="Gravação, transcrição e uso interno só com consentimento concedido, datado, com canal e versão do aviso. Sem isso, nenhuma referência de gravação pode ser registrada."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Status do consentimento"
                valor={campo("consentimento_status")}
                opcoes={CONSENTIMENTO_STATUS}
                onChange={set("consentimento_status")}
              />
              <Texto
                label="Data/hora do consentimento"
                tipo="datetime-local"
                valor={String(editado.consentimento_em ?? "").slice(0, 16)}
                onChange={set("consentimento_em")}
              />
              <Selecao
                label="Canal do consentimento"
                valor={campo("consentimento_canal")}
                opcoes={CANAIS_CONSENTIMENTO}
                onChange={set("consentimento_canal")}
              />
              <Texto
                label="Versão do aviso apresentada"
                valor={campo("consentimento_versao_aviso")}
                onChange={set("consentimento_versao_aviso")}
              />
              <Texto
                label="Gravação (referência interna)"
                valor={campo("gravacao_link_interno")}
                onChange={set("gravacao_link_interno")}
                ajuda={
                  campo("consentimento_status") !== "concedido"
                    ? "Pendência: consentimento ainda não consta como concedido. O campo segue editável e a pendência é registrada na gravação."
                    : undefined
                }
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("consentimento_gravacao")}
                  onChange={(e) => set("consentimento_gravacao")(e.target.checked)}
                />
                Consentimento confirmado na conversa
              </label>
            </div>
          </Secao>

          {trilhasIndisponiveis ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-navy/80"
            >
              Não foi possível carregar as trilhas e marcos jurídicos. As listas de trilha e marco abaixo estão
              vazias por falha de carga, não por ausência de cadastro.{" "}
              <button type="button" className="underline" onClick={() => void qTrilhas.refetch()}>
                Tentar novamente
              </button>
            </p>
          ) : null}

          <Secao
            titulo="Linha familiar, trilha jurídica e pesquisa prévia"
            descricao="Trilhas e marcos são referência interna de triagem, nunca parecer jurídico nem garantia de direito. Pesquisa nominal externa exige autorização registrada."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="País/linha prioritária"
                valor={campo("pais_linha_prioritaria")}
                opcoes={PAISES_LINHA_PRIORITARIA}
                onChange={set("pais_linha_prioritaria")}
              />
              <Texto
                label="Localidades conhecidas (comuna, paróquia, província)"
                valor={campo("localidades_conhecidas")}
                onChange={set("localidades_conhecidas")}
              />
              <MultiSelecao
                label="Nacionalidades de interesse"
                opcoes={NACIONALIDADES}
                valores={(editado.nacionalidades_interesse ?? []) as string[]}
                onChange={set("nacionalidades_interesse")}
              />
              <MultiSelecao
                label="Documentos-chave já indicados"
                opcoes={DOCUMENTOS_CHAVE}
                valores={(editado.documentos_chave ?? []) as string[]}
                onChange={set("documentos_chave")}
              />
              <Selecao
                label="Trilha jurídica de referência"
                valor={campo("trilha_referencia_id")}
                opcoes={opcoesTrilhas}
                onChange={set("trilha_referencia_id")}
              />
              <Selecao
                label="Marco jurídico de referência"
                valor={campo("marco_referencia_id")}
                opcoes={opcoesMarcos}
                onChange={set("marco_referencia_id")}
              />
              <Selecao
                label="Autorização de pesquisa prévia"
                valor={campo("pesquisa_previa_autorizacao")}
                opcoes={PESQUISA_PREVIA_AUTORIZACAO}
                onChange={set("pesquisa_previa_autorizacao")}
              />
              <Texto
                label="Limite declarado da pesquisa prévia"
                valor={campo("pesquisa_previa_limite")}
                onChange={set("pesquisa_previa_limite")}
              />
              <MultiSelecao
                label="Escopo autorizado da pesquisa prévia"
                opcoes={PESQUISA_PREVIA_ESCOPO}
                valores={(editado.pesquisa_previa_escopo ?? []) as string[]}
                onChange={set("pesquisa_previa_escopo")}
              />
              {trilhaSelecionada ? (
                <div className="md:col-span-2 rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs text-navy/70">
                  <p className="font-medium text-navy">
                    {trilhaSelecionada.pais} · {trilhaSelecionada.track_name} — {rotulo("status_via", trilhaSelecionada.status_via)}
                  </p>
                  {trilhaSelecionada.legal_reference_summary ? <p className="mt-1">{trilhaSelecionada.legal_reference_summary}</p> : null}
                  <p className="mt-1">
                    Uso interno de triagem. Não apresentar como parecer, garantia de direito, prazo ou instrução ao cliente.
                  </p>
                </div>
              ) : null}
            </div>
          </Secao>


          <Secao
            titulo="Recomendação comercial e despesas de terceiros"
            descricao="Preço, condição e link de cobrança vêm do catálogo homologado (product_catalog). A Planilha Mestre é legado de auditoria histórica, não fonte viva. O CRM registra apenas a recomendação e a referência."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-navy">Produtos/serviços recomendados</p>
                <div className="grid gap-1 md:grid-cols-3">
                  {PRODUTOS_RECOMENDADOS.map((o) => {
                    const atuais = (editado.produtos_recomendados ?? []) as string[];
                    return (
                      <label key={o.valor} className="flex items-center gap-2 text-sm text-navy/80">
                        <input
                          type="checkbox"
                          checked={atuais.includes(o.valor)}
                          onChange={(e) =>
                            set("produtos_recomendados")(
                              e.target.checked ? [...atuais, o.valor] : atuais.filter((v) => v !== o.valor),
                            )
                          }
                        />
                        {o.rotulo}
                      </label>
                    );
                  })}
                </div>
              </div>
              <Texto label="Referência de SKU (catálogo homologado)" valor={campo("sku_referencia")} onChange={set("sku_referencia")} />
              <Selecao label="Status das despesas de terceiros" valor={campo("despesas_terceiros_status")} opcoes={DESPESAS_TERCEIROS_STATUS} onChange={set("despesas_terceiros_status")} />
              <Selecao label="Regra de pagamento das despesas" valor={campo("despesas_terceiros_regra")} opcoes={DESPESAS_TERCEIROS_REGRA} onChange={set("despesas_terceiros_regra")} />
              <Selecao label="Faixa estimada de despesas" valor={campo("despesas_terceiros_faixa")} opcoes={DESPESAS_TERCEIROS_FAIXA} onChange={set("despesas_terceiros_faixa")} />
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Despesas de terceiros são sempre do cliente: o Clube não antecipa nem reembolsa. Nenhum valor ou link de cobrança é editável aqui.
            </p>
          </Secao>

          <Secao
            titulo="Comercial e formalização"
            descricao="Preço, SKU e link de pagamento não são campo livre: registre apenas referência interna."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Eixo comercial"
                valor={campo("eixo_comercial")}
                opcoes={EIXO_COMERCIAL}
                onChange={set("eixo_comercial")}
              />
              <Selecao
                label="Eixo de formalização"
                valor={campo("eixo_formalizacao")}
                opcoes={EIXO_FORMALIZACAO}
                onChange={set("eixo_formalizacao")}
              />
              <Selecao
                label="Serviço inicial aprovado"
                valor={campo("servico_inicial_aprovado")}
                opcoes={SERVICOS_INICIAIS}
                onChange={set("servico_inicial_aprovado")}
              />
              <Selecao
                label="Motivo de perda"
                valor={campo("motivo_perda")}
                opcoes={MOTIVOS_PERDA}
                onChange={set("motivo_perda")}
              />
              <Texto
                label="Link interno da proposta"
                valor={campo("proposta_link_interno")}
                onChange={set("proposta_link_interno")}
              />
              <Texto
                label="Referência interna da proposta"
                valor={campo("proposta_referencia_interna")}
                onChange={set("proposta_referencia_interna")}
              />
              <Texto
                label="Link interno do contrato"
                valor={campo("contrato_link_interno")}
                onChange={set("contrato_link_interno")}
              />
              <Texto
                label="Referência do evento Asaas"
                valor={campo("asaas_evento_referencia")}
                onChange={set("asaas_evento_referencia")}
                ajuda="Somente referência ao evento transacional; nenhum valor ou link é criado aqui."
              />
              <Texto
                label="Pagamento previsto para"
                tipo="date"
                valor={data("pagamento_previsto_em")}
                onChange={set("pagamento_previsto_em")}
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("dados_teste")}
                  onChange={(e) => set("dados_teste")(e.target.checked)}
                />
                Registro de teste (excluído das métricas)
              </label>
            </div>
            <p className="mt-3 text-xs text-navy/55">
              Resultado comercial derivado: <strong>{resultadoComercialDerivado(editado)}</strong>
            </p>
          </Secao>

          <div className="flex flex-wrap items-start gap-2">
            {Object.keys(rascunho).length ? (
              <AcaoOperacional
                rotulo={mutSalvar.isPending ? "Gravando…" : "Gravar"}
                capacidade="editar_rascunho"
                pendenciaGate={
                  errosBloqueantes.length
                    ? errosBloqueantes.map((e) => `${e.campo}: ${e.motivo}`).join("; ")
                    : null
                }
                efeito="Grava as alterações desta ficha de lead."
                onConfirmar={async () => {
                  await mutSalvar.mutateAsync();
                }}
              />
            ) : (
              <button
                type="button"
                disabled
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
              >
                Gravar
              </button>
            )}
            {atual?.id && !atual.archived_at ? (
              <AcaoOperacional
                rotulo="Arquivar"
                variant="outline"
                capacidade="editar_rascunho"
                efeito="Arquiva o lead sem exclusão física. O registro continua consultável."
                onConfirmar={async (motivo) => {
                  await mutArquivar.mutateAsync(motivo);
                }}
              />
            ) : null}
          </div>

          <p className="text-xs text-navy/45">
            Listas controladas em uso: {Object.keys(CATALOGOS).length} campos classificatórios. Entrada fora da lista é recusada no
            servidor e no banco.
          </p>
        </div>
      </div>

      {/*
        27/08/2026 — "CRM mestre e legado nunca usei" (Proprietária). Fluxo
        comercial canônico (contacts/opportunities) e o painel de contatos
        rodavam em paralelo aqui, dentro do CRM que ela usa de verdade —
        0 registros gravados desde 21/08, confirmado no banco. Saíram para
        /historico/fluxo-comercial-canonico: nada foi apagado, só parou de
        competir visualmente com o CRM real desta tela.
      */}
      <p id="crm-contatos" className="mt-6 scroll-mt-24 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        O modelo de contatos/oportunidades (fluxo comercial canônico) nunca teve dado real gravado — virou visão
        histórica.{" "}
        <Link to="/historico/fluxo-comercial-canonico" className="underline">
          Abrir visão histórica
        </Link>
      </p>

      <div id="crm-templates" className="mt-6 scroll-mt-24">
        <TemplatesWhatsapp />
      </div>
      <p className="mt-6 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        Execução diária fica no Painel Hoje — fila única, sem contagem concorrente.{" "}
        <Link to="/painel" className="underline">
          Abrir Painel Hoje
        </Link>
      </p>

    </SaasShell>
  );
}
