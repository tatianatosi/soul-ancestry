# Dossiê-Mãe de Inteligência Genealógica e Jurídica: Consolidação Global (13 Países)

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: dossiê-mãe de inteligência e governança transversal
caminho_sugerido_no_repositorio: docs/arquitetura/dossie-mae-inteligencia-global.md
fontes:
  - docs/relatorios/2026-10-11-extracao-operacional-8-paises.md
  - docs/relatorios/2026-10-11-extracao-operacional-bloco-2.md
  - docs/arquitetura/especificacao-skills-varredura-discovery-multipais.md
  - docs/arquitetura/especificacao-dossie-assistente-ia-autoridade.md
  - Tabela planner_catalog_feed e genealogical_sources_catalog (Supabase)
  - CA04_Artefato_Consolidado_v1.0.1.md
escopo: >
  Consolidação executiva do Dossiê-Mãe de Inteligência do Clube Ancestral,
  cobrindo a arquitetura transversal das 13 nações europeias mapeadas,
  a esteira unificada de extração (WhatsApp -> Discovery SPIN -> Checklist -> Dossiê-Mãe),
  o catálogo multi-país de acervos arquivísticos e os motores de IA/análise quali-quanti.
premissas:
  - O Dossiê-Mãe é o tronco comum estruturado da família no Desk Intelligence.
  - Acesso estritamente privado e restrito à Proprietária (sem vazamento para o App Cliente).
  - Zero duplicação de dados: uma única verdade por núcleo familiar.
criterio_de_aceite: >
  Dossiê-Mãe mestre documentado com as 13 fichas operacionais;
  matriz de RLS e persistência garantida em Supabase;
  fluxo de apoio analítico homologado via Claude 3.5 Haiku.
```

## 1. O Conceito e a Arquitetura do Dossiê-Mãe

O **Dossiê-Mãe** é a coluna dorsal do Desk Intelligence. Ele funciona como o repositório centralizado e imutável que custodia toda a documentação, transcrições e decisões probatórias de um núcleo familiar.

### 1.1. Estrutura Canônica de 4 Pastas (Desk & Google Drive)
Para cada família atendida (ex.: Família Silveira / Friedmann-Reimer), o Dossiê-Mãe organiza-se em 4 pastas operacionais:
- **`00_Dossie_Mae`**: Ficha de identidade genealógica, árvore viva, cronologia do ancestral e parecer jurídico preliminar.
- **`01_Documentos_Cliente`**: Acervo fornecido pela família via WhatsApp ou formulários (passaportes antigos, cartas, fotos, certidões parciais).
- **`02_Evidencias_Europeias`**: Certidões paroquiais e civis localizadas nos acervos do país de origem, fichas de serviço militar e extratos de censos/Heimatrecht.
- **`03_Instrucao_e_Protocolo`**: Certidões de inteiro teor brasileiras, Certidão Negativa de Naturalização (CNN), retificações judiciais/extrajudiciais, traduções juramentadas e apostilamentos de Haia.

---

## 2. Esteira Unificada de Ingestão e Processamento

O fluxo do lead até a montagem da pasta no Desk opera sob uma esteira contínua de 4 estágios:

```
[ Entrada Multicanal ] (WhatsApp Business / Site / Formulários)
          │
          ▼ 
[ Skill Perplexity ca-client-go-live ] (Varredura por palavras-chave nativas do país)
          │
          ▼
[ Roteiro Discovery Mestre 15 min ] (Aplicação do método SPIN Selling)
          │
          ▼
[ Dossiê-Mãe no Desk Intelligence ] (Alimentação das tabelas research_* e crm_casos)
```

---

## 3. Matriz dos 13 Países Integrados no Dossiê-Mãe

| # | País | Via Jurídica Canônica | Acervos Centrais de Busca | Termo-Chave Probatório Primário |
|---|---|---|---|---|
| 1 | **Itália** | *Jus Sanguinis* (Comum / Materna 1948) | Portale Antenati, FamilySearch, Arquivos de Estado | `estratto per riassunto dell'atto di nascita` |
| 2 | **Alemanha** | Art. 116, II / § 15 StAG (Reparação) | Standesamt local, Bundesarchiv Berlim/Koblenz | `Geburtsurkunde`, `Melderegister`, `Ahnenpass` |
| 3 | **Áustria** | § 58c StbG (Reparação Histórica) | ÖStA Viena, MA 35, MA 8, Kriegsarchiv | `Auszug aus der Heimatrolle`, `Heimatschein` |
| 4 | **Portugal** | Art. 1º, 1, 'd' (Netos / Filhos) | Arquivos Distritais (Tombo.pt), CRC Lisboa | `assento de baptismo`, `registo paroquial` |
| 5 | **Croácia** | Art. 11/16 Lei de Cidadania Croata | Hrvatski državni arhiv (Zagreb), Paróquias | `rodni list`, `vjenčani list`, `domovnica` |
| 6 | **Hungria** | *Egyszerűsített honosítás* (Simplificada) | Magyar Nemzeti Levéltár (MNL Budapeste) | `születési anyakönyv`, `honosítás` |
| 7 | **Espanha** | Lei de Memória Democrática / Código Civil | PARES, Registros Civis Municipais | `partida literal de nacimiento`, `Registro Civil` |
| 8 | **França** | Art. 21-14 / Código Civil | Archives Départementales, ANOM, SCEC Nantes | `acte de naissance`, `livret de famille` |
| 9 | **Polônia** | Confirmação (*Poświadczenie*) | Archiwa Państwowe (Szukajwarchiwach), AGAD | `akt urodzenia`, `Księgi meldunkowe` |
| 10 | **Luxemburgo** | Art. 7 e 23 (Recuperação de linha) | Archives Nationales de Luxembourg (ANLux) | `acte de naissance`, `commune de 1900` |
| 11 | **Romênia** | Art. 10 e 11 Lei 21/1991 (Territorial) | Arhivele Naționale ale României, ANC | `certificat de naștere`, `dosar cetățenie` |
| 12 | **Irlanda** | *Foreign Births Register* (FBR) | General Register Office (GRO), National Archives | `Civil Birth Certificate`, `FBR Application` |
| 13 | **Reino Unido** | *By Descent* / British Nationality Act | General Register Office (GRO UK), TNA Kew | `Certified Copy of an Entry of Birth` |

---

## 4. O Copiloto de IA: Operação Privada e Custo Otimizado

- **Inteligência Padrão**: **Claude 3.5 Haiku** via streaming seguro (`stream: true`).
- **Custo Médio**: Menos de R$ 0,02 por dossiê processado.
- **Função**: Leitura paleográfica, detecção de divergências de datas, alertas de naturalização antes do nascimento e montagem automática de minutas de pareceres em `research_reports`.
- **Governança**: 100% isolado por `organization_id` e visível apenas para o login administrativo da Proprietária (`tati@pluggedresearch.com`).
