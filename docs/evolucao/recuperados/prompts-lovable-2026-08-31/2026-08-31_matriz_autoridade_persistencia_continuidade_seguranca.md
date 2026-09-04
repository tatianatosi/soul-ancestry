# Matriz operacional — Autoridade, persistência, continuidade e segurança

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: matriz de diagnóstico operacional
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato técnico-operacional recebido em 2026-08-31
  - Consulta real ao Supabase, conforme relato
  - Mapa de Autoridade Admin, conforme relato
  - Prompt Mestre — Motores a Implantar
escopo:
  - autoridade de escrita por organização
  - persistência por domínio
  - continuidade operacional por tarefas e onboarding
  - preservação de controles de segurança
premissas:
  - as validações citadas foram executadas pelo time responsável contra dados reais e leitura de código
  - a validação manual de navegador por proprietária/Ana ainda não ocorreu
limites:
  - não substitui teste manual em preview
  - não autoriza uso de Comercial/Financeiro e Onboarding como fluxos livres de retrabalho
  - não altera código, dados, RLS, sessão, permissões ou integrações
próximos passos:
  - executar validação manual no preview para domínios liberados
  - concluir P0 em Comercial/Financeiro
  - implementar P3 com idempotência
  - especificar e implementar P4 como onboarding único
critério de aceite:
  - validar persistência com edição/criação, confirmação da escrita, releitura pelo mesmo ID, refresh e reabertura
substitui: nenhum
```

## Conclusão executiva

A operação está em estado desigual: **autoridade interna e segurança estão comprovadas**; **persistência e continuidade operacional são parciais**, com lacunas identificadas e não ocultadas.

O uso sem retrabalho está limitado aos domínios que possuem gravação confirmada por leitura/releitura e que não dependem do onboarding fragmentado. Comercial/Financeiro e Onboarding permanecem como áreas de risco operacional.

## Matriz de estado

| Eixo | Estado | Evidência reportada | Limite atual |
|---|---|---|---|
| Autoridade dentro da organização | Comprovada | Funções de servidor verificam papel por `staff_access`; RLS, `can_write` e `is_org_member` restringem dados por organização; consulta real confirmou que o caso de Ana pertence à organização correta | Requer manutenção de RLS, escopo de organização e validações de servidor em toda mudança futura |
| Persistência em Pessoas | Comprovada tecnicamente | Escrita, confirmação de linha, releitura e comparação foram verificadas contra dado real do Supabase | Falta teste manual no navegador: editar → refresh → reabrir |
| Persistência em Piloto Real | Comprovada tecnicamente | Escrita, confirmação de linha, releitura e comparação foram verificadas contra dado real | Falta teste manual no navegador |
| Persistência em Contratos | Comprovada tecnicamente | Escrita, confirmação de linha, releitura e comparação foram verificadas contra dado real | Falta teste manual no navegador |
| Persistência em Comercial/Financeiro | Não comprovada pelo padrão obrigatório | Proposta, fatura e pagamento ainda usam padrão que só verifica erro | Implementar confirmação de linha afetada, releitura pelo mesmo ID e teste após refresh |
| Continuidade por tarefas | Parcial | Criar tarefa disponível em Pessoa, Caso 360, Contrato e Pesquisa | Não há idempotência; repetição pode gerar tarefa duplicada |
| Continuidade por onboarding | Não comprovada | Há três sistemas paralelos que não se comunicam | Não usar como fonte operacional até P4 — motor único |
| Segurança | Comprovada | RLS, sessão, login, isolamento por organização e auditoria preservados; ações externas continuam exigindo confirmação explícita | Controles não podem ser removidos ou afrouxados para resolver falhas funcionais |

## Domínios liberados provisoriamente

Os domínios abaixo podem ser usados, dentro dos seus limites, pois o relato aponta persistência técnica comprovada:

```text
Pessoas
Caso 360
Contratos
Piloto Real
```

A orientação não equivale a dispensa de teste de preview. Antes de expandir o uso, a proprietária ou Ana deve executar o teste manual para a entidade alterada:

```text
editar/criar
→ salvar
→ confirmar resultado de escrita
→ reler pelo mesmo ID
→ refresh completo no navegador
→ reabrir
→ confirmar o valor persistido
```

## Domínios com risco de retrabalho

### Comercial e Financeiro

Propostas, faturas e pagamentos ainda utilizam o padrão antigo: checagem de erro sem confirmação de linha afetada nem releitura independente. Portanto, não devem ser tratados como persistência comprovada nem como fluxo seguro contra retrabalho.

A correção necessária pertence ao P0:

```text
UI
→ handler
→ validação
→ escrita com organization_id
→ confirmar linha afetada
→ releitura pelo mesmo ID
→ comparação
→ invalidar/refetch de cache
→ sucesso somente após confirmação
```

### Onboarding

Onboarding real ainda não existe como motor único. Há três sistemas que não se comunicam; entradas feitas em um podem não produzir continuidade no fluxo canônico futuro. Não iniciar ou preencher onboarding para trabalho de produção até definição e implementação de P4.

## Continuidade operacional

O recurso “Criar tarefa” já permite encadear ações em Pessoa, Caso 360, Contrato e Pesquisa. Porém, ele ainda não atende integralmente o motor P3 porque não possui idempotência.

Problema atual:

```text
clicar duas vezes
→ cria duas tarefas
→ produz duplicidade de acompanhamento
```

Regra necessária para P3:

```text
case_id + origem + referência da entidade + status aberto
→ localizar tarefa lógica existente
→ atualizar/reutilizar ou criar somente se inexistente
```

A implementação deve preservar o dado e permitir que a próxima ação seja atualizada sem multiplicar tarefas equivalentes.

## Segurança preservada

Permanecem preservados, conforme o relato:

- RLS.
- Sessão e login.
- Permissões por organização.
- Isolamento de dados entre organizações.
- Auditoria em segundo plano.
- Confirmação explícita antes de ações externas irreversíveis, como envio, assinatura e cobrança.

Não é permitido corrigir as lacunas de persistência/continuidade mediante bypass administrativo, `service_role` no navegador, redução de RLS, exclusão de dados ou ações externas automáticas.

## Tradução para uso diário

Para minimizar retrabalho agora:

```text
Use: Pessoas, Caso 360, Contrato e Piloto Real.
Evite como fluxo de produção: Comercial, Financeiro e Onboarding.
```

Nos domínios liberados, criar tarefa exige atenção para não duplicar cliques até P3 implementar idempotência. Nos domínios não liberados, não considerar o dado definitivamente salvo apenas porque a interface mostrou sucesso.

## Próximos passos

1. Executar teste manual de navegador em Pessoas, Caso 360, Contratos e Piloto Real.
2. Corrigir todas as escritas de Comercial/Financeiro para o padrão de P0.
3. Implementar P3 — idempotência de tarefas e próxima ação — sem criar tabela ou jornada paralela.
4. Concluir mapeamento dos três sistemas de onboarding e especificar P4 — Motor Único.
5. Só ampliar a recomendação de “sem retrabalho” quando os critérios de persistência e continuidade forem demonstrados em cada domínio.
