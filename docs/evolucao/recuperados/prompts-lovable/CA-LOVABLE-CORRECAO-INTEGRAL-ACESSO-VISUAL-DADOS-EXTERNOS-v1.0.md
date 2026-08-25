# Prompt executável — Correção integral de acesso, UX, dados e integrações

**Destino:** Lovable — projeto Clube Ancestral  
**Objetivo:** estabilizar o ambiente publicado, corrigir a experiência visual e validar integrações/dados externos sem disparar ações externas reais.

> **Modo de execução obrigatório:** EXECUTE; não responda com plano, resumo, auditoria genérica, mockup ou promessa. Para cada item, implemente ou valide de fato, rode testes/build, publique somente após os testes e reporte evidência objetiva. Se uma condição não puder ser comprovada, marque-a como `FALHOU` com causa e correção necessária; não declare conclusão.

---

## 0. Escopo e proibições

- Ambiente canônico de produção: `https://soul-ancestry.lovable.app`.
- Conta proprietária: `tati@pluggedresearch.com`.
- Não usar conta demo, seed, fixture, preview, localhost, editor ou banco diferente para afirmar aceite.
- Não criar novos módulos, fluxos, menus, telas ou “auditorias” como substituto de corrigir defeitos reais.
- Não enviar e-mail, WhatsApp, contrato, pedido institucional, cobrança, link de pagamento, assinatura, pesquisa externa, publicação no App Cliente ou ação em nome de cliente durante este trabalho.
- Não alterar/remover dados reais, casos, contratos, catálogo, preços, permissões de terceiros, DNS, domínio, plano pago ou integração externa sem instrução e confirmação separadas da proprietária.
- Preservar RLS por organização, auditoria append-only, soft delete, histórico, versionamento, entidades canônicas e controles de confirmação final.

---

## 1. P0 — estabilizar autenticação e sessão da proprietária

### Resultado exigido

A proprietária deve entrar uma vez e permanecer administradora ao navegar, recarregar a página e abrir nova aba.

### Executar

1. No domínio de produção e no projeto de autenticação realmente consumido por ele, localizar a conta `tati@pluggedresearch.com`.
2. Validar: usuário auth habilitado, perfil ativo, organização Clube Ancestral ativa, membership ativa, `staff_access` ativa, role efetiva `admin` e nenhum estado de suspensão, revogação, arquivamento ou organização divergente.
3. Garantir que o fluxo `/equipe/redefinir-senha` não execute `signOut`, não limpe session/localStorage/cookies, não substitua sessão normal por recovery session inválida e não redirecione a login após salvar senha.
4. Garantir que login normal, refresh de token, mudança de rota, carregamento de perfil e leitura de membership não chamem logout, reset de senha ou limpeza de sessão de forma implícita.
5. Tratar rate limit de login/recovery corretamente: bloquear múltiplos cliques, mostrar mensagem e contagem/tempo de espera quando existir limite, sem loop e sem reenviar recuperação automaticamente.
6. Proibir qualquer componente de painel, Modo Proprietária ou verificação de acesso de alterar auth/session/cookies/localStorage, role, membership, perfil ou organização.
7. Manter o bloco “Verificação de acesso administrativo” estritamente read-only e tolerante a falhas transitórias; uma leitura falha não pode deslogar, redirecionar ou rebaixar a sessão.
8. Adicionar testes de regressão para: reset → sessão preservada; login → reload; login → nova aba; navegação por rotas admin; falha de consulta de perfil sem logout; rate limit sem loop.

### Teste de aceite obrigatório

Em sessão externa nova e limpa, com a conta real, executar:

- Login por `/equipe/entrar`.
- Abrir `/painel`, `/equipe`, `/configuracoes`, `/acessos-portal`, `/modo-proprietaria` e `/auditoria`.
- Recarregar `/modo-proprietaria`.
- Abrir `/painel` em nova aba.
- Clicar no bloco de verificação administrativa, se ele existir.
- Confirmar que não houve logout, redirecionamento indevido, erro de token, “Sem permissão” nem HTTP 4xx/5xx.

---

## 2. P0 — corrigir UX visual e legibilidade

### Regras de marca

Aplicar consistentemente o Guia de Marca do Clube Ancestral em Desk, CRM, Pesquisa, Modo Proprietária, acesso e App Cliente:

- Navy: `#2F4B6E`.
- Preto: `#101010`.
- Bege: `#ECDFCD`.
- Dourado: `#FCB73A`.
- Terracota: `#9A3A2F`.
- Usar o logo vetorial e tipografia/estilo aprovados onde houver cabeçalho, navegação e superfícies de marca.
- Corrigir especialmente a área de Pesquisa/Gestão de Pesquisa do Desk, que não pode ficar visualmente genérica ou desconectada da identidade.

### Corrigir interface de administração

1. Não alterar poderes, RLS, auditoria, triggers, dados ou regras externas.
2. Trocar nomes técnicos de tabelas no fluxo principal por rótulos humanos. Exemplos:
   - `case_plans` → Planos do caso
   - `citizenship_tracks` → Rota de cidadania
   - `ops_microentregas` → Microentregas
   - `case_checklist_items` → Itens do checklist
   - `commercial_conditions` → Condições comerciais
   - `contract_scope_items` → Itens de escopo
   - `audit_logs` → Registro de auditoria
   - `owner_override_events` → Decisões da proprietária
3. Exibir nomes técnicos somente em “Detalhes técnicos”, recolhido por padrão e exclusivo da proprietária.
4. Reduzir o Modo Proprietária a uma página operacional de primeira leitura, com cinco blocos:
   - Resumo do seu acesso e da operação
   - Atalhos por área
   - Pendências e exceções assumidas
   - Ações externas que aguardam sua confirmação
   - Decisões recentes
5. Colocar matrizes extensas, inventários de poderes, tabelas canônicas e documentação técnica em seções recolhíveis ou rotas de detalhes.
6. Não renderizar um formulário global de “Confirmação final — ação externa e irreversível” ao abrir o Modo Proprietária. Mostrar apenas um aviso compacto.
7. Abrir o formulário de confirmação somente quando a proprietária iniciar uma ação concreta dentro do contexto de uma entidade. Pré-preencher caso, destinatário, documento, conteúdo, anexos, valores, impacto e dados enviados a partir da entidade; nunca mostrar formulário vazio como se fosse uma ação pendente.
8. Corrigir textos truncados, concatenações sem espaço, repetição de títulos, tabelas excessivamente largas, telas sem hierarquia e estados vazios sem orientação.
9. Garantir responsividade em desktop e celular, foco visível, contraste adequado, navegação por teclado e mensagens de erro compreensíveis.

### Guardas visuais

- Dados DEMO/TESTE/fixture devem ter selo visível e filtro explícito; não contam em KPI real.
- Pendência não é erro: exibir status, responsável, próximo passo e motivo de forma compacta.
- Não transformar bloqueios, estados técnicos ou nomes de banco em conteúdo principal do usuário.
- Não reimplementar nem propagar configuração de um caso-modelo para todos os casos; a entrega consultiva deve continuar parametrizada por caso/país.

---

## 3. P1 — validar cadeia de dados canônica

### Executar validação somente leitura ou com QA isolado

1. Verificar que as entidades canônicas são a fonte de escrita e a interface não salva apenas estado local:
   `organizations`, `profiles`, `staff_access`, `user_roles`, leads/clientes/casos, propostas, condições comerciais, OS, contratos, versões, itens de escopo, catálogo, divergências, documentos, pesquisa, financeiro, projeções e auditoria.
2. Verificar RLS por `organization_id` em todas as rotas e consultas operacionais.
3. Validar que a cadeia comercial preserva vínculos estáveis:
   Lead → Proposta → Condição comercial → OS → Itens de escopo → Contrato/versão.
4. Exibir lacunas de vínculo como pendência rastreável, sem inventar valores, IDs, responsáveis ou documentos.
5. Validar que correção de preço, SKU, escopo, participante, condição ou prazo gera versão/auditoria e valores anterior/novo com motivo.
6. Validar soft delete: arquivamento exige motivo e não apaga histórico; exclusão definitiva permanece como ação externa confirmada.
7. Criar apenas dados `QA-NAO-OPERACIONAL` se for necessário testar escrita, e arquivar os dados QA ao final preservando a auditoria.
8. Confirmar que o Painel Hoje não duplica filas; item sem responsável aparece como problema de qualidade; DEMO/TESTE ficam ocultos por padrão.

### Dados do App Cliente

1. Garantir que `projetarArvoreCliente` ou a única camada canônica equivalente seja a porta exclusiva de projeção ao cliente.
2. Só expor pessoas/dados com projeção `autorizado` ou `publicado`.
3. Não expor: endereço, documentos pessoais, gravações, transcrições, objeções, hipótese, evidência bruta, fonte interna, risco, status técnico, preço bruto, SKU, notas internas ou dados não validados.
4. Duplicidades devem ser consolidadas; inconsistências devem bloquear projeção até decisão humana registrada.
5. Portal do cliente não permite auto cadastro: acesso por e-mail previamente autorizado, finalidade declarada, validação humana, magic link de uso único, auditoria de reenvio/suspensão/revogação e vínculo a caso elegível.
6. Testar com caso QA que dados internos não vazam por tela, URL direta, API, exportação ou payload.

---

## 4. P1 — validar integrações e dados externos sem executar atos externos

### Matriz de prontidão obrigatória

Criar/atualizar uma tela ou painel de status de integrações, somente leitura, indicando para cada integração:

- nome da integração;
- ambiente/conexão ativa ou ausente;
- última validação;
- escopo e permissões;
- ação que ela habilita;
- pré-requisitos de dados;
- erro acionável e responsável;
- se pode ser testada em sandbox/QA;
- se requer confirmação final da proprietária.

### E-mail e recuperação de senha

1. Verificar endereço de produção, URLs de redirect autorizadas e fluxo de recovery no provedor auth.
2. Informar com clareza que `tati.pluggedresearch.com` pendente afeta remetente de marca; não pode bloquear login, sessão, RLS ou admin.
3. Confirmar que o remetente padrão realmente entrega em caixa de QA controlada antes de afirmar que reset está resolvido.
4. Não enviar e-mail real neste trabalho. Se for necessário teste de entrega, usar destinatário QA autorizado e confirmação separada.
5. Exibir instruções DNS copiáveis e exatas, sem alterar NS/MX/TXT/CNAME automaticamente.

### Assinatura eletrônica

1. Identificar se existe provedor configurado, sandbox disponível, credenciais válidas e callback/redirect configurados.
2. Se não houver integração, mostrar “Não configurada” — não fingir que “Solicitar assinatura” envia algo.
3. Disponibilizar apenas teste QA/sandbox, sem enviar contrato real ou documento para destinatário real.
4. Exigir ação contextual de contrato, dados do destinatário, versão, anexos e confirmação manual antes de qualquer envio futuro.

### Financeiro / Asaas

1. Identificar conexão, ambiente (sandbox/produção), produtos/SKUs, links, webhooks e logs.
2. Não criar cliente, link, cobrança, assinatura, pagamento nem alterar preço real.
3. Testar somente sandbox/QA autorizado; se não existir sandbox, marcar como não validada.
4. Validar que emissão de cobrança/link exige entidade concreta, valor, moeda, destinatário e confirmação final; nunca sair de formulário global vazio.
5. Verificar deduplicação/idempotência para impedir cobrança ou link duplicado.

### WhatsApp, e-mail operacional e pesquisa externa

1. Mostrar estado real do provedor/canal e templates disponíveis.
2. Não enviar mensagens nem iniciar pesquisa externa.
3. Garantir que qualquer ação futura exige destinatário, conteúdo, caso, dados enviados, impacto, motivo e confirmação manual explícita da proprietária.
4. Para pesquisa, manter referências como pendentes até validação documental humana; upload não cria genealogia nem transforma hipótese em achado validado.

### Webhooks, Apps Script e Google Sheets

1. Validar URL/configuração de webhook, assinatura/segredo, normalização de telefone, regras de upsert e logs estruturados.
2. Não executar sincronização em dados reais.
3. Testar com payload QA isolado ou validar configuração somente leitura.
4. Reportar se o CRM/Pipeline é canônico; não manter múltiplos CRMs com escrita concorrente.

---

## 5. P1 — smoke test completo de QA sem efeito externo

Criar ou reutilizar exclusivamente uma organização/caso de QA isolado, com selo `QA-NAO-OPERACIONAL`, e validar:

1. Login proprietária → Painel Hoje.
2. Lead QA → Call QA → qualificação → handoff → caso QA.
3. Proposta QA → condição QA → OS QA → itens de escopo QA → versão contratual QA.
4. Tarefa, responsável, prazo, alerta, exceção e auditoria.
5. Pesquisa interna QA: pessoa, fonte, evidência, hipótese, pendência e relatório interno.
6. Projeção QA sanitizada para App Cliente, com teste negativo de campos internos.
7. Tela de ação externa contextual em modo simulado/sandbox, sem disparar e-mail, cobrança, assinatura, WhatsApp, pesquisa ou publicação.
8. Arquivar QA ao final sem apagar trilha de auditoria.

---

## 6. Saída obrigatória e regra de encerramento

Não encerrar com texto genérico. Retornar uma tabela com estas colunas:

| Área | Caso/rota testada | Ambiente real | Resultado | Evidência | Falha restante | Correção aplicada | Commit/deploy | Teste/build |
|---|---|---|---|---|---|---|---|---|

Adicionar separadamente:

1. Lista de arquivos, migrations e configurações alteradas.
2. Resultado de typecheck, testes e build.
3. Estado de cada integração: `VALIDADA_EM_QA`, `CONFIGURADA_NAO_TESTADA`, `NAO_CONFIGURADA`, `BLOQUEADA_POR_DADO`, `AGUARDA_CONFIRMACAO_DA_PROPRIETARIA`.
4. Lista explícita de ações externas que **não foram** executadas.
5. Uma lista curta, priorizada, de falhas que ainda impedem lançamento ou uso real.

### Critério de aceite

Só declarar esta tarefa concluída quando:

- a proprietária entra no domínio publicado e mantém sessão após navegação, reload e nova aba;
- as seis rotas administrativas indicadas passam sem bloqueio;
- o Modo Proprietária é legível e contextual, sem jargão técnico no fluxo principal nem formulário externo vazio;
- os dados do App Cliente não vazam conteúdo interno;
- a cadeia de dados canônica e auditoria passam em QA;
- o estado das integrações externas está comprovado sem ato externo real;
- testes, typecheck e build estão verdes;
- qualquer item não comprovado está marcado como falha, não como concluído.
