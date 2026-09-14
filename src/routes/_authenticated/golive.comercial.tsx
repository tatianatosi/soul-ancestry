import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { Escada } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  registrarCallGoLive,
  registrarDiscoveryGoLive,
  registrarLeadGoLive,
} from "@/lib/golive-escritores.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/comercial")({
  head: () => ({
    meta: [
      { title: "Comercial — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Lead, Mesa de Discovery, call, pessoa, núcleo e caso do piloto canônico em uma leitura só.",
      },
      { property: "og:title", content: "Comercial — Go-live Clube Ancestral" },
      { property: "og:description", content: "Da entrada comercial até o caso aberto, com identidade única." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComercialGoLive,
});

function ComercialGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novoLead = useServerFn(registrarLeadGoLive);
  const discovery = useServerFn(registrarDiscoveryGoLive);
  const call = useServerFn(registrarCallGoLive);
  const leadId = caso?.lead?.id ?? null;

  return (
    <GoLiveShell titulo="Comercial" descricao="Entrada e seguimento até o caso aberto.">
      <FaixaFluxo atual="Lead" />

      <Acoes>
        <Acao
          rotulo="Novo lead"
          titulo="Registrar lead"
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true },
            { nome: "email", rotulo: "E-mail" },
            { nome: "telefone", rotulo: "Telefone" },
            { nome: "origem", rotulo: "Origem" },
            { nome: "objetivo", rotulo: "Objetivo", tipo: "area" },
          ]}
          aoConfirmar={(v) =>
            novoLead({
              data: {
                nome: v["nome"] ?? "",
                email: v["email"] ?? "",
                telefone: v["telefone"] ?? "",
                origem: v["origem"] ?? "",
                objetivo: v["objetivo"] ?? "",
              },
            })
          }
          confirmacao="Lead registrado neste caso."
        />
      </Acoes>

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Bloco titulo="Mesa de Discovery">
          <Vazio
            cta={
              <Link to="/leads">
                <Button size="sm">Novo lead</Button>
              </Link>
            }
          />
          <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
        </Bloco>
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />

          <Bloco titulo="Cadeia comercial">
            <Escada
              etapas={[
                { rotulo: "Lead", feito: Boolean(caso.lead) },
                { rotulo: "Discovery", feito: Boolean(caso.lead?.discoveryResultado) },
                { rotulo: "Call", feito: Boolean(caso.lead?.callRealizada) },
                { rotulo: "Pessoa", feito: Boolean(caso.identidade.pessoaPrincipal) },
                { rotulo: "Núcleo", feito: Boolean(caso.identidade.nucleo) },
                { rotulo: "Caso", feito: true },
              ]}
            />
          </Bloco>

          <Bloco titulo="Mesa de Discovery">
            {caso.lead ? (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Campo rotulo="Lead" valor={caso.lead.nome} />
                <Campo rotulo="Estágio" valor={humano(caso.lead.estagio)} />
                <Campo rotulo="Origem" valor={humano(caso.lead.origem)} />
                <Campo rotulo="Objetivo" valor={caso.lead.objetivo} />
                <Campo rotulo="Call realizada" valor={dataHumana(caso.lead.callRealizada, "Sem call registrada")} />
                <Campo rotulo="Resultado do Discovery" valor={humano(caso.lead.discoveryResultado)} />
              </dl>
            ) : null}
            {leadId ? (
              <Acoes>
                <Acao
                  rotulo="Registrar Discovery"
                  titulo="Resultado da Mesa de Discovery"
                  variante="outline"
                  campos={[
                    {
                      nome: "resultado",
                      rotulo: "Resultado",
                      tipo: "escolha",
                      obrigatorio: true,
                      opcoes: [
                        { valor: "segue_para_proposta", rotulo: "Segue para proposta" },
                        { valor: "em_avaliacao", rotulo: "Em avaliação" },
                        { valor: "nao_elegivel", rotulo: "Não elegível" },
                      ],
                    },
                    { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
                  ]}
                  aoConfirmar={(v) =>
                    discovery({
                      data: { leadId, resultado: v["resultado"] ?? "", resumo: v["resumo"] ?? "" },
                    })
                  }
                  confirmacao="Discovery registrado."
                />
                <Acao
                  rotulo="Registrar call"
                  titulo="Call com a pessoa"
                  variante="outline"
                  campos={[
                    { nome: "ocorridoEm", rotulo: "Data", tipo: "data" },
                    { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
                  ]}
                  aoConfirmar={(v) =>
                    call({
                      data: { leadId, resumo: v["resumo"] ?? "", ocorridoEm: v["ocorridoEm"] ?? "" },
                    })
                  }
                  confirmacao="Call registrada."
                />
              </Acoes>
            ) : (
              <>
                <Vazio
                  cta={
                    <Link to="/leads">
                      <Button size="sm">Novo lead</Button>
                    </Link>
                  }
                />
                <p className="text-xs text-navy/55">
                  Nenhum lead vinculado a este caso — a entrada comercial desta pessoa não ficou registrada.
                </p>
              </>
            )}
          </Bloco>

          <Bloco titulo="Pessoa e núcleo">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Pessoa" valor={caso.identidade.pessoaPrincipal} />
              <Campo rotulo="E-mail" valor={caso.identidade.email} />
              <Campo rotulo="Telefone" valor={caso.identidade.telefone} />
              <Campo rotulo="Núcleo" valor={caso.identidade.nucleo} />
            </dl>
            <Link to="/golive/pessoa" className="text-sm text-navy underline decoration-gold underline-offset-4">
              Ver Pessoa 360
            </Link>
          </Bloco>

          <Bloco titulo="Passagem para a formalização">
            <p className="text-sm text-navy/75">
              A mesma pessoa, o mesmo núcleo e o mesmo caso seguem daqui para proposta, contrato e ordem de serviço.
            </p>
            <Link to="/golive/formalizacao">
              <Button size="sm">Abrir Formalização</Button>
            </Link>
          </Bloco>


          <Bloco titulo="Caso aberto">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Etapa" valor={humano(caso.plano?.fase ?? caso.caso.fase)} />
              <Campo rotulo="Próxima ação" valor={humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao)} />
              <Campo rotulo="Responsável" valor={caso.caso.responsavel} />
              <Campo rotulo="Prazo" valor={caso.plano?.prazo ?? caso.caso.prazo} />
            </dl>
            <Link to="/golive/caso">
              <Button size="sm">Abrir Caso 360</Button>
            </Link>
          </Bloco>
        </>
      ) : null}
    </GoLiveShell>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="break-words text-sm text-navy">{valor ?? "Sem itens nesta etapa"}</dd>
    </div>
  );
}
