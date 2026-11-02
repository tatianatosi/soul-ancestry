# Aprovações reais e publicação controlada

## Resultado
Reutilizar admin, operações, comercial e financeiro. Somente admin aprova preços e contratos; os demais mantêm as preparações já permitidas. Não criar usuários ou atribuir papéis a contas não identificadas.

## Cortes separados
1. **Permissões:** conferir definições e políticas atuais; bloquear aprovações e alterações de condições já aprovadas por não-admin, preservando rascunhos, histórico e isolamento.
2. **Contrato da Ana:** conferir a revisão da v6 e dados/documentos pendentes. Não declarar assinatura, envio ou liberação sem o respectivo ato. As seis versões já estão no histórico.
3. **GitHub/Lovable:** preservar o repositório conectado; PR #222 só integra após testes, base atualizada e revisão independente. A proteção da main está confirmada e não será removida.
4. **Publicação:** confirmar no editor a versão aprovada antes de publicar. A proteção do GitHub não bloqueia o botão Publicar do Lovable; não prometer uma trava inexistente.

## Detalhes técnicos
- Autorizar aprovação no servidor e nas transições do banco, inclusive inserções, metadados de aprovação e caminhos alternativos de parâmetros/prévias.
- Cobrir catálogo de preços, homologação, condições comerciais e termos de propostas consumidos pelo contrato, sem tornar toda escrita admin-only.
- Exigir admin ativo da organização do registro antes de considerar qualquer override de pendência.
- Aplicar mudança de permissões em migration própria, separada de contrato e publicação.
- Testar concretamente admin autorizado; operações/comercial/financeiro/pesquisador/leitura negados para aprovação; preparações preservadas; organização alheia negada; aprovação forjada por escrita direta negada.
- Datas já registradas: Heinrich 15/05/1837 e Lotte 16/05/1902, fonte secundária Auditoria-Mãe §10.4 e verificação pendente. Árvore apresenta os anos 1837 e 1902; nenhum parentesco foi alterado.

## Validação e limites
Executar testes relevantes e releitura autenticada. A publicação do contrato aguarda revisão/dados válidos; a PR #222 aguarda revisor independente. Seleção do branch sincronizado é feita pela Proprietária em Configurações → Git. Não reconectar nem criar outro repositório.