/**
 * Abertura do Painel — a frase antes do número.
 *
 * Decisão da Proprietária (26/08/2026): "deixe o visual mais amigável,
 * acolhedor, não só números". O Painel abria com cinco métricas; quem chega de
 * manhã lê cinco números sem saber ainda o que fazer com eles.
 *
 * Esta camada escreve, em uma frase, o que o dia é. Ela NÃO calcula nada novo:
 * lê o que o Painel já derivou. Sem dado, diz que não sabe — nunca produz uma
 * frase animadora sobre carteira que não conhece.
 */

export type EstadoDoDia = {
  vencidos: number | null;
  hoje: number | null;
  semToque: number | null;
  totalCasos: number;
};

export type Abertura = {
  saudacao: string;
  /** A frase que resume o dia. Sempre presente. */
  leitura: string;
  /** `true` quando não há fonte suficiente para afirmar qualquer coisa. */
  semDados: boolean;
};

/** Saudação pela hora local de quem está lendo. */
export function saudacaoDaHora(agora: Date = new Date()): string {
  const h = agora.getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const plural = (n: number, um: string, muitos: string) => (n === 1 ? um : muitos);

/**
 * Uma frase sobre o dia, na ordem em que a urgência importa: vencido primeiro,
 * depois o que vence hoje, depois quem está sem toque. Carteira sem nada disso
 * recebe uma frase de calmaria — que só é dita quando os três números existem.
 */
export function lerODia(e: EstadoDoDia, agora: Date = new Date()): Abertura {
  const saudacao = saudacaoDaHora(agora);
  const conhecidos = [e.vencidos, e.hoje, e.semToque].filter((v): v is number => v !== null);

  if (!conhecidos.length) {
    return {
      saudacao,
      leitura: "Ainda não consigo ler o dia: as fontes do painel não responderam.",
      semDados: true,
    };
  }

  const partes: string[] = [];
  if (e.vencidos)
    partes.push(`${e.vencidos} ${plural(e.vencidos, "ação vencida", "ações vencidas")}`);
  if (e.hoje) partes.push(`${e.hoje} ${plural(e.hoje, "vence hoje", "vencem hoje")}`);
  if (e.semToque) partes.push(`${e.semToque} sem toque há tempo demais`);

  if (!partes.length) {
    const completo = e.vencidos !== null && e.hoje !== null && e.semToque !== null;
    return {
      saudacao,
      leitura: completo
        ? e.totalCasos
          ? "Nada vencido e nada vencendo hoje. Dia de avançar o que estava esperando."
          : "Nenhum caso ativo na carteira hoje."
        : "Sem pendência no que consegui ler — mas nem todas as fontes responderam.",
      semDados: !completo,
    };
  }

  const lista =
    partes.length === 1
      ? partes[0]
      : `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`;

  return { saudacao, leitura: `Hoje o que pede você: ${lista}.`, semDados: false };
}
