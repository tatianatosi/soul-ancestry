# Clube Ancestral

Sistema operacional de pesquisa genealógica — casos, jornada e evidências. Não é CRM genérico nem protótipo visual.

- **Desk:** 8 grupos (`src/lib/navegacao-desk.ts`): Visão Geral, Marketing, Comercial, Casos 360, Pesquisa, Contratos e financeiro, Cliente, Biblioteca Mestre.
- **App Cliente:** 7 abas, nesta ordem: Home, Jornada, Radar, Árvore, Documentos, Legado, Conta.
- **Eixo:** `crm_casos`. Pessoa, núcleo, lead, pesquisa e contrato ligam-se por IDs. O App Cliente é projeção autorizada dos mesmos objetos.
- **Primeira cliente:** Ana Luiza Gomes Silveira Rodrigues — caso `CA-CID-AT-FAM-2026-001`.
- **Marca:** navy `#2F4B6E`, dourado `#FCB73A`, creme `#ECDFCD`, terracota `#9A3A2F` (`src/lib/marca.ts`).

O briefing de 6 abas / mockup sem backend de agosto de 2026 está em `archive/README-prototipo-visual-2026-08.md`. Não usa esse texto como o produto atual.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1a628b61-ec68-454f-85e1-671d6f297370).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
