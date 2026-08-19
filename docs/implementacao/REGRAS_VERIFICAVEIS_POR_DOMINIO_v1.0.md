# Regras Verificáveis por Domínio v1.0

## Objetivo

Converter decisões de negócio em regras testáveis, sem transformar pendências humanas em automações. Cada regra deve ter fonte, condição, comportamento esperado, bloqueio e evidência de teste.

| Domínio | Regra verificável | Condição | Comportamento esperado | Bloqueio/limite | Evidência necessária |
|---|---|---|---|---|---|
| Caso | Um caso possui ID canônico e aliases históricos rastreáveis. | Criação ou migração de caso. | Persistir ID, alias, origem e data de decisão. | Não duplicar caso por divergência de ID. | Schema + tela + teste. |
| Família | Vínculos familiares possuem papel, relação, finalidade e responsável legal quando houver menor. | Inclusão/edição de familiar. | Restringir acesso por perfil e consentimento. | Sem representação/consentimento, não compartilhar dados. | RLS + fluxo + teste. |
| Proposta | Pré-carga vem de proposta identificada e com status permitido. | Criação de caso por proposta. | Registrar versão/origem e campos importados. | Proposta arquivada/substituída não pode sobrescrever dados. | Log + teste de idempotência. |
| SKU | Código, nome comercial, escopo, preço e link são campos distintos. | Oferta/contrato/cobrança. | Exigir referência de catálogo aprovada. | Não criar SKU por pré-carga ou UI. | Catálogo + validação. |
| Preço | Preço é exposto/cobrado apenas com fonte aprovada e reconciliação. | Proposta, contrato ou Asaas. | Bloquear divergências. | Não usar link ou mock como fonte financeira. | Matriz de reconciliação + teste. |
| Contrato | Contrato usa versão jurídica aprovada e campos obrigatórios completos. | Preparação/assinatura. | Bloquear geração/assinatura com dados críticos ausentes. | Sem revisão jurídica, não ativar. | Template + validação + regressão. |
| Despesas | Despesa tem finalidade, autorização, responsável e trilha. | Registro/cobrança de despesa. | Exibir conforme escopo aprovado. | Não cobrar/autorizar automaticamente. | Dados + contrato/anexo + teste. |
| Asaas | Cobrança só nasce após contrato, SKU/preço e dados validados. | Criação de customer/link/assinatura. | Gerar integração rastreável. | Não ativar com gate pendente. | Integração + log + teste. |
| App | Cliente vê somente entrega contextual, pendência e próximo passo autorizados. | Exibição no portal. | Omitir controles internos e dados não sanitizados. | Não expor SKU técnico, preço provisório ou dado familiar indevido. | RLS + UI + teste. |
| Desk/CRM | Desk registra operação, fonte e decisão; não define preço/jurídico sozinho. | Ação interna. | Guardar logs, status e responsável. | Não substituir fonte comercial/jurídica. | Log + permissões. |
| Genealogia | Evidência de pesquisa distingue documento, fonte secundária, relato oral e hipótese. | Registro de achado. | Exibir nível de confiança e proveniência. | Não afirmar elegibilidade ou filiação sem base adequada. | Dicionário + modelo de evidência. |

## Taxonomia mínima genealógica

- `DOCUMENTO_PRIMARIO`: registro civil, eclesiástico, migratório, militar, judicial ou administrativo de época.
- `FONTE_SECUNDARIA`: obra, índice, árvore publicada, base derivada ou transcrição.
- `RELATO_ORAL`: memória de familiar, entrevista ou narrativa não corroborada.
- `HIPOTESE_DE_PESQUISA`: possibilidade a verificar, nunca fato.
- `EVIDENCIA_CORROBORADA`: conclusão suportada por fontes independentes e avaliadas.
- `PENDENCIA_DOCUMENTAL`: item necessário ainda não localizado/verificado.
- `CONFLITO_DE_EVIDENCIA`: fontes divergentes, sem decisão técnica final.

## Dicionário de relações familiares

- `PESSOA`: indivíduo identificado ou provisório.
- `NUCLEO_FAMILIAR`: conjunto de pessoas vinculadas a um caso/escopo.
- `TITULAR`: pessoa para quem o objetivo principal do processo/serviço se aplica.
- `CONTRATANTE`: pessoa ou entidade que contrata e assume a obrigação contratual.
- `PARTICIPANTE`: pessoa incluída no escopo sem necessariamente ser contratante.
- `DEPENDENTE`: pessoa vinculada a titular/contratante com regra específica de representação.
- `REPRESENTANTE_LEGAL`: pessoa habilitada a agir em nome de menor/incapaz dentro dos limites documentados.
- `INTERLOCUTOR`: pessoa de contato que não necessariamente integra o escopo.

## Regra de linguagem

Usar “evidência”, “indício”, “hipótese”, “pendência”, “documento” e “próximo passo”. Evitar termos que indiquem certeza jurídica, genealogia comprovada, obtenção garantida de documento ou resultado de cidadania sem validação humana e base adequada.
