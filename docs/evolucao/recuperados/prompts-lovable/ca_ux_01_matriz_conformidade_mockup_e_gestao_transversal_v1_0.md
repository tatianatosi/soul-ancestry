# CA-UX-01 — Matriz de Conformidade do Mockup Aprovado e Gestão Transversal

**Versão:** 1.0  
**Data:** 20 de agosto de 2026  
**Status:** decisão canônica de preservação visual e funcional  
**Escopo:** App Cliente, Desk Intelligence, mockup aprovado de 17 páginas, protótipo navegável, módulos transversais e critérios contra fragmentação de abas.

---

## 1. Decisão máxima

O mockup aprovado de 17 páginas e o protótipo navegável são o contrato visual e funcional do Clube Ancestral.

Nenhuma implementação futura pode redesenhar, simplificar, ocultar, renomear, deslocar ou remover módulos aprovados sem uma matriz explícita:

```text
Mockup → Rota → Entidade fonte → Gate/visibilidade → Estado → Aprovação humana
```

O Desk e o App devem adaptar dados, permissões, gates, parametrização e projeções à arquitetura aprovada. Não devem criar uma experiência nova baseada em simplificação.

---

## 2. Princípio de gestão transversal

O problema não é quantidade de capacidade; é fragmentação de navegação e duplicação de dados.

Regra:

```text
Um dado é armazenado uma vez.
Ele pode aparecer em mais de um módulo como referência, card, filtro, timeline ou projeção.
Nenhuma aba é criada apenas para espelhar uma tabela técnica.
```

Exemplos:

- Uma evidência aparece em Pesquisa, Caso, Árvore, Relatório e Entrega como o mesmo objeto.
- Um marco jurídico aparece na Biblioteca Base, Radar, Caso e Validação Jurídica como o mesmo objeto.
- Uma proposta aparece em Comercial, Timeline, Formalização e caso como o mesmo objeto.
- Uma próxima ação aparece em Caso, Cockpit e jornada como o mesmo objeto.

---

## 3. Navegação canônica

### 3.1 Desk Intelligence

| Módulo principal | Finalidade | Elementos transversais expostos |
|---|---|---|
| Visão Geral | Gestão transversal diária e executiva | KPIs, casos, alertas, receita, conversão, funil, descobertas, prioridades, checklist semanal, radar, marcos jurídicos |
| Casos 360 | Contexto e operação de cada caso | Timeline, família, trilha, escopo, formalização, onboarding, documentos, interações, entregas |
| Comercial | Aquisição, Discovery e propostas | Leads, calls, Brief, propostas, aceite, follow-up, Placego |
| Pesquisa e Evidências | Pesquisa, ficha genealógica e prova | Pessoas, linhagens, árvore, fontes, documentos, evidências, achados, relatórios, plano de ação |
| Financeiro e Formalização | Condições comerciais, contratos, gates e despesas | Produto, preço, Blueprint, proposta Canva, despesas, contratos, pagamentos referenciados, matriz jurídica |
| Jornada do Cliente | Projeção, entrega e relacionamento | Onboarding, entregas, touchpoints, app, Meta Agent, comunicações em rascunho |
| Biblioteca Base | Regras reutilizáveis e curadoria | Dicionários, glossário, fontes, trilhas, marcos jurídicos, modelos, templates e linguagem |
| Administração | Configuração, controle e higiene | Usuários, RLS, logs, legado, dados fictícios, integrações futuras |

### 3.2 App Cliente

| Área aprovada | Finalidade | Fonte de dados |
|---|---|---|
| Home | Próximos passos, achados, pendências, última entrega e resumo de jornada | Timeline, documentos, app projections, entregas |
| Jornada | Timeline dupla e fases contratadas | `case_timeline_events`, `case_service`, propostas, touchpoints |
| Radar Ancestral | Seis dimensões de completude | Projeções aprovadas de dados estruturados |
| Árvore Familiar | Linhagem e gerações aprovadas | Pessoas, relações, eventos e projeções |
| Documentos | Checklist, uploads/log, validações e biblioteca aprovada | Document requests, evidências, permissões |
| Legado | Achados, relatórios, encontros e memória | Entregas/projeções aprovadas |
| Minha Conta | Vínculo, início, plano/escopo, papéis e histórico individual | Conta, família, case service e timeline |

---

## 4. App Cliente — elementos obrigatórios

### 4.1 Home

A Home não pode apresentar somente uma porcentagem de origem. Deve mostrar, nesta ordem:

1. Seu momento atual.
2. Próximos passos.
3. Achados recentes aprovados.
4. Radar resumido.
5. Linha do tempo resumida desde primeiro contato.
6. Documentos que precisam de você.
7. Última entrega aprovada.

### 4.2 Jornada

A Jornada mantém timeline dupla:

- Operacional: contato, Discovery, proposta, aceite, contrato, pagamento, onboarding, relatórios, entregas, protocolo e continuidade.
- Familiar/genealógica: eventos históricos aprovados, origem, migrações, documentos e achados.

Fases devem acompanhar escopo e proposta aprovada. Fase 1/Fase 2 não são removidas; aparecem somente quando contratadas, liberadas pelo timing e habilitadas pelos touchpoints aplicáveis.

### 4.3 Radar Ancestral

Dimensões aprovadas:

1. Origem.
2. Documentação.
3. Conexões familiares.
4. Elegibilidade.
5. Memória.
6. Legado.

Percentuais representam completude de organização, evidência e preparação; não garantem direito, reconhecimento, prazo ou resultado jurídico.

### 4.4 Árvore Familiar

- Deve aceitar G5, G6 e gerações anteriores.
- É contextual por participante e escopo familiar.
- O segundo quadrante não deve ser “o que falta”; usar **Panorama Genealógico**, **Linha do Tempo Familiar** ou **Radar Analítico Genealógico**.
- Só mostra relações/fatos aprovados e sanitizados.

### 4.5 Documentos

Ordem obrigatória:

1. Ação necessária agora.
2. Organização em andamento.
3. Enviados por você.
4. Em validação.
5. Biblioteca familiar aprovada.

Documentos pessoais e acervo ancestral permanecem separados. Cada usuário vê seus documentos e pendências; conteúdo compartilhado obedece a permissão e contrato/anexos.

### 4.6 Legado

Deve incluir achados detalhados, push para detalhes, relatórios aprovados, encontros de linhagem, timeline familiar, biblioteca histórica e conteúdo condicionado ao contrato/anexo.

### 4.7 Minha Conta

Deve incluir data de entrada, papel no núcleo, plano/escopo em nome comercial, benefícios aplicáveis, histórico individual e permissões. Não exibe SKU técnico, preço interno, contrato bruto ou dados de terceiros.

---

## 5. Desk — visão geral aprovada

A Visão Geral do Desk deve conter blocos acionáveis, não apenas números:

- Casos ativos.
- Alertas.
- Receita do mês.
- Taxa de conversão.
- Funil de leads.
- Achados de hoje.
- Prioridades de hoje.
- Checklist da semana.
- Validação jurídica.
- Radar interno.
- Matriz de prioridade geral.
- Radar individual por caso.
- Gestão de descobertas.
- Biblioteca Mestre/curadoria por cliente.

Cada bloco deve abrir uma lista filtrada e permitir chegar à entidade original. “Sem dado” é diferente de zero e deve ser exibido como tal.

---

## 6. Acessos familiares

| Cenário | Regra de acesso |
|---|---|
| Individual | Jornada, documentos, árvore e entregas pessoais autorizadas |
| Casal | Jornada compartilhada; documentos e pendências individuais |
| Casal com filhos | Responsável legal vê dados autorizados de menores |
| Ana + pai + irmã | Jornada compartilhada aprovada; checklists/documentos individuais; Ana vê Felipe se autorizada |
| João + esposa | João pode ser pagante; ambos veem jornada compartilhada; documentos individuais |

Pagante é papel financeiro; não é papel de exclusividade de acesso.

---

## 7. Taxonomia, proposta e Blueprint

- Timeline e App nunca mostram SKU técnico.
- Usar nome comercial, etapa, entrega ou escopo aprovado.
- Roteiro Master alimenta Discovery e Brief, não é duplicado em proposta/contrato.
- Blueprint recebe parâmetros aprovados: produto-pai, trilha, família, escopo, fases, entregas, critérios, preço/condição homologados, despesas e versão.
- Proposta Canva é camada visual; log de proposta fica no Desk/timeline.
- WhatsApp como produto é complemento contextual; não se confunde com alertas operacionais ou envio automático.
- Familiar Conectado é benefício/escopo contextual; não cria núcleo ou dossiê automaticamente.

---

## 8. Matriz inicial de conformidade

| Mockup/elemento | Destino | Entidade fonte | Estado inicial |
|---|---|---|---|
| Home — próximos passos | App Home | Próxima ação/timeline | Adaptar e validar |
| Home — achados recentes | App Home | Achados/projeções | Pendente de Biblioteca de Evidências |
| Jornada — timeline dupla | App Jornada | Timeline operacional + eventos genealógicos | Adaptar e validar |
| Radar Ancestral seis eixos | App Radar | Projeções estruturadas | Pendente |
| Árvore Familiar | App Árvore | Ficha Piloto/relações/evidências | Pendente |
| Documentos consolidado | App Documentos | Document requests/evidências | Adaptar e validar |
| Legado | App Legado | Relatórios/achados/projeções | Pendente |
| Minha Conta | App Conta | Conta/família/case service/timeline | Adaptar e validar |
| Casos ativos | Desk Visão Geral | Cases | Preservar |
| Receita/taxa/funil | Desk Visão Geral | Financeiro/conversion events | Adaptar sem inventar dados |
| Achados/prioridades | Desk Visão Geral | Findings/tasks/alerts | Pendente de pesquisa estruturada |
| Validação jurídica | Desk Visão Geral | Matriz jurídica/marcos | Preservar/adaptar |
| Radar interno | Desk Visão Geral/Caso | Dados estruturados | Pendente de radar |
| Biblioteca Mestre | Desk Biblioteca | Curadoria/dicionários/fontes | Pendente |

---

## 9. Proibições

- Não redesenhar o mockup sem matriz de conformidade e aprovação humana.
- Não eliminar fases, radar, biblioteca, financeiro, jurídico ou gestão transversal por simplificação.
- Não criar uma aba por tabela técnica.
- Não mostrar dado interno, fonte, hipótese, risco, score, SKU ou preço técnico ao cliente.
- Não publicar automaticamente conteúdo, documento, árvore, achado, relatório ou encontro de linhagem.

---

## 10. Critérios de aceite

1. Cada página do mockup tem rota, fonte, estado e responsável na matriz.
2. App Cliente preserva Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
3. Desk preserva visão transversal de gestão.
4. Dados são únicos e referências aparecem em múltiplos módulos sem duplicação.
5. Fase 1/Fase 2 dependem de escopo, timing e touchpoints, não de ocultação simplista.
6. Mobile permite acesso a todos os módulos.
7. Nenhuma mudança estrutural ocorre sem versionamento e aprovação.
