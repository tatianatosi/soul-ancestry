import { createFileRoute, Link, useBlocker, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { SaasShell, useSaas, EstadoVazio, BotaoTentarNovamente } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { atualizarRegistro, criarRegistro } from "@/lib/saas.functions";
import {
  obterPropostaCanvaDoCliente,
  obterResumoFinanceiroCaso,
  salvarPagamento,
  conciliarPagamento,
  salvarFatura,
} from "@/lib/comercial.functions";
import { ROTULO_STATUS_FINANCEIRO_CASO } from "@/lib/financeiro-caso";
import { validacaoJuridicaCaso } from "@/lib/crm-desk.functions";
import { ROTULO_ATO_FORMAL } from "@/lib/validacao-juridica-caso";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { carregarCanonico, marcarSemNovaAcaoNecessaria } from "@/lib/caso-canonico.functions";
import { listarFilaOps, salvarTarefa } from "@/lib/ops.functions";
import { listarDocumentos } from "@/lib/documentos.functions";
import { resumoVisaoClienteCaso } from "@/lib/app-cliente-como-pessoa.functions";
import { AbaVisaoGeral } from "@/components/caso/visao-geral";
import { RadarInternoCaso } from "@/components/caso/radar-interno";
import { radarInternoDoCaso } from "@/lib/radar-interno-caso";
import { AbaProdutoTrilha } from "@/components/caso/produto-trilha";
import { ConsolidacaoCaseService } from "@/components/caso/consolidacao-case-service";
import { AbaProximaAcao } from "@/components/caso/proxima-acao";
import { AbaEtiquetas } from "@/components/caso/etiquetas-caso";
import { AbaOnboarding } from "@/components/caso/onboarding-caso";
import { AbaJornadaCliente } from "@/components/caso/jornada-cliente";
import { AbaFechamento } from "@/components/caso/fechamento";
import { AbaCadastro } from "@/components/caso/cadastro-checklist";
import { PainelFichaPiloto } from "@/components/caso/ficha-piloto-genealogica";
import { VinculoNucleo } from "@/components/caso/vinculo-nucleo";
import { PessoasDoNucleo } from "@/components/caso/pessoas-do-nucleo";
import { listarNucleos } from "@/lib/nucleos-desk.functions";
import { ehFixture, ROTULO_FIXTURE } from "@/lib/identificadores-norma";
import { ehFixtureLinha, ROTULO_DEMONSTRACAO } from "@/lib/fixtures";
import { classificarErroPersistencia } from "@/lib/persistencia-erros";
import { toast } from "sonner";
import { MapaPersistenciaCaso } from "@/components/caso/mapa-persistencia";
import { estadoDerivadoPorGates } from "@/lib/gates-ativacao-ficha";
import { formatarCep, formatarCpf, formatarTelefone } from "@/lib/validacao-pessoa";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  ORIGEM_BRIEF,
  PAISES_LINHA,
  PAPEIS_PESSOA,
  PROXIMAS_ACOES,
  REVISAO_JURIDICA,
  RISCOS,
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
  "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

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

function Texto({
  label,
  valor,
  onChange,
  desabilitado,
  area,
  tipo = "text",
  ajuda,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  desabilitado?: boolean;
  area?: boolean;
  tipo?: string;
  ajuda?: string;
}) {
  return (
    <label className="block">
      <Rotulo>{label}</Rotulo>
      {area ? (
        <textarea
          className={inputCls}
          rows={4}
          value={valor}
          disabled={desabilitado}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          type={tipo}
          value={valor}
          disabled={desabilitado}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {ajuda ? <span className="mt-1 block text-[11px] text-navy/45">{ajuda}</span> : null}
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
}: {
  id: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`secao-${id}`} data-secao-caso={id} className="scroll-mt-16">
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
    <section className="rounded-xl border border-navy/10 bg-white p-5">
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
const SECOES = [
  { id: "visao", rotulo: "Indicadores" },
  { id: "comercial", rotulo: "Jurídico" },
  { id: "tecnico", rotulo: "Técnico e riscos" },
  { id: "pessoas", rotulo: "Pessoa e família" },
  { id: "jornada", rotulo: "Jornada" },
  // CA04-CASO360-SIMPLES (09/09/2026): rótulo atualizado para o conteúdo que
  // passou a viver aqui (histórico de fases, registro de alterações e mapa de
  // persistência) — a seção em si não foi removida nem fundida, só recolhida
  // por padrão.
  { id: "log", rotulo: "Dados técnicos e validações" },
] as const;

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
    mutationFn: async (v: { invoiceId: string; valor: number; pagoEm: string; referenciaExterna: string }) => {
      const criado = await salvarPagamentoFn({ data: { dados: { invoice_id: v.invoiceId, valor: v.valor } } });
      return conciliarPagamentoFn({
        data: { id: criado.id, pago_em: v.pagoEm, valor: v.valor, referencia_externa: v.referenciaExterna },
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

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [salvoEm, setSalvoEm] = useState<string | null>(null);
  const [camposSalvos, setCamposSalvos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const caso = q.data?.caso;

  useEffect(() => {
    if (caso) setForm({});
  }, [caso?.["updated_at"]]);

  const sujo = Object.keys(form).length > 0;

  // Nada de saída silenciosa com alteração pendente (recarregar/fechar aba).
  useEffect(() => {
    if (!sujo) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [sujo]);

  // ...e também na navegação interna entre abas/rotas do Desk (salvar / descartar / cancelar).
  const bloqueio = useBlocker({
    shouldBlockFn: () => sujo,
    enableBeforeUnload: false,
    withResolver: true,
  });

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
      setForm({});
      await qc.invalidateQueries({ queryKey: ["ficha-caso", id] });
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
   * tarefa" reusa salvarTarefa, já deduplicado por caso+título+status aberto.
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

  const criarTarefaFn = useServerFn(salvarTarefa);
  const mCriarTarefa = useMutation({
    mutationFn: (titulo: string) =>
      criarTarefaFn({ data: { valores: { caso_id: id, titulo, tipo: "caso" } } }),
    onSuccess: () => {
      toast.success("Tarefa criada/reaproveitada no caso.");
      void qc.invalidateQueries({ queryKey: ["ficha-caso-tarefas", id] });
    },
    onError: (e: Error) => toast.error("Não foi possível criar a tarefa", { description: e.message }),
  });

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

  return (
    <SaasShell
      titulo={String(caso["titulo"] ?? "Caso")}
      descricao={`${caso["codigo"] ?? "sem código"} · ficha operacional canônica`}
      acoes={
        <div className="flex items-center gap-3">
          {/* CA04-CASO360-SIMPLES (09/09/2026): este botão morava aqui e
              também no hero — duplicava a mesma ação. Só no hero agora. */}
          <span className="text-xs text-navy/60">
            {mSalvar.isPending
              ? "Salvando…"
              : erro
                ? "Não salvo"
                : sujo
                  ? "Alterações não salvas"
                  : salvoEm
                    ? `Salvo às ${salvoEm}`
                    : "Sem alterações pendentes"}
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
        CA04-CASO360-SIMPLES (09/09/2026) — mockup aprovado define a primeira
        superfície: Situação hoje/Próxima ação/Responsável/Prazo/Motivo/
        Impacto e seis ações, acima da dobra. Nada do que existia foi perdido:
        eixos comerciais completos, estado de ativação e os links de pesquisa
        continuam abaixo, nos quatro resumos; gates/logs/histórico foram para
        "Dados técnicos e validações", recolhida, no fim da página.
      */}
      <div className="mb-4 rounded-xl border border-gold/50 bg-gold/10 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Situação hoje</p>
            <p className="mt-0.5 text-sm font-medium text-navy">
              {caso["ativo"] ? "Caso ativo" : rotulo(STATUS_DERIVADO, derivado.valor)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Próxima ação</p>
            <p className="mt-0.5 text-sm font-medium text-navy">{canonica?.acao ?? "—"}</p>
            {canonica ? (
              <span className="mt-0.5 inline-block rounded-full border border-navy/15 bg-white px-2 py-0.5 text-[10px] text-navy/70">
                {SELO_PROXIMA_ACAO[canonica.origem]}
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Responsável</p>
            <p className="mt-0.5 text-sm font-medium text-navy">{canonica?.responsavel || "Sem responsável"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Prazo</p>
            <p className="mt-0.5 text-sm font-medium text-navy">
              {canonica?.prazo ? new Date(String(canonica.prazo)).toLocaleDateString("pt-BR") : "Sem prazo definido"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Motivo</p>
            <p className="mt-0.5 text-sm text-navy/85">{derivado.motivo}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/55">Impacto</p>
            <p className="mt-0.5 text-sm text-navy/85">
              {bloqueiosReais.length === 0
                ? "Nenhum bloqueio real — elegível para ativação"
                : `Ativação bloqueada — ${bloqueiosReais.length} pendência(s), primeiro: ${bloqueiosReais[0]?.motivo ?? "—"}`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
            disabled={mCriarTarefa.isPending}
            onClick={() => {
              const titulo = prompt("Título da tarefa:");
              if (!titulo?.trim()) return;
              mCriarTarefa.mutate(titulo.trim());
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
          >
            Criar tarefa
          </button>
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
            Abrir visão do cliente
          </Link>
        </div>
      </div>

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

      {/* Quatro resumos acionáveis — cada um leva à seção completa, já preservada abaixo. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <a href="#secao-jornada" className="rounded-xl border border-navy/10 bg-white p-4 hover:border-gold/60">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Jornada/onboarding</p>
          <p className="mt-1 text-sm font-medium text-navy">
            {bloqueiosReais.length === 0
              ? "Elegível — onboarding liberado"
              : `${bloqueiosReais.length} bloqueio(s) de ativação`}
          </p>
          {sugestoes.length ? (
            <p className="mt-1 text-xs text-navy/60">{sugestoes[0].titulo}</p>
          ) : null}
        </a>
        <a href="#secao-pessoas" className="rounded-xl border border-navy/10 bg-white p-4 hover:border-gold/60">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Pessoas/família</p>
          <p className="mt-1 text-sm font-medium text-navy">
            {(q.data?.membros ?? []).length} pessoa(s) no caso
          </p>
          <VinculoNucleo
            caseId={String(caso["id"])}
            codigoCaso={(caso["codigo"] as string | null) ?? null}
            papelRegistro={(caso["papel_registro"] as string | null) ?? null}
            finalidade={(caso["finalidade_registro"] as string | null) ?? null}
            estadoDerivado={(caso["status_caso_derivado"] as string | null) ?? null}
          />
        </a>
        <a href="#secao-comercial" className="rounded-xl border border-navy/10 bg-white p-4 hover:border-gold/60">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Comercial/formalização</p>
          <p className="mt-1 text-sm font-medium text-navy">{rotulo(EIXO_COMERCIAL, v("eixo_comercial"))}</p>
          <p className="text-xs text-navy/60">{rotulo(EIXO_FORMALIZACAO, v("eixo_formalizacao"))}</p>
        </a>
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Pesquisa/entregas</p>
          <ul className="mt-1 space-y-1 text-xs">
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
        <div id="resumo-visao-cliente" className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Visão do cliente</p>
          <p className="mt-1 text-xs text-navy/60">O que o App Cliente mostra hoje — nunca produção interna.</p>
          {qVisaoCliente.isLoading ? (
            <p className="mt-2 text-xs text-navy/50">Carregando…</p>
          ) : qVisaoCliente.isError ? (
            <p className="mt-2 text-xs text-terracotta">Não foi possível carregar a visão do cliente.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs text-navy/80">
              <li>
                Acesso: {qVisaoCliente.data?.acesso.liberado ? "liberado" : "não liberado"}
                {qVisaoCliente.data?.acesso.statusAcesso ? ` (${qVisaoCliente.data.acesso.statusAcesso})` : ""}
              </li>
              <li>
                Última atualização liberada:{" "}
                {qVisaoCliente.data?.ultimaAtualizacaoLiberada
                  ? `${qVisaoCliente.data.ultimaAtualizacaoLiberada.tipo} — ${String(qVisaoCliente.data.ultimaAtualizacaoLiberada.em).slice(0, 10)}`
                  : "nenhuma ainda"}
              </li>
              <li>Prontas para revisão/liberação (App): {qVisaoCliente.data?.microentregasProntasParaRevisao ?? 0}</li>
              <li>Produção interna em revisão (não vai ao App sozinha): {qVisaoCliente.data?.producaoInternaEmRevisao ?? 0}</li>
              <li>Documentos disponíveis ao titular: {qVisaoCliente.data?.documentosDisponiveis ?? 0}</li>
              <li>Projeções de árvore publicadas: {qVisaoCliente.data?.projecoesDeArvore ?? 0}</li>
              <li>Preferências: sem fonte viva homologada</li>
              <li>
                Publicação: {qVisaoCliente.data?.estadoPublicacao.publicadas ?? 0} publicada(s),{" "}
                {qVisaoCliente.data?.estadoPublicacao.pendentes ?? 0} pendente(s),{" "}
                {qVisaoCliente.data?.estadoPublicacao.arquivadas ?? 0} arquivada(s)
              </li>
            </ul>
          )}
          <Link
            to="/biblioteca-evidencias/$caseId"
            params={{ caseId: id }}
            className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-4"
          >
            Preparar, revisar, aprovar, liberar ou despublicar →
          </Link>
        </div>
        <div id="resumo-financeiro" className="rounded-xl border border-navy/10 bg-white p-4 sm:col-span-2 lg:col-span-4">
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
                  disabled={mRegistrarPagamento.isPending || !qFinanceiro.data?.proximaParcela}
                  onClick={() => {
                    const parcela = qFinanceiro.data?.proximaParcela;
                    if (!parcela) return;
                    const valorStr = prompt("Valor pago:", String(parcela.valor));
                    if (!valorStr?.trim()) return;
                    const pagoEm = prompt("Data do pagamento (AAAA-MM-DD):", new Date().toISOString().slice(0, 10));
                    if (!pagoEm?.trim()) return;
                    const referencia = prompt("Referência externa do pagamento (comprovante/transação):");
                    if (!referencia?.trim()) return;
                    mRegistrarPagamento.mutate({
                      invoiceId: parcela.faturaId,
                      valor: Number(valorStr),
                      pagoEm: pagoEm.trim(),
                      referenciaExterna: referencia.trim(),
                    });
                  }}
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
                  title={qFinanceiro.data?.proximaParcela ? undefined : "Sem parcela em aberto para registrar."}
                >
                  Registrar pagamento
                </button>
                <button
                  type="button"
                  disabled={mPrepararCobranca.isPending}
                  onClick={() => {
                    const rascunho = qFinanceiro.data?.faturaRascunhoAberta;
                    if (rascunho) {
                      mPrepararCobranca.mutate({ faturaId: rascunho.faturaId });
                      return;
                    }
                    const valorStr = prompt("Valor da cobrança a preparar:");
                    if (!valorStr?.trim()) return;
                    const vencimento = prompt("Vencimento (AAAA-MM-DD):");
                    if (!vencimento?.trim()) return;
                    const descricao = prompt("Descrição interna da cobrança:") ?? "";
                    mPrepararCobranca.mutate({ valor: Number(valorStr), vencimento: vencimento.trim(), descricao });
                  }}
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5 disabled:opacity-40"
                  title="Só prepara internamente. Nenhum link, mensagem ou cobrança é enviado ao cliente."
                >
                  Preparar cobrança
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* No máximo: três tarefas, três atualizações, documentos prioritários, microentregas recentes e alertas críticos. */}
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Tarefas</p>
          <ul className="mt-2 space-y-1.5 text-sm text-navy/80">
            {(qTarefas.data?.tarefas ?? []).slice(0, 3).map((t: any) => (
              <li key={t.id}>
                {t.titulo} <span className="text-xs text-navy/50">— {t.status}</span>
              </li>
            ))}
            {!(qTarefas.data?.tarefas ?? []).length ? <li className="text-navy/50">Nenhuma tarefa aberta.</li> : null}
          </ul>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-4">
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
        <div className="rounded-xl border border-navy/10 bg-white p-4">
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
        <div className="rounded-xl border border-navy/10 bg-white p-4">
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

      {/* Índice: leva à seção sem esconder as outras. */}
      <nav
        aria-label="Seções do caso"
        className="sticky top-0 z-10 -mx-1 mb-5 flex flex-wrap gap-1.5 border-b border-navy/10 bg-cream/95 px-1 py-2 backdrop-blur"
      >
        {SECOES.map((a) => (
          <a
            key={a.id}
            href={`#secao-${a.id}`}
            className="rounded-lg px-2.5 py-1 text-[13px] text-navy/65 transition-colors hover:bg-navy/5 hover:text-navy"
          >
            {a.rotulo}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        <SecaoAncora id="visao" titulo="Indicadores">
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
                  <RadarInternoCaso
                    eixos={radarInternoDoCaso({
                      caso,
                      nucleoCompletude: d.nucleoOk,
                      nucleoCriterios: d.nucleoCriterios,
                      checksAtivacao: d.checksAtivacao,
                      bloqueiosReais: d.bloqueiosReais,
                    })}
                  />
                </div>
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
        </SecaoAncora>

        <SecaoAncora id="comercial" titulo="Jurídico">
          {/*
            27/08/2026 — decisão da Proprietária, com cautela deliberada: o
            motor e a matriz de contrato já moram em /contratos e
            /matriz-juridica (grupo Contratos dos 8 grupos). Aqui dentro do
            caso fica só o CONTRATO desta pessoa — estado e ponte, nunca
            formulário duplicado. Proposta e escopo (referência de lead) se
            mudaram para "Pessoa e família", porque compõem a pessoa, não o
            contrato.
          */}
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
                <div className="rounded-lg border border-navy/10 bg-white/60 p-3">
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
                    <li key={i} className="rounded-lg border border-navy/10 bg-white/60 p-2">
                      <p className="font-medium text-navy">{p.rotulo}</p>
                      <p className="text-navy/60">Estado: {p.estado}</p>
                      <p className="text-navy/60">Decisão necessária: {p.decisaoHumanaNecessaria}</p>
                      {p.documentoOuEvidencia ? <p className="text-navy/60">Evidência: {p.documentoOuEvidencia}</p> : null}
                      <p className="mt-1 text-terracotta">Afeta: {ROTULO_ATO_FORMAL[p.atoAfetado]}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Secao>

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
        </SecaoAncora>

        <SecaoAncora id="tecnico" titulo="Técnico e riscos">
          <div className="grid gap-5 lg:grid-cols-2">
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

            <PainelFichaPiloto caseId={id} />
          </div>
        </SecaoAncora>

        <SecaoAncora id="pessoas" titulo="Pessoa e família">
          <div className="space-y-5">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={comoPayload(q.data)}
              aoTentarNovamente={() => void q.refetch()}
              recurso="as pessoas do caso"
            >
              {([d]) => (
                <AbaPessoas
                  casoId={id}
                  membros={d.membros}
                  onMudou={recarregar}
                  atualizar={atualizar}
                  criar={criar}
                  bloqueado={bloqueado}
                />
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

        <SecaoAncora id="jornada" titulo="Jornada">
          {/*
            27/08/2026 — decisão da Proprietária: o ciclo de vida e o produto
            fazem parte da jornada do cliente, não são algo à parte. Um fio
            só, do que foi contratado até onde o percurso está hoje: produto
            e trilha (o que foi combinado) → onboarding (a cadência D0–D30
            em curso) → fechamento (o estado final) → a jornada do cliente
            propriamente dita, como moldura de tudo isso.
          */}
          <div className="space-y-8">
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
          CA04-CASO360-SIMPLES (09/09/2026): gates, auditoria, logs, versões e
          diagnósticos (histórico de fases, registro de alterações e o mapa
          de persistência campo→tabela) recolhidos por padrão — nada foi
          apagado, "secao-log" continua sendo o alvo do índice fixo.
        */}
        <details id="secao-log" className="scroll-mt-16 rounded-xl border border-navy/10 bg-white p-5">
          <summary className="cursor-pointer font-serif text-lg text-navy">
            Dados técnicos e validações
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
              {mSalvar.isPending ? "Salvando…" : "Salvar e sair"}
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

  const mCriar = useMutation({
    mutationFn: () =>
      criar({ data: { entidade: "case_members", dados: { case_id: casoId, nome: novo.trim() } } }),
    onSuccess: () => {
      setNovo("");
      setErro(null);
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao criar pessoa."),
  });

  // Caso com núcleo vinculado: a composição familiar é somente leitura, projetada de Núcleos e dossiês.
  if (temNucleo) return <PessoasDoNucleo caseId={casoId} />;

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
      <Secao
        titulo="Pessoas do caso"
        descricao="Registro de pessoa é distinto do caso e da família. Menor de idade nunca é signatário: exige representante legal."
      >
        {erro ? <p className="mb-3 text-sm text-terracotta">{erro}</p> : null}
        <div className="flex flex-wrap gap-2">
          <input
            className={inputCls + " max-w-xs"}
            placeholder="Nome completo da pessoa"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
          />
          <button
            onClick={() => mCriar.mutate()}
            disabled={novo.trim().length < 3 || mCriar.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
          >
            Adicionar pessoa
          </button>
        </div>
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
  bloqueado,
}: {
  pessoa: Record<string, unknown>;
  atualizar: (a: {
    data: { entidade: "case_members"; id: string; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  onMudou: () => void;
  bloqueado: boolean;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [salvo, setSalvo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const sujo = Object.keys(form).length > 0;

  const v = (k: string) => {
    const atual = k in form ? form[k] : pessoa[k];
    return atual === null || atual === undefined ? "" : String(atual);
  };
  const set = (k: string, valor: unknown) => setForm((f) => ({ ...f, [k]: valor }));

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
          desabilitado={bloqueado}
        />
        <Texto
          label="RG / documento"
          valor={v("rg")}
          onChange={(x) => set("rg", x)}
        />
        <Texto
          label="Estado civil"
          valor={v("estado_civil")}
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
          desabilitado={bloqueado}
          ajuda="Máscara de Brasil (DDD) por padrão. Pessoa morando fora: comece digitando + e o DDI."
        />
        <Texto
          label="E-mail"
          valor={v("email")}
          onChange={(x) => set("email", x)}
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
          desabilitado={bloqueado}
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
          onClick={() => m.mutate()}
          disabled={!sujo || m.isPending}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm text-navy disabled:opacity-40"
        >
          Salvar pessoa
        </button>
        <span className="text-xs text-navy/55">
          {m.isPending
            ? "Salvando…"
            : sujo
              ? "Alterações não salvas"
              : salvo
                ? `Salvo às ${salvo}`
                : ""}
        </span>
      </div>
    </Secao>
  );
}
