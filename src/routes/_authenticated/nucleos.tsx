import { createFileRoute, Link } from "@tanstack/react-router";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { SaasShell, useSaas } from "@/components/saas/shell";
import { useAutoridade } from "@/components/saas/autoridade";
import {
  NUCLEO_AMBIENTES,
  NUCLEO_DOSSIE_STATUS,
  NUCLEO_NIVEIS_ACESSO,
  NUCLEO_PAPEIS,
  PAPEIS_GRAVAVEIS_MEMBRO,
  criarNucleo,
  encaminharFilaDrive,
  listarClientesParaVinculo,
  listarNucleos,
  salvarDossieNucleo,
  salvarMembroNucleo,
  adicionarMembroNucleo,
} from "@/lib/nucleos-desk.functions";
import { STATUS_FILA_DRIVE } from "@/lib/drive-provisioning";
import { salvarTarefa } from "@/lib/ops.functions";

export const Route = createFileRoute("/_authenticated/nucleos")({
  head: () => ({
    meta: [
      { title: "Núcleos familiares — Clube Ancestral" },
      {
        name: "description",
        content: "Núcleos familiares, requerentes vinculados e situação do dossiê-mãe autorizado.",
      },
      { property: "og:title", content: "Núcleos familiares — Clube Ancestral" },
      { property: "og:description", content: "Dossiê-mãe único por núcleo e requerentes individuais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NucleosPage,
});

const rotulo = (v: string) =>
  v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const opcoes = (lista: readonly string[]) => lista.map((v) => ({ valor: v, rotulo: rotulo(v) }));

const CORES_STATUS: Record<string, string> = {
  nao_iniciado: "bg-navy/10 text-navy/70",
  em_preparacao: "bg-gold/20 text-navy",
  ativo: "bg-emerald-100 text-emerald-800",
  arquivado: "bg-navy/5 text-navy/50",
};

type Membro = {
  id: string;
  nome: string;
  papel: string;
  vinculo: string | null;
  processo: string | null;
  cliente_id: string | null;
};
type Nucleo = {
  id: string;
  nome: string;
  contratante_nome: string | null;
  dossie_mae: string | null;
  ambiente: string | null;
  nivel_acesso: string | null;
  link_interno: string | null;
  responsavel_nome: string | null;
  dossie_status: string | null;
  caso: {
    id: string;
    codigo: string | null;
    titulo: string | null;
    contrato_assinado: boolean | null;
    pagamento_confirmado: boolean | null;
    ativado_em: string | null;
  } | null;
  filaDrive: { id: string; status: string; stage_trigger: string; observacao_interna: string | null } | null;
  membros: Membro[];
  coberturaGeracoes: { rotulo: string; valor: number }[];
};

type Rascunho = {
  dossie_mae: string;
  ambiente: string;
  nivel_acesso: string;
  link_interno: string;
  responsavel_nome: string;
  dossie_status: string;
};

function NucleosPage() {
  const autoridade = useAutoridade();
  // Autoridade operacional: vínculo somente leitura vira pendência declarada,
  // nunca botão desabilitado. Só falta de papel ou de organização bloqueia.
  const podeEscrever = !autoridade.bloqueado({ capacidade: "corrigir_pessoas_dependentes_representacao" });
  const { podeEscrever: podeEscreverVinculo } = useSaas();
  // Autoridade operacional: vínculo somente leitura não trava campo nem botão.
  // Vira pendência declarada e a decisão passa por <AcaoOperacional>.
  const pendenciaVinculo = podeEscreverVinculo
    ? null
    : "Seu vínculo de equipe está marcado como somente leitura — a gravação segue disponível por decisão sua e é revalidada no servidor.";
  const carregar = useServerFn(listarNucleos);
  const carregarClientes = useServerFn(listarClientesParaVinculo);
  const criar = useServerFn(criarNucleo);
  const salvar = useServerFn(salvarDossieNucleo);
  const salvarMembro = useServerFn(salvarMembroNucleo);
  const adicionarMembro = useServerFn(adicionarMembroNucleo);
  const [adicionandoEm, setAdicionandoEm] = useState<string | null>(null);
  const [novoMembro, setNovoMembro] = useState({ nome: "", papel: "dependente", vinculo: "", clienteId: "" });
  const [erroNovoMembro, setErroNovoMembro] = useState<string | null>(null);
  const mAdicionarMembro = useMutation({
    mutationFn: (v: { nucleoId: string; nome: string; papel: string; vinculo: string; clienteId: string }) =>
      adicionarMembro({
        data: { nucleoId: v.nucleoId, nome: v.nome, papel: v.papel, vinculo: v.vinculo, clienteId: v.clienteId || null },
      }),
    onSuccess: async () => {
      setAdicionandoEm(null);
      setNovoMembro({ nome: "", papel: "dependente", vinculo: "", clienteId: "" });
      setErroNovoMembro(null);
      // Releitura do servidor: a lista mostra o que foi gravado, não o rascunho.
      await qc.invalidateQueries({ queryKey: ["nucleos-desk"] });
      toast.success("Membro adicionado ao núcleo e registrado no histórico.");
    },
    onError: (e: Error) => setErroNovoMembro(e.message),
  });
  const encaminhar = useServerFn(encaminharFilaDrive);
  const criarTarefa = useServerFn(salvarTarefa);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregar(), retry: false });
  const qClientes = useQuery({ queryKey: ["clientes-vinculo"], queryFn: () => carregarClientes(), retry: false });
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [membroEditando, setMembroEditando] = useState<string | null>(null);
  const [rascunhoMembro, setRascunhoMembro] = useState<{
    nome: string;
    vinculo: string;
    processo: string;
    clienteId: string;
  } | null>(null);
  const [erroMembro, setErroMembro] = useState<string | null>(null);
  const [novoNucleoAberto, setNovoNucleoAberto] = useState(false);
  const [novoNucleoNome, setNovoNucleoNome] = useState("");
  const [erroNovoNucleo, setErroNovoNucleo] = useState<string | null>(null);

  const mCriarNucleo = useMutation({
    mutationFn: (nome: string) => criar({ data: { nome } }),
    onSuccess: async (criado) => {
      setNovoNucleoAberto(false);
      setNovoNucleoNome("");
      setErroNovoNucleo(null);
      await qc.invalidateQueries({ queryKey: ["nucleos-desk"] });
      setSelecionado((criado as { id: string }).id);
      toast.success("Núcleo criado.");
    },
    onError: (e: Error) => setErroNovoNucleo(e.message),
  });
  const [sugestaoAcao, setSugestaoAcao] = useState<{ membroId: string; nome: string; caseId: string | null } | null>(
    null,
  );

  const nucleos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = q.data as Nucleo[] | undefined;
    // `undefined` preservado de propósito: consulta não resolvida não é "nenhum núcleo".
    if (!lista) return undefined;
    return lista.filter((n) => {
      if (filtroStatus && (n.dossie_status ?? "nao_iniciado") !== filtroStatus) return false;
      if (!termo) return true;
      const alvo = [n.nome, n.contratante_nome, n.dossie_mae, n.caso?.codigo, n.caso?.titulo]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return alvo.includes(termo);
    });
  }, [q.data, busca, filtroStatus]);

  const casosDuplicados = useMemo(() => {
    const contagem = new Map<string, number>();
    const lista = q.data as Nucleo[] | undefined;
    if (!lista) return new Set<string>();
    for (const n of lista) {
      if (n.caso) contagem.set(n.caso.id, (contagem.get(n.caso.id) ?? 0) + 1);
    }
    return new Set([...contagem.entries()].filter(([, c]) => c > 1).map(([id]) => id));
  }, [q.data]);

  const atual = useMemo(
    () => (q.data as Nucleo[] | undefined)?.find((n) => n.id === selecionado) ?? null,
    [q.data, selecionado],
  );


  const abrir = (n: Nucleo) => {
    setSelecionado(n.id);
    setErro(null);
    setOk(null);
    setRascunho({
      dossie_mae: n.dossie_mae ?? "",
      ambiente: n.ambiente ?? "",
      nivel_acesso: n.nivel_acesso ?? "",
      link_interno: n.link_interno ?? "",
      responsavel_nome: n.responsavel_nome ?? "",
      dossie_status: n.dossie_status ?? "nao_iniciado",
    });
  };

  const m = useMutation({
    mutationFn: (data: Rascunho & { nucleoId: string }) => salvar({ data }),
    onSuccess: async () => {
      setErro(null);
      setOk("Dossiê-mãe atualizado.");
      await qc.invalidateQueries({ queryKey: ["nucleos-desk"] });
    },
    onError: (e: Error) => {
      setOk(null);
      setErro(e.message);
    },
  });

  const mMembro = useMutation({
    mutationFn: (data: {
      membroId: string;
      nome: string;
      vinculo: string;
      processo: string;
      clienteId: string;
      caseId: string | null;
    }) =>
      salvarMembro({
        data: {
          membroId: data.membroId,
          nome: data.nome,
          vinculo: data.vinculo,
          processo: data.processo,
          clienteId: data.clienteId || null,
        },
      }),
    onSuccess: async (_r, variaveis) => {
      setErroMembro(null);
      setMembroEditando(null);
      setRascunhoMembro(null);
      setSugestaoAcao({ membroId: variaveis.membroId, nome: variaveis.nome, caseId: variaveis.caseId });
      await qc.invalidateQueries({ queryKey: ["nucleos-desk"] });
    },
    onError: (e: Error) => setErroMembro(e.message),
  });

  const [erroFila, setErroFila] = useState<Record<string, string>>({});

  const mFilaDrive = useMutation({
    mutationFn: (data: { nucleoId: string }) => encaminhar({ data }),
    onSuccess: async (_r, variaveis) => {
      setErroFila((prev) => {
        const { [variaveis.nucleoId]: _remover, ...resto } = prev;
        return resto;
      });
      await qc.invalidateQueries({ queryKey: ["nucleos-desk"] });
    },
    onError: (e: Error, variaveis) => setErroFila((prev) => ({ ...prev, [variaveis.nucleoId]: e.message })),
  });

  const mTarefaAcao = useMutation({
    mutationFn: (data: { caseId: string; titulo: string }) =>
      criarTarefa({ data: { valores: { caso_id: data.caseId, titulo: data.titulo, status: "pendente" } } }),
    onSuccess: () => {
      setSugestaoAcao(null);
      toast.success("Tarefa de acompanhamento criada.");
    },
    onError: (e: Error) => toast.error(`O dado foi salvo, mas a tarefa não foi criada: ${e.message}`),
  });

  return (
    <SaasShell
      titulo="Núcleos familiares"
      descricao="Um dossiê-mãe por núcleo. Requerentes têm registro individual vinculado."
    >
      <div className="space-y-5">
        <Secao titulo="Buscar núcleos" descricao="Filtre por nome, contratante, dossiê ou caso vinculado.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Texto label="Busca" valor={busca} onChange={setBusca} />
            <Selecao
              label="Situação do dossiê"
              valor={filtroStatus}
              opcoes={opcoes(NUCLEO_DOSSIE_STATUS)}
              onChange={setFiltroStatus}
            />
          </div>
          <div className="mt-3">
            {novoNucleoAberto ? (
              <div className="flex flex-wrap items-end gap-2 rounded-lg border border-navy/15 bg-navy/5 p-3">
                <div className="min-w-[220px] flex-1">
                  <Texto label="Nome do novo núcleo" valor={novoNucleoNome} onChange={setNovoNucleoNome} />
                </div>
                <button
                  type="button"
                  disabled={mCriarNucleo.isPending || !novoNucleoNome.trim()}
                  onClick={() => mCriarNucleo.mutate(novoNucleoNome.trim())}
                  className="rounded-lg bg-navy px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {mCriarNucleo.isPending ? "Criando…" : "Criar núcleo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNovoNucleoAberto(false);
                    setErroNovoNucleo(null);
                  }}
                  className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy"
                >
                  Cancelar
                </button>
                {erroNovoNucleo ? <p className="w-full text-xs text-terracotta">{erroNovoNucleo}</p> : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setNovoNucleoAberto(true)}
                className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
              >
                + Novo núcleo
              </button>
            )}
          </div>
        </Secao>

        {pendenciaVinculo || !podeEscrever ? (
          <p className="rounded-lg border border-navy/15 bg-navy/5 px-3 py-2 text-xs text-navy/70">
            Pendência registrada:{" "}
            {pendenciaVinculo ??
              "Contexto de acesso ainda não confirmado — a gravação é revalidada no servidor."}
          </p>
        ) : null}

        <EstadoDados<Nucleo>
          carregando={q.isLoading}
          erro={q.error}
          dados={nucleos}
          aoTentarNovamente={() => void q.refetch()}
          recurso="os núcleos familiares"
          vazio="Nenhum núcleo familiar encontrado com os filtros atuais. A consulta foi concluída com sucesso."
        >
          {(lista) => (
        <div className="grid gap-4 lg:grid-cols-2">
          {lista.map((n: Nucleo) => {
            const status = n.dossie_status ?? "nao_iniciado";
            return (
              <article key={n.id} className="rounded-xl border border-navy/10 bg-cream/40 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg text-navy">{n.nome}</h3>
                    <p className="text-xs text-navy/55">
                      {n.contratante_nome ? `Contratante: ${n.contratante_nome}` : "Contratante não definido"}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] ${CORES_STATUS[status] ?? ""}`}>
                    {rotulo(status)}
                  </span>
                </div>

                {n.caso ? (
                  <p className="mt-2 text-xs text-navy/60">
                    Caso vinculado:{" "}
                    <Link
                      to="/casos/$caseId"
                      params={{ caseId: n.caso.id }}
                      className="text-navy underline underline-offset-2"
                    >
                      {n.caso.codigo ?? n.caso.titulo}
                    </Link>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-navy/45">Sem caso operacional vinculado.</p>
                )}

                {n.caso && casosDuplicados.has(n.caso.id) ? (
                  <p className="mt-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-[11px] text-navy">
                    Duplicidade: outro núcleo aponta para o mesmo caso. Mantenha um único núcleo e um único dossiê-mãe
                    por caso; arquive o excedente em vez de mesclar.
                  </p>
                ) : null}


                <div className="mt-3 space-y-1 text-xs text-navy/70">
                  <p>Dossiê-mãe: {n.dossie_mae || "—"}</p>
                  <p>
                    Ambiente: {n.ambiente ? rotulo(n.ambiente) : "—"} · Acesso:{" "}
                    {n.nivel_acesso ? rotulo(n.nivel_acesso) : "—"}
                  </p>
                  <p>Responsável: {n.responsavel_nome || "—"}</p>
                </div>

                {/*
                 * 04/09/2026 — CA-P0-EXEC-001, critério C: "Dossiê-mãe" acima é
                 * só um rótulo de texto livre em nucleos_familiares — não tinha
                 * nenhum vínculo com a fila real de provisionamento
                 * (drive_provisioning_queue / drive-provisioning.ts). Este bloco
                 * mostra o estado real da fila e oferece um único CTA seguro:
                 * encaminhar para revisão. Nunca cria pasta, nunca aprova/executa
                 * a partir daqui — isso exige decisão humana registrada à parte.
                 */}
                <div className="mt-3 rounded-lg border border-navy/10 bg-navy/[0.03] px-3 py-2 text-xs text-navy/70">
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Fila de provisionamento do Drive</p>
                  {n.filaDrive ? (
                    <p className="mt-1">
                      Estado atual:{" "}
                      <span className="font-medium text-navy">
                        {STATUS_FILA_DRIVE.find((s) => s.valor === n.filaDrive?.status)?.rotulo ??
                          n.filaDrive.status}
                      </span>
                      {n.filaDrive.observacao_interna ? ` — ${n.filaDrive.observacao_interna}` : ""}
                    </p>
                  ) : (
                    <p className="mt-1">Nenhum item na fila ainda. Nada é criado no Drive automaticamente.</p>
                  )}
                  {/*
                   * A ausência de caso vinculado e o vínculo somente leitura
                   * viram pendência declarada, não trava do controle. O gate
                   * real continua sendo avaliado no servidor.
                   */}
                  <div className="mt-2">
                    <AcaoOperacional
                      rotulo="Encaminhar para revisão"
                      capacidade="editar_rascunho"
                      pendenciaGate={
                        [
                          n.caso
                            ? null
                            : "Núcleo sem caso operacional vinculado — os gates da fila do Drive não podem ser avaliados.",
                          pendenciaVinculo,
                        ]
                          .filter(Boolean)
                          .join("; ") || null
                      }
                      efeito="Coloca este núcleo na fila de revisão de provisionamento do Drive. Nenhuma pasta é criada e nada é aprovado aqui."
                      size="sm"
                      variant="outline"
                      onConfirmar={async () => {
                        await mFilaDrive.mutateAsync({ nucleoId: n.id });
                      }}
                    />
                  </div>
                  {erroFila[n.id] ? <p className="mt-1.5 text-terracotta">{erroFila[n.id]}</p> : null}
                </div>

                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Requerentes e vínculos</p>
                  {n.membros.length === 0 ? (
                    <p className="text-xs text-navy/50">Nenhum requerente cadastrado.</p>
                  ) : (
                    <ul className="mt-1 space-y-2">
                      {n.membros.map((m2: Membro) => (
                        <li key={m2.id} className="rounded-lg border border-navy/10 px-2 py-1.5 text-xs text-navy/70">
                          {membroEditando === m2.id && rascunhoMembro ? (
                            <div className="space-y-1.5">
                              <Texto
                                label="Nome"
                                valor={rascunhoMembro.nome}
                                onChange={(v) => setRascunhoMembro({ ...rascunhoMembro, nome: v })}
                              />
                              <Texto
                                label="Vínculo"
                                valor={rascunhoMembro.vinculo}
                                onChange={(v) => setRascunhoMembro({ ...rascunhoMembro, vinculo: v })}
                              />
                              <Texto
                                label="Processo"
                                valor={rascunhoMembro.processo}
                                onChange={(v) => setRascunhoMembro({ ...rascunhoMembro, processo: v })}
                              />
                              <EstadoDados
                                carregando={qClientes.isLoading}
                                erro={qClientes.error}
                                dados={qClientes.data}
                                aoTentarNovamente={() => void qClientes.refetch()}
                                recurso="as pessoas cadastradas"
                                vazio="Nenhuma pessoa cadastrada ainda — cadastre em Pessoas para poder vincular este requerente."
                              >
                                {(clientes) => (
                                  <Selecao
                                    label="Vincular a pessoa cadastrada"
                                    ajuda="Liga este requerente ao cadastro de Pessoa Canônica — habilita o link 'Ver perfil' e evita duplicar o cadastro da mesma pessoa."
                                    valor={rascunhoMembro.clienteId}
                                    opcoes={clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                                    onChange={(v) => setRascunhoMembro({ ...rascunhoMembro, clienteId: v })}
                                  />
                                )}
                              </EstadoDados>
                              {erroMembro ? <p className="text-red-700">{erroMembro}</p> : null}
                              <div className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  disabled={mMembro.isPending}
                                  onClick={() =>
                                    mMembro.mutate({ membroId: m2.id, ...rascunhoMembro, caseId: n.caso?.id ?? null })
                                  }
                                  className="rounded-md bg-navy px-2 py-1 text-cream disabled:opacity-50"
                                >
                                  {mMembro.isPending ? "Gravando…" : "Salvar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMembroEditando(null);
                                    setRascunhoMembro(null);
                                    setErroMembro(null);
                                  }}
                                  className="rounded-md border border-navy/15 px-2 py-1"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-medium text-navy">{m2.nome}</span>{" "}
                                <span className="text-navy/55">
                                  ({(NUCLEO_PAPEIS as readonly string[]).includes(m2.papel) ? rotulo(m2.papel) : m2.papel})
                                </span>
                                {m2.vinculo ? <p className="text-navy/55">{m2.vinculo}</p> : null}
                                {m2.processo ? <p className="text-navy/45">{m2.processo}</p> : null}
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                {m2.cliente_id ? (
                                  <Link
                                    to="/pessoas/$clienteId"
                                    params={{ clienteId: m2.cliente_id }}
                                    className="rounded-md border border-gold/50 bg-gold/10 px-2 py-1 text-navy hover:bg-gold/20"
                                  >
                                    Ver perfil
                                  </Link>
                                ) : (
                                  /*
                                   * 04/09/2026 — CA-P0-EXEC-001, critério B: quando não há
                                   * vínculo com a Pessoa Canônica, isso precisa aparecer
                                   * explicitamente (não silêncio) e apontar como resolver —
                                   * "Editar" já abre o seletor de vínculo manual, sem apagar
                                   * nome/vínculo/processo já cadastrados.
                                   */
                                  <span className="text-[11px] text-navy/45">
                                    Sem vínculo com Pessoa Canônica — use "Editar" para vincular
                                  </span>
                                )}
                                {/* Abrir o formulário não grava nada: sempre disponível. */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMembroEditando(m2.id);
                                      setRascunhoMembro({
                                        nome: m2.nome,
                                        vinculo: m2.vinculo ?? "",
                                        processo: m2.processo ?? "",
                                        clienteId: m2.cliente_id ?? "",
                                      });
                                      setErroMembro(null);
                                    }}
                                    className="rounded-md border border-navy/15 px-2 py-1 text-navy hover:border-gold"
                                  >
                                    Editar
                                  </button>
                              </div>
                            </div>
                          )}
                          {sugestaoAcao?.membroId === m2.id ? (
                            <div className="mt-2 rounded-md border border-gold/50 bg-gold/10 px-2 py-1.5">
                              <p className="text-navy">Alteração salva e confirmada no banco.</p>
                              <p className="mt-1 text-navy/70">
                                Deseja criar uma tarefa de acompanhamento para {sugestaoAcao.nome}?
                              </p>
                              <div className="mt-1.5 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={mTarefaAcao.isPending}
                                  title={
                                    sugestaoAcao.caseId
                                      ? undefined
                                      : "Membro sem caso vinculado — sem caso não há onde criar a tarefa."
                                  }
                                  onClick={() =>
                                    sugestaoAcao.caseId &&
                                    mTarefaAcao.mutate({
                                      caseId: sugestaoAcao.caseId,
                                      titulo: `Revisar dado atualizado — ${sugestaoAcao.nome}`,
                                    })
                                  }
                                  className="rounded-md bg-navy px-2 py-1 text-cream disabled:opacity-50"
                                >
                                  {mTarefaAcao.isPending ? "Criando…" : "Criar tarefa"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSugestaoAcao(null)}
                                  className="rounded-md border border-navy/15 px-2 py-1"
                                >
                                  Sem ação necessária
                                </button>
                              </div>
                              {!sugestaoAcao.caseId ? (
                                <p className="mt-1 text-[11px] text-navy/50">
                                  Este núcleo não tem caso vinculado — sem caso, não é possível criar tarefa.
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  {adicionandoEm === n.id ? (
                    <div className="mt-2 space-y-1.5 rounded-lg border border-gold/40 bg-gold/5 p-2 text-xs" data-nucleo-novo-membro>
                      <Texto label="Nome" valor={novoMembro.nome} onChange={(v) => setNovoMembro({ ...novoMembro, nome: v })} />
                      <Selecao
                        label="Papel no núcleo"
                        valor={novoMembro.papel}
                        opcoes={PAPEIS_GRAVAVEIS_MEMBRO.map((p) => ({ valor: p, rotulo: rotulo(p) }))}
                        onChange={(v) => setNovoMembro({ ...novoMembro, papel: v || "dependente" })}
                      />
                      <Texto label="Vínculo (ex.: filho, cônjuge)" valor={novoMembro.vinculo} onChange={(v) => setNovoMembro({ ...novoMembro, vinculo: v })} />
                      <EstadoDados
                        carregando={qClientes.isLoading}
                        erro={qClientes.error}
                        dados={qClientes.data}
                        aoTentarNovamente={() => void qClientes.refetch()}
                        recurso="as pessoas cadastradas"
                        vazio="Nenhuma pessoa cadastrada ainda — o membro entra sem vínculo e pode ser vinculado depois."
                      >
                        {(clientes) => (
                          <Selecao
                            label="Vincular a pessoa cadastrada (opcional)"
                            ajuda="Só por escolha sua — nunca por coincidência de nome."
                            valor={novoMembro.clienteId}
                            opcoes={clientes.map((c) => ({ valor: c.id, rotulo: c.nome }))}
                            onChange={(v) => setNovoMembro({ ...novoMembro, clienteId: v })}
                          />
                        )}
                      </EstadoDados>
                      {erroNovoMembro ? <p className="text-red-700">{erroNovoMembro}</p> : null}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={mAdicionarMembro.isPending || !novoMembro.nome.trim()}
                          onClick={() => mAdicionarMembro.mutate({ nucleoId: n.id, ...novoMembro })}
                          className="rounded-md bg-navy px-2 py-1 text-cream disabled:opacity-50"
                        >
                          {mAdicionarMembro.isPending ? "Gravando…" : "Adicionar membro"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdicionandoEm(null);
                            setErroNovoMembro(null);
                          }}
                          className="rounded-md border border-navy/15 px-2 py-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : podeEscrever ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAdicionandoEm(n.id);
                        setErroNovoMembro(null);
                      }}
                      className="mt-2 rounded-md border border-navy/15 px-2 py-1 text-xs text-navy hover:border-gold"
                    >
                      + Adicionar membro ao núcleo
                    </button>
                  ) : null}
                </div>

                <div className="mt-3" data-nucleo-cobertura-geracoes>
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Cobertura por geração</p>
                  {n.coberturaGeracoes.length === 0 || n.coberturaGeracoes.every((g) => g.valor === 0) ? (
                    <p className="text-xs text-navy/50">
                      Nenhum parentesco (pai/mãe) gravado neste caso ainda — a cobertura não é estimada.
                    </p>
                  ) : (
                    <ul className="mt-1 flex flex-wrap gap-2">
                      {n.coberturaGeracoes.map((g) => (
                        <li
                          key={g.rotulo}
                          className="rounded-md border border-navy/12 bg-cream/25 px-2 py-1 text-xs text-navy/70"
                        >
                          {g.rotulo}: {g.valor}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => abrir(n)}
                  className="mt-4 rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy hover:border-gold"
                >
                  {selecionado === n.id ? "Editando dossiê-mãe" : "Editar dossiê-mãe"}
                </button>
              </article>
            );
          })}
        </div>
          )}
        </EstadoDados>

        {atual && rascunho ? (
          <Secao
            titulo={`Dossiê-mãe — ${atual.nome}`}
            descricao="Campos classificatórios usam listas controladas. O dossiê só pode ficar ativo com ambiente, link interno, nível de acesso e responsável nominal."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Texto
                label="ID/nome do dossiê-mãe"
                valor={rascunho.dossie_mae}
                onChange={(v) => setRascunho({ ...rascunho, dossie_mae: v })}
              />
              <Selecao
                label="Ambiente autorizado"
                valor={rascunho.ambiente}
                opcoes={opcoes(NUCLEO_AMBIENTES)}
                onChange={(v) => setRascunho({ ...rascunho, ambiente: v })}
              />
              <Selecao
                label="Nível de acesso"
                valor={rascunho.nivel_acesso}
                opcoes={opcoes(NUCLEO_NIVEIS_ACESSO)}
                onChange={(v) => setRascunho({ ...rascunho, nivel_acesso: v })}
              />
              <Texto
                label="Link interno do dossiê"
                valor={rascunho.link_interno}
                onChange={(v) => setRascunho({ ...rascunho, link_interno: v })}
                ajuda="URL do ambiente autorizado. Arquivos não são replicados no Desk."
              />
              <Texto
                label="Responsável nominal"
                valor={rascunho.responsavel_nome}
                onChange={(v) => setRascunho({ ...rascunho, responsavel_nome: v })}
              />
              <Selecao
                label="Situação do dossiê"
                valor={rascunho.dossie_status}
                opcoes={opcoes(NUCLEO_DOSSIE_STATUS)}
                onChange={(v) => setRascunho({ ...rascunho, dossie_status: v })}
              />
            </div>

            {erro ? <p className="mt-3 text-sm text-red-700">{erro}</p> : null}
            {ok ? <p className="mt-3 text-sm text-emerald-700">{ok}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={m.isPending}
                onClick={() => m.mutate({ nucleoId: atual.id, ...rascunho })}
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-50"
              >
                {m.isPending ? "Gravando…" : "Salvar dossiê-mãe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelecionado(null);
                  setRascunho(null);
                }}
                className="rounded-lg border border-navy/15 px-4 py-2 text-sm text-navy"
              >
                Fechar
              </button>
            </div>
            {pendenciaVinculo ? (
              <p className="mt-2 text-xs text-navy/60">Pendência registrada: {pendenciaVinculo}</p>
            ) : null}
          </Secao>
        ) : null}
      </div>
    </SaasShell>
  );
}
