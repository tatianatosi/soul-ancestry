# Roadmap de Prompts e Prioridades Finais — Clube Ancestral

**Data:** 30 de agosto de 2026  
**Projeto:** `tatianatosi/soul-ancestry`  
**Janela de revisão:** resultados esperados para avaliação às 19h.  
**Objetivo:** ordenar os prompts já recuperados, os prompts ainda necessários e as entregas por prioridade real, evitando novas auditorias circulares, remodelagens prematuras e criação de escopo paralelo.

---

## Regra de condução

Não iniciar mais de uma frente estrutural por vez.

Cada PR deve responder a um resultado operacional verificável no preview e no Supabase:

```text
ação real
→ gravação confirmada
→ releitura do banco
→ refresh completo
→ consequência operacional visível
```

Não aceitar como resultado:

- CI verde isoladamente;
- tela renderizada;
- toast;
- função existente;
- lista ou biblioteca estática;
- indicador sem ação;
- teste mockado;
- relato de que “já está implementado”.

---

## Biblioteca de prompts existentes

Os documentos já criados devem ser usados como fonte de escopo. Não recriar versões concorrentes.

| Ordem | Artefato | Finalidade | Quando usar |
|---:|---|---|---|
| 1 | `P0_Autoridade_Operacional_Persistencia_e_Proxima_Acao.md` | Autoridade da proprietária, persistência, Caso 360 e consequência pós-save. | Base permanente de qualquer correção de CRUD/fluxo interno. |
| 2 | `Prompt_Implantacao_Politica_Unificada_Casos_Familiares.md` | Caso canônico, núcleo, participantes, app, comunicação, onboarding e migração segura. | Antes de unificação de núcleos/casos e mudanças de modelo. |
| 3 | `Ana_Operavel_Contrato_Jornada_e_Proxima_Acao.md` | Tornar Ana operável: contrato, OS, onboarding, tarefas e próxima ação. | Prioridade imediata, antes de layout amplo. |
| 4 | `Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md` | Desk com indicadores acionáveis, cadências, Pessoa 360 e atualização de App Cliente. | Após Ana operar e onboarding real funcionar. |
| 5 | `Desk_Simples_Arquitetura_Visual_e_Operacional.md` | De–para do Desk simplificado por grupos. | Base de navegação depois da estabilidade operacional. |
| 6 | `Prompt_Revisao_Layout_e_Marca_Clube_Ancestral.md` | Marca oficial, Desk simples, mobile-first e separação de superfícies. | Apenas depois de P0, P1 e P2. |
| 7 | `Pente_Fino_Implantacao_e_Pendencias_Clube_Ancestral_2026-08-30.md` | Inventário de implantação, lacunas e riscos atuais. | Documento de controle para a revisão de 19h. |

---

## Prioridade 0 — Ana operável

**Meta:** terminar um ciclo real de atendimento no mesmo `case_id` canônico da Ana, sem criar cadastro paralelo e sem deixar trabalho sem consequência.

### Resultado de negócio

```text
Ana Luiza
→ Caso 360 operacional
→ contrato em rascunho preenchível
→ persistência após refresh
→ OS vinculada
→ onboarding real
→ tarefa/próxima ação
→ Painel Hoje
→ atualização preparada para App Cliente
```

### Prompt a usar

Usar como fonte principal:

```text
Ana_Operavel_Contrato_Jornada_e_Proxima_Acao.md
P0_Autoridade_Operacional_Persistencia_e_Proxima_Acao.md
```

### Entregas P0

| Item | Resultado obrigatório | Evidência necessária |
|---|---|---|
| P0.1 | Abrir Caso 360 da Ana como ficha operacional. | URL/rota abre sem HTTP 400, sem gate como página principal. |
| P0.2 | Editar dados básicos de Ana/participantes e persistir. | Salvar → releitura → refresh → valor permanece. |
| P0.3 | Preencher contrato em rascunho. | Partes, escopo, cláusulas, anexos e observações persistem após refresh. |
| P0.4 | Criar/editar OS vinculada ao caso. | OS reaparece no mesmo caso após refresh. |
| P0.5 | Criar ou retomar onboarding real do mesmo `case_id`. | Não duplica onboarding; estado e início persistem. |
| P0.6 | Criar próxima ação e tarefas da jornada. | Tarefas vinculadas ao caso aparecem no Caso 360 e Painel Hoje. |
| P0.7 | Preparar atualização para App Cliente. | Registro de atualização ligado ao case_id, revisável/liberável; sem envio automático. |

### Não fazer em P0

- Não unificar núcleos/casos.
- Não iniciar CRM Vivo amplo.
- Não redesenhar menu global.
- Não refazer marca/layout geral.
- Não criar novo caso/cadastro para Ana.
- Não alterar RLS, sessão, permissões, auditoria ou integrações externas.

---

## Prioridade 1 — Persistência e continuidade transversal

**Meta:** aplicar o padrão de gravação verificada e consequência operacional aos domínios usados diariamente.

### Prompt-base

```text
P0_Autoridade_Operacional_Persistencia_e_Proxima_Acao.md
```

### Ordem de domínios

1. Cliente existente.
2. Caso e próxima ação.
3. Núcleo e participante.
4. Tarefas/Ops.
5. Pesquisa: achados, hipóteses, pendências e fontes.
6. Documentos e solicitações.
7. Proposta, contrato, cláusula, anexo e OS.
8. Micro-entregas e atualizações do cliente.
9. Onboarding e cadência.
10. Portal e acesso do cliente, somente onde houver fluxo real.

### Regras

```text
Dado salvo
→ confirmação de linha afetada
→ releitura independente
→ refresh
→ tarefa/próxima ação ou “sem nova ação necessária”
```

- Não criar tarefa duplicada.
- Tarefa deve usar mesmo `case_id`.
- Participante é obrigatório quando a ação for individual.
- Ação externa continua separada e confirmada apenas quando for real.

### Critério de saída

Cada domínio prioritário tem pelo menos um teste manual aceito no preview e no banco.

---

## Prioridade 2 — Motor de onboarding e cadência

**Meta:** substituir onboarding como checklist/gate por jornada operacional viva.

### Prompt-base

```text
Ana_Operavel_Contrato_Jornada_e_Proxima_Acao.md
Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md
```

### Resultado esperado

```text
Iniciar onboarding
→ localizar onboarding existente pelo case_id
→ criar somente se inexistente
→ definir responsável e fase
→ criar primeira micro-entrega
→ criar tarefas compartilhadas e individuais
→ definir próxima ação
→ gerar cadência D0/D3/D7/D10/D14
→ mostrar no Caso 360 e Painel Hoje
→ preparar atualização de App Cliente
```

### Cadência mínima

| Marco | Resultado operacional |
|---|---|
| D0 | Caso assumido, contato principal, responsável e primeira próxima ação. |
| D1–D3 | Tarefas de coleta/organização de dados e documentos. |
| D4–D7 | Primeira leitura ou micro-entrega. |
| D8–D10 | Follow-up de pendências sem resposta. |
| D11–D14 | Escalonamento, reprogramação ou decisão humana. |
| A cada achado | Evidência/achado → tarefa ou micro-entrega → atualização preparada para App Cliente. |

### Exemplo de aceite

```text
Pedido de dados de João atrasado
→ Ana Luiza definida como responsável familiar por revisar
→ tarefa interna vinculada ao case_id
→ prazo e responsável definidos
→ atualização clara preparada no App Cliente
→ sem envio externo automático
```

---

## Prioridade 3 — Fonte única de caso, núcleo e participantes

**Meta:** resolver modelos concorrentes sem apagar dados e sem criar registros para contornar inconsistência.

### Prompt-base

```text
Prompt_Implantacao_Politica_Unificada_Casos_Familiares.md
```

### Ordem obrigatória

```text
Detecção
→ comparação
→ matriz de reconciliação
→ decisão humana da proprietária
→ reapontamento controlado
→ aliases/histórico preservados
→ refresh e validação
```

### Escopo

- Mapear `nucleo_membros`, `case_members`, `case_dependents`, pessoas e participantes.
- Definir fonte canônica por tela e por tipo de vínculo.
- Verificar Caso 360, Pessoa 360, proposta, contrato, OS, tarefas, pesquisa, documentos, onboarding, app e portal usando o mesmo `case_id`.
- Tratar PR #30 apenas como detecção; não executar merge automático.

### Proibido

- Não criar outro caso/núcleo para Ana.
- Não fazer `DELETE`, `TRUNCATE`, reset ou merge cego.
- Não arquivar origem antes de matriz e aprovação.

---

## Prioridade 4 — Cockpit do Desk e indicadores acionáveis

**Meta:** remover empilhamento de listas e fazer cada indicador levar a uma ação.

### Prompt-base

```text
Prompt_Cockpit_Desk_Indicadores_Cadencias_e_Acoes.md
Desk_Simples_Arquitetura_Visual_e_Operacional.md
```

### Começar por

1. **Hoje**: decisões prioritárias, cadências atrasadas, pessoas acompanhadas, atualizações de app prontas.
2. **Caso 360 — Visão geral**: situação atual, próxima ação, responsável, prazo, motivo, impacto e quatro indicadores-chave.
3. **Pessoa 360 rápida** no Hoje.
4. Depois expandir o padrão a Comercial, Pessoas & Famílias, Pesquisa, Marketing e Configuração.

### Regra visual

```text
Indicador
→ pessoa/caso
→ motivo
→ impacto restrito
→ ação disponível
→ tarefa/próxima ação
→ atualização de App Cliente quando aplicável
```

### Não fazer

- Não fazer dashboard de números falsos.
- Não colocar bibliotecas, listas ou gates no topo sem status, responsável, vínculo e ação.
- Não mostrar NO_GO/GO_CONDICIONAL como estrutura principal.

---

## Prioridade 5 — Fechamento de lacunas de CRUD

**Meta:** completar superfícies que têm dados/motores, mas não possuem interface operacional suficiente.

| Lacuna | Próximo resultado esperado |
|---|---|
| Clientes | Editar dados básicos existentes, salvar e confirmar após refresh. |
| Biblioteca de Mensagens | Criar e editar conteúdo de template, não apenas alterar status. |
| Fontes Genealógicas | Homologar edição real e ligar próxima ação/tarefa quando necessário. |
| Partes de contrato | Editar partes existentes no mobile, não apenas listar/arquivar. |
| Documentos | Upload real de arquivo quando o desenho e Storage forem definidos; não confundir metadado com upload. |
| Portal de revisão | Expor fluxo real de convite `proposal_portal` quando houver contato autorizado; não criar botão morto de envio. |
| Piloto Real | Substituir lista estática de bloqueios por estado real e ação vinculada; manter técnico recolhido. |

---

## Prioridade 6 — Revisão visual e marca

**Meta:** aplicar o Desk simples e a marca oficial sem quebrar motores funcionais.

### Prompt-base

```text
Prompt_Revisao_Layout_e_Marca_Clube_Ancestral.md
Desk_Simples_Arquitetura_Visual_e_Operacional.md
```

### Só iniciar quando

- Ana estiver operável ponta a ponta.
- Contrato/OS/onboarding/tarefas persistirem após refresh.
- Fonte canônica de participantes estiver decidida por tela.
- Indicadores do Hoje/Caso 360 tiverem ação real.

### Ordem visual

1. Menu Desk simples.
2. Hoje e Pessoa 360 rápida.
3. Caso 360.
4. Mobile de Pessoa, Contrato, tarefas e OS.
5. Pesquisa e suas bibliotecas/fonte/base como elementos acionáveis.
6. Marketing.
7. Configuração/Dados técnicos.
8. App Cliente em PR separada.

---

## Prioridade 7 — Integrações externas e crescimento

**Meta:** integrar somente depois de o fluxo interno ser confiável.

### Frentes futuras

- Upload real em Storage.
- Portal de proposta/revisão e convites reais.
- E-mail/WhatsApp com confirmação explícita por envio.
- Asaas: reconciliação de SKU, preço, link, cobrança e pagamento.
- Bases/API genealógicas no backend.
- Marketing: campanhas, formulários, segmentos, cadências e métricas reais.
- Oferta contextual por micro-entrega.

### Regra

```text
Integração invisível.
Evidência visível.
```

O cliente recebe atualização clara, próximo passo, documento/entrega liberada e progresso. Não recebe token, lógica interna, gate técnico ou mecanismo cru de integração.

---

## Roteiro de revisão às 19h

Ao revisar os resultados, usar esta lista exata.

### A. PRs e preview

- Qual PR foi atualizada?
- Qual é a base dela?
- É draft ou pronta para revisão?
- O preview aponta ao Supabase próprio?
- Houve alteração de schema/migration?
- O escopo respeitou a prioridade atual?

### B. Ana Luiza

- Caso 360 abre diretamente?
- O contrato abre sem erro HTTP 400?
- Parte, escopo, cláusula e anexo salvam em rascunho?
- OS pode ser criada/editada?
- O dado reaparece depois de refresh?
- O onboarding real existe ou é somente uma tela/checklist?
- Há próxima ação clara?
- Há tarefa vinculada ao case_id?
- A tarefa aparece no Painel Hoje?

### C. Persistência

- Há confirmação de linha afetada?
- Há releitura independente?
- Há comparação pós-save?
- A UI mostra erro real se falhar?
- Há algum “sucesso” sem linha gravada?

### D. Continuidade

- A alteração gera tarefa, atualiza próxima ação ou permite “sem ação necessária”?
- A tarefa evita duplicidade?
- A tarefa tem responsável, prioridade e caso?
- A atualização de App Cliente é preparada, revisável e não enviada automaticamente?

### E. Não-regressão

- Não foi criado novo caso/núcleo/cliente para Ana?
- Não foram alterados RLS, sessão, permissões ou auditoria?
- Não houve `DELETE`, reset ou migration destrutiva?
- Gates técnicos continuam fora da superfície principal?
- Não foram introduzidos mocks, números falsos ou listas estáticas como estado real?

---

## Decisão de merge

Nenhuma PR deve ser mesclada antes de cumprir o respectivo conjunto de aceite:

| PR/linha | Aceite mínimo |
|---|---|
| #29 | Navegação de piloto/caso, fontes, núcleo e demais fluxos tocados testados por domínio; não apenas build. |
| #31 | Escritas prioritárias testadas com salvar → refresh → releitura real. |
| #32 | Perfil de pessoa salva, confirma, cria tarefa/sem ação necessária, tarefa aparece em Ops/Painel Hoje e persiste após refresh. |
| #30 | Apenas detecção comprovada; nenhuma unificação executada. |
| #28 | Contrato rascunho e mobile testados, sem regressão e sem depender de botão desabilitado. |

Se os resultados de 19h forem parcialmente positivos, não abrir mais uma frente. Corrigir a primeira falha que impedir Ana de completar:

```text
contrato
→ onboarding
→ tarefa/próxima ação
→ Painel Hoje
→ refresh
```

---

## Regra final

> A próxima prioridade não é a próxima tela. É o próximo resultado operacional que permite à proprietária conduzir um caso real com segurança, continuidade e memória do trabalho realizado.

```text
Primeiro: Ana operável.
Depois: persistência transversal.
Depois: onboarding e cadência.
Depois: unificação controlada.
Depois: cockpit e indicadores.
Depois: layout e marca.
Depois: integrações e escala.
```
