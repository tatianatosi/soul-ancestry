# Bloco 5C — Arquitetura de Projeções do App Cliente, Esteira Progressiva e Fronteira de Sanitização
## Clube Ancestral · Ancestral Canvas

Status: aprovado
Versão: v1.0 (Canônica - Projeção App Cliente)
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: Instrução da Proprietária de 10/10/2026; Bloco 5A v2.0; Bloco 5B v1.0; Pranchas Visuais Desk v4 e App Cliente (7 telas); Mapa de Componentes e Rotas (05-mapa-componentes-e-rotas.md).
Escopo: Camada de Projeção Pública Sanitizada, desacoplamento Desk ↔ App, regras de renderização das 7 telas canônicas e blindagem contra vazamento de metadados internos.

---

## 1. Princípio Fundamental de Fronteira

```
[ RETAGUARDA: DESK INTELLIGENCE (11 SUPERFÍCIES) ]
  • Dados brutos de pesquisa (research_evidence_items, fontes M1-M6, notas)
  • Regras operacionais de formalização e contratos
  • Histórico completo de auditoria (audit_logs, case_timeline_events)
  • Pessoas e Casos restritos / internos
                           │
                           ▼  [ FILTRO DE HIGIENIZAÇÃO E APROVAÇÃO HUMANA ]
                           │  • Exige client_visibility = 'aprovada'
                           │  • Exige conteudo_aprovado = true
                           │  • Remove tokens, URLs internas, scores algorítmicos e PII sensível
                           ▼
[ FRONTEIRA: PROJEÇÕES SEGURAS (portal_projecoes / portal_casos) ]
                           │
                           ▼
[ CLIENTE: APP CLIENTE NATIVO (7 TELAS CANÔNICAS) ]
  1. Home       2. Jornada     3. Radar       4. Árvore
  5. Documentos 6. Legado      7. Conta
```

**Regra de Ouro:** O App Cliente nunca se conecta diretamente a tabelas brutas de pesquisa, fontes ou CRM. Toda leitura do cliente é feita via views de segurança (`security_barrier = true`) alimentadas estritamente por projeções aprovadas.

---

## 2. Especificação Canônica das 7 Telas do App Cliente

### 1. Home (`/portal`)
- **Componentes**: `AppTopbar`, `CaseHealthHero`, `NextActionCard`, `MicrodeliveryCard`.
- **Conteúdo**: Saudação acolhedora com nome civil da titular (Ana Luiza), resumo de progresso em linguagem simples e o cartão "Próximo Passo Recomendado".
- **Blindagem**: Nunca exibe pessoas publicadas como "achados", nem exibe IDs ou códigos internos de caso.

### 2. Jornada (`/portal/jornada`)
- **Componentes**: `JourneyStepper`, `TimelineVertical`, `TimelineEvent`.
- **Conteúdo**: Linha do tempo sequencial dos marcos civis e documentais alcançados (coleta, pesquisa, análise jurídica, formalização).
- **Blindagem**: Exibe apenas acontecimentos históricos e documentais validados; pessoas da família nunca entram como nós de eventos na jornada.

### 3. Radar (`/portal/radar`)
- **Componente**: `ClienteRadarSeisDimensoes`.
- **Conteúdo**: Gráfico visual do progresso de comprovação nas 6 dimensões públicas (Conexões Familiares, Documentação Civil, Linha de Transmissão, Territorialidade, Legado e Prontidão).
- **Cálculo Canônico**: Conexões Familiares usa como denominador o total real de pessoas mapeadas do caso (nunca o teto fixo de 31 pessoas).
- **Blindagem**: Nunca exibe percentuais algorítmicos de probabilidade jurídica nem vereditos de aprovação de consulado.

### 4. Árvore da Vida Dinâmica (`/portal/arvore`)
- **Componentes**: `FamilyTree`, `FamilyNode`, `FamilyConnector`.
- **Conteúdo**: Genograma interativo exibindo até 10 gerações (G1 a G10) de antepassados e membros vivos da família.
- **Regra de Visibilidade**: Apenas nós com `client_visibility = 'aprovada'` são renderizados (ascendentes da Ana: Cleusa G3, Ana Maria G4, Lotte e Otto G5, Rudolf G6 e Heinrich G7 já aprovados).
- **Blindagem**: Menores de idade aparecem apenas pelo primeiro nome; parentes com restrição de sensibilidade não são projetados.

### 5. Documentos (`/portal/documentos`)
- **Componentes**: `EvidenceCard`, `EmptyState`.
- **Conteúdo**: Lista de certidões, registros civis e paroquiais localizados e conferidos.
- **Estados Visíveis**: "Recebido" ou "Validado por documento".
- **Blindagem**: Não expõe links brutos de download sem permissão, nem arquivos notariais com anotações de trabalho interno.

### 6. Legado (`/portal/legado`)
- **Componentes**: `LegacyHero`, `ContentShelf`, `NarrativaCard`, `CadernoEncontrosLinhagem`.
- **Conteúdo**: Caderno de Encontros de Linhagem alimentado por `lineage_encounters` (rotas migratórias Áustria → Brasil, casamento Silveira em 1912, práticas culturais e memórias familiares consentidas).
- **Disclaimer Obrigatório**: *"Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico."*
- **Blindagem**: Terminantemente proibida qualquer linguagem de constelação familiar ou promessas de cura ancestral.

### 7. Conta (`/portal/conta`)
- **Componentes**: `Card`, `Field`, `Table`.
- **Conteúdo**: Dados cadastrais básicos da titular, e-mail de acesso e detalhes da assinatura ativa familiar (R$ 320/mês).
- **Blindagem**: Estado vazio elegante quando não há faturas pendentes; nunca exibe seções de upsell ou ofertas comerciais internas no App da Ana.

---

## 3. Gestão de Acessos Familiares Sem Senha (`/acesso`)

- **Autenticação**: Link mágico seguro de uso único (`solicitarLinkAcesso`), enviado diretamente para os e-mails autorizados em `authorized_portal_emails`.
- **Isolamento Multiusuário da Família**:
  - Ana Luiza (Titular / Contratante)
  - Adair Pinto Silveira Júnior (Co-contratante)
  - Alice Gomes Silveira (Co-contratante)
  - Felipe (Dependente menor — representado por Ana Luiza, sem login independente)
- **Segurança de Acesso**: A tentativa de login com e-mail não cadastrado sempre responde positivamente com mensagem neutra ("Se o e-mail estiver cadastrado, você receberá o link"), impedindo enumeração maliciosa de usuários.

---

## 4. Critérios de Aceite da Projeção

1. Toda informação projetada no App possui origem auditável e revisão humana aprovada pela proprietária no Desk.
2. O App Cliente adota a paleta e os estilos exclusivos de apresentação (`portal-v11.css`), sem herdar regras do Desk nem quebrar os tokens do SaasShell.
3. A navegação entre as 7 abas opera com carregamento limpo, estados vazios explícitos e sem mensagens de erro técnicas expostas ao cliente.
