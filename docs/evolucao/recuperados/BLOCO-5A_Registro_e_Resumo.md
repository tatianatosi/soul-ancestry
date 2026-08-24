# Bloco 5A — Arquitetura Genealógica, Adendo e Piloto (registro de recuperação)

## Proveniência

- **Origem:** 3 arquivos enviados pela Proprietária no chat, 24/08/2026
  (mais duas cópias duplicadas do primeiro arquivo, mesmo hash — descartadas).
- **Binários preservados em `docs/evolucao/recuperados/`:**
  `BLOCO-5A_Arquitetura_Genealogica.docx`,
  `BLOCO-5A_Adendo_Correcoes.docx`, `PILOTO-5A_1a_Rodada_Decisoes.docx`.
- **Data dos três documentos:** 11/08/2026 — anterior à sincronização
  mestra de 19/08 e a todo o levantamento das Fases A–D.
- **Classificação:** histórico/preparatório, ainda **não cotejado** com o
  estado atual do código ou do banco. Este registro é leitura preliminar
  (estrutura e conteúdo), não uma auditoria de implementação — essa é a
  próxima etapa, separada, se você quiser que eu faça.
- **Relevância:** atende diretamente `REC-006` (bases e skills
  genealógicas) do `MANIFESTO_AUSENCIAS_E_RECUPERACAO_v1.0.md`, até agora
  não verificado.
- **Dado pessoal:** o terceiro arquivo cita um caso real por nome
  (Giovanna Prade). Tratado aqui como já é tratado o caso Ana Luiza em
  outros documentos deste repositório — uso interno, repositório privado.

## 1. Bloco 5A — Fichas de Pesquisa, Bases Genealógicas, Evidências e Arquitetura Backend

Tipo declarado: modelagem e auditoria, não execução. Escopo: banco de
dados, fichas-modelo, regras de evidência, inventário de fontes
genealógicas e arquitetura backend → Desk → Projeção App Cliente.
Explicitamente fora de escopo: integração de APIs, scraping, criação de
SKU, alteração de sistema externo, publicação de dashboard/relatório.

Estrutura (9 seções):

1. **Princípios e linguagem** — regra central: "integração invisível,
   evidência visível" (o backend consulta/normaliza; o Desk valida e
   classifica confiança; a Projeção do App Cliente mostra só resumo
   autorizado). Nunca expor token, API, URL interna, matching, fonte
   crua ou hipótese jurídica ao cliente. Define 6 estados de validação de
   informação (`informacao_compartilhada_familia` até
   `validado_por_documento`). Lista termos proibidos de linguagem
   ("constelação familiar", "cura ancestral", "trauma transgeracional",
   associação de nacionalidade a personalidade) e termos permitidos
   ("memória familiar", "narrativas de migração", "encontros de linhagem").
2. Ficha-modelo de Pesquisa por Caso (A).
3. Dicionário de entidades e campos (B).
4. Matriz de evidência e confiança (C).
5. Inventário de bases genealógicas (D).
6. Arquitetura backend → Desk → Projeção App (E).
7. Matriz entrega → dashboard → one-page → PDF → interno (F).
8. Modelo seguro de Caderno de Encontros de Linhagem (G).
9. Backlog 5A e 5B (H); riscos e decisões humanas pendentes (I).

## 2. Adendo de Correções — Bloco 5A

Corrige e reforça o documento base (não o substitui). Natureza: correção
de governança, classificação, linguagem e regras de visibilidade —
explicitamente **não** refaz o Bloco 5A nem inicia o 5B, nem integra API,
scraping, GitHub, backend, banco, automação, SKU, ou altera App/Desk/CRM/
Asaas/Drive/Dropbox/Lovable.

11 princípios inegociáveis registrados, entre eles:
- "Fonte aberta não significa fonte automatizável."
- "Registro encontrado não significa prova validada."
- "Nenhuma fonte externa confirma parentesco, cidadania, rota jurídica,
  elegibilidade ou documento isoladamente."
- "Toda elevação de evidência exige revisão humana."
- "Não criar SKU para cada PDF, relatório, insight, caderno ou card."

Também traz: taxonomia de fontes M1–M6, matriz de fontes prioritárias com
status corrigido, regra de uso permitido/automação por fonte, regra de
visibilidade App Cliente/one-page/PDF/Desk, modelo revisado de Caderno de
Encontros de Linhagem, política de conteúdo proibido e disclaimer, e lista
de decisões humanas pendentes.

## 3. Piloto 5A.1 — Rodada 2 · Preparação para Execução Controlada (caso real)

**Caso:** Giovanna Prade. **Status então:** "PILOTO PARCIALMENTE
CONCLUÍDO". Natureza: preparação — "nenhuma consulta externa foi
realizada, nenhuma decisão foi tomada em nome de Tatiana" nesta rodada.

Pacote de decisão com 4 itens, **todos `AGUARDANDO DECISÃO HUMANA` em
11/08**:

| Item | Do que trata |
|---|---|
| D-01 | Texto de consentimento mínimo de pesquisa e documentos, com modelo de registro (nome do responsável, relação com o caso, canal, escopo, autorização para dados de terceiros) |
| D-04 | Aprovação de cinco fontes humanas/documentais permitidas, com modo de uso e automação (nenhuma automatizada) |
| D-05 | Não capturado neste resumo preliminar — ver documento completo |
| D-06 | Não capturado neste resumo preliminar — ver documento completo |

Também inclui: matriz de decisões pendentes, protocolo de três opções de
primeira consulta humana, modelo de log de consulta, modelo de revisão
documental, checklist atualizado do piloto, critérios de conclusão e um
relatório curto.

## 4. CA-05 — Piloto de Evidência: Consolidação Pré-Consulta Erwin Prade (13/08/2026)

**Preservado em:** `CA-05_Ficha_Pre_Consulta_Erwin_Prade.docx`. Continuação do
Piloto 5A.1, dois dias depois. **Fecha a pendência que este registro tinha
deixado em aberto:** o cabeçalho do documento declara "Status das decisões
de governança: D-01, D-04, D-05, D-06 e D-08 aprovadas (conforme
informado)" — as decisões que estavam `AGUARDANDO DECISÃO HUMANA` em 11/08
foram aprovadas até 13/08.

Conteúdo: ficha de pré-consulta manual de um ancestral (Erwin Prade, papel
"ancestral paterno" na linha de Giovanna Prade, referência `P-04` na
Matriz de Pessoas do piloto), com:
- Dados indicados (nascimento, batismo, falecimento, sepultamento) e uma
  **divergência de data registrada explicitamente** (16/08 vs 17/08/1917),
  não resolvida por inferência.
- Matriz de evidências (`ERW-01`, `ERW-02`...) com fonte, modelo M,
  estado de validação (`dado_pesquisa_inicial`, `pendente_confirmacao` —
  nunca `validado_por_documento` nesta fase) e próxima ação por item.
- Regra de visibilidade `desk_only` — nada desta ficha chega ao App Cliente
  nesta fase.
- Nesta rodada, nada foi executado externamente: sem busca em sites,
  FamilySearch, contato com cartório/paróquia/cemitério/consulado, sem
  mensagem à cliente, sem geração de App/one-page/PDF/proposta/cobrança.

Isso é uma evidência concreta e datada de que o modelo de estados de
evidência do Bloco 5A (seção 1.2) estava sendo seguido na prática em
13/08 — disciplina reforça o que os documentos declaram.

## Nota sobre versões do Adendo de Correções

O reenvio do Adendo (`63d8d19e...`) tem hash diferente do primeiro envio
(`a6faa668...`, já preservado como canônico). Comparando o conteúdo: são
quase idênticos, exceto que a versão reenviada **não contém** a seção
"Regra específica de one-page pré-comercial" (regra sobre usar dado "em
validação documental" numa one-page pré-comercial, sem apresentar como
fato confirmado). Mantive a versão mais completa (`a6faa668`) como
canônica; se a ausência dessa seção na segunda cópia for intencional (uma
revisão que a removeu), avise para eu corrigir.

## O que ainda falta fazer (proposta, sem implementar)

1. **Cotejar D-01 (consentimento) com o código atual** — existe
   `consent_records`/`consent_exceptions` no banco (citado em
   `CA-UX-03_Metricas_Canonicas.md`, grupo Pesquisa); verificar se o texto
   e o modelo de registro propostos aqui em 11/08 correspondem ao que está
   implementado hoje, ou se ainda é o mesmo texto pendente de aprovação.
2. **Cotejar a taxonomia M1–M6 e a lista de termos proibidos** com
   `src/lib` de pesquisa/legado (ex. `legado-visibilidade.ts`, os módulos
   `pesquisa-modulo.*`) para saber se a linguagem de legado e a
   classificação de fonte já foram codificadas.
3. **Confirmar se as decisões D-01/D-04/D-05/D-06 do piloto Giovanna Prade
   já foram tomadas** desde 11/08 — nenhum documento posterior lido nesta
   sessão as menciona novamente.
4. Ler o restante do Adendo e do Piloto na íntegra (D-05, D-06, protocolo
   de consulta, checklist) — este registro é um resumo estrutural, não
   transcrição completa, dado o volume (mais de 100 páginas combinadas).
