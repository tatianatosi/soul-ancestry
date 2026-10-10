# Bloco 5B — Centro de Inteligência Genealógica, Motor de Pesquisa e Fila de Publicação
## Clube Ancestral · Ancestral Canvas

Status: aprovado
Versão: v1.0 (Canônica - Centro de Inteligência)
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: Instrução da Proprietária de 10/10/2026; Bloco 5A v2.0; Mapa de Repositórios Abertos (80+ bases); G-08 Bloco 5B-Pre; Decisão D-09 (M3-APROVADA).
Escopo: Motor de Pesquisa Interna, esteira de elevação de evidências, Fila de Publicação App Cliente, gestão de hipóteses e auditoria de consultas.

---

## 1. Princípios Operacionais do Bloco 5B

1. **Pesquisa Assistida por Especialista:** O Centro de Inteligência opera como ferramenta de trabalho para a equipe de genealogistas. Nenhuma busca automatizada toma decisões ou publica na árvore sem validação humana.
2. **Critério Estrito para M3-APROVADA (Decisão D-09):** Nenhuma fonte é integrada via API direta sem autorização formal da proprietária, termos de uso validados, logs de requisição e rate limit estabelecido.
3. **Fila de Publicação Assíncrona e Segura:** O pesquisador trabalha na evidência bruta (`research_evidence_items`), mas o cliente só recebe a síntese sanitizada (`app_projections` / `portal_projecoes`) após clique explícito de aprovação.
4. **Isolamento de Acervo Privado:** Certidões, documentos notariais e fotos de família pertencem ao titular do caso. Nunca vazam para outros casos nem são usados em treinos de modelos externos.

---

## 2. O Ciclo Canônico da Pesquisa (5 Fases)

```
[Fase 1: Pergunta de Pesquisa]
  ↳ Formulação da dúvida documental (ex.: "Localizar casamento de Adair Silveira c. 1912")
  ↳ Associação ao Caso e à Linhagem específica

[Fase 2: Seleção e Consulta de Fontes (M1–M6)]
  ↳ Consulta às bases do Catálogo da Memória Europeia (80+ bases mapeadas)
  ↳ Registro de log de consulta: data, parâmetros buscados, pesquisador responsável

[Fase 3: Captura da Evidência Bruta]
  ↳ Inclusão em `research_evidence_items` com nível de confiança (inicial / baixo / medio / alto)
  ↳ Registro de tipo documental (certidão, registro civil, paroquial, lista de passageiros)
  ↳ Se busca negativa: registro de escopo coberto (evita buscas repetidas)

[Fase 4: Validação e Elevação de Prova]
  ↳ Análise humana do documento original ou certidão
  ↳ Transição de estado: de `em_validacao_documental` para `validado_por_documento`
  ↳ Vínculo com a Pessoa Canônica (Pessoa 360) e evento correspondente

[Fase 5: Fila de Publicação ao App Cliente]
  ↳ Redação do resumo aprovado em linguagem simples (sem metadados técnicos)
  ↳ Definição de destino: Árvore (Genograma), Jornada, Documentos ou Caderno de Linhagem
  ↳ Promoção com `client_visibility = 'aprovada'` e `conteudo_aprovado = true`
```

---

## 3. Estrutura de Tabelas e Entidades do Motor 5B

| Entidade | Tabela no Banco | Papel no Motor | Visibilidade |
|---|---|---|---|
| **Casos de Pesquisa** | `research_cases` | Agrupador da pesquisa genealógica por caso | Desk |
| **Pessoas da Pesquisa** | `research_people` | Indivíduos mapeados na linhagem | Desk (projeção App se aprovada) |
| **Evidências** | `research_evidence_items` | Documentos, livros, certidões e registros encontrados | Desk |
| **Validações** | `evidence_validations` | Histórico de conferência humana e elevação de prova | Desk |
| **Achados** | `genealogical_findings` | Fatos genealógicos provados a partir de evidências | Desk |
| **Encontros de Linhagem**| `lineage_encounters` | Cruzamentos de famílias, migrações e memórias | Desk → App (Legado) |
| **Projeções do App** | `app_projections` | Dados finais sanitizados autorizados para o cliente | App Cliente (portal) |

---

## 4. Fronteira de Projeção no App Cliente

O que o cliente vê no App em cada uma das 7 telas a partir do motor 5B:

1. **Home (`/portal`):** Status geral da pesquisa, próxima etapa em andamento e aviso de novos documentos liberados.
2. **Jornada (`/portal/jornada`):** Linha do tempo dos marcos da pesquisa concluídos e em conferência.
3. **Radar (`/portal/radar`):** Progresso de validação nas 6 dimensões públicas (sem notas matemáticas brutas).
4. **Árvore (`/portal/arvore`):** Nós familiares de 1 a 10 gerações (G1–G10) com visibilidade `aprovada`.
5. **Documentos (`/portal/documentos`):** Lista de certidões e arquivos liberados com status "Recebido" ou "Validado por documento".
6. **Legado (`/portal/legado`):** Caderno de Encontros de Linhagem com narrativa histórica, rotas e chegada ao Brasil.
7. **Conta (`/portal/conta`):** Dados do titular e assinatura ativa (sem ofertas internas de upsell).

---

## 5. Critérios de Aceite Operacional

- Nenhuma evidência é projetada no App Cliente sem revisão humana e aprovação explícita.
- Toda consulta gera log de auditoria associado ao usuário pesquisador.
- Casos e evidências respeitam o isolamento estrito por `organization_id`.
- O Desk opera integrado via `SaasShell` nas 11 superfícies operacionais v4.
