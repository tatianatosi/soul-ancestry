/**
 * Matriz de prontidão de integrações — superfície somente leitura.
 * Não executa nenhuma chamada externa.
 */
import { DetalhesTecnicos } from "@/components/ui/detalhes-tecnicos";
import {
  ACOES_EXTERNAS_NAO_EXECUTADAS,
  PRONTIDAO_INTEGRACOES,
  ROTULO_ESTADO,
  type EstadoIntegracao,
} from "@/lib/prontidao-integracoes";

const COR_ESTADO: Record<EstadoIntegracao, string> = {
  VALIDADA_EM_QA: "border-sage/50 bg-sage/10 text-sage",
  CONFIGURADA_NAO_TESTADA: "border-navy/30 bg-navy/5 text-navy",
  NAO_CONFIGURADA: "border-navy/10 bg-muted text-navy/65",
  BLOQUEADA_POR_DADO: "border-terracotta/50 bg-terracotta/10 text-terracotta",
  AGUARDA_CONFIRMACAO_DA_PROPRIETARIA: "border-gold/60 bg-gold/15 text-foreground",
};

export function MatrizProntidaoIntegracoes() {
  return (
    <section className="space-y-4" aria-labelledby="prontidao-integracoes">
      <div>
        <h2 id="prontidao-integracoes" className="font-serif text-xl text-foreground">
          Prontidão das integrações
        </h2>
        <p className="text-sm text-navy/65">
          Estado comprovável de cada integração. Esta tela é somente leitura: nenhuma mensagem, cobrança,
          assinatura, publicação ou pesquisa externa é disparada a partir daqui.
        </p>
      </div>

      <ul className="grid gap-3 md:grid-cols-2">
        {PRONTIDAO_INTEGRACOES.map((i) => (
          <li key={i.chave} className="rounded-lg border border-navy/10 bg-cream/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{i.nome}</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${COR_ESTADO[i.estado]}`}
              >
                {ROTULO_ESTADO[i.estado]}
              </span>
            </div>
            <dl className="mt-3 space-y-1 text-xs text-navy/65">
              <div>
                <dt className="inline font-medium text-foreground">Ambiente: </dt>
                <dd className="inline">{i.ambiente}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Última validação: </dt>
                <dd className="inline">{i.ultima_validacao ?? "sem validação registrada"}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Escopo: </dt>
                <dd className="inline">{i.escopo}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Habilita: </dt>
                <dd className="inline">{i.habilita}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-foreground">Responsável: </dt>
                <dd className="inline">{i.responsavel}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-foreground">
              <span className="font-medium">Pré-requisitos:</span>
            </p>
            <ul className="list-disc pl-5 text-xs text-navy/65">
              {i.prerequisitos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {i.erro_acionavel && (
              <p className="mt-2 rounded-md border border-terracotta/40 bg-terracotta/5 p-2 text-xs text-foreground">
                {i.erro_acionavel}
              </p>
            )}
            <p className="mt-2 text-[11px] text-navy/65">
              {i.sandbox ? "Pode ser testada em QA/sandbox." : "Sem sandbox disponível."}{" "}
              {i.exige_confirmacao_final
                ? "Exige confirmação final da proprietária."
                : "Não exige confirmação final."}
            </p>
          </li>
        ))}
      </ul>

      <DetalhesTecnicos titulo="Ações externas que não foram executadas">
        <ul className="list-disc space-y-1 pl-5 text-xs text-navy/65">
          {ACOES_EXTERNAS_NAO_EXECUTADAS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </DetalhesTecnicos>
    </section>
  );
}
