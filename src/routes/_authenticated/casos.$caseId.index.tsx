import { createFileRoute, Link, useBlocker, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { SaasShell, useSaas, EstadoVazio } from "@/components/saas/shell";
import { atualizarRegistro, criarRegistro } from "@/lib/saas.functions";
import { obterPropostaCanvaDoCliente } from "@/lib/comercial.functions";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { carregarCanonico } from "@/lib/caso-canonico.functions";
import { AbaVisaoGeral } from "@/components/caso/visao-geral";
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
  rotulo,
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
  { id: "log", rotulo: "Registro de alterações" },
] as const;

function FichaCaso() {
  const { caseId: id } = useParams({ from: "/_authenticated/casos/$caseId/" });
  const { podeEscrever } = useSaas();
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

  const derivadoGates = useMemo(
    () => estadoDerivadoPorGates((caso ?? {}) as Record<string, unknown>),
    [caso],
  );

  const viaSugerida = sugerirVia({ pais: v("pais_linha_prioritaria") });

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
        />
      </SaasShell>
    );
  }

  const bloqueado = !podeEscrever || Boolean(caso["archived_at"]);

  return (
    <SaasShell
      titulo={String(caso["titulo"] ?? "Caso")}
      descricao={`${caso["codigo"] ?? "sem código"} · ficha operacional canônica`}
      acoes={
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => mSalvar.mutate()}
            disabled={bloqueado || !sujo || mSalvar.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-cream disabled:opacity-40"
          >
            Salvar alterações
          </button>
        </div>
      }
    >
      {ehFixtureLinha(caso as never) ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-xs font-medium tracking-wide text-navy">
          {ROTULO_DEMONSTRACAO} — registro de teste. Não entra em Painel Hoje, filas, métricas nem
          App Cliente.
        </p>
      ) : null}
      <VinculoNucleo
        caseId={String(caso["id"])}
        codigoCaso={(caso["codigo"] as string | null) ?? null}
        papelRegistro={(caso["papel_registro"] as string | null) ?? null}
        finalidade={(caso["finalidade_registro"] as string | null) ?? null}
        estadoDerivado={(caso["status_caso_derivado"] as string | null) ?? null}
      />

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
      {bloqueado ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Edição indisponível:{" "}
          {caso["archived_at"] ? "caso arquivado." : "seu papel é somente leitura."}
        </p>
      ) : null}

      {/* Cabeçalho de estado */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          { t: "Eixo comercial", d: rotulo(EIXO_COMERCIAL, v("eixo_comercial")) },
          { t: "Formalização e operação", d: rotulo(EIXO_FORMALIZACAO, v("eixo_formalizacao")) },
          { t: "Status derivado (calculado)", d: rotulo(STATUS_DERIVADO, derivado.valor) },
          { t: "Responsável principal", d: v("responsavel_principal") || "—" },
        ].map((c) => (
          <div key={c.t} className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-[11px] uppercase tracking-wide text-navy/50">{c.t}</p>
            <p className="mt-1 text-sm font-medium text-navy">{c.d}</p>
          </div>
        ))}
      </div>
      <p className="-mt-4 mb-3 text-xs text-navy/55">
        Motivo do status derivado: {derivado.motivo}
      </p>
      <div
        className={
          "mb-6 rounded-xl border px-4 py-3 " +
          (derivadoGates.elegivel
            ? "border-navy/15 bg-navy/5"
            : "border-terracotta/40 bg-terracotta/10")
        }
      >
        <p className="text-[11px] uppercase tracking-wide text-navy/50">
          Estado derivado pelos requisitos de ativação
        </p>
        <p className="mt-1 text-sm font-medium text-navy">{derivadoGates.rotulo}</p>
        <p className="mt-1 text-xs text-navy/65">{derivadoGates.explicacao}</p>
        <p className="mt-1 text-[11px] text-navy/50">
          Leitura explicável: não altera status, não habilita cobrança, envio ou ambiente do
          cliente. As travas são revalidadas no servidor.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Link
          to="/achados/$caseId"
          params={{ caseId: id }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Achados genealógicos e encontros de linhagem →
        </Link>
        <Link
          to="/pessoas-linhagens/$caseId"
          params={{ caseId: id }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Pessoas e linhagens (ficha genealógica interna) →
        </Link>
        <Link
          to="/biblioteca-evidencias/$caseId"
          params={{ caseId: id }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Biblioteca de evidências e projeções autorizadas →
        </Link>
        <Link
          to="/pesquisa-evidencias/$caseId"
          params={{ caseId: id }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Pesquisa genealógica e evidências (documentos e solicitações) →
        </Link>
        <Link
          to="/plano-acao/$caseId"
          params={{ caseId: id }}
          search={{ foco: undefined }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Pesquisa e Evidências → Plano de Ação de Pesquisa →
        </Link>
        <Link
          to="/fontes-genealogicas"
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Pesquisa e Evidências → Fontes e Integrações Genealógicas (catálogo interno) →
        </Link>
        <Link
          to="/relatorios-fase/$caseId"
          params={{ caseId: id }}
          className="text-xs font-medium text-navy underline decoration-gold underline-offset-4"
        >
          Relatórios de fase (F1 a F5 e memória de legado) →
        </Link>
      </div>

      {sugestoes.length ? (
        <div className="mb-6 rounded-xl border border-gold/40 bg-gold/10 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy">
            Sugestões de jornada (não executam ação)
          </p>
          <ul className="space-y-1 text-sm text-navy/80">
            {sugestoes.map((s) => (
              <li key={s.titulo}>
                <span className="font-medium">{s.titulo}</span> — {s.detalhe}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
          <AbaVisaoGeral
            caso={caso}
            timeline={q.data?.timeline ?? []}
            blueprint={q.data?.blueprint ?? []}
            filaDrive={q.data?.filaDrive ?? []}
          />
          <div className="mt-5">
            <AbaProximaAcao
              caseId={id}
              caso={caso}
              alertas={qc2.data?.alertas ?? []}
              comunicacoes={qc2.data?.comunicacoes ?? []}
              bloqueado={bloqueado}
              onMudou={recarregar}
              v={v}
              set={set}
            />
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
                  desabilitado={bloqueado}
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
                  {(qc2.data?.aliases ?? []).length === 0 ? (
                    <p className="rounded-lg border border-navy/10 bg-navy/5 px-3 py-2 text-sm text-navy/60">
                      Nenhum identificador histórico registrado.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {(qc2.data?.aliases ?? []).map((a) => (
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
                  <p className="mt-1 text-xs text-navy/50">
                    Somente consulta interna. Alias nunca vira chave do caso e nunca é apagado.
                  </p>
                </div>
                <Texto
                  label="Data de entrada do caso"
                  tipo="date"
                  valor={v("data_entrada_caso")}
                  onChange={(x) => set("data_entrada_caso", x)}
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Case service / trilha (ID)"
                  valor={v("citizenship_track_id")}
                  onChange={(x) => set("citizenship_track_id", x)}
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Cargo do responsável"
                  valor={v("cargo_responsavel_principal")}
                  onChange={(x) => set("cargo_responsavel_principal", x)}
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Supervisora do caso"
                  valor={v("supervisora_do_caso")}
                  onChange={(x) => set("supervisora_do_caso", x)}
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Justificativa / detalhe"
                  valor={v("proxima_acao_justificativa")}
                  onChange={(x) => set("proxima_acao_justificativa", x)}
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Link de origem interna"
                  valor={v("link_origem_interna")}
                  onChange={(x) => set("link_origem_interna", x)}
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Resumo interno"
                  valor={v("resumo_interno")}
                  onChange={(x) => set("resumo_interno", x)}
                  desabilitado={bloqueado}
                  area
                />
                <Texto
                  label="Brief interno"
                  valor={v("brief_interno")}
                  onChange={(x) => set("brief_interno", x)}
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Data da confirmação formal da proposta"
                  tipo="date"
                  valor={v("data_confirmacao_formal_proposta")}
                  onChange={(x) => set("data_confirmacao_formal_proposta", x)}
                  desabilitado={bloqueado}
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
                  desabilitado={bloqueado}
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
                  <ul className="mt-2 space-y-1 text-xs">
                    {(q.data?.nucleoCriterios ?? []).map((c) => (
                      <li key={c.chave} className={c.ok ? "text-navy/60" : "text-terracotta"}>
                        {c.ok ? "✓" : "•"} {c.rotulo}
                        {c.ok ? "" : ` — ${c.motivo ?? "pendente"}`}
                      </li>
                    ))}
                    {(q.data?.nucleoCriterios ?? []).length === 0 ? (
                      <li className="text-navy/50">Sem critérios avaliados.</li>
                    ) : null}
                  </ul>
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
                  Validação jurídica (bloqueios)
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
                  desabilitado={bloqueado}
                />
                <Selecao
                  label="Via jurídica preliminar"
                  valor={v("via_juridica_preliminar")}
                  opcoes={VIAS_JURIDICAS}
                  onChange={(x) => set("via_juridica_preliminar", x)}
                  desabilitado={bloqueado}
                />
                <Selecao
                  label="Status da via"
                  valor={v("status_via")}
                  opcoes={STATUS_VIA}
                  onChange={(x) => set("status_via", x)}
                  desabilitado={bloqueado}
                />
                <Selecao
                  label="Revisão humana jurídica"
                  valor={v("revisao_humana_juridica")}
                  opcoes={REVISAO_JURIDICA}
                  onChange={(x) => set("revisao_humana_juridica", x)}
                  desabilitado={bloqueado}
                />
              </div>
              {viaSugerida && viaSugerida !== v("via_juridica_preliminar") ? (
                <p className="mt-3 text-xs text-navy/60">
                  Sugestão do sistema: {rotulo(VIAS_JURIDICAS, viaSugerida)}.{" "}
                  {!bloqueado ? (
                    <button
                      className="underline"
                      onClick={() => {
                        set("via_juridica_preliminar", viaSugerida);
                        set("status_via", "sugerida");
                      }}
                    >
                      aplicar como sugestão
                    </button>
                  ) : null}
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
                  desabilitado={bloqueado}
                />
                <Texto
                  label="Aderência (%)"
                  tipo="number"
                  valor={v("radar_aderencia_percentual")}
                  onChange={(x) => set("radar_aderencia_percentual", x)}
                  desabilitado={bloqueado}
                  ajuda="Só preencher com cálculo revisado internamente."
                />
              </div>
              <div className="mt-4">
                <Texto
                  label="Hipótese de trabalho interna"
                  valor={v("hipotese_trabalho_interna")}
                  onChange={(x) => set("hipotese_trabalho_interna", x)}
                  desabilitado={bloqueado}
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
                desabilitado={bloqueado}
              />
            </Secao>

            <PainelFichaPiloto caseId={id} />
          </div>
        </SecaoAncora>

        <SecaoAncora id="pessoas" titulo="Pessoa e família">
          <div className="space-y-5">
            <AbaPessoas
              casoId={id}
              membros={q.data?.membros ?? []}
              bloqueado={bloqueado}
              onMudou={recarregar}
              atualizar={atualizar}
              criar={criar}
            />
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
            <AbaEtiquetas
              caseId={id}
              taxonomia={qc2.data?.taxonomia ?? []}
              aplicadas={qc2.data?.etiquetas ?? []}
              bloqueado={bloqueado}
              onMudou={recarregar}
            />
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
              <AbaProdutoTrilha
                caseId={id}
                produtos={qc2.data?.produtos ?? []}
                trilhas={qc2.data?.trilhas ?? []}
                servicos={qc2.data?.servicos ?? []}
                bloqueado={bloqueado}
                onMudou={recarregar}
              />
              <ConsolidacaoCaseService caseId={id} />
            </div>

            <AbaOnboarding
              caso={caso}
              itens={qc2.data?.onboarding ?? []}
              nucleos={qc2.data?.nucleos ?? []}
              membrosNucleo={qc2.data?.membrosNucleo ?? []}
              planoInicialOk={Boolean(q.data?.planoInicialOk)}
              bloqueado={bloqueado}
              onMudou={recarregar}
            />

            <AbaFechamento casoId={id} bloqueado={bloqueado} />
          </div>
        </SecaoAncora>

        <SecaoAncora id="log" titulo="Registro de alterações">
          <Secao
            titulo="Registro de alterações"
            descricao="Quem alterou, quando e o quê. Nada é apagado."
          >
            {(q.data?.log ?? []).length === 0 ? (
              <p className="text-sm text-navy/55">Nenhuma alteração registrada ainda.</p>
            ) : (
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
                    {(q.data?.log ?? []).map((l: Record<string, unknown>) => (
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
          </Secao>
        </SecaoAncora>
      </div>

      <MapaPersistenciaCaso />

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
              disabled={bloqueado || mSalvar.isPending}
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
  bloqueado,
  onMudou,
  atualizar,
  criar,
}: {
  casoId: string;
  membros: Record<string, unknown>[];
  bloqueado: boolean;
  onMudou: () => void;
  atualizar: (a: {
    data: { entidade: "case_members"; id: string; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  criar: (a: {
    data: { entidade: "case_members"; dados: Record<string, unknown> };
  }) => Promise<unknown>;
}) {
  const [novo, setNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const carregarNucleos = useServerFn(listarNucleos);
  const qNucleos = useQuery({
    queryKey: ["nucleos-desk"],
    queryFn: () => carregarNucleos(),
    retry: false,
  });
  const temNucleo = ((qNucleos.data ?? []) as { case_id: string | null }[]).some(
    (n) => n.case_id === casoId,
  );

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
            disabled={bloqueado}
            onChange={(e) => setNovo(e.target.value)}
          />
          <button
            onClick={() => mCriar.mutate()}
            disabled={bloqueado || novo.trim().length < 3 || mCriar.isPending}
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
            bloqueado={bloqueado}
            atualizar={atualizar}
            onMudou={onMudou}
          />
        ))
      )}
    </div>
  );
}

function CartaoPessoa({
  pessoa,
  bloqueado,
  atualizar,
  onMudou,
}: {
  pessoa: Record<string, unknown>;
  bloqueado: boolean;
  atualizar: (a: {
    data: { entidade: "case_members"; id: string; dados: Record<string, unknown> };
  }) => Promise<unknown>;
  onMudou: () => void;
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
          desabilitado={bloqueado}
        />
        <Selecao
          label="Status cadastral"
          valor={v("status_cadastral")}
          opcoes={STATUS_CADASTRAL}
          onChange={(x) => set("status_cadastral", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Parentesco"
          valor={v("parentesco")}
          onChange={(x) => set("parentesco", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Data de nascimento"
          tipo="date"
          valor={v("data_nascimento")}
          onChange={(x) => set("data_nascimento", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Local de nascimento"
          valor={v("local_nascimento")}
          onChange={(x) => set("local_nascimento", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Representante legal"
          valor={v("representante_legal")}
          onChange={(x) => set("representante_legal", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="CPF"
          valor={v("cpf")}
          onChange={(x) => set("cpf", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="RG / documento"
          valor={v("rg")}
          onChange={(x) => set("rg", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Estado civil"
          valor={v("estado_civil")}
          onChange={(x) => set("estado_civil", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Profissão"
          valor={v("profissao")}
          onChange={(x) => set("profissao", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Telefone"
          valor={v("telefone")}
          onChange={(x) => set("telefone", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="E-mail"
          valor={v("email")}
          onChange={(x) => set("email", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Endereço"
          valor={v("endereco")}
          onChange={(x) => set("endereco", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="CEP"
          valor={v("cep")}
          onChange={(x) => set("cep", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Documentos pendentes"
          valor={v("documentos_pendentes")}
          onChange={(x) => set("documentos_pendentes", x)}
          desabilitado={bloqueado}
        />
        <Texto
          label="Consentimentos"
          valor={v("consentimentos")}
          onChange={(x) => set("consentimentos", x)}
          desabilitado={bloqueado}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => m.mutate()}
          disabled={bloqueado || !sujo || m.isPending}
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
