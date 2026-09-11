# Checklist de aceite — Sidebar 7 telas + limpeza §22

**PR:** https://github.com/tatianatosi/soul-ancestry/pull/119  
**Preview:** https://soul-ancestry-git-cursor-sidebar-7-t-86a0e4-tati-6134s-projects.vercel.app  
**(mesmo link do comentário Vercel na PR #119)**  
**Branch:** `cursor/sidebar-7-telas-mockup-2d77`  
**Data:** 2026-09-11  
**Decisão:** proprietária — face do Desk = 7 telas do mockup; limpeza §22 na primeira dobra.

Use este arquivo no preview (desktop + mobile). Marque cada item só depois de ver na tela autenticada.

---

## A. Navegação Desk (hierarquia)

- [ ] Sidebar com **exatamente 7 telas**, nesta ordem: Visão Geral · Casos 360 · Checklist · Validação Jurídica · Radar Interno · Alertas · Biblioteca Mestre
- [ ] Menu mobile **fechado por padrão**, sem árvore de grupos técnicos aberta
- [ ] Comercial / Marketing acessíveis em **≤ 2 cliques** a partir de Visão Geral (submenu/CTA)
- [ ] Formalização acessível em **≤ 2 cliques** a partir de Casos 360
- [ ] Governança / administração acessível pelo **menu da Conta** (ou submenu recolhido), não como 8ª aba
- [ ] Nenhuma rota antiga devolve 404; atalhos de contexto ainda abrem

## B. Limpeza §22 — o que deve sumir da vista

- [ ] Painel **sem** banner “saiu do padrão” / “detalhes técnicos de leitura”
- [ ] Painel **sem** “Incluir demonstrações” / “Só interno” na primeira dobra
- [ ] Sem QA, migration, SQL, RPC, nome de tabela ou ID cru na primeira dobra das telas canônicas
- [ ] Caso 360: um bloco humano **“O que falta para o próximo passo”**; sem gates/IDs técnicos na dobra
- [ ] Caso 360: “Dados técnicos e validações” **recolhido**
- [ ] Lista Casos: sem linguagem “gate/servidor”; demo fora da dobra principal
- [ ] Checklist: sem rótulo “UUID” no formulário
- [ ] App Cliente: **sem** CTAs/abas Entregas · Fase 01 · Fase 02 na navegação principal
- [ ] Portal: aba/título **Conta** (nunca “Acesso” como nome da tela)
- [ ] Sem subtítulos “antes chamado…”, piloto/demo como leitura principal

## C. Conteúdo mínimo que deve permanecer

- [ ] Visão Geral: prioridades do dia + atalho Mesa Discovery / Casos
- [ ] Casos 360: próxima ação, responsável, prazo
- [ ] Checklist: atrasadas / hoje / próximas operáveis
- [ ] App: 7 abas Home · Jornada · Radar · Árvore · Documentos · Legado · Conta

## D. Prova (dona)

- [ ] Desktop conferido no preview
- [ ] Mobile conferido no preview
- [ ] Pelo menos um fluxo salvar → F5 → reabrir em uma tela tocada
- [ ] Resultado registrado no registro vivo (`PASSOU` / `FALHOU` / `BLOQUEADO_*`) — Vitest/preview **não** contam como `COMPROVADO_EM_USO`

---

## O que esta PR não cobre (de propósito)

- Unificação física de pessoas/núcleos/contratos  
- Migrations / RLS / schema  
- Banho de loja visual completo  
- Go-live / magic link  

**Sem merge/deploy sem autorização explícita da proprietária.**
