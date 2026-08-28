# CA-UX-03 — Adendo: Assistente Transversal do Desk Intelligence

**Versão:** 1.0  
**Data:** 23 de agosto de 2026  
**Estado:** regra arquitetural obrigatória

## Decisão

O Assistente IA do Clube Ancestral é uma capacidade **transversal** do Desk Intelligence. Ele não pertence exclusivamente ao grupo Pesquisa e deve estar disponível, conforme contexto e permissão, em todos os oito grupos principais:

1. Hoje
2. Comercial
3. Casos
4. Pesquisa
5. Contratos e Financeiro
6. Cliente
7. Governança
8. Administração

A presença do Assistente não cria uma nona aba, não cria outra fonte de verdade e não concede permissão adicional ao usuário.

## Regras de contexto

| Grupo | Contexto permitido | Resultado permitido |
|---|---|---|
| Hoje | Fila, exceções, SLA, prioridade e responsável | Explicar prioridades, resumir bloqueios e sugerir navegação interna |
| Comercial | Lead, origem, Calls, proposta e conversão | Resumir histórico registrado, apontar pendências e preparar rascunho interno |
| Casos | Caso confirmado, núcleo, tarefas, fase e gates | Sintetizar estado do caso e próximos passos internos |
| Pesquisa | Caso confirmado, pessoas, fontes, evidências e pendências | Organizar evidências existentes e formular hipóteses marcadas como não confirmadas |
| Contratos e Financeiro | Proposta, condição, contrato, OS, fatura e gate | Explicar bloqueios, divergências e referências internas; não decidir preço ou jurídico |
| Cliente | Projeção sanitizada, acesso e entrega autorizada | Verificar o que está publicado e explicar diferenças entre Desk e preview, sem acessar conteúdo interno no preview |
| Governança | Decisões, auditoria, regras, qualidade e integrações | Explicar estados, pendências e fontes de decisão, sem modificar controles |
| Administração | Perfil, equipe, permissões e verificação de acesso | Orientar a proprietária sobre estados de acesso, sem conceder ou alterar permissões por conta própria |

## Guardas obrigatórias

- Toda análise por caso exige `case_id` confirmado explicitamente pela pessoa usuária.
- Alterar URL, aba ou seleção visual não pode trocar silenciosamente o caso analisado.
- Sem dados suficientes, bloquear análise e registrar somente `analysis_blocked_insufficient_case_data`.
- O modo DEMO exige ação explícita e mostra: `DEMO — DADOS FICTÍCIOS — NÃO USAR EM OPERAÇÃO`.
- O Assistente respeita papel, organização, RLS e visibilidade da superfície atual.
- No App Cliente e no preview sanitizado, ele só recebe a projeção autorizada ao cliente; nunca dados internos.
- O Assistente não cria, altera, arquiva ou publica dados sem uma ação humana explícita, fluxo autorizado, confirmação e auditoria.
- O Assistente não envia e-mail, WhatsApp, SMS, contrato, assinatura, cobrança, link de pagamento, pesquisa externa, pedido institucional ou mensagem.
- O Assistente não confirma achado genealógico, conclusão jurídica, elegibilidade, preço, cobrança, assinatura ou decisão operacional automaticamente.

## UX

- Um único ponto de entrada persistente por grupo: painel lateral ou botão “Assistente”.
- O cabeçalho declara o contexto atual: grupo, rota, caso/lead quando confirmado e escopo de dados disponível.
- Quando não houver contexto, o Assistente atua como orientador de navegação do Desk, sem inferir dados de caso.
- Respostas citam o registro interno utilizado quando aplicável e distinguem fato registrado, pendência e sugestão.
- Ações sugeridas abrem rotas/objetos existentes; não executam mudanças automaticamente.

## Testes mínimos

1. O Assistente aparece nos oito grupos apenas para papéis autorizados.
2. Não recebe dados de outra organização.
3. Não analisa caso sem confirmação explícita de `case_id`.
4. Não troca de caso por mudança de URL.
5. Bloqueia dados insuficientes corretamente.
6. Mostra o banner DEMO no modo de demonstração.
7. No contexto Cliente/preview, recebe somente a projeção sanitizada.
8. Não dispara ações externas, não altera dados e não eleva permissões.

## Controle de alterações

| Versão | Data | Alteração | Aceite |
|---|---|---|---|
| 1.0 | 23/08/2026 | Regra de Assistente IA transversal nas oito áreas do Desk | Pendente |
