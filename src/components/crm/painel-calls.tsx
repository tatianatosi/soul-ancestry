import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type ReactNode } from "react";

import { MultiSelecao, Secao, Selecao, Texto } from "@/components/caso/campos";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { NovoLeadDialog } from "@/components/crm/novo-lead";
import { listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import { salvarTarefa } from "@/lib/ops.functions";
import { listarTrilhasJuridicas } from "@/lib/trilhas-juridicas.functions";
import {
  CANAIS_CONSENTIMENTO,
  CATALOGOS,
  CONSENTIMENTO_STATUS,
  DOCUMENTOS_CHAVE,
  NACIONALIDADES,
  PESQUISA_PREVIA_ESCOPO,
  RESULTADOS_DISCOVERY,
  STATUS_CALL,
  rotulo,
  type LeadDesk,
  type Opcao,
} from "@/lib/crm-desk";
import {
  ETAPAS_SPIN,
  META_CAMPO_ROTEIRO,
  PERGUNTAS_MESA,
  ROTULO_CAMPO_ROTEIRO,
  ROTULO_ESTADO_RESPOSTA,
  estadoResposta,
  indicePrimeiraPerguntaPendente,
  perguntaDaMesaPorCampo,
  progressoSpin,
  spinDerivadoDoLead,
  type EstadoRespostaRoteiro,
} from "@/lib/discovery-roteiro";
import {
  ROTULO_ESTADO_CALL,
  acaoVencida,
  avaliarHandoffCall,
  corComplexidade,
  corElegibilidade,
  estadoCall,
  filasCalls,
  resumoCalls,
  type Pendencia,
  type SinalCor,
} from "@/lib/painel-calls";
import { VarreduraWhatsApp } from "@/components/crm/varredura-whatsapp";
import { CAMPO_LEAD_POR_VARREDURA, codigoLeadDoAchado, type Achado } from "@/lib/varredura-whatsapp";

/** Catálogos de seleção múltipla — não vivem em CATALOGOS (só campo único). */
const CATALOGO_MULTI: Record<string, Opcao[]> = {
  nacionalidades_interesse: NACIONALIDADES,
  documentos_chave: DOCUMENTOS_CHAVE,
  pesquisa_previa_escopo: PESQUISA_PREVIA_ESCOPO,
};

const CORES_ESTADO_RESPOSTA: Record<EstadoRespostaRoteiro, string> = {
  confirmado: "border-sage/50 bg-sage/15 text-navy",
  informado_a_confirmar: "border-gold/50 bg-gold/15 text-atencao",
  hipotese: "border-atencao/40 bg-atencao-suave text-atencao",
  pendente: "border-navy/15 bg-navy/5 text-navy/50",
};

const CARTAO = "rounded-xl border border-navy/10 bg-white p-4";

const CORES_SELO: Record<Exclude<SinalCor, "neutro">, string> = {
  verde: "border-sage/50 bg-sage/15 text-navy",
  amarelo: "border-gold/50 bg-gold/15 text-atencao",
  vermelho: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  laranja: "border-atencao/40 bg-atencao-suave text-atencao",
};

/** Sinal visual — seção 5 (formatação condicional) da especificação do Painel de Calls. */
function Selo({ cor, children }: { cor: SinalCor; children: React.ReactNode }) {
  if (cor === "neutro") return null;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${CORES_SELO[cor]}`}>
      {children}
    </span>
  );
}

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

function MesaDiscovery({
  lead,
  indice,
  onIndice,
  renderCampo,
  onTarefa,
  tarefaPendente,
}: {
  lead: LeadDesk;
  indice: number;
  onIndice: (n: number) => void;
  renderCampo: (campoId: string) => ReactNode;
  onTarefa: () => void;
  tarefaPendente: boolean;
}) {
  const i = Math.min(Math.max(indice, 0), PERGUNTAS_MESA.length - 1);
  const atual = PERGUNTAS_MESA[i]!;
  const etapa = ETAPAS_SPIN.find((e) => e.chave === atual.etapa)!;
  const spin = progressoSpin(lead);
  const metaPrimeiro = META_CAMPO_ROTEIRO[atual.campos[0] ?? ""];

  return (
    <Secao
      titulo="Mesa de Discovery"
      descricao="Uma pergunta por vez, na ordem SPIN. A resposta vai para o lead canônico. Salvar rascunho não exige o roteiro inteiro. Nada aqui é parecer jurídico."
    >
      <div className="mb-3 flex flex-wrap gap-2" data-mesa-spin>
        {spin.map((e) => (
          <button
            key={e.chave}
            type="button"
            data-spin-etapa={e.chave}
            onClick={() => {
              const primeiro = PERGUNTAS_MESA.findIndex((p) => p.etapa === e.chave);
              if (primeiro >= 0) onIndice(primeiro);
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] ${
              atual.etapa === e.chave ? "border-gold bg-gold/15 text-navy" : "border-navy/15 bg-white text-navy/70"
            }`}
          >
            {e.rotulo} · {e.preenchidas}/{e.total}
          </button>
        ))}
        <Selo cor={corElegibilidade(lead.elegibilidade_preliminar)}>
          Elegibilidade: {rotulo("elegibilidade_preliminar", lead.elegibilidade_preliminar)}
        </Selo>
        <Selo cor={corComplexidade(lead.complexidade_documental)}>
          Complexidade: {rotulo("complexidade_documental", lead.complexidade_documental)}
        </Selo>
      </div>

      <div
        data-mesa-discovery
        data-pergunta={atual.id}
        data-pergunta-mesa={atual.id}
        data-etapa={atual.etapa}
        className="rounded-xl border border-navy/10 bg-cream/30 p-4"
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/55">
          {etapa.rotulo} · pergunta {i + 1} de {PERGUNTAS_MESA.length}
        </p>
        <h3 className="mt-1 font-serif text-lg text-navy">{atual.pergunta}</h3>
        <p className="mt-1 text-xs text-navy/60">{etapa.paraQue}</p>
        {metaPrimeiro ? <p className="mt-2 text-xs text-navy/55">{metaPrimeiro.porQueImporta}</p> : null}

        <div className="mt-3 space-y-2">
          {atual.campos.map((c) => renderCampo(c))}
        </div>

        {atual.campos.includes("proxima_acao") ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-navy/10 pt-3">
            <button
              type="button"
              disabled={!lead.case_id || !lead.proxima_acao || !lead.proxima_acao_em || tarefaPendente}
              onClick={onTarefa}
              title={
                lead.case_id
                  ? "Cria ou reaproveita a tarefa no caso a partir da próxima ação."
                  : "Só disponível depois do handoff, quando o lead já tem caso."
              }
              className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 disabled:opacity-40"
            >
              Criar/atualizar tarefa desta próxima ação
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={i === 0}
            onClick={() => onIndice(i - 1)}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
          >
            Pergunta anterior
          </button>
          <button
            type="button"
            disabled={i >= PERGUNTAS_MESA.length - 1}
            onClick={() => onIndice(i + 1)}
            className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
          >
            Próxima pergunta
          </button>
        </div>
      </div>
    </Secao>
  );
}

export function PainelCalls() {
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const qc = useQueryClient();

  const {
    data: leads = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["leads-desk"],
    queryFn: () => carregar(),
  });
  const [mostrarTeste, setMostrarTeste] = useState(false);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [novoLeadAberto, setNovoLeadAberto] = useState(false);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  // CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026): achados da varredura de
  // WhatsApp, vivos só nesta tela (a conversa nunca é persistida). Hipótese
  // e achado ignorado são por lead+campo para não vazar de um lead a outro.
  const [achados, setAchados] = useState<Achado[]>([]);
  const [hipoteses, setHipoteses] = useState<Set<string>>(new Set());
  const [ignorados, setIgnorados] = useState<Set<string>>(new Set());
  const [indicePergunta, setIndicePergunta] = useState(0);
  const chaveLeadCampo = (campo: string) => `${selecionado ?? ""}:${campo}`;

  const carregarTrilhas = useServerFn(listarTrilhasJuridicas);
  const qTrilhas = useQuery({ queryKey: ["trilhas-juridicas"], queryFn: () => carregarTrilhas(), retry: false });
  const trilhas = qTrilhas.data?.trilhas ?? [];
  const marcos = qTrilhas.data?.marcos ?? [];

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

  const opcoesTrilhas: Opcao[] = trilhas.map((t: any) => ({
    valor: t.id,
    rotulo: `${t.pais ?? "—"} · ${t.track_name ?? t.code ?? "—"} (${rotulo("status_via", t.status_via)})`,
  }));
  const opcoesMarcos: Opcao[] = marcos
    .filter((m: any) => !lead?.trilha_referencia_id || m.track_id === lead.trilha_referencia_id)
    .map((m: any) => ({ valor: m.id, rotulo: `${m.label} — ${rotulo("status_marco", m.status)}` }));
  const trilhaSelecionada = trilhas.find((t: any) => t.id === lead?.trilha_referencia_id) ?? null;

  /** Achados de WhatsApp ainda não aplicados a este campo, deste lead. */
  const achadosDoCampo = (campo: string): Achado[] => {
    const valorAtual = (lead as unknown as Record<string, unknown>)?.[campo];
    const jaTem = new Set(Array.isArray(valorAtual) ? valorAtual : valorAtual ? [String(valorAtual)] : []);
    return achados.filter((a) => {
      if (a.campo !== campo) return false;
      if (ignorados.has(`${chaveLeadCampo(campo)}:${a.valor}`)) return false;
      const codigo = codigoLeadDoAchado(a);
      return !jaTem.has(a.valor) && !(codigo && jaTem.has(codigo));
    });
  };

  const aplicarAchado = (campo: string, valor: string, multi: boolean) => {
    const codigo = codigoLeadDoAchado({ campo: campo as Achado["campo"], valor }) ?? valor;
    setRascunho((r) => {
      if (!multi) return { ...r, [campo]: codigo };
      const atual = ((r[campo] as string[] | undefined) ?? (lead as any)?.[campo] ?? []) as string[];
      return atual.includes(codigo) ? r : { ...r, [campo]: [...atual, codigo] };
    });
    setHipoteses((s) => {
      const n = new Set(s);
      n.delete(chaveLeadCampo(campo));
      return n;
    });
  };
  const virarHipoteseAchado = (campo: string, valor: string, multi: boolean) => {
    aplicarAchado(campo, valor, multi);
    setHipoteses((s) => new Set(s).add(chaveLeadCampo(campo)));
  };
  const ignorarAchado = (campo: string, valor: string) =>
    setIgnorados((s) => new Set(s).add(`${chaveLeadCampo(campo)}:${valor}`));
  const alternarHipotese = (campo: string) =>
    setHipoteses((s) => {
      const n = new Set(s);
      const chave = chaveLeadCampo(campo);
      if (n.has(chave)) n.delete(chave);
      else n.add(chave);
      return n;
    });

  const mutar = useMutation({
    mutationFn: (valores: Record<string, unknown>) => {
      const merged = { ...(lead ?? {}), ...valores } as LeadDesk;
      return salvar({
        data: { id: selecionado, valores: { ...valores, ...spinDerivadoDoLead(merged) } },
      });
    },
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
      void qc.invalidateQueries({ queryKey: ["painel-desk-hoje"] });
      void qc.invalidateQueries({ queryKey: ["painel-cadencia"] });
      void refetch();
    },
    onError: (e: any) => setAviso(e?.message ?? "Falha ao gravar."),
  });

  const set = (campo: string) => (v: string | boolean) =>
    setRascunho((r) => ({ ...r, [campo]: v === "" ? null : v }));
  const setArray = (campo: string) => (v: string[]) => setRascunho((r) => ({ ...r, [campo]: v }));
  const campo = (c: keyof LeadDesk) => String((lead?.[c] as string | null | undefined) ?? "");
  const campoBool = (c: keyof LeadDesk) => Boolean(lead?.[c]);
  const campoArray = (c: keyof LeadDesk) => ((lead?.[c] as string[] | null | undefined) ?? []) as string[];

  // Item 6 da missão: só cria/atualiza tarefa quando há consequência real —
  // responsável + prazo definidos E já existe caso (antes do handoff, a
  // "próxima ação" do próprio lead já é o registro; tarefa é coisa de caso).
  const criarTarefaFn = useServerFn(salvarTarefa);
  const mTarefaProximaAcao = useMutation({
    mutationFn: () =>
      criarTarefaFn({
        data: {
          valores: {
            caso_id: lead?.case_id,
            titulo: `${rotulo("proxima_acao", lead?.proxima_acao)} — ${lead?.nome}`,
            prazo: lead?.proxima_acao_em,
            tipo: "discovery",
          },
        },
      }),
    onSuccess: () => setAviso("Tarefa criada/reaproveitada no caso a partir da próxima ação."),
    onError: (e: Error) => setAviso(e.message),
  });

  /**
   * Controle de um campo dentro do card da pergunta SPIN.
   * A pergunta em si mora no card da Mesa, não numa lista ao lado.
   */
  function renderCampoRoteiro(campoId: string) {
    const meta = META_CAMPO_ROTEIRO[campoId];
    if (!meta || !lead) return null;
    const rotuloCampo = ROTULO_CAMPO_ROTEIRO[campoId] ?? campoId;
    const estado = estadoResposta({
      valorSalvo: (leadBase as unknown as Record<string, unknown> | null)?.[campoId],
      valorRascunho: (lead as unknown as Record<string, unknown>)[campoId],
      emRascunho: campoId in rascunho,
      marcadaComoHipotese: hipoteses.has(chaveLeadCampo(campoId)),
    });
    const achadosPendentes = achadosDoCampo(campoId);
    const multi = meta.tipo === "multi";

    let controle: ReactNode;
    if (meta.tipo === "select") {
      controle = (
        <Selecao label={rotuloCampo} valor={campo(campoId as keyof LeadDesk)} opcoes={CATALOGOS[campoId] ?? []} onChange={set(campoId)} />
      );
    } else if (meta.tipo === "multi") {
      controle = (
        <MultiSelecao
          label={rotuloCampo}
          opcoes={CATALOGO_MULTI[campoId] ?? []}
          valores={campoArray(campoId as keyof LeadDesk)}
          onChange={setArray(campoId)}
        />
      );
    } else if (meta.tipo === "numero") {
      controle = (
        <Texto label={rotuloCampo} tipo="number" valor={campo(campoId as keyof LeadDesk)} onChange={set(campoId)} />
      );
    } else if (meta.tipo === "data") {
      controle = (
        <Texto label={rotuloCampo} tipo="date" valor={campo(campoId as keyof LeadDesk).slice(0, 10)} onChange={set(campoId)} />
      );
    } else if (meta.tipo === "trilha") {
      controle = <Selecao label={rotuloCampo} valor={campo("trilha_referencia_id")} opcoes={opcoesTrilhas} onChange={set("trilha_referencia_id")} />;
    } else if (meta.tipo === "marco") {
      controle = <Selecao label={rotuloCampo} valor={campo("marco_referencia_id")} opcoes={opcoesMarcos} onChange={set("marco_referencia_id")} />;
    } else if (meta.tipo === "checkbox") {
      controle = (
        <label className="flex items-start gap-2 text-sm text-navy">
          <input
            type="checkbox"
            className="mt-1"
            checked={campoBool(campoId as keyof LeadDesk)}
            onChange={(e) => set(campoId)(e.target.checked)}
          />
          <span>
            <span className="font-medium">{rotuloCampo}</span>
            {meta.pergunta ? <span className="mt-0.5 block text-[11px] font-normal text-navy/60">{meta.pergunta}</span> : null}
          </span>
        </label>
      );
    } else {
      controle = <Texto label={rotuloCampo} valor={campo(campoId as keyof LeadDesk)} onChange={set(campoId)} />;
    }

    return (
      <div key={campoId} className="rounded-lg border border-navy/10 bg-white p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {meta.pergunta && meta.tipo !== "checkbox" ? (
              <p className="text-[12px] font-medium text-navy">{meta.pergunta}</p>
            ) : null}
            <p className="text-[11px] text-navy/55">{meta.porQueImporta}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${CORES_ESTADO_RESPOSTA[estado]}`}>
            {ROTULO_ESTADO_RESPOSTA[estado]}
          </span>
        </div>

        <div className="mt-2">{controle}</div>

        {(estado === "confirmado" || estado === "hipotese") && meta.tipo !== "trilha" && meta.tipo !== "marco" ? (
          <button
            type="button"
            onClick={() => alternarHipotese(campoId)}
            className="mt-1 text-[10px] text-navy/50 underline"
          >
            {estado === "hipotese" ? "Tratar como confirmado" : "Marcar como hipótese"}
          </button>
        ) : null}

        {campoId === "trilha_referencia_id" && trilhaSelecionada ? (
          <div className="mt-2 rounded-lg border border-navy/10 bg-cream/40 p-2 text-[11px] text-navy/70">
            <p className="font-medium text-navy">
              {trilhaSelecionada.pais} · {trilhaSelecionada.track_name} — {rotulo("status_via", trilhaSelecionada.status_via)}
            </p>
            {trilhaSelecionada.legal_reference_summary ? <p className="mt-1">{trilhaSelecionada.legal_reference_summary}</p> : null}
            <p className="mt-1">
              Uso interno de triagem. Não apresentar como parecer, garantia de direito, prazo ou instrução ao cliente.
            </p>
          </div>
        ) : null}

        {achadosPendentes.map((a) => (
          <div key={`${a.campo}-${a.valor}`} className="mt-2 rounded-lg border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy">
            <p>
              <strong>Informado via WhatsApp — a confirmar:</strong> {a.valor}
            </p>
            <p className="mt-1 border-l-2 border-navy/15 pl-2 italic text-navy/65">“{a.trecho}”</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => aplicarAchado(campoId, a.valor, multi)}
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-white"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => virarHipoteseAchado(campoId, a.valor, multi)}
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-white"
              >
                Virar hipótese
              </button>
              <button
                type="button"
                onClick={() => ignorarAchado(campoId, a.valor)}
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-white"
              >
                Ignorar
              </button>
            </div>
          </div>
        ))}

        <p className="mt-2 text-[10px] text-navy/45">
          Vai para: {meta.destino}. {meta.consequencia}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/*
        26/08/2026 — o Painel pedia campos estruturados e a Proprietária
        descreveu o que acontece de verdade: ela cola o dump do WhatsApp do
        prospect. A varredura fica ANTES do formulário porque é dela que sai o
        material para preenchê-lo.
      */}
      <VarreduraWhatsApp
        onAchadosMudaram={setAchados}
        leadNome={lead?.nome}
        onAplicar={(a) => {
          const dest = CAMPO_LEAD_POR_VARREDURA[a.campo];
          if (!dest) return;
          aplicarAchado(dest.campoLead, a.valor, dest.multi);
          const p = perguntaDaMesaPorCampo(dest.campoLead);
          if (p) setIndicePergunta(PERGUNTAS_MESA.findIndex((x) => x.id === p.id));
        }}
      />

      {isError ? (
        <p
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
        >
          Não foi possível carregar os leads. Isto é falha de leitura, não fila vazia.
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      <NovoLeadDialog
        aberto={novoLeadAberto}
        onFechar={() => setNovoLeadAberto(false)}
        onCriado={(id) => {
          setNovoLeadAberto(false);
          setRascunho({});
          setAviso(id ? "Lead criado. Continue a Discovery neste registro." : null);
          if (id) {
            setSelecionado(id);
            setIndicePergunta(0);
          }
          void qc.invalidateQueries({ queryKey: ["leads-desk"] });
        }}
      />

      <Secao
        titulo="Mesa de Discovery"
        descricao="Crie o lead aqui ou abra um existente à esquerda. Depois: varredura, uma pergunta SPIN por vez, próxima ação e handoff. Os KPIs do que está parado ficam no Hoje. Triagem é sinal interno — não conclui elegibilidade nem envia proposta."
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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
            onClick={() => {
              setNovoLeadAberto(true);
              setAviso(null);
            }}
          >
            Novo lead
          </button>
          <label className="flex items-center gap-2 text-xs text-navy/70">
            <input
              type="checkbox"
              checked={mostrarTeste}
              onChange={(e) => setMostrarTeste(e.target.checked)}
            />
            Exibir registros de teste/demonstração (fora das métricas reais)
          </label>
        </div>
        <p className="mt-2 text-xs text-navy/60">
          Regras do CRM:{" "}
          <Link to="/crm-mestre" className="underline decoration-gold underline-offset-2">
            CRM Mestre
          </Link>
          {" · "}
          <Link to="/governanca/dicionario-calls-crm" className="underline decoration-gold underline-offset-2">
            Dicionário Calls → CRM
          </Link>
        </p>
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
                        setIndicePergunta(indicePrimeiraPerguntaPendente(l));
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                        selecionado === l.id
                          ? "border-gold bg-gold/10"
                          : "border-navy/10 bg-white hover:border-navy/30"
                      }`}
                    >
                      <span className="flex flex-wrap items-center gap-1 font-medium text-navy">
                        {l.nome}
                        {l.dados_teste ? (
                          <span className="text-[10px] uppercase text-terracotta">fixture</span>
                        ) : null}
                        <Selo cor={corElegibilidade(l.elegibilidade_preliminar)}>
                          {rotulo("elegibilidade_preliminar", l.elegibilidade_preliminar)}
                        </Selo>
                        {estadoCall(l) === "no_show" ? <Selo cor="vermelho">No-show</Selo> : null}
                        {acaoVencida(l, hoje) ? <Selo cor="vermelho">Ação vencida</Selo> : null}
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
            <div className={`${CARTAO} space-y-3 text-sm text-navy/70`}>
              <p>
                Crie um lead com <strong className="font-medium text-navy">Novo lead</strong> acima, ou
                selecione um existente à esquerda para registrar a call.
              </p>
              <button
                type="button"
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5"
                onClick={() => setNovoLeadAberto(true)}
              >
                Novo lead
              </button>
            </div>
          ) : (
            <>
              <Secao
                titulo={`Registro da call — ${lead.nome}`}
                descricao="Grava no lead canônico do CRM. Não cria ficha paralela. Próxima ação e prazo ficam no roteiro abaixo, no card 'Decisão e próximo passo'."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Selecao
                    label="Status da call"
                    valor={campo("status_call")}
                    opcoes={STATUS_CALL}
                    onChange={set("status_call")}
                  />
                  <Selecao
                    label="Resultado da Discovery"
                    valor={campo("discovery_resultado")}
                    opcoes={RESULTADOS_DISCOVERY}
                    onChange={set("discovery_resultado")}
                  />
                  <Texto
                    label="Call agendada em"
                    tipo="datetime-local"
                    valor={campo("call_agendada_em").slice(0, 16)}
                    onChange={set("call_agendada_em")}
                  />
                  <Texto
                    label="Call realizada em"
                    tipo="datetime-local"
                    valor={campo("call_realizada_em").slice(0, 16)}
                    onChange={set("call_realizada_em")}
                  />
                  <Selecao
                    label="Consentimento de gravação"
                    valor={campo("consentimento_status")}
                    opcoes={CONSENTIMENTO_STATUS}
                    onChange={set("consentimento_status")}
                  />
                  <Selecao
                    label="Canal do consentimento"
                    valor={campo("consentimento_canal")}
                    opcoes={CANAIS_CONSENTIMENTO}
                    onChange={set("consentimento_canal")}
                  />
                  <Texto
                    label="Consentimento registrado em"
                    tipo="datetime-local"
                    valor={campo("consentimento_em").slice(0, 16)}
                    onChange={set("consentimento_em")}
                  />
                </div>
                <div className="mt-3">
                  <Texto
                    label="Resumo interno da call"
                    area
                    valor={campo("resumo_call")}
                    onChange={set("resumo_call")}
                    ajuda="Linguagem de sinal e hipótese. Não registrar juízo de mérito nem promessa de resultado."
                  />
                  <label className="mt-2 flex items-center gap-2 text-xs text-navy">
                    <input
                      type="checkbox"
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

              <MesaDiscovery
                lead={lead}
                indice={indicePergunta}
                onIndice={setIndicePergunta}
                renderCampo={renderCampoRoteiro}
                onTarefa={() => mTarefaProximaAcao.mutate()}
                tarefaPendente={mTarefaProximaAcao.isPending}
              />
              <div className="mt-3">
                <Pendencias
                  titulo="Bloqueios da qualificação"
                  itens={avaliacao?.qualificacao ?? []}
                />
              </div>

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
                  <Pendencias
                    titulo="Regras do dicionário CA-04 (informam, não travam o rascunho)"
                    itens={avaliacao?.dicionario ?? []}
                  />
                </div>
                <div className="mt-3">
                  <HandoffLead lead={lead} />
                </div>
              </Secao>

              <div className={`${CARTAO} flex flex-wrap items-center gap-3`}>
                <button
                  type="button"
                  disabled={mutar.isPending || !Object.keys(rascunho).length}
                  onClick={() => mutar.mutate({ ...rascunho, ...spinDerivadoDoLead(lead) })}
                  className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                >
                  Gravar registro da call
                </button>
                <button
                  type="button"
                  disabled={
                    mutar.isPending ||
                    !avaliacao?.liberado ||
                    avaliacao?.destino !== "proposta"
                  }
                  onClick={() =>
                    mutar.mutate({
                      ...rascunho,
                      ...spinDerivadoDoLead(lead),
                      eixo_comercial: "diagnostico_em_elaboracao",
                    })
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

            </>
          )}
        </div>
      </div>
    </div>
  );
}
