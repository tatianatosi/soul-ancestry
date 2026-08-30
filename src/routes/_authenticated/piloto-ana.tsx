import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { BLOQUEIOS_PILOTO, FORA_DE_ESCOPO_PILOTO, NUCLEO_PILOTO, PILOTO_ANA } from "@/lib/piloto-ana";
import { conferenciaPiloto } from "@/lib/piloto-conferencia";
import { carregarPilotoAna, definirIdCanonicoPiloto, materializarPilotoAna } from "@/lib/piloto-ana.functions";

export const Route = createFileRoute("/_authenticated/piloto-ana")({
  head: () => ({
    meta: [
      { title: "Caso-piloto Ana Luiza — Clube Ancestral" },
      { name: "description", content: "Estado interno consolidado do caso-piloto, bloqueios, núcleo familiar e decisão do identificador canônico." },
      { property: "og:title", content: "Caso-piloto Ana Luiza — Clube Ancestral" },
      { property: "og:description", content: "Piloto em formalização em preparação, situação operacional NO_GO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PilotoAna,
});

const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

function PilotoAna() {
  const queryClient = useQueryClient();
  const carregar = useServerFn(carregarPilotoAna);
  const materializar = useServerFn(materializarPilotoAna);
  const definirId = useServerFn(definirIdCanonicoPiloto);
  const q = useQuery({ queryKey: ["piloto-ana"], queryFn: () => carregar(), retry: false });
  const [escolhido, setEscolhido] = useState(PILOTO_ANA.ids_historicos[0]);
  const [decisor, setDecisor] = useState(PILOTO_ANA.responsavel);

  const mMaterializar = useMutation({
    mutationFn: () => materializar(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["piloto-ana"] }),
  });
  const mId = useMutation({
    mutationFn: (caseId: string) => definirId({ data: { caseId, idCanonico: escolhido, decididoPor: decisor } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["piloto-ana"] }),
  });

  const caso = q.data?.caso ?? null;
  const conferencia = conferenciaPiloto(caso as Record<string, unknown> | null);

  return (
    <SaasShell
      titulo="Caso-piloto Ana Luiza"
      descricao="Estado interno consolidado. Nenhuma ação externa — contrato, cobrança, assinatura, pasta, documento ou mensagem — é executada aqui."
    >
      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando caso-piloto…" />
      ) : (
        <div className="grid gap-4">
          <Bloco titulo="Identificação">
            <dl className="grid gap-2 sm:grid-cols-2">
              {[
                ["Nome", PILOTO_ANA.nome],
                ["País", PILOTO_ANA.pais],
                ["Referência jurídica interna", PILOTO_ANA.referencia_juridica_interna],
                ["Aceite formal", `confirmado em ${new Date(PILOTO_ANA.aceite_formal_confirmado_em).toLocaleDateString("pt-BR")}`],
                ["Estado atual", "formalizacao_em_preparacao"],
                ["Estado operacional", PILOTO_ANA.estado_operacional],
                ["Responsável", PILOTO_ANA.responsavel],
                ["IDs históricos preservados", PILOTO_ANA.ids_historicos.join(" · ")],
              ].map(([r, v]) => (
                <div key={r} className="rounded-lg border border-navy/10 px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-navy/40">{r}</dt>
                  <dd className="text-sm text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-navy/70">{PILOTO_ANA.proposta_observacao}</p>

            {caso ? (
              <div className="mt-3 rounded-lg border border-navy/15 bg-cream px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-navy/40">Status</p>
                <p className="text-sm text-navy">Formalização em preparação</p>
                <p className="mt-1 text-xs text-navy/60">
                  Pendências de formalização: {conferencia.total - conferencia.concluidos}
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {caso ? (
                <>
                  <Link to="/casos/$caseId" params={{ caseId: caso.id }} className="rounded-lg bg-navy px-4 py-2 text-sm text-cream">
                    Abrir caso
                  </Link>
                  <Link to="/casos/$caseId" params={{ caseId: caso.id }} className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy">
                    Editar caso
                  </Link>
                  <Link to="/nucleos" className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy">
                    Ver núcleo familiar
                  </Link>
                  <Link to="/ordens-servico" search={{ caseId: caso.id }} className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy">
                    Criar Ordem de Serviço
                  </Link>
                  <Link to="/onboarding/$id" params={{ id: caso.id }} className="rounded-lg border border-navy/20 px-4 py-2 text-sm text-navy">
                    Iniciar onboarding
                  </Link>
                </>
              ) : (
                <button
                  className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                  disabled={mMaterializar.isPending}
                  onClick={() => mMaterializar.mutate()}
                >
                  {mMaterializar.isPending ? "Registrando…" : "Novo caso"}
                </button>
              )}
              {mMaterializar.isError && <span className="text-sm text-terracotta">{(mMaterializar.error as Error).message}</span>}
            </div>
          </Bloco>

          <details className="rounded-xl border border-navy/10 bg-white p-5">
            <summary className="cursor-pointer font-serif text-base text-navy">
              Dados técnicos — conferência de gates ({conferencia.concluidos} de {conferencia.total})
            </summary>
            <p className="mt-2 text-[11px] text-navy/50">
              Leitura derivada dos mesmos requisitos da ficha operacional. Não altera estado, não bloqueia nenhuma
              ação acima e não libera cobrança, assinatura, pesquisa externa nem comunicação.
            </p>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {conferencia.gates.map((g) => (
                <div
                  key={g.letra}
                  className={
                    "rounded-lg border p-4 " +
                    (g.ok ? "border-navy/10 bg-white" : "border-terracotta/30 bg-white")
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-navy">
                      Gate {g.letra} — {g.nome}
                    </p>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide " +
                        (g.ok ? "bg-gold/15 text-navy" : "bg-terracotta/10 text-terracotta")
                      }
                    >
                      {g.ok ? "conferido" : g.critico ? "crítico pendente" : "pendente"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-navy/60">
                    {g.categoria} · {g.criterio}
                  </p>

                  <ul className="mt-3 space-y-2">
                    {g.campos.map((c) => (
                      <li key={c.campo} className="rounded border border-navy/10 px-3 py-2">
                        <p className="text-xs font-medium text-navy">
                          {c.conferido ? "☑" : "◻"} {c.campo}: <span className="font-normal">{c.valor}</span>
                        </p>
                        <p className="text-[11px] text-navy/55">Origem: {c.origem}</p>
                        <p className="text-[11px] text-navy/55">Evidência exigida: {c.evidencia}</p>
                      </li>
                    ))}
                  </ul>

                  {g.requisitos.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-[11px] text-navy/60">
                      {g.requisitos.map((r) => (
                        <li key={r.chave}>
                          {r.ok ? "☑" : "◻"} Requisito de ativação: {r.rotulo}
                          {r.motivo ? ` — ${r.motivo}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {g.bloqueios.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-[11px] text-terracotta">
                      {g.bloqueios.map((b) => (
                        <li key={b.codigo}>• {b.titulo} — {b.detalhe}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </details>

          <Bloco titulo="Decisão humana do identificador canônico">
            <p className="mb-3 text-xs text-navy/60">
              Nenhum terceiro identificador é criado automaticamente. A escolha abaixo apenas registra a decisão humana e preserva os aliases históricos.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select className="rounded border border-navy/15 px-3 py-2 text-sm" value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
                {PILOTO_ANA.ids_historicos.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
              <input
                className="rounded border border-navy/15 px-3 py-2 text-sm"
                value={decisor}
                onChange={(e) => setDecisor(e.target.value)}
                placeholder="Quem decide"
              />
              <button
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                disabled={!caso || mId.isPending}
                onClick={() => caso && mId.mutate(caso.id)}
              >
                Registrar decisão
              </button>
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Decisão registrada: {caso?.id_canonico_decidido ?? "pendente"}
              {caso?.id_canonico_decidido_por ? ` — ${caso.id_canonico_decidido_por}` : ""}
            </p>
            {mId.isError && <p className="mt-2 text-sm text-terracotta">{(mId.error as Error).message}</p>}
          </Bloco>

          <Bloco titulo={`Pendências de formalização (${BLOQUEIOS_PILOTO.length})`}>
            <ul className="grid gap-2 lg:grid-cols-2">
              {BLOQUEIOS_PILOTO.map((b) => (
                <li key={b.codigo} className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
                  <p className="text-sm text-navy">{b.titulo}</p>
                  <p className="text-[11px] uppercase tracking-wide text-navy/40">{b.dominio}</p>
                  <p className="text-xs text-navy/60">{b.detalhe}</p>
                </li>
              ))}
            </ul>
          </Bloco>

          <Bloco titulo="Núcleo familiar">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Pessoa</th>
                  <th className="py-1 pr-3">Papel</th>
                  <th className="py-1 pr-3">Signatário</th>
                  <th className="py-1 pr-3">Situação</th>
                  <th className="py-1">Observação</th>
                </tr>
              </thead>
              <tbody>
                {NUCLEO_PILOTO.map((m) => (
                  <tr key={m.nome} className="border-t border-navy/5">
                    <td className="py-1 pr-3 text-navy">{m.nome}</td>
                    <td className="py-1 pr-3">{m.papel}</td>
                    <td className="py-1 pr-3">{m.signatario ? "sim" : "não"}</td>
                    <td className="py-1 pr-3">{m.situacao}</td>
                    <td className="py-1 text-navy/60">{m.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-navy/60">
              Registrado no Desk: {(q.data?.membros ?? []).length} membro(s) em {(q.data?.nucleos ?? []).length} núcleo(s).
            </p>
            {FORA_DE_ESCOPO_PILOTO.map((f) => (
              <p key={f.nome} className="mt-2 rounded-lg bg-navy/5 px-3 py-2 text-xs text-navy/70">
                Fora de escopo — {f.nome}: {f.motivo}
              </p>
            ))}
          </Bloco>

          <Bloco titulo="Eventos de conversão do caso">
            {(q.data?.eventos ?? []).length === 0 ? (
              <EstadoVazio mensagem="Nenhum evento registrado ainda." />
            ) : (
              <ul className="space-y-1 text-xs">
                {(q.data?.eventos ?? []).map((e) => (
                  <li key={e.id} className="rounded border border-navy/10 px-3 py-2">
                    {new Date(e.occurred_at).toLocaleString("pt-BR")} — {e.event_type} {e.observacao ? `· ${e.observacao}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </Bloco>
        </div>
      )}
    </SaasShell>
  );
}
