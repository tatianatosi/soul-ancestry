<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Reveja se agora tudo se aplica no dia a dia ou ainda estamos em contexto

Ainda estamos em um estado **híbrido**: boa parte do Desk e das regras internas está implementada e utilizável no dia a dia, mas o ecossistema completo ainda não pode ser tratado como operação viva, automatizada e comprovada de ponta a ponta.

## O que já se aplica

No **Desk interno**, há aplicação prática suficiente para uso diário controlado:

- Navegação, CRM, Casos, Pesquisa, Contratos/Financeiro, Cliente e Governança estão organizados como superfícies operacionais.
- Gates de ativação, classificação real × demo, requisitos de caso, cadência, microentregas, auditoria e projeções sanitizadas possuem regras e testes locais.
- O portal foi concebido para expor somente conteúdo aprovado, sanitizado e permitido por caso; o App não deve ler projeções internas diretamente.
- O catálogo operacional já identifica itens utilizáveis, condicionais e pendentes, e impede que `CA-CURSO-001` seja usado sem decisão humana sobre seu status arquivado. [^1333]


## Onde ainda é contexto

A maior parte da integração entre sistemas ainda é **governança/documentação, não execução comprovada**:


| Domínio | Situação atual | Impacto prático |
| :-- | :-- | :-- |
| CRM e oportunidades | Há fontes concorrentes e `Opportunity_ID` ainda não está implementado como identificador reconciliado | Evite tratar pipeline e handoff como plenamente automatizados |
| IDs de caso | Há divergência entre IDs do Desk/Dossiê e da planilha go-live | Não crie novos IDs antes de eleger o canônico |
| Financeiro e Asaas | Configuração documentada, mas marcada como pendente de teste/transação | Não use como prova de cobrança, assinatura ou pagamento em tempo real |
| Planejador | Indicado como fonte de cronograma, mas há IDs duplicados e erro no resumo | Não deve comandar automaticamente tarefas ou prazos vivos |
| Tarefas e calendário | OPS, Google Tasks, Calendar e `.ics` ainda têm sobreposição sem fonte ativa única confirmada | Uso diário deve ter um responsável e uma lista operacional única |
| Conteúdo do App Cliente | Regras de sanitização existem, mas a operação com conteúdo real publicado ainda requer prova autenticada | Não considerar a experiência do cliente homologada em produção |
| Webhooks e logs | Configurados/documentados, porém pendentes de teste ponta a ponta | Não presumir sincronização automática confiável |

Esses pontos estão explicitamente marcados no inventário como `PENDENTE_DE_IMPLEMENTACAO`, `CONFIGURADO_PENDENTE_DE_TESTE`, `REFERENCIA_CONFLITANTE_PENDENTE_DE_VALIDACAO` ou bloqueados por gatilho. [^1331]

## Diagnóstico direto

**Pode operar agora, com disciplina humana:**

- Atendimento, CRM interno, Casos, documentação de pesquisa, gates, cadência e acompanhamento no Desk.
- Catálogo apenas quando a Planilha Mestre for consultada como fonte de preço, escopo, condição e status.
- Conteúdo para cliente somente depois de aprovação e sanitização explícitas.

**Não está pronto para operar de forma autônoma ou integrada:**

- Criação/sincronização automática entre CRM, Planejador, Desk, Drive, Asaas e App.
- Cobrança, assinatura, links de pagamento, publicação comercial, campanhas ou disparos.
- Indicadores financeiros/comerciais derivados de múltiplas fontes sem reconciliação.
- Gestão de caso baseada em IDs concorrentes.
- App Cliente como experiência de produção comprovada para cliente autenticado.


## O mínimo para sair do “contexto”

A sequência mais importante é:

1. **Eleger o `Case_ID` canônico** e reconciliar os registros existentes, sem criar um terceiro identificador.
2. Definir uma fonte ativa para **CRM/oportunidade**, **tarefas** e **cronograma**.
3. Corrigir IDs duplicados e o erro de resumo no Planejador antes de alimentá-lo com dados vivos.
4. Vincular SKU, produto, preço, link e pagamento com uma chave auditável entre Planilha Mestre e Asaas.
5. Executar testes autenticados em produção: Desk, Proprietária, portal do cliente, reload e acesso negado a caso de terceiro.
6. Materializar Anexos I–V por caso somente quando os gates e dados necessários estiverem efetivamente atendidos.

Em resumo: o produto interno já serve como **camada de operação assistida e controlada**; a operação viva intersistemas, financeira e cliente ainda exige reconciliação, credenciais/sessões de teste e provas de execução real.
<span style="display:none">[^1][^2][^3][^4]</span>

<div align="center">⁂</div>

[^1]: CA-EVO-04_Dados_Vivos_e_Integracoes.md

[^2]: 04_TOP_SKUS_CANDIDATOS/relatorio_advisor_top_skus.md

[^3]: 05_CATALOGO_OPERACIONAL_30/05_CA06_Catalogo_Operacional_30_Clube_Ancestral.md

[^4]: 394a48ec-9447-473b-ad74-f141e5405bdc-1.md

