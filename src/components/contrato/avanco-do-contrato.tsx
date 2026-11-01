import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { avancosDoContrato } from "@/lib/avanco-contrato";
import type { PassoContrato } from "@/lib/contrato-prontidao";

/**
 * "O que posso fazer agora e o que falta" para cada ato de avanço do contrato.
 * Leitura pura da regra de `estados-edicao.ts`: salvar rascunho nunca fica
 * bloqueado; só aprovar, congelar a prévia final e solicitar a assinatura
 * dependem das pendências. Nada é executado aqui.
 */
export function AvancoDoContrato({ passos, papel }: { passos: PassoContrato[]; papel: string }) {
  const linhas = avancosDoContrato(passos, papel);
  return (
    <CaCard variante="compacto" titulo="Edição × avanço do contrato" data-avanco-contrato>
      <p className="text-xs text-navy/60">
        Salvar rascunho segue liberado. Os atos abaixo são de avanço e respeitam as pendências do
        caso. A assinatura é ato externo e fica sempre depois.
      </p>
      <ul className="mt-3 space-y-3">
        {linhas.map((l) => (
          <li
            key={l.operacao}
            data-avanco-operacao={l.operacao}
            className="rounded-lg border border-navy/10 bg-cream/40 p-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-navy">{l.rotulo}</span>
              <Selo
                texto={
                  l.decisao.permitido
                    ? l.decisao.exigeConfirmacao
                      ? "Liberado, com confirmação"
                      : "Liberado"
                    : "Bloqueado"
                }
                tom={l.decisao.permitido ? "ok" : "alerta"}
              />
            </div>
            <p className="mt-1 text-navy/70">{l.decisao.mensagem}</p>
            {(l.decisao.pendencias?.length ?? 0) > 0 ? (
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-navy/60">
                {l.decisao.pendencias!.map((p) => (
                  <li key={p.campo}>
                    {p.campo}: {p.proximaAcao}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </CaCard>
  );
}
