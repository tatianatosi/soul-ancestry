# CA-LOVABLE-PESQUISA-GENEALOGICA-v1.0

**Versão:** 1.0  
**Data:** 21/08/2026  
**Destino:** Lovable — Soul Ancestry  
**Tipo:** Prompt executável de restauração funcional  
**Escopo:** Casos 360 → Pesquisa Genealógica e Evidências; Ficha Genealógica; fontes, documentos, evidências, achados, relatórios F1/F2 e alertas.

---

## Prompt para colar no Lovable

```text
RESTAURAR E CONSOLIDAR A ÁREA OPERACIONAL “PESQUISA GENEALÓGICA E EVIDÊNCIAS” DENTRO DE CASOS 360 NO SOUL ANCESTRY.

IMPORTANTE:
- Não criar nova aba principal.
- Não redesenhar a navegação de primeiro nível.
- Substituir/renomear a subárea visual genérica “Pesquisa e evidências” para “Pesquisa Genealógica e Evidências”.
- Manter tudo dentro de Casos 360, usando seções/painéis contextuais internos.
- Não iniciar pesquisa externa, contatos com cartórios/arquivos, solicitações de certidão, OCR, IA, automação de extração, mensagens, contratos, cobranças ou publicação automática.
- Não criar genealogia, relações, datas, linhagens ou fatos por suposição.
- Não usar dados reais como fixtures.

OBJETIVO
Restaurar a cadeia integral da pesquisa genealógica: ficha, pessoas, relações, ramos, eventos, linhagens, fontes, documentos, evidências, validações, pendências, achados, alertas, relatórios F1/F2 e entregas sanitizadas.

REGRA DE CADEIA

Ficha genealógica
→ pessoa, relação, evento, ramo, linhagem ou lacuna

Fonte/documento
→ material bruto recebido ou referência externa

Evidência
→ interpretação revisável e vinculada a fonte/pessoa/pesquisa

Validação
→ confirma, diverge, é insuficiente ou gera pendência

Achado
→ conclusão operacional interna revisada

Relatório F1/F2 ou entrega ao cliente
→ somente versão sanitizada aprovada/publicada

App Cliente
→ somente projeção autorizada, publicada e compatível com acesso

SEÇÕES INTERNAS DA ÁREA

1. Visão de pesquisa
- objetivo;
- trilha/caso;
- status;
- autorização;
- responsável;
- hipótese interna;
- próximo marco;
- próxima ação e prazo;
- alertas ativos.

2. Ficha Genealógica
- pessoas e perfis genealógicos;
- variantes de nome;
- relações;
- eventos;
- linhagens;
- árvore interna derivada;
- timeline interna derivada;
- lacunas de pesquisa;
- nível de confiança e vínculos de evidência.

3. Pessoas, famílias e ramos
- ascendentes, descendentes e familiares;
- geração;
- relação/linha de transmissão;
- localidade;
- estado de identificação;
- vínculo com fontes, evidências e eventos.

4. Fontes e documentos
- preservar o G-08 dentro de Pesquisa Transversal/Pesquisa Genealógica e Evidências conforme estrutura atual;
- fontes/documentos brutos privados;
- catálogo controlado de tipo;
- pessoa relacionada;
- origem;
- status;
- metadados;
- edição auditada;
- arquivamento lógico com motivo.

5. Evidências e validação
- evidências vinculadas a pesquisa, pessoa e fonte;
- status de evidência;
- revisor;
- data de revisão;
- observação interna;
- revisão jurídica quando aplicável;
- pendências derivadas, sem automação externa.

6. Achados e microentregas
- achado interno;
- status de revisão;
- opção de preparar uma entrega sanitizada separada;
- nunca projetar evidência diretamente para o App Cliente.

7. Relatórios F1/F2
- lista de relatórios por caso;
- tipo: F1 ou F2;
- estado: rascunho_interno | em_revisao | aprovado_interno | publicado_cliente | arquivado;
- vínculo com evidências/achados internos;
- versão, responsável, data e referência;
- relatório não publicado nunca aparece no App Cliente.

8. Alertas e histórico
- tarefas/pêndencias;
- próxima ação;
- prazo;
- responsável;
- alertas internos;
- auditoria de mudanças;
- rascunhos de comunicação somente internos, sem envio.

MODELO DE DADOS

A. research_items
- id
- case_id
- family_id opcional
- citizenship_track_id opcional
- research_type
- objective
- internal_hypothesis
- status
- authorization_status
- authorized_scope
- responsible_user_id
- next_action
- next_action_due_at
- next_milestone
- created_at
- updated_at

Status de pesquisa controlados:
- nao_iniciada
- preparacao_pendente
- aguardando_autorizacao
- em_andamento
- aguardando_cliente
- aguardando_terceiro_ou_arquivo
- em_revisao
- pausada
- concluida_parcialmente
- concluida
- arquivada

B. research_people
- id
- research_item_id
- family_member_id opcional
- genealogical_person_profile_id opcional
- nome
- variante_nome
- papel_na_linhagem
- geracao
- linha_transmissao
- pais_localidade
- nascimento_aproximado opcional
- obito_aproximado opcional
- observacao_interna
- status_identificacao
- created_at
- updated_at

C. research_sources
- id
- research_item_id
- source_type
- source_name
- source_location
- source_url_internal
- access_level
- consulted_at
- consulted_by
- result_summary_internal
- status
- created_at

D. evidences
- id
- case_id
- research_item_id
- research_person_id opcional
- source_id opcional
- evidence_type
- title_internal
- description_internal
- reference_date opcional
- reference_location opcional
- storage_url_internal opcional
- access_level
- status
- validation_notes_internal
- reviewed_by
- reviewed_at
- legal_review_status
- created_at
- updated_at

Status de evidência controlados:
- recebida
- registrada
- em_revisao
- validada_internamente
- divergente
- insuficiente
- requer_complemento
- requer_retificacao
- requer_traducao_ou_apostila
- rejeitada_ou_inaplicavel
- aprovada_para_entrega_cliente
- publicada_ao_cliente

REGRA: validada_internamente nunca significa cidadania reconhecida, direito confirmado, conclusão jurídica ou via aprovada.

E. research_findings
- id
- case_id
- research_item_id
- evidence_id opcional
- titulo_interno
- resumo_interno
- confidence
- review_status
- client_projection_status
- responsible_user_id
- created_at
- updated_at

F. research_reports
- id
- case_id
- tipo_relatorio: F1 | F2
- titulo
- status
- version
- internal_reference
- evidence_summary_internal
- approved_summary_client opcional
- responsible_user_id
- approved_by
- approved_at
- published_at
- created_at
- updated_at

FICHA GENEALÓGICA

Restaurar/preservar entidades e interface para:
- perfis genealógicos;
- variantes de nome;
- relações familiares;
- eventos genealógicos;
- caminhos de linhagem;
- árvore interna;
- timeline interna;
- lacunas de pesquisa.

Regras:
- não permitir criar relação, evento, data ou linhagem por simples upload;
- exigir origem/evidência ou marca explícita de hipótese interna;
- relações e dados que sejam mostrados ao cliente precisam de aprovação/visibilidade própria;
- exclusão física de dados críticos bloqueada; usar arquivamento lógico e auditoria.

GATILHOS INTERNOS

Quando houver mudança de evidência, criar apenas alertas/tarefas internas:
- recebida: tarefa de triagem;
- em_revisao: tarefa para responsável;
- divergente: alerta crítico interno;
- insuficiente/requer complemento: próxima ação datada;
- requer retificação: pendência interna;
- requer tradução/apostila: pendência interna sem criar despesa;
- validada internamente: permitir criar rascunho de microentrega, sem publicação automática;
- nova pessoa/ramo: atualizar apenas estrutura interna e criar tarefa de revisão;
- aguardando terceiro/arquivo: prazo de rechecagem.

NUNCA:
- enviar WhatsApp automaticamente;
- publicar no App Cliente automaticamente;
- iniciar pesquisa externa;
- disparar OCR, IA ou extração;
- alterar contrato/cobrança;
- concluir decisão jurídica.

VISIBILIDADE APP CLIENTE

- Fonte bruta, URL interna, documento, evidência, hipótese, risco, nota interna e achado não aprovado nunca aparecem.
- Árvore, timeline, relatório e documento só podem aparecer por projeção explícita aprovada/publicada.
- Relatórios F1/F2 exigem estado publicado_cliente e conteúdo sanitizado separado.
- Legado continua seguindo legado-visibilidade.ts, sem receber evidência bruta.

CASO ANA — OBRIGATÓRIO

Para CA-CID-AT-FAM-2026-001:
- criar/restaurar a área completa sem iniciar pesquisa externa;
- status inicial de pesquisa: preparacao_pendente;
- autorização de pesquisa: pendente;
- permitir cadastrar fontes/documentos já existentes como referência interna privada;
- não preencher pessoas, relações, eventos, linhagens ou evidências por suposição;
- não criar conteúdo publicado no App Cliente;
- não alterar bloqueios de formalização, onboarding, contrato ou financeiro.

SEGURANÇA
- RLS por caso, organização e usuário autorizado.
- Storage privado e URLs temporárias/assinadas quando aplicável.
- Auditoria sanitizada.
- Sem exposição de dados de outro caso.
- Exclusão física bloqueada para fontes, evidências, achados e registros críticos.

CRITÉRIOS DE ACEITE
- A subárea chama-se Pesquisa Genealógica e Evidências.
- Não existem novas abas principais.
- Ficha Genealógica, fontes, evidências, validação, achados, relatórios F1/F2 e alertas ficam no mesmo eixo operacional.
- Documento/Fonte, Evidência, Achado e Entrega ao Cliente são entidades distintas.
- Upload não cria genealogia automaticamente.
- Evidência validada não vira conclusão jurídica automática.
- F1/F2 não aparecem no App Cliente sem aprovação/publicação.
- Ana permanece sem pesquisa externa e sem conteúdo cliente publicado.
- Build, typecheck e testes aplicáveis ficam limpos.

ANTES DE IMPLEMENTAR
Apresente plano de arquivos, migrations, RLS, storage, componentes e testes.

AO FINAL
Informe migrations/tabelas, rotas/componentes, testes, commit identificável e roteiro visual de validação.
```
