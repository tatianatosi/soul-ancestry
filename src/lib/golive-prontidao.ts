/**
 * Prontidão para o App Cliente — cálculo puro, sem escrita.
 *
 * Responde uma pergunta só: o que já pode ser lido pela família e o que
 * ainda depende de aprovação interna. Nada é publicado aqui; a tela apenas
 * mostra o estado gravado de contratos, documentos, propostas e projeções.
 */

export type ItemProntidao = {
  id: string;
  grupo: "Contrato" | "Anexo" | "Documento" | "Proposta" | "Publicação";
  titulo: string;
  estado: string;
  /** "pronto" = a família já pode ver; "falta" = depende de aprovação interna. */
  situacao: "pronto" | "falta";
  motivo: string;
};

type Contrato = {
  id: string;
  numero?: string | null;
  titulo?: string | null;
  status?: string | null;
  assinadoEm?: string | null;
};

type Anexo = {
  id: string;
  codigo?: string | null;
  titulo?: string | null;
  status?: string | null;
  obrigatorio?: boolean;
  revisadoEm?: string | null;
};

type Documento = {
  id: string;
  titulo?: string | null;
  status?: string | null;
  liberadoCliente?: boolean;
};

type Proposta = {
  id: string;
  versao?: number | null;
  status?: string | null;
  aprovadaEm?: string | null;
};

type Projecao = {
  id: string;
  estado?: string | null;
  tipo?: string | null;
  visibilidade?: string | null;
  despublicadaEm?: string | null;
};

const CONTRATO_PRONTO = ["assinado", "signed", "ativo", "active", "vigente"];
const PROPOSTA_PRONTA = ["aprovada", "approved", "aceita", "assinada"];
const PROJECAO_PRONTA = ["published", "publicada", "aprovada", "approved"];

export function prontidaoDoApp({
  contratos = [],
  anexos = [],
  documentos = [],
  propostas = [],
  projecoes = [],
}: {
  contratos?: readonly Contrato[];
  anexos?: readonly Anexo[];
  documentos?: readonly Documento[];
  propostas?: readonly Proposta[];
  projecoes?: readonly Projecao[];
}): ItemProntidao[] {
  const itens: ItemProntidao[] = [];

  for (const c of contratos) {
    const estado = String(c.status ?? "sem situação");
    const pronto = Boolean(c.assinadoEm) || CONTRATO_PRONTO.includes(estado.toLowerCase());
    itens.push({
      id: c.id,
      grupo: "Contrato",
      titulo: c.numero ? `${c.numero} — ${c.titulo ?? "Instrumento"}` : (c.titulo ?? "Instrumento"),
      estado,
      situacao: pronto ? "pronto" : "falta",
      motivo: pronto ? "Assinado ou vigente" : "Aguarda assinatura",
    });
  }

  for (const a of anexos) {
    const estado = String(a.status ?? "sem situação");
    const pronto = Boolean(a.revisadoEm);
    itens.push({
      id: a.id,
      grupo: "Anexo",
      titulo: a.codigo ? `${a.codigo} — ${a.titulo ?? "Anexo"}` : (a.titulo ?? "Anexo"),
      estado,
      situacao: pronto ? "pronto" : "falta",
      motivo: pronto ? "Revisado pela equipe" : a.obrigatorio ? "Obrigatório e sem revisão" : "Sem revisão registrada",
    });
  }

  for (const d of documentos) {
    const pronto = d.liberadoCliente === true;
    itens.push({
      id: d.id,
      grupo: "Documento",
      titulo: d.titulo ?? "Documento sem título",
      estado: String(d.status ?? "sem situação"),
      situacao: pronto ? "pronto" : "falta",
      motivo: pronto ? "Liberado para a família" : "Aguarda liberação da equipe",
    });
  }

  for (const p of propostas) {
    const estado = String(p.status ?? "sem situação");
    const pronto = Boolean(p.aprovadaEm) || PROPOSTA_PRONTA.includes(estado.toLowerCase());
    itens.push({
      id: p.id,
      grupo: "Proposta",
      titulo: `Versão ${p.versao ?? 1}`,
      estado,
      situacao: pronto ? "pronto" : "falta",
      motivo: pronto ? "Aprovada" : "Aguarda aprovação",
    });
  }

  for (const p of projecoes) {
    const estado = String(p.estado ?? "sem situação");
    const pronto =
      !p.despublicadaEm &&
      PROJECAO_PRONTA.includes(estado.toLowerCase()) &&
      String(p.visibilidade ?? "titular") !== "equipe_interna";
    itens.push({
      id: p.id,
      grupo: "Publicação",
      titulo: p.tipo ?? "Conteúdo do App",
      estado,
      situacao: pronto ? "pronto" : "falta",
      motivo: p.despublicadaEm
        ? "Despublicada — segue no histórico"
        : pronto
          ? "Publicada para a família"
          : "Aguarda aprovação e publicação",
    });
  }

  return itens;
}

export type ResumoProntidao = { prontos: number; faltam: number; total: number };

export function resumoProntidao(itens: readonly ItemProntidao[]): ResumoProntidao {
  const prontos = itens.filter((i) => i.situacao === "pronto").length;
  return { prontos, faltam: itens.length - prontos, total: itens.length };
}

/** Contagem por grupo, sempre na mesma ordem, para o gráfico da tela. */
export function prontidaoPorGrupo(itens: readonly ItemProntidao[]) {
  const ordem: ItemProntidao["grupo"][] = ["Contrato", "Anexo", "Documento", "Proposta", "Publicação"];
  return ordem.map((grupo) => ({
    grupo,
    prontos: itens.filter((i) => i.grupo === grupo && i.situacao === "pronto").length,
    faltam: itens.filter((i) => i.grupo === grupo && i.situacao === "falta").length,
  }));
}
