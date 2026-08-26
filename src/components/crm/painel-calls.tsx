import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { useSaas } from "@/components/saas/shell";
import { listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import {
  CANAIS_CONSENTIMENTO,
  COMPLEXIDADE_DOCUMENTAL,
  CONFIANCA_TRIAGEM,
  CONSENTIMENTO_STATUS,
  ELEGIBILIDADE_PRELIMINAR,
  ESTADO_DOCUMENTAL_INICIAL,
  GERACOES_ASCENDENTE,
  LINHAS_TRANSMISSAO,
  NIVEIS_INTENCAO,
  OBJECOES,
  PROXIMAS_ACOES,
  RESULTADOS_DISCOVERY,
  STATUS_CALL,
  VIAS_JURIDICAS,
  rotulo,
  type LeadDesk,
} from "@/lib/crm-desk";
import { ROTEIRO_DISCOVERY } from "@/lib/discovery-roteiro";
import {
  ROTULO_ESTADO_CALL,
  avaliarHandoffCall,
  estadoCall,
  filasCalls,
  resumoCalls,
  type Pendencia,
} from "@/lib/painel-calls";
import { VarreduraWhatsApp } from "@/components/crm/varredura-whatsapp";

const CARTAO = "rounded-xl border border-navy/10 bg-white p-4";

function Pendencias({ titulo, itens }: { titulo: string; itens: Pendencia[] }) {
  if (!itens.length) {
    return (
      <p className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-navy">
        {titulo}: sem pendências.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
      <p className="font-medium">
        {titulo} — {itens.length} bloqueio(s)
      </p>
      <ul className="mt-1 space-y-1">
        {itens.map((p) => (
          <li key={`${p.campo}-${p.motivo}`}>• {p.motivo}</li>
        ))}
      </ul>
    </div>
  );
}

export function PainelCalls() {
  const { podeEscrever } = useSaas();
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads-desk"],
    queryFn: () => carregar(),
  });
  const [mostrarTeste, setMostrarTeste] = useState(false);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [aviso, setAviso] = useState<string | null>(null);

  const hoje = new Date().toISOString();
  const visiveis = useMemo(
    () => (leads as LeadDesk[]).filter((l) => (mostrarTeste ? true : !l.dados_teste)),
    [leads, mostrarTeste],
  );
  const filas = useMemo(() => filasCalls(visiveis, hoje), [visiveis, hoje]);
  const resumo = useMemo(() => resumoCalls(visiveis, hoje), [visiveis, hoje]);

  const leadBase = visiveis.find((l) => l.id === selecionado) ?? null;
  const lead = leadBase ? ({ ...leadBase, ...rascunho } as LeadDesk) : null;
  const avaliacao = lead ? avaliarHandoffCall(lead) : null;

  const mutar = useMutation({
    mutationFn: (valores: Record<string, unknown>) =>
      salvar({ data: { id: selecionado, valores } }),
    onSuccess: (r: any) => {
      if (r?.ok === false) {
        setAviso(
          r.erros?.map((e: any) => e.motivo).join(" · ") ?? "Registro não aceito pelas validações.",
        );
        return;
      }
      setAviso("Registro gravado no lead canônico com auditoria.");
      setRascunho({});
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: any) => setAviso(e?.message ?? "Falha ao gravar."),
  });

  const set = (campo: string) => (v: string | boolean) =>
    setRascunho((r) => ({ ...r, [campo]: v === "" ? null : v }));
  const campo = (c: keyof LeadDesk) => String((lead?.[c] as string | null | undefined) ?? "");

  return (
    <div className="space-y-4">
      {/*
        26/08/2026 — o Painel pedia campos estruturados e a Proprietária
        descreveu o que acontece de verdade: ela cola o dump do WhatsApp do
        prospect. A varredura fica ANTES do formulário porque é dela que sai o
        material para preenchê-lo.
      */}
      <VarreduraWhatsApp />

      <Secao
        titulo="Painel de Calls"
        descricao="Registro da chamada, qualificação preliminar e handoff. Toda triagem é sinal interno: não conclui elegibilidade jurídica, não envia proposta, contrato, cobrança nem mensagem."
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Calls de hoje", resumo.hoje],
            ["Aguardando registro", resumo.aguardandoRegistro],
            ["Qualificação pendente", resumo.qualificacaoPendente],
            ["Pronto para handoff", resumo.prontoHandoff],
            ["Sem agenda", resumo.semAgenda],
          ].map(([r, n]) => (
            <div key={String(r)} className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-navy/55">{r}</p>
              <p className="font-serif text-xl text-navy">{n as number}</p>
            </div>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-navy/70">
          <input
            type="checkbox"
            checked={mostrarTeste}
            onChange={(e) => setMostrarTeste(e.target.checked)}
          />
          Exibir registros de teste/demonstração (fora das métricas reais)
        </label>
      </Secao>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {isLoading ? <p className={`${CARTAO} text-xs text-navy/60`}>Carregando calls…</p> : null}
          {filas.map((f) => (
            <div key={f.chave} className={CARTAO}>
              <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
                {f.rotulo} · {f.leads.length}
              </p>
              <ul className="mt-2 space-y-1">
                {f.leads.slice(0, 25).map((l) => (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelecionado(l.id ?? null);
                        setRascunho({});
                        setAviso(null);
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                        selecionado === l.id
                          ? "border-gold bg-gold/10"
                          : "border-navy/10 bg-white hover:border-navy/30"
                      }`}
                    >
                      <span className="block font-medium text-navy">
                        {l.nome}
                        {l.dados_teste ? (
                          <span className="ml-1 text-[10px] uppercase text-terracotta">
                            fixture
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[11px] text-navy/55">
                        {ROTULO_ESTADO_CALL[estadoCall(l)]}
                        {l.call_agendada_em
                          ? ` · ${String(l.call_agendada_em).slice(0, 16).replace("T", " ")}`
                          : ""}
                      </span>
                    </button>
                  </li>
                ))}
                {!f.leads.length ? (
                  <li className="text-xs text-navy/45">Nenhum lead nesta fila.</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {!lead ? (
            <p className={`${CARTAO} text-sm text-navy/60`}>
              Selecione um lead à esquerda para registrar a call.
            </p>
          ) : (
            <>
              <Secao
                titulo={`Registro da call — ${lead.nome}`}
                descricao="Grava no lead canônico do CRM. Não cria ficha paralela."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Selecao
                    label="Status da call"
                    valor={campo("status_call")}
                    opcoes={STATUS_CALL}
                    onChange={set("status_call")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Resultado da Discovery"
                    valor={campo("discovery_resultado")}
                    opcoes={RESULTADOS_DISCOVERY}
                    onChange={set("discovery_resultado")}
                    desabilitado={!podeEscrever}
                  />
                  <Texto
                    label="Call agendada em"
                    tipo="datetime-local"
                    valor={campo("call_agendada_em").slice(0, 16)}
                    onChange={set("call_agendada_em")}
                    desabilitado={!podeEscrever}
                  />
                  <Texto
                    label="Call realizada em"
                    tipo="datetime-local"
                    valor={campo("call_realizada_em").slice(0, 16)}
                    onChange={set("call_realizada_em")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Próxima ação"
                    valor={campo("proxima_acao")}
                    opcoes={PROXIMAS_ACOES}
                    onChange={set("proxima_acao")}
                    desabilitado={!podeEscrever}
                  />
                  <Texto
                    label="Prazo da próxima ação"
                    tipo="date"
                    valor={campo("proxima_acao_em").slice(0, 10)}
                    onChange={set("proxima_acao_em")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Consentimento de gravação"
                    valor={campo("consentimento_status")}
                    opcoes={CONSENTIMENTO_STATUS}
                    onChange={set("consentimento_status")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Canal do consentimento"
                    valor={campo("consentimento_canal")}
                    opcoes={CANAIS_CONSENTIMENTO}
                    onChange={set("consentimento_canal")}
                    desabilitado={!podeEscrever}
                  />
                  <Texto
                    label="Consentimento registrado em"
                    tipo="datetime-local"
                    valor={campo("consentimento_em").slice(0, 16)}
                    onChange={set("consentimento_em")}
                    desabilitado={!podeEscrever}
                  />
                </div>
                <div className="mt-3">
                  <Texto
                    label="Resumo interno da call"
                    area
                    valor={campo("resumo_call")}
                    onChange={set("resumo_call")}
                    desabilitado={!podeEscrever}
                    ajuda="Linguagem de sinal e hipótese. Não registrar juízo de mérito nem promessa de resultado."
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-navy">
                    <input
                      type="checkbox"
                      disabled={!podeEscrever}
                      checked={Boolean(lead.resumo_validado)}
                      onChange={(e) =>
                        setRascunho((r) => ({ ...r, resumo_validado: e.target.checked }))
                      }
                    />
                    Resumo validado por quem atendeu
                  </label>
                </div>
                <div className="mt-3">
                  <Pendencias titulo="Bloqueios do registro" itens={avaliacao?.registro ?? []} />
                </div>
              </Secao>

              <Secao
                titulo="Qualificação preliminar"
                descricao="Sinal interno de triagem. Não é parecer jurídico nem confirmação de elegibilidade."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Selecao
                    label="Elegibilidade preliminar"
                    valor={campo("elegibilidade_preliminar")}
                    opcoes={ELEGIBILIDADE_PRELIMINAR}
                    onChange={set("elegibilidade_preliminar")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Confiança da triagem"
                    valor={campo("confianca_triagem")}
                    opcoes={CONFIANCA_TRIAGEM}
                    onChange={set("confianca_triagem")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Nível de intenção"
                    valor={campo("nivel_intencao")}
                    opcoes={NIVEIS_INTENCAO}
                    onChange={set("nivel_intencao")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Objeção predominante"
                    valor={campo("objecao_predominante")}
                    opcoes={OBJECOES}
                    onChange={set("objecao_predominante")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Via jurídica preliminar"
                    valor={campo("via_juridica_preliminar")}
                    opcoes={VIAS_JURIDICAS}
                    onChange={set("via_juridica_preliminar")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Geração do ascendente"
                    valor={campo("geracao_ascendente")}
                    opcoes={GERACOES_ASCENDENTE}
                    onChange={set("geracao_ascendente")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Linha de transmissão"
                    valor={campo("linha_transmissao")}
                    opcoes={LINHAS_TRANSMISSAO}
                    onChange={set("linha_transmissao")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Estado documental inicial"
                    valor={campo("estado_documental_inicial")}
                    opcoes={ESTADO_DOCUMENTAL_INICIAL}
                    onChange={set("estado_documental_inicial")}
                    desabilitado={!podeEscrever}
                  />
                  <Selecao
                    label="Complexidade documental"
                    valor={campo("complexidade_documental")}
                    opcoes={COMPLEXIDADE_DOCUMENTAL}
                    onChange={set("complexidade_documental")}
                    desabilitado={!podeEscrever}
                  />
                </div>
                <div className="mt-3">
                  <Pendencias
                    titulo="Bloqueios da qualificação"
                    itens={avaliacao?.qualificacao ?? []}
                  />
                </div>
              </Secao>

              <Secao
                titulo="Handoff da Discovery"
                descricao="O handoff só é liberado com registro completo, qualificação registrada e responsável, próxima ação e prazo definidos."
              >
                <p className="text-xs text-navy/65">
                  Destino derivado:{" "}
                  <strong>
                    {
                      {
                        proposta: "Preparar proposta",
                        nutricao: "Nutrição/reagendamento",
                        encerrar_sem_aderencia: "Encerrar sem aderência",
                        indefinido: "Indefinido — registrar resultado",
                      }[avaliacao?.destino ?? "indefinido"]
                    }
                  </strong>
                  {" · "}Resultado:{" "}
                  {lead.discovery_resultado
                    ? rotulo("discovery_resultado", lead.discovery_resultado)
                    : "não registrado"}
                </p>
                <div className="mt-3">
                  <Pendencias titulo="Bloqueios do handoff" itens={avaliacao?.handoff ?? []} />
                </div>
                <div className="mt-3">
                  <HandoffLead lead={lead} />
                </div>
              </Secao>

              <div className={`${CARTAO} flex flex-wrap items-center gap-3`}>
                <button
                  type="button"
                  disabled={!podeEscrever || mutar.isPending || !Object.keys(rascunho).length}
                  onClick={() => mutar.mutate(rascunho)}
                  className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                >
                  Gravar registro da call
                </button>
                <button
                  type="button"
                  disabled={
                    !podeEscrever ||
                    mutar.isPending ||
                    !avaliacao?.liberado ||
                    avaliacao?.destino !== "proposta"
                  }
                  onClick={() =>
                    mutar.mutate({ ...rascunho, eixo_comercial: "diagnostico_em_elaboracao" })
                  }
                  className="rounded-lg border border-gold bg-gold/15 px-4 py-2 text-sm text-navy disabled:opacity-40"
                  title="Move o eixo comercial para diagnóstico. Nenhum envio externo é executado."
                >
                  Concluir handoff para diagnóstico
                </button>
                {rascunho && Object.keys(rascunho).length ? (
                  <button
                    type="button"
                    onClick={() => setRascunho({})}
                    className="text-xs text-navy/60 underline"
                  >
                    Descartar alterações
                  </button>
                ) : null}
                {aviso ? <span className="text-xs text-navy/70">{aviso}</span> : null}
              </div>

              <Secao
                titulo="Roteiro vivo de Discovery"
                descricao="Guia contextual de perguntas. Não é formulário obrigatório e não conclui rota jurídica, prazo ou preço."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {ROTEIRO_DISCOVERY.map((b) => (
                    <div key={b.chave} className="rounded-lg border border-navy/10 bg-cream/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">
                        {b.titulo}
                      </p>
                      <ul className="mt-1 space-y-1 text-xs text-navy/70">
                        {b.perguntas.map((p) => (
                          <li key={p}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Secao>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
