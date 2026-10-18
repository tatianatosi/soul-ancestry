import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, BookOpen, Bookmark, Database, FileText, Scale } from "lucide-react";

import { SaasShell } from "@/components/saas/shell";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { Button } from "@/components/ui/button";
import { CaCard } from "@/components/ui/ca-card";
import { ManifestoResgate } from "@/components/governanca/manifesto";
import { CadeiaSuprimentoPesquisa } from "@/components/pesquisa/cadeia-suprimento";

import { FilaPublicacaoReal } from "@/components/biblioteca/fila-publicacao-real";
import { ConteudoEditorialConectado } from "@/components/biblioteca/conteudo-editorial-conectado";
import { PesquisaConectada } from "@/components/desk/superficies-kit-conectadas";
import { MAPA_CENTRO_INTELIGENCIA, SUBAREAS_BIBLIOTECA, type SubareaBiblioteca } from "@/lib/biblioteca-mestre";
import { rotuloFonteNegocio } from "@/lib/rotulo-negocio";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  arquivarItemBiblioteca,
  definirVigenciaItem,
  ESTADOS_VIGENCIA,
  historicoVigenciaItem,
  homologarTrilhaOuRegra,
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
        {(error as Error).message}
      </p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Biblioteca Mestre" descricao="Conteúdo não encontrado.">
      <p className="text-sm text-navy/65">Nada a exibir.</p>
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
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(aArquivar !== null && motivo.trim() !== "");
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [erroVigencia, setErroVigencia] = useState<string | null>(null);
  const [gestaoAberta, setGestaoAberta] = useState(false);
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

  const [erroHomologacao, setErroHomologacao] = useState<string | null>(null);
  const homologar = useMutation({
    mutationFn: (v: { id: string; fonte: "trilhas" | "juridico"; criterio: string; justificativa?: string }) =>
      homologarTrilhaOuRegra({ data: v }),
    onSuccess: async () => {
      setErroHomologacao(null);
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-mestre"] });
    },
    onError: (e: Error) => setErroHomologacao(e.message),
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

  const meta =
    SUBAREAS_BIBLIOTECA.find((s) => s.chave === sub && s.naFace !== false) ??
    SUBAREAS_BIBLIOTECA.find((s) => s.chave === "acervo")!;
  const carregando = geral.isLoading || catalogo.isLoading;
  /**
   * Leitura em duas consultas. Se qualquer uma falhar, a tela mostra o erro:
   * lista incompleta nunca passa por acervo vazio.
   */
  const erroLeitura = geral.error ?? catalogo.error;
  const listaCarregada = geral.data && catalogo.data ? lista : undefined;
  const entradas: Array<{
    label: string;
    descricao: string;
    chave: SubareaBiblioteca;
    Icone: typeof Archive;
  }> = [
    { label: "Acervo", descricao: "Materiais internos aprovados", chave: "acervo", Icone: Archive },
    { label: "Bases Genealógicas", descricao: "Repositórios e arquivos", chave: "bases", Icone: Database },
    { label: "Dicionários", descricao: "Termos e taxonomias", chave: "dicionarios", Icone: BookOpen },
    { label: "Trilhas Jurídicas", descricao: "Regras versionadas", chave: "juridico", Icone: Scale },
    { label: "Modelos", descricao: "Sem fonte própria; leitura da categoria Modelos do acervo", chave: "modelos", Icone: FileText },
    { label: "Referências", descricao: "Entrada de consulta do mesmo acervo, sem coleção paralela", chave: "acervo", Icone: Bookmark },
  ];

  const abrirEntrada = (chave: SubareaBiblioteca) => {
    setSub(chave);
    setDetalhe(null);
    setGestaoAberta(true);
    window.requestAnimationFrame(() => document.getElementById("gestao-biblioteca")?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <SaasShell
      titulo="Biblioteca Mestre"
      descricao="Base operacional interna do Desk: referências estruturadas que alimentam pesquisa, relatórios e operação. Nada aqui é exposto ao App Cliente."
      visualKit="pantone"
    >
      <PesquisaConectada />
      <section className="mt-7" aria-labelledby="entradas-biblioteca">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Biblioteca Mestre</p>
          <h2 id="entradas-biblioteca" className="mt-1 font-serif text-2xl text-navy">Entradas de referência</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entradas.map(({ label, descricao, chave, Icone }) => {
            const quantidade = contadores.get(chave);
            return (
              <Button
                key={label}
                type="button"
                variant="ghost"
                onClick={() => abrirEntrada(chave)}
                className="group grid h-auto min-h-32 grid-cols-[auto_minmax(0,1fr)] items-start gap-3 whitespace-normal rounded-none border-t-2 border-gold bg-background/60 p-4 text-left shadow-sm transition hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-navy text-cream">
                  <Icone className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-lg leading-tight text-navy">{label}</span>
                  <span className="mt-1 block text-xs leading-snug text-navy/60">{descricao}</span>
                  <span className="mt-3 block text-xs font-semibold text-navy">
                    {carregando ? "Carregando…" : erroLeitura ? "Leitura indisponível" : quantidade ? `${quantidade} ${quantidade === 1 ? "registro" : "registros"}` : "Sem registros"}
                  </span>
                  {label === "Modelos" || label === "Referências" ? (
                    <span className="mt-1 block text-[11px] text-navy/50">Fonte compartilhada declarada</span>
                  ) : null}
                </span>
              </Button>
            );
          })}
        </div>
      </section>
      <details
        id="gestao-biblioteca"
        open={gestaoAberta}
        onToggle={(evento) => setGestaoAberta(evento.currentTarget.open)}
        className="mt-6 rounded-lg border border-navy/15 bg-cream/40 p-4"
      >
        <summary className="cursor-pointer font-medium text-navy">Abrir gestão da Biblioteca</summary>
        <div className="mt-5 space-y-6 border-t border-navy/10 pt-5">
        <FilaPublicacaoReal />
        <ConteudoEditorialConectado />
        {/*
          DSA-6-BIBLIOTECA (21/09/2026): sexto consumidor do Desk a usar
          `CaCard` (após DSA-1 a DSA-5), aplicado a este mapa read-only do
          Centro de Inteligência. Só o invólucro muda, de <section> cru para
          CaCard; a tabela, os demais blocos da gestão ("Da Biblioteca até o
          App Cliente", fila de publicação, entradas de referência) e toda
          mutation continuam intocados.
        */}
        <CaCard titulo="Centro de Inteligência" eyebrow="Biblioteca Mestre">
          <p className="mb-3 mt-1 text-sm text-navy/65">
            As nove áreas do Centro de Inteligência e onde cada uma mora hoje. Nenhum dado é movido ou copiado por
            este mapa: ele só declara a casa de cada núcleo e nomeia a fonte concorrente onde ela existe de fato.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="py-2 pr-3">Área</th>
                  <th className="py-2 pr-3">Casa</th>
                  <th className="py-2 pr-3">Fonte</th>
                  <th className="py-2">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {MAPA_CENTRO_INTELIGENCIA.map((l) => (
                  <tr key={l.area}>
                    <td className="py-2 pr-3 font-medium text-navy">{l.area}</td>
                    <td className="py-2 pr-3 text-navy/65">{l.casa}</td>
                    <td className="py-2 pr-3 text-navy/65">
                      {rotuloFonteNegocio(l.fonte)}
                      <details className="mt-1">
                        <summary className="cursor-pointer text-[10px] text-navy/50">
                          Detalhes técnicos
                        </summary>
                        <code className="mt-1 block font-mono text-[10px]">{l.fonte}</code>
                      </details>
                    </td>
                    <td className="py-2 text-navy/65">{l.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CaCard>

        <section className="rounded-xl border border-navy/10 bg-cream/50 p-4">
          <h2 className="font-serif text-lg text-navy">Da Biblioteca até o App Cliente</h2>
          <p className="mb-3 mt-1 text-sm text-navy/65">
            Bases Genealógicas, Dicionários e Trilhas são o insumo da pesquisa. O caminho é único e nenhum elo é
            pulado.
          </p>
          <CadeiaSuprimentoPesquisa compacto />
        </section>

        <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">

          {SUBAREAS_BIBLIOTECA.filter((s) => s.naFace !== false).map((s) => (
            <button
              key={s.chave}
              type="button"
              onClick={() => {
                setSub(s.chave);
                setDetalhe(null);
              }}
              className={`rounded-xl border p-3 text-left transition ${
                sub === s.chave
                  ? "border-gold bg-gold/15 text-navy"
                  : "border-navy/10 bg-cream/40 text-navy hover:border-gold/60"
              }`}
            >
              <div className="text-sm font-medium">{s.label}</div>
              <div className="text-xs text-navy/60">
                {contadores.get(s.chave) ?? 0} {(contadores.get(s.chave) ?? 0) === 1 ? "item" : "itens"}
              </div>
            </button>
          ))}
        </section>

        <section className="rounded-xl border border-navy/10 bg-cream/50 p-4">
          <h2 className="font-serif text-lg text-navy">{meta.label}</h2>
          <p className="mt-1 text-sm text-navy/65">{meta.finalidade}</p>
          <p className="mt-2 text-xs text-navy/55">Regra interna: {meta.regra}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {meta.dimensoes.map((d) => (
              <span key={d} className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-xs text-navy/70">
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
            className="rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm text-navy"
            aria-label="Buscar na Biblioteca Mestre"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status"
            className="rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm text-navy"
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
            className="rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm text-navy"
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
            className="rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm text-navy"
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
            className="rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm text-navy"
          >
            <option value="ativos">Somente vigentes</option>
            <option value="arquivados">Somente arquivados</option>
            <option value="todos">Vigentes e arquivados</option>
          </select>
        </section>

        <EstadoDados<ItemBiblioteca>
          carregando={carregando}
          erro={erroLeitura}
          dados={listaCarregada}
          aoTentarNovamente={() => {
            void geral.refetch();
            void catalogo.refetch();
          }}
          recurso="a Biblioteca Mestre"
          vazio="Nenhum registro nesta subárea com os filtros atuais. Os itens entram pelas rotinas internas de curadoria e permanecem restritos ao Desk."
        >
          {(itensVisiveis) => (
          <ul className="grid gap-3 lg:grid-cols-2">
            {itensVisiveis.map((i) => (
              <li key={i.id} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy">{i.titulo}</div>
                    {i.subtitulo && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-navy/60">{i.subtitulo}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {i.status && (
                      <span className="rounded-full border border-navy/15 bg-cream px-2 py-0.5 text-xs text-navy/70">
                        {i.status}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        i.arquivado
                          ? "border border-navy/15 bg-cream text-navy/60"
                          : i.homologado
                            ? "border border-gold/40 bg-gold/15 text-navy"
                            : "border border-terracotta/30 bg-terracotta/10 text-terracotta"
                      }`}
                    >
                      {i.arquivado ? "Arquivado" : i.homologado ? "Homologado" : "Não homologado"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
                  {i.codigo && <span>Código: {i.codigo}</span>}
                  {i.versao && <span>Versão: {i.versao}</span>}
                  {i.responsavel && <span>Responsável: {i.responsavel}</span>}
                  {i.revisadoEm && <span>Revisão: {String(i.revisadoEm).slice(0, 10)}</span>}
                  {i.arquivado && <span>Arquivado: {i.motivoArquivo ?? "sem motivo registrado"}</span>}
                </div>
                <p className="mt-2 text-xs text-navy/65">Regra: {i.regraHomologacao}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setDetalhe(detalhe?.id === i.id ? null : i)}
                    className="text-xs font-medium text-navy underline-offset-2 hover:underline"
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
                      className="text-xs font-medium text-navy/65 underline-offset-2 hover:underline"
                    >
                      Arquivar item
                    </button>
                  )}
                </div>
                {detalhe?.id === i.id && (
                  <div className="mt-3 space-y-3 border-t border-navy/10 pt-3 text-xs">
                    <dl className="space-y-1">
                      {i.detalhes.length === 0 ? (
                        <p className="text-navy/65">Sem campos adicionais registrados.</p>
                      ) : (
                        i.detalhes.map((d) => (
                          <div key={d.rotulo} className="flex gap-2">
                            <dt className="shrink-0 text-navy/65">{d.rotulo}:</dt>
                            <dd className="text-foreground">{d.valor}</dd>
                          </div>
                        ))
                      )}
                    </dl>
                    {i.fonte === "acervo" && (
                      <div className="space-y-2 rounded-lg border border-navy/10 bg-cream/30 p-3">
                        <p className="text-foreground">
                          Vigência atual:{" "}
                          <strong>
                            {ESTADOS_VIGENCIA.find((e) => e.valor === (i.vigencia ?? "rascunho"))?.rotulo}
                          </strong>
                        </p>
                        <p className="text-navy/65">
                          Critério/evidência de homologação: {i.homologacaoCriterio ?? "não registrado"}
                          {i.homologadoEm ? ` · homologado em ${String(i.homologadoEm).slice(0, 10)}` : ""}
                        </p>
                        {i.predecessorId && (
                          <p className="text-navy/65">
                            Substitui o item anterior: <code>{i.predecessorId}</code>
                          </p>
                        )}
                        {i.sucessorId && (
                          <p className="text-navy/65">
                            Substituído pelo sucessor: <code>{i.sucessorId}</code>
                          </p>
                        )}
                        {!i.arquivado && (
                          <FormularioVigencia
                            item={i}
                            candidatos={itens.filter((c) => c.fonte === "acervo" && c.id !== i.id && !c.arquivado)}
                            onSalvar={async (v) => {
                              try {
                                await vigencia.mutateAsync(v);
                              } catch {
                                /* falha já exibida em erroVigencia */
                              }
                            }}
                            salvando={vigencia.isPending}
                            erro={erroVigencia}
                          />
                        )}
                        {dependencias.length > 0 && (
                          <div className="rounded-lg border border-navy/10 p-2">
                            <p className="font-medium">Revalidar dependências após a troca de vigência</p>
                            <ul className="mt-1 space-y-0.5 text-navy/65">
                              {dependencias.map((d) => (
                                <li key={d.id}>
                                  • {d.titulo} {d.versao ? `(v${d.versao})` : ""} — {d.vinculo}: {d.pendencia}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="text-navy/65">
                          Homologar, tornar vigente, substituir, suspender ou arquivar exige perfil admin/operações e é
                          validado no banco: versão, responsável, critério, sucessor recíproco e motivo de suspensão são
                          obrigatórios, e cada transição grava evento append-only com ator, data, estado anterior e novo.
                          Item substituído, suspenso ou arquivado continua legível, mas sai dos seletores de nova
                          utilização (proposta, contrato, OS e templates).
                        </p>

                      </div>
                    )}
                    {(i.fonte === "trilhas" || i.fonte === "juridico") && !i.arquivado && (
                      <div className="space-y-2 rounded-lg border border-navy/10 bg-cream/30 p-3">
                        <p className="text-foreground">
                          Homologação atual:{" "}
                          <strong>{i.homologado ? "Homologada/aprovada" : "Não homologada"}</strong>
                        </p>
                        {!i.homologado && (
                          <FormularioHomologacaoSimples
                            item={i}
                            onSalvar={async (v) => {
                              try {
                                await homologar.mutateAsync(v);
                              } catch {
                                /* falha já exibida em erroHomologacao */
                              }
                            }}
                            salvando={homologar.isPending}
                            erro={erroHomologacao}
                          />
                        )}
                        <p className="text-navy/65">
                          Homologar exige critério ou evidência registrada e é revalidado no servidor. A trilha ou
                          regra segue legível e navegável mesmo antes de homologada; homologar não versiona nem altera
                          nenhum outro campo do registro.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </li>
            ))}
          </ul>
          )}
        </EstadoDados>

        {aArquivar && (
          <section
            role="dialog"
            aria-label="Arquivamento lógico de item da Biblioteca"
            className="rounded-xl border border-navy/10 bg-cream/50 p-4"
          >
            <h2 className="text-sm font-medium text-foreground">Arquivar “{aArquivar.titulo}”</h2>
            <p className="mt-1 text-xs text-navy/65">
              Não existe exclusão física: o item deixa de ser elegível, permanece rastreável no Arquivo histórico e o
              motivo fica registrado.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              aria-label="Motivo do arquivamento"
              placeholder="Motivo do arquivamento (mínimo 5 caracteres)"
              className="mt-3 w-full rounded-lg border border-navy/20 bg-cream px-3 py-2 text-sm"
            />
            {erroArquivo && (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {erroArquivo}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-start gap-2">
              <AcaoOperacional
                size="sm"
                rotulo={arquivar.isPending ? "Arquivando…" : "Confirmar arquivamento"}
                capacidade="editar_rascunho"
                efeito="Torna o item inelegível para novos usos. Nada é excluído: o registro segue legível no Arquivo histórico."
                onConfirmar={async () => {
                  try {
                    await arquivar.mutateAsync({ id: aArquivar.id, fonte: aArquivar.fonte, motivo });
                  } catch {
                    /* falha já exibida em erroArquivo */
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setAArquivar(null)}
                className="rounded-lg border border-navy/20 px-3 py-2 text-xs font-medium text-navy/65"
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {sub === "governanca" && <ManifestoResgate />}
        </div>
      </details>
    </SaasShell>
  );
}

function FormularioHomologacaoSimples({
  item,
  onSalvar,
  salvando,
  erro,
}: {
  item: ItemBiblioteca;
  onSalvar: (v: { id: string; fonte: "trilhas" | "juridico"; criterio: string; justificativa?: string }) => void | Promise<void>;
  salvando: boolean;
  erro: string | null;
}) {
  const [criterio, setCriterio] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const pendencias: string[] = [];
  if (!criterio.trim()) pendencias.push("Critério ou evidência de homologação em branco.");

  return (
    <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
      <label className="block">
        <span className="text-navy/65">Critério ou evidência de homologação</span>
        <textarea
          value={criterio}
          onChange={(e) => setCriterio(e.target.value)}
          rows={2}
          placeholder="Ex.: aprovação jurídica já dada fora do sistema, referência do parecer, decisão registrada"
          className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
        />
      </label>
      <label className="block">
        <span className="text-navy/65">Justificativa (opcional)</span>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
        />
      </label>
      {erro && (
        <p role="alert" className="text-destructive">
          {erro}
        </p>
      )}
      <AcaoOperacional
        size="sm"
        rotulo={salvando ? "Homologando…" : "Homologar"}
        capacidade="criar_versao_derivada"
        pendenciaGate={pendencias.length ? pendencias.join(" ") : null}
        efeito="Marca a trilha ou regra jurídica como homologada/aprovada e grava evento auditado com ator e critério."
        onConfirmar={async (motivo) => {
          await onSalvar({
            id: item.id,
            fonte: item.fonte as "trilhas" | "juridico",
            criterio,
            justificativa: [justificativa, motivo].filter((t) => t.trim()).join(" — ") || undefined,
          });
        }}
      />
    </form>
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
  }) => void | Promise<void>;
  salvando: boolean;
  erro: string | null;
}) {
  const [estado, setEstado] = useState<EstadoVigencia>((item.vigencia ?? "rascunho") as EstadoVigencia);
  const [criterio, setCriterio] = useState(item.homologacaoCriterio ?? "");
  const [sucessor, setSucessor] = useState(item.sucessorId ?? "");
  const [justificativa, setJustificativa] = useState("");
  const [motivoSuspensao, setMotivoSuspensao] = useState("");
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    justificativa.trim() !== "" || motivoSuspensao.trim() !== "" || sucessor !== (item.sucessorId ?? ""),
  );

  /**
   * Pendências do próprio estado escolhido. Não desabilitam o registro: viram
   * gate na confirmação, com motivo escrito e auditado.
   */
  const pendencias: string[] = [];
  if ((estado === "homologado" || estado === "vigente") && !criterio.trim()) {
    pendencias.push("Critério ou evidência de homologação em branco.");
  }
  if (estado === "suspenso" && !motivoSuspensao.trim()) {
    pendencias.push("Motivo da suspensão em branco.");
  }
  if (estado === "substituido" && !sucessor) {
    pendencias.push("Item sucessor não selecionado.");
  }
  if (!justificativa.trim()) {
    pendencias.push("Justificativa da mudança em branco.");
  }

  return (
    <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
      <label className="block">
        <span className="text-navy/65">Novo estado de vigência</span>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoVigencia)}
          className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
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
          <span className="text-navy/65">Critério ou evidência de homologação</span>
          <textarea
            value={criterio}
            onChange={(e) => setCriterio(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
          />
        </label>
      )}
      {estado === "suspenso" && (
        <label className="block">
          <span className="text-navy/65">Motivo da suspensão (bloqueia novo uso imediatamente)</span>
          <textarea
            value={motivoSuspensao}
            onChange={(e) => setMotivoSuspensao(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
          />
        </label>
      )}
      {estado === "substituido" && (
        <label className="block">
          <span className="text-navy/65">Item sucessor</span>
          <select
            value={sucessor}
            onChange={(e) => setSucessor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
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
        <span className="text-navy/65">Justificativa da mudança (registro append-only)</span>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-navy/20 bg-cream px-2 py-1.5 text-xs"
        />
      </label>

      {erro && (
        <p role="alert" className="text-destructive">
          {erro}
        </p>
      )}
      {/*
        Onda 5 dos órfãos (03/10/2026): `historicoVigenciaItem` lê os eventos
        append-only de `master_library_state_events` — estado anterior, novo,
        justificativa, versão, responsável, critério — e não tinha chamador
        nenhum. A tela registrava mudança de vigência e não deixava ninguém
        ver o que já havia sido registrado.
      */}
      <HistoricoVigencia itemId={item.id} />

      <AcaoOperacional
        size="sm"
        rotulo={salvando ? "Registrando…" : "Registrar mudança de vigência"}
        capacidade="criar_versao_derivada"
        pendenciaGate={pendencias.length ? pendencias.join(" ") : null}
        efeito="Grava a nova vigência do item e o evento append-only com ator, data e estado anterior."
        onConfirmar={async (motivo) => {
          await onSalvar({
            id: item.id,
            estado,
            criterio,
            sucessorId: sucessor || null,
            justificativa: [justificativa, motivo].filter((t) => t.trim()).join(" — "),
            motivoSuspensao,
          });
        }}
      />
    </form>
  );
}

function HistoricoVigencia({ itemId }: { itemId: string }) {
  const carregar = useServerFn(historicoVigenciaItem);
  const [aberto, setAberto] = useState(false);
  const q = useQuery({
    queryKey: ["historico-vigencia", itemId],
    queryFn: () => carregar({ data: { id: itemId } }),
    enabled: aberto,
    retry: false,
  });

  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-2">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="text-[11px] uppercase tracking-wide text-navy/50 underline decoration-gold"
      >
        {aberto ? "Ocultar histórico de vigência" : "Ver histórico de vigência"}
      </button>
      {aberto ? (
        q.isLoading ? (
          <p className="mt-1 text-[11px] text-navy/50">Carregando o histórico…</p>
        ) : q.isError ? (
          <p role="alert" className="mt-1 text-[11px] text-destructive">
            {(q.error as Error).message}
          </p>
        ) : (
          (() => {
            const eventos = ((q.data as any)?.eventos ?? []) as any[];
            if (eventos.length === 0) {
              return (
                <p className="mt-1 text-[11px] text-navy/55">
                  Nenhuma mudança de vigência registrada para este item.
                </p>
              );
            }
            return (
              <ul className="mt-1 space-y-1">
                {eventos.map((e) => (
                  <li key={e.id} className="text-[11px] text-navy/70">
                    {(e.estado_anterior ?? "—")} → {(e.estado_novo ?? "—")}
                    {e.versao ? ` · v${e.versao}` : ""}
                    {e.responsavel ? ` · ${e.responsavel}` : ""}
                    {e.created_at ? ` · ${new Date(e.created_at).toLocaleString("pt-BR")}` : ""}
                    {e.justificativa ? (
                      <>
                        <br />
                        <span className="text-navy/45">{e.justificativa}</span>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            );
          })()
        )
      ) : null}
    </div>
  );
}

