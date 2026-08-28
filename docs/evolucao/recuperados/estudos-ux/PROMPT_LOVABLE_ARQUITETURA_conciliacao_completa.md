Destino: Lovable — projeto Clube Ancestral (https://soul-ancestry.lovable.app)
Contexto: a auditoria read-only já feita confirmou que existem duas superfícies (o mockup rico em
desk-app.tsx/cliente-mockup.tsx, e o app real conectado em _authenticated/*/portal/*), e levantou 3
alegações de código que ainda não foram confirmadas visualmente em sessão real: Radar Interno
equivalente a /qualidade, Radar de prioridade em painel-dia.tsx/casos.index.tsx, e Alertas derivados
sem tela própria localizada. Este prompt fecha essas confirmações, executa o que ainda não rodou do
pré-lançamento, e registra formalmente (sem implementar ainda) o plano de reconciliação da arquitetura
para depois do lançamento.

Modo de execução obrigatório: EXECUTE. Nada de plano ou resumo sem teste real. Cada item abaixo precisa
terminar em PASSOU (com evidência: URL, print, horário) ou FALHOU (com causa). Não reorganizar menu,
não mover rota, não consolidar abas neste prompt — isso fica para depois do lançamento e depende de
decisão explícita da proprietária.

Escopo e proibições
- Ambiente: https://soul-ancestry.lovable.app. Conta proprietária: tati@pluggedresearch.com.
- Não alterar dado real de cliente, contrato, catálogo, preço, DNS ou integração externa.
- Não remover, renomear ou mover nenhuma rota nesta rodada — só confirmar e registrar.
- Não criar telas novas neste prompt (isso é parte do plano de fase 2, não desta execução).

────────────────────────────────────────

FASE 1 — Confirmações visuais pendentes (bloqueiam a leitura de "o que já existe")

1. Login logado como equipe interna, abrir /qualidade. Comparar com o componente RadarInterno do
   mockup (desk-app.tsx, linha ~814): mostra o mesmo quadrante elegibilidade × urgência, ou é uma lista
   de qualidade diferente? Reportar print de ambos lado a lado.
2. Login logado como equipe, abrir Painel Hoje e Casos 360. Confirmar visualmente se o "radar de
   prioridade" citado (via src/lib/prioridade-matriz.ts) aparece como sinal reconhecível — não como
   suposição de código. Reportar print.
3. Localizar onde src/lib/alertas-derivados.ts é de fato consumido por algum componente de UI. Se não
   houver nenhuma tela que renderize esse dado, reportar isso como lacuna real de superfície (não como
   "implementado, só sem nome de aba") — a distinção importa para priorização.

────────────────────────────────────────

FASE 2 — Itens de pré-lançamento ainda não confirmados nesta conversa

4. Login da proprietária: sessão limpa (sem cache, outro dispositivo/rede se possível), validar em
   ordem: login → /painel → reload → /modo-proprietaria → nova aba → /equipe. Reportar status de cada
   etapa.
5. Paleta de marca: confirmar que :root está com os valores novos (--navy #2F4B6E, --gold #FCB73A,
   --terracotta #9A3A2F) aplicados sem mistura com a paleta antiga em nenhuma tela real (não mockup).
   Registrar o aceite formal da paleta nova como padrão definitivo, com data e responsável.
6. Vazamento de UI interna: login real como cliente via link mágico (caso real ou de teste marcado
   como tal), navegar todas as rotas /portal/*, confirmar ausência de qualquer rótulo "(interno)",
   alternância Desk/Cliente ou seletor de "caso modelo".
7. Dado demo vs. real: listar os casos hoje existentes no ambiente de produção com classificação
   mock/seed/caso-modelo/real, e confirmar que nenhum caso demo é acessível a um cliente autenticado
   real, nem nenhum caso real está marcado como demo.

────────────────────────────────────────

FASE 3 — Registro formal da matriz de reconciliação (documentar, não implementar)

8. Criar um documento em docs/governanca/ (mesmo padrão dos documentos já existentes no projeto)
   chamado MATRIZ_MOCKUP_VS_PRODUCAO_v1.0.md, registrando para cada uma das 14 abas do mockup: existe
   em produção? em que rota? no menu ou órfã? Use como base os achados já confirmados nas Fases 1 e 2.
9. Registrar as divergências entre os 7 grupos de menu reais hoje (Visão geral, Comercial, Casos e
   núcleos, Pesquisa genealógica, Contratos e financeiro, Governança e biblioteca, App Cliente) e a
   arquitetura de 8 áreas proposta anteriormente (Hoje, Comercial, Casos, Cliente, Financeiro,
   Operação, Governança, + menu administrativo) — sem aplicar nenhuma mudança, só documentar o
   comparativo lado a lado.
10. Não propor decisão sobre qual arquitetura adotar — isso é decisão da proprietária, a ser tomada
    depois do lançamento, com o documento da Fase 3 como base.

────────────────────────────────────────

Aceite deste ciclo: reportar cada um dos 10 itens como PASSOU (com evidência) ou FALHOU (com causa).
Só os itens 4, 5, 6 e 7 (Fase 2) são bloqueadores reais de lançamento. Os itens 1, 2, 3 (Fase 1) e
8, 9, 10 (Fase 3) são para dar clareza factual à proprietária, mas não impedem o lançamento do app
real e mais simples — a decisão já tomada é: lançar o Desk de 7 grupos e o App Cliente de 4 abas como
estão, e tratar a reconciliação com o mockup como o primeiro item da fila pós-lançamento.
