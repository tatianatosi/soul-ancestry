# Estratégia de resgate — Clube Ancestral como produto (não colcha de retalhos)

- Status: vigente (proprietária, 2026-09-11)
- Complementa: MEMORIA permanente, ADENDO auditoria/Canvas, `PROMPT-MESTRE-MOTORES-A-IMPLANTAR.md`
- Não redesenha navegação nem inventa tabela/CHECK

## Diagnóstico curto

Muitos textos em `docs/politicas/` são **prompts de execução** arquivados como se fossem política. Arquivar ≠ aplicar. O Desk acumula superfícies, fixtures Lovable e indicadores paralelos enquanto Pessoa/Caso/planejador ainda não fecham a cadeia diária.

## Ordem de autoridade (sem mudar)

1. Decisão explícita da proprietária  
2. Planejador (`case_plans` + escritores)  
3. Schema/migrations/código aprovado  
4. Mockup **17** (visual) + auditoria **47** (conteúdo/indicadores)  
5. Marca: `marca.ts` / `styles.css` / Guia CA-MARCA (navy `#2F4B6E`, dourado `#FCB73A`, creme `#ECDFCD`, terracota `#9A3A2F`; Cormorant + Inter)

## Princípio: um objeto, uma casa

| Objeto | Casa | Não fazer |
|---|---|---|
| Pessoa | `/pessoas/$clienteId` (`clientes`) | Segundo cadastro civil |
| Caso | `/casos` + `/casos/$id` (`crm_casos`) | Segundo eixo operacional |
| Próxima ação | RPC `proxima_acao_*` + planejador | Texto paralelo contraditório |
| Oferta | Produtos-pai (`/catalogo`) | SKU Lovable como oferta |
| Proposta comercial | Canva → Desk status → preparar contrato | SKU como fonte |
| Formalização | `/casos/$id/contrato/preparar` | Checklist go-live paralelo |
| App Cliente | 7 abas canônicas | Entregas/Fase 01/02 na barra |

## Trilha de resgate (ordem obrigatória)

### Trilha A — Motor (antes de visual largo)

1. **Pessoa 360 ↔ Caso 360** — mesma próxima ação, links bidirecionais, formalização/jornada a um clique *(fatia desta rodada)*.  
2. **Cadeia lead → cliente → caso → proposta → contrato** — um escritor por seta; sem mock de sucesso.  
3. **Planejador** — única fonte de plano; Painel/Casos/Pessoa só consomem.  
4. **Participantes** — `nucleo_membros` / `case_members` sincronizados (sem `case_participants`).  
5. **Portal** — publicação Desk → projeção sanitizada; 7 abas.

### Trilha B — Indicadores (depois do motor mínimo)

6. Visão Geral / Financeiro / Radar / Alertas alinhados à auditoria 47, com **dedup** canônico.  
7. “Checklist App Cliente” = o que falta publicar por caso (`/acessos-portal`), não aba nova.  
8. “Checklist semanal” = `/tarefas` + pesquisa do caso, não tela Lovable.

### Trilha C — Visual e taxonomia (P11, por último na lógica do mestre)

9. Taxonomia mockup 17 (rótulos) sem restaurar sidebar de 14 itens.  
10. Tipografia/cores/Pantone já canônicos — auditar desvios tela a tela; `/mockup` como referência.  
11. Retirar fixtures/go-live/SKU do vocabulário diário (já iniciado).

## O que NÃO fazer nesta estratégia

- Criar Cockpit paralelo antes da Trilha A.  
- Tratar PDF “aderente” como aceite.  
- Fundir Desk em 7 itens do mockup ou criar 9º grupo.  
- Inventar tabelas dos prompts antigos.  
- Visual/landing como substituto de persistência.

## Critério “produto funciona”

Para um caso real (ex.: Ana): abrir Pessoa 360 → ver próxima ação → abrir Caso 360 → concluir/reprogramar → preparar contrato com Canva → publicar algo no App → reload mostra o mesmo. Sem planilha, sem SQL manual, sem fixture.

## Arquivo dos prompts reenviados

Cópias em `docs/evolucao/recuperados/prompts-execucao-2026-09-11/`. Destilado operacional: este arquivo + `ADENDO-PROMPTS-SAO-EXECUCAO-2026-09-11.md`.
