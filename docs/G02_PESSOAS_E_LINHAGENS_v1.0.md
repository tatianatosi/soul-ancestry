# G-02 — Ficha piloto genealógica como origem canônica (v1.0)

Data: 20/08/2026 · Escopo: interno (Desk Intelligence) · Status: implantado

## 1. Arquitetura

Pessoa + relações estruturadas + linhagens + eventos + evidências = **árvore interna** e **linha do tempo interna**.

Nenhum campo rígido (Filho 1, Filho 2, Irmão 1, Irmão 2). Todo parentesco é uma linha em
`genealogical_relationships`; a árvore é derivada em tempo de leitura a partir dessas linhas.

## 2. Tabelas criadas

| Tabela | Função |
| --- | --- |
| `genealogical_person_profiles` | Perfil 360° da pessoa (1:1 com `research_people`), com nascimento/morte exatos ou aproximados, sepultamento, causa da morte, status de verificação e evidência de suporte |
| `name_variants` | Variantes de nome por pessoa (grafia, tradução, italianização, aportuguesamento, apelido, erro documental, nome religioso, outro) |
| `genealogical_relationships` | Relações estruturadas entre pessoas, com status de pesquisa e evidência |
| `genealogical_events` | Eventos de vida (nascimento, batismo, casamento, morte, sepultamento, residência, migração, serviço militar, patrimônio, outro) |
| `lineage_paths` | Linhagens do caso: nome da linha, pessoa âncora, tipo, trilha de cidadania opcional, objetivo, geração alvo, status, risco e próximo marco |

Todas com `organization_id`, RLS por organização (`is_org_member` / `can_write`), autoria automática
(`created_by`, `updated_by`), arquivamento com motivo e **bloqueio de exclusão física** (`fn_block_delete`).

## 3. Travas no banco

- Perfil `confirmado` exige `evidence_id`; ao sair de confirmado, `verified_at`/`verified_by` são limpos.
- Relação só assume `com_suporte` ou `confirmado` com evidência ou fonte.
- Evento `confirmado` exige evidência ou fonte.
- Variante `validada` exige evidência ou fonte; variante não pode ser transferida entre pessoas e é única por pessoa.
- Uma pessoa não pode ter relação consigo mesma; morte não pode anteceder nascimento; fim de evento não pode anteceder início.
- Um caso aceita várias linhagens (linha dupla), com nome único por caso — sem duplicar pessoa e sem criar caso novo.

## 4. Interface

Rota interna: `/pessoas-linhagens/$caseId`, acessível pela ficha canônica do caso.

Abas: **Perfil 360°**, **Árvore interna**, **Linha do tempo**, **Relações**, **Variantes de nome**,
**Linhagens**, **Eventos** e **Lacunas e próximas pesquisas**.

## 5. Como operar

1. **Criar pessoa**: aba Perfil 360° → nome completo (único campo obrigatório) → "Criar pessoa e perfil 360°".
   A pessoa nasce em `research_people` e ganha o perfil vinculado. Requer que o caso já tenha registro de pesquisa.
2. **Completar o perfil**: preencher só o que existir em documento. Campo sem documento fica vazio e aparece em Lacunas.
   Para marcar `confirmado`, selecione a evidência de suporte.
3. **Criar relação**: aba Relações → pessoa de origem, pessoa de destino, tipo e status.
   Sem evidência, o status permanece "a confirmar" e a árvore exibe o selo "Vínculo a confirmar".
4. **Criar variante de nome**: aba Variantes → pessoa existente + variante + tipo. Nunca cria pessoa nova.
5. **Criar evento**: aba Eventos → pessoa, tipo, data exata ou aproximada. Alimenta a linha do tempo interna.
6. **Criar linhagem**: aba Linhagens → nome da linha, tipo, pessoa âncora, objetivo, geração alvo e próximo marco.
   Para linha dupla, registre duas linhas com nomes distintos no mesmo caso.
7. **Remover**: não existe exclusão. Use "Arquivar" com motivo de pelo menos 5 caracteres.

## 6. Testes (`src/lib/__tests__/pessoas-linhagens.test.ts`) — 12 passando

1. Estrutura de pessoa e relação sem campos rígidos.
2. Árvore muda ao criar relação válida (e ignora relação com pessoa fora do caso).
3. Variante exige pessoa existente e não duplica pessoa.
4. Relação sem evidência não pode ser confirmada; relação reflexiva é bloqueada.
5. Mesmo caso aceita duas linhagens (linha dupla), com nome único.
6. Projeção ao App Cliente bloqueada por padrão.
7. Perfil confirmado exige evidência.
8. Evento confirmado exige evidência ou fonte; datas coerentes.
9. Linha do tempo deriva de eventos persistidos; sem data ordena ao final.
10. Lacunas apontam ausências sem preencher nada.

## 7. Caso Ana (CA-CID-AT-FAM-2026-001)

Foi criada apenas a **estrutura interna vinculável ao caso**. Nenhuma pessoa, relação, variante, evento,
linhagem, data, documento ou evidência foi inventada ou inserida.

## 8. Confirmação de não execução externa

Nenhuma pesquisa externa foi iniciada. Nenhum documento, pasta, contrato, cobrança, assinatura, mensagem
ou publicação no App Cliente foi criado ou alterado. O App Cliente não lê perfis, relações, eventos,
variantes ou notas internas: a projeção permanece bloqueada até devolutiva aprovada.
