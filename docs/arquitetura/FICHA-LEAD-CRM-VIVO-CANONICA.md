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

---

## Roteiro mestre e CRM Vivo executados (27–28/09/2026)

Fonte: documentos da Proprietária de 10–11/08/2026 ("Bloco Discovery",
"Pente-Fino Final", "Auditoria Final do SPIN e Esquema de Campos", "Adendo —
Ficha Piloto"). Só o que está no código está listado aqui.

### Contrato de dados

- **Oportunidade = o lead canônico** (`leads.id`). Não existe segunda
  entidade de oportunidade ativa.
- **Próxima ação = `leads.proxima_acao` + `proxima_acao_em` +
  `responsavel_nome`**, lida pelo mesmo `id` em `/calls`, `/leads`,
  `/proximas-acoes` e Hoje (`/painel`, cartão "Próximas ações comerciais"),
  sempre com link `/calls?lead=<id>`. Nenhuma tarefa do Desk é criada a partir
  do lead: antes do `case_id` nada vai ao Desk; depois dele, a próxima ação é
  a do caso (Caso 360 / Planejador de Cidadania).
- **Pipeline:** Leads → Discovery → Diagnóstico → Proposta → Contrato
  (`etapaPipeline`, derivada dos eixos existentes). Lead com `case_id`,
  cliente ativo, perdido ou encerrado sai do pipeline (`leadForaDoPipeline`)
  em `/calls`, `/leads` (salvo "Mostrar convertidos"), `/proximas-acoes` e Hoje.
- **Registro da Discovery = `leads.discovery_registro`** (jsonb, migration
  `20260927140000`, aplicada): blocos SPIN (nota, dispensa com motivo),
  respostas narrativas por pergunta com origem (relato, WhatsApp, documento
  visto/recebido, a confirmar; "não sabe / não tem agora" = lacuna), decisões
  sobre sugestões da varredura (aceita/rejeitada/hipótese, com fonte, autor,
  trecho e data), pós-call e os 4 consentimentos. A conversa inteira nunca é
  gravada. O App Cliente nunca lê este registro.

### Tela `/calls` (ordem)

Contexto do lead → Preparação pré-call → Histórico da Discovery + trilha →
**Abertura e consentimentos** (contato, dados, gravação/transcrição,
documentos — separados; gravação espelha `consentimento_status`) →
Varredura (só com gravação/transcrição concedida; fala de
Consultor/Atendente/Equipe ignorada) → **SPIN** (uma pergunta por vez;
card do bloco com estado, nota e dispensa com motivo; resposta estruturada
+ resposta narrativa; extensões curtas por país ao fim da Situação) →
**Fechamento e pós-call** (nível 1 sempre; nível 2 quando qualifica;
pendência informa, não trava) → Síntese → Decisão e handoff.

### Legado de referência, sem escritor

| Material | Situação |
|---|---|
| Planilha Mestre / catálogo / SKU | Legado. Não governa produto, preço, escopo nem jornada. Em `/leads`, `sku_referencia` é só leitura, rotulado legado. Depois da conversão, o Planejador de Cidadania (`case_plans`) governa. |
| CRM Mestre conceitual (`/crm-mestre`, `opportunities`/`discovery_assessments`) | Referência/dicionário. Não é fonte de escrita do CRM operacional. |
| OPS / CA OPS | Referência. Não é CRM operacional nem pipeline. |
| Dossiê-mãe no lead (`dossie_*`) | Só leitura em `/leads`; o dono é o Núcleo familiar. |
| `leads.nacionalidade` (valor único) | Só leitura; país de interesse é `nacionalidades_interesse`. |

### Mensagens de WhatsApp dos gaps (rascunho, não publicar nem automatizar)

1. Pós-call: "Oi [NOME], obrigada pela conversa de hoje. Resumindo: vamos [PRÓXIMO PASSO] até [PRAZO]. Qualquer dúvida, estou aqui."
2. Reativação 3+ meses: "Oi [NOME], lembrei de você e da história da família [SOBRENOME]. Se quiser retomar, estou à disposição — sem pressa."
3. Onboarding: "Oi [NOME], bem-vinda ao seu espaço no Clube Ancestral. Para começar, preciso de: [LISTA]. Pode enviar quando tiver."
4. Pós-entrega: "Oi [NOME], seu relatório foi entregue. Espero que a família aproveite cada descoberta."
5. Proposta recusada: "Entendo, [NOME]. É uma decisão importante e o momento precisa ser o certo. Fico à disposição."

### Não feito (fora deste corte)

- Levar a triagem da Discovery ao caso no handoff (linha, geração, localidades,
  autorização de pesquisa) — próximo corte do plano.
- Prova autenticada da Proprietária (prints) — `NAO_LOCALIZADO`.

Testes: `crm-vivo-roteiro-mestre-2026-09-28.test.ts`,
`mesa-discovery-viva-2026-09-27.test.ts`.
