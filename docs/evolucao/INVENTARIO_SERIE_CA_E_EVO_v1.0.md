# Inventário da Série CA e EVO v1.0

**Método:** inventário de artefatos localizados no acervo e/ou já refletidos na documentação do repositório. `Localizado` não equivale a `homologado`; documentos de preparação não equivalem a ações executadas.

| Série/artefato | Título ou função | Estado de localização | Estado de uso | Observação |
|---|---|---|---|---|
| CA-10A1 | Pré-onboarding deduplicado Ana Luiza. | LOCALIZADO | Histórico/operacional a cotejar. | Deve ser comparado à ficha familiar e pré-carga implementadas. |
| CA-CONN-01 | Base existente do Desk. | LOCALIZADO | A cotejar com Desk real. | Não declarar como arquitetura vigente sem comparação com código. |
| CA-RESET-01 | Estabilização operacional única e devolutivas. | LOCALIZADO | Histórico de estabilização. | Comparar com módulos operacionais atuais. |
| CA-EVO-02 | Mapa de automações e templates. | LOCALIZADO | Referência de automação. | Exige validação por integração/código. |
| CA-EVO-03 | Motor contratual modular. | LOCALIZADO | Referência contratual. | Deve ser cotejado com correção P0 implementada. |
| CA-EVO-04 | Dados vivos e integrações. | LOCALIZADO | Referência de dados. | Deve ser cotejado com Supabase, tipos e migrations. |
| CA-EVO-05A | Preparação de go-live Ana Luiza. | LOCALIZADO | Preparatório. | Declara GO_CONDICIONAL para preparação e NO_GO para ativação no momento do documento. |
| CA-EVO-05B | Devolutiva Fase 1. | LOCALIZADO | Histórico de bloqueios. | Registra caso concluído com pendências; não é confirmação do estado presente. |
| CA-01 a CA-08 | Série solicitada pelo projeto. | NAO_LOCALIZADA_POR_NOME_NESTA_RODADA | PENDENTE_DE_RECUPERACAO. | Não importar como existente sem localizar fonte primária. |
| CA-EVO-01 | Primeira etapa EVO. | NAO_LOCALIZADO_POR_NOME_NESTA_RODADA | PENDENTE_DE_RECUPERACAO. | Buscar em Drive, Dropbox, transcrições e histórico de sessões. |
| CA-EVO-Go-live final | Ativação efetiva. | NAO_CONFIRMADO | PENDENTE_DE_VERIFICACAO. | Documentos 05A/05B não comprovam ativação externa. |

## Regra de versionamento

- Artefatos localizados são preservados com cabeçalho de proveniência e classificação.
- Artefatos ausentes entram no manifesto de recuperação, não em diretório de conteúdo homologado.
- Cada documento recuperado deve informar se é: especificação, preparação, devolutiva, execução, evidência ou histórico.
