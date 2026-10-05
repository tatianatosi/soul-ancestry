/**
 * Estado contratual da organização, no cabeçalho de /contratos (Corte F, 05/10/2026).
 *
 * `painelContratual` (`contratos.functions.ts`) já agregava bloqueios, pendências,
 * instrumentos em revisão, anexos exigidos ausentes, ordens de serviço impedidas e
 * exceções expiradas — e não tinha nenhum consumidor: a informação existia e
 * ninguém a via. Somente leitura: nada é enviado, assinado ou cobrado aqui.
 */

import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { CaCard } from "@/components/ui/ca-card";
import { painelContratual } from "@/lib/contratos.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Painel = {
  contratos: any[];
  bloqueios: any[];
  pendencias: any[];
  revisaoPendente: any[];
  anexosAusentes: any[];
  ordensImpedidas: any[];
  excecoesExpiradas: any[];
};

function Numero({ rotulo, valor, tom }: { rotulo: string; valor: number; tom: "ok" | "alerta" | "erro" }) {
  const cls =
    tom === "erro"
      ? "border-terracotta/40 bg-terracotta/10 text-terracotta"
      : tom === "alerta"
        ? "border-gold/60 bg-gold/15 text-navy"
        : "border-navy/15 bg-cream/50 text-navy";
  return (
    <div className={`rounded-xl border px-3 py-2 ${cls}`}>
      <span className="block text-lg font-semibold tabular-nums">{valor}</span>
      <span className="block text-[11px] leading-tight">{rotulo}</span>
    </div>
  );
}

export function PainelEstadoContratual() {
  const carregar = useServerFn(painelContratual);
  const q = useQuery({ queryKey: ["painel-contratual"], queryFn: () => carregar() });

  return (
    <CaCard variante="compacto" titulo="Estado contratual da organização" data-painel-contratual>
      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data as Painel] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="o estado contratual"
        vazio="Nenhum instrumento registrado nesta organização."
      >
        {([p]) => (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              <Numero rotulo="instrumentos vivos" valor={p.contratos.length} tom="ok" />
              <Numero rotulo="validações bloqueantes" valor={p.bloqueios.length} tom={p.bloqueios.length ? "erro" : "ok"} />
              <Numero rotulo="pendências não bloqueantes" valor={p.pendencias.length} tom={p.pendencias.length ? "alerta" : "ok"} />
              <Numero rotulo="aguardando revisão humana" valor={p.revisaoPendente.length} tom={p.revisaoPendente.length ? "alerta" : "ok"} />
              <Numero rotulo="anexos exigidos ausentes" valor={p.anexosAusentes.length} tom={p.anexosAusentes.length ? "alerta" : "ok"} />
              <Numero rotulo="OS impedidas" valor={p.ordensImpedidas.length} tom={p.ordensImpedidas.length ? "alerta" : "ok"} />
              <Numero rotulo="exceções expiradas" valor={p.excecoesExpiradas.length} tom={p.excecoesExpiradas.length ? "erro" : "ok"} />
            </div>

            {p.bloqueios.length > 0 ? (
              <ul data-contratual-bloqueios className="space-y-1">
                {p.bloqueios.slice(0, 6).map((b: any) => (
                  <li key={b.id} className="rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs">
                    <Link
                      to="/contratos/$id"
                      params={{ id: String(b.contract_id) }}
                      className="font-medium text-navy underline underline-offset-2"
                    >
                      {b.label ?? b.validation_key}
                    </Link>{" "}
                    <span className="text-navy/60">— bloqueia assinatura deste instrumento.</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {p.revisaoPendente.length > 0 ? (
              <p data-contratual-revisao className="text-xs text-navy/70">
                Aguardando revisão humana:{" "}
                {p.revisaoPendente.slice(0, 5).map((c: any, i: number) => (
                  <span key={c.id}>
                    {i > 0 ? " · " : ""}
                    <Link
                      to="/contratos/$id"
                      params={{ id: String(c.id) }}
                      className="font-medium text-navy underline underline-offset-2"
                    >
                      {c.contract_number ?? c.title ?? c.id}
                    </Link>
                  </span>
                ))}
              </p>
            ) : null}

            <p className="text-[11px] text-navy/50">
              Leitura do estado real das tabelas de contrato, validação, anexo e ordem de serviço. Nenhuma ação
              externa é executada a partir deste painel.
            </p>
          </div>
        )}
      </EstadoDados>
    </CaCard>
  );
}
