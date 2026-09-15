/**
 * Biblioteca no shell de go-live — acervo da organização e fila editorial.
 *
 * NÃO é segundo motor de pesquisa: aqui não há caso, cadeia de evidência nem
 * achado. A operação canônica da pesquisa continua por case_id, na tela
 * Pesquisa. Só leitura, sem escritor novo e sem dado inventado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Barras } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { filaEditorial } from "@/lib/golive-pesquisa";

export const Route = createFileRoute("/_authenticated/golive/biblioteca")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Go-live Clube Ancestral" },
      { name: "description", content: "Acervo interno e fila editorial da organização: rascunho, revisão, aprovado e publicado." },
      { property: "og:title", content: "Biblioteca — Go-live Clube Ancestral" },
      { property: "og:description", content: "Acervo interno e fila editorial da organização." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BibliotecaGoLive,
});

function BibliotecaGoLive() {
  const { data, isPending, error } = useGoLive();
  const acervo = data?.encontrado ? data.biblioteca.acervo : [];
  const editorial = data?.encontrado ? data.biblioteca.editorial : [];
  const fila = filaEditorial(editorial);

  const porCategoria = Object.entries(
    acervo.reduce<Record<string, number>>((acc, i) => {
      const chave = humano(i.categoria, "Sem categoria");
      acc[chave] = (acc[chave] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([rotulo, valor]) => ({ rotulo, valor }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <GoLiveShell
      titulo="Biblioteca"
      descricao="Acervo interno e fila editorial da organização. A pesquisa do caso fica na tela Pesquisa."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <Bloco titulo="Acervo interno">
        {acervo.length ? (
          <>
            <Barras titulo="Itens do acervo por categoria" dados={porCategoria} />
            <ul className="mt-2 space-y-1 text-sm text-navy">
              {acervo.map((i) => (
                <li key={i.id} className="break-words">
                  {i.titulo}
                  <span className="text-navy/55">
                    {" "}
                    — {humano(i.categoria, "sem categoria")} · {humano(i.vigencia, "sem vigência")}
                    {i.versao ? ` · ${i.versao}` : ""}
                    {i.responsavel ? ` · ${i.responsavel}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Vazio
            texto="Nenhum item no acervo"
            cta={
              <Link to="/golive/configuracoes">
                <Button size="sm">Abrir Configurações</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Fila editorial">
        {editorial.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fila.map((coluna) => (
              <div key={coluna.etapa} className="min-w-0 rounded-xl border border-navy/10 bg-white/60 p-3">
                <p className="text-[11px] uppercase tracking-wide text-navy/50">
                  {coluna.rotulo} · {coluna.itens.length}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-navy">
                  {coluna.itens.length ? (
                    coluna.itens.map((i) => (
                      <li key={i.id} className="break-words">
                        {i.titulo}
                        <span className="text-navy/55">
                          {" "}
                          — {humano(i.tipo, "tipo não informado")}
                          {i.responsavel ? ` · ${i.responsavel}` : ""}
                          {i.publicadoEm ? ` · publicado em ${dataHumana(i.publicadoEm)}` : ""}
                          {!i.publicadoEm && i.previstoPara ? ` · previsto para ${dataHumana(i.previstoPara)}` : ""}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-navy/45">Sem itens nesta etapa</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <Vazio
            texto="Nenhuma pauta na fila editorial"
            cta={
              <Link to="/golive/comercial">
                <Button size="sm">Abrir Comercial</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <p className="text-xs text-navy/55">
        Conteúdo ligado a um caso aparece também na Pesquisa daquele caso. A Biblioteca não abre linha de pesquisa.
      </p>
    </GoLiveShell>
  );
}
