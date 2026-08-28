Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: /portal/proposta hoje mostra escopo e condições financeiras ao cliente, mas não tem nenhum
CTA de pagamento — o funil para exatamente no momento da compra. Este prompt fecha esse buraco e
resolve a atualização dos links de Asaas.

Quando rodar: junto com o prompt de Financeiro/CRM já enviado (conciliação de catálogo) — dependem da
mesma fonte (product_catalog).

Modo de execução obrigatório: EXECUTE, com evidência objetiva (print da tela, teste de um checkout
real ou de sandbox).

Escopo e proibições
- Não processar pagamento dentro do app — o Asaas continua sendo o motor de pagamento real (PIX,
  boleto, cartão). Isso é só a transição/experiência ao redor do link, não substituição do Asaas.
- Não alterar preço de nenhum SKU.
- Decisão de estratégia já tomada: CTA abre o checkout do Asaas com copy de continuidade de jornada
  (não "ir para checkout" genérico), e o retorno pós-pagamento traz o cliente de volta para dentro do
  app — não para uma página de agradecimento solta do Asaas.

────────────────────────────────────────

1. Adicionar CTA de pagamento em /portal/proposta

Para cada condição financeira com fatura em aberto, adicionar botão de ação que leva ao link de
checkout Asaas correspondente ao SKU/produto daquela condição. O link deve vir de product_catalog
(fonte única), nunca de catalogo-fonte-mestre.ts diretamente (que é só snapshot de referência).

Copy sugerida (ajustar tom conforme o restante do app): "Continuar para a próxima etapa da sua
pesquisa" em vez de "Finalizar compra" ou "Ir para checkout" — mantém a linguagem de jornada, não de
venda.

2. Configurar retorno pós-pagamento

Verificar se o Asaas permite configurar URL de retorno pós-checkout. Se sim: configurar para trazer o
cliente de volta para /portal/proposta ou /portal (com uma mensagem de confirmação), não deixar a
jornada terminar numa página do Asaas sem volta.

3. Confirmar que a confirmação de pagamento já processa corretamente

Verificar se o webhook/rotina de reconciliação Asaas já existente (R1, mencionada no financeiro) marca
a fatura como paga e libera o que precisa ser liberado no client_deliverables/faturas — sem duplicar
lógica nova, só confirmar que o caminho já existe e reportar se falta algo.

4. Atualizar/validar os links de Asaas do catálogo

Para cada SKU ativo em product_catalog com link_asaas preenchido: testar (ou verificar via API do
Asaas, se disponível) se o link ainda está ativo e aponta para o produto certo com o preço vigente
correto. Reportar SKUs com link quebrado, inativo ou desatualizado — sem corrigir preço sozinho, só
reportar para decisão.

────────────────────────────────────────

Ao final: reportar prints da tela de Proposta com o CTA novo, confirmação do fluxo de retorno testado
(ou motivo se não for possível testar em produção), e a lista de links de Asaas validados/quebrados.
