# Cotejo de tipografia contra o guia de marca oficial

**Documento-fonte:** `CA-MARCA_Apresentacao_Oficial.pdf` (8 páginas, Adobe
Photoshop, criado em 29/04/2025) · **Cotejo:** 25/08/2026

## Proveniência

Enviado pela Proprietária em 25/08/2026. É um documento **distinto** do
`CA-MARCA_Guia_de_Marca_Oficial.pdf` já recuperado (hashes diferentes:
`c323dd6e…` × `e85bcf91…`) — versão condensada em formato de apresentação.

## Paleta — confirmada em definitivo

A página 4 traz os cinco valores com HEX, RGB e CMYK. Batem **exatamente**
com o bloco `:root` de `src/styles.css`:

| Guia | Código | Papel |
| --- | --- | --- |
| `#2F4B6E` | `--navy` | ✅ idêntico |
| `#101010` | `--preto` | ✅ idêntico |
| `#ECDFCD` | `--cream` | ✅ idêntico |
| `#FCB73A` | `--gold` | ✅ idêntico |
| `#9a3a2f` | `--terracotta` | ✅ idêntico |

Encerra qualquer dúvida sobre "cor errada": a paleta vigente no código é a
oficial. A paleta antiga (`#1B2B4B` / `#C9A84C` / `#F5F0E8` / `#8B4513`)
não aparece em nenhuma página deste documento.

## Tipografia — duas divergências reais

A página 5 declara **duas** tipografias, e só duas:

| Guia oficial | Uso declarado |
| --- | --- |
| **Amolena Boutique Script — Regular** | Tipografia Decorativa (Logo) |
| **Montserrat-Regular** | Tipografia Funcional |

O código declara **três** faces (`src/routes/__root.tsx`, `src/styles.css`):

| Código | Token | Situação frente ao guia |
| --- | --- | --- |
| Montserrat | `--font-sans` | ✅ **correto** — confirma a troca feita em 24/08 (era Inter) |
| Great Vibes | (script) | ⚠️ **não é a face do guia.** O guia especifica Amolena Boutique Script |
| Cormorant Garamond | `--font-serif` | ⚠️ **não consta do guia.** Nenhuma das 8 páginas a menciona |

### Por que isso importa

`Cormorant Garamond` não é um detalhe: é `--font-serif`, aplicada a
`h1, h2, h3` e a toda classe `.font-serif`. Governa o título de cada tela
do Desk e o número de cada cartão de indicador — é a voz visual dominante
da interface. E não está no guia.

`Great Vibes` é uma face de script gratuita do Google Fonts. Amolena
Boutique Script é comercial e não está no Google Fonts: usá-la na web
exige licença e auto-hospedagem (`@font-face`). A substituição por Great
Vibes provavelmente foi uma decisão de engenharia razoável — mas não está
registrada em lugar nenhum, o que a torna indistinguível de um engano.

### Decisões da Proprietária — 25/08/2026

Ambas resolvidas, registradas aqui como decisão consciente:

1. **O guia cobre marca e logo, não a interface.** Portanto Cormorant
   Garamond está **autorizada** como tipografia de interface do Desk e do
   App Cliente. Não é divergência: é escopo. O guia não pretende governar
   a tipografia de produto.
2. **Great Vibes é substituta autorizada** da Amolena Boutique Script na
   aplicação digital. Não é preciso licenciar nem auto-hospedar a Amolena
   para a web. A Amolena permanece a face do logo em peças de marca.

Com isso não resta nenhuma divergência tipográfica em aberto entre o guia
e o código.

## Como a marca aparece hoje no App Cliente — dois achados

`src/components/portal/portal-shell.tsx` (linhas 84–86):

```tsx
<BrandLogo size={36} variant="client-dark" showText={false} />
<p className="font-serif text-lg leading-tight text-gold">Clube Ancestral</p>
```

**Achado 1 — o wordmark do App Cliente não usa a face de script.**
O shell passa `showText={false}`, o que desliga o wordmark do `BrandLogo`
(o único lugar do código onde Great Vibes é aplicada, `brand.tsx:65`), e
depois escreve "Clube Ancestral" por conta própria em `font-serif` —
Cormorant Garamond — em dourado. Ou seja: a substituição que acabou de ser
autorizada não está em uso na tela do cliente. O nome da marca aparece em
Cormorant, não em script.

Isso é decisão de design a confirmar, não defeito: pode ser deliberado
(script em peça de marca, serifada na interface) ou pode ser um efeito
colateral de `showText={false}`.

**Achado 2 — a imagem do logo quebra fora do Lovable.**
`BrandLogo` só cai no placeholder textual quando `BRAND_LOGO_URL` é nulo.
Ela não é: aponta para `/__l5e/assets-v1/…`, rota exclusiva do Lovable.
Fora de lá o `<img>` dá 404, e **não existe `onError`** — nenhum fallback.
O cabeçalho do App Cliente renderiza um ícone de imagem quebrada ao lado
de "Clube Ancestral" em Cormorant dourado.

Atenuante: a projeção do App Cliente ainda não foi publicada (PEND-12), então
nenhum cliente real viu isso. Mas é a primeira coisa que vão ver quando for.

## O que este documento não resolve

Não traz regras de área de proteção, tamanho mínimo, usos proibidos, nem
versões monocromáticas do logo. Traz o logo positivo (fundo escuro texturado,
p. 1) e a versão sobre preto com wordmark em branco (p. 3), o que é
coerente com as variantes `client-dark` / `client-light` já implementadas
em `BrandLogo`.
