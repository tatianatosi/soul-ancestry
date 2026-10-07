/**
 * Botão "Baixar DOCX" real — mesma fonte do PDF (`BaixarPdfContrato`), só o
 * formato muda.
 */
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { baixarDocxContrato } from "@/lib/contrato-docx.functions";

function baixarBase64ComoArquivo(base64: string, nomeArquivo: string) {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BaixarDocxContrato({
  previaId,
  rotulo = "Baixar DOCX",
  className = "rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80 disabled:opacity-50",
}: {
  previaId: string | null;
  rotulo?: string;
  className?: string;
}) {
  const baixar = useServerFn(baixarDocxContrato);
  const [carregando, setCarregando] = useState(false);

  async function onClick() {
    if (!previaId) {
      toast.info("Gere a prévia do contrato primeiro — o DOCX sai da prévia, não de texto novo.");
      return;
    }
    setCarregando(true);
    try {
      const r = await baixar({ data: { previaId } });
      baixarBase64ComoArquivo(r.base64, r.nomeArquivo);
      toast.success(`DOCX baixado: ${r.nomeArquivo}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar o DOCX.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={carregando} className={className} data-baixar-docx-contrato>
      {carregando ? "Gerando DOCX…" : rotulo}
    </button>
  );
}
