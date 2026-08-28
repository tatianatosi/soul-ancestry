# CA-LOVABLE-RESGATE-DESK-7-SECOES-CRM-VIVO-E-SUBITENS-v1.1

**Prioridade:** Crítica  
**Tipo:** Resgate de navegação operacional, CRM Vivo e validação visual  
**Substitui:** `CA-LOVABLE-RESGATE-DESK-7-SECOES-E-SUBITENS-v1.0`  
**Objetivo:** Fazer o Desk autenticado renderizar, no preview, sete seções principais com subitens — incluindo CRM Vivo funcional dentro de Comercial — sem criar abas globais extras, duplicar módulos ou executar ações externas.

---

## 1. Problema a corrigir

O sistema possui módulos de CRM já implementados, mas o Desk pode não estar expondo o **CRM Vivo** como uma experiência operacional reconhecível, navegável e completa dentro de Comercial. Não basta haver funções, tabelas ou componentes isolados: o CRM Vivo precisa aparecer e operar na interface autenticada.

Também houve regressões de menu: estrutura antiga, abas excessivas, subitens ausentes, links duplicados e divergência entre preview e código. Não trate alteração de constante como entrega concluída; valide visualmente no preview autenticado.

O mockup público em `/` pode conter uma navegação visual distinta com 14 abas. Ele não é o Desk autenticado e não deve ser usado como fallback do CRM Vivo nem como justificativa para manter menu legado na superfície operacional.

## 2. Resultado obrigatório

No Desk autenticado, o menu global deve exibir exatamente sete seções principais:

1. Visão geral
2. Comercial
3. Casos e núcleos
4. Pesquisa genealógica
5. Operação
6. Contratos e financeiro
7. Governança e biblioteca

A seção **Comercial** deve conter e tornar visível o **CRM Vivo**, com seus subitens e rotas existentes, sem criar uma aba principal adicional chamada CRM Vivo.

## 3. Fonte única de navegação

1. Use `src/components/saas/shell.tsx`, constante `NAV`, como fonte única do menu do Desk autenticado, salvo prova de que outra fonte é a efetivamente renderizada pelo preview.
2. Se o preview não estiver renderizando `SaasShell`/`NAV`, corrija o layout/rota autenticada para que ele renderize a fonte normativa.
3. Desktop e mobile devem usar a mesma fonte de navegação.
4. Não copie as 14 abas de `src/components/desk-app.tsx` ou `src/components/mockup/desk-mockup.tsx` para o shell autenticado.
5. Não apagar, reescrever ou usar o mockup público como fallback sem pedido explícito.
6. Remover somente menu duplicado, legado ou concorrente que afete o Desk autenticado.

## 4. Comercial → CRM Vivo obrigatório

### 4.1 Identidade visual e entrada

Dentro da seção principal **Comercial**, exiba de forma explícita o agrupamento/título **CRM Vivo**. O usuário deve conseguir reconhecer que Leads, triagem, propostas, clientes/núcleos e conversão pertencem ao CRM Vivo.

O CRM Vivo deve ser acessível como:

```text
Desk autenticado
→ Comercial
→ CRM Vivo
```

“CRM Vivo” pode ser um agrupador expansível ou um título interno de seção; **não criar uma oitava aba global**.

### 4.2 Subitens obrigatórios do CRM Vivo

Use apenas rotas e telas existentes. Não criar segunda ficha, segunda tabela ou fluxo paralelo.

O CRM Vivo deve expor, como subitens ou atalhos internos claros:

1. **Leads e triagem**
   - Rota existente de Leads, como `/leads`.
   - Botão “Novo lead” visível.
   - Formulário curto já existente: nome, e-mail/telefone, origem, interesse, responsável, próxima ação, prazo, resumo e indicado por.
   - ID `CA-LEAD-AAAA-SEQ` preservado.
   - Deduplicação por e-mail/telefone, com nome como sinal complementar, preservada.
   - Entrada em Triagem, sem liberar proposta, contrato, cobrança, onboarding, pesquisa externa ou App Cliente.

2. **Contatos, conversas e eventos de funil**
   - Permanecem dentro de Leads/CRM Vivo; não criar aba global própria.
   - Conversas/interações são imutáveis.
   - Correções ocorrem por novo registro que supersede o anterior, quando essa regra já existir.
   - Eventos de funil continuam rastreáveis e sujeitos a evidência/confirmação humana nos marcos sensíveis.

3. **Propostas**
   - Usar rota existente, como `/propostas`, e/ou contexto comercial da ficha do caso.
   - Não gerar proposta com SKU não homologado ou com gates comerciais pendentes.
   - Aceite verbal não libera contrato nem App Cliente.

4. **Conversão e handoff**
   - Usar a rota/tela existente de Conversão, se disponível, e o handoff derivado em Leads.
   - Mostrar a escada: aceite verbal → confirmação formal → contrato/cobrança → onboarding.
   - Handoff deve ser derivado da ficha existente, sem criar ficha paralela.
   - Exibir confirmado, pendente, responsável, próxima ação, prazo, bloqueios e histórico relevante.

5. **Clientes e núcleos vinculados**
   - Mostrar acesso contextual a clientes/casos e a Núcleos e dossiês quando a arquitetura existente permitir.
   - Não criar nova aba global de clientes ou núcleos.
   - `/nucleos` continua pertencendo a Casos e núcleos, como subitem e atalho contextual, não ao menu global do CRM Vivo.

### 4.3 Regras comerciais obrigatórias

- Oportunidade sem responsável, próxima ação ou prazo deve ficar marcada como não operável.
- Discovery e oportunidade devem ser os registros já existentes; não duplicar fichas.
- O resultado de Discovery continua derivado dos eixos existentes.
- Aceite verbal não cria cliente nem libera contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.
- Confirmação formal libera somente preparação da formalização.
- Onboarding requer contrato, pagamento e os demais gates existentes.
- Toda transição sensível deve continuar auditável e imutável.

### 4.4 Casos de regressão obrigatórios

- João, se existir no ambiente atual: manter “aceite verbal — confirmação formal pendente”; contrato e cobrança bloqueados.
- Ana Luiza: manter “aceite confirmado — formalização pendente” ou estado equivalente já registrado; onboarding, pesquisa externa e App Cliente permanecem bloqueados pelos gates existentes.
- Não criar João ou qualquer outro lead/caso de teste se ele não existir no ambiente. Não usar dados fictícios para satisfazer o teste.

## 5. Outras seis seções

### 5.1 Visão geral

- Painel Hoje (`/painel`) e filas operacionais existentes.
- A lista prioritária deve permanecer ordenada por próxima ação/prazo, não por data de criação.
- Não criar painel paralelo.

### 5.2 Casos e núcleos

- Casos 360.
- Núcleos e dossiês (`/nucleos`) como subitem e por atalhos contextuais.
- Formalização, Fechamento, Jornada, microentregas, Relatórios e Alertas permanecem contextuais ao caso.

### 5.3 Pesquisa genealógica

- Pesquisa Genealógica e Evidências permanece contextual à ficha de caso em `/pesquisa-evidencias/$caseId`.
- Suas nove seções internas não podem virar abas globais.
- Fontes e documentos continuam dentro de Fontes/Consultas da pesquisa do caso.

### 5.4 Operação

- Exibir somente subitens e rotas de operação já existentes.
- Não absorver Comercial, Casos, Pesquisa, Contratos ou Governança.

### 5.5 Contratos e financeiro

- Usar apenas rotas existentes de contratos, catálogo/homologação comercial e financeiro.
- Não criar contrato, cobrança, link, assinatura, produto, cliente ou operação em Asaas.

### 5.6 Governança e biblioteca

Manter como subitens distintos e internos:

- Biblioteca Mestre (`/biblioteca`).
- Bases Genealógicas (`/fontes-genealogicas`).
- Matrizes conceituais.
- Indicadores e métricas.
- Log de decisões (`/governanca/decisoes`).
- Corte vertical e fontes.
- Demais itens administrativos existentes, sem virar abas globais.

O cabeçalho Governança e biblioteca deve funcionar como agrupador expansível quando duplicar a rota de Biblioteca Mestre; o link `/biblioteca` fica somente no subitem Biblioteca Mestre.

## 6. Comportamento visual obrigatório

- Cada uma das sete seções principais aparece uma vez e apenas uma vez.
- A seção ativa deve estar identificada.
- Subitens devem expandir e navegar corretamente.
- Comercial deve permitir localizar CRM Vivo em no máximo um clique após abrir a seção Comercial.
- CRM Vivo deve mostrar Leads e triagem, Propostas, Conversão/handoff e contatos/conversas/eventos de funil de forma clara, usando telas existentes.
- Em mobile, viewport 390 px, a mesma estrutura deve funcionar em menu recolhível.
- Hard refresh e janela anônima devem manter a navegação correta.
- Rota inexistente deve apresentar 404 seguro em português.
- Sem sessão/permissão, usar estado seguro sem revelar dados internos.

## 7. Fora de escopo e proibições

Não executar nenhuma ação abaixo:

- Não criar tabelas, migrations, colunas, triggers, funções, RLS ou dados de teste.
- Não criar, excluir ou alterar leads, oportunidades, casos, núcleos, dossiês, contatos, conversas, eventos, documentos, fontes, evidências, produtos ou SKUs.
- Não alterar estados da Ana Luiza ou outro piloto.
- Não criar nova aba global, incluindo uma aba global chamada CRM Vivo.
- Não recriar CRM, Conversão, Casos 360, Pesquisa Genealógica, Núcleos, Onboarding, Catálogo, Migração, Biblioteca Mestre ou App Cliente.
- Não alterar o mockup público `/` e suas 14 abas, salvo prova de que ele é renderizado dentro do Desk autenticado.
- Não executar qualquer integração, chamada, leitura ou gravação externa em Asaas, Drive, Dropbox, Placego, Planilha Mestre, CRM OPS, e-mail, mensageria ou App Cliente.
- Não executar OCR, IA externa, pesquisa externa, consulta nominal, pedido de certidão ou contato com instituição.

## 8. Critérios de aceite

A entrega só será aceita se todos os pontos forem demonstrados no preview autenticado:

1. O menu global possui exatamente sete seções principais, com os nomes definidos neste prompt.
2. A seção Comercial mostra explicitamente o agrupamento CRM Vivo, sem criar uma oitava aba global.
3. CRM Vivo expõe Leads e triagem, Contatos/conversas/eventos, Propostas e Conversão/handoff por rotas/telas existentes.
4. “Novo lead” aparece em Leads e preserva validação mínima, ID e deduplicação.
5. Handoff e escada de conversão aparecem sem criar ficha paralela.
6. Nenhuma regra de aceite, contrato, cobrança, onboarding, pesquisa externa ou App Cliente sofre afrouxamento.
7. `/nucleos` continua subitem de Casos e núcleos, sem aba global.
8. Pesquisa Genealógica e Evidências permanece contextual ao caso.
9. Biblioteca Mestre, Bases Genealógicas, Matrizes, Indicadores e Log de decisões permanecem distintos.
10. Desktop e mobile (390 px) exibem a mesma estrutura.
11. Hard refresh e janela anônima preservam o resultado.
12. Typecheck, build e todos os testes existentes passam.
13. Nenhuma migration, gravação de dados ou ação externa foi executada.

## 9. Prova obrigatória na resposta

Ao concluir, responda somente com:

1. Arquivos, componentes e símbolos alterados.
2. Rota/layout autenticado que renderiza a navegação no preview.
3. Captura textual das sete seções, com os subitens de Comercial → CRM Vivo.
4. Rotas de CRM Vivo testadas, incluindo Leads, Propostas e Conversão/handoff quando existirem.
5. Confirmação de “Novo lead”, deduplicação, handoff e escada de conversão no preview.
6. Confirmação de `/nucleos`, pesquisa contextual e Governança testados visualmente.
7. Resultado em desktop, mobile 390 px, hard refresh e janela anônima.
8. Resultado de typecheck, build e testes.
9. Declaração explícita de que não houve migration, alteração de dados nem ação externa.
10. Pendência real que impeça critério de aceite.

Não iniciar nenhum prompt adicional automaticamente.