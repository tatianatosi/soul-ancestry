# Backlog P11 — App Cliente master vs mockup 17 (banho de loja diferido)

**Status:** fila visual — **não executar nesta fatia**  
**Data:** 2026-09-11  
**Base de observação:** prints da proprietária em `/app-cliente-como-pessoa` (caso Ana Luiza) + mockup normativo de 17 páginas  
**Autoridade:** `docs/politicas/ADENDO-MEMORIA-AUDITORIA-MOCKUP-CANVAS-2026-09-11.md` (17 = visual; 47 = estados/conteúdo)  
**Prova relacionada:** `docs/relatorios/2026-09-11_registro-prova-autenticada.md` · ambiente D

## Já alinhado (não reabrir)

- Nav de primeiro nível: exatamente **Home · Jornada · Radar · Árvore · Documentos · Legado · Conta**
- Entregas / Fase 01 / Fase 02 **fora** da barra (rotas profundas OK)
- Empty states específicos por aba (não placeholder genérico)
- Leitura sem `42P17` após fix RLS remoto

## Fila do banho de loja (quando P11 for autorizado)

| Item | Situação em 2026-09-11 | Referência |
|---|---|---|
| Tipografia | Runtime: Cormorant + Inter. Guia oficial: Amolina + Montserrat | `ADENDO-MARCA-SITE-SEO-2026-09-11.md` |
| Densidade / empty states | Cards amplos, muito creme, padrão “Disponível para você” repetido | Mockup 17 págs |
| Copy Legado | UI inline: “Nenhum material de legado publicado…” ≠ `COPY_TELAS.legado.vazio` | `portal/legado.tsx` vs `portal-copy.ts` |
| Copy Documentos | Segundo vazio (“O que você compartilhou”) além do canônico | `portal-copy.ts` + tela Documentos |
| CTAs na Jornada | Botões “Entregas da jornada” e “Relatório Fase 01” parecem primários | Mockup: entregáveis, não abas |
| Banner master | “ACESSO MASTER — VISÃO REAL…” só no espelho Desk — correto; não levar ao portal cliente real | `app-cliente-como-pessoa.tsx` |
| Radar zerado | 0% nas 6 dimensões = empty legítimo; calibrar visual vs mockup/auditoria 47 | PDF 17 + 47 |
| Timeline dupla (Jornada/Home) | **Não implementada** — lista única de `app_projections`; mockup pede operacional + familiar via `case_timeline_events` | Verificação 2026-09-11 |
| Achados ≠ Publicação Atendimento | Pipeline de achados = alerta interno em Pesquisa (`ale-achados`); `/atendimento#publicacao` é outra peça | `2026-09-11_verificacao-achados-alertas-vs-publicacao-e-gaps-app-cliente.md` |
| Site vs app | Site institucional permanece em clubeancestral.com.br (SEO) | adendo marca/SEO |

## Explicitamente fora deste backlog

- Inventar abas Entregas / Fase na nav
- Restaurar sidebar Lovable de 14 itens
- Publicar conteúdo genealógico fictício para “encher” empty states
- Redesign Desk (8 grupos) a partir do mockup de 7 itens internos

## Pré-requisito para executar P11

Ordem explícita da proprietária + motor operacional já comprovado na trilha (publicar → F5 → releitura no App). Até lá, só documentação.
