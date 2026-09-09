# Taxonomia Canônica do Mockup Aprovado — App Cliente e Desk Intelligence

**Fonte de verdade:** `clube-ancestral-mockup.pdf`  
**Status:** nomenclatura aprovada do mockup visual  
**Regra:** esta taxonomia não pode ser renomeada, fundida, expandida ou substituída por taxonomias posteriores sem aprovação explícita da proprietária.

---

## 1. Correção necessária

A nomenclatura que havia sido apresentada anteriormente estava errada porque misturava versões posteriores de produto com o mockup visual aprovado.

O mockup aprovado contém **sete telas do App Cliente** e **sete telas do Desk Intelligence**. Os nomes canônicos são os listados abaixo.

O documento de origem declara expressamente que se trata de um:

```text
Mockup visual para aprovação
App Cliente · Desk Intelligence
Protótipo navegável — sem dados reais
```

Portanto, estes nomes são a taxonomia de interface aprovada. Eles não significam, por si só, que cada tela já possua todos os motores, CRUDs, integrações ou dados reais implementados.

---

## 2. App Cliente — 7 telas aprovadas

### Navegação canônica

```text
1. Home
2. Jornada
3. Radar
4. Árvore
5. Documentos
6. Legado
7. Conta
```

### Tela 1 — Home

**Rótulo aprovado:** `Home`  
**Descrição aprovada:** `Painel do caso, progresso e achados recentes`

**Papel correto:** porta de entrada da pessoa/família no App Cliente.

Deve concentrar:

- resumo do caso;
- progresso da jornada;
- achados recentes liberados;
- próxima ação visível ao cliente;
- atualizações liberadas;
- micro-entregas recentes;
- chamadas contextualizadas para áreas relevantes do app.

Não deve exibir:

- gates internos;
- NO_GO/GO_CONDICIONAL;
- auditoria;
- indicadores técnicos de banco;
- notas internas;
- regras de RLS;
- hipóteses sem revisão;
- dados de terceiros sem visibilidade autorizada.

---

### Tela 2 — Jornada

**Rótulo aprovado:** `Jornada`  
**Descrição aprovada:** `Linha do tempo ancestral 1820–2024`

**Papel correto:** mostrar continuidade temporal da história familiar e da jornada do caso.

Deve concentrar:

- linha do tempo ancestral;
- eventos familiares e migratórios liberados;
- marcos do processo;
- etapas concluídas/em andamento;
- micro-entregas e descobertas autorizadas;
- próximos capítulos da jornada.

Não deve ser renomeada para “Cidadanias Europeias”, “Memória” ou “Alertas”. Esses podem aparecer como conteúdos/blocos internos quando pertinentes, mas não substituem o nome da tela aprovada.

---

### Tela 3 — Radar

**Rótulo aprovado:** `Radar`  
**Descrição aprovada:** `Radar de elegibilidade em 6 eixos`

**Papel correto:** síntese visual de aderência, situação documental e frentes de evolução da jornada.

Deve concentrar:

- seis eixos de elegibilidade/avanço;
- leitura de documentos, gerações, linhagem, condições e próximos passos;
- nível de evidência;
- itens em análise, quando autorizados;
- explicações simples e não técnicas.

Não deve apresentar elegibilidade jurídica definitiva quando houver apenas hipótese ou leitura preliminar.

---

### Tela 4 — Árvore

**Rótulo aprovado:** `Árvore`  
**Descrição aprovada:** `Árvore genealógica G1–G5`

**Papel correto:** visão da estrutura familiar e ancestral da pessoa/família.

Pode conter, de forma progressiva:

- árvore por gerações G1–G5;
- modo simples e robusto;
- informações liberadas por participante;
- relações familiares;
- marcos/documentos vinculados;
- importação GEDCOM ou sincronização de fontes quando forem funcionalidades reais;
- grafo/heatmap como modo avançado, não como sobrecarga da tela principal.

Não deve expor dados privados de outros participantes sem regra de visibilidade.

---

### Tela 5 — Documentos

**Rótulo aprovado:** `Documentos`  
**Descrição aprovada:** `Upload, checklist e entregas do caso`

**Papel correto:** central de documentos da família e do processo.

Deve concentrar:

- documentos solicitados;
- documentos recebidos;
- checklist visível para a pessoa/família;
- documentos validados/liberados;
- entregas documentais;
- upload real somente quando a integração de Storage estiver implementada;
- status compreensível por pessoa e por caso.

Regra importante:

```text
Registro de metadado não é upload real.
```

Até existir upload real, a interface deve ser honesta sobre o que está disponível.

---

### Tela 6 — Legado

**Rótulo aprovado:** `Legado`  
**Descrição aprovada:** `Biblioteca de conteúdo e nível premium`

**Papel correto:** entregar valor contínuo de memória, interpretação, continuidade e produtos premium autorizados.

Deve concentrar:

- biblioteca de conteúdos liberados;
- relatórios, cadernos e entregas premium;
- linha do tempo/narrativas familiares;
- memória familiar e materiais de legado;
- plano/nível premium quando fizer parte da experiência;
- ofertas contextuais somente quando conectadas a SKU, preço e link reais.

Não deve prometer terapia, cura clínica ou resultado jurídico automático.

---

### Tela 7 — Conta

**Rótulo aprovado:** `Conta`  
**Descrição aprovada:** `Perfil, plano, alertas e histórico`

**Papel correto:** área pessoal e de acesso do usuário.

Deve concentrar:

- perfil;
- plano/assinatura quando aplicável;
- alertas pessoais;
- histórico de acesso/atualizações;
- integrantes da família conectada quando aplicável;
- preferências de visibilidade e comunicação;
- convites/acessos disponíveis conforme regra real.

`Conta` é a tela aprovada. Não renomear para `Acesso` sem nova aprovação visual.

---

## 3. Desk Intelligence — 7 telas aprovadas

### Navegação canônica

```text
1. Visão Geral
2. Casos 360
3. Checklist
4. Validação Jurídica
5. Radar Interno
6. Alertas
7. Biblioteca Mestre
```

### Tela 1 — Visão Geral

**Rótulo aprovado:** `Visão Geral`  
**Descrição aprovada:** `KPIs, funil de leads e alertas pendentes`

**Papel correto:** cockpit executivo/operacional do Desk.

Deve concentrar:

- KPIs reais;
- funil de leads;
- alertas pendentes;
- casos sem próxima ação;
- tarefas prioritárias;
- cadências atrasadas;
- indicadores com link para ação/contexto.

Não deve ser apenas uma lista de cards, bibliotecas ou contadores sem saída operacional.

---

### Tela 2 — Casos 360

**Rótulo aprovado:** `Casos 360`  
**Descrição aprovada:** `Carteira de clientes e saúde do caso`

**Papel correto:** centro de operação do caso e entrada para o Caso 360 individual/familiar.

Deve concentrar:

- carteira de clientes/casos;
- saúde do caso;
- fase/jornada;
- responsável;
- próxima ação;
- contrato, OS, pesquisa, documentos, tarefas e entregas contextualizados;
- acesso rápido à Pessoa 360 e ao núcleo familiar.

Não deve abrir prioritariamente em gate, auditoria, prévia técnica ou cadeia operacional bloqueante.

---

### Tela 3 — Checklist

**Rótulo aprovado:** `Checklist`  
**Descrição aprovada:** `Tarefas por prioridade`

**Papel correto:** organizar execução interna por prioridade, responsável, prazo e caso.

Deve concentrar:

- tarefas abertas;
- tarefas vencidas/para hoje;
- tarefas por prioridade;
- tarefa individual/familiar;
- responsável;
- prazo;
- vínculo com caso, participante, documento, pesquisa, contrato, OS ou onboarding;
- conclusão/reprogramação.

Regra:

```text
Toda tarefa relevante deve estar vinculada ao mesmo case_id.
```

---

### Tela 4 — Validação Jurídica

**Rótulo aprovado:** `Validação Jurídica`  
**Descrição aprovada:** `Elegibilidade e parecer jurídico`

**Papel correto:** área técnica de avaliação jurídica/documental e elegibilidade.

Deve concentrar:

- elegibilidade;
- parecer jurídico;
- requisitos específicos de rota/país;
- pendências que impactem assinatura, protocolo ou ação formal;
- evidências e fontes relevantes;
- decisão humana e histórico quando aplicável.

Não deve bloquear rascunho de caso, pesquisa, tarefa, proposta, contrato rascunho ou OS por requisitos que só importam em assinatura, envio, cobrança, protocolo ou ativação formal.

---

### Tela 5 — Radar Interno

**Rótulo aprovado:** `Radar Interno`  
**Descrição aprovada:** `Matriz de prioridade e radares individuais`

**Papel correto:** leitura interna de prioridades, riscos, saúde da carteira e situações que pedem decisão.

Deve concentrar:

- matriz de prioridade;
- radares individuais/familiares;
- risco documental/comercial/operacional;
- cadência e atraso;
- casos sem responsável/próxima ação;
- sinais derivados de dados reais.

Não deve exibir números simulados. Quando não houver base, usar `Sem dados suficientes`.

---

### Tela 6 — Alertas

**Rótulo aprovado:** `Alertas`  
**Descrição aprovada:** `Gestão de achados e notificações`

**Papel correto:** central de sinais operacionais, achados e notificações internas/preparadas.

Deve concentrar:

- achados relevantes;
- alertas de documentos;
- alertas de pesquisa;
- alertas de cadência;
- alertas de prazo;
- notificações internas;
- atualizações preparadas para o App Cliente.

Não deve disparar mensagens externas automaticamente. Envio por e-mail, WhatsApp, cobrança, convite ou assinatura continua sujeito à infraestrutura real e confirmação explícita.

---

### Tela 7 — Biblioteca Mestre

**Rótulo aprovado:** `Biblioteca Mestre`  
**Descrição aprovada:** `Produção de conteúdo por caso`

**Papel correto:** central de produção, organização e reutilização de conteúdo/entregas por caso.

Deve concentrar:

- conteúdos e templates;
- entregas por caso;
- relatórios;
- referências internas;
- materiais de memória/legado;
- produção de conteúdo associada a caso, pessoa, jornada ou produto;
- status, responsável, próxima ação e visibilidade.

Biblioteca Mestre não deve ser uma lista sem consequência operacional. Um item relevante precisa poder ser vinculado a caso, tarefa, micro-entrega ou atualização de App Cliente.

---

## 4. Taxonomia: o que não pode ser confundido

### App Cliente não é Desk

| App Cliente — nomenclatura aprovada | Desk — nomenclatura aprovada |
|---|---|
| Home | Visão Geral |
| Jornada | Casos 360 |
| Radar | Checklist |
| Árvore | Validação Jurídica |
| Documentos | Radar Interno |
| Legado | Alertas |
| Conta | Biblioteca Mestre |

Não transferir para o App Cliente termos do Desk, como:

```text
Hoje
Comercial
Casos
Pessoas & Famílias
Pesquisa
Marketing
Configuração
```

Esses nomes podem ser uma proposta futura de agrupamento operacional do Desk, mas não substituem a navegação aprovada do App Cliente e nem a nomenclatura das sete telas do mockup.

### Centro de Inteligência não é App Cliente

Bases genealógicas, fontes técnicas, APIs, repositórios, regras de matching, bibliotecas internas, auditoria e integrações pertencem ao Desk/Centro de Inteligência. O App Cliente recebe somente a informação já tratada e liberada.

---

## 5. Regra de preservação para Claude

```text
Não renomear, remover, fundir, acrescentar ou redistribuir as sete telas
aprovadas do App Cliente e do Desk Intelligence sem comparação explícita
com este documento e aprovação da proprietária.

App Cliente aprovado:
Home, Jornada, Radar, Árvore, Documentos, Legado, Conta.

Desk Intelligence aprovado:
Visão Geral, Casos 360, Checklist, Validação Jurídica,
Radar Interno, Alertas, Biblioteca Mestre.

Toda proposta nova de agrupamento operacional deve ser apresentada como
camada interna, submenu ou futura revisão de navegação — nunca como
substituição silenciosa da taxonomia aprovada.
```

---

## 6. Regra final

> O mockup aprovado define a taxonomia visual. O produto operacional pode evoluir por trás dela, mas não pode mudar o nome e o sentido das telas sem decisão explícita da proprietária.

```text
App Cliente:
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta.

Desk Intelligence:
Visão Geral → Casos 360 → Checklist → Validação Jurídica
→ Radar Interno → Alertas → Biblioteca Mestre.
```
