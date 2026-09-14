/**
 * Pesquisa no shell de go-live.
 *
 * Ordem obrigatória da prancha v3: pergunta → fonte → evidência → achado.
 * Só apresentação: lê o que o motor aprovado já devolve para o caso canônico.
 * Sem histórico, sem catálogo, sem auditoria, sem dado inventado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa — Go-live Clube Ancestral" },
      { name: "description", content: "Pergunta, fonte, evidência e achado do caso do piloto, com estado vazio declarado." },
      { property: "og:title", content: "Pesquisa — Go-live Clube Ancestral" },
      { property: "og:description", content: "Pergunta, fonte, evidência e achado do caso do piloto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PesquisaGoLive,
});

const ETAPAS = ["Pergunta", "Fonte", "Evidência", "Achado"] as const;

function PesquisaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const perguntas = caso?.caso.proximaAcao ? [caso.caso.proximaAcao] : [];
  const fontes = caso?.documentos ?? [];
  const evidencias = fontes.filter((d) => (d.status ?? "").length > 0);
  const achados = caso?.publicados.filter((p) => (p.resumo ?? "").length > 0) ?? [];

  return (
    <GoLiveShell titulo="Pesquisa" descricao="Pergunta › Fonte › Evidência › Achado.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <nav aria-label="Etapas da pesquisa" className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] leading-tight text-navy/45">
          {ETAPAS.map((e, i) => (
            <span key={e} className="flex items-center gap-1">
              <span>{e}</span>
              {i < ETAPAS.length - 1 ? <span aria-hidden>›</span> : null}
            </span>
          ))}
        </p>
      </nav>

      <Etapa
        titulo="1. Pergunta de pesquisa"
        vazio="Buscar pessoa ou caso"
        itens={perguntas.map((p, i) => <li key={i} className="break-words">{p}</li>)}
      />

      <Etapa
        titulo="2. Fontes"
        vazio="Registrar fonte no caso"
        itens={fontes.map((f) => (
          <li key={f.id} className="break-words">
            {f.titulo}
          </li>
        ))}
      />

      <Etapa
        titulo="3. Evidências"
        vazio="Anexar evidência"
        itens={evidencias.map((e) => (
          <li key={e.id} className="break-words">
            {e.titulo} <span className="text-navy/55">— {humano(e.status)}</span>
          </li>
        ))}
      />

      <Etapa
        titulo="4. Achados"
        vazio="Registrar achado"
        itens={achados.map((a) => (
          <li key={a.id} className="break-words">
            {a.resumo}
          </li>
        ))}
      />
    </GoLiveShell>
  );
}

function Etapa({ titulo, itens, vazio }: { titulo: string; itens: ReactNode[]; vazio: string }) {
  return (
    <Bloco titulo={titulo}>
      {itens.length ? (
        <ul className="space-y-1 text-sm text-navy">{itens}</ul>
      ) : (
        <Vazio
          cta={
            <Link to="/golive/caso">
              <Button size="sm">{vazio}</Button>
            </Link>
          }
        />
      )}
    </Bloco>
  );
}
