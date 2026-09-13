# Fechamento do dia — preparação para linha limpa de Vercel

- **Status**: em revisão
- **Data**: 2026-09-13
- **Fonte**: GitHub (repo/PR/commits), Vercel (deployments), pranchas App/Desk
  já enviadas nesta sessão, kits Lovable presentes no repositório.

## Estado do repositório (leitura, nada alterado)

- **Repositório**: tatianatosi/soul-ancestry
- **Branch local atual**: `feat/entrega-1-sistema-visual-app-home`
- **SHA local (HEAD)**: `a1f9cf6` (merge de `main` dentro da branch, pré-PR)
- **Working tree**: limpo, nada modificado nem não rastreado
- **`origin/main` (produção)**: `f6a1d3e` — "Merge pull request #126"

## PR #126

- **Estado real**: fechada e mesclada (`merged_at` 2026-09-13T15:56:05Z, por
  tatianatosi, em tarefa anterior a esta).
- **Decisão desta tarefa**: nenhuma PR foi mesclada, criada ou fechada aqui —
  é só leitura do estado já existente.
- Commits do App Cliente na PR: hero+stepper da Home, paleta Pantone, Jornada
  (timeline vertical), Radar (6 dimensões reais), Árvore (conectores/estados
  honestos), Home→destino real por achado, Documentos/Conta com sinais reais,
  correção de hydration mismatch (`?aba=`), acabamento visual final.

## Produção

`soul-ancestry.vercel.app` serve `f6a1d3e` (deployment
`dpl_4zBbpFH1D9a1zE73bGbu3JJsYeU8`, READY) — deploy de tarefa anterior, não
desta.

## Baseline visual aprovado

App Cliente completo — Home, Jornada, Radar, Árvore, Documentos, Legado e
Conta — commit de referência `9f9a68d`, prancha final aprovada.

## Kits Lovable — localizados, não tocados

Confirmados via `git ls-tree` em `main`, sem importar/mover nada:
- `.lovable/plan/*.md` (kit visual, radares, prancha do Desk)
- `src/components/clube-ancestral-kit/*` (base, conteúdo, genealogia,
  jornada, kit-app-cliente, kit-consolidado, kit-exportavel, operação,
  radar-operacional, tokens.css, visualização)

## Ativos a preservar na linha limpa

Kits Lovable, pranchas App/Desk, logo oficial (`public/marca/`), tokens
Pantone, App Cliente aprovado (7 telas).

## Proibido carregar para a linha limpa

- Gates globais soltos sem dono
- Auditorias na primeira dobra das telas
- Menus duplicados
- Catálogo legado como runtime (referência, não código vivo)
- Dados de demo apresentados como reais
- Integrações automáticas (pagamento, WhatsApp, e-mail) sem RLS/policy revisada

## Ponto de retomada amanhã

1. Criar branch limpa sem destruir `main`
2. Importar kit visual de modo controlado
3. App Cliente aprovado como base
4. Motor contratual Ana Luiza
5. CRM Vivo mínimo: Lead → Discovery → Call → Proposta → Caso

## Pendências reais

- Confirmar se `feat/entrega-1-sistema-visual-app-home` (já mesclada) pode
  ser apagada ou deve ficar como histórico
- 6 falhas de teste pré-existentes em `main` (não desta entrega) sem causa
  raiz documentada
- Kits Lovable (`clube-ancestral-kit/*`) sem dono definido para amanhã

## Próximo comando humano necessário

Aguardar a Proprietária decidir o momento e formato da branch limpa de
amanhã — o merge da PR #126 já foi decidido e executado antes deste
fechamento.
