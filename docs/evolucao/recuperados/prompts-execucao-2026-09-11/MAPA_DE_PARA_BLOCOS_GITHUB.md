# Mapa De-Para — Operação para Blocos GitHub

**Objetivo:** assegurar que decisões, telas, regras e materiais operacionais não permaneçam apenas no Lovable, em conversas ou em ferramentas externas.

| Origem operacional | Artefato a versionar | Destino GitHub | Estado/controle |
|---|---|---|---|
| CRM: estrutura familiar | Schema funcional, permissões, eventos e regras de vínculo | `05_operacao/crm/` e `08_dados_e_integracoes/` | Implementado; documentação pendente. |
| App: ficha familiar | Fluxo de preenchimento, validações, interface e impacto no caso | `06_produto_e_app/ficha-familiar/` | Implementado; validar por perfil. |
| Proposta: pré-carga | Mapeamento de campos, precedência, regras de arquivamento e logs | `05_operacao/onboarding/` e `07_contratos_e_comercial/propostas/` | Implementado; documentação P0. |
| Despesas | Política operacional, categorias, aprovadores, reflexo contratual e financeiro | `05_operacao/financeiro/` e `07_contratos_e_comercial/` | Implementado; documentação P0. |
| Motor contratual | Regras de montagem, dados obrigatórios, cláusulas parametrizáveis e testes | `07_contratos_e_comercial/motor-contratual/` | Correção P0 implementada. |
| País/canônico | Dicionário de país, regra de seleção, exceções e consumo por tela | `02_catalogo/` e `08_dados_e_integracoes/` | Implementado; reconciliação pendente. |
| Jornada Áustria | Dados de pré-carga, componentes e conteúdo permitido | `03_jornada_e_entregas/` e `06_produto_e_app/` | Implementado parcialmente; validar escopo. |
| Login/UUID | Política de acesso, validação, mensagens e testes | `06_produto_e_app/acesso/` e `08_dados_e_integracoes/` | Implementado; documentar. |
| Canva/propostas | Identificador do design, versão aprovada, campos e cópia | `07_contratos_e_comercial/propostas/` | Atualizado; validar fonte vigente. |
| Calls/WhatsApp | Roteiro, consentimento, taxonomia, cadência e evidência de envio | `05_operacao/calls-discovery/` e `04_linguagem_e_conteudo/whatsapp-e-follow-up/` | Recuperação pendente. |

## Regra de de-para

Nenhuma alteração relevante deve ser considerada concluída somente porque foi aplicada no app. Para cada mudança, produzir pelo menos: documentação funcional, referência técnica, impacto operacional, estado de teste e classificação de dados.

## Campos mínimos do manifesto de mudança

- Identificador da mudança
- Data e autor/responsável
- Commit, PR, migration ou arquivo de origem
- Domínios afetados
- Regra anterior e regra atual
- Dados pessoais/sensíveis envolvidos
- Fluxo de rollback
- Evidência de teste
- Próxima revisão
