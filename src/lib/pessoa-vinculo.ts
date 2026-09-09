/**
 * Vínculo pessoa → cliente por nome: usado onde uma pessoa (núcleo,
 * checklist, contrato) precisa ser ligada ao cadastro canônico em
 * `clientes` sem que o operador precise escolher manualmente. Só liga
 * quando exatamente um cliente ativo da organização bate por igualdade ou
 * por um nome ser prefixo do outro seguido de espaço (cobre nome curto vs.
 * nome completo — ex.: "Ana Luiza" e "Ana Luiza Gomes Silveira Rodrigues",
 * causa raiz da fragmentação da Ana em nucleo_membros/contract_parties).
 * Ambíguo (mais de um candidato) devolve null — nunca escolhe ao acaso.
 * Mesma regra usada no backfill SQL (migration
 * 20260904140000_pessoa360_vinculo_case_members_e_backfill_cliente_id).
 */
export function clienteCorrespondentePorNome(nome: string, clientes: { id: string; nome: string }[]): string | null {
  const alvo = nome.trim().toLowerCase();
  const candidatos = clientes.filter((c) => {
    const cn = c.nome.trim().toLowerCase();
    return cn === alvo || alvo.startsWith(`${cn} `) || cn.startsWith(`${alvo} `);
  });
  return candidatos.length === 1 ? candidatos[0].id : null;
}

export type MembroNucleoBruto = {
  id: string;
  nome: string;
  papel: string | null;
  vinculo: string | null;
  processo: string | null;
  ordem: number | null;
  cliente_id: string | null;
};

/**
 * Pessoa do caso, no formato que os consumidores de `case_members` esperam.
 *
 * Causa: a migration `20260821152043` arquivou de propósito as linhas de
 * `case_members` de qualquer caso cujo núcleo em Núcleos já tem a mesma
 * composição — Núcleos vira a única fonte de pessoas do caso, por decisão
 * já tomada (ver `docs/relatorios/2026-09-05_execucao_pessoa_360_operacional.md`,
 * seção 3). O problema real: 4 funções continuaram lendo só `case_members`
 * (arquivado = vazio) e nunca foram redirecionadas para Núcleos.
 *
 * `nucleo_membros` não distingue "titular" de "contratante" com um booleano
 * próprio — só tem `papel` ('contratante_signatario'/'dependente') e `ordem`.
 * Contra o único caso real hoje fragmentado desta forma (Ana Luiza), a regra
 * observada é: o membro de `ordem` mais baixa com papel contratante_signatario
 * é quem assina como contratante; os demais do mesmo papel são titulares
 * (adultos do núcleo, sem ser quem contrata); dependente é dependente. Isto é
 * uma aproximação, não um campo capturado — nacionalidade, CPF, data de
 * nascimento, representante legal e status cadastral continuam sem fonte em
 * Núcleos (eram nulos em `case_members` também, então não há retrocesso).
 */
export function pessoaDoCasoAPartirDoNucleo(m: MembroNucleoBruto, ordemMinimaContratante: number) {
  const titular = m.papel === "contratante_signatario";
  const dependente = m.papel === "dependente";
  const contratante = titular && (m.ordem ?? Infinity) <= ordemMinimaContratante;
  return {
    origem: "nucleo" as const,
    id: m.id,
    nome: m.nome,
    cliente_id: m.cliente_id,
    papel_no_caso: contratante ? "contratante" : titular ? "titular" : "dependente",
    titular,
    contratante,
    dependente,
    parentesco: m.vinculo,
    requerente: false,
    nacionalidade: null as string | null,
    cpf: null as string | null,
    data_nascimento: null as string | null,
    representante_legal: null as string | null,
    status_cadastral: "pendente" as string,
  };
}

export type PessoaDoCaso = Omit<ReturnType<typeof pessoaDoCasoAPartirDoNucleo>, "origem"> & {
  origem: "nucleo" | "case_members";
};

/** Menor `ordem` entre os membros com papel contratante_signatario (o signatário principal). */
export function ordemDoContratantePrincipal(membros: MembroNucleoBruto[]): number {
  const ordens = membros
    .filter((m) => m.papel === "contratante_signatario")
    .map((m) => m.ordem ?? Infinity);
  return ordens.length > 0 ? Math.min(...ordens) : -1;
}

/**
 * Pessoas do caso: `case_members` ativo quando existir; senão, fallback para
 * Núcleos (ver `pessoaDoCasoAPartirDoNucleo`) via `nucleos_familiares.case_id`.
 * Nunca funde as duas fontes — usa uma ou outra, para não duplicar pessoa.
 */
export async function pessoasDoCasoComFallbackNucleo(
  supabase: { from: (t: string) => any },
  caseId: string,
): Promise<PessoaDoCaso[]> {
  const { data: membrosCaso } = await supabase
    .from("case_members")
    .select("id,nome,papel_no_caso,titular,contratante,dependente,cpf,data_nascimento,representante_legal,status_cadastral,parentesco,requerente,nacionalidade,cliente_id")
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (membrosCaso && membrosCaso.length > 0) {
    return membrosCaso.map((m: any) => ({ origem: "case_members" as const, ...m })) as PessoaDoCaso[];
  }

  const { data: nucleo } = await supabase
    .from("nucleos_familiares")
    .select("id")
    .eq("case_id", caseId)
    .is("archived_at", null)
    .maybeSingle();
  if (!nucleo?.id) return [];

  const { data: membrosNucleo } = await supabase
    .from("nucleo_membros")
    .select("id,nome,papel,vinculo,processo,ordem,cliente_id")
    .eq("nucleo_id", nucleo.id)
    .is("archived_at", null)
    .order("ordem", { ascending: true });

  const lista = (membrosNucleo ?? []) as MembroNucleoBruto[];
  const ordemMinima = ordemDoContratantePrincipal(lista);
  return lista.map((m) => pessoaDoCasoAPartirDoNucleo(m, ordemMinima));
}
