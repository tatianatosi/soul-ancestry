import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao } from "@/components/caso/campos";
import { obterFichaMasterReal } from "@/lib/ficha-master.functions";

/**
 * Ficha Master (54 campos, Prioridade 1 da sequência de 02/10/2026) — a
 * primeira vez que `toFichaPiloto`/`CaseData` (`src/lib/caseAdapter.ts`,
 * `src/types/case.ts`) lê dado real do caso em vez do estático de demo.
 * Somente leitura; nenhum escritor aqui. Campos ainda sem fonte real
 * (heatmap de percentual, 2ª/3ª rota, interseções de jornada) aparecem
 * vazios — nunca inventados.
 */
export function PainelFichaMaster({ caseId }: { caseId: string }) {
  const carregar = useServerFn(obterFichaMasterReal);
  const q = useQuery({
    queryKey: ["ficha-master-real", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando a Ficha Master do caso…</p>;
  if (q.error) return <p className="text-sm text-terracota">Não foi possível carregar a Ficha Master.</p>;
  const f = q.data?.ficha;
  if (!f) return null;

  const campo = (rotulo: string, valor: string | number | null | undefined) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-navy/5 py-1 text-sm">
      <span className="text-navy/55">{rotulo}</span>
      <span className="text-right text-navy/85">{valor === null || valor === undefined || valor === "" ? "—" : valor}</span>
    </div>
  );

  return (
    <Secao
      titulo="Ficha Master (54 campos) — dado real do caso"
      descricao="Montada a partir de crm_casos, clientes, case_plans, research_cases e app_projections. Campo vazio = ainda sem fonte real, nunca preenchido por inferência."
    >
      <div className="space-y-1">
        {campo("Caso", `${f.case_id} — ${f.case_nome}`)}
        {campo("Cliente", f.cliente_nome)}
        {campo("Status do caso", f.status_caso)}
        {campo("Rota provável", f.rota_provavel)}
        {campo("Etapa atual", f.etapa_atual)}
        {campo("Hipótese principal (interno)", f.hipotese_principal)}
        {campo("País 1 (heatmap)", f.heatmap_pais_1)}
        {campo("Aderência país 1 (%)", f.heatmap_pct_1)}
        {campo("Pessoas conectadas (árvore)", f.origem_pessoas_conectadas)}
        {campo("Gerações lidas", f.origem_geracoes_lidas)}
        {campo("Documento principal liberado", f.doc_principal)}
        {campo("Pendência documental", f.doc_pendencia)}
        {campo("Alerta ativo", f.alerta_titulo)}
        {campo("Achado 1", f.descoberta_1)}
        {campo("Marco 1 (histórico)", f.conta_historico_1)}
      </div>
    </Secao>
  );
}
