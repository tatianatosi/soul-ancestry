import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { OrquestracaoContextual } from "@/components/desk/orquestracao-contextual";
import {
  ACAO_PERMITIDA,
  contextoSeguro,
  resolverModeloVigente,
} from "@/lib/fiacao-cadencia-catalogo";
import {
  CATALOGO_ALIAS_TEMPLATES,
  PRECEDENCIA_TEMPLATES,
} from "@/lib/consolidacao-catalogos-templates";
import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta, Indicador } from "@/components/prancha-v4/kit";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { EditorTemplate } from "@/components/mensagens/editor-template";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  definirStatusTemplate,
  listarBibliotecaMensagens,
  listarUsosTemplate,
  listarVersoesTemplate,
  registrarUsoTemplate,
  ROTULO_LINK_EDITORIAL,
  rotuloStatusEditorial,
  STATUS_TEMPLATE,
  validarUsoTemplate,
  type StatusTemplate,
  type Template,
} from "@/lib/message-library.functions";

export const Route = createFileRoute("/_authenticated/biblioteca-mensagens")({
  /** CA-OPS-02: contexto de leitura vindo do alerta de cadência em /ops. Nada é gravado. */
  validateSearch: (search: Record<string, unknown>) => ({
    alerta: typeof search["alerta"] === "string" ? (search["alerta"] as string) : undefined,
    caso: typeof search["caso"] === "string" ? (search["caso"] as string) : undefined,
    codigo: typeof search["codigo"] === "string" ? (search["codigo"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Biblioteca de Mensagens — Clube Ancestral" },
      {
        name: "description",
        content:
          "Modelos internos de WhatsApp, e-mail, portal e conteúdo editorial, com versão, vigência e uso manual governado.",
      },
      { property: "og:title", content: "Biblioteca de Mensagens — Clube Ancestral" },
      {
        property: "og:description",
        content: "Modelos governados para comunicação manual da equipe, sem qualquer disparo automático.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BibliotecaMensagensPage,
  errorComponent: ({ error }) => (
    <SaasShell titulo="Biblioteca de Mensagens" descricao="Falha ao carregar os modelos internos.">
      <p role="alert" className="text-sm text-destructive">
        {(error as Error).message}
      </p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Biblioteca de Mensagens" descricao="Conteúdo não encontrado.">
      <p className="text-sm text-navy/65">Nada a exibir.</p>
    </SaasShell>
  ),
});

const REGRAS = [
  "Nada é enviado, agendado ou disparado pelo Desk: o modelo é copiado e enviado manualmente por uma pessoa.",
  "Modelo em rascunho, em revisão, suspenso, substituído ou arquivado não pode ser usado com cliente.",
  "Gates de etapa são validados no banco: contrato, pagamento, onboarding e entrega precisam existir de fato.",
  "Personalize apenas campos seguros. O log de uso registra quais variáveis foram preenchidas, nunca os valores.",
  "Conteúdo editorial não pode ser vinculado a pessoa, lead ou caso identificável.",
];

function preencher(corpo: string, valores: Record<string, string>): string {
  return corpo.replace(/\{([a-z_]+)\}/g, (_m, chave: string) => valores[chave]?.trim() || `[${chave}]`);
}

/** Filtro de tela, aplicado sobre a lista já carregada com sucesso. */
function filtrarTemplates(
  templates: Template[],
  f: { categoria: string; status: string; busca: string },
): Template[] {
  const q = f.busca.trim().toLowerCase();
  return templates.filter((t) => {
    if (f.categoria && t.categoriaId !== f.categoria) return false;
    if (f.status && t.status !== f.status) return false;
    if (!q) return true;
    return [t.nome, t.key, t.objetivo, t.etapa, t.canal]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
}

function BibliotecaMensagensPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_rascunho" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const queryClient = useQueryClient();
  const [criando, setCriando] = useState(false);
  const busca_alerta = Route.useSearch();
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Template | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(valores).length > 0);
  const [casoId, setCasoId] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [motivoArquivo, setMotivoArquivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [validacao, setValidacao] = useState<{ permitido: boolean; bloqueios: string[] } | null>(null);

  const dados = useQuery({ queryKey: ["biblioteca-mensagens"], queryFn: () => listarBibliotecaMensagens() });

  const versoes = useQuery({
    queryKey: ["biblioteca-mensagens-versoes", selecionado?.id],
    queryFn: () => listarVersoesTemplate({ data: { templateId: selecionado!.id } }),
    enabled: !!selecionado,
  });

  const usos = useQuery({
    queryKey: ["biblioteca-mensagens-usos", selecionado?.id],
    queryFn: () => listarUsosTemplate({ data: { templateId: selecionado!.id } }),
    enabled: !!selecionado,
  });

  const validar = useMutation({
    mutationFn: (v: { templateId: string; casoId: string | null }) => validarUsoTemplate({ data: v }),
    onSuccess: (r) => {
      setErro(null);
      setValidacao({ permitido: r.permitido, bloqueios: r.bloqueios });
    },
    onError: (e: Error) => setErro(e.message),
  });

  const registrar = useMutation({
    mutationFn: (v: { templateId: string; casoId: string | null; finalidade: string; variaveis: Record<string, string> }) =>
      registrarUsoTemplate({ data: v }),
    onSuccess: async () => {
      setErro(null);
      setAviso("Uso registrado. O envio continua sendo manual, pelo canal próprio.");
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-mensagens-usos"] });
    },
    onError: (e: Error) => {
      setAviso(null);
      setErro(e.message);
    },
  });

  const mudarStatus = useMutation({
    mutationFn: (v: { id: string; status: StatusTemplate; motivo?: string; sucessorId?: string | null }) =>
      definirStatusTemplate({ data: v }),
    onSuccess: async () => {
      setErro(null);
      setMotivoArquivo("");
      await queryClient.invalidateQueries({ queryKey: ["biblioteca-mensagens"] });
    },
    onError: (e: Error) => setErro(e.message),
  });

  const templates = dados.data?.templates;

  /**
   * CA-OPS-02 — resolução read-only do modelo vigente para o alerta de cadência.
   * Não registra uso, não cria rascunho, não enfileira e não envia nada.
   */
  const contextoAlerta = busca_alerta.alerta
    ? contextoSeguro(busca_alerta.alerta, { caseId: busca_alerta.caso ?? null, codigo: busca_alerta.codigo ?? null })
    : null;
  const resolucao =
    busca_alerta.alerta && templates ? resolverModeloVigente(busca_alerta.alerta, templates) : null;
  const modeloResolvidoId = resolucao?.modelo?.id ?? null;

  useEffect(() => {
    if (!modeloResolvidoId || !templates) return;
    const alvo = templates.find((t) => t.id === modeloResolvidoId);
    if (alvo) setSelecionado((atual) => atual ?? alvo);
  }, [modeloResolvidoId, templates]);

  const texto = selecionado ? preencher(selecionado.corpo, valores) : "";
  const pendentes = selecionado
    ? selecionado.variaveisObrigatorias.filter((v) => !(valores[v] ?? "").trim())
    : [];

  // V4-04: KPIs só com contagem dos modelos já lidos; sem leitura, sem faixa.
  // Vigente = modelo liberado para uso manual; nada é enviado por esta tela.
  const todosTemplates = dados.data?.templates;
  const kpisModelos = todosTemplates
    ? [
        { rotulo: "Modelos", valor: todosTemplates.length, apoio: "Cadastrados na biblioteca" },
        { rotulo: "Vigentes", valor: todosTemplates.filter((t) => t.status === "vigente").length, apoio: "Uso manual liberado" },
        { rotulo: "Em revisão", valor: todosTemplates.filter((t) => t.status === "em_revisao").length, apoio: "Aguardam aprovação" },
        { rotulo: "Arquivados", valor: todosTemplates.filter((t) => t.arquivado).length, apoio: "Histórico preservado" },
      ]
    : null;

  return (
    <SaasShell
      titulo="Biblioteca de Mensagens e Conteúdos"
      descricao="Modelos internos governados para WhatsApp, e-mail, portal e conteúdo editorial. Uso manual, com versão, vigência e trilha de auditoria."
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="space-y-6">
        {kpisModelos ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-biblioteca-mensagens-kpis>
            {kpisModelos.map((k) => (
              <Indicador key={k.rotulo} rotulo={k.rotulo} valor={String(k.valor)} apoio={k.apoio} />
            ))}
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-2">
        <CaCard titulo="Catálogo canônico de modelos" eyebrow="Mensagens · precedência">
        <section data-catalogo="precedencia-templates">
          <p className="text-xs text-navy/65">
            {PRECEDENCIA_TEMPLATES.regra} A entrada histórica “{CATALOGO_ALIAS_TEMPLATES.rotulo}” da Biblioteca Mestre
            permanece registrada, sem conteúdo próprio, e aponta para esta tela. Nenhum modelo, versão ou histórico de
            uso foi removido.
          </p>
        </section>
        </CaCard>

        <CaCard titulo="Regras de uso" eyebrow="Mensagens · governança">
          <ul className="space-y-1 text-xs text-navy/65">
            {REGRAS.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </CaCard>
        </div>


        {contextoAlerta ? (
          <section
            data-fiacao="alerta-cadencia"
            className="rounded-xl border border-navy/15 bg-cream/50 p-4"
          >
            <h2 className="text-sm font-medium text-foreground">
              Modelo sugerido para o alerta: {contextoAlerta.rotuloAlerta}
            </h2>
            <p className="mt-1 text-xs text-navy/65">
              Contexto de leitura, não persistido. Ação permitida: {ACAO_PERMITIDA.replace(/_/g, " ")}. Nenhuma
              mensagem é enviada, enfileirada ou registrada por abrir este modelo.
            </p>
            <dl className="mt-2 grid gap-1 text-xs text-navy/65 sm:grid-cols-2">
              <div>
                <dt className="inline font-medium text-foreground">Caso: </dt>
                <dd className="inline">{contextoAlerta.codigoCaso ?? contextoAlerta.caseId ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Severidade: </dt>
                <dd className="inline">{contextoAlerta.severidade}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Gate aplicável: </dt>
                <dd className="inline">{contextoAlerta.gate}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Variáveis permitidas: </dt>
                <dd className="inline">{contextoAlerta.variaveisPermitidas.join(", ")}</dd>
              </div>
            </dl>
            {resolucao?.modelo ? (
              <p className="mt-2 text-xs text-foreground">
                Modelo vigente resolvido: <strong>{resolucao.modelo.nome}</strong>. Revise e copie manualmente.
              </p>
            ) : (
              <p className="mt-2 text-xs text-foreground">Não há modelo vigente para este alerta.</p>
            )}
          </section>
        ) : null}

        <OrquestracaoContextual />

        <section data-criar-modelo className="space-y-2">
          {criando ? (
            <EditorTemplate
              categorias={(dados.data?.categorias ?? []).map((c) => ({ id: c.id, name: c.name }))}
              aoConcluir={() => {
                setCriando(false);
                void queryClient.invalidateQueries({ queryKey: ["biblioteca-mensagens"] });
              }}
              aoCancelar={() => setCriando(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCriando(true)}
              className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
            >
              Criar modelo
            </button>
          )}
        </section>

        <section className="grid gap-2 sm:grid-cols-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, chave, etapa ou canal"
            aria-label="Buscar modelo"
            className="rounded-lg border border-navy/15 bg-background px-3 py-2 text-sm"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-lg border border-navy/15 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas as categorias</option>
            {dados.data?.categorias?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-navy/15 bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os estados</option>
            {STATUS_TEMPLATE.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </section>

        <EstadoDados
          carregando={dados.isLoading}
          erro={dados.error}
          dados={dados.data?.templates}
          aoTentarNovamente={() => void dados.refetch()}
          recurso="os modelos internos"
          vazio="Nenhum modelo cadastrado na biblioteca. A consulta foi concluída com sucesso."
        >
          {(todos) => {
            const lista = filtrarTemplates(todos, { categoria, status, busca });
            if (lista.length === 0) {
              return (
                <EstadoVazio mensagem="Nenhum modelo com os filtros atuais." />
              );
            }
            return (
          <ul className="grid gap-3 lg:grid-cols-2">
            {lista.map((t) => (
              <li key={t.id} className="rounded-xl border border-navy/15 bg-cream/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{t.nome}</div>
                    <p className="mt-0.5 text-xs text-navy/65">{t.objetivo ?? "—"}</p>
                  </div>
                  <Etiqueta
                    texto={STATUS_TEMPLATE.find((s) => s.valor === t.status)?.rotulo ?? String(t.status)}
                    tom={
                      t.status === "vigente"
                        ? "sucesso"
                        : t.status === "aprovado"
                          ? "neutro"
                          : t.status === "rascunho" || t.status === "em_revisao"
                            ? "atencao"
                            : "critico"
                    }
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/65">
                  <span>{t.categoriaNome}</span>
                  <span>Canal: {t.canal}</span>
                  <span>Versão {t.versao}</span>
                  {t.etapa && <span>Etapa: {t.etapa}</span>}
                  {t.arquivado && <span>Arquivado: {t.motivoArquivo ?? "sem motivo"}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const mesmo = selecionado?.id === t.id;
                    setSelecionado(mesmo ? null : t);
                    setValores({});
                    setValidacao(null);
                    setErro(null);
                    setAviso(null);
                  }}
                  className="mt-3 text-xs font-medium text-navy underline-offset-2 hover:underline"
                >
                  {selecionado?.id === t.id ? "Fechar modelo" : "Abrir modelo"}
                </button>
              </li>
            ))}
          </ul>
            );
          }}
        </EstadoDados>

        {selecionado && (
          <section className="space-y-4 rounded-xl border border-navy/15 bg-cream/50 p-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">{selecionado.nome}</h2>
              <p className="mt-1 text-xs text-navy/65">
                Público: {selecionado.publico} · Canal: {selecionado.canal} · Versão {selecionado.versao}
              </p>
            </div>

            {selecionado.variaveisSeguras.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {selecionado.variaveisSeguras.map((v) => (
                  <label key={v} className="block text-xs">
                    <span className="text-navy/65">{v}</span>
                    <input
                      value={valores[v] ?? ""}
                      onChange={(e) => setValores({ ...valores, [v]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-navy/15 bg-background px-2 py-1.5 text-xs"
                    />
                  </label>
                ))}
              </div>
            )}

            <label className="block text-xs">
              <span className="text-navy/65">Caso vinculado (identificador interno), quando aplicável</span>
              <input
                value={casoId}
                onChange={(e) => setCasoId(e.target.value)}
                placeholder="ID do caso"
                className="mt-1 w-full rounded-lg border border-navy/15 bg-background px-2 py-1.5 text-xs"
              />
            </label>

            <pre className="whitespace-pre-wrap rounded-lg border border-navy/15 bg-cream/60/30 p-3 text-xs text-foreground">
              {texto}
            </pre>

            {pendentes.length > 0 && (
              <p className="text-xs text-destructive">Campos obrigatórios pendentes: {pendentes.join(", ")}.</p>
            )}

            {validacao && (
              <div className="rounded-lg border border-navy/15 bg-cream/60/30 p-3 text-xs">
                {validacao.permitido ? (
                  <p className="text-foreground">Uso liberado: modelo vigente e gates cumpridos.</p>
                ) : (
                  <ul className="space-y-1 text-destructive">
                    {validacao.bloqueios.map((b) => (
                      <li key={b}>• {b}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {erro && (
              <p role="alert" className="text-xs text-destructive">
                {erro}
              </p>
            )}
            {aviso && <p className="text-xs text-navy">{aviso}</p>}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={validar.isPending}
                onClick={() => validar.mutate({ templateId: selecionado.id, casoId: casoId || null })}
                className="rounded-lg border border-navy/15 px-3 py-2 text-xs font-medium text-foreground disabled:opacity-60"
              >
                {validar.isPending ? "Conferindo…" : "Conferir liberação de uso"}
              </button>
              <AcaoOperacional
                rotulo={registrar.isPending ? "Registrando…" : "Copiar e registrar uso manual"}
                capacidade="editar_rascunho"
                pendenciaGate={
                  pendentes.length ? `Campos obrigatórios pendentes: ${pendentes.join(", ")}` : null
                }
                efeito="Copia o texto para a área de transferência e registra o uso manual do modelo. Nada é enviado ao cliente por esta tela."
                onConfirmar={async () => {
                  await navigator.clipboard.writeText(texto).catch(() => undefined);
                  await registrar.mutateAsync({
                    templateId: selecionado.id,
                    casoId: casoId || null,
                    finalidade,
                    variaveis: valores,
                  });
                }}
              />
              <input
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                placeholder="Finalidade do uso (opcional)"
                aria-label="Finalidade do uso"
                className="min-w-48 flex-1 rounded-lg border border-navy/15 bg-background px-2 py-1.5 text-xs"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-navy/15 bg-cream/60/20 p-3 text-xs">
              <p className="text-foreground">Ciclo de vigência</p>
              <div className="flex flex-wrap gap-2">
                {(["aprovado", "vigente", "suspenso"] as StatusTemplate[]).map((s) => (
                  <AcaoOperacional
                    key={s}
                    size="sm"
                    variant="outline"
                    rotulo={`Marcar como ${STATUS_TEMPLATE.find((o) => o.valor === s)?.rotulo}`}
                    capacidade="editar_rascunho"
                    efeito="Altera o estado de vigência deste modelo na biblioteca interna."
                    onConfirmar={async () => {
                      await mudarStatus.mutateAsync({ id: selecionado.id, status: s });
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={motivoArquivo}
                  onChange={(e) => setMotivoArquivo(e.target.value)}
                  placeholder="Motivo do arquivamento"
                  aria-label="Motivo do arquivamento"
                  className="min-w-48 flex-1 rounded-lg border border-navy/15 bg-background px-2 py-1.5 text-xs"
                />
                <AcaoOperacional
                  size="sm"
                  variant="outline"
                  rotulo="Arquivar modelo"
                  capacidade="editar_rascunho"
                  pendenciaGate={motivoArquivo.trim() ? null : "Motivo do arquivamento não preenchido"}
                  efeito="Arquiva o modelo. O registro continua consultável; nada é excluído fisicamente."
                  onConfirmar={async (motivo) => {
                    await mudarStatus.mutateAsync({
                      id: selecionado.id,
                      status: "arquivado",
                      motivo: motivoArquivo.trim() || motivo,
                    });
                  }}
                />
              </div>
              <p className="text-navy/65">
                Não há exclusão física: arquivar exige motivo e substituir exige apontar o sucessor.
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-navy/15 p-3 text-xs">
                <p className="font-medium text-foreground">Histórico de versões</p>
                <EstadoDados
                  carregando={versoes.isLoading}
                  erro={versoes.error}
                  dados={versoes.data?.versoes}
                  aoTentarNovamente={() => void versoes.refetch()}
                  recurso="o histórico de versões"
                  vazio="Sem versões anteriores registradas."
                >
                  {(itens) => (
                    <ul className="mt-1 space-y-1 text-navy/65">
                      {itens.map((v) => (
                        <li key={v.id}>
                          v{v.versao} · {v.status} · {String(v.criadoEm).slice(0, 10)}
                        </li>
                      ))}
                    </ul>
                  )}
                </EstadoDados>
              </div>
              <div className="rounded-lg border border-navy/15 p-3 text-xs">
                <p className="font-medium text-foreground">Usos registrados (sem disparo)</p>
                <EstadoDados
                  carregando={usos.isLoading}
                  erro={usos.error}
                  dados={usos.data?.usos}
                  aoTentarNovamente={() => void usos.refetch()}
                  recurso="os usos registrados"
                  vazio="Nenhum uso registrado ainda."
                >
                  {(itens) => (
                    <ul className="mt-1 space-y-1 text-navy/65">
                      {itens.map((u) => (
                        <li key={u.id}>
                          v{u.versao} · {u.canal} · {String(u.em).slice(0, 16).replace("T", " ")}
                        </li>
                      ))}
                    </ul>
                  )}
                </EstadoDados>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-navy/15 bg-cream/50 p-4">
          <h2 className="text-sm font-medium text-foreground">Conteúdos editoriais</h2>
          <p className="mt-1 text-xs text-navy/65">
            Pautas e materiais institucionais. Não podem ser vinculados a pessoa, lead ou caso identificável.
          </p>
          <EstadoDados
            carregando={dados.isLoading}
            erro={dados.error}
            dados={dados.data?.editorial}
            aoTentarNovamente={() => void dados.refetch()}
            recurso="os conteúdos editoriais"
            vazio="Nenhuma pauta registrada."
          >
            {(itens) => (
              <ul className="mt-3 space-y-2">
                {itens.map((e) => (
                  <li key={e.id} className="rounded-lg border border-navy/15 p-3 text-xs">
                    <div className="font-medium text-foreground">{e.titulo}</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-navy/65">
                      <span>{e.tipo}</span>
                      {e.tema && <span>Tema: {e.tema}</span>}
                      {e.etapaFunil && <span>Etapa: {e.etapaFunil}</span>}
                      <span>Estado: {rotuloStatusEditorial(e.status)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-navy/65">
                      <span>Responsável: {e.responsavel ?? "Sem responsável definido"}</span>
                      <span>Próxima ação: {e.proximaAcao}</span>
                    </div>
                    <div className="mt-1 text-navy/65">
                      {e.vinculos.length === 0 ? (
                        <span>Sem vínculo aplicável registrado.</span>
                      ) : (
                        <span>
                          Vínculo:{" "}
                          {e.vinculos
                            .map((v) => `${ROTULO_LINK_EDITORIAL[v.linkType] ?? v.linkType} · ${v.entidadeTipo}`)
                            .join(" · ")}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </EstadoDados>
        </section>
      </div>
    </SaasShell>
  );
}
