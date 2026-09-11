import { Link } from "@tanstack/react-router";

import { Secao } from "@/components/caso/campos";
import type { ResumoCano, EstadoElo, EloCano } from "@/lib/cano-operacional";
import { ELOS_CANO } from "@/lib/cano-operacional";

const ROTULO_ELO: Record<EloCano, string> = {
  legado: "Legado",
  lista_alimento: "Lista-alimento",
  catalogo_planejador: "Catálogo / produto-pai",
  caso_360: "Caso 360",
  desk_libera: "Desk libera",
  app_autorizado: "App autorizado",
  whatsapp_manual: "WhatsApp (cópia)",
};

const ROTULO_ESTADO: Record<EstadoElo, string> = {
  ok: "ok",
  parcial: "parcial",
  ausente: "ausente",
  bloqueado: "bloqueado",
};

function classeEstado(estado: EstadoElo): string {
  if (estado === "ok") return "text-navy";
  if (estado === "parcial") return "text-terracotta";
  return "text-navy/45";
}

/**
 * Visão do cano operacional no Caso 360 — só leitura + CTAs para os elos
 * já existentes (sem tela nova, sem tabela nova).
 */
export function CardCanoOperacional({
  caseId,
  cano,
}: {
  caseId: string;
  cano: ResumoCano;
}) {
  return (
    <Secao
      titulo="Cano operacional"
      descricao="Legado → lista-alimento → catálogo → caso → Desk libera → App → WhatsApp (cópia manual). Sem envio automático."
    >
      <ol className="space-y-2 text-sm">
        {ELOS_CANO.map((elo) => {
          const item = cano.elos[elo];
          return (
            <li key={elo} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="min-w-[9.5rem] font-medium text-navy">{ROTULO_ELO[elo]}</span>
              <span className={`text-xs uppercase tracking-wide ${classeEstado(item.estado)}`}>
                {ROTULO_ESTADO[item.estado]}
              </span>
              <span className="text-navy/60">{item.detalhe}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-sm text-navy">
        <span className="font-medium">Próximo passo no Desk:</span> {cano.proximoPassoDesk}
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/catalogo" className="text-navy underline decoration-gold underline-offset-4">
          Catálogo / lista-alimento
        </Link>
        <Link
          to="/biblioteca-evidencias/$caseId"
          params={{ caseId }}
          className="text-navy underline decoration-gold underline-offset-4"
        >
          Biblioteca (liberar ao App)
        </Link>
        <Link
          to="/app-cliente-como-pessoa"
          search={{ casoId: caseId }}
          className="text-navy underline decoration-gold underline-offset-4"
        >
          Ver App como cliente
        </Link>
        <Link to="/biblioteca-mensagens" className="text-navy underline decoration-gold underline-offset-4">
          Biblioteca de Mensagens
        </Link>
      </div>
    </Secao>
  );
}
