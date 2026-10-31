# Contrato da Ana: validade da proposta e rascunho interno v5

## Passos
1. **Validade da proposta:** mudar a validade da proposta Canva da Ana (v1, aprovada) de 30/10/2026 para **30/11/2026**, como você decidiu. Uso a edição de proposta que já existe no App, entrando como você, para ficar registrado no histórico. Só a data muda: número da versão, escopo e páginas continuam iguais.
2. **Rascunho interno v5:** gerar pelo mesmo botão "Salvar rascunho", com o selo padrão "RASCUNHO INTERNO — NÃO ENVIAR / NÃO ASSINAR". Nada vai para a família, nada é aprovado para envio nem assinado.
3. **Conferir:**
   - o aviso "Proposta Canva expirada" sumiu;
   - a v5 não traz mais 4.800 e traz 3.200, nas três linhas por pessoa, junto com R$ 9.600 e 10x de R$ 320.

## Observação
Assim como na v3 e na v4, a v5 passa a ser a versão atual do contrato.

## Detalhes técnicos
- Campo: `proposals.validade` (id `abb12c85-…`). Se não existir no App uma ação que edite a validade, faço uma atualização pontual só desse campo, com nota de origem e autor, e aviso você.
- Depois: `gerarRascunhoInterno` e a mesma consulta de verificação de antes, olhando a última versão.
