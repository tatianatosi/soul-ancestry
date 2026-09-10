# Levantamento histórico — Ficha Piloto, Ficha Genealógica, Ficha Cliente, CRM Operação Viva

```yaml
status: concluído — achados verificados contra código real
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: auditoria / reconciliação de prompts históricos
responsável pela decisão: Proprietária Administradora do Clube Ancestral
base normativa: docs/politicas/INVENTARIO-CONSOLIDADO-PROMPTS-FASES-2026-08-31.md (precedente direto — mesmo
  tipo de exercício, feito em 31/08 para outro conjunto de prompts)
repositório: tatianatosi/soul-ancestry
fonte: varredura completa de docs/evolucao/recuperados/ e docs/politicas/, cruzada contra src/ e schema real
  do Supabase, em 2026-09-03
```

## Causa

"Puxe todos aqueles que tragam ficha piloto, ficha genealógica, ficha cliente, CRM operação viva —
reveja no GitHub não só os prompts atualizados, mas a leva histórica anterior, porque muitos
prompts estão lá e nunca foram executados." (2026-09-03)

## Achado geral

Ao contrário do temido, a maior parte do que foi encontrado **já está implementada**. O problema
real não é prompt esquecido sem execução — é **duplicação**: o mesmo prompt/decisão existe em 3 a
5 cópias com nomes diferentes espalhadas em `docs/evolucao/recuperados/`, o que torna difícil
saber, só de olhar o arquivo, se algo já foi feito ou não. Exatamente o padrão "muita lista, pouco
motor" já identificado noutras frentes desta sessão.

Só **um** item concreto e novo ficou confirmado como não implementado.

## 1. Ficha Piloto Genealógica (G-02) — ✅ implementada

| Documento | Data | Papel |
|---|---|---|
| `docs/evolucao/recuperados/prompts-lovable/ficha_piloto_genealogica_e_arvores_decisao_canonica_v1_0.md` | 19/08 | Decisão canônica original |
| `docs/evolucao/recuperados/prompts-lovable/PROMPTS_POS_CRM_IDENTIFICADORES_E_MOTOR_GENEALOGICO_v1.0.md` | 20/08 | Vira prompt executável `[ID G-02]` — mesma decisão |
| `docs/evolucao/recuperados/prompts-lovable/STATUS_FINAL_ANA_FICHA_GENEALOGICA_E_GATES_v1.0.md` | 20/08 | Relatório de status confirmando estrutura implantada |
| `docs/evolucao/recuperados/prompts-lovable/PLANO_DECISOES_E_PROMPTS_ANA_A_E_v1.0.md` | 20/08 | Repete "Ficha Piloto G-02 \| Implementada" |
| `docs/evolucao/recuperados/prompts-lovable/PLANO_MIGRACAO_E_STACK_BRASIL_APOS_PILOTO_ANA_v1.0.md` | — | Cita como item de roadmap já coberto |
| `docs/G02_PESSOAS_E_LINHAGENS_v1.0.md` | 20/08 | **Versão canônica atual**, status "implantado" |

**Evidência de implementação real:** tabelas `genealogical_person_profiles`, `name_variants`,
`genealogical_relationships`, `genealogical_events`, `lineage_paths`; código
`src/lib/ficha-piloto-genealogica.ts`, `.functions.ts` (server fn `carregarFichaPiloto`),
`src/components/caso/ficha-piloto-genealogica.tsx` (usado em `casos.$caseId.index.tsx` e
`jornada-pos-gates.tsx`); teste `src/lib/__tests__/genealogia-ficha-piloto.test.ts`.

**Ação recomendada:** nenhuma — está feito. Os 5 arquivos históricos podem, quando a proprietária
quiser, ser sinalizados como "superados por G02_PESSOAS_E_LINHAGENS_v1.0.md" para reduzir ruído no
arquivo, sem apagar nada.

## 2. Ficha Cliente — ❌ não implementada (achado acionável)

| Documento | Data |
|---|---|
| `docs/politicas/PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE.md` | 31/08 |
| `docs/evolucao/recuperados/prompts-lovable-2026-08-31/PROMPT_CORRECAO_ADMIN_VISAO_CLIENTE.md` | 31/08 — cópia byte-idêntica |

**O que especifica:** um botão "Abrir visão do cliente" na ficha do cliente e no detalhe do caso,
com `mode=admin_preview` — visão somente leitura, sem logout ou troca de sessão, para a proprietária
ver exatamente o que aquele cliente vê no App.

**Verificado no código:** busca por `admin_preview` e "Abrir visão do cliente" em `src/` não retorna
nenhum resultado. **Não existe hoje.**

**Nota de contexto:** isto é distinto do "Acesso master ao App Cliente" (`/app-cliente-como-pessoa`)
já registrado no Mapa de Autoridade Admin (PR #45) — aquele cobre só 3 de 10 telas via troca de
fonte de dados; este prompt propõe um botão de preview direto a partir da ficha do cliente, nunca
implementado.

## 3. CRM Operação Viva — ⚠️ parcial

| Documento | Data | Escopo |
|---|---|---|
| `.lovable/plan/fluxo-comercial-canônico-no-crm-vivo-2026-08-21.md` | 21/08 | Fluxo comercial: leads → propostas → clientes |
| `docs/evolucao/recuperados/prompts-lovable/CA-LOVABLE-CRM-COMERCIAL-v1.0.md` | 21/08 | Predecessor do mesmo fluxo |
| `docs/politicas/PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` (+ cópia idêntica em `prompts-lovable-2026-08-31/`) | 31/08 | Pacote maior: CRM vivo + onboarding único + cadências + indicadores reais |

**Fluxo comercial canônico — implementado.** `src/lib/crm-fluxo.ts` (`ETAPAS_COMERCIAIS` reproduz
exatamente o plano de 21/08), `.functions.ts`, `src/components/crm/fluxo-canonico.tsx`, rota
`historico.fluxo-comercial-canonico.tsx`.

**Onboarding único e indicadores reais — não iniciados.** Isto **já estava reconciliado** em
`docs/politicas/INVENTARIO-CONSOLIDADO-PROMPTS-FASES-2026-08-31.md` (31/08), que classificou
`PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md` como "referência histórica; não iniciar como pacote
monolítico" e marcou onboarding único (P4) e indicadores (P9) como "não iniciado" — o mesmo
julgamento a que esta varredura chegou de forma independente, o que reforça a leitura anterior em
vez de contradizê-la.

## Duplicação encontrada (achado transversal)

Pelo menos 3 pares de arquivos byte-idênticos foram confirmados nesta varredura, todos com uma
cópia em `docs/politicas/` e outra em `docs/evolucao/recuperados/prompts-lovable-2026-08-31/`:
`PROMPT-CORRECAO-ADMIN-VISAO-CLIENTE`, `PROMPT-MOTORES-UNIFICADOS-CRM-VIVO`, e o pacote de
redesenho unificado (já registrado em `REDESENHO-UNIFICADO-DESK-APP-CLIENTE-PESSOAS-2026-08-31.md`
v2.0, que lista as 7 versões sucessivas do mesmo pacote). Nenhum arquivo foi apagado ou movido —
só documentado aqui para visibilidade.

## Fora do escopo desta entrega

Nenhum código foi alterado. O botão "Abrir visão do cliente" (achado 2) não foi implementado — fica
para decisão de prioridade da proprietária.

## Próximos passos

1. Confirmar se o botão "Abrir visão do cliente" (`admin_preview`) deve ser implementado agora ou
   fica junto da frente maior "aba cliente do Desk" já mencionada no Mapa de Autoridade Admin.
2. Nenhuma ação necessária sobre a Ficha Piloto Genealógica nem sobre o fluxo comercial — ambos
   implementados e em uso.
3. Onboarding único e indicadores reais (CRM Operação Viva) seguem como "não iniciado", consistente
   com o inventário de 31/08 — não é achado novo, é confirmação.
