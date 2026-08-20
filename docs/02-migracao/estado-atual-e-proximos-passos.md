# Estado atual e próximos passos de migração

**Atualizado em:** 2026-08-20

## Estado atual

- Repositório oficial identificado: `tatianatosi/soul-ancestry`, privado, branch padrão `main`.
- Aplicação existente em TypeScript, com diretórios `src`, `supabase`, `docs` e governança inicial.
- O projeto mantém arquivo `.env` no repositório. Antes de qualquer publicação ou compartilhamento externo, deve-se verificar se ele contém segredos e removê-lo do histórico caso necessário.
- A rodada Ana no Lovable ainda precisa ser finalizada e submetida a pente-fino antes do congelamento da versão migrável.

## Decisões confirmadas

- Domínio: já pago; não entra na projeção mensal atual.
- Hospedagem alvo: Servla, em infraestrutura brasileira, após validação técnica do pacote básico.
- GitHub: plano gratuito com repositórios privados; manter como fonte oficial.
- Vercel: não contratar Pro no MVP; uso gratuito somente para protótipos/testes, se necessário.
- Supabase: não contratar Pro no MVP; validar se o projeto atual usa Supabase e planejar sua substituição/continuidade antes do deploy Servla.
- Documentos de clientes: Google Drive compartilhado como origem operacional; Dropbox como cópia de segurança secundária.

## Próximos passos obrigatórios

1. Concluir prompts Ana 06 a J e registrar resultados.
2. Executar auditoria técnica do Lovable e inventário de dependências.
3. Fazer varredura de segredos no repositório, especialmente no arquivo `.env`, e corrigir exposição se identificada.
4. Criar `.env.example` sem valores reais.
5. Confirmar na Servla: datacenter brasileiro, recursos, Docker, volumes, backup, snapshot e upgrade.
6. Criar ambiente de staging com dados fictícios/anonimizados.
7. Configurar backup técnico independente para banco e arquivos da aplicação.
8. Validar restauração, permissões, uploads, logs, HTTPS e rollback antes de dados reais.

## Critério de avanço para produção

A produção somente poderá receber dados reais após aprovação do checklist de segurança, teste de restauração documentado, autenticação/permissões validadas e release registrado no GitHub.
