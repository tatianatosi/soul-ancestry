/**
 * Bloco "Teto de despesas do produto-pai" (Corte C, 31/10/2026).
 *
 * Somente leitura. O teto vem das planilhas de produtos-pai já importadas
 * (`price_catalog_rescued`), é por país e não por item; o sistema não reparte
 * esse valor entre os itens do checklist.
 */
import type { ResultadoTeto } from "@/lib/teto-despesas-produto-pai";

function brl(valor: number, moeda: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(valor);
  } catch {
    return `${valor.toFixed(2)} ${moeda}`;
  }
}

const ROTULO_ORIGEM = {
  linha_prioritaria: "linha prioritária do caso",
  pais: "país do caso",
  contexto_pesquisa: "contexto da pesquisa",
} as const;

export function TetoDespesasProdutoPai({ teto }: { teto: ResultadoTeto }) {
  return (
    <div data-teto-despesas-produto-pai={teto.estado} className="space-y-0.5 text-[11px]">
      <p className="font-semibold text-navy">Teto de despesas do produto-pai</p>

      {teto.estado === "sem_pais" ? (
        <p className="text-terracotta">
          O país do caso não está identificado (linha prioritária, país e contexto da pesquisa
          vazios ou multipaís). Defina o país do caso para ver o teto.
        </p>
      ) : null}

      {teto.estado === "sem_teto" ? (
        <p className="text-terracotta">
          Não há teto de despesas vigente no catálogo de produtos-pai para {teto.iso} (país vindo da{" "}
          {ROTULO_ORIGEM[teto.origemPais]}). Nenhum custo por item é estimado sem fonte.
        </p>
      ) : null}

      {teto.estado === "ambiguo" ? <p className="text-terracotta">{teto.motivo}</p> : null}

      {teto.estado === "ok" ? (
        <>
          <p className="text-navy/75">
            {teto.iso} · despesas{" "}
            {teto.tetoDespesas === null ? "sem valor" : brl(teto.tetoDespesas, teto.moeda)} · taxas{" "}
            {teto.tetoTaxas === null ? "sem valor" : brl(teto.tetoTaxas, teto.moeda)} · teto total{" "}
            <strong>{brl(teto.tetoTotal, teto.moeda)}</strong>
          </p>
          <p className="text-navy/75">
            Aprovado com custo informado: {brl(teto.aprovadoComCusto, teto.moeda)} (
            {teto.itensAprovadosComCusto} {teto.itensAprovadosComCusto === 1 ? "item" : "itens"}) ·{" "}
            {teto.excedido ? (
              <strong className="text-terracotta">
                teto excedido em {brl(-teto.saldo, teto.moeda)}
              </strong>
            ) : (
              <>
                saldo <strong>{brl(teto.saldo, teto.moeda)}</strong>
              </>
            )}
          </p>
          <p className="text-navy/75">
            {teto.esperamCusto} {teto.esperamCusto === 1 ? "item espera" : "itens esperam"} custo
            estimado
          </p>
          {teto.aprovadosSemCusto > 0 ? (
            <p className="text-terracotta">
              {teto.aprovadosSemCusto}{" "}
              {teto.aprovadosSemCusto === 1 ? "item aprovado está" : "itens aprovados estão"} sem
              custo informado e não entram na soma.
            </p>
          ) : null}
          {teto.aprovadosOutraMoeda > 0 ? (
            <p className="text-terracotta">
              {teto.aprovadosOutraMoeda}{" "}
              {teto.aprovadosOutraMoeda === 1 ? "item aprovado tem" : "itens aprovados têm"} custo
              em outra moeda (ou sem moeda) e não entram na soma.
            </p>
          ) : null}
        </>
      ) : null}

      <p className="text-navy/50">
        O teto vem das planilhas de produtos-pai já importadas e vale por país, não por item: o
        sistema não reparte esse valor entre os itens do checklist.
      </p>
    </div>
  );
}
