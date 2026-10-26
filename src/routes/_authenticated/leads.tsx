import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { CarregandoDesk } from "@/components/desk/ui-desk";
import { motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { ChipsEscolha, MultiSelecao, Secao, Selecao, Texto } from "@/components/caso/campos";
import { DerivacaoJornada } from "@/components/crm/derivacao-jornada";
import { HandoffLead } from "@/components/crm/handoff-lead";
import { NovoLeadDialog } from "@/components/crm/novo-lead";
import { TemplatesWhatsapp } from "@/components/crm/templates-whatsapp";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
// Frente 2 (19/10/2026) — "Produtos/serviços recomendados" abaixo é a lista
// curada de sinal comercial (gate de via inviável incluído); o seletor de
// produto-pai REAL (PP-01–09, planner_catalog_feed) vem deste componente já
// existente (antes só em /catalogo), reaproveitado aqui — não duplicado.
import { PlanejadorProdutosPai } from "@/components/catalogo/planejador-produtos-pai";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { useAutoridade } from "@/components/saas/autoridade";
import { arquivarLeadDesk, listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import {
  AREAS_RESPONSAVEIS,
  CATALOGOS,
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  MOTIVOS_PERDA,
  NACIONALIDADES,
  OBJETIVOS,
  ORIGENS_LEAD,
  PROXIMAS_ACOES,
  SERVICOS_INICIAIS,
  STATUS_VIA,
  AMBIENTES_DOSSIE,
  NIVEIS_ACESSO_DOSSIE,
  PRODUTOS_RECOMENDADOS,
  DESPESAS_TERCEIROS_STATUS,
  DESPESAS_TERCEIROS_REGRA,
  DESPESAS_TERCEIROS_FAIXA,
  VIAS_JURIDICAS,
  CONSENTIMENTO_STATUS,
  CANAIS_CONSENTIMENTO,
  PAISES_LINHA_PRIORITARIA,
  PESQUISA_PREVIA_AUTORIZACAO,
  PESQUISA_PREVIA_ESCOPO,
  DOCUMENTOS_CHAVE,
  resultadoComercialDerivado,
  rotulo,
  errosBloqueantesAlteracao,
  validarLead,
  type ErroValidacao,
  type LeadDesk,
  type Opcao,
} from "@/lib/crm-desk";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
import { ImportarTriagemScan } from "@/components/crm/importar-triagem-scan";
import { ETAPAS_SPIN, progressoSpin, sinaisQualidadeLead, spinDerivadoDoLead } from "@/lib/discovery-roteiro";
import { calcularRadar } from "@/lib/radar-elegibilidade";
import { listarTrilhasJuridicas } from "@/lib/trilhas-juridicas.functions";
import { formatarTelefone } from "@/lib/validacao-pessoa";
import { leadForaDoPipeline, etapaPipeline, ETAPAS_PIPELINE, ROTULO_ETAPA_PIPELINE } from "@/lib/crm-desk";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  INDICADORES_LEADS,
  indicadoresLeads,
  leadNoIndicador,
  leadValidoParaIndicadores,
  type IndicadorLeads,
} from "@/lib/crm-vivo-metricas";
import { CaCard } from "@/components/ui/ca-card";
import { Clock, Filter, User } from "lucide-react";

import { BarrasHorizontais, Etiqueta, GraficoColunas, Pessoa } from "@/components/prancha-v4/kit";
import { FunilDegraus } from "@/components/prancha-v4/funil-degraus";
import { humano } from "@/lib/rotulos-golive";
import { listarComercial, listarVinculos as listarVinculosComercial, totalInvestimentoMarketing } from "@/lib/comercial.functions";
import { moeda as moedaBRL, dataBr } from "@/components/comercial/base";
import { FichaSecao, FichaSecoes } from "@/components/crm/ficha-secoes";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "CRM de leads — Clube Ancestral" },
      { name: "description", content: "Desk comercial diário: leads, Discovery, eixos comercial e de formalização." },
      { property: "og:title", content: "CRM de leads — Clube Ancestral" },
      { property: "og:description", content: "Desk comercial diário do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

type LeadComPendencias = LeadDesk & { pendencias?: ErroValidacao[] };

function LeadsPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_fila_responsavel_prazo" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const arquivar = useServerFn(arquivarLeadDesk);
  const listarComercialFn = useServerFn(listarComercial);
  const listarVinculosFn = useServerFn(listarVinculosComercial);
  const investimentoFn = useServerFn(totalInvestimentoMarketing);
  const qc = useQueryClient();

  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const q = useQuery({
    queryKey: ["leads-desk", mostrarArquivados],
    queryFn: () => carregar({ data: { incluirArquivados: mostrarArquivados } }),
    retry: false,
  });
  /*
    Propostas em negociação, investimento em marketing e nomes de cliente
    (Prancha V4, Proprietária, 13/10/2026): `listarComercial` (recurso
    "proposals") e `listarVinculos` já existem e já são usados por
    financeiro.tsx — reaproveitados aqui, sem tabela ou coluna nova.
    `totalInvestimentoMarketing` lê a mesma `marketing_investments` já usada
    por `carregarConversao` (tela de Marketing), só o total agregado.
  */
  const qPropostas = useQuery({
    queryKey: ["comercial", "proposals", ""],
    queryFn: () => listarComercialFn({ data: { recurso: "proposals" } }),
  });
  const qVinculosComercial = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => listarVinculosFn({}) });
  const qInvestimento = useQuery({ queryKey: ["marketing-investimento-total"], queryFn: () => investimentoFn({}) });
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Record<string, unknown>>({});
  /*
    17/10/2026 — Correção da Proprietária ao corte radical anterior:
    AncestralScan e templates de WhatsApp precisam de acesso funcional,
    não só sair do render. Viram gavetas (Sheet) acionadas por botão —
    mesmos componentes, mesma lógica, só reembalados numa superfície
    contextual em vez de montados sempre na página.
  */
  const [scanAberto, setScanAberto] = useState(false);
  const [templatesAberto, setTemplatesAberto] = useState(false);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(rascunho).length > 0);
  const [leadPendente, setLeadPendente] = useState<string | null>(null);
  const [filtroEixo, setFiltroEixo] = useState("");
  const [mostrarConvertidos, setMostrarConvertidos] = useState(false);
  const [indicadorAtivo, setIndicadorAtivo] = useState<IndicadorLeads | null>(null);
  const [filtroArea, setFiltroArea] = useState("");
  // CA10-MARKETING-CONTEUDO-VIVO (09/09/2026): filtro de origem já existia
  // como campo do lead, nunca como filtro da lista — Marketing agora abre
  // esta tela para o usuário aplicar o mesmo recorte que viu no indicador.
  const [filtroOrigem, setFiltroOrigem] = useState("");
  const [busca, setBusca] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [novoLeadAberto, setNovoLeadAberto] = useState(false);

  const leads = (q.data ?? []) as LeadComPendencias[];
  const atual = useMemo(() => leads.find((l) => l.id === selecionado) ?? null, [leads, selecionado]);
  const editado = useMemo(() => ({ ...(atual ?? { nome: "" }), ...rascunho }) as LeadDesk, [atual, rascunho]);
  // 26/10/2026 (auditoria): sem o segundo argumento, a validação do cliente
  // sempre rodava em modo estrito, mesmo para a proprietária — o servidor já
  // libera pendência de processo para ela (`proprietariaOperando`); a tela
  // mostrava "Pendências que impedem esta gravação" para regras que o
  // servidor ia aceitar.
  const erros = useMemo(
    () => (atual || Object.keys(rascunho).length ? validarLead(editado, autoridade.proprietaria) : []),
    [editado, atual, rascunho, autoridade.proprietaria],
  );
  const errosBloqueantes = useMemo(
    () => errosBloqueantesAlteracao(atual, editado, Object.keys(rascunho)),
    [atual, editado, rascunho],
  );

  const carregarTrilhas = useServerFn(listarTrilhasJuridicas);
  const qTrilhas = useQuery({ queryKey: ["trilhas-juridicas"], queryFn: () => carregarTrilhas(), retry: false });
  const trilhas = qTrilhas.data?.trilhas ?? [];
  const marcos = qTrilhas.data?.marcos ?? [];
  const trilhasIndisponiveis =
    !qTrilhas.isLoading && (Boolean(qTrilhas.error) || qTrilhas.data === undefined);
  const trilhaSelecionada = trilhas.find((t) => t.id === editado.trilha_referencia_id) ?? null;
  const opcoesTrilhas: Opcao[] = trilhas.map((t) => ({
    valor: t.id,
    rotulo: `${t.pais ?? "—"} · ${t.track_name ?? t.code ?? "—"} (${rotulo("status_via", t.status_via)})`,
  }));
  const opcoesMarcos: Opcao[] = marcos
    .filter((m) => !editado.trilha_referencia_id || m.track_id === editado.trilha_referencia_id)
    .map((m) => ({ valor: m.id, rotulo: `${m.label} — ${rotulo("status_marco", m.status)}` }));
  const sinais = useMemo(
    () =>
      atual || Object.keys(rascunho).length
        ? sinaisQualidadeLead(editado, {
            status_via: trilhaSelecionada?.status_via ?? editado.status_via ?? null,
            status_marco: marcos.find((m) => m.id === editado.marco_referencia_id)?.status ?? null,
          })
        : [],
    [editado, atual, rascunho, trilhaSelecionada, marcos],
  );
  const radar = useMemo(
    () =>
      calcularRadar(editado, {
        status_marco: marcos.find((m) => m.id === editado.marco_referencia_id)?.status ?? null,
      }),
    [editado, marcos],
  );
  const mutSalvar = useMutation({
    mutationFn: () =>
      salvar({
        data: { id: atual?.id ?? null, valores: { ...rascunho, ...spinDerivadoDoLead(editado) } },
      }),
    onSuccess: (r) => {
      if (!r.ok) {
        setMsg("Gravação recusada: corrija as pendências listadas.");
        return;
      }
      setMsg("Registro gravado.");
      setSelecionado(r.lead?.id ?? null);
      // Corte 1 (27/09/2026): relê antes de limpar o rascunho — sem voltar
      // a mostrar o valor antigo por um instante depois de "gravado".
      void qc.invalidateQueries({ queryKey: ["leads-desk"] }).then(() => setRascunho({}));
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const mutArquivar = useMutation({
    mutationFn: (motivo: string) => arquivar({ data: { id: String(atual?.id), motivo } }),
    onSuccess: () => {
      setMsg("Lead arquivado (sem exclusão física).");
      setSelecionado(null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const hojeIndicadores = new Date();
  const contagemIndicadores = indicadoresLeads(leads as never, hojeIndicadores);

  /*
    Funil comercial e Mesa de Discovery (Prancha V4, Proprietária,
    13/10/2026): mesmos `leads` já carregados por `listarLeadsDesk` acima —
    sem query nova. O funil usa o pipeline canônico já existente
    (ETAPAS_PIPELINE/etapaPipeline, CRM Vivo 27/09/2026), nunca uma etapa
    inventada. A mesa de Discovery lista só leads com call agendada ou
    realizada (`call_agendada_em`/`call_realizada_em`/`status_call`, já
    gravados pelos escritores reais) — sem lead de exemplo.
  */
  const pipelineLeads = (leads as LeadDesk[]).filter(leadValidoParaIndicadores);
  const funilItens = ETAPAS_PIPELINE.map((etapa) => {
    const total = pipelineLeads.filter((l) => etapaPipeline(l) === etapa).length;
    const percentual = pipelineLeads.length ? Math.round((total / pipelineLeads.length) * 100) : 0;
    return { rotulo: ROTULO_ETAPA_PIPELINE[etapa], valor: percentual, apoio: `${total} leads`, total };
  });
  /*
    Bloco superior de KPIs comerciais e blocos de Propostas/Saúde comercial
    (Prancha V4, 13/10/2026): investimento soma `totalInvestimentoMarketing`
    (marketing_investments real); leads entrantes e taxa de conversão vêm do
    mesmo `pipelineLeads` do funil; propostas em negociação vêm de
    `listarComercial("proposals")`, real, sem query nova além da já pedida.
  */
  const contratoCount = pipelineLeads.filter((l) => etapaPipeline(l) === "contrato").length;
  const taxaConversao = pipelineLeads.length ? Math.round((contratoCount / pipelineLeads.length) * 100) : null;
  const propostas = (qPropostas.data ?? []) as Record<string, unknown>[];
  // "Em aberto" (Decisão executiva, 13/10/2026): ainda não chegou a um estado
  // terminal do fluxo real (comercial-fluxo.ts) — nem aprovada, recusada,
  // expirada nem substituída.
  const ESTADOS_PROPOSTA_ABERTA = new Set(["rascunho", "em_revisao", "enviada", "em_negociacao"]);
  const propostasAtivas = propostas.filter((p) => !p["archived_at"] && ESTADOS_PROPOSTA_ABERTA.has(String(p["status"] ?? "")));
  const totalPropostasAtivas = propostasAtivas.reduce((soma, p) => soma + (Number(p["valor"]) || 0), 0);
  const clientesComercial = qVinculosComercial.data?.clientes ?? [];
  const nomeClienteComercial = (id: unknown) => clientesComercial.find((c) => c.id === id)?.nome ?? "—";
  const ROTULO_STATUS_PROPOSTA: Record<string, string> = {
    rascunho: "Rascunho",
    em_revisao: "Em revisão",
    enviada: "Enviada",
    em_negociacao: "Em negociação",
    aprovada: "Aprovada",
    recusada: "Recusada",
    expirada: "Expirada",
    substituida: "Substituída",
  };
  const TOM_STATUS_PROPOSTA: Record<string, "sucesso" | "critico" | "atencao" | "neutro"> = {
    aprovada: "sucesso",
    enviada: "atencao",
    em_negociacao: "atencao",
    recusada: "critico",
    expirada: "critico",
    rascunho: "neutro",
    em_revisao: "neutro",
    substituida: "neutro",
  };
  const propostasVisiveis = propostas.filter((p) => !p["archived_at"]).slice(0, 8);

  // Tons temáticos de canal (Proprietária, 13/10/2026 — "barras suaves em
  // tons temáticos", "badges de canal com cores distintas"): cicla os 3 tons
  // de marca já existentes (navy/gold/terracotta, kit.tsx) — nenhuma cor
  // nova fora do design system. Mapa estável por canal, não por posição.
  const TONS_CANAL: readonly ("navy" | "gold" | "terracotta")[] = ["navy", "gold", "terracotta"];
  const tomDoCanal = (valor: string) => TONS_CANAL[ORIGENS_LEAD.findIndex((o) => o.valor === valor) % TONS_CANAL.length] ?? "navy";
  const CLASSE_BADGE_CANAL: Record<"navy" | "gold" | "terracotta", string> = {
    navy: "border-navy/25 bg-navy/10 text-navy",
    gold: "border-gold/40 bg-gold/15 text-navy",
    terracotta: "border-terracotta/30 bg-terracotta/10 text-terracotta",
  };

  /*
    Aquisição por canal (colunas, totais absolutos) e Qualidade por canal
    (Proprietária, 13/10/2026): o mockup de referência pede uma 3ª coluna
    "Origem e qualidade" com rótulos Alta/Boa/Média — não existe fonte real
    para uma nota qualitativa por canal, então ela não entra; no lugar, a
    taxa real de conversão a contrato por canal (mesmo etapaPipeline do
    funil), que é o dado real mais próximo da intenção ("canal que mais
    converte").
  */
  const leadsPorCanal = ORIGENS_LEAD.map((o) => ({ origem: o, leads: pipelineLeads.filter((l) => l.origem === o.valor) })).filter(
    (c) => c.leads.length > 0,
  );
  const maiorCanal = Math.max(0, ...leadsPorCanal.map((c) => c.leads.length));
  const aquisicaoPorCanal = leadsPorCanal.map((c) => ({
    rotulo: c.origem.rotulo,
    valor: c.leads.length,
    destaque: c.leads.length === maiorCanal,
  }));
  const qualidadePorCanal = leadsPorCanal.map((c) => {
    const convertidos = c.leads.filter((l) => etapaPipeline(l) === "contrato").length;
    const percentual = Math.round((convertidos / c.leads.length) * 100);
    return { rotulo: c.origem.rotulo, valor: percentual, apoio: `${convertidos} de ${c.leads.length}`, tom: tomDoCanal(c.origem.valor) };
  });

  const leadsAtivosTabela = [...pipelineLeads]
    .sort((a, b) => (b.ultimo_followup_em ?? b.created_at ?? "").localeCompare(a.ultimo_followup_em ?? a.created_at ?? ""))
    .slice(0, 8);

  /*
    Quadro por etapa (Prancha Visual do Desk, kit de referência 13/09/2026,
    "sem dados reais" — layout aprovado, reconstruído aqui com leads reais):
    mesmo pipelineLeads do funil, agrupado por etapaPipeline em colunas. Dias
    parado é calculado de ultimo_followup_em/created_at real, nunca um valor
    de exemplo fixo.
  */
  const diasParado = (l: LeadDesk) => {
    const base = l.ultimo_followup_em ?? l.created_at;
    if (!base) return null;
    const d = new Date(base);
    if (Number.isNaN(d.getTime())) return null;
    return Math.floor((hojeIndicadores.getTime() - d.getTime()) / 86_400_000);
  };
  const colunasPipeline = ETAPAS_PIPELINE.map((etapa) => ({
    etapa,
    rotulo: ROTULO_ETAPA_PIPELINE[etapa],
    leads: pipelineLeads.filter((l) => etapaPipeline(l) === etapa),
  }));
  // KPIs da prancha V4 — mesmos leads do kanban: "Discovery" é a coluna
  // Discovery; "Parados" é quem mostra o chip "Lead parado há N dias" (≥ 7).
  const discoveryAbertas = colunasPipeline.find((c) => c.etapa === "discovery")?.leads.length ?? 0;
  const leadsParados = pipelineLeads.filter((l) => {
    const dias = diasParado(l);
    return dias !== null && dias >= 7;
  }).length;

  const visiveis = leads.filter((l) => {
    // CRM Vivo (27/09/2026): convertido em caso ou encerrado sai do pipeline, salvo pedido explícito.
    if (!mostrarConvertidos && leadForaDoPipeline(l as never)) return false;
    if (indicadorAtivo && !(leadValidoParaIndicadores(l as never) && leadNoIndicador(l as never, indicadorAtivo, hojeIndicadores))) return false;
    if (filtroEixo && l.eixo_comercial !== filtroEixo) return false;
    if (filtroArea && l.area_responsavel !== filtroArea) return false;
    if (filtroOrigem && l.origem !== filtroOrigem) return false;
    if (busca && !`${l.nome} ${l.codigo ?? ""} ${l.email ?? ""}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const campo = (k: string) => String((editado as Record<string, unknown>)[k] ?? "");
  const set = (k: string) => (v: unknown) => setRascunho((r) => ({ ...r, [k]: v }));
  const bool = (k: string) => Boolean((editado as Record<string, unknown>)[k]);
  const data = (k: string) => String((editado as Record<string, unknown>)[k] ?? "").slice(0, 10);

  return (
    <SaasShell titulo="CRM Vivo — Leads e triagem" descricao="Comercial → CRM Vivo: entrada, Discovery, contatos e conversas, proposta e handoff.">
      <FonteAlimento
        fonte="Entrada de leads e listas controladas do CRM Mestre (CA04)"
        consumidor="Mesa de Calls, proposta e handoff ao caso — a identidade da pessoa se mantém"
        detalheTecnico="crm-desk · listarLeadsDesk"
      />
      {leadPendente ? (
        <div role="alert" className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          Há alterações não salvas neste lead.
          <button
            type="button"
            className="rounded-md border border-terracotta/40 px-2 py-1"
            onClick={() => {
              setSelecionado(leadPendente);
              setRascunho({});
              setMsg(null);
              setLeadPendente(null);
            }}
          >
            Descartar e abrir o outro lead
          </button>
          <button type="button" className="underline" onClick={() => setLeadPendente(null)}>
            Continuar editando
          </button>
        </div>
      ) : null}
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="mb-6" aria-label="Filtros diários">
          <div id="leads-filtros" className="scroll-mt-24" />
          <Secao titulo="Filtros" descricao="Todos os campos classificatórios são listas fechadas.">
            <div className="grid gap-3">
              <Texto label="Buscar por nome, código ou e-mail" valor={busca} onChange={setBusca} />
              <Selecao label="Eixo comercial" valor={filtroEixo} opcoes={EIXO_COMERCIAL} onChange={setFiltroEixo} />
              <Selecao label="Área responsável" valor={filtroArea} opcoes={AREAS_RESPONSAVEIS} onChange={setFiltroArea} />
              <Selecao label="Origem" valor={filtroOrigem} opcoes={ORIGENS_LEAD} onChange={setFiltroOrigem} />
              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" checked={mostrarArquivados} onChange={(e) => setMostrarArquivados(e.target.checked)} />
                Mostrar arquivados
              </label>
              <button
                type="button"
                className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
                onClick={() => {
                  setNovoLeadAberto(true);
                  setMsg(null);
                }}
              >
                Novo lead
              </button>
            </div>
          </Secao>
      </div>
      {/*
        19/10/2026 — conferência bloco a bloco com a prancha V4 (Comercial /
        CRM Vivo): a ordem da prancha é 4 KPIs → cartão-cabeçalho "Funil
        comercial vivo" → trio (Aquisição | Conversão | Origem e qualidade) →
        kanban de 5 colunas. Os KPIs da prancha saem do MESMO pipelineLeads
        do funil e do kanban — nenhuma conta paralela. Os indicadores que já
        existiam (investimento, entrantes, taxa, propostas, filas clicáveis)
        continuam, abaixo do kanban, como leitura complementar.
      */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-leads-kpis-topo data-leads-kpis-prancha>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-widest text-navy/55">Leads ativos</p>
          <p className="mt-1 font-serif text-3xl leading-none text-navy">{pipelineLeads.length}</p>
          <p className="mt-1 text-[11px] text-navy/55">em cinco etapas</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-widest text-navy/55">Discovery</p>
          <p className="mt-1 font-serif text-3xl leading-none text-navy">{discoveryAbertas}</p>
          <p className="mt-1 text-[11px] text-navy/55">conversas abertas</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-widest text-navy/55">Conversão</p>
          <p className="mt-1 font-serif text-3xl leading-none text-navy">{taxaConversao === null ? "—" : `${taxaConversao}%`}</p>
          <p className="mt-1 text-[11px] text-navy/55">{taxaConversao === null ? "Sem dados suficientes" : "lead → cliente"}</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-widest text-navy/55">Parados</p>
          <p className="mt-1 font-serif text-3xl leading-none text-navy">{leadsParados}</p>
          <p className="mt-1 text-[11px] text-navy/55">com alerta visível</p>
        </div>
      </div>

      {/*
        Cartão-cabeçalho do funil (prancha V4): título, trilha das etapas e os
        dois botões. "Filtros" rola até a seção de filtros real (mesmos
        campos), "Novo lead" abre o mesmo NovoLeadDialog real — nenhum botão
        decorativo novo.
      */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm" data-leads-funil-cabecalho>
        <div className="min-w-0">
          <h2 className="font-serif text-xl text-navy">Funil comercial vivo</h2>
          <p className="mt-1 text-xs text-navy/60">Origem → Discovery → diagnóstico → proposta → contrato</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#leads-filtros"
            className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 px-3 py-1.5 text-xs font-medium text-navy hover:bg-navy/5"
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filtros
          </a>
          <button
            type="button"
            onClick={() => setNovoLeadAberto(true)}
            className="rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90"
          >
            Novo lead
          </button>
        </div>
      </section>

      {/*
        Trio infográfico central (prancha V4): os 3 gráficos aparecem sempre.
        Sem lead, Aquisição desenha as colunas de todos os canais em zero,
        Conversão desenha os 5 degraus com "0" e Origem e qualidade desenha
        os trilhos vazios — e o texto diz "Sem dados suficientes". "Origem e
        qualidade" mostra a taxa real de conversão a contrato por canal
        ("N de M"), não uma nota Alta/Boa/Média sem fonte.
      */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <CaCard
          titulo="Aquisição por canal"
          eyebrow="Comercial · Volume real por origem"
          data-leads-aquisicao-canal
          className="rounded-2xl p-6"
        >
          <GraficoColunas
            itens={aquisicaoPorCanal.length ? aquisicaoPorCanal : ORIGENS_LEAD.map((o) => ({ rotulo: o.rotulo, valor: 0 }))}
            tituloAcessivel={
              aquisicaoPorCanal.length
                ? `Aquisição por canal: ${aquisicaoPorCanal.map((c) => `${c.rotulo} ${c.valor}`).join(", ")}`
                : "Aquisição por canal: nenhum lead registrado em nenhum canal"
            }
          />
          {aquisicaoPorCanal.length ? null : (
            <p className="mt-2 text-xs text-navy/60" data-leads-aquisicao-canal-vazio>
              Sem dados suficientes
            </p>
          )}
        </CaCard>

        <CaCard
          titulo="Conversão por etapa"
          eyebrow="Comercial · Leads → Discovery → Diagnóstico → Proposta → Contrato"
          data-leads-funil
          className="rounded-2xl p-6"
        >
          <FunilDegraus
            etapas={funilItens.map((i) => ({ rotulo: i.rotulo, total: i.total }))}
            tituloAcessivel={`Funil comercial: ${funilItens
              .map((i) => (pipelineLeads.length ? `${i.rotulo} ${i.apoio} (${i.valor}%)` : `${i.rotulo} 0`))
              .join(", ")}`}
            rodape="Pipeline atual · sem recorte de período"
          />
          {pipelineLeads.length ? null : (
            <p className="mt-2 text-xs text-navy/60" data-leads-funil-vazio>
              Sem dados suficientes
            </p>
          )}
        </CaCard>

        <CaCard
          titulo="Origem e qualidade"
          eyebrow="Comercial · Taxa real de conversão a contrato"
          data-leads-qualidade-canal
          className="rounded-2xl p-6"
        >
          <BarrasHorizontais
            itens={
              qualidadePorCanal.length
                ? qualidadePorCanal
                : ORIGENS_LEAD.slice(0, 4).map((o) => ({ rotulo: o.rotulo, valor: 0, apoio: "sem lead", tom: tomDoCanal(o.valor) }))
            }
            tituloAcessivel={
              qualidadePorCanal.length
                ? `Qualidade por canal: ${qualidadePorCanal.map((c) => `${c.rotulo} ${c.valor}%`).join(", ")}`
                : "Qualidade por canal: nenhum lead registrado"
            }
          />
          {qualidadePorCanal.length ? null : (
            <p className="mt-2 text-xs text-navy/60" data-leads-qualidade-canal-vazio>
              Sem dados suficientes
            </p>
          )}
          <p className="mt-3 text-xs text-navy/70" data-leads-sem-proxima-acao>
            {contagemIndicadores.sem_proxima_acao > 0
              ? `${contagemIndicadores.sem_proxima_acao} lead(s) sem próxima ação definida.`
              : "Nenhum lead sem próxima ação."}
          </p>
        </CaCard>
      </div>

      {/*
        Kanban de 5 colunas (prancha V4): Leads · Discovery · Diagnóstico ·
        Proposta · Contrato. As colunas aparecem sempre — sem lead, cada uma
        mostra seu "0" e o vazio honesto. Cartão: nome, código · canal,
        próximo passo, alertas, responsável e data da próxima ação, todos de
        campo real do lead; "parado há N dias" vem de
        `ultimo_followup_em`/`created_at`, nunca de prazo de exemplo.
      */}
      <section className="mb-6" data-leads-quadro-etapas aria-label="Funil comercial vivo por etapa">
        <h3 className="mb-3 font-serif text-lg text-navy">Quadro por etapa</h3>
        {pipelineLeads.length === 0 ? (
          <p className="mb-3 text-sm text-navy/60" data-leads-quadro-etapas-vazio>
            Sem dados suficientes
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-leads-quadro-etapas-colunas>
          {colunasPipeline.map((coluna) => (
            <div key={coluna.etapa} className="min-w-0 rounded-2xl border border-navy/10 bg-cream/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-serif text-[11px] uppercase tracking-wide text-navy/70">{coluna.rotulo}</span>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-card px-1.5 text-[10px] font-semibold text-navy shadow-sm">
                  {coluna.leads.length}
                </span>
              </div>
              <div className="space-y-2">
                {coluna.leads.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-navy/15 px-2 py-3 text-center text-[11px] text-navy/45">
                    Nenhum lead nesta etapa.
                  </p>
                ) : (
                  coluna.leads.map((l) => {
                    const dias = diasParado(l);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setSelecionado(l.id ?? null);
                          setRascunho({});
                        }}
                        className="block w-full rounded-xl border border-navy/10 bg-card p-3 text-left shadow-sm hover:border-gold"
                      >
                        <span className="block truncate text-sm font-semibold text-navy">{l.nome}</span>
                        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-navy/55">
                          <span className="truncate">{l.codigo ?? "Sem código"}</span>
                          {l.origem ? (
                            <span className={`rounded-full border px-1.5 py-px text-[10px] font-medium ${CLASSE_BADGE_CANAL[tomDoCanal(l.origem)]}`}>
                              {rotulo("origem", l.origem)}
                            </span>
                          ) : (
                            <span>· canal não registrado</span>
                          )}
                        </span>
                        <span className="mt-2 block border-t border-navy/5 pt-2 text-[11px] text-navy/70">
                          <strong className="font-semibold text-navy">Próximo passo:</strong>{" "}
                          {l.proxima_acao ? humano(l.proxima_acao, "") : "não registrado"}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5">
                          {dias !== null && dias >= 7 ? <Etiqueta texto={`Lead parado há ${dias} dias`} tom="critico" /> : null}
                          {!l.proxima_acao ? <Etiqueta texto="Sem próxima ação" tom="atencao" /> : null}
                        </span>
                        <span className="mt-2 flex items-center justify-between gap-2 border-t border-navy/5 pt-2 text-[10px] text-navy/55">
                          <span className="flex min-w-0 items-center gap-1">
                            <User className="h-3 w-3 shrink-0" aria-hidden="true" />
                            <span className="truncate">{l.responsavel_nome || "Sem responsável"}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1 tabular-nums">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {l.proxima_acao_em ? dataBr(l.proxima_acao_em) : "Sem data"}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leitura complementar já existente (investimento, entrantes, taxa, propostas) — mesmas fontes. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-leads-kpis-complementares>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-wide text-navy/55">Investimento em Marketing</p>
          <p className="font-serif text-2xl text-navy">
            {qInvestimento.isLoading
              ? "…"
              : qInvestimento.data && qInvestimento.data.lancamentos > 0
                ? moedaBRL(qInvestimento.data.total)
                : "Sem dados suficientes"}
          </p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-wide text-navy/55">Leads Entrantes</p>
          <p className="font-serif text-2xl text-navy">{pipelineLeads.length}</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-wide text-navy/55">Taxa de Conversão</p>
          <p className="font-serif text-2xl text-navy">{taxaConversao === null ? "Sem dados suficientes" : `${taxaConversao}%`}</p>
        </div>
        <div className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-left">
          <p className="text-[11px] uppercase tracking-wide text-navy/55">Propostas em Aberto</p>
          <p className="font-serif text-2xl text-navy">
            {qPropostas.isLoading ? "…" : propostasAtivas.length ? `${propostasAtivas.length} · ${moedaBRL(totalPropostasAtivas)}` : "Sem dados suficientes"}
          </p>
        </div>
      </div>

      {/* CRM Vivo (27/09/2026): 5 indicadores acionáveis, só leads reais do pipeline. Clique filtra a lista. */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-5" data-indicadores-leads>
        {INDICADORES_LEADS.map((i) => (
          <button
            key={i.chave}
            type="button"
            data-indicador={i.chave}
            onClick={() => setIndicadorAtivo((a) => (a === i.chave ? null : i.chave))}
            className={`rounded-xl border px-3 py-2 text-left ${
              indicadorAtivo === i.chave ? "border-gold bg-gold/15" : "border-navy/10 bg-cream/40"
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-navy/55">{i.rotulo}</p>
            <p className="font-serif text-2xl text-navy">{contagemIndicadores[i.chave]}</p>
          </button>
        ))}
      </div>

      {/*
        Decisão executiva (Proprietária, 13/10/2026): duas telas no setor
        Comercial — /leads é "Comercial & Funil" (carteira, aquisição,
        propostas); Discovery Calls e qualificação (SPIN, consentimento,
        handoff) ficam em /calls, rota própria já existente. A Mesa de
        Discovery sai daqui para não duplicar a dona do dado.
      */}
      {/*
        Termômetro de conversão da carteira (Proprietária, 13/10/2026):
        mesmo cálculo real já usado no KPI "Taxa de Conversão" do topo
        (contratoCount ÷ pipelineLeads.length) — nenhuma meta mensal inventada.
      */}
      <div className="mb-6" data-leads-termometro-conversao>
        <div className="mb-1 flex items-center justify-between text-[11px] text-navy/60">
          <span>Contratos fechados sobre o total de oportunidades</span>
          <span className="tabular-nums">
            {taxaConversao === null ? "Sem dados suficientes" : `${contratoCount} de ${pipelineLeads.length} · ${taxaConversao}%`}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full bg-gold" style={{ width: `${taxaConversao ?? 0}%` }} />
        </div>
      </div>

      {/*
        Bloco 4 — Propostas comerciais (Prancha V4, 13/10/2026): mesma
        `listarComercial("proposals")` que já alimenta Financeiro/Formalização
        — sem campo inventado (o schema real não tem "rota consular", então
        a coluna não existe aqui). Status real do fluxo de propostas
        (comercial-fluxo.ts), nunca "aceita" fictício.
      */}
      <CaCard
        titulo="Propostas comerciais"
        eyebrow="Comercial · Emitidas, por status real do fluxo"
        data-leads-propostas
        className="mb-6 rounded-2xl p-6"
      >
        {qPropostas.isLoading ? (
          <CarregandoDesk linhas={3} rotulo="Carregando as propostas comerciais" />
        ) : propostasVisiveis.length === 0 ? (
          <p className="text-sm text-navy/60" data-leads-propostas-vazio>
            Sem dados suficientes
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-navy/10">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-navy/65">
                <tr>
                  <th className="px-3 py-2">Cliente</th>
                  <th className="px-3 py-2">Valor</th>
                  <th className="px-3 py-2">Forma de pagamento</th>
                  <th className="px-3 py-2">Validade</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {propostasVisiveis.map((p) => (
                  <tr key={String(p["id"])} className="border-t border-navy/5">
                    <td className="px-3 py-2 text-navy">{nomeClienteComercial(p["client_id"])}</td>
                    <td className="px-3 py-2 text-navy">{moedaBRL(p["valor"], p["moeda"])}</td>
                    <td className="px-3 py-2 text-navy/75">{humano(String(p["forma_pagamento"] ?? ""), "—")}</td>
                    <td className="px-3 py-2 text-navy/75">{dataBr(p["validade"])}</td>
                    <td className="px-3 py-2">
                      <Etiqueta
                        texto={ROTULO_STATUS_PROPOSTA[String(p["status"] ?? "")] ?? "—"}
                        tom={TOM_STATUS_PROPOSTA[String(p["status"] ?? "")] ?? "neutro"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CaCard>

      {/*
        Bloco 5 — Leads ativos (Prancha V4, 13/10/2026): mesmos `leads` já
        carregados, ordenados por último contato real — a ficha completa
        continua na gestão abaixo (filtros + editor), este é o resumo.
      */}
      <CaCard
        titulo="Leads ativos"
        eyebrow="Comercial · Por último contato"
        data-leads-ativos-tabela
        className="mb-6 rounded-2xl p-6"
      >
        {leadsAtivosTabela.length === 0 ? (
          <p className="text-sm text-navy/60" data-leads-ativos-vazio>
            Nenhum lead ativo no pipeline.
          </p>
        ) : (
          <ul className="space-y-4">
            {leadsAtivosTabela.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Pessoa nome={l.nome} papel={humano(l.responsavel_nome ?? "", "sem responsável")} />
                  {l.origem ? (
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${CLASSE_BADGE_CANAL[tomDoCanal(l.origem)]}`}>
                      {rotulo("origem", l.origem)}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-navy/60">
                  <span className="hidden sm:inline">
                    {l.proxima_acao ? `Próxima ação: ${l.proxima_acao}` : "Sem próxima ação"}
                  </span>
                  <button
                    type="button"
                    className="rounded-full border border-navy/15 px-2 py-1 text-[11px] text-navy/70 hover:bg-navy/5"
                    onClick={() => {
                      setSelecionado(l.id ?? null);
                      setRascunho({});
                    }}
                  >
                    Abrir ficha
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CaCard>

      <label className="mb-4 flex items-center gap-2 text-xs text-navy/70">
        <input type="checkbox" checked={mostrarConvertidos} onChange={(e) => setMostrarConvertidos(e.target.checked)} />
        Mostrar convertidos/encerrados (fora do pipeline)
      </label>
      <NovoLeadDialog
        aberto={novoLeadAberto}
        onFechar={() => setNovoLeadAberto(false)}
        onCriado={(id) => {
          setNovoLeadAberto(false);
          setRascunho({});
          setSelecionado(id);
          setMsg("Lead criado em Triagem.");
        }}
      />
      {/*
        17/10/2026 — Correção da Proprietária: a ficha de edição completa
        do lead (36 campos, organizada em seções: SPIN, radar, handoff,
        jornada) vira gaveta (Sheet) aberta por "Abrir ficha", em vez de
        montar inline ao lado da lista na carteira inicial. Mesmo
        conteúdo, mesma lógica — só a superfície muda.
      */}
      <div className="max-w-[420px]">
        <div className="space-y-3">
          <button
            type="button"
            id="leads-triagem-scan"
            className="rounded-lg border border-navy/20 px-3 py-2 text-xs font-medium text-navy hover:bg-navy/5"
            onClick={() => setScanAberto(true)}
          >
            Importar triagem do AncestralScan
          </button>
          <Sheet open={scanAberto} onOpenChange={setScanAberto}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Triagem do AncestralScan</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ImportarTriagemScan />
              </div>
            </SheetContent>
          </Sheet>



          <Secao titulo={`Leads (${visiveis.length})`} descricao="Código único gerado pelo sistema.">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data as LeadComPendencias[] | undefined}
              aoTentarNovamente={() => void q.refetch()}
              recurso="os leads"
              vazio="Nenhum lead cadastrado ainda."
            >
              {() => (
            <ul className="max-h-[520px] space-y-2 overflow-auto">
              {visiveis.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (l.id === selecionado) return;
                      // Corte 1: trocar de lead com edição pendente pede confirmação.
                      if (Object.keys(rascunho).length > 0) {
                        setLeadPendente(l.id ?? null);
                        return;
                      }
                      setSelecionado(l.id ?? null);
                      setRascunho({});
                      setMsg(null);
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      selecionado === l.id ? "border-gold bg-cream/60" : "border-navy/10 bg-cream/40"
                    }`}
                  >
                    <span className="block font-medium text-navy">
                      {l.codigo ?? "—"} · {l.nome}
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-navy/55" data-etapa-pipeline>
                        {leadForaDoPipeline(l as never) ? "Fora do pipeline" : ROTULO_ETAPA_PIPELINE[etapaPipeline(l)]}
                      </span>
                      {l.dados_teste ? (
                        <span className="ml-2 rounded border border-navy/20 bg-cream px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wide text-navy/60">
                          dado de teste
                        </span>
                      ) : null}
                    </span>

                    <span className="block text-[11px] text-navy/55">
                      {rotulo("eixo_comercial", l.eixo_comercial)} · {rotulo("eixo_formalizacao", l.eixo_formalizacao)} ·{" "}
                      {resultadoComercialDerivado(l)}
                    </span>
                    {l.pendencias?.length ? (
                      <span className="mt-1 block text-[11px] text-terracotta">{l.pendencias.length} pendência(s)</span>
                    ) : null}
                    {l.archived_at ? <span className="block text-[11px] text-navy/40">Arquivado</span> : null}
                  </button>
                </li>
              ))}
              {!visiveis.length ? (
                <li className="text-sm text-navy/50">Nenhum lead nos filtros.</li>
              ) : null}
            </ul>
              )}
            </EstadoDados>
          </Secao>
        </div>

      </div>

      <Sheet
        open={Boolean(atual)}
        onOpenChange={(open) => {
          if (!open) {
            setSelecionado(null);
            setRascunho({});
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{atual ? `${atual.codigo ?? "Lead"} · ${atual.nome}` : "Ficha do lead"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <FichaSecoes>
          {atual ? <div className="mb-4 border-b border-border pb-4 text-sm text-navy">
            <Pessoa nome={atual.nome} papel={atual.responsavel_nome || "Responsável não registrado"} />
            <p className="mt-2 break-words">{atual.email || "E-mail não registrado"}</p>
            <p className="mt-1">Próxima ação: {atual.proxima_acao ? rotulo("proxima_acao", atual.proxima_acao) : "Não registrado"}</p>
            <p className="text-xs text-muted-foreground">Prazo: {atual.proxima_acao_em ? dataBr(atual.proxima_acao_em) : "Não registrado"} · {Object.keys(rascunho).length ? "Alterações em rascunho" : "Registro salvo"}</p>
          </div> : null}
          {msg ? <p className="rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm text-navy">{msg}</p> : null}

          {/*
            19/10/2026 — corte L03 (Prancha V4): identidade da pessoa sempre
            visível no topo da ficha (nome, origem, etapa, responsável,
            próxima ação), antes de qualquer leitura derivada. Só repete
            fatos já registrados; ausências são explícitas.
          */}
          {atual ? (
            <div className="rounded-xl border border-navy/15 bg-navy px-4 py-3 text-cream" data-l03-identidade>
              <p className="font-serif text-lg leading-tight">{atual.nome || "Nome não registrado"}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-4">
                <div>
                  <dt className="uppercase tracking-wide text-cream/55">Origem</dt>
                  <dd>{atual.origem ? rotulo("origem", atual.origem) : "Não registrado"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-cream/55">Etapa</dt>
                  <dd>{ROTULO_ETAPA_PIPELINE[etapaPipeline(atual)]}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-cream/55">Responsável</dt>
                  <dd>{atual.responsavel_nome || "Não registrado"}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-cream/55">Próxima ação</dt>
                  <dd>
                    {atual.proxima_acao ? rotulo("proxima_acao", atual.proxima_acao) : "Não registrado"}
                    {atual.proxima_acao_em ? ` · ${String(atual.proxima_acao_em).slice(0, 10).split("-").reverse().join("/")}` : ""}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {atual ? (
            <div className="flex flex-wrap gap-2 rounded-xl border border-navy/10 bg-cream/40 px-3 py-2 text-xs">
              {atual.case_id ? (
                <Link
                  to="/casos/$caseId"
                  params={{ caseId: atual.case_id }}
                  className="rounded-lg border border-navy/20 px-2.5 py-1.5 font-medium text-navy underline-offset-2 hover:underline"
                >
                  Abrir Caso 360
                </Link>
              ) : (
                <span className="rounded-lg border border-navy/10 px-2.5 py-1.5 text-navy/50">Sem caso vinculado</span>
              )}
              {atual.cliente_id ? (
                <Link
                  to="/pessoas/$clienteId"
                  params={{ clienteId: atual.cliente_id }}
                  className="rounded-lg border border-gold/50 bg-gold/10 px-2.5 py-1.5 font-medium text-navy underline-offset-2 hover:underline"
                >
                  Abrir Pessoa 360
                </Link>
              ) : (
                <span className="rounded-lg border border-navy/10 px-2.5 py-1.5 text-navy/50">
                  Pessoa 360 após vínculo com cliente/caso
                </span>
              )}
            </div>
          ) : null}

          {atual ? <details className="py-2"><summary className="cursor-pointer text-sm text-navy">Resumo do handoff e jornada</summary><HandoffLead lead={editado} /><DerivacaoJornada lead={editado} /></details> : null}

          <details className="border-b border-border py-3">
            <summary className="cursor-pointer text-sm text-navy">Progresso SPIN e Mesa de Discovery</summary>
            <p className="text-sm font-medium text-navy">SPIN e Mesa de Discovery</p>
            <p className="mt-1 text-xs text-navy/55">
              As perguntas de Situação, Problema, Implicação e Necessidade moram no Painel de Calls,
              uma por vez, com resposta e destino. Aqui só aparece o progresso derivado — sem
              checkbox.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-4">
              {progressoSpin(editado).map((e) => {
                const meta = ETAPAS_SPIN.find((x) => x.chave === e.chave);
                return (
                  <li key={e.chave} className="rounded-lg border border-navy/10 bg-cream/40 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-navy/50">{e.rotulo}</p>
                    <p className="font-serif text-lg tabular-nums text-navy">
                      {e.preenchidas}/{e.total}
                    </p>
                    <p className="text-[10px] text-navy/50">{meta?.paraQue}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs">
              <Link to="/calls" search={editado.id ? { lead: editado.id } : {}} className="text-navy underline underline-offset-2">
                Abrir a Mesa de Discovery no Painel de Calls
              </Link>
            </p>
          </details>

          <details className="border-b border-border py-3">
            <summary className="cursor-pointer text-sm text-navy">Leitura preliminar e pendências</summary>
            <p className="text-[11px] uppercase tracking-wide text-navy/45">Radar de elegibilidade preliminar</p>
            <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="font-serif text-2xl leading-tight text-navy">{radar.rotulo}</p>
              <p className="text-xs text-navy/55">
                confiança <strong className="text-navy/75">{radar.confianca}</strong> · completude{" "}
                <strong className="text-navy/75">{radar.completude}%</strong> dos fatores registrados
              </p>
            </div>
            <p className="mt-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-navy/75">
              Triagem preliminar interna ({radar.versao}). Não é parecer jurídico, não garante direito e não define prazo,
              produto ou preço. Mesmo um sinal forte depende de documentos, fontes e revisão humana.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">O que favorece</p>
                <ul className="mt-1 space-y-1 text-xs text-navy/70">
                  {radar.favoraveis.length ? (
                    radar.favoraveis.map((f) => <li key={f}>• {f}</li>)
                  ) : (
                    <li>Nenhum fator registrado ainda.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">O que precisa confirmar</p>
                <ul className="mt-1 space-y-1 text-xs text-navy/70">
                  {radar.pendentes.length ? (
                    radar.pendentes.slice(0, 6).map((p) => (
                      <li key={p.fator}>
                        • <strong>{p.fator}</strong>: {p.acao}
                      </li>
                    ))
                  ) : (
                    <li>Sem pendências de fator nesta leitura.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/45">Próximo passo</p>
                <p className="mt-1 text-xs text-navy/75">
                  {radar.exige_revisao_humana
                    ? "Levar a leitura para revisão humana antes de qualquer recomendação, proposta ou comunicação externa."
                    : radar.pendentes.length
                      ? `Confirmar com o cliente: ${radar.pendentes[0]?.fator}.`
                      : "Registrar decisão de Discovery e encaminhar o handoff comercial."}
                </p>
              </div>
            </div>
            {radar.bloqueios_externos.length ? (
              <ul className="mt-3 space-y-1 rounded-lg border border-terracotta/40 bg-terracotta/5 p-2 text-xs text-terracotta">
                {radar.bloqueios_externos.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 text-[11px] text-navy/50">{radar.observacao}</p>
          </details>

          {sinais.length ? (
            <div className="rounded-xl border border-gold/50 bg-gold/10 p-4">
              <p className="text-sm font-medium text-navy">Sinais de qualidade da ficha</p>
              <ul className="mt-2 space-y-1 text-xs text-navy/75">
                {sinais.map((s) => (
                  <li key={s.chave}>
                    <strong>{s.rotulo}</strong>: {s.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}


          {erros.length ? (
            <div className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4">
              <p className="text-sm font-medium text-terracotta">
                {errosBloqueantes.length ? "Pendências que impedem esta gravação" : "Pendências anteriores da ficha"}
              </p>
              {!errosBloqueantes.length ? (
                <p className="mt-1 text-xs text-navy/65">
                  Você pode salvar os outros campos. Para corrigir uma destas classificações, escolha um valor da lista atual.
                </p>
              ) : null}
              <ul className="mt-2 space-y-1 text-xs text-navy/70">
                {erros.map((e) => (
                  <li key={`${e.campo}-${e.motivo}`}>
                    <strong>{e.campo}</strong>: {e.motivo}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/*
            19/10/2026 — corte L03: tudo que se edita na ficha mora nesta
            área única, abaixo deste divisor. Leituras derivadas (SPIN,
            radar, sinais) ficam acima e não se editam aqui.
          */}
          <div className="flex items-center gap-3 pt-2" data-l03-area-edicao>
            <span className="h-px flex-1 bg-navy/15" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/50">
              Área única de edição — as leituras acima são derivadas
            </p>
            <span className="h-px flex-1 bg-navy/15" aria-hidden />
          </div>

          <FichaSecao titulo="Identificação e responsabilidade" descricao="Lead ativo exige área, responsável e próxima ação datada.">
            <div className="grid gap-3 md:grid-cols-2">
              <Texto
                label="Nome"
                valor={campo("nome")}
                onChange={set("nome")}
                erro={motivoCampoInvalido("Nome", "nome", String(campo("nome") ?? ""))}
              />
              <Texto label="Código" valor={String(editado.codigo ?? "gerado ao salvar")} onChange={() => {}} desabilitado />
              <Texto
                label="E-mail"
                tipo="email"
                valor={campo("email")}
                onChange={set("email")}
                erro={motivoCampoInvalido("E-mail", "email", String(campo("email") ?? ""))}
              />
              <Texto
                label="Telefone"
                valor={campo("telefone")}
                onChange={(x) => set("telefone")(formatarTelefone(x))}
                erro={motivoCampoInvalido("Telefone", "telefone", String(campo("telefone") ?? ""))}
              />
              {/*
                19/10/2026 — Diretriz v2.0 (Reintegração micro GoLive): chip de
                um toque do dicionário CA-04 ("Origem do lead"), mesma lista
                `ORIGENS_LEAD` e mesmo campo `set("origem")` de antes — só a
                forma de escolher muda de dropdown para clique direto.
              */}
              <ChipsEscolha label="Origem" valor={campo("origem")} opcoes={ORIGENS_LEAD} onChange={set("origem")} />
              <Selecao
                label="Área responsável"
                valor={campo("area_responsavel")}
                opcoes={AREAS_RESPONSAVEIS}
                onChange={set("area_responsavel")}
              />
              <Texto
                label="Responsável nominal"
                valor={campo("responsavel_nome")}
                onChange={set("responsavel_nome")}
              />
              <Selecao
                label="Próxima ação"
                valor={campo("proxima_acao")}
                opcoes={PROXIMAS_ACOES}
                onChange={set("proxima_acao")}
              />
              <Texto
                label="Data da próxima ação"
                tipo="date"
                valor={data("proxima_acao_em")}
                onChange={set("proxima_acao_em")}
              />
              <Texto
                label="Último follow-up"
                tipo="date"
                valor={data("ultimo_followup_em")}
                onChange={set("ultimo_followup_em")}
              />
            </div>
          </FichaSecao>

          <FichaSecao titulo="Objetivo e linha preliminar" descricao="Leitura interna preliminar; não é parecer jurídico.">
            <div className="grid gap-3 md:grid-cols-2">
              {/* 19/10/2026 — chip de um toque (dicionário CA-04 "Objetivo principal"/interesse do lead). */}
              <ChipsEscolha label="Objetivo" valor={campo("objetivo")} opcoes={OBJETIVOS} onChange={set("objetivo")} />
              {/* CRM Vivo (27/09/2026): país de interesse tem um só campo editável —
                  "Nacionalidades de interesse", abaixo. O valor único antigo fica só leitura. */}
              {campo("nacionalidade") ? (
                <div data-nacionalidade-legado>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Nacionalidade (registro antigo)</p>
                  <p className="mt-1 text-sm text-navy">
                    {NACIONALIDADES.find((o) => o.valor === campo("nacionalidade"))?.rotulo ?? campo("nacionalidade")}
                  </p>
                  <p className="text-[11px] text-navy/50">Use “Nacionalidades de interesse” para registrar países.</p>
                </div>
              ) : null}
              <Selecao
                label="Hipótese de rota — via preliminar (pendente de validação humana)"
                valor={campo("via_juridica_preliminar")}
                opcoes={VIAS_JURIDICAS}
                onChange={set("via_juridica_preliminar")}
              />
              <Selecao
                label="Status da via"
                valor={campo("status_via")}
                opcoes={STATUS_VIA}
                onChange={set("status_via")}
              />
              <div className="md:col-span-2">
                <Texto
                  label="Narrativa familiar (texto livre)"
                  area
                  valor={campo("narrativa_familiar")}
                  onChange={set("narrativa_familiar")}
                />
              </div>
            </div>
          </FichaSecao>

          {/*
            23/09/2026 — R3 (autorização explícita da Proprietária):
            /calls vira a única superfície editável de call, Discovery,
            triagem e elegibilidade preliminar. Os dois formulários que
            viviam aqui (Discovery, Triagem preliminar) tinham o único
            writer destes campos, mas nunca eram a tela usada durante a
            call — mesmo defeito já corrigido para SPIN em 09/09/2026
            (ver bloco "SPIN e Mesa de Discovery" acima). Nenhum dado é
            apagado: os campos e o histórico continuam os mesmos em
            `leads`, só o formulário de edição muda de tela.
          */}
          <Secao
            titulo="Discovery e triagem preliminar"
            descricao="Edição concentrada no Painel de Calls — aqui só o resumo derivado, sem formulário duplicado."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Status da call</p>
                <p className="text-sm text-navy">{rotulo("status_call", editado.status_call)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Resultado da Discovery</p>
                <p className="text-sm text-navy">{rotulo("discovery_resultado", editado.discovery_resultado)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Call agendada em</p>
                <p className="text-sm text-navy">
                  {editado.call_agendada_em ? String(editado.call_agendada_em).slice(0, 16).replace("T", " ") : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-navy/50">Elegibilidade preliminar</p>
                <p className="text-sm text-navy">
                  {rotulo("elegibilidade_preliminar", editado.elegibilidade_preliminar)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs">
              <Link
                to="/calls"
                search={editado.id ? { lead: editado.id } : {}}
                className="text-navy underline underline-offset-2"
              >
                Abrir Discovery e triagem no Painel de Calls
              </Link>
            </p>
            {/*
              24/09/2026 (P1 — uma identidade do lead ao caso): a conversão
              é uma ação só, executarHandoffDiscovery, na Mesa de Discovery.
              Daqui ela abre já com este lead; nenhum segundo writer. Com caso
              já vinculado, mostra o caso em vez de oferecer nova conversão.
            */}
            {editado.id ? (
              <p className="mt-2 text-xs" data-lead-conversao>
                {editado.case_id ? (
                  <Link
                    to="/casos/$caseId"
                    params={{ caseId: String(editado.case_id) }}
                    className="font-medium text-navy underline underline-offset-2"
                  >
                    Convertido: abrir o caso vinculado
                  </Link>
                ) : (
                  <Link
                    to="/calls"
                    search={{ lead: editado.id }}
                    className="font-medium text-navy underline underline-offset-2"
                  >
                    Converter em cliente/pessoa canônica
                  </Link>
                )}
              </p>
            ) : null}
          </Secao>

          <Secao
            titulo="Dossiê-mãe autorizado"
            descricao="Dossiê só fica ativo com identificação, ambiente autorizado, link interno, nível de acesso e responsável nominal. Nada disso aparece em área de cliente."
          >
            {/* CRM Vivo (27/09/2026): o dono do dossiê-mãe é o Núcleo familiar
                (nucleos_familiares.dossie_*). Aqui é só leitura do que o lead já tinha. */}
            <div className="grid gap-2 text-sm text-navy md:grid-cols-2" data-dossie-somente-leitura>
              <p>Ativo no lead: {bool("dossie_ativo") ? "sim" : "não"}</p>
              <p>Referência: {campo("dossie_mae_ref") || "—"}</p>
              <p>Ambiente: {AMBIENTES_DOSSIE.find((o) => o.valor === campo("dossie_ambiente"))?.rotulo ?? (campo("dossie_ambiente") || "—")}</p>
              <p>Nível de acesso: {NIVEIS_ACESSO_DOSSIE.find((o) => o.valor === campo("dossie_nivel_acesso"))?.rotulo ?? (campo("dossie_nivel_acesso") || "—")}</p>
              <p>Responsável: {campo("dossie_responsavel") || "—"}</p>
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Dossiê-mãe é do Núcleo familiar.{" "}
              <Link to="/nucleos" className="underline decoration-gold underline-offset-2">
                Abrir Núcleos
              </Link>
            </p>
          </Secao>


          <FichaSecao
            titulo="Consentimento de gravação e transcrição"
            descricao="Gravação, transcrição e uso interno só com consentimento concedido, datado, com canal e versão do aviso. Sem isso, nenhuma referência de gravação pode ser registrada."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Status do consentimento"
                valor={campo("consentimento_status")}
                opcoes={CONSENTIMENTO_STATUS}
                onChange={set("consentimento_status")}
              />
              <Texto
                label="Data/hora do consentimento"
                tipo="datetime-local"
                valor={String(editado.consentimento_em ?? "").slice(0, 16)}
                onChange={set("consentimento_em")}
              />
              <Selecao
                label="Canal do consentimento"
                valor={campo("consentimento_canal")}
                opcoes={CANAIS_CONSENTIMENTO}
                onChange={set("consentimento_canal")}
              />
              <Texto
                label="Versão do aviso apresentada"
                valor={campo("consentimento_versao_aviso")}
                onChange={set("consentimento_versao_aviso")}
                ajuda={`Aviso publicado hoje: ${AVISO_PRIVACIDADE.versao}`}
              />
              <Texto
                label="Gravação (referência interna)"
                valor={campo("gravacao_link_interno")}
                onChange={set("gravacao_link_interno")}
                ajuda={
                  campo("consentimento_status") !== "concedido"
                    ? "Pendência: consentimento ainda não consta como concedido. O campo segue editável e a pendência é registrada na gravação."
                    : undefined
                }
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("consentimento_gravacao")}
                  onChange={(e) => set("consentimento_gravacao")(e.target.checked)}
                />
                Consentimento confirmado na conversa
              </label>
            </div>
            {/*
              03/10/2026 (D-01) — autorização literal: "pode ligar o gate de
              consentimento aos 11 leads lembrando que temos a politica de
              privacidade e anexo de lgpd em contrato esse gate é no desk".

              O gate já existia por lead, mas exigia quatro campos digitados à
              mão, um deles a versão do aviso — e o banco recusa "concedido"
              sem data, canal E versão (trigger de 21/08). Resultado medido:
              nenhum lead com consentimento registrado. Este botão escreve os
              quatro de uma vez, com a base que ela nomeou. Ele preenche o
              formulário; quem grava continua sendo o salvar, validado no
              servidor — a tela não decide consentimento por ninguém.
            */}
            <div className="mt-3 space-y-2 rounded-lg border border-gold/40 bg-gold/5 p-3">
              <p className="text-xs text-navy/70">
                Base registrada: aviso de privacidade publicado em{" "}
                <a href={AVISO_PRIVACIDADE.url} target="_blank" rel="noreferrer" className="underline decoration-gold">
                  {AVISO_PRIVACIDADE.url}
                </a>{" "}
                e {AVISO_PRIVACIDADE.anexoContratual}.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy hover:bg-navy/5"
                  onClick={() => {
                    const agora = new Date().toISOString().slice(0, 16);
                    setRascunho((r) => ({
                      ...r,
                      consentimento_status: "concedido",
                      consentimento_em: agora,
                      consentimento_canal: "aviso_site",
                      consentimento_versao_aviso: AVISO_PRIVACIDADE.versao,
                    }));
                  }}
                >
                  Preencher pelo aviso publicado no site
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy hover:bg-navy/5"
                  onClick={() => {
                    const agora = new Date().toISOString().slice(0, 16);
                    setRascunho((r) => ({
                      ...r,
                      consentimento_status: "concedido",
                      consentimento_em: agora,
                      consentimento_canal: "anexo_lgpd_contrato",
                      consentimento_versao_aviso: AVISO_PRIVACIDADE.versao,
                    }));
                  }}
                >
                  Preencher pelo anexo de privacidade e LGPD do contrato
                </button>
              </div>
              <p className="text-[11px] text-navy/50">
                Revise a data e o canal antes de salvar. Consentimento é ato da pessoa: o botão registra a base
                documental, não substitui o consentimento de quem não o deu.
              </p>
            </div>
          </FichaSecao>

          {trilhasIndisponiveis ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-navy/80"
            >
              Não foi possível carregar as trilhas e marcos jurídicos. As listas de trilha e marco abaixo estão
              vazias por falha de carga, não por ausência de cadastro.{" "}
              <button type="button" className="underline" onClick={() => void qTrilhas.refetch()}>
                Tentar novamente
              </button>
            </p>
          ) : null}

          <FichaSecao
            titulo="Linha familiar, trilha jurídica e pesquisa prévia"
            descricao="Trilhas e marcos são referência interna de triagem, nunca parecer jurídico nem garantia de direito. Pesquisa nominal externa exige autorização registrada."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="País/linha prioritária"
                valor={campo("pais_linha_prioritaria")}
                opcoes={PAISES_LINHA_PRIORITARIA}
                onChange={set("pais_linha_prioritaria")}
              />
              <Texto
                label="Localidades conhecidas (comuna, paróquia, província)"
                valor={campo("localidades_conhecidas")}
                onChange={set("localidades_conhecidas")}
              />
              {/* 19/10/2026 — chip de um toque, multi-escolha (dicionário CA-04 "Nacionalidade de interesse"). */}
              <ChipsEscolha
                label="Nacionalidades de interesse"
                opcoes={NACIONALIDADES}
                multiplo
                valores={(editado.nacionalidades_interesse ?? []) as string[]}
                onChange={set("nacionalidades_interesse")}
              />
              <MultiSelecao
                label="Documentos-chave já indicados"
                opcoes={DOCUMENTOS_CHAVE}
                valores={(editado.documentos_chave ?? []) as string[]}
                onChange={set("documentos_chave")}
              />
              <Selecao
                label="Trilha jurídica de referência"
                valor={campo("trilha_referencia_id")}
                opcoes={opcoesTrilhas}
                onChange={set("trilha_referencia_id")}
              />
              <Selecao
                label="Marco jurídico de referência"
                valor={campo("marco_referencia_id")}
                opcoes={opcoesMarcos}
                onChange={set("marco_referencia_id")}
              />
              <Selecao
                label="Autorização de pesquisa prévia"
                valor={campo("pesquisa_previa_autorizacao")}
                opcoes={PESQUISA_PREVIA_AUTORIZACAO}
                onChange={set("pesquisa_previa_autorizacao")}
              />
              <Texto
                label="Limite declarado da pesquisa prévia"
                valor={campo("pesquisa_previa_limite")}
                onChange={set("pesquisa_previa_limite")}
              />
              <MultiSelecao
                label="Escopo autorizado da pesquisa prévia"
                opcoes={PESQUISA_PREVIA_ESCOPO}
                valores={(editado.pesquisa_previa_escopo ?? []) as string[]}
                onChange={set("pesquisa_previa_escopo")}
              />
              {trilhaSelecionada ? (
                <div className="md:col-span-2 rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs text-navy/70">
                  <p className="font-medium text-navy">
                    {trilhaSelecionada.pais} · {trilhaSelecionada.track_name} — {rotulo("status_via", trilhaSelecionada.status_via)}
                  </p>
                  {trilhaSelecionada.legal_reference_summary ? <p className="mt-1">{trilhaSelecionada.legal_reference_summary}</p> : null}
                  <p className="mt-1">
                    Uso interno de triagem. Não apresentar como parecer, garantia de direito, prazo ou instrução ao cliente.
                  </p>
                </div>
              ) : null}
            </div>
          </FichaSecao>


          <FichaSecao
            titulo="Recomendação comercial e despesas de terceiros"
            descricao="Preço, condição e link de cobrança vêm do catálogo homologado (product_catalog). A Planilha Mestre é legado de auditoria histórica, não fonte viva. O CRM registra apenas a recomendação e a referência."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-navy">Produtos/serviços recomendados</p>
                <div className="grid gap-1 md:grid-cols-3">
                  {PRODUTOS_RECOMENDADOS.map((o) => {
                    const atuais = (editado.produtos_recomendados ?? []) as string[];
                    return (
                      <label key={o.valor} className="flex items-center gap-2 text-sm text-navy/80">
                        <input
                          type="checkbox"
                          checked={atuais.includes(o.valor)}
                          onChange={(e) =>
                            set("produtos_recomendados")(
                              e.target.checked ? [...atuais, o.valor] : atuais.filter((v) => v !== o.valor),
                            )
                          }
                        />
                        {o.rotulo}
                      </label>
                    );
                  })}
                </div>
              </div>
              {/* Catálogo/SKU/Planilha Mestre é legado: não governa proposta, preço nem escopo. */}
              <div data-sku-legado>
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Referência de SKU</p>
                <p className="mt-1 text-sm text-navy">{campo("sku_referencia") || "—"}</p>
                <p className="text-[11px] text-navy/50">Legado (catálogo/SKU) — não governa proposta, preço nem escopo.</p>
              </div>
              <Selecao label="Status das despesas de terceiros" valor={campo("despesas_terceiros_status")} opcoes={DESPESAS_TERCEIROS_STATUS} onChange={set("despesas_terceiros_status")} />
              <Selecao label="Regra de pagamento das despesas" valor={campo("despesas_terceiros_regra")} opcoes={DESPESAS_TERCEIROS_REGRA} onChange={set("despesas_terceiros_regra")} />
              <Selecao label="Faixa estimada de despesas" valor={campo("despesas_terceiros_faixa")} opcoes={DESPESAS_TERCEIROS_FAIXA} onChange={set("despesas_terceiros_faixa")} />
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Despesas de terceiros são sempre do cliente: o Clube não antecipa nem reembolsa. Nenhum valor ou link de cobrança é editável aqui.
            </p>
            {/*
              Frente 2 (19/10/2026): conecta esta tela à fonte real de
              Produto-Pai — PP-01–09, planner_catalog_feed — para a
              recomendação acima ser escolhida olhando o catálogo vivo, não
              só rótulos fixos. Mesmo componente de /catalogo; sem query nova.
            */}
            <div data-leads-produto-pai-real className="mt-4">
              <PlanejadorProdutosPai />
            </div>
          </FichaSecao>

          <FichaSecao
            titulo="Comercial e formalização"
            descricao="Preço, SKU e link de pagamento não são campo livre: registre apenas referência interna."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Selecao
                label="Eixo comercial"
                valor={campo("eixo_comercial")}
                opcoes={EIXO_COMERCIAL}
                onChange={set("eixo_comercial")}
              />
              <Selecao
                label="Eixo de formalização"
                valor={campo("eixo_formalizacao")}
                opcoes={EIXO_FORMALIZACAO}
                onChange={set("eixo_formalizacao")}
              />
              <Selecao
                label="Serviço inicial aprovado"
                valor={campo("servico_inicial_aprovado")}
                opcoes={SERVICOS_INICIAIS}
                onChange={set("servico_inicial_aprovado")}
              />
              <Selecao
                label="Motivo de perda"
                valor={campo("motivo_perda")}
                opcoes={MOTIVOS_PERDA}
                onChange={set("motivo_perda")}
              />
              <Texto
                label="Link interno da proposta"
                valor={campo("proposta_link_interno")}
                onChange={set("proposta_link_interno")}
              />
              <Texto
                label="Referência interna da proposta"
                valor={campo("proposta_referencia_interna")}
                onChange={set("proposta_referencia_interna")}
              />
              <Texto
                label="Link interno do contrato"
                valor={campo("contrato_link_interno")}
                onChange={set("contrato_link_interno")}
              />
              <Texto
                label="Referência do evento Asaas"
                valor={campo("asaas_evento_referencia")}
                onChange={set("asaas_evento_referencia")}
                ajuda="Somente referência ao evento transacional; nenhum valor ou link é criado aqui."
              />
              <Texto
                label="Pagamento previsto para"
                tipo="date"
                valor={data("pagamento_previsto_em")}
                onChange={set("pagamento_previsto_em")}
              />
              <label className="flex items-end gap-2 text-sm text-navy">
                <input
                  type="checkbox"
                  checked={bool("dados_teste")}
                  onChange={(e) => set("dados_teste")(e.target.checked)}
                />
                Registro de teste (excluído das métricas)
              </label>
            </div>
            <p className="mt-3 text-xs text-navy/55">
              Resultado comercial derivado: <strong>{resultadoComercialDerivado(editado)}</strong>
            </p>
          </FichaSecao>

          <div className="sticky bottom-0 flex flex-wrap items-start gap-2 border-t border-border bg-background py-3">
            {Object.keys(rascunho).length ? (
              <AcaoOperacional
                rotulo={mutSalvar.isPending ? "Gravando…" : "Gravar"}
                capacidade="editar_rascunho"
                pendenciaGate={
                  errosBloqueantes.length
                    ? errosBloqueantes.map((e) => `${e.campo}: ${e.motivo}`).join("; ")
                    : null
                }
                efeito="Grava as alterações desta ficha de lead."
                onConfirmar={async () => {
                  await mutSalvar.mutateAsync();
                }}
              />
            ) : (
              <button
                type="button"
                disabled
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
              >
                Gravar
              </button>
            )}
            {atual?.id && !atual.archived_at ? (
              <AcaoOperacional
                rotulo="Arquivar"
                variant="outline"
                capacidade="editar_rascunho"
                efeito="Arquiva o lead sem exclusão física. O registro continua consultável."
                onConfirmar={async (motivo) => {
                  await mutArquivar.mutateAsync(motivo);
                }}
              />
            ) : null}
          </div>

          <p className="text-xs text-navy/45">
            Listas controladas em uso: {Object.keys(CATALOGOS).length} campos classificatórios. Entrada fora da lista é recusada no
            servidor e no banco.
          </p>
          </FichaSecoes>
        </div>
        </SheetContent>
      </Sheet>

      {/*
        27/08/2026 — "CRM mestre e legado nunca usei" (Proprietária). Fluxo
        comercial canônico (contacts/opportunities) e o painel de contatos
        rodavam em paralelo aqui, dentro do CRM que ela usa de verdade —
        0 registros gravados desde 21/08, confirmado no banco. Saíram para
        /historico/fluxo-comercial-canonico: nada foi apagado, só parou de
        competir visualmente com o CRM real desta tela.
      */}
      <p id="crm-contatos" className="mt-6 scroll-mt-24 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        O modelo de contatos/oportunidades (fluxo comercial canônico) nunca teve dado real gravado — virou visão
        histórica.{" "}
        <Link to="/historico/fluxo-comercial-canonico" className="underline">
          Abrir visão histórica
        </Link>
      </p>

      <button
        type="button"
        id="crm-templates"
        className="mt-6 rounded-lg border border-navy/20 px-3 py-2 text-xs font-medium text-navy hover:bg-navy/5"
        onClick={() => setTemplatesAberto(true)}
      >
        Templates de WhatsApp
      </button>
      <Sheet open={templatesAberto} onOpenChange={setTemplatesAberto}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Templates de WhatsApp</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <TemplatesWhatsapp />
          </div>
        </SheetContent>
      </Sheet>

      <p className="mt-6 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        Execução diária fica no Painel Hoje — fila única, sem contagem concorrente.{" "}
        <Link to="/painel" className="underline">
          Abrir Painel Hoje
        </Link>
      </p>

    </SaasShell>
  );
}
