# P5b — Inventário de filtros automáticos cliente-facing e reuso de CPF (2026-09-26)

```yaml
pedido literal: "Verifique quais outros filtros automáticos podem ser reutilizáveis
  entre as abas e o app"
```

## Achado — 10 filtros independentes, mesma família de problema, quase nenhum reuso

Levantamento por leitura direta de código (não por título de arquivo): existem hoje
**10 módulos** que implementam, cada um com sua própria lista de palavras/regex, a
mesma política de fundo — "este texto não pode chegar ao cliente sem sanitização".
Nenhum destes reutiliza o outro; cada um foi escrito na sua própria rodada, para o
seu próprio gate.

| # | Módulo | Função | O que bloqueia hoje | Onde gate |
|---|---|---|---|---|
| 1 | `biblioteca-evidencias.ts` | `conteudoProjetavel` | URL/link interno, juízo de mérito (hipótese/risco/confidencial), **CPF (corte anterior)** | Escrita de `app_projections` (`aprovarProjecao`, `salvarProjecao`, `projetarRelatorioParaApp`) |
| 2 | `achados-genealogicos.ts` | `termoProibido` | Determinismo/garantia, linguagem terapêutica/esotérica | `validarAchado`, `validarEncontro`, `projetarEncontroParaCliente` |
| 3 | `jornada-cliente.ts` | `entregasParaAppCliente` (regex local) | Jargão interno (sku/score/risco/elegibilidade/evidência/asaas/preço) | Filtro de micro-entregas antes do App |
| 4 | `onboarding-jornada.ts` | `contemConteudoInterno` | Jargão comercial/financeiro (sku/preço/honorário/contrato/dossiê) | `portal-dados-vivos.ts`, `portal-atendimento.functions.ts` |
| 5 | `portal-linguagem-viva.ts` | `textoParaCliente` | Marcas técnicas (UUID, nome de tabela/coluna/policy, URL, SKU/código interno) + `contemTermoProibido` (jargão Desk/CRM/RLS) | **Camada mais reutilizada de todas** — cadência, pesquisa, documentos, entregas, fases e legado atravessam por aqui |
| 6 | `portal-copy.ts` | `contemTermoProibido` (chamada por #5) | Palavras isoladas: desk/crm/rls/webhook/pipeline/gate/sla/touchpoint/sku/backlog/mockup/seed/placeholder/null | Consumida só por `textoParaCliente` |
| 7 | `fila-comunicacao.ts` | `textoSuspeito`/`avaliarSugestao` | URL, token, score, "radar de elegibilidade", hipótese, marco jurídico, gravação, evidência, custo/CAC/CPL/ROI/ROAS | Sugestão de mensagem — **rascunho revisado por humano antes de enviar**, nunca vai direto |
| 8 | `templates-whatsapp.ts` | `TERMOS_PROIBIDOS` (validação de template) | chance/garantid/certeza de êxito/hipótese forte + a palavra literal **"cpf"**, senha, token, boleto, pix | Validação de template WhatsApp antes de uso |
| 9 | `onboarding-jornada.ts` (mesma lista, uso distinto) | — | (já contado em #4) | — |
| 10 | `ca04-crm-mestre.ts` | `roteiroSemLinguagemConclusiva` | "elegibilidade confirmada"/"direito adquirido"/"cidadania reconhecida"/"rota jurídica definida" | Roteiro-base de Discovery (script, não dado de caso) |

**Antes deste corte, só 2 de 10 tinham qualquer proteção contra CPF** — #1 (regex
completa, criada no corte anterior) e #8 (só a palavra literal "cpf", não o formato
do número — não pegaria "111.444.777-35" digitado sem escrever a palavra "CPF" do
lado). Os outros 8 — incluindo #5, que é a camada de MAIOR alcance, coberta em
cadência/pesquisa/documentos/entregas/fases/legado — não tinham nenhuma.

## Executado — `contemCpf` vira fonte única, reaproveitada em 5 gates reais

Extraído de `biblioteca-evidencias.ts` (onde tinha sido criado no corte anterior,
como código local) para `src/lib/validacao-pessoa.ts` — o módulo que já é a fonte
única de CPF/CEP/UF/telefone. Detecta formato pontuado (`000.000.000-00`,
inconfundível) e sequências de 11 dígitos crus que batem o dígito verificador real
(reaproveita `cpfValido`; evita falso positivo em outro número de 11 dígitos que
não é CPF).

Reaproveitado (import, não duplicação de regex) nos **5 gates que já protegem
conteúdo cliente-facing real**:

1. `biblioteca-evidencias.ts#conteudoProjetavel` — já existia (corte anterior);
   agora importa de `validacao-pessoa.ts` em vez de manter cópia local.
2. `achados-genealogicos.ts#termoProibido` — protege `title_client`/
   `resumo_aprovado_cliente`/`repertorios_narrativos`/`memoria_familiar` em
   `validarAchado`/`validarEncontro`, e a projeção final em
   `projetarEncontroParaCliente`.
3. `jornada-cliente.ts#entregasParaAppCliente` — micro-entregas ao cliente
   (`client_deliverables`), o mesmo tipo de gate que #1 protege para achados/
   relatórios.
4. `onboarding-jornada.ts#contemConteudoInterno` — consumido por
   `portal-dados-vivos.ts` e `portal-atendimento.functions.ts` (dados vivos e
   atendimento do App Cliente).
5. `portal-linguagem-viva.ts#textoParaCliente` — a camada de maior alcance;
   fechar aqui é o que dá a maior cobertura de uma vez só, porque é atravessada
   por cadência, pesquisa, documentos, entregas, fases e legado.

## Declarado, não tocado nesta rodada (decisão de escopo, não esquecimento)

- **`fila-comunicacao.ts`** — sugestões de mensagem sempre passam por revisão
  humana antes de enviar (nunca é envio automático); risco menor que os 5 gates
  acima, que decidem sozinhos o que o cliente vê. Não adicionado agora.
- **`templates-whatsapp.ts`** — já bloqueia a palavra literal "cpf"; upgrade para
  detectar o formato do número (não só a palavra) fica para quando houver pedido
  específico sobre templates.
- **`ca04-crm-mestre.ts`** — protege o roteiro-base de Discovery (texto fixo de
  script, não dado de caso/cliente); CPF nunca apareceria ali por natureza do
  conteúdo.
- Nenhuma das 10 listas de palavras foi fundida numa única — cada uma protege um
  conjunto de termos específico do seu próprio domínio (jargão financeiro é
  diferente de jargão técnico de banco, que é diferente de linguagem
  determinista/terapêutica). Só o que é genuinamente o MESMO problema em todo
  lugar — CPF — foi consolidado numa fonte única.

## Verificação

`tsc --noEmit` limpo. 8 testes novos
(`p5b-filtros-cpf-reutilizados-2026-09-26.test.ts`) cobrindo `contemCpf` e os 5
gates que passaram a reutilizá-la. Suíte completa: 407/414 arquivos, 3850/3869
testes — 7 arquivos/11 testes em falha, idêntico à baseline estável pré-existente
(visual/portal, não relacionados a este corte). `vite build` limpo.

## Prova Lovable pós-push

Em qualquer um dos 5 pontos (Biblioteca Mestre, um achado com texto cliente-facing,
uma micro-entrega, o painel de onboarding do App, ou qualquer tela do Portal que
mostre "dados vivos"): digitar um CPF (formato `000.000.000-00`) no campo
cliente-facing correspondente e confirmar que o conteúdo é recusado (Desk) ou
some/vira vazio (App) — nunca aparece cru na tela do cliente.
