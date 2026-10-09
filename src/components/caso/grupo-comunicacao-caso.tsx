/**
 * §5 do "Prompt de Implantação — Política Unificada de Casos Familiares"
 * (21/09/2026): registro do grupo familiar/WhatsApp no Caso 360. Só
 * registra existência/propósito/status — nunca cria nem integra nada no
 * WhatsApp real. A criação externa é feita pela proprietária quando
 * decidir; o campo "Link do grupo" é preenchido manualmente por ela
 * depois de criar o grupo de verdade.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

import {
  atualizarGrupoComunicacaoCaso,
  listarGruposComunicacaoCaso,
  registrarGrupoComunicacaoCaso,
} from "@/lib/caso-canonico.functions";

const ROTULO_STATUS: Record<string, string> = {
  planejado: "Planejado",
  ativo: "Ativo",
  arquivado: "Arquivado",
};

const ESTILO_STATUS: Record<string, string> = {
  planejado: "border-navy/20 bg-cream/40 text-navy/70",
  ativo: "border-gold/50 bg-gold/10 text-navy/80",
  arquivado: "border-navy/10 bg-cream/30 text-navy/55",
};

export function GrupoComunicacaoCaso({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const carregar = useServerFn(listarGruposComunicacaoCaso);
  const registrar = useServerFn(registrarGrupoComunicacaoCaso);
  const atualizar = useServerFn(atualizarGrupoComunicacaoCaso);

  const q = useQuery({
    queryKey: ["grupos-comunicacao-caso", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  const [proposito, setProposito] = useState("");
  const [novoLink, setNovoLink] = useState<Record<string, string>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    proposito.trim() !== "" ||
      Object.values(novoLink).some((v) => String(v ?? "").trim() !== ""),
  );

  const mRegistrar = useMutation({
    mutationFn: () => registrar({ data: { caseId, proposito: proposito.trim() } }),
    onSuccess: () => {
      setProposito("");
      toast.success("Grupo registrado como planejado. A criação real no WhatsApp é feita por fora.");
      void qc.invalidateQueries({ queryKey: ["grupos-comunicacao-caso", caseId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mAtualizar = useMutation({
    mutationFn: (v: { id: string; status?: "planejado" | "ativo" | "arquivado"; referenciaExterna?: string }) =>
      atualizar({ data: { caseId, ...v } }),
    onSuccess: () => {
      toast.success("Grupo atualizado.");
      void qc.invalidateQueries({ queryKey: ["grupos-comunicacao-caso", caseId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grupos = (q.data?.grupos ?? []) as Record<string, unknown>[];

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Grupo familiar / WhatsApp</h3>
        <span className="text-[11px] text-navy/55">Canal de coordenação · não substitui contrato, App ou Desk</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Registra a existência e o propósito de um grupo, sem criar nem integrar nada no WhatsApp real.
        A criação do grupo continua sendo feita por você; depois de criado, cole o link aqui.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          className="min-w-[16rem] flex-1 rounded-md border border-navy/15 px-2 py-1.5 text-xs text-navy"
          placeholder="Propósito do grupo (ex.: coleta de dados, orientação de jornada)"
          value={proposito}
          onChange={(e) => setProposito(e.target.value)}
        />
        <button
          type="button"
          disabled={proposito.trim().length < 5 || mRegistrar.isPending}
          onClick={() => mRegistrar.mutate()}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream disabled:opacity-40"
        >
          Registrar grupo
        </button>
      </div>

      {q.isLoading ? <p className="mt-2 text-xs text-navy/55">Carregando…</p> : null}
      {!q.isLoading && grupos.length === 0 ? (
        <p className="mt-2 text-xs text-navy/55">Nenhum grupo registrado para este caso.</p>
      ) : null}

      {grupos.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {grupos.map((g) => {
            const id = String(g.id);
            const status = String(g.status ?? "planejado");
            return (
              <li key={id} className={`rounded border p-2 ${ESTILO_STATUS[status] ?? ""}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-xs font-medium">{String(g.proposito ?? "—")}</p>
                  <span className="text-[10px] uppercase tracking-wide">
                    {ROTULO_STATUS[status] ?? status} · {String(g.canal ?? "whatsapp")}
                  </span>
                </div>
                {g.referencia_externa ? (
                  <p className="mt-1 text-[11px] text-navy/70">Link: {String(g.referencia_externa)}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {status === "planejado" ? (
                    <button
                      type="button"
                      disabled={mAtualizar.isPending}
                      onClick={() => mAtualizar.mutate({ id, status: "ativo" })}
                      className="rounded border border-navy/25 px-2 py-1 text-[11px] text-navy hover:bg-cream/50"
                    >
                      Marcar como ativo
                    </button>
                  ) : null}
                  {status !== "arquivado" ? (
                    <button
                      type="button"
                      disabled={mAtualizar.isPending}
                      onClick={() => mAtualizar.mutate({ id, status: "arquivado" })}
                      className="rounded border border-navy/25 px-2 py-1 text-[11px] text-navy hover:bg-cream/50"
                    >
                      Arquivar
                    </button>
                  ) : null}
                  <input
                    className="min-w-[12rem] flex-1 rounded-md border border-navy/15 px-2 py-1 text-[11px] text-navy"
                    placeholder="Colar link do grupo (opcional)"
                    value={novoLink[id] ?? ""}
                    onChange={(e) => setNovoLink((s) => ({ ...s, [id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    disabled={!novoLink[id]?.trim() || mAtualizar.isPending}
                    onClick={() => mAtualizar.mutate({ id, referenciaExterna: novoLink[id].trim() })}
                    className="rounded border border-navy/25 px-2 py-1 text-[11px] text-navy hover:bg-cream/50 disabled:opacity-40"
                  >
                    Salvar link
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
