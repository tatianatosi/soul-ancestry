import { useState } from "react";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { TIPOS_VINCULO, type TipoAlvo } from "@/lib/fontes-documentos-integracao";
import {
  criarEvidenciaRascunhoDeFonte,
  desvincularFonte,
  listarVinculosFonte,
  vincularFonteA,
} from "@/lib/fontes-documentos-integracao.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold";

const ROTULO_ALVO: Record<TipoAlvo, string> = {
  evidencia: "Evidência",
  solicitacao: "Solicitação",
  pessoa: "Pessoa",
  relatorio: "Relatório",
};

function alvoDoVinculo(v: Record<string, any>): { tipo: TipoAlvo; id: string } | null {
  if (v["evidence_id"]) return { tipo: "evidencia", id: String(v["evidence_id"]) };
  if (v["document_request_id"]) return { tipo: "solicitacao", id: String(v["document_request_id"]) };
  if (v["research_person_id"]) return { tipo: "pessoa", id: String(v["research_person_id"]) };
  if (v["case_report_id"]) return { tipo: "relatorio", id: String(v["case_report_id"]) };
  return null;
}

/** Vínculos internos do documento com evidências, solicitações, pessoas e relatórios. */
export function VinculosDoDocumento({
  caseId,
  sourceDocumentId,
  onMudou,
}: {
  caseId: string;
  sourceDocumentId: string;
  onMudou?: () => void;
}) {
  const qc = useQueryClient();
  const [tipoAlvo, setTipoAlvo] = useState<TipoAlvo>("evidencia");
  const [alvoId, setAlvoId] = useState("");
  const [tipoVinculo, setTipoVinculo] = useState("comprova");
  const [observacao, setObservacao] = useState("");

  const autoridade = useAutoridade();
  const painel = useQuery({
    queryKey: ["g08b-vinculos", caseId, sourceDocumentId],
    queryFn: () => listarVinculosFonte({ data: { caseId, sourceDocumentId } }),
  });

  const d = painel.data as any;
  // Autoridade operacional: o gate de papel vindo do servidor não esconde mais
  // ação; falta de papel/organização é o único bloqueio e o servidor revalida.
  const podeEditarAutoridade = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const vinculos: Record<string, any>[] = d?.vinculos ?? [];
  const alvos: Record<TipoAlvo, { id: string; rotulo: string }[]> = d?.alvos ?? {
    evidencia: [],
    solicitacao: [],
    pessoa: [],
    relatorio: [],
  };
  const opcoesTipo = TIPOS_VINCULO.filter((t) => t.alvo === tipoAlvo);

  const atualizar = () => {
    void qc.invalidateQueries({ queryKey: ["g08b-vinculos", caseId, sourceDocumentId] });
    onMudou?.();
  };

  const vincular = useMutation({
    mutationFn: () =>
      vincularFonteA({
        data: {
          caseId,
          sourceDocumentId,
          tipoAlvo,
          alvoId,
          tipoVinculo,
          observacaoInterna: observacao.trim() || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Vínculo registrado com autoria e data.");
      setAlvoId("");
      setObservacao("");
      atualizar();
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const criarEvidencia = useMutation({
    mutationFn: () => criarEvidenciaRascunhoDeFonte({ data: { caseId, sourceDocumentId } }),
    onSuccess: () => {
      toast.success("Evidência criada em rascunho, com confiança mínima. Nada foi avançado no caso.");
      atualizar();
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  const desvincular = useMutation({
    mutationFn: (v: { vinculoId: string; motivo: string }) =>
      desvincularFonte({ data: { caseId, vinculoId: v.vinculoId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("Vínculo desfeito de forma lógica, com motivo registrado.");
      atualizar();
    },
    onError: (e: any) => toast.error(String(e?.message ?? e)),
  });

  return (
    <div className="space-y-3 rounded-lg border border-navy/10 bg-white/70 p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium uppercase tracking-wide text-navy/60">Vínculos da pesquisa</h4>
        <span className="text-[11px] text-navy/45">{vinculos.length} ativo(s)</span>
      </div>

      {vinculos.length === 0 ? (
        <p className="text-xs text-navy/60">
          Nenhum vínculo. Documentos não geram evidência, pessoa, relação, evento, achado ou relatório automaticamente.
        </p>
      ) : (
        <ul className="space-y-1 text-xs text-navy">
          {vinculos.map((v) => {
            const alvo = alvoDoVinculo(v);
            const rot = alvo ? (alvos[alvo.tipo] ?? []).find((a) => a.id === alvo.id)?.rotulo : null;
            return (
              <li key={String(v["id"])} className="flex flex-wrap items-center justify-between gap-2 border-t border-navy/10 py-1">
                <span>
                  <strong>{alvo ? ROTULO_ALVO[alvo.tipo] : "Alvo"}</strong> · {rot ?? "registro do caso"} ·{" "}
                  {TIPOS_VINCULO.find((t) => t.id === v["tipo_vinculo"])?.rotulo ?? String(v["tipo_vinculo"])}
                </span>
                {podeEditarAutoridade && (
                  <button
                    type="button"
                    className="text-terracotta underline"
                    onClick={() => {
                      const motivo = window.prompt("Motivo do desvínculo (opcional):");
                      if (motivo === null) return;
                      desvincular.mutate({ vinculoId: String(v["id"]), motivo });
                    }}
                  >
                    Desvincular
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {podeEditarAutoridade && (
        <div className="grid gap-2 md:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Vincular a</span>
            <select
              className={inputCls}
              value={tipoAlvo}
              onChange={(e) => {
                const t = e.target.value as TipoAlvo;
                setTipoAlvo(t);
                setAlvoId("");
                setTipoVinculo(TIPOS_VINCULO.find((x) => x.alvo === t)?.id ?? "");
              }}
            >
              {(Object.keys(ROTULO_ALVO) as TipoAlvo[]).map((t) => (
                <option key={t} value={t}>
                  {ROTULO_ALVO[t]}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Registro do caso</span>
            <select className={inputCls} value={alvoId} onChange={(e) => setAlvoId(e.target.value)}>
              <option value="">— selecionar —</option>
              {(alvos[tipoAlvo] ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Tipo de vínculo</span>
            <select className={inputCls} value={tipoVinculo} onChange={(e) => setTipoVinculo(e.target.value)}>
              {opcoesTipo.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </label>

          <input
            className={`${inputCls} md:col-span-4`}
            placeholder="Observação interna (opcional)"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 md:col-span-4">
            <button
              type="button"
              disabled={!alvoId || vincular.isPending}
              onClick={() => vincular.mutate()}
              className="rounded-full border border-gold bg-navy px-4 py-2 text-xs text-cream disabled:opacity-50"
            >
              Vincular
            </button>
            <button
              type="button"
              disabled={criarEvidencia.isPending}
              onClick={() => {
                if (!window.confirm("Criar uma evidência em rascunho a partir deste documento? Nada será publicado nem avançado.")) return;
                criarEvidencia.mutate();
              }}
              className="rounded-full border border-navy/20 px-4 py-2 text-xs text-navy disabled:opacity-50"
            >
              Criar evidência em rascunho a partir deste documento
            </button>
          </div>
          <p className="text-[11px] text-navy/55 md:col-span-4">
            Vincular é ato humano registrado. A evidência criada nasce em rascunho, com confiança mínima e sem validação
            epistêmica — nenhuma publicação no App Cliente, cobrança, contrato ou comunicação é gerada.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Leitura apenas: mostra, na seção do alvo, quais documentos-fonte já foram
 * vinculados por decisão humana. Não edita nem cria nada.
 */
export function LastroDeFontes({ caseId, tipoAlvo }: { caseId: string; tipoAlvo: TipoAlvo }) {
  const painel = useQuery({
    queryKey: ["g08b-vinculos", caseId, "todos"],
    queryFn: () => listarVinculosFonte({ data: { caseId } }),
  });
  const d = painel.data as any;
  const alvos: { id: string; rotulo: string }[] = d?.alvos?.[tipoAlvo] ?? [];
  const itens = ((d?.vinculos ?? []) as Record<string, any>[]).filter((v) => alvoDoVinculo(v)?.tipo === tipoAlvo);

  return (
    <div className="rounded-lg border border-navy/10 bg-white/60 p-3 text-xs text-navy">
      <h4 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-navy/60">
        Documentos-fonte vinculados ({ROTULO_ALVO[tipoAlvo].toLowerCase()})
      </h4>
      {itens.length === 0 ? (
        <p className="text-navy/60">
          Nenhum documento-fonte vinculado. O vínculo é feito manualmente na seção “Fontes e documentos”.
        </p>
      ) : (
        <ul className="space-y-1">
          {itens.map((v) => {
            const alvo = alvoDoVinculo(v);
            const rot = alvo ? alvos.find((a) => a.id === alvo.id)?.rotulo : null;
            return (
              <li key={String(v["id"])} className="border-t border-navy/10 py-1">
                {rot ?? "Registro do caso"} · {TIPOS_VINCULO.find((t) => t.id === v["tipo_vinculo"])?.rotulo ?? String(v["tipo_vinculo"])}
                {v["vinculado_em"] ? ` · ${String(v["vinculado_em"]).slice(0, 10)}` : ""}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
