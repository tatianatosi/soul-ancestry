import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Archive, BookOpen, History, Plus, Save, Scale } from "lucide-react";

import {
  DOMINIOS,
  NIVEIS_ACESSO,
  ORDEM_STATUS_RECUPERACAO,
  STATUS_CONHECIMENTO,
  STATUS_DECISAO,
  STATUS_RECUPERACAO,
  TIPOS_CONHECIMENTO,
  TOM_STATUS_RECUPERACAO,
  pendenciasDecisao,
  resumirManifesto,
  type StatusRecuperacao,
} from "@/lib/governanca.server";
import {
  arquivarArtefato,
  arquivarDecisao,
  listarBiblioteca,
  salvarArtefato,
  salvarDecisao,
  salvarItemConhecimento,
} from "@/lib/governanca.functions";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Aba = "manifesto" | "biblioteca" | "decisoes" | "historico";

const CAMPO = "w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm";

function Selo({ status }: { status: string }) {
  const tom = TOM_STATUS_RECUPERACAO[status as StatusRecuperacao] ?? "border-navy/20 bg-cream text-navy";
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${tom}`}>
      {STATUS_RECUPERACAO[status as StatusRecuperacao] ?? status}
    </span>
  );
}

export function ManifestoResgate() {
  const carregar = useServerFn(listarBiblioteca);
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["biblioteca"],
    queryFn: () => carregar({}),
  });

  const [aba, setAba] = useState<Aba>("manifesto");
  const [fStatus, setFStatus] = useState("");
  const [fDominio, setFDominio] = useState("");
  const [fResponsavel, setFResponsavel] = useState("");
  const [somenteLacuna, setSomenteLacuna] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const invalidar = () => qc.invalidateQueries({ queryKey: ["biblioteca"] });
  const falhar = (e: unknown) => setErro(e instanceof Error ? e.message : "Não foi possível concluir.");

  const mArtefato = useMutation({ mutationFn: useServerFn(salvarArtefato), onSuccess: invalidar, onError: falhar });
  const mArquivar = useMutation({ mutationFn: useServerFn(arquivarArtefato), onSuccess: invalidar, onError: falhar });
  const mItem = useMutation({ mutationFn: useServerFn(salvarItemConhecimento), onSuccess: invalidar, onError: falhar });
  const mDecisao = useMutation({ mutationFn: useServerFn(salvarDecisao), onSuccess: invalidar, onError: falhar });
  const mArquivarDecisao = useMutation({ mutationFn: useServerFn(arquivarDecisao), onSuccess: invalidar, onError: falhar });

  const artefatos = data?.artefatos as any[] | undefined;
  const ativos = artefatos ? artefatos.filter((a) => !a.archived_at) : [];
  const resumo = useMemo(() => resumirManifesto(ativos), [artefatos]);

  const responsaveis = useMemo(
    () => Array.from(new Set((artefatos ?? []).map((a) => a.responsavel_nome).filter(Boolean))) as string[],
    [artefatos],
  );

  const filtrar = (lista: any[]) =>
    lista.filter((a) => {
      if (fStatus && a.status_recuperacao !== fStatus) return false;
      if (fDominio && a.dominio !== fDominio) return false;
      if (fResponsavel && (a.responsavel_nome ?? "") !== fResponsavel) return false;
      if (somenteLacuna && !a.lacuna?.trim()) return false;
      return true;
    });

  return (
    <div className="space-y-6">
      {erro ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-600/30 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{erro}</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Cartao rotulo="Artefatos ativos" valor={resumo.total} />
        <Cartao rotulo="Não localizados" valor={resumo.porStatus["NAO_LOCALIZADO"] ?? 0} alerta />
        <Cartao rotulo="Com conflito" valor={resumo.porStatus["LOCALIZADO_COM_CONFLITO"] ?? 0} alerta />
        <Cartao rotulo="Lacunas abertas" valor={resumo.lacunas} />
      </div>

      <nav className="flex flex-wrap gap-2">
        {([
          ["manifesto", "Manifesto de Resgate", Archive],
          ["biblioteca", "Biblioteca", BookOpen],
          ["decisoes", "Decisões", Scale],
          ["historico", "Histórico de versões", History],
        ] as const).map(([chave, rotulo, Icone]) => (
          <button
            key={chave}
            onClick={() => setAba(chave)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              aba === chave ? "border-navy bg-navy text-cream" : "border-navy/15 bg-white text-navy"
            }`}
          >
            <Icone className="h-4 w-4" />
            {rotulo}
          </button>
        ))}
      </nav>

      {isLoading ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      {aba === "manifesto" ? (
        <section className="space-y-4">
          <div className="grid gap-2 rounded-xl border border-navy/10 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className={CAMPO} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {ORDEM_STATUS_RECUPERACAO.map((s) => (
                <option key={s} value={s}>{STATUS_RECUPERACAO[s]}</option>
              ))}
            </select>
            <select className={CAMPO} value={fDominio} onChange={(e) => setFDominio(e.target.value)}>
              <option value="">Todos os domínios</option>
              {DOMINIOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className={CAMPO} value={fResponsavel} onChange={(e) => setFResponsavel(e.target.value)}>
              <option value="">Todos os responsáveis</option>
              {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={somenteLacuna} onChange={(e) => setSomenteLacuna(e.target.checked)} />
              Somente com lacuna
            </label>
          </div>

          <EstadoDados
            carregando={isLoading}
            erro={error}
            dados={artefatos}
            aoTentarNovamente={() => void refetch()}
            recurso="os artefatos do manifesto"
            vazio="Nenhum artefato registrado ainda."
          >
            {(todos) => {
              const filtrados = filtrar(todos.filter((a) => !a.archived_at));
              const arquivados = todos.filter((a) => a.archived_at);
              return (
                <>
                  <ul className="space-y-3">
                    {filtrados.map((a) => (
                      <LinhaArtefato
                        key={a.id}
                        artefato={a}
                        candidatos={ativos.filter((o) => o.id !== a.id)}
                        onSalvar={(campos) => mArtefato.mutate({ data: { id: a.id, ...campos } as any })}
                        onArquivar={(motivo, sucessor) => mArquivar.mutate({ data: { id: a.id, motivo, sucessor_id: sucessor } })}
                      />
                    ))}
                    {!filtrados.length ? (
                      <li className="rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-navy/60">
                        Nenhum artefato com esses filtros.
                      </li>
                    ) : null}
                  </ul>

                  {arquivados.length ? (
                    <details className="mt-3 rounded-xl border border-navy/10 bg-white p-3">
                      <summary className="cursor-pointer text-sm font-medium text-navy">Artefatos arquivados</summary>
                      <ul className="mt-2 space-y-1 text-sm text-navy/70">
                        {arquivados.map((a) => (
                          <li key={a.id}>
                            {a.nome_original} — motivo: {a.archive_motivo ?? "—"}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </>
              );
            }}
          </EstadoDados>

          <NovoArtefato onCriar={(campos) => mArtefato.mutate({ data: campos as any })} />
        </section>
      ) : null}

      {aba === "biblioteca" ? (
        <EstadoDados
          carregando={isLoading}
          erro={error}
          dados={data?.conhecimento as any[] | undefined}
          aoTentarNovamente={() => void refetch()}
          recurso="a biblioteca de conhecimento"
          vazio="Nenhum item de conhecimento registrado ainda."
        >
          {(itens) => <Biblioteca itens={itens} onSalvar={(campos) => mItem.mutate({ data: campos as any })} />}
        </EstadoDados>
      ) : null}

      {aba === "decisoes" ? (
        <EstadoDados
          carregando={isLoading}
          erro={error}
          dados={data?.decisoes as any[] | undefined}
          aoTentarNovamente={() => void refetch()}
          recurso="as decisões de governança"
          vazio="Nenhuma decisão registrada."
        >
          {(decisoes) => (
            <Decisoes
              decisoes={decisoes}
              onSalvar={(campos) => mDecisao.mutate({ data: campos as any })}
              onArquivar={(id, motivo) => mArquivarDecisao.mutate({ data: { id, motivo } })}
            />
          )}
        </EstadoDados>
      ) : null}

      {aba === "historico" ? (
        <EstadoDados
          carregando={isLoading}
          erro={error}
          dados={data?.historico as any[] | undefined}
          aoTentarNovamente={() => void refetch()}
          recurso="o histórico de versões"
          vazio="Ainda não há alterações registradas."
        >
          {(historico) => (
            <ul className="space-y-2">
              {historico.map((h: any) => (
                <li key={h.id} className="rounded-xl border border-navy/10 bg-white p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-navy">{h.titulo ?? h.entidade_id}</strong>
                    <span className="text-xs text-navy/50">
                      v{h.versao_anterior} → v{h.versao_nova} · {new Date(h.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="mt-1 text-navy/70">{h.resumo}</p>
                  <p className="text-xs text-navy/40">{h.entidade}</p>
                </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      ) : null}
    </div>
  );
}

function Cartao({ rotulo, valor, alerta }: { rotulo: string; valor: number; alerta?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${alerta && valor > 0 ? "border-red-600/30 bg-red-50" : "border-navy/10 bg-white"}`}>
      <p className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</p>
      <p className="mt-1 text-2xl font-semibold text-navy">{valor}</p>
    </div>
  );
}

function LinhaArtefato({
  artefato,
  candidatos,
  onSalvar,
  onArquivar,
}: {
  artefato: any;
  candidatos: any[];
  onSalvar: (campos: Record<string, unknown>) => void;
  onArquivar: (motivo: string, sucessor: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ ...artefato });
  const [motivo, setMotivo] = useState("");
  const [sucessor, setSucessor] = useState("");

  const naoLocalizado = artefato.status_recuperacao === "NAO_LOCALIZADO";

  return (
    <li className={`rounded-xl border bg-white p-4 ${naoLocalizado ? "border-red-600/30" : "border-navy/10"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-navy">{artefato.nome_original}</strong>
            <Selo status={artefato.status_recuperacao} />
            <span className="text-xs text-navy/50">v{artefato.versao} · {artefato.dominio}</span>
          </div>
          <p className="mt-1 text-sm text-navy/70">{artefato.relacao_operacional ?? "Sem relação operacional descrita."}</p>
          {artefato.lacuna ? <p className="mt-1 text-sm text-amber-800">Lacuna: {artefato.lacuna}</p> : null}
          <p className="mt-1 text-xs text-navy/50">Próxima ação: {artefato.proxima_acao ?? "a definir"}</p>
        </div>
        <button onClick={() => setAberto((v) => !v)} className="rounded-lg border border-navy/15 px-3 py-1.5 text-sm text-navy">
          {aberto ? "Fechar" : "Editar"}
        </button>
      </div>

      {aberto ? (
        <div className="mt-3 space-y-3 border-t border-navy/10 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Campo rotulo="Localização" valor={form.localizacao ?? ""} onChange={(v) => setForm({ ...form, localizacao: v })} />
            <Campo rotulo="Origem" valor={form.origem ?? ""} onChange={(v) => setForm({ ...form, origem: v })} />
            <Campo rotulo="Fonte primária" valor={form.fonte_primaria ?? ""} onChange={(v) => setForm({ ...form, fonte_primaria: v })} />
            <Campo rotulo="Backup / histórico" valor={form.backup_historico ?? ""} onChange={(v) => setForm({ ...form, backup_historico: v })} />
            <Campo rotulo="Responsável" valor={form.responsavel_nome ?? ""} onChange={(v) => setForm({ ...form, responsavel_nome: v })} />
            <Campo rotulo="Lacuna" valor={form.lacuna ?? ""} onChange={(v) => setForm({ ...form, lacuna: v })} />
            <Campo rotulo="Próxima ação" valor={form.proxima_acao ?? ""} onChange={(v) => setForm({ ...form, proxima_acao: v })} />
            <label className="text-sm">
              <span className="mb-1 block text-xs text-navy/60">Status de recuperação</span>
              <select className={CAMPO} value={form.status_recuperacao} onChange={(e) => setForm({ ...form, status_recuperacao: e.target.value })}>
                {ORDEM_STATUS_RECUPERACAO.map((s) => <option key={s} value={s}>{STATUS_RECUPERACAO[s]}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-navy/60">Nível de acesso</span>
              <select className={CAMPO} value={form.nivel_acesso} onChange={(e) => setForm({ ...form, nivel_acesso: e.target.value })}>
                {Object.entries(NIVEIS_ACESSO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <Campo rotulo="Resumo da alteração" valor={form.change_resumo ?? ""} onChange={(v) => setForm({ ...form, change_resumo: v })} />
          </div>
          <AcaoOperacional
            rotulo="Salvar nova versão"
            capacidade="editar_rascunho"
            efeito="Grava uma nova versão deste artefato no manifesto. O histórico anterior é preservado."
            onConfirmar={() => onSalvar({
              nome_original: form.nome_original,
              localizacao: form.localizacao,
              origem: form.origem,
              classificacao: form.classificacao,
              status_recuperacao: form.status_recuperacao,
              fonte_primaria: form.fonte_primaria,
              backup_historico: form.backup_historico,
              relacao_operacional: form.relacao_operacional,
              proxima_acao: form.proxima_acao,
              lacuna: form.lacuna,
              dominio: form.dominio,
              responsavel_nome: form.responsavel_nome,
              nivel_acesso: form.nivel_acesso,
              change_resumo: form.change_resumo,
            })}
          >
            <span className="inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Salvar nova versão
            </span>
          </AcaoOperacional>

          <div className="rounded-lg border border-navy/10 bg-cream/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-navy/60">Arquivar (sem exclusão)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input className={CAMPO} placeholder="Motivo do arquivamento" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              <select className={CAMPO} value={sucessor} onChange={(e) => setSucessor(e.target.value)}>
                <option value="">Sem sucessor</option>
                {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nome_original}</option>)}
              </select>
            </div>
            {naoLocalizado ? (
              <p className="mt-2 text-xs text-red-800">
                Item não localizado permanece visível mesmo depois de arquivado.
              </p>
            ) : null}
            <div className="mt-2">
              <AcaoOperacional
                variant="outline"
                rotulo="Arquivar artefato"
                capacidade="editar_rascunho"
                pendenciaGate={
                  [
                    naoLocalizado ? "Artefato ainda não localizado" : null,
                    motivo.trim() ? null : "Motivo do arquivamento não preenchido",
                  ]
                    .filter(Boolean)
                    .join("; ") || null
                }
                efeito="Arquiva o artefato sem exclusão: o registro continua consultável no histórico."
                onConfirmar={(justificativa) => onArquivar(motivo.trim() || justificativa, sucessor || null)}
              >
                <span className="inline-flex items-center gap-2">
                  <Archive className="h-4 w-4" /> Arquivar artefato
                </span>
              </AcaoOperacional>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function Campo({ rotulo, valor, onChange }: { rotulo: string; valor: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs text-navy/60">{rotulo}</span>
      <input className={CAMPO} value={valor} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NovoArtefato({ onCriar }: { onCriar: (campos: Record<string, unknown>) => void }) {
  const [nome, setNome] = useState("");
  const [status, setStatus] = useState<string>("NAO_LOCALIZADO");
  const [dominio, setDominio] = useState<string>("governanca");
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white p-3">
      <p className="text-sm font-medium text-navy">Registrar artefato</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <input className={CAMPO} placeholder="Nome original" value={nome} onChange={(e) => setNome(e.target.value)} />
        <select className={CAMPO} value={status} onChange={(e) => setStatus(e.target.value)}>
          {ORDEM_STATUS_RECUPERACAO.map((s) => <option key={s} value={s}>{STATUS_RECUPERACAO[s]}</option>)}
        </select>
        <select className={CAMPO} value={dominio} onChange={(e) => setDominio(e.target.value)}>
          {DOMINIOS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          disabled={!nome.trim()}
          onClick={() => { onCriar({ nome_original: nome, status_recuperacao: status, dominio }); setNome(""); }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Registrar
        </button>
      </div>
    </div>
  );
}

function Biblioteca({
  itens,
  onSalvar,
}: {
  itens: any[];
  onSalvar: (campos: Record<string, unknown>) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("documento");
  return (
    <section className="space-y-3">
      <ul className="space-y-2">
        {itens.map((i) => (
          <li key={i.id} className="rounded-xl border border-navy/10 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-navy">{i.titulo}</strong>
              <span className="text-xs text-navy/50">
                {TIPOS_CONHECIMENTO[i.tipo as keyof typeof TIPOS_CONHECIMENTO] ?? i.tipo} ·{" "}
                {STATUS_CONHECIMENTO[i.status as keyof typeof STATUS_CONHECIMENTO] ?? i.status} · v{i.versao} ·{" "}
                {NIVEIS_ACESSO[i.nivel_acesso as keyof typeof NIVEIS_ACESSO]}
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/70">{i.resumo ?? "Sem resumo."}</p>
            <p className="text-xs text-navy/50">
              Fonte: {i.fonte ?? "—"} · Proprietário: {i.owner_nome ?? "—"} · Domínio: {i.dominio}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["em_revisao", "publicado", "obsoleto"] as const).map((s) => (
                <AcaoOperacional
                  key={s}
                  size="sm"
                  variant="outline"
                  rotulo={`Marcar como ${STATUS_CONHECIMENTO[s]}`}
                  capacidade="editar_rascunho"
                  efeito="Altera a situação deste item de conhecimento e gera nova versão."
                  onConfirmar={() => onSalvar({ id: i.id, titulo: i.titulo, tipo: i.tipo, dominio: i.dominio, status: s, resumo: i.resumo, fonte: i.fonte, change_resumo: `Situação alterada para ${STATUS_CONHECIMENTO[s]}.` })}
                >
                  {STATUS_CONHECIMENTO[s]}
                </AcaoOperacional>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-dashed border-navy/20 bg-white p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <input className={CAMPO} placeholder="Título do item" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            <select className={CAMPO} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {Object.entries(TIPOS_CONHECIMENTO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button
              disabled={!titulo.trim()}
              onClick={() => { onSalvar({ titulo, tipo }); setTitulo(""); }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Adicionar à biblioteca
            </button>
          </div>
      </div>
    </section>
  );
}

function Decisoes({
  decisoes,
  onSalvar,
  onArquivar,
}: {
  decisoes: any[];
  onSalvar: (campos: Record<string, unknown>) => void;
  onArquivar: (id: string, motivo: string) => void;
}) {
  const [form, setForm] = useState({
    titulo: "",
    contexto: "",
    decisao: "",
    alternativas: "",
    impacto: "",
    responsavel_nome: "",
    data_decisao: "",
    vigencia_inicio: "",
    vigencia_fim: "",
    substitui_ids: [] as string[],
  });
  const faltando = pendenciasDecisao(form);

  return (
    <section className="space-y-4">
      <ul className="space-y-2">
        {decisoes.map((d) => (
          <li key={d.id} className="rounded-xl border border-navy/10 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong className="text-navy">{d.titulo}</strong>
              <span className="text-xs text-navy/50">
                {STATUS_DECISAO[d.status as keyof typeof STATUS_DECISAO] ?? d.status} · v{d.versao} ·{" "}
                {d.data_decisao ? new Date(d.data_decisao).toLocaleDateString("pt-BR") : "sem data"}
              </span>
            </div>
            <p className="mt-1 text-sm text-navy/70"><strong>Contexto:</strong> {d.contexto ?? "—"}</p>
            <p className="text-sm text-navy/70"><strong>Decisão:</strong> {d.decisao ?? "—"}</p>
            <p className="text-sm text-navy/70"><strong>Alternativas:</strong> {d.alternativas ?? "—"}</p>
            <p className="text-sm text-navy/70"><strong>Impacto:</strong> {d.impacto ?? "—"}</p>
            <p className="text-xs text-navy/50">
              Responsável: {d.responsavel_nome ?? "equipe interna"} · Vigência: {d.vigencia_inicio ?? "—"} a {d.vigencia_fim ?? "indeterminada"}
              {d.substitui_ids?.length ? ` · substitui ${d.substitui_ids.length} item(ns)` : ""}
            </p>
            {d.status !== "arquivada" ? (
              <div className="mt-2">
                <AcaoOperacional
                  size="sm"
                  variant="outline"
                  rotulo="Arquivar decisão"
                  capacidade="editar_rascunho"
                  efeito="Arquiva a decisão sem exclusão: ela continua no histórico de governança."
                  onConfirmar={(motivo) => {
                    const texto = motivo.trim() || window.prompt("Motivo do arquivamento da decisão:")?.trim();
                    if (texto) onArquivar(d.id, texto);
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Archive className="h-3.5 w-3.5" /> Arquivar
                  </span>
                </AcaoOperacional>
              </div>
            ) : null}
          </li>
        ))}
        {!decisoes.length ? (
          <li className="rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-navy/60">
            Nenhuma decisão registrada.
          </li>
        ) : null}
      </ul>

      <div className="space-y-2 rounded-xl border border-dashed border-navy/20 bg-white p-3">
          <p className="text-sm font-medium text-navy">Nova decisão</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Campo rotulo="Título" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
            <Campo rotulo="Responsável" valor={form.responsavel_nome} onChange={(v) => setForm({ ...form, responsavel_nome: v })} />
            <label className="text-sm">
              <span className="mb-1 block text-xs text-navy/60">Data da decisão</span>
              <input type="date" className={CAMPO} value={form.data_decisao} onChange={(e) => setForm({ ...form, data_decisao: e.target.value })} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs text-navy/60">Vigência (início)</span>
              <input type="date" className={CAMPO} value={form.vigencia_inicio} onChange={(e) => setForm({ ...form, vigencia_inicio: e.target.value })} />
            </label>
          </div>
          <textarea className={CAMPO} rows={2} placeholder="Contexto" value={form.contexto} onChange={(e) => setForm({ ...form, contexto: e.target.value })} />
          <textarea className={CAMPO} rows={2} placeholder="Decisão tomada" value={form.decisao} onChange={(e) => setForm({ ...form, decisao: e.target.value })} />
          <textarea className={CAMPO} rows={2} placeholder="Alternativas consideradas" value={form.alternativas} onChange={(e) => setForm({ ...form, alternativas: e.target.value })} />
          <textarea className={CAMPO} rows={2} placeholder="Impacto" value={form.impacto} onChange={(e) => setForm({ ...form, impacto: e.target.value })} />
          <label className="text-sm">
            <span className="mb-1 block text-xs text-navy/60">Itens substituídos</span>
            <select
              multiple
              className={`${CAMPO} h-24`}
              value={form.substitui_ids}
              onChange={(e) => setForm({ ...form, substitui_ids: Array.from(e.target.selectedOptions).map((o) => o.value) })}
            >
              {decisoes.filter((d) => d.status === "publicada").map((d) => (
                <option key={d.id} value={d.id}>{d.titulo}</option>
              ))}
            </select>
          </label>

          {faltando.length ? (
            <p className="text-xs text-amber-800">
              Para publicar faltam: {faltando.join(", ")}. É possível salvar como rascunho.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              disabled={!form.titulo.trim()}
              onClick={() => onSalvar({ ...form, status: "rascunho" })}
              className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy disabled:opacity-40"
            >
              Salvar rascunho
            </button>
            <AcaoOperacional
              rotulo="Publicar decisão"
              capacidade="editar_rascunho"
              pendenciaGate={
                [
                  form.titulo.trim() ? null : "título da decisão",
                  ...faltando,
                ]
                  .filter(Boolean)
                  .join("; ") || null
              }
              efeito="Publica a decisão de governança na versão atual. O registro anterior é preservado."
              onConfirmar={() => onSalvar({ ...form, status: "publicada" })}
            />
          </div>
      </div>
    </section>
  );
}
