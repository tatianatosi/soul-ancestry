/**
 * CA-DEC-2026-08-17-02 — Ficha familiar interna (uma por case_id).
 *
 * Camada apenas descritiva: descreve, para cada bloco da ficha, o conteúdo,
 * as origens aceitas e o destino permitido da informação. Não move, copia
 * nem projeta dado nenhum — serve para a tela explicar governança ao operador.
 */

export type OrigemFicha =
  | "planejador"
  | "proposta"
  | "crm"
  | "documento"
  | "bruta"
  | "proibida";

export const REGRAS_ORIGEM: {
  chave: OrigemFicha;
  fonte: string;
  tratamento: string;
  estadoInicial: string;
  tom: "ok" | "alerta" | "erro" | "neutro";
}[] = [
  {
    chave: "planejador",
    fonte: "Planejador homologado",
    tratamento: "Parâmetro estruturado de maior precedência, rastreável por versão e data.",
    estadoInicial: "importado — pode ser validado",
    tom: "ok",
  },
  {
    chave: "proposta",
    fonte: "Proposta aprovada",
    tratamento: "Referência comercial e de escopo; exige vínculo formal ao caso.",
    estadoInicial: "vínculo rastreável, nunca cópia automática",
    tom: "ok",
  },
  {
    chave: "crm",
    fonte: "CRM / cadastro confirmado",
    tratamento: "Dado estruturado revisável por pessoa, oportunidade e caso.",
    estadoInicial: "revisável",
    tom: "neutro",
  },
  {
    chave: "documento",
    fonte: "Documento conferido",
    tratamento: "Pode validar campos conforme a regra aplicável ao campo.",
    estadoInicial: "valida quando a regra do campo permitir",
    tom: "neutro",
  },
  {
    chave: "bruta",
    fonte: "WhatsApp, Call, Brief e transcrição",
    tratamento: "Fonte bruta/narrativa. Entra sempre como a_confirmar; nunca valida sozinha.",
    estadoInicial: "a_confirmar",
    tom: "alerta",
  },
  {
    chave: "proibida",
    fonte: "DEMO, placeholder ou outro caso",
    tratamento: "Proibido como fonte. Campo sem informação real permanece vazio.",
    estadoInicial: "bloqueado",
    tom: "erro",
  },
];

export const REGRAS_PROJECAO = [
  "A ficha inteira nunca é copiada para o CRM.",
  "CRM recebe somente campos estruturados permitidos por pessoa, oportunidade e caso.",
  "Desk/Pesquisa recebe narrativa, fontes, documentos, evidências, lacunas e hipóteses internas.",
  "Motor recebe somente parâmetros validados ou explicitamente a_confirmar, com origem e gates.",
  "Portal lê apenas a projeção cliente-facing autorizada; não lê a ficha.",
  "Transcrição, WhatsApp, hipóteses, referências externas e documentos brutos nunca são projetados ao cliente.",
];

export const REGRAS_VERSIONAMENTO = [
  "Uma ficha de trabalho atual por case_id — sem duplicar ficha por requerente.",
  "Salvar atualiza a ficha atual; conteúdo idêntico não gera cópia.",
  "Snapshot só em revisão humana, alteração material aprovada, geração de prévia, envio para assinatura, retorno para ajuste ou arquivamento.",
  "Versões anteriores são arquivadas, nunca apagadas.",
];

export type BlocoFicha = {
  chave: string;
  titulo: string;
  grupos: string[];
  conteudo: string;
  destino: string;
  origens: OrigemFicha[];
};

export const BLOCOS_FICHA: BlocoFicha[] = [
  {
    chave: "A",
    titulo: "A. Núcleo familiar e caso",
    grupos: ["objeto"],
    conteudo: "case_id, país, objetivo, rota, status, proposta e gates.",
    destino: "CRM estruturado e motor contratual, conforme o campo.",
    origens: ["planejador", "proposta", "crm"],
  },
  {
    chave: "B",
    titulo: "B. Requerentes e signatários",
    grupos: ["partes"],
    conteudo: "Ana, Adair e Alice: papéis, processo individual e anexo correspondente.",
    destino: "CRM individual + motor contratual.",
    origens: ["crm", "documento", "bruta"],
  },
  {
    chave: "C",
    titulo: "C. Dependente e representação",
    grupos: ["membros"],
    conteudo: "Felipe, vínculo com Ana e representação legal aplicável.",
    destino: "Motor/Desk, somente após base documental real.",
    origens: ["documento", "crm", "bruta"],
  },
  {
    chave: "D",
    titulo: "D. Linha e dossiê compartilhado",
    grupos: ["servicos"],
    conteudo: "Narrativa, documentos, fontes, lacunas, eventos e pendências.",
    destino: "Desk / Pesquisa / Biblioteca interna. Nunca projetado ao cliente.",
    origens: ["documento", "bruta"],
  },
  {
    chave: "E",
    titulo: "E. Contrato, anexos, comercial e gates",
    grupos: ["comerciais", "assinatura"],
    conteudo: "Signatários, escopo, anexos, condições comerciais, gates e ações.",
    destino: "Motor / CRM / Desk, conforme o campo.",
    origens: ["planejador", "proposta", "documento"],
  },
];

export type EstadoBloco = {
  total: number;
  validados: number;
  aConfirmar: number;
  vazios: number;
  rotulo: string;
  tom: "ok" | "alerta" | "erro" | "neutro";
};

/** Estado consolidado do bloco a partir dos valores já carregados na ficha. */
export function estadoDoBloco(valores: { grupo: string; valor?: string | null; status?: string | null }[], grupos: string[]): EstadoBloco {
  const itens = valores.filter((v) => grupos.includes(v.grupo));
  const total = itens.length;
  const validados = itens.filter((v) => v.status === "validado" && v.valor).length;
  const vazios = itens.filter((v) => !v.valor).length;
  const aConfirmar = total - validados - vazios;

  if (total === 0) return { total, validados, aConfirmar, vazios, rotulo: "sem campos", tom: "neutro" };
  if (vazios > 0) return { total, validados, aConfirmar, vazios, rotulo: `${vazios} campo(s) sem informação real`, tom: "erro" };
  if (aConfirmar > 0) return { total, validados, aConfirmar, vazios, rotulo: `${aConfirmar} campo(s) a confirmar`, tom: "alerta" };
  return { total, validados, aConfirmar, vazios, rotulo: "todos os campos validados", tom: "ok" };
}

export const ROTULO_ORIGEM: Record<OrigemFicha, string> = {
  planejador: "Planejador homologado",
  proposta: "Proposta aprovada",
  crm: "CRM confirmado",
  documento: "Documento conferido",
  bruta: "Call/WhatsApp/Brief (a_confirmar)",
  proibida: "Fonte proibida",
};
