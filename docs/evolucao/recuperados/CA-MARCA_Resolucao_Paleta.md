# Resolução — Paleta de marca oficial (a dúvida da "cor errada")

## Proveniência

- **Origem:** PDF enviado pela Proprietária no chat, 24/08/2026 —
  "CA - MARCA - Guia de Marca Apresentação" (8 páginas: 3 variantes de
  logo, 1 página de paleta com HEX/RGB/CMYK, 1 página de tipografia, 3
  páginas de mockup de papelaria).
- **Preservado em:** `CA-MARCA_Guia_de_Marca_Oficial.pdf` (cópia integral,
  sha256 `e85bcf915845c17ff6f20a3110acbcf8007c6be58e06d730be74bb8c85869e0c`).

## Resposta definitiva

A paleta que está hoje aplicada globalmente em `main` (desde 23/08,
`src/lib/marca.ts` + `src/styles.css`) **bate exatamente** com este PDF,
swatch por swatch:

| Cor | HEX (PDF e código) |
|---|---|
| Navy | `#2F4B6E` |
| Preto | `#101010` |
| Creme | `#ECDFCD` |
| Dourado | `#FCB73A` |
| Terracota | `#9A3A2F` |

**Conclusão: não é bug do Lovable nem mudança sem aceite — é a paleta
oficial de verdade**, confirmada contra o PDF real. A paleta que eu vinha
citando nos meus próprios estudos anteriores (`#1B2B4B`/`#C9A84C`/
`#F5F0E8`/`#8B4513`) é a que este PDF e o código já tratavam como
**retirada** — ela veio do prompt original do projeto (`README.md`), que
nunca tinha sido atualizado. Corrigido agora com uma nota no `README.md`
apontando para a paleta vigente e para este documento.

Busca no código confirma que não sobrou nenhum uso real da paleta antiga:
os únicos lugares onde os hex antigos aparecem são a lista de "retirados"
(`AZUIS_RETIRADOS` em `marca.ts`) e testes automatizados que existem
justamente para **impedir** que a cor antiga volte
(`ca-portal-03-branding-cliente.test.ts`, `crm-mestre-export.test.ts`).

## O que ainda pode explicar "a cor errada" que você está vendo

Como o código já está correto, a causa mais provável do que você está
vendo no Lovable é uma destas três, e preciso que você confirme qual:

1. **Cache do preview do Lovable** — ele pode estar mostrando uma versão
   anterior ao commit de 23/08 que aplicou a paleta nova. Um refresh
   forçado ou nova publicação deveria resolver.
2. **O tom "atenção" (âmbar escurecido `#8A5A08`)** — criado no pacote de
   hoje (CA-LOVABLE-P2) para textos de alerta atingirem contraste
   acessível (AA). Ele é derivado do dourado oficial, mas mais escuro e
   acastanhado — pode ser isso que parece "fora do guia" ao olho, mesmo
   sendo uma escolha técnica válida (dourado puro não passa em contraste
   de texto).
3. Algo específico numa tela que eu ainda não localizei — se puder me
   dizer **onde exatamente** (qual tela, qual elemento) a cor parece
   errada, eu confirmo no código.

## Achado adicional: tipografia também diverge do guia impresso

Este PDF especifica: **Amolina Boutique Script** (decorativa, logo) +
**Montserrat** (funcional, família completa). O documento
`docs/portal/CA-PORTAL-01_Aplicacao_Guia_de_Marca.md` registra que
Montserrat "foi **recusada por decisão explícita**: a tipografia mantida é
Inter + Cormorant Garamond" — uma substituição real, documentada, mas que
diverge do guia impresso que você acabou de enviar.

Isso é o mesmo tipo de pergunta que a cor: **essa recusa de Montserrat foi
uma decisão sua de fato, ou é outra suposição não confirmada?** Se você
quiser Montserrat de volta (conforme o guia oficial), é uma mudança
localizada — trocar o carregamento de fonte em `src/routes/__root.tsx` e
os tokens `--font-sans`/`--font-serif` em `src/styles.css`.
