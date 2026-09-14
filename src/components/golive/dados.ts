import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

import { carregarGoLive, type DadosGoLive } from "@/lib/golive.functions";

export function useGoLive() {
  const carregar = useServerFn(carregarGoLive);
  return useQuery<DadosGoLive>({
    queryKey: ["go-live", "caso-canonico"],
    queryFn: () => carregar({}),
  });
}
