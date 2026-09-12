/**
 * Auto-cura (D-02): re-sincroniza a instância de TODOS os anexos —
 * incluindo o Anexo I, Ordem de Serviço — a partir da ficha atual do caso.
 * Corrige o caso em que `contract_annexes` ficou vazio porque a última
 * prévia salva do caso é anterior à entrada em operação da camada de
 * persistência. Mostra primeiro o que será feito; só grava após confirmação.
 */

type ItemPlanoRessincronizacao = {
  codigo: string;
  titulo: string;
  acao: "materializar" | "ja_canonica";
  versaoAtual: number | null;
};

const ROTULO_ACAO: Record<ItemPlanoRessincronizacao["acao"], string> = {
  materializar: "Vai gerar versão",
  ja_canonica: "Já é a instância vigente",
};

export function RessincronizarAnexos({
  plano,
  ocupado,
  onVerificar,
  onSincronizar,
}: {
  plano: ItemPlanoRessincronizacao[] | null;
  ocupado?: boolean;
  onVerificar: () => void;
  onSincronizar: () => void;
}) {
  const pendentes = plano ? plano.filter((p) => p.acao === "materializar").length : 0;
  const semPendencia = pendentes === 0;

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Sincronizar anexos com a ficha atual</h3>
        <span className="text-[11px] text-navy/55">Autocura · sem exigir nova prévia</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Recalcula todos os anexos (Ordem de Serviço incluída) a partir dos dados já salvos do caso. Use quando a instância
        oficial ficou vazia apesar de a ficha estar preenchida — sem gerar nova prévia nem inventar dado. Nenhuma comunicação,
        cobrança, assinatura ou publicação é disparada.
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
          disabled={ocupado}
          onClick={onSincronizar}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Sincronizar agora
        </button>
      </div>

      {semPendencia ? (
        <p className="mt-2 text-xs text-terracotta">
          Pendência: nenhum anexo está marcado para materializar. Sincronizar agora recalcula sem mudança prevista.
        </p>
      ) : null}

      {plano && (
        <p className="mt-2 text-xs text-navy/70">
          {pendentes > 0
            ? `${pendentes} anexo(s) serão versionados a partir da ficha atual.`
            : "Nada a sincronizar: todos os anexos já refletem a ficha atual."}
        </p>
      )}

      {plano && plano.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {plano.map((p) => (
            <li
              key={p.codigo}
              className={`rounded border p-2 ${
                p.acao === "materializar" ? "border-gold/50 bg-gold/10 text-navy/80" : "border-navy/20 bg-cream/40 text-navy/70"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium">{p.titulo}</p>
                <span className="text-[10px] uppercase tracking-wide">
                  {ROTULO_ACAO[p.acao]}
                  {p.versaoAtual ? ` · versão atual ${p.versaoAtual}` : " · sem versão salva"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
