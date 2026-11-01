# Prompt Operacional: Bloqueio de Refatoração no Lovable e Blindagem do App Mínimo

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 09:35 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: prompt de comando executivo, blindagem de branch e congelamento contra sobreposicao
caminho_no_repositorio: docs/prompts/2026-10-13-prompt-bloqueio-lovable-app-minimo.md
fontes:
  - docs/arquitetura/2026-10-13-blindagem-golive-e-app-minimo.md
  - Estudo GoLive Mockups Aprovados (golive-mockups-estudo-4.pdf)
escopo: >
  Texto executivo e fechado para envio direto ao desenvolvedor / Lovable,
  determinando o congelamento imediato do App do Cliente e o bloqueio de sobreposições.
premissas:
  - O App do Cliente (/portal) está homologado no acabamento fino e não pode sofrer novas alterações;
  - A esteira do GoLive (19 destinos) e as 7 abas do App são a arquitetura canônica acordada;
  - Não iniciar refatorações amplas de Desk V4 enquanto o mínimo do cliente não estiver operando.
criterio_de_aceite: >
  Interrupção imediata de commits cosméticos ou de reestruturação ampla no Lovable;
  manutenção estrita da rota /portal intacta.
```

---

## Texto do Prompt para Copiar e Colar no Lovable

```markdown
STOP TOTAL DE REFATORAÇÃO E SOBREPOSIÇÃO NO LOVABLE — DIRETRIZ DA PROPRIETÁRIA (13/10/2026)

ATENÇÃO: Não altere, não recrie e não sobrescreva telas, componentes, rotas ou estilos já aprovados.

1. CONGELAMENTO IMEDIATO DO APP DO CLIENTE (/portal):
- O App do Cliente está HOMOLOGADO e CONGELADO com o acabamento fino entregue nesta manhã (contraste dourado #A88434, alvos de toque de 44px, cantos de 12px e teia de radar em 70%).
- Fica estritamente PROIBIDO alterar qualquer arquivo sob src/routes/portal/* ou componentes do portal.
- Não introduzir telas de login, não criar botões fictícios de download de certidões e não alterar a cor creme de fundo (#F0EEE9).
- A régua de progresso, a árvore de 8 elos canônicos e os 3 cartões de "Acervo sob curadoria técnica" devem permanecer exatamente como estão.

2. PRESERVAÇÃO DA ARQUITETURA GOLIVE ACORDADA:
- O sistema possui a esteira de 19 destinos no Desk e 7 abas canônicas no App Cliente, conforme homologado no estudo de GoLive.
- Qualquer trabalho no Desk deve ser estritamente INCREMENTAL e em modo LEITURA da base de dados existente, sem criar rotas paralelas ou duplicar fontes de dados.

3. FOCO ÚNICO DESTE MOMENTO:
- O Mínimo do App está fechado para o atendimento da cliente Ana Luiza.
- Não faça auto-merge e não inicie refatorações de grande porte. Qualquer avanço no Desk V4 deve aguardar a liberação explícita da Proprietária.

Confirme o recebimento deste congelamento e garanta que a rota pública https://soul-ancestry.lovable.app/portal continue íntegra e acessível.
```
