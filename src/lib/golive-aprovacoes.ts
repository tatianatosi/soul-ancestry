/**
 * Fila de aprovações internas — cálculo puro, sem escrita.
 *
 * Responde uma pergunta só: o que depende de uma decisão da equipe agora,
 * em achado, proposta e contrato, e o que já pode ir para o App. Nada é
 * aprovado, publicado ou enviado aqui; a tela apenas ordena o que já está
 * gravado no caso.
 */

export type AcaoAprovacao =
  | "aprovar_achado"
  | "aprovar_escopo"
  | "enviar_revisao"
  | "registrar_assinatura"
  | "publicar"
  | "nenhuma";

export type ItemAprovacao = {
  id: string;
  grupo: "Achado" | "Proposta" | "Contrato";
  titulo: string;
  estado: string;
  /** "pendente" = aguarda decisão da equipe; "pronto" = já decidido. */
  situacao: "pendente" | "pronto";
  acao: AcaoAprovacao;
  motivo: string;
};

type Achado = {
  id: string;
  titulo?: string | null;
  validacao?: string | null;
  tipo?: string | null;
  impactoArvore?: string | null;
};

type Proposta = {
  id: string;
  versao?: number | null;
  status?: string | null;
  aprovadaEm?: string | null;
  referencia?: string | null;
  escopo?: string | null;
};

type Contrato = {
  id: string;
  numero?: string | null;
  titulo?: string | null;
  status?: string | null;
  assinadoEm?: string | null;
};

type Projecao = {
  id: string;
  estado?: string | null;
  tipo?: string | null;
  despublicadaEm?: string | null;
};

const PROJECAO_PUBLICADA = ["published", "publicada", "aprovada", "approved"];
const PROPOSTA_APROVADA = ["aprovada", "approved", "aceita", "assinada"];
const CONTRATO_ASSINADO = ["signed", "assinado", "ativo", "active", "vigente"];

/** Um tipo de conteúdo já está no App quando há projeção publicada e não retirada. */
export function publicadoNoApp(projecoes: readonly Projecao[], tipo: string): boolean {
  return projecoes.some(
    (p) =>
      String(p.tipo ?? "") === tipo &&
      !p.despublicadaEm &&
      PROJECAO_PUBLICADA.includes(String(p.estado ?? "").toLowerCase()),
  );
}

export function filaDeAprovacoes({
  achados = [],
  propostas = [],
  contratos = [],
  projecoes = [],
}: {
  achados?: readonly Achado[];
  propostas?: readonly Proposta[];
  contratos?: readonly Contrato[];
  projecoes?: readonly Projecao[];
}): ItemAprovacao[] {
  const itens: ItemAprovacao[] = [];

  for (const a of achados) {
    const validacao = String(a.validacao ?? "a_confirmar");
    const validado = validacao === "validado_internamente";
    const hipotese = String(a.tipo ?? "") === "hipotese_pesquisa";

    itens.push({
      id: a.id,
      grupo: "Achado",
      titulo: a.titulo ?? "Achado sem título",
      estado: validacao,
      situacao: validado || hipotese ? "pronto" : "pendente",
      acao: validado || hipotese ? "nenhuma" : "aprovar_achado",
      motivo: hipotese
        ? "Hipótese de pesquisa: precisa de documento antes de qualquer aprovação"
        : validado
          ? `Aprovado internamente · impacto na árvore: ${a.impactoArvore ?? "nenhum"}`
          : "Aguarda aprovação interna",
    });
  }

  for (const p of propostas) {
    const estado = String(p.status ?? "sem situação");
    const aprovada = Boolean(p.aprovadaEm) || PROPOSTA_APROVADA.includes(estado.toLowerCase());
    const noApp = publicadoNoApp(projecoes, "proposta");

    if (!aprovada) {
      const faltaReferencia = !p.referencia;
      const faltaEscopo = !p.escopo;
      itens.push({
        id: p.id,
        grupo: "Proposta",
        titulo: `Versão ${p.versao ?? 1}`,
        estado,
        situacao: "pendente",
        acao: faltaReferencia || faltaEscopo ? "nenhuma" : "aprovar_escopo",
        motivo: faltaReferencia
          ? "Registre a referência do Canva antes de aprovar o escopo"
          : faltaEscopo
            ? "Registre o escopo apresentado antes de aprovar"
            : "Escopo aguarda aprovação da equipe",
      });
      continue;
    }

    itens.push({
      id: p.id,
      grupo: "Proposta",
      titulo: `Versão ${p.versao ?? 1}`,
      estado,
      situacao: noApp ? "pronto" : "pendente",
      acao: noApp ? "nenhuma" : "publicar",
      motivo: noApp ? "Escopo aprovado e visível na Conta do cliente" : "Escopo aprovado; falta publicar no App",
    });
  }

  for (const c of contratos) {
    const estado = String(c.status ?? "sem situação");
    const assinado = Boolean(c.assinadoEm) || CONTRATO_ASSINADO.includes(estado.toLowerCase());
    const emRevisao = estado === "under_human_review";
    const noApp = publicadoNoApp(projecoes, "contrato");
    const titulo = c.numero ? `${c.numero} — ${c.titulo ?? "Instrumento"}` : (c.titulo ?? "Instrumento");

    if (assinado) {
      itens.push({
        id: c.id,
        grupo: "Contrato",
        titulo,
        estado,
        situacao: noApp ? "pronto" : "pendente",
        acao: noApp ? "nenhuma" : "publicar",
        motivo: noApp ? "Assinado e visível na Conta do cliente" : "Assinado; falta publicar no App",
      });
      continue;
    }

    itens.push({
      id: c.id,
      grupo: "Contrato",
      titulo,
      estado,
      situacao: "pendente",
      acao: emRevisao ? "registrar_assinatura" : "enviar_revisao",
      motivo: emRevisao ? "Em revisão humana; assinatura só com ato formal" : "Ainda não foi para revisão humana",
    });
  }

  return itens;
}

export function resumoAprovacoes(itens: readonly ItemAprovacao[]) {
  const pendentes = itens.filter((i) => i.situacao === "pendente").length;
  return { pendentes, prontos: itens.length - pendentes, total: itens.length };
}

/** Contagem por grupo, sempre na mesma ordem, para o gráfico da tela. */
export function aprovacoesPorGrupo(itens: readonly ItemAprovacao[]) {
  const ordem: ItemAprovacao["grupo"][] = ["Achado", "Proposta", "Contrato"];
  return ordem.map((grupo) => ({
    grupo,
    pendentes: itens.filter((i) => i.grupo === grupo && i.situacao === "pendente").length,
  }));
}
