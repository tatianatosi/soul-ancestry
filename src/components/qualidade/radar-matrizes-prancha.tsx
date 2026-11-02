/**
 * Radar & Matrizes — composição da prancha visual V4 (19/10/2026).
 *
 * "Casca que dura pra sempre": todo bloco da prancha existe na tela, mesmo
 * sem registro. Sem dado, o gráfico do kit desenha o próprio estado vazio
 * (MatrizQuadrantes / RadarEixos) — nunca um número inventado.
 *
 * Componente só de apresentação: recebe os casos já posicionados por
 * `posicionar` (matriz-posicionamento.ts) e a ficha do caso selecionado
 * (carregarFichaCaso), ambos lidos por RadarInternoIntegrado. Nenhuma
 * consulta nova aqui.
 *
 * Fontes dos números:
 *  - Matriz: x = hipótese de elegibilidade, y = faixa de urgência — as mesmas
 *    escalas de desenho da matriz detalhada (matriz-prioridades-conectada).
 *  - Radar: História familiar = critérios de núcleo atendidos / avaliados;
 *    Documentos = requisitos de ativação confirmados / registrados.
 *    Estratégia e Próximos passos não têm medida percentual registrada → null.
 */
import { useState, type ReactNode } from "react";

import {
  Cartao,
  Etiqueta,
  Linha,
  MatrizQuadrantes,
  RadarEixos,
  type Tom,
} from "@/components/prancha-v4/kit";
import {
  ESCALA_ELEGIBILIDADE,
  ESCALA_URGENCIA,
  PESO_SINAL,
} from "@/components/desk/matriz-prioridades-conectada";
import {
  ROTULO_ELEGIBILIDADE,
  ROTULO_URGENCIA,
  semPosicaoConfiavel,
  type CasoPosicionado,
} from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL, type SinalPrioridade } from "@/lib/prioridade-matriz";
import { cn } from "@/lib/utils";

const TOM_SINAL: Record<SinalPrioridade, Tom> = {
  critica: "critico",
  atencao: "atencao",
  acompanhada: "sucesso",
  sem_dados: "neutro",
};

const TOM_URGENCIA: Record<CasoPosicionado["urgencia"], Tom> = {
  vencida: "critico",
  aproximando: "atencao",
  em_dia: "sucesso",
  sem_base: "neutro",
};

/** Quadrantes na ordem do kit: sup.-esq., sup.-dir., inf.-esq., inf.-dir. */
const QUADRANTES: [string, string, string, string] = [
  "Avaliar",
  "Agir agora",
  "Monitorar",
  "Cultivar",
];

export type CasoSelecionadoPrancha = {
  posicao: CasoPosicionado;
  situacao: string | null;
  responsavel: string | null;
  prazo: string | null;
  proximaAcao: string | null;
  bloqueios: string[];
  /** Proporção 0–100 de critérios de núcleo atendidos; null sem critério avaliado. */
  historiaPct: number | null;
  /** Proporção 0–100 de requisitos de ativação confirmados; null sem requisito registrado. */
  documentosPct: number | null;
};

/** Ordem de atendimento: mesma ordenação da matriz detalhada (sinal → urgência → elegibilidade). */
function ordenarAtendimento(casos: readonly CasoPosicionado[]): CasoPosicionado[] {
  return [...casos].sort(
    (a, b) =>
      PESO_SINAL[a.sinal] - PESO_SINAL[b.sinal] ||
      ESCALA_URGENCIA[b.urgencia] - ESCALA_URGENCIA[a.urgencia] ||
      ESCALA_ELEGIBILIDADE[b.elegibilidade] - ESCALA_ELEGIBILIDADE[a.elegibilidade],
  );
}

/**
 * Coordenadas de desenho. Casos na mesma célula categórica recebem um
 * pequeno deslocamento visual (não é dado) para os rótulos não se cobrirem.
 */
function pontosDaMatriz(casos: readonly CasoPosicionado[]) {
  const porCelula = new Map<string, number>();
  const usados = new Map<string, number>();
  return casos.map((c) => {
    const chave = `${c.elegibilidade}|${c.urgencia}`;
    const k = porCelula.get(chave) ?? 0;
    porCelula.set(chave, k + 1);
    const repeticoes = usados.get(c.rotulo) ?? 0;
    usados.set(c.rotulo, repeticoes + 1);
    const rotulo = repeticoes ? `${c.rotulo} (${repeticoes + 1})` : c.rotulo;
    return {
      id: c.id,
      rotulo,
      x: ESCALA_ELEGIBILIDADE[c.elegibilidade] / 100 + ((k % 3) - 1) * 0.05,
      y: ESCALA_URGENCIA[c.urgencia] / 100 - Math.floor(k / 3) * 0.06,
      tom: TOM_SINAL[c.sinal],
    };
  });
}

function dataCurta(iso: string | null): string | null {
  const v = String(iso ?? "").slice(0, 10);
  const [a, m, d] = v.split("-");
  return a && m && d ? `${d}/${m}/${a}` : null;
}

export function RadarMatrizesPrancha({
  casos,
  carregando,
  erro,
  demosOcultos,
  incluirDemos,
  onIncluirDemos,
  seletorCaso,
  casoSelecionadoId,
  onSelecionarCaso,
  selecionado,
  carregandoSelecionado,
}: {
  /** Casos já posicionados (sem demonstração, salvo quando o filtro inclui). */
  casos: readonly CasoPosicionado[];
  carregando: boolean;
  erro: boolean;
  demosOcultos: number;
  incluirDemos: boolean;
  onIncluirDemos: (v: boolean) => void;
  seletorCaso: ReactNode;
  casoSelecionadoId: string;
  onSelecionarCaso: (id: string) => void;
  selecionado: CasoSelecionadoPrancha | null;
  carregandoSelecionado: boolean;
}) {
  const [modo, setModo] = useState<"matriz" | "radar">("matriz");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const semPosicao = semPosicaoConfiavel(casos);
  const idsSemPosicao = new Set(semPosicao.map((c) => c.id));
  const posicionaveis = casos.filter((c) => !idsSemPosicao.has(c.id));
  const pontos = erro ? [] : pontosDaMatriz(posicionaveis);
  const ordem = ordenarAtendimento(posicionaveis).slice(0, 3);

  const selecionarPontoDaMatriz = (id: string) => {
    onSelecionarCaso(id);
    setModo("radar");
  };

  const p = selecionado?.posicao ?? null;
  const prazo = dataCurta(selecionado?.prazo ?? null);

  return (
    <div data-radar-prancha-v4 className="space-y-4">
      <Cartao
        titulo="Radar interno"
        data-radar-prancha-cabecalho
        acao={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              aria-expanded={filtrosAbertos}
              onClick={() => setFiltrosAbertos((v) => !v)}
              className="rounded-full border border-navy/15 bg-card px-3 py-1 text-xs text-navy/70 hover:bg-cream"
              data-radar-prancha-filtros
            >
              Filtros
            </button>
            <div className="min-w-[12rem]">{seletorCaso}</div>
          </div>
        }
      >
        <p className="text-xs text-navy/60">
          Uma única tela com duas leituras: matriz geral de prioridade e radar individual do caso
          selecionado
        </p>
        {filtrosAbertos ? (
          <div className="mt-3 rounded-lg border border-navy/10 bg-cream/50 p-3 text-xs text-navy/75">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={incluirDemos}
                onChange={(e) => onIncluirDemos(e.target.checked)}
              />
              Incluir demonstrações na matriz
              {demosOcultos > 0 && !incluirDemos
                ? ` (${demosOcultos} oculta${demosOcultos > 1 ? "s" : ""})`
                : ""}
            </label>
          </div>
        ) : null}
      </Cartao>

      <div role="group" aria-label="Leitura do Radar & Matrizes" className="flex flex-wrap gap-2">
        {(
          [
            ["matriz", "Matriz de prioridade"],
            ["radar", "Radar individual"],
          ] as const
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            aria-pressed={modo === id}
            onClick={() => setModo(id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              modo === id
                ? "border-navy bg-navy text-cream"
                : "border-navy/15 bg-card text-navy/60",
            )}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao
          titulo="Matriz elegibilidade × prioridade"
          className={cn(modo !== "matriz" && "hidden lg:block")}
          data-radar-prancha-matriz
        >
          {carregando ? <p className="mb-2 text-xs text-navy/50">Carregando carteira…</p> : null}
          {erro ? (
            <p className="mb-2 text-xs text-terracotta">
              A carteira não pôde ser lida agora — a matriz fica vazia por falha de leitura, não por
              ausência de casos.
            </p>
          ) : null}
          <div className="[&_button[title]]:cursor-pointer">
            <MatrizQuadrantes
              pontos={pontos}
              quadrantes={QUADRANTES}
              eixoX="Elegibilidade"
              eixoY="Urgência"
              tituloAcessivel="Matriz de elegibilidade por urgência dos casos ativos"
              onPontoSelecionar={selecionarPontoDaMatriz}
            />
          </div>
          <div className="mt-4 border-t border-navy/10 pt-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-widest text-navy/55">
                Ordem de atendimento
              </p>
              <div className="flex flex-wrap gap-1">
                <Etiqueta texto="Crítico" tom="critico" />
                <Etiqueta texto="Atenção" tom="atencao" />
                <Etiqueta texto="Saudável" tom="sucesso" />
              </div>
            </div>
            {ordem.length ? (
              <ol className="mt-2 space-y-1 text-sm text-navy" data-radar-prancha-ordem>
                {ordem.map((c, i) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelecionarCaso(c.id);
                        setModo("radar");
                      }}
                      className={cn(
                        "text-left hover:underline",
                        c.id === casoSelecionadoId && "font-semibold",
                      )}
                    >
                      {i + 1}. {c.rotulo}
                    </button>{" "}
                    <Etiqueta texto={ROTULO_SINAL[c.sinal]} tom={TOM_SINAL[c.sinal]} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-navy/50">Sem caso posicionado com confiança ainda.</p>
            )}
            {semPosicao.length ? (
              <p className="mt-2 text-[11px] text-navy/55">
                {semPosicao.length} caso{semPosicao.length > 1 ? "s" : ""} sem posição confiável
                (sem prazo ou sem dados suficientes) — listado{semPosicao.length > 1 ? "s" : ""} na
                matriz detalhada abaixo.
              </p>
            ) : null}
          </div>
          <p className="mt-3 border-t border-navy/10 pt-3 text-xs text-navy/55">
            Clicar em um caso da matriz seleciona o mesmo caso no radar individual ao lado.
          </p>
        </Cartao>

        <Cartao
          titulo="Radar individual — caso selecionado"
          className={cn(modo !== "radar" && "hidden lg:block")}
          data-radar-prancha-individual
        >
          {carregandoSelecionado ? (
            <p className="mb-2 text-xs text-navy/50">Carregando o caso…</p>
          ) : null}
          <RadarEixos
            tituloAcessivel="Radar individual do caso selecionado em quatro eixos"
            eixos={[
              { rotulo: "História familiar", valor: selecionado?.historiaPct ?? null },
              { rotulo: "Documentos", valor: selecionado?.documentosPct ?? null },
              { rotulo: "Estratégia", valor: null },
              { rotulo: "Próximos passos", valor: null },
            ]}
          />
          <p className="mt-1 text-center text-[10px] text-navy/45">
            Estratégia e Próximos passos não têm medida percentual registrada — o estado de cada
            eixo aparece no detalhe abaixo.
          </p>
          <div className="mt-3 border-t border-navy/10 pt-2">
            <Linha rotulo="Situação" valor={selecionado?.situacao ?? "—"} />
            <Linha
              rotulo="Prioridade"
              valor={p ? ROTULO_SINAL[p.sinal] : "—"}
              tom={p ? TOM_SINAL[p.sinal] : "neutro"}
            />
            <Linha
              rotulo="Urgência"
              valor={p ? `${ROTULO_URGENCIA[p.urgencia]}${prazo ? ` · prazo ${prazo}` : ""}` : "—"}
              tom={p ? TOM_URGENCIA[p.urgencia] : "neutro"}
            />
            <Linha rotulo="Elegibilidade" valor={p ? ROTULO_ELEGIBILIDADE[p.elegibilidade] : "—"} />
            <Linha rotulo="Responsável" valor={selecionado?.responsavel ?? "—"} />
          </div>
          <div
            className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3"
            data-radar-prancha-proxima-acao
          >
            <p className="text-[10px] font-medium uppercase tracking-widest text-navy/60">
              Próxima ação
            </p>
            <p className="mt-1 text-sm text-navy">
              {selecionado?.proximaAcao ?? "Sem próxima ação registrada"}
              {selecionado?.proximaAcao && prazo ? ` · prazo ${prazo}` : ""}
            </p>
            <p className="mt-1 text-xs text-navy/60">
              {selecionado
                ? selecionado.bloqueios.length
                  ? `Bloqueio: ${selecionado.bloqueios.join(" · ")}`
                  : "Nenhum bloqueio registrado"
                : "Selecione um caso para ver bloqueios"}
            </p>
          </div>
          <p className="mt-3 border-t border-navy/10 pt-3 text-xs text-navy/55">
            Leitura interna em quatro eixos. O App Cliente usa seis dimensões publicáveis; as duas
            taxonomias não são equivalentes.
          </p>
        </Cartao>
      </div>
    </div>
  );
}
