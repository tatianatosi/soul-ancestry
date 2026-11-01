# Diretriz de Arquitetura: Proteção da Estrutura GoLive e Congelamento do App Mínimo

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 09:30 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: protecao de arquitetura, blindagem golive e congelamento contra sobreposicao do lovable
caminho_no_repositorio: docs/arquitetura/2026-10-13-blindagem-golive-e-app-minimo.md
fontes:
  - Estudo GoLive Mockups Aprovados (golive-mockups-estudo-4.pdf)
  - CA-CONN-01 (Conectar Base Existente sem Destruição)
  - CA-RESET-01 (Estabilização Operacional Única)
  - Laudo de Homologação 7 Abas do Portal
escopo: >
  Revisão estrita da arquitetura acordada para o GoLive dos clientes.
  Bloqueio imediato de refatorações destrutivas ou expansões pelo Lovable antes
  do fechamento estável do Mínimo do App e preservação da estrutura das 19 rotas GoLive.
premissas:
  - A estrutura GoLive aprovada é a referência canônica para os clientes;
  - O Lovable NÃO PODE sobrepor, deletar, recriar ou desestabilizar telas existentes;
  - O App do Cliente (/portal) deve ter seu escopo congelado no mínimo factual antes de qualquer nova frente.
criterio_de_aceite: >
  Congelamento total de escopo no App Mínimo;
  preservação da rota oficial /portal com as 7 abas canônicas;
  proibição de novas sobreposições até homologação final da Proprietária.
```

---

## 1. O Que Ficou Acordado na Arquitetura (A Verdade dos Estudos)

A revisão exaustiva do documento **`golive-mockups-estudo-4.pdf`** e do **`CA-RESET-01`** comprova:

1. **A Estrutura GoLive Aprovada Deve Ser Preservada:**
   - O projeto possui a matriz estruturada com o fluxo de **19 destinos operacionais no Desk/GoLive** e as **7 abas canônicas no App Cliente (`/portal`)**: *Home, Jornada, Radar, Árvore, Documentos, Legado e Conta* [file:502].
   - **O Lovable não pode sobrepor nem achatar** essas rotas com componentes genéricos ou novos layouts que descaracterizem o estudo [file:502].

2. **O Risco Real: Lovable Sobrepondo o Que Já Funciona:**
   - O Lovable tende a aplicar "melhorias" ou "remodelagens" que sobrescrevem o código estável, quebram a responsividade móvel e reintroduzem mockups artificiais (como certidões inexistentes ou barras de 60%) [file:502].
   - **Regra de Blindagem:** Nenhuma alteração ampla ou refatoração estrutural é permitida sem que o **MÍNIMO DO APP** esteja 100% blindado, entregue e congelado [file:502].

---

## 2. A Definição Rígida do "Mínimo do App" (Dia D da Ana Luiza)

Antes de qualquer intervenção adicional no Desk ou em telas auxiliares, o App do Cliente (`https://soul-ancestry.lovable.app/portal`) deve permanecer estritamente fechado na seguinte lista:

| Aba do App | O Que DEVE Estar na Tela (Mínimo Fechado) | O Que Está ESTRITAMENTE PROIBIDO |
|---|---|---|
| **1. Home** | Identidade do Projeto Familiar, acolhimento institucional, barra com a verdade das etapas e atalho WhatsApp | Régua forçada a 60%, etapas dadas como concluídas sem contrato assinado |
| **2. Árvore** | Os 8 elos canônicos confirmados (Heinrich → Rudolf → Lotte/Otto → Ana Maria → Cleusa Lúcia → Adair Júnior → Ana Luiza + Felipe), texto de Otto Reimer (Graz, 1895) e dourado `#A88434` | Personagens inventados (*Elsa*, *Adair avô*) ou anos fictícios |
| **3. Documentos** | 3 cartões informativos com status **"Acervo sob curadoria técnica"** | Falsos botões de "Baixar/Ver" para arquivos que ainda não foram anexados no Desk |
| **4. Radar** | Gráfico teia limpo em 70% da largura, leitura contextual | Intermediários falsos (*Dr. Klaus Becker*), prazos fictícios ou promessas de elegibilidade |
| **5. Conta** | Titular Ana Luiza, 3 assinaturas previstas (R$ 320/mês × 10) sem link prematuro de cobrança | Faturas avulsas de teste (R$ 1.500) ou cobrança imediata não aprovada |
| **6. Jornada / Legado** | Exibição das fases macro e preservação da narrativa familiar | Textos técnicos de SKU interno ou códigos de backoffice |

---

## 3. Ordem de Bloqueio para o Lovable

Fica determinada a seguinte instrução operacional para barrar sobreposições indesejadas:

1. **STOP IMEDIATO no Código do App:** Não mexer em mais nenhuma linha de estilo, cor, margem ou estrutura do App do Cliente (`src/routes/portal/*`). O acabamento fino publicado é a versão final para este momento [file:502].
2. **Preservação da Rota `/portal`:** Garantir que o build público sirva exatamente as 7 abas homologadas, sem redirecionamentos e sem injetar telas de login do Lovable [file:502].
3. **Desk Apenas em Modo Leitura e Compatibilização:** Qualquer ajuste no Desk V4 deve apenas **consumir** os dados reais que já sustentam o App, sem criar modelos paralelos e sem quebrar as 19 rotas do GoLive [file:502].
