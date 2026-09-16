/**
 * Formalização no shell de go-live.
 *
 * Fecha a cadeia Proposta → Escopo → Contrato/Anexos → Ordem de serviço →
 * Publicação sem abrir o Desk histórico. Só leitura do motor aprovado
 * (`carregarGoLive`): nada é criado, estimado ou gravado aqui.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaIdentidade } from "@/components/golive/identidade";
import { Escada } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { Button } from "@/components/ui/button";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  adicionarItemEscopoGoLive,
  aprovarEscopoPropostaGoLive,
  criarPlanoOnboardingGoLive,
  enviarContratoParaRevisaoGoLive,
  registrarAssinaturaContratoGoLive,
  registrarOrdemServicoGoLive,
  registrarPropostaCanva,
} from "@/lib/golive-escritores.functions";

export const Route = createFileRoute("/_authenticated/golive/formalizacao")({
  head: () => ({
    meta: [
      { title: "Formalização — Go-live Clube Ancestral" },
      { name: "description", content: "Proposta, escopo, contrato, ordem de serviço e publicação do caso do piloto." },
      { property: "og:title", content: "Formalização — Go-live Clube Ancestral" },
      { property: "og:description", content: "Da proposta aprovada até a publicação para a família." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FormalizacaoGoLive,
});

function moeda(valor: number | null, sigla: string) {
  if (valor === null || valor === undefined) return null;
  try {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: sigla || "BRL" });
  } catch {
    return String(valor);
  }
}

function FormalizacaoGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novaProposta = useServerFn(registrarPropostaCanva);
  const novoEscopo = useServerFn(adicionarItemEscopoGoLive);
  const novaOrdem = useServerFn(registrarOrdemServicoGoLive);
  const novoPlano = useServerFn(criarPlanoOnboardingGoLive);
  const aprovarEscopo = useServerFn(aprovarEscopoPropostaGoLive);
  const contratoRevisao = useServerFn(enviarContratoParaRevisaoGoLive);
  const registrarAssinatura = useServerFn(registrarAssinaturaContratoGoLive);

  const acaoProposta = (
    <Acao
      rotulo="Registrar proposta Canva"
      titulo="Proposta apresentada à família"
      variante="outline"
      campos={[
        { nome: "link", rotulo: "Link da proposta", obrigatorio: true, ajuda: "O link é registrado à mão; nada é buscado no Canva." },
        { nome: "versao", rotulo: "Versão", tipo: "numero", padrao: "1" },
        { nome: "data", rotulo: "Data de envio", tipo: "data" },
        { nome: "escopo", rotulo: "Escopo apresentado", tipo: "area", obrigatorio: true },
        { nome: "partes", rotulo: "Partes" },
        { nome: "entregas", rotulo: "Entregas" },
        { nome: "condicao", rotulo: "Condição comercial" },
        { nome: "valor", rotulo: "Valor (R$)", tipo: "numero" },
      ]}
      aoConfirmar={(v) =>
        novaProposta({
          data: {
            link: v["link"] ?? "",
            versao: Number(v["versao"] ?? 1) || 1,
            data: v["data"] ?? "",
            escopo: v["escopo"] ?? "",
            partes: v["partes"] ?? "",
            entregas: v["entregas"] ?? "",
            condicao: v["condicao"] ?? "",
            valor: v["valor"] ? Number(v["valor"]) : undefined,
          },
        })
      }
      confirmacao="Proposta registrada neste caso."
    />
  );

  const acaoEscopo = (
    <Acao
      rotulo="Lançar item de escopo"
      titulo="Item do escopo contratado"
      variante="outline"
      campos={[
        { nome: "titulo", rotulo: "Item", obrigatorio: true },
        {
          nome: "categoria",
          rotulo: "Tipo",
          tipo: "escolha",
          opcoes: [
            { valor: "contracted_scope", rotulo: "Escopo contratado" },
            { valor: "deliverable", rotulo: "Entrega" },
            { valor: "exclusion", rotulo: "Exclusão" },
            { valor: "customer_obligation", rotulo: "Obrigação do cliente" },
          ],
          padrao: "contracted_scope",
        },
      ]}
      aoConfirmar={(v) =>
        novoEscopo({ data: { titulo: v["titulo"] ?? "", categoria: v["categoria"] ?? "contracted_scope" } })
      }
      confirmacao="Item de escopo registrado."
    />
  );

  const acaoOrdem = (
    <Acao
      rotulo="Abrir ordem de serviço"
      titulo="Ordem de serviço do caso"
      variante="outline"
      campos={[
        { nome: "numero", rotulo: "Número", obrigatorio: true },
        { nome: "resumo", rotulo: "Resumo do serviço", tipo: "area" },
      ]}
      aoConfirmar={(v) => novaOrdem({ data: { numero: v["numero"] ?? "", resumo: v["resumo"] ?? "" } })}
      confirmacao="Ordem de serviço registrada."
    />
  );

  return (
    <GoLiveShell titulo="Formalização" descricao="Proposta, escopo, contrato, ordem de serviço e publicação.">
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />
          <FaixaKpis itens={[
            { rotulo: "Propostas", valor: caso.propostas.length, tom: caso.propostas.length ? "azul" : "cinza", fonte: "Propostas vinculadas ao caso", formula: "Contagem de propostas não arquivadas", periodo: "Histórico do caso" },
            { rotulo: "Itens de escopo", valor: caso.escopo.length, tom: caso.escopo.length ? "azul" : "cinza", fonte: "Escopo aprovado do caso", formula: "Contagem dos itens de escopo registrados", periodo: "Versão atual" },
            { rotulo: "Contratos assinados", valor: caso.contratos.filter((c) => Boolean(c.assinadoEm)).length, tom: caso.contratos.some((c) => Boolean(c.assinadoEm)) ? "verde" : "cinza", fonte: "Contratos vinculados ao caso", formula: "Contratos com data de assinatura", periodo: "Histórico do caso" },
            { rotulo: "Publicados", valor: caso.publicados.length, tom: caso.publicados.length ? "verde" : "cinza", fonte: "Publicações aprovadas do caso", formula: "Contagem das projeções publicadas", periodo: "Estado atual" },
          ]} />

          <Bloco titulo="Cadeia da formalização">
            <Escada
              etapas={[
                { rotulo: "Proposta", feito: caso.propostas.length > 0 },
                { rotulo: "Escopo", feito: caso.escopo.length > 0 },
                { rotulo: "Contrato", feito: caso.caso.contratoAssinado || caso.contratos.length > 0 },
                { rotulo: "Ordem de serviço", feito: caso.ordensServico.length > 0 },
                { rotulo: "Publicação", feito: caso.publicados.length > 0 },
              ]}
            />
          </Bloco>

          <Bloco titulo="1. Proposta">
            {caso.propostas.length ? (
              <ul className="space-y-2 text-sm text-navy">
                {caso.propostas.map((p) => (
                  <li key={p.id} className="break-words">
                    <span className="font-medium">Versão {p.versao ?? 1}</span> — {humano(p.status)}
                    {moeda(p.valor, p.moeda) ? <span className="text-navy/60"> · {moeda(p.valor, p.moeda)}</span> : null}
                    {p.enviadaEm ? <span className="text-navy/55"> · enviada em {dataHumana(p.enviadaEm)}</span> : null}
                    {p.aprovadaEm ? <span className="text-navy/55"> · aprovada em {dataHumana(p.aprovadaEm)}</span> : null}
                    {/* 16/09/2026 — quando a referência é um endereço, vira
                        botão de abrir; nunca inventamos um link que não existe. */}
                    {p.referencia ? (
                      /^https?:\/\//i.test(p.referencia) ? (
                        <a
                          href={p.referencia}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-1 inline-flex rounded-md border border-navy/20 px-2.5 py-1 text-xs font-medium text-navy hover:bg-navy/5"
                        >
                          {p.origem === "canva" ? "Abrir proposta no Canva" : "Abrir proposta"}
                        </a>
                      ) : (
                        <div className="text-xs text-navy/55 break-all">
                          Referência {p.origem === "canva" ? "Canva" : "registrada"}: {p.referencia}
                        </div>
                      )
                    ) : (
                      <div className="text-xs text-[var(--terracota,#9A3A2F)]">
                        Link do Canva não registrado — registre antes de aprovar o escopo.
                      </div>
                    )}
                    {/* Responsável, objetivo e escopo incluído/excluído: só o que está gravado. */}
                    <div className="mt-1 space-y-0.5 text-xs text-navy/70">
                      <div>Responsável: {p.responsavel ?? "não registrado"}</div>
                      <div>Objetivo: {caso.lead?.objetivo ?? "não registrado"}</div>
                      <div>Escopo incluído: {p.escopo ?? "não registrado"}</div>
                      <div>Escopo excluído: {p.exclusoes ?? "não registrado"}</div>
                      {p.validade ? <div>Validade: {dataHumana(p.validade)}</div> : null}
                    </div>
                    {!p.aprovadaEm && p.referencia ? (
                      <Acoes>
                        <Acao
                          rotulo="Aprovar escopo"
                          titulo={`Aprovar escopo da versão ${p.versao ?? 1}`}
                          variante="outline"
                          campos={[{ nome: "observacao", rotulo: "Quem aprovou e como", tipo: "area" }]}
                          aoConfirmar={(v) =>
                            aprovarEscopo({ data: { propostaId: p.id, observacao: v["observacao"] ?? "" } })
                          }
                          confirmacao="Escopo aprovado nesta proposta."
                        />
                      </Acoes>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={acaoProposta} />
            )}
            {caso.propostas.length ? <Acoes>{acaoProposta}</Acoes> : null}
          </Bloco>

          <Bloco titulo="2. Escopo aprovado">
            {caso.escopo.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.escopo.map((i) => (
                  <li key={i.id} className="break-words">
                    {i.titulo}
                    <span className="text-navy/55"> — {humano(i.status)}</span>
                    {i.exigeRevisaoHumana ? (
                      <span className="text-[var(--terracota,#9A3A2F)]"> · revisão humana pendente</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={acaoEscopo} />
            )}
            {caso.escopo.length ? <Acoes>{acaoEscopo}</Acoes> : null}
          </Bloco>

          <Bloco titulo="3. Contrato e anexos">
            {caso.contratos.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.contratos.map((c) => (
                  <li key={c.id} className="break-words">
                    {c.numero ? `${c.numero} — ` : ""}
                    {c.titulo} <span className="text-navy/55">{humano(c.status)}</span>
                    {c.assinadoEm ? <span className="text-navy/55"> · assinado em {dataHumana(c.assinadoEm)}</span> : null}
                    {/* Ato formal da assinatura: referência, forma e data gravadas. */}
                    <div className="mt-1 space-y-0.5 text-xs text-navy/70">
                      <div>Versão: {c.versao ?? "não registrada"}</div>
                      <div>Revisora: {c.revisora ?? "não registrada"}</div>
                      <div>
                        Assinatura:{" "}
                        {c.assinadoEm
                          ? `assinado em ${dataHumana(c.assinadoEm)}${c.assinaturaReferencia ? ` · referência ${c.assinaturaReferencia}` : ""}${c.assinaturaOrigem ? ` · ${humano(c.assinaturaOrigem)}` : ""}`
                          : "não assinado"}
                      </div>
                      {c.pendencias.length ? (
                        <div className="text-[var(--terracota,#9A3A2F)]">
                          Pendências: {c.pendencias.map((p) => humano(p)).join(" · ")}
                        </div>
                      ) : (
                        <div>Sem pendências registradas</div>
                      )}
                    </div>
                    {!c.assinadoEm ? (
                      <Acoes>
                        <Acao
                          rotulo="Enviar para revisão"
                          titulo="Contrato em revisão humana"
                          variante="outline"
                          campos={[{ nome: "observacao", rotulo: "O que precisa ser conferido", tipo: "area" }]}
                          aoConfirmar={(v) =>
                            contratoRevisao({ data: { contratoId: c.id, observacao: v["observacao"] ?? "" } })
                          }
                          confirmacao="Contrato marcado como em revisão."
                        />
                        <Acao
                          rotulo="Registrar assinatura"
                          titulo="Assinatura com ato formal"
                          variante="outline"
                          campos={[
                            {
                              nome: "referencia",
                              rotulo: "Referência do ato formal",
                              obrigatorio: true,
                              ajuda: "Protocolo, documento assinado ou ata. Nada é enviado para assinatura daqui.",
                            },
                            { nome: "assinadoEm", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true },
                            { nome: "forma", rotulo: "Forma da assinatura" },
                          ]}
                          aoConfirmar={(v) =>
                            registrarAssinatura({
                              data: {
                                contratoId: c.id,
                                referencia: v["referencia"] ?? "",
                                assinadoEm: v["assinadoEm"] ?? "",
                                forma: v["forma"] ?? "",
                              },
                            })
                          }
                          confirmacao="Assinatura registrada no contrato."
                        />
                      </Acoes>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/contratos"><Button size="sm">Preparar contrato</Button></Link>} />
            )}
          </Bloco>

          <Bloco titulo="4. Ordem de serviço">
            {caso.ordensServico.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.ordensServico.map((o) => (
                  <li key={o.id} className="break-words">
                    {o.numero ?? "Ordem de serviço"} — {humano(o.status)}
                    {o.resumo ? <span className="text-navy/60"> · {o.resumo}</span> : null}
                    {o.inicio ? <span className="text-navy/55"> · início {dataHumana(o.inicio)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={acaoOrdem} />
            )}
            {caso.ordensServico.length ? <Acoes>{acaoOrdem}</Acoes> : null}
          </Bloco>

          <Bloco titulo="5. Onboarding D0–D14">
            {caso.plano ? (
              <p className="text-sm text-navy">
                {humano(caso.plano.fase)} · próxima ação: {humano(caso.plano.proximaAcao)}
                {caso.plano.prazo ? <span className="text-navy/55"> · prazo {dataHumana(caso.plano.prazo)}</span> : null}
              </p>
            ) : (
              <Vazio
                cta={
                  <Acao
                    rotulo="Iniciar onboarding"
                    titulo="Plano D0–D14"
                    variante="outline"
                    campos={[{ nome: "proximaAcao", rotulo: "Próxima ação", padrao: "Confirmar documentos do titular" }]}
                    aoConfirmar={(v) => novoPlano({ data: { proximaAcao: v["proximaAcao"] ?? "" } })}
                    confirmacao="Onboarding iniciado."
                  />
                }
              />
            )}
          </Bloco>

          <Bloco titulo="6. Publicação para a família">
            {caso.publicados.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.publicados.map((p) => (
                  <li key={p.id} className="break-words">
                    {p.resumo ?? humano(p.tipo)}
                    {p.em ? <span className="text-navy/55"> · publicado em {dataHumana(p.em)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio cta={<Link to="/golive/portal"><Button size="sm">Abrir Portal</Button></Link>} />
            )}
          </Bloco>
        </>
      ) : null}

      {data && !data.encontrado ? (
        <Bloco titulo="Formalização">
          <Vazio cta={<Link to="/golive/caso"><Button size="sm">Abrir Caso 360</Button></Link>} />
        </Bloco>
      ) : null}
    </GoLiveShell>
  );
}
