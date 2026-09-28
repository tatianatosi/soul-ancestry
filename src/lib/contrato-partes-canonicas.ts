/**
 * Corte U2 (28/09/2026) — o contrato deixa de pedir de novo o que a Pessoa
 * 360 já tem. As partes do caso (contratante = `crm_casos.cliente_id`;
 * beneficiários = membros do núcleo do caso com pessoa vinculada) viram os
 * parâmetros `contratante_*`, `beneficiarios`, `partes_signatarias` e
 * `representacao_legal`, com origem "crm" (Pessoa 360). Campo vazio na
 * Pessoa 360 fica vazio aqui — nunca é inventado.
 */
export type PessoaCanonicaContrato = {
  nome: string;
  papel: string;
  cpf?: string | null;
  rg_numero?: string | null;
  rg_orgao_uf?: string | null;
  estado_civil?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  email?: string | null;
  telefone?: string | null;
};

const ROTULO_ESTADO_CIVIL: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União estável",
};

const t = (v: unknown) => (v == null ? "" : String(v).trim());

export function documentosDaPessoa(p: PessoaCanonicaContrato): string {
  return [t(p.cpf) ? `CPF ${t(p.cpf)}` : "", t(p.rg_numero) ? `RG ${t(p.rg_numero)}${t(p.rg_orgao_uf) ? ` ${t(p.rg_orgao_uf)}` : ""}` : ""]
    .filter(Boolean)
    .join(" · ");
}

export function contatoDaPessoa(p: PessoaCanonicaContrato): string {
  return [t(p.email), t(p.telefone)].filter(Boolean).join(" · ");
}

/** Idade completa em anos numa data de referência; null sem data de nascimento. */
export function idadeEm(dataNascimento: string | null | undefined, hoje: Date): number | null {
  const d = t(dataNascimento);
  if (!/^\d{4}-\d{2}-\d{2}/.test(d)) return null;
  const [a, m, dia] = d.slice(0, 10).split("-").map(Number);
  let idade = hoje.getUTCFullYear() - a!;
  if (hoje.getUTCMonth() + 1 < m! || (hoje.getUTCMonth() + 1 === m && hoje.getUTCDate() < dia!)) idade -= 1;
  return idade;
}

function pessoaTexto(p: PessoaCanonicaContrato): string {
  return [
    p.nome,
    p.papel,
    documentosDaPessoa(p) || null,
    p.estado_civil ? `Estado civil: ${ROTULO_ESTADO_CIVIL[p.estado_civil] ?? p.estado_civil}` : null,
    p.data_nascimento ? `Nascimento: ${t(p.data_nascimento).slice(0, 10).split("-").reverse().join("/")}` : null,
    t(p.endereco) || null,
    contatoDaPessoa(p) || null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export type ParametroCanonico = { campo: string; valor: string; detalhe: string; origem: "crm" };

/** Parâmetros contratuais a partir das pessoas reais do caso. Só gera o que tem valor. */
export function parametrosDasPartesCanonicas(
  contratante: PessoaCanonicaContrato | null,
  beneficiarios: PessoaCanonicaContrato[],
  hoje = new Date(),
): ParametroCanonico[] {
  if (!contratante) return [];
  const detalhe = "Pessoa 360 (cadastro canônico da pessoa)";
  const out: ParametroCanonico[] = [];
  const add = (campo: string, valor: string) => {
    if (t(valor)) out.push({ campo, valor: t(valor), detalhe, origem: "crm" });
  };
  add("contratante_nome", contratante.nome);
  const doc = documentosDaPessoa(contratante);
  add(
    "contratante_documento",
    [doc, contratante.estado_civil ? `Estado civil: ${ROTULO_ESTADO_CIVIL[contratante.estado_civil] ?? contratante.estado_civil}` : ""]
      .filter(Boolean)
      .join(" · "),
  );
  add("contratante_endereco", t(contratante.endereco));
  add("contratante_contato", contatoDaPessoa(contratante));
  const todos = [contratante, ...beneficiarios];
  if (beneficiarios.length) add("beneficiarios", todos.map(pessoaTexto).join(" || "));
  add("partes_signatarias", todos.map((p) => `${p.nome} (${p.papel})`).join(" · "));

  // Representação: só afirma o que a data de nascimento sustenta.
  const menores = todos.filter((p) => {
    const i = idadeEm(p.data_nascimento, hoje);
    return i !== null && i < 18;
  });
  const semData = todos.filter((p) => idadeEm(p.data_nascimento, hoje) === null);
  const obs: string[] = [];
  if (menores.length) obs.push(`Menor(es) de idade: ${menores.map((p) => p.nome).join(", ")} — representação legal necessária.`);
  if (semData.length) obs.push(`Data de nascimento não informada na Pessoa 360: ${semData.map((p) => p.nome).join(", ")}.`);
  const semDoc = todos.filter((p) => !documentosDaPessoa(p));
  if (semDoc.length) obs.push(`Documento de identificação pendente na Pessoa 360: ${semDoc.map((p) => p.nome).join(", ")}.`);
  if (obs.length) add("representacao_legal", obs.join(" · "));
  return out;
}
