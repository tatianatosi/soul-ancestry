import { useMemo, useState } from "react";
import { useAutoridade } from "@/components/saas/autoridade";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Campo, Gaveta, Selo, inputCls } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { AssistentePesquisa } from "@/components/pesquisa/assistente";

import {
  arquivarPesquisa,
  carregarPesquisa,
  linkArquivoEvidencia,
  salvarPesquisa,
} from "@/lib/pesquisa.functions";
import { gerarRelatorioPesquisa, periodoEvento } from "@/lib/relatorio-pesquisa";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;
type Bloco = "pessoas" | "hipoteses" | "evidencias" | "eventos" | "pendencias";

const ABAS = [
  { id: "visao", rotulo: "Visão geral" },
  { id: "pessoas", rotulo: "Pessoas" },
  { id: "evidencias", rotulo: "Evidências" },
  { id: "linha", rotulo: "Linha do tempo" },
  { id: "pendencias", rotulo: "Tarefas" },
  { id: "assistente", rotulo: "Assistente IA" },
  { id: "relatorio", rotulo: "Relatório" },

] as const;

const STATUS_EVIDENCIA: Record<string, string> = {
  coletada: "Coletada",
  em_revisao: "Em revisão",
  validada: "Validada",
  inconclusiva: "Inconclusiva",
  descartada: "Descartada",
};

const STATUS_HIPOTESE: Record<string, string> = {
  aberta: "Hipótese aberta",
  em_investigacao: "Em investigação",
  confirmada: "Confirmada por evidência",
  refutada: "Refutada",
  inconclusiva: "Inconclusiva",
};

const STATUS_TAREFA: Record<string, string> = {
  nao_iniciada: "Não iniciada",
  em_andamento: "Em andamento",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const CONFIANCA = { baixo: "Confiança baixa", medio: "Confiança média", alto: "Confiança alta" };

function tomEvidencia(status: string) {
  if (status === "validada") return "ok" as const;
  if (status === "inconclusiva" || status === "descartada") return "alerta" as const;
  return "neutro" as const;
}

/** Moldura visual: fato validado, hipótese, inconclusivo e pendência têm tratamentos distintos. */
function molduraPor(tipo: "validado" | "hipotese" | "inconclusivo" | "pendencia") {
  return cn(
    "rounded-xl border p-3",
    tipo === "validado" && "border-gold bg-gold/10",
    tipo === "hipotese" && "border-dashed border-navy/40 bg-cream/40",
    tipo === "inconclusivo" && "border-navy/15 bg-navy/5",
    tipo === "pendencia" && "border-terracotta/40 bg-terracotta/5",
  );
}

type CampoDef = {
  nome: string;
  rotulo: string;
  tipo?: "texto" | "area" | "data" | "datahora" | "select" | "bool" | "pessoa" | "hipotese";
  opcoes?: Record<string, string>;
};

const FORMULARIOS: Record<Bloco, { titulo: string; campos: CampoDef[] }> = {
  pessoas: {
    titulo: "Pessoa da linha familiar",
    campos: [
      { nome: "nome", rotulo: "Nome" },
      { nome: "parentesco", rotulo: "Parentesco" },
      { nome: "requerente", rotulo: "É o requerente", tipo: "bool" },
      { nome: "nacionalidade", rotulo: "Nacionalidade" },
      { nome: "data_nascimento", rotulo: "Nascimento", tipo: "data" },
      { nome: "local_nascimento", rotulo: "Local de nascimento" },
      { nome: "data_obito", rotulo: "Óbito", tipo: "data" },
      { nome: "local_obito", rotulo: "Local do óbito" },
      { nome: "pai_id", rotulo: "Pai", tipo: "pessoa" },
      { nome: "mae_id", rotulo: "Mãe", tipo: "pessoa" },
      { nome: "observacoes_protegidas", rotulo: "Observações internas", tipo: "area" },
    ],
  },
  hipoteses: {
    titulo: "Hipótese de parentesco",
    campos: [
      { nome: "titulo", rotulo: "Título" },
      { nome: "person_id", rotulo: "Pessoa relacionada", tipo: "pessoa" },
      { nome: "descricao", rotulo: "Descrição", tipo: "area" },
      { nome: "status", rotulo: "Status", tipo: "select", opcoes: STATUS_HIPOTESE },
      { nome: "grau_confianca", rotulo: "Grau de confiança", tipo: "select", opcoes: CONFIANCA },
      { nome: "justificativa", rotulo: "Justificativa (obrigatória para confirmar)", tipo: "area" },
    ],
  },
  evidencias: {
    titulo: "Evidência",
    campos: [
      { nome: "titulo", rotulo: "Título" },
      { nome: "tipo", rotulo: "Tipo de evidência" },
      { nome: "status", rotulo: "Status", tipo: "select", opcoes: STATUS_EVIDENCIA },
      { nome: "descricao", rotulo: "Descrição", tipo: "area" },
      { nome: "person_id", rotulo: "Pessoa relacionada", tipo: "pessoa" },
      { nome: "hypothesis_id", rotulo: "Hipótese vinculada", tipo: "hipotese" },
      { nome: "relacao_hipotese", rotulo: "Relação com a hipótese", tipo: "area" },
      { nome: "local_relacionado", rotulo: "Local" },
      { nome: "data_inicio", rotulo: "Data inicial", tipo: "data" },
      { nome: "data_fim", rotulo: "Data final", tipo: "data" },
      { nome: "periodo", rotulo: "Período (texto)" },
      { nome: "fonte", rotulo: "Fonte/origem" },
      { nome: "url", rotulo: "Endereço na internet (opcional)" },
      { nome: "storage_path", rotulo: "Arquivo privado (caminho no acervo)" },
      { nome: "grau_confianca", rotulo: "Grau de confiança", tipo: "select", opcoes: CONFIANCA },
      { nome: "revisado_em", rotulo: "Data de revisão", tipo: "datahora" },
      { nome: "justificativa", rotulo: "Justificativa da validação ou descarte", tipo: "area" },
    ],
  },
  eventos: {
    titulo: "Evento da linha do tempo",
    campos: [
      { nome: "titulo", rotulo: "Título" },
      { nome: "tipo", rotulo: "Tipo (nascimento, casamento, emigração…)" },
      { nome: "person_id", rotulo: "Pessoa", tipo: "pessoa" },
      { nome: "local", rotulo: "Local" },
      { nome: "data_inicio", rotulo: "Data inicial", tipo: "data" },
      { nome: "data_fim", rotulo: "Data final", tipo: "data" },
      { nome: "periodo_texto", rotulo: "Período aproximado (texto)" },
      { nome: "descricao", rotulo: "Descrição", tipo: "area" },
      { nome: "confirmado", rotulo: "Apoiado por evidência validada", tipo: "bool" },
    ],
  },
  pendencias: {
    titulo: "Pendência de pesquisa",
    campos: [
      { nome: "titulo", rotulo: "Título" },
      { nome: "descricao", rotulo: "Descrição", tipo: "area" },
      { nome: "status", rotulo: "Status", tipo: "select", opcoes: STATUS_TAREFA },
      {
        nome: "prioridade",
        rotulo: "Prioridade",
        tipo: "select",
        opcoes: { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" },
      },
      { nome: "prazo", rotulo: "Prazo", tipo: "data" },
      { nome: "person_id", rotulo: "Pessoa", tipo: "pessoa" },
      { nome: "hypothesis_id", rotulo: "Hipótese", tipo: "hipotese" },
    ],
  },
};

export function PesquisaCaso({ casoId }: { casoId: string }) {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("visao");
  const [edicao, setEdicao] = useState<{ bloco: Bloco; linha: Linha | null } | null>(null);

  const carregar = useServerFn(carregarPesquisa);
  const salvar = useServerFn(salvarPesquisa);
  const arquivar = useServerFn(arquivarPesquisa);
  const gerarLink = useServerFn(linkArquivoEvidencia);
  const qc = useQueryClient();

  const autoridade = useAutoridade();
  const q = useQuery({
    queryKey: ["pesquisa", casoId],
    queryFn: () => carregar({ data: { casoId } }),
  });

  const salvarMut = useMutation({
    mutationFn: (v: { bloco: Bloco; id?: string; dados: Linha }) =>
      salvar({ data: { bloco: v.bloco, casoId, id: v.id, dados: v.dados } }),
    onSuccess: () => {
      toast.success("Registro de pesquisa salvo.");
      setEdicao(null);
      qc.invalidateQueries({ queryKey: ["pesquisa", casoId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const arquivarMut = useMutation({
    mutationFn: (v: { bloco: Bloco; id: string; motivo: string }) =>
      arquivar({ data: { ...v, casoId } }),
    onSuccess: () => {
      toast.success("Item arquivado — o histórico foi preservado.");
      qc.invalidateQueries({ queryKey: ["pesquisa", casoId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = q.data;
  const relatorio = useMemo(() => (d ? gerarRelatorioPesquisa(d) : ""), [d]);

  if (q.isLoading) return <p className="text-sm text-navy/60">Carregando dossiê de pesquisa…</p>;
  if (q.error) return <p className="text-sm text-terracotta">{(q.error as Error).message}</p>;
  if (!d) return null;

  const pessoas = d.pessoas as Linha[];
  const hipoteses = d.hipoteses as Linha[];
  const evidencias = d.evidencias as Linha[];
  const eventos = d.eventos as Linha[];
  const pendencias = d.pendencias as Linha[];
  // Autoridade operacional: gate de papel do servidor deixa de esconder ações;
  // vira pendência declarada e o servidor revalida cada gravação.
  const podeEditar = !autoridade.bloqueado({ capacidade: "avancar_pesquisa_evidencia_microentrega" });
  const pendenciaPapel = d.podeEditar
    ? null
    : "O servidor não reconhece seu papel como responsável por esta pesquisa — as ações seguem disponíveis por decisão sua.";

  const nomePessoa = (id: unknown) => pessoas.find((p) => p.id === id)?.nome ?? "—";
  const tituloHipotese = (id: unknown) => hipoteses.find((h) => h.id === id)?.titulo ?? "—";

  const BotaoNovo = ({ bloco }: { bloco: Bloco }) =>
    podeEditar ? (
      <button
        onClick={() => setEdicao({ bloco, linha: null })}
        className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
      >
        Adicionar {FORMULARIOS[bloco].titulo.toLowerCase()}
      </button>
    ) : null;

  const Acoes = ({ bloco, linha }: { bloco: Bloco; linha: Linha }) =>
    podeEditar ? (
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => setEdicao({ bloco, linha })}
          className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
        >
          Editar
        </button>
        <AcaoOperacional
          rotulo="Arquivar"
          className="rounded-lg border border-terracotta/40 px-2 py-1 text-[11px] text-terracotta"
          acaoExterna="arquivar_registro_pesquisa"
          efeito="Arquiva o registro com motivo — não há exclusão física, o dado continua auditável."
          onConfirmar={(motivo) => arquivarMut.mutate({ bloco, id: linha.id, motivo })}
        />
      </div>
    ) : null;

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-navy/10 bg-cream/40 p-4">
        <p className="text-xs uppercase tracking-wide text-navy/50">Pesquisa genealógica</p>
        <h1 className="font-serif text-2xl">
          {d.caso["codigo"]} — {d.caso["titulo"]}
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Registro de pesquisa e evidências. Uso interno; não expressa conclusão jurídica nem previsão de resultado.
        </p>
        {pendenciaPapel ? (
          <p className="mt-2 text-xs text-navy/70">Pendência registrada: {pendenciaPapel}</p>
        ) : null}
      </header>

      <nav className="flex flex-wrap gap-2">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              aba === a.id ? "border-navy bg-navy text-cream" : "border-navy/15 text-navy/70 hover:bg-navy/5",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba === "visao" && (
        <div className="grid gap-4 md:grid-cols-2">
          <CaCard variante="compacto" titulo="Situação da pesquisa">
            <ul className="space-y-1 text-sm text-navy/70">
              <li>Pessoas mapeadas: {pessoas.length}</li>
              <li>
                Hipóteses: {hipoteses.length} · confirmadas por evidência:{" "}
                {hipoteses.filter((h) => h.status === "confirmada").length}
              </li>
              <li>
                Evidências: {evidencias.length} · validadas:{" "}
                {evidencias.filter((e) => e.status === "validada").length}
              </li>
              <li>Eventos na linha do tempo: {eventos.length}</li>
              <li>
                Pendências em aberto:{" "}
                {pendencias.filter((p) => p.status !== "concluida" && p.status !== "cancelada").length}
              </li>
            </ul>
          </CaCard>
          <CaCard variante="compacto" titulo="Legenda visual">
            <div className="space-y-2 text-xs">
              <div className={molduraPor("validado")}>Fato apoiado por evidência validada</div>
              <div className={molduraPor("hipotese")}>Hipótese ainda não confirmada</div>
              <div className={molduraPor("inconclusivo")}>Item inconclusivo ou em análise</div>
              <div className={molduraPor("pendencia")}>Pendência de pesquisa</div>
            </div>
          </CaCard>
          <div className="md:col-span-2">
            <CaCard variante="compacto" titulo="Hipóteses de parentesco">
              <div className="mb-3">
                <BotaoNovo bloco="hipoteses" />
              </div>
              <div className="space-y-2">
                {hipoteses.length === 0 && <p className="text-sm text-navy/60">Nenhuma hipótese registrada.</p>}
                {hipoteses.map((h) => (
                  <div
                    key={h.id}
                    className={molduraPor(h.status === "confirmada" ? "validado" : "hipotese")}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm">{h.titulo}</strong>
                      <Selo texto={STATUS_HIPOTESE[h.status] ?? h.status} tom={h.status === "confirmada" ? "ok" : "neutro"} />
                      {h.grau_confianca && <Selo texto={CONFIANCA[h.grau_confianca as keyof typeof CONFIANCA]} />}
                    </div>
                    <p className="mt-1 text-sm text-navy/70">{h.descricao}</p>
                    <p className="mt-1 text-xs text-navy/50">
                      Pessoa: {nomePessoa(h.person_id)} · Evidências vinculadas:{" "}
                      {evidencias.filter((e) => e.hypothesis_id === h.id).length}
                    </p>
                    <Acoes bloco="hipoteses" linha={h} />
                  </div>
                ))}
              </div>
            </CaCard>
          </div>
        </div>
      )}

      {aba === "pessoas" && (
        <CaCard variante="compacto" titulo="Linha familiar">
          <div className="mb-3">
            <BotaoNovo bloco="pessoas" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {pessoas.length === 0 && <p className="text-sm text-navy/60">Nenhuma pessoa registrada.</p>}
            {pessoas.map((p) => (
              <div key={p.id} className={molduraPor(p.requerente ? "validado" : "hipotese")}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{p.nome}</strong>
                  {p.requerente && <Selo texto="Requerente" tom="ok" />}
                  {p.parentesco && <Selo texto={p.parentesco} />}
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  {p.nacionalidade ? `${p.nacionalidade} · ` : ""}
                  {p.data_nascimento ? `nasc. ${p.data_nascimento}` : "nascimento não informado"}
                  {p.local_nascimento ? ` em ${p.local_nascimento}` : ""}
                  {p.data_obito ? ` · óbito ${p.data_obito}` : ""}
                </p>
                <p className="mt-1 text-xs text-navy/50">
                  Pai: {nomePessoa(p.pai_id)} · Mãe: {nomePessoa(p.mae_id)}
                </p>
                <Acoes bloco="pessoas" linha={p} />
              </div>
            ))}
          </div>
        </CaCard>
      )}

      {aba === "evidencias" && (
        <CaCard variante="compacto" titulo="Evidências">
          <div className="mb-3">
            <BotaoNovo bloco="evidencias" />
          </div>
          <div className="space-y-2">
            {evidencias.length === 0 && <p className="text-sm text-navy/60">Nenhuma evidência registrada.</p>}
            {evidencias.map((e) => (
              <div
                key={e.id}
                className={molduraPor(
                  e.status === "validada" ? "validado" : e.status === "inconclusiva" || e.status === "descartada" ? "inconclusivo" : "hipotese",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{e.titulo}</strong>
                  <Selo texto={STATUS_EVIDENCIA[e.status] ?? e.status} tom={tomEvidencia(e.status)} />
                  {e.grau_confianca && <Selo texto={CONFIANCA[e.grau_confianca as keyof typeof CONFIANCA]} />}
                </div>
                <p className="mt-1 text-sm text-navy/70">{e.descricao}</p>
                <p className="mt-1 text-xs text-navy/50">
                  Fonte: {e.fonte ?? "—"} · Local: {e.local_relacionado ?? "—"} · Período: {periodoEvento(e)} · Pessoa:{" "}
                  {e.person_id ? nomePessoa(e.person_id) : (e.pessoa_relacionada ?? "—")} · Hipótese:{" "}
                  {e.hypothesis_id ? tituloHipotese(e.hypothesis_id) : "—"}
                </p>
                {e.justificativa && <p className="mt-1 text-xs text-navy/60">Justificativa: {e.justificativa}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                    >
                      Abrir fonte
                    </a>
                  )}
                  {e.storage_path && (
                    <button
                      onClick={async () => {
                        try {
                          const r = await gerarLink({ data: { evidenciaId: e.id } });
                          window.open(r.url, "_blank", "noreferrer");
                        } catch (err) {
                          toast.error((err as Error).message);
                        }
                      }}
                      className="rounded-lg border border-navy/20 px-2 py-1 text-[11px]"
                    >
                      Abrir arquivo privado
                    </button>
                  )}
                </div>
                <Acoes bloco="evidencias" linha={e} />
              </div>
            ))}
          </div>
        </CaCard>
      )}

      {aba === "linha" && (
        <CaCard variante="compacto" titulo="Linha do tempo">
          <div className="mb-3">
            <BotaoNovo bloco="eventos" />
          </div>
          <ol className="space-y-2 border-l border-navy/15 pl-4">
            {eventos.length === 0 && <p className="text-sm text-navy/60">Sem eventos registrados.</p>}
            {[...eventos]
              .sort((a, b) => String(a.data_inicio ?? "").localeCompare(String(b.data_inicio ?? "")))
              .map((ev) => (
                <li key={ev.id} className={molduraPor(ev.confirmado ? "validado" : "hipotese")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-navy/50">{periodoEvento(ev)}</span>
                    <strong className="text-sm">{ev.titulo}</strong>
                    <Selo texto={ev.confirmado ? "Apoiado por evidência" : "A confirmar"} tom={ev.confirmado ? "ok" : "neutro"} />
                  </div>
                  <p className="text-xs text-navy/60">
                    {ev.local ?? "local não informado"} · {ev.person_id ? nomePessoa(ev.person_id) : "pessoa não vinculada"}
                  </p>
                  <Acoes bloco="eventos" linha={ev} />
                </li>
              ))}
          </ol>
        </CaCard>
      )}

      {aba === "pendencias" && (
        <CaCard variante="compacto" titulo="Pendências de pesquisa">
          <div className="mb-3">
            <BotaoNovo bloco="pendencias" />
          </div>
          <div className="space-y-2">
            {pendencias.length === 0 && <p className="text-sm text-navy/60">Sem pendências registradas.</p>}
            {pendencias.map((p) => (
              <div key={p.id} className={molduraPor(p.status === "concluida" ? "validado" : "pendencia")}>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm">{p.titulo}</strong>
                  <Selo texto={STATUS_TAREFA[p.status] ?? p.status} tom={p.status === "bloqueada" ? "alerta" : "neutro"} />
                  {p.prioridade && <Selo texto={`Prioridade ${p.prioridade}`} />}
                </div>
                <p className="mt-1 text-xs text-navy/60">
                  {p.descricao ?? ""}
                  {p.prazo ? ` · prazo ${p.prazo}` : ""}
                  {p.person_id ? ` · ${nomePessoa(p.person_id)}` : ""}
                  {p.hypothesis_id ? ` · ${tituloHipotese(p.hypothesis_id)}` : ""}
                </p>
                <Acoes bloco="pendencias" linha={p} />
              </div>
            ))}
          </div>
        </CaCard>
      )}

      {aba === "assistente" && <AssistentePesquisa casoId={casoId} />}

      {aba === "relatorio" && (

        <CaCard variante="compacto" titulo="Relatório interno de andamento">
          <p className="mb-2 text-xs text-navy/60">
            Gerado a partir dos registros atuais. Não é enviado ao cliente automaticamente.
          </p>
          <textarea readOnly value={relatorio} className="h-[28rem] w-full rounded-lg border border-navy/15 bg-cream/40 p-3 font-mono text-xs" />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(relatorio);
                toast.success("Relatório copiado.");
              }}
              className="rounded-lg bg-navy px-3 py-1.5 text-xs text-cream"
            >
              Copiar texto
            </button>
          </div>
        </CaCard>
      )}

      {edicao && (
        <Gaveta titulo={FORMULARIOS[edicao.bloco].titulo} aoFechar={() => setEdicao(null)}>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              const fd = new FormData(ev.currentTarget);
              const dados: Linha = {};
              for (const campo of FORMULARIOS[edicao.bloco].campos) {
                dados[campo.nome] = campo.tipo === "bool" ? fd.get(campo.nome) === "on" : fd.get(campo.nome);
              }
              salvarMut.mutate({ bloco: edicao.bloco, id: edicao.linha?.id, dados });
            }}
            className="space-y-3"
          >
            {FORMULARIOS[edicao.bloco].campos.map((campo) => {
              const valor = edicao.linha?.[campo.nome] ?? "";
              if (campo.tipo === "bool") {
                return (
                  <label key={campo.nome} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={campo.nome} defaultChecked={Boolean(valor)} />
                    {campo.rotulo}
                  </label>
                );
              }
              return (
                <Campo key={campo.nome} rotulo={campo.rotulo}>
                  {campo.tipo === "area" ? (
                    <textarea name={campo.nome} defaultValue={valor} className={cn(inputCls, "h-24")} />
                  ) : campo.tipo === "select" ? (
                    <select name={campo.nome} defaultValue={valor} className={inputCls}>
                      <option value="">Selecione…</option>
                      {Object.entries(campo.opcoes ?? {}).map(([v, r]) => (
                        <option key={v} value={v}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : campo.tipo === "pessoa" || campo.tipo === "hipotese" ? (
                    <select name={campo.nome} defaultValue={valor} className={inputCls}>
                      <option value="">Não vinculado</option>
                      {(campo.tipo === "pessoa" ? pessoas : hipoteses)
                        .filter((o) => o.id !== edicao.linha?.id)
                        .map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.nome ?? o.titulo}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input
                      name={campo.nome}
                      type={campo.tipo === "data" ? "date" : campo.tipo === "datahora" ? "datetime-local" : "text"}
                      defaultValue={campo.tipo === "datahora" && valor ? String(valor).slice(0, 16) : valor}
                      className={inputCls}
                    />
                  )}
                </Campo>
              );
            })}
            <button
              type="submit"
              disabled={salvarMut.isPending}
              className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-60"
            >
              {salvarMut.isPending ? "Salvando…" : "Salvar"}
            </button>
            <p className="text-xs text-navy/50">
              As travas do banco continuam valendo: validar evidência exige responsável, fonte e justificativa; confirmar
              hipótese exige pelo menos uma evidência validada vinculada.
            </p>
          </form>
        </Gaveta>
      )}
    </div>
  );
}
