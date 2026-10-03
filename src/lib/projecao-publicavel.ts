/**
 * Guard de PUBLICAÇÃO no App Cliente (03/10/2026).
 *
 * ## O defeito que este módulo fecha
 *
 * O App filtra o que chega ao cliente (`jornadaSanitizada` descarta
 * `contemConteudoInterno`). Mas vários escritores publicavam em
 * `app_projections` sem passar pelo mesmo filtro — então a equipe publicava,
 * o App descartava em silêncio, e a tela do cliente ficava vazia **com
 * conteúdo publicado no banco**.
 *
 * Medido no caso real da Ana (`CA-CID-AT-FAM-2026-001`) em 03/10: as três
 * projeções publicadas eram todas descartadas pelo App —
 *
 * | tipo | conteúdo publicado | por que o App descarta |
 * |---|---|---|
 * | contrato | "… Parcelas: 3 assinaturas mensais de R$ 320 … total R$ 9.600" | preço (A7 bloqueado) |
 * | proposta | "… Parcelas: 3 assinaturas mensais de R$ 320 … total R$ 9.600" | preço (A7 bloqueado) |
 * | microentrega | "… e ja registramos as fontes consultadas." | "fonte" é vocabulário interno |
 *
 * Publicar algo que o cliente nunca verá é pior que recusar: a equipe acha
 * que entregou. Então o servidor passa a recusar na hora, dizendo o motivo.
 *
 * A regra NUNCA é afrouxar o filtro do App. É escrever o texto que pode
 * chegar ao cliente — a troca de expressão que o Adendo do Bloco 5A já
 * determina: em vez de "fonte, data, evidência e nível de confiança", usar
 * "tipo de evidência, estado de validação, data da última atualização e
 * próximo passo".
 */
import { contemConteudoInterno } from "@/lib/onboarding-jornada";
import { pareceComercial } from "@/lib/plano-publicacao";

export type RecusaPublicacao = {
  motivo: string;
  /** O que escrever no lugar, na linguagem que chega ao cliente. */
  comoCorrigir: string;
};

const SUGESTAO_INTERNO =
  'Reescreva sem vocabulário interno (fonte, evidência, hipótese, acervo, risco, dossiê, SKU, CPF). O Adendo do Bloco 5A define a troca: em vez de "fonte, data, evidência e nível de confiança", escreva "tipo de evidência, estado de validação, data da última atualização e próximo passo".';

const SUGESTAO_COMERCIAL =
  "Tire preço, parcela, desconto e código de catálogo: enquanto a autorização escrita de preço no App (A7) não vier, o App fica sem preço. Publique nome, situação e vigência.";

/**
 * `null` significa "pode publicar". Qualquer outro retorno é a recusa com o
 * motivo legível — é o mesmo teste que o App aplica na leitura, aplicado
 * antes da gravação.
 */
export function recusaDePublicacaoNoApp(conteudo: string | null | undefined): RecusaPublicacao | null {
  const texto = (conteudo ?? "").trim();
  if (!texto) {
    return {
      motivo: "Não há texto para publicar.",
      comoCorrigir: "Escreva o que o cliente deve ler.",
    };
  }
  if (pareceComercial(texto)) {
    return {
      motivo: "O texto tem preço, parcela, desconto ou código de catálogo — isso nunca vai ao App.",
      comoCorrigir: SUGESTAO_COMERCIAL,
    };
  }
  if (contemConteudoInterno(texto)) {
    return {
      motivo:
        "O texto tem vocabulário interno, então o App o descartaria em silêncio e o cliente veria tela vazia.",
      comoCorrigir: SUGESTAO_INTERNO,
    };
  }
  return null;
}

/** Lança com a recusa formatada. Use antes de gravar em `app_projections`. */
export function exigirPublicavelNoApp(conteudo: string | null | undefined): string {
  const recusa = recusaDePublicacaoNoApp(conteudo);
  if (recusa) throw new Error(`${recusa.motivo} ${recusa.comoCorrigir}`);
  return (conteudo ?? "").trim();
}
