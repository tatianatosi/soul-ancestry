/**
 * Conteúdo salvo de um anexo — é isto que está sendo aprovado.
 *
 * Extraído de `instancia-documental.tsx` em 04/10/2026: a Proprietária pediu
 * para tirar as auditorias repetidas das abas, e o conteúdo do anexo precisa
 * ficar no FLUXO (cartão de anexos), não só no bloco de auditoria recolhido.
 * Um componente, dois lugares, nenhuma segunda renderização divergente.
 */

import type { ConteudoAnexoSalvo } from "@/lib/anexos-conteudo";

/**
 * Conteúdo salvo do anexo — é isto que está sendo aprovado. Renderizado a
 * partir de `structured_data`, nunca injetando o HTML gravado no banco.
 */
export function ConteudoSalvoDoAnexo({ codigo, conteudo }: { codigo: string; conteudo: ConteudoAnexoSalvo }) {
  return (
    <details className="mt-1 rounded border border-navy/10 bg-cream/60 p-2" data-conteudo-anexo={codigo}>
      <summary className="cursor-pointer text-[11px] font-medium text-navy/70">Ver o conteúdo salvo deste anexo</summary>
      {conteudo.finalidade && <p className="mt-1 text-[11px] text-navy/70">{conteudo.finalidade}</p>}
      {conteudo.motivo && <p className="mt-0.5 text-[11px] text-navy/55">Motivo da seleção: {conteudo.motivo}</p>}
      {conteudo.overrideManual && (
        <p className="mt-1 rounded border border-terracotta/30 bg-terracotta/5 p-1.5 text-[11px] text-navy/75">
          Dispensa manual registrada por decisão humana.
        </p>
      )}
      {conteudo.campos.length > 0 ? (
        <dl className="mt-1.5 divide-y divide-navy/5 rounded border border-navy/10 bg-cream/40">
          {conteudo.campos.map((c, i) => (
            <div key={`${c.rotulo}-${i}`} className="grid gap-0.5 p-2 sm:grid-cols-[200px_1fr]">
              <dt className="text-[11px] text-navy/50">
                {c.rotulo}
                {c.fonte && <span className="block text-[10px] text-navy/35">{c.fonte}</span>}
              </dt>
              <dd className="text-[11px] text-navy/80">
                {c.valor ?? (
                  <span className="text-terracotta">{c.observacaoAusencia ?? "Pendente — não inferido."}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-1.5 text-[11px] text-navy/55">
          Esta instância não tem campos gravados — só a regra de aplicabilidade. Materialize o anexo depois de
          preencher a ficha do caso para o conteúdo aparecer aqui.
        </p>
      )}
      {conteudo.pendencias.length > 0 && (
        <ul className="mt-1.5 space-y-0.5 text-[11px] text-terracotta">
          {conteudo.pendencias.map((x) => (
            <li key={x}>• {x}</li>
          ))}
        </ul>
      )}
      {conteudo.impactoAusencia && (
        <p className="mt-1 text-[11px] text-navy/50">Impacto da ausência: {conteudo.impactoAusencia}</p>
      )}
    </details>
  );
}

