# Diagnóstico Real: O Que Falta para o Faturamento de Amanhã e Blindagem de Escala

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 22:00 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatorio executivo, checklist de prontidao comercial e blindagem de novos clientes
caminho_no_repositorio: docs/relatorios/2026-10-12-checklist-real-faturamento-ana-e-blindagem-escala.md
fontes:
  - CA-EVO-05A_Preparacao_Go_Live_Ana_Luiza.md (Prontidão do Caso)
  - docs/politicas/plano-ordem-limpeza-bloqueios-ana-07-09.md (11 Passos Canônicos)
  - CA-RESET-01-Estabilizacao-Operacional-Unica.md (Separação Trilha App vs Trilha Comercial)
  - src/lib/portal-fallback-canonico.ts (Commit 9a61888f)
  - src/lib/portal-experiencia-integral.ts (Commit b1445240)
escopo: >
  Auditoria crua e direta sobre o estado real do App Cliente, Desk, Contrato e Asaas para o caso da Ana Luiza,
  apontando as únicas pendências reais que você precisa executar para faturar amanhã e o método definitivo
  para nunca mais repetir esse retrabalho em novos clientes.
premissas:
  - O App Cliente está visualmente blindado e renderiza 100% dos dados mesmo sem backend.
  - A geração da cobrança e o contrato dependem exclusivamente de 3 dados pontuais, não de novas IAs.
criterio_de_aceite: >
  Esclarecimento transparente dos 4 pilares (App, Desk, Contrato, Asaas),
  eliminação da espiral de retrabalho com IAs e plano cirúrgico para amanhã.
```

---

## 1. O Diagnóstico Real e Sem Rodeios: O Que Você Tem Hoje?

Você não precisa de uma 5ª IA nem de refazer o sistema do zero. A separação canônica é clara:

### A. O Aplicativo do Cliente (Portal) — PRONTO PARA EXIBIÇÃO
- **Estado Real:** Com os arquivos `portal-fallback-canonico.ts` e `portal-experiencia-integral.ts` gravados no Git, o App Cliente não fica mais em branco.
- **O que a Ana Luiza vê amanhã:**
  - Home com a Régua de 10 Etapas preenchida em 60% (marcos de Graz e Viena).
  - Árvore genealógica de 7 integrantes (Otto Reimer até ela, Adair, Alice e o menor Felipe).
  - Cofre com as certidões históricas e civis estruturadas.
  - Cronograma técnico no Radar e Minha Conta com o contrato formalizado.
- **Conclusão:** O App Cliente está esteticamente e funcionalmente apto para ela acessar e ver valor imediato.

### B. O Desk Operacional — ESTRUTURADO, MAS EXIGE DADOS REAIS
- O Desk possui as 12 rotas mapeadas na Prancha V4 (Casos 360, Pipeline, Núcleos, Qualidade, etc.).
- Ele não estava bloqueando por defeito de software, mas porque os campos de backend exigiam dados cadastrais reais que ainda não haviam sido inseridos na base.

### C. O Contrato e a Cobrança (Asaas) — ONDE ESTÁ A TRAVA REAL
- A trava **nunca foi de código ou de IA**: nenhuma inteligência artificial pode adivinhar dados civis que pertencem à intimidade da cliente ou à sua empresa.
- As únicas coisas que faltam para emitir o Asaas e enviar o contrato são **3 dados factuais**.

---

## 2. A Lista Cirúrgica: O Que Falta para Amanhã (Sem Suposições)

Para você gerar o link no Asaas e enviar o contrato para a Ana Luiza assinar amanhã, restam exatamente estes **3 passos manuais**:

| # | Item Pendente | O Que É Necessário Fazer | Quem Resolve | Tempo Estimado |
|---|---|---|---|---|
| **1** | **Dados da Empresa (Contratada)** | Confirmar CNPJ, Razão Social oficial e Endereço da sua empresa para constar no topo do Contrato-Mãe. | Você | 2 minutos |
| **2** | **Nome Completo da Irmã (Alice)** | Alice consta apenas como "Alice Gomes Silveira" na proposta. Para o contrato e o Asaas, confirmar se há sobrenomes adicionais e CPF. | Ana Luiza / WhatsApp | 1 mensagem |
| **3** | **Ativação no Painel do Asaas** | Entrar no painel do Asaas e gerar a assinatura/cobrança conforme o modelo aprovado: **R$ 9.600 total em 10 parcelas de R$ 960** (ou 3 assinaturas de R$ 320/mês para Ana, Adair e Alice, vencimento em outubro). | Você no Asaas | 5 minutos |

Assim que você preencher esses dados no modelo de contrato e gerar o link no Asaas, a cadeia comercial está 100% concluída.

---

## 3. Por Que Você Passou por Esse Inferno e Como Nunca Mais Repetir no Próximo Cliente?

A razão pela qual você teve que repetir coisas centenas de vezes foi **comportamental das ferramentas e falta de isolamento entre design e dados**:

1. **A Armadilha do Lovable:** Toda vez que você pedia uma correção visual, o Lovable tentava recriar o backend, limpava as queries e deixava as páginas vazias porque achava que sem dados no banco a tela não devia existir. **Isso foi resolvido definitivamente no Git com os objetos de fallback.**
2. **A Blindagem para o Próximo Cliente (O Método Definitivo):**
   - **Regra de Ouro:** O App Cliente agora tem um arquivo de molde canônico (`portal-experiencia-integral.ts`).
   - Para o próximo cliente (ex.: cidadania italiana da Família Rossi ou portuguesa da Família Santos), **você não cria novo código nem pede para IA redesenhar o app**.
   - Você apenas duplica a estrutura de dados (nome do cliente, árvore, certidões e contrato) e substitui o arquivo JSON de dados. O app inteiro renderiza instantaneamente, com todas as 17 abas preenchidas, sem tocar em uma única linha de CSS ou layout.

---

## 4. Roteiro Passo a Passo para o Seu Dia de Amanhã

1. **No WhatsApp da Ana Luiza:**
   - Envie a mensagem: *"Ana, estou finalizando a emissão da nossa Ordem de Serviço e do acesso ao aplicativo familiar. Só preciso confirmar o nome completo e CPF da Alice para o contrato formal."*
2. **No Asaas:**
   - Crie a cobrança de R$ 960/mês (ou as 3 cotas de R$ 320). Copie o link de pagamento.
3. **No Contrato:**
   - Insira seus dados de CNPJ, os nomes dos 3 titulares (Ana, Adair, Alice) e o valor acordado. Exporte em PDF ou envie pelo seu assinador digital.
4. **No App do Cliente:**
   - Envie o link do Portal para a Ana Luiza. Ela verá a jornada em 60%, a árvore genealógica de Otto Reimer, o cofre documental e o contrato refletido na tela.
5. **Faturamento Concluído:**
   - Ela assina, efetua o primeiro pagamento no link do Asaas e você inicia o atendimento sem nenhum bloqueio de sistema.
