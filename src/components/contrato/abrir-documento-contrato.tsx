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
    // Defeito relatado pela Proprietária em 24/10/2026: este botão "abre uma
    // janela em branco bloqueada pelo navegador". Era literal — a versão
    // anterior fazia `window.open("", "_blank")` e só DEPOIS escrevia o HTML
    // dentro da aba, então qualquer bloqueador de pop-up matava uma aba que
    // nascia vazia, e o contrato de 8 páginas não era lido.
    //
    // Agora o documento é impresso de um iframe oculto na própria página: não
    // existe aba nova para bloquear. O HTML é o mesmo da prévia, e continua
    // sem enviar, assinar, cobrar ou persistir nada.
    const quadro = document.createElement("iframe");
    quadro.setAttribute("aria-hidden", "true");
    quadro.title = `Documento do contrato — ${identificacao.caso}`;
    quadro.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    quadro.srcdoc = doc;
    quadro.onload = () => {
      const janela = quadro.contentWindow;
      if (!janela) {
        toast.error("Não foi possível montar o documento para impressão. Recarregue a tela e tente de novo.");
        quadro.remove();
        return;
      }
      // `afterprint` cobre o caso normal; o prazo é a rede de segurança para
      // navegador que não dispara o evento — sem ela o iframe ficaria preso.
      const limpar = () => quadro.remove();
      janela.addEventListener("afterprint", limpar, { once: true });
      window.setTimeout(limpar, 120_000);
      janela.focus();
      janela.print();
    };
    document.body.appendChild(quadro);
    toast.success(`Documento aberto para impressão. Em "Salvar como PDF", sugira o nome ${nomeArquivoContrato(identificacao)}.`);
  }

  return (
    <button type="button" onClick={abrir} className={className} data-abrir-documento-contrato>
      {rotulo}
    </button>
  );
}
