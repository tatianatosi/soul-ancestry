# Plano de migração, versionamento e stack brasileiro após o piloto Ana

**Projeto:** Clube Ancestral  
**Versão:** v1.0  
**Data:** 20 de agosto de 2026  
**Status:** Decisão de sequência e orçamento pós-piloto  
**Pré-condição:** concluir a rodada Ana e os prompts Lovable aprovados, sem abrir novas frentes fora do corte definido.

---

## 1. Decisão central

A sequência oficial é:

```text
Concluir Ana no Lovable
→ validar jornada real e contrato pronto para assinatura
→ congelar escopo Lovable
→ inventariar, documentar e versionar o estado real
→ migrar código para GitHub e Claude Code
→ implantar stack brasileira na Servla
→ publicar o App Cliente no domínio definitivo
→ operar e evoluir por código versionado
```

O Lovable não será o ambiente permanente de desenvolvimento. Ele permanece apenas como ferramenta de acabamento visual e fluxo enquanto os itens estritamente necessários ao piloto Ana não estiverem validados.

Após a aprovação do piloto Ana, toda alteração de regra, banco, RLS, Auth, Storage, migração, segurança, testes, integração, publicação ou regressão passa a ser feita prioritariamente via Claude Code e GitHub.

---

## 2. Corte final Lovable

### Objetivo de saída

A rodada Lovable está concluída somente quando o caso `CA-CID-AT-FAM-2026-001` puder ser usado como piloto interno ponta a ponta e o contrato estiver **pronto para assinatura**, sem inventar dados, liberar gates ou executar ações externas indevidas.

### Escopo permitido

| Ordem | Bloco | Resultado exigido |
|---:|---|---|
| 1 | Navegação mobile | Financeiro, Formalização, Pesquisa e Biblioteca acessíveis em mobile; nenhuma aba/rota desaparece |
| 2 | Ficha Piloto Genealógica mínima | Pessoas, relações, linhagens, variantes, árvore e timeline com persistência |
| 3 | Evidências e solicitações mínimas | Pessoa → solicitação → fonte/evidência → validação → pendência/próxima ação |
| 4 | Relatórios F1/F2 | Relatórios existentes conectados ao caso; sem duplicação |
| 5 | Proposta Canva e formalização Ana | Escopo e bloqueios visíveis; contrato somente pronto após gates atendidos |
| 6 | Jornada e onboarding da Ana | Checklist, dossiê, acesso e primeira entrega planejados, sem automação externa não autorizada |
| 7 | Pente-fino de go-live | Smoke test desktop/mobile; permissões, persistência, isolamento de caso e regressões críticas |

### Fora do corte Lovable

- Novas integrações externas.
- Scraping, API de fontes ou pesquisa externa automatizada.
- WhatsApp automático.
- Cobrança, assinatura, pasta ou documento externo sem autorização específica.
- Assistente AI/Gems em produção.
- Placego além de planejamento de importação.
- Painéis avançados de CAC, ROI, marketing e mídia.
- Redesenho das 14 abas originais.

### Controle de crédito

- Alvo de consumo residual Lovable: **650–1.100 créditos**.
- Stop-loss por bloco: interromper se 300 créditos forem consumidos sem um resultado funcional fechado e testado.
- Teto absoluto: **1.100 créditos**, salvo nova decisão explícita.
- Todo prompt deve usar ID, escopo fechado, critérios de aceite, crédito gasto e resultado registrado.

---

## 3. Gate de migração

A migração técnica começa após todos os itens abaixo estarem comprovados:

### Piloto Ana

- [ ] Caso canônico, família, participantes e dependente persistem corretamente.
- [ ] Proposta Canva tem referência interna, páginas estruturadas e bloqueios explícitos quando faltarem campos.
- [ ] Preço/case service/condição obedecem à cadeia normativa.
- [ ] Formalização mantém bloqueios de cadastro, dependentes, escopo, revisão jurídica e proposta.
- [ ] Contrato está pronto para assinatura somente quando os gates aplicáveis estiverem satisfeitos.
- [ ] Nenhuma tela expõe dados de outro caso, família ou participante.
- [ ] Desktop e mobile percorrem as rotas críticas sem bloqueio de navegação.
- [ ] App Cliente mostra exclusivamente conteúdo sanitizado e aprovado.
- [ ] Smoke test independente foi concluído.

### Artefatos obrigatórios

- [ ] Inventário de rotas, componentes e entidades ativas.
- [ ] Export/registro de schema, migrations, RLS, buckets, Auth e variáveis de ambiente.
- [ ] Lista de dados reais, legados, fixtures e itens em revisão.
- [ ] Registro de decisões normativas vigentes.
- [ ] Mapa de dependências Lovable/Supabase/integrações.
- [ ] Backup verificável antes de qualquer corte de produção.

---

## 4. Documentação GitHub

Antes de mover a produção, criar no repositório canônico os documentos abaixo. Cada documento deve usar versão semântica, data, proprietário, status e histórico de alteração.

| Caminho proposto | Finalidade |
|---|---|
| `docs/governanca/REGISTRO_MESTRE_DECISOES_v1.0.md` | Índice de todas as decisões normativas e seus identificadores |
| `docs/governanca/ARQUITETURA_CANONICA_DESK_APP_v1.0.md` | Fronteiras entre Desk, App Cliente, Biblioteca, fontes, integrações e projeções |
| `docs/governanca/ABAS_DESK_ORIGINAL_E_INCORPORACOES_v1.0.md` | Arquitetura das 14 abas originais e incorporações permitidas |
| `docs/governanca/CADEIAS_CANONICAS_PRECO_E_CASO_v1.0.md` | Cadeia de preço e cadeia de evolução de caso |
| `docs/governanca/GLOSSARIO_DICIONARIOS_E_GUIA_LINGUAGEM_v1.0.md` | Dicionários, termos proibidos e linguagem aprovada |
| `docs/governanca/FICHA_PILOTO_GENEALOGICA_E_ARVORES_v1.1.md` | Pessoas, relações, linhagens, evidências, árvore e timeline |
| `docs/governanca/BIBLIOTECA_EVIDENCIAS_E_PROJECOES_v1.0.md` | Fonte → evidência → validação → projeção autorizada |
| `docs/governanca/CATALOGO_FONTES_GENEALOGICAS_5B_PRE_v1.0.md` | Catálogo de fontes, modos de uso, maturidade e backlog |
| `docs/governanca/PLANO_PILOTO_ANA_E_GO_LIVE_v1.0.md` | Estado, gates, aceite e smoke test da Ana |
| `docs/migracao/INVENTARIO_TECNICO_ORIGEM_v1.0.md` | Estado real de código, rotas, banco, integrações e ambiente de origem |
| `docs/migracao/PLANO_MIGRACAO_SERVLA_BRASIL_v1.0.md` | Fases, rollback, dados, DNS, segurança e validação da mudança |
| `docs/operacao/RUNBOOK_PRODUCAO_E_BACKUP_v1.0.md` | Deploy, monitoramento, backup, restauração e incidentes |
| `docs/operacao/REGISTRO_RELEASES.md` | Histórico de deploys, migrations, rollback e validações |
| `docs/seguranca/MATRIZ_RLS_E_PERMISSOES_v1.0.md` | Papéis, RLS, visibilidade e acessos por entidade |
| `docs/seguranca/INVENTARIO_DADOS_E_RETENCAO_v1.0.md` | Dados pessoais, documentos, origem, retenção, backups e descarte |

---

## 5. Prompts de migração

Os prompts abaixo são para Claude Code, executados no repositório GitHub clonado localmente. Eles não autorizam deploy, alteração de DNS ou exclusão de dados sem confirmação humana posterior.

### M-01 — Inventário técnico e baseline

```text
Você está no repositório canônico do Clube Ancestral.

Objetivo: produzir inventário técnico somente de leitura, sem alterar código, banco, variáveis, dados, DNS ou infraestrutura.

Mapeie:
- estrutura de diretórios;
- package manager, scripts e versões;
- rotas e layouts;
- componentes, hooks e src/data;
- clientes Supabase, Auth, Storage, Edge Functions e integrações;
- migrations, schema e políticas RLS presentes no repositório;
- variáveis de ambiente referenciadas, sem revelar valores;
- dependências de Lovable, Vercel, Supabase, Canva, Asaas, Drive, Meta Agent e Placego;
- testes existentes e comandos de execução;
- itens que aparentam mock, fixture ou dado de demonstração.

Entregue em `docs/migracao/INVENTARIO_TECNICO_ORIGEM_v1.0.md`.
Não alterar arquivos existentes fora desse documento. Não executar deploy, migration ou consulta de produção.
```

### M-02 — Estrutura de documentação e decisões

```text
Objetivo: criar somente a estrutura versionada de documentação e o registro mestre de decisões.

Use os documentos previstos em `PLANO_MIGRACAO_E_STACK_BRASIL_APOS_PILOTO_ANA_v1.0.md` como lista de referência.

Regras:
- Não alterar aplicação, migrations, RLS, dados ou infraestrutura.
- Não inventar decisões; registrar como "a confirmar" quando não houver evidência.
- Cada documento deve ter versão, data, status, proprietário, fontes internas e changelog.
- Criar links internos entre documentos de decisão, arquitetura, segurança e operação.

Entregue uma única branch e um único commit de documentação.
```

### M-03 — Repositório, CI e ambiente local

```text
Objetivo: preparar o repositório para desenvolvimento reproduzível.

Sem tocar em produção:
- criar `.env.example` somente com nomes de variáveis, sem segredos;
- documentar bootstrap local;
- validar typecheck, lint e testes existentes;
- criar workflow CI para lint, typecheck e testes em pull request;
- configurar convenções de branch e pull request em documentação;
- criar checklist de revisão para migrations, RLS e conteúdo cliente-facing.

Não alterar dados, não executar migrations em produção e não fazer deploy.
Entregue alterações em branch separada, com relatório dos comandos executados e resultados.
```

### M-04 — Auditoria de Supabase e plano de portabilidade

```text
Objetivo: produzir plano técnico de portabilidade do Supabase Cloud para infraestrutura brasileira, sem migrar nada ainda.

Mapeie, por ambiente:
- schema e migrations;
- extensões Postgres;
- RLS e funções;
- Auth e URLs de redirect/Magic Link;
- Storage buckets, políticas, volumes e classificação de documentos;
- Edge Functions, cron, webhooks e integrações;
- dados de produção, fixtures, legados e origem de cada grupo;
- tamanho estimado de banco e Storage;
- dependências que impedem self-hosting imediato.

Proponha três alternativas:
1. manter Supabase Cloud;
2. Supabase self-hosted na Servla;
3. Postgres + Auth.js/Keycloak + MinIO na Servla.

Avalie risco, esforço, backup, rollback, e-mail transacional, RLS e compatibilidade com o código atual.

Documente em `docs/migracao/PLANO_PORTABILIDADE_SUPABASE_v1.0.md`.
Não executar export, migration, deploy ou alteração de DNS.
```

### M-05 — Infraestrutura Servla como homologação

```text
Objetivo: preparar Infrastructure as Code e documentação para ambiente de homologação na Servla Brasil.

Criar arquivos de infraestrutura sem aplicar:
- Docker Compose ou configuração Coolify para app, reverse proxy, Postgres/Supabase quando aplicável, Storage compatível e monitoramento;
- health checks;
- volumes persistentes;
- variáveis de ambiente documentadas;
- política de backup criptografado externo;
- procedimento de restauração;
- configuração de staging sem dados pessoais reais;
- estratégia de logs sem segredos e sem conteúdo sensível.

Não provisionar VPS, não subir containers, não gerar credenciais, não importar dados e não apontar domínio.
Entregue em branch separada com `docs/operacao/RUNBOOK_PRODUCAO_E_BACKUP_v1.0.md`.
```

### M-06 — Migração de dados e validação

```text
Objetivo: criar scripts idempotentes e testes de migração, sem executar em produção.

Preparar:
- export lógico do Postgres;
- inventário de Storage por bucket e checksum;
- mapeamento de usuários/Auth, casos, famílias, pessoas, propostas, evidências, documentos e projeções;
- exclusão de fixtures do conjunto de produção;
- reconciliação de contagens antes/depois;
- testes RLS para Tatiana, cliente, participante familiar, colaborador e sem sessão;
- validação de Magic Link em domínio de staging;
- plano de rollback.

Não executar a migração, não apagar dados e não alterar o domínio.
Documentar em `docs/migracao/PLANO_MIGRACAO_DADOS_E_ROLLBACK_v1.0.md`.
```

### M-07 — Release candidata e corte de domínio

```text
Objetivo: preparar checklist de release candidata para `app.clubeancestral.com.br`, sem alterar DNS ou produção.

Incluir:
- validação de build;
- variáveis de ambiente;
- HTTPS;
- URLs de redirect do Magic Link;
- e-mail transacional;
- RLS e Storage;
- smoke test Ana;
- performance mobile;
- backup confirmado;
- rollback;
- observabilidade;
- aprovação final de Tatiana.

Criar `docs/operacao/CHECKLIST_RELEASE_APP_CLIENTE_v1.0.md`.
Não apontar DNS, não enviar Magic Links reais e não promover ambiente.
```

---

## 6. Stack final recomendado

### Objetivo

Hospedar a aplicação e os dados operacionais em infraestrutura brasileira após a migração, preservando o domínio do Clube Ancestral e reduzindo dependência do Lovable, Vercel e Supabase Cloud.

### Stack alvo

```text
Domínio
clubeancestral.com.br
├── app.clubeancestral.com.br → App Cliente e área autenticada
├── desk.clubeancestral.com.br → Desk interno, se separado
└── staging.clubeancestral.com.br → homologação

Servla Brasil
├── VPS 4 GB RAM / 2 vCPU mínimo inicial
├── Coolify ou Docker Compose
├── Next.js / aplicação web
├── Postgres (ou Supabase self-hosted, após validação)
├── Auth compatível com Magic Link
├── Storage S3 compatível / MinIO ou Supabase Storage self-hosted
├── Reverse proxy + TLS
├── Monitoramento e logs sanitizados
└── Backup criptografado externo

GitHub
├── Repositório canônico
├── Branches, Pull Requests, CI
├── Registro de releases
└── Documentação e decisões

Claude Code
├── Implementação técnica
├── Migrations e RLS
├── Testes e refactors
└── Infraestrutura como código
```

### Recomendação sobre Supabase e Vercel após migração

| Serviço | Antes da migração | Depois da migração brasileira | Decisão |
|---|---|---|---|
| Lovable | Acabamento do piloto Ana | Não é dependência operacional | Manter apenas para exceções visuais |
| GitHub | Versionamento inicial | Repositório canônico obrigatório | Manter |
| Claude Code | Migração e desenvolvimento | Desenvolvimento padrão | Manter |
| Vercel | Pode ser usado para staging/ponte | Não é necessário se app estiver hospedado na Servla | Desligar após corte validado, se não houver necessidade específica |
| Supabase Cloud | Pode ser usado para piloto e transição | Não é necessário se Postgres/Auth/Storage/Supabase self-hosted estiver validado | Desligar somente após migração, backup e rollback testados |
| Servla | Homologação primeiro | Produção brasileira | Manter |

**Importante:** não desligar Vercel nem Supabase Cloud no dia do corte. Manter ambos por pelo menos um ciclo de estabilização e rollback, sem receber novos dados de produção após a virada, conforme decisão operacional futura.

---

## 7. Comparativo de custos

Valores aproximados para planejamento em 20/08/2026. Conversão de referência: US$ 1 = R$ 5,50. Valores não incluem IOF, spread, impostos, domínio já adquirido, e-mail transacional, backup externo nem horas de operação humana.

| Cenário | Lovable | Claude Code | Vercel | Supabase | Servla | Infra/serviços adicionais | Total mensal estimado | Indicação |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Desenvolvimento/piloto interno | Uso do saldo | R$ 110–330 | R$ 0 | R$ 0 | R$ 0 | R$ 0–50 | R$ 110–380 | Enquanto Ana ainda não recebe acesso real |
| Produção gerenciada temporária | Residual | R$ 110–330 | ~R$ 110 | ~R$ 138 | R$ 0 | R$ 30–80 | R$ 388–658 | App comercial no Vercel + Supabase Pro |
| Servla híbrida | Residual | R$ 110–330 | R$ 0–110 | ~R$ 138 | R$ 88–110 | R$ 50–120 | R$ 386–808 | Servla para homologação, backup, jobs e ferramentas internas |
| Produção brasileira self-hosted | Residual | R$ 110–330 | R$ 0 | R$ 0 | R$ 88–160 | R$ 80–200 | R$ 278–690 | Após migração validada; inclui backup/e-mail/monitoramento estimados |

### Componentes do custo brasileiro

| Item | Faixa mensal estimada | Observação |
|---|---:|---|
| VPS Servla mínima de produção | R$ 88–160 | Recomendado mínimo de 4 GB RAM / 2 vCPU para app + banco/Auth/Storage; confirmar plano vigente antes de contratar |
| Backup externo criptografado | R$ 20–80 | Necessário; não depender somente do disco da VPS |
| E-mail transacional para Magic Link | R$ 0–80 | Pode iniciar em faixa gratuita, mas precisa de reputação e domínio configurado |
| Monitoramento/uptime | R$ 0–40 | Pode iniciar com camada gratuita; alertas são obrigatórios |
| DNS/SSL | R$ 0–30 | SSL via proxy/reverse proxy; domínio já existente |
| Claude Code | R$ 110–330 | Principal custo de desenvolvimento técnico inicial |
| Lovable | Variável, não recorrente | Encerrar uso amplo após a Ana |

### Decisão de custo

- A stack brasileira pode custar **menos que Vercel Pro + Supabase Pro** quando o uso ainda é baixo, mas a economia só existe se houver operação disciplinada de backup, segurança e monitoramento.
- Não considerar uma VPS barata como substituta completa de plataforma gerenciada sem precificar backup, e-mail, logs, atualização e recuperação.
- Claude Code é custo de desenvolvimento, não custo de hospedagem; sua despesa pode cair após a estabilização, mas deve existir reserva para correções e evoluções.

---

## 8. Checklist de corte para Servla

### Antes de contratar/ativar produção

- [ ] Código canônico no GitHub.
- [ ] Inventário técnico aprovado.
- [ ] Migrations reproduzíveis em ambiente limpo.
- [ ] RLS e permissões testadas.
- [ ] Variáveis e segredos fora do repositório.
- [ ] Backup lógico do banco testado.
- [ ] Inventário e backup do Storage com checksum.
- [ ] Política de retenção e descarte aprovada.
- [ ] E-mail transacional de Magic Link configurado em staging.
- [ ] Logs sanitizados e monitoramento ativos.
- [ ] Plano de rollback aprovado.

### Antes de apontar domínio

- [ ] Staging funcional na Servla.
- [ ] `staging.clubeancestral.com.br` testado.
- [ ] URLs autorizadas de Auth/Magic Link configuradas.
- [ ] Teste de login, logout, recuperação de sessão e links expirados.
- [ ] RLS testada com perfis internos e cliente.
- [ ] Upload/download de documento autorizado testado.
- [ ] Smoke test Ana concluído.
- [ ] Mobile e desktop validados.
- [ ] Backup e restauração testados.
- [ ] Release candidata aprovada por Tatiana.

### Corte e estabilização

- [ ] DNS de `app.clubeancestral.com.br` apontado para produção Servla.
- [ ] Monitoramento confirma HTTPS, app e banco.
- [ ] Nenhum Magic Link real é enviado antes de confirmação do domínio.
- [ ] Vercel/Supabase Cloud mantidos como rollback durante período definido.
- [ ] Dados novos passam a ser aceitos apenas no ambiente de produção escolhido.
- [ ] Registro da release e decisão de corte publicado no GitHub.

---

## 9. Registro de decisão

| Data | Decisão | Consequência |
|---|---|---|
| 20/08/2026 | Concluir Ana e prompts Lovable antes de migrar | Não abrir novas frentes de infraestrutura antes do piloto estável |
| 20/08/2026 | Migrar implementação para Claude Code e GitHub após piloto | Código, testes, migrations e infraestrutura passam a ser versionados |
| 20/08/2026 | Hospedar produção futura em infraestrutura brasileira | Servla será preparada primeiro em homologação e só depois promovida |
| 20/08/2026 | Vercel/Supabase são plataformas de transição, não destino obrigatório | Podem ser desligados após migração validada e rollback expirado |
| 20/08/2026 | Manter Magic Link no domínio final | Cliente deve acessar `app.clubeancestral.com.br`, não domínio temporário |
