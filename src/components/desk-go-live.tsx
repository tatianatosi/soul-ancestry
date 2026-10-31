/**
 * Registro do caso e checklist de ativação — lidos do caso REAL escolhido.
 *
 * Antes (até 31/10/2026) este componente lia o registro local de casos, uma fixture local
 * com clientes fixos, e guardava marcações só no navegador. Religado a pedido da
 * Proprietária: agora recebe o caso carregado por `carregarGoLive({ casoId })` e
 * mostra só o que o banco registra. Nada é marcado à mão aqui, e nada é
 * inferido: item sem registro aparece como pendente.
 */
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";

import type { DadosGoLive } from "@/lib/golive.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export type CasoGoLiveEncontrado = Extract<DadosGoLive, { encontrado: true }>;

export type ItemChecklistCaso = { item: string; feito: boolean; fonte: string };

/** Checklist pós-fechamento derivado do que o caso registra. Puro, para teste. */
export function checklistDoCaso(
  caso: Pick<CasoGoLiveEncontrado, "caso" | "plano">,
): ItemChecklistCaso[] {
  const c = caso.caso;
  return [
    { item: "Contrato assinado", feito: c.contratoAssinado, fonte: "crm_casos.contrato_assinado" },
    {
      item: "Pagamento confirmado",
      feito: c.pagamentoConfirmado,
      fonte: "crm_casos.pagamento_confirmado",
    },
    {
      item: "Documentos mínimos recebidos",
      feito: c.documentosMinimosOk,
      fonte: "crm_casos.documentos_minimos_ok",
    },
    { item: "Responsável definido", feito: Boolean(c.responsavel), fonte: "crm_casos.responsavel" },
    {
      item: "Próxima ação definida",
      feito: Boolean(caso.plano?.proximaAcao ?? c.proximaAcao),
      fonte: "case_plans / crm_casos.proxima_acao",
    },
    {
      item: "Marco da jornada registrado",
      feito: Boolean(caso.plano?.marco),
      fonte: "case_plans.marco_atual",
    },
  ];
}

/** Itens que ainda não têm registro, em texto para a equipe. */
export function alertasDoCaso(itens: readonly ItemChecklistCaso[]): string[] {
  return itens.filter((i) => !i.feito).map((i) => `Pendente: ${i.item.toLowerCase()}.`);
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor}</dd>
    </div>
  );
}

export function GoLiveDesk({ caso }: { caso: CasoGoLiveEncontrado }) {
  const c = caso.caso;
  const itens = checklistDoCaso(caso);
  const alertas = alertasDoCaso(itens);
  const feitos = itens.filter((i) => i.feito).length;

  return (
    <div className="space-y-4" data-golive-registro-caso>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Campo rotulo="Código" valor={c.codigo || "não registrado"} />
        <Campo rotulo="Cliente" valor={humano(c.cliente, "não registrado")} />
        <Campo rotulo="País" valor={humano(c.pais, "não registrado")} />
        <Campo rotulo="Situação" valor={humano(c.status, "sem situação registrada")} />
        <Campo rotulo="Etapa" valor={humano(caso.plano?.fase ?? c.fase, "não registrada")} />
        <Campo rotulo="Responsável" valor={humano(c.responsavel, "sem responsável")} />
        <Campo
          rotulo="Próxima ação"
          valor={humano(caso.plano?.proximaAcao ?? c.proximaAcao, "não registrada")}
        />
        <Campo rotulo="Prazo" valor={dataHumana(caso.plano?.prazo ?? c.prazo)} />
      </dl>

      <div>
        <p className="mb-2 text-xs text-navy/60">
          Checklist de ativação — {feitos} de {itens.length} com registro no banco.
        </p>
        <ul className="space-y-1.5">
          {itens.map((i) => (
            <li
              key={i.item}
              className="flex items-start gap-2 text-sm text-navy"
              data-checklist-feito={i.feito}
            >
              {i.feito ? (
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-navy/35" aria-hidden="true" />
              )}
              <span className="min-w-0">
                {i.item} <span className="text-xs text-navy/45">· {i.fonte}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {alertas.length ? (
        <div
          className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-navy"
          data-golive-alertas
        >
          <p className="mb-1 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Alertas do caso
          </p>
          <ul className="list-disc space-y-0.5 pl-5">
            {alertas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
