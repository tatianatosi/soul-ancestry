/**
 * ANA-B-01 — Completude do núcleo familiar por critérios persistidos.
 *
 * `nucleoOk` deixa de ser "existe uma linha de núcleo" e passa a ser a
 * conjunção de critérios verificáveis, cada um com motivo explícito.
 * Espelha, em TypeScript, a função de banco `public.nucleo_completude`.
 */

export type CriterioNucleo = {
  chave: string;
  rotulo: string;
  ok: boolean;
  motivo?: string | null;
};

export type NucleoCompletude = {
  nucleo_id: string | null;
  itens: CriterioNucleo[];
  completo: boolean;
};

export type EntradaNucleo = {
  nucleo?: {
    id?: string | null;
    contratante_nome?: string | null;
    dossie_mae?: string | null;
    ambiente?: string | null;
    nivel_acesso?: string | null;
  } | null;
  membros?: { papel?: string | null }[];
  dependentes?: { status_representacao?: string | null }[];
};

const vazio = (v: unknown) => !String(v ?? "").trim();

/** Avalia os 5 critérios do núcleo. Nunca devolve booleano opaco sem motivo. */
export function avaliarNucleo(e: EntradaNucleo): NucleoCompletude {
  const n = e.nucleo ?? null;
  const membros = e.membros ?? [];
  const deps = e.dependentes ?? [];
  const semPapel = membros.filter((m) => vazio(m.papel)).length;
  const semStatus = deps.filter((d) => vazio(d.status_representacao)).length;

  const itens: CriterioNucleo[] = [
    {
      chave: "nucleo_vinculado",
      rotulo: "Núcleo familiar vinculado ao caso",
      ok: Boolean(n?.id),
      motivo: n?.id ? null : "Nenhum núcleo familiar ativo vinculado a este caso.",
    },
    {
      chave: "contratante",
      rotulo: "Contratante identificada",
      ok: !vazio(n?.contratante_nome),
      motivo: vazio(n?.contratante_nome) ? "Contratante do núcleo não identificada." : null,
    },
    {
      chave: "participantes",
      rotulo: "Participantes com papel definido",
      ok: membros.length > 0 && semPapel === 0,
      motivo:
        membros.length === 0
          ? "Nenhum participante registrado no núcleo."
          : semPapel > 0
            ? `${semPapel} participante(s) sem papel definido.`
            : null,
    },
    {
      chave: "dependentes",
      rotulo: "Dependentes com status de representação",
      ok: semStatus === 0,
      motivo: semStatus > 0 ? `${semStatus} dependente(s) sem status de representação.` : null,
    },
    {
      chave: "dossie_ambiente",
      rotulo: "Dossiê-mãe, ambiente e nível de acesso",
      ok: !vazio(n?.dossie_mae) && !vazio(n?.ambiente) && !vazio(n?.nivel_acesso),
      motivo: !n?.id
        ? "Sem núcleo para avaliar dossiê e ambiente."
        : vazio(n?.dossie_mae) || vazio(n?.ambiente) || vazio(n?.nivel_acesso)
          ? "Dossiê-mãe, ambiente ou nível de acesso não registrados."
          : null,
    },
  ];

  return { nucleo_id: n?.id ?? null, itens, completo: itens.every((i) => i.ok) };
}

/** Itens pendentes prontos para exibição na ficha. */
export function pendenciasNucleo(c: NucleoCompletude): CriterioNucleo[] {
  return c.itens.filter((i) => !i.ok);
}
