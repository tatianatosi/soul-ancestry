/**
 * Espelho interno do App Cliente — sete abas exatas do mockup.
 *
 * Só mostra o que a equipe já aprovou ou publicou para o titular deste caso.
 * Nada de dado interno do Desk, preço, catálogo, nota de bastidor ou promessa.
 * Sem publicação, a aba mostra o estado vazio canônico.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, FileText, Home, Radar, Route as RouteIcon, Trees, UserRound } from "lucide-react";

import { Bloco, Vazio } from "@/components/golive/shell";
import { BrandLogo } from "@/components/brand";
import { Barras, BarrasPercentual, Linha, LinhaDoTempo } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import {
  ABAS_APP,
  contratoParaFamilia,
  familiaParaApp,
  financeiroParaFamilia,
  marcosPublicados,
  parcelasEmFatias,
  parcelasPorVencimento,
  publicacoesDaAba,
  publicacoesPorAba,
  publicacoesPorMes,
  radarDoApp,
  radarSemConteudo,
  situacaoDocumentos,
  ultimaPublicacao,
  type AbaApp,
} from "@/lib/golive-app";
import { RadarSeisEixos } from "@/components/portal/radar-seis-eixos";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/app")({
  head: () => ({
    meta: [
      { title: "App Cliente — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Espelho das sete abas do App Cliente com o conteúdo já publicado para a família.",
      },
      { property: "og:title", content: "App Cliente — Go-live Clube Ancestral" },
      { property: "og:description", content: "Sete abas com o conteúdo publicado para a família." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppClienteGoLive,
});

const Aguardando = (
  <Button size="sm" variant="outline" disabled>
    Aguardando publicação da equipe
  </Button>
);

const ICONES_APP = {
  Home,
  Jornada: RouteIcon,
  Radar,
  Árvore: Trees,
  Documentos: FileText,
  Legado: BookOpen,
  Conta: UserRound,
} satisfies Record<AbaApp, typeof Home>;

const ABERTURA_APP: Record<AbaApp, { titulo: string; descricao: string }> = {
  Home: { titulo: "Sua jornada", descricao: "Acompanhe o que já foi publicado e o que vem a seguir." },
  Jornada: { titulo: "Jornada", descricao: "Linha do tempo do seu acompanhamento." },
  Radar: { titulo: "Radar Ancestral", descricao: "Uma leitura simples das seis dimensões da sua jornada." },
  Árvore: { titulo: "Árvore", descricao: "Gerações e conexões liberadas para a família." },
  Documentos: { titulo: "Documentos", descricao: "Pedidos, recebimentos e materiais liberados em um só lugar." },
  Legado: { titulo: "Legado", descricao: "Conteúdos publicados para preservar e compartilhar em família." },
  Conta: { titulo: "Conta", descricao: "Seu perfil, acompanhamento e histórico disponível." },
};

/** CTA de navegação do espelho interno: leva à superfície do Desk que trata o assunto. */
function IrPara({ para, rotulo }: { para: string; rotulo: string }) {
  return (
    <Link to={para}>
      <Button size="sm" variant="outline">
        {rotulo}
      </Button>
    </Link>
  );
}

/** Cartão curto de um conteúdo já publicado. */
function Publicado({ titulo, quando }: { titulo: string; quando?: string | null }) {
  return (
    <li className="break-words rounded-xl border border-navy/10 bg-white p-3 text-sm text-navy">
      {titulo}
      <span className="mt-1 block text-xs text-navy/55">
        Publicado em {dataHumana(quando ?? null, "data não registrada")}
      </span>
    </li>
  );
}

function AppClienteGoLive() {
  const { data, isPending } = useGoLive();
  const [aba, setAba] = useState<AbaApp>("Home");
  const caso = data?.encontrado ? data : null;

  const publicados = caso?.publicados ?? [];
  const ultima = ultimaPublicacao(publicados);
  const jornada = publicacoesDaAba(publicados, "Jornada");
  const arvore = publicacoesDaAba(publicados, "Árvore");
  const legado = publicacoesDaAba(publicados, "Legado");
  const documentosPublicados = publicacoesDaAba(publicados, "Documentos");
  const marcos = marcosPublicados(publicados);
  /** Proposta e contrato só aparecem quando a equipe publica a projeção. */
  const instrumentosPublicados = publicados.filter(
    (p) => p.tipo === "contrato" || p.tipo === "proposta",
  );

  const documentosLiberados = (caso?.documentos ?? []).filter((d) => d.liberadoCliente);
  const situacao = situacaoDocumentos(documentosLiberados);
  const acesso = caso?.portal.acessos[0] ?? null;

  /* Radar das seis dimensões: só publicações e documentos já liberados. */
  const radar = radarDoApp(publicados, caso?.documentos ?? []);
  const radarVazio = radarSemConteudo(radar);
  const titularId = caso?.identidade?.pessoaPrincipalId ?? null;
  const contrato = contratoParaFamilia(caso?.contratos ?? [], titularId);
  const financeiro = financeiroParaFamilia(caso?.faturas ?? [], titularId);
  /* Papéis da família, já traduzidos e sem vocabulário interno. */
  const familia = familiaParaApp(
    caso?.identidade?.nucleoMembros ?? [],
    caso?.identidade?.pessoaPrincipal ?? null,
  );

  const Familia = (
    <Bloco titulo="Quem faz parte do estudo">
      {familia.length ? (
        <ul className="space-y-1 text-sm text-navy">
          {familia.map((p) => (
            <li key={p.id} className="break-words">
              {p.nome} <span className="text-navy/55">· {p.papel}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando cadastro da equipe</Button>} />
      )}
    </Bloco>
  );

  return (
    <div className="min-h-dvh overflow-x-hidden bg-cream text-navy" data-app-cliente="true">
      <header className="bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:px-8">
          <BrandLogo size={32} variant="client-dark" showText={false} />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gold/80">Clube Ancestral</p>
            <h1 className="truncate font-serif text-lg leading-tight text-cream">App Cliente</h1>
          </div>
        </div>
        <div className="h-0.5 bg-gold" aria-hidden="true" />
      </header>
      <div className="mx-auto grid w-full max-w-6xl min-w-0 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-6 lg:px-8">
        <aside className="hidden lg:block">
          <nav aria-label="Abas do App Cliente" className="sticky top-0 min-h-[calc(100vh-57px)] rounded-b-2xl bg-navy px-3 py-5">
            <div className="space-y-1">
              {ABAS_APP.map((item) => {
                const Icon = ICONES_APP[item];
                return (
                  <Button
                    key={item}
                    type="button"
                    variant="ghost"
                    onClick={() => setAba(item)}
                    aria-current={aba === item}
                    className={`w-full justify-start gap-2.5 px-3 py-2.5 text-sm ${
                      aba === item ? "bg-gold text-navy hover:bg-gold/90" : "text-cream/75 hover:bg-cream/10 hover:text-cream"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item}</span>
                  </Button>
                );
              })}
            </div>
          </nav>
        </aside>
        <main className="min-w-0 space-y-5 px-4 pb-24 pt-6 lg:px-0 lg:pb-12">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      <div>
        <h1 className="font-serif text-2xl font-semibold leading-tight text-navy">{ABERTURA_APP[aba].titulo}</h1>
        <p className="mt-1 text-sm text-navy/70">{ABERTURA_APP[aba].descricao}</p>
      </div>

      <div className="space-y-4">
        {aba === "Home" ? (
          <>
            <Bloco titulo="Sua etapa">
              {caso?.caso.fase ? (
                <p className="text-sm text-navy">{humano(caso.caso.fase)}</p>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Próximo passo">
              {jornada[0]?.resumo ? (
                <p className="break-words text-sm text-navy">{jornada[0].resumo}</p>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Última entrega">
              {ultima ? (
                <ul className="space-y-2">
                  <Publicado titulo={ultima.resumo ?? humano(ultima.tipo)} quando={ultima.em} />
                </ul>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Conteúdo publicado para você">
              {publicados.length ? (
                <>
                  <Barras titulo="Conteúdo publicado para você" dados={publicacoesPorAba(publicados)} />
                  {/* Resumo só com o que já foi aprovado e publicado para a família. */}
                  <ul className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-navy/70">
                    <li className="rounded-xl bg-white/70 p-2">
                      <strong className="block text-base text-navy">{marcos.length}</strong>
                      marcos
                    </li>
                    <li className="rounded-xl bg-white/70 p-2">
                      <strong className="block text-base text-navy">{situacao.liberados}</strong>
                      documentos
                    </li>
                    <li className="rounded-xl bg-white/70 p-2">
                      <strong className="block text-base text-navy">{publicados.length}</strong>
                      publicações
                    </li>
                  </ul>
                  {publicacoesPorMes(publicados).length > 1 ? (
                    <Linha titulo="Entregas por mês" dados={publicacoesPorMes(publicados)} />
                  ) : null}
                </>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
          </>
        ) : null}

        {aba === "Jornada" ? (
          <>
            <Bloco titulo="Seus marcos">
              {marcos.length ? (
                <ol className="space-y-2 text-sm">
                  {marcos.map((m) => (
                    <li key={m.id} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          m.atual ? "bg-gold" : "bg-navy/30"
                        }`}
                      />
                      <span className="min-w-0 break-words text-navy">
                        {m.titulo}
                        <span className="block text-xs text-navy/55">
                          {m.atual ? "Etapa atual · " : ""}
                          {dataHumana(m.quando, "data não registrada")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Linha do tempo">
              {jornada.length ? (
                <LinhaDoTempo
                  itens={jornada.map((p) => ({
                    id: p.id,
                    titulo: p.resumo ?? humano(p.tipo),
                    quando: dataHumana(p.em ?? null, "data não registrada"),
                  }))}
                />
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Publicações por mês">
              {publicacoesPorMes(publicados).length ? (
                <Linha titulo="Publicações por mês" dados={publicacoesPorMes(publicados)} />
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
            <Bloco titulo="Próxima atualização">
              {jornada[0] ? (
                <p className="break-words text-sm text-navy">
                  {jornada[0].resumo ?? humano(jornada[0].tipo)}
                </p>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
          </>
        ) : null}

        {aba === "Radar" ? (
          <Bloco titulo="Seu radar">
            {radarVazio ? (
              <>
                <Vazio cta={Aguardando} />
                <p className="text-xs text-navy/55">
                  As seis dimensões ganham forma assim que a equipe publicar conteúdo e liberar
                  documentos do seu caso.
                </p>
              </>
            ) : (
              <>
                <RadarSeisEixos dimensoes={radar} />
                <ul className="mt-3 space-y-2 text-sm text-navy">
                  {radar.map((d) => (
                    <li key={d.id} className="break-words rounded-xl bg-white/70 p-3">
                      <span className="font-medium">{d.titulo}</span>{" "}
                      <span className="text-navy/70">· {d.rotuloNumero}</span>
                      <span className="mt-1 block text-xs text-navy/55">{d.legenda}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Bloco>
        ) : null}

        {aba === "Árvore" ? (
          <>
            {Familia}
            <Bloco titulo="Sua árvore">
              {arvore.length ? (
                <ul className="space-y-2">
                  {arvore.map((p) => (
                    <Publicado key={p.id} titulo={p.resumo ?? humano(p.tipo)} quando={p.em} />
                  ))}
                </ul>
              ) : (
                <Vazio cta={Aguardando} />
              )}
              <p className="mt-2 text-xs text-navy/55">
                Pessoas e vínculos entram na árvore só depois de confirmados e publicados pela equipe.
              </p>
            </Bloco>
          </>
        ) : null}

        {aba === "Documentos" ? (
          <>
            {Familia}
            <Bloco titulo="Situação dos seus documentos">
              {documentosLiberados.length ? (
                <BarrasPercentual
                  titulo="Situação dos seus documentos"
                  dados={[
                    { rotulo: "Solicitados", valor: situacao.solicitados },
                    { rotulo: "Em conferência", valor: situacao.emRevisao },
                    { rotulo: "Liberados", valor: situacao.liberados },
                  ]}
                />
              ) : (
                <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando liberação da equipe</Button>} />
              )}
            </Bloco>
            <Bloco titulo="Documentos disponíveis">
              {documentosLiberados.length ? (
                <ul className="space-y-1 text-sm text-navy">
                  {documentosLiberados.map((d) => (
                    <li key={d.id} className="break-words">
                      {d.titulo} <span className="text-navy/55">· {humano(d.status, "sem situação")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando liberação da equipe</Button>} />
              )}
              <p className="mt-2 text-xs text-navy/55">
                Só aparece aqui o documento que a equipe já liberou para você.
              </p>
            </Bloco>
            <Bloco titulo="Entregas publicadas">
              {documentosPublicados.length ? (
                <ul className="space-y-2">
                  {documentosPublicados.map((p) => (
                    <Publicado key={p.id} titulo={p.resumo ?? humano(p.tipo)} quando={p.em} />
                  ))}
                </ul>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
          </>
        ) : null}

        {aba === "Legado" ? (
          <>
            {Familia}
            <Bloco titulo="Descobertas da família">
              {legado.length ? (
                <ul className="space-y-2">
                  {legado.map((p) => (
                    <Publicado key={p.id} titulo={p.resumo ?? humano(p.tipo)} quando={p.em} />
                  ))}
                </ul>
              ) : (
                <Vazio cta={Aguardando} />
              )}
              <p className="mt-2 text-xs text-navy/55">
                Cada descoberta chega aqui depois de conferida e publicada pela equipe.
              </p>
            </Bloco>
            <Bloco titulo="Publicado recentemente">
              {ultima ? (
                <ul className="space-y-2">
                  <Publicado titulo={ultima.resumo ?? humano(ultima.tipo)} quando={ultima.em} />
                </ul>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
          </>
        ) : null}

        {aba === "Conta" ? (
          <>
            {Familia}
            <Bloco titulo="Seus dados">
              {caso?.identidade.pessoaPrincipal ? (
                <div className="space-y-1 text-sm text-navy">
                  <p className="break-words">{caso.identidade.pessoaPrincipal}</p>
                  {caso.identidade.email ? (
                    <p className="break-words text-navy/70">{caso.identidade.email}</p>
                  ) : null}
                  {caso.identidade.telefone ? (
                    <p className="text-navy/70">{caso.identidade.telefone}</p>
                  ) : null}
                </div>
              ) : (
                <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando cadastro da equipe</Button>} />
              )}
            </Bloco>
            <Bloco titulo="Proposta e contrato publicados">
              {instrumentosPublicados.length ? (
                <ul className="space-y-2 text-sm text-navy">
                  {instrumentosPublicados.map((p) => {
                    const partes = (p.resumo ?? "").split("·").map((t) => t.trim()).filter(Boolean);
                    return (
                      <li key={p.id} className="break-words rounded-xl border border-navy/10 bg-cream/70 p-3">
                        <p className="font-medium">{partes[0] ?? humano(p.tipo)}</p>
                        <p className="text-xs text-navy/65">
                          {partes[1] ? `${partes[1]} · ` : ""}
                          {humano(partes[2] ?? "", "sem situação registrada")}
                        </p>
                        {partes.slice(3).map((linha) => (
                          <p key={linha} className="mt-1 break-words text-xs text-navy/70">
                            {linha}
                          </p>
                        ))}
                        <p className="mt-1 text-xs text-navy/55">
                          Publicado em {dataHumana(p.em, "data não registrada")}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando liberação da equipe</Button>} />
              )}
            </Bloco>
            <Bloco titulo="Seu contrato e pagamentos">
              {contrato || acesso || financeiro.parcelas.length > 0 ? (
                <div className="space-y-1 text-sm text-navy">
                  {contrato ? (
                    <p className="break-words">
                      {contrato.titulo}
                      {contrato.numero ? ` · ${contrato.numero}` : ""}
                      <span className="block text-xs text-navy/55">
                        {contrato.assinadoEm
                          ? `Assinado em ${dataHumana(contrato.assinadoEm)}`
                          : humano(contrato.status, "sem situação registrada")}
                      </span>
                    </p>
                  ) : (
                    <p className="text-navy/70">Contrato ainda não registrado para esta família.</p>
                  )}
                  {financeiro.parcelas.length > 0 ? (
                    <>
                      <p className="text-navy/70">
                        Parcelas: {financeiro.pagas} paga(s) · {financeiro.emAberto} em aberto
                        {financeiro.proxima?.vencimento
                          ? ` · próxima em ${dataHumana(financeiro.proxima.vencimento)}`
                          : ""}
                      </p>
                      <ul className="space-y-1">
                        {financeiro.parcelas.map((p) => (
                          <li key={p.id} className="break-words text-navy/70">
                            {p.numero ? `Parcela ${p.numero}` : "Parcela"} ·{" "}
                            {p.vencimento ? `vence em ${dataHumana(p.vencimento)}` : "sem vencimento registrado"} ·{" "}
                            {p.pagaEm ? `paga em ${dataHumana(p.pagaEm)}` : humano(p.status, "em aberto")}
                          </li>
                        ))}
                      </ul>
                      <BarrasPercentual titulo="Suas parcelas" dados={parcelasEmFatias(financeiro)} />
                      {parcelasPorVencimento(financeiro).length ? (
                        <Barras titulo="Parcelas por mês de vencimento" dados={parcelasPorVencimento(financeiro)} />
                      ) : null}
                    </>

                  ) : (
                    <p className="text-navy/70">Nenhuma parcela emitida para esta família.</p>
                  )}
                  {acesso ? (
                    <p className="text-navy/70">
                      Acesso ao App: {humano(acesso.situacao, "sem situação registrada")}
                      {acesso.ultimoAcesso
                        ? ` · última entrada em ${dataHumana(acesso.ultimoAcesso)}`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-navy/70">Convite do App ainda não enviado.</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <IrPara para="/portal/proposta" rotulo="Ver proposta e escopo" />
                  </div>
                </div>
              ) : (
                <Vazio
                  cta={
                    <div className="flex flex-wrap gap-2">
                      <IrPara para="/portal/proposta" rotulo="Ver proposta e escopo" />
                    </div>
                  }
                />
              )}
            </Bloco>
            <Bloco titulo="Avisos">
              {ultima ? (
                <p className="break-words text-sm text-navy">
                  Última novidade em {dataHumana(ultima.em ?? null, "data não registrada")}.
                </p>
              ) : (
                <Vazio cta={Aguardando} />
              )}
            </Bloco>
          </>
        ) : null}
      </div>

        </main>
      </div>
      <nav aria-label="Abas do App Cliente" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-7 px-1 pb-[env(safe-area-inset-bottom)]">
          {ABAS_APP.map((item) => {
            const Icon = ICONES_APP[item];
            return (
              <Button
                key={item}
                type="button"
                variant="ghost"
                onClick={() => setAba(item)}
                aria-current={aba === item}
                className={`h-auto min-w-0 flex-col gap-0.5 rounded-none px-0.5 py-2 text-[8px] leading-tight ${
                  aba === item ? "font-semibold text-gold hover:text-gold" : "text-navy/65 hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="w-full text-center">{item}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
