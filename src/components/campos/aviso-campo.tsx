/**
 * Aviso de campo inválido (03/10/2026).
 *
 * A varredura de máscaras mostrou por que ela vinha saindo 3 campos por
 * rodada: cada tela escrevia a condição, a mensagem e a classe de erro à
 * mão. Com a regra em `validacao-pessoa#motivoCampoInvalido` e a mensagem
 * aqui, religar um campo é uma linha — e a mensagem fica igual em todas as
 * telas, inclusive para quem usa `<input>` cru em vez do `<Texto>` do Desk.
 *
 * Isto NÃO bloqueia o salvamento: quem recusa é o servidor. É o motivo
 * aparecendo antes de a pessoa tentar.
 */
import { motivoCampoInvalido, type RegraCampo } from "@/lib/validacao-pessoa";

export { motivoCampoInvalido };
export type { RegraCampo };

/** Classe de borda para o input, quando houver motivo. */
export function classeCampo(base: string, motivo: string | null | undefined): string {
  return motivo ? `${base} border-terracotta` : base;
}

export function AvisoCampo({ motivo }: { motivo: string | null | undefined }) {
  if (!motivo) return null;
  return (
    <span role="alert" className="mt-1 block text-[11px] text-terracotta">
      {motivo}
    </span>
  );
}
