/**
 * Orçamento por produto-pai × país — painel do Desk (v3.0, 04/10/2026).
 *
 * É a execução da tabela de preços que a Proprietária declarou vigente hoje:
 * escolhe produto-pai e país, soma os quatro componentes separados, aplica
 * módulos e participantes, e deixa a condição particular substituir o total de
 * referência. País vigente sem valor aparece como VALOR NÃO CADASTRADO — não
 * zera em silêncio.
 *
 * O cálculo é feito no servidor, para a tela não poder divergir da conta.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Texto } from "@/components/caso/campos";
import { EstadoDados } from "@/components/saas/estado-dados";
import { formatarDinheiro } from "@/lib/orcamento-proposta";
import { PRODUTOS_PAI_JORNADA, VALOR_NAO_CADASTRADO } from "@/lib/orcamento-produtos-pai";
import { calcularOrcamentoPorProdutoPai, tabelaPrecosDoCaso } from "@/lib/orcamento-produtos-pai.functions";

const ROTULO_COMPONENTE: Record<string, string> = {
  honorarios: "Honorários",
  despesas_terceiros: "Despesas de terceiros",
  taxas_oficiais: "Taxas oficiais",
  outros: "Outros",
};

export function OrcamentoPorProdutoPai({ caseId }: { caseId: string }) {
  const carregar = useServerFn(tabelaPrecosDoCaso);
  const calcular = useServerFn(calcularOrcamentoPorProdutoPai);
  const q = useQuery({
    queryKey: ["precos-produto-pai", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  const [produtoPai, setProdutoPai] = useState("CA-PROT-001");
  const [pais, setPais] = useState("");
  const [paisAdicional, setPaisAdicional] = useState("");
  const [reducao, setReducao] = useState("");
  const [reducaoAprovador, setReducaoAprovador] = useState("");
  const [participantes, setParticipantes] = useState("0");
  const [condicaoValor, setCondicaoValor] = useState("");
  const [condicaoMotivo, setCondicaoMotivo] = useState("");
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof calcularOrcamentoPorProdutoPai>> | null>(null);

  const numero = (v: string) => Number(String(v).replace(/\./g, "").replace(",", ".")) || 0;
  const condicao = numero(condicaoValor);

  const m = useMutation({
    mutationFn: () =>
      calcular({
        data: {
          caseId,
          produtoPaiPrincipal: produtoPai,
          pais,
          paisesAdicionais: paisAdicional
            ? [
                {
                  pais: paisAdicional,
                  reducaoBaseCompartilhada: numero(reducao),
                  reducaoAprovadaPor: reducaoAprovador.trim() || undefined,
                },
              ]
            : [],
          modulos: Object.entries(quantidades)
            .filter(([, n]) => n > 0)
            .map(([skuLegado, quantidade]) => ({ skuLegado, quantidade })),
          participantesAdicionais: Math.max(0, Math.trunc(Number(participantes) || 0)),
          condicaoParticular:
            condicao > 0 && condicaoMotivo.trim() ? { valor: condicao, moeda: "BRL", motivo: condicaoMotivo.trim() } : undefined,
        },
      }),
    onSuccess: (r) => setResultado(r),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-gold/40 bg-gold/5 p-4" data-orcamento-produto-pai>
      <h3 className="font-serif text-base text-navy">Orçamento por produto-pai e país</h3>
      <p className="mt-1 text-[11px] text-navy/60">
        Tabela de preços vigente (decisão de 04/10/2026). O produto-pai rege; o país entra como trilha. Honorários,
        despesas de terceiros, taxas oficiais e outros ficam separados. Não consulta SKU nem Planilha Mestre.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : q.data === null ? null : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a tabela de preços vigente"
      >
        {([dados]) => (
          <div className="mt-3 space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-[11px] text-navy/70">
                Produto-pai que rege
                <select
                  value={produtoPai}
                  onChange={(e) => setProdutoPai(e.target.value)}
                  className="mt-1 w-full rounded border border-navy/15 bg-cream/40 px-2 py-1 text-sm"
                >
                  {PRODUTOS_PAI_JORNADA.map((p) => (
                    <option key={p.codigo} value={p.codigo}>
                      {p.codigo} — {p.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-navy/70">
                País principal (trilha)
                {dados.rotaDoCaso ? <span className="text-navy/45"> · rota do caso: {dados.rotaDoCaso}</span> : null}
                <select
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="mt-1 w-full rounded border border-navy/15 bg-cream/40 px-2 py-1 text-sm"
                  data-seletor-pais
                >
                  <option value="">Selecione…</option>
                  {dados.paises.map((p) => (
                    <option key={p.pais} value={p.pais}>
                      {p.pais}
                      {p.honorarios === null && p.despesas_terceiros === null && p.taxas_oficiais === null
                        ? " — valor não cadastrado"
                        : ` — ${formatarDinheiro(
                            (p.honorarios ?? 0) + (p.despesas_terceiros ?? 0) + (p.taxas_oficiais ?? 0) + (p.outros ?? 0),
                            "BRL",
                          )}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <label className="block text-[11px] text-navy/70">
                Trilha adicional (multipaís)
                <select
                  value={paisAdicional}
                  onChange={(e) => setPaisAdicional(e.target.value)}
                  className="mt-1 w-full rounded border border-navy/15 bg-cream/40 px-2 py-1 text-sm"
                >
                  <option value="">Nenhuma</option>
                  {dados.paises
                    .filter((p) => p.pais !== pais)
                    .map((p) => (
                      <option key={p.pais} value={p.pais}>
                        {p.pais}
                      </option>
                    ))}
                </select>
              </label>
              <Texto
                label="Redução por base compartilhada"
                valor={reducao}
                onChange={setReducao}
                ajuda="A base de pesquisa compartilhada é cobrada uma vez. A redução exige aprovação registrada."
              />
              <Texto label="Aprovada por (nome)" valor={reducaoAprovador} onChange={setReducaoAprovador} />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-navy">Módulos por produto-pai</p>
              <ul className="mt-1 max-h-56 space-y-1 overflow-y-auto rounded border border-navy/10 bg-white/60 p-2" data-modulos-produto-pai>
                {dados.modulos.map((mod) => (
                  <li key={mod.skuLegado} className="flex flex-wrap items-center gap-2 text-[11px] text-navy/70">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-14 rounded border border-navy/15 px-1 py-0.5 text-[11px]"
                      value={quantidades[mod.skuLegado] ?? 0}
                      onChange={(e) =>
                        setQuantidades((q0) => ({
                          ...q0,
                          [mod.skuLegado]: Math.max(0, Math.trunc(Number(e.target.value) || 0)),
                        }))
                      }
                      aria-label={`Quantidade de ${mod.nome}`}
                    />
                    <span className="text-navy">{mod.produtoPai}</span>
                    <span className="min-w-0 flex-1 truncate">
                      {mod.nome}
                      {mod.pais ? ` · ${mod.pais}` : ""}
                    </span>
                    <span className="text-navy/60">
                      {mod.valor === null ? "valor não cadastrado" : formatarDinheiro(mod.valor, "BRL")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Texto label="Participantes adicionais (CA-PROT-003)" valor={participantes} onChange={setParticipantes} />
              <Texto
                label="Condição particular aprovada (R$)"
                valor={condicaoValor}
                onChange={setCondicaoValor}
                ajuda="Substitui o total de referência; a referência fica para auditoria."
              />
              <Texto label="Motivo da condição particular" valor={condicaoMotivo} onChange={setCondicaoMotivo} />
            </div>

            <button
              type="button"
              disabled={!pais || m.isPending}
              onClick={() => m.mutate()}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-40"
            >
              {m.isPending ? "Calculando…" : "Calcular orçamento"}
            </button>

            {resultado ? (
              <div className="rounded-lg border border-navy/15 bg-white/70 p-3" data-orcamento-pai-resultado>
                {resultado.orcamento.sinal === VALOR_NAO_CADASTRADO ? (
                  <p className="text-sm font-semibold text-terracotta">VALOR NÃO CADASTRADO</p>
                ) : null}
                <ul className="space-y-0.5 text-[11px] text-navy/75">
                  {Object.entries(resultado.orcamento.componentes).map(([k, v]) => (
                    <li key={k}>
                      {ROTULO_COMPONENTE[k] ?? k}: {formatarDinheiro(Number(v), "BRL")}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-navy/70">
                  Total de referência: {formatarDinheiro(resultado.orcamento.totalReferencia, "BRL")}
                  {resultado.orcamento.descontoAprovado
                    ? ` · desconto: ${formatarDinheiro(resultado.orcamento.descontoAprovado, "BRL")}`
                    : ""}
                </p>
                <p className="mt-1 font-serif text-xl text-navy">
                  Total final: {formatarDinheiro(resultado.orcamento.totalFinal, "BRL")}
                  {resultado.orcamento.valorDaParcela
                    ? ` · ${resultado.orcamento.parcelas}× ${formatarDinheiro(resultado.orcamento.valorDaParcela, "BRL")}`
                    : ""}
                </p>
                {resultado.orcamento.avisos.map((a, i) => (
                  <p key={i} className="mt-1 text-[11px] text-terracotta">
                    {a}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
