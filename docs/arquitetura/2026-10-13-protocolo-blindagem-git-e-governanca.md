# Protocolo de Blindagem Operacional: Fim dos Conflitos Git, Isolamento em Branch e Ordem de Validação

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:25 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: protocolo de governanca git, resolucao de conflito entre agentes e fluxo de entrega
caminho_no_repositorio: docs/arquitetura/2026-10-13-protocolo-blindagem-git-e-governanca.md
fontes:
  - Relato de Conflito de Sincronização (13/10/2026 10:08 BRT)
  - docs/arquitetura/2026-10-13-blindagem-golive-e-app-minimo.md
  - Prancha V4 Desk Intelligence
escopo: >
  Resolução definitiva do problema de sobreposição e perda de código entre Claude/Perplexity e Lovable.
  Instituição de branch isolada para o Lovable, regra de envio de capturas antes da publicação
  e aprovação do layout de 3 colunas para o Caso 360.
premissas:
  - Ninguém pode sobrescrever código na branch main sem branch isolada;
  - O Lovable precisa trabalhar sem o risco de ter seu código apagado por sincronizações externas;
  - Toda alteração de tela deve ser validada por capturas no desktop e mobile antes do deploy.
criterio_de_aceite: >
  Criação da branch isolada 'feature/desk-v4-caso360';
  aprovação das 3 colunas factuais do Caso 360;
  regra obrigatória de pré-visualização por prints antes da publicação.
```

---

## 1. O Diagnóstico do Conflito: Por Que o Lovable "Anda para Trás"?

Você tocou no ponto nevrálgico: **dois agentes ou processos estavam sincronizando e comitando diretamente na branch `main` simultaneamente**. Quando o repositório sincronizava, o git puxava a versão remota e apagava o componente de 3 colunas do Caso 360 que o desenvolvedor havia estruturado [file:287].

Para acabar de uma vez por todas com essa instabilidade e dar paz à esteira técnica, a governança institui:

---

## 2. As Respostas Oficiais às Duas Perguntas do Desenvolvedor

### Pergunta 1: Alguém está mexendo no repositório agora?
- **Resposta:** **SIM, para garantir segurança absoluta, o Lovable DEVE trabalhar em uma branch separada.**
  - **Nome da Branch:** `feature/desk-v4-caso360` (ou a branch de rascunho do Lovable) [file:287].
  - **Instrução:** O Lovable não deve trabalhar direto na ponta da `main` desprotegida. Ao trabalhar em sua branch de feature, **nada do que ele fizer será apagado por pulls ou sincronizações externas** [file:287].

### Pergunta 2: Pode refazer e publicar direto, ou prefere ver capturas antes?
- **Resposta:** **PREFIRO VER AS CAPTURAS NO CELULAR E NO COMPUTADOR ANTES DE PUBLICAR.**
  - Como a regra do Clube Ancestral exige homologação prévia para evitar que a cliente receba telas quebradas ou layouts desconfigurados, o desenvolvedor deve **tirar as capturas (viewport 375px e 1280/1440px)**, enviar no chat para sua aprovação e, somente após o seu "OK", realizar o merge/deploy [file:287].

---

## 3. Aprovação da Arquitetura do Caso 360 em 3 Colunas

A proposta do desenvolvedor para reconstruir o Caso 360 no padrão da Prancha V4 está **PLENAMENTE APROVADA**:

- **Coluna Esquerda:** Ficha cadastral do titular (Ana Luiza) e composição do núcleo familiar (Adair e Alice). Sem inclusão de Cristiane (não documentada) [file:287].
- **Coluna Central:** Linha do tempo com os marcos genealógicos publicados (incluindo Otto Reimer, Graz, 1895) [file:287].
- **Coluna Direita:** Régua factual das etapas de prontidão, cofre de documentos (em modo informativo sem botões falsos até o envio dos PDFs) e a previsão financeira de **R$ 9.600,00** (3 assinaturas de R$ 320/mês) em modo rascunho [file:287].
- **Rodapé / Acordeão Inferior:** Blocos técnicos e detalhados recolhidos abaixo para permitir leitura limpa sem rolagem excessiva [file:287].
