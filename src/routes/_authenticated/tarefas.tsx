import { createFileRoute } from "@tanstack/react-router";
import { useAutoridade } from "@/components/saas/autoridade";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { KanbanTarefas } from "@/components/desk/kanban-tarefas";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { ESTADOS, PRIORIDADES, rotuloEstado } from "@/lib/estados";
import { Link } from "@tanstack/react-router";
import { BadgeDesk } from "@/components/desk/ui-desk";
import { Button } from "@/components/ui/button";
import "@/components/desk/mockup4-superficies.css";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Checklist — Clube Ancestral" },
      { name: "description", content: "Tarefas operacionais da pesquisa genealógica e da jornada de cidadania." },
      { property: "og:title", content: "Checklist — Clube Ancestral" },
      { property: "og:description", content: "Tarefas operacionais no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TarefasPage,
});

function TarefasPage() {
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura não trava mais o CRUD.
  // Só falta de papel ou de organização bloqueia; o servidor revalida.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_fila_responsavel_prazo" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua.";
  return (
    <SaasShell titulo="Checklist" descricao="Tarefas: pendências e próximos passos da equipe.">
      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      {/*
        19/10/2026 — Prancha V4: contexto como alimento visível (a faixa
        declara fonte e consumidor) e as tarefas também em colunas por
        status, acima da tabela que continua sendo onde se edita.
      */}
      <FonteAlimento
        fonte="Checklist operacional da equipe"
        consumidor="Painel Hoje, Caso 360 e a próxima ação de cada caso"
        detalheTecnico="tarefas · listarRegistros"
      />
      <KanbanTarefas />
      <div data-desk-mockup4="checklist">
      <EntidadeCrud
        entidade="tarefas"
        titulo="Checklist"
        podeEscrever={podeEscrever}
        dominio="tarefa"
        colunas={[
          { chave: "titulo", rotulo: "Título" },
          { chave: "prioridade", rotulo: "Prioridade", render: (l) => <BadgeDesk texto={String(l["prioridade"] ?? "Não registrada")} tom={l["prioridade"] === "alta" ? "critico" : "neutro"} /> },
          { chave: "status", rotulo: "Status", render: (l) => rotuloEstado("tarefa", l["status"]) },
          {
            chave: "motivo_bloqueio",
            rotulo: "Bloqueio",
            render: (l) => (l["bloqueio"] ? String(l["motivo_bloqueio"] ?? "bloqueada") : "—"),
          },
          { chave: "prazo", rotulo: "Prazo" },
        ]}
        extra={(linha) => linha["caso_id"] ? <Button asChild variant="outline" size="sm"><Link to="/casos/$caseId" params={{ caseId: String(linha["caso_id"]) }}>Abrir caso</Link></Button> : null}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          { chave: "descricao", rotulo: "Descrição", tipo: "area" },
          {
            chave: "caso_id",
            rotulo: "Caso vinculado",
            tipo: "select",
            obrigatorio: true,
            origem: { entidade: "crm_casos", rotuloChave: "titulo" },
          },
          {
            chave: "tipo",
            rotulo: "Tipo",
            tipo: "select",
            opcoes: [
              { valor: "geral", rotulo: "Geral" },
              { valor: "documental", rotulo: "Documental" },
              { valor: "pesquisa", rotulo: "Pesquisa" },
              { valor: "juridico", rotulo: "Jurídico" },
              { valor: "atendimento", rotulo: "Atendimento" },
              { valor: "financeiro", rotulo: "Financeiro" },
            ],
          },
          { chave: "responsavel_id", rotulo: "Responsável (UUID da equipe)" },
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
      </div>

    </SaasShell>
  );
}
