/** Camada exclusivamente visual: nunca enviada ao servidor nem usada em métricas. */
export const SELO_EXEMPLO_VISUAL = "Exemplo do layout — ainda sem dados publicados";
export const exemplosVisuaisMockup = {
  historia: ["Origem de um ramo familiar", "Registro de uma nova geração", "Encontro entre dois ramos", "Memória compartilhada", "Início de uma pesquisa"],
  processo: ["Acolhimento", "Coleta inicial", "Reconstrução da história", "Conferência documental", "Entrega à família"],
  documentos: [
    { titulo: "Certidão de nascimento", estado: "Pendente", tom: "aguardando" },
    { titulo: "Certidão de casamento", estado: "Recebido", tom: "andamento" },
    { titulo: "Registro de uma geração", estado: "Em análise", tom: "andamento" },
    { titulo: "Documento familiar", estado: "Validado", tom: "concluido" },
    { titulo: "Registro complementar", estado: "Pendente", tom: "aguardando" },
  ],
  colecoes: [
    { categoria: "cadernos", titulo: "Caderno da história familiar", descricao: "Memórias reunidas por capítulo", fonte: "Fonte de exemplo: relato familiar" },
    { categoria: "relatorios", titulo: "Relatório de um ramo", descricao: "Uma leitura dos registros reunidos", fonte: "Fonte de exemplo: registro documental" },
    { categoria: "narrativas", titulo: "Narrativa de origem", descricao: "As histórias que atravessam gerações", fonte: "Fonte de exemplo: memória oral" },
  ],
  origens: ["País de origem A", "País de origem B", "País de origem C"],
  ramos: ["Ramo A", "Ramo B", "Ramo C"],
  plano: { nome: "Pesquisa Genealógica por Ramo Familiar", situacao: "Situação ilustrativa", etapas: ["História familiar", "Pesquisa dos registros", "Memória e continuidade"] },
  achados: ["Um registro que aproxima gerações", "Uma memória preservada", "Uma nova pista documental"],
} as const;