/**
 * Saída em documento na tela do PRÓPRIO instrumento (`/contratos/$id`).
 *
 * Defeito relatado pela Proprietária em 26/10/2026: "não consegui nem baixar o
 * PDF pra verificar como ficou a versão final do contrato". Era literal, e por
 * dois motivos somados:
 *
 * 1. `BaixarPdfContrato` e `BaixarDocxContrato` existiam, mas só estavam
 *    montados em `/casos/$caseId/contrato/preparar`. A tela do instrumento —
 *    onde se lê o contrato e se pede revisão — não tinha nenhuma saída em
 *    documento. Quem abria o contrato pelo instrumento não tinha caminho.
 * 2. Quando a prévia está defasada, o botão recebe `previaId = null` e só
 *    responde com um aviso em toast. Sem o motivo visível na tela, o efeito
 *    prático é um botão que "não faz nada".
 *
 * Aqui o motivo do bloqueio é texto na tela, não toast, e aponta para onde se
 * regera a prévia. Mesmo motor, mesma prévia, mesma regra do servidor: nada é
 * reescrito, enviado, assinado ou cobrado.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { BaixarDocxContrato } from "@/components/contrato/baixar-docx-contrato";
import { BaixarPdfContrato } from "@/components/contrato/baixar-pdf-contrato";
import { abrirPreparacaoContrato } from "@/lib/contrato-preparar.functions";
import { motivoBloqueioSaida, previaVigente, rotuloPrevia } from "@/lib/previa-vigente";
import { RENDERIZADOR_VERSAO } from "@/lib/renderizador-versao";
import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

export function DocumentoDoInstrumento({ caseId }: { caseId: string }) {
  const abrir = useServerFn(abrirPreparacaoContrato);
  const q = useQuery({
    queryKey: ["instrumento-documento", caseId],
    queryFn: () => abrir({ data: { caseId } }),
    retry: false,
  });

  if (q.isLoading) {
    return (
      <p className="text-xs text-navy/55" data-documento-instrumento="carregando">
        Carregando a prévia vigente deste contrato…
      </p>
    );
  }

  if (q.isError) {
    return (
      <p role="alert" className="text-xs text-terracotta" data-documento-instrumento="erro">
        Não foi possível ler a prévia deste contrato:{" "}
        {q.error instanceof Error ? q.error.message : "a consulta não retornou resultado nem erro."}
      </p>
    );
  }

  const d = q.data as Record<string, unknown>;
  const previas = Array.isArray(d.previas) ? (d.previas as Record<string, unknown>[]) : [];
  const previaAtual = previaVigente(previas as never);
  const bloqueio = motivoBloqueioSaida(
    previaAtual,
    (d.parametroAlteradoEm as string | null) ?? null,
    RENDERIZADOR_VERSAO,
  );
  const previaId = bloqueio ? null : (previaAtual?.id ?? null);

  return (
    <section className="space-y-2" aria-label="Documento do instrumento" data-documento-instrumento>
      <p className="text-xs text-navy/60">{rotuloPrevia(previaAtual, CONTRATO_BASE_VERSAO, CLAUSULAS_FIXAS.length)}</p>

      {bloqueio ? (
        <div className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-navy">
          <p data-documento-instrumento-bloqueio>{bloqueio}</p>
          <Link
            to="/casos/$caseId/contrato/preparar"
            params={{ caseId }}
            className="mt-1 inline-block font-medium underline decoration-gold underline-offset-4"
          >
            Abrir a preparação para gerar a prévia de novo →
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <BaixarPdfContrato
          previaId={previaId}
          className="min-h-11 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50 sm:min-h-0"
        />
        <BaixarDocxContrato
          previaId={previaId}
          className="min-h-11 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50 sm:min-h-0"
        />
      </div>
    </section>
  );
}
