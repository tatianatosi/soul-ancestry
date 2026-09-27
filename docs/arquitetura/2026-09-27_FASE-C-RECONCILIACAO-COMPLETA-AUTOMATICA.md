# Fase C — Pessoa Canônica ↔ Case Members: reconciliação completa e automática (27/09/2026)

```yaml
status: executado
fase: C de 6 (A-F) — "Cadeia canônica executável"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Fechar dois achados da varredura anterior: (1) nome e endereço eram os
únicos campos duplicados entre `case_members` e `clientes` sem nenhuma
reconciliação (CPF/telefone/CEP/e-mail/RG/nacionalidade/data de
nascimento/profissão/estado civil já tinham mecanismo); (2) toda
reconciliação existente exigia clique manual em "Preencher pendentes"
mesmo para o caso seguro (campo vazio) — a Proprietária pediu
explicitamente que isso seja automático.

## 1. Campos civis completos — nome e endereço adicionados

`CampoCivilReconciliavel` (`src/lib/pessoa-vinculo.ts`) ganhou `nome` e
`endereco`, usando o mesmo mecanismo genérico já existente
(`estadoCampoCivilMembroCaso`). `endereco` não tem coluna única em
`clientes` — reaproveita `montarEnderecoCanonico` e
`COLUNAS_CLIENTE_ENDERECO` (exportados de `contratos.functions.ts`, onde
foram criados no Corte 4 desta sessão) para compor o endereço estruturado
antes de comparar contra `case_members.endereco` (texto livre). Nenhuma
tabela nova, nenhuma coluna nova — reaproveita exatamente o que a Fase 0/
Corte 4 já validaram para `contract_parties`.

Total de campos civis reconciliáveis agora: nome, e-mail, RG,
nacionalidade, data de nascimento, profissão, estado civil, endereço (+
CPF/telefone/CEP nos mecanismos dedicados já existentes) — cobre
exatamente a lista que a Proprietária pediu.

## 2. Preenchimento automático — não espera mais clique manual

Todos os 5 mecanismos de reconciliação client-side (CPF/telefone/CEP/
campos civis de `case_members`; CPF/nome-email-telefone-endereço de
`contract_parties`) agora aplicam o item `"preencher"` (campo vazio)
**automaticamente assim que a conferência carrega** — a chamada
`onSuccess` da verificação (`simulado: true`) dispara sozinha a
confirmação (`mutate(true)`) quando há algo a preencher, sem esperar um
segundo clique. Continua valendo, sem exceção:
- **Nunca sobrescreve** um campo já preenchido e divergente — isso
  continua só sinal (`"conflito"`), sempre exigindo decisão humana.
- **Nunca dispara em contrato já assinado** (`contratoAssinado` guarda a
  chamada automática nos dois mecanismos de `contract_parties`).
- **Dependente nunca herda** documento/CPF do responsável — a checagem
  `dependente_nao_sincronizado` roda antes de qualquer preenchimento,
  automático ou manual.

O botão "Preencher pendentes" continua existindo (harmless, cobre o caso
raro de reabrir o painel depois de um dado canônico mudar sem recarregar
a página) — deixou de ser o único caminho.

## 3. Papéis do caso — já unificado (Fase 2 desta sessão, confirmado)

`case_members.papel_no_caso` (CHECK real) já é a fonte única, com o
mesmo rótulo (`PAPEIS_PESSOA`) em `/nucleos`, Caso 360 e Pessoa 360 —
nenhum leitor cru de `papel` divergente sobrou (fechado na Fase 2, antes
desta rodada de Fases A-F). Nada a fazer aqui além de confirmar.

## 4. Pessoa 360 — só sinais e links, nunca formulário paralelo

Confirmado: `pessoas.$clienteId.tsx` não importa nenhum componente de
edição de `case_members` — só mostra sinais (`sinalCpfDaPessoaPorCaso`,
`sinalCampoCivilDaPessoaPorCaso`) com link para o Caso 360, onde a edição
de fato acontece. Nenhum código novo necessário — já era a arquitetura
correta.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fasec-reconciliacao-completa-automatica-2026-09-27.test.ts`.
Suíte completa e `vite build` — ver rodapé do commit. Nenhuma migration
nova (reaproveita colunas já existentes em `case_members`/`clientes`).

## Prova Lovable pós-push

1. Em Caso 360, seção Pessoas e família, abrir "Conferir dados civis dos
   membros" → clicar "Ver" num campo (ex.: Nome) de um membro vinculado a
   um cliente com nome preenchido e case_member vazio → o preenchimento
   já acontece sozinho, sem precisar clicar em "Preencher pendentes".
2. Repetir para "Endereço" e conferir que compõe o endereço estruturado
   do cadastro canônico.
3. Confirmar que um contrato já assinado nunca dispara preenchimento
   automático (abrir "Conferir nome, e-mail, telefone e endereço" — sem
   nenhuma chamada de escrita).
