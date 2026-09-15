/**
 * Portal / Configuração Master no shell de go-live.
 *
 * Acesso do cliente, equipe/organização, publicação com autor e data e o
 * espelho interno do que o cliente enxerga. Só apresentação: nenhuma
 * publicação é disparada aqui e nenhum dado é criado.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Barras, Rosca } from "@/components/golive/graficos";
import { Button } from "@/components/ui/button";
import { acessoAoPortal, coberturaDoApp, publicacaoPorEstado } from "@/lib/golive-portal";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { despublicarDoAppGoLive, publicarNoAppGoLive } from "@/lib/golive-escritores.functions";
import { criarConvitePortal, registrarEmailAutorizado, validarEmailAutorizado } from "@/lib/portal.functions";

export const Route = createFileRoute("/_authenticated/golive/portal")({
  head: () => ({
    meta: [
      { title: "Portal do cliente — Go-live Clube Ancestral" },
      { name: "description", content: "Acesso do cliente, equipe e conteúdo publicado do caso do piloto." },
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
  const microentregas = caso?.microentregas ?? [];
  const publicar = useServerFn(publicarNoAppGoLive);
  const despublicar = useServerFn(despublicarDoAppGoLive);
  const autorizarEmail = useServerFn(registrarEmailAutorizado);
  const aprovarEmail = useServerFn(validarEmailAutorizado);
  const convidar = useServerFn(criarConvitePortal);

  const clienteId = caso?.identidade.pessoaPrincipalId ?? null;

  // Só contagem do que já está gravado: projeções, acessos e e-mails autorizados.
  const projecoes = caso?.projecoesEstados ?? [];
  const despublicadas = caso?.projecoesDespublicadas ?? [];
  const acessos = caso?.portal.acessos ?? [];
  const emails = caso?.portal.emailsAutorizados ?? [];
  const porEstado = publicacaoPorEstado(projecoes);
  const resumoAcesso = acessoAoPortal(acessos, emails);
  const cobertura = coberturaDoApp(projecoes);

  const acaoConvite = clienteId ? (
    <Acao
      rotulo="Enviar link mágico"
      titulo="Convidar a cliente para o App"
      variante="outline"
      campos={[
        {
          nome: "email",
          rotulo: "E-mail da cliente",
          obrigatorio: true,
          padrao: caso?.identidade.email ?? "",
        },
        {
          nome: "finalidade",
          rotulo: "Finalidade do acesso",
          obrigatorio: true,
          padrao: "Acompanhar o próprio caso no App Cliente.",
        },
      ]}
      aoConfirmar={async (v) => {
        const autorizacao = await autorizarEmail({
          data: {
            clientId: clienteId,
            casoId: caso?.caso.id ?? null,
            email: v["email"] ?? "",
            finalidade: v["finalidade"] ?? "",
            nivel: "client_workspace",
          },
        });
        await aprovarEmail({ data: { id: autorizacao.id, status: "aprovado" } });
        await convidar({
          data: {
            clientId: clienteId,
            autorizacaoId: autorizacao.id,
            nivel: "client_workspace",
            ...(caso?.caso.id ? { casoId: caso.caso.id } : {}),
          },
        });
      }}
      confirmacao="Convite enviado por link mágico para o e-mail autorizado."
    />
  ) : null;

  const acaoPublicar = (
    <Acao
      rotulo="Publicar para a cliente"
      titulo="Conteúdo que a família vai ler"
      variante="outline"
      campos={[
        {
          nome: "microentregaId",
          rotulo: "Microentrega",
          tipo: "escolha",
          obrigatorio: true,
          opcoes: microentregas.map((m) => ({ valor: m.id, rotulo: m.titulo })),
        },
        {
          nome: "resumoSanitizado",
          rotulo: "Texto para a cliente",
          tipo: "area",
          obrigatorio: true,
          ajuda: "Sem nota interna, hipótese como fato, preço técnico ou dado de outro caso.",
        },
      ]}
      aoConfirmar={(v) =>
        publicar({
          data: { microentregaId: v["microentregaId"] ?? "", resumoSanitizado: v["resumoSanitizado"] ?? "" },
        })
      }
      confirmacao="Publicado no App, com autor e data."
    />
  );

  return (
    <GoLiveShell titulo="Portal do cliente" descricao="Acesso, equipe e o que o cliente já enxerga.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? <FaixaIdentidade dados={caso} /> : null}

      <Bloco titulo="Acesso do cliente">
        {caso?.identidade.email ? (
          <div className="space-y-2">
            <p className="break-words text-sm text-navy">
              {caso.identidade.pessoaPrincipal} · {caso.identidade.email}
            </p>
            <Acoes>
              {acaoConvite}
              <Link to="/acessos-portal" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Gerenciar acesso e convite
              </Link>
            </Acoes>
          </div>
        ) : acaoConvite ? (
          <Vazio cta={acaoConvite} />
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
              <Link to="/golive/caso">
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

      <Bloco titulo="3. Cobertura do App">
        <Barras titulo="Conteúdo publicado por aba" dados={cobertura} />
        <p className="text-xs text-navy/55">
          Cada aba mostra só o conteúdo já publicado e aprovado para a cliente.
        </p>
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
              to="/golive/caso"
              className="text-sm text-navy underline decoration-gold underline-offset-4"
            >
              Publicar ou tirar do ar no Caso 360
            </Link>
          </>
        ) : (
          <Vazio
            cta={
              <Link to="/golive/caso">
                <Button size="sm">Criar microentrega</Button>
              </Link>
            }
          />
        )}
        <p className="text-xs text-navy/55">Toda publicação guarda autor e data.</p>
      </Bloco>

      <Bloco titulo="Espelho interno do App">
        <p className="text-sm text-navy/70">
          Veja exatamente o que o cliente enxerga hoje, sem entrar na conta dele.
        </p>
        <Link to="/golive/app" className="text-sm text-navy underline decoration-gold underline-offset-4">
          Abrir espelho do App Cliente
        </Link>
      </Bloco>
    </GoLiveShell>
  );
}
