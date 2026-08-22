/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { rotulo as rotuloCatalogo } from "@/lib/crm-desk";
import { sinaisMarketing } from "@/lib/indicadores-marketing";
import {
  cadenciaRelevante,
  chavesExibidas,
  comercialHoje,
  consolidarDia,
  excecoesQueExigemDono,
  filaPriorizada,
  hojeISO,
  textoDiasSemTouchpoint,
  textoPrazo,
  type ItemDia,
} from "@/lib/painel-dia";

function LinkItem({ item, children }: { item: { id: string; tipo: "lead" | "caso" }; children: React.ReactNode }) {
  if (item.tipo === "caso") {
    return (
      <Link to="/casos/$caseId" params={{ caseId: item.id }} className="text-navy underline underline-offset-2">
        {children}
      </Link>
    );
  }
  return (
    <Link to="/leads" className="text-navy underline underline-offset-2">
      {children}
    </Link>
  );
}

function Linha({ item }: { item: ItemDia }) {
  return (
    <li className="rounded-lg border border-navy/10 px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <LinkItem item={item}>{item.rotulo}</LinkItem>
        <span className="text-xs text-navy/60">{textoPrazo(item.data)}</span>
      </div>
      <p className="mt-0.5 text-xs text-navy/65">{item.acao}</p>
      <p className="mt-0.5 text-xs">
        {item.responsavel ? (
          <span className="text-navy/60">Responsável: {item.responsavel}</span>
        ) : (
          <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-terracotta">
            Falha de qualidade: sem responsável definido
          </span>
        )}
      </p>
      {item.bloqueios.length > 0 ? (
        <p className="mt-1 text-[11px] text-navy/50">
          +{item.bloqueios.length} bloqueio{item.bloqueios.length === 1 ? "" : "s"} no mesmo registro — abrir a ficha para a lista
          completa.
        </p>
      ) : null}
    </li>
  );
}


/** Painel Hoje enxuto: fila priorizada, exceções com dono, comercial e casos do dia. */
export function PainelDia() {
  const carregarDesk = useServerFn(painelHojeDesk);
  const carregarCadencia = useServerFn(painelCadencia);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const [ajuda, setAjuda] = useState(false);

  const qDesk = useQuery({
    queryKey: ["painel-desk-hoje", incluirDemo],
    queryFn: () => carregarDesk({ data: { incluirDemo } }),
    retry: false,
  });
  const qCad = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregarCadencia(), retry: false });

  if (qDesk.isLoading) return <p className="text-sm text-navy/50">Carregando o dia…</p>;
  if (qDesk.isError || !qDesk.data) return <p className="text-sm text-terracotta">Não foi possível carregar as filas do dia.</p>;

  const filas = qDesk.data.filas;
  const hoje = hojeISO();
  const itens = consolidarDia(filas, { incluirDemo });
  // Precedência exclusiva: fila priorizada → exceções → comercial. Um registro só aparece uma vez.
  const priorizada = filaPriorizada(itens, hoje);
  const usados = chavesExibidas(priorizada);
  const excecoes = excecoesQueExigemDono(itens, filas, hoje, usados);
  for (const e of excecoes) for (const i of e.itens) usados.add(`${i.tipo}:${i.id}`);
  const comercial = comercialHoje(filas, { incluirDemo, hoje, jaExibidos: usados });
  const cadencia = cadenciaRelevante((qCad.data?.casos ?? []) as any[]);
  const qtd = (chave: string) => (filas.find((f: any) => f.chave === chave)?.itens.length ?? 0) as number;
  const sinais = sinaisMarketing({
    leads_sem_origem: qtd("leads_sem_origem"),
    discoveries_sem_desdobramento: qtd("discoveries_sem_desdobramento"),
    propostas_sem_followup: comercial.propostas.length,
    aceites_verbais_parados: qtd("aceites_sem_confirmacao"),
    contratos_sem_referencia_financeira: qtd("contratos_enviados_pendentes"),
    pagamentos_sem_onboarding: qtd("onboardings_pendentes"),
  });


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy/60">
          O que precisa de ação hoje, por quem e até quando. Governança, catálogo, métricas e planejamento ficam nas áreas
          proprietárias.
        </p>
        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
          Incluir demonstrações
        </label>
      </div>

      {/* 1 — Minha fila priorizada */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Minha fila priorizada</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {priorizada.map((f) => (
            <div key={f.chave}>
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {f.rotulo} · {f.itens.length}
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {f.itens.map((i) => (
                  <Linha key={`${f.chave}-${i.tipo}-${i.id}`} item={i} />
                ))}
                {f.itens.length === 0 ? <li className="text-xs text-navy/50">Nada nesta faixa.</li> : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Exceções que exigem dono */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Exceções que exigem dono</h2>
        {excecoes.length === 0 ? (
          <p className="mt-2 text-sm text-navy/55">Nenhuma exceção acionável no momento.</p>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {excecoes.map((e) => (
              <div key={e.chave}>
                <p className="text-xs uppercase tracking-wide text-navy/50">
                  {e.rotulo} · {e.itens.length}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {e.itens.slice(0, 6).map((i) => (
                    <Linha key={`${e.chave}-${i.tipo}-${i.id}`} item={i} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3 — Comercial hoje */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-navy">Comercial hoje</h2>
          <Link to="/conversao" className="text-xs text-navy/60 underline">
            Conversão e funil
          </Link>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 text-sm">
          {[
            { rotulo: "Calls de hoje", itens: comercial.calls },
            { rotulo: "Propostas sem follow-up", itens: comercial.propostas },
            { rotulo: "Leads sem próxima ação", itens: comercial.semDisciplina },
          ].map((b) => (
            <div key={b.rotulo}>
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {b.rotulo} · {b.itens.length}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-navy/65">
                {b.itens.slice(0, 5).map((i: any) => (
                  <li key={`${b.rotulo}-${i.id}`}>
                    <Link to="/leads" className="text-navy underline underline-offset-2">
                      {i.rotulo}
                    </Link>
                    {i.responsavel ? ` · ${i.responsavel}` : " · sem responsável"}
                    {i.etapa ? ` · ${rotuloCatalogo("eixo_comercial", i.etapa)}` : ""}
                  </li>
                ))}
                {b.itens.length === 0 ? <li>Nada pendente.</li> : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3a — Indicadores conectados: quatro linhas compactas e clicáveis */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Indicadores com manifestação no dia</h2>
          <Link to="/governanca/indicadores" className="text-[11px] text-navy/40 underline underline-offset-2 hover:text-navy/60">
            registro canônico dos 16 indicadores
          </Link>
        </div>
        <div className="mt-3 grid gap-2">
          {[
            {
              chave: "conv",
              titulo: "Conversão e integridade",
              codigos: "IND-COM-01 · IND-COM-02 · IND-FIN-01",
              linhas: [
                `${comercial.propostas.length} proposta(s) sem follow-up`,
                `${qtd("aceites_sem_confirmacao")} aceite(s) verbal parado(s)`,
                `${qtd("contratos_enviados_pendentes")} contrato(s) sem referência financeira`,
                `${qtd("onboardings_pendentes")} pagamento(s) sem onboarding`,
              ],
              rota: "/conversao" as const,
              acao: "Abrir conversão e funil",
            },
            {
              chave: "radar",
              titulo: "Radar e Discovery",
              codigos: "IND-RAD-01 · IND-RAD-02",
              linhas: [
                `${qtd("discoveries_sem_desdobramento")} leitura(s) sem próximo passo definido`,
                `${qtd("leads_sem_origem")} lead(s) sem origem declarada (completude da leitura)`,
                "Revisão humana obrigatória e marco jurídico a revisar: verificar na ficha do lead",
              ],
              rota: "/leads" as const,
              acao: "Abrir leads e triagem",
            },
            {
              chave: "casos",
              titulo: "Casos e cadência",
              codigos: "IND-JOR-01 · IND-JOR-02 · IND-JOR-03 · IND-QUA-01",
              linhas: [
                `${qtd("onboardings_pendentes")} caso(s) com gates de ativação pendentes após pagamento confirmado`,
                `${qtd("casos_pendencia_documental")} caso(s) com pendência documental`,
                `${cadencia.length} caso(s) acima da regra de dias sem touchpoint`,
              ],
              rota: "/casos" as const,
              acao: "Abrir casos 360",
            },
            {
              chave: "comunicacao",
              titulo: "Comunicação humana",
              codigos: "IND-COM-03",
              linhas: [
                `${sugestoesHumanas.total} contato(s) humano(s) sugerido(s): ${sugestoesHumanas.criticos} crítico(s), ${sugestoesHumanas.hoje} para hoje`,
                "Cada sugestão nasce em rascunho, depende de consentimento e de aprovação humana.",
                "Nenhum botão desta tela envia mensagem.",
              ],
              rota: "/atendimento" as const,
              acao: "Abrir a fila humana em Atendimento",
            },
          ].map((b) => (
            <Link
              key={b.chave}
              to={b.rota}
              className="block rounded-lg border border-navy/10 px-3 py-2 hover:bg-cream/50"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-navy">{b.titulo}</span>
                <span className="font-mono text-[10px] text-navy/40">{b.codigos}</span>
              </div>
              <ul className="mt-1 space-y-0.5 text-xs text-navy/65">
                {b.linhas.map((l) => (
                  <li key={l}>• {l}</li>
                ))}
              </ul>
              <span className="mt-1 inline-block text-xs text-navy underline underline-offset-2">{b.acao}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3b — Sinais de conversão e integridade */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Sinais de conversão e integridade</h2>
          <Link to="/governanca/indicadores" className="text-[11px] text-navy/40 underline underline-offset-2 hover:text-navy/60">
            como o indicador é calculado
          </Link>
        </div>
        {sinais.length === 0 ? (
          <p className="mt-2 text-sm text-navy/55">Nenhum sinal aberto: nada é preenchido automaticamente quando falta base.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {[...sinais]
              .sort((a, b) => (a.severidade === b.severidade ? 0 : a.severidade === "critico" ? -1 : 1))
              .map((s) => (
                <li
                  key={s.codigo}
                  className={`rounded-lg border px-3 py-2 ${
                    s.severidade === "critico" ? "border-terracotta/40 bg-terracotta/5" : "border-gold/40 bg-gold/10"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        s.severidade === "critico"
                          ? "border-terracotta/50 text-terracotta"
                          : "border-navy/20 text-navy/60"
                      }`}
                    >
                      {s.severidade === "critico" ? "Crítico" : "Atenção"}
                    </span>
                    <span className={s.severidade === "critico" ? "font-medium text-terracotta" : "font-medium text-navy"}>
                      {s.texto}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/65">
                    <span>Ação: {s.acao ?? "definir responsável e próxima ação"}</span>
                    <Link to={s.rota} className="font-medium text-navy underline underline-offset-2">
                      Abrir {s.destino ?? "lista filtrada"}
                    </Link>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* 4 — Casos com prazo em atenção */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-navy">Casos com prazo em atenção</h2>
          <Link to="/casos" className="text-xs text-navy/60 underline">
            Casos 360
          </Link>
        </div>
        <p className="mt-1 text-xs text-navy/50">
          Cadência aparece somente quando há regra ativa e situação de atenção ou crítica. Ausência de prazo é exibida como
          “Sem prazo definido”, nunca como número. Os prazos do dia já estão na fila priorizada.
        </p>
        {cadencia.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-navy/65">
            {cadencia.map((c: any) => (
              <li key={String(c["id"])}>
                <Link to="/casos/$caseId" params={{ caseId: String(c["id"]) }} className="text-navy underline underline-offset-2">
                  {String(c["codigo"] ?? c["titulo"] ?? "Caso")}
                </Link>{" "}
                · {textoDiasSemTouchpoint(c.cadencia?.diasSemTouchpoint)} · {c.cadencia?.status} ·{" "}
                {textoPrazo(c["prazo_proxima_acao"] ? String(c["prazo_proxima_acao"]).slice(0, 10) : null)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-navy/50">Nenhum caso em cadência de atenção ou crítica.</p>
        )}
      </section>


      {/* 5 — Atalhos */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            { to: "/leads" as const, rotulo: "CRM Vivo — leads" },
            { to: "/casos" as const, rotulo: "Casos 360" },
            { to: "/nucleos" as const, rotulo: "Núcleos e dossiês" },
            { to: "/importacoes" as const, rotulo: "Importações e migração" },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5">
              {a.rotulo}
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy/70">
        <button onClick={() => setAjuda((v) => !v)} className="text-xs uppercase tracking-wide text-navy/55">
          {ajuda ? "Ocultar ajuda" : "Como ler estas informações"}
        </button>
        {ajuda ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
            <li>Prioridade: vencidas → hoje → próximos 7 dias. Um registro aparece uma única vez, na maior urgência aplicável.</li>
            <li>Cada registro aparece uma única vez: a ação principal fica aqui, os demais bloqueios na ficha do caso.</li>

            <li>Itens sem responsável são falha de qualidade, viram exceção e têm rota de correção na ficha do registro.</li>
            <li>Sem prazo é exibido como “Sem prazo definido”; nunca convertemos ausência de data em número.</li>
            <li>Demonstrações são excluídas na consulta e só entram com o filtro explícito “Incluir demonstrações”.</li>
            <li>Catálogo, formalização, pesquisa, conversão e jornada ficam nos módulos proprietários — aqui só priorização.</li>
            <li>Nada aqui é conclusão: dados jurídicos e genealógicos seguem como hipótese até confirmação documental.</li>

          </ul>
        ) : null}
      </div>
    </div>
  );
}
