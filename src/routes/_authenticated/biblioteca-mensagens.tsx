import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { OrquestracaoContextual } from "@/components/desk/orquestracao-contextual";
import { SaasShell } from "@/components/saas/shell";
import {
  definirStatusTemplate,
  listarBibliotecaMensagens,
  listarUsosTemplate,
  listarVersoesTemplate,
  registrarUsoTemplate,
  STATUS_TEMPLATE,
  validarUsoTemplate,
  type StatusTemplate,
  type Template,
} from "@/lib/message-library.functions";

export const Route = createFileRoute("/_authenticated/biblioteca-mensagens")({
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
        {error.message}
      </p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Biblioteca de Mensagens" descricao="Conteúdo não encontrado.">
      <p className="text-sm text-muted-foreground">Nada a exibir.</p>
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

function BibliotecaMensagensPage() {
  const queryClient = useQueryClient();
  const [categoria, setCategoria] = useState("");
  const [status, setStatus] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Template | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
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

  const templates = dados.data?.templates ?? [];
  const categorias = dados.data?.categorias ?? [];
  const ehAdmin = dados.data?.ehAdmin ?? false;

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return templates.filter((t) => {
      if (categoria && t.categoriaId !== categoria) return false;
      if (status && t.status !== status) return false;
      if (!q) return true;
      return [t.nome, t.key, t.objetivo, t.etapa, t.canal].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [templates, categoria, status, busca]);

  const texto = selecionado ? preencher(selecionado.corpo, valores) : "";
  const pendentes = selecionado
    ? selecionado.variaveisObrigatorias.filter((v) => !(valores[v] ?? "").trim())
    : [];

  return (
    <SaasShell
      titulo="Biblioteca de Mensagens e Conteúdos"
      descricao="Modelos internos governados para WhatsApp, e-mail, portal e conteúdo editorial. Uso manual, com versão, vigência e trilha de auditoria."
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">Regras de uso</h2>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {REGRAS.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </section>

        <OrquestracaoContextual />

        <section className="grid gap-2 sm:grid-cols-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, chave, etapa ou canal"
            aria-label="Buscar modelo"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os estados</option>
            {STATUS_TEMPLATE.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </section>

        {dados.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando modelos internos…</p>
        ) : lista.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Nenhum modelo com os filtros atuais.
          </p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {lista.map((t) => (
              <li key={t.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{t.nome}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.objetivo ?? "—"}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      t.status === "vigente"
                        ? "bg-primary/10 text-primary"
                        : t.status === "aprovado"
                          ? "bg-muted text-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {STATUS_TEMPLATE.find((s) => s.valor === t.status)?.rotulo}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                  className="mt-3 text-xs font-medium text-primary underline-offset-2 hover:underline"
                >
                  {selecionado?.id === t.id ? "Fechar modelo" : "Abrir modelo"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selecionado && (
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <h2 className="text-sm font-medium text-foreground">{selecionado.nome}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Público: {selecionado.publico} · Canal: {selecionado.canal} · Versão {selecionado.versao}
              </p>
            </div>

            {selecionado.variaveisSeguras.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {selecionado.variaveisSeguras.map((v) => (
                  <label key={v} className="block text-xs">
                    <span className="text-muted-foreground">{v}</span>
                    <input
                      value={valores[v] ?? ""}
                      onChange={(e) => setValores({ ...valores, [v]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    />
                  </label>
                ))}
              </div>
            )}

            <label className="block text-xs">
              <span className="text-muted-foreground">Caso vinculado (identificador interno), quando aplicável</span>
              <input
                value={casoId}
                onChange={(e) => setCasoId(e.target.value)}
                placeholder="ID do caso"
                className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              />
            </label>

            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground">
              {texto}
            </pre>

            {pendentes.length > 0 && (
              <p className="text-xs text-destructive">Campos obrigatórios pendentes: {pendentes.join(", ")}.</p>
            )}

            {validacao && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
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
            {aviso && <p className="text-xs text-primary">{aviso}</p>}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={validar.isPending}
                onClick={() => validar.mutate({ templateId: selecionado.id, casoId: casoId || null })}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground disabled:opacity-60"
              >
                {validar.isPending ? "Conferindo…" : "Conferir liberação de uso"}
              </button>
              <button
                type="button"
                disabled={registrar.isPending || pendentes.length > 0}
                onClick={async () => {
                  await navigator.clipboard.writeText(texto).catch(() => undefined);
                  registrar.mutate({
                    templateId: selecionado.id,
                    casoId: casoId || null,
                    finalidade,
                    variaveis: valores,
                  });
                }}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
              >
                {registrar.isPending ? "Registrando…" : "Copiar e registrar uso manual"}
              </button>
              <input
                value={finalidade}
                onChange={(e) => setFinalidade(e.target.value)}
                placeholder="Finalidade do uso (opcional)"
                aria-label="Finalidade do uso"
                className="min-w-48 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
              />
            </div>

            {ehAdmin && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                <p className="text-foreground">Ciclo de vigência (somente administrador)</p>
                <div className="flex flex-wrap gap-2">
                  {(["aprovado", "vigente", "suspenso"] as StatusTemplate[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => mudarStatus.mutate({ id: selecionado.id, status: s })}
                      className="rounded-lg border border-border px-2 py-1 text-xs text-foreground"
                    >
                      Marcar como {STATUS_TEMPLATE.find((o) => o.valor === s)?.rotulo}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={motivoArquivo}
                    onChange={(e) => setMotivoArquivo(e.target.value)}
                    placeholder="Motivo do arquivamento"
                    aria-label="Motivo do arquivamento"
                    className="min-w-48 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      mudarStatus.mutate({ id: selecionado.id, status: "arquivado", motivo: motivoArquivo })
                    }
                    className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground"
                  >
                    Arquivar modelo
                  </button>
                </div>
                <p className="text-muted-foreground">
                  Não há exclusão física: arquivar exige motivo e substituir exige apontar o sucessor.
                </p>
              </div>
            )}

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-border p-3 text-xs">
                <p className="font-medium text-foreground">Histórico de versões</p>
                {versoes.data?.versoes?.length ? (
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {versoes.data.versoes.map((v) => (
                      <li key={v.id}>
                        v{v.versao} · {v.status} · {String(v.criadoEm).slice(0, 10)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-muted-foreground">Sem versões anteriores registradas.</p>
                )}
              </div>
              <div className="rounded-lg border border-border p-3 text-xs">
                <p className="font-medium text-foreground">Usos registrados (sem disparo)</p>
                {usos.data?.usos?.length ? (
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {usos.data.usos.map((u) => (
                      <li key={u.id}>
                        v{u.versao} · {u.canal} · {String(u.em).slice(0, 16).replace("T", " ")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-muted-foreground">Nenhum uso registrado ainda.</p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium text-foreground">Conteúdos editoriais</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pautas e materiais institucionais. Não podem ser vinculados a pessoa, lead ou caso identificável.
          </p>
          <ul className="mt-3 space-y-2">
            {(dados.data?.editorial ?? []).map((e) => (
              <li key={e.id} className="rounded-lg border border-border p-3 text-xs">
                <div className="font-medium text-foreground">{e.titulo}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 text-muted-foreground">
                  <span>{e.tipo}</span>
                  {e.tema && <span>Tema: {e.tema}</span>}
                  {e.etapaFunil && <span>Etapa: {e.etapaFunil}</span>}
                  <span>Estado: {e.status}</span>
                </div>
              </li>
            ))}
            {(dados.data?.editorial ?? []).length === 0 && (
              <li className="text-xs text-muted-foreground">Nenhuma pauta registrada.</li>
            )}
          </ul>
        </section>
      </div>
    </SaasShell>
  );
}
