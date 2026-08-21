import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao, Selecao, Texto } from "@/components/caso/campos";
import { SaasShell, useSaas } from "@/components/saas/shell";
import {
  NUCLEO_AMBIENTES,
  NUCLEO_DOSSIE_STATUS,
  NUCLEO_NIVEIS_ACESSO,
  NUCLEO_PAPEIS,
  listarNucleos,
  salvarDossieNucleo,
} from "@/lib/nucleos-desk.functions";

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

type Membro = { id: string; nome: string; papel: string };
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
  caso: { id: string; codigo: string | null; titulo: string | null } | null;
  membros: Membro[];
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
  const { podeEscrever } = useSaas();
  const carregar = useServerFn(listarNucleos);
  const salvar = useServerFn(salvarDossieNucleo);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["nucleos-desk"], queryFn: () => carregar(), retry: false });
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const nucleos = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return ((q.data ?? []) as Nucleo[]).filter((n) => {
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
    for (const n of (q.data ?? []) as Nucleo[]) {
      if (n.caso) contagem.set(n.caso.id, (contagem.get(n.caso.id) ?? 0) + 1);
    }
    return new Set([...contagem.entries()].filter(([, c]) => c > 1).map(([id]) => id));
  }, [q.data]);

  const atual = useMemo(
    () => ((q.data ?? []) as Nucleo[]).find((n) => n.id === selecionado) ?? null,
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
        </Secao>

        {q.isLoading ? <p className="text-sm text-navy/60">Carregando núcleos…</p> : null}
        {q.error ? <p className="text-sm text-red-700">{(q.error as Error).message}</p> : null}
        {!q.isLoading && !q.error && nucleos.length === 0 ? (
          <p className="text-sm text-navy/60">Nenhum núcleo familiar encontrado com os filtros atuais.</p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {nucleos.map((n: Nucleo) => {
            const status = n.dossie_status ?? "nao_iniciado";
            return (
              <article key={n.id} className="rounded-xl border border-navy/10 bg-white p-5">
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

                <div className="mt-3 space-y-1 text-xs text-navy/70">
                  <p>Dossiê-mãe: {n.dossie_mae || "—"}</p>
                  <p>
                    Ambiente: {n.ambiente ? rotulo(n.ambiente) : "—"} · Acesso:{" "}
                    {n.nivel_acesso ? rotulo(n.nivel_acesso) : "—"}
                  </p>
                  <p>Responsável: {n.responsavel_nome || "—"}</p>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy/45">Requerentes e vínculos</p>
                  {n.membros.length === 0 ? (
                    <p className="text-xs text-navy/50">Nenhum requerente cadastrado.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {NUCLEO_PAPEIS.filter((p) => n.membros.some((m2: Membro) => m2.papel === p)).map((papel) => (
                        <li key={papel} className="text-xs text-navy/70">
                          <span className="font-medium text-navy">{rotulo(papel)}:</span>{" "}
                          {n.membros
                            .filter((m2: Membro) => m2.papel === papel)
                            .map((m2: Membro) => m2.nome)
                            .join(", ")}
                        </li>
                      ))}
                      {n.membros.some((m2: Membro) => !(NUCLEO_PAPEIS as readonly string[]).includes(m2.papel)) ? (
                        <li className="text-xs text-navy/70">
                          <span className="font-medium text-navy">Outros:</span>{" "}
                          {n.membros
                            .filter((m2: Membro) => !(NUCLEO_PAPEIS as readonly string[]).includes(m2.papel))
                            .map((m2: Membro) => m2.nome)
                            .join(", ")}
                        </li>
                      ) : null}
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
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Ambiente autorizado"
                valor={rascunho.ambiente}
                opcoes={opcoes(NUCLEO_AMBIENTES)}
                onChange={(v) => setRascunho({ ...rascunho, ambiente: v })}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Nível de acesso"
                valor={rascunho.nivel_acesso}
                opcoes={opcoes(NUCLEO_NIVEIS_ACESSO)}
                onChange={(v) => setRascunho({ ...rascunho, nivel_acesso: v })}
                desabilitado={!podeEscrever}
              />
              <Texto
                label="Link interno do dossiê"
                valor={rascunho.link_interno}
                onChange={(v) => setRascunho({ ...rascunho, link_interno: v })}
                desabilitado={!podeEscrever}
                ajuda="URL do ambiente autorizado. Arquivos não são replicados no Desk."
              />
              <Texto
                label="Responsável nominal"
                valor={rascunho.responsavel_nome}
                onChange={(v) => setRascunho({ ...rascunho, responsavel_nome: v })}
                desabilitado={!podeEscrever}
              />
              <Selecao
                label="Situação do dossiê"
                valor={rascunho.dossie_status}
                opcoes={opcoes(NUCLEO_DOSSIE_STATUS)}
                onChange={(v) => setRascunho({ ...rascunho, dossie_status: v })}
                desabilitado={!podeEscrever}
              />
            </div>

            {erro ? <p className="mt-3 text-sm text-red-700">{erro}</p> : null}
            {ok ? <p className="mt-3 text-sm text-emerald-700">{ok}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={!podeEscrever || m.isPending}
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
            {!podeEscrever ? (
              <p className="mt-2 text-xs text-navy/50">Seu perfil tem acesso somente de leitura.</p>
            ) : null}
          </Secao>
        ) : null}
      </div>
    </SaasShell>
  );
}
