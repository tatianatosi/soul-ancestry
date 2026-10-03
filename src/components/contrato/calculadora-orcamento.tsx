/**
 * Calculadora de orçamento da proposta — painel do Desk (03/10/2026).
 *
 * Pedido da Proprietária: "tem uma calculadora de valor para orçamento ligado
 * a proposta revise e também execute". A revisão achou que a regra do preço
 * sugerido canônico já declarava servir à Proposta e nunca chegava nela.
 *
 * A conta é feita no servidor (a prévia também), então a tela não pode
 * divergir do que grava. Item sem preço utilizável aparece com o motivo e
 * fica fora da soma — nunca entra como zero.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { formatarDinheiro, type OrcamentoProposta } from "@/lib/orcamento-proposta";
import {
  aplicarOrcamentoNaProposta,
  calcularOrcamentoDaProposta,
  itensParaOrcamento,
  propostaRascunhoDoCaso,
} from "@/lib/orcamento-proposta.functions";

export function CalculadoraOrcamento({ caseId }: { caseId: string }) {
  const carregarItens = useServerFn(itensParaOrcamento);
  const carregarProposta = useServerFn(propostaRascunhoDoCaso);
  // A proposta alvo é resolvida aqui: só a versão em rascunho do caso recebe
  // orçamento. Proposta enviada ou aprovada é snapshot (o servidor recusa).
  const qProposta = useQuery({
    queryKey: ["proposta-rascunho", caseId],
    queryFn: () => carregarProposta({ data: { caseId } }),
    retry: false,
  });
  const propostaId = qProposta.data?.id ?? null;
  const calcular = useServerFn(calcularOrcamentoDaProposta);
  const aplicar = useServerFn(aplicarOrcamentoNaProposta);

  const q = useQuery({ queryKey: ["itens-orcamento"], queryFn: () => carregarItens(), retry: false });
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [ajuste, setAjuste] = useState("");
  const [ajusteMotivo, setAjusteMotivo] = useState("");
  const [resultado, setResultado] = useState<{ orcamento: OrcamentoProposta; recusa: string | null } | null>(null);

  const selecionados = Object.entries(quantidades)
    .filter(([, n]) => n > 0)
    .map(([skuId, quantidade]) => ({ skuId, quantidade }));

  const corpo = () => ({
    caseId,
    itens: selecionados,
    ajuste: Number(String(ajuste).replace(/\./g, "").replace(",", ".")) || 0,
    ajusteMotivo,
  });

  const mCalcular = useMutation({
    mutationFn: () => calcular({ data: corpo() }),
    onSuccess: (r) => setResultado(r),
    onError: (e: Error) => toast.error(e.message),
  });

  const mAplicar = useMutation({
    mutationFn: () => aplicar({ data: { ...corpo(), propostaId: propostaId as string } }),
    onSuccess: (r) => toast.success(`Orçamento aplicado na proposta: ${formatarDinheiro(r.total, r.moeda)}.`),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4" data-calculadora-orcamento>
      <h3 className="font-serif text-base text-navy">Calculadora de orçamento da proposta</h3>
      <p className="mt-1 text-[11px] text-navy/50">
        Compõe o valor a partir do preço sugerido canônico de cada item, com quantidade por requerente. Preço sugerido
        é referência interna: não é preço homologado para cobrança, não gera parcela nem link de pagamento.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os itens com preço de referência"
      >
        {(itens) => (
          <div className="mt-3 space-y-3">
            <ul className="max-h-72 space-y-1 overflow-y-auto rounded border border-navy/10 bg-white/60 p-2">
              {itens
                .filter((i) => i.ofertavel)
                .map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center gap-2 text-[11px] text-navy/70">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-14 rounded border border-navy/15 px-1 py-0.5 text-[11px]"
                      value={quantidades[i.id] ?? 0}
                      onChange={(e) =>
                        setQuantidades((q0) => ({ ...q0, [i.id]: Math.max(0, Math.trunc(Number(e.target.value) || 0)) }))
                      }
                      aria-label={`Quantidade de ${i.code ?? i.nome ?? "item"}`}
                    />
                    <span className="text-navy">{i.code}</span>
                    <span className="min-w-0 flex-1 truncate">{i.nome}</span>
                    {i.utilizavel && i.valor !== null ? (
                      <span className="text-navy/60">{formatarDinheiro(i.valor, i.moeda)}</span>
                    ) : (
                      <span className="text-terracotta">{i.motivos[0] ?? "sem preço utilizável"}</span>
                    )}
                  </li>
                ))}
            </ul>

            <div className="grid gap-2 sm:grid-cols-2">
              <Texto
                label="Condição particular (diferença em reais)"
                valor={ajuste}
                onChange={setAjuste}
                ajuda="Opcional. Negativo desconta. Só entra no total com motivo registrado."
              />
              <Texto label="Motivo da condição particular" valor={ajusteMotivo} onChange={setAjusteMotivo} />
            </div>

            <button
              type="button"
              disabled={selecionados.length === 0 || mCalcular.isPending}
              onClick={() => mCalcular.mutate()}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
            >
              Calcular orçamento
            </button>

            {resultado ? (
              <div className="rounded-lg border border-gold/40 bg-gold/5 p-3" data-orcamento-resultado>
                <ul className="space-y-0.5">
                  {resultado.orcamento.somados.map((i) => (
                    <li key={i.skuId} className="text-[11px] text-navy/70">
                      {i.quantidade} × {i.code} — {formatarDinheiro(i.valorTotal ?? 0, i.moeda)}
                    </li>
                  ))}
                </ul>
                {resultado.orcamento.bloqueados.length > 0 ? (
                  <ul className="mt-2 space-y-0.5">
                    {resultado.orcamento.bloqueados.map((i) => (
                      <li key={i.skuId} className="text-[11px] text-terracotta">
                        Fora da soma: {i.code} — {i.motivos[0] ?? "sem preço utilizável"}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-2 text-xs text-navy/70">
                  Subtotal: {formatarDinheiro(resultado.orcamento.subtotal, resultado.orcamento.moeda)}
                  {resultado.orcamento.ajuste !== 0
                    ? ` · condição particular: ${formatarDinheiro(resultado.orcamento.ajuste, resultado.orcamento.moeda)} (${resultado.orcamento.ajusteMotivo})`
                    : ""}
                </p>
                <p className="mt-1 font-serif text-xl text-navy">
                  Total: {formatarDinheiro(resultado.orcamento.total, resultado.orcamento.moeda)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-navy/45">{resultado.orcamento.selo}</p>
                {resultado.orcamento.avisos.map((a, i) => (
                  <p key={i} className="mt-1 text-[11px] text-terracotta">
                    {a}
                  </p>
                ))}

                {propostaId ? (
                  <div className="mt-3">
                    <AcaoOperacional
                      rotulo="Aplicar este orçamento na proposta"
                      capacidade="corrigir_proposta_escopo_preco"
                      validacaoFormulario={resultado.recusa}
                      efeito="Grava valor, moeda, a conta item a item e a origem do preço na proposta em rascunho. Não envia, não aprova, não cobra. Proposta já enviada ou aprovada é recusada."
                      onConfirmar={() => mAplicar.mutate()}
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-navy/55">
                    Este caso não tem proposta em rascunho: o orçamento fica como cálculo, sem onde ser gravado.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
