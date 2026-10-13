# Guia de Configuração: Atalho do Web App (PWA) no Celular

```yaml
status: aprovado
versao: v1.0
data: 2026-10-12
hora: 23:45 BRT
responsavel_pela_decisao: Tatiana Melani Tosi (Proprietária do Clube Ancestral)
classificacao: guia de instalacao pwa, experiencia mobile e onboarding do cliente
caminho_no_repositorio: docs/relatorios/2026-10-12-guia-atalho-web-app-celular.md
fontes:
  - public/manifest.json (Commit 9b7477db)
  - clubeancestralmockup.pdf (Identidade Visual)
escopo: >
  Instruções para adicionar o ícone e o atalho do aplicativo Clube Ancestral na tela de início
  de celulares iPhone (iOS) e Android, proporcionando a experiência de um aplicativo nativo
  sem a burocracia de publicação em App Store ou Google Play.
premissas:
  - O arquivo public/manifest.json está ativo em main configurado para iniciar em /portal.
  - O tema visual adota o Navy institucional (#13294B) e display em tela cheia (standalone).
criterio_de_aceite: >
  Atalho criado com ícone na tela inicial do celular;
  abertura do app sem barra de navegador em modo standalone.
```

---

## 1. O Que Foi Implementado no Repositório

Com a gravação do arquivo **`public/manifest.json`** (Commit `9b7477db`), o seu portal agora é um **Progressive Web App (PWA)** oficial:
- **Nome no Celular:** Clube Ancestral
- **Rota Inicial Automática:** `/portal` (Home do cliente com a régua de etapas)
- **Modo de Exibição:** `standalone` (abre em tela cheia, ocultando a barra de endereços do Safari/Chrome, exatamente como um aplicativo da App Store).
- **Cor de Tema e Fundo:** Navy Oficial (`#13294B`).

---

## 2. Passo a Passo para Instalar o Ícone no Celular (iPhone e Android)

### No iPhone (iOS — Safari):
1. Abra o link do portal no navegador **Safari** (ex.: `https://seu-dominio.lovable.app/portal`).
2. Toque no botão de **Compartilhar** (ícone do quadrado com a seta para cima, no rodapé).
3. Role as opções para baixo e selecione **"Adicionar à Tela de Início"** (ícone de `+`).
4. Confirme o nome **"Clube Ancestral"** e toque em **"Adicionar"** no canto superior direito.
5. **Pronto:** O ícone do Clube Ancestral aparecerá na tela inicial do seu iPhone e abrirá direto em tela cheia.

---

### No Android (Google Chrome):
1. Abra o link do portal no **Google Chrome**.
2. Toque nos **três pontinhos** no canto superior direito.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. Toque em **"Instalar"**.
5. **Pronto:** O aplicativo é instalado na gaveta de aplicativos e na tela inicial do Android.

---

## 3. Mensagem Pronta de Instrução para a Ana Luiza (WhatsApp)

Envie junto com o link de acesso ao portal:

> *"Ana, uma dica especial: você pode ter o aplicativo do Clube Ancestral direto na tela inicial do seu celular, como um app normal da Apple ou Android!*
>
> 📱 **Como adicionar no celular em 10 segundos:**
> - **Se o seu celular for iPhone:** Abra o link no Safari, toque no botão de compartilhar (o quadradinho com a seta) e escolha **'Adicionar à Tela de Início'**.
> - **Se for Android:** Abra no Chrome, toque nos 3 pontinhos no topo e clique em **'Instalar aplicativo'**.
>
> *Assim você pode acompanhar a árvore genealógica e as atualizações de Graz com apenas um toque!"*
