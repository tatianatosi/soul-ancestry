import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { formatarCep } from "@/lib/validacao-pessoa";

/**
 * P31 (26/09/2026) — mesmo padrão de `ReconciliarTelefoneMembrosCaso`
 * (reconciliar-telefone-membros-caso.tsx), para CEP. Conecta
 * `conferirDivergenciaCepMembrosCaso` a uma tela. Só preenche CEP vazio a
 * partir do cadastro canônico; um valor já gravado que diverge nunca é
 * sobrescrito automaticamente — fica marcado como conflito.
 */

type ItemPlanoReconciliacaoCep = {
  membroId: string;
  nome: string;
  acao: "preencher" | "conflito" | "ja_sincronizado" | "sem_dado_canonico" | "dependente_nao_sincronizado";
  cep?: string;
  atual?: string;
  canonico?: string;
};

const ROTULO_ACAO_CEP: Record<ItemPlanoReconciliacaoCep["acao"], string> = {
  preencher: "Vai preencher com o CEP canônico",
  conflito: "Diverge do cadastro canônico — não é gravado automaticamente",
  ja_sincronizado: "Já bate com o cadastro canônico",
  sem_dado_canonico: "Cadastro canônico ainda sem CEP",
  dependente_nao_sincronizado: "Dependente — nunca herda endereço do responsável",
};

const ESTILO_ACAO_CEP: Record<ItemPlanoReconciliacaoCep["acao"], string> = {
  preencher: "border-gold/50 bg-gold/10 text-navy/80",
  conflito: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  ja_sincronizado: "border-navy/20 bg-cream/40 text-navy/70",
  sem_dado_canonico: "border-navy/10 bg-cream/30 text-navy/55",
  dependente_nao_sincronizado: "border-navy/10 bg-cream/30 text-navy/55",
};

export function ReconciliarCepMembrosCaso({
  plano,
  ocupado,
  onVerificar,
  onSincronizar,
  onResolverConflito,
}: {
  plano: ItemPlanoReconciliacaoCep[] | null;
  ocupado?: boolean;
  onVerificar: () => void;
  onSincronizar: () => void;
  onResolverConflito?: (membroId: string, motivo: string) => void;
}) {
  const preencher = plano ? plano.filter((p) => p.acao === "preencher").length : 0;
  const conflitos = plano ? plano.filter((p) => p.acao === "conflito").length : 0;

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Conferir CEP dos membros com o cadastro canônico</h3>
        <span className="text-[11px] text-navy/55">Pessoa Canônica · nunca funde automaticamente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Compara o CEP de cada membro do caso já vinculado a uma pessoa cadastrada (`clientes`). Só
        preenche quem está com CEP vazio. Um CEP já preenchido que diverge do canônico nunca é
        sobrescrito aqui — fica marcado como conflito para decisão humana. Esta é a única tela que
        conecta os dois lugares onde o CEP existe hoje (endereço da pessoa e endereço do membro no
        caso) — não precisa mais conferir os dois separadamente.
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
          Preencher CEPs pendentes
        </button>
      </div>

      {plano ? (
        <p className="mt-2 text-xs text-navy/70">
          {preencher > 0
            ? `${preencher} membro(s) sem CEP podem ser preenchidos a partir do cadastro canônico.`
            : "Nada a preencher: nenhum membro está com CEP vazio e cadastro canônico disponível."}
          {conflitos > 0 ? ` ${conflitos} membro(s) com CEP divergente — veja abaixo.` : ""}
        </p>
      ) : null}

      {plano && plano.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {plano.map((p) => (
            <li key={p.membroId} className={`rounded border p-2 ${ESTILO_ACAO_CEP[p.acao]}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{p.nome}</p>
                <span className="text-[10px] uppercase tracking-wide">{ROTULO_ACAO_CEP[p.acao]}</span>
              </div>
              {p.acao === "conflito" ? (
                <div className="mt-1 space-y-1">
                  <p className="text-[11px]">
                    No caso: {p.atual ? formatarCep(p.atual) : p.atual} · No cadastro canônico:{" "}
                    {p.canonico ? formatarCep(p.canonico) : p.canonico}
                  </p>
                  {onResolverConflito ? (
                    <AcaoOperacional
                      size="sm"
                      variant="outline"
                      rotulo="Usar o CEP do cadastro canônico"
                      acaoExterna="resolver_conflito_cep_membro"
                      efeito={`Substitui o CEP ${p.atual} deste membro no caso pelo CEP ${p.canonico} do cadastro canônico. Não funde pessoas; fica registrado no histórico e na auditoria.`}
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
