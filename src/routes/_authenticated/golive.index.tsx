import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Escada } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import type { DadosGoLive } from "@/lib/golive.functions";
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

  return (
    <GoLiveShell titulo="Hoje" descricao="Uma leitura: o caso, a etapa e a próxima ação.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Vazio cta={<span className="text-sm text-navy/60">O caso {data.codigo} não está disponível nesta conta.</span>} />
      ) : null}
      {data?.encontrado ? (
        <>
          <Bloco titulo={data.caso.titulo}>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Item rotulo="Etapa" valor={data.plano?.fase ?? data.caso.fase} />
              <Item rotulo="Responsável" valor={data.caso.responsavel} />
              <Item rotulo="Próxima ação" valor={data.plano?.proximaAcao ?? data.caso.proximaAcao} />
              <Item rotulo="Prazo" valor={data.plano?.prazo ?? data.caso.prazo} />
            </dl>
          </Bloco>

          <Bloco titulo="Cadeia do caso">
            <Escada
              etapas={[
                { rotulo: "Caso", feito: true },
                { rotulo: "Proposta", feito: data.propostas.length > 0 },
                { rotulo: "Contrato", feito: data.caso.contratoAssinado },
                { rotulo: "Pagamento", feito: data.caso.pagamentoConfirmado },
                { rotulo: "Documentos", feito: data.caso.documentosMinimosOk },
                { rotulo: "Pesquisa", feito: data.evidencias.length > 0 || data.achados.length > 0 },
                { rotulo: "Publicação", feito: data.publicados.length > 0 },
              ]}
            />
          </Bloco>

          <Bloco titulo="Pendência principal">
            {pendencia(data) ? (
              <p className="text-sm text-navy/80">{pendencia(data)}</p>
            ) : (
              <Vazio cta={<Link to="/golive/caso"><Button size="sm">Abrir caso</Button></Link>} />
            )}
          </Bloco>


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
