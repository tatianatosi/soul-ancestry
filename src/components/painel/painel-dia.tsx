/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { estadoAcessoPainel } from "@/lib/painel-hoje-acoes.functions";
import { podeExibirAcoesRapidas } from "@/lib/painel-acoes-rapidas";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { ATALHOS_DESCOBERTA, ROTULO_PRIORIDADE } from "@/lib/descoberta-desk";
import { SELO_PROXIMA_ACAO } from "@/lib/caso-ficha";
import { BadgeDesk, CarregandoDesk, type TomEstado } from "@/components/desk/ui-desk";
import { listarAlertas } from "@/lib/alertas.functions";
import { derivarCadenciaDoPainel } from "@/lib/painel-cadencia-derivada";
import { escolherCasoDestaque } from "@/lib/painel-caso-destaque";
import { FilaCadencia } from "@/components/painel/fila-cadencia";
import { CasoEmDestaque } from "@/components/painel/caso-destaque";
import { JornadaCasos } from "@/components/painel/jornada-casos";
import { AncoraApp } from "@/components/painel/ancora-app";
import { AberturaPainel } from "@/components/painel/abertura";
import { VisaoGeralTopo } from "@/components/painel/visao-geral-topo";
import { GRUPOS_INDICADOR } from "@/components/painel/sinais-por-grupo";
import { AcoesRapidasProprietaria } from "@/components/painel/acoes-rapidas";
import { casosBloqueadosPorCatalogo } from "@/lib/catalogo-referencia.functions";
import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { panoramaChecklistJuridico } from "@/lib/contratos.functions";
import { FilaRevisaoJuridica } from "@/components/contratos/fila-revisao-juridica";
import { FilaSlaOperacional } from "@/components/ops/fila-sla-operacional";
import { rotulo as rotuloCatalogo } from "@/lib/crm-desk";
import { sinaisMarketing } from "@/lib/indicadores-marketing";
import { contarLeadsAguardandoAcao, fraseComercialHoje } from "@/lib/comercial-hoje-canonico";
import { listarComercial } from "@/lib/comercial.functions";
import { carregarConversao } from "@/lib/conversao.functions";
import { montarEstados, montarFunil, type EventoBruto } from "@/lib/conversao-funil";
import {
  recorteFunilHoje,
  receitaDoMes,
  taxaConversaoLeadParaCaso,
} from "@/lib/visao-geral-mockup";
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
  textoPrazo,
  agruparLinhasIndicadores,
  type FiltrosDia,
  type ItemDia,
  type LinhaIndicadorDia,
} from "@/lib/painel-dia";
import { ItensDerivados } from "@/components/painel/itens-derivados";
import { itensDerivadosDoPainel } from "@/lib/painel-derivados";
import { calcularPrioridade, etiquetaParaFila } from "@/lib/prioridade-matriz";
import {
  validarPainelHoje,
  type ProblemaPainel,
  type RegistroRenderizado,
} from "@/lib/painel-ordem";

/**
 * Verificação de leitura da tela: confere, no que foi de fato renderizado, a
 * ordem canônica dos blocos (Sinais de atenção logo após Exceções que exigem
 * dono) e a ausência de registro repetido na fila. Só observa o DOM.
 */
function useVerificacaoLeituraPainel(
  raiz: React.RefObject<HTMLDivElement | null>,
  dependencias: unknown[],
) {
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
    <details
      data-aviso-leitura-painel
      className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy"
    >
      <summary className="cursor-pointer font-medium text-navy">Detalhes técnicos de leitura</summary>
      <p className="mt-2 text-xs text-navy/75">A leitura desta tela saiu do padrão acordado</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-navy/75">
        {problemas.map((p) => (
          <li key={`${p.chave}-${p.mensagem}`}>{p.mensagem}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-navy/55">
        Aviso apenas de exibição: nenhum dado foi alterado e nenhuma ação externa foi disparada.
      </p>
    </details>
  );
}

function LinkItem({
  item,
  children,
}: {
  item: { id: string; tipo: "lead" | "caso" };
  children: React.ReactNode;
}) {
  if (item.tipo === "caso") {
    return (
      <Link
        to="/casos/$caseId"
        params={{ caseId: item.id }}
        className="text-navy underline underline-offset-2"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link to="/calls" className="text-navy underline underline-offset-2">
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
      aria-label={ROTULO_PRIORIDADE}
      title={`${ROTULO_PRIORIDADE}: ${etiqueta.explicacao} · fatores: ${r.fatores.map((f) => `${f.rotulo}=${f.valor ?? "sem dado"}`).join(" | ")}`}
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
    <li
      data-registro={`${item.tipo}:${item.id}`}
      className="min-w-0 rounded-lg border border-navy/10 px-3 py-2"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <span className="min-w-0 break-words">
          <LinkItem item={item}>{item.rotulo}</LinkItem>
        </span>
        <span className="shrink-0 text-xs text-navy/60">{textoPrazo(item.data)}</span>
      </div>
      <p className="mt-0.5">
        <EtiquetaPrioridade item={item} />
      </p>
      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 break-words text-xs text-navy/65">
        <span>{item.acao}</span>
        {item.origemAcao ? (
          <span className="rounded-full border border-navy/15 bg-cream px-1.5 py-0.5 text-[10px] text-navy/60">
            {SELO_PROXIMA_ACAO[item.origemAcao]}
          </span>
        ) : null}
      </p>

      <p className="mt-0.5 text-xs">
        {item.responsavel ? (
          <span className="text-navy/60">Responsável: {item.responsavel}</span>
        ) : (
          <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-terracotta">
            Falha de qualidade: sem responsável definido · proprietário atual: Não definido · ação
            exigida: Atribuição humana necessária
          </span>
        )}
      </p>
      {item.bloqueios.length > 0 ? (
        <p className="mt-1 text-[11px] text-navy/50">
          +{item.bloqueios.length} bloqueio{item.bloqueios.length === 1 ? "" : "s"} no mesmo
          registro — abrir a ficha para a lista completa.
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
  const carregarModo = useServerFn(estadoAcessoPainel);
  const qModo = useQuery({
    queryKey: ["painel-modo-proprietaria"],
    queryFn: () => carregarModo(),
    retry: false,
  });
  const { proprietaria: proprietariaAutoridade } = useAutoridade();
  // Autoridade operacional é a fonte canônica; o estado legado do painel continua
  // valendo como fallback para não estreitar acesso já concedido.
  const proprietaria = proprietariaAutoridade || podeExibirAcoesRapidas(qModo.data);
  const qCad = useQuery({
    queryKey: ["painel-cadencia"],
    queryFn: () => carregarCadencia(),
    retry: false,
  });
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
  const carregarAlertas = useServerFn(listarAlertas);
  const qAlertas = useQuery({
    queryKey: ["alertas-pendentes-hoje"],
    queryFn: () => carregarAlertas({ data: { status: "pending" } }),
    retry: false,
  });
  const carregarConversaoHoje = useServerFn(carregarConversao);
  const qConversao = useQuery({
    queryKey: ["conversao", incluirDemo],
    queryFn: () => carregarConversaoHoje({ data: { incluirDemo } }),
    retry: false,
  });
  const carregarPagamentos = useServerFn(listarComercial);
  const qPagamentos = useQuery({
    queryKey: ["painel-receita-mes", incluirDemo],
    queryFn: () => carregarPagamentos({ data: { recurso: "payments", incluirDemos: incluirDemo } }),
    retry: false,
  });
  const leiturasSecundarias = [
    { rotulo: "cadência dos casos", q: qCad },
    { rotulo: "bloqueios de catálogo", q: qCatalogo },
    { rotulo: "checklist jurídico", q: qJuridico },
    { rotulo: "estado de acesso do painel", q: qModo },
    { rotulo: "alertas pendentes", q: qAlertas },
  ].filter((l) => l.q.isError);

  const instrumentosJuridico = (qJuridico.data?.instrumentos ?? []) as any[];
  const instrumentosComBloqueio = instrumentosJuridico.filter((i) => i.bloqueios > 0);
  const instrumentosComPendencia = instrumentosJuridico.filter(
    (i) => i.bloqueios === 0 && i.pendentes > 0,
  );

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
  if (qDesk.isError || !qDesk.data)
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2">
        <p className="text-sm text-terracotta">Não foi possível carregar as filas do dia.</p>
        <button
          type="button"
          onClick={() => void qDesk.refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </div>
    );

  const filas = qDesk.data.filas;
  const hoje = hojeISO();
  const itens = consolidarDia(filas, { incluirDemo });
  // Precedência exclusiva: fila priorizada → exceções → comercial. Um registro só aparece uma vez.
  const priorizada = filaPriorizada(itens, hoje);
  const cards = cardsHoje(filas, { incluirDemo, itens });
  const casoDestaque = escolherCasoDestaque(itens, { incluirDemo });
  const opcoes = opcoesFiltroDia(itens);
  const priorizadaVisivel = priorizada.map((f) => ({
    ...f,
    itens: aplicarFiltrosDia(f.itens, filtros),
  }));
  const usados = chavesExibidas(priorizada);
  const excecoes = excecoesQueExigemDono(itens, filas, hoje, usados);

  for (const e of excecoes) for (const i of e.itens) usados.add(`${i.tipo}:${i.id}`);
  const comercial = comercialHoje(filas, { incluirDemo, hoje, jaExibidos: usados });
  for (const i of [...comercial.calls, ...comercial.propostas, ...comercial.semDisciplina])
    usados.add(`${i.tipo}:${i.id}`);
  // Cadência: motivo, evidência e o toque que faz avançar. Deriva das filas e
  // dos casos já carregados, respeitando a precedência — registro exibido em
  // bloco anterior não reaparece aqui. Calculada antes de `usados` receber os
  // casos de cadência, senão excluiria exatamente o que precisa mostrar.
  const cadenciaFollowUp = derivarCadenciaDoPainel({
    filas: filas as any[],
    casosCadencia: (qCad.data?.casos ?? []) as Record<string, unknown>[],
    jaExibidos: usados,
    incluirDemo,
  });
  const cadencia = cadenciaRelevante((qCad.data?.casos ?? []) as any[], 6, usados);
  for (const c of cadencia) usados.add(`caso:${String((c as any).id)}`);
  for (const i of cadenciaFollowUp) usados.add(i.pessoaOuCasoId);
  const qtd = (chave: string) =>
    (filas.find((f: any) => f.chave === chave)?.itens.length ?? 0) as number;

  const eventosConv = (qConversao.isSuccess ? (qConversao.data?.eventos ?? []) : []) as EventoBruto[];
  const estadosConv = montarEstados(eventosConv, {
    leads: new Map((qConversao.data?.rotulos?.leads ?? []).map((l) => [l.id, l.rotulo])),
    casos: new Map((qConversao.data?.rotulos?.casos ?? []).map((c) => [c.id, c.rotulo])),
  });
  const funilCheio = montarFunil(eventosConv, estadosConv);
  const funilHoje = recorteFunilHoje(funilCheio);
  const taxaConversao = qConversao.isSuccess ? taxaConversaoLeadParaCaso(funilCheio) : null;
  const receitaMes = qPagamentos.isSuccess
    ? receitaDoMes((qPagamentos.data ?? []) as { status?: unknown; pago_em?: unknown; valor?: unknown; dados_teste?: unknown }[], hoje, incluirDemo)
    : null;
  const prioridadesTopo = priorizada.flatMap((f) => f.itens).slice(0, 5);

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
    if (total > 0)
      linhasIndicadores.push({ chave, grupo, codigo, motivo, responsavel, prazo, severidade });
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
  // Itens derivados (visão derivada de alertas-derivados.ts) exibidos na
  // interface sem repetir registro já presente na fila, exceções ou comercial.
  const derivados = itensDerivadosDoPainel({
    casosCadencia: (qCad.data?.casos ?? []) as any[],
    jaExibidos: usados,
    bloqueadosCatalogo: [...idsBloqueadosCatalogo],
  });

  const agrupado = agruparLinhasIndicadores(linhasIndicadores);

  return (
    <div ref={raizRef} className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <p data-desk-enxuto className="min-w-0 text-sm text-navy/60">
          O que precisa de ação hoje, por quem e até quando. Governança, catálogo, métricas e
          planejamento ficam nas áreas proprietárias.
        </p>
        <label className="flex shrink-0 items-center gap-2 text-xs text-navy/60">
          <input
            type="checkbox"
            checked={incluirDemo}
            onChange={(e) => setIncluirDemo(e.target.checked)}
          />
          Incluir demonstrações
        </label>
      </div>

      {/*
        26/08/2026 — o verificador de acesso administrativo saiu daqui.

        Ele foi pedido pela Proprietária em 25/08, no meio da crise de acesso,
        quando não estava claro se ela ainda era admin. Era instrumento de
        emergência, e a emergência acabou: o vínculo está confirmado no banco.

        Ficar no Painel custava duas coisas. Era o mesmo diagnóstico que a
        Governança já oferece — e lá acompanhado da reconfirmação, que é a
        parte que de fato conserta; aqui o botão só sabia mandar a pessoa
        para outra tela. E ocupava, todo dia, um espaço no Painel Hoje, que
        existe para o que pede ação hoje.

        A ferramenta completa continua em Modo Proprietária / Governança.
      */}
      <AvisoLeituraPainel problemas={problemasLeitura} />

      {leiturasSecundarias.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2">
          <p className="text-sm text-terracotta">
            Falha ao carregar: {leiturasSecundarias.map((l) => l.rotulo).join(", ")}. Os blocos
            correspondentes estão incompletos — não trate como ausência de registro.
          </p>
          <button
            type="button"
            onClick={() => leiturasSecundarias.forEach((l) => void l.q.refetch())}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {/* 0 — Visão Geral do mockup: Casos, Alertas, Receita, Conversão, funil e prioridades. */}
      <section data-painel-bloco="cards">
        <AncoraApp bloco="cards" />
        <VisaoGeralTopo
          casosAtivos={(qCad.data?.casos ?? []).length}
          alertasPendentes={qAlertas.isSuccess ? (qAlertas.data ?? []).length : null}
          receitaMes={receitaMes}
          conversao={taxaConversao}
          funil={funilHoje}
          prioridades={prioridadesTopo}
        />
      </section>
      <AberturaPainel cards={cards} totalCasos={(qCad.data?.casos ?? []).length} />

      {/*
        1 — Caso em destaque. O que olhar primeiro, com a regra que o colocou
        no topo. Reusa `calcularPrioridade`, a mesma função da fila e de
        Casos 360 — nenhum cálculo paralelo.
      */}
      <CasoEmDestaque dados={casoDestaque} />

      {/*
        2 — Jornada dos casos. A fase como percurso, com a saúde de contato
        dentro de cada etapa. Não repete a fila: a fila diz o que fazer hoje,
        a jornada diz onde a carteira está. Vem da mesma consulta de cadência
        que o Painel já fazia — só passou a trazer o campo `fase`.
      */}
      <section data-painel-bloco="jornada">
        {/*
          A jornada é a única leitura de cadência que aparece como lista própria:
          se a consulta falhar, mostra erro com nova tentativa em vez de uma
          carteira aparentemente vazia.
        */}
        <EstadoDados<Record<string, unknown>>
          carregando={qCad.isLoading}
          erro={qCad.error}
          dados={qCad.data?.casos as Record<string, unknown>[] | undefined}
          aoTentarNovamente={() => void qCad.refetch()}
          recurso="a jornada dos casos"
          vazio="Nenhum caso na carteira para montar a jornada."
        >
          {(casos) => <JornadaCasos casos={casos as never} />}
        </EstadoDados>
      </section>

      {/* 3 — Minha fila priorizada */}
      <section
        data-painel-bloco="fila_priorizada"
        className="rounded-xl border border-navy/10 bg-white p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <h2 className="min-w-0 font-serif text-lg text-navy">Minha fila priorizada</h2>
          <AncoraApp bloco="fila_priorizada" />
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
        <p className="mt-1 text-xs text-navy/50">
          Ordenada pela data da próxima ação, nunca pela data de criação.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {priorizada
            .flatMap((f) => f.itens)
            .slice(0, 6)
            .map((i) => (
              <li key={`pessoa-${i.tipo}-${i.id}`} className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
                <p className="text-sm font-medium text-navy">
                  <LinkItem item={i}>{i.rotulo}</LinkItem>
                </p>
                <p className="mt-0.5 text-xs text-navy/70">Próxima ação: {i.acao}</p>
                <p className="text-xs text-navy/55">
                  {i.responsavel ?? "Sem responsável"} · {textoPrazo(i.data)}
                </p>
                {i.tipo === "caso" ? (
                  <Link
                    to="/app-cliente-como-pessoa"
                    search={{ casoId: i.id }}
                    className="mt-1 inline-block text-[11px] text-navy underline underline-offset-2"
                  >
                    Ver App Cliente
                  </Link>
                ) : null}
              </li>
            ))}
        </ul>
        {priorizada.every((f) => f.itens.length === 0) ? (
          <p className="mt-2 text-xs text-navy/50">Nenhuma pessoa ou caso na fila de hoje.</p>
        ) : null}
        <p className="mt-2 text-xs">
          <Link to="/clientes" className="text-navy underline underline-offset-2">
            Buscar pessoa 360
          </Link>
        </p>
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
                {f.itens.length === 0 ? (
                  <li className="text-xs text-navy/50">Nada nesta faixa.</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Exceções que exigem dono */}
      <section
        data-painel-bloco="excecoes"
        className="rounded-xl border border-navy/10 bg-white p-5"
      >
        <h2 className="font-serif text-lg text-navy">Exceções que exigem dono</h2>
        <AncoraApp bloco="excecoes" />
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

        {/*
          Decisão da Proprietária (25/08): a fila de revisão jurídica é uma
          exceção que exige dono, e passa a morar dentro deste bloco em vez de
          ocupar superfície própria entre Sinais e Comercial.
        */}
        <div className="mt-4 border-t border-navy/10 pt-4">
          <FilaRevisaoJuridica compacto />
        </div>
        <FilaSlaOperacional />
      </section>

      {/*
        3 — Alertas prioritários (CA-CORTE-ALERTAS-ROTA-CANONICA, 09/09/2026):
        mesma fonte (case_alerts, via listarAlertas) da rota /alertas — aqui só
        o subconjunto pendente mais crítico de hoje, nunca a lista completa.
        Abrir/reconhecer/reprogramar vive em /alertas; aqui é só contagem e link.
      */}
      <AlertasPrioritariosDoPainel />

      {/* 4 — Comercial hoje: resumo único (CA-UX-03 Fase B). Detalhe em /conversao. */}

      <section
        data-painel-bloco="comercial"
        className="rounded-xl border border-navy/10 bg-white p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="min-w-0 font-serif text-lg text-navy">Comercial hoje</h2>
          <AncoraApp bloco="comercial" />
          <Link to="/conversao" className="shrink-0 text-xs text-navy/60 underline">
            Conversão e saúde comercial
          </Link>
        </div>
        <p data-painel-resumo="comercial" className="mt-3 text-sm text-navy">
          <Link to="/conversao" className="text-navy underline underline-offset-2">
            {fraseComercialHoje(
              contarLeadsAguardandoAcao({
                calls: comercial.calls,
                propostas: comercial.propostas,
                semDisciplina: comercial.semDisciplina,
              }),
            )}
          </Link>
        </p>
        <p className="mt-1 text-xs text-navy/50">
          Calls de hoje, propostas sem follow-up e leads sem próxima ação, sem repetir registro já
          presente nas filas acima.
        </p>
        {/*
          CA-UX-02 §7, regra de não duplicação: contrato enviado e pagamento
          aguardado já são contados no cartão "Exceções críticas". Aqui vale
          rótulo e link para a página canônica, nunca uma segunda contagem —
          que, por deduplicar contra as filas acima, daria outro número sob o
          mesmo nome.
        */}
        <p data-painel-resumo="financeiro" className="mt-3 text-sm text-navy">
          <Link to="/financeiro" className="text-navy underline underline-offset-2">
            Financeiro hoje: contratos enviados e pagamentos aguardados
          </Link>
        </p>
      </section>

      {/* 5 — Casos com prazo em atenção. Catálogo e condição comercial ficam nos sinais e na área proprietária. */}
      <section data-painel-bloco="prazos" className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="min-w-0 font-serif text-lg text-navy">
            Cadência — quem precisa de um toque
          </h2>
          <AncoraApp bloco="prazos" />
          <Link to="/casos" className="shrink-0 text-xs text-navy/60 underline">
            Casos 360
          </Link>
        </div>

        <p className="mt-1 text-xs text-navy/50">
          Quem parou, há quanto tempo, por quê e qual toque faz avançar. Ausência de prazo é exibida
          como “Sem prazo definido”, nunca como número. Registro já exibido nos blocos acima não
          reaparece aqui.
        </p>

        <FilaCadencia itens={cadenciaFollowUp} carregando={qCad.isLoading} erro={qCad.isError} />

        {/*
          Itens derivados moraram dentro de "Sinais de atenção" até 25/08. Com
          a fusão daquele bloco, vieram para cá: são cadência e onboarding, o
          mesmo assunto desta seção. Continuam somente leitura — não criam
          tarefa, prazo nem comunicação.
        */}
        <div className="mt-4 border-t border-navy/10 pt-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-medium text-navy">Itens derivados</h3>
            <span className="text-[11px] text-navy/45">
              Cadência e onboarding · somente leitura
            </span>
          </div>
          <div className="mt-2">
            <ItensDerivados itens={derivados} />
          </div>
          <Link
            to="/ops"
            className="mt-2 inline-block text-[11px] text-navy underline underline-offset-2"
          >
            Ver cadência completa
          </Link>
        </div>
      </section>

      {/* 6 — Atalhos: cada atalho apenas abre a entidade canônica; nada é executado ao abrir. */}
      {/*
        6 — Encontrar no Desk. Decisão da Proprietária (25/08): o bloco
        "Atalhos" foi fundido aqui — eram dois blocos de links para rotas
        existentes, um em cima do outro. Continua sendo descoberta pura:
        abrir um link não cria nem altera nada.
      */}
      <section
        data-painel-bloco="descoberta"
        className="rounded-xl border border-navy/10 bg-white p-5"
      >
        <h2 className="font-serif text-lg text-navy">Encontrar no Desk</h2>
        <AncoraApp bloco="descoberta" />

        <p className="mt-3 text-[11px] uppercase tracking-wide text-navy/50">
          Começar alguma coisa
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {[
            { to: "/leads" as const, rotulo: "Novo lead" },
            { to: "/propostas" as const, rotulo: "Abrir proposta" },
            { to: "/casos" as const, rotulo: "Abrir caso" },
            { to: "/contratos" as const, rotulo: "Preparar contrato" },
            { to: "/atendimento" as const, rotulo: "Registrar interação" },
            { to: "/financeiro" as const, rotulo: "Registrar pagamento" },
            { to: "/acessos-portal" as const, rotulo: "Publicar entrega no App Cliente" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5"
            >
              {a.rotulo}
            </Link>
          ))}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-navy/50">
            Módulos que mudaram de nome
          </summary>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {ATALHOS_DESCOBERTA.map((a) => (
              <Link
                key={a.rota}
                to={a.rota}
                className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5"
                title={a.onde}
              >
                {a.rotulo}
              </Link>
            ))}
          </div>
        </details>

        {/*
          Os cinco grupos de sinal saíram desta grade. Cada um abre a aba dona
          (Radar Interno, Conversão, Casos, Financeiro, Atendimento). O Hoje
          guarda só o atalho — a contagem vive na superfície canônica.
        */}
        <details className="mt-4 border-t border-navy/10 pt-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-navy/50">
            Abrir sinal na aba dona
          </summary>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {GRUPOS_INDICADOR.map((g) => {
              const n = (agrupado[g.chave] ?? []).length;
              return (
                <Link
                  key={g.chave}
                  to={g.rota}
                  title={n ? `${n} sinal(is) nesta leitura` : g.resumo}
                  className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5"
                >
                  {g.titulo}
                </Link>
              );
            })}
          </div>
          {/* CA-OPS-02: cadência não é recalculada aqui; só atalho para a fonte canônica em /ops. */}
          <Link
            to="/ops"
            className="mt-2 inline-block text-[11px] font-medium text-navy underline underline-offset-2"
          >
            Ver cadência e onboarding em risco
          </Link>
        </details>
      </section>

      <div className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy/70">
        <button
          onClick={() => setAjuda((v) => !v)}
          className="text-xs uppercase tracking-wide text-navy/55"
        >
          {ajuda ? "Ocultar ajuda" : "Como ler estas informações"}
        </button>
        {ajuda ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
            <li>
              Prioridade: vencidas → hoje → próximos 7 dias. Um registro aparece uma única vez, na
              maior urgência aplicável.
            </li>
            <li>
              Cada registro aparece uma única vez: a ação principal fica aqui, os demais bloqueios
              na ficha do caso.
            </li>

            <li>
              Itens sem responsável são falha de qualidade, viram exceção e têm rota de correção na
              ficha do registro.
            </li>
            <li>
              Sem prazo é exibido como “Sem prazo definido”; nunca convertemos ausência de data em
              número.
            </li>
            <li>
              Demonstrações são excluídas na consulta e só entram com o filtro explícito “Incluir
              demonstrações”.
            </li>
            <li>
              Catálogo, formalização, pesquisa, conversão e jornada ficam nos módulos proprietários
              — aqui só priorização.
            </li>
            <li>
              Nada aqui é conclusão: dados jurídicos e genealógicos seguem como hipótese até
              confirmação documental.
            </li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}

const TOM_CRITICIDADE_PAINEL: Record<string, TomEstado> = {
  critica: "bloqueio",
  alta: "critico",
  atencao: "atencao",
};

/**
 * CA-CORTE-ALERTAS-ROTA-CANONICA (09/09/2026) — subconjunto prioritário de
 * hoje, mesma fonte (case_alerts, via listarAlertas) da rota /alertas. Só
 * conta e linka: reconhecer/reprogramar/abrir tarefa vivem na rota completa.
 */
function AlertasPrioritariosDoPainel() {
  const carregar = useServerFn(listarAlertas);
  const q = useQuery({
    queryKey: ["alertas-prioritarios-painel"],
    queryFn: () => carregar({ data: { status: "pending", limite: 5 } }),
  });
  const linhas = q.data ?? [];

  return (
    <section data-painel-bloco="alertas" className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="min-w-0 font-serif text-lg text-navy">Alertas de achados pendentes</h2>
        <Link to="/alertas" className="shrink-0 text-xs text-navy/60 underline">
          Abrir Alertas
        </Link>
      </div>
      <p className="mt-1 text-xs text-navy/50">
        Sinal sem duplicar tarefa. Enviar abre a tela de Alertas — a fila humana confirma; nada sai
        sozinho por WhatsApp ou e-mail.
      </p>
      {q.isLoading ? (
        <CarregandoDesk linhas={2} />
      ) : linhas.length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">Nenhum alerta pendente agora.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {linhas.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link to="/casos/$caseId" params={{ caseId: a.caseId }} className="text-navy underline underline-offset-2">
                {a.titulo} — {a.caseCodigo ?? a.caseTitulo ?? a.caseId}
              </Link>
              <span className="flex items-center gap-2">
                <BadgeDesk texto={a.criticidade} tom={TOM_CRITICIDADE_PAINEL[a.criticidade] ?? "neutro"} />
                <Link to="/alertas" className="rounded-full bg-navy px-3 py-1 text-[11px] font-medium text-cream">
                  Enviar
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
