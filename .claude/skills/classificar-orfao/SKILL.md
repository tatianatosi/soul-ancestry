---
name: classificar-orfao
description: Dá veredicto a um módulo/função/componente sem chamador aparente, seguindo a regra do AGENTS.md ("peça órfã é religada com prova de uso ou aposentada com classificação, nunca apagada em silêncio"). Use sempre que encontrar código morto, função sem chamador, ou um candidato a "dívida" numa auditoria — antes de propor apagar qualquer coisa.
---

# Classificar órfã (nunca apagar em silêncio)

## Por quê esta skill existe

`AGENTS.md`: "Nada arquiva sem `COMPROVADO_EM_USO` com prints autenticados
da Proprietária; build/teste não é prova." E para código sem chamador: toda
peça órfã recebe um veredicto escrito — nunca um `git rm` direto. O
registro vivo deste padrão é `src/lib/orfaos-classificados.ts` + o teste
que o acompanha (`orfaos-classificados-2026-10-04.test.ts`), que já cobre
`createServerFn` sem chamador em `src/lib/*.functions.ts`. Esta skill
generaliza o MESMO julgamento para qualquer outro candidato a morto que a
varredura automática não alcança (componente, rota, módulo em `src/data/*`,
painel inteiro) — a disciplina é a mesma mesmo sem o teste cobrindo.

## Os 4 veredictos (sem um quinto)

- **`RELIGAR`** — fecha lacuna real de operação. A peça tem valor, só
  faltou ligar numa tela. Entra na fila de execução (ligar de fato, não só
  prometer).
- **`CASCA_DUPLICADA`** — a mesma lógica já chega à tela por outro
  caminho. Não religar — religar criaria um segundo caminho vivo para o
  mesmo trabalho, que é exatamente o que o `AGENTS.md` proíbe.
- **`APOSENTADA_CLASSIFICADA`** — função/componente que uma versão mais
  forte substituiu (gate melhor, máquina de estados real, etc.). Nomeie
  quem faz o trabalho hoje.
- **`AGUARDA_DECISAO`** — depende de uma decisão de produto que só a
  Proprietária pode tomar (ex.: "isto é canônico, é legado, ou funde com o
  outro caminho?"). Nunca "pendente" genérico — o `destino` precisa nomear
  a decisão exata que falta.

## Passo a passo

1. **Prove que é órfã antes de classificar** — não confie em "parece
   morto". Grep em três lugares, nesta ordem:
   - `src/routes` e `src/components` — chamador de tela (import ou uso
     direto do nome).
   - Outros módulos em `src/lib` — chamador vindo de outro escritor/leitor
     (import ou `nome(`). Menção em texto/comentário não conta.
   - Se for componente/rota (fora do padrão `createServerFn` que o teste
     já cobre): grep pelo nome do componente/arquivo de rota em TODO o
     `src/`, não só `src/lib`.

   Exemplo real desta sessão: a auditoria das 195 PRs apontou
   `selo-caso-cliente.ts`/`rotuloSeloCaso` como órfã por procurar o nome do
   MÓDULO; `grep` pelo nome da FUNÇÃO achou a chamada em
   `elementos-mockup.tsx:88`, que é importado por rotas reais do portal.
   Não era órfã — era busca errada. Sempre confira pela função/componente
   em si, nunca só pelo nome do arquivo.

2. **Escreva o veredicto com motivo real** — "por quê", em uma frase que
   cite o que substituiu (para `CASCA_DUPLICADA`/`APOSENTADA_CLASSIFICADA`)
   ou a decisão exata que falta (para `AGUARDA_DECISAO`), nunca um rótulo
   vazio. O teste que acompanha `orfaos-classificados.ts` já recusa motivo
   com menos de 40 caracteres e destino com menos de 8 — trate isso como o
   padrão mínimo mesmo fora daquele arquivo.

3. **Se for `createServerFn` em `src/lib/*.functions.ts`** (o caso que o
   teste automático cobre): adicione a entrada em
   `ORFAS_CLASSIFICADAS` (`src/lib/orfaos-classificados.ts`), rode
   `npx vitest run src/lib/__tests__/orfaos-classificados-2026-10-04.test.ts`
   e confirme que passa. Se o teste 1 falhar nomeando a sua função, é sinal
   de que a classificação ficou fora do array — corrija antes de seguir.

4. **Se for componente, rota, ou módulo fora desse escopo** (o caso dos
   "122 módulos mortos" / ilha de `src/data/*` apontados em auditoria):
   não force a entrada em `orfaos-classificados.ts` (o teste dali é
   específico de `createServerFn`). Registre o mesmo veredicto — módulo,
   nome, veredicto, motivo, destino — no documento de auditoria/plano que
   motivou a busca, ou peça ao usuário onde registrar um inventário formal
   novo se for a primeira vez que esse tipo de órfã aparece. O que não
   muda: nunca apagar sem essa tabela existir primeiro.

5. **Nunca pule direto para `RELIGAR` por impulso.** Religar sem medir é
   o erro que o próprio `orfaos-classificados.ts` documenta ter cometido
   antes do Corte F (05/10/2026): três entradas marcadas `RELIGAR` eram, na
   verdade, versão crua de um caminho que JÁ existia — religar teria criado
   o segundo caminho vivo que a regra proíbe. Antes de marcar `RELIGAR`,
   confirme que não existe NENHUM outro caminho fazendo o mesmo trabalho
   hoje (repita o passo 1, procurando pelo que a peça FAZ, não só pelo seu
   nome).

## Nunca fazer

- `git rm`/deletar o arquivo antes de o veredicto existir por escrito.
- Classificar `AGUARDA_DECISAO` sem nomear a decisão exata (vira depósito).
- Confiar em "o teste passa" ou "o build passa" como prova de uso — o
  `AGENTS.md` já descarta isso explicitamente.
- Buscar só pelo nome do módulo/arquivo quando o que importa é o nome da
  função/componente exportado.
