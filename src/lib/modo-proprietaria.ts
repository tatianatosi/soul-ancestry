/**
 * Modo Proprietária Administradora — regras puras.
 *
 * Libera operação interna total (editar, versionar, homologar, aprovar,
 * avançar) para o papel `admin` da própria organização, sempre com decisão
 * humana auditada. Nada aqui executa ação externa: ações irreversíveis ou
 * externas só produzem um pedido de confirmação final explícita.
 */

export type PapelInterno = string;

/** Capacidades liberadas exclusivamente à proprietária administradora. */
export const CAPACIDADES_PROPRIETARIA = [
  "editar_rascunho",
  "criar_versao_derivada",
  "corrigir_proposta_escopo_preco",
  "corrigir_condicao_comercial",
  "corrigir_pessoas_dependentes_representacao",
  "corrigir_os_anexos_previa",
  "homologar_sku",
  "homologar_condicao_comercial",
  "resolver_divergencia",
  "aprovar_proposta_os_anexo_previa",
  "avancar_caso_planejador_tarefa",
  "avancar_pesquisa_evidencia_microentrega",
  "aprovar_projecao_app_cliente",
  "editar_fila_responsavel_prazo",
  "ver_todos_estados_da_organizacao",
  "consultar_arquivados",
] as const;

export type Capacidade = (typeof CAPACIDADES_PROPRIETARIA)[number];

export const ROTULO_CAPACIDADE: Record<Capacidade, string> = {
  editar_rascunho: "Editar e salvar qualquer rascunho",
  criar_versao_derivada: "Criar versões derivadas",
  corrigir_proposta_escopo_preco: "Corrigir proposta, escopo, preço e SKU",
  corrigir_condicao_comercial: "Corrigir condição comercial, parcelas e vencimentos",
  corrigir_pessoas_dependentes_representacao:
    "Corrigir pessoas, dependentes, representação e responsabilidades",
  corrigir_os_anexos_previa: "Criar e corrigir OS, Anexos e prévia contratual",
  homologar_sku: "Homologar SKU por decisão humana auditada",
  homologar_condicao_comercial: "Homologar condição comercial por decisão humana auditada",
  resolver_divergencia: "Resolver divergências por decisão humana auditada",
  aprovar_proposta_os_anexo_previa: "Aprovar proposta, OS, Anexo I e prévia",
  avancar_caso_planejador_tarefa: "Avançar casos, planejador e tarefas",
  avancar_pesquisa_evidencia_microentrega: "Avançar pesquisa, evidências e microentregas",
  aprovar_projecao_app_cliente: "Aprovar projeções no App Cliente",
  editar_fila_responsavel_prazo: "Editar fila, responsáveis, prazos e próximos passos",
  ver_todos_estados_da_organizacao: "Visualizar todos os estados e pendências da organização",
  consultar_arquivados: "Consultar itens arquivados e históricos",
};

/** Papéis equivalentes ao da Proprietária Administradora (A01, 04/11/2026). */
export const PAPEIS_PROPRIETARIA = ["admin", "proprietaria_administradora"] as const;

/** Somente o papel admin (ou seu sinônimo canônico) da própria organização opera no modo proprietária. */
export function ehProprietariaAdministradora(papel: PapelInterno | null | undefined): boolean {
  return typeof papel === "string" && (PAPEIS_PROPRIETARIA as readonly string[]).includes(papel);
}

export function capacidadesDe(papel: PapelInterno | null | undefined): Capacidade[] {
  return ehProprietariaAdministradora(papel) ? [...CAPACIDADES_PROPRIETARIA] : [];
}

export function podeAssumirDecisao(papel: PapelInterno | null | undefined, capacidade: Capacidade) {
  return capacidadesDe(papel).includes(capacidade);
}

/** Ações externas ou irreversíveis: nunca bloqueadas, sempre confirmadas à mão. */
export const ACOES_EXTERNAS = [
  "enviar_contrato",
  "solicitar_assinatura",
  "emitir_cobranca",
  "enviar_cobranca",
  "criar_ou_alterar_link_asaas",
  "registrar_pagamento",
  "enviar_email",
  "enviar_whatsapp",
  "enviar_mensagem",
  "pesquisar_externamente",
  "enviar_pedido_instituicao",
  "agir_em_nome_do_cliente",
  "criar_procuracao",
  "publicar_no_app_cliente",
  "excluir_registro_ou_versao",
  "aplicar_migration_producao",
  "restaurar_backup",
  "confirmar_acao_externa_pacote",
] as const;

export type AcaoExterna = (typeof ACOES_EXTERNAS)[number];

export const ROTULO_ACAO_EXTERNA: Record<AcaoExterna, string> = {
  enviar_contrato: "Enviar contrato",
  solicitar_assinatura: "Solicitar assinatura",
  emitir_cobranca: "Emitir cobrança",
  enviar_cobranca: "Enviar cobrança",
  criar_ou_alterar_link_asaas: "Criar ou alterar link Asaas",
  registrar_pagamento: "Registrar pagamento",
  enviar_email: "Enviar e-mail",
  enviar_whatsapp: "Enviar WhatsApp",
  enviar_mensagem: "Enviar mensagem",
  pesquisar_externamente: "Pesquisar externamente",
  enviar_pedido_instituicao: "Enviar pedido a instituição",
  agir_em_nome_do_cliente: "Agir em nome do cliente",
  criar_procuracao: "Criar procuração",
  publicar_no_app_cliente: "Publicar conteúdo no App Cliente",
  excluir_registro_ou_versao: "Excluir registro ou versão",
  aplicar_migration_producao: "Aplicar migration em produção",
  restaurar_backup: "Restaurar backup sobrescrevendo dados",
  confirmar_acao_externa_pacote: "Confirmar aprovação externa do pacote de governança",
};


export function exigeConfirmacaoFinal(acao: string): acao is AcaoExterna {
  return (ACOES_EXTERNAS as readonly string[]).includes(acao);
}

/** Campos obrigatórios da janela final de confirmação. */
export const CAMPOS_CONFIRMACAO = [
  "acao",
  "organizacao",
  "caso",
  "destinatario",
  "conteudo",
  "valor",
  "anexos",
  "dados_enviados",
  "impacto",
  "aviso_irreversibilidade",
  "motivo_confirmacao",
  "confirmacao_manual",
] as const;

export type CampoConfirmacao = (typeof CAMPOS_CONFIRMACAO)[number];

export type PedidoConfirmacao = {
  acao: string;
  organizacao?: string | null;
  destinatario?: string | null;
  conteudo?: string | null;
  valor?: number | string | null;
  moeda?: string | null;
  caso?: string | null;
  anexos?: string[] | null;
  impacto?: string | null;
  dados_enviados?: Record<string, unknown> | null;
  irreversivel?: boolean;
  motivo?: string | null;
  confirmacao_manual?: boolean;
};

export type Confirmacao = {
  acao: string;
  rotulo: string;
  campos: { campo: CampoConfirmacao; rotulo: string; valor: string }[];
  faltantes: CampoConfirmacao[];
  pronta: boolean;
  aviso: string;
};

const ROTULO_CAMPO: Record<CampoConfirmacao, string> = {
  acao: "Ação",
  organizacao: "Organização",
  caso: "Caso",
  destinatario: "Destinatário",
  conteudo: "Conteúdo ou documento",
  valor: "Valor e moeda",
  anexos: "Anexos",
  dados_enviados: "Dados que serão enviados",
  impacto: "Impacto",
  aviso_irreversibilidade: "Aviso de irreversibilidade",
  motivo_confirmacao: "Motivo da confirmação",
  confirmacao_manual: "Confirmação manual",
};

export const AVISO_IRREVERSIVEL =
  "Esta ação é externa e irreversível. Nada é disparado automaticamente: só ocorre após a confirmação manual da proprietária.";

/** Ações externas sem valor financeiro: o campo é textual, nunca inferido. */
const SEM_VALOR_FINANCEIRO = "Sem valor financeiro";

/** Monta a janela final de confirmação, listando exatamente o que será feito. */
export function montarConfirmacao(pedido: PedidoConfirmacao): Confirmacao {
  const anexos = pedido.anexos ?? [];
  const moeda = (pedido.moeda ?? "BRL").trim() || "BRL";
  const bruto: Record<CampoConfirmacao, string> = {
    acao: exigeConfirmacaoFinal(pedido.acao) ? ROTULO_ACAO_EXTERNA[pedido.acao] : pedido.acao,
    organizacao: (pedido.organizacao ?? "").trim(),
    caso: (pedido.caso ?? "").trim(),
    destinatario: (pedido.destinatario ?? "").trim(),
    conteudo: (pedido.conteudo ?? "").trim(),
    valor:
      pedido.valor === null || pedido.valor === undefined || pedido.valor === ""
        ? SEM_VALOR_FINANCEIRO
        : typeof pedido.valor === "number"
          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(pedido.valor)
          : `${String(pedido.valor)} ${moeda}`,
    anexos: anexos.length ? anexos.join(", ") : "Sem anexos",
    dados_enviados: pedido.dados_enviados ? JSON.stringify(pedido.dados_enviados) : "",
    impacto: (pedido.impacto ?? "").trim(),
    aviso_irreversibilidade: AVISO_IRREVERSIVEL,
    motivo_confirmacao:
      (pedido.motivo ?? "").trim().length >= MOTIVO_MINIMO ? (pedido.motivo ?? "").trim() : "",
    confirmacao_manual: pedido.confirmacao_manual === true ? "Confirmada manualmente" : "",
  };

  const faltantes = CAMPOS_CONFIRMACAO.filter((c) => bruto[c].trim() === "");

  return {
    acao: pedido.acao,
    rotulo: bruto.acao,
    campos: CAMPOS_CONFIRMACAO.map((campo) => ({
      campo,
      rotulo: ROTULO_CAMPO[campo],
      valor: bruto[campo] || "Não informado",
    })),
    faltantes,
    pronta: faltantes.length === 0,
    aviso: AVISO_IRREVERSIVEL,
  };
}


/**
 * Motivo continua obrigatório onde a confirmação existe — mas sem contagem
 * arbitrária de caracteres.
 *
 * 06/09/2026: era 10. `hotfix_autonomia_operacional_proprietaria.md` proíbe,
 * com estas palavras, "mínimo arbitrário de caracteres em motivo,
 * justificativa, comentário, observação ou nota", e os dois prompts de
 * remoção de barreiras listam "justificativa obrigatória" entre o que trava a
 * operação. Na prática a dona precisava redigir uma frase de 10+ caracteres
 * para confirmar a própria decisão; agora "ok" basta e o registro continua
 * existindo. Quem é obrigado a justificar de verdade — exceção comercial de
 * preço (`MOTIVO_MINIMO_EXCECAO_COMERCIAL`) e override de gate comercial
 * (`MOTIVO_MINIMO_OVERRIDE`) — tem constante própria e não foi afrouxado:
 * ali o motivo é peça de defesa financeira, não cerimônia de interface.
 */
export const MOTIVO_MINIMO = 1;

export type DecisaoProprietaria = {
  acao: string;
  entidade: string;
  entidade_id?: string | null;
  campo?: string | null;
  valor_anterior?: unknown;
  valor_novo?: unknown;
  motivo: string;
  fonte?: string | null;
  impacto?: string | null;
  pendencias_assumidas?: string[];
};

/**
 * Nenhum dado é inferido: cada decisão precisa de autoria, ação e entidade.
 * Motivo deixou de ser pré-requisito de salvar (26/08/2026) — segue gravado
 * na auditoria, com um valor padrão quando fica em branco.
 */
export function validarDecisao(
  papel: PapelInterno | null | undefined,
  d: DecisaoProprietaria,
): string[] {
  const erros: string[] = [];
  if (!ehProprietariaAdministradora(papel)) {
    erros.push("Somente a proprietária administradora pode assumir esta decisão.");
  }
  if (!d.acao?.trim()) erros.push("Ação obrigatória.");
  if (!d.entidade?.trim()) erros.push("Entidade afetada obrigatória.");
  if (d.campo && d.valor_anterior === undefined) {
    erros.push("Valor anterior obrigatório quando um campo é corrigido.");
  }
  if (d.campo && d.valor_novo === undefined) {
    erros.push("Valor novo obrigatório quando um campo é corrigido.");
  }
  return erros;
}

/**
 * Pendência assumida continua visível: nunca é removida, apenas marcada como
 * assumida por decisão humana, com autora, motivo e data.
 */
export type Pendencia = { chave: string; rotulo: string; bloqueante?: boolean };
export type PendenciaAssumida = Pendencia & {
  assumida: true;
  assumida_por: string;
  assumida_em: string;
  motivo: string;
};

export function assumirPendencia(
  pendencia: Pendencia,
  decisao: { autora: string; em: string; motivo: string },
): PendenciaAssumida {
  return {
    ...pendencia,
    assumida: true,
    assumida_por: decisao.autora,
    assumida_em: decisao.em,
    motivo: decisao.motivo,
  };
}

/**
 * No modo proprietária a pendência não impede a decisão administrativa, mas
 * permanece na lista. Para os demais papéis, o bloqueio segue valendo.
 */
export function bloqueiaAvanco(papel: PapelInterno | null | undefined, pendencias: Pendencia[]) {
  const bloqueantes = pendencias.filter((p) => p.bloqueante !== false);
  if (ehProprietariaAdministradora(papel)) {
    return { bloqueia: false, pendencias: bloqueantes, exigeDecisaoAuditada: bloqueantes.length > 0 };
  }
  return { bloqueia: bloqueantes.length > 0, pendencias: bloqueantes, exigeDecisaoAuditada: false };
}
