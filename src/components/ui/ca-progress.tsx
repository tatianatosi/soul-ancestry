/**
 * Barra de progresso do Clube Ancestral — trilho neutro, preenchimento gold.
 * Cliente sempre informa a origem real do valor (nunca % inventado).
 */
export function CaProgress({ valor, rotulo }: { valor: number; rotulo?: string }) {
  return (
    <div>
      {rotulo ? (
        <div className="mb-1 flex justify-between text-xs text-navy/60">
          <span>{rotulo}</span>
          <span>{valor}%</span>
        </div>
      ) : null}
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
        <div className="h-full rounded-full bg-gold" style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
      </div>
    </div>
  );
}
