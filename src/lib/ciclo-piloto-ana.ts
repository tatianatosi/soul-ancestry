/**
 * Ciclo completo do caso-piloto (fases 1 a 4), como referência normativa do Desk.
 * Puro: não executa atos externos (nada de cobrança, assinatura, mensagem ou pesquisa externa).
 */

export type ItemFase = { item: string; detalhe?: string };
export type FaseCiclo = {
  numero: 1 | 2 | 3 | 4;
  codigo: string;
  nome: string;
  objetivo: string;
  itens: ItemFase[];
  condicao_entrada: string;
};

export const FASES_CICLO_PILOTO: FaseCiclo[] = [
  {
    numero: 1,
    codigo: "mapa_identidade",
    nome: "Mapa e identidade",
    objetivo: "Um único identificador canônico e o núcleo familiar corretamente descrito.",
    condicao_entrada: "Sempre — é a base do caso.",
    itens: [
      { item: "Definir um único case_id canônico", detalhe: "IDs anteriores ficam apenas como alias/histórico." },
      { item: "Registrar núcleo familiar", detalhe: "Família Silveira Rodrigues." },
      { item: "Pessoa: Ana Luiza (contratante)" },
      { item: "Pessoa: pai" },
      { item: "Pessoa: Alice", detalhe: "Somente quando o nome completo for confirmado." },
      { item: "Pessoa: Felipe", detalhe: "Menor vinculado à Ana, com representação legal pendente." },
      { item: "Manter Adriel Felipe fora do caso", detalhe: "Processo separado." },
    ],
  },
  {
    numero: 2,
    codigo: "aceite_formalizacao",
    nome: "Aceite e formalização",
    objetivo: "Estado de aceite registrado com os bloqueios de formalização visíveis.",
    condicao_entrada: "Após proposta enviada e aceite formal registrado.",
    itens: [
      { item: "Proposta Canva registrada como referência" },
      { item: "Aceite formal em 14/08/2026" },
      { item: "Estado do caso: aceite_confirmado_formalizacao_pendente" },
      { item: "Cadastro da contratante" },
      { item: "Dados oficiais da contratada" },
      { item: "SKU, valor, parcelamento e escopo" },
      { item: "Contrato e Ordem de Serviço" },
      { item: "Revisão jurídica" },
      { item: "Método de assinatura" },
      { item: "Estrutura familiar resolvida" },
      { item: "Dossiê pré-onboarding" },
      { item: "Cobrança bloqueada", detalhe: "Asaas só depois dos gates anteriores." },
    ],
  },
  {
    numero: 3,
    codigo: "onboarding_padrao",
    nome: "Onboarding padronizado",
    objetivo: "Início operacional consistente com valor percebido em até D7.",
    condicao_entrada: "Somente após contrato assinado e pagamento inicial confirmado.",
    itens: [
      { item: "Definir responsável do caso" },
      { item: "Ativar dossiê-mãe" },
      { item: "Disponibilizar checklist documental" },
      { item: "Criar plano de ação" },
      { item: "Agendar ou registrar onboarding" },
      { item: "Publicar boas-vindas e acesso ao app, se aplicável" },
      { item: "Primeira micro-entrega até D7" },
      { item: "Atualização contextualizada a cada 14 dias" },
    ],
  },
  {
    numero: 4,
    codigo: "execucao_valor",
    nome: "Execução e valor percebido",
    objetivo: "Cadência de entregas com aprovação interna antes de qualquer publicação.",
    condicao_entrada: "Caso ativo com onboarding mínimo concluído.",
    itens: [
      { item: "Pesquisa inicial" },
      { item: "Documento recebido, localizado ou validado" },
      { item: "Árvore inicial" },
      { item: "Pendência contextualizada" },
      { item: "Linha do tempo" },
      { item: "Relatório parcial" },
      { item: "Preparação documental" },
      { item: "Protocolo, se aplicável" },
      { item: "Entregas client-facing somente após aprovação" },
    ],
  },
];

export const NOTA_CICLO =
  "O Desk registra estado e bloqueios; nenhum ato externo (cobrança, assinatura, mensagem ou pesquisa externa) é executado por esta tela.";
