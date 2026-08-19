# Matriz de Gates e Fontes de Verdade v1.0

## Princípio

A fonte de verdade varia por domínio. Nenhuma tela, proposta, link de pagamento ou dado local substitui a fonte formal adequada. Quando fontes divergem, o estado é `BLOQUEADO_POR_RECONCILIACAO`.

| Gate | Condição de entrada | Fonte de verdade | Evidência mínima | Bloqueia se ausente | Saída permitida |
|---|---|---|---|---|---|
| G-01 Identidade do caso | Caso e participantes identificados. | Desk/Supabase após validação operacional. | ID canônico, alias histórico, pessoas e vínculos. | Documento, CRM e app. | Onboarding controlado. |
| G-02 Dados familiares | Vínculos e representação documentados. | Dados familiares com consentimento e RLS. | Papel, parentesco, responsável legal e finalidade. | App, contrato e compartilhamento. | Visibilidade contextual. |
| G-03 Proposta | Oferta aprovada e versionada. | Proposta aprovada + registro comercial. | Versão, aceite, escopo e validade. | Contrato e pré-carga. | Preparação contratual. |
| G-04 SKU/preço | Produto e condição reconciliados. | Catálogo e fonte financeira aprovados. | SKU, preço, parcelas, escopo e status. | OS, Asaas e automação. | Cobrança contextual. |
| G-05 Contrato | Base jurídica e campos completos. | Instrumento aprovado pelo jurídico. | Dados institucionais, cláusulas, assinatura e anexos. | Ativação e cobrança. | Assinatura. |
| G-06 Cobrança | Contrato e condição aprovados. | Asaas somente após G-04 e G-05. | Customer, produto, valor, vencimento e trilha. | Início condicionado ao pagamento. | Cobrança/pagamento. |
| G-07 Pesquisa/despesas | Gatilho contratual e autorização presentes. | Contrato, anexos e autorização específica. | Escopo, consentimento e despesa/pesquisa identificada. | Pesquisa externa e despesas. | Execução autorizada. |
| G-08 App/Desk | Conteúdo sanitizado e acesso correto. | Dados operacionais aprovados + política de acesso. | Finalidade, minimização, perfil e log. | Exibição ao cliente e compartilhamento. | Publicação contextual. |

## Regras por fonte

- **GitHub:** fonte de verdade técnica do código, rotas, migrations, documentação e histórico versionado.
- **Supabase/migrations:** fonte de verdade técnica do schema evolutivo, não substituída por mockup.
- **Fonte comercial aprovada:** define preço, condição e vigência; não pode ser presumida a partir de Asaas ou componente.
- **Instrumento jurídico aprovado:** define contrato, assinatura e anexos; não pode ser inferido por template.
- **Desk/CRM validado:** fonte operacional de caso, status e tarefas, após decisão de operação.
- **Canva/proposta:** evidência de apresentação/aceite quando identificada; não cria SKU ou preço canônico isoladamente.
- **Mockups e `src/data/`:** evidência de interface/configuração até classificação explícita; não são dados vivos por padrão.
