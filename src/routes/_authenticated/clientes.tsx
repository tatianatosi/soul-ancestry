import { createFileRoute } from "@tanstack/react-router";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Clube Ancestral" },
      { name: "description", content: "Cadastro de clientes da organização, com arquivamento e trilha de auditoria." },
      { property: "og:title", content: "Clientes — Clube Ancestral" },
      { property: "og:description", content: "Cadastro de clientes no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  const { podeEscrever } = useSaas();
  return (
    <SaasShell titulo="Clientes" descricao="Dados sensíveis. Visíveis apenas para membros da sua organização.">
      <EntidadeCrud
        entidade="clientes"
        titulo="Clientes"
        podeEscrever={podeEscrever}
        colunas={[
          { chave: "nome", rotulo: "Nome" },
          { chave: "email", rotulo: "E-mail" },
          { chave: "telefone", rotulo: "Telefone" },
          { chave: "pais_interesse", rotulo: "País" },
          { chave: "status", rotulo: "Status" },
        ]}
        campos={[
          { chave: "nome", rotulo: "Nome", obrigatorio: true },
          { chave: "email", rotulo: "E-mail" },
          { chave: "telefone", rotulo: "Telefone" },
          { chave: "documento", rotulo: "Documento" },
          { chave: "pais_interesse", rotulo: "País de interesse" },
          {
            chave: "status",
            rotulo: "Status",
            tipo: "select",
            opcoes: [
              { valor: "prospeccao", rotulo: "Prospecção" },
              { valor: "ativo", rotulo: "Ativo" },
              { valor: "pausado", rotulo: "Pausado" },
            ],
          },
          { chave: "observacoes", rotulo: "Observações", tipo: "area" },
        ]}
      />
    </SaasShell>
  );
}
