> **Decisão explícita da proprietária (Tatiana, 2026-09-10 / 2026-09-11).** Superfície operacional: `AGENTS.md` e `.cursor/rules/clube-ancestral.mdc`. Registro vivo de provas: `docs/relatorios/2026-09-11_registro-prova-autenticada.md`. Este arquivo é o texto integral do adendo; não reinterpretar como redesenho de menu, vocabulário CHECK-* ou autorização de merge/deploy.

# Clube Ancestral — Adendo Vinculante
## Contexto Não Arquivável e Prova Visual Autenticada da Proprietária

```yaml
status: rascunho
data: 2026-09-10
responsável pela decisão: Proprietária do Clube Ancestral
fonte(s) de evidência:
  - decisão explícita da proprietária nesta conversa em 10/09/2026
  - CA_RESET_CONTEXTO_CANONICO_RECONSTRUCAO_CONTROLADA_2026-09-10.md
escopo: >
  Estabelecer regra obrigatória de continuidade: nenhum contexto, prompt,
  decisão, premissa, artefato, mockup, roteiro, matriz, contrato de sistema
  ou registro de resgate pode ser arquivado enquanto os motores e premissas
  do Clube Ancestral não estiverem funcionando de forma integrada como um só produto.
premissas:
  - O Clube Ancestral é um produto único, não um conjunto de módulos isolados.
  - A prova de funcionamento precisa ocorrer no ambiente autenticado da própria
    proprietária, com evidência visual de tela e resultado verificável.
  - Documento, teste automatizado, PR verde, log, mock, tela sem login ou
    declaração de agente não substituem prova visual autenticada da dona.
limites:
  - Este adendo não autoriza alteração de dados, contratos, pagamentos, RLS,
    permissões, migrations, integrações, publicações, mensagens ou merges.
  - Print não substitui controles técnicos; complementa teste de persistência,
    RLS e auditoria.
próximos passos:
  - Incorporar esta regra em todo prompt, PR, artefato e critério de aceite futuro.
  - Criar registro de prova autenticada por motor e por fluxo transversal.
critério de aceite: >
  Nenhum contexto é arquivado antes de a proprietária autenticar, executar e
  registrar evidência visual dos motores integrados no produto, com resultado
  persistente e rastreável.
```

---

## 1. Regra vinculante: contexto não arquivável

A partir deste adendo, fica proibido arquivar, substituir, reduzir a “histórico”, ocultar como concluído ou retirar da continuidade qualquer um dos itens abaixo enquanto o Clube Ancestral não tiver funcionamento comprovado como produto integrado:

- prompts de arquitetura, implementação, correção, resgate, operação, pesquisa, comercial, formalização, financeiro, jornada e app;
- decisões da proprietária;
- premissas de produto;
- mockups aprovados;
- roteiros de Calls e Discovery;
- dicionários, taxonomias, regras e matrizes de contexto;
- especificações de motores;
- documentos de resgate e de-para;
- políticas de dados, visibilidade, fonte, privacidade, acesso e auditoria;
- artefatos de teste, critérios de aceite e registros de problemas;
- referências necessárias para compreender por que um componente existe e qual é sua função no produto.

### Proibição expressa

Nenhum agente pode concluir:

> “isso já foi resolvido, então pode arquivar”

apenas porque existe código, PR, teste automatizado, documento, commit, tela, migration, mockup, log ou resposta anterior.

O contexto só poderá ser arquivado quando a proprietária, autenticada no ambiente real, tiver verificado que o motor correspondente funciona dentro do fluxo integrado do Clube Ancestral.

---

## 2. Princípio: um produto, não módulos soltos

Os motores e premissas precisam funcionar em conjunto. Uma tela isolada, uma tabela preenchida ou uma função unitária não comprovam o produto.

```text
Marketing & Comercial
→ Lead / Mesa Discovery / Call
→ Pessoa 360 e Dossiê
→ Caso 360 e Planejador
→ Inteligência & Pesquisa
→ Proposta / Formalização / Financeiro
→ Entrega / Jornada / App Cliente
→ Hoje e Radar como leitura diária
```

A cadeia deve preservar a fonte e o contexto do mesmo lead, pessoa, caso e decisão. Não é aceitável que o usuário tenha de redigitar os mesmos dados em vários módulos ou confiar em listas paralelas.

### O que significa “funcionar como um só produto”

| Critério | Comprovação exigida |
|---|---|
| Identidade contínua | A mesma pessoa permanece reconhecível de Lead → Discovery → Pessoa → Caso, sem duplicação indevida. |
| Contexto contínuo | País, linha, objetivo, origem, pessoas citadas, documentos e pendências passam entre os módulos com fonte e status. |
| Próxima ação contínua | A ação criada em Discovery ou Caso aparece em Hoje/Radar sem duplicar o registro. |
| Pesquisa conectada | Lacunas e documentos do Caso/Pessoa podem ser encaminhados para Pesquisa com vínculo correto. |
| Formalização conectada | A proposta e os dados revisados do caso aparecem no fluxo de formalização sem redigitação indevida. |
| Financeiro contextual | O estado financeiro do caso tem fonte identificada e não é inferido por texto ou planilha histórica. |
| Entrega controlada | Achados e microentregas passam por revisão/liberação antes de aparecer ao cliente. |
| Visibilidade segura | App Cliente recebe apenas projeção autorizada; conteúdo interno e sensível não vaza. |
| Governança preservada | RLS, sessão, permissões, auditoria e isolamento por organização/caso permanecem íntegros. |

---

## 3. Prova obrigatória com login da proprietária

Toda declaração de funcionamento deve ser acompanhada de prova visual produzida pela **proprietária autenticada em sua própria conta** no ambiente alvo.

### Evidência mínima por teste

Cada execução deve registrar:

1. **Print inicial autenticado**
   - Tela com sessão autenticada da proprietária.
   - Rota/título legível.
   - Identificação segura do objeto testado: lead, pessoa, caso ou item, sem expor dados pessoais desnecessários.

2. **Print da ação**
   - Campo, botão ou fluxo usado.
   - Alteração, aceite, criação de rascunho ou transição realizada.
   - Se houver dado sensível, ocultar/mascarar no print sem apagar o contexto funcional.

3. **Print de confirmação**
   - Retorno visual claro de sucesso, bloqueio ou erro.
   - Mensagem não basta como prova final se a ação deveria persistir.

4. **Print de releitura**
   - F5 completo, reabertura da tela ou nova sessão autenticada.
   - Valor, estado, pendência ou vínculo continua presente no local correto.

5. **Print de integração**
   - O mesmo fato aparece no segundo contexto necessário: por exemplo, próxima ação de Discovery aparece em Hoje; pedido documental aparece em Pesquisa e no Caso; bloqueio de contrato aparece em Caso 360.

6. **Registro de resultado**
   - `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE` ou `NAO_LOCALIZADO`.
   - Data/hora, ambiente, rota, motor testado e limitação do teste.

### Evidência que não basta sozinha

- Print de ambiente sem login autenticado da proprietária.
- Print de mockup, DEMO, fixture, preview sem dado real ou estado local.
- Teste automatizado verde.
- Build verde.
- PR verde.
- Código existente.
- Log técnico sem comportamento visível.
- Toast sem releitura após salvar.
- Declaração de qualquer agente, IA, desenvolvedor ou relatório.

---

## 4. Matriz de prova por motor

| Motor | Teste autenticado mínimo | Prova de integração |
|---|---|---|
| Mesa Discovery / CRM | Abrir lead, colar entrada de teste, revisar varredura, registrar SPIN, resultado, responsável e próxima ação; salvar e recarregar. | A próxima ação aparece em Marketing & Comercial e em Hoje, sem duplicar registro. |
| Pessoa 360 | Abrir pessoa vinculada, completar/editar um dado permitido, salvar e recarregar. | O mesmo vínculo aparece no Caso 360 e preserva origem/status do dado. |
| Varredura de dossiê | Informar pessoa/caso e palavras-chave em fontes autorizadas; gerar inventário. | Item aceito aparece no dossiê/Pessoa/Caso com referência de fonte e revisão humana. |
| Pesquisa e evidências | Criar ou revisar uma lacuna, documento, evidência ou pedido; salvar e recarregar. | A pendência aparece em Inteligência & Pesquisa, no Caso e em Hoje quando for prioritária. |
| Contexto de países / jurídico | Abrir contexto de país de um caso e conferir fonte/versão/estado de revisão. | Alerta ou pendência aparece no Radar/Caso sem ser apresentado como parecer final. |
| Proposta / formalização | Abrir proposta/caso, conferir vínculo e completar parâmetro permitido; salvar/reabrir. | Pendência/estado de formalização é refletido no Caso 360 e em Hoje quando exigir ação. |
| Financeiro | Consultar estado financeiro referenciado e validar que status não é inventado; quando houver escrita autorizada, salvar/reler. | Impacto do estado aparece no Caso/Radar, sem gerar cobrança ou pagamento automático. |
| Entregas / App Cliente | Revisar/liberar uma entrega em ambiente autorizado; abrir a projeção do cliente com acesso correto. | Conteúdo permitido aparece no App; conteúdo interno/sensível permanece ausente. |
| KPIs e Hoje | Abrir um KPI, conferir fonte/lista e resolver ou atualizar um item; recarregar. | O card e a fila atualizam sem criar segundo registro. |
| Abas / taxonomia | Navegar autenticada pelas seis áreas e abrir os contextos. | Um objeto fica em sua aba proprietária e só aparece como resumo/link nas demais. |

> **Nota de mapeamento (não é autorização de redesenho nem de arquivamento):** o texto da matriz cita “seis áreas”. Isso mapeia para os **6 grupos vigentes** do Desk: Hoje · Marketing & Comercial · Pessoas & Casos · Inteligência & Pesquisa · Formalização & Financeiro · Governança & Administração. O App Cliente permanece com **7 abas** (`Home` · `Jornada` · `Radar` · `Árvore` · `Documentos` · `Legado` · `Conta`). O texto de **8 grupos** da memória permanente (CA-UX-03) permanece **contexto ativo** até `COMPROVADO_EM_USO` — não arquivar, não tratar como superado, não restaurar como menu sem nova decisão explícita. Radar é leitura/camada, não 7ª aba da sidebar.

---

## 5. Condição para arquivamento

Um contexto somente poderá ser arquivado após cumprir **todos** os itens abaixo:

- O motor associado está `COMPROVADO_EM_USO` pela proprietária autenticada.
- O teste contém os quatro prints obrigatórios: inicial, ação, confirmação e releitura.
- Quando o motor participa de cadeia, há print de integração com o módulo seguinte ou anterior.
- A fonte de dado, escopo de organização e isolamento de caso foram conferidos no comportamento observado.
- Não há dependência não resolvida em outro motor necessário para o fluxo.
- A proprietária declarou explicitamente que o contexto deixou de ser necessário para a continuidade ativa.
- O destino do arquivo é registrado: `arquivado`, `substituído por`, motivo, data e responsável.

### Contextos que permanecem ativos até o produto integrado

Permanecem obrigatoriamente ativos, independentemente de haver código ou PR, até a prova integrada:

- arquitetura do Desk Simplificado;
- Mesa Discovery, varredura de WhatsApp e roteiro SPIN;
- Pessoa 360 e regras de núcleo/dossiê;
- varredura de dossiê por pessoa/caso e palavra-chave;
- Central de Inteligência, Bases Genealógicas, Biblioteca, Dicionários e Trilhas;
- contexto multi-país e validação jurídica;
- proposta, contrato, anexos, formalização e financeiro;
- Radar de carteira e Radar de caso;
- indicadores vivos e cockpit Hoje;
- regras de projeção e visibilidade do App Cliente;
- RLS, sessão, permissões, auditoria e privacidade.

---

## 6. Obrigação de aplicação contínua

Esta regra deve ser incluída, por referência, em:

- todo prompt para Claude Code, Lovable, desenvolvedor ou agente;
- toda especificação de motor;
- todo relatório de teste;
- todo checklist de PR;
- todo pedido de merge;
- todo documento de de-para, resgate ou arquitetura;
- toda proposta de arquivamento, remoção, simplificação ou migração.

### Texto obrigatório de rodapé

Adicionar o bloco abaixo aos próximos artefatos técnicos e operacionais:

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```

---

## 7. Limites e garantia

Esta regra não elimina a necessidade de controles técnicos: RLS, auditoria, permissões, validação de servidor e testes automatizados continuam obrigatórios quando aplicáveis.

O print autenticado resolve outra lacuna: comprovar que a proprietária consegue realmente acessar, compreender, executar e reencontrar o resultado na interface que usará no dia a dia.

Nenhum agente pode pedir para a proprietária repetir testes já documentados com esse protocolo, salvo se houver alteração concreta de fluxo, ambiente, dado, permissão ou regressão que invalide a prova anterior.

---

## 8. Critério final

O Clube Ancestral só poderá deixar de depender deste contexto de resgate quando a proprietária puder percorrer, autenticada e com prints de prova:

```text
Entrada comercial
→ Mesa Discovery
→ Pessoa/Dossiê
→ Caso/Jornada
→ Pesquisa/Evidência
→ Proposta/Formalização
→ Financeiro
→ Entrega/App Cliente
→ Hoje/Radar
```

Até esse momento, o contexto continua ativo, versionado e acessível. Nenhuma parte essencial será arquivada por parecer concluída, por estar em código ou por decisão unilateral de um agente.

```text
REGRA DE CONTINUIDADE — CONTEXTO NÃO ARQUIVÁVEL

Nenhum contexto, premissa, decisão, prompt, mockup, matriz, roteiro ou artefato
vinculado a este fluxo pode ser arquivado, reduzido a histórico ou considerado
substituído enquanto os motores relacionados não estiverem comprovadamente
funcionando como um único produto do Clube Ancestral.

A comprovação exige teste executado pela Proprietária autenticada em sua própria
conta, com print inicial, ação, confirmação, releitura após F5/reabertura e,
quando aplicável, print de integração com o módulo seguinte. Código, PR, build,
teste automatizado, log, mockup, preview ou declaração de agente não bastam
isoladamente.

Resultado permitido: PASSOU, FALHOU, BLOQUEADO_POR_DADO,
BLOQUEADO_POR_DECISAO, ERRO_DE_FONTE ou NAO_LOCALIZADO.
```
