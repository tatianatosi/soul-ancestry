import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import {
  ANA_BLOQUEIOS,
  ANA_ESTADO_REAL,
  ANA_NOTA_COMERCIAL,
  ENTIDADES_VERTICAIS,
  ESCADA_ONBOARDING_PADRAO,
  EVENTOS_CONVERSAO_CANONICOS,
  FONTES_CANONICAS,
  FORA_DO_PRIMEIRO_RELEASE,
  NOTA_EVIDENCIA,
  NOTA_FORA_DO_RELEASE,
  NOTA_PLACEGO,
} from "@/lib/corte-vertical";

export const Route = createFileRoute("/_authenticated/governanca/corte-vertical")({
  head: () => ({
    meta: [
      { title: "Corte vertical do primeiro release — Clube Ancestral" },
      {
        name: "description",
        content: "Fontes canônicas, seis entidades funcionais, escopo adiado e estado real do piloto Ana Luiza.",
      },
      { property: "og:title", content: "Corte vertical do primeiro release — Clube Ancestral" },
      { property: "og:description", content: "Decisões consolidadas de fonte canônica e escopo do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CorteVertical,
});

const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

function CorteVertical() {
  return (
    <SaasShell
      titulo="Corte vertical e fontes canônicas"
      descricao="Decisões consolidadas do primeiro release. Leitura interna: nenhuma automação, cobrança ou mensagem parte desta tela."
    >
      <div className="grid gap-4">
        <Bloco titulo="Fonte canônica por domínio">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase text-navy/50">
              <tr>
                <th className="py-1 pr-3">Domínio</th>
                <th className="py-1 pr-3">Fonte oficial</th>
                <th className="py-1">Regra</th>
              </tr>
            </thead>
            <tbody>
              {FONTES_CANONICAS.map((f) => (
                <tr key={f.dominio} className="border-t border-navy/5 align-top">
                  <td className="py-1.5 pr-3 text-navy">{f.dominio}</td>
                  <td className="py-1.5 pr-3 text-navy/70">{f.fonte}</td>
                  <td className="py-1.5 text-navy/60">{f.regra}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-xs text-navy/70">{NOTA_PLACEGO}</p>
        </Bloco>

        <Bloco titulo="Seis entidades funcionais do corte vertical">
          <div className="grid gap-3 lg:grid-cols-3">
            {ENTIDADES_VERTICAIS.map((e) => (
              <div key={e.codigo} className="rounded-lg border border-navy/10 p-3">
                <p className="font-serif text-base text-navy">{e.nome}</p>
                <p className="mt-1 text-[11px] text-navy/60">{e.proposito}</p>
                <ul className="mt-2 space-y-0.5 text-[11px] text-navy/70">
                  {e.regras.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wide text-navy/50">Eventos de conversão (lista fechada)</p>
            <ul className="mt-2 flex flex-wrap gap-1">
              {EVENTOS_CONVERSAO_CANONICOS.map((e) => (
                <li key={e} className="rounded bg-navy/5 px-2 py-0.5 text-[11px] text-navy/70">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </Bloco>

        <Bloco titulo="Fora do primeiro release">
          <ul className="grid gap-1 sm:grid-cols-2">
            {FORA_DO_PRIMEIRO_RELEASE.map((i) => (
              <li key={i} className="text-xs text-terracotta">
                • {i}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy/60">{NOTA_FORA_DO_RELEASE}</p>
        </Bloco>

        <Bloco titulo="Ana Luiza — estado real, não caso fictício">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { r: "Caso canônico", v: ANA_ESTADO_REAL.casoCanonico },
              { r: "Alias histórico", v: ANA_ESTADO_REAL.aliasHistorico },
              { r: "Trilha", v: ANA_ESTADO_REAL.trilha },
              { r: "Responsável", v: ANA_ESTADO_REAL.responsavel },
              { r: "Aceite formal", v: ANA_ESTADO_REAL.aceiteFormal },
              { r: "Estado", v: ANA_ESTADO_REAL.estado },
              { r: "Situação operacional", v: ANA_ESTADO_REAL.situacaoOperacional },
            ].map((c) => (
              <div key={c.r} className="rounded-lg border border-navy/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-navy/50">{c.r}</p>
                <p className="text-sm text-navy">{c.v}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-wide text-navy/50">Bloqueios ativos</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {ANA_BLOQUEIOS.map((b) => (
              <li key={b} className="text-xs text-terracotta">
                • {b}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-navy/60">{ANA_NOTA_COMERCIAL}</p>
        </Bloco>

        <Bloco titulo="Onboarding padrão — João segue o mesmo caminho">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase text-navy/50">
              <tr>
                <th className="py-1 pr-3">Estado</th>
                <th className="py-1 pr-3">Evidência exigida</th>
                <th className="py-1">Próximo passo</th>
              </tr>
            </thead>
            <tbody>
              {ESCADA_ONBOARDING_PADRAO.map((d) => (
                <tr key={d.estado} className="border-t border-navy/5 align-top">
                  <td className="py-1.5 pr-3 text-navy">{d.estado}</td>
                  <td className="py-1.5 pr-3 text-navy/60">{d.evidencia}</td>
                  <td className="py-1.5 text-navy/70">{d.proximoPasso}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-navy/60">{NOTA_EVIDENCIA}</p>
        </Bloco>

        <Bloco titulo="João — posição na escada, sem antecipar etapas">
          <div className="grid gap-1 text-xs">
            <p className="text-navy">{JOAO_ESTADO_ESCADA.caso}</p>
            <p className="text-navy/60">Evidência atual: {JOAO_ESTADO_ESCADA.evidencia}</p>
            <p className="text-navy/70">Próximo passo: {JOAO_ESTADO_ESCADA.proximoPasso}</p>
          </div>
          <ul className="mt-4 grid gap-1.5">
            {avaliarEscadaOnboarding(JOAO_ESTADO_ESCADA.degrauAtual).map((d) => (
              <li key={d.estado} className="flex flex-wrap items-baseline gap-2 border-t border-navy/5 py-1.5">
                <span className="text-[10px] text-navy/40">{d.ordem}</span>
                <span
                  className={
                    d.situacao === "concluido"
                      ? "rounded-full bg-navy/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/60"
                      : d.situacao === "atual"
                        ? "rounded-full bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy"
                        : "rounded-full bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-terracotta"
                  }
                >
                  {d.situacao === "concluido" ? "Concluído" : d.situacao === "atual" ? "Atual" : "Bloqueado"}
                </span>
                <span className="text-xs text-navy">{d.estado}</span>
                <span className="text-xs text-navy/50">{d.motivo}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-4 grid gap-1">
            {JOAO_ESTADO_ESCADA.naoAntecipar.map((n) => (
              <li key={n} className="text-xs text-terracotta">
                • {n}
              </li>
            ))}
          </ul>
        </Bloco>

      </div>
    </SaasShell>
  );
}
