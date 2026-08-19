import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { listarPaginasCanva, salvarPaginaCanva } from "@/lib/crm-desk.functions";

const PAGINAS = [1, 2, 3, 4, 5, 6, 7];

const STATUS = [
  { valor: "pendente", rotulo: "Pendente" },
  { valor: "em_extracao", rotulo: "Em extração" },
  { valor: "extraida", rotulo: "Extraída" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

/**
 * Completude da proposta Canva: registra a extração das páginas 1–7.
 * Nenhum campo é inventado — o que não foi localizado é declarado como pendência.
 */
export function CompletudeCanva({
  caseId,
  proposalId,
  podeEscrever,
}: {
  caseId: string;
  proposalId: string | null;
  podeEscrever: boolean;
}) {
  const carregar = useServerFn(listarPaginasCanva);
  const salvar = useServerFn(salvarPaginaCanva);
  const qc = useQueryClient();
  const [rascunho, setRascunho] = useState<Record<number, { status?: string; nao_localizados?: string; observacao?: string }>>({});

  const q = useQuery({
    queryKey: ["canva-paginas", proposalId],
    queryFn: () => carregar({ data: { proposalId: String(proposalId) } }),
    enabled: Boolean(proposalId),
    retry: false,
  });

  const mut = useMutation({
    mutationFn: (p: Parameters<typeof salvarPaginaCanva>[0]["data"]) => salvar({ data: p }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["canva-paginas", proposalId] }),
  });

  if (!proposalId) {
    return (
      <Secao titulo="Completude da proposta Canva" descricao="Fonte obrigatória de escopo: páginas 1 a 7.">
        <p className="text-sm text-navy/60">Caso sem proposta vinculada: extração indisponível.</p>
      </Secao>
    );
  }

  const registros = (q.data ?? []) as Record<string, unknown>[];
  const porPagina = new Map(registros.map((r) => [Number(r.page_number), r]));
  const pendentes = PAGINAS.filter((p) => porPagina.get(p)?.extracao_status !== "extraida");

  return (
    <Secao
      titulo="Completude da proposta Canva"
      descricao={
        pendentes.length
          ? `Páginas sem extração concluída: ${pendentes.join(", ")}. Geração de contrato e anexos permanece bloqueada.`
          : "Todas as páginas 1–7 extraídas."
      }
    >
      <div className="space-y-3">
        {PAGINAS.map((p) => {
          const r = porPagina.get(p);
          const d = rascunho[p] ?? {};
          const naoLocalizados = ((r?.campos_nao_localizados as string[]) ?? []).join(", ");
          return (
            <div key={p} className="rounded-lg border border-navy/10 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-navy/50">
                Página {p} · {String(r?.extracao_status ?? "sem registro")}
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <Selecao
                  label="Status da extração"
                  valor={d.status ?? String(r?.extracao_status ?? "")}
                  opcoes={STATUS}
                  onChange={(v) => setRascunho((s) => ({ ...s, [p]: { ...s[p], status: v } }))}
                  desabilitado={!podeEscrever}
                />
                <Texto
                  label="Campos não localizados"
                  valor={d.nao_localizados ?? naoLocalizados}
                  onChange={(v) => setRascunho((s) => ({ ...s, [p]: { ...s[p], nao_localizados: v } }))}
                  ajuda="Separe por vírgula. Cada item vira pendência, nunca valor presumido."
                  desabilitado={!podeEscrever}
                />
                <Texto
                  label="Observação interna"
                  valor={d.observacao ?? String(r?.observacao_interna ?? "")}
                  onChange={(v) => setRascunho((s) => ({ ...s, [p]: { ...s[p], observacao: v } }))}
                  desabilitado={!podeEscrever}
                />
              </div>
              {podeEscrever ? (
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
                  onClick={() =>
                    mut.mutate({
                      proposalId,
                      caseId,
                      page_number: p,
                      extracao_status: d.status ?? String(r?.extracao_status ?? "pendente"),
                      page_content_structured: (r?.page_content_structured as Record<string, unknown>) ?? {},
                      campos_nao_localizados: (d.nao_localizados ?? naoLocalizados)
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                      observacao_interna: d.observacao ?? (r?.observacao_interna as string) ?? null,
                    })
                  }
                >
                  Registrar página {p}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </Secao>
  );
}
