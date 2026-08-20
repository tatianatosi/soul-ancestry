export type EstadoCriterio = "atendido" | "parcial" | "pendente";

export type CriterioAceite = {
  id: string;
  criterio: string;
  dominio: string;
  estado: EstadoCriterio;
  evidencia: string;
  rota: string;
  regra: string;
};

export const ESTADO_CRITERIO_LABEL: Record<EstadoCriterio, string> = {
  atendido: "Atendido",
  parcial: "Parcial",
  pendente: "Pendente",
};

/**
 * Registro somente leitura dos critérios de aceite (item 4) do pacote vigente.
 * Nenhum critério aqui dispara ação, automação ou comunicação externa.
 */
export const CRITERIOS_ACEITE: CriterioAceite[] = [
  {
    id: "CA-AC-01",
    criterio: "Usuária sabe exatamente onde responder cada pergunta.",
    dominio: "Desk — Casos 360",
    estado: "atendido",
    evidencia:
      "Ficha canônica com abas por domínio, campos rotulados e painel de bloqueios com link direto para a aba de resolução.",
    rota: "/casos/$caseId",
    regra: "Cada pendência aponta para um único lugar de resposta.",
  },
  {
    id: "CA-AC-02",
    criterio: "Perguntas narrativas não poluem campos estruturados.",
    dominio: "Desk — Casos 360 / Jurídica",
    estado: "atendido",
    evidencia:
      "Campos estruturados usam listas fechadas (catálogos); narrativa vive em brief interno, riscos e log do caso.",
    rota: "/casos/$caseId",
    regra: "Texto livre nunca alimenta parâmetro contratual nem estado derivado.",
  },
  {
    id: "CA-AC-03",
    criterio: "Financeiro e Biblioteca são acessíveis no mobile.",
    dominio: "Desk — navegação",
    estado: "atendido",
    evidencia: "Itens Financeiro e Governança e biblioteca presentes na navegação responsiva do Desk.",
    rota: "/financeiro",
    regra: "Nenhum módulo aprovado some em viewport reduzido.",
  },
  {
    id: "CA-AC-04",
    criterio: "Evidência não é exibida ao cliente sem projeção.",
    dominio: "App Cliente — visibilidade",
    estado: "atendido",
    evidencia:
      "Projeção autorizada por estados de visibilidade e sanitização de mérito; evidência interna não tem rota cliente.",
    rota: "/governanca/modulos-contextuais",
    regra: "Desk é soberano; App Cliente é projeção, nunca fonte.",
  },
  {
    id: "CA-AC-05",
    criterio: "Fonte catalogada não dispara consulta.",
    dominio: "Pesquisa genealógica",
    estado: "atendido",
    evidencia: "Catálogo de fontes é registro; pesquisa externa exige contrato assinado e gate liberado.",
    rota: "/pesquisa",
    regra: "Catalogar ≠ consultar. Nenhuma consulta externa é automática.",
  },
  {
    id: "CA-AC-06",
    criterio: "Árvore nasce da Ficha Piloto e não de texto livre.",
    dominio: "Núcleo familiar",
    estado: "atendido",
    evidencia: "Árvore e núcleo derivam de núcleos_familiares, membros e dependentes registrados na ficha.",
    rota: "/casos/$caseId",
    regra: "Estrutura familiar é dado, não redação.",
  },
  {
    id: "CA-AC-07",
    criterio: "Encontro de Linhagem só publica após revisão.",
    dominio: "Entregas / Qualidade",
    estado: "parcial",
    evidencia:
      "Entrega robusta depende de revisão de qualidade e liberação; publicação ao cliente permanece manual e auditada.",
    rota: "/qualidade",
    regra: "Sem revisão aprovada não há projeção ao cliente.",
  },
  {
    id: "CA-AC-08",
    criterio: "Blueprint puxa preço homologado e não duplica Roteiro Master.",
    dominio: "Blueprint e preço",
    estado: "atendido",
    evidencia: "Blueprint lê preço do catálogo homologado; escopo referencia a proposta Canva, sem cópia paralela.",
    rota: "/casos/$caseId/contrato/preparar",
    regra: "Preço só de fonte homologada; escopo só da proposta aprovada.",
  },
  {
    id: "CA-AC-09",
    criterio: "Pacotes WhatsApp e Familiar Conectado aparecem no catálogo sem automatizar comportamento.",
    dominio: "Catálogo de produtos",
    estado: "atendido",
    evidencia: "Itens de catálogo com regra de uso; fila de comunicação nunca envia sozinha.",
    rota: "/configuracoes",
    regra: "Catálogo descreve oferta, não aciona automação.",
  },
  {
    id: "CA-AC-10",
    criterio: "Drive fica apenas em fila de provisionamento até gates completos e confirmação futura.",
    dominio: "Integrações",
    estado: "atendido",
    evidencia: "drive_provisioning_queue permanece em preparação; nenhuma pasta ou arquivo é criado.",
    rota: "/integracoes",
    regra: "Provisionamento externo exige gates completos e confirmação humana.",
  },
  {
    id: "CA-AC-11",
    criterio: "IA só sugere e mantém auditoria.",
    dominio: "Assistente de pesquisa",
    estado: "atendido",
    evidencia: "Assistente devolve sugestões com registro em auditoria; nenhuma escrita direta em campo canônico.",
    rota: "/auditoria",
    regra: "IA sugere, humano decide, sistema registra.",
  },
];

export function contarPorEstado(): Record<EstadoCriterio, number> {
  return CRITERIOS_ACEITE.reduce(
    (acc, c) => {
      acc[c.estado] += 1;
      return acc;
    },
    { atendido: 0, parcial: 0, pendente: 0 } as Record<EstadoCriterio, number>,
  );
}

export function criteriosPendentes(): CriterioAceite[] {
  return CRITERIOS_ACEITE.filter((c) => c.estado !== "atendido");
}
