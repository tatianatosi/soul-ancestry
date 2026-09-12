import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { AcaoDeEscrita } from "@/components/caso/campos";
import { EstadoDados } from "@/components/saas/estado-dados";
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
  "w-full rounded-lg border border-navy/15 bg-cream px-2 py-1.5 text-sm text-navy outline-none focus:border-gold disabled:bg-navy/5 disabled:text-navy/50";

function Secao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy/10 bg-cream/40 p-4">
      <h3 className="text-sm font-semibold text-navy">{titulo}</h3>
      {descricao ? <p className="mb-3 text-xs text-navy/55">{descricao}</p> : <div className="mb-3" />}
      {children}
    </section>
  );
}

export function AbaCadastro({
  caseId,
  bloqueado: _bloqueado,
}: {
  caseId: string;
  /**
   * Mantida apenas por compatibilidade com quem chama em `src/routes/`.
   * Ignorada: a decisão de escrita é da autoridade operacional.
   */
  bloqueado?: boolean;
}) {
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

  // Sem leitura confirmada não se afirma "nenhuma linha": mostra a falha.
  if (q.isLoading) return <p className="py-6 text-sm text-navy/60" role="status">Carregando o checklist cadastral…</p>;
  if (q.isError || !q.data) {
    return (
      <div role="alert" className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">Não foi possível carregar o checklist cadastral.</p>
        <p className="text-navy/80">
          {q.error instanceof Error
            ? q.error.message
            : "A consulta não retornou resultado nem erro. Isso é falha de carga, não base vazia."}
        </p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!Array.isArray(q.data.itens)) {
    return (
      <div role="alert" className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">A consulta do checklist não devolveu a lista de itens.</p>
        <p className="text-navy/80">Isso é falha de carga, não base vazia. Tente novamente.</p>
        <button
          type="button"
          onClick={() => void q.refetch()}
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs text-navy"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const itensBrutos = q.data.itens as ItemChecklist[];
  // Contratada = perfil institucional da org (Tatiana ME) — não checklist por caso.
  const itens = itensBrutos.filter((i) => i.pessoa_tipo !== "contratada");
  const resumo: any[] = (Array.isArray(q.data.resumo) ? q.data.resumo : []).filter(
    (r: any) => r.pessoa_tipo !== "contratada",
  );
  const grupos = [...new Set(itens.map((i) => `${i.pessoa_tipo}::${i.pessoa_nome}`))];

  return (
    <div className="space-y-4">
      {erro ? <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{erro}</p> : null}

      <Secao
        titulo="Checklist cadastral por pessoa"
        descricao="Só titular e dependentes do cliente. Dados da contratada (você) vêm do perfil institucional — sem tick por caso."
      >
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <AcaoDeEscrita
            rotulo={
              mSemear.isPending
                ? "Registrando…"
                : itens.length
                  ? "Completar linhas faltantes"
                  : "Registrar checklist das pessoas do caso"
            }
            capacidade="corrigir_pessoas_dependentes_representacao"
            efeito="Cria as linhas do checklist cadastral das pessoas deste caso."
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-50"
            onConfirmar={() => {
              if (mSemear.isPending) return;
              mSemear.mutate();
            }}
          />
          <span className="text-navy/55">
            {resumo.map((r: any) => `${r.pessoa_nome}: ${r.resolvidos}/${r.total}`).join(" · ") ||
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
              "Status, fonte, data de verificação e acesso restrito por dado."
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
                  {lista.map((i) => {
                    const fonteDeclarada = Boolean(i.fonte) && i.fonte !== "nao_declarada";
                    const faltaParaVerificar = !fonteDeclarada || !i.data_verificacao;
                    return (
                    <tr key={i.id} className="border-t border-navy/5 align-top">
                      <td className="py-2 pr-3 text-navy">
                        {i.campo_rotulo}
                        {i.obrigatorio ? "" : " (opcional)"}
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className={inputCls}
                          value={i.status}
                          title={
                            faltaParaVerificar
                              ? "Defina Fonte e Data de verificação (colunas ao lado) antes de marcar como Verificado."
                              : undefined
                          }
                          onChange={(e) => {
                            if (e.target.value === "verificado" && faltaParaVerificar) {
                              setErro("Defina Fonte e Data de verificação (colunas ao lado) antes de marcar como Verificado.");
                              return;
                            }
                            mSalvar.mutate({ id: i.id, status: e.target.value });
                          }}
                        >
                          {STATUS_CADASTRO.map((s) => (
                            <option key={s.valor} value={s.valor} disabled={s.valor === "verificado" && faltaParaVerificar}>
                              {s.rotulo}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className={inputCls}
                          value={i.fonte ?? "nao_declarada"}
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
                          onChange={(e) => mSalvar.mutate({ id: i.id, data_verificacao: e.target.value })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={i.acesso_restrito}
                          onChange={(e) => mSalvar.mutate({ id: i.id, acesso_restrito: e.target.checked })}
                        />
                      </td>
                      <td className={"py-2 " + (itemResolvido(i) ? "text-navy/60" : "text-terracotta")}>
                        {itemResolvido(i) ? "Resolvido" : `${rotuloStatus(i.status)} · ${rotuloFonte(i.fonte)}`}
                      </td>
                    </tr>
                    );
                  })}
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
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data?.pendencias as any[] | undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as pendências cadastrais"
          vazio="Nenhuma pendência registrada."
        >
          {(pendencias) => (
            <ul className="space-y-1 text-sm text-terracotta">
              {pendencias.map((p: any, n: number) => (
                <li key={n}>
                  {p.pessoa} · {p.rotulo}: {p.motivo}
                </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      </Secao>

      <Secao
        titulo="Próxima ação datada e rascunho de comunicação"
        descricao="Gera apenas rascunho interno com aprovação humana obrigatória. Nenhum envio, link ou formulário é criado."
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Pessoa</span>
            <select className={inputCls} value={pessoaAcao} onChange={(e) => setPessoaAcao(e.target.value)}>
              <option value="">Selecionar…</option>
              {[...new Set(itens.map((i) => i.pessoa_nome))].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] uppercase tracking-wide text-navy/50">Prazo</span>
            <input type="date" className={inputCls} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </label>
          <AcaoDeEscrita
            rotulo={mAcao.isPending ? "Registrando…" : "Registrar ação e rascunho"}
            faltando={!pessoaAcao ? "Selecione a pessoa." : !prazo ? "Informe o prazo." : null}
            capacidade="editar_fila_responsavel_prazo"
            efeito="Registra a ação datada e cria o rascunho interno de comunicação. Nada é enviado."
            className="rounded-lg bg-gold px-3 py-2 text-sm font-medium text-navy disabled:opacity-50"
            onConfirmar={() => {
              if (mAcao.isPending) return;
              mAcao.mutate();
            }}
          />
        </div>

        <div className="mt-4 space-y-2">
          <EstadoDados
            carregando={q.isLoading}
            erro={q.error}
            dados={q.data?.comunicacoes as any[] | undefined}
            aoTentarNovamente={() => void q.refetch()}
            recurso="os rascunhos de comunicação"
            vazio="Nenhum rascunho registrado."
          >
            {(comunicacoes) =>
              comunicacoes.map((c: any) => (
                <article key={c.id} className="rounded-xl border border-navy/10 bg-cream/50 p-3 text-sm">
                  <p className="font-medium text-navy">{c.assunto}</p>
                  <p className="text-xs text-navy/50">
                    {c.status} · {c.suggested_channel} · {c.sent_at ? "enviado" : "não enviado"}
                  </p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-navy/70">{c.corpo_rascunho}</pre>
                </article>
              ))
            }
          </EstadoDados>
        </div>
      </Secao>
    </div>
  );
}
