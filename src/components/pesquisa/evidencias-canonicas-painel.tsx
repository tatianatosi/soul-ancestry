import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  arquivarEvidenciaCanonica,
  listarEvidenciasDoCaso,
  salvarEvidenciaCanonica,
} from "@/lib/evidencia-canonica.functions";
import { TIPOS_EVIDENCIA } from "@/lib/evidencia-canonica";
import { STATUS_EVIDENCIA } from "@/lib/pesquisa-cadeia";

const ROTULO_TIPO: Record<string, string> = {
  document: "Documento",
  record_excerpt: "Trecho de registro",
  photo: "Foto",
  oral_history: "História oral",
  registry_entry: "Lançamento em registro",
  archive_reference: "Referência de arquivo",
  timeline_item: "Item de linha do tempo",
  correspondence: "Correspondência",
  structured_note: "Nota estruturada",
  other: "Outro",
};

type EvidenciaLinha = {
  id: string;
  title: string | null;
  evidence_type: string | null;
  situacao: string | null;
};

/**
 * Registro canônico de evidências do caso: o único escritor (Corte 1,
 * 01/10/2026). Lista, registra e arquiva com motivo; a mudança de situação
 * segue pelo grafo na própria tela de Pesquisa, que chama a mesma função de
 * servidor. Nada de exclusão física: arquivar exige motivo.
 */
export function EvidenciasCanonicasPainel({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const chave = ["evidencias-canonicas", caseId];
  const listar = useServerFn(listarEvidenciasDoCaso);
  const salvar = useServerFn(salvarEvidenciaCanonica);
  const arquivar = useServerFn(arquivarEvidenciaCanonica);

  const lista = useQuery({ queryKey: chave, queryFn: () => listar({ data: { caseId } }) });

  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<string>("document");
  const [descricao, setDescricao] = useState("");

  const aposGravar = () => {
    void qc.invalidateQueries({ queryKey: chave });
    void qc.invalidateQueries({ queryKey: ["cadeia-pesquisa", caseId] });
  };

  const registrar = useMutation({
    mutationFn: () =>
      salvar({
        data: {
          caseId,
          titulo: titulo.trim(),
          tipo,
          descricao: descricao.trim() || null,
          origem: "pesquisa_evidencias_do_caso",
        },
      }),
    onSuccess: () => {
      toast.success("Evidência registrada no módulo canônico.");
      setTitulo("");
      setDescricao("");
      setAberto(false);
      aposGravar();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível registrar."),
  });

  const arquivarLinha = useMutation({
    mutationFn: (v: { id: string; motivo: string }) => arquivar({ data: { caseId, ...v } }),
    onSuccess: () => {
      toast.success("Evidência arquivada com motivo.");
      aposGravar();
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível arquivar."),
  });

  const linhas = (lista.data ?? []) as EvidenciaLinha[];
  const rotuloSituacao = (id: string | null) =>
    STATUS_EVIDENCIA.find((s) => s.id === id)?.rotulo ?? "Sem situação";

  return (
    <div data-evidencias-canonicas className="space-y-3">
      {lista.isLoading ? (
        <p className="text-xs text-navy/60">Carregando evidências do caso…</p>
      ) : null}
      {lista.error ? (
        <p className="text-xs text-terracotta">
          Não foi possível ler as evidências:{" "}
          {lista.error instanceof Error ? lista.error.message : "erro desconhecido"}
        </p>
      ) : null}
      {!lista.isLoading && !lista.error && linhas.length === 0 ? (
        <p className="text-xs text-navy/60">Nenhuma evidência registrada para este caso.</p>
      ) : null}
      {linhas.length > 0 ? (
        <ul className="space-y-1.5" data-evidencias-canonicas-lista>
          {linhas.map((l) => (
            <li
              key={l.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-navy/10 pb-1.5 text-sm text-navy"
            >
              <span className="min-w-0">
                <strong>{l.title ?? "Sem título"}</strong>
                <span className="ml-2 text-xs text-navy/60">
                  {ROTULO_TIPO[l.evidence_type ?? ""] ?? l.evidence_type ?? "—"} ·{" "}
                  {rotuloSituacao(l.situacao)}
                </span>
              </span>
              <AcaoOperacional
                rotulo="arquivar"
                acaoExterna="arquivar_evidencia"
                efeito="Arquiva a evidência com motivo — não há exclusão física."
                className="h-auto rounded-none border-0 bg-transparent p-0 text-xs underline decoration-terracotta underline-offset-2"
                onConfirmar={(motivo) => arquivarLinha.mutate({ id: l.id, motivo })}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {aberto ? (
        <div
          className="space-y-2 rounded border border-navy/15 bg-cream/40 p-3"
          data-evidencias-canonicas-nova
        >
          <label className="block text-xs text-navy/70">
            Título (mínimo 3 letras)
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-0.5 block w-full rounded border border-navy/20 px-2 py-1 text-sm"
            />
          </label>
          <label className="block text-xs text-navy/70">
            Tipo
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="mt-0.5 block w-full rounded border border-navy/20 px-2 py-1 text-sm"
            >
              {TIPOS_EVIDENCIA.map((t) => (
                <option key={t} value={t}>
                  {ROTULO_TIPO[t] ?? t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-navy/70">
            Descrição interna (opcional)
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="mt-0.5 block w-full rounded border border-navy/20 px-2 py-1 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={titulo.trim().length < 3 || registrar.isPending}
              onClick={() => registrar.mutate()}
              className="rounded bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
            >
              {registrar.isPending ? "Registrando…" : "Registrar evidência"}
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="rounded border border-navy/20 px-3 py-1.5 text-xs text-navy"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="rounded border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-cream/60"
        >
          + Nova evidência
        </button>
      )}
    </div>
  );
}
