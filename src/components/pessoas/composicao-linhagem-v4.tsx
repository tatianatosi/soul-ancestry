import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import {
  ArvoreGeracoes,
  Cartao,
  Etiqueta,
  GraficoColunas,
  Linha,
  RedeVinculos,
  sigla,
} from "@/components/prancha-v4/kit";
import { GERACAO_MAXIMA_LINHAGEM } from "@/lib/pessoas-linhagens";
import { lerLinhagemDoCaso } from "@/lib/pessoas-linhagens.functions";

/*
 * 13/10/2026 — Pessoas & Linhagens com a composição visual da Prancha V4:
 * gerações G1–G10 e leitura da linhagem no topo, árvore visual do núcleo no
 * centro, rede de núcleos e dependentes e cobertura por geração no rodapé.
 *
 * Regra da Proprietária: todo cartão e todo gráfico aparece sempre; sem
 * registro, o gráfico desenha o estado zero dentro dele.
 *
 * Fontes reais, nada inferido:
 * - gerações e leitura: `lerLinhagemDoCaso` (perfis, filiação gravada e
 *   linha com pessoa âncora; leitura pura);
 * - árvore: só arestas de filiação gravadas (`arestas`); requerente é a
 *   pessoa cujo perfil aponta para o mesmo `cliente_id` de um membro do
 *   núcleo — nunca parentesco suposto por sobrenome;
 * - rede: `nucleo_membros` do núcleo, já carregados por /nucleos.
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

/** Valores de CHECK vêm sem acento; o rótulo exibido recupera a grafia. */
const ACENTOS: Record<string, string> = {
  preparacao: "preparação",
  referencia: "referência",
  genealogica: "genealógica",
  nao: "não",
  signatario: "signatário",
};
const legivel = (v: string | null | undefined) => {
  if (!v) return null;
  const t = v
    .split("_")
    .map((p) => ACENTOS[p] ?? p)
    .join(" ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

type PessoaNaLinha = { personId: string; nome: string; status: string; geracao: number };

/**
 * Árvore visual: uma faixa por geração (a mais antiga no alto, G1 na base)
 * e um traço só onde existe aresta pai → filho gravada. Sem pessoas,
 * desenha o nó vazio da âncora.
 */
export function ArvoreFiliacao({
  geracoes,
  arestas,
  requerentes,
  titular,
}: {
  geracoes: PessoaNaLinha[];
  arestas: { pai: string; filho: string }[];
  requerentes: Set<string>;
  /** Sem linhagem registrada, o nó G1 mostra o titular do núcleo (sem traço). */
  titular?: string | null;
}) {
  const topo = Math.max(1, ...geracoes.map((p) => p.geracao));
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
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="mx-auto w-full min-w-[560px] max-w-3xl"
        role="img"
        aria-label={`Árvore de filiação registrada: ${geracoes.length} pessoa(s), ${arestas.length} ligação(ões) gravada(s).`}
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
              y2={para.y - 24}
              className="stroke-gold"
              strokeWidth={2}
              data-aresta-filiacao
            />
          );
        })}
        {geracoes.length === 0 ? (
          <g>
            <circle
              cx={largura / 2}
              cy={30}
              r={24}
              className={titular ? "fill-gold stroke-navy" : "fill-card stroke-navy/20"}
              strokeWidth={2}
              strokeDasharray={titular ? undefined : "4 4"}
            />
            <text x={largura / 2} y={34} textAnchor="middle" className={`text-[12px] font-semibold ${titular ? "fill-navy" : "fill-navy/40"}`}>
              {titular ? sigla(titular) : "G1"}
            </text>
            {titular ? (
              <>
                <text x={largura / 2} y={68} textAnchor="middle" className="fill-navy text-[12px]">
                  {curto(titular)}
                </text>
                <text x={largura / 2} y={82} textAnchor="middle" className="fill-navy/55 text-[10px]">
                  G1 · titular · ascendentes ainda não registrados
                </text>
              </>
            ) : null}
          </g>
        ) : null}
        {geracoes.map((p) => {
          const c = pos.get(p.personId)!;
          const requerente = requerentes.has(p.personId);
          const confirmado = p.status === "confirmado";
          return (
            <g key={p.personId}>
              <circle
                cx={c.x}
                cy={c.y}
                r={requerente ? 24 : 20}
                className={requerente ? "fill-gold stroke-navy" : confirmado ? "fill-navy stroke-gold" : "fill-card stroke-navy/40"}
                strokeWidth={2}
              />
              <text
                x={c.x}
                y={c.y + 4}
                textAnchor="middle"
                className={`text-[12px] font-semibold ${confirmado && !requerente ? "fill-gold" : "fill-navy"}`}
              >
                {sigla(p.nome)}
              </text>
              <text x={c.x} y={c.y + 38} textAnchor="middle" className="fill-navy text-[12px]">
                {curto(p.nome)}
              </text>
              <text x={c.x} y={c.y + 52} textAnchor="middle" className="fill-navy/55 text-[10px]">
                G{p.geracao}
                {requerente ? " · requerente" : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ComposicaoLinhagemV4({ nucleo, nucleos = [] }: { nucleo: NucleoV4 | null; nucleos?: NucleoV4[] }) {
  const ler = useServerFn(lerLinhagemDoCaso);
  const caseId = nucleo?.caso?.id ?? null;
  const q = useQuery({
    queryKey: ["linhagem-nucleo-v4", caseId],
    queryFn: () => ler({ data: { caseId: caseId as string } }),
    enabled: Boolean(caseId),
    retry: false,
  });

  const membros = nucleo?.membros ?? [];
  const niveis = Array.from({ length: GERACAO_MAXIMA_LINHAGEM }, (_, i) => i + 1);
  const geracoes = q.data?.geracoes ?? [];
  const porGeracao = new Map(niveis.map((g) => [g, geracoes.filter((p) => p.geracao === g)]));
  const maisAntiga = geracoes.length ? Math.max(...geracoes.map((p) => p.geracao)) : null;
  const ancestral = maisAntiga ? (porGeracao.get(maisAntiga)?.[0] ?? null) : null;
  const ancora = porGeracao.get(1)?.[0] ?? null;
  const clientesDoNucleo = new Set(membros.map((m) => m.cliente_id).filter(Boolean) as string[]);
  const requerentes = new Set(
    geracoes.filter((p) => p.clienteId && clientesDoNucleo.has(p.clienteId)).map((p) => p.personId),
  );
  const clientesNaLinha = new Set(geracoes.map((p) => p.clienteId).filter(Boolean) as string[]);
  const semVinculoGenealogico = membros.filter((m) => !m.cliente_id || !clientesNaLinha.has(m.cliente_id));
  const linha = q.data?.linha ?? null;

  /* Aviso curto de estado; o cartão e o gráfico continuam desenhados. */
  const aviso = !nucleo
    ? "Nenhum núcleo cadastrado ainda."
    : !caseId
      ? "Núcleo sem caso vinculado — sem linhagem para ler."
      : q.isLoading
        ? "Carregando a linhagem…"
        : q.isError
          ? "Não foi possível carregar a linhagem."
          : !linha
            ? "Nenhuma linha com pessoa âncora registrada neste caso."
            : null;

  const linkFicha = caseId ? (
    <Link
      to="/pessoas-linhagens/$caseId"
      params={{ caseId }}
      className="text-[10px] font-medium text-navy underline decoration-gold underline-offset-4"
    >
      Ficha genealógica
    </Link>
  ) : null;

  const avisoEl = aviso ? (
    <p className={`mt-3 text-[10px] ${q.isError ? "text-terracotta" : "text-navy/50"}`} role={q.isError ? "alert" : undefined}>
      {aviso}
      {q.isError ? (
        <button type="button" className="ml-1 underline" onClick={() => void q.refetch()}>
          Tentar novamente
        </button>
      ) : null}
    </p>
  ) : null;

  const listaNucleos = nucleos.length ? nucleos : nucleo ? [nucleo] : [];

  return (
    <section aria-label={`Pessoas e linhagens${nucleo ? ` — ${nucleo.nome}` : ""}`} className="space-y-4" data-pessoas-linhagens-v4>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Cartao titulo={`Gerações G1–G${GERACAO_MAXIMA_LINHAGEM}`} data-linhagem-geracoes>
          <ArvoreGeracoes
            total={GERACAO_MAXIMA_LINHAGEM}
            geracoes={
              new Map(
                niveis.map((g) => [
                  g,
                  porGeracao.get(g)!.map((p) => ({
                    id: p.personId,
                    nome: p.nome,
                    apoio: p.localidade,
                    confirmado: p.status === "confirmado",
                  })),
                ]),
              )
            }
          />
          {avisoEl}
        </Cartao>

        <Cartao titulo="Leitura da linhagem" acao={linkFicha} data-linhagem-leitura>
          <Linha
            rotulo="Linha"
            valor={linha ? (linha.nome ?? legivel(linha.tipo) ?? "Sem nome") : "Não registrada"}
            tom={linha ? "neutro" : "atencao"}
          />
          <Linha rotulo="Pessoa âncora (G1)" valor={ancora?.nome ?? "Não registrada"} tom={ancora ? "sucesso" : "atencao"} />
          <Linha
            rotulo="Conexão-chave"
            valor={ancestral ? `${ancestral.nome} · G${maisAntiga}` : "Nenhum ascendente"}
            tom={ancestral ? "sucesso" : "atencao"}
          />
          <Linha rotulo="Território" valor={ancestral?.localidade ?? "Não registrado"} />
          <Linha
            rotulo="Pessoas conectadas"
            valor={`${geracoes.length} de ${q.data?.totalPerfis ?? 0}`}
            tom={geracoes.length && geracoes.length === q.data?.totalPerfis ? "sucesso" : "atencao"}
          />
          <Linha rotulo="Próximo marco" valor={linha?.proximoMarco ?? "Não registrado"} />
          <Linha
            rotulo="O que ainda falta"
            valor={linha?.riscoPrincipal ?? "Não registrado"}
            tom={linha?.riscoPrincipal ? "critico" : "neutro"}
          />
        </Cartao>
      </div>

      <Cartao titulo="Árvore visual do núcleo" data-linhagem-arvore-nucleo>
        <ArvoreFiliacao
          geracoes={geracoes}
          arestas={q.data?.arestas ?? []}
          requerentes={requerentes}
          titular={membros[0]?.nome ?? null}
        />
        <p className="mt-1 text-center text-[10px] text-navy/50">
          Traço dourado só onde há filiação gravada · nó dourado = requerente do núcleo (mesmo cadastro).
        </p>
        {semVinculoGenealogico.length ? (
          <div className="mt-3 border-t border-navy/10 pt-3" data-linhagem-membros-sem-vinculo>
            <p className="text-[10px] font-medium uppercase tracking-widest text-navy/50">
              Membros do núcleo sem vínculo genealógico registrado
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {semVinculoGenealogico.map((m) => (
                <Etiqueta
                  key={m.id}
                  texto={`${m.nome} · ${legivel(m.papel_no_caso) ?? legivel(m.papel) ?? "papel não registrado"}`}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-3 border-t border-navy/10 pt-2">
          {listaNucleos.slice(0, 4).map((n) => (
            <Linha
              key={n.id}
              rotulo={`${/^núcleo\b/i.test(n.nome) ? n.nome : `Núcleo ${n.nome}`} — dossiê-mãe${n.caso?.codigo ? ` · ${n.caso.codigo}` : ""}`}
              valor={legivel(n.dossie_status) ?? "Não iniciado"}
              tom={n.dossie_status === "ativo" ? "sucesso" : n.dossie_status === "em_preparacao" ? "atencao" : "neutro"}
            />
          ))}
          {!listaNucleos.length ? <Linha rotulo="Nenhum núcleo cadastrado" /> : null}
        </div>
      </Cartao>

      <div className="grid gap-4 md:grid-cols-2">
        <Cartao titulo="Rede de núcleos e dependentes" data-linhagem-rede-vinculos>
          <RedeVinculos
            centro={ancora ? { nome: ancora.nome } : membros[0] ? { nome: membros[0].nome } : null}
            vizinhos={(ancora
              ? membros.filter((m) => !(m.cliente_id && m.cliente_id === ancora.clienteId))
              : membros.slice(1)
            ).map((m) => ({
              id: m.id,
              nome: m.nome,
              ligado: Boolean(m.cliente_id && clientesNaLinha.has(m.cliente_id)),
            }))}
            legenda={
              membros.length
                ? "Membros do núcleo · traço dourado = vínculo genealógico registrado; tracejado = só vínculo administrativo"
                : "Nenhum membro registrado neste núcleo"
            }
          />
          {membros.some((m) => m.representacaoNecessaria) ? (
            <div className="mt-3">
              {membros
                .filter((m) => m.representacaoNecessaria)
                .map((m) => (
                  <Linha
                    key={m.id}
                    rotulo={`${m.nome} · representação`}
                    valor={m.representacaoDocumentada ? "Documentada" : "Pendente"}
                    tom={m.representacaoDocumentada ? "sucesso" : "atencao"}
                  />
                ))}
            </div>
          ) : null}
        </Cartao>

        <Cartao titulo="Cobertura por geração" data-linhagem-cobertura>
          <GraficoColunas
            tituloAcessivel={`Pessoas registradas por geração, G1 a G${GERACAO_MAXIMA_LINHAGEM}; dourado = confirmadas`}
            itens={niveis.map((g) => {
              const pessoas = porGeracao.get(g)!;
              return {
                rotulo: `G${g}`,
                valor: pessoas.length,
                secundario: pessoas.filter((p) => p.status === "confirmado").length,
              };
            })}
          />
          <p className="mt-2 text-[10px] text-navy/50">
            Pessoas registradas por geração; parte dourada = confirmadas. Contagem real, sem percentual estimado.
          </p>
        </Cartao>
      </div>
    </section>
  );
}
