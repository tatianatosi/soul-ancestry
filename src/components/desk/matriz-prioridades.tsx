import { Link } from "@tanstack/react-router";

import { ROTULO_SINAL, type EixoElegibilidade } from "@/lib/prioridade-matriz";
import {
  ELEGIBILIDADE_ORDEM,
  montarMatriz,
  semPosicaoConfiavel,
  type CasoPosicionado,
} from "@/lib/matriz-posicionamento";

const ROTULO_ELEGIBILIDADE: Record<EixoElegibilidade, string> = {
  forte: "Forte",
  provavel: "Provável",
  possivel_com_pesquisa: "Possível com pesquisa",
  baixa: "Baixa",
  inconclusiva: "Inconclusiva",
  nao_avaliada: "Não avaliada",
};

const ROTULO_FAIXA: Record<string, string> = {
  vencida: "Vencida",
  aproximando: "Aproximando",
  em_dia: "Em dia",
  sem_base: "Sem base",
};

/** Tom da célula pela faixa de urgência. Uma matiz, mais quente para cima. */
const TOM_FAIXA: Record<string, string> = {
  vencida: "bg-terracotta/10 border-terracotta/30",
  aproximando: "bg-gold/10 border-gold/40",
  em_dia: "bg-white border-navy/15",
  sem_base: "bg-navy/[0.03] border-navy/10",
};

/**
 * Matriz Elegibilidade × Urgência — o posicionamento de cada caso na carteira.
 *
 * O motor (`prioridade-matriz.ts`) existia desde o P1.2 e era consumido só como
 * etiqueta numa coluna de tabela. Aqui ele finalmente vira matriz: cada caso
 * ocupa uma coordenada, e a posição carrega a regra que a decidiu.
 *
 * Nada é recalculado nesta tela, e nada daqui é projetado ao App Cliente.
 */
export function MatrizPrioridades({ casos }: { casos: readonly CasoPosicionado[] }) {
  const grade = montarMatriz(casos);
  const semPosicao = semPosicaoConfiavel(casos);

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Matriz de prioridades</h2>
        <p className="text-xs text-navy/55">
          {casos.length} caso(s) · elegibilidade (colunas) × urgência (linhas)
        </p>
      </div>
      <p className="mt-1 text-[11px] text-navy/45">
        A posição é a decisão do motor de prioridade, não um cálculo desta tela. Nenhum campo daqui
        chega ao App Cliente.
      </p>

      {!casos.length ? (
        <p className="mt-4 text-sm text-navy/55">
          Nenhum caso com dado suficiente para posicionar. A matriz não inventa coordenada.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-left">
            <thead>
              <tr>
                <th className="w-24 text-[10px] uppercase tracking-wide text-navy/45">Urgência</th>
                {ELEGIBILIDADE_ORDEM.map((e) => (
                  <th key={e} className="text-[10px] uppercase tracking-wide text-navy/45">
                    {ROTULO_ELEGIBILIDADE[e]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grade.map((linha) => (
                <tr key={linha[0].urgencia}>
                  <th className="align-top text-[11px] font-medium text-navy/70">
                    {ROTULO_FAIXA[linha[0].urgencia]}
                  </th>
                  {linha.map((celula) => (
                    <td
                      key={`${celula.urgencia}-${celula.elegibilidade}`}
                      className={`min-w-[110px] rounded-lg border p-2 align-top ${TOM_FAIXA[celula.urgencia]}`}
                    >
                      {/* Célula vazia continua existindo: o vazio de um
                          quadrante diz que não há ninguém ali. */}
                      {!celula.casos.length ? (
                        <span className="text-[11px] text-navy/25">—</span>
                      ) : (
                        <ul className="space-y-1">
                          {celula.casos.map((c) => (
                            <li key={c.id}>
                              <Link
                                to="/casos/$caseId"
                                params={{ caseId: c.id }}
                                title={`${ROTULO_SINAL[c.sinal]} · ${c.regra} — ${c.porque}`}
                                className="block truncate text-[12px] text-navy underline-offset-2 hover:underline"
                              >
                                {c.rotulo}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {semPosicao.length ? (
        <p className="mt-3 text-[11px] text-navy/50">
          {semPosicao.length} caso(s) sem posição confiável — falta prazo, cadência ou hipótese de
          elegibilidade registrada. Eles aparecem na coluna/linha correspondente ao que falta, nunca
          empurrados para um quadrante melhor.
        </p>
      ) : null}
    </section>
  );
}
