# Mapeamento do Contrato de Dados Visuais (App Cliente)

Este documento mapeia o consumo de dados nas sete abas do Portal do Cliente, identificando tipos sanitizados, estados vazios e lacunas de consumo (canos faltando).

## 1. Menu e Navegação Oficial
- **Sete Abas Aprovadas:** Home, Jornada, Radar, Árvore, Documentos, Legado e Conta (`src/components/portal/portal-shell.tsx:70-80`).
- **Fora do Menu:** `proposta.tsx` e `faturas.tsx` não aparecem na navegação oficial (`src/components/portal/portal-shell.tsx:70-80`). Entregas, Fase 01 e Fase 02 também saíram da barra (`src/components/portal/portal-shell.tsx:57-61`).

---

## 2. Mapeamento por Aba

### 2.1. Home (`src/routes/portal/index.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.data.etapa`: `rotulo`, `posicao`, `total`, `fracao` (line 65, 182-191).
  - `vivo.data.projecoes`: Processado por `jornadaSanitizada` e `pessoasDaArvore` (line 73, 83).
  - `vivo.data.proximaAcao`: Usado para definir o próximo passo (line 76).
  - `vivo.data.solicitacoes`: `titulo` (dos 3 primeiros pedidos) (line 84).
- **Estados Vazios:**
  - "Assim que houver um próximo passo compartilhado com sua família, você o verá aqui." (line 157).
  - "A história da sua família terá seu lugar aqui..." (line 372).
  - "Quando novos vínculos estiverem confirmados, eles aparecerão na sua Árvore." (line 421).
  - "Por enquanto, não precisamos de nenhum documento seu." (line 433).
- **Lacunas (Canos Faltando):**
  - **Percentual de Progresso:** O percentual (ex: 65%) é derivado da posição nas 8 fases canônicas, não de um score de progresso real/dinâmico (line 238-240).
  - **Próxima Entrega:** Consome `proximaEntrega` se presente, mas é apenas um texto sanitizado (`src/lib/portal-dados-vivos.ts:385`).

### 2.2. Jornada (`src/routes/portal/jornada.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.projecoes`: Processado via `jornadaSanitizada` (line 330).
  - `vivo.proximaAcao`: `destino`, `acao` (line 334).
  - `vivo.etapa`: `posicao` (line 352).
  - `vivo.historico`: `texto`, `data` (line 368-380).
- **Estados Vazios:**
  - "Estamos preparando os primeiros passos..." (line 337).
  - "As histórias das gerações anteriores aparecerão aqui..." (line 220).
  - "Os próximos passos aparecerão aqui..." (line 221).
  - "Os encontros da história da família aparecerão aqui..." (line 282).
- **Lacunas (Canos Faltando):**
  - **União de Ramos:** Depende de projeções explícitas do tipo `uniao_ramos` com IDs de vínculo preenchidos (line 404-413).
  - **Divergência de Stepper:** O stepper visual usa 8 fases, enquanto mockups pediam 4 ou 5 (line 134-139).

### 2.3. Radar (`src/routes/portal/radar.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.projecoes`, `vivo.documentos`, `vivo.pessoasMapeadas`: Alimentam `radarSeisDimensoes` (line 73-79).
  - `vivo.proximaAcao`: `conteudo` (line 80).
- **Estados Vazios:**
  - "Ainda não há um próximo passo liberado para a família." (line 92).
  - Eixos mostram "Em preparação" ou "Nenhum ainda" na ausência de dados (line 102-103).
- **Lacunas (Canos Faltando):**
  - **Eixo Estratégia:** Permanece fixo em "in_preparation" sem fonte autorizada (`src/lib/portal-dados-vivos.ts:187`).
  - **Score Real:** O percentual é baseado em contagem de publicações, não em um cálculo de saúde ou elegibilidade real.

### 2.4. Árvore (`src/routes/portal/arvore.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.projecoes`: Processado via `pessoasDaArvore` (line 127) e `arvoreSanitizada` (line 129).
  - `painel.estadoSlotAnonimo`: Define se o slot vazio é "Em pesquisa" ou "A publicar" (line 130).
- **Estados Vazios:**
  - "Esta árvore ainda não tem nomes e vínculos liberados..." (line 153).
  - "Nenhum nome liberado para esta árvore até agora." (line 209).
  - "A próxima ligação da família aparecerá aqui quando estiver confirmada e liberada." (line 235).
- **Lacunas (Canos Faltando):**
  - **Relações de Parentesco:** A estrutura visual não inventa quem é filho de quem; mostra leques genéricos entre gerações (line 19-23).
  - **Gerações G6-G10:** Slots aparecem, mas dependem de projeções com `geracao_cliente` correto.

### 2.5. Documentos (`src/routes/portal/documentos.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.data.documentos`: `liberado_cliente`, `origem`, `statusRotulo`, `titulo`, `enviadoEm`, `motivo` (line 162-325).
  - `vivo.data.solicitacoes`: `id`, `titulo`, `descricao`, `prazo`, `recusado`, `motivoRecusa` (line 185).
- **Estados Vazios:**
  - "Por enquanto, não precisamos de nenhum documento seu." (line 236).
  - "Quando você compartilhar um documento, poderá acompanhá-lo aqui." (line 260).
  - `COPY_TELAS.documentos.vazio` para liberados (line 300).
- **Lacunas (Canos Faltando):**
  - **Checklist Completo:** Não há fonte para a lista completa de documentos do checklist; apenas pedidos abertos aparecem (line 59).
  - **Materiais Editoriais:** A aba Documentos não tem fonte própria para materiais do Legado; usa um atalho (line 333).

### 2.6. Legado (`src/routes/portal/legado.tsx`)
- **Projeções e Campos Consumidos:**
  - `vivo.projecoes`: Processado via `legadoSanitizado` e `publicacoesDeEntrega` (line 55-56).
  - `vivo.proximaAcao`: `acao` (line 91).
- **Estados Vazios:**
  - "Os cadernos da família aparecerão aqui..." (line 125).
  - "Nenhum dossiê ou relatório foi liberado..." (line 127).
  - "As narrativas de origem aparecerão aqui..." (line 128).
- **Lacunas (Canos Faltando):**
  - **Memória:** A prateleira de Memória é filtrada/agrupada em Narrativas (line 98-101).

### 2.7. Conta (`src/routes/portal/conta.tsx`)
- **Projeções e Campos Consumidos:**
  - `data.cliente`: `nome`, `pais_interesse` (line 45-46).
  - `vivo.data.projecoes`: Processado via `planoPublicado`, `assinaturaPublicada`, `upsellsPublicados` (line 61-70).
  - `vivo.data.historico`: `texto`, `data` (line 262-280).
  - `vivo.data.proximaAcao`: `destino`, `acao` (line 82-87).
  - `projection_type === "atualizacao"`: Conteúdo sanitizado (line 79).
- **Estados Vazios:**
  - "Aguardando novidades da equipe." (line 47).
  - "Nenhum recado novo por enquanto." (line 243).
  - "Ainda não há um marco da jornada liberado..." (line 264).
  - "Ainda não há conversas disponíveis neste espaço." (line 287).
- **Lacunas (Canos Faltando):**
  - **Financeiro Detalhado:** Preço e parcela são recusados no servidor; apenas valor total da assinatura aparece (line 59, 68).
  - **Contatos e Privacidade:** Canais de contato e preferências de privacidade são declarados como "ainda não disponíveis" (line 143).
