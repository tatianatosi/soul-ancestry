# Prompt Mestre Unificado para Claude Sonnet: As 7 Primeiras Telas do Mockup Normativo (Páginas 3 a 9)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 11:15 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: prompt mestre unificado, especificacao visual 7 telas e delegacao sonnet
caminho_no_repositorio: docs/prompts/2026-10-13-prompt-mestre-sonnet-7-telas-mockup.md
fontes:
  - Mockup Normativo de 17 Páginas (clubeancestralmockup.pdf, Páginas 3 a 9)
  - Repositório Git (tatianatosi/soul-ancestry/src/routes/portal/)
escopo: >
  Instrução mestra completa e consolidada para o Claude Sonnet implementar com paridade estrita
  todas as 7 primeiras telas do App Cliente (páginas 3 a 9 do Mockup Normativo de 17 páginas).
premissas:
  - O bloco do App Cliente ocupa exatamente as páginas 3 a 9 do mockup oficial;
  - O Claude Sonnet atua diretamente nos arquivos React/Tailwind em src/routes/portal/;
  - Paridade visual completa de containers, grids, tipografia e cores institucionais.
criterio_de_aceite: >
  Implementação das 7 telas no repositório;
  teste de build limpo;
  substituição do Lovable pela esteira de código do Sonnet.
```

---

## O Mapeamento Canônico do Mockup de 17 Páginas

O documento normativo do Clube Ancestral divide-se com exatidão em dois grandes blocos:
- **Páginas 1 e 2:** Capa e Sumário da Experiência Mobile [file:492].
- **Páginas 3 a 9:** **AS 7 TELAS DO APP CLIENTE** (Objeto deste prompt) [file:492].
- **Páginas 10 a 17:** As 7 telas do Desk Intelligence interno [file:492].

---

## Texto do Prompt Mestre para Copiar e Colar no Claude Sonnet

```markdown
ATUAÇÃO COMO ENGENHEIRO FRONTEND PRINCIPAL — CLUBE ANCESTRAL (CLAUDE SONNET)

Você assume o desenvolvimento e fechamento definitivo do App do Cliente no repositório `tatianatosi/soul-ancestry`. Esqueça o Lovable.

SUA MISSÃO: Implementar com paridade visual estrita TODAS AS 7 PRIMEIRAS TELAS do Mockup Normativo de 17 páginas (`clubeancestralmockup.pdf`, páginas 3 a 9), correspondentes aos arquivos sob `src/routes/portal/`.

URL DE PRODUÇÃO: https://soul-ancestry.lovable.app/portal
PALETA INSTITUCIONAL: Navy (#1B2B4B / #233659), Ouro escuro (#A88434), Fundo Creme (#F0EEE9 / #F5F0E8), Branco (#FFFFFF).

EXECUÇÃO ARQUIVO POR ARQUIVO:

1. TELA 1/7: HOME (`src/routes/portal/index.tsx` — Página 3 do Mockup)
- Header/Painel: "Projeto familiar — Família Silveira Rodrigues", selo "Cidadania Austríaca (§ 58c StbG)" e boas-vindas.
- Núcleo: Pílulas com os participantes reais (Ana Luiza, Adair, Alice, menor Felipe).
- Próximo Passo: Container destacado com as 3 Próximas Ações e botão de navegação rápida com seta dourada.
- Família Conectada: Card com ícone UsersRound e contagem de pessoas na árvore.
- Achados da sua História: Grid em 2 colunas com o componente CaCard, mostrando o ano em destaque dourado (ex.: 1895), tipo e resumo.
- Suporte Oficial: Card com botão direto para o WhatsApp oficial (11 98838-4907).

2. TELA 2/7: JORNADA (`src/routes/portal/jornada.tsx` — Página 4 do Mockup)
- Linha do Tempo em DUAS COLUNAS PARALELAS: Linha da Família (Ancestral) à esquerda e Linha do Processo à direita (não empilhe em 1 coluna só).
- Card de Transição/União em tom terracota suave/bege com itálico sálvia.
- Fiação contínua fina ouro e cinza conectando os marcos da jornada.

3. TELA 3/7: RADAR (`src/routes/portal/radar.tsx` — Página 5 do Mockup)
- Gráfico de teia amplo, preenchido de forma suave e ocupando 70% da largura útil.
- Grade 2x3 harmônica com os 6 cards dos eixos (Origem, Documentação, Pesquisa, etc.).
- Checklist de prontidão logo abaixo do gráfico indicando o status de cada eixo.

4. TELA 4/7: ÁRVORE (`src/routes/portal/arvore.tsx` — Página 6 do Mockup)
- Moldura nobre central em painel branco limpo, eliminando espaçamentos verticais excessivos.
- Renderização dos 8 elos canônicos (Heinrich → Rudolf → Lotte/Otto → Ana Maria → Cleusa Lúcia → Adair Júnior → Ana Luiza + Felipe).
- Destaque em ouro no nó da pessoa em foco e marco oficial de Graz 1895 vinculado a Otto Reimer.

5. TELA 5/7: DOCUMENTOS (`src/routes/portal/documentos.tsx` — Página 7 do Mockup)
- Checklist estruturado de 10 atos da cidadania austríaca.
- Tags coloridas de status real ("Em busca cartorária", "Aguardando", "Pendente") para cada certidão.
- Área de upload/envio do cliente visível e cofre protegido (sem botões falsos para arquivos não anexados).

6. TELA 6/7: LEGADO (`src/routes/portal/legado.tsx` — Página 8 do Mockup)
- Prateleiras de coleções com cards em formato de livros/cadernos familiares com capas nobres (crest/brasão).
- Bloco editorial de Histórias e Memórias compartilhadas.

7. TELA 7/7: CONTA (`src/routes/portal/conta.tsx` — Página 9 do Mockup)
- Ficha cadastral nominal de Ana Luiza (e-mail, telefone, membro desde).
- Card compacto do Projeto Familiar (3 assinaturas de R$ 320/mês × 10 meses).
- Hub de atendimento e novidades do acompanhamento.

DIRETRIZ DE ENGENHARIA:
- Mantenha os imports e loaders do TanStack Router intactos.
- Não crie dados falsos no Supabase.
- Rode `npm run typecheck` e `npm run build` para assegurar build 100% verde.
- Comite diretamente na branch `main`.
```
