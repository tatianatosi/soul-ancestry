# Registro operacional — Preview do PR #35 e prioridades de execução

```yaml
status: em revisão
versão: 1.0
data: 2026-08-31
projeto: Clube Ancestral
classificação: relatório operacional e recomendação de uso
responsável pela decisão: Proprietária do Clube Ancestral
fontes de evidência:
  - Relato operacional recebido em 2026-08-31
  - Relatório do Dia 4
  - PR #35, conforme relato recebido
  - Prompt Mestre — Motores a Implantar
escopo: orientação de uso temporário do preview, limites operacionais e priorização P0→P11
premissas:
  - o preview informado corresponde ao PR #35 e agrega as correções descritas no relato
  - nenhuma orientação substitui validação final da proprietária no preview
limites:
  - este documento não confirma tecnicamente o deploy, a persistência ou o comportamento do preview por acesso direto
  - este documento não autoriza uso de onboarding, alteração institucional de CNPJ ou duplicação de pessoas
próximos passos:
  - validar no preview os fluxos liberados
  - concluir o Mapa de Autoridade Admin para Marketing, Configuração e App Cliente
  - iniciar P4 após as validações e a especificação do motor único
critério de aceite:
  - salvar → confirmar resultado/linha afetada → reler pelo mesmo ID → refresh → reabrir → confirmar persistência
substitui: nenhum
```

## Situação registrada

O relato informa que o arquivo `PENTE-FINO-IMPLANTACAO-PENDENCIAS-2026-08-30.md` já está arquivado. Não foi localizado um prompt separado intitulado "Pessoa 360"; o termo aparenta referir-se à funcionalidade de acesso rápido à pessoa, conectada ao Caso 360, e não a uma política ou prompt independente.

Se houver um arquivo específico denominado "Pessoa 360", ele deve ser reenviado/localizado antes de qualquer arquivamento, para evitar arquivar o item errado por inferência.

## Preview liberado para trabalho

Preview informado para o PR #35:

```text
https://soul-ancestry-git-fix-reconciliar-co-14c2c9-tati-6134s-projects.vercel.app
```

O relato informa que este preview agrega as correções realizadas na sessão:

- Salvamento de pessoa com confirmação de banco/releitura.
- Criação de tarefa vinculada ao caso a partir de Pessoa e Caso 360.
- Piloto Real derivado de pendências reais, sem lista fixa.
- Aba de contrato com edição de CPF/CNPJ.
- Correção do erro que impedia a criação da parte contratante.

## Uso permitido provisoriamente

Enquanto as limitações abaixo permanecem ativas, a orientação é usar o preview apenas para fluxos já contemplados pelo PR #35:

1. Abrir e editar pessoa nos fluxos disponíveis.
2. Salvar dados permitidos e confirmar o retorno de persistência.
3. Criar tarefa ligada ao mesmo caso, quando necessário.
4. Abrir o Caso 360 e consultar tarefas vinculadas.
5. Criar/editar rascunho contratual e partes existentes dentro do fluxo liberado.
6. Editar CPF/CNPJ de parte contratual quando aplicável.
7. Consultar pendências vivas no Piloto Real.

Todo teste deve observar o ciclo de validação:

```text
editar/criar
→ salvar
→ confirmar resultado e linha afetada
→ reler pelo mesmo ID
→ refresh completo
→ reabrir
→ confirmar que o valor permanece
```

## Não usar por enquanto

### Onboarding

Não iniciar onboarding. O relato registra três sistemas paralelos que ainda não conversam entre si; preenchimentos nessa área podem não chegar ao motor canônico futuro e podem gerar retrabalho.

### Perfil institucional da contratada

Não tentar atualizar o CNPJ ou os dados institucionais da Clube Ancestral. O dado continua distribuído entre três fontes sem sincronização e aguarda política unificada:

```text
PERFIL_INSTITUCIONAL hardcoded
contratada_qualificacao por caso
contract_parties com papel provider por contrato
```

### Duplicação de dados de pessoa

Não recadastrar nome ou documento em "Pessoas e Linhagens" quando já existir representação em Cliente, Núcleo ou Contrato. A ficha genealógica G-02 deve receber somente dados específicos de pesquisa, como nascimento, linhagem e elementos genealógicos que não sejam repetição cadastral.

## Ordem de execução

A ordem adotada continua a do Prompt Mestre:

```text
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10 → P11
```

O próximo trabalho estrutural descrito no relato é:

1. Fechar o Mapa de Autoridade Admin em Marketing, Configuração e sete telas do App Cliente.
2. Validar os itens já em preview, em especial P0/P2 onde aplicável.
3. Especificar e implementar P4 — Onboarding Real / Motor Único.
4. Deixar layout, design e taxonomia para depois dos motores operacionais, conforme a sequência definida.

P3 — tarefas com idempotência — não deve avançar como sistema autônomo desconectado. Deve ser especificado em relação ao caso canônico e, se tecnicamente justificável, tratado como parte explícita da base operacional de P4.

## Próximos passos

- Proprietária valida o preview do PR #35 nos fluxos permitidos.
- Registrar falhas com rota, ação, identificador da entidade e resultado após refresh.
- Completar o Mapa de Autoridade Admin nas superfícies ainda não mapeadas.
- Produzir artefato de especificação de P4 antes de abrir PR de implementação.
- Não iniciar unificação de núcleos, criação de `case_participants`, sincronização institucional ou revisão visual ampla sem autorização e critérios próprios.
