import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { listarRegistros } from "@/lib/saas.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { MatrizPrioridades } from "@/components/desk/matriz-prioridades";

/**
 * Liga a matriz aos casos reais.
 *
 * Alimenta o motor com os MESMOS campos que a lista de Casos 360 já usa, para
 * a matriz e a coluna de prioridade nunca discordarem. Registro demonstrativo
 * entra classificado como tal, e o motor decide o que fazer com isso.
 */
export function MatrizPrioridadesConectada() {
  const carregar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => carregar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });

  const casos = useMemo(() => {
    const linhas = (q.data ?? []) as Record<string, unknown>[];
    return linhas.map((l) =>
      posicionar({
        tipo: "caso",
        id: String(l["id"]),
        rotulo: String(l["codigo"] ?? l["titulo"] ?? l["id"]),
        elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
        prazo: (l["prazo_proxima_acao"] as string) ?? null,
        diasSemTouchpoint: (l["dias_sem_touchpoint"] as number) ?? null,
        esperaExternaAtiva: !!l["aguardando_instituicao_externa"],
        responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
        origem: papelDoRegistro(l).valor === "demo" ? "demo" : "real",
      }),
    );
  }, [q.data]);

  if (q.isLoading) return <p className="text-sm text-navy/50">Carregando matriz de prioridades…</p>;
  if (q.isError) {
    // Sem fonte, a matriz não desenha nada: quadrante vazio por falha de
    // leitura seria lido como "não há ninguém aqui".
    return (
      <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta">
        A matriz de prioridades não pôde ser lida agora. Nenhum quadrante é exibido, para não
        parecer que a carteira está vazia.
      </p>
    );
  }

  return <MatrizPrioridades casos={casos} />;
}
