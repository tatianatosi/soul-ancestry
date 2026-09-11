import { createFileRoute, Link } from "@tanstack/react-router";
import { useAutoridade } from "@/components/saas/autoridade";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { EntidadeCrud } from "@/components/saas/entidade-crud";
import { AbrirCasoMotor } from "@/components/caso/abrir-caso-motor";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { listarEstadoAtivacao } from "@/lib/casos-ativacao.functions";
import { rotuloFase } from "@/lib/fase-rotulo";
import { resolverCasoPorCodigo } from "@/lib/caso-busca.functions";
import { mensagemResolucao, type ResultadoBuscaCaso } from "@/lib/caso-busca";
import { ESTADOS, PRIORIDADES } from "@/lib/estados";
import {
  EIXO_COMERCIAL,
  EIXO_FORMALIZACAO,
  HIPOTESE_ELEGIBILIDADE,
  PROXIMAS_ACOES,
  SELO_PROXIMA_ACAO,
  SITUACAO_FINANCEIRA,
  SITUACAO_OPERACIONAL,
  lacunasProximaAcao,
  obterProximaAcaoCanonica,
  papelDoRegistro,
  qualificarData,
  rotulo,
} from "@/lib/caso-ficha";
import { ehFixture, ROTULO_FIXTURE } from "@/lib/identificadores-norma";
import { calcularPrioridade } from "@/lib/prioridade-matriz";
import { ROTULO_PRIORIDADE } from "@/lib/descoberta-desk";
import { PainelFormalizacao } from "@/components/painel/painel-formalizacao";
import { AlertaDesk, CardIndicador, CarregandoDesk, PageHeader } from "@/components/desk/ui-desk";

export const Route = createFileRoute("/_authenticated/casos/")({
  /**
   * `fase` chega da Jornada dos casos no Painel. Sem isto, o cartão da etapa
   * seria um link decorativo — levaria à lista inteira, não à etapa clicada.
   * Valor desconhecido vira `undefined`: filtro inválido mostra tudo, nunca
   * uma lista vazia sem explicação.
   */
  validateSearch: (busca: Record<string, unknown>): { fase?: string } => {
    const f = typeof busca.fase === "string" ? busca.fase.trim() : "";
    return f ? { fase: f } : {};
  },
  head: () => ({
    meta: [
      { title: "Casos 360 — Clube Ancestral" },
      {
        name: "description",
        content: "Casos de cidadania com hipótese de elegibilidade e ativação condicionada.",
      },
      { property: "og:title", content: "Casos 360 — Clube Ancestral" },
      { property: "og:description", content: "Gestão de casos de cidadania no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CasosPage,
});

/**
 * Compara a fase da linha com a etapa pedida, tolerando as duas grafias que
 * convivem no banco ("aceite_e_formalizacao" e "aceite_formalizacao").
 * Sem filtro pedido, tudo passa.
 */
function casaComFase(linha: Record<string, unknown>, fase?: string): boolean {
  if (!fase) return true;
  const norm = (v: string) => v.trim().toLowerCase().replace(/_e_/g, "_");
  const daLinha = typeof linha.fase === "string" ? linha.fase : "";
  return !!daLinha && norm(daLinha) === norm(fase);
}

function Badge({
  texto,
  tom = "neutro",
}: {
  texto: string;
  tom?: "neutro" | "gold" | "alerta" | "ok";
}) {
  const classes =
    tom === "alerta"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : tom === "ok"
        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
        : tom === "gold"
          ? "border-gold/50 bg-gold/10 text-navy"
          : "border-navy/15 bg-navy/5 text-navy/75";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[11px] leading-tight ${classes}`}
    >
      {texto}
    </span>
  );
}

function BuscaPorCodigo() {
  const resolver = useServerFn(resolverCasoPorCodigo);
  const [termo, setTermo] = useState("");
  const [resultado, setResultado] = useState<ResultadoBuscaCaso | null>(null);
  const [semResultado, setSemResultado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setSemResultado(false);
    setResultado(null);
    try {
      const r = await resolver({ data: { termo } });
      if (r) setResultado(r);
      else setSemResultado(true);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <form onSubmit={buscar} className="flex flex-wrap items-center gap-2">
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por código canônico ou identificador histórico"
          aria-label="Buscar caso por código canônico ou identificador histórico"
          className="min-w-[22rem] rounded-md border border-navy/20 bg-white px-3 py-1.5 text-sm text-navy"
        />
        <button
          type="submit"
          disabled={carregando || !termo.trim()}
          className="rounded-md border border-navy/20 bg-navy px-3 py-1.5 text-sm text-cream disabled:opacity-50"
        >
          {carregando ? "Buscando…" : "Localizar caso"}
        </button>
      </form>
      {resultado ? (
        <p className="text-sm text-navy/80">
          {mensagemResolucao(resultado)}{" "}
          <Link
            to="/casos/$caseId"
            params={{ caseId: resultado.caseId }}
            className="font-medium text-navy underline"
          >
            Abrir {resultado.codigoCanonico}
            {resultado.titulo ? ` — ${resultado.titulo}` : ""}
          </Link>
        </p>
      ) : null}
      {semResultado ? (
        <p className="text-sm text-terracotta">
          Nenhum caso encontrado para esse código. Nenhum registro foi criado.
        </p>
      ) : null}
    </div>
  );
}

function CasosPage() {
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "editar_rascunho" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua.";
  const carregarAtivacao = useServerFn(listarEstadoAtivacao);
  const [mostrarDemo, setMostrarDemo] = useState(false);
  const { fase: faseFiltro } = Route.useSearch();
  const navigate = Route.useNavigate();

  const qAtivacao = useQuery({
    queryKey: ["casos", "estado-ativacao"],
    queryFn: () => carregarAtivacao({}),
  });
  const estados = new Map((qAtivacao.data ?? []).map((e) => [e.caseId, e]));

  // Cartões de decisão do grupo Casos — só contam o que já está carregado
  // por listarEstadoAtivacao; sem fonte real, o cartão mostra "Sem dados
  // suficientes" (nunca zero ou estimativa).
  const listaAtivacao = qAtivacao.data ?? [];
  const casosAtivos = qAtivacao.data ? listaAtivacao.filter((e) => e.ativo).length : null;
  const aguardandoAtivacao = qAtivacao.data ? listaAtivacao.filter((e) => !e.ativo).length : null;
  const semResponsavelInterno = qAtivacao.data
    ? listaAtivacao.filter(
        (e) => !e.ativo && e.motivos.some((m) => m.includes("Responsável interno")),
      ).length
    : null;
  const bloqueiosMultiplos = qAtivacao.data
    ? listaAtivacao.filter((e) => !e.ativo && e.pendentes >= 3).length
    : null;

  return (
    <SaasShell
      titulo="Casos 360"
      descricao="Comercial, formalização, financeiro e operação são eixos independentes. Hipótese de elegibilidade é sempre provisória e ativação depende de gates validados no servidor."
    >
      <PageHeader
        titulo="Casos 360 em acompanhamento"
        subtitulo="Cada eixo tem estado próprio. Hipótese de elegibilidade nunca equivale a elegibilidade definitiva, e datas futuras são previsão condicional."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CardIndicador
          rotulo="Casos ativos"
          valor={casosAtivos}
          apoio="14 requisitos validados no servidor"
        />
        <CardIndicador
          rotulo="Aguardando ativação"
          valor={aguardandoAtivacao}
          apoio="Ao menos um requisito obrigatório pendente"
          tom="atencao"
        />
        <CardIndicador
          rotulo="Sem responsável interno"
          valor={semResponsavelInterno}
          apoio="Gate de ativação — distinto do «Sem responsável» do Painel Hoje"
          tom="critico"
        />
        <CardIndicador
          rotulo="Bloqueio de ativação múltiplo"
          valor={bloqueiosMultiplos}
          apoio="3 ou mais requisitos pendentes"
          tom="critico"
        />
      </div>

      {qAtivacao.isLoading ? (
        <CarregandoDesk linhas={2} rotulo="Verificando requisitos de ativação no servidor" />
      ) : null}
      {qAtivacao.error ? (
        <AlertaDesk tom="critico" titulo="Não foi possível ler o estado de ativação">
          A lista continua visível, mas o estado de ativação não pôde ser verificado agora. Nenhum
          caso foi ativado.
        </AlertaDesk>
      ) : null}

      {/*
        A matriz Urgência × Elegibilidade é a tela Radar Interno do mockup.
        Em Casos 360 a saúde aparece por linha da carteira; o mapa da carteira
        inteira abre aqui.
      */}
      <p className="mb-4 rounded-lg border border-navy/10 bg-cream/50 px-4 py-3 text-sm text-navy/70">
        A matriz de prioridade da carteira (Agir agora / Avaliar / Monitorar / Cultivar) está no{" "}
        <Link to="/qualidade" className="font-medium text-navy underline">
          Radar Interno
        </Link>
        . Nesta lista, a coluna de saúde e a próxima ação vêm do mesmo planejador da ficha.
      </p>

      {pendenciaVinculo ? (
        <p className="mb-4 rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
          Pendência registrada: {pendenciaVinculo}
        </p>
      ) : null}
      <EntidadeCrud
        entidade="crm_casos"
        titulo="Casos 360"
        podeEscrever={podeEscrever}
        dominio="caso"
        larguraMinima={2100}
        filtrarLinhas={(l) =>
          (mostrarDemo || papelDoRegistro(l).valor !== "demo") && casaComFase(l, faseFiltro)
        }
        classeLinha={(l) => (papelDoRegistro(l).valor === "demo" ? "bg-terracotta/5" : undefined)}
        topo={
          <div className="space-y-3">
            {/* Lista filtrada nunca fica filtrada em silêncio: quem chegou da
                Jornada precisa ver por que está vendo menos casos. */}
            {faseFiltro ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gold/40 bg-gold/5 px-3 py-2 text-sm">
                <span className="text-navy/75">
                  Mostrando a etapa{" "}
                  <span className="font-medium text-navy">{rotuloFase(faseFiltro)}</span> da
                  jornada.
                </span>
                <button
                  type="button"
                  onClick={() => navigate({ search: {} })}
                  className="rounded border border-navy/20 px-2 py-0.5 text-xs text-navy/75 hover:bg-navy/5"
                >
                  Ver todos os casos
                </button>
              </div>
            ) : null}
            <BuscaPorCodigo />
            <AbrirCasoMotor />
            <label className="flex items-center gap-2 text-sm text-navy/70">
              <input
                type="checkbox"
                checked={mostrarDemo}
                onChange={(e) => setMostrarDemo(e.target.checked)}
              />
              Mostrar casos demonstrativos (fora de relatórios e métricas reais)
            </label>
          </div>
        }

        colunas={[
          {
            chave: "codigo",
            rotulo: "Código canônico",
            render: (l) => (
              <span className="flex flex-wrap items-center gap-1">
                <span>{(l["codigo"] as string) || "—"}</span>
                {ehFixture(l["codigo"] as string | null) ? (
                  <Badge texto={ROTULO_FIXTURE} tom="alerta" />
                ) : null}
              </span>
            ),
          },
          { chave: "titulo", rotulo: "Título" },
          {
            chave: "papel_registro",
            rotulo: "Papel do registro",
            render: (l) => {
              const p = papelDoRegistro(l);
              return (
                <Badge
                  texto={p.rotulo}
                  tom={p.valor === "demo" ? "alerta" : p.valor === "referencia" ? "gold" : "neutro"}
                />
              );
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
                    <span className="block text-[11px] text-navy/55">
                      Contrato {d.texto} · previsão condicional
                    </span>
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
                    <span className="block text-[11px] text-navy/55">
                      Pagamento {d.texto} · previsão condicional
                    </span>
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
                    <span className="block text-[11px] text-navy/55">
                      Onboarding {d.texto} · previsão condicional
                    </span>
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
            chave: "sinal_prioridade",
            rotulo: ROTULO_PRIORIDADE,
            render: (l) => {
              const e = estados.get(String(l["id"]));
              const r = calcularPrioridade({
                tipo: "caso",
                id: String(l["id"]),
                elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
                prazo: (l["prazo_proxima_acao"] as string) ?? null,
                bloqueios:
                  e && e.pendentes > 0
                    ? [`${e.pendentes} requisito(s) de ativação pendente(s)`]
                    : [],
                responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
                origem: papelDoRegistro(l).valor === "demo" ? "demo" : "real",
              });
              return (
                <span className="block space-y-1">
                  <Badge
                    texto={r.rotulo}
                    tom={
                      r.sinal === "critica" ? "alerta" : r.sinal === "atencao" ? "gold" : "neutro"
                    }
                  />
                  <span className="block text-[11px] text-navy/60">
                    {r.regra} — {r.explicacao}
                  </span>
                  {r.excecoes.map((x) => (
                    <span key={x} className="block text-[11px] text-terracotta">
                      {x}
                    </span>
                  ))}
                  {r.faltantes.length ? (
                    <span className="block text-[11px] text-navy/55">
                      Dados insuficientes em: {r.faltantes.join(" · ")}
                    </span>
                  ) : null}
                  <span className="block text-[11px] text-navy/45">
                    Sinal de leitura interna. Não altera status, ativação, contrato, cobrança ou App
                    Cliente.
                  </span>
                </span>
              );
            },
          },
          {
            chave: "hipotese_elegibilidade",
            rotulo: "Hipótese de elegibilidade",
            render: (l) => (
              <span className="block space-y-1">
                <Badge
                  texto={rotulo(
                    HIPOTESE_ELEGIBILIDADE,
                    l["hipotese_elegibilidade"] || "nao_avaliada",
                  )}
                  tom="gold"
                />
                <span className="block text-[11px] text-navy/55">
                  Hipótese — não é elegibilidade definitiva
                </span>
              </span>
            ),
          },
          {
            chave: "proxima_acao",
            rotulo: "Próxima ação",
            render: (l) => {
              const falta = lacunasProximaAcao(l);
              const prazoManual = qualificarData(l["prazo_proxima_acao"]);
              // Corte A (09/09/2026) — a RPC (mesma da Ficha 360) é a fonte
              // única exibida como próxima ação principal; o campo manual e
              // seus detalhes (dependência, critério de conclusão) aparecem
              // como o registro que a alimenta quando ela mesma decide usá-lo
              // (nível 8), não como uma segunda ação concorrente.
              const rpc = estados.get(String(l["id"]))?.proximaAcaoCanonica ?? null;
              const canonica = obterProximaAcaoCanonica({
                caseId: String(l["id"]),
                rpc: rpc ? { nivel: rpc.nivel, motivo: rpc.motivo, origem_tabela: null, origem_id: null, prazo: rpc.prazo } : null,
                responsavelPrincipal: (l["proxima_acao_responsavel"] as string) ?? null,
                dependencia: (l["proxima_acao_dependencia"] as string) ?? null,
                criterioConclusao: (l["proxima_acao_criterio_conclusao"] as string) ?? null,
              });
              return (
                <span className="block space-y-1 text-xs text-navy/75">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="block text-sm font-medium text-navy">{canonica.acao}</span>
                    <span className="rounded-full border border-navy/15 bg-cream px-1.5 py-0.5 text-[10px] text-navy/60">
                      {SELO_PROXIMA_ACAO[canonica.origem]}
                    </span>
                  </span>
                  <span className="block">
                    Responsável: {canonica.responsavel || "—"}
                  </span>
                  <span className="block">
                    Prazo: {canonica.prazo ? qualificarData(canonica.prazo).texto : prazoManual.texto}
                    {prazoManual.condicional ? " · previsão condicional" : ""}
                  </span>
                  {canonica.origem === "manual" ? (
                    <>
                      <span className="block">Depende de: {canonica.dependencia || "—"}</span>
                      <span className="block">Conclui quando: {canonica.criterioConclusao || "—"}</span>
                      {falta.length ? (
                        <Badge texto={`Incompleta: falta ${falta.join(", ")}`} tom="alerta" />
                      ) : null}
                    </>
                  ) : null}
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
                      {e.motivos.length > 3 ? (
                        <li>+{e.motivos.length - 3} outros requisitos pendentes</li>
                      ) : null}
                    </ul>
                  </span>
                );
              }
              return (
                <Badge texto="Requisitos completos — ativação disponível no painel" tom="gold" />
              );
            },
          },
        ]}
        campos={[
          { chave: "titulo", rotulo: "Título", obrigatorio: true },
          {
            chave: "cliente_id",
            rotulo: "Cliente vinculado",
            tipo: "select",
            obrigatorio: true,
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
            obrigatorio: true,
            opcoes: [
              { valor: "pesquisa", rotulo: "Pesquisa genealógica" },
              { valor: "cidadania", rotulo: "Cidadania" },
              { valor: "documentacao", rotulo: "Documentação" },
              { valor: "consultoria", rotulo: "Consultoria" },
            ],
          },
          {
            chave: "situacao_financeira",
            rotulo: "Situação financeira",
            tipo: "select",
            opcoes: SITUACAO_FINANCEIRA,
          },
          {
            chave: "situacao_operacional",
            rotulo: "Situação operacional",
            tipo: "select",
            opcoes: SITUACAO_OPERACIONAL,
          },
          { chave: "prioridade", rotulo: "Prioridade", tipo: "select", opcoes: PRIORIDADES },
          { chave: "data_entrada", rotulo: "Data de entrada", tipo: "data" },
          {
            chave: "data_prevista_contrato",
            rotulo: "Contrato — previsão condicional",
            tipo: "data",
          },
          {
            chave: "data_prevista_pagamento",
            rotulo: "Pagamento — previsão condicional",
            tipo: "data",
          },
          {
            chave: "data_prevista_onboarding",
            rotulo: "Onboarding — previsão condicional",
            tipo: "data",
          },
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
          {
            chave: "proxima_acao",
            rotulo: "Próxima ação — título",
            tipo: "select",
            opcoes: PROXIMAS_ACOES,
          },
          { chave: "proxima_acao_responsavel", rotulo: "Próxima ação — responsável" },
          { chave: "prazo_proxima_acao", rotulo: "Próxima ação — prazo", tipo: "data" },
          { chave: "proxima_acao_dependencia", rotulo: "Próxima ação — dependência", tipo: "area" },
          {
            chave: "proxima_acao_criterio_conclusao",
            rotulo: "Próxima ação — critério de conclusão",
            tipo: "area",
          },
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
