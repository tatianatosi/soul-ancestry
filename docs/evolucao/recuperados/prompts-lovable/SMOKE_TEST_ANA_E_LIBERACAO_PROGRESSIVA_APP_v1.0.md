# Smoke test Ana e liberação progressiva do App Cliente

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Prompt final de validação funcional e decisão de visibilidade progressiva  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Estado atual:** `NO_GO` até conclusão dos gates humanos, comerciais, jurídicos e operacionais

---

## 1. Decisão de produto

As áreas **Entrega Fase 1**, **Entrega Fase 2** e **Legado** não devem aparecer como abas ativas, vazias ou navegáveis para cliente antes do estágio de jornada que as libera.

O mockup aprovado continua soberano. O App Cliente deve preservar sua estrutura visual e de navegação, mas a visibilidade de módulos depende de gates do caso, onboarding e conteúdo efetivamente aprovado.

### Regras de visibilidade

| Área/App | Estado antes do onboarding | Regra de liberação |
|---|---|---|
| Home | Pode exibir estado sanitizado de pré-onboarding, se existir acesso autorizado | Conteúdo mínimo e aprovado; nunca mostrar dados internos ou promessas |
| Jornada / Próximos passos | Oculta ou mostra somente onboarding aprovado | Contrato assinado, pagamento inicial confirmado, onboarding iniciado e conteúdo sanitizado |
| Entrega Fase 1 | Oculta antes da entrega F1 existir | Relatório F1 ou entrega robusta F1 aprovado, entregue e com projeção App publicada |
| Entrega Fase 2 | Oculta antes da entrega F2 existir | Relatório F2 ou entrega robusta F2 aprovado, entregue e com projeção App publicada |
| Legado | Oculta até produto/etapa de legado aplicável | Jornada de legado contratada ou conteúdo de legado aprovado/publicado |
| Documentos | Ocultos até acesso e documento liberados | Documento/entrega autorizada e projeção sanitizada publicada |
| Árvore / Linhagens | Oculta até projeção autorizada | Árvore/achado/entrega sanitizada aprovada e publicada |
| Conta | Pode existir após acesso autorizado | Usuário autenticado e vínculo autorizado |

### Princípios

1. Não usar abas vazias como “teaser” de serviço não contratado ou não iniciado.
2. Não expor Fase 1, Fase 2 ou Legado por existir rota, componente, relatório em rascunho, pesquisa interna ou dado de fixture.
3. Acesso ao App não é sinônimo de acesso a todas as áreas.
4. O App Cliente lê somente `app_projections` e/ou `client_deliverables` publicados, sanitizados e autorizados para o caso/pessoa.
5. Desk e App não devem compartilhar diretamente evidências, fontes, hipóteses, riscos, preços, documentos brutos, transcrições, links internos ou dados de terceiros.
6. Se uma área ainda não estiver liberada, a navegação deve ser removida/ocultada de forma consistente, sem redirecionar para tela quebrada.

---

## 2. Estimativa final de créditos Lovable

A sequência G foi entregue e o fluxo/UI base já está pronto. A estimativa anterior de 550–1.100 créditos adicionais deve ser reduzida.

| Bloco restante | Lovable estimado | Observação |
|---|---:|---|
| G-01B — etiqueta fixture/lista/menu/build | 10–30 | Microcorte visual; pode ser absorvido em outra entrega |
| ANA-SAVE-SEC-01B — guard, toasts e feedback visual | 80–160 | Parte técnica deve ir para Claude Code; Lovable só UI |
| Controle de liberação progressiva App | 50–100 | Ajuste de fluxo/visibilidade, sem redesenho |
| Correções UI Ana A–E e mobile | 60–120 | Somente correções observáveis após decisões humanas |
| Smoke test e regressões visuais | 80–150 | Correções estritamente bloqueantes |
| Reserva final | 100–180 | Apenas regressão crítica |
| **Total adicional provável** | **380–740** | Não inclui novas frentes ou integrações |

### Limites

- Meta de gasto: **até 500 créditos adicionais**.
- Stop-loss: pausar Lovable se 200 créditos forem gastos sem fechar um fluxo verificável.
- Teto: **740 créditos**, exigindo nova decisão explícita.
- Migrations, RLS, FKs, regras de servidor, testes e infraestrutura devem ir para Claude Code/GitHub.

---

## 3. Pré-condições do smoke test

O smoke test não autoriza assinatura, pagamento ou onboarding real. Ele valida rotas, persistência, permissões, estados, gates e visibilidade com dados internos autorizados ou fixtures controladas.

Antes de executar:

- [ ] ANA-SAVE-SEC-01B concluído ou os caminhos testados têm persistência comprovada.
- [ ] Caso Ana permanece `NO_GO` enquanto gates humanos estiverem pendentes.
- [ ] Nenhum fixture é exibido em listas, alertas, Painel Hoje ou App Cliente produtivo.
- [ ] Proposta Canva, cadastro, condição comercial, matriz jurídica e dependente mantêm seus bloqueios atuais.
- [ ] Não há contrato, OS, assinatura, cobrança, pasta, pesquisa externa, mensagem ou publicação real sendo criada.

---

## 4. Prompt Lovable — visibilidade progressiva

```text
[ID ANA-APP-GATES-01] AJUSTAR A VISIBILIDADE PROGRESSIVA DO APP CLIENTE CONFORME ONBOARDING, JORNADA E CONTEÚDO APROVADO.

NÃO REDESENHAR O APP CLIENTE.
NÃO ALTERAR COPY JÁ APROVADA.
NÃO CRIAR NOVAS ABAS PRINCIPAIS.
NÃO PUBLICAR CONTEÚDO, NÃO ENVIAR MENSAGENS, NÃO CRIAR CONTRATO, COBRANÇA, LINK, DOCUMENTO, PASTA, PESQUISA EXTERNA OU INTEGRAÇÃO.

DECISÃO:
Entrega Fase 1, Entrega Fase 2 e Legado não podem aparecer no App Cliente antes de estarem efetivamente liberados pelo onboarding, pela jornada contratada e por conteúdo sanitizado aprovado/publicado.

A. NAVEGAÇÃO
- Preservar layout, nomenclatura e estrutura visual aprovada do mockup.
- Ocultar da navegação, sem deixar espaço vazio, abas/módulos não liberados.
- Não usar tab desabilitada como teaser de produto futuro.
- Não permitir acesso direto por rota a área não liberada; redirecionar de modo seguro para Home/Jornada autorizada, sem expor informação interna.

B. GATES DE VISIBILIDADE
Implementar gates de leitura no servidor e no App:

1. Acesso geral ao App:
- exige usuário autenticado, pessoa vinculada ao caso e permissão autorizada.

2. Jornada/onboarding:
- só mostrar conteúdo de onboarding depois de contrato assinado + pagamento inicial confirmado + onboarding iniciado, ou exceção formal aprovada.

3. Entrega Fase 1:
- só mostrar se existir relatório F1 ou entrega robusta F1 vinculada ao caso;
- status deve estar entregue/publicado;
- deve existir app_projection ou client_deliverable sanitizado, aprovado e publicado;
- pessoa atual precisa estar autorizada.

4. Entrega Fase 2:
- mesma regra para F2;
- não liberar porque há proposta, pesquisa interna, evidência, rascunho ou relatório em elaboração.

5. Legado:
- só mostrar se jornada/produto de legado for aplicável ao case_service ou se houver conteúdo de legado aprovado/publicado para o caso;
- não mostrar por componente/rota existir.

6. Documentos, árvore e linhagens:
- só mostrar itens com projeção sanitizada, acesso autorizado e publicação explícita;
- nunca ler tabelas internas diretamente.

C. ESTADOS SEGUROS
- Antes de onboarding liberado, cliente não deve ver Fase 1, Fase 2, Legado, documentos internos ou árvore.
- Quando houver acesso autorizado, Home pode mostrar apenas estado sanitizado aprovado e próximo passo real.
- Quando não houver conteúdo em uma área liberada, exibir estado vazio aprovado, sem prometer prazo, resultado, cidadania ou avanço inexistente.

D. CASO ANA
- Ana permanece NO_GO.
- Não ativar acesso real, onboarding, F1, F2, Legado, documentos, árvore ou entregas da Ana nesta entrega.
- Usar somente fixture controlada/estado simulado interno para testar visibilidade, sem exibir fixture para cliente real.
- Confirmar que, no estado atual da Ana, F1, F2 e Legado não aparecem no menu do App Cliente.

E. TESTES
1. Usuário não autenticado não acessa App.
2. Usuário autenticado sem vínculo não acessa caso.
3. Caso pré-onboarding não vê F1, F2 ou Legado.
4. Relatório F1 em rascunho/aprovado internamente mas não entregue não libera F1.
5. Projeção F1 publicada e autorizada libera apenas F1.
6. F2 continua oculta quando não publicada.
7. Legado continua oculto sem produto/conteúdo aplicável.
8. Rota direta de área não liberada não expõe dados e redireciona com segurança.
9. Fixture não é exibida no App produtivo.

F. ENTREGA
Mostrar:
- gates implementados;
- componentes/rotas alterados;
- resultado dos testes;
- menu do App por estado de jornada;
- confirmação de que nenhuma publicação, mensagem, contrato, cobrança ou ação externa foi executada.
```

---

## 5. Prompt Lovable — smoke test do piloto Ana

```text
[ID ANA-SMOKE-01] EXECUTAR SMOKE TEST INTERNO E NÃO DESTRUTIVO DO PILOTO ANA.

CASO: CA-CID-AT-FAM-2026-001.
ESTADO OBRIGATÓRIO: NO_GO.

NÃO CRIAR OU ALTERAR CONTRATO, OS, ANEXO, ASSINATURA, COBRANÇA, LINK DE PAGAMENTO, CLIENTE ASAAS, PASTA, DOCUMENTO EXTERNO, PESQUISA EXTERNA, MENSAGEM, CALENDÁRIO, TAREFA EXTERNA, INTEGRAÇÃO OU PUBLICAÇÃO NO APP.
NÃO PREENCHER DADOS AUSENTES POR INFERÊNCIA.
NÃO MUDAR O ESTADO DA ANA PARA ATIVO.

OBJETIVO:
Comprovar que Desk e App obedecem à jornada, aos gates, às permissões, à persistência e à visibilidade progressiva, sem executar ações externas nem liberar conteúdo da Ana.

A. PERSISTÊNCIA E FEEDBACK
Testar:
1. Editar um campo interno permitido da ficha Ana.
2. Salvar.
3. Reler o registro do servidor.
4. Confirmar que payload e registro relido coincidem.
5. Recarregar a página e confirmar persistência.
6. Confirmar feedback Salvando, Salvo às HH:MM ou erro específico.
7. Testar campo fora do mapa e confirmar CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA.
8. Testar update sem linha e confirmar NENHUMA_LINHA_AFETADA.
9. Testar divergência simulada/fixture e confirmar DIVERGENCIA_PERSISTENCIA.

B. RASCUNHO E NAVEGAÇÃO
Testar em desktop e mobile:
1. Alterar campo e trocar de subaba.
2. Confirmar modal: Salvar e continuar / Descartar alterações / Cancelar.
3. Confirmar que salvar e continuar só navega após persistência validada.
4. Confirmar que cancelamento mantém a pessoa na tela.
5. Confirmar que rotas Financeiro, Formalização, Matriz Jurídica, Pesquisa, Relatórios, Plano de Ação e Biblioteca estão acessíveis no mobile.

C. IDENTIDADE, NÚCLEO E DEPENDENTE
Confirmar:
1. Ana, Adair e Alice aparecem por referência de ID, sem identidade paralela de Adair.
2. Checklist de Adair usa pessoa/cliente canônicos.
3. Felipe possui dependent_person_id e titular_responsavel_legal_id válidos.
4. Felipe não é signatário, não possui App e não tem anexo individual.
5. Tentativa de ativar contrato/App/anexo para Felipe com representação pendente é negada no servidor/banco.
6. nucleoOk mostra critérios e pendências reais; não é apenas existência de linha.

D. PROPOSTA, COMERCIAL E FORMALIZAÇÃO
Confirmar:
1. Proposta Canva está vinculada ao caso, com deck/páginas registrados.
2. Validade expirada e extração parcial continuam visíveis como bloqueio.
3. Campos ausentes não são inferidos.
4. case_service permanece draft se critérios/condição não estiverem decididos.
5. Produto/condição sem homologação rastreável bloqueiam preparação.
6. Matriz jurídica bloqueante pendente impede assinatura.
7. Painel de preparação não habilita versão final, assinatura, financeiro ou onboarding.

E. PESQUISA E EVIDÊNCIAS
Confirmar:
1. Ficha Piloto, Biblioteca de Evidências, Pesquisa/Documentos, Relatórios, Achados e Plano de Ação estão acessíveis somente a perfis internos autorizados.
2. Nenhuma pessoa, evento, documento, evidência ou achado fictício foi adicionado à Ana.
3. Nenhuma fonte externa, consulta, solicitação, gasto, contato ou pesquisa foi iniciada.
4. Evidência restrita e fonte interna não aparecem no App.
5. F1 e F2 estão não iniciados quando não houver dados reais/evidências apropriadas.

F. APP CLIENTE E VISIBILIDADE PROGRESSIVA
Confirmar no estado atual da Ana:
1. App não mostra Entrega Fase 1.
2. App não mostra Entrega Fase 2.
3. App não mostra Legado.
4. App não mostra documentos, árvore, linhagens, fontes, riscos, hipóteses, preço ou dados internos.
5. Rota direta de área não liberada é negada/redirecionada sem vazamento.
6. Fixture não aparece para cliente.

G. RLS E AUDITORIA
Confirmar:
1. Sem sessão não lê checklist_cadastral nem case_timeline_events.
2. Cliente não lê dados internos da Ana.
3. Usuário interno autorizado acessa somente pela sessão e organização permitidas.
4. Alteração relevante produz log sanitizado; campos sensíveis aparecem como [protegido].
5. updated_by é preenchido pelo servidor/sessão, não pelo payload.

H. RESULTADO
Gerar relatório interno com:
- testes aprovados/reprovados;
- rotas e largura de tela testadas;
- gates verificados;
- bloqueios preservados;
- erros encontrados;
- correções estritamente necessárias;
- evidência de que Ana permanece NO_GO;
- confirmação de nenhuma ação externa.

Não corrigir itens fora do escopo durante o smoke test. Se houver falha, registrar com código, rota, entidade, condição e impacto para correção posterior.
```

---

## 6. Checklist humano pós-smoke

Após o smoke test técnico, a revisão humana da Ana deve responder, sem alterar sistemas externos ainda:

- [ ] A proposta será renovada, substituída ou formalmente revalidada?
- [ ] Todos os dados de Ana, Adair, Alice e da contratada foram coletados e verificados?
- [ ] Produto, preço, condição, parcelas e vencimentos foram homologados?
- [ ] Os critérios de aceite do `case_service` foram decididos?
- [ ] Os temas jurídicos bloqueantes receberam decisão e versão jurídica aplicável?
- [ ] Felipe participará de contrato, App ou anexo? Se sim, a representação está documentada?
- [ ] A prévia interna de instrumentos está sem bloqueios críticos?

Somente depois dessas respostas e dos gates passarem, preparar contrato para assinatura; o envio para assinatura exige confirmação humana específica.

---

## 7. Changelog

### v1.0 — 20/08/2026

- Registrada decisão de ocultar Entrega Fase 1, Entrega Fase 2 e Legado até liberação progressiva.
- Registrada estimativa Lovable revisada de 380–740 créditos adicionais, com meta de até 500.
- Criados prompts `ANA-APP-GATES-01` e `ANA-SMOKE-01`.
- Definidos gates, testes e checklist humano para encerramento técnico do Lovable.
