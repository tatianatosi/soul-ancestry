# Verificação — Achados/alertas vs Publicação de entregas + gaps App Cliente (mockup)

**Data:** 2026-09-11  
**Disparo:** proprietária em `/atendimento#publicacao` + prints App Cliente master vs mockup/auditoria  
**Status:** inventário (sem implementação nesta fatia)

## 1. Veredito curto

A sua intuição está **certa na arquitetura**: achados de pesquisa entram como **alerta interno** (equipe revisa em Pesquisa/`/achados`), não como o núcleo da página “Publicação de entregas autorizadas”.

`/atendimento#publicacao` é outra peça: atendimento + liberação de documento/fatura + atalho recente para publicar texto em `app_projections` (marco/árvore). **Não** fecha o pipeline evidência → achado → alerta → App.

## 2. O que a documentação já decidiu (achados / evidências / alertas)

Fonte principal: [`docs/auditorias/2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md`](../auditorias/2026-09-04-fluxo-evidencia-achado-alerta-app-cliente.md) (status: aguarda decisão; ainda vigente como mapa do real).

| Elo | Decisão / realidade |
|---|---|
| Evidência → achado | Sempre **humano** (`salvarAchado` em `/achados/$caseId`). Sem gatilho automático a partir de evidência. |
| “Alerta” | **Sinal interno** (CA-OPS-01/02, G-06): abre objeto + sugere template; **não** envia WhatsApp/e-mail sozinho. |
| `ale-achados` | Catalogado `CONECTADO` → rota `/achados/$caseId` (`fiacao-cadencia-catalogo.ts`). |
| Autorizar alerta 🔔 | **Não existe** botão próprio na tela de achados (só salvar + aviso “nada é publicado”). |
| Template WhatsApp de achado | Gap: `template_oficial = não aplicável` no catálogo. |
| Visível no App | `client_deliverables` **sem** RLS portal; caminho que funciona = `app_projections` (Biblioteca de evidências ou atalho Atendimento marco/árvore — **não** nascido de `genealogical_findings`). Declarações 09/09: App = `app_projections`; deliverables = operacional. |
| Achado → alerta (CA11) | `prepararConsequenciaAchado` → `case_alerts` tipo `achado_pendente_decisao` — Desk `/alertas`; **nunca** publica no App. |

Taxonomia Desk ([`TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`](../politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md) Tela 6 — **Alertas**): “Gestão de achados e notificações” / alertas de pesquisa — superfície **Desk**, não aba do App Cliente.

Memória permanente: Pesquisa = fontes, achados, hipóteses, conclusões; App Cliente = projeção **autorizada** sanitizada — hipótese nunca como fato.

## 3. O que `/atendimento#publicacao` faz de verdade

Nav: [`navegacao-desk.ts`](../../src/lib/navegacao-desk.ts) → `/atendimento` hash `publicacao`.  
UI: [`atendimento-interno.tsx`](../../src/components/portal/atendimento-interno.tsx).

Nessa âncora misturam-se:

1. KPIs de atendimento (envios, solicitações, tickets, faturas)
2. Cards de casos (muitos “Bloqueado — Contrato não assinado”)
3. **Solicitar documento ao cliente**
4. Envios do cliente pendentes de revisão
5. Bloco **“Publicar no App Cliente”** → `publicarProjecaoApp` com tipo `marco` \| `arvore` → `app_projections` (texto livre, já “publicado”)
6. Liberar documento / fatura (escritores `liberarEntregaCliente` / `liberarFaturaCliente`)

**Hash `#publicacao`:** rótulo de nav em `navegacao-desk.ts`; **não** há `id="publicacao"` no JSX — a página é uma superfície única rolável.

**Não** lista `genealogical_findings`, **não** cria `ale-achados`, **não** liga evidência → achado.

Caminho Desk canônico para conteúdo no App (além do atalho): **Biblioteca de evidências/projeções** (`salvarProjecao` → revisar/aprovar → `app_projections`). Achado elegível pode gerar `case_alerts` (`achado_pendente_decisao`, CA11) — sinal interno, **sem** publicar.

Conclusão de produto: o rótulo “Publicação de entregas autorizadas” **sobrecarrega** a tela de atendimento e **não substitui** Pesquisa + Alertas internos + Biblioteca.

## 4. App Cliente vs mockup / auditoria — o que foi desenvolvido

Referências: mockup **17** (visual) + auditoria **47** (estados) + prompt Lovable “timeline dupla” + taxonomia App (7 abas).  
Prova recente: ambiente D em `2026-09-11_registro-prova-autenticada.md`.

| Elemento do mockup / auditoria | Estado no código (2026-09-11) |
|---|---|
| 7 abas canônicas | **Feito** (`portal-shell.tsx`) |
| Empty states por aba | **Feito** (leitura sem 42P17) |
| Home: resumo + próxima ação | **Parcial** — título do caso + próximo passo; sem blocos ricos do mockup |
| Home: achados recentes | **Parcial** — reusa fatia de `app_projections` (não achados genealógicos) |
| Home: radar 4 eixos + timeline dupla | **Ausente** na Home (prompt Lovable pedia ambos na Home) |
| Jornada: **timeline dupla** (operacional + familiar/genealógica via `case_timeline_events`) | **Ausente** — uma lista única de projeções `marco` |
| Jornada: linha do tempo ancestral 1820–2024 | **Ausente** (taxonomia Tela 2) |
| Radar: 6 dimensões (print atual) vs 4 eixos canônicos (`radar-eixos.ts`) | **Drift** — UI Radar mostra 6; lib canônica de portal ainda fala em 4 |
| Árvore estruturada G1–G5 | **Ausente** — só texto de projeção `arvore` |
| Documentos: checklist / ação necessária / biblioteca | **Parcial** — preparado vs compartilhado; sem checklist rico do mockup |
| Legado com conteúdo publicado | **Gap estrutural** — tela + copy; cano Desk→portal frágil |
| Entregas / Fase 01–02 | Rotas profundas; conteúdo estático / sem RLS portal em `client_deliverables` |
| Publicação Desk→Jornada/Árvore | **Existe** o atalho em Atendimento + Biblioteca de evidências/projeções — **não** o elo achado |

## 5. Mapa mental (como deveria ler)

```text
Pesquisa: evidência → (humano) achado → alerta interno ale-achados
         → (humano) autorizar → template/mensagem OU projeção sanitizada
         → App (Home/Jornada/Radar) só o que foi aprovado

Atendimento#publicacao: solicitar docs, tickets, liberar doc/fatura,
         + atalho texto→app_projections (paralelo, não o pipeline de achados)
```

## 6. Próximos passos sugeridos (só com ordem sua)

1. **Renomear / reancorar** a âncora `#publicacao` (ou mover o bloco “Publicar no App”) para não parecer o lugar dos achados.
2. Fechar P0 da auditoria 04/09: botão **autorizar alerta** em `/achados` + template no catálogo (ainda interno).
3. Decidir rota App para micro-entrega: policy em `client_deliverables` **ou** só `app_projections` (pergunta 1 da auditoria — ainda aberta).
4. P11 / fidelidade: **timeline dupla** + Home rica — só depois do cano de publicação estável (já na fila `2026-09-11_backlog-p11-app-cliente-vs-mockup.md`).

Nada disto foi implementado nesta verificação.
