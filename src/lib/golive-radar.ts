/**
 * Cálculos do Radar interno — funções puras, sem banco e sem inferência.
 *
 * Só usa o que já está gravado no caso: prazo da próxima ação, marcos de
 * formalização/pagamento/documentos, prioridade, espera externa e alertas
 * abertos. Não existe percentual jurídico e nenhuma leitura de elegibilidade.
 *
 * Datas: valores "AAAA-MM-DD" são lidos como meia-noite local; carimbos com
 * hora preservam o fuso gravado. `agora` é injetável para teste determinístico.
 */

export type CasoRadar = {
  id: string;
  codigo: string | null;
  titulo: string | null;
  status: string | null;
  fase: string | null;
  ativo: boolean;
  risco: string | null;
  prioridade: string | null;
  responsavel: string | null;
  proximaAcao: string | null;
  prazoProximaAcao: string | null;
  contratoAssinado: boolean;
  pagamentoConfirmado: boolean;
  documentosMinimosOk: boolean;
  aguardandoExterno: boolean;
  alertasAbertos: number;
};

export function paraData(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const texto = String(valor);
  const somenteData = /^\d{4}-\d{2}-\d{2}$/.test(texto);
  const d = somenteData ? new Date(`${texto}T00:00:00`) : new Date(texto);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Dias inteiros entre hoje e o prazo, pelo calendário local. */
export function diasAte(prazo: string | null, agora: Date = new Date()): number | null {
  const alvo = paraData(prazo);
  if (!alvo) return null;
  const a = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate()).getTime();
  const b = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
}

/** Urgência 0–1 a partir do prazo gravado. Sem prazo, só distingue ter ou não próxima ação. */
export function urgencia(caso: CasoRadar, agora: Date = new Date()): number {
  const dias = diasAte(caso.prazoProximaAcao, agora);
  if (dias === null) return caso.proximaAcao ? 0.5 : 0.2;
  if (dias < 0) return 1;
  if (dias === 0) return 0.9;
  if (dias <= 3) return 0.85;
  if (dias <= 7) return 0.65;
  if (dias <= 30) return 0.4;
  return 0.2;
}

/** Prontidão 0–1: marcos gravados de formalização, pagamento e documentos mínimos. */
export function prontidao(caso: CasoRadar): number {
  const marcos = [caso.contratoAssinado, caso.pagamentoConfirmado, caso.documentosMinimosOk];
  return marcos.filter(Boolean).length / marcos.length;
}

/** Quatro eixos internos do radar individual. Pendente é pendente, nunca estimativa. */
export function eixosDoCaso(caso: CasoRadar) {
  return [
    { rotulo: "Formalização", valor: caso.contratoAssinado ? 1 : 0 },
    { rotulo: "Pagamento", valor: caso.pagamentoConfirmado ? 1 : 0 },
    { rotulo: "Documentos", valor: caso.documentosMinimosOk ? 1 : 0 },
    { rotulo: "Próxima ação", valor: caso.proximaAcao ? 1 : 0 },
  ];
}

const PESO_PRIORIDADE: Record<string, number> = { critica: 3, alta: 3, urgente: 3, media: 2, normal: 2, baixa: 1 };

function pesoPrioridade(valor: string | null): number {
  if (!valor) return 0;
  return PESO_PRIORIDADE[valor.trim().toLowerCase()] ?? 0;
}

export type LinhaAtendimento = {
  caso: CasoRadar;
  dias: number | null;
  motivo: string;
  pontos: number;
};

/**
 * Ordem de atendimento. Regra curta e exibida na tela:
 * prazo vencido → prioridade registrada → sem próxima ação → espera externa.
 */
export function ordemDeAtendimento(
  carteira: readonly CasoRadar[],
  agora: Date = new Date(),
): LinhaAtendimento[] {
  return carteira
    .map((caso) => {
      const dias = diasAte(caso.prazoProximaAcao, agora);
      let pontos = 0;
      let motivo = "Acompanhamento normal";
      if (dias !== null && dias < 0) {
        pontos += 100;
        motivo = "Prazo vencido";
      } else if (dias === 0) {
        pontos += 80;
        motivo = "Prazo hoje";
      }
      const peso = pesoPrioridade(caso.prioridade);
      pontos += peso * 10;
      if (peso >= 3 && motivo === "Acompanhamento normal") motivo = "Prioridade alta registrada";
      if (!caso.proximaAcao) {
        pontos += 25;
        if (motivo === "Acompanhamento normal") motivo = "Sem próxima ação";
      }
      if (caso.aguardandoExterno) {
        pontos += 5;
        if (motivo === "Acompanhamento normal") motivo = "Aguardando instituição externa";
      }
      pontos += Math.min(caso.alertasAbertos, 5) * 3;
      return { caso, dias, motivo, pontos };
    })
    .sort((a, b) => b.pontos - a.pontos || (a.caso.titulo ?? "").localeCompare(b.caso.titulo ?? ""));
}

export type PontoMatriz = { id: string; rotulo: string; indice: number; x: number; y: number };

/**
 * Posições da matriz em coordenadas 0–1 (x = prontidão, y = urgência), com
 * afastamento de pontos praticamente coincidentes para não sobrepor rótulo.
 */
export function pontosDaMatriz(
  carteira: readonly CasoRadar[],
  agora: Date = new Date(),
): PontoMatriz[] {
  const base = carteira.map((caso, i) => ({
    id: caso.id,
    rotulo: caso.titulo ?? caso.codigo ?? "Caso sem título",
    indice: i + 1,
    x: prontidao(caso),
    y: urgencia(caso, agora),
  }));

  const usados: PontoMatriz[] = [];
  for (const p of base) {
    let { x, y } = p;
    let tentativa = 0;
    while (usados.some((u) => Math.abs(u.x - x) < 0.04 && Math.abs(u.y - y) < 0.04) && tentativa < 12) {
      const ang = (Math.PI / 3) * tentativa;
      x = Math.min(1, Math.max(0, p.x + Math.cos(ang) * 0.05 * (1 + Math.floor(tentativa / 6))));
      y = Math.min(1, Math.max(0, p.y + Math.sin(ang) * 0.05 * (1 + Math.floor(tentativa / 6))));
      tentativa += 1;
    }
    usados.push({ ...p, x, y });
  }
  return usados;
}

/* ------------------------------------------------------------------ *
 * Leads no Radar
 * ------------------------------------------------------------------ */

export type LeadRadar = {
  id: string;
  nome: string;
  etapa: string | null;
  estagio: string | null;
  proximoPasso: string | null;
  proximoPassoEm: string | null;
  callAgendada: string | null;
  callRealizada: string | null;
  propostaEm: string | null;
  casoId: string | null;
};

export type LinhaLeadRadar = {
  id: string;
  nome: string;
  etapa: string;
  marco: string;
  prazo: string | null;
  dias: number | null;
  alerta: string | null;
};

/**
 * Etapa comercial e marco do lead vêm só de datas já gravadas — nunca de
 * texto livre ou inferência. O alerta usa o prazo do próximo passo.
 */
export function linhaDoLead(lead: LeadRadar, agora: Date = new Date()): LinhaLeadRadar {
  const marco = lead.casoId
    ? "Caso aberto"
    : lead.propostaEm
      ? "Proposta registrada"
      : lead.callRealizada
        ? "Call realizada"
        : lead.callAgendada
          ? "Call agendada"
          : "Lead registrado";

  const dias = diasAte(lead.proximoPassoEm, agora);
  const alerta =
    dias === null
      ? lead.proximoPasso
        ? "Próximo passo sem prazo"
        : "Sem próximo passo definido"
      : dias < 0
        ? `Prazo vencido há ${Math.abs(dias)} dia(s)`
        : dias === 0
          ? "Prazo vence hoje"
          : null;

  return {
    id: lead.id,
    nome: lead.nome,
    etapa: lead.etapa ?? lead.estagio ?? "sem etapa registrada",
    marco,
    prazo: lead.proximoPassoEm,
    dias,
    alerta,
  };
}

/** Leads em atenção primeiro: vencidos, depois sem prazo, depois por prazo. */
export function leadsNoRadar(leads: LeadRadar[], agora: Date = new Date()): LinhaLeadRadar[] {
  return leads
    .map((l) => linhaDoLead(l, agora))
    .sort((a, b) => {
      const peso = (x: LinhaLeadRadar) => (x.dias !== null && x.dias < 0 ? 0 : x.dias === null ? 1 : 2);
      const d = peso(a) - peso(b);
      if (d !== 0) return d;
      if (a.dias !== null && b.dias !== null && a.dias !== b.dias) return a.dias - b.dias;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
}
