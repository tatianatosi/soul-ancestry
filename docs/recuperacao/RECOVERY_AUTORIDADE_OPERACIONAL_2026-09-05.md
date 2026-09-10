# Recovery: autoridade operacional no Desk e no App Cliente

- **Branch:** `recovery/operational-authority-all-areas-2026-09-05`
- **Base:** `main` (commit `0a0b81d`, 05/09/2026)
- **Estado:** PR draft — documento de escopo e contrato de execução
- **Responsável:** Tatiana Tosi (proprietária da plataforma)

## 1. Objetivo

Restabelecer o uso operacional normal do Clube Ancestral. A plataforma pertence à
proprietária, que tem autoridade para executar ações no próprio sistema, mas vem sendo
impedida de trabalhar por bloqueios acumulados: gates sem dono, permissões que negam
acesso a quem administra, telas que falham em silêncio e fluxos que exigem etapas
inexistentes.

Esta branch abre a frente de recuperação cobrindo **todas as abas do Desk** e **todas as
abas do App Cliente**, sem exceção.

## 2. Princípio de guardrails

Preservar apenas as salvaguardas que fazem sentido:

| Manter | Remover |
| --- | --- |
| Confirmação em ações irreversíveis (exclusão, cancelamento, encerramento de caso) | Gates genéricos que apenas travam navegação |
| Confirmação em envios ao cliente (proposta, contrato, mensagem, devolutiva, fatura) | Checagens de permissão que negam acesso ao papel de administração |
| Trilha de auditoria de quem fez o quê | Estados vazios silenciosos que escondem erro real |
| Validação de dados canônicos (CPF, CEP, UF, telefone, SKU) | Pré-requisitos de fase que não existem na operação real |

Regra de ouro: **nenhuma tela pode sumir em silêncio**. Ou mostra dado, ou mostra erro
explícito com causa e caminho de correção.

## 3. Escopo — Desk

Áreas de trabalho da equipe, agrupadas pelas seis abas do Desk simples aprovado.

### 3.1 Pesquisa
`pesquisa`, `pesquisa-modulo`, `pesquisa-evidencias`, `biblioteca-evidencias`,
`pessoas-linhagens`, `achados`, `fontes-genealogicas`, `evidencias`, `plano-acao`,
`escopo-origem`, `matriz-juridica`.

### 3.2 Comercial
`leads`, `propostas`, `conversao`, `crm-mestre`, `calls`, `catalogo`,
`homologacao-skus`, `conciliacao-catalogo`, `divergencias-catalogo`.

### 3.3 Marketing
`marketing`, `biblioteca-mensagens`, `biblioteca`, `etiquetas`, `studio-devolutivas`,
`devolutiva`.

### 3.4 Operação
`ops`, `ops-excecoes`, `ordens-servico`, `atendimento`, `onboarding`, `casos`,
`piloto`, `nucleos`.

### 3.5 Administração
`clientes`, `pessoas`, `contratos`, `contrato-parametros`, `financeiro`, `equipe`,
`acessos-portal`, `configuracoes`, `importacoes`, `integracoes`, `privacidade`.

### 3.6 Governança e métricas
`painel`, `metricas`, `auditoria`, `governanca.*`, `historico.*`.

## 4. Escopo — App Cliente (`/portal`)

`index`, `jornada`, `casos`, `fase-01`, `fase-02`, `entregas`, `documentos`, `arvore`,
`radar`, `legado`, `proposta`, `faturas`, `mensagens`, `conta`.

Mais os espelhos internos usados pela equipe: `app-cliente-demo` e
`app-cliente-como-pessoa`.

## 5. Critérios de aceite

Para cada aba listada nas seções 3 e 4:

1. **Abre** para o papel de administração, sem bloqueio de permissão.
2. **Lê dado real** da base — nada de mock silencioso.
3. **Escreve e persiste** — a ação principal da tela salva e sobrevive a recarga.
4. **Falha visível** — erro de carga aparece na tela com mensagem acionável.
5. **Confirmação apenas onde importa** — irreversível ou voltado ao cliente.
6. **Auditado** — a ação registra autor, data e objeto afetado.

## 6. Método de execução

Esta PR draft é o contrato de escopo. A implementação entra em commits sucessivos nesta
mesma branch, uma área por vez, na ordem: Administração → Comercial → Operação →
Pesquisa → Marketing → App Cliente. Cada commit fecha um bloco de abas contra os seis
critérios da seção 5 e atualiza a tabela de progresso abaixo.

## 7. Progresso

| Bloco | Abas | Estado |
| --- | --- | --- |
| Escopo e guardrails | — | Definido |
| Administração | 11 | Pendente |
| Comercial | 9 | Pendente |
| Operação | 8 | Pendente |
| Pesquisa | 11 | Pendente |
| Marketing | 6 | Pendente |
| Governança e métricas | 5+ | Pendente |
| App Cliente | 14 | Pendente |
