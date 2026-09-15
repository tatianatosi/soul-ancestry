/**
 * Espelho interno do App Cliente.
 *
 * Sete abas exatas do mockup. Só apresentação do que já está publicado ou
 * liberado para a família: nada é criado, estimado nem deduzido. Radar de seis
 * dimensões e gerações da árvore continuam vazios porque ainda não existem
 * como dado publicado.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { LinhaDoTempo, Rosca } from "@/components/golive/graficos";
import { useGoLive } from "@/components/golive/dados";
import { contarPor } from "@/lib/golive-analitico";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/app")({
  head: () => ({
    meta: [
      { title: "App Cliente — Go-live Clube Ancestral" },
      { name: "description", content: "Prévia do App Cliente com Home, Jornada, Documentos e Legado publicados." },
      { property: "og:title", content: "App Cliente — Go-live Clube Ancestral" },
      { property: "og:description", content: "Prévia do App Cliente com conteúdos publicados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppClienteGoLive,
});

const ABAS = ["Home", "Jornada", "Radar", "Árvore", "Documentos", "Legado", "Conta"] as const;

const Aguardando = <Button size="sm" variant="outline" disabled>Aguardando publicação da equipe</Button>;

function AppClienteGoLive() {
  const { data, isPending } = useGoLive();
  const [aba, setAba] = useState<(typeof ABAS)[number]>("Home");
  const caso = data?.encontrado ? data : null;
  const publicados = caso?.publicados ?? [];
  const documentos = caso?.documentos ?? [];
  const documentosLiberados = documentos.filter((d) => d.liberadoCliente);
  const achadosAprovados = (caso?.achados ?? []).filter((a) => a.publicavel);
  const acessos = caso?.portal.acessos ?? [];
  const emailsAutorizados = caso?.portal.emailsAutorizados ?? [];

  const ultima = publicados.find((p) => p.em) ?? publicados[0] ?? null;
  const documentosPorSituacao = contarPor(documentosLiberados, (d) => humano(d.status, ""), "Sem situação");
  const linhaPublicacoes = publicados
    .filter((p) => p.em)
    .map((p) => ({
      id: p.id,
      titulo: p.resumo ?? humano(p.tipo),
      quando: dataHumana(p.em, "data não registrada"),
    }));

  return (
    <GoLiveShell titulo="App Cliente" descricao="Somente o que foi publicado para a cliente.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}

      <div className="flex flex-wrap gap-2">
        {ABAS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setAba(item)}
            aria-current={aba === item}
            className={`rounded-full px-3 py-1.5 text-sm ${aba === item ? "bg-navy text-cream" : "border border-navy/15 text-navy/70"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {aba === "Home" ? (
        <Bloco titulo="Sua jornada">
          {publicados.length || caso?.plano ? (
            <div className="space-y-2 text-sm text-navy">
              {caso?.caso.fase ? <p>Etapa atual: {humano(caso.caso.fase)}</p> : null}
              {caso?.plano?.proximaAcao ? (
                <p className="text-navy/70">Próximo passo: {caso.plano.proximaAcao}</p>
              ) : null}
              {ultima ? (
                <p className="break-words rounded-xl border border-navy/10 bg-cream/70 p-3">
                  {ultima.resumo ?? humano(ultima.tipo)}
                  <span className="block text-xs text-navy/55">
                    Última atualização em {dataHumana(ultima.em, "data não registrada")}
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <Vazio cta={Aguardando} />
          )}
        </Bloco>
      ) : null}

      {aba === "Jornada" ? (
        <>
          <Bloco titulo="Marcos da sua jornada">
            {caso?.plano?.marco || caso?.caso.fase ? (
              <div className="space-y-1 text-sm text-navy">
                {caso?.caso.fase ? <p>Etapa: {humano(caso.caso.fase)}</p> : null}
                {caso?.plano?.marco ? <p className="text-navy/70">Marco atual: {caso.plano.marco}</p> : null}
              </div>
            ) : (
              <Vazio cta={Aguardando} />
            )}
          </Bloco>
          <Bloco titulo="Atualizações publicadas">
            {linhaPublicacoes.length ? (
              <LinhaDoTempo itens={linhaPublicacoes} />
            ) : publicados.length ? (
              <ul className="space-y-2 text-sm text-navy">
                {publicados.map((p) => (
                  <li key={p.id} className="break-words rounded-xl border border-navy/10 bg-white p-3">
                    {p.resumo ?? humano(p.tipo)}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={Aguardando} />
            )}
          </Bloco>
        </>
      ) : null}

      {aba === "Radar" ? (
        <Bloco titulo="Sua etapa atual">
          {caso?.caso.fase ? (
            <div className="space-y-1 text-sm text-navy">
              <p>Etapa: {humano(caso.caso.fase)}</p>
              {caso.plano?.marco ? <p className="text-navy/70">Marco: {caso.plano.marco}</p> : null}
            </div>
          ) : (
            <Vazio cta={Aguardando} />
          )}
        </Bloco>
      ) : null}

      {aba === "Árvore" ? (
        <Bloco titulo="Sua família">
          {caso?.identidade.nucleoMembros.length ? (
            <ul className="space-y-1 text-sm text-navy">
              {caso.identidade.nucleoMembros.map((m) => (
                <li key={m.id} className="break-words">
                  {m.nome}
                  {m.papel ? <span className="text-navy/50"> — {humano(m.papel)}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <Vazio cta={Aguardando} />
          )}
        </Bloco>
      ) : null}

      {aba === "Documentos" ? (
        <>
          {documentosLiberados.length ? (
            <Bloco titulo="Situação dos seus documentos">
              <Rosca titulo="Situação dos seus documentos" dados={documentosPorSituacao} />
            </Bloco>
          ) : null}
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
          </Bloco>
        </>
      ) : null}

      {aba === "Legado" ? (
        <Bloco titulo="Memória da família">
          {achadosAprovados.length || publicados.length ? (
            <ul className="space-y-1 text-sm text-navy">
              {achadosAprovados.map((a) => (
                <li key={a.id} className="break-words">
                  {a.titulo}
                </li>
              ))}
              {publicados.map((p) => (
                <li key={p.id} className="break-words text-navy/75">
                  {p.resumo ?? humano(p.tipo)}
                </li>
              ))}
            </ul>
          ) : (
            <Vazio cta={Aguardando} />
          )}
        </Bloco>
      ) : null}

      {aba === "Conta" ? (
        <Bloco titulo="Seus dados">
          {caso?.identidade.pessoaPrincipal ? (
            <div className="space-y-2 text-sm text-navy">
              <p>{caso.identidade.pessoaPrincipal}</p>
              {caso.identidade.email ? <p className="break-words text-navy/70">{caso.identidade.email}</p> : null}
              {caso.identidade.telefone ? <p className="text-navy/70">{caso.identidade.telefone}</p> : null}
              {acessos.length ? (
                <p className="text-navy/70">
                  Acesso ao App: {humano(acessos[0]?.situacao, "sem situação registrada")}
                  {acessos[0]?.ultimoAcesso ? ` · última entrada em ${dataHumana(acessos[0].ultimoAcesso)}` : ""}
                </p>
              ) : null}
              {emailsAutorizados.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-navy/50">Pessoas autorizadas</p>
                  <ul className="space-y-1 text-navy/75">
                    {emailsAutorizados.map((e) => (
                      <li key={e.id} className="break-words">
                        {e.email} <span className="text-navy/55">· {humano(e.status, "sem situação")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <Vazio cta={<Button size="sm" variant="outline" disabled>Aguardando cadastro da equipe</Button>} />
          )}
        </Bloco>
      ) : null}
    </GoLiveShell>
  );
}
