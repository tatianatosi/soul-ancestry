# Prompt de Ajustes Finos de UX/UI: Microinterações, Microcópia e Paridade Mobile-Desktop

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 18:15 BRT
responsavel_pela_decisao: Proprietária do Clube Ancestral
classificacao: prompt de refinamento cirúrgico de frontend, tokens CSS e microinterações
caminho_sugerido_no_repositorio: docs/prompts/2026-10-12-prompt-lovable-ajustes-finos-app-cliente.md
fontes:
  - relatorio-divergencias.md (Auditoria de Paridade Visual e Semântica)
  - clubeancestralmockup.pdf (Mockup de Referência Aprovado - 17 páginas)
  - comparativo-referencia-atual-375-1280.pdf (64 páginas de capturas)
escopo: >
  Instruções cirúrgicas de microinterações, espaçamentos (paddings/gaps), contrastes WCAG,
  comportamento de scroll e acabamento visual nas 7 abas do App Cliente.
premissas:
  - O prompt de elevação estrutural já definiu as cores e arquitetura de abas.
  - Este prompt foca exclusivamente no polimento fino (toque, densidade, microcópia e transições).
criterio_de_aceite: >
  Alvos de toque em 44x44px em todos os elementos clicáveis;
  contraste ouro/fundo ajustado para conformidade de leitura;
  animações suaves de transição entre abas (fade/slide sutil de 200ms);
  fixação perfeita do rodapé de 7 abas em telas mobile pequenas (375px).
```

---

## Texto do Prompt de Ajustes Finos para Colar no Lovable

```markdown
REFINAMENTO CIRÚRGICO DE INTERFACE: AJUSTES FINOS DE ACABAMENTO, MICROCÓPIA E RESPONSIVIDADE

Atenção Lovable: Com a estrutura e identidade visual alinhadas, execute agora o polimento fino de alta costura digital nas 7 abas do App Cliente, respeitando as métricas abaixo:

---

### 1. Polimento de Tokens e Contraste Tipográfico
- [CONTRASTE E LEGIBILIDADE]: Onde o dourado (#C9A84C) for aplicado sobre o fundo creme (#F5F0E8), escureça suavemente o tom para ouro envelhecido (#A88434) em textos pequenos e bordas finas para assegurar legibilidade nítida.
- [SOMBRAS E BORDAS]: Elimine qualquer borda escura residual de 1px solta. Utilize bordas sutis com `border: 1px solid rgba(27, 43, 75, 0.08)` e elevação suave `box-shadow: 0 4px 16px rgba(27, 43, 75, 0.04)`.

---

### 2. Rodapé de Navegação Mobile (375px) e Alvos de Toque
- [ALVOS DE TOQUE 44PX]: Todos os 7 ícones/botões do menu inferior devem possuir área interativa mínima de 44x44px com `touch-action: manipulation`.
- [PROTEÇÃO CONTRA QUEBRA DE TEXTO]:
  - Em telas estreitas (<= 375px), utilize rótulos compactos otimizados:
    - Home | Jornada | Radar | Árvore | Docs | Legado | Conta.
  - O texto "Jornada" deve permanecer com `white-space: nowrap` e `font-size: 11px`, garantindo que NUNCA quebre ou sobreponha o ícone superior.
- [SAFE AREA]: Garanta `padding-bottom: env(safe-area-inset-bottom, 16px)` no rodapé fixo para acomodar perfeitamente a barra inicial de iPhones e Androids.

---

### 3. Ajustes Finos por Aba

#### Aba 3: Radar Ancestral
- Ajuste a proporção do gráfico de teia (Radar): em vez de um gráfico minúsculo cercado de espaços vazios, amplie a área do polígono SVG para ocupar 70% da largura útil do card.
- Na legenda dos 6 eixos (Origem, Conexões, Documentação, etc.), utilize pílulas sutis com o percentual consolidado e toque para expandir a explicação.

#### Aba 5: Legado & Acervo
- Substitua placeholders genéricos por cartões de narrativa histórica ("A Travessia do Atlântico", "Memórias da Estíria", "Registros de Sobrevivência").
- Adicione selo sutil de curadoria editorial: "Curadoria Genealógica Clube Ancestral".

#### Aba 6: Minha Conta
- Ajuste a densidade do card de plano/membro: organize os dados em grid limpo (Titular, Caso Ativo, Modalidade, Status da Pesquisa).
- Adicione botão sutil e direto para "Falar com a Especialista no WhatsApp" com o verde institucional discreto e ícone elegante.

---

### 4. Transições e Sensação Tátil
- Aplique uma transição fluida de 200ms (`ease-out`) na troca entre as abas e ao abrir os cartões expansíveis, eliminando qualquer pulo abrupto de layout (layout shift zero).
```
