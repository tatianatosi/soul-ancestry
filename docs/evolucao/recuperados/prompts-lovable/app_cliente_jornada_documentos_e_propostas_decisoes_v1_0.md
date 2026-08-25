# Clube Ancestral — App Cliente, Jornada, Documentos e Propostas

**Versão:** 1.0  
**Data:** 20 de agosto de 2026  
**Status:** decisão canônica para revisão e implementação  
**Escopo:** App Cliente, Home, timeline, radar, documentos, família, árvore, entregas, upsell, proposta/Blueprint e personalização por contrato.

---

## 1. Decisão central

O App Cliente não é um catálogo de SKUs, nem espelho do Desk. É uma projeção da jornada contratada, do progresso verificável, dos documentos pessoais/familiares relevantes e das entregas aprovadas.

A jornada deve ser parametrizada por:

```text
case_service
+ escopo aprovado da proposta
+ núcleo familiar e papéis
+ contrato/anexos aplicáveis
+ timeline operacional
+ documentos e evidências aprovados
+ touchpoints de onboarding
= experiência individual de cada acesso
```

---

## 2. Home do App Cliente

A Home deve ter cinco blocos, nessa ordem:

1. **Seu momento atual**
   - fase contratada;
   - etapa atual;
   - próxima ação do cliente, se houver;
   - responsável;
   - último avanço verificável.

2. **Radar da Jornada — quatro eixos**
   - Origem e linhagem;
   - Documentos e prontidão;
   - Processo e formalização;
   - Entregas e continuidade.

3. **Linha do tempo da jornada**
   - desde primeiro contato/Discovery;
   - proposta;
   - confirmação formal;
   - contrato;
   - pagamento;
   - onboarding;
   - documentos;
   - entregas;
   - marcos seguintes.

4. **Documentos que precisam de você**
   - quantidade de pendências pessoais;
   - CTA para Documentos;
   - nunca expor documentos de outro participante sem permissão.

5. **Última entrega aprovada**
   - card de valor percebido;
   - link para Entregas;
   - conteúdo aprovado/sanitizado.

Não mostrar SKU, preço, link de pagamento técnico, margem, hipótese jurídica, score interno ou catálogo.

---

## 3. Radar de quatro eixos

A porcentagem isolada de “linha de origem” deve ser substituída pelo Radar de Jornada em quatro eixos.

| Eixo | Fonte | O que o cliente vê |
|---|---|---|
| Origem e linhagem | Ficha Piloto, árvore e evidências aprovadas | Estado da linha, gerações organizadas e avanços aprovados |
| Documentos e prontidão | Checklist documental, documentos e validações | Documentos enviados, pendentes e em revisão em linguagem simples |
| Processo e formalização | Timeline, proposta, contrato e gates sanitizados | Fase atual, marcos e próximo passo, sem detalhes internos |
| Entregas e continuidade | Relatórios, micro-entregas, jornada e legado | Entregas liberadas, atualizações e próximos marcos |

Estados cliente-facing:

- Em preparação
- Em andamento
- Aguardando sua ação
- Em validação
- Atualizado
- Concluído

Não usar porcentagem jurídica, score de elegibilidade, risco interno ou prazo institucional como indicador público.

---

## 4. Timeline dupla

A Timeline dupla deve ser implementada como duas visualizações do mesmo objeto `case_timeline_events`.

### Timeline de jornada

Mostra eventos de relacionamento e operação:

- Primeiro contato;
- Discovery;
- proposta;
- confirmação formal;
- contrato;
- pagamento;
- onboarding;
- início de caso;
- relatórios;
- entregas;
- protocolo, se aplicável;
- continuidade.

### Timeline familiar e genealógica

Mostra apenas eventos históricos aprovados:

- nascimento;
- casamento;
- migração;
- residência;
- registro militar;
- documentos localizados;
- marcos de origem;
- achados aprovados;
- encontros de linhagem aprovados.

A Home pode mostrar os próximos marcos da jornada e um resumo de marco familiar; páginas específicas apresentam a profundidade.

Não exibir nomes de SKU em eventos da timeline cliente-facing. Em vez de “CA-CID-002”, usar “Etapa documental”, “Plano de pesquisa”, “Acompanhamento familiar” ou nome comercial aprovado.

---

## 5. Fases e entregas

### Fase 1 — Diagnóstico e Direcionamento

Exibir somente se estiver contratada ou liberada pelo `case_service`.

Conteúdo:

- leitura inicial;
- síntese aprovada;
- checklist inicial;
- relatório Fase 1, quando aprovado;
- próximos passos.

### Fase 2 — Pesquisa Genealógica e Evidências

Exibir somente após contratação/escopo correspondente e touchpoint de onboarding aplicável.

Conteúdo:

- plano de pesquisa;
- documentos e fontes aprovados para o cliente;
- árvore/linha do tempo sanitizada;
- relatório Fase 2, quando aprovado;
- atualizações de achados/micro-entregas.

### Upsell e continuidade

Não fazer upsell automático para clientes que já contrataram pesquisa completa, como Ana Luiza e João. Para esses casos:

- marcar `upsell_status = not_applicable` ou `hold`;
- não mostrar CTA de Fase 2;
- só liberar oferta contextual quando houver produto complementar homologado e decisão humana.

---

## 6. Documentos

A área Documentos deve ser uma área principal do App, antes de Entregas. O checklist não deve ficar dentro de Entregas.

### Ordem interna da área Documentos

1. **Ação necessária agora**
   - checklist de documentos pessoais do usuário;
   - pendências com prazo e explicação simples;
   - botão de upload, quando habilitado.

2. **Enviados por você**
   - log: documento, data de envio, status, observação;
   - vínculo a pessoa correta;
   - histórico de reenvio quando houver.

3. **Em validação**
   - estado simples: recebido, em revisão, pendência, validado;
   - sem mostrar análise interna ou risco jurídico.

4. **Biblioteca familiar aprovada**
   - documentos históricos/evidências liberadas;
   - miniatura, quando autorizada;
   - link interno convertido em acesso seguro ou visualização autorizada;
   - distinção clara entre documento pessoal e acervo histórico.

5. **Organização em andamento**
   - deve ficar no topo, logo após Ação necessária, não no fim.
   - mostra que a equipe está organizando e validando o acervo já recebido.

### Fontes de checklist

O checklist pessoal vem de `document_requests` e do contrato/anexos aplicáveis ao participante. O checklist do processo vem de `case_service`, trilha e planejamento interno, mas o App mostra apenas a parte autorizada e relevante ao usuário.

---

## 7. Personalização familiar e acesso

### Modelo de acesso

Cada acesso no App é uma combinação de `account`, `family_member`, `case_id` e `access_scope`.

| Cenário | Acesso |
|---|---|
| Você sozinho | Vê sua jornada, documentos, entregas e árvore aprovada |
| Você + cônjuge | Cada um vê seus documentos; ambos veem a jornada compartilhada e entregas familiares autorizadas |
| Você + cônjuge + filhos | Responsável legal vê documentos/pendências dos menores autorizados; demais acessos são individualizados |
| Ana + pai + irmã | Cada adulto vê seu checklist pessoal, documentos pessoais e entregas autorizadas; todos veem jornada compartilhada aprovada |
| João + esposa | João é pagante; ambos acessam jornada compartilhada; documentos e pendências são individuais por pessoa |

`pagante` não significa acesso exclusivo. Pagamento é um papel financeiro; acesso é controlado por vínculo, contrato, consentimento e escopo.

### Árvores por participante

A árvore deve ser contextual:

- Ana vê seu pai e gerações anteriores, além do filho quando autorizado.
- Adair vê sua linha e gerações anteriores.
- Alice vê sua linha e gerações anteriores.
- João e esposa veem a árvore/jornada comum conforme escopo aprovado.
- G5, G6 e anteriores podem aparecer quando validados e aprovados; não limitar visualização a poucas gerações.

---

## 8. Legado e conta

A área **Legado** tem acesso comum na estrutura, mas conteúdo adaptado por contrato/anexos e permissões.

Conteúdos possíveis:

- relatórios aprovados;
- linha do tempo familiar aprovada;
- árvore sanitizada;
- encontros de linhagem;
- biblioteca histórica autorizada;
- arquivos de memória/legado;
- documentação de continuidade e pós-reconhecimento, se aplicável.

A área **Conta** mostra apenas dados do próprio usuário, permissões, vínculo familiar, papéis e dados de acesso. Não mostra contrato bruto, dados de terceiros, preço técnico ou informação financeira de outra pessoa.

---

## 9. Propostas e Ancestral Blueprint

O motor de proposta deve ficar no Desk, não no App Cliente.

```text
Discovery + Brief
→ case_service
→ Blueprint Parameters
→ proposta Canva vertical/WhatsApp
→ proposta registrada
→ conferência de escopo
→ timeline e log
```

### Blueprint

`blueprint_parameters` recebe dados estruturados repetíveis:

- produto-pai;
- trilha;
- família e participantes;
- escopo;
- fases da jornada;
- entregas;
- critérios de aceite;
- preço/condição/parcelas homologados;
- despesas de terceiros;
- versão de proposta;
- conteúdo aprovado para proposta.

O Roteiro Master é referência de Discovery e Brief; não é repetido no contrato ou proposta. A proposta recebe somente síntese de escopo/fases/entregas aprovada.

### Log de propostas

Toda proposta deve gerar `proposal_timeline_event`:

- proposta criada;
- versão;
- data;
- origem Blueprint;
- Canva reference interna;
- status enviada/aceita/substituída/recusada;
- responsável;
- eventos seguintes.

No App, o cliente vê apenas estado simplificado da jornada quando autorizado; nunca código do Blueprint, SKU técnico ou link interno Canva.

---

## 10. Automação Drive futura

A criação de arquivos/pastas do Drive é automação futura por evento e confirmação.

| Estado | Fila Drive |
|---|---|
| Oportunidade | Não cria dossiê operacional |
| Confirmação formal | Item bloqueado em fila, sem execução |
| Contrato assinado + pagamento confirmado | `ready_for_review` |
| Aprovação humana | `approved` |
| Execução futura | `executed` com referência de resultado |

Nunca criar ou apagar arquivos automaticamente sem gate e registro.

---

## 11. Critérios de aceite

1. Home mostra quatro eixos, não só linha de origem.
2. Timeline começa no primeiro contato e mostra jornadas e marcos familiares separados.
3. Fase 1/Fase 2 aparecem somente conforme contrato, escopo e touchpoints.
4. Ana e João não recebem upsell de Fase 2 se pesquisa completa já estiver contratada.
5. Documentos ficam antes de Entregas e têm checklist, upload, log e biblioteca autorizada.
6. Cada usuário vê documentos pessoais próprios; compartilhados dependem de acesso.
7. Pagante não monopoliza acesso da jornada compartilhada.
8. Árvore mostra gerações profundas autorizadas e contextualizadas por participante.
9. Timeline do cliente não mostra SKU técnico.
10. Proposta é gerada no Desk pelo Blueprint e registrada no log.
11. Drive permanece fila futura, sem execução.
