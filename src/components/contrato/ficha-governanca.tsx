import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import {
  REGRAS_ORIGEM,
  REGRAS_PROJECAO,
  REGRAS_VERSIONAMENTO,
  ROTULO_ORIGEM,
  type BlocoFicha,
  type EstadoBloco,
} from "@/lib/ficha-familiar";

/** Cabeçalho de cada bloco: conteúdo, origens aceitas, estado e destino permitido. */
export function CabecalhoBloco({ bloco, estado }: { bloco: BlocoFicha; estado: EstadoBloco }) {
  return (
    <div className="mb-3 rounded-lg border border-navy/10 bg-cream/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Selo texto={`Estado: ${estado.rotulo}`} tom={estado.tom} />
        <Selo texto={`Destino: ${bloco.destino}`} tom="neutro" />
      </div>
      <p className="mt-2 text-xs text-navy/70">{bloco.conteudo}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {bloco.origens.map((o) => (
          <span
            key={o}
            className="rounded-full border border-navy/20 px-2 py-0.5 text-[11px] text-navy/70"
            title={REGRAS_ORIGEM.find((r) => r.chave === o)?.tratamento}
          >
            Origem aceita: {ROTULO_ORIGEM[o]}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Painel-legenda da decisão CA-DEC-2026-08-17-02. */
export function GovernancaFicha() {
  return (
    <CaCard variante="compacto" titulo="Ficha familiar interna — origem, projeção e versionamento (CA-DEC-2026-08-17-02)">
      <p className="text-xs text-navy/70">
        Ficha única de trabalho por caso, adaptada do modelo piloto para organizar Painel de Calls, Brief de Discovery,
        transcrição, WhatsApp, Planejador, proposta e documentos. Não substitui CRM, Desk, motor contratual, pesquisa nem
        portal.
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-navy/50">
            <tr>
              <th className="py-1 pr-3 font-medium">Fonte</th>
              <th className="py-1 pr-3 font-medium">Tratamento</th>
              <th className="py-1 font-medium">Estado de entrada</th>
            </tr>
          </thead>
          <tbody className="text-navy/80">
            {REGRAS_ORIGEM.map((r) => (
              <tr key={r.chave} className="border-t border-navy/10 align-top">
                <td className="py-1.5 pr-3 font-medium">{r.fonte}</td>
                <td className="py-1.5 pr-3">{r.tratamento}</td>
                <td className="py-1.5">
                  <Selo texto={r.estadoInicial} tom={r.tom} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Regras de projeção</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-navy/70">
            {REGRAS_PROJECAO.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy/50">Versionamento</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-navy/70">
            {REGRAS_VERSIONAMENTO.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </CaCard>
  );
}
