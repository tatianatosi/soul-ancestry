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
import { identidadeDeDemo, type IdentidadeCaso } from "@/lib/caso-compartilhado";

/** Selo obrigatório em qualquer superfície que exiba este caso. */
export const SELO_DEMO_PORTAL = "DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO";

/**
 * As 5 fases do mockup aprovado (Entrega 1, 2026-09-12): Diagnóstico,
 * Pesquisa, Reconstrução, Validação, Entrega. Hoje não existe policy de
 * portal para uma fase real do caso (ver nota em portal-dados-vivos.ts) —
 * este índice/percentual só existe aqui, na demo, nunca no caminho do
 * cliente real ("sem dado = sem dado").
 */
export const FASES_JORNADA_DEMO = ["Diagnóstico", "Pesquisa", "Reconstrução", "Validação", "Entrega"] as const;
export const FASE_ATUAL_DEMO_SOPHIA_INDICE = 2;
export const FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL = 65;

/**
 * Trilha do caso na tela Jornada (correção 2026-09-12, rejeição da Timeline
 * Dupla): passo atual dentro de Onboarding→Pesquisa→Documentos→Validação→
 * Entrega. Só existe na demo — não há policy de portal para o passo real
 * do caso ainda (mesma razão de FASE_ATUAL_DEMO_SOPHIA_INDICE acima).
 * Índice 3 = "Validação": a publicação mais recente do caso (resumo,
 * demo-sophia-06) descreve aguardar devolutiva do comune sobre grafia —
 * uma etapa de validação de registro, não de pesquisa ou entrega.
 */
export const PASSO_CASO_ATUAL_DEMO_SOPHIA_INDICE = 3;

/**
 * União de Ramos (demo): vínculo editorial EXPLÍCITO — não inferido por
 * data — entre o achado ancestral do bisavô paterno (registro de batismo
 * em 1897, projeção `demo-sophia-03`) e o marco que abriu essa mesma linha
 * de investigação ("bisavô paterno, emigrado do Vêneto", projeção
 * `demo-sophia-01`): os dois textos publicados citam o mesmo bisavô. Só
 * existe na demo — para o cliente real, sem campo de vínculo publicado,
 * a União de Ramos simplesmente não aparece.
 */
export const UNIAO_DE_RAMOS_DEMO_SOPHIA = {
  historiaProjecaoId: "demo-sophia-03",
  casoProjecaoId: "demo-sophia-01",
  // Ajuste 2026-09-12 (acabamento pós-aprovação): mais específico, sem
  // sugerir efeito jurídico.
  legenda: "O registro de 1897 confirma o ramo investigado nesta etapa.",
} as const;

/**
 * Ordem narrativa da Timeline Vertical Contínua (correção 2026-09-12):
 * sequência editorial pedida pela Proprietária para a revisão da Jornada —
 * é ordem de leitura da história, não ordem de publicação. Só existe na
 * demo; o cliente real usa a ordem cronológica real (jornada.tsx).
 * `demo-sophia-06` (resumo) fica fora desta vitrine: seu conteúdo já é
 * coberto pela próxima ação ("Agora") ao final da timeline.
 */
export const ORDEM_NARRATIVA_DEMO_SOPHIA: readonly string[] = [
  "demo-sophia-03", // 1897 · Registro encontrado
  "demo-sophia-01", // Marco da jornada
  "demo-sophia-04", // Documento analisado
  "demo-sophia-02", // Atualização da equipe
  "demo-sophia-05", // Árvore da família
  "demo-sophia-07", // Entrega de legado (dourado suave)
] as const;

/**
 * UUID estável da demo (= contrato `crm_casos.id`).
 * O código humano fica em `CASO_DEMO_CODIGO` — não misturar os dois.
 */
export const CASO_DEMO_CASE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
/** @deprecated use CASO_DEMO_CASE_ID ou CASO_DEMO_CODIGO */
export const CASO_DEMO_ID = CASO_DEMO_CASE_ID;
export const CASO_DEMO_CODIGO = "CA-ITA-SOPHI-PICCOLI";
export const CASO_DEMO_TITULO = "Reconhecimento de cidadania italiana — família Piccoli";
/** Nome do titular na demo (Conta) — não confundir com título do caso. */
export const CLIENTE_DEMO_NOME = "Sophia Piccoli";

/** Identidade canônica da demo (UUID = caseId; código = rótulo humano). */
export const IDENTIDADE_DEMO_SOPHIA: IdentidadeCaso = identidadeDeDemo({
  caseId: CASO_DEMO_CASE_ID,
  codigo: CASO_DEMO_CODIGO,
  titulo: CASO_DEMO_TITULO,
});

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
    // Data ajustada para 19 ago 2026 por pedido explícito e repetido da
    // Proprietária (correção Timeline Vertical, 2026-09-12) — reordena a
    // posição cronológica real deste item na demo; não afeta cliente real.
    effective_from: "2026-08-19",
    updated_at: "2026-08-19",
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
