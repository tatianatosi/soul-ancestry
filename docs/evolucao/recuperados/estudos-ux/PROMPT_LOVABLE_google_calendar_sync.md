Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Objetivo: sincronização real com Google Calendar, para que o Painel Hoje vire hábito diário — a
proprietária quer checar o Clube Ancestral com a mesma naturalidade que checa o Google Calendar.

Quando rodar: pós-lançamento. É funcionalidade nova, não correção — trate como iniciativa própria,
não encaixe apressado em outro ciclo.

Modo de execução obrigatório: EXECUTE, com evidência objetiva. OAuth com serviço externo é sensível —
não declarar "conectado" sem teste real de ponta a ponta (evento aparecendo de fato no Google Calendar
da proprietária).

────────────────────────────────────────

Escopo desta v1 — decisões já tomadas, não abrir de novo

- Direção única: o produto cria/atualiza eventos no Google Calendar. Nunca lê ou importa nada de volta
  do Google Calendar para o produto.
- Calendário dedicado: os eventos vão para um calendário secundário próprio ("Clube Ancestral —
  Operação"), criado na primeira conexão — nunca no calendário principal da proprietária.
- Fonte dos eventos: reusar exatamente os sinais que já alimentam o Painel Hoje e o Onboarding-Jornada
  (GATILHOS, calcularPrioridade, avaliarCadencia) — não criar novo cálculo de prazo/prioridade.
- Privacidade no título do evento: usar código do caso (ex.: CA-CID-IT-2026-001), nunca nome completo
  do cliente nem dado sensível — o Google Calendar está fora do perímetro de RLS do produto.
- Ativação manual: botão "Conectar Google Calendar" dentro de Modo Proprietária (ou Painel Hoje) —
  nunca automático, nunca para outros papéis além de admin/proprietária nesta v1.

────────────────────────────────────────

1. Autenticação OAuth com Google Calendar API

Executar: implementar fluxo OAuth 2.0 (Google Identity/Calendar API), escopo mínimo necessário
(calendar.events, não calendar completo). Armazenar o refresh token de forma segura (secret do
Supabase/edge function, nunca no client). Criar tela de confirmação antes do primeiro sync, mostrando
exatamente o que vai ser criado (nome do calendário, tipos de evento, exemplo de título sanitizado).

2. Criação do calendário dedicado

Executar: na primeira conexão, criar (via API) o calendário "Clube Ancestral — Operação" na conta
Google da proprietária. Guardar o ID desse calendário para todos os syncs futuros.

3. Sincronização idempotente (sem duplicar evento a cada rodada)

Executar: criar tabela de mapeamento (ex.: calendar_sync_map) associando cada item de origem (ação,
marco, microentrega) ao ID do evento correspondente no Google Calendar. Ao sincronizar: se já existe
mapeamento, atualizar o evento existente (data, status); se não existe, criar e registrar o mapeamento.
Se o item de origem for concluído/cancelado, remover ou marcar o evento como concluído — não deixar
lixo acumulando no calendário.

4. Gatilho de sincronização

Executar: sync automático diário (job agendado, ex.: Supabase cron/edge function) + botão manual
"Sincronizar agora" no Painel Hoje para forçar atualização imediata quando algo muda.

5. Desconexão e revogação

Executar: botão para desconectar, que revoga o token junto ao Google e para de sincronizar — sem
apagar os eventos já criados no calendário da proprietária (ela decide se quer limpar manualmente).

────────────────────────────────────────

Teste de aceite obrigatório (não pode ser marcado concluído sem isto)

Conectar de verdade a conta Google real da proprietária, confirmar que o calendário "Clube Ancestral —
Operação" foi criado, que pelo menos 3 eventos reais (de casos reais ou de teste) aparecem nele com
título sanitizado (código do caso, não nome), e que uma mudança de prazo no produto reflete no mesmo
evento (não cria um novo) na sincronização seguinte. Reportar print do Google Calendar real mostrando
os eventos.

────────────────────────────────────────

Fora de escopo nesta v1 (não implementar agora)

- Sincronização para papéis além de admin/proprietária.
- Leitura de eventos do Google Calendar de volta para o produto.
- Notificações push/e-mail do Google associadas aos eventos (deixar no padrão do Google Calendar da
  própria proprietária, ela configura como quiser).
