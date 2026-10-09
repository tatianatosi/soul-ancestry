# Plano de fases — Virada de produção (Fase F)

Versão 1 · 09/10/2026 · fonte: `03-checklist-virada-producao.md` (v1.0, 06/10/2026).
Medido no banco do Lovable (`liiqqibnirnpnvjmjrpj`) e no código em `main`, não em relato.

> A skill `phase-planner` espera `docs/phase-status.md`, `ROADMAP.md` e o rastreador
> `beads`. Nenhum existe neste projeto, e não vou criá-los: o rastreamento aqui é a
> lista de tarefas da sessão e os documentos de `docs/decisoes/`. Este arquivo é o
> plano de fases no formato que o projeto já usa.

## Estado medido hoje

| Item do checklist | Estado real | Evidência |
|---|---|---|
| Fase A — caso, perfis, núcleo | **satisfeita** | 1 caso canônico `CA-CID-AT-FAM-2026-001`; aliases em `codigos_legados`; 1 linha viva por pessoa em `case_members` (as antigas arquivadas); 4 casos vivos na base |
| Fase B — contrato revisado | **satisfeita** | `2026-CB-0001` em `under_human_review`, sem assinatura; condição v2 aprovada, R$ 9.600 |
| Fase C — Asaas | **bloqueada** | sem credencial (nenhuma variável, nada no `.env.example`, nenhum código de integração); 0 faturas e 0 pagamentos no caso |
| Fase E — teste ponta a ponta | **bloqueada** | depende da Fase C |
| Contrato validado e assinado | **pendente de decisão humana** | assinatura é ato externo; o gate existe e não foi forçado |
| Backup e plano de rollback | **não iniciado** | nada medido no repositório sobre isso |

### Estrutura de pagamento — fixada

Confirmada pela Proprietária em 09/10/2026: **três assinaturas mensais de R$ 320 por
responsável** (Ana Luiza, Adair e Alice), durante 10 meses, total R$ 9.600. A leitura
de "10 × R$ 960" presente em material recuperado é **legado**: o total coincide, a
estrutura e o número de pagadores não. Dois módulos afirmavam a estrutura errada e
foram corrigidos (`fila-follow-up-proprietaria.ts`, `corte-vertical.ts`), com teste
que impede a reintrodução.

## Fases, na ordem executável

### F1 — Desbloqueios que só dependem da Proprietária (nada a codificar)

Nenhuma linha de código avança sem estas três respostas:

1. **Data do 1º vencimento.** Sem ela não há cronograma de parcelas — e portanto não
   há Fase C.
2. **Credencial Asaas de sandbox.** Precisa existir como segredo do servidor. Não
   peço, não guardo e não vejo o valor; preciso apenas que exista no ambiente.
3. **Autorização para o ato externo**, quando chegar a hora de criar cobrança real.

Enquanto as três não existirem, F3 e F4 ficam declaradas como bloqueadas — não
"quase prontas".

### F2 — O que é executável agora, sem Asaas e sem decisão nova

Ordem por dependência, não por tamanho:

| # | Item | Por que agora | Risco |
|---|---|---|---|
| F2.1 | Pendências cadastrais reais do caso | são o que impede a assinatura inicial: nascimento de Ana e de Adair, CPF da Alice, Felipe com nome de um só termo e sem Pessoa 360 | baixo; nenhum dado inventado, campo vazio continua vazio |
| F2.2 | Papel da Ana em `case_members` | a linha viva diz `titular`; a arquivada dizia `contratante`. `contract_parties` está correto, então o contrato não está afetado — mas o caso mostra papel incompleto | **decisão sua**: não adivinho papel de pessoa real |
| F2.3 | Consentimento dos 12 leads | todos em `nao_solicitado`; o gate existe e nada o alimenta | **decisão sua**: efeito jurídico/LGPD |
| F2.4 | Planejador Universal — IDs duplicados e `#ERROR!` | o checklist pede isso **antes** de dado vivo | médio: exige medir antes, pode não existir mais |
| F2.5 | Painel OPS com CRM único e sem dado de teste | o filtro de fixtures já existe no código; falta confirmar cobertura | baixo |
| F2.6 | Formulário CRM Diagnóstico — confirmar antes de recriar | o checklist é explícito: confirmar se existe | baixo |

### F3 — Asaas em sandbox (depende de F1 inteira)

Desenho que respeita a estrutura aprovada, **três assinaturas**, não dez cobranças:

1. Mapeamento `cliente Asaas ↔ pessoa pagadora` e `assinatura ↔ responsável`, com
   `asaas_customer_id` e `asaas_subscription_id` guardados por responsável.
2. Três assinaturas de R$ 320, cada uma encerrando após a 10ª cobrança — como o
   `payment_terms` aprovado já descreve. **Não** criar 10 cobranças de R$ 960.
3. Idempotência por responsável: reexecutar não duplica assinatura.
4. Webhook com validação de token, tabela de eventos brutos e atualização de estado
   da parcela; falha gera alerta, nunca perda silenciosa.
5. View de reconciliação: parcelas do caso × cobranças Asaas, listando divergência.
6. Asaas não altera preço, escopo nem elegibilidade — em nenhum caminho.

### F4 — Teste ponta a ponta em sandbox (depende de F3)

Roteiro do checklist, com evidência obrigatória: criar cobrança → simular pagamento →
webhook → parcela paga → financeiro do Desk → App mostra "pagamento confirmado" sem
dado sensível. Sem evidência, o resultado é `FALHOU` ou `BLOQUEADO_*`, nunca "pronto".

### F5 — Virada (último, e só com F2–F4 verdes)

1. Backup antes da virada, com restauração testada — não só o dump.
2. Plano de rollback escrito: voltar para sandbox, com quem decide e em quanto tempo.
3. Troca de chave para produção, primeira cobrança real e webhook de produção
   testado — cada um com autorização explícita sua no momento.

## O que este plano recusa fazer

- Criar `docs/phase-status.md`, `ROADMAP.md` ou beads só porque uma skill genérica os
  espera.
- Tratar material recuperado (`docs/evolucao/recuperados/`) como premissa de
  operação — inclusive o "10 × R$ 960" e a Planilha Mestre.
- Ler a Planilha Mestre em runtime para preencher contrato, mesmo onde um prompt
  antigo manda: a correção canônica de 04/09 e a sua confirmação de hoje prevalecem.
- Chamar de "ativa" uma automação que está apenas documentada — o próprio checklist
  exige validar cada uma.

## Critério de aceite deste plano

Cada fase fecha com: o que foi implementado, em qual camada, quais entidades, qual
evidência, o que falta, bloqueio e próximo passo concreto. Print de homepage, build
verde ou declaração de agente não fecham fase.
