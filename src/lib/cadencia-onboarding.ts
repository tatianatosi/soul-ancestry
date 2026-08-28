/**
 * Cadência de onboarding — os marcos relativos do plano, virados em datas.
 *
 * 26/08/2026, prioridade 1 da Proprietária. O que já existia:
 *  - `onboarding-padrao.ts` traz o catálogo de itens com `prazo_dias`;
 *  - `onboarding_planos.plano_acao` traz ações com prazo escrito à mão
 *    ("D3 após início", "pendente de gate");
 *  - `onboarding_planos.touchpoints` traz marcos ("D7", "D10", "D14");
 *  - `onboarding_checklist` traz o estado real item a item.
 *
 * O que NÃO existia: qualquer coisa que juntasse isso e respondesse "quando".
 * O prazo estava escrito como texto livre e ficava só na tela, sem virar data,
 * sem virar ordem e sem virar atraso. Este módulo faz essa conversão.
 *
 * Três honestidades que o desenho impõe:
 *
 * 1. Sem `inicio_previsto` não existe D0, e sem D0 nada pode estar atrasado.
 *    O caso da Ana Luiza está exatamente assim hoje: o plano está bloqueado e
 *    o início nunca foi marcado. A resposta certa é "ainda não começou", não
 *    um contador ancorado numa data inventada.
 *
 * 2. Item travado por gate não está atrasado. "Contrato assinado" e "pagamento
 *    inicial" não têm prazo em dias porque dependem de fato externo. Tratá-los
 *    como vencidos encheria a tela de alarme falso — e alarme falso é o que
 *    faz parar de olhar para o alarme.
 *
 * 3. O banco e o catálogo usam vocabulários diferentes de item (`dossie_mae`
 *    contra "Dossiê-mãe", e cinco itens que só existem de um lado). Este
 *    módulo NÃO elege um vencedor: casa o que casa, e o que não casa continua
 *    aparecendo, marcado como sem prazo conhecido. Some da conta, nunca da
 *    vista.
 *
 * Camada pura: não lê banco, não escreve, não envia, não agenda.
 */

export type OrigemCadencia = "plano_acao" | "touchpoint" | "checklist";

export type SituacaoCadencia =
  /** Concluído, com data registrada. */
  | "cumprido"
  /** Depende de fato externo (contrato, pagamento). Não conta como atraso. */
  | "travado_por_gate"
  /** Existe no plano, mas ninguém definiu prazo relativo. */
  | "sem_prazo"
  /** Tem prazo relativo, mas o onboarding ainda não tem D0. */
  | "aguardando_inicio"
  /** Datado e ainda no prazo. */
  | "previsto"
  /** Datado para hoje. */
  | "vence_hoje"
  /** Datado e vencido. */
  | "atrasado";

export type EntradaCadencia = {
  id: string;
  rotulo: string;
  origem: OrigemCadencia;
  ordem: number;
  /** Deslocamento em dias a partir do D0, quando existe. */
  dias: number | null;
  /** Texto original do prazo, preservado para a tela poder mostrar a fonte. */
  prazoOriginal: string | null;
  responsavel: string | null;
  situacao: SituacaoCadencia;
  /** Data prevista (ISO, só o dia), quando há âncora e deslocamento. */
  previstaEm: string | null;
  /** Positivo = dias de atraso; negativo = dias de folga. Null quando não datável. */
  diferencaDias: number | null;
};

export type PlanoParaCadencia = {
  inicio_previsto?: string | null;
  estado?: string | null;
  motivos_bloqueio?: unknown;
  plano_acao?: unknown;
  touchpoints?: unknown;
  primeira_microentrega_prazo_dias?: number | null;
};

export type ItemChecklistParaCadencia = {
  item_code: string;
  label: string;
  ordem?: number | null;
  status?: string | null;
  concluido_em?: string | null;
  bloqueio_codigo?: string | null;
};

export type CadenciaOnboarding = {
  /** O D0, quando existe. */
  inicio: string | null;
  /** Por que não há D0, quando não há. */
  semInicio: "plano_bloqueado" | "inicio_nao_marcado" | null;
  motivosBloqueio: string[];
  entradas: EntradaCadencia[];
  /** Contagens para a tela não precisar recontar — e não divergir. */
  resumo: {
    total: number;
    cumpridos: number;
    atrasados: number;
    venceHoje: number;
    travadosPorGate: number;
    aguardandoInicio: number;
    semPrazo: number;
  };
};

/** Marcos escritos à mão: "D3 após início", "D7", "d10". */
const MARCO = /\bd\s*(\d{1,3})\b/i;

/** Frases que significam "depende de fato externo", não "sem prazo". */
const GATE =
  /pendente de gate|depende de gate|aguard\w* gate|pendente de contrato|pendente de pagamento/i;

/**
 * Lê um prazo relativo escrito em texto livre.
 *
 * Devolve o número de dias, `"gate"` quando a espera é por fato externo, ou
 * null quando não dá para saber. Não chuta: texto que não casa vira null e
 * aparece na tela como "sem prazo", que é a verdade.
 */
export function lerPrazoRelativo(texto: unknown): number | "gate" | null {
  if (typeof texto === "number" && Number.isFinite(texto)) return texto;
  if (typeof texto !== "string") return null;
  const t = texto.trim();
  if (!t) return null;
  if (GATE.test(t)) return "gate";
  const m = MARCO.exec(t);
  if (m) return Number(m[1]);
  // Um número solto ("7", "14") também é um deslocamento em dias.
  if (/^\d{1,3}$/.test(t)) return Number(t);
  return null;
}

/** Só o dia, em UTC, para a conta de dias não depender de fuso nem de hora. */
function soODia(valor: string | Date): number | null {
  const d = valor instanceof Date ? valor : new Date(valor);
  const t = d.getTime();
  if (Number.isNaN(t)) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function somarDias(baseUtc: number, dias: number): string {
  return new Date(baseUtc + dias * 86400000).toISOString().slice(0, 10);
}

function comoLista(valor: unknown): Record<string, unknown>[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((v): v is Record<string, unknown> => !!v && typeof v === "object");
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/**
 * Situação de uma entrada, dada a âncora e o deslocamento.
 *
 * A ordem das perguntas é o desenho: cumprido vence tudo; gate vem antes de
 * qualquer conta de dias, senão um item que depende de contrato apareceria
 * vermelho por um atraso que não é dele.
 */
function situar(args: {
  cumprido: boolean;
  dias: number | "gate" | null;
  inicioUtc: number | null;
  hojeUtc: number;
}): { situacao: SituacaoCadencia; previstaEm: string | null; diferencaDias: number | null } {
  if (args.cumprido) return { situacao: "cumprido", previstaEm: null, diferencaDias: null };
  if (args.dias === "gate")
    return { situacao: "travado_por_gate", previstaEm: null, diferencaDias: null };
  if (args.dias === null) return { situacao: "sem_prazo", previstaEm: null, diferencaDias: null };
  if (args.inicioUtc === null)
    return { situacao: "aguardando_inicio", previstaEm: null, diferencaDias: null };

  const previstaUtc = args.inicioUtc + args.dias * 86400000;
  const diferencaDias = Math.round((args.hojeUtc - previstaUtc) / 86400000);
  const previstaEm = somarDias(args.inicioUtc, args.dias);
  if (diferencaDias > 0) return { situacao: "atrasado", previstaEm, diferencaDias };
  if (diferencaDias === 0) return { situacao: "vence_hoje", previstaEm, diferencaDias };
  return { situacao: "previsto", previstaEm, diferencaDias };
}

const CONCLUIDO = /conclu|feito|ok|cumprid/i;

/**
 * Monta a cadência de onboarding de um caso.
 *
 * Junta três fontes que hoje vivem separadas — ações do plano, touchpoints e
 * checklist — sem eleger uma como verdade única. Cada entrada carrega de onde
 * veio, para a tela poder dizer isso e para a divergência entre as fontes
 * ficar visível em vez de ser resolvida no escuro.
 */
export function lerCadenciaOnboarding(args: {
  plano?: PlanoParaCadencia | null;
  checklist?: ItemChecklistParaCadencia[] | null;
  /** Injetável para o teste não depender do relógio. */
  hoje?: Date | string;
}): CadenciaOnboarding {
  const plano = args.plano ?? null;
  const hojeUtc = soODia(args.hoje ?? new Date()) ?? 0;
  const inicio = texto(plano?.inicio_previsto);
  const inicioUtc = inicio ? soODia(inicio) : null;

  const motivosBloqueio = Array.isArray(plano?.motivos_bloqueio)
    ? (plano!.motivos_bloqueio as unknown[]).filter((m): m is string => typeof m === "string")
    : [];

  const semInicio: CadenciaOnboarding["semInicio"] = inicioUtc
    ? null
    : motivosBloqueio.length > 0 || plano?.estado === "bloqueado"
      ? "plano_bloqueado"
      : "inicio_nao_marcado";

  const entradas: EntradaCadencia[] = [];

  // 1) Ações do plano — trazem responsável, que nenhuma outra fonte traz.
  comoLista(plano?.plano_acao).forEach((a, i) => {
    const rotulo = texto(a.acao) ?? texto(a.descricao);
    if (!rotulo) return;
    const prazoOriginal = texto(a.prazo);
    const lido = lerPrazoRelativo(prazoOriginal);
    const s = situar({ cumprido: false, dias: lido, inicioUtc, hojeUtc });
    entradas.push({
      id: `plano_acao:${i}`,
      rotulo,
      origem: "plano_acao",
      ordem: typeof a.ordem === "number" ? a.ordem : i + 1,
      dias: typeof lido === "number" ? lido : null,
      prazoOriginal,
      responsavel: texto(a.responsavel),
      ...s,
    });
  });

  // 2) Touchpoints — o compromisso com o cliente, não a tarefa interna.
  comoLista(plano?.touchpoints).forEach((t, i) => {
    const rotulo = texto(t.descricao) ?? texto(t.marco);
    if (!rotulo) return;
    const prazoOriginal = texto(t.marco);
    const lido = lerPrazoRelativo(prazoOriginal);
    const cumprido = CONCLUIDO.test(String(t.status ?? ""));
    const s = situar({ cumprido, dias: lido, inicioUtc, hojeUtc });
    entradas.push({
      id: `touchpoint:${i}`,
      rotulo,
      origem: "touchpoint",
      ordem: typeof lido === "number" ? lido : 900 + i,
      dias: typeof lido === "number" ? lido : null,
      prazoOriginal,
      responsavel: null,
      ...s,
    });
  });

  // 3) Checklist — o estado real, item a item, com o prazo do catálogo.
  (args.checklist ?? []).forEach((item, i) => {
    const cumprido = !!item.concluido_em || CONCLUIDO.test(String(item.status ?? ""));
    const doCatalogo = prazoDoCatalogo(item.item_code, item.label);
    const lido = item.bloqueio_codigo ? "gate" : doCatalogo;
    const s = situar({ cumprido, dias: lido, inicioUtc, hojeUtc });
    entradas.push({
      id: `checklist:${item.item_code}`,
      rotulo: item.label || item.item_code,
      origem: "checklist",
      ordem: typeof item.ordem === "number" ? item.ordem : i + 1,
      dias: typeof lido === "number" ? lido : null,
      prazoOriginal: typeof doCatalogo === "number" ? `D${doCatalogo}` : null,
      responsavel: null,
      ...s,
    });
  });

  entradas.sort((a, b) => {
    // Datado primeiro, na ordem do calendário; o resto depois, na ordem do plano.
    const da = a.dias ?? Number.POSITIVE_INFINITY;
    const db = b.dias ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
    return a.ordem - b.ordem;
  });

  const conta = (s: SituacaoCadencia) => entradas.filter((e) => e.situacao === s).length;

  return {
    inicio,
    semInicio,
    motivosBloqueio,
    entradas,
    resumo: {
      total: entradas.length,
      cumpridos: conta("cumprido"),
      atrasados: conta("atrasado"),
      venceHoje: conta("vence_hoje"),
      travadosPorGate: conta("travado_por_gate"),
      aguardandoInicio: conta("aguardando_inicio"),
      semPrazo: conta("sem_prazo"),
    },
  };
}

/**
 * O prazo do catálogo para um item do checklist.
 *
 * O banco fala `dossie_mae`; o catálogo fala "Dossiê-mãe". São vocabulários
 * diferentes e nenhum dos dois é "o certo" — por isso a correspondência é
 * declarada aqui, item a item, e não adivinhada por semelhança de texto.
 * Item sem correspondência devolve null e aparece como "sem prazo", que é
 * informação verdadeira, não uma falha a esconder.
 */
export function prazoDoCatalogo(itemCode: string, _label?: string): number | null {
  return PRAZO_POR_CODIGO[itemCode] ?? null;
}

/**
 * Correspondência explícita entre o código do banco e o prazo do catálogo.
 *
 * Os cinco itens sem prazo estão aqui com null de propósito: registrar que a
 * ausência foi vista é diferente de esquecer o item. `contrato_assinado` e
 * `pagamento_inicial` não têm prazo em dias porque dependem de fato externo —
 * o gate os marca antes de qualquer conta.
 */
const PRAZO_POR_CODIGO: Record<string, number | null> = {
  contrato_assinado: null,
  pagamento_inicial: null,
  responsavel_principal: null,
  nucleo_familiar: null,
  dossie_mae: 7,
  ambiente_acesso: 3,
  case_service: null,
  checklist_inicial: 5,
  plano_acao: 5,
  grupo_familiar: null,
  app_cliente: null,
  micro_entrega_d7: 7,
};

/** Os códigos que o catálogo conhece. Exposto para o teste de cobertura. */
export const CODIGOS_COM_PRAZO_CONHECIDO = Object.keys(PRAZO_POR_CODIGO);

/**
 * Tons por situação, validados com o script da paleta (modo claro, todos os
 * pares).
 *
 * Duas decisões que o validador forçou:
 *
 * 1. "Cumprido" e "atrasado" precisaram se afastar também em luminosidade.
 *    O par verde/vermelho natural (#4E7A3E ↔ #9A3A2F) dava ΔE 4,4 sob
 *    deuteranopia — a confusão clássica, e justamente na distinção mais
 *    importante da tela. Com o vermelho mais escuro (#5E1F18) o par vai a
 *    ΔE 19,2, e passa em todos os pares.
 *
 * 2. Espera por gate, espera pelo início e ausência de prazo NÃO ganharam
 *    matiz. Elas não são níveis de gravidade, são ausência de prazo aplicável;
 *    pintá-las de colorido competiria com o que realmente pede ação. Vão em
 *    tinta neutra.
 *
 * O ouro #FCB73A fica em 1,71:1 sobre o creme — abaixo de 3:1. Não é descuido:
 * é o achado P1 do estudo de UX, e a contrapartida exigida é rótulo visível
 * sempre. Por isso cada situação aqui carrega `rotulo`, e a tela nunca usa a
 * cor sozinha.
 */
export const TOM_CADENCIA: Record<
  SituacaoCadencia,
  { cor: string | null; rotulo: string; sinal: string }
> = {
  cumprido: { cor: "#4E7A3E", rotulo: "Cumprido", sinal: "✓" },
  previsto: { cor: "#2F4B6E", rotulo: "No prazo", sinal: "•" },
  vence_hoje: { cor: "#FCB73A", rotulo: "Vence hoje", sinal: "!" },
  atrasado: { cor: "#5E1F18", rotulo: "Atrasado", sinal: "!" },
  travado_por_gate: { cor: null, rotulo: "Espera contrato ou pagamento", sinal: "⏸" },
  aguardando_inicio: { cor: null, rotulo: "Espera o início", sinal: "⏳" },
  sem_prazo: { cor: null, rotulo: "Sem prazo definido", sinal: "–" },
};

/** As situações que pedem ação hoje, na ordem em que devem ser olhadas. */
export const SITUACOES_QUE_PEDEM_ACAO: SituacaoCadencia[] = ["atrasado", "vence_hoje"];

/**
 * A frase de abertura da cadência — o estado em linguagem de gente.
 *
 * Nunca afirma atraso sem âncora, e nunca chama de atraso o que espera gate.
 * Quando não há o que dizer, diz isso, em vez de inventar um número.
 */
export function leituraDaCadencia(c: CadenciaOnboarding): string {
  if (c.semInicio === "plano_bloqueado") {
    const n = c.motivosBloqueio.length;
    return n
      ? `O onboarding ainda não começou: ${n === 1 ? "falta" : "faltam"} ${c.motivosBloqueio
          .map((m) => m.replace(/\.$/, "").toLowerCase())
          .join(" e ")}.`
      : "O onboarding ainda não começou porque o plano está bloqueado.";
  }
  if (c.semInicio === "inicio_nao_marcado") {
    return "O onboarding pode começar, mas a data de início ainda não foi marcada — é ela que liga o calendário.";
  }
  if (c.resumo.atrasados > 0) {
    return `${c.resumo.atrasados} ${c.resumo.atrasados === 1 ? "marco atrasado" : "marcos atrasados"}${
      c.resumo.venceHoje ? ` e ${c.resumo.venceHoje} vencendo hoje` : ""
    }.`;
  }
  if (c.resumo.venceHoje > 0) {
    return `${c.resumo.venceHoje} ${c.resumo.venceHoje === 1 ? "marco vence" : "marcos vencem"} hoje.`;
  }
  if (c.resumo.total === 0) return "Este caso ainda não tem cadência de onboarding montada.";
  return "Cadência em dia: nenhum marco atrasado nem vencendo hoje.";
}
