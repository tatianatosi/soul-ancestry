import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listarNucleos } from "@/lib/nucleos-desk.functions";

type NucleoLinha = {
  id: string;
  case_id: string | null;
  nome: string;
  dossie_mae: string | null;
  dossie_status: string | null;
  membros?: { id: string; nome: string; papel: string }[];
};

const ROTULO_STATUS: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  em_preparacao: "Em preparação",
  ativo: "Ativo",
  arquivado: "Arquivado",
};

/**
 * Faixa de vínculo entre a ficha operacional do caso e o núcleo/dossiê-mãe.
 * A composição familiar não é replicada aqui: a fonte de verdade é Núcleos e dossiês.
 */
export function VinculoNucleo({
  caseId,
  codigoCaso,
}: {
  caseId: string;
  codigoCaso: string | null;
}) {
  const carregar = useServerFn(listarNucleos);
  const q = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregar(), retry: false });

  const vinculados = ((q.data ?? []) as NucleoLinha[]).filter((n) => n.case_id === caseId);
  const principal = vinculados[0] ?? null;
  const duplicado = vinculados.length > 1;

  return (
    <section className="mb-4 rounded-xl border border-gold/40 bg-cream/60 px-4 py-3">
      <div className="grid gap-2 text-sm text-navy/75 sm:grid-cols-2">
        <p>
          <span className="text-[11px] uppercase tracking-wide text-navy/45">Núcleo familiar</span>
          <br />
          {principal ? principal.nome : "Nenhum núcleo vinculado a este caso"}
        </p>
        <p>
          <span className="text-[11px] uppercase tracking-wide text-navy/45">Dossiê-mãe</span>
          <br />
          {principal
            ? `${principal.dossie_mae || "sem identificação"} · ${ROTULO_STATUS[principal.dossie_status ?? "nao_iniciado"] ?? "Não iniciado"}`
            : "—"}
        </p>
        <p>
          <span className="text-[11px] uppercase tracking-wide text-navy/45">Fonte operacional do núcleo</span>
          <br />
          <Link to="/nucleos" className="text-navy underline underline-offset-2">
            Núcleos e dossiês
          </Link>
        </p>
        <p>
          <span className="text-[11px] uppercase tracking-wide text-navy/45">Caso vinculado</span>
          <br />
          <span className="font-mono text-navy">{codigoCaso ?? "—"}</span>
        </p>
      </div>

      <p className="mt-2 text-[11px] text-navy/50">
        Composição familiar, requerentes, ambiente autorizado e situação documental ficam em Núcleos e dossiês. Esta
        ficha concentra o ciclo operacional: formalização, gates, onboarding, jornada, entregas e alertas.
      </p>

      {duplicado ? (
        <p className="mt-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-navy">
          Duplicidade detectada: {vinculados.length} núcleos apontam para este caso. Deve existir apenas um núcleo e um
          dossiê-mãe por caso — arquive os excedentes em Núcleos e dossiês.
        </p>
      ) : null}
    </section>
  );
}
