# Serviços MCP disponíveis — inventário de 27/10/2026

Fonte: ferramentas e avisos de conexão da sessão de trabalho. Nada foi sondado na rede e nenhuma credencial foi lida. Registro de máquina em `.claude/mcp-registry.json` (local, ignorado pelo git).

## Usados de fato neste projeto

| Serviço | Para quê | Cuidado |
|---|---|---|
| GitHub (`mcp__github__`) | ler/fechar/comentar/mesclar PRs | merge exige autorização explícita (AGENTS.md); todo comentário leva o rodapé de atribuição |
| Lovable (`mcp__Lovable__`) | `query_database` no banco de produção, projeto `1a628b61-ec68-454f-85e1-671d6f297370` | escrita em produção só com autorização nominal; registrar em `supabase/pendentes/README.md` |
| claude-code-remote | assinatura de atividade de PR, documentação do ambiente | — |

## Listados, nunca exercitados aqui

Claude Docs, Supabase (o banco real é acessado via Lovable), Vercel (produção é só Lovable desde 23/10/2026), Dropbox, Gmail/Calendar/Drive, browser-use, Perplexity Computer, ctxt.

`ctxt` publica links públicos: não usar com dado de família ou de cliente.

## Falhando

1password (executável ausente), agent-memory (conexão fechada), definite (endpoint inexistente), desktop-commander (timeout), `plugin:github:github` (400, header de autorização mal formatado — o servidor `mcp__github__` funciona), asana (auth sem registro dinâmico).

## Pedem autenticação

Cerca de 62 servidores (BigQuery, Hex, Amplitude, Linear, Salesforce, Gong etc.) só autenticam pelo claude.ai; indisponíveis nesta sessão.

## Limite do que isto cobre

Não existe skill `curator` neste repositório, então não há nada para atualizar nela. O registro é só inventário; não habilita nem autoriza nenhuma integração nova.
