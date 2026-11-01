/**
 * Saída em documento na tela do PRÓPRIO instrumento (`/contratos/$id`).
 *
 * Defeito relatado pela Proprietária em 26/10/2026: "não consegui nem baixar o
 * PDF pra verificar como ficou a versão final do contrato", e o conteúdo
 * vinha desatualizado — texto editado não aparecia. Duas causas somadas:
 *
 * 1. `BaixarPdfContrato`/`BaixarDocxContrato` só estavam montados em
 *    `/casos/$caseId/contrato/preparar` — a tela do instrumento não tinha
 *    nenhuma saída em documento.
 * 2. O parâmetro `contratante_documento` foi salvo 35 segundos depois da
 *    última vez que a prévia foi regerada. `previaDefasada()` passou a
 *    recusar a prévia, e como PDF/revisão/assinatura saem exclusivamente
 *    dela, o contrato ficou trancado: editar um dado invalidava o documento,
 *    e o documento invalidado bloqueava a conferência da própria edição.
 *
 * Decisão da Proprietária em 26/10/2026 (opção "b"), com duas condições: ter
 * acesso à versão criada, e parametrizar automaticamente. "Gerar documento
 * atual" (`gerarDocumentoAtual`) resolve as duas num só passo — primeiro
 * preenche do cadastro canônico o que estiver vazio (nunca sobrescreve o que
 * já tem valor), depois regera o rascunho de trabalho pelo MESMO renderizador
 * da prévia. A versão fica PERSISTIDA em `contract_parameter_previews`, com
 * hash de conteúdo: é a "versão criada", consultável depois pelo histórico
 * de prévias — não um render efêmero que desaparece ao fechar a aba. Como a
 * prévia é regerada DEPOIS dos parâmetros, não há mais defasagem possível
 * entre os dois.
 */
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { BaixarDocxContrato } from "@/components/contrato/baixar-docx-contrato";
import { BaixarPdfContrato } from "@/components/contrato/baixar-pdf-contrato";
import { abrirPreparacaoContrato } from "@/lib/contrato-preparar.functions";
import { gerarDocumentoAtual } from "@/lib/contrato-parametros.functions";
import {
  motivoBloqueioSaida,
  previaVigente,
  rotuloPrevia,
  type PreviaRegistro,
} from "@/lib/previa-vigente";
import { RENDERIZADOR_VERSAO } from "@/lib/renderizador-versao";
import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

export function DocumentoDoInstrumento({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const chave = ["instrumento-documento", caseId];
  const abrir = useServerFn(abrirPreparacaoContrato);
  const q = useQuery({
    queryKey: chave,
    queryFn: () => abrir({ data: { caseId } }),
    retry: false,
  });

  const gerar = useServerFn(gerarDocumentoAtual);
  const [ultimoAviso, setUltimoAviso] = useState<string | null>(null);
  // 27/10/2026 (R7, auditoria de espectro completo): sem isto, o aviso do
  // contrato anterior ficava visível ao trocar de caso com o componente
  // montado — mesma classe do bug de rascunho vazando entre leads.
  useEffect(() => setUltimoAviso(null), [caseId]);
  const mGerar = useMutation({
    mutationFn: () => gerar({ data: { caseId } }),
    onSuccess: (r) => {
      setUltimoAviso(
        r.parametrizacao.executada && r.parametrizacao.preenchidos > 0
          ? `${r.parametrizacao.preenchidos} parâmetro(s) preenchido(s) do cadastro canônico antes de gerar.`
          : r.parametrizacao.aviso
            ? `Parametrização automática não rodou: ${r.parametrizacao.aviso}`
            : null,
      );
      /*
       * 27/10/2026 (R3): quando a parametrização não roda, o documento é
       * regerado mesmo assim — mas a partir do parâmetro que já estava lá,
       * não necessariamente "o dado atual". Dizer isso quando não se
       * cumpriu é o mesmo defeito que motivou esta tela inteira.
       */
      if (r.parametrizacao.executada) {
        toast.success(
          r.identico
            ? "Documento já estava com o dado atual."
            : "Documento regerado com o dado atual.",
        );
      } else {
        toast.warning(
          "Documento regerado, mas a parametrização automática não rodou — veja o aviso abaixo.",
        );
      }
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
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

  /*
   * 27/10/2026 (R6): `abrirPreparacaoContrato` não tem tipo de retorno
   * exportado (é um objeto grande, inferido) — mas os dois campos usados
   * aqui têm forma conhecida e exportada: `previas` é exatamente o que
   * `previaVigente` espera. `Record<string, unknown>` + `as never` jogava
   * fora a checagem justamente no dado que decide se o PDF pode sair; um
   * campo renomeado passava pelo tsc e `previaId` virava `null` em
   * silêncio — o mesmo sintoma relatado originalmente.
   */
  const d = q.data as { previas?: PreviaRegistro[]; parametroAlteradoEm?: string | null };
  const previas = Array.isArray(d.previas) ? d.previas : [];
  const previaAtual = previaVigente(previas);
  const bloqueio = motivoBloqueioSaida(
    previaAtual,
    d.parametroAlteradoEm ?? null,
    RENDERIZADOR_VERSAO,
  );
  const previaId = bloqueio ? null : (previaAtual?.id ?? null);

  return (
    <section className="space-y-2" aria-label="Documento do instrumento" data-documento-instrumento>
      <p className="text-xs text-navy/60">
        {rotuloPrevia(previaAtual, CONTRATO_BASE_VERSAO, CLAUSULAS_FIXAS.length)}
      </p>

      <button
        type="button"
        onClick={() => mGerar.mutate()}
        disabled={mGerar.isPending}
        data-documento-instrumento-gerar-atual
        className="min-h-11 rounded-lg border border-gold/60 bg-gold/10 px-3 py-1.5 text-xs font-medium text-navy disabled:opacity-50 sm:min-h-0"
      >
        {mGerar.isPending ? "Gerando…" : "Gerar documento com o dado atual"}
      </button>
      {ultimoAviso ? <p className="text-[11px] text-navy/55">{ultimoAviso}</p> : null}

      {/*
        27/10/2026 (R4, auditoria de espectro completo): o bloqueio vinha
        DEPOIS dos botões de download desabilitados — a família via dois
        botões cinzas e só descobria o motivo rolando a tela. Explicação
        antes da ação que ela explica.
      */}
      {bloqueio ? (
        <div className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-navy">
          <p data-documento-instrumento-bloqueio>{bloqueio}</p>
          <p className="mt-1">
            Use "Gerar documento com o dado atual" acima, ou{" "}
            <Link
              to="/casos/$caseId/contrato/preparar"
              params={{ caseId }}
              className="font-medium underline decoration-gold underline-offset-4"
            >
              abra a preparação do contrato
            </Link>
            .
          </p>
        </div>
      ) : null}

      {/*
        26/10/2026 — "Gerar documento com o dado atual" parametriza (só
        preenche vazio) e regera a prévia ANTES de oferecer o download, para
        que PDF/DOCX nunca saiam defasados em relação ao parâmetro que
        acabou de ser editado. Continua sendo a mesma prévia de sempre —
        download por `previaId`, sob o mesmo guard do servidor.
      */}
      <div className="flex flex-wrap gap-2">
        <BaixarPdfContrato
          previaId={previaId}
          rotulo="Baixar PDF"
          className="min-h-11 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50 sm:min-h-0"
        />
        <BaixarDocxContrato
          previaId={previaId}
          rotulo="Baixar DOCX"
          className="min-h-11 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50 sm:min-h-0"
        />
      </div>
    </section>
  );
}
