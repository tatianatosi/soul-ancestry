/**
 * Espelho interno do App Cliente — sete abas exatas do mockup.
 *
 * Só mostra o que a equipe já aprovou ou publicou para o titular deste caso.
 * Nada de dado interno do Desk, preço, catálogo, nota de bastidor ou promessa.
 * Sem publicação, a aba mostra o estado vazio canônico.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Barras, BarrasPercentual, Linha, LinhaDoTempo } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import {
  ABAS_APP,
  achadosParaFamilia,
  contratoParaFamilia,
  financeiroParaFamilia,
  evidenciasParaFamilia,
  fontesParaFamilia,
  fontesPorInstituicao,
  marcosPublicados,
  parcelasEmFatias,
  parcelasPorVencimento,
  publicacoesDaAba,
  publicacoesPorAba,
  publicacoesPorMes,
  situacaoDocumentos,
  ultimaPublicacao,
  type AbaApp,
} from "@/lib/golive-app";
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

  /* Pesquisa e Jurídico já gravados, filtrados para o que a família pode ver. */
  const evidenciasFamilia = evidenciasParaFamilia(caso?.evidencias ?? []);
  const fontesFamilia = fontesParaFamilia(caso?.fontes ?? []);
  const achadosFamilia = achadosParaFamilia(caso?.achados ?? []);
  const titularId = caso?.identidade?.pessoaPrincipalId ?? null;
  const contrato = contratoParaFamilia(caso?.contratos ?? [], titularId);
  const financeiro = financeiroParaFamilia(caso?.faturas ?? [], titularId);

  return (
    <GoLiveShell titulo="App Cliente" descricao="Somente o que já foi publicado para a família.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      {/* Abas do topo no desktop; no celular a navegação fica fixa embaixo. */}
      <div className="hidden flex-wrap gap-2 sm:flex">
        {ABAS_APP.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAba(item)}
            aria-current={aba === item}
            className={`rounded-full px-3 py-1.5 text-sm ${
              aba === item ? "bg-navy text-cream" : "border border-navy/15 text-navy/70"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4 pb-24 sm:pb-0">
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

      {/* Navegação inferior do celular: sete abas, rolagem só dentro da barra. */}
      <nav
        aria-label="Abas do App Cliente"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-cream/95 backdrop-blur sm:hidden"
      >
        <ul className="flex w-full">
          {ABAS_APP.map((item) => (
            <li key={item} className="flex-1">
              <button
                type="button"
                onClick={() => setAba(item)}
                aria-current={aba === item}
                className={`w-full truncate px-1 py-3 text-[10px] ${
                  aba === item ? "font-semibold text-navy" : "text-navy/55"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </GoLiveShell>
  );
}
