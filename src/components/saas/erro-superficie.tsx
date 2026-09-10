import { SaasShell } from "@/components/saas/shell";

/** Erro de uma tela do Desk: o menu permanece, a aba não some do ar. */
export function ErroSuperficieDesk({
  error,
  reset,
  titulo = "Esta tela não carregou",
}: {
  error: Error;
  reset: () => void;
  titulo?: string;
}) {
  return (
    <SaasShell
      titulo={titulo}
      descricao="O Desk continua no ar. Abra outra aba ou tente de novo nesta."
    >
      <p
        role="alert"
        className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
      >
        {error.message?.trim() || "Falha ao abrir esta tela."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream hover:bg-navy/90"
      >
        Tentar novamente
      </button>
    </SaasShell>
  );
}
