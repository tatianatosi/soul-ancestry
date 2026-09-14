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

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Barras } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  registrarAchadoGoLive,
  registrarEvidenciaGoLive,
  registrarFonteGoLive,
} from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  head: () => ({
    meta: [
      { title: "Pesquisa — Go-live Clube Ancestral" },
      { name: "description", content: "Pergunta, fonte, evidência, achado e proposta de entrega do caso do piloto." },
      { property: "og:title", content: "Pesquisa — Go-live Clube Ancestral" },
      { property: "og:description", content: "Pergunta, fonte, evidência, achado e proposta de entrega." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PesquisaGoLive,
});

const ETAPAS = ["Pergunta", "Fonte", "Evidência", "Achado", "Proposta"] as const;

function PesquisaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novaFonte = useServerFn(registrarFonteGoLive);
  const novaEvidencia = useServerFn(registrarEvidenciaGoLive);
  const novoAchado = useServerFn(registrarAchadoGoLive);

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
        { nome: "resumo", rotulo: "Resumo interno", tipo: "area" },
      ]}
      aoConfirmar={(v) =>
        novoAchado({ data: { titulo: v["titulo"] ?? "", tipo: v["tipo"] ?? "", resumo: v["resumo"] ?? "" } })
      }
      confirmacao="Achado registrado como hipótese em revisão."
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

  const totais = [
    { rotulo: "Perguntas", valor: perguntas.length },
    { rotulo: "Fontes", valor: fontes.length },
    { rotulo: "Evidências", valor: evidencias.length },
    { rotulo: "Achados", valor: achados.length },
  ];
  const temAlgo = totais.some((t) => t.valor > 0);

  return (
    <GoLiveShell titulo="Pesquisa" descricao="Pergunta › Fonte › Evidência › Achado › Proposta.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

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
          {temAlgo ? <Barras titulo="Volume da cadeia de pesquisa" dados={totais} /> : null}
        </Bloco>
      ) : null}

      <Etapa
        titulo="1. Perguntas de pesquisa"
        vazio="Registrar pergunta"
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
        itens={achados.map((a) => (
          <li key={a.id} className="break-words">
            {a.titulo}
            <span className="text-navy/55">
              {" "}
              — {humano(a.validacao, "sem validação")} · confiança {humano(a.confianca, "não informada")}
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
