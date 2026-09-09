> **Nota de arquivamento (01/09/2026) — SUPERSEDIDO:** Esta é a versão standalone v1.0 da "Parte II" do artefato consolidado. **Foi corrigida e substituída pela v1.0.1**, já arquivada em `docs/arquitetura/CA04-CRM-MESTRE-DISCOVERY-HANDOFF-2026-08-13.md`, cuja própria seção "Changelog v1.0 → v1.0.1" e "Tabela: regra anterior → regra corrigida" documentam exatamente o que mudou (8 correções: separação Painel de Calls/CRM Mestre, revisão jurídica com "Dispensa homologada", remoção de "Público histórico" de dossiê de cliente, lista de proibições do Cliente autorizado ampliada, regra de criação de Dossiê/Caso unificada, gatilhos de criação corrigidos, estados de evidência padronizados, distinção Consentimento×pesquisa prévia). Preservado aqui como histórico, sem alteração de conteúdo — **usar a v1.0.1 como referência, não este arquivo.**

---

# Clube Ancestral — Arquitetura Conceitual do CRM Mestre

**Versão:** 1.0
**Projeto:** Clube Ancestral
**Aba de referência:** CA 04 — CRM Mestre, Discovery e Handoff
**Modo:** Arquitetura, governança e migração conceitual
**Natureza:** Especificação de conceito e regras. Não implementa, integra ou altera nenhum sistema.

---

## 0. Escopo, princípios e limites

### 0.1 O que este documento é

Uma especificação conceitual de como o **CRM Mestre** deve se estruturar por ciclo de vida — entidades, campos mínimos, máquinas de estado, roteiro de Discovery, regras de handoff, privacidade e migração — usando como base o **Dicionário de Validações do Painel de Calls → CRM v1.1** já consolidado.

### 0.2 O que este documento não é e não faz

Não cria Google Sheet, Google Doc, banco de dados, automação, webhook ou integração de API. Não altera Painel de Calls, CRM legado, CA OPS, AppSheet, Drive, Dropbox, Asaas, Planilha Mestre, Lovable, App Cliente ou Desk. Não envia mensagem, não cria proposta, contrato, link de cobrança, SKU ou preço. Não migra dados reais. Não pesquisa fontes genealógicas, não faz pedido institucional, não produz parecer jurídico individual e não publica conteúdo externo.

### 0.3 Princípios obrigatórios (herdados do prompt aprovado)

1. Painel de Calls é a camada de entrada, preparação de call, registro inicial, SPIN, handoff e próxima ação.
2. CRM Mestre é a camada estruturada de ciclo de vida de lead, oportunidade, proposta, formalização, cliente, onboarding e vínculo de caso.
3. Planilha Mestre é a fonte de verdade para SKU, status de produto, escopo, preço homologado, condição e link de cobrança.
4. Asaas é a fonte de verdade para evento e status transacional de cobrança/pagamento.
5. Desk e dossiê autorizado são fontes de verdade para caso, pesquisa, fonte, evidência, documento, pendência e histórico operacional.
6. App Cliente e one-page recebem somente conteúdo aprovado, sanitizado e autorizado.
7. CRM legado e CA OPS são históricos consultáveis; não são fonte canônica de dados novos.
8. Nenhum documento, transcrição, fonte, hipótese jurídica, preço provisório, SKU técnico, gravação ou dado de terceiros pode vazar para App Cliente ou one-page.
9. O caso da Ana Luiza é referência histórica de roteiro e processo, não template-mãe nem modelo de dados a copiar.
10. O Painel de Calls atual é insumo de operação real, não estrutura final de CRM.

### 0.4 Ajustes de segurança incorporados (v1.1 + este documento)

- Painel de Calls e CRM Mestre são camadas separadas — nenhuma entidade de CRM Mestre é editada diretamente pelo Painel; o Painel só entrega dados de handoff.
- Dossiê de cliente só admite os níveis: **Restrito; Equipe do caso; Cliente autorizado.** O nível "Público histórico" do Dicionário v1.1 é reclassificado neste documento: só pode existir para **biblioteca histórica sanitizada**, nunca associado a um dossiê de cliente (ver §H.1).
- Cliente autorizado acessa apenas área cliente segregada e conteúdo aprovado; nunca documento cru, fonte, URL interna, gravação, transcrição, CRM, Desk, dado de terceiro, SKU técnico, preço provisório ou hipótese jurídica.
- Campo de revisão jurídica passa a usar: **Obrigatória; Dispensa homologada; A definir** (substitui o Sim/Não simples do v1.1 nas entidades onde a revisão jurídica é condição de bloqueio — ver §I).
- "Dispensa homologada" só pode ser preenchida por regra previamente aprovada por país/via/marco, ou por decisão de responsável autorizado, com data e justificativa registradas.

### 0.5 Fontes usadas como referência

Dicionário de Validações do Painel de Calls → CRM v1.1 (documento consolidado nesta mesma aba) · Painel de Calls Discovery — Roteiro Vivo (estrutura atual de 21 campos operacionais e roteiro SPIN em 6 blocos) · Roteiro de Discovery do caso Ana Luiza (usado apenas como referência estrutural, sem dado pessoal) · Auditoria-Mãe / Bloco 5A e adendo (estados de evidência, fontes M1–M6, regras de visibilidade e consentimento) · Estrutura do Desk Intelligence · Studio de Devolutivas · Estrutura da Planilha Mestre de Produtos/SKUs · Decisões operacionais de Política de Privacidade, Termo de Direitos Autorais e Glossário público já registradas no projeto.

Onde uma fonte não tinha definição suficiente para uma decisão de arquitetura, isso está marcado explicitamente como **decisão humana pendente** em vez de ser inventado.

---

## A. Arquitetura do CRM Mestre por ciclo de vida

```
Painel de Calls (entrada, SPIN, consentimento inicial, próxima ação)
        │  handoff estruturado (dados de call)
        ▼
Brief de Discovery (mapeamento narrativo por pessoa/oportunidade)
        │  campos estruturados retornam ao CRM; narrativa fica no Brief/Desk
        ▼
CRM Mestre — Oportunidade
        │  cria e atualiza
        ├──► Diagnóstico (síntese comercial/técnica preliminar)
        │
        ▼
Proposta (referencia Produto/SKU da Planilha Mestre)
        │  aceite
        ▼
Contrato (Formalização)
        │  assinatura
        ▼
Pagamento (referência à Asaas; CRM não é fonte transacional)
        │  conciliação confirmada
        ▼
Cliente (ativação)
        │
        ▼
Onboarding
        │  condição operacional atendida
        ▼
Caso (aberto no Desk)
        │  pesquisa, evidência, documento, fonte — tudo no Desk/dossiê
        ▼
Entrega aprovada (conteudo_aprovado = true)
        │
        ▼
App Cliente / One-page (somente conteúdo aprovado, sanitizado)
```

**Camadas paralelas que alimentam o fluxo sem fazer parte da cadeia linear:**

- **Consentimento** — associado a Lead/Cliente desde a primeira call; condiciona gravação, transcrição, pesquisa prévia e qualquer publicação.
- **Dossiê-mãe** — abre no núcleo/família a partir do momento em que há mais de um requerente potencial; cada Requerente individual mantém vínculo próprio.
- **CRM legado / CA OPS** — consultados apenas como histórico de contexto (por exemplo, para saber se um lead já foi atendido antes); nunca escrevem no CRM Mestre.

**Regra estrutural central:** cada seta do diagrama acima corresponde a uma linha da Matriz de Handoff (§G) e a uma transição de estado (§D). Nenhuma entidade avança de camada sem que a condição de aprovação da linha correspondente esteja satisfeita.

---

## B. Tarefa 1 — Matriz de fontes de verdade

| Camada | Responsabilidade canônica | Dado que pode registrar | Dado que não pode registrar | Visibilidade | Responsável operacional | Condição de atualização |
|---|---|---|---|---|---|---|
| **1. Painel de Calls** | Entrada, preparação de call, SPIN, consentimento inicial, resultado da call, próxima ação | Dados de contato, status da call, SPIN, sinal de aderência preliminar (referência), objeção, próxima ação | Preço final, SKU técnico, contrato, dossiê, evidência, conclusão jurídica | Interna: Comercial | SDR/Closer responsável pela call | A cada call ou interação de qualificação |
| **2. Brief de Discovery** | Mapeamento narrativo complementar por pessoa/oportunidade | Hipóteses, lacunas, perguntas prioritárias/a evitar, objeções prováveis, risco de privacidade, decisão esperada | Preço, SKU, contrato, conclusão jurídica, dado que deva ir a sistema transacional | Interna: Comercial + Pesquisa | Responsável nominal da oportunidade | Antes e imediatamente após cada call |
| **3. CRM Mestre** | Ciclo de vida estruturado de lead, oportunidade, proposta, formalização, cliente, onboarding, vínculo de caso | Estados dos eixos Comercial e Formalização/Operação, referências (não os dados-fonte) a SKU/preço/contrato/pagamento/dossiê | Preço homologado (só referencia), evidência de pesquisa, documento, transcrição, gravação como arquivo | Interna: Comercial/Operações/Financeiro conforme campo | Responsável nominal + área responsável | Em cada evento de transição de estado |
| **4. Planilha Mestre** | SKU, status de produto, escopo, preço homologado, condição, link de cobrança | Produto, SKU, preço vigente, condição comercial, link | Dado de cliente, caso, evidência, dossiê | Interna: Comercial/Financeiro | Responsável de catálogo (a definir) | Mudança de portfólio/preço homologada |
| **5. Asaas** | Evento e status transacional de cobrança/pagamento | Cobrança emitida, status de pagamento, data de conciliação | Escopo do produto, dado de caso, evidência, dossiê | Interna: Financeiro | Financeiro | A cada evento transacional |
| **6. Dossiê-mãe autorizado** | Repositório do núcleo/família: pesquisa, evidência, documento, fonte, pendência | Documento recebido, evidência, fonte, estado de evidência, pendência, histórico do caso | Preço, SKU, dado transacional | Restrito / Equipe do caso / Cliente autorizado (nunca "Público histórico") | Responsável pelo dossiê | Conforme avanço da pesquisa/caso |
| **7. Desk Intelligence** | Backoffice do caso: saúde do caso, pesquisa, validação jurídica, financeiro consolidado, radar interno | Status operacional do caso, validação de evidência, pendência, bloqueador, resumo do relacionamento | Preço definitivo (referencia Planilha Mestre/Asaas), dado bruto de terceiro sem autorização | Restrita: equipe autorizada | Responsável do caso + Pesquisa | Conforme rotina operacional (ex.: checklist semanal) |
| **8. App Cliente** | Camada de entrega ao cliente final | Conteúdo aprovado (`conteudo_aprovado = true`), estado sintetizado, próximo passo, pendência compreensível | Fonte técnica, URL interna, documento cru, gravação, transcrição, hipótese jurídica, SKU técnico, preço provisório, dado de terceiro | Cliente autorizado (área segregada) | Responsável pela aprovação de conteúdo | Após aprovação humana de cada entrega |
| **9. Studio de Devolutivas** | Geração de devolutiva de leitura inicial (one-page) a partir de dados já aprovados no Desk | Síntese de sinais/achados qualificados, estado de evidência, pendência, próxima etapa recomendada | Documento cru, transcrição, gravação, fonte técnica, diagnóstico jurídico, preço, SKU | Interna até aprovação; depois Cliente autorizado ou uso comercial | Responsável pela revisão humana da devolutiva | Por solicitação, sempre com revisão humana antes do envio |
| **10. CRM legado / CA OPS** | Histórico consultável de leads, casos e operações anteriores | Nada novo — é somente leitura (append-only) | Qualquer dado novo de lead, caso, proposta ou pagamento ativo | Interna: consulta histórica | Quem consulta o histórico | Não se atualiza; eventual retorno de lead cria novo registro no CRM Mestre com referência ao histórico |

---

## C. Tarefa 2 — Dicionário de entidades do CRM Mestre

Convenção usada em cada ficha: **Finalidade · ID principal · Campos mínimos · Campos internos/restritos · Campos sensíveis · Sistema proprietário · Gatilho de criação · Responsável · Atualização · Encerramento · Relações · App? · One-page? · Consentimento? · Revisão humana?**

### C.1 Cluster — Aquisição e relacionamento

**1. Lead**
- Finalidade: registrar o primeiro contato antes de qualificação.
- ID principal: ID da oportunidade (gerado na entrada).
- Campos mínimos: nome, canal de contato, origem do lead, data de entrada, objetivo declarado.
- Internos/restritos: área responsável, responsável nominal, observações internas.
- Sensíveis: WhatsApp/e-mail (dado pessoal).
- Sistema proprietário: CRM Mestre (entrada via Painel de Calls).
- Gatilho de criação: primeiro contato registrado no Painel de Calls.
- Responsável: SDR/Comercial.
- Atualização: a cada nova interação até a qualificação.
- Encerramento: converte para Oportunidade qualificada ou é marcado Perdido/Encerrado sem aderência.
- Relações: origina Contato, Oportunidade.
- App? Não. One-page? Não. Consentimento? Não neste estágio (consentimento próprio é para gravação/pesquisa, tratado à parte). Revisão humana? Não.

**2. Contato**
- Finalidade: dado cadastral de uma pessoa física associada a um Lead/Cliente.
- ID principal: ID de contato (vinculado ao ID do requerente quando aplicável).
- Campos mínimos: nome civil, WhatsApp, e-mail.
- Internos/restritos: histórico de canais usados.
- Sensíveis: todos os dados de identificação pessoal (LGPD).
- Sistema proprietário: CRM Mestre.
- Gatilho de criação: primeiro registro de Lead.
- Responsável: Comercial/Operações.
- Atualização: quando o cliente corrige ou complementa dado cadastral.
- Encerramento: não se encerra; é arquivado se o vínculo com Lead/Cliente for encerrado.
- Relações: vincula-se a Lead, Requerente individual, Núcleo familiar.
- App? Dado básico de nome pode aparecer na área do cliente autorizado; e-mail/WhatsApp não são exibidos como dado de terceiro. One-page? Não (nome pode constar em devolutiva dirigida ao próprio titular). Consentimento? Sim, para uso além do atendimento direto. Revisão humana? Não.

**3. Núcleo familiar**
- Finalidade: agrupar requerentes que compartilham a mesma linha/dossiê-mãe.
- ID principal: ID do núcleo/família.
- Campos mínimos: identificador do núcleo, lista de requerentes vinculados, país/linha prioritária do núcleo.
- Internos/restritos: mapa de parentesco resumido.
- Sensíveis: estrutura familiar completa.
- Sistema proprietário: CRM Mestre + Dossiê-mãe (referência cruzada).
- Gatilho de criação: identificação de mais de um requerente potencial na mesma linha.
- Responsável: Pesquisa/Comercial.
- Atualização: quando novo requerente é identificado ou removido do núcleo.
- Encerramento: quando todos os requerentes do núcleo são arquivados/encerrados.
- Relações: agrega Requerente individual; referencia um único Dossiê-mãe.
- App? Não (estrutura completa é dado interno). One-page? Não. Consentimento? Sim, indireto (depende do consentimento de cada requerente). Revisão humana? Não.

**4. Requerente individual**
- Finalidade: manter registro individual de cada pessoa dentro de um núcleo familiar.
- ID principal: ID individual do requerente.
- Campos mínimos: vínculo ao núcleo, papel no núcleo (ex.: titular, pai/mãe, irmã), estágio comercial próprio.
- Internos/restritos: sinal de aderência preliminar próprio, via jurídica preliminar própria.
- Sensíveis: geração do ascendente, linha de transmissão, risco de ruptura.
- Sistema proprietário: CRM Mestre.
- Gatilho de criação: quando um membro do núcleo passa a ter Oportunidade própria.
- Responsável: responsável nominal da oportunidade.
- Atualização: a cada avanço de eixo comercial/formalização do próprio requerente.
- Encerramento: quando a Oportunidade do requerente é encerrada/arquivada.
- Relações: pertence a um Núcleo familiar; gera Oportunidade, Cliente, Caso próprios.
- App? Dado básico (nome, estágio simplificado) sim, na área do próprio requerente autorizado. One-page? Sim, quando dirigida a ele. Consentimento? Sim. Revisão humana? Não neste nível (a revisão humana está no Diagnóstico/Marco jurídico, não no cadastro).

**5. Interação**
- Finalidade: registrar cada ponto de contato (call, WhatsApp, e-mail) ao longo do relacionamento.
- ID principal: ID de interação (sequencial por oportunidade).
- Campos mínimos: data/hora, canal, tipo (call, mensagem, e-mail), resumo curto.
- Internos/restritos: link de gravação/transcrição (se houver e houver consentimento).
- Sensíveis: conteúdo de mensagens pessoais.
- Sistema proprietário: Painel de Calls (origem) / CRM Mestre (registro consolidado).
- Gatilho de criação: cada contato registrado.
- Responsável: quem realizou o contato.
- Atualização: não se edita após registrada; correções geram nova nota.
- Encerramento: não se encerra individualmente; é appendice do histórico da Oportunidade.
- Relações: pertence a uma Oportunidade; pode gerar Tarefa.
- App? Não. One-page? Não. Consentimento? Sim, se envolver gravação. Revisão humana? Não.

### C.2 Cluster — Comercial

**6. Oportunidade**
- Finalidade: representar a possibilidade comercial em curso para um Lead/Requerente.
- ID principal: ID da oportunidade.
- Campos mínimos: eixo Comercial, eixo Formalização/Operação, Resultado comercial (derivado), área responsável, responsável nominal, próxima ação datada.
- Internos/restritos: motivo de perda, objeção predominante, nível de intenção.
- Sensíveis: nenhuma direta (agrega referências a entidades sensíveis).
- Sistema proprietário: CRM Mestre.
- Gatilho de criação: qualificação do Lead.
- Responsável: responsável nominal.
- Atualização: a cada transição de eixo (ver §D).
- Encerramento: Perdido, Encerrado sem aderência, ou avanço total para Caso ativo/Arquivado.
- Relações: liga-se a Discovery, Brief, Diagnóstico, Proposta, Contrato, Cliente, Caso.
- App? Não (estado interno). One-page? Não. Consentimento? Não diretamente. Revisão humana? Não neste nível.

**7. Discovery**
- Finalidade: representar a call estruturada de qualificação/diagnóstico.
- ID principal: ID da call (vinculado à Oportunidade).
- Campos mínimos: data/hora, status da call, responsável, SPIN (4 estados), resultado da Discovery.
- Internos/restritos: roteiro-base utilizado, perguntas que não devem ser repetidas.
- Sensíveis: consentimento de gravação e seus metadados.
- Sistema proprietário: Painel de Calls (execução) / CRM Mestre (registro consolidado).
- Gatilho de criação: agendamento da call.
- Responsável: SDR/Closer designado.
- Atualização: ao confirmar, realizar, remarcar ou cancelar.
- Encerramento: quando a call é realizada e o resultado é registrado, ou cancelada definitivamente.
- Relações: gera Brief de Discovery; pertence a uma Oportunidade; pode gerar Consentimento.
- App? Não. One-page? Não (a devolutiva é produto derivado, não a call em si). Consentimento? Sim, obrigatório antes de gravar. Revisão humana? Não na entidade em si.

**8. Brief de Discovery**
- Finalidade: mapeamento narrativo complementar por pessoa/oportunidade (ver §F para template completo).
- ID principal: ID da oportunidade + data da call.
- Campos mínimos: listados em §F.
- Internos/restritos: hipóteses, lacunas, perguntas a evitar.
- Sensíveis: estrutura familiar resumida, risco de privacidade/gravação.
- Sistema proprietário: Brief/Desk (não é campo obrigatório do CRM estruturado — ver Dicionário v1.1 §9).
- Gatilho de criação: preparação da call (parte) + registro pós-call (parte).
- Responsável: responsável nominal da oportunidade.
- Atualização: antes da call (preparação) e imediatamente após (registro).
- Encerramento: quando a decisão pós-call é tomada e refletida na Oportunidade.
- Relações: deriva de Discovery; alimenta Diagnóstico e, se autorizado, abertura de Caso.
- App? Não. One-page? Não diretamente (pode subsidiar uma devolutiva aprovada). Consentimento? Sim, herdado da Discovery. Revisão humana? Recomendado antes de qualquer decisão de pesquisa.

**9. Diagnóstico**
- Finalidade: síntese comercial/técnica preliminar que fundamenta a Proposta.
- ID principal: ID vinculado à Oportunidade.
- Campos mínimos: sinal de aderência preliminar, via jurídica preliminar, complexidade documental, produtos/serviços recomendados.
- Internos/restritos: confiança da triagem, estado documental inicial.
- Sensíveis: marco jurídico de referência (contexto, não conclusão — ver §I).
- Sistema proprietário: CRM Mestre.
- Gatilho de criação: após Discovery realizada e Brief registrado.
- Responsável: responsável nominal + Pesquisa (apoio técnico).
- Atualização: quando nova informação relevante muda o sinal de aderência ou a via.
- Encerramento: quando a Proposta é enviada ou a Oportunidade é encerrada sem proposta.
- Relações: deriva de Discovery/Brief; fundamenta Proposta.
- App? Não — nunca projetar sinal de aderência ou via jurídica preliminar ao cliente. One-page? Não. Consentimento? Não diretamente. Revisão humana? Sim, quando envolve marco jurídico (ver §I).

**10. Proposta**
- Finalidade: oferta comercial formal ao lead/cliente.
- ID principal: ID da proposta (vinculado à Oportunidade).
- Campos mínimos: SKU recomendado (referência à Planilha Mestre), link da proposta, data de envio, eixo Comercial = "Proposta enviada".
- Internos/restritos: histórico de versões da proposta.
- Sensíveis: valor comercial (antes de aceite).
- Sistema proprietário: ambiente documental autorizado (não é a Planilha Mestre nem o CRM que armazena o documento — o CRM só referencia).
- Gatilho de criação: Diagnóstico concluído + decisão de avançar.
- Responsável: Closer/responsável nominal.
- Atualização: reenvio, ajuste de escopo, negociação.
- Encerramento: aceite (→ Contrato) ou perda (→ Motivo de perda).
- Relações: referencia Produto/SKU; gera Contrato quando aceita.
- App? Não (nunca preço provisório ou proposta em elaboração). One-page? Não. Consentimento? Não diretamente. Revisão humana? Não, salvo condição comercial excepcional.

### C.3 Cluster — Formalização e financeiro

**11. Contrato**
- Finalidade: instrumento de formalização da relação comercial.
- ID principal: ID do contrato (vinculado à Proposta aceita).
- Campos mínimos: link do contrato, data de envio, data de assinatura, eixo Formalização/Operação correspondente.
- Internos/restritos: cláusulas específicas (ficam no documento, não no CRM).
- Sensíveis: dados cadastrais das partes.
- Sistema proprietário: ambiente documental autorizado; CRM apenas referencia.
- Gatilho de criação: aceite da Proposta.
- Responsável: Comercial/Jurídico-parceiro conforme o caso.
- Atualização: envio → assinatura.
- Encerramento: assinatura confirmada (segue para Pagamento) ou desistência.
- Relações: deriva de Proposta; condiciona Pagamento e Cliente.
- App? Só o status simplificado ("contrato assinado"), nunca o documento. One-page? Não. Consentimento? Não diretamente. Revisão humana? Conforme política jurídica vigente (fora do escopo deste documento definir).

**12. Pagamento**
- Finalidade: registrar o evento financeiro de forma referenciada (fonte real é a Asaas).
- ID principal: referência ao evento transacional na Asaas.
- Campos mínimos: status referenciado (ex.: pendente, confirmado), data de conciliação.
- Internos/restritos: nenhum campo além da referência — o CRM não duplica dado transacional.
- Sensíveis: valor e dado de cobrança (ficam na Asaas).
- Sistema proprietário: **Asaas** (fonte única); CRM só espelha status.
- Gatilho de criação: Contrato assinado + cobrança emitida.
- Responsável: Financeiro.
- Atualização: a cada evento transacional na Asaas (o CRM lê, não escreve).
- Encerramento: conciliação total do pagamento inicial (ou do plano) confirmada.
- Relações: condiciona Cliente ativo e Onboarding.
- App? Sim, um status simplificado (ex.: "pagamento confirmado"), nunca valor, saldo ou margem. One-page? Não. Consentimento? Não. Revisão humana? Não (é evento factual da fonte transacional).

**13. Despesa de terceiro**
- Finalidade: rastrear despesas pagas a terceiros (cartórios, tradutores, etc.) sem que o Clube antecipe ou reembolse.
- ID principal: ID vinculado à Proposta/Caso.
- Campos mínimos: despesa vinculada à proposta (Sim/Não), aprovação do cliente registrada, responsável pagador.
- Internos/restritos: faixa de despesas externas estimada.
- Sensíveis: comprovante de pagamento (fica no dossiê operacional, nunca no Painel de Calls).
- Sistema proprietário: CRM (vínculo/aprovação) + Dossiê operacional (comprovante).
- Gatilho de criação: identificação de uma despesa de terceiro necessária ao caso.
- Responsável: Operações/Financeiro.
- Atualização: conforme aprovação e pagamento avançam.
- Encerramento: despesa paga e comprovante arquivado no dossiê.
- Relações: vincula-se a Proposta e a Caso.
- App? Não. One-page? Não. Consentimento? Não diretamente. Revisão humana? Não, mas exige aprovação registrada do cliente.

**14. Produto/SKU**
- Finalidade: referência de catálogo — a fonte real é a Planilha Mestre.
- ID principal: SKU.
- Campos mínimos (referenciados, não duplicados): status do produto, escopo, preço homologado, condição, link de cobrança.
- Internos/restritos: histórico de versões de preço.
- Sensíveis: margem (nunca sai da Planilha Mestre).
- Sistema proprietário: **Planilha Mestre** (fonte única).
- Gatilho de criação: fora do escopo deste documento — nenhum SKU é criado pelo CRM Mestre.
- Responsável: responsável de catálogo (a definir).
- Atualização: só na Planilha Mestre; o CRM apenas relê a referência.
- Encerramento: SKU inativado na Planilha Mestre.
- Relações: referenciado por Proposta.
- App? Nunca o SKU técnico ou preço provisório — apenas nome comercial do serviço contratado, quando aprovado. One-page? Não. Consentimento? Não. Revisão humana? Não.

### C.4 Cluster — Cliente e operação

**15. Cliente**
- Finalidade: representar o requerente/núcleo após formalização confirmada.
- ID principal: ID do cliente (herda do Requerente individual/Lead convertido).
- Campos mínimos: data de ativação, eixo Formalização/Operação = "Cliente ativo".
- Internos/restritos: histórico comercial que originou a conversão.
- Sensíveis: todos os dados pessoais herdados de Contato.
- Sistema proprietário: CRM Mestre.
- Gatilho de criação: Pagamento inicial confirmado.
- Responsável: Operações (transição do Comercial).
- Atualização: conforme avanço de Onboarding/Caso.
- Encerramento: quando todos os Casos do cliente são arquivados.
- Relações: origina Onboarding, Caso; herda de Requerente individual.
- App? Sim, dados básicos de identificação e progresso simplificado. One-page? Sim, quando destinada a ele. Consentimento? Sim, para uso de qualquer conteúdo além do atendimento direto. Revisão humana? Não no cadastro; sim no conteúdo entregue.

**16. Onboarding**
- Finalidade: sequência inicial de ativação do cliente antes da abertura formal do Caso.
- ID principal: vinculado ao Cliente.
- Campos mínimos: checklist de onboarding, data de início, data de conclusão.
- Internos/restritos: pendências de documentação inicial.
- Sensíveis: nenhuma além das já herdadas do Cliente.
- Sistema proprietário: CRM Mestre (checklist) + Desk (execução detalhada).
- Gatilho de criação: Cliente ativado.
- Responsável: Operações.
- Atualização: a cada etapa do checklist concluída.
- Encerramento: condição operacional definida para abrir o Caso (ver §K, decisão pendente).
- Relações: antecede Caso.
- App? Sim, progresso simplificado do onboarding. One-page? Não necessariamente. Consentimento? Herdado do Cliente. Revisão humana? Não.

**17. Caso**
- Finalidade: unidade de trabalho operacional no Desk — pesquisa, evidência, documento, pendência.
- ID principal: ID do caso.
- Campos mínimos: status (Não criado; Em preparação; Ativo; Arquivado), responsável do caso, país/linha.
- Internos/restritos: todo o conteúdo de pesquisa, fonte e evidência.
- Sensíveis: documento civil, relato familiar, hipótese jurídica.
- Sistema proprietário: **Desk Intelligence** (fonte canônica de caso, pesquisa, evidência).
- Gatilho de criação: Onboarding concluído + condição operacional atendida.
- Responsável: responsável do caso (Pesquisa/Operações).
- Atualização: conforme rotina do Desk (ex.: checklist semanal, radar interno).
- Encerramento: Arquivado, após conclusão ou interrupção definitiva.
- Relações: pertence a um Cliente; vincula-se a um Dossiê; gera Entrega.
- App? Não diretamente — apenas status sintetizado e próximo passo aprovados. One-page? Não diretamente. Consentimento? Sim, para pesquisa (ver Dicionário v1.1 §5). Revisão humana? Sim, em pontos de validação de evidência.

**18. Tarefa**
- Finalidade: ação pendente atribuída a um responsável, em qualquer etapa do ciclo.
- ID principal: ID de tarefa (vinculado à entidade de origem: Oportunidade, Caso, etc.).
- Campos mínimos: descrição, responsável, data prevista, status.
- Internos/restritos: nenhum campo especial além dos mínimos.
- Sensíveis: depende do conteúdo referenciado.
- Sistema proprietário: CRM Mestre (comercial) / Desk (operacional).
- Gatilho de criação: qualquer evento que exija ação humana futura (ex.: "confirmar call", "revisar documento").
- Responsável: quem for atribuído.
- Atualização: até conclusão ou cancelamento.
- Encerramento: conclusão registrada.
- Relações: associa-se a qualquer entidade do CRM Mestre ou do Caso.
- App? Não. One-page? Não. Consentimento? Não. Revisão humana? Não.

### C.5 Cluster — Evidência, dossiê e governança

**19. Dossiê**
- Finalidade: repositório organizado de documentos/evidências de um núcleo/família ou requerente individual.
- ID principal: ID do dossiê-mãe (compartilhado no núcleo) + vínculo do requerente.
- Campos mínimos: ambiente autorizado, link interno, nível de acesso, responsável pelo dossiê, status.
- Internos/restritos: lista de documentos, fontes e evidências vinculadas.
- Sensíveis: praticamente todo o conteúdo (documento civil, relato, imagem).
- Sistema proprietário: Desk / ambiente autorizado.
- Gatilho de criação: identificação de núcleo com potencial de caso.
- Responsável: responsável pelo dossiê.
- Atualização: conforme novo documento/evidência é recebido ou validado.
- Encerramento: Arquivado.
- Relações: um dossiê-mãe por núcleo; vincula-se a cada Requerente individual e ao Caso.
- App? Nunca o dossiê em si. One-page? Não. Consentimento? Sim, para uso de documento/imagem de terceiro. Revisão humana? Sim, para elevar nível de acesso.

**20. Evidência**
- Finalidade: registrar um dado de pesquisa com seu estado de validação.
- ID principal: ID de evidência (vinculado ao Caso/Dossiê).
- Campos mínimos: estado de evidência (`informação_compartilhada_família`; `dado_pesquisa_inicial`; `em_validação_documental`; `validado_por_documento`; `pendente_confirmação`; `não_aplicável`), nível de confiança (`alto`; `médio`; `baixo`; `inicial`).
- Internos/restritos: fonte de origem (ver Entidade Fonte), responsável pela validação.
- Sensíveis: conteúdo genealógico específico.
- Sistema proprietário: Desk (Bloco 5A).
- Gatilho de criação: qualquer dado de pesquisa recebido ou levantado.
- Responsável: Pesquisa.
- Atualização: elevação de estado exige responsável e revisão humana — nunca salto direto de `inicial` para `alto`.
- Encerramento: quando o dado é definitivamente confirmado ou descartado.
- Relações: associa-se a Fonte, Documento, Caso.
- App? Só o estado sintetizado e aprovado (nunca o dado bruto). One-page? Só síntese aprovada. Consentimento? Depende da origem do dado. Revisão humana? Sim, obrigatória para elevar nível de confiança.

**21. Fonte**
- Finalidade: registrar a origem de uma informação de pesquisa, classificada por categoria M1–M6.
- ID principal: ID de fonte.
- Campos mínimos: categoria (M1 Consulta humana guiada; M2 Link profundo/metadados públicos; M3-CANDIDATA API em validação; M3-APROVADA API autorizada; M4 Parceria/solicitação institucional; M5 Base interna curada; M6 Fonte exploratória colaborativa), status de aprovação.
- Internos/restritos: detalhes técnicos de acesso (M3/M4).
- Sensíveis: qualquer dado pessoal presente na fonte.
- Sistema proprietário: Desk (Bloco 5A).
- Gatilho de criação: nova origem de dado identificada.
- Responsável: Pesquisa.
- Atualização: mudança de status de aprovação (ex.: M3-CANDIDATA → M3-APROVADA, mediante autorização formal).
- Encerramento: fonte descontinuada ou revogada.
- Relações: alimenta Evidência.
- App? Nunca. One-page? Nunca. Consentimento? Depende da categoria (M4 exige autorização/contrato). Revisão humana? Sim, obrigatória para M3-APROVADA e M4.

**22. Documento**
- Finalidade: registrar um documento recebido ou localizado (certidão, passaporte, etc.).
- ID principal: ID de documento (vinculado ao Requerente/Caso).
- Campos mínimos: tipo de documento, status (recebido, pendente, em validação), origem.
- Internos/restritos: local de armazenamento (Dossiê).
- Sensíveis: documento civil é dado pessoal sensível por natureza.
- Sistema proprietário: Desk / Dossiê.
- Gatilho de criação: recebimento ou identificação do documento.
- Responsável: Pesquisa/Operações.
- Atualização: mudança de status de validação.
- Encerramento: documento validado e arquivado, ou descartado por não aplicabilidade.
- Relações: compõe Evidência; pertence ao Dossiê.
- App? Nunca o documento cru — apenas confirmação sintetizada ("documento recebido e em validação"). One-page? Não. Consentimento? Sim, para uso além da finalidade do caso (Termo de Direitos Autorais). Revisão humana? Sim, antes de qualquer elevação de status.

**23. Consentimento**
- Finalidade: registrar autorização (ou recusa) do titular para gravação, pesquisa, uso de imagem/relato ou publicação.
- ID principal: ID de consentimento vinculado ao Contato/Cliente.
- Campos mínimos: tipo (`uso_imagem`; `uso_relato`; `compartilhamento_dados`; `pesquisa_genealógica`; `publicação_narrativa`), status (`pendente`; `concedido`; `revogado`; `expirado`), data, canal, base legal (LGPD).
- Internos/restritos: versão do aviso aplicado.
- Sensíveis: é, por definição, um registro de dado pessoal sensível.
- Sistema proprietário: CRM Mestre (registro) + ambiente interno de gravação (arquivo, se aplicável).
- Gatilho de criação: antes de qualquer gravação, pesquisa aplicável ou uso de conteúdo além do atendimento direto.
- Responsável: quem conduz a interação.
- Atualização: mudança de status (concessão, revogação, expiração).
- Encerramento: revogação ou expiração.
- Relações: condiciona Interação (gravação), Evidência/Fonte (pesquisa), Entrega (publicação).
- App? Não o registro em si; a existência de consentimento é pré-condição silenciosa para qualquer conteúdo exibido. One-page? Idem. Consentimento? É a própria entidade. Revisão humana? Recomendável para revogações contestadas.

**24. Entrega**
- Finalidade: representar um conteúdo aprovado destinado ao cliente (App ou one-page).
- ID principal: ID de entrega (vinculado ao Caso/Cliente).
- Campos mínimos: `conteudo_aprovado` (true/false), data de aprovação, responsável pela aprovação, destino (App/one-page/PDF).
- Internos/restritos: versão de rascunho anterior à aprovação.
- Sensíveis: nenhuma no conteúdo final (é, por definição, sanitizado); o rascunho pode conter dado sensível até aprovação.
- Sistema proprietário: Studio de Devolutivas (geração) + Desk (fonte dos dados aprovados).
- Gatilho de criação: solicitação de devolutiva ou marco de progresso do caso.
- Responsável: responsável pela revisão humana da entrega.
- Atualização: até aprovação final.
- Encerramento: entrega publicada ou descartada.
- Relações: deriva de Caso/Evidência aprovada; alimenta App/one-page.
- App? Sim, é a única entidade que efetivamente alimenta o App. One-page? Sim, é a saída direta do Studio de Devolutivas. Consentimento? Sim, se envolver imagem/relato. Revisão humana? Sim, sempre — nenhuma entrega é automática.

**25. Log de auditoria**
- Finalidade: registrar mudanças relevantes de estado, aprovação ou acesso, para rastreabilidade.
- ID principal: ID de log (sequencial).
- Campos mínimos: entidade afetada, campo alterado, valor anterior, valor novo, responsável, data/hora.
- Internos/restritos: todo o conteúdo é interno por natureza.
- Sensíveis: pode conter referência a dado sensível alterado (não o dado em si, idealmente).
- Sistema proprietário: CRM Mestre + Desk (cada sistema audita suas próprias mudanças críticas).
- Gatilho de criação: mudança de estado, aprovação de conteúdo, elevação de evidência, alteração de consentimento.
- Responsável: sistema/processo que gera a mudança; auditável por Operações.
- Atualização: não se edita — é append-only.
- Encerramento: não se encerra.
- Relações: referencia qualquer entidade do CRM Mestre ou Desk.
- App? Nunca. One-page? Nunca. Consentimento? Não. Revisão humana? Não gera revisão, mas é insumo para auditoria futura.

---

## D. Tarefa 3 — Máquinas de estado

### D.1 Eixo Comercial

`Novo lead → Triagem → Discovery agendada → Discovery realizada → Diagnóstico em elaboração → Proposta enviada → Negociação → (Nutrição | Perdido | Encerrado sem aderência)`

| Transição | Evento/gatilho | Responsável nominal | Dados mínimos obrigatórios | Bloqueios | Fonte de verdade | Próxima entidade criável | Conteúdo permitido ao cliente | Conteúdo que fica interno |
|---|---|---|---|---|---|---|---|---|
| Novo lead → Triagem | Primeiro contato qualificado | SDR | Origem do lead, objetivo declarado | Nenhum campo de área responsável/responsável nominal vazio | Painel de Calls | Oportunidade | Confirmação de recebimento de contato | Origem detalhada, observações internas |
| Triagem → Discovery agendada | Agendamento de call | SDR/Closer | Data/hora da call, responsável | Consentimento de gravação não pode estar "Recusado" sem alternativa sem gravação definida | Painel de Calls | Discovery | Confirmação de agendamento | Roteiro-base, perguntas a evitar |
| Discovery agendada → Discovery realizada | Call realizada | Closer | Status da call = Realizada, resumo validado | SPIN não pode ser marcado Concluído sem registro correspondente | Painel de Calls / CRM | Brief de Discovery | Nenhum ainda | SPIN, resumo validado, sinal de aderência |
| Discovery realizada → Diagnóstico em elaboração | Brief registrado | Responsável nominal | Brief de Discovery preenchido | Autorização para pesquisa prévia deve estar definida antes de qualquer pesquisa nominal | Brief/CRM | Diagnóstico | Nenhum ainda | Hipóteses, lacunas, via jurídica preliminar |
| Diagnóstico em elaboração → Proposta enviada | Diagnóstico concluído + decisão de avançar | Responsável nominal | SKU recomendado válido, produtos/serviços recomendados | SKU deve estar ativo na Planilha Mestre | Diagnóstico/CRM | Proposta | Proposta formal (documento aprovado) | Sinal de aderência, confiança da triagem |
| Proposta enviada → Negociação | Contato de retorno/ajuste | Closer | Objeção registrada | Nenhum | CRM | — | Ajustes de proposta comunicados formalmente | Estratégia de negociação interna |
| Negociação → Nutrição | Decisão de adiar sem perder o lead | Closer/Responsável | Motivo/observação | Nenhum | CRM | Tarefa (follow-up) | Comunicação de acompanhamento | — |
| Negociação → Perdido | Recusa definitiva | Closer/Responsável | Motivo de perda | Nenhum | CRM | — | Encerramento cordial | Motivo de perda detalhado |
| Qualquer etapa → Encerrado sem aderência | Sinal de aderência = "Sem aderência atual" confirmado | Responsável nominal | Justificativa registrada | Não pode ser feito sem Diagnóstico mínimo registrado | CRM | — | Comunicação apropriada, sem linguagem jurídica conclusiva | Toda a triagem técnica |

### D.2 Eixo Formalização/Operação

`Não iniciado → Contrato enviado → Contrato assinado → Pagamento inicial confirmado → Cliente ativo → Onboarding iniciado → Caso ativo → Arquivado`

| Transição | Evento/gatilho | Responsável nominal | Dados mínimos obrigatórios | Bloqueios | Fonte de verdade | Próxima entidade criável | Conteúdo permitido ao cliente | Conteúdo que fica interno |
|---|---|---|---|---|---|---|---|---|
| Não iniciado → Contrato enviado | Proposta aceita | Closer/Jurídico-parceiro | Link da proposta aceita | Proposta deve estar em eixo Comercial = "Proposta enviada" ou "Negociação" | CRM | Contrato | Envio formal do contrato | — |
| Contrato enviado → Contrato assinado | Assinatura confirmada | Jurídico-parceiro/Operações | Link do contrato assinado | Nenhum campo de contrato vazio | Ambiente documental | Pagamento (cobrança) | Confirmação de contrato assinado | Cláusulas específicas |
| Contrato assinado → Pagamento inicial confirmado | Conciliação na Asaas | Financeiro | Referência ao evento transacional | CRM não pode registrar como confirmado sem espelhar a Asaas | **Asaas** | Cliente | Confirmação de pagamento recebido | Valor, forma de pagamento detalhada |
| Pagamento inicial confirmado → Cliente ativo | Ativação formal | Operações | Data de ativação | Nenhum | CRM | Onboarding | Boas-vindas / início de jornada | — |
| Cliente ativo → Onboarding iniciado | Início do checklist | Operações | Checklist criado | Nenhum | CRM/Desk | Tarefa | Progresso do onboarding | Pendências internas detalhadas |
| Onboarding iniciado → Caso ativo | Condição operacional atendida (**decisão humana pendente — ver §K**) | Pesquisa/Operações | Dossiê-mãe vinculado, responsável do caso definido | Onboarding não pode estar incompleto (critério exato: decisão humana) | Desk | Evidência, Documento, Fonte | Status "caso iniciado" | Todo o conteúdo de pesquisa |
| Caso ativo → Arquivado | Conclusão ou interrupção definitiva | Responsável do caso | Motivo de arquivamento | Nenhum | Desk | — | Comunicação de encerramento, se aplicável | Histórico completo do caso |

### D.3 Derivação do Resultado Comercial

O campo **Resultado comercial** é sempre **derivado**, nunca definido diretamente por um usuário — ele lê a combinação dos dois eixos:

| Resultado comercial | Condição de derivação (eixo Comercial + eixo Formalização/Operação) |
|---|---|
| Em aberto | Comercial em qualquer etapa antes de "Proposta enviada"; Formalização = "Não iniciado" |
| Em negociação | Comercial = "Proposta enviada" ou "Negociação"; Formalização = "Não iniciado" ou "Contrato enviado" |
| Convertido | Comercial concluído comercialmente **e** Formalização atinge a condição definida pela operação (ver decisão humana pendente abaixo) |
| Nutrição | Comercial = "Nutrição" |
| Perdido — preço / elegibilidade / documentos / timing / sem retorno / concorrente | Comercial = "Perdido", desdobrado pelo Motivo de perda registrado |

**Regra:** "Convertido" exige a condição comercial/formal definida pela operação; não substitui os eventos separados de Contrato, Pagamento, Onboarding e Caso ativo.

**Decisão humana pendente:** qual estado exato do eixo Formalização/Operação (Pagamento inicial confirmado? Cliente ativo? Onboarding iniciado?) marca oficialmente a derivação para "Convertido". Este documento não assume essa definição.

---

## E. Tarefa 4 — Roteiro Mestre de Discovery v2

Generalizado a partir da estrutura de roteiros existentes (incluindo o caso Ana Luiza), sem copiar nome, e-mail, documento, história familiar, link, dado de descendente, valor, conclusão jurídica, promessa, prazo ou especificidade de nenhum país/caso.

1. **Identificação e contexto da call** — ID da oportunidade, responsável, data/hora, canal.
2. **Aviso e registro de consentimento de gravação** — ler aviso vigente; registrar Consentimento antes de qualquer gravação.
3. **Abertura consultiva** — enquadramento do propósito da call, sem promessa de resultado.
4. **Confirmação do que a pessoa já informou** — evitar repetir perguntas já respondidas no Painel/Brief.
5. **Estrutura familiar mínima** — nível suficiente para identificar núcleo, sem aprofundar prova documental nesta etapa.
6. **Objetivo principal** — o que a pessoa busca (cidadania, pesquisa, memória familiar, etc.).
7. **SPIN:**
   - **Situação** — contexto atual da pessoa e da linha de investigação.
   - **Problema** — dor ou lacuna concreta (documento faltante, prazo percebido, insegurança sobre elegibilidade).
   - **Implicação** — consequência de não avançar (tempo, custo, oportunidade).
   - **Necessidade/valor** — benefício verbalizado pela própria pessoa.
8. **Nacionalidade/linha prioritária** — a partir da lista controlada do Dicionário v1.1.
9. **Estado documental inicial** — nível de documentação já disponível.
10. **Lacunas prioritárias** — o que falta para avançar a triagem.
11. **Triagem comercial/técnica preliminar** — aplicar **sinal de aderência preliminar** (nunca "elegibilidade confirmada").
12. **Perguntas de aprofundamento** — apenas as necessárias para reduzir a maior lacuna identificada.
13. **Objeções e contexto de decisão** — preço, prazo, decisor familiar, confiança, comparação com concorrente.
14. **Próxima ação** — sempre datada, sempre com responsável nominal.
15. **Registro pós-call** — resumo validado (sem transcrição bruta), atualização de SPIN, sinal de aderência.
16. **Handoff para CRM, dossiê e Desk** — o que segue estruturado para o CRM, o que vira Brief, e o que pode abrir um Caso (somente com autorização aplicável de pesquisa prévia).

**Regra fixa:** este roteiro nunca usa "elegibilidade confirmada", "direito adquirido", "cidadania reconhecida", "rota jurídica definida" ou linguagem de prazo. Usa sempre "sinal de aderência preliminar".

---

## F. Tarefa 5 — Template do Brief de Discovery

| Campo | Origem |
|---|---|
| ID da oportunidade | **Entra automaticamente** do Painel/CRM |
| Nome do lead | **Entra automaticamente** do Painel/CRM |
| Data/hora da call | **Entra automaticamente** do Painel |
| Responsável nominal | **Entra automaticamente** do CRM |
| Roteiro-base utilizado | **Preenchimento manual** antes da call (qual variação do Roteiro Mestre v2 será usada) |
| Origem do lead | **Entra automaticamente** do CRM |
| País/linha prioritária | **Entra automaticamente** do CRM (se já qualificado) ou **preenchimento manual** se ainda não definido |
| Objetivo declarado | **Entra automaticamente** se já capturado; **preenchimento manual** para complementar |
| Dados recebidos antes da call | **Preenchimento manual** — checklist do que já chegou |
| Materiais e documentos mencionados | **Preenchimento manual** antes da call; **retorna ao CRM** como referência (não o arquivo) |
| Materiais ainda não localizados | **Preenchimento manual**; **vai ao dossiê** como pendência |
| Estrutura familiar resumida | **Preenchimento manual/pós-call**; **vai ao dossiê**, nunca ao CRM estruturado em detalhe |
| Hipóteses e lacunas | **Pós-call**; **vai ao dossiê/Desk** |
| Perguntas prioritárias | **Preenchimento manual** antes da call |
| Perguntas que não devem ser repetidas | **Preenchimento manual** antes da call, a partir do histórico |
| Objeções prováveis | **Preenchimento manual** antes da call (hipótese) e **atualizado pós-call** (real) |
| Risco de privacidade/gravação | **Preenchimento manual**; condiciona o Consentimento |
| Autorização para pesquisa prévia | **Retorna ao CRM** como campo estruturado (lista controlada do Dicionário v1.1) |
| Decisão esperada após a call | **Preenchimento manual** antes da call |
| Próximos passos previstos | **Pós-call**; **retorna ao CRM** como Próxima ação datada |

**Regra:** narrativa detalhada, transcrição bruta, documentos, fontes, hipóteses de pesquisa e análise longa ficam no Brief/dossiê/Desk — nunca no CRM estruturado. O CRM só recebe os campos que são, por natureza, controlados (datas, responsáveis, status, listas).

---

## G. Tarefa 6 — Matriz de handoff

`Painel de Calls → Brief de Discovery → CRM Mestre → Dossiê-mãe → Desk Intelligence → App Cliente / One-page`

| Etapa | Dado recebido | Dado criado | Dado atualizado | Responsável | Condição de aprovação | Visibilidade | Bloqueio | Próximo destino |
|---|---|---|---|---|---|---|---|---|
| Painel de Calls → Brief | Identificação, SPIN, resultado da call | Registro de Discovery | Status da call | SDR/Closer | Call realizada e resumo validado | Interna: Comercial | SPIN "Concluído" sem evidência correspondente | Brief de Discovery |
| Brief → CRM Mestre | Campos estruturados (país, objetivo, autorização de pesquisa, próxima ação) | Diagnóstico | Oportunidade (eixo Comercial) | Responsável nominal | Brief revisado | Interna: Comercial/Pesquisa | Autorização de pesquisa ausente bloqueia pesquisa nominal externa | CRM Mestre |
| CRM Mestre → Dossiê-mãe | Vínculo de núcleo/família, referência de caso | Dossiê-mãe (se ainda não existir) | Status do dossiê | Responsável pelo dossiê | Onboarding concluído / condição operacional atendida | Restrito / Equipe do caso | Sem Onboarding concluído, dossiê não vira Caso ativo | Desk Intelligence |
| Dossiê-mãe → Desk Intelligence | Documentos, evidências, fontes recebidas | Evidência, Fonte, Documento | Estado de evidência, nível de confiança | Pesquisa | Revisão humana em cada elevação de estado | Restrita: equipe autorizada | Elevação de `inicial` direto para `alto` é proibida | App/one-page (após aprovação) |
| Desk Intelligence → App Cliente / One-page | Síntese aprovada, estado sintetizado, próximo passo | Entrega | `conteudo_aprovado = true` | Responsável pela aprovação | Revisão humana obrigatória, sempre | Cliente autorizado | Nenhum dado bruto passa sem essa aprovação | Cliente final |

**Exemplos obrigatórios de bloqueio:**

- **Transcrição bruta:** fica em ambiente restrito; nunca chega a App/one-page, em nenhuma etapa da matriz.
- **Documento recebido:** vai para Dossiê/Desk; nunca é anexado como arquivo no Painel de Calls, nunca aparece cru no App.
- **SKU/preço/link:** vivem na Planilha Mestre/Asaas; o CRM apenas referencia; nunca há digitação livre desses dados no Painel.
- **Evidência e fonte:** vivem no Desk; nunca servem como prova no CRM e nunca aparecem como fonte crua no App.
- **Conteúdo cliente-facing:** só existe após `conteudo_aprovado = true` na Entrega correspondente.

---

## G.1 Nota de apoio — Tarefa 7: produto, proposta e financeiro

```
Produtos/serviços recomendados (Diagnóstico)
        │
        ▼
SKU recomendado ──────► referencia ──────► Planilha Mestre (status, preço, condição, link)
        │
        ▼
Proposta (link da proposta)
        │  aceite
        ▼
Contrato
        │
        ├──► Despesas de terceiros (vínculo com proposta + aprovação do cliente + responsável pagador)
        │
        ▼
Status de pagamento ──────► referencia ──────► Asaas (fonte transacional)
        │  conciliado
        ▼
Cliente ativo → Onboarding → abertura de Caso no Desk (mediante condição operacional definida)
```

**Regras obrigatórias:**

1. Nenhum SKU é criado automaticamente — toda criação de SKU é decisão humana na Planilha Mestre, fora deste fluxo.
2. Nenhum preço é digitado livremente no Painel — o Painel/CRM apenas seleciona um SKU já ativo.
3. Nenhuma despesa de terceiro é tratada como desembolso, caixa ou reembolso do Clube — regra fixa herdada do Dicionário v1.1.
4. Despesas de terceiros exigem: Despesa vinculada à proposta (Sim/Não); Aprovação do cliente registrada (Sim/Não/Pendente/Não aplicável); Responsável pagador (Cliente/Família-núcleo/Outro autorizado).
5. O CRM referencia o status financeiro; a Asaas é a única fonte transacional — o CRM não confirma pagamento por conta própria.
6. O Caso no Desk só é aberto mediante condição operacional definida (**decisão humana pendente** — ver §K).
7. Nenhum App ou one-page mostra SKU técnico, preço provisório, saldo, margem ou link interno — apenas o nome comercial do serviço contratado e o status simplificado do pagamento, quando aprovado.

---

## H. Tarefa 8 — Matriz de privacidade, consentimento e visibilidade (entregável H)

| Tipo de dado | Painel de Calls | Brief | CRM | Dossiê | Desk | App | One-page | Exige consentimento? | Responsável pela aprovação |
|---|---|---|---|---|---|---|---|---|---|
| Dados de contato | Sim | Sim (referência) | Sim | Não | Não | Parcial (nome) | Não | Sim, para uso além do atendimento | Responsável nominal |
| Dados familiares | Não | Sim (resumido) | Não (só referência de núcleo) | Sim | Sim | Não | Não | Sim | Responsável do caso |
| Relato familiar | Não | Sim (hipótese) | Não | Sim | Sim | Não (só síntese aprovada) | Só síntese aprovada | Sim | Responsável do caso |
| Árvore familiar | Não | Não | Não | Sim | Sim | Não | Não | Sim | Responsável do caso |
| Documento civil | Não | Referência apenas | Não | Sim | Sim | Não | Não | Sim | Responsável pelo dossiê |
| Documento enviado pela pessoa | Não | Referência apenas | Não | Sim | Sim | Não (cru) / confirmação sintetizada sim | Não | Sim | Responsável pelo dossiê |
| Gravação | Não (só link condicionado) | Não | Registro de consentimento apenas | Não | Ambiente interno restrito | Nunca | Nunca | Sim, obrigatório | Quem conduz a call |
| Transcrição | Não | Não | Não | Não | Ambiente interno restrito | Nunca | Nunca | Sim, herdado da gravação | Responsável pela gravação |
| Fonte externa | Não | Não | Não | Sim (referência) | Sim | Nunca | Nunca | Depende da categoria M1–M6 | Pesquisa |
| Evidência | Não | Não | Não | Sim | Sim | Só estado sintetizado aprovado | Só estado sintetizado aprovado | Depende da origem | Responsável do caso |
| Hipótese jurídica | Não | Sim (interno) | Sim (interno) | Sim | Sim | Nunca | Nunca | Não diretamente | Responsável nominal + revisão jurídica quando aplicável |
| Marco jurídico | Sim (referência) | Não | Sim | Não | Sim | Não sem aprovação humana e linguagem apropriada | Não sem aprovação humana | Não | Ver §I |
| Proposta | Não | Não | Sim (referência) | Não | Não | Não (documento aprovado sim, dado técnico não) | Não | Não | Closer/Responsável nominal |
| Contrato | Não | Não | Sim (referência) | Não | Não | Status simplificado | Não | Não | Jurídico-parceiro |
| Pagamento | Não | Não | Sim (referência) | Não | Não | Status simplificado | Não | Não | Financeiro |
| Preço | Não (nunca digitado livre) | Não | Sim (referência) | Não | Não | Nunca | Nunca | Não | Responsável de catálogo |
| SKU | Não (nunca digitado livre) | Não | Sim (referência) | Não | Não | Nunca (técnico) | Nunca | Não | Responsável de catálogo |
| Entrega aprovada | Não | Não | Não | Sim (origem) | Sim (origem) | Sim | Sim | Depende do conteúdo | Responsável pela aprovação |
| Conteúdo narrativo | Não | Sim (rascunho) | Não | Sim | Sim | Só aprovado | Só aprovado | Sim | Responsável pela aprovação |
| Foto familiar | Não | Não | Não | Sim | Sim | Só com autorização e aprovação | Só com autorização e aprovação | Sim (`uso_imagem`) | Responsável pela aprovação |
| Imagem de terceiros | Não | Não | Não | Sim (restrito) | Sim (restrito) | Nunca sem autorização específica | Nunca sem autorização específica | Sim, obrigatório | Responsável pela aprovação + revisão jurídica quando aplicável |

**Regras obrigatórias:**

- Dossiê de cliente nunca usa o nível de acesso "Público histórico".
- "Cliente autorizado" significa acesso apenas à área cliente segregada, com conteúdo aprovado.
- Cliente autorizado nunca acessa documento cru, fonte, URL interna, transcrição, gravação, CRM, Desk, dado de terceiro, SKU técnico, preço provisório ou hipótese jurídica.
- "Público histórico" só pode existir para biblioteca histórica sanitizada, independente de qualquer dossiê de caso (ver §H.1).

### H.1 Biblioteca histórica sanitizada vs. dossiê de cliente

Para evitar ambiguidade entre o nível "Público histórico" citado no Dicionário v1.1 (§6) e a regra de segurança deste documento:

- **Biblioteca histórica sanitizada** = conteúdo genérico, sem dado pessoal identificável de um caso específico (ex.: contexto histórico de leis, contexto migratório geral). Pode ter nível "Público histórico".
- **Dossiê de caso/cliente** = sempre Restrito, Equipe do caso, ou Cliente autorizado. Nunca "Público histórico", mesmo que o caso envolva um evento historicamente documentado.

---

## I. Tarefa 9 — Marcos jurídicos (entregável I inclui o modelo de matriz por país em §I.1)

**Campos e uso correto (herdados do Dicionário v1.1 §3, mantidos sem alteração):**

- **Marco jurídico de referência** — contexto interno, não confirma direito individual.
- **Fonte oficial do marco** — URL/documento que embasa o marco.
- **Última verificação do marco** — data.
- **Revisão humana/jurídica necessária?** — neste documento, ajustado para: **Obrigatória; Dispensa homologada; A definir** (ver §0.4).
- **Status de atualização** — Atualizado; A revisar; Desatualizado; Não aplicável.

**Regras:**

- O marco é contexto interno; não confirma direito, resultado, prazo ou via individual.
- Não define automaticamente a via jurídica preliminar de um requerente.
- Não aparece em App/one-page sem aprovação humana e linguagem apropriada.
- Marco "Desatualizado" ou "A revisar" bloqueia qualquer comunicação externa que o trate como vigente.
- "Dispensa homologada" só pode ser aplicada por regra pré-aprovada por país/via/marco, ou por decisão de responsável autorizado, com data e justificativa — nunca por omissão.

### I.1 Modelo de matriz de marcos jurídicos por país (entregável I — estrutura vazia, sem preencher/validar leis)

| País/via | Marco jurídico de referência | Fonte oficial | Última verificação | Revisão humana/jurídica | Status de atualização | Observação |
|---|---|---|---|---|---|---|
| [País A] | [a definir] | [a definir] | [a definir] | Obrigatória / Dispensa homologada / A definir | Atualizado / A revisar / Desatualizado / Não aplicável | — |
| [País B] | [a definir] | [a definir] | [a definir] | — | — | — |
| ... | | | | | | |

Este modelo não deve ser preenchido nesta rodada — é apenas a estrutura a ser homologada com apoio jurídico.

---

## J. Tarefa 10 — Matriz de migração conceitual (entregável J, sem migrar dados)

| Categoria de classificação | Critério | Exemplo típico no CRM legado/CA OPS/Painel/documentos históricos |
|---|---|---|
| Migrar como dado estruturado | Dado ativo, validado, sem duplicidade, mapeável 1:1 a uma entidade do CRM Mestre | Cliente ativo com caso em andamento e dados íntegros |
| Manter como histórico | Dado relevante para consulta, mas não deve virar registro ativo | Lead antigo não convertido, com contexto útil para eventual retorno |
| Revalidar antes de migrar | Dado plausível, mas com inconsistência a resolver | Contato com nome/telefone divergente entre sistemas |
| Arquivar | Caso encerrado sem necessidade de reabertura | Caso "Arquivado" sem pendência |
| Não migrar | Dado sem utilidade operacional ou fora do escopo do novo CRM | Campo mockado, indicador não utilizado |
| Duplicidade | Mesmo lead/caso representado mais de uma vez | Lead cadastrado duas vezes em sistemas diferentes |
| Dado fictício/teste | Registro de teste do protótipo, sem correspondência real | Dados de exemplo usados na auditoria do Desk |
| Dado sensível/restrito | Requer tratamento especial antes de qualquer decisão de migração | Documento civil, gravação, transcrição |
| Fora de escopo | Não pertence ao domínio do CRM Mestre | Indicadores de outro produto/serviço não relacionado ao Clube Ancestral |

**Nota:** a Auditoria Desk Intelligence/Backoffice já identificou dados de teste, módulos mockados e ausência de integração real no CA OPS/Desk atual — qualquer decisão de migração deve passar primeiro por essa triagem, não pela cópia direta.

---

## K. Checklist de piloto privado (Tarefa 11, entregável K)

| Etapa | Pronto para operação manual | Depende de decisão humana | Depende de implementação futura | Bloqueado por privacidade/consentimento | Bloqueado por revisão jurídica | Fora de escopo |
|---|---|---|---|---|---|---|
| Cadastrar lead | Sim, com os campos do Dicionário v1.1 §3.1 | — | — | — | — | — |
| Realizar Discovery | Sim, usando o Roteiro Mestre v2 (§E) | — | — | Consentimento de gravação deve ser obtido antes | — | — |
| Enviar proposta | Sim, se SKU já existir na Planilha Mestre | — | — | — | — | Criação de novo SKU |
| Registrar contrato | Sim, como referência/link | — | — | — | Conforme política jurídica vigente para cada contrato | — |
| Registrar pagamento | Sim, como referência à Asaas | — | Integração automática CRM↔Asaas | — | — | — |
| Ativar cliente | Sim, manualmente, após pagamento confirmado | Qual evento exato dispara "Convertido" (§D.3) | — | — | — | — |
| Iniciar onboarding | Sim, com checklist manual | — | Checklist automatizado | — | — | — |
| Abrir caso no Desk | — | Condição operacional exata de abertura (§K) | — | — | — | — |
| Criar dossiê | Sim, manualmente, com nível de acesso definido | — | — | Autorização para pesquisa prévia deve estar Registrada | — | — |
| Aprovar entrega | Sim, com revisão humana obrigatória | — | — | — | — | — |
| Liberar campo ao App | — | Qual campo específico é "aprovado por padrão" vs. caso a caso | Área cliente segregada real | Cliente autorizado só recebe conteúdo aprovado | — | — |
| Liberar one-page | Sim, via Studio de Devolutivas, com revisão humana | — | — | Consentimento de uso de relato/imagem, se aplicável | — | — |
| Arquivar caso | Sim, manualmente | Critério de arquivamento padrão | — | — | — | — |

---

## L. Lista de decisões humanas pendentes (entregável L)

1. Qual estado exato do eixo Formalização/Operação marca a derivação oficial de "Convertido" no Resultado comercial (§D.3).
2. Qual é a condição operacional exata que autoriza passar de "Onboarding iniciado" para "Caso ativo" no Desk (§D.2, §G.1).
3. Quem é o responsável de catálogo da Planilha Mestre (papel ainda não nomeado nas fontes revisadas).
4. Qual critério define "Onboarding completo" antes da abertura do Caso.
5. Quais campos de Entrega são elegíveis para aprovação "padrão" versus exigirem revisão caso a caso.
6. Critério padrão de arquivamento de Caso (tempo, marco, decisão do cliente).
7. Regras específicas de "Dispensa homologada" para revisão jurídica, por país/via/marco (quem aprova e com que periodicidade).
8. Preenchimento e validação da matriz de marcos jurídicos por país (§I.1) com apoio jurídico.
9. Definição do texto/documento que registra cada escopo de "Autorização para pesquisa prévia".
10. Política de retenção, arquivamento e acesso de gravações/transcrições.
11. Confirmação de quais listas terão dependência por país, via jurídica ou etapa antes de qualquer implementação futura.
12. Validação do vocabulário de objeção, motivo de perda e próxima ação com Comercial, Pesquisa, Operações e Financeiro.
13. Definição de quem pode aprovar a elevação de Fonte de M3-CANDIDATA para M3-APROVADA e de M4 (parceria institucional).

---

## M. Backlog (entregável M)

**Operação manual agora**
- Cadastro de Lead, Discovery com Roteiro Mestre v2, Brief de Discovery, Diagnóstico, Proposta referenciando SKU existente, registro manual de Contrato/Pagamento como referência, ativação manual de Cliente, checklist manual de Onboarding, criação manual de Dossiê, aprovação manual de Entrega, liberação manual de one-page via Studio de Devolutivas.

**Implementação futura**
- Integração CRM ↔ Asaas para status de pagamento automático.
- Checklist de onboarding automatizado.
- Área cliente segregada real no App, com controle de acesso automatizado por Entrega aprovada.
- Automação de log de auditoria.

**Decisão humana**
- Os 13 itens listados em "Lista de decisões humanas pendentes" acima.

**Bloqueado**
- Qualquer pesquisa nominal externa, pedido institucional ou contato com órgão sem Autorização para pesquisa prévia = Registrada.
- Qualquer publicação de conteúdo sem `conteudo_aprovado = true`.
- Qualquer gravação sem Consentimento = Concedido.
- Elevação de Fonte M3-APROVADA/M4 sem autorização formal do provedor/parceiro.

**Fora de escopo**
- Criação de SKU, preço, contrato-modelo, banco de dados, automação, webhook, integração de API.
- Migração de dados reais.
- Pesquisa de fontes genealógicas específicas.
- Parecer jurídico individual.

---

## Verificação contra o critério de aceite

- O Painel de Calls permanece como entrada e handoff — nunca fonte de preço, contrato ou conclusão jurídica (§A, §B linha 1).
- Planilha Mestre, Asaas, Desk e App mantêm fontes de verdade separadas, cada uma com seu próprio campo "não pode registrar" (§B).
- Triagem comercial (sinal de aderência preliminar) está travada contra virar conclusão jurídica em toda entidade e transição relevante (§C — entidade Diagnóstico, §D, §E item 11, §I).
- Pesquisa externa está bloqueada sem Autorização para pesquisa prévia = Registrada, tanto na Oportunidade quanto na abertura de Caso (§G, §M backlog "Bloqueado").
- Gravação, transcrição, dossiê e documentos nunca aparecem em App ou one-page, com exemplos explícitos na Matriz de Handoff (§G) e na Matriz de Privacidade (§H).
- Nenhum sistema, automação ou alteração externa foi criada — este documento é só especificação (§0.2).
- O ciclo lead → discovery → proposta → formalização → pagamento conciliado → cliente → onboarding → caso → entrega aprovada está integralmente mapeado em §A, §D e §K, com os pontos que ainda dependem de decisão humana explicitados em §L em vez de assumidos.
