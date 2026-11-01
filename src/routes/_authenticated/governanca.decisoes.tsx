import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import {
  AGENTE_PESQUISA,
  CADEIA_OPERACIONAL,
  ESTADO_CASO_ANA,
  FONTES_DE_VERDADE,
  PERFIL_INSTITUCIONAL,
  CASO_CANONICO,
  CONFERENCIA,
  DECISOES,
  ESTADOS_PROPOSTA,
  ESTRUTURA_FAMILIAR,
  HANDOFF_CA04,
  MATRIZ_SLA_KPI,
  REGRAS_VERSIONAMENTO_PREVIA,
  SUPERFICIES_CANONICAS,
  type SituacaoCriterio,
} from "@/lib/decisoes-operacionais";
import { DECISOES_PILOTO_5A1 } from "@/lib/piloto-5a1-decisoes-pendentes";
import { BLOQUEIOS_ABERTOS_DA_PROPRIETARIA, DECISOES_DA_PROPRIETARIA } from "@/lib/decisoes-da-proprietaria";

export const Route = createFileRoute("/_authenticated/governanca/decisoes")({
  head: () => ({
    meta: [
      { title: "Decisões operacionais aprovadas — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro somente leitura das decisões CA-DEC-2026-08-17-01, 03 e 04: estrutura familiar, motor contratual e superfícies canônicas.",
      },
      { property: "og:title", content: "Decisões operacionais aprovadas — Clube Ancestral" },
      {
        property: "og:description",
        content: "Decisões, limites e critérios de aceite que governam o caso canônico e o motor contratual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DecisoesPage,
});

const CORES_SITUACAO: Record<SituacaoCriterio, string> = {
  atendido: "bg-emerald-100 text-emerald-900",
  parcial: "bg-amber-100 text-amber-900",
  pendente: "bg-orange-100 text-orange-900",
};

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    // V4-05: bloco local vira o CaCard canônico (mesmo conteúdo, só leitura).
    <CaCard titulo={titulo}>{children}</CaCard>
  );
}

function Tabela({ cabecalho, linhas }: { cabecalho: string[]; linhas: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-navy/50">
            {cabecalho.map((c) => (
              <th key={c} className="border-b border-navy/10 py-1 pr-3 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-navy/80">
          {linhas.map((linha, i) => (
            <tr key={i} className="align-top">
              {linha.map((celula, j) => (
                <td key={j} className="border-b border-navy/5 py-1.5 pr-3">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DecisoesPage() {
  return (
    <SaasShell titulo="Decisões operacionais" descricao="Registro somente leitura das decisões CA-DEC-2026-08-17-01, 03, 04 e CA-DEC-2026-08-19-01.">
      <div className="space-y-4">
        <header className="rounded-xl border border-gold/40 bg-gold/5 p-4">
          <h1 className="text-lg font-semibold text-navy">Decisões operacionais aprovadas</h1>
          <p className="mt-1 text-sm text-navy/70">
            Registro somente leitura. Caso de referência: <strong>{CASO_CANONICO}</strong>. Nada nesta página cria, funde, migra ou
            apaga módulo, tabela ou tela; nenhuma cobrança, assinatura, portal ou pesquisa externa é disparada aqui.
          </p>
        </header>

        {/*
          Corte DECISÕES (02/10/2026): a Proprietária reclamou duas vezes que
          não tinha acesso à lista do que dependia dela — vivia só em arquivo
          de plano ou em markdown fora do app. Esta seção lê as decisões do
          Piloto 5A.1, as D-02..D-12 do Adendo, e o que ainda está aberto —
          tudo em código, somente leitura. Nenhum botão grava decisão aqui;
          só a Proprietária decide, registrada por ela (ver decididoPor).
        */}
        <Bloco titulo="Piloto 5A.1 — decisões D-01, D-04, D-05, D-06">
          <Tabela
            cabecalho={["Código", "Título", "Status", "Decidido por", "Em", "Valor decidido"]}
            linhas={DECISOES_PILOTO_5A1.map((d) => [
              d.codigo,
              d.titulo,
              <span
                key={d.codigo}
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  d.status === "decidida" ? "bg-emerald-100 text-emerald-900" : "bg-orange-100 text-orange-900"
                }`}
              >
                {d.status === "decidida" ? "Decidida" : "Aguardando decisão humana"}
              </span>,
              d.decididoPor ?? "—",
              d.decididoEm ?? "—",
              (d.valorDecidido as string | null) ?? d.pendencia,
            ])}
          />
        </Bloco>

        <Bloco titulo="Decisões D-02..D-12 (Adendo Bloco 5A)">
          <Tabela
            cabecalho={["Código", "Título", "Área", "Status", "Decidido por", "Em", "Valor decidido"]}
            linhas={DECISOES_DA_PROPRIETARIA.map((d) => [
              d.codigo,
              d.titulo,
              d.area,
              <span
                key={d.codigo}
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  d.status === "decidida" ? "bg-emerald-100 text-emerald-900" : "bg-orange-100 text-orange-900"
                }`}
              >
                {d.status === "decidida" ? "Decidida" : "Aguardando decisão humana"}
              </span>,
              d.decididoPor ?? "—",
              d.decididoEm ?? "—",
              d.valorDecidido ?? d.pendencia,
            ])}
          />
        </Bloco>

        <Bloco titulo="O que ainda depende de você">
          <Tabela
            cabecalho={["Tema", "O que trava", "Registrado em"]}
            linhas={BLOQUEIOS_ABERTOS_DA_PROPRIETARIA.map((b) => [b.tema, b.oQueTrava, b.registradoEm])}
          />
          <p className="mt-2 text-xs text-navy/60">
            Nenhum item desta lista foi decidido por inferência de código, teste, migration ou mockup — só por decisão
            explícita e datada sua.
          </p>
        </Bloco>

        {DECISOES.map((d) => (
          <article key={d.codigo} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-base font-semibold text-navy">
                {d.codigo} — {d.titulo}
              </h2>
              <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs text-navy/70">
                v{d.versao} · {d.data} · {d.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-navy/60">Escopo: {d.escopo}</p>
            <p className="mt-2 text-sm text-navy/80">{d.decisao}</p>

            <div className="mt-3">
              <Tabela cabecalho={["Elemento", "Decisão"]} linhas={d.itens.map((i) => [i.rotulo, i.valor])} />
            </div>

            {d.justificativa && <p className="mt-3 text-sm text-navy/70">Justificativa: {d.justificativa}</p>}

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Limites</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-navy/80">
                  {d.limites.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Critérios de aceite</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-navy/80">
                  {d.criteriosAceite.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <Bloco titulo="Cadeia operacional canônica">
          <Tabela cabecalho={["Etapa", "Responsabilidade"]} linhas={CADEIA_OPERACIONAL.map((c) => [c.etapa, c.detalhe])} />
        </Bloco>

        <Bloco titulo="Fontes de verdade">
          <Tabela
            cabecalho={["Tema", "Fonte canônica", "Nunca como fonte final"]}
            linhas={FONTES_DE_VERDADE.map((f) => [f.tema, f.canonica, f.nuncaFinal])}
          />
        </Bloco>

        <Bloco titulo="Perfil institucional do contrato-base">
          <Tabela
            cabecalho={["Elemento", "Valor institucional"]}
            linhas={[
              ["Contrato-base", `${PERFIL_INSTITUCIONAL.contratoBase} — ${PERFIL_INSTITUCIONAL.subtitulo}`],
              ["Razão empresarial", PERFIL_INSTITUCIONAL.razaoEmpresarial],
              ["Nome de operação", PERFIL_INSTITUCIONAL.nomeOperacao],
              ["CNPJ", PERFIL_INSTITUCIONAL.cnpj],
              ["Endereço institucional", PERFIL_INSTITUCIONAL.endereco],
              ["E-mail", PERFIL_INSTITUCIONAL.email],
              ["Site", PERFIL_INSTITUCIONAL.site],
              ["WhatsApp", PERFIL_INSTITUCIONAL.whatsapp],
            ]}
          />
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-navy/80">
            {PERFIL_INSTITUCIONAL.vedacoes.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Registro de decisão do caso piloto (Ana Luiza) — gates, não é leitura ao vivo">
          <Tabela
            cabecalho={["Dimensão", "Estado conhecido", "Ação/gate"]}
            linhas={ESTADO_CASO_ANA.map((e) => [e.dimensao, e.estado, e.gate])}
          />
        </Bloco>

        <Bloco titulo="Estrutura familiar do caso canônico (01)">
          <Tabela
            cabecalho={["Elemento", "Decisão"]}
            linhas={[
              ["Núcleo", ESTRUTURA_FAMILIAR.nucleo],
              ["CRM", ESTRUTURA_FAMILIAR.crm.join(", ")],
              ["Signatários", ESTRUTURA_FAMILIAR.signatarios.join(", ")],
              ...ESTRUTURA_FAMILIAR.dependentes.map((d) => [d.nome, `${d.vinculo}. ${d.regra}`]),
              ["Anexos estruturais", ESTRUTURA_FAMILIAR.anexosEstruturais.join(", ")],
              ["Anexos individuais", ESTRUTURA_FAMILIAR.anexosIndividuais.map((a) => a.instancia).join(" · ")],
              [ESTRUTURA_FAMILIAR.anexoCondicional.codigo, ESTRUTURA_FAMILIAR.anexoCondicional.regra],
            ]}
          />
        </Bloco>

        <Bloco titulo="Versionamento de prévia e estados de proposta (03)">
          <Tabela cabecalho={["Regra", "Decisão"]} linhas={REGRAS_VERSIONAMENTO_PREVIA.map((r) => [r.regra, r.decisao])} />
          <div className="mt-3">
            <Tabela cabecalho={["Estado da proposta", "Efeito"]} linhas={ESTADOS_PROPOSTA.map((e) => [e.estado, e.efeito])} />
          </div>
        </Bloco>

        <Bloco titulo="Superfícies canônicas — uma responsabilidade cada (04)">
          <Tabela
            cabecalho={["Superfície", "Responsabilidade", "Não deve conter"]}
            linhas={SUPERFICIES_CANONICAS.map((s) => [s.superficie, s.responsabilidade, s.naoContem])}
          />
        </Bloco>

        <Bloco titulo="SLA, KPI e checklists (04)">
          <Tabela cabecalho={["Elemento", "Finalidade", "Onde vive"]} linhas={MATRIZ_SLA_KPI.map((m) => [m.elemento, m.finalidade, m.onde])} />
        </Bloco>

        <Bloco titulo="Agente de direcionamento — camada do dossiê (04)">
          <p className="text-sm text-navy/80">{AGENTE_PESQUISA.arquitetura}</p>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {[
              { titulo: "Recebe", itens: AGENTE_PESQUISA.recebe },
              { titulo: "Pode devolver", itens: AGENTE_PESQUISA.pode },
              { titulo: "Não pode", itens: AGENTE_PESQUISA.naoPode },
            ].map((c) => (
              <div key={c.titulo}>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">{c.titulo}</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-navy/80">
                  {c.itens.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Handoff CA-04 — Painel de Calls → Roteiro/Brief">
          <ol className="list-decimal space-y-1 pl-4 text-sm text-navy/80">
            {HANDOFF_CA04.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </Bloco>

        <Bloco titulo="Conferência dos critérios de aceite">
          <Tabela
            cabecalho={["Decisão", "Critério", "Situação", "Evidência"]}
            linhas={CONFERENCIA.map((c) => [
              c.decisao,
              c.criterio,
              <span key={c.criterio} className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CORES_SITUACAO[c.situacao]}`}>
                {c.situacao}
              </span>,
              c.evidencia,
            ])}
          />
          <p className="mt-2 text-xs text-navy/60">
            Situação “parcial” ou “pendente” indica correção controlada ainda não aprovada. Nenhuma fusão, exclusão ou migração foi
            executada para produzir esta conferência.
          </p>
        </Bloco>
      </div>
    </SaasShell>
  );
}
