# P0 — Recuperar o piloto Ana (diagnóstico antes de implementar)

Nada foi alterado. Abaixo: causa raiz, mapa dos acessos, arquivos afetados,
matriz demo × real × master e teste de persistência proposto.

## 1. Causa raiz do acesso por link

| # | O que acontece | Onde | Por quê |
|---|---|---|---|
| A | Link válido não entra e cai em "não foi possível liberar o acesso" | `src/routes/acesso.confirmar.tsx` | A tela apenas espera 1,2 s por uma sessão já pronta. Quando o link chega no formato com código na URL, ninguém troca esse código por sessão (a tela da equipe faz isso, a do cliente não). Sem sessão, o botão desloga e volta para `/acesso`. |
| B | Uma atualização de página (F5) na confirmação queima o link | `src/lib/portal.functions.ts` (confirmação de acesso) | Cada confirmação soma um uso, e o limite é 1. A segunda leitura já considera o link consumido e nega, mesmo com a pessoa autenticada. |
| C | Dentro do App, F5 às vezes volta para `/acesso` sem explicar | `src/routes/portal/route.tsx` | A porta do App faz uma única leitura de sessão; qualquer falha momentânea de rede é tratada como "sem sessão". A porta do Desk já tem a segunda leitura de segurança; a do cliente não. |
| D | Corrida no primeiro carregamento | `src/routes/__root.tsx` (captura de link) | O redirecionamento global acontece ao mesmo tempo em que a sessão está sendo montada, o que pode descartar o material do link. |

Consequência prática: o acesso da Ana nunca estabiliza, e por isso o App real
sempre aparece vazio ou redirecionado.

## 2. Mapa dos três acessos

| Entrada | Rota | Para quem | Estado |
|---|---|---|---|
| Equipe (e-mail e senha) | `/equipe/entrar` → Desk | master `tati@pluggedresearch.com` | Funciona |
| Cliente (link por e-mail) | `/acesso` → `/acesso/confirmar` → `/portal` | Ana | Quebrado (itens A–D) |
| Entrada legada | `/auth` | ninguém | Só redireciona; concorrente a remover |
| Entrada legada | `/canvas/$token` | link antigo por token | Concorrente a aposentar da navegação |

Destino explícito passa a ser: master → Desk (`/painel`) com botão
"Ver App Cliente como pessoa"; cliente → `/portal`. Sem criar link ou convite
novo nesta rodada.

## 3. Arquivos afetados (previsão)

- `src/routes/acesso.confirmar.tsx` — trocar o código do link por sessão, esperar
  de verdade, e mostrar motivo em vez de tela genérica.
- `src/lib/portal.functions.ts` — confirmar acesso é idempotente: só conta uso na
  primeira vez; releituras da mesma sessão não queimam o link.
- `src/routes/portal/route.tsx` — segunda leitura de sessão antes de expulsar.
- `src/routes/__root.tsx` — não interferir quando a sessão está sendo montada.
- `src/routes/auth.tsx` — retirar a entrada concorrente.
- `src/routes/_authenticated/app-cliente-como-pessoa.tsx` — primeira dobra:
  cartão do processo maior, linha do tempo menor na Home, sete abas fixas.
- `src/components/golive/acoes.tsx` e `src/components/portal/atendimento-interno.tsx`
  — confirmar só depois da releitura; erro com texto claro.
- `src/routes/_authenticated/golive.aprovacoes.tsx` — mesma regra de confirmação.

## 4. Matriz demo × real × master

| Superfície | Dados | Quem vê | Regra |
|---|---|---|---|
| `/app-cliente-demo` | fictícios | só equipe | Nunca exposto ao cliente |
| `/app-cliente-como-pessoa` | reais do caso escolhido, já sanitizados | só master | Somente leitura, sem publicar/enviar |
| `/portal` | reais do próprio caso | cliente | Sete abas; só conteúdo publicado |

## 5. De-para do Portal por aba

| Aba | Aparece | Não aparece |
|---|---|---|
| Home | marco publicado, próxima ação da família | nota interna, valor, pendência interna |
| Jornada | etapas publicadas | gates, SKU, decisão interna |
| Radar | as seis dimensões calculadas | matriz interna, ranking de casos |
| Árvore | pessoas e relações aprovadas | hipótese, fonte bruta |
| Documentos | documento liberado | evidência em revisão |
| Legado | descoberta e projeção publicada | achado não aprovado |
| Conta | contrato/anexos legíveis, pagamentos confirmados | proposta em rascunho, valor não confirmado, cobrança |

## 6. Prioridades da Ana nesta rodada

Botão do Canva quando houver link (e aviso honesto quando não houver),
contrato e anexos legíveis, Validação Jurídica da Trilha, próxima ação
visível e acesso ao App estável.

## 7. Teste de persistência proposto

Para cada ação (recolher, despublicar, aprovar; e no Atendimento liberar/recolher):
1. estado inicial capturado;
2. ação executada;
3. releitura do servidor confirmando o novo estado (não só mensagem de sucesso);
4. F5 e nova conferência;
5. falha simulada mostra o motivo real, não "tente novamente".

Mais: entrar como master, abrir "Ver App Cliente como pessoa" no caso da Ana,
percorrer as sete abas em desktop e 390 px, e repetir a confirmação de acesso
do cliente com F5 para provar que o link não é queimado.

## Fora desta rodada

Catálogo/SKU, conciliação, importações, etiquetas, redesign do Desk,
publicação, envio, assinatura, cobrança e qualquer ação externa.
