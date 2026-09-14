# Prancha como contrato: Desk novo + App Cliente vivo

Objetivo: a prancha visual aprovada passa a ser o contrato da interface. Toda aba mostra
todos os seus indicadores e blocos, mesmo sem dado hoje. Navegação nova, App Cliente
funcionando de verdade, e o cano Desk → App Cliente operando em um clique. Sem legado,
sem registros de teste, sem travas.

## 1. Navegação nova (contrato)

Desk (6 telas, é o que passa a abrir ao entrar):

Hoje · Caso · Pesquisa · Formalização · Configurações · App Cliente (espelho)

O Desk histórico continua no repositório, mas deixa de ser a porta de entrada:
`/painel` passa a levar para a tela Hoje nova. Nada é apagado.

App Cliente: mantém as 7 abas aprovadas — Home, Jornada, Radar, Árvore, Documentos,
Legado, Conta. Entregas / Fase 01 / Fase 02 saem da barra (viram conteúdo da Jornada).

## 2. Cada aba com todos os blocos da prancha

Cada bloco existe sempre. Sem dado hoje, aparece o template aprovado com
"Sem itens nesta etapa" e um único botão que leva à ação que resolve aquilo.

- Hoje: etapa atual, próxima ação, responsável, prazo, pendência, 4 indicadores
  (documentos, evidências, microentregas publicadas, dias na etapa) e linha D0–D365.
- Caso: ficha do piloto, pessoas do núcleo, jornada, documentos, microentregas,
  publicação manual para a cliente.
- Pesquisa: fontes, evidências, achados, medidor de confiança.
- Formalização: proposta, contrato, pagamento (registro manual). Sem catálogo.
- Configurações: equipe e organização. Só isso.
- App Cliente: espelho exato do que a cliente vê, dentro do Desk.

## 3. Canos entre Desk e App Cliente

Um único caminho, já existente, fica visível e confiável:

```text
Desk / Caso  --publicar-->  projeção aprovada  -->  App Cliente (Home, Jornada, Documentos, Legado)
```

- Publicar no Caso grava a projeção e atualiza na hora a tela da cliente.
- Despublicar existe, com autor e data.
- O App Cliente só lê conteúdo publicado e aprovado do caso da pessoa logada.
- A regra de sanitização continua: nada interno, nada de outro caso, nada de preço.

## 4. Sem legado e sem teste

- Toda leitura do shell novo passa pelo filtro já criado (`registros-teste.ts`):
  demo, teste, QA, homologação, fixture não carregam.
- Só o caso canônico CA-CID-AT-FAM-2026-001 aparece no piloto.
- Nada é apagado do banco.

## 5. Sem bloqueios

Pendência informa, nunca desabilita botão. Nenhum checklist novo, nenhum gate novo,
nenhuma confirmação extra além da que a política já exige para ação externa.

## Detalhes técnicos

- Camada de leitura: estende `src/lib/golive.functions.ts` (pesquisa, indicadores,
  projeções publicadas). Autenticada, com RLS por organização. Sem tabela nova,
  sem migration, sem cliente administrativo.
- Telas: `src/components/golive/*` e rotas `src/routes/_authenticated/golive.*`.
- Publicação reutiliza `publicarProjecaoApp` (`portal-atendimento.functions.ts`).
- App Cliente: `src/components/portal/abas-app-cliente.tsx` e `portal-shell.tsx`
  passam a expor exatamente 7 abas; espelho no Desk usa o mesmo componente via
  `FontePortalProvider` (nenhuma tela duplicada).
- Mobile: sem launcher flutuante, menu em gaveta fechada, nada corta em 375 px.
- Verificação: build, testes e capturas desktop/mobile das 4 superfícies do fluxo
  Hoje → Caso → Publicar → App Cliente.

Sem merge/deploy de produção e sem banco novo.
