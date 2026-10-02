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

/* ------------------------------------------------------------------ */
/* E-mail                                                               */
/* ------------------------------------------------------------------ */

/**
 * Validação estrutural simples (não confirma entrega/existência da caixa,
 * só a forma `algo@dominio.tld`). P31 (26/09/2026): pedido direto da
 * Proprietária ("e-mail... deve ser estruturado com máscaras e
 * validações") — até aqui o campo só tinha `type="email"` do navegador,
 * nunca checagem própria antes de gravar.
 */
export function emailValido(valor: string): boolean {
  const v = valor.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/* ------------------------------------------------------------------ */
/* RG — número e órgão emissor/UF                                       */
/* ------------------------------------------------------------------ */

/**
 * O RG não tem dígito verificador nem tamanho nacional único (cada estado
 * emite no seu próprio formato) — por isso não existe "formatarRg" como
 * existe `formatarCpf`. O que dá para validar de forma real é a UF do
 * órgão emissor (ex.: "SSP/SP", "SSP-SP", "SESP MT"): extrai o par de
 * letras no fim do texto e confere contra `UFS_BRASIL`. Texto sem UF
 * reconhecível (RG estrangeiro, órgão sem UF) não é tratado como erro —
 * só quando há um par de letras no fim que NÃO é uma UF válida.
 */
export function rgOrgaoUfValido(valor: string): boolean {
  const v = valor.trim();
  if (!v) return true;
  // Só reconhece UF quando vem em maiúsculas e separada por "/", "-" ou
  // espaço (ex.: "SSP/SP", "SSP-MT", "SESP SP") — nunca confunde com o fim
  // de uma palavra do nome do órgão (ex.: "...Pública" não vira "ca").
  const m = v.match(/(?:^|[/\-\s])([A-Z]{2})$/);
  if (!m) return true;
  return ufValida(m[1]);
}

/* ------------------------------------------------------------------ */
/* Detecção de CPF em texto livre — reutilizável entre filtros          */
/* ------------------------------------------------------------------ */

const PADRAO_CPF_PONTUADO = /\d{3}\.\d{3}\.\d{3}-\d{2}/;

/**
 * P5 (26/09/2026) — pedido direto da Proprietária: "verifique quais outros
 * filtros automáticos podem ser reutilizáveis entre as abas e o app". Achado
 * real: existiam ~10 filtros de "termo proibido em texto cliente-facing"
 * espalhados por módulos diferentes (`biblioteca-evidencias.ts`,
 * `achados-genealogicos.ts`, `jornada-cliente.ts`, `onboarding-jornada.ts`,
 * `portal-linguagem-viva.ts`, `fila-comunicacao.ts`, `templates-whatsapp.ts`,
 * `portal-copy.ts`, `ca04-crm-mestre.ts`), cada um com sua própria lista de
 * palavras — e só `biblioteca-evidencias.ts` (corte anterior) e
 * `templates-whatsapp.ts` (busca pela palavra literal "cpf", não pelo
 * formato do número) tinham qualquer proteção contra CPF. Esta função vira a
 * fonte única: detecta formato pontuado (inconfundível) e sequências de 11
 * dígitos crus que batem o dígito verificador real (evita falso positivo em
 * outro número de 11 dígitos que não é CPF).
 */
export function contemCpf(texto: string): boolean {
  if (!texto) return false;
  if (PADRAO_CPF_PONTUADO.test(texto)) return true;
  const sequenciasDe11 = texto.match(/\d{11}/g) ?? [];
  return sequenciasDe11.some((seq) => cpfValido(seq));
}

/* ------------------------------------------------------------------ */
/* Nome                                                                 */
/* ------------------------------------------------------------------ */

/**
 * 02/10/2026 — Corte MÁSCARAS: nome não tinha nenhum validador em lugar
 * nenhum do repo (confirmado por grep). Recusa só o que é comprovadamente
 * inválido: vazio, 1 caractere, ou dígito no meio do nome. Nunca barra
 * nome composto, partícula ("de", "da", "dos"), acento, apóstrofo ("D'Ávila")
 * ou hífen ("Maria-Clara") — isso é fundamento de produto (não fundir por
 * nome continua intacto; isto só valida formato de entrada).
 */
export function nomeValido(valor: string): boolean {
  const v = valor.trim();
  if (v.length < 2) return false;
  if (/\d/.test(v)) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

/** Aplica a máscara `DD/MM/AAAA` progressivamente, enquanto a pessoa digita. */
export function formatarDataBr(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/**
 * Aceita `DD/MM/AAAA` ou ISO (`AAAA-MM-DD`). Recusa data futura (nascimento
 * não pode estar no futuro) e ano implausível (antes de 1900 ou o ano
 * atual) — nunca aceita "31/02" ou qualquer dia/mês fora do calendário real.
 */
export function dataValida(valor: string, options: { permitirFutura?: boolean } = {}): boolean {
  const v = valor.trim();
  if (!v) return false;

  let dia: number, mes: number, ano: number;
  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (br) {
    dia = Number(br[1]);
    mes = Number(br[2]);
    ano = Number(br[3]);
  } else if (iso) {
    ano = Number(iso[1]);
    mes = Number(iso[2]);
    dia = Number(iso[3]);
  } else {
    return false;
  }

  if (ano < 1900 || ano > new Date().getFullYear() + (options.permitirFutura ? 1 : 0)) return false;
  if (mes < 1 || mes > 12) return false;
  const data = new Date(ano, mes - 1, dia);
  // new Date normaliza datas inválidas (ex.: 31/02 vira 03/03) — comparar
  // de volta pega exatamente isso.
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return false;

  if (!options.permitirFutura && data.getTime() > Date.now()) return false;
  return true;
}

/* ------------------------------------------------------------------ */
/* Endereço                                                             */
/* ------------------------------------------------------------------ */

export type CampoEndereco = "logradouro" | "numero" | "bairro" | "cidade";

/**
 * Validação mínima por campo de endereço — nunca inventa formato de rua
 * (varia demais por país/região); só recusa vazio e, no número, texto que
 * não tem nenhum dígito nem "S/N" (sem número).
 */
export function enderecoCampoValido(campo: CampoEndereco, valor: string): boolean {
  const v = valor.trim();
  if (!v) return false;
  if (campo === "numero") return /\d/.test(v) || /^s\/?n$/i.test(v);
  return true;
}
