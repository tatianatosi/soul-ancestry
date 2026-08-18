/* eslint-disable @typescript-eslint/no-explicit-any */
import { Painel, Selo } from "@/components/comercial/base";
import { ROTULO_ESTADO_ANEXO, dicionarioAnexos, type EstadoAnexo } from "@/lib/anexos-dicionario";

const TOM: Record<EstadoAnexo, "ok" | "alerta" | "neutro" | "erro"> = {
  nao_aplicavel: "neutro",
  aplicavel: "neutro",
  obrigatorio: "ok",
  opcional: "neutro",
  pendente: "alerta",
  em_revisao: "alerta",
  aprovado: "ok",
  substituido: "neutro",
  arquivado: "neutro",
};

/** Dicionário de anexos: por que cada anexo entra, quais instâncias gera e o que muda se faltar. */
export function AnexosAplicaveis({
  valores,
  anexosGerados,
  aoVerPrevia,
}: {
  valores: any[];
  anexosGerados: { codigo: string }[];
  aoVerPrevia?: (codigo: string) => void;
}) {
  const pegar = (campo: string) => (valores.find((v) => v.campo === campo)?.valor as string | null) ?? null;
  const regras = dicionarioAnexos({
    produto: pegar("produto_sku"),
    paisRota: pegar("pais_rota"),
    beneficiarios: pegar("beneficiarios"),
    dependentes: pegar("dependentes"),
    representacaoLegal: pegar("representacao_legal"),
    valorTotal: pegar("valor_total"),
    formaPagamento: pegar("forma_pagamento"),
    parcelas: pegar("parcelas"),
    escopoResumo: pegar("escopo_resumo"),
  });
  const gerados = new Set(anexosGerados.map((a) => a.codigo));

  return (
    <Painel titulo="Anexos aplicáveis e por quê">
      <p className="mb-2 text-xs text-navy/60">
        O modelo jurídico-base é versionado e restrito (MODELO-ESTUDO + BASE-GEN-V2). A regra de aplicabilidade seleciona os anexos, e cada
        anexo vira uma instância parametrizada deste caso — visualizar a instância nunca edita o modelo-base.
      </p>
      <div className="space-y-2">
        {regras.map((a) => (
          <div key={a.codigo} id={`anexo-${a.codigo}`} className="rounded-lg border border-navy/15 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-navy">
                {a.codigo} — {a.titulo}
              </p>
              <div className="flex items-center gap-2">
                <Selo texto={ROTULO_ESTADO_ANEXO[a.estado]} tom={TOM[a.estado]} />
                <Selo texto={gerados.has(a.codigo) ? "Na prévia atual" : "Fora da prévia"} tom={gerados.has(a.codigo) ? "ok" : "alerta"} />
              </div>
            </div>
            <p className="mt-1 text-xs text-navy/70">{a.finalidade}</p>
            <p className="mt-1 text-xs text-navy/60">
              <strong>Regra de seleção:</strong> {a.regra} <span className="text-navy/50">({a.motivo})</span>
            </p>
            <p className="text-xs text-navy/60">
              <strong>Aplicabilidade:</strong> {a.aplicabilidade}
            </p>
            <p className="text-xs text-navy/60">
              <strong>Se faltar:</strong> {a.impactoAusencia}
            </p>
            {a.pendencias.length > 0 && (
              <ul className="mt-1 list-disc pl-5 text-xs text-terracotta">
                {a.pendencias.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {a.instancias.length > 0 && (
              <div className="mt-2 rounded-md border border-navy/10 bg-cream/60 p-2">
                <p className="text-[11px] uppercase tracking-wide text-navy/50">
                  Instâncias deste caso ({a.instancias.length})
                </p>
                <ul className="mt-1 space-y-0.5">
                  {a.instancias.map((i) => (
                    <li key={i.chave} className="text-xs text-navy/75">
                      {i.titulo}
                      {i.pendencias.length > 0 && <span className="text-terracotta"> — {i.pendencias.join(" · ")}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-navy/50">Campos que alimentam:</span>
              {a.campos.map((c) => (
                <span key={c} className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] text-navy/70">
                  {c}
                </span>
              ))}
              {aoVerPrevia && (
                <button
                  onClick={() => aoVerPrevia(a.codigo)}
                  className="rounded-full border border-navy/20 px-2 py-0.5 text-[11px] text-navy/80"
                >
                  Visualizar instância na prévia
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Painel>
  );
}
