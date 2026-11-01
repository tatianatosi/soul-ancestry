# Auditoria Financeira: Revisão das 10 Parcelas Familiares no Asaas (Caso Ana Luiza)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:55 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria financeira, revisao de cobranca recorrente e conciliacao de parcelamento
caminho_no_repositorio: docs/relatorios/2026-10-12-auditoria-revisao-parcelas-asaas-ana-luiza.md
fontes:
  - CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md (Configuração Asaas E06)
  - resgate/04_asaas_dre_operacao.md (Doc Configuração 3 Assinaturas)
  - docs/relatorios/2026-10-12-minuta-oficial-contrato-2026-CB-0001.md
escopo: >
  Revisão analítica e conferência das 10 parcelas mensais de R$ 960,00 (ou 3 assinaturas de R$ 320,00)
  programadas no Asaas para a contratação da Cidadania Austríaca §58c (Família Silveira Rodrigues),
  com cálculo de taxas operacionais líquidas, cronograma de vencimentos e regras de cobrança.
premissas:
  - O valor total do contrato é de R$ 9.600,00 fechado para os 3 requerentes adultos.
  - O Asaas atua exclusivamente como gateway financeiro, sem definir escopo jurídico.
criterio_de_aceite: >
  Conferência aritmética exata dos 10 vencimentos;
  análise comparativa entre Cobrança Unificada (R$ 960) vs 3 Assinaturas (R$ 320);
  projeção de recebimento líquido pós-taxas de gateway.
```

---

## 1. Resumo da Estrutura Comercial Aprovada

A contratação familiar do caso `CA-CID-AT-FAM-2026-001` (Ana Luiza, Adair Jr. e Alice) foi formalizada sob as seguintes condições comerciais:

| Parâmetro | Valor Acordado |
|---|---|
| **Valor Total Contratado** | **R$ 9.600,00** |
| **Número de Parcelas** | **10 parcelas mensais** |
| **Valor da Parcela Familiar** | **R$ 960,00 / mês** |
| **Modelagem por Titular** | 3 cotas iguais de **R$ 320,00 / mês** (Ana R$ 320 + Adair R$ 320 + Alice R$ 320) |
| **Início dos Vencimentos** | Outubro de 2026 |
| **Término Previsto** | Julho de 2027 (encerramento automático após a 10ª mensalidade) |

---

## 2. Comparativo: Cobrança Unificada (R$ 960) vs 3 Assinaturas (R$ 320)

No painel do Asaas, você pode estruturar essa emissão de duas maneiras:

### Opção A: Assinatura Familiar Unificada (Recomendada para Envio Imediato)
- **Como Funciona:** Uma única assinatura de **R$ 960,00/mês** no nome de **Ana Luiza Gomes Silveira Rodrigues**, com 10 cobranças.
- **Vantagens:** 
  - Você gera **1 único link** para o WhatsApp da Ana.
  - Ela centraliza o pagamento da família (via Pix ou Cartão).
  - Economia de taxas fixas de transação no Asaas (apenas 1 taxa fixa por mês em vez de 3).
- **Taxa Asaas Estimada:**
  - Se pago via Pix: Taxa de **R$ 1,99** por recebimento (Líquido: **R$ 958,01**).
  - Se pago no Cartão de Crédito (4,99% + R$ 1,29): Taxa de **R$ 49,20** (Líquido: **R$ 910,80**).

---

### Opção B: Três Assinaturas Vinculadas de R$ 320,00 (Modelo do Doc E06)
- **Como Funciona:** 3 assinaturas de **R$ 320,00/mês** emitidas individualmente:
  1. *Assinatura 1:* Ana Luiza (R$ 320 × 10)
  2. *Assinatura 2:* Adair Jr. (R$ 320 × 10)
  3. *Assinatura 3:* Alice (R$ 320 × 10)
- **Vantagens:** Permite que cada titular pague sua própria parte com cartão próprio se não houver centralização financeira familiar.
- **Taxa Asaas Estimada:**
  - Se pago via Pix: 3 × R$ 1,99 = **R$ 5,97** por mês (Líquido: **R$ 954,03**).
  - Se pago no Cartão de Crédito: 3 × (R$ 17,26) = **R$ 51,78** por mês (Líquido: **R$ 908,22**).

---

## 3. Cronograma Oficial dos 10 Vencimentos (Fluxo 2026–2027)

| Parcela | Mês de Competência | Data de Vencimento Sugerida | Valor Familiar | Status no Asaas |
|---|---|---|---|---|
| **01/10** | Outubro / 2026 | 15/10/2026 (ou imediato) | R$ 960,00 | **Aguardando Emissão / Envio** |
| **02/10** | Novembro / 2026 | 15/11/2026 | R$ 960,00 | Agendada automaticamente |
| **03/10** | Dezembro / 2026 | 15/12/2026 | R$ 960,00 | Agendada automaticamente |
| **04/10** | Janeiro / 2027 | 15/01/2027 | R$ 960,00 | Agendada automaticamente |
| **05/10** | Fevereiro / 2027 | 15/02/2027 | R$ 960,00 | Agendada automaticamente |
| **06/10** | Março / 2027 | 15/03/2027 | R$ 960,00 | Agendada automaticamente |
| **07/10** | Abril / 2027 | 15/04/2027 | R$ 960,00 | Agendada automaticamente |
| **08/10** | Maio / 2027 | 15/05/2027 | R$ 960,00 | Agendada automaticamente |
| **09/10** | Junho / 2027 | 15/06/2027 | R$ 960,00 | Agendada automaticamente |
| **10/10** | Julho / 2027 | 15/07/2027 | R$ 960,00 | Encerramento automático |

---

## 4. Regras Críticas de Operação no Asaas

1. **Encerramento Automático:** Ao cadastrar a assinatura no painel do Asaas, marque o campo **"Número máximo de cobranças"** como **10**. Isso evita que o sistema continue cobrando após o pagamento integral dos R$ 9.600.
2. **Notificações Automáticas:** O Asaas já envia lembrete no WhatsApp/E-mail do cliente 3 dias antes do vencimento (D−3), no dia do vencimento e confirmação após o pagamento.
3. **Sem Surpresas de Débito:** Se a cliente cadastrar Cartão de Crédito na primeira parcela, a cobrança da 1ª mensalidade ocorre no ato do cadastro, e as demais ocorrem exatamente nos dias 15 dos meses subsequentes.
