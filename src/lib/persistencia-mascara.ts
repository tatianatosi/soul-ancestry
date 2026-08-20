/**
 * ANA-SAVE-SEC-01B — mascaramento de campos sensíveis na auditoria.
 *
 * O log registra o que mudou, não o conteúdo sensível. CPF, RG, telefone,
 * e-mail, endereço e afins entram mascarados no caso_log/audit_logs.
 */

export const CAMPOS_SENSIVEIS = [
  "cpf",
  "rg",
  "documento",
  "telefone",
  "email",
  "endereco",
  "cep",
  "data_nascimento",
  "consentimentos",
  "senha",
  "token",
];

export function ehCampoSensivel(campo: string): boolean {
  const c = campo.toLowerCase();
  return CAMPOS_SENSIVEIS.some((s) => c === s || c.endsWith(`_${s}`));
}

/** Mantém apenas o formato: "12345678900" → "12•••••••00". */
export function mascararValor(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const texto = String(valor);
  if (texto.length <= 4) return "••••";
  return `${texto.slice(0, 2)}${"•".repeat(Math.max(3, texto.length - 4))}${texto.slice(-2)}`;
}

/** Aplica o mascaramento por campo antes de gravar o log. */
export function mascararParaLog(campo: string, valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  if (ehCampoSensivel(campo)) return mascararValor(valor);
  return String(valor);
}
