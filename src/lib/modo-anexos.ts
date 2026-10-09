/**
 * Corte C / D3 (08/10/2026) — contrato COM ou SEM anexos separados.
 *
 * Até aqui a incorporação do Anexo I era só **derivada**: se os cinco blocos
 * (`BLOCOS_QUE_INCORPORAM_ANEXO_I`) estivessem completos, o Anexo I deixava
 * de ser documento separado. Derivação não é escolha: bastava um bloco ficar
 * pendente para o modelo mudar de forma sozinho, no meio da preparação.
 *
 * Agora o modo é uma escolha registrada e auditada no próprio parâmetro
 * `modo_anexos` (lista controlada, justificativa obrigatória — a mesma
 * trilha de `salvarParametro`, sem writer novo). Sem escolha registrada, o
 * modo continua sendo o derivado — e a tela diz que é derivado, não escolhido.
 *
 * Camada pura: não lê banco, não escreve.
 */
import type { Opcao } from "@/lib/parametros-catalogos";

export const MODO_ANEXOS_INCORPORADO = "incorporado";
export const MODO_ANEXOS_SEPARADO = "separado";

export type ModoAnexos = typeof MODO_ANEXOS_INCORPORADO | typeof MODO_ANEXOS_SEPARADO;

export const CAT_MODO_ANEXOS: Opcao[] = [
  {
    valor: MODO_ANEXOS_INCORPORADO,
    rotulo: "Anexos incorporados ao corpo",
    ajuda:
      "O conteúdo do Anexo I (escopo por pessoa, serviços, entregas, valor e pagamento) é seção do próprio contrato, " +
      "sob o título da Ordem de Serviço. Não há documento de anexo separado a juntar, e a ausência de anexo aplicável " +
      "deixa de ser pendência.",
  },
  {
    valor: MODO_ANEXOS_SEPARADO,
    rotulo: "Anexos como documentos separados",
    ajuda:
      "Anexo I a V existem como documentos próprios, cada um com estado e pendência. O corpo do contrato remete a eles.",
  },
];

export type ModoAnexosEfetivo = {
  modo: ModoAnexos;
  /** `true` quando ninguém escolheu: o modo veio da completude dos blocos. */
  derivado: boolean;
  explicacao: string;
};

/** Valor fora da lista controlada não vira modo — é tratado como não escolhido. */
export function modoAnexosDeclarado(valor: string | null | undefined): ModoAnexos | null {
  const v = (valor ?? "").trim();
  return v === MODO_ANEXOS_INCORPORADO || v === MODO_ANEXOS_SEPARADO ? v : null;
}

/**
 * O modo que vale agora. A escolha humana registrada prevalece sobre a
 * derivação — inclusive quando contraria os blocos, porque o modelo do
 * instrumento é decisão da Proprietária, não consequência de completude.
 */
export function modoAnexosEfetivo(
  declarado: string | null | undefined,
  incorporadoNoCorpo: boolean,
): ModoAnexosEfetivo {
  const escolhido = modoAnexosDeclarado(declarado);
  if (escolhido === MODO_ANEXOS_INCORPORADO) {
    return {
      modo: MODO_ANEXOS_INCORPORADO,
      derivado: false,
      explicacao: incorporadoNoCorpo
        ? "Modo escolhido e registrado: anexos incorporados ao corpo."
        : "Modo escolhido e registrado: anexos incorporados ao corpo — e ainda há bloco do Anexo I com pendência, " +
          "que precisa fechar antes da versão final porque o conteúdo vai no próprio contrato.",
    };
  }
  if (escolhido === MODO_ANEXOS_SEPARADO) {
    return {
      modo: MODO_ANEXOS_SEPARADO,
      derivado: false,
      explicacao: "Modo escolhido e registrado: Anexo I a V como documentos separados.",
    };
  }
  return incorporadoNoCorpo
    ? {
        modo: MODO_ANEXOS_INCORPORADO,
        derivado: true,
        explicacao:
          "Modo ainda não escolhido. Derivado dos blocos completos do Anexo I — registre a escolha em “Modo dos anexos” " +
          "para o modelo não mudar de forma sozinho.",
      }
    : {
        modo: MODO_ANEXOS_SEPARADO,
        derivado: true,
        explicacao:
          "Modo ainda não escolhido. Derivado: há bloco do Anexo I com pendência, então os anexos seguem como documentos " +
          "separados. Registre a escolha em “Modo dos anexos”.",
      };
}

/**
 * Motivo do bloqueio histórico de anexo. Fica aqui para que o leitor e o
 * teste falem da mesma string — não é texto novo, é o que já existia em
 * `contrato-preparar.functions.ts`.
 */
export const MOTIVO_SEM_ANEXO_APLICAVEL = "Nenhum anexo aplicável pelas regras existentes.";

/** No modo incorporado, não existir anexo aplicável é o estado correto. */
export function ausenciaDeAnexoEhPendencia(modo: ModoAnexos): boolean {
  return modo === MODO_ANEXOS_SEPARADO;
}

/**
 * O que a tela diz no lugar da lista de ANX-* quando os anexos estão no corpo.
 *
 * Importante, e declarado: isto NÃO desliga o gate de proposta/condição
 * comercial aprovada. Mesmo com os anexos no corpo, o contrato continua
 * exigindo proposta vinculada e aprovada — a condição comercial é a fonte do
 * conteúdo incorporado, não um anexo dispensável.
 */
export const AVISO_ANEXOS_NO_CORPO =
  "Anexos incorporados: o conteúdo do Anexo I é seção deste contrato, não documento separado. " +
  "A proposta aprovada continua sendo exigida — ela é a fonte da condição comercial incorporada.";
