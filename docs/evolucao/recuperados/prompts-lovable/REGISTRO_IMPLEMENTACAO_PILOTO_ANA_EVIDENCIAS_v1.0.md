# Registro de implementação — piloto Ana e evidências operacionais

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Estado real do piloto materializado; nenhuma ação externa executada  
**Base do registro:** atualização de implementação reportada em 20/08/2026

---

## 1. Decisão e contexto

A estrutura de produto e a arquitetura necessária já estavam implementadas. O trabalho concluído neste marco materializa o **estado real do piloto** para o caso `CA-CID-AT-FAM-2026-001`, sem criar efeitos externos.

Este registro substitui a hipótese de que catálogo, blueprint, linha do tempo, fila de Drive e cenários de teste ainda precisariam ser construídos como escopo inicial. A partir desta versão, o próximo trabalho deve ser orientado por validação e desbloqueio do piloto, não por reconstrução estrutural.

---

## 2. Implementação materializada

### A. Catálogo de produtos

- Foram registrados **33 itens** em `product_catalog`.
- Cada item contém homologação, elegibilidade e regra de uso.
- Estão presentes, entre outros: `CA-WPP-001`, `CA-WPP-002`, `CA-FAM-001`, `CA-FAM-002`, `CA-CID-025` e `CA-ASS-001` a `CA-ASS-005`.
- Produtos contextuais exigem `case_service` e justificativa de escopo.
- Assinaturas de continuidade estão com status `em_revisao`; portanto, não entram em proposta.
- Nenhum item possui `gera_comunicacao_automatica` habilitado.

**Implicação operacional:** proposta e formalização devem consultar a origem canônica de preço e elegibilidade no catálogo, respeitando as restrições acima.

### B. Blueprint paramétrico

- O blueprint contém **33 colunas**, incluindo todas as colunas requeridas no pedido de implementação.
- Foi criado um blueprint para o caso `CA-CID-AT-FAM-2026-001`.
- O blueprint está vinculado a `case_service`, trilha, núcleo e proposta.
- `origem_preco = product_catalog`.
- `status_preparacao = em_preparacao`.
- Despesas de terceiros foram previstas fora do preço canônico.
- O blueprint não duplica o Roteiro Master.

**Implicação operacional:** este é o artefato de preparação comercial/operacional do piloto; não deve ser substituído por texto livre, duplicação de escopo ou uma segunda fonte de preço.

### C. Linha do tempo operacional

Foram registrados **9 marcos**, todos com visibilidade interna:

1. Discovery
2. Proposta
3. Aceite verbal
4. Confirmação formal
5. Conferência Canva
6. Case service
7. Formalização
8. Contrato
9. Onboarding

Cada marco contém responsável `Tatiana Tosi` e próxima ação. Há dois bloqueios registrados:

- Completude Canva.
- `NO_GO`.

A linha do tempo é a visão padrão da **Visão Geral** da ficha do caso.

**Implicação operacional:** o estado de avanço do caso deve ser lido a partir desses marcos, ações e bloqueios, e não inferido de elementos exclusivamente visuais.

### D. Fila Drive

- Existe um item na fila de Drive com status `blocked`.
- Disparo previsto: `confirmacao_formal`.
- A estrutura solicitada foi registrada.
- Gates exigidos: contrato assinado, pagamento confirmado e onboarding aprovado.
- `approval_required = true`.

**Implicação operacional:** nenhuma criação de pasta ou documento externo deve ocorrer enquanto os gates não forem satisfeitos e a aprovação necessária não for concedida.

### E. Testes

- Os **9 cenários** previstos passam.
- Há **10 cenários no arquivo** de testes.

**Observação:** antes do go-live, registrar nominalmente o décimo cenário e sua finalidade para eliminar ambiguidade entre a suíte declarada e a suíte armazenada.

---

## 3. Confirmação de ausência de ações externas

Até este marco, **nenhuma ação externa foi executada**. Não foram criados, enviados ou disparados:

- Pastas ou arquivos no Drive.
- Propostas no Canva.
- Contratos ou pedidos de assinatura.
- Cobranças ou links de pagamento.
- Grupos de comunicação.
- Mensagens automáticas ou manuais.

O estado atual é de preparação interna, dados materializados, bloqueios explícitos e validação de cenários.

---

## 4. Estado do piloto

| Dimensão | Estado atual | Regra de avanço |
|---|---|---|
| Catálogo e elegibilidade | Materializado | Usar exclusivamente itens homologados e elegíveis |
| Blueprint | Em preparação | Preservar preço originado no catálogo e escopo não duplicado |
| Proposta | Prévia/condicionada | Não avançar sem resolver completude Canva |
| Formalização | Preparada, não concluída | Requer confirmação formal e tratamento do bloqueio `NO_GO` |
| Contrato | Não executado externamente | Só gerar/enviar após autorização e dados finais aprovados |
| Drive | Bloqueado | Requer contrato assinado, pagamento confirmado, onboarding aprovado e aprovação explícita |
| Onboarding | Registrado na timeline | Só avançar após os gates anteriores |
| Comunicação | Não automatizada | Nenhum produto dispara comunicação automática |

---

## 5. Próximos checks mínimos

A ordem seguinte deve ser estritamente orientada pelos bloqueios existentes:

1. Conferir e concluir a completude Canva associada à proposta do caso, sem executar envio ou criação externa.
2. Revisar o motivo e a condição de liberação do bloqueio `NO_GO`; registrar decisão explícita de `GO` ou manutenção do bloqueio.
3. Conferir os dados contratuais contra blueprint, `case_service`, núcleo, trilha, produto e preço canônico.
4. Definir a versão contratual final e validar que o contrato está pronto para assinatura, sem enviar para assinatura ainda.
5. Validar os gates da fila Drive e manter o item `blocked` até haver autorização explícita e todos os pré-requisitos satisfeitos.
6. Executar smoke test do caso no Desk e no App Cliente, incluindo isolamento de dados, visibilidade, documentos e responsividade.
7. Registrar a identificação e o resultado do décimo cenário de teste.
8. Quando contrato estiver pronto para assinatura e o piloto estiver estável, iniciar a migração prioritária para Claude Code + GitHub + Supabase + Vercel conforme o plano de migração vigente.

---

## 6. Limites de alteração no Lovable

Neste estágio, Lovable não deve ser usado para reconstruir catálogo, blueprint, timeline, fila Drive ou testes. Só se justifica uso para correção visual ou de fluxo que bloqueie diretamente a execução do piloto, com tarefa fechada, critério de aceite e sem alterações globais de dados ou regras.

Qualquer ajuste envolvendo persistência, preço, elegibilidade, `case_service`, permissões, RLS, gates, fila, automação, integração ou isolamento entre casos deve ser implementado e revisado em código versionado.

---

## 7. Histórico de decisão

| Data | Decisão | Evidência/razão | Consequência |
|---|---|---|---|
| 20/08/2026 | Reconhecer estrutura como já implementada | Catálogo, blueprint, timeline, fila Drive e testes foram materializados no piloto | Não orçar reconstrução dessas estruturas |
| 20/08/2026 | Manter nenhuma ação externa sem autorização | Fila Drive está `blocked`, `approval_required = true`, com gates pendentes | Não criar/enviar pastas, documentos, cobranças, contratos ou mensagens |
| 20/08/2026 | Priorizar desbloqueio do piloto antes de migração | Bloqueios concretos: completude Canva e `NO_GO` | Último check foca contrato pronto e fluxo estável |
| 20/08/2026 | Migrar implementação técnica após estabilidade | Alto custo e risco de alterações repetidas no Lovable | Claude Code + GitHub + Supabase + Vercel tornam-se trilha principal |
