# Ficha da Ana, tela de leads, microentrega publicada e parcelas

Tudo sobre o caso `CA-CID-AT-FAM-2026-001` e as tabelas que já existem. Nenhuma tabela nova, nenhum dado fictício, nenhuma fatura inventada.

## 1. Ficha por lotes da Ana com os dados reais

A ficha (Caso 360) passa a mostrar, em cada lote, o que já está gravado hoje:

- **Lote A — Entrada e Caso**: titular, núcleo familiar, responsável, etapa, próxima ação e prazo.
- **Lote B — Pesquisa e Árvore**: três perguntas abertas, três fontes, a evidência coletada e os dois achados em revisão, com confiança e visibilidade.
- **Lote C — Proposta, Escopo e Contrato**: proposta registrada, itens de escopo, o contrato e os dez anexos vinculados, com número, situação e data.
- **Lote D — Publicação e App**: projeções do caso, o que está publicado e o que está em rascunho.

No bloco financeiro do lote C aparece o contrato real. Como a Ana **não tem nenhuma parcela lançada**, o bloco de parcelas mostra o estado vazio “Nenhuma parcela registrada” com um caminho para a formalização — conforme você decidiu, nada é criado.

Cada linha continua mostrando fonte, estado, responsável, data e destino no App.

## 2. Aba Conta do App

Confiro a aba Conta lendo o mesmo contrato, já filtrado por caso e titular: título, número e situação da assinatura (o contrato da Ana ainda está sem data de assinatura, então aparece como pendente, nunca como assinado). Parcelas: estado vazio canônico. Acesso ao App: ainda bloqueado, porque a Ana não tem convite.

## 3. Tela de leads com etapas e CTAs

Nova tela no Comercial, sobre a tabela de leads que já existe:

- Gráfico de etapas do funil (quantos leads em cada fase) e cartão de cada lead com nome, origem, responsável, próximo passo e último toque.
- **Registrar Discovery** e **Registrar Call** gravam de verdade, usando os gravadores já existentes: Discovery guarda contexto e consentimento; Call guarda data, resultado e próximo passo. Ambos ficam no histórico de interações do lead.
- **Proposta** e **Handoff** não gravam: navegam para a ação que já existe (proposta) e mostram a etapa de handoff como informativa até o motor estar ligado.
- Sem lead de teste, sem dado de exemplo; se não houver lead, estado vazio com o cadastro existente.

## 4. Microentrega publicada e prova de despublicação

- Crio **uma** microentrega descrevendo um marco real já ocorrido do caso (sem inventar conteúdo genealógico), aprovo e publico como projeção sanitizada do caso e da titular.
- Confiro que ela aparece em **Home**, **Jornada** e **Legado** do App.
- Despublico e confiro que ela some das três abas, com o registro preservado no banco — nada apagado, autor e data mantidos.

## 5. Gráfico de parcelas por vencimento no App

Adiciono o gráfico de parcelas por mês de vencimento na aba Conta, alimentado só por faturas reais do caso e da titular (excluindo rascunho e cancelada; paga só com pagamento confirmado). Como hoje a Ana não tem fatura, o gráfico não é desenhado: fica o estado vazio “Nenhuma parcela registrada”. Assim que a primeira parcela real existir, o gráfico aparece sozinho.

## Detalhes técnicos

- Leitura por `carregarGoLive` (autenticada, escopo de organização + caso canônico); ficha em `src/lib/golive-ficha.ts`.
- Gravação reaproveitando `registrarDiscoveryGoLive`, `registrarCallGoLive`, `criarMicroentregaGoLive`, `aprovarMicroentregaGoLive`, `publicarNoAppGoLive`, `despublicarDoAppGoLive`. Nenhum gravador novo além da tela de leads.
- Nova rota `/golive/leads`; App em `src/routes/_authenticated/golive.app.tsx` e cálculos em `src/lib/golive-app.ts`, com testes puros para o agrupamento de parcelas por vencimento.
- Sem migration, sem RLS, sem tabela, sem catálogo/SKU, sem cobrança externa, sem envio de e-mail, WhatsApp ou convite, sem deploy de produção.

## Entrego ao final

Prints autenticados de desktop e 375 px da ficha por lotes, da tela de leads, da aba Conta e das três abas do App antes e depois de despublicar, mais a lista de arquivos alterados.
