import { RefreshCw } from "lucide-react";

/** Aviso único de falha de conexão no App Cliente — nunca confundido com vazio. */
export function AvisoFalhaConexao({
  mensagem,
  rotuloBotao = "Tentar novamente",
  aoTentar,
  ocupado = false,
}: {
  mensagem: string;
  rotuloBotao?: string;
  aoTentar: () => void;
  ocupado?: boolean;
}) {
  return (
    <div
      role="alert"
      data-aviso-falha-conexao
      className="flex flex-wrap items-center gap-3 rounded-xl border border-terracotta/40 bg-cream px-4 py-3 text-sm text-terracotta"
    >
      <p className="min-w-0 flex-1 !text-terracotta">{mensagem}</p>
      <button
        type="button"
        onClick={aoTentar}
        disabled={ocupado}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-terracotta/50 px-3 py-1.5 text-xs font-medium text-terracotta disabled:opacity-60"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        {rotuloBotao}
      </button>
    </div>
  );
}
