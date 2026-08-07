/**
 * Ancestral Canvas — Entrega Consultiva (modelo "caso Sophi").
 *
 * Fluxo: Etapa 01 (leitura inicial + elegibilidade sintética + checklist mínimo)
 * já entregue dentro do app, com CTA direto para a Etapa 02 paga (link de
 * pagamento embutido), sem depender de reunião.
 *
 * O template é PARAMETRIZÁVEL por país (Itália, Portugal, Espanha, Alemanha...):
 * a estrutura de blocos é sempre a mesma, só o texto/regras mudam por país.
 * Dados de clientes reais NÃO devem ser expostos aqui — o caso Sophi é um
 * exemplo com dados fictícios/ilustrativos.
 */

import type { Caso, Pais } from "./casos";
import { brl } from "./casos";

export type ViaProcesso = "administrativa" | "judicial" | "a-definir";

/** Estado visual do fluxo consultivo. */
export type EstadoEntrega = "etapa-01-entregue" | "etapa-02-pendente" | "etapa-02-andamento" | "etapa-02-concluida";

export const ESTADO_ENTREGA_LABEL: Record<EstadoEntrega, string> = {
  "etapa-01-entregue": "Etapa 01 entregue",
  "etapa-02-pendente": "Etapa 02 pendente",
  "etapa-02-andamento": "Etapa 02 em andamento",
  "etapa-02-concluida": "Etapa 02 concluída",
};

export const VIA_LABEL: Record<ViaProcesso, string> = {
  administrativa: "Via administrativa",
  judicial: "Via judicial",
  "a-definir": "Via a definir",
};

/** Regras de texto adaptáveis por país — mesma estrutura de blocos. */
export type RegraPais = {
  pais: Pais;
  transmissao: string;
  viaPadrao: ViaProcesso;
  atencao: string;
  docsCriticos: string[];
  servicoEtapa02: string;
  valorEtapa02: number;
};

export const REGRAS_PAIS: Record<string, RegraPais> = {
  Itália: {
    pais: "Itália",
    transmissao: "Transmissão por descendência sem limite de gerações, desde que não haja interrupção da linha.",
    viaPadrao: "judicial",
    atencao: "Linhas com transmissão por mulher antes de 1948 e filas consulares longas costumam levar o caso ao Judiciário italiano.",
    docsCriticos: ["Certidão de nascimento do ancestral italiano", "Certidão de não naturalização", "Certidões brasileiras retificadas"],
    servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via italiana (administrativa ou judicial)",
    valorEtapa02: 1436,
  },
  Portugal: {
    pais: "Portugal",
    transmissao: "Transmissão por descendência até netos, com exigência de vínculo efetivo à comunidade portuguesa em alguns cenários.",
    viaPadrao: "administrativa",
    atencao: "Prazos e exigências de vínculo mudaram nos últimos anos: a leitura documental define o enquadramento correto.",
    docsCriticos: ["Assento de nascimento português", "Certidões brasileiras integrais", "Comprovação de vínculo (quando exigida)"],
    servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via portuguesa",
    valorEtapa02: 1290,
  },
  Espanha: {
    pais: "Espanha",
    transmissao: "Transmissão por descendência com janelas legais específicas (Ley de Memoria Democrática e opções ordinárias).",
    viaPadrao: "administrativa",
    atencao: "Vários caminhos possuem prazo de adesão — a definição da janela correta é decisiva.",
    docsCriticos: ["Certidão espanhola do ancestral", "Documentos de saída/entrada", "Certidões brasileiras atualizadas"],
    servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via espanhola",
    valorEtapa02: 1190,
  },
  Alemanha: {
    pais: "Alemanha",
    transmissao: "Transmissão por descendência com regras distintas conforme data de nascimento e perda de nacionalidade do ancestral.",
    viaPadrao: "administrativa",
    atencao: "Casos de perda por naturalização ou por regras de gênero anteriores a 1975 exigem enquadramento próprio (StAG).",
    docsCriticos: ["Registro alemão do ancestral", "Prova de não perda da nacionalidade", "Certidões brasileiras integrais"],
    servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via alemã",
    valorEtapa02: 1290,
  },
  Croácia: {
    pais: "Croácia",
    transmissao: "Transmissão por descendência com comprovação da linha e vínculo com a Croácia.",
    viaPadrao: "administrativa",
    atencao: "Documentação de origem costuma exigir pesquisa em arquivos locais.",
    docsCriticos: ["Registro croata do ancestral", "Cadeia completa de certidões", "Tradução juramentada"],
    servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via croata",
    valorEtapa02: 1290,
  },
};

export const REGRA_GENERICA: RegraPais = {
  pais: "Itália",
  transmissao: "Transmissão por descendência, com regras específicas do país de origem aplicáveis à sua linha.",
  viaPadrao: "a-definir",
  atencao: "A definição da via depende da leitura documental completa da linha.",
  docsCriticos: ["Registro do ancestral no país de origem", "Cadeia de certidões brasileiras", "Documento de identidade atual"],
  servicoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via do seu caso",
  valorEtapa02: 1290,
};

export const regraPais = (pais: Pais): RegraPais => REGRAS_PAIS[pais] ?? { ...REGRA_GENERICA, pais };

/* ---------------------------------------------------------------- */

export type EntregaConsultiva = {
  id: string;
  /* cabeçalho */
  pessoa: string;
  paisPrincipal: Pais;
  via: ViaProcesso;
  estado: EstadoEntrega;
  dataEntrega1: string;
  demo?: boolean;
  /* bloco 1 — leitura inicial */
  leituraInicial: { linha: string[]; resumo: string };
  /* bloco 2 — elegibilidade sintética */
  elegibilidade: { viavel: boolean; cenario: string; texto: string };
  /* bloco 3 — checklist mínimo */
  checklist: { item: string; situacao: "tem" | "falta" | "critico" }[];
  /* bloco 4 — próximo passo pago */
  proximoPasso: {
    servico: string;
    descricao: string;
    beneficio: string;
    valor: number;
    valorAte?: number;
    prazo: string;
    linkPagamento: string;
  };
};

export const CHECKLIST_LABEL: Record<EntregaConsultiva["checklist"][number]["situacao"], string> = {
  tem: "Já temos",
  falta: "Falta",
  critico: "Crítico",
};

/** Caso modelo (dados ilustrativos, sem informação real de cliente). */
export const CASO_MODELO: EntregaConsultiva = {
  id: "MODELO-SOPHI",
  pessoa: "Sophi Piccoli",
  paisPrincipal: "Itália",
  via: "judicial",
  estado: "etapa-02-pendente",
  dataEntrega1: "Entrega 1 concluída",
  demo: true,
  leituraInicial: {
    linha: ["Avô italiano (nascido na Itália)", "Filha — nascida no Brasil", "Sophi — neta, pessoa-foco"],
    resumo:
      "A linha de transmissão é curta e direta: avô italiano, filha brasileira e você. Isso é um bom sinal — quanto menos gerações, menor o volume documental e menor o risco de divergências de grafia.",
  },
  elegibilidade: {
    viavel: true,
    cenario: "Cenário mais provável: via judicial na Itália",
    texto:
      "Pela leitura inicial, há viabilidade para o reconhecimento. O caminho mais provável hoje é o judicial, principalmente pela fila consular e pelo perfil da sua linha. Não é um problema: é apenas o trajeto com prazo mais previsível para o seu caso.",
  },
  checklist: [
    { item: "Identificação do ancestral italiano", situacao: "tem" },
    { item: "Certidões brasileiras da linha (nascimento e casamento)", situacao: "tem" },
    { item: "Certidão de nascimento italiana do ancestral", situacao: "critico" },
    { item: "Certidão de não naturalização", situacao: "critico" },
    { item: "Retificações de grafia nas certidões brasileiras", situacao: "falta" },
  ],
  proximoPasso: {
    servico: "Estudo aprofundado de elegibilidade + desenho da via italiana judicial",
    descricao:
      "Análise completa da sua linha, verificação documental item a item e desenho do caminho jurídico com prazos, custos e ordem das providências.",
    beneficio: "Você sai com clareza jurídica e documental e um plano concreto — sem precisar de reunião para começar.",
    valor: 1436,
    prazo: "Entrega em até 10 dias úteis",
    linkPagamento: "https://pagamento.clubeancestral.com/etapa-02-italia",
  },
};

/** Gera a entrega consultiva a partir de um caso do Canvas (template reaproveitável). */
export function entregaByCaso(caso: Caso): EntregaConsultiva {
  const regra = regraPais(caso.pais);
  const linha = caso.linhaAncestral.slice(0, 4).map((l) => `${l.texto} · ${l.ano}`);
  const criticos = caso.checklistDocs.filter((d) => d.status === "pendente").slice(0, 3);
  const tem = caso.checklistDocs.filter((d) => d.status === "ok").slice(0, 2);
  const parciais = caso.checklistDocs.filter((d) => d.status === "parcial").slice(0, 2);
  const pago = caso.status === "proposta-aceita";

  return {
    id: caso.id,
    pessoa: caso.cliente,
    paisPrincipal: caso.pais,
    via: regra.viaPadrao,
    estado: pago ? "etapa-02-andamento" : "etapa-02-pendente",
    dataEntrega1: caso.dataInicio,
    leituraInicial: {
      linha: linha.length ? linha : ["Linha em levantamento"],
      resumo: `${regra.transmissao} ${regra.atencao}`,
    },
    elegibilidade: {
      viavel: true,
      cenario: `Cenário mais provável: ${VIA_LABEL[regra.viaPadrao].toLowerCase()}`,
      texto: `Pela leitura inicial da sua linha (${caso.tipoProcesso}), há viabilidade para seguir. ${regra.atencao}`,
    },
    checklist: [
      ...tem.map((d) => ({ item: d.item, situacao: "tem" as const })),
      ...parciais.map((d) => ({ item: d.item, situacao: "falta" as const })),
      ...criticos.map((d) => ({ item: d.item, situacao: "critico" as const })),
      ...regra.docsCriticos.slice(0, 1).map((item) => ({ item, situacao: "critico" as const })),
    ].slice(0, 6),
    proximoPasso: {
      servico: regra.servicoEtapa02,
      descricao:
        "Análise completa da sua linha, verificação documental item a item e desenho do caminho com prazos, custos e ordem das providências.",
      beneficio: "Clareza jurídica e documental e um plano concreto para avançar, sem depender de reunião.",
      valor: regra.valorEtapa02,
      prazo: "Entrega em até 10 dias úteis",
      linkPagamento: caso.plano.linkPagamento || "https://pagamento.clubeancestral.com/etapa-02",
    },
  };
}

/** Texto-base de WhatsApp para comunicar a Entrega 1 e o CTA da Etapa 02. */
export function textoWhatsapp(e: EntregaConsultiva): string {
  const primeiro = e.pessoa.split(" ")[0];
  return [
    `Oi, ${primeiro}! Tudo bem?`,
    "",
    `Sua *Entrega 1 — Leitura inicial do seu caso* já está disponível no app do Clube Ancestral.`,
    `Nela você encontra: a leitura da sua linha (${e.paisPrincipal}), a síntese de elegibilidade e o checklist mínimo de documentos.`,
    "",
    `Pelo que vimos, ${e.elegibilidade.cenario.toLowerCase()}.`,
    "",
    `O próximo passo recomendado é a *Etapa 02 — ${e.proximoPasso.servico}* (${brl(e.proximoPasso.valor)}, ${e.proximoPasso.prazo.toLowerCase()}).`,
    `Se quiser avançar, é só tocar em "Quero avançar para a Etapa 02" dentro do app — ou usar este link: ${e.proximoPasso.linkPagamento}`,
    "",
    "Qualquer dúvida, pode responder por aqui mesmo. 🌳",
  ].join("\n");
}
