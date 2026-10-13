import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { GERACAO_MAXIMA_LINHAGEM, lerLinhagemDoCaso } from "@/lib/pessoas-linhagens.functions";

/*
 * 13/10/2026 — Pessoas & Linhagens na composição da Prancha V4:
 * gerações G1–G10 no topo, leitura da linhagem ao lado, árvore visual do
 * núcleo no centro, rede de vínculos e cobertura por geração no rodapé.
 *
 * Fontes reais, nada inferido:
 * - gerações e leitura da linha: `lerLinhagemDoCaso` (perfis, relações de
 *   filiação e linha com pessoa âncora do caso; leitura pura);
 * - árvore e rede: `nucleo_membros` do núcleo, já carregados por /nucleos.
 * Cobertura é contagem de pessoas registradas e confirmadas por geração,
 * nunca percentual estimado.
 */

export type MembroNucleoV4 = {
  id: string;
  nome: string;
  papel: string;
  papel_no_caso: string;
  vinculo: string | null;
  representacaoNecessaria: boolean | null;
  representacaoDocumentada: boolean | null;
};

export type NucleoV4 = {
  id: string;
  nome: string;
  dossie_status: string | null;
  caso: { id: string; codigo: string | null; titulo: string | null } | null;
  membros: MembroNucleoV4[];
};

const cartao =
  "min-w-0 rounded-xl border border-border bg-card p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--navy)_8%,transparent)]";

const legivel = (v: string | null | undefined) => {
  if (!v) return null;
  const t = v.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const sigla = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";

function No({ nome, apoio, confirmado }: { nome: string; apoio?: string | null; confirmado?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col items-center text-center">
      <span
        className={`relative grid h-10 w-10 place-items-center rounded-full border-2 text-xs font-medium ${
          confirmado ? "border-gold bg-navy text-gold" : "border-navy/20 bg-card text-navy"
        }`}
        aria-hidden="true"
      >
        {sigla(nome)}
      </span>
      <span className="mt-1.5 line-clamp-2 max-w-[7rem] text-[11px] leading-tight text-navy">{nome}</span>
      {apoio ? <span className="max-w-[7rem] truncate text-[10px] text-navy/50">{apoio}</span> : null}
    </span>
  );
}

export function ComposicaoLinhagemV4({ nucleo }: { nucleo: NucleoV4 }) {
  const ler = useServerFn(lerLinhagemDoCaso);
  const caseId = nucleo.caso?.id ?? null;
  const q = useQuery({
    queryKey: ["linhagem-nucleo-v4", caseId],
    queryFn: () => ler({ data: { caseId: caseId as string } }),
    enabled: Boolean(caseId),
    retry: false,
  });

  const niveis = Array.from({ length: GERACAO_MAXIMA_LINHAGEM }, (_, i) => i + 1);
  const geracoes = q.data?.geracoes ?? [];
  const porGeracao = new Map(niveis.map((g) => [g, geracoes.filter((p) => p.geracao === g)]));
  const maisAntiga = geracoes.length ? Math.max(...geracoes.map((p) => p.geracao)) : null;
  const ancestral = maisAntiga ? porGeracao.get(maisAntiga)?.[0] ?? null : null;
  const ancora = porGeracao.get(1)?.[0] ?? null;
  const maiorContagem = Math.max(1, ...niveis.map((g) => porGeracao.get(g)!.length));

  const estadoLinhagem = !caseId ? (
    <p className="mt-3 text-sm text-navy/55">Este núcleo ainda não tem caso vinculado — sem linhagem para ler.</p>
  ) : q.isLoading ? (
    <p className="mt-3 text-sm text-navy/60" role="status">Carregando a linhagem…</p>
  ) : q.isError ? (
    <p className="mt-3 text-sm text-terracotta" role="alert">
      Não foi possível carregar a linhagem.{" "}
      <button type="button" className="underline" onClick={() => void q.refetch()}>
        Tentar novamente
      </button>
    </p>
  ) : !q.data?.linha ? (
    <p className="mt-3 text-sm text-navy/55">Nenhuma linha com pessoa âncora registrada neste caso.</p>
  ) : null;

  return (
    <section aria-label={`Pessoas e linhagens — ${nucleo.nome}`} className="space-y-4" data-pessoas-linhagens-v4>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <section className={cartao} data-linhagem-geracoes>
          <p className="font-serif text-lg text-navy">Gerações G1–G{GERACAO_MAXIMA_LINHAGEM}</p>
          {estadoLinhagem ?? (
            <ol className="mt-3 divide-y divide-navy/10">
              {niveis.map((g) => {
                const pessoas = porGeracao.get(g)!;
                return (
                  <li key={g} className="flex items-center gap-3 py-2" data-geracao={`G${g}`}>
                    <span className="w-8 shrink-0 text-xs font-medium text-navy/60">G{g}</span>
                    {pessoas.length ? (
                      <ul className="flex min-w-0 flex-wrap gap-3">
                        {pessoas.map((p) => (
                          <li key={p.personId}>
                            <No nome={p.nome} apoio={legivel(p.status)} confirmado={p.status === "confirmado"} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-navy/40">Sem pessoa registrada</span>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className={cartao} data-linhagem-leitura>
          <p className="font-serif text-lg text-navy">Leitura da linhagem</p>
          {estadoLinhagem ?? (
            <dl className="mt-3 space-y-2 text-sm">
              {(
                [
                  ["Linha", q.data!.linha!.nome ?? legivel(q.data!.linha!.tipo) ?? "Sem nome registrado"],
                  ["Pessoa âncora (G1)", ancora?.nome ?? "Não registrada"],
                  [
                    "Ancestral mais antigo registrado",
                    ancestral ? `${ancestral.nome} · G${maisAntiga}` : "Nenhum ascendente registrado",
                  ],
                  ["Território", ancestral?.localidade ?? "Não registrado"],
                  ["Pessoas na linha", `${geracoes.length} de ${q.data!.totalPerfis} no caso`],
                  ["Próximo marco", q.data!.linha!.proximoMarco ?? "Não registrado"],
                  ["Risco principal", q.data!.linha!.riscoPrincipal ?? "Não registrado"],
                ] as const
              ).map(([rotulo, valor]) => (
                <div key={rotulo} className="flex flex-wrap justify-between gap-2">
                  <dt className="text-navy/60">{rotulo}</dt>
                  <dd className="text-right text-navy">{valor}</dd>
                </div>
              ))}
            </dl>
          )}
          {caseId ? (
            <Link
              to="/pessoas-linhagens/$caseId"
              params={{ caseId }}
              className="mt-4 inline-block text-xs font-medium text-navy underline decoration-gold underline-offset-4"
            >
              Abrir ficha genealógica do caso
            </Link>
          ) : null}
        </section>
      </div>

      <section className={cartao} data-linhagem-arvore-nucleo>
        <p className="font-serif text-lg text-navy">Árvore visual do núcleo</p>
        {nucleo.membros.length ? (
          <ol className="mt-5 flex overflow-x-auto pb-1">
            {nucleo.membros.map((m, i, todos) => (
              <li key={m.id} className="relative flex min-w-[7rem] flex-1 flex-col items-center px-1">
                {i > 0 ? <span className="absolute left-0 right-1/2 top-5 h-0.5 bg-gold/60" aria-hidden="true" /> : null}
                {i < todos.length - 1 ? (
                  <span className="absolute left-1/2 right-0 top-5 h-0.5 bg-gold/60" aria-hidden="true" />
                ) : null}
                <No nome={m.nome} apoio={legivel(m.papel_no_caso) ?? legivel(m.papel)} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-navy/55">Nenhum membro registrado neste núcleo.</p>
        )}
        <p className="mt-4 border-t border-navy/10 pt-3 text-xs text-navy/60">
          {nucleo.nome} — dossiê-mãe {legivel(nucleo.dossie_status)?.toLowerCase() ?? "não iniciado"}
          {nucleo.caso?.codigo ? ` · caso ${nucleo.caso.codigo}` : ""}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cartao} data-linhagem-rede-vinculos>
          <p className="font-serif text-lg text-navy">Rede de vínculos</p>
          {nucleo.membros.length ? (
            <ul className="mt-3 divide-y divide-navy/10 text-sm">
              {nucleo.membros.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-navy">{m.nome}</span>
                    <span className="block text-xs text-navy/55">{m.vinculo ?? "Vínculo não registrado"}</span>
                  </span>
                  {m.representacaoNecessaria ? (
                    <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[11px] text-navy/70">
                      {m.representacaoDocumentada ? "Representação documentada" : "Representação pendente"}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-navy/55">Nenhum vínculo registrado.</p>
          )}
        </section>

        <section className={cartao} data-linhagem-cobertura>
          <p className="font-serif text-lg text-navy">Cobertura por geração</p>
          {estadoLinhagem ?? (
            <>
              <ol
                className="mt-4 grid h-36 grid-cols-10 items-end gap-1.5"
                aria-label={`Pessoas registradas por geração, G1 a G${GERACAO_MAXIMA_LINHAGEM}`}
              >
                {niveis.map((g) => {
                  const pessoas = porGeracao.get(g)!;
                  const confirmadas = pessoas.filter((p) => p.status === "confirmado").length;
                  return (
                    <li key={g} className="flex h-full flex-col items-center justify-end gap-1">
                      <span className="text-[10px] text-navy/60">{pessoas.length}</span>
                      <span
                        className="flex w-full flex-col justify-end overflow-hidden rounded-t bg-navy/10"
                        style={{ height: `${(pessoas.length / maiorContagem) * 100}%` }}
                        aria-hidden="true"
                      >
                        <span
                          className="block w-full bg-gold"
                          style={{ height: pessoas.length ? `${(confirmadas / pessoas.length) * 100}%` : 0 }}
                        />
                      </span>
                      <span className="text-[10px] font-medium text-navy">G{g}</span>
                      <span className="sr-only">
                        G{g}: {pessoas.length} registrada(s), {confirmadas} confirmada(s)
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-[11px] text-navy/50">
                Contagem de pessoas registradas por geração; dourado = confirmadas. Sem percentual estimado.
              </p>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
