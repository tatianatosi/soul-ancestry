/* eslint-disable @typescript-eslint/no-explicit-any */
import { Painel, Selo } from "@/components/comercial/base";
import { dicionarioAnexos } from "@/lib/anexos-dicionario";

/** Dicionário de anexos: por que cada anexo entra e o que muda se faltar. */
export function AnexosAplicaveis({
  valores,
  anexosGerados,
  aoVerPrevia,
}: {
  valores: any[];
  anexosGerados: { codigo: string }[];
  aoVerPrevia?: () => void;
}) {
  const pegar = (campo: string) => (valores.find((v) => v.campo === campo)?.valor as string | null) ?? null;
  const regras = dicionarioAnexos({
    produto: pegar("produto_sku"),
    paisRota: pegar("pais_rota"),
    beneficiarios: pegar("beneficiarios"),
    representacaoLegal: pegar("representacao_legal"),
    valorTotal: pegar("valor_total"),
    formaPagamento: pegar("forma_pagamento"),
  });
  const gerados = new Set(anexosGerados.map((a) => a.codigo));

  return (
    <Painel titulo="Anexos aplicáveis e por quê">
      <p className="mb-2 text-xs text-navy/60">
        Anexo não é escolhido à mão: entra por regra de produto, escopo, pessoas e condições comerciais. Faltando anexo obrigatório, a
        versão final fica bloqueada.
      </p>
      <div className="space-y-2">
        {regras.map((a) => (
          <div key={a.codigo} id={`anexo-${a.codigo}`} className="rounded-lg border border-navy/15 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy">
                {a.codigo} — {a.titulo}
              </p>
              <div className="flex items-center gap-2">
                <Selo
                  texto={a.obrigatorio ? "Obrigatório" : a.aplicavel ? "Aplicável" : "Não aplicável"}
                  tom={a.obrigatorio ? "ok" : a.aplicavel ? "alerta" : "neutro"}
                />
                <Selo texto={gerados.has(a.codigo) ? "Na prévia atual" : "Fora da prévia"} tom={gerados.has(a.codigo) ? "ok" : "alerta"} />
              </div>
            </div>
            <p className="mt-1 text-xs text-navy/70">{a.finalidade}</p>
            <p className="mt-1 text-xs text-navy/60">
              <strong>Regra de seleção:</strong> {a.regra} <span className="text-navy/50">({a.motivo})</span>
            </p>
            <p className="text-xs text-navy/60">
              <strong>Se faltar:</strong> {a.impactoAusencia}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-navy/50">Campos que alimentam:</span>
              {a.campos.map((c) => (
                <span key={c} className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] text-navy/70">
                  {c}
                </span>
              ))}
              {aoVerPrevia && (
                <button onClick={aoVerPrevia} className="rounded-full border border-navy/20 px-2 py-0.5 text-[11px] text-navy/80">
                  Ver na prévia
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Painel>
  );
}
