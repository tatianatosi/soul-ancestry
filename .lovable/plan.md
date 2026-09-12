# Alertas centralizados e microentregas

## Objetivo
Criar duas telas internas conectadas apenas aos dados existentes: ampliar **Alertas** como central operacional e adicionar **Microentregas** como fila editorial ligada à Biblioteca.

## Implementação
- Ampliar `/alertas` com três filas derivadas das fontes canônicas atuais:
  - cadências vencidas, com retorno para Operação/Jornada;
  - casos sem próxima ação, com retorno para Caso 360;
  - leads parados, com retorno para Próximas ações/CRM.
- Manter os alertas persistidos já existentes na mesma tela, sem duplicar registros ou criar automações.
- Criar `/microentregas` dentro do grupo existente **Inteligência & Pesquisa**, sem novo grupo principal.
- Ler a fila real de projeções da Biblioteca e apresentar as etapas rascunho → revisão → aprovado → publicado, com status, responsável, prazo e caso.
- Exibir o detalhe da microentrega com descrição sanitizada, origem, evidência e achado quando esses vínculos existirem; mostrar ausência real explicitamente, sem completar com dados inventados.
- Ligar Alertas, Biblioteca e Microentregas por links internos, preservando aprovação humana e publicação controlada.

## Limites
- Sem novas tabelas, migrations, integrações, automações ou dados demonstrativos tratados como reais.
- Sem alterar os seis grupos do Desk nem as sete abas do App Cliente.
- Sem enfraquecer autorização, auditoria, arquivamento lógico ou isolamento de dados.

## Validação
- Verificar compilação e rotas.
- Testar estados de carregamento, erro e vazio.
- Validar navegação pública possível; a prova autenticada dependerá de sessão interna disponível.
