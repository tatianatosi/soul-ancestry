/**
 * P0.3 — Checklist interno de lançamento controlado.
 *
 * Síntese de evidência: NÃO é fonte de verdade, não altera status operacional,
 * não aciona contrato, assinatura, cobrança, mensagem, integração ou
 * publicação. Nada aqui conclui "pronto" sozinho: a liberação exige ação
 * explícita da proprietária, com data, responsável e motivo, registrada em
 * auditoria.
 */

export type EstadoItem = "APROVADO_COM_EVIDENCIA" | "PENDENTE" | "BLOQUEADO";

export const ROTULO_ESTADO: Record<EstadoItem, string> = {
  APROVADO_COM_EVIDENCIA: "Aprovado com evidência",
  PENDENTE: "Pendente",
  BLOQUEADO: "Bloqueado",
};

export type SecaoChecklist =
  | "acesso_sessao"
  | "isolamento_cliente"
  | "dados"
  | "estabilidade_tecnica"
  | "operacao_amanha"
  | "comercial_fora_de_escopo";

export const ROTULO_SECAO: Record<SecaoChecklist, string> = {
  acesso_sessao: "1. Acesso e sessão",
  isolamento_cliente: "2. Isolamento do cliente",
  dados: "3. Dados",
  estabilidade_tecnica: "4. Estabilidade técnica",
  operacao_amanha: "5. Operação de amanhã",
  comercial_fora_de_escopo: "6. Comercial — fora do escopo do lançamento controlado",
};

export const ORDEM_SECOES: readonly SecaoChecklist[] = [
  "acesso_sessao",
  "isolamento_cliente",
  "dados",
  "estabilidade_tecnica",
  "operacao_amanha",
  "comercial_fora_de_escopo",
];

export interface ItemChecklist {
  id: string;
  secao: SecaoChecklist;
  titulo: string;
  estado: EstadoItem;
  /** Evidência verificável (arquivo, teste, execução). Vazio ⇒ nunca aprovado. */
  evidencia: string;
  /** Link para o objeto canônico no próprio produto, quando existir. */
  link?: string;
}

/**
 * Estado calculado APENAS a partir das evidências produzidas em P0.1/P0.2.
 * Sem evidência verificável, o item permanece PENDENTE — nunca aprovado.
 */
export const ITENS_CHECKLIST: readonly ItemChecklist[] = [
  // 1. Acesso e sessão
  {
    id: "acesso.login_sessao_limpa",
    secao: "acesso_sessao",
    titulo: "Login da proprietária em sessão limpa",
    estado: "PENDENTE",
    evidencia: "Fluxo em /equipe/entrar coberto por teste; execução real por pessoa não comprovada.",
    link: "/equipe",
  },
  {
    id: "acesso.reload_renovacao",
    secao: "acesso_sessao",
    titulo: "Reload e renovação de sessão",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "src/lib/sessao-persistencia.test.ts — 7 testes passando.",
  },
  {
    id: "acesso.rotas_administrativas",
    secao: "acesso_sessao",
    titulo: "Acesso às rotas administrativas (/painel, /modo-proprietaria, /equipe)",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "src/routes/_authenticated/route.tsx + superficie-interna-regras.test.ts (papel interno).",
    link: "/painel",
  },
  {
    id: "acesso.verificacao_externa",
    secao: "acesso_sessao",
    titulo: "Verificação externa independente no domínio publicado",
    estado: "PENDENTE",
    evidencia: "NÃO COMPROVADO EXTERNAMENTE — depende de login manual da proprietária.",
  },

  // 2. Isolamento do cliente
  {
    id: "isolamento.rotulos_internos",
    secao: "isolamento_cliente",
    titulo: "Ausência de navegação e rótulos internos no App Cliente",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "src/lib/superficie-interna.tsx (papel em user_roles) + teste de varredura de rótulos.",
  },
  {
    id: "isolamento.url_direta",
    secao: "isolamento_cliente",
    titulo: "Proteção contra URL direta para o Desk",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "decidirAcessoDesk → 'portal' para sessão sem papel interno (teste 2).",
  },
  {
    id: "isolamento.projecao_sanitizada",
    secao: "isolamento_cliente",
    titulo: "Projeção sanitizada como única entrada do cliente",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "portal_projecoes + sanitizarRotuloCliente (classificacao-dados.test.ts, item 6).",
  },
  {
    id: "isolamento.teste_demo",
    secao: "isolamento_cliente",
    titulo: "Teste com dado demonstrativo (fixture DEMO, nunca dado real)",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "Varredura local do portal com fixture DEMO: 0 termos internos.",
  },

  // 3. Dados
  {
    id: "dados.fontes_classificadas",
    secao: "dados",
    titulo: "Fontes e fixtures classificadas",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "INVENTARIO_FONTES — 16 módulos classificados, 0 sem prova.",
  },
  {
    id: "dados.nao_classificados",
    secao: "dados",
    titulo: "Itens não classificados listados como bloqueio",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "normalizarClassificacao/classificarLinha ⇒ nao_classificado bloqueado para cliente.",
  },
  {
    id: "dados.sem_demo_para_cliente",
    secao: "dados",
    titulo: "Nenhum conteúdo demo/modelo projetado a cliente",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "filtrarParaCliente aplicado em meusCasos, meuCaso, minhasEntregas e minhasFaturas.",
  },
  {
    id: "dados.internos_permanecem_internos",
    secao: "dados",
    titulo: "Dados internos permanecem internos",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "rotuloClassificacaoInterno retorna null fora da superfície interna (teste 4).",
  },

  // 4. Estabilidade técnica
  {
    id: "tecnica.typecheck",
    secao: "estabilidade_tecnica",
    titulo: "Typecheck",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "tsgo --noEmit sem erros (23/08/2026).",
  },
  {
    id: "tecnica.testes",
    secao: "estabilidade_tecnica",
    titulo: "Testes de regressão relevantes",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "Suíte completa: 935 testes / 104 arquivos, todos passando.",
  },
  {
    id: "tecnica.build",
    secao: "estabilidade_tecnica",
    titulo: "Build",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "build OK no registro de build do ambiente.",
  },
  {
    id: "tecnica.rollback",
    secao: "estabilidade_tecnica",
    titulo: "Rota de rollback registrada",
    estado: "PENDENTE",
    evidencia: "Rollback = republicar a versão anterior; procedimento ainda não registrado por escrito.",
  },
  {
    id: "tecnica.erros_criticos",
    secao: "estabilidade_tecnica",
    titulo: "Erros críticos conhecidos",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "Nenhum erro crítico aberto no registro de build/testes.",
  },

  // 5. Operação de amanhã
  {
    id: "operacao.plantao",
    secao: "operacao_amanha",
    titulo: "Responsável de plantão definido",
    estado: "PENDENTE",
    evidencia: "Sem registro de plantão nomeado para a janela de amanhã.",
  },
  {
    id: "operacao.canal_suporte",
    secao: "operacao_amanha",
    titulo: "Canal interno de suporte definido",
    estado: "PENDENTE",
    evidencia: "Canal interno não registrado no produto.",
  },
  {
    id: "operacao.registro_incidente",
    secao: "operacao_amanha",
    titulo: "Fluxo de registro de incidente",
    estado: "APROVADO_COM_EVIDENCIA",
    evidencia: "Incidentes registrados como decisão auditada em owner_override_events.",
    link: "/modo-proprietaria",
  },
  {
    id: "operacao.decisao",
    secao: "operacao_amanha",
    titulo: "Decisão explícita: liberar acesso controlado ou manter bloqueado",
    estado: "PENDENTE",
    evidencia: "Aguarda ação explícita da proprietária (data, responsável e motivo).",
  },

  // 6. Comercial — fora do escopo
  {
    id: "comercial.sku_preco",
    secao: "comercial_fora_de_escopo",
    titulo: "SKU, preço e fonte comercial",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
  {
    id: "comercial.contrato",
    secao: "comercial_fora_de_escopo",
    titulo: "Contrato",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
  {
    id: "comercial.assinatura",
    secao: "comercial_fora_de_escopo",
    titulo: "Assinatura",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
  {
    id: "comercial.cobranca",
    secao: "comercial_fora_de_escopo",
    titulo: "Cobrança",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
  {
    id: "comercial.onboarding_real",
    secao: "comercial_fora_de_escopo",
    titulo: "Onboarding real de cliente",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
  {
    id: "comercial.acoes_externas",
    secao: "comercial_fora_de_escopo",
    titulo: "Ações externas e integrações",
    estado: "BLOQUEADO",
    evidencia: "Fora do escopo do lançamento controlado até decisão humana.",
  },
];

/** Itens que o checklist jamais pode acionar — a tela é somente leitura. */
export const ACOES_NAO_ACIONAVEIS = [
  "contrato",
  "cobranca",
  "assinatura",
  "mensagem",
  "integracao",
  "publicacao",
] as const;

export interface ResumoChecklist {
  total: number;
  aprovados: number;
  pendentes: number;
  bloqueados: number;
  /** Sempre false: nenhuma aprovação é automática. */
  aprovadoAutomaticamente: false;
  /** Só indica que não há bloqueio técnico; não libera nada por si. */
  semBloqueioTecnico: boolean;
  decisaoHumanaNecessaria: true;
}

function porEstado(itens: readonly ItemChecklist[], estado: EstadoItem) {
  return itens.filter((i) => i.estado === estado);
}

/** Item sem evidência textual nunca conta como aprovado. */
export function estadoEfetivo(item: ItemChecklist): EstadoItem {
  if (item.estado === "APROVADO_COM_EVIDENCIA" && !item.evidencia.trim()) return "PENDENTE";
  return item.estado;
}

export function calcularResumo(
  itens: readonly ItemChecklist[] = ITENS_CHECKLIST,
): ResumoChecklist {
  const efetivos = itens.map((i) => ({ ...i, estado: estadoEfetivo(i) }));
  const tecnicos = efetivos.filter((i) => i.secao !== "comercial_fora_de_escopo");
  return {
    total: efetivos.length,
    aprovados: porEstado(efetivos, "APROVADO_COM_EVIDENCIA").length,
    pendentes: porEstado(efetivos, "PENDENTE").length,
    bloqueados: porEstado(efetivos, "BLOQUEADO").length,
    aprovadoAutomaticamente: false,
    semBloqueioTecnico:
      porEstado(tecnicos, "BLOQUEADO").length === 0 && porEstado(tecnicos, "PENDENTE").length === 0,
    decisaoHumanaNecessaria: true,
  };
}

export function bloqueiosRemanescentes(
  itens: readonly ItemChecklist[] = ITENS_CHECKLIST,
): ItemChecklist[] {
  return itens.filter((i) => {
    const e = estadoEfetivo(i);
    return e !== "APROVADO_COM_EVIDENCIA" && i.secao !== "comercial_fora_de_escopo";
  });
}

export function itensPorSecao(
  secao: SecaoChecklist,
  itens: readonly ItemChecklist[] = ITENS_CHECKLIST,
): ItemChecklist[] {
  return itens.filter((i) => i.secao === secao);
}

/* ------------------------------------------------------------------ */
/* Decisão explícita da proprietária                                    */
/* ------------------------------------------------------------------ */

export type DecisaoLancamento = "liberar_acesso_controlado" | "manter_bloqueado";

export const ROTULO_DECISAO: Record<DecisaoLancamento, string> = {
  liberar_acesso_controlado: "Liberar apenas acesso controlado",
  manter_bloqueado: "Manter bloqueado",
};

export interface PedidoDecisaoLancamento {
  decisao: DecisaoLancamento | null;
  responsavel: string;
  motivo: string;
  /** Confirmação de que a proprietária leu os itens pendentes. */
  cienteDosPendentes: boolean;
}

export const MOTIVO_MINIMO_LANCAMENTO = 20;

/** Valida a decisão humana. Sem ação explícita e motivo, nada é registrado. */
export function validarDecisaoLancamento(
  pedido: PedidoDecisaoLancamento,
  itens: readonly ItemChecklist[] = ITENS_CHECKLIST,
): string[] {
  const erros: string[] = [];
  if (!pedido.decisao) erros.push("Escolha explicitamente entre liberar acesso controlado ou manter bloqueado.");
  if (!pedido.responsavel.trim()) erros.push("Informe o responsável pela decisão.");
  if (pedido.motivo.trim().length < MOTIVO_MINIMO_LANCAMENTO) {
    erros.push(`Descreva o motivo com pelo menos ${MOTIVO_MINIMO_LANCAMENTO} caracteres.`);
  }
  if (pedido.decisao === "liberar_acesso_controlado") {
    const pendentes = bloqueiosRemanescentes(itens);
    if (pendentes.length > 0 && !pedido.cienteDosPendentes) {
      erros.push(
        `Existem ${pendentes.length} itens sem evidência. Confirme que você assume essas pendências.`,
      );
    }
  }
  return erros;
}

/** Payload de auditoria. Nunca executa ação externa nem muda status operacional. */
export function montarRegistroDecisao(pedido: PedidoDecisaoLancamento, itens: readonly ItemChecklist[] = ITENS_CHECKLIST) {
  const resumo = calcularResumo(itens);
  return {
    acao: "decisao_lancamento_controlado",
    entidade: "checklist_lancamento_controlado",
    motivo: pedido.motivo.trim(),
    fonte: "Checklist interno de lançamento controlado (P0.3)",
    impacto: pedido.decisao ? ROTULO_DECISAO[pedido.decisao] : "",
    pendencias_assumidas: bloqueiosRemanescentes(itens).map((i) => i.id),
    valor_novo: {
      decisao: pedido.decisao,
      responsavel: pedido.responsavel.trim(),
      resumo,
    },
  };
}
