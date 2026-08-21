insert into public.message_template_categories (organization_id, key, name, description, sort_order)
select o.id, c.key, c.name, c.description, c.sort_order
from public.organizations o
cross join (values
  ('comercial','Comercial','Funil: proposta, follow-up, aceite verbal e confirmação formal.',10),
  ('formalizacao','Formalização','Contrato, anexo e ordem de serviço.',20),
  ('financeiro','Financeiro','Mensagens sobre pagamento já confirmado na fonte transacional.',30),
  ('onboarding','Onboarding','Boas-vindas, plano de ação e primeira micro-entrega.',40),
  ('documentos','Documentos','Recebimento, revisão e pedido de nova versão.',50),
  ('atualizacao_contextual','Atualização contextual','Cadência periódica e espera externa.',60),
  ('pesquisa','Pesquisa','Comunicação sobre pesquisa autorizada.',70),
  ('marketing_editorial','Marketing editorial','Conteúdo institucional, sem vínculo a pessoa identificável.',80),
  ('interno','Interno','Mensagens e avisos internos de operação.',90)
) as c(key,name,description,sort_order)
on conflict (organization_id, key) do nothing;

insert into public.message_templates
  (organization_id, category_id, key, name, objective, channel, stage_scope, audience,
   body, safe_variables, required_variables, prohibited_claims, status, version, effective_from)
select o.id, cat.id, t.key, t.name, t.objective, t.channel, t.stage_scope, t.audience,
       t.body, t.safe_vars::jsonb, t.req_vars::jsonb,
       '["promessa de resultado","estimativa de chance","valor ou cobranca nao homologada","dado sensivel"]'::jsonb,
       'vigente', 1, now()
from public.organizations o
join (values
  ('comercial','proposta_enviada','Proposta enviada','Confirmar o envio da proposta sem pressionar decisão.','whatsapp','proposta_enviada','lead',
   'Oi, {nome}! Te enviei a proposta com o caminho que desenhamos para {objetivo}. Leia com calma; se fizer sentido, podemos ajustar qualquer ponto antes de você decidir. Estou por aqui.','["nome","objetivo"]','["nome"]'),
  ('comercial','followup_proposta','Follow-up de proposta','Retomar contato sem criar urgência artificial.','whatsapp','proposta_enviada','lead',
   'Oi, {nome}! Passando para saber se conseguiu olhar a proposta. Não precisa decidir com pressa — queria apenas entender se ficou alguma dúvida ou se faz sentido ajustarmos algo.','["nome"]','["nome"]'),
  ('comercial','aceite_verbal','Aceite verbal','Registrar aceite verbal e pedir confirmação escrita.','whatsapp','aceite_verbal_confirmado','lead',
   'Fico muito feliz em seguirmos juntos, {nome}. Vou registrar nossa conversa como aceite verbal e, para avançarmos com segurança, vou te pedir uma confirmação escrita simples por aqui.','["nome"]','["nome"]'),
  ('comercial','confirmacao_formal_pedido','Confirmação formal (pedido)','Solicitar a confirmação escrita após o aceite verbal.','whatsapp','aceite_verbal_confirmado','lead',
   'Oi, {nome}! Fiquei muito feliz com a sua decisão de avançar com o {servico}.

Para eu registrar direitinho esse próximo passo, você pode me confirmar por escrito aqui no WhatsApp que está de acordo em iniciar o {servico} nas condições que conversamos?

Pode responder algo simples como: “Confirmo que estou de acordo em iniciar o {servico} nas condições apresentadas.”

Assim que eu receber sua confirmação, preparo a formalização com calma e te explico os próximos passos.','["nome","servico"]','["nome","servico"]'),
  ('comercial','confirmacao_formal_recebida','Confirmação formal recebida','Acusar recebimento e explicar a etapa interna.','whatsapp','confirmacao_formal_recebida','contratante',
   'Obrigada, {nome}! Recebi sua confirmação e vou iniciar a preparação interna da formalização. Nesta etapa ainda vamos conferir cadastro, escopo e documentos necessários. Volto para você com a próxima orientação.','["nome"]','["nome"]'),
  ('formalizacao','pedido_dados_contrato','Pedido de dados para contrato','Pedir apenas dados de formalização.','whatsapp','confirmacao_formal_recebida','contratante',
   'Oi, {nome}! Para preparar a formalização com cuidado, preciso confirmar alguns dados cadastrais e a composição dos participantes. Vou te enviar uma lista objetiva; se preferir, podemos organizar isso por etapas.','["nome"]','["nome"]'),
  ('formalizacao','formalizacao_em_preparacao','Formalização em preparação','Atualizar sem confirmar contrato, valor ou cobrança.','whatsapp','formalizacao_em_preparacao','contratante',
   'Oi, {nome}! Estamos conferindo os dados e o escopo para que a formalização reflita exatamente o que foi combinado. Ainda não há nenhuma cobrança ou assinatura para você fazer neste momento; aviso assim que a próxima etapa estiver pronta.','["nome"]','["nome"]'),
  ('formalizacao','contrato_pronto','Contrato pronto para assinatura','Enviar somente após revisão interna aprovada.','whatsapp','contrato_enviado','contratante',
   'Oi, {nome}! A formalização foi preparada com base no escopo que confirmamos. Vou te enviar a versão para leitura e assinatura. Se houver qualquer dúvida antes de assinar, falamos e ajustamos com tranquilidade.','["nome"]','["nome"]'),
  ('formalizacao','contrato_assinado','Contrato assinado','Confirmar recebimento da assinatura.','whatsapp','contrato_assinado','contratante',
   'Obrigada, {nome}! Recebemos o contrato assinado. Agora vamos conferir a etapa financeira combinada e, assim que o pagamento inicial estiver confirmado, iniciamos oficialmente o onboarding.','["nome"]','["nome"]'),
  ('financeiro','pagamento_confirmado','Pagamento inicial confirmado','Comunicar pagamento já confirmado na fonte transacional.','whatsapp','pagamento_inicial_confirmado','contratante',
   'Oi, {nome}! Confirmamos o pagamento inicial. A partir de agora, seu caso entra no onboarding: você receberá o responsável, o checklist inicial e o plano dos próximos passos.','["nome"]','["nome"]'),
  ('onboarding','d0_boas_vindas','D0 — boas-vindas','Abrir o onboarding após ativação humana.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Seja bem-vindo(a) oficialmente ao Clube Ancestral. Seu caso já entrou em onboarding e {responsavel} será seu ponto principal de contato. Nos próximos dias, organizamos o checklist e o plano inicial de trabalho.','["nome","responsavel"]','["nome","responsavel"]'),
  ('onboarding','d1_d3_plano','D1–D3 — plano e checklist','Apresentar plano de ação e checklist.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Organizamos os primeiros passos do seu caso. Você receberá um checklist priorizado e o plano de ação inicial, para saber o que depende de nós e o que precisaremos de vocês.','["nome"]','["nome"]'),
  ('onboarding','d5_d7_microentrega','D5–D7 — primeira micro-entrega','Comunicar entrega aprovada e publicada.','whatsapp','primeira_microentrega','cliente_ativo',
   'Oi, {nome}! Temos uma primeira atualização do seu caso: {entrega}. Isso marca o início prático da nossa jornada. O próximo passo é {proximo_marco}.','["nome","entrega","proximo_marco"]','["nome","entrega","proximo_marco"]'),
  ('onboarding','call_onboarding','Agendamento da call de onboarding','Alinhar plano e marcos com o cliente.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Para alinharmos o início da jornada, gostaria de agendar nossa call de onboarding. Nela vamos revisar o plano, o checklist e os próximos marcos. Qual destes horários funciona melhor para você: {opcoes_horario}?','["nome","opcoes_horario"]','["nome","opcoes_horario"]'),
  ('documentos','documento_recebido','Documento recebido','Acusar recebimento sem validar conteúdo.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Recebemos o documento de {item}. Vamos revisá-lo internamente e, se precisarmos de complemento ou nova versão, explicaremos exatamente o que falta.','["item"]','["item"]'),
  ('documentos','pedido_reenvio','Pedido de reenvio','Pedir nova versão com motivo objetivo.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Para conseguirmos usar o documento de {item}, precisamos de uma nova versão porque {motivo}. Você consegue nos enviar {orientacao}? Se quiser, posso te orientar.','["nome","item","motivo","orientacao"]','["nome","item","motivo"]'),
  ('atualizacao_contextual','atualizacao_contextualizada','Atualização contextualizada','Cadência periódica com quatro campos.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Passando com uma atualização do seu caso: nesta etapa, avançamos em {trabalho_realizado} e a dependência atual é {dependencia}. Da sua parte: {acao_cliente}. O próximo marco é {proximo_marco}.','["nome","trabalho_realizado","dependencia","acao_cliente","proximo_marco"]','["nome","trabalho_realizado","dependencia","proximo_marco"]'),
  ('atualizacao_contextual','espera_externa','Espera externa','Explicar dependência de terceiro com data de revisão.','whatsapp','espera_externa','cliente_ativo',
   'Oi, {nome}! Seu caso está em uma etapa que depende de {orgao}. Enquanto aguardamos, seguimos monitorando e revisamos novamente em {data_revisao}. Assim que houver retorno, te aviso.','["nome","orgao","data_revisao"]','["nome","orgao","data_revisao"]'),
  ('pesquisa','pesquisa_autorizada','Pesquisa autorizada — início','Informar início de pesquisa já autorizada.','whatsapp','onboarding_iniciado','cliente_ativo',
   'Oi, {nome}! Com o material que já reunimos, iniciamos a etapa de pesquisa autorizada do seu caso. Vou te contar o que encontrarmos conforme cada achado for verificado internamente.','["nome"]','["nome"]'),
  ('interno','handoff_interno','Handoff interno de caso','Passagem de bastão entre comercial e operações.','interno','','interno',
   'Handoff do caso {item}: responsável anterior {responsavel}. Pendências: {dependencia}. Próximo marco: {proximo_marco}.','["item","responsavel","dependencia","proximo_marco"]','["item","responsavel"]')
) as t(cat_key,key,name,objective,channel,stage_scope,audience,body,safe_vars,req_vars) on true
join public.message_template_categories cat
  on cat.organization_id = o.id and cat.key = t.cat_key
on conflict (organization_id, key) do nothing;

insert into public.editorial_content_items
  (organization_id, title, content_type, theme, funnel_stage, target_audience, status)
select o.id, e.title, e.content_type, e.theme, e.funnel_stage, e.target_audience, 'pauta_aprovada'
from public.organizations o
cross join (values
  ('Como funciona um resgate de cidadania: etapas reais, sem promessas','artigo','metodo','descoberta','publico'),
  ('O que é uma pesquisa genealógica documental (e o que ela não é)','artigo','pesquisa','consideracao','publico'),
  ('Documentos que costumam faltar — e como organizá-los','artigo','documentos','consideracao','publico'),
  ('Boletim mensal: o que aprendemos com casos em andamento','newsletter','institucional','legado','publico'),
  ('Por que não prometemos prazo de deferimento','post_social','governanca','institucional','publico')
) as e(title,content_type,theme,funnel_stage,target_audience)
on conflict do nothing;