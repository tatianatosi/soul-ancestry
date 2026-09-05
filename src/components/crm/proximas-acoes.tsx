import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Selecao, Texto } from "@/components/caso/campos";
import { PROXIMAS_ACOES, type LeadDesk } from "@/lib/crm-desk";
import { listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import { ROTULO_ESTADO_ACAO, listaAcoes, resumoAcoes, type EstadoAcao, type LinhaAcao } from "@/lib/proximas-acoes";

const CARTAO = "rounded-xl border border-navy/10 bg-white p-4";

const COR: Record<EstadoAcao, string> = {
  atrasada: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  hoje: "border-gold/50 bg-gold/15 text-navy",
  proxima: "border-navy/15 bg-cream text-navy",
  sem_data: "border-terracotta/30 bg-terracotta/5 text-terracotta",
  sem_acao: "border-terracotta/30 bg-terracotta/5 text-terracotta",
  futura: "border-navy/10 bg-white text-navy/70",
};

export function ProximasAcoes() {
  const carregar = useServerFn(listarLeadsDesk);
  const salvar = useServerFn(salvarLeadDesk);
  const qc = useQueryClient();

  const [incluirTeste, setIncluirTeste] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<{ proxima_acao: string; proxima_acao_em: string; responsavel_nome: string }>({
    proxima_acao: "",
    proxima_acao_em: "",
    responsavel_nome: "",
  });
  const [erros, setErros] = useState<string[]>([]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads-desk"],
    queryFn: () => carregar({}) as Promise<LeadDesk[]>,
  });

  const linhas = useMemo(() => listaAcoes(leads, { incluirTeste }), [leads, incluirTeste]);
  const resumo = useMemo(() => resumoAcoes(linhas), [linhas]);

  const gravar = useMutation({
    mutationFn: async (leadId: string) =>
      salvar({
        data: {
          id: leadId,
          valores: {
            proxima_acao: rascunho.proxima_acao,
            proxima_acao_em: rascunho.proxima_acao_em,
            responsavel_nome: rascunho.responsavel_nome,
          },
        },
      }),
    onSuccess: (r: { ok: boolean; erros?: { campo?: string; motivo?: string }[] | string[] }) => {
      if (!r.ok) {
        const lista = (r.erros ?? []) as (string | { motivo?: string; campo?: string })[];
        setErros(lista.map((e) => (typeof e === "string" ? e : (e.motivo ?? e.campo ?? "Pendência no lead."))));
        return;
      }
      setErros([]);
      setEditando(null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: (e: Error) => setErros([e.message]),
  });

  function abrir(l: LinhaAcao) {
    setErros([]);
    setEditando(l.leadId);
    setRascunho({
      proxima_acao: l.acao,
      proxima_acao_em: l.prazo ?? "",
      responsavel_nome: l.responsavel,
    });
  }

  return (
    <div className="space-y-4">
      <div className={`${CARTAO} flex flex-wrap items-center gap-3 text-xs text-navy/70`}>
        <span className="font-medium text-navy">{resumo.total} lead(s) na fila</span>
        <span>Atrasadas: {resumo.atrasada}</span>
        <span>Hoje: {resumo.hoje}</span>
        <span>Próximos 7 dias: {resumo.proxima}</span>
        <span>Sem ação ou sem data: {resumo.sem_acao + resumo.sem_data}</span>
        <label className="ml-auto flex items-center gap-2">
          <input type="checkbox" checked={incluirTeste} onChange={(e) => setIncluirTeste(e.target.checked)} />
          Incluir registros de teste
        </label>
      </div>

      <p className="text-xs text-navy/55">
        Cada lead aparece uma única vez. A correção rápida grava na ficha canônica do lead, com auditoria, e não dispara
        nenhuma mensagem, proposta ou cobrança.
      </p>

      {isLoading ? <p className="text-sm text-navy/60">Carregando próximas ações…</p> : null}

      <div className="space-y-3">
        {linhas.map((l) => (
          <article key={l.leadId} className={CARTAO}>
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-[12rem] flex-1">
                <p className="font-serif text-base text-navy">
                  {l.nome} {l.teste ? <span className="text-[10px] uppercase text-terracotta">· registro de teste</span> : null}
                </p>
                <p className="text-xs text-navy/55">{l.codigo}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[11px] ${COR[l.estado]}`}>
                {ROTULO_ESTADO_ACAO[l.estado]}
                {l.estado === "atrasada" ? ` · ${l.diasAtraso} dia(s)` : ""}
              </span>
              <div className="min-w-[12rem] text-xs text-navy/70">
                <p>Ação: {l.acaoRotulo}</p>
                <p>Prazo: {l.prazo ?? "—"}</p>
                <p>Responsável: {l.responsavel || "—"}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy hover:bg-cream"
                onClick={() => (editando === l.leadId ? setEditando(null) : abrir(l))}
              >
                {editando === l.leadId ? "Fechar" : "Corrigir"}
              </button>
            </div>

            {l.pendencias.length ? (
              <ul className="mt-2 space-y-1 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-[11px] text-terracotta">
                {l.pendencias.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            ) : null}

            {editando === l.leadId ? (
              <div className="mt-3 space-y-3 rounded-lg border border-navy/10 bg-cream/50 p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Selecao
                    label="Próxima ação"
                    valor={rascunho.proxima_acao}
                    opcoes={PROXIMAS_ACOES}
                    onChange={(v) => setRascunho((r) => ({ ...r, proxima_acao: v }))}
                  />
                  <Texto
                    label="Data da ação"
                    tipo="date"
                    valor={rascunho.proxima_acao_em}
                    onChange={(v) => setRascunho((r) => ({ ...r, proxima_acao_em: v }))}
                  />
                  <Texto
                    label="Responsável"
                    valor={rascunho.responsavel_nome}
                    onChange={(v) => setRascunho((r) => ({ ...r, responsavel_nome: v }))}
                  />
                </div>
                {erros.length ? (
                  <ul className="space-y-1 text-[11px] text-terracotta">
                    {erros.map((e) => (
                      <li key={e}>• {e}</li>
                    ))}
                  </ul>
                ) : null}
                <button
                  type="button"
                  disabled={gravar.isPending}
                  className="rounded-lg bg-navy px-4 py-2 text-xs text-cream disabled:opacity-60"
                  onClick={() => gravar.mutate(l.leadId)}
                >
                  {gravar.isPending ? "Gravando…" : "Gravar no lead"}
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!isLoading && !linhas.length ? (
          <p className={`${CARTAO} text-sm text-navy/60`}>Nenhum lead ativo na fila de próximas ações.</p>
        ) : null}
      </div>
    </div>
  );
}
