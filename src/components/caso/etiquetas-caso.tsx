import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao } from "@/components/caso/campos";
import { aplicarEtiqueta, removerEtiqueta } from "@/lib/caso-canonico.functions";

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const CATEGORIAS: Record<string, string> = {
  origem: "Origem",
  contato: "Contato",
  descoberta: "Descoberta",
  comercial: "Comercial",
  formalizacao: "Formalização",
  onboarding: "Onboarding",
  pesquisa: "Pesquisa",
  trilha: "Trilha técnica",
  risco: "Risco",
  governanca: "Governança",
};

/** Aplicação de etiquetas apenas a partir da taxonomia canônica. */
export function AbaEtiquetas({
  caseId,
  taxonomia,
  aplicadas,
  bloqueado: _bloqueado,
  onMudou,
}: {
  caseId: string;
  taxonomia: Linha[];
  aplicadas: Linha[];
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: a decisão de escrita é da autoridade operacional.
   */
  bloqueado?: boolean;
  onMudou: () => void;
}) {
  const aplicar = useServerFn(aplicarEtiqueta);
  const remover = useServerFn(removerEtiqueta);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const porId = useMemo(() => new Map(taxonomia.map((t) => [String(t.id), t])), [taxonomia]);
  const aplicadasPorLabel = useMemo(() => new Map(aplicadas.map((a) => [String(a.label_id), a])), [aplicadas]);

  const grupos = useMemo(() => {
    const filtro = busca.trim().toLowerCase();
    const mapa = new Map<string, Linha[]>();
    for (const l of taxonomia) {
      if (filtro && !`${l.name} ${l.code} ${l.meta_agent_equivalent ?? ""}`.toLowerCase().includes(filtro)) continue;
      const cat = String(l.category ?? "outros");
      const atual = mapa.get(cat);
      mapa.set(cat, atual ? [...atual, l] : [l]);
    }
    return [...mapa.entries()];
  }, [taxonomia, busca]);

  const mAplicar = useMutation({
    mutationFn: (labelId: string) => aplicar({ data: { entityType: "case", entityId: caseId, labelId } }),
    onSuccess: () => {
      setErro(null);
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao aplicar etiqueta."),
  });
  const mRemover = useMutation({
    mutationFn: (id: string) => remover({ data: { id } }),
    onSuccess: () => onMudou(),
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao remover etiqueta."),
  });

  return (
    <div className="space-y-5">
      {erro ? <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-navy">{erro}</p> : null}

      <Secao titulo="Etiquetas aplicadas ao caso" descricao="Somente etiquetas da taxonomia canônica. Remoção fica registrada, sem exclusão física.">
        {aplicadas.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhuma etiqueta aplicada.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aplicadas.map((a) => {
              const l = porId.get(String(a.label_id));
              return (
                <span key={a.id} className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/15 px-3 py-1 text-xs text-navy">
                  {l?.name ?? a.label_id}
                  <button className="text-navy/50 hover:text-terracotta" onClick={() => mRemover.mutate(String(a.id))} aria-label="Remover etiqueta">
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </Secao>

      <Secao titulo="Taxonomia canônica" descricao="Equivalente ao agente do WhatsApp; a fonte canônica é sempre o Desk.">
        <input
          className="mb-4 w-full max-w-sm rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold"
          placeholder="Buscar etiqueta…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="space-y-5">
          {grupos.map(([cat, itens]) => (
            <div key={cat}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">{CATEGORIAS[cat] ?? cat}</p>
              <div className="flex flex-wrap gap-2">
                {itens.map((l) => {
                  const ativa = aplicadasPorLabel.get(String(l.id));
                  return (
                    <button
                      key={String(l.id)}
                      type="button"
                      title={l.meta_agent_equivalent ? `Meta Agent: ${l.meta_agent_equivalent}` : undefined}
                      onClick={() => (ativa ? mRemover.mutate(String(ativa.id)) : mAplicar.mutate(String(l.id)))}
                      className={
                        "rounded-full border px-3 py-1 text-xs transition-colors " +
                        (ativa ? "border-gold bg-gold/20 text-navy" : "border-navy/15 text-navy/60 hover:bg-navy/5")
                      }
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Secao>
    </div>
  );
}
