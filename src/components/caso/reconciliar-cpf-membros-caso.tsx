import { AcaoOperacional } from "@/components/saas/acao-operacional";

/**
 * Corte R2 — mesma ideia de `ReconciliarCpfPartes`
 * (src/components/contrato/reconciliar-cpf-partes.tsx), mas para membros já
 * vinculados em `case_members` (não partes de contrato). Conecta
 * `conferirDivergenciaCpfMembrosCaso` (já implementada) a uma tela. Só
 * preenche CPF vazio a partir do cadastro canônico; um valor já gravado que
 * diverge nunca é sobrescrito automaticamente — fica marcado como conflito.
 */

type ItemPlanoReconciliacaoMembro = {
  membroId: string;
  nome: string;
  acao: "preencher" | "conflito" | "ja_sincronizado" | "sem_dado_canonico" | "dependente_nao_sincronizado";
  cpf?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO_MEMBRO: Record<ItemPlanoReconciliacaoMembro["acao"], string> = {
  preencher: "Vai preencher com o CPF canônico",
  conflito: "Diverge do cadastro canônico — não é gravado automaticamente",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem CPF",
  dependente_nao_sincronizado: "Dependente — nunca herda documento do responsável",
};

const ESTILO_ACAO_MEMBRO: Record<ItemPlanoReconciliacaoMembro["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

export function ReconciliarCpfMembrosCaso({
  plano,
  ocupado,
  onVerificar,
  onSincronizar,
  onResolverConflito,
}: {
  plano: ItemPlanoReconciliacaoMembro[] | null;
  ocupado?: boolean;
  onVerificar: () => void;
  onSincronizar: () => void;
  /** Conflito só se resolve membro a membro, com confirmação e motivo. */
  onResolverConflito?: (membroId: string, motivo: string) => void;
}) {
  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano ? plano.filter((p) => p.acao === "conflito").length : 0;

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Conferir CPF dos membros com o cadastro canônico</h3>
        <span className="text-[11px] text-navy/55">Pessoa Canônica · nunca funde automaticamente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Compara o CPF de cada membro do caso já vinculado a uma pessoa cadastrada (`clientes`). Só
        preenche quem está com CPF vazio. Um CPF já preenchido que diverge do canônico nunca é
        sobrescrito aqui — fica marcado como conflito para decisão humana.
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
          disabled={ocupado || preencher === 0}
          onClick={onSincronizar}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Preencher CPFs pendentes
        </button>
      </div>

      {plano ? (
        <p className="mt-2 text-xs text-navy/70">
          {preencher > 0
            ? `${preencher} membro(s) sem CPF podem ser preenchidos a partir do cadastro canônico.`
            : "Nada a preencher: nenhum membro está com CPF vazio e cadastro canônico disponível."}
          {conflitos > 0 ? ` ${conflitos} membro(s) com CPF divergente — veja abaixo.` : ""}
        </p>
      ) : null}

      {plano && plano.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {plano.map((p) => (
            <li key={p.membroId} className={`rounded border p-2 ${ESTILO_ACAO_MEMBRO[p.acao]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{p.nome}</p>
                <span className="text-[10px] uppercase tracking-wide">{ROTULO_ACAO_MEMBRO[p.acao]}</span>
              </div>
              {p.acao === "conflito" ? (
                <div className="mt-1 space-y-1">
                  <p className="text-[11px]">
                    No caso: {p.atual} · No cadastro canônico: {p.canonico}
                  </p>
                  {onResolverConflito ? (
                    <AcaoOperacional
                      size="sm"
                      variant="outline"
                      rotulo="Usar o CPF do cadastro canônico"
                      acaoExterna="resolver_conflito_cpf_membro"
                      efeito={`Substitui o CPF ${p.atual} deste membro no caso pelo CPF ${p.canonico} do cadastro canônico. Não funde pessoas; fica registrado no histórico e na auditoria.`}
                      onConfirmar={(motivo) => onResolverConflito(p.membroId, motivo)}
                    />
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
