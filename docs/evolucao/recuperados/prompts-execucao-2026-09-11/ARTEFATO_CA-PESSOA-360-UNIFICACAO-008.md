# ARTEFATO DE EXECUÇÃO — CA-PESSOA-360-UNIFICACAO-008

**Data:** 05/09/2026  
**Projeto:** Clube Ancestral / `tatianatosi/soul-ancestry`  
**Missão:** converter os diagnósticos repetidos de Pessoa 360, Pessoa Canônica, motores unificados e perfil fragmentado em implementação operacional verificável.

## 1. Situação confirmada

O relatório mais recente confirma que cinco PRs já mescladas — #41, #43, #45, #46 e #49 — entraram no `main` sobretudo como documentação, diagnóstico ou proposta. Elas próprias registram que os itens operacionais principais ficaram sem execução.

| PR | Conteúdo efetivamente mesclado | Pendência reconhecida no próprio material |
|---|---|---|
| #41 | Diagnóstico de contratos e propostas | Resync contrato; referência de proposta ainda duplicada em Caso 360 e Leads |
| #43 | Checklist institucional e auditoria | Auditoria/prompts da Ana pausados; enumeração de verificação parcial |
| #45 | Diagnóstico de criação de registros | Escritas de `case_dependents`, `legal_clause_matrix` e `proposal_canva_pages` sem reconferência pós-gravação |
| #46 | Proposta de redesenho unificado | Nenhuma implementação; mockup, inventário e aprovação ficaram pendentes |
| #49 | Motores unificadores, Pessoa Canônica e motor contratual | Pessoa Canônica/Motor Contratual P0 indefinidos; vínculo de proposta parcial; `scan_run`/`scan_item` não implementados |

O padrão é confirmado: documentação mesclada não equivale a execução de produto.

## 2. Ponto de partida técnico

A PR #85 corrigiu partes importantes: vínculo de pessoa em `case_members`, `nucleo_membros` e `contract_parties`; links de perfil em Núcleos; normalização de relações genealógicas; propagação de status de contrato/pagamento/ativação; e melhorias de acesso ao App Cliente. Essas correções não encerram a unificação de Pessoa 360.

A fragmentação continua atravessando CRM, leads, clientes, casos, membros, núcleos, proposta, contrato e pesquisa. O produto precisa de uma identidade civil/comercial canônica em `clientes`, referências por chave para os domínios especializados e uma tela Pessoa 360 que reúna referências sem duplicar dados.

## 3. Decisão de implementação

- `clientes.id` é a chave canônica de pessoa para as camadas civil e comercial.
- `leads`, `crm_casos`, `case_members`, `nucleo_membros`, `contract_parties`, proposta e contrato devem vincular-se a essa chave quando a pessoa for conhecida.
- Pesquisa genealógica permanece em suas próprias tabelas e camadas; ela não será copiada para `clientes` nem exposta ao App Cliente sem projeção autorizada.
- A unificação é feita por FKs, adaptadores, links, conversão, backfill idempotente e leitura consolidada — não por exclusão, fusão destrutiva ou uma nova tabela paralela.
- Correspondência automática só é permitida quando inequívoca dentro da mesma organização. Ambiguidade fica para decisão manual do ADMIN.

## 4. Entregas obrigatórias

1. Conversão Lead → Cliente com vínculo persistente, histórico preservado e prevenção de duplicidade.
2. Pessoa 360 como centro de leitura e edição apenas dos dados canônicos, com seções Comercial, Casos/Contratos, Família/Núcleos, Pesquisa interna, Documentos/Consentimentos e Histórico.
3. Navegação para Pessoa 360 em Leads, Casos, Núcleos, Propostas, Contratos e demais superfícies relevantes.
4. CTAs de vincular/criar Pessoa Canônica com seleção explícita em casos ambíguos.
5. Proposta/Contrato ligados a pessoa/caso canônicos sem alterar snapshots assinados.
6. Vínculo seguro entre pessoa canônica e pesquisa interna, com projeção sanitizada para o App Cliente.
7. Backfill idempotente e relatório de correspondências, ambiguidades e ausências.
8. Teste ponta a ponta de homologação e isolamento entre Cliente A e Cliente B.

## 5. Limites preservados

A missão não enfraquece RLS, autenticação, consentimento, representação de menor, histórico, identificadores canônicos, exclusão física, contrato assinado, evidência de achado ou isolamento de pesquisa genealógica interna.

## 6. Critério de aceite

A entrega só é aceita quando, em ambiente de homologação:

- Um Lead é convertido em Cliente e permanece vinculado após reload.
- A Pessoa 360 mostra a origem comercial, casos, núcleo, proposta e contrato por referências reais.
- A mesma pessoa é localizada corretamente nas telas de Caso, Núcleo, Proposta e Contrato.
- Dados de domínio continuam editados na origem certa, sem cópia de formulários.
- Um perfil de pesquisa só aparece no Desk interno; no App Cliente, somente projeção autorizada aparece.
- Cliente A não vê nenhum dado de Cliente B.
- Qualquer pessoa ambígua exige escolha manual; nenhuma associação é feita por aproximação insegura.

## 7. Registro de saída

O executor deve criar `docs/relatorios/2026-09-05_pessoa_360_unificacao_execucao.md` no repositório, com matriz de domínio, vínculos, escritores, backfill, rotas, testes, pendências, migrações e reversão.

A conclusão deve separar rigorosamente: entregue no `main`, somente em PR/preview, teste técnico, teste visual, documentado apenas, pendente e proteção deliberadamente separada.
