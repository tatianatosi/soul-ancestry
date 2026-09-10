# De-para — acesso, governança e migração (28/08/2026)

Este documento audita, com a mesma lente dos de-para anteriores
(`DE-PARA-MATERIAIS-EXTERNOS-2026-08-28.md`), duas frentes abertas nesta
mesma data: o pedido de remoção dos bloqueios de governança (documento
"Prompt de Implementação — Clube Ancestral Completo, Próprio e Operável") e
a migração de banco para um projeto Supabase próprio. Para cada item:
**o que foi pedido**, **o que existe hoje no código/banco** e **é motor ou
é só lista** — a pergunta de sempre.

## 1. Achado que muda o quadro: a autorização já é real

Antes de qualquer remoção de código, uma verificação direta no banco de
produção atual (o de sempre, não o novo) — não em telas, na fonte —
confirmou:

| Verificação | Resultado |
|---|---|
| `auth.users` para tati@pluggedresearch.com | existe, login mais recente confirmado |
| `staff_access` | organização "Clube Ancestral", papel `admin`, status `active`, não arquivado |
| `organization_members` | vínculo ativo com a organização correta |
| `user_roles` | papel `admin` na organização correta |

**Conclusão:** a proprietária já está autorizada, hoje, no banco atual.
Isto não é uma lista de intenção — é motor: é o próprio dado de produção
que decide o acesso, e ele está correto. O sentimento de "não sou
reconhecida" não vem de falta de autorização; vem de uma tela específica
que não consegue *ler* essa autorização (seção 3).

## 2. Pedido: remoção dos bloqueios de governança

**Pedido dela, resumido:** sessão autenticada + vínculo ativo com a
organização + papel `admin`/`owner` deve liberar todo o Desk, sem modo
proprietária, sem reconfirmação de propriedade, sem auditoria, sem
aprovação em lote, sem varredura administrativa como pré-requisito de
salvar. RLS continua sendo a fronteira de segurança real.

### 2.1 O que existe hoje — mapeado, arquivo por arquivo

Uma busca no código confirmou 53 arquivos com referência aos mecanismos de
governança citados. Classificados por função real (não por estarem na
pasta `governanca/`):

**Bloqueio real de trabalho — remoção pedida, ainda não aplicada:**

| Arquivo | O que faz hoje |
|---|---|
| `routes/_authenticated/reconfirmar-propriedade.tsx` + `components/governanca/reconfirmar-propriedade.tsx` | Tela que tenta reconfirmar propriedade; depende da chave de serviço que o Vercel nunca consegue obter do Lovable Cloud (seção 3) — estruturalmente incapaz de funcionar |
| `routes/_authenticated/modo-proprietaria.tsx` + `components/governanca/modo-proprietaria.tsx` | Painel de "capacidades" que exige o mesmo tipo de verificação |
| `routes/_authenticated/governanca.varredura-administracao.tsx` + `components/governanca/varredura-administracao.tsx` | Bloqueios remanescentes + pacote de aprovações em lote |
| `components/governanca/lote-aprovacoes-s01-s05.tsx`, `cobertura-modulos.tsx`, `checklist-lancamento.tsx`, `decisao-proprietaria.tsx`, `varredura-autorizacoes.tsx` | Suporte direto às três telas acima |
| `lib/modo-proprietaria.ts`, `modo-proprietaria.functions.ts`, `modo-proprietaria-cobertura.ts`, `gates-override.ts`, `varredura-administracao.ts`, `checklist-lancamento.ts`, `lote-aprovacoes.ts`, `override-proprietaria-comercial.ts` | Regras que exigem motivo (mínimo 10 caracteres), fonte e registro em `owner_override_events` para ações que já são cobertas por RLS + papel `admin` |
| `components/painel/acoes-rapidas.tsx` (bloco "Ações rápidas da proprietária" no Painel Hoje) | Único ponto onde essa exigência de motivo/fonte hoje aparece fora da pasta `governanca/` — corrigir responsável/prazo/próxima ação em um lead ou caso pede motivo com 10+ caracteres e fonte antes de salvar |

**Referência somente-leitura — não bloqueia nada, mas por pedido dela vai
para uma pasta de arquivo, não para exclusão:**

| Arquivo | Por que não é bloqueio |
|---|---|
| `components/governanca/manifesto.tsx` | "Nenhuma ação é executada aqui" (comentário no próprio código) — biblioteca/resgate, somente leitura |
| `components/governanca/inventario-patrimonial.tsx` | "Apresentação somente-leitura do inventário patrimonial... Nenhuma ação é executada aqui" |
| `components/governanca/anexos-tres-camadas.tsx` | "Apresentação somente-leitura da reconciliação dos Anexos I–V... Nenhuma ação é executada aqui" |
| `components/governanca/varredura-completude.tsx` | Painel de leitura que soma os três acima |
| Demais ~17 rotas `/governanca/*` (decisões, indicadores, matriz de conformidade, modelos contratuais, identificadores etc.) | Documentação/decisão interna consultável — não impedem salvar nada |

### 2.2 Status: motor ou lista?

**É lista, ainda não é motor.** O mapeamento acima está completo e
verificado arquivo por arquivo — isso é trabalho real, não suposição. Mas
a remoção em si **não foi aplicada**: uma tentativa de apagar os arquivos
de bloqueio real foi barrada automaticamente por um classificador de
segurança do próprio ambiente (mudança em massa em código de
autenticação/acesso pede confirmação explícita antes de rodar sem
supervisão direta). Nada foi apagado — o repositório está exatamente como
estava.

**Retomada:** branch `refactor/plataforma-completa-sem-barreiras` já
criada a partir do `main` atual. Trabalho a fazer, nesta ordem: remover as
3 rotas de bloqueio e seus componentes de suporte; simplificar
`corrigirFilaCanonica`/`AcoesRapidasProprietaria` para salvar direto, sem
motivo/fonte obrigatórios; mover as telas somente-leitura para
`docs/arquivados/governanca-removida-2026-08-28/` (por pedido dela: mover,
não apagar); rodar `tsc`/`vitest`/`build`; abrir PR **em rascunho** — sem
merge até ela validar no preview, exatamente como pedido no documento
original.

## 3. Migração para projeto Supabase próprio

**Por que existe:** o projeto atual roda em Lovable Cloud. A chave de
serviço (`service_role`) desse projeto é injetada só em tempo de execução
pelo próprio Lovable e **não pode ser exportada — nem pelo suporte do
Lovable**, confirmado pela própria IA do Lovable em conversa direta com
ela. Por isso a Vercel nunca vai conseguir uma `SUPABASE_SERVICE_ROLE_KEY`
válida para esse projeto, e é isso que deixa `/reconfirmar-propriedade`
estruturalmente quebrada (nunca vai ser um bug de configuração — é um
limite de arquitetura do Lovable Cloud).

**Importante, e já esclarecido para ela diretamente:** este projeto novo
**não é pré-requisito** para ela estar autorizada — ela já está (seção 1).
É um projeto de independência de infraestrutura, não de correção de
acesso.

### Status no momento deste relatório (verificado direto no banco, agora)

| Item | Contagem |
|---|---|
| Funções em `public` | 138 (132 já existiam de trabalho manual anterior; +6 aplicadas nesta sessão) |
| Tabelas em `public` | 0 |
| Views em `public` | 0 |

**É motor, em andamento — não é só lista.** O esquema completo (dump
original de ~29,5 mil linhas) foi reprocessado por um script que:
- separa em declarações completas respeitando blocos `$$...$$` (o defeito
  anterior, que cortava uma função ao meio entre dois arquivos, está
  corrigido);
- reescreve toda `CREATE FUNCTION` → `CREATE OR REPLACE FUNCTION`, toda
  `CREATE TABLE` → `CREATE TABLE IF NOT EXISTS`, toda `CREATE VIEW` →
  `CREATE OR REPLACE VIEW` e move as views para o final (elas não podem
  mais tentar existir antes das tabelas que leem);
- resultado: 56 partes pequenas, cada uma podendo ser reaplicada sem
  medo de duplicar nada.

Aplicação em andamento (56 partes de esquema → dados → usuário → buckets),
sem pedir nenhum clique dela. Tabelas ainda em 0 é esperado nesta etapa da
sequência — as funções vêm primeiro no dump original.

## 4. Resumo — o que responder às perguntas dela

- **"Só quero entrar e ser autorizada no meu próprio app"** — já está
  autorizada, hoje, no banco atual. O projeto novo não muda isso.
- **"Reconfirmar identidade não faz efeito nenhum"** — confirmado e
  esperado: a tela não tem como funcionar (chave inexportável). Está na
  lista de remoção, não de conserto.
- **"Poder absoluto"** — não é o objetivo certo; RLS + papel `admin`
  continuam sendo a segurança real dos dados dos clientes. O que sai é só
  a camada de fricção (motivo obrigatório, auditoria, telas
  intermediárias) que hoje trava o próprio trabalho dela.
