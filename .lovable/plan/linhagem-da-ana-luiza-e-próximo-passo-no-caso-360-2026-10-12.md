# Linhagem da Ana Luiza e próximo passo no Caso 360

## O que já está no banco (conferido agora)
Os 10 vínculos ativos do caso já seguem exatamente esta resposta:
- Heinrich (G6) → Rudolf (G5) → Lotte (G4), casada com Otto (G4)
- Otto e Lotte → Ana Maria (G3) → Cristiane (G2), casada com Adair
- Cristiane e Adair → Ana Luiza
- Cleusa (G3) → Adair
Os vínculos antigos de Ana Maria como mãe de Ana Luiza / esposa de Adair já estão arquivados com motivo. Nada a religar.

## Único ajuste de dados
- No cadastro de pesquisa, Adair e Ana Luiza estão sem geração preenchida (a Árvore do App já os mostra como G2 e G1 pela projeção). Preencher Adair = G2 e Ana Luiza = G1, com nota de autoria da Proprietária, para o Desk e o App lerem a mesma geração.

## Destaque dourado no App
- Manter o destaque reforçado em Otto e Lotte e o destaque da titular Ana Luiza ("Você"). Conferir em 375 e 1280 px, sem overflow; Heinrich e Rudolf sem reforço (nada foi pedido para eles).

## Caso 360 (Desk V4) — próximo corte
Resolver a contradição já encontrada: a barra "Etapas do caso" mostra Jurídico como Concluído, mas o topo diz "Saúde do caso: Bloqueado" porque "Contrato assinado" está pendente no checklist de entrada.
- Fazer a etapa Jurídico (e as demais) considerar também esse checklist: enquanto o contrato não estiver assinado, Jurídico aparece "Em andamento".
- Corrigir o acento em "Formalização" no Caso 360.
- Capturas do Caso 360 da Ana em 375 e 1280 px.

## Fora deste corte
Nenhuma publicação, migração, mudança de permissão ou documento novo. Certidão de Graz e Dossiê continuam dependendo do envio dos PDFs.

## Detalhes técnicos
- `research_people.geracao` para `c1a50000-...-e2` (Adair) e `a11a0000-...-01` (Ana Luiza) via atualização de dados com auditoria.
- `src/lib/etapas-caso.ts`: combinar `case_activation_checks` com o item de contrato do checklist de entrada já lido pelo Caso 360; atualizar o teste em `src/lib/__tests__/etapas-caso.test.ts`.
