import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao } from "@/components/caso/campos";
import { carregarFichaPiloto } from "@/lib/ficha-piloto-genealogica.functions";
import { regrasDaJornada, type EstadoJornada } from "@/lib/jornada-pos-gates";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Jornada após gates — regras de preparação (Corte J).
 * Nada é enviado, publicado ou executado: o painel apenas mostra o que ficaria
 * habilitado quando contrato, pagamento e autorização estiverem confirmados.
 */
export function PainelJornadaPosGates({
  caseId,
  estadoBase,
}: {
  caseId: string;
  estadoBase: EstadoJornada;
}) {
  const carregar = useServerFn(carregarFichaPiloto);
  const q = useQuery({
    queryKey: ["ficha-piloto-jornada", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  const falhaFicha =
    q.isError || (!q.isLoading && !q.data)
      ? q.error instanceof Error
        ? q.error.message
        : "A consulta da ficha de pesquisa não retornou resultado nem erro."
      : null;
  const pesquisa: any = q.data?.pesquisa ?? null;
  const fontes: any[] = (q.data?.fontes ?? []) as any[];
  const validadas = fontes.filter((f) => String(f.status ?? "") === "validated").length;

  const estado: EstadoJornada = {
    ...estadoBase,
    autorizacao_pesquisa: pesquisa?.external_research_authorization_status ?? null,
    status_pesquisa: pesquisa?.status ?? null,
    evidencias_validadas: validadas,
    linhas_validadas: validadas,
  };

  const regras = regrasDaJornada(estado);
  const pendentes = regras.filter((r) => !r.atendida);

  return (
    <Secao
      titulo="Jornada após gates"
      descricao="Regras de preparação. Nenhuma etapa executa, envia ou publica nesta entrega."
    >
      {q.isLoading ? <p className="text-sm text-navy/55">Carregando estado da pesquisa…</p> : null}
      {falhaFicha ? (
        <div role="alert" className="mb-3 space-y-1 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs">
          <p className="font-medium text-destructive">
            Não foi possível carregar o estado da pesquisa. As regras abaixo estão incompletas.
          </p>
          <p className="text-navy/80">{falhaFicha}</p>
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded border border-navy/20 px-2 py-1 text-[11px] text-navy"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      <ul className="space-y-2">
        {regras.map((r) => (
          <li key={r.chave} className="rounded-lg border border-navy/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy">{r.titulo}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide ${
                  r.atendida ? "bg-gold/15 text-navy" : "bg-terracotta/10 text-terracotta"
                }`}
              >
                {r.atendida ? "preparado" : "pendente"}
              </span>
            </div>
            <p className="mt-1 text-xs text-navy/60">{r.descricao}</p>
            {r.pendencias.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-terracotta">
                {r.pendencias.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-navy/55">
        {pendentes.length === 0
          ? "Todas as regras preparadas; a execução continua dependendo de ação humana."
          : `${pendentes.length} regra(s) ainda dependem de gates: contrato, pagamento e autorização aplicável.`}
      </p>
    </Secao>
  );
}
