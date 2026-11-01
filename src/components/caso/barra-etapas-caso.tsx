import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lerEtapasCaso } from "@/lib/casos-ativacao.functions";
import { ROTULO_ESTADO_ETAPA, type EstadoEtapa } from "@/lib/etapas-caso";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_ESPECIALISTA } from "@/lib/contato-especialista";
import { Button } from "@/components/ui/button";
import { KitBadge } from "@/components/clube-ancestral-kit";

const SELO: Record<EstadoEtapa, string> = {
  concluido: "border-gold bg-gold/15 text-navy",
  andamento: "border-navy/30 bg-cream text-navy",
  aguardando: "border-navy/15 bg-card text-navy/60",
};

/** Barra somente leitura das 5 etapas do caso, a partir das verificações existentes. */
export function BarraEtapasCaso({ caseId, aoAbrirSecao, layout = "faixa" }: { caseId: string; aoAbrirSecao: (secao: string) => void; layout?: "faixa" | "coluna" }) {
  const ler = useServerFn(lerEtapasCaso);
  const q = useQuery({ queryKey: ["etapas-caso", caseId], queryFn: () => ler({ data: { caseId } }) });
  // 13/10/2026 — previsão da condição comercial do caso amarrada à etapa Financeiro (leitura; não entra no saldo).
  const qCond = useQuery({
    queryKey: ["etapas-caso", "condicao", caseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("commercial_conditions")
        .select("valor_total_referencia,status")
        .eq("case_id", caseId)
        .is("archived_at", null)
        .eq("dados_teste", false)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
  const previsao =
    qCond.data?.valor_total_referencia != null
      ? `Previsão ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(qCond.data.valor_total_referencia))} · sem cobrança`
      : null;

  if (q.isLoading) return <p className="text-sm text-navy/60">Carregando etapas do caso…</p>;
  if (q.error || !q.data)
    return (
      <p className="text-sm text-terracotta">
        Não foi possível ler as etapas agora.{" "}
        <button type="button" className="underline" onClick={() => void q.refetch()}>Tentar novamente</button>
      </p>
    );

  return (
    <section aria-label="Etapas do caso" className="overflow-hidden rounded-lg border border-navy/15 bg-card p-4">
      <div className={layout === "coluna" ? "-mx-4 -mt-4 bg-navy px-4 py-3" : "flex flex-wrap items-center justify-between gap-2"}><h2 className={`font-serif text-lg ${layout === "coluna" ? "text-cream" : "text-navy"}`}>Etapas do caso</h2>{layout !== "coluna" ? <Button asChild variant="outline" className="min-h-11 whitespace-normal text-xs"><a href={WHATSAPP_ESPECIALISTA.url} target="_blank" rel="noopener noreferrer">WhatsApp da especialista · {WHATSAPP_ESPECIALISTA.rotulo}</a></Button> : null}</div>
      <ol className={layout === "coluna" ? "mt-3 grid grid-cols-1 gap-2" : "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5"}>
        {q.data.map((e, i) => (
          <li key={e.id}>
            <Button
              variant="outline"
              type="button"
              onClick={() => aoAbrirSecao(e.secao)}
              className={`flex h-auto min-h-11 w-full flex-col items-start gap-1 whitespace-normal rounded-md border px-3 py-2 text-left ${SELO[e.estado]}`}
            >
              <span className="text-xs text-navy/60">{i + 1}. {e.rotulo}</span>
              <span className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10" aria-hidden="true">
                <span className="block h-full bg-gold" style={{ width: `${(e.feitos / e.total) * 100}%` }} />
              </span>
              <span className="text-xs font-medium">
                {ROTULO_ESTADO_ETAPA[e.estado]} · {e.feitos}/{e.total}
              </span>
              {layout !== "coluna" && e.id === "financeiro" && previsao ? (
                <span className="text-[11px] text-navy/70" data-previsao-financeira>{previsao}</span>
              ) : null}
            </Button>
          </li>
        ))}
      </ol>
      {layout === "coluna" ? (
        <div className="mt-4 border-t border-navy/10 pt-3" data-caso360-previsao-rascunho>
          <h3 className="font-serif text-lg text-navy">Previsão financeira</h3>
          <div className="mt-2"><KitBadge tone="gold">Previsão · rascunho</KitBadge></div>
          <p className="mt-2 text-sm font-medium text-navy" data-previsao-financeira>{qCond.isPending ? "Carregando condição do caso…" : qCond.isError ? "Não foi possível ler a condição do caso." : previsao ?? "Condição financeira não registrada"}</p>
          <p className="mt-2 text-xs leading-relaxed text-navy/65">Não representa saldo, cobrança ou pagamento confirmado.</p>
          <Button asChild variant="outline" className="mt-3 min-h-11 w-full whitespace-normal text-xs"><a href={WHATSAPP_ESPECIALISTA.url} target="_blank" rel="noopener noreferrer">WhatsApp · {WHATSAPP_ESPECIALISTA.rotulo}</a></Button>
        </div>
      ) : null}
    </section>
  );
}
