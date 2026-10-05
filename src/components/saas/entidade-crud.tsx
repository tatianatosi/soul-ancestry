import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, ArchiveRestore, Plus, Pencil } from "lucide-react";

import {
  arquivarRegistro,
  atualizarRegistro,
  criarRegistro,
  listarRegistros,
  restaurarRegistro,
  type Entidade,
} from "@/lib/saas.functions";
import { rotuloEstado, transicoesDe, type Dominio } from "@/lib/estados";
import { filtrarPorBusca } from "@/lib/rotulo-negocio";
import { BotaoTentarNovamente, EstadoVazio } from "./shell";
import { cn } from "@/lib/utils";

export type Campo = {
  chave: string;
  rotulo: string;
  tipo?: "texto" | "area" | "numero" | "data" | "select";
  opcoes?: { valor: string; rotulo: string }[];
  obrigatorio?: boolean;
  /** Campo controlado pela máquina de estados: opções variam conforme o estado atual. */
  estado?: boolean;
  /** Não editável depois de criado. */
  somenteCriacao?: boolean;
  /** Preenche o select com registros de outra entidade da mesma organização. */
  origem?: { entidade: Entidade; rotuloChave: string };
};


export type Coluna = {
  chave: string;
  rotulo: string;
  render?: (linha: Record<string, unknown>) => React.ReactNode;
};

export function EntidadeCrud({
  entidade,
  titulo,
  colunas,
  campos,
  podeEscrever: _podeEscrever,
  dominio,
  campoEstado = "status",
  extra,
  filtrarLinhas,
  classeLinha,
  topo,
  larguraMinima = 720,
  apresentacao = "tabela",
  renderCard,
  semCriacao,
}: {
  entidade: Entidade;
  titulo: string;
  colunas: Coluna[];
  campos: Campo[];
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: criar, editar e arquivar renderizam sempre e a decisão de escrita
   * é da autoridade operacional.
   */
  podeEscrever?: boolean;
  dominio?: Dominio;
  campoEstado?: string;
  extra?: (linha: Record<string, unknown>, recarregar: () => void) => React.ReactNode;
  /** Filtro somente de apresentação (ex.: isolar casos demonstrativos). */
  filtrarLinhas?: (linha: Record<string, unknown>) => boolean;
  /** Classe adicional por linha (ex.: destaque visual de registro demonstrativo). */
  classeLinha?: (linha: Record<string, unknown>) => string | undefined;
  /** Controles extras exibidos acima da tabela. */
  topo?: React.ReactNode;
  /**
   * Lista legado (fontes-pesquisa-canonicas.ts): sem registro novo; o texto
   * diz onde criar. Edição e arquivamento do que existe continuam.
   */
  semCriacao?: string;
  /** Largura mínima da tabela em px — evita colunas espremidas quando há muitos eixos. */
  larguraMinima?: number;
  /** `cards` = carteira em cartões (Casos 360); `tabela` = grade clássica. */
  apresentacao?: "tabela" | "cards";
  /** Conteúdo do cartão quando `apresentacao === "cards"`. Ações Editar/Arquivar ficam no rodapé padrão. */
  renderCard?: (linha: Record<string, unknown>) => React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const carregar = useServerFn(listarRegistros);
  const criar = useServerFn(criarRegistro);
  const atualizar = useServerFn(atualizarRegistro);
  const arquivar = useServerFn(arquivarRegistro);
  const restaurar = useServerFn(restaurarRegistro);

  const [incluirArquivados, setIncluirArquivados] = useState(false);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivando, setArquivando] = useState<{ id: string; motivo: string } | null>(null);
  const [restaurando, setRestaurando] = useState<{ id: string; motivo: string } | null>(null);

  const chave = ["saas", entidade, incluirArquivados];
  const q = useQuery({
    queryKey: chave,
    queryFn: () => carregar({ data: { entidade, incluirArquivados } }),
  });

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["saas", entidade] });
  };

  const mCriar = useMutation({
    mutationFn: (dados: Record<string, unknown>) => criar({ data: { entidade, dados } }),
    onSuccess: () => {
      setForm(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const mAtualizar = useMutation({
    mutationFn: (v: { id: string; dados: Record<string, unknown> }) =>
      atualizar({ data: { entidade, id: v.id, dados: v.dados } }),
    onSuccess: () => {
      setForm(null);
      setEditandoId(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const mArquivar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) =>
      arquivar({ data: { entidade, id: v.id, motivo: v.motivo } }),
    onSuccess: () => {
      setArquivando(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  /*
   * Par de `mArquivar`: arquivar é lógico, então desarquivar também exige
   * motivo rastreável. Sem isto, arquivar por engano só se desfazia por SQL —
   * o escritor existia desde sempre (`restaurarRegistro`) e nenhuma tela o
   * chamava. Fica aqui, no componente genérico, porque é o mesmo lugar onde
   * toda tela de entidade já arquiva: nada de segundo caminho por tela.
   */
  const mRestaurar = useMutation({
    mutationFn: (v: { id: string; motivo: string }) =>
      restaurar({ data: { entidade, id: v.id, motivo: v.motivo } }),
    onSuccess: () => {
      setRestaurando(null);
      setErro(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  const abrirEdicao = (linha: Record<string, unknown>) => {
    const inicial: Record<string, string> = {};
    for (const campo of campos) {
      const v = linha[campo.chave];
      inicial[campo.chave] = v === null || v === undefined ? "" : String(v);
    }
    setEditandoId(String(linha["id"]));
    setForm(inicial);
    setErro(null);
  };

  const carregadas = (Array.isArray(q.data) ? q.data : []) as Record<string, unknown>[];

  const linhaEmEdicao = editandoId ? carregadas.find((l) => String(l["id"]) === editandoId) : undefined;

  const origens = campos.filter((c) => c.origem);
  const qOrigens = useQueries({
    queries: origens.map((c) => ({
      queryKey: ["saas", c.origem!.entidade, false],
      queryFn: () => carregar({ data: { entidade: c.origem!.entidade, incluirArquivados: false } }),
      staleTime: 30_000,
    })),
  });

  const opcoesCampo = (campo: Campo) => {
    if (campo.origem) {
      const idx = origens.findIndex((c) => c.chave === campo.chave);
      const dadosOrigem = qOrigens[idx]?.data;
      const linhas = (Array.isArray(dadosOrigem) ? dadosOrigem : []) as Record<string, unknown>[];
      return linhas.map((l) => ({
        valor: String(l["id"]),
        rotulo: String(l[campo.origem!.rotuloChave] ?? l["id"]),
      }));
    }
    if (campo.estado && dominio) {
      if (!editandoId) return campo.opcoes ? campo.opcoes : [];
      const atual = linhaEmEdicao?.[campoEstado];
      const destinos = transicoesDe(dominio, atual);
      const atualStr = typeof atual === "string" ? atual : "";
      return [
        ...(atualStr ? [{ valor: atualStr, rotulo: `${rotuloEstado(dominio, atualStr)} (atual)` }] : []),
        ...destinos,
      ];
    }
    return campo.opcoes ? campo.opcoes : [];
  };

  const linhas = filtrarLinhas ? carregadas.filter(filtrarLinhas) : carregadas;
  const linhasBusca = filtrarPorBusca(linhas, busca, colunas.map((c) => c.chave));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-navy/70">
          <input
            type="checkbox"
            checked={incluirArquivados}
            onChange={(e) => setIncluirArquivados(e.target.checked)}
          />
          Mostrar arquivados
        </label>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar nos registros visíveis"
          className="min-w-[200px] flex-1 rounded-lg border border-navy/20 px-3 py-2 text-sm"
        />
        {topo}
        {/*
          Autoridade operacional: criar registro renderiza sempre. O aviso de
          "papel leitura" que substituía o botão foi removido.
        */}
        {semCriacao ? (
          <p className="max-w-md text-xs text-navy/70" data-lista-legado>
            {semCriacao}
          </p>
        ) : (
          <button
            onClick={() => {
              setEditandoId(null);
              setErro(null);
              setForm({});
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream hover:bg-navy-soft"
          >
            <Plus className="h-4 w-4" /> Novo registro
          </button>
        )}
      </div>

      {erro ? (
        <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          Ação bloqueada: {erro}
        </p>
      ) : null}

      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando…" />
      ) : q.isError ? (
        <EstadoVazio
          mensagem={`Não foi possível carregar ${titulo.toLowerCase()}.`}
          acao={<BotaoTentarNovamente aoClicar={() => void q.refetch()} />}
        />
      ) : linhasBusca.length === 0 ? (
        <EstadoVazio
          mensagem={
            busca.trim()
              ? "Nenhum registro corresponde à busca."
              : `Nenhum registro em ${titulo.toLowerCase()} ainda.`
          }
        />
      ) : apresentacao === "cards" && renderCard ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {linhasBusca.map((linha) => {
            const arquivado = Boolean(linha["archived_at"]);
            return (
              <article
                key={String(linha["id"])}
                className={cn(
                  "flex flex-col rounded-xl border border-navy/15 bg-cream/50 p-4 shadow-sm",
                  arquivado && "opacity-55",
                  classeLinha?.(linha),
                )}
              >
                <div className="min-h-0 flex-1 space-y-3">{renderCard(linha)}</div>
                <div className="mt-4 flex flex-col gap-2 border-t border-navy/10 pt-3">
                  {extra ? extra(linha, recarregar) : null}
                  {arquivado ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-navy/50">
                        Arquivado — {String(linha["archive_motivo"] ?? "sem motivo")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setErro(null);
                          setRestaurando({ id: String(linha["id"]), motivo: "" });
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-xs text-navy hover:bg-gold/20"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" /> Restaurar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(linha)}
                        className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErro(null);
                          setArquivando({ id: String(linha["id"]), motivo: "" });
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                      >
                        <Archive className="h-3.5 w-3.5" /> Arquivar
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
          <table className="w-full text-sm" style={{ minWidth: `${larguraMinima}px` }}>
            <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
              <tr>
                {colunas.map((c) => (
                  <th key={c.chave} className="px-4 py-3 font-medium">
                    {c.rotulo}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {linhasBusca.map((linha) => {
                const arquivado = Boolean(linha["archived_at"]);
                return (
                  <tr key={String(linha["id"])} className={cn("border-t border-navy/5", arquivado && "opacity-55", classeLinha?.(linha))}>
                    {colunas.map((c) => (
                      <td key={c.chave} className="px-4 py-3 align-top">
                        {c.render ? c.render(linha) : (linha[c.chave] as string) || "—"}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-right align-top">
                      <div className="flex flex-col items-end gap-2">
                        {extra ? extra(linha, recarregar) : null}
                        {arquivado ? (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="text-xs text-navy/50">
                              Arquivado — {String(linha["archive_motivo"] ?? "sem motivo")}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setErro(null);
                                setRestaurando({ id: String(linha["id"]), motivo: "" });
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-xs text-navy hover:bg-gold/20"
                            >
                              <ArchiveRestore className="h-3.5 w-3.5" /> Restaurar
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => abrirEdicao(linha)}
                              className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => {
                                setErro(null);
                                setArquivando({ id: String(linha["id"]), motivo: "" });
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                            >
                              <Archive className="h-3.5 w-3.5" /> Arquivar
                            </button>
                          </div>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {form ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-cream p-5">
            <h2 className="font-serif text-xl">
              {editandoId ? "Editar registro" : "Novo registro"} — {titulo}
            </h2>
            <p className="mt-1 text-xs text-navy/60">
              Informação registrada como hipótese ou pendência; não representa conclusão jurídica.
            </p>
            <div className="mt-4 space-y-3">
              {campos.map((campo) => {
                const travado = Boolean(editandoId && campo.somenteCriacao);
                return (
                  <label key={campo.chave} className="block text-sm">
                    <span className="mb-1 block text-navy/70">
                      {campo.rotulo}
                      {campo.obrigatorio ? " *" : ""}
                      {travado ? " (não editável)" : ""}
                    </span>
                    {campo.tipo === "area" ? (
                      <textarea
                        rows={3}
                        disabled={travado}
                        value={form[campo.chave] ?? ""}
                        onChange={(e) => setForm({ ...form, [campo.chave]: e.target.value })}
                        className="w-full rounded-lg border border-navy/20 px-3 py-2 disabled:bg-navy/5"
                      />
                    ) : campo.tipo === "select" ? (
                      <select
                        disabled={travado}
                        value={form[campo.chave] ?? ""}
                        onChange={(e) => setForm({ ...form, [campo.chave]: e.target.value })}
                        className="w-full rounded-lg border border-navy/20 px-3 py-2 disabled:bg-navy/5"
                      >
                        <option value="">Selecione…</option>
                        {opcoesCampo(campo).map((o) => (
                          <option key={o.valor} value={o.valor}>
                            {o.rotulo}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={campo.tipo === "numero" ? "number" : campo.tipo === "data" ? "date" : "text"}
                        disabled={travado}
                        value={form[campo.chave] ?? ""}
                        onChange={(e) => setForm({ ...form, [campo.chave]: e.target.value })}
                        className="w-full rounded-lg border border-navy/20 px-3 py-2 disabled:bg-navy/5"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {campos.some((c) => c.estado) && dominio && editandoId ? (
              <p className="mt-3 rounded-lg bg-navy/5 px-3 py-2 text-xs text-navy/60">
                Só aparecem os estados permitidos a partir do estado atual. Transições fora da sequência são
                recusadas também no banco.
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setForm(null);
                  setEditandoId(null);
                }}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={mCriar.isPending || mAtualizar.isPending}
                onClick={() => {
                  const faltando = campos
                    .filter((c) => c.obrigatorio && !form[c.chave])
                    .map((c) => c.rotulo);
                  if (faltando.length) {
                    setErro(`Preencha os itens pendentes: ${faltando.join(", ")}.`);
                    return;
                  }
                  if (editandoId) {
                    const dados: Record<string, string> = {};
                    for (const campo of campos) {
                      if (campo.somenteCriacao) continue;
                      dados[campo.chave] = form[campo.chave] ?? "";
                    }
                    mAtualizar.mutate({ id: editandoId, dados });
                  } else {
                    mCriar.mutate(form);
                  }
                }}
                className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {restaurando ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-cream p-5" data-restaurar-registro>
            <h2 className="font-serif text-xl">Restaurar registro</h2>
            <p className="mt-1 text-xs text-navy/60">
              Desarquivar deixa o registro ativo de novo. Fica registrado com autor, data e motivo, no
              histórico do caso — como o arquivamento.
            </p>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-navy/70">Motivo da restauração</span>
              <textarea
                rows={3}
                value={restaurando.motivo}
                onChange={(e) => setRestaurando({ ...restaurando, motivo: e.target.value })}
                className="w-full rounded-lg border border-navy/20 px-3 py-2"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRestaurando(null)}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={mRestaurar.isPending}
                onClick={() =>
                  mRestaurar.mutate({
                    id: restaurando.id,
                    motivo: restaurando.motivo.trim() || "Motivo não informado.",
                  })
                }
                className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-50"
              >
                Restaurar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {arquivando ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-cream p-5">
            <h2 className="font-serif text-xl">Arquivar registro</h2>
            <p className="mt-1 text-xs text-navy/60">
              Não há exclusão neste sistema. O registro fica arquivado, com autor, data e motivo.
            </p>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-navy/70">Motivo do arquivamento</span>
              <textarea
                rows={3}
                value={arquivando.motivo}
                onChange={(e) => setArquivando({ ...arquivando, motivo: e.target.value })}
                className="w-full rounded-lg border border-navy/20 px-3 py-2"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setArquivando(null)}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                disabled={mArquivar.isPending}
                onClick={() =>
                  mArquivar.mutate({ id: arquivando.id, motivo: arquivando.motivo.trim() || "Motivo não informado." })
                }
                className="rounded-lg bg-terracotta px-3 py-2 text-sm text-cream disabled:opacity-50"
              >
                Arquivar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

