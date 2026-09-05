import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { SaasShell, EstadoVazio, BotaoTentarNovamente } from "@/components/saas/shell";
import { carregarMapaEtiquetas } from "@/lib/caso-canonico.functions";

export const Route = createFileRoute("/_authenticated/etiquetas")({
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

function Etiquetas() {
  const carregar = useServerFn(carregarMapaEtiquetas);
  const q = useQuery({ queryKey: ["mapa-etiquetas"], queryFn: () => carregar(), retry: false });
  const [busca, setBusca] = useState("");

  const linhas = useMemo(() => {
    const filtro = busca.trim().toLowerCase();
    return (q.data?.taxonomia ?? []).filter((l: Record<string, any>) => // eslint-disable-line @typescript-eslint/no-explicit-any
      !filtro ? true : `${l.name} ${l.code} ${l.category} ${l.meta_agent_equivalent ?? ""}`.toLowerCase().includes(filtro),
    );
  }, [q.data, busca]);

  return (
    <SaasShell
      titulo="Taxonomia canônica de etiquetas"
      descricao="O Desk é a fonte canônica. O agente de WhatsApp apenas espelha esta taxonomia — nada é sincronizado automaticamente."
    >
      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando taxonomia…" />
      ) : q.isError ? (
        <EstadoVazio
          mensagem={q.error instanceof Error ? q.error.message : "Falha ao carregar."}
          acao={<BotaoTentarNovamente aoClicar={() => void q.refetch()} />}
        />
      ) : (
        <>
          <input
            className="mb-5 w-full max-w-sm rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-gold"
            placeholder="Buscar por nome, código ou equivalente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
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
                {linhas.map((l: Record<string, any>) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
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
          <p className="mt-4 text-xs text-navy/55">
            {linhas.length} etiqueta(s) listada(s). Etiquetas fora desta lista não podem ser aplicadas a casos, famílias ou pessoas.
          </p>
        </>
      )}
    </SaasShell>
  );
}
