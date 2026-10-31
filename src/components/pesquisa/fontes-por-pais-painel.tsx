import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { CaCard } from "@/components/ui/ca-card";
import { PAISES_LINHA_PRIORITARIA } from "@/lib/crm-desk";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import { PRIORIDADES } from "@/lib/fontes-genealogicas";
import { painelFontes, salvarBacklogFonte, salvarFonte } from "@/lib/fontes-genealogicas.functions";
import {
  eixoDoPais,
  montarSugestaoFonte,
  resumoFontesPorPais,
  type FonteCatalogo,
  type ResumoFontesPais,
} from "@/lib/fontes-por-pais";

/**
 * Cobertura de fontes por país, EDITÁVEL (decisão da Proprietária, 31/10/2026).
 *
 * Uma regra, três telas: Fontes genealógicas, Validação Jurídica e o Roteiro
 * Discovery / Painel de Calls montam este mesmo componente. Antes ele era só
 * leitura em Fontes genealógicas.
 *
 * País habilitado sem base catalogada deixa de ser silêncio e vira ação:
 * registrar a sugestão de fonte cria uma fonte CANDIDATA (sem homologação) e um
 * item no backlog de ativação, com motivo — nenhuma tabela nova, nada de
 * consulta externa. Sugestão não vira "base": o país só sai de "em preparação"
 * como sugestão registrada, e só ganha base quando a candidata é avaliada.
 *
 * Com `paisValor` (Discovery/Calls), mostra só o país do lead em atendimento.
 * Compartilha a chave de cache `g08-fontes` com a tela de Fontes genealógicas.
 */

const ROTULO_ESTADO: Record<ResumoFontesPais["estado"], string> = {
  com_base: "Com base catalogada",
  sugestao_registrada: "Sugestão registrada",
  em_preparacao: "Em preparação",
};

type Rascunho = {
  paisValor: string;
  nome: string;
  motivo: string;
  prioridade: keyof typeof PRIORIDADES;
};

export function FontesPorPaisPainel({
  paisValor,
  className,
}: {
  /** Valor do país do lead/caso (ex.: `austria`). Sem ele, lista todos os países habilitados. */
  paisValor?: string | null;
  className?: string;
}) {
  const carregar = useServerFn(painelFontes);
  const criarFonte = useServerFn(salvarFonte);
  const criarBacklog = useServerFn(salvarBacklogFonte);
  const qc = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["g08-fontes"],
    queryFn: () => carregar({} as never),
  });

  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  useAvisoEdicaoNaoSalva(Boolean(rascunho && (rascunho.nome.trim() || rascunho.motivo.trim())));

  const resumo = useMemo(() => {
    const todos = resumoFontesPorPais(
      PAISES_LINHA_PRIORITARIA,
      (data?.fontes ?? []) as unknown as FonteCatalogo[],
    );
    return paisValor ? todos.filter((r) => r.valor === paisValor) : todos;
  }, [data?.fontes, paisValor]);

  const registrar = useMutation({
    mutationFn: async (r: Rascunho & { rotulo: string }) => {
      const s = montarSugestaoFonte({
        paisValor: r.paisValor,
        paisRotulo: r.rotulo,
        nome: r.nome,
        motivo: r.motivo,
        prioridade: r.prioridade,
      });
      const fonte = await criarFonte({ data: { valores: s.fonte } });
      try {
        await criarBacklog({ data: { valores: s.backlog(fonte.id) } });
      } catch (e) {
        throw new Error(
          `A fonte candidata foi registrada, mas o item de backlog não (${
            e instanceof Error ? e.message : "erro desconhecido"
          }). Abra Fontes genealógicas e registre o backlog dessa fonte.`,
        );
      }
    },
    onSuccess: () => {
      toast.success("Sugestão registrada no backlog de ativação.");
      setRascunho(null);
      void qc.invalidateQueries({ queryKey: ["g08-fontes"] });
    },
    onError: (e: Error) => {
      toast.error(e.message);
      void qc.invalidateQueries({ queryKey: ["g08-fontes"] });
    },
  });

  if (paisValor && !eixoDoPais(paisValor)) {
    return (
      <CaCard titulo="Fontes do país" eyebrow="Fontes · países" className={className}>
        <p className="text-xs text-navy/60" data-fontes-pais-sem-eixo>
          Este lead não tem um país com eixo no catálogo de fontes (multipaís ou a definir); não há
          cobertura a mostrar.
        </p>
      </CaCard>
    );
  }

  const podeEditar = Boolean(data?.podeEditar);

  return (
    <CaCard
      titulo={paisValor ? "Fontes do país do lead" : "Cobertura de fontes por país"}
      eyebrow="Fontes · países"
      className={className}
    >
      {!paisValor ? (
        <p className="-mt-1 mb-3 text-[11px] text-navy/50">
          Países habilitados no Planejador e quantas fontes vivas o catálogo tem para cada um. País
          sem base aceita sugestão de fonte, que vai para o backlog de ativação.
        </p>
      ) : null}
      {isPending ? <p className="text-xs text-navy/60">Carregando a cobertura de fontes…</p> : null}
      {error ? (
        <p className="text-xs text-terracotta" data-fontes-pais-erro>
          Não foi possível carregar a cobertura de fontes: {(error as Error).message}
        </p>
      ) : null}
      <ul className="space-y-3" data-fontes-cobertura-pais>
        {resumo.map((r) => {
          const aberto = rascunho?.paisValor === r.valor;
          return (
            <li
              key={r.valor}
              data-fontes-pais={r.estado}
              data-fontes-pais-valor={r.valor}
              className="text-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium text-navy">{r.rotulo}</span>
                <span className="text-xs text-navy/60">
                  {ROTULO_ESTADO[r.estado]}
                  {r.estado === "com_base"
                    ? ` · ${r.fontes} ${r.fontes === 1 ? "fonte" : "fontes"} · ${r.comRota} com endereço`
                    : r.sugestoes > 0
                      ? ` · ${r.sugestoes} ${r.sugestoes === 1 ? "candidata" : "candidatas"}`
                      : ""}
                </span>
              </div>
              {r.mensagem ? (
                <p className="mt-1 max-w-xl text-xs text-terracotta">{r.mensagem}</p>
              ) : null}
              {r.estado !== "com_base" && podeEditar && !aberto ? (
                <button
                  type="button"
                  data-fontes-pais-sugerir
                  onClick={() =>
                    setRascunho({ paisValor: r.valor, nome: "", motivo: "", prioridade: "media" })
                  }
                  className="mt-2 rounded-lg border border-navy/20 px-3 py-1.5 text-[11px] text-navy hover:bg-navy/5"
                >
                  Registrar sugestão de fonte
                </button>
              ) : null}
              {aberto && rascunho ? (
                <div
                  className="mt-2 grid gap-2 rounded-lg border border-navy/15 bg-navy/5 p-3 sm:grid-cols-2"
                  data-fontes-pais-form
                >
                  <label className="text-[10px] uppercase tracking-wide text-navy/50">
                    Nome da fonte sugerida
                    <input
                      className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-[11px] normal-case tracking-normal text-navy"
                      value={rascunho.nome}
                      onChange={(e) => setRascunho({ ...rascunho, nome: e.target.value })}
                    />
                  </label>
                  <label className="text-[10px] uppercase tracking-wide text-navy/50">
                    Prioridade
                    <select
                      className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-[11px] normal-case tracking-normal text-navy"
                      value={rascunho.prioridade}
                      onChange={(e) =>
                        setRascunho({
                          ...rascunho,
                          prioridade: e.target.value as Rascunho["prioridade"],
                        })
                      }
                    >
                      {Object.entries(PRIORIDADES).map(([valor, rotulo]) => (
                        <option key={valor} value={valor}>
                          {rotulo}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[10px] uppercase tracking-wide text-navy/50 sm:col-span-2">
                    Motivo da sugestão
                    <textarea
                      className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-[11px] normal-case tracking-normal text-navy"
                      rows={2}
                      value={rascunho.motivo}
                      onChange={(e) => setRascunho({ ...rascunho, motivo: e.target.value })}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      type="button"
                      disabled={
                        registrar.isPending || !rascunho.nome.trim() || !rascunho.motivo.trim()
                      }
                      onClick={() => registrar.mutate({ ...rascunho, rotulo: r.rotulo })}
                      className="rounded-lg bg-navy px-4 py-2 text-[11px] text-white disabled:opacity-50"
                    >
                      {registrar.isPending ? "Registrando…" : "Registrar no backlog"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRascunho(null)}
                      className="rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </CaCard>
  );
}
