Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Fase 0 do CA-05 (Memória de Bases Genealógicas) — mapeamento somente-leitura, conforme prescrito na
seção 16 do documento CA-CA05-Desk-Intelligence-e-Memoria-de-Bases-Genealogicas-2026-08-18-v1_0.md.

Contexto: a proprietária já tem dois documentos de arquitetura completos e aprovados como modelagem
(não execução): CA-CA05 v1.0 (18/08/2026) e Bloco 5A — Arquitetura Genealógica (11/08/2026). Ambos
definem com precisão o que a capacidade "Memória de Bases Genealógicas" deve fazer, seus guardrails,
contrato de resposta, modelo de dados conceitual e testes obrigatórios. Este prompt NÃO implementa
nada disso ainda — implementa só a Fase 0 que o próprio CA-CA05 exige antes de qualquer prompt de
construção.

Modo de execução obrigatório: SOMENTE LEITURA. Não alterar banco, UI, políticas de RLS, funções ou
dados. Não criar tabela, rota, componente ou migration. O entregável é uma matriz, não código.

────────────────────────────────────────

O que mapear

Para cada item abaixo, classificar como: existente (já há implementação real, com evidência de
código/tabela) · preservar (existe e deve continuar exatamente como está) · adaptar (existe mas
precisa mudar para caber na arquitetura do CA-05) · criar (não existe, precisa ser construído) · não
usar (existe mas é redundante/obsoleto e não deve fazer parte desta capacidade).

1. Rotas e telas relacionadas a pesquisa genealógica
   - Já confirmado nesta auditoria: /pesquisa-modulo/$id (componente PainelPesquisaModulo, 12 abas:
     Visão geral, Pessoas, Relações, Eventos, Fontes, Evidências, Hipóteses, Pedidos documentais,
     Pendências, Relatórios internos, Resumo ao cliente, Auditoria); /fontes-genealogicas; subárea
     "Bases Genealógicas" dentro de Biblioteca Mestre (/biblioteca).
   - Verificar: cada uma dessas telas cobre qual parte do modelo do CA-05 (seção 4: Identidade da
     base, Cronologia, Território, Instituições, Cobertura digital, Contatos, Algoritmos, Prompts,
     Glossário, Protocolos, Guardrails)? Onde há sobreposição com o que o CA-05 pede como painel nativo
     "Bases Genealógicas" (seção 12)?

2. Radar e elegibilidade interna
   - Verificar se existe hoje algum campo/tela que já trata "elegibilidade" como estado de triagem
     (conforme os estados recomendados na seção 5 do CA-05: sem dados suficientes, em triagem, hipótese
     de rota identificada, documentação em validação, requer validação jurídica, não prosseguir nesta
     rota, rota alternativa em análise) — ou se hoje a elegibilidade aparece como percentual/score cru
     em algum lugar (isso seria "adaptar", pois o CA-05 proíbe expor "elegível"/"aprovado"/percentual).

3. Assistente de pesquisa
   - Já confirmado: /api/pesquisa-assistente (sessão de equipe, RLS por usuário, streaming, sem
     escrita no banco).
   - Verificar: o formato de resposta atual já segue os 10 blocos do contrato de resposta do CA-05
     (seção 8: base consultada, leitura do contexto, regra/algoritmo, fonte primária, fontes
     secundárias, validação adicional, prompt/protocolo, próxima ação, limites e alertas, status da
     resposta)? Ou responde em formato livre hoje?
   - Verificar: o assistente hoje é genérico ou já é roteado por base nacional (Itália, Áustria,
     Portugal, Espanha, Polônia)?

4. Assistente Transversal (CA-UX-03)
   - Já confirmado: componente AssistenteTransversal, presente nos 8 grupos do Desk, com guardrails
     (não altera dado, não dispara ação externa, não eleva permissão).
   - Verificar: esse componente já é ou poderia ser o ponto de entrada único do CA-05 (seção 6, "Fluxo
     nativo no Desk"), ou são duas coisas separadas que precisam ser reconciliadas?

5. Dados, RLS e auditoria
   - Verificar quais tabelas/migrations já existem para: pessoas, relações, eventos, documentos,
     fontes, evidências, variantes de nome, pendências (entidades do Dicionário B do Bloco 5A) — e se
     têm RLS por organização.
   - Verificar se existe algo equivalente a GenealogyBase, GenealogyKnowledgeAsset, GenealogyRule,
     GenealogyPrompt, GenealogyQueryInsight (modelo conceitual da seção 11 do CA-05) — mesmo que com
     outro nome. Reutilizar entidade existente equivalente; não propor tabela duplicada.

6. Linguagem e guardrails de conteúdo (Bloco 5A, seções 1.3 e 8.4)
   - Verificar se a lista de termos proibidos ("constelação familiar", "cura ancestral", "trauma
     transgeracional", associação de nacionalidade a personalidade) já está implementada em algum
     lugar (validação de texto, lint de conteúdo) ou é só regra de processo humano hoje.

7. Pré-requisitos da seção 10.3 do Bloco 5A
   Verificar o estado atual de cada um (não é pergunta retórica — checar de fato):
   - LGPD operacional (consentimento registrado para dado pessoal coletado)
   - Bases aprovadas com termos de uso validados (ou ainda pendente por país)
   - Schema de banco aprovado para evidências
   - Sistema de autenticação do Desk (já existe e está maduro — confirmar que cobre isso)
   - Workflow de revisão humana para aprovar conteúdo antes de publicar
   - Glossário de linguagem segura aprovado
   - Quantas nacionalidades estão de fato ativas/priorizadas hoje no produto

────────────────────────────────────────

Entregável único: a matriz completa (item → classificação → evidência → observação), organizada nas
7 seções acima. Terminar aguardando revisão humana — não propor implementação, não estimar prazo, não
sugerir prompt seguinte. Isso é decisão da proprietária, depois de ver o mapa real.
