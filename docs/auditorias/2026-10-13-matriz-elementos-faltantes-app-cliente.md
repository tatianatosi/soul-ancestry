# Matriz de Elementos Faltantes no App Cliente vs. Mockup Normativo

```yaml
status: em revisão
versao: v1.0
data: 2026-10-13
hora: 10:15 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: auditoria de paridade, gap analysis visual e especificacao de implementacao do app
caminho_no_repositorio: docs/auditorias/2026-10-13-matriz-elementos-faltantes-app-cliente.md
fontes:
  - Mockup Normativo de 17 Páginas (clubeancestralmockup.pdf, Páginas 3 a 9)
  - Laudo de Homologação 7 Abas do Portal (laudo-homologacao-7-abas-2026-10-12-v4.pdf)
  - Relatório de Divergências de Paridade (relatorio-divergencias.md)
  - Capturas Atuais do Portal (10/10 a 13/10/2026)
escopo: >
  Levantamento exaustivo dos elementos de design, blocos narrativos e componentes
  que existem no mockup aprovado pela Proprietária mas continuam ausentes ou divergentes
  no App do Cliente, justificando a recusa do congelamento prematuro.
premissas:
  - O App não pode ser congelado enquanto sua experiência visual estiver incompleta perante o mockup;
  - A complementação deve focar estritamente na interface e experiência do cliente (/portal);
  - Componentes ausentes devem ser construídos sem criar dados fictícios de backoffice.
criterio_de_aceite: >
  Inventário das 7 abas com especificação exata do que falta para atingir a paridade
  integral com o mockup de 17 páginas.
```

---

## 1. Diagnóstico do Impasse: Por Que Não Congelar Agora

Você está coberta de razão: **não faz nenhum sentido decretar congelamento se o App do Cliente ainda não reflete a experiência contratada e aprovada no Mockup Normativo de 17 páginas** [file:491].

O desenvolvedor vinha tentando forçar um congelamento artificial amparado apenas em "testes técnicos verdes" e no pretexto de "não inventar dados", mas a auditoria visual detalhada revela que **a estrutura e a densidade de conteúdo do App estão drasticamente aquém do mockup das páginas 3 a 9** [file:491].

---

## 2. Inventário Exaustivo de Elementos Faltantes por Aba

Abaixo está o cotejo entre o que o Mockup Normativo exige e o que o Lovable deixou de fora [file:491]:

### 1. Home (Mockup p. 3 vs. Tela Atual)
- **Falta o Painel de Abertura do Caso:** O mockup não abre com uma tela vazia ou mensagem de ausência; ele abre direto com o **Painel do Caso**, trazendo a identificação nobre da família [file:491].
- **Faltam as 3 Próximas Ações Estruturadas:** A tela atual exibe apenas um texto genérico de ausência de ação. O mockup traz um bloco com 3 ações claras e acolhedoras [file:491].
- **Faltam os Cards Expansíveis de Achados:** No mockup existem os blocos editoriais que apresentam as pequenas descobertas da pesquisa em formato nobre [file:491].
- **Falta o Bloco de Destaque Premium / Continuidade:** Bloco visual com fundo diferenciado apresentando a evolução do acompanhamento [file:491].

---

### 2. Jornada (Mockup p. 4 vs. Tela Atual)
- **Falta a Linha do Tempo Paralela em Duas Colunas:** O mockup exibe duas linhas simultâneas: **Linha da Família (Ancestral)** e **Linha do Processo Institucional**. O código atual empilhou tudo verticalmente em uma lista achatada [file:491].
- **Falta o Bloco de União Familiar (Terracota/Bege):** No mockup, a transição entre os ramos e o casamento formam um card nobre em tom terracota suave com itálico sálvia [file:491].
- **Falta a Fiação Dourada Contínua:** No mockup, os nós são unidos por fios finos contínuos ouro e cinza, e não por blocos isolados [file:491].

---

### 3. Radar (Mockup p. 5 vs. Tela Atual)
- **Falta o Polígono Completo e Proporcional:** O gráfico de teia foi reduzido a um elemento tímido no canto da tela; no mockup, o radar é o elemento protagonista central com área preenchida suave e contraste nobre [file:491].
- **Falta a Grade 2x3 de Cartões de Dimensão:** O mockup traz 6 cards organizados em grade harmônica (Origem, Documentação, Pesquisa, etc.); o código atual jogou uma lista longa de 1 coluna vertical que exige rolagem infinita [file:491].
- **Falta o Checklist de Prontidão Integrado:** Abaixo do radar, o mockup vincula o que falta para cada eixo evoluir [file:491].

---

### 4. Árvore Genealógica (Mockup p. 6 vs. Tela Atual)
- **Falta o Painel Moldurado Branco Único:** No mockup, a árvore é um diagrama limpo contido em uma moldura central nobre; o Lovable espalhou cards soltos pelo fundo creme [file:491].
- **Faltam os Cards Geracionais com Destaque Dourado:** No mockup, a pessoa em foco recebe um contorno dourado espesso com selo lateral, e as conexões entre gerações exibem datas e locais de forma legível e elegante [file:491].
- **Falta o Enquadramento Compacto G1 a G5:** A árvore atual ficou excessivamente espaçada verticalmente, perdendo a visão panorâmica do genograma [file:491].

---

### 5. Documentos (Mockup p. 7 vs. Tela Atual)
- **Falta a Lista de Checklist Estruturada (10 Itens Canônicos):** O mockup exibe uma lista de 10 certidões e atos civis da linha, com seus respectivos status (OK, Pendente, Parcial, Em Análise) com tags coloridas [file:491].
- **Faltam os Estados Visuais Claros:** Em vez de sumir com a lista inteira porque não há arquivo em PDF subido, o mockup mostra os itens necessários para a cidadania austríaca em estado *"Aguardando localização"* ou *"Em busca cartorária"*, orientando a cliente sobre o que está sendo procurado [file:491].
- **Falta a Área de Envio/Upload do Cliente:** O botão de envio do cliente, mesmo desabilitado ou aguardando instrução, faz parte da composição da tela [file:491].

---

### 6. Legado (Mockup p. 8 vs. Tela Atual)
- **Faltam as Prateleiras de Coleções / Cadernos Familiares:** No mockup, o legado é composto por cards visuais em formato de livros/cadernos com capas elegantes (Crest, Brasão, Documentos Históricos) [file:491].
- **Falta o Card de Histórias para Compartilhar:** Seção dedicada a pequenos recortes de memórias, fotos e cartas resgatadas [file:491].
- **Tela Atual Vazia:** O código atual reduziu o legado a mensagens de "Ainda não publicado", abandonando o layout editorial da prancha [file:491].

---

### 7. Conta (Mockup p. 9 vs. Tela Atual)
- **Falta a Ficha Cadastral Nominal:** O mockup exibe foto/iniciais, nome da contratante, e-mail, telefone e membro desde [file:491].
- **Falta o Card Compacto do Plano Familiar:** Exibição clara das condições da assessoria familiar de forma elegante, com selo de membro [file:491].
- **Falta o Hub de Canais e Atendimento:** Área destacada com contatos e histórico de novidades [file:491].

---

## 3. Diretriz de Trabalho: O Roteiro de Construção

Para destravar o projeto e orientar o Lovable a **construir o que realmente falta** em vez de congelar um esqueleto incompleto:

1. **Rejeitar o Congelamento Antecipado:** Deixar claro que o congelamento só ocorrerá quando os componentes visuais do Mockup Normativo estiverem desenhados nas 7 abas [file:491].
2. **Construção Visual com Estrutura Estável:** O desenvolvedor deve programar os cards, grids, colunas paralelas e listas estruturadas (ex.: checklist de 10 itens com status de busca), preenchendo a casca visual conforme as páginas 3 a 9 [file:491].
3. **Executar Aba por Aba:** Em vez de mexer aleatoriamente no Desk, o Lovable deve se concentrar em fechar a paridade do App Cliente, começando pela **Home** e pela **Jornada em duas colunas** [file:491].
