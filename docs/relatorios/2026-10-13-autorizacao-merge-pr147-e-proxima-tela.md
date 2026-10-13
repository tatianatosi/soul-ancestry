# Diretiva Executiva: Aprovação de Merge do PR #147 e Decisões de Arquitetura

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 13:10 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: homologacao de merge de pr, esclarecimento de divergencia e autorizacao pessoas e linhagens
caminho_no_repositorio: docs/relatorios/2026-10-13-autorizacao-merge-pr147-e-proxima-tela.md
fontes:
  - PR #147 (Commit 63d74df9 - Caso 360, Shell e Topo V4)
  - Limite de cota de deploy da Vercel (24h)
  - AGENTS.md (8 Seções Canônicas do Caso 360)
escopo: >
  Autorização formal da Proprietária para o Claude Code mesclar (merge) o PR #147 no main,
  resolvendo o gargalo da Vercel e liberando o deploy no Lovable,
  além de pacificar a hierarquia do Caso 360 (grade V4 na Visão Geral + 8 seções em pílulas).
premissas:
  - O PR #147 está limpo (typecheck ok, build ok, regressão zero);
  - A cota da Vercel no plano gratuito bloqueia previews temporários;
  - O merge em main desbloqueia a sincronização e visualização real no Lovable;
  - As 8 seções do AGENTS.md permanecem preservadas.
criterio_de_aceite: >
  Texto executivo de autorização de merge e orientação para a tela Pessoas & Linhagens.
```

---

## Mensagem Oficial para Colar no Claude Code:

```markdown
DECISÕES EXECUTIVAS DA PROPRIETÁRIA:

### 1. AUTORIZAÇÃO DE MERGE DO PR #147 EM MAIN
- Como a cota da Vercel esgotou os previews do PR por 24h, **AUTORIZO O MERGE DO PR #147 NA BRANCH `MAIN`**.
- O typecheck está limpo, o build passou e as 2 falhas antigas não são suas. Faça o merge em `main` para que o Lovable sincronize e o ambiente oficial receba o novo Shell e o Caso 360.

### 2. PACIFICAÇÃO DA DIVERGÊNCIA: GRADE V4 + 8 SEÇÕES PRESERVADAS
- A sua decisão foi perfeita e está homologada: **a grade da Prancha V4 vive na Visão Geral do Caso 360, e as 8 seções do AGENTS.md continuam existindo integralmente nas pílulas fixas**.
- Os "4 lotes (A-D)" do documento das 10:35 eram o conteúdo das frentes de trabalho; a Prancha V4 é o layout. Eles não se anulam, se complementam. Você acertou em não apagar as 8 seções.
- Manter as pílulas na barra fixa para acompanhar a rolagem da página também está 100% aprovado.

### 3. PRÓXIMO PASSO: PESSOAS & LINHAGENS
Após concluir o merge do PR #147 em `main`, abra a nova branch e implemente a próxima tela do plano:
👉 **PESSOAS & LINHAGENS (`/nucleos` e `/clientes`)**:
- Componha a tela espelhando a Prancha V4:
  - Lista de gerações G1 a G5 no topo;
  - Leitura da linhagem ao lado;
  - Árvore visual do núcleo no centro com os nós circulares conectados;
  - Rede de vínculos e cobertura por geração no rodapé.
- Mantenha a leitura dos membros do núcleo familiar real do Supabase (`nucleomembros`).

Pode executar o merge em `main` e iniciar Pessoas & Linhagens!
```
