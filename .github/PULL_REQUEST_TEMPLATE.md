## O que mudou

<!-- Fatia vertical: UI + persistência + permissão + evidência. -->

## Fonte de verdade

- Planejador / caso (`crm_casos`) / tabelas já existentes:
- Esta mudança fortalece o motor único? (sim/não e por quê)

## Prova autenticada da proprietária

Política: `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`  
Registro: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`

- [ ] Print inicial autenticado (`tati@pluggedresearch.com`, rota visível)
- [ ] Print da ação
- [ ] Print de confirmação
- [ ] Print de releitura (F5 / reabertura)
- [ ] Print de integração (quando o motor participa da cadeia)
- [ ] Resultado: `PASSOU` / `FALHOU` / `BLOQUEADO_POR_DADO` / `BLOQUEADO_POR_DECISAO` / `ERRO_DE_FONTE` / `NAO_LOCALIZADO`

Sem esses prints, **não** marcar o motor como feito e **não** arquivar o contexto relacionado.

Código, Vitest, build, preview ou declaração de agente não substituem a prova visual.

## Limites

- [ ] Sem alteração de RLS, migrations, pagamentos, mensagens ou merge de produção sem autorização explícita da Proprietária (branch + SHA + se dispara produção).
- [ ] Sem `service_role` no git, no PR ou no chat.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
