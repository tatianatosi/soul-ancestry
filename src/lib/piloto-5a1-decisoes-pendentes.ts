/**
 * Piloto 5A.1 — decisões de governança (Bloco 5A / caso-piloto Giovanna Prade).
 *
 * Fonte literal: `docs/evolucao/recuperados/PILOTO-5A_1a_Rodada_Decisoes.docx`
 * ("Pacote de Decisão do Piloto — D-01, D-04, D-05, D-06"), 11/08/2026,
 * status "AGUARDANDO DECISÃO HUMANA" em todas as quatro, mantido assim até
 * 02/10/2026. Confirmado em 27/09/2026 (ver
 * `docs/arquitetura/FICHA-PILOTO-GIOVANNA-BLOCO-5A-EXECUTADO-2026-09-27.md`)
 * que ninguém tinha tomado essas decisões antes — nem em nome da Proprietária,
 * nem por inferência de código, teste, migration ou mockup.
 *
 * **Decididas em 02/10/2026** (instrução literal da Proprietária: "as
 * decisões que dependem de mim e são urgente execute todas elas d01 em
 * diante"), registrada por ela mesma (tati@pluggedresearch.com). Ver
 * `valorDecidido` de cada item abaixo para o conteúdo literal da decisão.
 *
 * Mecanismo neutro (não é a decisão em si): cada item tem um `status` que
 * só um agente pode ler, nunca escrever para "decidida" por conta própria —
 * a mudança de status e o preenchimento de `valorDecidido`/`decididoPor`/
 * `decididoEm` só acontece quando a Proprietária decide de fato, registrada
 * por ela ou em seu nome explícito (como em 02/10/2026).
 *
 * Por que não é case-scoped: não existe hoje um caso real e ativo
 * "Giovanna Prade" — o único registro em `crm_casos` para essa cliente é
 * `codigo = 'CA-DEMO-IT-2026-001'`, explicitamente marcado como caso de
 * demonstração (ver `src/lib/inventario-recuperacao.ts`, linha ~190). O
 * piloto real e ativo do sistema é `CA-CID-AT-FAM-2026-001` (Ana Luiza),
 * sem relação com estas quatro decisões. Por isso este registro vive como
 * referência de governança do programa "Piloto 5A.1" em si — não anexado
 * a um `case_id` que ainda não existe de verdade. Quando um caso real
 * herdar este piloto, o valor decidido (uma vez que exista) se aplica por
 * igual a ele.
 */

export type StatusDecisaoPiloto5A1 =
  | "aguardando_decisao_humana"
  | "decidida"
  | "equivalente_ja_coberta";

export type CodigoDecisaoPiloto5A1 = "D-01" | "D-04" | "D-05" | "D-06";

export type DecisaoPiloto5A1 = {
  codigo: CodigoDecisaoPiloto5A1;
  titulo: string;
  /** Texto literal de "Decisão necessária de Tatiana" no documento-fonte. */
  pendencia: string;
  status: StatusDecisaoPiloto5A1;
  /** Preenchido só depois que a Proprietária decidir de fato. Nunca inferido. */
  valorDecidido: unknown | null;
  decididoPor: string | null;
  decididoEm: string | null;
};

export const DECISOES_PILOTO_5A1: readonly DecisaoPiloto5A1[] = [
  {
    codigo: "D-01",
    titulo: "Consentimento mínimo de pesquisa e documentos",
    pendencia:
      "Aprovar o texto do consentimento, definir o canal de registro e autorizar o início da coleta.",
    status: "decidida",
    valorDecidido:
      "Texto de consentimento aprovado. Canal de registro: o consentimento já publicado em " +
      "https://clubeancestral.com.br/ (site institucional SEO). Gate existente " +
      "(leads.consentimento_status) é o ponto de verificação — nenhum escritor novo.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-04",
    titulo: "Cinco fontes humanas permitidas",
    pendencia:
      "Confirmar as fontes autorizadas para a primeira execução e a ordem de prioridade entre elas. " +
      "Apenas 4 fontes externas numeradas foram propostas (cartórios brasileiros; arquivo ou registro " +
      "civil brasileiro aplicável; Portale Antenati; comune, arquivo distrital, paróquia ou arquivo " +
      "local italiano aplicável) — falta escolher a 5ª.",
    status: "decidida",
    valorDecidido:
      "A \"5ª fonte\" deixa de ser pendência: o conjunto aprovado é a matriz do Adendo (Corte 1-bis), " +
      "maior que 5 fontes, já classificada em M1-M6 com modelo de acesso e status de documentação.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-05",
    titulo: "Responsável pela validação",
    pendencia:
      "Confirmar Tatiana Tosi (ou indicar outra pessoa) como responsável pela validação de evidências, " +
      "e definir suplente, se aplicável.",
    status: "decidida",
    valorDecidido:
      "Tatiana Melani Tosi, com \"equipe Clube Ancestral\" como forma institucional. " +
      "Vira default de responsavel_validacao e do responsável de elevação de evidência.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-06",
    titulo: "Critério de elevação de evidência",
    pendencia:
      "Aprovar os quatro critérios de elevação como regra oficial do piloto: " +
      "(A) informação compartilhada pela família → dado de pesquisa inicial; " +
      "(B) dado de pesquisa inicial → em validação documental; " +
      "(C) em validação documental → validado por documento; " +
      "(D) critério de registro de busca negativa.",
    status: "decidida",
    valorDecidido:
      "Os 4 critérios (A–D) aprovados como regra oficial. Critério D implementado em código " +
      "(evidencia-canonica.server.ts): busca negativa exige fonte e data, nunca conclui sozinha.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
] as const;

export function decisaoPiloto5A1(codigo: CodigoDecisaoPiloto5A1): DecisaoPiloto5A1 | undefined {
  return DECISOES_PILOTO_5A1.find((d) => d.codigo === codigo);
}

export function decisoesPendentesPiloto5A1(): readonly DecisaoPiloto5A1[] {
  return DECISOES_PILOTO_5A1.filter((d) => d.status === "aguardando_decisao_humana");
}

/** True somente quando as quatro decisões saíram de "aguardando_decisao_humana". */
export function pacoteDecisaoPiloto5A1Fechado(): boolean {
  return DECISOES_PILOTO_5A1.every((d) => d.status !== "aguardando_decisao_humana");
}
