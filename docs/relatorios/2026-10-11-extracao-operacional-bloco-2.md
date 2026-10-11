# Dossiê de Extração Operacional: Bloco 2 de Expansão Europeia

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório de inteligência de pesquisa e extração documental
caminho_sugerido_no_repositorio: docs/relatorios/2026-10-11-extracao-operacional-bloco-2.md
fontes:
  - Tabela planner_catalog_feed (Supabase)
  - 03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md (Tronco Comum e Ramificações Nacionais)
  - CA04_Artefato_Consolidado_v1.0.1.md (Dicionário de Validações do CRM)
  - docs/arquitetura/roteiro-proxima-varredura-paises-e-casos.md
escopo: >
  Execução da varredura semântica e estruturação documental para o Bloco 2 de países:
  Polônia, Luxemburgo, Romênia, Irlanda e Reino Unido.
  Mapeamento de rotas legais, dicionário de termos de varredura (skills Perplexity)
  e acervos arquivísticos centrais integrados ao Desk Intelligence.
premissas:
  - Continuidade da esteira de varredura após a consolidação dos primeiros 8 países.
  - O Dossiê-Mãe é parametrizado nos 4 blocos funcionais para cada nação.
  - Resultados analíticos são restritos ao uso interno da Proprietária.
criterio_de_aceite: >
  Fichas completas para Polônia, Luxemburgo, Romênia, Irlanda e Reino Unido;
  termos de busca em polonês, romeno, francês/luxemburguês e inglês;
  indicação dos arquivos estatais e paroquiais europeus correspondentes.
```

## 1. Diretrizes de Extração do Bloco 2

O Bloco 2 de Expansão Europeia integra vias de alta demanda técnica e histórica, particularmente vinculadas a:
1. Recomposição territorial e migrações de guerra (Polônia e Romênia).
2. Linhas de recuperação histórica e gerações estendidas (Luxemburgo e Irlanda).
3. Transmissão por descendência direta e naturalização consular (Reino Unido).

Seguindo o protocolo padronizado, os achados extraídos de dumps de conversas e formulários são organizados no **Dossiê-Mãe Familiar** em 4 blocos:
- **Bloco 1**: Acervo e documentos em posse da família.
- **Bloco 2**: Registros paroquiais, civis e censitários no país de origem.
- **Bloco 3**: Cadeia civil brasileira (inteiro teor e retificações).
- **Bloco 4**: Instrução, CNN, traduções juramentadas e apostila de Haia.

---

## 2. Fichas de Extração dos 5 Países (Bloco 2)

### 1. POLÔNIA
- **Marco Legal**: Lei de Cidadania Polonesa de 1920 (reformada em 1951 e 1962 - Confirmação de Posse de Cidadania / *Poświadczenie obywatelstwa polskiego*).
- **Via Canônica no Desk**: Confirmação Declaratória (Sem limite de gerações, desde que mantida a continuidade da cidadania sem naturalização estrangeira voluntária antes de 1951).
- **Dicionário de Varredura**:
  - `akt urodzenia` (nascimento), `akt małżeństwa` (casamento), `akt zgonu` (óbito), `Księgi meldunkowe` (registros de moradores), `Urząd Stanu Cywilnego (USC)`, `województwo`, `paszport polski`, `Kresy Wschodnie` (territórios orientais), `poświadczenie obywatelstwa`, `służba wojskowa` (serviço militar).
- **Acervos & Fontes Centrais**:
  - Naczelna Dyrekcja Archiwów Państwowych (Szukajwarchiwach), Urząd Wojewódzki (conforme a última residência do ascendente), Archiwum Główne Akt Dawnych (AGAD em Varsóvia para registros paroquiais dos territórios da Galícia e Volínia).
- **Estrutura Documental**:
  - *Bloco 1*: Passaportes poloneses emitidos entre 1920 e 1939, carteiras de reservista (*Książeczka wojskowa*), certidões consulares.
  - *Bloco 2*: Certidões originais de nascimento e casamento extraídas dos livros civis/religiosos poloneses autenticadas pelo USC ou Arquivo de Estado.
  - *Bloco 3*: Cadeia civil brasileira em inteiro teor com fixação clara de patronímicos eslavos (ex.: Kowalski / Kovalsky).
  - *Bloco 4*: Certidão Negativa de Naturalização brasileira (CNN) comprovando que o polonês não se naturalizou brasileiro antes de 1951 + tradução juramentada por tradutor juramentado no Brasil ou *tłumacz przysięgły* na Polônia + petição dirigida ao *Wojewoda* competente.

### 2. LUXEMBURGO
- **Marco Legal**: Lei da Nacionalidade Luxemburguesa de 2017 (Art. 7 - Recuperação por ascendência direta de ancestral vivo em 01/01/1900 / Art. 23).
- **Via Canônica no Desk**: Recuperação e Opção (*Recouvrement de la nationalité luxembourgeoise*).
- **Dicionário de Varredura**:
  - `acte de naissance`, `acte de mariage`, `commune`, `recouvrement de nationalité`, `certificat de nationalité luxembourgeoise`, `registre paroissial`, `ancêtre luxembourgeois en 1900`, `Ministère de la Justice Luxembourg`.
- **Acervos & Fontes Centrais**:
  - Archives Nationales de Luxembourg (ANLux), Registros das Comunidades Locais (*Registres de l'État Civil des Communes*), Ministério da Justiça do Grão-Ducado.
- **Estrutura Documental**:
  - *Bloco 1*: Livros de família, cartas de imigração, fotografias de época.
  - *Bloco 2*: Certidão de nascimento e casamento do ancestral luxemburguês emitida pela comuna de origem comprovando nacionalidade em 1º de janeiro de 1900.
  - *Bloco 3*: Cadeia de certidões brasileiras em inteiro teor demonstrando filiação legítima contínua.
  - *Bloco 4*: Notificação de intenção de recuperação de nacionalidade + certidão de antecedentes criminais do país de residência + tradução juramentada para francês ou alemão + apostila de Haia.

### 3. ROMÊNIA
- **Marco Legal**: Art. 10 e Art. 11 da Lei de Cidadania Romena nº 21/1991 (Redobândirea cetățeniei române - Restauração por perda involuntária de territórios pós-1940, como Bessarábia e Bucovina do Norte).
- **Via Canônica no Desk**: Restauração Territorial / Descendência até 3ª geração.
- **Dicionário de Varredura**:
  - `certificat de naștere` (nascimento), `certificat de căsătorie` (casamento), `certificat de deces` (óbito), `redobândirea cetățeniei`, `Autoritatea Națională pentru Cetățenie (ANC)`, `Bucovina`, `Basarabia`, `dosar cetățenie`.
- **Acervos & Fontes Centrais**:
  - Arhivele Naționale ale României (Bucareste e arquivos distritais de Suceava, Iași), Autoritatea Națională pentru Cetățenie (ANC), paróquias ortodoxas e registros de estado civil.
- **Estrutura Documental**:
  - *Bloco 1*: Documentos romenos pré-Segunda Guerra, passaportes de trânsito, certificados de imigração.
  - *Bloco 2*: Extratos oficiais dos arquivos romenos comprovando nascimento ou residência dos pais ou avós em território romeno antes de 1940.
  - *Bloco 3*: Cadeia de certidões brasileiras em inteiro teor reprográfica com verificação de datas e nomes.
  - *Bloco 4*: Declaração de lealdade ao Estado romeno + atestado de antecedentes criminais brasileiro e romeno + traduções juramentadas para o romeno com apostila de Haia.

### 4. IRLANDA
- **Marco Legal**: *Irish Nationality and Citizenship Act 1956* (Section 7 - *Foreign Births Register* / Registro de Nascimentos no Estrangeiro para netos de nascidos na Irlanda).
- **Via Canônica no Desk**: Registro no FBR (*Foreign Births Registration* perante o *Department of Foreign Affairs* - DFA).
- **Dicionário de Varredura**:
  - `birth certificate`, `baptismal certificate`, `parish register`, `Foreign Births Register (FBR)`, `Department of Foreign Affairs (DFA)`, `civil registration district`, `General Register Office (GRO)`, `Irish grandparent`.
- **Acervos & Fontes Centrais**:
  - General Register Office (GRO Irlanda - Roscommon), National Archives of Ireland (Dublin), IrishGenealogy.ie, Registros Paroquiais Católicos da Biblioteca Nacional da Irlanda (NLI).
- **Estrutura Documental**:
  - *Bloco 1*: Cartas de imigração, passaportes irlandeses antigos, certidões paroquiais trazidas pelos imigrantes.
  - *Bloco 2*: Certidão de nascimento oficial emitida pelo GRO (*Civil Birth Certificate*) com selo em relevo do avô/avó nascido na Irlanda + certidão de casamento irlandesa (se aplicável).
  - *Bloco 3*: Certidão de nascimento em inteiro teor do pai/mãe brasileiro(a) filho(a) do irlandês + certidão de nascimento do requerente em inteiro teor.
  - *Bloco 4*: Comprovante de endereço atualizado do requerente + cópia autenticada do passaporte brasileiro chancelada por testemunha autorizada (advogado/tabelião) + fotos padrão passaporte com declaração de identidade + taxa oficial do FBR.

### 5. REINO UNIDO
- **Marco Legal**: *British Nationality Act 1981* (Section 2 - *British Citizenship by Descent* / Seção 4C para linha materna histórica / *Home Office*).
- **Via Canônica no Desk**: Cidadania por Descendência ou Registro Consular (*UK Visas and Immigration*).
- **Dicionário de Varredura**:
  - `certified copy of an entry of birth`, `marriage certificate`, `GRO index`, `General Register Office (GRO Southport)`, `British passport`, `Crown service`, `Registration as a British citizen`, `Form UKF / Form ARD`.
- **Acervos & Fontes Centrais**:
  - General Register Office (GRO UK), The National Archives (TNA Kew), FreeBMD, ScotlandsPeople (para ascendência escocesa).
- **Estrutura Documental**:
  - *Bloco 1*: Passaportes britânicos de época, certificados consulares de registro no exterior.
  - *Bloco 2*: Certidão de nascimento britânica oficial expedida pelo GRO (*Full Certified Copy of an Entry of Birth*) contendo os dados dos pais do cidadão britânico.
  - *Bloco 3*: Certidão de casamento dos pais e certidão de nascimento do requerente em inteiro teor demonstrando filiação legítima.
  - *Bloco 4*: Petição formal ao *Home Office* (Formulário online UKVI) + biometria consular + certidão de não naturalização do pai/mãe britânico no Brasil antes do nascimento do requerente (quando exigido) + traduções juramentadas para o inglês e apostila de Haia.
