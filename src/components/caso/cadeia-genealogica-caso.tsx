import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { ArvoreFiliacao } from "@/components/pessoas/composicao-linhagem-v4";
import { GERACAO_MAXIMA_LINHAGEM } from "@/lib/pessoas-linhagens";
import { lerLinhagemDoCaso } from "@/lib/pessoas-linhagens.functions";

/**
 * Frente 3 (19/10/2026) — cadeia genealógica dentro do Caso 360.
 *
 * Nenhum nome de pessoa é escrito aqui: a cadeia inteira (quem é quem, em
 * que geração, com que relação de filiação) vem de `lerLinhagemDoCaso`, que
 * lê `genealogical_relationships` e `genealogical_person_profiles` /
 * `research_people` do caso real pelo `caseId` da rota — o mesmo leitor já
 * usado em `/nucleos` (G-02). Sem relação gravada no banco, o nó/aresta
 * correspondente simplesmente não aparece (vazio honesto; nada inferido por
 * sobrenome ou posição).
 */
export function CadeiaGenealogicaCaso({
  caseId,
  membros = [],
}: {
  caseId: string;
  /** Membros do núcleo/caso já carregados pela ficha — só para marcar quem é requerente. */
  membros?: { id?: string; cliente_id?: string | null; nome?: string }[];
}) {
  const ler = useServerFn(lerLinhagemDoCaso);
  const q = useQuery({
    queryKey: ["ficha-caso-linhagem-genealogica", caseId],
    queryFn: () => ler({ data: { caseId } }),
    enabled: Boolean(caseId),
    retry: false,
  });

  const geracoes = q.data?.geracoes ?? [];
  const arestas = q.data?.arestas ?? [];
  const linha = q.data?.linha ?? null;

  const clientesDoCaso = new Set(
    membros.map((m) => m.cliente_id).filter((v): v is string => Boolean(v)),
  );
  const requerentes = new Set(
    geracoes.filter((p) => p.clienteId && clientesDoCaso.has(p.clienteId)).map((p) => p.personId),
  );

  const aviso = !caseId
    ? "Caso sem identificador — sem linhagem para ler."
    : q.isLoading
      ? "Carregando a cadeia genealógica…"
      : q.isError
        ? "Não foi possível carregar a cadeia genealógica."
        : !linha
          ? "Nenhuma linha com pessoa âncora registrada neste caso."
          : geracoes.length === 0
            ? "Nenhum elo de filiação gravado ainda nesta linha."
            : null;

  return (
    <div data-cadeia-genealogica-caso>
      <ArvoreFiliacao geracoes={geracoes} arestas={arestas} requerentes={requerentes} />
      <p className="mt-1 text-center text-[10px] text-navy/50">
        Traço dourado só onde há filiação gravada no banco · nó dourado = requerente deste caso ·
        G1 é a pessoa âncora da linha e sobe pelos elos registrados (máx. G{GERACAO_MAXIMA_LINHAGEM}).
      </p>
      {aviso ? (
        <p
          className={`mt-2 text-[10px] ${q.isError ? "text-terracotta" : "text-navy/50"}`}
          role={q.isError ? "alert" : undefined}
        >
          {aviso}
          {q.isError ? (
            <button type="button" className="ml-1 underline" onClick={() => void q.refetch()}>
              Tentar novamente
            </button>
          ) : null}
        </p>
      ) : (
        <p className="mt-2 text-[10px] text-navy/50">
          {geracoes.length} pessoa(s) na linha · {arestas.length} elo(s) de filiação gravado(s) de
          um total de {q.data?.totalPerfis ?? 0} perfil(is) genealógico(s) do caso.
        </p>
      )}
    </div>
  );
}
