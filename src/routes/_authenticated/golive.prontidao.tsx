/**
 * Prontidão para o App Cliente.
 *
 * Mostra, só como leitura, o que a família já pode ver e o que ainda depende
 * de aprovação interna: contratos, anexos, documentos, propostas e publicações.
 * Nenhuma publicação, liberação ou envio acontece nesta tela.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive, buscaGoLive } from "@/components/golive/dados";
import { Barras } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import { prontidaoDoApp, prontidaoPorGrupo, resumoProntidao } from "@/lib/golive-prontidao";
import { humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/prontidao")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Prontidão para o App — Clube Ancestral" },
      {
        name: "description",
        content: "O que já está liberado para a família e o que ainda aguarda aprovação interna no caso do piloto.",
      },
      { property: "og:title", content: "Prontidão para o App — Clube Ancestral" },
      { property: "og:description", content: "Contratos, documentos, propostas e publicações prontos ou pendentes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProntidaoGoLive,
});

function Linha({
  titulo,
  grupo,
  estado,
  motivo,
  pronto,
}: {
  titulo: string;
  grupo: string;
  estado: string;
  motivo: string;
  pronto: boolean;
}) {
  return (
    <li className="min-w-0 rounded-xl border border-navy/10 bg-white/70 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="min-w-0 break-words text-sm font-medium text-navy">{titulo}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            pronto ? "bg-gold/25 text-navy" : "bg-navy/10 text-navy/70"
          }`}
        >
          {pronto ? "Pronto para o App" : "Falta aprovação"}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        {grupo} · {humano(estado)} · {motivo}
      </p>
    </li>
  );
}

function ProntidaoGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const itens = prontidaoDoApp({
    contratos: caso?.contratos ?? [],
    anexos: caso?.anexos ?? [],
    documentos: caso?.documentos ?? [],
    propostas: caso?.propostas ?? [],
    projecoes: caso?.projecoesEstados ?? [],
  });
  const resumo = resumoProntidao(itens);
  const porGrupo = prontidaoPorGrupo(itens);
  const prontos = itens.filter((i) => i.situacao === "pronto");
  const faltam = itens.filter((i) => i.situacao === "falta");

  return (
    <GoLiveShell
      titulo="Prontidão para o App"
      descricao="O que a família já pode ver e o que ainda depende de aprovação da equipe."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Resumo">
          <div className="grid grid-cols-3 gap-3">
            {[
              { r: "Prontos", v: resumo.prontos },
              { r: "Faltam", v: resumo.faltam },
              { r: "Total", v: resumo.total },
            ].map((k) => (
              <div key={k.r} className="rounded-xl border border-navy/10 bg-white/70 p-3">
                <p className="text-xs text-navy/60">{k.r}</p>
                <p className="font-serif text-2xl text-navy">{k.v}</p>
              </div>
            ))}
          </div>
        </Bloco>

        <Bloco titulo="Pendências por tipo">
          {resumo.total ? (
            <Barras
              titulo="Itens aguardando aprovação por tipo"
              dados={porGrupo.map((g) => ({ rotulo: g.grupo, valor: g.faltam }))}
            />
          ) : (
            <Vazio
              cta={
                <Link search={true} to="/golive/caso">
                  <Button size="sm" variant="outline">
                    Abrir Caso 360
                  </Button>
                </Link>
              }
            />
          )}
        </Bloco>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Prontos para o App">
          {prontos.length ? (
            <ul className="space-y-2">
              {prontos.map((i) => (
                <Linha
                  key={`${i.grupo}-${i.id}`}
                  titulo={i.titulo}
                  grupo={i.grupo}
                  estado={i.estado}
                  motivo={i.motivo}
                  pronto
                />
              ))}
            </ul>
          ) : (
            <Vazio
              cta={
                <Link search={true} to="/golive/portal">
                  <Button size="sm" variant="outline">
                    Abrir Portal
                  </Button>
                </Link>
              }
            />
          )}
        </Bloco>

        <Bloco titulo="Aguardando aprovação interna">
          {faltam.length ? (
            <ul className="space-y-2">
              {faltam.map((i) => (
                <Linha
                  key={`${i.grupo}-${i.id}`}
                  titulo={i.titulo}
                  grupo={i.grupo}
                  estado={i.estado}
                  motivo={i.motivo}
                  pronto={false}
                />
              ))}
            </ul>
          ) : (
            <Vazio
              cta={
                <Link search={true} to="/golive/juridico">
                  <Button size="sm" variant="outline">
                    Abrir Jurídico
                  </Button>
                </Link>
              }
            />
          )}
        </Bloco>
      </div>
    </GoLiveShell>
  );
}
