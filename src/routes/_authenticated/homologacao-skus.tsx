import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import { lerSaneamentoCatalogo } from "@/lib/catalogo-canonico.functions";
import { confirmarHomologacaoLote } from "@/lib/homologacao-revisao.functions";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "homologar_sku" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(lerSaneamentoCatalogo);
  const confirmar = useServerFn(confirmarHomologacaoLote);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["catalogo-saneamento", "homologacao"],
    queryFn: () => carregar({ data: { incluirTeste: false } }),
    retry: false,
  });

  // `undefined` aqui significa leitura falha; a lista vazia legítima vem como [].
  const skus = q.data?.skus as never[] | undefined;
  const itens = useMemo(() => itensRevisao((skus ?? []) as never[]), [skus]);
  const [decisoes, setDecisoes] = useState<Record<string, DecisaoRevisao>>({});
  const [motivo, setMotivo] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(decisoes).length > 0 || motivo.trim() !== "");
  const [erros, setErros] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const resumo = resumoRevisao(itens, decisoes);
  // V4-05: sem leitura concluída o KPI mostra traço — zero só quando a lista real é vazia.
  const kpi = (v: string | number) => (q.isLoading ? "…" : q.error || !skus ? "—" : String(v));
  const decisaoDe = (id: string) => decisoes[id] ?? "pendente";
  const decidir = (id: string, d: DecisaoRevisao) => setDecisoes((a) => ({ ...a, [id]: d }));

  const visiveis = itens.filter((i) => {
    if (filtro === "elegiveis") return i.elegivel;
    if (filtro === "bloqueados") return !i.elegivel && !i.ja_homologado;
    if (filtro === "nao_revisados") return decisaoDe(i.id) === "pendente";
    return true;
  });

  const entradaAtual = { itens, decisoes, motivo, confirmado };
  // As pendências continuam visíveis, mas não desabilitam mais o controle:
  // viram gate de confirmação auditada. A elegíbilidade por SKU segue no servidor,
  // que devolve os recusados item a item.
  const pendenciasLote = validarConfirmacaoLote(entradaAtual);

  const m = useMutation({
    mutationFn: async (motivoConfirmacao: string) => {
      const entrada = { itens, decisoes, motivo, confirmado };
      setErros(validarConfirmacaoLote(entrada));
      const ids = selecaoHomologavel(entrada);
      if (!ids.length) {
        // 26/10/2026: antes devolvia null e o diálogo fechava sem dizer nada.
        throw new Error("Nenhum SKU marcado para homologar. Marque ao menos um item antes de confirmar.");
      }
      return confirmar({
        data: { ids, motivo: motivo.trim() || motivoConfirmacao.trim() },
      });
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
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-homologacao-kpis-v4>
        <Indicador
          rotulo="Já revisados"
          valor={kpi(`${resumo.revisados}/${resumo.total}`)}
          apoio="de SKUs ativos em revisão"
        />
        <Indicador rotulo="Marcados para homologar" valor={kpi(resumo.marcados_homologar)} />
        <Indicador rotulo="Elegíveis (sem pendência)" valor={kpi(resumo.elegiveis)} />
        <Indicador rotulo="Bloqueados por pendência" valor={kpi(resumo.bloqueados)} />
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

      <section className="mt-4 space-y-3">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={skus}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os SKUs ativos do catálogo"
          vazio="Nenhum SKU ativo aguardando revisão."
        >
          {() => (
            <div className="space-y-3">
        {visiveis.map((i) => {
          const d = decisaoDe(i.id);
          return (
            <article
              key={i.id}
              className={`rounded-xl border bg-cream/40 p-4 ${
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
              {!i.elegivel ? (
                <p className="mt-2 text-xs text-terracotta">
                  Pendência aberta: marcar para homologar exige justificativa da proprietária no momento da
                  confirmação.
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={d === "homologar" ? "default" : "outline"}
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

              <div className="mt-3"><DetalhesTecnicos>
                <p>Identificador de sistema: {i.id}</p>
                <p>Origem da planilha mestre: {i.origem}</p>
                <p>
                  Tipo de cobrança: {i.tipo_cobranca} · Entregáveis declarados: {i.entregaveis}
                </p>
              </DetalhesTecnicos></div>
            </article>
          );
        })}
        {!visiveis.length ? (
          <p className="text-sm text-navy/50">Nenhum SKU neste filtro.</p>
        ) : null}
            </div>
          )}
        </EstadoDados>
      </section>

      <CaCard className="mt-6" titulo="Confirmar homologação em lote">
        <p className="text-xs text-navy/60">
          Só entram no lote os SKUs marcados como “Homologar” e sem pendência bloqueante. Todos os itens precisam ter
          decisão registrada.
        </p>

        <Textarea
          className="mt-3"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo da homologação (opcional)"
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

        <div className="mt-4 flex flex-wrap items-start gap-3">
          <AcaoOperacional
            rotulo={`Confirmar homologação (${resumo.marcados_homologar})`}
            capacidade="homologar_sku"
            pendenciaGate={pendenciasLote.length ? pendenciasLote.join(" · ") : null}
            efeito="Homologa os SKUs marcados e elegíveis. Nenhum preço é alterado, nenhuma cobrança ou link é criado."
            onConfirmar={async (motivoConfirmacao) => {
              await m.mutateAsync(motivoConfirmacao);
            }}
          />
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
      </CaCard>
    </SaasShell>
  );
}
