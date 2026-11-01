/**
 * Pesquisa no shell de go-live.
 *
 * Ordem obrigatória da prancha v3: pergunta → fonte → evidência → achado →
 * proposta de entrega. Só apresentação: lê o que o motor aprovado devolve
 * para o caso canônico (pesquisa, hipóteses, fontes, evidências, achados).
 * Sem histórico, catálogo, auditoria ou dado inventado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Barras, Linha as LinhaSerie, Rosca } from "@/components/golive/graficos";
import {
  coberturaPorFonte,
  filaEditorial,
  filaEmSerie,
  producaoPorSemana,
} from "@/lib/golive-pesquisa";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive, useEscritorGoLive, buscaGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  aprovarAchadoGoLive,
  registrarAchadoGoLive,
  registrarEvidenciaGoLive,
  registrarFonteGoLive,
} from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Pesquisa — Go-live Clube Ancestral" },
      { name: "description", content: "Pergunta, fonte, evidência, achado e proposta de entrega do caso escolhido." },
      { property: "og:title", content: "Pesquisa — Go-live Clube Ancestral" },
      { property: "og:description", content: "Pergunta, fonte, evidência, achado e proposta de entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PesquisaGoLive,
});

const ETAPAS = ["Pergunta", "Fonte", "Evidência", "Achado", "Revisão", "Publicação"] as const;

function PesquisaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novaFonte = useEscritorGoLive(registrarFonteGoLive);
  const novaEvidencia = useEscritorGoLive(registrarEvidenciaGoLive);
  const novoAchado = useEscritorGoLive(registrarAchadoGoLive);
  const aprovarAchado = useEscritorGoLive(aprovarAchadoGoLive);

  const acaoFonte = (
    <Acao
      rotulo="Registrar fonte"
      titulo="Fonte consultada"
      variante="outline"
      campos={[
        { nome: "titulo", rotulo: "Fonte", obrigatorio: true },
        { nome: "instituicao", rotulo: "Arquivo ou instituição" },
        { nome: "tipo", rotulo: "Tipo", padrao: "registro_civil" },
        { nome: "url", rotulo: "Endereço (se houver)" },
      ]}
      aoConfirmar={(v) =>
        novaFonte({
          data: {
            titulo: v["titulo"] ?? "",
            instituicao: v["instituicao"] ?? "",
            tipo: v["tipo"] ?? "",
            url: v["url"] ?? "",
          },
        })
      }
      confirmacao="Fonte registrada."
    />
  );

  const acaoEvidencia = (
    <Acao
      rotulo="Anexar evidência"
      titulo="Evidência coletada"
      variante="outline"
      campos={[
        { nome: "titulo", rotulo: "Evidência", obrigatorio: true },
        { nome: "tipo", rotulo: "Tipo", padrao: "documento" },
        {
          nome: "fonteId",
          rotulo: "Fonte de origem",
          tipo: "escolha",
          opcoes: (caso?.fontes ?? []).map((f) => ({ valor: f.id, rotulo: f.titulo ?? "Fonte" })),
        },
        { nome: "descricao", rotulo: "Descrição interna", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        novaEvidencia({
          data: {
            titulo: v["titulo"] ?? "",
            tipo: v["tipo"] ?? "",
            fonteId: v["fonteId"] ?? "",
            descricao: v["descricao"] ?? "",
          },
        })
      }
      confirmacao="Evidência registrada para revisão."
    />
  );

  const acaoAchado = (
    <Acao
      rotulo="Registrar achado"
      titulo="Achado em revisão"
      variante="outline"
      campos={[
        { nome: "titulo", rotulo: "Achado", obrigatorio: true },
        { nome: "tipo", rotulo: "Tipo", padrao: "vinculo_familiar" },
        {
          nome: "evidenciaId",
          rotulo: "Evidência que sustenta",
          tipo: "escolha",
          opcoes: (caso?.evidencias ?? []).map((e) => ({ valor: e.id, rotulo: e.titulo ?? "Evidência" })),
        },
        {
          nome: "fonteId",
          rotulo: "Fonte que sustenta",
          tipo: "escolha",
          opcoes: (caso?.fontes ?? []).map((f) => ({ valor: f.id, rotulo: f.titulo ?? "Fonte" })),
        },
        { nome: "resumo", rotulo: "Resumo interno", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        novoAchado({
          data: {
            titulo: v["titulo"] ?? "",
            tipo: v["tipo"] ?? "",
            resumo: v["resumo"] ?? "",
            evidenciaId: v["evidenciaId"] ?? "",
            fonteId: v["fonteId"] ?? "",
          },
        })
      }
      confirmacao="Achado registrado como hipótese em revisão."
    />
  );

  /* Aprovação interna: grava o achado como validado e declara o impacto na
     árvore. Não publica nada para a família e não cria vínculo sozinho. */
  const acaoAprovar = (
    <Acao
      rotulo="Aprovar achado"
      titulo="Aprovação interna do achado"
      variante="outline"
      campos={[
        {
          nome: "achadoId",
          rotulo: "Achado em revisão",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: (caso?.achados ?? [])
            .filter((a) => a.validacao !== "validado_internamente")
            .map((a) => ({ valor: a.id, rotulo: a.titulo ?? "Achado" })),
        },
        {
          nome: "impactoArvore",
          rotulo: "Impacto na árvore",
          tipo: "escolha",
          padrao: "proposto",
          opcoes: [
            { valor: "proposto", rotulo: "Proposto — entra como sugestão na árvore interna" },
            { valor: "aplicado", rotulo: "Aplicado — vínculo confirmado na árvore interna" },
            { valor: "nenhum", rotulo: "Sem impacto na árvore" },
          ],
        },
        { nome: "observacao", rotulo: "Observação interna", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        aprovarAchado({
          data: {
            achadoId: v["achadoId"] ?? "",
            impactoArvore: v["impactoArvore"] ?? "proposto",
            observacao: v["observacao"] ?? "",
          },
        })
      }
      confirmacao="Achado aprovado internamente. Nada foi publicado para a família."
    />
  );

  const perguntas = caso
    ? [
        ...(caso.pesquisa?.objetivo ? [{ id: "obj", texto: caso.pesquisa.objetivo, detalhe: "Objetivo da pesquisa" }] : []),
        ...caso.hipoteses.map((h) => ({
          id: h.id,
          texto: h.titulo,
          detalhe: `${humano(h.status, "sem situação")} · confiança ${humano(h.confianca, "não informada")}`,
        })),
      ]
    : [];

  const fontes = caso?.fontes ?? [];
  const evidencias = caso?.evidencias ?? [];
  const achados = caso?.achados ?? [];
  const propostas = caso?.propostas ?? [];

  /* Três blocos analíticos, nada além disso:
     1) cobertura por fonte, 2) produção de evidência, 3) fila editorial. */
  const cobertura = coberturaPorFonte(evidencias, fontes);
  const producao = producaoPorSemana(fontes, evidencias, achados);
  const fila = filaEditorial(evidencias, achados);
  const filaSerie = filaEmSerie(fila);
  const temAcervo = evidencias.length + achados.length > 0;
  const temLinhaAberta =
    perguntas.length + fontes.length + evidencias.length + achados.length > 0;
  const evidenciasEmRevisao = evidencias.filter((e) => /revis/i.test(e.status ?? "")).length;
  const achadosAprovados = achados.filter((a) => /validado|aprovad/i.test(a.validacao ?? "")).length;

  return (
    <GoLiveShell titulo="Pesquisa" descricao="Pergunta › Fonte › Evidência › Achado › Revisão › Publicação.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <FaixaKpis itens={[
        { rotulo: "Perguntas abertas", valor: perguntas.length, tom: perguntas.length ? "azul" : "cinza" },
        { rotulo: "Fontes", valor: fontes.length, tom: fontes.length ? "azul" : "cinza" },
        { rotulo: "Evidências em revisão", valor: evidenciasEmRevisao, tom: evidenciasEmRevisao ? "dourado" : "cinza" },
        { rotulo: "Achados aprovados", valor: achadosAprovados, tom: achadosAprovados ? "verde" : "cinza" },
      ]} />

      <nav aria-label="Etapas da pesquisa" className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[11px] leading-tight text-navy/45">
          {ETAPAS.map((e, i) => (
            <span key={e} className="flex items-center gap-1">
              <span>{e}</span>
              {i < ETAPAS.length - 1 ? <span aria-hidden>›</span> : null}
            </span>
          ))}
        </p>
      </nav>

      {!isPending && !temLinhaAberta ? (
        <Bloco titulo="Pesquisa do caso">
          <p className="text-sm text-navy/70">Nenhuma linha de pesquisa aberta</p>
          <div className="pt-2">
            <Link search={true} to="/golive/caso">
              <Button size="sm">Abrir o caso</Button>
            </Link>
          </div>
        </Bloco>
      ) : null}

      <GradeDesk>
      <Bloco titulo="1. Cobertura por fonte">
        {cobertura.length ? (
          <>
            <Barras
              titulo="Evidências por fonte de origem"
              dados={cobertura.map((c) => ({ rotulo: c.origem, valor: c.total }))}
            />
            <ul className="space-y-1 text-xs text-navy/60">
              {cobertura.map((c) => (
                <li key={c.origem} className="break-words">
                  {c.origem}: {c.validadas} validada(s) · {c.emRevisao} em revisão
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Vazio cta={acaoFonte} />
        )}
      </Bloco>

      <Bloco titulo="2. Produção de evidência">
        {producao.length ? (
          <>
            <LinhaSerie titulo="Fontes, evidências e achados por semana" dados={producao} />
            <p className="text-xs text-navy/55">
              No período: {fontes.length} fonte(s), {evidencias.length} evidência(s) e {achados.length} achado(s).
              Só entra registro com data gravada.
            </p>
          </>
        ) : (
          <Vazio cta={acaoEvidencia} />
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="3. Fila editorial">
        {temAcervo ? (
          <>
            <Rosca titulo="Acervo do caso por estado" dados={filaSerie} />
            <p className="text-xs text-navy/55">
              Rascunho {fila.rascunho} · Em revisão {fila.revisao} · Aprovado {fila.aprovado} · Publicado{" "}
              {fila.publicado}. Achado aprovado não altera árvore nem App sozinho.
            </p>
          </>
        ) : (
          <Vazio cta={acaoAchado} />
        )}
      </Bloco>

      <Bloco titulo="Linha de pesquisa">
        {caso?.pesquisa ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CampoPesquisa rotulo="Objetivo" valor={caso.pesquisa.objetivo} />
            <CampoPesquisa rotulo="Situação" valor={humano(caso.pesquisa.status)} />
            <CampoPesquisa rotulo="Próxima ação" valor={humano(caso.pesquisa.proximaAcao)} />
            <CampoPesquisa rotulo="Prazo" valor={caso.pesquisa.prazo ? dataHumana(caso.pesquisa.prazo) : null} />
          </dl>
        ) : (
          <Vazio cta={acaoFonte} />
        )}
      </Bloco>



      <Etapa
        titulo="1. Perguntas de pesquisa"
        vazio="Registrar pergunta"
        itens={perguntas.map((p) => (
          <li key={p.id} className="break-words">
            {p.texto} <span className="text-navy/55">— {p.detalhe}</span>
          </li>
        ))}
      />
      </GradeDesk>

      <Etapa
        titulo="2. Fontes"
        vazio="Registrar fonte"
        acao={acaoFonte}
        itens={fontes.map((f) => (
          <li key={f.id} className="break-words">
            {f.titulo}
            <span className="text-navy/55">
              {" "}
              — {humano(f.tipo, "tipo não informado")} · {humano(f.status, "sem situação")}
              {f.instituicao ? ` · ${f.instituicao}` : ""}
            </span>
          </li>
        ))}
      />

      <Etapa
        titulo="3. Evidências"
        vazio="Anexar evidência"
        acao={acaoEvidencia}
        itens={evidencias.map((e) => (
          <li key={e.id} className="break-words">
            {e.titulo}
            <span className="text-navy/55">
              {" "}
              — {humano(e.status, "sem situação")} · confiança {humano(e.confianca, "não informada")}
            </span>
          </li>
        ))}
      />

      <Etapa
        titulo="4. Achados"
        vazio="Registrar achado"
        acao={
          <>
            {acaoAchado}
            {achados.length ? acaoAprovar : null}
          </>
        }
        itens={achados.map((a) => (
          <li key={a.id} className="break-words">
            {a.titulo}
            <span className="text-navy/55">
              {" "}
              — {humano(a.validacao, "sem validação")} · confiança {humano(a.confianca, "não informada")}
              {a.impactoArvore && a.impactoArvore !== "nenhum" ? ` · árvore: ${humano(a.impactoArvore)}` : ""}
              {a.publicavel ? " · pode ir para a família" : ""}
            </span>
          </li>
        ))}
      />

      <Etapa
        titulo="5. Proposta de entrega"
        vazio="Abrir Formalização"
        destino="/golive/formalizacao"
        itens={propostas.map((p) => (
          <li key={p.id} className="break-words">
            Versão {p.versao ?? 1} — {humano(p.status)}
            {p.escopo ? <span className="text-navy/60"> · {p.escopo}</span> : null}
          </li>
        ))}
      />
    </GoLiveShell>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor}</dd>
    </div>
  );
}

function Etapa({
  titulo,
  itens,
  vazio,
  destino = "/golive/caso",
  acao,
}: {
  titulo: string;
  itens: ReactNode[];
  vazio: string;
  destino?: "/golive/caso" | "/golive/formalizacao";
  acao?: ReactNode;
}) {
  return (
    <Bloco titulo={titulo}>
      {itens.length ? (
        <ul className="space-y-1 text-sm text-navy">{itens}</ul>
      ) : (
        <Vazio
          cta={
            acao ?? (
              <Link to={destino}>
                <Button size="sm">{vazio}</Button>
              </Link>
            )
          }
        />
      )}
      {itens.length && acao ? <Acoes>{acao}</Acoes> : null}
    </Bloco>
  );
}

function CampoPesquisa({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-sm break-words text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
