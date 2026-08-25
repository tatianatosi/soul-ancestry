# Clube Ancestral — Adendo CA04: Integrações, Biblioteca de Evidências e Fontes Genealógicas

**Versão:** 1.0  
**Data:** 19 de agosto de 2026  
**Complementa:** CA04 — CRM Mestre, Discovery e Handoff  
**Status:** decisão de arquitetura e integração gradual  
**Não altera:** a separação entre Painel de Calls, CRM, Desk, dossiê, App Cliente e fontes transacionais.

---

## 1. Objetivo

Atualizar CA04 para incluir a camada de Biblioteca de Evidências, Catálogo de Fontes Genealógicas, Projeções Cliente-facing e preparação de integrações do Bloco 5B sem iniciar APIs, scraping, consultas externas ou automações.

---

## 2. Ajustes a CA04

### 2.1 Fonte de verdade para pesquisa

| Camada | Papel |
|---|---|
| Catálogo de Fontes | Governança de base, termos, risco e modo de uso |
| Biblioteca de Evidências | Normalização de fonte/material, evidência, estado e confiança |
| Desk/Pesquisa | Caso, pessoa, relação, evento, linhagem, pendência, achado e plano de ação |
| App/One-page/PDF | Apenas projeção sanitizada aprovada |

### 2.2 Dados de pesquisa

Campos internos de pesquisa devem ter:

- estado epistemológico;
- nível de confiança;
- responsável pela validação;
- data de validação;
- tipo documental;
- país/localidade;
- classificação de acesso;
- exigência de consentimento;
- status de retenção;
- destinos de visibilidade permitidos.

### 2.3 Busca negativa

Busca negativa é evidência válida, não falha descartável. Deve registrar fonte consultada, data, pessoa/objetivo, resultado negativo e próxima fonte/ação alternativa.

### 2.4 Variantes de nome

Variante de nome é entidade própria e pode ligar pesquisa, pessoa, evidência e fonte. Não pode criar automaticamente nova pessoa.

### 2.5 App Cliente

App Cliente não acessa Desk, fontes, documentos, árvore interna, hipóteses, riscos, score, logs ou dados de terceiros. Ele recebe somente `app_projections` ou `client_deliverables` com aprovação humana.

---

## 3. Integração gradual 5B

### 3.1 5B-Pre — pode ser implementado

- Catálogo de fontes.
- Matriz de avaliação.
- Backlog de ativação por fonte.
- Status de maturidade.
- Logs de acesso futuros vazios.
- Vínculo fonte → pesquisa/evidência/tarefa.
- Dicionário de modos de uso.

### 3.2 5B-1 — piloto por fonte

Somente depois de decisão humana por fonte:

- Termos e licença conferidos.
- Finalidade definida.
- Dados pessoais avaliados.
- Campos mínimos de consulta definidos.
- Backend isolado.
- Autenticação segura.
- Rate limit/cache/retenção.
- Revisão humana obrigatória.
- Piloto interno registrado.

### 3.3 5B-2 — operação homologada

Somente fontes homologadas podem receber integração permitida. Todo resultado entra como evidência inicial, nunca como conclusão jurídica ou publicação ao cliente.

---

## 4. Segurança e política técnica

- Scraping proibido por padrão.
- Fonte aberta não equivale a uso automatizável.
- API não é ativada sem termos, teste e homologação.
- Nunca integrar diretamente ao front-end.
- Toda integração futura precisa de backend, logs, cache, rate limit e revisão humana.
- Nenhuma fonte externa é exibida diretamente ao cliente.

---

## 5. Decisões pendentes humanas

1. Quais fontes entram na primeira onda de documentação por país.
2. Quem homologa termos, licenças e modo de uso.
3. Política de retenção/cache por tipo de fonte.
4. Critério de escolha da primeira fonte piloto.
5. Responsável técnico e responsável de pesquisa por integração.
6. Condições para promoção de fonte de `PILOTO_INTERNO` para `HOMOLOGADA_API`.

---

## 6. Critérios de aceite

- CA04 preserva seus princípios de separação de camadas.
- Biblioteca de Evidências é reconhecida como camada canônica entre fonte e Desk.
- App só recebe projeção aprovada.
- 5B-Pre não realiza consulta externa.
- Integrações futuras ficam condicionadas a decisão, termo, backend e revisão humana.
