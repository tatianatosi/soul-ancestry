# Fonte de Verdade — Design e Execução

1. Mockup aprovado de 17 páginas
É a fonte de verdade para nomes, taxonomia, propósito, navegação, composição
visual, hierarquia e identidade do App Cliente e Desk Intelligence.

2. Mockup-auditoria de 47 páginas
É diagnóstico de divergências. Não substitui o mockup aprovado, não cria
taxonomia, não autoriza novas telas nem mudança de navegação.

3. Políticas e decisões posteriores aprovadas
Definem regras de dados, privacidade, pessoa canônica, Planejador,
Produtos-Pai, documentos, RLS, aprovação e ações externas.

4. Código, migrations, commits, PRs e testes
São evidência do que existe; não são fonte para mudar mockup/taxonomia.
Se divergirem da fonte aprovada, devem ser corrigidos ou classificados.

5. Ordem de precedência
Mockup aprovado
→ política/decisão aprovada mais recente
→ arquitetura canônica
→ código e schema atuais
→ auditorias/de-paras
→ prompts antigos
→ dados demo, layouts antigos e hipóteses

6. Regras práticas
- Não renomear, fundir, expandir ou substituir as sete telas do App ou Desk.
- Não criar nova tela/aba/taxonomia por causa de auditoria ou código legado.
- Não restaurar dados demo, CaseData local, rota piloto ou card sem fonte viva.
- Não usar Planilha Mestre como fonte operacional.
- Não usar SKU como bloqueio interno.
- App só usa conteúdo sanitizado e autorizado.
- Documento sensível é individual por padrão.
- Jurídico/financeiro bloqueiam apenas o ato externo correspondente.
- Dado real já comprovado satisfaz check automaticamente.
- Pendência não essencial não bloqueia rascunho interno.
