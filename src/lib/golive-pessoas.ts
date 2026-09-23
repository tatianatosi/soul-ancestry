/**
 * Cálculos de apresentação de Pessoa 360, Pessoas & Famílias e Árvore interna.
 *
 * Funções puras sobre o que o motor aprovado já leu (case_members,
 * nucleo_membros, case_dependents e consent_records).
 *
 * Regras fixas:
 * - parentesco só existe quando está gravado em pai_id/mae_id — nada é
 *   deduzido por nome, semelhança ou ordem de cadastro;
 * - nenhuma pessoa é criada para preencher a tela;
 * - ausência de registro devolve lista vazia, nunca número estimado.
 */

export type PessoaCaso = {
  id: string;
  nome: string;
  papel: string | null;
  parentesco: string | null;
  paiId: string | null;
  maeId: string | null;
  requerente: boolean;
  titular: boolean;
  contratante: boolean;
  dependente: boolean;
  statusCadastral: string | null;
  documentosPendentes: string | null;
  consentimentos: string | null;
  verificadoEm: string | null;
  fonte: string | null;
  identidade: {
    nascimento: string | null;
    localNascimento: string | null;
    nacionalidade: string | null;
    cpf: boolean;
    rg: boolean;
    estadoCivil: string | null;
  };
  contato: { email: boolean; telefone: boolean; endereco: boolean; cep: boolean };
};

export type DependenteCaso = {
  id: string;
  nome: string;
  vinculo: string | null;
  statusRepresentacao: string | null;
  participaContrato: boolean;
  pessoaId: string | null;
};

export type ConsentimentoCaso = {
  id: string;
  tipo: string | null;
  status: string | null;
  clienteId: string | null;
  coletadoEm: string | null;
  revogadoEm: string | null;
};

const pct = (feitos: number, total: number) => (total ? Math.round((feitos / total) * 100) : 0);

export type MembroNucleo = {
  id: string;
  nome: string;
  papel: string | null;
  clienteId?: string | null;
  representacaoNecessaria?: boolean;
  representacaoDocumentada?: boolean;
  statusCadastral?: string | null;
};

/**
 * Adapta membros vivos do núcleo (nucleo_membros) ao formato de pessoa usado
 * pelos cálculos. Papel vem do valor controlado gravado, não de texto livre;
 * parentesco fica nulo porque o núcleo não grava pai/mãe — sem inferência.
 */
export function pessoasDoNucleo(
  membros: readonly MembroNucleo[],
  principal: { nome: string | null; email: string | null; telefone: string | null },
): PessoaCaso[] {
  return membros.map((m) => {
    const papel = (m.papel ?? "").toLowerCase();
    const ehPrincipal = Boolean(principal.nome && m.nome === principal.nome);
    return {
      id: m.id,
      nome: m.nome,
      papel: m.papel,
      parentesco: m.papel,
      paiId: null,
      maeId: null,
      requerente: false,
      titular: principal.nome ? ehPrincipal : papel.includes("contratante") || papel.includes("titular"),
      contratante: papel.includes("contratante"),
      dependente: papel.includes("depend"),
      statusCadastral: m.statusCadastral ?? null,
      documentosPendentes: null,
      consentimentos: null,
      verificadoEm: m.representacaoDocumentada ? "documentada" : null,
      fonte: "nucleo_membros",
      identidade: {
        nascimento: null,
        localNascimento: null,
        nacionalidade: null,
        cpf: false,
        rg: false,
        estadoCivil: null,
      },
      contato: {
        email: ehPrincipal ? Boolean(principal.email) : false,
        telefone: ehPrincipal ? Boolean(principal.telefone) : false,
        endereco: false,
        cep: false,
      },
    };
  });
}

/** Pessoa principal do caso: titular/requerente/contratante já marcados. */
export function pessoaPrincipalDoCaso(pessoas: readonly PessoaCaso[]): PessoaCaso | null {
  return (
    pessoas.find((p) => p.titular) ??
    pessoas.find((p) => p.requerente) ??
    pessoas.find((p) => p.contratante) ??
    null
  );
}

export function consentimentoAtivo(c: ConsentimentoCaso) {
  return !c.revogadoEm && /(ativo|vigente|concedido|coletado|aceito|valid)/i.test(c.status ?? "");
}

/**
 * Completude por domínio, em porcentagem do que está efetivamente gravado.
 * Vínculos conta pai/mãe declarados; consentimento conta registro ativo.
 */
export function completudePorDominio(
  pessoa: PessoaCaso | null,
  consentimentos: readonly ConsentimentoCaso[],
): { rotulo: string; valor: number }[] {
  if (!pessoa) return [];
  const id = pessoa.identidade;
  const identidade = [
    Boolean(pessoa.nome),
    Boolean(id.nascimento),
    Boolean(id.localNascimento),
    Boolean(id.nacionalidade),
    id.cpf || id.rg,
  ];
  const contato = [pessoa.contato.email, pessoa.contato.telefone, pessoa.contato.endereco, pessoa.contato.cep];
  const vinculos = [Boolean(pessoa.paiId), Boolean(pessoa.maeId), Boolean(pessoa.papel || pessoa.parentesco)];
  const ativos = consentimentos.filter(consentimentoAtivo).length;

  return [
    { rotulo: "Identidade", valor: pct(identidade.filter(Boolean).length, identidade.length) },
    { rotulo: "Contato", valor: pct(contato.filter(Boolean).length, contato.length) },
    { rotulo: "Vínculos", valor: pct(vinculos.filter(Boolean).length, vinculos.length) },
    { rotulo: "Consentimento", valor: ativos > 0 ? 100 : 0 },
  ];
}

/**
 * Confiança: vínculos e consentimentos confirmados contra pendentes.
 * Sem nenhum item avaliável, devolve null e a tela mostra estado vazio.
 */
export function confiancaDaPessoa(
  pessoa: PessoaCaso | null,
  pessoas: readonly PessoaCaso[],
  consentimentos: readonly ConsentimentoCaso[],
): { confirmados: number; pendentes: number; estrelas: number } | null {
  if (!pessoa) return null;
  const porId = new Map(pessoas.map((p) => [p.id, p]));
  let confirmados = 0;
  let pendentes = 0;

  for (const parente of [pessoa.paiId, pessoa.maeId]) {
    if (!parente) continue;
    if (porId.has(parente)) confirmados += 1;
    else pendentes += 1;
  }
  if (!pessoa.paiId) pendentes += 1;
  if (!pessoa.maeId) pendentes += 1;

  for (const c of consentimentos) {
    if (consentimentoAtivo(c)) confirmados += 1;
    else pendentes += 1;
  }

  if (pessoa.verificadoEm) confirmados += 1;
  else pendentes += 1;

  const total = confirmados + pendentes;
  if (!total) return null;
  return { confirmados, pendentes, estrelas: Math.round((confirmados / total) * 5) };
}

export type Relacao = { id: string; de: string; para: string; rotulo: string };

/** Relações aprovadas: só arestas pai/mãe gravadas entre pessoas do caso. */
export function relacoesAprovadas(
  pessoas: readonly Pick<PessoaCaso, "id" | "nome" | "paiId" | "maeId">[],
): Relacao[] {
  const porId = new Map(pessoas.map((p) => [p.id, p]));
  const out: Relacao[] = [];
  for (const p of pessoas) {
    if (p.paiId && porId.has(p.paiId)) {
      out.push({ id: `${p.id}-pai`, de: porId.get(p.paiId)!.nome, para: p.nome, rotulo: "pai" });
    }
    if (p.maeId && porId.has(p.maeId)) {
      out.push({ id: `${p.id}-mae`, de: porId.get(p.maeId)!.nome, para: p.nome, rotulo: "mãe" });
    }
  }
  return out;
}

/**
 * Cobertura por geração G1–G5, contada a partir da pessoa principal pelas
 * arestas pai/mãe gravadas. Quem não tem caminho declarado não entra.
 */
export function coberturaPorGeracao(pessoas: readonly PessoaCaso[]): { rotulo: string; valor: number }[] {
  const raiz = pessoaPrincipalDoCaso(pessoas);
  if (!raiz) return [];
  const porId = new Map(pessoas.map((p) => [p.id, p]));
  const contagem = [0, 0, 0, 0, 0];
  const visto = new Set<string>();
  let nivel: PessoaCaso[] = [raiz];

  for (let g = 0; g < 5 && nivel.length; g++) {
    const proximo: PessoaCaso[] = [];
    for (const p of nivel) {
      if (visto.has(p.id)) continue;
      visto.add(p.id);
      contagem[g] += 1;
      for (const parente of [p.paiId, p.maeId]) {
        const alvo = parente ? porId.get(parente) : undefined;
        if (alvo && !visto.has(alvo.id)) proximo.push(alvo);
      }
    }
    nivel = proximo;
  }

  return contagem.map((valor, i) => ({ rotulo: `G${i + 1}`, valor }));
}

/** Composição do núcleo: titular, participantes e dependentes declarados. */
export function composicaoDoNucleo(
  pessoas: readonly PessoaCaso[],
  dependentes: readonly DependenteCaso[],
): { rotulo: string; valor: number }[] {
  const principal = pessoaPrincipalDoCaso(pessoas);
  const idsDependentes = new Set(dependentes.map((d) => d.pessoaId).filter(Boolean) as string[]);
  const marcadosDependentes = pessoas.filter((p) => p.dependente || idsDependentes.has(p.id));
  const participantes = pessoas.filter(
    (p) => p.id !== principal?.id && !p.dependente && !idsDependentes.has(p.id),
  );
  const totalDependentes = new Set([
    ...marcadosDependentes.map((p) => p.id),
    ...dependentes.filter((d) => !d.pessoaId).map((d) => d.id),
  ]).size;

  return [
    { rotulo: "Titular", valor: principal ? 1 : 0 },
    { rotulo: "Participantes", valor: participantes.length },
    { rotulo: "Dependentes", valor: totalDependentes },
  ];
}

/** Estado de confirmação de cada pessoa, pelo que está gravado. */
export function estadoDeConfirmacao(
  p: Pick<PessoaCaso, "verificadoEm" | "statusCadastral" | "paiId" | "maeId">,
): "Confirmada" | "Em revisão" | "Pendente" {
  if (p.verificadoEm && (p.paiId || p.maeId)) return "Confirmada";
  if (p.statusCadastral && /(complet|valid|confirm|ok)/i.test(p.statusCadastral)) return "Confirmada";
  if (p.paiId || p.maeId || p.statusCadastral) return "Em revisão";
  return "Pendente";
}
