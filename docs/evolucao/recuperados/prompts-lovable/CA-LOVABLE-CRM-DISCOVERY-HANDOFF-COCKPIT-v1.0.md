# CA-LOVABLE-CRM-DISCOVERY-HANDOFF-COCKPIT-v1.0

## Contexto

Você está trabalhando no CRM/Desk Intelligence do Clube Ancestral. A arquitetura comercial, as fontes canônicas, as regras de conversão, os estados de aceite, a migração interna e os controles de catálogo já existem. **Não reconstrua módulos, não altere schemas e não crie abas globais novas.**

O objetivo deste prompt é concluir e demonstrar a operação diária de CRM: entrada manual de leads, Discovery, handoff e cockpit priorizado. O resultado deve funcionar sobre a arquitetura atual.

## Objetivo

Implementar ou corrigir a experiência operacional em **Comercial → Leads** e **Painel Hoje**, garantindo que a equipe consiga registrar, qualificar, acompanhar e transferir leads sem violar os gates de conversão.

## Escopo obrigatório

### 1. Cadastro manual de lead

Na tela Comercial → Leads, disponibilize uma ação visível **“Novo lead”**.

O formulário inicial deve ser leve e permitir salvar o lead diretamente em Triagem, com:

- Nome completo: obrigatório.
- Telefone ou e-mail: pelo menos um obrigatório.
- Origem: dropdown fechado com indicação, formulário, Instagram, WhatsApp, site, evento e outro.
- Interesse inicial: dropdown fechado, com opção “a confirmar”.
- Responsável: obrigatório.
- Próxima ação: obrigatória.
- Prazo da próxima ação: obrigatório.
- Resumo: texto livre curto.
- Indicado por: opcional.

Ao salvar:

- Gerar ou preservar o padrão de ID `CA-LEAD-AAAA-SEQ`.
- Executar verificação de possível duplicidade por e-mail, telefone e nome.
- Se houver possível duplicidade, mostrar o alerta e permitir que o usuário escolha abrir o registro existente ou continuar somente com justificativa auditável, se esse mecanismo já existir.
- Não copiar fichas externas inteiras para o CRM; manter apenas campos estruturados permitidos e os campos comerciais necessários.

### 2. Discovery e oportunidade disciplinada

Preserve a estrutura existente de Discovery e oportunidade; não crie uma segunda ficha paralela.

Garanta que:

- A oportunidade tenha responsável, próxima ação e prazo em todas as etapas operacionais.
- O resultado de Discovery seja derivado dos dois eixos já existentes.
- Call, perda, proposta, contrato e pagamento continuem com as travas existentes.
- Elegibilidade seja tratada apenas como sinal interno preliminar.
- Interações permaneçam imutáveis e rastreáveis.

### 3. Handoff operacional

Torne visível e operacional a passagem Discovery → oportunidade → handoff, sem avançar automaticamente estados de contrato, cobrança ou onboarding.

A visão do handoff deve deixar claro:

- O que foi confirmado no Discovery.
- O que falta confirmar.
- Responsável atual.
- Próxima ação e prazo.
- Pendências que bloqueiam proposta, formalização e onboarding.
- Histórico de interações e eventos relevantes.

Não introduza novos campos de texto livre além de resumo, narrativa, observações e links internos previstos na arquitetura.

### 4. Cockpit diário e Painel Hoje

No `/painel`, entregue uma lista única de priorização operacional que:

- Ordene por prazo da próxima ação, e nunca por data de criação.
- Destaque atrasos, ações de hoje e próximas ações futuras.
- Mostre área, responsável nominal, etapa e motivo de priorização.
- Permita filtros por área, responsável e etapa comercial.
- Reutilize `listaPrioritaria` de `src/lib/crm-desk.ts` ou o equivalente já existente; não crie uma lógica concorrente.

A lista deve coexistir com as filas já existentes, incluindo ações vencidas, ações de hoje, leads sem responsável, leads sem próxima ação, calls de hoje, propostas sem follow-up, contratos enviados, pagamentos aguardados, onboardings pendentes e documentos aguardados.

### 5. Escada de conversão

Em cada lead, preserve e evidencie a sequência canônica:

```text
Aceite verbal
→ confirmação formal
→ contrato e cobrança
→ onboarding
```

Regras obrigatórias:

- Aceite verbal não cria cliente, não libera contrato, cobrança, assinatura, onboarding, pesquisa externa nem App Cliente.
- Confirmação formal libera apenas a preparação da formalização.
- Contrato e pagamento confirmados são pré-condições para onboarding, junto dos gates existentes.
- Toda transição continua gravando evento imutável.

Use os registros existentes como verificação de regressão:

- João: deve continuar em “aceite verbal — confirmação formal pendente”; contrato e cobrança bloqueados.
- Ana Luiza: deve continuar em “aceite confirmado — formalização pendente”; onboarding bloqueado até os gates aplicáveis.

## Restrições rígidas

- Não criar, alterar ou chamar recursos externos de Asaas, Drive, Placego, CRM OPS, Planilha Mestre ou qualquer serviço externo.
- Não criar cobrança, produto, link de pagamento, assinatura, cliente, contrato, pasta, arquivo, documento, mensagem, e-mail ou comunicação externa.
- Não executar consulta externa, OCR, IA externa, pesquisa nominal externa, solicitação de certidão ou contato com instituição.
- Não publicar conteúdo no App Cliente.
- Não criar nova aba global do Desk; usar apenas a área Comercial, Painel Hoje, rotas e subitens existentes.
- Não alterar a navegação canônica de sete áreas principais.
- Não reconstruir conversão, catálogo, onboarding, casos, núcleos ou pesquisa genealógica já existentes.
- Não realizar migration de banco, salvo se for estritamente necessária para corrigir um defeito comprovado. Se houver necessidade de migration, pare e descreva a justificativa antes de aplicá-la.

## Critérios de aceite

A entrega só está concluída se:

1. O botão “Novo lead” aparece em Comercial → Leads e cria lead em Triagem com os campos mínimos validados.
2. A deduplicação alerta para e-mail, telefone ou nome coincidentes.
3. Não é possível manter oportunidade operável sem responsável, próxima ação e prazo.
4. O Painel Hoje ordena a lista principal por próxima ação/prazo e destaca atrasos.
5. Filtros de área, responsável e etapa funcionam.
6. Discovery, handoff e interações são visualizáveis sem duplicar fichas ou fluxos.
7. João e Ana preservam exatamente os estados e bloqueios previstos.
8. Não há nova aba global, chamada externa ou alteração de fonte externa.
9. Typecheck, build e testes existentes passam; incluir testes de regressão focados nas regras acima quando a infraestrutura de testes já existir.

## Entrega esperada

Ao concluir, responda somente com:

1. Lista de arquivos alterados.
2. Telas/rotas alteradas.
3. Regras preservadas e bloqueios confirmados.
4. Testes executados e resultado.
5. Itens não alterados por estarem fora de escopo.
6. Qualquer pendência real que impeça um critério de aceite.

Não inicie nenhum prompt adicional automaticamente.