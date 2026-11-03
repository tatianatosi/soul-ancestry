## O que mudou

<!-- Fatia vertical: UI + persistência + permissão + evidência. -->

## Fonte de verdade

## Matriz verificável por SHA

Preencha o bloco abaixo com o SHA completo do commit testado e todos os arquivos alterados.
Cada requisito tem um critério; links devem apontar para evidências reais, não exemplos.
Tipos: code, ui, write, access, contract, payment, publication.
UI exige desktop 1280 e mobile 375; escrita exige action e readback após F5.
Atos sensíveis exigem flow autorizado. Pendência exige reason e owner; não conta como PASSOU.
Os arquivos declarados ficam reservados enquanto a PR estiver aberta; sobreposição exige transferência entre responsáveis.

```json
{
  "agent": "Claude",
  "base_sha": "PREENCHER_SHA_BASE_40_CARACTERES",
  "tested_sha": "PREENCHER_SHA_TESTADO_40_CARACTERES",
  "files": [],
  "criteria": [
    {
      "id": "C1",
      "requirement": "Descrever requisito aprovado",
      "test": "Identificar teste executado",
      "kinds": ["code"],
      "status": "NAO_LOCALIZADO",
      "reason": "Evidência ainda não registrada",
      "owner": "Claude",
      "evidence": {}
    }
  ]
}
```

Links presentes são evidências declaradas, não prova automática de autenticidade ou COMPROVADO_EM_USO.

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
