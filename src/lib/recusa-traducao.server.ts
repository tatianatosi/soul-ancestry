/**
 * Peça B do laudo "nada persiste" (#189, 27/10/2026): "Hoje a recusa chega
 * como texto cru do Postgres. Um mapa de `raise` → orientação ('o que isso
 * protege / o que fazer'), aplicado no ponto único por onde as recusas já
 * passam (`persistencia.server.ts`). Um lugar, 692 recusas."
 *
 * O "um lugar" é o mecanismo: toda recusa que passa por `exigirLinhaGravada`
 * atravessa `traduzirRecusa`, então as 692 já estão cobertas pelo hook —
 * mas só as entradas abaixo, com texto e contexto REALMENTE verificados
 * contra o trigger vivo (via `pg_get_functiondef`), ganham orientação.
 * Para as demais 690, `traduzirRecusa` devolve a mensagem original sem
 * alteração — nunca inventa orientação para um `RAISE EXCEPTION` que não
 * foi lido.
 *
 * Somar uma entrada aqui exige 1) o texto exato do `RAISE EXCEPTION` lido
 * do banco vivo (não do arquivo de migration — pode ter sido alterado por
 * um `supabase/pendentes/*.sql` aplicado depois) e 2) a orientação
 * confirmada, não deduzida.
 */

type EntradaTraducao = {
  /** Casa o início da mensagem crua do Postgres — textos com `%` no RAISE já chegam interpolados. */
  padrao: RegExp;
  /** O que o portão protege e o que fazer — some ao final da mensagem original, nunca a substitui. */
  orientacao: string;
};

const TRADUCOES: readonly EntradaTraducao[] = [
  {
    // fn_piloto_caso_guard (migration 20260816232935, cedendo a
    // fn_proprietaria_operando() desde supabase/pendentes/20261024170000).
    padrao: /Ativação operacional NO_GO\. Bloqueios críticos abertos: /,
    orientacao:
      "Decisão da Proprietária sobre dado de família real (contrato assinado com registro externo, consentimento, revisão jurídica, representação legal do menor) — não é bug. Veja a lista completa na Lista de Casos ou no Caso 360, seção de identidade.",
  },
  {
    // fn_guard_ativacao (migration 20260816191148, mesma condição de override).
    padrao: /Ativação bloqueada\. Requisitos pendentes: /,
    orientacao:
      "Os requisitos listados vêm de case_activation_checks. Quem está logado como Proprietária (admin ativo) pode confirmar a ativação mesmo assim; qualquer outro papel precisa fechar os requisitos antes.",
  },
  {
    // fn_guard_ativacao, mesma migration — papel sem permissão de ativar.
    padrao: /Somente admin ou operações podem ativar um caso\./,
    orientacao: "Peça para alguém com papel admin ou operações ativar este caso.",
  },
];

/**
 * Traduz a recusa crua do Postgres, somando orientação quando o portão é
 * conhecido. Sem correspondência, devolve a mensagem original — nunca
 * inventa contexto para um portão que este arquivo não leu.
 */
export function traduzirRecusa(mensagemCrua: string): string {
  const entrada = TRADUCOES.find((t) => t.padrao.test(mensagemCrua));
  if (!entrada) return mensagemCrua;
  return `${mensagemCrua} — ${entrada.orientacao}`;
}
