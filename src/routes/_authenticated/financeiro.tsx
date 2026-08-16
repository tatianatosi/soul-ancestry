import { createFileRoute } from "@tanstack/react-router";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Clube Ancestral" },
      { name: "description", content: "Eventos financeiros da organização, visíveis apenas a papéis autorizados." },
      { property: "og:title", content: "Financeiro — Clube Ancestral" },
      { property: "og:description", content: "Eventos financeiros no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const { podeFinanceiro, podeEscrever } = useSaas();

  return (
    <SaasShell titulo="Financeiro" descricao="Cobranças, pagamentos e repasses vinculados aos casos.">
      {!podeFinanceiro ? (
        <EstadoVazio mensagem="Seu papel não inclui acesso financeiro. Solicite a um admin da sua organização." />
      ) : (
        <EntidadeCrud
          entidade="eventos_financeiros"
          titulo="Eventos financeiros"
          podeEscrever={podeEscrever}
          colunas={[
            { chave: "tipo", rotulo: "Tipo" },
            { chave: "descricao", rotulo: "Descrição" },
            {
              chave: "valor",
              rotulo: "Valor",
              render: (l) =>
                l["valor"] == null
                  ? "—"
                  : new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: (l["moeda"] as string) || "BRL",
                    }).format(Number(l["valor"])),
            },
            { chave: "status", rotulo: "Status" },
            { chave: "vencimento", rotulo: "Vencimento" },
          ]}
          campos={[
            {
              chave: "tipo",
              rotulo: "Tipo",
              tipo: "select",
              obrigatorio: true,
              opcoes: [
                { valor: "cobranca", rotulo: "Cobrança" },
                { valor: "pagamento", rotulo: "Pagamento" },
                { valor: "reembolso", rotulo: "Reembolso" },
              ],
            },
            { chave: "descricao", rotulo: "Descrição" },
            { chave: "valor", rotulo: "Valor", tipo: "numero", obrigatorio: true },
            {
              chave: "moeda",
              rotulo: "Moeda",
              tipo: "select",
              opcoes: [
                { valor: "BRL", rotulo: "BRL" },
                { valor: "EUR", rotulo: "EUR" },
                { valor: "USD", rotulo: "USD" },
              ],
            },
            {
              chave: "status",
              rotulo: "Status",
              tipo: "select",
              opcoes: [
                { valor: "previsto", rotulo: "Previsto" },
                { valor: "confirmado", rotulo: "Confirmado" },
                { valor: "atrasado", rotulo: "Atrasado" },
              ],
            },
            { chave: "vencimento", rotulo: "Vencimento", tipo: "data" },
          ]}
        />
      )}
    </SaasShell>
  );
}
