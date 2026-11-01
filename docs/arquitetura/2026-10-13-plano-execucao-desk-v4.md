# Plano de Execução e Próximos Passos: Desk Intelligence V4 (Prancha V4)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 09:25 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: plano de execucao tecnica, roteiro sequencial e governanca desk v4
caminho_no_repositorio: docs/arquitetura/2026-10-13-plano-execucao-desk-v4.md
fontes:
  - CA-CONN-01 (Conectar Base Existente ao Desk Intelligence)
  - docs/arquitetura/2026-10-13-resolucao-marco-1895-e-alinhamento-desk-v4.md
  - Prancha V4 Desk Intelligence
escopo: >
  Definição detalhada dos próximos passos operacionais e técnicos para a evolução
  do Caso 360 alinhado à Prancha V4, respeitando o princípio de não duplicação de bases.
premissas:
  - O Caso 360 permanece como o painel canônico e exclusivo de trabalho interno;
  - Desk e App consomem o mesmo repositório de dados sem criar tabelas paralelas;
  - A execução se inicia pela Visão Geral / Cabeçalho do Caso 360.
criterio_de_aceite: >
  Roteiro em 3 etapas sequenciais com checklist de verificação de não regressão
  e critérios de entrega para cada prancha do Desk V4.
```

---

## 1. Roteiro Sequencial de Execução no Desk V4

Conforme definido na governança do Clube Ancestral, os próximos passos do Desk V4 são executados de forma modular e incremental [file:287]:

```text
┌────────────────────────────────────────────────────────┐
│  PASSO 1: Visão Geral / Cabeçalho 360 (Prancha V4)     │ ◄── [FOCO IMEDIATO]
├────────────────────────────────────────────────────────┤
│  PASSO 2: Aba Documentos, Evidências e Acervo          │
├────────────────────────────────────────────────────────┤
│  PASSO 3: Aba Genealogia e Linhagem Canônica (8 Elos)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Detalhamento dos Próximos Passos

### Passo 1 — Visão Geral e Cabeçalho do Caso 360 (Foco Imediato)
- **Objetivo:** Adequar a identidade visual e os controles executivos do topo do painel à Prancha V4 [file:287].
- **Itens de Implementação:**
  1. **Metadados Canônicos:** Exibir o ID unificado (`CA-CID-AT-FAM-2026-001`), o selo formal de **"Projeto Familiar"** e a titularidade de Ana Luiza Silveira [file:287].
  2. **Régua das 5 Etapas Factuais:** Renderizar a barra de etapas baseada nos dados reais (sem textos cosméticos; manter Jurídico como *"Em andamento"* até a assinatura Gov.br) [file:287].
  3. **Card Financeiro Integrado:** Exibir a previsão contratual de **R$ 9.600,00** (3 assinaturas de R$ 320/mês × 10 meses) em modo *Rascunho/Acompanhamento*, garantindo que não entre no saldo realizado de caixa [file:287].
  4. **Atalho de Atendimento:** Manter a ponte de comunicação direta via WhatsApp oficial (11 98838-4907) [file:287].

### Passo 2 — Aba Documentos e Evidências Técnicas
- **Objetivo:** Estruturar o receptáculo para os arquivos comprobatórios do caso [file:287].
- **Itens de Implementação:**
  1. Manter os 3 cartões de certidão no estado prudente *"Acervo sob curadoria técnica"* [file:287].
  2. Criar a interface de upload e gestão interna no Desk para receber o *Dossiê Consolidado §58c StbG* e a *Certidão/Registro de Graz 1895 (Otto Reimer)* [file:287].
  3. Desbloquear os botões de "Visualizar" e "Download" no App apenas após a liberação explícita do arquivo no Desk [file:287].

### Passo 3 — Aba Genealogia e Linhas da Linhagem
- **Objetivo:** Sincronizar o genograma interno à nova estética da Prancha V4 [file:287].
- **Itens de Implementação:**
  1. Renderizar os 8 elos canônicos confirmados (Heinrich → Rudolf → Lotte/Otto → Ana Maria → Cleusa Lúcia → Adair Júnior → Ana Luiza + Felipe) [file:287].
  2. Aplicar a estilização dourada de contraste alto (`#A88434`) com nós e linhas de parentesco otimizadas para leitura rápida pelo genealogista [file:287].

---

## 3. Diretrizes de Proteção e Critérios de Aceite

Para autorizar a entrega de cada passo, os seguintes guardrails técnicos são obrigatórios:

- **Não Duplicação:** É proibido criar bases mockadas; o Desk deve ler a mesma camada compartilhada consumida pelo App (`src/data/cases.ts` ou Supabase) [file:287].
- **Não Regressão Visual:** A suíte de testes de UI (A1 a A5) deve continuar passando com 11 de 11 checagens verdes [file:287].
- **Zero Falsa Promessa:** Nenhum carimbo de "Certidão MA 35" ou progresso artificial pode ser injetado [file:287].
