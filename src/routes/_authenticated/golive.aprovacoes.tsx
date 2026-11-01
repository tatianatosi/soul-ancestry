/**
 * Aprovações pendentes — tela interna.
 *
 * Junta, num lugar só, o que depende de decisão da equipe em achado,
 * proposta e contrato, com os botões que já existem no Desk. Nenhum
 * automatismo: cada ação é disparada por pessoa e grava no mesmo caso.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Acao } from "@/components/golive/acoes";
import { useGoLive, useEscritorGoLive, buscaGoLive } from "@/components/golive/dados";
import { Barras } from "@/components/golive/graficos";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Button } from "@/components/ui/button";
import {
  aprovarAchadoGoLive,
  aprovarEscopoPropostaGoLive,
  enviarContratoParaRevisaoGoLive,
  publicarInstrumentoNoAppGoLive,
  registrarAssinaturaContratoGoLive,
} from "@/lib/golive-escritores.functions";
import { aprovacoesPorGrupo, filaDeAprovacoes, resumoAprovacoes, type ItemAprovacao } from "@/lib/golive-aprovacoes";
import { humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/aprovacoes")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Aprovações pendentes — Clube Ancestral" },
      {
        name: "description",
        content: "Achados, propostas e contratos que aguardam decisão da equipe antes de chegar à família.",
      },
      { property: "og:title", content: "Aprovações pendentes — Clube Ancestral" },
      { property: "og:description", content: "Fila interna de aprovação e publicação do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AprovacoesGoLive,
});

function Linha({ item, acao }: { item: ItemAprovacao; acao: React.ReactNode }) {
  return (
    <li className="min-w-0 rounded-xl border border-navy/10 bg-white/70 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="min-w-0 break-words text-sm font-medium text-navy">{item.titulo}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
            item.situacao === "pendente" ? "bg-navy/10 text-navy/70" : "bg-gold/25 text-navy"
          }`}
        >
          {item.situacao === "pendente" ? "Aguarda decisão" : "Decidido"}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        {item.grupo} · {humano(item.estado)} · {item.motivo}
      </p>
      {acao ? <div className="mt-2">{acao}</div> : null}
    </li>
  );
}

function AprovacoesGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const aprovarAchado = useEscritorGoLive(aprovarAchadoGoLive);
  const aprovarEscopo = useEscritorGoLive(aprovarEscopoPropostaGoLive);
  const enviarRevisao = useEscritorGoLive(enviarContratoParaRevisaoGoLive);
  const registrarAssinatura = useEscritorGoLive(registrarAssinaturaContratoGoLive);
  const publicar = useEscritorGoLive(publicarInstrumentoNoAppGoLive);

  const itens = filaDeAprovacoes({
    achados: caso?.achados ?? [],
    propostas: caso?.propostas ?? [],
    contratos: caso?.contratos ?? [],
    projecoes: caso?.projecoesEstados ?? [],
  });
  const resumo = resumoAprovacoes(itens);
  const porGrupo = aprovacoesPorGrupo(itens);
  const pendentes = itens.filter((i) => i.situacao === "pendente");
  const decididos = itens.filter((i) => i.situacao === "pronto");

  function acaoDoItem(item: ItemAprovacao) {
    if (item.acao === "aprovar_achado")
      return (
        <Acao
          rotulo="Aprovar achado"
          titulo="Aprovação interna do achado"
          variante="outline"
          campos={[
            {
              nome: "impactoArvore",
              rotulo: "Impacto na árvore",
              tipo: "escolha",
              padrao: "proposto",
              opcoes: [
                { valor: "nenhum", rotulo: "Nenhum" },
                { valor: "proposto", rotulo: "Proposto" },
                { valor: "aplicado", rotulo: "Aplicado" },
              ],
            },
            { nome: "observacao", rotulo: "Observação interna", tipo: "area" },
          ]}
          aoConfirmar={(v) =>
            aprovarAchado({ data: { achadoId: item.id, impactoArvore: v["impactoArvore"], observacao: v["observacao"] } })
          }
        />
      );

    if (item.acao === "aprovar_escopo")
      return (
        <Acao
          rotulo="Aprovar escopo"
          titulo="Aprovação do escopo da proposta"
          variante="outline"
          campos={[{ nome: "observacao", rotulo: "Observação interna", tipo: "area" }]}
          aoConfirmar={(v) => aprovarEscopo({ data: { propostaId: item.id, observacao: v["observacao"] } })}
        />
      );

    if (item.acao === "enviar_revisao")
      return (
        <Acao
          rotulo="Enviar para revisão"
          titulo="Contrato em revisão humana"
          variante="outline"
          campos={[{ nome: "observacao", rotulo: "Observação para quem revisa", tipo: "area" }]}
          aoConfirmar={(v) => enviarRevisao({ data: { contratoId: item.id, observacao: v["observacao"] } })}
        />
      );

    if (item.acao === "registrar_assinatura")
      return (
        <Acao
          rotulo="Registrar assinatura"
          titulo="Assinatura com ato formal"
          variante="outline"
          campos={[
            { nome: "referencia", rotulo: "Referência do ato formal", obrigatorio: true },
            { nome: "assinadoEm", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true },
            { nome: "forma", rotulo: "Forma (presencial, digital…)" },
          ]}
          aoConfirmar={(v) =>
            registrarAssinatura({
              data: {
                contratoId: item.id,
                referencia: v["referencia"] ?? "",
                assinadoEm: v["assinadoEm"] ?? "",
                forma: v["forma"],
              },
            })
          }
        />
      );

    if (item.acao === "publicar")
      return (
        <Acao
          rotulo="Publicar no App"
          titulo="Publicar versão sanitizada"
          campos={[]}
          aoConfirmar={async () => {
            // 25/10/2026: sem digitar palavra; o botão de confirmar do diálogo basta.
            return publicar({
              data: { tipo: item.grupo === "Contrato" ? "contrato" : "proposta", id: item.id },
            });
          }}
        />
      );

    return null;
  }

  return (
    <GoLiveShell
      titulo="Aprovações pendentes"
      descricao="Achado, proposta e contrato que dependem de uma decisão da equipe agora."
    >
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloco titulo="Resumo">
          <div className="grid grid-cols-3 gap-3">
            {[
              { r: "Pendentes", v: resumo.pendentes },
              { r: "Decididos", v: resumo.prontos },
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
              titulo="Itens aguardando decisão por tipo"
              dados={porGrupo.map((g) => ({ rotulo: g.grupo, valor: g.pendentes }))}
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

      <Bloco titulo="Aguardando decisão">
        {pendentes.length ? (
          <ul className="space-y-2">
            {pendentes.map((i) => (
              <Linha key={`${i.grupo}-${i.id}`} item={i} acao={acaoDoItem(i)} />
            ))}
          </ul>
        ) : (
          <Vazio
            cta={
              <Link search={true} to="/golive/prontidao">
                <Button size="sm" variant="outline">
                  Abrir prontidão para o App
                </Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Já decididos">
        {decididos.length ? (
          <ul className="space-y-2">
            {decididos.map((i) => (
              <Linha key={`${i.grupo}-${i.id}`} item={i} acao={null} />
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
    </GoLiveShell>
  );
}
