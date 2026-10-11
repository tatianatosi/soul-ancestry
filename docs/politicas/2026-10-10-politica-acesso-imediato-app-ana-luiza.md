# Política de Acesso e Liberação do App Cliente: Caso Canônico Ana Luiza

Status: aprovado
Versão: v1.0
Data: 2026-10-10
Responsável pela decisão: Proprietária do Clube Ancestral
Fonte: Documentos Normativos CA-10A1, CA-EVO-05A, Supabase Schema (`client_portal_case_access`), RLS Policies
Substitui: N/A

---

## 1. Princípio da Precedência do Pré-Onboarding sobre o Faturamento
Conforme expressamente homologado nos documentos canônicos do Clube Ancestral (**CA-10A1 Entrega 3** e **CA-EVO-05A Seção 1.2**):
1. **O Aceite Formal da Proposta / Assinatura Contratual é o Gatilho de Acesso**:
   - O aceite escrito formal e a assinatura do contrato autorizam a liberação imediata da estrutura de pré-onboarding e da visualização da jornada no App Cliente.
2. **Independência do Primeiro Pagamento para Acesso Inicial**:
   - A compensação do primeiro pagamento (seja no próximo mês via fatura de cartão de crédito, seja em data futura de corte financeiro) **não bloqueia o acesso consultivo e cadastral ao App Cliente**.
   - O que o primeiro pagamento efetivamente bloqueia são **custos externos e desembolsos operacionais** (pesquisas em arquivos austríacos como MA 35/Kriegsarchiv, emissão física de certidões, apostilamento e traduções juramentadas).
   - O acesso ao portal (árvore familiar, checklist documental inicial, radar público e linha do tempo) pode e deve ser liberado imediatamente após o aceite/assinatura.

---

## 2. Estrutura do Núcleo Familiar Canônico (3 Perfis / 3 Assinaturas)
O caso familiar da Ana Luiza possui 3 participantes titulares ativos com condições comerciais e acessos próprios:

| Participante | Papel no Caso | Condição Comercial | Acesso ao Portal (`client_portal_case_access`) | Visibilidade no App |
| :--- | :--- | :--- | :--- | :--- |
| **Ana Luiza** | Contratante Principal / Requerente | Assinatura 1: R$ 320/mês | Perfil Titular Principal + Dependente (Felipe) | Faturas do caso, radar, árvore completa, envio de documentos e jornada. |
| **Adair Pinto** (Pai) | Requerente Familiar | Assinatura 2: R$ 320/mês | Perfil Titular Individual | Radar familiar, árvore genealógica e documentos próprios. |
| **Alice Gomes** (Irmã) | Requerente Familiar | Assinatura 3: R$ 320/mês | Perfil Titular Individual | Radar familiar, árvore genealógica e documentos próprios. |

*Observação sobre o Menor Felipe*: Vinculado como dependente da titular Ana Luiza, figurando na árvore apenas com o primeiro nome por proteção legal de menores.

---

## 3. Mecânica Técnica de Liberação Imediata
Para que os 3 membros tenham acesso imediato sem depender de webhook de liquidação do Asaas:
1. **Emissão de Convites / Magic Links**:
   - No Desk, através da tela `/acessos-portal`, gerar os convites de acesso vinculando cada um dos 3 e-mails ao caso `a11a0000-0000-4000-8000-000000000002`.
   - Isso popula a tabela `client_portal_case_access`, liberando as políticas de RLS das 7 abas do cliente (`/portal`).
2. **Comportamento da Aba Financeira (`/portal/conta`)**:
   - A aba exibirá a condição comercial de 3 assinaturas de R$ 320/mês no estado `aguardando primeira cobrança` ou `ativa`, permitindo a navegação plena nas abas de Jornada, Radar, Árvore e Documentos.
