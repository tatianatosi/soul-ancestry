/**
 * Responsável e contratada — UMA fonte, nunca perguntada de novo.
 *
 * Decisão da Proprietária (04/10/2026, literal): "foi feito diversos prompts
 * repetindo sobre o perfil institucional como contratada, por default a equipe
 * do Clube Ancestral sou eu, então não preciso ficar repetindo diversas vezes
 * e em lugares diferentes que sou eu a equipe".
 *
 * Consequência de código, e é só isto:
 *  - a contratada é o perfil institucional (org-wide, versionado) — nunca um
 *    campo por caso. Quem precisa dela lê `qualificacaoCompletaContratada()`;
 *  - o responsável padrão é o representante legal do MESMO perfil. Campo de
 *    responsável vazio não é pendência: resolve no padrão, sem perguntar;
 *  - nada aqui é um nome novo digitado: os dois valores saem de
 *    `PERFIL_INSTITUCIONAL` (`contrato-base-consolidado.ts`), que é a versão
 *    homologada. Trocar o responsável padrão = trocar o perfil institucional,
 *    em um lugar só.
 *
 * O que isto NÃO faz: não assina, não aprova, não substitui revisão humana
 * onde a revisão é a regra (ato externo, assinatura, cobrança). Preencher o
 * responsável por padrão é o contrário de decidir por ela — é parar de pedir
 * um dado que já está decidido.
 */

import { valorInstitucional } from "@/lib/contrato-base-consolidado";

/** Representante legal do perfil institucional vigente. */
export const RESPONSAVEL_INSTITUCIONAL_PADRAO = valorInstitucional("representante_legal");

/** Forma institucional do mesmo responsável ("equipe Clube Ancestral"). */
export const EQUIPE_INSTITUCIONAL_PADRAO = `equipe ${valorInstitucional("nome_operacao")}`;

/** Origem a registrar quando o valor veio do padrão, não de digitação. */
export const ORIGEM_RESPONSAVEL_PADRAO = "perfil_institucional";

/** Texto curto de ajuda, igual em toda tela que mostra o campo. */
export const AJUDA_RESPONSAVEL_PADRAO =
  `Vazio = ${RESPONSAVEL_INSTITUCIONAL_PADRAO} (${EQUIPE_INSTITUCIONAL_PADRAO}), por padrão do perfil institucional. ` +
  "Só preencha para delegar a outra pessoa.";

const t = (v: unknown) => (v == null ? "" : String(v).trim());

/** Responsável efetivo: o informado, ou o padrão institucional. */
export function responsavelOuPadrao(valor?: unknown): string {
  return t(valor) || RESPONSAVEL_INSTITUCIONAL_PADRAO;
}

/** Verdadeiro quando o valor é (ou está vazio e portanto é) o padrão. */
export function ehResponsavelPadrao(valor?: unknown): boolean {
  const v = t(valor);
  return v === "" || v === RESPONSAVEL_INSTITUCIONAL_PADRAO || v === EQUIPE_INSTITUCIONAL_PADRAO;
}

/**
 * Rótulo de leitura para onde hoje aparece "não atribuído" / "A definir" /
 * "Responsável não definido". Em operação solo isso nunca foi verdade: o
 * responsável é a Proprietária até alguém delegar.
 */
export function rotuloResponsavel(valor?: unknown): string {
  const v = t(valor);
  return v ? v : `${RESPONSAVEL_INSTITUCIONAL_PADRAO} (padrão)`;
}

/**
 * Perguntas que o sistema NÃO deve mais fazer, porque o perfil institucional
 * já responde. Serve de lista verificável (teste) e de referência para quem
 * for acrescentar campo novo.
 */
export const PERGUNTAS_JA_RESPONDIDAS_PELO_PERFIL = [
  {
    pergunta: "Quem é a contratada?",
    resposta: "Perfil institucional vigente (razão empresarial, CNPJ, endereço e canais oficiais).",
    onde: "qualificacaoCompletaContratada() — parâmetro contratada_qualificacao, origem documento",
  },
  {
    pergunta: "Quem é o representante legal da contratada?",
    resposta: RESPONSAVEL_INSTITUCIONAL_PADRAO,
    onde: "PERFIL_INSTITUCIONAL.representante_legal",
  },
  {
    pergunta: "Quem é a equipe / quem executa?",
    resposta: `${RESPONSAVEL_INSTITUCIONAL_PADRAO} (${EQUIPE_INSTITUCIONAL_PADRAO})`,
    onde: "RESPONSAVEL_INSTITUCIONAL_PADRAO / responsavelOuPadrao()",
  },
  {
    pergunta: "Quem responde pela validação de fonte / elevação de evidência?",
    resposta: RESPONSAVEL_INSTITUCIONAL_PADRAO,
    onde: "D-05 — fontes-genealogicas.functions.ts usa o mesmo padrão",
  },
] as const;
