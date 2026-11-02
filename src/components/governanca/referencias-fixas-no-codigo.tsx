import { Selo } from "@/components/comercial/base";
import { CaCard } from "@/components/ui/ca-card";
import { escopoDoRegistro } from "@/lib/app-visibilidade-registro";
import { CASE_REGISTRY } from "@/data/case-registry";
import { TEMPLATES_CONHECIDOS } from "@/lib/rascunhos-comunicacao-governados";
import { CASO_CANONICO_ANA_LUIZA } from "@/lib/saneamento-desk-app-v4";

/**
 * Dados que estão escritos no código, não no banco. Ficam visíveis aqui, rotulados, para ninguém
 * confundi-los com a leitura ao vivo (que está em Casos, Contratos e no App). Só leitura, nada grava.
 * Religado em 02/11/2026: saneamento-desk-app-v4, app-visibilidade-registro e
 * rascunhos-comunicacao-governados estavam sem tela.
 */
function Linha({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-t border-navy/5 py-1 text-xs first:border-t-0">
      <span className="text-navy/70">{rotulo}</span>
      <span className="text-right font-medium text-navy">{valor}</span>
    </li>
  );
}

export function ReferenciasFixasNoCodigo() {
  const c = CASO_CANONICO_ANA_LUIZA;
  return (
    <div data-referencias-fixas-no-codigo className="space-y-4">
      <CaCard titulo="Dados fixos no código" eyebrow="Não ao vivo · só leitura">
        <p className="text-xs text-navy/60">
          Os três blocos abaixo vêm de arquivos do código, não do banco. Servem de referência e de
          histórico; o valor atual de cada caso está em Casos, Contratos e no App.
        </p>
      </CaCard>

      <CaCard titulo="Retrato do caso piloto" eyebrow="Saneamento Desk/App V4 · retrato antigo">
        <div className="mb-2 flex items-center gap-2">
          <Selo texto="Retrato fixo, pode estar desatualizado" tom="neutro" />
        </div>
        <ul>
          <Linha rotulo="Código do caso" valor={c.codigoCaso} />
          <Linha rotulo="Cliente" valor={c.clienteNome} />
          <Linha rotulo="Via" valor={c.via} />
          <Linha rotulo="País" valor={c.pais} />
          <Linha rotulo="Fase no retrato" valor={c.faseAtual} />
          <Linha rotulo="Progresso no retrato" valor={`${c.progressoPercentual}%`} />
          <Linha rotulo="Próxima ação no retrato" valor={c.proximaAcao} />
          <Linha rotulo="Prazo no retrato" valor={c.prazoProximaAcao} />
          <Linha rotulo="Contrato no retrato" valor={c.contratoCodigo} />
          <Linha rotulo="Condição comercial no retrato" valor={c.condicaoComercial} />
        </ul>
        <p className="mt-2 text-xs text-navy/60">
          Para o estado real do caso, abra o Caso 360: progresso, próxima ação e contrato vêm do
          banco.
        </p>
      </CaCard>

      <CaCard
        titulo="Escopo do App derivado do registro demonstrativo"
        eyebrow="Visibilidade por registro · DEMO"
      >
        <div className="mb-2 flex items-center gap-2">
          <Selo texto="DEMO" tom="neutro" />
          <span className="text-xs text-navy/60">
            Calculado sobre o registro fixo `case-registry`. O escopo real de cada cliente vem das
            publicações lidas por caso no banco.
          </span>
        </div>
        <ul>
          {CASE_REGISTRY.map((r) => {
            const e = escopoDoRegistro(r);
            return (
              <Linha
                key={r.id}
                rotulo={r.id}
                valor={`Fase 1 ${e.fase1Status} · Fase 2 ${e.fase2Status} · entregas ${e.entregasLiberadas}`}
              />
            );
          })}
        </ul>
      </CaCard>

      <CaCard
        titulo="Modelos de comunicação governados"
        eyebrow="Rascunhos · modelos fixos no código"
      >
        <p className="mb-2 text-xs text-navy/60">
          Cada modelo só gera rascunho para revisão humana; nada é enviado daqui.
        </p>
        <ul className="space-y-3">
          {TEMPLATES_CONHECIDOS.map((t) => (
            <li key={t.id} className="rounded-lg border border-navy/10 p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-navy">{t.id}</span>
                <Selo
                  texto={t.vigente ? "Vigente" : "Não vigente"}
                  tom={t.vigente ? "ok" : "neutro"}
                />
                <span className="text-navy/60">
                  {t.proposito} · v{t.versao} · {t.canalPrevisto}
                  {t.expiraEm ? ` · expira em ${t.expiraEm}` : " · sem expiração"}
                </span>
              </div>
              <p className="mt-2 text-navy/80">{t.corpo}</p>
            </li>
          ))}
        </ul>
      </CaCard>
    </div>
  );
}
