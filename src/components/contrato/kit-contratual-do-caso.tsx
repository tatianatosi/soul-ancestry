import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { KitContratual } from "@/components/kit-contratual";
import { kitContratualDoCasoFn } from "@/lib/kit-contratual.functions";

/** Kit Contratual lido do banco para o caso aberto (somente leitura). */
export function KitContratualDoCaso({ casoId }: { casoId: string | undefined }) {
  const ler = useServerFn(kitContratualDoCasoFn);
  const q = useQuery({
    queryKey: ["kit-contratual", casoId],
    queryFn: () => ler({ data: { caseId: casoId as string } }),
    enabled: Boolean(casoId),
    retry: false,
  });

  if (!casoId || q.isLoading) {
    return <p className="text-[12px] text-navy/60">Carregando o kit contratual do caso…</p>;
  }
  if (q.error || !q.data) {
    return (
      <p role="alert" className="text-[12px] text-terracotta" data-kit-erro>
        Não foi possível ler o kit contratual deste caso agora
        {q.error instanceof Error ? `: ${q.error.message}` : ""}.{" "}
        <button type="button" className="underline" onClick={() => void q.refetch()}>
          Tentar novamente
        </button>
      </p>
    );
  }
  return <KitContratual caso={q.data} />;
}
