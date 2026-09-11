# Diagnóstico — CRM Vivo fragmentado (Mesa × Leads × Dicionários)

**Data:** 2026-09-11  
**Fonte:** prints autenticados da proprietária + auditoria de código/docs  
**Status:** achado operacional (não redesenho)

## Em uma frase

O lead **nasce em `/leads`**; a Mesa em `/calls` **só trabalha lead que já existe**; o SPIN virou **formulário longo (19 perguntas)**; os “dicionários” em geral **não pedem digitar de novo** — são regras/leitura. Muita tela, **uma** tabela: `leads`.

## Mapa do que você viu

| Tela | URL | O que faz de verdade | Cria lead? | Digita de novo? |
|---|---|---|---|---|
| Leads e triagem | `/leads` | Lista + **Novo lead** + ficha | **SIM** | SIM (ficha) |
| Mesa de Discovery | `/calls` | Call + SPIN 19 perguntas + handoff | **NÃO** | SIM (roteiro) |
| Dicionário Calls → CRM | `/governanca/dicionario-calls-crm` | Norma / campos / regras | NÃO | NÃO (leitura) |
| CRM Mestre | `/crm-mestre` | Mapa / brief / export | NÃO | NÃO (leitura) |
| Conversão | `/conversao` | Funil / eventos | NÃO | NÃO |
| Próximas ações | `/proximas-acoes` | Fila 1 linha/lead | NÃO | SIM (só ação/prazo) |
| Propostas | `/propostas` | Proposta comercial | NÃO | outro domínio |

## O que a documentação pedia vs o que a UI faz

| Documento | Intent | Realidade na UI |
|---|---|---|
| Guia curto por aba (10/09) | Mesa **não** é checkbox SPIN nem formulário longo | Mesa = **19 perguntas**, uma por vez (“forms eternos”) |
| Tarefas Mesa Discovery | 4 checkboxes SPIN no mesmo fluxo | Flags `spin_*` são **derivadas** das respostas; UX = cards longos |
| Adendo Calls (31/08) | `/calls` = mesma tabela `leads`, não sistema paralelo | **Correto** no código |
| Prompt motores unificados | Cadeia única lead→… | **Parcial** — módulos separados, mesma base |

## Bug visto no seu print

`DIVERGENCIA_PERSISTENCIA` em `call_realizada_em`: o servidor grava, a releitura compara formato de data diferente (`datetime-local` sem segundos vs Postgres com segundos). **Não** significa “não salvou”; significa “a checagem está pedante”.

## O que está funcionando (apesar da UX)

- Login Vercel ↔ Supabase
- Criar lead em `/leads` (“Novo lead”)
- Abrir lead na Mesa `/calls` e percorrer SPIN
- Progresso SPIN espelhado em `/leads` (sem checkbox)
- Gravação na tabela `leads` (com ressalva da divergência de data)

## O que NÃO fazer agora (reset)

- Não criar segundo CRM / nova tabela
- Não “unir tudo” em um redesign grande nesta fatia
- Não abrir Pessoa 360, Financeiro, App, KPIs, Abas

## Correção mínima possível (se a dona autorizar depois)

1. Botão **Novo lead** também na Mesa `/calls` (mesmo diálogo de `/leads`) — só atalho.  
2. Ajustar comparação de data `call_realizada_em` (aceitar `HH:mm` ou gravar com `:00`).  
3. Atualizar docs que ainda falam em “4 checkboxes”.

Prova de Discovery continua: **mesma próxima ação** após F5 em Hoje / Próximas ações.
