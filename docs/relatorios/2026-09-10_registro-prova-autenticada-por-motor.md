# Registro vivo — prova autenticada por motor (2026-09-10)

Fonte normativa: `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`.  
Checklist: `docs/politicas/CHECKLIST-PR-CONTINUIDADE-PROVA.md`.

## Estado deste registro

- Criado na incorporação documental do adendo.
- **Nenhum motor** está `COMPROVADO_EM_USO`.
- Todos os resultados abaixo iniciam em `NAO_LOCALIZADO` (protocolo ainda não executado pela proprietária neste registro).
- Agente, PR, build, Vitest, log, mock ou preview **não** podem alterar resultado para `PASSOU` nem status para `COMPROVADO_EM_USO`.

## Resultados permitidos

`PASSOU` · `FALHOU` · `BLOQUEADO_POR_DADO` · `BLOQUEADO_POR_DECISAO` · `ERRO_DE_FONTE` · `NAO_LOCALIZADO`

Status de motor após prova completa da proprietária: `COMPROVADO_EM_USO` (somente ela).

## Cadeia integrada (critério final)

```text
Entrada comercial
→ Mesa Discovery
→ Pessoa/Dossiê
→ Caso/Jornada
→ Pesquisa/Evidência
→ Proposta/Formalização
→ Financeiro
→ Entrega/App Cliente
→ Hoje/Radar
```

Enquanto a cadeia não for percorrida com prints, o contexto de resgate permanece **ativo**.

## Matriz por motor

| Motor | Teste autenticado mínimo | Prova de integração | status_prova | resultado | ambiente | rota | data/hora | print inicial | print ação | print confirmação | print releitura | print integração | limitação |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Mesa Discovery / CRM | Abrir lead, colar entrada de teste, revisar varredura, registrar SPIN, resultado, responsável e próxima ação; salvar e recarregar. | Próxima ação em Marketing & Comercial e em Hoje, sem duplicar registro. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Pessoa 360 | Abrir pessoa vinculada, editar dado permitido, salvar e recarregar. | Mesmo vínculo no Caso 360 com origem/status preservados. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Varredura de dossiê | Informar pessoa/caso e palavras-chave; gerar inventário. | Item aceito no dossiê/Pessoa/Caso com fonte e revisão humana. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Pesquisa e evidências | Criar/revisar lacuna, documento, evidência ou pedido; salvar e recarregar. | Pendência em Inteligência & Pesquisa, Caso e Hoje (se prioritária). | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Contexto países / jurídico | Abrir contexto de país do caso; conferir fonte/versão/revisão. | Alerta/pendência no Radar/Caso sem parecer final. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Proposta / formalização | Abrir proposta/caso; completar parâmetro permitido; salvar/reabrir. | Estado de formalização no Caso 360 e em Hoje se exigir ação. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Financeiro | Consultar estado referenciado; validar que status não é inventado; escrever só se autorizado. | Impacto no Caso/Radar sem cobrança/pagamento automático. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Entregas / App Cliente | Revisar/liberar entrega autorizada; abrir projeção do cliente. | Conteúdo permitido no App; interno/sensível ausente. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| KPIs e Hoje | Abrir KPI; conferir fonte/lista; resolver/atualizar item; recarregar. | Card e fila atualizam sem segundo registro. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | Aguardando execução autenticada da proprietária |
| Abas / taxonomia (8+7) | Navegar autenticada pelos **8 grupos Desk** e **7 abas App Cliente**. | Objeto na aba/grupo dono; demais só resumo/link. | pendente | `NAO_LOCALIZADO` | — | — | — | — | — | — | — | — | “Seis áreas” do rascunho → 8 grupos + 7 abas (decisão vigente) |

## Contextos que permanecem ativos (lista §5)

Independente de código/PR, até prova integrada:

| Contexto | Ativo até prova? | Nota |
|---|---|---|
| Arquitetura do Desk Simplificado | sim | Continuidade ativa |
| Mesa Discovery, varredura WhatsApp, roteiro SPIN | sim | Continuidade ativa |
| Pessoa 360 e regras de núcleo/dossiê | sim | Continuidade ativa |
| Varredura de dossiê por pessoa/caso/palavra-chave | sim | Continuidade ativa |
| Central de Inteligência, Bases, Biblioteca, Dicionários, Trilhas | sim | Continuidade ativa |
| Contexto multi-país e validação jurídica | sim | Continuidade ativa |
| Proposta, contrato, anexos, formalização, financeiro | sim | Continuidade ativa |
| Radar de carteira e Radar de caso | sim | Continuidade ativa |
| Indicadores vivos e cockpit Hoje | sim | Continuidade ativa |
| Projeção e visibilidade do App Cliente | sim | Continuidade ativa |
| RLS, sessão, permissões, auditoria, privacidade | sim | Continuidade ativa |

## Destino de arquivamento (só após COMPROVADO_EM_USO)

| Contexto | destino | substituído por | motivo | data | responsável |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

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
