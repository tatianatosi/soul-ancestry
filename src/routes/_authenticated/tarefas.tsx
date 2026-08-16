import { createFileRoute } from "@tanstack/react-router";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { ESTADOS, PRIORIDADES, rotuloEstado } from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Clube Ancestral" },
      { name: "description", content: "Tarefas operacionais da pesquisa genealógica e da jornada de cidadania." },
      { property: "og:title", content: "Tarefas — Clube Ancestral" },
      { property: "og:description", content: "Tarefas operacionais no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  const { podeEscrever } = useSaas();
  return (
    <SaasShell titulo="Tarefas" descricao="Pendências e próximos passos da equipe.">
      <EntidadeCrud
        entidade="tarefas"
        titulo="Tarefas"
        podeEscrever={podeEscrever}
        dominio="tarefa"
        colunas={[
          { chave: "titulo", rotulo: "Título" },
          { chave: "prioridade", rotulo: "Prioridade" },
          { chave: "status", rotulo: "Status", render: (l) => rotuloEstado("tarefa", l["status"]) },
          {
            chave: "motivo_bloqueio",
            rotulo: "Bloqueio",
            render: (l) => (l["bloqueio"] ? String(l["motivo_bloqueio"] ?? "bloqueada") : "—"),
          },
          { chave: "prazo", rotulo: "Prazo" },
        ]}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          { chave: "descricao", rotulo: "Descrição", tipo: "area" },
          {
            chave: "caso_id",
            rotulo: "Caso vinculado",
            tipo: "select",
            origem: { entidade: "crm_casos", rotuloChave: "titulo" },
          },
          { chave: "prioridade", rotulo: "Prioridade", tipo: "select", opcoes: PRIORIDADES },
          {
            chave: "status",
            rotulo: "Status",
            tipo: "select",
            estado: true,
            opcoes: ESTADOS.tarefa,
          },
          { chave: "motivo_bloqueio", rotulo: "Motivo do bloqueio", tipo: "area" },
          { chave: "prazo", rotulo: "Prazo", tipo: "data" },
        ]}
      />

    </SaasShell>
  );
}
