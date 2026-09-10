import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

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
 * Campos por página, exatamente como mapeados em
 * docs/AUDITORIA_PROPOSTA_CANVA_ANA_v1.0.md (matriz campo a campo, §2) —
 * não um texto livre único por página. Cada campo aqui é o que a auditoria
 * já identificou como parâmetro de destino real (contrato/anexo); ler e
 * aplicar o desenho existente, não inventar um novo.
 */
const CAMPOS_POR_PAGINA: Record<number, { chave: string; label: string; area?: boolean }[]> = {
  1: [
    { chave: "proposta_referencia", label: "Referência da proposta e versão" },
    { chave: "caso_contexto", label: "Caso, núcleo e país/rota", area: true },
  ],
  2: [{ chave: "processos_participantes", label: "Participantes e processos incluídos", area: true }],
  3: [
    { chave: "escopo_macro", label: "Escopo macro (resumo do que está incluso)", area: true },
    { chave: "servicos_incluidos", label: "Serviços incluídos", area: true },
    { chave: "servicos_excluidos", label: "Serviços excluídos", area: true },
  ],
  4: [
    { chave: "escopos_individuais", label: "Escopo individual por participante", area: true },
    { chave: "composicao_familiar", label: "Composição familiar / vínculo", area: true },
  ],
  5: [
    { chave: "responsabilidades", label: "Responsabilidades por processo / representação legal", area: true },
    { chave: "entregas_jornada", label: "Fases de entrega e prazos de referência", area: true },
  ],
  6: [
    { chave: "valor_total", label: "Valor total" },
    { chave: "forma_pagamento", label: "Forma de pagamento" },
    { chave: "parcelas", label: "Parcelas e vencimentos" },
    { chave: "responsaveis_financeiros", label: "Responsáveis financeiros" },
  ],
  7: [
    { chave: "despesas_externas", label: "Despesas externas (regra)", area: true },
    { chave: "prazo_validade", label: "Prazo de validade da proposta" },
    { chave: "proximos_passos", label: "Próximos passos", area: true },
  ],
};

type Rascunho = { status?: string; campos?: Record<string, string>; nao_localizados?: string; observacao?: string };

/**
 * Completude da proposta Canva: registra a extração das páginas 1–7,
 * campo a campo (não um blob de texto), seguindo a matriz já desenhada em
 * docs/AUDITORIA_PROPOSTA_CANVA_ANA_v1.0.md. Nenhum campo é inventado — o
 * que não foi localizado é declarado como pendência.
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
  const [rascunho, setRascunho] = useState<Record<number, Rascunho>>({});

  const q = useQuery({
    queryKey: ["canva-paginas", proposalId],
    queryFn: () => carregar({ data: { proposalId: String(proposalId) } }),
    enabled: Boolean(proposalId),
    retry: false,
  });

  const mut = useMutation({
    mutationFn: (p: Parameters<typeof salvarPaginaCanva>[0]["data"]) => salvar({ data: p }),
    onSuccess: (_r, variaveis) => {
      toast.success(`Página ${variaveis.page_number} registrada.`);
      setRascunho((s) => {
        const { [variaveis.page_number]: _descartado, ...resto } = s;
        return resto;
      });
      void qc.invalidateQueries({ queryKey: ["canva-paginas", proposalId] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível registrar a página."),
  });

  if (!proposalId) {
    return (
      <Secao titulo="Completude da proposta Canva" descricao="Fonte obrigatória de escopo: páginas 1 a 7.">
        <p className="text-sm text-navy/60">Caso sem proposta vinculada: extração indisponível.</p>
      </Secao>
    );
  }

  const registros = (q.data ?? []) as Record<string, unknown>[];
  const leituraFalhou = Boolean(q.error);
  const porPagina = new Map(registros.map((r) => [Number(r.page_number), r]));
  const pendentes = PAGINAS.filter((p) => porPagina.get(p)?.extracao_status !== "extraida");

  return (
    <Secao
      titulo="Completude da proposta Canva"
      descricao={
        pendentes.length
          ? `Páginas sem extração concluída: ${pendentes.join(", ")}. Contrato e anexos ficam como pendência até as páginas extraídas.`
          : "Todas as páginas 1–7 extraídas."
      }
    >
      {!podeEscrever ? (
        <p className="mb-3 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: contexto de acesso ainda não confirmado — a gravação é revalidada no servidor.
        </p>
      ) : null}
      <div className="space-y-3">
        {leituraFalhou ? (
          <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-terracotta">
            Não foi possível ler as páginas já extraídas. O que aparece como pendente pode estar registrado.
            <button
              type="button"
              onClick={() => void q.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-0.5 text-xs font-medium"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}
        {PAGINAS.map((p) => {
          const r = porPagina.get(p);
          const d = rascunho[p] ?? {};
          const naoLocalizados = ((r?.campos_nao_localizados as string[]) ?? []).join(", ");
          const camposSalvos = (r?.page_content_structured as Record<string, string>) ?? {};
          const camposDaPagina = CAMPOS_POR_PAGINA[p] ?? [];
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
                />
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {camposDaPagina.map((c) => (
                  <Texto
                    key={c.chave}
                    label={c.label}
                    valor={d.campos?.[c.chave] ?? camposSalvos[c.chave] ?? ""}
                    onChange={(v) =>
                      setRascunho((s) => ({
                        ...s,
                        [p]: { ...s[p], campos: { ...s[p]?.campos, [c.chave]: v } },
                      }))
                    }
                    area={c.area}
                  />
                ))}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <Texto
                  label="Campos não localizados"
                  valor={d.nao_localizados ?? naoLocalizados}
                  onChange={(v) => setRascunho((s) => ({ ...s, [p]: { ...s[p], nao_localizados: v } }))}
                  ajuda="Separe por vírgula. Cada item vira pendência, nunca valor presumido."
                />
                <Texto
                  label="Observação interna"
                  valor={d.observacao ?? String(r?.observacao_interna ?? "")}
                  onChange={(v) => setRascunho((s) => ({ ...s, [p]: { ...s[p], observacao: v } }))}
                />
              </div>
              <button
                type="button"
                disabled={mut.isPending && mut.variables?.page_number === p}
                className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
                onClick={() =>
                  mut.mutate({
                    proposalId,
                    caseId,
                    page_number: p,
                    extracao_status: d.status ?? String(r?.extracao_status ?? "pendente"),
                    page_content_structured: { ...camposSalvos, ...(d.campos ?? {}) },
                    campos_nao_localizados: (d.nao_localizados ?? naoLocalizados)
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                    observacao_interna: d.observacao ?? (r?.observacao_interna as string) ?? null,
                  })
                }
              >
                {mut.isPending && mut.variables?.page_number === p ? "Registrando…" : `Registrar página ${p}`}
              </button>
            </div>
          );
        })}
      </div>
    </Secao>
  );
}
