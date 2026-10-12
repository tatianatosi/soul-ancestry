# Correções visuais finais e homologação do caso Ana Luiza

## Estado confirmado
- O Heatmap já reserva espaço inferior e lateral (`mb-24` e `md:mr-40`), enquanto o Assistente fica fixo no canto inferior direito e oculto abaixo de `md`; a validação visual decidirá se ainda existe sobreposição real.
- A legenda técnica “Radar · média dos eixos com base” não existe mais no código da Jornada; a tela já usa orientações voltadas à família.
- O aviso legal padrão já é renderizado na aba Legado, inclusive quando não há Encontros de Linhagem publicados.
- A Conta já exibe “Condição familiar: 3 assinaturas / parcelas mensais” para a assinatura de R$ 320 do caso canônico, mantendo a condição como prevista.
- A rota administrativa solicitada abre as sete telas sanitizadas do App Cliente, mas não contém hoje uma ficha civil nem o `CaseHealthHero`; esse elemento existe no Caso 360 do Desk. Portanto, a evidência da ficha civil nessa rota está atualmente **NAO_LOCALIZADO** e não será fabricada.

## Implementação
1. Validar o Heatmap em desktop e 375 px com o Assistente fechado e aberto. Se houver sobreposição, ajustar somente a reserva visual do Heatmap ou a posição do botão, sem tocar em dados ou comportamento.
2. Preservar a orientação humana já presente na Jornada e adicionar uma proteção focal para impedir o retorno da legenda técnica.
3. Preservar o disclaimer já existente no Legado e verificar sua presença nos estados com e sem encontros publicados.
4. Preservar o descritivo familiar já existente na Conta e verificar que ele aparece somente com a condição prevista de R$ 320 do caso canônico.
5. Navegar pela visão administrativa do caso Ana Luiza e registrar capturas factuais das telas disponíveis. A ficha civil/mascaramento será marcada **NAO_LOCALIZADO** se continuar ausente; não será criado Hero, rota, dado civil ou parentesco para satisfazer a captura.

## Validação e evidências
- Executar verificações focadas, tipos, testes relevantes e confirmar build verde.
- Gerar capturas em 375 e 1280 px do Heatmap, Jornada, Legado e Conta.
- Registrar separadamente a tentativa na rota administrativa com o resultado permitido: `PASSOU`, `FALHOU`, `BLOQUEADO_POR_DADO`, `BLOQUEADO_POR_DECISAO`, `ERRO_DE_FONTE` ou `NAO_LOCALIZADO`.
- As capturas do agente serão inspeção administrativa; a prova oficial continua exigindo ação e releitura pela Proprietária autenticada em sua própria conta.

## Limites
- Sem alterações em tabelas, schema, RLS, dados, regras de negócio, rotas, navegação, convites ou publicação.
- Sem alterar ou regenerar `src/integrations/supabase/types.ts` e sem tocar na RPC financeira.
- Esta mudança fortalece o produto único ao alinhar a apresentação das superfícies existentes, sem criar fonte, fluxo ou tela paralela.
