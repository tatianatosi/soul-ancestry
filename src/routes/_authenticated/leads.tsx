import { createFileRoute } from "@tanstack/react-router";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Clube Ancestral" },
      { name: "description", content: "Gestão de leads da organização, com arquivamento e trilha de auditoria." },
      { property: "og:title", content: "Leads — Clube Ancestral" },
      { property: "og:description", content: "Gestão de leads no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  const { podeEscrever } = useSaas();
  return (
    <SaasShell titulo="Leads" descricao="Interessados em pesquisa genealógica e jornada de cidadania.">
      <EntidadeCrud
        entidade="leads"
        titulo="Leads"
        podeEscrever={podeEscrever}
        colunas={[
          { chave: "nome", rotulo: "Nome" },
          { chave: "email", rotulo: "E-mail" },
          { chave: "telefone", rotulo: "Telefone" },
          { chave: "origem", rotulo: "Origem" },
          { chave: "estagio", rotulo: "Estágio" },
          { chave: "pais_interesse", rotulo: "País" },
        ]}
        campos={[
          { chave: "nome", rotulo: "Nome", obrigatorio: true },
          { chave: "email", rotulo: "E-mail" },
          { chave: "telefone", rotulo: "Telefone" },
          { chave: "origem", rotulo: "Origem" },
          {
            chave: "estagio",
            rotulo: "Estágio",
            tipo: "select",
            opcoes: [
              { valor: "novo", rotulo: "Novo" },
              { valor: "qualificado", rotulo: "Qualificado" },
              { valor: "em_conversa", rotulo: "Em conversa" },
              { valor: "perdido", rotulo: "Perdido" },
            ],
          },
          { chave: "pais_interesse", rotulo: "País de interesse" },
          { chave: "observacoes", rotulo: "Observações", tipo: "area" },
        ]}
      />
    </SaasShell>
  );
}
