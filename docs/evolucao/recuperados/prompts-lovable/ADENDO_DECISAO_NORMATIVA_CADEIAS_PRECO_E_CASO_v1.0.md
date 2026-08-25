# Adendo — decisão normativa: cadeias de preço e de caso

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Decisão normativa:** `CA-DEC-2026-08-20-02`  
**Local de consulta:** `/governanca/decisoes`  
**Status:** Registrada, visível e validada por testes

---

## 1. Decisão registrada

A decisão normativa `CA-DEC-2026-08-20-02` formaliza duas cadeias canônicas obrigatórias para o sistema:

1. Cadeia de preço.
2. Cadeia de evolução do caso.

Essas cadeias passam a ser a referência para implementação, validação, operação, propostas, formalização, blueprint e controles de governança. Nenhuma tela, automação, regra ou integração pode criar fonte paralela, pular etapas ou inferir estados fora da cadeia aplicável.

---

## 2. Cadeia canônica de preço

```text
Catálogo homologado
→ Condição
→ Case service
→ Exceção aprovada
→ Blueprint
→ Canva
```

### Regras normativas

- O preço parte exclusivamente do catálogo homologado.
- A condição comercial é aplicada antes da materialização do serviço no caso.
- O `case_service` é a representação contextualizada do serviço aprovado para o caso; itens contextuais exigem justificativa de escopo.
- Exceções só podem afetar a cadeia quando formalmente aprovadas.
- O Blueprint deve preservar a origem canônica de preço e não criar uma segunda tabela/fonte de valores.
- Canva é destino de apresentação da proposta e não autoridade para definir preço, produto, condição, escopo ou exceção.
- Produtos em `em_revisao`, não homologados ou inelegíveis não entram em proposta.
- Despesas de terceiros devem permanecer separadas do preço canônico do produto/serviço.
- Nenhum item do catálogo gera comunicação automática por esta cadeia.

### Proibições

- Não definir preço diretamente no Canva.
- Não duplicar preço entre Roteiro Master, Blueprint, proposta e contrato.
- Não aplicar desconto, condição ou exceção sem o estado e a aprovação requeridos.
- Não usar produto contextual sem `case_service` e justificativa de escopo.

---

## 3. Cadeia canônica do caso

```text
Discovery
→ Proposta
→ Aceite verbal
→ Confirmação formal
→ Conferência Canva
→ Case service
→ Formalização
→ Contrato
→ Onboarding
→ Caso ativo
```

### Regras normativas

- A sequência acima é o ciclo operacional de referência para transformar uma oportunidade em caso ativo.
- Cada marco deve ser rastreável na linha do tempo operacional, com responsável, data/estado, próxima ação e visibilidade compatível.
- A transição de um marco não deve atualizar, alterar ou propagar estado para outros casos.
- Bloqueios e gates devem impedir avanço indevido; não podem ser tratados apenas como mensagens visuais.
- O caso só alcança o estado ativo após as etapas exigidas de formalização, contrato e onboarding.
- A fila Drive permanece dependente dos gates definidos e de aprovação explícita quando `approval_required = true`.
- A existência de uma tela ou CTA não comprova a conclusão do marco; a persistência e o estado canônico precisam existir.

### Controles de avanço

| Marco | Controle mínimo |
|---|---|
| Discovery | Dados mínimos e responsável definidos |
| Proposta | Produto/serviço elegível, origem canônica de preço e escopo verificável |
| Aceite verbal | Registro explícito, sem equivaler a formalização concluída |
| Confirmação formal | Evidência/registro de confirmação aplicável |
| Conferência Canva | Completude da apresentação validada; Canva não altera a fonte canônica |
| Case service | Serviço contextualizado, com justificativa quando necessário |
| Formalização | Parâmetros, partes, condições e pendências contratuais preparados |
| Contrato | Artefato final versionado e status de assinatura rastreável |
| Onboarding | Pré-requisitos e acessos validados |
| Caso ativo | Gates anteriores satisfeitos; estado persistido e auditável |

---

## 4. Evidência de validação

- A decisão está visível em `/governanca/decisoes`.
- A suíte de validação reporta **120 testes passando**.

A aprovação dos testes demonstra aderência da implementação aos cenários cobertos. Ela não autoriza ações externas por si só: criação de documentos, pastas, contratos enviados, cobranças, links de pagamento ou mensagens continua condicionada aos gates específicos e à autorização aplicável.

---

## 5. Consequência para o piloto Ana

O piloto `CA-CID-AT-FAM-2026-001` deve ser validado contra as duas cadeias antes de qualquer avanço externo:

1. Confirmar que preço, condição, `case_service`, exceção e Blueprint obedecem à cadeia de preço, sem valor definido diretamente no Canva.
2. Confirmar que o avanço da Ana respeita os marcos da cadeia do caso e que os bloqueios de completude Canva e `NO_GO` possuem decisão explícita.
3. Manter a fila Drive bloqueada enquanto contrato assinado, pagamento confirmado, onboarding aprovado e a aprovação requerida não estiverem satisfeitos.
4. Usar a decisão como critério de regressão na migração para Claude Code, GitHub, Supabase e Vercel.

---

## 6. Atualização dos documentos relacionados

Este adendo deve ser lido junto a:

- `PLANO_ULTIMO_CHECK_LOVABLE_E_MIGRACAO_CLAUDE_CODE_v1.0.md`.
- `REGISTRO_IMPLEMENTACAO_PILOTO_ANA_EVIDENCIAS_v1.0.md`.
- `docs/governanca/ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md`.

Em caso de conflito, a decisão normativa `CA-DEC-2026-08-20-02` prevalece para regras de preço e progressão de caso.

---

## 7. Log de decisão

| Data | Identificador | Decisão | Resultado de validação |
|---|---|---|---|
| 20/08/2026 | `CA-DEC-2026-08-20-02` | Formalizar cadeia de preço e cadeia de evolução do caso como normas canônicas | 120 testes passando |
