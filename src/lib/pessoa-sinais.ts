/**
 * §15 do De-Para (Pessoas 360, linha Sinais): "Duplicidade, conflito, lacuna
 * documental, consentimento — com prioridade e ação recomendada".
 *
 * Função pura: recebe o que já foi lido pela rota e devolve a lista de sinais
 * derivados. Nunca inventa — cada sinal aponta para um campo do cliente ou
 * uma contagem real de fontes canônicas.
 *
 * Prioridade fixa (não configurável, para não flutuar entre chamadores):
 * - crítica: conflito de identidade (dois cadastros para a mesma pessoa)
 * - alta:    lacuna documental core (sem CPF, sem data_nascimento, sem e-mail)
 * - média:   consentimento pendente/recusado quando há caso ativo
 * - baixa:   suspeita de duplicidade por nome parcial (não decidida)
 */

export type PrioridadeSinal = "critica" | "alta" | "media" | "baixa";

export type Sinal = {
  tipo: "duplicidade" | "conflito" | "lacuna_documental" | "consentimento";
  prioridade: PrioridadeSinal;
  titulo: string;
  detalhe: string;
  acaoRecomendada: string;
};

type ClienteMin = {
  id?: string | null;
  nome?: string | null;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  data_nascimento?: string | null;
};

type LeadMin = {
  id?: string | null;
  nome?: string | null;
  cliente_id?: string | null;
  consentimento_status?: string | null;
};

type CasoMin = {
  id?: string | null;
  status?: string | null;
  ativo?: boolean | null;
};

function vazio(v: unknown): boolean {
  return v === null || v === undefined || String(v).trim() === "";
}

export function sinaisDaPessoa(entrada: {
  cliente: ClienteMin;
  leads?: readonly LeadMin[];
  casos?: readonly CasoMin[];
  possiveisDuplicidades?: readonly { id: string; nome: string; motivo: string }[];
}): Sinal[] {
  const sinais: Sinal[] = [];
  const cliente = entrada.cliente;
  const leads = entrada.leads ?? [];
  const casos = entrada.casos ?? [];

  // 1. Conflito de identidade: leads ligados a esta pessoa que apontam para
  //    outro cliente_id diferente do id atual — dois cadastros para a mesma
  //    pessoa é conflito crítico.
  const idAtual = cliente.id ? String(cliente.id) : null;
  const conflitos = leads.filter(
    (l) => l.cliente_id && idAtual && String(l.cliente_id) !== idAtual,
  );
  if (conflitos.length > 0) {
    sinais.push({
      tipo: "conflito",
      prioridade: "critica",
      titulo: `${conflitos.length} lead(s) apontando para outro cliente`,
      detalhe:
        "A mesma pessoa aparece vinculada a mais de um cadastro cliente. Isso quebra unificação canônica.",
      acaoRecomendada:
        "Abrir cada lead e decidir qual cliente é canônico. Não fundir automaticamente.",
    });
  }

  // 2. Lacuna documental core: sem CPF, sem e-mail, sem data de nascimento.
  //    Cada campo faltando entra como sinal separado — o operador vê onde
  //    agir.
  const lacunas: { campo: string; rotulo: string }[] = [
    { campo: "cpf", rotulo: "CPF" },
    { campo: "email", rotulo: "e-mail" },
    { campo: "data_nascimento", rotulo: "data de nascimento" },
  ].filter((c) => vazio(cliente[c.campo as keyof ClienteMin]));
  if (lacunas.length > 0) {
    sinais.push({
      tipo: "lacuna_documental",
      prioridade: "alta",
      titulo: `${lacunas.length} campo(s) essencial(is) sem valor`,
      detalhe: `Faltando: ${lacunas.map((l) => l.rotulo).join(", ")}. Necessário para elegibilidade e comunicação segura.`,
      acaoRecomendada: "Coletar os dados na próxima interação, no bloco Perfil.",
    });
  }

  // 3. Consentimento pendente/recusado com caso ativo: leads vinculados
  //    cujo consentimento não está concedido e a pessoa tem caso rodando.
  const temCasoAtivo = casos.some((c) => c.ativo === true || c.status === "ativo");
  const consentimentoNaoConcedido = leads.filter(
    (l) =>
      l.consentimento_status &&
      l.consentimento_status !== "concedido" &&
      l.consentimento_status !== "nao_solicitado",
  );
  if (temCasoAtivo && consentimentoNaoConcedido.length > 0) {
    sinais.push({
      tipo: "consentimento",
      prioridade: "media",
      titulo: `Consentimento pendente em ${consentimentoNaoConcedido.length} lead(s)`,
      detalhe:
        "Há caso ativo, mas o consentimento (gravação/transcrição/uso interno) não está concedido em interações ligadas.",
      acaoRecomendada: "Registrar consentimento no próximo touchpoint antes de nova interação.",
    });
  }

  // 4. Suspeita de duplicidade não decidida — a função `pessoaSuspeitasPorNome`
  //    (ou equivalente) já pode ter devolvido candidatos. O sinal é
  //    informativo: nunca funde automaticamente.
  const duplicidades = entrada.possiveisDuplicidades ?? [];
  if (duplicidades.length > 0) {
    sinais.push({
      tipo: "duplicidade",
      prioridade: "baixa",
      titulo: `${duplicidades.length} possível(is) duplicidade(s) por nome`,
      detalhe: duplicidades
        .slice(0, 3)
        .map((d) => `${d.nome} — ${d.motivo}`)
        .join(" · "),
      acaoRecomendada: "Revisar humanamente — nenhuma fusão automática é feita.",
    });
  }

  return sinais;
}

/** Ordem canônica de prioridade (mais crítica primeiro), para renderização. */
export function ordenarPorPrioridade(sinais: readonly Sinal[]): Sinal[] {
  const peso: Record<PrioridadeSinal, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
  return [...sinais].sort((a, b) => peso[a.prioridade] - peso[b.prioridade]);
}
