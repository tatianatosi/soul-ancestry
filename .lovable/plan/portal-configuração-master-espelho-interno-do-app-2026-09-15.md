# Portal / Configuração Master + espelho interno do App

Reorganizar a tela de Portal em três blocos analíticos, lendo só o que já está gravado. O App Cliente real não é tocado, nenhum acesso, convite ou publicação é criado nesta etapa.

## Os três blocos

1. **Publicação por estado** — rascunho, em revisão, aprovada, publicada (e arquivada/despublicada listada à parte, nunca apagada), a partir das projeções do caso com autor e data de aprovação/publicação.
2. **Acesso ao portal** — convites autorizados, acesso ativo, revogado e último acesso registrado.
3. **Cobertura do App** — quanto conteúdo publicado existe por aba: Jornada, Radar, Árvore, Documentos, Legado.

Abaixo dos blocos ficam as listas de apoio já existentes (publicado para o cliente, equipe/organização, link para o espelho interno). O espelho continua só leitura de revisão interna.

## Estado real hoje (conferido no banco)

- 1 projeção do caso, situação "rascunho", destino App, visibilidade interna — ainda nada publicado para a cliente.
- 1 acesso de portal ativo, sem último acesso registrado.
- Nenhum e-mail autorizado registrado.

Ou seja: os blocos vão mostrar principalmente estados iniciais e vazios reais — é o retrato correto do piloto, não uma falha.

## Estados vazios

Sem projeção: "Sem itens nesta etapa" + navegação para o Caso 360 (dono da microentrega). Sem acesso/convite: vazio + navegação para a tela de acessos do portal. Aba sem conteúdo publicado: contagem zero declarada, sem gráfico substituto.

## Fontes por bloco

| Bloco | Fonte real | Filtros |
|---|---|---|
| Publicação por estado | projeções do caso (situação, autor, data de aprovação, início de vigência, motivo de arquivamento) | caso canônico, organização, sem registro de teste |
| Acesso ao portal | acessos de portal do titular + e-mails autorizados do caso | titular do caso + caso, sem arquivados |
| Cobertura do App | mesmas projeções publicadas, agrupadas por origem: linhagem → Árvore, evidência/documento → Documentos, achado → Legado, marco/evento/caso → Jornada; Radar sem fonte de projeção fica em zero |
| Listas de apoio | publicações com autor e data, equipe da organização | caso canônico |

## Detalhes técnicos

- `src/lib/golive.functions.ts`: ampliar o mapeamento já existente de `app_projections` (somente leitura) para expor `approval_status`, `approved_by`, `approved_at`, `effective_from`, `archived_at`, `archived_reason`, `projection_type`, `source_entity_type`, `visibility_scope`, `case_id`; incluir também projeções arquivadas/despublicadas numa lista separada (sem alterar `publicados`). Ampliar o mapeamento de `client_portal_access` com `access_status`, `invited_at`/`created_at`, `revoked_at` e `last_authenticated_at` quando as colunas existirem, e de `authorized_portal_emails` com status e data. Nenhuma tabela, migration, RLS ou writer novo.
- `src/lib/golive-portal.ts` (novo, puro): `publicacaoPorEstado`, `acessoAoPortal` (convites, ativo, revogado, último acesso) e `coberturaDoApp` (mapa origem → aba, com as cinco abas sempre presentes), com `agora` injetável.
- `src/lib/golive-portal.test.ts`: estados vazios, despublicada não contada como publicada, aba sem conteúdo em zero, último acesso ausente, revogado versus ativo.
- `src/routes/_authenticated/golive.portal.tsx`: renderizar os três blocos com `Rosca`, `Barras` e `BarrasPercentual`/`Barras` já existentes, preservar as listas e o link do espelho, manter os CTAs de publicação/convite atuais como estão (não criar novos) e usar estado vazio canônico onde não houver fonte.
- Sem alterar `golive.app.tsx` nem qualquer rota do App Cliente real; sem publicar, comitar ou fazer deploy.

## Prova

Rodar testes, verificação de tipos e build; capturar a tela logada em desktop e 375 px e entregar a tabela de fontes com os números observados.
