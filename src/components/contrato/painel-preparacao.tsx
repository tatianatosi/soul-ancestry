/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Painel, Selo, moeda } from "@/components/comercial/base";
import { conferirEscopoProposta, painelPreparacaoContratual } from "@/lib/escopo-conferencia.functions";
import { contextoGatesDaConferencia } from "@/lib/escopo-conferencia";
import { ACOES_GATEADAS, ROTULO_ACAO, ROTULO_GATE, podeExecutar, type AvaliacaoGate } from "@/lib/gates-formalizacao";
import { ROTULO_FONTE_CANONICA } from "@/lib/preco-canonico";

const ROTULO_STATUS: Record<string, string> = {
  aprovado_para_preparacao: "Aprovado para preparação",
  requer_revisao: "Requer revisão humana",
  bloqueado: "Bloqueado",
};

function Bloco({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-navy/15 bg-cream/40 p-3">
      <h3 className="text-sm font-semibold text-navy">
        {n}. {titulo}
      </h3>
      <div className="mt-2 space-y-1 text-xs text-navy/80">{children}</div>
    </section>
  );
}

/** Painel de preparação contratual — leitura, conferência e gates. Não cria nada. */
export function PainelPreparacao({ caseId }: { caseId: string }) {
  const qc = useQueryClient();
  const carregar = useServerFn(painelPreparacaoContratual);
  const conferir = useServerFn(conferirEscopoProposta);
  const chave = ["painel-preparacao", caseId];

  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { caseId } }), retry: false });
  const m = useMutation({
    mutationFn: () => conferir({ data: { caseId } }),
    onSuccess: (r: any) => {
      toast.success(`Conferência registrada: ${ROTULO_STATUS[r.status] ?? r.status}`);
      qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível conferir o escopo."),
  });

  if (q.isLoading) return <Painel titulo="Preparação contratual">Carregando conferência…</Painel>;
  if (q.error) return <Painel titulo="Preparação contratual">{(q.error as any)?.message}</Painel>;

  const d = q.data as any;
  const r = d.resultado;
  const gates: AvaliacaoGate[] = r.gates ?? [];
  const contexto = contextoGatesDaConferencia(r);
  const liberadas = ACOES_GATEADAS.filter((a) => podeExecutar(a, contexto));

  return (
    <Painel titulo="Preparação contratual — conferência e gates">
      <div className="flex flex-wrap items-center gap-2">
        <Selo
          texto={ROTULO_STATUS[r.status] ?? r.status}
          tom={r.status === "aprovado_para_preparacao" ? "ok" : r.status === "requer_revisao" ? "alerta" : "erro"}
        />
        <Selo texto={`Próxima ação: ${r.proxima_acao_recomendada}`} tom="neutro" />
        <button
          type="button"
          onClick={() => m.mutate()}
          disabled={m.isPending}
          className="rounded bg-navy px-3 py-1 text-xs font-medium text-cream disabled:opacity-60"
        >
          {m.isPending ? "Conferindo…" : "Conferir escopo da proposta"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Bloco n={1} titulo="Proposta Canva vigente">
          {d.proposta ? (
            <>
              <p>
                v{d.proposta.versao} · {d.proposta.status} · origem {d.proposta.origem ?? "não registrada"} ·{" "}
                {d.proposta.origem_referencia ?? "sem referência do deck"}
              </p>
              <p>Páginas registradas: {(d.proposta.paginas_registradas ?? []).join(", ") || "nenhuma"}</p>
            </>
          ) : (
            <p>Nenhuma proposta vinculada a este caso.</p>
          )}
        </Bloco>

        <Bloco n={2} titulo="Preço e condição homologados">
          {d.produto ? (
            <p>
              {d.produto.code} · {d.produto.nome_comercial} ·{" "}
              {moeda(d.produto.preco_comercial_vigente, "BRL")} · {d.produto.condicao_comercial_padrao ?? "condição não homologada"}
            </p>
          ) : (
            <p>Case service sem produto canônico vinculado.</p>
          )}
          <p>
            Fonte aplicada: <strong>{ROTULO_FONTE_CANONICA[d.preco?.fonte] ?? d.preco?.fonte ?? "não determinada"}</strong>
          </p>
          {(d.preco?.divergencias ?? []).map((x: any) => (
            <p key={x.fonte} className="text-terracotta">
              Divergência ({ROTULO_FONTE_CANONICA[x.fonte] ?? x.fonte}): {x.descricao}
            </p>
          ))}
        </Bloco>

        <Bloco n={3} titulo="Escopo, família e despesas de terceiros">
          <p>
            Núcleo: {d.nucleo?.nome ?? "não registrado"} · {d.membros.length} pessoa(s) vinculadas.
          </p>
          <p>Despesas de terceiros registradas: {d.despesas.length}</p>
          {(r.conflitos ?? []).length === 0 ? (
            <p>Nenhum conflito de escopo aberto.</p>
          ) : (
            (r.conflitos ?? []).map((c: any) => (
              <p key={`${c.codigo}-${c.campo}`} className="text-terracotta">
                {c.campo}: {c.descricao}
              </p>
            ))
          )}
        </Bloco>

        <Bloco n={4} titulo="Gates de formalização">
          <ul className="space-y-1">
            {gates.map((g) => (
              <li key={g.gate} className={g.ok ? "text-navy/70" : "text-terracotta"}>
                {g.ok ? "✓" : "✗"} {ROTULO_GATE[g.gate] ?? g.gate}
                {g.motivo ? ` — ${g.motivo}` : ""}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco n={5} titulo="Ações liberadas">
          {liberadas.length ? (
            <p>{liberadas.map((a) => ROTULO_ACAO[a] ?? a).join(" · ")}</p>
          ) : (
            <p>Nenhuma ação de formalização liberada até resolver os bloqueios.</p>
          )}
          {(r.bloqueios ?? []).map((b: any) => (
            <p key={b.codigo} className="text-terracotta">
              {b.codigo}: {b.descricao}
            </p>
          ))}
        </Bloco>

        <Bloco n={6} titulo="Campos da proposta Canva (páginas 1–7)">
          <p>
            Deck interno: {d.proposta?.origem_referencia ?? "não registrado"} · páginas usadas:{" "}
            {(r.paginas_usadas ?? []).join(", ") || "nenhuma"}
          </p>
          <p className="mt-1 font-medium text-navy">Extraídos ({(r.campos_extraidos ?? []).length})</p>
          {(r.campos_extraidos ?? []).length ? (
            <ul className="space-y-0.5">
              {(r.campos_extraidos ?? []).map((c: any) => (
                <li key={c.campo}>
                  ✓ {c.label} <span className="text-navy/50">· p. {c.paginas.join(", ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum campo extraído.</p>
          )}
          <p className="mt-1 font-medium text-navy">Não localizados ({(r.campos_ausentes ?? []).length})</p>
          {(r.campos_ausentes ?? []).length ? (
            <ul className="space-y-0.5">
              {(r.campos_ausentes ?? []).map((c: any) => (
                <li key={c.campo} className={c.obrigatorio ? "text-terracotta" : "text-navy/60"}>
                  {c.obrigatorio ? "✗" : "○"} {c.label} <span className="text-navy/50">· p. {c.paginas.join(", ")}</span>
                  {c.obrigatorio ? " · obrigatório" : " · opcional, não declarado"}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum campo pendente.</p>
          )}
          <p className="mt-1">
            Anexos afetados: {(r.anexos_afetados ?? []).join(" · ") || "nenhum"}
          </p>
          <p className="text-navy/50">Nada é inferido: campo não localizado permanece pendência e mantém o bloqueio.</p>
        </Bloco>
      </div>

    </Painel>
  );
}
