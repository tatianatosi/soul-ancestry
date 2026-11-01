import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador } from "@/components/prancha-v4/kit";
import { EstadoDados } from "@/components/saas/estado-dados";
import { carregarMapaEtiquetas } from "@/lib/caso-canonico.functions";

export const Route = createFileRoute("/_authenticated/etiquetas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Taxonomia de etiquetas — Clube Ancestral" },
      { name: "description", content: "Taxonomia canônica de etiquetas do Desk Intelligence e equivalência com o agente de WhatsApp." },
      { property: "og:title", content: "Taxonomia de etiquetas — Clube Ancestral" },
      { property: "og:description", content: "Etiquetas canônicas por categoria, escopo e equivalente no agente de mensagens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Etiquetas,
});

const CATEGORIAS: Record<string, string> = {
  origem: "Origem",
  contato: "Contato",
  descoberta: "Descoberta",
  comercial: "Comercial",
  formalizacao: "Formalização",
  onboarding: "Onboarding",
  pesquisa: "Pesquisa",
  trilha: "Trilha técnica",
  risco: "Risco",
  governanca: "Governança",
};

/** Linha da taxonomia como vem do banco. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinhaEtiqueta = Record<string, any>;

function Etiquetas() {
  const carregar = useServerFn(carregarMapaEtiquetas);
  const q = useQuery({ queryKey: ["mapa-etiquetas"], queryFn: () => carregar(), retry: false });
  const [busca, setBusca] = useState("");

  const filtrar = useMemo(() => {
    const filtro = busca.trim().toLowerCase();
    return (itens: LinhaEtiqueta[]) =>
      itens.filter((l) =>
        !filtro ? true : `${l.name} ${l.code} ${l.category} ${l.meta_agent_equivalent ?? ""}`.toLowerCase().includes(filtro),
      );
  }, [busca]);

  // V4-05: contagem real da taxonomia carregada; sem leitura, traço.
  const taxonomiaCarregada = q.data?.taxonomia as LinhaEtiqueta[] | undefined;
  const kpi = (contar: (t: LinhaEtiqueta[]) => number) =>
    q.isLoading ? "…" : q.error || !taxonomiaCarregada ? "—" : String(contar(taxonomiaCarregada));

  return (
    <SaasShell
      titulo="Taxonomia canônica de etiquetas"
      descricao="O Desk é a fonte canônica. O agente de WhatsApp apenas espelha esta taxonomia — nada é sincronizado automaticamente."
    >
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4" data-etiquetas-kpis-v4>
        <Indicador rotulo="Etiquetas" valor={kpi((t) => t.length)} />
        <Indicador rotulo="Categorias" valor={kpi((t) => new Set(t.map((l) => String(l.category))).size)} />
        <Indicador rotulo="Com equivalente no agente" valor={kpi((t) => t.filter((l) => l.meta_agent_equivalent).length)} />
        <Indicador rotulo="Em uso" valor={kpi((t) => t.filter((l) => Number(l.aplicacoes) > 0).length)} />
      </div>
      <EstadoDados<LinhaEtiqueta>
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data?.taxonomia as LinhaEtiqueta[] | undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="a taxonomia de etiquetas"
        vazio="Nenhuma etiqueta cadastrada na taxonomia canônica."
      >
        {(taxonomia) => {
          const linhas = filtrar(taxonomia);
          return (
        <>
          <input
            className="mb-5 w-full max-w-sm rounded-lg border border-navy/15 bg-cream/40 px-3 py-2 text-sm text-navy outline-none focus:border-gold"
            placeholder="Buscar por nome, código ou equivalente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {linhas.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma etiqueta corresponde à busca." />
          ) : (
          <CaCard titulo="Etiquetas canônicas" className="overflow-hidden">
          <div className="-mx-4 overflow-x-auto sm:-mx-5">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                <tr>
                  <th className="px-4 py-3">Etiqueta</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Escopo</th>
                  <th className="px-4 py-3">Equivalente Meta Agent</th>
                  <th className="px-4 py-3">Aplicações</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={String(l.id)} className="border-t border-navy/10">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{l.name}</p>
                      <p className="text-xs text-navy/50">{l.code}</p>
                      {l.description ? <p className="mt-1 text-xs text-navy/55">{l.description}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-navy/70">{CATEGORIAS[String(l.category)] ?? l.category}</td>
                    <td className="px-4 py-3 text-navy/70">{l.scope}</td>
                    <td className="px-4 py-3 text-navy/70">{l.meta_agent_equivalent ?? "—"}</td>
                    <td className="px-4 py-3 text-navy/70">{l.aplicacoes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </CaCard>
          )}
          <p className="mt-4 text-xs text-navy/55">
            {linhas.length} etiqueta(s) listada(s). Etiquetas fora desta lista não podem ser aplicadas a casos, famílias ou pessoas.
          </p>
        </>
          );
        }}
      </EstadoDados>
    </SaasShell>
  );
}
