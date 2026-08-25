# Clube Ancestral — Dicionário de Validações do Painel de Calls → CRM

**Versão:** 1.0  
**Finalidade:** transformar o Painel de Calls Discovery em base estruturada do novo CRM/Desk, sem substituir a Planilha Mestre de Produtos, o planejador financeiro ou os dossiês dos clientes.

## 1. Princípios de governança

1. O Painel de Calls é a camada de **entrada, qualificação e handoff comercial**; não é fonte de verdade de preços, contratos, links Asaas ou despesas.
2. A Planilha Mestre de Produtos/SKUs é a fonte de verdade para produto, preço, condição e link de cobrança.
3. Despesas de terceiros devem ser registradas como **previstas/aprovadas/pagas pelo cliente**, nunca como desembolso do Clube ou reembolso futuro.
4. Campos padronizados devem usar dropdown com **rejeitar entrada**. Observações livres ficam em campos de texto separados.
5. Campos de elegibilidade e via jurídica representam **triagem comercial/técnica preliminar**, nunca decisão jurídica final.
6. Todo lead que avançar deve ter: próxima ação, responsável, data da próxima ação e origem do lead.

## 2. Campos do CRM e critérios de validação

| Campo CRM | Tipo | Obrigatório na etapa | Regra / lista permitida |
|---|---|---:|---|
| ID Lead | Texto automático | Entrada | Formato sugerido: CA-LEAD-AAAA-SEQ. Não editar manualmente. |
| Data de entrada | Data | Entrada | Data válida. |
| Nome completo | Texto | Entrada | Obrigatório; não usar apelido como nome principal. |
| WhatsApp | Texto | Entrada | Formato E.164/DDD, quando disponível. |
| E-mail | E-mail | Diagnóstico | Formato de e-mail válido. |
| Origem do lead | Dropdown | Entrada | Diagnóstico rápido site; Diagnóstico profundo site; WhatsApp orgânico; Instagram; Indicação; Google orgânico; Google Ads; Evento; Parceiro; Base antiga; Outro. |
| Objetivo principal | Dropdown | Entrada | Cidadania; Pesquisa de origem; Genealogia/árvore; Memória familiar; Pós-cidadania; Documento específico; Outro. |
| Nacionalidade de interesse | Dropdown múltiplo controlado | Qualificação | Italiana; Portuguesa; Espanhola; Alemã; Austríaca; Polonesa; Húngara; Luxemburguesa; Croata; Romena; Europeia geral; Em investigação; Outra UE — validar antes de ofertar. |
| País/linha prioritária | Dropdown | Qualificação | Itália; Portugal; Espanha; Alemanha; Áustria; Polônia; Hungria; Luxemburgo; Croácia; Romênia; Multipaís; A definir. |
| Status da call | Dropdown | Entrada | Agendada; Confirmada; Realizada; Remarcada; No-show; Cancelada pelo lead; Cancelada pelo Clube. |
| Etapa do funil | Dropdown | Entrada | Novo lead; Triagem; Discovery agendada; Discovery realizada; Diagnóstico em elaboração; Proposta enviada; Negociação; Contrato enviado; Contrato assinado; Pagamento inicial confirmado; Onboarding; Perdido; Nutrição; Encerrado sem aderência. |
| Responsável atual | Dropdown | Entrada | SDR; Closer; Pesquisa; Operações; Financeiro; Jurídico/parceiro; A definir. |
| Elegibilidade preliminar | Dropdown | Pós-Discovery | Forte; Provável; Possível com pesquisa; Baixa; Inconclusiva; Sem aderência atual. |
| Confiança da triagem | Dropdown | Pós-Discovery | Alta — documentos-chave vistos; Média — narrativa + parte documental; Baixa — apenas relato inicial. |
| Via jurídica preliminar | Dropdown | Pós-Discovery | Descendência/jus sanguinis; Reparação histórica; Linha materna judicial; Memória Democrática; Descendência direta; Recuperação de nacionalidade; Naturalização/residência; Via familiar; Via a confirmar; Sem via identificada. |
| Status da via | Dropdown | Pós-Discovery | Aberta; Aberta com requisito específico; Aberta com prazo; Restrita; Encerrada para novos pedidos; Em confirmação jurídica; Não aplicável. |
| Marco jurídico de referência | Dropdown | Pós-Discovery | Itália — Lei 91/1992; Áustria — §58c StbG; Alemanha — Art. 116(2)/§15 StAG; Espanha — Ley 20/2022; Portugal — Lei 37/1981; Polônia — confirmação de cidadania; Hungria — naturalização simplificada; Luxemburgo — Lei de Nacionalidade; Croácia — descendência; Romênia — cidadania por descendência; Outro/validar. |
| Geração do ascendente identificado | Dropdown | Pós-Discovery | Pai/mãe; Avô/avó; Bisavô/bisavó; Trisavô/trisavó; Tetravô/tetravó ou anterior; Ainda não identificado. |
| Linha de transmissão | Dropdown | Pós-Discovery | Paterna; Materna; Mista; Linha única ainda não confirmada. |
| Risco de ruptura na linha | Dropdown | Pós-Discovery | Nenhum identificado; Naturalização estrangeira; Divergência de nomes/datas; Casamento/estado civil; Linha materna pré-1948; Adoção/reconhecimento; Falta de certidão; Perseguição/prova histórica; Outro; Em investigação. |
| Complexidade documental | Dropdown | Pós-Discovery | Baixa; Média; Alta; Muito alta. |
| Estado documental inicial | Dropdown | Pós-Discovery | Documentos-chave disponíveis; Documentos parciais; Só informações orais; Árvore/nomes sem certidões; Sem dados suficientes. |
| Documento-chave do ascendente | Dropdown múltiplo controlado | Pós-Discovery | Certidão de nascimento; Certidão de casamento; Certidão de óbito; Passaporte; Registro de imigração; Registro militar; Registro religioso; Naturalização/negativa de naturalização; Registro consular; Prova de perseguição; Nenhum ainda. |
| Pendência documental prioritária | Dropdown | Pós-Discovery | Certidão de nascimento; Certidão de casamento; Certidão de óbito; Naturalização/negativa; Passaporte; Imigração; Registro militar; Registro religioso; Retificação; Tradução; Apostila; Prova histórica; Documento pessoal do requerente; Nenhuma; A definir. |
| Exige idioma/entrevista | Dropdown | Pós-Discovery | Não; Sim — idioma; Sim — entrevista; Sim — ambos; A confirmar. |
| Número de requerentes potenciais | Número | Pós-Discovery | Inteiro positivo. |
| Estrutura familiar | Dropdown | Pós-Discovery | Individual; Casal; Núcleo familiar; Família ampliada; Linha com menores; A definir. |
| Produtos/serviços recomendados | Dropdown múltiplo controlado | Proposta | Diagnóstico; Pesquisa genealógica; Assessoria completa; Montagem de pasta; Certidões; Retificação; Tradução; Apostila; Protocolo/acompanhamento; Pós-cidadania; Memória familiar; Outro SKU — consultar Planilha Mestre. |
| SKU recomendado | Dropdown dependente | Proposta | Somente SKUs ativos da Planilha Mestre de Produtos. |
| Status de despesas de terceiros | Dropdown | Proposta | Não aplicável; Estimativa pendente; Estimadas e comunicadas; Aguardando aprovação; Aprovadas; Pagas diretamente pelo cliente; Parcialmente pagas; Pendência do cliente. |
| Regra de despesas | Dropdown fixo | Proposta | Cliente paga diretamente ao terceiro; Cliente antecipa valor aprovado; Clube não antecipa nem reembolsa despesas de terceiros. |
| Faixa de despesas externas | Dropdown | Proposta | Sem estimativa; Até R$ 1.000; R$ 1.001–3.000; R$ 3.001–6.000; R$ 6.001–10.000; Acima de R$ 10.000; Sob consulta. |
| Objeção predominante | Dropdown | Pós-Discovery | Preço; Prazo; Falta de documentos; Dúvida de elegibilidade; Família/decisor; Confiança; Momento financeiro; Idioma; Comparação com concorrente; Não houve; Outro. |
| Nível de intenção | Dropdown | Pós-Discovery | Alta — quer avançar; Média — precisa avaliar; Baixa — exploratório; Sem intenção atual. |
| Resultado da Discovery | Dropdown | Pós-Discovery | Avançar para diagnóstico; Avançar para proposta; Solicitar documentos; Pesquisa prévia; Nutrição; Sem aderência; Encerrar. |
| Próxima ação | Dropdown | Sempre | Confirmar call; Enviar checklist; Solicitar documentos; Revisar documentos; Preparar diagnóstico; Enviar proposta; Cobrar retorno; Enviar contrato; Confirmar pagamento; Iniciar onboarding; Encerrar; Outro. |
| Prazo da próxima ação | Data | Sempre | Não pode ser anterior à data do registro. |
| Resultado comercial | Dropdown | Fechamento | Convertido; Em negociação; Perdido — preço; Perdido — elegibilidade; Perdido — documentos; Perdido — timing; Perdido — sem retorno; Perdido — concorrente; Nutrição; Em aberto. |
| Motivo de perda | Dropdown | Se perdido | Preço; Elegibilidade; Documentação; Prazo; Sem resposta; Escolheu concorrente; Mudança de prioridade; Falta de decisor; Outro. |
| Consentimento de gravação | Checkbox | Discovery | Sim/Não. Obrigatório antes de gravar. |
| SPIN — Situação concluída | Checkbox | Discovery | Marcar somente após registrar dados familiares básicos. |
| SPIN — Problema identificado | Checkbox | Discovery | Marcar somente após registrar dor/lacuna objetiva. |
| SPIN — Implicação explicada | Checkbox | Discovery | Marcar somente após explicar risco de não estruturar a via/documentação. |
| SPIN — Necessidade/valor validado | Checkbox | Discovery | Marcar somente se o lead verbalizar benefício/próximo passo. |
| Link da gravação/transcrição | URL | Pós-Discovery | Link válido; acesso interno restrito. |
| Link do dossiê/pasta do caso | URL | Onboarding | Um único dossiê-mãe por família/caso. |

## 3. Listas para a aba LISTAS_BASE

### Nacionalidades
Italiana
Portuguesa
Espanhola
Alemã
Austríaca
Polonesa
Húngara
Luxemburguesa
Croata
Romena
Europeia geral
Em investigação
Outra UE — validar antes de ofertar

### Origem do lead
Diagnóstico rápido site
Diagnóstico profundo site
WhatsApp orgânico
Instagram
Indicação
Google orgânico
Google Ads
Evento
Parceiro
Base antiga
Outro

### Status da call
Agendada
Confirmada
Realizada
Remarcada
No-show
Cancelada pelo lead
Cancelada pelo Clube

### Etapa do funil
Novo lead
Triagem
Discovery agendada
Discovery realizada
Diagnóstico em elaboração
Proposta enviada
Negociação
Contrato enviado
Contrato assinado
Pagamento inicial confirmado
Onboarding
Perdido
Nutrição
Encerrado sem aderência

### Elegibilidade preliminar
Forte
Provável
Possível com pesquisa
Baixa
Inconclusiva
Sem aderência atual

### Via jurídica preliminar
Descendência/jus sanguinis
Reparação histórica
Linha materna judicial
Memória Democrática
Descendência direta
Recuperação de nacionalidade
Naturalização/residência
Via familiar
Via a confirmar
Sem via identificada

### Status da via
Aberta
Aberta com requisito específico
Aberta com prazo
Restrita
Encerrada para novos pedidos
Em confirmação jurídica
Não aplicável

### Complexidade documental
Baixa
Média
Alta
Muito alta

### Estado documental inicial
Documentos-chave disponíveis
Documentos parciais
Só informações orais
Árvore/nomes sem certidões
Sem dados suficientes

### Resultado da Discovery
Avançar para diagnóstico
Avançar para proposta
Solicitar documentos
Pesquisa prévia
Nutrição
Sem aderência
Encerrar

### Próxima ação
Confirmar call
Enviar checklist
Solicitar documentos
Revisar documentos
Preparar diagnóstico
Enviar proposta
Cobrar retorno
Enviar contrato
Confirmar pagamento
Iniciar onboarding
Encerrar
Outro

### Resultado comercial / perda
Convertido
Em negociação
Perdido — preço
Perdido — elegibilidade
Perdido — documentos
Perdido — timing
Perdido — sem retorno
Perdido — concorrente
Nutrição
Em aberto

## 4. Regras de dependência e bloqueio

1. **SKU recomendado** só pode ser preenchido após `Produtos/serviços recomendados` e deve usar apenas SKU com status ATIVO na Planilha Mestre.
2. `Resultado comercial = Convertido` exige: contrato assinado, pagamento inicial confirmado e link do dossiê/pasta.
3. `Etapa do funil = Contrato assinado` exige contrato ou link correspondente.
4. `Etapa do funil = Onboarding` exige pagamento inicial confirmado.
5. `Resultado comercial = Perdido` exige motivo de perda.
6. `Status da call = Realizada` exige resultado da Discovery e próxima ação.
7. `Elegibilidade preliminar = Forte/Provável` exige via jurídica preliminar, geração do ascendente e estado documental inicial.
8. `Status da via = Encerrada para novos pedidos` impede proposta de assessoria de protocolo para aquela via; permitir apenas diagnóstico, pesquisa de alternativas ou nutrição.
9. `Status de despesas de terceiros = Aprovadas` deve registrar estimativa e responsável pagador. Não registrar como pagamento/desembolso do Clube.
10. `Consentimento de gravação = Não` bloqueia a inclusão de link de gravação/transcrição.
11. Para família: um `Link do dossiê/pasta do caso` pode ser compartilhado; cada requerente deve ter registro individual no CRM com seu vínculo ao núcleo.

## 5. Formatação condicional recomendada

- Etapa do funil “Contrato assinado”, “Pagamento inicial confirmado” ou “Onboarding”: verde.
- “Proposta enviada” e “Negociação” sem próxima ação vencida: amarelo.
- “No-show”, “Perdido” ou próxima ação atrasada: vermelho suave.
- Elegibilidade “Forte” ou “Provável”: verde.
- Elegibilidade “Inconclusiva” ou “Possível com pesquisa”: amarelo.
- Elegibilidade “Baixa” ou “Sem aderência atual”: vermelho suave.
- Status da via “Aberta com prazo”, “Restrita”, “Encerrada para novos pedidos” ou “Em confirmação jurídica”: amarelo/vermelho conforme criticidade.
- Complexidade “Alta” ou “Muito alta”: laranja.
- Status de despesas “Aguardando aprovação” ou “Pendência do cliente”: amarelo.
- Próxima ação vencida: vermelho.

## 6. Mapeamento para o Painel de Calls atual

Manter o comparativo de cidadanias como referência jurídica. Criar/usar uma aba `LISTAS_BASE` na mesma planilha para as listas de dropdown e ampliar a aba operacional de Calls com os campos comerciais acima. O comparativo jurídico deve alimentar a triagem, mas não deve substituir o cadastro operacional do lead.

## 7. Critérios de aceite da implementação

- Todas as colunas classificatórias usam dropdown e rejeitam entrada livre.
- Campos de texto livre permanecem apenas para resumo da call, observações, narrativa familiar e links.
- Nenhum SKU, preço ou link Asaas é digitado livremente no Painel de Calls.
- Nenhuma despesa de terceiro é lançada como caixa do Clube ou reembolso.
- Todo lead ativo possui responsável, etapa do funil e próxima ação datada.
- Todo caso convertido possui contrato, pagamento inicial e um único link de dossiê-mãe.
