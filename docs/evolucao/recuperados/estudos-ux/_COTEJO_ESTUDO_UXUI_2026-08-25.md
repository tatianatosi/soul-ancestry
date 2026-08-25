# Cotejo do Estudo de UX/UI e Prontidão para Deploy

**Estudo-fonte:** `Clube_Ancestral_Estudo_UXUI_e_Prontidao_Deploy.docx`
(23/08/2026, 266 parágrafos) · **Cotejo:** 25/08/2026

## Proveniência

Zip `files_3.zip`, 36 arquivos enviados pela Proprietária em 25/08: o
estudo de UX/UI, 8 planilhas de análise (gap, pente-fino, veredito,
quadro evolutivo), um dashboard HTML e 24 prompts para Lovable/Perplexity.

O estudo cruzou quatro fontes — verificação tela a tela V1–V10, relatório
antes/depois de marca (26 páginas), histórico integral do Lovable
(~24.700 linhas) e o código-fonte publicado. É um trabalho sério: separa
o que leu do que inferiu, e trata contradição entre fontes como achado em
vez de "resolver" a favor do resultado mais confortável.

## Status dos P0 — três fecham com evidência de hoje

### P0.2 · Paleta global × relatório — **RESOLVIDO em 25/08**

O achado central do estudo (seção 4.2): o relatório de marca afirma em 26
páginas que a paleta nova está ativa "apenas na área de Pesquisa", mas
`src/styles.css` já define os valores novos no `:root` global. O estudo
levanta duas hipóteses e recusa escolher sem decisão escrita:

> (a) a paleta nova foi promovida a padrão e o relatório está
> desatualizado · (b) a promoção foi acidental e há regressão visual

**A hipótese (a) está confirmada.** O guia de marca oficial
(`CA-MARCA_Apresentacao_Oficial.pdf`, p. 4, enviado em 25/08) declara os
cinco valores com HEX/RGB/CMYK: `#2F4B6E`, `#101010`, `#ECDFCD`,
`#FCB73A`, `#9a3a2f` — exatamente o `:root`. O código está certo; o
relatório antes/depois é que ficou para trás.

A paleta antiga sobrevive apenas sob o seletor isolado
`[data-paleta="anterior"]`, comentado no próprio CSS como "congelada até
23/08/2026 — escopo isolado para comparação pontual". Não é padrão de
nada.

Registro escrito exigido pelo estudo: `CA-MARCA_Tipografia_Cotejo.md`.

### P0.3 · Vazamento de controles internos no App Cliente — **FECHADO**

O estudo pede confirmação **por código** (não por inspeção visual) de que
o build do cliente nunca renderiza rótulos internos. Verificado:

- Nenhuma ocorrência de `MÓDULOS INTERNOS`, `Devolutivas (interno)` ou
  `VISUALIZAR (INTERNO)` em `src/routes/portal/` ou `src/components/portal/`
- `useToggle` — o controle de alternância App Cliente/Desk — está definido
  em `brand.tsx` mas **não é usado em nenhum lugar do runtime**, coerente
  com o comentário do próprio arquivo: *"CA-UX-04: o controle de
  alternância pertencia ao protótipo e foi retirado do runtime"*

O que o estudo viu nas capturas era o ambiente de mockup, não o build do
cliente. O protótipo está arquivado em `archive/mockups/`.

### DH-010 · Classificar `src/data` — **existe, não pendente**

`docs/migracao/INVENTARIO_SRC_DATA_E_CLASSIFICACAO_v1.0.md` (19/08)
classifica arquivo a arquivo, com SHA, em quatro classes:
`CONFIGURACAO_LOCAL`, `TEMPLATE_OU_CASO_MODELO`, `DADO_DE_CASO_NO_BUNDLE`
e `SNAPSHOT_OU_DERIVADO`. O próprio documento se declara **preliminar**
até cruzamento com Supabase/RLS — então DH-010 não está fechado, mas está
muito além de "pendente".

## Status dos P0 — os que continuam abertos

### P0.1 · Reverificar login da proprietária — **PIOROU, e o estudo estava certo**

O estudo alerta contra aceitar declaração de sucesso sem teste real,
citando o próprio histórico: *"PARE DE DECLARAR ACESSO ENTREGUE. O TESTE
REAL FALHOU."*

Em 25/08 a Proprietária tentou entrar em
`soul-ancestry.vercel.app/equipe/entrar` e recebeu o erro genérico
"Não foi possível entrar". Diagnóstico por leitura de código: esse texto
só é produzido pelo `catch` externo, ou seja, **uma exceção antes da
autenticação** — não credencial errada. `supabase` é um Proxy lazy, criado
no primeiro acesso; sem `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
ele lança `"Missing Supabase environment variable(s)… Connect Supabase in
Lovable Cloud."`

A correção de 23/08 (reset de senha no Supabase) não cobre isto: é
configuração de ambiente na Vercel, não dado. Some-se a divergência de
projeto Supabase — `.env` aponta para `liiqqibnirnpnvjmjrpj`, a
Proprietária confirmou posse de `zsxpdbhdvbuulwpepemd`.

### P0.5 · DH-001/002/003 (SKU, preço, fonte comercial) — **avançou**

DH-002 (congelar preço/condição por oferta) teve avanço material em
24–25/08: 25 SKUs homologados com a regra "preço sugerido prevalece em
divergência", com preço anterior preservado em `preco_historico_legado` e
responsável/data/motivo registrados
(`output/catalogo/precos-a-homologar.csv`). DH-001, DH-003 e DH-008
seguem abertos.

## P1 e P2

- **P1 · contraste WCAG AA do dourado** — endereçado antes deste estudo:
  `--atencao: #8A5A08` (âmbar escurecido) é o token de texto; `#FCB73A`
  fica para preenchimento e borda. Ver changelog `2026-08-24_CA-LOVABLE-P2`.
- **P2 · recuperar artefatos históricos** — em grande parte feito: 26
  documentos em `docs/evolucao/recuperados/`, CA-EVO-01 recuperado, CA-01
  a CA-08 encerrado por decisão ("não reabrir"). Anexos II/IV/V seguem
  pendentes de texto jurídico preenchido.

## O que o estudo não cobre e continua sendo o problema central

O estudo audita **prontidão** (o que impede publicar) muito bem. Não trata
de **arquitetura de informação** (onde cada coisa mora e como uma leva à
outra) — que é o que a Proprietária relata ao usar: *"listas e mais listas,
nada de sistemas funcionando entre si"*.

O caso mais claro está no código, não no estudo: a cadeia da jornada de 11
elos — a única tela que mostra os sistemas conversando — é renderizada
exclusivamente em `/biblioteca-mensagens`. E os quatro motores construídos
em 24–25/08 (fila de follow-up, agenda assistida, rascunhos governados,
override da Proprietária) têm **zero** superfície.
