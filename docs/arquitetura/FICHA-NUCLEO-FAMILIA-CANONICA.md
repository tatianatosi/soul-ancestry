# Ficha Núcleo/Família — contrato canônico (Fase 2, 27/09/2026)

```yaml
status: executado
fase: 2 de 6 — "Prompt Canônicos — Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Núcleo Familiar 360 é a unidade familiar canônica: dossiê-mãe, membros,
representação, ambiente de acesso e vínculo a casos. Não é o lugar de
inventário documental individual (isso é da Pessoa) nem de publicação bruta
para o App Cliente.

## Fonte única

| Peça | Tabela | Reader | Writer |
|---|---|---|---|
| Núcleo | `nucleos_familiares` | `listarNucleos` | `criarNucleo`, `salvarDossieNucleo` |
| Membro/requerente | `nucleo_membros` | `listarNucleos` | `adicionarMembroNucleo`, `salvarMembroNucleo` |
| Papel no caso | `nucleo_membros.papel_no_caso` (CHECK de 5 valores, migration `20260821135341`) — mesmo conceito de `case_members.papel_no_caso` | idem | `salvarMembroNucleo` |
| Representação de menor | `case_members.representacao_necessaria/documentada` (só quando o caso ainda tem `case_members` ativo) | `pessoasDoCasoComFallbackNucleo`, projetado em `listarNucleos` | nenhum novo — leitura por vínculo, nunca gravado por `nucleo_membros` |
| Fila de provisionamento do Drive | `drive_provisioning_queue` | `listarNucleos` | `encaminharFilaDrive` |

`nucleos_familiares`/`nucleo_membros` continuam a única fonte de dossiê-mãe e
composição familiar — `case_members` só é consultado (nunca escrito) para
expor representação quando o caso ainda não migrou para Núcleos.

## Papéis unificados — uma função, três telas

Antes deste corte, a mesma pessoa podia ter até **três rótulos diferentes**
para o mesmo papel, em três telas:

1. `/nucleos` — vocabulário cru de escrita (`contratante_signatario`/
   `dependente`/`referencia_genealogica`/`requerente`, via `NUCLEO_PAPEIS`).
2. Caso 360 (`PessoasDoNucleo`) — rótulo próprio local
   (`contratante_signatario`/`dependente`/`participante` — o último nem
   sequer um valor real gravável).
3. Caso 360 (`case_members`)/Pessoa 360 — já usavam a coluna real
   `papel_no_caso` com `PAPEIS_PESSOA` (6 valores: contratante/titular/
   dependente/representante/interlocutor_externo/interlocutor legado).

Corrigido: `pessoaDoCasoAPartirDoNucleo` (`src/lib/pessoa-vinculo.ts`) agora
prefere `nucleo_membros.papel_no_caso` (a coluna real) sobre a aproximação
antiga derivada de `papel`+`ordem`, e as três telas (`/nucleos`,
`PessoasDoNucleo` em Caso 360, Pessoa 360) leem esse mesmo valor com o mesmo
rótulo (`PAPEIS_PESSOA`). Quando `papel_no_caso` ainda é nulo (linha nunca
migrada), cada tela cai no mesmo fallback (`papel_no_caso || papel cru`) —
nunca um rótulo inventado por tela.

**Gravação nova nunca usa a variante legada `interlocutor`** — o CHECK real
do banco só aceita 5 valores (sem `interlocutor`); `salvarMembroNucleo`
recusa uma escolha nova desse valor com mensagem clara, mas preserva uma
linha que já o tinha (nunca apaga dado existente ao reabrir o formulário).

## Dossiê-mãe × Inventário documental da pessoa (já corretos, só documentado)

Dossiê-mãe (`nucleos_familiares.dossie_mae` + ambiente/nível de
acesso/responsável/status) é exclusivo do núcleo — uma família, um dossiê.
Inventário documental (agregação de `case_source_documents` por pessoa, em
Pessoa 360) é outro conceito, por pessoa, não por núcleo — não havia
confusão real entre os dois; só reafirmado aqui por exigência do prompt.

## Representação de menor

`nucleo_membros` nunca gravou representação legal (só `case_members` grava).
Em vez de criar uma ficha paralela, `listarNucleos` agora expõe
`representacaoNecessaria`/`representacaoDocumentada` por membro **só quando
o caso do núcleo ainda tem `case_members` real** (via
`pessoasDoCasoComFallbackNucleo`, casado por nome normalizado — a mesma
pessoa, duas tabelas transicionais). Quando a fonte é o fallback de núcleo
(caso já migrado, sem `case_members`), o campo permanece nulo — nunca
inventado.

## Publicações comuns do núcleo no App — gap declarado, não construído

Confirmado (investigação desta sessão): o App Cliente só projeta conteúdo por
CASO (`app_projections`/`client_deliverables`, sempre com `case_id`) — não
existe conceito de publicação por núcleo/família inteira. Construir isso
exigiria decisão de produto (o que uma "publicação de núcleo" significaria,
como isolar por caso quando um núcleo tem mais de um) e um mecanismo de
sanitização próprio — fora do escopo desta fase, que proíbe expor dado cru no
App sem essa decisão. Declarado aqui como pendência real, não fabricado.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fase2-ficha-nucleo-familia-canonica-2026-09-27.test.ts`.
Suíte completa e `vite build` — ver rodapé do commit.

## Prova Lovable pós-push

1. Em `/nucleos`, editar o papel de um requerente — a lista de opções usa o
   mesmo vocabulário de Caso 360 (Contratante/Titular/Dependente/
   Representante/Interlocutor externo); salvar e recarregar mostra o mesmo
   rótulo.
2. Abrir o Caso 360 desse mesmo núcleo (seção "Composição familiar") e
   conferir que o rótulo do papel é idêntico ao de `/nucleos` — não mais um
   rótulo próprio da tela.
3. Para um caso ainda com `case_members` ativo e representação necessária
   marcada: conferir que `/nucleos` mostra o aviso "Representação
   documentada/pendente" ao lado do membro correspondente.
