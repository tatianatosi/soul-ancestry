import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AbaModulos } from "@/components/genealogia/aba-modulos";
import { AbaProjecaoCliente } from "@/components/genealogia/aba-projecao-cliente";
import type { RegistroModulo } from "@/lib/genealogia-modulos";
import {
  ESTADO_VALIDACAO_VARIANTE,
  MOTIVO_SEM_PROJECAO,
  NIVEIS_CONFIANCA,
  SEXO,
  STATUS_LINHA,
  STATUS_PESQUISA_RELACAO,
  STATUS_VALIDACAO_EVENTO,
  STATUS_VERIFICACAO,
  TIPOS_EVENTO,
  TIPOS_LINHA,
  TIPOS_RELACAO,
  TIPOS_VARIANTE,
  calcularLacunas,
  contarNos,
  montarArvore,
  montarTimeline,
  rotuloDe,
  validarEvento,
  validarLinhagem,
  validarPerfil,
  validarRelacao,
  validarVariante,
  type Evento,
  type Linhagem,
  type NoArvore,
  type Perfil,
  type Relacao,
  type Variante,
} from "@/lib/pessoas-linhagens";
import {
  arquivarRegistroG02,
  criarPessoaComPerfil,
  painelPessoasLinhagens,
  salvarRegistroG02,
} from "@/lib/pessoas-linhagens.functions";

export const Route = createFileRoute("/_authenticated/pessoas-linhagens/$caseId")({
  component: Pagina,
  head: () => ({
    meta: [
      { title: "Pessoas e linhagens — ficha genealógica interna | Desk" },
      {
        name: "description",
        content:
          "Origem canônica de pessoas, relações, variantes de nome, eventos e linhagens do caso, com árvore e linha do tempo derivadas de registros persistidos.",
      },
      { property: "og:title", content: "Pessoas e linhagens — ficha genealógica interna" },
      {
        property: "og:description",
        content: "Perfil 360°, árvore interna, timeline, relações, variantes, linhagens e lacunas de pesquisa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-terracotta">Não foi possível carregar a ficha: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm text-navy/70">Caso não encontrado.</div>,
});

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold";
const btnCls = "rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-cream hover:bg-navy/90 disabled:opacity-50";

function Campo({ label, children, ajuda }: { label: string; children: React.ReactNode; ajuda?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">{label}</label>
      {children}
      {ajuda ? <p className="mt-1 text-xs text-navy/50">{ajuda}</p> : null}
    </div>
  );
}

function Selecao({
  valor,
  onChange,
  opcoes,
  vazio,
}: {
  valor: string;
  onChange: (v: string) => void;
  opcoes: { id: string; rotulo: string }[];
  vazio?: string;
}) {
  return (
    <select className={inputCls} value={valor} onChange={(e) => onChange(e.target.value)}>
      {vazio ? <option value="">{vazio}</option> : null}
      {opcoes.map((o) => (
        <option key={o.id} value={o.id}>
          {o.rotulo}
        </option>
      ))}
    </select>
  );
}

function Selo({ texto, tom }: { texto: string; tom: "ok" | "alerta" | "neutro" }) {
  const cls =
    tom === "ok"
      ? "bg-gold/20 text-navy"
      : tom === "alerta"
        ? "bg-terracotta/15 text-terracotta"
        : "bg-navy/10 text-navy/70";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls}`}>{texto}</span>;
}

const ABAS = [
  { id: "perfis", rotulo: "Perfil 360°" },
  { id: "arvore", rotulo: "Árvore interna" },
  { id: "timeline", rotulo: "Linha do tempo" },
  { id: "relacoes", rotulo: "Relações" },
  { id: "variantes", rotulo: "Variantes de nome" },
  { id: "linhagens", rotulo: "Linhagens" },
  { id: "eventos", rotulo: "Eventos" },
  { id: "modulos", rotulo: "Módulos históricos" },
  { id: "lacunas", rotulo: "Lacunas e próximas pesquisas" },
  { id: "projecao", rotulo: "Projeção ao cliente" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

function Pagina() {
  const { caseId } = Route.useParams();
  const buscar = useServerFn(painelPessoasLinhagens);
  const queryClient = useQueryClient();
  const chave = ["g02", caseId];
  const { data, isLoading } = useQuery({ queryKey: chave, queryFn: () => buscar({ data: { caseId } }) });
  const [aba, setAba] = useState<AbaId>("perfis");

  const salvarFn = useServerFn(salvarRegistroG02);
  const criarPessoaFn = useServerFn(criarPessoaComPerfil);
  const arquivarFn = useServerFn(arquivarRegistroG02);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: chave });

  const salvar = useMutation({
    mutationFn: (v: { tabela: string; id?: string; valores: Record<string, unknown> }) =>
      salvarFn({ data: { tabela: v.tabela as never, id: v.id, caseId, valores: v.valores } }),
    onSuccess: () => {
      toast.success("Registro gravado e reconferido no servidor.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const criarPessoa = useMutation({
    mutationFn: (v: { pesquisaId: string; valores: Record<string, unknown> }) =>
      criarPessoaFn({ data: { caseId, pesquisaId: v.pesquisaId, valores: v.valores } }),
    onSuccess: () => {
      toast.success("Pessoa e perfil genealógico criados.");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const arquivar = useMutation({
    mutationFn: (v: { tabela: string; id: string; motivo: string }) =>
      arquivarFn({ data: { tabela: v.tabela as never, id: v.id, motivo: v.motivo } }),
    onSuccess: () => {
      toast.success("Registro arquivado (sem exclusão física).");
      invalidar();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const perfis = (data?.perfis ?? []) as unknown as Perfil[];
  const variantes = (data?.variantes ?? []) as unknown as Variante[];
  const relacoes = (data?.relacoes ?? []) as unknown as Relacao[];
  const eventos = (data?.eventos ?? []) as unknown as Evento[];
  const linhagens = (data?.linhagens ?? []) as unknown as Linhagem[];
  const podeEditar = data?.podeEditar ?? false;
  const pesquisaId = (data?.pesquisas?.[0]?.id as string | undefined) ?? "";

  const pessoasOpcoes = useMemo(
    () => perfis.map((p) => ({ id: p.research_person_id, rotulo: p.nome_completo })),
    [perfis],
  );
  const evidenciaOpcoes = useMemo(
    () => (data?.evidencias ?? []).map((e: Record<string, unknown>) => ({ id: String(e["id"]), rotulo: String(e["title"] ?? "Evidência") })),
    [data],
  );
  const fonteOpcoes = useMemo(
    () => (data?.fontes ?? []).map((f: Record<string, unknown>) => ({ id: String(f["id"]), rotulo: String(f["title"] ?? "Fonte") })),
    [data],
  );
  const trilhaOpcoes = useMemo(
    () =>
      (data?.trilhas ?? []).map((t: Record<string, unknown>) => ({
        id: String(t["id"]),
        rotulo: `${String(t["code"] ?? "")} — ${String(t["pais"] ?? "")}`,
      })),
    [data],
  );
  const nucleoOpcoes = useMemo(
    () => (data?.nucleos ?? []).map((n: Record<string, unknown>) => ({ id: String(n["id"]), rotulo: String(n["nome"] ?? "Núcleo") })),
    [data],
  );

  const arvore = useMemo(() => montarArvore(perfis, relacoes), [perfis, relacoes]);
  const timeline = useMemo(() => montarTimeline(perfis, eventos), [perfis, eventos]);
  const lacunas = useMemo(() => calcularLacunas(perfis, relacoes, eventos, linhagens), [perfis, relacoes, eventos, linhagens]);

  if (isLoading) return <div className="p-6 text-sm text-navy/60">Carregando ficha genealógica…</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-2">
        <Link to="/casos/$caseId" params={{ caseId }} className="text-xs text-navy/60 underline">
          ← Voltar à ficha do caso
        </Link>
        <h1 className="text-xl font-semibold text-navy">
          Pessoas e linhagens — {String(data?.caso?.codigo ?? "caso")}
        </h1>
        <p className="max-w-3xl text-sm text-navy/70">
          Origem canônica interna de pessoas, relações, variantes, eventos e linhagens. Árvore e linha do tempo derivam
          apenas de registros persistidos. {MOTIVO_SEM_PROJECAO}
        </p>
        {!pesquisaId ? (
          <p className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
            Este caso ainda não possui registro de pesquisa. Crie a pesquisa do caso no módulo Pesquisa Genealógica
            antes de cadastrar pessoas.
          </p>
        ) : null}
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
              aba === a.id ? "bg-navy text-cream" : "bg-navy/10 text-navy/70"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba === "perfis" ? (
        <AbaPerfis
          perfis={perfis}
          variantes={variantes}
          eventos={eventos}
          relacoes={relacoes}
          evidencias={evidenciaOpcoes}
          podeEditar={podeEditar && Boolean(pesquisaId)}
          onCriar={(valores) => criarPessoa.mutate({ pesquisaId, valores })}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "genealogical_person_profiles", id, valores })}
          onArquivar={(id, motivo) => arquivar.mutate({ tabela: "genealogical_person_profiles", id, motivo })}
        />
      ) : null}

      {aba === "arvore" ? <AbaArvore arvore={arvore} /> : null}

      {aba === "timeline" ? (
        <section className="space-y-2">
          <p className="text-xs text-navy/60">
            {timeline.length} evento(s) persistido(s). Eventos sem data aparecem ao final, sem data presumida.
          </p>
          <ol className="space-y-2">
            {timeline.map((i) => (
              <li key={i.id} className="rounded-xl border border-navy/10 bg-cream p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-navy">{i.dataExibicao}</span>
                  <Selo texto={i.rotuloTipo} tom="neutro" />
                  <Selo
                    texto={i.comEvidencia ? "Com evidência" : "Sem evidência"}
                    tom={i.comEvidencia ? "ok" : "alerta"}
                  />
                  <Selo texto={rotuloDe(STATUS_VALIDACAO_EVENTO, i.status)} tom={i.status === "confirmado" ? "ok" : "neutro"} />
                </div>
                <p className="mt-1 text-sm text-navy/80">
                  {i.pessoa}
                  {i.localidade ? ` — ${i.localidade}` : ""}
                </p>
                {i.descricao ? <p className="mt-1 text-xs text-navy/60">{i.descricao}</p> : null}
              </li>
            ))}
            {timeline.length === 0 ? <p className="text-sm text-navy/60">Nenhum evento registrado.</p> : null}
          </ol>
        </section>
      ) : null}

      {aba === "relacoes" ? (
        <AbaRelacoes
          relacoes={relacoes}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          podeEditar={podeEditar}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "genealogical_relationships", id, valores })}
          onArquivar={(id, motivo) => arquivar.mutate({ tabela: "genealogical_relationships", id, motivo })}
        />
      ) : null}

      {aba === "variantes" ? (
        <AbaVariantes
          variantes={variantes}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          podeEditar={podeEditar}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "name_variants", id, valores })}
        />
      ) : null}

      {aba === "eventos" ? (
        <AbaEventos
          eventos={eventos}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          podeEditar={podeEditar}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "genealogical_events", id, valores })}
        />
      ) : null}

      {aba === "linhagens" ? (
        <AbaLinhagens
          caseId={caseId}
          linhagens={linhagens}
          pessoas={pessoasOpcoes}
          trilhas={trilhaOpcoes}
          nucleos={nucleoOpcoes}
          podeEditar={podeEditar}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "lineage_paths", id, valores })}
        />
      ) : null}

      {aba === "modulos" ? (
        <AbaModulos
          modulos={(data?.modulos ?? {}) as unknown as Record<string, RegistroModulo[]>}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          podeEditar={podeEditar}
          onSalvar={(tabela, valores) => salvar.mutate({ tabela, valores })}
          onArquivar={(tabela, id, motivo) => arquivar.mutate({ tabela, id, motivo })}
        />
      ) : null}

      {aba === "projecao" ? (
        <AbaProjecaoCliente perfis={perfis} relacoes={relacoes} eventos={eventos} arvore={arvore} />
      ) : null}

      {aba === "lacunas" ? (
        <section className="space-y-2">
          <p className="text-xs text-navy/60">
            Lacunas derivadas dos registros existentes. Nenhuma pesquisa externa é iniciada por esta tela.
          </p>
          {lacunas.map((l) => (
            <div key={l.chave} className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream p-3">
              <Selo texto={l.prioridade === "alta" ? "Alta" : "Média"} tom={l.prioridade === "alta" ? "alerta" : "neutro"} />
              {l.pessoa ? <span className="text-sm font-medium text-navy">{l.pessoa}</span> : null}
              <span className="text-sm text-navy/70">{l.descricao}</span>
            </div>
          ))}
          {lacunas.length === 0 ? <p className="text-sm text-navy/60">Nenhuma lacuna registrada.</p> : null}
        </section>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AbaPerfis({
  perfis,
  variantes,
  eventos,
  relacoes,
  evidencias,
  podeEditar,
  onCriar,
  onSalvar,
  onArquivar,
}: {
  perfis: Perfil[];
  variantes: Variante[];
  eventos: Evento[];
  relacoes: Relacao[];
  evidencias: { id: string; rotulo: string }[];
  podeEditar: boolean;
  onCriar: (valores: Record<string, unknown>) => void;
  onSalvar: (id: string, valores: Record<string, unknown>) => void;
  onArquivar: (id: string, motivo: string) => void;
}) {
  const [novo, setNovo] = useState({ nome_completo: "", nome_nascimento: "", sexo: "", nascimento_data: "" });
  const [edicao, setEdicao] = useState<Record<string, Partial<Perfil>>>({});

  const criar = () => {
    const erros = validarPerfil(novo as Partial<Perfil>);
    if (erros.length) return toast.error(erros.join(" "));
    onCriar({ ...novo, status_verificacao: "pendente" });
    setNovo({ nome_completo: "", nome_nascimento: "", sexo: "", nascimento_data: "" });
  };

  return (
    <section className="space-y-4">
      {podeEditar ? (
        <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-4">
          <Campo label="Nome completo">
            <input className={inputCls} value={novo.nome_completo} onChange={(e) => setNovo({ ...novo, nome_completo: e.target.value })} />
          </Campo>
          <Campo label="Nome de nascimento">
            <input className={inputCls} value={novo.nome_nascimento} onChange={(e) => setNovo({ ...novo, nome_nascimento: e.target.value })} />
          </Campo>
          <Campo label="Sexo">
            <Selecao valor={novo.sexo} onChange={(v) => setNovo({ ...novo, sexo: v })} opcoes={SEXO} vazio="Não informado" />
          </Campo>
          <Campo label="Nascimento (data)" ajuda="Deixe vazio se não houver documento.">
            <input type="date" className={inputCls} value={novo.nascimento_data} onChange={(e) => setNovo({ ...novo, nascimento_data: e.target.value })} />
          </Campo>
          <div className="md:col-span-4">
            <button type="button" className={btnCls} onClick={criar}>
              Criar pessoa e perfil 360°
            </button>
          </div>
        </div>
      ) : null}

      {perfis.map((p) => {
        const e = { ...p, ...(edicao[p.id] ?? {}) };
        const set = (campo: keyof Perfil, valor: unknown) =>
          setEdicao((a) => ({ ...a, [p.id]: { ...(a[p.id] ?? {}), [campo]: valor } }));
        const salvar = () => {
          const erros = validarPerfil(e);
          if (erros.length) return toast.error(erros.join(" "));
          onSalvar(p.id, {
            nome_completo: e.nome_completo,
            nome_nascimento: e.nome_nascimento,
            sexo: e.sexo,
            nascimento_data: e.nascimento_data,
            nascimento_data_aproximada: e.nascimento_data_aproximada,
            nascimento_localidade: e.nascimento_localidade,
            morte_data: e.morte_data,
            morte_data_aproximada: e.morte_data_aproximada,
            morte_localidade: e.morte_localidade,
            causa_morte: e.causa_morte,
            sepultamento_localidade: e.sepultamento_localidade,
            status_verificacao: e.status_verificacao,
            evidence_id: e.evidence_id,
            internal_notes: e.internal_notes,
          });
        };
        const minhasVariantes = variantes.filter((v) => v.person_id === p.research_person_id && !v.archived_at);
        const meusEventos = eventos.filter((ev) => ev.person_id === p.research_person_id && !ev.archived_at);
        const minhasRelacoes = relacoes.filter(
          (r) => (r.person_from_id === p.research_person_id || r.person_to_id === p.research_person_id) && !r.archived_at,
        );

        return (
          <article key={p.id} className="space-y-3 rounded-xl border border-navy/10 bg-cream p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-navy">{p.nome_completo}</h2>
              <Selo
                texto={rotuloDe(STATUS_VERIFICACAO, p.status_verificacao)}
                tom={p.status_verificacao === "confirmado" ? "ok" : "neutro"}
              />
              <span className="text-xs text-navy/50">
                {minhasVariantes.length} variante(s) · {minhasRelacoes.length} relação(ões) · {meusEventos.length} evento(s)
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Campo label="Nome completo">
                <input className={inputCls} value={e.nome_completo ?? ""} disabled={!podeEditar} onChange={(x) => set("nome_completo", x.target.value)} />
              </Campo>
              <Campo label="Nome de nascimento">
                <input className={inputCls} value={e.nome_nascimento ?? ""} disabled={!podeEditar} onChange={(x) => set("nome_nascimento", x.target.value)} />
              </Campo>
              <Campo label="Sexo">
                <Selecao valor={e.sexo ?? ""} onChange={(v) => set("sexo", v)} opcoes={SEXO} vazio="Não informado" />
              </Campo>
              <Campo label="Nascimento (data)">
                <input type="date" className={inputCls} value={e.nascimento_data ?? ""} disabled={!podeEditar} onChange={(x) => set("nascimento_data", x.target.value)} />
              </Campo>
              <Campo label="Nascimento (aproximado)" ajuda="Ex.: 'entre 1890 e 1893'.">
                <input className={inputCls} value={e.nascimento_data_aproximada ?? ""} disabled={!podeEditar} onChange={(x) => set("nascimento_data_aproximada", x.target.value)} />
              </Campo>
              <Campo label="Nascimento (localidade)">
                <input className={inputCls} value={e.nascimento_localidade ?? ""} disabled={!podeEditar} onChange={(x) => set("nascimento_localidade", x.target.value)} />
              </Campo>
              <Campo label="Morte (data)">
                <input type="date" className={inputCls} value={e.morte_data ?? ""} disabled={!podeEditar} onChange={(x) => set("morte_data", x.target.value)} />
              </Campo>
              <Campo label="Morte (aproximada)">
                <input className={inputCls} value={e.morte_data_aproximada ?? ""} disabled={!podeEditar} onChange={(x) => set("morte_data_aproximada", x.target.value)} />
              </Campo>
              <Campo label="Morte (localidade)">
                <input className={inputCls} value={e.morte_localidade ?? ""} disabled={!podeEditar} onChange={(x) => set("morte_localidade", x.target.value)} />
              </Campo>
              <Campo label="Causa da morte">
                <input className={inputCls} value={e.causa_morte ?? ""} disabled={!podeEditar} onChange={(x) => set("causa_morte", x.target.value)} />
              </Campo>
              <Campo label="Sepultamento (localidade)">
                <input className={inputCls} value={e.sepultamento_localidade ?? ""} disabled={!podeEditar} onChange={(x) => set("sepultamento_localidade", x.target.value)} />
              </Campo>
              <Campo label="Status de verificação">
                <Selecao valor={e.status_verificacao ?? "pendente"} onChange={(v) => set("status_verificacao", v)} opcoes={STATUS_VERIFICACAO} />
              </Campo>
              <Campo label="Evidência de suporte" ajuda="Obrigatória para status confirmado.">
                <Selecao valor={e.evidence_id ?? ""} onChange={(v) => set("evidence_id", v)} opcoes={evidencias} vazio="Sem evidência vinculada" />
              </Campo>
              <div className="md:col-span-2">
                <Campo label="Notas internas" ajuda="Nunca exibidas ao cliente.">
                  <textarea className={inputCls} rows={2} value={e.internal_notes ?? ""} disabled={!podeEditar} onChange={(x) => set("internal_notes", x.target.value)} />
                </Campo>
              </div>
            </div>

            {podeEditar ? (
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnCls} onClick={salvar}>
                  Salvar perfil
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-terracotta/40 px-3 py-2 text-xs font-semibold text-terracotta"
                  onClick={() => {
                    const motivo = window.prompt("Motivo do arquivamento (mínimo 5 caracteres):") ?? "";
                    if (motivo.trim().length >= 5) onArquivar(p.id, motivo);
                    else if (motivo) toast.error("Motivo muito curto.");
                  }}
                >
                  Arquivar
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
      {perfis.length === 0 ? <p className="text-sm text-navy/60">Nenhuma pessoa cadastrada neste caso.</p> : null}
    </section>
  );
}

function NoDaArvore({ no }: { no: NoArvore }) {
  return (
    <li className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-navy">{no.nome}</span>
        <Selo texto={`G${no.geracao}`} tom="neutro" />
        <Selo texto={rotuloDe(STATUS_VERIFICACAO, no.status)} tom={no.status === "confirmado" ? "ok" : "neutro"} />
        {no.relacaoComPai && no.relacaoComPai.status !== "confirmado" ? (
          <Selo texto="Vínculo a confirmar" tom="alerta" />
        ) : null}
        {no.conjuges.length > 0 ? (
          <span className="text-xs text-navy/60">cônjuge: {no.conjuges.map((c) => c.nome).join(", ")}</span>
        ) : null}
      </div>
      {no.filhos.length > 0 ? (
        <ul className="ml-4 border-l border-navy/15 pl-4">
          {no.filhos.map((f) => (
            <NoDaArvore key={f.personId} no={f} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function AbaArvore({ arvore }: { arvore: NoArvore[] }) {
  return (
    <section className="space-y-2 rounded-xl border border-navy/10 bg-cream p-4">
      <p className="text-xs text-navy/60">
        {contarNos(arvore)} pessoa(s) na árvore, derivada exclusivamente das relações persistidas. Vínculo sem evidência
        aparece como "a confirmar".
      </p>
      <ul>
        {arvore.map((n) => (
          <NoDaArvore key={n.personId} no={n} />
        ))}
      </ul>
      {arvore.length === 0 ? <p className="text-sm text-navy/60">Sem pessoas para montar a árvore.</p> : null}
    </section>
  );
}

function AbaRelacoes({
  relacoes,
  pessoas,
  evidencias,
  fontes,
  podeEditar,
  onSalvar,
  onArquivar,
}: {
  relacoes: Relacao[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
  podeEditar: boolean;
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
  onArquivar: (id: string, motivo: string) => void;
}) {
  const vazia = {
    person_from_id: "",
    person_to_id: "",
    relation_type: "a_confirmar",
    relation_date: "",
    relation_date_aproximada: "",
    locality: "",
    status_pesquisa: "a_confirmar",
    evidence_id: "",
    source_id: "",
    internal_notes: "",
  };
  const [nova, setNova] = useState(vazia);
  const nome = (id: string) => pessoas.find((p) => p.id === id)?.rotulo ?? "—";

  return (
    <section className="space-y-4">
      {podeEditar ? (
        <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-3">
          <Campo label="De (pessoa)">
            <Selecao valor={nova.person_from_id} onChange={(v) => setNova({ ...nova, person_from_id: v })} opcoes={pessoas} vazio="Selecione" />
          </Campo>
          <Campo label="Para (pessoa)">
            <Selecao valor={nova.person_to_id} onChange={(v) => setNova({ ...nova, person_to_id: v })} opcoes={pessoas} vazio="Selecione" />
          </Campo>
          <Campo label="Tipo de relação">
            <Selecao valor={nova.relation_type} onChange={(v) => setNova({ ...nova, relation_type: v })} opcoes={TIPOS_RELACAO} />
          </Campo>
          <Campo label="Data">
            <input type="date" className={inputCls} value={nova.relation_date} onChange={(e) => setNova({ ...nova, relation_date: e.target.value })} />
          </Campo>
          <Campo label="Data aproximada">
            <input className={inputCls} value={nova.relation_date_aproximada} onChange={(e) => setNova({ ...nova, relation_date_aproximada: e.target.value })} />
          </Campo>
          <Campo label="Localidade">
            <input className={inputCls} value={nova.locality} onChange={(e) => setNova({ ...nova, locality: e.target.value })} />
          </Campo>
          <Campo label="Status de pesquisa">
            <Selecao valor={nova.status_pesquisa} onChange={(v) => setNova({ ...nova, status_pesquisa: v })} opcoes={STATUS_PESQUISA_RELACAO} />
          </Campo>
          <Campo label="Evidência">
            <Selecao valor={nova.evidence_id} onChange={(v) => setNova({ ...nova, evidence_id: v })} opcoes={evidencias} vazio="Sem evidência" />
          </Campo>
          <Campo label="Fonte">
            <Selecao valor={nova.source_id} onChange={(v) => setNova({ ...nova, source_id: v })} opcoes={fontes} vazio="Sem fonte" />
          </Campo>
          <div className="md:col-span-3">
            <button
              type="button"
              className={btnCls}
              onClick={() => {
                const erros = validarRelacao(nova as Partial<Relacao>);
                if (erros.length) return toast.error(erros.join(" "));
                onSalvar(undefined, nova);
                setNova(vazia);
              }}
            >
              Registrar relação
            </button>
          </div>
        </div>
      ) : null}

      {relacoes.filter((r) => !r.archived_at).map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream p-3">
          <span className="text-sm text-navy">
            {nome(r.person_from_id)} → {nome(r.person_to_id)}
          </span>
          <Selo texto={rotuloDe(TIPOS_RELACAO, r.relation_type)} tom="neutro" />
          <Selo
            texto={rotuloDe(STATUS_PESQUISA_RELACAO, r.status_pesquisa)}
            tom={r.status_pesquisa === "confirmado" ? "ok" : "alerta"}
          />
          {r.locality ? <span className="text-xs text-navy/60">{r.locality}</span> : null}
          {podeEditar ? (
            <button
              type="button"
              className="ml-auto text-xs text-terracotta underline"
              onClick={() => {
                const motivo = window.prompt("Motivo do arquivamento (mínimo 5 caracteres):") ?? "";
                if (motivo.trim().length >= 5) onArquivar(r.id, motivo);
              }}
            >
              Arquivar
            </button>
          ) : null}
        </div>
      ))}
      {relacoes.length === 0 ? <p className="text-sm text-navy/60">Nenhuma relação registrada.</p> : null}
    </section>
  );
}

function AbaVariantes({
  variantes,
  pessoas,
  evidencias,
  fontes,
  podeEditar,
  onSalvar,
}: {
  variantes: Variante[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
  podeEditar: boolean;
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
}) {
  const vazia = {
    person_id: "",
    variante: "",
    tipo: "grafia",
    periodo: "",
    localidade: "",
    estado_validacao: "a_confirmar",
    nivel_confianca: "baixo",
    evidence_id: "",
    source_id: "",
    observacao_interna: "",
  };
  const [nova, setNova] = useState(vazia);
  const nome = (id: string) => pessoas.find((p) => p.id === id)?.rotulo ?? "—";

  return (
    <section className="space-y-4">
      <p className="text-xs text-navy/60">
        Variante de nome nunca cria pessoa nova: ela sempre pertence a uma pessoa já cadastrada.
      </p>
      {podeEditar ? (
        <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-3">
          <Campo label="Pessoa">
            <Selecao valor={nova.person_id} onChange={(v) => setNova({ ...nova, person_id: v })} opcoes={pessoas} vazio="Selecione" />
          </Campo>
          <Campo label="Variante">
            <input className={inputCls} value={nova.variante} onChange={(e) => setNova({ ...nova, variante: e.target.value })} />
          </Campo>
          <Campo label="Tipo">
            <Selecao valor={nova.tipo} onChange={(v) => setNova({ ...nova, tipo: v })} opcoes={TIPOS_VARIANTE} />
          </Campo>
          <Campo label="Período">
            <input className={inputCls} value={nova.periodo} onChange={(e) => setNova({ ...nova, periodo: e.target.value })} />
          </Campo>
          <Campo label="Localidade">
            <input className={inputCls} value={nova.localidade} onChange={(e) => setNova({ ...nova, localidade: e.target.value })} />
          </Campo>
          <Campo label="Estado de validação">
            <Selecao valor={nova.estado_validacao} onChange={(v) => setNova({ ...nova, estado_validacao: v })} opcoes={ESTADO_VALIDACAO_VARIANTE} />
          </Campo>
          <Campo label="Nível de confiança">
            <Selecao valor={nova.nivel_confianca} onChange={(v) => setNova({ ...nova, nivel_confianca: v })} opcoes={NIVEIS_CONFIANCA} />
          </Campo>
          <Campo label="Evidência">
            <Selecao valor={nova.evidence_id} onChange={(v) => setNova({ ...nova, evidence_id: v })} opcoes={evidencias} vazio="Sem evidência" />
          </Campo>
          <Campo label="Fonte">
            <Selecao valor={nova.source_id} onChange={(v) => setNova({ ...nova, source_id: v })} opcoes={fontes} vazio="Sem fonte" />
          </Campo>
          <div className="md:col-span-3">
            <button
              type="button"
              className={btnCls}
              onClick={() => {
                const erros = validarVariante(nova as Partial<Variante>, variantes);
                if (erros.length) return toast.error(erros.join(" "));
                onSalvar(undefined, nova);
                setNova(vazia);
              }}
            >
              Registrar variante
            </button>
          </div>
        </div>
      ) : null}

      {variantes.filter((v) => !v.archived_at).map((v) => (
        <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream p-3">
          <span className="text-sm text-navy">{v.variante}</span>
          <span className="text-xs text-navy/60">de {nome(v.person_id)}</span>
          <Selo texto={rotuloDe(TIPOS_VARIANTE, v.tipo)} tom="neutro" />
          <Selo texto={rotuloDe(ESTADO_VALIDACAO_VARIANTE, v.estado_validacao)} tom={v.estado_validacao === "validada" ? "ok" : "neutro"} />
          <Selo texto={`Confiança ${rotuloDe(NIVEIS_CONFIANCA, v.nivel_confianca).toLowerCase()}`} tom="neutro" />
        </div>
      ))}
      {variantes.length === 0 ? <p className="text-sm text-navy/60">Nenhuma variante registrada.</p> : null}
    </section>
  );
}

function AbaEventos({
  eventos,
  pessoas,
  evidencias,
  fontes,
  podeEditar,
  onSalvar,
}: {
  eventos: Evento[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
  podeEditar: boolean;
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
}) {
  const vazio = {
    person_id: "",
    event_type: "nascimento",
    start_date: "",
    end_date: "",
    approximate_date: "",
    locality: "",
    description_internal: "",
    validation_status: "pendente",
    evidence_id: "",
    source_id: "",
  };
  const [novo, setNovo] = useState(vazio);
  const nome = (id: string) => pessoas.find((p) => p.id === id)?.rotulo ?? "—";

  return (
    <section className="space-y-4">
      {podeEditar ? (
        <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-3">
          <Campo label="Pessoa">
            <Selecao valor={novo.person_id} onChange={(v) => setNovo({ ...novo, person_id: v })} opcoes={pessoas} vazio="Selecione" />
          </Campo>
          <Campo label="Tipo de evento">
            <Selecao valor={novo.event_type} onChange={(v) => setNovo({ ...novo, event_type: v })} opcoes={TIPOS_EVENTO} />
          </Campo>
          <Campo label="Status de validação">
            <Selecao valor={novo.validation_status} onChange={(v) => setNovo({ ...novo, validation_status: v })} opcoes={STATUS_VALIDACAO_EVENTO} />
          </Campo>
          <Campo label="Data inicial">
            <input type="date" className={inputCls} value={novo.start_date} onChange={(e) => setNovo({ ...novo, start_date: e.target.value })} />
          </Campo>
          <Campo label="Data final">
            <input type="date" className={inputCls} value={novo.end_date} onChange={(e) => setNovo({ ...novo, end_date: e.target.value })} />
          </Campo>
          <Campo label="Data aproximada">
            <input className={inputCls} value={novo.approximate_date} onChange={(e) => setNovo({ ...novo, approximate_date: e.target.value })} />
          </Campo>
          <Campo label="Localidade">
            <input className={inputCls} value={novo.locality} onChange={(e) => setNovo({ ...novo, locality: e.target.value })} />
          </Campo>
          <Campo label="Evidência">
            <Selecao valor={novo.evidence_id} onChange={(v) => setNovo({ ...novo, evidence_id: v })} opcoes={evidencias} vazio="Sem evidência" />
          </Campo>
          <Campo label="Fonte">
            <Selecao valor={novo.source_id} onChange={(v) => setNovo({ ...novo, source_id: v })} opcoes={fontes} vazio="Sem fonte" />
          </Campo>
          <div className="md:col-span-3">
            <Campo label="Descrição interna">
              <textarea className={inputCls} rows={2} value={novo.description_internal} onChange={(e) => setNovo({ ...novo, description_internal: e.target.value })} />
            </Campo>
          </div>
          <div className="md:col-span-3">
            <button
              type="button"
              className={btnCls}
              onClick={() => {
                const erros = validarEvento(novo as Partial<Evento>);
                if (erros.length) return toast.error(erros.join(" "));
                onSalvar(undefined, novo);
                setNovo(vazio);
              }}
            >
              Registrar evento
            </button>
          </div>
        </div>
      ) : null}

      {eventos.filter((e) => !e.archived_at).map((e) => (
        <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream p-3">
          <span className="text-sm text-navy">{nome(e.person_id)}</span>
          <Selo texto={rotuloDe(TIPOS_EVENTO, e.event_type)} tom="neutro" />
          <span className="text-xs text-navy/60">{e.start_date ?? e.approximate_date ?? "Data não informada"}</span>
          <Selo texto={rotuloDe(STATUS_VALIDACAO_EVENTO, e.validation_status)} tom={e.validation_status === "confirmado" ? "ok" : "neutro"} />
        </div>
      ))}
      {eventos.length === 0 ? <p className="text-sm text-navy/60">Nenhum evento registrado.</p> : null}
    </section>
  );
}

function AbaLinhagens({
  caseId,
  linhagens,
  pessoas,
  trilhas,
  nucleos,
  podeEditar,
  onSalvar,
}: {
  caseId: string;
  linhagens: Linhagem[];
  pessoas: { id: string; rotulo: string }[];
  trilhas: { id: string; rotulo: string }[];
  nucleos: { id: string; rotulo: string }[];
  podeEditar: boolean;
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
}) {
  const vazia = {
    nome_da_linha: "",
    tipo_da_linha: "a_confirmar",
    pessoa_ancora_id: "",
    family_id: "",
    citizenship_track_id: "",
    objetivo: "",
    geracao_alvo: "",
    status: "em_estruturacao",
    risco_principal: "",
    proximo_marco: "",
    responsavel: "",
  };
  const [nova, setNova] = useState(vazia);

  return (
    <section className="space-y-4">
      <p className="text-xs text-navy/60">
        Linha dupla é configuração de análise: o mesmo caso aceita várias linhagens, sem duplicar pessoa nem criar caso novo.
      </p>
      {podeEditar ? (
        <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-3">
          <Campo label="Nome da linha">
            <input className={inputCls} value={nova.nome_da_linha} onChange={(e) => setNova({ ...nova, nome_da_linha: e.target.value })} />
          </Campo>
          <Campo label="Tipo da linha">
            <Selecao valor={nova.tipo_da_linha} onChange={(v) => setNova({ ...nova, tipo_da_linha: v })} opcoes={TIPOS_LINHA} />
          </Campo>
          <Campo label="Pessoa âncora">
            <Selecao valor={nova.pessoa_ancora_id} onChange={(v) => setNova({ ...nova, pessoa_ancora_id: v })} opcoes={pessoas} vazio="A definir" />
          </Campo>
          <Campo label="Núcleo familiar">
            <Selecao valor={nova.family_id} onChange={(v) => setNova({ ...nova, family_id: v })} opcoes={nucleos} vazio="Não vinculado" />
          </Campo>
          <Campo label="Trilha de cidadania">
            <Selecao valor={nova.citizenship_track_id} onChange={(v) => setNova({ ...nova, citizenship_track_id: v })} opcoes={trilhas} vazio="Não aplicável" />
          </Campo>
          <Campo label="Status">
            <Selecao valor={nova.status} onChange={(v) => setNova({ ...nova, status: v })} opcoes={STATUS_LINHA} />
          </Campo>
          <Campo label="Objetivo">
            <input className={inputCls} value={nova.objetivo} onChange={(e) => setNova({ ...nova, objetivo: e.target.value })} />
          </Campo>
          <Campo label="Geração alvo">
            <input className={inputCls} value={nova.geracao_alvo} onChange={(e) => setNova({ ...nova, geracao_alvo: e.target.value })} />
          </Campo>
          <Campo label="Responsável">
            <input className={inputCls} value={nova.responsavel} onChange={(e) => setNova({ ...nova, responsavel: e.target.value })} />
          </Campo>
          <Campo label="Risco principal">
            <input className={inputCls} value={nova.risco_principal} onChange={(e) => setNova({ ...nova, risco_principal: e.target.value })} />
          </Campo>
          <Campo label="Próximo marco">
            <input className={inputCls} value={nova.proximo_marco} onChange={(e) => setNova({ ...nova, proximo_marco: e.target.value })} />
          </Campo>
          <div className="md:col-span-3">
            <button
              type="button"
              className={btnCls}
              onClick={() => {
                const erros = validarLinhagem({ ...nova, case_id: caseId } as Partial<Linhagem>, linhagens);
                if (erros.length) return toast.error(erros.join(" "));
                onSalvar(undefined, nova);
                setNova(vazia);
              }}
            >
              Registrar linhagem
            </button>
          </div>
        </div>
      ) : null}

      {linhagens.filter((l) => !l.archived_at).map((l) => (
        <div key={l.id} className="space-y-1 rounded-xl border border-navy/10 bg-cream p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-navy">{l.nome_da_linha}</span>
            <Selo texto={rotuloDe(TIPOS_LINHA, l.tipo_da_linha)} tom="neutro" />
            <Selo texto={rotuloDe(STATUS_LINHA, l.status)} tom={l.status === "com_suporte" ? "ok" : "neutro"} />
          </div>
          <p className="text-xs text-navy/60">
            {l.objetivo ?? "Objetivo não informado"} · próximo marco: {l.proximo_marco ?? "não registrado"} ·
            responsável: {l.responsavel ?? "não atribuído"}
          </p>
        </div>
      ))}
      {linhagens.length === 0 ? <p className="text-sm text-navy/60">Nenhuma linhagem registrada.</p> : null}
    </section>
  );
}
