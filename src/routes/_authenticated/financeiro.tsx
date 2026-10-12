import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { cn } from "@/lib/utils";
import { diasDesde, rotuloIdade, tomIdade } from "@/lib/idade-registro";
import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import {
  Campo,
  FiltroStatus,
  Gaveta,
  Historico,
  Painel,
  ROTULO_CONCILIACAO,
  ROTULO_FATURA,
  ROTULO_PAGAMENTO,
  Selo,
  dataBr,
  inputCls,
  moeda,
} from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { FLUXO } from "@/lib/comercial-fluxo";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  formatarIndicador,
  previsoesControladas,
  resultadoCaixa,
  type EntradaFinanceira,
} from "@/lib/indicadores-marketing";
import {
  conciliarPagamento,
  listarAjustes,
  listarComercial,
  listarVinculos,
  registrarAjusteFatura,
  salvarFatura,
  salvarPagamento,
} from "@/lib/comercial.functions";

export const Route = createFileRoute("/_authenticated/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Clube Ancestral" },
      { name: "description", content: "Faturas, pagamentos e conciliação com trilha de auditoria." },
      { property: "og:title", content: "Financeiro — Clube Ancestral" },
      { property: "og:description", content: "Faturas e pagamentos do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FinanceiroPage,
});

type Linha = Record<string, unknown>;
type Aba = "faturas" | "pagamentos";

function FinanceiroPage() {
  const autoridade = useAutoridade();
  // Antes: `podeFinanceiro` desligava a tela inteira e ainda desligava as
  // consultas. Agora só a falta de papel ou de organização bloqueia.
  const decisaoFinanceiro = autoridade.decidir({ capacidade: "corrigir_condicao_comercial" });
  const podeFinanceiro = decisaoFinanceiro.decisao !== "bloquear";
  const queryClient = useQueryClient();
  const listar = useServerFn(listarComercial);
  const vinculos = useServerFn(listarVinculos);
  const salvarF = useServerFn(salvarFatura);
  const salvarP = useServerFn(salvarPagamento);
  const conciliar = useServerFn(conciliarPagamento);
  const ajustar = useServerFn(registrarAjusteFatura);
  const ajustes = useServerFn(listarAjustes);

  const [aba, setAba] = useState<Aba>("faturas");
  const [status, setStatus] = useState("");
  const [detalhe, setDetalhe] = useState<Linha | null>(null);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(form !== null && Object.values(form).some((x) => String(x ?? "").trim() !== ""));
  const [erro, setErro] = useState<string | null>(null);
  const [ajuste, setAjuste] = useState({ valor: "" });
  const [conc, setConc] = useState({ data: "", valor: "", referencia: "" });
  const [realidadeAberta, setRealidadeAberta] = useState(false);
  const [incluirDemos, setIncluirDemos] = useState(false);

  const recurso = aba === "faturas" ? "invoices" : "payments";
  const q = useQuery({
    queryKey: ["financeiro", recurso, status, incluirDemos],
    queryFn: () => listar({ data: { recurso, status: status || undefined, incluirDemos } }),
    enabled: podeFinanceiro,
  });
  const qFaturas = useQuery({
    queryKey: ["financeiro", "invoices", ""],
    queryFn: () => listar({ data: { recurso: "invoices" } }),
    enabled: podeFinanceiro,
  });
  const qPagamentos = useQuery({
    queryKey: ["financeiro", "payments", ""],
    queryFn: () => listar({ data: { recurso: "payments" } }),
    enabled: podeFinanceiro,
  });
  const qv = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => vinculos({}), enabled: podeFinanceiro });
  const qAjustes = useQuery({
    queryKey: ["ajustes"],
    queryFn: () => ajustes({}),
    enabled: aba === "faturas" && Boolean(detalhe?.["id"]),
  });

  const recarregar = () => {
    void queryClient.invalidateQueries({ queryKey: ["financeiro"] });
    void queryClient.invalidateQueries({ queryKey: ["ajustes"] });
    void queryClient.invalidateQueries({ queryKey: ["historico"] });
  };

  const mSalvar = useMutation({
    mutationFn: (v: { id?: string; dados: Record<string, unknown> }) =>
      aba === "faturas" ? salvarF({ data: v }) : salvarP({ data: v }),
    onSuccess: () => {
      setForm(null);
      setErro(null);
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mConciliar = useMutation({
    mutationFn: (v: { id: string; pago_em: string; valor: number; referencia_externa: string; motivo: string }) =>
      conciliar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setConc({ data: "", valor: "", referencia: "" });
      setDetalhe(null);
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const mAjuste = useMutation({
    mutationFn: (v: { invoice_id: string; valor: number; motivo: string }) => ajustar({ data: v }),
    onSuccess: () => {
      setErro(null);
      setAjuste({ valor: "" });
      recarregar();
    },
    onError: (e: Error) => setErro(e.message),
  });

  if (!podeFinanceiro) {
    return (
      <SaasShell titulo="Financeiro" descricao="Faturas, pagamentos e conciliação.">
        <EstadoVazio mensagem={decisaoFinanceiro.motivo} />
      </SaasShell>
    );
  }

  const clientes = qv.data?.clientes ?? [];
  const casos = qv.data?.casos ?? [];
  const vinculosIndisponiveis = !qv.isLoading && (Boolean(qv.error) || qv.data === undefined);
  const faturas = (qFaturas.data ?? []) as Linha[];
  const linhas = (q.data ?? []) as Linha[];
  const nomeCliente = (id: unknown) => clientes.find((c) => c.id === id)?.nome ?? "—";
  // §19 zona 5 do De-Para: "Relação com caso — vínculo financeiro ao
  // caso/contrato". `invoices.case_id` já existe e já é gravado na criação
  // (form abaixo), mas nunca era exibido depois — a fatura "esquecia" a
  // qual caso pertencia. `casos` já vem carregado por `qv` (mesmos dados do
  // formulário de criação), sem query nova.
  const casoDoId = (id: unknown) => casos.find((c) => c.id === id);
  const ehDemo = (l: Linha) =>
    l["dados_teste"] === true ||
    (clientes.find((c) => c.id === l["client_id"]) as { is_demo?: boolean } | undefined)?.is_demo === true;
  const rotuloFatura = (id: unknown) => {
    const f = faturas.find((x) => x["id"] === id);
    return f ? `${String(f["descricao"] ?? f["numero"] ?? "Fatura")} — ${moeda(f["valor"], f["moeda"])}` : "—";
  };
  const rotulos = aba === "faturas" ? ROTULO_FATURA : ROTULO_PAGAMENTO;

  const pagamentos = (qPagamentos.data ?? []) as Linha[];
  const soma = (rows: Linha[], filtro: (l: Linha) => boolean) =>
    rows.filter(filtro).reduce((t, l) => t + (Number(l["valor"]) || 0), 0);
  const recebida = soma(pagamentos, (l) => l["status"] === "confirmado" && Boolean(l["pago_em"]));
  const contratada = soma(faturas, (l) => l["status"] !== "cancelada");
  const pendentes = soma(faturas, (l) => l["status"] === "emitida" || l["status"] === "enviada");
  const vencidas = soma(faturas, (l) => l["status"] === "vencida");
  const base: EntradaFinanceira = {
    receita_recebida: qPagamentos.isLoading ? null : recebida,
    receita_contratada: contratada,
    cobrancas_pendentes: pendentes,
    cobrancas_vencidas: vencidas,
  };
  const previsoes = previsoesControladas({ contratada_nao_recebida: Math.max(contratada - recebida, 0) });

  return (
    <SaasShell
      titulo="Financeiro"
      descricao="Faturas, pagamentos e conciliação. Toda alteração é auditada."
      visualKit="pantone"
      acoes={
        <button
          onClick={() => {
            setErro(null);
            setForm({ moeda: "BRL" });
          }}
          className="rounded-lg bg-navy px-3 py-2 text-sm text-cream"
        >
          {aba === "faturas" ? "Nova fatura" : "Novo pagamento"}
        </button>
      }
    >
      <div className="space-y-4">
        {qFaturas.isError || qPagamentos.isError ? (
          <p className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            Não foi possível carregar {qFaturas.isError && qPagamentos.isError ? "faturas nem pagamentos" : qFaturas.isError ? "as faturas" : "os pagamentos"}.
            Os totais abaixo não refletem valor real — a leitura falhou, não é zero.
            <button
              type="button"
              onClick={() => {
                if (qFaturas.isError) void qFaturas.refetch();
                if (qPagamentos.isError) void qPagamentos.refetch();
              }}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}
        {/*
          §19 do De-Para (Desk — Financeiro, zona "Resumo — visão financeira
          do período: previsto, recebido, vencido, em atraso, saldo").
          DIVERGÊNCIA REGISTRADA (§29): o wireframe nomeia "vencido" e "em
          atraso" como dois indicadores; o vocabulário real de
          `invoices.status` só sustenta um estado equivalente (`vencida`) —
          não crio uma segunda contagem inventada por dias de atraso sem
          fonte. Reaproveita `contratada`/`recebida`/`vencidas` já
          calculados acima (mesmos dados de `qFaturas`/`qPagamentos`, sem
          query nova) — cada indicador muda a aba/filtro para a lista real
          que o sustenta, nenhum é decorativo.
        */}
        <CaCard titulo="Resumo do período" eyebrow="Financeiro · Faturas e pagamentos reais" data-financeiro-resumo-periodo>
          {qFaturas.isLoading || qPagamentos.isLoading ? (
            <p className="text-sm text-navy/50">Carregando…</p>
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  { chave: "previsto", rotulo: "Previsto", valor: contratada, aba: "faturas" as Aba, status: "" },
                  { chave: "recebido", rotulo: "Recebido", valor: recebida, aba: "pagamentos" as Aba, status: "confirmado" },
                  { chave: "vencido", rotulo: "Vencido", valor: vencidas, aba: "faturas" as Aba, status: "vencida" },
                  { chave: "saldo", rotulo: "Saldo em aberto", valor: Math.max(contratada - recebida, 0), aba: "faturas" as Aba, status: "" },
                ] as const
              ).map((item) => (
                <button
                  key={item.chave}
                  type="button"
                  data-financeiro-indicador={item.chave}
                  onClick={() => {
                    setAba(item.aba);
                    setStatus(item.status);
                    setDetalhe(null);
                  }}
                  className="rounded-lg border border-navy/10 bg-cream/60 p-3 text-left hover:bg-navy/5"
                >
                  <dt className="text-[11px] uppercase tracking-wide text-navy/50">{item.rotulo}</dt>
                  <dd className="mt-1 font-serif text-lg text-navy">{moeda(item.valor, "BRL")}</dd>
                  <span className="text-[11px] text-navy/45">Ver lista →</span>
                </button>
              ))}
            </dl>
          )}
        </CaCard>

        {podeFinanceiro ? <CondicoesPrevistas /> : null}


        {/*
          §19 do De-Para, zona "Obrigações — custos/repasse/fornecedores
          quando aplicável". DIVERGÊNCIA REGISTRADA (§29): `third_party_expenses`
          existe e já é lido em Caso 360 (visao-geral.tsx), sempre por caso —
          não existe hoje uma agregação por organização/período, e eu não
          crio uma nova consulta org-wide sem fonte já pronta e sem mutation
          nesta rodada. Estado honesto em vez de número inventado.
        */}
        <div className="grid gap-4 lg:grid-cols-2">
          <CaCard titulo="Obrigações e parcelas" eyebrow="Financeiro · Custos e fornecedores" data-financeiro-obrigacoes>
            <EstadoVazio mensagem="Sem agregação por organização ainda: despesas e parcelas continuam disponíveis por caso, sem estimativa nesta leitura." />
          </CaCard>

        {/*
          §19 do De-Para, zona "Gráficos — evolução e composição, com
          período, unidade monetária e fonte". A regra do próprio corte
          proíbe gráfico decorativo: sem uma consulta de série mensal real
          (não existe hoje — `qFaturas`/`qPagamentos` trazem a lista crua,
          não agregada por mês), um gráfico aqui seria decoração, não dado.
          Estado honesto em vez de forjar uma série temporal.
        */}
          <CaCard titulo="Recebimentos e reconciliação" eyebrow="Financeiro · Evolução" data-financeiro-evolucao>
            <EstadoVazio mensagem="Sem série mensal consolidada. Os totais reais permanecem no resumo; nenhum gráfico é desenhado sem fonte." />
          </CaCard>
        </div>

        <details className="rounded-lg border border-navy/15 bg-card p-4">
          <summary className="cursor-pointer text-sm font-medium text-navy">Abrir gestão financeira completa</summary>
          <div className="mt-5 space-y-4 border-t border-navy/10 pt-5">

        <div className="flex gap-2">
          {(["faturas", "pagamentos"] as Aba[]).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAba(a);
                setStatus("");
                setDetalhe(null);
              }}
              className={
                a === aba
                  ? "rounded-lg bg-navy px-3 py-2 text-sm text-cream"
                  : "rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy/70"
              }
            >
              {a === "faturas" ? "Faturas" : "Pagamentos"}
            </button>
          ))}
        </div>

        <section className="rounded-xl border border-navy/10 bg-cream/40 p-4">
          <button
            type="button"
            onClick={() => setRealidadeAberta((v) => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-medium text-navy">Realidade financeira do Clube Ancestral</span>
            <span className="text-xs text-navy/50">{realidadeAberta ? "recolher" : "expandir"}</span>
          </button>
          <p className="mt-1 text-xs text-navy/55">
            Receita recebida nunca é somada à contratada, previsão não vira caixa e despesa paga diretamente pelo cliente ao terceiro
            não entra como custo do Clube. Indicador sem base declarada aparece como “Sem dados suficientes”.
          </p>
          <p className="mt-1 text-[11px] text-navy/50">
            {/*
              07/09/2026 — achado de auditoria: este texto anunciava "mês
              corrente" como recorte de apuração, mas o cálculo abaixo soma
              todo o histórico não arquivado, sem filtro de período nenhum.
              Corrigido para descrever o que o código realmente faz, em vez
              de prometer um recorte que não existe. Se quiser recorte por
              mês de verdade, isso é uma mudança de cálculo à parte.
            */}
            Recorte único: caixa, previsão e eficiência de mídia usam a mesma base (acumulado total, sem filtro de período).
            Não é recorte de mês corrente. Mídia e aquisição não são lidas em janela própria.
          </p>
          {realidadeAberta ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-navy/15 bg-cream/50 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  1 · Caixa realizado — dinheiro que entrou e saiu
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      rotulo: "Receita recebida",
                      valor: formatarIndicador(
                        base.receita_recebida === null
                          ? { estado: "sem_dados", motivo: "" }
                          : { estado: "ok", valor: recebida, unidade: "moeda" },
                      ),
                    },
                    { rotulo: "Investimento em mídia", valor: formatarIndicador(base.investimento_midia == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.investimento_midia, unidade: "moeda" }) },
                    { rotulo: "Despesas operacionais", valor: formatarIndicador(base.despesas_operacionais == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.despesas_operacionais, unidade: "moeda" }) },
                  ].map((c) => (
                    <div key={c.rotulo} className="rounded border border-navy/10 bg-cream/40 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-navy/45">{c.rotulo}</p>
                      <p className="mt-1 text-sm font-medium text-navy">{c.valor}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 rounded border border-navy/15 bg-cream/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Resultado de caixa do período</p>
                  <p className="font-serif text-xl text-navy">{formatarIndicador(resultadoCaixa(base))}</p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-navy/25 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  2 · Em aberto e previsão — ainda não é caixa
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded border border-navy/10 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-navy/45">Cobranças pendentes</p>
                    <p className="mt-1 text-sm text-navy/75">{moeda(pendentes, "BRL")}</p>
                  </div>
                  <div className="rounded border border-terracotta/30 bg-terracotta/5 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-navy/45">Cobranças vencidas</p>
                    <p className="mt-1 text-sm text-terracotta">{moeda(vencidas, "BRL")}</p>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-navy/65">
                  {previsoes.map((p) => (
                    <li key={p.chave}>
                      • {p.rotulo}: <strong>{formatarIndicador(p.valor)}</strong> — não conta como receita.
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-navy/10 p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                  3 · Eficiência de mídia — contagem canônica em Marketing
                </p>
                <p className="mt-2 text-sm text-navy/70" data-indicador-etiqueta="cac-roi-cpl">
                  CAC, CPL e ROI de mídia contam somente em{" "}
                  <a href="/marketing#indicadores" className="font-medium text-navy underline">
                    Marketing → Indicadores
                  </a>
                  . Esta tela não reconta os mesmos números (CA-UX-03).
                </p>
                <div className="mt-2 grid gap-2 text-[11px] sm:grid-cols-5">
                  {[
                    { rotulo: "Quanto investimos", valor: formatarIndicador(base.investimento_midia == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.investimento_midia, unidade: "moeda" }) },
                    { rotulo: "Quantos chegaram", valor: formatarIndicador(base.leads_atribuiveis == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.leads_atribuiveis, unidade: "numero" }) },
                    { rotulo: "Quantos fizeram Discovery", valor: "Sem dados suficientes" },
                    { rotulo: "Quantos pagaram", valor: formatarIndicador(base.pagamentos_atribuiveis == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: base.pagamentos_atribuiveis, unidade: "numero" }) },
                    { rotulo: "Quanto entrou", valor: formatarIndicador(base.receita_recebida == null ? { estado: "sem_dados", motivo: "" } : { estado: "ok", valor: recebida, unidade: "moeda" }) },
                  ].map((c) => (
                    <div key={c.rotulo} className="rounded border border-navy/10 bg-cream/40 p-2">
                      <p className="uppercase tracking-wide text-navy/45">{c.rotulo}</p>
                      <p className="mt-0.5 text-navy/75">{c.valor}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <FiltroStatus rotulos={rotulos} valor={status} aoMudar={setStatus} />

        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input
            type="checkbox"
            checked={incluirDemos}
            onChange={(e) => setIncluirDemos(e.target.checked)}
            className="h-3.5 w-3.5 accent-navy"
          />
          Incluir demonstrações (visualização interna; registros com selo DEMO nunca entram em indicadores, previsões,
          caixa ou App Cliente)
        </label>


        {erro ? (
          <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
            Ação bloqueada: {erro}
          </p>
        ) : null}

        {vinculosIndisponiveis ? (
          <p
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-terracotta"
          >
            Não foi possível carregar clientes e casos vinculados. As listas de seleção e os nomes exibidos
            estão vazios por falha de leitura, não por ausência de cadastro.
            <button
              type="button"
              onClick={() => void qv.refetch()}
              className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium"
            >
              Tentar novamente
            </button>
          </p>
        ) : null}

        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data as Linha[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso={aba === "faturas" ? "as faturas" : "os pagamentos"}
          vazio="Nenhum registro cadastrado ainda."
        >
          {() =>
          !linhas.length ? (
          <EstadoVazio mensagem="Nenhum registro neste filtro." />
        ) : (
          <>
            {/* Mobile (<640px): cards empilhados — a tabela larga cortava conteúdo e a rolagem
                horizontal não é aceitável como única saída para um fluxo operacional. */}
            <div className="grid gap-3 sm:hidden">
              {linhas.map((l) => (
                <button
                  key={String(l["id"])}
                  type="button"
                  onClick={() => {
                    setErro(null);
                    setDetalhe(l);
                  }}
                  className="rounded-xl border border-navy/10 bg-cream/40 p-3 text-left text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-navy">
                      {aba === "faturas" ? String(l["descricao"] ?? "—") : rotuloFatura(l["invoice_id"])}
                    </span>
                    <span className="whitespace-nowrap font-medium text-navy">{moeda(l["valor"], l["moeda"])}</span>
                  </div>
                  <div className="mt-1 text-xs text-navy/60">
                    {aba === "faturas" ? nomeCliente(l["client_id"]) : String(l["referencia_externa"] ?? "—")}
                  </div>
                  <div className="mt-1 text-xs text-navy/60">
                    {dataBr(l[aba === "faturas" ? "vencimento" : "pago_em"])}
                    {(() => {
                      if (aba !== "faturas") return null;
                      if (l["status"] === "paga" || l["status"] === "cancelada") return null;
                      const dias = diasDesde(l["vencimento"]);
                      const rotulo = rotuloIdade(dias, "em aberto");
                      if (!rotulo) return null;
                      return (
                        <span
                          className={cn(
                            "ml-2",
                            tomIdade(dias) === "alerta" ? "font-semibold text-terracotta" : "text-navy/55",
                          )}
                        >
                          {rotulo}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Selo
                      texto={rotulos[String(l["status"])] ?? String(l["status"])}
                      tom={
                        l["status"] === "paga" || l["status"] === "confirmado"
                          ? "ok"
                          : l["status"] === "vencida" || l["status"] === "cancelada"
                            ? "alerta"
                            : "neutro"
                      }
                    />
                    {aba === "pagamentos" ? (
                      <Selo
                        texto={ROTULO_CONCILIACAO[String(l["conciliacao_status"])] ?? String(l["conciliacao_status"] ?? "—")}
                        tom={
                          l["conciliacao_status"] === "conciliado"
                            ? "ok"
                            : l["conciliacao_status"] === "divergente"
                              ? "erro"
                              : "neutro"
                        }
                      />
                    ) : null}
                    {ehDemo(l) ? <Selo texto="DEMO" tom="alerta" /> : null}
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop/tablet (≥640px): tabela completa */}
            <div className="hidden overflow-x-auto rounded-xl border border-navy/10 bg-cream/40 sm:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-navy/5 text-left text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Descrição" : "Fatura"}</th>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Cliente" : "Referência"}</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">{aba === "faturas" ? "Vencimento" : "Data"}</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={String(l["id"])} className="border-t border-navy/5">
                    <td className="px-4 py-3">
                      {aba === "faturas" ? String(l["descricao"] ?? "—") : rotuloFatura(l["invoice_id"])}
                    </td>
                    <td className="px-4 py-3">
                      {aba === "faturas" ? nomeCliente(l["client_id"]) : String(l["referencia_externa"] ?? "—")}
                    </td>
                    <td className="px-4 py-3">{moeda(l["valor"], l["moeda"])}</td>
                    <td className="px-4 py-3">
                      {dataBr(l[aba === "faturas" ? "vencimento" : "pago_em"])}
                      {(() => {
                        // Idade do saldo em aberto: dias desde o vencimento já registrado.
                        if (aba !== "faturas") return null;
                        if (l["status"] === "paga" || l["status"] === "cancelada") return null;
                        const dias = diasDesde(l["vencimento"]);
                        const rotulo = rotuloIdade(dias, "em aberto");
                        if (!rotulo) return null;
                        return (
                          <span
                            className={cn(
                              "mt-1 block text-[11px]",
                              tomIdade(dias) === "alerta" ? "font-semibold text-terracotta" : "text-navy/55",
                            )}
                          >
                            {rotulo}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 space-x-1">
                      <Selo
                        texto={rotulos[String(l["status"])] ?? String(l["status"])}
                        tom={
                          l["status"] === "paga" || l["status"] === "confirmado"
                            ? "ok"
                            : l["status"] === "vencida" || l["status"] === "cancelada"
                              ? "alerta"
                              : "neutro"
                        }
                      />
                      {aba === "pagamentos" ? (
                        <Selo
                          texto={ROTULO_CONCILIACAO[String(l["conciliacao_status"])] ?? String(l["conciliacao_status"] ?? "—")}
                          tom={
                            l["conciliacao_status"] === "conciliado"
                              ? "ok"
                              : l["conciliacao_status"] === "divergente"
                                ? "erro"
                                : "neutro"
                          }
                        />
                      ) : null}
                      {ehDemo(l) ? <Selo texto="DEMO" tom="alerta" /> : null}

                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setErro(null);
                          setDetalhe(l);
                        }}
                        className="rounded-md border border-navy/15 px-2 py-1 text-xs text-navy/70 hover:bg-navy/5"
                      >
                        Detalhe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )
          }
        </EstadoDados>
          </div>
        </details>
      </div>

      {detalhe ? (
        <Gaveta titulo={aba === "faturas" ? "Fatura" : "Pagamento"} aoFechar={() => setDetalhe(null)}>
          {/*
            DSA-7-FINANCEIRO (2026-09-23): sétimo consumidor do Desk a usar
            `CaCard` (após DSA-1 a DSA-6), mesmos tokens, sem hex novo. Troca
            só o invólucro deste bloco de resumo — dado, mutation e os
            demais blocos da Gaveta permanecem intocados.
          */}
          <CaCard titulo="Resumo" eyebrow="Financeiro · Detalhe">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-navy/60">Valor</dt>
                <dd>{moeda(detalhe["valor"], detalhe["moeda"])}</dd>
              </div>
              <div>
                <dt className="text-navy/60">Status</dt>
                <dd>{rotulos[String(detalhe["status"])] ?? String(detalhe["status"])}</dd>
              </div>
              {aba === "faturas" ? (
                <>
                  <div>
                    <dt className="text-navy/60">Cliente</dt>
                    <dd>{nomeCliente(detalhe["client_id"])}</dd>
                  </div>
                  <div>
                    <dt className="text-navy/60">Valor já pago</dt>
                    <dd>{moeda(detalhe["valor_pago"] ?? 0, detalhe["moeda"])}</dd>
                  </div>
                  <div data-financeiro-vinculo-caso>
                    <dt className="text-navy/60">Caso vinculado</dt>
                    <dd>
                      {(() => {
                        const caso = casoDoId(detalhe["case_id"]);
                        if (!caso) return "Sem caso vinculado";
                        return (
                          <Link
                            to="/casos/$caseId"
                            params={{ caseId: caso.id }}
                            className="text-navy underline underline-offset-4"
                          >
                            {caso.codigo ?? caso.titulo}
                          </Link>
                        );
                      })()}
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-navy/60">Fatura</dt>
                    <dd>{rotuloFatura(detalhe["invoice_id"])}</dd>
                  </div>
                  <div>
                    <dt className="text-navy/60">Conciliação</dt>
                    <dd>{ROTULO_CONCILIACAO[String(detalhe["conciliacao_status"])] ?? "—"}</dd>
                  </div>
                </>
              )}
            </dl>
          </CaCard>

          {aba === "faturas" ? (
            <>
              <Painel titulo="Mover status">
                <div className="flex flex-wrap gap-2">
                  {(FLUXO["invoices"]?.[String(detalhe["status"])] ?? []).map((destino) => (
                    <AcaoOperacional
                      key={destino}
                      rotulo={ROTULO_FATURA[destino] ?? destino}
                      className="rounded-lg border border-navy/20 px-3 py-2 text-sm hover:bg-navy/5 disabled:opacity-60"
                      acaoExterna="mudar_status_fatura"
                      efeito={`Move a fatura de "${ROTULO_FATURA[String(detalhe["status"])] ?? String(detalhe["status"])}" para "${ROTULO_FATURA[destino] ?? destino}".`}
                      onConfirmar={() => {
                        if (mSalvar.isPending) return;
                        mSalvar.mutate({ id: String(detalhe["id"]), dados: { status: destino } });
                      }}
                    />
                  ))}
                </div>
              </Painel>

              <Painel titulo="Ajuste de valor (fatura paga)">
                <p className="mb-3 text-xs text-navy/60">
                  Fatura paga não tem o valor editado. Registre um ajuste separado, com motivo e autoria.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo rotulo="Valor do ajuste">
                    <input
                      type="number"
                      className={inputCls}
                      value={ajuste.valor}
                      onChange={(e) => setAjuste({ ...ajuste, valor: e.target.value })}
                    />
                  </Campo>
                </div>
                <AcaoOperacional
                  rotulo="Registrar ajuste"
                  className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                  acaoExterna="registrar_ajuste_fatura"
                  validacaoFormulario={!ajuste.valor ? "Informe o valor do ajuste antes de confirmar." : null}
                  efeito="Registra um ajuste financeiro na fatura, com autoria e motivo — não altera o valor original da fatura."
                  onConfirmar={(motivo) => {
                    if (mAjuste.isPending) return;
                    mAjuste.mutate({
                      invoice_id: String(detalhe["id"]),
                      valor: Number(ajuste.valor),
                      motivo,
                    });
                  }}
                />
                <EstadoDados
                  carregando={qAjustes.isLoading}
                  erro={qAjustes.error}
                  dados={qAjustes.data as Linha[] | undefined}
                  aoTentarNovamente={() => void qAjustes.refetch()}
                  recurso="os ajustes de fatura"
                  vazio="Nenhum ajuste registrado."
                >
                  {(ajustes) => (
                    <ul className="mt-4 space-y-2 text-sm">
                      {ajustes
                        .filter((a) => a["invoice_id"] === detalhe["id"])
                        .map((a) => (
                          <li key={String(a["id"])} className="rounded-lg border border-navy/10 px-3 py-2">
                            {moeda(a["valor"], detalhe["moeda"])} — {String(a["motivo"] ?? "")}{" "}
                            <span className="text-navy/50">{dataBr(a["created_at"])}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </EstadoDados>
              </Painel>
            </>
          ) : (
            <Painel titulo="Conciliar pagamento">
              <p className="mb-3 text-xs text-navy/60">
                Conciliação exige data, valor e referência. Valor diferente da fatura marca divergente e derruba o
                check de pagamento confirmado do caso.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo rotulo="Data">
                  <input
                    type="date"
                    className={inputCls}
                    value={conc.data}
                    onChange={(e) => setConc({ ...conc, data: e.target.value })}
                  />
                </Campo>
                <Campo rotulo="Valor">
                  <input
                    type="number"
                    className={inputCls}
                    value={conc.valor}
                    onChange={(e) => setConc({ ...conc, valor: e.target.value })}
                  />
                </Campo>
                <Campo rotulo="Referência externa">
                  <input
                    className={inputCls}
                    value={conc.referencia}
                    onChange={(e) => setConc({ ...conc, referencia: e.target.value })}
                  />
                </Campo>
              </div>
              <AcaoOperacional
                rotulo="Conciliar"
                className="mt-3 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-60"
                acaoExterna="conciliar_pagamento"
                validacaoFormulario={
                  !conc.data || !conc.valor || !conc.referencia
                    ? "Preencha data, valor e referência antes de confirmar a conciliação."
                    : null
                }
                efeito="Marca o pagamento como confirmado e, quando a fatura estiver vinculada a um caso, libera o campo que o gate de acesso ao Portal do Cliente verifica. Não envia mensagem nem publica conteúdo."
                onConfirmar={(motivo) => {
                  if (mConciliar.isPending) return;
                  mConciliar.mutate({
                    id: String(detalhe["id"]),
                    pago_em: conc.data,
                    valor: Number(conc.valor),
                    referencia_externa: conc.referencia,
                    motivo,
                  });
                }}
              />
            </Painel>
          )}

          <Painel titulo="Histórico">
            <Historico entidade={recurso} id={String(detalhe["id"])} />
          </Painel>
        </Gaveta>
      ) : null}

      {form ? (
        <Gaveta titulo={aba === "faturas" ? "Nova fatura" : "Novo pagamento"} aoFechar={() => setForm(null)}>
          {erro ? <p className="text-sm text-terracotta">{erro}</p> : null}
          {aba === "faturas" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Cliente *">
                <select
                  className={inputCls}
                  value={form["client_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Selecione…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Caso (opcional)">
                <select
                  className={inputCls}
                  value={form["case_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                >
                  <option value="">Sem vínculo</option>
                  {casos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo ?? c.titulo}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Descrição">
                <input
                  className={inputCls}
                  value={form["descricao"] ?? ""}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Valor">
                <input
                  type="number"
                  className={inputCls}
                  value={form["valor"] ?? ""}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Moeda">
                <select
                  className={inputCls}
                  value={form["moeda"] ?? "BRL"}
                  onChange={(e) => setForm({ ...form, moeda: e.target.value })}
                >
                  {["BRL", "EUR", "USD"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Vencimento">
                <input
                  type="date"
                  className={inputCls}
                  value={form["vencimento"] ?? ""}
                  onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                />
              </Campo>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Fatura *">
                <select
                  className={inputCls}
                  value={form["invoice_id"] ?? ""}
                  onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
                >
                  <option value="">Selecione…</option>
                  {faturas.map((f) => (
                    <option key={String(f["id"])} value={String(f["id"])}>
                      {String(f["descricao"] ?? f["id"])} — {moeda(f["valor"], f["moeda"])}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="Valor">
                <input
                  type="number"
                  className={inputCls}
                  value={form["valor"] ?? ""}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Data do pagamento">
                <input
                  type="date"
                  className={inputCls}
                  value={form["pago_em"] ?? ""}
                  onChange={(e) => setForm({ ...form, pago_em: e.target.value })}
                />
              </Campo>
              <Campo rotulo="Referência externa">
                <input
                  className={inputCls}
                  value={form["referencia_externa"] ?? ""}
                  onChange={(e) => setForm({ ...form, referencia_externa: e.target.value })}
                />
              </Campo>
            </div>
          )}
          <AcaoOperacional
            rotulo="Salvar"
            className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
            acaoExterna={aba === "faturas" ? "salvar_fatura" : "salvar_pagamento"}
            efeito={
              aba === "faturas"
                ? "Cria ou atualiza uma fatura. Fatura paga não pode ter o valor editado por aqui."
                : "Cria ou atualiza um pagamento vinculado a uma fatura."
            }
            onConfirmar={() => {
              if (mSalvar.isPending || !form) return;
              const { id, ...dados } = form;
              mSalvar.mutate({ id: id || undefined, dados });
            }}
          />
        </Gaveta>
      ) : null}
    </SaasShell>
  );
}

/*
  12/10/2026 — decisão da Proprietária: sem Asaas por enquanto. Mostra só a
  condição comercial registrada por caso (commercial_conditions), como
  previsão. Não entra no saldo: saldo continua vindo de faturas/pagamentos.
*/
function CondicoesPrevistas() {
  const q = useQuery({
    queryKey: ["financeiro", "condicoes-previstas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_conditions")
        .select("id,case_id,forma_pagamento,valor_total_referencia,status")
        .is("archived_at", null)
        .eq("dados_teste", false)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <CaCard titulo="Condições previstas por caso" eyebrow="Financeiro · Previsão sem cobrança" data-financeiro-condicoes>
      {q.isLoading ? (
        <p className="text-sm text-navy/50">Carregando…</p>
      ) : q.isError ? (
        <p className="text-sm text-terracotta">
          Não foi possível ler as condições.{" "}
          <button type="button" className="underline" onClick={() => void q.refetch()}>Tentar novamente</button>
        </p>
      ) : q.data!.length === 0 ? (
        <EstadoVazio mensagem="Nenhuma condição comercial registrada." />
      ) : (
        <ul className="divide-y divide-navy/10">
          {q.data!.map((c) => (
            <li key={c.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-navy">{c.forma_pagamento ?? "Forma de pagamento não registrada"}</p>
                <p className="mt-1 text-[11px] text-navy/55">
                  Aguardando confirmação de pagamento · não entra no saldo até haver pagamento registrado
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span className="font-serif text-lg text-navy">
                  {c.valor_total_referencia != null ? moeda(Number(c.valor_total_referencia), "BRL") : "Não registrado"}
                </span>
                {c.case_id ? (
                  <Link
                    to="/casos/$caseId"
                    params={{ caseId: c.case_id }}
                    hash="financeiro"
                    className="text-xs text-navy underline decoration-gold underline-offset-4"
                  >
                    Abrir financeiro do caso
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </CaCard>
  );
}
