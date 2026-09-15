/**
 * Pesquisa do caso no shell de go-live.
 *
 * Cadeia obrigatória: pergunta → fonte → evidência → achado → revisão →
 * publicação. Só apresentação: lê o que o motor aprovado devolve para o caso
 * canônico. Achado NÃO atualiza árvore nem App: fica como hipótese até
 * revisão humana. Sem histórico, catálogo, auditoria ou dado inventado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Barras, Linha as GraficoLinha } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  cadeiaPesquisa,
  coberturaPorFonte,
  filaEditorial,
  producaoSemanal,
} from "@/lib/golive-pesquisa";
import {
  registrarAchadoGoLive,
  registrarEvidenciaGoLive,
  registrarFonteGoLive,
} from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Pergunta, fonte, evidência, achado, revisão e publicação da pesquisa do caso do piloto.",
      },
      { property: "og:title", content: "Pesquisa — Go-live Clube Ancestral" },
      { property: "og:description", content: "Cadeia de pesquisa do caso: da pergunta à publicação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PesquisaGoLive,
});

const VAZIO_PESQUISA = "Nenhuma linha de pesquisa aberta";

function PesquisaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novaFonte = useServerFn(registrarFonteGoLive);
  const novaEvidencia = useServerFn(registrarEvidenciaGoLive);
  const novoAchado = useServerFn(registrarAchadoGoLive);

  const fontes = caso?.fontes ?? [];
  const evidencias = caso?.evidencias ?? [];
  const achados = caso?.achados ?? [];
  const editorialDoCaso = (caso?.biblioteca?.editorial ?? []).filter((i) => i.doCaso);

  const perguntas = caso
    ? [
        ...(caso.pesquisa?.objetivo
          ? [{ id: "obj", texto: caso.pesquisa.objetivo, detalhe: "Objetivo da pesquisa" }]
          : []),
        ...caso.hipoteses.map((h) => ({
          id: h.id,
          texto: h.titulo,
          detalhe: `${humano(h.status, "sem situação")} · confiança ${humano(h.confianca, "não informada")}`,
        })),
      ]
    : [];

  const cadeia = cadeiaPesquisa({
    perguntas: perguntas.length,
    fontes,
    evidencias,
    achados,
    editorial: editorialDoCaso,
  });
  const cobertura = coberturaPorFonte(evidencias);
  const producao = producaoSemanal({ fontes, evidencias, achados });
  const fila = filaEditorial(editorialDoCaso);
  const tituloFonte = new Map(fontes.map((f) => [f.id, f.titulo]));

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
          opcoes: fontes.map((f) => ({ valor: f.id, rotulo: f.titulo ?? "Fonte" })),
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
        { nome: "resumo", rotulo: "Resumo interno", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        novoAchado({ data: { titulo: v["titulo"] ?? "", tipo: v["tipo"] ?? "", resumo: v["resumo"] ?? "" } })
      }
      confirmacao="Achado registrado como hipótese em revisão."
    />
  );

  return (
    <GoLiveShell
      titulo="Pesquisa do caso"
      descricao="Pergunta › Fonte › Evidência › Achado › Revisão › Publicação."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <nav aria-label="Cadeia da pesquisa" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-tight">
          {cadeia.map((p, i) => (
            <li key={p.rotulo} className="flex items-center gap-1.5">
              <span
                className={
                  p.feito
                    ? "rounded-full bg-navy/10 px-2 py-0.5 font-medium text-navy"
                    : "rounded-full border border-dashed border-navy/20 px-2 py-0.5 text-navy/45"
                }
              >
                {p.rotulo} <span className="tabular-nums">{p.quantidade}</span>
              </span>
              {i < cadeia.length - 1 ? <span aria-hidden className="text-navy/30">›</span> : null}
            </li>
          ))}
        </ol>
      </nav>

      {caso?.pesquisa ? (
        <Bloco titulo="Andamento da pesquisa">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Campo rotulo="Situação" valor={humano(caso.pesquisa.status)} />
            <Campo rotulo="Confiança" valor={humano(caso.pesquisa.confianca)} />
            <Campo rotulo="Próxima ação" valor={humano(caso.pesquisa.proximaAcao)} />
          </dl>
          {caso.pesquisa.prazo ? (
            <p className="text-xs text-navy/55">Prazo da próxima ação: {dataHumana(caso.pesquisa.prazo)}</p>
          ) : null}
        </Bloco>
      ) : null}

      {/* 1 — Cobertura por fonte */}
      <Bloco titulo="Cobertura por fonte">
        {cobertura.length ? (
          <>
            <Barras titulo="Evidências por tipo de fonte" dados={cobertura.map((c) => ({ rotulo: c.rotulo, valor: c.total }))} />
            <ul className="space-y-1 text-xs text-navy/65">
              {cobertura.map((c) => (
                <li key={c.rotulo} className="break-words">
                  {c.rotulo}: {c.validadas} validada(s) · {c.emRevisao} em revisão
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Vazio
            texto={VAZIO_PESQUISA}
            cta={
              <Link to="/golive/caso">
                <Button size="sm">Abrir Caso 360</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      {/* 2 — Produção de evidência */}
      <Bloco titulo="Produção de evidência (7 semanas)">
        {producao.some((s) => s.total > 0) ? (
          <>
            <GraficoLinha
              titulo="Fontes, evidências e achados registrados por semana"
              dados={producao.map((s) => ({ rotulo: s.rotulo, valor: s.total }))}
            />
            <ul className="space-y-1 text-xs text-navy/65">
              {producao
                .filter((s) => s.total > 0)
                .map((s) => (
                  <li key={s.chave}>
                    Semana de {s.rotulo}: {s.fontes} fonte(s) · {s.evidencias} evidência(s) · {s.achados} achado(s)
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <Vazio
            texto={VAZIO_PESQUISA}
            cta={
              <Link to="/golive/caso">
                <Button size="sm">Abrir Caso 360</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      {/* 3 — Fila editorial do caso */}
      <Bloco titulo="Fila editorial do caso">
        {editorialDoCaso.length ? (
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
                        <span className="text-navy/55"> — {humano(i.tipo, "tipo não informado")}</span>
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
            texto={VAZIO_PESQUISA}
            cta={
              <Link to="/golive/biblioteca">
                <Button size="sm">Abrir Biblioteca</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Etapa
        titulo="1. Perguntas de pesquisa"
        vazio="Abrir Caso 360"
        itens={perguntas.map((p) => (
          <li key={p.id} className="break-words">
            {p.texto} <span className="text-navy/55">— {p.detalhe}</span>
          </li>
        ))}
      />

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
              — {humano(e.status, "sem situação")} · confiança {humano(e.confianca, "não informada")} ·{" "}
              {e.responsavel ? e.responsavel : "sem responsável"}
              {e.fonteId && tituloFonte.get(e.fonteId) ? ` · fonte: ${tituloFonte.get(e.fonteId)}` : ""}
            </span>
          </li>
        ))}
      />

      <Etapa
        titulo="4. Achados (hipótese até revisão)"
        vazio="Registrar achado"
        acao={acaoAchado}
        itens={achados.map((a) => (
          <li key={a.id} className="break-words">
            {a.titulo}
            <span className="text-navy/55">
              {" "}
              — {humano(a.validacao, "sem validação")} · confiança {humano(a.confianca, "não informada")}
            </span>
          </li>
        ))}
      />

      <p className="text-xs text-navy/55">
        Achado registrado aqui não altera a árvore nem o App do cliente: a publicação depende de revisão humana.
      </p>
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
  acao,
}: {
  titulo: string;
  itens: ReactNode[];
  vazio: string;
  acao?: ReactNode;
}) {
  return (
    <Bloco titulo={titulo}>
      {itens.length ? (
        <ul className="space-y-1 text-sm text-navy">{itens}</ul>
      ) : (
        <Vazio
          texto={VAZIO_PESQUISA}
          cta={
            acao ?? (
              <Link to="/golive/caso">
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
