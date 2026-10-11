# Dossiê de Extração Operacional: 8 Países Canônicos do Clube Ancestral

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório de inteligência de pesquisa e extração documental
caminho_sugerido_no_repositorio: docs/relatorios/2026-10-11-extracao-operacional-8-paises.md
fontes:
  - Tabela planner_catalog_feed (Supabase)
  - Dimenso-SKU2025DaniloCrociaNcleoIvanKlujber-SKUnov.csv (Caso Croácia)
  - Dossie-Consolidado-Ana-Luiza-CA-CID-AT-FAM-2026-001.pdf (Caso Áustria § 58c)
  - 03-Arquitetura-Unica-de-Oferta-e-Jornada-Clube-Ancestral.pdf (Casos Giovanna, João Marcelo, Danilo)
  - CA04_Artefato_Consolidado_v1.0.1.md (Dicionário de Validações do CRM)
escopo: >
  Relatório de extração operacional para os 8 países aprovados pela Proprietária:
  Itália, Alemanha, Áustria, Portugal, Croácia, Hungria, Espanha e França.
  Sistematização de rotas legais, bases de pesquisa, termos de varredura (skills Perplexity)
  e estrutura de 4 blocos documentais para o Dossiê-Mãe.
premissas:
  - Autorização formal concedida pela Proprietária em 11/10/2026.
  - O Dossiê-Mãe de cada caso é alimentado por 4 blocos de documentos padronizados.
  - Resultados analíticos são restritos ao Desk Intelligence (sem vazamento para o App Cliente).
criterio_de_aceite: >
  Fichas operacionais completas para os 8 países;
  dicionário de palavras-chave nativas para ingestão via dump do WhatsApp;
  indicação exata dos acervos europeus e arquivos centrais correspondentes.
```

## 1. Introdução e Diretrizes de Extração

A extração operacional dos 8 países consolida a metodologia testada com o piloto de Ana Luiza (§ 58c Áustria). Para cada país, a esteira do Desk Intelligence aciona as rotinas de varredura semântica (`ca-client-go-live` e extração de dumps de WhatsApp), organizando os achados no **Dossiê-Mãe Familiar** estruturado em 4 blocos:
- **Bloco 1**: Acervo e documentos em posse da família.
- **Bloco 2**: Busca e emissão no país de origem (registros paroquiais, civis e militares).
- **Bloco 3**: Cadeia civil brasileira (inteiro teor e retificações).
- **Bloco 4**: Instrução e protocolo (CNN, traduções juramentadas e apostila de Haia).

---

## 2. Fichas de Extração dos 8 Países

### 1. ITÁLIA
- **Marco Legal**: Lei 91/1992 reformada pela Lei 74/2025 (Exigência de filiação exclusiva ou residência bienal para novos casos; preservadas vias maternas 1948 judiciais).
- **Casos Ativos**: `CA-ITA-GIOVANNA-PRADE`, `João Marcelo`.
- **Termos de Varredura**: `estratto dell'atto di nascita`, `matrimonio`, `stato delle anime`, `parrocchia`, `diocesi`, `leva militare`, `foglio matricolare`, `comune`, `Certidão Negativa de Naturalização (CNN)`, `Dante Causa`, `sbarco`, `Hospedaria dos Imigrantes`.
- **Acervos & Fontes**: Portale Antenati, FamilySearch (Registros Civis Italianos), Archivio di Stato provincial, Paróquias locais, SIAN / APESP.
- **Estrutura Documental**:
  - *Bloco 1*: Documentos de imigração e certidões brasileiras simples.
  - *Bloco 2*: Certidão de batismo/nascimento italiana em modelo plurilíngue ou com filiação completa + certidão de casamento italiana (se ocorrido na Itália).
  - *Bloco 3*: Certidões de inteiro teor de casamento e óbito do italiano no Brasil + nascimento, casamento e óbito de toda a linhagem descendente.
  - *Bloco 4*: CNN emitida pelo Ministério da Justiça com todas as variações onomásticas do Dante Causa + tradução juramentada para o italiano + apostila de Haia em todas as certidões brasileiras.

### 2. ALEMANHA
- **Marco Legal**: Art. 116, II / § 15 StAG (Reparação por Perseguição Nazista 1933–1945) e Art. 4º StAG (Descendência direta).
- **Casos Ativos**: Leads qualificados da carteira com histórico germânico.
- **Termos de Varredura**: `Geburtsurkunde`, `Heiratsurkunde`, `Ahnenpass`, `Melderegister`, `Bundesarchiv`, `Standesamt I Berlin`, `Verfolgung`, `Staatsangehörigkeit`, `Ausbürgerung`, `Gestapo-Akten`.
- **Acervos & Fontes**: Standesamt local (cartórios municipais alemães), Bundesarchiv (Arquivo Federal em Berlim e Koblenz), Arolsen Archives, Geheimes Staatsarchiv Preußischer Kulturbesitz.
- **Estrutura Documental**:
  - *Bloco 1*: Passaportes alemães antigos (*Deutsches Reich Reisepass*), carteiras de trabalho (*Arbeitsbuch*), cartas de família.
  - *Bloco 2*: Certidões de nascimento e casamento do Standesamt + fichas de registro de residência (*Melderegister*) comprovando domicílio antes da emigração.
  - *Bloco 3*: Cadeia de certidões brasileiras em inteiro teor ligando o ascendente alemão ao requerente.
  - *Bloco 4*: Certidão negativa de naturalização brasileira + formulário oficial do Bundesverwaltungsamt (BVA) + traduções juramentadas para o alemão.

### 3. ÁUSTRIA
- **Marco Legal**: § 58c StbG (Lei de Cidadania Austríaca - Reparação Histórica para Descendentes de Perseguidos pelo Regime Nazista).
- **Caso Piloto**: `CA-CID-AT-FAM-2026-001` (Ana Luiza Gomes Silveira Rodrigues, pai Adair, irmã Alice, dependente Felipe).
- **Termos de Varredura**: `Auszug aus der Heimatrolle`, `Heimatschein`, `Historische Meldeunterlagen`, `MA 35`, `MA 8`, `Kriegsarchiv`, `11ª Portaria 1941 (11. Verordnung zum Reichsbürgergesetz)`, `passaporte Lotte Friedmann`.
- **Acervos & Fontes**: ÖStA (Arquivo Estatal de Viena), Magistratsabteilung 35 (MA 35 - Cidadania), MA 8 (Arquivo Municipal e Provincial de Viena), Kriegsarchiv (militares austro-húngaros), Arquivo da Comunidade Judaica de Viena (IKG).
- **Estrutura Documental**:
  - *Bloco 1*: Passaporte austríaco de Lotte Friedmann, registros de imigração BRAPESPMILP010482.pdf, fotografias e anotações originais.
  - *Bloco 2*: Prova de pertencimento municipal (*Heimatrecht*) de Rudolf e Otto Reimer + registro de alistamento no Kriegsarchiv (Rudolf, médico 1917) + certidões de pertencimento à comunidade judaica (IKG).
  - *Bloco 3*: Cadeia civil brasileira completa (Ana Maria Reimer -> Cleusa -> Adair -> Ana Luiza e Felipe), com retificação das certidões com grafia divergente.
  - *Bloco 4*: Formulário de declaração (*Anzeige gemäß § 58c*) + certidão negativa de antecedentes criminais da PF + traduções juramentadas para o alemão e apostila de Haia.

### 4. PORTUGAL
- **Marco Legal**: Art. 1º, nº 1, alínea 'd' da Lei da Nacionalidade (Regulamentada pela Lei Orgânica 1/2026 para netos; Art. 1º, 1, 'c' para filhos).
- **Casos Ativos**: Leads qualificados em triagem comercial e pipeline ativo.
- **Termos de Varredura**: `assento de baptismo`, `assento de nascimento`, `concelho`, `freguesia`, `passaporte português`, `registo paroquial`, `CRC Lisboa`, `ligação efectiva à comunidade`, `fixação de apelidos`, `transcrição de casamento`.
- **Acervos & Fontes**: Arquivos Distritais de Portugal (Tombo.pt / DGARQ), Conservatória dos Registos Centrais de Lisboa (CRC), Arquivo Nacional da Torre do Tombo (ANTT).
- **Estrutura Documental**:
  - *Bloco 1*: Cartas de chamada, passaportes portugueses antigos, cadernetas consulares.
  - *Bloco 2*: Assento de baptismo/nascimento paroquial ou civil certificado pelo Arquivo Distrital com selo branco/marca d'água.
  - *Bloco 3*: Certidão de casamento do português transcrita em Portugal ou apta para transcrição prévia + certidões de inteiro teor por cópia reprográfica da cadeia descendente.
  - *Bloco 4*: Prova documental de ligação efectiva à comunidade nacional portuguesa (quando aplicável a netos) + antecedentes criminais da PF com validação no verso + formulário oficial com firma reconhecida por autenticidade perante autoridade consular/notarial.

### 5. CROÁCIA
- **Marco Legal**: Art. 11 (Emigrantes e seus descendentes) e Art. 16 da Lei de Cidadania Croata (*Zakon o hrvatskom državljanstvu*).
- **Caso Ativo**: `Danilo Croácia` (Núcleo Familiar Ivan Klujber / Linhagem Ivan -> Andrija -> Catharina -> Dayse -> Danilo).
- **Termos de Varredura**: `rodni list`, `vjenčani list`, `smrtni list`, `domovnica`, `MUP Zagreb`, `Consulado da Croácia em SP`, `porto de Rijeka/Fiume`, `registro de estrangeiro Uruguai/Brasil`, `krsni list`.
- **Acervos & Fontes**: Hrvatski državni arhiv (HDA - Arquivo de Estado em Zagreb), Arquivos Regionais (ex.: Rijeka, Split, Osijek), Paróquias católicas croatas (*Župa*), Arquivo Público do Estado de São Paulo e do Rio Grande do Sul.
- **Estrutura Documental**:
  - *Bloco 1*: Registro de desembarque de Ivan Klujber, passaportes antigos, ficha consular de matrícula.
  - *Bloco 2*: Certidão de nascimento (*Rodni List*) e certidão de casamento dos antepassados croatas emitidas pelo cartório local (*Matični Ured*) ou certidão de batismo paroquial autenticada pelo bispado.
  - *Bloco 3*: Cadeia civil brasileira em inteiro teor com conferência rigorosa das variações de sobrenome (ex.: Klujber / Kluiber).
  - *Bloco 4*: Biografia detalhada do requerente em croata (*Životopis*) destacando a preservação das tradições culturais croatas + formulário do Ministério do Interior (*MUP*) + certidão de antecedentes criminais com tradução juramentada para o croata e apostila de Haia.

### 6. HUNGRIA
- **Marco Legal**: Lei de Cidadania Húngara de 1993 (Emenda de 2010 - *Egyszerűsített honosítás* / Naturalização Simplificada para Descendentes).
- **Casos Ativos**: Casos com linhagem no antigo Reino da Hungria (incluindo Transilvânia, Voivodina e Eslováquia meridional).
- **Termos de Varredura**: `születési anyakönyv`, `házassági anyakönyv`, `halotti anyakönyv`, `honosítás`, `Magyar Nemzeti Levéltár (MNL)`, `Keresztelési anyakönyv`, `nemesi levél`, `nyelvtudás` (conhecimento do idioma).
- **Acervos & Fontes**: Magyar Nemzeti Levéltár (Arquivo Nacional Húngaro em Budapeste), Arquivos de Condado (*Megyei Levéltár*), registros paroquiais húngaros no FamilySearch.
- **Estrutura Documental**:
  - *Bloco 1*: Documentos austro-húngaros de imigração, cadernetas militares, relatos orais.
  - *Bloco 2*: Certidões originais de nascimento e casamento dos antepassados no território húngaro pré-Trianon.
  - *Bloco 3*: Cadeia completa de certidões brasileiras em inteiro teor ligando o ascendente húngaro aos requerentes.
  - *Bloco 4*: Biografia em língua húngara escrita de próprio punho (*Önéletrajz*) + comprovação de capacidade de comunicação no idioma húngaro perante o cônsul + traduções juramentadas feitas pelo escritório oficial de traduções de Budapeste (OFFI) ou tradutor juramentado consular.

### 7. ESPANHA
- **Marco Legal**: Disposição Adicional 8ª da Lei 20/2022 de Memória Democrática (LMD) e Art. 20 do Código Civil Espanhol (Nacionalidade por Opção).
- **Casos Ativos**: Carteira de netos de espanhóis em fase de protocolo e transição documental pós-outubro/2025.
- **Termos de Varredura**: `partida de bautismo`, `partida literal de nacimiento`, `Registro Civil`, `Cera de Ultramar`, `exilio republicano`, `anexo I`, `anexo III`, `jura de fidelidad`, `Inscripción consular`.
- **Acervos & Fontes**: Registros Civis Municipais da Espanha, Arquivos Históricos Provinciais, PARES (Portal de Arquivos Espanhóis - Centro Documental de la Memoria Histórica em Salamanca), Arquivos Diocesanos.
- **Estrutura Documental**:
  - *Bloco 1*: Passaporte espanhol antigo, matrícula consular de chegada, carteira do Centro Espanhol local.
  - *Bloco 2*: Partida literal de nacimiento del abuelo/abuela expedida por el Registro Civil español para efectos de DNI/Pasaporte (com carimbo recente).
  - *Bloco 3*: Certidão de casamento do espanhol no Brasil + nascimento e casamento do pai/mãe intermediário em inteiro teor reprográfica.
  - *Bloco 4*: Anexo oficial do Consulado Geral da Espanha preenchido + CNN do espanhol emitida pelo Ministério da Justiça comprovando não naturalização ou naturalização posterior ao nascimento dos filhos + apostila de Haia.

### 8. FRANÇA
- **Marco Legal**: Art. 21-14 e Art. 30 do Código Civil Francês (Reconhecimento por filiação com comprovação de *possession d'état* e ausência de perda por desuso de 50 anos).
- **Casos Ativos**: Modelo "Amigo Francês" e processos com ascendência francesa e territórios ultramarinos.
- **Termos de Varredura**: `acte de naissance`, `livret de famille`, `bulletin de naturalisation`, `non-perte par désuétude`, `registres consulaires`, `déclaration de nationalité`, `certificat de nationalité française (CNF)`.
- **Acervos & Fontes**: Archives Départementales do departamento de origem, ANOM (Archives Nationales d'Outre-Mer em Aix-en-Provence), Service Central d'État Civil em Nantes (Ministère de l'Europe et des Affaires Étrangères).
- **Estrutura Documental**:
  - *Bloco 1*: Livret de famille original, correspondências consulares, passaportes franceses antigos.
  - *Bloco 2*: Copie intégrale de l'acte de naissance du parent/grand-parent français délivrée par la mairie de naissance ou Nantes.
  - *Bloco 3*: Certidões civis brasileiras em inteiro teor demonstrando a filiação ininterrupta e legítima.
  - *Bloco 4*: Dossiê de requisição do *Certificat de Nationalité Française* (CNF) direcionado ao Tribunal Judiciaire competente na França + traduções juramentadas para o francês por tradutor juramentado no Brasil ou traducteur assermenté na França + apostila de Haia.
