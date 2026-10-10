# Bloco 5A — Fichas de Pesquisa, Bases Genealógicas, Evidências e Arquitetura Backend
## Clube Ancestral · Ancestral Canvas

Status: aprovado
Versão: v2.0 (Canônica - Centro de Inteligência)
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: Instrução da Proprietária de 10/10/2026; Bloco 5A original de 11/08/2026; Adendo 5A de governança M1-M6; Mapa de Repositórios Abertos (80+ bases); Revisão de Coerência v1.1.
Escopo: Catálogo canônico da Memória Europeia, taxonomia de evidências, Ficha de Pesquisa por Caso, esteira progressiva e governança cliente-facing.

---

## 1. Princípios e Regras Centrais

1. **Integração invisível, evidência explicável:** O App Cliente nunca acessa URLs técnicas, APIs, tokens, scores algorítmicos ou tabelas de scraping. Ele exibe apenas: resumo aprovado, estado de validação legível, data de atualização e próximo passo em linguagem simples.
2. **Pesquisa não é conclusão jurídica automática:** O achado em base documental orienta a árvore e gera hipótese, mas não substitui a certidão oficial e a validação humana de ato formal.
3. **Linguagem de Legado Blindada:** Terminantemente vedado o uso de linguagem terapêutica ("cura ancestral", "constelação familiar", "trauma herdado" ou determinismo por nacionalidade). Toda narrativa é educativa e documental.
4. **Isolamento de Produtos e SKUs:** Relatórios, cadernos de linhagem, pranchas e cards não criam SKUs novos. Eles operam dentro dos 9 Produtos-Pai canônicos (PP-01 a PP-09).
5. **Visibilidade Soberana da Proprietária:** Por padrão no Desk, registros de pesquisa e pessoas operam no nível `standard` (editáveis e visíveis à proprietária). Apenas a proprietária promove para `aprovada`, o que gera a projeção pública para o App Cliente.

---

## 2. Estrutura da Ficha Canônica de Pesquisa por Caso

```
FICHA DE PESQUISA POR CASO (ESTEIRA PROGRESSIVA)
══════════════════════════════════════════════════
case_id:                    [UUID interno do caso]
pessoa_principal:           [Nome completo validado da titular]
objetivo_pesquisa:          [Objetivo genealógico em linguagem civil]
pais_contexto:              [País da rota - 20 países da Memória Europeia]
linha_familiar:             [Nome da linhagem documentada]
pessoas_relacionadas:       [Ponteiros cliente_id para a Pessoa 360]
relacoes:                   [Vínculos de parentesco e união de ramos]
geracoes:                   [1 a 10 gerações publicáveis]
eventos_civis:              [Nascimento, casamento, óbito, imigração]
documentos:                 [Status: solicitado, recebido, conferido, validado]
fontes_consultadas:         [Catálogo de 80+ bases com taxonomia M1–M6]
evidencias:                 [Itens em research_evidence_items]
variantes_nome:             [Variações mapeadas com justificativa]
pendencias:                 [Pendências reais documentais]
grau_confianca:             [alto | medio | baixo | inicial]
responsavel_pesquisa:       [Pesquisador responsável]
proxima_acao:               [Próximo passo operacional da jornada]
regra_visibilidade:         [app | desk_only | one_page | pdf_aprovado]
```

---

## 3. Estados de Validação e Níveis de Confiança

| Estado | Significado Operacional | Exibição no App Cliente |
|---|---|---|
| `informação_compartilhada_familia` | Dado verbal ou relato sem documento inicial | "Informação compartilhada pela família" |
| `dado_pesquisa_inicial` | Registro preliminar em acervo aberto | "Dado de pesquisa inicial" |
| `em_validacao_documental` | Em conferência junto à fonte primária ou cartório | "Em confirmação" |
| `validado_por_documento` | Confirmado por certidão oficial ou livro original | "Identificado / Validado por documento" |
| `pendente_confirmacao` | Registro inconclusivo que aguarda nova fonte | "Pendente de confirmação" |
| `nao_aplicavel` | Linha ou evento não pertinente ao caso | Não exibido |

---

## 4. Catálogo Canônico da Memória Europeia (80+ Bases)

Substitui a antiga "Base Italiana" isolada por uma cobertura multilateral dos 20 países mapeados:

### Categorias de Acesso e Governança (M1 a M6)
- **M1 (Consulta Humana Guiada):** Paróquias, cúrias diocesanas, arquivos presenciais de comune/comarca e cartórios civis brasileiros (exige consentimento).
- **M2 (Link Profundo e Metadados Públicos):** Portale Antenati, Arquivo Nacional Torre do Tombo (DigitArq), Szukaj w Archiwach, ÖStA Áustria, PARES Espanha, ANOM França, Arquivo Nacional do Brasil.
- **M3-CANDIDATA (Endpoints sob Validação Técnica):** FamilySearch, Matricula Online, Find a Grave. (Nenhuma fonte automatizada sem validação de termos).
- **M4 (Parceria Institucional ou Demanda Sob Taxa):** Arquivos consulares, arquivos restritos e serviços de busca local sob demanda.
- **M5 (Bases Metodológicas Internas):** Cadernos de metodologia, inventário de comunas italianas, playbooks por país e rotas documentadas do Clube Ancestral.
- **M6 (Fontes Colaborativas Exploratórias):** Geneanet, MyHeritage, árvores abertas do Ancestry (geram pistas preliminares; nunca prova final).

---

## 5. Dossiê Estruturado e Caderno de Encontros de Linhagem

A jornada do cliente não recebe dumps de texto brutos ou cópias de conversas de WhatsApp:

1. **Encontros de Linhagem (`lineage_encounters`):**
   - Registra cruzamentos de linhagens, rotas migratórias e contextos de chegada ao Brasil.
   - Campos canônicos: `territorios_migratorios`, `contexto_historico`, `memoria_familiar` e `resumo_aprovado_cliente`.
2. **Projeção no App Cliente (`/portal/legado`):**
   - Exibe a narrativa editorial curada do Caderno de Encontros de Linhagem.
   - Contém o disclaimer obrigatório: *"Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico."*
3. **Árvore da Vida Dinâmica (`/portal/arvore`):**
   - Visualização gráfica de até 10 gerações reais alimentada por nós aprovados com `client_visibility = 'aprovada'`.

---

## 6. Critérios de Aceite para Lançamento

- Esteira progressiva ativada: Lead → Pessoa 360 → Caso 360 → Projeção no App.
- Zero barreiras por SKUs técnicos obsoletos ou planilhas mestres desativadas.
- Contrato de Estudo Genealógico v2 pronto em 16 cláusulas numeradas e PDF binário de 8 páginas.
- Login por link mágico sem senha em `/acesso` para os membros autorizados da família.
