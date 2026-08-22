import {
  BLOQUEIOS_REMANESCENTES,
  CONFIRMACOES_EXTERNAS,
  MAPA_ADMINISTRADORAS,
  REGRAS_ADMINISTRACAO,
  REGRA_AUTONOMIA,
  ROTULO_GRUPO_APROVACAO,
  aprovacoesPorGrupo,
  type GrupoAprovacao,
} from "@/lib/varredura-administracao";

/**
 * Varredura final de administração, contingência e poder da proprietária.
 * Tela somente leitura: nada aqui aplica papel, convite, segredo ou migration.
 */
export function VarreduraAdministracao() {
  const grupos = aprovacoesPorGrupo();

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-navy/10 bg-white p-4">
        <h2 className="font-serif text-lg text-navy">Regra de autonomia interna</h2>
        <p className="mt-1 text-sm text-navy/70">{REGRA_AUTONOMIA.enunciado}</p>
        <ul className="mt-3 grid gap-1 text-xs text-navy/60 sm:grid-cols-2">
          {REGRA_AUTONOMIA.acoesInternas.map((a) => (
            <li key={a}>• {a}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-navy/50">
          Todo override registra: {REGRA_AUTONOMIA.camposObrigatoriosDoOverride.join(" · ")}. Estado preparatório máximo:{" "}
          <span className="font-medium text-navy">{REGRA_AUTONOMIA.estadoPreparatorio}</span>.
        </p>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Bloqueios remanescentes mapeados</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {BLOQUEIOS_REMANESCENTES.map((b) => (
            <article key={b.id} className="rounded-xl border border-navy/10 bg-white p-4 text-xs text-navy/70">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-navy">
                  {b.id} · {b.modulo}
                </p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                    b.natureza === "interno"
                      ? "border-navy/20 text-navy/60"
                      : "border-terracotta/40 text-terracotta"
                  }`}
                >
                  {b.natureza === "interno" ? "bloqueio interno" : "efeito externo irreversível"}
                </span>
              </div>
              <dl className="mt-2 space-y-1">
                <p>
                  <span className="text-navy/45">Rota:</span> {b.rota} · <span className="text-navy/45">Entidade:</span>{" "}
                  {b.entidade}
                </p>
                <p>
                  <span className="text-navy/45">Ação:</span> {b.acao}
                </p>
                <p>
                  <span className="text-navy/45">Regra/gate:</span> {b.regra}
                </p>
                <p>
                  <span className="text-navy/45">Superável por decisão auditada:</span>{" "}
                  {b.superavelPorDecisao ? "sim" : "não"}
                </p>
                <p>
                  <span className="text-navy/45">Estado máximo interno:</span> {b.estadoMaximoInterno}
                </p>
                <p>
                  <span className="text-navy/45">Confirmação externa:</span> {b.confirmacaoExterna ?? "não aplicável"}
                </p>
                <p>
                  <span className="text-navy/45">Arquivo:</span> {b.arquivo}
                </p>
                <p>
                  <span className="text-navy/45">Risco:</span> {b.risco}
                </p>
                <p>
                  <span className="text-navy/45">Teste:</span> {b.teste}
                </p>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
        <h2 className="font-serif text-lg text-navy">Confirmação externa obrigatória</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {CONFIRMACOES_EXTERNAS.map((c) => (
            <li key={c.id}>• {c.rotulo}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Mapa de administradoras (proposto, não aplicado)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {MAPA_ADMINISTRADORAS.map((a) => (
            <div key={a.email} className="rounded-xl border border-navy/10 bg-white p-4 text-xs text-navy/70">
              <p className="font-medium text-navy">{a.email}</p>
              <p className="mt-1">Papel: {a.papel}</p>
              <p>Tipo: {a.tipo}</p>
              <p>Escopo: {a.escopo}</p>
              <p className="mt-1 text-navy/60">{a.descricao}</p>
              <p className="mt-2 rounded border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/55">
                estado: {a.estado}
              </p>
            </div>
          ))}
        </div>
        <ul className="mt-3 space-y-1 text-xs text-navy/60">
          {REGRAS_ADMINISTRACAO.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-serif text-lg text-navy">Pacote único de aprovações pendentes</h2>
        <div className="space-y-4">
          {(Object.keys(grupos) as GrupoAprovacao[]).map((g) => (
            <div key={g} className="overflow-x-auto rounded-xl border border-navy/10 bg-white p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-navy/50">{ROTULO_GRUPO_APROVACAO[g]}</p>
              <table className="w-full min-w-[840px] text-left text-xs text-navy/70">
                <thead className="text-navy/45">
                  <tr>
                    <th className="py-1 pr-3">Alvo</th>
                    <th className="py-1 pr-3">Impacto</th>
                    <th className="py-1 pr-3">Dados</th>
                    <th className="py-1 pr-3">Reversibilidade</th>
                    <th className="py-1 pr-3">Prévia</th>
                    <th className="py-1 pr-3">Motivo</th>
                    <th className="py-1">Confirmação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {grupos[g].map((l) => (
                    <tr key={l.id}>
                      <td className="py-1.5 pr-3 text-navy">{l.alvo}</td>
                      <td className="py-1.5 pr-3">{l.impacto}</td>
                      <td className="py-1.5 pr-3">{l.dadosEnvolvidos}</td>
                      <td className="py-1.5 pr-3">{l.reversibilidade}</td>
                      <td className="py-1.5 pr-3">{l.previa}</td>
                      <td className="py-1.5 pr-3">{l.motivo}</td>
                      <td className="py-1.5">{l.confirmacao}</td>
                    </tr>
                  ))}
                  {!grupos[g].length ? (
                    <tr>
                      <td className="py-1.5" colSpan={7}>
                        Sem itens pendentes neste grupo.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
