/**
 * Lote de materialização dos Anexos II, IV e V já revisados juridicamente.
 * Mostra primeiro o que será feito (simulação) e só grava após confirmação.
 * Cria vínculo e versão; nunca reescreve conteúdo aprovado.
 */

import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import {
  ROTULO_ACAO_MATERIALIZACAO,
  resumoMaterializacao,
  type ItemPlanoMaterializacao,
} from "@/lib/anexos-materializacao";

const COR: Record<string, string> = {
  materializar: "border-gold/50 bg-gold/10 text-navy/80",
  ja_canonica: "border-navy/20 bg-cream/40 text-navy/70",
  preservado: "border-navy/25 bg-white text-navy/65",
  fora_do_lote: "border-navy/15 bg-white text-navy/50",
};

export function MaterializarRevisados({
  plano,
  ocupado,
  onVerificar,
  onMaterializar,
}: {
  plano: ItemPlanoMaterializacao[] | null;
  ocupado?: boolean;
  onVerificar: () => void;
  onMaterializar: () => void;
}) {
  const resumo = plano ? resumoMaterializacao(plano) : null;
  const nadaAMaterializar = Boolean(resumo && resumo.materializar === 0);

  return (
    <section className="rounded-lg border border-navy/15 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Anexos II, IV e V revisados</h3>
        <span className="text-[11px] text-navy/55">Revisão jurídica concluída · pendência apenas de materialização</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Vincula os anexos revisados ao caso como documento oficial versionado. Nada do texto aprovado é reescrito, instância
        já assinada ou anexada é preservada e nenhuma comunicação, cobrança ou pesquisa externa é disparada.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={ocupado}
          onClick={onVerificar}
          className="rounded border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream/50 disabled:opacity-50"
        >
          Ver o que será feito
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={onMaterializar}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Materializar no caso
        </button>
      </div>

      {nadaAMaterializar ? (
        <p className="mt-2 text-xs text-terracotta">
          Pendência: nenhum anexo revisado está aguardando materialização. Executar agora não altera nada no caso.
        </p>
      ) : null}

      {resumo && <p className="mt-2 text-xs text-navy/70">{resumo.mensagem}</p>}

      {plano && plano.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {plano.map((p) => (
            <li key={p.codigo} className={`rounded border p-2 ${COR[p.acao]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{p.titulo}</p>
                <span className="text-[10px] uppercase tracking-wide">
                  {ROTULO_ACAO_MATERIALIZACAO[p.acao]}
                  {p.proximaVersao ? ` · versão ${p.proximaVersao}` : p.versaoAtual ? ` · versão ${p.versaoAtual}` : ""}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] opacity-80">{p.motivo}</p>
            </li>
          ))}
        </ul>
      )}

      {plano && plano.length > 0 && (
        <DetalhesTecnicos titulo="Detalhes técnicos">
          <table className="min-w-[460px] text-left text-[11px]">
            <thead className="uppercase tracking-wide text-navy/45">
              <tr>
                {["annex_code", "annex_version atual", "próxima versão", "status salvo", "ação"].map((c) => (
                  <th key={c} className="py-1 pr-3 font-normal">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy/70">
              {plano.map((p) => (
                <tr key={p.codigo} className="border-t border-navy/10">
                  <td className="py-1 pr-3 font-mono">{p.codigo}</td>
                  <td className="py-1 pr-3">{p.versaoAtual ?? "—"}</td>
                  <td className="py-1 pr-3">{p.proximaVersao ?? "—"}</td>
                  <td className="py-1 pr-3">{p.statusPersistido ?? "—"}</td>
                  <td className="py-1 pr-3">{p.acao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetalhesTecnicos>
      )}
    </section>
  );
}
