/**
 * De-para entre os dicionários de fase/etapa da jornada.
 *
 * A Proprietária apontou: "diversos dicionários correspondem ao mesmo
 * processo... aproveite o estudo e construa a ponte de-para entre todos
 * eles". O achado (CA-AUD-12) já tinha contado quatro vocabulários
 * diferentes de "fase"; junto com o catálogo operacional e o fluxo
 * WhatsApp→App→Desk, são cinco:
 *
 *   1. `onboarding-jornada.ts`  — 8 fases, escreve em `case_plans.fase_jornada`.
 *      É o único que GRAVA no banco: por isso é o canônico deste de-para.
 *   2. `jornada-cliente.ts`     — as mesmas 8 fases, com "_" em vez de "_e_"
 *      nos ids compostos (rótulo de tela, nunca grava).
 *   3. `derivacao-jornada.ts`   — 8 fases de PRÉ-venda (antes do caso existir),
 *      cobrindo triagem e discovery que as outras não têm.
 *   4. `relatorios-fase.ts`     — 4 fases largas, uma por relatório publicado.
 *   5. `ca06-catalogo-operacional.ts` — 7 etapas do catálogo de microentregas,
 *      nomeadas em português corrido, incluindo "Legado e continuidade" que
 *      nenhuma das outras tem (é pós-jornada, upsell).
 *
 * Este módulo NÃO funde, NÃO apaga, NÃO migra dado. Ele só declara, para cada
 * termo de cada dicionário, a QUAL fase canônica ele corresponde e com que
 * PRECISÃO — porque nem toda correspondência é exata. `derivacao-jornada`
 * tem fases que a canônica não cobre (triagem, discovery — são pré-caso);
 * `relatorios-fase` e o catálogo agrupam fases finas em uma só. Dizer
 * "aproximada" onde é aproximada é o ponto: já existe bug pago por dizer
 * "exata" quando não é (`painel-top30.tsx:133` imprime o id cru porque
 * ninguém tinha ponte nenhuma).
 */

import { FASES_JORNADA as FASES_CANONICAS, type FaseJornada as FaseCanonica } from "@/lib/onboarding-jornada";
import { idCanonicoDeFase } from "@/lib/fase-rotulo";
import { ROTULO_FASE as ROTULO_JORNADA_CLIENTE } from "@/lib/jornada-cliente";

export type { FaseCanonica };

export type Precisao = "exata" | "aproximada";

export type Correspondencia = {
  /** Fase canônica (onboarding-jornada.ts) a que este termo corresponde. */
  canonico: FaseCanonica | null;
  /** Rótulo humano da fase canônica, pronto para tela. */
  rotuloCanonico: string;
  precisao: Precisao;
  /** Por que a correspondência não é exata, quando não é. Vazio quando é exata. */
  motivo: string;
};

const ROTULO_CANONICO: Record<FaseCanonica, string> = Object.fromEntries(
  FASES_CANONICAS.map((f) => [f.id, f.rotulo]),
) as Record<FaseCanonica, string>;

function rotulo(id: FaseCanonica | null): string {
  return id ? (ROTULO_CANONICO[id] ?? id) : "Sem correspondência canônica";
}

/**
 * jornada-cliente.ts → canônico. Mesma fase, só troca "_" por "_e_" em dois
 * ids — resolvido por `idCanonicoDeFase` (fase-rotulo.ts), reaproveitado
 * aqui em vez de duplicar a tabela.
 */
function deJornadaCliente(valor: string): Correspondencia | null {
  if (!(valor in ROTULO_JORNADA_CLIENTE)) return null;
  const canonico = idCanonicoDeFase(valor);
  return { canonico, rotuloCanonico: rotulo(canonico), precisao: "exata", motivo: "" };
}

/**
 * derivacao-jornada.ts → canônico. Pré-venda: as três primeiras fases não têm
 * caso ainda, então não existe fase canônica correspondente — o de-para diz
 * isso em vez de inventar uma. As últimas três fases da pré-venda são cada
 * uma mais larga que uma fase canônica só, porque cobrem trechos que a
 * jornada do caso detalha depois.
 */
const DE_DERIVACAO_JORNADA: Record<string, Correspondencia> = {
  triagem_inicial: { canonico: null, rotuloCanonico: rotulo(null), precisao: "aproximada", motivo: "Pré-venda: caso ainda não existe, não há fase canônica de caso." },
  discovery_estruturado: { canonico: null, rotuloCanonico: rotulo(null), precisao: "aproximada", motivo: "Pré-venda: caso ainda não existe, não há fase canônica de caso." },
  leitura_preliminar_interna: { canonico: null, rotuloCanonico: rotulo(null), precisao: "aproximada", motivo: "Pré-venda: caso ainda não existe, não há fase canônica de caso." },
  proposta_e_escopo: { canonico: null, rotuloCanonico: rotulo(null), precisao: "aproximada", motivo: "Pré-venda: proposta antecede a abertura do caso." },
  formalizacao: { canonico: "aceite_e_formalizacao", rotuloCanonico: rotulo("aceite_e_formalizacao"), precisao: "aproximada", motivo: "Nomes diferentes para o mesmo marco: formalização = aceite e formalização." },
  onboarding: { canonico: "onboarding", rotuloCanonico: rotulo("onboarding"), precisao: "exata", motivo: "" },
  pesquisa_autorizada: { canonico: "pesquisa_inicial", rotuloCanonico: rotulo("pesquisa_inicial"), precisao: "aproximada", motivo: "Uma fase de pré-venda cobre o que a jornada do caso divide em pesquisa inicial e pesquisa e validação." },
  entrega_e_acompanhamento: { canonico: "protocolo_e_acompanhamento", rotuloCanonico: rotulo("protocolo_e_acompanhamento"), precisao: "aproximada", motivo: "Uma fase de pré-venda cobre o que a jornada do caso divide em protocolo, reconhecimento e pós-reconhecimento." },
};

/** relatorios-fase.ts → canônico. Quatro relatórios largos, cada um cobre 1-3 fases finas. */
const DE_RELATORIOS_FASE: Record<string, Correspondencia> = {
  fase_1_diagnostico: { canonico: "aceite_e_formalizacao", rotuloCanonico: rotulo("aceite_e_formalizacao"), precisao: "aproximada", motivo: "Relatório largo: cobre aceite/formalização e onboarding juntos." },
  fase_2_pesquisa: { canonico: "pesquisa_e_validacao", rotuloCanonico: rotulo("pesquisa_e_validacao"), precisao: "aproximada", motivo: "Relatório largo: cobre pesquisa inicial e pesquisa e validação juntas." },
  fase_3_prontidao: { canonico: "preparacao_documental", rotuloCanonico: rotulo("preparacao_documental"), precisao: "exata", motivo: "" },
  fase_4_protocolo: { canonico: "protocolo_e_acompanhamento", rotuloCanonico: rotulo("protocolo_e_acompanhamento"), precisao: "aproximada", motivo: "Relatório largo: cobre protocolo, reconhecimento e pós-reconhecimento juntos." },
};

/**
 * ca06-catalogo-operacional.ts → canônico. Nomeado em português corrido; a
 * última etapa ("Legado e continuidade") é pós-jornada — upsell depois do
 * reconhecimento, sem fase canônica de caso correspondente.
 */
const DE_CATALOGO_OPERACIONAL: Record<string, Correspondencia> = {
  "Entrada e diagnóstico": { canonico: "aceite_e_formalizacao", rotuloCanonico: rotulo("aceite_e_formalizacao"), precisao: "aproximada", motivo: "Etapa do catálogo cobre triagem pré-venda e aceite/formalização juntos." },
  "Estratégia e proposta": { canonico: "aceite_e_formalizacao", rotuloCanonico: rotulo("aceite_e_formalizacao"), precisao: "aproximada", motivo: "Proposta antecede o caso; mapeada ao marco mais próximo (aceite e formalização)." },
  "Documentação e pendências": { canonico: "preparacao_documental", rotuloCanonico: rotulo("preparacao_documental"), precisao: "exata", motivo: "" },
  Execução: { canonico: "pesquisa_e_validacao", rotuloCanonico: rotulo("pesquisa_e_validacao"), precisao: "aproximada", motivo: "\"Execução\" no catálogo cobre pesquisa inicial e validação juntas." },
  "Formalização e acompanhamento": { canonico: "protocolo_e_acompanhamento", rotuloCanonico: rotulo("protocolo_e_acompanhamento"), precisao: "aproximada", motivo: "Nome semelhante a \"aceite e formalização\", mas no catálogo esta etapa é o acompanhamento do protocolo, mais adiante na jornada." },
  "Pós-reconhecimento": { canonico: "pos_reconhecimento", rotuloCanonico: rotulo("pos_reconhecimento"), precisao: "exata", motivo: "" },
  "Legado e continuidade": { canonico: null, rotuloCanonico: rotulo(null), precisao: "aproximada", motivo: "Pós-jornada: upsell de memória/legado depois do reconhecimento, sem fase canônica de caso." },
};

export type DicionarioFase =
  | "canonico"
  | "jornada_cliente"
  | "derivacao_jornada"
  | "relatorios_fase"
  | "catalogo_operacional";

const DICIONARIOS_TABELA: Partial<Record<DicionarioFase, Record<string, Correspondencia>>> = {
  derivacao_jornada: DE_DERIVACAO_JORNADA,
  relatorios_fase: DE_RELATORIOS_FASE,
  catalogo_operacional: DE_CATALOGO_OPERACIONAL,
};

/**
 * Traduz um valor de qualquer dicionário conhecido para a fase canônica.
 *
 * Devolve `null` quando o dicionário ou o valor não são reconhecidos — nunca
 * inventa correspondência. `dicionario: "canonico"` é aceito para uso
 * uniforme (ex.: uma tela que não sabe de antemão a origem do dado).
 */
export function traduzirFase(dicionario: DicionarioFase, valor: string): Correspondencia | null {
  if (dicionario === "canonico") {
    return (FASES_CANONICAS as readonly { id: string }[]).some((f) => f.id === valor)
      ? { canonico: valor as FaseCanonica, rotuloCanonico: rotulo(valor as FaseCanonica), precisao: "exata", motivo: "" }
      : null;
  }
  if (dicionario === "jornada_cliente") return deJornadaCliente(valor);
  return DICIONARIOS_TABELA[dicionario]?.[valor] ?? null;
}

/** Rótulo humano pronto para tela, com aviso quando a correspondência é aproximada. */
export function rotuloComPrecisao(c: Correspondencia): string {
  return c.precisao === "aproximada" ? `${c.rotuloCanonico} (aproximado)` : c.rotuloCanonico;
}
