# Decisão de identificadores canônicos de casos

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Norma de nomenclatura para CRM, Desk, proposta, `case_service`, formalização, documentos e auditoria  
**Identificador da decisão:** `CA-DEC-2026-08-20-03`

---

## 1. Decisão

O identificador canônico do caso **não deve carregar o país, a via jurídica, o produto, o estado comercial ou o nome de pessoa**. Esses atributos podem mudar durante Discovery, validação, proposta, formalização e execução; o ID do caso não pode mudar.

A estrutura canônica passa a ser:

```text
CA-CID-[MODELO]-[ANO]-[SEQUENCIA]
```

Onde:

- `CA`: Clube Ancestral.
- `CID`: domínio principal Cidadania/Jornada de cidadania.
- `MODELO`: composição do caso, não país nem via.
- `ANO`: ano de criação formal do caso.
- `SEQUENCIA`: número sequencial único por ano e modelo, com três dígitos.

O país, a trilha, a via, o produto-pai, o `case_service`, os participantes e os estados ficam em campos estruturados do Desk. Eles não entram no código canônico.

---

## 2. Modelos autorizados

| Código | Modelo | Quando usar |
|---|---|---|
| `IND` | Individual | Um titular/contratante, sem composição familiar contratada |
| `FAM` | Familiar | Dois ou mais titulares, dependentes ou escopo compartilhado de núcleo familiar |
| `MULTI` | Multipaís | Caso com mais de uma trilha nacional/técnica contratada ou em composição formal |
| `PESQ` | Pesquisa | Pesquisa de origem/genealogia sem jornada principal de cidadania contratada |
| `LEG` | Legado | Memória, história familiar, acervo ou legado sem cidadania como objeto principal |
| `POS` | Pós-reconhecimento | Registros, passaporte, regularização ou continuidade após reconhecimento |

`CID` é usado para a jornada de cidadania, inclusive quando a trilha técnica for Portugal, Áustria, Itália, Croácia, Brasil/naturalização ou outra. O país pertence ao campo `citizenship_track_id`.

---

## 3. Aplicação aos casos atuais

| Pessoa/caso | ID recomendado | Justificativa |
|---|---|---|
| Ana Luiza e núcleo | `CA-CID-FAM-2026-001` | Caso familiar de cidadania, com titulares/dependente e escopo compartilhado |
| João | `CA-CID-IND-2026-002` | Jornada individual de cidadania por etapas; Portugal é trilha, não identificador |
| Amigo do Danilo | `CA-CID-IND-2026-003` | Lead individual em triagem para Brasil/naturalização; só vira caso após confirmação formal e abertura de caso |

### Regra para Danilo

Não usar `CA-CID-HR-2026-003` se `HR` for uma abreviação de país, rota, nacionalidade, hipótese ou processo. Isso quebra estabilidade e cria ambiguidade.

O caso do amigo do Danilo só recebe o ID de caso quando a oportunidade passar pelos gates definidos. Enquanto for lead em triagem, deve usar:

```text
CA-LEAD-2026-XXX
```

Após a confirmação formal e a criação do caso:

```text
CA-CID-IND-2026-003
```

O campo estruturado deve registrar:

```text
citizenship_track = Brasil / Naturalização-residência
via_preliminar = Em confirmação jurídica
origem = Indicação
interlocutor_referencia = Danilo
```

---

## 4. Relação com Canva

O Canva não cria nem redefine o ID canônico do caso. A proposta Canva deve referenciar o `case_id` já existente e registrar sua própria versão:

```text
DECK-CANVA-[CASE_ID]-v[N]
```

Exemplos:

```text
DECK-CANVA-CA-CID-FAM-2026-001-v1
DECK-CANVA-CA-CID-IND-2026-002-v1
```

Se uma proposta histórica usar código diferente, o código histórico deve ser preservado como alias ou referência de origem; não deve substituir o `case_id` canônico.

---

## 5. Alias e histórico

- Não apagar IDs históricos.
- Registrar cada código anterior em `case_aliases` com `alias_type`, `source`, `created_at`, `reason` e `superseded_by` quando aplicável.
- Um caso possui exatamente um `case_id` canônico.
- Alias nunca deve ser usado como chave primária, destino de integração ou novo identificador de proposta.
- O sistema deve exibir o ID canônico como padrão e mostrar aliases somente no histórico/detalhe interno.

Exemplo Ana:

```text
case_id_canonic: CA-CID-FAM-2026-001
alias_historico: CA-CID-AT-FAM-2026-001
alias_historico: CA-AUT-ANALUIZA-FAM-2026-001
```

A alteração do ID canônico da Ana exige uma decisão humana explícita e uma migration controlada; não deve ser alterada por prompt visual.

---

## 6. Regras técnicas

1. O ID é gerado somente pelo servidor/banco, nunca por campo livre.
2. A sequência é transacional, única e imutável depois da criação.
3. O país, via, produto, preço, fase, estado comercial, responsável e pessoa não alteram o ID.
4. `case_service` possui identificador próprio e pode carregar produto/trilha, sem contaminar o ID do caso.
5. Propostas, contratos, anexos, documentos, registros de pesquisa e auditoria devem referenciar `case_id` canônico.
6. Em ambiente de teste, usar prefixo explícito de fixture, por exemplo `DEMO-CA-CID-IND-2026-001`; nunca misturar fixture com caso real.
7. Leads, oportunidades e contatos têm identificadores próprios e não devem receber `case_id` antes da abertura formal de caso.

---

## 7. Próximo ajuste técnico

A regra deve ser implementada em Claude Code após o piloto Ana, por migration e testes:

- Criar/confirmar `case_aliases`.
- Criar gerador transacional de `case_id`.
- Validar `MODELO` contra dicionário fechado.
- Impedir alteração de `case_id` por interface.
- Preservar aliases históricos na migração.
- Atualizar referências de proposta Canva para o `case_id` canônico.
- Adicionar testes para individual, familiar, multipaís, lead e fixture.

Nenhuma renomeação de caso real deve ocorrer no Lovable sem migration, backup, plano de reversão e revisão humana.
