# CA-UX-01.1 — Decisões do Mockup Aprovado de 17 Telas e Prompt de Reconciliação

**Versão:** 1.1  
**Data:** 20 de agosto de 2026  
**Status:** decisão canônica de navegação e conformidade  
**Fonte visual primária:** `clube-ancestral-mockup.pdf` — 17 páginas  
**Fonte complementar:** `clube-ancestral-mockup-auditoria.pdf` — estados, fluxos, conteúdos e exemplos  
**Substitui:** interpretações não conformes ao mockup aprovadas apenas em conversa.

---

## 1. Decisão máxima

O mockup visual de 17 telas é o contrato aprovado de navegação principal:

```text
App Cliente: 7 telas
Desk Intelligence: 7 telas
Capa e divisórias: 3 telas
```

Nenhum desenvolvimento pode criar uma navegação principal diferente sem decisão humana versionada. Dados, gates, permissões e componentes podem ser adaptados; a arquitetura visual aprovada não pode ser simplificada, removida ou redesenhada por conveniência técnica.

---

## 2. Fontes e precedência

| Fonte | Uso |
|---|---|
| `clube-ancestral-mockup.pdf` | Navegação e páginas principais aprovadas |
| `clube-ancestral-mockup-auditoria.pdf` | Conteúdo, estados, mock de dados, formalização, detalhes de páginas e exemplos de comportamento |
| Desk/Supabase | Dados reais, gates, permissões, eventos e auditoria |
| Biblioteca Base | Dicionários, fontes, trilhas, linguagem, modelos e marcos |

Em conflito:

1. O mockup de 17 telas prevalece para navegação principal.
2. O mockup de auditoria complementa conteúdo e estados, sem criar novas abas principais.
3. Dados reais/gates do Desk prevalecem sobre dados fictícios do mockup.
4. Conteúdo cliente-facing só aparece por projeção aprovada.

---

## 3. App Cliente — sete telas obrigatórias

| Nº | Tela | Finalidade aprovada | Dados permitidos |
|---:|---|---|---|
| 1 | Home | Painel do caso, progresso e achados recentes | Timeline, radar sanitizado, documentos, entregas e próximos passos |
| 2 | Jornada | Linha do tempo ancestral e da jornada | Eventos operacionais e genealógicos aprovados |
| 3 | Radar | Radar de elegibilidade/completude em seis eixos | Projeções de completude; nunca garantia jurídica |
| 4 | Árvore | Árvore genealógica G1–G5 | Pessoas/relações aprovadas; suporta G6+ internamente sem alterar apresentação inicial |
| 5 | Documentos | Upload, checklist e entregas do caso | Pendências pessoais, logs, biblioteca autorizada |
| 6 | Legado | Biblioteca de conteúdo e nível premium | Achados, relatórios, encontros e conteúdo autorizado |
| 7 | Conta | Perfil, plano, alertas e histórico | Papel familiar, escopo comercial sanitizado e histórico individual |

### Regra de contextos internos

`Entrega`, `Fase 01` e `Fase 02` são telas/estados contextuais acessados dentro de Jornada, Home, Legado ou por link de entrega. Não são removidos; também não se tornam abas principais adicionais.

---

## 4. Desk Intelligence — sete telas obrigatórias

| Nº | Tela | Finalidade aprovada | Dados/fontes |
|---:|---|---|---|
| 1 | Visão Geral | KPIs, funil de leads e alertas pendentes | Cases, leads, conversões, alertas, financeiro referenciado |
| 2 | Casos 360 | Carteira de clientes e saúde do caso | Cases, timeline, família, trilha, próxima ação, saúde |
| 3 | Checklist | Tarefas por prioridade | Próximas ações, tarefas, SLA, plano de ação |
| 4 | Validação Jurídica | Elegibilidade e parecer jurídico interno | Trilhas, marcos, matriz jurídica, revisão humana |
| 5 | Radar Interno | Matriz de prioridade e radares individuais | Casos, saúde, urgência, aderência interna e gates |
| 6 | Alertas | Gestão de achados e notificações | Achados, documentos, touchpoints, comunicação em fila |
| 7 | Biblioteca Mestre | Produção e curadoria por caso | Dossiês, registros, narrativas, peças, fontes e modelos |

### Módulos contextuais, não novas telas principais

- Propostas.
- Go-live.
- Formalização.
- Checklist App Cliente.
- Financeiro.
- Integrações.

Eles são acessíveis por ações, cards, filtros, subrotas e painéis contextuais dentro das sete telas principais.

---

## 5. Regras de preservação

1. Não remover `Entrega`, Fase 01 ou Fase 02.
2. Não substituir Radar por uma única porcentagem de origem.
3. Não esconder Documentos dentro de Entregas.
4. Não reduzir Legado a um arquivo morto.
5. Não reduzir Conta a dados cadastrais.
6. Não remover Receita, Conversão, Funil, Checklist, Jurídico, Radar, Alertas ou Biblioteca da gestão transversal do Desk.
7. Não criar uma aba para cada tabela técnica.
8. Um dado é armazenado uma vez e aparece em vários módulos por referência.
9. Fases e entregas são liberadas por escopo, case service, timing e touchpoint; não por simplificação visual.
10. Todos os dados internos devem continuar segregados do App Cliente.

---

## 6. Home do App

A Home deve preservar os elementos do mockup de auditoria, adaptados a dados reais:

1. Onde seu caso está.
2. Seu acompanhamento/nome comercial do serviço.
3. Hoje você está aqui — etapa visual.
4. Documento ou peça de trabalho em foco.
5. Radar resumido.
6. Entrega atual/última entrega aprovada.
7. Pendência principal.
8. Pessoas conectadas.
9. Achados recentes.
10. Fases da jornada.

A Home não mostra apenas uma porcentagem de origem. Os eixos do radar alimentam o resumo, preservando a tela Radar completa como destino próprio.

---

## 7. Jornada, Fases e Entrega

### Jornada

Preserva a ideia de duas linhas caminhando juntas:

- Linha ancestral/familiar.
- Linha do processo/jornada do cliente.

Inclui origem, cidadania, memória, continuidade e momentos de encontro, sempre em linguagem aprovada e sem determinismo cultural ou jurídico.

### Entrega

A tela de Entrega permanece como leitura/entrega atual, com:

- identificação do caso;
- país/trilha em linguagem aprovada;
- estado da etapa;
- leitura inicial ou entrega atual;
- próximos passos;
- PDF/WhatsApp apenas se aprovados;
- histórico de acompanhamento.

### Fase 01 e Fase 02

- `Fase 01` = Relatório/Diagnóstico inicial entregue ou em preparação conforme case service.
- `Fase 02` = Relatório completo de pesquisa/assessoria conforme escopo contratado.
- Não mostrar CTA de upsell de Fase 02 para Ana Luiza e João quando pesquisa completa já estiver contratada.
- Fase não contratada pode existir como “não prevista” ou “a definir”, sem oferta automática.

---

## 8. Radar Ancestral

O Radar aprovado possui seis eixos:

1. Origem.
2. Documentação.
3. Conexões familiares.
4. Elegibilidade.
5. Memória.
6. Legado.

A implementação deve usar completude de dados/evidências e estado de validação. Não pode indicar garantia de direito, cidadania, prazo ou conclusão jurídica.

Cada eixo abre uma explicação sanitizada e uma próxima etapa quando aplicável. O Desk mantém as fontes, riscos, score interno, regra jurídica e revisão humana.

---

## 9. Árvore, Documentos, Legado e Conta

### Árvore

- Apresentação inicial G1–G5.
- Dados suportam G6+ e gerações anteriores.
- Linha prioritária em destaque.
- Pessoas/relações com estado aprovado/sanitizado.
- Segundo quadrante: Linha do Tempo Familiar, Panorama Genealógico ou Radar Analítico; nunca reduzir a entrega a “o que ainda falta”.

### Documentos

Mantém Upload, Solicitados, Pendentes e Localizados do mockup, com organização aprimorada:

1. Organização em andamento e ação necessária no topo.
2. Solicitados/pessoais do participante.
3. Pendentes do processo.
4. Localizados e recebidos.
5. Em validação.
6. Biblioteca familiar autorizada.
7. Log de upload/data/status por pessoa.

### Legado

Mantém Biblioteca da Jornada:

- achados;
- pessoa relacionada;
- estágio da evidência em linguagem segura;
- Fase 01/Fase 02 aprovadas;
- encontros de linhagem;
- continuidade;
- relatórios e peças autorizadas.

### Conta

Mantém caso, produto/escopo, status da jornada, contrato, OS, pagamentos, despesas, próxima etapa e histórico, porém adaptados aos gates reais. Não expõe preço interno, SKU, contrato bruto ou dados de terceiros.

---

## 10. Gestão transversal do Desk

A Visão Geral deve exibir cards acionáveis para:

- casos ativos;
- alertas pendentes;
- receita do mês;
- taxa de conversão;
- funil de leads;
- alertas de achados;
- prioridades de hoje;
- checklist da semana;
- validação jurídica;
- radar interno;
- matriz de prioridade;
- radar individual;
- gestão de descobertas;
- Biblioteca Mestre.

Cada card abre uma lista filtrada ou ação contextual. “Sem dado” não é zero.

---

## 11. Matriz de conformidade obrigatória

Criar no Desk uma matriz interna:

- mockup_page
- mockup_element
- app_or_desk
- route_current
- source_entity
- gate_or_visibility
- status: preservado, adaptado, pendente, divergente, oculto_por_gate
- justification
- owner
- reviewed_at
- requires_human_approval

Nenhum módulo aprovado pode ser alterado sem atualizar essa matriz.

---

## 12. Prompt Lovable — Reconciliação sem redesign

```text
IMPLEMENTAR RECONCILIAÇÃO COM O MOCKUP APROVADO DE 17 TELAS.

FONTES:
- clube-ancestral-mockup.pdf = fonte primária de navegação.
- clube-ancestral-mockup-auditoria.pdf = fonte complementar de conteúdo, estados e fluxos.

REGRA MÁXIMA:
NÃO REDESENHAR, NÃO SIMPLIFICAR, NÃO REMOVER, NÃO RENOMEAR E NÃO CRIAR NAVEGAÇÃO PRINCIPAL FORA DAS 7 TELAS DO APP E 7 TELAS DO DESK.

NÃO CRIAR CONTRATOS, COBRANÇAS, LINKS ASAAS, PASTAS, PESQUISA EXTERNA, MENSAGENS, PUBLICAÇÕES OU INTEGRAÇÕES EXTERNAS.

A. APP CLIENTE — PRESERVAR 7 TELAS
1. Home
2. Jornada
3. Radar
4. Árvore
5. Documentos
6. Legado
7. Conta

Manter Entrega, Fase 01 e Fase 02 como telas/estados contextuais dentro da Jornada/Home/Legado, sem removê-las e sem transformá-las em abas principais extras.

HOME:
- Onde seu caso está;
- Seu acompanhamento;
- etapa visual;
- peça/documento em foco;
- radar resumido;
- entrega atual;
- pendência principal;
- pessoas conectadas;
- achados recentes;
- fases da jornada.

JORNADA:
- manter linha ancestral e linha do processo;
- origem, cidadania, memória, continuidade e momentos de encontro;
- fase e próximo passo conforme case_service, proposta, touchpoint e projeção aprovada.

RADAR:
- preservar seis eixos: Origem, Documentação, Conexões Familiares, Elegibilidade, Memória e Legado;
- percentual é completude de organização/evidência, nunca garantia jurídica;
- não mostrar score interno, risco, hipótese ou fonte crua.

ÁRVORE:
- apresentação G1–G5, com suporte a G6+;
- linha prioritária;
- panorama genealógico/linha do tempo familiar/radar analítico no segundo quadrante;
- relações aprovadas/sanitizadas.

DOCUMENTOS:
- manter solicitados, pendentes, localizados e upload;
- colocar organização em andamento/ação necessária no topo;
- documentos pessoais por participante;
- processo e biblioteca familiar separados;
- log individual de envio/status.

LEGADO:
- manter biblioteca da jornada, achados, estágio de evidência seguro, relatórios, encontros e continuidade.

CONTA:
- caso, produto/escopo em nome comercial, status, contrato/OS/pagamento/despesas sanitizados, papéis familiares, benefícios como Familiar Conectado e histórico individual.

B. DESK — PRESERVAR 7 TELAS
1. Visão Geral
2. Casos 360
3. Checklist
4. Validação Jurídica
5. Radar Interno
6. Alertas
7. Biblioteca Mestre

Propostas, Go-live, Formalização, Checklist AppCliente, Financeiro e Integrações são módulos contextuais/subrotas, acessíveis por cards e ações, sem virar novas telas principais.

VISÃO GERAL:
- casos ativos;
- alertas;
- receita do mês;
- conversão;
- funil;
- achados de hoje;
- prioridades;
- checklist semanal;
- validação jurídica;
- radar interno;
- matriz de prioridade;
- radar individual;
- gestão de descobertas;
- biblioteca mestre.

Cada card abre lista filtrada. Mostrar “Sem dado” em vez de zero quando não houver fonte.

C. MATRIZ DE CONFORMIDADE
Criar mockup_conformity_matrix com página, elemento, rota, entidade fonte, gate, estado, justificativa, responsável e data.

D. CASOS FAMILIARES
- João e esposa: jornada compartilhada, documentos individuais, João pagante sem acesso exclusivo.
- Ana, pai e irmã: jornada compartilhada aprovada, documentos pessoais individuais, Ana vê Felipe apenas conforme autorização.

E. TAXONOMIA
- Não mostrar SKU técnico em timeline/app.
- Produto, fase, entrega e touchpoint vêm de case_service/proposta/timeline/app_projection.
- Roteiro Master não é duplicado.
- Pacote WhatsApp não se confunde com alertas automáticos.
- Familiar Conectado não cria núcleo/dossiê automaticamente.

F. TESTES
- Todas 7 telas do App acessíveis.
- Todas 7 telas do Desk acessíveis.
- Entrega/Fase 01/Fase 02 preservadas contextualmente.
- Fase 02 sem upsell para pesquisa completa contratada.
- Documentos antes de Legado/Conta e com organização no topo.
- Financeiro/Formalização acessíveis por contexto/mobile.
- Nenhuma ação externa executada.

G. ENTREGA
Mostrar matriz mockup→rota→fonte→estado, divergências, módulos preservados, módulos contextuais e testes.
```

---

## 13. Atualização GitHub

Após implementação e validação, registrar este documento em:

```text
docs/governanca/CA-UX-01.1_decisoes_mockup_17_telas_e_prompt_reconciliacao_v1.1.md
```

Commit recomendado:

```text
docs(governanca): registra conformidade do mockup aprovado de 17 telas
```
