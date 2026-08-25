# CA-LOVABLE-RESGATE-DESK-7-SECOES-E-SUBITENS-v1.0

**Prioridade:** Crítica  
**Tipo:** Resgate de navegação operacional e validação visual  
**Objetivo:** Fazer o Desk autenticado voltar a exibir efetivamente as sete seções principais e seus subitens, sem criar abas globais extras e sem reconstruir módulos já existentes.

---

## 1. Problema a corrigir

O código pode conter uma constante normativa de navegação com sete seções, mas a interface percebida no preview ainda pode apresentar estrutura antiga, incompleta, duplicada, sem subitens ou ligada à superfície errada. Não considere uma alteração de constante como entrega concluída. A entrega só estará concluída quando o Desk autenticado, no preview, renderizar visualmente a estrutura solicitada.

Existe um mockup público em `/` que pode conter uma navegação visual com 14 abas. Esse mockup não é o Desk operacional autenticado e não deve ser usado como fallback, modelo de navegação ou justificativa para manter abas legadas no Desk.

## 2. Resultado obrigatório

No Desk autenticado, o menu global deve exibir **exatamente sete seções principais**:

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Operação
6. Contratos e financeiro
7. Governança e biblioteca

Cada seção pode expandir seus subitens. Subitens não podem virar novas abas globais, cards concorrentes no menu ou navegação duplicada.

## 3. Regra de fonte única

1. Use `src/components/saas/shell.tsx`, constante `NAV`, como fonte única do menu do Desk autenticado, salvo se o código provar que outra fonte é a que o preview realmente renderiza.
2. Se o preview não estiver renderizando `SaasShell`/`NAV`, corrija o layout ou a rota autenticada para que ele renderize a fonte normativa.
3. Não copie as 14 abas de `src/components/desk-app.tsx` ou `src/components/mockup/desk-mockup.tsx` para o shell autenticado.
4. Desktop e mobile devem renderizar a mesma estrutura a partir da mesma fonte de dados.
5. Remova somente referências de menu duplicadas ou legadas que afetem o Desk autenticado. Não apagar o mockup público sem pedido explícito.

## 4. Estrutura de subitens

Use apenas rotas e módulos existentes. Não criar novos módulos, entidades ou abas globais.

### 4.1 Visão geral

- Painel Hoje (`/painel`).
- Filas operacionais, cadência, indicadores operacionais e alertas já existentes.

### 4.2 Comercial

- Leads e triagem.
- Propostas.
- Conversão, quando já houver rota interna existente.
- Contatos, conversas e eventos de funil dentro da área de Leads, não como aba global.

### 4.3 Casos e núcleos

- Casos 360.
- Núcleos e dossiês (`/nucleos`) como subitem e por atalhos contextuais em Casos e Painel Hoje.
- Formalização, Fechamento, Jornada, microentregas, Relatórios e Alertas permanecem contextuais ao caso; não criar abas globais para estes itens.

### 4.4 Pesquisa genealógica

- Pesquisa Genealógica e Evidências é contextual à ficha de caso na rota `/pesquisa-evidencias/$caseId`.
- Não criar uma aba global adicional para cada seção de pesquisa.
- As seções Visão de pesquisa, Ficha genealógica, Pessoas/famílias/ramos, Fontes/Consultas, Evidências/documentos, Validação/pendências, Achados/microentregas, Relatórios F1/F2 e Alertas/histórico permanecem internas à pesquisa do caso.

### 4.5 Operação

- Apenas subitens e rotas existentes de operação.
- Não mover Comercial, Casos, Pesquisa, Contratos ou Governança para esta seção.

### 4.6 Contratos e financeiro

- Apenas subitens e rotas existentes de contratos, catálogo/homologação comercial e financeiro.
- Não liberar nem criar cobrança, contrato, assinatura, link, cliente ou operação Asaas.

### 4.7 Governança e biblioteca

Manter, como subitens distintos e internos:

- Biblioteca Mestre (`/biblioteca`).
- Bases Genealógicas (`/fontes-genealogicas`).
- Matrizes conceituais.
- Indicadores e métricas.
- Log de decisões (`/governanca/decisoes`).
- Corte vertical e fontes.
- Inventário, Módulos contextuais, Critérios de aceite, Identificadores, Etiquetas, Integrações, Importações e Configurações, quando essas rotas já existirem.

Regras:

- Biblioteca Mestre não pode ser substituída por Log de decisões.
- Bases Genealógicas não pode ser absorvida por Biblioteca Mestre ou Log de decisões.
- Se o cabeçalho Governança e biblioteca e o subitem Biblioteca Mestre apontarem para a mesma rota, faça o cabeçalho funcionar como agrupador expansível e preserve o link `/biblioteca` somente no subitem Biblioteca Mestre.
- Não inventar base curada da Biblioteca Mestre; usar estado vazio honesto caso não haja itens.

## 5. Comportamento visual obrigatório

- A seção ativa deve estar visualmente identificada.
- Ao abrir uma seção, seus subitens devem ficar visíveis e navegáveis.
- Ao trocar de seção, manter comportamento previsível e sem duplicação.
- Em viewport mobile, o mesmo mapa de sete seções e subitens deve ser acessível por menu recolhível.
- A navegação não deve depender de cache: hard refresh e janela anônima devem manter o resultado.
- Rotas inexistentes devem mostrar 404 seguro em português, sem erro interno exposto.
- Acesso sem sessão/permissão deve retornar estado seguro, sem revelar dados internos.

## 6. Fora de escopo e proibições

Não executar nenhuma ação abaixo:

- Não criar tabelas, migrations, colunas, triggers, funções, RLS ou dados de teste.
- Não criar ou editar leads, oportunidades, casos, núcleos, dossiês, contatos, documentos, fontes, evidências, produtos, SKUs, contratos, cobranças ou eventos.
- Não alterar os estados de Ana Luiza ou qualquer registro piloto.
- Não criar nova aba global.
- Não alterar o mockup público `/` e suas 14 abas, salvo se ele estiver comprovadamente sendo renderizado dentro do Desk autenticado.
- Não recriar CRM, Casos 360, Pesquisa Genealógica, Núcleos, Onboarding, Catálogo, Migração, Biblioteca Mestre ou App Cliente.
- Não executar qualquer integração, chamada, leitura ou gravação externa em Asaas, Drive, Dropbox, Placego, Planilha Mestre, CRM OPS, e-mail, mensageria ou qualquer App Cliente.
- Não executar OCR, IA externa, pesquisa externa, consulta nominal, pedido de certidão ou contato com instituição.

## 7. Critérios de aceite

A entrega será aceita somente se todos os pontos abaixo forem demonstrados no preview autenticado:

1. O menu global tem exatamente sete seções principais, com os nomes definidos neste prompt.
2. Cada seção principal aparece uma vez e somente uma vez.
3. Há subitens expansíveis, visíveis e funcionais sob cada seção aplicável.
4. Não existe menu paralelo, fallback ou aba global adicional proveniente do mockup de 14 abas.
5. `/nucleos` é subitem de Casos e núcleos e também funciona por atalhos contextuais; não é aba principal.
6. Pesquisa Genealógica e Evidências continua contextual ao caso e suas nove seções não aparecem como abas globais.
7. Formalização, Jornada, Fechamento, Relatórios e Alertas continuam contextuais ao caso.
8. Biblioteca Mestre, Bases Genealógicas, Matrizes, Indicadores e Log de decisões aparecem como itens distintos de Governança e biblioteca.
9. O cabeçalho de Governança e biblioteca não duplica o link de Biblioteca Mestre.
10. Desktop e mobile, inclusive viewport de 390 px, exibem as mesmas sete seções e subitens.
11. Hard refresh e janela anônima preservam a estrutura correta.
12. Typecheck, build e todos os testes existentes passam.
13. Nenhuma migration, alteração de dados, schema ou ação externa foi executada.

## 8. Prova obrigatória na resposta

Ao concluir, responda somente com:

1. Arquivo(s), componente(s) e símbolo(s) alterados.
2. Rota/layout autenticado que efetivamente renderiza o menu no preview.
3. Captura textual da estrutura final das sete seções e seus subitens.
4. Confirmação de que `/nucleos`, Pesquisa Genealógica e Governança foram testados visualmente.
5. Resultado de validação em desktop e mobile (390 px), hard refresh e janela anônima.
6. Resultado de typecheck, build e testes.
7. Declaração explícita de que não houve migration, alteração de dados nem ação externa.
8. Pendência real que impeça algum critério de aceite.

Não iniciar nenhum prompt adicional automaticamente.