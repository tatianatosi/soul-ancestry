import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { JourneyProgress } from "@/components/clube-ancestral-kit/jornada";

/** Apenas apresentação das mesmas métricas já calculadas pelo leitor do Radar. */
export function AndamentoPublicado({ rota }: { rota: string }) {
  const { data, isLoading, isError } = usePortalVivo();
  if (!data || isLoading || isError || rota === "/portal/radar") return null;
  const dimensoes = radarSeisDimensoes({
    projecoes: data.projecoes,
    documentos: data.documentos,
    pessoasMapeadas: data.pessoasMapeadas,
  });
  const eixo = rota === "/portal/arvore" ? "conexoes"
    : rota === "/portal/documentos" ? "documentacao"
    : rota === "/portal/legado" ? "legado" : "elegibilidade";
  const dimensao = dimensoes.find((item) => item.id === eixo);
  if (!dimensao) return null;
  const parcial = eixo === "elegibilidade";
  const editorial = ["/portal", "/portal/jornada", "/portal/arvore", "/portal/documentos"].includes(rota);
  const rotuloAusencia = editorial && (dimensao.rotuloNumero === "Lacuna" || dimensao.rotuloNumero === "Nenhum ainda")
    ? "Em pesquisa"
    : dimensao.rotuloNumero === "Nenhum ainda" ? "Ainda não publicado" : dimensao.rotuloNumero;
  return (
    <details className="app-andamento-publicado" data-andamento-publicado>
      <summary>
        <span className="app-andamento-ponto" aria-hidden="true" />
        <span>{parcial ? "Como sua jornada está avançando" : dimensao.titulo}</span>
        <strong>{dimensao.percentual !== null ? `${dimensao.percentual}%` : rotuloAusencia}</strong>
      </summary>
      {dimensao.percentual !== null ? <JourneyProgress label={parcial ? "Avanço da sua jornada" : dimensao.titulo} value={dimensao.percentual} /> : null}
      <p>{dimensao.comoCalculamos}</p>
    </details>
  );
}