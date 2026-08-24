# CA-PORTAL-02 — Dados vivos e isolamento por caso

## 1. Fonte e transformação por tela

| Tela | Fonte real | Transformação sanitizada |
| --- | --- | --- |
| Jornada | `portal_projecoes` (view security_invoker sobre `app_projections`) | `jornadaSanitizada()` em `src/lib/portal-dados-vivos.ts`: usa `publicacoesParaCliente()` e reaproveita `diasEntre()` + `saudeDoPlano()` de `onboarding-jornada.ts` (mesma régua da equipe, sem recálculo próprio). A saída é apenas um texto humano de ritmo, marcos publicados e a linha do tempo já sanitizada. |
| Radar | `portal_projecoes` + `documents` | `radarSanitizado()`: quatro eixos canônicos de `radar-eixos.ts`. História = publicações do tipo `arvore`/`achado`; Documentos = contagem de liberados e enviados (demo excluído); Estratégia = sempre `in_preparation` (nunca parecer jurídico); Próximos passos = marcos publicados. |
| Árvore | `portal_projecoes` tipo `arvore` | `arvoreSanitizada()`: somente conteúdo publicado e aprovado; nenhuma pessoa/relação/data vem de tabela interna. |
| Documentos | consulta já existente do portal | inalterada; só recebeu a camada de visibilidade no CA-PORTAL-01. |
| Entregas, Fase 01, Fase 02, Legado | — | conteúdo bloqueado; permanece o estado seguro do CA-PORTAL-01. |
| Conta | `portalContexto` | apenas nome do titular e nível de acesso. |

Nada é exibido a partir de `ESCOPO_ANA`, `ESCOPO_JOAO`, mockup, seed ou modelo.

## 2. Bloqueios registrados

Fontes sem policy de portal comprovada no banco (`BLOQUEIOS_CA_PORTAL_02`):

- `public.client_deliverables` — SELECT apenas por `is_org_member(organization_id)`. Entregas da Jornada continua bloqueada.
- Legado — não existe estado `released_to_client` com policy de portal.
- `public.genealogical_person_profiles` — SELECT apenas por `is_org_member`; a Árvore usa exclusivamente a projeção publicada.
- Fase 01 / Fase 02 — sem policy de portal para escopo contratado; seguem apenas com estado de visibilidade. `permiteUpsell` permanece `false`.

## 3. RLS verificada no banco

- `app_proj_select_portal`: exige `destination='app'`, `approval_status='published'`, `archived_at is null`, vigência iniciada, `visibility_scope in ('titular','nucleo')` e `portal_caso_permitido(case_id)`.
- `documents_sel_portal`: exige `portal_minha_org()`, `portal_caso_permitido(case_id)`, `client_id = portal_meu_cliente()` e (`liberado_cliente` ou `origem='cliente'`).
- `portal_caso_permitido(uuid)` é `SECURITY DEFINER` e exige vínculo ativo em `client_portal_access` + `client_portal_case_access`, caso não arquivado, `app_access_status='liberado'` e consentimento ativo.
- As views `portal_casos` e `portal_projecoes` são `security_invoker=true, security_barrier=true`, portanto a RLS do usuário se aplica.

Evidência executada: leitura direta sem sessão de cliente devolveu `0` linhas em `portal_projecoes` e `permission denied` na função de autorização em `portal_casos`. A rota nunca decide autorização no React: o recorte por `casoId` só filtra dentro da lista já autorizada pelo banco.

## 4. Acesso cruzado

Cliente A só enxerga caso B se `portal_caso_permitido(B)` for verdadeiro para o `auth.uid()` de A — o que exige vínculo ativo próprio. Rota, query e função convergem para a mesma função de autorização, então URL de caso B não retorna conteúdo.

Não há duas contas de cliente autorizadas disponíveis nesta sessão: o isolamento entre dois titulares reais **NÃO COMPROVADO NO DOMÍNIO PUBLICADO**.
