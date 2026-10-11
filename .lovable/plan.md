# Ajustes finais de homologação — Desk V4 e App Cliente

## Objetivo
Corrigir apenas as não-conformidades verificáveis do laudo, preservando as fontes reais, os estados honestos e as sete abas canônicas. O trabalho será feito em rascunho isolado, sem publicação, integração, mudança de schema, RLS, dados, convites ou cobranças.

## Escopo aprovado

### 1. Painel Hoje
- Manter a implementação Go Live que já atende `/painel`; não promover nem alterar o Painel Dia sem rota.
- Remover da navegação lateral o acesso à sessão demo do App Cliente, sem apagar a rota ou os dados de demonstração.
- Reorganizar os quatro cartões executivos no padrão visual Desk V4.
- Usar somente contagens reais já produzidas pelas fontes Go Live e pela próxima ação prioritária existente; nenhum número será preenchido manualmente.

### 2. Caso 360 e Financeiro
- Reposicionar o botão flutuante Assistente para não cobrir a última coluna do heatmap, mantendo o acesso e o comportamento atuais.
- Exibir a grade visual dos cinco indicadores financeiros solicitados na seção Financeiro: Total Contratado, Liquidado, Saldo Aberto, Custos de Busca e Margem Bruta.
- Total Contratado poderá refletir a condição comercial real de R$ 9.600,00. Os demais indicadores usarão somente dados financeiros existentes; sem registros, mostrarão vazio honesto ou indisponibilidade, nunca zero inferido.
- Não criar segunda leitura financeira nem alterar writers, contrato, pagamento ou conciliação.

### 3. Conta do App Cliente
- Apresentar a condição atualmente registrada: R$ 320,00 por mês durante 10 meses, explicitamente como prevista e aguardando confirmação.
- Não afirmar cobrança ativa, pagamento, vínculo Asaas ou titular individual enquanto esses registros não existirem.
- Manter a proteção financeira já existente. Como Adair e Alice ainda não têm acessos ativos nem projeções individualizadas, não haverá simulação de suas sessões.

### 4. Árvore
- Preservar as seis pessoas publicadas nas gerações G3–G7 como nós reais.
- Manter relações e linhas apenas dentro de uma área claramente identificada como exemplo visual, sem associá-las às seis pessoas reais nem inferir parentesco.
- Remover qualquer aparência de que o genograma ilustrativo seja uma relação publicada.
- Continuar mostrando o estado honesto de que as conexões reais dependem de relações aprovadas e publicadas.

### 5. Radar
- Aplicar Ouro Nobre ao gráfico e aos estados mensuráveis.
- Preservar “Lacuna” nas dimensões sem base autorizada; não fabricar percentuais para completar a teia.
- Remover texto técnico ou rótulo de exemplo que não pertença à experiência do cliente, mantendo a explicação humana da ausência de base.

### 6. Governança preservada
- Manter exatamente: Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
- Não alterar nem regenerar `src/integrations/supabase/types.ts`; preservar a RPC financeira e suas chamadas.
- Não tocar no conflito `painel-dia.tsx` × `golive-*`, em schema, RLS, migrations, writers, dados, convites, publicação, contrato ou integrações externas.

## Validação e evidências
- Conferir as rotas afetadas autenticadas no caso CA-CID-AT-FAM-2026-001.
- Validar a tela em 375 e 1280 px, incluindo ausência de sobreposição e overflow horizontal.
- Executar typecheck, testes relevantes e build uma única vez após o corte.
- Gerar capturas antes/depois das superfícies alteradas e um relatório de conformidade por item.
- Registrar separadamente o que continuar não comprovado: login individual de Ana, Adair e Alice, integração Asaas, vínculos genealógicos reais e isolamento A×B.
- Parar no rascunho para aprovação explícita, sem integrar ou publicar.

## Critérios de aceite
- A sessão demo não aparece na lateral de `/painel`.
- Os quatro cartões do Painel usam dados reais e não exibem valores inventados.
- O Assistente não cobre o heatmap em 375 ou 1280 px.
- A grade financeira mostra cinco indicadores com fonte ou vazio honesto.
- Conta não apresenta condição prevista como cobrança confirmada.
- Árvore distingue claramente nós reais de relações ilustrativas.
- Radar usa Ouro Nobre e mantém “Lacuna” sem base.
- O App continua com exatamente sete abas.
