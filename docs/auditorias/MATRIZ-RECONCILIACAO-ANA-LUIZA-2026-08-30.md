# Matriz de reconciliação — Ana Luiza — 30/08/2026

## Limite honesto desta entrega

Esta sessão **não tem credencial ativa no Supabase**. Por isso, o que segue
é uma **auditoria de código**, não uma consulta ao banco ao vivo — não
reflete o estado real das linhas hoje, só o que o código diz que pode
acontecer e o que já está decidido/hardcoded no repositório. As colunas
"ID atual", "data de criação" e "vínculo atual" para os registros reais só
podem ser preenchidas por quem tem acesso ao Supabase (a proprietária ou
uma sessão com o MCP do Supabase autorizado). No fim deste documento há a
consulta exata a rodar para preencher essa parte.

## Resposta direta à pergunta que motivou o alerta

**Nenhum commit desta sessão, hoje, criou ou altera lógica de criação de
caso, núcleo, cliente, proposta, contrato ou onboarding para Ana Luiza.**
Conferido por `git diff` contra todo o histórico de hoje: os únicos
arquivos tocados hoje que existem = `piloto-ana.tsx` (só rótulos/layout,
commit `d67afde`) e as correções de gravação/400 já reportadas
(`fontes-genealogicas`, `cadastro-checklist`, `clientes`, `ops`,
`comercial`, `contrato-parametros`, `conciliacao-catalogo`,
`cadeia-operacional`). Nenhum deles insere em `crm_casos`,
`nucleos_familiares`, `clientes`, `case_members`, `proposals` ou
`contracts`.

**A reconciliação do case_id da Ana já estava feita — antes de hoje, em
22/08/2026 — e está corretamente hardcoded no repositório**
(`src/lib/piloto-ana.ts`):

```
id_canonico_decidido: "CA-CID-AT-FAM-2026-001"
ids_historicos: ["CA-AUT-ANALUIZA-FAM-2026-001", "CA-2026-ANA-001", "CA-CID-AT-2026-002"]
decisao_id_canonico: "Decisão da Proprietária Administradora em 22/08/2026:
  identificador canônico já definido na operação. Referência legada
  resolvida para CA-CID-AT-FAM-2026-001."
```

Ou seja: `CA-CID-AT-FAM-2026-001` já é o canônico decidido;
`CA-AUT-ANALUIZA-FAM-2026-001` já é alias histórico preservado — exatamente
a política que você descreveu (nada apagado, um único canônico, aliases
preservados). Isso não foi feito agora; já existia.

## Como a busca evita duplicar (`piloto-ana.functions.ts`)

```ts
const CODIGOS_BUSCA_PILOTO = [...PILOTO_ANA.ids_historicos, PILOTO_ANA.id_canonico_decidido];

async function localizar(supabase, organizationId) {
  return supabase.from("crm_casos").select("*")
    .eq("organization_id", organizationId)
    .or(CODIGOS_BUSCA_PILOTO.map(c => `codigo.eq.${c}`).join(","))
    .maybeSingle();
}
```

`materializarPilotoAna` chama `localizar()` **antes** de qualquer
`insert`. Só insere se nenhum dos 4 códigos (3 históricos + 1 canônico)
bater. Como o caso que aparece nos seus prints já tem `codigo =
CA-CID-AT-FAM-2026-001` — um dos 4 — `localizar()` o encontra, e o código
vai para o ramo `else` (`UPDATE`, não `INSERT`). Não há caminho, no código
de hoje, para criar um segundo `crm_casos` para Ana Luiza enquanto esse
código continuar sendo um dos 4 buscados.

## O botão "Registrar decisão" que você usou (print das 11:09)

É `definirIdCanonicoPiloto`. Conferido linha a linha:
- Só faz `UPDATE` em `crm_casos` (campos `id_canonico_decidido`,
  `id_canonico_decidido_por`, `id_canonico_decidido_em`) e em
  `piloto_bloqueios` (marca o bloqueio de ID pendente como resolvido).
- **Nunca insere nada.** Se você tentasse decidir um ID que não está em
  `ids_historicos`, a função recusa com erro explícito: "Nenhum terceiro ID
  é criado automaticamente."
- O uso que você fez (registrar `CA-AUT-ANALUIZA-FAM-2026-001` com você
  como decisora) foi seguro por construção — não criou nem pode criar
  registro novo.

## Achado colateral, corrigido nesta sessão como melhoria de clareza

O botão que aparece **só quando nenhum caso é encontrado** (`!caso`) tinha
o rótulo "Registrar caso-piloto no Desk" e virou "Novo caso" numa edição de
hoje (`d67afde`, só rótulo/layout) — nome infeliz para um botão que na
prática é "localizar ou criar", nunca duplica. Como esse botão só aparece
quando a busca não encontra nenhum dos 4 códigos, ele não apareceu nas suas
telas de hoje (o caso foi encontrado em todos os seus prints). Mesmo assim,
o nome estava gerando ansiedade desnecessária — corrigido para "Localizar
ou registrar caso" nesta mesma entrega, para deixar claro que não é criação
cega.

## Matriz (preencher a parte "ao vivo" com acesso ao Supabase)

| Entidade | ID atual (preencher ao vivo) | Código/nome | Origem | Data de criação (ao vivo) | Vínculo atual (ao vivo) | Registro de destino sugerido | Ação sugerida | Confiança | Risco | Observação |
|---|---|---|---|---|---|---|---|---|---|---|
| crm_casos | — | CA-CID-AT-FAM-2026-001 | `PILOTO_ANA.id_canonico_decidido` | — | — | Este é o canônico | Nenhuma — manter | Alta | Baixo | Decidido em 22/08/2026, hardcoded |
| crm_casos (alias) | — | CA-AUT-ANALUIZA-FAM-2026-001 | `PILOTO_ANA.ids_historicos[0]` | — | — | Alias do canônico acima | Nenhuma — manter como histórico | Alta | Baixo | Único que gera `crm_casos` novo se nenhum dos 4 for encontrado |
| crm_casos (alias) | — | CA-2026-ANA-001 | `PILOTO_ANA.ids_historicos[1]` | — | — | Alias do canônico acima | Nenhuma — manter como histórico | Alta | Baixo | — |
| crm_casos (alias) | — | CA-CID-AT-2026-002 | `PILOTO_ANA.ids_historicos[2]` | — | — | Alias do canônico acima | Nenhuma — manter como histórico | Alta | Baixo | — |
| nucleos_familiares | — | Núcleo Silveira Rodrigues | `materializarPilotoAna` (find-or-create por `case_id`) | — | — | Vinculado ao case_id canônico | Verificar se existe só 1 por case_id | Média | Baixo | Busca por `case_id`, não por nome — seguro contra duplicidade desde que o case_id seja único |
| nucleo_membros | — | Ana Luiza, Adair, Alice, Felipe | `materializarPilotoAna` (find-or-create por nome dentro do núcleo) | — | — | Vinculados ao núcleo acima | Verificar 1 linha por pessoa | Média | Baixo | Chave de dedupe é o nome dentro do `nucleo_id` — checar se "Pai (Adair)" bate com o Adair citado noutras telas |

## Consulta para preencher a parte "ao vivo" (rodar com acesso ao Supabase)

```sql
select id, codigo, titulo, organization_id, status, archived_at, created_at, id_canonico_decidido
from crm_casos
where codigo in ('CA-CID-AT-FAM-2026-001','CA-AUT-ANALUIZA-FAM-2026-001','CA-2026-ANA-001','CA-CID-AT-2026-002')
   or id_canonico_decidido = 'CA-CID-AT-FAM-2026-001';

select id, case_id, nome, contratante_nome, archived_at, created_at
from nucleos_familiares
where case_id in (select id from crm_casos where codigo in (
  'CA-CID-AT-FAM-2026-001','CA-AUT-ANALUIZA-FAM-2026-001','CA-2026-ANA-001','CA-CID-AT-2026-002'
));
```

Se essa consulta devolver **mais de uma linha** em `crm_casos`, existe de
fato uma duplicidade — mas ela não foi criada por nenhum código alterado
hoje; seria anterior, e a Fase 2 real (mapear origem exata de cada linha)
só é possível com o resultado dessa consulta em mãos.

## Fases seguintes (aguardando o resultado da consulta acima)

Fase 3 e 4 do pedido — aprovação humana e reapontamento controlado — não
foram iniciadas: dependem do resultado real da consulta acima, que esta
sessão não pode rodar. Nenhuma alteração de dado foi feita para "corrigir"
Ana Luiza nesta entrega; só leitura de código e um rótulo de botão.
