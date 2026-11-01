# PR190: execução e correção da justificativa

O código da PR190 monta o escritor existente, mas sua primeira versão recebia o motivo de `AcaoOperacional`. Para admin, a política permite a operação diretamente e esse motivo é vazio; o servidor recusaria a resolução por falta de dez caracteres.

```yaml
status: em revisão
versao: v1.0
data: 2026-10-24
responsavel_pela_decisao: Proprietária do Clube Ancestral
autorizacao: executar PR190 e verificar implementação, não apenas documentação
fontes:
  - PR190, commit 552b328b
  - merge b1a828340d86f2094e9529e603bc88628d112a86
  - testes locais e prova de interação do componente
escopo: justificativa humana, envio, erro e reentrada no fluxo de resolução individual
premissas: preservar escritor, políticas de acesso, triggers e auditoria existentes
limites:
  - Nenhum bloqueio ou dado da cliente foi alterado.
  - Prova de navegador local usa resposta simulada, não banco de produção.
  - Publicação e gravação autenticada precisam de confirmação separada do merge.
proximos_passos:
  - CI do commit corretivo, integração e conferência da revisão publicada.
  - Teste autenticado de uma decisão real somente quando autorizado.
criterio_de_aceite:
  - Admin e operações informam justificativa humana antes do envio.
  - Vazio ou motivo curto não chega ao escritor.
  - Erro preserva texto; sucesso provoca releitura da ficha.
  - Nenhum outro bloqueio é resolvido automaticamente.
```

## Implementação efetiva

- **Componente:** `src/components/caso/resolucao-bloqueio-piloto.tsx`, campo rotulado, mínimo de dez caracteres, dois estados e mensagem de erro.
- **Rota:** `src/routes/_authenticated/onboarding.$id.tsx`, componente montado em cada bloqueio, `id` real e `mutateAsync` ligado ao escritor original.
- **Autorização:** conserva a informação de papel recebida do servidor e `AcaoOperacional`; não altera autoridade global, banco ou RLS.
- **Reentrada:** aguarda a promessa e impede dois envios concorrentes.
- **Falha:** retorno negativo ou exceção mostra a causa e preserva a justificativa.
- **Testes:** novo teste de interação utiliza `AcaoOperacional` e `decidirAcao` reais, com contexto e resposta de servidor controlados.

## Verificações locais

| Verificação | Resultado |
|---|---|
| TypeScript, `tsc --noEmit` | Aprovado |
| Testes focados | 32 aprovados em três arquivos |
| Suíte completa em Node 22 | 596 arquivos aprovados; 5.763 testes aprovados; oito ignorados |
| Build de produção | Aprovado |
| Navegador, componente real com resposta simulada | Preenchimento, resolução, não aplicável, recusa e erro de rede verificados |
| Mobile 375 px | Documento com 375 px, sem overflow horizontal no componente |
| Erros JavaScript da prova local | Nenhum registrado |
| Dados reais do caso | Não alterados e não homologados nesta prova |

A primeira execução do teste de interação em Node 20 encontrou incompatibilidade de ambiente com `undici`. A repetição em Node 22, igual à versão principal do CI, passou sem alterar dependências ou regras do produto.

## Concorrência durante a execução

A PR190 foi mesclada por outra execução em 24/10 às 13:49:27 UTC, enquanto esta validação ocorria. A correção foi colocada numa branch sucessora sobre o merge atual, para não ficar abandonada numa PR encerrada.

O histórico da entrega original pode ser consultado na [PR190](https://github.com/tatianatosi/soul-ancestry/pull/190). Este registro acompanha mudanças de código e testes; não substitui essas mudanças nem afirma publicação antes de sua confirmação.
