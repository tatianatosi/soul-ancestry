# Prompts operacionais — Claude e Lovable

Status: aprovado
Versão: v1.0
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: `docs/politicas/2026-10-08-legados-sem-autoridade-operacional.md`; `docs/auditorias/2026-10-08-impacto-revogacao-legados-no-codigo.md`; `docs/prompts/2026-10-08-comandos-execucao-revogacao-legados.md`; decisão da Proprietária.
Escopo: executar C1 no próximo dia útil ou na próxima sessão disponível; Lovable só valida depois do resultado técnico de Claude.
Premissas: Planejador, produto-pai, jornada, país/rota, proposta aprovada, CRM vivo, Calls e Discovery governam. Planilha Mestre, CRM Mestre, Painel Mestre OPS e SKU legado são referências históricas, sem poder de gate.
Limites: sem migration, RLS, dados demo, remoção de rota, merge, deploy, assinatura, cobrança, mensagem externa ou publicação. Não criar relatório, auditoria, plano, matriz ou de-para durante a execução.
Critério de aceite: alteração mínima + tipo + teste focado + build + prova de ação persistida quando houver ambiente autenticado. Documentação não equivale a execução.

## Ordem obrigatória

1. Claude executa somente C1.
2. Claude para e devolve SHA, diff e provas.
3. Proprietária aceita ou devolve a correção.
4. Lovable valida a interface do C1 em rota real, desktop e 375 px; não altera regras de servidor.
5. Só após aceite, abrir C2. C3 permanece bloqueado até C2 aceito.

## Prompt para Claude

```text
MODO EXECUÇÃO CONTROLADA — C1 / REVOGAÇÃO DOS LEGADOS.

Repositório: tatianatosi/soul-ancestry.
Trabalhe em branch nova a partir da main atual. Não trabalhe diretamente em main.

AUTORIDADE ATUAL
- Planejador + produto-pai + jornada + país/rota + proposta aprovada + CRM vivo + Calls + Discovery governam o fluxo.
- Planilha Mestre, CRM Mestre, Painel Mestre OPS e SKU legado são históricos. Não são fontes operacionais e não são gates.
- SKU não valida contratação, jornada, produto-pai, PP-02/PP-03, proposta ou assinatura.
- Não inferir preço, condição, escopo, produto-pai, país, rota ou assinatura.

MISSÃO ÚNICA
Corrigir somente C1: remover o fallback de catálogo/SKU como gate do caminho contratual atual, preservando proposta Canva, escopo, condição particular, prévia íntegra, revisão, assinatura, acesso e representação de menor.

ANTES DE EDITAR
Ler apenas:
- src/lib/conciliacao-catalogo.server.ts
- src/lib/conciliacao-catalogo.ts
- src/lib/contratos.functions.ts
- src/lib/resgate-contrato-planejador.ts
- src/lib/__tests__/resgate-ana-contrato-v2-2026-09-27.test.ts
- src/lib/__tests__/conciliacao-catalogo.test.ts
- docs/politicas/2026-10-08-legados-sem-autoridade-operacional.md
- docs/auditorias/2026-10-08-impacto-revogacao-legados-no-codigo.md

IMPLEMENTAÇÃO EXATA
1. Em conciliacaoDoContrato, quando existir contrato/proposta ligada a caso, decidir bloqueio pela proposta Canva e pela governança do Planejador. Não voltar para conciliarPropostaComCatalogo por SKU ausente, divergente ou não homologado.
2. Se faltarem produto-pai, proposta Canva, aprovação, vínculo do caso ou páginas completas, devolver bloqueio com motivo factual da proposta/Planejador. Não usar SKU, catálogo ou homologação como razão de bloqueio nesse caminho.
3. Em aprovarParaEnvio, preservar todos os impedimentos reais de prévia, revisão, assinatura, partes e menor, sem prefixar bloqueio de proposta como catálogo.
4. Não alterar valor, condição comercial, escopo, partes, anexos, proposta, contrato persistido ou banco.
5. Ajustar apenas testes que exigem SKU como gate do contrato atual. Incluir testes para: (a) produto-pai + Canva completa liberam sem SKU; (b) Canva ausente ou incompleta bloqueia por motivo factual; (c) menor e revisão continuam independentes.

LIMITES
- Máximo: quatro arquivos de produção e três arquivos de teste.
- Sem migration, RLS, dados demo, rota nova, refatoração ampla, documento novo, PR, merge ou deploy.
- Se exigir mudança de banco, parar e informar o arquivo, a função e o motivo; não aplicar nada.

PROVAS OBRIGATÓRIAS
Executar e colar a saída real:
1. npx tsc --noEmit
2. testes focados alterados
3. npx vite build
4. git diff --stat e diff por arquivo

RESPOSTA FINAL OBRIGATÓRIA
- Branch e SHA
- Arquivos modificados
- CODIFICADO: sim/não, com fatos
- TESTADO: comandos e resultados
- Não executado: itens que ficaram fora do corte
- Declaração: sem migration, merge, deploy, assinatura, cobrança, publicação ou mensagem externa

Não escrever relatório adicional. Não dizer ACEITO ou PRONTO. Pare após a prova.
```

## Prompt para Lovable

```text
MODO VALIDAÇÃO VISUAL CONTROLADA — C1.

Você só começa depois de receber do Claude: branch, SHA, diff e saídas de tsc, testes e build do C1. Se não houver essas provas, responda BLOQUEADO e não altere nada.

AUTORIDADE ATUAL
- Planejador + produto-pai + proposta Canva aprovada governam o fluxo contratual atual.
- SKU, Planilha Mestre, CRM Mestre e Painel Mestre OPS não podem aparecer como gate, bloqueio, CTA ou razão operacional para a Ana.
- Não transformar ausência de SKU em erro visual.

ESCOPO ÚNICO
Validar a rota real de preparação/revisão do contrato da Ana após C1. Não redesenhar o app, não alterar banco, não alterar regras de servidor, não criar demo, não criar rota e não editar documentos.

ROTEIRO DE PROVA
1. Abrir o caso Ana e a rota de contrato real em sessão autorizada.
2. Verificar em desktop e 375 px:
   - proposta Canva e escopo visíveis quando disponíveis;
   - condição particular com origem legível;
   - SKU/catálogo não aparece como bloqueio de assinatura ou OS;
   - se a proposta estiver incompleta, o motivo visível é factual e ligado à proposta, não SKU;
   - prévia sem corpo/defasada continua com bloqueio factual;
   - menor/representação e revisão continuam nos seus lugares;
   - nenhuma CTA executa assinatura, cobrança ou publicação.
3. Fazer F5 e confirmar que o estado exibido vem do servidor, não de mock/local state.

NÃO FAZER
- Não alterar texto jurídico, preço, condição, proposta, contrato, usuário, perfil ou publicação.
- Não criar dados de teste ou fallback de demo.
- Não gastar build em redesign, exploração ou documentação.
- Não declarar pronto com print isolado.

ENTREGA
Responder em uma tabela curta:
- rota e caso usados;
- desktop: PASSOU/FALHOU/BLOQUEADO;
- 375 px: PASSOU/FALHOU/BLOQUEADO;
- F5: PASSOU/FALHOU/BLOQUEADO;
- divergência objetiva, se houver;
- capturas/links disponíveis;
- nenhuma alteração efetuada: sim/não.

Pare. Não iniciar C2 ou C3.
```

## Handoff

Depois de Claude e Lovable, a Proprietária decide se aceita C1. Apenas então repetir o mesmo ciclo para C2; C3 não pode começar antes de C2 aceito.