# CA-IMPL-CRM-01 — CRM Diário, Governança Contratual e Piloto Ana

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Status:** entregue e validado tecnicamente  
**Repositório alvo:** `tatianatosi/soul-ancestry`  
**Escopo:** CRM/Desk diário, Painel Hoje, proposta Canva, dependentes, matriz jurídica, importação Placego, onboarding registrável e caso-piloto Ana Luiza.

---

## 1. Entregas confirmadas

### CRM/Desk diário

- Rota `/leads` com listas fechadas para campos classificatórios.
- Código automático para registros.
- Dois eixos de lifecycle: comercial e formalização/operação.
- Resultado comercial derivado.
- Discovery estruturada.
- Validações cliente/servidor para responsável, próxima ação, resumo validado, motivo de perda, link de contrato, referência Asaas e ativação de caso.
- Preço, SKU e link de pagamento removidos como campos livres.

### Painel Hoje

- Rota `/painel` com filas por criticidade:
  - ações vencidas;
  - pagamentos;
  - contratos;
  - onboarding;
  - registros sem responsável;
  - calls;
  - pendência documental.
- Funil, Discovery, origens e higiene operacional.

### Governança contratual

- Fonte canônica de preço: `product_catalog` homologado ou exceção aprovada.
- Proposta Canva como fonte obrigatória de escopo.
- Registro estruturado de páginas 1–7.
- Campos não localizados tornam-se pendência.
- Gate `completude_canva` bloqueia contrato, anexos e assinatura.
- Auditoria sanitizada de proposta/escopo.
- Painel de dependentes no preparo contratual.
- `case_dependents` com vínculo, representação, participação contratual, acesso App e anexo individual.
- Dependente só bloqueia quando participa de contrato, App ou anexo sem representação aplicável.
- Matriz jurídica interna com 12 temas e flags de bloqueio; nenhum texto de cláusula criado.

### Caso-piloto Ana

- Case ID: `CA-CID-AT-FAM-2026-001`.
- Alias histórico: `CA-AUT-ANALUIZA-FAM-2026-001`.
- Responsável: Tatiana Melani Tosi.
- Núcleo familiar configurado.
- Felipe configurado como dependente vinculado à Ana, com representação pendente e sem participação contratual/App/anexo inicial.
- Estado de formalização e bloqueios disponíveis no Desk.
- Template de onboarding registrável criado.

### Importação e qualidade

- Fluxos de importação Placego cobertos por teste.
- Cenários de aceite e métricas cobertos por teste.
- Typecheck limpo.
- 100 testes passando, incluindo cenários de proposta Canva, dependentes, matriz jurídica, importação, aceite e métricas.

---

## 2. Limites preservados

Nenhuma das ações abaixo foi criada ou executada:

- contrato ou cláusula jurídica final;
- Ordem de Serviço;
- pedido de assinatura;
- cliente, cobrança ou link Asaas;
- pasta, arquivo ou documento externo;
- pesquisa externa ou pedido institucional;
- comunicação externa;
- publicação no App Cliente;
- integração, API, webhook ou scraping.

---

## 3. Gates confirmados

| Gate | Resultado |
|---|---|
| Proposta Canva válida/completa | Obrigatória para preparação contratual |
| Páginas 1–7 | Obrigatórias e auditáveis |
| Campo não localizado | Gera pendência e bloqueio quando obrigatório |
| Proposta substituída/recusada/expirada | Bloqueia formalização |
| Preço homologado | Obrigatório para fluxo financeiro futuro |
| Dependente com representação pendente | Bloqueia apenas se houver contrato/App/anexo aplicável |
| Tema jurídico bloqueante pendente | Bloqueia assinatura |
| Onboarding | Bloqueado sem requisitos de formalização/pagamento |

---

## 4. Próximo corte

1. Navegação mobile e acesso a módulos.
2. Biblioteca de Evidências e Projeções.
3. Ficha Piloto Genealógica v1.1.
4. Catálogo de Bases Genealógicas 5B-Pre.
5. Achados e Encontros de Linhagem.
6. Plano de Ação de Pesquisa.
7. Radar, Marcos Jurídicos e Visão Geral ampliada.

---

## 5. Critério de encerramento

O corte CA-IMPL-CRM-01 é considerado encerrado tecnicamente porque:

- CRM e Painel Hoje funcionam com validações de servidor;
- gates contratuais estão conectados;
- piloto Ana está configurado e corretamente bloqueado;
- testes estão verdes;
- nenhuma ação externa foi disparada.
