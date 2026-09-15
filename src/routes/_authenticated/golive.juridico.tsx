/**
 * Jurídico no shell de go-live.
 *
 * Sequência da prancha v3: proposta → escopo → contrato → anexos/OS →
 * revisão humana. Só apresentação: lê o que o motor aprovado já devolve
 * para o caso canônico. Sem catálogo, SKU, contrato de teste, homologação,
 * auditoria extensa ou texto técnico.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Barras, Escada, Rosca } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import { contarPor, escadaFormalizacao } from "@/lib/golive-analitico";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/juridico")({
  head: () => ({
    meta: [
      { title: "Jurídico — Go-live Clube Ancestral" },
      { name: "description", content: "Proposta, escopo, contrato, anexos e revisão humana do caso do piloto." },
      { property: "og:title", content: "Jurídico — Go-live Clube Ancestral" },
      { property: "og:description", content: "Proposta, escopo, contrato e anexos do caso do piloto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JuridicoGoLive,
});

function JuridicoGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const contratos = caso?.contratos ?? [];
  const assinado = contratos.filter((c) => Boolean(c.assinadoEm));
  const anexos = caso?.documentos.filter((d) => /anexo|ordem de serviço|os\b/i.test(d.titulo)) ?? [];
  const revisaoPendente = contratos.filter((c) => !c.assinadoEm);
  const escopo = caso?.escopo ?? [];
  const ordens = caso?.ordensServico ?? [];
  const propostas = caso?.propostas ?? [];

  // Pipeline e revisão: contagem do que já está gravado, sem prazo inventado.
  const pipeline = escadaFormalizacao({
    propostas: propostas.length,
    escopo: escopo.length,
    contratos: contratos.length,
    assinados: assinado.length,
    ordens: ordens.length,
  });
  const temPipeline = pipeline.some((p) => p.feito);
  const escopoPorSituacao = contarPor(escopo, (i) => humano(i.status, ""), "Sem situação");
  const revisaoHumana = [
    { rotulo: "Exige revisão humana", valor: escopo.filter((i) => i.exigeRevisaoHumana).length },
    { rotulo: "Sem exigência registrada", valor: escopo.filter((i) => !i.exigeRevisaoHumana).length },
  ];
  const instrumentos = [
    { rotulo: "Assinados", valor: assinado.length },
    { rotulo: "Pendentes", valor: revisaoPendente.length },
  ];

  return (
    <GoLiveShell titulo="Jurídico" descricao="Proposta › Escopo › Contrato › Anexos/OS › Revisão humana.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      {temPipeline ? (
        <Bloco titulo="Andamento da formalização">
          <Escada etapas={pipeline} />
        </Bloco>
      ) : null}

      {contratos.length ? (
        <Bloco titulo="Instrumentos assinados e pendentes">
          <Rosca titulo="Instrumentos assinados e pendentes" dados={instrumentos} />
        </Bloco>
      ) : null}

      {escopo.length ? (
        <Bloco titulo="Escopo por situação e revisão">
          <Barras titulo="Escopo por situação" dados={escopoPorSituacao} />
          <Barras titulo="Itens que exigem revisão humana" dados={revisaoHumana} />
        </Bloco>
      ) : null}

      <Bloco titulo="1. Proposta">
        {caso?.propostas.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.propostas.map((p) => (
              <li key={p.id} className="break-words">
                Versão {p.versao ?? 1} — {humano(p.status)}
                {p.enviadaEm ? <span className="text-navy/55"> · enviada em {dataHumana(p.enviadaEm)}</span> : null}
                {p.aprovadaEm ? <span className="text-navy/55"> · aprovada em {dataHumana(p.aprovadaEm)}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/propostas">
                <Button size="sm">Abrir propostas</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="2. Escopo acordado">
        {caso?.escopo.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {caso.escopo.map((i) => (
              <li key={i.id} className="break-words">
                {i.titulo}
                <span className="text-navy/55">
                  {" "}
                  — {humano(i.status, "sem situação")}
                  {i.exigeRevisaoHumana ? " · exige revisão humana" : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/golive/formalizacao">
                <Button size="sm">Abrir Formalização</Button>
              </Link>
            }
          />
        )}
      </Bloco>


      <Bloco titulo="2. Escopo acordado">
        {caso?.caso.titulo ? (
          <p className="break-words text-sm text-navy">
            {caso.caso.titulo}
            {caso.caso.pais ? <span className="text-navy/55"> · {caso.caso.pais}</span> : null}
          </p>
        ) : (
          <Vazio
            cta={
              <Link to="/escopo-origem">
                <Button size="sm">Definir escopo</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="3. Contrato">
        {contratos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {contratos.map((c) => (
              <li key={c.id} className="break-words">
                {c.numero ? `${c.numero} — ` : ""}
                {c.titulo}{" "}
                <span className="text-navy/55">
                  · {humano(c.status, "sem situação registrada")}
                  {c.assinadoEm ? ` · assinado em ${dataHumana(c.assinadoEm)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Preparar contrato</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="4. Anexos e Ordem de Serviço">
        {anexos.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {anexos.map((a) => (
              <li key={a.id} className="break-words">
                {a.titulo} <span className="text-navy/55">· {humano(a.status, "sem situação registrada")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Anexar documento do contrato</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="5. Revisão humana">
        {revisaoPendente.length ? (
          <ul className="space-y-1 text-sm text-navy">
            {revisaoPendente.map((c) => (
              <li key={c.id} className="break-words">
                {c.titulo} — aguardando revisão e assinatura
              </li>
            ))}
          </ul>
        ) : assinado.length ? (
          <p className="text-sm text-navy">
            Revisão concluída: {assinado.length} instrumento{assinado.length === 1 ? "" : "s"} assinado
            {assinado.length === 1 ? "" : "s"}.
          </p>
        ) : (
          <Vazio
            cta={
              <Link to="/contratos">
                <Button size="sm">Enviar para revisão</Button>
              </Link>
            }
          />
        )}
      </Bloco>
    </GoLiveShell>
  );
}
