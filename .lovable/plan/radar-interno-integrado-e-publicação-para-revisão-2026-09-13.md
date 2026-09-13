# Radar Interno integrado e publicação para revisão

## Objetivo
Reproduzir no Desk a operação aprovada do Radar Interno: uma única tela com alternância entre a Matriz de Prioridade da carteira e o Radar Individual de cada caso, usando somente os dados reais e motores já existentes.

## Implementação
- Manter `/qualidade` como a tela canônica do Radar Interno, sem criar nova aba ou grupo de navegação.
- Transformar a matriz atual em uma leitura visual de urgência × elegibilidade/prioridade, preservando as regras e classificações já calculadas pelo motor.
- Adicionar a alternância “Matriz de Prioridade” / “Radar Individual”, como no mockup da página 15.
- Na visão individual, permitir escolher um caso ativo e carregar os quatro eixos internos já existentes: História, Documentos, Estratégia e Próximos.
- Mostrar junto ao radar individual a prioridade, urgência, responsável, prazo, próxima ação e bloqueios do mesmo caso, evitando a divergência hoje existente entre telas separadas.
- Manter registros demonstrativos identificados e nunca apresentá-los como reais.

## Validação e revisão
- Entrar com a conta da proprietária fornecida somente para esta validação, sem registrar ou expor a senha.
- Conferir a matriz, selecionar um caso, alternar para o Radar Individual e validar responsável, prazo, próxima ação e bloqueios.
- Capturar prints autenticados de estado inicial, alternância, caso selecionado e releitura.
- Publicar a versão atualizada no Lovable após a validação.
- Enviar o PDF comparativo já preparado, com versão anterior e atual lado a lado, junto dos novos prints para revisão.

## Limites
- Sem nova tabela, migration, integração, automação, taxonomia, grupo de navegação ou alteração no App Cliente.
- Sem alterar regras de prioridade, RLS, permissões, dados ou ações externas.
- A página 14 do arquivo recebido é Validação Jurídica; a referência operacional do Radar Interno é a página 15.