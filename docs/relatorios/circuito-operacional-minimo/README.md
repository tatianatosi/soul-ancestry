# Circuito operacional mínimo — relatório de tarefas

**Aba / circuito:** Abas → Mesa Discovery → KPIs (Desk)  
**Núcleo:** planejador + caso (`crm_casos`) + próxima ação — ver `.cursor/rules/clube-ancestral-core.mdc`  
**Como usar:** preencher **manhã** (plano do dia) e **fim do dia** (o que fechou / o que travou).  
**Pasta:** `docs/relatorios/circuito-operacional-minimo/`

**Dia 2026-09-11:** [`2026-09-11_manha.md`](2026-09-11_manha.md) · [`2026-09-11_fim-do-dia.md`](2026-09-11_fim-do-dia.md)  
**Auditoria do ritual:** [`AUDITORIA-REQUISITOS.md`](AUDITORIA-REQUISITOS.md)

---

## Modelo (copiar a cada turno)

```markdown
# Circuito operacional mínimo — [MANHÃ | FIM DO DIA] — AAAA-MM-DD

**Quem:** agente / Tatiana  
**Branch:** …  
**SHA:** …

## 1. O que já funciona (Back-end e Front-end)

### Back-end / banco
- …

### Front-end / telas
- …

## 2. O que estou fazendo agora nesta aba

- …

## 3. Próximos passos travados (para 100%)

| Travamento | Onde | Tipo | O que falta |
|---|---|---|---|
| … | … | fiação Supabase / distorção / prova dona / decisão | … |

## 4. Prova autenticada (dona)

- Resultado no registro vivo: …
```

---

## Turno atual — FIM DO DIA — 2026-09-11 (21:00 UTC)

**Quem:** agente (Cloud)  
**Branch:** `cursor/circuito-abas-mesa-kpis-efd3`  
**Arquivo canônico:** [`2026-09-11_fim-do-dia.md`](2026-09-11_fim-do-dia.md)  
**PR:** https://github.com/tatianatosi/soul-ancestry/pull/112

Resumo vivo nas 4 seções do arquivo do dia (não duplicar aqui a tabela completa). Destaques: cano fiado + prints CA-HIST-005; face Desk 7; App leitura **PASSOU** / Mesa **não PASSOU**; **nenhum** `COMPROVADO_EM_USO`.

---

## Rotina (manhã e fim do dia)

1. Abrir este arquivo-modelo (ou criar `AAAA-MM-DD_manha.md` / `AAAA-MM-DD_fim-do-dia.md` na pasta).
2. Preencher as 4 seções em linguagem simples.
3. Atualizar a tabela de travamentos (não esconder falha de Supabase/RLS).
4. Commit + push na branch de trabalho; **não** merge sem ordem da Tatiana.

**Timers Cloud Agent (UTC):** manhã `11:00` · fim do dia `21:00` — geram o par de arquivos automaticamente quando o agente estiver livre.
