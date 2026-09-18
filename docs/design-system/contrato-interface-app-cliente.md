# Contrato de Interface — App Cliente

**Status:** em revisão  
**Versão:** v1.0  
**Data:** 2026-09-18  
**Responsável pela decisão:** Proprietária do Clube Ancestral  
**Fonte:** mockup visual aprovado do App Cliente (7 telas dentro do mockup de 17 telas); `Taxonomia_Canonica_Mockup_Aprovado_App_Cliente_e_Desk.md`; `visibilidade-e-sanitizacao.md`; decisão da Proprietária.  
**Escopo:** contrato visual, taxonômico, de conteúdo, CTA e estados das sete abas do App Cliente.  
**Premissas:** mockup define interface/conteúdo; fonte real define o que pode aparecer; App mostra somente projeção autorizada e sanitizada.  
**Limites:** não cria rotas, dados, upload, publicação, cobrança, assinatura ou envio.

## Navegação imutável

```text
Home → Jornada → Radar → Árvore → Documentos → Legado → Conta
```

Não criar oitava aba, não renomear abas e não importar grupos internos do Desk para a barra do cliente. Toda navegação preserva titular/pessoa, `case_id` e objeto contextual.

## Estrutura obrigatória

| Aba | Promessa aprovada | Blocos obrigatórios de cima a baixo | CTA permitido | Conteúdo proibido | Estado vazio canônico |
|---|---|---|---|---|---|
| Home | Painel do caso, progresso e achados recentes | cabeçalho; acompanhamento da família; etapa pública; próxima ação; achados; microentrega; navegação | uma CTA contextual por estado | gates, NO_GO, RLS, auditoria, hipótese, nota interna, KPI técnico | `Aguardando primeira publicação` |
| Jornada | Linha do tempo ancestral e do acompanhamento | cabeçalho; etapas públicas; passado familiar; marcos; presente; próximo capítulo | uma CTA contextual para detalhe publicado | tarefa, responsável e prazo internos; valor/contrato bruto sem política de publicação | `Aguardando publicação de um novo marco` |
| Radar | Seis dimensões da jornada | cabeçalho; visão de seis eixos; explicação; estados por eixo | leitura; detalhe somente se publicado | decisão jurídica definitiva por hipótese; score/fórmula interna | `Radar ainda não publicado` |
| Árvore | Árvore genealógica G1–G5 | cabeçalho; aviso de visibilidade; relações autorizadas; gerações; ligação com jornada | leitura; pessoa autorizada quando existir rota | dado privado de terceiro; vínculo inferido; evidência bruta | `Ainda não há vínculos liberados` |
| Documentos | Solicitados, recebidos, liberados e entregas | cabeçalho; solicitados; recebidos; liberados; entregas | upload somente com Storage real; abertura de arquivo liberado | upload falso; download interno; evidência bruta | `Nenhuma solicitação ou entrega publicada` |
| Legado | Biblioteca de conteúdo e nível premium | cabeçalho; biblioteca; Cadernos; Relatórios; Narrativas; oferta real opcional | abrir coleção/conteúdo/oferta reais | conteúdo interno; conclusão jurídica; SKU técnico; promessa inventada | `Ainda não há conteúdo de legado liberado` |
| Conta | Perfil, plano, alertas e histórico | cabeçalho; dados da conta; plano; avisos; histórico; preferências reais | alterar somente se houver writer real | token, papel interno, RLS, auditoria, caso/cliente demo | `Informações da conta não localizadas` por campo |

## Regras de conteúdo

- Sem fonte/publicação, exibir vazio honesto; não inventar progresso, pessoa, documento, achado, valor ou entrega.
- Dados internos, técnicos, de terceiros não autorizados e hipóteses sem revisão nunca chegam ao App.
- `Salvar` não publica; `publicar` não envia; `enviar` não assina; `assinar` não cobra.
- Upload só é exibido se houver Storage, autorização e persistência real. Metadado não é upload.
- A Jornada não deve receber texto comercial/técnico bruto como substituto de marco público.

## Aceite

Uma aba só é aceita quando preserva rótulo e blocos, usa fonte real/sanitizada, tem estado vazio específico, não expõe conteúdo proibido, funciona em desktop/375 px e mantém o caso após F5.
