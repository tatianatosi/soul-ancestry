/**
 * Portal / Configuração Master no shell de go-live.
 *
 * Acesso do cliente, equipe/organização, publicação com autor e data e o
 * espelho interno do que o cliente enxerga. Só apresentação: nenhuma
 * publicação é disparada aqui e nenhum dado é criado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, GradeDesk, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Acao } from "@/components/golive/acoes";
import { useGoLive, buscaGoLive } from "@/components/golive/dados";
import { Barras, Rosca } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import { acessoAoPortal, coberturaDoApp, publicacaoPorEstado } from "@/lib/golive-portal";
import { dataHumana, humano } from "@/lib/rotulos-golive";

export const Route = createFileRoute("/_authenticated/golive/portal")({
  staticData: { sitemap: false },
  validateSearch: buscaGoLive,
  head: () => ({
    meta: [
      { title: "Portal do cliente — Go-live Clube Ancestral" },
      { name: "description", content: "Acesso do cliente, equipe e conteúdo publicado do caso escolhido." },
      { property: "og:title", content: "Portal do cliente — Go-live Clube Ancestral" },
      { property: "og:description", content: "Acesso do cliente, equipe e conteúdo publicado do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PortalGoLive,
});

function PortalGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const publicados = caso?.publicados ?? [];



  // Só contagem do que já está gravado: projeções, acessos e e-mails autorizados.
  const projecoes = caso?.projecoesEstados ?? [];
  const despublicadas = caso?.projecoesDespublicadas ?? [];
  const acessos = caso?.portal.acessos ?? [];
  const emails = caso?.portal.emailsAutorizados ?? [];
  const porEstado = publicacaoPorEstado(projecoes);
  const resumoAcesso = acessoAoPortal(acessos, emails);
  const cobertura = coberturaDoApp(projecoes);
  const contrato = caso?.contratos?.[0] ?? null;
  const proposta = caso?.propostas?.[0] ?? null;
  const rascunhos = porEstado.find((i) => i.rotulo === "Rascunho")?.valor ?? 0;
  const emRevisao = porEstado.find((i) => i.rotulo === "Em revisão")?.valor ?? 0;
  const publicadosTotal = porEstado.find((i) => i.rotulo === "Publicada")?.valor ?? 0;

  return (
    <GoLiveShell titulo="Portal do cliente" descricao="Acesso, equipe e o que o cliente já enxerga.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <FaixaKpis itens={[
        { rotulo: "Rascunhos", valor: rascunhos, tom: rascunhos ? "azul" : "cinza" },
        { rotulo: "Em revisão", valor: emRevisao, tom: emRevisao ? "dourado" : "cinza" },
        { rotulo: "Publicados", valor: publicadosTotal, tom: publicadosTotal ? "verde" : "cinza" },
        { rotulo: "Acessos ativos", valor: resumoAcesso.ativos, tom: resumoAcesso.ativos ? "verde" : "cinza" },
      ]} />

      <GradeDesk>
      <Bloco titulo="Acesso do cliente">
        {caso?.identidade.email ? (
          <div className="space-y-2">
            <p className="break-words text-sm text-navy">
              {caso.identidade.pessoaPrincipal} · {caso.identidade.email}
            </p>
            <Link to="/acessos-portal" className="text-sm text-navy underline decoration-gold underline-offset-4">
              Gerenciar acesso e convite
            </Link>
          </div>
        ) : (
          <Vazio
            cta={
              <Link to="/acessos-portal">
                <Button size="sm">Autorizar e-mail do cliente</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="Equipe e organização">
        {caso && caso.equipeTotal > 0 ? (
          <p className="text-sm text-navy">
            Clube Ancestral · {caso.equipeTotal} pessoa{caso.equipeTotal === 1 ? "" : "s"} com acesso interno.
          </p>
        ) : (
          <Vazio
            cta={
              <Link to="/acessos-portal">
                <Button size="sm">Gerenciar equipe</Button>
              </Link>
            }
          />
        )}
      </Bloco>
      </GradeDesk>

      <GradeDesk>
      <Bloco titulo="1. Publicação por estado">
        {projecoes.length ? (
          <>
            <Rosca titulo="Publicação por estado" dados={porEstado} />
            {despublicadas.length ? (
              <ul className="space-y-1 text-xs text-navy/60">
                {despublicadas.map((d) => (
                  <li key={d.id} className="break-words">
                    Despublicado em {dataHumana(d.despublicadaEm, "data não registrada")}
                    {d.motivoDespublicacao ? ` · ${d.motivoDespublicacao}` : ""} — continua no histórico.
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <Vazio
            cta={
              <Link search={true} to="/golive/caso">
                <Button size="sm">Abrir Caso 360</Button>
              </Link>
            }
          />
        )}
      </Bloco>

      <Bloco titulo="2. Acesso ao portal">
        {resumoAcesso.total || emails.length ? (
          <>
            <Barras
              titulo="Situação do acesso"
              dados={[
                { rotulo: "Convites autorizados", valor: resumoAcesso.convitesAutorizados },
                { rotulo: "Acesso ativo", valor: resumoAcesso.ativos },
                { rotulo: "Revogado", valor: resumoAcesso.revogados },
              ]}
            />
            <p className="text-xs text-navy/55">
              Último acesso: {dataHumana(resumoAcesso.ultimoAcesso, "nenhum acesso registrado")}.
            </p>
          </>
        ) : (
          <Vazio
            cta={
              <Link to="/acessos-portal">
                <Button size="sm">Gerenciar acesso e convite</Button>
              </Link>
            }
          />
        )}
      </Bloco>
      </GradeDesk>

      <Bloco titulo="3. Cobertura do App">
        <Barras titulo="Conteúdo publicado por aba" dados={cobertura} />
        <p className="text-xs text-navy/55">
          Cada aba mostra só o conteúdo já publicado e aprovado para a cliente.
        </p>
      </Bloco>

      <GradeDesk>
      <Bloco titulo="Publicar proposta e contrato no App">
        <p className="mb-3 text-sm text-navy/70">
          A família vê apenas título, número e situação. Valores, cláusulas e observações internas não são publicados.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-navy/10 bg-white/70 p-3">
            <p className="text-sm font-medium text-navy">Proposta</p>
            {proposta ? (
              <>
                <p className="mb-2 text-xs text-navy/65">
                  Versão {proposta.versao ?? 1} · {humano(proposta.status, "sem situação")}
                </p>
                {/*
                  03/10/2026 — decisão da Proprietária lendo o mockup
                  aprovado: a proposta não é cartão do App. A parte que o
                  cliente vê chega à Conta pelo tipo `plano` (Caso 360 ›
                  Formalização → "Publicar plano no App"), sem preço. O botão
                  de publicar proposta saiu daqui porque o servidor passou a
                  recusar — botão que só dá erro é pior que botão ausente.
                */}
                <p className="text-xs text-navy/60">
                  A proposta não vai ao App como cartão. O que o cliente vê é o plano, publicado em Caso 360 ›
                  Formalização — nome, situação e vigência, sem preço.
                </p>
              </>
            ) : (
              <p className="text-xs text-navy/60">Nenhuma proposta registrada neste caso.</p>
            )}
          </div>

          <div className="min-w-0 rounded-xl border border-navy/10 bg-white/70 p-3">
            <p className="text-sm font-medium text-navy">Contrato</p>
            {contrato ? (
              <>
                <p className="mb-2 text-xs text-navy/65">
                  {contrato.numero ?? "sem número"} · {humano(contrato.status, "sem situação")}
                </p>
                {/*
                  Mesma decisão: o contrato não é cartão de conteúdo. O
                  cliente o acessa pelo portal para ASSINATURA, que é outro
                  caminho — não uma projeção publicada.
                */}
                <p className="text-xs text-navy/60">
                  O contrato não vai ao App como cartão. O cliente o acessa pelo portal para assinatura.
                </p>
              </>
            ) : (
              <p className="text-xs text-navy/60">Nenhum contrato registrado neste caso.</p>
            )}
          </div>
        </div>
      </Bloco>

      <Bloco titulo="Publicado para o cliente">
        {publicados.length ? (
          <>
            <ul className="space-y-2 text-sm text-navy">
              {publicados.map((p) => (
                <li key={p.id} className="break-words rounded-xl border border-navy/10 bg-cream/70 p-3">
                  <p className="font-medium">{humano(p.tipo)}</p>
                  {p.resumo ? <p className="text-navy/75">{p.resumo}</p> : null}
                  <p className="mt-1 text-xs text-navy/55">
                    Publicado em {dataHumana(p.em, "data não registrada")}
                    {caso?.identidade.responsavel ? ` · por ${caso.identidade.responsavel}` : ""}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              search={true}
              to="/golive/caso"
              className="text-sm text-navy underline decoration-gold underline-offset-4"
            >
              Publicar ou tirar do ar no Caso 360
            </Link>
          </>
        ) : (
          <Vazio
            cta={
              <Link search={true} to="/golive/caso">
                <Button size="sm">Criar microentrega</Button>
              </Link>
            }
          />
        )}
        <p className="text-xs text-navy/55">Toda publicação guarda autor e data.</p>
      </Bloco>
      </GradeDesk>

      <Bloco titulo="Espelho interno do App">
        <p className="text-sm text-navy/70">
          Veja exatamente o que o cliente enxerga hoje, sem entrar na conta dele.
        </p>
        <Link search={true} to="/golive/app" className="text-sm text-navy underline decoration-gold underline-offset-4">
          Abrir espelho do App Cliente
        </Link>
      </Bloco>
    </GoLiveShell>
  );
}
