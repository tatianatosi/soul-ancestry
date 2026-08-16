import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { listarAuditoria } from "@/lib/saas.functions";

export const Route = createFileRoute("/_authenticated/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria — Clube Ancestral" },
      { name: "description", content: "Trilha de auditoria das alterações realizadas dentro da organização." },
      { property: "og:title", content: "Auditoria — Clube Ancestral" },
      { property: "og:description", content: "Trilha de auditoria no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { ehAdmin } = useSaas();
  const listar = useServerFn(listarAuditoria);
  const q = useQuery({
    queryKey: ["saas", "auditoria"],
    queryFn: () => listar(),
    enabled: ehAdmin,
  });

  const linhas = (q.data ?? []) as Record<string, unknown>[];

  return (
    <SaasShell titulo="Auditoria" descricao="Últimos 200 eventos registrados na sua organização.">
      {!ehAdmin ? (
        <EstadoVazio mensagem="Acesso restrito a administradores da organização." />
      ) : q.isLoading ? (
        <EstadoVazio mensagem="Carregando eventos…" />
      ) : linhas.length === 0 ? (
        <EstadoVazio mensagem="Nenhum evento de auditoria registrado ainda." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Ação</th>
                <th className="px-4 py-3 font-medium">Entidade</th>
                <th className="px-4 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={String(l["id"])} className="border-t border-navy/5">
                  <td className="px-4 py-3">{new Date(String(l["created_at"])).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3">{String(l["acao"])}</td>
                  <td className="px-4 py-3">{String(l["entidade"])}</td>
                  <td className="px-4 py-3 text-xs text-navy/50">{String(l["entidade_id"] ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SaasShell>
  );
}
