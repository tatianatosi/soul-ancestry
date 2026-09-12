import { lerODia } from "@/lib/painel-abertura";
import type { CardHoje } from "@/lib/painel-dia";

const achar = (cards: readonly CardHoje[], chave: string) =>
  cards.find((c) => c.chave === chave)?.total ?? null;

/**
 * A frase de abertura do Painel.
 *
 * Serve para a tela começar por alguém falando com a Proprietária, não por uma
 * grade de números. A frase é derivada dos mesmos cards que vêm logo abaixo —
 * se um deles não tem fonte, isso é dito, em vez de virar uma frase animadora
 * sobre carteira que o sistema não conhece.
 */
export function AberturaPainel({
  cards,
  totalCasos,
}: {
  cards: readonly CardHoje[];
  totalCasos: number;
}) {
  const { saudacao, leitura, semDados } = lerODia({
    vencidos: achar(cards, "acoes_vencidas"),
    hoje: achar(cards, "acoes_hoje"),
    semToque: achar(cards, "sla_em_risco"),
    totalCasos,
  });

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/50 p-5">
      <p className="text-[11px] uppercase tracking-widest text-navy/45">{hoje}</p>
      {/* Sem nome: o Desk tem equipe, e o Painel não carrega identidade de
          quem está logado. Saudar pelo nome errado é pior que não saudar. */}
      <h1 className="mt-1 font-serif text-2xl leading-tight text-navy">{saudacao}.</h1>
      <p className={`mt-1.5 text-sm ${semDados ? "text-navy/55" : "text-navy/80"}`}>{leitura}</p>
    </section>
  );
}
