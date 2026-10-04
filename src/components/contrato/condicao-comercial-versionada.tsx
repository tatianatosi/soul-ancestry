/**
 * Condição comercial versionada do caso + os anexos que a composição exige
 * (04/10/2026).
 *
 * Proprietária: "primeiro fechar o case commercial condition e proposta da
 * Ana... Ana não está condicionada em sku, tudo já era legado, já tinha sido
 * feita a extração da proposta do Canva. No contrato revise pois somente está
 * cobrindo um anexo quando na verdade são 04 anexos."
 *
 * Esta tela lê a condição aprovada (origem: as 7 páginas do Canva já
 * extraídas), confere a aritmética sem corrigir nada, e lista os quatro
 * anexos da composição com a lacuna nomeada quando falta registro.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { formatarDinheiro } from "@/lib/orcamento-proposta";
import {
  condicaoComercialDoCaso,
  registrarVersaoCondicaoComercial,
} from "@/lib/condicao-comercial-caso.functions";

export function CondicaoComercialVersionada({ caseId }: { caseId: string }) {
  const carregar = useServerFn(condicaoComercialDoCaso);
  const novaVersao = useServerFn(registrarVersaoCondicaoComercial);
  const q = useQuery({
    queryKey: ["condicao-comercial", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  /*
   * Nova versão parte da vigente e exige motivo. Não reescreve a anterior: a
   * aprovada passa a `substituida` e a nova nasce em rascunho, para revisão.
   * Mudar valor é decisão humana — por isso o motivo é obrigatório.
   */
  const mNovaVersao = useMutation({
    mutationFn: (dados: { motivo: string; base: NonNullable<typeof q.data>["vigente"] }) =>
      novaVersao({
        data: {
          caseId,
          motivo: dados.motivo,
          itens: dados.base!.itens,
          total: dados.base!.total ?? 0,
          formaPagamento: dados.base!.formaPagamento ?? undefined,
          parcelas: dados.base!.parcelas ?? undefined,
          valorParcela: dados.base!.valorParcela ?? undefined,
          responsaveis: dados.base!.responsaveisFinanceiros,
          validade: dados.base!.validade,
        },
      }),
    onSuccess: (r) => {
      toast.success(`Versão ${r.versao} criada em rascunho — a anterior passou a substituída.`);
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/15 bg-white/60 p-4" data-condicao-comercial-versionada>
      <h3 className="font-serif text-base text-navy">Condição comercial do caso (versionada)</h3>
      <p className="mt-1 text-[11px] text-navy/60">
        A proposta e o contrato leem daqui. Nunca de Planilha Mestre, SKU ou catálogo — a condição de um caso não é
        preço de catálogo, e não vale para outro caso.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : q.data === null ? null : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a condição comercial do caso"
      >
        {([d]) =>
          !d.vigente ? (
            <p className="mt-3 text-sm text-terracotta" data-sem-condicao>
              Nenhuma condição comercial aprovada para este caso. Enquanto não houver, nada é derivado do catálogo: o
              contrato fica sem valor de origem.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-navy/75">
                Versão {d.vigente.versao} · {d.vigente.estado} · origem {d.vigente.origem}
                {d.vigente.propostaReferencia ? ` · ${d.vigente.propostaReferencia}` : ""}
              </p>

              <ul className="space-y-0.5 text-[11px] text-navy/80" data-itens-condicao>
                {d.vigente.itens.map((i) => (
                  <li key={i.parte}>
                    <strong>{i.parte}</strong>
                    {i.valor > 0 ? ` — ${formatarDinheiro(i.valor, d.vigente!.moeda)}` : " — sem cobrança própria"}
                    {i.escopo ? `: ${i.escopo}` : ""}
                  </li>
                ))}
              </ul>

              <p className="font-serif text-lg text-navy">
                Total aprovado: {d.vigente.total === null ? "—" : formatarDinheiro(d.vigente.total, d.vigente.moeda)}
                {d.vigente.parcelas && d.vigente.valorParcela
                  ? ` · ${d.vigente.responsaveisFinanceiros.length} responsáveis × ${d.vigente.parcelas}× ${formatarDinheiro(d.vigente.valorParcela, d.vigente.moeda)}`
                  : ""}
              </p>

              {d.conferencia ? (
                <div className="text-[11px]">
                  <p className={d.conferencia.fecha ? "text-navy/60" : "text-terracotta"}>
                    {d.conferencia.fecha
                      ? `Confere: a soma dos escopos por pessoa fecha com o total (${d.conferencia.somaDosItens}).`
                      : `Não fecha: diferença de ${d.conferencia.diferenca}.`}
                  </p>
                  {d.conferencia.avisos.map((a, i) => (
                    <p key={i} className="text-navy/55">
                      {a}
                    </p>
                  ))}
                </div>
              ) : null}

              <div>
                <p className="text-[11px] font-semibold text-navy">
                  Anexos do contrato — família canônica: Anexo I a V
                </p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-navy/75" data-anexos-canonicos>
                  {d.anexosCanonicos.map((a) => (
                    <li key={a.codigo}>
                      <strong>{a.titulo}</strong>
                      {a.obrigatorio ? " · obrigatório" : " · condicional"}
                      {d.anexosRegistrados.includes(a.codigo) ? " · registrado" : " · não registrado"}
                    </li>
                  ))}
                </ul>

                <p className="mt-2 text-[11px] font-semibold text-navy">
                  Cobertura por requerente — instância do Anexo I, não anexo novo
                </p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-navy/75" data-instancias-anexo-i>
                  {d.instancias.map((i) => (
                    <li key={i.chave}>
                      <strong>{i.titulo}</strong>
                      {i.valor !== null ? ` — ${formatarDinheiro(i.valor, d.vigente!.moeda)}` : ""}
                      {i.dependentesRepresentados.length
                        ? ` · representa ${i.dependentesRepresentados.join(", ")} (menor não assina)`
                        : ""}
                    </li>
                  ))}
                </ul>
                {d.lacunasDeCobertura.length ? (
                  <ul className="mt-1 space-y-0.5 text-[11px] text-terracotta" data-lacunas-cobertura>
                    {d.lacunasDeCobertura.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[11px] text-navy/55">Toda a composição está coberta pelo Anexo I.</p>
                )}

                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] text-navy/60">
                    Anexos retirados por duplicidade ({d.duplicidadesRetiradas.length}) — e o que já cobre cada um
                  </summary>
                  <ul className="mt-1 space-y-1 text-[11px] text-navy/70" data-duplicidades-retiradas>
                    {d.duplicidadesRetiradas.map((r) => (
                      <li key={r.codigo}>
                        <strong>{r.codigo}</strong> · {r.veredicto.replace(/_/g, " ").toLowerCase()}
                        {r.clausulas.length
                          ? ` · cláusula ${r.clausulas.map((c) => `${c.numero} (${c.titulo})`).join(", ")}`
                          : ""}
                        {r.anexos.length ? ` · ${r.anexos.join(", ")}` : ""}
                        {r.fonteNaProposta ? ` · da proposta: ${r.fonteNaProposta}` : ""}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              <AcaoOperacional
                rotulo="Registrar nova versão da condição"
                capacidade="corrigir_proposta_escopo_preco"
                efeito="Cria uma versão nova em rascunho a partir da vigente, e marca a anterior como substituída. Não reescreve a versão aprovada, não envia, não cobra."
                onConfirmar={(motivo) => mNovaVersao.mutate({ motivo, base: d.vigente })}
              />
            </div>
          )
        }
      </EstadoDados>
    </section>
  );
}
