/**
 * Helper para staff acessar o demo do App Cliente de forma simples.
 *
 * A rota /app-cliente-demo já existe e mostra a experiência do cliente
 * com dados fictícios da Sophia. Esta função documenta como staff
 * acessa a demonstração e ajuda a identificar discrepâncias.
 */

export type DemoClienteAcesso = {
  rota: string;
  descricao: string;
  dados: string;
  notas: string;
};

export const DEMO_CLIENTE_ACESSOS: DemoClienteAcesso[] = [
  {
    rota: "/app-cliente-demo",
    descricao: "Sessão demo completa do App Cliente",
    dados: "Caso fictício Sophia com dados de demonstração",
    notas: "Acesso somente para staff logado. Renderiza componentes reais do portal. Nenhum dado de cliente real.",
  },
];

/**
 * Identifica quais telas do client portal estão ativas nesta versão.
 * Útil para conferir se as "abas erradas" mencionadas pelo usuário
 * foram corrigidas ou se há discrepâncias entre o que staff vê e
 * o que clientes veem.
 */
export function telasClientePortalAtivas(): {
  jornada: boolean;
  arvore: boolean;
  radar: boolean;
} {
  return {
    jornada: true,  // tela Jornada da pesquisa
    arvore: true,   // tela Árvore da família
    radar: true,    // tela Radar de países
  };
}

/**
 * Checklist para verificar se o demo é consistente com
 * a experiência real do cliente.
 */
export const CHECKLIST_DEMO_CONSISTENCIA = [
  "Jornada: marcos aparecem em ordem cronológica?",
  "Árvore: gerações estão renderizando corretamente?",
  "Radar: países listam-se por descobertas?",
  "Carregamento: telas carregam sem erros?",
  "Tipografia: textos e tamanhos estão claros?",
  "Responsividade: layout funciona em mobile?",
] as const;
