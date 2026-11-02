import { CaCard } from "@/components/ui/ca-card";
import { Selo } from "@/components/comercial/base";
import {
  CLASSIFICACOES,
  INVENTARIO_FONTES,
  ROTULO_CLASSIFICACAO,
  fontesNaoClassificadas,
  fontesProibidasNoCliente,
  totaisPorClassificacao,
  visivelParaCliente,
  type FonteClassificada,
} from "@/lib/classificacao-dados";

/**
 * Origem dos dados fixos do código (Desk, só leitura).
 *
 * Mostra a classificação de cada fonte estática (`src/data`) e a regra única do App:
 * só dado `real` chega ao cliente. Não apaga, move nem promove nada; só declara.
 * Porteiro religado em 01/11/2026 (`classificacao-dados.ts` não tinha chamador).
 */
export function OrigemDosDados({
  inventario = INVENTARIO_FONTES,
}: {
  inventario?: readonly FonteClassificada[];
}) {
  const totais = totaisPorClassificacao(inventario);
  const proibidas = fontesProibidasNoCliente(inventario);
  const semProva = fontesNaoClassificadas(inventario);

  return (
    <CaCard titulo="Origem dos dados fixos" eyebrow="Qualidade · só leitura" className="mb-4">
      <p className="text-xs text-navy/60">
        Só registro classificado como <strong>real</strong> chega ao App Cliente. As fontes abaixo são dados
        fixos do código: aparecem aqui rotuladas e nunca são promovidas a real por omissão.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Totais por classificação">
        {CLASSIFICACOES.map((c) => (
          <li key={c}>
            <Selo
              texto={`${ROTULO_CLASSIFICACAO[c]}: ${totais[c]}`}
              tom={c === "real" ? "ok" : c === "nao_classificado" && totais[c] > 0 ? "alerta" : "neutro"}
            />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-navy/80" role="status">
        {proibidas.length === 0
          ? "Nenhuma fonte fixa não-real está ligada ao App Cliente."
          : `${proibidas.length} fonte(s) não-real aparecem na superfície do App Cliente: revisar antes de publicar.`}
        {semProva.length > 0 ? ` ${semProva.length} fonte(s) sem prova de origem.` : ""}
      </p>
      {inventario.length === 0 ? (
        <p className="mt-3 text-xs text-navy/60">Nenhuma fonte fixa registrada.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-navy/50">
                <th className="py-1 pr-3 font-medium">Fonte</th>
                <th className="py-1 pr-3 font-medium">Classificação</th>
                <th className="py-1 pr-3 font-medium">Superfícies</th>
                <th className="py-1 font-medium">Prova</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((f) => (
                <tr key={f.modulo} className="border-t border-navy/5 align-top">
                  <td className="py-1.5 pr-3">
                    <code className="text-navy">{f.modulo}</code>
                    <div className="text-navy/60">{f.descricao}</div>
                  </td>
                  <td className="py-1.5 pr-3">
                    <Selo
                      texto={ROTULO_CLASSIFICACAO[f.classificacao]}
                      tom={visivelParaCliente(f.classificacao) ? "ok" : "neutro"}
                    />
                  </td>
                  <td className="py-1.5 pr-3 text-navy/70">{f.superficies.join(", ")}</td>
                  <td className="py-1.5 text-navy/70">{f.prova.trim() || "Sem prova registrada"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CaCard>
  );
}
