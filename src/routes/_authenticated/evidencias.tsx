import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { PageHeader, SectionHeader } from "@/components/desk/ui-desk";
import { listarAcessosEvidencia, registrarAcessoEvidencia } from "@/lib/saas.functions";
import { ESTADOS, rotuloEstado } from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/evidencias")({
  head: () => ({
    meta: [
      { title: "Evidências — Clube Ancestral" },
      { name: "description", content: "Documentos e evidências com controle de visibilidade e registro de acesso." },
      { property: "og:title", content: "Evidências — Clube Ancestral" },
      { property: "og:description", content: "Evidências documentais no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EvidenciasPage,
});

function EvidenciasPage() {
  const { podeEscrever } = useSaas();
  const registrar = useServerFn(registrarAcessoEvidencia);
  const listar = useServerFn(listarAcessosEvidencia);
  const [acessos, setAcessos] = useState<
    { id: string; acao: string; user_id: string | null; created_at: string }[] | null
  >(null);

  const mRegistrar = useMutation({
    mutationFn: (id: string) =>
      registrar({ data: { evidenciaId: id, acao: "visualizacao" as const } }),
  });

  return (
    <SaasShell
      titulo="Evidências"
      descricao="Fontes, evidências e próximos passos do caso — uso interno."
    >
      <PageHeader
        titulo="Biblioteca de evidências"
        subtitulo="Caso → hipótese → fonte → evidência → estado de validação. Cada visualização é registrada; documento é evidência, nunca conclusão jurídica."
      />
      <EntidadeCrud
        entidade="evidencias"
        titulo="Evidências"

        podeEscrever={podeEscrever}
        dominio="evidencia"
        colunas={[
          { chave: "titulo", rotulo: "Título" },
          { chave: "tipo", rotulo: "Tipo" },
          { chave: "status", rotulo: "Status", render: (l) => rotuloEstado("evidencia", l["status"]) },
          { chave: "pessoa_relacionada", rotulo: "Pessoa" },
          { chave: "periodo", rotulo: "Período" },
          { chave: "grau_confianca", rotulo: "Confiança" },
          { chave: "visibilidade", rotulo: "Visibilidade" },
        ]}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          {
            chave: "caso_id",
            rotulo: "Caso vinculado",
            tipo: "select",
            origem: { entidade: "crm_casos", rotuloChave: "titulo" },
          },
          {
            chave: "tipo",
            rotulo: "Tipo",
            tipo: "select",
            opcoes: [
              { valor: "certidao", rotulo: "Certidão" },
              { valor: "registro", rotulo: "Registro civil" },
              { valor: "passaporte", rotulo: "Passaporte" },
              { valor: "outro", rotulo: "Outro" },
            ],
          },
          {
            chave: "status",
            rotulo: "Status",
            tipo: "select",
            estado: true,
            opcoes: ESTADOS.evidencia,
          },
          { chave: "pessoa_relacionada", rotulo: "Pessoa relacionada" },
          { chave: "local_relacionado", rotulo: "Local relacionado" },
          { chave: "periodo", rotulo: "Período" },
          { chave: "fonte", rotulo: "Fonte" },
          {
            chave: "grau_confianca",
            rotulo: "Grau de confiança",
            tipo: "select",
            opcoes: [
              { valor: "alta", rotulo: "Alta" },
              { valor: "media", rotulo: "Média" },
              { valor: "baixa", rotulo: "Baixa" },
            ],
          },
          {
            chave: "visibilidade",
            rotulo: "Visibilidade",
            tipo: "select",
            opcoes: [
              { valor: "interna", rotulo: "Interna" },
              { valor: "cliente", rotulo: "Visível ao cliente" },
            ],
          },
          { chave: "descricao", rotulo: "Descrição", tipo: "area" },
          { chave: "observacao", rotulo: "Observação interna", tipo: "area" },
        ]}

        extra={(linha) => (
          <button
            onClick={async () => {
              await mRegistrar.mutateAsync(String(linha["id"]));
              setAcessos(await listar({ data: { evidenciaId: String(linha["id"]) } }));
            }}
            className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
          >
            Ver acessos
          </button>
        )}
      />

      {acessos ? (
        <div className="mt-5 rounded-xl border border-navy/10 bg-white p-4">
          <SectionHeader
            titulo="Registro de acessos"
            descricao="Auditoria de visualização desta evidência."
            acoes={
              <button
                onClick={() => setAcessos(null)}
                className="rounded-md border border-navy/20 px-2 py-1 text-xs text-navy/70 hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Fechar
              </button>
            }
          />
          <ul className="mt-3 space-y-1 text-sm text-navy/70">
            {acessos.length === 0 ? (
              <li>Nenhum acesso registrado ainda.</li>
            ) : (
              acessos.map((a) => (
                <li key={a.id}>
                  {new Date(a.created_at).toLocaleString("pt-BR")} — {a.acao}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </SaasShell>
  );
}
