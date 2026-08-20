/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Painel, Selo } from "@/components/comercial/base";
import { diagnosticoInstrumentos } from "@/lib/crm-desk.functions";
import { rotuloStatusTema, type LinhaMatriz } from "@/lib/matriz-juridica";

const COR: Record<string, "ok" | "alerta" | "neutro"> = {
  aprovado: "ok",
  nao_aplicavel: "neutro",
  pendente_revisao_juridica: "alerta",
  rejeitado: "alerta",
  substituir: "alerta",
};

/**
 * Painel contextual da matriz jurídica (ANA-E-01).
 * Somente leitura de decisões — não redige cláusula nem gera instrumento.
 */
export function MatrizJuridicaPreparacao({ caseId }: { caseId: string }) {
  const carregar = useServerFn(diagnosticoInstrumentos);
  const q = useQuery({
    queryKey: ["matriz-juridica-preparacao", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  if (q.isLoading) return <Painel titulo="Matriz jurídica — preparação">Carregando diagnóstico…</Painel>;
  if (q.error) return <Painel titulo="Matriz jurídica — preparação">{(q.error as any)?.message}</Painel>;

  const d = q.data as any;
  const linhas = (d.linhas ?? []) as LinhaMatriz[];
  const bloqueios = (d.bloqueios ?? []) as { origem: string; detalhe: string }[];

  return (
    <Painel titulo="Matriz jurídica — preparação de instrumentos">
      <div className="space-y-3 text-xs text-navy/80">
        <p className="rounded border border-navy/15 bg-cream/40 p-2">
          {d.assinatura?.liberada
            ? "Nenhum tema bloqueante pendente: preparação interna liberada. Nenhuma cláusula, contrato ou comunicação é gerada aqui."
            : `${d.assinatura?.bloqueios?.length ?? 0} tema(s) bloqueante(s) impedem assinatura. Nenhuma ação externa é executada nesta tela.`}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="text-navy/60">
              <tr>
                <th className="py-1 pr-2">Tema</th>
                <th className="py-1 pr-2">Status</th>
                <th className="py-1 pr-2">Bloqueia assinatura</th>
                <th className="py-1 pr-2">Versão jurídica</th>
                <th className="py-1 pr-2">Responsável / data</th>
                <th className="py-1 pr-2">Justificativa</th>
                <th className="py-1 pr-2">Impacto em templates</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.tema_codigo} className="border-t border-navy/10 align-top">
                  <td className="py-1 pr-2 font-medium text-navy">{l.tema}</td>
                  <td className="py-1 pr-2">
                    <Selo tom={COR[l.status] ?? "neutro"} texto={rotuloStatusTema(l.status)} />
                  </td>
                  <td className="py-1 pr-2">{l.bloqueia_assinatura ? "Sim" : "Não"}</td>
                  <td className="py-1 pr-2">{l.versao_juridica_aplicavel ?? "—"}</td>
                  <td className="py-1 pr-2">
                    {l.responsavel_revisao ?? "—"}
                    {l.decidido_em ? ` · ${new Date(l.decidido_em).toLocaleDateString("pt-BR")}` : ""}
                  </td>
                  <td className="py-1 pr-2">{l.justificativa ?? "—"}</td>
                  <td className="py-1 pr-2">{(l.impacto_templates ?? []).join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section>
          <h4 className="text-sm font-semibold text-navy">Bloqueios ativos</h4>
          {bloqueios.length ? (
            <ul className="mt-1 list-disc pl-4">
              {bloqueios.map((b, i) => (
                <li key={i}>
                  <span className="uppercase text-navy/60">{b.origem}</span> — {b.detalhe}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">Nenhum bloqueio ativo registrado.</p>
          )}
        </section>
      </div>
    </Painel>
  );
}
