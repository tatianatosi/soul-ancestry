# Clube Ancestral — Jornada Completa Ana Luiza e Prompts de Implementação

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** roteiro canônico de execução controlada do caso-piloto  
**Caso:** `CA-CID-AT-FAM-2026-001`  
**Alias histórico:** `CA-AUT-ANALUIZA-FAM-2026-001`  
**Trilha:** Áustria — §58c StbG  
**Responsável e supervisora:** Tatiana Melani Tosi

---

## 1. Objetivo

Completar a jornada da Ana Luiza como caso-piloto real do Desk Intelligence, sem atalhos e sem criar efeitos externos antes dos gates aplicáveis.

A jornada deve validar o fluxo completo:

```text
Proposta aceita
→ confirmação formal
→ cadastro e núcleo
→ proposta Canva/especificação de escopo
→ case service e condição
→ revisão jurídica
→ contrato/OS
→ assinatura
→ pagamento
→ onboarding
→ caso ativo
→ pesquisa/evidências
→ relatório F1/F2
→ entregas e atualização de jornada
→ protocolo, se aplicável
→ conclusão e continuidade
```

---

## 2. Estado atual

| Domínio | Estado |
|---|---|
| Proposta | Aceita formalmente em 14/08/2026 |
| Comercial | Confirmação formal recebida |
| Formalização | Em preparação |
| Status derivado | Pré-onboarding bloqueado |
| Proposta Canva | Origem Canva reconhecida; requer referência interna, páginas 1–7 e extração estruturada para completude |
| Case service | Rascunho; produto-pai Diagnóstico Familiar Multipaís + trilha Áustria §58c |
| Condição de R$ 9.600 | Referência interna de proposta; não é cobrança, preço homologado nem Asaas |
| Núcleo | Ana, Adair, Alice, Felipe dependente; Adriel interlocutor fora do núcleo contratual |
| Dependente | Felipe com representação pendente; inicialmente sem contrato/App/anexo individual |
| Pesquisa | Preparação pendente; nenhuma pesquisa externa autorizada |
| Onboarding | Não iniciado |

---

## 3. Bloqueios atuais

1. Completude da proposta Canva.
2. Cadastro completo da Ana e participantes aplicáveis.
3. Dados oficiais da contratada verificados.
4. Case service, escopo e condição comercial formalizados.
5. Critérios de aceite definidos.
6. Matriz jurídica revisada nos temas bloqueantes.
7. Método de assinatura definido.
8. Contrato e Anexo I/OS ainda não preparados.
9. Nome completo/dados de Alice pendentes de confirmação.
10. Representação legal de Felipe pendente se ele passar a participar de contrato/App/anexo.
11. Cobrança/Asaas não iniciados.
12. Autorização de pesquisa e escopo de pesquisa pendentes.

---

## 4. Jornada e gates

| Fase | Objetivo | Entrada | Saída | Ação externa permitida? |
|---|---|---|---|---|
| A — Evidência comercial | Registrar proposta aceita | Aceite formal | Proposta conferida | Não |
| B — Cadastro e núcleo | Identificar participantes e dados | Proposta conferida | Cadastro mínimo validado | Somente após confirmação específica |
| C — Escopo e condição | Consolidar serviço contratado | Cadastro + proposta | Case service aprovado | Não |
| D — Jurídico | Resolver temas bloqueantes | Escopo consolidado | Matriz jurídica aprovada | Não |
| E — Instrumentos | Preparar contrato/OS | Gates A–D | Rascunho pronto para revisão | Não sem confirmação específica |
| F — Assinatura | Enviar/confirmar | Instrumento aprovado | Contrato assinado | Sim, somente confirmação específica |
| G — Financeiro | Criar cobrança autorizada | Contrato assinado | Pagamento inicial confirmado | Sim, somente confirmação específica |
| H — Onboarding | Ativar operação | Pagamento confirmado | Plano, dossiê, checklist e primeira entrega | Comunicação/ações após confirmação específica |
| I — Pesquisa | Trabalhar evidências | Autorização aplicável | Pesquisa e relatórios | Pesquisa externa só com gates/autorização |
| J — Jornada | Entregar valor e acompanhar | Caso ativo | Entregas aprovadas e atualizações | Cliente recebe apenas conteúdo aprovado |

---

## 5. Prompts em ordem

### Prompt Ana-01 — Proposta Canva e escopo

```text
CASO ANA — CORTE A: COMPLETAR E CONFERIR A PROPOSTA CANVA.

NÃO CRIAR CONTRATO, OS, ASSINATURA, COBRANÇA, LINK, PASTA, PESQUISA EXTERNA OU MENSAGEM.

No caso CA-CID-AT-FAM-2026-001:
- registrar deck_reference_interna;
- registrar páginas 1–7;
- cadastrar conteúdo estruturado por página;
- marcar campos não localizados sem inferir;
- executar conferirEscopoProposta;
- mostrar campos extraídos, ausentes, conflitos, anexos afetados e bloqueios;
- gravar auditoria sanitizada;
- manter bloqueio de contrato/assinatura/financeiro se houver pendência.

Não alterar o Canva nem exigir/gravar URL externa em logs.
```

### Prompt Ana-02 — Cadastro, família e dependente

```text
CASO ANA — CORTE B: VALIDAR CADASTRO E NÚCLEO FAMILIAR.

NÃO ENVIAR FORMULÁRIO, MENSAGEM, CONTRATO OU CRIAR DOCUMENTO EXTERNO.

Criar checklist registrável de cadastro:
- Ana: CPF, RG, profissão, estado civil, endereço, CEP, telefone e e-mail.
- Adair: dados cadastrais necessários.
- Alice: confirmar nome completo e dados aplicáveis.
- Felipe: vínculo com Ana, status de representação e necessidade contratual/App/anexo.
- Dados oficiais da contratada: razão social, CNPJ, endereço, e-mail e representante, pendentes de fonte societária.

Regra:
- Não inferir dados.
- Cada dado pertence à pessoa, não ao caso global.
- Marcar status cadastral, fonte, data de verificação e acesso restrito.
- Criar próxima ação datada e rascunho de comunicação, sem envio.
```

### Prompt Ana-03 — Case service e condição

```text
CASO ANA — CORTE C: CONSOLIDAR CASE SERVICE, ESCOPO E CONDIÇÃO COMERCIAL.

NÃO CRIAR SKU NOVO, PREÇO NOVO, CONTRATO, COBRANÇA OU LINK ASAAS.

Criar/ajustar case_service:
- produto-pai: Diagnóstico Familiar Multipaís;
- trilha: Áustria / §58c;
- núcleo: Ana, Adair, Alice e Felipe dependente;
- escopo vindo da proposta Canva conferida;
- condição R$ 9.600 apenas como referência interna pendente de formalização;
- status: draft ou approved somente se todos os campos internos estiverem preenchidos;
- registrar divergências entre proposta, catálogo, planejador e condição.

Criar checklist de critérios de aceite por entrega, ainda como pendente de decisão humana.
Não liberar financeiro.
```

### Prompt Ana-04 — Matriz jurídica e instrumentos

```text
CASO ANA — CORTE D/E: MATRIZ JURÍDICA E PREPARAÇÃO DE INSTRUMENTOS.

NÃO REDIGIR CLÁUSULAS FINAIS, NÃO CRIAR CONTRATO REAL, OS REAL, ASSINATURA OU COBRANÇA.

No painel de preparação contratual:
- mostrar matriz jurídica e 12 temas;
- mostrar quais temas bloqueiam assinatura;
- registrar decisão humana, versão jurídica, justificativa, responsável e data;
- exibir dependente Felipe e bloquear somente se contrato/App/anexo for ativado sem representação documentada;
- exigir proposta Canva completa, cadastro, case service, condição e critérios de aceite antes de liberar rascunho de instrumentos.

Preparar apenas checklist e prévia interna de campos, sem texto jurídico final.
```

### Prompt Ana-05 — Onboarding registrável

```text
CASO ANA — CORTE H: PREPARAR ONBOARDING SEM ATIVAR CLIENTE.

NÃO ENVIAR BOAS-VINDAS, NÃO GERAR MAGIC LINK, NÃO PUBLICAR APP, NÃO CRIAR PASTA OU GRUPO EXTERNO.

Criar template de onboarding para Ana com estado Bloqueado até contrato assinado e pagamento inicial confirmado:
- responsável principal Tatiana Melani Tosi;
- núcleo familiar e papéis;
- dossiê-mãe: Em preparação;
- ambiente autorizado; nível de acesso;
- checklist inicial;
- plano de ação;
- grupo familiar: Pendente;
- primeira micro-entrega: planejada até D7 após início;
- próximo touchpoint D10 e D14;
- filas de comunicação em rascunho.

Não abrir caso ativo ou pesquisa externa.
```

### Prompt Ana-06 — Ficha Piloto e preparação de pesquisa

```text
CASO ANA — CORTE I: FICHA PILOTO GENEALÓGICA E PREPARAÇÃO DE PESQUISA.

NÃO CONSULTAR FONTES, NÃO SOLICITAR DOCUMENTOS, NÃO CONTATAR ARQUIVOS, NÃO PUBLICAR ÁRVORE OU RELATÓRIO.

Criar:
- linhagem Áustria §58c;
- pessoas do núcleo e pesquisa, sem inferir antepassados;
- hipóteses/lacunas internas;
- pesquisa com status Preparação pendente;
- autorização de pesquisa Pendente;
- fontes/evidências existentes apenas como referências internas;
- Documento/Solicitação com status Não solicitado/A preparar;
- Plano de Ação de Pesquisa vazio/pronto para receber ações após autorização.

Não criar achado, relatório F2, documento ou ligação familiar como confirmado sem evidência.
```

### Prompt Ana-07 — Primeira entrega e jornada pós-gates

```text
CASO ANA — CORTE J: CONFIGURAR JORNADA APÓS GATES, SEM PUBLICAÇÃO.

Não executar enquanto contrato, pagamento e autorização aplicável não estiverem confirmados.

Criar regras de preparação:
- contrato assinado + pagamento inicial confirmado + responsável + núcleo + dossiê + plano = onboarding iniciado;
- onboarding iniciado = primeira micro-entrega planejada até D7;
- D10 = alerta interno;
- D14 = alerta crítico e rascunho de atualização;
- toda entrega cliente-facing exige app_projection/client_deliverable aprovada;
- Relatório F1 e F2 só iniciam conforme estado real de pesquisa;
- Encontro de Linhagem só pode nascer após duas linhas/evidências validadas.

Não enviar nem publicar nada nesta entrega.
```

---

## 6. Critérios de conclusão da jornada Ana

A jornada só é considerada completa quando:

1. A proposta Canva estiver completa e conferida.
2. Cadastro e núcleo estiverem validados conforme participantes aplicáveis.
3. Case service, escopo, condição e critérios de aceite estiverem definidos.
4. Matriz jurídica bloqueante estiver resolvida por revisão humana.
5. Instrumentos forem criados/enviados apenas após confirmação específica.
6. Contrato for assinado.
7. Pagamento inicial for confirmado na fonte transacional.
8. Onboarding tiver plano, dossiê, checklist, responsáveis e primeira entrega planejada.
9. Pesquisa externa só tiver iniciado com autorização aplicável.
10. Relatórios, evidências e entregas forem aprovados antes de qualquer projeção ao cliente.

---

## 7. Registro obrigatório por fase

Cada fase deve gerar:

- evento imutável;
- responsável;
- próxima ação e prazo;
- bloqueios e resolução;
- referência de evidência;
- alerta no Desk;
- rascunho de comunicação quando aplicável;
- aprovação humana antes de ação externa.
