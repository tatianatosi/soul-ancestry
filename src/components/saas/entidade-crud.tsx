import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, Plus, Lock, Pencil } from "lucide-react";

import {
  arquivarRegistro,
  atualizarRegistro,
  criarRegistro,
  listarRegistros,
  type Entidade,
} from "@/lib/saas.functions";
import { rotuloEstado, transicoesDe, type Dominio } from "@/lib/estados";
import { BotaoTentarNovamente, EstadoVazio, useSaas } from "./shell";
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
  podeEscrever,
  dominio,
  campoEstado = "status",
  extra,
  filtrarLinhas,
  classeLinha,
  topo,
  larguraMinima = 720,
}: {
  entidade: Entidade;
  titulo: string;
  colunas: Coluna[];
  campos: Campo[];
  podeEscrever: boolean;
  dominio?: Dominio;
  campoEstado?: string;
  extra?: (linha: Record<string, unknown>, recarregar: () => void) => React.ReactNode;
  /** Filtro somente de apresentação (ex.: isolar casos demonstrativos). */
  filtrarLinhas?: (linha: Record<string, unknown>) => boolean;
  /** Classe adicional por linha (ex.: destaque visual de registro demonstrativo). */
  classeLinha?: (linha: Record<string, unknown>) => string | undefined;
  /** Controles extras exibidos acima da tabela. */
  topo?: React.ReactNode;
  /** Largura mínima da tabela em px — evita colunas espremidas quando há muitos eixos. */
  larguraMinima?: number;
}) {
  const { somenteLeitura } = useSaas();
  const queryClient = useQueryClient();
  const carregar = useServerFn(listarRegistros);
  const criar = useServerFn(criarRegistro);
  const atualizar = useServerFn(atualizarRegistro);
  const arquivar = useServerFn(arquivarRegistro);

  const [incluirArquivados, setIncluirArquivados] = useState(false);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [arquivando, setArquivando] = useState<{ id: string; motivo: string } | null>(null);

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

  const linhaEmEdicao = editandoId
    ? ((q.data ?? []) as Record<string, unknown>[]).find((l) => String(l["id"]) === editandoId)
    : undefined;

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
      const linhas = (qOrigens[idx]?.data ?? []) as Record<string, unknown>[];
      return linhas.map((l) => ({
        valor: String(l["id"]),
        rotulo: String(l[campo.origem!.rotuloChave] ?? l["id"]),
      }));
    }
    if (campo.estado && dominio) {
      if (!editandoId) return (campo.opcoes ?? []).length ? campo.opcoes! : [];
      const atual = linhaEmEdicao?.[campoEstado];
      const destinos = transicoesDe(dominio, atual);
      const atualStr = typeof atual === "string" ? atual : "";
      return [
        ...(atualStr ? [{ valor: atualStr, rotulo: `${rotuloEstado(dominio, atualStr)} (atual)` }] : []),
        ...destinos,
      ];
    }
    return campo.opcoes ?? [];
  };



  const todas = (q.data ?? []) as Record<string, unknown>[];
  const linhas = filtrarLinhas ? todas.filter(filtrarLinhas) : todas;

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
        {topo}
        {podeEscrever ? (
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
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-xs text-navy/60">
            <Lock className="h-3.5 w-3.5" />
            {somenteLeitura ? "Papel leitura: criação e arquivamento indisponíveis" : "Sem permissão de escrita"}
          </span>
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
      ) : linhas.length === 0 ? (
        <EstadoVazio mensagem={`Nenhum registro em ${titulo.toLowerCase()} ainda.`} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
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
              {linhas.map((linha) => {
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
                          <span className="text-xs text-navy/50">
                            Arquivado — {String(linha["archive_motivo"] ?? "sem motivo")}
                          </span>
                        ) : podeEscrever ? (
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
                        ) : null}

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
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5">
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

      {arquivando ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
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

