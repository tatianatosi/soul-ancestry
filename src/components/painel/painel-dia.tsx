/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { painelCadencia } from "@/lib/jornada-cliente.functions";
import { rotulo as rotuloCatalogo } from "@/lib/crm-desk";
import {
  casosHoje,
  comercialHoje,
  consolidarDia,
  excecoesQueExigemDono,
  filaPriorizada,
  hojeISO,
  textoDiasSemTouchpoint,
  type ItemDia,
} from "@/lib/painel-dia";

function LinkItem({ item, children }: { item: { id: string; tipo: "lead" | "caso" }; children: React.ReactNode }) {
  if (item.tipo === "caso") {
    return (
      <Link to="/casos/$caseId" params={{ caseId: item.id }} className="text-navy underline underline-offset-2">
        {children}
      </Link>
    );
  }
  return (
    <Link to="/leads" className="text-navy underline underline-offset-2">
      {children}
    </Link>
  );
}

function Linha({ item }: { item: ItemDia }) {
  return (
    <li className="rounded-lg border border-navy/10 px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <LinkItem item={item}>{item.rotulo}</LinkItem>
        <span className="text-xs text-navy/60">{item.data ? item.data.split("-").reverse().join("/") : "sem prazo"}</span>
      </div>
      <p className="mt-0.5 text-xs text-navy/65">{item.acao}</p>
      <p className="mt-0.5 text-xs">
        {item.responsavel ? (
          <span className="text-navy/60">Responsável: {item.responsavel}</span>
        ) : (
          <span className="rounded bg-terracotta/10 px-1.5 py-0.5 text-terracotta">
            Falha de qualidade: sem responsável definido
          </span>
        )}
      </p>
      {item.bloqueios.length > 0 ? (
        <p className="mt-1 text-[11px] text-navy/50">
          +{item.bloqueios.length} bloqueio{item.bloqueios.length === 1 ? "" : "s"} no mesmo registro — abrir a ficha para a lista
          completa.
        </p>
      ) : null}
    </li>
  );
}

/** Painel Hoje enxuto: fila priorizada, exceções com dono, comercial e casos do dia. */
export function PainelDia() {
  const carregarDesk = useServerFn(painelHojeDesk);
  const carregarCadencia = useServerFn(painelCadencia);
  const [incluirDemo, setIncluirDemo] = useState(false);
  const [ajuda, setAjuda] = useState(false);

  const qDesk = useQuery({ queryKey: ["painel-desk-hoje"], queryFn: () => carregarDesk(), retry: false });
  const qCad = useQuery({ queryKey: ["painel-cadencia"], queryFn: () => carregarCadencia(), retry: false });

  if (qDesk.isLoading) return <p className="text-sm text-navy/50">Carregando o dia…</p>;
  if (qDesk.isError || !qDesk.data) return <p className="text-sm text-terracotta">Não foi possível carregar as filas do dia.</p>;

  const filas = qDesk.data.filas;
  const hoje = hojeISO();
  const itens = consolidarDia(filas, { incluirDemo });
  const priorizada = filaPriorizada(itens, hoje);
  const excecoes = excecoesQueExigemDono(itens, filas, hoje);
  const comercial = comercialHoje(filas, { incluirDemo });
  const casos = casosHoje(itens, hoje);
  const cadencia = ((qCad.data?.casos ?? []) as any[])
    .filter((c) => c.cadencia?.status === "atencao" || c.cadencia?.status === "critico")
    .sort((a, b) => (b.cadencia.diasSemTouchpoint ?? 0) - (a.cadencia.diasSemTouchpoint ?? 0))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy/60">
          O que precisa de ação hoje, por quem e até quando. Governança, catálogo, métricas e planejamento ficam nas áreas
          proprietárias.
        </p>
        <label className="flex items-center gap-2 text-xs text-navy/60">
          <input type="checkbox" checked={incluirDemo} onChange={(e) => setIncluirDemo(e.target.checked)} />
          Incluir demonstrações
        </label>
      </div>

      {/* 1 — Minha fila priorizada */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Minha fila priorizada</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {priorizada.map((f) => (
            <div key={f.chave}>
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {f.rotulo} · {f.itens.length}
              </p>
              <ul className="mt-2 space-y-2 text-sm">
                {f.itens.map((i) => (
                  <Linha key={`${f.chave}-${i.tipo}-${i.id}`} item={i} />
                ))}
                {f.itens.length === 0 ? <li className="text-xs text-navy/50">Nada nesta faixa.</li> : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Exceções que exigem dono */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Exceções que exigem dono</h2>
        {excecoes.length === 0 ? (
          <p className="mt-2 text-sm text-navy/55">Nenhuma exceção acionável no momento.</p>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-3">
            {excecoes.map((e) => (
              <div key={e.chave}>
                <p className="text-xs uppercase tracking-wide text-navy/50">
                  {e.rotulo} · {e.itens.length}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {e.itens.slice(0, 6).map((i) => (
                    <Linha key={`${e.chave}-${i.tipo}-${i.id}`} item={i} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3 — Comercial hoje */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-navy">Comercial hoje</h2>
          <Link to="/conversao" className="text-xs text-navy/60 underline">
            Conversão e funil
          </Link>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3 text-sm">
          {[
            { rotulo: "Calls de hoje", itens: comercial.calls },
            { rotulo: "Propostas sem follow-up", itens: comercial.propostas },
            { rotulo: "Leads sem próxima ação", itens: comercial.semDisciplina },
          ].map((b) => (
            <div key={b.rotulo}>
              <p className="text-xs uppercase tracking-wide text-navy/50">
                {b.rotulo} · {b.itens.length}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-navy/65">
                {b.itens.slice(0, 5).map((i: any) => (
                  <li key={`${b.rotulo}-${i.id}`}>
                    <Link to="/leads" className="text-navy underline underline-offset-2">
                      {i.rotulo}
                    </Link>
                    {i.responsavel ? ` · ${i.responsavel}` : " · sem responsável"}
                    {i.etapa ? ` · ${rotuloCatalogo("eixo_comercial", i.etapa)}` : ""}
                  </li>
                ))}
                {b.itens.length === 0 ? <li>Nada pendente.</li> : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 4 — Casos hoje */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-navy">Casos hoje</h2>
          <Link to="/casos" className="text-xs text-navy/60 underline">
            Casos 360
          </Link>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {casos.map((i) => (
            <Linha key={`caso-hoje-${i.id}`} item={i} />
          ))}
          {casos.length === 0 ? (
            <li className="text-xs text-navy/50">Nenhum documento, contrato ou ação de caso com prazo hoje ou vencido.</li>
          ) : null}
        </ul>

        {cadencia.length > 0 ? (
          <div className="mt-4 border-t border-navy/10 pt-3">
            <p className="text-xs uppercase tracking-wide text-navy/50">Cadência em atenção ou crítica</p>
            <ul className="mt-2 space-y-1 text-xs text-navy/65">
              {cadencia.map((c: any) => (
                <li key={String(c["id"])}>
                  <Link to="/casos/$caseId" params={{ caseId: String(c["id"]) }} className="text-navy underline underline-offset-2">
                    {String(c["codigo"] ?? c["titulo"] ?? "Caso")}
                  </Link>{" "}
                  · {textoDiasSemTouchpoint(c.cadencia?.diasSemTouchpoint)} · {c.cadencia?.status}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* 5 — Atalhos */}
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h2 className="font-serif text-lg text-navy">Atalhos</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {[
            { to: "/leads" as const, rotulo: "CRM Vivo — leads" },
            { to: "/casos" as const, rotulo: "Casos 360" },
            { to: "/nucleos" as const, rotulo: "Núcleos e dossiês" },
            { to: "/importacoes" as const, rotulo: "Importações e migração" },
          ].map((a) => (
            <Link key={a.to} to={a.to} className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/75 hover:bg-navy/5">
              {a.rotulo}
            </Link>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy/70">
        <button onClick={() => setAjuda((v) => !v)} className="text-xs uppercase tracking-wide text-navy/55">
          {ajuda ? "Ocultar" : "Como ler estas informações"}
        </button>
        {ajuda ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
            <li>Cada registro aparece uma única vez: a ação principal fica aqui, os demais bloqueios na ficha do caso.</li>
            <li>Itens sem responsável são falha de qualidade e precisam de dono antes de entrar na execução.</li>
            <li>Registros de demonstração ficam ocultos por padrão e não alteram indicadores reais.</li>
            <li>Nada aqui é conclusão: dados jurídicos e genealógicos seguem como hipótese até confirmação documental.</li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}
