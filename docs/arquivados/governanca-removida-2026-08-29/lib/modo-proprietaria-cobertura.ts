/**
 * Cobertura obrigatória do Modo Proprietária Administradora.
 *
 * Declara, por módulo existente da organização, quais operações internas a
 * proprietária pode exercer por decisão humana auditada e quais atos continuam
 * exigindo confirmação final explícita. Nada aqui executa ação externa nem
 * infere dado: a camada apenas descreve e valida a permissão.
 */
import {
  ehProprietariaAdministradora,
  exigeConfirmacaoFinal,
  type AcaoExterna,
  type PapelInterno,
} from "@/lib/modo-proprietaria";

/** Regras que valem para toda área coberta pelo modo proprietária. */
export const REGRAS_GERAIS: string[] = [
  "Salvar rascunho em qualquer estado, mesmo incompleto.",
  "Reabrir ou derivar versão editável de registro congelado — o congelado nunca é sobrescrito.",
  "Assumir pendência com motivo obrigatório; a pendência continua visível.",
  "Override de gate interno com justificativa, fonte declarada, valor anterior, valor novo, autora, data e auditoria.",
  "Nenhum valor ausente é inferido pelo sistema.",
  "Toda edição grava na entidade canônica, nunca somente na interface.",
  "RLS entre organizações preservada; nenhum papel além da proprietária recebe estes poderes.",
];

export const MODULOS_COBERTOS = [
  "planejador",
  "proposta_escopo",
  "comercial_catalogo",
  "formalizacao",
  "pessoas_composicao",
  "caso_dossie",
  "pesquisa_operacao",
  "financeiro",
  "app_cliente",
  "painel_hoje",
] as const;

export type ModuloCoberto = (typeof MODULOS_COBERTOS)[number];

export type OperacaoModulo = {
  id: string;
  rotulo: string;
  /** Entidade canônica onde a alteração é gravada (nunca só na tela). */
  entidade: string;
};

export type Modulo = {
  id: ModuloCoberto;
  rotulo: string;
  rota: string;
  /** Operações internas liberadas à proprietária, sempre com auditoria. */
  operacoes: OperacaoModulo[];
  /** Atos que continuam exigindo a janela final de confirmação. */
  acoesExternas: AcaoExterna[];
  /** Regras preservadas mesmo no modo proprietária. */
  regras: string[];
};

export const COBERTURA_MODULOS: Modulo[] = [
  {
    id: "planejador",
    rotulo: "Planejador",
    rota: "/casos",
    operacoes: [
      { id: "criar_plano", rotulo: "Criar plano", entidade: "case_plans" },
      { id: "editar_plano", rotulo: "Editar e salvar plano", entidade: "case_plans" },
      { id: "versionar_plano", rotulo: "Versionar plano", entidade: "case_plans" },
      { id: "arquivar_plano", rotulo: "Arquivar plano", entidade: "case_plans" },
      { id: "aprovar_plano", rotulo: "Aprovar plano", entidade: "case_plans" },
      {
        id: "corrigir_rota_pais_trilha",
        rotulo: "Corrigir rota, país, trilha, fase e composição",
        entidade: "citizenship_tracks",
      },
      {
        id: "corrigir_etapas_entregas",
        rotulo: "Corrigir objetivo, etapas, entregas e microentregas",
        entidade: "ops_microentregas",
      },
      {
        id: "corrigir_perguntas_dependencias",
        rotulo: "Corrigir perguntas, dependências, documentos e marcos",
        entidade: "case_checklist_items",
      },
      {
        id: "definir_responsavel_prazo_proxima_acao",
        rotulo: "Definir responsável, prazo e próxima ação",
        entidade: "tarefas",
      },
      {
        id: "decidir_elegibilidade_aplicabilidade_prioridade",
        rotulo: "Decidir elegibilidade, aplicabilidade e prioridade",
        entidade: "case_plans",
      },
      {
        id: "vincular_plano",
        rotulo: "Vincular plano a lead, proposta, caso, SKU e pessoas",
        entidade: "case_plans",
      },
      {
        id: "avancar_plano_incompleto",
        rotulo: "Salvar e avançar plano incompleto assumindo pendências",
        entidade: "case_plans",
      },
    ],
    acoesExternas: [],
    regras: [
      "Plano incompleto pode ser salvo e avançado: as pendências continuam visíveis e assumidas.",
      "Nenhuma elegibilidade, aplicabilidade ou prioridade é inferida — só decisão humana justificada.",
    ],
  },
  {
    id: "proposta_escopo",
    rotulo: "Proposta e escopo",
    rota: "/propostas",
    operacoes: [
      { id: "criar_proposta", rotulo: "Criar proposta", entidade: "proposals" },
      { id: "editar_proposta", rotulo: "Editar e salvar proposta", entidade: "proposals" },
      { id: "derivar_proposta", rotulo: "Derivar nova versão da proposta", entidade: "proposals" },
      { id: "substituir_proposta", rotulo: "Substituir proposta vigente", entidade: "proposals" },
      { id: "reabrir_proposta", rotulo: "Reabrir proposta", entidade: "proposals" },
      { id: "aprovar_proposta", rotulo: "Aprovar proposta", entidade: "proposals" },
      {
        id: "editar_servicos_escopo",
        rotulo: "Editar serviços incluídos/excluídos e escopo",
        entidade: "contract_scope_items",
      },
      {
        id: "editar_pessoas_entregas_dependencias",
        rotulo: "Editar pessoas, entregas, dependências e responsabilidades",
        entidade: "case_members",
      },
      {
        id: "editar_preco_condicao_parcelas",
        rotulo: "Editar preço, condição, parcelas e vencimentos",
        entidade: "commercial_conditions",
      },
      { id: "editar_despesas", rotulo: "Editar despesas estimadas", entidade: "expense_estimates" },
      { id: "editar_anexos_proposta", rotulo: "Editar anexos da proposta", entidade: "contract_annexes" },
      {
        id: "revisar_paginas_canva",
        rotulo: "Importar e revisar páginas da proposta Canva (sem URL externa)",
        entidade: "proposal_canva_pages",
      },
      {
        id: "registrar_nao_localizado_conflito",
        rotulo: "Registrar 'não localizado na proposta', conflito ou dado a confirmar",
        entidade: "proposal_canva_pages",
      },
      {
        id: "avancar_proposta_com_pendencia",
        rotulo: "Avançar proposta com pendências assumidas",
        entidade: "proposals",
      },
    ],
    acoesExternas: [],
    regras: [
      "Toda alteração mantém versão e fonte registradas.",
      "Pendência assumida permanece visível na proposta e no Painel Hoje.",
    ],
  },
  {
    id: "comercial_catalogo",
    rotulo: "Comercial e catálogo",
    rota: "/catalogo",
    operacoes: [
      { id: "editar_sku", rotulo: "Consultar e editar SKU/produto existente", entidade: "product_catalog" },
      {
        id: "corrigir_preco_vigencia",
        rotulo: "Corrigir preço, vigência, condição, escopo e entregáveis",
        entidade: "product_catalog",
      },
      {
        id: "corrigir_aplicabilidade_status",
        rotulo: "Corrigir inclusões, exclusões, aplicabilidade, responsável e status",
        entidade: "product_catalog",
      },
      {
        id: "homologar_sku",
        rotulo: "Homologar, pausar, substituir ou desbloquear SKU por decisão auditada",
        entidade: "product_catalog",
      },
      {
        id: "resolver_divergencia_catalogo",
        rotulo: "Resolver divergência de preço, link, escopo ou versão",
        entidade: "catalog_source_divergences",
      },
      {
        id: "selecionar_sku_em_revisao",
        rotulo: "Selecionar SKU em revisão na proposta com override registrado",
        entidade: "proposals",
      },
      {
        id: "criar_condicao_previsao",
        rotulo: "Criar e editar condição comercial e previsão interna",
        entidade: "commercial_conditions",
      },
    ],
    acoesExternas: ["criar_ou_alterar_link_asaas", "emitir_cobranca"],
    regras: [
      "Link Asaas, cobrança e pagamento nunca são executados a partir do catálogo — exigem confirmação final.",
      "Homologação e desbloqueio de SKU exigem motivo, fonte e valores anterior e novo.",
    ],
  },
  {
    id: "formalizacao",
    rotulo: "Formalização",
    rota: "/contratos",
    operacoes: [
      {
        id: "editar_perfil_institucional",
        rotulo: "Editar perfil institucional permitido",
        entidade: "institutional_profiles",
      },
      {
        id: "editar_parametros_partes",
        rotulo: "Preencher parâmetros, fontes, partes, signatários, preço e vencimentos",
        entidade: "contract_parameter_values",
      },
      {
        id: "derivar_versao_congelada",
        rotulo: "Derivar versão editável de registro congelado",
        entidade: "contract_versions",
      },
      {
        id: "editar_condicao_comercial",
        rotulo: "Criar, editar e aprovar condição comercial",
        entidade: "commercial_conditions",
      },
      { id: "editar_ordem_servico", rotulo: "Criar, editar e aprovar Ordem de Serviço", entidade: "service_orders" },
      { id: "editar_itens_escopo", rotulo: "Editar itens de escopo", entidade: "contract_scope_items" },
      { id: "editar_anexos_i_v", rotulo: "Criar e editar Anexos I–V e ANX internos", entidade: "contract_annexes" },
      { id: "editar_previa", rotulo: "Criar e corrigir prévia contratual", entidade: "contract_parameter_previews" },
      { id: "congelar_previa", rotulo: "Congelar prévia por decisão auditada", entidade: "contract_versions" },
      { id: "avancar_revisao", rotulo: "Avançar revisão humana", entidade: "contract_review_events" },
      {
        id: "override_sku_em_revisao",
        rotulo: "Usar SKU em revisão, escopo ou condição pendente com override",
        entidade: "product_catalog",
      },
    ],
    acoesExternas: ["enviar_contrato", "solicitar_assinatura"],
    regras: [
      "SKU em revisão, proposta incompleta, escopo ou condição pendente não bloqueiam a proprietária: geram override com motivo.",
      "Envio de contrato e assinatura continuam exigindo confirmação final explícita.",
    ],
  },
  {
    id: "pessoas_composicao",
    rotulo: "Pessoas e composição",
    rota: "/casos",
    operacoes: [
      { id: "editar_pessoas", rotulo: "Criar, editar e corrigir pessoas", entidade: "contacts" },
      { id: "editar_nucleo", rotulo: "Editar núcleo familiar", entidade: "nucleos_familiares" },
      { id: "editar_dependentes", rotulo: "Editar dependentes", entidade: "case_dependents" },
      {
        id: "editar_papeis",
        rotulo: "Editar papéis, requerentes, signatários e responsáveis",
        entidade: "case_members",
      },
      { id: "editar_representacao", rotulo: "Editar representação legal", entidade: "contract_parties" },
      { id: "editar_acesso_app", rotulo: "Editar acesso ao App Cliente", entidade: "client_portal_access" },
      {
        id: "decidir_participacao_contratual",
        rotulo: "Decidir participação contratual e representação",
        entidade: "contract_parties",
      },
    ],
    acoesExternas: ["agir_em_nome_do_cliente", "criar_procuracao"],
    regras: [
      "Histórico nunca é apagado: correções geram nova versão com autora e motivo.",
      "Dependente jamais vira parte contratual automaticamente — só por decisão manual registrada.",
    ],
  },
  {
    id: "caso_dossie",
    rotulo: "Caso, dossiê e operação",
    rota: "/casos",
    operacoes: [
      { id: "editar_caso", rotulo: "Criar e editar caso, fase e estado interno", entidade: "crm_casos" },
      { id: "editar_dossie", rotulo: "Editar dossiê-mãe, ambiente e referência", entidade: "nucleos_familiares" },
      { id: "editar_nivel_acesso", rotulo: "Definir nível de acesso do caso", entidade: "crm_casos" },
      { id: "editar_tarefas_caso", rotulo: "Editar tarefas, responsável, prazo e próxima ação", entidade: "tarefas" },
      { id: "editar_checklist_caso", rotulo: "Editar checklist, pendências e documentos", entidade: "case_checklist_items" },
      { id: "editar_alertas_caso", rotulo: "Editar alertas e cadência", entidade: "case_alerts" },
      { id: "encerrar_caso", rotulo: "Encerrar caso por decisão auditada", entidade: "crm_casos" },
    ],
    acoesExternas: [],
    regras: [
      "Avanço de estado interno exige motivo registrado; nada é inferido do último editor.",
      "Documento, entrega e cadência continuam com histórico e versão preservados.",
    ],
  },
  {
    id: "pesquisa_operacao",
    rotulo: "Pesquisa e operação",
    rota: "/pesquisa",
    operacoes: [
      { id: "editar_plano_pesquisa", rotulo: "Criar, editar e avançar plano de pesquisa", entidade: "research_cases" },
      { id: "editar_instituicoes", rotulo: "Editar instituições e fontes", entidade: "institutions" },
      { id: "editar_acoes", rotulo: "Editar ações e rechecagens", entidade: "research_action_plan_items" },
      { id: "editar_estimativas", rotulo: "Editar estimativas de terceiros", entidade: "third_party_expenses" },
      { id: "editar_evidencias", rotulo: "Editar evidências e achados", entidade: "research_evidence_items" },
      { id: "editar_validacoes", rotulo: "Registrar validações", entidade: "evidence_validations" },
      { id: "editar_tarefas", rotulo: "Editar tarefas, entregas e microentregas", entidade: "ops_microentregas" },
      {
        id: "aprovar_evidencia_interna",
        rotulo: "Aprovar evidência ou achado interno por decisão auditada",
        entidade: "genealogical_findings",
      },
      {
        id: "ajustar_hipotese_trilha",
        rotulo: "Ajustar hipótese, trilha e dependência",
        entidade: "research_case_hypotheses",
      },
      {
        id: "decidir_prioridade_prazo_responsavel",
        rotulo: "Decidir prioridade, prazo e responsável",
        entidade: "tarefas",
      },
    ],
    acoesExternas: ["pesquisar_externamente", "enviar_pedido_instituicao", "agir_em_nome_do_cliente"],
    regras: [
      "Achado continua sendo hipótese com estado de validação — nunca confirmação automática.",
      "Pesquisa externa, pedido institucional e ato em nome do cliente exigem confirmação final antes de executar.",
    ],
  },
  {
    id: "financeiro",
    rotulo: "Financeiro",
    rota: "/financeiro",
    operacoes: [
      {
        id: "editar_condicao_previsao",
        rotulo: "Criar, editar e aprovar condição comercial e previsão",
        entidade: "commercial_conditions",
      },
      { id: "editar_fatura", rotulo: "Criar e editar fatura interna", entidade: "invoices" },
      { id: "conciliar_interno", rotulo: "Conciliar lançamento interno", entidade: "eventos_financeiros" },
      { id: "editar_despesa_reembolso", rotulo: "Editar despesa e reembolso", entidade: "third_party_expenses" },
      { id: "registrar_pagamento_interno", rotulo: "Registrar pagamento interno (sem envio)", entidade: "payments" },
      {
        id: "corrigir_vinculo_financeiro",
        rotulo: "Corrigir vínculo caso/proposta/contrato/SKU",
        entidade: "invoices",
      },
      { id: "assumir_divergencia_financeira", rotulo: "Assumir divergência por decisão auditada", entidade: "eventos_financeiros" },
    ],
    acoesExternas: [
      "emitir_cobranca",
      "enviar_cobranca",
      "criar_ou_alterar_link_asaas",
      "registrar_pagamento",
    ],
    regras: [
      "Cobrança externa, link Asaas e pagamento externo exigem confirmação final explícita.",
      "Dado DEMO só aparece com filtro explícito e selo, e nunca entra em métrica real.",
    ],
  },
  {
    id: "app_cliente",
    rotulo: "App Cliente",
    rota: "/acessos-portal",
    operacoes: [
      { id: "editar_projecao_app", rotulo: "Criar, editar e versionar projeção", entidade: "app_projections" },
      { id: "aprovar_projecao_app", rotulo: "Aprovar projeção", entidade: "app_projections" },
      { id: "retirar_projecao_app", rotulo: "Retirar ou arquivar projeção", entidade: "app_projections" },
      {
        id: "definir_destinatario_visibilidade",
        rotulo: "Escolher destinatário/caso, visibilidade, conteúdo e data",
        entidade: "app_projections",
      },
      { id: "revisar_sanitizacao_acesso", rotulo: "Revisar sanitização e acesso", entidade: "client_portal_access" },
    ],
    acoesExternas: ["publicar_no_app_cliente"],
    regras: [
      "Publicação só ocorre por confirmação final explícita — nunca automática.",
      "Dado TESTE, DEMO, fixture ou conteúdo interno nunca pode ser publicado nem entrar em KPI real.",
    ],
  },
  {
    id: "painel_hoje",
    rotulo: "Painel Hoje",
    rota: "/painel",
    operacoes: [
      { id: "corrigir_responsavel", rotulo: "Corrigir responsável", entidade: "tarefas" },
      { id: "corrigir_prazo", rotulo: "Corrigir prazo", entidade: "tarefas" },
      { id: "corrigir_prioridade_fila", rotulo: "Corrigir prioridade e fila", entidade: "tarefas" },
      { id: "corrigir_etapa_status", rotulo: "Corrigir etapa, status e próxima ação", entidade: "crm_casos" },
      { id: "assumir_pendencia", rotulo: "Assumir pendência e avançar item", entidade: "case_alerts" },
      { id: "reclassificar_item", rotulo: "Reclassificar item da fila", entidade: "case_alerts" },
    ],
    acoesExternas: [],
    regras: [
      "O painel é visão derivada: toda correção grava na entidade canônica, nunca só na tela.",
      "Item corrigido guarda motivo, autora e valores anterior e novo.",
    ],
  },
];

export const MODULO_POR_ID: Record<ModuloCoberto, Modulo> = Object.fromEntries(
  COBERTURA_MODULOS.map((m) => [m.id, m]),
) as Record<ModuloCoberto, Modulo>;

export function ehModuloCoberto(id: string): id is ModuloCoberto {
  return (MODULOS_COBERTOS as readonly string[]).includes(id);
}

export function operacaoDoModulo(modulo: string, operacao: string): OperacaoModulo | null {
  if (!ehModuloCoberto(modulo)) return null;
  return MODULO_POR_ID[modulo].operacoes.find((o) => o.id === operacao) ?? null;
}

/** A proprietária opera qualquer módulo; os demais papéis não têm override. */
export function podeOperarModulo(
  papel: PapelInterno | null | undefined,
  modulo: string,
  operacao: string,
): boolean {
  if (!ehProprietariaAdministradora(papel)) return false;
  return operacaoDoModulo(modulo, operacao) !== null;
}

export type ValidacaoOperacao = { valida: boolean; erros: string[]; entidade: string | null };

/**
 * Valida a operação interna pedida pela proprietária. Recusa ação externa
 * (que exige janela final) e recusa publicação de dado TESTE/DEMO/fixture.
 */
export function validarOperacaoModulo(
  papel: PapelInterno | null | undefined,
  entrada: { modulo: string; operacao: string; dados_teste?: boolean },
): ValidacaoOperacao {
  const erros: string[] = [];
  if (!ehProprietariaAdministradora(papel)) {
    erros.push("Somente a proprietária administradora pode assumir esta decisão.");
  }
  if (!ehModuloCoberto(entrada.modulo)) {
    erros.push(`Módulo desconhecido: ${entrada.modulo}.`);
  }
  const op = operacaoDoModulo(entrada.modulo, entrada.operacao);
  if (ehModuloCoberto(entrada.modulo) && !op) {
    erros.push(`Operação ${entrada.operacao} não pertence ao módulo ${entrada.modulo}.`);
  }
  if (exigeConfirmacaoFinal(entrada.operacao)) {
    erros.push("Ação externa ou irreversível exige a janela final de confirmação explícita.");
  }
  if (entrada.dados_teste === true && entrada.modulo === "app_cliente") {
    erros.push(
      "Dado TESTE, DEMO ou fixture não pode ser aprovado, projetado nem publicado no App Cliente.",
    );
  }
  return { valida: erros.length === 0, erros, entidade: op?.entidade ?? null };
}

/** Cobertura declarada: usada na UI e nos testes de completude. */
export function resumoCobertura() {
  return COBERTURA_MODULOS.map((m) => ({
    modulo: m.id,
    rotulo: m.rotulo,
    rota: m.rota,
    operacoes: m.operacoes.length,
    acoesExternas: m.acoesExternas.length,
  }));
}
