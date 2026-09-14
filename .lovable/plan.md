# Piloto integral Ana Luiza — ambiente novo e cadeia completa

## Situação encontrada

Existem hoje dois bancos:

- **Legado (consulta):** o banco antigo declarado no repositório. Fica intocado — nada é migrado, apagado ou sobrescrito.
- **Ambiente do Lovable (novo):** já existe, separado do antigo, com a estrutura completa do Clube Ancestral, sua conta de proprietária já criada e o caso canônico `CA-CID-AT-FAM-2026-001` da Ana Luiza. É este que vira o ambiente do piloto.

Hoje o aplicativo aponta para o banco antigo. É por isso que a prévia pedia login e não abria: a sessão e os dados estavam em lugares diferentes. Primeira providência do plano: apontar o aplicativo para o ambiente novo.

O ambiente novo tem 4 casos, sendo 1 da Ana e 3 marcados como demo/teste. Eles **não** são apagados: ficam fora do shell de go-live, como já acontece hoje.

## O que será feito

### 1. Trocar o endereço do ambiente
Apontar aplicativo e configuração para o ambiente novo, numa só mudança deliberada (arquivo de configuração pública + configuração do projeto). Login da proprietária passa a funcionar na prévia.

### 2. Fechar os canos que faltam na cadeia
A cadeia hoje é só leitura em vários pontos. Entram gravações reais, sempre com confirmação humana:

| Etapa | O que passa a existir |
|---|---|
| Lead → Discovery → Call | registrar lead, registrar discovery e registrar call ligados à mesma pessoa |
| Proposta Canva | link, versão, data, escopo, partes, entregas e condição comercial digitados à mão (sem integração com o Canva) |
| Escopo | itens de escopo da proposta |
| Pessoa / Núcleo | pessoa canônica: e-mail igual reaproveita; telefone igual pede confirmação; só nome cria nova; nunca funde sozinho |
| Caso | criação do caso a partir da proposta aceita |
| Contrato / Anexos / OS | registro do contrato, anexos e ordem de serviço, sem assinatura automática |
| Onboarding D0–D14 | plano de onboarding com marcos e responsável |
| Pesquisa → Fonte → Evidência → Achado | encadeamento já existente, com gravação ponta a ponta |
| Árvore | relação familiar só nasce de evidência ou decisão humana registrada |
| Financeiro | valor, condição, fatura e pagamento manuais |
| Microentrega → Revisão → Publicação | publicar e despublicar com autor e data; despublicar não apaga histórico |
| Convite | link mágico para a Ana, disparado por ação humana |

Nada de cobrança, assinatura, WhatsApp ou e-mail automáticos. Sem catálogo/SKU como etapa obrigatória.

### 3. Completar as superfícies
- **Desk:** 11 contextos da prancha v3 (Hoje, Comercial, Kanban, Caso 360, Pessoa 360, Radar, Pesquisa, Financeiro, Jurídico, Pessoas, Portal/Configuração Master), cada um com o gráfico e o indicador previstos.
- **App Cliente:** 7 abas (Home, Jornada, Radar, Árvore, Documentos, Legado, Conta), só com conteúdo publicado e sanitizado.
- Mobile-first: sem launcher flutuante, sem rolagem horizontal, sem lista infinita; vazio usa o estado da prancha com um CTA real.

### 4. Executar o piloto e provar
Rodar a jornada inteira da Ana Luiza no ambiente novo, gravando de verdade, e entregar um roteiro com evidência de cada etapa: criar → salvar → recarregar → confirmar. Ao final, entrar como cliente por link mágico e percorrer as 7 abas sem ver dado interno.

### 5. Entrega
Uma única URL de prévia + o roteiro de execução com as evidências. Paro para sua aprovação. Sem publicação de produção, sem Vercel, sem integração externa.

## Fora de escopo
Migrar dados do banco antigo; apagar qualquer coisa; conectar Vercel; Canva por API; qualquer envio automático; dados de demo/QA/teste para preencher tela.

## Detalhes técnicos
- Repontar `src/lib/config-publica.ts` (`PROJETO_DECLARADO`) e `supabase/config.toml` juntos; validar que as 182 migrations do repositório estão aplicadas no ambiente novo e aplicar o que faltar.
- Escritores novos como `createServerFn` em `*.functions.ts` com `requireSupabaseAuth`, reaproveitando entidades canônicas (`leads`, `crm_interactions`, `proposals`, `contract_*`, `service_orders`, `case_plans`, `research_*`, `evidences`, `invoices`, `payments`, `client_deliverables`, `app_projections`, `client_portal_access`). Sem tabela paralela.
- RLS por `organization_id` preservada; publicação sanitizada via `app_projections`; auditoria em `audit_logs`.
