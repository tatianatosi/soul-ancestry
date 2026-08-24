# Plano de Saída Urgente do Lovable — v1.0

Data: 24/08/2026. Atualiza `estado-atual-e-proximos-passos.md` (20/08) e o
`PACOTE-MIGRACAO-PERMANENTE-v1.0.md` (22/08) com o que muda ao tratar a
saída do Lovable como urgente por custo, não como projeto de fundo.
Nenhuma ação foi executada — remoção de pacote, mudança de deploy ou
cancelamento de plano depende de decisão sua.

## 1. A boa notícia: o banco nunca esteve preso ao Lovable

Confirmado em `PACOTE-MIGRACAO-PERMANENTE-v1.0.md` (22/08): 137 migrations
Supabase aplicadas, 182 tabelas, 520 policies RLS, tudo versionado em
`supabase/migrations/`. Supabase é um serviço independente — sair do
Lovable **não exige migrar banco nenhum**, só continuar usando o mesmo
projeto Supabase (ou portá-lo, se um dia quiser, mas isso é outra decisão).
O GitHub (`tatianatosi/soul-ancestry`) já é a fonte oficial desde 19/08.

## 2. O que de fato prende o projeto ao Lovable hoje

Evidência direta no código, não suposição:

| Acoplamento | Onde | Peso para remover |
|---|---|---|
| `vite.config.ts` inteiro delega para `@lovable.dev/vite-tanstack-config` | `vite.config.ts:8` — o comentário no topo do arquivo avisa para não adicionar manualmente os plugins que esse pacote já injeta (TanStack Start, React, Tailwind, Nitro com alvo Cloudflare por padrão, tagger de componentes, injeção de env `VITE_*`) | Médio — precisa reescrever `vite.config.ts` com os plugins explícitos |
| `@lovable.dev/email-js`, `@lovable.dev/webhooks-js` | `package.json` (dependencies) | Baixo/médio — usados pelas rotas `/lovable/*` |
| Rotas `/lovable/*` (webhooks e prévias de e-mail) | `src/start.ts:7-8`, `src/routes/lovable/` | Precisa decidir: manter reescrito sem lib da Lovable, ou desligar se não usa mais prévia de e-mail pelo editor |
| Plugin de tag de componente (`componentTagger`, dev-only) | vem embutido no `@lovable.dev/vite-tanstack-config` | Baixo — só afeta o editor visual do Lovable, não produção |
| **Nenhum pipeline de deploy próprio** | `.github/` não existe no repositório | **Este é o maior bloqueio real**, não o código: hoje não há CI/CD independente — o deploy depende do fluxo do Lovable |
| `.env` versionado no repositório (com `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`, sem chave de serviço) | raiz do repo, sem entrada em `.gitignore` | Baixo risco imediato (chave publicável, não a de serviço), mas deve sair do histórico antes de tratar o repo como definitivo fora do ambiente gerenciado do Lovable |

Ou seja: o código-fonte em si tem pouco lock-in real (é essencialmente uma
troca de arquivo de configuração + duas dependências pequenas). **O que
falta de verdade é hospedagem e pipeline próprios** — isso foi decidido em
20/08 (Servla) mas nunca ficou pronto.

## 3. Onde provavelmente está o custo que você quer cortar

O Lovable cobra por uso do editor com IA (mensagens/créditos), não pelo
código em si. Um dado relevante do próprio histórico do repositório: os
commits recentes alternam entre mensagens genéricas `"Changes"` (padrão de
edição pelo editor do Lovable) e mensagens descritivas específicas — estas
últimas, incluindo praticamente todo o trabalho de 23/08 em diante
(CA-OPS-01, CA-OPS-02, CA-UX-03/04, `fase-c` deste estudo), foram feitas
por sessão de Claude Code, **sem consumir crédito do editor Lovable**. Ou
seja: já é possível — e já está acontecendo — desenvolver sem abrir o
editor pago do Lovable. O que falta é parar de depender dele para
publicar/hospedar, que é a parte que ainda gera dependência contínua.

## 4. Plano em 3 fases

### Fase imediata — sem tocar em código (esta semana)
1. Confirmar se o plano pago do Lovable é cobrado por uso do editor ou por
   hospedagem/deploy publicado por ele. Isso muda a urgência de cada passo
   abaixo.
2. Se for por uso do editor: parar de abrir o editor do Lovable para novos
   prompts e concentrar o desenvolvimento em Claude Code + GitHub (já é o
   caso desde 23/08) — isso já reduz custo sem nenhuma mudança técnica.
3. Verificar no painel do Lovable se o app publicado por ele (preview/
   produção) é a URL que você e a equipe usam no dia a dia. Se for, o
   passo 5 (deploy independente) precisa vir antes de desconectar/rebaixar
   o plano, para não ficar sem app publicado.

### Fase técnica — remover o acoplamento (paralelo, sem pressa de deploy)
4. Reescrever `vite.config.ts` com os plugins explícitos (TanStack Start,
   React, Tailwind v4, TanStack Router plugin, Nitro) no lugar do wrapper
   `@lovable.dev/vite-tanstack-config`, e rodar `build`/`dev`/`vitest`
   localmente para confirmar paridade antes de remover o pacote do
   `package.json`.
5. Decidir o destino de `/lovable/*` (webhooks e prévia de e-mail): manter
   reescrito sem as libs `@lovable.dev/email-js` e `@lovable.dev/
   webhooks-js`, ou desligar se não é mais necessário fora do editor.
6. Retirar `.env` do versionamento (`git rm --cached .env`, adicionar ao
   `.gitignore`, publicar `.env.example` sem valores — já listado como
   pendência em `estado-atual-e-proximos-passos.md`).

### Fase de publicação — sair do ar do Lovable de verdade
7. Retomar a decisão de 20/08 (Servla, datacenter brasileiro) **ou**, dado
   a urgência agora declarada, considerar um destino mais rápido de
   configurar como ponte temporária (ex. Vercel/Cloudflare Pages no plano
   gratuito, como o próprio documento de 20/08 já previa "somente para
   protótipos/testes") enquanto o ambiente Servla definitivo não está
   pronto — evita continuar pagando o Lovable por hospedagem enquanto o
   destino final não está validado.
8. Seguir o checklist de go-live já existente em
   `PACOTE-MIGRACAO-PERMANENTE-v1.0.md` (seção 5) antes de apontar
   domínio real para o novo destino: RLS íntegra, smoke tests, backup e
   restauração testados.

## 5. O que não fazer com pressa

- Não remover os pacotes `@lovable.dev/*` nem reescrever `vite.config.ts`
  sem antes rodar build e testes localmente — o comentário no próprio
  arquivo avisa que duplicar plugins quebra o app.
- Não desconectar o editor do Lovable antes de confirmar que existe um
  deploy independente funcionando — senão o app publicado sai do ar.
- Não apagar as rotas `/lovable/*` sem antes checar se algo em produção
  (prévia de e-mail, webhook) ainda depende delas.

## 6. Decisão humana necessária

1. O custo do Lovable hoje é por edição (editor/créditos de IA) ou por
   hospedagem/publicação? Isso define se a Fase imediata já resolve o
   problema de custo sozinha.
2. Confirma Servla como destino definitivo (decidido em 20/08) ou prefere
   uma ponte mais rápida (Vercel/Cloudflare) enquanto valida a Servla, dado
   que a urgência mudou desde então?
3. Ok em rodar as Fases técnica e de publicação em paralelo com o uso
   normal do sistema, ou prefere uma janela dedicada (menor risco de
   quebrar o que está em uso agora)?
