/**
 * Matriz de autorizações da Proprietária Administradora — somente leitura.
 * Mostra, por área canônica, o que é interno (auditado) e o que é externo
 * (confirmação final explícita). Nenhuma ação é executada nesta tela.
 */
import {
  AREAS_CANONICAS,
  CATALOGO_EXCECOES,
  ETAPAS_ACEITAM_DOCUMENTO,
  REGRAS_DOCUMENTO,
  resumoVarredura,
} from "@/lib/varredura-autorizacoes";

const ROTULO_ETAPA: Record<string, string> = {
  lead: "Lead",
  discovery: "Discovery",
  proposta: "Proposta",
  contrato: "Contrato",
  ordem_servico: "Ordem de serviço",
  onboarding: "Onboarding",
  pesquisa: "Pesquisa",
  entrega: "Entrega",
  pos_entrega: "Pós-entrega",
};

function Selo({ natureza }: { natureza: "interna" | "externa" }) {
  const interna = natureza === "interna";
  return (
    <span
      className={
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold " +
        (interna
          ? "bg-primary/10 text-primary border border-primary/30"
          : "bg-destructive/10 text-destructive border border-destructive/30")
      }
    >
      {interna ? "Interna auditada" : "Externa — confirmação final"}
    </span>
  );
}

export function VarreduraAutorizacoes() {
  const r = resumoVarredura();

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Áreas canônicas varridas", r.areas],
          ["Ações internas liberadas", r.acoesInternas],
          ["Ações externas com confirmação", r.acoesExternas],
          ["Bloqueios internos ao avanço", r.bloqueiosInternos],
        ].map(([rotulo, valor]) => (
          <div key={String(rotulo)} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="text-2xl font-semibold text-foreground">{valor}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Matriz por área canônica</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {AREAS_CANONICAS.map((area) => (
            <article key={area.chave} className="rounded-xl border border-border bg-card p-4">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{area.rotulo}</h3>
                <code className="text-xs text-muted-foreground">{area.rota}</code>
              </header>
              <ul className="mt-3 space-y-2">
                {area.acoes.map((acao) => (
                  <li key={acao.chave} className="rounded-lg border border-border/60 p-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-foreground">{acao.rotulo}</span>
                      <Selo natureza={acao.natureza} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{acao.autorizacao}</p>
                    <p className="text-xs text-muted-foreground">Registro: {acao.registro}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Exceções operacionais</h2>
        <p className="text-sm text-muted-foreground">
          Toda exceção é criada pela proprietária com motivo, prazo e caminho de regularização. A pendência
          continua visível até ser regularizada; nenhuma etapa interna fica travada.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3">Quando ocorre</th>
                <th className="p-3">Prazo</th>
                <th className="p-3">Regularização</th>
                <th className="p-3">Impacto</th>
              </tr>
            </thead>
            <tbody>
              {CATALOGO_EXCECOES.map((e) => (
                <tr key={e.chave} className="border-t border-border align-top">
                  <td className="p-3 font-medium text-foreground">{e.rotulo}</td>
                  <td className="p-3 text-muted-foreground">{e.quando}</td>
                  <td className="p-3 text-muted-foreground">
                    {e.validadeDias ? `${e.validadeDias} dias` : "Sem prazo — revisão manual"}
                  </td>
                  <td className="p-3 text-muted-foreground">{e.regularizacao}</td>
                  <td className="p-3 text-muted-foreground">{e.impacto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Documentos ao longo do ciclo</h2>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <p className="text-muted-foreground">
            Documento pode ser criado sem arquivo, anexado depois, substituído com versão e reclassificado em
            qualquer etapa. Não existe exclusão física; liberação ao cliente é ação externa.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ETAPAS_ACEITAM_DOCUMENTO.map((etapa) => (
              <li
                key={etapa}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-foreground"
              >
                {ROTULO_ETAPA[etapa] ?? etapa}
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {Object.entries(REGRAS_DOCUMENTO).map(([chave, valor]) => (
              <div key={chave} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-2">
                <dt className="text-xs text-muted-foreground">{chave}</dt>
                <dd className="text-xs font-semibold text-foreground">{String(valor)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
