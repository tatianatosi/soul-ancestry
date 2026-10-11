# Especificação Técnica: Skills do Perplexity, Varredura Multipaís e Roteiro de Discovery + Checklist

```yaml
status: aprovado
versao: v1.0
data: 2026-10-11
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: especificação de motor e consolidação de skills
caminho_sugerido_no_repositorio: docs/arquitetura/especificacao-skills-varredura-discovery-multipais.md
fontes:
  - CA04_Artefato_Consolidado_v1.0.1.md (Dicionário de Validações do Painel de Calls e CRM)
  - Dimenso-SKU2025DaniloCrociaNcleoIvanKlujber-SKUnov.csv (Caso Croácia / Multipaís)
  - Roteiro-Discovery-Ana-Luiza-Cidadania-Austriaca-02-08-2026.pdf (Roteiro Discovery Mestre)
  - Checklists-Pesquisa-Austria-58c-Ana-Luiza.md (Checklists de Pesquisa 58c)
  - docs/arquitetura/especificacao-dossie-assistente-ia-autoridade.md
escopo: >
  Mapeamento consolidado das skills operacionais do Perplexity (varredura de palavras-chave,
  extração de dumps de WhatsApp e compilação de dossiês), expansão do catálogo para além da Itália/Áustria
  (Portugal, Espanha, Alemanha, Croácia, Romênia, França, Polônia, Hungria e Luxemburgo),
  e padronização da dobradinha Roteiro Discovery SPIN + Checklist documental por país.
premissas:
  - O skill ca-client-go-live e as varreduras de palavra-chave são métodos nativos de apoio analítico.
  - A dobradinha "Roteiro de Discovery (15 min) + Checklist Documental" é reutilizável para qualquer país.
  - O Desk Intelligence centraliza os dados qualificados sem exigir formulários repetitivos.
  - Acesso estritamente restrito à Proprietária (sem vazamento para o App Cliente).
criterio_de_aceite: >
  Integração formal das rotinas de varredura (WhatsApp -> Discovery -> Checklist);
  matriz de requisitos e fontes parametrizada para os 11 países mapeados;
  eliminação de retrabalho com preenchimento automático de campos do CRM a partir do Brief de Discovery.
```

## 1. As Skills do Perplexity & Varreduras de Palavras-Chave

O método testado e comprovado no caso de Ana Luiza consolidou o uso de rotinas especializadas de IA para acelerar a ingestão de dados:

### 1.1. Skill `ca-client-go-live` (Varredura e Compilação)
- **Função**: Executa a varredura semântica e por palavras-chave em dumps de conversas do WhatsApp Business, e-mails e notas de atendimento.
- **Dicionário de Varredura**: Busca ativa por termos como `passaporte`, `nascimento`, `casamento`, `óbito`, `imigração`, `desembarque`, `comuna`, `paróquia`, `judeu/judaica`, `naturalização`, `Heimatrecht`, `MA35`, `FamilySearch ID` e variantes ortográficas de sobrenomes.
- **Saída**: Gera a timeline higienizada do lead e preenche previamente o **Brief de Discovery**, evitando perguntas repetitivas na reunião.

### 1.2. Skill `one-page-devolutiva-externa`
- **Função**: Gera a síntese visual de diagnóstico para apresentação ao cliente pós-call.
- **Regra de Blindagem**: Exibe apenas a árvore preliminar, os documentos localizados e o próximo passo recomendado, ocultando rigorosamente notas internas de risco, SKUs técnicos e honorários de parceiros.

---

## 2. O Mapeamento Multipaís (Além de Itália e Áustria)

O Clube Ancestral já possui estrutura normativa e mapeamento de fontes para 11 eixos nacionais:

| País / Linha | Via Jurídica Canônica | Marco Jurídico Vigente | Fontes Primárias & Arquivos Centrais |
|---|---|---|---|
| **Áustria** | § 58c StbG (Reparação Histórica) | 11ª Portaria Reich 1941 / Emenda 2020 | ÖStA, MA 35 (Viena), MA 8, Arquivo Militar (Kriegsarchiv), Arolsen. |
| **Itália** | *Jus Sanguinis* (Administrativo / Judicial) | Lei 91/1992 reformada pela Lei 74/2025 | Comuni italianos, Paróquias (Archivio Diocesano), Arquivo Nacional (CNN). |
| **Portugal** | Lei da Nacionalidade (Netos / Filhos) | Lei Orgânica 1/2026 (Requisito de ligação) | Arquivos Distritais (Tombo.pt), Conservatórias (CRC Lisboa). |
| **Espanha** | Ley de Memoria Democrática (LMD) | Prazo de cita prévia encerrado 10/2025 (Transição) | Registros Civis Municipais, Arquivos Históricos Provinciais, PARES. |
| **Alemanha** | Art. 116, II / § 15 StAG (Reparação) | Reforma StAG 2021 (Sem limite temporal) | Bundesarchiv, Standesamt I (Berlim), Arolsen Archives. |
| **Croácia** | Lei de Cidadania Croata (Art. 11/16) | Processo Consular SP / MUP Zagreb | Arquivo de Estado em Zagreb, Paróquias locais, registros de imigração BR/UY. |
| **Polônia** | Confirmação de Cidadania (*Poświadczenie*) | Lei de Cidadania Polonesa de 1920/1951 | Urząd Wojewódzki, Arquivos de Estado Poloneses (Szukajwarchiwach). |
| **Hungria** | Cidadania Simplificada (*Egyszerűsített*) | Lei de Cidadania Húngara (Exige idioma básico) | Arquivo Nacional Húngaro (MNL), registros paroquiais. |
| **Luxemburgo** | Art. 7 / Art. 23 (Recuperação de linha) | Lei da Nacionalidade Luxemburguesa | Registros Comunais, Archives Nationales de Luxembourg (ANLux). |
| **Romênia** | Art. 10/11 da Lei de Cidadania Romena | Reparação territorial pós-guerra | Autoridade Nacional para Cidadania (ANC), Arquivos Nacionais de Bucareste. |
| **França** | Art. 21-14 / Declaração de Nacionalidade | Código Civil Francês (Ausência de perda por desuso) | Arquivos Departamentais franceses, ANOM (ultramar), Nantes (MAE). |

---

## 3. A Dobradinha Canônica: Roteiro Discovery (SPIN) + Checklist por País

O fluxo de atendimento é unificado e opera em duas etapas integradas:

```
[ Dump WhatsApp / Form ] 
         │
         ▼ (Skill de Varredura por Palavras-Chave)
[ Brief Pré-Call Preenchido ]
         │
         ▼
[ Roteiro Discovery 15 min (SPIN) ] ──► Registra: Situação, Problema, Implicação e Necessidade
         │
         ▼ (Handoff Automático via CRM)
[ Checklist Documental do País ] ──► Alimenta: Dossiê-Mãe (Pastas 00 a 03)
```

### 3.1. Roteiro Discovery Mestre (15 Minutos)
- **Abertura (30s)**: Alinhamento de transparência e aviso de gravação/transcrição.
- **O que já sabemos (2 min)**: Recapitulação dos dados extraídos pela varredura do WhatsApp (não repetir perguntas).
- **Diagnóstico da Linha (5 min)**: Verificação do ascendente de referência, local de nascimento e eventuais rupturas (naturalização, casamento, datas divergentes).
- **Apresentação de Próximos Passos (5 min)**: Explicação de como o Clube Ancestral fecha as lacunas documentais e prepara a proposta.
- **Fechamento Suave (2 min)**: Envio da proposta personalizada em até 24 horas.

### 3.2. Estrutura Padrão do Checklist por País
Todo checklist documental é organizado em 4 blocos funcionais:
1. **Bloco 1 (Base Familiar)**: Documentos já existentes em posse da família (passaportes antigos, certidões parciais, fotos, relatos).
2. **Bloco 2 (Busca no País de Origem)**: Certidões de nascimento, matrimônio e registros militares/eleitorais no acervo europeu.
3. **Bloco 3 (Cadeia Civil Brasileira)**: Certidões de inteiro teor desde o antepassado até o requerente atual, com análise de retificações.
4. **Bloco 4 (Instrução e Protocolo)**: Certidão Negativa de Naturalização (CNN), traduções juramentadas, apostilamento de Haia e formulário consular oficial.
