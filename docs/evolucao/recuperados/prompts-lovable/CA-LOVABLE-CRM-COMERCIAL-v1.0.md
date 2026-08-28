# CA-LOVABLE-CRM-COMERCIAL-v1.0

**Versão:** 1.0  
**Data:** 21/08/2026  
**Destino:** Lovable — Soul Ancestry  
**Tipo:** Prompt executável de restauração funcional  
**Escopo:** CRM Vivo → Leads e triagem, Propostas, Clientes e núcleos; fluxo comercial e evidências de aceite.

---

## Prompt para colar no Lovable

```text
IMPLEMENTAR E RESTAURAR O FLUXO COMERCIAL CANÔNICO DENTRO DA ESTRUTURA ATUAL DO SOUL ANCESTRY.

IMPORTANTE:
- Não criar novas abas principais.
- Não redesenhar a navegação de primeiro nível.
- Preservar as 7 áreas do Desk Intelligence.
- Usar somente as subáreas existentes em CRM Vivo: Leads e triagem, Propostas, Clientes e núcleos.
- Não criar contratos, OS, links Asaas, cobranças, assinaturas, mensagens externas, pesquisas externas ou integrações externas nesta entrega.
- Não preencher dados reais ausentes por inferência.
- Não substituir dados reais por fixtures.

OBJETIVO
Transformar CRM Vivo em um fluxo operacional rastreável para contatos, conversas, Discovery, oportunidades, propostas, aceite verbal, confirmação formal, formalização pendente, próxima ação e histórico. O Desk/Supabase é a fonte canônica para novos registros. Placego poderá ser usado somente para importação futura de contatos, não como fonte operacional contínua.

ESTRUTURA DE INTERFACE

1. CRM Vivo → Leads e triagem
Exibir:
- contatos e oportunidades;
- origem conhecida;
- responsável nominal;
- etapa comercial;
- país/trilha preliminar, quando informados;
- próxima ação e prazo;
- alertas de ação vencida;
- botão para registrar contato, conversa, Discovery e oportunidade;
- filtros por etapa, responsável, origem, próxima ação e bloqueio.

2. CRM Vivo → Propostas
Exibir:
- propostas internas referenciadas;
- oportunidade vinculada;
- escopo resumido;
- produto/serviço somente se homologado;
- condição comercial e estado de homologação;
- estado de aceite;
- estado de formalização;
- bloqueios para preparação interna de contrato;
- histórico de eventos.

3. CRM Vivo → Clientes e núcleos
Exibir:
- pessoas, núcleos familiares e casos vinculados;
- contratante, titulares, dependentes e representação;
- estado cadastral;
- caso, trilha, formalização, onboarding e próxima ação;
- sem expor CPF completo, documentos civis ou dados sensíveis em listagens.

MODELO OPERACIONAL

Criar ou ajustar entidades persistidas sob RLS:

A. contacts
- id
- nome
- email, quando informado
- telefone, quando informado
- origem
- origem_detalhe
- responsavel_user_id
- status
- created_at
- updated_at
- archived_at

B. opportunities
- id
- contact_id
- case_id opcional
- objetivo_declarado
- pais_linha_prioritaria opcional
- citizenship_track_id opcional
- via_preliminar opcional
- etapa_comercial
- responsavel_user_id
- proxima_acao
- prazo_proxima_acao
- resumo_interno
- created_at
- updated_at

C. crm_interactions
- id
- contact_id opcional
- opportunity_id opcional
- case_id opcional
- tipo: call | reuniao | whatsapp_registrado | email_registrado | nota_interna | proposta
- direcao: inbound | outbound | internal
- ocorreu_em
- origem_referencia_interna opcional
- resumo_validado
- consentimento_gravacao quando aplicável
- proxima_acao
- prazo_proxima_acao
- responsavel_user_id
- created_at
- imutável após criação, com correção por novo registro que referencia o anterior

D. discovery_assessments
- id
- interaction_id
- opportunity_id
- objetivo_principal
- estrutura_familiar
- ascendente_ou_geracao_informada
- linha_transmissao
- estado_documental_inicial
- complexidade_percebida
- pais_linha_prioritaria
- via_preliminar
- sinal_aderencia_preliminar
- confianca_triagem
- riscos_internos
- notas_internas
- created_at

E. conversion_events
- id
- contact_id opcional
- opportunity_id opcional
- case_id opcional
- tipo_evento
- ocorreu_em
- responsavel_user_id
- evidencia_referencia_interna opcional
- observacao_interna
- created_at
- imutável

EVENTOS PERMITIDOS
- lead_criado
- lead_qualificado
- discovery_agendada
- discovery_realizada
- proposta_em_preparacao
- proposta_enviada
- aceite_verbal_confirmado
- confirmacao_formal_pendente
- confirmacao_formal_recebida
- formalizacao_em_preparacao
- contrato_enviado
- contrato_assinado
- pagamento_inicial_confirmado
- onboarding_iniciado
- caso_ativo
- perdido

REGRAS DE NEGÓCIO

1. Nenhum lead ou oportunidade ativa pode ficar sem:
- responsável nominal;
- próxima ação;
- prazo de próxima ação.

2. Aceite verbal:
- cria evento aceite_verbal_confirmado;
- não cria cliente ativo;
- não libera contrato, cobrança, assinatura, onboarding, pesquisa externa ou App Cliente;
- próxima ação padrão: solicitar confirmação formal por escrito.

3. Confirmação formal:
- exige referência interna a WhatsApp, e-mail, print ou outro registro verificável;
- cria evento confirmacao_formal_recebida;
- pode liberar somente a preparação interna de formalização;
- não cria automaticamente contrato, cobrança, assinatura, pagamento ou onboarding.

4. Produto, preço, escopo e condição:
- somente produtos homologados e vigentes podem ser selecionados em proposta;
- preço e condição são somente leitura quando vierem do catálogo homologado;
- exceção comercial só pode existir com justificativa, responsável, validade e aprovação;
- não criar nem alterar preço, SKU, cobrança ou link externo nesta entrega.

5. Histórico:
- toda mudança relevante de etapa comercial, aceite, proposta, responsável ou próxima ação cria registro auditável;
- não apagar fisicamente eventos e interações;
- usar arquivamento lógico quando necessário.

CASO ANA — OBRIGATÓRIO

Aplicar o fluxo ao caso CA-CID-AT-FAM-2026-001 sem criar atos externos.

Manter:
- confirmação formal existente como referência interna;
- formalização em preparação;
- estado operacional bloqueado;
- proposta vencida/incompleta como bloqueio quando aplicável;
- cadastro, condição comercial, case_service, critérios de aceite e matriz jurídica como gates separados;
- Felipe sem contrato, App Cliente ou anexo individual enquanto representação não estiver documentada.

Não:
- gerar contrato;
- gerar OS;
- cobrar;
- enviar mensagem;
- iniciar onboarding;
- liberar pesquisa externa;
- ativar App Cliente.

SEGURANÇA
- Aplicar RLS por organização/caso e autorização da equipe.
- Dados pessoais sensíveis não podem aparecer em listagem ampla.
- Auditoria sanitizada: sem CPF completo, valores sensíveis em log ou conteúdo de documento.
- Bloquear exclusão física de interações e eventos relevantes.

CRITÉRIOS DE ACEITE
- CRM Vivo preserva as subáreas existentes, sem aba global nova.
- É possível registrar contato, oportunidade, interação e Discovery.
- É possível registrar proposta como referência interna.
- Aceite verbal e confirmação formal são estados/eventos distintos.
- Nenhuma oportunidade ativa fica sem responsável, próxima ação e prazo.
- Confirmação formal não dispara contrato, cobrança, assinatura ou onboarding.
- Histórico e auditoria persistem após recarregar a página.
- Ana aparece como formalização em preparação e bloqueada, sem ação externa criada.
- Build, typecheck e testes aplicáveis ficam limpos.

ANTES DE IMPLEMENTAR
Apresente o plano de arquivos, migrations, políticas RLS, componentes e testes. Não ampliar escopo.

AO FINAL
Informe:
- migrations/tabelas alteradas;
- componentes/rotas alterados;
- testes executados;
- commit identificável;
- como validar no App cada etapa acima.
```
