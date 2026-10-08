import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { usePortalVivo } from "@/components/portal/fonte-portal";

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
  return (
    <details className="app-andamento-publicado" data-andamento-publicado>
      <summary>
        <span className="app-andamento-ponto" aria-hidden="true" />
        <span>{parcial ? "Radar · média dos eixos com base" : dimensao.titulo}</span>
        <strong>{dimensao.percentual !== null ? `${dimensao.percentual}%` : dimensao.rotuloNumero === "Nenhum ainda" ? "Ainda não publicado" : dimensao.rotuloNumero}</strong>
      </summary>
      {dimensao.percentual !== null ? <progress max={100} value={dimensao.percentual} aria-label={parcial ? "Média parcial do Radar" : dimensao.titulo} /> : null}
      <p>{dimensao.comoCalculamos}</p>
    </details>
  );
}