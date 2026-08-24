/* ------------------------------------------------------------------ */
/* Visão derivada da cadeia canônica da jornada (11 elos).              */
/*                                                                      */
/* Evento/fase → regra de jornada → tarefa+responsável+prazo →          */
/* template sugerido → rascunho/microentrega → revisão humana →         */
/* publicação autorizada ou fila → touchpoint/entrega →                 */
/* cadência recalculada → alerta derivado → Painel Hoje.                */
/*                                                                      */
/* Módulo puro de leitura: não envia, não publica e não persiste nada.  */
/* ------------------------------------------------------------------ */

import { ELOS_CADEIA, ROTULO_EVENTO, type EloCadeia, type ResultadoCadeia } from "@/lib/orquestracao-jornada";

export type EstadoElo = "concluido" | "pendente" | "bloqueado" | "nao_aplicavel";

export type EloDerivado = {
  chave: EloCadeia;
  ordem: number;
  rotulo: string;
  estado: EstadoElo;
  detalhe: string;
};

export const ROTULO_ELO: Record<EloCadeia, string> = {
  evento_ou_fase: "Evento ou fase do CRM/caso",
  regra_de_jornada: "Regra de jornada aplicável",
  tarefa_responsavel_prazo: "Tarefa + responsável + prazo",
  template_sugerido: "Template sugerido da Biblioteca de Mensagens",
  rascunho_ou_microentrega: "Rascunho de comunicação ou microentrega",
  revisao_humana: "Revisão/aprovação humana",
  publicacao_ou_fila: "Publicação autorizada ou fila de envio",
  touchpoint_ou_entrega: "Registro de touchpoint / entrega",
  cadencia_recalculada: "Cadência recalculada",
  alerta_derivado: "Alerta derivado (só com atraso, bloqueio ou exceção)",
  painel_hoje: "Painel Hoje mostra a próxima ação",
};

/**
 * Traduz o resultado da cadeia em uma lista ordenada de 11 elos com estado
 * explicável. Nenhum elo executa ação: o estado é somente derivado.
 */
export function descreverCadeia(
  resultado: ResultadoCadeia,
  contexto: { evento: keyof typeof ROTULO_EVENTO },
): readonly EloDerivado[] {
  const r = resultado;
  const bloqueada = r.revisao.pendencias.length > 0;

  const mapa: Record<EloCadeia, { estado: EstadoElo; detalhe: string }> = {
    evento_ou_fase: {
      estado: "concluido",
      detalhe: ROTULO_EVENTO[contexto.evento],
    },
    regra_de_jornada: {
      estado: r.plano.tarefaSugerida ? "concluido" : "nao_aplicavel",
      detalhe: r.plano.tarefaSugerida
        ? `Objeto canônico: ${r.plano.objetoCanonico}`
        : "Nenhuma regra de jornada gera tarefa para este evento.",
    },
    tarefa_responsavel_prazo: {
      estado: !r.tarefa.titulo ? "nao_aplicavel" : r.tarefa.completa ? "concluido" : "pendente",
      detalhe: r.tarefa.titulo
        ? `${r.tarefa.titulo} · responsável ${r.tarefa.responsavel_id ?? "não definido"} · prazo ${r.tarefa.prazo ?? "não definido"}`
        : "Sem tarefa nova.",
    },
    template_sugerido: {
      estado: r.template.template ? "concluido" : "nao_aplicavel",
      detalhe: r.template.template
        ? `${r.template.template.titulo} (v${r.template.versao ?? 1} · ${r.template.template.canal_previsto})`
        : r.template.motivo,
    },
    rascunho_ou_microentrega: {
      estado: r.saida === "nenhuma" ? "nao_aplicavel" : "pendente",
      detalhe:
        r.saida === "microentrega"
          ? "Microentrega em preparo, ainda não publicada."
          : r.saida === "rascunho_interno"
            ? "Rascunho interno disponível apenas para revisão e cópia manual."
            : "Nenhuma saída gerada.",
    },
    revisao_humana: {
      estado: r.revisao.aprovada ? "concluido" : bloqueada ? "bloqueado" : "pendente",
      detalhe: r.revisao.aprovada
        ? "Aprovada por pessoa responsável."
        : bloqueada
          ? `Pendências: ${r.revisao.pendencias.join("; ")}`
          : "Aguardando revisão humana. Nada avança sem aprovação.",
    },
    publicacao_ou_fila: {
      estado: r.publicacao.autorizada ? "concluido" : "bloqueado",
      detalhe: r.publicacao.autorizada
        ? `Autorizada para ${r.publicacao.destino === "app_cliente" ? "o App Cliente" : "a fila interna"}. Envio externo permanece manual.`
        : "Sem autorização: nada é publicado nem enfileirado.",
    },
    touchpoint_ou_entrega: {
      estado: r.touchpoint ? "concluido" : "pendente",
      detalhe: r.touchpoint ? "Touchpoint registrado no ciclo." : "Nenhum touchpoint ou entrega registrada.",
    },
    cadencia_recalculada: {
      estado: r.cadencia ? "concluido" : "nao_aplicavel",
      detalhe: r.cadencia
        ? `${r.cadencia.diasSemTouchpoint} dia(s) sem touchpoint · ${r.cadencia.status} — ${r.cadencia.motivo}`
        : "Cadência não recalculada nesta passagem.",
    },
    alerta_derivado: {
      estado: r.alerta ? "bloqueado" : "nao_aplicavel",
      detalhe: r.alerta
        ? `${r.alerta.titulo} — ${r.alerta.detalhe}`
        : "Sem atraso, bloqueio ou exceção: nenhum alerta é criado.",
    },
    painel_hoje: {
      estado: r.painelHoje ? "pendente" : "nao_aplicavel",
      detalhe: r.painelHoje
        ? `${r.painelHoje.rotulo} · ${r.painelHoje.destino}`
        : "Nenhuma próxima ação a exibir no Painel Hoje.",
    },
  };

  return ELOS_CADEIA.map((chave, i) => ({
    chave,
    ordem: i + 1,
    rotulo: ROTULO_ELO[chave],
    estado: mapa[chave].estado,
    detalhe: mapa[chave].detalhe,
  }));
}
