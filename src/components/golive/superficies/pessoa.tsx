import { SuperficieGoLive } from "@/components/golive/superficie";
import { Link } from "@tanstack/react-router";

import { Bloco, FaixaKpis, Vazio } from "@/components/golive/shell";
import { FaixaFluxo, FaixaIdentidade } from "@/components/golive/identidade";
import { useGoLive } from "@/components/golive/dados";
import { BarrasPercentual, Estrelas, Rede } from "@/components/golive/graficos";
import {
  completudePorDominio,
  confiancaDaPessoa,
  pessoaPrincipalDoCaso,
  pessoasDoNucleo,
  relacoesAprovadas,
} from "@/lib/golive-pessoas";
import { humano } from "@/lib/rotulos-golive";
import { Button } from "@/components/ui/button";


export function PessoaGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  const papelNoNucleo =
    caso?.identidade.nucleoMembros.find((m) => m.nome === caso.identidade.pessoaPrincipal)?.papel ?? null;

  /* Fonte: case_members do caso canônico, consent_records do mesmo caso.
     Vínculo só existe se pai_id/mae_id estiverem gravados. */
  const pessoas = caso?.pessoas.length
    ? caso.pessoas
    : pessoasDoNucleo(caso?.identidade.nucleoMembros ?? [], {
        nome: caso?.identidade.pessoaPrincipal ?? null,
        email: caso?.identidade.email ?? null,
        telefone: caso?.identidade.telefone ?? null,
      });
  const principal = pessoaPrincipalDoCaso(pessoas);
  const completude = completudePorDominio(principal, caso?.consentimentos ?? []);
  const confianca = confiancaDaPessoa(principal, pessoas, caso?.consentimentos ?? []);
  const relacoes = relacoesAprovadas(pessoas).filter(
    (r) => !principal || r.de === principal.nome || r.para === principal.nome,
  );
  const completudeMedia = completude.length
    ? Math.round(completude.reduce((total, item) => total + item.valor, 0) / completude.length)
    : 0;

  return (
    <SuperficieGoLive titulo="Pessoa 360" descricao="A mesma pessoa, em uma leitura só.">
      <FaixaFluxo atual="Pessoa" />
      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}
      {data && !data.encontrado ? (
        <Bloco titulo="Pessoa">
          <Vazio
            cta={
              <Link to="/clientes">
                <Button size="sm">Buscar pessoa</Button>
              </Link>
            }
          />
          <p className="text-xs text-navy/55">Nenhuma pessoa selecionada.</p>
        </Bloco>
      ) : null}

      {caso ? (
        <>
          <FaixaIdentidade dados={caso} />
          <FaixaKpis itens={[
            { rotulo: "Completude", valor: `${completudeMedia}%`, tom: completudeMedia === 100 ? "verde" : completudeMedia ? "azul" : "cinza", fonte: "Cadastro e consentimentos da pessoa", formula: "Média da completude dos domínios cadastrados", periodo: "Estado atual" },
            { rotulo: "Confiança", valor: confianca ? `${confianca.estrelas}/5` : "Sem registros", tom: confianca ? "dourado" : "cinza", fonte: "Vínculos e consentimentos registrados", formula: "Faixa de confiança calculada pelo motor de pessoas", periodo: "Estado atual" },
            { rotulo: "Relações aprovadas", valor: relacoes.length, tom: relacoes.length ? "verde" : "cinza", fonte: "Relações explícitas da pessoa", formula: "Contagem de vínculos aprovados envolvendo a pessoa", periodo: "Estado atual" },
            { rotulo: "Documentos", valor: caso.documentos.length, tom: caso.documentos.length ? "azul" : "cinza", fonte: "Documentos vinculados ao caso", formula: "Contagem de documentos da ficha", periodo: "Histórico do caso" },
          ]} />

           <Bloco titulo="Pessoa individual — identidade e contato">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Papel no núcleo" valor={humano(papelNoNucleo, "Papel ainda não registrado")} />
              <Campo rotulo="Núcleo" valor={caso.identidade.nucleo} />
              <Campo rotulo="E-mail" valor={caso.identidade.email} />
              <Campo rotulo="Telefone" valor={caso.identidade.telefone} />
            </dl>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/golive/pessoas" className="text-sm text-navy underline decoration-gold underline-offset-4">
                Ver núcleo familiar
              </Link>
              <Link
                to="/pessoas-linhagens/$caseId"
                params={{ caseId: caso.caso.id }}
                className="text-sm text-navy underline decoration-gold underline-offset-4"
              >
                Ver árvore
              </Link>
            </div>
          </Bloco>

          <Bloco titulo="Completude do cadastro">
            {completude.length ? (
              <BarrasPercentual dados={completude} titulo="Completude por domínio" />
            ) : (
              <Vazio
                cta={
                  <Link to="/clientes">
                    <Button size="sm">Buscar pessoa</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Confiança dos vínculos">
            {confianca ? (
              <Estrelas
                estrelas={confianca.estrelas}
                confirmados={confianca.confirmados}
                pendentes={confianca.pendentes}
              />
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/pessoas">
                    <Button size="sm">Abrir núcleo familiar</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Relações aprovadas">
            {relacoes.length ? (
              <Rede relacoes={relacoes} />
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/pessoas">
                    <Button size="sm">Abrir núcleo familiar</Button>
                  </Link>
                }
              />
            )}
          </Bloco>

          <Bloco titulo="Caso desta pessoa">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Campo rotulo="Caso" valor={caso.caso.titulo} />
              <Campo rotulo="Etapa" valor={humano(caso.plano?.fase ?? caso.caso.fase)} />
              <Campo rotulo="Próxima ação" valor={humano(caso.plano?.proximaAcao ?? caso.caso.proximaAcao)} />
              <Campo rotulo="Responsável" valor={caso.caso.responsavel} />
            </dl>
            <Link to="/golive/caso">
              <Button size="sm">Abrir Caso 360</Button>
            </Link>
          </Bloco>

          <Bloco titulo="Documentos da pessoa">
            {caso.documentos.length ? (
              <ul className="space-y-1 text-sm text-navy">
                {caso.documentos.map((d) => (
                  <li key={d.id} className="break-words">
                    {d.titulo} {d.status ? <span className="text-navy/55">— {humano(d.status)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Vazio
                cta={
                  <Link to="/golive/caso">
                    <Button size="sm">Ver documentos no caso</Button>
                  </Link>
                }
              />
            )}
          </Bloco>
        </>
      ) : null}
    </SuperficieGoLive>
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
