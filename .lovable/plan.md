# Paridade visual com o mockup — Árvore, Jornada, Documentos e Conta

Referência: páginas 4, 6, 7 e 9 de clubeancestralmockup.pdf (conferidas antes de editar). Só aparência das 4 abas do App; dados, permissões e as outras abas ficam como estão.

## 1. Árvore (pág. 6)
- Árvore inteira dentro de uma moldura editorial única (borda dourada fina, cantos clássicos, fundo creme).
- Cartões de pessoa compactos: nome em Cormorant Garamond, geração como etiqueta discreta (ex.: "G4").
- Retirar o espaço vazio e os cabeçalhos grandes entre gerações; as gerações ficam coladas, ligadas pelas linhas douradas já existentes.
- Destaque dourado mantido em Otto, Lotte e Ana Luiza ("Você"); linhas materna (Ana Maria → Cristiane → Ana Luiza) e paterna (Cleusa → Adair) contínuas.

## 2. Jornada (pág. 4)
- No computador: duas colunas lado a lado — Linha Ancestral (1895, 1938–39, 1941) à esquerda e Linha do Requerente (2026) à direita.
- No celular (375 px): as duas linhas uma abaixo da outra, sem sair da tela.
- Retirar o bloco cinza/acordeão do meio ("União de Ramos" vazio) e as abas Origem/Processo/Memória quando atrapalham a leitura contínua; manter "Jornada" em uma linha no rodapé.

## 3. Documentos — Cofre de acervo (pág. 7)
- Dois cartões editoriais (fundo branco, borda sutil, ícone clássico):
  - "Certidão de Nascimento — Otto Reimer (Graz, 1895)" com selo "Consular MA 35".
  - "Dossiê de Reparação Histórica e Ficha de Imigração (§58c StbG)".
- Como os PDFs ainda não foram enviados, cada cartão mostra o selo "Acervo sob conferência técnica" e nenhum botão de ver/baixar. Quando o arquivo for enviado e liberado no Caso 360, o cartão passa a mostrar os botões em Navy e Ouro.
- Cartão adicional "Acervo de Viena sob conferência técnica".
- Remover os blocos repetidos de "nada por aqui".

## 4. Minha Conta (pág. 9)
- Ficha nominal compacta: Titular Ana Luiza Gomes Silveira Rodrigues; Processo Cidadania Austríaca §58c StbG (CA-CID-AT-FAM-2026-001); Modalidade Projeto Familiar (3 assinaturas ativas).
- Botão verde "Falar com a Especialista no WhatsApp", abrindo conversa com +55 11 98838-4807.
- Faturas continuam mostrando só o que existe; nenhuma cobrança é criada.

## Entrega
Capturas das 4 abas em 375 e 1280 px, lado a lado com a página correspondente do mockup; verificação automática e testes do App. Nada é publicado.

## Detalhes técnicos
- Árvore: `src/components/portal/explorador-arvore.tsx` + `portal-v11.css` (moldura, cartões compactos, gap entre gerações reduzido; conectores SVG recalculados).
- Jornada: rota/componente da Jornada em `src/routes/portal/` — grid de 2 colunas ≥ 900 px.
- Documentos: os dois cartões do caso canônico (CA-CID-AT-FAM-2026-001) ficam numa lista fixa de "acervo em conferência" só de leitura, sem link; botões só quando houver documento liberado com arquivo.
- Conta: `src/routes/portal/conta.tsx`; número do WhatsApp guardado como constante da Conta e registrado em memória do projeto; texto "3 assinaturas ativas" por decisão da Proprietária (12/10/2026).
