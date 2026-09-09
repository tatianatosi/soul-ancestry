# Prompt de Revisão de Layout e Marca — Clube Ancestral

**Projeto:** `tatianatosi/soul-ancestry`  
**Superfícies:** Desk Intelligence interno e App Cliente  
**Objetivo:** aplicar a marca oficial e reorganizar a experiência visual após a estabilidade operacional, sem substituir dados reais por mockups, sem reabrir gates no fluxo e sem alterar segurança ou lógica de negócio.

---

## 0. Momento correto da revisão

Esta revisão visual só começa depois de estar comprovado no preview que a proprietária consegue operar o caso real da Ana Luiza:

```text
Abrir Caso 360
→ preencher contrato em rascunho
→ salvar e confirmar persistência após refresh
→ iniciar ou retomar onboarding real no mesmo case_id
→ ver próxima ação e tarefas reais no Caso 360 e no Painel Hoje
```

Não usar este prompt para adiar ou substituir correções de persistência, contrato, onboarding, tarefa, próxima ação ou dados canônicos.

A revisão de layout deve preservar todo funcionamento já validado. Interface bonita sem operação real não é entrega.

---

## 1. Direção de marca

Aplicar a identidade oficial do Clube Ancestral, respeitando os ativos de marca e o guia visual já disponíveis no projeto.

### Ativos de marca

Usar o logo vetorial oficial do Clube Ancestral, em suas variações aprovadas, como referência para topbar, sidebar, login, app cliente e materiais visuais internos.

Não substituir a marca por ícones genéricos, logos improvisados, selos inconsistentes ou tipografia que descaracterize o Clube Ancestral.

### Paleta de referência

```text
Navy:       #2F4B6E
Preto:      #101010
Bege:       #ECDFCD
Dourado:    #FCB73A
Terracota:  #9A3A2F
```

### Linguagem visual

A marca deve comunicar:

- ancestralidade;
- pesquisa rigorosa;
- acolhimento;
- legado;
- sofisticação editorial;
- clareza operacional;
- confiança documental;
- humanidade sem infantilização;
- profundidade sem excesso de ornamento.

Usar contrastes calmos, espaços em branco, cartões bem hierarquizados e tipografia legível. O visual pode ter caráter editorial e memorial, mas o Desk precisa continuar sendo rápido para operar.

---

## 2. Separação obrigatória de superfícies

Não misturar a experiência do cliente com a operação interna.

| Superfície | Papel | Linguagem visual |
|---|---|---|
| Desk Intelligence | Operar casos, tarefas, contratos, pesquisa, documentos, comercial, marketing e configuração. | Direta, rápida, informativa, focada em decisão e execução. |
| App Cliente | Acompanhar jornada, documentos liberados, árvore, cidadania, memória, legado, alertas e entregas. | Acolhedora, clara, orientada a progresso, pertencimento e valor percebido. |
| Centro de Inteligência | Bases, fontes, evidências, APIs, matching, repositórios, regras técnicas e pesquisa interna. | Interna, técnica quando necessário, não exposta como produto padrão ao cliente. |

O App Cliente não deve exibir tokens, APIs, regras de matching, fontes internas brutas, dados de terceiros, notas internas, custos internos ou hipóteses ainda não autorizadas.

---

## 3. Desk simples: arquitetura visual

O Desk deve consolidar a arquitetura completa em sete grupos de navegação:

```text
HOJE
COMERCIAL
CASOS
PESSOAS & FAMÍLIAS
PESQUISA
MARKETING
CONFIGURAÇÃO
```

Não apagar rotas nem capacidades existentes apenas para reduzir o menu. Reorganizar a descoberta e a hierarquia visual.

### 3.1 Hoje

**Pergunta principal:** o que precisa acontecer agora — e com quem?

```text
- Painel Hoje
- Minhas tarefas
- Próximas ações
- Alertas operacionais
- Atividade recente
- Pessoas acompanhadas
- Pessoa 360 rápida
```

Incluir cartões de pessoas prioritárias, por exemplo:

```text
Ana Luiza
Caso: CA-CID-AT-FAM-2026-001
Fase: [fase atual]
Próxima ação: [descrição]
Responsável: [nome/papel]
Tarefas abertas: [número]
Contrato: [rascunho/em revisão/pronto]
Última atualização: [data/hora]

[Ver Pessoa 360] [Abrir Caso 360]
```

Pessoa 360 é uma visão agregada dos registros já existentes. Não cria novo cliente, caso, núcleo ou identidade.

### 3.2 Comercial

**Pergunta principal:** quem está entrando, sendo qualificado ou se tornando caso?

```text
- Leads e oportunidades
- Discovery
- Propostas
- Clientes
- Condições comerciais
- Financeiro do caso
- Conversão e origem do lead
```

Fluxo visual:

```text
Campanha/formulário
→ lead
→ discovery
→ oportunidade
→ proposta
→ aceite
→ caso canônico
```

### 3.3 Casos

**Pergunta principal:** o que estamos executando para esta pessoa/família?

```text
- Todos os casos
- Caso 360
- Onboarding
- Ordens de Serviço
- Entregas e relatórios
```

O Caso 360 é a porta operacional principal. Nunca abrir o caso diretamente em gate, Piloto, conferência, cadeia operacional, prévia contratual ou auditoria.

### 3.4 Pessoas & Famílias

**Pergunta principal:** para quem e com quem estamos trabalhando?

```text
- Pessoa 360
- Núcleos familiares
- Participantes
- Relações e linhagens familiares
- Dossiês familiares
```

### 3.5 Pesquisa

**Pergunta principal:** qual evidência sustenta a jornada e o que precisamos descobrir?

```text
- Painel de pesquisa
- Achados genealógicos
- Pessoas da pesquisa
- Linhagens
- Hipóteses
- Evidências
- Solicitações documentais
- Biblioteca de documentos
- Bibliotecas genealógicas
- Fontes genealógicas
- Bases e repositórios
- Integrações de pesquisa
- Relatórios de pesquisa
```

Bibliotecas, fontes, bases e repositórios genealógicos pertencem à área de Pesquisa, não à Configuração.

### 3.6 Marketing

**Pergunta principal:** como atraímos, nutrimos e convertemos pessoas em casos?

```text
- Dashboard de marketing
- Produtos e ofertas
- Campanhas
- Conteúdos
- Landing pages
- Formulários e captação
- Segmentos e públicos
- Automação e cadências
- Origem de leads
- Conversão e funil
- Biblioteca de mensagens
- Métricas de campanha
```

### 3.7 Configuração

**Pergunta principal:** como a operação se mantém consistente, segura e administrável?

```text
- Perfil institucional
- Catálogo e preços
- Equipe e acessos
- Integrações operacionais
- Modelos e templates
- Parâmetros do sistema
- Dados técnicos
- Qualidade e auditoria
```

---

## 4. Caso 360: hierarquia visual

O Caso 360 deve ter no máximo sete áreas principais no primeiro nível:

```text
Visão geral
Pessoas
Tarefas
Pesquisa
Documentos
Comercial
Execução
```

### Visão geral

Exibir em leitura imediata:

```text
Cliente/contato principal
Código humano do caso
Tipo: individual ou familiar
Fase operacional
Próxima ação
Responsável
Núcleo familiar vinculado
Dossiê vinculado, quando houver
Última atualização
```

### Pessoas

```text
Contratantes
Participantes
Dependentes
Representantes legais
Relações familiares
Pessoa 360
```

### Tarefas

```text
Próxima ação
Tarefas abertas
Pendências com responsável
Ações compartilhadas e individuais
Prazos e reprogramações
```

### Pesquisa

```text
Achados
Evidências
Hipóteses
Linhagens
Fontes relacionadas
Solicitações documentais
```

### Documentos

```text
Documentos internos
Arquivos liberados
Solicitações
Anexos
Entregáveis documentais
```

### Comercial

```text
Discovery
Proposta
SKU/produto
Condição comercial
Financeiro
Acesso de revisão do portal, quando houver fluxo real
```

### Execução

```text
Contrato
Cláusulas
Anexos contratuais
Ordem de Serviço
Onboarding
Micro-entregas
Marcos
Comunicação operacional
```

---

## 5. Regras visuais de operação

### 5.1 Ações internas devem aparecer primeiro

Destacar, por contexto, ações que realmente podem ser feitas:

```text
[Editar]
[Salvar]
[Definir próxima ação]
[Criar tarefa]
[Adicionar participante]
[Registrar documento]
[Registrar descoberta]
[Criar proposta rascunho]
[Criar contrato rascunho]
[Criar Ordem de Serviço]
```

### 5.2 Ações indisponíveis não devem dominar

Não destacar botões como:

```text
Enviar ao cliente (desabilitado)
Portal bloqueado
NO_GO
GO_CONDICIONAL
Bloqueado pelo elo anterior
```

Se uma ação externa ainda não possui integração real, não apresentar botão morto como ação principal. Exibir explicação curta em área secundária ou substituir por uma ação interna efetiva, como “Preparar convite de revisão”, somente quando o fluxo for de fato implementado.

### 5.3 Dados técnicos ficam recolhidos

Criar uma área discreta e recolhida:

```text
Dados técnicos e validações
- requisitos de ativação;
- integridade da cadeia;
- auditoria;
- critérios de serviço;
- status de integração;
- diagnósticos de inconsistência.
```

Não apagar regras reais de banco. Apenas não usá-las como interface principal de trabalho.

---

## 6. Contrato: revisão de layout

A tela de contrato deve priorizar preparação e edição, não mostrar uma planilha técnica de partes.

### Ações principais

```text
[Editar contrato]
[Salvar rascunho]
[Adicionar cláusula]
[Adicionar anexo]
[Criar tarefa]
[Solicitar revisão humana]
```

### Estrutura recomendada

```text
Resumo
Partes
Escopo
Cláusulas
Anexos

Dados técnicos ▾
- Versões
- Revisão
- Fontes
- Validações
- Auditoria, quando aplicável
```

### Partes no mobile

Não usar tabela horizontal para partes do contrato no celular. Usar cartões empilhados:

```text
Ana Luiza
Papel: Contratante
Capacidade: Adulta
Assinatura: Necessária
Vínculo com o caso: [descrição]
[Editar parte]
```

A mesma regra vale para cocontratantes, dependentes, representantes e prestador.

---

## 7. Mobile-first

O Desk não precisa replicar uma planilha no celular. Precisa ser utilizável para consulta e ações essenciais.

### Regras obrigatórias

- Não usar tabelas horizontais para edição de informações essenciais.
- Transformar tabelas em cards empilhados no viewport estreito.
- Usar acordeões para detalhes técnicos, campos avançados e histórico extenso.
- Garantir largura adequada para inputs, selects, datas e botões.
- Garantir área mínima de toque confortável.
- Quando o teclado abrir, manter campo ativo e botão Salvar acessíveis por rolagem.
- Adicionar espaçamento inferior compatível com safe area do dispositivo.
- Não permitir que assistente flutuante, chat, toolbar ou botões laterais cubram campos, selects, ações ou botão Salvar.
- Reduzir o assistente a ícone compacto e deslocável em telas estreitas, quando necessário.
- Códigos canônicos e aliases não devem quebrar por hífen; usar linha única e rolagem horizontal somente quando necessário.
- Não esconder informação crítica à esquerda/direita em tabelas com scroll sem aviso.

### Navegação mobile

```text
Menu hamburger
→ grupos principais em acordeão
→ rotas secundárias dentro de cada grupo
→ Caso 360 como entrada principal de trabalho
```

Evitar faixas de dez ou mais abas horizontais.

---

## 8. App Cliente

O App Cliente deve manter uma experiência distinta, centrada na família e no valor percebido.

### Áreas sugeridas

```text
Painel
Árvore
Cidadania
Memória
Legado
Documentos
Alertas
Acesso
```

### Princípios

- Mostrar somente informações pertencentes àquele cliente/família.
- Mostrar nacionalidades, cidadanias e trilhas com aderência/evidência suficiente.
- Árvore em modo simples para leitura rápida e modo robusto para exploração opcional.
- Grafo, heatmap e adjacências avançadas apenas sob demanda, não como sobrecarga da tela inicial.
- Mostrar descobertas, evidências apropriadas, documentos liberados, micro-entregas e próximos passos.
- Separar claramente “registro encontrado”, “hipótese em análise” e “documento validado”.
- Não expor regras técnicas, APIs, tokens, custos internos, auditoria, dados de terceiros ou hipóteses cruas.

Regra-mãe:

```text
Integração invisível.
Evidência visível.
```

---

## 9. Preservação de motores e dados

A revisão de layout não pode modificar, substituir ou duplicar os motores do produto.

Preservar:

```text
Um case_id canônico por atendimento.
Case code humano com aliases históricos.
Núcleo familiar vinculado ao caso quando aplicável.
Participantes com papéis e visibilidades claras.
Proposta, contrato, OS, tarefa, pesquisa, documento, micro-entrega,
financeiro, comunicação e app vinculados ao mesmo case_id.
Uma próxima ação clara por caso.
Tarefas vinculadas ao case_id e ao participante quando aplicável.
RLS, sessão, isolamento por organização e auditoria em segundo plano.
```

A revisão visual não pode:

- criar novo caso, núcleo, cliente ou participante;
- fazer merge automático;
- alterar aliases;
- alterar schema sem necessidade explícita;
- remover RLS, sessão, permissões ou auditoria;
- criar bypass de admin;
- substituir dados reais por mocks/arrays locais;
- quebrar persistência após refresh;
- reintroduzir Modo Proprietária ou gate cerimonial.

---

## 10. Sequência de implementação

1. Validar que Ana Luiza está operável no Caso 360.
2. Criar branch específica de revisão visual.
3. Preservar todas as rotas e dados; reorganizar apenas navegação e componentes visuais.
4. Fazer primeiro o menu principal e Caso 360.
5. Fazer depois a experiência mobile de Pessoa, Contrato e tarefas.
6. Fazer em seguida Pesquisa, Marketing e Configuração.
7. Revisar App Cliente em branch/PR separada, sem misturar com Desk.
8. Testar cada mudança em preview mobile e desktop.
9. Confirmar que salvar, refresh e releitura continuam funcionando em cada domínio tocado.
10. Não mesclar sem aprovação explícita da proprietária.

---

## 11. Critérios de aceite

### Desk

- O menu tem sete grupos claros: Hoje, Comercial, Casos, Pessoas & Famílias, Pesquisa, Marketing e Configuração.
- Pessoa 360 rápida pode ser aberta dentro de Hoje.
- Caso 360 abre como ficha operacional principal.
- Ações internas úteis ficam visíveis antes de detalhes técnicos.
- Dados técnicos ficam recolhidos.
- Contrato deixa de usar tabela horizontal no mobile.
- Nenhum botão desabilitado domina a tela.
- Assistente e elementos flutuantes não bloqueiam formulários.
- Todas as telas editadas continuam salvando e persistindo após refresh.

### App Cliente

- A experiência é distinta do Desk.
- Mostra progresso, entregas e evidência apropriada.
- Não expõe mecanismos internos do Centro de Inteligência.
- Mantém marca oficial, navegação clara e leitura mobile-first.

### Segurança

- RLS, sessão, permissões organizacionais e auditoria de fundo permanecem intactos.
- Confirmação explícita permanece apenas para ações externas reais e irreversíveis.

---

## Regra final

> O Desk deve ser simples para operar, completo para acompanhar e técnico apenas quando a operação precisar do técnico.

```text
Marca coerente.
Operação clara.
Dados reais.
Ações reais.
Nenhuma tela bonita escondendo trabalho bloqueado.
```
