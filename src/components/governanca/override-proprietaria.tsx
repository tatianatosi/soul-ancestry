/**
 * Painel somente leitura da política de exceção da Proprietária (PROMPT 02).
 *
 * Mostra a regra original, a exceção aplicada, seu alcance e os limites que
 * continuam bloqueados. Não envia, não grava e não executa ação externa.
 */

import {
  ROTULO_ESTADO_OVERRIDE,
  alcanceDaExcecao,
  derivarEstadoOverride,
  type RegistroOverride,
} from "@/lib/override-proprietaria";

export function PainelOverrideProprietaria({
  hoje,
  condicaoOriginal,
  gatesPendentes,
  override,
}: {
  hoje: string;
  condicaoOriginal: string;
  gatesPendentes: readonly string[];
  override: RegistroOverride | null;
}) {
  const derivado = derivarEstadoOverride({ hoje, gatesPendentes, override });
  const alcance = override ? alcanceDaExcecao(override) : null;

  return (
    <section
      className="rounded-lg border border-border bg-card p-4"
      data-override="painel"
      aria-labelledby="override-titulo"
    >
      <h3 id="override-titulo" className="text-sm font-medium text-foreground">
        Exceção da Proprietária
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{derivado.motivo}</p>

      <dl className="mt-3 grid gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Regra original</dt>
          <dd className="text-foreground" data-override="condicao-original">
            {condicaoOriginal}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estado</dt>
          <dd className="text-foreground" data-override="estado">
            {ROTULO_ESTADO_OVERRIDE[derivado.estado]}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Gates pendentes (preservados)</dt>
          <dd className="text-foreground" data-override="gates-preservados">
            {derivado.gatesPreservados.length > 0 ? derivado.gatesPreservados.join(" · ") : "Nenhum"}
          </dd>
        </div>
        {override ? (
          <>
            <div>
              <dt className="text-muted-foreground">Justificativa</dt>
              <dd className="text-foreground">{override.justificativa}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Autora e data</dt>
              <dd className="text-foreground">
                {override.autora} · {override.em} · revisão em {override.revisar_em}
              </dd>
            </div>
          </>
        ) : null}
      </dl>

      {alcance ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div data-override="alcance-liberado">
            <p className="text-xs font-medium text-foreground">Alcance liberado (interno)</p>
            <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
              {alcance.liberado.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div data-override="limites-bloqueados">
            <p className="text-xs font-medium text-foreground">Continua bloqueado</p>
            <ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">
              {alcance.bloqueado.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground">
        A exceção não apaga o gate, não altera a condição original e não autoriza nenhuma ação
        externa. Auditoria append-only.
      </p>
    </section>
  );
}
