# Fase 1 — Mapear sem modificar (Política Unificada de Casos Familiares)

**Data:** 30 de agosto de 2026
**Documento de origem:** `docs/politicas/PROMPT-POLITICA-UNIFICADA-CASOS-FAMILIARES.md`, seção 14, Fase 1.
**Branch:** `feat/politica-unificada-casos-familiares`

## Status honesto

Esta sessão **não tem acesso de consulta ao Supabase real do projeto** (`zsxpdbhdvbuulwpepemd`) no momento em que este documento foi escrito, apesar da proprietária ter autorizado o conector. As únicas ferramentas de banco disponíveis pertencem a uma plataforma diferente (Lovable), não ao projeto do Clube Ancestral — não foram usadas.

Por isso, **nenhum número real de duplicidade foi levantado ainda.** O que segue é o que dá para preparar com segurança sem tocar em dado real: a estrutura pronta para rodar assim que o acesso existir, e o que já se sabe pelo próprio código (não por consulta ao banco).

## O que já está pronto para quando o acesso existir

### 1. Tabela de aliases (aditiva, não aplicada ainda)

`supabase/migrations/20260830233000_case_code_aliases.sql` — cria `case_code_aliases` exatamente como especificado na seção 3 do documento de origem. Não insere nenhuma linha, não altera nenhuma tabela existente, RLS por organização usando os mesmos helpers (`is_org_member`/`can_write`) já usados no resto do produto. Esta migration ainda não foi aplicada ao banco — precisa ser revisada e aplicada pela proprietária (ou por esta sessão, quando o acesso ao Supabase existir).

### 2. Consultas prontas para a matriz de reconciliação (só leitura)

Assim que o acesso ao Supabase existir, estas consultas produzem a matriz pedida na seção 14 (Registro antigo | Entidade | Caso de destino | Ação | Confiança | Observação) sem alterar nada:

```sql
-- Duplicidade por case_code (ou campo equivalente em crm_casos)
select codigo, count(*) as casos, array_agg(id) as case_ids
from public.crm_casos
where archived_at is null
group by codigo
having count(*) > 1;

-- Caso conhecido citado no documento de origem (Ana Luiza)
select id, codigo, titulo, cliente_id, created_at, archived_at
from public.crm_casos
where codigo in ('CA-CID-AT-FAM-2026-001', 'CA-AUT-ANALUIZA-FAM-2026-001')
   or titulo ilike '%ana luiza%';

-- Duplicidade de pessoa por telefone/e-mail em clientes
select telefone, count(*) , array_agg(id) as cliente_ids
from public.clientes
where telefone is not null
group by telefone
having count(*) > 1;

select email, count(*), array_agg(id) as cliente_ids
from public.clientes
where email is not null
group by email
having count(*) > 1;

-- Entidades órfãs (sem case_id válido) nas tabelas centrais
select 'proposals' as tabela, count(*) from public.proposals p
  where not exists (select 1 from public.crm_casos c where c.id = p.case_id)
union all
select 'contracts', count(*) from public.contracts k
  where k.case_id is not null and not exists (select 1 from public.crm_casos c where c.id = k.case_id);

-- Nome da mesma pessoa aparecendo em mais de uma das 4 tabelas sem ID comum
-- (achado já registrado no Mapa de Autoridade Admin — aqui é a confirmação
-- por dado real, não por leitura de código)
select lower(trim(person_name)) as nome, count(distinct contract_id) as contratos
from public.contract_parties
group by lower(trim(person_name))
having count(*) > 1;
```

### 3. O que o código já confirma, sem precisar de banco (registrado no Mapa de Autoridade Admin)

- 4 tabelas guardam nome de pessoa sem `person_id` comum: `clientes`, `nucleo_membros`, `genealogical_person_profiles`, `contract_parties`.
- A cópia automática de contratante_nome/documento/endereço da matriz de Parâmetros para o contrato só acontecia uma vez, na criação — e falhava silenciosamente por uma constraint de `role` inválida (já corrigido nesta sessão, PR #35).
- O próprio documento de origem já cita os dois códigos de caso concorrentes da Ana Luiza (`CA-CID-AT-FAM-2026-001` / `CA-AUT-ANALUIZA-FAM-2026-001`) como fato conhecido, não como algo a descobrir.

## O que não foi feito, e por quê

- **Matriz de reconciliação preenchida com dados reais**: bloqueada por acesso ao Supabase.
- **Correção do caso Ana Luiza (Fase 2)**: não iniciada — depende da matriz acima e, pelo próprio documento, exige apresentação à proprietária antes de qualquer reapontamento de registro.
- **`case_participants`, motor de caso único, onboarding único (Fase 3)**: não iniciado — depende das fases anteriores; desenhar esse schema sem primeiro confirmar os padrões reais de duplicidade seria adivinhar, não mapear.

## Próximo passo

Assim que o acesso ao Supabase estiver disponível nesta sessão: rodar as consultas acima, preencher a matriz de reconciliação real, e trazer o resultado à proprietária antes de tocar em qualquer registro do caso da Ana Luiza — exatamente como a Fase 2 do documento de origem exige.
