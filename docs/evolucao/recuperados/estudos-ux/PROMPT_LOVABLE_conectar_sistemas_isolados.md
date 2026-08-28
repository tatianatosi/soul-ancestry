Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: o quadro comparativo em anexo (Excel) mostra que Biblioteca de Mensagens e Onboarding-Jornada
são dois sistemas reais e maduros que não se conectam, e que a aba "Alertas" (7 módulos catalogados em
desk-modulos.ts) não tem superfície real no menu de produção. Este prompt NÃO cria função nova — só
conecta o que já existe, e investiga o que só existe como descrição no catálogo.

Quando rodar: pós-lançamento. Não bloqueia o go-live.

Modo de execução obrigatório: EXECUTE, com evidência objetiva. Antes de conectar dois sistemas,
confirmar que ambos leem/escrevem a mesma entidade (case_id) e que a conexão não quebra a regra já
existente de "nenhum envio automático" — essa regra fica intacta em qualquer cenário.

Escopo e proibições
- Não implementar nenhum disparo automático de WhatsApp/e-mail — a Biblioteca de Mensagens continua
  exigindo ação manual de uma pessoa para copiar e enviar. Isso não é negociável.
- Não criar abas principais novas.
- Não remover a regra de gates validados no banco (contrato, pagamento, onboarding, entrega) antes de
  liberar uso de qualquer modelo.

────────────────────────────────────────

1. Conectar Onboarding-Jornada à Biblioteca de Mensagens

O componente PainelOnboardingJornada (/ops) já calcula, por caso, os alertas de cadência: bloqueado,
sem próxima ação, sem microentrega planejada, 10+ dias sem touchpoint, 14+ dias sem atualização.

Executar: ao lado de cada alerta na coluna "Alertas internos", adicionar um atalho para o modelo de
mensagem da Biblioteca de Mensagens mais adequado àquele tipo de alerta (ex.: "sem touchpoint 10d" →
modelo de reengajamento). O atalho abre o modelo já pré-preenchido com as variáveis seguras do caso,
pronto para revisão e cópia manual — sem enviar nada sozinho.
Reportar: mapeamento alerta → modelo sugerido, e print do fluxo funcionando em um caso real.

────────────────────────────────────────

2. Trazer os alertas de cadência crítica para o Painel Hoje

Hoje o Painel Hoje tem seu próprio bloco "Sinais de atenção" (GATILHOS, mais genérico), e o Onboarding-
Jornada vive isolado em /ops.

Executar: confirmar se os contadores marcados como alerta:true no Onboarding-Jornada (casos_bloqueados,
sem_proxima_acao, sem_microentrega_planejada, sem_touchpoint_10d, sem_atualizacao_14d) podem alimentar
o mesmo bloco "Sinais de atenção" do Painel Hoje, como uma fonte adicional — sem duplicar o cálculo,
sem remover os GATILHOS existentes. Se a integração for segura, implementar; se não for direta, reportar
o motivo técnico e propor alternativa (ex.: link em destaque do Painel Hoje para o painel de Onboarding-
Jornada).

────────────────────────────────────────

3. Investigar duplicidade: bib-templates-com vs. Biblioteca de Mensagens

O módulo "Templates de comunicação" (bib-templates-com, dentro de /biblioteca) e a rota própria
/biblioteca-mensagens (message-library.functions.ts) parecem ser dois catálogos de modelo de mensagem
não cadastrados juntos.

Executar: confirmar se são a mesma fonte de dado ou dois catálogos distintos. Se forem a mesma fonte
exibida em dois lugares: manter /biblioteca-mensagens como o catálogo oficial (é o mais completo, com
versão/status/log de uso) e trocar o painel bib-templates-com por um link para lá. Se forem dados
realmente diferentes: documentar a diferença e expor com nomes que não confundam "qual é o oficial".

────────────────────────────────────────

4. Resolver a aba Alertas — construir ou aposentar

A aba "Alertas" (7 módulos: achados, microentregas, documentos, ações vencidas, rascunhos, D10/D14,
fila de revisão) está catalogada em desk-modulos.ts como se tivesse destino navegável, mas não existe
no menu real de produção.

Executar:
a) Verificar quanto da lógica de cada um dos 7 já existe em outro lugar (onboarding-jornada, checklist,
   message-library) versus quanto precisaria ser construído do zero.
b) Se a maior parte já existe: propor a aba Alertas como uma VIEW agregadora dessas fontes (sem
   duplicar cálculo), com estimativa do que falta construir.
c) Se pouco existe: reportar como gap real de produto e não como "quase pronto" — para a proprietária
   decidir se vale priorizar.
d) Em qualquer caso, atualizar desk-modulos.ts para refletir o estado real (destino navegável de fato,
   ou marcar explicitamente como "catalogado, sem superfície implementada") — não deixar o catálogo
   sugerindo que existe algo que não existe.

────────────────────────────────────────

Ao final: reportar por item — conectado / investigado com resultado / bloqueado (motivo) — com prints
ou trechos de código como evidência, e a lista de arquivos alterados.
