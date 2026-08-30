/**
 * Detecção de possíveis duplicidades de núcleo familiar — Fase 1 do prompt canônico
 * "Unificação controlada de núcleos familiares".
 *
 * Puramente sugestiva: nunca decide, nunca funde, nunca marca nada como igual.
 * Cada candidato carrega o motivo objetivo (o que exatamente bateu) para que a
 * decisão de unificar ou descartar continue sendo humana.
 *
 * Sem persistência: como não há coluna/tabela para guardar "em revisão",
 * "descartado" etc., a lista é recalculada a cada carregamento — ver nota no
 * componente da tela.
 */

export type MembroParaComparar = { nome: string; papel?: string | null };

export type NucleoParaComparar = {
  id: string;
  nome: string;
  dossie_mae: string | null;
  contratante_nome: string | null;
  dossie_status: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  case_id: string | null;
  caso: { id: string; codigo: string | null; titulo: string | null; pais: string | null } | null;
  membros: MembroParaComparar[];
};

export type NivelConfianca = "alta" | "media" | "baixa";

export type CandidatoDuplicidade = {
  chave: string;
  nucleoA: NucleoParaComparar;
  nucleoB: NucleoParaComparar;
  motivos: string[];
  confianca: NivelConfianca;
  pessoasEmComum: string[];
  status: "sugerido";
};

function normalizar(v: string | null | undefined): string {
  return (v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function nomesDeMembros(n: NucleoParaComparar): Set<string> {
  return new Set(n.membros.map((m) => normalizar(m.nome)).filter(Boolean));
}

/** Só considera "em comum" nome com pelo menos 2 palavras — evita falso positivo por primeiro nome comum ("Ana", "João"). */
function nomeComparavel(nome: string): boolean {
  return nome.split(/\s+/).filter(Boolean).length >= 2;
}

export function detectarDuplicidades(nucleos: NucleoParaComparar[]): CandidatoDuplicidade[] {
  const ativos = nucleos.filter((n) => n.status !== "arquivado");
  const candidatos: CandidatoDuplicidade[] = [];

  for (let i = 0; i < ativos.length; i++) {
    for (let j = i + 1; j < ativos.length; j++) {
      const a = ativos[i];
      const b = ativos[j];
      const motivos: string[] = [];

      const mesmoCaso = Boolean(a.case_id && b.case_id && a.case_id === b.case_id);
      if (mesmoCaso) motivos.push("Os dois núcleos apontam para o mesmo caso.");

      const nomesA = nomesDeMembros(a);
      const nomesB = nomesDeMembros(b);
      const emComum = [...nomesA].filter((n) => nomeComparavel(n) && nomesB.has(n));
      if (emComum.length > 0) {
        motivos.push(`${emComum.length} pessoa(s) com nome completo em comum entre os núcleos.`);
      }

      const nomeNucleoA = normalizar(a.nome);
      const nomeNucleoB = normalizar(b.nome);
      const nomeSemelhante =
        nomeNucleoA.length > 3 &&
        nomeNucleoB.length > 3 &&
        (nomeNucleoA.includes(nomeNucleoB) || nomeNucleoB.includes(nomeNucleoA));
      if (nomeSemelhante && !mesmoCaso) motivos.push("Nome do núcleo semelhante.");

      const contratanteIgual =
        a.contratante_nome && b.contratante_nome && normalizar(a.contratante_nome) === normalizar(b.contratante_nome);
      if (contratanteIgual) motivos.push("Mesmo nome de contratante registrado nos dois núcleos.");

      if (motivos.length === 0) continue;

      let confianca: NivelConfianca = "baixa";
      if (mesmoCaso || emComum.length >= 2 || contratanteIgual) confianca = "alta";
      else if (emComum.length === 1) confianca = "media";

      candidatos.push({
        chave: `${a.id}:${b.id}`,
        nucleoA: a,
        nucleoB: b,
        motivos,
        confianca,
        pessoasEmComum: emComum,
        status: "sugerido",
      });
    }
  }

  const peso: Record<NivelConfianca, number> = { alta: 0, media: 1, baixa: 2 };
  return candidatos.sort((x, y) => peso[x.confianca] - peso[y.confianca]);
}
