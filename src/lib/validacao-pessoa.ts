/**
 * Máscaras e validações reutilizáveis de campos de pessoa física —
 * CPF, CEP, UF e telefone (Brasil e exterior).
 *
 * Pedido de 2026-08-31 (`PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`):
 * CPF e CEP com máscara, UF validada contra as 27 siglas reais, telefone com
 * DDI/DDD quando a pessoa mora no Brasil e formato livre com DDI explícito
 * quando mora fora. Módulo puro (sem I/O): só formata e valida o que já foi
 * digitado, nunca decide o que gravar.
 */

/** Mantém apenas dígitos. */
function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/* ------------------------------------------------------------------ */
/* CPF                                                                 */
/* ------------------------------------------------------------------ */

/** Aplica a máscara `000.000.000-00` progressivamente, enquanto a pessoa digita. */
export function formatarCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Dígito verificador padrão da Receita Federal. Rejeita sequências repetidas (ex.: 111.111.111-11). */
export function cpfValido(valor: string): boolean {
  const d = apenasDigitos(valor);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;

  const digitoVerificador = (base: string): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digitoVerificador(d.slice(0, 9));
  const d2 = digitoVerificador(d.slice(0, 9) + String(d1));
  return d === d.slice(0, 9) + String(d1) + String(d2);
}

/* ------------------------------------------------------------------ */
/* CEP                                                                  */
/* ------------------------------------------------------------------ */

/** Aplica a máscara `00000-000` progressivamente. */
export function formatarCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function cepValido(valor: string): boolean {
  return apenasDigitos(valor).length === 8;
}

/* ------------------------------------------------------------------ */
/* UF                                                                   */
/* ------------------------------------------------------------------ */

export const UFS_BRASIL: readonly { sigla: string; nome: string }[] = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const SIGLAS_UF = new Set(UFS_BRASIL.map((u) => u.sigla));

/** Valida contra as 26 siglas de estado + DF — não aceita nome por extenso nem sigla inventada. */
export function ufValida(sigla: string): boolean {
  return SIGLAS_UF.has(sigla.trim().toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Telefone — Brasil (DDD) e exterior (DDI explícito)                  */
/* ------------------------------------------------------------------ */

export type PaisTelefone = "brasil" | "exterior";

/**
 * Deriva o país do telefone a partir do que já foi digitado: um "+" no
 * início é o único sinal confiável de DDI explícito (exterior) num campo
 * único, sem seletor de país ao lado.
 */
function paisDetectado(valor: string, pais?: PaisTelefone): PaisTelefone {
  if (pais) return pais;
  return valor.trim().startsWith("+") ? "exterior" : "brasil";
}

/**
 * Formata telefone conforme o país de residência da pessoa:
 * - Brasil: DDD + número, máscara `(DD) 9XXXX-XXXX` (celular) ou `(DD) XXXX-XXXX` (fixo).
 * - Exterior: sem DDD brasileiro — mantém `+DDI` explícito na frente e o
 *   restante dos dígitos agrupados, sem forçar um padrão de país que não existe.
 * Sem `pais` informado, detecta pelo próprio valor: um "+" no início já
 * basta para tratar como exterior, mesmo num campo único sem seletor.
 */
export function formatarTelefone(valor: string, pais?: PaisTelefone): string {
  if (paisDetectado(valor, pais) === "exterior") {
    const d = apenasDigitos(valor);
    return d ? `+${d}` : "";
  }

  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Brasil: 10 dígitos (fixo, DDD+8) ou 11 (celular, DDD+9). Exterior: só exige DDI + ao menos 6 dígitos. */
export function telefoneValido(valor: string, pais?: PaisTelefone): boolean {
  if (paisDetectado(valor, pais) === "exterior") return apenasDigitos(valor).length >= 7;
  const d = apenasDigitos(valor);
  return d.length === 10 || d.length === 11;
}
