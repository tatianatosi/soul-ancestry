import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import {
  FONTES_CADASTRO,
  PESSOA_TIPOS,
  STATUS_CADASTRO,
  itemResolvido,
  rotuloFonte,
  rotuloStatus,
  type ItemChecklist,
} from "@/lib/cadastro-checklist";
import {
  carregarChecklistCadastral,
  registrarAcaoCadastro,
  salvarItemChecklist,
  semearChecklistCadastral,
} from "@/lib/cadastro-checklist.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-white px-2 py-1.5 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy/10 bg-cream/40 p-4">
      <h3 className="text-sm font-semibold text-navy">{titulo}</h3>
      {descricao ? <p className="mb-3 text-xs text-navy/55">{descricao}</p> : <div className="mb-3" />}
      {children}
    </section>
  );
}

export function AbaCadastro({ caseId, bloqueado }: { caseId: string; bloqueado?: boolean }) {
  const qc = useQueryClient();
  const carregar = useServerFn(carregarChecklistCadastral);
  const semear = useServerFn(semearChecklistCadastral);
  const salvar = useServerFn(salvarItemChecklist);
  const registrar = useServerFn(registrarAcaoCadastro);

  const [erro, setErro] = useState<string | null>(null);
  const [prazo, setPrazo] = useState("");
  const [pessoaAcao, setPessoaAcao] = useState("");

  const q = useQuery({
    queryKey: ["checklist-cadastral", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    retry: false,
  });
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["checklist-cadastral", caseId] });

  const mSemear = useMutation({
    mutationFn: () => semear({ data: { caseId } }),
    onSuccess: () => { setErro(null); recarregar(); },
    onError: (e: any) => setErro(e?.message ?? "Falha ao registrar o checklist."),
  });
  const mSalvar = useMutation({
    mutationFn: (v: any) => salvar({ data: v }),
    onSuccess: () => { setErro(null); recarregar(); },
    onError: (e: any) => setErro(e?.message ?? "Falha ao salvar o item."),
  });
  const mAcao = useMutation({
    mutationFn: () => registrar({ data: { caseId, prazo, pessoa: pessoaAcao } }),
    onSuccess: () => { setErro(null); recarregar(); },
    onError: (e: any) => setErro(e?.message ?? "Falha ao registrar a ação."),
  });

  const itens = (q.data?.itens ?? []) as ItemChecklist[];
  const grupos = [...new Set(itens.map((i) => `${i.pessoa_tipo}::${i.pessoa_nome}`))];

  return (
    <div className="space-y-4">
      {erro ? <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{erro}</p> : null}

      <Secao
        titulo="Checklist cadastral por pessoa"
        descricao="Cada dado pertence à pessoa, não ao caso. Nada é inferido: sem fonte declarada e data, o item continua pendente. Nenhum formulário, mensagem ou documento externo é criado aqui."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            disabled={bloqueado || mSemear.isPending}
            onClick={() => mSemear.mutate()}
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-50"
          >
            {itens.length ? "Completar linhas faltantes" : "Registrar checklist das pessoas do caso"}
          </button>
          <span className="text-navy/55">
            {(q.data?.resumo ?? []).map((r: any) => `${r.pessoa_nome}: ${r.resolvidos}/${r.total}`).join(" · ") ||
              "Nenhuma linha registrada."}
          </span>
        </div>
      </Secao>

      {grupos.map((g) => {
        const [tipo, nome] = g.split("::");
        const lista = itens.filter((i) => `${i.pessoa_tipo}::${i.pessoa_nome}` === g);
        const rotuloTipo = PESSOA_TIPOS.find((p) => p.valor === tipo)?.rotulo ?? tipo;
        return (
          <Secao
            key={g}
            titulo={`${nome} — ${rotuloTipo}`}
            descricao={
              tipo === "contratada"
                ? "Dados oficiais da contratada: só podem ser marcados como verificados a partir de fonte societária."
                : "Status, fonte, data de verificação e acesso restrito por dado."
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-navy/50">
                  <tr>
                    <th className="py-2 pr-3">Dado</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Fonte</th>
                    <th className="py-2 pr-3">Verificado em</th>
                    <th className="py-2 pr-3">Acesso restrito</th>
                    <th className="py-2">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((i) => (
                    <tr key={i.id} className="border-t border-navy/5 align-top">
                      <td className="py-2 pr-3 text-navy">
                        {i.campo_rotulo}
                        {i.obrigatorio ? "" : " (opcional)"}
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className={inputCls}
                          value={i.status}
                          disabled={bloqueado}
                          onChange={(e) => mSalvar.mutate({ id: i.id, status: e.target.value })}
                        >
                          {STATUS_CADASTRO.map((s) => (
                            <option key={s.valor} value={s.valor}>{s.rotulo}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className={inputCls}
                          value={i.fonte ?? "nao_declarada"}
                          disabled={bloqueado}
                          onChange={(e) => mSalvar.mutate({ id: i.id, fonte: e.target.value })}
                        >
                          {FONTES_CADASTRO.map((f) => (
                            <option key={f.valor} value={f.valor}>{f.rotulo}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="date"
                          className={inputCls}
                          value={i.data_verificacao ?? ""}
                          disabled={bloqueado}
                          onChange={(e) => mSalvar.mutate({ id: i.id, data_verificacao: e.target.value })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={i.acesso_restrito}
                          disabled={bloqueado}
                          onChange={(e) => mSalvar.mutate({ id: i.id, acesso_restrito: e.target.checked })}
                        />
                      </td>
                      <td className={"py-2 " + (itemResolvido(i) ? "text-navy/60" : "text-terracotta")}>
                        {itemResolvido(i) ? "Resolvido" : `${rotuloStatus(i.status)} · ${rotuloFonte(i.fonte)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Secao>
        );
      })}

      <Secao
        titulo="Pendências cadastrais"
        descricao="Enquanto houver pendência obrigatória, contrato, assinatura e financeiro seguem bloqueados."
      >
        {(q.data?.pendencias ?? []).length === 0 ? (
          <p className="text-sm text-navy/55">Nenhuma pendência registrada.</p>
        ) : (
          <ul className="space-y-1 text-sm text-terracotta">
            {(q.data?.pendencias ?? []).map((p: any, n: number) => (
              <li key={n}>
                {p.pessoa} · {p.rotulo}: {p.motivo}
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao
        titulo="Próxima ação datada e rascunho de comunicação"
        descricao="Gera apenas rascunho interno com aprovação humana obrigatória. Nenhum envio, link ou formulário é criado."
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Pessoa</span>
            <select className={inputCls} value={pessoaAcao} disabled={bloqueado} onChange={(e) => setPessoaAcao(e.target.value)}>
              <option value="">Selecionar…</option>
              {[...new Set(itens.map((i) => i.pessoa_nome))].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Prazo</span>
            <input type="date" className={inputCls} value={prazo} disabled={bloqueado} onChange={(e) => setPrazo(e.target.value)} />
          </label>
          <button
            type="button"
            disabled={bloqueado || !prazo || !pessoaAcao || mAcao.isPending}
            onClick={() => mAcao.mutate()}
            className="rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy disabled:opacity-50"
          >
            Registrar ação e rascunho
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {(q.data?.comunicacoes ?? []).length === 0 ? (
            <p className="text-sm text-navy/55">Nenhum rascunho registrado.</p>
          ) : (
            (q.data?.comunicacoes ?? []).map((c: any) => (
              <article key={c.id} className="rounded-xl border border-navy/10 bg-white p-3 text-sm">
                <p className="font-medium text-navy">{c.assunto}</p>
                <p className="text-xs text-navy/50">
                  {c.status} · {c.suggested_channel} · {c.sent_at ? "enviado" : "não enviado"}
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-navy/70">{c.corpo_rascunho}</pre>
              </article>
            ))
          )}
        </div>
      </Secao>
    </div>
  );
}
