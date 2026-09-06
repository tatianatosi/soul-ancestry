import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SaasShell, EstadoVazio, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoDados } from "@/components/saas/estado-dados";
import { FORA_DE_ESCOPO_PILOTO, NUCLEO_PILOTO, PILOTO_ANA, ROTULO_ORIGEM_PENDENCIA, type PendenciaPiloto } from "@/lib/piloto-ana";
import { carregarPilotoAna, definirIdCanonicoPiloto, materializarPilotoAna } from "@/lib/piloto-ana.functions";

export const Route = createFileRoute("/_authenticated/piloto-ana")({
  head: () => ({
    meta: [
      { title: "Caso-piloto Ana Luiza — Clube Ancestral" },
      { name: "description", content: "Estado interno consolidado do caso-piloto, pendências reais, núcleo familiar e decisão do identificador canônico." },
      { property: "og:title", content: "Caso-piloto Ana Luiza — Clube Ancestral" },
      { property: "og:description", content: "Estado operacional derivado do caso real, sem lista fixa de bloqueios." },
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

function LinhaPendencia({ p }: { p: PendenciaPiloto }) {
  return (
    <li className="rounded-lg border border-navy/10 bg-cream/60 px-3 py-2">
      <p className="text-sm text-navy">{p.descricao}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-navy/40">
        {ROTULO_ORIGEM_PENDENCIA[p.origem]} · {p.entidade}
      </p>
      <p className="text-xs text-navy/60">Estado atual: {p.estadoAtual}</p>
      <p className="text-xs text-navy/60">Tarefa vinculada: {p.tarefaVinculada ?? "nenhuma"}</p>
      {p.acaoRelacionada ? (
        <Link
          to={p.acaoRelacionada.to as never}
          params={(p.acaoRelacionada.params ?? {}) as never}
          className="mt-1 inline-block text-xs font-medium text-terracotta underline"
        >
          {p.acaoRelacionada.rotulo}
        </Link>
      ) : null}
    </li>
  );
}

function PilotoAna() {
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "avancar_caso_planejador_tarefa" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
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
  // Sem fallback silencioso: `undefined` significa consulta não resolvida, e
  // não "nenhuma pendência". A conta abaixo distingue os dois casos.
  const pendencias = q.data?.pendencias as PendenciaPiloto[] | undefined;
  const totalPendencias = pendencias?.length ?? 0;

  return (
    <SaasShell
      titulo="Caso-piloto Ana Luiza"
      descricao="Estado interno consolidado. Nenhuma ação externa — contrato, cobrança, assinatura, pasta, documento ou mensagem — é executada aqui."
    >
      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando caso-piloto…" />
      ) : q.isError ? (
        <div role="alert" className="space-y-2 rounded-xl border border-terracotta/40 bg-terracotta/10 p-5 text-sm text-navy">
          <p>Não foi possível carregar o caso-piloto. O que aparece abaixo não seria o estado real do banco.</p>
          <p className="text-xs text-navy/60">{(q.error as Error)?.message ?? "Falha na consulta."}</p>
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </div>
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
                  {totalPendencias === 0
                    ? "Nenhuma pendência real aberta encontrada no banco para este caso."
                    : `${totalPendencias} pendência(s) real(is) aberta(s) — ver "Dados técnicos e validações" abaixo.`}
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
                  {mMaterializar.isPending ? "Registrando…" : "Localizar ou registrar caso"}
                </button>
              )}
              {mMaterializar.isError && <span className="text-sm text-terracotta">{(mMaterializar.error as Error).message}</span>}
            </div>
            <p className="mt-3 text-[11px] text-navy/45">
              Nenhuma pendência listada abaixo bloqueia editar o caso, a pessoa, a pesquisa, uma tarefa, uma fonte, uma
              proposta rascunho, um contrato rascunho ou uma OS — todas as ações acima continuam disponíveis.
            </p>
          </Bloco>

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
              {/*
                Autoridade operacional: a ausência do caso materializado é
                pendência declarada ao lado, não trava do controle.
              */}
              <button
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                disabled={mId.isPending}
                onClick={() => {
                  if (!caso) {
                    toast.error("Caso-piloto ainda não materializado — use “Localizar ou registrar caso” acima.");
                    return;
                  }
                  mId.mutate(caso.id);
                }}
              >
                Registrar decisão
              </button>
              {!caso ? (
                <span className="text-xs text-navy/60">
                  Pendência registrada: caso-piloto ainda não materializado no banco.
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-navy/60">
              Decisão registrada: {caso?.id_canonico_decidido ?? "pendente"}
              {caso?.id_canonico_decidido_por ? ` — ${caso.id_canonico_decidido_por}` : ""}
            </p>
            {mId.isError && <p className="mt-2 text-sm text-terracotta">{(mId.error as Error).message}</p>}
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
              Registrado no Desk: {q.data?.membros?.length ?? 0} membro(s) em{" "}
              {q.data?.nucleos?.length ?? 0} núcleo(s).
            </p>
            {FORA_DE_ESCOPO_PILOTO.map((f) => (
              <p key={f.nome} className="mt-2 rounded-lg bg-navy/5 px-3 py-2 text-xs text-navy/70">
                Fora de escopo — {f.nome}: {f.motivo}
              </p>
            ))}
          </Bloco>

          <Bloco titulo="Eventos de conversão do caso">
            <EstadoDados
              carregando={q.isLoading}
              erro={q.error}
              dados={q.data?.eventos}
              aoTentarNovamente={() => void q.refetch()}
              recurso="os eventos de conversão do caso"
              vazio="Nenhum evento registrado ainda."
            >
              {(eventos) => (
                <ul className="space-y-1 text-xs">
                  {eventos.map((e) => (
                    <li key={e.id} className="rounded border border-navy/10 px-3 py-2">
                      {new Date(e.occurred_at).toLocaleString("pt-BR")} — {e.event_type}{" "}
                      {e.observacao ? `· ${e.observacao}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </EstadoDados>
          </Bloco>

          {pendencias && pendencias.length > 0 ? (
            <details className="rounded-xl border border-navy/10 bg-white p-5">
              <summary className="cursor-pointer font-serif text-base text-navy">
                Dados técnicos e validações ({totalPendencias} pendência(s) real(is) aberta(s))
              </summary>
              <p className="mt-2 text-[11px] text-navy/50">
                Consultado direto do banco para este caso — nenhum item fixo. Leitura derivada: não altera dado, não
                bloqueia nenhuma ação e não libera cobrança, assinatura, pesquisa externa nem comunicação.
              </p>
              <ul className="mt-4 grid gap-2 lg:grid-cols-2">
                {pendencias.map((p) => (
                  <LinhaPendencia key={p.codigo} p={p} />
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      )}
    </SaasShell>
  );
}
