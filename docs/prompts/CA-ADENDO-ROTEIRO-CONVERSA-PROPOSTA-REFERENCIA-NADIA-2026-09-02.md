# Adendo de revisão — Roteiro de conversa com respostas, premissas e proposta de referência

- **Status:** em revisão
- **Versão:** v1.0
- **Data:** 2026-09-02
- **Responsável pela decisão:** Proprietária do Clube Ancestral
- **Fonte(s) de evidência:** roteiro pré-call de Nadia Soraya von Gilsa Muller; proposta Canva de Rodrigo Gonçalves Favarete — Cidadania Húngara (`DAHSBaOqEYc`); orientação da proprietária em 02/09/2026.
- **Escopo:** revisão do card "Roteiro da conversa" no Painel de Calls e uso contextual de proposta Canva de referência para Nadia.
- **Premissas:** Nadia realizou a call em 02/09/2026; a proposta de Rodrigo é uma referência de estrutura, não uma proposta automaticamente aplicável; informações de Alemanha pela linha paterna e Hungria pela linha materna precisam ser registradas com fonte e nível de confirmação.
- **Limites:** não cria, copia, edita, envia ou aprova proposta no Canva; não congela preço, SKU ou escopo; não conclui elegibilidade alemã ou húngara; não inicia pesquisa, contrato, cobrança ou contato externo.
- **Próximos passos:** registrar a call de Nadia, confirmar o que foi declarado versus documentado, validar escopo/precificação e então copiar/adaptar a proposta de Rodrigo mediante confirmação da proprietária.
- **Critério de aceite:** ver seção 5.

> **Nota de arquivamento (02/09/2026):** documento arquivado como material essencial para o novo layout de Discovery/Calls, Jornada e Planejador — a proprietária pediu para guardar para essa frente de redesenho, que segue represada até a estabilização de P0 e o cotejo tela a tela concluírem, por decisão já registrada nesta sessão. Nenhum código foi alterado a partir deste documento nesta rodada.
>
> Um segundo arquivo enviado junto a este não pôde ser lido — o link de upload retornou erro `ExpiredToken` (token de acesso expirado no S3). Fica pendente reenvio desse arquivo pela proprietária para arquivamento.

## 1. Decisão de produto

O card **Roteiro da conversa** deve mostrar as perguntas reais a serem feitas, com área de resposta ao lado ou logo abaixo de cada pergunta. Ao abrir a call, ele já deve trazer o que se sabe sobre país, linha, ancestral, documentos e dados recebidos do cliente, mas sempre com origem, confiança e marcação de que precisa ou não de confirmação.

O roteiro deixa de ser uma lista abstrata e passa a ser uma ficha de condução da conversa:

- Pergunta visível e redigida para ser dita ao cliente.
- Campo de resposta livre, com espaço suficiente para registrar narrativa, nomes, datas e observações.
- Premissa pré-preenchida, quando houver.
- Fonte do dado: WhatsApp, formulário, documento, call anterior ou declaração na call atual.
- Estado: `confirmado`, `relatado`, `documento visto`, `a confirmar`, `inconsistente` ou `não informado`.
- Ação derivada: atualizar árvore, solicitar documento, investigar rota, incluir no escopo ou deixar fora da proposta.

A interface não deve exigir a conclusão de todas as perguntas. Deve destacar as prioritárias para o caso e permitir registrar "não sabe", "não se aplica" e "retomar depois".

## 2. Modelo do card Roteiro

### Cabeçalho fixo da call

| Elemento | Regra de exibição |
|---|---|
| Lead e data da call | Sempre visível |
| Objetivo declarado | Sempre visível, editável |
| Países / linhas em análise | Chips por país e linha, com estado preliminar |
| Resumo de premissas | Máximo de cinco fatos, todos com fonte e confiança |
| Lacunas críticas | Máximo de cinco perguntas prioritárias |
| Referência de proposta | Link interno para design Canva de referência, quando associado ao caso |

### Bloco de pergunta

```text
[Estado] [Fonte] [Prioridade]
Pergunta para a conversa
<texto da pergunta em linguagem natural>

Premissa já disponível
<dado conhecido, fonte e nível de confiança>

Resposta da cliente
<campo de texto amplo / resposta já capturada da transcrição>

Encaminhamento
[ ] Confirmar em documento
[ ] Incluir na árvore
[ ] Criar solicitação documental
[ ] Avaliar impacto na rota
[ ] Não usar na proposta por enquanto
```

### Ordem dos blocos

1. Abertura e consentimento.
2. Objetivo e expectativa da cliente.
3. Linha alemã paterna.
4. Linha húngara materna.
5. Árvore, gerações e grafias.
6. Documentos já existentes e fontes familiares.
7. Riscos, lacunas e limites de orientação.
8. Próxima etapa e enquadramento comercial.

## 3. Aplicação no caso Nadia

### Premissas iniciais visíveis no topo

| Tema | Conteúdo para exibir | Estado inicial |
|---|---|---|
| Cliente | Nadia Soraya von Gilsa Muller | informado |
| Linha húngara | Materna, família Scheuer | relato / a confirmar |
| Ancestral húngaro citado | Miguel Scheuer | relato / identificar nome completo e geração |
| Localidade citada | Bakonypölöske, Hungria | pista geográfica / a confirmar por fonte |
| Linha alemã | Paterna | informação da call de 02/09 / detalhar ancestral e geração |
| Países em análise | Alemanha (paterna) + Hungria (materna) | preliminar |
| Via jurídica | não definida para nenhum dos dois países | requer análise documental |
| Documentos | registrar o que Nadia informou ou mostrou na call | pós-call pendente de consolidação |

### Perguntas prioritárias — Alemanha paterna

| Pergunta | Premissa exibida | Campo de resposta / decisão |
|---|---|---|
| "Qual é o ancestral alemão da sua linha paterna e como ele se conecta ao seu pai e a você?" | Há uma linha alemã paterna relatada na call. | Registrar nome completo, grafias, geração, local e vínculo. |
| "Você sabe se esse ancestral nasceu na Alemanha, imigrou para o Brasil ou teve naturalização brasileira?" | Ainda não há cadeia documental estruturada nesta linha. | Separar relato, documento visto e documento pendente. |
| "Há nascimento, casamento, óbito, passaporte, registro de estrangeiro ou história de naturalização na família?" | Risco de lacuna documental e de eventos de nacionalidade. | Listar documento, titular, local, data e quem possui. |
| "Alguém da família já tratou de cidadania alemã, passaporte ou pesquisa desse ramo?" | Sem confirmação prévia. | Registrar processo, resultado e evidência disponível. |

### Perguntas prioritárias — Hungria materna

| Pergunta | Premissa exibida | Campo de resposta / decisão |
|---|---|---|
| "Miguel Scheuer era pai, avô ou bisavô de qual pessoa da sua família?" | Miguel é citado como ancestral húngaro; grau de parentesco ainda precisa ser fechado. | Atualizar cadeia Nadia → Wilma → geração intermediária → Miguel. |
| "André Scheuer e Wera Zoschke entram em qual geração da sua família?" | Há possível inconsistência entre a geração relatada e a árvore provisória. | Confirmar filiação e nomes de solteira. |
| "O que a família sabe sobre Bakonypölöske e a chegada de Miguel ao Brasil?" | Localidade é uma pista, não prova. | Registrar fonte do relato e qualquer documento que a sustente. |
| "Quais certidões, registros de imigração, passaporte, RNE, fotos, cartas ou documentos religiosos existem?" | Não havia inventário documental consolidado pré-call. | Criar lista de documentos e responsáveis pelo envio. |
| "Algum familiar já teve reconhecimento húngaro ou fala húngaro?" | Não confirmado. | Separar processo anterior de domínio de idioma; não concluir via. |

### Perguntas de fechamento

- "Qual dos dois ramos é mais importante para você hoje: Alemanha, Hungria ou a leitura comparativa dos dois?"
- "Quais documentos você consegue reunir primeiro e em quanto tempo?"
- "Você quer iniciar com um diagnóstico documental que organize as duas linhas e indique a rota prioritária antes de qualquer pesquisa internacional?"
- "Posso estruturar uma proposta por fases, deixando pesquisa em cada país condicionada aos achados documentais?"

## 4. Referência Canva e proposta adaptada

### Proposta de referência encontrada

- **Design:** Clube Ancestral — Proposta Rodrigo Favarete — Cidadania Húngara.
- **Canva design ID:** `DAHSBaOqEYc`.
- **Link de edição disponível:** `https://www.canva.com/d/4KPH7pi76pXFyKj`.
- **Estrutura:** 8 páginas, com visão geral, diagnóstico, leitura do caso, jornada, investimento e aprovação.
- **Bloco inicial de Rodrigo:** Fase 1 — diagnóstico documental e rota de pesquisa (`R$ 1.290`) + Fase 2A — pesquisa dirigida na Hungria (`R$ 2.750`), com referência total de `R$ 4.040`; a proposta apresenta alternativas à vista, recorrência e por etapas.

### Regra de uso para Nadia

A proposta de Rodrigo deve ser tratada como **estrutura e referência visual/comercial**, não como cópia automática de conteúdo, preço ou rota. Para Nadia, a adaptação proposta é:

| Componente | Decisão de adaptação para Nadia | Estado |
|---|---|---|
| Capa e identificação | Trocar nome e objetivo para Nadia Soraya von Gilsa Muller; mencionar leitura comparativa de duas linhas familiares. | a preparar |
| Leitura do caso | Substituir foco exclusivo húngaro por: Alemanha na linha paterna e Hungria na linha materna. | a preparar |
| Fase 1 | Diagnóstico integrado: árvore de trabalho, inventário documental, validação de gerações, leitura de eventos de nacionalidade e definição de prioridade entre os dois ramos. | recomendação para validação |
| Fase 2A Hungria | Manter apenas como pesquisa condicionada à confirmação da cadeia materna e da rota documental. | condicionado |
| Fase 2B Alemanha | Incluir como bloco de pesquisa/validação documental condicionado à confirmação da linha paterna, geração, origem e eventos relevantes. | condicionado |
| Jornada | Mostrar bifurcação Alemanha/Hungria após o diagnóstico, sem prometer protocolo ou elegibilidade. | recomendado |
| Investimento | Não replicar automaticamente os preços de Rodrigo. Validar SKU, escopo, esforço, fontes e condições antes de preencher. | bloqueado até validação humana |
| Aprovação | Manter ressalvas de despesas externas, autorização prévia e avanço por fase. | aplicável |

### Copy de leitura de caso sugerida

> "A sua história reúne duas frentes de investigação que precisam ser organizadas antes de qualquer conclusão: a linha paterna com referência à Alemanha e a linha materna Scheuer, com pista de origem húngara em Bakonypölöske. O primeiro passo é fechar as gerações, conferir os documentos disponíveis e definir qual rota documental deve ser priorizada. A pesquisa em Alemanha ou Hungria será indicada somente quando a evidência da família justificar essa etapa."

### Link no Painel de Calls

Quando houver uma proposta de referência, o topo da call deve mostrar um card compacto:

```text
Proposta de referência
Rodrigo Favarete — Cidadania Húngara
[ Abrir no Canva ]
Uso: estrutura de diagnóstico e pesquisa por fases.
Adaptação pendente: Nadia — Alemanha paterna + Hungria materna.
Preço e escopo: não copiados automaticamente.
```

O link é de uso interno. A interface não deve permitir "enviar proposta" ou marcar aceite somente a partir da referência.

## 5. Critérios de aceite

- O roteiro mostra perguntas e um campo de resposta correspondente, não apenas títulos ou checklists.
- Cada pergunta pode exibir premissa prévia, fonte, confiança e estado de confirmação.
- A ficha de Nadia exibe separadamente Alemanha paterna e Hungria materna, sem misturar as duas linhas.
- A interface registra lacunas, inconsistências e ações derivadas por pergunta.
- A proposta de Rodrigo aparece como referência Canva interna, com link e aviso de que escopo/preço não foram copiados automaticamente.
- A preparação de uma proposta para Nadia usa a estrutura de Rodrigo, mas exige confirmação humana de escopo, fases, SKU, preço e condições antes de criar ou enviar qualquer design.
- Nenhuma tela afirma elegibilidade, direito à cidadania, prazo garantido, dispensa de idioma ou liberação de pesquisa externa.

## 6. Prompt de implementação

```text
Revise o card "Roteiro da conversa" no Painel de Calls do Clube Ancestral. Não crie CRM paralelo, não altere banco além do necessário para salvar respostas existentes, não automatize WhatsApp, não conclua elegibilidade jurídica e não crie/enviar proposta no Canva.

Objetivo:
Transformar o roteiro em uma ficha de condução de call, com perguntas explícitas e espaço amplo para registrar a resposta da cliente. Para cada pergunta, mostrar, quando existir, a premissa pré-carregada, fonte, confiança e estado de confirmação.

Estrutura por pergunta:
- badge de estado: confirmado, relatado, documento visto, a confirmar, inconsistente ou não informado;
- badge de fonte: WhatsApp, formulário, documento, call anterior ou call atual;
- pergunta em linguagem natural;
- bloco "Premissa já disponível";
- textarea "Resposta da cliente";
- encaminhamentos: confirmar em documento, incluir na árvore, solicitar documento, avaliar impacto na rota ou não usar na proposta.

Para Nadia Soraya von Gilsa Muller:
- Mostrar no cabeçalho dois chips independentes: Alemanha — linha paterna; Hungria — linha materna.
- Pré-carregar a linha materna Scheuer, Miguel Scheuer e Bakonypölöske como relato/a confirmar.
- Mostrar perguntas específicas para fechar a linha alemã paterna e a linha húngara materna, mantendo os dois ramos separados.
- Criar no topo um card interno de "Proposta de referência" com nome "Rodrigo Favarete — Cidadania Húngara", link Canva https://www.canva.com/d/4KPH7pi76pXFyKj, e aviso: "Estrutura de referência; preço e escopo não copiados automaticamente".
- Mostrar a adaptação pendente: "Nadia — complementar Alemanha paterna e Hungria materna".

A experiência deve usar cards e disclosure progressivo, sem formar uma página de campos contínuos. Preservar as validações existentes para conclusão de call e handoff.
```
