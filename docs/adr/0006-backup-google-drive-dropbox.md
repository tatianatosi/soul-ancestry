# ADR-0006: Google Drive compartilhado como repositório operacional e Dropbox como cópia de segurança

- Status: Aceito com condicionantes de segurança
- Data: 2026-08-20

## Contexto
Os arquivos dos clientes são organizados em Google Drive compartilhado. Foi definida a utilização do Dropbox como cópia de segurança desse acervo.

## Decisão
1. O Google Drive compartilhado permanece como repositório operacional primário dos documentos de clientes.
2. O Dropbox será usado como cópia de segurança secundária do conteúdo do Drive compartilhado, por sincronização ou rotina controlada.
3. O Dropbox não substitui backup técnico da aplicação, do banco PostgreSQL, das configurações de infraestrutura, dos segredos e dos registros de auditoria.
4. Dados do sistema devem possuir backup próprio e independente: dump do PostgreSQL, cópia de arquivos privados da aplicação quando existirem e documentação de restauração.

## Regras operacionais
- Acesso ao Drive e Dropbox deve usar contas corporativas, autenticação em dois fatores e permissões mínimas necessárias.
- A pasta de backup deve ter convenção de nomes, data, responsável e registro de execução.
- Deve haver verificação periódica de integridade e teste de recuperação de uma amostra de documentos.
- Documentos sensíveis não devem ser enviados por links públicos permanentes.
- A exclusão no Drive não deve apagar automaticamente a cópia de backup antes do prazo de retenção definido.

## Consequências
- Há redundância entre dois provedores para o acervo documental.
- Há necessidade de monitorar capacidade, permissões, duplicidade, versões e política de retenção.
- A rotina de backup deve ser testada; sincronização sem teste de recuperação não é evidência suficiente de backup.
