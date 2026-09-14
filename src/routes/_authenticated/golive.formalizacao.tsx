/**
 * Formalização no shell de go-live.
 *
 * Fecha a cadeia Proposta → Escopo → Contrato/Anexos → Ordem de serviço →
 * Publicação sem abrir o Desk histórico. Só leitura do motor aprovado
 * (`carregarGoLive`): nada é criado, estimado ou gravado aqui.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Escada } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/formalizacao")({
  head: () => ({
    meta: [
      { title: "Formalização — Go-live Clube Ancestral" },
      { name: "description", content: "Proposta, escopo, contrato, ordem de serviço e publicação do caso do piloto." },
      { property: "og:title", content: "Formalização — Go-live Clube Ancestral" },
      { property: "og:description", content: "Da proposta aprovada até a publicação para a família." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FormalizacaoGoLive,
});

function moeda(valor: number | null, sigla: string) {
  if (valor === null || valor === undefined) return null;
  try {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: sigla || "BRL" });
  } catch {
    return String(valor);
  }
}

function FormalizacaoGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  return (
    <GoLiveShell titulo="Formalização" descricao="Proposta, escopo, contrato, ordem de serviço e publicação.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo="Cadeia da formalização">
            <Escada
              etapas={[
                { rotulo: "Proposta", feito: caso.propostas.length > 0 },
                { rotulo: "Escopo", feito: caso.escopo.length > 0 },
                { rotulo: "Contrato", feito: caso.caso.contratoAssinado || caso.contratos.length > 0 },
                { rotulo: "Ordem de serviço", feito: caso.ordensServico.length > 0 },
                { rotulo: "Publicação", feito: caso.publicados.length > 0 },
              ]}
            />
          </Bloco>

          <Bloco titulo="1. Proposta">
            {caso.propostas.length ? (
              <ul className="space-y-2 text-sm text-navy">
                {caso.propostas.map((p) => (
                  <li key={p.id} className="break-words">
                    <span className="font-medium">Versão {p.versao ?? 1}</span> — {humano(p.status)}
                    {moeda(p.valor, p.moeda) ? <span className="text-navy/60"> · {moeda(p.valor, p.moeda)}</span> : null}
                    {p.enviadaEm ? <span className="text-navy/55"> · enviada em {dataHumana(p.enviadaEm)}</span> : null}
                    {p.aprovadaEm ? <span className="text-navy/55"> · aprovada em {dataHumana(p.aprovadaEm)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/propostas"><Button size="sm">Registrar proposta</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="2. Escopo aprovado">
            {caso.escopo.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.escopo.map((i) => (
                  <li key={i.id} className="break-words">
                    {i.titulo}
                    <span className="text-navy/55"> — {humano(i.status)}</span>
                    {i.exigeRevisaoHumana ? (
                      <span className="text-[var(--terracota,#9A3A2F)]"> · revisão humana pendente</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/contratos"><Button size="sm">Definir escopo</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="3. Contrato e anexos">
            {caso.contratos.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.contratos.map((c) => (
                  <li key={c.id} className="break-words">
                    {c.numero ? `${c.numero} — ` : ""}
                    {c.titulo} <span className="text-navy/55">{humano(c.status)}</span>
                    {c.assinadoEm ? <span className="text-navy/55"> · assinado em {dataHumana(c.assinadoEm)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/contratos"><Button size="sm">Preparar contrato</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="4. Ordem de serviço">
            {caso.ordensServico.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.ordensServico.map((o) => (
                  <li key={o.id} className="break-words">
                    {o.numero ?? "Ordem de serviço"} — {humano(o.status)}
                    {o.resumo ? <span className="text-navy/60"> · {o.resumo}</span> : null}
                    {o.inicio ? <span className="text-navy/55"> · início {dataHumana(o.inicio)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/ordens-servico" search={{ caseId: caso.caso.id }}><Button size="sm">Abrir ordem de serviço</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="5. Publicação para a família">
            {caso.publicados.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.publicados.map((p) => (
                  <li key={p.id} className="break-words">
                    {p.resumo ?? humano(p.tipo)}
                    {p.em ? <span className="text-navy/55"> · publicado em {dataHumana(p.em)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/golive/portal"><Button size="sm">Abrir Portal</Button></Link>} />
            )}
          </Bloco>
        </>
      ) : null}

      {data && !data.encontrado ? (
        <Bloco titulo="Formalização">
          <Vazio cta={<Link to="/golive/caso"><Button size="sm">Abrir Caso 360</Button></Link>} />
        </Bloco>
      ) : null}
    </GoLiveShell>
  );
}
