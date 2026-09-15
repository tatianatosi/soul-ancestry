/**
 * Tradução de rótulos técnicos para leitura humana no shell de go-live.
 *
 * Apenas apresentação: não filtra, não grava, não altera o dado.
 * Valores desconhecidos apenas trocam "_" por espaço e ganham inicial maiúscula.
 */

const DICIONARIO: Record<string, string> = {
  // Status de caso
  pronto_para_ativar: "Pronto para ativar",
  em_andamento: "Em andamento",
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
  aguardando: "Aguardando",
  // Fases da jornada
  aceite_e_formalizacao: "Aceite e formalização",
  onboarding: "Onboarding",
  pesquisa_inicial: "Pesquisa inicial",
  pesquisa_e_validacao: "Pesquisa e validação",
  preparacao_documental: "Preparação documental",
  protocolo_e_acompanhamento: "Protocolo e acompanhamento",
  reconhecimento: "Reconhecimento",
  pos_reconhecimento: "Pós-reconhecimento",
  // Próxima ação
  sem_nova_acao_necessaria: "Nenhuma ação pendente",
  // Papéis
  contratante_signatario: "Contratante e signatário",
  contratante: "Contratante",
  dependente: "Dependente",
  signatario: "Signatário",
  acompanhante: "Acompanhante",
  titular: "Titular",
  // Pesquisa: estados e tipos gravados em inglês pelo motor
  preparation: "Preparação",
  planning: "Planejamento",
  in_progress: "Em andamento",
  on_hold: "Pausada",
  completed: "Concluída",
  not_assessed: "Não avaliada",
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  open: "Aberta",
  closed: "Encerrada",
  referenced: "Referenciada",
  consulted: "Consultada",
  pending: "Pendente",
  collected: "Coletada",
  under_review: "Em revisão",
  validated: "Validada",
  inconclusive: "Inconclusiva",
  discarded: "Descartada",
  archived: "Arquivada",
  client_provided: "Fornecida pelo cliente",
  archive_catalog: "Catálogo de arquivo",
  official_registry: "Registro oficial",
  parish_book: "Livro paroquial",
  newspaper: "Jornal",
  interview: "Entrevista",
  document: "Documento",
  photo: "Fotografia",
  // Fila editorial
  ideia: "Ideia",
  pauta_aprovada: "Pauta aprovada",
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

/** Devolve o texto legível de um valor técnico; `null` vira o vazio canônico. */
export function humano(valor: string | null | undefined, vazio = "Sem itens nesta etapa"): string {
  if (valor === null || valor === undefined) return vazio;
  const bruto = String(valor).trim();
  if (!bruto) return vazio;
  const chave = bruto.toLowerCase();
  if (DICIONARIO[chave]) return DICIONARIO[chave];
  if (!/[_-]/.test(bruto) && bruto !== chave) return bruto;
  const texto = chave.replace(/[_-]+/g, " ").trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Data legível em pt-BR; entrada inválida volta como veio. */
export function dataHumana(valor: string | null | undefined, vazio = "Sem prazo definido"): string {
  if (!valor) return vazio;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
