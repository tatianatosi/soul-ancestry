import { createContext, useContext, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const FocoFicha = createContext({ ativa: "", abrir: (_titulo: string) => {} });

/** Local presentation state only; children remain mounted to retain drafts. */
export function FichaSecoes({ children }: { children: ReactNode }) {
  const [ativa, abrir] = useState("Identificação e responsabilidade");
  return <FocoFicha.Provider value={{ ativa, abrir }}>{children}</FocoFicha.Provider>;
}

export function FichaSecao({ titulo, descricao, children }: { titulo: string; descricao?: string; children: ReactNode }) {
  const { ativa, abrir } = useContext(FocoFicha);
  const aberta = ativa === titulo;
  return (
    <section className="border-b border-border py-2">
      <Button variant="ghost" onClick={() => abrir(aberta ? "" : titulo)} aria-expanded={aberta} className="min-h-11 h-auto w-full justify-between whitespace-normal text-left text-navy">
        {titulo}<span aria-hidden="true">{aberta ? "−" : "+"}</span>
      </Button>
      <div hidden={!aberta} className="px-3 pb-4">
        {descricao ? <p className="mb-4 text-xs text-muted-foreground">{descricao}</p> : null}
        {children}
      </div>
    </section>
  );
}