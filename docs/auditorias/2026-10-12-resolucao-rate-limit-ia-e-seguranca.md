# Resolução de Vulnerabilidades Pré-Lançamento: Rate Limit em IA e Sanamento de Segurança

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: resolucao de vulnerabilidade, blindagem financeira de ia e conformidade de lancamento
caminho_no_repositorio: docs/auditorias/2026-10-12-resolucao-rate-limit-ia-e-seguranca.md
fontes:
  - src/routes/api/pesquisa-assistente.ts (Endpoint de IA Paga)
  - Auditoria de Backend e Frontend (12/10/2026 21:42 BRT)
  - scratchpad/launchworthy-soul-ancestry-2026-10-12.md
escopo: >
  Protocolo de correção imediata para os achados críticos da auditoria de lançamento:
  injeção de controle de rate limit e cota máxima diária na rota de IA (api/pesquisa-assistente.ts)
  para impedir cobranças abusivas, validação de URLs públicas do Lovable e saneamento de cabeçalhos.
premissas:
  - Nenhum usuário logado pode disparar chamadas ilimitadas a modelos LLM pagos.
  - A URL pública oficial do projeto deve ser declarada para homologação do scanner de acessibilidade.
criterio_de_aceite: >
  Implementação de teto de requisições por usuário/dia na rota de pesquisa assistente;
  resolução do apontamento HIGH de infraestrutura financeira.
```

---

## 1. O Risco Crítico Identificado: Rota de IA Sem Teto Financeiro (`[HIGH]`)

Na auditoria de backend, constatou-se que a rota `src/routes/api/pesquisa-assistente.ts` exige autenticação válida (`requireSupabaseAuth`), porém **não possui limite de taxa (rate limit) nem teto financeiro**.

### O Impacto Financeiro
Um usuário logado ou script automatizado poderia efetuar centenas de disparos consecutivos consumindo chamadas de API pagas da OpenAI/Claude sem bloqueio, gerando custos imprevistos na fatura da empresa.

---

## 2. Solução Técnica Canônica de Rate Limit

Para blindar o endpoint antes do tráfego real, deve ser injetada a camada de contenção na função de servidor:

```typescript
// Implementação Canônica em api/pesquisa-assistente.ts:
const LIMITE_DIARIO_IA_POR_USUARIO = 15; // Teto de 15 consultas diárias por cliente

export async function verificarLimiteUsoIA(userId: string): Promise<boolean> {
  // Consulta contagem em auth_throttle ou tabela de consumo diário
  const hoje = new Date().toISOString().split('T')[0];
  const { count, error } = await supabase
    .from('ai_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${hoje}T00:00:00.000Z`);

  if (count && count >= LIMITE_DIARIO_IA_POR_USUARIO) {
    throw new Error('Você atingiu o limite de consultas do assistente genealógico de hoje. Tente novamente amanhã ou fale com o suporte.');
  }
  return true;
}
```

---

## 3. Resumo dos 3 Itens de Segurança para o Lançamento

1. **Rate Limit na IA (`[HIGH]`):** Blindar o endpoint com cota máxima diária de 15 chamadas por usuário.
2. **Histórico do `.env` (`6539851a`):** Confirmar no painel do Supabase e do provedor de e-mail se as chaves ativas são diferentes das que constavam em 25/08/2026.
3. **URL Pública de Homologação:** A checagem anônima do navegador redirecionou para o login do Lovable. A URL definitiva de produção para acesso direto dos clientes deve ser a customizada ou a oficial sem preview fechado (`soul-ancestry.lovable.app/portal`).
