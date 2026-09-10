# Clube Ancestral — Artefato de Resgate
## Skills de Inteligência, Varredura e Composição de Dossiê

**Versão:** 1.0
**Data:** 02 de setembro de 2026
**Status:** inventário recuperado + proposta de consolidação
**Escopo:** capacidades desenhadas para o Computer Perplexity e suas pontes com Desk Intelligence, CRM/Painel de Calls, Caso 360, Pessoa 360, Dossiê, One Page, Canva/Propostas e Motor Contratual.

## Nota de arquivamento (não faz parte do documento original)

Recebido da proprietária em 02/09/2026 com a instrução "Aplique". Arquivado aqui na íntegra. A seção 13 do próprio documento ("Decisões solicitadas à proprietária") lista 6 decisões que ainda dependem dela — não foram implementadas por conta própria, pelo mesmo motivo que já vale para todo o resto desta sessão: decisão de arquitetura e modelo de dados não é fabricada, é perguntada. Ver reconciliação de status ao final deste arquivo.

---

## 1. Objetivo

Consolidar as skills já concebidas para o Clube Ancestral, separar o que já está implementado no repositório do que ainda é procedimento documentado ou proposta, e definir uma arquitetura mínima para que a informação passe de uma fonte bruta para um dado interno revisável — sem confundir extração com verdade, e sem executar ações externas automaticamente.

A sequência de valor pretendida é:

```text
Fonte bruta autorizada
→ extração assistida
→ sugestão com evidência e confiança
→ revisão humana
→ registro no domínio correto
→ projeção sanitizada ao cliente, quando aprovada
```

Nenhuma skill descrita neste documento deve, por conta própria:

- Enviar WhatsApp, e-mail ou qualquer comunicação externa.
- Criar ou alterar contrato, cobrança, assinatura, tarefa, evento de calendário ou pesquisa externa.
- Declarar elegibilidade, parentesco, rota jurídica, preço, condição comercial ou escopo contratual como fatos finais.
- Substituir fonte documental, aprovação humana, catálogo homologado ou proposta vigente aprovada.

---

## 2. Princípios de funcionamento

| Princípio | Regra operacional |
|---|---|
| Separar captura de validação | A skill pode extrair e sugerir; a pessoa responsável confirma, rejeita ou corrige antes de gravar como dado validado. |
| Preservar proveniência | Toda sugestão deve manter fonte, trecho/arquivo/página quando disponível, data de leitura, grau de confiança e status de revisão. |
| Menor privilégio | Acesso somente às fontes autorizadas para aquele cliente, caso ou oportunidade. |
| Uma fonte por decisão | WhatsApp, transcrição e relato são fontes de apoio; não prevalecem sobre documento, proposta aprovada, cadastro validado ou catálogo homologado. |
| Não propagar conteúdo bruto | App Cliente e One Page recebem somente conteúdo aprovado, sanitizado e adequado à visibilidade do cliente. |
| Sincronização explícita | Nenhum dado sensível deve alterar contrato, proposta ou perfil automaticamente. Aplicação por botão, prévia de diferenças e trilha de auditoria. |
| Identificador canônico | Todo resultado deve ser vinculado ao `case_id`, `person_id`, `lead_id` ou `proposal_id` correto; não criar identificadores paralelos. |

---

## 3. Mapa das skills

| Skill / capacidade | Entrada principal | Saída útil | Estado resgatado | Destino correto |
|---|---|---|---|---|
| Varredura de WhatsApp | Dump colado manualmente de conversa autorizada | Campos sugeridos de discovery, fatos, objeções, intenção, próximos passos e evidências | Implementada como varredura local no Painel de Calls | Painel de Calls / CRM; nunca App Cliente diretamente |
| Client Varredura | Nome do cliente ou caso + fontes autorizadas | Inventário cronológico de materiais e mapa do dossiê | Documentada; skill autônoma não localizada como artefato executável independente | Dossiê interno / Caso 360 |
| ca-client-go-live | Cliente/caso + memória, sessões, Drive e Canva autorizados | Dossiê consolidado, checklist, estrutura de pastas, plano de ativação e registros de preparação | Documentada como skill em seis fases; houve execução histórica para Ana Luiza | Caso 360, onboarding e dossiê interno |
| One Page | Sinais confirmados, pendências e narrativa aprovada | Texto para diagramação, versão WhatsApp e follow-up | Skill declarada existente; há componente e dados de one-page no repositório | App Cliente / devolutiva sanitizada |
| One Page Sophi | Dados aprovados do caso Sophi | Devolutiva individual curta, sem promessas e sem dado sensível | Há caso e estrutura de conteúdo no bundle; tratar como caso específico a validar | App/One Page, depois de aprovação humana |
| Leitura de proposta Canva | Design Canva identificado, versão e aprovação explícita | Mapa estruturado de escopo, itens, exclusões, modalidade e dados referenciais | O código já define Canva aprovado como fonte mandatória de escopo; conexão automatizada ainda não está comprovada | Registro de proposta + fila de conferência do Motor Contratual |
| Conferência contratual | Proposta vigente + parâmetros já revisados + contrato/caso | Diferenças, campos faltantes e prévia de ressincronização | Motor contratual e parâmetros existem; ligação de objeto/escopo/partes ainda é frente de decisão/implementação | Motor Contratual; somente após confirmação humana |
| Pessoa 360 / Pessoa Canônica | Dados aprovados provenientes de CRM, dossiê, documentos e revisões | Visão unificada de pessoa, vínculos familiares, contatos, dados cadastrais e evidências | Necessidade confirmada; cadastros fragmentados estão em consolidação arquitetural | Pessoa Canônica e Caso 360 |

---

## 4. Skill 1 — Varredura de WhatsApp para Calls

### Finalidade

Transformar um dump de conversa de WhatsApp, fornecido manualmente pela equipe e dentro do contexto autorizado, em material estruturado de discovery para reduzir retrabalho no Painel de Calls.

A implementação encontrada no repositório já posiciona a varredura antes do formulário de Calls: o fluxo reconhece que a operação real começa com a colagem do dump do prospect e que o formulário deve receber sugestões estruturadas a partir dele.

### O que a skill deve extrair

| Grupo | Exemplos de saída | Regra |
|---|---|---|
| Identificação | Nome citado, canal, telefone quando já disponível, referência do atendimento | Nunca inferir CPF, endereço ou vínculo familiar. |
| Contexto comercial | Objetivo declarado, país/linha de interesse, urgência, origem, fase percebida | Marcar como declarado pelo interlocutor; não como diagnóstico jurídico. |
| Discovery / SPIN | Situação, problema, implicação, necessidade, perguntas abertas | Gerar como sugestão editável para a call. |
| Linha familiar relatada | Nomes, gerações, localidades, datas aproximadas e documentos mencionados | Classificar como relato a confirmar. |
| Objeções e intenção | Dúvidas, preço, prazo, necessidade de call, aceite verbal ou pedido de proposta | Não converter aceite verbal em contrato ou cliente ativo. |
| Próxima ação | Agendar call, solicitar documento, enviar explicação, registrar pendência | Criar sugestão; a ação externa continua dependendo de clique e confirmação. |

### Destino de dados

1. A varredura exibe sugestões preenchíveis no Painel de Calls.
2. A operadora aceita, corrige ou descarta cada sugestão.
3. O registro aceito vira interação interna e/ou campo do CRM, com origem `whatsapp` e confiança de apoio.
4. Uma futura conversão para Pessoa 360 ou Caso 360 só acontece após vínculo correto do lead/pessoa/caso e revisão humana.

### Limites obrigatórios

- Dump de WhatsApp é fonte narrativa, não prova documental.
- Não deve preencher automaticamente valor, SKU, condição, escopo, elegibilidade, parentesco ou cláusula contratual.
- Não deve expor dump, transcrição, hipóteses ou anotações internas no App Cliente.
- A integração de WhatsApp Business está desligada/não configurada; esta capacidade trabalha com importação manual e não com leitura automática de conversas.

### Critério de aceite

- Colar um dump de teste produz sugestões editáveis.
- Nada é gravado até confirmação explícita no formulário.
- Cada item aceito preserva origem, data, texto-base/referência e status `a_confirmar` quando apropriado.
- F5 após salvar mantém somente o que foi efetivamente confirmado e persistido.

---

## 5. Skill 2 — Client Varredura

### Finalidade

Localizar e organizar, para um cliente ou caso identificado, os materiais que já existem em fontes autorizadas: documentos, propostas, checklists, mensagens registradas, transcrições, interações, entregas, evidências e decisões.

Ela não cria um dossiê por dedução. Entrega um mapa de materiais para que a equipe monte ou atualize o dossiê interno com rastreabilidade.

### Entrada mínima

- Nome completo do cliente ou nome usado no atendimento.
- `case_id` quando existir.
- `lead_id`, `client_id` ou outro identificador conciliado, quando disponível.
- Lista de fontes autorizadas e recorte temporal, se necessário.
- Palavras-chave adicionais: país, sobrenome familiar, produto, período ou tipo de documento.

### Fontes previstas

| Fonte | Uso permitido | Observação |
|---|---|---|
| Desk / Supabase | Caso, CRM, tarefas, documentos referenciados, pesquisa e evidências internas | Fonte de contexto operacional; aplicar RLS e vínculo de organização. |
| Google Drive compartilhado | Documentos e dossiês de clientes ativos | Fonte operacional de arquivos autorizados. |
| Canva | Proposta-mestre, versão visual e conteúdo de páginas aprovadas | Consultar design identificado; não supor vigência pelo título. |
| Memória e sessões autorizadas | Decisões, contexto de atendimento e histórico disponível | Nunca substituir evidência documental. |
| Dropbox | Backup e histórico | Não usar como fonte vigente sem confirmação; não duplicar conteúdo no dossiê. |

### Saída esperada

- Linha do tempo de materiais encontrados.
- Inventário por tipo, fonte, data, versão e vínculo conhecido.
- Classificação: `vigente_confirmado`, `a_confirmar`, `histórico`, `duplicado_aparente`, `inacessível` ou `fora_de_escopo`.
- Lista de lacunas de dossiê: por exemplo, proposta sem versão identificada, documento citado mas não localizado, contato sem pessoa canônica vinculada.
- Sugestão de destino no Caso 360, Pessoa 360, CRM, pesquisa ou arquivo histórico.

### Estado atual

A capacidade está documentada como skill existente, mas o artefato autônomo de execução não foi localizado no repositório nesta rodada. Por isso, deve ser tratada como procedimento especificado, não como automação comprovadamente ativa.

---

## 6. Skill 3 — ca-client-go-live

### Finalidade

Consolidar a preparação de um cliente do lead ao go-live, conectando materiais existentes ao dossiê interno, à checagem de prontidão e aos pontos de handoff — sem presumir ativação externa.

A skill é diferente de Client Varredura:

- **Client Varredura** localiza e classifica materiais.
- **ca-client-go-live** usa essa varredura como uma de suas fases para preparar o caso, checar requisitos, organizar o dossiê e produzir uma lista controlada de próximos passos.

### Saídas válidas

- Dossiê consolidado interno.
- Checklist de documentos e pendências.
- Estrutura de pastas sugerida ou validada, quando houver autorização específica.
- Linha do tempo de interação e decisões.
- Estado de prontidão com bloqueios e responsáveis.
- Proposta de atualização de Pessoa 360 e Caso 360, sempre em modo de revisão.
- Rascunho de comunicação ou de tarefa, nunca envio/criação automática.

### O que não significa

A existência da skill, de código, de checklist ou de materiais organizados não equivale a go-live real. Ativação exige fonte de verdade, identificador reconciliado, gates atendidos, responsável, evidência de teste e autorização para qualquer ação externa.

---

## 7. Skill 4 — Pessoa 360 e Pessoa Canônica

### Problema que resolve

O ecossistema possui cadastros fragmentados em mais de um domínio. Uma pessoa pode aparecer como lead, cliente, contato, membro de núcleo, parte contratual ou perfil genealógico. Sem uma fonte canônica, a mesma informação é repetida, diverge e perde proveniência.

### Proposta de comportamento

A skill não deve "fundir" registros automaticamente. Ela deve:

1. Reunir candidatos de registro associados à mesma pessoa.
2. Mostrar evidências de correspondência: nome, contato, caso, relação, documento, fonte e datas.
3. Sugerir consolidação para revisão humana.
4. Criar ou atualizar a pessoa canônica somente após confirmação.
5. Registrar os vínculos de contexto: é lead, contratante, dependente, parte do contrato, integrante de núcleo, pessoa pesquisada etc.

### Blocos recomendados do Perfil Pessoa 360

| Bloco | Conteúdo | Fonte e governança |
|---|---|---|
| Identidade | Nome, nomes alternativos, data/local de nascimento, contatos | Documento/cadastro confirmado prevalece; relato fica como a confirmar. |
| Relações | Pais, filhos, cônjuge, dependentes, núcleo e papel em cada caso | Relações referenciam outras pessoas canônicas; texto livre somente como observação provisória. |
| Contexto comercial | Lead, objetivo, origem, calls, proposta e estágio | CRM e interações; não exibir no App Cliente. |
| Casos e serviços | Casos vinculados, papel, produto/escopo de alto nível e status interno | Caso/contrato e catálogo; respeitar visibilidade. |
| Pesquisa | Hipóteses, fontes, evidências, documentos e grau de confirmação | Desk de pesquisa; conteúdo não confirmado não vira afirmação ao cliente. |
| Privacidade e consentimento | Bases, consentimentos, preferências e restrições de acesso | Dados sensíveis sob RLS e regras de mínimo acesso. |
| Auditoria | Origem, autor, data, revisão e mudanças | Obrigatório para qualquer consolidação ou alteração sensível. |

### Decisão arquitetural ainda necessária

A consolidação deve avançar somente depois da decisão sobre a tabela/entidade de Pessoa Canônica e sobre o modelo de dependentes. A orientação de arquitetura é manter uma pessoa como entidade independente e representar os papéis por vínculos, evitando que `clientes` se torne, simultaneamente, cadastro pessoal, CRM e estrutura familiar.

---

## 8. Skill 5 — One Page e One Page Sophi

### Finalidade

Compor uma devolutiva breve, clara e visualmente pronta para diagramação, usando apenas informações aprovadas para o cliente. Pode ter versão de página/PDF e versão curta para WhatsApp, mas não é o dossiê interno nem substitui o Desk.

### Regras de conteúdo

- Usar linguagem de confirmação gradual: "linha familiar em análise", "referência em confirmação", "documentos a localizar" e "próxima etapa recomendada".
- Não afirmar cidadania, elegibilidade ou vínculo familiar como conclusão sem evidência e revisão aplicáveis.
- Não incluir dados sensíveis, transcrições, dumps, notas internas, histórico comercial ou hipóteses brutas.
- Ter uma versão, uma data, um caso/pessoa vinculados e aprovação de publicação.

### One Page Sophi

Há dados de caso Sophi e estruturas de one-page no repositório. A existência técnica não deve ser confundida com autorização de envio ou com conteúdo vigente. Antes de publicar, a operadora deve confirmar:

- Qual pessoa/caso Sophi corresponde ao registro real.
- Quais achados podem ser comunicados.
- Quais pendências e próximo passo são verdadeiros no momento da emissão.
- Se há versão de proposta e condição comercial homologadas.
- Se o conteúdo está sanitizado e aprovado para a audiência correta.

### Template mínimo

1. Título: leitura inicial / atualização de percurso.
2. O que foi observado ou confirmado, em linguagem não conclusiva quando necessário.
3. O que ainda precisa ser confirmado ou localizado.
4. Próxima etapa recomendada.
5. Canal de contato e CTA aprovados.
6. Versão, data e responsável pela aprovação interna.

---

## 9. Skill 6 — Varredura de Propostas Canva para o Motor Contratual

### Problema que resolve

A proposta aprovada no Canva é definida como fonte mandatória para o escopo contratual. Porém, a simples existência de um link livre de proposta no Caso 360 ou em Leads não cria conexão confiável com a proposta real, sua versão, suas páginas e sua aprovação.

O motor proposto deve transformar a proposta Canva identificada em uma leitura estruturada, conferível e auditável para alimentar uma fila de revisão do Motor Contratual.

### Entrada obrigatória

- `proposal_id` interno, quando existir.
- Identificador do design Canva.
- Versão ou data de revisão.
- Status explícito: rascunho, enviada, aprovada, substituída, arquivada.
- Vínculo com `case_id` e/ou `lead_id`.
- Confirmação humana de que aquela é a proposta vigente autorizada.

### Campos a extrair para prévia

| Grupo | Exemplos | Tratamento |
|---|---|---|
| Identificação | Título, cliente/caso referenciado, versão, data | Comparar com registros internos; divergência vira pendência. |
| Escopo | Serviço, objetivo, entregas, inclusões, exclusões e limitações | Proposta aprovada é referência de escopo; revisão humana obrigatória. |
| Partes | Contratante/contratada quando presentes | Não preencher documentos pessoais por inferência; confirmar no cadastro. |
| Condição comercial | Modalidade, parcelas, vencimento, valor apresentado | Conferir contra fonte comercial homologada; proposta não é fonte final isolada de preço/SKU. |
| Cláusulas operacionais | Prazos, premissas e dependências | Converter em alertas/gates, não em alteração automática de contrato. |
| Evidência | Página e trecho de origem | Guardar para permitir conferência humana. |

### Saída

Uma tela ou bloco de "Conferência da Proposta" contendo:

- Campos extraídos e sua página de origem.
- Diferenças entre proposta, parâmetros do contrato, CRM e catálogo.
- Classificação por severidade: informativa, pendente, conflitante ou bloqueante.
- Botão de ressincronização explícita, disponível somente a usuário autorizado.
- Registro de quem aprovou, quais campos foram aplicados e qual versão da proposta foi usada.

### Regra de sincronização

A sincronização recomendada é **manual por botão explícito**, nunca automática. Antes de aplicar alterações, o sistema deve comparar proposta e parâmetros atuais e mostrar uma prévia das mudanças. Toda alteração precisa registrar versão de origem, data, responsável e motivo.

### Proteções comerciais e jurídicas

- Preço, SKU e condição final devem ser conciliados com o catálogo/fonte comercial homologada e exceções aprovadas.
- Proposta, WhatsApp, transcrição e texto manual não podem alterar valor ou condição comercial final sem conferência.
- Se proposta e catálogo divergem, o resultado é conflito a resolver, não escolha automática.
- O contrato só pode ser preparado a partir de dados completos e aprovados nos gates aplicáveis.

---

## 10. Fluxo unificado recomendado

```text
1. Lead envia contexto por WhatsApp
2. Equipe cola o dump na Varredura de WhatsApp
3. Sistema sugere campos → equipe revisa → CRM/Painel de Calls registra a interação
4. Quando há interesse/caso, Client Varredura reúne materiais autorizados
5. ca-client-go-live consolida dossiê, pendências e checklist interno
6. Pessoa 360 recebe apenas dados aprovados e vínculos confirmados
7. Proposta Canva é identificada, versionada e aprovada pela equipe
8. Varredura de Proposta cria prévia estruturada e diferenças para o Motor Contratual
9. Responsável revisa e usa "Ressincronizar parâmetros" quando apropriado
10. One Page recebe somente conteúdo sanitizado, aprovado e adequado ao cliente
```

---

## 11. Backlog priorizado

### P0 — Fundamentos antes de automação

- Decidir e implementar a entidade Pessoa Canônica, relações e referências a registros legados.
- Concluir a regra do Motor Contratual: proposta vigente, versão, fonte dos parâmetros e ressincronização por ação explícita.
- Corrigir falhas de persistência abertas antes de criar novas automações de captura.
- Manter RLS, sessão, permissões por organização e auditoria sem alteração não autorizada.

### P1 — Converter skills em fluxos verificáveis

- Auditar a Varredura de WhatsApp ponta a ponta: campos sugeridos, aceite individual, persistência e releitura após F5.
- Formalizar Client Varredura como artefato executável: entrada, fontes, critérios de busca, saída e limites.
- Criar um objeto de resultado comum: `scan_run`, `scan_item`, `source_reference`, `confidence`, `review_status`, `accepted_by`, `accepted_at`.
- Ligar a leitura de proposta Canva a um `proposal_id` versionado, evitando campos livres duplicados.

### P2 — Projeção ao cliente

- Definir contrato de dados para One Page e App Cliente.
- Validar o caso Sophi e marcar o que é dado local/histórico versus conteúdo vigente aprovado.
- Implementar aprovação editorial e sanitização antes de qualquer publicação.

---

## 12. Checklist de aceite por skill

| Skill | Prova mínima |
|---|---|
| Varredura de WhatsApp | Dump de teste → sugestões → revisão → salvar → F5 → origem preservada. |
| Client Varredura | Busca com cliente/caso conhecido → inventário datado → classificação de fonte → nenhuma alteração externa. |
| ca-client-go-live | Dossiê de preparação com case_id canônico, pendências, responsáveis e nenhum go-live presumido. |
| Pessoa 360 | Dois registros candidatos → prévia de unificação → aprovação humana → vínculos e trilha de auditoria preservados. |
| One Page | Conteúdo interno marcado como não publicável não aparece na prévia cliente; versão aprovada mostra somente campos liberados. |
| Proposta Canva / Contrato | Design e versão identificados → extração com páginas → diferenças → ressincronização manual → log da decisão. |

---

## 13. Decisões solicitadas à proprietária

1. Confirmar que WhatsApp continuará como importação manual de dump no MVP, sem conexão automática ao WhatsApp Business.
2. Eleger Pessoa Canônica como entidade independente e aprovar relações por referência entre pessoas.
3. Aprovar ressincronização do Motor Contratual por botão explícito, com comparação e auditoria.
4. Determinar o campo/objeto oficial de vínculo à proposta: `proposal_id` + versão + design Canva; aposentar gradualmente campos livres duplicados.
5. Indicar se a One Page Sophi deve entrar na primeira onda de validação de conteúdo ou permanecer como material histórico até conciliação do caso.
6. Autorizar a especificação técnica de `scan_run` e `scan_item` sem migração produtiva, para revisão antes de qualquer alteração de schema.

---

## 14. Conclusão

As skills resgatadas formam uma cadeia coerente de inteligência operacional: elas começam pela captura de contexto, organizam materiais, consolidam o dossiê, protegem a pessoa como entidade canônica, conferem a proposta vigente e finalmente projetam apenas a parte autorizada ao cliente.

O ganho não está em "automatizar tudo", e sim em tornar cada passagem de informação rastreável, revisável e útil. WhatsApp e transcrições ajudam a começar o trabalho; documentos, proposta aprovada, catálogo homologado e validação humana determinam o que pode se tornar dado formal, contrato ou comunicação ao cliente.

---

## Reconciliação de status com o repositório (02/09/2026, adicionada no arquivamento)

Cruzamento direto contra código e PRs desta sessão, seção por seção do backlog (item 11):

**P0 — Fundamentos antes de automação**
- Pessoa Canônica: **não decidida**. `PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md` já propõe o modelo de campos e a mesma orientação (`pessoas_canonicas` como entidade independente, papéis por vínculo) — mas segue como proposta, não decisão. Ver seção "Decisões solicitadas" abaixo.
- Motor Contratual / ressincronização: **não decidida**. `ressincronizarContratanteDaMatriz` já existe como ação explícita (não automática) para puxar dados da matriz de Parâmetros para o contrato — mesmo princípio que este documento pede para proposta × parâmetros, mas hoje só cobre contratante, não o escopo completo da proposta.
- Falhas de persistência: PR #44 (draft) corrigiu 3 bugs concretos de gravação (consentimento, tipo de documento obrigatório, seletor de revisor de contrato) e mais achados registrados no Mapa de Autoridade Admin (`docs/auditorias/MAPA-AUTORIDADE-ADMIN-DESK-APP-2026-08-30.md`, seção "Atualização 2026-09-01").
- RLS/sessão/permissões/auditoria: preservados, nenhuma mudança nesta sessão.

**P1 — Converter skills em fluxos verificáveis**
- "Auditar a Varredura de WhatsApp ponta a ponta... aceite individual": **PR #48 (draft) entrega exatamente isto** — cada achado com de-para confiável ganhou um botão "Usar no lead" que grava o sinal normalizado (não o trecho) no rascunho do lead, mantendo origem/confiança implícitas na precisão do de-para. Falta só a prova manual (colar dump de teste → aceitar → salvar → F5) que só a proprietária pode confirmar em preview.
- `scan_run`/`scan_item` como objeto de resultado comum: **não implementado** — a varredura de WhatsApp hoje é puramente client-side (função pura, sem tabela), o que é adequado para não persistir dado pessoal de terceiro, mas significa que não há histórico de execuções (`scan_run`) nem log per-campo aceito/rejeitado além do que já vai para o lead. Depende da decisão 6 abaixo.
- `proposal_id` versionado substituindo campos livres: **parcialmente feito**. PR #44 aposentou os 6 campos livres de proposta no Caso 360, substituindo por leitura real de `proposals` + `proposal_canva_pages` (função `obterPropostaCanvaDoCliente`). O campo equivalente em `leads.tsx` (`proposta_link_interno`, `proposta_referencia_interna`) **não foi tocado** — mesmo ponto já registrado como pendência no Mapa de Autoridade Admin.
- Client Varredura, ca-client-go-live: confirmam o que já estava registrado — documentadas, sem artefato executável autônomo localizado no repositório.

**P2 — Projeção ao cliente**
- Nada implementado nesta sessão; depende de P0/P1 estarem resolvidos primeiro, como o próprio documento recomenda.

### As 6 decisões da seção 13, na prática

Refeitas aqui como perguntas diretas, já que o código não pode avançar em Pessoa Canônica/Motor Contratual sem resposta:

1. WhatsApp manual-only, sem WhatsApp Business — já é assim hoje em código; só precisa da confirmação de que continua assim.
2. Pessoa Canônica como entidade independente (não expandir `clientes`) — já é a recomendação escrita em `PESSOA-CANONICA-MODELO-DE-CAMPOS-2026-08-31.md`; falta aprovação para criar a tabela.
3. Ressincronização do Motor Contratual por botão explícito — mesmo padrão já usado em `ressincronizarContratanteDaMatriz`; falta estender e aprovar para o motor completo.
4. `proposal_id` + versão como vínculo oficial, campos livres aposentados aos poucos — já em andamento no Caso 360 (PR #44); falta decidir se o mesmo vale para Leads agora.
5. One Page Sophi: primeira onda de validação, ou aguarda conciliação do caso — sem posição registrada nesta sessão.
6. Autorizar especificação técnica de `scan_run`/`scan_item` sem migração produtiva — sem posição registrada nesta sessão.
