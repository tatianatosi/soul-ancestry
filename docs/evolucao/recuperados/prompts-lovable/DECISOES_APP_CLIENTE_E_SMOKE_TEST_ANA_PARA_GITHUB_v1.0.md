# Decisões do App Cliente e smoke test Ana — registro para GitHub

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Decisão normativa e plano de validação  
**Destino no repositório:** `docs/governanca/DECISOES_APP_CLIENTE_E_SMOKE_TEST_ANA_v1.0.md`  
**Caso de referência:** `CA-CID-AT-FAM-2026-001`

---

## 1. Objetivo

Registrar a política definitiva de visibilidade do App Cliente e o smoke test interno do piloto Ana. Esta decisão corrige interpretações anteriores: não se deve ocultar áreas aprovadas do mockup apenas porque ainda não há conteúdo publicado.

---

## 2. Soberania do mockup

1. O mockup aprovado é contrato visual, de nomenclatura, ordem e navegação.
2. Nenhuma área aprovada pode ser removida, renomeada, deslocada ou simplificada sem registro na matriz de conformidade.
3. Dados, permissões, estados e projeções podem adaptar a experiência dentro da estrutura aprovada; não criam navegação paralela.
4. Módulos internos do Desk não devem ser refletidos como abas no App Cliente.

---

## 3. Política de visibilidade

### 3.1 Áreas permanentes

Todas as áreas aprovadas no mockup permanecem visíveis para usuário autenticado e autorizado, respeitando os nomes e a ordem aprovados. Isso inclui, conforme aplicável no mockup:

- Home.
- Jornada/Andamento.
- Radar.
- Árvore/Família.
- Documentos.
- Legado.
- Conta.
- Ajuda, atendimento, privacidade e demais áreas aprovadas.

Quando não existir conteúdo para uma área permanente, ela exibe estado vazio sanitizado e aprovado. Ela não deve sumir, ficar como teaser comercial, exibir erro técnico, conteúdo de fixture ou informação interna.

### 3.2 Áreas progressivas

Somente as áreas abaixo são progressivas e podem ficar ocultas até liberação explícita:

- Entrega.
- Fase 1.
- Fase 2.

| Área | Regra de liberação |
|---|---|
| Entrega | Existe entrega/projeção sanitizada, aprovada, publicada e autorizada ao cliente |
| Fase 1 | Existe relatório/entrega F1 disponível, projeção publicada, pessoa autorizada e gate de jornada satisfeito |
| Fase 2 | Existe relatório/entrega F2 disponível, projeção publicada, pessoa autorizada e gate de Fase 2 satisfeito |

Rota direta para área progressiva não liberada deve redirecionar de forma segura, sem carregar parcialmente dados ou vazar informação interna.

### 3.3 Legado e Conta

**Legado** permanece sempre visível. Não é fase comercial, produto automático ou entrega desbloqueada pela simples existência de componente. Sem conteúdo publicado, mostra estado vazio sanitizado. Conteúdo de legado exige projeção/entrega sanitizada, aprovada, publicada e autorizada.

**Conta** permanece sempre visível. Exibe apenas perfil autorizado, preferências, privacidade, consentimentos e vínculos explicitamente permitidos. Não exibe dados internos, evidências, fontes, notas, preço técnico, SKU, margem, risco, hipóteses, logs ou auditoria.

---

## 4. Fronteira Desk/App

```text
Desk interno
→ dados, fontes, evidências, relações, hipóteses, riscos, formalização, preço, auditoria
→ validação humana e sanitização
→ app_projection/client_deliverable aprovado e publicado
→ App Cliente
```

O App Cliente não consulta diretamente registros internos de genealogia, pesquisa, documentos, formalização ou auditoria. Exemplos de dados proibidos no App sem projeção autorizada:

- Perfis e relações genealógicas internas.
- Eventos e linhagens internas.
- Evidências, fontes e pedidos documentais.
- Achados e encontros não publicados.
- Riscos, hipóteses, trilhas internas e validação jurídica.
- Preço, SKU, condição comercial e `case_service`.
- Links internos, URLs, transcrições, logs e documentos brutos.

---

## 5. Estado Ana

Para o piloto Ana, enquanto houver `NO_GO`:

- Todas as áreas permanentes do mockup permanecem visíveis quando o acesso ao App for autorizado.
- Elas mostram apenas conteúdo sanitizado e estados vazios aprovados quando não houver projeção publicada.
- Entrega, Fase 1 e Fase 2 permanecem ocultas.
- Não ativar App real, onboarding, documentos, árvore, linhagens, relatórios, achados ou conteúdo de legado sem gates e publicação aplicáveis.
- O smoke test é interno, não autoriza liberação externa ou mudança de estado da Ana.

---

## 6. Smoke test obrigatório

O smoke test deve validar, sem ações externas:

1. Persistência: editar, salvar, reler, comparar e recarregar.
2. Feedback: salvando, salvo, erro de campo, nenhuma linha afetada e divergência de persistência.
3. Guard de rascunho: salvar/descartar/cancelar para rota, subaba, caso e refresh.
4. Mobile: acesso a todos os eixos do Desk e todas as áreas aprovadas do App.
5. Identidade: referências por ID para Ana, Adair, Alice e Felipe.
6. Dependente: bloqueio de participação de Felipe sem representação documentada.
7. Proposta/formalização: validade, extração, condição, `case_service`, matriz jurídica e gates.
8. Pesquisa: nenhuma pesquisa, fonte externa, pedido, gasto, contato ou dado fictício inserido.
9. App: áreas permanentes visíveis; somente Entrega/Fase 1/Fase 2 progressivas.
10. RLS/auditoria: sem sessão sem acesso; cliente sem leitura interna; logs sanitizados; autoria por sessão.

Falhas encontradas no smoke test devem ser registradas por código, rota, entidade, condição e impacto. Não devem ser corrigidas no mesmo corte se saírem do escopo aprovado.

---

## 7. Critérios para liberação real

O smoke test não libera contrato, assinatura, pagamento ou onboarding. Antes de ação real, é necessário:

- Proposta Canva revalidada ou substituída, com escopo verificável.
- Cadastro de participantes e contratada completo e verificado.
- Produto, condição, parcelas e `case_service` homologados.
- Critérios de aceite decididos.
- Matriz jurídica bloqueante decidida por revisão humana.
- Representação de Felipe documentada se ele participar de contrato, App ou anexo.
- Preparação interna de instrumentos sem bloqueio crítico.
- Confirmação humana específica para cada ação externa irreversível.

---

## 8. Arquivos relacionados

- `docs/governanca/REGISTRO_DECISOES_IMPLEMENTACOES_ANA_v1.0.md`.
- `docs/governanca/REGISTRO_MESTRE_DECISOES_E_CREDITOS_20-08-2026_v1.0.md`.
- `docs/governanca/ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md`.
- `docs/seguranca/MAPA_PERSISTENCIA_ABA_CASOS_v1.0.md`.
- `docs/G01_IDENTIFICADORES_CANONICOS_v1.0.md`.
- `docs/G02_PESSOAS_E_LINHAGENS_v1.0.md`.
- `docs/G03_BIBLIOTECA_EVIDENCIAS_E_PROJECOES_v1.0.md`.
- `docs/G04_PESQUISA_DOCUMENTOS_E_SOLICITACOES_v1.0.md`.
- `docs/G05_RELATORIOS_FASE_v1.0.md`.

---

## 9. Changelog

### v1.0 — 20/08/2026

- Registrada política final de áreas permanentes e progressivas no App Cliente.
- Corrigida a interpretação anterior: Legado não é área progressiva.
- Confirmado que todas as demais áreas aprovadas no mockup permanecem visíveis.
- Criado roteiro de smoke test interno da Ana, sem efeitos externos.
