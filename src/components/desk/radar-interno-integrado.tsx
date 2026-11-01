import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { Link } from "@tanstack/react-router";

import { RadarIndividualOperacional } from "@/components/clube-ancestral-kit";
import { MatrizPrioridadesConectada } from "@/components/desk/matriz-prioridades-conectada";
import { HeatmapAderenciaPais } from "@/components/desk/heatmap-aderencia-pais";
import { Button } from "@/components/ui/button";
import { CaCard } from "@/components/ui/ca-card";
import { RadarMatrizesPrancha, type CasoSelecionadoPrancha } from "@/components/qualidade/radar-matrizes-prancha";
import { ESTADO_EIXO_LABEL, ESTADO_EIXO_TOM } from "@/lib/radar-eixos";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { carregarFichaCaso } from "@/lib/caso-ficha.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL } from "@/lib/prioridade-matriz";
import { radarInternoDoCaso } from "@/lib/radar-interno-caso";
import { listarRegistros } from "@/lib/saas.functions";

type Linha = Record<string, unknown>;

/* Traduz o estado canônico do eixo em altura do desenho. Nenhum cálculo novo. */
const NIVEL_EIXO = {
  identificado: 92,
  em_confirmacao: 62,
  proxima_etapa: 34,
} as const;


function texto(valor: unknown, vazio = "Não informado"): string {
  const normalizado = String(valor ?? "").trim();
  return normalizado || vazio;
}

function dataPtBr(valor: unknown): string {
  const iso = String(valor ?? "").slice(0, 10);
  if (!iso) return "Sem prazo definido";
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

export function RadarInternoIntegrado() {
  const listar = useServerFn(listarRegistros);
  const carregar = useServerFn(carregarFichaCaso);
  const [caseId, setCaseId] = useState("");
  const [incluirDemos, setIncluirDemos] = useState(false);

  const casosQuery = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => listar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });
  const casos = useMemo(() => (casosQuery.data ?? []) as Linha[], [casosQuery.data]);

  useEffect(() => {
    if (!caseId && casos[0]?.["id"]) setCaseId(String(casos[0]["id"]));
  }, [caseId, casos]);

  const fichaQuery = useQuery({
    queryKey: ["radar-interno", "ficha", caseId],
    queryFn: () => {
      if (!caseId) throw new Error("Selecione um caso para abrir o Radar Individual.");
      return carregar({ data: { id: caseId } });
    },
    enabled: Boolean(caseId),
    retry: false,
  });

  // Prancha V4: os MESMOS casos já carregados, posicionados pelo motor
  // (`posicionar`), com demonstrações fora por padrão — mesma regra da
  // matriz detalhada (BUG-MATRIZ-DEMO-VAZA).
  const demosNaCarteira = casos.filter((l) => papelDoRegistro(l).valor === "demo").length;
  const casosPosicionados = useMemo(
    () =>
      casos
        .filter((l) => incluirDemos || papelDoRegistro(l).valor !== "demo")
        .map((l) =>
          posicionar({
            tipo: "caso",
            id: String(l["id"]),
            rotulo: String(l["codigo"] ?? l["titulo"] ?? l["id"]),
            elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
            prazo: (l["prazo_proxima_acao"] as string) ?? null,
            diasSemTouchpoint: (l["dias_sem_touchpoint"] as number) ?? null,
            esperaExternaAtiva: Boolean(l["aguardando_instituicao_externa"]),
            responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
            origem: papelDoRegistro(l).valor === "demo" ? "demo" : "real",
          }),
        ),
    [casos, incluirDemos],
  );

  const selecionarNaMatriz = (id: string) => {
    setCaseId(id);
  };

  const ficha = fichaQuery.data;
  const caso = ficha?.caso as Linha | undefined;
  const posicao = caso
    ? posicionar({
        tipo: "caso",
        id: texto(caso["id"], ""),
        rotulo: texto(caso["codigo"] ?? caso["titulo"]),
        elegibilidade: (caso["hipotese_elegibilidade"] as string) ?? null,
        prazo: (caso["prazo_proxima_acao"] as string) ?? null,
        diasSemTouchpoint: (caso["dias_sem_touchpoint"] as number) ?? null,
        esperaExternaAtiva: Boolean(caso["aguardando_instituicao_externa"]),
        bloqueios: ficha?.bloqueiosReais?.map((b) => b.motivo) ?? [],
        responsavel: (caso["proxima_acao_responsavel"] as string) ?? null,
        origem: papelDoRegistro(caso).valor === "demo" ? "demo" : "real",
      })
    : null;

  const fracao = (feitos: number, total: number) => (total > 0 ? (feitos / total) * 100 : null);
  const opcional = (v: unknown) => {
    const t = String(v ?? "").trim();
    return t || null;
  };
  const selecionado: CasoSelecionadoPrancha | null =
    caso && ficha && posicao
      ? {
          posicao,
          situacao: opcional(caso["status"]),
          responsavel: opcional(caso["proxima_acao_responsavel"]),
          prazo: opcional(caso["prazo_proxima_acao"]),
          proximaAcao: opcional(caso["proxima_acao"] ?? caso["proxima_acao_codigo"]),
          bloqueios: ficha.bloqueiosReais.map((b) => b.motivo),
          historiaPct: fracao(
            ficha.nucleoCriterios.filter((c) => (c as { ok?: boolean }).ok).length,
            ficha.nucleoCriterios.length,
          ),
          documentosPct: fracao(
            ficha.checksAtivacao.filter((c) => c["status"] === "ok" || c["status"] === "concluido").length,
            ficha.checksAtivacao.length,
          ),
        }
      : null;

  const seletorCaso = (
    <Select value={caseId} onValueChange={setCaseId}>
      <SelectTrigger
        aria-label="Selecionar caso para o Radar Individual"
        className="h-8 rounded-full border-navy bg-navy text-xs text-cream"
      >
        <SelectValue placeholder="Selecione um caso" />
      </SelectTrigger>
      <SelectContent>
        {casos.map((item) => {
          const id = texto(item["id"], "");
          if (!id) return null;
          const demonstrativo = papelDoRegistro(item).valor === "demo";
          return (
            <SelectItem key={id} value={id}>
              Caso: {texto(item["codigo"] ?? item["titulo"] ?? id)}{demonstrativo ? " · demonstração" : ""}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  return (
    <div data-radar-interno-integrado aria-label="Modo do Radar & Matrizes">
      {/*
        19/10/2026 — composição da prancha visual V4 no topo (cabeçalho
        "Radar interno", alternador, matriz e radar individual). Tudo o que a
        tela já mostrava continua logo abaixo, em cartões de detalhe.
      */}
      <RadarMatrizesPrancha
        casos={casosPosicionados}
        carregando={casosQuery.isLoading}
        erro={casosQuery.isError}
        demosOcultos={demosNaCarteira}
        incluirDemos={incluirDemos}
        onIncluirDemos={setIncluirDemos}
        seletorCaso={seletorCaso}
        casoSelecionadoId={caseId}
        onSelecionarCaso={selecionarNaMatriz}
        selecionado={selecionado}
        carregandoSelecionado={fichaQuery.isLoading}
      />
      <p className="mt-3 text-xs text-navy/55">A seleção não altera o caso nem sua prioridade — só qual aparece no Radar Individual.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <CaCard titulo="Matriz detalhada" eyebrow="Radar & Matrizes · grade elegibilidade × urgência">
          <div data-radar-coluna-matriz>
            <MatrizPrioridadesConectada casoSelecionado={caseId} onSelecionarCaso={selecionarNaMatriz} />
          </div>
        </CaCard>

        <CaCard titulo="Radar individual — detalhe operacional" eyebrow="Radar & Matrizes · caso selecionado">
        <div data-radar-coluna-individual className="space-y-4">
        {casosQuery.isLoading || fichaQuery.isLoading ? (
          <p className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-sm text-navy/60">
            Carregando o Radar Individual…
          </p>
        ) : null}
        {casosQuery.isError || fichaQuery.isError ? (
          <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5 text-sm text-terracotta">
            O Radar Individual não pôde ser lido agora. Nenhuma informação foi inferida.
          </p>
        ) : null}
        {!casosQuery.isLoading && !casosQuery.isError && casos.length === 0 ? (
          <p className="rounded-xl border border-navy/10 bg-cream/40 p-5 text-sm text-navy/60">
            Nenhum caso ativo disponível para leitura individual.
          </p>
        ) : null}

        {caso && ficha && posicao ? (
          (() => {
            const eixos = radarInternoDoCaso({
              caso,
              nucleoCompletude: ficha.nucleoOk,
              nucleoCriterios: ficha.nucleoCriterios,
              checksAtivacao: ficha.checksAtivacao,
              bloqueiosReais: ficha.bloqueiosReais,
            });
            const idDoCaso = texto(caso["id"], "");
            return (
              <>
                <RadarIndividualOperacional
                  titulo={texto(caso["codigo"] ?? caso["titulo"])}
                  eixos={eixos.map((eixo) => ({
                    label: eixo.titulo,
                    value: NIVEL_EIXO[eixo.estado],
                  }))}
                  contexto={{
                    status: texto(caso["status"]),
                    prioridade: ROTULO_SINAL[posicao.sinal],
                    urgencia: posicao.urgencia,
                    elegibilidade: posicao.elegibilidade,
                    responsavel: texto(caso["proxima_acao_responsavel"]),
                    prazo: dataPtBr(caso["prazo_proxima_acao"]),
                    proximaAcao: texto(caso["proxima_acao"] ?? caso["proxima_acao_codigo"]),
                    bloqueios: ficha.bloqueiosReais.length
                      ? ficha.bloqueiosReais.map((b) => b.motivo).join(" · ")
                      : "Nenhum bloqueio registrado",
                  }}
                  actions={
                    idDoCaso ? (
                      <>
                        <Button asChild size="sm" data-radar-abrir-proxima-acao>
                          <Link
                            to="/casos/$caseId"
                            params={{ caseId: idDoCaso }}
                            hash="proxima-acao"
                          >
                            Abrir próxima ação
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/casos/$caseId" params={{ caseId: idDoCaso }} hash="secao-visao">
                            Abrir Caso 360
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link to="/casos/$caseId" params={{ caseId: idDoCaso }} hash="secao-jornada">
                            Ver jornada e ações
                          </Link>
                        </Button>
                      </>
                    ) : null
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {eixos.map((eixo) => (
                    <article key={eixo.id} className="rounded-lg border border-navy/10 bg-cream/50 p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-serif text-sm text-navy">{eixo.titulo}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${ESTADO_EIXO_TOM[eixo.estado]}`}>
                          {ESTADO_EIXO_LABEL[eixo.estado]}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-navy/55">{eixo.resumo}</p>
                      {eixo.itens.length > 0 ? (
                        <dl className="mt-2 space-y-1">
                          {eixo.itens.map((item) => (
                            <div key={item.rotulo} className="flex justify-between gap-2 text-xs text-navy/70">
                              <dt className="text-navy/50">{item.rotulo}</dt>
                              <dd className="text-right font-medium text-navy">{item.valor}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p className="mt-2 text-xs text-navy/50">{eixo.mensagemVazio}</p>
                      )}
                    </article>
                  ))}
                </div>
                <HeatmapAderenciaPais caseId={idDoCaso} />
              </>
            );
          })()
        ) : null}
        </div>
        </CaCard>
      </div>
    </div>
  );
}