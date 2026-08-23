/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo } from "@/components/comercial/base";
import { BloqueioEmissaoOS } from "@/components/contrato/bloqueio-emissao-os";
import {
  aprovarPropostaCadeia,
  emitirOSCadeia,
  gerarPropostaEstruturada,
  lerCadeiaOperacional,
} from "@/lib/cadeia-operacional.functions";

const TOM: Record<string, "ok" | "alerta" | "erro"> = { ok: "ok", pendente: "alerta", bloqueado: "erro" };
const ROTULO: Record<string, string> = {
  ok: "Cumprido",
  pendente: "Pendente",
  bloqueado: "Bloqueado pelo elo anterior",
};

/**
 * Cadeia única: PLANEJADOR → PROPOSTA → SKU/PREÇO → CONDIÇÃO COMERCIAL →
 * OS/ANEXO I → PRÉVIA → REVISÃO HUMANA → ASSINATURA (desabilitada).
 * Painel de leitura + ações internas idempotentes. Nada externo é executado.
 */
export function CadeiaOperacional({ caseId, podeEscrever }: { caseId: string; podeEscrever: boolean }) {
  const qc = useQueryClient();
  const chave = ["cadeia-operacional", caseId];
  const ler = useServerFn(lerCadeiaOperacional);
  const gerar = useServerFn(gerarPropostaEstruturada);
  const aprovar = useServerFn(aprovarPropostaCadeia);
  const emitir = useServerFn(emitirOSCadeia);

  const q = useQuery({ queryKey: chave, queryFn: () => ler({ data: { caseId } }), retry: false });
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: chave });
    qc.invalidateQueries({ queryKey: ["contrato-preparar", caseId] });
  };

  const mGerar = useMutation({
    mutationFn: () =>
      gerar({ data: { caseId, responsavelComercial: "Comercial responsável", responsavelOperacional: "Operações responsável" } }),
    onSuccess: (r: any) => {
      toast.success(r.idempotente ? "Proposta já refletia o planejador vigente." : `Proposta estruturada v${r.versao} derivada do planejador.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mAprovar = useMutation({
    mutationFn: (proposalId: string) => aprovar({ data: { proposalId } }),
    onSuccess: (r: any) => {
      toast.success(
        r.pendencias.length
          ? `Condição comercial registrada com pendência: ${r.pendencias[0]}`
          : "Proposta aprovada e condição comercial persistida.",
      );
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mEmitir = useMutation({
    mutationFn: (proposalId: string) => emitir({ data: { proposalId } }),
    onSuccess: (r: any) => {
      toast.success(r.idempotente ? "OS/Anexo I já vigente para este conteúdo." : `OS/Anexo I v${r.versao} emitida em rascunho.`);
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <Painel titulo="Cadeia operacional">
        <p className="text-sm text-navy/60">Carregando cadeia…</p>
      </Painel>
    );
  }

  if (q.isError) {
    return (
      <Painel titulo="Cadeia operacional">
        <p className="text-sm text-terracotta">{(q.error as Error).message}</p>
      </Painel>
    );
  }

  const d = q.data as any;
  const proposalId = d?.proposta?.id ?? null;
  const statusProposta = d?.proposta?.status ?? null;
  const ocupado = mGerar.isPending || mAprovar.isPending || mEmitir.isPending;

  return (
    <Painel titulo="Cadeia operacional">
      <div className="mb-2">
        <Selo texto={d.versao} tom="neutro" />
      </div>
      <p className="text-xs text-navy/60">
        Fluxo único do caso {d.caso.codigo}. Cada elo mostra a fonte real do dado, a versão vigente e o motivo do bloqueio.
        Nenhuma cobrança, assinatura, comunicação ou pesquisa externa é executada aqui.
      </p>

      <ol className="mt-3 space-y-2">
        {d.elos.map((e: any, i: number) => (
          <li key={e.chave} className="rounded-md border border-navy/10 bg-cream/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-navy">
                {i + 1}. {e.titulo}
              </span>
              <Selo texto={ROTULO[e.estado] ?? e.estado} tom={TOM[e.estado] ?? "neutro"} />
            </div>
            <p className="mt-1 text-xs text-navy/60">
              Entrada: {e.entrada} · Saída: {e.saida}
              {e.fonte ? ` · Fonte: ${e.fonte}` : ""}
              {e.versao ? ` · Versão: ${e.versao}` : ""}
            </p>
            {e.motivos.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-xs text-terracotta">
                {e.motivos.slice(0, 4).map((m: string) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {podeEscrever && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={ocupado}
            onClick={() => mGerar.mutate()}
            className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
          >
            Derivar proposta do planejador
          </button>
          <button
            type="button"
            disabled={ocupado || !proposalId || statusProposta === "aprovada"}
            onClick={() => proposalId && mAprovar.mutate(proposalId)}
            className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
          >
            Aprovar proposta e registrar condição
          </button>
          <button
            type="button"
            disabled={ocupado || !proposalId || statusProposta !== "aprovada"}
            onClick={() => proposalId && mEmitir.mutate(proposalId)}
            className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5 disabled:opacity-50"
          >
            Emitir OS / Anexo I (rascunho)
          </button>
          <span className="self-center text-xs text-navy/50">Assinatura permanece desabilitada nesta entrega.</span>
        </div>
      )}
    </Painel>
  );
}
