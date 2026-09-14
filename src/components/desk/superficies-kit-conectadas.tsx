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

function useSuperficies() {
  const carregar = useServerFn(carregarSuperficiesKit);
  return useQuery({
    queryKey: ["kit-superficies"],
    queryFn: () => carregar({}),
    retry: false,
  });
}

function barras(itens: { label: string; value: number }[], total: number, tone: BarDatum["tone"]): BarDatum[] {
  if (!itens.length) return [];
  return itens.slice(0, 6).map((item) => ({
    label: item.label,
    value: total > 0 ? Math.round((item.value / total) * 100) : 0,
    detail: `${item.value} caso${item.value === 1 ? "" : "s"}`,
    tone,
  }));
}

function dataBr(valor: string | null) {
  if (!valor) return undefined;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? valor : d.toLocaleDateString("pt-BR");
}

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
  if (q.isLoading) return <Carregando rotulo="Carregando o funil comercial" />;
  if (q.isError || !q.data) return <Falha mensagem="A leitura do funil falhou. Isto é erro de leitura, não funil vazio." />;
  const d = q.data;

  return (
    <ComercialTemplate
      funnel={barras(d.porEixoComercial, d.totalCasos, "gold")}
      columns={colunasPorFase(d)}
    />
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
