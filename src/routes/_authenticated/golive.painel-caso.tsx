/**
 * Painel do caso — leitura interna reunindo os gráficos que já existem:
 * Pesquisa, Árvore, Documentos, Legado/publicações e Conta.
 *
 * Nada é calculado por inferência e nada é criado aqui: cada bloco lê a mesma
 * fonte da sua tela dona. Sem registro, o bloco mostra o estado vazio canônico
 * com o caminho para a tela que grava.
 */
import { createFileRoute, Link } from "@tanstack/react-router";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Barras, Linha, Rosca } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { coberturaPorFonte, producaoPorSemana } from "@/lib/golive-pesquisa";
import {
  coberturaPorGeracao,
  composicaoDoNucleo,
  pessoasDoNucleo,
  relacoesAprovadas,
  type PessoaCaso,
} from "@/lib/golive-pessoas";
import {
  contratoParaFamilia,
  financeiroParaFamilia,
  parcelasEmFatias,
  parcelasPorVencimento,
  publicacoesPorAba,
  publicacoesPorMes,
  situacaoDocumentos,
} from "@/lib/golive-app";

export const Route = createFileRoute("/_authenticated/golive/painel-caso")({
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
  const cobertura = coberturaPorFonte(evidencias, fontes);
  const producao = producaoPorSemana(fontes, evidencias, achados);

  const pessoas: PessoaCaso[] = caso?.pessoas.length
    ? (caso.pessoas as PessoaCaso[])
    : pessoasDoNucleo(caso?.identidade.nucleoMembros ?? [], {
        nome: caso?.identidade.pessoaPrincipal ?? null,
        email: caso?.identidade.email ?? null,
        telefone: caso?.identidade.telefone ?? null,
      });
  const geracoes = coberturaPorGeracao(pessoas).filter((g) => g.valor > 0);
  const composicao = composicaoDoNucleo(pessoas, caso?.dependentes ?? []).filter((c) => c.valor > 0);
  const relacoes = relacoesAprovadas(pessoas);

  const documentos = caso?.documentos ?? [];
  const situacao = situacaoDocumentos(documentos.filter((d) => d.liberadoCliente));
  const docsFatias = [
    { rotulo: "Solicitados", valor: situacao.solicitados },
    { rotulo: "Em revisão", valor: situacao.emRevisao },
    { rotulo: "Liberados", valor: situacao.liberados },
  ].filter((f) => f.valor > 0);

  const publicados = caso?.publicados ?? [];
  const porAba = publicacoesPorAba(publicados);
  const porMes = publicacoesPorMes(publicados);

  const titularId = caso?.identidade.pessoaPrincipalId ?? null;
  const contrato = contratoParaFamilia(caso?.contratos ?? [], titularId) ?? caso?.contratos[0] ?? null;
  const financeiro = financeiroParaFamilia(caso?.faturas ?? [], titularId);
  const porVencimento = parcelasPorVencimento(financeiro);

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

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <Bloco titulo="Pesquisa">
        {fontes.length + evidencias.length + achados.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Barras
              titulo="Evidência por fonte consultada"
              dados={cobertura.map((c) => ({ rotulo: c.origem, valor: c.total }))}
            />
            <Linha titulo="Produção por semana" dados={producao} />
          </div>
        ) : (
          <>
            <Vazio cta={cta("/golive/pesquisa", "Abrir Pesquisa")} />
            <p className="text-xs text-navy/55">Nenhuma linha de pesquisa aberta.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Árvore e núcleo">
        {geracoes.length || composicao.length ? (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {geracoes.length ? <Barras titulo="Pessoas por geração" dados={geracoes} /> : null}
              {composicao.length ? <Rosca titulo="Composição do núcleo" dados={composicao} /> : null}
            </div>
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

      <Bloco titulo="Documentos">
        {docsFatias.length ? (
          <Rosca titulo="Situação dos documentos liberados" dados={docsFatias} />
        ) : (
          <>
            <Vazio cta={cta("/golive/caso", "Abrir Caso 360")} />
            <p className="text-xs text-navy/55">Nenhum documento liberado para a família.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Publicações e legado">
        {publicados.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Barras titulo="Publicado por aba do App" dados={porAba} />
            {porMes.length ? <Linha titulo="Publicações por mês" dados={porMes} /> : null}
          </div>
        ) : (
          <>
            <Vazio cta={cta("/golive/caso", "Publicar no Caso 360")} />
            <p className="text-xs text-navy/55">Nada publicado para a família até agora.</p>
          </>
        )}
      </Bloco>

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
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Rosca titulo="Parcelas pagas e em aberto" dados={parcelasEmFatias(financeiro)} />
                {porVencimento.length ? <Barras titulo="Parcelas por mês de vencimento" dados={porVencimento} /> : null}
              </div>
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
