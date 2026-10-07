/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Catálogo de produtos-pai — tabela de preços vigente, com CRUD real
 * (07/10/2026). Fonte única da calculadora de orçamento
 * (`orcamento-produtos-pai.functions.ts`): cria, edita e arquiva com motivo
 * em `price_catalog_rescued`. Nunca exclui fisicamente uma linha.
 *
 * `legacy_sku_mappings` (SKU legado → produto-pai) continua somente leitura
 * no Desk, por decisão já registrada — não ganha formulário aqui.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { EstadoDados } from "@/components/saas/estado-dados";
import { inputCls } from "@/components/comercial/base";
import {
  arquivarPrecoCatalogo,
  criarPrecoCatalogo,
  editarPrecoCatalogo,
  listarPrecosCatalogoGerenciavel,
} from "@/lib/catalogo-precos-produtos-pai.functions";
import {
  PRICE_COMPONENT_VALUES,
  PRICE_STATUS_VALUES,
  ROTULO_PRICE_COMPONENT,
  ROTULO_PRICE_STATUS,
  agruparPrecosPorPais,
  type LinhaPrecoCatalogo,
} from "@/lib/catalogo-precos-produtos-pai";

const QK = ["catalogo-precos-produtos-pai"];

const moedaBR = (v: number | null, moeda: string) =>
  v === null ? "sem preço" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(v);

function NovaLinhaForm({ onCriada }: { onCriada: () => void }) {
  const criar = useServerFn(criarPrecoCatalogo);
  const [form, setForm] = useState({
    country_code: "",
    price_component: PRICE_COMPONENT_VALUES[0] as string,
    price_status: "PENDENTE_DE_HOMOLOGACAO" as string,
    amount: "",
    source_type: "",
    source_reference: "",
    item_id: "",
    notes: "",
  });

  const m = useMutation({
    mutationFn: () =>
      criar({
        data: {
          country_code: form.country_code || null,
          price_component: form.price_component,
          price_status: form.price_status,
          amount: form.amount === "" ? null : Number(form.amount),
          source_type: form.source_type,
          source_reference: form.source_reference,
          item_id: form.item_id || null,
          notes: form.notes || null,
        },
      }),
    onSuccess: () => {
      toast.success("Linha de preço criada.");
      setForm({ ...form, country_code: "", amount: "", source_type: "", source_reference: "", item_id: "", notes: "" });
      onCriada();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-lg border border-navy/10 bg-white/50 p-3" data-nova-linha-preco-catalogo>
      <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Nova linha de preço</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <input
          className={inputCls}
          placeholder="País (2 letras, ex.: IT) ou vazio para módulo transversal"
          maxLength={2}
          value={form.country_code}
          onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value.toUpperCase() }))}
        />
        <select
          className={inputCls}
          value={form.price_component}
          onChange={(e) => setForm((f) => ({ ...f, price_component: e.target.value }))}
        >
          {PRICE_COMPONENT_VALUES.map((c) => (
            <option key={c} value={c}>
              {ROTULO_PRICE_COMPONENT[c]}
            </option>
          ))}
        </select>
        <select
          className={inputCls}
          value={form.price_status}
          onChange={(e) => setForm((f) => ({ ...f, price_status: e.target.value }))}
        >
          {PRICE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {ROTULO_PRICE_STATUS[s]}
            </option>
          ))}
        </select>
        <input
          className={inputCls}
          placeholder="Valor (R$) — deixe vazio se ainda sem preço"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
        />
        <input
          className={inputCls}
          placeholder="Tipo de fonte (ex.: decisao_proprietaria)"
          value={form.source_type}
          onChange={(e) => setForm((f) => ({ ...f, source_type: e.target.value }))}
        />
        <input
          className={inputCls}
          placeholder="Referência da fonte (de onde veio este valor)"
          value={form.source_reference}
          onChange={(e) => setForm((f) => ({ ...f, source_reference: e.target.value }))}
        />
        <input
          className={inputCls}
          placeholder="Item/módulo (opcional — ex.: CA-PROT-001 = processo completo)"
          value={form.item_id}
          onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}
        />
        <input
          className={inputCls}
          placeholder="Observações (opcional)"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <button
        onClick={() => m.mutate()}
        disabled={m.isPending || !form.source_type.trim() || !form.source_reference.trim()}
        className="mt-3 rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
      >
        Criar linha
      </button>
    </div>
  );
}

function LinhaEditavel({ linha, onMudou }: { linha: LinhaPrecoCatalogo; onMudou: () => void }) {
  const editar = useServerFn(editarPrecoCatalogo);
  const arquivar = useServerFn(arquivarPrecoCatalogo);
  const [amount, setAmount] = useState(linha.amount === null ? "" : String(linha.amount));
  const [status, setStatus] = useState(linha.price_status);
  const [motivo, setMotivo] = useState("");
  const [arquivando, setArquivando] = useState(false);

  const mEditar = useMutation({
    mutationFn: () => editar({ data: { id: linha.id, amount: amount === "" ? null : Number(amount), price_status: status } }),
    onSuccess: () => {
      toast.success("Linha atualizada.");
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mArquivar = useMutation({
    mutationFn: () => arquivar({ data: { id: linha.id, motivo } }),
    onSuccess: () => {
      toast.success("Linha arquivada, com motivo registrado.");
      setArquivando(false);
      setMotivo("");
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (linha.archived_at) {
    return (
      <tr className="border-t border-navy/5 text-navy/40">
        <td className="p-2">{ROTULO_PRICE_COMPONENT[linha.price_component as keyof typeof ROTULO_PRICE_COMPONENT] ?? linha.price_component}</td>
        <td className="p-2">{moedaBR(linha.amount, linha.currency)}</td>
        <td className="p-2">Arquivado</td>
        <td className="p-2 text-[11px]">{linha.archive_motivo}</td>
        <td className="p-2" />
      </tr>
    );
  }

  return (
    <tr className="border-t border-navy/5 align-top">
      <td className="p-2 text-navy/80">
        {ROTULO_PRICE_COMPONENT[linha.price_component as keyof typeof ROTULO_PRICE_COMPONENT] ?? linha.price_component}
        {linha.item_id ? <p className="text-[10px] text-navy/40">{linha.item_id}</p> : null}
      </td>
      <td className="p-2">
        <input className={inputCls + " w-28"} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </td>
      <td className="p-2">
        <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          {PRICE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {ROTULO_PRICE_STATUS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2 text-[11px] text-navy/50">
        {linha.source_reference} · {linha.source_type}
      </td>
      <td className="p-2 space-y-1">
        <button
          onClick={() => mEditar.mutate()}
          disabled={mEditar.isPending}
          className="rounded-md border border-navy/20 px-2 py-1 text-[11px] text-navy disabled:opacity-50"
        >
          Salvar
        </button>
        {arquivando ? (
          <div className="mt-1 space-y-1">
            <textarea
              className={inputCls + " w-full"}
              placeholder="Motivo do arquivamento (mínimo 10 caracteres)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            <div className="flex gap-1">
              <button
                onClick={() => mArquivar.mutate()}
                disabled={mArquivar.isPending || motivo.trim().length < 10}
                className="rounded-md bg-terracotta px-2 py-1 text-[11px] text-cream disabled:opacity-50"
              >
                Confirmar arquivamento
              </button>
              <button onClick={() => setArquivando(false)} className="rounded-md border border-navy/20 px-2 py-1 text-[11px] text-navy">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setArquivando(true)} className="block rounded-md border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta">
            Arquivar
          </button>
        )}
      </td>
    </tr>
  );
}

export function PrecosProdutosPaiCrud() {
  const carregar = useServerFn(listarPrecosCatalogoGerenciavel);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: QK, queryFn: () => carregar(), retry: false });
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

  const invalidar = () => void qc.invalidateQueries({ queryKey: QK });

  const linhas = q.data?.linhas ?? [];
  const visiveis = mostrarArquivadas ? linhas : linhas.filter((l) => !l.archived_at);
  const grupos = agruparPrecosPorPais(visiveis);

  return (
    <CaCard
      titulo="Catálogo de produtos-pai — tabela de preços"
      eyebrow="Configuração · Catálogo e preços"
      acao={
        <label className="flex items-center gap-1 text-[11px] text-navy/60">
          <input type="checkbox" checked={mostrarArquivadas} onChange={(e) => setMostrarArquivadas(e.target.checked)} />
          mostrar arquivadas
        </label>
      }
    >
      <p className="text-[11px] text-navy/50">
        Fonte única da calculadora de orçamento por produto-pai (<code>price_catalog_rescued</code>). O catálogo Top 30 /
        Planilha Mestre acima nesta página é legado — rastreabilidade, não decisão. Nada aqui é excluído fisicamente:
        arquivar sempre exige motivo e fica rastreável.
      </p>

      <div className="mt-3">
        <NovaLinhaForm onCriada={invalidar} />
      </div>

      <div className="mt-4">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={linhas}
          aoTentarNovamente={() => void q.refetch()}
          recurso="a tabela de preços do catálogo de produtos-pai"
          vazio="Nenhuma linha de preço cadastrada ainda."
        >
          {() =>
            grupos.length === 0 ? (
              <p className="text-xs text-navy/50">Nenhuma linha visível com o filtro atual.</p>
            ) : (
              <div className="space-y-4">
                {grupos.map((g) => (
                  <div key={g.pais} className="overflow-x-auto rounded-lg border border-navy/10">
                    <p className="border-b border-navy/10 bg-navy/5 p-2 text-xs font-medium text-navy">{g.pais}</p>
                    <table className="w-full text-left text-xs">
                      <thead className="text-navy/50">
                        <tr>
                          <th className="p-2">Componente</th>
                          <th className="p-2">Valor</th>
                          <th className="p-2">Estado</th>
                          <th className="p-2">Fonte</th>
                          <th className="p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.linhas.map((l) => (
                          <LinhaEditavel key={l.id} linha={l} onMudou={invalidar} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )
          }
        </EstadoDados>
      </div>
    </CaCard>
  );
}
