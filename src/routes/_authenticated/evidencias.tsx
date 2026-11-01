import { createFileRoute } from "@tanstack/react-router";
import { useAutoridade } from "@/components/saas/autoridade";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { toast } from "sonner";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { PageHeader, SectionHeader } from "@/components/desk/ui-desk";
import { listarAcessosEvidencia, registrarAcessoEvidencia } from "@/lib/saas.functions";
import { ESTADOS, rotuloEstado } from "@/lib/estados";
import { CaCard } from "@/components/ui/ca-card";
import { Etiqueta } from "@/components/prancha-v4/kit";
import { mensagemLegadoSemCriacao } from "@/lib/fontes-pesquisa-canonicas";

export const Route = createFileRoute("/_authenticated/evidencias")({
  staticData: { sitemap: false },
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
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura não trava mais o CRUD.
  // Só falta de papel ou de organização bloqueia; o servidor revalida.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua.";
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
      titulo="Documentos e evidências"
      descricao="Documentos, fontes e evidências com estados separados e acesso auditado."
      visualKit="pantone"
    >
      <PageHeader
        titulo="Biblioteca de evidências"
        subtitulo="Caso → hipótese → fonte → evidência → estado de validação. Cada visualização é registrada; documento é evidência, nunca conclusão jurídica."
      />
      <CaCard
        className="mb-4"
        eyebrow="Área de Documentos"
        titulo="Fluxo documental"
        acao={<Etiqueta texto="Acesso auditado" tom="atencao" />}
      >
        <ol className="grid gap-2 text-xs sm:grid-cols-4">
          {["Documento recebido", "Fonte catalogada", "Evidência em revisão", "Publicação autorizada"].map((etapa, indice) => (
            <li key={etapa} className="rounded-md border border-navy/10 bg-cream/40 p-3 text-navy">
              <span className="mb-1 block text-[10px] font-semibold uppercase text-navy/45">Etapa {indice + 1}</span>
              {etapa}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-navy/60">O fluxo indica estados possíveis; os registros abaixo são os dados reais da organização.</p>
      </CaCard>
      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      <EntidadeCrud
        entidade="evidencias"
        titulo="Evidências"
        semCriacao={mensagemLegadoSemCriacao("evidencia")}

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
              try {
                await mRegistrar.mutateAsync(String(linha["id"]));
                setAcessos(await listar({ data: { evidenciaId: String(linha["id"]) } }));
              } catch (e) {
                toast.error((e as Error).message || "Não foi possível abrir os acessos.");
              }
            }}
            className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
          >
            Ver acessos
          </button>
        )}
      />

      {acessos ? (
        <CaCard className="mt-5" eyebrow="Evidências · auditoria" titulo="Acessos desta evidência">
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
          {acessos.length === 0 ? (
            <div className="mt-3">
              <EstadoVazio mensagem="Nenhum acesso registrado ainda." />
            </div>
          ) : (
            <ul className="mt-3">
              {acessos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 border-b border-navy/5 py-1.5 text-xs text-navy/80 last:border-0"
                >
                  <span>{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                  <Etiqueta texto={a.acao} />
                </li>
              ))}
            </ul>
          )}
        </CaCard>
      ) : null}
    </SaasShell>
  );
}
