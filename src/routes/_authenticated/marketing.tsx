import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { carregarConversao } from "@/lib/conversao.functions";
import {
  CAMADAS_WHATSAPP,
  CANAIS_HANDOFF,
  FRONTEIRA_MARKETING_COMERCIAL,
  MAPA_MARKETING,
  SECOES_MARKETING,
  VAZIOS_MARKETING,
  aprendizadosCampanha,
  desempenhoPorCanal,
  distribuicaoOrigens,
  formatarIndicador,
  leituraMetricas,
  resumoPorOrigem,
  separarMetricas,
  SEM_DADOS,
  type Confianca,
} from "@/lib/marketing-aquisicao";
import {
  CANAL_TODOS,
  FILTRO_MARKETING_PADRAO,
  METRICAS_EXPLICADAS,
  PERIODOS_MARKETING,
  ROTULO_GRUPO_PRONTIDAO,
  baixarCsvMarketing,
  canaisDisponiveis,
  explicarMetrica,
  filtrarEntrada,
  linhasCsvMarketing,
  prontidaoAtribuicao,
  rotuloCanal,
  rotuloPeriodo,
  type FiltroMarketing,
  type PeriodoMarketing,
} from "@/lib/marketing-filtros-csv";

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
  const [filtro, setFiltro] = useState<FiltroMarketing>(FILTRO_MARKETING_PADRAO);

  const q = useQuery({
    queryKey: ["marketing-aquisicao", incluirDemo],
    queryFn: () => carregar({ data: { incluirDemo } }),
    retry: false,
  });

  const entradaBruta = useMemo(
    () => ({
      leads: (q.data?.leadsTodos ?? []) as { origem?: string | null; canal?: string | null }[],
      eventos: (q.data?.eventos ?? []) as { origem?: string | null; canal?: string | null }[],
      investimentos: q.data?.investimentos ?? [],
      campanhas: q.data?.campanhas ?? [],
      fontes: q.data?.fontes ?? [],
      atribuicoes: q.data?.atribuicoes ?? [],
      // Só para checar pagamento confirmado por atribuição — CAC/ROI reais,
      // nunca contam lead ou proposta como venda, só caso com pagamento
      // confirmado.
      casos: (q.data?.casos ?? []) as { id?: string | null; pagamento_confirmado?: boolean | null }[],
    }),
    [q.data],
  );

  const canais = useMemo(() => canaisDisponiveis(entradaBruta), [entradaBruta]);
  const entrada = useMemo(() => filtrarEntrada(entradaBruta, filtro), [entradaBruta, filtro]);
  const prontidao = useMemo(() => prontidaoAtribuicao(entrada), [entrada]);
  const explicacoes = useMemo(
    () => Object.fromEntries(METRICAS_EXPLICADAS.map((c) => [c, explicarMetrica(c, entrada)])),
    [entrada],
  );
  const totalLinhasCsv = useMemo(() => linhasCsvMarketing(entrada, filtro).length, [entrada, filtro]);

  const origens = useMemo(() => resumoPorOrigem(entrada), [entrada]);
  const metricas = useMemo(() => leituraMetricas(entrada), [entrada]);
  const { principais, historico } = useMemo(() => separarMetricas(metricas), [metricas]);
  const origensCatalogo = useMemo(() => distribuicaoOrigens(entrada.leads), [entrada.leads]);
  const desempenho = useMemo(() => desempenhoPorCanal(entrada), [entrada]);
  const aprendizados = useMemo(() => aprendizadosCampanha(entrada), [entrada]);

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

        <section
          data-marketing="filtros"
          className="flex flex-wrap items-end gap-3 rounded-xl border border-navy/10 bg-white p-4"
        >
          <label className="flex flex-col text-[11px] uppercase tracking-wide text-navy/50">
            Período
            <select
              value={filtro.periodo}
              onChange={(e) => setFiltro((f) => ({ ...f, periodo: e.target.value as PeriodoMarketing }))}
              className="mt-1 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-[13px] normal-case tracking-normal text-navy"
            >
              {PERIODOS_MARKETING.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-[11px] uppercase tracking-wide text-navy/50">
            Canal
            <select
              value={filtro.canal}
              onChange={(e) => setFiltro((f) => ({ ...f, canal: e.target.value }))}
              className="mt-1 rounded-lg border border-navy/15 bg-white px-3 py-1.5 text-[13px] normal-case tracking-normal text-navy"
            >
              <option value={CANAL_TODOS}>Todos os canais</option>
              {canais.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            data-marketing="exportar-csv"
            onClick={() => baixarCsvMarketing(entrada, filtro)}
            className="rounded-lg border border-gold bg-cream/60 px-3 py-1.5 text-[13px] text-navy hover:border-navy"
          >
            Exportar indicadores em CSV ({totalLinhasCsv} linha(s))
          </button>
          <p className="basis-full text-[12px] text-navy/55">
            Recorte atual: {rotuloPeriodo(filtro.periodo)} · {rotuloCanal(filtro.canal)}. O CSV inclui os estados “
            {SEM_DADOS}”, sem estimativa. Arquivo gerado localmente; nada é enviado para fora.
          </p>
        </section>

        {/*
          27/08/2026 — "o que é indicador vira realidade no topo... indicadores
          que ficam embaixo desaparecem" (Proprietária), mesma lógica de
          Casos 360. Prontidão, os 5 principais (CAC/ROI reais) e desempenho
          por canal eram 3 blocos espalhados pela página — viram um só, cards,
          primeiro bloco depois dos filtros. Nada duplicado mais abaixo.
        */}
        <Bloco
          id="indicadores"
          titulo="Indicadores"
          descricao={SECOES_MARKETING.find((s) => s.hash === "indicadores")!.descricao}
        >
          <p data-marketing="prontidao-resumo" className="text-[13px] text-navy/70">
            {prontidao.resumo}
          </p>

          <div data-marketing="metricas-principais" className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {principais.map((m) => (
              <div key={m.chave} className="rounded-xl border border-navy/10 bg-cream/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-wide text-navy/50">{m.nome}</span>
                  <Selo texto={CONFIANCA_ROTULO[m.confianca]} />
                </div>
                <p className="mt-1 font-serif text-lg text-navy">{m.valor}</p>
                <p className="mt-1 text-[11px] text-navy/55">{m.nota}</p>
                {m.valor === SEM_DADOS && (m.chave === "cac" || m.chave === "roi") && (
                  <div data-marketing-explicacao={m.chave} className="mt-2 rounded-lg border border-navy/10 bg-white p-2">
                    {(m.chave === "cac" ? ["cac"] : ["roi", "roas"]).map((k) => {
                      const e = explicacoes[k as "cac" | "roi" | "roas"];
                      return (
                        <div key={k} className="mt-1 first:mt-0">
                          <p className="text-[11px] text-navy" title={e.tooltip}>
                            <abbr title={e.tooltip} className="no-underline">
                              {e.nome}
                            </abbr>{" "}
                            = {e.formula}
                          </p>
                          <ul className="mt-1 list-disc pl-4 text-[10px] text-navy/60">
                            {e.faltantes.map((f) => (
                              <li key={f.campo}>
                                Falta <strong className="text-navy">{f.campo}</strong> em {f.onde} — {f.porque}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p data-marketing-vazio="cac-roi" className="mt-2 text-[12px] text-navy/55">
            {VAZIOS_MARKETING.cacRoi}
          </p>

          {desempenho.length > 0 && (
            <div data-marketing="desempenho-canal" className="mt-4 overflow-x-auto">
              <h3 className="font-serif text-base text-navy">Desempenho por canal</h3>
              <table className="mt-2 w-full text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                  <tr>
                    <th className="py-2 pr-3">Canal</th>
                    <th className="py-2 pr-3">Investimento</th>
                    <th className="py-2 pr-3">Pagamentos atribuídos</th>
                    <th className="py-2 pr-3">CAC</th>
                    <th className="py-2">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {desempenho.map((d) => (
                    <tr key={d.canal}>
                      <td className="py-2 pr-3 text-navy">{d.canal}</td>
                      <td className="py-2 pr-3">{formatarIndicador(d.investimento)}</td>
                      <td className="py-2 pr-3">{d.pagamentosAtribuidos}</td>
                      <td className="py-2 pr-3">{formatarIndicador(d.cac)}</td>
                      <td className="py-2">{formatarIndicador(d.roi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-1 text-[11px] text-navy/50">
                Pagamento atribuído exige caso com pagamento inicial confirmado — nunca lead ou proposta.
              </p>
            </div>
          )}

          <details data-marketing="prontidao-checklist" className="mt-4 rounded-lg border border-navy/10 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy">
              Prontidão de atribuição — checklist completo
            </summary>
            <ul className="mt-3 space-y-2">
              {prontidao.itens.map((i) => (
                <li key={i.chave} className="rounded-lg border border-navy/10 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span aria-hidden className={i.atendido ? "text-navy" : "text-terracotta"}>
                      {i.atendido ? "✓" : "•"}
                    </span>
                    <span className="text-navy">{i.titulo}</span>
                    <Selo texto={ROTULO_GRUPO_PRONTIDAO[i.grupo]} />
                    <Selo texto={i.atendido ? "atendido" : "pendente"} />
                  </div>
                  <p className="mt-1 text-[12px] text-navy/60">{i.exigencia}</p>
                  <p className="mt-1 text-[12px] text-navy/55">{i.detalhe}</p>
                  {!i.atendido && <p className="mt-1 text-[12px] text-navy/70">Como resolver: {i.comoResolver}</p>}
                </li>
              ))}
            </ul>
          </details>

          <details data-marketing="historico" className="mt-3 rounded-lg border border-navy/10 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-navy">Histórico e análise</summary>
            <ul className="mt-3 space-y-2">
              {historico.map((m) => (
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
            <p className="mt-2 text-[11px] text-navy/50">
              Leitura analítica: não cria tarefa, alerta, fila, status ou dado.
            </p>
          </details>
        </Bloco>

        <Bloco
          id="visao-geral"
          titulo="Visão geral de aquisição"
          descricao={SECOES_MARKETING.find((s) => s.hash === "visao-geral")!.descricao}
        >
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

        <Bloco
          id="canais-campanhas"
          titulo="Canais e campanhas"
          descricao={SECOES_MARKETING.find((s) => s.hash === "canais-campanhas")!.descricao}
        >
          <div className="flex flex-wrap gap-2">
            <Selo texto={`${entrada.campanhas.length} campanha(s) registrada(s)`} />
            <Selo texto={`${entrada.fontes.length} origem(ns) catalogada(s)`} />
            <Selo texto={`${entrada.investimentos.length} lançamento(s) de investimento`} />
          </div>
          {entrada.campanhas.length === 0 && (
            <p data-marketing-vazio="campanhas" className="mt-3 text-[13px] text-navy/70">
              {VAZIOS_MARKETING.campanhas}
            </p>
          )}
          {entrada.investimentos.length === 0 && (
            <p data-marketing-vazio="investimento" className="mt-1 text-[13px] text-navy/70">
              {VAZIOS_MARKETING.investimento}
            </p>
          )}
          <p className="mt-3 text-[12px] text-navy/55">
            Nenhuma campanha, anúncio ou conexão de mídia é criada, alterada ou conectada por esta tela. Desempenho
            por canal (investimento, CAC, ROI) está no bloco Indicadores, no topo.
          </p>
        </Bloco>

        <Bloco id="conteudo-ctas" titulo="Conteúdo e CTAs" descricao={SECOES_MARKETING.find((s) => s.hash === "conteudo-ctas")!.descricao}>
          {/*
            27/08/2026 — "conteúdo vai pra área de comunicação" (Proprietária).
            editorial_content_items já é consultado de verdade em
            /biblioteca-mensagens (message-library.functions.ts) — aqui nunca
            foi, apesar do mapa técnico desta página dizer "parcial/real".
            Vira ponte, não duplicata.
          */}
          <p>
            Conteúdo editorial (posts, CTAs, temas por etapa de funil) é governado na Biblioteca de Mensagens, junto
            dos modelos de WhatsApp, e-mail e portal — não aqui.
          </p>
          <Link
            to="/biblioteca-mensagens"
            search={{ alerta: undefined, caso: undefined, codigo: undefined }}
            className="mt-3 inline-block rounded-lg border border-navy/15 px-3 py-1.5 text-[13px] text-navy hover:border-gold"
          >
            Abrir Biblioteca de Mensagens e Conteúdos
          </Link>
          <p data-marketing-vazio="captura" className="mt-2 text-[12px] text-navy/55">
            {VAZIOS_MARKETING.captura} Sem CTA com link rastreável, conteúdo não gera origem atribuível: a lacuna
            fica declarada, sem estimativa.
          </p>
        </Bloco>

        <Bloco id="atribuicao" titulo="Atribuição e origem" descricao={SECOES_MARKETING.find((s) => s.hash === "atribuicao")!.descricao}>
          <p data-marketing-vazio="atribuicao" className="mb-3">
            {entrada.atribuicoes.length === 0
              ? VAZIOS_MARKETING.atribuicao
              : `${entrada.atribuicoes.length} registro(s) de atribuição disponível(is) para leitura.`}
          </p>

          <h3 className="font-serif text-base text-navy">Catálogo de origem</h3>
          <p className="mt-1 text-[12px] text-navy/55">
            Valores históricos em texto livre são preservados. Fora do catálogo, a leitura mostra
            <code className="mx-1">origem_a_confirmar</code>, sem conversão automática e sem bloquear o Comercial.
          </p>
          {origensCatalogo.length === 0 ? (
            <p className="mt-2 text-[13px] text-navy/70">Sem leads no recorte para classificar origem.</p>
          ) : (
            <ul data-marketing="catalogo-origens" className="mt-2 divide-y divide-navy/10">
              {origensCatalogo.map((o) => (
                <li key={o.canonico} className="flex items-center justify-between py-2">
                  <span className="text-navy">
                    {o.rotulo} <code className="text-[11px] text-navy/50">{o.canonico}</code>
                  </span>
                  <span className="text-[12px] text-navy/60">{o.total} lead(s)</span>
                </li>
              ))}
            </ul>
          )}
          <p data-marketing-vazio="whatsapp" className="mt-3 text-[13px] text-navy/70">
            {VAZIOS_MARKETING.whatsapp}
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

        <Bloco id="funil-aquisicao" titulo="Funil de aquisição" descricao={SECOES_MARKETING.find((s) => s.hash === "funil-aquisicao")!.descricao}>
          {/*
            27/08/2026 — era referência 100% estática, nunca lia banco. Ganha
            uma coluna real: quantos leads do recorte atual têm essa origem
            gravada — cruza CANAIS_HANDOFF (taxonomia fixa de risco) com
            distribuicaoOrigens (contagem viva). A taxonomia continua fixa —
            só passou a mostrar se está vazia ou não, de verdade.
          */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="py-2 pr-3">Canal</th>
                  <th className="py-2 pr-3">Origem gravada</th>
                  <th className="py-2 pr-3">Leads no recorte</th>
                  <th className="py-2 pr-3">Handoff</th>
                  <th className="py-2">Risco</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {CANAIS_HANDOFF.map((c) => {
                  const contagem = origensCatalogo.find((o) => o.canonico === c.origemGravada)?.total ?? 0;
                  return (
                    <tr key={c.canal}>
                      <td className="py-2 pr-3 text-navy">{c.canal}</td>
                      <td className="py-2 pr-3">{c.origemGravada}</td>
                      <td className="py-2 pr-3">
                        {contagem > 0 ? <strong className="text-navy">{contagem}</strong> : <span className="text-navy/40">0</span>}
                      </td>
                      <td className="py-2 pr-3">{c.handoff}</td>
                      <td className="py-2 text-navy/60">{c.risco}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p data-marketing-vazio="handoff" className="mt-3 text-[13px] text-navy/70">
            {VAZIOS_MARKETING.handoff} O funil comercial detalhado permanece exclusivamente em Conversão.
          </p>
        </Bloco>

        <Bloco id="aprendizados" titulo="Aprendizados das campanhas" descricao={SECOES_MARKETING.find((s) => s.hash === "aprendizados")!.descricao}>
          <p>
            Derivado do desempenho por canal acima — nunca uma lista fixa. Leitura de canal é insumo interno de
            decisão humana; nenhum aprendizado registrado aqui aciona campanha, verba, link ou mensagem.
          </p>
          <ul data-marketing="aprendizados-campanha" className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-navy/70">
            {aprendizados.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Bloco>

        <Bloco id="links-comercial" titulo="Links contextuais para Comercial" descricao={SECOES_MARKETING.find((s) => s.hash === "links-comercial")!.descricao}>
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
