# Diretiva Executiva: Homologação do PR #148 e Desbloqueio da Correção dos 2 Testes

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 13:25 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: homologacao executiva de pr, autorizacao de correcao de testes legados e proxima tela
caminho_no_repositorio: docs/relatorios/2026-10-13-homologacao-pr148-e-desbloqueio-testes.md
fontes:
  - PR #148 (Pessoas & Linhagens G1–G10 em /nucleos)
  - Preview Vercel (https://soul-ancestry-git-claude-pessoas-lin-c091ab-tati-6134s-projects.vercel.app/nucleos)
  - AGENTS.md (Integridade e testes verdes)
escopo: >
  Diretiva homologando a entrega de Pessoas & Linhagens no PR #148, autorizando o merge em main,
  autorizando formalmente a criação de um PR de hotfix para sanear os 2 testes legados que falham no main,
  e determinando o avanço para a tela Pessoa 360 (/clientes).
premissas:
  - O PR #148 está visualmente e funcionalmente aderente à Prancha V4;
  - Sanear marcos-jornada.functions.ts e portal/conta.tsx é necessário para o CI ficar 100% verde;
  - Pessoa 360 (/clientes) é a tela subsequente do plano de consolidação.
criterio_de_aceite: >
  Mensagem clara e estruturada para envio imediato ao Claude Code.
```

---

## Mensagem Oficial para Colar no Claude Code:

```markdown
RESPOSTA EXECUTIVA DA PROPRIETÁRIA — HOMOLOGAÇÃO DO PR #148 E HOTFIX:

### 1. Homologação e Merge do PR #148 (`/nucleos`)
- A entrega de **Pessoas & Linhagens com extensão G1–G10** está **APROVADA E HOMOLOGADA**!
- O isolamento em branch limpa (`claude/pessoas-linhagens-v4`) foi a escolha correta.
- **AUTORIZO O MERGE DO PR #148 EM `MAIN`**!
- Sobre a liberação de `golive-pessoas.ts`: **AUTORIZADO** estender a cobertura antiga de G5 para G10 também nos cartões de cada núcleo, mantendo a consistência visual em toda a tela.

### 2. Autorização Formal para Corrigir as 2 Falhas Antigas de Teste
Você tem **AUTORIZAÇÃO TOTAL** para abrir uma branch de hotfix e resolver as 2 falhas pré-existentes do `main`:
1. **`marcos-jornada.functions.ts`**: Adicionar a conferência de persistência pós-escrita (`gravarComVerificacao` ou retorno da linha gravada em `app_projections`).
2. **`portal/conta.tsx`**: Ajustar o guard para que os valores de demonstração (titular e país) só apareçam estritamente dentro da prévia de demonstração (`demo === true`).
Isso deixará o CI 100% verde (`0 falhas`) para todo o repositório.

### 3. Próxima Tela do Desk: PESSOA 360 (`/clientes` ou `/clientes/$clienteId`)
Após o merge do PR #148 e do hotfix dos testes:
- A tela **Pessoa 360** vive canonicamente em `/clientes` (com o detalhe em `/clientes/$clienteId`).
- Componha a grade com base na Prancha V4:
  - Identidade da pessoa no topo (nome civil, nascimento, naturalidade, confiança);
  - Gráfico de parentesco e casos vinculados;
  - Fontes confirmadas/em revisão e localização;
  - Barra de completude por dimensão e rede de vínculos demonstrativos.

Pode executar o merge do PR #148, subir o hotfix dos 2 testes e avançar para Pessoa 360!
```
