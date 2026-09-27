/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { BloqueioEmissaoOS } from "@/components/contrato/bloqueio-emissao-os";
import { carregarCadeiaFormalizacao, derivarAnexoIDaProposta } from "@/lib/cadeia-formalizacao.functions";

const TOM: Record<string, "ok" | "alerta" | "erro"> = {
  ok: "ok",
  pendente: "alerta",
  bloqueado: "erro",
};

const ROTULO_ESTADO: Record<string, string> = {
  ok: "Cumprido",
  pendente: "Pendente",
  bloqueado: "Bloqueado pelo elo anterior",
};

/**
 * `governadoPeloPlanejador` (Resgate Ana, 27/09/2026): caso governado por
 * Planejador + proposta Canva nunca mostra a conciliação de catálogo como
 * bloqueio de OS — o Anexo I/OS nasce da proposta Canva aprovada.
 */
export function CadeiaFormalizacao({
  caseId,
  podeEscrever,
  governadoPeloPlanejador = false,
}: {
  caseId: string;
  podeEscrever: boolean;
  governadoPeloPlanejador?: boolean;
}) {
  const qc = useQueryClient();
  const carregar = useServerFn(carregarCadeiaFormalizacao);
  const derivar = useServerFn(derivarAnexoIDaProposta);
  const chave = ["cadeia-formalizacao", caseId];

  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { caseId } }), retry: false });

  const mDerivar = useMutation({
    mutationFn: () => derivar({ data: { caseId } }),
    onSuccess: (r: any) => {
      toast.success(`Anexo I derivado da proposta aprovada: ${r.itens} item(ns) registrados.`);
      qc.invalidateQueries({ queryKey: chave });
      qc.invalidateQueries({ queryKey: ["contrato-preparar", caseId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <CaCard variante="compacto" titulo="Cadeia de formalização">
        <p className="text-sm text-navy/60">Avaliando a cadeia…</p>
      </CaCard>
    );
  }
  if (q.error || !q.data) {
    return (
      <CaCard variante="compacto" titulo="Cadeia de formalização">
        <p className="text-sm text-terracotta">{(q.error as Error)?.message ?? "Cadeia indisponível para este caso."}</p>
      </CaCard>
    );
  }

  const d = q.data as any;
  const contagem = {
    inclusao: d.derivacao.itens.filter((i: any) => i.tipo === "inclusao").length,
    exclusao: d.derivacao.itens.filter((i: any) => i.tipo === "exclusao").length,
    entrega: d.derivacao.itens.filter((i: any) => i.tipo === "entrega").length,
  };

  return (
    <CaCard variante="compacto" titulo={`Cadeia de formalização — proposta/OS aprovada até assinatura (${d.versao})`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Selo texto={`Próximo elo: ${d.proximoElo ?? "nenhum pendente"}`} tom={d.proximoElo ? "alerta" : "ok"} />
        <Selo texto={d.assinaturaLiberada ? "Assinatura liberada pelos elos" : "Assinatura bloqueada"} tom={d.assinaturaLiberada ? "ok" : "erro"} />
        <Selo texto={`Derivados: ${contagem.inclusao} inclusões · ${contagem.exclusao} exclusões · ${contagem.entrega} entregas`} tom="neutro" />
      </div>

      <ol className="mt-3 space-y-2">
        {d.elos.map((elo: any) => (
          <li key={elo.chave} className="rounded border border-navy/10 bg-cream/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-navy">
                {elo.ordem}. {elo.titulo}
              </p>
              <Selo texto={ROTULO_ESTADO[elo.estado]} tom={TOM[elo.estado]} />
            </div>
            {elo.motivos.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-terracotta">
                {elo.motivos.slice(0, 6).map((m: string, i: number) => (
                  <li key={i}>{m}</li>
                ))}
                {elo.motivos.length > 6 && <li>+{elo.motivos.length - 6} motivo(s) registrados.</li>}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {d.vencimentos.length > 0 && (
        <p className="mt-3 text-xs text-navy/70">
          <strong>Vencimentos calculados dos campos declarados:</strong> {d.vencimentos.join(" · ")}
        </p>
      )}

      {d.derivacao.faltantes.length > 0 && (
        <p className="mt-3 text-xs text-terracotta">
          Campos não declarados na proposta (o motor não infere):{" "}
          {d.derivacao.faltantes.map((f: any) => f.label).join(", ")}.
        </p>
      )}

      {d.derivacao.itens.length > 0 && (
        <div className="mt-3 space-y-1 text-xs text-navy/80">
          {d.derivacao.itens.slice(0, 12).map((i: any, idx: number) => (
            <p key={idx}>
              <strong>{i.tipo}:</strong> {i.texto}{" "}
              <span className="text-navy/50">[proposta · páginas {i.paginas.join(", ")}]</span>
            </p>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={mDerivar.isPending}
          onClick={() => mDerivar.mutate()}
          className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
        >
          {mDerivar.isPending ? "Derivando…" : "Derivar Anexo I da proposta aprovada"}
        </button>
        <span className="text-xs text-navy/60">
          Derivação grava apenas o que a proposta declara. Nenhuma assinatura, cobrança, pesquisa externa ou comunicação é
          executada aqui.
        </span>
      </div>

      {governadoPeloPlanejador ? (
        <p className="mt-3 text-xs text-navy/60" data-os-governada-planejador>
          Anexo I/OS preparado a partir da proposta Canva aprovada e do Planejador — sem SKU técnico nem catálogo como gate.
        </p>
      ) : (
        <BloqueioEmissaoOS proposalId={d.proposta?.id ?? null} ativo={d.proposta?.status === "aprovada"} />
      )}
    </CaCard>
  );
}
