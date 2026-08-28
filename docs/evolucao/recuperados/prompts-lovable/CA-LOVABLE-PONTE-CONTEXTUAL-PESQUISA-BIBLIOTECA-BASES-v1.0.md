# CA-LOVABLE-PONTE-CONTEXTUAL-PESQUISA-BIBLIOTECA-BASES-v1.0

**Prioridade:** P1 — navegação contextual e consumo interno em modo leitura  
**Tipo:** Ponte contextual; não é reconstrução de módulos  
**Objetivo:** Disponibilizar Biblioteca Mestre e Bases Genealógicas como referências contextuais dentro de Pesquisa Genealógica e Evidências, preservando Governança e biblioteca como área exclusiva de administração, homologação e auditoria.

---

## 1. Contexto

As rotas internas já existem:

- Biblioteca Mestre: `/biblioteca`.
- Bases Genealógicas: `/fontes-genealogicas`.
- Pesquisa Genealógica e Evidências por caso: `/pesquisa-evidencias/$caseId`.

A área **Governança e biblioteca** já lista Biblioteca Mestre, Bases Genealógicas, Matrizes conceituais, Indicadores e métricas, Log de decisões, Corte vertical e fontes e itens administrativos. Esta arquitetura deve ser preservada.

O problema a resolver é de uso contextual: Biblioteca Mestre e Bases Genealógicas não podem ficar apenas escondidas em Governança, porque são insumos normativos da pesquisa por caso. Elas devem aparecer como referências de leitura dentro de Pesquisa Genealógica e Evidências, sem virar abas globais, sem duplicar cadastros e sem permitir execução de pesquisa externa.

## 2. Resultado obrigatório

Na tela:

```text
Desk autenticado
→ Casos 360
→ Pesquisa Genealógica e Evidências
→ /pesquisa-evidencias/$caseId
```

exibir uma ponte contextual, em modo leitura, para:

1. Biblioteca Mestre — referências aplicáveis ao caso.
2. Bases Genealógicas — trilhas, bases e fontes catalogadas aplicáveis ao caso.
3. Log de decisões — somente as decisões internas aplicáveis ao caso, quando houver relação existente.

A ponte deve ser visível na **Visão de pesquisa** e/ou no topo da tela, sem criar uma nova aba global e sem quebrar as nove seções internas existentes.

## 3. Cadeia normativa a preservar

A interface deve deixar claro, sem permitir salto automático, a cadeia:

```text
Bases Genealógicas / Dicionários / Trilhas
→ Pesquisa Genealógica e Evidências
→ Ficha, fontes, evidências e validação
→ Achados internos
→ Relatórios F1/F2 ou microentregas sanitizadas
→ App Cliente autorizado e publicado
```

Regras:

- Bases, dicionários e trilhas são o primeiro elo normativo da cadeia.
- Estar catalogada não torna uma fonte automaticamente ativa.
- A ponte não pode iniciar consulta, pesquisa externa, solicitação de documento, upload, OCR, IA externa, mensagem, contrato, cobrança ou publicação.
- Conteúdo interno nunca é projetado ao App Cliente por esta ponte.

## 4. Local de apresentação

### 4.1 Visão de pesquisa

Na seção interna **Visão de pesquisa**, incluir um bloco chamado:

```text
Referências normativas aplicáveis
```

O bloco deve apresentar, no mínimo:

- Trilha ou escopo de pesquisa registrado no caso, quando houver.
- Atalho ou lista resumida da Biblioteca Mestre aplicável.
- Atalho ou lista resumida de Bases Genealógicas aplicáveis.
- Situação de disponibilidade: homologada, em revisão, arquivada ou sem referência aplicável, conforme dado existente.
- Link de “ver catálogo completo” que abre a rota interna correspondente em leitura, mantendo o contexto do Desk.

### 4.2 Fontes e consultas

Na seção interna **Fontes e consultas**, incluir um atalho em leitura:

```text
Consultar Bases Genealógicas e referências homologadas
```

Esse atalho pode abrir painel lateral, modal, seção expansível ou rota interna com retorno ao caso. Não criar nova aba principal e não criar outra seção permanente na navegação global.

### 4.3 Alertas e histórico

Na seção interna **Alertas e histórico**, exibir link em leitura para decisões aplicáveis ao caso, somente quando houver vínculo já existente. Se não houver vínculo, mostrar estado vazio honesto:

```text
Nenhuma decisão normativa vinculada a este caso.
```

Não criar decisões automaticamente.

## 5. Biblioteca Mestre — comportamento permitido

A ponte para Biblioteca Mestre deve mostrar somente itens internos já existentes e permitidos pelo RLS, preferencialmente filtrados por campos que já existam, tais como:

- País ou escopo.
- Tipo de referência.
- Status/homologação.
- Trilha.
- Fase de pesquisa.
- Responsável, quando aplicável.

Para cada item resumido, mostrar apenas metadados já existentes e seguros:

- Título.
- Tipo/categoria.
- País ou escopo, se existente.
- Status de homologação.
- Versão/vigência, se existente.
- Responsável, se permitido pela política interna.

Não inventar itens, fontes, versões, vigências, responsáveis, links ou taxonomia. Se não houver item aplicável, mostrar estado vazio honesto:

```text
Nenhuma referência da Biblioteca Mestre vinculada ou aplicável ao contexto atual.
```

## 6. Bases Genealógicas — comportamento permitido

A ponte para Bases Genealógicas deve mostrar catálogo interno em modo leitura, usando somente dados já existentes e permitidos pelo RLS.

Exibir quando disponível:

- Nome da base/fonte catalogada.
- Tipo de fonte.
- País, região ou escopo.
- Estágio de maturidade.
- Status de disponibilidade/homologação.
- Trilha ou tema aplicável.
- Indicação explícita se é apenas referência catalogada e não fonte ativa.

Não exibir URL técnica, credenciais, dados sensíveis, logs de acesso, custo, contrato, preço ou detalhe que não seja autorizado à visualização do perfil atual.

Quando não houver base aplicável, usar estado vazio:

```text
Nenhuma Base Genealógica homologada foi vinculada a este contexto de pesquisa.
```

## 7. Separação de responsabilidades

### 7.1 Governança e biblioteca permanece proprietária de

- Cadastro e edição da Biblioteca Mestre.
- Cadastro, avaliação, maturidade e homologação das Bases Genealógicas.
- Arquivamento lógico e motivos.
- Matriz de avaliação e backlog de ativação.
- Definição de indicadores, matrizes e log de decisões.
- Auditoria, configurações, usuários, papéis, integrações e importações.

### 7.2 Pesquisa Genealógica e Evidências passa a consumir em leitura

- Referências da Biblioteca Mestre aplicáveis ao contexto do caso.
- Bases Genealógicas, dicionários e trilhas catalogados e autorizados.
- Decisões normativas vinculadas ao caso, quando existentes.

A pesquisa por caso não pode cadastrar, editar, homologar, ativar, arquivar ou alterar nenhum item de Governança.

## 8. Restrições rígidas

Não executar nenhuma das ações abaixo:

- Não criar nova aba global do Desk.
- Não remover Biblioteca Mestre ou Bases Genealógicas de Governança e biblioteca.
- Não fundir Biblioteca Mestre, Bases Genealógicas e Log de decisões em uma única tela ou entidade.
- Não criar tabelas, migrations, colunas, triggers, funções, RLS ou seeds.
- Não criar, editar ou vincular automaticamente dados de caso, pessoa, família, relação, evento, fonte, evidência, achado, relatório ou microentrega.
- Não disparar consulta externa, pesquisa nominal externa, solicitação de certidão, contato com instituição ou aquisição de acervo.
- Não executar OCR, IA externa, webhooks ou automações externas.
- Não permitir upload de documento pela ponte contextual.
- Não criar contrato, cobrança, link Asaas, assinatura, cliente, pasta, arquivo, documento, e-mail ou mensagem.
- Não alterar o App Cliente, suas permissões ou suas projeções.
- Não expor no App Cliente hipótese, fonte, evidência, risco, status técnico, custo, preço, credencial, URL técnica, log, auditoria ou decisão interna.

## 9. Segurança e estados

- Respeitar RLS por organização e permissões existentes.
- O conteúdo retornado deve ser somente leitura.
- Links diretos sem sessão ou permissão devem retornar estado seguro.
- Não revelar motivo interno para usuário não autorizado.
- Não expor URL técnica de arquivos, bases ou documentos.
- Se não houver dados aplicáveis, usar estado vazio, sem dados fictícios.

## 10. Critérios de aceite

A entrega só será aceita se todos os pontos forem demonstrados no preview autenticado:

1. Em `/pesquisa-evidencias/$caseId`, a Visão de pesquisa mostra o bloco “Referências normativas aplicáveis”.
2. O bloco apresenta Biblioteca Mestre e Bases Genealógicas como referências de leitura, sem nova aba global.
3. A seção Fontes e consultas possui atalho de consulta contextual às bases/referências homologadas.
4. A seção Alertas e histórico exibe decisões vinculadas em modo leitura, ou estado vazio honesto se não existir vínculo.
5. Governança e biblioteca continua com Biblioteca Mestre, Bases Genealógicas, Matrizes, Indicadores e Log de decisões em itens distintos.
6. Biblioteca Mestre e Bases Genealógicas não são cadastráveis/editáveis dentro da pesquisa do caso.
7. A ponte não inicia pesquisa externa, upload, OCR, IA, mensagem, contrato, cobrança ou publicação.
8. Nenhuma informação interna é exposta ao App Cliente.
9. Estados vazios são exibidos quando não houver referências aplicáveis.
10. Desktop e mobile exibem a ponte de forma legível.
11. Typecheck, build e todos os testes existentes passam; adicionar testes de regressão quando houver infraestrutura existente para a tela.
12. Nenhuma migration, gravação de dado nem ação externa é executada.

## 11. Prova obrigatória na resposta

Ao concluir, responda somente com:

1. Arquivos, componentes e rotas alterados.
2. Local exato onde a ponte aparece em Pesquisa Genealógica e Evidências.
3. Campos/filtros existentes utilizados para selecionar referências, sem inventar dados.
4. Demonstração do estado com referência e do estado vazio, quando aplicável.
5. Confirmação de que Biblioteca Mestre, Bases Genealógicas e Log de decisões seguem distintos em Governança.
6. Confirmação de que não existe escrita, upload, ativação de fonte, consulta externa ou ação no App Cliente.
7. Resultado de typecheck, build e testes.
8. Declaração explícita de que não houve migration, gravação de dados nem ação externa.
9. Pendências reais que dependam de curadoria ou decisão humana.

Não iniciar nenhum prompt adicional automaticamente.