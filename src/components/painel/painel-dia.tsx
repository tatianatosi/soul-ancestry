/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { estadoModoProprietaria } from "@/lib/modo-proprietaria.functions";
import { AcoesRapidasProprietaria } from "@/components/painel/acoes-rapidas";
import { casosBloqueadosPorCatalogo } from "@/lib/catalogo-referencia.functions";
import { EXCECAO_CONDICAO_COMERCIAL } from "@/lib/catalogo-referencia";
import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { rotulo as rotuloCatalogo } from "@/lib/crm-desk";
import { sinaisMarketing } from "@/lib/indicadores-marketing";
import { GATILHOS, type Gatilho } from "@/lib/fila-comunicacao";
import {
  aplicarFiltrosDia,
  cadenciaRelevante,
  cardsHoje,
  chavesExibidas,
  comercialHoje,
  consolidarDia,
  excecoesQueExigemDono,
  filaPriorizada,
  hojeISO,
  opcoesFiltroDia,
  textoDiasSemTouchpoint,
  textoPrazo,
  agruparLinhasIndicadores,
  type FiltrosDia,
  type ItemDia,
  type LinhaIndicadorDia,
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

function Linha({ item, proprietaria, aoSalvar }: { item: ItemDia; proprietaria?: boolean; aoSalvar?: () => void }) {
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
            Falha de qualidade: sem responsável definido · proprietário atual: Não definido · ação exigida: Atribuição humana
            necessária
          </span>
        )}
      </p>
      {item.bloqueios.length > 0 ? (
        <p className="mt-1 text-[11px] text-navy/50">
          +{item.bloqueios.length} bloqueio{item.bloqueios.length === 1 ? "" : "s"} no mesmo registro — abrir a ficha para a lista
          completa.
        </p>
      ) : null}
      {proprietaria ? (
        <AcoesRapidasProprietaria tipo={item.tipo === "caso" ? "caso" : "lead"} id={item.id} aoSalvar={aoSalvar} />
      ) : null}
    </li>
  );
}


const GRUPOS_INDICADOR = [
  {
    chave: "integridade" as const,
    titulo: "Integridade",
    resumo: "Sem responsável, sem próxima ação, conflito de fonte e pendência de auditoria.",
    rota: "/auditoria" as const,
    acao: "Abrir auditoria e integridade",
  },
  {
    chave: "formalizacao" as const,
    titulo: "Formalização e comercial",
    resumo: "Proposta incompleta, condição comercial bloqueada, revisão pendente e contrato sem avanço.",
    rota: "/conversao" as const,
    acao: "Abrir conversão e funil",
  },
  {
    chave: "operacao" as const,
    titulo: "Casos e operação",
    resumo: "Documentos aguardados, prazo crítico, ausência de touchpoint e rechecagem vencida.",
    rota: "/casos" as const,
    acao: "Abrir casos 360",
  },
  {
    chave: "financeiro" as const,
    titulo: "Financeiro",
    resumo: "Cobrança vencida, pagamento aguardado, pagamento sem onboarding e previsão sem condição comercial.",
    rota: "/financeiro" as const,
    acao: "Abrir financeiro",
  },
  {
    chave: "cliente" as const,
    titulo: "Cliente",
    resumo: "Projeção aguardando aprovação, acesso pendente e comunicação humana sugerida.",
    rota: "/atendimento" as const,
    acao: "Abrir fila humana em Atendimento",
  },
];

/** Painel Hoje enxuto: fila priorizada, exceções com dono, comercial e casos do dia. */
export function PainelDia() {
  const carregarDesk = useServerFn(painelHojeDesk);
  const carregarCadencia = useServerFn(painelCadencia);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const [ajuda, setAjuda] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosDia>({ responsavel: "", area: "", etapa: "" });


  const qDesk = useQuery({
    queryKey: ["painel-desk-hoje", incluirDemo],
    queryFn: () => carregarDesk({ data: { incluirDemo } }),
    retry: false,
  });
  const carregarModo = useServerFn(estadoModoProprietaria);
  const qModo = useQuery({ queryKey: ["painel-modo-proprietaria"], queryFn: () => carregarModo(), retry: false });
  const proprietaria = qModo.data?.ativo === true;
  const qCad = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregarCadencia(), retry: false });
  const carregarBloqueios = useServerFn(casosBloqueadosPorCatalogo);
  const qCatalogo = useQuery({
    queryKey: ["painel-bloqueios-catalogo", incluirDemo],
    queryFn: () => carregarBloqueios({ data: { incluirTeste: incluirDemo } }),
    retry: false,
  });
  const bloqueadosCatalogo = qCatalogo.data?.itens ?? [];

  if (qDesk.isLoading) return <p className="text-sm text-navy/50">Carregando o dia…</p>;
  if (qDesk.isError || !qDesk.data) return <p className="text-sm text-terracotta">Não foi possível carregar as filas do dia.</p>;

  const filas = qDesk.data.filas;
  const hoje = hojeISO();
  const itens = consolidarDia(filas, { incluirDemo });
  // Precedência exclusiva: fila priorizada → exceções → comercial. Um registro só aparece uma vez.
  const priorizada = filaPriorizada(itens, hoje);
  const cards = cardsHoje(filas, { incluirDemo });
  const opcoes = opcoesFiltroDia(itens);
  const priorizadaVisivel = priorizada.map((f) => ({ ...f, itens: aplicarFiltrosDia(f.itens, filtros) }));
  const usados = chavesExibidas(priorizada);
  const excecoes = excecoesQueExigemDono(itens, filas, hoje, usados);

  for (const e of excecoes) for (const i of e.itens) usados.add(`${i.tipo}:${i.id}`);
  const comercial = comercialHoje(filas, { incluirDemo, hoje, jaExibidos: usados });
  const cadencia = cadenciaRelevante((qCad.data?.casos ?? []) as any[]);
  const qtd = (chave: string) => (filas.find((f: any) => f.chave === chave)?.itens.length ?? 0) as number;
  // Somente leitura das filas já carregadas: resumo comercial não cria nem altera registro.
  const itensFila = (chave: string) =>
    ((filas.find((f: any) => f.chave === chave)?.itens ?? []) as any[]).filter(
      (i) => incluirDemo || !/demo|teste|fixture/i.test(String(i.rotulo ?? "")),
    );
  const sinais = sinaisMarketing({
    leads_sem_origem: qtd("leads_sem_origem"),
    discoveries_sem_desdobramento: qtd("discoveries_sem_desdobramento"),
    propostas_sem_followup: comercial.propostas.length,
    aceites_verbais_parados: qtd("aceites_sem_confirmacao"),
    contratos_sem_referencia_financeira: qtd("contratos_enviados_pendentes"),
    pagamentos_sem_onboarding: qtd("onboardings_pendentes"),
  });
  // IND-COM-03: contagem de contatos humanos sugeridos por prioridade do gatilho.
  // Nada é enviado aqui; cada sugestão nasce em rascunho e depende de aprovação humana.
  const candidatosComunicacao: { gatilho: Gatilho; total: number }[] = [
    { gatilho: "followup_proposta", total: comercial.propostas.length },
    { gatilho: "contrato_aguardando_assinatura", total: qtd("contratos_enviados_pendentes") },
    { gatilho: "pagamento_inicial_aguardado", total: qtd("pagamentos_aguardados") },
    { gatilho: "lembrete_discovery", total: comercial.calls.length },
    { gatilho: "pendencia_documental", total: qtd("casos_pendencia_documental") },
    { gatilho: "ausencia_touchpoint", total: cadencia.length },
    { gatilho: "boas_vindas_onboarding", total: qtd("onboardings_pendentes") },
  ];
  const prioridadeDe = (g: Gatilho) => GATILHOS.find((x) => x.chave === g)?.prioridade ?? 3;
  const sugestoesHumanas = candidatosComunicacao.reduce(
    (acc, c) => {
      const p = prioridadeDe(c.gatilho);
      acc.total += c.total;
      if (p === 1) acc.criticos += c.total;
      else if (p === 2) acc.hoje += c.total;
      return acc;
    },
    { total: 0, criticos: 0, hoje: 0 },
  );


  // Linhas por indicador: motivo, responsável, prazo/idade e severidade, deduplicadas por registro.
  const linhasIndicadores: LinhaIndicadorDia[] = [];
  const addLinha = (
    chave: string,
    grupo: LinhaIndicadorDia["grupo"],
    codigo: string,
    total: number,
    motivo: string,
    severidade: LinhaIndicadorDia["severidade"],
    responsavel: string | null,
    prazo: string,
  ) => {
    if (total > 0) linhasIndicadores.push({ chave, grupo, codigo, motivo, responsavel, prazo, severidade });
  };

  addLinha(
    "propostas_sem_followup",
    "conversao",
    "IND-COM-02",
    comercial.propostas.length,
    `${comercial.propostas.length} proposta(s) com follow-up vencido`,
    "P1",
    null,
    "follow-up vencido",
  );
  addLinha(
    "aceites_sem_confirmacao",
    "conversao",
    "IND-COM-02",
    qtd("aceites_sem_confirmacao"),
    `${qtd("aceites_sem_confirmacao")} aceite(s) verbal sem confirmação formal`,
    "P1",
    null,
    "aguardando confirmação formal",
  );
  addLinha(
    "contratos_enviados_pendentes",
    "conversao",
    "IND-FIN-02",
    qtd("contratos_enviados_pendentes"),
    `${qtd("contratos_enviados_pendentes")} contrato(s) sem referência financeira válida`,
    "P0",
    null,
    "bloqueio de formalização",
  );
  addLinha(
    "leads_sem_origem",
    "radar",
    "IND-COM-01",
    qtd("leads_sem_origem"),
    `${qtd("leads_sem_origem")} lead(s) sem origem declarada`,
    "P2",
    null,
    "higiene de cadastro",
  );
  addLinha(
    "discoveries_sem_desdobramento",
    "radar",
    "IND-RAD-01",
    qtd("discoveries_sem_desdobramento"),
    `${qtd("discoveries_sem_desdobramento")} leitura(s) sem próximo passo definido`,
    "P1",
    null,
    "revisão humana pendente",
  );
  addLinha(
    "onboardings_pendentes",
    "casos",
    "IND-JOR-01",
    qtd("onboardings_pendentes"),
    `${qtd("onboardings_pendentes")} caso(s) pago(s) com gates de ativação pendentes`,
    "P0",
    null,
    "prazo de ativação em 48h",
  );
  addLinha(
    "casos_pendencia_documental",
    "casos",
    "IND-QUA-01",
    qtd("casos_pendencia_documental"),
    `${qtd("casos_pendencia_documental")} caso(s) com pendência documental`,
    "P0",
    null,
    "bloqueio de qualidade",
  );
  addLinha(
    "cadencia_sem_touchpoint",
    "casos",
    "IND-JOR-03",
    cadencia.length,
    `${cadencia.length} caso(s) acima da regra de dias sem touchpoint`,
    "P1",
    null,
    "cadência vencida",
  );
  addLinha(
    "comunicacao_critica",
    "comunicacao",
    "IND-COM-03",
    sugestoesHumanas.criticos,
    `${sugestoesHumanas.criticos} contato(s) humano(s) crítico(s) sugerido(s) em rascunho`,
    "P1",
    null,
    "prioridade 1 do gatilho",
  );
  addLinha(
    "comunicacao_hoje",
    "comunicacao",
    "IND-COM-03",
    sugestoesHumanas.hoje,
    `${sugestoesHumanas.hoje} contato(s) humano(s) sugerido(s) para hoje`,
    "P2",
    null,
    "prioridade 2 do gatilho",
  );

  // Absorve os antigos “Sinais de conversão e integridade” nos mesmos grupos.
  const GRUPO_DO_SINAL: Record<string, LinhaIndicadorDia["grupo"]> = {
    midia_sem_leads: "conversao",
    midia_sem_classificacao: "conversao",
    proposta_sem_followup: "conversao",
    aceite_parado: "conversao",
    contrato_sem_financeiro: "conversao",
    origem_ausente: "radar",
    discovery_parada: "radar",
    pagamento_sem_onboarding: "casos",
  };
  const CHAVE_DO_SINAL: Record<string, string> = {
    proposta_sem_followup: "propostas_sem_followup",
    aceite_parado: "aceites_sem_confirmacao",
    contrato_sem_financeiro: "contratos_enviados_pendentes",
    origem_ausente: "leads_sem_origem",
    discovery_parada: "discoveries_sem_desdobramento",
    pagamento_sem_onboarding: "onboardings_pendentes",
  };
  for (const s of sinais) {
    linhasIndicadores.push({
      chave: CHAVE_DO_SINAL[s.codigo] ?? s.codigo,
      grupo: GRUPO_DO_SINAL[s.codigo] ?? "conversao",
      codigo: s.codigo,
      motivo: s.texto,
      responsavel: null,
      prazo: s.acao ?? "definir responsável e próxima ação",
      severidade: s.severidade === "critico" ? "P0" : "P1",
    });
  }
  const agrupado = agruparLinhasIndicadores(linhasIndicadores);

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

      {/* 0 — Cards do dia */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">{c.rotulo}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{c.total}</p>
            <p className="mt-1 text-[11px] text-navy/55">{c.leitura}</p>
          </div>
        ))}
      </section>

      {/* 1 — Minha fila priorizada */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Minha fila priorizada</h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {(
              [
                ["responsavel", "Responsável", opcoes.responsaveis, ""],
                ["area", "Área", opcoes.areas, "area_responsavel"],
                ["etapa", "Etapa", opcoes.etapas, "eixo_comercial"],
              ] as const
            ).map(([campo, rotuloCampo, lista, catalogo]) => (
              <label key={campo} className="flex items-center gap-1 text-navy/60">
                {rotuloCampo}
                <select
                  className="rounded border border-navy/15 bg-white px-2 py-1 text-navy"
                  value={filtros[campo] ?? ""}
                  onChange={(e) => setFiltros((f) => ({ ...f, [campo]: e.target.value }))}
                >
                  <option value="">Todos</option>
                  {lista.map((v) => (
                    <option key={v} value={v}>
                      {catalogo ? rotuloCatalogo(catalogo, v) : v}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-navy/50">Ordenada pela data da próxima ação, nunca pela data de criação.</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {priorizadaVisivel.map((f) => (
            <div key={f.chave}>
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {f.rotulo} · {f.itens.length}
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {f.itens.map((i) => (
                  <Linha
                    key={`${f.chave}-${i.tipo}-${i.id}`}
                    item={i}
                    proprietaria={proprietaria}
                    aoSalvar={() => void qDesk.refetch()}
                  />
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
                    <Linha
                      key={`${e.chave}-${i.tipo}-${i.id}`}
                      item={i}
                      proprietaria={proprietaria}
                      aoSalvar={() => void qDesk.refetch()}
                    />
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
            { rotulo: "Aceites pendentes", itens: itensFila("aceites_sem_confirmacao") },
            { rotulo: "Contratos enviados", itens: itensFila("contratos_enviados_pendentes") },
            { rotulo: "Pagamentos aguardados", itens: itensFila("pagamentos_aguardados") },
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


      {/* 4 — Casos em atenção: cadência crítica e bloqueio de cadeia, em uma única visão. */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-navy">Casos em atenção</h2>
          <Link to="/casos" className="text-xs text-navy/60 underline">
            Casos 360
          </Link>
        </div>
        <p className="mt-1 text-xs text-navy/50">
          Somente situações com ação necessária. Ausência de prazo é exibida como “Sem prazo definido”, nunca como número. Os
          prazos do dia já estão na fila priorizada.
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

        {/* Bloqueio de cadeia operacional. O Painel Hoje não é catálogo: sem SKU, preço ou edição de portfólio. */}
        {bloqueadosCatalogo.length > 0 ? (
          <div className="mt-4 border-t border-navy/10 pt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">
                Bloqueio por condição comercial · {bloqueadosCatalogo.length}
              </p>
              <Link to="/catalogo" className="text-xs text-navy/60 underline">
                Governança de Catálogo
              </Link>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/65">
              {bloqueadosCatalogo.map((c) => (
                <li key={c.case_id}>
                  <Link to="/casos/$caseId" params={{ caseId: c.case_id }} className="text-navy underline underline-offset-2">
                    {String(c.rotulo)}
                  </Link>{" "}
                  — {EXCECAO_CONDICAO_COMERCIAL}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* 5 — Atalhos: cada atalho apenas abre a entidade canônica; nada é executado ao abrir. */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            { to: "/leads" as const, rotulo: "Novo lead" },
            { to: "/propostas" as const, rotulo: "Abrir proposta" },
            { to: "/casos" as const, rotulo: "Abrir caso" },
            { to: "/contratos" as const, rotulo: "Preparar contrato" },
            { to: "/atendimento" as const, rotulo: "Registrar interação" },
            { to: "/financeiro" as const, rotulo: "Registrar pagamento" },
            { to: "/acessos-portal" as const, rotulo: "Publicar entrega no App Cliente" },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5">
              {a.rotulo}
            </Link>
          ))}
        </div>
      </section>

      {/* 6 — Sinais de atenção: alertas derivados, separados da fila de trabalho. */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Sinais de atenção</h2>
          <Link to="/governanca/indicadores" className="text-[11px] text-navy/40 underline underline-offset-2 hover:text-navy/60">
            registro canônico dos 16 indicadores
          </Link>
        </div>
        <p className="mt-1 text-xs text-navy/50">
          Cada registro aparece uma única vez, no maior nível de severidade aplicável. Sinais de conversão e integridade estão
          absorvidos nestes grupos. Nada é disparado a partir daqui.
        </p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {GRUPOS_INDICADOR.map((g) => {
            const linhas = agrupado[g.chave];
            return (
              <div key={g.chave} className="rounded-lg border border-navy/10 p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-navy">{g.titulo}</span>
                  <span className="font-mono text-[10px] text-navy/40">{g.codigos}</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {linhas.map((l) => (
                    <li key={l.chave} className="rounded border border-navy/10 px-2 py-1.5">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span
                          className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                            l.severidade === "P0"
                              ? "border-terracotta/50 bg-terracotta/5 text-terracotta"
                              : l.severidade === "P1"
                                ? "border-gold/50 bg-gold/10 text-navy"
                                : "border-navy/20 text-navy/60"
                          }`}
                        >
                          {l.severidade}
                        </span>
                        <span className="text-navy">{l.motivo}</span>
                        <span className="font-mono text-[10px] text-navy/40">{l.codigo}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-navy/60">
                        Responsável: {l.responsavel ?? "sem responsável definido"} · {l.prazo}
                      </p>
                    </li>
                  ))}
                  {linhas.length === 0 ? (
                    <li className="text-[11px] text-navy/50">Sem dados suficientes para sinalizar neste grupo hoje.</li>
                  ) : null}
                </ul>
                <Link to={g.rota} className="mt-2 inline-block text-xs text-navy underline underline-offset-2">
                  {g.acao}
                </Link>
              </div>
            );
          })}
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
