# Adendo — Auditoria 47 páginas, telas Lovable, Canvas e comparativo visual

- Status: vigente (decisão da proprietária, 2026-09-11)
- Complementa: `MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md`, `fonte-de-verdade-design-e-execucao.md`
- Não redesenha navegação Desk (grupos vigentes no código) nem as 7 abas do App Cliente

## Material arquivado (fonte permanente no repo)

| Material | Papel | Caminho |
|---|---|---|
| Mockup aprovado **17 páginas** | Contrato **visual** normativo | `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf` |
| Auditoria **47 páginas** | Conteúdo, estados, indicadores e fluxos — usar **junto** com o mockup de 17 | `…/prompts-lovable-2026-08-31/clube-ancestral-mockup-auditoria.pdf` e cópia em `…/auditoria-mockup-2026-09-11/` |
| Telas migração Lovable → Claude | Histórico do que “supostamente” foi aplicado | `…/auditoria-mockup-2026-09-11/clube-ancestral-telas-migracao-lovable.pdf` |
| Comparação visual mockup vs produção | Auditoria de aderência (muitas telas rotuladas aderentes **não** estão) | `…/auditoria-mockup-2026-09-11/comparacao-visual-mockup-vs-producao.pdf` |
| Fluxo jornada | Jornada operacional de referência | `…/auditoria-mockup-2026-09-11/fluxo-jornada-clube-ancestral.docx` |
| Ancestral Canvas (zip Lovable) | Material bruto do Canvas / o que foi aplicado no protótipo | `…/ancestral-canvas-2026-09-11/Ancestral-Canvas.zip` |
| Print Checklist semanal / Plano de ação | Exemplo visual do protótipo (fixture) | `…/auditoria-mockup-2026-09-11/print-checklist-semanal-mockup-prototipo.png` |

Regra de leitura: **comparativo e telas Lovable não autorizam restaurar a sidebar de 14 itens do protótipo**. Indicadores e estados da auditoria de 47 páginas devem orientar Visão Geral e superfícies equivalentes **sem** inventar tabela, CHECK ou aba nova.

## De-para mockup antigo → operação atual

| Rótulo no mockup/Canvas | Runtime hoje | Decisão 2026-09-11 |
|---|---|---|
| Visão Geral | `/painel` | Indicadores alinhados à auditoria; dedup canônico; sem recontar o mesmo fato |
| CRM vivo | `/calls` (Mesa Discovery) | Mantém |
| Casos 360 | `/casos` | Lista em **cards individuais** (não só tabela larga); registro de casos aqui |
| Propostas | `/propostas` + Canva | Proposta comercial é feita no **Canva**; Desk rastreia versão/status. Oferta = **produtos-pai** do planejador universal (`/catalogo`, `planejador-produtos-pai`). SKU legado **não** dirige a oferta |
| Go-live | fixture `desk-go-live.tsx` (sem rota de produto) | **Retirar do vocabulário de produto**. Equivalente real = Fechamento + onboarding em Casos 360 |
| Formalização | `/contratos`, `/casos/$id/contrato/preparar` | Motor contratual **simples**, parametrizado por cliente com dados/anexos puxados do Canva (escopo, entregas). Timeline da jornada → **Pessoa 360** |
| Checklist AppCliente | `/acessos-portal`, `/atendimento`, `/app-cliente-como-pessoa` | Não é aba Desk; checklist = o que falta publicar/liberar no App (7 abas) |
| Financeiro | `/financeiro` | Indicadores reais; sem DRE/Asaas legado como operação |
| Checklist semanal / Plano de ação pesquisa | `/tarefas`, pesquisa do caso, `/ops` | Não recriar tela “Checklist semanal” como nav; ações vivem no planejador + caso |
| Validação Jurídica | `/matriz-juridica` | Manter superfície; fidelidade visual/indicadores vs auditoria |
| Radar Interno | `/qualidade` | Matriz da carteira (não duplicar em Casos 360) |
| Alertas | `/alertas` | Grupo Hoje |
| Biblioteca Mestre | `/biblioteca` (+ governança) | Grupo Governança |
| Integrações | `/integracoes` | Utilidade; não grupo novo |

## O que não conta como aderência

- Rota existir ou tela carregar ≠ alinhamento ao mockup/auditoria.
- Label “aderente” no PDF de comparação sem prova de indicador + próxima ação + persistência.
- Fixture Lovable / SKU / go-live checklist como operação diária.
- Restaurar checklist cerimonial de identidade/contratada (já demovido: pendência informa, não impede).

## Critério de aceite deste adendo

Agente que tocar visual ou indicadores destas superfícies consulta **17 + 47** e este de-para; declara dívida se o código divergir; não inventa entidade paralela.
