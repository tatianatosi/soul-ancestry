/** Remove do HTML aprovado os avisos de trabalho interno e códigos técnicos antes de ir ao App Cliente. */
export function prepararHtmlContratoCliente(html: string, versao: number): string {
  return html
    .replace(/<div class="selo">[^<]*<\/div>/, `<div class="selo">Versão ${versao} aprovada — para assinatura</div>`)
    .replace(/<p class="pend">Documento de trabalho interno\.[^<]*<\/p>/g, "")
    .replace(/<li>[A-Z0-9_]+ — /g, "<li>")
    .replace(/not_applicable/g, "não aplicável");
}
