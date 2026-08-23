# CA-OPS-01 — Orquestração interna de jornada

CRM → Onboarding → Cadência → Microentregas → Alertas → Painel Hoje.

Fonte canônica de regra: `src/lib/orquestracao-jornada.ts` (módulo puro, sem I/O).
Nenhum envio, publicação externa, cobrança, assinatura, integração, migration
ou pesquisa externa é executado ou autorizado por este módulo.

## A. Biblioteca de Mensagens (`/biblioteca-mensagens`)

Fonte de templates governados e contextualizáveis. Não envia. Cada template
declara: `etapa_jornada`, `evento_canonico`, `finalidade`, `canal_previsto`,
`publico_elegivel`, `regra_de_bloqueio`, `vigencia`.
`sugerirTemplate()` devolve sempre `rascunho_interno` ou `sem_template`.

## B. Eventos internos

Eventos já existentes: lead novo, call agendada, call concluída, proposta
enviada, follow-up vencido, aceite verbal, confirmação formal, onboarding
elegível, microentrega aprovada, microentrega publicada, microentrega
atrasada/bloqueada, cadência atenção, cadência crítica.

Ações permitidas (lista fechada): sugerir template vigente; criar/atualizar
tarefa canônica; atribuir responsável e prazo; criar rascunho interno;
recalcular cadência; gerar alerta derivado; abrir objeto canônico.

Ações não autorizadas: enviar WhatsApp/e-mail/SMS, publicar externamente,
assinar, cobrar/pagar, alterar gate, pesquisar externamente, criar integração.

## C. Onboarding

`planejarOnboarding()` reutiliza os gates de `avaliarSituacaoCaso()`. Só com
contrato assinado + pagamento inicial confirmado o plano cria tarefa de
acolhimento, responsável, prazo, próximo marco verificável, rascunho de
boas-vindas e vínculo da primeira microentrega. Nunca ativa caso, cobra,
assina ou envia mensagem.

## D. Microentregas

Estados preservados: rascunho → em revisão → aprovado → publicado → arquivado.
Vínculo obrigatório: caso, fase, responsável, prazo, tarefa/evento de origem e
resumo interno. O resumo sanitizado ao cliente é exigido apenas na publicação
(`vinculoCompleto(v, { paraPublicacao: true })`).
Somente `publicado` projeta conteúdo sanitizado (`entregasParaAppCliente`).
`publicarMicroentrega()` emite evento interno e recalcula cadência, sem envio.

## E. Cadência e alertas

Touchpoint válido responde às quatro perguntas obrigatórias. Touchpoint
inválido não atualiza a cadência: a saúde continua medida pelo último
touchpoint válido. Regra de faixa reutilizada: regular < 10 dias, atenção ≥ 10,
crítico ≥ 14, com espera institucional externa comunicada mantendo regular.
Alertas são derivados e apenas abrem o objeto de origem. Tentativa de
publicação ou comunicação sem condição cumprida é recusada por
`avaliarTentativaSemCondicao()`, que devolve alerta com `criaRegistro: false`
— não cria prazo, tarefa, status ou fonte paralela.

## F. Painel Hoje

Categorias com precedência: vencidos, bloqueio/gate, cadência, ação comercial
pendente, microentrega aguardando revisão/publicação, próximo marco.
`filaPainelHoje()` deduplica por chave canônica: um objeto aparece uma vez.

## G. Assistente

Pode explicar contexto, bloqueio, template aplicável, tarefa, entrega e
cadência. Não pode enviar, publicar, cobrar, assinar, alterar gates, criar
dados sem ação humana ou pesquisar externamente (`assistentePodeExecutar`).

## Lacunas conhecidas

- Persistência dos planos derivados continua a cargo das telas existentes:
  o módulo não grava tarefas nem rascunhos.
- Canal previsto é declaração de destino humano; não há integração de canal.
