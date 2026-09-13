import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { SaasShell } from "@/components/saas/shell";
import {
  BarrasCompactas,
  BadgeDesk,
  EstadoFonte,
  FaixaDecisao,
  IndicadorExecutivo,
  SectionHeader,
  type DadoGrafico,
  type TomEstado,
} from "@/components/desk/ui-desk";
import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { alertasOps } from "@/lib/ops.functions";
import { painelPesquisaModulo } from "@/lib/pesquisa-modulo.functions";
import { painelContratual } from "@/lib/contratos.functions";
import { painelFormalizacao } from "@/lib/formalizacao-painel.functions";
import { listarInconsistencias } from "@/lib/qualidade.functions";

export const Route = createFileRoute("/_authenticated/metricas")({
  head: () => ({
    meta: [
      { title: "KPIs do Desk — Clube Ancestral" },
      {
        name: "description",
        content: "Números-chave dos seis grupos do Desk, derivados das fontes operacionais vigentes.",
      },
      { property: "og:title", content: "KPIs do Desk — Clube Ancestral" },
      { property: "og:description", content: "Leitura executiva dos seis grupos do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Metricas,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-critico">Não foi possível carregar os KPIs do Desk: {error.message}</div>
  ),
});

function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

function total(dados: readonly { total: number }[] | undefined): number | null {
  return dados ? dados.reduce((soma, item) => soma + item.total, 0) : null;
}

function PainelGrupo({
  id,
  titulo,
  descricao,
  fonte,
  rota,
  children,
}: {
  id: string;
  titulo: string;
  descricao: string;
  fonte: string;
  rota: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-navy/15 py-7 first:border-0 first:pt-0">
      <SectionHeader
        etiqueta="Grupo do Desk"
        titulo={titulo}
        descricao={descricao}
        acoes={
          <Button asChild variant="outline" size="sm">
            <Link to={rota as never}>Abrir grupo</Link>
          </Button>
        }
      />
      <p className="mb-4 text-[11px] text-navy/50">Fonte: {fonte}</p>
      {children}
    </section>
  );
}

function MiniKpi({ rotulo, valor, tom = "neutro" }: { rotulo: string; valor: number | null; tom?: TomEstado }) {
  return (
    <div className="min-w-0 border-l-2 border-gold pl-3">
      <p className="text-xs text-navy/55">{rotulo}</p>
      <p className="mt-1 flex items-center gap-2 font-serif text-2xl leading-none tabular-nums text-navy">
        {valor ?? "—"}
        {valor === null ? <BadgeDesk texto="fonte indisponível" tom={tom} /> : null}
      </p>
    </div>
  );
}

function Metricas() {
  const buscarComercial = useServerFn(painelHojeDesk);
  const buscarOps = useServerFn(alertasOps);
  const buscarPesquisa = useServerFn(painelPesquisaModulo);
  const buscarContratos = useServerFn(painelContratual);
  const buscarFormalizacao = useServerFn(painelFormalizacao);
  const buscarQualidade = useServerFn(listarInconsistencias);
  const [incluirDemo, setIncluirDemo] = useState(false);

  const comercial = useQuery({
    queryKey: ["kpis-desk", "comercial", incluirDemo],
    queryFn: () => buscarComercial({ data: { incluirDemo } }),
  });
  const ops = useQuery({ queryKey: ["kpis-desk", "ops"], queryFn: () => buscarOps({} as never), retry: false });
  const pesquisa = useQuery({ queryKey: ["kpis-desk", "pesquisa"], queryFn: () => buscarPesquisa(), retry: false });
  const contratos = useQuery({ queryKey: ["kpis-desk", "contratos"], queryFn: () => buscarContratos({}), retry: false });
  const formalizacao = useQuery({ queryKey: ["kpis-desk", "formalizacao"], queryFn: () => buscarFormalizacao({}), retry: false });
  const qualidade = useQuery({
    queryKey: ["kpis-desk", "qualidade"],
    queryFn: () => buscarQualidade({ data: {} }),
    retry: false,
  });

  const m = comercial.data?.metricas;
  const filasHoje = comercial.data?.filas;
  const leads = total(m?.porOrigem);
  const casos = formalizacao.data ? formalizacao.data.resumo.casos : null;
  const pesquisas = pesquisa.data ? pesquisa.data.pesquisas.length : null;
  const alertasVencidos = ops.data
    ? ops.data.atrasadas.length + ops.data.microAtrasadas.length
    : null;
  const bloqueiosContratuais = contratos.data ? contratos.data.bloqueios.length : null;

  const origens: DadoGrafico[] = (m?.porOrigem ?? []).slice(0, 6).map((item) => ({
    rotulo: item.origem,
    valor: item.total,
  }));
  const funil: DadoGrafico[] = (m?.funil ?? []).map((item) => ({ rotulo: item.etapa, valor: item.para }));
  const pesquisaEstados = pesquisa.data
    ? [
        { rotulo: "Pesquisas", valor: pesquisa.data.pesquisas.length },
        { rotulo: "Sem pesquisa", valor: pesquisa.data.casosSemPesquisa.length },
        { rotulo: "Inconsistências", valor: pesquisa.data.inconsistencias.length },
      ]
    : [];
  const contratoEstados = contratos.data
    ? [
        { rotulo: "Instrumentos", valor: contratos.data.contratos.length },
        { rotulo: "Revisão humana", valor: contratos.data.revisaoPendente.length },
        { rotulo: "Anexos ausentes", valor: contratos.data.anexosAusentes.length },
        { rotulo: "OS impedidas", valor: contratos.data.ordensImpedidas.length },
      ]
    : [];
  const qualidadeAberta = qualidade.data
    ? Object.values(qualidade.data.resumo).reduce((soma, valor) => soma + Number(valor), 0)
    : null;

  return (
    <SaasShell
      titulo="KPIs do Desk"
      descricao="Leitura executiva dos seis grupos, sem substituir as telas donas nem criar uma segunda fonte de decisão."
    >
      <FaixaDecisao
        contexto="Governança & Administração · visão transversal"
        titulo="O que pede decisão agora"
        descricao="Cada número abaixo vem da mesma leitura usada pelo grupo responsável. Falhas aparecem como fonte indisponível, nunca como zero."
        fonte="Painel Hoje, Operação, Pesquisa, Contratos, Formalização e Qualidade"
      >
        <div data-metricas="principais" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <IndicadorExecutivo rotulo="Leads na leitura" valor={leads} apoio="Marketing & Comercial" />
          <IndicadorExecutivo rotulo="Casos na carteira" valor={casos} apoio="Pessoas & Casos" />
          <IndicadorExecutivo rotulo="Pesquisas abertas" valor={pesquisas} apoio="Inteligência & Pesquisa" />
          <IndicadorExecutivo rotulo="Prazos vencidos" valor={alertasVencidos} apoio="Tarefas e microentregas" tom={alertasVencidos ? "critico" : "sucesso"} />
          <IndicadorExecutivo rotulo="Bloqueios contratuais" valor={bloqueiosContratuais} apoio="Formalização & Financeiro" tom={bloqueiosContratuais ? "critico" : "sucesso"} />
        </div>
      </FaixaDecisao>

      <label className="mb-6 flex w-fit items-center gap-2 rounded-md border border-navy/10 bg-card px-3 py-2 text-xs text-navy/70">
        <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
        Incluir demonstração e teste apenas na leitura comercial
      </label>

      <div className="space-y-0">
        <PainelGrupo id="hoje" titulo="Hoje" descricao="Exceções, prazos e decisões que precisam de encaminhamento." fonte="Painel Hoje + alertas operacionais" rota="/painel">
          <EstadoFonte erro={comercial.error ?? ops.error} nome="Hoje" />
          <div className="grid gap-4 sm:grid-cols-3">
            <MiniKpi rotulo="Leads sem próxima ação" valor={m ? m.semProximaAcao : null} tom="atencao" />
            <MiniKpi rotulo="Follow-ups vencidos" valor={m ? m.followupsVencidos : null} tom="critico" />
            <MiniKpi rotulo="Microentregas vencidas" valor={ops.data ? ops.data.microAtrasadas.length : null} tom="critico" />
          </div>
          {filasHoje ? <p className="mt-4 text-xs text-navy/55">A priorização detalhada permanece na Visão Geral, com origem e próxima ação.</p> : null}
        </PainelGrupo>

        <PainelGrupo id="comercial" titulo="Marketing & Comercial" descricao="Aquisição, Discovery, avanço do funil e higiene de follow-up." fonte="Leads e casos persistidos · cálculo comercial vigente" rota="/calls">
          <EstadoFonte erro={comercial.error} nome="Marketing & Comercial" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div><h3 className="mb-4 text-sm font-semibold text-navy">Leads por origem</h3><BarrasCompactas dados={origens} vazio="Nenhuma origem registrada." /></div>
            <div><h3 className="mb-4 text-sm font-semibold text-navy">Avanço do funil</h3><BarrasCompactas dados={funil} vazio="Sem eventos suficientes para compor o funil." /></div>
          </div>
        </PainelGrupo>

        <PainelGrupo id="casos" titulo="Pessoas & Casos" descricao="Carteira, operação e próxima ação dos casos ativos." fonte="Formalização + alertas operacionais" rota="/casos">
          <EstadoFonte erro={formalizacao.error ?? ops.error} nome="Pessoas & Casos" />
          <div className="grid gap-4 sm:grid-cols-4">
            <MiniKpi rotulo="Casos" valor={casos} />
            <MiniKpi rotulo="Cadências críticas" valor={formalizacao.data ? formalizacao.data.resumo.criticos : null} tom="critico" />
            <MiniKpi rotulo="Tarefas atrasadas" valor={ops.data ? ops.data.atrasadas.length : null} tom="critico" />
            <MiniKpi rotulo="Tarefas em risco" valor={ops.data ? ops.data.emRisco.length : null} tom="atencao" />
          </div>
        </PainelGrupo>

        <PainelGrupo id="pesquisa" titulo="Inteligência & Pesquisa" descricao="Cobertura da carteira por pesquisa, pendências e qualidade da evidência." fonte="Pesquisa Genealógica + Qualidade" rota="/pesquisa-modulo">
          <EstadoFonte erro={pesquisa.error} nome="Inteligência & Pesquisa" />
          <BarrasCompactas dados={pesquisaEstados} vazio="Nenhuma pesquisa acessível para este papel." />
        </PainelGrupo>

        <PainelGrupo id="contratos" titulo="Formalização & Financeiro" descricao="Contratos, revisão humana, anexos e ordens impedidas por gate." fonte="Motor contratual + painel de formalização" rota="/contratos">
          <EstadoFonte erro={contratos.error ?? formalizacao.error} nome="Formalização & Financeiro" />
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <BarrasCompactas dados={contratoEstados} vazio="Nenhum instrumento acessível nesta leitura." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <MiniKpi rotulo="Em formalização" valor={formalizacao.data ? formalizacao.data.resumo.emFormalizacao : null} tom="atencao" />
              <MiniKpi rotulo="Cadências em atenção" valor={formalizacao.data ? formalizacao.data.resumo.atencao : null} tom="atencao" />
            </div>
          </div>
          <p className="mt-4 text-xs text-navy/55">Receita não é estimada: sem painel financeiro agregado confiável, nenhum valor monetário é mostrado aqui.</p>
        </PainelGrupo>

        <PainelGrupo id="governanca" titulo="Governança & Administração" descricao="Qualidade dos registros e integridade operacional acessível ao papel atual." fonte="Inconsistências de qualidade" rota="/qualidade">
          <EstadoFonte erro={qualidade.error} nome="Governança & Administração" />
          <div className="grid gap-4 sm:grid-cols-4">
            <MiniKpi rotulo="Inconsistências abertas" valor={qualidadeAberta} tom={qualidadeAberta ? "atencao" : "sucesso"} />
            <MiniKpi rotulo="Críticas" valor={qualidade.data ? numero(qualidade.data.resumo.critica) : null} tom="critico" />
            <MiniKpi rotulo="Altas" valor={qualidade.data ? numero(qualidade.data.resumo.alta) : null} tom="atencao" />
            <MiniKpi rotulo="Médias" valor={qualidade.data ? numero(qualidade.data.resumo.media) : null} />
          </div>
        </PainelGrupo>
      </div>

      <details data-metricas="historico" className="mt-2 rounded-lg border border-navy/10 bg-card p-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy">Métricas e Histórico</summary>
        <p className="mt-2 text-xs text-navy/55">Leitura retrospectiva, sem criar fila, alerta, tarefa ou estado.</p>
        <div className="mt-4 max-w-2xl">
          <BarrasCompactas dados={(m?.entradaMensal ?? []).slice(-8).map((item) => ({ rotulo: item.periodo, valor: item.total }))} vazio="Sem entrada mensal registrada." />
        </div>
      </details>
    </SaasShell>
  );
}