import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AvisoCampo, motivoCampoInvalido } from "@/components/campos/aviso-campo";
import { ANO_MINIMO_GENEALOGICO, dataValida, nomeValido } from "@/lib/validacao-pessoa";
import { AbaModulos } from "@/components/genealogia/aba-modulos";
import { AbaProjecaoCliente } from "@/components/genealogia/aba-projecao-cliente";
import { PublicarArvoreApp } from "@/components/genealogia/publicar-arvore-app";
import { PRECISAO_DATA, VISIBILIDADE_CLIENTE, MODULOS_HISTORICOS, type RegistroModulo } from "@/lib/genealogia-modulos";
import { RESUMO_GATE_ARVORE } from "@/lib/visibilidade-arvore";
import {
  ESTADO_VALIDACAO_VARIANTE,
  IMPACTO_EVENTO,
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
  geracaoAscendente,
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
  type PessoaGeracao,
  type Relacao,
  type Variante,
} from "@/lib/pessoas-linhagens";
import {
  arquivarRegistroG02,
  criarPessoaComPerfil,
  painelPessoasLinhagens,
  salvarRegistroG02,
} from "@/lib/pessoas-linhagens.functions";
import { useAutoridade } from "@/components/saas/autoridade";
import { EstadoVazio, SaasShell, useSaas } from "@/components/saas/shell";
import { DecisaoAposSalvarPessoa } from "@/components/pessoa/decisao-apos-salvar";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";
import {
  KitBadge,
  KitCard,
  KpiCard,
  PersonNode,
} from "@/components/clube-ancestral-kit";
import { Linha as LinhaV4 } from "@/components/prancha-v4/kit";

export const Route = createFileRoute("/_authenticated/pessoas-linhagens/$caseId")({
  staticData: { sitemap: false },
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
    <SaasShell titulo="Pessoas e linhagens" descricao="Falha ao carregar a ficha.">
      <p role="alert" className="text-sm text-terracotta">Não foi possível carregar a ficha: {(error as Error).message}</p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Pessoas e linhagens" descricao="Caso não encontrado.">
      <p className="text-sm text-navy/70">Caso não encontrado.</p>
    </SaasShell>
  ),
});

const inputCls =
  "w-full rounded-lg border border-navy/15 bg-cream px-3 py-2 text-sm text-navy outline-none focus:border-gold";
const btnCls = "rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-cream hover:bg-navy/90 disabled:opacity-50";

/*
  03/10/2026 — `erro` entra aqui, e não em cada campo, porque a varredura de
  máscaras mostrou o custo do contrário: cada tela reescrevia condição,
  mensagem e classe de erro à mão, e por isso a varredura saía 3 campos por
  rodada. Com o erro no `Campo`, religar é uma linha. A mensagem substitui a
  ajuda enquanto existir, para não empilhar dois textos sob o campo.
*/
function Campo({
  label,
  children,
  ajuda,
  erro,
}: {
  label: string;
  children: React.ReactNode;
  ajuda?: string;
  erro?: string | null;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">{label}</label>
      {children}
      {erro ? <AvisoCampo motivo={erro} /> : ajuda ? <p className="mt-1 text-xs text-navy/50">{ajuda}</p> : null}
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
  { id: "geracao", rotulo: "Por geração (G1...Gn)" },
  { id: "timeline", rotulo: "Linha do tempo genealógica" },
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
  const autoridade = useAutoridade();
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_pessoas_dependentes_representacao" });
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const { caseId } = Route.useParams();
  const buscar = useServerFn(painelPessoasLinhagens);
  const queryClient = useQueryClient();
  const chave = ["g02", caseId];
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: chave, queryFn: () => buscar({ data: { caseId } }) });
  const [aba, setAba] = useState<AbaId>("perfis");
  // Corte 1 (27/09/2026): trocar de aba com perfil editado e não salvo pede confirmação.
  const [perfisSujos, setPerfisSujos] = useState(false);
  const [abaPendente, setAbaPendente] = useState<AbaId | null>(null);
  const [decisaoAposPerfil, setDecisaoAposPerfil] = useState(false);

  const salvarFn = useServerFn(salvarRegistroG02);
  const criarPessoaFn = useServerFn(criarPessoaComPerfil);
  const arquivarFn = useServerFn(arquivarRegistroG02);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: chave });

  const salvar = useMutation({
    mutationFn: (v: { tabela: string; id?: string; valores: Record<string, unknown> }) =>
      salvarFn({ data: { tabela: v.tabela as never, id: v.id, caseId, valores: v.valores } }),
    onSuccess: (_r, v) => {
      toast.success("Salvo e confirmado no banco.");
      invalidar();
      if (v.tabela === "genealogical_person_profiles") setDecisaoAposPerfil(true);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const criarPessoa = useMutation({
    mutationFn: (v: { pesquisaId: string; valores: Record<string, unknown> }) =>
      criarPessoaFn({ data: { caseId, pesquisaId: v.pesquisaId, valores: v.valores } }),
    onSuccess: (r: { reaproveitado?: boolean }) => {
      toast.success(
        r.reaproveitado
          ? "Já existe pessoa com este nome nesta pesquisa — reaproveitada, não duplicada."
          : "Pessoa e perfil genealógico criados.",
      );
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

  // Leitura explícita: coalescer para lista vazia transformava falha de carga
  // em "nada cadastrado".
  // Aqui a ausência do payload é tratada adiante como erro de carga, nunca como
  // base vazia (ver o bloco `semPayload` antes do render).
  const perfis = (data ? data.perfis : []) as unknown as Perfil[];
  const clientesDoCaso = (data ? data.clientesDoCaso : []) as unknown as { id: string; nome: string }[];
  const variantes = (data ? data.variantes : []) as unknown as Variante[];
  const relacoes = (data ? data.relacoes : []) as unknown as Relacao[];
  const eventos = (data ? data.eventos : []) as unknown as Evento[];
  const linhagens = (data ? data.linhagens : []) as unknown as Linhagem[];
  // Autoridade operacional (05/09/2026): o gate de domínio do servidor
  // (`podeEditar`) deixou de desabilitar campo e de esconder formulário. Os
  // formulários renderizam sempre; a pendência fica declarada na tela e a
  // gravação segue auditada.
  const pendenciaFicha =
    data && !data.podeEditar
      ? "O servidor marcou esta ficha genealógica como somente leitura para o seu vínculo."
      : null;
  const pesquisaId = (data?.pesquisas?.[0]?.id as string | undefined) ?? "";
  const pendenciaPerfis =
    [
      pendenciaFicha,
      pesquisaId
        ? null
        : "Este caso ainda não tem registro de pesquisa genealógica: a pessoa será criada sem vínculo de pesquisa.",
    ]
      .filter(Boolean)
      .join(" ") || null;

  const pessoasOpcoes = useMemo(
    () => perfis.filter((p) => !p.archived_at).map((p) => ({ id: p.research_person_id, rotulo: p.nome_completo })),
    [perfis],
  );
  const evidenciaOpcoes = useMemo(
    () =>
      (data ? data.evidencias : []).map((e: Record<string, unknown>) => ({
        id: String(e["id"]),
        rotulo: String(e["title"] ?? "Evidência"),
      })),
    [data],
  );
  const fonteOpcoes = useMemo(
    () =>
      (data ? data.fontes : []).map((f: Record<string, unknown>) => ({
        id: String(f["id"]),
        rotulo: String(f["title"] ?? "Fonte"),
      })),
    [data],
  );
  const trilhaOpcoes = useMemo(
    () =>
      (data ? data.trilhas : []).map((t: Record<string, unknown>) => ({
        id: String(t["id"]),
        rotulo: `${String(t["code"] ?? "")} — ${String(t["pais"] ?? "")}`,
      })),
    [data],
  );
  const nucleoOpcoes = useMemo(
    () =>
      (data ? data.nucleos : []).map((n: Record<string, unknown>) => ({
        id: String(n["id"]),
        rotulo: String(n["nome"] ?? "Núcleo"),
      })),
    [data],
  );

  const arvore = useMemo(() => montarArvore(perfis, relacoes), [perfis, relacoes]);
  const timeline = useMemo(() => montarTimeline(perfis, eventos), [perfis, eventos]);
  const lacunas = useMemo(() => calcularLacunas(perfis, relacoes, eventos, linhagens), [perfis, relacoes, eventos, linhagens]);

  // Corte "Pesquisa G1...Gn" (02/10/2026): linhas com pessoa âncora definida
  // são as únicas que podem render a visão por geração — sem âncora, nada
  // é inventado (mesma pessoa que já aparece como lacuna em "sem pessoa
  // âncora definida" quando falta).
  const linhagensComAncora = useMemo(() => linhagens.filter((l) => !l.archived_at && l.pessoa_ancora_id), [linhagens]);
  const [linhaFocoId, setLinhaFocoId] = useState<string>("");
  const linhaFoco = linhagensComAncora.find((l) => l.id === linhaFocoId) ?? linhagensComAncora[0] ?? null;
  const pessoasPorGeracao = useMemo(
    () => geracaoAscendente(linhaFoco?.pessoa_ancora_id, perfis, relacoes),
    [linhaFoco, perfis, relacoes],
  );
  const geracoesAgrupadas = useMemo(() => {
    const porGeracao = new Map<number, PessoaGeracao[]>();
    for (const p of pessoasPorGeracao) porGeracao.set(p.geracao, [...(porGeracao.get(p.geracao) ?? []), p]);
    return Array.from(porGeracao.entries()).sort((a, b) => a[0] - b[0]);
  }, [pessoasPorGeracao]);
  const modulosPorPessoa = (personId: string) =>
    MODULOS_HISTORICOS.flatMap((m) => {
      const linhas = ((data?.modulos ?? {}) as Record<string, RegistroModulo[]>)[m.tabela] ?? [];
      return linhas
        .filter((r) => !r.archived_at && r.person_id === personId)
        .map((r) => ({ rotuloModulo: m.rotulo, titulo: r.titulo, comSuporte: Boolean(r.evidence_id || r.source_id) }));
    });
  // Pré-seleciona a pessoa ao saltar para "Registrar evento"/"Registrar módulo".
  const [personFoco, setPersonFoco] = useState<string | null>(null);

  if (isLoading)
    return (
      <SaasShell titulo="Pessoas e linhagens" descricao="Ficha genealógica interna do caso." visualKit="pantone">
        <p className="text-sm text-navy/60">Carregando ficha genealógica…</p>
      </SaasShell>
    );
  if (isError)
    return (
      <SaasShell titulo="Pessoas e linhagens" descricao="Falha ao carregar a ficha." visualKit="pantone">
        <p className="flex flex-wrap items-center gap-3 text-sm text-terracotta">
          Não foi possível carregar a ficha genealógica deste caso.
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      </SaasShell>
    );
  // Consulta concluída sem erro e sem payload é falha de carga, não base vazia.
  if (!data)
    return (
      <SaasShell titulo="Pessoas e linhagens" descricao="Falha ao carregar a ficha." visualKit="pantone">
        <div role="alert" className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">
            Não foi possível carregar a ficha genealógica deste caso.
          </p>
          <p className="text-navy/80">
            A consulta terminou sem retornar resultado nem erro. Isso é uma falha de carga: não
            significa que o caso esteja sem pessoas cadastradas.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-md border border-navy/20 px-2 py-1 text-xs font-medium text-navy hover:bg-navy/5"
          >
            Tentar novamente
          </button>
        </div>
      </SaasShell>
    );

  return (
    <SaasShell
      titulo="Pessoas e linhagens"
      descricao="Origem canônica interna de pessoas, relações, variantes, eventos e linhagens."
      visualKit="pantone"
    >
    <div className="space-y-6">
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
        {pendenciaFicha ? (
          <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada: {pendenciaFicha} Os campos seguem editáveis por decisão sua e cada
            gravação fica auditada.
          </p>
        ) : null}
        {!pesquisaId ? (
          <p className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
            Este caso ainda não possui registro de pesquisa. Crie a pesquisa do caso no módulo Pesquisa Genealógica
            antes de cadastrar pessoas.
          </p>
        ) : null}
      </header>

      <section aria-label="Resumo de pessoas e famílias" className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Pessoas ativas" value={perfis.filter((p) => !p.archived_at).length} detail="Perfis do caso" />
          <KpiCard label="Relações" value={relacoes.filter((r) => !r.archived_at).length} detail="Vínculos registrados" />
          <KpiCard label="Eventos" value={eventos.filter((e) => !e.archived_at).length} detail="Linha do tempo" />
          <KpiCard label="Lacunas" value={lacunas.length} detail="Próximas pesquisas" tone={lacunas.length ? "attention" : "success"} />
        </div>
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <KitCard
            eyebrow="Pessoas & Famílias"
            title="Núcleo do caso"
            action={<KitBadge tone={pesquisaId ? "success" : "attention"}>{pesquisaId ? "Pesquisa vinculada" : "Pesquisa pendente"}</KitBadge>}
          >
            {perfis.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {perfis.filter((p) => !p.archived_at).slice(0, 6).map((p) => (
                  <PersonNode
                    key={p.id}
                    person={{
                      id: p.id,
                      name: p.nome_completo,
                      role: rotuloDe(STATUS_VERIFICACAO, p.status_verificacao),
                      place: p.nascimento_localidade ?? undefined,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-navy/60">Nenhuma pessoa cadastrada neste caso.</p>
            )}
          </KitCard>
          {/*
            Casca V4 (18/10/2026): a antiga "Miniárvore" punha os 3 primeiros
            perfis em pirâmide — parentesco por posição. Aqui só aparecem as
            relações gravadas (person_from_id → person_to_id, relation_type).
          */}
          <KitCard eyebrow="Registradas" title="Relações entre pessoas">
            {(() => {
              const ativas = relacoes.filter((r) => !r.archived_at);
              const nomeDe = (id: string) => perfis.find((p) => p.id === id)?.nome_completo ?? "Pessoa não encontrada";
              return ativas.length ? (
                <div data-linhagens-relacoes-registradas>
                  {ativas.slice(0, 6).map((r) => (
                    <LinhaV4
                      key={r.id}
                      rotulo={`${nomeDe(r.person_from_id)} → ${nomeDe(r.person_to_id)}`}
                      valor={rotuloDe(TIPOS_RELACAO, r.relation_type)}
                    />
                  ))}
                  {ativas.length > 6 ? (
                    <p className="mt-2 text-[11px] text-navy/55">+{ativas.length - 6} na aba Relações.</p>
                  ) : null}
                </div>
              ) : (
                <EstadoVazio mensagem="Nenhuma relação registrada entre as pessoas deste caso. A árvore só nasce de vínculo gravado." />
              );
            })()}
          </KitCard>
        </div>
      </section>

        {pendenciaVinculo || !podeEscrever ? (
          <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada:{" "}
            {pendenciaVinculo ??
              "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
          </p>
        ) : null}

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              if (a.id === aba) return;
              if (perfisSujos) {
                setAbaPendente(a.id);
                return;
              }
              setAba(a.id);
            }}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
              aba === a.id ? "bg-navy text-cream" : "bg-navy/10 text-navy/70"
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </nav>
      {abaPendente ? (
        <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          Há alterações não salvas no Perfil 360°.
          <button
            type="button"
            className="rounded-md border border-terracotta/40 px-2 py-1"
            onClick={() => {
              setPerfisSujos(false);
              setAba(abaPendente);
              setAbaPendente(null);
            }}
          >
            Descartar e abrir {ABAS.find((x) => x.id === abaPendente)?.rotulo}
          </button>
          <button type="button" className="underline" onClick={() => setAbaPendente(null)}>
            Continuar editando
          </button>
        </div>
      ) : null}

      {aba === "perfis" ? (
        <div>
          {decisaoAposPerfil ? (
            <DecisaoAposSalvarPessoa
              nomePessoa="perfil genealógico"
              casos={[{ id: caseId }]}
              onFechou={() => setDecisaoAposPerfil(false)}
            />
          ) : null}
          <AbaPerfis
            perfis={perfis}
            variantes={variantes}
            eventos={eventos}
            relacoes={relacoes}
            evidencias={evidenciaOpcoes}
            fontes={fonteOpcoes}
            clientesDoCaso={clientesDoCaso}
            pendenciaGate={pendenciaPerfis}
            onCriar={(valores) => criarPessoa.mutate({ pesquisaId, valores })}
            onSalvar={(id, valores, aoSalvar) =>
              salvar.mutate({ tabela: "genealogical_person_profiles", id, valores }, { onSuccess: () => aoSalvar?.() })
            }
            onSujo={setPerfisSujos}
            onArquivar={(id, motivo) => arquivar.mutate({ tabela: "genealogical_person_profiles", id, motivo })}
          />
        </div>
      ) : null}

      {aba === "arvore" ? <AbaArvore arvore={arvore} /> : null}

      {aba === "geracao" ? (
        <section className="space-y-4">
          <p className="text-xs text-navy/60">
            G1 é a pessoa âncora da linha (mesma convenção do App e da Árvore publicada); G2 são os pais, G3 os avós,
            e assim por diante. Só sobe por vínculo de filiação já gravado — nenhum parentesco é inferido.
          </p>
          {linhagensComAncora.length === 0 ? (
            <p className="text-sm text-navy/60">
              Nenhuma linha tem pessoa âncora definida ainda. Defina em "Linhagens" para ver a pesquisa por geração.
            </p>
          ) : (
            <>
              {linhagensComAncora.length > 1 ? (
                <Campo label="Linha">
                  <Selecao
                    valor={linhaFoco?.id ?? ""}
                    onChange={setLinhaFocoId}
                    opcoes={linhagensComAncora.map((l) => ({ id: l.id, rotulo: l.nome_da_linha }))}
                  />
                </Campo>
              ) : null}
              {geracoesAgrupadas.map(([geracao, pessoas]) => (
                <div key={geracao} className="rounded-xl border border-navy/10 bg-cream p-4">
                  <h3 className="mb-2 font-serif text-base text-navy">G{geracao}{geracao === 1 ? " · Você" : ""}</h3>
                  <div className="space-y-2">
                    {pessoas.map((p) => {
                      const eventosDaPessoa = eventos.filter((e) => !e.archived_at && e.person_id === p.personId);
                      const modulosDaPessoa = modulosPorPessoa(p.personId);
                      return (
                        <div key={p.personId} className="rounded-lg border border-navy/10 bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-navy">{p.nome}</span>
                            <Selo texto={rotuloDe(STATUS_VERIFICACAO, p.status)} tom={p.status === "confirmado" ? "ok" : "neutro"} />
                          </div>
                          <ul className="mt-2 space-y-1 text-xs text-navy/70">
                            {eventosDaPessoa.map((e) => (
                              <li key={e.id}>
                                • {rotuloDe(TIPOS_EVENTO, e.event_type)} —{" "}
                                {e.evidence_id || e.source_id ? "com suporte" : "sem suporte"}
                              </li>
                            ))}
                            {modulosDaPessoa.map((m, i) => (
                              <li key={i}>
                                • {m.rotuloModulo}: {m.titulo} — {m.comSuporte ? "com suporte" : "sem suporte"}
                              </li>
                            ))}
                            {eventosDaPessoa.length === 0 && modulosDaPessoa.length === 0 ? (
                              <li>Nenhum evento ou módulo histórico registrado ainda.</li>
                            ) : null}
                          </ul>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs">
                            <button
                              type="button"
                              className="font-medium text-navy underline decoration-gold underline-offset-4"
                              onClick={() => {
                                setPersonFoco(p.personId);
                                setAba("eventos");
                              }}
                            >
                              Registrar evento desta pessoa →
                            </button>
                            <button
                              type="button"
                              className="font-medium text-navy underline decoration-gold underline-offset-4"
                              onClick={() => {
                                setPersonFoco(p.personId);
                                setAba("modulos");
                              }}
                            >
                              Registrar módulo histórico desta pessoa →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      ) : null}

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
          onSalvar={(id, valores) => salvar.mutate({ tabela: "name_variants", id, valores })}
        />
      ) : null}

      {aba === "eventos" ? (
        <AbaEventos
          eventos={eventos}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "genealogical_events", id, valores })}
          personFocoInicial={personFoco}
        />
      ) : null}

      {aba === "linhagens" ? (
        <AbaLinhagens
          caseId={caseId}
          linhagens={linhagens}
          pessoas={pessoasOpcoes}
          trilhas={trilhaOpcoes}
          nucleos={nucleoOpcoes}
          onSalvar={(id, valores) => salvar.mutate({ tabela: "lineage_paths", id, valores })}
        />
      ) : null}

      {aba === "modulos" ? (
        <AbaModulos
          modulos={(data?.modulos ?? {}) as unknown as Record<string, RegistroModulo[]>}
          pessoas={pessoasOpcoes}
          evidencias={evidenciaOpcoes}
          fontes={fonteOpcoes}
          onSalvar={(tabela, valores) => salvar.mutate({ tabela, valores })}
          onArquivar={(tabela, id, motivo) => arquivar.mutate({ tabela, id, motivo })}
          personFocoInicial={personFoco}
        />
      ) : null}

      {aba === "projecao" ? (
        <div className="space-y-4">
          <AbaProjecaoCliente perfis={perfis} relacoes={relacoes} eventos={eventos} arvore={arvore} />
          {/* Corte 2a (28/09/2026): a prévia vira publicação real, pessoa a pessoa. */}
          <PublicarArvoreApp caseId={caseId} />
        </div>
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
    </SaasShell>
  );
}

/* ------------------------------------------------------------------ */

function AbaPerfis({
  perfis,
  variantes,
  eventos,
  relacoes,
  evidencias,
  fontes,
  clientesDoCaso,
  pendenciaGate,
  onCriar,
  onSalvar,
  onArquivar,
  onSujo,
}: {
  perfis: Perfil[];
  variantes: Variante[];
  eventos: Evento[];
  relacoes: Relacao[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
  /** Candidatos ao vínculo de pessoa (Corte U2) — só clientes já ligados a este caso. */
  clientesDoCaso: { id: string; nome: string }[];
  /** Pendência de domínio: fica visível e pede motivo, nunca desabilita. */
  pendenciaGate: string | null;
  onCriar: (valores: Record<string, unknown>) => void;
  onSalvar: (id: string, valores: Record<string, unknown>, aoSalvar?: () => void) => void;
  onArquivar: (id: string, motivo: string) => void;
  onSujo?: (sujo: boolean) => void;
}) {
  const [novo, setNovo] = useState({ nome_completo: "", nome_nascimento: "", sexo: "", nascimento_data: "" });
  const [edicao, setEdicao] = useState<Record<string, Partial<Perfil>>>({});
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(Object.keys(edicao).length > 0);
  const temEdicao = Object.values(edicao).some((e) => Object.keys(e).length > 0);
  useEffect(() => {
    onSujo?.(temEdicao);
  }, [temEdicao]); // eslint-disable-line react-hooks/exhaustive-deps

  const criar = () => {
    const erros = validarPerfil(novo as Partial<Perfil>);
    if (erros.length) {
      toast.error(erros.join(" "));
      return;
    }
    onCriar({ ...novo, status_verificacao: "pendente" });
    setNovo({ nome_completo: "", nome_nascimento: "", sexo: "", nascimento_data: "" });
  };

  const nomeInvalido = Boolean(novo.nome_completo.trim()) && !nomeValido(novo.nome_completo);
  // Piso genealógico: ancestral de 1820 é registro normal, não erro.
  const nascimentoInvalido =
    Boolean(novo.nascimento_data) && !dataValida(novo.nascimento_data, { anoMinimo: ANO_MINIMO_GENEALOGICO });

  return (
    <section className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-navy/10 bg-cream p-4 md:grid-cols-4">
        {/*
          Varredura de máscaras (03/10/2026): a Ficha Genealógica aceitava
          "João 123" como nome. O validador existia desde 02/10 e nenhuma aba
          o usava. O servidor recusa (validarPerfil); aqui a pessoa vê o
          motivo antes de tentar salvar.
        */}
        <Campo label="Nome completo">
          <input
            className={nomeInvalido ? `${inputCls} border-terracotta` : inputCls}
            value={novo.nome_completo}
            onChange={(e) => setNovo({ ...novo, nome_completo: e.target.value })}
            aria-invalid={nomeInvalido}
          />
          {nomeInvalido ? (
            <span className="mt-1 block text-[11px] text-terracotta">
              Nome não pode conter números e precisa de ao menos duas letras.
            </span>
          ) : null}
        </Campo>
        <Campo
          label="Nome de nascimento"
          erro={motivoCampoInvalido("Nome de nascimento", "nome", novo.nome_nascimento)}
        >
          <input className={inputCls} value={novo.nome_nascimento} onChange={(e) => setNovo({ ...novo, nome_nascimento: e.target.value })} />
        </Campo>
        <Campo label="Sexo">
          <Selecao valor={novo.sexo} onChange={(v) => setNovo({ ...novo, sexo: v })} opcoes={SEXO} vazio="Não informado" />
        </Campo>
        <Campo label="Nascimento (data)" ajuda="Deixe vazio se não houver documento.">
          <input
            type="date"
            className={nascimentoInvalido ? `${inputCls} border-terracotta` : inputCls}
            value={novo.nascimento_data}
            onChange={(e) => setNovo({ ...novo, nascimento_data: e.target.value })}
            aria-invalid={nascimentoInvalido}
          />
          {nascimentoInvalido ? (
            <span className="mt-1 block text-[11px] text-terracotta">
              Data de nascimento inválida: a partir de {ANO_MINIMO_GENEALOGICO} e nunca no futuro.
            </span>
          ) : null}
        </Campo>
        <div className="md:col-span-4">
          <AcaoOperacional
            rotulo="Criar pessoa e perfil 360°"
            capacidade="corrigir_pessoas_dependentes_representacao"
            pendenciaGate={pendenciaGate}
            efeito="Cria a pessoa e o perfil genealógico 360° deste caso."
            className={btnCls}
            onConfirmar={criar}
          />
        </div>
      </div>

      {perfis.filter((p) => !p.archived_at).map((p) => {
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
            nascimento_precisao: e.nascimento_precisao,
            nascimento_localidade: e.nascimento_localidade,
            morte_data: e.morte_data,
            morte_data_aproximada: e.morte_data_aproximada,
            morte_precisao: e.morte_precisao,
            morte_localidade: e.morte_localidade,
            causa_morte: e.causa_morte,
            sepultamento_localidade: e.sepultamento_localidade,
            status_verificacao: e.status_verificacao,
            evidence_id: e.evidence_id,
            source_id: e.source_id,
            /*
             * 09/10/2026 — bug medido e reportado pela Proprietária: "não
             * consigo mudar a visibilidade de nenhum parente da Ana para
             * aprovada; salva e não persiste". O seletor existia e gravava
             * no rascunho, mas `client_visibility` NÃO estava neste payload
             * — os outros campos salvavam, o toast dizia "salvo", e ao
             * recarregar a visibilidade voltava para "interna". Como
             * `client_visibility` é o ÚNICO gate da Árvore do App
             * (visibilidade-arvore.ts), publicar era impossível.
             */
            client_visibility: e.client_visibility,
            internal_notes: e.internal_notes,
            client_id: e.client_id,
          }, () =>
            // Salvo e relido: a edição local deste perfil sai; o valor exibido
            // passa a ser o persistido. Em erro, a edição fica para corrigir.
            setEdicao((a) => {
              const { [p.id]: _salvo, ...resto } = a;
              return resto;
            }),
          );
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
              <Campo label="Nome completo" erro={motivoCampoInvalido("Nome completo", "nome", String(e.nome_completo ?? ""))}>
                <input className={inputCls} value={e.nome_completo ?? ""} onChange={(x) => set("nome_completo", x.target.value)} />
              </Campo>
              <Campo label="Nome de nascimento" erro={motivoCampoInvalido("Nome de nascimento", "nome", String(e.nome_nascimento ?? ""))}>
                <input className={inputCls} value={e.nome_nascimento ?? ""} onChange={(x) => set("nome_nascimento", x.target.value)} />
              </Campo>
              <Campo label="Sexo">
                <Selecao valor={e.sexo ?? ""} onChange={(v) => set("sexo", v)} opcoes={SEXO} vazio="Não informado" />
              </Campo>
              <Campo label="Nascimento (data)" erro={motivoCampoInvalido("Nascimento", "data_historica", String(e.nascimento_data ?? ""))}>
                <input type="date" className={inputCls} value={e.nascimento_data ?? ""} onChange={(x) => set("nascimento_data", x.target.value)} />
              </Campo>
              <Campo label="Nascimento (aproximado)" ajuda="Ex.: 'entre 1890 e 1893'.">
                <input className={inputCls} value={e.nascimento_data_aproximada ?? ""} onChange={(x) => set("nascimento_data_aproximada", x.target.value)} />
              </Campo>
              <Campo label="Precisão do nascimento"><Selecao valor={e.nascimento_precisao ?? "desconhecida"} onChange={(v) => set("nascimento_precisao", v)} opcoes={PRECISAO_DATA} /></Campo>
              <Campo label="Fonte do nascimento"><Selecao valor={e.source_id ?? ""} onChange={(v) => set("source_id", v || null)} opcoes={fontes} vazio="Sem fonte vinculada" /></Campo>
              <Campo label="Nascimento (localidade)">
                <input className={inputCls} value={e.nascimento_localidade ?? ""} onChange={(x) => set("nascimento_localidade", x.target.value)} />
              </Campo>
              <Campo label="Morte (data)" erro={motivoCampoInvalido("Morte", "data_historica", String(e.morte_data ?? ""))}>
                <input type="date" className={inputCls} value={e.morte_data ?? ""} onChange={(x) => set("morte_data", x.target.value)} />
              </Campo>
              <Campo label="Morte (aproximada)">
                <input className={inputCls} value={e.morte_data_aproximada ?? ""} onChange={(x) => set("morte_data_aproximada", x.target.value)} />
              </Campo>
              <Campo label="Morte (localidade)">
                <input className={inputCls} value={e.morte_localidade ?? ""} onChange={(x) => set("morte_localidade", x.target.value)} />
              </Campo>
              <Campo label="Causa da morte">
                <input className={inputCls} value={e.causa_morte ?? ""} onChange={(x) => set("causa_morte", x.target.value)} />
              </Campo>
              <Campo label="Sepultamento (localidade)">
                <input className={inputCls} value={e.sepultamento_localidade ?? ""} onChange={(x) => set("sepultamento_localidade", x.target.value)} />
              </Campo>
              <Campo
                label="Status de verificação"
                ajuda="Estado da identidade (confirmado, provável, hipótese…). Não é o que libera a Árvore do App."
              >
                <Selecao valor={e.status_verificacao ?? "pendente"} onChange={(v) => set("status_verificacao", v)} opcoes={STATUS_VERIFICACAO} />
              </Campo>
              {/*
                04/10/2026 — este seletor faltava, e era o bloqueio real relatado
                pela Proprietária: `client_visibility` já era gravável
                (CAMPOS_PERFIL em pessoas-linhagens.functions.ts) e é o ÚNICO
                gate da Árvore do App, mas nenhuma tela o oferecia — todo perfil
                ficava "interna" e a publicação era impossível. Ver
                `visibilidade-arvore.ts` para os três eixos e qual manda.
              */}
              <Campo label="Visibilidade ao cliente" ajuda={RESUMO_GATE_ARVORE}>
                <Selecao
                  valor={e.client_visibility ?? "interna"}
                  onChange={(v) => set("client_visibility", v)}
                  opcoes={VISIBILIDADE_CLIENTE}
                />
              </Campo>
              <Campo label="Evidência de suporte" ajuda="Obrigatória para status confirmado.">
                <Selecao valor={e.evidence_id ?? ""} onChange={(v) => set("evidence_id", v)} opcoes={evidencias} vazio="Sem evidência vinculada" />
              </Campo>
              <Campo
                label="Vincular a pessoa já cadastrada (opcional)"
                ajuda="Nunca automático — só grava se você escolher explicitamente. Lista só os clientes já ligados a este caso."
              >
                <Selecao
                  valor={e.client_id ?? ""}
                  onChange={(v) => set("client_id", v || null)}
                  opcoes={clientesDoCaso.map((c) => ({ id: c.id, rotulo: c.nome }))}
                  vazio="Sem vínculo com pessoa cadastrada"
                />
              </Campo>
              <div className="md:col-span-2">
                <Campo label="Notas internas" ajuda="Nunca exibidas ao cliente.">
                  <textarea className={inputCls} rows={2} value={e.internal_notes ?? ""} onChange={(x) => set("internal_notes", x.target.value)} />
                </Campo>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className={btnCls} onClick={salvar}>
                Salvar perfil
              </button>
              <AcaoOperacional
                rotulo="Arquivar"
                className="rounded-lg border border-terracotta/40 px-3 py-2 text-xs font-semibold text-terracotta"
                acaoExterna="arquivar_pessoa_perfil_360"
                efeito="Arquiva o perfil sem exclusão; o histórico é preservado."
                onConfirmar={(motivo) => onArquivar(p.id, motivo)}
              />
            </div>
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
  onSalvar,
  onArquivar,
}: {
  relacoes: Relacao[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
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
          <AcaoOperacional
            rotulo="Arquivar"
            className="ml-auto text-xs text-terracotta underline"
            acaoExterna="arquivar_relacao_genealogica"
            efeito="Arquiva a relação sem exclusão; o histórico é preservado."
            onConfirmar={(motivo) => onArquivar(r.id, motivo)}
          />
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
  onSalvar,
}: {
  variantes: Variante[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
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
  onSalvar,
  personFocoInicial,
}: {
  eventos: Evento[];
  pessoas: { id: string; rotulo: string }[];
  evidencias: { id: string; rotulo: string }[];
  fontes: { id: string; rotulo: string }[];
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
  /** Corte "Pesquisa G1...Gn" (02/10/2026): pré-seleciona a pessoa quando o
   *  CTA da aba "Por geração" traz o staff direto para cá. */
  personFocoInicial?: string | null;
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
    impact_type: "",
    data_precisao: "desconhecida",
    client_visibility: "interna",
  };
  const [novo, setNovo] = useState(vazio);
  useEffect(() => {
    if (personFocoInicial) setNovo((n) => ({ ...n, person_id: personFocoInicial }));
  }, [personFocoInicial]);
  const nome = (id: string) => pessoas.find((p) => p.id === id)?.rotulo ?? "—";

  return (
    <section className="space-y-4">
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
        <Campo label="Tipo de impacto">
          <Selecao valor={novo.impact_type} onChange={(v) => setNovo({ ...novo, impact_type: v })} opcoes={IMPACTO_EVENTO} vazio="Não classificado" />
        </Campo>
        <Campo label="Precisão da data">
          <Selecao valor={novo.data_precisao} onChange={(v) => setNovo({ ...novo, data_precisao: v })} opcoes={PRECISAO_DATA} />
        </Campo>
        <Campo label="Visibilidade ao cliente">
          <Selecao valor={novo.client_visibility} onChange={(v) => setNovo({ ...novo, client_visibility: v })} opcoes={VISIBILIDADE_CLIENTE} />
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

      {eventos.filter((e) => !e.archived_at).map((e) => (
        <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-cream p-3">
          <span className="text-sm text-navy">{nome(e.person_id)}</span>
          <Selo texto={rotuloDe(TIPOS_EVENTO, e.event_type)} tom="neutro" />
          <span className="text-xs text-navy/60">{e.start_date ?? e.approximate_date ?? "Data não informada"}</span>
          <Selo texto={rotuloDe(STATUS_VALIDACAO_EVENTO, e.validation_status)} tom={e.validation_status === "confirmado" ? "ok" : "neutro"} />
          {e.client_visibility ? <Selo texto={rotuloDe(VISIBILIDADE_CLIENTE, e.client_visibility)} tom="neutro" /> : null}
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
  onSalvar,
}: {
  caseId: string;
  linhagens: Linhagem[];
  pessoas: { id: string; rotulo: string }[];
  trilhas: { id: string; rotulo: string }[];
  nucleos: { id: string; rotulo: string }[];
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
    aderencia_percentual: "",
  };
  const [nova, setNova] = useState(vazia);

  return (
    <section className="space-y-4">
      <p className="text-xs text-navy/60">
        Linha dupla é configuração de análise: o mesmo caso aceita várias linhagens, sem duplicar pessoa nem criar caso novo.
      </p>
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
        {/*
          Heatmap por ramo (02/10/2026): aderência operacional/documental
          DESTE ramo, que alimenta heatmap_pct_1..3 da Ficha Master. Inteiro
          0–100, sem o símbolo "%" — o servidor recusa o resto
          (validarAderenciaPercentual + CHECK do banco).
        */}
        <Campo label="Aderência do ramo (%)">
          <input
            className={inputCls}
            type="number"
            min={0}
            max={100}
            step={1}
            value={nova.aderencia_percentual}
            onChange={(e) => setNova({ ...nova, aderencia_percentual: e.target.value })}
            placeholder="0 a 100"
          />
        </Campo>
        <div className="md:col-span-3">
          <button
            type="button"
            className={btnCls}
            onClick={() => {
              const erros = validarLinhagem(
                { ...nova, aderencia_percentual: undefined, case_id: caseId } as unknown as Partial<Linhagem>,
                linhagens,
              );
              if (erros.length) return toast.error(erros.join(" "));
              // Campo vazio não vira 0: o servidor normaliza para null.
              onSalvar(undefined, {
                ...nova,
                aderencia_percentual: nova.aderencia_percentual.trim() === "" ? null : nova.aderencia_percentual,
              });
              setNova(vazia);
            }}
          >
            Registrar linhagem
          </button>
        </div>
      </div>

      {linhagens.filter((l) => !l.archived_at).map((l) => (
        <div key={l.id} className="space-y-1 rounded-xl border border-navy/10 bg-cream p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-navy">{l.nome_da_linha}</span>
            <Selo texto={rotuloDe(TIPOS_LINHA, l.tipo_da_linha)} tom="neutro" />
            <Selo texto={rotuloDe(STATUS_LINHA, l.status)} tom={l.status === "com_suporte" ? "ok" : "neutro"} />
            <Selo
              texto={
                typeof l.aderencia_percentual === "number"
                  ? `Aderência ${l.aderencia_percentual}%`
                  : "Aderência não calculada"
              }
              tom={typeof l.aderencia_percentual === "number" ? "ok" : "neutro"}
            />
          </div>
          <p className="text-xs text-navy/60">
            {l.objetivo ?? "Objetivo não informado"} · próximo marco: {l.proximo_marco ?? "não registrado"} ·
            responsável: {l.responsavel ?? "não atribuído"}
          </p>
          {/*
            Heatmap por ramo (03/10/2026): o ramo já existente precisava de um
            lugar para receber o percentual sem recriar a linhagem — é o caso
            real de hoje (um ramo gravado, aderência nula). Edição pontual, só
            deste campo.
          */}
          <AderenciaDoRamo linhagem={l} onSalvar={onSalvar} />
        </div>
      ))}
      {linhagens.length === 0 ? <p className="text-sm text-navy/60">Nenhuma linhagem registrada.</p> : null}
    </section>
  );
}

/**
 * Aderência do ramo (heatmap por país) — edição pontual de um campo só.
 *
 * Alimenta `heatmap_pais_1..3` / `heatmap_pct_1..3` da Ficha Master: a Ficha
 * ordena os ramos do caso por este percentual e pega os três primeiros. É
 * aderência operacional/documental do ramo, nunca veredito jurídico, direito
 * ou elegibilidade definitiva — o rótulo diz isso na tela, não só no código.
 */
function AderenciaDoRamo({
  linhagem,
  onSalvar,
}: {
  linhagem: Linhagem;
  onSalvar: (id: string | undefined, valores: Record<string, unknown>) => void;
}) {
  const gravado = typeof linhagem.aderencia_percentual === "number" ? String(linhagem.aderencia_percentual) : "";
  const [valor, setValor] = useState(gravado);
  const mudou = valor.trim() !== gravado.trim();
  const numero = Number(valor);
  const invalido =
    valor.trim() !== "" && (!Number.isInteger(numero) || numero < 0 || numero > 100);

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <Campo label="Aderência do ramo (%)">
        <input
          className={inputCls}
          type="number"
          min={0}
          max={100}
          step={1}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0 a 100"
          aria-label={`Aderência do ramo ${linhagem.nome_da_linha}`}
        />
      </Campo>
      <button
        type="button"
        className={btnCls}
        disabled={!mudou || invalido}
        onClick={() => onSalvar(linhagem.id, { aderencia_percentual: valor.trim() === "" ? null : valor })}
      >
        Salvar aderência
      </button>
      <p className="text-xs text-navy/55">
        {invalido
          ? "Use um inteiro de 0 a 100, sem o símbolo de porcentagem."
          : "Aderência operacional e documental deste ramo. Não é parecer jurídico, direito reconhecido nem elegibilidade definitiva."}
      </p>
    </div>
  );
}
