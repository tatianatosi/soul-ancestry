# Prompt para Claude — Redesenho Unificado: Desk, App Cliente, Pessoas & Famílias e Intelligence (v2.0)

> **Nota ao arquivar (31/08/2026):** este é o último de uma sequência de sete
> documentos recebidos em rápida sucessão na mesma janela desta conversa,
> cada um revisando o anterior:
>
> 1. "Mandato de auditoria e de-para" — propunha "seis abas aprovadas" como
>    se viessem do CA-UX-03. **Verificação direta encontrou o contrário:**
>    CA-UX-03 (`docs/arquitetura/CA-UX-03_Navegacao_Desk_8_Grupos.md`,
>    23/08/2026) documenta **8 grupos**, implementados e vivos em
>    `src/lib/navegacao-desk.ts`. Não existe nenhuma referência real a "seis
>    abas" do Desk em nenhum arquivo do repositório — as únicas ocorrências
>    de "6 abas" encontradas via busca são sobre o **App Cliente** do
>    mockup morto (`archive/mockups/`, rota `/mockup` desativada por
>    decisão da própria proprietária em `CA-UX-04_Separacao_Prototipo_Produto.md`),
>    nunca sobre o Desk.
> 2. "Revisão do mandato" — autocorrigiu o ponto acima, atribuindo "seis
>    núcleos" a um PDF (`Reveja-o-desk-Fluxo-visual-completo-WhatsApp.pdf`)
>    que não está neste repositório — não pude verificar seu conteúdo
>    diretamente.
> 3. "Pré-auditoria obrigatória" — acrescentou uma quarta camada: mockup
>    aprovado com 7 telas App Cliente / 7 telas Desk. **Esta parte é
>    verificável e bate com o repositório:** existe
>    `docs/politicas/TAXONOMIA-CANONICA-MOCKUP-APROVADO.md`, já arquivado
>    de uma sessão anterior, com exatamente essa taxonomia (Desk: Visão
>    Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno,
>    Alertas, Biblioteca Mestre) e uma regra explícita de preservação:
>    "não renomear, remover, fundir, acrescentar ou redistribuir as sete
>    telas aprovadas... sem aprovação da proprietária."
> 4. "Prompt — Redesenho do Desk Intelligence a partir da Jornada Única"
>    (v1.0) — propôs seis áreas de trabalho, com Marketing dentro de
>    Comercial.
> 5. "Revisão Corretiva — Desk Intelligence, Marketing e Mapa de
>    Autoridade" (v1.1) — corrigiu o item 4: Marketing como núcleo próprio,
>    sete núcleos. **Achado real que confirma essa correção, encontrado
>    antes de ler este documento:** `/marketing` já é rota implementada
>    (574 linhas, `src/routes/_authenticated/marketing.tsx`, último commit
>    27/08/2026) e já é grupo de navegação próprio e distinto de Comercial
>    em `src/lib/navegacao-desk.ts` (`id: "marketing"` separado de
>    `id: "comercial"`) — o código já foi além do que o CA-UX-03 (23/08)
>    documentava (marketing como âncora dentro de Comercial). A descrição
>    de "Marketing situado contextualmente em Comercial" no documento 5
>    já estava desatualizada em relação ao código vivo no momento em que
>    foi escrita.
> 6. Este documento (v2.0) — versão mais completa: modelo de "um web app,
>    duas superfícies", sete áreas (Central Hoje, Comercial & CRM Vivo,
>    Casos 360 & Jornada, **Pessoas & Famílias**, Pesquisa & Intelligence,
>    Formalização/Jurídico & Financeiro, **Experiência do Cliente & App**)
>    e especificação de Acesso Master auditado ao App Cliente.
> 7. "Instruções e links" (companheiro deste, texto não reproduzido aqui na
>    íntegra — 45 linhas de índice, preservado no histórico desta
>    conversa) — índice de fontes com links reais de
>    GitHub/Drive/Dropbox/Google Docs. **16 dos 17 links de GitHub citados
>    foram verificados e existem exatamente no caminho indicado** —
>    confiança alta nas fontes internas do documento. O único caminho que
>    não bate exatamente
>    (`docs/auditorias/mapa-autoridade-admin-desk-app.md`) é o Mapa de
>    Autoridade Admin, cujo nome real é
>    `docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md` — o
>    próprio documento previu esse caso e pediu para registrar a
>    divergência em vez de presumir equivalência, o que este parágrafo faz.
>
> **Nenhuma execução foi iniciada a partir de nenhum dos sete documentos** —
> todos, inclusive este, pedem explicitamente leitura e inventário antes de
> qualquer alteração de código, rota ou navegação. Este arquivamento
> preserva o histórico da sequência; não constitui aprovação nem início de
> implementação. As referências a arquivos fora deste repositório (dois
> PDFs, `Elemento-NoDeskIntelligence-NoAppCliente.csv`, documentos do
> Google Docs/Drive/Dropbox listados no documento companheiro
> "Instruções e links") não puderam ser lidas diretamente por esta sessão —
> qualquer conteúdo delas citado nos documentos 1-6 é de segunda mão, não
> verificado por código.

```yaml
status: rascunho
versão: 2.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: prompt + decisão de arquitetura + revisão de taxonomia
responsável pela decisão: Proprietária do Clube Ancestral
substitui: rascunho anterior (v1.0/v1.1) na parte em que classificava o App Cliente como superfície externa ao Desk e não fazia Pessoas & Famílias explícita na arquitetura
escopo: arquitetura de informação, taxonomia, mapa de autoridade e plano de redesenho. Não executar mudanças em produção, banco, RLS, dados ou integrações.
próximos passos: Claude lê as fontes obrigatórias, entrega de-para e plano visual; implementação somente após aprovação humana.
```

*(conteúdo integral do prompt v2.0 preservado como recebido nesta conversa — arquitetura de sete áreas, Experiência do Cliente & App, Acesso Master auditado, Pessoa 360/Núcleo 360, Radar macro/micro, motor jurídico por país/via/marco, entregáveis e critérios de aceite; ver histórico da conversa para o texto completo)*
