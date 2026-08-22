import { projetarParaCliente, type NoArvoreCliente } from "@/lib/genealogia-modulos";
import type { Evento, NoArvore, Perfil, Relacao } from "@/lib/pessoas-linhagens";

/**
 * Prévia do que o App Cliente veria: apenas pessoas, relações e eventos com
 * visibilidade “aprovada”. Esta tela não publica nada — é leitura derivada.
 */
export function AbaProjecaoCliente({
  perfis,
  relacoes,
  eventos,
  arvore,
}: {
  perfis: Perfil[];
  relacoes: Relacao[];
  eventos: Evento[];
  arvore: NoArvore[];
}) {
  const projecao = projetarParaCliente(perfis, relacoes, eventos, arvore);

  const renderNo = (n: NoArvoreCliente) => (
    <li key={n.personId} className="ml-4 border-l border-navy/10 pl-3">
      <span className="text-sm text-navy">{n.nome}</span>
      {n.filhos.length > 0 ? <ul className="mt-1 space-y-1">{n.filhos.map(renderNo)}</ul> : null}
    </li>
  );

  return (
    <section className="space-y-3">
      <p className="rounded-lg border border-navy/10 bg-cream px-3 py-2 text-xs text-navy/70">
        Prévia derivada, sem publicação. Somente registros marcados como aprovados aparecem; notas internas, hipóteses e
        estados de pesquisa nunca são projetados. {projecao.ocultos} item(ns) permanecem internos.
      </p>

      {!projecao.publicavel ? (
        <p className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          {projecao.motivo}
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-navy/10 bg-cream p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Árvore do cliente</p>
            <ul className="mt-2 space-y-1">{projecao.arvore.map(renderNo)}</ul>
          </div>
          <div className="rounded-xl border border-navy/10 bg-cream p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">Linha do tempo do cliente</p>
            <ol className="mt-2 space-y-1">
              {projecao.timeline.map((i) => (
                <li key={i.id} className="text-sm text-navy/80">
                  <span className="font-medium text-navy">{i.data}</span> — {i.pessoa}
                  {i.localidade ? ` · ${i.localidade}` : ""}
                </li>
              ))}
              {projecao.timeline.length === 0 ? (
                <p className="text-sm text-navy/60">Nenhum evento aprovado para projeção.</p>
              ) : null}
            </ol>
          </div>
        </>
      )}
    </section>
  );
}
