import { createFileRoute } from "@tanstack/react-router";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";

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
        colunas={[
          { chave: "titulo", rotulo: "Título" },
          { chave: "prioridade", rotulo: "Prioridade" },
          { chave: "status", rotulo: "Status" },
          { chave: "prazo", rotulo: "Prazo" },
        ]}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          { chave: "descricao", rotulo: "Descrição", tipo: "area" },
          {
            chave: "prioridade",
            rotulo: "Prioridade",
            tipo: "select",
            opcoes: [
              { valor: "alta", rotulo: "Alta" },
              { valor: "media", rotulo: "Média" },
              { valor: "baixa", rotulo: "Baixa" },
            ],
          },
          {
            chave: "status",
            rotulo: "Status",
            tipo: "select",
            opcoes: [
              { valor: "aberta", rotulo: "Aberta" },
              { valor: "em_andamento", rotulo: "Em andamento" },
              { valor: "concluida", rotulo: "Concluída" },
            ],
          },
          { chave: "prazo", rotulo: "Prazo", tipo: "data" },
        ]}
      />
    </SaasShell>
  );
}
