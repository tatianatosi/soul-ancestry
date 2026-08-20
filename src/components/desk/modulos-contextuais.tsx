import { useState } from "react";
import { Bot, ChevronRight, X } from "lucide-react";

import { modulosDaTela, TELA_DESK_LABEL, type TelaDesk } from "@/lib/desk-modulos";
import { cn } from "@/lib/utils";

/**
 * Painel contextual: lista os módulos profundos que residem DENTRO da tela
 * principal aberta. Não cria aba principal nem navegação nova.
 */
export function PainelModulosContextuais({ tela }: { tela: TelaDesk }) {
  const modulos = modulosDaTela(tela);
  const [aberto, setAberto] = useState(false);
  if (!modulos.length) return null;

  return (
    <section className="mb-6 rounded-2xl border border-navy/15 bg-white/80 p-4">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-[11px] uppercase tracking-widest text-gold">
            Módulos desta tela
          </span>
          <span className="font-serif text-lg text-navy">
            {TELA_DESK_LABEL[tela]} · {modulos.length} módulos contextuais
          </span>
        </span>
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-navy/50 transition", aberto && "rotate-90")} />
      </button>

      {aberto ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {modulos.map((m) => (
            <li key={m.id} className="rounded-xl border border-navy/10 bg-cream/50 p-3">
              <div className="text-sm font-medium text-navy">{m.nome}</div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wide text-navy/50">
                {m.forma.replace("_", " ")} · {m.destino}
              </div>
              <p className="mt-1 text-[12px] leading-snug text-navy/70">{m.descricao}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[12px] text-navy/60">
          Os módulos profundos permanecem dentro desta tela como subrota ou painel. Nenhum deles vira aba
          principal.
        </p>
      )}
    </section>
  );
}

/** Assistente AI como painel lateral global — nunca aba principal. */
export function AssistenteLateral({ contexto }: { contexto: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        data-testid="assistente-lateral-botao"
        onClick={() => setAberto(true)}
        aria-label="Abrir assistente"
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full border border-gold/60 bg-navy px-4 py-3 text-xs font-semibold text-cream shadow-lg md:bottom-8"
      >
        <Bot className="h-4 w-4 text-gold" /> Assistente
      </button>

      {aberto ? (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-navy/20 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-navy/10 bg-navy px-4 py-3 text-cream">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gold">Assistente contextual</p>
              <p className="font-serif text-lg">{contexto}</p>
            </div>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar assistente">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm text-navy/75">
            <p>
              O assistente lê o contexto da tela aberta ({contexto}) e do caso selecionado para apoiar a
              leitura operacional.
            </p>
            <p className="rounded-xl border border-navy/10 bg-cream/60 p-3 text-[12px]">
              Nenhuma cobrança, contrato, mensagem, pesquisa externa, pasta, integração ou publicação é
              executada a partir deste painel.
            </p>
          </div>
        </aside>
      ) : null}
    </>
  );
}
