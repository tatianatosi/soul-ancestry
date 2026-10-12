# Conta familiar individualizada

## Interface
- Reorganizar somente `src/routes/portal/conta.tsx`.
- No perfil, mostrar nome do acesso, e-mail apenas quando já disponível; caso contrário, usar `Não registrado` em vez de inventar.
- Mostrar o papel somente quando o leitor sanitizado do núcleo o devolver; sem inferir Titular ou Signatário.

## Sua assinatura
- Destacar a assinatura publicada de R$ 320 por mês como modalidade individual e preservar a condição prevista enquanto não houver confirmação.
- Derivar `Em dia` ou `Pendente` exclusivamente da última fatura visível da pessoa autenticada; sem fatura confirmada, mostrar `Aguardando confirmação`.
- Abrir um painel sobre a própria página para listar somente as faturas/comprovantes já liberados ao acesso autenticado, sem integração externa ou redirecionamento.
- Em falha de conexão, manter o estado de rede com nova tentativa; nunca transformar erro em ausência.

## Seu núcleo familiar
- Consumir o leitor sanitizado já existente, que devolve apenas nome e papel dos participantes do mesmo caso.
- Exibir Ana Luiza, Adair, Alice e Felipe somente se forem devolvidos pelo leitor; a tag `Dependente / Menor` só aparece quando o papel recebido comprovar essa condição.
- Incluir a mensagem de governança familiar, sem CPF, documentos fiscais, e-mail ou outros dados civis dos familiares.

## Validação
- Conferir contraste, leitura e ausência de overflow em 375 px.
- Validar o painel de faturas abrindo e fechando sem sair da Conta.
- Conferir o diagnóstico automático da prévia.

## Limites
- Nenhum arquivo além de `src/routes/portal/conta.tsx` será alterado.
- Sem banco, SQL, regras de acesso, funções de servidor, Asaas, cobrança, publicação ou dados fabricados.
