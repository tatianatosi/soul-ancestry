import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { auditoriaPreparacao } from "@/lib/contrato-preparar.functions";

/**
 * Histórico de auditoria da preparação, recortado para ESTE caso (a trilha da
 * organização inteira continua em /configuracoes). Só mostra o que aconteceu e
 * quando: o servidor já devolve sem conteúdo sensível, e aqui nem o conteúdo dos
 * metadados é exibido — só o nome do campo, quando houver.
 */
export function AuditoriaDaPreparacao({ registroId }: { registroId: string }) {
  const carregar = useServerFn(auditoriaPreparacao);
  const q = useQuery({
    queryKey: ["auditoria-preparacao", registroId],
    queryFn: () => carregar({ data: { id: registroId } }),
    retry: false,
  });
  const eventos = (q.data?.eventos ?? []) as {
    id: string;
    acao: string;
    created_at: string;
    metadados?: Record<string, unknown> | null;
  }[];

  if (q.isLoading) return <p className="text-xs text-navy/60">Carregando o histórico…</p>;
  if (q.error)
    return (
      <p className="text-xs text-terracotta">Não foi possível carregar o histórico de auditoria.</p>
    );
  if (eventos.length === 0) {
    return (
      <p className="text-xs text-navy/60">
        Nenhum evento de auditoria registrado para esta preparação.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5 text-xs" data-auditoria-preparacao>
      {eventos.map((e) => {
        const campo = typeof e.metadados?.campo === "string" ? e.metadados.campo : null;
        return (
          <li
            key={e.id}
            className="flex flex-wrap justify-between gap-2 rounded border border-navy/10 px-2 py-1.5"
          >
            <span className="text-navy">
              {e.acao}
              {campo ? <span className="text-navy/50"> · {campo}</span> : null}
            </span>
            <span className="text-navy/50">{new Date(e.created_at).toLocaleString("pt-BR")}</span>
          </li>
        );
      })}
    </ul>
  );
}
