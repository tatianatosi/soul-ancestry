import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { listarEstadoAtivacao } from "@/lib/casos-ativacao.functions";
import { ESTADOS, PRIORIDADES } from "@/lib/estados";
import {
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  HIPOTESE_ELEGIBILIDADE,
  PROXIMAS_ACOES,
  SITUACAO_FINANCEIRA,
  SITUACAO_OPERACIONAL,
  lacunasProximaAcao,
  papelDoRegistro,
  qualificarData,
  rotulo,
} from "@/lib/caso-ficha";
import { ehFixture, ROTULO_FIXTURE } from "@/lib/identificadores-norma";
import { PainelFormalizacao } from "@/components/painel/painel-formalizacao";

export const Route = createFileRoute("/_authenticated/casos/")({
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

function Badge({ texto, tom = "neutro" }: { texto: string; tom?: "neutro" | "gold" | "alerta" | "ok" }) {
  const classes =
    tom === "alerta"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : tom === "ok"
        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
        : tom === "gold"
          ? "border-gold/50 bg-gold/10 text-navy"
          : "border-navy/15 bg-navy/5 text-navy/75";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] leading-tight ${classes}`}>{texto}</span>
  );
}

function CasosPage() {
  const { podeEscrever } = useSaas();
  const carregarAtivacao = useServerFn(listarEstadoAtivacao);
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const qAtivacao = useQuery({
    queryKey: ["casos", "estado-ativacao"],
    queryFn: () => carregarAtivacao({}),
  });
  const estados = new Map((qAtivacao.data ?? []).map((e) => [e.caseId, e]));

  return (
    <SaasShell
      titulo="Casos"
      descricao="Comercial, formalização, financeiro e operação são eixos independentes. Hipótese de elegibilidade é sempre provisória e ativação depende de gates validados no servidor."
    >
      <EntidadeCrud
        entidade="crm_casos"
        titulo="Casos"
        podeEscrever={podeEscrever}
        dominio="caso"
        filtrarLinhas={(l) => mostrarDemo || papelDoRegistro(l).valor !== "demo"}
        classeLinha={(l) => (papelDoRegistro(l).valor === "demo" ? "bg-terracotta/5" : undefined)}
        topo={
          <label className="flex items-center gap-2 text-sm text-navy/70">
            <input type="checkbox" checked={mostrarDemo} onChange={(e) => setMostrarDemo(e.target.checked)} />
            Mostrar casos demonstrativos (fora de relatórios e métricas reais)
          </label>
        }
        colunas={[
          {
            chave: "codigo",
            rotulo: "Código canônico",
            render: (l) => (
              <span className="flex flex-wrap items-center gap-1">
                <span>{(l["codigo"] as string) || "—"}</span>
                {ehFixture(l["codigo"] as string | null) ? <Badge texto={ROTULO_FIXTURE} tom="alerta" /> : null}
              </span>
            ),
          },
          { chave: "titulo", rotulo: "Título" },
          {
            chave: "papel_registro",
            rotulo: "Papel do registro",
            render: (l) => {
              const p = papelDoRegistro(l);
              return <Badge texto={p.rotulo} tom={p.valor === "demo" ? "alerta" : p.valor === "referencia" ? "gold" : "neutro"} />;
            },
          },
          { chave: "tipo_servico", rotulo: "Tipo de serviço" },
          {
            chave: "eixo_comercial",
            rotulo: "Fase comercial",
            render: (l) => <Badge texto={rotulo(EIXO_COMERCIAL, l["eixo_comercial"])} />,
          },
          {
            chave: "eixo_formalizacao",
            rotulo: "Fase de formalização",
            render: (l) => (
              <span className="space-y-1">
                <Badge texto={rotulo(EIXO_FORMALIZACAO, l["eixo_formalizacao"])} />
                {(() => {
                  const d = qualificarData(l["data_prevista_contrato"]);
                  return d.condicional ? (
                    <span className="block text-[11px] text-navy/55">Contrato {d.texto} · previsão condicional</span>
                  ) : null;
                })()}
              </span>
            ),
          },
          {
            chave: "situacao_financeira",
            rotulo: "Situação financeira",
            render: (l) => (
              <span className="space-y-1">
                <Badge texto={rotulo(SITUACAO_FINANCEIRA, l["situacao_financeira"])} />
                {(() => {
                  const d = qualificarData(l["data_prevista_pagamento"]);
                  return d.condicional ? (
                    <span className="block text-[11px] text-navy/55">Pagamento {d.texto} · previsão condicional</span>
                  ) : null;
                })()}
              </span>
            ),
          },
          {
            chave: "situacao_operacional",
            rotulo: "Situação operacional",
            render: (l) => (
              <span className="space-y-1">
                <Badge texto={rotulo(SITUACAO_OPERACIONAL, l["situacao_operacional"])} />
                {(() => {
                  const d = qualificarData(l["data_prevista_onboarding"]);
                  return d.condicional ? (
                    <span className="block text-[11px] text-navy/55">Onboarding {d.texto} · previsão condicional</span>
                  ) : null;
                })()}
              </span>
            ),
          },
          {
            chave: "prioridade",
            rotulo: "Prioridade",
            render: (l) => <Badge texto={rotulo(PRIORIDADES, l["prioridade"])} />,
          },
          {
            chave: "hipotese_elegibilidade",
            rotulo: "Hipótese de elegibilidade",
            render: (l) => (
              <span className="block space-y-1">
                <Badge texto={rotulo(HIPOTESE_ELEGIBILIDADE, l["hipotese_elegibilidade"] || "nao_avaliada")} tom="gold" />
                <span className="block text-[11px] text-navy/55">Hipótese — não é elegibilidade definitiva</span>
              </span>
            ),
          },
          {
            chave: "proxima_acao",
            rotulo: "Próxima ação",
            render: (l) => {
              const falta = lacunasProximaAcao(l);
              const prazo = qualificarData(l["prazo_proxima_acao"]);
              return (
                <span className="block space-y-1 text-xs text-navy/75">
                  <span className="block text-sm text-navy">{rotulo(PROXIMAS_ACOES, l["proxima_acao"])}</span>
                  <span className="block">Responsável: {(l["proxima_acao_responsavel"] as string) || "—"}</span>
                  <span className="block">
                    Prazo: {prazo.texto}
                    {prazo.condicional ? " · previsão condicional" : ""}
                  </span>
                  <span className="block">Depende de: {(l["proxima_acao_dependencia"] as string) || "—"}</span>
                  <span className="block">
                    Conclui quando: {(l["proxima_acao_criterio_conclusao"] as string) || "—"}
                  </span>
                  {falta.length ? <Badge texto={`Incompleta: falta ${falta.join(", ")}`} tom="alerta" /> : null}
                </span>
              );
            },
          },
          {
            chave: "ativo",
            rotulo: "Estado de ativação",
            render: (l) => {
              const e = estados.get(String(l["id"]));
              if (l["ativo"]) return <Badge texto="Caso ativo" tom="ok" />;
              if (!e) return <Badge texto="Verificando requisitos…" />;
              if (e.pendentes > 0) {
                return (
                  <span className="block space-y-1">
                    <Badge texto="Não elegível — ativação bloqueada" tom="alerta" />
                    <span className="block text-[11px] text-navy/55">
                      {e.validados}/{e.total} requisitos validados no banco
                    </span>
                    <ul className="ml-3 list-disc space-y-0.5 text-[11px] text-navy/70">
                      {e.motivos.slice(0, 3).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                      {e.motivos.length > 3 ? <li>+{e.motivos.length - 3} outros requisitos pendentes</li> : null}
                    </ul>
                  </span>
                );
              }
              return <Badge texto="Requisitos completos — ativação disponível no painel" tom="gold" />;
            },
          },

        ]}
        campos={[
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
          { chave: "eixo_comercial", rotulo: "Fase comercial", tipo: "select", opcoes: EIXO_COMERCIAL },
          { chave: "eixo_formalizacao", rotulo: "Fase de formalização", tipo: "select", opcoes: EIXO_FORMALIZACAO },
          { chave: "situacao_financeira", rotulo: "Situação financeira", tipo: "select", opcoes: SITUACAO_FINANCEIRA },
          {
            chave: "situacao_operacional",
            rotulo: "Situação operacional",
            tipo: "select",
            opcoes: SITUACAO_OPERACIONAL,
          },
          { chave: "responsavel_principal", rotulo: "Responsável interno" },
          { chave: "prioridade", rotulo: "Prioridade", tipo: "select", opcoes: PRIORIDADES },
          { chave: "data_entrada", rotulo: "Data de entrada", tipo: "data" },
          { chave: "data_prevista_contrato", rotulo: "Contrato — previsão condicional", tipo: "data" },
          { chave: "data_prevista_pagamento", rotulo: "Pagamento — previsão condicional", tipo: "data" },
          { chave: "data_prevista_onboarding", rotulo: "Onboarding — previsão condicional", tipo: "data" },
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
            rotulo: "Hipótese de elegibilidade (provisória)",
            tipo: "select",
            opcoes: HIPOTESE_ELEGIBILIDADE,
          },
          { chave: "resumo", rotulo: "Resumo interno", tipo: "area" },
          { chave: "risco", rotulo: "Risco identificado", tipo: "area" },
          { chave: "proxima_acao", rotulo: "Próxima ação — título", tipo: "select", opcoes: PROXIMAS_ACOES },
          { chave: "proxima_acao_responsavel", rotulo: "Próxima ação — responsável" },
          { chave: "prazo_proxima_acao", rotulo: "Próxima ação — prazo", tipo: "data" },
          { chave: "proxima_acao_dependencia", rotulo: "Próxima ação — dependência", tipo: "area" },
          { chave: "proxima_acao_criterio_conclusao", rotulo: "Próxima ação — critério de conclusão", tipo: "area" },
        ]}
        extra={(linha) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              to="/casos/$caseId"
              params={{ caseId: String(linha["id"]) }}
              className="rounded-md bg-navy px-2 py-1 text-xs text-cream hover:bg-navy/90"
            >
              Abrir ficha operacional
            </Link>
            <Link
              to="/onboarding/$id"
              params={{ id: String(linha["id"]) }}
              className="rounded-md border border-gold/50 px-2 py-1 text-xs text-navy hover:bg-gold/10"
            >
              Ver requisitos de ativação
            </Link>
            <Link
              to="/nucleos"
              className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
            >
              Núcleos familiares
            </Link>
          </div>
        )}
      />
      <PainelFormalizacao />
    </SaasShell>
  );
}
