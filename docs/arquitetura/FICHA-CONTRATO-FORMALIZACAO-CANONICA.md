# Ficha Contrato/Formalização — contrato canônico (Fase 5, 27/09/2026)

```yaml
status: executado (majoritariamente documental — sequência já correta)
fase: 5 de 6 — "Prompt Canônicos: Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Confirmar que `/casos/$caseId/contrato/preparar` já segue a sequência
funcional pedida (escopo aprovado → pendências únicas → partes/representação
→ condição comercial → OS → anexos I–V → revisar prévia → assinatura →
histórico), que o Canva (páginas 1–7) já é fonte mandatória, e que a
reconciliação de contato das partes (Fase 0) está no lugar certo dessa
sequência — sem criar, enviar ou assinar nenhum contrato/cobrança real.

## Canva 1–7 já é fonte mandatória (confirmado, não reconstruído)

`proposal_canva_pages.page_number` tem `CHECK (page_number BETWEEN 1 AND 7)`
(migration `20260819213622`) — o banco já impede gravar uma página fora do
intervalo. `listarPaginasCanva`/`salvarPaginaCanva`
(`src/lib/crm-desk.functions.ts:717-793`) são os únicos leitor/escritor,
usados pelo componente `CompletudeCanva`, já montado no topo do card
"1. Planejador & Comercial" (`casos.$caseId.contrato.preparar.tsx:853`).
Nada a construir aqui.

## Sequência real da tela — já corresponde ao pedido, com um ponto deliberado e anterior

A tela tem duas camadas: (1) **Resumo + Decisão humana**, sempre visíveis,
elevados — decisão explícita da Proprietária de 19/09/2026
("CONTRATO-ANA-LEITURA-EM-UMA-HORA", comentário no próprio código,
linha 106-110 e 161-168); (2) **7 cards colapsáveis**, cada um fechado por
padrão, divididos em dois modos ("Preparar contrato" / "Revisar prévia").
Verificado contra a sequência pedida pelo prompt, item a item:

| Ordem pedida | Onde está hoje | Card/seção |
|---|---|---|
| Escopo aprovado | `EscopoProposta` | Card 1 "Planejador & Comercial" (modo Preparar) |
| Pendências únicas | Checklist operacional pré-contrato (`checklistPreContrato`) + fila única de pendências (`totalPendenciasFicha`, soma checklist+bloqueios+anexos) | Seção sempre aberta, logo após o Resumo — antes de qualquer card |
| Partes/representação | `ReconciliarCpfPartes` + `ReconciliarContatoPartesContrato` (reconciliação pontual) dentro do card 2; `EstruturaFamiliar`/`PainelDependentes` (dado completo de família/representação) no card 4 | Cards 2 e 4 (modo Preparar) |
| Condição comercial | `RegraComercial` | Card 1 "Planejador & Comercial" (modo Preparar) |
| OS | `BloqueioEmissaoOS` dentro de `CadeiaFormalizacao` (proposta aprovada → OS → assinatura) | Card 2 "Formalização & Anexos" (modo Preparar) |
| Anexos I–V | `AnexosIaV`/`AnexosAplicaveis`/`InstanciaDocumental` | Card 2 "Formalização & Anexos" (modo Preparar) |
| Revisar prévia | `MatrizClausulas`, `PainelInstrumentos`, `MatrizJuridicaPreparacao`, geração/congelamento de versão | Cards 3, 5, 6 (modo Revisar) |
| Assinatura | Solicitar assinatura / registrar assinatura externa | Bloco "Decisão humana" (elevado, sempre visível — não um card) |
| Histórico | Auditoria da preparação (`agruparAuditoria`) | Card 7 "Auditoria" (modo Revisar) |

**Achado**: a sequência conceitual já bate, na ordem certa, dentro de cada
modo. A única divergência aparente — "assinatura" aparecer *antes* dos
cards, e não depois de "revisar prévia" — não é um erro de ordem: é a
mesma decisão de 19/09/2026 que elevou Resumo + Decisão Humana (bloqueios,
prévia final, revisão humana e assinatura) para fora dos cards colapsáveis,
exatamente para que a Proprietária veja o essencial sem abrir nada. Mudar
isso desfaria uma decisão de UX já aprovada, para consertar uma
"divergência" que é, na verdade, intencional — o prompt permite reordenar
"só se divergir genuinamente"; aqui não diverge, só está pinado no topo por
decisão anterior. Não reordenado.

## Fase 0 (reconciliação de contato das partes) — no lugar certo

`ReconciliarContatoPartesContrato` (Fase 0 desta mesma leva de execução)
está no card 2 "Formalização & Anexos", junto com `ReconciliarCpfPartes` —
bem antes do card 6 "Prévia & Versões" (onde a prévia é de fato gerada e
revisada). Confirma o requisito "antes de revisar prévia" sem mover nada.

## Endereçamento de duplicação de dado pessoal/endereço — já resolvido pela Fase 0

O mecanismo de reconciliação sem-dedup da Fase 0
(`sincronizarContatoPartesDoCaso`, nome/e-mail/telefone) já cobre a
divergência entre `contract_parties` (snapshot documental) e a Pessoa
Canônica (`clientes`). Endereço (`address`) não está entre os 3 campos
reconciliados na Fase 0 — fica como gap declarado, não construído aqui:
adicionar um 4º campo reconciliável é extensão pequena e segura do mesmo
mecanismo, mas fora do que a Fase 0 já entregou e fora do escopo desta
Fase 5 (que só verifica sequência/posicionamento, não estende a Fase 0).

## O que não foi feito, por proibição explícita do próprio prompt

Nenhum contrato criado, nenhuma prévia final congelada, nenhuma
solicitação de assinatura disparada, nenhuma cobrança gerada — Fase 5 é
verificação de sequência e documentação, não execução de fluxo contratual
real em nenhum caso.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fase5-ficha-contrato-formalizacao-2026-09-27.test.ts`
(CHECK do Canva 1-7, ordem dos cards dentro de cada modo, reconciliação de
Fase 0 antes do card de prévia, nenhum novo writer de contrato/assinatura
introduzido). Suíte completa e `vite build` — ver rodapé do commit.

## Prova Lovable pós-push

1. Em `/casos/$caseId/contrato/preparar`, conferir que "Decisão humana"
   (bloqueios, prévia final, assinatura) continua elevada e sempre visível,
   acima dos cards.
2. Abrir o card "1. Planejador & Comercial" → conferir `EscopoProposta` e
   `RegraComercial` visíveis, e o painel de Canva (páginas 1–7) no topo.
3. Abrir o card "2. Formalização & Anexos" → conferir `CadeiaFormalizacao`
   (com o bloqueio de emissão de OS) antes dos Anexos I–V, e a reconciliação
   de CPF/contato das partes dentro do mesmo card.
4. Trocar para "Revisar prévia" → conferir Cláusulas, Coerência &
   Instrumentos, Prévia & Versões e Auditoria, nessa ordem.
