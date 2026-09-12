# Kit Visual Clube Ancestral

Pacote exclusivamente visual, sem dados, rotas, autenticação ou integrações.

## Instalação

1. Copie esta pasta para o projeto Soul Ancestry.
2. Importe os componentes de `index.tsx`.
3. Envolva a área desejada com `<KitRoot>`.
4. Preserve a pasta `assets/`; `BrandLogo` usa o SVG local `logo-principal.svg` por padrão.

```tsx
import { BrandLogo, KitCard, KitRoot, RadarSvg } from "./clube-ancestral-kit";

export function Exemplo({ eixos, series }) {
  return (
    <KitRoot>
      <BrandLogo />
      <KitCard title="Radar">
        <RadarSvg axes={eixos} series={series} />
      </KitCard>
    </KitRoot>
  );
}
```

## Exportações

- Marca e estrutura: `BrandLogo`, `DeskSidebar`, `DeskTopbar`, `MobileNav`, `KitRoot`.
- Base: `KitButton`, `KitBadge`, `KitCard`, `KitEmptyState`, `DataTable`, `KpiCard`.
- Jornada: `VerticalTimeline`, `Stepper`.
- Genealogia e pesquisa: `RadarSvg`, `FamilyTree`, `FamilyNode`, `DocumentCard`, `FindingCard`, `MicrodeliveryCard`.
- Operação: `Kanban`.
- Composições: `Case360`, `Person360`, `Financeiro`, `Juridico`.

Todos recebem conteúdo por propriedades. Arrays vazios resultam em estados vazios; o pacote não contém registros de exemplo.

## Paleta isolada

`tokens.css` aplica somente dentro de `.ca-kit`:

- Navy `#13294B`
- Navy secundário `#1B365D`
- Creme `#F0EEE9`
- Dourado `#C2A84D`
- Texto `#28334A`
- Branco `#FFFFFF`

O CSS não altera `:root`, `body` ou tokens globais do projeto hospedeiro.

## Tipografia

O CSS declara Cormorant Garamond para títulos e Inter para corpo, com fallbacks locais. O pacote não baixa fontes externas.
