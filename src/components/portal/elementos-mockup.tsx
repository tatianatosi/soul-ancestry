import { useState, type ReactNode } from "react";
import { Check, ChevronDown, MessageCircle } from "lucide-react";

import { WHATSAPP_ESPECIALISTA } from "@/lib/contato-especialista";
import type { ResumoCasoCliente } from "@/lib/portal-resumo-caso";
import { rotuloSeloCaso } from "@/lib/selo-caso-cliente";
import { cn } from "@/lib/utils";

/**
 * Elementos gráficos do mockup original (13/10/2026), compartilhados pelas
 * sete abas. Todos só exibem dado já registrado/publicado; ausência vira
 * cartão editorial "Em preparação"/"Em pesquisa".
 */

export function CartaoEditorial({
  titulo,
  texto,
  estado = "Em preparação",
}: {
  titulo?: string;
  texto: string;
  estado?: "Em preparação" | "Em pesquisa";
}) {
  return (
    <div className="rounded-xl border border-border border-l-4 border-l-gold/50 bg-white px-4 py-4" data-cartao-editorial>
      {titulo ? <p className="font-serif text-lg text-navy">{titulo}</p> : null}
      <p className={cn("text-sm leading-relaxed text-navy/70", titulo && "mt-1")}>{texto}</p>
      <span className="mt-3 inline-flex rounded-full border border-gold/60 px-2.5 py-0.5 text-[11px] font-medium text-[var(--app-ouro-texto)]">
        {estado}
      </span>
    </div>
  );
}

/** Régua "Hoje você está aqui" — 5 etapas de src/lib/etapas-caso.ts. */
export function ReguaEtapas({ etapas }: { etapas: ResumoCasoCliente["etapas"] }) {
  if (etapas.length === 0) return null;
  const indiceAtual = etapas.findIndex((e) => e.estado !== "concluido");
  const todasConcluidas = indiceAtual === -1;
  return (
    <div className="mt-4 border-t border-cream/10 pt-4" data-regua-etapas aria-label="Hoje você está aqui">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cream/70">Hoje você está aqui</p>
      <ol className="mt-3 grid grid-cols-5 gap-0.5" lang="pt-BR">
        {etapas.map((e, i) => {
          const concluida = e.estado === "concluido";
          const atual = i === indiceAtual;
          return (
            <li key={e.id} className="relative flex min-w-0 flex-col items-center text-center">
              {i > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", concluida || atual ? "bg-gold" : "bg-cream/20")}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold",
                  concluida && "border-gold bg-gold text-navy",
                  atual && "border-gold bg-navy text-gold ring-4 ring-gold/25",
                  !concluida && !atual && "border-cream/40 bg-navy text-cream/60",
                )}
                aria-current={atual ? "step" : undefined}
              >
                {concluida ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn("mt-1.5 block w-full hyphens-auto text-[9px] leading-tight min-[400px]:text-[10px] sm:text-xs", atual ? "font-semibold text-gold" : "text-cream/75")}>
                {e.rotulo}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-cream">
        {todasConcluidas ? "As cinco etapas de preparação estão concluídas." : <>Etapa atual: <span className="text-gold">{etapas[indiceAtual]!.rotulo}</span></>}
      </p>
    </div>
  );
}

/** Selo do estado real do caso: "Caso ativo" só quando o registro diz ativo. */
export function SeloEstadoCaso({ resumo }: { resumo: ResumoCasoCliente | null | undefined }) {
  const texto = rotuloSeloCaso(resumo?.statusCaso ?? null, resumo?.ativo);
  if (!texto) return null;
  return (
    <span
      data-selo-estado-caso
      className="inline-flex min-h-6 items-center rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy"
    >
      {texto}
    </span>
  );
}

export function CartaoAssessoria() {
  return (
    <section aria-label="Assessoria Familiar" data-home-assessoria className="rounded-xl bg-navy-800 p-5 text-cream shadow-md">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold">Assessoria Familiar</p>
      <h3 className="mt-1 font-serif text-xl text-cream">Fale com a especialista do seu caso</h3>
      <p className="mt-1 text-sm text-cream/75">Dúvidas sobre a jornada da sua família? Converse direto com a assessoria.</p>
      <a
        href={WHATSAPP_ESPECIALISTA.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-navy"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        WhatsApp {WHATSAPP_ESPECIALISTA.rotulo}
      </a>
    </section>
  );
}

/** Cartão de achado com borda dourada e "Ver detalhes" que expande o texto. */
export function CartaoAchado({ rotulo, titulo, resumo, extra }: { rotulo: ReactNode; titulo: string; resumo?: string; extra?: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <article className="rounded-xl border border-border border-l-4 border-l-gold bg-white px-4 py-3" data-cartao-achado>
      <p className="text-[10px] font-medium uppercase tracking-widest text-[var(--app-ouro-texto)]">{rotulo}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-navy">{titulo}</p>
      {resumo ? <p className={cn("mt-1 text-xs text-navy/70", !aberto && "line-clamp-2")}>{resumo}</p> : null}
      {aberto ? extra : null}
      {resumo || extra ? (
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-navy underline decoration-gold underline-offset-4"
        >
          {aberto ? "Ver menos" : "Ver detalhes"}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", aberto && "rotate-180")} aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
}

export function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "–";
  return ((partes[0]![0] ?? "") + (partes.length > 1 ? partes[partes.length - 1]![0] ?? "" : "")).toUpperCase();
}

export function dataCurta(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
