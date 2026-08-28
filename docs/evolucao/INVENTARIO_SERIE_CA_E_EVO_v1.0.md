# Inventário da Série CA e EVO v1.0

**Método:** inventário de artefatos localizados no acervo e/ou já refletidos na documentação do repositório. `Localizado` não equivale a `homologado`; documentos de preparação não equivalem a ações executadas.

| Série/artefato | Título ou função | Estado de localização | Estado de uso | Observação |
|---|---|---|---|---|
| CA-10A1 | Pré-onboarding deduplicado Ana Luiza. | LOCALIZADO | Histórico/operacional a cotejar. | Deve ser comparado à ficha familiar e pré-carga implementadas. |
| CA-CONN-01 | Base existente do Desk. | LOCALIZADO | A cotejar com Desk real. | Não declarar como arquitetura vigente sem comparação com código. |
| CA-RESET-01 | Estabilização operacional única e devolutivas. | LOCALIZADO | Histórico de estabilização. | Comparar com módulos operacionais atuais. |
| CA-EVO-02 | Mapa de automações e templates. | LOCALIZADO, conteúdo recuperado (24/08) | Devolutiva de 15/08 preservada por completo, incl. binário original. | Ver `recuperados/CA-EVO-02_Devolutiva_Padronizada.md` — já cotejada com o código atual dos Anexos I-V e o caso Ana Luiza. |
| CA-EVO-03 | Motor contratual modular. | LOCALIZADO | Referência contratual. | Deve ser cotejado com correção P0 implementada. |
| CA-EVO-04 | Dados vivos e integrações. | LOCALIZADO | Referência de dados. | Deve ser cotejado com Supabase, tipos e migrations. |
| CA-EVO-05A | Preparação de go-live Ana Luiza. | LOCALIZADO | Preparatório. | Declara GO_CONDICIONAL para preparação e NO_GO para ativação no momento do documento. |
| CA-EVO-05B | Devolutiva Fase 1. | LOCALIZADO | Histórico de bloqueios. | Registra caso concluído com pendências; não é confirmação do estado presente. |
| CA-01 a CA-08 | Série solicitada pelo projeto. | ENCERRADA_SEM_REABRIR (24/08) | A própria CA-EVO-01 recuperada declara "não reabrir" como premissa inegociável. | Ver `recuperados/CA-EVO-01_Registro_Mestre_de_Evolucao.md`. Não é mais um artefato ausente. |
| CA-EVO-01 | Primeira etapa EVO — Registro Mestre de Evolução. | LOCALIZADO (24/08) | Especificação recuperada; saída (6 tabelas pedidas) ainda não confirmada como gerada. | Ver `recuperados/CA-EVO-01_Registro_Mestre_de_Evolucao.md`. |
| CA-EVO-Go-live final | Ativação efetiva. | NAO_CONFIRMADO | PENDENTE_DE_VERIFICACAO. | Documentos 05A/05B não comprovam ativação externa. |

## Regra de versionamento

- Artefatos localizados são preservados com cabeçalho de proveniência e classificação.
- Artefatos ausentes entram no manifesto de recuperação, não em diretório de conteúdo homologado.
- Cada documento recuperado deve informar se é: especificação, preparação, devolutiva, execução, evidência ou histórico.
