# App Cliente V4 — corte de paridade (Ana Luiza)

## Decisões já tomadas
- Ana Maria Reimer é **avó** do Adair; Cleusa segue como **mãe** do Adair.
- Radar e Documentos ficam **honestos**: percentual só onde houver base de cálculo; botões de ver/baixar só com PDF enviado e liberado no Desk.

## 1. Família na Árvore (dados)
- Conferir os vínculos já registrados entre Ana Maria, Cleusa e Adair.
- Se o vínculo Ana Maria → Cleusa (mãe/filha) já estiver nas fontes do dossiê, reativá-lo; caso contrário, pedir confirmação antes de criar (não inferir parentesco).
- Restaurar Cleusa → Adair, se estiver arquivado.
- Gerações: Ana Luiza G1 · Adair/Cristiane G2 · Cleusa G3 · Ana Maria G4 · Lotte/Otto G5 · Rudolf G6 · Heinrich G7.
- Destaque dourado volta para Ana Luiza e para Lotte e Otto (casal austríaco mais antigo ligado por casamento).

## 2. Árvore (visual)
- Linhas douradas desenhadas entre os cartões das gerações (não só no quadro abaixo), seguindo os vínculos aprovados.
- Cartões brancos, moldura clássica suave, sem overflow em 375 px.

## 3. Home
- Faixa de boas-vindas com código do projeto e famílias publicadas.
- "3 achados em destaque" usa os três marcos históricos publicados (1895, 1938–39, 1941) — sem criar achado novo.
- Cartão Próxima Ação com botão de suporte existente.

## 4. Jornada
- Linha Dupla Europa → Brasil com os 4 marcos publicados; conferir "Jornada" em linha única no rodapé e no cabeçalho em 375 px.
- Texto de Graz só muda se você aprovar a frase "Em busca nos arquivos paroquiais da Áustria — Graz (1895)" para o marco (posso gravar no Desk com autorização).

## 5. Radar
- Nova tentativa de teia maior (~70% do cartão) com nomes dos eixos em duas linhas para não cortar; percentuais só onde houver cálculo, senão "Em pesquisa".

## 6. Documentos, Legado, Conta
- Documentos: cofre em duas partes (Acervo liberado / Em busca e conferência), sem "Não registrado"; botões Navy/Ouro aparecem quando houver PDF liberado.
- Legado: conferir capas navy/terracota (já existentes).
- Conta: nome e código já reais; "3 assinaturas familiares" só se registrado na condição comercial do caso — senão permanece a condição prevista.

## Entrega
- Typecheck e testes do App; capturas das 7 abas em 375 e 1280.
- Nada publicado no site sem sua autorização.

## Detalhes técnicos
- Dados: `genealogical_relationships` (arquivar/reativar com motivo, auditoria), `research_people.generation`, `app_projections`.
- Código: `explorador-arvore.tsx` (SVG de conectores entre gerações), `radar-seis-eixos.tsx`, `routes/portal/index.tsx`, `documentos.tsx`, `portal-v11.css`.
