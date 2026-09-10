/**
 * Caso de demonstração do App Cliente — Sophia Piccoli.
 *
 * Alimenta a sessão demo que a Proprietária apresenta a futuros clientes
 * compartilhando tela. Decisão de 25/08/2026: usar `CA-ITA-SOPHI-PICCOLI`, já
 * marcado `demo: true` em `src/data/case-registry.ts` e descrito lá como
 * "caso-modelo reutilizável da entrega consultiva".
 *
 * Por que este caso mora aqui e não no banco: o portal autenticado passa tudo
 * por `filtrarParaCliente`, que só deixa chegar ao cliente registro
 * classificado como real. Pôr um caso fictício no banco exigiria classificá-lo
 * como real — derrubando justamente a guarda que protege os clientes de ver
 * dado não confirmado. A demo, portanto, não é um cliente falso: é uma
 * superfície interna do Desk alimentada por este fixture.
 *
 * Nada aqui descreve pessoa real, e nenhum conteúdo afirma elegibilidade,
 * vínculo comprovado ou prazo de deferimento — só o que a equipe fez e o que
 * vem a seguir, na mesma linguagem que o cliente real recebe.
 */

import type { DadosPortal } from "@/components/portal/fonte-portal";

/** Selo obrigatório em qualquer superfície que exiba este caso. */
export const SELO_DEMO_PORTAL = "DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO";

export const CASO_DEMO_ID = "CA-ITA-SOPHI-PICCOLI";
export const CASO_DEMO_TITULO = "Reconhecimento de cidadania italiana — família Piccoli";

/**
 * Projeções na mesma forma que `portal_projecoes` devolve, para que todos os
 * sanitizadores puros do portal funcionem sem alteração. Ordem cronológica
 * crescente; a tela ordena por data ao exibir.
 */
export const PROJECOES_DEMO_SOPHIA: DadosPortal["projecoes"] = [
  {
    id: "demo-sophia-01",
    case_id: CASO_DEMO_ID,
    projection_type: "marco",
    content_sanitized:
      "Abertura do caso e reunião de alinhamento. Definimos juntos o ramo a investigar — bisavô paterno, emigrado do Vêneto — e o que já existe em mãos na família.",
    effective_from: "2026-06-02",
    updated_at: "2026-06-02",
  },
  {
    id: "demo-sophia-02",
    case_id: CASO_DEMO_ID,
    projection_type: "atualizacao",
    content_sanitized:
      "Levantamento inicial concluído. Reunimos as certidões brasileiras da linha direta e identificamos duas grafias diferentes do sobrenome nos registros — algo comum em famílias de imigrantes e que tratamos como parte do trabalho.",
    effective_from: "2026-06-19",
    updated_at: "2026-06-19",
  },
  {
    id: "demo-sophia-03",
    case_id: CASO_DEMO_ID,
    projection_type: "achado",
    content_sanitized:
      "Encontrado o registro de batismo do bisavô na paróquia de origem, em 1897. É o documento que liga a família ao município italiano e que orienta as próximas buscas.",
    effective_from: "2026-07-08",
    updated_at: "2026-07-08",
  },
  {
    id: "demo-sophia-04",
    case_id: CASO_DEMO_ID,
    projection_type: "evidencia",
    content_sanitized:
      "Certidão de casamento localizada e analisada. Confirma a filiação declarada no batismo e fecha uma das lacunas da linha. Segue para tradução juramentada.",
    effective_from: "2026-07-24",
    updated_at: "2026-07-24",
  },
  {
    id: "demo-sophia-05",
    case_id: CASO_DEMO_ID,
    projection_type: "arvore",
    content_sanitized:
      "Árvore atualizada com quatro gerações confirmadas por documento. Cada pessoa exibida tem certidão correspondente; nada foi preenchido por suposição.",
    effective_from: "2026-08-05",
    updated_at: "2026-08-05",
  },
  {
    id: "demo-sophia-06",
    case_id: CASO_DEMO_ID,
    projection_type: "resumo",
    content_sanitized:
      "Estamos aguardando a devolutiva do comune sobre a retificação de grafia. É a etapa que não depende de você nem de nós — assim que houver resposta, atualizamos aqui no mesmo dia.",
    effective_from: "2026-08-20",
    updated_at: "2026-08-20",
  },
  {
    id: "demo-sophia-07",
    case_id: CASO_DEMO_ID,
    projection_type: "legado",
    content_sanitized:
      "Caderno de família reunindo as certidões já confirmadas e o registro de batismo do bisavô. Fica com vocês como memória, independente do andamento do reconhecimento.",
    effective_from: "2026-08-22",
    updated_at: "2026-08-22",
  },
];

/**
 * Documentos do caso demo. Ficam vazios de propósito: a lista de documentos do
 * portal lê de `documents`, com regra própria de liberação, e a demo não deve
 * sugerir que há arquivo para baixar quando não há. Estado vazio verdadeiro é
 * melhor demonstração do que arquivo inventado.
 */
export const DOCUMENTOS_DEMO_SOPHIA: DadosPortal["documentos"] = [];

export const DADOS_DEMO_SOPHIA: DadosPortal = {
  projecoes: PROJECOES_DEMO_SOPHIA,
  documentos: DOCUMENTOS_DEMO_SOPHIA,
  proximaAcao: {
    acao: "Reunir as certidões que ainda faltam na linha direta.",
    nivelEquivalente: 4,
    destino: "/portal/documentos",
  },
};
