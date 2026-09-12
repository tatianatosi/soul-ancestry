/**
 * Faixa transversal do App Cliente: etapa, D0–D365, próxima ação e
 * microentrega publicada — montada com o kit visual (Pantone aprovado).
 *
 * Tudo vem de dado real já sanitizado (`portal_projecoes` / `portal_casos`).
 * Nada é estimado: sem dado, cada bloco mostra estado explícito, e nenhum
 * alerta interno, gate, SLA ou responsável técnico aparece aqui.
 */
import {
  KitCard,
  KitBadge,
  JourneyProgress,
  MicrodeliveryCard,
  NextActionCard,
} from "@/components/clube-ancestral-kit";
import { faixaD0D365 } from "@/lib/portal-jornada-d0d365";
import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

export function FaixaD0D365({
  etapa,
  inicioEm,
  proximaAcao,
  microentrega,
}: {
  etapa: string;
  inicioEm?: string | null;
  proximaAcao: string;
  microentrega?: PublicacaoCliente | null;
}) {
  const faixa = faixaD0D365(inicioEm);
  return (
    <div className="grid gap-3 lg:grid-cols-3" data-faixa-d0-d365>
      <KitCard
        eyebrow="Etapa atual"
        title={etapa}
        action={<KitBadge tone="gold">{faixa.rotulo}</KitBadge>}
      >
        {faixa.percentual === null ? (
          <p className="text-xs" style={{ color: "rgba(47,75,110,.62)" }}>
            A contagem começa quando a equipe registra o início do acompanhamento.
          </p>
        ) : (
          <JourneyProgress label="Tempo de acompanhamento" value={faixa.percentual} />
        )}
      </KitCard>

      <NextActionCard action={proximaAcao} owner="Equipe Clube Ancestral" />

      {microentrega ? (
        <MicrodeliveryCard
          title={microentrega.tipoRotulo}
          state="Publicada"
          publishedAt={microentrega.publicadoEm ?? undefined}
        />
      ) : (
        <KitCard eyebrow="Microentrega" title="Nenhuma publicada ainda">
          <p className="text-xs" style={{ color: "rgba(47,75,110,.62)" }}>
            Assim que a equipe publicar uma entrega, ela aparece aqui.
          </p>
        </KitCard>
      )}
    </div>
  );
}
