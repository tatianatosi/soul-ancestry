# Suíte Executiva de Prompts para Claude Opus: Execução Direta e Eliminação do Lovable

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 11:05 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: prompts executivos mestres, delegacao direta ao claude opus e bypass do lovable
caminho_no_repositorio: docs/prompts/2026-10-13-suite-prompts-claude-opus-execucao-direta.md
fontes:
  - Documento Normativo Desk Simples V4 (29/09/2026)
  - Plano de Consolidação Canônico (docs/arquitetura/plano-consolidacao-app-golive-desk.md)
  - Mockup Normativo de 17 Páginas (clubeancestralmockup.pdf)
escopo: >
  Entrega de 3 prompts cirúrgicos, completos e auto-suficientes para o Claude Opus.
  O Claude executa diretamente no código TypeScript/React do repositório, garantindo
  que o App do Cliente e o Caso 360 fiquem 100% prontos sem depender do Lovable.
premissas:
  - Bypass total do Lovable: o Claude programa, testa e comita diretamente no GitHub;
  - Respeito integral ao Mockup Normativo (p. 3 a 9) e aos 4 Lotes A-D do GoLive;
  - Proibição de inventar dados fictícios ou criar bases paralelas.
criterio_de_aceite: >
  3 prompts prontos para copiar e colar no Claude Opus (Corte 1: App Cliente;
  Corte 2: Caso 360 em 4 Lotes; Corte 3: Homologação e Build Vercel).
```

---

## Como Operar com o Claude Opus

Copie e cole um prompt por vez no Claude Opus. Cada prompt é autocontido, traz todo o contexto de arquitetura e exige que o Claude aplique o código diretamente nos arquivos do repositório GitHub.

---

### PROMPT 1: Blindagem e Conclusão das 7 Abas do App Cliente (`/portal`)

```markdown
ATUAÇÃO COMO ENGENHEIRO PRINCIPAL — CLUBE ANCESTRAL (CORTE 1: APP CLIENTE)

Você assume o controle direto do repositório `tatianatosi/soul-ancestry`. Esqueça o Lovable. Você vai programar e consolidar diretamente os arquivos de frontend do Portal do Cliente sob `src/routes/portal/`.

AUTORIDADE VISUAL: Mockup Normativo de 17 páginas (páginas 3 a 9 de clubeancestralmockup.pdf).
URL DE DESTINO: https://soul-ancestry.lovable.app/portal

SUAS TAREFAS DE CÓDIGO NESTE CORTE:

1. HOME (`src/routes/portal/index.tsx` — Página 3 do Mockup):
- Garanta que a Home abra com o Painel do Caso nobre da Família Silveira Rodrigues.
- Insira o container com as 3 Próximas Ações estruturadas em cards brancos destacados ("1. Assinatura do Contrato de Assessoria", "2. Coleta de certidões em cartórios", "3. Busca nos arquivos de Graz 1895").
- Conecte os cards de achados genealógicos em grid 2 colunas com o destaque do ano em dourado.
- Adicione o card de suporte oficial com o link direto para o WhatsApp (11 98838-4907).

2. JORNADA (`src/routes/portal/jornada.tsx` — Página 4 do Mockup):
- Reestruture a visualização em DUAS COLUNAS PARALELAS: Coluna da Família (Ancestral) à esquerda e Coluna do Processo à direita. Não empilhe tudo em uma lista única.
- Aplique o card de transição/união em tom terracota suave/bege com itálico sálvia e fiação dourada contínua.

3. RADAR (`src/routes/portal/radar.tsx` — Página 5 do Mockup):
- Centralize o gráfico em teia amplo ocupando 70% da largura útil.
- Organize os cards das 6 dimensões em GRADE 2x3 harmônica.

4. ÁRVORE (`src/routes/portal/arvore.tsx` — Página 6 do Mockup):
- Enquadre o genograma em moldura central limpa, exibindo os 8 elos canônicos confirmados (Heinrich → Rudolf → Lotte/Otto → Ana Maria → Cleusa Lúcia → Adair Júnior → Ana Luiza + Felipe).
- Mantenha o marco oficial de nascimento em Graz 1895 atribuído a Otto Reimer.

5. DOCUMENTOS, LEGADO E CONTA (`documentos.tsx`, `legado.tsx`, `conta.tsx` — Páginas 7 a 9):
- Documentos: Checklist de 10 itens com tags visuais de estado ("Em busca cartorária", "Aguardando"), mantendo o cofre seguro sem botões falsos de download.
- Legado: Prateleiras visuais de cadernos familiares com capas nobres (crest/brasão).
- Conta: Ficha cadastral de Ana Luiza, 3 assinaturas previstas (R$ 320/mês) e canais de contato.

REGRAS: Não invente dados falsos no Supabase. Modifique o JSX/Tailwind para paridade visual estrita com o mockup. Rode o typecheck e entregue o commit diretamente na branch `main`.
```

---

### PROMPT 2: Construção Canônica do Caso 360 em 4 Lotes (Ecossistema Casos)

```markdown
ATUAÇÃO COMO ENGENHEIRO PRINCIPAL — CLUBE ANCESTRAL (CORTE 2: CASO 360 NO DESK)

Você vai implementar o Caso 360 dentro do Ecossistema Casos (`src/routes/desk/casos.$id.tsx` ou rota correspondente), eliminando qualquer tentativa de "3 colunas paralelas" e aplicando a arquitetura oficial do Estudo GoLive.

AUTORIDADE: Ficha Guiada em Quatro Lotes Sequenciais (páginas 49 a 52 de golive-mockups-estudo-4.pdf e página 12 do mockup de 17 páginas).

ESTRUTURA OBRIGATÓRIA DA FICHA (4 LOTES A-D):

1. LOTE A — Entrada e Caso (Página 49 do Estudo):
- Identificador canônico: Projeto Familiar Ana Luiza (CA-CID-AT-FAM-2026-001).
- Jornada D0–D365 (linha do tempo executiva de marcos contratuais e operacionais).
- Origem do sinal, canal de entrada e status de ativação.

2. LOTE B — Pesquisa e Árvore (Página 50 do Estudo):
- Núcleo Familiar Silveira Friedmann-Reimer (participantes reais: Ana Luiza, Adair, Alice e menor dependente Felipe). Sem pessoas espúrias.
- Árvore genealógica canônica de 8 elos com o marco de Graz 1895 vinculado a Otto Reimer.
- Impacto da pesquisa e cobertura documental dos arquivos austríacos (§58c StbG).

3. LOTE C — Proposta, Escopo e Contrato (Página 51 do Estudo):
- Cadeia da Formalização: proposta aceita, contrato 2026-CB-0001 (aguardando assinatura digital Gov.br).
- Condição Comercial: 3 assinaturas de R$ 320/mês × 10 meses (total R$ 9.600,00) em modo rascunho/acompanhamento sem poluição do saldo de caixa.
- Ordem de Serviço (OS) com escopo e prazos operacionais.

4. LOTE D — Publicação e App (Página 52 do Estudo):
- Gestão de publicação para o Portal do Cliente (/portal).
- Cofre documental técnico para upload do Dossiê Consolidado e certidões.
- Filtros de sanitização para evitar vazamento de notas internas.

REGRAS: A navegação entre os 4 lotes deve ser fluida e intuitiva. Utilize os readers/writers existentes em `src/data/cases.ts` ou Supabase, sem duplicar tabelas. Rode os testes e comite diretamente.
```

---

### PROMPT 3: Auditoria de Não-Regressão, Limpeza de Legados e Deploy

```markdown
ATUAÇÃO COMO ENGENHEIRO PRINCIPAL — CLUBE ANCESTRAL (CORTE 3: AUDITORIA E DEPLOY)

Sua missão neste corte é executar o saneamento final, rodar a suíte de testes automatizados e validar o build de produção sem quebras.

TAREFAS OBRIGATÓRIAS:

1. AUDITORIA DE ROTAS E LIMPEZA:
- Verifique se o TanStack Router (`routeTree.gen.ts`) compila perfeitamente sem rotas órfãs.
- Confirme que a rota `/portal` e suas 7 abas internas continuam acessíveis e públicas.
- Garanta que nenhum formulário longo ou tabela bruta de alimento interno (SKUs legados, listas de status) apareça nos menus principais do Desk.

2. TESTES DE COMPORTAMENTO E BUILD:
- Execute `npm run test` ou `vitest run` e garanta que todas as checagens passem sem erros.
- Execute `npm run build` para garantir que o bundle Vite/TanStack Start seja gerado sem falhas de typecheck.

3. RELATÓRIO DE FECHAMENTO:
- Forneça o SHA do commit final.
- Liste os arquivos alterados e confirme que o site em produção (soul-ancestry.lovable.app) reflete o código limpo.
```
