import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { MultiSelecao, Secao, Selecao, Texto } from "@/components/caso/campos";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { TriagemAncestralScanDoLead } from "@/components/crm/triagem-ancestralscan";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { useAutoridade } from "@/components/saas/autoridade";
import { CaCard } from "@/components/ui/ca-card";
import { listarLeadsDesk, salvarLeadDesk, trilhaDoLead } from "@/lib/crm-desk.functions";
import { executarHandoffDiscovery } from "@/lib/handoff-discovery.functions";
import { podeExecutarHandoffDiscovery } from "@/lib/handoff-discovery";
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
  ELEGIBILIDADE_PRELIMINAR,
  CONFIANCA_TRIAGEM,
  GERACOES_ASCENDENTE,
  LINHAS_TRANSMISSAO,
  RISCOS_RUPTURA,
  COMPLEXIDADE_DOCUMENTAL,
  ESTADO_DOCUMENTAL_INICIAL,
  PENDENCIAS_DOCUMENTAIS,
  EXIGE_IDIOMA_ENTREVISTA,
  ESTRUTURAS_FAMILIARES,
  OBJECOES,
  NIVEIS_INTENCAO,
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
import { CrmKanban } from "@/components/clube-ancestral-kit";
import { CAMPO_LEAD_POR_VARREDURA, codigoLeadDoAchado, type Achado } from "@/lib/varredura-whatsapp";
import { filaCrmVivo, statusPedeMotivo } from "@/lib/crm-vivo";

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

const CARTAO = "rounded-xl border border-navy/10 bg-cream/40 p-4";

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
              atual.etapa === e.chave ? "border-gold bg-gold/15 text-navy" : "border-navy/15 bg-cream/40 text-navy/70"
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

/**
 * P2 CRM Vivo: trilha do lead (call agendada/realizada, no-show, cancelada,
 * discovery concluída, handoff, conversão), lida de audit_logs. A RLS de
 * auditoria só deixa administrador ler; lista vazia para os demais é dita.
 */
function TrilhaDoLead({ leadId }: { leadId: string }) {
  const carregar = useServerFn(trilhaDoLead);
  const q = useQuery({
    queryKey: ["trilha-lead", leadId],
    queryFn: () => carregar({ data: { leadId } }),
  });
  const linhas = q.data ?? [];
  return (
    <div className={CARTAO} data-trilha-lead>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Trilha do lead</p>
      {q.isLoading ? (
        <p className="mt-2 text-xs text-navy/60">Carregando trilha…</p>
      ) : q.isError ? (
        <p role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-xs text-terracotta">
          Não foi possível ler a trilha. Isto é falha de leitura, não ausência de eventos.
          <button type="button" onClick={() => void q.refetch()} className="underline">
            Tentar novamente
          </button>
        </p>
      ) : !linhas.length ? (
        <p className="mt-2 text-xs text-navy/60">
          Nenhum evento visível. A trilha de auditoria só é lida por administradores da organização;
          os eventos continuam sendo gravados.
        </p>
      ) : (
        <ol className="mt-2 space-y-1 border-l border-navy/15 pl-3">
          {linhas.map((l) => (
            <li key={l.id} className="text-xs text-navy">
              <span className="text-navy/50">{new Date(l.created_at).toLocaleString("pt-BR")}</span> — {l.rotulo}
              {l.motivo ? ` · motivo: ${l.motivo}` : ""}
              {l.motivoPendente ? " · motivo pendente" : ""}
              {l.codigoCaso ? ` · caso ${l.codigoCaso}` : ""}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function PainelCalls({ leadIdInicial }: { leadIdInicial?: string } = {}) {
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const handoffFn = useServerFn(executarHandoffDiscovery);
  const navegar = useNavigate();
  const qc = useQueryClient();
  const autoridade = useAutoridade();

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
  const [selecionado, setSelecionado] = useState<string | null>(leadIdInicial ?? null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  // P2 CRM Vivo (24/09/2026): no-show e cancelamento exigem motivo, gravado
  // na trilha do lead (audit_logs) junto com o evento nomeado da call.
  const [motivoCall, setMotivoCall] = useState("");
  const [candidatosCliente, setCandidatosCliente] = useState<
    Array<{ id: string; nome: string; motivo: string }>
  >([]);

  useEffect(() => {
    if (leadIdInicial) setSelecionado(leadIdInicial);
  }, [leadIdInicial]);
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
  // P2: as sete filas do CRM Vivo derivadas do mesmo lead (sem cópia).
  const filasVivo = useMemo(() => filaCrmVivo(visiveis, hoje), [visiveis, hoje]);

  const leadBase = visiveis.find((l) => l.id === selecionado) ?? null;
  const lead = leadBase ? ({ ...leadBase, ...rascunho } as LeadDesk) : null;
  const avaliacao = lead ? avaliarHandoffCall(lead) : null;
  // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: "Usar esta pessoa"/"Criar pessoa
  // nova" chamam a mesma mutation (mutarHandoff) que "Concluir handoff",
  // mas disparavam sem a checagem de capacidade/gate que este só tem —
  // as três portas para a mesma escrita externa precisam do mesmo guard.
  const gateHandoff = lead ? podeExecutarHandoffDiscovery(lead) : { ok: false, motivo: "Selecione um lead" };
  // P2: o motivo só é exigido quando o status muda para no-show/cancelada
  // neste rascunho (mesma regra do servidor: só mudança vira evento).
  const statusNoRascunho = rascunho.status_call as string | null | undefined;
  const motivoExigido =
    statusNoRascunho !== undefined &&
    statusPedeMotivo(statusNoRascunho) &&
    statusNoRascunho !== (leadBase?.status_call ?? null);
  // Proprietária: pendência informa, não impede (o servidor faz o mesmo).
  const faltaMotivo = motivoExigido && !motivoCall.trim() && !autoridade.proprietaria;

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
      const atualizado = !multi
        ? { ...r, [campo]: codigo }
        : (() => {
            const atual = ((r[campo] as string[] | undefined) ?? (lead as any)?.[campo] ?? []) as string[];
            return atual.includes(codigo) ? r : { ...r, [campo]: [...atual, codigo] };
          })();
      /*
        CA-JURIDICO-MESA-DISCOVERY (24/09/2026) — pedido explícito da
        Proprietária: o contexto jurídico por país (citizenship_tracks, já
        carregado acima em `trilhas` para o campo "Trilha jurídica de
        referência") deve complementar a Mesa Discovery. A varredura já
        aponta o país (ex.: "Itália"); a trilha correspondente já existe e
        já é exibida nesta mesma tela — só nunca era ligada automaticamente,
        obrigando reescolher o mesmo país num segundo dropdown. Só sugere
        quando o lead ainda não tem trilha escolhida — nunca sobrescreve
        uma escolha humana anterior.
      */
      if (
        campo === "nacionalidades_interesse" &&
        !atualizado["trilha_referencia_id"] &&
        !(lead as any)?.trilha_referencia_id
      ) {
        const trilha = trilhas.find((t: any) => t.pais === valor);
        if (trilha) return { ...atualizado, trilha_referencia_id: trilha.id };
      }
      return atualizado;
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
        data: {
          id: selecionado,
          valores: { ...valores, ...spinDerivadoDoLead(merged) },
          motivoCall: motivoCall.trim() || null,
        },
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
      setMotivoCall("");
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
      void qc.invalidateQueries({ queryKey: ["trilha-lead"] });
      void qc.invalidateQueries({ queryKey: ["painel-desk-hoje"] });
      void qc.invalidateQueries({ queryKey: ["painel-cadencia"] });
      void refetch();
    },
    onError: (e: any) => setAviso(e?.message ?? "Falha ao gravar."),
  });

  const mutarHandoff = useMutation({
    mutationFn: (opcoes?: {
      clienteIdConfirmado?: string | null;
      forcarCriarCliente?: boolean;
      motivoOverride?: string | null;
    }) =>
      handoffFn({
        data: {
          leadId: selecionado!,
          clienteIdConfirmado: opcoes?.clienteIdConfirmado ?? null,
          forcarCriarCliente: opcoes?.forcarCriarCliente === true,
          rascunho,
          motivoOverride: opcoes?.motivoOverride ?? null,
        },
      }),
    onSuccess: (r) => {
      if (!r.ok && "precisaConfirmarCliente" in r && r.precisaConfirmarCliente) {
        setCandidatosCliente(r.candidatos);
        setAviso(
          "Há pessoa com o mesmo telefone. Confirme se é a mesma ou crie outra — fundir errado é pior.",
        );
        return;
      }
      if (!r.ok) {
        setAviso("Handoff não concluído.");
        return;
      }
      setCandidatosCliente([]);
      setRascunho({});
      const partes = [
        r.clienteCriado ? "pessoa criada" : "pessoa reutilizada",
        r.casoCriado ? "caso aberto" : "caso já ligado",
        r.codigoCaso ? `código ${r.codigoCaso}` : null,
      ].filter(Boolean);
      setAviso(
        `Handoff gravado: ${partes.join(" · ")}. Abrindo Propostas — o handoff cria pessoa e caso; a proposta comercial é o próximo passo.`,
      );
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
      void qc.invalidateQueries({ queryKey: ["painel-desk-hoje"] });
      void qc.invalidateQueries({ queryKey: ["painel-cadencia"] });
      void refetch();
      void qc.invalidateQueries({ queryKey: ["trilha-lead"] });
      void navegar({ to: "/propostas" });
    },
    onError: (e: Error) => setAviso(e.message),
  });

  const set = (campo: string) => (v: string | boolean) =>
    setRascunho((r) => ({ ...r, [campo]: v === "" ? null : v }));
  const setArray = (campo: string) => (v: string[]) => setRascunho((r) => ({ ...r, [campo]: v }));
  const campo = (c: keyof LeadDesk) => String((lead?.[c] as string | null | undefined) ?? "");
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
    } else {
      controle = <Texto label={rotuloCampo} valor={campo(campoId as keyof LeadDesk)} onChange={set(campoId)} />;
    }

    return (
      <div key={campoId} className="rounded-lg border border-navy/10 bg-cream/40 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="min-w-0 text-[11px] text-navy/55">{meta.porQueImporta}</p>
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
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-cream/50"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => virarHipoteseAchado(campoId, a.valor, multi)}
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-cream/50"
              >
                Virar hipótese
              </button>
              <button
                type="button"
                onClick={() => ignorarAchado(campoId, a.valor)}
                className="rounded border border-navy/20 px-1.5 py-0.5 text-navy hover:bg-cream/50"
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

      <Secao
        titulo="Mesa de Discovery"
        descricao="Aqui a entrada comercial funciona: varredura, uma pergunta SPIN por vez, próxima ação e handoff. Os KPIs do que está parado ou vencido ficam no Hoje. Toda triagem é sinal interno — não conclui elegibilidade nem envia proposta."
      >
        {/*
          DSA-4-CRM-VIVO (21/09/2026): quarto consumidor do Desk a usar
          `CaCard` (após DSA-1 qualidade.tsx, DSA-2 painel.tsx, DSA-3
          pesquisa-modulo.index.tsx), sem título/eyebrow para não duplicar o
          cabeçalho que `Secao` já fornece — só o contêiner de cartão dos
          cinco números-resumo. Nenhum dado, mutation ou o Kanban abaixo
          (clube-ancestral-kit, fora deste corte) foi tocado.
        */}
        <CaCard className="p-3 sm:p-4">
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
        </CaCard>
        <label className="mt-3 flex items-center gap-2 text-xs text-navy/70">
          <input
            type="checkbox"
            checked={mostrarTeste}
            onChange={(e) => setMostrarTeste(e.target.checked)}
          />
          Exibir registros de teste/demonstração (fora das métricas reais)
        </label>
        {/*
          P2 CRM VIVO (24/09/2026): as sete pendências do CRM Vivo, derivadas
          das mesmas linhas de `leads` que /leads edita (filaCrmVivo). Não é
          aba nova nem kanban paralelo: cada nome abre o registro nesta Mesa.
        */}
        <div aria-label="Fila CRM Vivo" data-fila-crm-vivo className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {filasVivo.map((f) => (
            <div key={f.chave} className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-navy/60">
                {f.rotulo} · <span className="font-semibold text-navy">{f.leads.length}</span>
              </p>
              {f.leads.length ? (
                <ul className="mt-1 space-y-0.5">
                  {f.leads.slice(0, 5).map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelecionado(l.id ?? null);
                          setRascunho({});
                          setMotivoCall("");
                          setAviso(null);
                          setIndicePergunta(indicePrimeiraPerguntaPendente(l));
                        }}
                        className="text-left text-xs text-navy underline decoration-gold/60 underline-offset-2 hover:decoration-gold"
                      >
                        {l.nome || "Lead sem nome"}
                      </button>
                    </li>
                  ))}
                  {f.leads.length > 5 ? (
                    <li className="text-[11px] text-navy/50">+{f.leads.length - 5} nesta fila</li>
                  ) : null}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-navy/45">Nada pendente.</p>
              )}
            </div>
          ))}
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

      <section aria-label="Funil visual do CRM" className="space-y-2">
        <div>
          <h2 className="font-serif text-lg text-navy">CRM Vivo</h2>
          <p className="text-xs text-navy/60">
            Leads reais organizados pelas filas da Mesa, com responsável, prazo e próximo passo.
          </p>
        </div>
        {isLoading ? (
          <p className={`${CARTAO} text-xs text-navy/60`}>Carregando CRM…</p>
        ) : (
          <CrmKanban
            columns={filas.map((fila) => ({
              id: fila.chave,
              title: fila.rotulo,
              items: fila.leads.slice(0, 8).map((item) => ({
                id: item.id ?? `lead-${fila.chave}-${item.nome}`,
                title: item.nome || "Lead sem nome",
                context: ROTULO_ESTADO_CALL[estadoCall(item)],
                owner: item.responsavel_nome || "A definir",
                due: item.proxima_acao_em
                  ? String(item.proxima_acao_em).slice(0, 10)
                  : "Sem prazo",
                nextAction: item.proxima_acao || "Próximo passo não definido",
                alert: acaoVencida(item, hoje) ? "Lead com ação vencida" : undefined,
                tone: acaoVencida(item, hoje) ? "attention" : "neutral",
              })),
            }))}
          />
        )}
      </section>

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
                        setMotivoCall("");
                        setAviso(null);
                        setIndicePergunta(indicePrimeiraPerguntaPendente(l));
                      }}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-xs ${
                        selecionado === l.id
                          ? "border-gold bg-gold/10"
                          : "border-navy/10 bg-cream/40 hover:border-navy/30"
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
            <p className={`${CARTAO} text-sm text-navy/60`}>
              Selecione um lead à esquerda para registrar a call.
            </p>
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
                  {statusPedeMotivo(campo("status_call")) ? (
                    <Texto
                      label="Motivo do no-show ou cancelamento"
                      valor={motivoCall}
                      onChange={(v) => setMotivoCall(String(v))}
                      ajuda={
                        motivoExigido && autoridade.proprietaria
                          ? "Fica na trilha do lead. Sem motivo, a gravação segue e o motivo fica como pendência."
                          : motivoExigido
                          ? "Obrigatório para gravar: fica na trilha do lead junto com o evento da call."
                          : "Já registrado na trilha do lead. Preencha só se o status mudar de novo."
                      }
                    />
                  ) : null}
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

              {/*
                23/09/2026 — R3: /calls vira a única superfície editável de
                Discovery/Triagem. Esta seção movida de /leads (que tinha o
                único writer destes campos, mas nunca era a tela usada
                durante a call) — nenhum campo novo, mesmo vocabulário
                fechado (crm-desk.ts), mesmo padrão campo/set já usado acima.
              */}
              <Secao
                titulo="Triagem preliminar (Discovery)"
                descricao="Leitura comercial/técnica preliminar. Não é decisão jurídica final nem promessa de resultado."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Selecao label="Elegibilidade preliminar" valor={campo("elegibilidade_preliminar")} opcoes={ELEGIBILIDADE_PRELIMINAR} onChange={set("elegibilidade_preliminar")} />
                  <Selecao label="Confiança da triagem" valor={campo("confianca_triagem")} opcoes={CONFIANCA_TRIAGEM} onChange={set("confianca_triagem")} />
                  <Selecao label="Geração do ascendente" valor={campo("geracao_ascendente")} opcoes={GERACOES_ASCENDENTE} onChange={set("geracao_ascendente")} />
                  <Selecao label="Linha de transmissão" valor={campo("linha_transmissao")} opcoes={LINHAS_TRANSMISSAO} onChange={set("linha_transmissao")} />
                  <Selecao label="Risco de ruptura" valor={campo("risco_ruptura")} opcoes={RISCOS_RUPTURA} onChange={set("risco_ruptura")} />
                  <Selecao label="Complexidade documental" valor={campo("complexidade_documental")} opcoes={COMPLEXIDADE_DOCUMENTAL} onChange={set("complexidade_documental")} />
                  <Selecao label="Estado documental inicial" valor={campo("estado_documental_inicial")} opcoes={ESTADO_DOCUMENTAL_INICIAL} onChange={set("estado_documental_inicial")} />
                  <Selecao label="Pendência documental prioritária" valor={campo("pendencia_documental_prioritaria")} opcoes={PENDENCIAS_DOCUMENTAIS} onChange={set("pendencia_documental_prioritaria")} />
                  <Selecao label="Exige idioma/entrevista" valor={campo("exige_idioma_entrevista")} opcoes={EXIGE_IDIOMA_ENTREVISTA} onChange={set("exige_idioma_entrevista")} />
                  <Texto label="Requerentes potenciais" tipo="number" valor={campo("requerentes_potenciais")} onChange={set("requerentes_potenciais")} />
                  <Selecao label="Estrutura familiar" valor={campo("estrutura_familiar")} opcoes={ESTRUTURAS_FAMILIARES} onChange={set("estrutura_familiar")} />
                  <Selecao label="Objeção predominante" valor={campo("objecao_predominante")} opcoes={OBJECOES} onChange={set("objecao_predominante")} />
                  <Selecao label="Nível de intenção" valor={campo("nivel_intencao")} opcoes={NIVEIS_INTENCAO} onChange={set("nivel_intencao")} />
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

              {candidatosCliente.length > 0 ? (
                <div className={`${CARTAO} space-y-2 border-gold/40 bg-gold/5`}>
                  <p className="text-sm font-medium text-navy">
                    Confirme a pessoa antes do handoff
                  </p>
                  <p className="text-xs text-navy/65">
                    O telefone bate com cadastro existente. Escolha a ficha certa ou crie outra —
                    não fundimos por nome.
                  </p>
                  <ul className="space-y-2">
                    {candidatosCliente.map((c) => (
                      <li
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-sm"
                      >
                        <span>
                          <strong>{c.nome}</strong>
                          <span className="ml-2 text-xs text-navy/55">{c.motivo}</span>
                        </span>
                        <AcaoOperacional
                          rotulo="Usar esta pessoa"
                          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 disabled:opacity-40"
                          capacidade="avancar_caso_planejador_tarefa"
                          pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}
                          efeito="Cria ou reutiliza o caso vinculado a esta pessoa e leva a próxima ação — sem envio externo."
                          onConfirmar={(motivo) => mutarHandoff.mutate({ clienteIdConfirmado: c.id, motivoOverride: motivo || null })}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <AcaoOperacional
                      rotulo="Criar pessoa nova"
                      className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
                      capacidade="avancar_caso_planejador_tarefa"
                      pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}
                      efeito="Cria uma pessoa nova (sem fundir com o candidato listado), cria ou reutiliza o caso e leva a próxima ação."
                      onConfirmar={(motivo) => mutarHandoff.mutate({ forcarCriarCliente: true, motivoOverride: motivo || null })}
                    />
                    <button
                      type="button"
                      onClick={() => setCandidatosCliente([])}
                      className="text-xs text-navy/60 underline"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}

              <div className={`${CARTAO} flex flex-wrap items-center gap-3`}>
                <button
                  type="button"
                  disabled={mutar.isPending || !Object.keys(rascunho).length || faltaMotivo}
                  onClick={() => mutar.mutate({ ...rascunho, ...spinDerivadoDoLead(lead) })}
                  className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                >
                  {mutar.isPending ? "Gravando…" : "Gravar registro da call"}
                </button>
                {faltaMotivo ? (
                  <span className="text-xs text-terracotta">Informe o motivo do no-show ou cancelamento.</span>
                ) : null}
                <AcaoOperacional
                  rotulo="Converter em cliente/pessoa canônica e abrir o caso"
                  capacidade="avancar_caso_planejador_tarefa"
                  pendenciaGate={gateHandoff.ok ? null : gateHandoff.motivo}
                  validacaoFormulario={!selecionado ? "Selecione um lead na Mesa" : null}
                  efeito="Cria ou reutiliza pessoa e caso, grava o vínculo no lead e leva a próxima ação — sem envio externo."
                  onConfirmar={(motivo) => mutarHandoff.mutate({ motivoOverride: motivo || null })}
                  className="rounded-lg border border-gold bg-gold/15 px-4 py-2 text-sm text-navy"
                />
                {rascunho && Object.keys(rascunho).length ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRascunho({});
                      setMotivoCall("");
                    }}
                    className="text-xs text-navy/60 underline"
                  >
                    Descartar alterações
                  </button>
                ) : null}
                {aviso ? <span className="text-xs text-navy/70">{aviso}</span> : null}
              </div>

              {lead.id ? (
                <TriagemAncestralScanDoLead
                  leadId={lead.id}
                  trilhasAtivas={trilhas}
                  trilhaJaEscolhida={Boolean(lead.trilha_referencia_id)}
                />
              ) : null}
              {lead.id ? <TrilhaDoLead leadId={lead.id} /> : null}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
