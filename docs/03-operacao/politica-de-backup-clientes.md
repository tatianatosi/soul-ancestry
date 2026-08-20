# Política operacional de backup de documentos de clientes

**Versão:** 1.0.0  
**Data:** 2026-08-20

## Objetivo

Manter cópia secundária verificável dos documentos de clientes armazenados no Google Drive compartilhado, usando Dropbox, sem confundir essa rotina com o backup técnico da aplicação.

## Arquitetura de cópias

| Escopo | Fonte primária | Cópia secundária | Responsável pela recuperação |
|---|---|---|---|
| Documentos de clientes | Google Drive compartilhado | Dropbox | Operação do Clube Ancestral |
| Banco de dados da aplicação | PostgreSQL na infraestrutura de produção | Backup externo independente | Responsável técnico |
| Arquivos enviados diretamente pela aplicação | Storage privado da aplicação | Backup externo independente | Responsável técnico |
| Código e documentação | GitHub privado | Clone local/controlado ou exportação periódica | Responsável pelo repositório |

## Procedimento mínimo

1. Executar sincronização/cópia segundo a periodicidade definida internamente.
2. Registrar data, escopo, responsável, resultado e falhas em log operacional.
3. Verificar amostra de arquivos copiados e respectivas versões.
4. Realizar teste de recuperação periódico para pasta isolada e controlada.
5. Restringir acesso ao backup às pessoas autorizadas e com MFA ativo.
6. Manter política de retenção antes de automatizar exclusões.

## Limites

- Dropbox não é o backup do banco de dados da aplicação.
- Um link compartilhável não é um mecanismo de autorização permanente.
- Pastas de documentos não devem conter chaves, senhas, tokens ou exportações não criptografadas de banco de dados.
