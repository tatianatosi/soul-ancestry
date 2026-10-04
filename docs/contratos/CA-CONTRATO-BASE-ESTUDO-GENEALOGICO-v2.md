# CA-CONTRATO-BASE-ESTUDO-GENEALOGICO-v2

- **Modelo válido para geração:** `MODELO-ESTUDO + BASE-GEN-V2`
- **Versão:** v2.0
- **Data:** 2026-08-22
- **Status:** `vigente` — revisão jurídica concluída e aprovada.
- **Decisão da Proprietária, 03/10/2026:** "Contrato da Ana correto é v2.0 com 14 cláusulas
  e já foi revisado e aprovado pelo jurídico." O status anterior era
  `under_legal_review`; esta linha registra a mudança, não a apaga.
- **Decisão da Proprietária, 04/10/2026:** "pode aprovar as demais cláusulas de
  inadimplemento e rescisão." As cláusulas O (Inadimplemento) e P (Rescisão) — números 15 e
  16 no módulo `src/lib/contrato-base-consolidado.ts` — passam a integrar o conjunto
  aprovado. A numeração não foi deslocada: seguem depois de Disposições finais, para não
  alterar a referência de nenhuma cláusula já citada em contrato gerado. A decisão de 03/10
  (14 cláusulas) fica registrada como etapa anterior.
- **Fonte canônica única.** Nenhum texto jurídico pode viver em prompt, comentário de código,
  campo de formulário ou página de governança fora deste arquivo e dos módulos que o carregam.

> A revisão jurídica deste instrumento está concluída (03/10/2026). Vigência não é, por si,
> autorização de ato externo: cobrança, assinatura, envio, portal e automação continuam
> dependendo dos gates formais e de ato humano explícito.

---

## 1. Cláusulas fixas (texto versionado, não editável por caso)

O corpo contratual é fixo e institucional. A ficha contratual preenche apenas:
**partes, serviço/escopo, entrega, comercial, anexos, prazo e referências.**

| # | Cláusula fixa | Conteúdo institucional |
|---|---------------|------------------------|
| A | Qualificação institucional da contratada | Identificação da contratada, natureza da atividade e forma de atuação. |
| B | Objeto do estudo/pesquisa genealógica | Estudo genealógico documental e analítico, com entregas descritas em anexo de escopo. |
| C | Obrigações do contratante | Fornecer informações e documentos, responder dependências, aprovar despesas de terceiros. |
| D | Obrigações da contratada | Executar o estudo com diligência técnica, registrar fontes e comunicar pendências. |
| E | Limitações | Ausência de garantia de localização de registro, comprovação de linhagem, cidadania, documento, protocolo ou resultado. |
| F | Natureza intelectual do serviço | Obrigação de meio, de natureza intelectual e investigativa; não é obrigação de resultado. |
| G | Escopo de entregas e encerramento | Entregas, marcos e critérios objetivos de encerramento do escopo contratado. |
| H | Dados, confidencialidade, LGPD, guarda e descarte | Tratamento conforme política jurídica vigente, com finalidade delimitada, guarda e descarte definidos. |
| I | Preço, condição de pagamento e início do serviço | Preço de origem homologada; início após condição de pagamento cumprida. |
| J | Despesas de terceiros | Fora dos honorários; comunicadas e pagas diretamente pelo cliente, mediante aprovação registrada. |
| K | Prazos, dependências documentais e ajustes de prazo | Prazos condicionados a dependências documentais e a terceiros; ajustes formalizados. |
| L | Propriedade intelectual | Titularidade dos métodos e materiais analíticos da contratada; uso licenciado ao contratante. |
| M | Assinatura, registros e prova | Assinatura eletrônica com referência externa verificável e registro de auditoria. |
| N | Disposições finais e foro autorizado | Integralidade, comunicação oficial e foro autorizado. |
| O | Inadimplemento | Mora, multa, correção e suspensão da execução após 30 dias, sem indenização pelo período suspenso. |
| P | Rescisão | Aviso prévio de 15 dias, dispensa do aviso em inadimplemento acima de 60 dias, entrega dos materiais já produzidos. |

Adendos vigentes em revisão: `ADENDO-CANCELAMENTO-v1.0`, `ADENDO-CANAIS-OFICIAIS-v1.0`.

O motor de geração (`corpo-contratual`, `contrato-corpo.server`, `matriz-modelos-contratuais`)
sempre renderizou as 16 cláusulas do módulo. Até 03/10/2026 o marcador de aprovação cobria
só 14; a decisão de 04/10 alinhou o marcador ao motor, sem reescrever nenhum texto.

---

## 2. Lista estrita de variáveis permitidas

Somente estes grupos podem ser parametrizados por caso. Qualquer outro campo é proibido
e não pode ser inferido: campo ausente permanece pendente.

1. **Partes** — contratante(s), signatário(s), representação quando aplicável.
2. **Serviço/escopo** — vindo de proposta/OS aprovada do mesmo caso.
3. **Entrega** — marcos e produtos previstos no escopo aprovado.
4. **Comercial** — preço, condição e parcelas de origem homologada.
5. **Anexos** — derivados por regra, nunca escolhidos à mão.
6. **Prazo** — janelas e dependências documentais.
7. **Referências** — proposta/OS, caso, catálogo/SKU, documentos de origem.

---

## 3. Mapa de anexos aplicáveis

| Anexo | Aplicabilidade |
|-------|----------------|
| ANX-ESCOPO | Sempre; único por caso. |
| ANX-COMERCIAL | Sempre; vinculado à condição comercial homologada. |
| ANX-PRIVACIDADE | Sempre. |
| ANX-INDIVIDUAL | Um por pessoa abrangida pelo serviço. |
| ANX-REPRESENTACAO | Somente com menor ou incapaz representado. |
| Anexo I — Ordem de Serviço | Somente após proposta/OS válida, aprovada e vinculada ao mesmo caso. |
| Anexo II — Despesas externas | Conforme política institucional de despesas de terceiros. |
| Anexo III — Autorização de pesquisa | Somente com ação externa aplicável e aceite rastreável. |
| Anexo IV — Procuração | Somente quando exigida pela atividade, com país/órgão confirmado. |
| Anexo V — Alteração de escopo | Toda inclusão, exclusão ou alteração posterior de escopo. |

Derivação por: produto, país/rota, escopo, estrutura familiar e representação.

---

## 4. Regra institucional de despesas

Despesas de terceiros (taxas, emolumentos, traduções, apostilamentos, envios) estão
**fora dos honorários**. São comunicadas ao cliente, dependem de aprovação registrada e
são **pagas diretamente pelo cliente**. Nenhuma despesa é assumida, adiantada ou
automatizada pela contratada.

## 5. Regra de preço/SKU

Preço tem origem homologada no catálogo/Planilha Mestre. A proposta aprovada apenas
complementa o campo comercial autorizado do caso. Preço digitado livremente é inválido.

---

## 6. Ordem de precedência de fontes

`Planejador homologado → proposta/OS aprovada → CRM confirmado → documento → importado a confirmar`

- Texto de WhatsApp e transcrição são **material de apoio**: nunca validam dado automaticamente.
- Escopo vem da proposta/OS aprovada do mesmo caso, nunca de texto digitado livre.
- Modelo Simples, Modelo 2024 e Contrato-Mãe em branco são **históricos** e não geram prévia.

---

## 7. Gates

| Gate | Condição |
|------|----------|
| Prévia | Modelo válido, registro mestre de parâmetros do caso e origem de cada variável. |
| Revisão | Prévia completa, sem pendência bloqueante, com revisor humano registrado. |
| Assinatura | Revisão concluída e versão persistida (snapshot), nunca a partir de rascunho. |
| Financeiro | Somente após contrato assinado e referência externa de assinatura. |

Regras de rascunho: **um único rascunho editável por caso**; snapshots só em eventos de
governança; proposta arquivada permanece recuperável, mas **não satisfaz gate contratual**.

Caso familiar: um contrato-base, adultos aplicáveis como signatários, anexos individuais
e representação condicional de menor.

---

## 8. Matriz de renderização obrigatória

| Bloco | Fonte | Tipo | Renderização | Gate |
|-------|-------|------|--------------|------|
| Cabeçalho e versão | Contrato-base | Fixo | Sempre | Prévia |
| Qualificação da contratada | Perfil institucional versionado | Fixo | Sempre | Prévia |
| Partes | Ficha (CRM confirmado/documento) | Variável | Sempre | Revisão |
| Objeto | Contrato-base | Fixo | Sempre | Prévia |
| Escopo e entregas | Proposta/OS aprovada | Variável | Sempre | Revisão |
| Obrigações do contratante | Contrato-base | Fixo | Sempre | Prévia |
| Obrigações da contratada | Contrato-base | Fixo | Sempre | Prévia |
| Limitações | Contrato-base | Fixo | Sempre | Prévia |
| Natureza intelectual | Contrato-base | Fixo | Sempre | Prévia |
| Dados e LGPD | Contrato-base + ANX-PRIVACIDADE | Fixo | Sempre | Prévia |
| Comercial | Catálogo homologado + proposta aprovada | Variável | Sempre | Financeiro |
| Despesas de terceiros | Política institucional | Fixo | Sempre | Revisão |
| Prazos e dependências | Ficha + escopo aprovado | Variável | Sempre | Revisão |
| Propriedade intelectual | Contrato-base | Fixo | Sempre | Prévia |
| Assinatura e prova | Contrato-base | Fixo | Sempre | Assinatura |
| Anexos aplicáveis | Regra derivada | Variável | Quando aplicável | Revisão |

---

## 9. Modelos de composição complementares

Modelos de composição descrevem **quem** compõe o contrato; não alteram o texto-base.

- `INDIVIDUAL — REQUERENTE ÚNICO COM ACOMPANHANTE — v1.0` (`under_legal_review`) —
  ver `src/lib/modelo-individual-acompanhante.ts` e a tela interna
  `/governanca/modelo-individual`.
