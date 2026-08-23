/**
 * Guarda de sessão do Desk.
 *
 * Uma leitura isolada de sessão pode voltar vazia por motivo transitório
 * (renovação de token em andamento, aba retomando do bfcache, storage ainda
 * não hidratado). Ejetar a pessoa para a tela de login nesse instante é o que
 * a proprietária percebe como "logout automático". Só consideramos a sessão
 * ausente depois de releituras consecutivas negativas.
 */

export type LeituraSessao = () => Promise<boolean>;

export async function sessaoAusenteConfirmada(
  temSessao: LeituraSessao,
  opcoes: { tentativas?: number; esperaMs?: number; dormir?: (ms: number) => Promise<void> } = {},
): Promise<boolean> {
  const tentativas = opcoes.tentativas ?? 3;
  const esperaMs = opcoes.esperaMs ?? 400;
  const dormir = opcoes.dormir ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  for (let i = 0; i < tentativas; i += 1) {
    let presente = false;
    try {
      presente = await temSessao();
    } catch {
      // Falha de leitura não é ausência de sessão.
      presente = true;
    }
    if (presente) return false;
    if (i < tentativas - 1) await dormir(esperaMs);
  }
  return true;
}

/** Eventos de autenticação que realmente exigem reavaliar rota e cache. */
export function ehTransicaoDeIdentidade(evento: string): boolean {
  return evento === "SIGNED_IN" || evento === "SIGNED_OUT" || evento === "USER_UPDATED";
}
