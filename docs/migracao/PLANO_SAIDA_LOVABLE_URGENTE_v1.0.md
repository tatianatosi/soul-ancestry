# Plano de Saída Urgente do Lovable — v1.0

Data: 24/08/2026. Atualiza `estado-atual-e-proximos-passos.md` (20/08) e o
`PACOTE-MIGRACAO-PERMANENTE-v1.0.md` (22/08) com o que muda ao tratar a
saída do Lovable como urgente por custo, não como projeto de fundo.
Nenhuma ação foi executada — remoção de pacote, mudança de deploy ou
cancelamento de plano depende de decisão sua.

**Atualização (mesmo dia):** decisão 1 da seção 6 está respondida — o
custo é a assinatura mensal do Lovable **e** os créditos de edição por IA,
que se esgotam antes de dar conta das mudanças necessárias no aplicativo.
Isso confirma a leitura da seção 3: o consumo de crédito acontece toda vez
que se pede uma mudança pelo editor do Lovable, não pela hospedagem em si.
Como o desenvolvimento já está acontecendo por aqui (Claude Code + GitHub)
desde 23/08, cada mudança feita nesta sessão **não consome nenhum crédito
do Lovable** — o vazamento de custo já está parcialmente estancado, mesmo
com a assinatura ainda ativa.

## 1. O banco não precisa ser recriado — mas a posse dele precisa ser confirmada

Confirmado em `PACOTE-MIGRACAO-PERMANENTE-v1.0.md` (22/08): 137 migrations
Supabase aplicadas, 182 tabelas, 520 policies RLS, tudo versionado em
`supabase/migrations/`. Supabase é uma empresa separada do Lovable — o
código do banco (migrations) está no GitHub e independe de qualquer um dos
dois. O GitHub (`tatianatosi/soul-ancestry`) já é a fonte oficial desde
19/08.

**Correção registrada (24/08), depois resolvida no mesmo dia:** você
apontou que não sabia se o projeto Supabase era seu ou do Lovable. Verificado
com print de tela: você é **Owner** direto no Supabase
(`tati@pluggedresearch.com`, organização "Clube Ancestral", projeto
`zsxpdbhdvbuulwpepemd`). **O banco de dados não é uma dependência do
Lovable** — a única dependência real de hospedagem que resta é o app
publicado (item 3 abaixo), não o banco.

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
1. ~~Confirmar se o plano pago do Lovable é cobrado por uso do editor ou por
   hospedagem/deploy publicado por ele.~~ **Respondida:** os dois — assinatura
   + créditos de edição.
2. Parar de abrir o editor do Lovable para novos prompts e concentrar o
   desenvolvimento em Claude Code + GitHub (já é o caso desde 23/08) — isso
   já reduz custo sem nenhuma mudança técnica.
3. ~~Verificar se o app publicado pelo Lovable é a URL do dia a dia.~~
   **Confirmado:** é. A hospedagem está no Lovable hoje — o passo 5 (deploy
   independente) precisa acontecer antes de desconectar ou rebaixar o
   plano, para não ficar sem app publicado.
4. ~~Confirmar login próprio em supabase.com com acesso ao projeto.~~
   **Confirmado (24/08, com print de tela):** login `tati@pluggedresearch.com`
   é **Owner** da organização "Clube Ancestral" no Supabase, projeto
   `zsxpdbhdvbuulwpepemd`, plano Free. **O banco não é uma dependência do
   Lovable** — é seu, com posse direta. Isso remove o maior risco da saída.
   **Achado novo:** a região do projeto é `us-east-2` (Ohio, EUA), **não**
   São Paulo — ao contrário do que a seção 8 presumia como provável. Isso
   não bloqueia a saída do Lovable, mas muda a resposta sobre
   "infraestrutura brasileira": hoje o dado não está no Brasil de jeito
   nenhum, independente de onde o app for hospedado (Vercel ou Servla).
   Se a exigência de dado em solo brasileiro for real, é um projeto à
   parte — Supabase não migra região de um projeto existente; exigiria
   criar projeto novo em `sa-east-1` e migrar dados.

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
  deploy independente funcionando — senão o app publicado sai do ar
  (confirmado: é a URL que a equipe usa hoje).
- Não apagar as rotas `/lovable/*` sem antes checar se algo em produção
  (prévia de e-mail, webhook) ainda depende delas.
- Acesso ao Supabase já confirmado (item 4) — o cuidado que resta é só com
  o app publicado (item 3): não desconectar o Lovable sem deploy
  independente pronto.

## 6. Decisão humana necessária

1. ~~O custo do Lovable hoje é por edição (editor/créditos de IA) ou por
   hospedagem/publicação?~~ **Respondida:** assinatura mensal + créditos de
   IA, e os créditos acabam antes de completar as mudanças necessárias.
   Ver seção 7 para o que isso muda no plano.
2. ~~Confirma Servla como destino definitivo (decidido em 20/08) ou prefere
   uma ponte mais rápida?~~ **Recomendação, dado o pedido de comparação:**
   Vercel para publicar rápido agora; ver seção 8 para o motivo e para como
   isso não compromete a exigência de dado em infraestrutura brasileira.
3. Ok em rodar as Fases técnica e de publicação em paralelo com o uso
   normal do sistema, ou prefere uma janela dedicada (menor risco de
   quebrar o que está em uso agora)?

## 7. O que muda com a decisão 1 respondida

O gargalo é literalmente **créditos de IA que acabam antes da mudança
terminar** — isso é o oposto de escassez de dinheiro: é escassez de cota
dentro de um plano já pago. Duas implicações práticas:

- **Nenhum trabalho feito aqui (Claude Code) foi ou será perdido por causa
  disso.** Tudo o que já foi construído — os 137 migrations, as 182
  tabelas, todo o código em `src/`, os estudos e auditorias destes últimos
  dias — está no GitHub e no Supabase, dois serviços que não têm relação
  nenhuma com o consumo de crédito do Lovable. O investimento já feito não
  desaparece ao sair do Lovable; ele está preservado independente da
  assinatura continuar ou não.
- **A cada mudança que você pedir por aqui em vez de pelo editor do
  Lovable, zero crédito é gasto.** Isso já reduz o problema hoje, sem
  esperar a Fase técnica ou a Fase de publicação da seção 4.

Prioridade revista para a Fase imediata (seção 4, item 3): antes de
rebaixar ou cancelar o plano do Lovable, confirme se a URL que a equipe usa
no dia a dia é a publicada por ele — se for, isso é o único motivo real
para manter a assinatura ativa por mais algum tempo, só até a Fase de
publicação (item 7) entregar um deploy independente. Fora isso, não há
necessidade de continuar comprando crédito de edição: as mudanças
seguem saindo por aqui.

## 8. Servla × Vercel — comparação direta

| Critério | Vercel | Servla |
|---|---|---|
| Tempo até estar no ar | Minutos — conecta o repositório GitHub e publica; suporte nativo à stack (TanStack Start/Nitro) | Dias — checklist de 20/08 nunca foi concluído (Docker, volumes, backup, staging) |
| Custo | Plano gratuito (Hobby) cobre um app deste porte enquanto o tráfego for baixo/médio | Pago desde o primeiro dia, custo do pacote básico ainda não confirmado tecnicamente |
| Esforço de configuração | Baixo — hoje o `vite.config.ts` está com Nitro mirando Cloudflare por padrão (herdado do pacote da Lovable); trocar o preset para `vercel` é a única mudança de config necessária | Alto — exige provisionar servidor, container, volumes e rotina de backup do zero |
| Dado do cliente em infraestrutura brasileira | Não por padrão — mas isso é decidido pela **região do banco**, não pelo host do app (ver abaixo) | Sim, nativamente — datacenter brasileiro |
| Maturidade/confiabilidade | Alta, uptime e suporte consolidados, larga adoção para esta stack | Provedor menor, sem histórico de uptime testado neste projeto |

**O ponto que muda a decisão:** os dados pessoais e genealógicos sensíveis
não moram no host do frontend — moram no Supabase, que é um serviço à
parte com sua própria região configurável (inclusive `sa-east-1`, São
Paulo). Ou seja, é possível publicar o aplicativo na Vercel **e** manter o
banco de dados em região brasileira ao mesmo tempo; as duas decisões são
independentes. Se a exigência de 20/08 por "infraestrutura brasileira" era
sobre o banco/dado pessoal (mais provável, dado o tipo de dado tratado:
cidadania, documentos, família), Vercel resolve a urgência sem abrir mão
disso. Se a exigência era sobre o app inteiro (por contrato específico ou
exigência jurídica que eu não tenho como confirmar aqui), Servla continua
sendo obrigatória e a Vercel serve só como ponte temporária, como já
previsto na seção 4.

**Recomendação:** publicar na Vercel agora para parar de depender do
Lovable esta semana, confirmar a região do Supabase (provavelmente já em
`sa-east-1`, a checar), e só depois decidir se vale investir tempo em Servla
depois — sem isso travar a saída urgente do Lovable.
