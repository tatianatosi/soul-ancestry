# Checklist de PR / merge — continuidade e prova autenticada

Uso: anexar (ou referenciar) em todo pedido de PR, merge, relatório de teste e artefato técnico/operacional novo. Fonte: `ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`.

Este checklist **não** autoriza alteração de dados, contratos, pagamentos, RLS, permissões, migrations, integrações, publicações, mensagens ou merges sem autorização explícita da proprietária.

## Antes de declarar “feito” ou pedir merge

- [ ] O motor/fluxo afetado está nomeado e ligado ao caso (`crm_casos`) / lead / pessoa quando aplicável.
- [ ] Há persistência real (não só UI); reload previsto no critério de teste.
- [ ] Nenhum contexto relacionado foi rotulado como “arquivado / histórico / substituído” só porque existe código, PR, teste ou documento.
- [ ] Não se declara `COMPROVADO_EM_USO` sem prova visual autenticada da proprietária no registro vivo.
- [ ] Rodapé `REGRA DE CONTINUIDADE` incluído no artefato ou referenciado explicitamente.
- [ ] Se o PR toca produto: o que falta de prova autenticada está declarado (não escondido).
- [ ] Merge/deploy de produção: autorização explícita da proprietária (branch + SHA + se dispara produção) — sem isso, não mesclar.

## Campos de resultado (quando houver teste da proprietária)

| Campo | Valor |
|---|---|
| Motor / fluxo | |
| Ambiente | |
| Rota | |
| Data/hora | |
| Objeto testado (ID mascarado se sensível) | |
| Print inicial autenticado | (anexo / link) |
| Print da ação | (anexo / link) |
| Print de confirmação | (anexo / link) |
| Print de releitura (F5/reabertura) | (anexo / link) |
| Print de integração (se cadeia) | (anexo / link) / N/A |
| Resultado | `PASSOU` / `FALHOU` / `BLOQUEADO_POR_DADO` / `BLOQUEADO_POR_DECISAO` / `ERRO_DE_FONTE` / `NAO_LOCALIZADO` |
| Limitação do teste | |
| Atualiza registro vivo? | `docs/relatorios/2026-09-11_registro-prova-autenticada.md` |

Resultados `PASSOU` de **motor** e status `COMPROVADO_EM_USO` **só** a proprietária preenche após os quatro prints obrigatórios (e integração, se houver cadeia). Agente, build, Vitest, PR verde, log, DEMO ou preview **não** bastam para marcar motor.

Navegação autenticada (abas, sessão, leitura de face) pode ser `PASSOU` no registro sem promover o motor.

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
