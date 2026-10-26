/**
 * Botão "Baixar PDF" real — corte urgente PP-03/PDF (07/10/2026). Diferente
 * de `AbrirDocumentoContrato` (abre aba e chama `window.print()`): este
 * baixa um arquivo .pdf de verdade, gerado no servidor a partir da mesma
 * prévia já persistida.
 */
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { baixarPdfContrato } from "@/lib/contrato-pdf.functions";

function baixarBase64ComoArquivo(base64: string, nomeArquivo: string) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BaixarPdfContrato({
  previaId,
  caseId,
  rotulo = "Baixar PDF",
  className = "rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50",
}: {
  previaId: string | null;
  /**
   * 26/10/2026 (opção "b"): com `caseId`, o documento é renderizado na hora a
   * partir do dado atual — não depende de prévia congelada nem é bloqueado por
   * defasagem. `previaId` continua baixando uma versão congelada específica.
   */
  caseId?: string;
  rotulo?: string;
  className?: string;
}) {
  const baixar = useServerFn(baixarPdfContrato);
  const [carregando, setCarregando] = useState(false);

  async function onClick() {
    if (!previaId && !caseId) {
      toast.info("Gere a prévia do contrato primeiro — o PDF sai da prévia, não de texto novo.");
      return;
    }
    setCarregando(true);
    try {
      const r = await baixar({ data: previaId ? { previaId } : { caseId } });
      baixarBase64ComoArquivo(r.base64, r.nomeArquivo);
      toast.success(`PDF baixado: ${r.nomeArquivo}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar o PDF.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={carregando} className={className} data-baixar-pdf-contrato>
      {carregando ? "Gerando PDF…" : rotulo}
    </button>
  );
}
