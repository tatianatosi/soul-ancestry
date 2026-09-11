# Política — Fonte de Verdade de Design e Execução

- Status: aprovado
- Versão: v1.1
- Data: 2026-09-09; adendo operacional 2026-09-10
- Responsável pela decisão: Proprietária do Clube Ancestral
- Fonte: conversa, GitHub, mockup, relatório; memória permanente 2026-09-10
- Substitui: versão anterior do mesmo arquivo
- Superfície para agentes: `AGENTS.md` e `.cursor/rules/clube-ancestral.mdc` (destilado). Texto completo: `MEMORIA-PERMANENTE-CLUBE-ANCESTRAL-2026-09-10.md`.

## Escopo

Esta política define a fonte de verdade para decisões de design e execução no produto Clube Ancestral, assegurando coerência entre a experiência aprovada, os requisitos funcionais, a implementação e a validação operacional.

## Fonte de verdade

1. O mockup ou tela explicitamente aprovado pela Proprietária é a referência visual e comportamental prioritária.
2. As políticas, decisões de arquitetura e contratos validados no repositório são a referência normativa e técnica complementar.
3. O estado persistido e verificável nos sistemas integrados é a referência para dados operacionais; não deve ser substituído por estado simulado quando houver integração aplicável.
4. Em caso de divergência, prevalece a seguinte ordem: decisão explícita e mais recente da Proprietária; política aprovada; arquitetura aprovada; mockup aprovado de **17 páginas**; implementação existente; hipótese de trabalho.
5. O **planejador** é a fonte válida do planejamento operacional ativo (o que está planejado, próxima ação, responsável, atraso, capacidade). Não duplicar estado contraditório da mesma ação.
6. Matriz operacional legada, planilha mestre, DRE e reconciliação antiga do Asaas não são fonte de verdade do presente. O PDF de auditoria de **47 páginas** não redesenha layout no lugar do mockup de **17**, mas **guia conteúdo, estados e indicadores** em conjunto com ele (adendo 2026-09-11). Comparativos “aderente” ≠ aceite sem prova.
7. Esta política não revoga `politica-autoridade-operacional.md` (pendência informa, não impede). Não autoriza redesenhar os 8 grupos do Desk nem as 7 abas canônicas do App Cliente.

## Regras de execução

- Nenhuma tela, fluxo ou comportamento é considerado concluído somente por aparência visual. Deve haver evidência verificável de persistência, integração ou regra de negócio correspondente, quando aplicável.
- Mockups aprovados não autorizam alterações silenciosas em contratos, modelos de dados, permissões, status de caso ou regras jurídicas.
- Alterações que afetem dados, autoridade operacional, visibilidade do cliente, contratos ou validação jurídica exigem revisão das políticas e da arquitetura relacionadas antes da implementação.
- Estado local, dados de demonstração e placeholders devem ser identificados como tal e não podem ser apresentados como produção.
- Toda divergência entre mockup aprovado e implementação deve ser registrada, justificada e submetida à decisão da Proprietária quando alterar comportamento, informação exibida ou prioridade operacional.

## Evidência mínima

Para cada entrega relevante, registrar: objetivo da mudança; fonte de verdade consultada; arquivos e integrações afetados; evidência de persistência ou teste; limitações conhecidas; e decisão necessária, se houver.

## Limites

Esta política não substitui revisão jurídica especializada, requisitos de segurança, controle de acesso, proteção de dados pessoais ou validação de produção. Esses temas continuam sujeitos às políticas e aos responsáveis específicos.

## Próximos passos

- Manter referências cruzadas desta política nas decisões de arquitetura e nos briefings de implementação.
- Exigir evidência visível de backend e persistência em entregas que alterem dados ou fluxos operacionais.
- Revisar esta política sempre que houver mudança na autoridade decisória, nas integrações centrais ou no processo de aprovação.

## Critério de aceite

Uma entrega atende a esta política quando sua fonte de verdade está identificada, a implementação respeita a ordem de precedência definida, eventuais dados simulados estão claramente rotulados e há evidência verificável para os comportamentos que dependem de backend ou regra operacional.
