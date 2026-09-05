import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import {
  ESTADO_EQUIVALENCIA_LABEL,
  MATRIZ_EQUIVALENCIA,
  contarEstados,
  gruposComLacuna,
  totalLinhas,
  type EstadoEquivalencia,
} from "@/lib/matriz-equivalencia";

export const Route = createFileRoute("/_authenticated/governanca/matriz-equivalencia")({
  head: () => ({
    meta: [
      { title: "Matriz mockup → rota → dado → estado — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro de equivalência dos 7 grupos do Desk Intelligence: aba do mockup, rota real, fonte de dado e estado, para aprovação antes de qualquer consolidação.",
      },
      { property: "og:title", content: "Matriz de equivalência do Desk Intelligence" },
      {
        property: "og:description",
        content: "Mockup → rota → dado → estado dos 7 grupos existentes, com registro de aprovação da Proprietária.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

const CHAVE = "ca:matriz-equivalencia:aprovacao";

const COR_ESTADO: Record<EstadoEquivalencia, string> = {
  implementado: "bg-emerald-100 text-emerald-800 border-emerald-300",
  parcial: "bg-amber-100 text-amber-800 border-amber-300",
  ausente: "bg-terracotta/15 text-terracotta border-terracotta/40",
  a_confirmar: "bg-navy/10 text-navy border-navy/25",
};

type Decisao = "aprovado" | "ajustar";

function Pagina() {
  const [decisoes, setDecisoes] = useState<Record<string, Decisao>>({});

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) setDecisoes(JSON.parse(bruto) as Record<string, Decisao>);
    } catch {
      /* registro local indisponível */
    }
  }, []);

  function registrar(id: string, decisao: Decisao) {
    setDecisoes((atual) => {
      const proximo = { ...atual, [id]: decisao };
      try {
        window.localStorage.setItem(CHAVE, JSON.stringify(proximo));
      } catch {
        /* registro local indisponível */
      }
      return proximo;
    });
  }

  const estados = contarEstados();
  const lacunas = gruposComLacuna();
  const aprovados = MATRIZ_EQUIVALENCIA.filter((g) => decisoes[g.id] === "aprovado").length;
  const liberado = aprovados === MATRIZ_EQUIVALENCIA.length && lacunas.length === 0;

  return (
    <SaasShell
      titulo="Matriz de equivalência: mockup → rota → dado → estado"
      descricao="Registro dos 7 grupos existentes do Desk. Nenhuma consolidação em 8 grupos pode ocorrer sem sua aprovação grupo a grupo."
    >
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["Grupos", `${MATRIZ_EQUIVALENCIA.length}`],
            ["Itens mapeados", `${totalLinhas()}`],
            ["Implementados", `${estados.implementado}`],
            ["Parciais", `${estados.parcial}`],
            ["Ausentes / a confirmar", `${estados.ausente + estados.a_confirmar}`],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-xl border border-navy/10 bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-navy">{valor}</div>
              <div className="text-xs uppercase tracking-wide text-navy/60">{rotulo}</div>
            </div>
          ))}
        </section>

        <section
          className={`rounded-xl border p-4 text-sm ${
            liberado
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-terracotta/40 bg-terracotta/5 text-navy/80"
          }`}
        >
          <strong className="font-semibold">
            {liberado
              ? "Matriz aprovada nos 7 grupos e sem lacunas."
              : "Consolidação em 8 grupos permanece bloqueada."}
          </strong>{" "}
          {aprovados} de {MATRIZ_EQUIVALENCIA.length} grupos com aprovação registrada.
          {lacunas.length > 0 ? (
            <>
              {" "}
              Grupos com item ausente ou a confirmar: {lacunas.join(", ")}.
            </>
          ) : null}{" "}
          O registro de decisão desta tela é interno e não altera dados, rotas ou permissões.
        </section>

        {MATRIZ_EQUIVALENCIA.map((g) => {
          const decisao = decisoes[g.id];
          /** Lacuna do grupo não bloqueia a decisão: vira gate registrado. */
          const itensComLacuna = g.linhas.filter(
            (l) => l.estado === "ausente" || l.estado === "a_confirmar",
          );
          const pendenciaGrupo = itensComLacuna.length
            ? `Itens ausentes ou a confirmar neste grupo: ${itensComLacuna.map((l) => l.mockup).join(", ")}.`
            : null;
          return (
            <section key={g.id} className="rounded-xl border border-navy/10 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 px-4 py-3">
                <div>
                  <h2 className="font-serif text-xl text-navy">{g.grupo}</h2>
                  <p className="text-xs uppercase tracking-wide text-navy/50">
                    rota base {g.rotaBase} · {g.linhas.length} itens
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {decisao ? (
                    <span
                      className={`rounded-full border px-3 py-1 text-xs ${
                        decisao === "aprovado"
                          ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                          : "border-amber-300 bg-amber-100 text-amber-800"
                      }`}
                    >
                      {decisao === "aprovado" ? "Aprovado" : "Ajustar antes de consolidar"}
                    </span>
                  ) : (
                    <span className="rounded-full border border-navy/20 px-3 py-1 text-xs text-navy/60">
                      Sem decisão
                    </span>
                  )}
                  <AcaoOperacional
                    size="sm"
                    rotulo="Aprovar grupo"
                    capacidade="resolver_divergencia"
                    pendenciaGate={pendenciaGrupo}
                    efeito={`Registra a aprovação do grupo ${g.grupo} neste navegador. Nenhum dado, rota ou permissão é alterado.`}
                    onConfirmar={() => registrar(g.id, "aprovado")}
                  />
                  <AcaoOperacional
                    size="sm"
                    variant="outline"
                    rotulo="Marcar ajuste"
                    capacidade="resolver_divergencia"
                    efeito={`Marca o grupo ${g.grupo} como pendente de ajuste antes de qualquer consolidação.`}
                    onConfirmar={() => registrar(g.id, "ajustar")}
                  />
                </div>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-navy/5 text-xs uppercase tracking-wide text-navy/60">
                    <tr>
                      <th className="px-3 py-2">Mockup aprovado</th>
                      <th className="px-3 py-2">Rota</th>
                      <th className="px-3 py-2">Dado (fonte canônica)</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.linhas.map((l) => (
                      <tr key={`${g.id}-${l.mockup}`} className="border-t border-navy/5 align-top">
                        <td className="px-3 py-2 font-medium text-navy">{l.mockup}</td>
                        <td className="px-3 py-2 font-mono text-xs text-navy/70">{l.rota}</td>
                        <td className="px-3 py-2 text-xs text-navy/70">{l.dado}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] ${COR_ESTADO[l.estado]}`}>
                            {ESTADO_EQUIVALENCIA_LABEL[l.estado]}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-navy/60">{l.nota ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </SaasShell>
  );
}
