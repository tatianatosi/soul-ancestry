import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import { lerSaneamentoCatalogo } from "@/lib/catalogo-canonico.functions";
import { confirmarHomologacaoLote } from "@/lib/homologacao-revisao.functions";
import {
  MOTIVO_MINIMO_HOMOLOGACAO,
  ROTULO_DECISAO,
  TEXTO_CONFIRMACAO_HOMOLOGACAO,
  itensRevisao,
  resumoRevisao,
  selecaoHomologavel,
  validarConfirmacaoLote,
  type DecisaoRevisao,
} from "@/lib/homologacao-revisao";

export const Route = createFileRoute("/_authenticated/homologacao-skus")({
  head: () => ({
    meta: [
      { title: "Revisão de SKUs para homologação — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Revisão item a item dos SKUs ativos do catálogo comercial antes da confirmação de homologação em lote, com pendências bloqueantes visíveis por item.",
      },
      { property: "og:title", content: "Revisão de SKUs para homologação — Clube Ancestral Desk" },
      {
        property: "og:description",
        content: "Decisão humana item a item antes de homologar SKUs ativos em lote.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomologacaoSkusPage,
});

const moeda = (v: number | null, m: string) =>
  v === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: m || "BRL" }).format(v);

type Filtro = "todos" | "elegiveis" | "bloqueados" | "nao_revisados";

function HomologacaoSkusPage() {
  const carregar = useServerFn(lerSaneamentoCatalogo);
  const confirmar = useServerFn(confirmarHomologacaoLote);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["catalogo-saneamento", "homologacao"],
    queryFn: () => carregar({ data: { incluirTeste: false } }),
    retry: false,
  });

  const itens = useMemo(() => itensRevisao((q.data?.skus ?? []) as never[]), [q.data]);
  const [decisoes, setDecisoes] = useState<Record<string, DecisaoRevisao>>({});
  const [motivo, setMotivo] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const resumo = resumoRevisao(itens, decisoes);
  const decisaoDe = (id: string) => decisoes[id] ?? "pendente";
  const decidir = (id: string, d: DecisaoRevisao) => setDecisoes((a) => ({ ...a, [id]: d }));

  const visiveis = itens.filter((i) => {
    if (filtro === "elegiveis") return i.elegivel;
    if (filtro === "bloqueados") return !i.elegivel && !i.ja_homologado;
    if (filtro === "nao_revisados") return decisaoDe(i.id) === "pendente";
    return true;
  });

  const m = useMutation({
    mutationFn: async () => {
      const entrada = { itens, decisoes, motivo, confirmado };
      const problemas = validarConfirmacaoLote(entrada);
      if (problemas.length) {
        setErros(problemas);
        return null;
      }
      setErros([]);
      return confirmar({ data: { ids: selecaoHomologavel(entrada), motivo: motivo.trim() } });
    },
    onSuccess: (r) => {
      if (!r) return;
      setConfirmado(false);
      setMotivo("");
      void qc.invalidateQueries({ queryKey: ["catalogo-saneamento"] });
    },
  });

  return (
    <SaasShell
      titulo="Revisão de SKUs para homologação"
      descricao="Leia e decida item a item antes de confirmar a homologação em lote. Nenhum preço é criado ou alterado aqui, e nenhuma cobrança, link ou envio é executado pela confirmação."
    >
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { r: "SKUs ativos em revisão", v: resumo.total },
          { r: "Já revisados", v: `${resumo.revisados}/${resumo.total}` },
          { r: "Marcados para homologar", v: resumo.marcados_homologar },
          { r: "Elegíveis (sem pendência)", v: resumo.elegiveis },
          { r: "Bloqueados por pendência", v: resumo.bloqueados },
        ].map((c) => (
          <div key={c.r} className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">{c.r}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{c.v}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["todos", "Todos"],
            ["elegiveis", "Elegíveis"],
            ["bloqueados", "Com pendência"],
            ["nao_revisados", "Não revisados"],
          ] as [Filtro, string][]
        ).map(([f, rotulo]) => (
          <Button key={f} size="sm" variant={filtro === f ? "default" : "outline"} onClick={() => setFiltro(f)}>
            {rotulo}
          </Button>
        ))}
        <span className="ml-auto text-xs text-navy/55">
          {visiveis.length} de {itens.length} exibidos
        </span>
      </section>

      {q.isLoading ? <p className="mt-6 text-sm text-navy/50">Carregando SKUs ativos…</p> : null}
      {q.isError ? (
        <p className="mt-6 text-sm text-terracotta">
          Não foi possível ler o catálogo. Perfil sem permissão ou leitura indisponível.
        </p>
      ) : null}

      <section className="mt-4 space-y-3">
        {visiveis.map((i) => {
          const d = decisaoDe(i.id);
          return (
            <article
              key={i.id}
              className={`rounded-xl border bg-white p-4 ${
                d === "homologar"
                  ? "border-gold/60"
                  : d === "manter_rascunho"
                    ? "border-navy/20"
                    : "border-navy/10"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[240px]">
                  <p className="text-xs uppercase tracking-wide text-navy/50">{i.sku}</p>
                  <h3 className="font-serif text-lg text-navy">{i.produto}</h3>
                  <p className="text-xs text-navy/60">{i.categoria ?? "Sem categoria na fonte"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {i.ja_homologado ? <Badge variant="secondary">Já homologado</Badge> : null}
                  <Badge variant={i.elegivel ? "default" : "outline"}>
                    {i.elegivel ? "Elegível" : i.ja_homologado ? "Sem ação" : "Com pendência"}
                  </Badge>
                  <Badge variant="outline">{ROTULO_DECISAO[d]}</Badge>
                </div>
              </div>

              <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-navy/50">Preço da fonte</dt>
                  <dd className="text-navy/85">{moeda(i.preco, i.moeda)}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Fonte do preço</dt>
                  <dd className="text-navy/85">{i.preco_fonte ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-navy/50">Versão e início de vigência</dt>
                  <dd className="text-navy/85">
                    {i.versao_catalogo} · {i.vigencia_inicio ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-navy/50">Responsáveis</dt>
                  <dd className="text-navy/85">{i.responsaveis}</dd>
                </div>
              </dl>

              {i.pendencias.length ? (
                <ul className="mt-3 space-y-1 rounded-lg bg-cream/60 p-3 text-xs text-terracotta">
                  {i.pendencias.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-navy/60">Sem pendência bloqueante para homologar.</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={d === "homologar" ? "default" : "outline"}
                  disabled={!i.elegivel}
                  onClick={() => decidir(i.id, "homologar")}
                >
                  Homologar
                </Button>
                <Button
                  size="sm"
                  variant={d === "manter_rascunho" ? "default" : "outline"}
                  onClick={() => decidir(i.id, "manter_rascunho")}
                >
                  Manter fora da homologação
                </Button>
                {d !== "pendente" ? (
                  <Button size="sm" variant="ghost" onClick={() => decidir(i.id, "pendente")}>
                    Limpar decisão
                  </Button>
                ) : null}
              </div>

              <DetalhesTecnicos className="mt-3">
                <p>Identificador de sistema: {i.id}</p>
                <p>Origem da planilha mestre: {i.origem}</p>
                <p>
                  Tipo de cobrança: {i.tipo_cobranca} · Entregáveis declarados: {i.entregaveis}
                </p>
              </DetalhesTecnicos>
            </article>
          );
        })}
        {!visiveis.length && !q.isLoading ? (
          <p className="text-sm text-navy/50">Nenhum SKU neste filtro.</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl border border-navy/15 bg-white p-4">
        <h2 className="font-serif text-xl text-navy">Confirmar homologação em lote</h2>
        <p className="mt-1 text-xs text-navy/60">
          Só entram no lote os SKUs marcados como “Homologar” e sem pendência bloqueante. Todos os itens precisam ter
          decisão registrada.
        </p>

        <Textarea
          className="mt-3"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder={`Motivo da homologação (mínimo ${MOTIVO_MINIMO_HOMOLOGACAO} caracteres)`}
        />

        <label className="mt-3 flex items-start gap-2 text-xs text-navy/75">
          <Checkbox checked={confirmado} onCheckedChange={(v) => setConfirmado(v === true)} />
          <span>{TEXTO_CONFIRMACAO_HOMOLOGACAO}</span>
        </label>

        {erros.length ? (
          <ul className="mt-3 space-y-1 text-xs text-terracotta">
            {erros.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? "Confirmando…" : `Confirmar homologação (${resumo.marcados_homologar})`}
          </Button>
          <span className="text-xs text-navy/55">
            {resumo.nao_revisados} SKU(s) ainda sem decisão registrada.
          </span>
        </div>

        {m.isError ? (
          <p className="mt-3 text-xs text-terracotta">
            Não foi possível concluir a homologação: {(m.error as Error).message}
          </p>
        ) : null}

        {m.data ? (
          <div className="mt-4 rounded-lg border border-navy/10 bg-cream/50 p-3 text-xs">
            <p className="font-medium text-navy/85">
              {m.data.homologados.length} SKU(s) homologados em {new Date(m.data.confirmado_em).toLocaleString("pt-BR")}
            </p>
            {m.data.homologados.length ? <p className="mt-1 text-navy/65">{m.data.homologados.join(", ")}</p> : null}
            {m.data.recusados.length ? (
              <ul className="mt-2 space-y-1 text-terracotta">
                {m.data.recusados.map((r) => (
                  <li key={r.id}>
                    • {r.sku}: {r.motivo}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>
    </SaasShell>
  );
}
