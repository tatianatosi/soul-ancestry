import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import {
  BLOQUEIOS_EXEMPLARES_HANDOFF,
  BRIEF_DISCOVERY,
  CAMPOS_PROIBIDOS_CLIENTE_CA04,
  DECISOES_PENDENTES_CA04,
  EIXO_COMERCIAL_TRANSICOES,
  EIXO_FORMALIZACAO_TRANSICOES,
  FONTES_VERDADE_CA04,
  LISTAS_BASE_CA04,
  MATRIZ_HANDOFF_CA04,
  ROTEIRO_DISCOVERY_V2,
  type NomeListaCA04,
} from "@/lib/ca04-crm-mestre";

export const Route = createFileRoute("/_authenticated/crm-mestre")({
  head: () => ({
    meta: [
      { title: "CRM Mestre, Discovery e Handoff — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro interno somente leitura do CA-04: fontes de verdade, listas controladas, máquinas de estado, roteiro de Discovery, Brief e matriz de handoff.",
      },
      { property: "og:title", content: "CRM Mestre, Discovery e Handoff" },
      {
        property: "og:description",
        content: "Dicionário CRM v1.1, eixos comercial e de formalização, handoff e decisões humanas pendentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

const CARTAO = "rounded-xl border border-navy/10 bg-white p-4";
const TITULO_SECAO = "font-serif text-xl text-navy";

function Pagina() {
  const listas = Object.keys(LISTAS_BASE_CA04) as NomeListaCA04[];

  return (
    <SaasShell
      titulo="CRM Mestre, Discovery e Handoff"
      descricao="CA-04 v1.0.1 — somente leitura. Nenhum dado é criado ou alterado aqui, nenhuma ação externa é disparada e nenhuma fonte de verdade é substituída."
    >
      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Fontes de verdade</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {FONTES_VERDADE_CA04.map((f) => (
              <article key={f.camada} className={CARTAO}>
                <p className="text-sm font-semibold text-navy">{f.camada}</p>
                <p className="mt-1 text-sm text-navy/80">{f.responsabilidade}</p>
                <p className="mt-2 text-xs text-terracotta">Não usar como: {f.naoUsarComo}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Eixo Comercial</h2>
          <TabelaTransicoes transicoes={EIXO_COMERCIAL_TRANSICOES} />
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Eixo Formalização/Operação</h2>
          <TabelaTransicoes transicoes={EIXO_FORMALIZACAO_TRANSICOES} />
          <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-navy">
            Resultado comercial é sempre derivado dos dois eixos. O estado exato que marca “Convertido”
            depende de decisão humana ainda pendente — nada é derivado como convertido antes dela.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Roteiro Mestre de Discovery v2</h2>
          <ol className={`${CARTAO} list-decimal space-y-1 pl-6 text-sm text-navy/85`}>
            {ROTEIRO_DISCOVERY_V2.map((passo) => (
              <li key={passo}>{passo}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Brief de Discovery por pessoa</h2>
          <div className={`${CARTAO} overflow-x-auto`}>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="py-2">Campo</th>
                  <th className="py-2">Origem</th>
                  <th className="py-2">Retorna ao CRM</th>
                </tr>
              </thead>
              <tbody className="text-navy/85">
                {BRIEF_DISCOVERY.map((c) => (
                  <tr key={c.campo} className="border-t border-navy/10">
                    <td className="py-2 pr-3">{c.campo}</td>
                    <td className="py-2 pr-3">{c.origem}</td>
                    <td className="py-2">{c.retornaAoCrm ? "Sim (referência)" : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Matriz de handoff</h2>
          <div className="space-y-3">
            {MATRIZ_HANDOFF_CA04.map((e) => (
              <article key={e.etapa} className={CARTAO}>
                <p className="text-sm font-semibold text-navy">{e.etapa}</p>
                <dl className="mt-2 grid gap-2 text-sm text-navy/80 md:grid-cols-2">
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Recebe</dt><dd>{e.dadoRecebido}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Cria</dt><dd>{e.dadoCriado}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Responsável</dt><dd>{e.responsavel}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Condição de aprovação</dt><dd>{e.condicaoAprovacao}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Visibilidade</dt><dd>{e.visibilidade}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wide text-navy/50">Bloqueio</dt><dd className="text-terracotta">{e.bloqueio}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <ul className={`${CARTAO} list-disc space-y-1 pl-6 text-sm text-navy/85`}>
            {BLOQUEIOS_EXEMPLARES_HANDOFF.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Nunca projetar ao cliente</h2>
          <div className={`${CARTAO} flex flex-wrap gap-2`}>
            {CAMPOS_PROIBIDOS_CLIENTE_CA04.map((c) => (
              <span key={c} className="rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1 text-xs text-terracotta">
                {c}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Listas controladas (LISTAS_BASE v1.1)</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {listas.map((nome) => (
              <details key={nome} className={CARTAO}>
                <summary className="cursor-pointer text-sm font-medium text-navy">
                  {nome} <span className="text-navy/50">({LISTAS_BASE_CA04[nome].length})</span>
                </summary>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-navy/80">
                  {(LISTAS_BASE_CA04[nome] as readonly string[]).map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className={TITULO_SECAO}>Decisões humanas pendentes</h2>
          <ol className={`${CARTAO} space-y-2 text-sm text-navy/85`}>
            {DECISOES_PENDENTES_CA04.map((d) => (
              <li key={d.numero} className="flex gap-3">
                <span className="text-navy/50">{String(d.numero).padStart(2, "0")}</span>
                <span>
                  {d.titulo}
                  <span className="block text-xs text-navy/55">Responsável: {d.responsavel}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </SaasShell>
  );
}

function TabelaTransicoes({
  transicoes,
}: {
  transicoes: readonly {
    de: string;
    para: string;
    gatilho: string;
    responsavel: string;
    dadosMinimos: string;
    bloqueio: string;
    fonteVerdade: string;
  }[];
}) {
  return (
    <div className={`${CARTAO} overflow-x-auto`}>
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-navy/60">
          <tr>
            <th className="py-2">Transição</th>
            <th className="py-2">Gatilho</th>
            <th className="py-2">Responsável</th>
            <th className="py-2">Dados mínimos</th>
            <th className="py-2">Bloqueio</th>
            <th className="py-2">Fonte de verdade</th>
          </tr>
        </thead>
        <tbody className="text-navy/85">
          {transicoes.map((t) => (
            <tr key={`${t.de}-${t.para}`} className="border-t border-navy/10 align-top">
              <td className="py-2 pr-3 font-medium text-navy">
                {t.de === "*" ? "Qualquer etapa" : t.de} → {t.para}
              </td>
              <td className="py-2 pr-3">{t.gatilho}</td>
              <td className="py-2 pr-3">{t.responsavel}</td>
              <td className="py-2 pr-3">{t.dadosMinimos}</td>
              <td className="py-2 pr-3 text-terracotta">{t.bloqueio}</td>
              <td className="py-2">{t.fonteVerdade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
