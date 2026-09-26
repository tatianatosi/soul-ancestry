# P30 — Fusão por nome exato sem ressalva + varredura completa de máscaras em todas as abas (2026-09-26)

```yaml
status: executado, sem hedging — reverte a cautela do corte anterior (P29) por instrução
  explícita e reiterada da Proprietária
responsável pela decisão: Proprietária do Clube Ancestral
pedido literal: "Já não sei em que língua falar venho pedindo algo simples com diversos nomes
  justamente porque você não executou nada do que foi pedido... homônimos irão sempre existir
  na face da terra e outro ponto quando digo máscaras que devem ser aplicadas em cada aba você
  vem fazem do nem em linha"
```

## Correção do corte anterior (P29)

Em P29 eu tinha subido nome idêntico de `apenas_indicio` para `provavel` — melhor que o estado
anterior (que nem chegava a perguntar), mas ainda exigindo confirmação humana antes de fundir,
por cautela com homônimo. A Proprietária rejeitou explicitamente essa cautela ("homônimos irão
sempre existir na face da terra") e reiterou o pedido original sem ressalva. Corrigido agora:
nome idêntico normalizado é `confirmado` — a mesma categoria de CPF/e-mail. Funde sozinho quando
há exatamente um candidato com aquele nome; quando há dois ou mais (ambiguidade real — duas
pessoas, não incerteza sobre uma), continua caindo em confirmação humana, porque nesse caso não
é cautela contra homônimo, é a mesma regra de desempate que já protegia CPF/e-mail.

Também recebida como correção: "quando digo máscaras que devem ser aplicadas em cada aba você
vem fazem do nem em linha" — em P29 eu tinha corrigido só 2 linhas em 1 arquivo (Pessoa 360).
Fiz agora uma varredura completa por grep, não por amostragem.

## Varredura completa de máscaras — 7 ocorrências em 6 arquivos, além de Pessoa 360

Busquei toda interpolação direta de campo (`{x.cpf}`, `{x.telefone}`, `{x.cep}`) em arquivos
`.tsx` do repositório inteiro, sem me limitar a Pessoa 360 ou Caso 360:

| Arquivo | Campo | Onde | Correção |
|---|---|---|---|
| `src/routes/_authenticated/clientes.tsx` | CPF + telefone | Alerta "Possíveis duplicidades" no cadastro rápido | `formatarCpf`/`formatarTelefone` |
| `src/routes/_authenticated/golive.pessoa.tsx` | Telefone | Card "Pessoa individual — identidade e contato" | `formatarTelefone` |
| `src/routes/_authenticated/golive.app.tsx` | Telefone | Preview "Seus dados" do App Cliente | `formatarTelefone` |
| `src/components/crm/fluxo-canonico.tsx` | Telefone | Campo "Telefone" de Contatos (CRM Vivo) — **sem máscara nenhuma no digitar**, não só na leitura | `formatarTelefone` no `onChange` |
| `src/routes/_authenticated/pessoas.$clienteId.tsx` | CEP | Linha de endereço concatenada em modo leitura (distinta do card de edição, já corrigido em P29) | `formatarCep` |
| `src/components/contrato/reconciliar-cpf-partes.tsx` | CPF | Conflito "na parte do contrato" × "cadastro canônico" | `formatarCpf` nos dois lados |
| `src/components/caso/reconciliar-cpf-membros-caso.tsx` | CPF | Mesmo conflito, para `case_members` | `formatarCpf` nos dois lados |
| `src/components/caso/reconciliar-telefone-membros-caso.tsx` | Telefone | Mesmo conflito, telefone (P28) | `formatarTelefone` nos dois lados |

Nenhuma máscara nova — todas reaproveitam `formatarCpf`/`formatarTelefone`/`formatarCep`
(`validacao-pessoa.ts`), já a fonte única declarada em `mascaras-e-validadores.md`.

## O que ainda não foi varrido (declarado, não escondido)

Esta rodada cobriu CPF/telefone/CEP — os três campos com máscara canônica hoje.

**Correção (P31, 26/09/2026): o parágrafo original aqui estava errado.** Ele afirmava que RG
(número/órgão/UF) "não tem máscara própria porque a coluna de órgão/UF não existe" e que
"endereço estruturado tem o mesmo problema (texto corrido)" — nenhuma das duas afirmações era
verdadeira. Consulta direta ao banco (`information_schema.columns`, não a este documento)
confirmou que `clientes.rg_numero`/`clientes.rg_orgao_uf` já existiam antes desta sessão, e que
`clientes.endereco_logradouro/numero/complemento/bairro/cidade/uf/pais` já são campos estruturados
e editáveis em Pessoa 360 desde antes de P28. O erro real não era "coluna ausente" — era eu não
ter reconferido o schema real antes de repetir a mesma frase entre P28→P29→P30. P31 fechou a
validação que genuinamente faltava (UF do órgão emissor do RG) sem precisar de nenhuma migration.

## Verificação

`tsc --noEmit` limpo. 8 testes novos cobrindo a fusão por nome (`p29-fusao-nome-exato-e-mascaras-leitura-2026-09-26.test.ts`,
reescrito para `confirmado`) + 8 testes novos cobrindo a varredura de máscaras
(`p30-varredura-mascaras-todas-as-abas-2026-09-26.test.ts`). 2 testes existentes corrigidos de
novo (`pessoa-identidade.test.ts`, `p1-identidade-conversao-lead-cliente.test.ts` — nome exato
agora funde sozinho com candidato único). Suíte completa idêntica à baseline estável (7
arquivos/11 testes pré-existentes). `vite build` limpo.

## Prova Lovable pós-push

Com dado de homologação (nunca Ana ou cliente real): criar um lead com nome idêntico a um cliente
já cadastrado e confirmar que o handoff funde automaticamente (sem tela de confirmação) quando só
existe um candidato com aquele nome, e continua pedindo escolha quando existem dois. Em
`/clientes`, `/golive/pessoa`, `/golive/app` (prévia do App) e nos três painéis de reconciliação
(Caso 360): conferir CPF/telefone formatados em vez de dígitos crus.
