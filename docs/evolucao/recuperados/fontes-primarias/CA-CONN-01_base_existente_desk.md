# CA-CONN-01 — Conectar a base existente ao Desk Intelligence

> **Copie e cole todo o conteúdo abaixo no Lovable, dentro do projeto existente `Ancestral Canvas`.**
>
> **Instrução crítica:** esta é uma evolução incremental do projeto existente. Antes de alterar qualquer tela, faça uma leitura do código e dos componentes atuais. **Não deletar, substituir, renomear ou recriar telas, rotas, componentes, dados de demonstração, cards, estilos, integrações ou módulos já existentes.** Preserve especialmente o App Cliente, Desk Intelligence, Home, Jornada, Radar, Documentos, Legado, Conta, Relatório Visual, Relatório Fase 02 e todos os cards aprovados.
>
> Se algum elemento necessário não existir, **crie-o como módulo novo e isolado**. Se houver conflito, mantenha o que existe e apresente uma nota técnica no final.

---

## 1. Objetivo

Conectar o Desk Intelligence à mesma base de dados já existente e usada pelo App Cliente, de forma que ambas as superfícies leiam e escrevam no mesmo registro por caso, mantendo o `caseId` estável e todos os campos já definidos.

**Não criar:**
- MVP novo
- CRM paralelo
- Planilha ou base paralela
- Mockups isolados sem conexão com a base existente
- Dados fictícios apresentados como dados vivos

---

## 2. Passo 1 — Auditoria da base existente (obrigatório antes de qualquer alteração)

Antes de tocar em qualquer arquivo, faça uma leitura completa do código e identifique:

1. **Onde está a camada de dados centralizada** — procure `src/data/cases.ts` ou equivalente (qualquer arquivo que centralize os casos com `caseId` estável).
2. **Quais campos cada caso já possui** — liste todos os campos encontrados por caso.
3. **Quantos casos já existem** — liste os `caseId`s encontrados (ex: `CA-ITA-SOPHI-PICCOLI`, `CA-ITA-GIOVANNA-PRADE`, `CA-AUT-ANA-LUIZA-GOMES`, `CA-GEN-JOAO`, `CA-GEN-LARA`).
4. **Como o App Cliente já consome essa base** — qual componente/hook/contexto lê os dados.
5. **Como o Desk Intelligence já consome essa base** — se já consome, ou se tem uma fonte separada/duplicada.

**Se a base existente não for encontrada:** pare e devolva um relatório técnico identificando o que existe, sem inventar uma base nova. Não crie uma segunda base.

**Se a base existir mas o Desk tiver uma fonte separada:** a conexão deve unificar o Desk à base existente, nunca o contrário.

---

## 3. Escopo da conexão

Fazer o Desk Intelligence consumir exatamente a mesma camada de dados (`cases.ts` ou equivalente) já usada pelo App Cliente, via adapter/repository compartilhado.

### 3.1 Mapeamento de campos (preservar existentes, não remover)

O Desk deve ler e escrever no mesmo registro que o App Cliente, incluindo no mínimo:

```
id (caseId estável)
clientName
displayName
country
citizenshipPath
caseStatus
proposalStatus
contractStatus
paymentStatus
phase1Status
phase2Status
caseOwner
lastUpdate
nextAction
confidenceNote
sources[]
people[]
documents[]
checklist[]
reports[]
proposalSummary
paymentUrl
```

Se o Desk já exibe campos adicionais específicos (alertas, eventos comerciais, notas internas, responsável, prazo), esses campos devem ser adicionados à camada de dados como campos opcionais do caso, sem remover campos do App Cliente.

### 3.2 Princípio de não-duplicação

- O App Cliente e o Desk Intelligence devem ler o **mesmo objeto de caso** por `caseId`.
- Se o App mostra `caseStatus = "Proposta aceita"`, o Desk deve mostrar o mesmo valor sem precisar de sincronização manual.
- Se o Desk atualiza `contractStatus = "Contrato assinado"`, o App Cliente deve refletir imediatamente, respeitando as regras de sanitização (o App não exibe dados sensíveis por padrão).

---

## 4. Proteções obrigatórias

1. **Nenhuma tela, rota, componente, card, estilo ou dado existente deve ser removido.**
2. As mudanças devem ser compatíveis com a arquitetura atual — se o projeto usa React/TypeScript, manter o padrão; se usa Supabase, manter o padrão.
3. Dados demonstrativos existentes devem permanecer rotulados como `Dados demonstrativos`.
4. **Não publicar** o app. Não alterar configurações de deploy.
5. Não criar links externos falsos (Asaas, WhatsApp, etc.).
6. Não inventar dados pessoais, valores, status ou prazos não presentes na base.

---

## 5. Verificação específica — Ana Luiza

Após a conexão, verificar no Desk Intelligence:

1. O caso `CA-AUT-ANA-LUIZA-GOMES` aparece no Desk?
2. Os campos do caso Ana Luiza no Desk são os mesmos do App Cliente?
3. Se o App mostra `proposalStatus = "Proposta aceita"`, o Desk mostra o mesmo?
4. O `caseStatus`, `paymentStatus`, `phase1Status` e `phase2Status` estão sincronizados entre App e Desk?

Se o caso Ana Luiza não existir ainda na base, não criá-lo nesta etapa — apenas registrar a lacuna no relatório de evidência.

---

## 6. Evidência exigida ao final

Ao concluir, responda com um relatório objetivo contendo:

1. **Base de dados detectada:** caminho do arquivo, estrutura, campos por caso.
2. **Casos existentes antes da conexão:** lista de `caseId`s encontrados.
3. **Casos existentes depois da conexão:** mesma lista (deve ser idêntica — nenhum caso removido).
4. **Fonte do Desk antes:** se era separada ou já compartilhada.
5. **Fonte do Desk depois:** confirmar que agora lê a mesma base do App.
6. **Arquivos alterados:** lista de arquivos modificados, com resumo do que mudou em cada.
7. **Arquivos criados:** lista de arquivos novos, se houver (apenas adapters/interfaces compartilhadas).
8. **Arquivos removidos:** deve ser zero. Se houver, justificar.
9. **Verificação Ana Luiza:** resultado da verificação do item 5.
10. **Pendências técnicas:** qualquer bloqueio, lacuna ou decisão humana necessária.

---

## 7. Critério de parada

Ao final, aguarde. Não prossiga para nenhuma outra funcionalidade. O próximo prompt (CA-CONN-02 — Ativar CRM vivo) será fornecido separadamente após a confirmação desta conexão.
