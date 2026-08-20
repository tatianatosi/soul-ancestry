# ADR-0005: Infraestrutura inicial na Servla e uso opcional de Vercel/Supabase

- Status: Aceito para o MVP
- Data: 2026-08-20

## Contexto
O Soul Ancestry/Clube Ancestral está em fase de fechamento do piloto Ana e preparação de migração do Lovable para GitHub. O domínio já está pago. Busca-se custo inicial baixo, hospedagem brasileira e controle operacional compatível com dados e documentos de clientes.

## Decisão
1. A infraestrutura de staging e produção será planejada para uma VPS básica da Servla, condicionada à confirmação de datacenter no Brasil, Docker/Compose, acesso SSH, volumes persistentes, HTTPS, firewall, backup e possibilidade de upgrade.
2. GitHub privado permanece como fonte oficial de código, documentação, ADRs, releases e histórico.
3. Vercel e Supabase não serão contratados no MVP. Se houver uso durante o período de prototipação, deverá permanecer limitado aos planos gratuitos e não será tratado como infraestrutura definitiva de produção.
4. Vercel poderá ser reavaliado para previews, deploy contínuo, CDN e redução de administração de front-end.
5. Supabase Pro poderá ser reavaliado para PostgreSQL, autenticação, storage e backups gerenciados, caso o esforço operacional próprio justifique o custo.

## Consequências
- O custo recorrente inicial será concentrado no pacote Servla e nos complementos indispensáveis de operação.
- A equipe assume configuração e manutenção de sistema, atualizações, segurança, backups e testes de restauração.
- Nenhum dado de cliente, documento, token ou segredo será versionado no GitHub.
- A decisão deve ser revista 30 a 60 dias após o go-live, com base em uso real, incidentes, armazenamento, esforço operacional e custo total.
