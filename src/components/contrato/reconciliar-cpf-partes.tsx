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

import { formatarCpf } from "@/lib/validacao-pessoa";

type ItemPlanoReconciliacao = {
  parte: string;
  id: string;
  acao: "preencher" | "conflito" | "ja_sincronizado" | "sem_dado_canonico" | "dependente_nao_sincronizado";
  cpf?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO: Record<ItemPlanoReconciliacao["acao"], string> = {
  preencher: "Vai preencher com o CPF canônico",
  conflito: "Diverge do cadastro canônico — não é gravado automaticamente",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem CPF",
  dependente_nao_sincronizado: "Dependente — nunca herda documento do responsável",
};

const ESTILO_ACAO: Record<ItemPlanoReconciliacao["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

export function ReconciliarCpfPartes({
  plano,
  contratoAssinado,
  ocupado,
  onVerificar,
  onSincronizar,
}: {
  plano: ItemPlanoReconciliacao[] | null;
  contratoAssinado?: boolean;
  ocupado?: boolean;
  onVerificar: () => void;
  onSincronizar: () => void;
}) {
  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano ? plano.filter((p) => p.acao === "conflito").length : 0;

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
              {p.acao === "conflito" ? (
                <p className="mt-1 text-[11px]">
                  Na parte do contrato: {p.atual ? formatarCpf(p.atual) : p.atual} · No cadastro canônico:{" "}
                  {p.canonico ? formatarCpf(p.canonico) : p.canonico}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
