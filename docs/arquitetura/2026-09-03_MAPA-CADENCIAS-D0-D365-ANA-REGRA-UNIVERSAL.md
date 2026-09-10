# Mapa de cadências D0–D365 — Ana Luiza como piloto e regra universal

> **Nota de recuperação (04/09/2026):** este é o documento-fonte original enviado pela Proprietária em
> 03/09/2026, que motivou `docs/arquitetura/2026-09-03_DE-PARA-CADENCIA-D0-D365-MICROENTREGAS-PLANEJADOR.md`
> (também recuperado nesta sessão — commit `6fc2521`, branch nunca mesclada). Até esta rodada, esta
> sessão só tinha acesso ao texto reconstruído por citação dentro do de-para; a Proprietária enviou o
> arquivo original, preservado aqui sem alteração. Ver
> `docs/auditorias/2026-09-04-consolidacao-12-documentos-drive-cadencia-d0-d365.md` para a análise
> completa (Régua F) e o estado real de cada peça contra o código de hoje.

- **status:** rascunho
- **versão:** v1.0
- **data:** 2026-09-03
- **projeto:** Clube Ancestral
- **classificação:** política, plano, matriz e recomendação operacional
- **responsável pela decisão:** Proprietária do Clube Ancestral
- **fonte(s) de evidência:** artefatos CA-10A1, CA-EVO-02, CA-EVO-03, CA-EVO-04 e CA-EVO-05A; mapeamentos de App Cliente/Desk desta conversa; rotas e gates do portal identificados no repositório; decisões de contrato, catálogo e caso canônico da Ana.
- **escopo:** desenhar a cadência completa de D0 a D365 para Ana Luiza, para posterior generalização a todos os casos, conectando contrato, financeiro, onboarding, pesquisa, documentos, micro-entregas, App Cliente, atendimento, retenção e governança.
- **premissas:** D0 é a data em que os gates mínimos para ativação foram efetivamente confirmados — não apenas proposta aceita; Faturas está fora do pacote da Ana; Entregas, Fase 01 e Fase 02 são progressivas; lembretes de Google Calendar só serão ativados depois de validação operacional do motor.
- **limites:** não cria eventos no Google Calendar, não envia comunicações, não cobra, não assina, não libera portal e não altera dados reais; prazos legais e de terceiros são estimativas operacionais, não promessas ao cliente.
- **próximos passos:** validar o fluxo D0–D30 com Ana e conta QA; comprovar persistência e controle de gates; somente depois ativar calendário como espelho dos itens que já existem no Desk.
- **critério de aceite:** cada marco tem gatilho, dono, fonte de verdade, ação interna, comunicação externa permitida, evidência de conclusão e regra de escalonamento; nenhum lembrete é criado no Calendar antes de a tarefa/cadência persistir no Desk e ser testada ponta a ponta.

## 1. Princípio operacional

Ana não será tratada como exceção manual. Ela é o **piloto real** para criar uma regra universal por tipo de caso, rota, produto e estrutura familiar.

A jornada é orientada por eventos e gates, não por datas cegas:

\[
\text{marco liberado} = \text{gate cumprido} + \text{evidência persistida} + \text{aprovação humana quando exigida}
\]

Datas D+ servem como cadência de acompanhamento e alerta. Elas não autorizam, por si só, assinatura, cobrança, portal, pesquisa externa, publicação de conteúdo, avanço de fase ou promessa de resultado.

## 2. Fontes de verdade

| Domínio | Fonte canônica | O que não pode substituir |
|---|---|---|
| Pessoa/contratante | CRM `clientes` e extensão canônica aprovada | PDF, proposta, texto livre, planilha solta |
| Caso | `case_id` e código canônico do caso | Código legado ou cópia de caso por familiar |
| Produto e condições | `product_catalog` + proposta/contrato versionados | Lista estática de SKU, link solto, preço em card |
| Contrato | ficha contratual, parâmetros aprovados, perfil institucional, cláusulas/anexos | Campo livre de link de proposta |
| Financeiro | cobrança/pagamento confirmado pela fonte financeira integrada ou registro humano auditado | Simulação de pagamento, aceite verbal |
| Pesquisa/documentos | registros e documentos do caso, com origem e verificação | narrativa solta/WhatsApp como única prova |
| App Cliente | acesso portal por pessoa/caso + projeção autorizada/publicada | dado interno, hipótese, documento bruto, nota de equipe |
| Cadência | tarefas e próximos passos persistidos no Desk | Google Calendar isolado, anotação pessoal, memória |

## 3. Portões de ativação

D0 só ocorre quando todos os critérios aplicáveis estiverem atendidos:

1. Caso canônico e participantes identificados.
2. Contratante/partes confirmadas no CRM.
3. Produto/SKU e escopo reconciliados com fonte viva.
4. Perfil institucional vigente e gate contratual aprovado.
5. Contrato/Ordem de Serviço revisados humanamente e assinatura conforme política.
6. Condição financeira confirmada no nível exigido pela política.
7. Dossiê mínimo de onboarding definido.
8. Responsável, próxima ação e prazo registrados.
9. Conteúdo inicial do portal preparado e aprovado, se o acesso for liberado.
10. Nenhum bloqueio crítico de autorização, RLS, cadastro ou integridade.

Se algum item faltar, o caso permanece em **pré-ativação**. A cadência continua internamente, mas D0 não é disparado e não se promete início de execução ao cliente.

## 4. Linha do tempo D0–D365

| Janela | Objetivo | Ações internas obrigatórias | Cliente/App Cliente | Evidência e gate de saída |
|---|---|---|---|---|
| Pré-D0 | Converter aceitação em caso operável | Reconciliar pessoa, caso, SKU, contrato, perfil institucional, revisão humana, financeiro e primeira tarefa | Nenhum acesso por padrão; somente comunicação aprovada de formalização | Contrato/condição conforme política + responsável/próxima ação/prazo |
| D0 | Ativação formal | Registrar ativação, responsável, objetivo, fase, risco inicial, dossiê mínimo e plano dos primeiros 30 dias | Boas-vindas somente se ativação/portal forem autorizados; Home e Jornada inicial podem ser liberadas | G0 ativação persistida; acesso e caso autorizados |
| D1–D3 | Acolhimento e orientação | Conferir acesso, vínculo por caso, checklist inicial, canal de atendimento e entendimento do próximo passo | Onboarding, Jornada, Documentos quando aplicável; micro-entrega inicial se publicada | Primeiro acesso ou tentativa registrada; ausência gera tarefa, não automação cega |
| D4–D7 | Diagnóstico operacional e coleta inicial | Validar documentos recebidos, lacunas, hipótese/rota, plano de pesquisa e donos | Checklist/solicitações de documentos; atualização clara sem exposição interna | Dossiê inicial classificado; próxima micro-entrega definida |
| D8–D14 | Primeira entrega de valor | Produzir/revisar/publicar micro-entrega: diagnóstico, mapa de lacunas, checklist validado ou plano de ação | Entregas abre somente após publicação; Fase 01 abre se gate `relatorio` + conteúdo aplicável | Micro-entrega publicada e visualizada/registrada; ação cliente definida |
| D15–D30 | Estabilização da primeira fase | Revisão de caso, documentos, rota, bloqueios, cadência de pesquisa e atendimento; medir primeiro valor | Jornada atualizada, documentos, entrega/Fase 01 conforme autorizado | Revisão D30 realizada; plano D31–D60 registrado |
| D31–D45 | Execução controlada | Rodar tarefas aprovadas, registrar evidências, revisar pendências e dependências externas | Atualizações apenas quando houver conteúdo aprovado; não publicar atividade interna bruta | Pelo menos uma atualização material ou status de dependência explicado |
| D46–D60 | Checkpoint de estratégia | Revisar risco, elegibilidade, documentação, investimento, prazo estimado e necessidade de ajuste de escopo | Resumo de progresso client-facing e próximos marcos | Decisão registrada: seguir, ajustar, pausar, escalar ou propor complemento |
| D61–D90 | Consolidação da Fase 01 | Fechar ou replanejar entregáveis de Fase 01; preparar Fase 02 somente se houver gate/escopo | Fase 01 com entregas aprovadas; Fase 02 permanece bloqueada até elegibilidade real | Revisão D90 + aceite/estado da Fase 01 + plano seguinte |
| M4–M6 (D91–D180) | Execução, dependências e previsibilidade | Cadência quinzenal interna, revisão mensal de caso, gestão de documentos, fornecedores e bloqueios | Atualização material mensal ou por evento; documentos/entregas conforme publicação | Revisões mensais registradas e nenhum SLA crítico sem dono/prazo |
| M7–M9 (D181–D270) | Avanço de fase e qualidade percebida | Revisar progresso acumulado, risco de estagnação, mudanças de regra/rota, necessidade de fase complementar | Abrir Fase 02 somente com condição cumprida; entregar marcos e orientações contextualizadas | Checkpoint trimestral com decisão de continuidade/ajuste |
| M10–M12 (D271–D365) | Retenção, legado e renovação | Avaliar resultado, pendências pós-processo, continuidade, gestão documental e oportunidades legítimas de legado | Relatório de 12 meses, próximos marcos e proposta de continuidade apenas se fizer sentido | Revisão anual e decisão: encerrar, manter, renovar, migrar para legado ou pausar |

## 5. Cadências por camada

### Operação interna

| Cadência | Evento | Dono | Saída mínima |
|---|---|---|---|
| Diária útil | Painel de bloqueios, prazos e novos documentos | Responsável do caso | Próxima ação com prazo ou confirmação de ausência de ação |
| Semanal | Triagem de casos ativos e micro-entregas | Responsável + operação | Priorização da semana, impedimentos e conteúdo a publicar |
| Quinzenal | Revisão de execução/pesquisa | Responsável técnico | Evidências atualizadas, risco e plano de 15 dias |
| Mensal | Revisão 360 do caso | Proprietária/gestão | Status, SLA, finanças aplicáveis, satisfação e decisão de continuidade |
| Trimestral | Revisão estratégica e qualidade | Proprietária + responsável | Rota, escopo, riscos, valor entregue e plano do trimestre |
| Anual | Revisão de vínculo/legado | Proprietária | Encerrar, renovar, pausar ou migrar produto |

### Cliente

| Momento | Comunicação permitida | Proibido | Gatilho |
|---|---|---|---|
| D0 | Confirmação de ativação e próximo passo | Prometer prazo de reconhecimento ou ação ainda não autorizada | Gate D0 |
| D1–D3 | Orientação de acesso e checklist | Expor dados internos ou familiares não autorizados | Portal/atendimento liberados |
| D8–D14 | Aviso de micro-entrega publicada | Dizer "concluído" sem entrega real | Publicação aprovada |
| Mensal | Atualização material ou comunicado de dependência relevante | Mensagem automática sem fato novo | Revisão mensal aprovada |
| Por evento | Documento, decisão, marco ou ação necessária | Fazer upsell automático por inércia | Evento real + copy aprovada |
| Trimestral | Revisão de jornada e próximos marcos | Linguagem jurídica conclusiva sem revisão | Checkpoint estratégico |
| Anual | Síntese e proposta de continuidade quando aplicável | Forçar renovação | Revisão anual |

### App Cliente

| Área | D0 | D1–D30 | D31–D90 | D91–D365 |
|---|---|---|---|---|
| Home/Jornada | Liberar se acesso aprovado | Atualizar com marco e próxima ação | Atualizações materiais | Linha de continuidade e marcos |
| Documentos | Liberar somente itens autorizados | Checklist inicial/solicitações | Gestão de pendências | Acervo e pendências pós-processo |
| Entregas | Fechada até primeira publicação | Abrir por micro-entrega | Entregas por fase | Biblioteca de entregas relevantes |
| Fase 01 | Fechada até gate `relatorio` + conteúdo | Abrir apenas quando aplicável | Concluir/replanejar | Histórico de Fase 01 |
| Fase 02 | Bloqueada | Bloqueada salvo condição excepcional | Liberar por gate `fase02` + condição | Acompanhar somente se contratada/autorizada |
| Radar/Árvore | Só se conteúdo sanitizado/útil | Liberar progressivamente | Enriquecer por evidência | Consolidar legado quando aplicável |
| Mensagens | Conforme canal de atendimento | Apoio orientado à ação | Atendimento por SLA | Relacionamento e continuidade |
| Faturas | Fora do pacote Ana | Fora do pacote Ana | Fora do pacote Ana | Fora do pacote Ana |

## 6. Micro-entregas como motor de valor

Toda micro-entrega deve ter:

- `case_id` e pessoa/participante autorizado;
- tipo de entrega e fase de jornada;
- origem e evidência;
- responsável interno;
- estado: preparada, em revisão, publicada, visualizada, ação pendente, concluída, arquivada;
- regra de projeção cliente-facing;
- próxima ação da equipe e/ou cliente;
- relação opcional com SKU/oferta apenas quando houver decisão comercial aprovada;
- data de publicação, leitura e conclusão quando aplicável.

Não confundir micro-entrega com evento interno. Uma pesquisa em andamento, uma nota de hipótese ou uma troca interna não é automaticamente uma entrega ao cliente.

## 7. Regras de escalonamento

| Sinal | Janela | Ação interna | Comunicação cliente |
|---|---|---|---|
| Cliente não ativou portal | 3 dias úteis após convite autorizado | Conferir convite, acesso, e-mail e RLS; atribuir tarefa | Reenvio/manual somente se aprovado |
| Login sem primeiro valor | 7 dias após primeiro login | Publicar/verificar micro-entrega inicial ou revisar onboarding | Orientação contextual aprovada |
| Documento pendente | Conforme prazo do caso | Confirmar clareza da solicitação e canal alternativo | Lembrete humano/contextual, nunca cobrança automática |
| Entrega publicada sem leitura | 7–10 dias | Verificar relevância, CTA e notificação | Aviso leve aprovado |
| Sem atualização material | 30 dias em caso ativo | Revisão obrigatória de caso e registro de dependência/risco | Atualização transparente quando aplicável |
| SLA de atendimento em risco | Conforme política | Escalar responsável e registrar motivo | Retorno conforme protocolo |
| Gate de fase pronto | Imediato após evidência | Revisar aprovação, conteúdo e acesso | Comunicar somente após liberação |
| Bloqueio jurídico/externo | Assim que identificado | Registrar impacto, dono, dependência e próxima revisão | Comunicar fato conhecido sem previsão especulativa |

## 8. Indicadores por horizonte

### D0–D30: ativação e primeiro valor

- Contrato/ativação sem bloqueio crítico.
- Tempo D0 → primeiro acesso.
- Tempo D0 → primeira micro-entrega publicada.
- Tempo publicação → primeira visualização.
- Checklist/documentos iniciais: solicitado, recebido, pendente e recusado.
- Taxa de acesso correta por caso, sem incidente de RLS.

### D31–D90: execução e confiança

- Micro-entregas publicadas, visualizadas e concluídas.
- Pendências sem dono/prazo.
- Atualizações materiais entregues no período.
- SLA de atendimento e documentos.
- Fase 01: gate, conteúdo, consumo e decisão de continuidade.

### D91–D365: retenção e valor contínuo

- Ritmo de atualização e retorno ao portal.
- Entregas por fase e por tipo de caso.
- Casos com estagnação, dependência externa ou risco de abandono.
- Feedback de utilidade por micro-entrega, apenas quando houver amostra.
- Checkpoints trimestrais concluídos.
- Renovação, continuidade, legado ou encerramento justificado.

Nunca calcular "área sem uso" sem verificar se a área era aplicável, liberada e continha conteúdo publicado.

## 9. Google Calendar: quando ativar

O Google Calendar será **espelho de cadência**, não fonte de verdade nem motor principal.

### Pré-requisitos para ativação

1. Tarefas, responsáveis, prazos e estados persistem no Desk após salvar e recarregar.
2. Gates de contrato, financeiro, portal e fase foram testados no preview.
3. Conta QA concluiu o teste de login, acesso por caso, documento, bloqueios negativos e logout.
4. Entregas/Fase 01/Fase 02 têm regra de liberação e conteúdo vivo, não texto fixo.
5. Não há duplicação de lembrete entre Desk, Calendar e outro canal.
6. A proprietária aprovou quais eventos geram calendário e quais ficam apenas como tarefa interna.

### Itens elegíveis para Calendar após estabilização

- Revisão semanal do caso.
- Checkpoint D7, D14, D30, D60, D90.
- Revisões mensais, trimestrais e anuais.
- Prazo interno de documento, revisão e publicação.
- Alerta de SLA quando a tarefa já existe no Desk.

### Itens que não devem gerar evento automático

- Assinatura, cobrança, pagamento, pesquisa externa ou convite de portal.
- Comunicação ao cliente sem revisão/autoridade humana.
- Marcos jurídicos não confirmados.
- Dados pessoais, documentos ou conteúdo sensível no título/descrição do evento.

## 10. Sequência de implantação

1. Validar dados canônicos e contrato da Ana.
2. Validar acesso/preview e criar QA externo.
3. Executar D0–D14 em ambiente controlado, com uma micro-entrega real aprovada.
4. Verificar persistência, gates, dados sanitizados, atendimento e cadência D30.
5. Ajustar regra universal por tipo de caso antes de repetir em novos clientes.
6. Implementar cards e indicadores da aba Cliente usando dados vivos.
7. Só depois de pelo menos um ciclo completo e estável, conectar eventos elegíveis ao Google Calendar do Clube Ancestral.

## 11. Critérios de aceite da regra universal

- D0 é definido por gates e evidência, não por data de proposta.
- Cada comunicação tem gatilho e conteúdo permitido.
- Cada cadência possui responsável, prazo, registro e escalonamento.
- Cada área do portal possui regra de aplicabilidade, liberação e conteúdo.
- Faturas não aparece no pacote Ana.
- O caso Ana pode ser executado de ponta a ponta sem planilha/memória paralela como fonte de verdade.
- Calendar só é ativado como espelho após Desk/App passarem nos testes de persistência, segurança e operação.
