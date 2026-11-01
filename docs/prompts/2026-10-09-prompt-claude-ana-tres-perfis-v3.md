# Prompt Claude — três perfis funcionando e jornada Ana Luiza

Status: em revisão
Versão: v3.0 — redação final para execução controlada
Data: 2026-10-09
Responsável pela decisão: Proprietária do Clube Ancestral
Fontes de evidência: pedido atual; revisões desta conversa; Ficha Master de 54 campos de 01/10; registro mestre familiar; consulta GitHub de 06/10 registrada na conversa.
Escopo: recuperar primeiro os perfis Ana Luiza, Adair e Alice; depois integrar ficha, evidências, árvore, contrato, Portal e App existentes.
Premissas: um caso familiar, um núcleo, três titulares individuais e um contrato familiar; Felipe menor dependente.
Limites: este documento não comprova funcionamento nem autoriza automaticamente escrita em dados reais, migration/RLS, acesso externo, publicação ou produção. O GitHub não foi reconferido em 09/10; os cortes anteriores precisam ser verificados no HEAD atual.
Substitui: versões anteriores deste prompt na conversa; não substitui políticas aprovadas.
Próximos passos: executar P0, devolver prova individual e bloqueios específicos; solicitar separadamente autorizações para atos reais.
Destino após aprovação: docs/prompts/2026-10-09-prompt-claude-ana-tres-perfis-v3.md.

## Prompt executável para Claude

```text
MODO EXECUÇÃO CONTROLADA — P0: ANA, ADAIR E ALICE FUNCIONANDO.
Caso exclusivo: CA-CID-AT-FAM-2026-001.

OBJETIVO
Recuperar primeiro o funcionamento dos três perfis existentes.
Depois fechar a rastreabilidade Lead→Discovery→Caso→Pesquisa→Contrato→Portal→App, com ficha detalhada e árvore dos antepassados até Ana.

Preserve:
- 3 titulares individuais: Ana Luiza, Adair e Alice;
- 1 núcleo familiar;
- 1 caso familiar;
- 1 contrato familiar com três partes e status individual de assinatura;
- Felipe como dependente menor, sem assinatura própria, com representação documental quando aplicável;
- antepassados como pessoas genealógicas, não contratantes ou usuários automáticos.

LIMITES
Não criar DEMO, duplicar fichas/rotas/tabelas/fontes/motores, fundir pessoas por semelhança, apagar/arquivar dados, enviar/convidar/cobrar/assinar/publicar, fazer push/merge/deploy.
Corrigir código local e executar testes é o escopo técnico.
Escrita em dados reais, vínculo de acesso, ativação, migration/RLS e atos externos exigem autorização específica.
Não contornar gates nem usar service_role para simular cliente.

PRIORIDADE
Três perfis primeiro.
Não condicione abertura/edição do perfil interno à árvore completa, aos 54 campos preenchidos ou a contrato assinado.
Preserve os gates legítimos de acesso externo, onboarding e pesquisa.
Não abrir auditoria global, redesign, catálogo ou novo motor.

0. CONFERÊNCIA CURTA — NÃO RECOMEÇAR O QUE JÁ EXISTE

Confirme branch/HEAD, alterações locais, rotas existentes e ambiente Lovable/Supabase vigente.
Não sobrescreva trabalho de outro agente.

Use os cortes da revisão de 06/10 como pistas, não como estado atual:
- evidência canônica: b654b246;
- heatmap por ramo: 707879f7;
- Ficha Única: 9c023ded;
- rascunho App: 6077a1d5;
- identidade: e72ce722;
- União de Ramos: e7819a7d;
- radar: b1350e4d;
- contrato v2: 8544739f;
- anexos/OS: b0107676 e 08c83ee9.

Confira sua presença e consumo no código atual.
Reutilize o existente; não reinstale cortes nem reverta mudanças posteriores por documentação antiga.
Não alterar navegação, salvo correção mínima indispensável para alcançar a rota dos perfis.

1. P0 — RECUPERAR CADA UM DOS TRÊS PERFIS

Resolva os registros reais de Ana Luiza, Adair e Alice por IDs, organização, composição do caso e núcleo.
Nome ajuda a localizar; não autoriza fusão ou vínculo automático.
Resolva o código canônico para o ID técnico correto; código não é UUID.

Para CADA titular, confira e corrija:
abrir perfil no Desk
→ ler cadastro real
→ editar campo permitido
→ salvar pelo writer existente
→ conferir retorno do servidor
→ reler a fonte
→ conferir histórico
→ F5/reabrir e confirmar persistência.

Escrita no registro real somente após autorização.
Sem ela, teste em ambiente isolado, sem inserir fixtures na base real, e declare prova persistida real pendente.

Corrija a causa concreta mínima:
ID/contexto perdido, leitor errado, writer não chamado, erro ignorado, loading infinito, cache, sessão/callback ou permissão incompatível.
Toast e estado local não comprovam salvamento.

Em seguida, confira acesso externo INDIVIDUAL:
usuário autenticável↔cliente↔caso,
estado autorizado,
callback/magic link,
sessão após F5,
destino correto,
conteúdo e permissões corretos.

Trate sessão ausente, link expirado/usado, acesso negado e caso não liberado com mensagem e saída claras, sem DEMO.
Prévia da equipe não prova login de cliente.
Não usar uma sessão como se fossem três titulares.
Não criar/enviar convites nem ativar acesso automaticamente.

Se faltar usuário, vínculo, autorização ou credencial de teste:
nomeie o bloqueio por pessoa e a operação exata necessária.
Não declare “três perfis funcionando”.

Entregue o resultado P0 antes das etapas seguintes.
Continue correções independentes; pause somente o ato que depende de nova decisão/autorização.

2. ORIGEM COMERCIAL E FICHA PROGRESSIVA

Recupere a rastreabilidade existente:
Lead→Call/Discovery→oportunidade→proposta confirmada→handoff→Pessoa/Núcleo/Caso→Planejador→formalização→Portal→App.

Preserve narrativa, objetivo, consentimento efetivamente registrado, respostas/fontes, confiança, responsável, prazo e próxima ação.
Origem ausente = NAO_LOCALIZADO.
Não fabricar lead/evento passado nem fazer Ana regredir de lifecycle.

leadId, pessoaId, nucleoId, contratoId, authUserId e caseId são distintos e vinculados.
Não forçar o mesmo identificador em todas as entidades.

Conecte a Ficha Única existente aos 54 campos master.
Donos: Pessoa, Núcleo, Pesquisa, Planejador e Contrato.
Caso é o eixo, não uma ficha concorrente.

Sem quarta ficha, cópia de campos ou sobrescrita de divergência.
Ausência deve ser explícita.
Cobertura 54/54 significa mapeamento e validação, não inventar 54 valores.

Heatmap:
- 6 campos de apresentação: três países e três percentuais;
- 5 lacunas do mapa antigo: IDs 14–18; país 1 já tinha origem;
- conferir persistência por ramo e writer antes de propor schema;
- nulo não é 0%;
- não inventar país, fórmula, percentual ou chance jurídica.

Reutilize as regras vigentes de Radar.
A revisão anterior registrou App com 6 eixos e Desk com 4: reconferir, não redesenhar.

3. UMA CANÔNICA DE EVIDÊNCIAS

Confirme a canônica existente research_evidence_items, ligada ao caso por research_cases.case_id.
Pesquisa e Biblioteca são superfícies da mesma evidência.
Fonte, documento e projeção continuam entidades vinculadas; não fundir tudo numa tabela.

Isole DEMO do consumo real, sem apagar histórico ou impedir acesso legítimo a anexos históricos.

Use todas as tipologias existentes no corpus:
civil, eclesiástica, migratória, militar, notarial, cadastral/propriedade, imprensa, familiar, escolar/profissional, correspondência, fotografia/audiovisual e demais cadastradas.
Não criar taxonomia concorrente.

Separe:
natureza da fonte,
tipo documental,
formato,
workflow,
validação epistêmica.

Vincule:
base/repositório/localizador/documento,
pessoa/evento/relação,
data/localidade,
proveniência,
acesso,
revisão,
pendências.

Hipótese, lacuna, conflito, achado e conclusão não são sinônimos.
Base catalogada não confirma fato ou parentesco.
Homologação para consulta manual não autoriza scraping/API.
Não declarar direito ou elegibilidade jurídica.

4. ÁRVORE DOS ANTEPASSADOS ATÉ ANA

Reaproveite todos os antepassados e perfis existentes:
ancestrais→descendentes até Ana e núcleo.

Não limitar árvore aos três titulares nem aos três nomes resumidos da master.
Cada pessoa E cada vínculo deve ter evidência ou hipótese/pendência explícita.

Não inferir parentesco por nome, data ou localidade semelhante.
Preserve IDs, gerações, território, conexão-chave, conflitos/lacunas e estados de revisão.

Prepare árvore/genograma e projeções em prévia revisável.
Não publicar nesta execução.

O padrão replicável é regra e fluxo; nunca copiar dados reais da Ana para outro caso.

5. CONTRATO, PORTAL E APP

Preserve um contrato familiar com Ana, Adair e Alice como partes.
Felipe permanece dependente com representação documental quando aplicável.

Confira na fonte vigente o modelo v2.0/14 cláusulas registrado na revisão anterior.
Não reintroduzir versão histórica nem editar texto jurídico aprovado por conta própria.
Reutilize proposta vigente/aprovada, anexos, OS e condição comercial validados.

Confira o rascunho ESPECÍFICO da Ana:
partes, cláusulas, escopo, anexos e conteúdo.
O título “v2” não comprova conteúdo completo.

Se vazio:
corrigir o gerador;
solicitar autorização para regenerar/persistir versão real;
preservar snapshots.

Não inventar documento, telefone divergente, preço, vencimento, despesas ou escopo.

Modelo aprovado, rascunho completo, assinatura, pagamento e ativação são fatos distintos.
Não validar checklist por texto de teste, build verde ou existência de rascunho.

Contrato somente no Portal de assinatura, não como entrega no App.

Preserve sete abas existentes:
Home, Jornada, Radar, Árvore, Documentos, Legado e Conta.
Descobertas/Biblioteca são conteúdos contextualizados, não novas abas.

App consome somente projeções autorizadas/sanitizadas.
Rascunho deve ser editável antes da publicação.
Conta pode mostrar assinatura/upsell com preço estruturado especificamente aprovado.
Não expor proposta/contrato/parcelamento/preço técnico/margem/auditoria/URLs administrativas/dados internos brutos.

Compartilhamento respeita titular, processo/família e permissão documental.
Não dar acesso global automático ao núcleo.
Teste negação de outro caso/organização e de dados individuais não liberados.

PROVA E ENTREGA

Por correção:
rota→função→tabela/view→ação autorizada→resposta do servidor→releitura→histórico→F5.
Provar desktop e 375 px.

Rodar typecheck, testes direcionados aos três perfis, isolamento e build.
Separar falhas novas das anteriores.

Sem sessão/ambiente/dado/autorização = bloqueio nomeado, não PASSOU simulado.
Teste, commit, build e prévia não substituem prova autenticada da Proprietária.
Não enviar, assinar, pagar ou publicar para “testar”.

Atualize UM registro documental existente em docs/relatorios ou docs/auditorias:
status, data, fontes, escopo, premissas, limites, próximos passos e critério de aceite.
Não criar trilha documental paralela.

Devolva PRIMEIRO tabela Ana/Adair/Alice:
ID seguro;
perfil Desk;
salvar/reler/histórico/F5;
usuário/vínculo;
Portal;
App;
isolamento;
prova;
bloqueio e ação humana necessária.

Não incluir PII, tokens, credenciais ou URLs assinadas.

Depois:
diff/arquivos;
origem→destino→status;
54 campos mapeados/ausentes;
evidências/árvore;
contrato;
testes.

Distinguir:
IMPLEMENTADO_NO_CODIGO;
TESTADO_TECNICAMENTE;
COMPROVADO_EM_USO;
BLOQUEADO.

Não declarar jornada concluída nem três perfis funcionando sem comprovar os três.
PARE ao concluir o escopo.
Operação indispensável que exige autorização deve voltar nomeada, não ser executada silenciosamente.
```

## Critério de aceite

1. Cada titular abre o perfil correto sem DEMO; edição autorizada persiste, gera histórico e sobrevive ao F5.
2. Autenticação individual e isolamento são comprovados ou o impedimento está declarado por pessoa; prévia de equipe não conta como acesso cliente.
3. Três titulares continuam ligados a um caso/núcleo/contrato; Felipe e antepassados mantêm papéis distintos.
4. Os 54 campos possuem dono/fonte ou ausência explícita; evidências têm canônica única; árvore preserva antepassados e rastreabilidade dos vínculos.
5. Assinatura, pagamento, ativação e publicação não são inferidos ou fabricados.
6. Código, testes e prova operacional têm estados distintos; aceite final cabe à Proprietária.
