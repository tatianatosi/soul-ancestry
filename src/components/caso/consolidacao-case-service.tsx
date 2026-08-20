import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, Rotulo } from "@/components/caso/campos";
import {
  carregarConsolidacaoCaseService,
  decidirCriterioAceite,
  semearCriteriosAceite,
} from "@/lib/case-service-consolidacao.functions";
import { ROTULO_ORIGEM_VALOR, type ItemCriterio } from "@/lib/case-service-consolidacao";

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
  const [erro, setErro] = useState<string | null>(null);
  const [quem, setQuem] = useState("Tatiana Tosi");

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
    mutationFn: (v: { id: string; status: string }) => decidir({ data: { ...v, decididoPor: quem } }),
    onSuccess: () => q.refetch(),
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao registrar a decisão."),
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
            <p>{c.statusPermitido === "approved" ? "Pode ser aprovado" : "Somente rascunho (draft)"}</p>
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
                className="w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
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
                          <select
                            className="rounded-lg border border-navy/15 bg-white px-2 py-1 text-xs text-navy"
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
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </Secao>

      <Secao titulo="Bloqueios de aprovação e financeiro" descricao="Somente leitura — o motor não libera cobrança nesta tela.">
        <ul className="list-disc space-y-1 pl-5 text-sm text-navy/80">
          {c.motivosBloqueioAprovacao.length ? (
            c.motivosBloqueioAprovacao.map((m, i) => <li key={i}>{m}</li>)
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
