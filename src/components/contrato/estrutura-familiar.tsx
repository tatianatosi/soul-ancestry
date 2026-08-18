import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Painel } from "@/components/comercial/base";
import { ESTRUTURA_FAMILIAR } from "@/lib/decisoes-operacionais";
import { conferirEstruturaFamiliar } from "@/lib/nucleo-familiar.functions";

/**
 * Explica, dentro da preparação contratual, por que existe um único caso, três
 * cadastros de CRM, um contrato-base familiar e três anexos individuais.
 * Somente leitura: não cria, altera nem vincula entidade alguma.
 */
export function EstruturaFamiliar({ codigoCaso }: { codigoCaso?: string | null }) {
  const doCaso = !codigoCaso || codigoCaso === ESTRUTURA_FAMILIAR.caso;
  if (!doCaso) return null;

  return (
    <Painel titulo="Estrutura familiar do caso (CA-DEC-2026-08-17-01)">
      <div className="grid gap-3 text-sm text-navy/80 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Como o caso é modelado</p>
          <ul className="mt-1 space-y-1">
            <li>
              <strong>Um caso familiar:</strong> {ESTRUTURA_FAMILIAR.caso}
            </li>
            <li>
              <strong>Um núcleo:</strong> {ESTRUTURA_FAMILIAR.nucleo}
            </li>
            <li>
              <strong>Três registros de CRM:</strong> {ESTRUTURA_FAMILIAR.crm.join(", ")} — sem duplicidade
            </li>
            <li>
              <strong>Um contrato-base familiar:</strong> {ESTRUTURA_FAMILIAR.contrato}
            </li>
            <li>
              <strong>Signatários adultos:</strong> {ESTRUTURA_FAMILIAR.signatarios.join(", ")}
            </li>
            {ESTRUTURA_FAMILIAR.dependentes.map((d) => (
              <li key={d.nome}>
                <strong>{d.nome}:</strong> {d.vinculo}. {d.regra}
              </li>
            ))}
            <li>
              <strong>Dossiê:</strong> {ESTRUTURA_FAMILIAR.dossie}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Anexos por quê</p>
          <ul className="mt-1 space-y-1">
            <li>
              <strong>Estruturais:</strong> {ESTRUTURA_FAMILIAR.anexosEstruturais.join(", ")} — um por núcleo
            </li>
            {ESTRUTURA_FAMILIAR.anexosIndividuais.map((a) => (
              <li key={a.instancia}>
                <strong>{a.instancia}:</strong> {a.motivo}
              </li>
            ))}
            <li>
              <strong>{ESTRUTURA_FAMILIAR.anexoCondicional.codigo}:</strong> {ESTRUTURA_FAMILIAR.anexoCondicional.regra}
            </li>
          </ul>
          <p className="mt-2 text-xs text-navy/60">
            Financeiro: {ESTRUTURA_FAMILIAR.financeiro}. Portal: {ESTRUTURA_FAMILIAR.portal}. Esta seção é explicativa — não cria
            caso, contrato, cobrança, assinatura, portal nem pesquisa externa.
          </p>
        </div>
      </div>
    </Painel>
  );
}
