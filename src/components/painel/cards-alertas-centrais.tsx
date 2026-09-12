import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { CardIndicador, CarregandoDesk, type TomEstado } from "@/components/desk/ui-desk";
import { listarAlertasCentrais } from "@/lib/alertas.functions";

/**
 * Três cartões do Hoje ligados às fontes canônicas do Desk (crm_casos, RPC
 * proxima_acao_prioritaria_lote e filas de leads). Nada aqui é estado de tela:
 * a contagem é derivada na leitura e falha de leitura aparece como falha.
 */
export function CardsAlertasCentrais() {
  const carregar = useServerFn(listarAlertasCentrais);
  const q = useQuery({ queryKey: ["alertas-centrais"], queryFn: () => carregar() });

  if (q.isLoading) return <CarregandoDesk linhas={1} rotulo="Carregando sinais do dia" />;
  if (q.isError) {
    return (
      <div role="alert" className="mb-4 rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
        <p>Não foi possível ler cadências, casos sem próxima ação e leads parados. Isto é falha de leitura, não fila vazia.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void q.refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const dados = q.data;
  const cartoes: { rotulo: string; valor: number; apoio: string; tom: TomEstado }[] = [
    { rotulo: "Cadências vencidas", valor: dados?.cadencias.length ?? 0, apoio: "Origem: Jornada do caso", tom: "atencao" },
    { rotulo: "Casos sem próxima ação", valor: dados?.casosSemAcao.length ?? 0, apoio: "Origem: Caso 360", tom: "critico" },
    { rotulo: "Leads parados", valor: dados?.leadsParados.length ?? 0, apoio: "Origem: CRM", tom: "atencao" },
  ];

  return (
    <section className="mb-6 space-y-3" aria-label="Sinais centrais do dia">
      <div className="grid gap-3 sm:grid-cols-3">
        {cartoes.map((c) => (
          <CardIndicador key={c.rotulo} rotulo={c.rotulo} valor={c.valor} apoio={c.apoio} tom={c.valor > 0 ? c.tom : "neutro"} />
        ))}
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/alertas">Abrir central de alertas</Link>
      </Button>
    </section>
  );
}
