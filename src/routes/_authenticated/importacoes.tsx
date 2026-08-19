import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import {
  CAMPOS_PLACEGO,
  FONTES_LEGADAS,
  lerCsv,
  sugerirMapeamento,
} from "@/lib/migracao-legado";
import {
  atualizarExcecaoMigracao,
  carregarMigracao,
  executarImportacaoPlacego,
  previewImportacaoPlacego,
} from "@/lib/migracao.functions";

export const Route = createFileRoute("/_authenticated/importacoes")({
  head: () => ({
    meta: [
      { title: "Importações e migração — Clube Ancestral" },
      { name: "description", content: "Migração controlada de fontes legadas para o Desk Intelligence, com prévia, mapeamento e deduplicação." },
      { property: "og:title", content: "Importações e migração — Clube Ancestral" },
      { property: "og:description", content: "Lotes de importação, vínculos legados e exceções de migração." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Importacoes,
});

const Cartao = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

function Importacoes() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(carregarMigracao);
  const preview = useServerFn(previewImportacaoPlacego);
  const executar = useServerFn(executarImportacaoPlacego);
  const resolver = useServerFn(atualizarExcecaoMigracao);

  const q = useQuery({ queryKey: ["migracao"], queryFn: () => carregar(), retry: false });
  const [csv, setCsv] = useState("");
  const [arquivo, setArquivo] = useState("");
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});

  const cabecalho = useMemo(() => lerCsv(csv).cabecalho, [csv]);
  const mapaEfetivo = useMemo(
    () => (Object.keys(mapeamento).length ? mapeamento : sugerirMapeamento(cabecalho)),
    [mapeamento, cabecalho],
  );

  const mPreview = useMutation({ mutationFn: () => preview({ data: { csv, mapeamento: mapaEfetivo } }) });
  const mExecutar = useMutation({
    mutationFn: () => executar({ data: { csv, mapeamento: mapaEfetivo, arquivo: arquivo || "csv" } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["migracao"] });
      mPreview.reset();
    },
  });

  const lerArquivo = async (file: File) => {
    setArquivo(file.name);
    setCsv(await file.text());
    setMapeamento({});
    mPreview.reset();
  };

  return (
    <SaasShell
      titulo="Importações e migração controlada"
      descricao="Planilhas legadas são somente leitura. O Desk Intelligence é a fonte canônica de todo dado operacional novo."
    >
      <div className="grid gap-4">
        <Cartao titulo="Fontes e situação de governança">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="py-2 pr-4">Fonte</th>
                  <th className="py-2 pr-4">Situação</th>
                  <th className="py-2 pr-4">Uso permitido</th>
                  <th className="py-2">Uso proibido</th>
                </tr>
              </thead>
              <tbody>
                {FONTES_LEGADAS.map((f) => (
                  <tr key={f.codigo} className="border-t border-navy/5 align-top">
                    <td className="py-2 pr-4 font-medium text-navy">{f.nome}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          f.situacao === "canonica" ? "bg-gold/20 text-navy" : "bg-navy/5 text-navy/60"
                        }`}
                      >
                        {f.situacao === "canonica" ? "canônica" : "legado somente leitura"}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{f.usoPermitido}</td>
                    <td className="py-2">{f.usoProibido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>

        <Cartao titulo="Importação Placego (CSV)">
          <p className="mb-3">
            API autenticada prevista na arquitetura; nesta entrega a origem é CSV. Cada importação gera um lote auditável e preserva o ID original do Placego.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void lerArquivo(f);
            }}
          />
          <textarea
            className="mt-3 h-28 w-full rounded-lg border border-navy/15 p-3 font-mono text-xs text-navy outline-none focus:border-gold"
            placeholder="ou cole o conteúdo CSV aqui"
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              setMapeamento({});
            }}
          />

          {cabecalho.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs uppercase tracking-wide text-navy/50">Mapeamento de campos</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {CAMPOS_PLACEGO.map((c) => (
                  <label key={c.campo} className="flex items-center justify-between gap-3 rounded-lg border border-navy/10 px-3 py-2">
                    <span className="text-xs text-navy/70">
                      {c.rotulo}
                      {c.obrigatorio ? " *" : ""}
                      <span className="block text-[10px] text-navy/40">{c.destino}</span>
                    </span>
                    <select
                      className="rounded border border-navy/15 px-2 py-1 text-xs"
                      value={mapaEfetivo[c.campo] ?? ""}
                      onChange={(e) => setMapeamento({ ...mapaEfetivo, [c.campo]: e.target.value })}
                    >
                      <option value="">— não mapear —</option>
                      {cabecalho.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
              disabled={!csv.trim() || mPreview.isPending}
              onClick={() => mPreview.mutate()}
            >
              {mPreview.isPending ? "Analisando…" : "Pré-visualizar e deduplicar"}
            </button>
            <button
              className="rounded-lg border border-gold px-4 py-2 text-sm text-navy disabled:opacity-40"
              disabled={!mPreview.data || mExecutar.isPending}
              onClick={() => mExecutar.mutate()}
            >
              {mExecutar.isPending ? "Importando…" : "Confirmar importação"}
            </button>
          </div>

          {mPreview.isError && <p className="mt-3 text-sm text-terracotta">{(mPreview.error as Error).message}</p>}
          {mExecutar.isError && <p className="mt-3 text-sm text-terracotta">{(mExecutar.error as Error).message}</p>}

          {mPreview.data && (
            <div className="mt-4 rounded-lg border border-navy/10 p-3">
              <p className="text-sm text-navy">
                Prévia: {mPreview.data.resumo.total} linhas — criar {mPreview.data.resumo.criar}, atualizar {mPreview.data.resumo.atualizar}, duplicadas{" "}
                {mPreview.data.resumo.duplicado}, rejeitadas {mPreview.data.resumo.rejeitado}.
              </p>
              <div className="mt-2 max-h-64 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-navy/50">
                    <tr>
                      <th className="py-1 pr-3">Linha</th>
                      <th className="py-1 pr-3">ID Placego</th>
                      <th className="py-1 pr-3">Nome</th>
                      <th className="py-1 pr-3">Ação</th>
                      <th className="py-1">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mPreview.data.linhas.map((l) => (
                      <tr key={l.indice} className="border-t border-navy/5">
                        <td className="py-1 pr-3">{l.indice + 2}</td>
                        <td className="py-1 pr-3">{l.registro.lead_id_placego}</td>
                        <td className="py-1 pr-3">{l.registro.nome}</td>
                        <td className="py-1 pr-3">{l.acao}</td>
                        <td className="py-1 text-navy/60">{l.motivo ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mExecutar.data && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-navy">
              Relatório do lote: {mExecutar.data.criados} criados, {mExecutar.data.atualizados} atualizados, {mExecutar.data.duplicados} duplicados,{" "}
              {mExecutar.data.rejeitados} rejeitados, {mExecutar.data.erros.length} erros.
            </p>
          )}
        </Cartao>

        <Cartao titulo="Lotes de importação">
          {q.isLoading ? (
            <EstadoVazio mensagem="Carregando…" />
          ) : (q.data?.lotes ?? []).length === 0 ? (
            <EstadoVazio mensagem="Nenhuma importação registrada." />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Origem</th>
                  <th className="py-1 pr-3">Início</th>
                  <th className="py-1 pr-3">Linhas</th>
                  <th className="py-1 pr-3">Criados</th>
                  <th className="py-1 pr-3">Atualizados</th>
                  <th className="py-1 pr-3">Duplicados</th>
                  <th className="py-1 pr-3">Rejeitados</th>
                  <th className="py-1">Situação</th>
                </tr>
              </thead>
              <tbody>
                {(q.data?.lotes ?? []).map((l) => (
                  <tr key={l.id} className="border-t border-navy/5">
                    <td className="py-1 pr-3">{l.source_system}</td>
                    <td className="py-1 pr-3">{new Date(l.started_at).toLocaleString("pt-BR")}</td>
                    <td className="py-1 pr-3">{l.total_rows}</td>
                    <td className="py-1 pr-3">{l.created_records}</td>
                    <td className="py-1 pr-3">{l.updated_records}</td>
                    <td className="py-1 pr-3">{l.duplicated_records}</td>
                    <td className="py-1 pr-3">{l.rejected_records}</td>
                    <td className="py-1">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>

        <Cartao titulo="Exceções de migração">
          {(q.data?.excecoes ?? []).length === 0 ? (
            <EstadoVazio mensagem="Nenhuma exceção registrada." />
          ) : (
            <div className="space-y-2">
              {(q.data?.excecoes ?? []).map((e) => (
                <div key={e.id} className="rounded-lg border border-navy/10 p-3">
                  <p className="text-sm text-navy">
                    <span className="font-medium">{e.exception_type}</span> — {e.reason}
                  </p>
                  <p className="text-xs text-navy/60">
                    Origem {e.source_system} · registro {e.source_record_id ?? "—"} · situação {e.status}
                  </p>
                  {e.proposed_resolution && <p className="mt-1 text-xs text-navy/60">Resolução proposta: {e.proposed_resolution}</p>}
                  {e.status === "aberta" && (
                    <button
                      className="mt-2 rounded border border-navy/20 px-2 py-1 text-xs text-navy"
                      onClick={async () => {
                        await resolver({ data: { id: e.id, status: "resolvida" } });
                        queryClient.invalidateQueries({ queryKey: ["migracao"] });
                      }}
                    >
                      Marcar como resolvida
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Cartao>

        <Cartao titulo="Vínculos com registros legados">
          {(q.data?.vinculos ?? []).length === 0 ? (
            <EstadoVazio mensagem="Nenhum vínculo legado registrado." />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Entidade</th>
                  <th className="py-1 pr-3">Sistema legado</th>
                  <th className="py-1 pr-3">ID legado</th>
                  <th className="py-1 pr-3">Confiança</th>
                  <th className="py-1">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {(q.data?.vinculos ?? []).map((v) => (
                  <tr key={v.id} className="border-t border-navy/5">
                    <td className="py-1 pr-3">{v.entity_type}</td>
                    <td className="py-1 pr-3">{v.legacy_system}</td>
                    <td className="py-1 pr-3">{v.legacy_record_id}</td>
                    <td className="py-1 pr-3">{v.confidence}</td>
                    <td className="py-1 text-navy/60">{v.deduplication_reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Cartao>
      </div>
    </SaasShell>
  );
}
