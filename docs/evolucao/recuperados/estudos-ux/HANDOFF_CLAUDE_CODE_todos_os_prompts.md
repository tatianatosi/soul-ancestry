# Handoff — Clube Ancestral (soul-ancestry) — auditoria de produto e prompts pendentes

Contexto: esta é a continuação de uma auditoria extensa do produto Clube Ancestral (Desk Intelligence +
App Cliente), feita por leitura de código (repositório GitHub, exportado como zip ao longo da conversa)
e do domínio publicado. Os 5 prompts abaixo já foram desenhados e validados contra o código real — não
são especulação. Execute-os na ordem, cada um até o fim, com evidência objetiva antes de avançar para o
próximo.

Regras que valem para todos os prompts abaixo, sem exceção:
- Nenhum envio automático de WhatsApp/e-mail — Biblioteca de Mensagens é sempre cópia manual.
- Nenhuma alteração de preço de SKU sem decisão humana explícita.
- `product_catalog` é a única fonte de verdade de preço/produto — nunca duplicar em outra tabela.
- Nenhuma exclusão física de registro — só arquivamento com motivo.
- RLS por organização em qualquer tabela nova.
- Reportar cada item como implementado (com evidência: print, query, trecho de código) ou bloqueado
  (com motivo) — nunca declarar "concluído" sem teste real.

---

## PROMPT 1 — Financeiro/CRM: conciliação de catálogo (rodar primeiro)

Objetivo: Financeiro/CRM como prioridade 1. O mecanismo de reconciliação já existe (product_catalog,
catalogo-fonte-mestre.ts, /conciliacao-catalogo, /divergencias-catalogo com listarDivergenciasCatalogo
e anotarResolucaoDivergencia reais). Não construir nada novo — rodar, verificar e relatar com dado
real.

Não alterar preço de nenhum SKU, não criar SKU novo, não apagar produto.

1. Abrir /conciliacao-catalogo e /divergencias-catalogo com sessão real. Reportar: quantos SKUs em
   product_catalog; quantos no snapshot catalogo-fonte-mestre.ts; quantas divergências por status
   (bloqueio/atenção/resolvidas); para as de "bloqueio", listar SKU + tipo + valor de cada lado (sem
   resolver sozinho).
2. Verificar se há produto fictício/teste em product_catalog (nome/código fora do padrão CA-XXX-000).
   Reportar individualmente, sem arquivar sozinho.
3. Confirmar, com evidência de código, que Propostas (/propostas) e o Portal do cliente
   (/portal/proposta) leem preço sempre de product_catalog.preco_comercial_vigente — nunca de
   catalogo-fonte-mestre.ts diretamente.
4. Levantar se os códigos de SKU seguem convenção única e consistente. Reportar inconsistências sem
   renomear (renomear quebra link Asaas já em uso).

---

## PROMPT 2 — Checkout da Proposta e links Asaas

Contexto: /portal/proposta hoje mostra escopo e condições financeiras, mas não tem nenhum CTA de
pagamento — o funil para no meio. Decisão de estratégia já tomada: Asaas continua como motor de
pagamento real (PIX, boleto, cartão); a experiência ao redor preserva continuidade (não é redirect cru
para uma página genérica).

1. Adicionar CTA de pagamento em /portal/proposta, por condição financeira em aberto, apontando para o
   link Asaas do SKU correspondente — lido de product_catalog, nunca do snapshot.
   Copy: "Continuar para a próxima etapa da sua pesquisa" em vez de "Ir para checkout".
2. Configurar URL de retorno pós-checkout do Asaas (se disponível) para trazer o cliente de volta a
   /portal/proposta ou /portal, com confirmação — não deixar a jornada terminar numa página solta do
   Asaas.
3. Confirmar que a reconciliação Asaas já existente marca fatura como paga e libera o que precisa em
   client_deliverables — sem duplicar lógica, só confirmar o caminho.
4. Para cada SKU ativo com link_asaas preenchido: verificar se o link segue ativo e aponta pro produto/
   preço certo. Reportar links quebrados/desatualizados sem corrigir preço sozinho.

---

## PROMPT 3 — Compêndio: Governança, Métricas e Conexão de Sistemas

Contexto: dois itens de Governança continuam 100% estáticos (Log de decisões e Indicadores — 0 queries
ao banco), e dois elos de sistema ainda faltam conectar.

1. Log de decisões (/governanca/decisoes): criar tabela real (ex.: governanca_decisoes), migrar o
   conteúdo estático como dado inicial, permitir que a equipe adicione decisões pela própria tela
   (papel admin/operações), sem exclusão física.
2. Indicadores (/governanca/indicadores): ligar cada indicador hoje hardcoded (DETALHE_INDICADOR,
   MANIFESTACAO_INDICADOR) à fonte real já existente em /metricas, /conversao, /financeiro ou
   onboarding-jornada. Se não houver fonte real disponível, marcar como "definição, medição não
   implementada" — nunca número fixo como se fosse medição atual.
3. Para Critérios de aceite, Matrizes conceituais, Corte vertical, Inventário e recuperação, Inventário
   patrimonial, Varredura de completude: decisão binária e visível na tela — vira dado real, ou assume
   como documento de referência com aviso ("atualizado manualmente por [papel], última revisão em
   [data]"). Não mexer em Contrato-base nem Módulos contextuais (corretamente estáticos).
4. Biblioteca de Mensagens ↔ Onboarding-Jornada: confirmar que o alerta de cadência (10+ dias sem
   touchpoint, 14+ dias sem atualização etc.) já tem atalho para o modelo certo (via
   fiacao-cadencia-catalogo.ts) — se não tiver, implementar, sempre com cópia manual, nunca envio
   automático.
5. Painel Hoje por papel (pesquisador): adicionar bloco com casos atribuídos com pesquisa pendente
   (mesma fonte de /pesquisa-modulo), condicionado ao papel do usuário logado, sem remover as
   categorias genéricas existentes.

---

## PROMPT 4 — Arcabouco do assistente + princípio de continuidade

1. Assistente Transversal e Assistente de Pesquisa hoje não leem conteúdo de Governança/Biblioteca
   como corpus — só sabem que o grupo existe. Adicionar função de consulta read-only para: Contrato-
   base, Critérios de aceite, Matrizes conceituais, Corte vertical, Inventário, Bases Genealógicas
   (quando existirem). Toda resposta baseada nesse corpus cita fonte/versão, nunca inventa.
2. Aplicar o princípio de continuidade (motor externo faz o trabalho pesado, experiência ao redor não
   quebra) como checklist a cada ponto de saída do produto: checkout (prompt 2), Biblioteca de
   Mensagens → WhatsApp (já correto, só confirmar), Onboarding-Jornada → Biblioteca (já correto, só
   confirmar), publicação de Resumo ao cliente → App (trava de aprovação já existe via
   fn_deliverable_publicacao_guard — confirmar se há sinalização de "algo novo chegou" para o cliente).

---

## PROMPT 5 — CA-05 Fase 0: mapeamento somente-leitura de Bases Genealógicas (sem pressa, não bloqueia nada)

Conforme a seção 16 do documento CA-CA05-Desk-Intelligence-e-Memoria-de-Bases-Genealogicas-2026-08-18-
v1_0.md da proprietária: antes de qualquer prompt de implementação da Memória de Bases Genealógicas,
mapear o que já existe (rotas, tabelas, RLS, funções relacionadas a pesquisa/radar/elegibilidade/
biblioteca/dicionário/assistente interno) contra essa arquitetura, produzindo matriz "existente →
preservar → adaptar → criar → não usar". SOMENTE LEITURA — não alterar banco, UI, RLS, funções ou
dados.

Já confirmado nesta auditoria como ponto de partida: /pesquisa-modulo/$id (PainelPesquisaModulo, 12
abas), /fontes-genealogicas, subárea "Bases Genealógicas" em Biblioteca Mestre, /api/pesquisa-
assistente (streaming, RLS, sem escrita). Verificar contra os 7 pontos do CA-05 (rotas/telas, radar/
elegibilidade interna, assistente de pesquisa, Assistente Transversal, dados/RLS/auditoria, linguagem/
guardrails, pré-requisitos da seção 10.3 do Bloco 5A). Terminar aguardando revisão humana — não propor
implementação nem prazo.

---

Ao final de cada prompt, reporte um resumo de uma linha por item: [IMPLEMENTADO/BLOQUEADO] + evidência.
Só avance para o próximo prompt depois que o atual estiver reportado.
