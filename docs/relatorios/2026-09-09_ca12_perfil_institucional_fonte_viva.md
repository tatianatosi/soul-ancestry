# CA12-PERFIL — execução (09/09/2026)

## Achado

Perfil Institucional já era ativo real e vigente (`PERFIL_INSTITUCIONAL` em `contrato-base-consolidado.ts`: razão empresarial, CNPJ, representante legal etc.) e já tinha camada de persistência versionada por organização (`institutional_profiles`, `garantirPerfilInstitucional`, `registrarPerfilInstitucional`, snapshot em `contract_versions`). Dois problemas reais: (1) `lerPerfilInstitucionalPersistido` lia o registro mais recente **sem filtrar por organização** — em multi-tenant devolveria o perfil de qualquer organização, não da sessão chamadora; (2) nenhuma tela chamava essa leitura nem a ação de registro — a tela de preparação de contrato só lia a constante em código, sem confirmar nem oferecer registrar a versão viva daquela organização.

## Alterado

- `perfil-institucional-persistido.functions.ts`: `lerPerfilInstitucionalPersistido` agora filtra por `organization_id` (derivado via `organizacaoDo`, igual a todo escritor do módulo). Nova `garantirPerfilInstitucionalDaSessao` (POST) — deriva a organização no servidor, nunca recebe `organization_id` do cliente.
- `casos.$caseId.contrato.preparar.tsx`: nova consulta + bloco honesto acima de `PerfilInstitucionalBloco` — confirma "fonte viva" quando persistida, ou mostra pendência com botão real para registrar (idempotente).

## Preservado

Nenhum texto jurídico, cláusula, contrato assinado, cobrança ou dado oficial foi tocado. `PerfilInstitucionalBloco`, matriz de cláusulas A–P e toda a leitura estática (`perfilInstitucionalRenderizado`) continuam exatamente como estavam — a mudança só acrescenta a confirmação/ação da camada persistida, sem substituí-la nem criar formulário novo.

## Testes

`ca12-perfil-institucional-fonte-viva.test.ts` (7): `garantirPerfilInstitucional` idempotente por organização (fake client); leitura persistida escopada por `organization_id`; wrapper de sessão nunca aceita `organization_id` do cliente; tela consome a leitura/ação reais e não duplica o componente de perfil. `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (196 arquivos, 1903 testes) e `npx vite build` — limpos.

## SHA

Commit único → main → recovery (registrado após push, ver mensagem de commit).

## Pendência

Nenhuma tela ainda lê o **snapshot** já gravado em `contract_versions.institutional_profile_snapshot` para exibir qual versão institucional está de fato carimbada em cada versão contratual — só confirma que a organização tem uma versão viva persistida. Não bloqueia CA13.
