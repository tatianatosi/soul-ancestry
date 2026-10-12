import { Globe2, MapPin } from "lucide-react";

/** Sem contrato geográfico publicado não há mapa, país ou intensidade inventados. */
export function OrigemGeografica() {
  return (
    <section aria-label="Países da sua origem" className="app-origem-geografica" data-origem-geografica>
      <div className="app-origem-abertura">
        <Globe2 aria-hidden="true" className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs">Origem · lugares e ramos</p>
          <h2 className="mt-1 font-serif text-2xl text-navy">Países da sua origem</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-navy/75">Os países e ramos da sua história ainda não foram compartilhados. Quando houver essa publicação, você poderá conhecer cada origem aqui.</p>
      <details className="app-origem-lacuna mt-4">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-navy"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />Lugares, ramos e distribuição</summary>
        <dl className="mt-2 grid gap-3 text-sm text-navy/75">
          <div><dt className="font-medium text-navy">Lugares da família</dt><dd>Localidades históricas e países ainda não disponibilizados.</dd></div>
          <div><dt className="font-medium text-navy">Distribuição no mapa</dt><dd>Sem uma métrica compartilhada de pessoas ou documentos, ainda não há intensidade geográfica para representar.</dd></div>
        </dl>
      </details>
    </section>
  );
}