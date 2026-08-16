import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { ativarCaso, verificarCondicoesCaso } from "@/lib/saas.functions";
import { ESTADOS, PRIORIDADES, rotuloEstado } from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/casos")({
  head: () => ({
    meta: [
      { title: "Casos — Clube Ancestral" },
      { name: "description", content: "Casos de cidadania com hipótese de elegibilidade e ativação condicionada." },
      { property: "og:title", content: "Casos — Clube Ancestral" },
      { property: "og:description", content: "Gestão de casos de cidadania no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CasosPage,
});

function CasosPage() {
  const { podeEscrever } = useSaas();
  const verificar = useServerFn(verificarCondicoesCaso);
  const ativar = useServerFn(ativarCaso);
  const [aviso, setAviso] = useState<string | null>(null);

  const mVerificar = useMutation({
    mutationFn: (id: string) => verificar({ data: { id } }),
  });
  const mAtivar = useMutation({
    mutationFn: (id: string) => ativar({ data: { id } }),
  });

  return (
    <SaasShell
      titulo="Casos"
      descricao="Hipótese de elegibilidade é sempre provisória: depende de confirmação documental."
    >
      {aviso ? (
        <p className="mb-4 rounded-lg border border-gold/50 bg-gold/10 px-3 py-2 text-sm text-navy">{aviso}</p>
      ) : null}

      <EntidadeCrud
        entidade="crm_casos"
        titulo="Casos"
        podeEscrever={podeEscrever}
        dominio="caso"
        colunas={[
          { chave: "codigo", rotulo: "Código" },
          { chave: "titulo", rotulo: "Título" },
          { chave: "tipo_servico", rotulo: "Tipo de serviço" },
          { chave: "fase", rotulo: "Fase" },
          { chave: "prioridade", rotulo: "Prioridade" },
          { chave: "status", rotulo: "Status", render: (l) => rotuloEstado("caso", l["status"]) },
          {
            chave: "hipotese_elegibilidade",
            rotulo: "Hipótese",
            render: (l) => (
              <span className="text-navy/70">
                {(l["hipotese_elegibilidade"] as string) || "não avaliada"} · hipótese
              </span>
            ),
          },
          { chave: "proxima_acao", rotulo: "Próxima ação" },
          {
            chave: "ativo",
            rotulo: "Ativação",
            render: (l) => (l["ativo"] ? "Ativo" : "Não ativo"),
          },
        ]}
        campos={[
          { chave: "codigo", rotulo: "Código interno" },
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          {
            chave: "cliente_id",
            rotulo: "Cliente vinculado",
            tipo: "select",
            origem: { entidade: "clientes", rotuloChave: "nome" },
          },
          {
            chave: "status",
            rotulo: "Status do caso",
            tipo: "select",
            estado: true,
            opcoes: ESTADOS.caso,
          },
          {
            chave: "tipo_servico",
            rotulo: "Tipo de serviço",
            tipo: "select",
            opcoes: [
              { valor: "pesquisa", rotulo: "Pesquisa genealógica" },
              { valor: "cidadania", rotulo: "Cidadania" },
              { valor: "documentacao", rotulo: "Documentação" },
              { valor: "consultoria", rotulo: "Consultoria" },
            ],
          },
          { chave: "fase", rotulo: "Fase atual" },
          { chave: "responsavel_id", rotulo: "Responsável (identificador interno)" },
          {
            chave: "prioridade",
            rotulo: "Prioridade",
            tipo: "select",
            opcoes: PRIORIDADES,
          },
          { chave: "data_entrada", rotulo: "Data de entrada", tipo: "data" },
          { chave: "pais", rotulo: "País" },
          {
            chave: "via",
            rotulo: "Via",
            tipo: "select",
            opcoes: [
              { valor: "administrativa", rotulo: "Administrativa" },
              { valor: "judicial", rotulo: "Judicial" },
              { valor: "a-definir", rotulo: "A definir" },
            ],
          },
          {
            chave: "hipotese_elegibilidade",
            rotulo: "Hipótese de elegibilidade",
            tipo: "select",
            opcoes: [
              { valor: "possivel", rotulo: "Possível (hipótese)" },
              { valor: "incerta", rotulo: "Incerta (pendências)" },
              { valor: "improvavel", rotulo: "Improvável (hipótese)" },
            ],
          },
          { chave: "resumo", rotulo: "Resumo interno", tipo: "area" },
          { chave: "risco", rotulo: "Risco identificado", tipo: "area" },
          { chave: "proxima_acao", rotulo: "Próxima ação" },
        ]}

        extra={(linha, recarregar) => (
          <div className="flex flex-wrap justify-end gap-2">
            {podeEscrever && !linha["ativo"] ? (
              <>
                <button
                  onClick={async () => {
                    await mVerificar.mutateAsync(String(linha["id"]));
                    setAviso("Condições verificadas e registradas. Agora é possível tentar a ativação.");
                    recarregar();
                  }}
                  className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                >
                  Verificar condições
                </button>
                <button
                  onClick={async () => {
                    const r = await mAtivar.mutateAsync(String(linha["id"]));
                    setAviso(
                      r.ok
                        ? "Caso ativado."
                        : `Ativação bloqueada. Pendências: ${r.pendencias.join(", ")}.`,
                    );
                    recarregar();
                  }}
                  className="rounded-md bg-navy px-2 py-1 text-xs text-cream"
                >
                  Ativar caso
                </button>
              </>
            ) : null}
          </div>
        )}
      />
    </SaasShell>
  );
}
