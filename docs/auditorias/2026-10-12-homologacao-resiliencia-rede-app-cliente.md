# Homologação e Aceite: Resiliência de Rede no App Cliente e Merge da PR #144

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 14:45 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: relatório de homologação de frontend, resiliência de rede e governança
caminho_sugerido_no_repositorio: docs/auditorias/2026-10-12-homologacao-resiliencia-rede-app-cliente.md
fontes:
  - Rascunho Lovable (resiliência de rede do App Cliente)
  - Commit ac14b05 (PR #144 mesclada com sucesso no main)
  - 16 capturas de tela autorizadas (pasta app-resiliencia-rede-2026-10-12)
  - Arquivos novos: src/lib/portal-resiliencia.ts, src/components/portal/aviso-falha-conexao.tsx
  - Suite de testes: src/lib/__tests__/portal-resiliencia-rede.test.tsx (9/9 passando)
escopo: >
  Homologação formal do pacote de resiliência de rede do App Cliente,
  aprovação da distinção entre erro de conexão e vazio honesto,
  e autorização para publicação no ambiente principal.
premissas:
  - PR #144 foi mesclada no main (commit ac14b05).
  - Erro de conexão jamais é mascarado como "nenhuma assinatura" ou "lacuna".
  - Conteúdo digitado e arquivos selecionados permanecem preservados em caso de falha de upload.
criterio_de_aceite: >
  Aprovação das mensagens de erro e botão "Tentar novamente";
  inclusão opcional do botão Reenviar em mensagens do caso;
  autorização para merge/publicação do rascunho de resiliência.
```

## 1. Sumário do Aceite e Parecer da Proprietária

A Proprietária do Clube Ancestral aprova integralmente as melhorias de resiliência implementadas no rascunho do App Cliente:

1. **Separação Rígida entre Erro e Vazio**:
   - Falhas de rede não dizem mais *"nenhuma assinatura"* nem acionam avisos falsos de falta de permissão na Conta.
   - O aviso *"Instabilidade de conexão ao carregar seus dados financeiros"* com botão **[Tentar novamente]** protege a confiança do cliente.
   - Na Árvore e no Radar, *"Lacuna"* passa a representar exclusivamente ausência comprovada de dados na fonte, nunca timeout de requisição.
2. **Preservação de Conteúdo e Upload**:
   - Textos e arquivos permanecem no buffer local em caso de oscilação de rede com o aviso *"Falha de conexão — seu conteúdo foi mantido"* e botão **[Reenviar]**.
3. **Limite de Timeout**:
   - O teto de 15 segundos previne travamento de interface em conexões móveis instáveis.

---

## 2. Decisão sobre a Limitação Apontada

- **Item**: Caixas de mensagem da página de detalhe do caso (Desk / Caso 360).
- **Decisão da Proprietária**: **SIM, INCLUIR O BOTÃO [REENVIAR]**.
  - A mesma experiência acolhedora e segura deve valer para as mensagens internas do caso no Desk, garantindo paridade entre o App e o Desk.

---

## 3. Confirmação do Merge da PR #144

- **Status no GitHub**: O Pull Request **#144** (`fix(portal): impedir emissão de convite para dependentes sob representação legal`) foi mesclado com sucesso no `main` através do commit **`ac14b05`**.
- O backend de permissões está oficialmente protegido contra disparos indevidos para dependentes.

---

## 4. Instrução de Liberação para Publicação

```markdown
RESPOSTA NORMATIVA: APROVAÇÃO DO RASCUNHO DE RESILIÊNCIA DE REDE
Proprietária: Tatiana Tosi (tati@pluggedresearch.com)
Ambiente: Lovable & Repositório tatianatosi/soul-ancestry

Parecer da Proprietária:

1. [RASCUNHO DE RESILIÊNCIA: APROVADO PARA PUBLICAÇÃO]:
   - Todas as alterações em `portal-resiliencia.ts`, `aviso-falha-conexao.tsx`, `fonte-portal.tsx` e nas telas do portal estão APROVADAS.
   - Pode aplicar as mudanças ao site principal.

2. [MELHORIA NAS MENSAGENS DO CASO: AUTORIZADA]:
   - Inclua o botão [Reenviar] nas caixas de mensagem da página de detalhe do caso.

3. [PR #144 CONCLUÍDA]:
   - A PR #144 foi mesclada no main (commit ac14b05). O main está pronto e compatível.

Parabéns pela qualidade técnica e pela preservação da integridade dos 9/9 testes de resiliência.
```
