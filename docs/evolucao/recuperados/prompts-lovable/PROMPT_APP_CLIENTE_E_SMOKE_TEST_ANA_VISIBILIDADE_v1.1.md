# Prompt — App Cliente e smoke test Ana com visibilidade correta

**Projeto:** Clube Ancestral  
**Versão:** v1.1  
**Data:** 20 de agosto de 2026  
**Status:** Prompt executável de ajuste de visibilidade e teste interno  
**Substitui:** regras de visibilidade de App do documento `SMOKE_TEST_ANA_E_LIBERACAO_PROGRESSIVA_APP_v1.0.md`  
**Caso de teste:** `CA-CID-AT-FAM-2026-001`

---

## 1. Decisão de visibilidade

O mockup aprovado é soberano em layout, nomes, ordem e navegação.

### Navegação permanente

As áreas abaixo permanecem visíveis para usuário autenticado e autorizado, conforme o mockup:

- Home.
- Jornada/Andamento, quando essa for a nomenclatura aprovada no mockup.
- **Legado**.
- **Conta**.

### Navegação progressiva

As áreas abaixo só aparecem quando os gates de jornada e conteúdo aprovado forem satisfeitos:

- **Entrega**.
- **Fase 1**.
- **Fase 2**.

Legado não é uma fase comercial, entrega automática ou área condicional. Permanece visível, mas mostra somente conteúdo sanitizado e autorizado. Sem entrega de legado publicada, exibe estado vazio aprovado, sem dados internos.

Conta permanece visível para configurações autorizadas de perfil, privacidade, acesso e preferências; não revela dados de outros participantes ou dados internos do Desk.

---

## 2. Prompt completo para Lovable

```text
[ID ANA-APP-SMOKE-02] AJUSTAR APP CLIENTE PARA VISIBILIDADE PROGRESSIVA CORRETA E EXECUTAR SMOKE TEST INTERNO DA ANA.

CASO DE TESTE: CA-CID-AT-FAM-2026-001.
ESTADO OBRIGATÓRIO: NO_GO.

NÃO REDESENHAR O APP CLIENTE.
NÃO ALTERAR A COPY JÁ APROVADA DO MOCKUP.
NÃO CRIAR NOVAS ABAS PRINCIPAIS.
NÃO CRIAR OU ALTERAR CONTRATO, OS, ANEXO, ASSINATURA, COBRANÇA, LINK DE PAGAMENTO, CLIENTE ASAAS, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA, MENSAGEM, CALENDÁRIO, TAREFA EXTERNA, INTEGRAÇÃO OU PUBLICAÇÃO REAL NO APP.
NÃO PREENCHER DADOS AUSENTES POR INFERÊNCIA.
NÃO ALTERAR O ESTADO DA ANA PARA ATIVO.

CONTEXTO NORMATIVO:
- O mockup aprovado é soberano em layout, nomenclatura, ordem e navegação.
- Legado e Conta são áreas permanentes do App Cliente conforme mockup.
- Entrega, Fase 1 e Fase 2 são áreas de liberação progressiva conforme onboarding, jornada e conteúdo aprovado.
- App Cliente só lê projeções/entregas sanitizadas, aprovadas e autorizadas; nunca lê dados internos brutos do Desk.

==================================================
A. NAVEGAÇÃO E VISIBILIDADE
==================================================

Preservar a estrutura visual e a nomenclatura aprovadas no mockup.

1. ÁREAS PERMANENTES
Manter visíveis para usuário autenticado e autorizado:
- Home.
- Jornada/Andamento, se essa for a área prevista no mockup.
- Legado.
- Conta.

2. ÁREAS PROGRESSIVAS
Ocultar da navegação, sem deixar espaço vazio, até liberação explícita:
- Entrega.
- Fase 1.
- Fase 2.

Não usar tab desabilitada, teaser comercial ou área vazia para Entrega/Fase 1/Fase 2.
Não permitir acesso direto por URL a área não liberada.
Em tentativa de rota direta, redirecionar com segurança para Home ou Jornada autorizada, sem revelar conteúdo interno.

3. LEGADO
Legado deve permanecer sempre visível.

Quando não houver conteúdo de legado aprovado/publicado:
- exibir estado vazio sanitizado, aprovado e coerente com o mockup;
- não prometer prazo, cidadania, resultado ou entrega futura;
- não expor evidências, documentos, fontes, árvores, achados, hipóteses, riscos, dados de terceiros, preços, transcrições, URLs internas ou dados de pesquisa.

Quando houver conteúdo de legado:
- exibir somente app_projection ou client_deliverable com conteúdo sanitizado, aprovação e publicação explícitas;
- manter as permissões por caso e participante.

4. CONTA
Conta deve permanecer sempre visível.

Conta pode exibir apenas:
- dados do próprio usuário autorizados;
- preferências permitidas;
- configurações de acesso autorizadas;
- privacidade e consentimentos disponíveis ao usuário;
- participantes/familiares somente quando houver vínculo e permissão explícita.

Conta nunca pode exibir:
- notas internas;
- evidências internas;
- fontes;
- dados de outros casos;
- preço técnico, SKU, margem, risco, hipótese jurídica, logs ou auditoria.

==================================================
B. GATES DE LIBERAÇÃO PROGRESSIVA
==================================================

Implementar gates de leitura no servidor e no App; não depender somente do front-end.

1. ACESSO AO APP
Exigir:
- sessão autenticada;
- pessoa/usuário vinculado ao caso;
- organização e permissão válidas;
- perfil autorizado.

2. ENTREGA
Mostrar somente se:
- existir client_deliverable ou projeção de entrega vinculada ao caso;
- conteúdo estiver sanitizado;
- status estiver aprovado/publicado conforme o modelo;
- pessoa atual estiver autorizada;
- gate de jornada aplicável estiver atendido.

3. FASE 1
Mostrar somente se todos forem verdadeiros:
- existe relatório F1 ou entrega robusta F1 vinculada ao caso;
- status de relatório/entrega permite disponibilidade ao cliente;
- existe app_projection ou client_deliverable sanitizado, aprovado e publicado;
- pessoa está autorizada;
- gate aplicável de onboarding/jornada está satisfeito.

Não liberar Fase 1 por:
- proposta aprovada;
- pesquisa interna;
- documento interno;
- relatório em rascunho;
- relatório em revisão;
- conteúdo aprovado internamente, mas não entregue/publicado;
- componente/rota existir.

4. FASE 2
Mostrar somente se todos forem verdadeiros:
- existe relatório F2 ou entrega robusta F2 vinculada ao caso;
- status permite disponibilidade ao cliente;
- existe app_projection ou client_deliverable sanitizado, aprovado e publicado;
- pessoa está autorizada;
- gate de jornada/Fase 2 está satisfeito.

Não liberar Fase 2 por proposta, pesquisa interna, evidência, rascunho ou relatório em elaboração.

5. DOCUMENTOS, ÁRVORE E LINHAGENS
Mostrar somente itens com:
- projeção sanitizada;
- permissão autorizada;
- publicação explícita;
- vínculo correto com caso e pessoa.

O App Cliente não deve consultar diretamente:
- `genealogical_person_profiles`;
- `genealogical_relationships`;
- `genealogical_events`;
- `lineage_paths`;
- `evidences`;
- `research_sources`;
- `document_requests`;
- `genealogical_findings`;
- `lineage_encounters`;
- dados de preço, risco, hipótese, auditoria ou formalização interna.

==================================================
C. ESTADOS SEGUROS
==================================================

1. PRÉ-ONBOARDING / NO_GO
Para Ana no estado atual:
- não ativar acesso real;
- não mostrar Entrega, Fase 1 ou Fase 2;
- manter Legado e Conta na navegação, conforme mockup;
- Legado mostra somente estado vazio sanitizado;
- Conta respeita permissões e não expõe dados internos;
- não mostrar documentos, árvore, linhagens, fontes, evidências, riscos, hipóteses, preço, case_service ou dados internos.

2. ONBOARDING LIBERADO
Depois de contrato assinado, pagamento inicial confirmado e onboarding iniciado, ou exceção formal aprovada:
- permitir conteúdo de onboarding sanitizado e autorizado;
- Entrega/Fase 1/Fase 2 continuam dependentes de suas entregas/projeções específicas;
- Legado continua visível, independentemente de haver conteúdo publicado.

3. ÁREA LIBERADA SEM CONTEÚDO
Se uma área permanentemente visível não tiver conteúdo aprovado:
- exibir estado vazio aprovado;
- não prometer prazo, resultado, cidadania, entrega futura ou conclusão;
- não mostrar erro técnico, ID interno ou placeholder de desenvolvimento.

==================================================
D. SMOKE TEST INTERNO — ANA
==================================================

Executar somente teste interno e não destrutivo.

1. PERSISTÊNCIA E FEEDBACK
Testar:
- editar um campo interno permitido da ficha Ana;
- salvar;
- reler do servidor;
- confirmar payload e registro relido;
- recarregar e confirmar persistência;
- validar feedback Salvando, Salvo às HH:MM ou erro específico;
- campo não mapeado retorna CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA;
- update sem linha retorna NENHUMA_LINHA_AFETADA;
- divergência retorna DIVERGENCIA_PERSISTENCIA.

2. RASCUNHO E NAVEGAÇÃO
Testar desktop e mobile:
- alteração pendente + troca de subaba;
- modal Salvar e continuar / Descartar alterações / Cancelar;
- salvar só navega após persistência validada;
- cancelar mantém usuário na tela;
- acesso mobile a Financeiro, Formalização, Matriz Jurídica, Pesquisa, Relatórios, Plano de Ação e Biblioteca.

3. IDENTIDADE, NÚCLEO E DEPENDENTE
Confirmar:
- Ana, Adair e Alice por referência de ID;
- sem identidade paralela de Adair;
- checklist de Adair vinculado à pessoa/cliente canônicos;
- Felipe possui dependent_person_id e titular_responsavel_legal_id válidos;
- Felipe não é signatário, não possui App e não tem anexo individual;
- tentativa de ativar contrato/App/anexo sem representação documentada é negada;
- nucleoOk mostra critérios e pendências reais.

4. PROPOSTA, COMERCIAL E FORMALIZAÇÃO
Confirmar:
- proposta Canva vinculada ao caso, com deck/páginas registrados;
- validade expirada e extração parcial aparecem como bloqueio;
- campos ausentes não são inferidos;
- case_service draft e critérios pendentes bloqueiam;
- produto/condição sem homologação rastreável bloqueiam;
- matriz jurídica pendente bloqueia assinatura;
- preparação não habilita versão final, assinatura, financeiro ou onboarding.

5. PESQUISA E EVIDÊNCIAS
Confirmar:
- Ficha Piloto, Evidências, Pesquisa, Relatórios, Achados, Plano de Ação e Fontes são internos e exigem permissão;
- nenhum dado genealógico, documento, evidência, achado ou solicitação fictícia foi adicionado à Ana;
- nenhuma fonte externa, consulta, pedido, custo, contato ou pesquisa foi iniciada;
- evidência restrita e fonte interna não aparecem no App;
- F1 e F2 não são iniciados automaticamente.

6. APP CLIENTE — VISIBILIDADE
No estado atual NO_GO da Ana, confirmar:
- Home visível somente se houver acesso autorizado e conteúdo sanitizado;
- Legado visível no menu;
- Conta visível no menu;
- Entrega não visível;
- Fase 1 não visível;
- Fase 2 não visível;
- Legado sem conteúdo interno; apenas estado vazio aprovado quando aplicável;
- Conta não expõe dados internos ou de terceiros;
- documentos, árvore, linhagens, fontes, riscos, hipóteses, preço e dados internos não aparecem;
- rota direta para Entrega/F1/F2 não libera dados e redireciona com segurança;
- fixture não aparece para usuário cliente.

7. RLS E AUDITORIA
Confirmar:
- sem sessão não lê checklist_cadastral nem case_timeline_events;
- cliente não lê dados internos da Ana;
- usuário interno autorizado acessa apenas organização/caso permitidos;
- alteração relevante cria log sanitizado;
- dados sensíveis aparecem como [protegido];
- updated_by vem do servidor/sessão.

==================================================
E. TESTES AUTOMATIZADOS
==================================================

Criar/executar testes:
1. Usuário não autenticado não acessa App.
2. Usuário autenticado sem vínculo não acessa caso.
3. Caso pré-onboarding não vê Entrega, Fase 1 ou Fase 2.
4. Legado e Conta permanecem visíveis para usuário autorizado.
5. Legado sem projeção publicada exibe apenas estado vazio sanitizado.
6. Relatório F1 em rascunho/revisão/aprovado internamente não libera Fase 1.
7. Projeção F1 publicada e autorizada libera somente Fase 1.
8. Fase 2 permanece oculta sem projeção F2 publicada.
9. Rota direta de área não liberada redireciona sem vazamento.
10. Fixture não aparece no App produtivo.
11. Cliente não consulta diretamente tabelas internas de pesquisa/evidência.
12. Nenhuma mudança no estado NO_GO da Ana ocorre durante o teste.

==================================================
F. ENTREGA
==================================================

Gerar relatório interno com:
- componentes, rotas e gates alterados;
- menu do App por estado de jornada;
- testes aprovados/reprovados;
- rotas/larguras mobile testadas;
- bloqueios preservados;
- erros encontrados, sem corrigir fora do escopo;
- confirmação de que Legado e Conta permanecem permanentes;
- confirmação de que Entrega, Fase 1 e Fase 2 são progressivas;
- confirmação de que Ana permanece NO_GO;
- confirmação de nenhuma ação externa, publicação, mensagem, contrato, cobrança, pesquisa, pasta ou integração.
```

---

## 3. Gate pós-smoke

Só avançar para preparação de instrumentos e, posteriormente, assinatura, se:

- [ ] Smoke test técnico aprovado ou falhas críticas corrigidas.
- [ ] Proposta revalidada/substituída e escopo verificável.
- [ ] Cadastro real completo e validado.
- [ ] Condição comercial, parcelas e `case_service` homologados.
- [ ] Matriz jurídica bloqueante decidida por revisão humana.
- [ ] Representação de Felipe documentada se houver contrato/App/anexo para ele.
- [ ] Preparação de instrumentos retornar apenas prévia interna sem bloqueio crítico.

A assinatura, o pagamento e o onboarding real exigem confirmação humana individual por ação externa.
