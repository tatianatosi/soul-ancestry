import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { SaasShell } from "@/components/saas/shell";
import {
  ESTADOS_CONFORMIDADE,
  MATRIZ_CONFORMIDADE,
  contarPorEstado,
  filtrarPorEstado,
  pendentesDeRevisaoHumana,
  rotuloEstado,
  tomEstado,
  type EstadoConformidade,
} from "@/lib/matriz-conformidade";

export const Route = createFileRoute("/_authenticated/governanca/matriz-conformidade")({
  head: () => ({
    meta: [
      { title: "Matriz de conformidade do mockup aprovado — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro somente leitura da conformidade entre o mockup aprovado de 17 páginas, as rotas atuais e as entidades-fonte do Desk Intelligence.",
      },
      { property: "og:title", content: "Matriz de conformidade do mockup aprovado" },
      {
        property: "og:description",
        content: "Mockup, elemento aprovado, rota, entidade-fonte, estado e revisão humana necessária.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [estado, setEstado] = useState<EstadoConformidade | "todos">("todos");
  const contagem = useMemo(() => contarPorEstado(), []);
  const linhas = useMemo(() => filtrarPorEstado(estado), [estado]);
  const revisao = pendentesDeRevisaoHumana();

  return (
    <SaasShell
      titulo="Matriz de conformidade"
      descricao="Mockup aprovado (17 páginas) × rota atual × entidade-fonte. Somente leitura: nenhum módulo aprovado é redesenhado, simplificado, removido, renomeado ou deslocado."
    >
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ESTADOS_CONFORMIDADE.map((e) => (
            <button
              key={e.valor}
              type="button"
              onClick={() => setEstado(estado === e.valor ? "todos" : e.valor)}
              className={`rounded-xl border px-4 py-3 text-left transition ${e.tom} ${
                estado === e.valor ? "ring-2 ring-navy/30" : ""
              }`}
            >
              <div className="text-2xl font-semibold">{contagem[e.valor]}</div>
              <div className="text-xs uppercase tracking-wide">{e.rotulo}</div>
            </button>
          ))}
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-sm text-navy/70">
            {revisao.length} linha(s) exigem revisão humana antes de qualquer alteração de módulo aprovado.
            Nenhuma cobrança, contrato, mensagem, pesquisa externa, pasta, integração ou publicação é executada
            a partir desta tela.
          </p>
        </section>

        <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-navy/5 text-xs uppercase tracking-wide text-navy/60">
              <tr>
                <th className="px-3 py-2">Página do mockup</th>
                <th className="px-3 py-2">Elemento aprovado</th>
                <th className="px-3 py-2">Rota atual</th>
                <th className="px-3 py-2">Entidade-fonte</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Justificativa</th>
                <th className="px-3 py-2">Impacto</th>
                <th className="px-3 py-2">Responsável</th>
                <th className="px-3 py-2">Revisão humana</th>
                <th className="px-3 py-2">Última revisão</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.mockup_page} className="border-t border-navy/5 align-top">
                  <td className="px-3 py-3 font-medium text-navy">{l.mockup_page}</td>
                  <td className="px-3 py-3 text-navy/80">{l.elemento_aprovado}</td>
                  <td className="px-3 py-3 text-navy/70">{l.rota_atual}</td>
                  <td className="px-3 py-3 text-xs text-navy/60">{l.entidade_fonte}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${tomEstado(l.estado)}`}>
                      {rotuloEstado(l.estado)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-navy/70">{l.justificativa}</td>
                  <td className="px-3 py-3 text-navy/70">{l.impacto}</td>
                  <td className="px-3 py-3 text-navy/70">{l.responsavel}</td>
                  <td className="px-3 py-3 text-navy/70">{l.revisao_humana_necessaria ? "Sim" : "Não"}</td>
                  <td className="px-3 py-3 text-navy/60">{l.data_ultima_revisao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-navy/50">
          Total de {MATRIZ_CONFORMIDADE.length} linhas registradas.
        </p>
      </div>
    </SaasShell>
  );
}
