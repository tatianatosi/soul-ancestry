# Ficha Pessoa 360 — contrato canônico (Fase 1, 27/09/2026)

```yaml
status: executado
fase: 1 de 6 — "Prompt Canônicos — Fichas, Evidências, Identidade e Contrato v1.0"
responsável pela decisão: Proprietária do Clube Ancestral
```

## Finalidade

Pessoa 360 (`/pessoas/$clienteId`) é a visão de **uma identidade** —
consolidando o que já existe sobre a pessoa em `clientes`, sem ser cópia da
ficha do Caso nem formulário de contrato.

## Os 10 blocos, fonte de cada um

| Bloco | Fonte real | Estado antes desta fase |
|---|---|---|
| Identidade e variantes de nome | `clientes` | ✅ já completo |
| Dados cadastrais restritos, origem, verificação | `clientes.data_origin` + card "Como entrou" | ✅ já completo |
| **Papéis** (contratante/titular/dependente/representante/interlocutor externo) | `nucleo_membros.papel_no_caso`/`case_members.papel_no_caso` | ⚠️ parcial — corrigido nesta fase |
| Consentimentos, nível de acesso, App Cliente | `consent_records` + "Conteúdo publicado para o App Cliente" + `ExperienciaNoApp` | ✅ já completo |
| Núcleos e casos vinculados | `casos`, `nucleo_membros`, `nucleos`, `case_members` (pai_id/mae_id) | ✅ já completo |
| Documentos e solicitações individuais | "Propostas, contratos e documentos" + "Inventário documental da pessoa" | ✅ já completo |
| Pesquisa, linhagens, evidências, achados | `research_people`/`genealogical_person_profiles`/`genealogical_findings` | ✅ já completo |
| **Estado de onboarding sem duplicar contrato** | `crm_casos.eixo_formalizacao` | ⚠️ ausente como bloco próprio — corrigido nesta fase |
| Experiência efetivamente liberada no App | `ExperienciaNoApp` (`resumoVisaoClienteCaso`) + "Conteúdo publicado" | ✅ já completo |
| Histórico, tarefas, próxima ação | Card "Casos" (próxima ação via RPC) + "Linha do tempo" + "Sinais" | ✅ já completo |

## O que foi corrigido nesta fase

### Papéis unificados (mesmo princípio da Fase 2 — núcleo)

`src/lib/pessoa.functions.ts#carregarPessoa` — a consulta de
`nucleo_membros` passa a selecionar `papel_no_caso` (antes só o vocabulário
cru de 2 valores, `papel`). `src/routes/_authenticated/pessoas.$clienteId.tsx`
— o card "Núcleo familiar e papéis" prefere `papel_no_caso` com o rótulo de
`PAPEIS_PESSOA` (o mesmo vocabulário de 6 valores usado em Caso 360 e
`/nucleos`), caindo no rótulo binário antigo só quando a linha ainda não foi
migrada (`papel_no_caso` nulo). `caseMembers` (fonte de `case_members`, via
`pessoasDoCasoComFallbackNucleo`) já carregava `papel_no_caso` real — não
precisou de mudança na consulta, só a Fase 2 já corrigiu a derivação para o
caminho de fallback de núcleo.

### Card de onboarding por caso

Antes, o estado de onboarding só aparecia embutido no card "Comercial"
(`ROTULO_STATUS_COMERCIAL`, um vocabulário diferente e menos granular).
`crm_casos.eixo_formalizacao` já é o campo real de lifecycle de
formalização/onboarding (`EIXO_FORMALIZACAO`: não iniciado → contrato
enviado → contrato assinado → pagamento inicial confirmado → cliente ativo
→ onboarding iniciado → caso ativo → arquivado) — já carregado por
`carregarPessoa`, nunca renderizado no card "Casos". Adicionado um bloco
"Onboarding" dentro de cada card de caso, ao lado de "Próxima ação",
reaproveitando o mesmo campo e rótulo que `/leads` já usa — nenhum campo
novo, nenhuma tabela nova.

### Contrato continua só link (confirmado, sem mudança)

O bloco "Propostas, contratos e documentos" já lê `contratos`/`contract_parties`
só como resumo (status, `signed_at`) com link para `/contratos/$id` e
`/casos/$caseId/contrato/preparar` — nunca duplica dado pessoal completo do
contrato. Confirmado nesta fase, sem alteração necessária.

## Verificação

`tsc --noEmit` limpo. Testes novos em
`src/lib/__tests__/fase1-ficha-pessoa-360-canonica-2026-09-27.test.ts`.
Suíte completa e `vite build` — ver rodapé do commit.

## Prova Lovable pós-push

1. Em `/pessoas/$clienteId` de uma pessoa vinculada a um núcleo cujo
   `papel_no_caso` já foi definido (via `/nucleos`, Fase 2): conferir que o
   card "Núcleo familiar e papéis" mostra o mesmo rótulo (Contratante/
   Titular/Dependente/Representante/Interlocutor externo), não mais só
   "Dependente"/"Contratante/signatária".
2. No card "Casos", cada caso listado mostra um bloco "Onboarding" com o
   rótulo real de `eixo_formalizacao` (ex.: "Onboarding iniciado"), ao lado
   da "Próxima ação".
