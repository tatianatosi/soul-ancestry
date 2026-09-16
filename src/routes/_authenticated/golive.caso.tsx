import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo } from "@/components/golive/identidade";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { publicarProjecaoApp } from "@/lib/portal-atendimento.functions";
import {
  aprovarMicroentregaGoLive,
  criarMicroentregaGoLive,
  despublicarDoAppGoLive,
} from "@/lib/golive-escritores.functions";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Barras, LinhaDoTempo } from "@/components/golive/graficos";
import { origemDoSinal } from "@/lib/golive-operacao";
import { montarFicha, resumoLote, type CampoFicha, type LoteFicha } from "@/lib/golive-ficha";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/caso")({
  head: () => ({
    meta: [
      { title: "Caso 360 — Ficha guiada por lotes" },
      { name: "description", content: "Ficha do caso canônico em quatro lotes, com fonte, estado, responsável e visibilidade de cada campo." },
      { property: "og:title", content: "Caso 360 — Ficha guiada por lotes" },
      { property: "og:description", content: "Entrada, pesquisa, formalização e publicação do caso canônico." },
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

type Lote = "A" | "B" | "C" | "D";

function CasoGoLive() {
  const { data, isPending, refetch } = useGoLive();
  const publicar = useServerFn(publicarProjecaoApp);
  const criarMicroentrega = useServerFn(criarMicroentregaGoLive);
  const aprovar = useServerFn(aprovarMicroentregaGoLive);
  const despublicar = useServerFn(despublicarDoAppGoLive);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [lote, setLote] = useState<Lote>("A");

  const caso = data?.encontrado ? data : null;
  const fase = caso?.plano?.fase ?? caso?.caso.fase ?? null;
  const indiceMarco = MARCOS.findIndex((m) => m.chave === (fase ?? "").toLowerCase());
  const proximoMarco = indiceMarco >= 0 ? MARCOS[indiceMarco + 1] ?? null : null;
  const lotes: LoteFicha[] = caso ? montarFicha(caso) : [];
  const loteAtual = lotes.find((l) => l.chave === lote) ?? null;

  const acaoMicroentrega = (
    <Acao
      rotulo="Criar microentrega"
      titulo="Nova microentrega do caso"
      variante="outline"
      campos={[
        { nome: "titulo", rotulo: "Título", obrigatorio: true },
        {
          nome: "criterio",
          rotulo: "Critério de aceite",
          tipo: "area",
          obrigatorio: true,
          ajuda: "O que precisa estar pronto para esta entrega ser considerada concluída.",
        },
        { nome: "descricao", rotulo: "Descrição interna", tipo: "area" },
        { nome: "prazo", rotulo: "Prazo", tipo: "data" },
      ]}
      aoConfirmar={(v) =>
        criarMicroentrega({
          data: {
            titulo: v["titulo"] ?? "",
            descricao: v["descricao"] ?? "",
            prazo: v["prazo"] ?? "",
            criterio: v["criterio"] ?? "",
          },
        })
      }
      confirmacao="Microentrega criada."
    />
  );

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
    <GoLiveShell titulo="Caso 360" descricao="Ficha guiada por lotes, com fonte e estado de cada campo.">
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
          <FaixaKpis itens={lotes.map((item) => {
            const resumo = resumoLote(item);
            return {
              rotulo: item.titulo,
              valor: `${resumo.registrados}/${resumo.total}`,
              tom: resumo.registrados === resumo.total ? "verde" as const : resumo.registrados ? "azul" as const : "cinza" as const,
              fonte: "Ficha canônica do caso",
              formula: "Campos registrados ÷ campos previstos no lote",
              periodo: "Estado atual",
              estado: resumo.registrados === resumo.total ? "Concluído" : resumo.registrados ? "Em andamento" : "Sem registros",
            };
          })} />

          <nav aria-label="Lotes da ficha" className="min-w-0 overflow-x-auto">
            <ul className="flex min-w-0 flex-wrap gap-1.5">
              {lotes.map((l) => {
                const r = resumoLote(l);
                return (
                  <li key={l.chave}>
                    <button
                      type="button"
                      aria-current={l.chave === lote ? "true" : undefined}
                      onClick={() => setLote(l.chave)}
                      className={
                        l.chave === lote
                          ? "rounded-full bg-gold/25 px-3 py-1.5 text-xs font-semibold text-navy"
                          : "rounded-full border border-navy/15 px-3 py-1.5 text-xs text-navy/70"
                      }
                    >
                      {l.titulo} · {r.registrados}/{r.total}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {loteAtual ? (
            <Bloco titulo={loteAtual.titulo}>
              <p className="text-sm text-navy/65">{loteAtual.descricao}</p>
              <ul className="space-y-2">
                {loteAtual.campos.map((c) => (
                  <LinhaCampo key={c.chave} campo={c} />
                ))}
              </ul>
              <p className="text-xs text-navy/55">
                Nada é preenchido por inferência. Campo sem registro segue como ausente, solicitado, em revisão, hipótese ou não aplicável.
              </p>
            </Bloco>
          ) : null}

          {lote === "A" ? (
            <>
              <Bloco titulo="Identidade do piloto">
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
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
                    Abrir Pessoa 360
                  </Link>
                  <Link to="/golive/pessoas" className="text-sm text-navy underline decoration-gold underline-offset-4">
                    Abrir Pessoas & Famílias
                  </Link>
                </div>
              </Bloco>

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

              <Bloco titulo="Linha do tempo do caso">
                {caso.eventos.length ? (
                  <LinhaDoTempo
                    itens={[...caso.eventos]
                      .sort((a, b) => (b.em ?? "").localeCompare(a.em ?? ""))
                      .slice(0, 12)
                      .map((e) => ({
                        id: e.id,
                        titulo: e.titulo,
                        quando: dataHumana(e.em),
                        detalhe: e.responsavel ?? humano(e.fase),
                      }))}
                  />
                ) : (
                  <Vazio cta={<Link to="/golive/kanban"><Button size="sm" variant="outline">Abrir Operação</Button></Link>} />
                )}
              </Bloco>

              <Bloco titulo="Origem do sinal por área">
                {origemDoSinal(caso.eventos).length ? (
                  <Barras titulo="Eventos registrados por área" dados={origemDoSinal(caso.eventos)} />
                ) : (
                  <Vazio cta={<Link to="/golive/kanban"><Button size="sm" variant="outline">Abrir Operação</Button></Link>} />
                )}
              </Bloco>
            </>
          ) : null}

          {lote === "B" ? (
            <>
              <Bloco titulo="Pessoas do caso">
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
              </Bloco>

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

              <Bloco titulo="Pesquisa do caso">
                <p className="text-sm text-navy/70">Pergunta, fonte, evidência e achado seguem na superfície de pesquisa.</p>
                <Link to="/golive/pesquisa">
                  <Button size="sm">Abrir pesquisa do caso</Button>
                </Link>
              </Bloco>
            </>
          ) : null}

          {lote === "C" ? (
            <Bloco titulo="Formalização e financeiro">
              <p className="text-sm text-navy/70">
                Proposta, escopo, contrato, anexos e ordem de serviço abrem nas telas donas. Valor e condição continuam manuais.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/golive/formalizacao"><Button size="sm">Abrir proposta e escopo</Button></Link>
                <Link to="/golive/juridico"><Button size="sm" variant="outline">Abrir Jurídico</Button></Link>
                <Link to="/golive/financeiro"><Button size="sm" variant="outline">Abrir Financeiro</Button></Link>
              </div>
            </Bloco>
          ) : null}

          {lote === "D" ? (
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
                  <Vazio cta={acaoMicroentrega} />
                )}
                {caso.microentregas.length ? (
                  <Acoes>
                    {acaoMicroentrega}
                    <Acao
                      rotulo="Aprovar microentrega"
                      titulo="Revisão humana concluída"
                      variante="outline"
                      campos={[
                        {
                          nome: "id",
                          rotulo: "Microentrega",
                          tipo: "escolha",
                          obrigatorio: true,
                          opcoes: caso.microentregas.map((m) => ({ valor: m.id, rotulo: m.titulo })),
                        },
                        { nome: "evidencia", rotulo: "Evidência da revisão", tipo: "area" },
                      ]}
                      aoConfirmar={(v) => aprovar({ data: { id: v["id"] ?? "", evidencia: v["evidencia"] ?? "" } })}
                      confirmacao="Microentrega aprovada."
                    />
                  </Acoes>
                ) : null}
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
                {caso.publicados.length > 0 ? (
                  <Acoes>
                    <Acao
                      rotulo="Despublicar do App"
                      titulo="Retirar conteúdo do App Cliente"
                      variante="outline"
                      campos={[
                        {
                          nome: "id",
                          rotulo: "Conteúdo publicado",
                          tipo: "escolha",
                          obrigatorio: true,
                          opcoes: caso.publicados.map((p) => ({
                            valor: p.id,
                            rotulo: (p.resumo ?? "Conteúdo").slice(0, 70),
                          })),
                        },
                        { nome: "motivo", rotulo: "Motivo", tipo: "area", obrigatorio: true },
                      ]}
                      aoConfirmar={(v) => despublicar({ data: { id: v["id"] ?? "", motivo: v["motivo"] ?? "" } })}
                      confirmacao="Conteúdo retirado do App. O registro interno permanece."
                    />
                  </Acoes>
                ) : null}
              </Bloco>
            </>
          ) : null}
        </>
      ) : null}
    </GoLiveShell>
  );
}

/** Uma linha da ficha: valor, estado e rastreabilidade do campo. */
function LinhaCampo({ campo }: { campo: CampoFicha }) {
  const cor =
    campo.estado === "registrado"
      ? "border-navy/15 bg-white/70 text-navy"
      : campo.estado === "em revisão" || campo.estado === "hipótese"
        ? "border-gold/50 bg-gold/10 text-navy"
        : "border-dashed border-navy/20 bg-cream/60 text-navy/70";

  return (
    <li className={`min-w-0 rounded-xl border p-3 ${cor}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold break-words">{campo.rotulo}</p>
        <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] uppercase tracking-wide text-navy/65">
          {campo.estado}
        </span>
      </div>
      <p className="mt-1 break-words text-sm">
        {campo.valor ?? "Sem registro — preencher na tela dona."}
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-navy/60 sm:grid-cols-4">
        <Meta rotulo="Fonte" valor={campo.fonte} />
        <Meta rotulo="Responsável" valor={campo.responsavel ?? "não atribuído"} />
        <Meta rotulo="Data" valor={campo.data ? dataHumana(campo.data) : "sem data"} />
        <Meta rotulo="Visibilidade" valor={campo.visibilidade} />
      </dl>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        <Link to={campo.telaDona} className="text-navy underline decoration-gold underline-offset-4">
          {campo.estado === "registrado" ? "Abrir tela dona" : "Preencher na tela dona"}
        </Link>
        <span className="text-navy/55">
          Destino no App: {campo.destinoApp ?? "não vai para o App"}
        </span>
        {campo.vinculo ? <span className="text-navy/40">ID {campo.vinculo.slice(0, 8)}</span> : null}
      </div>
    </li>
  );
}

function Meta({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="uppercase tracking-wide text-navy/45">{rotulo}</dt>
      <dd className="break-words">{valor}</dd>
    </div>
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
