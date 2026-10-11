# Mapeamento da Próxima Varredura: Países, Casos Ativos, Fontes e Skills de Apoio

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: roteiro de varredura e inteligência de pesquisa
caminho_sugerido_no_repositorio: docs/arquitetura/roteiro-proxima-varredura-paises-e-casos.md
fontes:
  - Tabela planner_catalog_feed (9 produtos-pai e 11 vias nacionais)
  - Dimenso-SKU2025DaniloCrociaNcleoIvanKlujber-SKUnov.csv (Caso Croácia)
  - 03-Arquitetura-Unica-de-Oferta-e-Jornada-Clube-Ancestral.pdf (Casos Giovanna, João Marcelo, Danilo)
  - CA04_Artefato_Consolidado_v1.0.1.md (Dicionário de Validações do CRM)
  - docs/arquitetura/especificacao-skills-varredura-discovery-multipais.md
escopo: >
  Definição dos países, casos e palavras-chave que entram na próxima rodada de varredura automatizada
  pelas skills do Perplexity, integrando os acervos documentais europeus mapeados no Desk.
premissas:
  - Ana Luiza (Áustria § 58c) foi a validação do método piloto.
  - A próxima varredura expande o modelo para os casos reais da carteira (Itália, Croácia, Portugal e Alemanha).
  - Cada país possui dicionário de termos nativos de busca paroquial/civil.
criterio_de_aceite: >
  Mapeamento dos 4 países prioritários imediatos e dos 5 secundários;
  associação direta entre caso ativo, país, fontes de arquivo e palavras-chave de extração.
```

## 1. Prioridade Imediata (Próximos 4 Países / Casos Reais)

Após o sucesso do piloto austríaco com Ana Luiza, os seguintes países entram na fila imediata de varredura semântica e estruturação de dossiê:

### 1. Itália (Casos de Referência: Giovanna Prade e João Marcelo)
- **Via Jurídica**: *Jus Sanguinis* (Administrativo / Judicial - Via Materna 1948 ou Contra as Filas Consulares).
- **Casos da Carteira**: `CA-ITA-GIOVANNA-PRADE`, `João Marcelo`.
- **Dicionário de Palavras-Chave para Varredura**:
  - `estratto per riassunto dell'atto di nascita`, `atto di matrimonio`, `stato delle anime`, `parrocchia`, `diocesi`, `leva militare`, `foglio matricolare`, `comune di nascita`, `Certidão Negativa de Naturalização (CNN)`, `Dante Causa`, `sbarco`, `Hospedaria dos Imigrantes`.
- **Arquivos & Fontes Centrais**: Portale Antenati, FamilySearch (Registros Civis Italianos), Archivio di Stato provincial, Paróquias locais, APESP / SIAN (Brasil).

### 2. Croácia (Caso de Referência: Danilo / Núcleo Ivan Klujber)
- **Via Jurídica**: Cidadania por Descendência Direta (Art. 11/16 da Lei de Cidadania Croata).
- **Caso da Carteira**: `Danilo Croácia` (Linhagem Ivan -> Andrija -> Catharina -> Dayse -> Danilo).
- **Dicionário de Palavras-Chave para Varredura**:
  - `rodni list` (nascimento), `vjenčani list` (casamento), `smrtni list` (óbito), `domovnica` (cidadania), `MUP Zagreb`, `Consulado da Croácia em SP`, `porto de Rijeka/Fiume`, `registro de estrangeiro no Uruguai/Brasil`.
- **Arquivos & Fontes Centrais**: Hrvatski državni arhiv (Arquivo de Estado em Zagreb), Paróquias croatas, Arquivo Público do RS/SP.

### 3. Portugal (Linha de Netos / Aquisição)
- **Via Jurídica**: Lei da Nacionalidade Portuguesa (Art. 1º, nº 1, alínea 'd' - Netos de Portugueses).
- **Casos da Carteira**: Leads qualificados em triagem comercial e pipeline ativo.
- **Dicionário de Palavras-Chave para Varredura**:
  - `assento de baptismo`, `assento de nascimento`, `concelho`, `freguesia`, `passaporte português`, `registo paroquial`, `CRC Lisboa`, `ligação efectiva à comunidade`, `fixação de apelidos`.
- **Arquivos & Fontes Centrais**: Arquivos Distritais (Tombo.pt / Direção-Geral do Livro), Conservatória dos Registos Centrais de Lisboa (CRC).

### 4. Alemanha (Via Geral e Reparação)
- **Via Jurídica**: Art. 116, II / § 15 StAG (Reparação por Perseguição Nazista) e Art. 4º StAG (Descendência direta).
- **Casos da Carteira**: Casos com linhagem germânica e sobreposição com imigração do pós-guerra.
- **Dicionário de Palavras-Chave para Varredura**:
  - `Geburtsurkunde`, `Heiratsurkunde`, `Ahnenpass`, `Melderegister`, `Bundesarchiv`, `Standesamt I Berlin`, `Verfolgung` (perseguição), `Staatsangehörigkeit`, `Ausbürgerung` (desnaturalização).
- **Arquivos & Fontes Centrais**: Standesamt local, Bundesarchiv, Arolsen Archives, Geheimes Staatsarchiv Preußischer Kulturbesitz.

---

## 2. Prioridade Secundária (Demais Países Mapeados no Catálogo)

Na sequência dos 4 países principais, o motor está parametrizado para estender a varredura para as 5 nações adicionais:

| País | Marco Operacional | Palavras-Chave de Busca Arquivística | Acervos Principais |
|---|---|---|---|
| **Espanha** | Transição pós-LMD / Descendência | `partida de bautismo`, `partida de nacimiento`, `Registro Civil`, `Cera de Ultramar`, `exilio republicano` | PARES, Registros Civis Municipais, Arquivos Diocesanos. |
| **Polônia** | Confirmação de Cidadania (*Poświadczenie*) | `akt urodzenia`, `akt małżeństwa`, `Księgi meldunkowe`, `Urząd Stanu Cywilnego (USC)`, `województwo` | Szukajwarchiwach, Urząd Wojewódzki. |
| **Hungria** | Cidadania Simplificada | `születési anyakönyv`, `házassági anyakönyv`, `honosítás`, `Magyar Nemzeti Levéltár` | Arquivo Nacional Húngaro (MNL), paróquias. |
| **Luxemburgo** | Art. 7 / Art. 23 | `acte de naissance`, `acte de mariage`, `commune`, `recouvrement de nationalité` | Archives Nationales de Luxembourg (ANLux). |
| **França** | Art. 21-14 / Código Civil | `acte de naissance`, `livret de famille`, `bulletin de naturalisation`, `non-perte par désuétude` | Archives Départementales, ANOM, Nantes (MAE). |

---

## 3. Protocolo de Execução da Varredura pelo Perplexity

1. **Entrada de Dados**: Submissão do dump bruto do cliente (conversas do WhatsApp, anexos em PDF/imagem e notas de atendimento).
2. **Execução da Skill `ca-client-go-live`**: Filtro pelas palavras-chave específicas do país de origem para separar dados de ascendência de mensagens informais.
3. **Geração do Brief de Discovery**: Saída estruturada contendo antepassado europeu, data/local de nascimento e lacunas de certidões.
4. **Handoff no Desk**: População dos campos do CRM e criação das pastas no Dossiê-Mãe correspondente.
