# Decisão Soberana da Proprietária: Homologação do Modelo B e Transição para Modelo A

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:59 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: decisao de arquitetura contratual, esteira de formalizacao e autorizacao de pr
caminho_no_repositorio: docs/arquitetura/2026-10-12-decisao-modelo-contrato-aceite-e-transicao.md
fontes:
  - Instrução Soberana da Proprietária (12/10/2026 23:06 BRT)
  - docs/relatorios/2026-10-12-minuta-oficial-contrato-2026-CB-0001.md
  - Lei Federal nº 14.063/2020 e MP nº 2.200-2/2001
escopo: >
  Registro formal das respostas às duas indagações técnicas sobre a formalização do primeiro cliente:
  (1) Definição do status de aceite do contrato sem deturpar efeitos contábeis;
  (2) Autorização para abertura de PR em draft para o Modelo B sem merge prévio.
premissas:
  - Para a primeira cliente (Ana Luiza), adota-se o Modelo B (Aceite Formal com Assinatura Gov.br);
  - O Modelo A (Automação completa via Portal) será desenvolvido na esteira regular pós-faturamento.
criterio_de_aceite: >
  Definição do registro de aceite como 'accepted_by_client' (ou signed com signed_source = 'gov_br');
  autorização da PR em draft isolada sem merge.
```

---

## 1. Respostas Oficiais às Duas Perguntas de Arquitetura

Conforme a deliberação da Proprietária, ficam estabelecidas as diretrizes técnicas:

### Resposta 1: Como o Aceite no Portal Deve Ser Gravado
- **Decisão:** **NÃO gravar falsamente como assinatura cartorária interna sem prova documental.**
- **Solução Canônica:**
  - O contrato oficial deste caso será assinado pela Ana Luiza no **Gov.br** (`assinador.iti.br`) [file:287].
  - Portanto, o campo `status` da tabela `contracts` deve ser gravado como **`signed`**, com `signed_source = 'gov_br'` e `signed_at = NOW()` assim que o PDF chancelado for recebido [file:287].
  - Para o botão de aceite prévio no portal (`/portal/proposta`), caso você queira habilitar o clique digital preliminar, o status no banco deve usar o campo existente `client_approval_status = 'approved'` (sem criar migration arriscada nesta noite), mantendo `status = 'pending_signature'` até o upload do PDF do Gov.br [file:287].

---

### Resposta 2: Autorização da PR em Draft para o Modelo B
- **Decisão:** **AUTORIZADA a implementação do Modelo B em branch isolada e Pull Request em DRAFT.**
- **Condições Estritas:**
  - O branch deve ser aberto a partir de `main` (ex.: `feature/aceite-modelo-b-portal`) [file:287].
  - **Fica proibido o auto-merge em `main`** nesta noite para garantir que a esteira de produção e a suíte de 5.398 testes continuem intocadas [file:287].
  - O código do Modelo B servirá para homologação em preview e homologação visual calma após o faturamento matinal da Ana Luiza [file:287].

---

## 2. Roteiro Prático de Fechamento Comercial Matinal (Dia D)

Com essa decisão registrada, o caminho para o seu faturamento de amanhã está 100% blindado:

1. **Assinatura Gov.br:** Você sobe o PDF do contrato `2026-CB-0001` no `assinador.iti.br`, assina com sua conta Gov.br (Prata/Ouro) e envia o PDF para a Ana Luiza assinar [file:287].
2. **Cobrança Asaas:** Você gera as **3 assinaturas de R$ 320,00/mês** no Asaas e envia os 3 links individuais [file:287].
3. **App do Cliente:** Você envia o link público oficial (`https://soul-ancestry.lovable.app/portal`), onde ela já acessa a régua de 10 etapas a 60% e a árvore genealógica de Otto Reimer [file:287].
