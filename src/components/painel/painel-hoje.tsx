import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { painelHoje } from "@/lib/conversao.functions";
import { calcularMetricas, moeda } from "@/lib/conversao";

/** Painel Hoje: filas operacionais, sinais de atraso e leitura de conversão. Somente leitura. */
export function PainelHoje() {
  const carregar = useServerFn(painelHoje);
  const q = useQuery({ queryKey: ["painel-hoje"], queryFn: () => carregar(), retry: false });

  const metricas = useMemo(() => {
    if (!q.data) return null;
    const nomes = new Map(
      (q.data.campanhas ?? []).map((c: Record<string, unknown>) => [String(c.id), String(c.nome)]),
    );
    return calcularMetricas(
      (q.data.eventos ?? []) as never,
      (q.data.investimentos ?? []) as never,
      (id) => (id ? (nomes.get(String(id)) ?? "campanha não vinculada") : "sem campanha"),
    );
  }, [q.data]);

  if (q.isLoading) return <p className="mt-6 text-sm text-navy/50">Carregando Painel Hoje…</p>;
  if (q.isError)
    return (
      <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-terracotta">
        Não foi possível carregar o Painel Hoje.
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </p>
    );
  if (!q.data) return null;

  const f = q.data.filas;
  const filas: { rotulo: string; itens: { id: string; codigo: string; titulo: string }[] }[] = [
    {
      rotulo: "Aceites verbais aguardando confirmação formal",
      itens: f.aceite_verbal_aguardando_formal,
    },
    { rotulo: "Confirmações formais aguardando contrato", itens: f.formal_aguardando_contrato },
    { rotulo: "Contratos aguardando assinatura", itens: f.contratos_aguardando_assinatura },
    { rotulo: "Pagamentos aguardados", itens: f.pagamentos_aguardados },
    { rotulo: "Onboardings bloqueados", itens: f.onboardings_bloqueados },
    { rotulo: "Casos sem responsável", itens: f.casos_sem_responsavel },
    { rotulo: "Casos sem próxima ação", itens: f.casos_sem_proxima_acao },
    { rotulo: "Casos sem dossiê-mãe", itens: f.casos_sem_dossie },
    { rotulo: "Mais de 10 dias sem atualização ao cliente", itens: f.sem_atualizacao_10 },
    { rotulo: "Mais de 14 dias sem atualização ao cliente", itens: f.sem_atualizacao_14 },
    { rotulo: "Follow-ups vencidos", itens: f.followups_vencidos },
  ];

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-navy">Painel Hoje</h2>
        <Link to="/conversao" className="text-xs text-navy/60 underline">
          Ver métricas completas
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filas.map((fila) => (
          <div key={fila.rotulo} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{fila.rotulo}</p>
              <span className="font-serif text-2xl text-navy">{fila.itens.length}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/60">
              {fila.itens.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link to="/casos/$caseId" params={{ caseId: c.id }} className="underline">
                    {c.codigo}
                  </Link>{" "}
                  — {c.titulo}
                </li>
              ))}
              {fila.itens.length === 0 && <li>Nenhum caso nesta fila.</li>}
            </ul>
          </div>
        ))}

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Importações Placego</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            <li>Lotes com erro: {q.data.importacoes.comErro.length}</li>
            <li>Lotes com duplicidade: {q.data.importacoes.duplicidades.length}</li>
            <li>Exceções abertas: {q.data.importacoes.excecoesAbertas}</li>
          </ul>
          <Link to="/importacoes" className="mt-2 inline-block text-xs text-navy underline">
            Abrir importações
          </Link>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Conversão e investimento</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            <li>Investimento registrado: {moeda(metricas?.investimentoTotal ?? 0)}</li>
            <li>Leads criados: {metricas?.contagem["lead_criado"] ?? 0}</li>
            <li>Leads qualificados: {metricas?.contagem["lead_qualificado"] ?? 0}</li>
            <li>
              Pagamentos iniciais confirmados:{" "}
              {metricas?.contagem["pagamento_inicial_confirmado"] ?? 0}
            </li>
            <li>CAC: {moeda(metricas?.cac ?? null)}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
