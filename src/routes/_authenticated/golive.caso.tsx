import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { publicarProjecaoApp } from "@/lib/portal-atendimento.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/caso")({
  head: () => ({
    meta: [
      { title: "Caso 360 — Go-live Clube Ancestral" },
      { name: "description", content: "Pessoas, jornada, documentos e microentregas do caso canônico, com publicação manual." },
      { property: "og:title", content: "Caso 360 — Go-live Clube Ancestral" },
      { property: "og:description", content: "Pessoas, jornada, documentos e microentregas do caso canônico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasoGoLive,
});

/** Marcos da jornada, na ordem canônica da fase gravada. */
const MARCOS = [
  { chave: "aceite_e_formalizacao", rotulo: "D0 — Aceite" },
  { chave: "onboarding", rotulo: "D30 — Onboarding" },
  { chave: "pesquisa_inicial", rotulo: "D90 — Pesquisa" },
  { chave: "pesquisa_e_validacao", rotulo: "D120 — Validação" },
  { chave: "preparacao_documental", rotulo: "D180 — Preparação" },
  { chave: "protocolo_e_acompanhamento", rotulo: "D365 — Protocolo" },
] as const;

const ABAS = ["Resumo", "Jornada", "Pessoas", "Pesquisa", "Documentos", "Formalização", "Publicação"] as const;
type Aba = (typeof ABAS)[number];

function CasoGoLive() {
  const { data, isPending, refetch } = useGoLive();
  const publicar = useServerFn(publicarProjecaoApp);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aba, setAba] = useState<Aba>("Resumo");

  const caso = data?.encontrado ? data : null;
  const fase = caso?.plano?.fase ?? caso?.caso.fase ?? null;
  const indiceMarco = MARCOS.findIndex((m) => m.chave === (fase ?? "").toLowerCase());
  const proximoMarco = indiceMarco >= 0 ? MARCOS[indiceMarco + 1] ?? null : null;

  async function publicarMicroentrega() {
    if (!caso) return;
    setEnviando(true);
    try {
      await publicar({ data: { caseId: caso.caso.id, tipo: "marco", conteudo: texto } });
      setTexto("");
      toast.success("Publicado para o App Cliente.");
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível publicar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <GoLiveShell titulo="Caso 360" descricao="Pessoas, jornada, documentos e microentregas.">
      <FaixaFluxo atual="Caso" />

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {!caso && !isPending ? <Vazio cta={<Link to="/golive"><Button size="sm">Voltar para Hoje</Button></Link>} /> : null}

      {caso ? (
        <>
          <section className="min-w-0 rounded-2xl border border-navy/10 bg-white/70 p-4">
            <h2 className="font-serif text-base text-navy break-words">{caso.caso.titulo}</h2>
            <dl className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Campo rotulo="Etapa" valor={humano(fase)} />
              <Campo rotulo="Responsável" valor={caso.caso.responsavel} />
              <Campo rotulo="Próxima ação" valor={humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao)} />
              <Campo rotulo="Prazo" valor={dataHumana(caso.plano?.prazo ?? caso.caso.prazo)} />
            </dl>
          </section>

          <nav aria-label="Seções do caso" className="min-w-0 overflow-x-auto">
            <ul className="flex min-w-0 flex-wrap gap-1.5">
              {ABAS.map((a) => (
                <li key={a}>
                  <button
                    type="button"
                    aria-current={a === aba ? "true" : undefined}
                    onClick={() => setAba(a)}
                    className={
                      a === aba
                        ? "rounded-full bg-gold/25 px-3 py-1.5 text-xs font-semibold text-navy"
                        : "rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
                    }
                  >
                    {a}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {aba === "Resumo" ? (
            <Bloco titulo="Ficha do piloto">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Campo rotulo="Pessoa principal" valor={caso.identidade.pessoaPrincipal} />
                <Campo rotulo="Núcleo familiar" valor={caso.identidade.nucleo} />
                <Campo rotulo="Responsável" valor={caso.identidade.responsavel} />
                <Campo rotulo="Situação" valor={humano(caso.identidade.status)} />
              </dl>
              {caso.identidade.revisarIdentidade ? (
                <div className="rounded-xl border border-[var(--terracota,#9A3A2F)]/40 bg-[var(--terracota,#9A3A2F)]/5 p-3">
                  <p className="text-sm font-semibold text-[var(--terracota,#9A3A2F)]">Revisar identidade</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-navy/80">
                    {caso.identidade.motivosConflito.map((m) => (
                      <li key={m} className="break-words">{m}</li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-navy/55">Nada foi escolhido ou mesclado automaticamente.</p>
                </div>
              ) : (
                <p className="text-xs text-navy/55">Identidade única confirmada para este piloto.</p>
              )}
            </Bloco>
          ) : null}

          {aba === "Jornada" ? (
            <Bloco titulo="Jornada D0–D365">
              <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {MARCOS.map((m, i) => (
                  <li
                    key={m.chave}
                    aria-current={i === indiceMarco ? "step" : undefined}
                    className={
                      i === indiceMarco
                        ? "min-w-0 rounded-xl border border-gold bg-gold/20 px-3 py-2 text-xs font-semibold text-navy"
                        : i < indiceMarco
                          ? "min-w-0 rounded-xl border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70"
                          : "min-w-0 rounded-xl border border-dashed border-navy/15 px-3 py-2 text-xs text-navy/45"
                    }
                  >
                    {m.rotulo}
                  </li>
                ))}
              </ol>
              <p className="text-xs text-navy/55">
                Marco atual: {humano(fase)} · Próximo marco: {proximoMarco ? proximoMarco.rotulo : "Sem itens nesta etapa"}
              </p>
            </Bloco>
          ) : null}

          {aba === "Pessoas" ? (
            <Bloco titulo="Pessoas">
              {caso.pessoas.length ? (
                <ul className="space-y-1 text-sm text-navy">
                  {caso.pessoas.map((p) => (
                    <li key={p.id} className="break-words">
                      {p.nome} {p.papel ? <span className="text-navy/55">— {humano(p.papel)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Vazio cta={<Link to="/golive/pessoas"><Button size="sm">Abrir Pessoas & Famílias</Button></Link>} />
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
                  Abrir Pessoa 360
                </Link>
                <Link to="/golive/pessoas" className="text-sm text-navy underline decoration-gold underline-offset-4">
                  Abrir Pessoas & Famílias
                </Link>
              </div>
            </Bloco>
          ) : null}

          {aba === "Pesquisa" ? (
            <Bloco titulo="Pesquisa do caso">
              <p className="text-sm text-navy/70">A pesquisa deste caso abre pelo caminho canônico do go-live.</p>
              <Link to="/golive/pesquisa">
                <Button size="sm">Abrir pesquisa do caso</Button>
              </Link>
            </Bloco>
          ) : null}

          {aba === "Documentos" ? (
            <Bloco titulo="Documentos">
              {caso.documentos.length ? (
                <ul className="space-y-1 text-sm text-navy">
                  {caso.documentos.map((d) => (
                    <li key={d.id} className="break-words">
                      {d.titulo} {d.status ? <span className="text-navy/55">— {humano(d.status)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Vazio cta={<span className="text-sm text-navy/60">Nenhum documento registrado neste caso.</span>} />
              )}
            </Bloco>
          ) : null}

          {aba === "Formalização" ? (
            <Bloco titulo="Formalização">
              <p className="text-sm text-navy/70">Proposta, escopo e contrato seguem na superfície de formalização.</p>
              <Link to="/golive/formalizacao">
                <Button size="sm">Abrir proposta e escopo</Button>
              </Link>
            </Bloco>
          ) : null}

          {aba === "Publicação" ? (
            <>
              <Bloco titulo="Microentregas">
                {caso.microentregas.length ? (
                  <ul className="space-y-1 text-sm text-navy">
                    {caso.microentregas.map((m) => (
                      <li key={m.id} className="break-words">
                        {m.titulo} {m.status ? <span className="text-navy/55">— {humano(m.status)}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Vazio cta={<span className="text-sm text-navy/60">Publique uma atualização abaixo.</span>} />
                )}
              </Bloco>

              <Bloco titulo="Publicar microentrega no App Cliente">
                <label className="block text-xs uppercase tracking-wide text-navy/50" htmlFor="texto-publicacao">
                  Texto para a cliente
                </label>
                <textarea
                  id="texto-publicacao"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={3}
                  className="w-full max-w-full rounded-xl border border-navy/15 bg-white p-3 text-sm text-navy"
                  placeholder="Ex.: Concluímos a leitura do registro de nascimento do bisavô."
                />
                <Button onClick={() => void publicarMicroentrega()} disabled={enviando || texto.trim().length < 5}>
                  {enviando ? "Publicando…" : "Publicar para a cliente"}
                </Button>
                <p className="text-xs text-navy/55">
                  Publicados até agora: {caso.publicados.length}.{" "}
                  <Link to="/golive/app" className="underline">Ver no App Cliente</Link>
                </p>
              </Bloco>
            </>
          ) : null}
        </>
      ) : null}
    </GoLiveShell>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
