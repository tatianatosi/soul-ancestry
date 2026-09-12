import { useState } from "react";

import {
  idSecaoContratoBase,
  lerContratoBase,
  letrasDaSecao,
  letrasSemSecaoPublicada,
} from "@/lib/contrato-base-leitor";
import { ADENDOS_TEXTUAIS, clausulasSemSecaoPublicada } from "@/lib/contrato-base-consolidado";

/**
 * Aba Governança > Contrato-base: corpo integral do Contrato-Base v1.0.
 * Somente leitura. Nenhum texto é gerado, resumido ou editável por caso.
 */
export function ContratoBaseLeitor() {
  const doc = lerContratoBase();
  const primeira = doc.secoes[0]?.id;
  const [abertas, setAbertas] = useState<Set<string>>(new Set(primeira ? [primeira] : []));

  const alternar = (id: string) =>
    setAbertas((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });

  const irPara = (id: string) => {
    setAbertas((prev) => new Set(prev).add(id));
    if (typeof document !== "undefined") {
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const orfas = letrasSemSecaoPublicada();
  const clausulasOrfas = clausulasSemSecaoPublicada();

  return (
    <section data-testid="contrato-base-leitor" className="rounded-xl border border-navy/10 bg-cream/40 p-5">
      {/* Cabeçalho obrigatório */}
      <header className="border-b border-navy/10 pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl text-navy">{doc.titulo}</h2>
          <span
            data-testid="contrato-base-status"
            className="rounded-full border border-terracotta/50 bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-terracotta"
          >
            {doc.status}
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-navy/40">
          {doc.contratoId} · {doc.modelo} · {doc.versao} · {doc.data}
        </p>
        <p data-testid="contrato-base-aviso" className="mt-3 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-navy/80">
          {doc.aviso}
        </p>

        <div className="mt-3 rounded-lg border border-navy/10 bg-cream/40 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
            {doc.perfilRotuloEstado.charAt(0).toUpperCase() + doc.perfilRotuloEstado.slice(1)} · {doc.perfilVersao} · sem
            dados pessoais
          </p>
          <dl className="mt-2 grid gap-1 sm:grid-cols-2">
            {doc.perfil.map((c) => (
              <div key={c.campo} className="text-xs">
                <dt className="text-navy/45">{c.rotulo}</dt>
                <dd className="text-navy">{c.valor}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 rounded border border-navy/10 bg-cream/40 p-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
              {doc.qualificacao.titulo} · {doc.qualificacao.versao} · {doc.qualificacao.status}
            </p>
            <p className="mt-1 text-[11px] text-navy/50">
              Texto institucional versionado, não é declaração individual: qualquer alteração passa por governança e revisão
              jurídica.
            </p>
            {doc.qualificacao.paragrafos.map((t) => (
              <p key={t} className="mt-1.5 text-xs leading-relaxed text-navy/75">
                {t}
              </p>
            ))}
            {doc.qualificacao.pendencias.map((t) => (
              <p key={t} className="mt-1.5 text-[11px] text-terracotta">
                {t}
              </p>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-navy/55">
            Revisão: versão {doc.versao} · data de referência {doc.data} · responsável de revisão jurídica não registrado nesta versão.
          </p>
        </div>
      </header>

      {/* Erros explícitos de seção ausente */}
      {doc.erros.length > 0 && (
        <div data-testid="contrato-base-erros" className="mt-4 rounded-lg border border-terracotta/60 bg-terracotta/10 p-3">
          <p className="text-xs font-semibold text-terracotta">Texto de cláusula ausente na fonte canônica — revisão humana necessária</p>
          <ul className="mt-1 space-y-1 text-[11px] text-navy/80">
            {doc.erros.map((e) => (
              <li key={e.secaoId}>
                <span className="font-mono">{e.secaoId}</span> · Seção {e.secao} “{e.titulo}” — {e.motivo}. Versão esperada:{" "}
                {e.versaoEsperada}. Fonte: <span className="font-mono">{e.fonte}</span>.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)]">
        {/* Navegação lateral */}
        <nav aria-label="Seções do contrato-base" className="h-fit rounded-lg border border-navy/10 bg-cream/30 p-2 text-left">
          <p className="px-1 pb-1 text-[10px] uppercase tracking-wide text-navy/45">14 seções publicadas</p>
          <ul className="space-y-0.5">
            {doc.secoes.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => irPara(s.id)}
                  className="w-full rounded px-2 py-1 text-left text-[11px] text-navy/75 hover:bg-gold/15"
                >
                  {s.secao}. {s.titulo}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Corpo integral */}
        <div className="space-y-2">
          {doc.secoes.map((s) => {
            const aberta = abertas.has(s.id);
            return (
              <article key={s.id} id={s.id} data-testid="contrato-base-secao" className="scroll-mt-24 rounded-lg border border-navy/10">
                <button
                  type="button"
                  aria-expanded={aberta}
                  onClick={() => alternar(s.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <span className="text-sm font-medium text-navy">
                    Seção {s.secao} — {s.titulo}
                  </span>
                  <span className="text-xs text-navy/40">{aberta ? "−" : "+"}</span>
                </button>

                {aberta && (
                  <div className="border-t border-navy/10 px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        data-testid="contrato-base-selo"
                        className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/70"
                      >
                        {s.selo}
                      </span>
                      <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] text-navy/60">
                        Contrato-base {s.versao}
                      </span>
                      <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] text-navy/60">
                        {s.clausulasInternas.join(" + ")}
                      </span>
                      {s.equivalenciaMatriz.map((m) => (
                        <span key={m.id} className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] text-navy/60">
                          Cláusula interna {m.id} · {m.tipo}
                        </span>
                      ))}
                      <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] text-navy/60">Fonte: {s.fonte}</span>
                      <span className="rounded-full border border-terracotta/40 bg-terracotta/5 px-2 py-0.5 text-[10px] text-terracotta">
                        Vigência: {s.estadoVigencia}
                      </span>
                    </div>

                    {s.notasDistribuicao.length > 0 ? (
                      <div className="mt-3 rounded border border-navy/15 bg-cream/40 p-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
                          Distribuição entre cláusulas internas e letras A–P
                        </p>
                        <ul className="mt-1 space-y-1">
                          {s.notasDistribuicao.map((n) => (
                            <li key={n} className="text-[11px] leading-relaxed text-navy/70">
                              {n}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-3 space-y-3">
                      {s.paragrafos.map((p) => (
                        <div key={`${s.id}-${p.clausula ?? p.titulo}`}>
                          <p className="text-xs font-semibold text-navy">
                            {p.clausula ? `Cláusula ${p.clausula} — ${p.titulo}` : p.titulo}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {p.itens.map((i) => (
                              <li key={i} className="text-xs leading-relaxed text-navy/75">
                                {i}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Matriz de equivalência — abaixo do texto, nunca no lugar dele */}
      <div className="mt-5 rounded-lg border border-navy/10 bg-cream/20 p-3">
        <p className="text-sm font-medium text-navy">Matriz de equivalência — 14 seções publicadas → cláusulas A–P</p>
        <p className="mt-1 text-[11px] text-navy/55">Clique em uma linha para abrir e rolar até a cláusula correspondente.</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[11px]">
            <thead className="text-navy/55">
              <tr>
                <th className="py-1 pr-2 font-medium">Seção</th>
                <th className="py-1 pr-2 font-medium">Título</th>
                <th className="py-1 pr-2 font-medium">Cláusula interna</th>
                <th className="py-1 pr-2 font-medium">A–P</th>
                <th className="py-1 font-medium">Fonte versionada</th>
              </tr>
            </thead>
            <tbody>
              {doc.secoes.map((s) => (
                <tr
                  key={s.id}
                  data-testid="contrato-base-matriz-linha"
                  role="button"
                  tabIndex={0}
                  onClick={() => irPara(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") irPara(s.id);
                  }}
                  className="cursor-pointer border-t border-navy/10 text-navy/75 hover:bg-gold/10"
                >
                  <td className="py-1 pr-2">{s.secao}</td>
                  <td className="py-1 pr-2">{s.titulo}</td>
                  <td className="py-1 pr-2">{s.clausulasInternas.join(" + ")}</td>
                  <td className="py-1 pr-2">{letrasDaSecao(s.secao).join(", ")}</td>
                  <td className="py-1">{s.fonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(orfas.length > 0 || clausulasOrfas.length > 0) && (
          <p className="mt-2 text-[11px] text-terracotta">
            {orfas.length > 0 && <>Cláusulas A–P sem seção publicada: {orfas.join(", ")}. </>}
            {clausulasOrfas.length > 0 && <>Cláusulas internas sem seção publicada: {clausulasOrfas.join(", ")}. </>}
            Revisão humana necessária.
          </p>
        )}
      </div>
      <div data-testid="contrato-base-adendos" className="mt-6 rounded-lg border border-navy/10 bg-cream/30 p-4">
        <h3 className="font-serif text-sm text-navy">Adendos textuais em revisão jurídica</h3>
        <p className="mt-1 text-[11px] text-navy/60">
          Acréscimos ao contrato-base. Não reescrevem as 14 cláusulas, não habilitam assinatura e não declaram regra
          jurídica aprovada.
        </p>
        {ADENDOS_TEXTUAIS.map((adendo) => (
          <article key={adendo.id} data-testid="contrato-base-adendo" className="mt-3 border-t border-navy/10 pt-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm text-navy">{adendo.titulo}</h4>
              <span className="rounded-full border border-terracotta/50 bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-terracotta">
                {adendo.status}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-navy/40">{adendo.id}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-navy/80">
              {adendo.itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
