# Diagnóstico: SEO, banco de dados e consulta ao GitHub

Rodada só de diagnóstico, sem mexer nas telas e sem publicar. Cada correção encontrada vira proposta separada, que precisa da sua aprovação.

## 1. Revisão de SEO
- Ler os achados de SEO que já existem. Se estiverem antigos ou faltarem, rodar a revisão rápida (nome da página, descrição, robots, sitemap, metadados).
- Mostrar os achados num cartão para você aprovar ou recusar as correções.
- O App Cliente (`/portal`) e o Desk são áreas privadas, com login. Ficam fora da busca do Google. Só a página inicial pública e o link de proposta (canvas) entram na revisão.
- Ao aprovar: corrigir só título, descrição e metadados de cada página pública, além de robots e sitemap. Nada visual muda.

## 2. Otimização do banco
- Base de custo: ver uso e créditos do banco no período atual (horas ativas e armazenamento), com a janela de tempo informada.
- Carga: listar as consultas mais lentas e mais repetidas, além do tamanho das tabelas e dos índices.
- Rotinas agendadas: ver se alguma consulta repetida mantém o banco ligado sem necessidade.
- Entrega: um relatório com o que pesa e quanto, e propostas como índices, leituras em lote e menos consultas repetidas.
- Não apagar dados, não mudar regras de acesso e não aplicar migration sem sua autorização expressa. Mudar o tamanho do banco é decisão sua.

## 3. GitHub (consulta pontual)
- Consultar o repositório `tatianatosi/soul-ancestry` aqui no chat, pelo conector do GitHub, sem ligá-lo ao App.
- Se ainda não houver conexão, aparece um cartão para você conectar sem vincular ao projeto.
- Exemplo do que consultar: commits recentes, PRs abertos e branches, para conferir com a versão publicada.

## Entrega
Um resumo curto por frente, com números reais. Nenhuma alteração além das que você aprovar.
