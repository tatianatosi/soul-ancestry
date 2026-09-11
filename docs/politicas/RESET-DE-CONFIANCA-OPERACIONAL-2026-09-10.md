# Clube Ancestral — Reset de Contexto Canônico
## Reconstrução Controlada a partir do Estado Verificável

```yaml
status: em revisão
data: 2026-09-10
responsável pela decisão: Proprietária do Clube Ancestral
fonte(s) de evidência:
  - decisão explícita da proprietária nesta conversa em 10/09/2026
  - arquivos e artefatos acumulados no projeto Clube Ancestral
  - repositório GitHub soul-ancestry, a ser auditado por qualquer executor
  - estado de Supabase, Vercel, Drive, Dropbox e Canva, a ser verificado por fonte
escopo: >
  Criar uma base única de contexto para qualquer pessoa ou agente que venha a ajudar
  o Clube Ancestral a sair do estado atual. O documento determina reset de confiança:
  nada é considerado pronto, existente, operacional, integrado ou seguro apenas porque
  foi dito, documentado, aparece em tela, está em PR, existe em mockup ou está no código.
premissas:
  - A proprietária não aceita mais arquiteturas abstratas, prompts em cascata,
    documentos sem efeito ou afirmações sem prova observável.
  - Todo ativo anterior é preservado como patrimônio histórico, mas perde presunção
    de validade operacional até verificação direta.
  - A reconstrução começa por um corte vertical mínimo de operação real e não por
    uma reescrita total de todos os módulos simultaneamente.
  - O objetivo é reduzir caos, custo e dependência de memória de chat.
limites:
  - Este documento não autoriza apagar dados, repositórios, arquivos, ambientes,
    contratos, propostas, migrations, tabelas, RLS, usuários, integrações ou backups.
  - Não cria fatos, contratos, pagamentos, casos, clientes, tarefas, eventos, mensagens,
    pesquisas externas ou ações em nome de terceiros.
  - Não autoriza merge, deploy, migration produtiva, exclusão ou mudança irreversível.
próximos passos:
  - Executar inventário de realidade mínimo e orientado a uso.
  - Eleger uma única trilha de reconstrução por vez.
  - Comprovar cada bloco por uso e releitura antes de declarar entregue.
critério de aceite: >
  Qualquer novo executor consegue identificar, sem depender da memória da proprietária,
  o que é fato verificado, o que é legado, o que é hipótese, o que está quebrado,
  qual é o próximo corte operacional e como demonstrar que ele funciona.
substitui:
  - Não apaga documentos anteriores.
  - Substitui a presunção de que documentos, prompts, mockups, PRs ou código equivalem
    a capacidade operacional pronta.
```

---

## 1. Declaração de reset

A partir deste documento, o Clube Ancestral entra em **reset de confiança operacional**.

Isso não significa destruir trabalho anterior. Significa retirar de todo trabalho anterior o selo implícito de “feito”, “pronto”, “integrado”, “funcionando” ou “decidido” até que exista prova direta.

Nenhum executor poderá usar frases como:

- “isso já existe”;
- “isso foi implementado”;
- “isso está no banco”;
- “isso está integrado”;
- “isso funciona”;
- “isso foi aprovado”;
- “isso é a fonte de verdade”;

sem registrar uma evidência concreta no formato deste documento.

### Fórmula de realidade

```text
Documento / prompt / mockup / commit / PR / tela
≠
capacidade operacional comprovada

Capacidade operacional comprovada
=
fonte identificada + leitura real + ação real + persistência/releitura
+ isolamento correto + resultado observável
```

---

## 2. O que foi preservado

Tudo o que foi construído, pensado, desenhado, escrito ou codificado deve ser preservado. Nada será apagado por cansaço, pressa ou suposição.

Porém, cada ativo deve ser reclassificado em uma destas categorias:

| Classificação | Significado | Pode ser usado como base operacional? |
|---|---|---|
| `COMPROVADO_EM_USO` | Foi lido, acionado, salvo/recarregado quando aplicável, e seu comportamento foi confirmado no ambiente correto. | Sim, dentro do escopo comprovado. |
| `CODIGO_SEM_PROVA_DE_USO` | Existe no repositório, mas não foi demonstrado em sessão real. | Não sozinho. Requer teste. |
| `TELA_SEM_FONTE_CONFIRMADA` | Interface existe, mas fonte, persistência ou segurança não foram comprovadas. | Não. |
| `DOCUMENTADO` | Existe em prompt, relatório, política ou especificação. | Apenas como intenção/requisito. |
| `MOCKUP_APROVADO` | Experiência, hierarquia e linguagem foram aprovadas visualmente. | Sim como referência visual; não como prova técnica. |
| `PR_ABERTA` | Mudança proposta, ainda não incorporada ao estado principal. | Não. |
| `LEGADO_HISTORICO` | Material anterior preservado para rastreabilidade. | Apenas após revisão explícita. |
| `DEMO_OU_LOCAL` | Fixture, mock, seed, bundle ou conteúdo local. | Nunca para decisão de caso real. |
| `QUEBRADO_OU_INCOMPLETO` | Falha observada, fluxo interrompido ou requisito ausente. | Não até correção e prova. |
| `NAO_LOCALIZADO` | Não foi encontrado após busca verificável. | Não; registrar onde deveria existir. |

---

## 3. Essência a reconstruir

O Clube Ancestral não é um conjunto de dashboards, formulários, integrações e documentos. Sua essência é uma operação humana de genealogia, memória familiar e orientação por ancestralidade, apoiada por tecnologia.

```text
Pessoa ou família
→ conversa e contexto
→ descoberta estruturada
→ pesquisa e documentos
→ dossiê e decisão humana
→ proposta e formalização quando aplicável
→ jornada, entrega e acompanhamento claros
```

A reconstrução deve proteger este fluxo. Todo recurso só permanece se ajudar uma destas etapas.

### Seis áreas de trabalho

| Área | Finalidade mínima |
|---|---|
| Hoje | Saber o que requer decisão ou ação agora. |
| Marketing & Comercial | Conduzir conteúdo, lead, Call, Discovery, proposta e próximo passo. |
| Pessoas & Casos | Manter a pessoa, família e caso em uma história operacional única. |
| Inteligência & Pesquisa | Transformar fontes, documentos e evidências em investigação e entregas confiáveis. |
| Formalização & Financeiro | Registrar proposta, contrato, assinatura e condição real do caso, sem invenção. |
| Governança & Administração | Proteger acesso, privacidade, histórico, auditoria e configuração sem invadir a operação. |

---

## 4. Três agentes já eleitos

Os três agentes em operação são suficientes para restaurar o núcleo. Eles não podem criar arquitetura paralela, banco novo, abas novas ou documentação interminável.

| Agente | Missão | Prova de conclusão |
|---|---|---|
| KPIs | Tornar o cockpit diário acionável a partir de dados atuais. | Todo KPI abre uma fila/detalhe real e tem fonte, cobertura e ação. |
| Abas | Recolocar cada tela e componente no grupo correto, ocultando ruído sem apagar patrimônio. | Cada tela é classificada em uma das seis áreas, Governança ou Legado. |
| Mesa Discovery | Fazer entrada comercial funcionar do dump de WhatsApp/Call à próxima ação e handoff. | Conversa → sugestão revisável → SPIN → próxima ação persistida → releitura após recarregar. |

### Contrato dos agentes

- Não criar tabela, migration, rota ou aba global sem autorização específica.
- Não apagar ativos.
- Não declarar uma capacidade como pronta sem demonstração.
- Não usar CA OPS, Planilha Mestre, Matriz Operacional, SKUs/rankings legados ou dados DEMO/local como fonte da operação atual.
- Não criar segundo CRM, segundo caso, segundo dossiê ou segundo painel de tarefas.
- Não acionar comunicação, contrato, cobrança, assinatura, pagamento, pesquisa externa ou integração fora do ambiente interno.

---

## 5. Motores a reconstruir

Os motores não serão considerados “já feitos” apenas por existirem arquivos ou telas. Cada motor deve ser revalidado do zero, um por vez, com entrada, transformação, saída, armazenamento, responsável e teste.

| Prioridade | Motor | Entrada mínima | Saída mínima | Prova necessária |
|---:|---|---|---|---|
| 1 | Mesa Discovery / CRM | Lead ou pessoa + dump/Call + contexto | Próxima ação, responsável, prazo, SPIN e handoff revisáveis | Salvar, recarregar, reler e encontrar o mesmo item em Marketing & Comercial e Hoje. |
| 2 | Pessoa 360 / Dossiê | Pessoa identificada + fontes autorizadas | Perfil unificado com origem, estado e vínculo de caso | Não duplicar pessoa; cada campo mostra fonte/status; alteração persiste. |
| 3 | Varredura de dossiê | Pessoa/caso + palavras-chave + fontes autorizadas | Inventário cronológico de materiais, lacunas e sugestões | Resultado cita fonte; nada é confirmado/gravadado sem revisão humana. |
| 4 | Pesquisa e evidências | Caso + pessoa/linha + documento/fonte | Lacunas, pedidos, evidências, hipóteses e plano de ação | Relação/fato não vira validado sem fonte/revisão; isolamento por caso. |
| 5 | Contexto de países / validador jurídico | País/linha/contexto do caso + regra versionada | Perguntas, alertas e lacunas de revisão | Não produz parecer, promessa ou elegibilidade automática. |
| 6 | Proposta e formalização | Caso + proposta identificada + dados de partes | Parâmetros, prévia, pendências e revisão | Não há contrato final sem fonte, versão, campos obrigatórios e aprovação. |
| 7 | Financeiro por caso | Registro de condição e fonte transacional quando existir | Estado financeiro de caso e impacto nos próximos passos | Não infere pagamento, preço ou cobrança por texto/planilha legada. |
| 8 | Entregas e App Cliente | Entrega revisada + permissão de visibilidade | Conteúdo sanitizado, liberado e rastreável | Nada interno/sensível aparece ao cliente sem liberação. |

---

## 6. Contratos do sistema que precisam existir

“Todos os contratos” não significa produzir documentos jurídicos agora. Significa definir contratos claros entre pessoas, dados, telas e motores, para qualquer executor saber o que entra e sai de cada parte.

### 6.1 Contrato de entrada comercial

| Campo | Regra |
|---|---|
| Unidade | Lead ou pessoa existente, nunca registro duplicado por conveniência. |
| Entrada | Call, formulário, dump de WhatsApp, transcrição ou contato manual autorizado. |
| Tratamento | Varredura cria sugestões; operadora revisa, aceita, corrige ou descarta. |
| SPIN | Situação, Problema, Implicação e Necessidade possuem pergunta, resposta, contexto, destino e consequência. |
| Saída | Próxima ação + responsável + prazo + resultado Discovery + handoff, quando aplicável. |
| Proibição | Não cria caso, contrato, cobrança, pesquisa externa ou promessa automática. |

### 6.2 Contrato da Pessoa 360

| Campo | Regra |
|---|---|
| Unidade | Uma pessoa identificada, com vínculo a lead, cliente, núcleo, parte contratual ou perfil de pesquisa. |
| Fonte | Cada dado registra origem, data e estado: confirmado, a confirmar, em revisão, conflitante ou histórico. |
| Relações | Relações familiares só se tornam confirmadas mediante fonte/revisão; variantes não criam pessoa automaticamente. |
| Privacidade | Dados sensíveis possuem acesso mínimo e não vão ao App Cliente por padrão. |
| Saída | Perfil e dossiê interno; projeção somente quando aprovada. |
| Proibição | Não fundir pessoas automaticamente; não usar relato como documento. |

### 6.3 Contrato da varredura de dossiê

| Campo | Regra |
|---|---|
| Entrada | Pessoa/caso, palavras-chave e fontes explicitamente autorizadas. |
| Busca | Localiza materiais; não altera fontes externas nem cria registro final sozinho. |
| Saída | Inventário com fonte, data, versão, vínculo provável, estado e lacuna. |
| Revisão | A pessoa responsável decide o que vincular ao dossiê/Pessoa/Caso. |
| Proibição | Não assumir que arquivo encontrado é vigente, verdadeiro, público ou liberável ao cliente. |

### 6.4 Contrato de pesquisa

| Campo | Regra |
|---|---|
| Entrada | Caso, pessoa/linha, pergunta de pesquisa e fonte/documento existente. |
| Estados | Hipótese, indício, em revisão, validado, inconclusivo e descartado são distintos. |
| Saída | Plano de ação, pedido documental, evidência, conflito ou achado revisável. |
| Proibição | Não executar consulta externa nem declarar parentesco/rota/resultado final sem revisão aplicável. |

### 6.5 Contrato de contexto internacional e jurídico

| Campo | Regra |
|---|---|
| Entrada | País/território, período, linha, fato/documento e versão de regra. |
| Saída | Perguntas adequadas, necessidade de documento, sinal de revisão e referência de regra. |
| Proibição | Não declarar direito, elegibilidade, prazo ou estratégia jurídica final automaticamente. |
| Auditoria | Registrar fonte oficial/versão, data de revisão e responsável quando aplicável. |

### 6.6 Contrato de formalização e financeiro

| Campo | Regra |
|---|---|
| Entrada | Caso, proposta/versionamento identificado, partes, escopo e condição explicitamente revisados. |
| Saída | Prévia, pendências, revisão, contrato, assinatura e status financeiro referenciado. |
| Proibição | Não usar texto livre, dado de WhatsApp, previsão, planilha legado ou mock como fonte de pagamento/preço/contrato. |
| Transição | Assinatura e pagamento só mudam estado diante de registro confirmável da fonte correta. |

---

## 7. Método único de reconstrução

Todo executor deve trabalhar em ciclos de no máximo uma capacidade por vez.

### Ciclo padrão

1. Escolher **um objeto real**: um lead, pessoa, caso, proposta, pendência ou entrega.
2. Declarar **uma ação única**: salvar, vincular, revisar, criar rascunho, gerar prévia ou liberar.
3. Identificar **a fonte atual** e a rota/componente/tabela envolvidos.
4. Fazer a ação em ambiente permitido.
5. Recarregar e reler para provar persistência quando houver escrita.
6. Verificar isolamento por organização/caso/pessoa.
7. Registrar resultado: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO` ou `NAO_LOCALIZADO`.
8. Só então decidir a próxima capacidade.

### Proibição de cascata

Se o teste falhar, não abrir automaticamente novo prompt, novo motor, nova aba, nova tabela ou nova arquitetura. Registrar o bloqueio em uma frase objetiva e escolher se deve corrigir ou pausar.

---

## 8. Primeiro corte vertical obrigatório

Antes de mexer em contratos, financeiro, app, painel, indicadores avançados ou novos países, provar um fluxo comercial mínimo:

```text
1. Localizar ou criar um lead de teste interno controlado
2. Abrir a Mesa Discovery
3. Colar um dump de WhatsApp ou texto de Call autorizado para teste
4. Receber sugestões da varredura
5. Revisar uma sugestão e responder os quatro blocos SPIN no mesmo fluxo
6. Registrar resultado da Discovery, responsável, prazo e próxima ação
7. Salvar
8. Recarregar
9. Confirmar a persistência
10. Verificar que a pendência aparece em Marketing & Comercial e em Hoje
11. Abrir o detalhe a partir de Hoje sem registro duplicado
```

### Critério de aceite do corte vertical

- Não há formulário duplicado.
- A varredura não transforma texto em dado confirmado sem revisão.
- O SPIN tem pergunta, resposta, contexto, destino e consequência.
- O lead tem próxima ação, responsável e prazo.
- O mesmo fato aparece em Marketing & Comercial e Hoje, mas só existe uma vez no banco/dominio de origem.
- Após recarregar, o resultado continua presente.

Se este fluxo não passar, não iniciar motor de contrato, financeiro ou automação.

---

## 9. Registro mínimo de realidade

Toda nova afirmação deve entrar neste formato curto:

| Campo | Conteúdo obrigatório |
|---|---|
| Capacidade | Nome do fluxo testado. |
| Objeto | Lead/pessoa/caso/entrega identificado sem expor dado sensível. |
| Fonte | Rota, tabela, função ou arquivo usado. |
| Ação | O que foi feito. |
| Resultado | Passou, falhou, bloqueado ou não localizado. |
| Prova | Releitura, registro persistido, teste automatizado ou evidência de tela. |
| Limite | O que não foi testado ou não está provado. |
| Próxima ação | Uma única ação, somente se necessária. |

Sem esse registro, nenhum agente pode marcar entrega como concluída.

---

## 10. Instrução de continuidade universal

Copie este bloco para qualquer pessoa, IA, desenvolvedor ou agente que venha a ajudar:

```text
Você está assumindo o Clube Ancestral em RESET DE CONFIANÇA OPERACIONAL.

Não presuma que qualquer coisa está pronta apenas porque existe em documento,
prompt, mockup, GitHub, PR, tela, banco ou conversa. Trate tudo como patrimônio
preservado, mas não comprovado, até evidência direta.

Não produza plano amplo, nova arquitetura, novo CRM, novo painel, novo catálogo,
novo motor, nova tabela ou nova documentação sem que a proprietária peça.

Trabalhe somente em uma capacidade por vez.

Para qualquer capacidade:
1. Identifique objeto real, rota, fonte e regra.
2. Diga em uma frase o que será provado.
3. Execute uma ação permitida e reversível.
4. Recarregue e releia se houver escrita.
5. Mostre PASSOU, FALHOU, BLOQUEADO ou NAO_LOCALIZADO.
6. Não faça a próxima tarefa automaticamente.

A estrutura operacional é:
- Hoje
- Marketing & Comercial
- Pessoas & Casos
- Inteligência & Pesquisa
- Formalização & Financeiro
- Governança & Administração

Não usar CA OPS, Matriz Operacional, Planilha Mestre, SKUs/rankings legados ou
DEMO/local como fonte da operação atual.

O primeiro fluxo obrigatório é Mesa Discovery:
conversa/dump → varredura revisável → SPIN → próxima ação com responsável e prazo
→ salvar → recarregar → aparecer em Marketing & Comercial e Hoje sem duplicidade.

Não declarar integração, persistência, contrato, pagamento, segurança ou automação
como existente sem prova específica. Não acionar ações externas. Não apagar nada.
```

---

## 11. Limites e próximos passos

### Limites assumidos

- Este reset não recupera automaticamente itens que podem ter sido perdidos fora das fontes acessíveis.
- Não confirma que os motores listados estejam ausentes ou inteiramente quebrados; apenas remove a presunção de que estão prontos.
- Não substitui revisão jurídica profissional, nem cria/valida instrumento jurídico.
- Não altera ambientes externos nem corrige código por si só.

### Próximos passos de verdade

1. Entregar aos três agentes este documento como regra de operação.
2. Executar somente o corte vertical da Mesa Discovery.
3. Registrar a prova mínima de realidade.
4. Decidir se a próxima prioridade é Pessoa 360/Dossiê ou Proposta/Formalização.
5. Repetir o mesmo método — uma capacidade, uma ação, uma prova — até sair do caos.
