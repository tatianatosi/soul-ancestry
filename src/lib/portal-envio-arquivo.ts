/**
 * Regra de arquivo que o cliente pode enviar — fonte única.
 *
 * 21/09/2026 — a regra vivia só em `portal-cliente.server.ts`, privada do
 * módulo, e por isso a tela não tinha como dizer ao cliente o que é aceito
 * antes de ele escolher o arquivo. Extraída para cá (puro, sem servidor)
 * para que servidor e tela usem a MESMA regra: o servidor continua sendo
 * quem recusa, e a tela apenas antecipa a recusa com o mesmo critério.
 *
 * O mockup 5/7 escreve "PDF, JPG ou PNG — até 10 MB por arquivo". A regra
 * aprovada aceita mais formatos e 25 MB. Pelo §29 do De-Para, a composição
 * é do mockup e o dado é da regra aprovada — então a caixa existe como no
 * mockup, mas com o limite verdadeiro. Anunciar 10 MB faria a tela recusar
 * o que o servidor aceita.
 */

export const EXTENSOES_PERMITIDAS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "heic",
  "webp",
  "doc",
  "docx",
] as const;

export const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024;

/** Como o limite aparece para o cliente. */
export const TAMANHO_MAXIMO_ROTULO = "25 MB";

/** Como os formatos aparecem para o cliente. */
export const FORMATOS_ROTULO = "PDF, imagem (JPG, PNG, HEIC, WEBP) ou documento Word";

export const ERRO_FORMATO =
  "Formato não aceito. Envie PDF, imagem (JPG, PNG, HEIC, WEBP) ou documento Word.";

export const ERRO_TAMANHO = "Arquivo acima do limite de 25 MB.";

/**
 * Motivo da recusa, ou null quando o arquivo passa. Mensagens idênticas às
 * que o servidor lança — o cliente não deve ver um texto e o servidor outro.
 */
export function erroDoArquivoCliente(nome: string, tamanho: number): string | null {
  const ext = String(nome).split(".").pop()?.toLowerCase() ?? "";
  if (!(EXTENSOES_PERMITIDAS as readonly string[]).includes(ext)) return ERRO_FORMATO;
  if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > TAMANHO_MAXIMO_BYTES) {
    return ERRO_TAMANHO;
  }
  return null;
}
