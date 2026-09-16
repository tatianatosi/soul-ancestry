# De-para da pessoa unificada — Ficha Piloto × Pesquisa Genealógica

Camada do Design System. Documento de leitura. Não cria tabela, campo,
migration, writer, backfill nem fusão de pessoas. O plano da seção 6 é desenho,
não execução.

## 1. As duas fichas não competem

| | Ficha Piloto | Ficha de Pesquisa Genealógica |
|---|---|---|
| Pergunta que responde | Quem é esta pessoa no caso, hoje | Quem foi esta pessoa na história, e com qual prova |
| Entidade | `case_members` (+ `src/lib/ficha-piloto-genealogica.ts`) | `research_people` e `genealogical_person_profiles` |
| Natureza do dado | Declarado pela família e conferido em documento civil | Investigado, sempre com estado de validação |
| Pode afirmar? | Sim, o que o documento civil diz | Só depois de evidência e revisão |
| Cria | Integrante do caso, papel, dados civis, consentimentos | Pessoa investigada, perfil histórico, vínculo, achado |
| Lê | Núcleo e cliente | Ficha Piloto, via `research_people.family_member_id` |
| Publica no App? | Não diretamente | Não; só por projeção aprovada e publicada |

Regras já escritas no código da ficha piloto e preservadas aqui: nenhuma fonte é
consultada nessa etapa, nenhum documento é solicitado, árvore e relatório não são
publicados, e pessoa, vínculo ou linhagem só saem de "apenas afirmado" com
evidência registrada.

## 2. Campos sobrepostos e quem é o dono

| Informação | Ficha Piloto | Pesquisa | Dona | Regra |
|---|---|---|---|---|
| Nome | `case_members.nome` | `research_people.canonical_name`, `genealogical_person_profiles.nome_completo` | Ficha Piloto | Nome civil é da ficha; nome canônico e nome de nascimento são da pesquisa e não a sobrescrevem |
| Data de nascimento | `data_nascimento` | `birth_date`, `nascimento_data` | Ficha Piloto | Divergência é exibida como divergência |
| Local de nascimento | `local_nascimento` | `birth_place`, `nascimento_localidade` | Ficha Piloto | Idem |
| Data e local de óbito | `data_obito`, `local_obito` | `death_*`, `morte_*` | Ficha Piloto quando declarado; Pesquisa quando o dado só existe em fonte histórica | Nunca dois valores afirmados ao mesmo tempo |
| Precisão da data | não existe | `birth_date_precision`, `nascimento_precisao` | Pesquisa | Cadastro civil não tem precisão, e isso está correto |
| Nacionalidade | `nacionalidade` | `nationality_context` | Ficha Piloto | Pesquisa registra contexto, não fato civil |
| Sexo / descritor | não existe | `sexo`, `gender_or_descriptor` | Pesquisa | — |
| Parentesco | `parentesco`, `mae_id`, `pai_id` | `papel_na_linhagem`, `linha_transmissao`, `geracao` | Ficha Piloto para o declarado; Pesquisa para o provado | Parentesco declarado não vira vínculo provado, e vice-versa |
| Menoridade | `representante_legal`, `representa_pessoa_id` | `is_minor` | Ficha Piloto | Proteção de menor nunca desaparece |
| Nota | `observacoes_protegidas` | `notes_internal`, `internal_notes` | Cada uma na sua | Nenhuma vai ao App |
| Visibilidade | — | `client_visibility`, `visible_to_client_summary`, `sensitivity_level` | Pesquisa | Só a pesquisa marca o que pode ser projetado |

Ligação que sustenta a identidade entre as duas:
`research_people.family_member_id → case_members.id` e
`genealogical_person_profiles.research_person_id → research_people.id`.

## 3. Fluxo de promoção

```text
informação compartilhada   (ficha piloto: declarado pela família)
        │  cópia de leitura, nunca gravação cruzada
        ▼
pesquisa                   (research_people: hipótese com estado de identidade)
        │  fonte localizada e registrada
        ▼
evidência                  (evidences / research_sources: o que a fonte diz)
        │  leitura humana, separando transcrição de interpretação
        ▼
revisão                    (identity_status / status_verificacao)
        │  decisão humana registrada, com autor e data
        ▼
achado                     (confirmado, com evidência vinculada)
        │  reescrita sem termo técnico e sem juízo de mérito
        ▼
projeção sanitizada        (client_visibility aprovada + publicação)
        │
        ▼
App Cliente                (Árvore, Documentos, Legado, Jornada)
```

## 4. O que não flui automaticamente

1. Achado não vira dado civil na Ficha Piloto.
2. Dado civil não vira achado confirmado na Pesquisa.
3. Vínculo apenas afirmado não desenha a Árvore.
4. Evidência registrada não confirma achado sozinha; falta a revisão.
5. Achado confirmado não é publicado sozinho; falta a projeção sanitizada.
6. Nome, e-mail ou telefone coincidentes não unem pessoas; geram, no máximo,
   uma sugestão de revisão humana.
7. Nada avança para o App sem contrato válido e sem liberação do caso — regra
   preservada, nunca contornada.
8. Consentimento comercial do interessado não migra sozinho para o caso.

## 5. Precedência por tipo de informação

| Tipo | Precedência |
|---|---|
| Identificação civil | Documento civil > declarado pela família > pesquisa |
| Fato histórico | Evidência revisada > fonte localizada > hipótese |
| Papel no caso | Decisão registrada da equipe > declarado |
| Papel contratual | Instrumento assinado > minuta |
| Acesso | Autorização concedida > nível pretendido |
| Conteúdo do App | Publicado > aprovado > sanitizado > interno |

Em qualquer empate, vence o registro com fonte, autor e data — e a divergência
permanece visível até uma decisão humana.

## 6. Plano de migração futura, sem perda de histórico

Desenho apenas. Nenhum passo autorizado; cada um exige aprovação explícita da
Proprietária e prova autenticada antes do seguinte.

| Corte | O que faria | Risco | Reversível |
|---|---|---|---|
| 1 | Declarar em documentação a dona de cada campo e ajustar a leitura das telas para consultar a dona, sem tocar em dado | Baixo | Sim |
| 2 | Relatório somente leitura de possíveis duplicidades, com sugestão para revisão humana e sem nenhuma ação em lote | Baixo | Sim |
| 3 | Tabela de vínculo de identidade (pessoa ↔ registros existentes), aditiva, sem remover coluna nem mover dado | Médio | Sim |
| 4 | Preencher o vínculo caso a caso, por decisão humana registrada, com autor e data | Médio | Sim, por arquivamento |
| 5 | Telas passam a ler pela identidade vinculada, mantendo o campo antigo como espelho | Médio | Sim |
| 6 | Campos espelho viram somente leitura, com aviso de origem | Alto | Sim |
| 7 | Arquivamento de espelhos obsoletos, nunca exclusão física | Alto | Por histórico |

Invariantes de todos os cortes: nenhuma exclusão física; todo passo gera evento
de auditoria; nenhuma fusão automática; homologação com dado sintético
reversível; RLS e isolamento por organização preservados; consentimento e
proteção de menor preservados; evidência exigida para achado confirmado.

## 7. Arquivos e tabelas que exigiriam mudança numa fase futura

Lista de impacto para planejamento. Nada alterado agora.

**Tabelas** — `leads`, `contacts`, `clientes`, `nucleo_membros`, `case_members`,
`research_people`, `genealogical_person_profiles`, `contract_parties`,
`authorized_portal_emails`, `client_portal_access`, `client_portal_case_access`,
`crm_casos`, e uma futura tabela de vínculo de identidade (aditiva).

**Código** — `src/lib/validacao-pessoa.ts` (reuso, sem mudança de assinatura),
`src/lib/persistencia-mascara.ts`, `src/lib/ficha-piloto-genealogica.ts` e seu
par `.functions.ts`, `src/lib/pessoas-linhagens.ts`, `src/lib/persistencia-caso.ts`,
`src/lib/crm-fluxo.ts`, `src/lib/portal.functions.ts`, `src/integrations/supabase/types.ts`
(regenerado, nunca editado à mão).

**Telas** — ficha do caso e Caso 360, Pessoa 360, Comercial e Discovery,
Pesquisa, Contrato e partes, Portal e as sete abas do App.

**Documentação** — os quatro arquivos desta camada mais
`docs/arquitetura/PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` e
`docs/arquitetura/PESSOA-360-DE-PARA-LEAD-ATE-CLIENTE-2026-09-02.md`.
