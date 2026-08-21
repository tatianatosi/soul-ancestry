/**
 * Biblioteca Mestre — subáreas canônicas.
 * Não gera abas globais: são seções contextuais dentro da aba "Biblioteca Mestre".
 */

export type SubareaBiblioteca =
  | "acervo"
  | "bases"
  | "dicionarios"
  | "trilhas"
  | "juridico"
  | "governanca"
  | "modelos"
  | "top30"
  | "mapas"
  | "arquivo";

export interface SubareaBibliotecaMeta {
  chave: SubareaBiblioteca;
  label: string;
  finalidade: string;
  /** Campos/dimensões que a subárea deve catalogar. */
  dimensoes: readonly string[];
  /** Regra interna aplicada à subárea (sanitização, exposição, revisão). */
  regra: string;
}

export const SUBAREAS_BIBLIOTECA: readonly SubareaBibliotecaMeta[] = [
  {
    chave: "acervo",
    label: "Acervo",
    finalidade: "Modelos internos, referências operacionais, guias e materiais aprovados.",
    dimensoes: ["Tipo de peça", "Versão", "Status de aprovação", "Responsável", "Caso vinculado"],
    regra: "Somente material aprovado circula; rascunho permanece marcado como interno.",
  },
  {
    chave: "bases",
    label: "Bases Genealógicas",
    finalidade:
      "Catálogo de repositórios, arquivos, cartórios, bases públicas, fontes religiosas, imigração, naturalização, acervos e coleções.",
    dimensoes: ["País", "Localidade", "Tipo de acervo", "Cobertura temporal", "Forma de acesso", "Autorização"],
    regra: "Consulta externa só com autorização registrada; nenhuma coleta automática.",
  },
  {
    chave: "dicionarios",
    label: "Dicionários e taxonomias",
    finalidade:
      "Tipos de fonte, documento, evidência, estado de validação, relações, eventos, linhas, países, localidades e etiquetas.",
    dimensoes: ["Domínio", "Termo canônico", "Sinônimos", "Termos proibidos", "Versão"],
    regra: "Termo fora do dicionário não pode ser gravado como valor canônico.",
  },
  {
    chave: "trilhas",
    label: "Trilhas de pesquisa",
    finalidade: "Vias preliminares por país, com requisitos, documentos prioritários e riscos.",
    dimensoes: ["País", "Via preliminar", "Requisitos de entrada", "Documentos prioritários", "Riscos", "Autorização"],
    regra: "Trilha é preliminar e exige revisão humana; nunca vira parecer ao cliente.",
  },
  {
    chave: "juridico",
    label: "Regras jurídicas versionadas",
    finalidade: "Base normativa citável, sempre versionada e datada.",
    dimensoes: ["Fonte", "Versão", "Vigência", "Responsável", "Status de revisão", "Observação interna"],
    regra: "Sem cálculo automático de elegibilidade e sem parecer gerado por máquina.",
  },
  {
    chave: "governanca",
    label: "Governança",
    finalidade: "Fontes de verdade, decisões, políticas, retenção, LGPD, auditoria e nomenclaturas.",
    dimensoes: ["Decisão", "Data", "Responsável", "Política vinculada", "Escopo de retenção"],
    regra: "Decisão registrada é imutável; correção entra como nova decisão.",
  },
  {
    chave: "modelos",
    label: "Modelos F1/F2",
    finalidade: "Templates de relatório de fase com versões aprovadas e critérios de uso.",
    dimensoes: ["Modelo", "Versão aprovada", "Critério de uso", "Relatórios vinculados"],
    regra: "Relatório publicado precisa apontar para uma versão aprovada de modelo.",
  },
  {
    chave: "top30",
    label: "Catálogo Top 30",
    finalidade: "Produtos homologados com escopo, condição, preço vigente e histórico.",
    dimensoes: ["SKU", "Escopo", "Condição comercial", "Preço vigente", "Histórico de preço"],
    regra: "Catálogo é interno: nada aqui é exposto ao App Cliente.",
  },
  {
    chave: "mapas",
    label: "Mapas operacionais",
    finalidade: "Fluxos, checklists, gates, matriz de dependências e playbooks internos.",
    dimensoes: ["Fluxo", "Gates", "Dependências", "Checklist vinculado", "Playbook"],
    regra: "Mapa reflete o processo executável; divergência abre pendência de governança.",
  },
  {
    chave: "arquivo",
    label: "Arquivo histórico",
    finalidade: "Itens legados, descontinuados e preservados para referência.",
    dimensoes: ["Item", "Motivo do arquivamento", "Data", "Substituto vigente"],
    regra: "Sem exclusão física: item descontinuado é arquivado e permanece rastreável.",
  },
] as const;

export function subareaBiblioteca(chave: string): SubareaBibliotecaMeta | null {
  return SUBAREAS_BIBLIOTECA.find((s) => s.chave === chave) ?? null;
}

/** Nenhuma subárea da Biblioteca Mestre pode ser projetada no App Cliente. */
export function exposicaoAppCliente(): false {
  return false;
}
