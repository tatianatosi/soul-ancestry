import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { Secao, Rotulo } from "@/components/caso/campos";
import {
  carregarConsolidacaoCaseService,
  decidirCriterioAceite,
  salvarCondicaoComercial,
  semearCriteriosAceite,
} from "@/lib/case-service-consolidacao.functions";
import { ROTULO_ORIGEM_VALOR, type ItemCriterio } from "@/lib/case-service-consolidacao";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

const STATUS_CRITERIO = [
  { valor: "pendente_decisao_humana", rotulo: "Pendente de decisão humana" },
  { valor: "aceito", rotulo: "Aceito" },
  { valor: "recusado", rotulo: "Recusado" },
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
];

/**
 * CORTE C — consolidação do case service (escopo, condição comercial e
 * divergências) + checklist de critérios de aceite por entrega.
 * Nada aqui cria SKU, preço, contrato, cobrança ou link.
 */
export function ConsolidacaoCaseService({ caseId }: { caseId: string }) {
  const carregar = useServerFn(carregarConsolidacaoCaseService);
  const semear = useServerFn(semearCriteriosAceite);
  const decidir = useServerFn(decidirCriterioAceite);
  const salvarCondicao = useServerFn(salvarCondicaoComercial);
  const [erro, setErro] = useState<string | null>(null);
  const [quem, setQuem] = useState("Tatiana Tosi");
  const [rascunhoCriterio, setRascunhoCriterio] = useState<Record<string, { justificativa: string; evidencia: string }>>({});
  const [cond, setCond] = useState<Record<string, string>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(
    Object.keys(rascunhoCriterio).length > 0 ||
      Object.keys(cond).length > 0 ||
      quem !== "Tatiana Tosi",
  );

  const q = useQuery({
    queryKey: ["consolidacao-case-service", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  const mSemear = useMutation({
    mutationFn: () => semear({ data: { caseId } }),
    onSuccess: () => q.refetch(),
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao criar os critérios."),
  });
  const mDecidir = useMutation({
    mutationFn: (v: { id: string; status: string }) =>
      decidir({
        data: {
          ...v,
          decididoPor: quem,
          justificativa: rascunhoCriterio[v.id]?.justificativa ?? "",
          evidenciaInterna: rascunhoCriterio[v.id]?.evidencia ?? "",
        },
      }),
    onSuccess: () => q.refetch(),
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao registrar a decisão."),
  });

  const mCondicao = useMutation({
    mutationFn: (homologar: boolean) =>
      salvarCondicao({
        data: {
          caseId,
          homologar,
          forma_pagamento: cond.forma_pagamento ?? q.data?.condicao?.forma_pagamento ?? "",
          parcelas: cond.parcelas ? Number(cond.parcelas) : (q.data?.condicao?.parcelas ?? null),
          valor_parcela: cond.valor_parcela ? Number(cond.valor_parcela) : (q.data?.condicao?.valor_parcela ?? null),
          valor_total_referencia: cond.valor_total_referencia
            ? Number(cond.valor_total_referencia)
            : (q.data?.condicao?.valor_total_referencia ?? null),
          vencimento_dia: cond.vencimento_dia ? Number(cond.vencimento_dia) : (q.data?.condicao?.vencimento_dia ?? null),
          primeiro_vencimento: cond.primeiro_vencimento ?? q.data?.condicao?.primeiro_vencimento ?? null,
          condicao_aplicavel: cond.condicao_aplicavel ?? q.data?.condicao?.condicao_aplicavel ?? null,
        },
      }),
    onSuccess: () => {
      setErro(null);
      q.refetch();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao salvar a condição comercial."),
  });

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando consolidação…</p>;
  if (q.error) return <p className="text-sm text-terracotta">Não foi possível carregar a consolidação.</p>;
  const d = q.data!;
  const c = d.consolidado;
  const criterios = (d.criterios ?? []) as ItemCriterio[];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {erro ? <p className="lg:col-span-2 text-sm text-terracotta">{erro}</p> : null}

      <Secao
        titulo="Consolidação do case service"
        descricao="Produto-pai, trilha, núcleo, escopo conferido e condição comercial como referência interna."
      >
        <dl className="grid gap-3 text-sm text-navy/80">
          <div>
            <Rotulo>Produto-pai</Rotulo>
            <p>{d.catalogo ? `${d.catalogo.nome_comercial} (${d.catalogo.code}) — ${d.catalogo.status_homologacao}` : "—"}</p>
          </div>
          <div>
            <Rotulo>Trilha técnica</Rotulo>
            <p>{d.trilha ? `${d.trilha.pais} — ${d.trilha.code}` : "—"}</p>
          </div>
          <div>
            <Rotulo>Núcleo considerado</Rotulo>
            <p>{c.resumoNucleo}</p>
          </div>
          <div>
            <Rotulo>Escopo (proposta Canva conferida)</Rotulo>
            <p>{d.servico?.escopo_aprovado ?? "—"}</p>
          </div>
          <div>
            <Rotulo>Condição comercial — referência interna</Rotulo>
            <p>{d.condicaoSugerida}</p>
            <p className="mt-1 text-[11px] text-navy/45">
              Origem do valor: {c.origemPreco ? ROTULO_ORIGEM_VALOR[c.origemPreco] : "sem origem homologada"}. Financeiro
              permanece bloqueado.
            </p>
          </div>
          <div>
            <Rotulo>Status permitido pelo motor</Rotulo>
            <p>{d.promocao.statusPermitido === "approved" ? "Pode ser aprovado" : "Somente rascunho (draft)"}</p>
          </div>
        </dl>
      </Secao>

      <Secao titulo="Divergências e campos internos" descricao="Comparação entre proposta, catálogo, planejador e condição registrada.">
        {c.camposPendentes.length ? (
          <div className="mb-4">
            <Rotulo>Campos internos pendentes</Rotulo>
            <ul className="list-disc pl-5 text-sm text-navy/80">
              {c.camposPendentes.map((x) => (
                <li key={String(x.campo)}>
                  {x.label} — <span className="text-navy/55">{x.ajuda}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-4 text-sm text-navy/70">Todos os campos internos estão preenchidos.</p>
        )}
        {c.divergencias.length ? (
          <ul className="space-y-2 text-sm">
            {c.divergencias.map((x, i) => (
              <li key={`${x.codigo}-${i}`} className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">
                  {x.codigo} · {ROTULO_ORIGEM_VALOR[x.origem]} · {x.gravidade === "bloqueio" ? "bloqueio" : "atenção"}
                </p>
                <p className="text-navy/85">{x.descricao}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/70">Nenhuma divergência registrada entre as origens.</p>
        )}
      </Secao>

      <Secao
        titulo="Critérios de aceite por entrega"
        descricao="Cada critério permanece pendente até decisão humana registrada. Nenhum aceite é automático."
      >
        {criterios.length === 0 ? (
          <button
            onClick={() => mSemear.mutate()}
            disabled={mSemear.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
          >
            {mSemear.isPending ? "Criando…" : "Criar checklist de critérios de aceite"}
          </button>
        ) : (
          <>
            <label className="mb-4 block max-w-xs">
              <Rotulo>Quem está decidindo</Rotulo>
              <input
                className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold"
                value={quem}
                onChange={(e) => setQuem(e.target.value)}
              />
            </label>
            <div className="space-y-4">
              {d.resumoCriterios.map((g) => (
                <div key={g.entrega_codigo} className="rounded-lg border border-navy/10 p-3">
                  <p className="font-medium text-navy">
                    {g.entrega_rotulo}{" "}
                    <span className="text-xs font-normal text-navy/55">
                      ({g.decididos}/{g.total} decididos · {g.pendentes} pendente(s))
                    </span>
                  </p>
                  <ul className="mt-2 space-y-2">
                    {criterios
                      .filter((i) => i.entrega_codigo === g.entrega_codigo)
                      .map((i) => (
                        <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="max-w-lg text-navy/80">
                            {i.criterio_descricao}
                            {i.decidido_por ? (
                              <span className="block text-[11px] text-navy/45">
                                Decidido por {i.decidido_por} em {new Date(i.decidido_em!).toLocaleDateString("pt-BR")}
                              </span>
                            ) : null}
                          </span>
                          <div className="flex w-full flex-col gap-1 sm:w-auto sm:flex-row sm:items-center">
                          <input
                            placeholder="Justificativa"
                            className="rounded-lg border border-navy/15 bg-cream px-2 py-1 text-xs text-navy"
                            value={rascunhoCriterio[i.id!]?.justificativa ?? i.justificativa ?? ""}
                            onChange={(e) =>
                              setRascunhoCriterio((p) => ({
                                ...p,
                                [i.id!]: { evidencia: p[i.id!]?.evidencia ?? "", justificativa: e.target.value },
                              }))
                            }
                          />
                          <input
                            placeholder="Evidência interna"
                            className="rounded-lg border border-navy/15 bg-cream px-2 py-1 text-xs text-navy"
                            value={rascunhoCriterio[i.id!]?.evidencia ?? i.evidencia_interna ?? ""}
                            onChange={(e) =>
                              setRascunhoCriterio((p) => ({
                                ...p,
                                [i.id!]: { justificativa: p[i.id!]?.justificativa ?? "", evidencia: e.target.value },
                              }))
                            }
                          />
                          <select
                            className="rounded-lg border border-navy/15 bg-cream px-2 py-1 text-xs text-navy"
                            value={i.status}
                            disabled={mDecidir.isPending}
                            onChange={(e) => mDecidir.mutate({ id: i.id!, status: e.target.value })}
                          >
                            {STATUS_CRITERIO.map((s) => (
                              <option key={s.valor} value={s.valor}>
                                {s.rotulo}
                              </option>
                            ))}
                          </select>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </Secao>

      <Secao
        titulo="Fonte de preço e elegibilidade"
        descricao="Somente o catálogo homologado é fonte final. Proposta, planejador, WhatsApp e texto manual não valem como fonte."
      >
        <dl className="grid gap-3 text-sm text-navy/80">
          <div>
            <Rotulo>Fonte admitida</Rotulo>
            <p>{d.elegibilidade.fonte === "product_catalog" ? "Catálogo homologado (product_catalog)" : "Nenhuma fonte homologada"}</p>
          </div>
          <div>
            <Rotulo>Uso contratual e financeiro</Rotulo>
            <p>{d.elegibilidade.uso_contratual_financeiro === "liberado" ? "Liberado" : "Bloqueado — preço não homologado"}</p>
          </div>
          <div>
            <Rotulo>Referência interna</Rotulo>
            <p>
              {d.elegibilidade.preco_referencia_interna != null
                ? `R$ ${d.elegibilidade.preco_referencia_interna.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} — referência interna até decisão humana homologada`
                : "—"}
            </p>
          </div>
        </dl>
        {d.elegibilidade.motivos.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-terracotta">
            {d.elegibilidade.motivos.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : null}
      </Secao>

      <Secao
        titulo="Condição comercial estruturada"
        descricao="Campos estruturados e aprovados, separados do texto da proposta. Nenhuma cobrança, parcela financeira ou link é criada."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { k: "forma_pagamento", l: "Forma de pagamento", t: "text" },
            { k: "parcelas", l: "Parcelas", t: "number" },
            { k: "valor_parcela", l: "Valor da parcela", t: "number" },
            { k: "valor_total_referencia", l: "Valor total de referência", t: "number" },
            { k: "vencimento_dia", l: "Dia de vencimento", t: "number" },
            { k: "primeiro_vencimento", l: "Primeiro vencimento", t: "date" },
            { k: "condicao_aplicavel", l: "Condição aplicável", t: "text" },
          ].map((f) => (
            <label key={f.k}>
              <Rotulo>{f.l}</Rotulo>
              <input
                type={f.t}
                className="w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold"
                value={cond[f.k] ?? (d.condicao ? String((d.condicao as Record<string, unknown>)[f.k] ?? "") : "")}
                onChange={(e) => setCond((p) => ({ ...p, [f.k]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => mCondicao.mutate(false)}
            disabled={mCondicao.isPending}
            className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy disabled:opacity-40"
          >
            Salvar rascunho da condição
          </button>
          <AcaoOperacional
            rotulo="Homologar condição"
            capacidade="homologar_condicao_comercial"
            pendenciaGate={
              d.elegibilidade.elegivel
                ? null
                : `Consolidação ainda não elegível: ${
                    d.elegibilidade.motivos?.join("; ") || "critérios pendentes"
                  }`
            }
            efeito="Homologa a condição comercial deste case service como referência interna."
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
            onConfirmar={() => {
              if (mCondicao.isPending) return;
              mCondicao.mutate(true);
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-navy/45">
          Estado atual: {d.condicao?.status ?? "sem condição registrada"}
          {d.condicao?.homologado_por ? ` · homologada por ${d.condicao.homologado_por}` : ""}
        </p>
        {d.avaliacaoCondicao.bloqueios.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-terracotta">
            {d.avaliacaoCondicao.bloqueios.map((b, i) => (
              <li key={i}>
                {b.codigo} — {b.descricao}
              </li>
            ))}
          </ul>
        ) : null}
        {d.divergenciasValor.length ? (
          <div className="mt-4">
            <Rotulo>Divergências registradas (sem ajuste automático)</Rotulo>
            <ul className="list-disc space-y-1 pl-5 text-sm text-navy/80">
              {d.divergenciasValor.map((x, i) => (
                <li key={i}>{x.descricao}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Secao>

      <Secao titulo="Plano inicial por critérios persistidos" descricao="Substitui o antigo indicador único de plano inicial.">
        <ul className="space-y-2 text-sm">
          {d.planoInicial.criterios.map((c2) => (
            <li key={c2.criterio} className="rounded-lg border border-navy/10 p-3">
              <p className="text-navy/85">
                {c2.ok ? "✓" : "•"} {c2.label}
              </p>
              <p className="text-[11px] text-navy/55">{c2.detalhe}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-navy/60">
          Plano inicial {d.planoInicial.ok ? "completo" : `pendente: ${d.planoInicial.pendentes.join(", ")}`}.
        </p>
      </Secao>

      <Secao titulo="Bloqueios de aprovação e financeiro" descricao="Somente leitura — o motor não libera cobrança nesta tela.">
        <ul className="list-disc space-y-1 pl-5 text-sm text-navy/80">
          {c.motivosBloqueioAprovacao.length || d.promocao.bloqueios.length ? (
            <>
              {c.motivosBloqueioAprovacao.map((m, i) => (
                <li key={`c-${i}`}>{m}</li>
              ))}
              {d.promocao.bloqueios.map((b, i) => (
                <li key={`p-${i}`}>
                  {b.codigo} — {b.descricao}
                </li>
              ))}
            </>
          ) : (
            <li>Sem bloqueios para aprovação do case service.</li>
          )}
        </ul>
        <p className="mt-4 rounded-lg bg-navy/5 p-3 text-xs text-navy/70">
          Financeiro permanece bloqueado: nenhuma cobrança, parcela, link Asaas, contrato ou assinatura é criada por esta
          consolidação. O valor exibido é referência interna espelhada do catálogo homologado.
        </p>
      </Secao>
    </div>
  );
}
