import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import {
  listarNucleos,
  salvarDossieNucleo,
  NUCLEO_AMBIENTES,
  NUCLEO_NIVEIS_ACESSO,
  NUCLEO_DOSSIE_STATUS,
} from "@/lib/nucleos-desk.functions";

export const Route = createFileRoute("/_authenticated/nucleos")({
  head: () => ({
    meta: [
      { title: "Núcleos familiares e dossiês — Clube Ancestral" },
      {
        name: "description",
        content: "Núcleos familiares, requerentes vinculados e cadastro controlado do dossiê-mãe.",
      },
      { property: "og:title", content: "Núcleos familiares e dossiês — Clube Ancestral" },
      {
        property: "og:description",
        content: "Cadastro do dossiê-mãe com ambiente autorizado, nível de acesso e responsável nominal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Nucleos,
});

const AMBIENTE_LABEL: Record<string, string> = {
  drive_clube_ancestral: "Drive Clube Ancestral",
  desk_intelligence: "Desk Intelligence",
  acervo_interno: "Acervo interno",
};

const ACESSO_LABEL: Record<string, string> = {
  restrito: "Restrito",
  equipe: "Equipe",
  coordenacao: "Coordenação",
};

const STATUS_LABEL: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  em_preparacao: "Em preparação",
  ativo: "Ativo",
  arquivado: "Arquivado",
};

const PAPEL_LABEL: Record<string, string> = {
  contratante_signatario: "Contratante signatário",
  requerente: "Requerente",
  dependente: "Dependente",
  referencia_genealogica: "Referência genealógica",
};

type Nucleo = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function Nucleos() {
  const { podeEscrever } = useSaas();
  const carregar = useServerFn(listarNucleos);
  const salvar = useServerFn(salvarDossieNucleo);
  const queryClient = useQueryClient();

  const q = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregar(), retry: false });
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const lista = useMemo(() => {
    const filtro = busca.trim().toLowerCase();
    return ((q.data ?? []) as Nucleo[]).filter((n) => {
      const statusOk = !statusFiltro || n.dossie_status === statusFiltro;
      const texto = `${n.nome ?? ""} ${n.dossie_mae ?? ""} ${n.contratante_nome ?? ""} ${n.caso?.codigo ?? ""} ${(n.membros ?? [])
        .map((m: Nucleo) => m.nome)
        .join(" ")}`.toLowerCase();
      return statusOk && (!filtro || texto.includes(filtro));
    });
  }, [q.data, busca, statusFiltro]);

  const mut = useMutation({
    mutationFn: (dados: Record<string, string>) =>
      salvar({
        data: {
          nucleoId: dados.nucleoId as string,
          dossie_mae: dados.dossie_mae ?? "",
          ambiente: dados.ambiente ?? "",
          nivel_acesso: dados.nivel_acesso ?? "",
          link_interno: dados.link_interno ?? "",
          responsavel_nome: dados.responsavel_nome ?? "",
          dossie_status: dados.dossie_status ?? "nao_iniciado",
        },
      }),
    onSuccess: () => {
      toast.success("Dossiê-mãe atualizado.");
      setEditando(null);
      queryClient.invalidateQueries({ queryKey: ["nucleos-desk"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar."),
  });

  function abrirEdicao(n: Nucleo) {
    setEditando(n.id);
    setForm({
      nucleoId: n.id,
      dossie_mae: n.dossie_mae ?? "",
      ambiente: n.ambiente ?? "",
      nivel_acesso: n.nivel_acesso ?? "",
      link_interno: n.link_interno ?? "",
      responsavel_nome: n.responsavel_nome ?? "",
      dossie_status: n.dossie_status ?? "nao_iniciado",
    });
  }

  const inputCls =
    "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold";

  return (
    <SaasShell
      titulo="Núcleos familiares e dossiês"
      descricao="Um dossiê-mãe por núcleo. Campos classificatórios são listas fechadas; dossiê ativo exige identificação, ambiente autorizado, link interno, nível de acesso e responsável nominal."
    >
      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando núcleos…" />
      ) : q.isError ? (
        <EstadoVazio mensagem={q.error instanceof Error ? q.error.message : "Falha ao carregar."} />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              className={`${inputCls} max-w-sm`}
              placeholder="Buscar por núcleo, dossiê, caso ou requerente"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <select className={`${inputCls} max-w-[220px]`} value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="">Todas as situações do dossiê</option>
              {NUCLEO_DOSSIE_STATUS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          {!lista.length ? (
            <EstadoVazio mensagem="Nenhum núcleo familiar encontrado com os filtros atuais." />
          ) : (
            <div className="space-y-4">
              {lista.map((n) => (
                <section key={n.id} className="rounded-xl border border-navy/10 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg text-navy">{n.nome}</h2>
                      <p className="text-xs text-navy/60">
                        {n.caso ? `${n.caso.codigo} · ${n.caso.titulo}` : "Sem caso vinculado"}
                        {n.contratante_nome ? ` · Contratante: ${n.contratante_nome}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-navy/15 px-3 py-1 text-[11px] uppercase tracking-wide text-navy/70">
                        Dossiê: {STATUS_LABEL[n.dossie_status] ?? n.dossie_status}
                      </span>
                      {podeEscrever ? (
                        <button
                          className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm text-navy hover:bg-navy/5"
                          onClick={() => (editando === n.id ? setEditando(null) : abrirEdicao(n))}
                        >
                          {editando === n.id ? "Cancelar" : "Editar dossiê"}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-navy/50">Dossiê-mãe</dt>
                      <dd>{n.dossie_mae || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-navy/50">Ambiente autorizado</dt>
                      <dd>{n.ambiente ? (AMBIENTE_LABEL[n.ambiente] ?? n.ambiente) : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-navy/50">Nível de acesso</dt>
                      <dd>{n.nivel_acesso ? (ACESSO_LABEL[n.nivel_acesso] ?? n.nivel_acesso) : "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-navy/50">Responsável nominal</dt>
                      <dd>{n.responsavel_nome || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] uppercase tracking-wide text-navy/50">Link interno</dt>
                      <dd className="truncate">{n.link_interno || "—"}</dd>
                    </div>
                  </dl>

                  {editando === n.id ? (
                    <form
                      className="mt-4 grid gap-3 rounded-lg border border-navy/10 bg-cream/50 p-4 sm:grid-cols-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        mut.mutate(form);
                      }}
                    >
                      <label className="text-sm">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">ID/nome do dossiê-mãe</span>
                        <input
                          className={inputCls}
                          value={form.dossie_mae ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, dossie_mae: e.target.value }))}
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Responsável nominal</span>
                        <input
                          className={inputCls}
                          value={form.responsavel_nome ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, responsavel_nome: e.target.value }))}
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Ambiente autorizado</span>
                        <select
                          className={inputCls}
                          value={form.ambiente ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, ambiente: e.target.value }))}
                        >
                          <option value="">Selecionar</option>
                          {NUCLEO_AMBIENTES.map((a) => (
                            <option key={a} value={a}>
                              {AMBIENTE_LABEL[a]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Nível de acesso</span>
                        <select
                          className={inputCls}
                          value={form.nivel_acesso ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, nivel_acesso: e.target.value }))}
                        >
                          <option value="">Selecionar</option>
                          {NUCLEO_NIVEIS_ACESSO.map((a) => (
                            <option key={a} value={a}>
                              {ACESSO_LABEL[a]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm sm:col-span-2">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Link interno do dossiê</span>
                        <input
                          className={inputCls}
                          placeholder="https://…"
                          value={form.link_interno ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, link_interno: e.target.value }))}
                        />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Situação do dossiê</span>
                        <select
                          className={inputCls}
                          value={form.dossie_status ?? "nao_iniciado"}
                          onChange={(e) => setForm((f) => ({ ...f, dossie_status: e.target.value }))}
                        >
                          {NUCLEO_DOSSIE_STATUS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={mut.isPending}
                          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-60"
                        >
                          {mut.isPending ? "Salvando…" : "Salvar dossiê"}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <div className="mt-4">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-navy/50">
                      Requerentes e membros ({(n.membros ?? []).length})
                    </p>
                    {!(n.membros ?? []).length ? (
                      <p className="text-sm text-navy/60">Nenhum requerente vinculado ao núcleo.</p>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {(n.membros as Nucleo[]).map((m) => (
                          <li key={m.id} className="rounded-lg border border-navy/10 px-3 py-2 text-sm">
                            <span className="font-medium">{m.nome}</span>
                            <span className="block text-xs text-navy/60">
                              {PAPEL_LABEL[m.papel] ?? m.papel}
                              {m.vinculo ? ` · ${m.vinculo}` : ""}
                              {m.processo ? ` · ${m.processo}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </SaasShell>
  );
}
