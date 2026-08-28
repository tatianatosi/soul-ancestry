# Prompt final Lovable — visibilidade integral do App Cliente e smoke test Ana

**Projeto:** Clube Ancestral  
**Versão:** v1.2  
**Data:** 20 de agosto de 2026  
**Status:** Prompt final de visibilidade e smoke test interno  
**Caso de teste:** `CA-CID-AT-FAM-2026-001`  
**Estado obrigatório:** `NO_GO`

---

## 1. Decisão de navegação

O mockup aprovado é soberano. Todas as áreas aprovadas do App Cliente permanecem visíveis na navegação, **exceto Entrega, Fase 1 e Fase 2**, que são liberadas progressivamente por jornada, onboarding e conteúdo publicado.

### Áreas permanentes

Manter visíveis, conforme nomenclatura e ordem do mockup aprovado:

- Home.
- Jornada / Andamento, quando prevista.
- Radar, quando previsto.
- Árvore / Família, quando prevista.
- Documentos, quando previstos.
- Legado.
- Conta.
- Ajuda, atendimento, privacidade e demais áreas aprovadas no mockup.

Se uma área permanente não tiver conteúdo liberado, deve exibir estado vazio sanitizado e aprovado. Não remover a navegação, não mostrar erro técnico, não usar teaser comercial e não prometer resultado futuro.

### Áreas progressivas

- Entrega.
- Fase 1.
- Fase 2.

Essas áreas ficam ocultas até seus gates específicos estarem satisfeitos. Rota direta para área não liberada deve redirecionar de forma segura, sem vazamento de dados.

---

## 2. Prompt executável

```text
[ID ANA-APP-SMOKE-03] APLICAR VISIBILIDADE CORRETA DO APP CLIENTE E EXECUTAR SMOKE TEST INTERNO DA ANA.

CASO DE TESTE: CA-CID-AT-FAM-2026-001.
ESTADO OBRIGATÓRIO: NO_GO.

NÃO REDESENHAR O APP CLIENTE.
NÃO REMOVER, RENOMEAR, REORDENAR OU SIMPLIFICAR ÁREAS APROVADAS NO MOCKUP.
NÃO ALTERAR COPY JÁ APROVADA.
NÃO CRIAR NOVAS ABAS PRINCIPAIS.
NÃO CRIAR OU ALTERAR CONTRATO, ORDEM DE SERVIÇO, ANEXO, ASSINATURA, COBRANÇA, LINK DE PAGAMENTO, CLIENTE ASAAS, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA, MENSAGEM, CALENDÁRIO, TAREFA EXTERNA, INTEGRAÇÃO OU PUBLICAÇÃO REAL.
NÃO PREENCHER DADOS AUSENTES POR INFERÊNCIA.
NÃO ALTERAR O ESTADO DA ANA PARA ATIVO.

CONTEXTO NORMATIVO:
- O mockup aprovado é soberano em layout, nomenclatura, ordem e navegação.
- Todas as áreas aprovadas do App Cliente permanecem visíveis.
- A única exceção de visibilidade são Entrega, Fase 1 e Fase 2, liberadas progressivamente.
- Legado e Conta permanecem sempre visíveis.
- O App Cliente só lê conteúdo sanitizado, aprovado, publicado e autorizado.
- Nenhuma tabela interna de pessoas, relações, evidências, fontes, pesquisa, formalização, preço, risco, hipótese, auditoria ou documentos brutos pode ser lida diretamente pelo App.

==================================================
A. PRESERVAR NAVEGAÇÃO APROVADA
==================================================

1. Preservar visualmente, na ordem do mockup, todas as áreas já aprovadas.
2. Não ocultar, remover, desabilitar ou substituir áreas permanentes apenas porque ainda não há conteúdo para o caso.
3. Não criar menu paralelo, dashboard paralelo ou nova estrutura de tabs.
4. Para cada área permanente sem conteúdo aprovado, exibir estado vazio sanitizado, coerente com a área e sem prometer prazo, resultado, cidadania, entrega futura ou conclusão.
5. Não mostrar IDs internos, placeholders técnicos, erros de banco, objetos demo, preços, SKU, links internos ou rascunhos ao cliente.

ÁREAS PERMANENTES:
- Home.
- Jornada/Andamento, se presente no mockup.
- Radar, se presente no mockup.
- Árvore/Família, se presente no mockup.
- Documentos, se presente no mockup.
- Legado.
- Conta.
- Ajuda, atendimento, privacidade e todas as demais áreas aprovadas do mockup.

==================================================
B. LIBERAÇÃO PROGRESSIVA
==================================================

As únicas áreas que podem ficar ocultas do menu até liberação são:
- Entrega.
- Fase 1.
- Fase 2.

1. ENTREGA
Mostrar somente se existir client_deliverable ou projeção de entrega:
- vinculada ao caso;
- sanitizada;
- aprovada/publicada;
- autorizada para a pessoa atual;
- compatível com gate de jornada aplicável.

2. FASE 1
Mostrar somente se todos forem verdadeiros:
- existe relatório F1 ou entrega robusta F1 vinculada ao caso;
- status permite disponibilidade ao cliente;
- existe app_projection ou client_deliverable sanitizado, aprovado e publicado;
- pessoa atual está autorizada;
- onboarding/gate de jornada aplicável está satisfeito.

Não liberar por proposta, documento interno, pesquisa interna, relatório em rascunho, relatório em revisão, conteúdo aprovado internamente mas não entregue/publicado, componente existente ou URL direta.

3. FASE 2
Mostrar somente se todos forem verdadeiros:
- existe relatório F2 ou entrega robusta F2 vinculada ao caso;
- status permite disponibilidade ao cliente;
- existe app_projection ou client_deliverable sanitizado, aprovado e publicado;
- pessoa atual está autorizada;
- gate de Fase 2 está satisfeito.

Não liberar por proposta, pesquisa interna, evidência, rascunho, relatório em elaboração ou componente existente.

4. ROTAS DIRETAS
- Rota direta para Entrega/Fase 1/Fase 2 não liberada deve redirecionar com segurança para Home ou Jornada autorizada.
- Não vazar título, dados, erro interno, IDs, fontes, projeções ou conteúdo parcialmente carregado.
- Não criar rota vazia, tab desabilitada ou teaser comercial.

==================================================
C. CONTEÚDO SEGURO DAS ÁREAS PERMANENTES
==================================================

1. HOME E JORNADA
- Exibir somente estado sanitizado, próximo passo real e conteúdo autorizado.
- Não mostrar bloqueios internos, preço técnico, risco, hipótese, status jurídico, logs ou conteúdo de formalização.

2. RADAR
- Manter navegação se aprovada no mockup.
- Exibir somente indicadores sanitizados e autorizados, quando existirem.
- Não mostrar score interno, hipótese jurídica, risco interno, elegibilidade ou dado não validado.
- Sem conteúdo autorizado, mostrar estado vazio apropriado.

3. ÁRVORE/FAMÍLIA
- Manter navegação se aprovada no mockup.
- Exibir somente projeções sanitizadas, aprovadas e publicadas.
- Não consultar diretamente genealogical_person_profiles, genealogical_relationships, genealogical_events, lineage_paths, evidences, findings ou fontes.
- Sem projeção, mostrar estado vazio aprovado e não exibir árvore interna.

4. DOCUMENTOS
- Manter navegação se aprovada no mockup.
- Exibir somente documento/entrega explicitamente liberado e autorizado.
- Não exibir documento bruto, link interno, referência de fonte, pedido, checklist interno, documento de terceiro ou item em revisão.
- Sem documento liberado, mostrar estado vazio aprovado.

5. LEGADO
- Manter Legado sempre visível.
- Legado não é Fase 1, Fase 2, entrega comercial automática ou produto liberado por existir componente.
- Sem conteúdo de legado publicado, mostrar apenas estado vazio sanitizado e aprovado.
- Relatórios, acervo, árvore, linha do tempo, achados, fotos, documentos ou entregas de legado aparecem somente por projeção/client_deliverable sanitizado, aprovado, publicado e autorizado.
- Nunca exibir fonte, evidência bruta, hipótese, risco, dado de terceiro, documento interno, preço ou dados de pesquisa.

6. CONTA
- Manter Conta sempre visível.
- Exibir somente dados do próprio usuário autorizados, preferências permitidas, privacidade, consentimentos e acessos autorizados.
- Participantes/familiares somente quando houver vínculo e permissão explícita.
- Nunca exibir notas internas, evidências, fontes, casos de terceiros, preço técnico, SKU, margem, risco, hipótese jurídica, logs ou auditoria.

7. DEMAIS ÁREAS APROVADAS
- Permanecem visíveis conforme mockup.
- Conteúdo sempre depende de permissão, vínculo, sanitização e publicação.
- Quando vazio, usar estado vazio aprovado; não ocultar a área.

==================================================
D. SMOKE TEST INTERNO E NÃO DESTRUTIVO — ANA
==================================================

Não executar ação externa. Testar apenas leitura, persistência interna, gates, rotas, permissões e visibilidade.

1. PERSISTÊNCIA E FEEDBACK
- editar campo interno permitido;
- salvar;
- reler no servidor;
- comparar payload e registro relido;
- recarregar e confirmar persistência;
- validar estados Salvando, Salvo às HH:MM e erros específicos;
- validar CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA;
- validar NENHUMA_LINHA_AFETADA;
- validar DIVERGENCIA_PERSISTENCIA.

2. RASCUNHO E NAVEGAÇÃO
Em desktop e mobile:
- alteração pendente + troca de subaba, rota, caso e refresh;
- confirmar Salvar e continuar / Descartar alterações / Cancelar;
- confirmar que salvar navega só após comparação bem-sucedida;
- confirmar que cancelar mantém usuário na tela;
- confirmar acesso mobile a Financeiro, Formalização, Matriz Jurídica, Pesquisa, Relatórios, Plano de Ação, Biblioteca e todas as áreas do App aprovadas no mockup.

3. IDENTIDADE, NÚCLEO E DEPENDENTE
- Ana, Adair e Alice por referência de ID;
- sem identidade paralela de Adair;
- checklist de Adair vinculado a pessoa/cliente canônicos;
- Felipe com dependent_person_id e titular_responsavel_legal_id válidos;
- Felipe sem assinatura, App e anexo individual;
- tentativa de ativar participação sem representação documentada é negada;
- nucleoOk mostra critérios/pêndencias reais.

4. PROPOSTA, COMERCIAL E FORMALIZAÇÃO
- proposta Canva vinculada ao caso com deck/páginas registrados;
- validade expirada e extração parcial permanecem bloqueios;
- campos ausentes não são inferidos;
- case_service draft e critérios pendentes bloqueiam;
- preço/condição sem homologação rastreável bloqueiam;
- matriz jurídica pendente bloqueia assinatura;
- preparação não habilita versão final, assinatura, financeiro ou onboarding.

5. PESQUISA E EVIDÊNCIAS
- Ficha Piloto, Evidências, Pesquisa, Relatórios, Achados, Plano de Ação e Fontes exigem permissão interna;
- nenhum dado fictício/reais adicionais é inserido na Ana durante teste;
- nenhuma fonte externa, consulta, pedido, gasto, contato ou pesquisa é iniciada;
- evidência restrita e fonte interna não aparecem no App;
- F1 e F2 não são iniciados automaticamente.

6. APP CLIENTE — VISIBILIDADE CORRETA
Para Ana em NO_GO, confirmar:
- todas as áreas permanentes do mockup permanecem visíveis;
- Home/Jornada/Radar/Árvore/Documentos/Legado/Conta e demais áreas aprovadas aparecem conforme mockup, quando aplicáveis;
- áreas permanentes sem conteúdo exibem estado vazio sanitizado;
- Legado visível e sem conteúdo interno;
- Conta visível e sem dados internos/terceiros;
- Entrega não aparece;
- Fase 1 não aparece;
- Fase 2 não aparece;
- não aparecem documentos, árvore interna, linhagens internas, fontes, evidências, riscos, hipóteses, preço, SKU, case_service, formalização ou auditoria;
- rota direta para Entrega/F1/F2 não libera dados e redireciona com segurança;
- fixture não aparece para cliente.

7. RLS E AUDITORIA
- sem sessão não lê checklist_cadastral nem case_timeline_events;
- cliente não lê dados internos da Ana;
- usuário interno autorizado acessa somente organização/caso permitido;
- alteração relevante produz log sanitizado;
- dados sensíveis aparecem como [protegido];
- updated_by vem do servidor/sessão.

==================================================
E. TESTES AUTOMATIZADOS
==================================================

Criar/executar pelo menos:
1. Usuário não autenticado não acessa App.
2. Usuário autenticado sem vínculo não acessa caso.
3. Caso pré-onboarding não vê Entrega/Fase 1/Fase 2.
4. Todas as áreas permanentes aprovadas permanecem visíveis para usuário autorizado.
5. Legado e Conta permanecem visíveis.
6. Legado sem projeção publicada mostra apenas estado vazio sanitizado.
7. Área permanente sem conteúdo não expõe dado interno nem erro técnico.
8. Relatório F1 em rascunho/revisão/aprovado internamente não libera Fase 1.
9. Projeção F1 publicada/autorizada libera somente Fase 1.
10. Fase 2 continua oculta sem projeção F2 publicada.
11. Rota direta de Entrega/F1/F2 não liberada redireciona sem vazamento.
12. Fixture não aparece no App produtivo.
13. Cliente não consulta diretamente tabelas internas de pesquisa/evidência.
14. Nenhuma mudança no estado NO_GO da Ana ocorre durante o teste.

==================================================
F. ENTREGA
==================================================

Gerar relatório interno com:
- componentes, rotas e gates alterados;
- relação de áreas permanentes e progressivas;
- estados vazios utilizados;
- menu do App por estado de jornada;
- testes aprovados/reprovados;
- rotas e larguras mobile testadas;
- bloqueios preservados;
- erros encontrados, sem corrigir fora do escopo;
- confirmação de que Legado e Conta permanecem sempre visíveis;
- confirmação de que todas as demais áreas aprovadas permanecem visíveis;
- confirmação de que somente Entrega, Fase 1 e Fase 2 são progressivas;
- confirmação de que Ana permanece NO_GO;
- confirmação de nenhuma ação externa, publicação, mensagem, contrato, cobrança, pesquisa, pasta ou integração.
```

---

## 3. Gate posterior

Após este prompt, só avançar para preparação de instrumentos e assinatura se os gates humanos, comerciais, cadastrais e jurídicos estiverem satisfeitos. O smoke test não autoriza ação externa.
