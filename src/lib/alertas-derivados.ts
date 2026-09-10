/**
 * P1.1 — Alertas como VISÃO DERIVADA.
 *
 * Regras vinculantes:
 *  - Alerta nunca é fonte de verdade: é sempre calculado a partir de entidades
 *    canônicas (caso, tarefa, micro-entrega, documento, gate, classificação).
 *  - A aba Alertas não cria nem edita prazo, tarefa, status, caso, checklist,
 *    proposta, contrato, cobrança, evidência ou pesquisa. A ação de um alerta
 *    apenas ABRE o registro canônico; a resolução ocorre lá.
 *  - Resolvida a pendência canônica, o alerta some (recalculado por regra).
 *  - D10/D14 são a MESMA regra de cadência: colapsam em um único sinal.
 *  - Nenhum alerta é visível ao App Cliente.
 */

export type CriticidadeAlerta = "atencao" | "alta" | "critica";

/** Motivos permitidos (lista fechada da regra A). */
export type MotivoAlerta =
  | "prazo_vencido"
  | "sla_violado"
  | "pendencia_bloqueia_estado"
  | "decisao_humana_pendente"
  | "sem_responsavel"
  | "divergencia_entre_fontes"
  | "risco_exposicao_interna"
  | "classificacao_origem_inconsistente";

export const MOTIVOS_ALERTA: MotivoAlerta[] = [
  "prazo_vencido",
  "sla_violado",
  "pendencia_bloqueia_estado",
  "decisao_humana_pendente",
  "sem_responsavel",
  "divergencia_entre_fontes",
  "risco_exposicao_interna",
  "classificacao_origem_inconsistente",
];

export const ROTULO_MOTIVO: Record<MotivoAlerta, string> = {
  prazo_vencido: "Prazo vencido ou em janela crítica",
  sla_violado: "SLA violado",
  pendencia_bloqueia_estado: "Pendência que bloqueia avanço",
  decisao_humana_pendente: "Decisão humana pendente",
  sem_responsavel: "Item sem responsável",
  divergencia_entre_fontes: "Divergência entre fontes canônicas",
  risco_exposicao_interna: "Risco de exposição de dado interno",
  classificacao_origem_inconsistente: "Classificação de origem inconsistente",
};

/** Entidade canônica de origem — o alerta só existe enquanto ela existir. */
export type OrigemCanonica = {
  entidade:
    | "crm_casos"
    | "tarefas"
    | "ops_microentregas"
    | "document_requests"
    | "case_activation_checks"
    | "communication_queue"
    | "sku_catalog"
    | "app_projections";
  id: string;
  /** Rota interna que abre o registro canônico. */
  destino: string;
};

export type AlertaDerivado = {
  /** Determinístico: mesma pendência canônica ⇒ mesma chave. */
  chave: string;
  motivo: MotivoAlerta;
  criticidade: CriticidadeAlerta;
  titulo: string;
  detalhe: string;
  caso?: string | null;
  origem: OrigemCanonica;
  /** Como o alerta encerra quando o registro canônico é corrigido. */
  encerraQuando: string;
};

/* ------------------------------------------------------------------ entrada */

export type CasoCanonico = {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
  responsavel_id?: string | null;
  archived_at?: string | null;
  /** Dias sem touchpoint (base única de D10/D14). */
  dias_sem_touchpoint?: number | null;
  espera_externa_ativa?: boolean;
  gates_pendentes?: string[];
  classificacao_origem?: string | null;
  projetado_ao_cliente?: boolean;
};

export type TarefaCanonica = {
  id: string;
  titulo?: string | null;
  caso_codigo?: string | null;
  sla_status?: string | null;
  responsavel_id?: string | null;
  prazo?: string | null;
  status?: string | null;
};

export type MicroentregaCanonica = {
  id: string;
  titulo?: string | null;
  caso_codigo?: string | null;
  prazo_status?: string | null;
  responsavel_id?: string | null;
  status?: string | null;
};

export type ComunicacaoCanonica = {
  id: string;
  caso_codigo?: string | null;
  assunto?: string | null;
  status?: string | null;
  requires_human_approval?: boolean | null;
};

export type DivergenciaCanonica = {
  id: string;
  sku?: string | null;
  descricao?: string | null;
  status?: string | null;
};

export type EntradaAlertas = {
  casos?: CasoCanonico[];
  tarefas?: TarefaCanonica[];
  microentregas?: MicroentregaCanonica[];
  comunicacoes?: ComunicacaoCanonica[];
  divergencias?: DivergenciaCanonica[];
};

/** Classificações que jamais podem chegar ao App Cliente (ver P0.2). */
const CLASSIFICACOES_NAO_REAIS = [
  "demo",
  "mock",
  "seed",
  "modelo",
  "importado_a_confirmar",
  "nao_classificado",
];

export const CADENCIA_ATENCAO_DIAS = 10;
export const CADENCIA_CRITICA_DIAS = 14;

/* ----------------------------------------------------------------- derivação */

/** Calcula a caixa de exceções acionáveis a partir dos dados canônicos. */
export function derivarAlertas(entrada: EntradaAlertas): AlertaDerivado[] {
  const out: AlertaDerivado[] = [];

  for (const c of entrada.casos ?? []) {
    if (c.archived_at) continue;
    const rotuloCaso = c.codigo ?? c.titulo ?? c.id;
    const destinoCaso = `/casos/${c.id}`;

    // D10/D14 = UMA única regra de cadência, com severidade escalonada.
    const dias = c.dias_sem_touchpoint ?? null;
    if (dias !== null && !c.espera_externa_ativa && dias >= CADENCIA_ATENCAO_DIAS) {
      const critico = dias >= CADENCIA_CRITICA_DIAS;
      out.push({
        chave: `cadencia:${c.id}`,
        motivo: "prazo_vencido",
        criticidade: critico ? "critica" : "alta",
        titulo: critico
          ? "Cadência crítica: 14 dias ou mais sem atualização"
          : "Cadência em atenção: 10 dias ou mais sem touchpoint",
        detalhe: `${dias} dias sem touchpoint registrado no caso. Sinal único de cadência (D10/D14).`,
        caso: rotuloCaso,
        origem: { entidade: "crm_casos", id: c.id, destino: destinoCaso },
        encerraQuando: "Registrar touchpoint no caso canônico.",
      });
    }

    if (!c.responsavel_id) {
      out.push({
        chave: `sem-responsavel:${c.id}`,
        motivo: "sem_responsavel",
        criticidade: "alta",
        titulo: "Caso sem responsável",
        detalhe: "Nenhum responsável nominal no registro canônico do caso.",
        caso: rotuloCaso,
        origem: { entidade: "crm_casos", id: c.id, destino: destinoCaso },
        encerraQuando: "Definir responsável no caso canônico.",
      });
    }

    for (const gate of c.gates_pendentes ?? []) {
      out.push({
        chave: `gate:${c.id}:${gate}`,
        motivo: "pendencia_bloqueia_estado",
        criticidade: "alta",
        titulo: `Gate pendente: ${gate}`,
        detalhe: "Pendência de ativação bloqueia avanço de estado do caso.",
        caso: rotuloCaso,
        origem: { entidade: "case_activation_checks", id: c.id, destino: `${destinoCaso}#ativacao` },
        encerraQuando: "Validar o gate na ficha de ativação do caso.",
      });
    }

    const classificacao = c.classificacao_origem ?? "nao_classificado";
    if (CLASSIFICACOES_NAO_REAIS.includes(classificacao)) {
      if (c.projetado_ao_cliente) {
        out.push({
          chave: `exposicao:${c.id}`,
          motivo: "risco_exposicao_interna",
          criticidade: "critica",
          titulo: "Registro não-real projetado ao App Cliente",
          detalhe: `Classificação “${classificacao}” não pode ser projetada a cliente autenticado.`,
          caso: rotuloCaso,
          origem: { entidade: "app_projections", id: c.id, destino: `${destinoCaso}#projecao` },
          encerraQuando: "Suspender a projeção ou classificar a origem como real no registro canônico.",
        });
      } else {
        out.push({
          chave: `classificacao:${c.id}`,
          motivo: "classificacao_origem_inconsistente",
          criticidade: "atencao",
          titulo: "Origem do dado sem classificação confirmada",
          detalhe: `Classificação atual: ${classificacao}.`,
          caso: rotuloCaso,
          origem: { entidade: "crm_casos", id: c.id, destino: `${destinoCaso}#classificacao` },
          encerraQuando: "Classificar a origem no registro canônico do caso.",
        });
      }
    }
  }

  for (const t of entrada.tarefas ?? []) {
    if (t.status === "concluida" || t.status === "cancelada") continue;
    if (t.sla_status === "atrasada" || t.sla_status === "em_risco") {
      out.push({
        chave: `sla-tarefa:${t.id}`,
        motivo: t.sla_status === "atrasada" ? "sla_violado" : "prazo_vencido",
        criticidade: t.sla_status === "atrasada" ? "critica" : "alta",
        titulo: t.sla_status === "atrasada" ? "SLA de tarefa violado" : "Tarefa na janela crítica de prazo",
        detalhe: `${t.titulo ?? "Tarefa"} — prazo ${t.prazo ?? "não informado"}.`,
        caso: t.caso_codigo ?? null,
        origem: { entidade: "tarefas", id: t.id, destino: `/tarefas?tarefa=${t.id}` },
        encerraQuando: "Concluir, replanejar ou cancelar a tarefa no registro canônico.",
      });
    }
    if (!t.responsavel_id) {
      out.push({
        chave: `sem-responsavel-tarefa:${t.id}`,
        motivo: "sem_responsavel",
        criticidade: "atencao",
        titulo: "Tarefa sem responsável",
        detalhe: t.titulo ?? "Tarefa sem responsável nominal.",
        caso: t.caso_codigo ?? null,
        origem: { entidade: "tarefas", id: t.id, destino: `/tarefas?tarefa=${t.id}` },
        encerraQuando: "Atribuir responsável na tarefa.",
      });
    }
  }

  for (const m of entrada.microentregas ?? []) {
    if (m.status === "concluida" || m.status === "cancelada") continue;
    if (m.prazo_status === "atrasada" || m.prazo_status === "em_risco") {
      out.push({
        chave: `prazo-microentrega:${m.id}`,
        motivo: m.prazo_status === "atrasada" ? "sla_violado" : "prazo_vencido",
        criticidade: m.prazo_status === "atrasada" ? "critica" : "alta",
        titulo:
          m.prazo_status === "atrasada"
            ? "Micro-entrega com prazo vencido"
            : "Micro-entrega na janela crítica",
        detalhe: m.titulo ?? "Micro-entrega pendente.",
        caso: m.caso_codigo ?? null,
        origem: { entidade: "ops_microentregas", id: m.id, destino: `/ops?microentrega=${m.id}` },
        encerraQuando: "Concluir ou replanejar a micro-entrega no registro canônico.",
      });
    }
  }

  for (const q of entrada.comunicacoes ?? []) {
    if (q.status === "awaiting_approval" || q.requires_human_approval) {
      out.push({
        chave: `decisao-comunicacao:${q.id}`,
        motivo: "decisao_humana_pendente",
        criticidade: "atencao",
        titulo: "Rascunho aguardando decisão humana",
        detalhe: `${q.assunto ?? "Rascunho de comunicação"} — nenhum envio foi executado.`,
        caso: q.caso_codigo ?? null,
        origem: { entidade: "communication_queue", id: q.id, destino: `/atendimento?rascunho=${q.id}` },
        encerraQuando: "Aprovar ou descartar o rascunho na fila de comunicação.",
      });
    }
  }

  for (const d of entrada.divergencias ?? []) {
    if (d.status === "resolvida") continue;
    out.push({
      chave: `divergencia:${d.id}`,
      motivo: "divergencia_entre_fontes",
      criticidade: "alta",
      titulo: `Divergência de catálogo: ${d.sku ?? d.id}`,
      detalhe: d.descricao ?? "Fontes canônicas de preço/SKU divergentes.",
      origem: { entidade: "sku_catalog", id: d.id, destino: `/catalogo` },
      encerraQuando: "Abrir o catálogo homologado e tratar a divergência no registro canônico.",
    });
  }

  return deduplicar(out);
}

/** Uma pendência canônica = um alerta. Mantém a maior criticidade. */
export function deduplicar(alertas: AlertaDerivado[]): AlertaDerivado[] {
  const peso: Record<CriticidadeAlerta, number> = { atencao: 1, alta: 2, critica: 3 };
  const mapa = new Map<string, AlertaDerivado>();
  for (const a of alertas) {
    const atual = mapa.get(a.chave);
    if (!atual || peso[a.criticidade] > peso[atual.criticidade]) mapa.set(a.chave, a);
  }
  return [...mapa.values()];
}

/**
 * Prioridade canônica de fila: um mesmo objeto aparece em UMA fila só.
 * Painel Hoje tem precedência sobre Alertas; Alertas sobre Checklist Semanal.
 */
export const PRIORIDADE_FILA = ["painel_hoje", "alertas", "checklist_semanal"] as const;
export type FilaOperacional = (typeof PRIORIDADE_FILA)[number];

export function filaCanonica(
  chave: string,
  presencaPorFila: Partial<Record<FilaOperacional, boolean>>,
): FilaOperacional | null {
  void chave;
  for (const fila of PRIORIDADE_FILA) if (presencaPorFila[fila]) return fila;
  return null;
}

/** Remove de uma fila os itens cuja fila canônica é outra. */
export function filtrarParaFila(
  alertas: AlertaDerivado[],
  fila: FilaOperacional,
  presenca: (chave: string) => Partial<Record<FilaOperacional, boolean>>,
): AlertaDerivado[] {
  return alertas.filter((a) => filaCanonica(a.chave, presenca(a.chave)) === fila);
}

/* -------------------------------------------------------- escrita proibida */

export const ACOES_PROIBIDAS_NA_ABA_ALERTAS = [
  "criar_prazo",
  "criar_tarefa",
  "alterar_status",
  "criar_caso",
  "editar_checklist",
  "editar_proposta",
  "editar_contrato",
  "criar_cobranca",
  "editar_evidencia",
  "editar_pesquisa",
  "enviar_comunicacao_externa",
] as const;

export type AcaoAlerta = (typeof ACOES_PROIBIDAS_NA_ABA_ALERTAS)[number] | "abrir_registro_canonico";

/** A aba Alertas só pode abrir o registro canônico. */
export function acaoPermitidaNaAbaAlertas(acao: AcaoAlerta): boolean {
  return acao === "abrir_registro_canonico";
}

export function destinoDoAlerta(a: AlertaDerivado): string {
  return a.origem.destino;
}

/**
 * Recalcula após mudança no registro canônico: o alerta some quando a
 * pendência deixa de existir na fonte. Não há estado próprio persistido.
 */
export function recalcularApos(entrada: EntradaAlertas, chave: string): "ativo" | "resolvido" {
  return derivarAlertas(entrada).some((a) => a.chave === chave) ? "ativo" : "resolvido";
}

/** Nenhum alerta interno é projetado ao App Cliente. */
export function alertasVisiveisParaCliente(_alertas: AlertaDerivado[]): AlertaDerivado[] {
  void _alertas;
  return [];
}
