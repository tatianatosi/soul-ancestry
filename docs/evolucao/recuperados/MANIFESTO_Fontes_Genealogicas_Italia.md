# Manifesto de verificação e consolidação das fontes genealógicas por país

**Data do documento:** 07/08/2026 (mais antigo que a maioria dos recuperados
desta série — recebido nesta sessão em 24/08/2026).

## Proveniência

- **Origem:** colado no chat pela Proprietária, 24/08/2026. Data interna do
  documento (07/08/2026) o coloca na fase mais antiga já identificada nesta
  recuperação — antecede o Bloco 5A/Adendos (11/08) e o CA-06 (14/08).
- **Natureza:** plano de importação de fontes genealógicas italianas
  (Portale Antenati, FamilySearch, Archivi di Stato, dioceses etc.) para uma
  aba/inventário "CA · DESK · Inventário de Fontes", a partir de um arquivo
  mestre `Mapeamento_Completo_Arquivos_Italianos.xlsx` no Drive — que esta
  sessão não tem acesso para ler.
- Documento explicitamente declara pendência técnica: a extração tabular
  integral das ~170 linhas do arquivo mestre não foi feita; apenas 25
  fontes italianas de exemplo (IT-0001 a IT-0025) estão listadas.

## Conteúdo (resumo)

- Escopo italiano oficial: 20 regiões, 7.896 comuni, 99 províncias, 179
  instituições mapeadas, cobertura de 529 d.C. ao presente.
- Estrutura canônica de 27 colunas para a aba de inventário (ID_Fonte,
  Pais_eixo, Tipo_de_acervo, Nivel, Cobertura_temporal, Status_integracao_Desk
  etc.).
- 25 fontes de exemplo já registradas (Portale Antenati, FamilySearch
  Italia, Archinota, ANPR, Archivio Diocesano di Pistoia, Archivio di Stato
  di Pistoia/Firenze, SIAS, Geneanet, Ancestry, MyHeritage etc.), cada uma
  com prioridade Alta/Média/Baixa.
- Tabela de distribuição por país/eixo: Itália com fonte localizada;
  Portugal, Espanha, Alemanha, Polônia, Luxemburgo, Hungria, Áustria e
  Brasil ainda **sem** fonte mestre localizada — apenas placeholders de
  grupo (PT-xxxx, ES-xxxx etc.).
- Critério de priorização P0–P3 (oficial-digital-recorrente até
  serviço-terceirizado-sob-demanda).
- Regra de integração por camada: Desk mostra as fontes completas; Gem de
  Memória Italiana recomenda fonte por data/comune/evento; App cliente nunca
  expõe lista técnica; CRM guarda fonte usada + descoberta + próximo passo.

## Cotejo com o código atual — infraestrutura de governança confirmada; dados de conteúdo (170 fontes) não estão neste repositório

- `src/lib/fontes-genealogicas.ts` + `src/lib/fontes-genealogicas.functions.ts`
  + `src/routes/_authenticated/fontes-genealogicas.tsx` — módulo "G-08"
  já implementa a **governança estrutural** deste manifesto: campos
  equivalentes (`pais_eixo`, `nivel_de_fonte`, `estagio_maturidade`,
  `status_documentacao`, `status_integracao`, `scraping_status`,
  `licenca_termos`, `trata_dados_pessoais`), funções `permiteConsultaAutomatica`,
  `podeAvancarMaturidade`, `pendenciasGovernanca`, `vincularFonteAPesquisa` e
  teste dedicado (`fontes-genealogicas.test.ts`) cobrindo regra G-08 (fonte
  catalogada não permite consulta automática).
- **O que não está aqui**: os dados de conteúdo — as 179/170 instituições
  italianas específicas (Portale Antenati, Archivi di Stato de Pistoia/
  Firenze etc.) e o arquivo mestre `Mapeamento_Completo_Arquivos_Italianos.xlsx`
  — não existem como registros neste código nem em nenhum CSV do
  repositório. O módulo de código é o "recipiente" (schema + regras de
  governança); o conteúdo em si vive fora deste repositório (Drive/Supabase),
  e a extração das 170 linhas segue pendente conforme o próprio documento
  declara na Seção 8.
- Nenhuma fonte com prefixo `IT-00xx` foi encontrada em `src/` — confirma
  que este manifesto é um plano de importação, não um registro do que já
  foi importado.

## O que eu não fiz aqui

Não tentei reconstruir manualmente as 170 linhas do arquivo mestre — o
próprio documento veta essa prática ("A lista completa não deve ser
reconstruída manualmente"). Preservei o texto e as 25 fontes de exemplo tal
como recebidas, para referência futura quando o Excel mestre puder ser
enviado diretamente a esta sessão (mesmo caminho usado para os outros
documentos: upload direto, já que Drive/Dropbox estão bloqueados por rede
neste ambiente).
