import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SaasShell } from "@/components/saas/shell";
import { ManifestoResgate } from "@/components/governanca/manifesto";
import { CadeiaSuprimentoPesquisa } from "@/components/pesquisa/cadeia-suprimento";

import { SUBAREAS_BIBLIOTECA, type SubareaBiblioteca } from "@/lib/biblioteca-mestre";
import {
  listarBibliotecaMestre,
  listarCatalogoTop30,
  type ItemBiblioteca,
} from "@/lib/biblioteca-mestre.functions";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca Mestre — Clube Ancestral" },
      {
        name: "description",
        content:
          "Base operacional interna: acervo, bases genealógicas, taxonomias, trilhas, regras versionadas, modelos F1/F2 e catálogo interno.",
      },
      { property: "og:title", content: "Biblioteca Mestre — Clube Ancestral" },
      {
        property: "og:description",
        content: "Referências estruturadas que alimentam pesquisa, relatórios e operação interna.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BibliotecaPage,
  errorComponent: ({ error }) => (
    <SaasShell titulo="Biblioteca Mestre" descricao="Falha ao carregar as referências internas.">
      <p role="alert" className="text-sm text-destructive">
        {error.message}
      </p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Biblioteca Mestre" descricao="Conteúdo não encontrado.">
      <p className="text-sm text-muted-foreground">Nada a exibir.</p>
    </SaasShell>
  ),
});

function BibliotecaPage() {
  const [sub, setSub] = useState<SubareaBiblioteca>("acervo");
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [pais, setPais] = useState("");
  const [detalhe, setDetalhe] = useState<ItemBiblioteca | null>(null);

  const geral = useQuery({ queryKey: ["biblioteca-mestre"], queryFn: () => listarBibliotecaMestre() });
  const catalogo = useQuery({ queryKey: ["biblioteca-top30"], queryFn: () => listarCatalogoTop30() });

  const itens = useMemo<ItemBiblioteca[]>(
    () => [...(geral.data?.itens ?? []), ...(catalogo.data?.itens ?? [])],
    [geral.data, catalogo.data],
  );

  const contadores = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of itens) m.set(i.subarea, (m.get(i.subarea) ?? 0) + 1);
    return m;
  }, [itens]);

  const opcoes = useMemo(() => {
    const st = new Set<string>();
    const rp = new Set<string>();
    const ps = new Set<string>();
    for (const i of itens) {
      if (i.status) st.add(i.status);
      if (i.responsavel) rp.add(i.responsavel);
      if (i.pais) ps.add(i.pais);
    }
    return { status: [...st].sort(), responsavel: [...rp].sort(), pais: [...ps].sort() };
  }, [itens]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (i.subarea !== sub) return false;
      if (status && i.status !== status) return false;
      if (responsavel && i.responsavel !== responsavel) return false;
      if (pais && i.pais !== pais) return false;
      if (!q) return true;
      return [i.titulo, i.subtitulo, i.codigo, i.versao, i.status, i.pais]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [itens, sub, busca, status, responsavel, pais]);

  const meta = SUBAREAS_BIBLIOTECA.find((s) => s.chave === sub)!;
  const carregando = geral.isLoading || catalogo.isLoading;

  return (
    <SaasShell
      titulo="Biblioteca Mestre"
      descricao="Base operacional interna do Desk: referências estruturadas que alimentam pesquisa, relatórios e operação. Nada aqui é exposto ao App Cliente."
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-medium text-foreground">Da Biblioteca até o App Cliente</h2>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">
            Bases Genealógicas, Dicionários e Trilhas são o insumo da pesquisa. O caminho é único e nenhum elo é
            pulado.
          </p>
          <CadeiaSuprimentoPesquisa compacto />
        </section>

        <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">

          {SUBAREAS_BIBLIOTECA.map((s) => (
            <button
              key={s.chave}
              type="button"
              onClick={() => {
                setSub(s.chave);
                setDetalhe(null);
              }}
              className={`rounded-xl border p-3 text-left transition ${
                sub === s.chave ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground">
                {contadores.get(s.chave) ?? 0} {(contadores.get(s.chave) ?? 0) === 1 ? "item" : "itens"}
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-medium text-foreground">{meta.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.finalidade}</p>
          <p className="mt-2 text-xs text-muted-foreground">Regra interna: {meta.regra}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.dimensoes.map((d) => (
              <span key={d} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {d}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, código, país, versão ou status"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            aria-label="Buscar na Biblioteca Mestre"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            {opcoes.status.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            aria-label="Filtrar por responsável"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os responsáveis</option>
            {opcoes.responsavel.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            aria-label="Filtrar por país ou trilha"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os países/trilhas</option>
            {opcoes.pais.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </section>

        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando referências internas…</p>
        ) : lista.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum registro nesta subárea com os filtros atuais. Os itens entram pelas rotinas internas de
            curadoria e permanecem restritos ao Desk.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {lista.map((i) => (
              <li key={i.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{i.titulo}</div>
                    {i.subtitulo && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{i.subtitulo}</p>
                    )}
                  </div>
                  {i.status && (
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {i.status}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {i.codigo && <span>Código: {i.codigo}</span>}
                  {i.versao && <span>Versão: {i.versao}</span>}
                  {i.responsavel && <span>Responsável: {i.responsavel}</span>}
                  {i.revisadoEm && <span>Revisão: {String(i.revisadoEm).slice(0, 10)}</span>}
                  {i.arquivado && <span>Arquivado: {i.motivoArquivo ?? "sem motivo registrado"}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => setDetalhe(detalhe?.id === i.id ? null : i)}
                  className="mt-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  {detalhe?.id === i.id ? "Fechar detalhe" : "Ver detalhe e vínculos"}
                </button>
                {detalhe?.id === i.id && (
                  <dl className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                    {i.detalhes.length === 0 ? (
                      <p className="text-muted-foreground">Sem campos adicionais registrados.</p>
                    ) : (
                      i.detalhes.map((d) => (
                        <div key={d.rotulo} className="flex gap-2">
                          <dt className="shrink-0 text-muted-foreground">{d.rotulo}:</dt>
                          <dd className="text-foreground">{d.valor}</dd>
                        </div>
                      ))
                    )}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        )}

        {sub === "governanca" && <ManifestoResgate />}
      </div>
    </SaasShell>
  );
}
