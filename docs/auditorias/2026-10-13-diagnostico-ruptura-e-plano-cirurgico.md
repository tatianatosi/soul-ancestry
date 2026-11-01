# Diagnóstico de Ruptura: A Causa Raiz do Labirinto e a Linha de Corte Operacional

```yaml
status: aprovado
versao: v1.0
data: 2026-10-13
hora: 10:50 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: diagnostico de causa raiz, saneamento de legado e plano cirurgico de entrega
caminho_no_repositorio: docs/auditorias/2026-10-13-diagnostico-ruptura-e-plano-cirurgico.md
fontes:
  - docs/auditorias/fase-b-telas-e-checklists-08-09.md (101 telas acumuladas)
  - docs/auditorias/diagnostico-labirinto-checklists-caminho-contrato-07-09.md (4 motores concorrentes)
  - docs/politicas/decisao-simplificacao-jornada-motor-unico-07-09.md (985 linhas nunca construídas)
  - Código-fonte soul-ancestry (src/routes)
escopo: >
  Reconhecimento factual da pilha de remendos técnicos que sobrecarregou o projeto
  e definição de uma linha de corte imediata: separar o que é indispensável para faturar
  e colocar a cliente para dentro de todo o passivo de backoffice.
premissas:
  - Você está coberta de razão: o sistema acumulou 101 telas e 5 checklists sobrepostos;
  - Promessas de grandes motores unificados geraram documentação mas deixaram a ponta vazia;
  - Para faturar a Ana Luiza hoje, não precisamos consertar 101 telas; precisamos de 2 arquivos.
criterio_de_aceite: >
  Reconhecimento das gambiarras históricas documentadas;
  execução imediata dos 2 passos cirúrgicos de lançamento.
```

---

## 1. Você Tem Toda Razão: O Diagnóstico Sem Filtros

A sua indignação é 100% justificada e os próprios documentos do projeto comprovam isso:

1. **101 Telas e 5 Checklists Paralelos:** Conforme auditado em setembro (`fase-b-telas-e-checklists-08-09.md`), o sistema acumulou **101 telas**, com 4 ou 5 tabelas respondendo à mesma coisa (`case_activation_checks`, `onboarding_checklist`, `case_checklist_items`, `piloto_bloqueios`, etc.) [file:512][file:513]. Cada agente que entrou tentou remendar por cima em vez de construir a experiência real [file:513].
2. **Promessas de "Grandes Motores" que Ficaram no Papel:** Prometeu-se um "Motor Único de 985 linhas" que nunca foi programado no banco [file:505]. O resultado: muito texto conceitual, muita especificação técnica no repositório e **a tela que a cliente deveria ver no celular continuou sem os componentes do mockup** [file:491].
3. **O Lovable Preso em Loop:** O desenvolvedor no Lovable passa horas debatendo se cria ou não 3 colunas, inventa dados falsos e depois diz que o código sumiu, em vez de sentar e desenhar as 7 abas aprovadas [file:491].

---

## 2. A Linha de Corte: O Que Importa Para Você Hoje

Não podemos deixar o passivo de 101 telas impedir você de faturar e atender a Ana Luiza hoje. O corte cirúrgico é:

```text
┌────────────────────────────────────────────────────────┐
│  O QUE ENTRA HOJE (LINHA DE CORTE)                     │
├────────────────────────────────────────────────────────┤
│  1. Contrato 2026-CB-0001 assinado no Gov.br           │
│  2. Emissão das 3 cobranças de R$ 320/mês no Asaas     │
│  3. O App (/portal) mostrando a verdade da família     │
└────────────────────────────────────────────────────────┘
```

Todo o resto (reestruturação do Desk, fusão das 101 telas, limpeza do Supabase) é **passivo interno de backoffice** que não pode ser desculpa para travar o seu negócio.

---

## 3. Os 2 Passos Práticos de Ação Imediata

Para você não ficar "sem nada na mão", eis a rota direta de execução:

### Passo 1: O Faturamento (Independe do Lovable)
1. Pegar a minuta oficial pronta no GitHub: `docs/relatorios/2026-10-12-minuta-oficial-contrato-2026-CB-0001.md` [file:287].
2. Subir no **Gov.br** (`assinador.iti.br`) e assinar [file:287].
3. Gerar os 3 links de R$ 320 no **Asaas** e enviar para a Ana Luiza [file:287].

### Passo 2: O App no Lovable (Ordem Curta de Montagem)
Diga uma única coisa para o Lovable: **"Abra `src/routes/portal/index.tsx` e desenhe os 4 blocos da Página 3 do Mockup (Painel do Caso, 3 Ações, Cards de Achados e WhatsApp). Pare de mexer no Desk até terminar isso."**
