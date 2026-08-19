# Mapa de Rotas, Componentes e Domínios v1.0

**Data:** 2026-08-19

## Camadas de entrada

| Camada | Caminhos confirmados |
|---|---|
| Inicialização | `src/router.tsx` (`3423d598`), `src/server.ts` (`20500c7f`), `src/start.ts` (`20864274`) |
| Rotas públicas | `index.tsx`, `acesso.tsx`, `auth.tsx`, `acesso.confirmar.tsx`, `acesso.sem-permissao.tsx`, `canvas.$token.tsx`, `devolutiva.tsx`, `studio-devolutivas.tsx` |
| Rotas autenticadas | `src/routes/_authenticated/route.tsx` (`198df3de`) e rotas de domínio |

## Mapa funcional

| Domínio | Rotas/componentes principais | Estado técnico verificável | Dependência a confirmar |
|---|---|---|---|
| Cliente / Canvas | `canvas.$token.tsx`, `cliente-app.tsx` (`c624c57d`), `entrega-consultiva.tsx` (`74c12ec7`) | Interface de cliente e entrega consultiva presentes | Token, dados de caso, sanitização e RLS |
| Desk | `desk-app.tsx` (`f498dbde`) | Desk principal presente | Estado, chamadas e subdomínios |
| CRM | `desk-crm.tsx` (`e12235e4`), `clientes.tsx`, `leads.tsx`, `casos.index.tsx` | CRM e gestão de casos presentes | Fonte de dados, permissões, status e logs |
| Go-live / onboarding | `desk-go-live.tsx` (`6f091f84`), `onboarding.$id.tsx` (`6d72862b`) | Módulos de ativação e onboarding presentes | Gates, dados familiares e persistência |
| Propostas | `propostas.tsx` (`ea35e790`), `src/data/propostas.ts` | Fluxo de proposta e dado local presentes | Versão, arquivamento, pré-carga e fonte comercial |
| Contratos | `casos.$caseId.contrato.preparar.tsx` (`9da78f70`), `contratos.$id.tsx` (`42441dc5`), `contrato-parametros.$id.tsx` (`57b71b12`), `kit-contratual.tsx` | Preparação, parâmetros e visualização presentes | Dados obrigatórios, versão jurídica e correção P0 |
| Financeiro / despesas | `financeiro.tsx` (`0a01542e`) | Módulo financeiro presente | Modelo de despesa, aprovação, Asaas e auditoria |
| Pesquisa | `pesquisa.index.tsx`, `pesquisa.$id.tsx`, `pesquisa-modulo.*` | Rotas de pesquisa presentes | Evidências, fontes e permissões |
| Governança e auditoria | `governanca.decisoes.tsx`, `governanca.inventario-recuperacao.tsx`, `auditoria.tsx`, `qualidade.tsx`, `ops-excecoes.tsx` | Módulos presentes | Persistência de decisões e exceções |
| Operação | `ops.tsx`, `ordens-servico.tsx`, `tarefas.tsx`, `atendimento.tsx`, `evidencias.tsx` | Rotas operacionais presentes | Sistema oficial e integração de tarefas |
| Privacidade / acessos | `privacidade.*`, `acessos-portal.tsx`, rotas de equipe e acesso | Camada de acesso presente | RLS, perfis, consentimento e ambiente |

## Componentes com prioridade de decomposição

| Caminho | SHA | Tamanho | Ação recomendada |
|---|---:|---:|---|
| `src/components/desk-app.tsx` | `f498dbde1df11d085885414392046ff4586770d6` | 77.567 B | Identificar subdomínios, stores, dados e ações |
| `src/components/cliente-app.tsx` | `c624c57da9420145c42b63c28b18d367da44f5ec` | 59.654 B | Separar jornada, documentos, entregas e conta |
| `src/routes/_authenticated/contratos.$id.tsx` | `42441dc57568e870c159863c73b71646664d1607` | 36.580 B | Extrair lógica de domínio e validações |
| `src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx` | `9da78f70b52cddda3087219429b7668800b6b48c` | 23.955 B | Converter gates em serviço/testes |
| `src/routes/_authenticated/propostas.tsx` | `ea35e790c96bfc56ad2ba8e19162de6be25b48e8` | 23.107 B | Isolar estados de proposta e precedência |
| `src/routes/_authenticated/financeiro.tsx` | `0a01542ed0d50f1befda33132aad794b8a975dcd` | 21.168 B | Separar cálculo, autorização e apresentação |

## Autenticação e integração

- Guard autenticado: `src/routes/_authenticated/route.tsx` — SHA `198df3deff96b73b7224265c9e19c29ca5e1bc2b`.
- Cliente Supabase browser: `src/integrations/supabase/client.ts` — SHA `8bd3a404d333a3101e267eb206dc5f525e9808f1`.
- Middleware: `src/integrations/supabase/auth-middleware.ts` — SHA `0aefbe67a008727499cd33484d19c5629daabfac`.
- Cliente server: `src/integrations/supabase/client.server.ts` — SHA `30e131bcd0fcf63c7f372b73bcab363f22352647`.
- Tipos gerados: `src/integrations/supabase/types.ts` — SHA `685a4832109e256f7ee5c17cb45b0baba84a0213`.

## Regra de paridade

Este mapa confirma a camada GitHub. O estado Lovable e o estado Vercel devem ser registrados separadamente como `CONFIRMADO`, `DIVERGENTE`, `NAO_CONFIRMADO` ou `LEGADO` após teste de ambiente.
