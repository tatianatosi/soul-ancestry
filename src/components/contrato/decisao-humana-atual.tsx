import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Selo } from "@/components/contratos/rotulos";
import { listarEquipe } from "@/lib/equipe.functions";
import { decisaoHumanaAtual } from "@/lib/decisao-humana-contrato";

/**
 * B05 (04/11/2026) — acima da dobra do instrumento: qual decisão humana está pendente agora, por quê,
 * o que ela segura e quem responde. Só leitura.
 */
export function DecisaoHumanaAtual({
  status,
  pendenciaChecklist,
  motivoCancelamento,
  responsavelUserId,
  versoes,
}: {
  status: string;
  pendenciaChecklist: string | null;
  motivoCancelamento: string | null;
  responsavelUserId: string | null;
  versoes: { numero: number; status: string }[];
}) {
  const carregarEquipe = useServerFn(listarEquipe);
  const equipe = useQuery({ queryKey: ["equipe-revisao"], queryFn: () => carregarEquipe() });
  const membro = ((equipe.data?.membros as { auth_user_id?: string; full_name?: string; email?: string }[] | undefined) ?? []).find(
    (m) => responsavelUserId && m.auth_user_id === responsavelUserId,
  );
  const responsavelNome = responsavelUserId
    ? membro
      ? membro.full_name || membro.email || null
      : equipe.isError
        ? "Não foi possível ler a equipe"
        : equipe.isLoading
          ? "Carregando…"
          : "Usuário não encontrado na equipe"
    : null;
  const d = decisaoHumanaAtual({ status, pendenciaChecklist, motivoCancelamento, responsavelNome, versoes });

  return (
    <div className="mt-3 rounded-lg border border-gold/50 bg-gold/10 p-3" data-decisao-humana-atual>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/70">Decisão humana atual</p>
        <Selo tom="neutro" texto="Sem atos externos automáticos" />
      </div>
      <dl className="mt-2 grid gap-2 text-sm text-navy sm:grid-cols-3">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Causa</dt>
          <dd className="break-words">{d.causa}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Impacto</dt>
          <dd className="break-words">{d.impacto}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Responsável</dt>
          <dd className="break-words">{d.responsavel}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-navy/60">Nada é enviado, assinado ou cobrado sem a sua confirmação.</p>
    </div>
  );
}
