# Inventário das Telas de Governança

**Data:** 2026-08-27  
**Propósito:** Catalogar as 18 telas de governança, classificar como documentação ou operacional, identificar quais podem ser arquivadas.

## Resumo

| Categoria | Telas | Notas |
|-----------|-------|-------|
| **Estática/Documentação** | 15 | Leem de constantes, sem lógica operacional |
| **Dinâmica/Operacional** | 3 | Leem dados vivos do banco |

---

## Telas Estáticas (Documentação do Arcabouço)

Estas telas renderizam dados declarados em constantes. Não há integração com o banco de dados vivo. São adequadas para **repositório de conhecimento**, não para **operação diária**.

### 1. **Modelos Contratuais** (`governanca.modelos-contratuais`)
- **Origem:** `MODELOS_CONTRATUAIS` constant
- **Tipo:** Matriz de 3 modelos (individual, casal, núcleo)
- **Uso:** Referência jurídica dos modelos
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 2. **Inventário Patrimonial** (`governanca.inventario-patrimonial`)
- **Origem:** `INVENTARIO_PATRIMONIAL` constant
- **Tipo:** Catálogo de anexos por tipo de serviço
- **Uso:** Referência de anexos e documentação
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 3. **Modelo Familiar Individual** (`governanca.modelo-individual`)
- **Origem:** `MODELO_FAMILIAR_INDIVIDUAL` constant
- **Tipo:** Estrutura de dados para indivíduo
- **Uso:** Referência de campos do modelo
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 4. **Modelo Familiar Casal** (`governanca.modelo-familiar-casal`)
- **Origem:** `MODELO_FAMILIAR_CASAL` constant
- **Tipo:** Estrutura de dados para casal
- **Uso:** Referência de campos do modelo
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 5. **Matriz de Conformidade** (`governanca.matriz-conformidade`)
- **Origem:** `MATRIZ_CONFORMIDADE` constant
- **Tipo:** Checklist de validação
- **Uso:** Referência de critérios
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 6. **Matriz de Equivalência** (`governanca.matriz-equivalencia`)
- **Origem:** `MATRIZ_EQUIVALENCIA` constant
- **Tipo:** Mapeamento de campos entre sistemas
- **Uso:** Referência técnica
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 7. **Dicionário de Calls/CRM** (`governanca.dicionario-calls-crm`)
- **Origem:** `DICIONARIO_CALLS` constant
- **Tipo:** Glossário de termos
- **Uso:** Referência de nomenclatura
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 8. **Catálogo Operacional 30** (`governanca.catalogo-operacional-30`)
- **Origem:** `CATALOGO_OPERACIONAL_30` constant
- **Tipo:** Lista de 30 ações padrão
- **Uso:** Referência de playbook
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 9. **Critérios de Aceite** (`governanca.criterios-aceite`)
- **Origem:** `CRITERIOS_ACEITE` constant
- **Tipo:** Matriz de aceitação
- **Uso:** Referência de quality gates
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 10. **Indicadores** (`governanca.indicadores`)
- **Origem:** `INDICADORES` constant
- **Tipo:** KPIs e métricas
- **Uso:** Referência de monitoramento
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 11. **Identificadores** (`governanca.identificadores`)
- **Origem:** `IDENTIFICADORES_SISTEMA` constant
- **Tipo:** Catálogo de IDs do sistema
- **Uso:** Referência técnica
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 12. **Corte Vertical** (`governanca.corte-vertical`)
- **Origem:** `CORTE_VERTICAL` constant
- **Tipo:** Estrutura de organização
- **Uso:** Referência organizacional
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 13. **Decisões** (`governanca.decisoes`)
- **Origem:** `DECISOES_ARQUITETURA` constant
- **Tipo:** ADR (Architecture Decision Records)
- **Uso:** Histórico de decisões
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 14. **Contrato Base** (`governanca.contrato-base`)
- **Origem:** `CONTRATO_BASE_CLAUSULAS` constant
- **Tipo:** Template de contrato
- **Uso:** Referência jurídica
- **Candidato para arquivar?** ✓ Sim (move para docs/)

### 15. **Modelos Contextuais** (`governanca.modelos-contextuais`)
- **Origem:** `MODELOS_CONTEXTUAIS` constant
- **Tipo:** Variações de modelo por contexto
- **Uso:** Referência de casos especiais
- **Candidato para arquivar?** ✓ Sim (move para docs/)

---

## Telas Dinâmicas (Operacionais)

Estas telas consultam o banco de dados vivo e servem para monitoramento operacional em tempo real.

### 16. **Varredura de Completude** (`governanca.varredura-completude`)
- **Origem:** Queries ao banco de dados
- **Tipo:** Análise de cobertura de dados
- **Uso:** Monitor de integridade
- **Manter?** ✓ Sim (operacional)

### 17. **Varredura de Autorizações** (`governanca.varredura-autorizacoes`)
- **Origem:** Queries ao banco de dados
- **Tipo:** Auditoria de permissões
- **Uso:** Verificação de RLS
- **Manter?** ✓ Sim (operacional)

### 18. **Varredura de Administração** (`governanca.varredura-administracao`)
- **Origem:** Queries ao banco de dados
- **Tipo:** Status de contas e acessos
- **Uso:** Gerência de equipe
- **Manter?** ✓ Sim (operacional)

---

## Recomendação

### Próximas ações:

1. **Arquivar telas estáticas (1–15):**
   - Mover componentes para `/docs/governanca/` (referência offline)
   - Remover rotas de `/routes/_authenticated/governanca.*`
   - Deslocar menu de navegação
   - Resultado: Menu de Governança reduzido a 3 abas (Completude, Autorizações, Admin)

2. **Reconsolidar navegação:**
   - Menu de Governança fica menor e mais focado
   - Links estáticos move-se para docs ou manual

3. **Testar impacto:**
   - Verificar se há links internos para as telas removidas
   - Atualizar qualquer referência

### Timeline sugerido:

- **Fase 1 (semana 1):** Documentar todas as 15 telas estáticas como MDX no `/docs`
- **Fase 2 (semana 2):** Remover rotas e componentes
- **Fase 3 (semana 3):** Testes de regressão

---

## Próxima etapa?

Você gostaria de proceder com o arquivo das telas estáticas, ou prefere manter alguma delas ativa por enquanto?
