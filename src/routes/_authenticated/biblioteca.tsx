import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SaasShell } from "@/components/saas/shell";
import { ManifestoResgate } from "@/components/governanca/manifesto";
import { CadeiaSuprimentoPesquisa } from "@/components/pesquisa/cadeia-suprimento";

import { SUBAREAS_BIBLIOTECA, type SubareaBiblioteca } from "@/lib/biblioteca-mestre";
import {
  arquivarItemBiblioteca,
  definirVigenciaItem,
  ESTADOS_VIGENCIA,
  listarBibliotecaMestre,
  listarCatalogoTop30,
  type EstadoVigencia,
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
  const [arquivamento, setArquivamento] = useState<"ativos" | "arquivados" | "todos">("ativos");
  const [detalhe, setDetalhe] = useState<ItemBiblioteca | null>(null);
  const [aArquivar, setAArquivar] = useState<ItemBiblioteca | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [erroVigencia, setErroVigencia] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const geral = useQuery({ queryKey: ["biblioteca-mestre"], queryFn: () => listarBibliotecaMestre() });
  const catalogo = useQuery({ queryKey: ["biblioteca-top30"], queryFn: () => listarCatalogoTop30() });

  const arquivar = useMutation({
    mutationFn: (v: { id: string; fonte: ItemBiblioteca["fonte"]; motivo: string }) =>
      arquivarItemBiblioteca({ data: v }),
    onSuccess: async () => {
      setAArquivar(null);
      setMotivo("");
      setErroArquivo(null);
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-mestre"] });
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-top30"] });
    },
    onError: (e: Error) => setErroArquivo(e.message),
  });

  const [dependencias, setDependencias] = useState<
    { id: string; titulo: string; versao: string | null; vinculo: string; pendencia: string }[]
  >([]);
  const vigencia = useMutation({
    mutationFn: (v: {
      id: string;
      estado: EstadoVigencia;
      criterio?: string;
      sucessorId?: string | null;
      justificativa?: string;
      motivoSuspensao?: string;
    }) => definirVigenciaItem({ data: v }),
    onSuccess: async (r) => {
      setErroVigencia(null);
      setDependencias((r?.dependencias ?? []) as never);
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-mestre"] });
    },
    onError: (e: Error) => setErroVigencia(e.message),
  });


  const itens = useMemo<ItemBiblioteca[]>(
    () => [...(geral.data?.itens ?? []), ...(catalogo.data?.itens ?? [])],
    [geral.data, catalogo.data],
  );

  const contadores = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of itens) {
      const chave = i.arquivado ? "arquivo" : i.subarea;
      m.set(chave, (m.get(chave) ?? 0) + 1);
    }
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
      if (sub === "arquivo" ? !i.arquivado : i.arquivado || i.subarea !== sub) return false;
      if (arquivamento === "ativos" && i.arquivado) return false;
      if (arquivamento === "arquivados" && !i.arquivado) return false;
      if (status && i.status !== status) return false;
      if (responsavel && i.responsavel !== responsavel) return false;
      if (pais && i.pais !== pais) return false;
      if (!q) return true;
      return [i.titulo, i.subtitulo, i.codigo, i.versao, i.status, i.pais]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [itens, sub, busca, status, responsavel, pais, arquivamento]);

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
          <select
            value={arquivamento}
            onChange={(e) => setArquivamento(e.target.value as typeof arquivamento)}
            aria-label="Filtrar por situação de arquivamento"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="ativos">Somente vigentes</option>
            <option value="arquivados">Somente arquivados</option>
            <option value="todos">Vigentes e arquivados</option>
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
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {i.status && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {i.status}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        i.arquivado
                          ? "bg-muted text-muted-foreground"
                          : i.homologado
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {i.arquivado ? "Arquivado" : i.homologado ? "Homologado" : "Não homologado"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {i.codigo && <span>Código: {i.codigo}</span>}
                  {i.versao && <span>Versão: {i.versao}</span>}
                  {i.responsavel && <span>Responsável: {i.responsavel}</span>}
                  {i.revisadoEm && <span>Revisão: {String(i.revisadoEm).slice(0, 10)}</span>}
                  {i.arquivado && <span>Arquivado: {i.motivoArquivo ?? "sem motivo registrado"}</span>}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Regra: {i.regraHomologacao}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setDetalhe(detalhe?.id === i.id ? null : i)}
                    className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {detalhe?.id === i.id ? "Fechar detalhe" : "Ver detalhe e vínculos"}
                  </button>
                  {!i.arquivado && (
                    <button
                      type="button"
                      onClick={() => {
                        setAArquivar(i);
                        setMotivo("");
                        setErroArquivo(null);
                      }}
                      className="text-xs font-medium text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Arquivar item
                    </button>
                  )}
                </div>
                {detalhe?.id === i.id && (
                  <div className="mt-3 space-y-3 border-t border-border pt-3 text-xs">
                    <dl className="space-y-1">
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
                    {i.fonte === "acervo" && (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-foreground">
                          Vigência atual:{" "}
                          <strong>
                            {ESTADOS_VIGENCIA.find((e) => e.valor === (i.vigencia ?? "rascunho"))?.rotulo}
                          </strong>
                        </p>
                        <p className="text-muted-foreground">
                          Critério/evidência de homologação: {i.homologacaoCriterio ?? "não registrado"}
                          {i.homologadoEm ? ` · homologado em ${String(i.homologadoEm).slice(0, 10)}` : ""}
                        </p>
                        {i.predecessorId && (
                          <p className="text-muted-foreground">
                            Substitui o item anterior: <code>{i.predecessorId}</code>
                          </p>
                        )}
                        {i.sucessorId && (
                          <p className="text-muted-foreground">
                            Substituído pelo sucessor: <code>{i.sucessorId}</code>
                          </p>
                        )}
                        {!i.arquivado && (
                          <FormularioVigencia
                            item={i}
                            candidatos={itens.filter((c) => c.fonte === "acervo" && c.id !== i.id && !c.arquivado)}
                            onSalvar={(v) => vigencia.mutate(v)}
                            salvando={vigencia.isPending}
                            erro={erroVigencia}
                          />
                        )}
                        <p className="text-muted-foreground">
                          Homologar ou tornar vigente exige versão, responsável e critério, e é validado no banco —
                          um item sem esses dados é recusado no servidor.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </li>
            ))}
          </ul>
        )}

        {aArquivar && (
          <section
            role="dialog"
            aria-label="Arquivamento lógico de item da Biblioteca"
            className="rounded-xl border border-border bg-card p-4"
          >
            <h2 className="text-sm font-medium text-foreground">Arquivar “{aArquivar.titulo}”</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Não existe exclusão física: o item deixa de ser elegível, permanece rastreável no Arquivo histórico e o
              motivo fica registrado.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              aria-label="Motivo do arquivamento"
              placeholder="Motivo do arquivamento (mínimo 5 caracteres)"
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {erroArquivo && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {erroArquivo}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={arquivar.isPending}
                onClick={() => arquivar.mutate({ id: aArquivar.id, fonte: aArquivar.fonte, motivo })}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
              >
                {arquivar.isPending ? "Arquivando…" : "Confirmar arquivamento"}
              </button>
              <button
                type="button"
                onClick={() => setAArquivar(null)}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {sub === "governanca" && <ManifestoResgate />}
      </div>
    </SaasShell>
  );
}

function FormularioVigencia({
  item,
  candidatos,
  onSalvar,
  salvando,
  erro,
}: {
  item: ItemBiblioteca;
  candidatos: ItemBiblioteca[];
  onSalvar: (v: {
    id: string;
    estado: EstadoVigencia;
    criterio?: string;
    sucessorId?: string | null;
    justificativa?: string;
    motivoSuspensao?: string;
  }) => void;
  salvando: boolean;
  erro: string | null;
}) {
  const [estado, setEstado] = useState<EstadoVigencia>((item.vigencia ?? "rascunho") as EstadoVigencia);
  const [criterio, setCriterio] = useState(item.homologacaoCriterio ?? "");
  const [sucessor, setSucessor] = useState(item.sucessorId ?? "");
  const [justificativa, setJustificativa] = useState("");
  const [motivoSuspensao, setMotivoSuspensao] = useState("");

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSalvar({ id: item.id, estado, criterio, sucessorId: sucessor || null, justificativa, motivoSuspensao });
      }}
    >
      <label className="block">
        <span className="text-muted-foreground">Novo estado de vigência</span>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoVigencia)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
        >
          {ESTADOS_VIGENCIA.filter((o) => o.valor !== "arquivado").map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
      </label>
      {(estado === "homologado" || estado === "vigente") && (
        <label className="block">
          <span className="text-muted-foreground">Critério ou evidência de homologação</span>
          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          />
        </label>
      )}
      {estado === "suspenso" && (
        <label className="block">
          <span className="text-muted-foreground">Motivo da suspensão (bloqueia novo uso imediatamente)</span>
          <textarea
            value={motivoSuspensao}
            onChange={(e) => setMotivoSuspensao(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          />
        </label>
      )}
      {estado === "substituido" && (
        <label className="block">
          <span className="text-muted-foreground">Item sucessor</span>
          <select
            value={sucessor}
            onChange={(e) => setSucessor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
          >
            <option value="">Selecione o sucessor</option>
            {candidatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo} {c.versao ? `(v${c.versao})` : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="text-muted-foreground">Justificativa da mudança (registro append-only)</span>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
        />
      </label>

      {erro && (
        <p role="alert" className="text-destructive">
          {erro}
        </p>
      )}
      <button
        type="submit"
        disabled={salvando}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
      >
        {salvando ? "Registrando…" : "Registrar mudança de vigência"}
      </button>
    </form>
  );
}
