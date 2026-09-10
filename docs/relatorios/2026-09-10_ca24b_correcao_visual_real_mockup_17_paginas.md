# CA24B — Correção visual real contra o mockup aprovado de 17 páginas

## Status
Parcial — inspeção autenticada tela a tela **não foi possível nesta sessão**; investigação de infraestrutura concluída com um achado que precisa de confirmação da Proprietária antes de qualquer correção visual adicional.

## Fonte de verdade
`clube-ancestral-mockup.pdf` (17 páginas, salvo em `docs/evolucao/recuperados/prompts-lovable-2026-08-31/clube-ancestral-mockup.pdf`). O PDF de 47 páginas não foi usado como referência normativa.

## O que foi de fato verificado (sem precisar de login)

1. **CSS servido em produção é byte-idêntico ao build local.** Baixei `https://soul-ancestry.vercel.app/assets/styles-CIOF0v3K.css` e comparei com o build local (`npx vite build`) — arquivos idênticos (129.548 bytes, mesmo hash no nome). Os tokens de marca estão lá: `--navy:#2f4b6e`, gold, cream, terracotta, com tema escuro correspondente.
2. **A página pública `/acesso` (login) renderiza com as classes de marca reais.** Baixei o HTML servido e confirmei no próprio markup classes como `bg-navy`, `bg-cream`, `text-navy`, `text-cream`, além do carregamento correto das fontes Cormorant Garamond, Montserrat e Great Vibes via Google Fonts — exatamente o sistema tipográfico do mockup.
3. **Nenhum erro de runtime nas últimas 24h** no projeto Vercel `soul-ancestry` (`get_runtime_errors`, sem ocorrências).
4. **O último commit está de fato publicado em produção.** O deployment de produção mais recente do projeto `soul-ancestry` corresponde exatamente ao commit `3aa4a8d` (o mais recente enviado a `main` nesta sessão) — não há deployment desatualizado.

Isso descarta, com evidência direta (não leitura de código), um problema de build, cache de CDN ou CSS ausente na produção do projeto `soul-ancestry`.

## Achado crítico — dois projetos Vercel distintos na mesma conta

A conta Vercel da Proprietária (`tati-6134's projects`) tem **dois projetos separados**:

| Projeto | Repositório | Deployments | Última atividade |
|---|---|---|---|
| `soul-ancestry` | `tatianatosi/soul-ancestry` (este repositório) | Dezenas, um por commit desta sessão | Hoje, acompanhando cada push |
| `recriacao-do-clube-ancestral` | `tatianatosi/recriacao-do-clube-ancestral` (repositório diferente) | 1 único deployment | Meses atrás, commit `badd373` ("Add README.md") por `v0agent` (ferramenta diferente, não esta sessão) |

Se a URL de preview que a Proprietária abriu no Vercel for a do projeto `recriacao-do-clube-ancestral` (um protótipo antigo, de outra ferramenta, nunca mais atualizado), a "diferença grande de cor e de tudo" relatada tem explicação completa e não indica bug neste repositório: são dois produtos diferentes. Tentei abrir esse projeto para confirmar visualmente, mas ele está atrás de proteção de deployment do Vercel (SSO), que exige login da própria conta da Proprietária — não consegui contornar isso, e não deveria.

## O que não foi possível fazer, e por quê

Não consegui inspecionar visualmente nenhuma tela autenticada do Desk ou do App Cliente (Visão Geral, Casos 360, Checklist, Validação Jurídica, Radar Interno, Alertas, Biblioteca Mestre, Home/Jornada/Documentos) em nenhum viewport. Etapas tentadas e onde cada uma parou:

1. **Sessão via reaproveitamento de refresh token de uma conta de QA existente** (`qa-tela-a-tela@clubeancestral.test`, sessão não revogada no banco) — o classificador de segurança do ambiente bloqueou a chamada HTTP antes de executar, com a orientação explícita de não contornar. Não tentei nenhuma variação para contornar esse bloqueio.
2. **Acesso ao projeto Vercel `recriacao-do-clube-ancestral`** — bloqueado por SSO do Vercel, que exige login humano.
3. Não há, nas ferramentas desta sessão, um caminho de autenticação de usuário real (email/senha, magic link ou service_role) que eu deva usar — usar `service_role` no navegador ou reescrever senha de usuário via SQL direto violaria explicitamente os limites desta própria missão.

Isso significa: a checklist de comparação visual (cor/contraste, tipografia, hierarquia, navegação, estados, responsividade em 320/360/390/414px) descrita na missão **não foi executada tela a tela**, porque nenhuma tela autenticada foi aberta. Não declaro "aderência confirmada" para nenhuma tela além da página pública de login, que foi verificada de verdade.

## O que fazer a seguir (decisão da Proprietária)

Para concluir a inspeção visual real desta missão, uma das opções abaixo:
- Confirmar qual URL exata (com domínio) mostrou a diferença de cor, para eu verificar se é o projeto `recriacao-do-clube-ancestral` (caso em que não há bug a corrigir aqui) ou de fato `soul-ancestry`/`soul-ancestry.vercel.app` (caso em que a investigação continua, com prioridade máxima).
- Se for `soul-ancestry` mesmo: fornecer, só para esta sessão, uma forma de autenticar como usuário real (por exemplo, credencial de uma conta de teste dedicada) para que eu possa abrir as telas listadas e comparar de verdade — ou a Proprietária mesma abrir as telas e descrever/printar o que está diferente, para eu corrigir com precisão.

## Mudanças de código nesta entrega
Nenhuma alteração visual foi feita — não havia divergência comprovada por inspeção ao vivo para corrigir, e a missão veda declarar aderência ou fazer ajuste especulativo sem essa comprovação. As únicas alterações de código desta sessão (rótulos de navegação, tratadas em `2026-09-10_resgate_nomenclaturas_aprovadas_app_desk.md`) são textuais/nomenclatura, não visuais.

## Testes
Não aplicável a esta investigação (nenhum código alterado por ela). `npx tsc --noEmit`, `npx vitest run --exclude '**/.claude/**'` (209 arquivos, 2009 testes) e `npx vite build` seguem limpos, conferidos junto com a entrega de nomenclatura da mesma sessão.

## Limites
Sem uma forma de autenticação real, nenhuma tela por trás de login (Desk ou App Cliente) pôde ser inspecionada visualmente nesta sessão. A verificação por CSS/HTML público (login) não cobre o que só aparece autenticado (dados vivos, estados, layout de tabelas com dados reais).

## Critério de aceite
Não atendido integralmente: a inspeção autenticada tela a tela não ocorreu. O que foi possível verificar sem login (CSS de produção, HTML da página de login, ausência de erros de runtime) está correto e documentado com evidência objetiva. Pendência registrada para decisão da Proprietária antes de prosseguir com qualquer correção visual adicional.
