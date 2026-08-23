/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { estadoModoProprietaria } from "@/lib/modo-proprietaria.functions";
import { podeExibirAcoesRapidas } from "@/lib/painel-acoes-rapidas";
import { ATALHOS_DESCOBERTA, ROTULO_PRIORIDADE } from "@/lib/descoberta-desk";
import { AcoesRapidasProprietaria } from "@/components/painel/acoes-rapidas";
import { VerificadorAdminProprietaria } from "@/components/painel/verificador-admin";
import { casosBloqueadosPorCatalogo } from "@/lib/catalogo-referencia.functions";
import { EXCECAO_CONDICAO_COMERCIAL } from "@/lib/catalogo-referencia";
import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { panoramaChecklistJuridico } from "@/lib/contratos.functions";
import { FilaRevisaoJuridica } from "@/components/contratos/fila-revisao-juridica";
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
  itensNaoExibidos,
  opcoesFiltroDia,
  textoDiasSemTouchpoint,
  textoPrazo,
  agruparLinhasIndicadores,
  type FiltrosDia,
  type ItemDia,
  type LinhaIndicadorDia,
} from "@/lib/painel-dia";
import { calcularPrioridade, etiquetaParaFila } from "@/lib/prioridade-matriz";
import { validarPainelHoje, type ProblemaPainel, type RegistroRenderizado } from "@/lib/painel-ordem";

/**
 * Verificação de leitura da tela: confere, no que foi de fato renderizado, a
 * ordem canônica dos blocos (Sinais de atenção logo após Exceções que exigem
 * dono) e a ausência de registro repetido na fila. Só observa o DOM.
 */
function useVerificacaoLeituraPainel(raiz: React.RefObject<HTMLDivElement | null>, dependencias: unknown[]) {
  const [problemas, setProblemas] = useState<ProblemaPainel[]>([]);
  useEffect(() => {
    const no = raiz.current;
    if (!no) return;
    const blocos = [...no.querySelectorAll<HTMLElement>("[data-painel-bloco]")];
    const chaves = blocos.map((b) => b.dataset["painelBloco"] ?? "");
    const registros: RegistroRenderizado[] = blocos.flatMap((b) =>
      [...b.querySelectorAll<HTMLElement>("[data-registro]")].map((el) => {
        const [tipo = "", id = ""] = (el.dataset["registro"] ?? "").split(":");
        return { bloco: b.dataset["painelBloco"] ?? "", tipo, id };
      }),
    );
    setProblemas(validarPainelHoje(chaves, registros));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);
  return problemas;
}

function AvisoLeituraPainel({ problemas }: { problemas: ProblemaPainel[] }) {
  if (problemas.length === 0) return null;
  return (
    <section
      data-aviso-leitura-painel
      className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-navy"
    >
      <p className="font-medium text-terracotta">A leitura desta tela saiu do padrão acordado</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/75">
        {problemas.map((p) => (
          <li key={`${p.chave}-${p.mensagem}`}>{p.mensagem}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-navy/55">
        Aviso apenas de exibição: nenhum dado foi alterado e nenhuma ação externa foi disparada.
      </p>
    </section>
  );
}



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

/** Etiqueta derivada da matriz elegibilidade × urgência (sinal, nunca veredito). */
function EtiquetaPrioridade({ item }: { item: ItemDia }) {
  const r = calcularPrioridade({
    tipo: item.tipo,
    id: item.id,
    prazo: item.data,
    bloqueios: item.bloqueios,
    responsavel: item.responsavel,
    origem: item.demo ? "demo" : null,
  });
  const etiqueta = etiquetaParaFila(r, new Set([`${item.tipo}:${item.id}`]));
  if (!etiqueta) return null;
  const tom =
    r.sinal === "critica"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : r.sinal === "atencao"
        ? "border-gold/50 bg-gold/10 text-navy"
        : "border-navy/15 bg-navy/5 text-navy/70";
  return (
    <span
      data-prioridade={r.sinal}
      title={`${etiqueta.explicacao} · fatores: ${r.fatores.map((f) => `${f.rotulo}=${f.valor ?? "sem dado"}`).join(" | ")}`}
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] leading-tight ${tom}`}
    >
      {etiqueta.texto}
    </span>
  );
}

function Linha({
  item,
  proprietaria,
  aoSalvar,
  bloqueioComercial,
}: {
  item: ItemDia;
  proprietaria?: boolean;
  aoSalvar?: () => void;
  bloqueioComercial?: boolean;
}) {
  return (
    <li data-registro={`${item.tipo}:${item.id}`} className="min-w-0 rounded-lg border border-navy/10 px-3 py-2">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <span className="min-w-0 break-words">
          <LinkItem item={item}>{item.rotulo}</LinkItem>
        </span>
        <span className="shrink-0 text-xs text-navy/60">{textoPrazo(item.data)}</span>
      </div>
      <p className="mt-0.5"><EtiquetaPrioridade item={item} /></p>
      <p className="mt-0.5 break-words text-xs text-navy/65">{item.acao}</p>


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
        <AcoesRapidasProprietaria
          tipo={item.tipo === "caso" ? "caso" : "lead"}
          id={item.id}
          aoSalvar={aoSalvar}
          bloqueioComercial={bloqueioComercial}
        />
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
  const proprietaria = podeExibirAcoesRapidas(qModo.data);
  const qCad = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregarCadencia(), retry: false });
  const carregarBloqueios = useServerFn(casosBloqueadosPorCatalogo);
  const qCatalogo = useQuery({
    queryKey: ["painel-bloqueios-catalogo", incluirDemo],
    queryFn: () => carregarBloqueios({ data: { incluirTeste: incluirDemo } }),
    retry: false,
  });
  const carregarChecklistJuridico = useServerFn(panoramaChecklistJuridico);
  const qJuridico = useQuery({
    queryKey: ["painel-checklist-juridico", incluirDemo],
    queryFn: () => carregarChecklistJuridico({ data: { incluirDemo } }),
    retry: false,
  });
  const instrumentosJuridico = (qJuridico.data?.instrumentos ?? []) as any[];
  const instrumentosComBloqueio = instrumentosJuridico.filter((i) => i.bloqueios > 0);
  const instrumentosComPendencia = instrumentosJuridico.filter((i) => i.bloqueios === 0 && i.pendentes > 0);

  const bloqueadosCatalogo = qCatalogo.data?.itens ?? [];
  const idsBloqueadosCatalogo = new Set(
    (bloqueadosCatalogo as any[]).map((b) => String(b?.case_id ?? b?.caso_id ?? b?.id ?? "")),
  );

  const raizRef = useRef<HTMLDivElement>(null);
  const problemasLeitura = useVerificacaoLeituraPainel(raizRef, [
    qDesk.dataUpdatedAt,
    qCatalogo.dataUpdatedAt,
    qCad.dataUpdatedAt,
    qJuridico.dataUpdatedAt,
    incluirDemo,
    filtros,
  ]);

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
  for (const i of [...comercial.calls, ...comercial.propostas, ...comercial.semDisciplina]) usados.add(`${i.tipo}:${i.id}`);
  const cadencia = cadenciaRelevante((qCad.data?.casos ?? []) as any[], 6, usados);
  for (const c of cadencia) usados.add(`caso:${String((c as any).id)}`);
  const qtd = (chave: string) => (filas.find((f: any) => f.chave === chave)?.itens.length ?? 0) as number;
  // Somente leitura das filas já carregadas: resumo comercial conta sem repetir item já presente na fila.
  const itensFila = (chave: string) =>
    itensNaoExibidos(((filas.find((f: any) => f.chave === chave)?.itens ?? []) as any[]), usados, {
      incluirDemo,
      tipoPadrao: "lead",
    });

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
    "contratos_checklist_bloqueio",
    "formalizacao",
    "IND-JUR-01",
    instrumentosComBloqueio.length,
    `${instrumentosComBloqueio.length} instrumento(s) com bloqueio de conformidade no checklist jurídico`,
    "P0",
    null,
    "antes da revisão humana",
  );
  addLinha(
    "contratos_checklist_pendencia",
    "formalizacao",
    "IND-JUR-01",
    instrumentosComPendencia.length,
    `${instrumentosComPendencia.length} instrumento(s) com pendência formal no checklist jurídico`,
    "P2",
    null,
    "antes da revisão humana",
  );
  addLinha(
    "propostas_sem_followup",
    "formalizacao",
    "IND-COM-02",
    comercial.propostas.length,
    `${comercial.propostas.length} proposta(s) com follow-up vencido`,
    "P1",
    null,
    "follow-up vencido",
  );
  addLinha(
    "aceites_sem_confirmacao",
    "formalizacao",
    "IND-COM-02",
    qtd("aceites_sem_confirmacao"),
    `${qtd("aceites_sem_confirmacao")} aceite(s) verbal sem confirmação formal`,
    "P1",
    null,
    "aguardando confirmação formal",
  );
  addLinha(
    "contratos_enviados_pendentes",
    "formalizacao",
    "IND-FIN-02",
    qtd("contratos_enviados_pendentes"),
    `${qtd("contratos_enviados_pendentes")} contrato(s) enviado(s) sem avanço registrado`,
    "P0",
    null,
    "bloqueio de formalização",
  );
  addLinha(
    "condicao_comercial_bloqueada",
    "formalizacao",
    "IND-CAT-01",
    bloqueadosCatalogo.length,
    `${bloqueadosCatalogo.length} caso(s) com condição comercial bloqueada`,
    "P0",
    null,
    "resolver em Governança de Catálogo",
  );
  addLinha(
    "leads_sem_origem",
    "integridade",
    "IND-COM-01",
    qtd("leads_sem_origem"),
    `${qtd("leads_sem_origem")} lead(s) sem origem declarada`,
    "P2",
    null,
    "higiene de cadastro",
  );
  addLinha(
    "discoveries_sem_desdobramento",
    "integridade",
    "IND-RAD-01",
    qtd("discoveries_sem_desdobramento"),
    `${qtd("discoveries_sem_desdobramento")} leitura(s) sem próximo passo definido`,
    "P1",
    null,
    "revisão humana pendente",
  );
  addLinha(
    "onboardings_pendentes",
    "financeiro",
    "IND-JOR-01",
    qtd("onboardings_pendentes"),
    `${qtd("onboardings_pendentes")} caso(s) pago(s) com gates de ativação pendentes`,
    "P0",
    null,
    "pagamento sem onboarding",
  );
  addLinha(
    "pagamentos_aguardados",
    "financeiro",
    "IND-FIN-01",
    qtd("pagamentos_aguardados"),
    `${qtd("pagamentos_aguardados")} pagamento(s) inicial(is) aguardado(s)`,
    "P1",
    null,
    "aguardando confirmação transacional",
  );
  addLinha(
    "casos_pendencia_documental",
    "operacao",
    "IND-QUA-01",
    qtd("casos_pendencia_documental"),
    `${qtd("casos_pendencia_documental")} caso(s) com documento aguardado`,
    "P0",
    null,
    "bloqueio de qualidade",
  );
  addLinha(
    "cadencia_sem_touchpoint",
    "operacao",
    "IND-JOR-03",
    cadencia.length,
    `${cadencia.length} caso(s) acima da regra de dias sem touchpoint`,
    "P1",
    null,
    "cadência vencida",
  );
  addLinha(
    "comunicacao_critica",
    "cliente",
    "IND-COM-03",
    sugestoesHumanas.criticos,
    `${sugestoesHumanas.criticos} contato(s) humano(s) crítico(s) sugerido(s) em rascunho`,
    "P1",
    null,
    "prioridade 1 do gatilho",
  );
  addLinha(
    "comunicacao_hoje",
    "cliente",
    "IND-COM-03",
    sugestoesHumanas.hoje,
    `${sugestoesHumanas.hoje} contato(s) humano(s) sugerido(s) para hoje`,
    "P2",
    null,
    "prioridade 2 do gatilho",
  );

  // Absorve os antigos “Sinais de conversão e integridade” nos mesmos grupos.
  const GRUPO_DO_SINAL: Record<string, LinhaIndicadorDia["grupo"]> = {
    midia_sem_leads: "integridade",
    midia_sem_classificacao: "integridade",
    proposta_sem_followup: "formalizacao",
    aceite_parado: "formalizacao",
    contrato_sem_financeiro: "formalizacao",
    origem_ausente: "integridade",
    discovery_parada: "integridade",
    pagamento_sem_onboarding: "financeiro",
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
      grupo: GRUPO_DO_SINAL[s.codigo] ?? "integridade",
      codigo: s.codigo,
      motivo: s.texto,
      responsavel: null,
      prazo: s.acao ?? "definir responsável e próxima ação",
      severidade: s.severidade === "critico" ? "P0" : "P1",
    });
  }
  const agrupado = agruparLinhasIndicadores(linhasIndicadores);
  const PESO = { P0: 3, P1: 2, P2: 1 } as const;
  const maiorGravidade = (ls: LinhaIndicadorDia[]) =>
    ls.reduce<LinhaIndicadorDia["severidade"] | null>((m, l) => (!m || PESO[l.severidade] > PESO[m] ? l.severidade : m), null);



  return (
    <div ref={raizRef} className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <p className="min-w-0 text-sm text-navy/60">
          O que precisa de ação hoje, por quem e até quando. Governança, catálogo, métricas e planejamento ficam nas áreas
          proprietárias.
        </p>
        <label className="flex shrink-0 items-center gap-2 text-xs text-navy/60">
          <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
          Incluir demonstrações
        </label>

      </div>

      {proprietaria ? <VerificadorAdminProprietaria /> : null}

      <AvisoLeituraPainel problemas={problemasLeitura} />

      {/* 0 — Cards do dia */}
      <section data-painel-bloco="cards" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">{c.rotulo}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{c.total}</p>
            <p className="mt-1 text-[11px] text-navy/55">{c.leitura}</p>
          </div>
        ))}
      </section>

      {/* 1 — Minha fila priorizada */}
      <section data-painel-bloco="fila_priorizada" className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <h2 className="min-w-0 font-serif text-lg text-navy">Minha fila priorizada</h2>
          <div className="grid grid-cols-1 gap-2 text-xs sm:flex sm:flex-wrap">
            {(
              [
                ["responsavel", "Responsável", opcoes.responsaveis, ""],
                ["area", "Área", opcoes.areas, "area_responsavel"],
                ["etapa", "Etapa", opcoes.etapas, "eixo_comercial"],
              ] as const
            ).map(([campo, rotuloCampo, lista, catalogo]) => (
              <label key={campo} className="flex min-w-0 items-center gap-1 text-navy/60">
                <span className="shrink-0">{rotuloCampo}</span>
                <select
                  className="min-w-0 max-w-full flex-1 rounded border border-navy/15 bg-white px-2 py-1 text-navy sm:flex-none"
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
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {priorizadaVisivel.map((f) => (
            <div key={f.chave} className="min-w-0">

              <p className="text-xs uppercase tracking-wide text-navy/50">
                {f.rotulo} · {f.itens.length}
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {f.itens.map((i) => (
                  <Linha
                    key={`${f.chave}-${i.tipo}-${i.id}`}
                    item={i}
                    proprietaria={proprietaria}
                    bloqueioComercial={idsBloqueadosCatalogo.has(i.id)}
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
      <section data-painel-bloco="excecoes" className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Exceções que exigem dono</h2>
        {excecoes.length === 0 ? (
          <p className="mt-2 text-sm text-navy/55">Nenhuma exceção acionável no momento.</p>
        ) : (
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {excecoes.map((e) => (
              <div key={e.chave} className="min-w-0">

                <p className="text-xs uppercase tracking-wide text-navy/50">
                  {e.rotulo} · {e.itens.length}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {e.itens.slice(0, 6).map((i) => (
                    <Linha
                      key={`${e.chave}-${i.tipo}-${i.id}`}
                      item={i}
                      proprietaria={proprietaria}
                      bloqueioComercial={idsBloqueadosCatalogo.has(i.id)}
                      aoSalvar={() => void qDesk.refetch()}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3 — Sinais de atenção: vem logo após as exceções. Só conta e linka; nunca cria linha de trabalho nem tarefa. */}

      <section data-painel-bloco="sinais" className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">Sinais de atenção</h2>
          <Link to="/governanca/indicadores" className="text-[11px] text-navy/40 underline underline-offset-2 hover:text-navy/60">
            registro canônico dos indicadores
          </Link>
        </div>
        <p className="mt-1 text-xs text-navy/50">
          Apenas contagem, gravidade e origem. Itens já presentes na fila ou nas exceções não geram nova linha de ação.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {GRUPOS_INDICADOR.map((g) => {
            const linhas = agrupado[g.chave];
            const grave = maiorGravidade(linhas);
            return (
              <div key={g.chave} className="min-w-0 rounded-lg border border-navy/10 px-3 py-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
                  <span className="min-w-0 break-words text-sm font-medium text-navy">{g.titulo}</span>
                  <span className="flex shrink-0 items-center gap-1.5">

                    <span className="font-serif text-lg text-navy">{linhas.length}</span>
                    {grave ? (
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                          grave === "P0"
                            ? "border-terracotta/50 bg-terracotta/5 text-terracotta"
                            : grave === "P1"
                              ? "border-gold/50 bg-gold/10 text-navy"
                              : "border-navy/20 text-navy/60"
                        }`}
                      >
                        {grave}
                      </span>
                    ) : null}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-[11px] text-navy/55">{linhas[0]?.motivo ?? g.resumo}</p>
                <div className="mt-1 flex flex-wrap gap-3">
                  <Link to={g.rota} className="text-[11px] text-navy underline underline-offset-2">
                    {g.acao}
                  </Link>
                  {g.chave === "formalizacao" && bloqueadosCatalogo.length > 0 ? (
                    <Link to="/catalogo" className="text-[11px] text-navy underline underline-offset-2">
                      Governança de Catálogo ({bloqueadosCatalogo.length}) — {EXCECAO_CONDICAO_COMERCIAL}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FilaRevisaoJuridica compacto />

      {/* 4 — Comercial hoje */}

      <section data-painel-bloco="comercial" className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="min-w-0 font-serif text-lg text-navy">Comercial hoje</h2>
          <Link to="/conversao" className="shrink-0 text-xs text-navy/60 underline">
            Conversão e funil
          </Link>
        </div>
        <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">

          {[
            { rotulo: "Calls de hoje", itens: comercial.calls },
            { rotulo: "Propostas sem follow-up", itens: comercial.propostas },
            { rotulo: "Leads sem próxima ação", itens: comercial.semDisciplina },
            { rotulo: "Aceites pendentes", itens: itensFila("aceites_sem_confirmacao") },
            { rotulo: "Contratos enviados", itens: itensFila("contratos_enviados_pendentes") },
            { rotulo: "Pagamentos aguardados", itens: itensFila("pagamentos_aguardados") },
          ].map((b) => (
            <div key={b.rotulo} className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {b.rotulo} · {b.itens.length}
              </p>
              <ul className="mt-2 space-y-1 break-words text-xs text-navy/65">

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

      {/* 5 — Casos com prazo em atenção. Catálogo e condição comercial ficam nos sinais e na área proprietária. */}
      <section data-painel-bloco="prazos" className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="min-w-0 font-serif text-lg text-navy">Casos com prazo em atenção</h2>
          <Link to="/casos" className="shrink-0 text-xs text-navy/60 underline">
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
      </section>

      {/* 6 — Atalhos: cada atalho apenas abre a entidade canônica; nada é executado ao abrir. */}
      <section data-painel-bloco="atalhos" className="rounded-xl border border-navy/10 bg-white p-5">
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

      {/* 7 — Encontrar no Desk: apenas descoberta de módulos existentes. Nenhum dado é criado ou alterado. */}
      <section data-painel-bloco="descoberta" className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Encontrar no Desk</h2>
        <p className="mt-1 text-xs text-navy/55">
          Onde vivem os módulos que mudaram de nome. Abrir um link não executa nada.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {ATALHOS_DESCOBERTA.map((a) => (
            <Link
              key={a.rota}
              to={a.rota}
              className={`rounded-md border px-3 py-1.5 hover:bg-navy/5 ${
                a.referencia ? "border-terracotta/40 text-terracotta" : "border-navy/15 text-navy/75"
              }`}
              title={a.onde}
            >
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
