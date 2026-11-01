import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { Selo, inputCls, dataBr } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  anotarResolucaoDivergencia,
  listarDivergenciasCatalogo,
} from "@/lib/divergencias-catalogo.functions";

export const Route = createFileRoute("/_authenticated/divergencias-catalogo")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Divergências de catálogo — Clube Ancestral" },
      {
        name: "description",
        content:
          "Divergências registradas na conciliação de catálogo, filtradas por SKU, contrato/OS e status, com observação de resolução.",
      },
      { property: "og:title", content: "Divergências de catálogo — Clube Ancestral" },
      {
        property: "og:description",
        content: "Triagem auditável de divergências de SKU, preço e escopo contra o catálogo homologado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DivergenciasCatalogoPage,
});

type Status = "todos" | "bloqueio" | "atencao" | "resolvidas";

function DivergenciasCatalogoPage() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "resolver_divergencia" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(listarDivergenciasCatalogo);
  const anotar = useServerFn(anotarResolucaoDivergencia);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["divergencias-catalogo"], queryFn: () => carregar({}) });

  const [sku, setSku] = useState("");
  const [vinculo, setVinculo] = useState("");
  const [status, setStatus] = useState<Status>("todos");
  const [edicao, setEdicao] = useState<Record<string, string>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(edicao).length > 0);

  const salvar = useMutation({
    mutationFn: (v: { id: string; observacao: string }) => anotar({ data: v }),
    onSuccess: () => {
      toast.success("Observação de resolução registrada.");
      qc.invalidateQueries({ queryKey: ["divergencias-catalogo"] });
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : "Não foi possível registrar a observação."),
  });

  // Sem default silencioso: `undefined` é falha de carga, não base vazia.
  const todas = q.data?.linhas;
  const skus = useMemo(() => [...new Set((todas ?? []).map((l) => l.sku))].sort(), [todas]);

  const linhas = useMemo(() => {
    const v = vinculo.trim().toLowerCase();
    return (todas ?? []).filter((l) => {
      if (sku && l.sku !== sku) return false;
      if (status === "resolvidas" && !l.resolvido) return false;
      if (status === "bloqueio" && (l.resolvido || l.severidade !== "bloqueio")) return false;
      if (status === "atencao" && (l.resolvido || l.severidade !== "atencao")) return false;
      if (
        v &&
        ![l.contrato_numero, l.os_numero, l.caso_codigo, l.caso_titulo, l.fonte_referencia]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(v)
      )
        return false;
      return true;
    });
  }, [todas, sku, vinculo, status]);

  const resumo = q.data?.resumo;
  const kpi = (n: number | undefined) => (q.isLoading ? "…" : q.error || n === undefined ? "—" : String(n));

  return (
    <SaasShell
      titulo="Divergências de catálogo"
      descricao="Divergências registradas pela conciliação contra o catálogo homologado. Aqui só se registra observação de resolução — nada é aprovado, corrigido no catálogo ou desbloqueado."
    >
      {pendenciaVinculo || !podeEscrever ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada:{" "}
          {pendenciaVinculo ??
            "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
        </p>
      ) : null}
      <div className="space-y-6">
        {/* V4-05: faixa de KPIs com o resumo que o servidor já devolve; sem leitura, traço. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-divergencias-kpis-v4>
          <Indicador rotulo="Registros" valor={kpi(resumo?.total)} />
          <Indicador rotulo="Em bloqueio" valor={kpi(resumo?.bloqueio)} />
          <Indicador rotulo="Em atenção" valor={kpi(resumo?.atencao)} />
          <Indicador rotulo="Resolvidas" valor={kpi(resumo?.resolvidas)} />
        </div>
        <CaCard variante="compacto" titulo="Filtros">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-navy/70">SKU</span>
              <select className={inputCls} value={sku} onChange={(e) => setSku(e.target.value)}>
                <option value="">Todos os SKUs</option>
                {skus.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-navy/70">Contrato / OS / caso</span>
              <input
                className={inputCls}
                value={vinculo}
                placeholder="Nº do contrato, da OS ou código do caso"
                onChange={(e) => setVinculo(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-navy/70">Status</span>
              <select
                className={inputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="todos">Todos</option>
                <option value="bloqueio">Bloqueio</option>
                <option value="atencao">Atenção</option>
                <option value="resolvidas">Resolvidas</option>
              </select>
            </label>
          </div>
          {resumo ? (
            <p className="mt-3 text-xs text-navy/60">
              {resumo.total} registro(s) — {resumo.bloqueio} em bloqueio, {resumo.atencao} em atenção,{" "}
              {resumo.resolvidas} resolvida(s).
            </p>
          ) : null}
        </CaCard>

        <CaCard variante="compacto" titulo={`Divergências (${linhas.length})`}>
          <EstadoDados
            carregando={q.isLoading}
            erro={q.error}
            dados={todas}
            aoTentarNovamente={() => void q.refetch()}
            recurso="as divergências de catálogo"
            vazio="Nenhuma divergência registrada pela conciliação."
          >
            {() =>
              linhas.length === 0 ? (
                <EstadoVazio mensagem="Nenhuma divergência com esses filtros. Ajuste SKU, vínculo ou status para ver outros registros da conciliação." />
              ) : (
            <ul className="space-y-3">
              {linhas.map((l) => (
                <li key={l.id} className="rounded-xl border border-navy/15 bg-cream/40 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-navy">{l.sku}</span>
                    <Selo
                      texto={l.resolvido ? "Resolvida" : l.severidade === "bloqueio" ? "Bloqueio" : "Atenção"}
                      tom={l.resolvido ? "ok" : l.severidade === "bloqueio" ? "erro" : "alerta"}
                    />
                    <span className="text-xs text-navy/50">{l.tipo}</span>
                  </div>
                  <p className="mt-2 text-sm text-navy/80">{l.detalhe}</p>
                  <p className="mt-1 text-xs text-navy/55">
                    Caso: {l.caso_codigo ?? l.caso_titulo ?? "—"} · Contrato: {l.contrato_numero ?? "—"} · OS:{" "}
                    {l.os_numero ?? "—"} · Origem: {l.fonte_referencia} · Registrada em {dataBr(l.created_at)}
                  </p>

                  {l.observacao_resolucao ? (
                    <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-sm text-navy/80">
                      <strong>Observação de resolução:</strong> {l.observacao_resolucao}
                      {l.resolucao_registrada_em ? (
                        <span className="block text-xs text-navy/55">
                          Registrada em {dataBr(l.resolucao_registrada_em)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      className={inputCls}
                      placeholder="Anexar observação de resolução (auditada)"
                      value={edicao[l.id] ?? ""}
                      onChange={(e) => setEdicao((s) => ({ ...s, [l.id]: e.target.value }))}
                    />
                    <AcaoOperacional
                      rotulo="Registrar"
                      capacidade="resolver_divergencia"
                      pendenciaGate={
                        (edicao[l.id] ?? "").trim()
                          ? null
                          : "Escreva a observação de resolução antes de registrar."
                      }
                      efeito="Anexa uma observação de resolução auditada a esta divergência. A divergência continua visível."
                      onConfirmar={async () => {
                        const observacao = (edicao[l.id] ?? "").trim();
                        if (!observacao) return;
                        await salvar.mutateAsync({ id: l.id, observacao });
                        setEdicao((s) => ({ ...s, [l.id]: "" }));
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
              )
            }
          </EstadoDados>
        </CaCard>
      </div>
    </SaasShell>
  );
}
