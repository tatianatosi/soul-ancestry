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

/* ------------------------------------------------------------------ */
/* Próxima ação do Painel Hoje ligada ao último elo pendente.           */
/* Somente leitura: nada é criado, enviado, publicado ou persistido.    */
/* ------------------------------------------------------------------ */

export type PontuacaoAjuste = {
  elo: EloDerivado;
  pontos: number;
  criterios: readonly string[];
};

export type ProximaAcaoPainel = {
  /** Último elo pendente ou bloqueado da cadeia (exclui o próprio Painel Hoje). */
  elo: EloDerivado | null;
  rotulo: string;
  responsavel: string;
  prazo: string;
  destino: string | null;
  motivo: string;
  /** Verdadeiro quando nenhum elo está pendente ou bloqueado. */
  semPendencias: boolean;
  /** Mensagem de status legível para o painel. */
  status: string;
  /** Como a sugestão foi obtida: elo pendente ou melhor ajuste disponível. */
  origem: "elo_pendente" | "melhor_ajuste";
  /** Evidências que sustentam o estado exibido. */
  evidencias: readonly string[];
  /** Pontuação do elo escolhido quando a origem é melhor ajuste. */
  pontuacao: number | null;
  /** Critérios que explicam a pontuação do melhor ajuste. */
  justificativa: readonly string[];
  /** Ranking completo do melhor ajuste (vazio quando há elos pendentes). */
  ranking: readonly PontuacaoAjuste[];
};

const SEM_DEFINICAO = "não definido";

/**
 * Pontua os elos candidatos ao "melhor ajuste" quando não há elos pendentes.
 * Regra determinística e explicável: quanto mais avançado e mais completo o
 * elo, maior a pontuação. Nenhum dado é criado ou persistido.
 */
export function pontuarMelhorAjuste(
  resultado: ResultadoCadeia,
  elos: readonly EloDerivado[],
): readonly PontuacaoAjuste[] {
  const candidatos = elos.filter((e) => e.chave !== "painel_hoje" && e.estado === "concluido");
  const base = candidatos.length > 0 ? candidatos : elos.filter((e) => e.chave !== "painel_hoje");

  return [...base]
    .map((elo) => {
      const criterios: string[] = [];
      let pontos = 0;

      if (elo.estado === "concluido") {
        pontos += 40;
        criterios.push("Elo cumprido (+40)");
      } else if (elo.estado === "nao_aplicavel") {
        pontos += 5;
        criterios.push("Elo não aplicável a este evento (+5)");
      } else {
        criterios.push("Elo sem conclusão registrada (+0)");
      }

      pontos += elo.ordem * 3;
      criterios.push(`Avanço na cadeia: elo ${elo.ordem} de 11 (+${elo.ordem * 3})`);

      if (resultado.tarefa.titulo) {
        pontos += 10;
        criterios.push("Tarefa canônica disponível (+10)");
      }
      if (resultado.template.template) {
        pontos += 10;
        criterios.push("Modelo vigente disponível (+10)");
      }
      if (resultado.tarefa.responsavel_id) {
        pontos += 5;
        criterios.push("Responsável definido (+5)");
      }
      if (resultado.tarefa.prazo) {
        pontos += 5;
        criterios.push("Prazo definido (+5)");
      }

      return { elo, pontos, criterios };
    })
    .sort((a, b) => (b.pontos === a.pontos ? b.elo.ordem - a.elo.ordem : b.pontos - a.pontos));
}


/** Evidências textuais do elo, derivadas do resultado da cadeia. */
export function evidenciasDoElo(
  resultado: ResultadoCadeia,
  elo: EloDerivado,
): readonly string[] {
  const r = resultado;
  const base = [
    `Elo ${elo.ordem} de 11 — ${elo.rotulo}`,
    elo.detalhe,
    `Envio executado: não · persistido: não`,
  ];
  const extras: string[] = [];
  if (r.tarefa.titulo) {
    extras.push(
      `Tarefa canônica: ${r.tarefa.titulo} · responsável ${r.tarefa.responsavel_id ?? SEM_DEFINICAO} · prazo ${r.tarefa.prazo ?? SEM_DEFINICAO}`,
    );
  }
  if (r.template.template) {
    extras.push(
      `Modelo vigente: ${r.template.template.titulo} (v${r.template.versao ?? 1} · ${r.template.template.canal_previsto})`,
    );
  } else {
    extras.push(`Modelo vigente: ${r.template.motivo}`);
  }
  if (r.revisao.pendencias.length > 0) {
    extras.push(`Pendências de revisão: ${r.revisao.pendencias.join("; ")}`);
  }
  if (r.plano.objetoCanonico) extras.push(`Objeto canônico: ${r.plano.objetoCanonico}`);
  return [...base, ...extras];
}

export type DetalheElo = {
  elo: EloDerivado;
  tarefa: string;
  responsavel: string;
  prazo: string;
  templateResumo: string;
  evidencias: readonly string[];
};

/** Detalhe completo de um elo para exibição em drawer, somente leitura. */
export function detalharElo(resultado: ResultadoCadeia, elo: EloDerivado): DetalheElo {
  const t = resultado.template.template;
  return {
    elo,
    tarefa: resultado.tarefa.titulo ?? "Sem tarefa nova para este evento",
    responsavel: resultado.tarefa.responsavel_id ?? SEM_DEFINICAO,
    prazo: resultado.tarefa.prazo ?? SEM_DEFINICAO,
    templateResumo: t
      ? `${t.titulo} (v${resultado.template.versao ?? 1} · ${t.canal_previsto}) — ${t.finalidade}`
      : resultado.template.motivo,
    evidencias: evidenciasDoElo(resultado, elo),
  };
}

/**
 * Deriva a próxima ação exibida no Painel Hoje a partir do último elo pendente
 * ou bloqueado da cadeia, acrescentando responsável e prazo da tarefa canônica.
 * Sem elos pendentes, devolve status explícito e a sugestão de melhor ajuste.
 */
export function proximaAcaoDoPainel(
  resultado: ResultadoCadeia,
  elos: readonly EloDerivado[],
): ProximaAcaoPainel {
  const candidatos = elos.filter(
    (e) => e.chave !== "painel_hoje" && (e.estado === "pendente" || e.estado === "bloqueado"),
  );
  const item = resultado.painelHoje;
  const semPendencias = candidatos.length === 0;

  if (semPendencias) {
    // Melhor ajuste: elo mais bem pontuado pela regra determinística.
    const ranking = pontuarMelhorAjuste(resultado, elos);
    const topo = ranking[0] ?? null;
    const melhor = topo?.elo ?? elos[0] ?? null;
    return {
      elo: melhor,
      rotulo: item?.rotulo ?? "Acompanhar o caso e aguardar o próximo evento canônico",
      responsavel: resultado.tarefa.responsavel_id ?? SEM_DEFINICAO,
      prazo: item?.prazo ?? resultado.tarefa.prazo ?? SEM_DEFINICAO,
      destino: item?.destino ?? resultado.plano.objetoCanonico ?? null,
      motivo: melhor
        ? `Sugestão por melhor ajuste — elo ${melhor.ordem} (${melhor.rotulo}), pontuação ${topo?.pontos ?? 0}: ${melhor.detalhe}`
        : "Nenhum elo disponível para sugestão.",
      semPendencias: true,
      status: "Cadeia sem elos pendentes ou bloqueados neste momento.",
      origem: "melhor_ajuste",
      evidencias: melhor ? evidenciasDoElo(resultado, melhor) : [],
      pontuacao: topo?.pontos ?? null,
      justificativa: topo?.criterios ?? [],
      ranking,
    };
  }

  const elo = candidatos[candidatos.length - 1]!;
  return {
    elo,
    rotulo: item?.rotulo ?? elo.rotulo,
    responsavel: resultado.tarefa.responsavel_id ?? SEM_DEFINICAO,
    prazo: item?.prazo ?? resultado.tarefa.prazo ?? SEM_DEFINICAO,
    destino: item?.destino ?? resultado.plano.objetoCanonico ?? null,
    motivo: `Elo ${elo.ordem} — ${elo.rotulo}: ${elo.detalhe}`,
    semPendencias: false,
    status: `Elo pendente identificado: ${elo.rotulo} (${elo.estado === "bloqueado" ? "bloqueado" : "pendente"}).`,
    origem: "elo_pendente",
    evidencias: evidenciasDoElo(resultado, elo),
    pontuacao: null,
    justificativa: [],
    ranking: [],
  };

}

