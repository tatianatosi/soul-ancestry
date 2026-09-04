/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { abrirTarefaGate, carregarFechamentoCaso } from "@/lib/fechamento-caso.functions";
import type { GateFechamento } from "@/lib/fechamento-caso";

const CORES: Record<string, string> = {
  concluido: "border-emerald-200 bg-emerald-50 text-emerald-800",
  pendente: "border-amber-200 bg-amber-50 text-amber-900",
  bloqueado: "border-terracotta/30 bg-terracotta/10 text-terracotta",
};

const ROTULO_SITUACAO: Record<string, string> = {
  concluido: "Concluído",
  pendente: "Pendente",
  bloqueado: "Bloqueado",
};

/**
 * Fechamento do caso: os treze gates em uma tela única, com checklist, bloqueios
 * e a ação que o Desk oferece. Nenhum gate avança automaticamente.
 */
export function AbaFechamento({ casoId, bloqueado = false }: { casoId: string; bloqueado?: boolean }) {
  const carregar = useServerFn(carregarFechamentoCaso);
  const abrirTarefa = useServerFn(abrirTarefaGate);
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["fechamento-caso", casoId],
    queryFn: () => carregar({ data: { casoId } }),
  });

  const tarefa = useMutation({
    mutationFn: (gate: GateFechamento) => abrirTarefa({ data: { casoId, gate } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["fechamento-caso", casoId] });
    },
  });

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando fechamento…</p>;
  if (q.error) return <p className="text-sm text-terracotta">{(q.error as Error).message}</p>;

  const dados = q.data!;
  const f = dados.fechamento;
  const podeAgir = dados.podeEscrever && !bloqueado;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-navy/50">Situação do caso no Desk</p>
            <h2 className="font-serif text-xl text-navy">{f.rotuloSituacao}</h2>
            <p className="mt-1 text-sm text-navy/65">Próxima ação — {f.proximaAcao}</p>
          </div>
          <div className="flex gap-2 text-center text-xs">
            {(["concluido", "pendente", "bloqueado"] as const).map((s) => (
              <div key={s} className={"rounded-lg border px-3 py-2 " + CORES[s]}>
                <p className="opacity-70">{ROTULO_SITUACAO[s]}</p>
                <p className="font-serif text-lg">
                  {s === "concluido" ? f.concluidos : s === "pendente" ? f.pendentes : f.bloqueados}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-4">
          {(
            [
              ["Onboarding", f.permite.onboarding],
              ["Caso ativo", f.permite.casoAtivo],
              ["Pesquisa externa", f.permite.pesquisaExterna],
              ["Dossiê ativo", f.permite.dossieAtivo],
            ] as const
          ).map(([rotulo, ok]) => (
            <div
              key={rotulo}
              className={"rounded-lg border px-3 py-2 " + (ok ? CORES['concluido'] : CORES['bloqueado'])}
            >
              {rotulo}: {ok ? "liberado" : "bloqueado"}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-navy/55">
          Cadência: {dados.cadencia.diasSemTouchpoint} dia(s) sem atualização contextualizada · {dados.cadencia.motivo}
        </p>
      </section>

      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h3 className="font-serif text-lg text-navy">Checklist de gates</h3>
        <p className="mt-1 text-xs text-navy/55">
          Cada gate exige evidência registrada. Cobrança, assinatura, pesquisa externa e comunicação continuam sendo atos
          humanos: o Desk apenas referencia o que já aconteceu.
        </p>

        <ul className="mt-4 space-y-3">
          {f.gates.map((g: any) => (
            <li key={g.chave} className="rounded-lg border border-navy/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy">
                    {g.ordem}. {g.rotulo}
                  </p>
                  <p className="text-xs text-navy/55">Estado inicial esperado: {g.estadoInicialEsperado}</p>
                </div>
                <span className={"rounded-full border px-2.5 py-1 text-[11px] " + CORES[g.situacao]}>
                  {ROTULO_SITUACAO[g.situacao]}
                </span>
              </div>

              <dl className="mt-3 grid gap-2 text-xs text-navy/70 sm:grid-cols-2">
                <div>
                  <dt className="uppercase tracking-wide text-navy/45">Condição para avançar</dt>
                  <dd>{g.condicaoAvanco}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-navy/45">Ação no Desk</dt>
                  <dd>{g.acaoDesk}</dd>
                </div>
              </dl>

              {g.motivo ? <p className="mt-2 text-xs text-terracotta">{g.motivo}</p> : null}

              {g.situacao !== "concluido" && podeAgir ? (
                <button
                  type="button"
                  onClick={() => tarefa.mutate(g.chave)}
                  disabled={tarefa.isPending}
                  className="mt-3 rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-navy/5 disabled:opacity-50"
                >
                  Abrir tarefa operacional
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-navy/10 bg-white p-5">
        <h3 className="font-serif text-lg text-navy">Evidências consultadas</h3>
        <ul className="mt-2 grid gap-1 text-xs text-navy/65 sm:grid-cols-2">
          <li>
            Cadastro: {dados.evidencias.cadastroTotal - dados.evidencias.cadastroPendentes}/{dados.evidencias.cadastroTotal}{" "}
            itens obrigatórios validados
          </li>
          <li>Contratos registrados: {dados.evidencias.contratos}</li>
          <li>Cobranças registradas: {dados.evidencias.faturas}</li>
          <li>Núcleos familiares: {dados.evidencias.nucleos}</li>
          <li>Registros de consentimento/autorização: {dados.evidencias.consentimentos}</li>
          <li>Tarefas abertas no caso: {dados.tarefasAbertas.length}</li>
        </ul>
      </section>
    </div>
  );
}
