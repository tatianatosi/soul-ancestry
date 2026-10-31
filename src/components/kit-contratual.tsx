import { createContext, useContext, useState } from "react";
import type { CasoDoKit } from "@/lib/kit-contratual-do-caso";
import { cn } from "@/lib/utils";
import {
  CONTRATO_BASE_LABEL,
  DESPESAS_LABEL_INTERNO,
  FALLBACK,
  ORDEM_SERVICO_LABEL,
  POLITICA_DESPESAS_LABEL,
  PROCURACAO_LABEL,
  lista,
  preenchido,
  texto,
} from "@/lib/evidence";
import {
  DOCUMENTO_ESTADO_LABEL,
  STATUS_ETAPA_LABEL,
  mensagemDocumento,
} from "@/lib/visibilidade";
import type { CaseContratacao, EstadoDocumento } from "@/types/case";
import {
  AVISO_PREPARO_PROCURACAO,
  bloqueiosProcuracaoEuropeia,
  resolverContextoEuropeu,
  TITULO_PROCURACAO_BRASIL,
  type ContextoProcuracaoEuropeia,
} from "@/lib/procuracao-europeia";
import { FileSignature, ScrollText, Wallet, Search, Stamp, Landmark, Replace } from "lucide-react";


/**
 * Kit Contratual do Caso — visão interna (desktop).
 * Nesta fase é apenas estrutura visual: nenhum documento real, link público,
 * assinatura eletrônica ou download é disponibilizado.
 */

const NAO_INICIADO = "Ação ainda não iniciada";

/**
 * Contexto europeu do caso, somente leitura, por precedência canônica.
 * Nesta visão o Planejador/proposta ainda não declaram país próprio, então o
 * resolvedor lê o país confirmado no caso — sem qualquer país por default.
 */
function contextoEuropeuDoCaso(caso: CasoDoKit): ContextoProcuracaoEuropeia {
  return resolverContextoEuropeu({
    propostaAprovadaVinculada: null,
    produtoSkuHomologado: null,
    planejadorHomologado: null,
    casoConfirmado: { pais: caso.pais, versao: null },
  });
}

/** O caso vem da leitura real (`kitContratualDoCaso`); nenhum caso fixo é importado aqui. */
const CasoDoKitContext = createContext<CasoDoKit | null>(null);

function useCasoDoKit(): CasoDoKit {
  const c = useContext(CasoDoKitContext);
  if (!c) throw new Error("KitContratual precisa receber o caso.");
  return c;
}

type ModeloId =
  | "ordem_servico"
  | "despesas"
  | "autorizacao"
  | "procuracao_br"
  | "procuracao_eu"
  | "alteracao_escopo";

type CardKit = {
  id: string;
  titulo: string;
  icone: typeof FileSignature;
  status: string;
  versao: string;
  criacao: string;
  aceite: string;
  responsavel: string;
  proximaAcao: string;
  modelo?: ModeloId;
};

function cards(c: CaseContratacao | undefined, responsavel: string, criacao: string, ctx: ContextoProcuracaoEuropeia): CardKit[] {
  const os = c?.ordem_servico;
  const d = c?.despesas_externas;
  const br = c?.autorizacoes.procuracao_brasileira;
  const eu = c?.autorizacoes.procuracao_europeia;
  const pesquisa = c?.autorizacoes.pesquisa_especifica ?? [];
  const alt = c?.alteracoes_escopo ?? [];

  return [
    {
      id: "contrato",
      titulo: "Contrato-Base",
      icone: FileSignature,
      status: c ? CONTRATO_BASE_LABEL[c.contrato_base.status] : FALLBACK.aguardando,
      versao: texto(c?.contrato_base.versao, "Sem versão registrada"),
      criacao,
      aceite: texto(c?.contrato_base.data_aceite, NAO_INICIADO),
      responsavel,
      proximaAcao: "Concluir revisão jurídica antes de enviar para aceite.",
    },
    {
      id: "os",
      titulo: "Ordem de Serviço",
      icone: ScrollText,
      status: os ? ORDEM_SERVICO_LABEL[os.status] : FALLBACK.aguardando,
      versao: texto(os?.produto_sku, "SKU não vinculado"),
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Confirmar modalidade e valores antes de submeter à cliente.",
      modelo: "ordem_servico",
    },
    {
      id: "despesas",
      titulo: "Despesas Externas",
      icone: Wallet,
      status: d ? DESPESAS_LABEL_INTERNO[d.status] : FALLBACK.aguardando,
      versao: d ? POLITICA_DESPESAS_LABEL[d.politica] : "Política não definida",
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Levantar estimativas por item e registrar tetos de aprovação.",
      modelo: "despesas",
    },
    {
      id: "autorizacao",
      titulo: "Autorização de Pesquisa",
      icone: Search,
      status: pesquisa.length > 0 ? PROCURACAO_LABEL[pesquisa[0].status] : "Não iniciada",
      versao: pesquisa.length > 0 ? `${pesquisa.length} autorização(ões)` : "Nenhuma emitida",
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Emitir somente quando houver órgão destinatário confirmado.",
      modelo: "autorizacao",
    },
    {
      id: "proc_br",
      titulo: TITULO_PROCURACAO_BRASIL,
      icone: Stamp,
      status: br ? PROCURACAO_LABEL[br.status] : "Não iniciada",
      versao: texto(br?.finalidade, "Finalidade a definir"),
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Preparar somente após revisão do escopo documental.",
      modelo: "procuracao_br",
    },
    {
      id: "proc_eu",
      titulo: ctx.state === "confirmado" ? ctx.title : "Procuração para atuação no país/órgão europeu aplicável",
      icone: Landmark,
      status: bloqueiosProcuracaoEuropeia(ctx).bloqueado
        ? "Não iniciada"
        : eu
          ? PROCURACAO_LABEL[eu.status]
          : "Não iniciada",
      versao: texto(eu?.finalidade, "Finalidade a definir"),
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: AVISO_PREPARO_PROCURACAO,
      modelo: "procuracao_eu",
    },
    {
      id: "escopo",
      titulo: "Alteração de Escopo",
      icone: Replace,
      status: alt.length > 0 ? `${alt.length} termo(s) registrado(s)` : "Nenhuma alteração",
      versao: "Modelo disponível",
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Usar somente com impacto de prazo e financeiro descritos.",
      modelo: "alteracao_escopo",
    },
  ];
}

/** Estado de documento por área (derivado de caseData). */
function estadoDoCard(id: string, c: CaseContratacao | undefined): EstadoDocumento {
  if (!c) return "nao_criado";
  switch (id) {
    case "contrato":
      return c.contrato_base.status === "aceito"
        ? "aceito"
        : c.contrato_base.status === "arquivado"
          ? "arquivado"
          : preenchido(c.contrato_base.versao)
            ? "aguardando_revisao"
            : "nao_criado";
    case "os":
      return c.ordem_servico.status === "aceita"
        ? "aceito"
        : c.ordem_servico.status === "arquivada"
          ? "arquivado"
          : c.ordem_servico.status === "aguardando_aceite"
            ? "aguardando_aceite"
            : c.ordem_servico.status === "rascunho"
              ? "rascunho"
              : "nao_criado";
    case "despesas":
      return c.despesas_externas.status === "nao_aplicavel" ? "indisponivel" : "rascunho";
    case "autorizacao":
      return c.autorizacoes.pesquisa_especifica.length > 0 ? "rascunho" : "nao_criado";
    case "proc_br":
      return c.autorizacoes.procuracao_brasileira.status === "nao_iniciada"
        ? "nao_criado"
        : "rascunho";
    case "proc_eu":
      return c.autorizacoes.procuracao_europeia.status === "nao_iniciada"
        ? "nao_criado"
        : "rascunho";
    case "escopo":
      return c.alteracoes_escopo.length > 0 ? "rascunho" : "nao_criado";
    default:
      return "nao_criado";
  }
}

type AreaId = "visao" | string;

export function KitContratual({ caso }: { caso: CasoDoKit }) {
  return (
    <CasoDoKitContext.Provider value={caso}>
      <KitContratualCorpo />
    </CasoDoKitContext.Provider>
  );
}

function KitContratualCorpo() {
  const caso = useCasoDoKit();
  const c = caso.contratacao;
  const [area, setArea] = useState<AreaId>("visao");
  const ctxEuropeu = contextoEuropeuDoCaso(caso);
  const itens = cards(
    c,
    texto(caso.responsavel, FALLBACK.aguardando),
    texto(caso.abertoEm, FALLBACK.aguardando),
    ctxEuropeu,
  );

  const navegacao: { id: AreaId; label: string }[] = [
    { id: "visao", label: "Visão geral" },
    ...itens.map((i) => ({ id: i.id, label: i.titulo })),
    { id: "historico", label: "Histórico contratual" },
  ];

  const atual = itens.find((i) => i.id === area);

  return (
    <section className="rounded-2xl border border-navy/10 bg-cream/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-navy">Kit Contratual do Caso</h3>
          <p className="mt-1 text-[12px] text-navy/70">
            Leitura interna do que está registrado no caso. Nada é enviado, assinado, baixado ou
            cobrado por aqui; o que não tem registro aparece como não iniciado.
          </p>
        </div>
        <span className="rounded-full border border-plum/30 bg-plum/10 px-3 py-1 text-[11px] font-semibold text-plum">
          Visão interna
        </span>
      </div>

      <div className="mt-4 gap-5 lg:flex">
        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {navegacao.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setArea(n.id)}
              className={cn(
                "whitespace-nowrap rounded-lg border px-3 py-2 text-left text-[12px] font-semibold transition lg:whitespace-normal",
                area === n.id
                  ? "border-gold bg-gold text-navy"
                  : "border-navy/10 bg-cream/50 text-navy/75 hover:bg-cream",
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {area === "visao" && caso.avisos.length > 0 && (
            <ul className="mb-3 space-y-1 rounded-lg border border-gold/40 bg-gold/10 p-3 text-[11px] text-navy" data-kit-avisos>
              {caso.avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}
          {area === "visao" && (
            <div className="grid gap-4 xl:grid-cols-2">
              {itens.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setArea(k.id)}
                  className="rounded-xl border border-navy/10 bg-cream/50 p-4 text-left transition hover:border-gold/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <k.icone className="h-4 w-4 text-gold" />
                      <div className="font-semibold text-navy">{k.titulo}</div>
                    </div>
                    <span className="rounded-full border border-terracotta/40 bg-cream/40 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                      {k.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-navy/70">
                    {mensagemDocumento(estadoDoCard(k.id, c))}
                  </p>
                </button>
              ))}
            </div>
          )}

          {area === "historico" && <HistoricoContratual />}

          {atual && (
            <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <atual.icone className="h-4 w-4 text-gold" />
                  <h4 className="font-serif text-lg text-navy">{atual.titulo}</h4>
                </div>
                <span className="rounded-full border border-terracotta/40 bg-cream/40 px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                  {atual.status}
                </span>
              </div>

              <dl className="mt-3 grid gap-1.5 text-[11px] text-navy/75 sm:grid-cols-2">
                {[
                  ["Versão", atual.versao],
                  ["Criação", atual.criacao],
                  ["Aceite", atual.aceite],
                  ["Responsável", atual.responsavel],
                  ["Estado do documento", DOCUMENTO_ESTADO_LABEL[estadoDoCard(atual.id, c)]],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between gap-3 border-b border-navy/10 py-1">
                    <dt className="text-navy/55">{l}</dt>
                    <dd className="text-right font-medium text-navy">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-3 text-[11px] italic text-navy/70">
                Próxima ação: {atual.proximaAcao}
              </p>
              <p className="mt-2 rounded-lg border border-gold/40 bg-gold/10 p-2.5 text-[11px] text-navy">
                {mensagemDocumento(estadoDoCard(atual.id, c))}
              </p>

              {atual.modelo && (
                <div className="mt-4 rounded-xl border border-navy/10 bg-cream/40 p-4">
                  <div className="text-[11px] uppercase tracking-widest text-terracotta">
                    Prévia interna estática · somente leitura
                  </div>
                  <ModeloCorpo id={atual.modelo} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HistoricoContratual() {
  const caso = useCasoDoKit();
  const etapas = caso.contratacao?.timeline ?? [];
  return (
    <div className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <h4 className="font-serif text-lg text-navy">Histórico contratual</h4>
      {etapas.length === 0 ? (
        <p className="mt-2 text-[12px] text-navy/70">
          Nenhum movimento contratual registrado até o momento.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {etapas.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-navy/10 bg-cream/40 p-3 text-[12px] text-navy/80"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-semibold text-navy">{e.titulo}</span>
                <span className="text-navy/60">{STATUS_ETAPA_LABEL[e.status]}</span>
              </div>
              {preenchido(e.data) && <div className="mt-1 text-navy/55">{e.data}</div>}
              <div className="mt-1">{e.descricao}</div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-navy/60">
        Registros de aceite e assinatura só serão exibidos quando existirem de fato.
      </p>
    </div>
  );
}


/* ---------- prévias internas dos anexos (somente leitura) ---------- */

function Linha({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-navy/10 py-2 text-sm last:border-0">
      <span className="text-navy/60">{l}</span>
      <span className="max-w-[70%] text-right font-medium text-navy">{v}</span>
    </div>
  );
}

function ListaCampo({ l, itens }: { l: string; itens: string[] }) {
  return (
    <div className="border-b border-navy/10 py-2 text-sm last:border-0">
      <div className="text-navy/60">{l}</div>
      {itens.length > 0 ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-navy">
          {itens.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-1 font-medium text-navy/70">{NAO_INICIADO}</div>
      )}
    </div>
  );
}

const TITULOS: Record<ModeloId, string> = {
  ordem_servico: "Ordem de Serviço — prévia interna",
  despesas: "Controle de Despesas Externas — prévia interna",
  autorizacao: "Autorização Específica de Pesquisa — prévia interna",
  procuracao_br: `${TITULO_PROCURACAO_BRASIL} — prévia interna`,
  procuracao_eu: "Procuração europeia — prévia interna",
  alteracao_escopo: "Termo de Alteração de Escopo — prévia interna",
};

function ModeloCorpo({ id }: { id: ModeloId }) {
  const caso = useCasoDoKit();
  const c = caso.contratacao;

  return (
    <div>
      <div>
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-serif text-lg text-navy">{TITULOS[id]}</h4>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-terracotta">
          Rascunho interno · não vinculado a documento assinado
        </p>

        <div className="mt-4">

          {id === "ordem_servico" && (
            <>
              <Linha l="Código do caso" v={texto(c?.ordem_servico.case_id, caso.codigo)} />
              <Linha l="Cliente" v={texto(caso.clienteNome)} />
              <Linha l="SKU" v={texto(c?.ordem_servico.produto_sku, FALLBACK.aguardando)} />
              <Linha l="Produto" v={texto(c?.ordem_servico.produto_nome, FALLBACK.aguardando)} />
              <Linha l="Escopo" v={texto(c?.ordem_servico.escopo_resumo, FALLBACK.atualizacao)} />
              <Linha l="Etapa inicial" v={texto(c?.ordem_servico.etapa_inicial, FALLBACK.atualizacao)} />
              <ListaCampo l="Entregáveis" itens={lista(c?.ordem_servico.entregaveis)} />
              <Linha
                l="Modalidade"
                v={
                  c?.ordem_servico.modalidade_escolhida === "pendente"
                    ? "Pendente de escolha formal"
                    : texto(c?.ordem_servico.modalidade_escolhida, FALLBACK.aguardando)
                }
              />
              <Linha l="Valor contratado" v={texto(c?.ordem_servico.valor_contratado, NAO_INICIADO)} />
              <Linha l="Pagamento" v={texto(c?.ordem_servico.meio_pagamento, NAO_INICIADO)} />
              <Linha
                l="Vencimentos"
                v={texto(c?.ordem_servico.primeiro_vencimento, NAO_INICIADO)}
              />
              <Linha
                l="Despesas incluídas/excluídas"
                v={texto(c?.despesas_externas.descricao_cliente, FALLBACK.atualizacao)}
              />
              <Linha l="Aceite" v={NAO_INICIADO} />
            </>
          )}

          {id === "despesas" && (
            <>
              <Linha
                l="Política"
                v={c ? POLITICA_DESPESAS_LABEL[c.despesas_externas.politica] : FALLBACK.aguardando}
              />
              <Linha
                l="Status"
                v={c ? DESPESAS_LABEL_INTERNO[c.despesas_externas.status] : FALLBACK.aguardando}
              />
              <Linha
                l="Estimativa total"
                v={texto(c?.despesas_externas.valor_estimado_total, NAO_INICIADO)}
              />
              <Linha
                l="Valor real confirmado"
                v={texto(c?.despesas_externas.valor_real_confirmado, NAO_INICIADO)}
              />
              <Linha l="Saldo de ajuste" v={texto(c?.despesas_externas.saldo_ajuste, NAO_INICIADO)} />
              <Linha
                l="Aprovação para excedente"
                v={c?.despesas_externas.requer_aprovacao_para_excedente ? "Obrigatória" : "Dispensada"}
              />
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[12px]">
                  <thead className="text-[11px] uppercase tracking-wide text-navy/60">
                    <tr>
                      {["Item", "Finalidade", "Estimativa", "Valor real", "Status", "Aprovação", "Comprovante", "Reembolso"].map(
                        (h) => (
                          <th key={h} className="p-2">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(c?.despesas_externas.itens ?? []).length === 0 ? (
                      <tr className="border-t border-navy/10">
                        <td className="p-2 text-navy/70" colSpan={8}>
                          Nenhum item de despesa registrado até o momento.
                        </td>
                      </tr>
                    ) : (
                      c!.despesas_externas.itens.map((i) => (
                        <tr key={i.item} className="border-t border-navy/10 align-top">
                          <td className="p-2 font-medium text-navy">{i.item}</td>
                          <td className="p-2 text-navy/70">{texto(i.finalidade, "—")}</td>
                          <td className="p-2 text-navy/70">{texto(i.estimativa, "—")}</td>
                          <td className="p-2 text-navy/70">{texto(i.valor_real, "—")}</td>
                          <td className="p-2 text-navy/70">{DESPESAS_LABEL_INTERNO[i.status]}</td>
                          <td className="p-2 text-navy/70">{texto(i.aprovacao, NAO_INICIADO)}</td>
                          <td className="p-2 text-navy/70">{i.comprovante ? "Registrado" : "—"}</td>
                          <td className="p-2 text-navy/70">{texto(i.reembolso, "—")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {id === "autorizacao" && (
            <>
              {(c?.autorizacoes.pesquisa_especifica ?? []).length === 0 ? (
                <>
                  <Linha l="Finalidade" v={NAO_INICIADO} />
                  <Linha l="Órgão destinatário" v="A confirmar" />
                  <ListaCampo l="Pessoas relacionadas" itens={[]} />
                  <ListaCampo l="Documentos solicitados" itens={[]} />
                  <Linha l="Valor / teto" v={NAO_INICIADO} />
                  <Linha l="Prazo" v={NAO_INICIADO} />
                  <Linha l="Aceite" v={NAO_INICIADO} />
                </>
              ) : (
                c!.autorizacoes.pesquisa_especifica.map((a, idx) => (
                  <div key={idx} className="mb-4">
                    <Linha l="Finalidade" v={texto(a.finalidade, NAO_INICIADO)} />
                    <Linha l="Órgão destinatário" v={texto(a.orgao_destinatario, "A confirmar")} />
                    <ListaCampo l="Pessoas relacionadas" itens={lista(a.pessoas_relacionadas)} />
                    <ListaCampo l="Documentos solicitados" itens={lista(a.documentos_solicitados)} />
                    <Linha l="Valor / teto" v={texto(a.teto_valor, NAO_INICIADO)} />
                    <Linha l="Prazo" v={texto(a.prazo, NAO_INICIADO)} />
                    <Linha l="Aceite" v={texto(a.aceite, NAO_INICIADO)} />
                  </div>
                ))
              )}
            </>
          )}

          {(id === "procuracao_br" || id === "procuracao_eu") && (
            <ProcuracaoPreview europeia={id === "procuracao_eu"} />
          )}

          {id === "alteracao_escopo" && (
            <>
              {(c?.alteracoes_escopo ?? []).length === 0 ? (
                <>
                  <Linha
                    l="Escopo anterior"
                    v={texto(c?.ordem_servico.escopo_resumo, FALLBACK.atualizacao)}
                  />
                  <Linha l="Alteração" v={NAO_INICIADO} />
                  <Linha l="Motivo" v={NAO_INICIADO} />
                  <Linha l="Impacto de prazo" v={NAO_INICIADO} />
                  <Linha l="Impacto financeiro" v={NAO_INICIADO} />
                  <Linha l="Aceite" v={NAO_INICIADO} />
                </>
              ) : (
                c!.alteracoes_escopo.map((a, idx) => (
                  <div key={idx} className="mb-4">
                    <Linha l="Escopo anterior" v={texto(a.escopo_anterior, "—")} />
                    <Linha l="Alteração" v={texto(a.alteracao, "—")} />
                    <Linha l="Motivo" v={texto(a.motivo, "—")} />
                    <Linha l="Impacto de prazo" v={texto(a.impacto_prazo, "—")} />
                    <Linha l="Impacto financeiro" v={texto(a.impacto_financeiro, "—")} />
                    <Linha l="Aceite" v={texto(a.aceite, NAO_INICIADO)} />
                  </div>
                ))
              )}
            </>
          )}
        </div>

        <p className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-3 text-[11px] text-navy">
          Documentos reais, assinatura eletrônica e download serão habilitados apenas quando houver
          autenticação, permissões por cliente e armazenamento protegido.
        </p>
      </div>
    </div>
  );
}

function ProcuracaoPreview({ europeia }: { europeia: boolean }) {
  const caso = useCasoDoKit();
  const c = caso.contratacao;
  const ctx = contextoEuropeuDoCaso(caso);
  const bloqueio = bloqueiosProcuracaoEuropeia(ctx);
  const p = europeia ? c?.autorizacoes.procuracao_europeia : c?.autorizacoes.procuracao_brasileira;
  const orgao = preenchido(p?.orgao_destinatario) ? p!.orgao_destinatario : "A confirmar";

  return (
    <>
      <Linha l="Título aplicável" v={europeia ? ctx.title : TITULO_PROCURACAO_BRASIL} />
      {europeia && (
        <>
          <Linha l="Jurisdição" v={`${ctx.jurisdiction_scope} · ${ctx.country_label}`} />
          <Linha l="Origem do país" v={ctx.source_label} />
          <Linha
            l="Estado do contexto"
            v={
              ctx.state === "confirmado"
                ? "País confirmado por fonte canônica"
                : ctx.state === "conflito"
                  ? "Conflito entre fontes canônicas"
                  : "País a confirmar"
            }
          />
        </>
      )}
      <Linha l="Finalidade específica" v={texto(p?.finalidade, NAO_INICIADO)} />
      <Linha l="Órgão destinatário" v={orgao} />
      <ListaCampo l="Pessoas vinculadas" itens={lista(p?.pessoas_vinculadas)} />
      <Linha l="Poderes necessários" v={NAO_INICIADO} />
      <Linha l="Idioma" v={NAO_INICIADO} />
      <Linha l="Requisito formal (assinatura/apostila/reconhecimento)" v={NAO_INICIADO} />
      <Linha
        l="Status"
        v={europeia && bloqueio.bloqueado ? "Não iniciada" : p ? PROCURACAO_LABEL[p.status] : "Não iniciada"}
      />
      <Linha l="Validade" v={texto(p?.validade, NAO_INICIADO)} />
      <Linha l="Observações" v={texto(p?.observacoes, "Sem observações registradas")} />
      {europeia && bloqueio.bloqueado && (
        <div className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/5 p-3 text-[11px] text-terracotta">
          <div className="font-semibold">Preparação bloqueada</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {bloqueio.motivos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          {bloqueio.origemAResolver && (
            <div className="mt-1">Resolver em: {bloqueio.origemAResolver}</div>
          )}
        </div>
      )}
      <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-2.5 text-[11px] text-navy">
        {AVISO_PREPARO_PROCURACAO}
      </p>
    </>
  );
}

