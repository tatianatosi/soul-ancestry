# Mapa do que já funciona no Desk — base para o Desk visual leve

- Data: 2026-09-13
- Natureza: levantamento somente leitura. Nenhum código, rota, tabela, RLS ou gate foi alterado.
- Origem: varredura das ~70 rotas em `src/routes/_authenticated/`, de `src/lib/*.functions.ts` / `*.server.ts` e do kit visual `src/components/clube-ancestral-kit/`.
- Navegação vigente: 6 grupos em `src/lib/navegacao-desk.ts:79-90` (`hoje`, `comercial`, `casos`, `pesquisa`, `contratos`, `governanca`). Este mapa não cria aba nova.

## 1. Resumo

| Camada | Situação |
|---|---|
| Escritores reais (insert/update/upsert/delete) | 71 arquivos em `src/lib` |
| Leitores reais (`.from(...)`) | 108 arquivos em `src/lib` |
| Kit visual | 100% apresentação — nenhum arquivo do kit importa Supabase, `useQuery` ou `.functions` |
| Ponte kit ↔ dado real | 5 componentes "conectados" em `src/components/desk` e `src/components/crm` |

Conclusão operacional: **o motor existe e grava**. O que falta ao "Desk visual leve" não é backend novo, é envelopar as telas do kit em wrappers conectados (padrão já provado em `kit-conectado.tsx`).

## 2. Funcionalidades executáveis por grupo (com escritor confirmado)

| Grupo | Rota | Escritor real (`src/lib`) |
|---|---|---|
| comercial | `/leads` | `crm-desk.functions.ts` |
| comercial | `/calls`, `/crm-mestre`, `/conversao` | `crm.functions.ts`, `crm-fluxo.functions.ts`, `conversao.functions.ts`, `handoff-discovery.functions.ts` |
| casos | `/casos/$caseId` | `caso-ficha.functions.ts` (leitura), `pesquisa-cadeia.functions.ts` (escrita) |
| casos | `/casos` | `caso-busca.functions.ts`, `caso-canonico.functions.ts`, `abrir-caso-operacional.functions.ts` |
| casos | `/nucleos-duplicidades`, `/nucleos` | `nucleo-duplicidade.functions.ts`, `nucleos-desk.functions.ts` |
| casos | `/tarefas`, `/proximas-acoes` | `tarefa-garantida.server.ts`, `painel-hoje-acoes.functions.ts` |
| pesquisa | `/achados/$caseId` | `achados-genealogicos.functions.ts` |
| pesquisa | `/biblioteca-evidencias/$caseId`, `/microentregas` | `biblioteca-evidencias.functions.ts` |
| pesquisa | `/biblioteca` | `biblioteca-mestre.functions.ts` |
| pesquisa | `/pesquisa-evidencias/$caseId` | `documentos-solicitacoes.functions.ts`, `pesquisa-cadeia.functions.ts` |
| pesquisa | `/pessoas-linhagens/$caseId` | `pessoas-linhagens.functions.ts` |
| pesquisa | `/plano-acao/$caseId` | `plano-acao-pesquisa.functions.ts` |
| pesquisa | `/relatorios-fase/$caseId` | `relatorios-fase.functions.ts` |
| pesquisa | `/fontes-genealogicas` | `fontes-genealogicas.functions.ts` |
| contratos | `/contratos`, `/contrato-parametros` | `contratos.functions.ts`, `contrato-parametros.functions.ts`, `contrato-preparar.functions.ts`, `instrumentos-preparacao.functions.ts` |
| contratos | `/ordens-servico`, `/financeiro`, `/propostas` | `comercial.functions.ts`, `cadeia-formalizacao.server.ts` |
| contratos | `governanca/modelo-familiar-casal`, `modelo-individual` | `modelo-familiar-casal.functions.ts`, `modelo-individual.functions.ts` |
| governanca | `/equipe`, `/integracoes`, `/importacoes`, `/qualidade` | `equipe.functions.ts`, `integracoes.functions.ts`, `migracao.functions.ts`, `qualidade.functions.ts`, `governanca.functions.ts` |
| hoje | `/painel`, `/alertas` | `caso-ficha.functions.ts`, `painel-hoje-acoes.functions.ts`, `desk-canonico.functions.ts` |
| portal | `/acessos-portal`, `/atendimento` | `portal.functions.ts`, `portal-cliente.*`, `portal-atendimento.functions.ts` |

Rotas cujo import de topo não cita `lib` usam o padrão compartilhado `src/components/saas/entidade-crud` + `src/components/comercial/base.tsx:1-11`, que chama as `.functions` por dentro — não são casca.

## 3. Kit visual: o que já recebe dado real

Conectados (padrão a replicar):

| Wrapper | Kit usado | Fonte real |
|---|---|---|
| `src/components/desk/kit-conectado.tsx:28-30` | `ResumoKitCaso`, `NucleoKitPessoa`, `FilaKitMicroentregas` | `caso-ficha.functions`, `pessoa.functions`, `biblioteca-evidencias.functions` |
| `src/components/desk/matriz-prioridades-conectada.tsx` | `MatrizPrioridadeNominal` | motor canônico de priorização |
| `src/components/desk/radar-interno-integrado.tsx` | `RadarIndividualOperacional` | `crm_casos` + `radarInternoDoCaso` |
| `src/components/crm/painel-calls.tsx` | gráficos do kit | CRM real |
| `src/components/pesquisa/fontes-documentos.tsx` | blocos de conteúdo | fontes/documentos reais |

Ainda sem ponte (templates prontos, dado não ligado): `HojeTemplate`, `ComercialTemplate`, `PesquisaBibliotecaTemplate`, `FormalizacaoFinanceiroTemplate`, `GovernancaTemplate` em `src/components/clube-ancestral-kit/superficies-desk.tsx`.

`preview-fixtures.ts:1-11` é dado fictício declarado e não deve entrar em rota operacional.

## 4. Travas e bloqueios — inventário (nada removido aqui)

| Trava | Arquivo | Pode afrouxar? |
|---|---|---|
| 9 gates de fechamento de caso | `src/lib/fechamento-caso.functions.ts:16` | Sim, como "informa, não impede", conforme `politica-autoridade-operacional.md` |
| 7 requisitos de ativação da ficha | `src/lib/gates-ativacao-ficha.ts:1-6,29-36,55-62` | Sim, para a proprietária (pendência informativa) |
| 10 ações gateadas + 16 gates de formalização | `src/lib/gates-formalizacao.ts:11-20,41-58` | Parcial — ver linha seguinte |
| Teto de avanço interno (assinatura, financeiro, portal) | `src/lib/gates-override.ts:35-49` | **Não.** Dependem de confirmação externa real |
| Override auditado da proprietária | `src/lib/gates-override.ts:15-28` | Já existe; usar em vez de remover gate |
| 5 gates do piloto (A–E) | `src/lib/gates-piloto.ts:14-18+` | Sim |
| Estados seguros do App Cliente | `src/lib/app-cliente-gate.ts:12-25` | **Não.** Sanitização do cliente |
| `RAISE EXCEPTION` em funções PL/pgSQL | `supabase/migrations/2026*.sql` (ex.: `20260816204130_*.sql:472-473`) | Caso a caso; identidade + organização ativa permanecem |
| `adminOnly` no menu | `src/lib/navegacao-desk.ts:180` | Só exibição de menu, não é segurança |

Não há RLS do tipo `USING (false)`. Gates cerimoniais já foram retirados do menu (`src/lib/navegacao-desk.ts:214-236`).

## 5. Caminho sugerido para o Desk visual leve

1. Ligar os 5 templates de superfície do kit aos escritores/leitores da tabela da seção 2, repetindo o padrão de `kit-conectado.tsx`.
2. Converter gates da seção 4 marcados "Sim" em aviso informativo com override auditado, mantendo os três "Não".
3. Manter 6 grupos e 7 abas do App Cliente. Sem tabela nova, sem entidade paralela.
4. Prova autenticada da proprietária (inicial, ação, confirmação, releitura, integração) antes de declarar qualquer item `COMPROVADO_EM_USO`.

## 6. Limites desta passada

- Classificação literal LEITURA_REAL / ESCRITA_REAL / CASCA por rota individual não foi fechada para as ~70 rotas; a inferência usa imports e o padrão compartilhado.
- Tabela-alvo exata de cada escritor não foi extraída um a um.
- RLS viva no banco não foi consultada; a leitura é das migrations versionadas.

## 7. Atualização 2026-09-14 — 5 superfícies do kit conectadas a dados reais

A seção "Ainda sem ponte" ficou obsoleta. As cinco superfícies do kit foram ligadas ao eixo `crm_casos` com autenticação e escopo de organização:

| Superfície | Rota | Componente conectado | Leitura real |
|---|---|---|---|
| Hoje | `/painel` | `HojeConectado` | casos da org, prazos vencidos, sem próxima ação/responsável |
| Comercial | `/calls` | `ComercialConectado` | funil real de leads + casos |
| Pesquisa/Biblioteca | `/biblioteca` | `PesquisaConectada` | evidências, publicações, microentregas |
| Formalização & Financeiro | `/contratos` | `FormalizacaoConectada` | contratos, faturas, sinais de formalização |
| Governança | `/configuracoes` | `GovernancaConectada` | audit_logs, equipe, indicadores de governança |

Implementação:
- `src/lib/kit-superficies.functions.ts` — server function com `requireSupabaseAuth`, organização ativa via `organization_members`, casos não arquivados e sem demo; contagens tolerantes de `leads`, `evidences`, `app_projections`, `invoices`, `audit_logs`.
- `src/components/desk/superficies-kit-conectadas.tsx` — cinco wrappers com estados de carregando/erro/vazio explícitos.

Radar Interno (`/qualidade`):
- Matriz usa `MatrizPrioridadeNominal` com casos reais nomeados via `matriz-prioridades-conectada.tsx`.
- Radar individual usa `RadarIndividualOperacional` com contexto real: status, prioridade, urgência, elegibilidade, responsável, prazo, próxima ação e bloqueios (`radar-interno-integrado.tsx`).

Sem tabelas novas, sem RLS nova, sem eixo paralelo. Nada foi declarado `COMPROVADO_EM_USO`: falta a prova autenticada da proprietária (conta de teste atual não tem acesso de equipe).
