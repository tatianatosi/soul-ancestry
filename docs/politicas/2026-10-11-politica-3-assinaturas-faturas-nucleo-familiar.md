# Política de 3 Assinaturas e Faturamento no Núcleo Familiar

Status: aprovado
Versão: v1.0
Data: 2026-10-11
Responsável pela decisão: Proprietária do Clube Ancestral
Classificação: política e governança
Fonte:
  - Instrução direta da Proprietária em 11/10/2026
  - Contrato 2026-CB-0001 (R$ 9.600,00 global)
  - Schema Supabase (`invoices`, `nucleo_membros`, `client_portal_case_access`)
Substitui: N/A — corrige o passo 3 da migração `supabase/migrations/20261011130000_saneamento_nucleo_ana_luiza.sql` (PR #134), que havia definido Adair e Alice como `dependente`.

---

## 1. Escopo

Define a regra de faturamento e de visibilidade no App Cliente para núcleos familiares com cotas individuais de assinatura, tendo como caso canônico o caso Ana Luiza (CA-CID-AT-FAM-2026-001): 3 titulares com assinatura de R$ 320,00/mês por 10 meses cada.

## 2. Premissas

1. 3 assinaturas de R$ 320,00 × 10 meses totalizam exatamente R$ 9.600,00 — o valor global do contrato 2026-CB-0001.
2. Cada titular adulto assina e responde por sua própria responsabilidade financeira (`papel_no_caso = 'contratante'` em `nucleo_membros`/`case_members`).
3. Felipe é dependente menor (§ 58c StbG), sem ônus comercial e sem login/`client_id` próprio.

Isso confirma e formaliza em política o que já estava registrado em `docs/politicas/2026-10-10-politica-acesso-imediato-app-ana-luiza.md` (seção 2, tabela de 3 perfis/3 assinaturas) e corrige a migração desta sessão, que havia classificado Adair e Alice como `dependente` por engano.

## 3. Limites

1. Não expor a fatura de um titular para outro membro da família — isolamento entre titulares no App garantido por `client_id` no RLS de `invoices`.
2. `portal_sou_contratante_financeiro` (migration `20261010120000`, PR #131) só libera fatura/condição comercial a quem tem `papel_no_caso = 'contratante'`; os 3 titulares (Ana, Adair, Alice) passam a satisfazer essa condição cada um para sua própria fatura — nunca para a de outro titular, que continua sendo filtrada por `client_id`/`portal_meu_cliente()`.
3. Não autoriza alteração de contrato, pagamento, RLS ou merge além do já descrito aqui — ver adendo de contexto não arquivável (`docs/politicas/ADENDO-CONTEXTO-NAO-ARQUIVAVEL-PROVA-AUTENTICADA-2026-09-10.md`).

## 4. Próximos passos

1. Aplicar no Supabase o script SQL de atualização de `papel_no_caso` para `'contratante'` em Adair Pinto Silveira Júnior e Alice Gomes Silveira (passo 3 da migração `20261011130000_saneamento_nucleo_ana_luiza.sql`) — pendente de autorização explícita da Proprietária para execução direta em produção.
2. Gerar no Asaas os 3 carnês/assinaturas de 10× R$ 320,00, cada um vinculado ao `client_id` correspondente (Ana, Adair, Alice).
