/**
 * Histórico importado do banco antigo, na ficha do instrumento (31/10/2026).
 * `contract_history_imports` tinha 110 linhas e nenhum leitor: o histórico
 * existia e ninguém o via. Somente leitura — não é versão ativa.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { historicoImportadoDoContrato } from "@/lib/contratos.functions";
import {
  resumirHistoricoImportado,
  type LinhaHistoricoImportado,
} from "@/lib/contrato-historico-importado";

const dia = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "sem data");

export function HistoricoImportado({ contratoId }: { contratoId: string }) {
  const carregar = useServerFn(historicoImportadoDoContrato);
  const q = useQuery({
    queryKey: ["contrato-historico-importado", contratoId],
    queryFn: () => carregar({ data: { contract_id: contratoId } }),
  });

  return (
    <div className="mt-6 border-t border-navy/10 pt-4" data-historico-importado>
      <h4 className="font-serif text-base text-navy">Histórico importado do banco antigo</h4>
      <p className="mt-1 text-xs text-navy/60">
        Somente leitura. Não é a versão ativa: nada aqui muda status, valor, cláusula ou assinatura.
      </p>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data as LinhaHistoricoImportado[]] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o histórico importado"
        vazio="Nenhum histórico importado para este contrato."
      >
        {([linhas]) => {
          const r = resumirHistoricoImportado(linhas);
          if (r.vazio)
            return (
              <p className="mt-2 text-sm text-navy/60">
                Nenhum histórico importado para este contrato.
              </p>
            );
          return (
            <div className="mt-3 space-y-3 text-sm text-navy">
              <div>
                <p className="font-medium">Versões ({r.versoes.length})</p>
                <ul className="mt-1 space-y-0.5 text-xs text-navy/75">
                  {r.versoes.map((v, i) => (
                    <li key={i}>
                      v{v.numero ?? "?"} · {v.status} · {dia(v.criadaEm)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium">Validações ({r.validacoes.total})</p>
                <p className="mt-1 text-xs text-navy/75">
                  {Object.entries(r.validacoes.porStatus)
                    .map(([s, n]) => `${n} ${s}`)
                    .join(" · ") || "nenhuma"}
                </p>
              </div>
              <div>
                <p className="font-medium">Eventos de revisão ({r.eventos.length})</p>
                <ul className="mt-1 space-y-0.5 text-xs text-navy/75">
                  {r.eventos.map((e, i) => (
                    <li key={i}>
                      {dia(e.quando)} · {e.tipo}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }}
      </EstadoDados>
    </div>
  );
}
