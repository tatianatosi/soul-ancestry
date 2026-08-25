# Cotejo da matriz de conciliação contra o código de hoje

**Data:** 25/08/2026 · **Fonte:** `matriz-conciliacao-arquitetura-prompts-clube-ancestral-v2.csv`,
neste mesmo acervo (68 arquivos enviados pela Proprietária em 25/08).

## Proveniência do acervo

Zip `artifacts1.zip`, 68 arquivos, ~1,1 MB: prompts do Lovable, planos de
migração, decisões canônicas, registros de implantação e duas matrizes de
conciliação. É o conjunto de prompts "que deveriam ser executados".

**A matriz v2 é de uma thread anterior.** Ela cita "935 testes/build local"
como evidência de P02; hoje o repositório tem **137 arquivos de teste e
1.297 testes**. Tudo que ela marca como pendente precisa ser relido com
essa defasagem em mente — e foi o que este cotejo fez.

## Resultado: 12 de 12 áreas existem como rota hoje

| ID | Área | Status na matriz | Hoje |
| --- | --- | --- | --- |
| A01 | Hoje | PARCIAL | `painel.tsx` ✅ |
| A02 | Marketing | **PENDENTE** | `marketing.tsx` ✅ — é a aba 2 do menu |
| A03 | Comercial | PARCIAL | `leads.tsx` ✅ |
| A04 | Casos | PARCIAL | `casos.index.tsx` ✅ |
| A05 | Pesquisa | PARCIAL | `pesquisa-modulo.index.tsx` ✅ |
| A06 | Fontes | PARCIAL | `fontes-genealogicas.tsx` ✅ (G-08) |
| A07 | Assistente | PARCIAL | `assistente-transversal.tsx` + `pesquisa/assistente.tsx` ✅ |
| A08 | Cliente (espelho) | **PENDENTE** | `/acessos-portal#espelho` — "Espelho read-only da projeção" ✅ |
| A09 | Financeiro | PARCIAL | `financeiro.tsx` ✅ |
| A10 | Operação | PARCIAL | `ops.tsx` ✅ |
| A11 | Governança | **NÃO COMPROVADO** | ver abaixo ✅ |
| A12 | Administração | PARCIAL | `equipe.tsx` ✅ |

### A11 — "usuária relata perda de Jurídico e Radar Interno"

Não se perderam. Estão no menu, com rótulo humano:

- `/matriz-juridica` → **"Validação Jurídica (bloqueios)"**, presente em
  três grupos do menu (Comercial, Casos e Governança)
- `/qualidade` → **"Radar Interno e Qualidade"**, no grupo Casos

O que aconteceu foi renomeação: CA-UX-03 trocou rótulos técnicos por
rótulos humanos e reagrupou o menu em 8 grupos. A capacidade continuou;
o nome pelo qual ela era procurada mudou.

### P02 — classificação e bloqueio de dados não reais

Matriz dizia "IMPLEMENTADO LOCALMENTE · validar domínio publicado".
Continua exatamente assim, com número maior: 1.297 testes verdes
localmente, e **nenhuma prova em domínio publicado autenticado** — ver
`docs/auditoria/CA-AUD-10_Fechamento_Prontidao_Operacional_2026-08-25.md`.
Este é o único item da matriz cujo status não mudou em nada.

## A conclusão que importa

O inventário está praticamente completo: **quase tudo que a matriz dava
como perdido ou pendente existe hoje como rota.** O problema mudou de
lugar.

O que não funciona é a **arquitetura de informação** — onde cada coisa
mora e como uma leva à outra. A prova mais clara não está nesta matriz,
está no código: a cadeia da jornada de 11 elos, que é justamente a tela
que mostra os sistemas conversando entre si, é renderizada em **um único
lugar** — `/biblioteca-mensagens`, uma tela de modelos de texto dentro de
Governança → Bibliotecas.

Existir como rota não é a mesma coisa que ser encontrável. É por isso que
o Desk parece "listas e mais listas": as peças estão todas lá, e nenhuma
aponta para a seguinte.

## O que continua genuinamente aberto

1. **Prova autenticada em domínio publicado** (P02, P01, P03) — bloqueada
   hoje por variáveis de ambiente na Vercel, não por falta de código.
2. **Arquitetura de informação** — mover a cadeia de 11 elos para onde a
   decisão acontece; ligar às telas os quatro motores construídos em
   24–25/08 (fila de follow-up, agenda assistida, rascunhos governados,
   override), que hoje têm **zero** superfície.
3. **A07/A11 e afins** — não é implementar, é conferir guardas e RLS.
