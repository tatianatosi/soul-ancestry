/**
 * Templates de WhatsApp por etapa — uso MANUAL.
 *
 * Nenhum template é enviado por este módulo. Não há automação, disparo,
 * agendamento ou integração externa: o texto é apenas montado para que uma
 * pessoa copie, revise e envie pelo canal próprio, registrando depois a
 * interação imutável no Desk.
 *
 * Regras aplicadas:
 * - Cada etapa declara os gates que precisam estar cumpridos antes do uso.
 * - Só campos seguros são personalizáveis (nome, serviço, objetivo, marco…).
 * - Nenhum template afirma contrato, cobrança, assinatura, portal, onboarding
 *   ou hipótese jurídica antes do evento real correspondente.
 */

export type CampoSeguro =
  | "nome"
  | "servico"
  | "objetivo"
  | "responsavel"
  | "item"
  | "motivo"
  | "orientacao"
  | "entrega"
  | "proximo_marco"
  | "dependencia"
  | "acao_cliente"
  | "orgao"
  | "data_revisao"
  | "opcoes_horario"
  | "trabalho_realizado";

export const ROTULO_CAMPO: Record<CampoSeguro, string> = {
  nome: "Nome do cliente",
  servico: "Serviço (como foi apresentado)",
  objetivo: "Objetivo combinado",
  responsavel: "Responsável pelo caso",
  item: "Documento / item",
  motivo: "Motivo objetivo",
  orientacao: "Orientação simples",
  entrega: "Entrega aprovada (linguagem simples)",
  proximo_marco: "Próximo marco verificável",
  dependencia: "Dependência atual",
  acao_cliente: "Ação do cliente (se existir)",
  orgao: "Órgão / arquivo",
  data_revisao: "Data de revisão",
  opcoes_horario: "Opções de horário",
  trabalho_realizado: "Trabalho realizado nesta etapa",
};

export type GrupoTemplate = "funil" | "onboarding";

export type TemplateWhatsapp = {
  id: string;
  grupo: GrupoTemplate;
  etapa: string;
  quandoUsar: string;
  gatesExigidos: string[];
  campos: CampoSeguro[];
  texto: string;
};

export const TEMPLATES_WHATSAPP: TemplateWhatsapp[] = [
  {
    id: "proposta_enviada",
    grupo: "funil",
    etapa: "Proposta enviada",
    quandoUsar: "Logo após o envio da proposta.",
    gatesExigidos: ["Proposta em versão aprovada, enviada ao cliente"],
    campos: ["nome", "objetivo"],
    texto:
      "Oi, {nome}! Te enviei a proposta com o caminho que desenhamos para {objetivo}. Leia com calma; se fizer sentido, podemos ajustar qualquer ponto antes de você decidir. Estou por aqui.",
  },
  {
    id: "followup_proposta",
    grupo: "funil",
    etapa: "Follow-up de proposta",
    quandoUsar: "Após prazo razoável, sem resposta.",
    gatesExigidos: ["Proposta enviada e registrada", "Sem resposta registrada até a data"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! Passando para saber se conseguiu olhar a proposta. Não precisa decidir com pressa — queria apenas entender se ficou alguma dúvida ou se faz sentido ajustarmos algo.",
  },
  {
    id: "aceite_verbal",
    grupo: "funil",
    etapa: "Aceite verbal",
    quandoUsar: "Ao fim de call ou conversa em que o cliente diz que quer seguir.",
    gatesExigidos: ["Conversa registrada com data, canal e responsável"],
    campos: ["nome"],
    texto:
      "Fico muito feliz em seguirmos juntos, {nome}. Vou registrar nossa conversa como aceite verbal e, para avançarmos com segurança, vou te pedir uma confirmação escrita simples por aqui.",
  },
  {
    id: "confirmacao_formal_pedido",
    grupo: "funil",
    etapa: "Confirmação formal (pedido)",
    quandoUsar: "Logo após o aceite verbal.",
    gatesExigidos: ["Aceite verbal registrado como interação"],
    campos: ["nome", "servico"],
    texto:
      "Oi, {nome}! Fiquei muito feliz com a sua decisão de avançar com o {servico}.\n\nPara eu registrar direitinho esse próximo passo, você pode me confirmar por escrito aqui no WhatsApp que está de acordo em iniciar o {servico} nas condições que conversamos?\n\nPode responder algo simples como: “Confirmo que estou de acordo em iniciar o {servico} nas condições apresentadas.”\n\nAssim que eu receber sua confirmação, preparo a formalização com calma e te explico os próximos passos. Estou por aqui se surgir qualquer dúvida.",
  },
  {
    id: "confirmacao_formal_recebida",
    grupo: "funil",
    etapa: "Confirmação formal recebida",
    quandoUsar: "Após receber o “confirmo” por escrito.",
    gatesExigidos: ["Confirmação escrita recebida e anexada como evidência"],
    campos: ["nome"],
    texto:
      "Obrigada, {nome}! Recebi sua confirmação e vou iniciar a preparação interna da formalização. Nesta etapa ainda vamos conferir cadastro, escopo e documentos necessários. Volto para você com a próxima orientação.",
  },
  {
    id: "pedido_dados_contrato",
    grupo: "funil",
    etapa: "Pedido de dados para contrato",
    quandoUsar: "Somente após a confirmação formal escrita.",
    gatesExigidos: ["Confirmação formal registrada", "Pedido limitado a dados de formalização"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! Para preparar a formalização com cuidado, preciso confirmar alguns dados cadastrais e a composição dos participantes. Vou te enviar uma lista objetiva; se preferir, podemos organizar isso por etapas.",
  },
  {
    id: "formalizacao_em_preparacao",
    grupo: "funil",
    etapa: "Formalização em preparação",
    quandoUsar: "Atualização enquanto a equipe revisa dados e escopo.",
    gatesExigidos: ["Reconciliação interna de cadastro e escopo em andamento"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! Estamos conferindo os dados e o escopo para que a formalização reflita exatamente o que foi combinado. Ainda não há nenhuma cobrança ou assinatura para você fazer neste momento; aviso assim que a próxima etapa estiver pronta.",
  },
  {
    id: "contrato_pronto",
    grupo: "funil",
    etapa: "Contrato pronto para assinatura",
    quandoUsar: "Somente após revisão interna aprovada.",
    gatesExigidos: ["Contrato, Anexo I e OS gerados da fonte aprovada", "Revisão interna registrada e aprovada"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! A formalização foi preparada com base no escopo que confirmamos. Vou te enviar a versão para leitura e assinatura. Se houver qualquer dúvida antes de assinar, falamos e ajustamos com tranquilidade.",
  },
  {
    id: "contrato_assinado",
    grupo: "funil",
    etapa: "Contrato assinado",
    quandoUsar: "Após evidência externa de assinatura.",
    gatesExigidos: ["Evidência de assinatura registrada no caso"],
    campos: ["nome"],
    texto:
      "Obrigada, {nome}! Recebemos o contrato assinado. Agora vamos conferir a etapa financeira combinada e, assim que o pagamento inicial estiver confirmado, iniciamos oficialmente o onboarding.",
  },
  {
    id: "pagamento_confirmado",
    grupo: "funil",
    etapa: "Pagamento inicial confirmado",
    quandoUsar: "Somente a partir de evento financeiro real confirmado.",
    gatesExigidos: ["Contrato assinado", "Pagamento inicial confirmado por evento financeiro"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! Confirmamos o pagamento inicial. A partir de agora, seu caso entra no onboarding: você receberá o responsável, o checklist inicial e o plano dos próximos passos.",
  },

  {
    id: "d0_boas_vindas",
    grupo: "onboarding",
    etapa: "D0 — boas-vindas",
    quandoUsar: "Contrato, pagamento e ativação confirmados.",
    gatesExigidos: ["Contrato assinado", "Pagamento inicial confirmado", "Caso ativado por decisão humana"],
    campos: ["nome", "responsavel"],
    texto:
      "Oi, {nome}! Seja bem-vindo(a) oficialmente ao Clube Ancestral. Seu caso já entrou em onboarding e {responsavel} será seu ponto principal de contato. Nos próximos dias, organizamos o checklist e o plano inicial de trabalho.",
  },
  {
    id: "d1_d3_plano",
    grupo: "onboarding",
    etapa: "D1–D3 — plano e checklist",
    quandoUsar: "Após preparar ambiente e plano de ação.",
    gatesExigidos: ["Caso ativado", "Plano de ação e checklist criados"],
    campos: ["nome"],
    texto:
      "Oi, {nome}! Organizamos os primeiros passos do seu caso. Você receberá um checklist priorizado e o plano de ação inicial, para saber o que depende de nós e o que precisaremos de vocês.",
  },
  {
    id: "d5_d7_microentrega",
    grupo: "onboarding",
    etapa: "D5–D7 — primeira micro-entrega",
    quandoUsar: "Após aprovação interna da entrega.",
    gatesExigidos: ["Micro-entrega aprovada internamente e publicada"],
    campos: ["nome", "entrega", "proximo_marco"],
    texto:
      "Oi, {nome}! Temos uma primeira atualização do seu caso: {entrega}. Isso marca o início prático da nossa jornada. O próximo passo é {proximo_marco}.",
  },
  {
    id: "documento_recebido",
    grupo: "onboarding",
    etapa: "Documento recebido",
    quandoUsar: "Após revisão interna do upload.",
    gatesExigidos: ["Upload registrado no caso"],
    campos: ["item"],
    texto:
      "Recebemos o documento de {item}. Vamos revisá-lo internamente e, se precisarmos de complemento ou nova versão, explicaremos exatamente o que falta.",
  },
  {
    id: "pedido_reenvio",
    grupo: "onboarding",
    etapa: "Pedido de reenvio",
    quandoUsar: "Após revisão interna com justificativa registrada.",
    gatesExigidos: ["Revisão concluída com motivo objetivo registrado"],
    campos: ["nome", "item", "motivo", "orientacao"],
    texto:
      "Oi, {nome}! Para conseguirmos usar o documento de {item}, precisamos de uma nova versão porque {motivo}. Você consegue nos enviar {orientacao}? Se quiser, posso te orientar.",
  },
  {
    id: "atualizacao_contextualizada",
    grupo: "onboarding",
    etapa: "Atualização contextualizada",
    quandoUsar: "Antes de D14, mesmo sem avanço material.",
    gatesExigidos: ["Touchpoint com os quatro campos preenchidos"],
    campos: ["nome", "trabalho_realizado", "dependencia", "acao_cliente", "proximo_marco"],
    texto:
      "Oi, {nome}! Passando com uma atualização do seu caso: nesta etapa, avançamos em {trabalho_realizado} e estamos aguardando {dependencia}. Por enquanto, você não precisa fazer nada além de {acao_cliente}. O próximo marco esperado é {proximo_marco}.",
  },
  {
    id: "espera_externa",
    grupo: "onboarding",
    etapa: "Espera externa",
    quandoUsar: "Quando órgão, arquivo ou terceiro é a dependência.",
    gatesExigidos: ["Espera institucional externa registrada com motivo"],
    campos: ["nome", "orgao", "data_revisao"],
    texto:
      "Oi, {nome}! Nesta etapa, estamos aguardando um retorno externo de {orgao}. Isso não exige nenhuma ação sua agora. Seguimos acompanhando e voltamos a atualizar você até {data_revisao} ou antes, se houver novidade.",
  },
  {
    id: "convite_onboarding",
    grupo: "onboarding",
    etapa: "Convite para call de onboarding",
    quandoUsar: "Quando a call é necessária e o caso é elegível.",
    gatesExigidos: ["Caso ativado", "Responsável definido"],
    campos: ["nome", "opcoes_horario"],
    texto:
      "Oi, {nome}! Para alinharmos o início da jornada, gostaria de agendar nossa call de onboarding. Nela vamos revisar o plano, o checklist e os próximos marcos. Qual destes horários funciona melhor para você: {opcoes_horario}?",
  },
];

export const REGRAS_USO_TEMPLATES: string[] = [
  "Template é manual: nada é enviado, agendado ou disparado pelo Desk.",
  "Não envie “contrato pronto”, “pagamento”, “boas-vindas”, acesso ao App Cliente ou mensagens de pesquisa enquanto os gates correspondentes não estiverem cumpridos.",
  "Registre a mensagem enviada como interação imutável — canal, responsável, data/hora, template usado e resultado — sem copiar documentos, tokens ou dados pessoais para o log.",
  "Personalize apenas campos seguros: nome, serviço, objetivo, etapa e próximo marco.",
  "Nunca inclua hipótese jurídica, promessa de resultado, dado sensível ou detalhe interno.",
  "Para a Ana, o agradecimento pelos dados informa apenas que a formalização está em preparação — sem confirmar contrato, valor ou cobrança antes da reconciliação interna.",
];

/** Termos proibidos em personalização (juízo de mérito, promessa, cobrança antecipada). */
const TERMOS_PROIBIDOS = [
  "chance",
  "garantid",
  "garantia de",
  "certeza de êxito",
  "hipótese forte",
  "vamos ganhar",
  "aprovação certa",
  "cpf",
  "senha",
  "token",
  "boleto",
  "pix ",
];

export type AvisoTemplate = { campo: string; mensagem: string };

/** Valida os valores digitados nos campos seguros. Não bloqueia envio — o Desk não envia. */
export function validarPersonalizacao(valores: Record<string, string>): AvisoTemplate[] {
  const avisos: AvisoTemplate[] = [];
  for (const [campo, valor] of Object.entries(valores)) {
    const v = (valor ?? "").toLowerCase();
    if (!v.trim()) continue;
    for (const termo of TERMOS_PROIBIDOS) {
      if (v.includes(termo)) {
        avisos.push({ campo, mensagem: `Contém termo não permitido em copy cliente-facing: “${termo.trim()}”.` });
        break;
      }
    }
  }
  return avisos;
}

/** Monta o texto final. Campos não preenchidos permanecem visíveis como marcador. */
export function preencherTemplate(template: TemplateWhatsapp, valores: Record<string, string>): string {
  return template.campos.reduce((texto, campo) => {
    const valor = (valores[campo] ?? "").trim();
    return texto.split(`{${campo}}`).join(valor || `[${ROTULO_CAMPO[campo]}]`);
  }, template.texto);
}

/** Campos ainda pendentes de preenchimento. */
export function camposPendentes(template: TemplateWhatsapp, valores: Record<string, string>): CampoSeguro[] {
  return template.campos.filter((c) => !(valores[c] ?? "").trim());
}

/**
 * Régua canônica observada no caso Ana e obrigatória para os demais:
 * proposta → aceite verbal → confirmação escrita → pedido de dados de formalização.
 */
export const REGUA_CANONICA = [
  "Proposta enviada",
  "Aceite verbal",
  "Confirmação formal recebida",
  "Pedido de dados para contrato",
];

/** Divergência de datas registrada no histórico da Ana — evidência preservada, correção é ato humano. */
export const INCONSISTENCIA_DATA_ANA = {
  titulo: "Divergência de data no histórico da Ana",
  descricao:
    "A confirmação formal aparece em 14/08 e o aceite verbal em 16/08 — ordem inversa à régua canônica. A evidência original deve ser preservada como está; a correção só pode ser feita no Desk se for comprovadamente erro de registro, com justificativa e autor.",
  acoes: [
    "Preservar o registro original (não editar nem apagar a interação existente).",
    "Conferir a evidência de origem (print/mensagem) antes de qualquer ajuste.",
    "Se for erro de registro, criar interação de correção referenciando a anterior, com data correta, motivo e autor.",
    "Não usar essas datas em auditoria ou métricas enquanto a ordem não for reconciliada.",
  ],
} as const;
