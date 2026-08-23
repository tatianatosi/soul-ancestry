/**
 * CA-OPS-02 — exibição dos itens derivados na interface.
 *
 * Adaptador PURO entre os dados já carregados no Painel Hoje (cadência por caso
 * e casos bloqueados) e a visão derivada de `alertas-derivados.ts`.
 *
 * Invariantes:
 * - não faz I/O, não grava, não cria tarefa, prazo ou comunicação;
 * - respeita a precedência de fila: item já renderizado na fila priorizada,
 *   exceções ou comercial NÃO reaparece como item derivado;
 * - cada item derivado só linka o registro canônico.
 */
import {
  derivarAlertas,
  destinoDoAlerta,
  filtrarParaFila,
  type AlertaDerivado,
  type CasoCanonico,
} from "@/lib/alertas-derivados";

export type LinhaCadenciaPainel = {
  id?: string | null;
  codigo?: string | null;
  titulo?: string | null;
  responsavel_principal?: string | null;
  aguardando_instituicao_externa?: boolean | null;
  motivo_espera_externa?: string | null;
  cadencia?: { diasSemTouchpoint?: number | null; status?: string | null } | null;
};

export type EntradaDerivadosPainel = {
  /** Linhas de `painelCadencia` (já carregadas na tela). */
  casosCadencia?: readonly LinhaCadenciaPainel[];
  /** Chaves `tipo:id` já renderizadas em blocos anteriores do Painel Hoje. */
  jaExibidos?: ReadonlySet<string>;
  /** Ids de casos com condição comercial bloqueada (gate pendente conhecido). */
  bloqueadosCatalogo?: readonly string[];
  /** Teto de exibição — o Painel Hoje é fila curta, não relatório. */
  limite?: number;
};

export type ItemDerivadoPainel = {
  chave: string;
  titulo: string;
  detalhe: string;
  caso: string | null;
  casoId: string;
  criticidade: AlertaDerivado["criticidade"];
  destino: string;
  encerraQuando: string;
};

const PESO = { critica: 3, alta: 2, atencao: 1 } as const;

/** Converte as linhas de cadência já carregadas em casos canônicos. */
export function casosCanonicosDaCadencia(
  linhas: readonly LinhaCadenciaPainel[] = [],
  bloqueadosCatalogo: readonly string[] = [],
): CasoCanonico[] {
  const bloqueados = new Set(bloqueadosCatalogo.map(String));
  return linhas
    .filter((l) => typeof l?.id === "string" && l.id.length > 0)
    .map((l) => {
      const id = String(l.id);
      const dias = Number(l.cadencia?.diasSemTouchpoint);
      const caso: CasoCanonico = {
        id,
        codigo: l.codigo ?? null,
        titulo: l.titulo ?? null,
        // Responsável só entra quando existe no registro canônico.
        responsavel_id: l.responsavel_principal ?? null,
        dias_sem_touchpoint: Number.isFinite(dias) ? dias : null,
        espera_externa_ativa:
          !!l.aguardando_instituicao_externa && !!String(l.motivo_espera_externa ?? "").trim(),
        gates_pendentes: bloqueados.has(id) ? ["condicao_comercial"] : [],
      };
      return caso;
    });
}

/**
 * Itens derivados que devem aparecer na interface, já deduplicados contra o
 * que a tela renderizou antes.
 */
export function itensDerivadosDoPainel(entrada: EntradaDerivadosPainel): ItemDerivadoPainel[] {
  const casos = casosCanonicosDaCadencia(entrada.casosCadencia ?? [], entrada.bloqueadosCatalogo ?? []);
  // A cadência não carrega classificação de origem; sinal sem evidência na
  // fonte não é exibido (evita alerta falso de classificação/projeção).
  const alertas = derivarAlertas({ casos }).filter(
    (a) => a.motivo !== "classificacao_origem_inconsistente" && a.motivo !== "risco_exposicao_interna",
  );
  const jaExibidos = entrada.jaExibidos ?? new Set<string>();

  // Precedência canônica: se o registro já está na fila do Painel Hoje, o item
  // derivado não é repetido aqui.
  const idPorChave = new Map(alertas.map((a) => [a.chave, a.origem.id]));
  const visiveis = filtrarParaFila(alertas, "alertas", (chave) => ({
    painel_hoje: jaExibidos.has(`caso:${idPorChave.get(chave) ?? ""}`),
    alertas: true,
  }));

  return visiveis
    .sort((a, b) => PESO[b.criticidade] - PESO[a.criticidade])
    .slice(0, entrada.limite ?? 8)
    .map((a) => ({
      chave: a.chave,
      titulo: a.titulo,
      detalhe: a.detalhe,
      caso: a.caso ?? null,
      casoId: a.origem.id,
      criticidade: a.criticidade,
      destino: destinoDoAlerta(a),
      encerraQuando: a.encerraQuando,
    }));
}

/** Itens derivados de um único caso, para a tela do caso. */
export function itensDerivadosDoCaso(
  casoId: string,
  entrada: Omit<EntradaDerivadosPainel, "jaExibidos" | "limite">,
): ItemDerivadoPainel[] {
  return itensDerivadosDoPainel({ ...entrada, limite: 20 }).filter((i) => i.casoId === casoId);
}
