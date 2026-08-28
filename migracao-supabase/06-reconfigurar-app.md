# 06 — Reconfigurar o aplicativo para o novo projeto

O repositório declara a que banco pertence, de propósito: variável solta
apontando para outro projeto é ignorada. Para trocar de projeto é preciso mudar
dois lugares **juntos**.

## 1. `src/lib/config-publica.ts`

```ts
export const PROJETO_DECLARADO = {
  ref: "<novo-ref>",
  url: "https://<novo-ref>.supabase.co",
  publishableKey: "<nova-chave-publicavel>",
} as const;
```

## 2. `supabase/config.toml`

```toml
project_id = "<novo-ref>"
```

## 3. Variáveis de ambiente do deploy (Vercel ou equivalente)

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://<novo-ref>.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | chave `anon/publishable` do novo projeto |
| `VITE_SUPABASE_URL` | mesmo valor da URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | mesma chave publicável |

A chave **secret / service_role** só entra em ambiente de servidor, nunca no
repositório e nunca em variável com prefixo `VITE_`.

## 4. Me envie

- a URL do novo projeto;
- a chave publicável (`anon`).

Com esses dois valores eu aplico as mudanças acima e valido o login.
