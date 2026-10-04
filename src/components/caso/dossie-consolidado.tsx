/**
 * Dossiê consolidado do caso — checklist §58c, histórico e cadeia (04/10/2026).
 *
 * Proprietária: "leia e execute o dossiê da Ana e junto do histórico completo
 * da Ana... anexei também o skill que foi criado para trazer e montar o dossiê
 * de cada cliente".
 *
 * A skill `ca-client-go-live` entrega o dossiê como documento no Drive. Esta
 * tela é o mesmo dossiê como **dado**: composição do caso, estado real de cada
 * BLOCO do checklist §58c, cadeia registrada, histórico e o de-para que diz
 * onde mora cada um dos oito campos que o checklist exige por item.
 *
 * Nada aqui consulta fonte externa, solicita documento, aprova despesa ou
 * publica ao cliente.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { dossieConsolidadoDoCaso, semearChecklist58cNoCaso } from "@/lib/dossie-58c.functions";

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="text-[11px] text-navy/75">
      <span className="font-semibold text-navy">{rotulo}:</span> {valor}
    </p>
  );
}

export function DossieConsolidado({ caseId }: { caseId: string }) {
  const carregar = useServerFn(dossieConsolidadoDoCaso);
  const semear = useServerFn(semearChecklist58cNoCaso);
  const q = useQuery({
    queryKey: ["dossie-58c", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });

  const mSemear = useMutation({
    mutationFn: (motivo: string) => semear({ data: { caseId, motivo } }),
    onSuccess: (r) => {
      toast.success(
        r.criados
          ? `${r.criados} itens do checklist §58c criados. Nenhum item existente foi alterado.`
          : "Nada a criar: todos os itens do template já existem neste caso.",
      );
      void q.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/15 bg-white/60 p-4" data-dossie-consolidado>
      <h3 className="font-serif text-base text-navy">Dossiê consolidado do caso</h3>
      <p className="mt-1 text-[11px] text-navy/60">
        O checklist §58c, a cadeia e o histórico como dado do Desk — não como documento à parte. Item de checklist
        registra o que falta; nunca conclui prova.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : q.data === null ? null : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o dossiê consolidado do caso"
      >
        {([d]) => (
          <div className="mt-3 space-y-4">
            <div data-composicao-dossie>
              <p className="text-[11px] font-semibold text-navy">Composição do caso</p>
              <Linha
                rotulo="Requerentes adultos"
                valor={d.composicao.adultos.length ? d.composicao.adultos.join(", ") : "nenhum registrado"}
              />
              <Linha
                rotulo="Dependentes"
                valor={d.composicao.dependentes.length ? d.composicao.dependentes.join(", ") : "nenhum registrado"}
              />
              <Linha
                rotulo="Pessoas na pesquisa"
                valor={d.composicao.elos.length ? d.composicao.elos.join(", ") : "nenhuma registrada"}
              />
              <Linha
                rotulo="Ascendentes prioritários"
                valor={
                  d.composicao.ascendentes.length
                    ? d.composicao.ascendentes.join(", ")
                    : "nenhum ascendente registrado — a cadeia de descendência não tem objeto enquanto isso"
                }
              />
            </div>

            <div data-blocos-58c>
              <p className="text-[11px] font-semibold text-navy">
                Checklist §58c — {d.semeados} de {d.previsto} instâncias previstas
              </p>
              <ul className="mt-1 space-y-1 text-[11px] text-navy/80">
                {d.blocos.map((b) => (
                  <li key={b.numero}>
                    <strong>
                      BLOCO {b.numero} — {b.titulo}
                    </strong>
                    {b.instancias === 0 ? (
                      <span className="text-terracotta"> · não semeado ({b.previstos} itens previstos)</span>
                    ) : (
                      <span>
                        {" "}
                        · {b.instancias} itens · {b.abertos} abertos · {b.emAndamento} em andamento · {b.bloqueados}{" "}
                        bloqueados · {b.resolvidos} resolvidos · {b.naoAplicaveis} não aplicáveis
                        {b.criticosAbertos ? (
                          <span className="text-terracotta"> · {b.criticosAbertos} críticos em aberto</span>
                        ) : null}
                      </span>
                    )}
                    <span className="block text-navy/55">{b.resumo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {d.criticosAbertos.length ? (
              <div data-criticos-58c>
                <p className="text-[11px] font-semibold text-terracotta">
                  Críticos em aberto ({d.criticosAbertos.length})
                </p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-navy/80">
                  {d.criticosAbertos.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      {c.titulo} · {c.status}
                    </li>
                  ))}
                </ul>
                {d.criticosAbertos.length > 8 ? (
                  <p className="text-[11px] text-navy/55">
                    e mais {d.criticosAbertos.length - 8} — a lista completa fica na aba de pendências da pesquisa.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div data-cadeia-dossie>
              <p className="text-[11px] font-semibold text-navy">Cadeia registrada</p>
              {d.linhagem.length ? (
                <ul className="mt-1 space-y-0.5 text-[11px] text-navy/75">
                  {d.linhagem.map((l) => (
                    <li key={l.id}>
                      <strong>{l.nome}</strong> · {l.tipo} · {l.status}
                      {l.geracaoAlvo !== null ? ` · geração alvo ${l.geracaoAlvo}` : ""}
                      {l.aderencia !== null ? ` · aderência ${l.aderencia}%` : " · aderência não avaliada"}
                      {l.proximoMarco ? ` · próximo marco: ${l.proximoMarco}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-[11px] text-terracotta">Nenhuma linha de cidadania registrada neste caso.</p>
              )}
            </div>

            <details data-historico-dossie>
              <summary className="cursor-pointer text-[11px] font-semibold text-navy">
                Histórico consolidado ({d.historico.length} marcos)
              </summary>
              <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
                {d.historico.map((h) => (
                  <li key={h.id}>
                    {h.quando ? `${new Date(h.quando).toLocaleDateString("pt-BR")} · ` : "sem data · "}
                    {h.titulo} · {h.status}
                    {h.bloqueio ? " · bloqueio" : ""}
                  </li>
                ))}
              </ul>
            </details>

            <details data-de-para-campos-checklist>
              <summary className="cursor-pointer text-[11px] font-semibold text-navy">
                Onde mora cada campo do checklist ({d.deParaCampos.length})
              </summary>
              <ul className="mt-1 space-y-1 text-[11px] text-navy/70">
                {d.deParaCampos.map((c) => (
                  <li key={c.campo}>
                    <strong>{c.campo}</strong> → {c.destino}
                    <span className="block text-navy/55">
                      {c.vocabulario ? `${c.vocabulario}. ` : ""}
                      {c.nota}
                    </span>
                  </li>
                ))}
              </ul>
            </details>

            <AcaoOperacional
              rotulo="Semear checklist §58c neste caso"
              capacidade="avancar_pesquisa_evidencia_microentrega"
              efeito="Cria os itens do template §58c que ainda não existem, todos como abertos. Não altera item existente, não solicita documento, não aprova despesa e não consulta fonte externa."
              onConfirmar={(motivo) => mSemear.mutate(motivo)}
            />
          </div>
        )}
      </EstadoDados>
    </section>
  );
}
