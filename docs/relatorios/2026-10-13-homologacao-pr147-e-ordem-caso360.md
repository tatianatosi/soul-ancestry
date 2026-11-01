# Diretiva Executiva: Homologação do PR #147 e Ordem de Execução do Caso 360

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 12:55 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: homologacao executiva de pr, blindagem de navegacao e autorizacao do caso 360
caminho_no_repositorio: docs/relatorios/2026-10-13-homologacao-pr147-e-ordem-caso360.md
fontes:
  - PR #147 (Shell do Desk V4, Topo Limpo, Pílulas e Mobile 375px)
  - Prancha Visual Desk V4 (Composição aprovada)
  - docs/politicas/politica-autoridade-operacional.md
escopo: >
  Resposta oficial da Proprietária confirmando que vale a decisão do PR #147
  (7 ecossistemas + governança, pílulas arredondadas e token navy #13294B),
  proibindo qualquer reversão e autorizando o avanço imediato para a tela do Caso 360.
premissas:
  - O PR #147 acertou o visual do Desk e está formalmente aprovado no que tange ao Shell;
  - Não reverter nada do menu nem das pílulas para versões legadas;
  - O próximo passo de trabalho é a composição interna da tela Caso 360 com dados reais.
criterio_de_aceite: >
  Texto de diretiva afirmativa e concisa para ser colado no terminal do Claude Code.
```

---

## Mensagem Oficial para Colar no Claude Code:

```markdown
VALE INTEGRALMENTE A DECISÃO DE HOJE QUE JÁ ESTÁ NO PR #147!

Não reverta absolutamente nada. O seu trabalho no PR #147 está perfeito e é exatamente o que eu aprovei:

1. **Menu e Ecossistemas:** Mantidos os 7 ecossistemas + Governança, exatamente como você acabou de estruturar e testar.
2. **Estilo das Abas:** Mantidas as pílulas arredondadas com a ativa em navy (`bg-navy text-white`), exatamente como na Prancha V4. Nada de sublinhado dourado antigo.
3. **Paleta e Tokens:** Mantido o token oficial travado `--navy: #13294B`.
4. **Topo e Mobile:** Aprovados o topo limpo com busca global, avatar `TT` e a barra inferior fixa no mobile de 375px.

### Próximo Passo Autorizado:
Como a casca (Shell), a navegação e as pílulas estão resolvidas e travadas no PR #147, **você está autorizado a começar o trabalho tela por tela pelo CASO 360 (`/casos/$caseId`)**, seguindo exatamente a ordem do plano:

- Componha a grade da tela **Caso 360** espelhando a Prancha V4:
  - Identidade do caso e participantes no topo;
  - Linha do tempo e progresso por frente;
  - Estados do dossiê com dados reais do Supabase (sem mocks, sem `cases.ts`);
  - Preservando a regra: "pendência informa, não impede".

Pode avançar direto na implementação do Caso 360 na mesma branch do PR #147!
```
