/**
 * As cinco superfícies do kit visual ligadas ao eixo canônico `crm_casos`.
 *
 * 14/09/2026 — substitui o aviso "sem ponte real" por leitura autenticada.
 * Só leitura: os componentes consomem `carregarSuperficiesKit`, que roda como
 * o usuário logado (RLS da organização). Nenhum dado é inventado — quando não
 * há registro, a tela declara ausência em vez de estimar.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  ComercialTemplate,
  FormalizacaoFinanceiroTemplate,
  GovernancaTemplate,
  HojeTemplate,
  PesquisaBibliotecaTemplate,
  type BarDatum,
  type KanbanItem,
} from "@/components/clube-ancestral-kit";
import { carregarSuperficiesKit, type SuperficiesKit } from "@/lib/kit-superficies.functions";
import { listarLeadsDesk } from "@/lib/crm-desk.functions";
import { etapaComercialDoLead, porEtapaComercial, rotuloEtapaComercial } from "@/lib/golive-comercial";

function Falha({ mensagem }: { mensagem: string }) {
  return (
    <p role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
      {mensagem}
    </p>
  );
}

function Carregando({ rotulo }: { rotulo: string }) {
  return <p className="rounded-xl border border-navy/10 bg-cream/40 p-4 text-sm text-navy/60">{rotulo}…</p>;
}

function useLeadsDesk() {
  const carregar = useServerFn(listarLeadsDesk);
  return useQuery({
    // A MESMA chave do PainelCalls (`crm/painel-calls.tsx`): as duas
    // superfícies vivem em /calls e compartilham o cache em vez de buscar
    // duas vezes a mesma lista.
    queryKey: ["leads-desk"],
    queryFn: () => carregar(),
    retry: false,
  });
}

function useSuperficies() {
  const carregar = useServerFn(carregarSuperficiesKit);
  return useQuery({
    queryKey: ["kit-superficies"],
    queryFn: () => carregar({}),
    retry: false,
  });
}

function barras(
  itens: { label: string; value: number }[],
  total: number,
  tone: BarDatum["tone"],
  unidade: "caso" | "lead" = "caso",
): BarDatum[] {
  if (!itens.length) return [];
  return itens.slice(0, 6).map((item) => ({
    label: item.label,
    value: total > 0 ? Math.round((item.value / total) * 100) : 0,
    detail: `${item.value} ${unidade}${item.value === 1 ? "" : "s"}`,
    tone,
  }));
}

function dataBr(valor: string | null) {
  if (!valor) return undefined;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? valor : d.toLocaleDateString("pt-BR");
}

/**
 * Pipeline do Comercial / CRM Vivo — colunas por ETAPA COMERCIAL (§12).
 *
 * 22/09/2026: antes o pipeline desta superfície vinha de `colunasPorFase`, que
 * percorre `dados.destaques` — CASOS — e agrupa por `caso.fase`. §12 pede
 * lead, responsável, origem, próxima ação, data e bloqueio, e a sua própria
 * seção "Legado" nomeia o que existia: "Pipeline que mistura prospect, caso
 * ativo e cliente já encerrado sem estado explícito".
 *
 * A etapa vem de `etapaComercialDoLead`, a mesma regra que o funil do
 * /golive/comercial usa — uma definição, não duas.
 *
 * §12 também manda não deixar passar "cards de lead sem próxima ação/
 * responsável". Aqui isso não é omissão: vira `alert` visível no cartão.
 */
export function colunasPorEtapaComercial(
  leads: readonly Record<string, unknown>[],
): { id: string; title: string; items: KanbanItem[] }[] {
  const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const mapa = new Map<string, KanbanItem[]>();
  for (const lead of leads) {
    const chave = etapaComercialDoLead(lead) ?? "Sem etapa registrada";
    const responsavel = texto(lead["responsavel_nome"]);
    const proximaAcao = texto(lead["proxima_acao"]);
    /*
      §12 pede o campo `bloqueio` no card do pipeline. Não existe coluna
      "bloqueio" em `leads`, mas existem vocabulários fechados que
      significam bloqueio de progresso comercial (RESULTADOS_DISCOVERY e
      CONSENTIMENTO_STATUS em crm-desk.ts). O bloqueio é derivado deles
      — nada inventado, tudo do enum canônico.
    */
    const bloqueios: string[] = [];
    if (lead["discovery_resultado"] === "sem_aderencia") bloqueios.push("sem aderência");
    if (lead["consentimento_status"] === "recusado") bloqueios.push("consentimento recusado");
    const faltando = [
      responsavel ? null : "responsável",
      proximaAcao ? null : "próxima ação",
    ].filter(Boolean);
    // Alerta prioriza bloqueio real do dado — falta de responsável/ação
    // fica em segundo plano se já houver bloqueio identificado.
    const alertText = bloqueios.length
      ? `Bloqueado: ${bloqueios.join(" · ")}`
      : faltando.length
        ? `Sem ${faltando.join(" e ")}`
        : null;
    const item: KanbanItem = {
      id: String(lead["id"]),
      title: texto(lead["nome"]) ?? "Lead sem nome registrado",
      context: texto(lead["origem"]) ?? undefined,
      owner: responsavel ?? undefined,
      due: dataBr(texto(lead["proxima_acao_em"])),
      nextAction: proximaAcao ?? "Sem próxima ação registrada",
      ...(alertText ? { alert: alertText } : {}),
      ...(bloqueios.length ? { tone: "attention" as const } : {}),
    };
    mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
  }
  return [...mapa.entries()].map(([chave, items]) => ({
    id: chave,
    title: chave === "Sem etapa registrada" ? chave : rotuloEtapaComercial(chave),
    items,
  }));
}

/**
 * Casos agrupados por fase. Deixou de alimentar o Comercial (§12 quer leads),
 * mas continua sendo a leitura certa para superfícies de caso — não é peça
 * morta, é peça no lugar errado que voltou para o seu lugar.
 */
function colunasPorFase(dados: SuperficiesKit): { id: string; title: string; items: KanbanItem[] }[] {
  const mapa = new Map<string, KanbanItem[]>();
  for (const caso of dados.destaques) {
    const chave = caso.fase ?? caso.status ?? "Sem fase registrada";
    const item: KanbanItem = {
      id: caso.id,
      title: caso.titulo ?? caso.codigo ?? "Caso sem título registrado",
      context: caso.codigo ?? undefined,
      owner: caso.responsavel ?? undefined,
      due: dataBr(caso.prazo),
      nextAction: caso.proximaAcao ?? "Sem próxima ação registrada",
      ...(caso.proximaAcao ? {} : { alert: "Próxima ação não registrada" }),
    };
    mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
  }
  return [...mapa.entries()].map(([title, items]) => ({ id: title, title, items }));
}

/** Grupo 1 · Hoje, com exceções reais do eixo de casos. */
export function HojeConectado() {
  const q = useSuperficies();
  if (q.isLoading) return <Carregando rotulo="Carregando os indicadores do dia" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura dos casos falhou. Isto é erro de leitura, não ausência de casos." />;
  const d = q.data;

  return (
    <HojeTemplate
      kpis={[
        { label: "Casos em carteira", value: d.totalCasos, detail: "Registros ativos na organização" },
        { label: "Casos ativados", value: d.casosAtivos, detail: "Com ativação registrada" },
        { label: "Prazo vencido", value: d.vencidos, detail: "Próxima ação com prazo passado", tone: d.vencidos ? "critical" : "neutral" },
        { label: "Sem próxima ação", value: d.semProximaAcao, detail: "Casos sem passo definido", tone: d.semProximaAcao ? "attention" : "neutral" },
        { label: "Aguardando externo", value: d.esperaExterna, detail: "Espera declarada de instituição" },
      ]}
      alerts={[
        ...(d.vencidos ? [{ context: "Prazos", message: `${d.vencidos} caso(s) com prazo vencido`, tone: "critical" as const }] : []),
        ...(d.semProximaAcao ? [{ context: "Condução", message: `${d.semProximaAcao} caso(s) sem próxima ação`, tone: "attention" as const }] : []),
        ...(d.semResponsavel ? [{ context: "Responsável", message: `${d.semResponsavel} caso(s) sem responsável`, tone: "attention" as const }] : []),
      ]}
    />
  );
}

/** Grupo 2 · Marketing & Comercial, funil e CRM lidos do eixo real. */
export function ComercialConectado() {
  const q = useSuperficies();
  // Mesma queryKey do PainelCalls, que roda na MESMA rota /calls: uma busca de
  // leads para as duas superfícies, não duas.
  const leads = useLeadsDesk();
  if (q.isLoading || leads.isLoading) return <Carregando rotulo="Carregando o funil comercial" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura do funil falhou. Isto é erro de leitura, não funil vazio." />;
  if (leads.isError) return <Falha mensagem="A leitura dos leads falhou. Isto é erro de leitura, não pipeline vazio." />;
  const d = q.data;

  /*
    §12 pede "chip de qualidade de dados" no cabeçalho: mostra se o pipeline
    está com dado real e quando foi a última atualização. `demo/dados_teste`
    já filtrados no server, então "com dado real" é qualquer lead que passou
    pelo filtro; a última atualização vem do maior `updated_at` recebido.
  */
  const listaLeads = (leads.data ?? []) as Array<Record<string, unknown>>;
  const qualquerAtualizacao = listaLeads
    .map((l) => (typeof l["updated_at"] === "string" ? Date.parse(l["updated_at"] as string) : NaN))
    .filter((t) => Number.isFinite(t));
  const ultimaAtualizacao = qualquerAtualizacao.length
    ? new Date(Math.max(...qualquerAtualizacao))
    : null;
  const chipQualidade =
    listaLeads.length === 0
      ? { texto: "Sem leads reais", tom: "attention" as const }
      : ultimaAtualizacao
        ? { texto: `Atualizado em ${ultimaAtualizacao.toLocaleDateString("pt-BR")}`, tom: "neutral" as const }
        : { texto: `${listaLeads.length} leads · sem data de atualização`, tom: "attention" as const };

  /*
    22/09/2026 — achado real: o funil vinha do agregado de casos por eixo
    comercial (`crm_casos`), enquanto o pipeline logo abaixo é `listaLeads`
    (leads) — duas entidades diferentes na mesma superfície, sem garantia de
    correspondência. Corrigido para contar sobre o MESMO array e a MESMA
    classificação de etapa que alimentam o pipeline.
  */
  return (
    <ComercialTemplate
      funnel={barras(porEtapaComercial(listaLeads), listaLeads.length, "gold", "lead")}
      columns={colunasPorEtapaComercial(listaLeads)}
    >
      <div
        data-crm-chip-qualidade
        className={
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium " +
          (chipQualidade.tom === "attention"
            ? "border-atencao/40 bg-atencao-suave text-atencao"
            : "border-navy/15 bg-cream/60 text-navy/70")
        }
      >
        <span aria-hidden="true">●</span>
        {chipQualidade.texto}
      </div>
    </ComercialTemplate>
  );
}

/** Grupo 4 · Inteligência & Pesquisa, com contagem real de evidências e projeções. */
export function PesquisaConectada() {
  const q = useSuperficies();
  if (q.isLoading) return <Carregando rotulo="Carregando o encadeamento da pesquisa" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura da pesquisa falhou. Isto é erro de leitura, não pesquisa vazia." />;
  const d = q.data;

  return (
    <PesquisaBibliotecaTemplate
      chain={barras(d.porEixoOperacao, d.totalCasos, "navy")}
      queue={{
        draft: d.evidenciasTotal ?? 0,
        review: d.semProximaAcao,
        approved: d.documentosMinimosOk,
        published: d.projecoesTotal ?? 0,
      }}
    />
  );
}

/** Grupo 5 · Formalização & Financeiro, com contrato, pagamento e faturas reais. */
export function FormalizacaoConectada() {
  const q = useSuperficies();
  if (q.isLoading) return <Carregando rotulo="Carregando formalização e financeiro" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura da formalização falhou. Isto é erro de leitura, não ausência de contratos." />;
  const d = q.data;

  return (
    <FormalizacaoFinanceiroTemplate
      kpis={[
        { label: "Contratos assinados", value: d.contratoAssinado, detail: "Registrado no caso" },
        { label: "Pagamentos confirmados", value: d.pagamentoConfirmado, detail: "Confirmação registrada" },
        { label: "Documentos mínimos", value: d.documentosMinimosOk, detail: "Casos com mínimo conferido" },
        { label: "Faturas registradas", value: d.faturasTotal, detail: "Total na organização" },
      ]}
      alerts={
        d.totalCasos - d.contratoAssinado > 0
          ? [
              {
                context: "Formalização",
                message: `${d.totalCasos - d.contratoAssinado} caso(s) sem contrato assinado registrado`,
                tone: "attention" as const,
              },
            ]
          : []
      }
    />
  );
}

/** Grupo 6 · Governança, com volumes reais de auditoria, leads e projeções. */
export function GovernancaConectada() {
  const q = useSuperficies();
  if (q.isLoading) return <Carregando rotulo="Carregando indicadores de governança" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura de governança falhou. Isto é erro de leitura, não ausência de registros." />;
  const d = q.data;

  return (
    <GovernancaTemplate
      indicators={[
        { label: "Casos", value: d.totalCasos, highlighted: true },
        { label: "Leads", value: d.leadsTotal ?? 0 },
        { label: "Evidências", value: d.evidenciasTotal ?? 0 },
        { label: "Projeções", value: d.projecoesTotal ?? 0 },
        { label: "Auditoria", value: d.auditoriaTotal ?? 0 },
      ]}
    />
  );
}
