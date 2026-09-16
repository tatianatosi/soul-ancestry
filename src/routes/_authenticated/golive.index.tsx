import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk, Vazio } from "@/components/golive/shell";
import { Linha, Rosca } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import type { DadosGoLive } from "@/lib/golive.functions";
import { definirProximaAcaoGoLive } from "@/lib/golive-escritores.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  kpisHoje,
  prioridadeDaCarteira,
  ritmoSemanal,
  temRitmo,
} from "@/lib/golive-operacao";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/")({
  head: () => ({
    meta: [
      { title: "Hoje — Go-live Clube Ancestral" },
      { name: "description", content: "Entrada única do go-live: etapa, próxima ação, responsável e prazo do caso canônico." },
      { property: "og:title", content: "Hoje — Go-live Clube Ancestral" },
      { property: "og:description", content: "Etapa, próxima ação, responsável e prazo do caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HojeGoLive,
});

function HojeGoLive() {
  const { data, isPending, error } = useGoLive();
  const definir = useServerFn(definirProximaAcaoGoLive);
  const caso = data?.encontrado ? data : null;

  const kpis = caso ? kpisHoje(caso.carteira, caso.tarefas) : null;
  const ritmo = caso ? ritmoSemanal(caso.microentregas, 7) : [];
  const temSerie = caso ? temRitmo(caso.microentregas) : false;
  const prioridades = caso ? prioridadeDaCarteira(caso.carteira) : [];
  /* Leituras já carregadas, apenas resumidas em cards. */
  const proposta = caso?.propostas[0] ?? null;
  const contrato = caso?.contratos[0] ?? null;
  const acessosAtivos = caso
    ? caso.portal.acessos.filter((a) => a.situacao === "active").length
    : 0;




  const acaoPlanejador = (
    <Acao
      rotulo="Definir próxima ação"
      titulo="O que vem agora neste caso"
      variante="outline"
      campos={[
        { nome: "proximaAcao", rotulo: "Próxima ação", tipo: "area", obrigatorio: true },
        { nome: "responsavel", rotulo: "Responsável" },
        { nome: "prazo", rotulo: "Prazo", tipo: "data" },
        { nome: "marco", rotulo: "Marco do planejador" },
      ]}
      aoConfirmar={(v) =>
        definir({
          data: {
            proximaAcao: v["proximaAcao"] ?? "",
            responsavel: v["responsavel"] ?? "",
            prazo: v["prazo"] ?? "",
            marco: v["marco"] ?? "",
          },
        })
      }
      confirmacao="Próxima ação registrada no planejador."
    />
  );

  return (
    <GoLiveShell titulo="Hoje" descricao="Uma leitura: o caso, a etapa e a próxima ação.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">O caso {data.codigo} não está disponível nesta conta.</span>} />
      ) : null}

      {caso ? (
        <>
          <FaixaKpis itens={[
            { rotulo: "Ativos", valor: kpis?.ativos ?? 0, tom: "azul" },
            { rotulo: "Vencidas", valor: kpis?.vencidas ?? 0, tom: (kpis?.vencidas ?? 0) > 0 ? "terracota" : "cinza" },
            { rotulo: "Sem próxima ação", valor: kpis?.semProxima ?? 0, tom: (kpis?.semProxima ?? 0) > 0 ? "terracota" : "cinza" },
            { rotulo: "Aguardando externo", valor: kpis?.externo ?? 0, tom: (kpis?.externo ?? 0) > 0 ? "dourado" : "cinza" },
          ]} />
          <GradeDesk>
          <Bloco titulo={caso.caso.titulo}>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Item rotulo="Etapa" valor={humano(caso.plano?.fase ?? caso.caso.fase)} />
              <Item rotulo="Responsável" valor={caso.caso.responsavel} />
              <Item rotulo="Próxima ação" valor={humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao)} />
              <Item rotulo="Prazo" valor={dataHumana(caso.plano?.prazo ?? caso.caso.prazo)} />
            </dl>
            <Acoes>{acaoPlanejador}</Acoes>
          </Bloco>

          {/* Bloco analítico 2 — ritmo de entrega por semana. */}
          <Bloco titulo="Ritmo de entrega (7 semanas)">
            {temSerie ? (
              <Linha dados={ritmo} titulo="Microentregas aprovadas ou publicadas por semana" />
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/caso">
                    <Button size="sm" variant="outline">
                      Abrir Caso 360
                    </Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          {/* Bloco analítico 3 — prioridade da carteira. */}
          <Bloco titulo="Prioridade dos casos">
            {prioridades.length ? (
              <Rosca
                dados={prioridades.map((p) => ({ rotulo: humano(p.rotulo) ?? p.rotulo, valor: p.valor }))}
                titulo="Casos por prioridade"
              />
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/kanban">
                    <Button size="sm" variant="outline">
                      Abrir Operação
                    </Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Pendência principal">
            {pendencia(caso) ? (
              <p className="text-sm text-navy/80">{pendencia(caso)}</p>
            ) : (
              <Vazio cta={<Link to="/golive/caso"><Button size="sm">Abrir caso</Button></Link>} />
            )}
          </Bloco>
          </GradeDesk>

          {/* Cards de leitura rápida: mesma fonte já carregada, sem novo motor. */}
          <GradeDesk>
            <Bloco titulo="Formalização">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Item rotulo="Proposta" valor={proposta ? `${humano(proposta.status)} · v${proposta.versao ?? 1}` : null} />
                <Item rotulo="Contrato" valor={contrato ? `${contrato.numero ?? "Sem número"} · ${humano(contrato.status)}` : null} />
                <Item rotulo="Assinatura" valor={contrato?.assinadoEm ? dataHumana(contrato.assinadoEm) : "Não registrada"} />
                <Item rotulo="Anexos" valor={String(caso.anexos.length)} />
              </dl>
              <Acoes>
                <Link to="/golive/juridico"><Button size="sm" variant="outline">Abrir Jurídico</Button></Link>
              </Acoes>
            </Bloco>

            <Bloco titulo="Pesquisa">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Item rotulo="Perguntas" valor={String(caso.hipoteses.length)} />
                <Item rotulo="Fontes" valor={String(caso.fontes.length)} />
                <Item rotulo="Evidências" valor={String(caso.evidencias.length)} />
                <Item rotulo="Achados" valor={String(caso.achados.length)} />
              </dl>
              <Acoes>
                <Link to="/golive/pesquisa"><Button size="sm" variant="outline">Abrir Pesquisa</Button></Link>
              </Acoes>
            </Bloco>
          </GradeDesk>

          <GradeDesk>
            <Bloco titulo="Entrega ao cliente">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Item rotulo="Publicados" valor={String(caso.publicados.length)} />
                <Item rotulo="Microentregas" valor={String(caso.microentregas.length)} />
                <Item rotulo="Documentos" valor={String(caso.documentos.length)} />
                <Item rotulo="Acessos ativos" valor={String(acessosAtivos)} />
              </dl>
              <Acoes>
                <Link to="/golive/portal"><Button size="sm" variant="outline">Abrir Portal</Button></Link>
              </Acoes>
            </Bloco>

            <Bloco titulo="Núcleo do caso">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Item rotulo="Pessoas" valor={String(caso.pessoas.length)} />
                <Item rotulo="Dependentes" valor={String(caso.dependentes.length)} />
                <Item rotulo="Núcleo" valor={caso.identidade.nucleo} />
                <Item rotulo="Identidade" valor={caso.identidade.revisarIdentidade ? "Revisar identidade" : "Sem conflito registrado"} />
              </dl>
              <Acoes>
                <Link to="/golive/pessoas"><Button size="sm" variant="outline">Abrir Pessoas & Famílias</Button></Link>
              </Acoes>
            </Bloco>
          </GradeDesk>

          <div>
            <Link to="/golive/caso">
              <Button>Abrir Caso Ana</Button>
            </Link>
          </div>

        </>
      ) : null}
    </GoLiveShell>
  );
}

function pendencia(data: Extract<DadosGoLive, { encontrado: true }>) {
  if (!data.caso.contratoAssinado) return "Contrato ainda não registrado como assinado.";
  if (!data.caso.pagamentoConfirmado) return "Pagamento ainda não confirmado manualmente.";
  if (!data.caso.documentosMinimosOk) return "Documentos mínimos ainda não confirmados.";
  return null;
}

function Item({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-sm break-words text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
