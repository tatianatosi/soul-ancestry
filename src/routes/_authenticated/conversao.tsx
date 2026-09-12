import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell, EstadoVazio, BotaoTentarNovamente } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { carregarConversao } from "@/lib/conversao.functions";
import {
  ESCADA,
  montarEstados,
  montarFunil,
  montarSaude,
  percentualOuTraco,
  REFERENCIA_ACEITE,
  ONBOARDING_PADRAO_RESUMO,
  type EventoBruto,
  type LeadMinimo,
} from "@/lib/conversao-funil";


export const Route = createFileRoute("/_authenticated/conversao")({
  head: () => ({
    meta: [
      { title: "Comercial | Clube Ancestral" },
      {
        name: "description",
        content: "Leitura interna do funil comercial: estado por lead, eventos imutáveis, saúde comercial e referência de aceite.",
      },
      { property: "og:title", content: "Comercial | Clube Ancestral" },
      { property: "og:description", content: "Estado por lead, funil de eventos e saúde comercial do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Conversao,
});

const Bloco = ({ titulo, aviso, children }: { titulo: string; aviso?: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-navy/10 bg-cream/40 p-5">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-serif text-lg text-navy">{titulo}</h2>
      {aviso && <span className="text-[11px] text-navy/50">{aviso}</span>}
    </div>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

function Conversao() {
  const carregar = useServerFn(carregarConversao);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const [referenciaAberta, setReferenciaAberta] = useState(false);
  const q = useQuery({
    queryKey: ["conversao", incluirDemo],
    queryFn: () => carregar({ data: { incluirDemo } }),
    retry: false,
  });

  const dados = useMemo(() => {
    const rotulosLeads = q.data?.rotulos?.leads ?? [];
    const rotulosCasos = q.data?.rotulos?.casos ?? [];
    const eventos = (q.data?.eventos ?? []) as unknown as EventoBruto[];

    const leads: LeadMinimo[] = rotulosLeads.map((l) => ({
      id: l.id,
      nome: l.rotulo,
      codigo: null,
      status: l.estagio ?? null,
      proxima_acao: l.proxima_acao ?? null,
      prazo_proxima_acao: l.proxima_acao_em ?? null,
      origem: l.origem ?? null,
      demo: l.is_demo,
    })) as LeadMinimo[];

    const rotulos = {
      leads: new Map(rotulosLeads.map((l) => [l.id, l.rotulo])),
      casos: new Map(rotulosCasos.map((c) => [c.id, c.rotulo])),
    };
    const estados = montarEstados(eventos, rotulos);
    const funil = montarFunil(eventos, estados);
    const saude = montarSaude(estados, leads, Date.now(), estados);

    const origens = new Map<string, number>();
    for (const e of eventos) {
      const chave = [e.origem, e.canal].filter(Boolean).join(" · ") || "origem não informada";
      origens.set(chave, (origens.get(chave) ?? 0) + 1);
    }

    return {
      estados,
      funil,
      saude,
      eventos,
      leads,
      ocultosLeads: (q.data?.leadsDemoRotulos ?? []) as string[],
      ocultosEventos: q.data?.eventosOcultos ?? 0,
      origens: [...origens.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [q.data]);


  const filas = [
    { r: "Leads ativos sem próxima ação", l: dados.saude.leadsSemProximaAcao },
    { r: "Follow-ups vencidos", l: dados.saude.followupsVencidos },
    { r: "Propostas sem resposta", l: dados.saude.propostasSemResposta },
    {
      r: "Aceite verbal sem confirmação formal",
      l: dados.saude.aceiteVerbalSemFormalizacao,
      nota: "Sempre exibido quando o estado existe, inclusive em registros de demonstração.",
    },
    { r: "Inconsistências de sequência", l: dados.saude.inconsistencias, nota: "Inclui integridade de eventos fora do filtro." },

  ];

  return (
    <SaasShell
      titulo="Comercial"
      descricao="Leitura interna. Nenhuma cobrança, mensagem, contrato ou automação é disparada nesta tela."
    >
      <p data-conversao="rotulo-canonico" className="text-[11px] uppercase tracking-wide text-navy/50">
        Fonte canônica de conversão e saúde comercial
      </p>
      <details className="mb-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/60">
        <summary className="cursor-pointer font-medium text-navy/70">Leitura técnica do funil por eventos</summary>
        <p className="mt-2">
          Conversão — funil por eventos. Estado por lead, eventos imutáveis e saúde comercial. Uso interno de QA e
          operação; o título da tela é Comercial.
        </p>
      </details>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os eventos de conversão"
      >
        {() => (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-navy/10 bg-cream/40 px-4 py-3 text-xs text-navy/70">
            <span>
              {incluirDemo
                ? `Exibindo operação real + demonstração: ${dados.ocultosLeads.length} registro(s) de teste incluídos nas contagens.`
                : dados.ocultosLeads.length > 0
                  ? `Demonstração excluída das métricas: ${dados.ocultosLeads.length} lead(s) e ${dados.ocultosEventos} evento(s) de teste ocultos (${dados.ocultosLeads.join(", ")}).`
                  : "Somente operação real. Nenhum registro de demonstração encontrado."}
            </span>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
              Incluir dados de demonstração
            </label>
          </div>

          <Bloco
            titulo="Estado atual por lead"
            aviso={`${dados.estados.length} registro(s) com evento — escada, próxima ação e bloqueio`}
          >
            {dados.estados.length === 0 ? (
              <EstadoVazio
                mensagem={
                  dados.ocultosLeads.length > 0
                    ? "Nenhum lead de operação real com evento de conversão. Os registros existentes são de demonstração e estão excluídos por padrão."
                    : "Nenhum evento de conversão registrado."
                }
              />
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {dados.estados.map((e) => (
                  <div key={e.chave} className="rounded-lg border border-navy/10 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-serif text-base text-navy">{e.rotulo}</p>
                      <span className="text-[10px] uppercase tracking-wide text-navy/40">
                        {e.isDemo ? "demonstração" : e.tipo}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-navy">{e.rotuloEtapa}</p>
                    <ol className="mt-2 flex flex-wrap gap-1">
                      {ESCADA.map((p, i) => (
                        <li
                          key={p.codigo}
                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                            e.alcancados[p.codigo] ? "bg-gold/20 text-navy" : "bg-navy/5 text-navy/40"
                          }`}
                        >
                          {i + 1}. {p.rotulo}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[11px] text-navy/70">
                      <span className="font-medium text-navy">Próxima ação:</span> {e.proximaAcao}
                    </p>
                    {e.bloqueios.map((b) => (
                      <p key={b} className="mt-1 text-[11px] text-terracotta">
                        • {b}
                      </p>
                    ))}
                    {e.inconsistencias.map((i) => (
                      <p key={i} className="mt-1 text-[11px] text-terracotta/80">
                        ⚠ {i}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Bloco>

          <Bloco titulo="Funil de eventos" aviso="Contagem de eventos, entidades e taxa entre etapas">
            {(() => {
              const comTaxa = dados.funil.filter((l) => typeof l.taxa === "number");
              const pior = comTaxa.length
                ? comTaxa.reduce((a, b) => ((b.taxa as number) < (a.taxa as number) ? b : a))
                : null;
              return (
                <div className="mb-3 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/50">Gargalo principal</p>
                  {pior ? (
                    <>
                      <p className="mt-1 text-sm text-navy">
                        <strong>{pior.rotulo}</strong> — passagem de {percentualOuTraco(pior.taxa)} vs. etapa anterior (
                        {pior.entidades} lead/caso).
                      </p>
                      <a href="/leads" className="mt-1 inline-block text-xs text-navy underline">
                        Abrir lista filtrada de leads nesta etapa
                      </a>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-navy/60">
                      Sem denominador suficiente para apontar gargalo. Nenhuma etapa é estimada.
                    </p>
                  )}
                </div>
              );
            })()}
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Etapa</th>
                  <th className="py-1 pr-3">Momento</th>
                  <th className="py-1 pr-3">Eventos</th>
                  <th className="py-1 pr-3">Leads/casos</th>
                  <th className="py-1">Taxa vs. etapa anterior</th>
                </tr>
              </thead>
              <tbody>
                {dados.funil.map((l) => (
                  <tr key={l.codigo} className="border-t border-navy/5">
                    <td className="py-1.5 pr-3 text-navy">{l.rotulo}</td>
                    <td className="py-1.5 pr-3 text-navy/50">{l.momento}</td>
                    <td className="py-1.5 pr-3 font-medium text-navy">{l.eventos}</td>
                    <td className="py-1.5 pr-3 text-navy/70">{l.entidades}</td>
                    <td className="py-1.5 text-navy/70">{percentualOuTraco(l.taxa)}</td>

                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 grid gap-1 text-[11px] text-navy/60">
              <p className="font-medium text-navy/70">Origem e canal dos eventos considerados</p>
              {dados.origens.length === 0 ? (
                <p>Sem dado de origem no recorte atual.</p>
              ) : (
                dados.origens.map(([k, v]) => (
                  <p key={k}>
                    • {k} — {v} evento(s)
                  </p>
                ))
              )}
              <p className="text-navy/50">Taxa exibe “—” quando não há denominador; nenhum zero artificial é apresentado.</p>
              {dados.funil[0]!.eventos === 0 && dados.eventos.length > 0 && (
                <p className="text-terracotta">
                  ⚠ Alerta de integridade: evento inicial ausente ou fora do filtro — há eventos posteriores registrados sem
                  “Lead criado”. Não interprete como funil vazio.
                </p>
              )}

            </div>
          </Bloco>

          <Bloco titulo="Saúde comercial" aviso="Filas de ação — mesmo recorte de dados acima">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filas.map((g) => {
                const leadsSemAcaoNoPainel = g.r === "Leads ativos sem próxima ação";
                return (
                <div key={g.r} className="rounded-lg border border-navy/10 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-navy/50">{g.r}</p>
                  {leadsSemAcaoNoPainel ? (
                    <>
                      <p className="mt-1 text-sm font-medium text-navy" data-indicador-etiqueta="leads-sem-proxima-acao">
                        Contagem canônica no Painel Hoje
                      </p>
                      <p className="text-[10px] text-navy/45">
                        Lista abaixo é fila de trabalho — o KPI numérico não se repete aqui (CA-UX-03).
                      </p>
                      <a href="/painel" className="mt-1 inline-block text-[11px] text-navy underline">
                        Abrir Painel Hoje
                      </a>
                    </>
                  ) : (
                    <p className="font-serif text-2xl text-navy">{g.l.length}</p>
                  )}
                  {"nota" in g && g.nota && <p className="text-[10px] text-navy/40">{g.nota}</p>}

                  <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60">
                    {g.l.slice(0, 5).map((i) => (
                      <li key={i.id}>
                        • {i.rotulo}
                        {i.detalhe && <span className="block text-navy/40">{i.detalhe}</span>}
                      </li>
                    ))}
                    {g.l.length > 5 && <li className="text-navy/40">+ {g.l.length - 5} outro(s)</li>}
                    {g.l.length === 0 && (
                      <li className="text-navy/40">
                        {!incluirDemo && dados.ocultosLeads.length > 0
                          ? "Sem pendência na operação real — registros de demonstração excluídos deste recorte."
                          : "Sem pendência."}
                      </li>
                    )}
                  </ul>
                  {g.l.length > 0 && !leadsSemAcaoNoPainel && (
                    <a href="/leads" className="mt-2 inline-block text-[11px] text-navy underline">
                      Abrir lista filtrada
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          </Bloco>

          <section className="rounded-xl border border-navy/10 bg-cream/40">
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left"
              onClick={() => setReferenciaAberta((v) => !v)}
              aria-expanded={referenciaAberta}
            >
              <span className="font-serif text-lg text-navy">Configuração de referência — regra de aceite e onboarding padrão</span>
              <span className="text-xs text-navy/50">{referenciaAberta ? "recolher" : "expandir"}</span>
            </button>
            {referenciaAberta && (
              <div className="grid gap-3 border-t border-navy/10 p-5 text-sm text-navy/70 lg:grid-cols-2">
                {REFERENCIA_ACEITE.map((r) => (
                  <div key={r.titulo} className="rounded-lg border border-navy/10 p-3">
                    <p className="font-serif text-base text-navy">{r.titulo}</p>
                    <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60">
                      {r.itens.map((i) => (
                        <li key={i}>• {i}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="rounded-lg border border-navy/10 p-3 lg:col-span-2">
                  <p className="font-serif text-base text-navy">Onboarding padrão</p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60">
                    {ONBOARDING_PADRAO_RESUMO.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-navy/10 p-3 lg:col-span-2">
                  <p className="font-serif text-base text-navy">Cadeia de transição validada no servidor</p>
                  <p className="mt-1 text-[11px] text-navy/60">
                    proposta enviada → aceite verbal → confirmação formal → preparação contratual → contrato assinado → pagamento inicial
                    confirmado → onboarding
                  </p>
                  <p className="mt-1 text-[11px] text-navy/60">
                    Cada avanço verifica o estado anterior no banco, inclusive em gravações concorrentes. Chamadas diretas que tentem contrato,
                    cobrança, assinatura, pesquisa externa, App Cliente ou onboarding fora de ordem são recusadas. O evento de entrada nunca é
                    preenchido automaticamente: a ausência permanece como inconsistência de integridade.
                  </p>
                </div>

              </div>
            )}
          </section>
        </div>
        )}
      </EstadoDados>
    </SaasShell>
  );
}
