# CA-OPS-02 — Fiação Cadência × Mensagens × Alertas

## Painel contextual (Biblioteca de Mensagens)

Componente: `src/components/desk/orquestracao-contextual.tsx`
Renderizado em: `src/routes/_authenticated/biblioteca-mensagens.tsx`, logo após o bloco
"Regras de uso". Acesso restrito ao papel interno já autorizado na rota; o painel
não existe no App Cliente nem no portal.

## Eventos aceitos

Exatamente os eventos canônicos de `EVENTOS_INTERNOS`
(`src/lib/orquestracao-jornada.ts`): `lead_novo`, `call_agendada`, `call_concluida`,
`proposta_enviada`, `followup_vencido`, `aceite_verbal`, `confirmacao_formal`,
`onboarding_elegivel`, `microentrega_aprovada`, `microentrega_publicada`,
`microentrega_atrasada`, `cadencia_atencao`, `cadencia_critica`. Rótulos vêm de
`ROTULO_EVENTO`.

## Como o template vigente é resolvido

O painel chama `executarCadeiaJornada({ hoje, evento, caso_id: "contexto-biblioteca" })`,
que internamente usa `sugerirTemplate` → `selecionarVersaoVigente` (maior versão dentro
da vigência para etapa × canal × evento). O catálogo de referência exibido vem de
`templatesVigentesPorEtapaCanal(hoje)`. Nenhuma regra de resolução é reimplementada no
componente: não há segundo motor de orquestração.

## Preview e cópia manual

- Sem evento selecionado: estado vazio seguro, sem carregar dado de caso.
- Com evento e template vigente: preview interno (título, versão, etapa, canal previsto,
  público elegível, finalidade) e botão de cópia para a área de transferência.
- Com evento e sem template vigente: mensagem "Nenhum modelo vigente aplicável a este
  evento. Nada é sugerido, criado ou enviado."
- Aviso permanente: "Sugestão interna — nenhum envio é realizado pelo sistema."

## Proibições em vigor

O painel não envia WhatsApp, e-mail ou SMS; não cria fila, touchpoint, rascunho
persistido, mensagem, log de uso, log de envio, tarefa, caso, alerta ou evento; não
altera template, status, gate ou dado; não exibe dado de nenhum caso real
(`caso_id` fixo de contexto).

## Lacunas remanescentes do CA-OPS-02

- Fiação da cadência real por caso e alertas derivados persistidos permanece fora deste
  painel (permanece somente na camada de cálculo).
- Templates governados ainda não possuem corpo textual completo; o preview mostra
  metadados e finalidade.
