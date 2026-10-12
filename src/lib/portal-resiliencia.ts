export const PORTAL_TIMEOUT_MS = 15_000;

export class PortalTimeoutError extends Error {
  constructor() {
    super("A conexão demorou mais do que o esperado.");
    this.name = "PortalTimeoutError";
  }
}

/** Encerra uma operação do App sem transformar demora de rede em estado vazio. */
export function comTimeoutPortal<T>(operacao: Promise<T>, limiteMs = PORTAL_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const temporizador = globalThis.setTimeout(() => reject(new PortalTimeoutError()), limiteMs);
    operacao.then(
      (resultado) => {
        globalThis.clearTimeout(temporizador);
        resolve(resultado);
      },
      (erro) => {
        globalThis.clearTimeout(temporizador);
        reject(erro);
      },
    );
  });
}