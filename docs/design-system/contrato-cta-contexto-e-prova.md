# Contrato — CTA, contexto, persistência e prova

**Status:** em revisão  
**Versão:** v1.0  
**Data:** 2026-09-18  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte:** `regras-de-uso.md`; mockups aprovados de App e Desk; decisões da Proprietária; incidentes de persistência, fila, demo e acesso registrados em 18/09/2026.  
**Escopo:** regras obrigatórias para CTAs, navegação contextual, escrita, histórico, fila e prova visual.  
**Premissas:** CTA sem consequência verificável não é funcionalidade; uma ação de escrita não termina no toast.  
**Limites:** não autoriza automação, envio, publicação, cobrança, assinatura, migração ou RLS.

## Contrato de CTA

| Regra | Aplicação obrigatória |
|---|---|
| Um CTA principal por estado | cada card/estado mostra uma ação prioritária; CTAs secundários ficam sob demanda |
| Contexto preservado | rota/ação carrega pessoa/titular quando aplicável, `case_id` e objeto; nunca troca de caso silenciosamente |
| Sem ação fictícia | CTA só aparece se houver rota/função/persistência real; sem capacidade, exibir texto honesto |
| Verbos não se confundem | salvar ≠ publicar; publicar ≠ enviar; enviar ≠ assinar; assinar ≠ cobrar |
| Segurança por estado | ação irreversível exige confirmação; conteúdo interno não ganha CTA de cliente |
| Fonte e consequência | CTA declara origem/destino quando isso for relevante para a decisão |
| Erro recuperável | cada erro informa o que ocorreu, preserva contexto e oferece ação possível, não loop para início |

## Escrita, histórico e fila

Para qualquer ação de escrita, o corte só fica `PROVADO` com:

```text
CTA real → server function → fonte/tabela → releitura → histórico/evento
→ transição de fila/estado → F5 → releitura
```

Toast, estado local, mock, seed, build verde ou documentação não são prova.

## Prova visual

| Prova | Obrigatória |
|---|---|
| rota/URL e sessão/papel, sem expor credenciais | sim |
| desktop | sim para interface |
| 375 px | sim para interface mobile/responsiva |
| vazio e erro | sim quando aplicável |
| F5 | sim para sessão, navegação e escrita |
| fonte/histórico/fila | sim para ação que escreve |
| comparação com mockup | sim para App Cliente e Desk |

## Estados de entrega

```text
DOCUMENTADO = regra existe.
CODIFICADO = alteração existe localmente.
TESTADO = types/testes/build passam.
MESCLADO = está em main.
DEPLOYADO = está no ambiente escolhido.
PROVADO = fluxo, persistência/F5 e visual aplicáveis existem.
ACEITO = Proprietária confirmou.

Somente ACEITO encerra corte.
```
