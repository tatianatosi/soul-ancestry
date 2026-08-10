import { useState } from "react";
import { cn } from "@/lib/utils";
import { activeCase } from "@/data/activeCase";
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
import type { CaseContratacao } from "@/types/case";
import { FileSignature, ScrollText, Wallet, Search, Stamp, Landmark, Replace, X } from "lucide-react";

/**
 * Kit Contratual do Caso — visão interna (desktop).
 * Nesta fase é apenas estrutura visual: nenhum documento real, link público,
 * assinatura eletrônica ou download é disponibilizado.
 */

const NAO_INICIADO = "Ação ainda não iniciada";

type ModeloId =
  | "ordem_servico"
  | "despesas"
  | "autorizacao"
  | "procuracao_br"
  | "procuracao_it"
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

function cards(c: CaseContratacao | undefined, responsavel: string, criacao: string): CardKit[] {
  const os = c?.ordem_servico;
  const d = c?.despesas_externas;
  const br = c?.autorizacoes.procuracao_brasileira;
  const it = c?.autorizacoes.procuracao_italiana;
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
      titulo: "Procuração Brasileira",
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
      id: "proc_it",
      titulo: "Procuração Italiana",
      icone: Landmark,
      status: it ? PROCURACAO_LABEL[it.status] : "Não iniciada",
      versao: texto(it?.finalidade, "Finalidade a definir"),
      criacao,
      aceite: NAO_INICIADO,
      responsavel,
      proximaAcao: "Não preparar antes de confirmar o órgão italiano competente.",
      modelo: "procuracao_it",
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

export function KitContratual() {
  const caso = activeCase;
  const c = caso.contratacao;
  const [modelo, setModelo] = useState<ModeloId | null>(null);
  const itens = cards(
    c,
    texto(caso.governanca.responsavel_caso, FALLBACK.aguardando),
    texto(caso.geral.data_abertura, FALLBACK.aguardando),
  );

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-navy">Kit Contratual do Caso</h3>
          <p className="mt-1 text-[12px] text-navy/70">
            Estrutura visual interna. Nenhum documento assinado, link público, upload ou cobrança
            está habilitado nesta fase.
          </p>
        </div>
        <span className="rounded-full border border-plum/30 bg-plum/10 px-3 py-1 text-[11px] font-semibold text-plum">
          Visão interna
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {itens.map((k) => (
          <div key={k.id} className="rounded-xl border border-border bg-cream/50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <k.icone className="h-4 w-4 text-gold" />
                <div className="font-semibold text-navy">{k.titulo}</div>
              </div>
              <span className="rounded-full border border-terracotta/40 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-terracotta">
                {k.status}
              </span>
            </div>
            <dl className="mt-3 space-y-1.5 text-[11px] text-navy/75">
              {[
                ["Versão", k.versao],
                ["Criação", k.criacao],
                ["Aceite", k.aceite],
                ["Responsável", k.responsavel],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-3">
                  <dt className="text-navy/55">{l}</dt>
                  <dd className="text-right font-medium text-navy">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[11px] italic text-navy/70">Próxima ação: {k.proximaAcao}</p>
            {k.modelo && (
              <button
                type="button"
                onClick={() => setModelo(k.modelo!)}
                className="mt-3 w-full rounded-lg border border-navy/20 bg-navy px-3 py-2 text-[12px] font-semibold text-cream transition hover:bg-navy-soft"
              >
                Prévia interna do modelo
              </button>
            )}
          </div>
        ))}
      </div>

      {modelo && <ModeloModal id={modelo} onClose={() => setModelo(null)} />}
    </section>
  );
}

/* ---------- prévias internas dos anexos (somente leitura) ---------- */

function Linha({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
      <span className="text-navy/60">{l}</span>
      <span className="max-w-[70%] text-right font-medium text-navy">{v}</span>
    </div>
  );
}

function ListaCampo({ l, itens }: { l: string; itens: string[] }) {
  return (
    <div className="border-b border-border py-2 text-sm last:border-0">
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
  procuracao_br: "Procuração Brasileira — prévia interna",
  procuracao_it: "Procuração Italiana — prévia interna",
  alteracao_escopo: "Termo de Alteração de Escopo — prévia interna",
};

function ModeloModal({ id, onClose }: { id: ModeloId; onClose: () => void }) {
  const caso = activeCase;
  const c = caso.contratacao;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-navy/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gold/40 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h4 className="font-serif text-xl text-navy">{TITULOS[id]}</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar prévia"
            className="rounded-full border border-border p-1.5 text-navy/70 hover:bg-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-widest text-terracotta">
          Rascunho interno · não vinculado a documento assinado
        </p>

        <div className="mt-4">
          {id === "ordem_servico" && (
            <>
              <Linha l="Código do caso" v={texto(c?.ordem_servico.case_id, caso.geral.case_id)} />
              <Linha l="Cliente" v={texto(caso.geral.cliente_nome)} />
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
                      <tr className="border-t border-border">
                        <td className="p-2 text-navy/70" colSpan={8}>
                          Nenhum item de despesa registrado até o momento.
                        </td>
                      </tr>
                    ) : (
                      c!.despesas_externas.itens.map((i) => (
                        <tr key={i.item} className="border-t border-border align-top">
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

          {(id === "procuracao_br" || id === "procuracao_it") && (
            <ProcuracaoPreview italiana={id === "procuracao_it"} />
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

function ProcuracaoPreview({ italiana }: { italiana: boolean }) {
  const c = activeCase.contratacao;
  const p = italiana ? c?.autorizacoes.procuracao_italiana : c?.autorizacoes.procuracao_brasileira;
  const orgao = preenchido(p?.orgao_destinatario)
    ? p!.orgao_destinatario
    : italiana
      ? "Órgão italiano ainda não confirmado"
      : "A confirmar";

  return (
    <>
      <Linha l="Finalidade específica" v={texto(p?.finalidade, NAO_INICIADO)} />
      <Linha l="Órgão destinatário" v={orgao} />
      {italiana && <Linha l="Comune / Consulado" v="Somente após confirmação oficial" />}
      <ListaCampo l="Pessoas vinculadas" itens={lista(p?.pessoas_vinculadas)} />
      <Linha l="Status" v={p ? PROCURACAO_LABEL[p.status] : "Não iniciada"} />
      <Linha l="Validade" v={texto(p?.validade, NAO_INICIADO)} />
      <Linha l="Observações" v={texto(p?.observacoes, "Sem observações registradas")} />
    </>
  );
}

export const kitContratualClasses = cn();
