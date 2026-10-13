import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { GERACAO_MAXIMA_LINHAGEM } from "@/lib/pessoas-linhagens";
import { lerLinhagemDoCaso } from "@/lib/pessoas-linhagens.functions";

/*
 * 13/10/2026 — Pessoas & Linhagens na composição da Prancha V4:
 * gerações G1–G10 no topo, leitura da linhagem ao lado, árvore visual do
 * núcleo no centro, rede de vínculos e cobertura por geração no rodapé.
 *
 * Fontes reais, nada inferido:
 * - gerações e leitura da linha: `lerLinhagemDoCaso` (perfis, relações de
 *   filiação e linha com pessoa âncora do caso; leitura pura);
 * - árvore: só arestas de filiação gravadas (`arestas`); requerente é a
 *   pessoa cujo perfil aponta para o mesmo `cliente_id` de um membro do
 *   núcleo — nunca parentesco suposto por sobrenome;
 * - rede: `nucleo_membros` do núcleo, já carregados por /nucleos.
 * Cobertura é contagem de pessoas registradas e confirmadas por geração,
 * nunca percentual estimado.
 */

export type MembroNucleoV4 = {
  id: string;
  nome: string;
  papel: string;
  papel_no_caso: string;
  vinculo: string | null;
  cliente_id: string | null;
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

type PessoaNaLinha = { personId: string; nome: string; status: string; geracao: number };

/**
 * Desenho da filiação: uma faixa por geração (a mais antiga no alto, G1 na
 * base) e uma linha só onde existe aresta pai → filho gravada.
 */
export function ArvoreFiliacao({
  geracoes,
  arestas,
  requerentes,
}: {
  geracoes: PessoaNaLinha[];
  arestas: { pai: string; filho: string }[];
  requerentes: Set<string>;
}) {
  const topo = Math.max(...geracoes.map((p) => p.geracao));
  const largura = 1000;
  const faixa = 96;
  const altura = topo * faixa + 24;
  const pos = new Map<string, { x: number; y: number }>();
  for (let g = 1; g <= topo; g++) {
    const linha = geracoes.filter((p) => p.geracao === g);
    linha.forEach((p, i) => {
      pos.set(p.personId, { x: (largura * (i + 1)) / (linha.length + 1), y: (topo - g) * faixa + 30 });
    });
  }
  const curto = (n: string) => (n.length > 22 ? `${n.slice(0, 21)}…` : n);
  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="w-full min-w-[560px]"
        role="img"
        aria-label={`Árvore de filiação registrada: ${geracoes.length} pessoa(s) em ${topo} geração(ões), ${arestas.length} ligação(ões) gravada(s).`}
      >
        {arestas.map((a) => {
          const de = pos.get(a.pai);
          const para = pos.get(a.filho);
          if (!de || !para) return null;
          return (
            <line
              key={`${a.pai}>${a.filho}`}
              x1={de.x}
              y1={de.y + 54}
              x2={para.x}
              y2={para.y - 18}
              stroke="var(--gold)"
              strokeWidth={2}
              data-aresta-filiacao
            />
          );
        })}
        {geracoes.map((p) => {
          const c = pos.get(p.personId)!;
          const requerente = requerentes.has(p.personId);
          return (
            <g key={p.personId}>
              <circle
                cx={c.x}
                cy={c.y}
                r={18}
                fill={p.status === "confirmado" ? "var(--navy)" : "var(--card)"}
                stroke={requerente ? "var(--terracotta)" : p.status === "confirmado" ? "var(--gold)" : "color-mix(in srgb, var(--navy) 25%, transparent)"}
                strokeWidth={requerente ? 3 : 2}
              />
              <text x={c.x} y={c.y + 4} textAnchor="middle" fontSize={12} fill={p.status === "confirmado" ? "var(--gold)" : "var(--navy)"}>
                {sigla(p.nome)}
              </text>
              <text x={c.x} y={c.y + 34} textAnchor="middle" fontSize={12} fill="var(--navy)">
                {curto(p.nome)}
              </text>
              <text x={c.x} y={c.y + 48} textAnchor="middle" fontSize={10} fill="color-mix(in srgb, var(--navy) 55%, transparent)">
                G{p.geracao}
                {requerente ? " · requerente" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-[11px] text-navy/50">
        Linhas só onde há filiação gravada. Contorno terracota = requerente do núcleo (mesmo cadastro).
      </p>
    </div>
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
  const clientesDoNucleo = new Set(nucleo.membros.map((m) => m.cliente_id).filter(Boolean) as string[]);
  const requerentes = new Set(
    geracoes.filter((p) => p.clienteId && clientesDoNucleo.has(p.clienteId)).map((p) => p.personId),
  );
  const clientesNaLinha = new Set(geracoes.map((p) => p.clienteId).filter(Boolean) as string[]);
  const semVinculoGenealogico = nucleo.membros.filter((m) => !m.cliente_id || !clientesNaLinha.has(m.cliente_id));
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
        {estadoLinhagem ?? (geracoes.length ? <ArvoreFiliacao geracoes={geracoes} arestas={q.data!.arestas} requerentes={requerentes} /> : (
          <p className="mt-3 text-sm text-navy/55">Nenhuma pessoa na linha ainda.</p>
        ))}
        {semVinculoGenealogico.length ? (
          <div className="mt-4 border-t border-navy/10 pt-3" data-linhagem-membros-sem-vinculo>
            <p className="text-[11px] uppercase tracking-wide text-navy/50">
              Membros do núcleo sem vínculo genealógico registrado
            </p>
            <ul className="mt-2 flex flex-wrap gap-4">
              {semVinculoGenealogico.map((m) => (
                <li key={m.id}>
                  <No nome={m.nome} apoio={legivel(m.papel_no_caso) ?? legivel(m.papel)} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
