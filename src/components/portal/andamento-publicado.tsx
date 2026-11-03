import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { usePortalVivo } from "@/components/portal/fonte-portal";
import { JourneyProgress } from "@/components/clube-ancestral-kit/jornada";

/** Apenas apresentação das mesmas métricas já calculadas pelo leitor do Radar. */
export function AndamentoPublicado({ rota }: { rota: string }) {
  const { data, isLoading, isError } = usePortalVivo();
  if (!data || isLoading || isError || rota === "/portal/radar") return null;
  if (rota === "/portal/documentos") {
    const checklist = data.checklist;
    const total = checklist?.total ?? 0;
    const concluidos = checklist?.concluidos ?? 0;
    return (
      <details className="app-andamento-publicado" data-andamento-publicado>
        <summary>
          <span className="app-andamento-ponto" aria-hidden="true" />
          <span>Documentação</span>
          <strong>{total > 0 ? `${concluidos} de ${total} concluídos` : "Em preparação"}</strong>
        </summary>
        <p>{total > 0 ? "Contagem dos pedidos documentais aceitos pela equipe. Arquivos disponíveis não significam que todos os pedidos foram concluídos." : "Nenhum pedido documental registrado para a família. A disponibilidade de arquivos não indica conclusão do checklist."}</p>
      </details>
    );
  }
  const dimensoes = radarSeisDimensoes({
    projecoes: data.projecoes,
    documentos: data.documentos,
    pessoasMapeadas: data.pessoasMapeadas,
    checklist: data.checklist,
  });
  const eixo = rota === "/portal/arvore" ? "conexoes"
    : rota === "/portal/legado" ? "legado" : "elegibilidade";
  const dimensao = dimensoes.find((item) => item.id === eixo);
  if (!dimensao) return null;
  const parcial = eixo === "elegibilidade";
  const editorial = ["/portal", "/portal/jornada", "/portal/arvore", "/portal/documentos"].includes(rota);
  const rotuloAusencia = dimensao.rotuloNumero === "Lacuna" || (editorial && dimensao.rotuloNumero === "Nenhum ainda")
    ? "Em pesquisa"
    : dimensao.rotuloNumero === "Nenhum ainda" ? "Em preparação" : dimensao.rotuloNumero;
  return (
    <details className="app-andamento-publicado" data-andamento-publicado>
      <summary>
        <span className="app-andamento-ponto" aria-hidden="true" />
        <span>{parcial ? "Andamento da pesquisa" : dimensao.titulo}</span>
        <strong>{dimensao.percentual !== null ? `${dimensao.percentual}%` : rotuloAusencia}</strong>
      </summary>
      {dimensao.percentual !== null ? <JourneyProgress label={parcial ? "Andamento da pesquisa" : dimensao.titulo} value={dimensao.percentual} /> : null}
      <p>{dimensao.comoCalculamos}</p>
    </details>
  );
}