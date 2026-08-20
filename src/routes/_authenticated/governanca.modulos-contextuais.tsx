import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import {
  MODULOS_DESK,
  TELAS_PRINCIPAIS_DESK,
  TELA_DESK_LABEL,
  contarPorTela,
  type TelaDesk,
} from "@/lib/desk-modulos";
import {
  ESCOPO_ANA,
  ESCOPO_DIAGNOSTICO_ISOLADO,
  ESCOPO_JOAO,
  TELA_APP_LABEL,
  TAXONOMIA_ENTREGA,
  visibilidadeCompleta,
  type TipoEntrega,
} from "@/lib/app-visibilidade";

export const Route = createFileRoute("/_authenticated/governanca/modulos-contextuais")({
  head: () => ({
    meta: [
      { title: "Módulos contextuais do Desk e visibilidade do App — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro somente leitura da alocação de módulos profundos nas telas principais do Desk e das regras de visibilidade progressiva do App Cliente.",
      },
      { property: "og:title", content: "Módulos contextuais do Desk e visibilidade do App" },
      {
        property: "og:description",
        content: "Matriz módulo profundo → tela principal → subrota/painel e estados de visibilidade do App.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

const EXEMPLOS = [
  { nome: "Ana Luiza", escopo: ESCOPO_ANA },
  { nome: "João", escopo: ESCOPO_JOAO },
  { nome: "Diagnóstico isolado", escopo: ESCOPO_DIAGNOSTICO_ISOLADO },
];

function Pagina() {
  const contagem = contarPorTela();

  return (
    <SaasShell
      titulo="Módulos contextuais e visibilidade progressiva"
      descricao="Somente leitura. As 7 telas principais do Desk e as telas do App Cliente permanecem preservadas; módulos profundos residem como subrota ou painel."
    >
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(Object.keys(TELA_DESK_LABEL) as TelaDesk[]).map((t) => (
            <div key={t} className="rounded-xl border border-navy/10 bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-navy">{contagem[t]}</div>
              <div className="text-xs uppercase tracking-wide text-navy/60">{TELA_DESK_LABEL[t]}</div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy/70">
          Telas principais do Desk preservadas: {TELAS_PRINCIPAIS_DESK.length}. Telas do App Cliente
          preservadas: {Object.keys(TELA_APP_LABEL).length}. Nenhum módulo profundo virou aba principal.
        </section>

        <section>
          <h2 className="mb-3 font-serif text-xl text-navy">
            Matriz módulo profundo → tela principal → subrota/painel
          </h2>
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-navy/5 text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-3 py-2">Módulo profundo</th>
                  <th className="px-3 py-2">Tela principal</th>
                  <th className="px-3 py-2">Forma</th>
                  <th className="px-3 py-2">Subrota / painel</th>
                  <th className="px-3 py-2">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {MODULOS_DESK.map((m) => (
                  <tr key={m.id} className="border-t border-navy/5 align-top">
                    <td className="px-3 py-2 font-medium text-navy">{m.nome}</td>
                    <td className="px-3 py-2 text-navy/70">{TELA_DESK_LABEL[m.tela]}</td>
                    <td className="px-3 py-2 text-xs uppercase tracking-wide text-navy/50">
                      {m.forma.replace("_", " ")}
                    </td>
                    <td className="px-3 py-2 text-navy/70">{m.destino}</td>
                    <td className="px-3 py-2 text-navy/60">{m.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-xl text-navy">Visibilidade do App por perfil</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {EXEMPLOS.map((e) => (
              <div key={e.nome} className="rounded-xl border border-navy/10 bg-white p-4">
                <h3 className="font-serif text-lg text-navy">{e.nome}</h3>
                <ul className="mt-2 space-y-1 text-[13px] text-navy/70">
                  {visibilidadeCompleta(e.escopo).map((v) => (
                    <li key={v.tela} className="flex justify-between gap-3">
                      <span>{TELA_APP_LABEL[v.tela]}</span>
                      <span className="text-right text-navy/55">{v.titulo}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-navy/50">
                  CTA de upsell: nunca exibido a quem já contratou pesquisa completa.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-xl text-navy">Taxonomia de fases e entregas</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(TAXONOMIA_ENTREGA) as TipoEntrega[]).map((k) => (
              <li key={k} className="rounded-xl border border-navy/10 bg-white p-3 text-sm">
                <span className="font-medium text-navy">{TAXONOMIA_ENTREGA[k].rotulo}</span>
                <span className="ml-2 text-xs uppercase tracking-wide text-navy/50">
                  {TAXONOMIA_ENTREGA[k].ehEntrega ? "entrega" : "não é entrega"}
                </span>
                <p className="mt-1 text-[12px] text-navy/60">{TAXONOMIA_ENTREGA[k].nota}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SaasShell>
  );
}
