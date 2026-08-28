# Clube Ancestral — Prompts Lovable: App Cliente, Jornada, Documentos e Propostas

**Versão:** 1.0  
**Data:** 20 de agosto de 2026  
**Uso:** aplicar em cortes sequenciais. Não aplicar mais de um corte sem validar o anterior.

---

## Ordem

1. App Home: quatro eixos e timeline dupla.
2. Documentos: checklist, log, biblioteca e organização.
3. Acesso familiar e árvore contextual.
4. Fases/entregas/upsell conforme escopo.
5. Blueprint e log de propostas.
6. Fila Drive futura.

---

## Prompt 1 — Home, Radar e Timeline dupla

```text
IMPLEMENTAR A HOME DO APP CLIENTE COM JORNADA PARAMETRIZADA, RADAR DE QUATRO EIXOS E TIMELINE DUPLA.

NÃO ALTERAR CONTRATOS, COBRANÇAS, LINKS ASAAS, DADOS FINANCEIROS, PESQUISA EXTERNA, MENSAGENS EXTERNAS OU PUBLICAÇÕES AUTOMÁTICAS.

A Home deve ser baseada em:
case_service + escopo aprovado + núcleo familiar + contrato/anexos aplicáveis + timeline operacional + documentos/evidências aprovados + touchpoints.

Criar blocos nesta ordem:
1. Seu momento atual.
2. Radar da Jornada — quatro eixos.
3. Linha do tempo da jornada.
4. Documentos que precisam de você.
5. Última entrega aprovada.

Radar quatro eixos:
- Origem e linhagem.
- Documentos e prontidão.
- Processo e formalização.
- Entregas e continuidade.

Estados cliente-facing:
Em preparação; Em andamento; Aguardando sua ação; Em validação; Atualizado; Concluído.

Não mostrar porcentagem jurídica, score de elegibilidade, risco interno, fonte crua, SKU, preço ou links técnicos.

Timeline dupla deve usar o mesmo objeto case_timeline_events:
A. Timeline de jornada: primeiro contato, Discovery, proposta, confirmação formal, contrato, pagamento, onboarding, documentos, relatórios, entregas, protocolo e continuidade.
B. Timeline familiar/genealógica: apenas eventos históricos aprovados.

Home mostra próximos marcos de jornada e resumo familiar aprovado. Páginas específicas mostram profundidade.

Não mostrar código SKU em timeline cliente-facing. Usar nomes de etapa aprovados.

Criar testes para: timeline desde primeiro contato, evento interno não publicado, radar sem score jurídico e ausência de dados exibida como “Em preparação”/“Sem atualização”.
```

---

## Prompt 2 — Área Documentos

```text
REORGANIZAR A ÁREA DOCUMENTOS DO APP CLIENTE.

NÃO HABILITAR UPLOAD REAL, NÃO CRIAR PASTAS, NÃO MOVER ARQUIVOS, NÃO COMPARTILHAR DRIVE, NÃO PUBLICAR DOCUMENTO NÃO AUTORIZADO.

A área Documentos deve vir antes de Entregas e ter esta ordem:
1. Ação necessária agora.
2. Organização em andamento.
3. Enviados por você.
4. Em validação.
5. Biblioteca familiar aprovada.

Ação necessária agora:
- checklist de documentos pessoais do usuário;
- pendência, prazo e explicação simples;
- CTA de upload somente se capacidade já estiver autorizada.

Organização em andamento:
- mostrar que a equipe está organizando/validando acervo já recebido;
- não colocar no fim da página.

Enviados por você:
- documento, data de envio, status, observação sanitizada e histórico de reenvio;
- log individual por pessoa.

Em validação:
- recebido, em revisão, pendência, validado;
- nunca mostrar análise interna, hipótese ou risco jurídico.

Biblioteca familiar aprovada:
- documentos/evidências históricas liberadas;
- miniatura apenas quando autorizada;
- acesso seguro, sem URL interna crua;
- distinguir documento pessoal de acervo histórico.

Checklist pessoal vem de document_requests/contrato/anexos do participante. Checklist de processo vem de case_service/trilha, mas só a parte autorizada é exibida.

Criar testes de isolamento de documentos pessoais, biblioteca aprovada, ordem da página e log de envio.
```

---

## Prompt 3 — Acesso familiar e árvore contextual

```text
IMPLEMENTAR ACESSO FAMILIAR PARAMETRIZADO E ÁRVORE CONTEXTUAL NO APP CLIENTE.

NÃO ALTERAR PERMISSÕES REAIS EXTERNAS, NÃO CONVIDAR USUÁRIOS, NÃO ENVIAR LINKS, NÃO PUBLICAR ÁRVORE SEM PROJEÇÃO APROVADA.

Criar modelo de acesso:
account + family_member + case_id + access_scope.

Regras:
- Pagante é papel financeiro, não acesso exclusivo.
- Cada adulto vê documentos e pendências próprios.
- Jornada compartilhada aparece para participantes autorizados.
- Responsável legal pode ver documentos/pendências de menor quando autorizado.
- Dados de terceiros exigem permissão/escopo.

Cenários de teste:
1. Pessoa individual.
2. Casal.
3. Casal com filhos.
4. Ana + pai + irmã + dependente.
5. João + esposa, João pagante e ambos com jornada compartilhada.

Árvore contextual:
- usuário vê a linha aprovada relevante a ele;
- Ana vê pai e gerações anteriores, além do filho quando autorizado;
- Adair/Alice têm perspectiva própria;
- suportar G5, G6 e anteriores sem limite de gerações;
- relações/fatos apenas aprovados e sanitizados;
- não expor fontes, hipóteses, score, risco, URLs ou dados não autorizados.

Criar testes de escopo de acesso e ausência de vazamento entre participantes.
```

---

## Prompt 4 — Fases, Entregas e Upsell

```text
IMPLEMENTAR VISIBILIDADE DE FASES, ENTREGAS E UPSELL CONFORME ESCOPO.

NÃO GERAR OFERTA, COBRANÇA, LINK, MENSAGEM, POPUP COMERCIAL OU UPSELL AUTOMÁTICO.

Fase 1 — Diagnóstico e Direcionamento:
Mostrar apenas se contratada/liberada pelo case_service. Exibir leitura inicial, síntese aprovada, checklist inicial, relatório F1 aprovado e próximos passos.

Fase 2 — Pesquisa Genealógica e Evidências:
Mostrar apenas se contratada e após touchpoint/onboarding aplicável. Exibir plano de pesquisa, documentos autorizados, árvore/timeline aprovada, relatório F2 aprovado e micro-entregas.

Upsell:
- Ana Luiza e João já contrataram pesquisa completa; definir upsell_status = not_applicable ou hold para Fase 2.
- Não mostrar CTA de Fase 2 a eles.
- Produtos complementares só aparecem após produto homologado, case_service contextual e decisão humana.

Renomear “Entrega” para “Entregas da Jornada” ou “Minhas Entregas”, conforme linguagem aprovada.

Separar:
- Entregas robustas: F1/F2 e relatórios.
- Micro-entregas: atualização breve aprovada.
- Próximo passo: ação do cliente/equipe, não entrega.

Criar testes de fase não contratada oculta, pesquisa completa sem upsell e entrega não aprovada invisível.
```

---

## Prompt 5 — Ancestral Blueprint e log de propostas

```text
IMPLEMENTAR MOTOR INTERNO DE PROPOSTAS ANCESTRAL BLUEPRINT E LOG DE PROPOSTAS.

NÃO CRIAR PROPOSTA CANVA REAL, NÃO ALTERAR CANVA, NÃO ENVIAR WHATSAPP, NÃO CRIAR CONTRATO, COBRANÇA OU LINK.

O motor fica no Desk, em Comercial/Propostas e Financeiro/Formalização.

Fluxo:
Discovery + Brief → case_service → blueprint_parameters → proposta Canva vertical/WhatsApp futura → proposta registrada → conferência de escopo → timeline/log.

Blueprint recebe apenas dados estruturados aprovados:
- produto-pai;
- trilha;
- núcleo/participantes;
- escopo;
- fases;
- entregas;
- critérios de aceite;
- preço/condição/parcelas/vigência homologados;
- despesas de terceiros;
- versão;
- conteúdo aprovado para proposta.

Roteiro Master não é duplicado. Ele orienta Discovery/Brief; Blueprint recebe síntese aprovada.

Criar proposal_timeline_events:
- proposal_id
- case_id/opportunity_id
- event_type
- proposal_version
- blueprint_version
- canva_reference_interna
- status: rascunho, preparada, enviada, aceita, substituída, recusada, expirada
- occurred_at
- responsável
- resumo_interno
- source_entity_reference

App Cliente nunca mostra blueprint, referência Canva interna, SKU técnico ou preço técnico.

Criar testes de parâmetro faltante, preço fora do catálogo, evento de proposta e ausência de duplicação do Roteiro Master.
```

---

## Prompt 6 — Drive provisionamento futuro

```text
IMPLEMENTAR APENAS A FILA DE PROVISIONAMENTO DRIVE FUTURO.

NÃO CRIAR, MOVER, COMPARTILHAR OU EXCLUIR PASTAS/ARQUIVOS NO DRIVE.

Criar drive_provisioning_queue:
- case_id
- family_id
- stage_trigger
- requested_structure
- required_gates
- status: blocked, ready_for_review, approved, executed, failed, cancelled
- approval_required
- approved_by
- approved_at
- external_result_reference
- error_message
- created_at
- updated_at

Regras:
- Oportunidade não cria dossiê operacional.
- Confirmação formal cria apenas item blocked.
- Contrato assinado + pagamento confirmado + onboarding aprovado tornam ready_for_review.
- approved exige confirmação humana futura.
- executed exige referência de resultado.
- Nunca excluir automaticamente.

Criar testes de Oportunidade bloqueada, gates incompletos, ready_for_review e inexistência de execução Drive.
```
