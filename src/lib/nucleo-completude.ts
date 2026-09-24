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

/**
 * Dossiê-mãe é do NÚCLEO (decisão da Proprietária, 24/09/2026). O banco já
 * garante um núcleo ativo por caso (índice `nucleos_familiares_caso_unico`);
 * estas regras fecham o resto no servidor, não só no texto da tela:
 * dossiê "ativo" exige referência, ambiente, nível de acesso, link interno e
 * responsável nominal, e a mesma referência não pode estar ativa em dois
 * núcleos (seria um segundo dossiê-mãe concorrente para a mesma família).
 */
export type DossieMaeEntrada = {
  dossie_mae?: string | null;
  ambiente?: string | null;
  nivel_acesso?: string | null;
  link_interno?: string | null;
  responsavel_nome?: string | null;
  dossie_status?: string | null;
};

const refDossie = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

export function motivosDossieMaeNaoAtivavel(d: DossieMaeEntrada): string[] {
  if (d.dossie_status !== "ativo") return [];
  const faltas: string[] = [];
  if (vazio(d.dossie_mae)) faltas.push("referência do dossiê-mãe");
  if (vazio(d.ambiente)) faltas.push("ambiente autorizado");
  if (vazio(d.nivel_acesso)) faltas.push("nível de acesso");
  if (vazio(d.link_interno)) faltas.push("link interno");
  if (vazio(d.responsavel_nome)) faltas.push("responsável nominal");
  return faltas;
}

export function nucleoComMesmoDossieAtivo(
  nucleoId: string,
  d: DossieMaeEntrada,
  outros: { id: string; nome?: string | null; dossie_mae?: string | null; dossie_status?: string | null; archived_at?: string | null }[],
): { id: string; nome: string | null } | null {
  if (d.dossie_status !== "ativo" || !refDossie(d.dossie_mae)) return null;
  const alvo = refDossie(d.dossie_mae);
  const achado = outros.find(
    (o) => o.id !== nucleoId && !o.archived_at && o.dossie_status === "ativo" && refDossie(o.dossie_mae) === alvo,
  );
  return achado ? { id: achado.id, nome: achado.nome ?? null } : null;
}

/**
 * Leitura canônica do dossiê-mãe de um caso: o núcleo ativo do caso é a
 * fonte. `crm_casos.dossie_mae_referencia` só entra como fallback declarado
 * "legado", nunca como segunda verdade silenciosa.
 */
export type DossieMaeDoCaso = {
  fonte: "nucleo" | "legado_caso" | "ausente";
  referencia: string | null;
  status: string | null;
  ativo: boolean;
  nucleoId: string | null;
};

export function dossieMaeDoCaso(
  nucleo: { id: string; dossie_mae?: string | null; dossie_status?: string | null } | null | undefined,
  referenciaLegadaDoCaso?: string | null,
): DossieMaeDoCaso {
  if (nucleo && !vazio(nucleo.dossie_mae)) {
    return {
      fonte: "nucleo",
      referencia: String(nucleo.dossie_mae).trim(),
      status: nucleo.dossie_status ?? null,
      ativo: nucleo.dossie_status === "ativo",
      nucleoId: nucleo.id,
    };
  }
  if (!vazio(referenciaLegadaDoCaso)) {
    return { fonte: "legado_caso", referencia: String(referenciaLegadaDoCaso).trim(), status: null, ativo: false, nucleoId: nucleo?.id ?? null };
  }
  return { fonte: "ausente", referencia: null, status: nucleo?.dossie_status ?? null, ativo: false, nucleoId: nucleo?.id ?? null };
}
