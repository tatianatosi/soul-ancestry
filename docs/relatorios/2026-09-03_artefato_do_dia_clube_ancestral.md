# Artefato do Dia — Clube Ancestral

```yaml
status: rascunho — registro de encerramento do dia, sem merge autorizado
versão: 1.0
data: 2026-09-03
projeto: Clube Ancestral
classificação: relatório diário / registro de sessão
responsável pela decisão: Proprietária do Clube Ancestral
base normativa: docs/relatorios/2026-09-02_artefato_do_dia_clube_ancestral.md (formato); Política obrigatória —
  Entrega de artefatos e versionamento no GitHub
repositório: tatianatosi/soul-ancestry
fontes/evidências: PRs #64–#69, leitura direta de código, schema real do Supabase (autorizado nesta sessão),
  conversa com a proprietária
documento substituído: nenhum
```

## 1. Objetivo e escopo

Registrar o que foi decidido, corrigido, verificado e ainda está pendente no repositório
`tatianatosi/soul-ancestry` em 03/09/2026. Este artefato é o índice do dia — não substitui nenhuma
das PRs ou documentos individuais citados.

## 2. Contexto

O dia seguiu quatro frentes, todas a pedido explícito da proprietária: (a) mapear se já existe um
perfil único "Pessoa 360" reunindo ficha piloto, genealógica e dados de cliente; (b) varrer o histórico
de prompts nunca executados sobre ficha piloto/genealógica/cliente/CRM Operação Viva; (c) desbloquear
o contrato da Ana Luiza, primeira cliente real, cujo go-live estava atrasado; (d) corrigir, com
evidência de código e banco, achados que a proprietária apontou como errados em documentos que eu
mesmo tinha acabado de escrever no mesmo dia — reforçando o padrão de sempre confrontar prompt/achado
contra código e dado real antes de aceitar como verdade.

## 3. Decisões e regras confirmadas no dia

- **Motor de cadência já existe — correção de um achado meu.** O de-para inicial da PR #67 registrou
  "motor de cadência orientado a evento não existe hoje" como gap real. Estava errado: `src/lib/orquestracao-jornada.ts`
  (CA-OPS-01/02) já implementa a cadeia CRM → Onboarding → Cadência → Microentregas → Alertas → Painel
  Hoje como um único motor, testado e ativo em `/biblioteca-mensagens`. Onboarding e microentregas
  **são** cadência, não conceitos separados — confirmado pela proprietária.
- **Motor de cidadania com poucos dados reais não é gap.** A maior parte dos dados será lançada direto
  na plataforma, não migrada de planilha — números baixos (leads=7, casos=5 etc.) não pedem ação de
  preenchimento.
- **Taxonomia do Planejador de Cidadania — decisão de arquitetura aprovada.** Nenhum novo prefixo de
  caso, produto ou pessoa; `CA-CID-[PAÍS]-[MODELO]-[ANO]-[SEQUÊNCIA]` continua único padrão; `product_catalog`
  é a única fonte operacional de SKU; legado se resolve por alias, nunca por caso novo.
- **Jornada de Vida 360° e Encontros de Linhagem são duas entregas diferentes.** Confirmado pela
  proprietária. Execução de ambas **fica parada** até a revisão da área de pesquisa no layout, feita
  junto com o App Cliente — nenhuma tabela ou código para elas até lá.
- **Nomenclatura "piloto" da Ana precisa convergir para a realidade — decisão tomada, execução pendente.**
  A proprietária escolheu a opção B (mais trabalho): não é só trocar o texto do rótulo, é aposentar a
  trilha separada "Ana é piloto" e fazer o caso dela seguir o fluxo padrão de qualquer caso real.
  Existem pelo menos 3 mecanismos "piloto" a reconciliar (seção 4) — de-para ainda não feito.
- **Indicadores/Operação Viva precisam de uma timeline de conversão.** Pedido novo da proprietária:
  visão de quem virou lead, quem virou cliente e quem não converteu, ao longo do tempo — ainda não
  escopado tecnicamente.

## 4. Achados verificados em código e banco (evidência, não fabricação)

| Achado | Evidência | Estado |
|---|---|---|
| `produto_sku` do contrato vinha de nome estático em `CONVENCOES_PLANEJADOR`, não de `product_catalog` | `planejador-parametros.ts` (antes da correção) | **Corrigido — PR #68** |
| CPF/CEP/UF/telefone sem máscara ou validação em nenhuma tela | Nenhum módulo de validação existia em `src/lib`; pedido de 31/08 (`PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`) nunca implementado | **Corrigido — PR #69** |
| CRM da Ana com CPF vazio e telefone com um dígito faltando | `clientes` (Supabase, consulta direta) | **Corrigido diretamente no banco** (CPF, RG, telefone, estado civil) |
| Ana nunca foi lead de verdade | `leads` tem só uma linha "Ana Luiza (dado de teste)" — fixture, não lead real | Confirma o que a proprietária apontou; considerar no de-para do piloto |
| Registro da Ana já se descreve como "PILOTO REAL" em 3 lugares no banco | `clientes.observacoes`, `crm_casos.selo_interno`, `crm_casos.resumo` | Pendente — depende do de-para da seção 5 |
| Existe pelo menos um 3º mecanismo "piloto" além do que eu já tinha mapeado | `src/components/desk-go-live.tsx` ("Go-live e registro central de casos") lê `CASE_REGISTRY`/`GO_LIVE_CHECKLIST` de `src/data/case-registry.ts` — parece ser o candidato a virar regra geral, não só da Ana | A confirmar no de-para |
| `ANA_ESTADO_REAL.situacaoOperacional` ainda marcado `"NO_GO"` em `corte-vertical.ts` | Não confirmei se algum código trava comportamento real por causa disso | A verificar no de-para |

## 5. Pendência maior do dia: de-para "piloto" → realidade (decidido, não executado)

Mecanismos hoje espalhados, a mapear e reconciliar:

1. **"Piloto real Ana"** — `decisao-ana-canonica.ts`, `piloto-ana.ts`, `corte-vertical.ts`, `gates-piloto.ts`,
   `ciclo-piloto-ana.ts`, rota `/piloto` ("Piloto real — conferir dados").
2. **"Piloto go-live"** — `desk-go-live.tsx` + `case-registry.ts` (`CASE_REGISTRY`, `GO_LIVE_CHECKLIST`) —
   nomeado como módulo novo/central de casos, não só da Ana.
3. Terceiro mecanismo apontado pela proprietária, ainda não identificado com certeza — a confirmar.

Próximo passo: ler os três por completo, decidir qual prevalece como regra geral para todos os casos
(hoje o candidato mais forte é o Go-Live/`case-registry.ts`, por já não ser Ana-específico), e só então
aposentar/reconciliar os demais — sem apagar histórico, sem criar caso novo.

## 6. Pull requests abertas hoje (nenhuma mesclada)

| PR | Título | Tipo |
|---|---|---|
| #64 | Pessoa 360 — conjunto unificado de dados (5 camadas mapeadas) | docs |
| #65 | Levantamento histórico — ficha piloto, genealógica, cliente, CRM vivo | docs |
| #66 | Adiciona "Abrir visão do cliente" no caso e na ficha da pessoa | fix |
| #67 | De-para Motores Unificados CRM Vivo × o que já existe (corrigida em v1.1 pela proprietária) | docs |
| #68 | `produto_sku` confirma SKU ao vivo em `product_catalog` | fix |
| #69 | Máscara/validação reutilizável de CPF, CEP, UF e telefone | feat |

Todas em draft, `tsc`/`vitest`/`vite build` verdes, aguardando teste em preview e autorização explícita
da proprietária para merge — nenhuma foi mesclada de forma autônoma.

## 7. Riscos, limites e itens fora de escopo

- Nenhuma migration foi aplicada hoje. A única escrita direta em produção foi um `UPDATE` em 1 linha
  de `clientes` (CPF, RG, telefone, estado civil da Ana) — dado real, sem ambiguidade, autorizado
  explicitamente.
- Endereço estruturado da Ana (logradouro/número/bairro/cidade/UF/CEP) **não foi preenchido** — o texto
  corrido existe, mas dividir errado é pior que deixar pendente.
- O de-para "piloto → realidade" (seção 5) foi decidido mas não executado — é o maior item em aberto.
- A conta de QA (`qa-tela-a-tela@clubeancestral.test`) criada em sessão anterior ainda não foi usada
  para a auditoria visual tela a tela — segue pendente.
- A timeline de conversão lead→cliente para Indicadores/Operação Viva é pedido novo, ainda sem desenho
  técnico.

## 8. Critérios de aceite deste artefato

- [x] Lista as PRs reais abertas no dia, sem inventar números ou títulos.
- [x] Separa achado verificado em código/banco de pendência ainda não resolvida.
- [x] Registra a correção de um achado errado meu (motor de cadência), não só os da proprietária.
- [x] Registra os limites do próprio trabalho do dia.

## 9. Próximos passos

1. Proprietária testa em preview e decide merge das PRs #64–#69 (nenhuma delas altera dado de produção
   além da correção já aplicada em `clientes`).
2. Ler por completo os 3 mecanismos "piloto" (seção 5), decidir qual prevalece, propor o de-para.
3. Preencher o endereço estruturado da Ana, campo a campo, com a proprietária confirmando cada pedaço.
4. Escopar tecnicamente a timeline de conversão lead→cliente para Indicadores/Operação Viva.
5. Retomar a auditoria visual tela a tela com a conta de QA já criada.
6. Continuar o de-para dos "Motores Unificados CRM Vivo" (PR #67): resolver `product_catalog`/`sku_catalog`,
   ligar o indicador agregado de cadência, centralizar botões do cabeçalho do Caso 360.

---

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
