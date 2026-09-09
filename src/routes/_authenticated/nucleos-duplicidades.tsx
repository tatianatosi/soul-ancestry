import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { Secao, Selecao } from "@/components/caso/campos";
import { SaasShell } from "@/components/saas/shell";
import { listarCandidatosDuplicidadeNucleo } from "@/lib/nucleo-duplicidade.functions";
import type { CandidatoDuplicidade, NivelConfianca } from "@/lib/nucleo-duplicidade";

export const Route = createFileRoute("/_authenticated/nucleos-duplicidades")({
  head: () => ({
    meta: [
      { title: "Possíveis núcleos duplicados — Clube Ancestral" },
      {
        name: "description",
        content: "Fase 1 (Detecção) da unificação controlada de núcleos familiares: candidatos sugeridos, sem fusão automática.",
      },
      { property: "og:title", content: "Possíveis núcleos duplicados — Clube Ancestral" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NucleosDuplicidadesPage,
});

const CORES_CONFIANCA: Record<NivelConfianca, string> = {
  alta: "bg-terracotta/15 text-terracotta",
  media: "bg-gold/20 text-navy",
  baixa: "bg-navy/8 text-navy/60",
};

const ROTULOS_CONFIANCA: Record<NivelConfianca, string> = {
  alta: "Confiança alta",
  media: "Confiança média",
  baixa: "Confiança baixa",
};

function CartaoNucleo({ n }: { n: CandidatoDuplicidade["nucleoA"] }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-navy/10 p-3">
      <p className="truncate font-serif text-base text-navy">{n.nome}</p>
      <dl className="mt-2 space-y-1 text-xs text-navy/65">
        <div>
          <dt className="inline text-navy/45">Contratante: </dt>
          <dd className="inline">{n.contratante_nome || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Dossiê-mãe: </dt>
          <dd className="inline">{n.dossie_mae || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Situação do dossiê: </dt>
          <dd className="inline">{n.dossie_status || "—"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Caso vinculado: </dt>
          <dd className="inline">
            {n.caso ? (
              <Link to="/casos/$caseId" params={{ caseId: n.caso.id }} className="text-navy underline underline-offset-2">
                {n.caso.codigo ?? n.caso.titulo ?? n.caso.id}
              </Link>
            ) : (
              "sem caso vinculado"
            )}
          </dd>
        </div>
        {n.caso?.pais ? (
          <div>
            <dt className="inline text-navy/45">País: </dt>
            <dd className="inline">{n.caso.pais}</dd>
          </div>
        ) : null}
        <div>
          <dt className="inline text-navy/45">Requerentes: </dt>
          <dd className="inline">{n.membros.length ? n.membros.map((m) => m.nome).join(", ") : "nenhum cadastrado"}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Criado em: </dt>
          <dd className="inline">{new Date(n.created_at).toLocaleDateString("pt-BR")}</dd>
        </div>
        <div>
          <dt className="inline text-navy/45">Atualizado em: </dt>
          <dd className="inline">{new Date(n.updated_at).toLocaleDateString("pt-BR")}</dd>
        </div>
      </dl>
      <Link
        to="/nucleos"
        className="mt-2 inline-block rounded-md border border-navy/15 px-2 py-1 text-[11px] text-navy hover:border-gold"
      >
        Abrir em Núcleos familiares
      </Link>
    </div>
  );
}

function NucleosDuplicidadesPage() {
  const carregar = useServerFn(listarCandidatosDuplicidadeNucleo);
  const q = useQuery({
    queryKey: ["nucleos-duplicidades"],
    queryFn: () => carregar(),
    retry: false,
  });
  const [filtroConfianca, setFiltroConfianca] = useState("");

  const candidatos = useMemo(() => {
    const lista = (q.data ?? []) as CandidatoDuplicidade[];
    if (!filtroConfianca) return lista;
    return lista.filter((c) => c.confianca === filtroConfianca);
  }, [q.data, filtroConfianca]);

  return (
    <SaasShell
      titulo="Possíveis núcleos duplicados"
      descricao="Fase 1 (Detecção) da unificação controlada de núcleos familiares — sugestão, não decisão."
    >
      <div className="space-y-5">
        <Secao
          titulo="Como ler esta lista"
          descricao="Cada par abaixo tem um motivo objetivo (o que exatamente bateu entre os dois núcleos). Nada aqui é fundido, arquivado ou marcado como igual automaticamente — a decisão continua sendo sua, feita na tela de Núcleos familiares."
        >
          <ul className="list-disc space-y-1 pl-5 text-xs text-navy/65">
            <li>Recalculada a cada carregamento — não existe ainda uma coluna para guardar "em revisão" ou "descartado".</li>
            <li>Documentos e fontes vinculados não estão incluídos nesta fase: essa granularidade ainda não existe ligada ao núcleo.</li>
            <li>
              Comparação assistida, plano de unificação, confirmação, execução atômica e validação pós-merge (Fases 2 a 6 do
              prompt canônico) dependem de colunas novas no banco e ficam para uma etapa seguinte, com acesso de escrita ao
              schema.
            </li>
          </ul>
        </Secao>

        <Secao titulo="Filtrar" descricao="Filtre os candidatos por nível de confiança do motivo encontrado.">
          <Selecao
            label="Nível de confiança"
            valor={filtroConfianca}
            opcoes={[
              { valor: "alta", rotulo: "Alta" },
              { valor: "media", rotulo: "Média" },
              { valor: "baixa", rotulo: "Baixa" },
            ]}
            onChange={setFiltroConfianca}
          />
        </Secao>

        {q.isLoading ? <p className="text-sm text-navy/60">Comparando núcleos…</p> : null}
        {q.error ? <p className="text-sm text-red-700">{(q.error as Error).message}</p> : null}
        {!q.isLoading && !q.error && candidatos.length === 0 ? (
          <p className="text-sm text-navy/60">Nenhum candidato a duplicidade encontrado com os filtros atuais.</p>
        ) : null}

        <div className="space-y-4">
          {candidatos.map((c) => (
            <article key={c.chave} className="rounded-xl border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-1 text-[11px] ${CORES_CONFIANCA[c.confianca]}`}>
                  {ROTULOS_CONFIANCA[c.confianca]}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-navy/45">Status: sugerido</span>
              </div>

              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-navy/70">
                {c.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>

              {c.pessoasEmComum.length > 0 ? (
                <p className="mt-1 text-xs text-navy/55">Pessoas em comum: {c.pessoasEmComum.join(", ")}</p>
              ) : null}

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <CartaoNucleo n={c.nucleoA} />
                <CartaoNucleo n={c.nucleoB} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </SaasShell>
  );
}
