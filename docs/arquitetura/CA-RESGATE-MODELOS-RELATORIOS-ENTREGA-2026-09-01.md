# Resgate dos modelos de relatórios de entrega

- **Status:** rascunho
- **Versão:** v1.0
- **Data:** 2026-09-01
- **Responsável pela decisão:** Proprietária do Clube Ancestral
- **Fonte(s) de evidência:** memória documental do projeto; Google Drive; repositório GitHub `tatianatosi/soul-ancestry`
- **Escopo:** identificar modelos de relatório/entrega distintos das denominações operacionais Fase 1 e Fase 2.
- **Premissas:** a busca foi textual e depende da indexação das fontes conectadas; não equivale à homologação de catálogo ou escopo comercial.
- **Limites:** não foi localizado, com esse nome exato, um documento-modelo intitulado "Encontro de Linhagens"; os resultados do Google Drive retornaram o modelo de relatório genealógico e o sistema de entregáveis, mas não disponibilizaram seu conteúdo por limitação de indexação/rate limit.
- **Próximos passos:** abrir o modelo do Drive e a planilha de entregáveis para validar se "Encontro de Linhagens" é título comercial, nome de seção, versão anterior ou uma entrega independente.
- **Critério de aceite:** confirmação da proprietária sobre os dois nomes canônicos, seus escopos e a visibilidade desejada no app.

## Conclusão de resgate

A memória recuperada não confirma dois novos relatórios autônomos chamados "Fase 1" e "Fase 2". Essas expressões aparecem como priorização/ondas operacionais de catálogo, não como a tipologia final de entrega ao cliente.

Há evidência de duas linhas de entrega que explicam a lembrança:

1. **Relatório de Pesquisa Genealógica / Modelo de Relatório Genealógico para Cliente**
   - É o documento estruturado de pesquisa, identificado no Drive como `CA · EN-CLI · Modelo Relatório Genealógico para Cliente`.
   - A versão preservada na memória do projeto começa como "RELATÓRIO DE PESQUISA GENEALÓGICA" e prevê: identificação do caso e da linhagem, sumário executivo, objetivo, período histórico, países/regiões investigados, geração mais antiga comprovada, documentos-chave e conexões ou descobertas relevantes.
   - É o formato adequado para materializar achados, evidências e narrativa de uma pesquisa concluída ou de marco relevante.

2. **Estudo Genealógico e Patrimonial Aprofundado**
   - Identificado como SKU `CA-HIST-001`, âncora de pesquisa genealógica e produto-pai da linha História da Família.
   - O repositório descreve seu escopo como levantamento completo de linhagem, documentos históricos e patrimônio; outro registro o descreve como pesquisa genealógica e patrimonial aprofundada com evidências e narrativa de pesquisa.
   - Sua exposição no app deve ocorrer como etapa/entrega da jornada do cliente, e não como SKU técnico.

## Sobre "Encontro de Linhagens"

- A expressão exata não foi localizada na documentação pesquisada nem no GitHub.
- A hipótese mais consistente é que seja um nome editorial/comercial de uma devolutiva de convergência entre ramos familiares — por exemplo, uma entrega que apresenta onde linhagens, sobrenomes e evidências se conectam — e não o nome técnico hoje canônico no catálogo.
- Como o catálogo atual usa `Estudo Genealógico e Patrimonial Aprofundado`, `Pacote Família Completa (3 Sobrenomes)` e `Pesquisa Genealógica Extra com Sobrenome Adicional`, "Encontro de Linhagens" pode ter sido absorvido por uma dessas jornadas ou permanecido apenas em um modelo de documento não indexado.

## Não confundir com Fase 1/Fase 2

| Termo | O que representa | Situação encontrada |
|---|---|---|
| Fase 1 / Fase 2 | Onda de prioridade operacional/comercial para produtos, links e implantação | Não é modelo de relatório ao cliente |
| Relatório Genealógico Rápido (1 Geração) — `CA-HIST-003` | Microentrega contextual/histórica | Arquivado ou Backoffice; não recomendado como oferta autônoma padrão |
| Relatório de Pesquisa Genealógica | Documento de devolutiva de achados e evidências | Modelo de cliente identificado no Drive e na memória documental |
| Estudo Genealógico e Patrimonial Aprofundado — `CA-HIST-001` | Jornada/entrega completa de pesquisa | Linha canônica de pesquisa; no app aparece como etapa/entrega |

## Evidências consultadas

- Google Drive: `CA · EN-CLI · Modelo Relatório Genealógico para Cliente`.
- Google Drive: `CA · FIN · Sistema de Entregáveis CLIENTES`.
- Memória documental: trecho preservado de "RELATÓRIO DE PESQUISA GENEALÓGICA", com estrutura de sumário executivo e evidências.
- GitHub: `src/lib/ca06-catalogo-operacional.ts`.
- GitHub: `docs/evolucao/recuperados/CA-06_Catalogo_Operacional_30.md`.
- GitHub: `docs/evolucao/recuperados/fontes-primarias/03_ARQUITETURA_OFERTA_JORNADA/03_ARQUITETURA_OFERTA_JORNADA_Clube_Ancestral.md`.
- GitHub: migração `supabase/migrations/20260822161726_4ee9e64f-86a5-4b3f-b9fa-113d34d78508.sql`.
