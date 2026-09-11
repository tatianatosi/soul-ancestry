# Provas visuais autenticadas

Pasta viva. **Não arquivar** enquanto os motores não estiverem `COMPROVADO_EM_USO`.

| Pasta | Ambiente | Conta | O que prova | O que não prova |
|---|---|---|---|---|
| `2026-09-11-preview-desk-6-grupos/` | Prévia Vercel da branch do Desk de 6 grupos | `tati@pluggedresearch.com` (Admin) | Sessão autenticada, 6 grupos, KPIs de leitura, Calls, Contratos, Catálogo, Biblioteca, 7 abas do App em DEMO | Escrita + F5 de motor; cadeia ponta a ponta; App Cliente com dado real |
| `docs/relatorios/provas/2026-09-11-app-cliente-master/` | Produção Vercel `/app-cliente-como-pessoa` | proprietária autenticada | 7 abas do App em leitura, sem `42P17` | Publicar conteúdo → F5 → `COMPROVADO_EM_USO` |

Senha e `service_role` **não** entram nesta pasta.

Fonte da regra: `docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`.  
Registro: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`.

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
