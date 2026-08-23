import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { carregarConversao } from "@/lib/conversao.functions";
import {
  ACOES_EXTERNAS_BLOQUEADAS,
  CAMADAS_WHATSAPP,
  CANAIS_HANDOFF,
  FRONTEIRA_MARKETING_COMERCIAL,
  MAPA_MARKETING,
  SECOES_MARKETING,
  leituraMetricas,
  resumoPorOrigem,
  type Confianca,
} from "@/lib/marketing-aquisicao";

export const Route = createFileRoute("/_authenticated/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing e aquisição — canais e atribuição | Clube Ancestral" },
      {
        name: "description",
        content:
          "Leitura interna de aquisição: canais, campanhas, conteúdo, atribuição de origem, funil e métricas por canal, com fonte e confiança declaradas.",
      },
      { property: "og:title", content: "Marketing e aquisição | Clube Ancestral" },
      {
        property: "og:description",
        content: "Aba 2 do Desk Intelligence: canais, atribuição, funil de aquisição e métricas por canal.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Marketing,
});

const Bloco = ({
  id,
  titulo,
  descricao,
  children,
}: {
  id: string;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24 rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    {descricao && <p className="mt-1 text-[12px] text-navy/55">{descricao}</p>}
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

const CONFIANCA_ROTULO: Record<Confianca, string> = {
  alta: "confiança alta",
  media: "confiança média",
  baixa: "confiança baixa",
  sem_dados: "sem dados",
};

const Selo = ({ texto }: { texto: string }) => (
  <span className="rounded-full border border-navy/15 bg-cream/60 px-2 py-0.5 text-[11px] text-navy/70">{texto}</span>
);

function Marketing() {
  const carregar = useServerFn(carregarConversao);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const [tecnicoAberto, setTecnicoAberto] = useState(false);

  const q = useQuery({
    queryKey: ["marketing-aquisicao", incluirDemo],
    queryFn: () => carregar({ data: { incluirDemo } }),
    retry: false,
  });

  const entrada = useMemo(
    () => ({
      leads: (q.data?.leadsTodos ?? []) as { origem?: string | null; canal?: string | null }[],
      eventos: (q.data?.eventos ?? []) as { origem?: string | null; canal?: string | null }[],
      investimentos: q.data?.investimentos ?? [],
      campanhas: q.data?.campanhas ?? [],
      fontes: q.data?.fontes ?? [],
      atribuicoes: q.data?.atribuicoes ?? [],
    }),
    [q.data],
  );

  const origens = useMemo(() => resumoPorOrigem(entrada), [entrada]);
  const metricas = useMemo(() => leituraMetricas(entrada), [entrada]);

  return (
    <SaasShell
      titulo="Marketing e aquisição"
      descricao="Canais, campanhas, conteúdo e atribuição antes do lead existir. Somente leitura — nenhuma campanha, link ou envio é executado aqui."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-gold/40 bg-cream/50 p-4 text-sm text-navy/75">
          <p>
            <strong className="text-navy">Marketing</strong> — {FRONTEIRA_MARKETING_COMERCIAL.marketing}
          </p>
          <p className="mt-1">
            <strong className="text-navy">Comercial</strong> — {FRONTEIRA_MARKETING_COMERCIAL.comercial}
          </p>
          <p className="mt-2 text-[12px] text-navy/55">{FRONTEIRA_MARKETING_COMERCIAL.regra}</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {SECOES_MARKETING.map((s) => (
            <a
              key={s.hash}
              href={`#${s.hash}`}
              className="rounded-full border border-navy/15 px-3 py-1 text-[12px] text-navy/70 hover:border-gold hover:text-navy"
            >
              {s.titulo}
            </a>
          ))}
        </nav>

        <Bloco id="visao-geral" titulo="Visão geral de aquisição" descricao={SECOES_MARKETING[0].descricao}>
          <label className="mb-3 flex items-center gap-2 text-[12px] text-navy/60">
            <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
            Incluir registros de demonstração (fora das métricas reais)
          </label>
          {q.isLoading ? (
            <p className="text-[13px] text-navy/50">Carregando leitura de aquisição…</p>
          ) : origens.length === 0 ? (
            <EstadoVazio mensagem="Sem entradas de aquisição no recorte: nenhum lead ou evento de conversão disponível para leitura." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {origens.map((o) => (
                <li key={o.rotulo} className="flex items-center justify-between py-2">
                  <span className="text-navy">{o.rotulo}</span>
                  <span className="text-[12px] text-navy/60">
                    {o.leads} lead(s) · {o.eventos} evento(s)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>

        <Bloco id="canais-campanhas" titulo="Canais e campanhas" descricao={SECOES_MARKETING[1].descricao}>
          <div className="flex flex-wrap gap-2">
            <Selo texto={`${entrada.campanhas.length} campanha(s) registrada(s)`} />
            <Selo texto={`${entrada.fontes.length} origem(ns) catalogada(s)`} />
            <Selo texto={`${entrada.investimentos.length} lançamento(s) de investimento`} />
          </div>
          <p className="mt-3 text-[12px] text-navy/55">
            Nenhuma campanha, anúncio ou conexão de mídia é criada, alterada ou conectada por esta tela.
          </p>
        </Bloco>

        <Bloco id="conteudo-ctas" titulo="Conteúdo e CTAs" descricao={SECOES_MARKETING[2].descricao}>
          <p>
            Não existe página pública de captura própria nem CTA com link rastreável. Enquanto isso permanecer, conteúdo
            não gera origem atribuível e a lacuna fica declarada, sem estimativa.
          </p>
        </Bloco>

        <Bloco id="atribuicao" titulo="Atribuição e origem" descricao={SECOES_MARKETING[3].descricao}>
          <p className="mb-3">
            {entrada.atribuicoes.length === 0
              ? "Nenhum registro de atribuição com UTM. Origem do lead hoje é texto livre, sem taxonomia fechada."
              : `${entrada.atribuicoes.length} registro(s) de atribuição disponível(is) para leitura.`}
          </p>
          <h3 className="font-serif text-base text-navy">WhatsApp por camada</h3>
          <ul className="mt-2 space-y-2">
            {CAMADAS_WHATSAPP.map((c) => (
              <li key={c.camada} className="rounded-lg border border-navy/10 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-navy">{c.camada}</span>
                  <Selo texto={c.natureza} />
                  <Selo texto={c.estado} />
                </div>
                <p className="mt-1 text-[12px] text-navy/60">{c.regra}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco id="funil-aquisicao" titulo="Funil de aquisição" descricao={SECOES_MARKETING[4].descricao}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="py-2 pr-3">Canal</th>
                  <th className="py-2 pr-3">Origem gravada</th>
                  <th className="py-2 pr-3">Handoff</th>
                  <th className="py-2">Risco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {CANAIS_HANDOFF.map((c) => (
                  <tr key={c.canal}>
                    <td className="py-2 pr-3 text-navy">{c.canal}</td>
                    <td className="py-2 pr-3">{c.origemGravada}</td>
                    <td className="py-2 pr-3">{c.handoff}</td>
                    <td className="py-2 text-navy/60">{c.risco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Bloco>

        <Bloco id="metricas-canal" titulo="Métricas por canal" descricao={SECOES_MARKETING[5].descricao}>
          <ul className="space-y-2">
            {metricas.map((m) => (
              <li key={m.chave} className="rounded-lg border border-navy/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-navy">{m.nome}</span>
                  <span className="flex items-center gap-2">
                    <strong className="text-[13px] text-navy">{m.valor}</strong>
                    <Selo texto={CONFIANCA_ROTULO[m.confianca]} />
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-navy/55">{m.nota}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco id="aprendizados" titulo="Aprendizados" descricao={SECOES_MARKETING[6].descricao}>
          <p>
            Leitura de canal é insumo interno de decisão humana. Nenhum aprendizado registrado aqui aciona campanha,
            verba, link ou mensagem.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-navy/60">
            {ACOES_EXTERNAS_BLOQUEADAS.map((a) => (
              <li key={a}>{a} — não executado por esta superfície.</li>
            ))}
          </ul>
        </Bloco>

        <Bloco id="links-comercial" titulo="Links contextuais para Comercial" descricao={SECOES_MARKETING[7].descricao}>
          <div className="flex flex-wrap gap-2">
            <Link to="/leads" className="rounded-lg border border-navy/15 px-3 py-1.5 text-[13px] text-navy hover:border-gold">
              Leads e triagem
            </Link>
            <Link to="/conversao" className="rounded-lg border border-navy/15 px-3 py-1.5 text-[13px] text-navy hover:border-gold">
              Conversão e funil comercial
            </Link>
            <Link to="/calls" className="rounded-lg border border-navy/15 px-3 py-1.5 text-[13px] text-navy hover:border-gold">
              Calls Discovery
            </Link>
          </div>
          <p className="mt-3 text-[12px] text-navy/55">
            A lista de leads pertence a Comercial. Marketing não duplica nem edita lead.
          </p>
        </Bloco>

        <section className="rounded-xl border border-navy/10 bg-white p-5">
          <button
            type="button"
            onClick={() => setTecnicoAberto((v) => !v)}
            className="text-[13px] text-navy/70 underline underline-offset-4"
          >
            {tecnicoAberto ? "Ocultar detalhes técnicos" : "Detalhes técnicos (mapa de estado e destino)"}
          </button>
          {tecnicoAberto && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                  <tr>
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Lacuna</th>
                    <th className="py-2">Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {MAPA_MARKETING.map((l) => (
                    <tr key={l.item}>
                      <td className="py-2 pr-3 text-navy">{l.item}</td>
                      <td className="py-2 pr-3">{l.estado}</td>
                      <td className="py-2 pr-3 text-navy/60">{l.lacuna}</td>
                      <td className="py-2 text-navy/60">{l.destino}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </SaasShell>
  );
}
