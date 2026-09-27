# Ficha Lead/CRM Vivo e Mesa Discovery — contrato canônico (Fase 4, 27/09/2026)

```yaml
status: executado
fase: 4 de 6 — "Prompt Canônicos — Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Mesa Discovery (`/calls`) organiza o registro de uma call em 7 blocos
guiados, sem forms empilhados e desconexos. `/leads` continua como o
CRM/pipeline (lista + detalhe), sem writer próprio.

## Os 7 blocos

| # | Bloco | Estado antes | Executado nesta fase |
|---|---|---|---|
| 1 | Contexto do lead | Ausente — a tela abria direto na varredura | Novo resumo (origem, país/linha, responsável, estágio, próxima ação atual) antes de tudo |
| 2 | Preparação pré-call | Consentimento misturado dentro de "Registro da call" | Nova `Secao` própria "Preparação pré-call", só os 3 campos de consentimento |
| 3 | Varredura/transcrição | Já existia (`VarreduraWhatsApp`) | Sem mudança |
| 4 | Roteiro SPIN guiado | Já existia (`MesaDiscovery`/`renderCampoRoteiro`) | Sem mudança |
| 5 | Síntese de Discovery | `sinaisQualidadeLead` só era calculado em `/leads`, nunca em `/calls` | Trazido para `/calls`, mesmo cálculo, novo bloco "Síntese de Discovery" |
| 6 | Decisão e handoff | Campos corretos (resultado/próxima ação/prazo/responsável), mas sem resumo único | "Handoff da Discovery" renomeado para "Decisão e handoff", ganhou resumo de próxima ação/prazo/responsável ao lado do resultado — mesmos campos, mesmo writer, um só lugar para ver a decisão inteira |
| 7 | Histórico | Já existia (`TrilhaDoLead`) | Sem mudança |

**Correção de precisão (auditoria de 27/09/2026)**: a numeração acima é
conceitual, não a ordem visual literal de cima para baixo na tela.
`VarreduraWhatsApp` (bloco 3) renderiza no topo de toda a página
(`painel-calls.tsx:655`), antes da lista de leads e antes de qualquer
lead ser selecionado — não "entre o bloco 2 e o bloco 4" dentro da coluna
de detalhe do lead. Os blocos 1, 2, 4, 5, 6 e 7 sim seguem essa ordem,
todos dentro da coluna de detalhe, que só aparece após selecionar um
lead. Achado sem impacto funcional (nenhum código mudou por causa dele) —
só corrige a leitura da tabela acima para bater com a tela real.

## O que não foi tocado (por decisão de escopo, preservando comportamento testado)

- **Nenhum campo mudou de writer.** `salvarLeadDesk` continua o único
  escritor; a reorganização é só visual/estrutural — mover onde cada campo
  aparece, nunca criar coluna nova nem duplicar persistência.
- **Não consolidei em UM controle único de decisão** (ex.: um único
  dropdown que decida tudo de uma vez) — os campos já existentes
  (`discovery_resultado`, `proxima_acao`/`proxima_acao_em`/
  `responsavel_nome`) continuam editáveis onde já estavam (a SPIN card da
  etapa "decisão", e o resultado no registro da call); o bloco 6 agora os
  resume juntos, para o operador ver a decisão inteira num só lugar, sem
  reconstruir o fluxo de perguntas guiadas que já funciona.
- **`/leads` não perdeu nenhum campo nem ganhou writer novo** — continua
  pipeline/detalhe; `sinaisQualidadeLead` continua calculado lá também
  (não removido, só passou a também ser calculado em `/calls`).

## Verificação

`tsc --noEmit` limpo. Testes existentes (`painel-calls-roteiro-vivo.test.ts`,
`r3-calls-unica-superficie-discovery.test.ts`, `circuito-abas-mesa-kpis.test.ts`)
continuam passando sem alteração — a reorganização não quebrou nenhum
comportamento já travado. Novo
`src/lib/__tests__/fase4-ficha-lead-mesa-discovery-2026-09-27.test.ts`.
Suíte completa e `vite build` — ver rodapé do commit.

## Prova Lovable pós-push

1. Em `/calls`, selecionar um lead: conferir o novo resumo "Contexto do
   lead" no topo (origem, país/linha, responsável/estágio, próxima ação).
2. Logo abaixo, "Preparação pré-call" com só os 3 campos de consentimento,
   separados do "Registro da call".
3. Depois do roteiro SPIN, conferir "Síntese de Discovery" (mesmos sinais
   que já apareciam em `/leads`) e, em seguida, "Decisão e handoff" com o
   resumo de resultado + próxima ação + prazo + responsável juntos.
