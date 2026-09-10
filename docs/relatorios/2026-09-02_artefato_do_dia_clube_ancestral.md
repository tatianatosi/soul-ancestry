# Artefato do Dia — Clube Ancestral

```yaml
status: rascunho — registro de encerramento do dia, sem merge autorizado
versão: 1.0
data: 2026-09-02
projeto: Clube Ancestral
classificação: relatório diário / registro de sessão
responsável pela decisão: Proprietária do Clube Ancestral
base normativa: Política obrigatória — Entrega de artefatos e versionamento no GitHub; Prompt de Uso Diário — Artefato Primeiro (docs/prompts/2026-08-30_prompt_uso_diario_artefato_primeiro.md)
repositório: tatianatosi/soul-ancestry
fontes/evidências: PRs #46–#56, commits do dia, leitura direta de código (rota → componente → server function → tabela), conversa com a proprietária
documento substituído: nenhum — primeiro artefato deste formato
```

## 1. Objetivo e escopo

Registrar, num único documento rastreável, o que foi decidido, corrigido, verificado e arquivado no repositório `tatianatosi/soul-ancestry` em 02/09/2026, para servir de memória versionada e, por pedido da proprietária, ser espelhado como Google Doc no Drive compartilhado para uso na Perplexity.

Este artefato não substitui nenhuma das PRs ou documentos individuais citados — é o índice do dia.

## 2. Contexto

O dia começou com a continuação do trabalho de Pessoa Canônica (extensão de `clientes`, PR #51, aberta antes da meia-noite) e evoluiu por três frentes paralelas pedidas pela proprietária: (a) arquivamento de artefatos de governança e prompts recebidos por upload; (b) correções pontuais de arquitetura do motor contratual, encontradas por verificação direta de código; (c) um cotejo tela a tela do Desk contra uma taxonomia de 6 abas, para separar o que é dado vivo do que é lista/dicionário estático — pedido explícito da proprietária, motivado por frustração recorrente com "muita lista, pouco motor".

## 3. Decisões e regras confirmadas no dia

- **Pessoa Canônica:** decisão da proprietária de estender `clientes` (não criar tabela nova `pessoas_canonicas`) — migration aditiva/nullable já aplicada em produção (PR #51).
- **Contratante do contrato:** o CRM (`clientes`) é a fonte canônica de nome/documento/endereço da parte contratante; a matriz de Parâmetros do contrato só complementa o que o cadastro do cliente não tem (PR #35).
- **Perfil institucional:** o gate de vigência do perfil da contratada deve ler o registro persistido em `institutional_profiles`, não um valor fixo de código (PR #53), conforme o documento canônico `CA-Regra-Contratada-Contrato-Base-e-Parâmetros-Institucionais`.
- **Cadastro de lead durante call:** responsável/próxima ação/prazo vêm pré-preenchidos (usuária logada, "Realizar Discovery", hoje) em vez de bloquear o salvamento — a regra "nenhum lead ativo sem esses três campos" continua valendo, só deixou de exigir digitação manual no meio de uma call (PR #54).
- **Sequenciamento do trabalho de indicadores:** a proprietária determinou fazer primeiro o "Desk real hoje" (conteúdo) e o cotejo tela a tela, e só depois avaliar a implementação dos indicadores vivos — dois artefatos de indicadores enviados durante o dia foram explicitamente mantidos como referência/base, não como prompt de implementação executado agora.
- **Pré-análise de prospects (ex.: Nadia):** material de Discovery de prospects ainda não convertidas é arquivado como referência para quando os motores de varredura de WhatsApp e de call Discovery forem aplicados — não usado operacionalmente agora, nem tratado como dado que deveria ficar fora do repositório.

## 4. Achados verificados em código (evidência, não fabricação)

| Achado | Evidência | Estado |
|---|---|---|
| Gate da proposta Canva (páginas 1–7) já é real e enforced | `escopo-proposta.ts`/`gates-formalizacao.ts`: `completude_canva` exigido em `gerar_versao_final` e `solicitar_assinatura` | Confirmado, nenhuma correção necessária |
| Produtos-pai e derivados já existem no catálogo | `product_catalog.produto_pai_id` (auto-referência) + `tipo_oferta` (`produto_pai`/`complemento`/`contextual`), desde 19–22/08 | Confirmado, pré-existente à sessão |
| `produto_sku` na ficha de contrato é lista fixa de 1 item | `CAT_PRODUTO_SKU` (`parametros-catalogos.ts`) — não lê `product_catalog` | **Pendência real, ainda não corrigida** |
| CPL/CAC/ROI de mídia sem fonte real | `indicadores-marketing.ts` já retorna corretamente "sem dados suficientes" — falta `marketing_investments` | Lacuna de dado conhecida, não é bug |
| `/governanca/indicadores` é dicionário estático, não dashboard | `indicadores-governanca.ts` — arrays hardcoded, sem consulta ao banco | Correto por desenho; a confusão era de expectativa, não de código |
| Painel Hoje (`/painel`) é majoritariamente real | `painelHojeDesk`, `painel-dia.ts` — 4 de 5 cards reais, 1 declarado honestamente ausente (`sla_em_risco: null`) | Confirmado, padrão-ouro a replicar |
| `lerPerfilInstitucionalPersistido` existia sem nenhum chamador | Função órfã antes da correção desta sessão | Corrigido (PR #53) |

## 5. Pull requests abertas hoje (nenhuma mesclada)

| PR | Título | Tipo |
|---|---|---|
| #46 | Ficha piloto Giovanna Prade + arquivamento do pacote de redesenho | docs |
| #47 | Corrige leads arquivados que continuavam aparecendo na lista | fix |
| #48 | Varredura de WhatsApp: usar o sinal extraído no rascunho do lead | feat |
| #49 | Arquiva Artefato de Resgate — Skills de Inteligência, Varredura e Dossiê | docs |
| #50 | Aplica e reconcilia Decisões Canônicas de Catálogo/Planejador | docs |
| #51 | Pessoa Canônica via extensão de clientes; verificação da política unificada; de-para lead→cliente | feat + docs |
| #52 | Arquiva Artefato Mestre de Resgate e Adendo de PRs interrompidas | docs |
| #53 | Perfil institucional: gate lê status persistido, não só o valor fixo | fix |
| #54 | Reduz fricção do cadastro rápido de lead durante call | fix |
| #55 | Cotejo tela a tela (6 abas) e arquiva modelos de relatórios de jornada de vida | docs |
| #56 | Arquiva pré-análise Nadia como referência para motores de WhatsApp e Discovery | docs |

Todas em draft, `tsc`/`vitest`/`vite build` verdes, aguardando teste em preview e autorização explícita da proprietária para merge — nenhuma foi mesclada de forma autônoma.

## 6. Riscos, limites e itens fora de escopo

- Nenhuma migration nova foi aplicada hoje (a única migration do dia, extensão de `clientes`, foi decidida e aplicada antes da meia-noite, registrada na PR #51).
- Nenhum dado real foi apagado, e nenhuma ação externa (envio, cobrança, assinatura, pesquisa externa) foi executada.
- O cotejo tela a tela (PR #55) é auditoria de código, não de tela renderizada: esta sessão não teve acesso autenticado ao Desk (Supabase MCP sem autorização, sem credencial de teste) para capturar screenshots reais. A parte "visual com PDF" do pedido da proprietária **não foi cumprida** — só a parte de conteúdo/fonte de dados.
- Caso 360 completo e Pesquisa & Inteligência (Biblioteca Mestre, Bases Genealógicas) não foram traçados indicador a indicador — ficou registrado como pendência explícita no cotejo.
- `/marketing` (campanhas, conteúdo, atribuição) não foi verificado.

## 7. Dependências

- Teste manual em preview (salvar → F5 → reler) das PRs #35, #53, #54 antes de qualquer merge.
- Decisão da proprietária sobre corrigir `produto_sku` para ler `product_catalog` (achado 4, ainda pendente).
- Acesso autenticado ao Desk (credencial de teste ou Supabase MCP reautorizado) para completar a parte visual do cotejo tela a tela, se a proprietária quiser essa evidência.

## 8. Critérios de aceite deste artefato

- [x] Lista as PRs reais abertas no dia, sem inventar números ou títulos.
- [x] Separa achado verificado em código de pendência ainda não corrigida.
- [x] Registra os limites do próprio trabalho do dia (parte visual do cotejo não feita).
- [ ] Espelhado como Google Doc no Drive compartilhado (em andamento nesta mesma resposta).

## 9. Próximos passos

1. Aguardar teste manual da proprietária nas PRs listadas na seção 5.
2. Corrigir `produto_sku` para ler `product_catalog`, se autorizado.
3. Completar a parte visual (screenshots reais) do cotejo tela a tela, quando houver acesso autenticado ao Desk.
4. Retomar pente-fino completo de PRs (#30 em diante) usando o Artefato Mestre e a Auditoria, ainda represado por prioridade explícita da proprietária.

---

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
