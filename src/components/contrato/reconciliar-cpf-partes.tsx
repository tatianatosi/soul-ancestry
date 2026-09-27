/**
 * Corte R1 — de-para-pessoa-unificada.md / auditoria de reconciliação
 * (21/09/2026): conecta `sincronizarPessoaDoCaso` (já implementada e
 * autorizada em 06/09/2026, "Fase 3 da unificação de pessoa") a uma tela —
 * até aqui a função existia sem nenhum lugar que a chamasse. Mostra o CPF de
 * cada parte do contrato contra o cadastro canônico (`clientes`) antes de
 * gravar qualquer coisa. Só preenche o que está vazio; um valor já
 * registrado que diverge nunca é sobrescrito sozinho — vira "conflito",
 * informativo, para decisão humana fora desta tela.
 */

import { useState } from "react";
import { formatarCpf } from "@/lib/validacao-pessoa";
import type { DecisaoConflitoContrato } from "@/lib/contratos.functions";

type ItemPlanoReconciliacao = {
  parte: string;
  id: string;
  acao:
    | "preencher"
    | "conflito"
    | "conflito_aceito"
    | "ja_sincronizado"
    | "sem_dado_canonico"
    | "dependente_nao_sincronizado";
  cpf?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO: Record<ItemPlanoReconciliacao["acao"], string> = {
  preencher: "Vai preencher com o CPF canônico",
  conflito: "Diverge do cadastro canônico — decisão humana pendente",
  conflito_aceito: "Divergência mantida por decisão humana (com motivo registrado)",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem CPF",
  dependente_nao_sincronizado: "Dependente — nunca herda documento do responsável",
};

const ESTILO_ACAO: Record<ItemPlanoReconciliacao["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  conflito_aceito: "border-navy/20 bg-cream/40 text-navy/70",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

/**
 * Fase E (27/09/2026): 3 decisões explícitas para um conflito de CPF, cada
 * uma exigindo motivo — nunca uma sobrescrita silenciosa.
 */
function ResolverConflito({
  item,
  contratoAssinado,
  ocupado,
  onResolver,
}: {
  item: ItemPlanoReconciliacao;
  contratoAssinado?: boolean;
  ocupado?: boolean;
  onResolver: (decisao: DecisaoConflitoContrato, motivo: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  if (contratoAssinado) return null;
  if (!aberto) {
    return (
      <button
        type="button"
        disabled={ocupado}
        onClick={() => setAberto(true)}
        className="mt-1 rounded border border-terracotta/40 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10 disabled:opacity-50"
      >
        Resolver conflito
      </button>
    );
  }
  return (
    <div className="mt-2 space-y-2 rounded border border-terracotta/30 bg-white/60 p-2">
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder="Motivo da decisão (obrigatório)"
        className="w-full rounded border border-navy/20 p-1.5 text-[11px]"
        rows={2}
      />
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          disabled={ocupado || !motivo.trim()}
          onClick={() => onResolver("atualizar_snapshot", motivo)}
          className="rounded bg-navy px-2 py-1 text-[11px] text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Atualizar contrato com o canônico
        </button>
        <button
          type="button"
          disabled={ocupado || !motivo.trim()}
          onClick={() => onResolver("corrigir_pessoa_canonica", motivo)}
          className="rounded border border-navy/25 px-2 py-1 text-[11px] text-navy hover:bg-cream/50 disabled:opacity-40"
        >
          Corrigir cadastro canônico
        </button>
        <button
          type="button"
          disabled={ocupado || !motivo.trim()}
          onClick={() => onResolver("manter_com_motivo", motivo)}
          className="rounded border border-navy/25 px-2 py-1 text-[11px] text-navy hover:bg-cream/50 disabled:opacity-40"
        >
          Manter divergência (com motivo)
        </button>
      </div>
    </div>
  );
}

export function ReconciliarCpfPartes({
  plano,
  contratoAssinado,
  ocupado,
  onVerificar,
  onSincronizar,
  onResolverConflito,
}: {
  plano: ItemPlanoReconciliacao[] | null;
  contratoAssinado?: boolean;
  ocupado?: boolean;
  onVerificar: () => void;
  onSincronizar: () => void;
  onResolverConflito?: (id: string, decisao: DecisaoConflitoContrato, motivo: string) => void;
}) {
  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano ? plano.filter((p) => p.acao === "conflito" || p.acao === "conflito_aceito").length : 0;

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Conferir CPF com o cadastro canônico</h3>
        <span className="text-[11px] text-navy/55">Pessoa Canônica · nunca funde automaticamente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Compara o CPF de cada parte do contrato com o cadastro canônico da pessoa (`clientes`). Só
        preenche quem está vazio. Um CPF já preenchido que diverge do canônico nunca é sobrescrito
        aqui — fica marcado como conflito para decisão humana.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={ocupado}
          onClick={onVerificar}
          className="rounded border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream/50 disabled:opacity-50"
        >
          Ver o que será feito
        </button>
        <button
          type="button"
          disabled={ocupado || Boolean(contratoAssinado) || preencher === 0}
          onClick={onSincronizar}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Preencher CPFs pendentes
        </button>
      </div>

      {contratoAssinado ? (
        <p className="mt-2 text-xs text-terracotta">
          Contrato já assinado: partes não podem ser alteradas por aqui.
        </p>
      ) : null}

      {plano ? (
        <p className="mt-2 text-xs text-navy/70">
          {preencher > 0
            ? `${preencher} parte(s) sem CPF podem ser preenchidas a partir do cadastro canônico.`
            : "Nada a preencher: nenhuma parte está com CPF vazio e cadastro canônico disponível."}
          {conflitos > 0 ? ` ${conflitos} parte(s) com CPF divergente — veja abaixo.` : ""}
        </p>
      ) : null}

      {plano && plano.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {plano.map((p) => (
            <li key={p.id} className={`rounded border p-2 ${ESTILO_ACAO[p.acao]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{p.parte}</p>
                <span className="text-[10px] uppercase tracking-wide">{ROTULO_ACAO[p.acao]}</span>
              </div>
              {p.acao === "conflito" || p.acao === "conflito_aceito" ? (
                <>
                  <p className="mt-1 text-[11px]">
                    Na parte do contrato: {p.atual ? formatarCpf(p.atual) : p.atual} · No cadastro canônico:{" "}
                    {p.canonico ? formatarCpf(p.canonico) : p.canonico}
                  </p>
                  {onResolverConflito ? (
                    <ResolverConflito
                      item={p}
                      contratoAssinado={contratoAssinado}
                      ocupado={ocupado}
                      onResolver={(decisao, motivo) => onResolverConflito(p.id, decisao, motivo)}
                    />
                  ) : null}
                </>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
