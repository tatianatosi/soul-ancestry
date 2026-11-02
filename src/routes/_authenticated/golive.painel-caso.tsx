/**
 * Painel do caso — leitura interna reunindo os gráficos que já existem:
 * Pesquisa, Árvore, Documentos, Legado/publicações e Conta.
 *
 * Nada é calculado por inferência e nada é criado aqui: cada bloco lê a mesma
 * fonte da sua tela dona. Sem registro, o bloco mostra o estado vazio canônico
 * com o caminho para a tela que grava.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive, buscaGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  pessoasDoNucleo,
  relacoesAprovadas,
  type PessoaCaso,
} from "@/lib/golive-pessoas";
import {
  contratoParaFamilia,
  financeiroParaFamilia,
  situacaoDocumentos,
} from "@/lib/golive-app";

export const Route = createFileRoute("/_authenticated/golive/painel-caso")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Painel do caso — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Pesquisa, árvore, documentos, publicações e conta do caso em uma leitura interna só.",
      },
      { property: "og:title", content: "Painel do caso — Go-live Clube Ancestral" },
      { property: "og:description", content: "Os gráficos do caso agrupados, sobre o que já está gravado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PainelDoCaso,
});

function PainelDoCaso() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const fontes = caso?.fontes ?? [];
  const evidencias = caso?.evidencias ?? [];
  const achados = caso?.achados ?? [];

  const pessoas: PessoaCaso[] = caso?.pessoas.length
    ? (caso.pessoas as PessoaCaso[])
    : pessoasDoNucleo(caso?.identidade.nucleoMembros ?? [], {
        nome: caso?.identidade.pessoaPrincipal ?? null,
        email: caso?.identidade.email ?? null,
        telefone: caso?.identidade.telefone ?? null,
      });
  const relacoes = relacoesAprovadas(pessoas);

  const documentos = caso?.documentos ?? [];
  const situacao = situacaoDocumentos(documentos.filter((d) => d.liberadoCliente));

  const publicados = caso?.publicados ?? [];

  const titularId = caso?.identidade.pessoaPrincipalId ?? null;
  const contrato = contratoParaFamilia(caso?.contratos ?? [], titularId) ?? caso?.contratos[0] ?? null;
  const financeiro = financeiroParaFamilia(caso?.faturas ?? [], titularId);
  const parcelasEmAberto = financeiro.parcelas.length - financeiro.pagas;

  const cta = (destino: string, rotulo: string) => (
    <Link to={destino}>
      <Button size="sm" variant="outline">
        {rotulo}
      </Button>
    </Link>
  );

  return (
    <GoLiveShell titulo="Painel do caso" descricao="Pesquisa, árvore, documentos, publicações e conta em uma leitura.">
      {caso ? <FaixaIdentidade dados={caso} /> : null}
      <FaixaKpis itens={[
        { rotulo: "Pesquisa", valor: fontes.length + evidencias.length + achados.length, tom: fontes.length + evidencias.length + achados.length ? "azul" : "cinza", fonte: "Fontes, evidências e achados do caso", formula: "Soma dos registros da cadeia de pesquisa", periodo: "Histórico do caso" },
        { rotulo: "Relações aprovadas", valor: relacoes.length, tom: relacoes.length ? "verde" : "cinza", fonte: "Relações explícitas do núcleo", formula: "Contagem de relações aprovadas", periodo: "Estado atual" },
        { rotulo: "Documentos liberados", valor: situacao.liberados, tom: situacao.liberados ? "verde" : "cinza", fonte: "Documentos do caso", formula: "Documentos marcados como liberados ao cliente", periodo: "Estado atual" },
        { rotulo: "Publicados", valor: publicados.length, tom: publicados.length ? "verde" : "cinza", fonte: "Projeções publicadas do caso", formula: "Contagem de conteúdos publicados", periodo: "Estado atual" },
      ]} />

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <GradeDesk>
      <Bloco titulo="Pesquisa">
        {fontes.length + evidencias.length + achados.length > 0 ? (
          <p className="text-sm text-navy">{fontes.length} fonte(s) · {evidencias.length} evidência(s) · {achados.length} achado(s).</p>
        ) : (
          <>
            <Vazio cta={cta("/golive/pesquisa", "Abrir Pesquisa")} />
            <p className="text-xs text-navy/55">Nenhuma linha de pesquisa aberta.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Árvore e núcleo">
        {pessoas.length ? (
          <>
            <p className="text-sm text-navy">{pessoas.length} pessoa(s) no caso · {relacoes.length} relação(ões) aprovada(s).</p>
            <p className="text-xs text-navy/55">
              Relações aprovadas: {relacoes.length}. Só entra na árvore o vínculo confirmado pela equipe.
            </p>
          </>
        ) : (
          <>
            <Vazio cta={cta("/golive/pessoas", "Abrir Pessoas & Famílias")} />
            <p className="text-xs text-navy/55">Nenhuma pessoa confirmada neste núcleo.</p>
          </>
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="Documentos">
        {documentos.length ? (
          <p className="text-sm text-navy">{situacao.solicitados} solicitado(s) · {situacao.emRevisao} em revisão · {situacao.liberados} liberado(s).</p>
        ) : (
          <>
            <Vazio cta={cta("/golive/caso", "Abrir Caso 360")} />
            <p className="text-xs text-navy/55">Nenhum documento liberado para a família.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Publicações e legado">
        {publicados.length ? (
          <p className="text-sm text-navy">{publicados.length} conteúdo(s) publicado(s) para a família.</p>
        ) : (
          <>
            <Vazio cta={cta("/golive/caso", "Publicar no Caso 360")} />
            <p className="text-xs text-navy/55">Nada publicado para a família até agora.</p>
          </>
        )}
      </Bloco>
      </GradeDesk>

      <Bloco titulo="Conta: contrato e parcelas">
        {contrato || financeiro.parcelas.length ? (
          <>
            {contrato ? (
              <p className="text-sm text-navy">
                {contrato.titulo}
                {contrato.numero ? ` · ${contrato.numero}` : ""}
                <span className="block text-xs text-navy/55">
                  {contrato.assinadoEm
                    ? `Assinado em ${dataHumana(contrato.assinadoEm)}`
                    : humano(contrato.status, "sem situação registrada")}
                </span>
              </p>
            ) : null}
            {financeiro.parcelas.length ? (
              <p className="text-sm text-navy">{financeiro.parcelas.length} parcela(s) · {parcelasEmAberto} em aberto.</p>
            ) : (
              <p className="text-xs text-navy/55">Nenhuma fatura emitida para esta família.</p>
            )}
          </>
        ) : (
          <>
            <Vazio cta={cta("/golive/financeiro", "Abrir Financeiro")} />
            <p className="text-xs text-navy/55">Sem contrato ou fatura registrada.</p>
          </>
        )}
      </Bloco>
    </GoLiveShell>
  );
}
