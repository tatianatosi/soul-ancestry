/**
 * Corte L08 (Prancha V4, 19/10/2026): os 6 marcos do contrato em cards
 * dentro do Caso 360 (seção Formalização). Leitura pura via
 * `listarContratos` (GET já existente) — nada grava, envia, assina ou
 * cobra. Sem contrato registrado, o vazio é honesto.
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";

import { KitEmptyState } from "@/components/clube-ancestral-kit/base";
import { CardsFluxoContrato } from "@/components/contrato/cards-fluxo-contrato";
import { EstadoDados } from "@/components/saas/estado-dados";
import { listarContratos } from "@/lib/contratos.functions";

export function CardsContratoCaso({ caseId }: { caseId: string }) {
  const listar = useServerFn(listarContratos);
  const q = useQuery({
    queryKey: ["contrato-do-caso", caseId],
    queryFn: () => listar({ data: {} }),
    retry: false,
  });

  const contratos = (q.data?.contratos as any[] | undefined) ?? [];
  const doCaso = contratos.filter((c) => c.case_id === caseId && !c.archived_at);
  const vigente = doCaso[0] ?? null;

  return (
    <EstadoDados
      carregando={q.isLoading}
      erro={q.error}
      dados={q.data ? [q.data] : undefined}
      aoTentarNovamente={() => void q.refetch()}
      recurso="o contrato do caso"
      vazio="Nenhum instrumento contratual registrado para este caso."
    >
      {() =>
        vigente ? (
          <div className="space-y-2">
            <CardsFluxoContrato
              status={vigente.status}
              temVersaoInterna={Boolean(vigente.current_version_id)}
              titulo={`Marcos do contrato — ${vigente.contract_number}`}
            />
            <p className="text-xs text-navy/60">
              <Link to="/contratos/$id" params={{ id: String(vigente.id) }} className="font-medium text-navy underline decoration-gold underline-offset-4">
                Abrir o instrumento contratual
              </Link>{" "}
              — preparação, revisão e atos formais acontecem lá; aqui é só leitura.
            </p>
          </div>
        ) : (
          <KitEmptyState
            title="Contrato não registrado"
            description="Nenhum instrumento contratual vigente vinculado a este caso. A formalização começa pela proposta aprovada e pelo preparo do instrumento."
          />
        )
      }
    </EstadoDados>
  );
}
