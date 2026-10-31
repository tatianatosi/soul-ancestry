# Por que "nada do que eu faço é salvo" — laudo medido

**Pedido da Proprietária, 24/10/2026:** *"prepare uma solução pois isso acontece em
todas as telas, abas tanto do app cliente como do desk nada do que faço é salvo ou
persiste… se voce auditar vai ver que esse bug que aconteceu agora acontece com tudo"*

Auditei. **A sua experiência é real, mas a causa não é a que eu supus** — e o meu
primeiro diagnóstico estava errado três vezes. Registro os erros porque eles mudam
o que deve ser construído.

---

## 1. O que eu medi errado, e por quê

Parti da hipótese de que as escritas perdiam a recusa do banco em silêncio. Medi
três vezes, por regex, e os três números caíram ao ler o código:

| Tentativa | Resultado | Por que estava errado |
|---|---|---|
| 1ª | 124 escritas "sem checar erro" | A janela de ±400 caracteres não via o `exigirLinhaGravada(` que abre **antes** do `await` |
| 2ª | 189 (47%) | Contou `headers.delete(` como escrita no banco |
| 3ª | 98 (33%), 29 só no GoLive | Os 29 do GoLive **estão** protegidos, por helpers chamados `erroOuNadaGravado(` e `erro(` que a regex não conhecia |

Conclusão honesta: **não consigo sustentar "as escritas se perdem" como defeito do
repositório.** A camada existe e é sólida.

## 2. A camada de escrita está certa

`src/lib/persistencia.server.ts`:

```ts
export function exigirLinhaGravada(res, tabela) {
  if (res.error) throw new Error(res.error.message);
  const linhas = Array.isArray(res.data) ? res.data.length : res.data ? 1 : 0;
  if (linhas === 0) throw new Error(`${CODIGOS_PERSISTENCIA.SEM_LINHA}: nada foi gravado em ${tabela}. O registro não existe nesta organização, foi arquivado ou seu papel não permite editar.`);
}
```

Lança no erro **e** em zero linhas, com mensagem que já distingue as três causas.
`erroOuNadaGravado` do GoLive delega para ela. E na interface, **278 das 297**
mutations (94%) já têm `onError`.

## 3. A causa real, essa sim medida e verificável

```
funções de trigger no schema ........................ 167
  que fazem RAISE EXCEPTION ......................... 134
  total de pontos de RAISE EXCEPTION ................ 692
tabelas com trigger que pode recusar escrita ........ 138 de 143
```

Só `crm_casos` tem **62** pontos de recusa. `leads` tem 44. `documents`, 14.

**O sistema foi construído para recusar.** Isso é correto: são as travas que
protegem dado de cliente real. O defeito não é a recusa — é que **nenhuma tela te
diz quais portões estão fechados no caso em que você está trabalhando, antes de
você agir.**

Você clica, o portão recusa, e a devolutiva é uma frase técnica sem caminho. Em
cada aba, o dia inteiro, isso é indistinguível de "nada salva".

### O caso que provou isso hoje

`fn_piloto_caso_guard` recusa qualquer ativação do caso da Ana enquanto houver
linha em `piloto_bloqueios` com `status='aberto'` e `criticidade='critico'`. São
19, paradas desde agosto. A tela lia outra fonte (`case_ativacao_bloqueios_reais`,
que dá 0), mostrava "pronto", e prometia que "pendências não impedem a
proprietária" — enquanto o banco recusava. Corrigido em PR #188, para **um** portão.

**Faltam 691.**

## 4. A solução proposta

Generalizar o que o #188 fez para um portão, em três peças:

### Peça A — Inventário de portões por caso
Um leitor único que responde: *"o que o banco vai recusar neste caso agora, e por
quê"*. Varre as fontes de trava reais (as 5 de `case_ativacao_bloqueios_reais` +
`piloto_bloqueios` + as demais que os guards consultam) e devolve lista com: o
portão, a tabela, o que ele protege, e qual ação o abre.

Sem inventar tabela nem vocabulário: cada portão aponta para o trigger real.

### Peça B — Tradutor de recusa
Hoje a recusa chega como texto cru do Postgres. Um mapa de `raise` → orientação
("o que isso protege / o que fazer"), aplicado no ponto único por onde as recusas
já passam (`persistencia.server.ts`). Um lugar, 692 recusas.

### Peça C — Trava contra reincidência
O comentário de 05/09 neste repositório descreve **esta mesma classe de bug** sendo
corrigida para 4 fontes — e a quinta escapou. Sem trava, escapa de novo.

Teste que falha se um portão de banco existir sem estar no inventário da Peça A.
Este repositório já usa exatamente esse estilo (590 arquivos de teste lendo o
código-fonte), então a trava é idiomática aqui.

### Primeiro corte proposto
1. As **19 mutations sem `onError`** — pequeno, mecânico, elimina o silêncio total.
   As piores: `onboarding.$id.tsx` (3, uma já corrigida no #188),
   `conteudo-editorial-conectado.tsx` (3), `triagem-ancestralscan.tsx` (2),
   `reconciliar-contato-partes.tsx` (2), `importacoes.tsx` (2).
2. Peça A para o **Caso 360**, onde você decide — não espalhada por 13 telas.
3. Peça C travando o resultado.

## 5. O que eu não vou decidir no seu lugar

O inventário **mostra** portões; não os abre. Abrir qualquer um dos 19 do caso da
Ana (contrato assinado, consentimento, revisão jurídica, representação do menor) é
decisão sua sobre dado de família real — e, pela regra 3 da Decisão de Hospedagem
Única, escrita no banco é proposta em `supabase/pendentes/` e aplicada pelo Lovable.

## 6. Revisão de 31/10/2026 — o que mudou desde este laudo

Pedido: revisar este laudo. Reconferi os números centrais contra o banco de
produção vivo e o estado das três peças propostas na seção 4. Não reescrevo o
texto acima — fica como registro do que foi medido em 24/10. Isto é o que mudou.

### 6.1 O bloqueio que "provou isto hoje" (seção 3) está fechado

`piloto_bloqueios` com `status='aberto'` e `criticidade='critico'` para o caso da
Ana: eram 19 em 24/10; **hoje são 0** (reconferido por consulta direta). A PR #196
("Remove as camadas de bloqueio da ativação do caso — guards cedem à
Proprietária", mesclada em 25/10) é a causa provável, mas este laudo não a
investigou linha a linha — fica como achado, não como atribuição comprovada.

### 6.2 Os números da seção 3, reconferidos (metodologia diferente, não comparável 1:1)

| Medida | Laudo (24/10) | Hoje (31/10) |
|---|---|---|
| Funções de trigger no schema | 167 | 169 |
| ...que fazem `RAISE EXCEPTION` | 134 | 137 |
| Tabelas com trigger que pode recusar escrita | 138 de 143 | 170 de 195 |

O crescimento acompanha o banco (195 tabelas hoje contra 143 em 24/10 — mais
tabelas novas, não mais travas na mesma base). Não reconferi "278 das 297
mutations (94%) com `onError`" nem as "98 (33%) sem checar erro": são contagens
por regex sobre código-fonte que o autor original já havia errado três vezes
antes de convergir (seção 1); refazer com um grep mais simples teria menos
rigor que o original, não mais. Ficam como estavam, sem reconfirmação.

### 6.3 As três peças propostas (seção 4)

- **Peça B (tradutor de recusa)** — construída em 29/10 numa branch nunca
  mesclada (`claude/modest-carson-28pij2`, PR #197, sob o título enganoso
  "chore: ignora .cartographer/"). Portada para `main` nesta revisão
  (`src/lib/recusa-traducao.server.ts`, `src/lib/persistencia.server.ts`),
  depois de reconferir os três textos de recusa que ela traduz contra os
  gatilhos vivos no banco (`pg_get_functiondef`) — ainda batem. 601 arquivos de
  teste, 0 falhas; build e typecheck limpos.
- **Peça A (inventário de portões)** — também construída em 28/10, na mesma
  branch. Não portada: o diff toca `casos.$caseId.index.tsx` com mais de 5.400
  linhas de diferença sobre uma versão do arquivo de 25/10, e esse arquivo é o
  mais editado do repositório (Lovable mexe nele quase todo dia). Cherry-pick
  direto arrisca reverter ou conflitar com trabalho de UI de uma semana.
  Precisa de reconstrução deliberada contra o `casos.$caseId.index.tsx` de
  hoje, não de um merge mecânico.
- **Peça C (trava contra reincidência)** — depende do arquivo que a Peça A cria
  (`inventario-portoes.server.ts`); sem a Peça A em `main`, não há onde portar
  a Peça C ainda.
- **Primeiro corte proposto (seção 4, lista final)**: item 1 (19 mutations sem
  `onError`) não foi reconferido nesta revisão — precisa de nova varredura,
  não suposição a partir do número de 24/10.

### 6.4 Achado relacionado, fora deste laudo

Nesta mesma revisão, a Conta do App Cliente mostrava um valor de condição
comercial **hardcoded por ID de caso** (só a Ana), que tinha prioridade sobre a
assinatura real já publicada desde 05/10 — mascarando-a. Não é um portão de
banco (este laudo não cobre isso), mas é a mesma classe de sintoma ("eu publico
algo e o cliente nunca vê") por uma causa diferente: um atalho sem fonte viva,
não uma recusa silenciosa. Corrigido e portado junto nesta sessão
(`src/lib/portal-dados-vivos.functions.ts` lê `case_commercial_condition` pelo
caso ativo, para qualquer família).
