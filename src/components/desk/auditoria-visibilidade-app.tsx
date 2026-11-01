import {
  estadoDaTela,
  ESTADO_TELA_TEXTO,
  telasVisiveis,
  type ContextoCliente,
} from "@/lib/app-cliente-gate";
import { projecaoLimpa } from "@/lib/arvore-cliente-projecao";
import { contemTermoInterno } from "@/lib/legado-visibilidade";

type Projecao = Record<string, unknown>;

/**
 * Painel interno (equipe): estado de cada tela do App Cliente para ESTE caso e
 * auditoria de sanitização do que foi publicado. Somente leitura; tudo vem do
 * dado real do caso — nada é inferido nem ilustrado.
 */
export function AuditoriaVisibilidadeApp({
  projecoes,
  documentos,
  entregasLiberadas,
  temAcesso,
}: {
  projecoes: Projecao[];
  documentos: unknown[];
  entregasLiberadas: number;
  temAcesso: boolean;
}) {
  const ctx: ContextoCliente = {
    eixoOperacao: temAcesso ? "caso_ativo" : null,
    entregasPublicadas: entregasLiberadas,
    documentosLiberados: documentos.length,
    legadoPublicado: projecoes.filter(
      (p) => String(p["projection_type"] ?? "").toLowerCase() === "legado",
    ).length,
  };
  const vazamentos = projecoes.filter(
    (p) => !projecaoLimpa(p) || contemTermoInterno(String(p["titulo"] ?? p["title"] ?? "")),
  );
  return (
    <section
      className="rounded-xl border border-navy/10 bg-card p-4"
      data-auditoria-visibilidade-app
    >
      <h2 className="font-serif text-lg text-navy">Estado das telas para a família</h2>
      <ul className="mt-2 grid gap-1 text-sm text-navy/80 sm:grid-cols-2">
        {telasVisiveis().map((tela) => {
          const estado = estadoDaTela(tela, ctx);
          return (
            <li key={tela} data-tela={tela} data-estado={estado}>
              <span className="font-medium">{tela}</span> — {ESTADO_TELA_TEXTO[estado]}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-navy/70" data-auditoria-sanitizacao>
        {vazamentos.length === 0
          ? `Sanitização: ${projecoes.length} publicação(ões) sem campo ou termo interno.`
          : `Atenção: ${vazamentos.length} publicação(ões) com campo ou termo interno — revisar antes de a família ver.`}
      </p>
    </section>
  );
}
