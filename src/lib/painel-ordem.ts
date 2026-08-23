/**
 * Painel Hoje — contrato de leitura da tela.
 *
 * Duas regras de UI viram verificação executável, não convenção de código:
 *  1. Ordem canônica dos blocos, com "Sinais de atenção" imediatamente após
 *     "Exceções que exigem dono".
 *  2. Fila de trabalho sem duplicidade: um registro (lead ou caso) aparece uma
 *     única vez nos blocos que geram linha de ação.
 *
 * Não altera dado nem dispara ação: apenas descreve e confere o que está na tela.
 */

export type BlocoPainel = {
  chave: string;
  titulo: string;
  /** Blocos que produzem linha de trabalho clicável por registro. */
  fila: boolean;
};

/** Ordem canônica dos blocos do Painel Hoje, de cima para baixo. */
export const ORDEM_BLOCOS_PAINEL: readonly BlocoPainel[] = [
  { chave: "cards", titulo: "Cards do dia", fila: false },
  { chave: "fila_priorizada", titulo: "Minha fila priorizada", fila: true },
  { chave: "excecoes", titulo: "Exceções que exigem dono", fila: true },
  { chave: "sinais", titulo: "Sinais de atenção", fila: false },
  { chave: "comercial", titulo: "Comercial hoje", fila: false },
  { chave: "prazos", titulo: "Casos com prazo em atenção", fila: false },
  { chave: "atalhos", titulo: "Atalhos", fila: false },
  { chave: "descoberta", titulo: "Encontrar no Desk", fila: false },
] as const;

/** Par cuja adjacência é obrigatória: sinais logo depois das exceções. */
export const PAR_OBRIGATORIO = { antes: "excecoes", depois: "sinais" } as const;

export type ProblemaPainel = { chave: string; mensagem: string };

const titulo = (chave: string) => ORDEM_BLOCOS_PAINEL.find((b) => b.chave === chave)?.titulo ?? chave;

/**
 * Confere a ordem dos blocos efetivamente renderizados.
 * Blocos ausentes não são erro (a tela pode ocultar um bloco vazio); o que é
 * erro é ordem trocada ou algo inserido entre exceções e sinais.
 */
export function validarOrdemPainel(chavesRenderizadas: readonly string[]): ProblemaPainel[] {
  const problemas: ProblemaPainel[] = [];
  const conhecidas = new Set(ORDEM_BLOCOS_PAINEL.map((b) => b.chave));
  const vistas = new Set<string>();

  for (const chave of chavesRenderizadas) {
    if (!conhecidas.has(chave)) {
      problemas.push({ chave, mensagem: `Bloco “${chave}” não faz parte da ordem canônica do painel.` });
      continue;
    }
    if (vistas.has(chave)) {
      problemas.push({ chave, mensagem: `Bloco “${titulo(chave)}” aparece mais de uma vez na tela.` });
    }
    vistas.add(chave);
  }

  const canonicas = chavesRenderizadas.filter((c) => conhecidas.has(c));
  const esperada = ORDEM_BLOCOS_PAINEL.map((b) => b.chave).filter((c) => canonicas.includes(c));
  const ordemUnica = canonicas.filter((c, i) => canonicas.indexOf(c) === i);
  if (ordemUnica.join(">") !== esperada.join(">")) {
    problemas.push({
      chave: "ordem",
      mensagem: `Ordem fora do padrão. Esperado: ${esperada.map(titulo).join(" → ")}.`,
    });
  }

  const iAntes = canonicas.indexOf(PAR_OBRIGATORIO.antes);
  const iDepois = canonicas.indexOf(PAR_OBRIGATORIO.depois);
  if (iAntes >= 0 && iDepois >= 0 && iDepois !== iAntes + 1) {
    problemas.push({
      chave: "adjacencia",
      mensagem: `“${titulo(PAR_OBRIGATORIO.depois)}” precisa vir imediatamente após “${titulo(
        PAR_OBRIGATORIO.antes,
      )}”.`,
    });
  }
  if (iAntes >= 0 && iDepois < 0) {
    problemas.push({
      chave: "adjacencia",
      mensagem: `“${titulo(PAR_OBRIGATORIO.depois)}” não foi renderizado depois de “${titulo(
        PAR_OBRIGATORIO.antes,
      )}”.`,
    });
  }

  return problemas;
}

export type RegistroRenderizado = { bloco: string; tipo: string; id: string };

/**
 * Duplicidade de registro entre os blocos de fila.
 * Um mesmo lead/caso listado duas vezes é defeito: a ação principal fica na
 * fila priorizada e os demais bloqueios ficam na ficha do registro.
 */
export function duplicidadesDeRegistro(registros: readonly RegistroRenderizado[]): ProblemaPainel[] {
  const blocosFila = new Set(ORDEM_BLOCOS_PAINEL.filter((b) => b.fila).map((b) => b.chave));
  const ondeApareceu = new Map<string, string[]>();
  for (const r of registros) {
    if (!blocosFila.has(r.bloco)) continue;
    const chave = `${r.tipo}:${r.id}`;
    ondeApareceu.set(chave, [...(ondeApareceu.get(chave) ?? []), r.bloco]);
  }
  return [...ondeApareceu.entries()]
    .filter(([, blocos]) => blocos.length > 1)
    .map(([chave, blocos]) => ({
      chave,
      mensagem: `Registro repetido na fila (${blocos.map(titulo).join(" e ")}).`,
    }));
}

/** Verificação completa da tela, para exibir aviso interno quando algo sai do padrão. */
export function validarPainelHoje(
  chavesRenderizadas: readonly string[],
  registros: readonly RegistroRenderizado[],
): ProblemaPainel[] {
  return [...validarOrdemPainel(chavesRenderizadas), ...duplicidadesDeRegistro(registros)];
}
