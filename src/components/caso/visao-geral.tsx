/**
 * Visão Geral do caso — linha do tempo operacional como visão padrão.
 * Somente leitura: nenhuma ação externa é executada a partir daqui.
 */
import { Link } from "@tanstack/react-router";
import { montarLinhaDoTempo, rotuloEvento, faseDoEvento, type EventoTimeline } from "@/lib/timeline-caso";
import { STATUS_FILA_DRIVE } from "@/lib/drive-provisioning";
import { STATUS_PREPARACAO_BLUEPRINT } from "@/lib/blueprint";
import {
  resumoGatesAtivacao,
  gatesPorCategoria,
  estadoDerivadoPorGates,
  passosFormalizacao,
  previsoesCondicionais,
  CHECAGEM_REPRESENTACAO,
  ESCOPO_SOLICITACAO_D1,
  REGRAS_EXCECAO_GATE,
} from "@/lib/gates-ativacao-ficha";
import { posicionar } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL, type SinalPrioridade } from "@/lib/prioridade-matriz";
import { papelDoRegistro } from "@/lib/caso-ficha";


/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

function data(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString("pt-BR") : "—";
}

const TOM_SINAL: Record<SinalPrioridade, string> = {
  critica: "border-terracotta/50 bg-terracotta/10 text-terracotta",
  atencao: "border-gold/60 bg-gold/15 text-navy",
  acompanhada: "border-navy/15 bg-navy/5 text-navy/75",
  sem_dados: "border-navy/10 bg-navy/5 text-navy/50",
};

/**
 * O mesmo sinal que a Matriz de Prioridades (`/qualidade`) já calcula para
 * todo caso — trazido para dentro da ficha, para não obrigar quem está
 * olhando UM caso a ir a outra tela ler a urgência dele.
 */
function FaixaPrioridade({ caso }: { caso: Linha }) {
  const p = posicionar({
    tipo: "caso",
    id: String(caso["id"] ?? ""),
    rotulo: String(caso["codigo"] ?? caso["titulo"] ?? caso["id"] ?? ""),
    elegibilidade: (caso["hipotese_elegibilidade"] as string) ?? null,
    prazo: (caso["prazo_proxima_acao"] as string) ?? null,
    diasSemTouchpoint: (caso["dias_sem_touchpoint"] as number) ?? null,
    esperaExternaAtiva: Boolean(caso["aguardando_instituicao_externa"]),
    responsavel: (caso["proxima_acao_responsavel"] as string) ?? null,
    origem: papelDoRegistro(caso).valor === "demo" ? "demo" : "real",
  });

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${TOM_SINAL[p.sinal]}`}>
      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        {ROTULO_SINAL[p.sinal]}
      </span>
      <p className="text-sm">{p.porque}</p>
      <Link to="/qualidade" className="ml-auto text-xs font-medium underline underline-offset-2">
        Ver na matriz de prioridades
      </Link>
    </div>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="mb-3 font-serif text-lg text-navy">{titulo}</h2>
      {children}
    </section>
  );
}

function Evento({ e }: { e: EventoTimeline }) {
  return (
    <li className="border-l-2 border-gold/60 pl-3">
      <p className="text-sm font-medium text-navy">
        {rotuloEvento(e.event_type)} — {e.title}
      </p>
      <p className="text-xs text-navy/55">
        Fase {e.phase ?? faseDoEvento(e.event_type)} · {e.status}
        {e.occurred_at ? ` · ocorrido em ${data(e.occurred_at)}` : ""}
        {e.due_at ? ` · previsão condicional para ${data(e.due_at)}` : ""}
        {e.responsavel_nome ? ` · ${e.responsavel_nome}` : ""}
      </p>
      {e.due_at && new Date(e.due_at).getTime() > Date.now() ? (
        <p className="mt-1 text-[11px] text-navy/55">
          Data prevista, não contratada: depende dos gates de ativação pendentes.
        </p>
      ) : null}
      {e.summary_internal ? <p className="mt-1 text-xs text-navy/70">{e.summary_internal}</p> : null}
    </li>
  );
}

export function AbaVisaoGeral({
  caso,
  timeline,
  blueprint,
  filaDrive,
}: {
  caso: Linha;
  timeline: Linha[];
  blueprint: Linha[];
  filaDrive: Linha[];
}) {
  const eventos = timeline as EventoTimeline[];
  const t = montarLinhaDoTempo(eventos);
  const gates = resumoGatesAtivacao(caso);
  const categorias = gatesPorCategoria(caso);
  const derivado = estadoDerivadoPorGates(caso);
  const passos = passosFormalizacao(caso);
  const previsoes = previsoesCondicionais(caso);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <FaixaPrioridade caso={caso} />
      </div>

      <section className="rounded-xl border border-navy/15 bg-white p-5 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-lg text-navy">
            Requisitos de ativação — {gates.concluidos} de {gates.total} com evidência
          </h2>
          <Link
            to={gates.rotaAcao}
            className={
              "rounded-lg px-4 py-2 text-sm font-medium " +
              (gates.elegivel ? "bg-navy text-cream" : "border border-navy/20 bg-navy/5 text-navy/70")
            }
          >
            {gates.rotuloBotao}
          </Link>
        </div>

        <div
          className={
            "mt-3 rounded-lg border px-3 py-2 " +
            (derivado.elegivel ? "border-navy/15 bg-navy/5" : "border-terracotta/40 bg-terracotta/10")
          }
        >
          <p className="text-[11px] uppercase tracking-wide text-navy/50">Estado derivado pelos requisitos</p>
          <p className="text-sm font-medium text-navy">{derivado.rotulo}</p>
          <p className="mt-1 text-xs text-navy/65">{derivado.explicacao}</p>
        </div>

        <p className="mt-2 text-xs text-navy/55">
          {gates.elegivel
            ? "Elegível para ativação. A decisão continua sendo humana e validada no servidor."
            : "Ativação bloqueada. Nenhuma data futura autoriza operação, cobrança ou ambiente do cliente."}
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {categorias.map((c) => (
            <div key={c.categoria} className="rounded-lg border border-navy/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-navy">{c.categoria}</p>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide " +
                    (c.estado === "concluida" ? "bg-gold/15 text-navy" : "bg-terracotta/10 text-terracotta")
                  }
                >
                  {c.estado === "concluida" ? "completa" : "pendente"} · {c.concluidos}/{c.total}
                </span>
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {c.itens.map((g) => (
                  <li
                    key={g.chave}
                    className={
                      "rounded-lg border px-3 py-2 " +
                      (g.ok
                        ? "border-navy/10 bg-navy/5 text-navy/75"
                        : "border-terracotta/40 bg-terracotta/10 text-navy")
                    }
                  >
                    <span className="mr-2 font-mono">{g.ok ? "☑" : "◻"}</span>
                    <span className="font-medium">{g.rotulo}</span>
                    <span className="ml-2 text-xs text-navy/55">
                      Responsável: {g.responsavel}
                      {g.motivo ? ` · ${g.motivo}` : " · concluído"}
                    </span>
                    <p className="mt-1 text-xs text-navy/60">
                      Evidência exigida: {g.evidencia}{" "}
                      <Link to={g.destino.rota} className="font-medium text-navy underline">
                        {g.destino.rotulo}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy/50">
          Exceção a um gate — condições mínimas
        </p>
        <ul className="mt-1 space-y-1 text-xs text-navy/70">
          {REGRAS_EXCECAO_GATE.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-navy/55">
          Alterar a data de uma previsão não muda status, não habilita ação e não recalcula elegibilidade: os gates
          são revalidados no servidor a cada tentativa, e tentativas bloqueadas ficam auditadas.
        </p>
      </section>

      <Cartao titulo="Formalização — sequência com critério de conclusão">
        <ol className="space-y-2 text-sm">
          {passos.map((p) => (
            <li key={p.ordem} className="rounded-lg border border-navy/10 bg-navy/5 px-3 py-2">
              <p className="font-medium text-navy">
                {p.ordem}. {p.acao} {p.ok ? "· concluída" : "· pendente"}
              </p>
              <p className="text-xs text-navy/60">
                Concluída quando: {p.concluidaQuando} · Responsável: {p.responsavel}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy/50">
          Checagem formal antes da versão definitiva
        </p>
        <ul className="mt-1 space-y-1 text-xs text-navy/70">
          {CHECAGEM_REPRESENTACAO.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="Previsões condicionais (não são marcos contratados)">
        {previsoes.length ? (
          <ul className="space-y-2 text-sm">
            {previsoes.map((p) => (
              <li key={p.chave} className="rounded-lg border border-dashed border-gold/60 bg-gold/10 px-3 py-2">
                <p className="font-medium text-navy">
                  {p.rotulo}: {p.data}
                  <span className="ml-2 rounded-full border border-gold/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/70">
                    Previsão condicional
                  </span>
                </p>
                <p className="text-xs text-navy/60">{p.condicao}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/55">Nenhuma previsão registrada.</p>
        )}
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy/50">
          Solicitação em D+1 — limite de escopo
        </p>
        <ul className="mt-1 space-y-1 text-xs text-navy/70">
          {ESCOPO_SOLICITACAO_D1.permitido.map((i) => (
            <li key={i}>✓ {i}</li>
          ))}
          {ESCOPO_SOLICITACAO_D1.bloqueado.map((i) => (
            <li key={i} className="text-terracotta">
              ✕ Bloqueado até a ativação: {i}
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="Passado registrado">
        {t.passado.length ? (
          <ul className="space-y-3">
            {t.passado.map((e, i) => (
              <Evento key={e.id ?? i} e={e} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/55">Nenhum evento registrado ainda.</p>
        )}
      </Cartao>

      <Cartao titulo="Próximos marcos previstos (condicionais)">
        {t.proximosMarcos.length ? (
          <ul className="space-y-3">
            {t.proximosMarcos.map((e, i) => (
              <Evento key={e.id ?? i} e={e} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy/55">Nenhum marco previsto.</p>
        )}
      </Cartao>

      <Cartao titulo="Bloqueios, responsável e próxima ação">
        <p className="text-sm text-navy">
          <span className="text-navy/55">Responsável principal:</span> {caso["responsavel_principal"] ?? "—"}
        </p>
        <p className="mt-1 text-sm text-navy">
          <span className="text-navy/55">Próxima ação:</span>{" "}
          {t.proximaAcao?.next_action ?? t.proximaAcao?.title ?? caso["proxima_acao"] ?? "—"}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-navy/80">
          {t.bloqueios.length ? (
            t.bloqueios.map((e, i) => (
              <li key={e.id ?? i} className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2">
                {rotuloEvento(e.event_type)} — {e.title}
              </li>
            ))
          ) : (
            <li className="text-navy/55">Sem bloqueios registrados na linha do tempo.</li>
          )}
        </ul>
        {t.alertas.length ? (
          <ul className="mt-3 space-y-1 text-xs text-navy/70">
            {t.alertas.map((a, i) => (
              <li key={i}>⚠ {a}</li>
            ))}
          </ul>
        ) : null}
      </Cartao>

      <Cartao titulo="Blueprint e fila do Drive">
        <p className="text-xs uppercase tracking-wide text-navy/50">Ancestral Blueprint</p>
        {blueprint.length ? (
          <ul className="mt-1 space-y-1 text-sm text-navy/80">
            {blueprint.map((b) => (
              <li key={b["id"]}>
                Preparação: {STATUS_PREPARACAO_BLUEPRINT.find((s) => s.valor === b["status_preparacao"])?.rotulo ?? b["status_preparacao"]} ·
                origem do preço: {b["origem_preco"]} · valor: {b["preco_comercial_vigente"] ?? "—"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-navy/55">Nenhum Blueprint registrado para este caso.</p>
        )}

        <p className="mt-4 text-xs uppercase tracking-wide text-navy/50">Fila de provisionamento do Drive</p>
        {filaDrive.length ? (
          <ul className="mt-1 space-y-1 text-sm text-navy/80">
            {filaDrive.map((f) => (
              <li key={f["id"]}>
                {f["stage_trigger"]} → {STATUS_FILA_DRIVE.find((s) => s.valor === f["status"])?.rotulo ?? f["status"]}
                {f["external_result_reference"] ? ` · resultado: ${f["external_result_reference"]}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-navy/55">Nenhum item na fila. Nada é criado no Drive automaticamente.</p>
        )}
      </Cartao>
    </div>
  );
}
