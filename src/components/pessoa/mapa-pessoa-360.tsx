import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { rotulo } from "@/lib/crm-desk";
import {
  agruparFamiliaPorNucleo,
  formatarValorProposta,
  leadEhWhatsApp,
  leadTemDiscovery,
  montarLinhaDoTempoDoCliente,
  ORIGEM_FATO_ROTULO,
  resumoDiscovery,
  rotuloPapelNucleo,
  type AchadoDaPessoa,
  type ContratoDaPessoa,
  type EvidenciaDaPessoa,
  type LeadDaPessoa,
  type MembroDaFamilia,
  type NucleoDaPessoa,
  type PropostaDaPessoa,
  type TouchpointWhatsapp,
} from "@/lib/pessoa-360-cards";

type CasoResumo = {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
};

type PessoaMapaProps = {
  clienteId: string;
  casos: CasoResumo[];
  eventos: {
    case_id?: string;
    occurred_at?: string | null;
    created_at?: string | null;
    title?: string | null;
    phase?: string | null;
    status?: string | null;
    summary_internal?: string | null;
    responsavel_nome?: string | null;
    bloqueio?: boolean | null;
    alerta?: string | null;
  }[];
  nucleos: NucleoDaPessoa[];
  familiaMembros: MembroDaFamilia[];
  fichaGenealogica: { id: string; canonical_name?: string | null; preferred_display_name?: string | null; identity_status?: string | null; papel_na_linhagem?: string | null; geracao?: string | null; birth_place?: string | null }[];
  fichaGenealogicaEquipe: { id: string; canonical_name?: string | null; preferred_display_name?: string | null }[];
  perfisGenealogicos: { id: string; nome_completo?: string | null; status_verificacao?: string | null }[];
  achados: AchadoDaPessoa[];
  evidencias: EvidenciaDaPessoa[];
  propostas: PropostaDaPessoa[];
  contratos: ContratoDaPessoa[];
  documentos: { id: string; titulo?: string | null; liberado_cliente?: boolean | null; case_id?: string | null }[];
  contractParties: { id: string; document_type?: string | null }[];
  leadsCandidatos: LeadDaPessoa[];
  touchpointsWhatsapp: TouchpointWhatsapp[];
  projecoesPublicadas: { id: string; projection_type?: string | null; approval_status?: string | null }[];
};

function dia(valor?: string | null): string {
  if (!valor) return "—";
  const d = new Date(valor.length <= 10 ? `${valor}T12:00:00Z` : valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function estado(valor?: string | null): string {
  if (!valor) return "—";
  return valor.replace(/_/g, " ");
}

function CardNuance({
  titulo,
  contagem,
  vazio,
  acao,
  children,
}: {
  titulo: string;
  contagem: string;
  vazio?: string;
  acao?: ReactNode;
  children?: ReactNode;
}) {
  const semConteudo = !children;
  return (
    <article className="flex flex-col rounded-xl border border-navy/12 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-base text-navy">{titulo}</h3>
        <p className="text-[11px] uppercase tracking-wide text-navy/45">{contagem}</p>
      </div>
      {semConteudo ? (
        <p className="mt-2 flex-1 text-sm text-navy/60">{vazio}</p>
      ) : (
        <div className="mt-2 flex-1 space-y-2">{children}</div>
      )}
      {acao ? <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">{acao}</div> : null}
    </article>
  );
}

/**
 * Grade de cards da Pessoa 360: cada nuance visível, mesmo vazia.
 * Edição continua nas rotas canônicas (Núcleos, Mesa, Propostas, Pesquisa).
 */
export function MapaPessoa360(p: PessoaMapaProps) {
  const familia = agruparFamiliaPorNucleo(p.nucleos, p.familiaMembros);
  const discoveries = p.leadsCandidatos.filter(leadTemDiscovery);
  const whatsappLeads = p.leadsCandidatos.filter(leadEhWhatsApp);
  const casoPesquisa = p.casos[0]?.id ?? null;

  const linha = montarLinhaDoTempoDoCliente({
    casos: p.casos.map((c) => ({
      id: c.id,
      casoCodigo: c.codigo ?? null,
      casoTitulo: c.titulo ?? null,
      eventos: p.eventos.filter((e) => e.case_id === c.id),
    })),
    leads: p.leadsCandidatos,
    propostas: p.propostas,
    contratos: p.contratos,
    achados: p.achados,
    touchpointsWhatsapp: p.touchpointsWhatsapp,
  });
  const recentes = [...linha.eventos].reverse().slice(0, 4);

  return (
    <section aria-labelledby="mapa-pessoa-360">
      <div className="mb-3">
        <h2 id="mapa-pessoa-360" className="font-serif text-lg text-navy">
          Mapa desta pessoa
        </h2>
        <p className="mt-1 text-xs text-navy/55">
          Núcleo, pesquisa, achados, proposta, contrato, Discovery, WhatsApp e linha do tempo —
          cada card lê a fonte que já existe. Vazio específico não é tela escondida.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <CardNuance
          titulo="Núcleo familiar"
          contagem={`${p.familiaMembros.length} membro(s) · ${familia.length} núcleo(s)`}
          vazio="Esta pessoa ainda não está em um núcleo familiar. O cadastro da família vive em Núcleos e dossiês — aqui só aparece o que já foi vinculado."
          acao={
            <Link to="/nucleos" className="text-navy underline underline-offset-4">
              Abrir Núcleos e dossiês
            </Link>
          }
        >
          {familia.length === 0
            ? null
            : familia.map((g) => (
                <div key={g.nucleo.id} className="rounded-lg border border-navy/10 bg-cream/30 p-3">
                  <p className="text-sm font-medium text-navy">{g.nucleo.nome || "Núcleo sem nome"}</p>
                  {g.nucleo.dossie_mae ? (
                    <p className="text-[11px] text-navy/50">{g.nucleo.dossie_mae}</p>
                  ) : null}
                  <ul className="mt-2 space-y-1.5">
                    {g.membros.map((m) => (
                      <li key={m.id} className="text-sm text-navy/80">
                        <span className="font-medium text-navy">{m.nome || "Sem nome"}</span>
                        <span className="ml-2 text-[11px] text-navy/50">{rotuloPapelNucleo(m.papel)}</span>
                        {m.vinculo ? <span className="ml-1 text-[11px] text-navy/45">· {m.vinculo}</span> : null}
                        {m.cliente_id && m.cliente_id !== p.clienteId ? (
                          <>
                            {" "}
                            <Link
                              to="/pessoas/$clienteId"
                              params={{ clienteId: m.cliente_id }}
                              className="text-xs text-navy underline underline-offset-2"
                            >
                              Pessoa 360
                            </Link>
                          </>
                        ) : null}
                        {m.representacao_necessaria ? (
                          <span className="ml-2 text-[11px] text-terracotta">representação necessária</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
        </CardNuance>

        <CardNuance
          titulo="Pesquisa genealógica"
          contagem={`${p.fichaGenealogica.length + p.fichaGenealogicaEquipe.length} pessoa(s) na ficha`}
          vazio="Ainda não há ficha genealógica ligada aos casos desta pessoa. A pesquisa vive em research_people, pelo caso — não por nome."
          acao={
            casoPesquisa ? (
              <>
                <Link
                  to="/pessoas-linhagens/$caseId"
                  params={{ caseId: casoPesquisa }}
                  className="text-navy underline underline-offset-4"
                >
                  Abrir linhagens
                </Link>
                <Link
                  to="/pesquisa-evidencias/$caseId"
                  params={{ caseId: casoPesquisa }}
                  className="text-navy underline underline-offset-4"
                >
                  Abrir evidências
                </Link>
              </>
            ) : (
              <span className="text-navy/45">Abre quando houver caso</span>
            )
          }
        >
          {p.fichaGenealogica.length === 0 &&
          p.fichaGenealogicaEquipe.length === 0 &&
          p.perfisGenealogicos.length === 0
            ? null
            : (
              <>
                {p.fichaGenealogica.map((f) => (
                  <p key={f.id} className="text-sm text-navy/80">
                    {f.canonical_name || f.preferred_display_name}
                    <span className="text-[11px] text-navy/50">
                      {" "}
                      · {estado(f.identity_status)}
                      {f.papel_na_linhagem ? ` · ${f.papel_na_linhagem}` : ""}
                      {f.geracao ? ` · geração ${f.geracao}` : ""}
                      {f.birth_place ? ` · ${f.birth_place}` : ""}
                    </span>
                  </p>
                ))}
                {p.fichaGenealogicaEquipe.length > 0 ? (
                  <p className="text-xs text-navy/55">
                    Mesma pesquisa:{" "}
                    {p.fichaGenealogicaEquipe
                      .map((x) => x.canonical_name || x.preferred_display_name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
                {p.perfisGenealogicos.map((perfil) => (
                  <p key={perfil.id} className="text-xs text-navy/55">
                    Perfil 360°: {perfil.nome_completo} · {estado(perfil.status_verificacao)}
                  </p>
                ))}
              </>
            )}
        </CardNuance>

        <CardNuance
          titulo="Achados"
          contagem={`${p.achados.length} achado(s) · ${p.evidencias.length} evidência(s)`}
          vazio="Nenhum achado genealógico nos casos desta pessoa. Achado confirmado exige evidência — a cadeia vive na pesquisa do caso."
          acao={
            casoPesquisa ? (
              <Link
                to="/pesquisa-evidencias/$caseId"
                params={{ caseId: casoPesquisa }}
                className="text-navy underline underline-offset-4"
              >
                Abrir cadeia de evidências
              </Link>
            ) : null
          }
        >
          {p.achados.length === 0 && p.evidencias.length === 0
            ? null
            : (
              <>
                {p.achados.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-lg border border-navy/10 bg-cream/30 p-2.5">
                    <p className="text-sm font-medium text-navy">{a.title || "Achado sem título"}</p>
                    <p className="text-[11px] text-navy/50">
                      {[estado(a.finding_type), estado(a.validation_status), estado(a.confidence), a.locality]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {a.client_projection_status && a.client_projection_status !== "interna" ? (
                      <p className="text-[11px] text-navy/45">projeção {estado(a.client_projection_status)}</p>
                    ) : (
                      <p className="text-[11px] text-navy/45">interno ao Desk — não vai ao App Cliente sozinho</p>
                    )}
                  </div>
                ))}
                {p.evidencias.slice(0, 3).map((e) => (
                  <p key={e.id} className="text-xs text-navy/65">
                    Evidência: {e.title_internal || "sem título"} · {estado(e.workflow_status)}
                  </p>
                ))}
              </>
            )}
        </CardNuance>

        <CardNuance
          titulo="Proposta"
          contagem={`${p.propostas.length} proposta(s)`}
          vazio="Nenhuma proposta ligada a esta pessoa. A formalização parte da Mesa e do caso — não se inventa proposta aqui."
          acao={
            <Link to="/propostas" className="text-navy underline underline-offset-4">
              Abrir Propostas
            </Link>
          }
        >
          {p.propostas.length === 0
            ? null
            : p.propostas.map((proposta) => (
                <div key={proposta.id} className="rounded-lg border border-navy/10 bg-cream/30 p-2.5 text-sm">
                  <p className="font-medium text-navy">{estado(proposta.status)}</p>
                  <p className="text-[11px] text-navy/50">
                    {[
                      formatarValorProposta(proposta.valor, proposta.moeda),
                      proposta.enviada_em ? `enviada ${dia(proposta.enviada_em)}` : null,
                      proposta.aprovada_em ? `aprovada ${dia(proposta.aprovada_em)}` : null,
                      proposta.validade ? `válida até ${dia(proposta.validade)}` : `criada ${dia(proposta.created_at)}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {proposta.case_id ? (
                    <Link
                      to="/casos/$caseId/contrato/preparar"
                      params={{ caseId: String(proposta.case_id) }}
                      className="text-xs text-navy underline underline-offset-2"
                    >
                      Preparar contrato
                    </Link>
                  ) : null}
                </div>
              ))}
        </CardNuance>

        <CardNuance
          titulo="Contrato"
          contagem={`${p.contratos.length} contrato(s) · ${p.documentos.length} documento(s)`}
          vazio="Nenhum contrato desta pessoa. Assinatura e parâmetros ficam em Contratos e na formalização do caso."
          acao={
            <>
              <Link to="/contratos" className="text-navy underline underline-offset-4">
                Abrir Contratos
              </Link>
              <Link to="/acessos-portal" className="text-navy underline underline-offset-4">
                Publicar no App Cliente
              </Link>
            </>
          }
        >
          {p.contratos.length === 0 && p.documentos.length === 0
            ? null
            : (
              <>
                {p.contratos.map((c) => (
                  <div key={c.id} className="rounded-lg border border-navy/10 bg-cream/30 p-2.5 text-sm">
                    <Link to="/contratos/$id" params={{ id: String(c.id) }} className="font-medium text-navy underline underline-offset-2">
                      {estado(c.status)}
                    </Link>
                    <p className="text-[11px] text-navy/50">
                      {c.signed_at ? `assinado em ${dia(c.signed_at)}` : `registrado em ${dia(c.created_at)}`}
                    </p>
                    {c.case_id ? (
                      <Link
                        to="/casos/$caseId/contrato/preparar"
                        params={{ caseId: String(c.case_id) }}
                        className="text-xs text-navy underline underline-offset-2"
                      >
                        Parâmetros
                      </Link>
                    ) : null}
                  </div>
                ))}
                {p.contractParties.length > 0 ? (
                  <p className="text-[11px] text-navy/50">
                    Parte em {p.contractParties.length} instrumento(s)
                  </p>
                ) : null}
                {p.documentos.slice(0, 4).map((d) => (
                  <p key={d.id} className="text-xs text-navy/70">
                    {d.titulo}
                    {d.liberado_cliente ? <span className="text-navy/45"> · liberado ao cliente</span> : null}
                  </p>
                ))}
              </>
            )}
        </CardNuance>

        <CardNuance
          titulo="Discovery"
          contagem={`${discoveries.length} registro(s)`}
          vazio="Nenhuma Discovery registrada para esta pessoa. A Mesa de Discovery pergunta; o resultado grava no lead."
          acao={
            discoveries[0] ? (
              <Link
                to="/calls"
                search={{ lead: discoveries[0].id }}
                className="text-navy underline underline-offset-4"
              >
                Abrir Mesa de Discovery
              </Link>
            ) : (
              <Link to="/calls" className="text-navy underline underline-offset-4">
                Abrir Mesa de Discovery
              </Link>
            )
          }
        >
          {discoveries.length === 0
            ? null
            : discoveries.map((l) => (
                <div key={l.id} className="rounded-lg border border-navy/10 bg-cream/30 p-2.5">
                  <p className="text-sm font-medium text-navy">{l.nome}</p>
                  <p className="text-[11px] text-navy/50">{resumoDiscovery(l)}</p>
                  {l.proxima_acao ? (
                    <p className="mt-1 text-xs text-navy/75">
                      Próxima ação: {rotulo("proxima_acao", l.proxima_acao)}
                      {l.proxima_acao_em ? ` · ${dia(l.proxima_acao_em)}` : ""}
                    </p>
                  ) : null}
                  {l.resumo_call ? (
                    <p className="mt-1 line-clamp-3 text-xs text-navy/65">{l.resumo_call}</p>
                  ) : null}
                  {l.narrativa_familiar ? (
                    <p className="mt-1 line-clamp-2 text-xs text-navy/55">{l.narrativa_familiar}</p>
                  ) : null}
                  <Link
                    to="/calls"
                    search={{ lead: l.id }}
                    className="mt-1 inline-block text-xs text-navy underline underline-offset-2"
                  >
                    Abrir esta call
                  </Link>
                </div>
              ))}
        </CardNuance>

        <CardNuance
          titulo="Lead WhatsApp"
          contagem={`${whatsappLeads.length} lead(s) · ${p.touchpointsWhatsapp.length} toque(s)`}
          vazio="Nenhum lead com origem WhatsApp nem touchpoint neste canal. A varredura do dump vive na Mesa — aqui só o que já foi gravado nesta pessoa."
          acao={
            <Link to="/calls" className="text-navy underline underline-offset-4">
              Abrir varredura na Mesa
            </Link>
          }
        >
          {whatsappLeads.length === 0 && p.touchpointsWhatsapp.length === 0
            ? null
            : (
              <>
                {whatsappLeads.map((l) => (
                  <div key={l.id} className="rounded-lg border border-navy/10 bg-cream/30 p-2.5 text-sm">
                    <p className="font-medium text-navy">{l.nome}</p>
                    <p className="text-[11px] text-navy/50">
                      {[
                        l.codigo,
                        rotulo("origem", l.origem),
                        l.estagio ? `estágio ${l.estagio}` : null,
                        l.telefone,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <Link
                      to="/calls"
                      search={{ lead: l.id }}
                      className="text-xs text-navy underline underline-offset-2"
                    >
                      Abrir na Mesa
                    </Link>
                  </div>
                ))}
                {p.touchpointsWhatsapp.slice(0, 3).map((t) => (
                  <p key={t.id} className="text-xs text-navy/65">
                    {dia(t.ocorrido_em)} · {t.direcao || "toque"} — {t.resumo || "sem resumo"}
                  </p>
                ))}
              </>
            )}
        </CardNuance>

        <CardNuance
          titulo="Linha do tempo do cliente"
          contagem={`${linha.eventos.length} fato(s)`}
          vazio="Ainda não há fatos de caso, lead, proposta, contrato, achado ou WhatsApp para montar a história desta pessoa."
          acao={
            <a href="#linha-do-tempo" className="text-navy underline underline-offset-4">
              Ver linha completa
            </a>
          }
        >
          {recentes.length === 0
            ? null
            : recentes.map((e, i) => (
                <p key={`${e.quando}-${i}`} className="text-sm text-navy/80">
                  <span className="font-mono text-[11px] text-navy/50">{dia(e.quando)}</span>{" "}
                  {e.titulo}
                  <span className="ml-1 text-[11px] text-navy/45">
                    {ORIGEM_FATO_ROTULO[e.origem] ?? e.origem}
                    {e.casoCodigo ? ` · ${e.casoCodigo}` : ""}
                  </span>
                </p>
              ))}
        </CardNuance>

        <CardNuance
          titulo="App Cliente"
          contagem={`${p.projecoesPublicadas.length} projeção(ões)`}
          vazio="Nada publicado para o App Cliente nos casos desta pessoa. Publicar é decisão do Desk, com autor e data."
          acao={
            <Link to="/acessos-portal" className="text-navy underline underline-offset-4">
              Publicar no App Cliente
            </Link>
          }
        >
          {p.projecoesPublicadas.length === 0
            ? null
            : p.projecoesPublicadas.map((proj) => (
                <p key={proj.id} className="text-sm text-navy/80">
                  {proj.projection_type}{" "}
                  <span className="text-[11px] text-navy/50">
                    · {proj.approval_status === "published" ? "Publicado" : estado(proj.approval_status)}
                  </span>
                </p>
              ))}
        </CardNuance>
      </div>
    </section>
  );
}
