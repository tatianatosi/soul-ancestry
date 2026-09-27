# Fase D — Núcleo, Pesquisa e Perfil (27/09/2026)

```yaml
status: executado
fase: D de 6 (A-F) — "Cadeia canônica executável"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Fechar o item D do diretório Fase A-F: confirmar que o dossiê-mãe continua
único por caso, corrigir o vínculo `research_people` ↔ Pessoa Canônica
(achado real: era feito por comparação de nome), confirmar que o Perfil
genealógico nunca cria/edita a Pessoa Canônica, e confirmar que a
identificação da fonte de uma relação familiar (case_members vs. pesquisa)
já está separada e nunca apresenta uma relação de fonte única preliminar
como confirmada.

## 1. Achado real e corrigido — `research_people` era vinculado por nome

`carregarPessoa` (`src/lib/pessoa.functions.ts`) decidia quais
`research_people` pertenciam à pessoa aberta em Pessoa 360 comparando
`canonical_name`/`preferred_display_name` (texto) contra o nome da Pessoa
Canônica — igualdade OU inclusão parcial de string. Isso é exatamente o
tipo de fusão automática por nome que a "REGRA ABSOLUTA" desta rodada
proíbe (nome é sinal, nunca vínculo), e um risco real de misatribuição:
duas pessoas com nomes parecidos no mesmo caso poderiam ver a ficha de
pesquisa uma da outra.

O vínculo real e já auditado já existia, só não era usado aqui:
`genealogical_person_profiles.client_id` (Corte C desta mesma sessão,
`pessoas-linhagens.functions.ts#salvarRegistroG02`, com
`audit_logs`/timeline a cada vínculo/desvínculo humano) — e todo perfil
tem `research_person_id` **obrigatório**, apontando para o `research_people`
correspondente. `carregarPessoa` passou a: (1) selecionar
`research_person_id` na consulta de `genealogical_person_profiles` (já
filtrada por `client_id = cliente.id`, isto é, só perfis vinculados
manualmente a esta pessoa); (2) filtrar `research_people` por esse
conjunto de ids, nunca mais por nome. `fichaGenealogicaEquipe` (outros
`research_people` do mesmo caso, ainda sem vínculo) é o complemento exato.

Nenhuma tabela nova, nenhum writer novo — a cadeia
`clientes ← genealogical_person_profiles.client_id` +
`genealogical_person_profiles.research_person_id → research_people` já
existia inteira no schema; só faltava alguém ler a segunda metade.

## 2. Perfil genealógico nunca auto-cria/edita a Pessoa Canônica — confirmado

Conferido por leitura direta (não presumido): nenhum `.from("clientes")`
existe em `pessoas-linhagens.functions.ts` (módulo G-02, onde o Perfil
genealógico é criado/editado). O único ponto de contato com a Pessoa
Canônica é `client_id` — sempre um vínculo opcional a um cliente já
existente (`salvarRegistroG02`, com a checagem
`clienteElegivelParaPerfil` já exigindo que a pessoa já pertença ao caso),
nunca uma criação de cliente novo a partir da pesquisa. Trava de
regressão adicionada em teste; nenhum código novo necessário aqui.

## 3. Dossiê-mãe único por caso — confirmado, não recriado

`nucleoComMesmoDossieAtivo`/`dossieMaeDoCaso`
(`src/lib/nucleo-completude.ts`) já recusam um segundo núcleo com dossiê
ativo no mesmo caso — implementado no Corte B da fase "Pessoa Unificada"
desta mesma sessão longa (SHAs `5931a272`…`ec38b4a6`), antes desta rodada
de Fases A-F. Só confirmado que segue vigente; nenhuma mudança.

## 4. Relação familiar — fonte já separada, sem preliminar apresentada como confirmada

O card "Vínculos familiares do caso" em Pessoa 360
(`pessoas.$clienteId.tsx`) já rotula explicitamente a fonte: "Parentesco
gravado em case_members (pai/mãe), nunca deduzido por nome — distinto da
pesquisa genealógica interna." `estadoDeConfirmacao` (`golive-pessoas.ts`)
só marca "Confirmada" quando há `verificadoEm` (registro administrativo
humano) — não é usado para nenhuma hipótese de pesquisa genealógica.
`research_relationships` (a camada de pesquisa/hipótese de parentesco, com
seu próprio `confidence_level`/`status`) não é lida em Pessoa 360 hoje —
vive isolada em `/pessoas-linhagens/$caseId`, seu módulo próprio. Como as
duas fontes já não se misturam na mesma tela, não há hoje um caso real de
"vínculo de fonte única preliminar apresentado como confirmado" a corrigir
— confirmado por leitura, não fabricado como gap para preencher a rodada.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fased-vinculo-research-people-sem-nome-2026-09-27.test.ts`
(7 casos). Suíte completa e `vite build` — ver rodapé do commit. Nenhuma
migration nova.

## Prova Lovable pós-push

1. Em `/pessoas-linhagens/$caseId`, vincular um perfil genealógico
   (`client_id`) a uma pessoa do caso que ainda não tinha perfil vinculado.
2. Abrir a Pessoa 360 dessa pessoa — a seção de ficha genealógica deve
   passar a mostrar esse `research_people`, e só ele (não outros do mesmo
   caso com nome parecido).
3. Desvincular o perfil (voltar `client_id` a vazio) e recarregar — a
   ficha genealógica desaparece da Pessoa 360 dessa pessoa.
