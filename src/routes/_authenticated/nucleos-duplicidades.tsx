import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { inputCls, Secao, Selecao } from "@/components/caso/campos";
import { SaasShell } from "@/components/saas/shell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONFIRMACAO_UNIFICAR,
  montarPlanoUnificacao,
  type CandidatoDuplicidade,
  type NivelConfianca,
  type NucleoParaComparar,
  type PlanoUnificacao,
} from "@/lib/nucleo-duplicidade";
import {
  executarUnificacaoNucleo,
  listarCandidatosDuplicidadeNucleo,
} from "@/lib/nucleo-duplicidade.functions";

export const Route = createFileRoute("/_authenticated/nucleos-duplicidades")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Possíveis núcleos duplicados — Clube Ancestral" },
      {
        name: "description",
        content:
          "Unificação controlada de núcleos familiares: detecção, plano de reconciliação e confirmação humana UNIFICAR.",
      },
      { property: "og:title", content: "Possíveis núcleos duplicados — Clube Ancestral" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NucleosDuplicidadesPage,
});

const CORES_CONFIANCA: Record<NivelConfianca, string> = {
  alta: "bg-terracotta/15 text-terracotta",
  media: "bg-gold/20 text-navy",
  baixa: "bg-navy/8 text-navy/60",
};

const ROTULOS_CONFIANCA: Record<NivelConfianca, string> = {
  alta: "Confiança alta",
  media: "Confiança média",
  baixa: "Confiança baixa",
};

function membrosVisiveis(n: NucleoParaComparar) {
  return n.membros.filter((m) => !m.archived_at);
}

function CartaoNucleo({
  n,
  papel,
  selecionado,
  onEscolher,
}: {
  n: NucleoParaComparar;
  papel: "canonico" | "origem" | null;
  selecionado: boolean;
  onEscolher: () => void;
}) {
  const requerentes = membrosVisiveis(n);
  return (
    <div
      className={`min-w-0 flex-1 rounded-lg border p-3 ${
        selecionado ? "border-gold bg-gold/5" : "border-navy/10"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-2">
        <input type="radio" className="mt-1" checked={selecionado} onChange={onEscolher} />
        <span className="min-w-0 flex-1">
          <p className="truncate font-serif text-base text-navy">{n.nome}</p>
          <p className="text-[11px] uppercase tracking-wide text-navy/45">
            {papel === "canonico"
              ? "Canônico — permanece"
              : papel === "origem"
                ? "Origem — será arquivado"
                : "Escolher como canônico"}
          </p>
        </span>
      </label>
      <dl className="mt-2 space-y-1 text-xs text-navy/65">
        <div>
          <dt className="inline text-navy/45">Contratante: </dt>
          <dd className="inline">{n.contratante_nome || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Dossiê-mãe: </dt>
          <dd className="inline">{n.dossie_mae || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Situação do dossiê: </dt>
          <dd className="inline">{n.dossie_status || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Caso vinculado: </dt>
          <dd className="inline">
            {n.caso ? (
              <Link to="/casos/$caseId" params={{ caseId: n.caso.id }} className="text-navy underline underline-offset-2">
                {n.caso.codigo ?? n.caso.titulo ?? n.caso.id}
              </Link>
            ) : (
              "sem caso vinculado"
            )}
          </dd>
        </div>
        {n.caso?.pais ? (
          <div>
            <dt className="inline text-navy/45">País: </dt>
            <dd className="inline">{n.caso.pais}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline text-navy/45">Requerentes: </dt>
          <dd className="inline">{requerentes.length ? requerentes.map((m) => m.nome).join(", ") : "nenhum cadastrado"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Leads ativos: </dt>
          <dd className="inline">{n.leadsAtivos ?? 0}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Criado em: </dt>
          <dd className="inline">{new Date(n.created_at).toLocaleDateString("pt-BR")}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Atualizado em: </dt>
          <dd className="inline">{new Date(n.updated_at).toLocaleDateString("pt-BR")}</dd>
        </div>
      </dl>
      <Link
        to="/nucleos"
        className="mt-2 inline-block rounded-md border border-navy/15 px-2 py-1 text-[11px] text-navy hover:border-gold"
      >
        Abrir em Núcleos familiares
      </Link>
    </div>
  );
}

function ResumoPlano({ plano }: { plano: PlanoUnificacao }) {
  if (plano.recusado) {
    return (
      <p className="mt-3 rounded-lg border border-terracotta/30 bg-terracotta/10 p-3 text-xs text-terracotta">
        {plano.motivoRecusa}
      </p>
    );
  }

  const movidos = plano.membros.filter((m) => m.acao === "mover");
  const conflitos = plano.membros.filter((m) => m.acao === "arquivar_por_conflito");
  const rotuloCaso =
    plano.caso.acao === "transferir"
      ? `O caso da origem passa para o canônico (${plano.caso.caseIdFinal}).`
      : plano.caso.acao === "manter"
        ? "O caso do canônico permanece; a origem não leva caso embora."
        : "Nenhum dos dois núcleos tem caso vinculado.";

  return (
    <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs text-navy/75">
      <p className="font-medium text-navy">Plano de reconciliação</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        <li>
          Canônico permanece: {plano.canonicoNome}. Origem «{plano.origemNome}» será arquivado
          (status arquivado, com motivo auditado).
        </li>
        <li>Caso: {rotuloCaso}</li>
        <li>
          Membros a reapontar para o canônico:{" "}
          {movidos.length ? movidos.map((m) => m.nome).join(", ") : "nenhum"}
        </li>
        <li>
          Membros da origem arquivados por nome já existente no canônico:{" "}
          {conflitos.length ? conflitos.map((m) => m.nome).join(", ") : "nenhum"}
        </li>
        <li>Leads a reapontar para o canônico: {plano.leads.quantidade}</li>
      </ul>
    </div>
  );
}

function NucleosDuplicidadesPage() {
  const carregar = useServerFn(listarCandidatosDuplicidadeNucleo);
  const unificar = useServerFn(executarUnificacaoNucleo);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["nucleos-duplicidades"],
    queryFn: () => carregar(),
    retry: false,
  });
  const [filtroConfianca, setFiltroConfianca] = useState("");
  const [escolha, setEscolha] = useState<Record<string, "A" | "B">>({});
  const [dialogo, setDialogo] = useState<{ chave: string; plano: PlanoUnificacao } | null>(null);
  const [confirmacao, setConfirmacao] = useState("");

  const mut = useMutation({
    mutationFn: (p: { canonicoId: string; origemId: string; confirmacao: string }) => unificar({ data: p }),
    onSuccess: () => {
      toast.success("Núcleos unificados. A lista foi recarregada.");
      setDialogo(null);
      setConfirmacao("");
      void qc.invalidateQueries({ queryKey: ["nucleos-duplicidades"] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível unificar os núcleos."),
  });

  const candidatos = useMemo(() => {
    const lista = (q.data ?? []) as CandidatoDuplicidade[];
    if (!filtroConfianca) return lista;
    return lista.filter((c) => c.confianca === filtroConfianca);
  }, [q.data, filtroConfianca]);

  return (
    <SaasShell
      titulo="Possíveis núcleos duplicados"
      descricao="Detecção, plano de reconciliação e unificação controlada — a fusão só acontece se você digitar UNIFICAR."
    >
      <div className="space-y-5">
        <Secao
          titulo="Como usar"
          descricao="Cada par tem um motivo objetivo. Nada é fundido automaticamente: você escolhe o canônico, confere o plano e confirma digitando UNIFICAR."
        >
          <ul className="list-disc space-y-1 pl-5 text-xs text-navy/65">
            <li>A lista é recalculada a cada carregamento — núcleo arquivado some da detecção.</li>
            <li>
              A unificação reaponta membros e leads para o canônico e arquiva a origem com
              archived_at / archive_motivo / status arquivado. Não cria caso nem núcleo novo.
            </li>
            <li>
              Se os dois núcleos apontam para casos diferentes, a unificação é recusada: resolva os
              casos antes. Conflito de nome no canônico arquiva o membro da origem, sem duplicar.
            </li>
          </ul>
        </Secao>

        <Secao titulo="Filtrar" descricao="Filtre os candidatos por nível de confiança do motivo encontrado.">
          <Selecao
            label="Nível de confiança"
            valor={filtroConfianca}
            opcoes={[
              { valor: "alta", rotulo: "Alta" },
              { valor: "media", rotulo: "Média" },
              { valor: "baixa", rotulo: "Baixa" },
            ]}
            onChange={setFiltroConfianca}
          />
        </Secao>

        {q.isLoading ? <p className="text-sm text-navy/60">Comparando núcleos…</p> : null}
        {q.error ? <p className="text-sm text-red-700">{(q.error as Error).message}</p> : null}
        {!q.isLoading && !q.error && candidatos.length === 0 ? (
          <p className="text-sm text-navy/60">Nenhum candidato a duplicidade encontrado com os filtros atuais.</p>
        ) : null}

        <div className="space-y-4">
          {candidatos.map((c) => {
            const lado = escolha[c.chave] ?? "A";
            const canonico = lado === "A" ? c.nucleoA : c.nucleoB;
            const origem = lado === "A" ? c.nucleoB : c.nucleoA;
            const plano = montarPlanoUnificacao(canonico, origem);
            return (
              <article key={c.chave} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${CORES_CONFIANCA[c.confianca]}`}>
                    {ROTULOS_CONFIANCA[c.confianca]}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-navy/45">Status: sugerido</span>
                </div>

                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-navy/70">
                  {c.motivos.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>

                {c.pessoasEmComum.length > 0 ? (
                  <p className="mt-1 text-xs text-navy/55">Pessoas em comum: {c.pessoasEmComum.join(", ")}</p>
                ) : null}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <CartaoNucleo
                    n={c.nucleoA}
                    papel={lado === "A" ? "canonico" : "origem"}
                    selecionado={lado === "A"}
                    onEscolher={() => setEscolha((s) => ({ ...s, [c.chave]: "A" }))}
                  />
                  <CartaoNucleo
                    n={c.nucleoB}
                    papel={lado === "B" ? "canonico" : "origem"}
                    selecionado={lado === "B"}
                    onEscolher={() => setEscolha((s) => ({ ...s, [c.chave]: "B" }))}
                  />
                </div>

                <ResumoPlano plano={plano} />

                <div className="mt-3">
                  <button
                    type="button"
                    disabled={plano.recusado || mut.isPending}
                    onClick={() => {
                      setConfirmacao("");
                      setDialogo({ chave: c.chave, plano });
                    }}
                    className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
                  >
                    Unificar neste canônico
                  </button>
                  {plano.recusado ? (
                    <p className="mt-1 text-xs text-navy/55">Ação indisponível até resolver o conflito acima.</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <Dialog
        open={Boolean(dialogo)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            setDialogo(null);
            setConfirmacao("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar unificação</DialogTitle>
            <DialogDescription>
              Esta ação arquiva o núcleo de origem e reaponta membros e leads para o canônico. Não
              cria caso novo. Digite {CONFIRMACAO_UNIFICAR} para confirmar.
            </DialogDescription>
          </DialogHeader>
          {dialogo ? (
            <div className="space-y-2 text-sm text-navy/80">
              <p>
                Canônico: <strong>{dialogo.plano.canonicoNome}</strong>
              </p>
              <p>
                Origem a arquivar: <strong>{dialogo.plano.origemNome}</strong>
              </p>
              <label className="block text-xs uppercase tracking-wide text-navy/50">
                Digite {CONFIRMACAO_UNIFICAR}
                <input
                  className={`${inputCls} mt-1`}
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
            </div>
          ) : null}
          <DialogFooter>
            <button
              type="button"
              className="rounded-lg border border-navy/15 px-4 py-2 text-sm text-navy"
              onClick={() => {
                setDialogo(null);
                setConfirmacao("");
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!dialogo || confirmacao !== CONFIRMACAO_UNIFICAR || mut.isPending}
              onClick={() => {
                if (!dialogo) return;
                mut.mutate({
                  canonicoId: dialogo.plano.canonicoId,
                  origemId: dialogo.plano.origemId,
                  confirmacao,
                });
              }}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
            >
              {mut.isPending ? "Unificando…" : "Confirmar unificação"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SaasShell>
  );
}
