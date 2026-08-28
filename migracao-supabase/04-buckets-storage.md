# 04 — Buckets de Storage a recriar

Crie em **Storage → New bucket** no novo projeto, todos **privados**:

| Bucket | Público? | Uso |
|---|---|---|
| `contracts` | não | contratos, versões e anexos gerados |
| `pesquisa` | não | evidências e documentos de pesquisa |
| `documentos` | não | documentos do caso e do cliente |

Os arquivos em si não são migrados automaticamente: baixe do projeto atual e
reenvie, ou copie via script usando URLs assinadas.

## Políticas de acesso aos arquivos

O acesso é sempre por URL assinada gerada no servidor; os buckets não devem ser
públicos. As políticas de `storage.objects` do projeto atual estão no arquivo
`01-schema-public.sql` apenas quando pertencem ao schema `public` — para
storage, mantenha os buckets privados e o app continua funcionando, pois toda
leitura passa por função de servidor autenticada.
