import { createFileRoute, Link, notFound, redirect, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { BarraEtapasCaso } from "@/components/caso/barra-etapas-caso";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { SaasShell, useSaas, EstadoVazio, BotaoTentarNovamente } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { ResumoKitCaso } from "@/components/desk/kit-conectado";
import "@/components/desk/mockup4-superficies.css";
import { BarrasHorizontais, DonutEstados, Etiqueta, JornadaMarcos, Linha, LinhaTempoGrafica, Pessoa } from "@/components/prancha-v4/kit";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { atualizarRegistro, criarRegistro, listarRegistros } from "@/lib/saas.functions";
// Frente 1 (19/10/2026) — Seletor Universal de Casos e "Visão Concreta":
// reaproveita exatamente os leitores já existentes da esteira /golive/* —
// nenhuma leitura nova é escrita aqui, nenhuma tabela/coluna/CHECK inventada.
import { montarFicha, resumoLote, type CampoFicha } from "@/lib/golive-ficha";
import { carregarGoLive, type DadosGoLive } from "@/lib/golive.functions";
import {
  obterPropostaCanvaDoCliente,
  obterResumoFinanceiroCaso,
  salvarPagamento,
  conciliarPagamento,
  salvarFatura,
} from "@/lib/comercial.functions";
import { ROTULO_STATUS_FINANCEIRO_CASO } from "@/lib/financeiro-caso";
import { validacaoJuridicaCaso } from "@/lib/crm-desk.functions";
import { cadeiaPesquisaDoCaso } from "@/lib/pesquisa-cadeia.functions";
import { estadoDossieDoCaso } from "@/lib/pesquisa-cadeia";
import { pendenciaPesquisaAberta } from "@/lib/rotulo-negocio";
import { ROTULO_ATO_FORMAL } from "@/lib/validacao-juridica-caso";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { carregarCanonico, marcarSemNovaAcaoNecessaria } from "@/lib/caso-canonico.functions";
import { PendenciasHumanasCaso } from "@/components/caso/pendencias-humanas-caso";
import { adicionarPessoaAoCaso, conferirDivergenciaCepMembrosCaso, conferirDivergenciaCpfMembrosCaso, conferirDivergenciaTelefoneMembrosCaso, listarPessoasParaCaso } from "@/lib/caso-canonico.functions";
import { lerCadeiaOperacional } from "@/lib/cadeia-operacional.functions";
import { EstadoIntegradoCaso } from "@/components/caso/estado-integrado";
import { ReconciliarCpfMembrosCaso } from "@/components/caso/reconciliar-cpf-membros-caso";
import { ReconciliarTelefoneMembrosCaso } from "@/components/caso/reconciliar-telefone-membros-caso";
import { ReconciliarCepMembrosCaso } from "@/components/caso/reconciliar-cep-membros-caso";
import { PainelDadosCivisMembrosCaso } from "@/components/caso/reconciliar-dados-civis-membros-caso";
import { GrupoComunicacaoCaso } from "@/components/caso/grupo-comunicacao-caso";
import { listarFilaOps } from "@/lib/ops.functions";
import { listarDocumentos } from "@/lib/documentos.functions";
import { resumoVisaoClienteCaso } from "@/lib/app-cliente-como-pessoa.functions";
import { FasesMotorCidadania } from "@/components/caso/fases-motor-cidadania";
import { CadeiaCaso360 } from "@/components/caso/cadeia-caso-360";
import { CadeiaGenealogicaCaso } from "@/components/caso/cadeia-genealogica-caso";
import { FormularioTarefaCaso } from "@/components/caso/formulario-tarefa-caso";
import { PlanejadorOperacional } from "@/components/contrato/planejador-operacional";
import { PublicarPlanoApp } from "@/components/contrato/publicar-plano-app";
import { PublicarAssinaturaApp } from "@/components/contrato/publicar-assinatura-app";
import { CalculadoraOrcamento } from "@/components/contrato/calculadora-orcamento";
import { CondicaoComercialVersionada } from "@/components/contrato/condicao-comercial-versionada";
import { CardsContratoCaso } from "@/components/contrato/cards-contrato-caso";
import { OrcamentoPorProdutoPai } from "@/components/contrato/orcamento-produto-pai";
import { OverrideComercial } from "@/components/caso/override-comercial";
import { PainelJornadaPlanejador } from "@/components/caso/jornada-planejador";
import { AbaVisaoGeral } from "@/components/caso/visao-geral";
import { RadarInternoCaso } from "@/components/caso/radar-interno";
import { ChipIdentidadeCaso } from "@/components/caso/chip-identidade-caso";
import { identidadeDeCrmCaso } from "@/lib/caso-compartilhado";
import { radarInternoDoCaso } from "@/lib/radar-interno-caso";
import { papelDoRegistro, progressoPorFrente, ROTULO_FRENTE } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL } from "@/lib/prioridade-matriz";
import { AbaProdutoTrilha } from "@/components/caso/produto-trilha";
import { ConsolidacaoCaseService } from "@/components/caso/consolidacao-case-service";
import { AbaProximaAcao } from "@/components/caso/proxima-acao";
import { AbaEtiquetas } from "@/components/caso/etiquetas-caso";
import { AbaOnboarding } from "@/components/caso/onboarding-caso";
import { AbaJornadaCliente } from "@/components/caso/jornada-cliente";
import { AbaFechamento } from "@/components/caso/fechamento";
import { AbaCadastro } from "@/components/caso/cadastro-checklist";
import { PainelFichaUnica } from "@/components/caso/ficha-unica";
import { CaseHealthHero, saudeDoCaso } from "@/components/caso/case-health-hero";
import { DossieConsolidado } from "@/components/caso/dossie-consolidado";
import { AvisoCampo, motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { PublicarUniaoRamos } from "@/components/caso/publicar-uniao-ramos";
import { MarcosJornadaDesk } from "@/components/caso/marcos-jornada-desk";
import { VinculoNucleo } from "@/components/caso/vinculo-nucleo";
import { PessoasDoNucleo } from "@/components/caso/pessoas-do-nucleo";
import { listarNucleos } from "@/lib/nucleos-desk.functions";
import { ehFixture, ROTULO_FIXTURE } from "@/lib/identificadores-norma";
import { ehFixtureLinha, ROTULO_DEMONSTRACAO } from "@/lib/fixtures";
import { classificarErroPersistencia, ESTADOS_SALVAMENTO } from "@/lib/persistencia-erros";
import { toast } from "sonner";
import { MapaPersistenciaCaso } from "@/components/caso/mapa-persistencia";
import { HistoricoPorFase } from "@/components/caso/historico-por-fase";
import { aprovarEventoTimelineParaCliente, revogarEventoTimelineDoCliente } from "@/lib/timeline-caso.functions";
import { estadoDerivadoPorGates } from "@/lib/gates-ativacao-ficha";
import { cepValido, cpfValido, emailValido, formatarCep, formatarCpf, formatarTelefone, telefoneValido } from "@/lib/validacao-pessoa";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAvisoEdicaoNaoSalva, useAvisoEdicaoNaoSalvaComConfirmacao } from "@/lib/aviso-edicao-nao-salva";

import {
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  ORIGEM_BRIEF,
  PAISES_LINHA,
  PAPEIS_PESSOA,
  PROXIMAS_ACOES,
  REVISAO_JURIDICA,
  RISCOS,
  ESTADO_CIVIL,
  STATUS_CADASTRAL,
  STATUS_DERIVADO,
  STATUS_RADAR,
  STATUS_VIA,
  VIAS_JURIDICAS,
  derivarStatusCaso,
  obterProximaAcaoCanonica,
  rotulo,
  SELO_PROXIMA_ACAO,
  sugestoesJornada,
  sugerirVia,
  type Opcao,
} from "@/lib/caso-ficha";

export const Route = createFileRoute("/_authenticated/casos/$caseId/")({
  // URL com código canônico (ex.: CA-CID-AT-FAM-2026-001) → resolve para o UUID
  // persistido em crm_casos.codigo (leitura sob RLS) antes de qualquer consulta.
  beforeLoad: async ({ params }) => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuid.test(params.caseId)) return;
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase
      .from("crm_casos")
      .select("id")
      .eq("codigo", params.caseId)
      .maybeSingle();
    if (data?.id) {
      throw redirect({ to: "/casos/$caseId", params: { caseId: data.id }, replace: true });
    }
    throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Ficha operacional do caso — Clube Ancestral" },
      {
        name: "description",
        content:
          "Ficha operacional canônica do caso: eixos de status, pessoas, riscos e próxima ação.",
      },
      { property: "og:title", content: "Ficha operacional do caso — Clube Ancestral" },
      { property: "og:description", content: "Registro operacional do caso no Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FichaCaso,
});

/* ---------------- Campos básicos ---------------- */

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-navy/50">
      {children}
    </span>
  );
}

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

/**
 * Envolve o resultado de uma consulta como payload único para `<EstadoDados>`.
 *
 * O motivo: as listas desta tela chegam sempre preenchidas pelo servidor
 * (`membros`, `timeline`, `taxonomia`… já são arrays). O que falhava em
 * silêncio era o payload inteiro ausente: coalescer `q.data?.membros` para
 * lista vazia mostrava
 * "nenhuma pessoa" quando na verdade a leitura não chegou. Como payload de um
 * item, `undefined` vira erro de carga na tela e nunca base vazia.
 */
function comoPayload<T>(dados: T | null | undefined): T[] | undefined {
  return dados === null || dados === undefined ? undefined : [dados];
}

/*
  03/10/2026 — `erro` entra no campo compartilhado desta rota pelo mesmo
  motivo da Ficha Genealógica: sem ele, cada um dos campos civis teria de
  montar borda e mensagem à mão, e foi por isso que a varredura de máscaras
  vinha saindo em pedaços. Aqui os campos tinham MÁSCARA e nenhum
  VALIDADOR — o CPF era formatado e aceito inválido.
*/
function Texto({
  label,
  valor,
  onChange,
  desabilitado,
  area,
  tipo = "text",
  ajuda,
  erro,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  desabilitado?: boolean;
  area?: boolean;
  tipo?: string;
  ajuda?: string;
  erro?: string | null;
}) {
  const classe = erro ? `${inputCls} border-terracotta` : inputCls;
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      {area ? (
        <textarea
          className={classe}
          rows={4}
          value={valor}
          disabled={desabilitado}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(erro)}
        />
      ) : (
        <input
          className={classe}
          type={tipo}
          value={valor}
          disabled={desabilitado}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(erro)}
        />
      )}
      {erro ? <AvisoCampo motivo={erro} /> : null}
      {ajuda && !erro ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
    </label>
  );
}

function Selecao({
  label,
  valor,
  opcoes,
  onChange,
  desabilitado,
  ajuda,
}: {
  label: string;
  valor: string;
  opcoes: Opcao[];
  onChange: (v: string) => void;
  desabilitado?: boolean;
  ajuda?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      <select
        className={inputCls}
        value={valor}
        disabled={desabilitado}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— selecionar —</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {ajuda ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
    </label>
  );
}

function Multi({
  label,
  valores,
  opcoes,
  onChange,
  desabilitado,
}: {
  label: string;
  valores: string[];
  opcoes: Opcao[];
  onChange: (v: string[]) => void;
  desabilitado?: boolean;
}) {
  return (
    <div>
      <Rotulo>{label}</Rotulo>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => {
          const ativo = valores.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              disabled={desabilitado}
              onClick={() =>
                onChange(ativo ? valores.filter((v) => v !== o.valor) : [...valores, o.valor])
              }
              className={
                "rounded-full border px-3 py-1 text-xs transition-colors " +
                (ativo
                  ? "border-gold bg-gold/20 text-navy"
                  : "border-navy/15 text-navy/60 hover:bg-navy/5")
              }
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Uma seção da página única do Caso 360.
 *
 * Carrega a âncora que o índice usa e um título discreto, para quem rola saber
 * onde está sem depender de ter clicado num botão.
 */
function SecaoAncora({
  id,
  titulo,
  children,
  hidden,
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
  hidden?: boolean;
}) {
  return (
    <section id={`secao-${id}`} data-secao-caso={id} className="scroll-mt-16" hidden={hidden}>
      <h2 className="mb-2 flex items-center gap-2 font-serif text-lg text-navy">
        <span className="h-3.5 w-1 rounded-full bg-gold" aria-hidden />
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
      <h2 className="font-serif text-lg text-navy">{titulo}</h2>
      {descricao ? (
        <p className="mb-4 mt-1 text-xs text-navy/55">{descricao}</p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </section>
  );
}

/* ---------------- Página ---------------- */

/**
 * Seções do Caso 360, na ordem em que a página as apresenta.
 *
 * 26/08/2026 — eram 13 abas independentes. O documento de fluxo é explícito:
 * "no Caso 360, o ideal é uma página única com seções contextuais, não abas
 * independentes que disputam a mesma informação". Adotado por decisão da
 * Proprietária.
 *
 * Nenhuma seção foi removida ou fundida: as mesmas 13 continuam, agora
 * empilhadas e alcançáveis por um índice fixo, em vez de escondidas atrás de
 * um clique que faz o resto sumir.
 */
// P24 (2026-09-26) — taxonomia fixada pela Proprietária: Visão · Jornada ·
// Pessoas · Pesquisa · Documentos · Formalização · Financeiro · Histórico.
// Os rótulos "visao" e "log" estavam trocados entre si (bug encontrado nesta
// rodada: "visao" dizia "Histórico" e "log" — que É o histórico real de
// fases/alterações — dizia "Dados técnicos e validações"). "comercial" e
// "tecnico" foram renomeados para o nome que já descrevia seu conteúdo real
// (formalização/eixo comercial; país-via/hipótese/pesquisa preliminar),
// nenhuma seção foi removida ou fundida.
const SECOES = [
  { id: "visao", rotulo: "Visão" },
  { id: "jornada", rotulo: "Jornada" },
  { id: "pessoas", rotulo: "Pessoa e família" },
  { id: "tecnico", rotulo: "Pesquisa" },
  { id: "documentos", rotulo: "Documentos" },
  { id: "comercial", rotulo: "Formalização" },
  { id: "financeiro", rotulo: "Financeiro" },
  { id: "log", rotulo: "Histórico" },
] as const;

/**
 * Seletor Universal de Casos (Frente 1, 19/10/2026) — cabeçalho do Caso 360.
 * Lista real de `crm_casos` via o mesmo `listarRegistros` genérico já usado
 * em outras telas do Desk (nenhuma tabela/consulta nova); trocar a opção
 * navega de fato (useNavigate), não é um estado local decorativo. "Novo
 * caso" leva ao fluxo real já existente (`AbrirCasoMotor`, em /casos).
 */
function SeletorDeCasos({ atual, codigoAtual }: { atual: string; codigoAtual: string | null }) {
  const navigate = useNavigate();
  const listar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["casos-seletor-universal"],
    queryFn: () => listar({ data: { entidade: "crm_casos" } }),
    retry: false,
    staleTime: 60_000,
  });
  const casos = (q.data ?? []) as Record<string, unknown>[];
  const conhecido = casos.some((c) => String(c["id"]) === atual);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="seletor-universal-casos">
        Trocar de caso
      </label>
      <select
        id="seletor-universal-casos"
        value={atual}
        disabled={q.isLoading}
        onChange={(e) => {
          const novoId = e.target.value;
          if (novoId && novoId !== atual) {
            void navigate({ to: "/casos/$caseId", params: { caseId: novoId } });
          }
        }}
        className="max-w-[18rem] truncate rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-xs text-navy"
      >
        {!conhecido ? <option value={atual}>{codigoAtual ?? "Caso atual"}</option> : null}
        {casos.map((c) => (
          <option key={String(c["id"])} value={String(c["id"])}>
            {String(c["codigo"] ?? c["titulo"] ?? c["id"])}
            {c["codigo"] && c["titulo"] ? ` — ${String(c["titulo"])}` : ""}
          </option>
        ))}
      </select>
      <Link
        to="/casos"
        hash="abrir-caso-operacional"
        className="whitespace-nowrap rounded-lg border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs font-medium text-navy hover:bg-gold/20"
      >
        + Novo caso
      </Link>
    </div>
  );
}

/**
 * "Visão Concreta" (Frente 1, 19/10/2026) — a composição de dados vive na
 * sub-aba "concreta" da seção "Visão" (uma das 8 SECOES já existentes; não
 * é uma 9ª seção no schema de navegação). Decisão direta da Proprietária
 * em 19/10/2026: no índice de pílulas do Caso 360 ela quer uma pílula
 * própria "Visão Concreta" como atalho de um clique — ver
 * `pilulaVisaoConcretaAtiva` na página — sem duplicar esta composição.
 * Reúne, no mesmo lugar, o que a esteira /golive/painel-caso.tsx já mostrava — linha do
 * tempo, participantes/relações, dossiê documental, pesquisa e hipóteses,
 * condição comercial/faturas e projeções publicadas — mas lendo dos
 * carregadores já parametrizados por caseId desta própria ficha (q,
 * qPesquisa, qDocumentos, qFinanceiro, qc2); a ficha dos 4 lotes usa
 * carregarGoLive({ casoId }). Assim o conteúdo troca de verdade quando o
 * Seletor Universal de Casos troca de caso. Nenhuma tabela/consulta nova.
 */
function VisaoConcretaCaso({
  caseId,
  timeline,
  membros,
  documentos,
  pesquisa,
  financeiro,
  entregas,
}: {
  caseId: string;
  timeline: Record<string, unknown>[];
  membros: Record<string, unknown>[];
  documentos: Record<string, unknown>[];
  pesquisa:
    | {
        fontes: unknown[];
        evidencias: unknown[];
        achados: unknown[];
        pessoas: unknown[];
        relacoes: unknown[];
      }
    | null
    | undefined;
  financeiro: {
    valorContratado: number | null;
    moeda: string;
    condicaoComercial: string | null;
    valorRecebido: number;
    saldoAberto: number | null;
    status: string;
    proximaAcaoFinanceira: string;
  } | null;
  entregas: Record<string, unknown>[];
}) {
  const cartao = "min-w-0 rounded-xl border border-navy/10 bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]";
  const documentosLiberados = documentos.filter((d) => d["status"] === "liberado").length;

  return (
    <div className="grid gap-5 lg:grid-cols-2" data-caso360-visao-concreta>
      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Linha do tempo do caso</p>
        {timeline.length ? (
          <ul className="space-y-1.5 text-sm text-navy/80">
            {[...timeline]
              .sort((a, b) => String(b["occurred_at"] ?? b["created_at"] ?? "").localeCompare(String(a["occurred_at"] ?? a["created_at"] ?? "")))
              .slice(0, 8)
              .map((e) => (
                <li key={String(e["id"])}>
                  {String(e["title"] ?? "Evento")}{" "}
                  <span className="text-xs text-navy/50">
                    — {new Date(String(e["occurred_at"] ?? e["created_at"])).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-xs text-navy/55">Nenhum evento registrado ainda.</p>
        )}
      </div>

      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Participantes e relações</p>
        {membros.length ? (
          <ul className="space-y-1.5 text-sm text-navy/80">
            {membros.slice(0, 8).map((m) => (
              <li key={String(m["id"])}>
                {String(m["nome"] ?? m["nome_completo"] ?? "Pessoa sem nome registrado")}
                <span className="text-xs text-navy/50"> — {String(m["papel"] ?? "papel não registrado")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-navy/55">Nenhum participante confirmado neste núcleo.</p>
        )}
        <Link to="/pessoas-linhagens/$caseId" params={{ caseId }} className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4">
          Abrir Pessoas & Linhagens
        </Link>
      </div>

      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Dossiê documental</p>
        {documentos.length ? (
          <p className="text-sm text-navy/80">
            {documentos.length} documento(s) registrado(s) · {documentosLiberados} liberado(s) para a cliente.
          </p>
        ) : (
          <p className="text-xs text-navy/55">Nenhum documento registrado ainda.</p>
        )}
        <Link to="/biblioteca-evidencias/$caseId" params={{ caseId }} className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4">
          Abrir Biblioteca de Evidências
        </Link>
      </div>

      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Pesquisa e hipóteses</p>
        {pesquisa && (pesquisa.fontes.length || pesquisa.evidencias.length || pesquisa.achados.length) ? (
          <p className="text-sm text-navy/80">
            {pesquisa.fontes.length} fonte(s) · {pesquisa.evidencias.length} evidência(s) · {pesquisa.achados.length} achado(s)
            {pesquisa.relacoes.length ? ` · ${pesquisa.relacoes.length} relação(ões) genealógica(s)` : ""}.
          </p>
        ) : (
          <p className="text-xs text-navy/55">Nenhuma linha de pesquisa aberta ainda.</p>
        )}
        <Link to="/pesquisa-evidencias/$caseId" params={{ caseId }} className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4">
          Abrir Pesquisa & Evidências
        </Link>
      </div>

      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Condição comercial e faturas</p>
        {financeiro ? (
          <>
            <p className="text-sm text-navy/80">
              {financeiro.condicaoComercial ?? "Sem condição comercial registrada"}
              {financeiro.valorContratado ? ` — ${financeiro.valorContratado.toLocaleString("pt-BR", { style: "currency", currency: financeiro.moeda || "BRL" })}` : ""}
            </p>
            <p className="text-xs text-navy/55">
              Recebido: {financeiro.valorRecebido.toLocaleString("pt-BR", { style: "currency", currency: financeiro.moeda || "BRL" })}
              {financeiro.saldoAberto ? ` · Saldo em aberto: ${financeiro.saldoAberto.toLocaleString("pt-BR", { style: "currency", currency: financeiro.moeda || "BRL" })}` : ""}
            </p>
            <p className="text-xs text-navy/55">
              {(ROTULO_STATUS_FINANCEIRO_CASO as Record<string, string>)[financeiro.status] ?? financeiro.status} · {financeiro.proximaAcaoFinanceira}
            </p>
          </>
        ) : (
          <p className="text-xs text-navy/55">Nenhuma proposta, fatura ou despesa registrada ainda.</p>
        )}
      </div>

      <div className={cartao}>
        <p className="mb-2 font-serif text-base text-navy">Projeções publicadas no App Cliente</p>
        {entregas.length ? (
          <ul className="space-y-1.5 text-sm text-navy/80">
            {entregas.slice(0, 6).map((m) => (
              <li key={String(m["id"])}>{String(m["title_client"] ?? m["titulo"] ?? "Entrega")}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-navy/55">Nada publicado para a família até agora.</p>
        )}
      </div>
    </div>
  );
}

/** Resgate dos 4 lotes (A–D) de golive-ficha.ts, lidos do caso aberto (carregarGoLive({ casoId })). */
function FichaQuatroLotesGoLive({ casoId }: { casoId: string }) {
  const carregar = useServerFn(carregarGoLive);
  const { data, isPending, isError } = useQuery<DadosGoLive>({
    queryKey: ["go-live", "caso", casoId],
    queryFn: () => carregar({ data: { casoId } }),
    enabled: Boolean(casoId),
  });
  const [lote, setLote] = useState<"A" | "B" | "C" | "D">("A");
  const casoPiloto = data?.encontrado ? data : null;

  if (isPending) return <p className="text-sm text-navy/60">Carregando ficha por lotes…</p>;
  if (isError || !casoPiloto) return <p className="text-xs text-navy/55">Ficha por lotes indisponível para este caso agora.</p>;

  const lotes = montarFicha(casoPiloto);
  const loteAtual = lotes.find((l) => l.chave === lote) ?? null;

  return (
    <div className="space-y-3">
      <nav aria-label="Lotes da ficha" className="min-w-0 overflow-x-auto">
        <ul className="flex min-w-0 flex-wrap gap-1.5">
          {lotes.map((l) => {
            const r = resumoLote(l);
            return (
              <li key={l.chave}>
                <button
                  type="button"
                  aria-current={l.chave === lote ? "true" : undefined}
                  onClick={() => setLote(l.chave)}
                  className={
                    l.chave === lote
                      ? "rounded-full bg-gold/25 px-3 py-1.5 text-xs font-semibold text-navy"
                      : "rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
                  }
                >
                  {l.titulo} · {r.registrados}/{r.total}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {loteAtual ? (
        <ul className="space-y-2">
          {loteAtual.campos.map((c) => (
            <CampoFichaLinha key={c.chave} campo={c} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Uma linha de campo da ficha GoLive: valor, fonte, responsável, visibilidade e estado. */
function CampoFichaLinha({ campo }: { campo: CampoFicha }) {
  const cor =
    campo.estado === "registrado"
      ? "border-navy/15 bg-white/70 text-navy"
      : campo.estado === "em revisão" || campo.estado === "hipótese"
        ? "border-gold/50 bg-gold/10 text-navy"
        : "border-dashed border-navy/20 bg-cream/60 text-navy/70";
  return (
    <li className={`min-w-0 rounded-xl border p-3 ${cor}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold break-words">{campo.rotulo}</p>
        <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-navy/65">
          {campo.estado}
        </span>
      </div>
      <p className="mt-1 break-words text-sm">{campo.valor ?? "Sem registro — preencher na tela dona."}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-navy/60 sm:grid-cols-4">
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Fonte</dt>
          <dd className="break-words">{campo.fonte}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Responsável</dt>
          <dd className="break-words">{campo.responsavel ?? "não atribuído"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Data</dt>
          <dd className="break-words">{campo.data ? dataHumanaGoLive(campo.data) : "sem data"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Visibilidade</dt>
          <dd className="break-words">{campo.visibilidade}</dd>
        </div>
      </dl>
      <Link to={campo.telaDona} className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4">
        {campo.estado === "registrado" ? "Abrir tela dona" : "Preencher na tela dona"}
      </Link>
    </li>
  );
}

function dataHumanaGoLive(v: string): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR");
}

function FichaCaso() {
  const { caseId: id } = useParams({ from: "/_authenticated/casos/$caseId/" });
  const { podeEscrever } = useSaas();
  const autoridade = useAutoridade();
  const carregar = useServerFn(carregarFichaCaso);
  const carregarCanon = useServerFn(carregarCanonico);
  const atualizar = useServerFn(atualizarRegistro);
  const criar = useServerFn(criarRegistro);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["ficha-caso", id],
    queryFn: () => carregar({ data: { id } }),
    retry: false,
  });
  const qc2 = useQuery({
    queryKey: ["caso-canonico", id],
    queryFn: () => carregarCanon({ data: { caseId: id } }),
    retry: false,
  });
  const carregarProposta = useServerFn(obterPropostaCanvaDoCliente);
  const clienteId = q.data?.caso?.cliente_id as string | null | undefined;
  const qProposta = useQuery({
    queryKey: ["proposta-canva-cliente", clienteId],
    queryFn: () => carregarProposta({ data: { clienteId: clienteId as string } }),
    enabled: Boolean(clienteId),
    retry: false,
  });
  const recarregar = () => {
    void qc.invalidateQueries({ queryKey: ["ficha-caso", id] });
    void qc.invalidateQueries({ queryKey: ["caso-canonico", id] });
  };

  // CA04-CASO360-SIMPLES (09/09/2026): fontes já existentes (tarefas,
  // documentos), só filtradas por este caso — nenhuma tabela nova.
  const carregarTarefasFn = useServerFn(listarFilaOps);
  const qTarefas = useQuery({
    queryKey: ["ficha-caso-tarefas", id],
    queryFn: () => carregarTarefasFn({ data: { casoId: id } }),
    retry: false,
  });
  const carregarDocumentosFn = useServerFn(listarDocumentos);
  const qDocumentos = useQuery({
    queryKey: ["ficha-caso-documentos", id],
    queryFn: () => carregarDocumentosFn({ data: { casoId: id } }),
    retry: false,
  });

  // CA06-APP-NO-DESK (09/09/2026): mesmo resumo do que o App mostrará —
  // app_projections/client_portal_access; produção interna (microentregas
  // ainda não cliente-facing) conta à parte, nunca somada ao publicado.
  const carregarVisaoClienteFn = useServerFn(resumoVisaoClienteCaso);
  const qVisaoCliente = useQuery({
    queryKey: ["ficha-caso-visao-cliente", id],
    queryFn: () => carregarVisaoClienteFn({ data: { casoId: id } }),
    retry: false,
  });

  // CA07-FINANCEIRO-SIMPLES (09/09/2026): fontes já existentes (proposals,
  // invoices, third_party_expenses), nenhuma tabela ou cálculo de preço novo.
  const carregarFinanceiroFn = useServerFn(obterResumoFinanceiroCaso);
  const qFinanceiro = useQuery({
    queryKey: ["ficha-caso-financeiro", id],
    queryFn: () => carregarFinanceiroFn({ data: { caseId: id } }),
    retry: false,
  });

  // CA20-PESQUISA-VIVA (09/09/2026): mesma leitura já usada por
  // /pesquisa-evidencias/$caseId (cadeiaPesquisaDoCaso) — Caso 360 resume,
  // nunca copia a base inteira nem conclui cidadania/linhagem sozinho.
  const carregarPesquisaFn = useServerFn(cadeiaPesquisaDoCaso);
  const qPesquisa = useQuery({
    queryKey: ["ficha-caso-pesquisa", id],
    queryFn: () => carregarPesquisaFn({ data: { caseId: id } }),
    retry: false,
  });

  // Ordem P0 (21/09/2026, "Sistema Único Transversal"): única leitura nova
  // — lerCadeiaOperacional já existe (usada em casos.$caseId.contrato.
  // preparar.tsx), nunca tinha sido chamada dentro do Caso 360. Traz
  // etapa/rota/marcos de `case_plans`, que hoje só aparecem lá.
  const carregarCadeiaFn = useServerFn(lerCadeiaOperacional);
  const qCadeia = useQuery({
    queryKey: ["ficha-caso-cadeia-operacional", id],
    queryFn: () => carregarCadeiaFn({ data: { caseId: id } }),
    retry: false,
  });

  const [secaoFoco, setSecaoFoco] = useState<(typeof SECOES)[number]["id"] | null>(SECOES[0].id);
  // Frente 1 (19/10/2026) — "Visão Concreta" mora na sub-aba da seção "Visão"
  // (uma das 8 SECOES existentes; nunca uma 9ª seção solta no schema de
  // navegação). Decisão direta da Proprietária em 19/10/2026: no índice de
  // pílulas do Caso 360 ela quer uma pílula própria "Visão Concreta" como
  // atalho de um clique — `pilulaVisaoConcretaAtiva` força a ficha aberta e
  // a sub-aba certa sem duplicar a composição de dados já construída.
  const [abaVisao, setAbaVisao] = useState<"indicadores" | "concreta">("indicadores");
  const [pilulaVisaoConcretaAtiva, setPilulaVisaoConcretaAtiva] = useState(false);
  // Link contextual vindo de outra tela (ex.: Pessoa 360 → "Conferir", #pessoas).
  // 18/10/2026: reage também à âncora vinda do menu lateral (Caso 360 / Jornada / Ficha Única).
  const hashRota = useRouterState({ select: (s) => s.location.hash });
  useEffect(() => {
    const alvo = (hashRota || window.location.hash).replace("#", "");
    const secao = SECOES.find((x) => x.id === alvo);
    if (secao) setSecaoFoco(secao.id);
  }, [hashRota]);

  // CA08-JURIDICO-PROPORCIONAL (09/09/2026): fontes já existentes
  // (citizenship_tracks, versioned_legal_rules, legal_reference_milestones,
  // matriz jurídica de temas), nenhuma tabela ou taxonomia nova.
  const carregarJuridicoFn = useServerFn(validacaoJuridicaCaso);
  const qJuridico = useQuery({
    queryKey: ["ficha-caso-juridico", id],
    queryFn: () => carregarJuridicoFn({ data: { caseId: id } }),
    retry: false,
  });
  const salvarPagamentoFn = useServerFn(salvarPagamento);
  const conciliarPagamentoFn = useServerFn(conciliarPagamento);
  const salvarFaturaFn = useServerFn(salvarFatura);

  const mRegistrarPagamento = useMutation({
    mutationFn: async (v: { invoiceId: string; valor: number; pagoEm: string; referenciaExterna: string; motivo: string }) => {
      const criado = await salvarPagamentoFn({ data: { dados: { invoice_id: v.invoiceId, valor: v.valor } } });
      return conciliarPagamentoFn({
        data: {
          id: criado.id,
          pago_em: v.pagoEm,
          valor: v.valor,
          referencia_externa: v.referenciaExterna,
          motivo: v.motivo,
        },
      });
    },
    onSuccess: () => {
      toast.success("Pagamento registrado e conciliado.");
      void qc.invalidateQueries({ queryKey: ["ficha-caso-financeiro", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mPrepararCobranca = useMutation({
    mutationFn: (v: { faturaId?: string; valor?: number; vencimento?: string; descricao?: string }) =>
      v.faturaId
        ? salvarFaturaFn({ data: { id: v.faturaId, dados: { status: "emitida" } } })
        : salvarFaturaFn({
            data: {
              dados: {
                case_id: id,
                client_id: caso?.["cliente_id"],
                valor: v.valor,
                moeda: qFinanceiro.data?.moeda ?? "BRL",
                vencimento: v.vencimento,
                descricao: v.descricao,
                status: "rascunho",
              },
            },
          }),
    onSuccess: () => {
      toast.success("Cobrança preparada internamente. Nada foi enviado ao cliente.");
      void qc.invalidateQueries({ queryKey: ["ficha-caso-financeiro", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA (Lote 3 — confirmação humana): os
  // dois botões abaixo pediam os dados via window.prompt() encadeado, sem
  // nenhuma confirmação estruturada. Os dados continuam num rascunho local
  // (igual ao padrão já usado em financeiro.tsx "Conciliar pagamento"); só
  // o motivo final passa a vir do modal do AcaoOperacional.
  const [rascunhoPagamento, setRascunhoPagamento] = useState<{ valor: string; pagoEm: string; referencia: string } | null>(
    null,
  );
  const [rascunhoCobranca, setRascunhoCobranca] = useState<{ valor: string; vencimento: string; descricao: string } | null>(
    null,
  );

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const [camposSalvos, setCamposSalvos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const caso = q.data?.caso;

  // Corte 1 (27/09/2026): antes, qualquer escrita de outro painel mudava
  // `updated_at` e apagava a edição ainda não salva deste formulário. Agora o
  // rascunho só é zerado ao trocar de caso ou depois do próprio salvar.
  useEffect(() => {
    setForm({});
  }, [id]);

  const sujo = Object.keys(form).length > 0;

  /*
   * F5 / sair da linha: recarregar, fechar a aba e navegar entre abas/rotas do
   * Desk. O padrão nasceu aqui (Corte 1, 27/09) e em 09/10/2026 virou
   * `useAvisoEdicaoNaoSalva` — esta tela passa a usar o módulo, guardando o
   * resolver porque desenha a própria confirmação (salvar / descartar / cancelar).
   */
  const bloqueio = useAvisoEdicaoNaoSalvaComConfirmacao(sujo);

  const v = (chave: string): string => {
    const atual = chave in form ? form[chave] : caso?.[chave];
    return atual === null || atual === undefined ? "" : String(atual);
  };
  const arr = (chave: string): string[] => {
    const atual = chave in form ? form[chave] : caso?.[chave];
    return Array.isArray(atual) ? (atual as string[]) : [];
  };
  const set = (chave: string, valor: unknown) => setForm((f) => ({ ...f, [chave]: valor }));

  const mSalvar = useMutation({
    mutationFn: () => atualizar({ data: { entidade: "crm_casos", id, dados: form } }),
    onSuccess: async (r: any) => {
      setErro(null);
      setSalvoEm(new Date().toLocaleTimeString("pt-BR"));
      setCamposSalvos(Array.isArray(r?.alterados) ? (r.alterados as string[]) : []);
      // Relê primeiro e só então limpa o rascunho — sem "piscar" o valor antigo.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["ficha-caso", id] }),
        qc.invalidateQueries({ queryKey: ["caso-canonico", id] }),
      ]);
      setForm({});
      toast.success(
        `Salvo e conferido no banco${Array.isArray(r?.alterados) && r.alterados.length ? ` — ${r.alterados.length} campo(s)` : ""}.`,
      );
    },
    onError: (e: unknown) => {
      const classificado = classificarErroPersistencia(e);
      setErro(`${classificado.titulo}: ${classificado.detalhe}`);
      setCamposSalvos([]);
      toast.error(classificado.titulo, { description: classificado.detalhe });
    },
  });

  /*
   * CA04-CASO360-SIMPLES (09/09/2026): os seis CTAs acima da dobra chamam os
   * escritores canônicos já existentes — nenhum escritor novo. "Concluir"
   * reusa marcarSemNovaAcaoNecessaria (mesma função de AbaProximaAcao, mais
   * abaixo nesta página); "Reprogramar" e "Registrar atualização" gravam em
   * crm_casos pelo mesmo atualizarRegistro do "Salvar alterações", só que com
   * payload próprio (não dependem do form/sujo da ficha inteira); "Criar
   * tarefa" abre o formulário visível (#form-tarefa-caso) em vez de prompt().
   */
  const concluirFn = useServerFn(marcarSemNovaAcaoNecessaria);
  const mConcluir = useMutation({
    mutationFn: () => concluirFn({ data: { caseId: id } }),
    onSuccess: () => {
      toast.success("Próxima ação concluída — sem nova ação necessária por ora.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível concluir", { description: e.message }),
  });

  const mReprogramar = useMutation({
    mutationFn: (novoPrazo: string) =>
      atualizar({ data: { entidade: "crm_casos", id, dados: { prazo_proxima_acao: novoPrazo } } }),
    onSuccess: () => {
      toast.success("Novo prazo gravado.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível reprogramar", { description: e.message }),
  });

  // P27 (26/09/2026): "Mover fase" pedido pelo Pacote de Instruções como CTA
  // do cabeçalho — antes só existia o dropdown genérico "Etapa comercial" na
  // seção Formalização (mesmo campo, mesmo escritor, sem CTA de um clique).
  const mMoverFase = useMutation({
    mutationFn: (novaFase: string) =>
      atualizar({ data: { entidade: "crm_casos", id, dados: { eixo_comercial: novaFase } } }),
    onSuccess: () => {
      toast.success("Fase comercial movida.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível mover a fase", { description: e.message }),
  });

  const mRegistrarAtualizacao = useMutation({
    mutationFn: (texto: string) => {
      const anterior = String(caso?.["resumo_interno"] ?? "").trim();
      const linha = `${new Date().toLocaleString("pt-BR")} — ${texto}`;
      const novo = anterior ? `${anterior}\n${linha}` : linha;
      return atualizar({ data: { entidade: "crm_casos", id, dados: { resumo_interno: novo } } });
    },
    onSuccess: () => {
      toast.success("Atualização registrada no resumo interno do caso.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível registrar", { description: e.message }),
  });

  // REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026): escritor real para
  // `case_timeline_events.visibility = 'cliente_aprovado'` — antes só existia
  // a policy de portal e o filtro de leitura, sem nenhum caminho de escrita.
  const aprovarEvento = useServerFn(aprovarEventoTimelineParaCliente);
  const revogarEvento = useServerFn(revogarEventoTimelineDoCliente);
  const [resumoClientePorEvento, setResumoClientePorEvento] = useState<Record<string, string>>({});
  const mAprovarEvento = useMutation({
    mutationFn: (v: { eventoId: string; resumoCliente: string }) => aprovarEvento({ data: v }),
    onSuccess: () => {
      toast.success("Marco aprovado — a família já pode vê-lo na aba Conta do App.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível aprovar", { description: e.message }),
  });
  const mRevogarEvento = useMutation({
    mutationFn: (v: { eventoId: string }) => revogarEvento({ data: v }),
    onSuccess: () => {
      toast.success("Aprovação revogada — o evento voltou a ser só interno.");
      recarregar();
    },
    onError: (e: Error) => toast.error("Não foi possível revogar", { description: e.message }),
  });

  const recarregarTarefas = () => {
    void qc.invalidateQueries({ queryKey: ["ficha-caso-tarefas", id] });
    recarregar();
  };

  const derivado = useMemo(
    () =>
      derivarStatusCaso({
        eixo_comercial: v("eixo_comercial"),
        eixo_formalizacao: v("eixo_formalizacao"),
        contrato_assinado: caso?.["contrato_assinado"],
        pagamento_confirmado: caso?.["pagamento_confirmado"],
        responsavel_principal: v("responsavel_principal"),
        nucleo_ok: q.data?.nucleoOk,
        plano_inicial_ok: q.data?.planoInicialOk,
        archived_at: caso?.["archived_at"],
      }),
    [caso, q.data, form],
  );

  const sugestoes = useMemo(
    () =>
      sugestoesJornada({
        eixo_comercial: v("eixo_comercial"),
        eixo_formalizacao: v("eixo_formalizacao"),
        contrato_assinado: caso?.["contrato_assinado"],
        pagamento_confirmado: caso?.["pagamento_confirmado"],
        updated_at: caso?.["updated_at"],
      }),
    [caso, form],
  );

  // 07/09/2026 — substitui estadoDerivadoPorGates (só lia case_activation_checks,
  // com valores falso-positivos desde 04/09) pela mesma RPC
  // case_ativacao_bloqueios_reais que a tela de onboarding já usa — as duas
  // telas agora sempre concordam sobre o mesmo caso.
  const bloqueiosReais = useMemo(
    () =>
      ((q.data as any)?.bloqueiosReais ?? []) as {
        regra: string;
        dominio: string;
        motivo: string;
        tabela_campo: string;
        valor_atual: string;
        cta_tela: string | null;
      }[],
    [q.data],
  );

  const viaSugerida = sugerirVia({ pais: v("pais_linha_prioritaria") });

  // CA04-CASO360-SIMPLES (09/09/2026): hoisted para fora da JSX — o hero
  // compacto e o antigo bloco de próxima ação usavam o mesmo cálculo duas
  // vezes; agora é uma fonte só.
  const canonica = useMemo(() => {
    if (!qc2.data || !caso) return null;
    return obterProximaAcaoCanonica({
      caseId: String(caso["id"]),
      rpc: qc2.data.proximaAcaoPrioritaria,
      responsavelPrincipal:
        (caso["proxima_acao_responsavel"] as string) ?? (caso["responsavel_principal"] as string) ?? null,
      dependencia: (caso["proxima_acao_dependencia"] as string) ?? null,
      criterioConclusao: (caso["proxima_acao_criterio_conclusao"] as string) ?? null,
    });
  }, [qc2.data, caso]);

  if (q.isLoading) {
    return (
      <SaasShell titulo="Ficha operacional do caso">
        <EstadoVazio mensagem="Carregando ficha…" />
      </SaasShell>
    );
  }
  if (q.isError || !caso) {
    return (
      <SaasShell titulo="Ficha operacional do caso">
        <EstadoVazio
          mensagem={q.error instanceof Error ? q.error.message : "Caso não encontrado."}
          acao={q.isError ? <BotaoTentarNovamente aoClicar={() => void q.refetch()} /> : undefined}
        />
      </SaasShell>
    );
  }

  // Autoridade operacional: só se desabilita controle quando falta papel ou
  // organização. Papel somente leitura e caso arquivado deixam de travar a
  // tela — passam a pendência declarada, confirmada com motivo registrado.
  const bloqueado = autoridade.bloqueado({ capacidade: "editar_rascunho" });
  const pendenciaCadastro =
    [
      !podeEscrever ? "Seu vínculo de equipe está marcado como somente leitura." : null,
      caso["archived_at"] ? "Caso arquivado." : null,
      bloqueiosReais.length === 0
        ? null
        : `Não elegível para ativação — ${bloqueiosReais.length} bloqueio(s) real(is), primeiro: ${bloqueiosReais[0]?.motivo ?? "—"}.`,
    ]
      .filter(Boolean)
      .join(" ") || null;

  // Etapa atual lida do planejador (case_plans) — a mesma leitura do chip
  // "Etapa atual" da Jornada D0–D365; usada também no subtítulo do topo.
  const etapaAtualPlanejador = (() => {
    const f = qCadeia.data?.planejador?.fase_jornada ?? qCadeia.data?.planejador?.etapa;
    if (!f) return null;
    const t = String(f)
      .replace(/_/g, " ")
      .replace(/formalizacao/gi, "formalização")
      .replace(/diagnostico/gi, "diagnóstico")
      .replace(/ativacao/gi, "ativação");
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();

  return (
    <SaasShell
      visualKit="pantone"
      titulo="Caso 360"
      descricao="Ficha operacional canônica do caso"
      acoes={
        <div className="flex flex-wrap items-center gap-3">
          <SeletorDeCasos atual={id} codigoAtual={(caso["codigo"] as string | null) ?? null} />
          {/* CA04-CASO360-SIMPLES (09/09/2026): este botão morava aqui e
              também no hero — duplicava a mesma ação. Só no hero agora. */}
          <span className="text-xs text-navy/60">
            {mSalvar.isPending
              ? ESTADOS_SALVAMENTO.salvando
              : erro
                ? "Não salvo"
                : sujo
                  ? ESTADOS_SALVAMENTO.sujo
                  : salvoEm
                    ? ESTADOS_SALVAMENTO.salvo(salvoEm)
                    : ESTADOS_SALVAMENTO.limpo}
          </span>
          <AcaoOperacional
            rotulo="Salvar alterações"
            capacidade="editar_rascunho"
            pendenciaGate={pendenciaCadastro}
            efeito="Grava as alterações desta ficha operacional do caso."
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-40"
            onConfirmar={() => {
              if (!sujo || mSalvar.isPending) return;
              mSalvar.mutate();
            }}
          />
        </div>
      }
    >
      {ehFixtureLinha(caso as never) ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-medium tracking-wide text-navy">
          {ROTULO_DEMONSTRACAO} — registro de teste. Não entra em Painel Hoje, filas, métricas nem
          App Cliente.
        </p>
      ) : null}
      {/*
        Prancha V4 (13/10/2026) — identidade do caso no topo: nome, código e
        situação lidos de crm_casos. Pendência aparece como etiqueta
        informativa — informa, não impede: nenhuma ação desta tela é travada
        por ela (gravar pede motivo, ver `pendenciaCadastro`).
      */}
      {/*
        Casca V4 (18/10/2026) — mockup aprovado "Caso 360": cabeçalho em
        CaCard branco com nome, subtítulo (tipo de serviço · etapa) e as
        abas-pílula. As pílulas são o MESMO índice das 8 SECOES (antes uma
        <nav> solta mais abaixo) — só mudou de lugar e de casca; nenhum
        mecanismo novo de abas.
      */}
      <div className="mb-4" data-caso360-identidade>
      <CaCard>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Lote A · Entrada e caso</p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-2xl text-navy">{String(caso["titulo"] ?? "Caso sem título")}</h2>
            <p className="mt-1 text-sm text-navy/70" data-caso360-subtitulo>
              {String(caso["tipo_servico"] ?? "").trim() || "Tipo de serviço não registrado"} ·{" "}
              {etapaAtualPlanejador ?? "Etapa não registrada"}
            </p>
            <p className="mt-0.5 text-xs text-navy/55">
              {String(caso["codigo"] ?? "Sem código")} · {caso["ativo"] ? "Caso ativo" : rotulo(STATUS_DERIVADO, derivado.valor)}
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] ${bloqueiosReais.length ? "border-terracotta/40 bg-terracotta/10 text-navy" : "border-navy/15 text-navy/70"}`}
            data-caso360-pendencia-informativa
          >
            {bloqueiosReais.length
              ? `${bloqueiosReais.length} pendência(s) de ativação · informa, não impede`
              : "Sem pendências de ativação"}
          </span>
        </div>
        <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2" data-caso360-origem>
          <div className="flex flex-wrap gap-1.5">
            <dt className="text-navy/55">Origem do sinal:</dt>
            <dd className="text-navy">
              {(() => {
                const lead = (q.data as any)?.leadOrigem as Record<string, any> | null | undefined;
                if (!lead) return "Sem lead de origem vinculado";
                return [lead.origem, lead.estagio].filter(Boolean).map(String).join(" · ") || "Lead vinculado, sem canal registrado";
              })()}
            </dd>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <dt className="text-navy/55">Ativação:</dt>
            <dd className="text-navy">
              {bloqueiosReais.length ? `${bloqueiosReais.length} requisito(s) em aberto` : "Elegível para ativação"}
            </dd>
          </div>
        </dl>
        <div className="mt-3 border-t border-navy/10 pt-3" data-ordem2-identidade-desk>
        <ChipIdentidadeCaso
          superficie="Desk"
          identidade={identidadeDeCrmCaso({
            id: String(caso["id"]),
            codigo: (caso["codigo"] as string | null) ?? null,
            titulo: (caso["titulo"] as string | null) ?? null,
          })}
        />
        </div>
        {/* Índice: âncoras fixas; seções fora de foco ficam no DOM com hidden. */}
        <nav aria-label="Seções do caso" className="mt-4 flex flex-wrap gap-2 border-t border-navy/10 pt-4">
          {SECOES.map((a) => (
            <a
              key={a.id}
              href={`#secao-${a.id}`}
              onClick={() => {
                setSecaoFoco(a.id);
                setPilulaVisaoConcretaAtiva(false);
              }}
              aria-current={secaoFoco === a.id && !pilulaVisaoConcretaAtiva ? "true" : undefined}
              className={
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                (secaoFoco === a.id && !pilulaVisaoConcretaAtiva
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/15 bg-card text-navy/70 hover:bg-cream hover:text-navy")
              }
            >
              {a.rotulo}
            </a>
          ))}
          {/*
            Decisão da Proprietária, 19/10/2026: pílula própria "Visão
            Concreta" no índice do Caso 360 (não aninhada). Reaproveita a
            mesma seção/sub-aba "Visão" já construída — zero composição
            duplicada — só força a ficha aberta e a sub-aba certa num clique.
          */}
          <a
            href="#secao-visao"
            onClick={() => {
              setSecaoFoco("visao");
              setAbaVisao("concreta");
              setPilulaVisaoConcretaAtiva(true);
            }}
            aria-current={pilulaVisaoConcretaAtiva ? "true" : undefined}
            data-pilula-visao-concreta
            className={
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (pilulaVisaoConcretaAtiva
                ? "border-navy bg-navy text-cream"
                : "border-navy/15 bg-card text-navy/70 hover:bg-cream hover:text-navy")
            }
          >
            Visão Concreta
          </a>
          <button
            type="button"
            onClick={() => {
              setSecaoFoco(null);
              setPilulaVisaoConcretaAtiva(false);
            }}
            className={
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (secaoFoco === null
                ? "border-gold bg-gold text-navy"
                : "border-navy/15 bg-card text-navy/70 hover:bg-cream hover:text-navy")
            }
          >
            Ver página completa
          </button>
        </nav>
      </CaCard>
      </div>
      {/*
        Prancha V4 (13/10/2026) — grade de cartões da Visão geral do Caso 360,
        organizada pelos 4 lotes da especificação canônica
        (docs/arquitetura/2026-10-13-reparacao-caso-360-padrao-golive-4-lotes.md):
        A Entrada e caso · B Pesquisa e árvore · C Proposta, escopo e contrato ·
        D Publicação e App. Os lotes são leitura da Visão geral; as 8 SECOES
        continuam sendo a navegação. Tudo com dado JÁ carregado nesta tela —
        nenhuma query nova, nenhum mock.

        §14 linha 5 do De-Para: "Progresso por frente — Formalização,
        Pesquisa, Documentos, Publicação | concluída / em andamento / em
        coleta / inicial. Não usar percentual sem fórmula documentada." Por
        isso a barra é uma escala de 4 estados, nunca uma porcentagem.
        `progressoPorFrente` (caso-ficha.ts) deriva cada frente de dado já
        carregado (contrato_assinado, dossiê, documentos_minimos_ok, publicação).
      */}
      {/*
        Casca V4 (18/10/2026) — uma grade única (1 coluna no celular,
        2 no desktop) na ordem do mockup: Linha do tempo · Participantes ·
        Progresso por frente · Estados do dossiê · Jornada (largura total),
        depois os lotes C e D. Os 4 lotes continuam marcados na fonte
        (`data-caso360-lote`) e como eyebrow de cada CaCard; as seções de
        lote usam `display: contents` para que os cartões entrem na mesma
        grade e a ordem visual venha de `order-*`.
      */}
      {(() => {
        const ESCALA_FRENTE = ["inicial", "em_coleta", "em_andamento", "concluida"] as const;
        /*
          DECISÃO EXECUTIVA 14/10/2026 ("ACABAMENTO VISUAL DO CASO 360"):
          contraste suave + respiro (casca V4, 18/10/2026: o cartão avulso
          virou o CaCard canônico — mesma superfície do Desk) e badges de status pelos tokens semânticos reais do projeto
          (sucesso/atencao/critico — AGENTS.md proíbe hex literal e paleta
          Tailwind padrão como emerald-50/amber-50/rose-50/slate-200).
        */
        const tomStatusCadastral = { completo: "sucesso", parcial: "atencao", pendente: "critico" } as const;
        const dossieResumo = estadoDossieDoCaso(qPesquisa.data?.evidencias ?? []);
        const progresso = progressoPorFrente({
          contratoAssinado: Boolean(caso["contrato_assinado"]),
          dossie: dossieResumo,
          documentosMinimosOk: Boolean(caso["documentos_minimos_ok"]),
          documentosRegistrados: ((qDocumentos.data ?? []) as unknown[]).length,
          publicacao: {
            publicadas: qVisaoCliente.data?.estadoPublicacao?.publicadas ?? 0,
            pendentes: qVisaoCliente.data?.estadoPublicacao?.pendentes ?? 0,
            arquivadas: qVisaoCliente.data?.estadoPublicacao?.arquivadas ?? 0,
          },
        });
        return (
          <div className="mb-6 grid gap-4 lg:grid-cols-2" data-caso360-resumo-v4 data-desk-mockup4="caso">
            <section aria-label="Lote A · Entrada e caso" data-caso360-lote="A" className="contents">
                <div className="order-3 min-w-0" data-caso360-progresso-frente>
                <CaCard className="h-full" eyebrow="Lote A · Entrada e caso" titulo="Progresso do caso por frente">
                  {/*
                    13/10/2026 — Proprietária: a barra da prancha é sempre
                    desenhada. Comprimento = degrau atingido na escala de 4
                    estados de `progressoPorFrente` (inicial 1/4 · em coleta 2/4 ·
                    em andamento 3/4 · concluída 4/4); o texto mostra o estado.
                    Escala ordinal, não percentual de execução.
                  */}
                  <BarrasHorizontais
                    tituloAcessivel={`Progresso do caso por frente: ${(
                      [
                        ["formalizacao", "Formalização"],
                        ["pesquisa", "Pesquisa"],
                        ["documentos", "Documentos"],
                        ["publicacao", "Publicação"],
                      ] as const
                    )
                      .map(([chave, rotulo]) => `${rotulo} ${ROTULO_FRENTE[progresso[chave]].toLowerCase()}`)
                      .join(", ")}`}
                    itens={(
                      [
                        ["formalizacao", "Formalização"],
                        ["pesquisa", "Pesquisa"],
                        ["documentos", "Documentos"],
                        ["publicacao", "Publicação"],
                      ] as const
                    ).map(([chave, rotulo]) => {
                      const estado = progresso[chave];
                      const nivel = ESCALA_FRENTE.indexOf(estado as (typeof ESCALA_FRENTE)[number]);
                      return {
                        rotulo,
                        // 19/10/2026 — prancha V4: cada degrau da escala ordinal
                        // ocupa 1/4 do trilho (inicial já mostra o primeiro
                        // degrau); só "em andamento" em dourado, como na prancha.
                        valor: ((Math.max(0, nivel) + 1) / ESCALA_FRENTE.length) * 100,
                        apoio: ROTULO_FRENTE[estado],
                        tom: estado === "em_andamento" ? ("gold" as const) : ("navy" as const),
                      };
                    })}
                  />
                  <ul className="sr-only">
                    {(["formalizacao", "pesquisa", "documentos", "publicacao"] as const).map((chave) => (
                      <li key={chave} data-caso360-frente={chave}>
                        {ROTULO_FRENTE[progresso[chave]]}
                      </li>
                    ))}
                  </ul>
                </CaCard>
                </div>
                <div className="order-1 min-w-0" data-caso360-linha-tempo role="group" aria-label="Linha do tempo do caso">
                <CaCard className="h-full" eyebrow="Lote A · Entrada e caso" titulo="Linha do tempo">
                  {(() => {
                    const quando = (e: any) => new Date(String(e.occurred_at ?? e.created_at ?? 0)).getTime();
                    const eventos = ((q.data?.timeline ?? []) as any[])
                      .slice(0, 4)
                      .sort((a, b) => quando(a) - quando(b))
                      .map((e) => ({
                        id: String(e.id),
                        nome: String(e.title ?? "Evento registrado"),
                        data:
                          e.occurred_at || e.created_at
                            ? new Date(String(e.occurred_at ?? e.created_at)).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                            : null,
                      }));
                    return <LinhaTempoGrafica eventos={eventos} />;
                  })()}
                </CaCard>
                </div>
                <div className="order-5 min-w-0 lg:col-span-2" data-caso360-jornada>
                <CaCard eyebrow="Lote A · Entrada e caso" titulo="Jornada D0–D365">
                  {(() => {
                    const marcos = qCadeia.data?.planejador?.marcos ?? [];
                    const fase = String(qCadeia.data?.planejador?.fase_jornada ?? qCadeia.data?.planejador?.etapa ?? "")
                      .toLowerCase()
                      .replace(/_/g, " ");
                    const atual = fase ? marcos.findIndex((m) => String(m).toLowerCase().includes(fase)) : -1;
                    return (
                      <div className="mt-1">
                        <JornadaMarcos marcos={marcos} atual={atual >= 0 ? atual : null} />
                        {!marcos.length ? (
                          <p className="mt-2 text-[10px] text-navy/50">Nenhum marco registrado no planejador.</p>
                        ) : null}
                      </div>
                    );
                  })()}
                  {/*
                    Linha de chips do mockup: Etapa atual / Cadência / Próxima
                    ação / Microentrega / Alertas. Cadência não tem fonte
                    carregada nesta tela — mostra o vazio honesto, sem inferir.
                  */}
                  <dl className="mt-5 grid gap-x-4 gap-y-2 border-t border-navy/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-5" data-caso360-jornada-chips>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-navy/5 pb-2">
                      <dt className="shrink-0 text-xs text-navy/70">Etapa atual</dt>
                      <dd className="min-w-0 max-w-[60%] truncate rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-xs text-navy">
                        {etapaAtualPlanejador ?? "Etapa não registrada"}
                      </dd>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-navy/5 pb-2">
                      <dt className="shrink-0 text-xs text-navy/70">Cadência</dt>
                      <dd className="min-w-0 max-w-[60%] truncate rounded-full border border-dashed border-navy/20 px-2.5 py-0.5 text-xs text-navy/55">
                        Sem dado registrado ainda
                      </dd>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-navy/5 pb-2">
                      <dt className="shrink-0 text-xs text-navy/70">Próxima ação</dt>
                      <dd className="min-w-0 max-w-[60%] truncate rounded-full border border-navy/15 px-2.5 py-0.5 text-xs text-navy">
                        {canonica?.acao ?? "Sem próxima ação definida"}
                      </dd>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-navy/5 pb-2">
                      <dt className="shrink-0 text-xs text-navy/70">Microentrega</dt>
                      <dd className="min-w-0 max-w-[60%] truncate rounded-full border border-navy/15 px-2.5 py-0.5 text-xs text-navy">
                        {(() => {
                          const ultima = ((qc2.data?.entregas ?? []) as any[])[0];
                          return ultima ? String(ultima.title_client ?? "Microentrega sem título") : "Nenhuma microentrega registrada";
                        })()}
                      </dd>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-2 border-b border-navy/5 pb-2">
                      <dt className="shrink-0 text-xs text-navy/70">Alertas</dt>
                      <dd className="min-w-0 max-w-[60%] truncate rounded-full border border-navy/15 px-2.5 py-0.5 text-xs text-navy">
                        {(() => {
                          const n = ((qc2.data?.alertas ?? []) as any[]).filter(
                            (a) => a.criticidade === "critica" && a.status !== "completed",
                          ).length;
                          return n ? `${n} crítico(s)` : "Nenhum crítico";
                        })()}
                      </dd>
                    </div>
                  </dl>
                </CaCard>
                </div>
            </section>
            <section aria-label="Lote B · Pesquisa e árvore" data-caso360-lote="B" className="contents">
                <div className="order-2 min-w-0" data-caso360-participantes>
                <CaCard className="h-full" eyebrow="Lote B · Pesquisa e árvore" titulo="Núcleo familiar e participantes">
                  {(() => {
                    const membros = (q.data?.membros ?? []) as any[];
                    if (!membros.length)
                      return (
                        <div className="flex items-center gap-2" data-caso360-participantes-vazio>
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-navy/25 text-[11px] text-navy/35" aria-hidden="true">
                            —
                          </span>
                          <span className="text-xs text-navy/55">Nenhum participante registrado ainda.</span>
                        </div>
                      );
                    return (
                      <div className="space-y-3">
                        {membros.slice(0, 4).map((membro, i) => {
                          const status = String(membro.status_cadastral ?? "pendente") as keyof typeof tomStatusCadastral;
                          return (
                            <div key={membro.id} className="flex items-center justify-between gap-2">
                              <Pessoa
                                nome={String(membro.nome ?? membro.nome_completo ?? "Pessoa sem nome registrado")}
                                papel={String(membro.papel ?? "Papel não registrado")}
                                destaque={i === 0}
                              />
                              <Etiqueta
                                texto={rotulo(STATUS_CADASTRAL, membro.status_cadastral)}
                                tom={tomStatusCadastral[status] ?? "neutro"}
                              />
                            </div>
                          );
                        })}
                        {membros.length > 4 ? (
                          <p className="text-[10px] text-navy/55">+ {membros.length - 4} pessoa(s) em Pessoa e família</p>
                        ) : null}
                      </div>
                    );
                  })()}
                </CaCard>
                </div>
                <div className="order-4 min-w-0" data-caso360-dossie>
                <CaCard className="h-full" eyebrow="Lote B · Pesquisa e árvore" titulo="Estados do dossiê">
                  <DonutEstados
                    tituloAcessivel={`Estado do dossiê: ${dossieResumo.confirmados} confirmados, ${dossieResumo.emRevisao} em revisão, ${dossieResumo.pendentes} pendentes.`}
                    segmentos={[
                      { rotulo: "Confirmados", valor: dossieResumo.confirmados, tom: "sucesso" },
                      { rotulo: "Em revisão", valor: dossieResumo.emRevisao, tom: "gold" },
                      { rotulo: "Pendentes", valor: dossieResumo.pendentes, tom: "navy" },
                    ]}
                  />
                  <p className="mt-3 text-[10px] text-navy/55" role={qPesquisa.isError ? "alert" : undefined}>
                    {qPesquisa.isLoading
                      ? "Carregando o dossiê…"
                      : qPesquisa.isError
                        ? "Não foi possível carregar o dossiê."
                        : dossieResumo.total
                          ? `${dossieResumo.total} evidência(s) registrada(s) · situação atual do caso.`
                          : "Nenhuma evidência registrada no dossiê ainda."}
                  </p>
                </CaCard>
                </div>
            </section>
            <section aria-label="Lote C · Proposta, escopo e contrato" data-caso360-lote="C" className="contents">
                <div className="order-6 min-w-0" data-caso360-formalizacao>
                <CaCard className="h-full" eyebrow="Lote C · Proposta, escopo e contrato" titulo="Proposta, escopo e contrato">
                  <div>
                    <Linha rotulo="Etapa comercial" valor={String(rotulo(EIXO_COMERCIAL, v("eixo_comercial")))} />
                    <Linha rotulo="Formalização" valor={String(rotulo(EIXO_FORMALIZACAO, v("eixo_formalizacao")))} />
                    <Linha rotulo="Contrato" valor={String(caso["contrato_assinado"] ? "Assinado" : "Assinatura não registrada")} />
                  </div>
                  <a href="#secao-comercial" onClick={() => setSecaoFoco("comercial")} className="mt-4 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4">Abrir Formalização</a>
                </CaCard>
                </div>
                <div className="order-7 min-w-0" data-caso360-condicao>
                <CaCard className="h-full" eyebrow="Lote C · Proposta, escopo e contrato" titulo="Condição comercial">
                  {qFinanceiro.isLoading ? (
                    <p className="text-sm text-navy/60" role="status">Carregando condição comercial…</p>
                  ) : qFinanceiro.isError ? (
                    <p className="text-sm text-terracotta" role="alert">Não foi possível carregar a condição comercial.</p>
                  ) : (
                    <p className="text-sm text-navy">{qFinanceiro.data?.condicaoComercial ?? "Nenhuma condição comercial registrada."}</p>
                  )}
                  <a href="#secao-financeiro" onClick={() => setSecaoFoco("financeiro")} className="mt-4 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4">Abrir Financeiro</a>
                </CaCard>
                </div>
            </section>
            <section aria-label="Lote D · Publicação e App" data-caso360-lote="D" className="contents">
                <div className="order-8 min-w-0" data-caso360-prontidao-app>
                <CaCard className="h-full" eyebrow="Lote D · Publicação e App" titulo="Prontidão para o App">
                  {qVisaoCliente.isLoading ? (
                    <p className="text-sm text-navy/60" role="status">Carregando o estado do App…</p>
                  ) : qVisaoCliente.isError || !qVisaoCliente.data ? (
                    <p className="text-sm text-terracotta" role="alert">Não foi possível carregar o estado do App.</p>
                  ) : (
                    <div>
                      <Linha rotulo="Acesso da família" valor={String(qVisaoCliente.data.acesso.liberado ? "Liberado" : "Não liberado")} />
                      <Linha rotulo="Publicado no App" valor={String(qVisaoCliente.data.estadoPublicacao.publicadas)} />
                      <Linha rotulo="Aguardando publicação" valor={String(qVisaoCliente.data.estadoPublicacao.pendentes)} />
                    </div>
                  )}
                  <p className="mt-3 text-[11px] text-navy/50">O App mostra só o que foi aprovado e publicado; notas internas ficam no Desk.</p>
                  <Link to="/app-cliente-como-pessoa" search={{ casoId: id }} className="mt-4 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4">Ver como a família vê</Link>
                </CaCard>
                </div>
                <div className="order-9 min-w-0" data-caso360-acervo>
                <CaCard className="h-full" eyebrow="Lote D · Publicação e App" titulo="Cofre e acervo">
                  {qDocumentos.isLoading ? (
                    <p className="text-sm text-navy/60" role="status">Carregando documentos…</p>
                  ) : qDocumentos.isError ? (
                    <p className="text-sm text-terracotta" role="alert">Não foi possível carregar os documentos.</p>
                  ) : (
                    <div>
                      <Linha rotulo="Documentos registrados" valor={String(((qDocumentos.data ?? []) as unknown[]).length)} />
                      <Linha rotulo="Documentos mínimos" valor={String(caso["documentos_minimos_ok"] ? "Confirmados" : "Não confirmados")} />
                      <Linha rotulo="Disponíveis à família" valor={String(qVisaoCliente.data?.documentosDisponiveis ?? "—")} />
                    </div>
                  )}
                  <a href="#secao-documentos" onClick={() => setSecaoFoco("documentos")} className="mt-4 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4">Abrir Documentos</a>
                </CaCard>
                </div>
            </section>
          </div>
        );
      })()}

      <details className="mb-6 rounded-lg border border-navy/15 bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy">
          Abrir requisitos de ativação e bloqueios
        </summary>
        <div className="mt-4 border-t border-navy/10 pt-4">
          <ResumoKitCaso caseId={String(caso["id"])} />
        </div>
      </details>
      {/*
        CA04-CASO360-SIMPLES (09/09/2026) — mockup aprovado define a primeira
        superfície: Situação hoje/Próxima ação/Responsável/Prazo/Motivo/
        Impacto e seis ações, acima da dobra. Nada do que existia foi perdido:
        eixos comerciais completos, estado de ativação e os links de pesquisa
        continuam abaixo, nos quatro resumos; gates/logs/histórico foram para
        "Dados técnicos e validações", recolhida, no fim da página.
      */}
      <CaseHealthHero
        saude={saudeDoCaso({
          bloqueios: bloqueiosReais.length,
          temProximaAcao: Boolean(canonica?.acao),
          temResponsavel: Boolean(canonica?.responsavel),
          temPrazo: Boolean(canonica?.prazo),
        })}
        situacao={caso["ativo"] ? "Caso ativo" : rotulo(STATUS_DERIVADO, derivado.valor)}
        proximaAcao={canonica?.acao ?? "Sem próxima ação definida"}
        seloProximaAcao={canonica ? SELO_PROXIMA_ACAO[canonica.origem] : null}
        responsavel={canonica?.responsavel || "Sem responsável"}
        prazo={canonica?.prazo ? new Date(String(canonica.prazo)).toLocaleDateString("pt-BR") : "Sem prazo definido"}
        motivo={derivado.motivo}
        impacto={
          bloqueiosReais.length === 0
            ? "Nenhum bloqueio real — elegível para ativação"
            : `Ativação bloqueada — ${bloqueiosReais.length} pendência(s), primeiro: ${bloqueiosReais[0]?.motivo ?? "—"}`
        }
        resolverBloqueio={bloqueiosReais.length > 0 && bloqueiosReais[0]?.cta_tela ? { href: bloqueiosReais[0].cta_tela } : null}
      >
        <>
          <button
            type="button"
            disabled={mConcluir.isPending || !canonica}
            onClick={() => mConcluir.mutate()}
            title="Marca a próxima ação como concluída — sem nova ação necessária por ora."
            className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-cream disabled:opacity-40"
          >
            Concluir
          </button>
          <button
            type="button"
            disabled={mReprogramar.isPending}
            onClick={() => {
              const atual = canonica?.prazo ? String(canonica.prazo).slice(0, 10) : "";
              const novo = prompt("Novo prazo (AAAA-MM-DD):", atual);
              if (!novo?.trim()) return;
              mReprogramar.mutate(novo.trim());
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
          >
            Reprogramar
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("form-tarefa-caso")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
          >
            Criar tarefa
          </button>
          <label className="flex items-center rounded-lg border border-navy/20 px-1 text-sm text-navy hover:bg-navy/5">
            <select
              aria-label="Mover fase"
              className="bg-transparent py-2 pl-2 pr-1 text-sm text-navy outline-none disabled:opacity-40"
              value=""
              disabled={mMoverFase.isPending}
              title="Move a fase comercial deste caso (mesmo campo do dropdown 'Etapa comercial' em Formalização)."
              onChange={(e) => {
                const valor = e.target.value;
                if (!valor) return;
                mMoverFase.mutate(valor);
                e.target.value = "";
              }}
            >
              <option value="">Mover fase…</option>
              {EIXO_COMERCIAL.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={mRegistrarAtualizacao.isPending}
            onClick={() => {
              const texto = prompt("O que aconteceu de novo neste caso?");
              if (!texto?.trim()) return;
              mRegistrarAtualizacao.mutate(texto.trim());
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
          >
            Registrar atualização
          </button>
          <a
            href="#secao-jornada"
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
            title="Abre a seção Jornada, onde a microentrega é preparada e enviada à revisão."
          >
            Preparar microentrega
          </a>
          <Link
            to="/app-cliente-como-pessoa"
            search={{ casoId: String(caso["id"]) }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
          >
            Abrir Visão Administrativa do Cliente
          </Link>
          {clienteId ? (
            <Link
              to="/pessoas/$clienteId"
              params={{ clienteId }}
              className="rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm font-medium text-navy hover:bg-gold/20"
            >
              Abrir Pessoa 360
            </Link>
          ) : null}
        </>
      </CaseHealthHero>

      {erro ? (
        <p className="mb-4 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-navy">
          {erro}
        </p>
      ) : null}
      {!erro && !sujo && camposSalvos.length ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/80">
          Conferido no banco após gravar: {camposSalvos.join(", ")}.
        </p>
      ) : null}
      {pendenciaCadastro ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaCadastro} A edição segue disponível por decisão sua e a
          gravação pede motivo.
        </p>
      ) : null}

      {qc2.isError ? (
        <div
          role="alert"
          className="mb-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs"
        >
          <p className="font-medium text-destructive">
            Não foi possível carregar o consolidado canônico do caso (aliases, etiquetas, produto,
            onboarding, núcleos).
          </p>
          <p className="text-navy/80">
            {qc2.error instanceof Error ? qc2.error.message : "Erro desconhecido."}
          </p>
          <BotaoTentarNovamente aoClicar={() => void qc2.refetch()} />
        </div>
      ) : null}

      {/* Ordem P0 (21/09/2026) — Estado Integrado do Caso: consolida os
          domínios transversais num só bloco, só leitura, sem duplicar
          nenhuma das queries já feitas acima. */}
      <details className="mb-6 rounded-lg border border-navy/15 bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy">Abrir estado integrado e fontes do caso</summary>
        <div className="mt-4 border-t border-navy/10 pt-4">
      <EstadoIntegradoCaso
        caseId={id}
        caso={caso}
        cliente={(q.data?.cliente as Record<string, any> | null) ?? null}
        clienteId={clienteId ?? null}
        membros={(q.data?.membros ?? []) as Record<string, any>[]}
        nucleos={(q.data?.nucleos ?? []) as Record<string, any>[]}
        servicos={(qc2.data?.servicos ?? []) as Record<string, any>[]}
        produtos={(qc2.data?.produtos ?? []) as Record<string, any>[]}
        planejador={
          qCadeia.data?.planejador
            ? {
                etapa: qCadeia.data.planejador.etapa ?? null,
                faseJornada: qCadeia.data.planejador.fase_jornada ?? null,
                produtoPaiId: qCadeia.data.planejador.produto_pai_id ?? null,
                rotaConfirmada: qCadeia.data.planejador.rotaConfirmada ?? null,
                marcos: qCadeia.data.planejador.marcos ?? [],
              }
            : null
        }
        onboarding={(qc2.data?.onboarding ?? []) as Record<string, any>[]}
        ultimaEntrega={((qc2.data?.entregas ?? []) as Record<string, any>[])[0] ?? null}
        timelineUltimoEvento={((q.data?.timeline ?? []) as Record<string, any>[])[0] ?? null}
        contratoStatus={rotulo(EIXO_FORMALIZACAO, v("eixo_formalizacao"))}
        leadOrigem={((q.data as any)?.leadOrigem ?? null) as Record<string, any> | null}
        pesquisa={
          qPesquisa.data
            ? {
                pessoas: ((qPesquisa.data as any).pessoas ?? []).length,
                relacoes: ((qPesquisa.data as any).relacoes ?? []).length,
                evidencias: ((qPesquisa.data as any).evidencias ?? []).length,
                confirmadas: estadoDossieDoCaso((qPesquisa.data as any).evidencias ?? []).confirmados,
                achados: ((qPesquisa.data as any).achados ?? []).length,
              }
            : null
        }
        proximoPasso={
          canonica
            ? {
                acao: canonica.acao ?? null,
                responsavel: (canonica as any).responsavel ?? null,
                prazo: (canonica as any).prazo ?? null,
                bloqueios: bloqueiosReais.length,
                primeiroBloqueio: bloqueiosReais[0]?.motivo ?? null,
              }
            : null
        }
        acessoApp={
          qVisaoCliente.data
            ? {
                liberado: Boolean(qVisaoCliente.data.acesso?.liberado),
                statusAcesso: qVisaoCliente.data.acesso?.statusAcesso ?? null,
                ultimoAcessoEm: (qVisaoCliente.data.acesso as any)?.ultimoAcessoEm ?? null,
              }
            : null
        }
      />
        </div>
      </details>

      {/* Quatro resumos acionáveis — cada um leva à seção completa, já preservada abaixo. */}
      <details className="mb-6 rounded-lg border border-navy/15 bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy">Abrir resumos operacionais do caso</summary>
      <div className="mt-4 grid gap-3 border-t border-navy/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {/*
          FIDELIDADE-VISUAL-2026-09-23: a contagem de bloqueio já está no
          campo "Impacto" do hero, com o link de resolução — este resumo não
          repete o mesmo número, só aponta para a seção onde onboarding e
          fechamento acontecem.
        */}
        <a href="#secao-jornada" className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)] hover:border-gold/60">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Jornada/onboarding</p>
          <p className="mt-1 text-sm font-medium text-navy">
            {sugestoes.length ? sugestoes[0].titulo : "Ver jornada, onboarding e fechamento"}
          </p>
        </a>
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)] hover:border-gold/60">
          <a href="#secao-pessoas" className="block rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Pessoas/família</p>
            <p className="mt-1 text-sm font-medium text-navy">
              {(q.data?.membros ?? []).length} pessoa(s) no caso
            </p>
          </a>
          <VinculoNucleo
            caseId={String(caso["id"])}
            codigoCaso={(caso["codigo"] as string | null) ?? null}
            papelRegistro={(caso["papel_registro"] as string | null) ?? null}
            finalidade={(caso["finalidade_registro"] as string | null) ?? null}
            estadoDerivado={(caso["status_caso_derivado"] as string | null) ?? null}
          />
        </div>
        <a href="#secao-comercial" className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)] hover:border-gold/60">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Contrato</p>
          <p className="mt-1 text-sm font-medium text-navy">{rotulo(EIXO_COMERCIAL, v("eixo_comercial"))}</p>
          <p className="text-xs text-navy/60">{rotulo(EIXO_FORMALIZACAO, v("eixo_formalizacao"))}</p>
        </a>
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Pesquisa/entregas</p>
          {qPesquisa.isLoading ? (
            <p className="mt-1 text-xs text-navy/50">Carregando resumo de pesquisa…</p>
          ) : qPesquisa.isError ? (
            <p className="mt-1 text-xs text-terracotta">Não foi possível carregar o resumo de pesquisa.</p>
          ) : (
            (() => {
              const c = qPesquisa.data;
              const evidencias = c?.evidencias ?? [];
              /*
                §14 linha 6 do De-Para: "Estado do dossiê — Confirmados N,
                Em revisão N, Pendentes N; donut; reconciliar com o dossiê
                real". estadoDossieDoCaso classifica cada evidência em
                exatamente UM dos três buckets (soma = total). Ver
                pesquisa-cadeia.ts para a fonte canônica.
              */
              const dossie = estadoDossieDoCaso(evidencias);
              const pendencias = (c?.pendencias ?? []).filter((p: any) => p.status !== "resolvido" && pendenciaPesquisaAberta(p.status)).length;
              const achados = c?.achados?.length ?? 0;
              // Donut acessível: três segmentos proporcionais, com legenda
              // textual (status nunca só por cor).
              const semEvidencia = dossie.total === 0;
              const donut = (() => {
                // Sem evidência a rosca continua desenhada, em anel neutro, sem fatia inventada.
                if (semEvidencia) {
                  return (
                    <div
                      role="img"
                      aria-label="Dossiê: sem dados suficientes. Nenhuma evidência registrada no caso."
                      className="relative h-20 w-20 shrink-0 rounded-full bg-navy/10"
                      data-caso360-dossie-donut
                      data-caso360-dossie-vazio
                    >
                      <div className="absolute inset-[9px] grid place-items-center rounded-full bg-card text-center">
                        <span className="font-serif text-lg leading-none text-navy/40">0</span>
                        <span className="text-[8px] uppercase leading-none tracking-wide text-navy/40">evid.</span>
                      </div>
                    </div>
                  );
                }
                const g1 = (dossie.confirmados / dossie.total) * 360;
                const g2 = g1 + (dossie.emRevisao / dossie.total) * 360;
                return (
                  <div
                    role="img"
                    aria-label={`Dossiê: ${dossie.confirmados} confirmados, ${dossie.emRevisao} em revisão, ${dossie.pendentes} pendentes`}
                    className="relative h-20 w-20 shrink-0 rounded-full"
                    data-caso360-dossie-donut
                    style={{
                      background: `conic-gradient(var(--color-emerald-600) 0deg ${g1}deg, var(--gold) ${g1}deg ${g2}deg, color-mix(in srgb, var(--terracotta) 70%, transparent) ${g2}deg 360deg)`,
                    }}
                  >
                    <div className="absolute inset-[9px] grid place-items-center rounded-full bg-card text-center">
                      <span className="font-serif text-lg leading-none text-navy">{dossie.total}</span>
                      <span className="text-[8px] uppercase leading-none tracking-wide text-navy/50">evid.</span>
                    </div>
                  </div>
                );
              })();
              return (
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  {donut}
                  <div className="min-w-0 flex-1">
                    {semEvidencia ? (
                      <p className="mb-1 text-xs font-medium text-navy/70">Sem dados suficientes</p>
                    ) : null}
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                        <span className="font-semibold text-emerald-700">{dossie.confirmados}</span>
                        <span className="text-navy/70">confirmados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                        <span className="font-semibold text-navy/80">{dossie.emRevisao}</span>
                        <span className="text-navy/70">em revisão</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-terracotta/70" aria-hidden="true" />
                        <span className="font-semibold text-terracotta">{dossie.pendentes}</span>
                        <span className="text-navy/70">pendentes</span>
                      </li>
                    </ul>
                    <p className="mt-1.5 text-[11px] text-navy/60">
                      {achados} achado(s)
                      {pendencias > 0 ? ` · ${pendencias} pendência(s) de pesquisa` : ""}
                    </p>
                    <p className="mt-0.5 text-[10px] text-navy/45">
                      {semEvidencia
                        ? "Nenhuma evidência registrada no caso ainda."
                        : `Soma bate com o dossiê real (${dossie.total} evidência(s) no caso).`}
                    </p>
                  </div>
                </div>
              );
            })()
          )}
          <ul className="mt-2 space-y-1 text-xs">
            <li>
              <Link to="/achados/$caseId" params={{ caseId: id }} className="text-navy underline decoration-gold underline-offset-4">
                Achados genealógicos →
              </Link>
            </li>
            <li>
              <Link to="/biblioteca-evidencias/$caseId" params={{ caseId: id }} className="text-navy underline decoration-gold underline-offset-4">
                Biblioteca de evidências →
              </Link>
            </li>
            <li>
              <Link to="/pesquisa-evidencias/$caseId" params={{ caseId: id }} className="text-navy underline decoration-gold underline-offset-4">
                Pesquisa e documentos →
              </Link>
            </li>
            <li>
              <Link to="/pessoas-linhagens/$caseId" params={{ caseId: id }} className="text-navy underline decoration-gold underline-offset-4">
                Pessoas e linhagens →
              </Link>
            </li>
            <li>
              <Link to="/plano-acao/$caseId" params={{ caseId: id }} search={{ foco: undefined }} className="text-navy underline decoration-gold underline-offset-4">
                Plano de ação de pesquisa →
              </Link>
            </li>
            <li>
              <Link to="/relatorios-fase/$caseId" params={{ caseId: id }} className="text-navy underline decoration-gold underline-offset-4">
                Relatórios de fase →
              </Link>
            </li>
            <li>
              <Link to="/fontes-genealogicas" className="text-navy underline decoration-gold underline-offset-4">
                Fontes e integrações →
              </Link>
            </li>
          </ul>
        </div>
        <div id="resumo-visao-cliente" className="ca-cartao-natureza sm:col-span-2" data-natureza="pessoas" data-como-familia-ve>
          {/* 18/10/2026 — leitura GoLive "como a família vê" dentro do Caso 360 (não é segundo Caso 360).
              Cada porta separa o que está publicado (vai ao App) do que é interno (não sai do Desk). */}
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Como a família vê</p>
          <p className="mt-1 text-xs text-navy/60">O que o App Cliente mostra hoje — só conteúdo sanitizado, aprovado e publicado.</p>
          {/* CA06-APP-NO-DESK: preferências sem fonte viva homologada — nunca inferido nem simulado. */}
          <p className="mt-1 text-xs text-navy/60">Preferências: sem fonte viva homologada</p>
          {qVisaoCliente.isLoading ? (
            <p className="mt-2 text-xs text-navy/50">Carregando…</p>
          ) : qVisaoCliente.isError ? (
            <p className="mt-2 text-xs text-terracotta">Não foi possível carregar a visão do cliente.</p>
          ) : (
            (() => {
              const v = qVisaoCliente.data;
              const portas: { id: string; titulo: string; natureza: string; publicado: string; interno: string }[] = [
                {
                  id: "pesquisa",
                  titulo: "Pesquisa",
                  natureza: "pesquisa",
                  publicado: v?.ultimaAtualizacaoLiberada ? `Atualização liberada: ${v.ultimaAtualizacaoLiberada.tipo}` : "Não registrado",
                  interno: `${v?.producaoInternaEmRevisao ?? 0} produção(ões) interna(s) em revisão; hipóteses e evidência bruta não saem`,
                },
                {
                  id: "arvore",
                  titulo: "Árvore",
                  natureza: "pessoas",
                  publicado: `${v?.projecoesDeArvore ?? 0} projeção(ões) de árvore publicada(s)`,
                  interno: "Pessoas e vínculos em pesquisa ou não aprovados",
                },
                {
                  id: "documentos",
                  titulo: "Documentos",
                  natureza: "pesquisa",
                  publicado: `${v?.documentosDisponiveis ?? 0} documento(s) disponível(is) ao titular`,
                  interno: "Checklist documental e acervo interno — não compartilhados",
                },
                {
                  id: "publicacoes",
                  titulo: "Publicações",
                  natureza: "acao",
                  publicado: `${v?.estadoPublicacao.publicadas ?? 0} publicada(s)`,
                  interno: `${v?.estadoPublicacao.pendentes ?? 0} pendente(s) · ${v?.microentregasProntasParaRevisao ?? 0} pronta(s) para revisão · ${v?.estadoPublicacao.arquivadas ?? 0} arquivada(s)`,
                },
                {
                  id: "conta",
                  titulo: "Conta",
                  natureza: "financeiro",
                  publicado: v?.acesso.liberado ? `Acesso liberado${v.acesso.statusAcesso ? ` (${v.acesso.statusAcesso})` : ""}` : "Acesso não liberado",
                  interno: "CPF, RG, endereço e pagamento não confirmado nunca vão ao App",
                },
                {
                  id: "historico",
                  titulo: "Histórico",
                  natureza: "neutro",
                  publicado: v?.ultimaAtualizacaoLiberada ? `Última liberação em ${String(v.ultimaAtualizacaoLiberada.em).slice(0, 10)}` : "Não registrado",
                  interno: v?.acesso.ultimoAcessoEm ? `Último acesso do cliente: ${String(v.acesso.ultimoAcessoEm).slice(0, 10)}` : "Sem acesso registrado; auditoria fica no Desk",
                },
              ];
              return (
                <>
                  <p className="mt-2 text-sm text-navy">
                    <span className="ca-selo-natureza mr-2" data-natureza="acao">Próximo passo publicado ao cliente</span>
                    {v?.proximaAcao?.acao ?? "Não registrado"}
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {portas.map((p) => (
                      <li key={p.id} className="ca-cartao-natureza" data-natureza={p.natureza} data-porta-familia={p.id}>
                        <p className="font-serif text-base text-navy">{p.titulo}</p>
                        <p className="mt-1 text-xs text-navy/80">
                          <span className="ca-selo-natureza mr-1" data-natureza="pessoas">Vai ao App</span>
                          {p.publicado}
                        </p>
                        <p className="mt-1 text-xs text-navy/60">
                          <span className="ca-selo-natureza mr-1" data-natureza="neutro">Só no Desk</span>
                          {p.interno}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              );
            })()
          )}
          <Link
            to="/biblioteca-evidencias/$caseId"
            params={{ caseId: id }}
            className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4"
          >
            Preparar, revisar, aprovar, liberar ou despublicar →
          </Link>
        </div>
        <div id="resumo-financeiro" className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)] sm:col-span-2 lg:col-span-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Financeiro</p>
          {qFinanceiro.isLoading ? (
            <p className="mt-2 text-xs text-navy/50">Carregando…</p>
          ) : qFinanceiro.isError ? (
            <p className="mt-2 text-xs text-terracotta">Não foi possível carregar o financeiro deste caso.</p>
          ) : (
            <>
              <dl className="mt-2 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-navy/50">Valor contratado</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.valorContratado == null
                      ? "Sem dados suficientes"
                      : `${qFinanceiro.data.moeda} ${qFinanceiro.data.valorContratado.toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Valor recebido</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.moeda} {qFinanceiro.data?.valorRecebido.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Saldo aberto</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.saldoAberto == null
                      ? "Sem dados suficientes"
                      : `${qFinanceiro.data.moeda} ${qFinanceiro.data.saldoAberto.toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Próxima parcela</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.proximaParcela
                      ? `${qFinanceiro.data.moeda} ${qFinanceiro.data.proximaParcela.valor.toFixed(2)} — ${qFinanceiro.data.proximaParcela.vencimento}`
                      : "Sem dados suficientes"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Status</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data ? ROTULO_STATUS_FINANCEIRO_CASO[qFinanceiro.data.status] : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Despesas de terceiros</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.despesasTerceiros
                      ? `${qFinanceiro.data.despesasTerceiros.total} registrada(s), ${qFinanceiro.data.despesasTerceiros.aguardandoAprovacao} aguardando aprovação`
                      : "Sem dados suficientes"}
                  </dd>
                </div>
                {/*
                  11/10/2026 — resposta normativa da Proprietária (Cláusula 9
                  do Estudo Genealógico v2): despesas de busca são pagas pelo
                  cliente, nunca custo do Clube. Este cartão é só informativo
                  e nunca deduz dos honorários/margem.
                */}
                <div>
                  <dt className="text-navy/50">Custos de busca</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data && qFinanceiro.data.custosBuscaCliente > 0
                      ? `${qFinanceiro.data.moeda} ${qFinanceiro.data.custosBuscaCliente.toFixed(2)}`
                      : "R$ 0,00"}
                  </dd>
                  <p className="mt-0.5 text-[11px] text-navy/50">Despesas de busca do cliente (não deduzem honorários)</p>
                  {qFinanceiro.data && qFinanceiro.data.custosBuscaCliente === 0 ? (
                    <p className="text-[11px] text-navy/40">Nenhuma despesa externa incorrida</p>
                  ) : null}
                </div>
                <div>
                  <dt className="text-navy/50">Margem bruta</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data ? `${qFinanceiro.data.moeda} ${qFinanceiro.data.margemBruta.toFixed(2)}` : "Sem dados suficientes"}
                  </dd>
                  <p className="mt-0.5 text-[11px] text-navy/50">Honorários do Clube (valor liquidado) — sem custo direto a deduzir</p>
                </div>
                <div>
                  <dt className="text-navy/50">Reembolsos (pagamentos estornados)</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.reembolsos
                      ? `${qFinanceiro.data.reembolsos.total} estorno(s) — ${qFinanceiro.data.moeda} ${qFinanceiro.data.reembolsos.valor.toFixed(2)}`
                      : "Sem dados suficientes"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Condição comercial</dt>
                  <dd className="mt-0.5 text-sm text-navy">{qFinanceiro.data?.condicaoComercial ?? "Sem dados suficientes"}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Próxima ação financeira</dt>
                  <dd className="mt-0.5 text-sm text-navy">{qFinanceiro.data?.proximaAcaoFinanceira}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!qFinanceiro.data?.proximaParcela || Boolean(rascunhoPagamento)}
                  onClick={() => {
                    const parcela = qFinanceiro.data?.proximaParcela;
                    setRascunhoPagamento({
                      valor: parcela ? String(parcela.valor) : "",
                      pagoEm: new Date().toISOString().slice(0, 10),
                      referencia: "",
                    });
                  }}
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
                  title={qFinanceiro.data?.proximaParcela ? undefined : "Sem parcela em aberto para registrar."}
                >
                  Registrar pagamento
                </button>
                <AcaoOperacional
                  rotulo="Preparar cobrança"
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
                  acaoExterna={qFinanceiro.data?.faturaRascunhoAberta ? "preparar_cobranca_caso" : undefined}
                  validacaoFormulario={rascunhoCobranca ? "O formulário de nova cobrança já está aberto." : null}
                  efeito={
                    qFinanceiro.data?.faturaRascunhoAberta
                      ? "Emite a fatura em rascunho já existente para este caso. Só prepara internamente."
                      : undefined
                  }
                  onConfirmar={() => {
                    const rascunho = qFinanceiro.data?.faturaRascunhoAberta;
                    if (rascunho) {
                      mPrepararCobranca.mutate({ faturaId: rascunho.faturaId });
                      return;
                    }
                    setRascunhoCobranca({ valor: "", vencimento: "", descricao: "" });
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      </details>

      <details className="mb-6 rounded-lg border border-navy/15 bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-navy">Abrir trabalho, documentos e alertas do caso</summary>
        <div className="mt-4 border-t border-navy/10 pt-4">
      {/* No máximo: três tarefas, três atualizações, documentos prioritários, microentregas recentes e alertas críticos. */}
      {rascunhoPagamento ? (
        <div className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-navy/15 bg-cream/40 p-3">
          <p className="w-full text-xs text-navy/60">Registrar pagamento</p>
          <label className="text-xs text-navy/60">
            Valor pago
            <input
              type="number"
              className={inputCls + " mt-1 w-28"}
              value={rascunhoPagamento.valor}
              onChange={(e) => setRascunhoPagamento({ ...rascunhoPagamento, valor: e.target.value })}
            />
          </label>
          <label className="text-xs text-navy/60">
            Data do pagamento
            <input
              type="date"
              className={inputCls + " mt-1"}
              value={rascunhoPagamento.pagoEm}
              onChange={(e) => setRascunhoPagamento({ ...rascunhoPagamento, pagoEm: e.target.value })}
            />
          </label>
          <label className="text-xs text-navy/60">
            Referência externa
            <input
              className={inputCls + " mt-1"}
              value={rascunhoPagamento.referencia}
              onChange={(e) => setRascunhoPagamento({ ...rascunhoPagamento, referencia: e.target.value })}
            />
          </label>
          <AcaoOperacional
            rotulo="Confirmar pagamento"
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
            acaoExterna="registrar_pagamento_caso"
            validacaoFormulario={
              !rascunhoPagamento.valor || !rascunhoPagamento.pagoEm || !rascunhoPagamento.referencia
                ? "Preencha valor, data e referência antes de confirmar."
                : null
            }
            efeito="Registra o pagamento como confirmado e propaga para o campo que libera o acesso do caso ao Portal do Cliente."
            onConfirmar={(motivo) => {
              const parcela = qFinanceiro.data?.proximaParcela;
              if (!parcela || mRegistrarPagamento.isPending) return;
              mRegistrarPagamento.mutate({
                invoiceId: parcela.faturaId,
                valor: Number(rascunhoPagamento.valor),
                pagoEm: rascunhoPagamento.pagoEm,
                referenciaExterna: rascunhoPagamento.referencia,
                motivo,
              });
              setRascunhoPagamento(null);
            }}
          />
          <button
            type="button"
            onClick={() => setRascunhoPagamento(null)}
            className="rounded-lg px-3 py-2 text-sm text-navy/60 hover:bg-navy/5"
          >
            Cancelar
          </button>
        </div>
      ) : null}
      {rascunhoCobranca ? (
        <div className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-navy/15 bg-cream/40 p-3">
          <p className="w-full text-xs text-navy/60">Preparar cobrança</p>
          <label className="text-xs text-navy/60">
            Valor da cobrança
            <input
              type="number"
              className={inputCls + " mt-1 w-28"}
              value={rascunhoCobranca.valor}
              onChange={(e) => setRascunhoCobranca({ ...rascunhoCobranca, valor: e.target.value })}
            />
          </label>
          <label className="text-xs text-navy/60">
            Vencimento
            <input
              type="date"
              className={inputCls + " mt-1"}
              value={rascunhoCobranca.vencimento}
              onChange={(e) => setRascunhoCobranca({ ...rascunhoCobranca, vencimento: e.target.value })}
            />
          </label>
          <label className="text-xs text-navy/60">
            Descrição interna
            <input
              className={inputCls + " mt-1"}
              value={rascunhoCobranca.descricao}
              onChange={(e) => setRascunhoCobranca({ ...rascunhoCobranca, descricao: e.target.value })}
            />
          </label>
          <AcaoOperacional
            rotulo="Confirmar preparação"
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
            acaoExterna="preparar_cobranca_caso"
            validacaoFormulario={
              !rascunhoCobranca.valor || !rascunhoCobranca.vencimento
                ? "Preencha valor e vencimento antes de confirmar."
                : null
            }
            efeito="Só prepara internamente. Nenhum link, mensagem ou cobrança é enviado ao cliente."
            onConfirmar={() => {
              if (mPrepararCobranca.isPending) return;
              mPrepararCobranca.mutate({
                valor: Number(rascunhoCobranca.valor),
                vencimento: rascunhoCobranca.vencimento,
                descricao: rascunhoCobranca.descricao,
              });
              setRascunhoCobranca(null);
            }}
          />
          <button
            type="button"
            onClick={() => setRascunhoCobranca(null)}
            className="rounded-lg px-3 py-2 text-sm text-navy/60 hover:bg-navy/5"
          >
            Cancelar
          </button>
        </div>
      ) : null}
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Tarefas</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {(qTarefas.data?.tarefas ?? []).slice(0, 3).map((t: any) => (
              <li key={t.id}>
                {t.titulo} <span className="text-xs text-navy/50">— {t.status}</span>
              </li>
            ))}
            {!(qTarefas.data?.tarefas ?? []).length ? <li className="text-navy/50">Nenhuma tarefa aberta.</li> : null}
          </ul>
          <FormularioTarefaCaso caseId={id} onCriada={recarregarTarefas} />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Atualizações recentes</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {((q.data?.timeline ?? []) as any[]).slice(0, 3).map((e) => (
              <li key={e.id}>
                {e.title ?? "Evento"}{" "}
                <span className="text-xs text-navy/50">
                  — {new Date(String(e.occurred_at ?? e.created_at)).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
            {!((q.data?.timeline ?? []) as any[]).length ? <li className="text-navy/50">Nenhuma atualização registrada.</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Documentos prioritários</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {((qDocumentos.data ?? []) as any[])
              .filter((d) => d.status !== "liberado")
              .slice(0, 3)
              .map((d) => (
                <li key={d.id}>
                  {d.titulo} <span className="text-xs text-navy/50">— {d.status}</span>
                </li>
              ))}
            {!((qDocumentos.data ?? []) as any[]).length ? <li className="text-navy/50">Nenhum documento registrado.</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Microentregas recentes</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {((qc2.data?.entregas ?? []) as any[]).slice(0, 3).map((m) => (
              <li key={m.id}>{m.title_client ?? "Microentrega"}</li>
            ))}
            {!((qc2.data?.entregas ?? []) as any[]).length ? <li className="text-navy/50">Nenhuma microentrega registrada.</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 lg:col-span-2">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Alertas críticos</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {((qc2.data?.alertas ?? []) as any[])
              .filter((a) => a.criticidade === "critica" && a.status !== "completed")
              .slice(0, 3)
              .map((a) => (
                <li key={a.id}>{a.titulo}</li>
              ))}
            {!((qc2.data?.alertas ?? []) as any[]).some((a) => a.criticidade === "critica" && a.status !== "completed") ? (
              <li className="text-navy/50">Nenhum alerta crítico.</li>
            ) : null}
          </ul>
        </div>
      </div>
        </div>
      </details>

      {/* 12/10/2026 — 5 etapas de leitura, derivadas das verificações existentes. */}
      <div className="mb-5">
        <BarraEtapasCaso
          caseId={id}
          aoAbrirSecao={(s) => {
            const alvo = SECOES.find((x) => x.id === s);
            if (alvo) setSecaoFoco(alvo.id);
          }}
        />
      </div>

      {/* Casca V4 (18/10/2026): o índice das 8 SECOES subiu para o cabeçalho (abas-pílula). */}

      <details
        open={(secaoFoco !== null && secaoFoco !== "visao") || pilulaVisaoConcretaAtiva}
        className="rounded-lg border border-navy/15 bg-card p-4"
      >
        <summary className="cursor-pointer text-sm font-medium text-navy">Abrir ficha operacional completa</summary>
      <div className="mt-5 space-y-8 border-t border-navy/10 pt-5">
        <SecaoAncora id="visao" titulo="Indicadores" hidden={secaoFoco !== null && secaoFoco !== "visao"}>
          {/* Corte U3 (28/09/2026): decisões que só a equipe toma, lidas do dado real. */}
          <div className="mb-4">
            <PendenciasHumanasCaso caseId={id} />
          </div>

          {/*
            Frente 1 (19/10/2026) — "Visão Concreta": sub-aba DENTRO da seção
            "Visão" (uma das 8 SECOES fixas), não uma 9ª seção. Consolida o
            que /golive/painel-caso.tsx já mostrava (linha do tempo,
            participantes/relações, dossiê documental, pesquisa e hipóteses,
            condição comercial/faturas e publicações) a partir dos leitores
            já parametrizados por caseId desta própria ficha.
          */}
          <div role="tablist" aria-label="Indicadores ou Visão Concreta" className="mb-4 flex gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={abaVisao === "indicadores"}
              onClick={() => {
                setAbaVisao("indicadores");
                setPilulaVisaoConcretaAtiva(false);
              }}
              className={
                "rounded-full border px-3 py-1 text-[12px] transition-colors " +
                (abaVisao === "indicadores"
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/15 bg-card text-navy/70 hover:bg-cream hover:text-navy")
              }
            >
              Indicadores
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={abaVisao === "concreta"}
              onClick={() => setAbaVisao("concreta")}
              className={
                "rounded-full border px-3 py-1 text-[12px] transition-colors " +
                (abaVisao === "concreta"
                  ? "border-navy bg-navy text-cream"
                  : "border-navy/15 bg-card text-navy/70 hover:bg-cream hover:text-navy")
              }
            >
              Visão Concreta
            </button>
          </div>

          {abaVisao === "concreta" ? (
            <div className="mb-6 space-y-6">
              <VisaoConcretaCaso
                caseId={id}
                timeline={(q.data?.timeline ?? []) as Record<string, unknown>[]}
                membros={(q.data?.membros ?? []) as Record<string, unknown>[]}
                documentos={(qDocumentos.data ?? []) as Record<string, unknown>[]}
                pesquisa={
                  qPesquisa.data
                    ? {
                        fontes: qPesquisa.data.fontes,
                        evidencias: qPesquisa.data.evidencias,
                        achados: qPesquisa.data.achados,
                        pessoas: qPesquisa.data.pessoas,
                        relacoes: qPesquisa.data.relacoes,
                      }
                    : null
                }
                financeiro={qFinanceiro.data ?? null}
                entregas={(qc2.data?.entregas ?? []) as Record<string, unknown>[]}
              />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
                  Resgate dos 4 lotes (golive-ficha.ts) — fonte, estado, responsável e visibilidade por campo
                </p>
                <FichaQuatroLotesGoLive casoId={String(caso["id"] ?? "")} />
              </div>
            </div>
          ) : null}

          <div className={abaVisao === "indicadores" ? "" : "hidden"}>
          <EstadoDados
            carregando={q.isLoading}
            erro={q.error}
            dados={comoPayload(q.data)}
            aoTentarNovamente={() => void q.refetch()}
            recurso="os indicadores do caso"
          >
            {([d]) => (
              <>
                <AbaVisaoGeral
                  caso={caso}
                  timeline={d.timeline}
                  blueprint={d.blueprint}
                  filaDrive={d.filaDrive}
                  financeiro={qFinanceiro.data ?? null}
                />
                {/*
                  07/09/2026 — "Radar Individual" (micro) do mockup do Desk:
                  o "Radar Interno" só tinha a Matriz de Prioridade (macro,
                  todos os casos, em /casos). O toggle para o caso individual
                  nunca tinha sido construído. Mesma taxonomia do Radar do
                  cliente (radar-eixos.ts), conteúdo interno.
                */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
                    Radar Individual deste caso
                  </p>
                  {(() => {
                    const posicaoRadar = posicionar({
                      tipo: "caso",
                      id,
                      rotulo: String(caso?.["codigo"] ?? caso?.["titulo"] ?? id),
                      elegibilidade: (caso?.["hipotese_elegibilidade"] as string) ?? null,
                      prazo: (caso?.["prazo_proxima_acao"] as string) ?? null,
                      diasSemTouchpoint: (caso?.["dias_sem_touchpoint"] as number) ?? null,
                      esperaExternaAtiva: Boolean(caso?.["aguardando_instituicao_externa"]),
                      bloqueios: d.bloqueiosReais.map((b) => b.motivo),
                      responsavel: (caso?.["proxima_acao_responsavel"] as string) ?? null,
                      origem: papelDoRegistro(caso).valor === "demo" ? "demo" : "real",
                    });
                    const prazo = String(caso?.["prazo_proxima_acao"] ?? "").slice(0, 10);
                    const [ano, mes, dia] = prazo.split("-");
                    return (
                      <RadarInternoCaso
                        contexto={{
                          caseId: id,
                          status: String(caso?.["status"] ?? "Não informado"),
                          prioridade: ROTULO_SINAL[posicaoRadar.sinal],
                          urgencia: posicaoRadar.urgencia,
                          elegibilidade: posicaoRadar.elegibilidade,
                          responsavel: String(caso?.["proxima_acao_responsavel"] ?? "Não informado"),
                          prazo: ano && mes && dia ? `${dia}/${mes}/${ano}` : "Sem prazo definido",
                          proximaAcao: String(caso?.["proxima_acao"] ?? caso?.["proxima_acao_codigo"] ?? "Não informada"),
                          bloqueios: d.bloqueiosReais.length
                            ? d.bloqueiosReais.map((b) => b.motivo).join(" · ")
                            : "Nenhum bloqueio registrado",
                        }}
                        eixos={radarInternoDoCaso({
                          caso,
                          nucleoCompletude: d.nucleoOk,
                          nucleoCriterios: d.nucleoCriterios,
                          checksAtivacao: d.checksAtivacao,
                          bloqueiosReais: d.bloqueiosReais,
                        })}
                      />
                    );
                  })()}
                </div>
                <FasesMotorCidadania caseId={id} />
                <CadeiaCaso360 caseId={id} />
              </>
            )}
          </EstadoDados>
          <div className="mt-5">
            <EstadoDados
              carregando={qc2.isLoading}
              erro={qc2.error}
              dados={comoPayload(qc2.data)}
              aoTentarNovamente={() => void qc2.refetch()}
              recurso="os alertas e a comunicação do caso"
            >
              {([c]) => (
                <AbaProximaAcao
                  caseId={id}
                  caso={caso}
                  alertas={c.alertas}
                  comunicacoes={c.comunicacoes}
                  bloqueado={bloqueado}
                  onMudou={recarregar}
                  v={v}
                  set={set}
                />
              )}
            </EstadoDados>
          </div>

          {/*
            27/08/2026 — decisão da Proprietária: "Caso" (identidade, aliases,
            responsabilidade, brief interno) é a mesma leitura de Indicadores
            — o que este caso É — não uma seção à parte.
          */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Secao
              titulo="Identificação"
              descricao="Registro de caso — distinto de família e de pessoa."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Texto
                  label="Título do caso"
                  valor={v("titulo")}
                  onChange={(x) => set("titulo", x)}
                />
                <div>
                  <Rotulo>Identificador canônico</Rotulo>
                  <p className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 font-mono text-sm text-navy">
                    <span className="whitespace-nowrap">{String(caso?.["codigo"] ?? "—")}</span>
                    {ehFixture(caso?.["codigo"] as string | null) && (
                      <span className="rounded-full border border-terracotta/40 bg-terracotta/10 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wide text-terracotta">
                        {ROTULO_FIXTURE}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-navy/50">
                    Gerado pelo servidor e imutável. Modelo: {String(caso?.["modelo"] ?? "—")}.
                    País, via, produto e preço ficam em campos estruturados e nunca compõem o
                    identificador.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Rotulo>Identificadores históricos (aliases)</Rotulo>
                  <EstadoDados
                    carregando={qc2.isLoading}
                    erro={qc2.error}
                    dados={qc2.data?.aliases}
                    aoTentarNovamente={() => void qc2.refetch()}
                    recurso="os identificadores históricos"
                    vazio="Nenhum identificador histórico registrado."
                  >
                    {(aliases) => (
                    <ul className="space-y-1">
                      {aliases.map((a) => (
                        <li
                          key={String(a["id"])}
                          className="overflow-x-auto rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 text-sm text-navy/70"
                        >
                          <span className="whitespace-nowrap font-mono text-navy">{String(a["alias"])}</span>
                          <span className="ml-2 text-xs text-navy/50">
                            {String(a["alias_type"] ?? "historico")} · origem{" "}
                            {String(a["source"] ?? "—")}
                            {a["superseded_by"]
                              ? ` · substituído por ${String(a["superseded_by"])}`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                    )}
                  </EstadoDados>
                  <p className="mt-1 text-xs text-navy/50">
                    Somente consulta interna. Alias nunca vira chave do caso e nunca é apagado.
                  </p>
                </div>
                <Texto
                  label="Data de entrada do caso"
                  tipo="date"
                  valor={v("data_entrada_caso")}
                  onChange={(x) => set("data_entrada_caso", x)}
                />
                <Texto
                  label="Case service / trilha (ID)"
                  valor={v("citizenship_track_id")}
                  onChange={(x) => set("citizenship_track_id", x)}
                />
                <div>
                  <Rotulo>Cliente vinculado</Rotulo>
                  <p className="rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 text-sm text-navy/70">
                    {q.data?.cliente?.nome ?? "Sem cliente vinculado"}
                  </p>
                </div>
              </div>
            </Secao>

            <Secao titulo="Responsabilidade" descricao="Toda entrega tem responsável nomeado.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Texto
                  label="Responsável principal"
                  valor={v("responsavel_principal")}
                  onChange={(x) => set("responsavel_principal", x)}
                />
                <Texto
                  label="Cargo do responsável"
                  valor={v("cargo_responsavel_principal")}
                  onChange={(x) => set("cargo_responsavel_principal", x)}
                />
                <Texto
                  label="Supervisora do caso"
                  valor={v("supervisora_do_caso")}
                  onChange={(x) => set("supervisora_do_caso", x)}
                />
                <Texto
                  label="Colaboradores (separados por vírgula)"
                  valor={arr("colaboradores_do_caso").join(", ")}
                  onChange={(x) =>
                    set(
                      "colaboradores_do_caso",
                      x
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
            </Secao>

            <Secao titulo="Próxima ação" descricao="Lista controlada; 'Outro' exige justificativa.">
              <div className="grid gap-4">
                <Selecao
                  label="Próxima ação"
                  valor={v("proxima_acao_codigo")}
                  opcoes={PROXIMAS_ACOES}
                  onChange={(x) => set("proxima_acao_codigo", x)}
                />
                <Texto
                  label="Justificativa / detalhe"
                  valor={v("proxima_acao_justificativa")}
                  onChange={(x) => set("proxima_acao_justificativa", x)}
                  area
                  ajuda={
                    v("proxima_acao_codigo") === "outro_justificar"
                      ? "Obrigatório quando a ação é 'Outro'."
                      : undefined
                  }
                />
              </div>
            </Secao>

            <Secao titulo="Brief interno" descricao="Uso interno — nunca exibido ao cliente.">
              <div className="grid gap-4">
                <Selecao
                  label="Origem do brief"
                  valor={v("origem_brief")}
                  opcoes={ORIGEM_BRIEF}
                  onChange={(x) => set("origem_brief", x)}
                />
                <Texto
                  label="Link de origem interna"
                  valor={v("link_origem_interna")}
                  onChange={(x) => set("link_origem_interna", x)}
                />
                <Texto
                  label="Resumo interno"
                  valor={v("resumo_interno")}
                  onChange={(x) => set("resumo_interno", x)}
                  area
                />
                <Texto
                  label="Brief interno"
                  valor={v("brief_interno")}
                  onChange={(x) => set("brief_interno", x)}
                  area
                />
              </div>
            </Secao>
          </div>
          </div>
        </SecaoAncora>

        <SecaoAncora id="comercial" titulo="Formalização" hidden={secaoFoco !== null && secaoFoco !== "comercial"}>
          <section className="mb-6 border-y border-border py-4 text-sm text-navy" aria-label="Contexto da formalização">
            <h2 className="font-serif text-xl">Formalização deste caso</h2>
            <p className="mt-2">{caso["contrato_assinado"] ? "Assinatura indicada no caso — conferir no instrumento." : "Assinatura não registrada no caso."}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              {qProposta.data?.proposta ? <span>Proposta registrada · versão {String(qProposta.data.proposta.versao ?? "Não registrado")} · {String(qProposta.data.proposta.status ?? "Não registrado")}</span> : <span>Proposta não registrada nesta leitura</span>}
              <a href="#formalizacao-juridico" className="underline">Validação jurídica deste caso</a>
              <a href="#formalizacao-instrumento" className="underline">Instrumento e versões</a>
            </div>
          </section>
          {/*
            27/08/2026 — decisão da Proprietária, com cautela deliberada: o
            motor e a matriz de contrato já moram em /contratos e
            /matriz-juridica (grupo Contratos dos 8 grupos). Aqui dentro do
            caso fica só o CONTRATO desta pessoa — estado e ponte, nunca
            formulário duplicado. Proposta e escopo (referência de lead) se
            mudaram para "Pessoa e família", porque compõem a pessoa, não o
            contrato.
          */}
          {/* Corte 3a (01/10/2026): o plano que o cliente vê na Conta do App. */}
          <PublicarPlanoApp caseId={id} />

          {/*
            04/10/2026 — a tabela de preços vigente por país passou a existir
            como decisão da Proprietária (v3.0). Este painel é a execução dela:
            produto-pai rege, país é trilha, os quatro componentes ficam
            separados e a condição particular substitui a referência.
          */}
          {/*
            04/10/2026 — a condição comercial versionada passou a existir
            (`case_commercial_condition`, semeada das 7 páginas do Canva já
            extraídas). A proposta e o contrato leem daqui; o catálogo e o SKU
            não entram. O painel também nomeia os quatro anexos que a
            composição exige e as lacunas.
          */}
          <CondicaoComercialVersionada caseId={id} />
          {/* Corte L08 (19/10/2026): 6 marcos do contrato em cards, leitura pura. */}
          <CardsContratoCaso caseId={id} />
          <OrcamentoPorProdutoPai caseId={id} />
          <CalculadoraOrcamento caseId={id} />

          <PublicarAssinaturaApp caseId={id} />

          <div className="grid gap-5 lg:grid-cols-2">
            <Secao titulo="Eixo comercial">
              <div className="grid gap-4">
                <Selecao
                  label="Etapa comercial"
                  valor={v("eixo_comercial")}
                  opcoes={EIXO_COMERCIAL}
                  onChange={(x) => set("eixo_comercial", x)}
                />
                <Texto
                  label="Data da confirmação formal da proposta"
                  tipo="date"
                  valor={v("data_confirmacao_formal_proposta")}
                  onChange={(x) => set("data_confirmacao_formal_proposta", x)}
                />
              </div>
            </Secao>

            <Secao
              titulo="Eixo de formalização e operação"
              descricao="'Cliente ativo' só é derivado com contrato, pagamento, responsável, núcleo e plano."
            >
              <div className="grid gap-4">
                <Selecao
                  label="Etapa de formalização"
                  valor={v("eixo_formalizacao")}
                  opcoes={EIXO_FORMALIZACAO}
                  onChange={(x) => set("eixo_formalizacao", x)}
                />
                <ul className="space-y-1 text-xs text-navy/60">
                  <li>Contrato assinado: {caso["contrato_assinado"] ? "sim" : "não"}</li>
                  <li>Pagamento confirmado: {caso["pagamento_confirmado"] ? "sim" : "não"}</li>
                  <li>
                    Plano inicial (tarefas): {q.data?.planoInicialOk ? "registrado" : "pendente"}
                  </li>
                </ul>
                <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
                  <p className="text-xs font-semibold text-navy">
                    Completude do núcleo familiar (critérios persistidos)
                  </p>
                  <div className="mt-2 text-xs">
                    <EstadoDados
                      carregando={q.isLoading}
                      erro={q.error}
                      dados={q.data?.nucleoCriterios}
                      aoTentarNovamente={() => void q.refetch()}
                      recurso="os critérios de completude do núcleo"
                      vazio="Sem critérios avaliados. A consulta foi concluída com sucesso."
                    >
                      {(criterios) => (
                        <ul className="space-y-1">
                          {criterios.map((c) => (
                            <li
                              key={c.chave}
                              className={c.ok ? "text-navy/60" : "text-terracotta"}
                            >
                              {c.ok ? "✓" : "•"} {c.rotulo}
                              {c.ok ? "" : ` — ${c.motivo ?? "pendente"}`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </EstadoDados>
                  </div>
                </div>

                <Link
                  to="/onboarding/$id"
                  params={{ id }}
                  className="text-xs font-medium text-navy underline"
                >
                  Abrir painel de onboarding e ativação
                </Link>
              </div>
            </Secao>

            <div id="formalizacao-juridico" className="scroll-mt-24">
            <Secao
              titulo="Validação jurídica deste caso"
              descricao="Decisão de ato formal, não bloqueio universal — leads, Discovery, pesquisa, tarefas, rascunhos e OS internas seguem sem depender disto."
            >
              {qJuridico.isLoading ? (
                <p className="text-xs text-navy/50">Carregando…</p>
              ) : qJuridico.isError ? (
                <p className="text-xs text-terracotta">Não foi possível carregar a validação jurídica.</p>
              ) : qJuridico.data?.semRotaAplicavel && !qJuridico.data.rota ? (
                <p className="text-xs text-navy/60">
                  Sem rota de cidadania vinculada a este caso ainda — nenhum marco/regra para avaliar.
                  {qJuridico.data.pendencias.length ? " Ainda há pendência de tema contratual ou representação abaixo." : ""}
                </p>
              ) : (
                <p className="text-xs text-navy/70">
                  Rota: {qJuridico.data?.rota?.trackName ?? qJuridico.data?.rota?.pais ?? "—"} ·{" "}
                  {qJuridico.data?.rota?.viaPreliminar ?? "via não registrada"} · estado:{" "}
                  {qJuridico.data?.rota?.lifecycleStatus}
                </p>
              )}
              {(qJuridico.data?.pendencias.length ?? 0) === 0 ? (
                <p className="mt-2 text-xs text-navy/60">Nenhuma pendência jurídica para este caso.</p>
              ) : (
                <ul className="mt-2 space-y-2 text-xs">
                  {qJuridico.data!.pendencias.map((p, i) => (
                    <li key={i} className="rounded-lg border border-navy/10 bg-cream/40 p-2">
                      <p className="font-medium text-navy">{p.rotulo}</p>
                      <p className="text-navy/60">Estado: {p.estado}</p>
                      <p className="text-navy/60">Decisão necessária: {p.decisaoHumanaNecessaria}</p>
                      {p.documentoOuEvidencia ? <p className="text-navy/60">Evidência: {p.documentoOuEvidencia}</p> : null}
                      <p className="mt-1 text-terracotta">Afeta: {ROTULO_ATO_FORMAL[p.atoAfetado]}</p>
                    </li>
                  ))}
                </ul>
              )}

              {qJuridico.data?.raciocinioFase ? (
                <div className="mt-4 rounded-lg border border-gold/40 bg-gold/5 p-3 text-xs">
                  <p className="font-medium text-navy">
                    Contexto jurídico × jornada — fase atual: {qJuridico.data.raciocinioFase.faseRotulo}
                  </p>
                  {qJuridico.data.raciocinioFase.focoJuridico ? (
                    <>
                      <p className="mt-1 text-navy/70">{qJuridico.data.raciocinioFase.focoJuridico.foco}</p>
                      <p className="mt-0.5 text-navy/40">Fonte: {qJuridico.data.raciocinioFase.focoJuridico.fonte}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-navy/60">
                      Sem fase da jornada registrada no Planejador — o foco jurídico por fase aparece assim que a
                      jornada for preenchida.
                    </p>
                  )}
                  {qJuridico.data.raciocinioFase.alertaInternoPais ? (
                    <p className="mt-2 text-navy/70">
                      <span className="font-medium text-navy">Alerta interno do país:</span>{" "}
                      {qJuridico.data.raciocinioFase.alertaInternoPais}
                    </p>
                  ) : null}
                  {qJuridico.data.raciocinioFase.pendenciasDaFase.length ? (
                    <p className="mt-2 text-terracotta">
                      {qJuridico.data.raciocinioFase.pendenciasDaFase.length} pendência(s) jurídica(s) ligada(s) ao ato
                      formal típico desta fase (destacadas acima).
                    </p>
                  ) : (
                    <p className="mt-2 text-navy/60">
                      Nenhuma pendência ligada ao ato formal típico desta fase no momento.
                    </p>
                  )}
                  {qJuridico.data.raciocinioFase.pendenciasDeOutrasFases.length ? (
                    <p className="mt-1 text-navy/40">
                      {qJuridico.data.raciocinioFase.pendenciasDeOutrasFases.length} pendência(s) ligada(s) a atos
                      formais de outras fases da jornada — não bloqueiam esta fase, mas seguem em aberto.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </Secao>

            </div>
            <div id="formalizacao-instrumento" className="scroll-mt-24">
            <Secao
              titulo="Motor e matriz de contrato"
              descricao="Vive em Contratos, não é duplicado aqui — esta é a ponte."
            >
              <div className="flex flex-wrap gap-3 text-xs">
                <Link
                  to="/casos/$caseId/contrato/preparar"
                  params={{ caseId: id }}
                  className="rounded-md border border-gold/50 px-3 py-1.5 text-navy hover:bg-gold/10"
                >
                  Preparar contrato
                </Link>
                <Link
                  to="/contratos"
                  className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5"
                >
                  Contratos, versões e anexos
                </Link>
                <Link
                  to="/matriz-juridica"
                  className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5"
                >
                  Validação jurídica — temas contratuais
                </Link>
                <Link
                  to="/ordens-servico"
                  search={{ caseId: id }}
                  className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5"
                >
                  Ordens de serviço
                </Link>
              </div>
            </Secao>
            </div>
          </div>
        </SecaoAncora>

        <SecaoAncora id="tecnico" titulo="Pesquisa" hidden={secaoFoco !== null && secaoFoco !== "tecnico"}>
          {/*
            03/10/2026 — a Proprietária não conseguia achar a ficha: "está tão
            escondido e sobreposto que eu não tenho acesso". Ela estava no FIM
            desta aba, depois de três blocos, e com nome novo — a unificação
            das duas fichas concorrentes fez "Ficha Piloto" e "Ficha Master"
            deixarem de existir como rótulo. Sobe para o topo da aba e passa a
            citar os dois nomes antigos, para quem procura por eles achar.
          */}
          <PainelFichaUnica
            caseId={id}
            clienteId={clienteId ?? null}
            pessoas360={(q.data?.pessoas360 ?? []) as Record<string, any>[]}
            membros={(q.data?.membros ?? []) as Record<string, any>[]}
          />
          {/*
            04/10/2026 — "leia e execute o dossiê da Ana e junto do histórico
            completo da Ana... anexei também o skill que foi criado para trazer
            e montar o dossiê de cada cliente". O dossiê deixa de ser documento
            à parte e passa a ser dado: checklist §58c com estado por item,
            cadeia registrada, histórico e o de-para dos oito campos.
          */}
          <div className="mt-5">
            <DossieConsolidado caseId={id} />
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Secao
              titulo="País e via"
              descricao="Sugestões são preliminares e sempre editáveis; nunca conclusão jurídica."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Selecao
                  label="País da linha prioritária"
                  valor={v("pais_linha_prioritaria")}
                  opcoes={PAISES_LINHA}
                  onChange={(x) => set("pais_linha_prioritaria", x)}
                />
                <Selecao
                  label="Via jurídica preliminar"
                  valor={v("via_juridica_preliminar")}
                  opcoes={VIAS_JURIDICAS}
                  onChange={(x) => set("via_juridica_preliminar", x)}
                />
                <Selecao
                  label="Status da via"
                  valor={v("status_via")}
                  opcoes={STATUS_VIA}
                  onChange={(x) => set("status_via", x)}
                />
                <Selecao
                  label="Revisão humana jurídica"
                  valor={v("revisao_humana_juridica")}
                  opcoes={REVISAO_JURIDICA}
                  onChange={(x) => set("revisao_humana_juridica", x)}
                />
              </div>
              {viaSugerida && viaSugerida !== v("via_juridica_preliminar") ? (
                <p className="mt-3 text-xs text-navy/60">
                  Sugestão do sistema: {rotulo(VIAS_JURIDICAS, viaSugerida)}.{" "}
                  <button
                    className="underline"
                    onClick={() => {
                      set("via_juridica_preliminar", viaSugerida);
                      set("status_via", "sugerida");
                    }}
                  >
                    aplicar como sugestão
                  </button>
                </p>
              ) : null}
            </Secao>

            <Secao
              titulo="Hipótese e radar"
              descricao="Hipótese de trabalho interna, sempre provisória."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Selecao
                  label="Status do radar"
                  valor={v("status_radar")}
                  opcoes={STATUS_RADAR}
                  onChange={(x) => set("status_radar", x)}
                />
                <Texto
                  label="Aderência (%)"
                  tipo="number"
                  valor={v("radar_aderencia_percentual")}
                  onChange={(x) => set("radar_aderencia_percentual", x)}
                  ajuda="Só preencher com cálculo revisado internamente."
                />
              </div>
              <div className="mt-4">
                <Texto
                  label="Hipótese de trabalho interna"
                  valor={v("hipotese_trabalho_interna")}
                  onChange={(x) => set("hipotese_trabalho_interna", x)}
                  area
                />
              </div>
            </Secao>

            <Secao
              titulo="Riscos identificados"
              descricao="Lista controlada e acumulável. 'Outro' exige detalhamento no brief."
            >
              <Multi
                label="Riscos"
                valores={arr("riscos_identificados")}
                opcoes={RISCOS}
                onChange={(x) => set("riscos_identificados", x)}
              />
            </Secao>

          </div>
        </SecaoAncora>

        <SecaoAncora id="pessoas" titulo="Pessoa e família" hidden={secaoFoco !== null && secaoFoco !== "pessoas"}>
          <div className="space-y-5">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={comoPayload(q.data)}
              aoTentarNovamente={() => void q.refetch()}
              recurso="as pessoas do caso"
            >
              {([d]) => (
                <>
                  <AbaPessoas
                    casoId={id}
                    membros={d.membros}
                    onMudou={recarregar}
                    atualizar={atualizar}
                    criar={criar}
                    bloqueado={bloqueado}
                  />
                  <Secao
                    titulo="Cadeia genealógica"
                    descricao="Pessoa a pessoa, elo a elo — lida de genealogical_relationships/research_people deste caso; sem relação gravada, o elo não aparece."
                  >
                    <CadeiaGenealogicaCaso caseId={id} membros={d.membros} />
                  </Secao>
                </>
              )}
            </EstadoDados>
            <AbaCadastro caseId={id} bloqueado={bloqueado} />

            {/*
              01/09/2026 — decisão da Proprietária: aposentado o campo livre de
              proposta (era texto digitado à mão, nunca ligado à proposta real).
              Só aparece agora quando a pessoa já tem uma proposta Canva real
              vinculada (`proposals` + `proposal_canva_pages`) — leitura, não
              formulário. Sem proposta real, a seção inteira não é exibida.
            */}
            {qProposta.data?.proposta ? (
              <Secao
                titulo="Proposta"
                descricao="Somente leitura — vem da proposta Canva real vinculada ao cliente."
              >
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-navy/50 text-xs uppercase tracking-wide">Status</span>
                    <p className="text-navy">{String(qProposta.data.proposta.status ?? "—")}</p>
                  </div>
                  <div>
                    <span className="text-navy/50 text-xs uppercase tracking-wide">Versão</span>
                    <p className="text-navy">{String(qProposta.data.proposta.versao ?? "—")}</p>
                  </div>
                  <div>
                    <span className="text-navy/50 text-xs uppercase tracking-wide">Completude Canva</span>
                    <p className="text-navy">{qProposta.data.paginasExtraidas}/7 páginas extraídas</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <Link
                    to="/propostas"
                    className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5"
                  >
                    Ver proposta
                  </Link>
                  <Link
                    to="/nucleos"
                    className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5"
                  >
                    Núcleos familiares e dossiê-mãe
                  </Link>
                </div>
              </Secao>
            ) : null}

            {/* Etiquetas é metadado leve do caso — junto de quem está nele, não seção própria. */}
            <EstadoDados
              carregando={qc2.isLoading}
              erro={qc2.error}
              dados={comoPayload(qc2.data)}
              aoTentarNovamente={() => void qc2.refetch()}
              recurso="as etiquetas do caso"
            >
              {([c]) => (
                <AbaEtiquetas
                  caseId={id}
                  taxonomia={c.taxonomia}
                  aplicadas={c.etiquetas}
                  bloqueado={bloqueado}
                  onMudou={recarregar}
                />
              )}
            </EstadoDados>
          </div>
        </SecaoAncora>

        <SecaoAncora id="jornada" titulo="Jornada" hidden={secaoFoco !== null && secaoFoco !== "jornada"}>
          {/*
            27/08/2026 — decisão da Proprietária: o ciclo de vida e o produto
            fazem parte da jornada do cliente, não são algo à parte. Um fio
            só, do que foi contratado até onde o percurso está hoje: produto
            e trilha (o que foi combinado) → onboarding (a cadência D0–D30
            em curso) → fechamento (o estado final) → a jornada do cliente
            propriamente dita, como moldura de tudo isso.
          */}
          <div className="space-y-8">
            {/*
              Corte 3c (03/10/2026) — a União de Ramos deixa de existir só na
              demo: o Desk liga aqui as duas publicações que se encontram na
              aba Jornada do App, por id, com legenda própria.
            */}
            {/* 13/10/2026 — curadoria dos marcos históricos que a Jornada do App exibe. */}
            <MarcosJornadaDesk caseId={id} />
            <PublicarUniaoRamos caseId={id} />

            {/*
              P4 (25/09/2026) — a jornada persistida do plano (Produto-Pai,
              país/via, etapa, marco, responsável, bloqueio, próxima ação,
              micro-entrega) mora aqui, ANTES do formulário grande: mostra o
              que já está gravado e deixa editar campo a campo, sem entrar
              na versão/hash do formulário abaixo.
            */}
            <PainelJornadaPlanejador caseId={id} />
            <PlanejadorOperacional caseId={id} podeEscrever={!bloqueado} inicialAberto />
            <AbaJornadaCliente casoId={id} bloqueado={bloqueado} />

            <div className="space-y-5">
              <EstadoDados
                carregando={qc2.isLoading}
                erro={qc2.error}
                dados={comoPayload(qc2.data)}
                aoTentarNovamente={() => void qc2.refetch()}
                recurso="o produto e a trilha do caso"
              >
                {([c]) => (
                  <AbaProdutoTrilha
                    caseId={id}
                    produtos={c.produtos}
                    trilhas={c.trilhas}
                    servicos={c.servicos}
                    bloqueado={bloqueado}
                    onMudou={recarregar}
                  />
                )}
              </EstadoDados>
              <ConsolidacaoCaseService caseId={id} />
            </div>

            <EstadoDados
              carregando={qc2.isLoading}
              erro={qc2.error}
              dados={comoPayload(qc2.data)}
              aoTentarNovamente={() => void qc2.refetch()}
              recurso="o onboarding do caso"
            >
              {([c]) => (
                <AbaOnboarding
                  caso={caso}
                  itens={c.onboarding}
                  nucleos={c.nucleos}
                  membrosNucleo={c.membrosNucleo}
                  planoInicialOk={Boolean(q.data?.planoInicialOk)}
                  bloqueado={bloqueado}
                  onMudou={recarregar}
                />
              )}
            </EstadoDados>

            <AbaFechamento casoId={id} bloqueado={bloqueado} />
          </div>
        </SecaoAncora>

        {/*
          P24 (26/09/2026) — Documentos e Financeiro adicionados como seções
          próprias e endereçáveis do Caso 360, a pedido explícito da
          Proprietária. Leitura pura do mesmo dado já carregado nesta mesma
          tela (qDocumentos/qFinanceiro) — nenhuma query nova, nenhum
          escritor novo, nenhum botão duplicado: as ações de registrar
          pagamento/preparar cobrança continuam só no resumo executivo, no
          topo da página ("Abrir ficha operacional completa"), para não
          criar uma segunda CTA para a mesma função.
        */}
        <SecaoAncora id="documentos" titulo="Documentos" hidden={secaoFoco !== null && secaoFoco !== "documentos"}>
          <Secao
            titulo="Documentos do caso"
            descricao="Gestão completa (upload, categoria, visibilidade, liberação ao cliente) fica em Pesquisa e documentos — aqui é o resumo endereçável do caso."
          >
            <EstadoDados
              carregando={qDocumentos.isLoading}
              erro={qDocumentos.error}
              dados={qDocumentos.data as Record<string, unknown>[] | undefined}
              aoTentarNovamente={() => void qDocumentos.refetch()}
              recurso="os documentos do caso"
              vazio="Nenhum documento registrado ainda."
            >
              {(docs) => (
                <ul className="space-y-2 text-sm">
                  {docs.map((d) => (
                    <li key={String(d["id"])} className="rounded-lg border border-navy/10 p-3">
                      <p className="font-medium text-navy">{String(d["titulo"] ?? "Documento sem título")}</p>
                      <p className="mt-0.5 text-xs text-navy/60">
                        {String(d["categoria"] ?? "categoria não informada")} · status: {String(d["status"] ?? "—")}
                        {d["created_at"] ? ` · ${new Date(String(d["created_at"])).toLocaleDateString("pt-BR")}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </EstadoDados>
            <Link
              to="/pesquisa-evidencias/$caseId"
              params={{ caseId: id }}
              className="mt-3 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
            >
              Abrir fontes e documentos (upload, categoria, liberação ao cliente) →
            </Link>
          </Secao>
        </SecaoAncora>

        <SecaoAncora id="financeiro" titulo="Financeiro" hidden={secaoFoco !== null && secaoFoco !== "financeiro"}>
          {/* Onda 5 dos órfãos: a exceção da Proprietária só existia por SQL. */}
          <div className="mb-4">
            <OverrideComercial caseId={id} />
          </div>

          {/* Grade operacional (homologação Desk V4, 11/10/2026): mesma leitura
              do resumo financeiro (qFinanceiro); ausência = "Não registrado", nunca zero. */}
          {qFinanceiro.data ? (() => {
            const f = qFinanceiro.data;
            const fmt = (v: number) =>
              v.toLocaleString("pt-BR", { style: "currency", currency: f.moeda || "BRL" });
            const temCobranca = f.status !== "sem_dados_suficientes" && f.status !== "sem_cobranca_emitida";
            const liquidado = temCobranca ? f.valorRecebido : null;
            // Despesas de terceiros só trazem contagem nesta leitura: sem valor somado.
            const custos: number | null = null;
            const cartoes: { rotulo: string; valor: string; apoio: string }[] = [
              { rotulo: "Total Contratado", valor: f.valorContratado == null ? "Não registrado" : fmt(f.valorContratado), apoio: "Proposta de referência do caso" },
              { rotulo: "Liquidado", valor: liquidado == null ? "Não registrado" : fmt(liquidado), apoio: "Pagamentos em faturas ativas" },
              { rotulo: "Saldo Aberto", valor: f.saldoAberto == null || !temCobranca ? "Não registrado" : fmt(f.saldoAberto), apoio: "Contratado − liquidado" },
              {
                rotulo: "Custos de Busca",
                valor: "Não registrado",
                apoio: f.despesasTerceiros ? `${f.despesasTerceiros.total} despesa(s) sem valor somado` : "Nenhuma despesa de terceiros",
              },
              {
                rotulo: "Margem Bruta",
                valor: liquidado != null && custos != null ? fmt(liquidado - custos) : "Não registrado",
                apoio: "Liquidado − custos, só com ambos",
              },
            ];
            return (
              <dl className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5" data-grade-financeira-5>
                {cartoes.map((c) => (
                  <div key={c.rotulo} className="rounded-xl border border-navy/10 bg-card p-4 shadow-sm">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-navy/55">{c.rotulo}</dt>
                    <dd className="mt-1 font-serif text-xl text-navy">{c.valor}</dd>
                    <dd className="mt-1 text-[11px] text-navy/55">{c.apoio}</dd>
                  </div>
                ))}
              </dl>
            );
          })() : null}


          <Secao
            titulo="Resumo financeiro do caso"
            descricao="Registrar pagamento e preparar cobrança ficam no resumo executivo, no topo da página — aqui é só o estado, para consulta rápida."
          >
            {qFinanceiro.isLoading ? (
              <p className="text-xs text-navy/50">Carregando…</p>
            ) : qFinanceiro.isError ? (
              <p className="text-xs text-terracotta">Não foi possível carregar o financeiro deste caso.</p>
             ) : (
               <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-navy/50">Valor contratado</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.valorContratado == null
                      ? "Sem dados suficientes"
                      : `${qFinanceiro.data.moeda} ${qFinanceiro.data.valorContratado.toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Valor recebido</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.moeda} {qFinanceiro.data?.valorRecebido.toFixed(2)}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Saldo aberto</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.saldoAberto == null
                      ? "Sem dados suficientes"
                      : `${qFinanceiro.data.moeda} ${qFinanceiro.data.saldoAberto.toFixed(2)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Próxima parcela</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data?.proximaParcela
                      ? `${qFinanceiro.data.moeda} ${qFinanceiro.data.proximaParcela.valor.toFixed(2)} — ${qFinanceiro.data.proximaParcela.vencimento}`
                      : "Sem dados suficientes"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Status</dt>
                  <dd className="mt-0.5 text-sm text-navy">
                    {qFinanceiro.data ? ROTULO_STATUS_FINANCEIRO_CASO[qFinanceiro.data.status] : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Condição comercial</dt>
                  <dd className="mt-0.5 text-sm text-navy">{qFinanceiro.data?.condicaoComercial ?? "Sem dados suficientes"}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Próxima ação financeira</dt>
                  <dd className="mt-0.5 text-sm text-navy">{qFinanceiro.data?.proximaAcaoFinanceira}</dd>
                </div>
               </dl>
            )}
          </Secao>
        </SecaoAncora>

        {/*
          CA04-CASO360-SIMPLES (09/09/2026): gates, auditoria, logs, versões e
          diagnósticos (histórico de fases, registro de alterações e o mapa
          de persistência campo→tabela) recolhidos por padrão — nada foi
          apagado, "secao-log" continua sendo o alvo do índice fixo.
        */}
        <details id="secao-log" hidden={secaoFoco !== null && secaoFoco !== "log"} className="scroll-mt-16 rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]">
          <summary className="cursor-pointer font-serif text-lg text-navy">
            Histórico
          </summary>
          <div className="mt-4 space-y-5">
          {/*
            07/09/2026 — case_phase_history grava sozinha desde 06/09 (trigger
            em crm_casos.fase), mas nenhuma tela mostrava esse histórico —
            achado da proprietária. Escrita automática, leitura nunca ligada.
          */}
          <Secao
            titulo="Histórico de fases do caso"
            descricao="Cada mudança de fase, registrada automaticamente — nunca depende de quem lembrou de anotar."
          >
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data?.historicoFase as Record<string, unknown>[] | undefined}
              aoTentarNovamente={() => void q.refetch()}
              recurso="o histórico de fases"
              vazio="Nenhuma mudança de fase registrada ainda."
            >
              {(linhasFase) => (
                <ul className="space-y-2 text-sm">
                  {linhasFase.map((f: Record<string, unknown>) => (
                    <li key={String(f["id"])} className="rounded-lg border border-navy/10 p-3">
                      <p className="text-navy">
                        {f["fase_anterior"] ? String(f["fase_anterior"]) : "(sem fase)"} →{" "}
                        <span className="font-medium">{String(f["fase_nova"])}</span>
                      </p>
                      <p className="mt-1 text-xs text-navy/50">
                        {new Date(String(f["changed_at"])).toLocaleString("pt-BR")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </EstadoDados>
          </Secao>

          {/*
            Histórico por fase (item E, 07/10/2026): registro manual,
            um de cada vez — nunca importação em bloco —, com data, fonte
            e conteúdo colado/descrito, por fase (Lead/Discovery/Proposta/
            Contrato/Pesquisa/Árvore). Reusa case_timeline_events (acima),
            nunca uma tabela paralela.
          */}
          <Secao
            titulo="Histórico por fase"
            descricao="Registro manual da equipe, por fase, com fonte e conteúdo — auditado, um por vez."
          >
            <HistoricoPorFase caseId={id} />
          </Secao>

          {/*
            REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — Ficha Piloto da
            Giovanna, campos #47-49 ("Conta > Histórico", 3 marcos). A
            `case_timeline_events` já vinha lida em `q.data.timeline`
            (usada acima em "Linha do tempo do caso"); faltava o botão que
            aprova um evento para a família ver no App Cliente
            (`visibility: 'cliente_aprovado'` + `summary_client_approved`,
            policy `cte_select_portal` já vigente). Reaproveita a mesma
            leitura, sem consulta nova.
          */}
          <Secao
            titulo="Marcos aprovados para o App Cliente"
            descricao="Aprovar exige escrever o texto que a família vai ler — o título interno do evento nunca atravessa para o App."
          >
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data?.timeline as Record<string, unknown>[] | undefined}
              aoTentarNovamente={() => void q.refetch()}
              recurso="os eventos da linha do tempo"
              vazio="Nenhum evento registrado ainda."
            >
              {(eventos) => (
                <ul className="space-y-2 text-sm">
                  {eventos.slice(0, 20).map((evento) => {
                    const eventoId = String(evento["id"]);
                    const aprovado = evento["visibility"] === "cliente_aprovado";
                    const resumoAprovado = String(evento["summary_client_approved"] ?? "").trim();
                    return (
                      <li key={eventoId} className="rounded-lg border border-navy/10 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-navy">
                            <span className="font-medium">{String(evento["title"] ?? "Evento registrado")}</span>{" "}
                            <span className="text-xs text-navy/50">
                              ({evento["occurred_at"] ? new Date(String(evento["occurred_at"])).toLocaleDateString("pt-BR") : "sem data"})
                            </span>
                          </p>
                          {aprovado ? (
                            <div className="flex items-center gap-2">
                              <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] text-navy/70">
                                Visível no App
                              </span>
                              {podeEscrever ? (
                                <button
                                  type="button"
                                  className="text-xs text-navy/60 underline hover:text-navy disabled:opacity-50"
                                  disabled={mRevogarEvento.isPending}
                                  onClick={() => mRevogarEvento.mutate({ eventoId })}
                                >
                                  Revogar
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] text-navy/50">Só interno</span>
                          )}
                        </div>
                        {aprovado ? (
                          <p className="mt-1 text-xs text-navy/60">Texto para a família: “{resumoAprovado}”</p>
                        ) : podeEscrever ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="text"
                              placeholder="Texto que a família vai ler…"
                              value={resumoClientePorEvento[eventoId] ?? ""}
                              onChange={(e) =>
                                setResumoClientePorEvento((s) => ({ ...s, [eventoId]: e.target.value }))
                              }
                              className="min-w-[16rem] flex-1 rounded-lg border border-navy/15 px-2 py-1 text-xs text-navy"
                            />
                            <button
                              type="button"
                              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream disabled:opacity-50"
                              disabled={mAprovarEvento.isPending || !(resumoClientePorEvento[eventoId] ?? "").trim()}
                              onClick={() =>
                                mAprovarEvento.mutate({
                                  eventoId,
                                  resumoCliente: resumoClientePorEvento[eventoId] ?? "",
                                })
                              }
                            >
                              Aprovar para o cliente
                            </button>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </EstadoDados>
          </Secao>

          <Secao
            titulo="Registro de alterações"
            descricao="Quem alterou, quando e o quê. Nada é apagado."
          >
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data?.log as Record<string, unknown>[] | undefined}
              aoTentarNovamente={() => void q.refetch()}
              recurso="o registro de alterações"
              vazio="Nenhuma alteração registrada ainda."
            >
              {(linhasLog) => (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                    <tr>
                      <th className="py-2 pr-4">Quando</th>
                      <th className="py-2 pr-4">Registro</th>
                      <th className="py-2 pr-4">Campo</th>
                      <th className="py-2 pr-4">Anterior</th>
                      <th className="py-2">Novo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasLog.map((l: Record<string, unknown>) => (
                      <tr key={String(l["id"])} className="border-t border-navy/10 align-top">
                        <td className="py-2 pr-4 whitespace-nowrap text-navy/70">
                          {new Date(String(l["created_at"])).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-2 pr-4 text-navy/70">{String(l["entidade"])}</td>
                        <td className="py-2 pr-4 font-medium">{String(l["campo"])}</td>
                        <td className="py-2 pr-4 text-navy/60">
                          {l["valor_anterior"] ? String(l["valor_anterior"]) : "—"}
                        </td>
                        <td className="py-2 text-navy/80">
                          {l["valor_novo"] ? String(l["valor_novo"]) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </EstadoDados>
          </Secao>
          <MapaPersistenciaCaso />
          </div>
        </details>
      </div>
      </details>

      <AlertDialog open={bloqueio.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Há alterações não salvas nesta ficha</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.keys(form).length} campo(s) alterado(s) ainda não foram gravados no banco.
              Escolha o que fazer antes de sair.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={() => bloqueio.reset?.()}
              className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy"
            >
              Cancelar e continuar editando
            </button>
            <button
              onClick={() => {
                setForm({});
                bloqueio.proceed?.();
              }}
              className="rounded-lg border border-terracotta/40 px-3 py-2 text-sm text-navy"
            >
              Descartar alterações
            </button>
            <button
              disabled={mSalvar.isPending}
              onClick={async () => {
                try {
                  await mSalvar.mutateAsync();
                  bloqueio.proceed?.();
                } catch {
                  bloqueio.reset?.();
                }
              }}
              className="rounded-lg bg-navy px-3 py-2 text-sm font-medium text-cream disabled:opacity-40"
            >
              {mSalvar.isPending ? ESTADOS_SALVAMENTO.salvando : "Salvar e sair"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SaasShell>
  );
}

/* ---------------- Pessoas do caso ---------------- */

function AbaPessoas({
  casoId,
  membros,
  onMudou,
  atualizar,
  criar,
  bloqueado,
}: {
  casoId: string;
  membros: Record<string, unknown>[];
  onMudou: () => void;
  atualizar: (a: {
    data: { entidade: "case_members"; id: string; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  criar: (a: {
    data: { entidade: "case_members"; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  bloqueado: boolean;
}) {
  const [novo, setNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const carregarNucleos = useServerFn(listarNucleos);
  const qNucleos = useQuery({
    queryKey: ["nucleos-desk"],
    queryFn: () => carregarNucleos(),
    retry: false,
  });
  const nucleosCarregados = (qNucleos.data ?? null) as { case_id: string | null }[] | null;
  const temNucleo = Array.isArray(nucleosCarregados)
    ? nucleosCarregados.some((n) => n.case_id === casoId)
    : false;

  // Corte U2 (28/09/2026): a pessoa do caso é sempre uma Pessoa 360 —
  // escolhe uma já cadastrada ou cria a nova, e o membro nasce com cliente_id.
  const [pessoaEscolhida, setPessoaEscolhida] = useState("");
  const carregarPessoas = useServerFn(listarPessoasParaCaso);
  const qPessoas = useQuery({
    queryKey: ["pessoas-para-caso"],
    queryFn: () => carregarPessoas(),
    retry: false,
  });
  const idsNoCaso = new Set(membros.map((m) => m["cliente_id"]).filter(Boolean));
  const pessoasDisponiveis = (qPessoas.data ?? []).filter((p) => !idsNoCaso.has(p.id));
  const adicionar = useServerFn(adicionarPessoaAoCaso);
  const mCriar = useMutation({
    mutationFn: () =>
      adicionar({
        data: pessoaEscolhida
          ? { caseId: casoId, clienteId: pessoaEscolhida }
          : { caseId: casoId, nome: novo.trim() },
      }),
    onSuccess: (r: { pessoaCriada: boolean }) => {
      toast.success(r.pessoaCriada ? "Pessoa criada na Pessoa 360 e ligada ao caso." : "Pessoa ligada ao caso.");
      setNovo("");
      setPessoaEscolhida("");
      setErro(null);
      void qPessoas.refetch();
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao criar pessoa."),
  });

  const reconciliarCpfMembros = useServerFn(conferirDivergenciaCpfMembrosCaso);
  const [planoReconciliacaoCpfMembros, setPlanoReconciliacaoCpfMembros] = useState<any[] | null>(null);
  const mReconciliarCpfMembros = useMutation({
    mutationFn: (confirmar: boolean) => reconciliarCpfMembros({ data: { caseId: casoId, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoReconciliacaoCpfMembros(Array.isArray(r.plano) ? r.plano : []);
      // Fase C (27/09/2026): preenchimento de campo vazio é automático —
      // não espera um segundo clique em "Preencher CPFs pendentes".
      if (r.simulado) {
        if (Array.isArray(r.plano) && r.plano.some((p: any) => p.acao === "preencher")) {
          mReconciliarCpfMembros.mutate(true);
        } else {
          toast.info("Prévia da conferência de CPF: nada foi gravado ainda.");
        }
        return;
      }
      toast.success(
        r.atualizados
          ? `${r.atualizados} CPF(s) preenchido(s) a partir do cadastro canônico.`
          : "Nada a preencher: nenhum membro estava com CPF vazio.",
      );
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // R2: conflito de CPF só se resolve membro a membro, com motivo; depois
  // relê o plano no servidor para mostrar o estado gravado, não o otimista.
  const mResolverConflitoCpf = useMutation({
    mutationFn: (v: { membroId: string; motivo: string }) =>
      reconciliarCpfMembros({ data: { caseId: casoId, resolverMembroId: v.membroId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("CPF alinhado ao cadastro canônico e registrado no histórico.");
      mReconciliarCpfMembros.mutate(false);
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reconciliarTelefoneMembros = useServerFn(conferirDivergenciaTelefoneMembrosCaso);
  const [planoReconciliacaoTelefoneMembros, setPlanoReconciliacaoTelefoneMembros] = useState<any[] | null>(null);
  const mReconciliarTelefoneMembros = useMutation({
    mutationFn: (confirmar: boolean) => reconciliarTelefoneMembros({ data: { caseId: casoId, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoReconciliacaoTelefoneMembros(Array.isArray(r.plano) ? r.plano : []);
      // Fase C (27/09/2026): preenchimento automático, sem segundo clique.
      if (r.simulado) {
        if (Array.isArray(r.plano) && r.plano.some((p: any) => p.acao === "preencher")) {
          mReconciliarTelefoneMembros.mutate(true);
        } else {
          toast.info("Prévia da conferência de telefone: nada foi gravado ainda.");
        }
        return;
      }
      toast.success(
        r.atualizados
          ? `${r.atualizados} telefone(s) preenchido(s) a partir do cadastro canônico.`
          : "Nada a preencher: nenhum membro estava com telefone vazio.",
      );
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // P28: mesmo padrão do CPF — conflito só se resolve membro a membro, com motivo.
  const mResolverConflitoTelefone = useMutation({
    mutationFn: (v: { membroId: string; motivo: string }) =>
      reconciliarTelefoneMembros({ data: { caseId: casoId, resolverMembroId: v.membroId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("Telefone alinhado ao cadastro canônico e registrado no histórico.");
      mReconciliarTelefoneMembros.mutate(false);
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // P31: mesmo padrão do CPF/telefone, para CEP (pedido direto da
  // Proprietária: unificar em vez de conferir 3 vezes o mesmo dado).
  const reconciliarCepMembros = useServerFn(conferirDivergenciaCepMembrosCaso);
  const [planoReconciliacaoCepMembros, setPlanoReconciliacaoCepMembros] = useState<any[] | null>(null);
  const mReconciliarCepMembros = useMutation({
    mutationFn: (confirmar: boolean) => reconciliarCepMembros({ data: { caseId: casoId, confirmar } }),
    onSuccess: (r: any) => {
      setPlanoReconciliacaoCepMembros(Array.isArray(r.plano) ? r.plano : []);
      // Fase C (27/09/2026): preenchimento automático, sem segundo clique.
      if (r.simulado) {
        if (Array.isArray(r.plano) && r.plano.some((p: any) => p.acao === "preencher")) {
          mReconciliarCepMembros.mutate(true);
        } else {
          toast.info("Prévia da conferência de CEP: nada foi gravado ainda.");
        }
        return;
      }
      toast.success(
        r.atualizados
          ? `${r.atualizados} CEP(s) preenchido(s) a partir do cadastro canônico.`
          : "Nada a preencher: nenhum membro estava com CEP vazio.",
      );
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mResolverConflitoCep = useMutation({
    mutationFn: (v: { membroId: string; motivo: string }) =>
      reconciliarCepMembros({ data: { caseId: casoId, resolverMembroId: v.membroId, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("CEP alinhado ao cadastro canônico e registrado no histórico.");
      mReconciliarCepMembros.mutate(false);
      onMudou();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Caso com núcleo vinculado: a composição familiar é somente leitura, projetada de Núcleos e dossiês.
  // A conferência de CPF/telefone vale independentemente do núcleo (opera sobre case_members).
  if (temNucleo) {
    return (
      <div className="space-y-5">
        <ReconciliarCpfMembrosCaso
          plano={planoReconciliacaoCpfMembros}
          ocupado={mReconciliarCpfMembros.isPending}
          onVerificar={() => mReconciliarCpfMembros.mutate(false)}
          onSincronizar={() => mReconciliarCpfMembros.mutate(true)}
          onResolverConflito={(membroId, motivo) => mResolverConflitoCpf.mutate({ membroId, motivo })}
        />
        <ReconciliarTelefoneMembrosCaso
          plano={planoReconciliacaoTelefoneMembros}
          ocupado={mReconciliarTelefoneMembros.isPending}
          onVerificar={() => mReconciliarTelefoneMembros.mutate(false)}
          onSincronizar={() => mReconciliarTelefoneMembros.mutate(true)}
          onResolverConflito={(membroId, motivo) => mResolverConflitoTelefone.mutate({ membroId, motivo })}
        />
        <ReconciliarCepMembrosCaso
          plano={planoReconciliacaoCepMembros}
          ocupado={mReconciliarCepMembros.isPending}
          onVerificar={() => mReconciliarCepMembros.mutate(false)}
          onSincronizar={() => mReconciliarCepMembros.mutate(true)}
          onResolverConflito={(membroId, motivo) => mResolverConflitoCep.mutate({ membroId, motivo })}
        />
        <PainelDadosCivisMembrosCaso caseId={casoId} onMudou={onMudou} />
        <GrupoComunicacaoCaso caseId={casoId} />
        <PessoasDoNucleo caseId={casoId} />
      </div>
    );
  }

  // Sem a lista de núcleos não se sabe qual painel vale: mostra a falha em vez de
  // supor "caso sem núcleo".
  if (qNucleos.isError || (!qNucleos.isLoading && nucleosCarregados === null)) {
    return (
      <div role="alert" className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">Não foi possível carregar os núcleos do caso.</p>
        <p className="text-navy/80">
          {qNucleos.error instanceof Error
            ? qNucleos.error.message
            : "A consulta de núcleos não retornou resultado nem erro."}
        </p>
        <BotaoTentarNovamente aoClicar={() => void qNucleos.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ReconciliarCpfMembrosCaso
        plano={planoReconciliacaoCpfMembros}
        ocupado={mReconciliarCpfMembros.isPending}
        onVerificar={() => mReconciliarCpfMembros.mutate(false)}
        onSincronizar={() => mReconciliarCpfMembros.mutate(true)}
        onResolverConflito={(membroId, motivo) => mResolverConflitoCpf.mutate({ membroId, motivo })}
      />
      <ReconciliarTelefoneMembrosCaso
        plano={planoReconciliacaoTelefoneMembros}
        ocupado={mReconciliarTelefoneMembros.isPending}
        onVerificar={() => mReconciliarTelefoneMembros.mutate(false)}
        onSincronizar={() => mReconciliarTelefoneMembros.mutate(true)}
        onResolverConflito={(membroId, motivo) => mResolverConflitoTelefone.mutate({ membroId, motivo })}
      />
      <ReconciliarCepMembrosCaso
        plano={planoReconciliacaoCepMembros}
        ocupado={mReconciliarCepMembros.isPending}
        onVerificar={() => mReconciliarCepMembros.mutate(false)}
        onSincronizar={() => mReconciliarCepMembros.mutate(true)}
        onResolverConflito={(membroId, motivo) => mResolverConflitoCep.mutate({ membroId, motivo })}
      />
      <PainelDadosCivisMembrosCaso caseId={casoId} onMudou={onMudou} />
      <GrupoComunicacaoCaso caseId={casoId} />
      <Secao
        titulo="Pessoas do caso"
        descricao="Registro de pessoa é distinto do caso e da família. Menor de idade nunca é signatário: exige representante legal."
      >
        {erro ? <p className="mb-3 text-sm text-terracotta">{erro}</p> : null}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Pessoa já cadastrada"
            className={inputCls + " max-w-xs"}
            value={pessoaEscolhida}
            onChange={(e) => {
              setPessoaEscolhida(e.target.value);
              if (e.target.value) setNovo("");
            }}
          >
            <option value="">Pessoa nova (digite o nome)</option>
            {pessoasDisponiveis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p.email ? ` · ${p.email}` : ""}
              </option>
            ))}
          </select>
          <input
            className={inputCls + " max-w-xs"}
            placeholder="Nome completo da pessoa nova"
            value={novo}
            disabled={Boolean(pessoaEscolhida)}
            onChange={(e) => setNovo(e.target.value)}
          />
          <button
            onClick={() => mCriar.mutate()}
            disabled={(!pessoaEscolhida && novo.trim().length < 3) || mCriar.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
          >
            Adicionar pessoa
          </button>
        </div>
        <p className="mt-2 text-xs text-navy/60">
          Toda pessoa do caso é também uma Pessoa 360: escolha quem já está cadastrado para não repetir os dados, ou
          crie a pessoa nova — o que for preenchido na Pessoa 360 chega a este caso e ao contrato.
        </p>
      </Secao>

      {membros.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma pessoa registrada neste caso." />
      ) : (
        membros.map((m) => (
          <CartaoPessoa
            key={String(m["id"])}
            pessoa={m}
            atualizar={atualizar}
            onMudou={onMudou}
            bloqueado={bloqueado}
          />
        ))
      )}
    </div>
  );
}

function CartaoPessoa({
  pessoa,
  atualizar,
  onMudou,
  bloqueado: _bloqueado,
}: {
  pessoa: Record<string, unknown>;
  atualizar: (a: {
    data: { entidade: "case_members"; id: string; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  onMudou: () => void;
  /**
   * Mantida só por compatibilidade com quem chama. Pendência informa;
   * não trava CPF, telefone nem CEP.
   */
  bloqueado: boolean;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const sujo = Object.keys(form).length > 0;
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(sujo);

  const v = (k: string) => {
    const atual = k in form ? form[k] : pessoa[k];
    return atual === null || atual === undefined ? "" : String(atual);
  };
  const set = (k: string, valor: unknown) => setForm((f) => ({ ...f, [k]: valor }));

  // CA-VALIDACAO-CPF-CEP (21/09/2026): mesma checagem de `pessoas.$clienteId.tsx`
  // — a máscara já existia, mas nunca havia validação de dígito/tamanho antes
  // de gravar. Reusa `cpfValido`/`cepValido` (validacao-pessoa.ts). Campo
  // vazio continua permitido; só bloqueia valor preenchido e inválido.
  const salvarComValidacao = () => {
    const cpf = v("cpf");
    if (cpf.trim() && !cpfValido(cpf)) {
      setErro("CPF inválido — confira os números digitados.");
      return;
    }
    const cep = v("cep");
    if (cep.trim() && !cepValido(cep)) {
      setErro("CEP inválido — precisa ter 8 dígitos.");
      return;
    }
    const email = v("email");
    if (email.trim() && !emailValido(email)) {
      setErro("E-mail inválido — confira o endereço digitado.");
      return;
    }
    const telefone = v("telefone");
    if (telefone.trim() && !telefoneValido(telefone)) {
      setErro("Telefone inválido — confira o DDD e o número digitados.");
      return;
    }
    m.mutate();
  };

  const m = useMutation({
    mutationFn: () =>
      atualizar({ data: { entidade: "case_members", id: String(pessoa["id"]), dados: form } }),
    onSuccess: () => {
      setForm({});
      setErro(null);
      setSalvo(new Date().toLocaleTimeString("pt-BR"));
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao salvar pessoa."),
  });

  const menor = (() => {
    const dn = v("data_nascimento");
    if (!dn) return false;
    const idade = (Date.now() - new Date(dn).getTime()) / (365.25 * 86_400_000);
    return idade < 18;
  })();

  return (
    <Secao
      titulo={String(pessoa["nome"] ?? "Pessoa")}
      descricao={`Status cadastral: ${rotulo(STATUS_CADASTRAL, v("status_cadastral"))}`}
    >
      {erro ? <p className="mb-3 text-sm text-terracotta">{erro}</p> : null}
      {menor ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs text-navy">
          Pessoa menor de idade: dependente representado. Não pode assinar — informe o representante
          legal.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Selecao
          label="Papel no caso"
          valor={v("papel_no_caso")}
          opcoes={PAPEIS_PESSOA}
          onChange={(x) => set("papel_no_caso", x)}
        />
        <Selecao
          label="Status cadastral"
          valor={v("status_cadastral")}
          opcoes={STATUS_CADASTRAL}
          onChange={(x) => set("status_cadastral", x)}
        />
        <Texto
          label="Parentesco"
          valor={v("parentesco")}
          onChange={(x) => set("parentesco", x)}
        />
        <Texto
          label="Data de nascimento"
          tipo="date"
          valor={v("data_nascimento")}
          onChange={(x) => set("data_nascimento", x)}
          /*
            03/10/2026 — estes campos tinham MÁSCARA e nenhum VALIDADOR: o
            CPF era formatado e aceito inválido. Piso de ano é o genealógico
            (mais permissivo que o de pessoa viva), porque membro do caso
            pode ser pessoa já falecida; o que nunca passa é data no futuro.
          */
          erro={motivoCampoInvalido("Data de nascimento", "data_historica", String(v("data_nascimento") ?? ""))}
        />
        <Texto
          label="Local de nascimento"
          valor={v("local_nascimento")}
          onChange={(x) => set("local_nascimento", x)}
        />
        <Texto
          label="Representante legal"
          valor={v("representante_legal")}
          onChange={(x) => set("representante_legal", x)}
        />
        <Texto
          label="CPF"
          valor={v("cpf")}
          onChange={(x) => set("cpf", formatarCpf(x))}
          erro={motivoCampoInvalido("CPF", "cpf", String(v("cpf") ?? ""))}
        />
        <Texto
          label="RG / documento"
          valor={v("rg")}
          onChange={(x) => set("rg", x)}
          /*
            RG não tem dígito verificador nem formato nacional único — o que dá
            para validar é a UF do órgão emissor quando ela vier escrita.
          */
          erro={motivoCampoInvalido("RG / documento", "rg_orgao", String(v("rg") ?? ""))}
        />
        <Selecao
          label="Estado civil"
          valor={v("estado_civil")}
          opcoes={ESTADO_CIVIL}
          onChange={(x) => set("estado_civil", x)}
        />
        <Texto
          label="Profissão"
          valor={v("profissao")}
          onChange={(x) => set("profissao", x)}
        />
        <Texto
          label="Telefone"
          valor={v("telefone")}
          onChange={(x) => set("telefone", formatarTelefone(x))}
          ajuda="Máscara de Brasil (DDD) por padrão. Pessoa morando fora: comece digitando + e o DDI."
          erro={motivoCampoInvalido("Telefone", "telefone", String(v("telefone") ?? ""))}
        />
        <Selecao
          label="É WhatsApp?"
          valor={v("telefone_whatsapp") === "true" ? "true" : v("telefone_whatsapp") === "false" ? "false" : ""}
          opcoes={[
            { valor: "true", rotulo: "Sim" },
            { valor: "false", rotulo: "Não" },
          ]}
          onChange={(x) => set("telefone_whatsapp", x === "true" ? true : x === "false" ? false : null)}
        />
        <Texto
          label="E-mail"
          tipo="email"
          valor={v("email")}
          onChange={(x) => set("email", x)}
          erro={motivoCampoInvalido("E-mail", "email", String(v("email") ?? ""))}
        />
        <Texto
          label="Endereço"
          valor={v("endereco")}
          onChange={(x) => set("endereco", x)}
        />
        <Texto
          label="CEP"
          valor={v("cep")}
          onChange={(x) => set("cep", formatarCep(x))}
          erro={motivoCampoInvalido("CEP", "cep", String(v("cep") ?? ""))}
        />
        <Texto
          label="Documentos pendentes"
          valor={v("documentos_pendentes")}
          onChange={(x) => set("documentos_pendentes", x)}
        />
        <Texto
          label="Consentimentos"
          valor={v("consentimentos")}
          onChange={(x) => set("consentimentos", x)}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={salvarComValidacao}
          disabled={!sujo || m.isPending}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm text-navy disabled:opacity-40"
        >
          Salvar pessoa
        </button>
        <span className="text-xs text-navy/55">
          {m.isPending
            ? ESTADOS_SALVAMENTO.salvando
            : sujo
              ? ESTADOS_SALVAMENTO.sujo
              : salvo
                ? ESTADOS_SALVAMENTO.salvo(salvo)
                : ""}
        </span>
      </div>
    </Secao>
  );
}
