/**
 * "Abrir documento para imprimir ou salvar em PDF" — a saída em documento do
 * contrato, que não existia (medido em 04/10/2026: nenhum módulo de contrato
 * mencionava PDF; a prévia só vivia dentro de um iframe sandbox da tela).
 *
 * Usa o MESMO HTML já gerado pelo motor de prévia. Nada é reescrito, enviado,
 * assinado, cobrado ou persistido: o PDF sai pela impressão do navegador.
 */

import { toast } from "sonner";

import {
  documentoImprimivelDoContrato,
  nomeArquivoContrato,
  type IdentificacaoDocumento,
} from "@/lib/contrato-impressao";

export function AbrirDocumentoContrato({
  html,
  identificacao,
  rotulo = "Abrir documento para imprimir ou salvar em PDF",
  className = "rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy/80",
}: {
  /** HTML da prévia já gerada; sem ele o botão explica o que fazer antes. */
  html: string | null;
  identificacao: IdentificacaoDocumento;
  rotulo?: string;
  className?: string;
}) {
  function abrir() {
    if (!html) {
      toast.info("Gere ou abra a prévia do contrato primeiro — o documento sai da prévia, não de texto novo.");
      return;
    }
    const doc = documentoImprimivelDoContrato(html, identificacao);
    const janela = window.open("", "_blank", "noopener,noreferrer");
    if (!janela) {
      toast.error("O navegador bloqueou a nova aba. Libere o pop-up deste site e tente de novo.");
      return;
    }
    janela.document.open();
    janela.document.write(doc);
    janela.document.close();
    // Deixa o layout assentar antes de chamar a impressão.
    janela.setTimeout(() => janela.print(), 350);
    toast.success(`Documento aberto. Em "Salvar como PDF", sugira o nome ${nomeArquivoContrato(identificacao)}.`);
  }

  return (
    <button type="button" onClick={abrir} className={className} data-abrir-documento-contrato>
      {rotulo}
    </button>
  );
}
