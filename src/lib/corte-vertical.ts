// Corte vertical do primeiro release: fontes canônicas, seis entidades funcionais,
// escopo adiado e estado real do piloto Ana. Camada declarativa de leitura interna.

export type FonteCanonica = {
  dominio: string;
  fonte: string;
  regra: string;
};

export const FONTES_CANONICAS: FonteCanonica[] = [
  {
    dominio: "Contatos e leads",
    fonte: "Desk Intelligence",
    regra: "Placego fornece apenas a exportação inicial de contatos.",
  },
  {
    dominio: "Conversas e contexto comercial",
    fonte: "WhatsApp, transcrições e reuniões registradas",
    regra: "Não inferir etapa ou aceite sem evidência registrada.",
  },
  {
    dominio: "Funil e conversões",
    fonte: "Eventos imutáveis no Desk",
    regra: "Cada marco gera um evento próprio; planilhas não são fonte.",
  },
  {
    dominio: "Casos, famílias e planejamento",
    fonte: "Desk Intelligence",
    regra: "Um núcleo, pessoas individualizadas, um caso e um plano ativo.",
  },
  {
    dominio: "Contrato e proposta",
    fonte: "Ambiente documental aprovado",
    regra: "O Desk guarda estado e referência interna, não o instrumento.",
  },
  {
    dominio: "Pagamento",
    fonte: "Asaas",
    regra: "Fonte transacional; não define escopo nem preço.",
  },
  {
    dominio: "Dossiê e documentos",
    fonte: "Drive / ambiente autorizado",
    regra: "O Desk indexa referências; não duplica arquivos.",
  },
  {
    dominio: "Catálogo de oferta",
    fonte: "Top 30 no Desk",
    regra: "Preço sugerido homologado vira preço vigente.",
  },
  {
    dominio: "Planilhas antigas",
    fonte: "Legado somente leitura",
    regra: "Sem novos lançamentos e sem webhook intermediário.",
  },
];

export const NOTA_PLACEGO =
  "Placego não é fonte de marketing, investimento ou conversão. Exportamos apenas contatos e metadados mínimos de origem. A verdade comercial nasce das conversas, transcrições, reuniões e eventos do Desk.";

export type EntidadeVertical = {
  codigo: string;
  nome: string;
  proposito: string;
  regras: string[];
};

export const ENTIDADES_VERTICAIS: EntidadeVertical[] = [
  {
    codigo: "contacts",
    nome: "Contacts",
    proposito: "Pessoa única, importada do Placego ou cadastrada manualmente.",
    regras: [
      "Nunca criar múltiplos leads para a mesma pessoa.",
      "Deduplicação por telefone normalizado e e-mail.",
      "Fusão só após revisão humana.",
    ],
  },
  {
    codigo: "conversations",
    nome: "Conversations",
    proposito: "Registro interno de WhatsApp, transcrição, call e reunião.",
    regras: [
      "Campos: origem, data, responsável, resumo validado e evidência.",
      "Imutável após o registro.",
      "Nenhuma etapa é inferida automaticamente da conversa.",
    ],
  },
  {
    codigo: "opportunities",
    nome: "Opportunities",
    proposito: "Objetivo, país, trilha preliminar, responsável, etapa e próxima ação.",
    regras: [
      "Não contém preço, SKU ou link digitado livremente.",
      "Responsável, próxima ação e prazo obrigatórios.",
    ],
  },
  {
    codigo: "conversion_events",
    nome: "Conversion events",
    proposito: "Marcos imutáveis do funil, um evento por acontecimento.",
    regras: ["Lista fechada de eventos.", "Sem edição ou exclusão; correção gera novo evento."],
  },
  {
    codigo: "cases_families",
    nome: "Cases and families",
    proposito: "Um núcleo familiar, pessoas individualizadas e um dossiê-mãe.",
    regras: ["Links internos e permissões controladas.", "Um caso ativo por núcleo."],
  },
  {
    codigo: "case_plans",
    nome: "Case plans",
    proposito: "Fase da jornada, responsável, próxima ação e pendências.",
    regras: [
      "Entrega robusta e próxima micro-entrega sempre visíveis.",
      "Último contato contextualizado.",
      "Alertas de 10 e 14 dias sem touchpoint.",
    ],
  },
];

export const EVENTOS_CONVERSAO_CANONICOS = [
  "Lead criado",
  "Discovery agendada",
  "Discovery realizada",
  "Proposta enviada",
  "Aceite verbal",
  "Confirmação formal recebida",
  "Contrato enviado",
  "Contrato assinado",
  "Pagamento inicial confirmado",
  "Onboarding iniciado",
  "Caso ativo",
  "Perdido",
] as const;

export const FORA_DO_PRIMEIRO_RELEASE = [
  "CAC, ROI, custo por lead e dashboards de mídia.",
  "Automação de campanhas.",
  "Webhooks de planilhas.",
  "Catálogo extenso de SKUs.",
  "Gamificação.",
  "Copy ou notificações automáticas.",
  "Sincronização financeira além de referências de estado.",
];

export const NOTA_FORA_DO_RELEASE =
  "Essas camadas entram depois que houver dados limpos e eventos reais registrados no Desk.";

export const ANA_ESTADO_REAL = {
  casoCanonico: "CA-CID-AT-FAM-2026-001",
  nomeOperacional: "Projeto familiar — Ana Luiza",
  classificacao: "Primeira cliente",
  aliasHistorico: "CA-AUT-ANALUIZA-FAM-2026-001",
  trilha: "Áustria — §58c StbG",
  responsavel: "Tatiana Tosi",
  aceiteFormal: "Confirmado em 14/08/2026",
  estado: "Formalização em preparação",
  situacaoOperacional: "NO_GO",
};

export const ANA_BLOQUEIOS: string[] = [
  "Cadastro da contratante incompleto.",
  "Dados oficiais da contratada não confirmados.",
  "Contrato específico ainda inexistente.",
  "Anexo I / Ordem de Serviço pendente.",
  "Revisão jurídica pendente.",
  "Método de assinatura pendente.",
  "Nome completo e dados da Alice pendentes.",
  "Representação legal do Felipe pendente.",
  "Pacote comercial familiar de R$ 9.600 sem SKU canônico no catálogo novo.",
  "Asaas bloqueado até contrato, escopo e dados serem resolvidos.",
];

export const ANA_NOTA_COMERCIAL =
  "A proposta aceita cobre três titulares e um dependente. A estrutura aprovada (confirmada pela Proprietária em " +
  "09/10/2026): R$ 9.600 no total, R$ 960 por mês, divididos em três assinaturas de R$ 320 — Ana Luiza, Adair e " +
  "Alice —, durante 10 meses. As duas leituras que circulam ('10 mensalidades de R$ 960' e 'três assinaturas de " +
  "R$ 320') descrevem a MESMA condição, por ângulos diferentes: 3 x 320 = 960 por mês, 960 x 10 = 9.600. Nada " +
  "disso vira cobrança, contrato ou SKU sem reconciliação e definição formal.";

export type DegrauOnboarding = {
  estado: string;
  evidencia: string;
  proximoPasso: string;
};

export const ESCADA_ONBOARDING_PADRAO: DegrauOnboarding[] = [
  {
    estado: "Aceite verbal",
    evidencia: "Registro da conversa ou reunião.",
    proximoPasso: "Pedir confirmação por escrito.",
  },
  {
    estado: "Confirmação formal",
    evidencia: "WhatsApp, e-mail ou print registrado.",
    proximoPasso: "Preparar formalização.",
  },
  {
    estado: "Formalização",
    evidencia: "Cadastro, escopo e condição definidos.",
    proximoPasso: "Preparar contrato e Ordem de Serviço.",
  },
  {
    estado: "Contrato assinado",
    evidencia: "Instrumento e evidência interna.",
    proximoPasso: "Preparar cobrança autorizada.",
  },
  {
    estado: "Pagamento confirmado",
    evidencia: "Evento transacional no Asaas.",
    proximoPasso: "Iniciar onboarding.",
  },
  {
    estado: "Onboarding",
    evidencia: "Núcleo, dossiê, plano e checklist.",
    proximoPasso: "Criar primeira micro-entrega.",
  },
  {
    estado: "Caso ativo",
    evidencia: "Gates cumpridos.",
    proximoPasso: "Executar jornada e cadência.",
  },
];

export const NOTA_EVIDENCIA =
  "Transcrição ou registro de WhatsApp é evidência de conversa. O aceite formal é um evento próprio, associado à oportunidade — “disse que fechou” nunca equivale a contrato, pagamento ou cliente ativo.";

export type SituacaoDegrau = "concluido" | "atual" | "bloqueado";

export type DegrauAvaliado = DegrauOnboarding & {
  ordem: number;
  situacao: SituacaoDegrau;
  motivo: string;
};

/**
 * Avalia a escada padrão sem antecipar etapas: tudo acima do degrau atual
 * permanece bloqueado até a evidência exigida do degrau corrente existir.
 */
export function avaliarEscadaOnboarding(estadoAtual: string, evidenciaRegistrada = true): DegrauAvaliado[] {
  const indiceAtual = ESCADA_ONBOARDING_PADRAO.findIndex((d) => d.estado === estadoAtual);
  return ESCADA_ONBOARDING_PADRAO.map((d, i) => {
    if (indiceAtual < 0) {
      return { ...d, ordem: i + 1, situacao: "bloqueado" as const, motivo: "Estado atual não reconhecido." };
    }
    if (i < indiceAtual) {
      return { ...d, ordem: i + 1, situacao: "concluido" as const, motivo: "Evidência exigida registrada." };
    }
    if (i === indiceAtual) {
      return {
        ...d,
        ordem: i + 1,
        situacao: "atual" as const,
        motivo: evidenciaRegistrada ? "Evidência registrada. Executar o próximo passo." : "Evidência exigida ainda pendente.",
      };
    }
    return {
      ...d,
      ordem: i + 1,
      situacao: "bloqueado" as const,
      motivo: `Depende de “${ESCADA_ONBOARDING_PADRAO[i - 1]!.estado}”. Não antecipar.`,
    };
  });
}

export const JOAO_ESTADO_ESCADA = {
  caso: "Nacionalidade portuguesa — titular individual",
  degrauAtual: "Confirmação formal",
  evidencia: "Confirmação por escrito registrada em WhatsApp.",
  proximoPasso: "Preparar formalização: cadastro, escopo e condição comercial definidos.",
  naoAntecipar: [
    "Nenhum contrato ou Ordem de Serviço é emitido antes da formalização concluída.",
    "Nenhuma cobrança é autorizada antes de contrato assinado com evidência interna.",
    "Pagamento previsto não é pagamento confirmado — só o evento transacional no Asaas conta.",
    "Onboarding e caso ativo permanecem fechados até os gates anteriores serem cumpridos.",
  ],
} as const;

