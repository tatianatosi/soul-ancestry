/**
 * Microentregas no shell de go-live.
 *
 * Mesma fonte do restante do shell (`useGoLive`): o que já está gravado no
 * caso canônico. Gráfico de prazo, lista ordenada por atraso e as ações de
 * revisão que já existem — aprovar a microentrega e publicar no App.
 * Nada é criado sozinho e nada é apagado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Acao } from "@/components/golive/acoes";
import { useGoLive, useEscritorGoLive, buscaGoLive } from "@/components/golive/dados";
import { Barras } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import {
  aprovarMicroentregaGoLive,
  publicarNoAppGoLive,
  criarMicroentregaGoLive,
  salvarRascunhoProjecaoApp,
} from "@/lib/golive-escritores.functions";
import {
  concluida,
  ordenarMicroentregas,
  prazoEmFatias,
  type MicroentregaGoLive,
} from "@/lib/golive-microentregas";
import { RascunhosApp } from "@/components/golive/rascunhos-app";
import { AcaoPublicarNoApp } from "@/components/golive/acoes-registro";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/microentregas")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Microentregas — Go-live Clube Ancestral" },
      { name: "description", content: "Prazo, revisão e publicação das microentregas do caso do piloto." },
      { property: "og:title", content: "Microentregas — Go-live Clube Ancestral" },
      { property: "og:description", content: "Prazo, revisão e publicação das microentregas do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MicroentregasGoLive,
});

function MicroentregasGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const aprovar = useEscritorGoLive(aprovarMicroentregaGoLive);
  const publicarAgora = useEscritorGoLive(publicarNoAppGoLive);
  const salvarRascunho = useEscritorGoLive(salvarRascunhoProjecaoApp);
  const criar = useEscritorGoLive(criarMicroentregaGoLive);

  const itens = useMemo<MicroentregaGoLive[]>(
    () => (caso?.microentregas ?? []) as MicroentregaGoLive[],
    [caso],
  );
  const ordenadas = useMemo(() => ordenarMicroentregas(itens), [itens]);
  const fatias = useMemo(() => prazoEmFatias(itens), [itens]);
  const concluidas = itens.filter(concluida).length;
  const semPrazo = itens.filter((item) => !item.prazo).length;
  const aguardandoRevisao = itens.filter((item) => !concluida(item)).length;

  const acaoNova = (
    <Acao
      rotulo="Criar microentrega"
      titulo="Nova microentrega do caso"
      campos={[
        { nome: "titulo", rotulo: "Título", obrigatorio: true },
        { nome: "criterio", rotulo: "Critério de aceite", tipo: "area", obrigatorio: true },
        { nome: "prazo", rotulo: "Prazo", tipo: "data" },
        { nome: "descricao", rotulo: "Descrição", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        criar({
          data: {
            titulo: v["titulo"] ?? "",
            criterio: v["criterio"] ?? "",
            prazo: v["prazo"] ?? "",
            descricao: v["descricao"] ?? "",
          },
        })
      }
      confirmacao="Microentrega criada."
    />
  );

  return (
    <GoLiveShell
      titulo="Microentregas"
      descricao="Prazo, revisão humana e publicação para a família."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}
      <FaixaKpis itens={[
        { rotulo: "Microentregas", valor: itens.length, tom: itens.length ? "azul" : "cinza", fonte: "Microentregas vinculadas ao caso", formula: "Contagem dos registros não arquivados", periodo: "Histórico do caso" },
        { rotulo: "Aguardando revisão", valor: aguardandoRevisao, tom: aguardandoRevisao ? "dourado" : "cinza", fonte: "Estado das microentregas", formula: "Itens ainda não concluídos", periodo: "Estado atual" },
        { rotulo: "Concluídas", valor: concluidas, tom: concluidas ? "verde" : "cinza", fonte: "Conclusão das microentregas", formula: "Itens com estado ou data de conclusão", periodo: "Histórico do caso" },
        { rotulo: "Sem prazo", valor: semPrazo, tom: semPrazo ? "terracota" : "cinza", fonte: "Prazo das microentregas", formula: "Itens sem prazo registrado", periodo: "Estado atual" },
      ]} />

      <Bloco titulo="1. Prazo das microentregas">
        {itens.length ? (
          <>
            <Barras titulo="Microentregas por situação de prazo" dados={fatias} />
            <p className="text-xs text-navy/55">
              O prazo vem do campo gravado. Microentrega sem prazo aparece como “sem prazo registrado”.
            </p>
          </>
        ) : (
          <Vazio cta={acaoNova} />
        )}
      </Bloco>

      <Bloco titulo="2. Revisão e publicação">
        {ordenadas.length ? (
          <ul className="space-y-3 text-sm text-navy">
            {ordenadas.map((m) => (
              <li key={m.id} className="min-w-0 rounded-xl border border-navy/10 bg-cream/60 p-3">
                <p className="break-words font-medium">{m.titulo}</p>
                <p className="break-words text-navy/70">
                  {humano(m.status, "sem situação registrada")}
                  {m.fase ? ` · ${humano(m.fase)}` : ""}
                  {m.responsavel ? ` · ${m.responsavel}` : ""}
                </p>
                <p className="break-words text-xs text-navy/55">
                  {m.prazo ? `Prazo ${dataHumana(m.prazo)}` : "sem prazo registrado"}
                  {m.concluidaEm ? ` · concluída em ${dataHumana(m.concluidaEm)}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {concluida(m) ? (
                    <Acao
                      rotulo="Escrever para a família"
                      titulo="Texto que a família vai ler"
                      variante="outline"
                      campos={[
                        { nome: "resumo", rotulo: "Resumo para a família", tipo: "area", obrigatorio: true },
                      ]}
                      /*
                        03/10/2026: salva RASCUNHO, não publica. O texto fica
                        gravado e editável (“Rascunhos para o App”, abaixo), e
                        publicar é um segundo ato explícito. Antes era um
                        clique só, de uma caixa que não guardava nada — e um
                        texto com vocabulário interno ficava "publicado" no
                        banco enquanto o cliente via tela vazia.
                      */
                      aoConfirmar={(v) =>
                        salvarRascunho({
                          data: {
                            microentregaId: m.id,
                            resumoSanitizado: v["resumo"] ?? "",
                            tipo: "microentrega",
                          },
                        })
                      }
                      confirmacao="Rascunho salvo. Revise e publique em “Rascunhos para o App”."
                    />
                  ) : (
                    <Acao
                      rotulo="Aprovar microentrega"
                      titulo="Revisão humana da microentrega"
                      campos={[{ nome: "evidencia", rotulo: "Evidência da revisão", tipo: "area" }]}
                      aoConfirmar={(v) => aprovar({ data: { id: m.id, evidencia: v["evidencia"] ?? "" } })}
                      confirmacao="Microentrega aprovada."
                    />
                  )}
                  {concluida(m) ? (
                    <AcaoPublicarNoApp
                      microentregaId={m.id}
                      aoConfirmar={(v) => publicarAgora({ data: v as Parameters<typeof publicarAgora>[0]["data"] })}
                    />
                  ) : null}
                  <Link search={true} to="/golive/caso">
                    <Button size="sm" variant="outline">Abrir Caso 360</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio cta={acaoNova} />
        )}
      </Bloco>

      {/*
        03/10/2026 — o texto que vai ao cliente passa por aqui: gravado,
        editável depois de recarregar, e publicado num segundo ato. É onde a
        revisão de copy da marca acontece.
      */}
      <Bloco titulo="3. Rascunhos para o App">
        <RascunhosApp />
      </Bloco>

      <Bloco titulo="4. Nova microentrega">{acaoNova}</Bloco>
    </GoLiveShell>
  );
}
