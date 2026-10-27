import type { ReactNode } from "react";
import { ChevronDown, FileCheck2, Files, Inbox, LibraryBig } from "lucide-react";

const ICONES = {
  solicitados: Files,
  recebidos: Inbox,
  conferencia: FileCheck2,
  liberados: FileCheck2,
  entregas: LibraryBig,
};

const ROTULOS = {
  solicitados: "Pedidos da equipe",
  recebidos: "Envios e conferência",
  conferencia: "Revisão da equipe",
  liberados: "Disponíveis para consulta",
  entregas: "Histórias e materiais",
};

/** Acordeão de apresentação: mantém intactos os leitores e ações dos filhos. */
export function SecaoDocumental({ tipo, titulo, children, vazio = false }: {
  tipo: keyof typeof ICONES;
  /** Grupo sem registros começa fechado, com selo "Nada por aqui ainda". */
  vazio?: boolean;
  titulo: string;
  children: ReactNode;
}) {
  const Icone = ICONES[tipo];
  return (
    <details className="app-documento-acordeao" open={!vazio} data-documento-acordeao={tipo} data-vazio={vazio || undefined}>
      <summary>
        <span className="app-documento-icone"><Icone aria-hidden="true" className="h-5 w-5 shrink-0" /></span>
        <span className="app-documento-titulo min-w-0"><span className="block font-serif text-xl">{titulo}</span><span className="app-documento-legenda">{vazio ? `${ROTULOS[tipo]} · Nada por aqui ainda` : ROTULOS[tipo]}</span></span>
        <ChevronDown aria-hidden="true" className="app-detalhe-seta h-4 w-4 shrink-0" />
      </summary>
      <div className="app-documento-conteudo">{children}</div>
    </details>
  );
}