/**
 * Os 54 campos da Ficha Master, renderizados com o ESTADO real de cada um.
 *
 * MODO EXECUÇÃO CONTROLADA, 04/10/2026, item 2: "Use a Ficha Master como
 * camada de leitura/projeção e complete os campos a partir das fontes
 * proprietárias. Para cada campo ausente, exiba 'sem dados suficientes' ou
 * 'pendente de validação'; não use placeholder nem fallback demo."
 *
 * Camada de leitura, não quarta ficha: não há formulário, escritor nem rota
 * nova. Cada campo mostra o dono proprietário (Pessoa, Núcleo, Pesquisa,
 * Planejador, Contrato) — a Ficha Master nunca é dona de nada.
 */

import {
  CAMPOS_FICHA_MASTER,
  lerCamposFichaMaster,
  resumoFichaMaster,
  type DonoCampo,
  type EstadoCampoFicha,
} from "@/lib/ficha-master-estado-campos";

const COR_ESTADO: Record<EstadoCampoFicha, string> = {
  preenchido: "text-navy/80",
  pendente_de_validacao: "text-terracotta",
  sem_dados_suficientes: "text-navy/45",
};

const ROTULO_DONO: Record<DonoCampo, string> = {
  pessoa: "Pessoa",
  nucleo: "Núcleo",
  pesquisa: "Pesquisa",
  planejador: "Planejador",
  contrato: "Contrato",
};

export function FichaMaster54Campos({ ficha }: { ficha: Record<string, unknown> | null | undefined }) {
  if (!ficha) {
    return (
      <section className="rounded-lg border border-navy/15 bg-cream/40 p-3" data-ficha-master-54>
        <h3 className="text-sm font-medium text-navy">Ficha Master — 54 campos</h3>
        <p className="mt-1 text-xs text-navy/60">
          A leitura do caso não retornou. Sem ela, nenhum dos 54 campos pode ser afirmado — nem como preenchido, nem
          como ausente.
        </p>
      </section>
    );
  }

  const leituras = lerCamposFichaMaster(ficha);
  const resumo = resumoFichaMaster(leituras);
  const donos = (Object.keys(ROTULO_DONO) as DonoCampo[]).filter((d) => resumo.porDono[d] > 0);

  return (
    <section className="rounded-lg border border-navy/15 bg-cream/40 p-3" data-ficha-master-54>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">Ficha Master — 54 campos</h3>
        <span className="text-[11px] text-navy/55" data-ficha-master-contagem>
          {resumo.preenchidos} de {resumo.total} com dado real · {resumo.pendentesDeValidacao} pendente(s) de validação ·{" "}
          {resumo.semDadosSuficientes} sem dados suficientes
        </span>
      </div>
      <p className="mt-1 text-[11px] text-navy/55">
        Camada de leitura dos donos proprietários. Campo ausente aparece como o que é — nunca com frase de
        preenchimento. Nada aqui grava, publica ou conclui.
      </p>
      {donos.length > 0 && (
        <p className="mt-1 text-[11px] text-navy/55" data-ficha-master-donos>
          Falta por dono: {donos.map((d) => `${ROTULO_DONO[d]} ${resumo.porDono[d]}`).join(" · ")}
        </p>
      )}

      <dl className="mt-2 divide-y divide-navy/5 rounded border border-navy/10 bg-cream/30">
        {leituras.map((l) => (
          <div key={l.campo} className="grid gap-0.5 p-2 sm:grid-cols-[230px_1fr]" data-campo={l.campo}>
            <dt className="text-[11px] text-navy/55">
              {l.rotulo}
              <span className="block text-[10px] text-navy/35">
                {ROTULO_DONO[l.dono]} · {l.campo}
              </span>
            </dt>
            <dd className={`text-xs ${COR_ESTADO[l.estado]}`} data-estado={l.estado}>
              {l.exibicao}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-1 text-[10px] text-navy/40">
        {CAMPOS_FICHA_MASTER.length} campos declarados, conferidos contra o adaptador do caso.
      </p>
    </section>
  );
}
