# Taxonomia canônica — identidade única da pessoa no ciclo completo

Camada do Design System do Clube Ancestral. Documento de leitura: descreve o que
existe hoje, nomeia o dono de cada informação e fixa as regras de identidade.
Não cria tabela, campo, migration, writer, fusão de pessoas, publicação, convite,
link, contrato ou dado.

Fontes verificadas em 16/09/2026: `src/integrations/supabase/types.ts`,
`src/lib/validacao-pessoa.ts`, `src/lib/ficha-piloto-genealogica.ts`,
`supabase/migrations/`. Material anterior consolidado, não revogado:
`docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`,
`docs/arquitetura/PESSOA-360-DE-PARA-LEAD-ATE-CLIENTE-2026-09-02.md`,
`docs/arquitetura/2026-09-03_PESSOA-360-CONJUNTO-UNIFICADO-DE-DADOS.md`,
`docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`.

## 1. O princípio

O produto é um sistema operacional de casos e jornadas. A mesma pessoa atravessa
todo o ciclo sem trocar de identidade, mesmo quando muda de papel. Papel é
circunstância; pessoa é permanente.

Hoje **não existe uma tabela única de pessoa**. A identidade é sustentada por
vínculos entre entidades específicas. Esta é a dívida central mapeada aqui, e a
documentação não a esconde nem a resolve por conta própria.

## 2. O ciclo e a entidade real de cada etapa

| # | Etapa | Entidade real hoje | Cria | Apenas lê | Como a identidade se preserva |
|---|---|---|---|---|---|
| 1 | Lead | `leads` | Interesse e triagem comercial | — | `leads.nucleo_id`, `leads.case_id` quando o caso nasce |
| 2 | Contato / Pessoa | `contacts` | Pessoa de contato mínima (nome, e-mail, telefone) | — | `nucleo_membros.contact_id` |
| 3 | Cliente | `clientes` | Pessoa ou núcleo contratante | Contato de origem | `nucleo_membros.cliente_id`, `authorized_portal_emails.client_id`, `client_portal_access.client_id` |
| 4 | Caso | `crm_casos` | O caso, com titular e organização | Cliente, lead | `case_members.case_id`, `crm_casos` é o eixo |
| 5 | Núcleo | `nucleo_membros` | Composição familiar comercial | Contato, cliente | `cliente_id` + `contact_id` na mesma linha |
| 6 | Ficha Piloto | `case_members` + camada de `src/lib/ficha-piloto-genealogica.ts` | Dados civis de cada integrante do caso | Núcleo | `case_members.case_id`, `representa_pessoa_id`, `mae_id`, `pai_id` |
| 7 | Pesquisa Genealógica | `research_people`, `research_cases`, `research_sources` | Pessoa investigada, sempre hipótese até prova | Ficha piloto | `research_people.family_member_id` → `case_members.id` |
| 8 | Pessoa 360 | Projeção de leitura sobre 2–7 | — | Tudo acima | Não tem tabela própria; é composição |
| 9 | Documentos | `documents`, `evidences`, `case_source_documents` | Arquivo e evidência | Pessoa, caso | `case_id` e vínculo de evidência |
| 10 | Proposta / Canva | `proposals`, `proposal_canva_pages` | Escopo e condição comercial aprovada | Lead, caso | `proposal_canva_pages.case_id` |
| 11 | Contrato / Anexos | `contracts`, `contract_parties` | Partes contratuais do instrumento | Cliente, caso | `contract_parties.client_id`, `contract_id` |
| 12 | Assinatura | `contract_parties.signature_status` | Fato de assinatura por parte | Contrato | Mesma linha da parte |
| 13 | Financeiro | `invoices`, `payments`, `eventos_financeiros` | Fatura, pagamento, evento | Contrato, caso | `case_id` / `client_id` |
| 14 | Portal / App | `authorized_portal_emails`, `client_portal_access`, `client_portal_case_access`, `app_projections`, `client_deliverables` | Autorização e projeção publicada | Tudo, sanitizado | `client_id` → `client_portal_access` → `client_portal_case_access.case_id` |

Legenda de leitura: "cria" significa que a etapa é dona do dado e pode gravá-lo;
"apenas lê" significa espelho, e espelho nunca vira fonte.

## 3. Onde a identidade hoje se sustenta e onde se rompe

Cadeias que funcionam:

```text
contacts ──► nucleo_membros ──► clientes ──► crm_casos ──► case_members
                                                  │
                                                  ├─► research_people (family_member_id)
                                                  │        └─► genealogical_person_profiles (research_person_id)
                                                  └─► contract_parties (client_id)

clientes ──► authorized_portal_emails ──► client_portal_access ──► client_portal_case_access ──► crm_casos
```

Rupturas declaradas como dívida, sem correção nesta fase:

1. `leads.nome`, `contacts.nome`, `clientes.nome`, `case_members.nome`,
   `nucleo_membros.nome`, `contract_parties.person_name`,
   `research_people.canonical_name` e `genealogical_person_profiles.nome_completo`
   são **oito** grafias possíveis da mesma pessoa, sem chave comum obrigatória.
2. `leads` não tem ligação obrigatória a `contacts`: o mesmo interesse pode virar
   contato duplicado.
3. `contract_parties` liga a `client_id`, não à pessoa do caso: uma parte que é
   dependente ou representante não aponta para `case_members`.
4. `authorized_portal_emails.email` e `client_portal_access.email` são
   identidade de acesso por texto de e-mail, não por pessoa.
5. `nucleo_membros` aceita `cliente_id` **ou** `contact_id`: a mesma pessoa pode
   aparecer duas vezes no mesmo núcleo por caminhos diferentes.

## 4. Regras fixas de identidade

Estas regras valem para qualquer tela, formulário ou leitura futura.

1. **Pessoa existe antes de elegibilidade.** Primeiro se registra quem é a
   pessoa; só depois se avalia se ela tem direito a algo. Nenhuma tela pode
   exigir avaliação de direito para permitir cadastrar alguém.
2. **Elegibilidade pertence à oportunidade e ao caso, nunca à pessoa.** Os campos
   `leads.elegibilidade_preliminar`, `leads.via_juridica_preliminar` e
   `leads.marco_preliminar` são do lead. A mesma pessoa pode ser elegível num
   caso e não em outro, e isso não é contradição.
3. **Nome não cria fusão automática.** Homônimo é comum em genealogia. Nenhuma
   rotina pode unir registros por semelhança de nome, nem sugerir a união como
   ação de um clique só.
4. **E-mail e telefone apenas sugerem revisão humana.** Coincidência gera um
   aviso de possível duplicidade para uma pessoa decidir; nunca grava, nunca
   vincula, nunca arquiva.
5. **Ficha Piloto e Pesquisa Genealógica não são formulários concorrentes.** A
   Ficha Piloto é cadastro civil declarado do caso. A Pesquisa é investigação
   histórica com estado de validação próprio. Ver
   `de-para-pessoa-unificada.md`.
6. **Pesquisa não sobrescreve cadastro civil sem decisão humana.** Um achado com
   evidência pode divergir da certidão declarada; a divergência é exibida como
   divergência, e a gravação depende de decisão registrada.
7. **Papel é atributo do vínculo, não da pessoa.** Titular, requerente,
   dependente, contratante, representante legal, signatário e usuário do App são
   estados de `case_members`, `contract_parties` e `client_portal_access` — não
   colunas de uma pessoa global.
8. **Nada se apaga.** Toda correção de identidade é arquivamento com motivo,
   autor e data, preservando o histórico.
9. **Sem nome técnico de tabela na interface.** Nomes de sistema só aparecem em
   um bloco recolhido de detalhes técnicos.

## 5. Vocabulário de interface

| Na interface | Entidade por trás | Nunca escrever |
|---|---|---|
| Interessado | `leads` | lead cru, oportunidade |
| Pessoa | `contacts` / `case_members` | contato, membro |
| Cliente | `clientes` | conta |
| Caso | `crm_casos` | processo, ticket |
| Família / Núcleo | `nucleo_membros` | núcleo id |
| Ficha da pessoa no caso | `case_members` | ficha piloto (interno) |
| Pesquisa | `research_people` | pessoa de pesquisa |
| Documento | `documents` / `evidences` | evidência bruta (no App) |
| Proposta | `proposals` | SKU, catálogo |
| Contrato | `contracts` | instrumento |
| Acesso ao App | `client_portal_access` | portal access, token |

## 6. O que esta camada não autoriza

Não autoriza criar tabela de pessoa, executar fusão, alterar RLS, migrar dado,
renomear coluna, publicar conteúdo, gerar convite ou link, tocar contrato,
fatura, pagamento ou integração. O plano de migração futura está em
`de-para-pessoa-unificada.md`, seção 6, e depende de aprovação explícita da
Proprietária.
