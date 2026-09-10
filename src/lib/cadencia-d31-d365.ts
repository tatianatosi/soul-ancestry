/**
 * Cadência universal D31–D365 — continuação da escada D0–D30.
 *
 * 04/09/2026, execução autorizada pela Proprietária ("pode executar a regra
 * D0 até D365 em todos os níveis e abas e grupos que se aplique"). Não é uma
 * arquitetura nova: é a régua já decidida e nunca implementada —
 * `docs/arquitetura/2026-09-03_MAPA-CADENCIAS-D0-D365-ANA-REGRA-UNIVERSAL.md`
 * (documento-fonte original, recuperado de branch nunca mesclada), seção 4,
 * "Linha do tempo D0-D365". `cadencia-d0-d30.ts` já cobre a norma da casa
 * §10.3 para D0-D30; este arquivo transcreve literalmente as seis janelas
 * seguintes da mesma tabela, para fechar a régua completa sem reescrever a
 * lógica de cobertura/situação (importada, não duplicada).
 *
 * Mesma honestidade da D0-D30: nada aqui envia, publica, cobra ou promete
 * prazo ao cliente. "Cobertura" só diz se o plano do caso já previu algo
 * nesta janela — não se foi de fato executado.
 */
import { TOM_CADENCIA, type CadenciaOnboarding } from "./cadencia-onboarding";
import {
  dia,
  situarMomento,
  soODia,
  type Cobertura,
  type MomentoAvaliado,
  type MomentoCadencia,
} from "./cadencia-d0-d30";

/**
 * As seis janelas de D31 a D365, transcritas literalmente da seção 4 do Mapa
 * de Cadências. Todas são "janela" (intervalo): a régua universal, a partir
 * daqui, não fala mais em pontos exatos — fala em objetivo do período.
 */
export const CADENCIA_D31_D365: MomentoCadencia[] = [
  {
    id: "d31_d45",
    rotulo: "D31–D45",
    tipo: "janela",
    de: 31,
    ate: 45,
    acaoInterna:
      "Execução controlada: rodar tarefas aprovadas, registrar evidências, revisar pendências e dependências externas",
    entregaAoCliente:
      "Atualizações apenas quando houver conteúdo aprovado; não publicar atividade interna bruta",
    evidenciaSaida: "Pelo menos uma atualização material ou status de dependência explicado",
  },
  {
    id: "d46_d60",
    rotulo: "D46–D60",
    tipo: "janela",
    de: 46,
    ate: 60,
    acaoInterna:
      "Checkpoint de estratégia: revisar risco, elegibilidade, documentação, investimento, prazo estimado e necessidade de ajuste de escopo",
    entregaAoCliente: "Resumo de progresso client-facing e próximos marcos",
    evidenciaSaida: "Decisão registrada: seguir, ajustar, pausar, escalar ou propor complemento",
  },
  {
    id: "d61_d90",
    rotulo: "D61–D90",
    tipo: "janela",
    de: 61,
    ate: 90,
    acaoInterna:
      "Consolidação da Fase 01: fechar ou replanejar entregáveis; preparar Fase 02 somente se houver gate/escopo",
    entregaAoCliente:
      "Fase 01 com entregas aprovadas; Fase 02 permanece bloqueada até elegibilidade real",
    evidenciaSaida: "Revisão D90 + aceite/estado da Fase 01 + plano seguinte",
  },
  {
    id: "d91_d180",
    rotulo: "M4–M6 (D91–D180)",
    tipo: "janela",
    de: 91,
    ate: 180,
    acaoInterna:
      "Execução, dependências e previsibilidade: cadência quinzenal interna, revisão mensal de caso, gestão de documentos, fornecedores e bloqueios",
    entregaAoCliente:
      "Atualização material mensal ou por evento; documentos/entregas conforme publicação",
    evidenciaSaida: "Revisões mensais registradas e nenhum SLA crítico sem dono/prazo",
  },
  {
    id: "d181_d270",
    rotulo: "M7–M9 (D181–D270)",
    tipo: "janela",
    de: 181,
    ate: 270,
    acaoInterna:
      "Avanço de fase e qualidade percebida: revisar progresso acumulado, risco de estagnação, mudanças de regra/rota, necessidade de fase complementar",
    entregaAoCliente:
      "Abrir Fase 02 somente com condição cumprida; entregar marcos e orientações contextualizadas",
    evidenciaSaida: "Checkpoint trimestral com decisão de continuidade/ajuste",
  },
  {
    id: "d271_d365",
    rotulo: "M10–M12 (D271–D365)",
    tipo: "janela",
    de: 271,
    ate: 365,
    acaoInterna:
      "Retenção, legado e renovação: avaliar resultado, pendências pós-processo, continuidade, gestão documental e oportunidades legítimas de legado",
    entregaAoCliente:
      "Relatório de 12 meses, próximos marcos e proposta de continuidade apenas se fizer sentido",
    evidenciaSaida: "Revisão anual e decisão: encerrar, manter, renovar, migrar para legado ou pausar",
  },
];

export type LeituraD31D365 = {
  inicio: string | null;
  momentos: MomentoAvaliado[];
  resumo: {
    total: number;
    cobertos: number;
    descobertos: number;
    atrasados: number;
    emCurso: number;
  };
  lacunas: string[];
};

/**
 * Confronta a régua D31–D365 com o plano de um caso.
 *
 * Mesmo contrato de `lerCadenciaD0D30`: recebe a cadência já lida do caso
 * (`lerCadenciaOnboarding`) para não repetir a leitura de banco nem a
 * conversão de prazos.
 */
export function lerCadenciaD31D365(args: {
  cadenciaDoCaso: CadenciaOnboarding;
  hoje?: Date | string;
}): LeituraD31D365 {
  const { cadenciaDoCaso } = args;
  const hojeUtc = soODia(args.hoje ?? new Date()) ?? 0;
  const inicio = cadenciaDoCaso.inicio;
  const inicioUtc = inicio ? soODia(inicio) : null;

  const datadas = cadenciaDoCaso.entradas.filter(
    (e): e is typeof e & { dias: number } => typeof e.dias === "number",
  );

  const momentos: MomentoAvaliado[] = CADENCIA_D31_D365.map((m) => {
    const dentro = datadas.filter((e) => e.dias >= m.de && e.dias <= m.ate);
    const cobertura: Cobertura = dentro.length ? "coberto" : "descoberto";
    return {
      momento: m,
      cobertura,
      cobertoPor: dentro.map((e) => e.rotulo),
      situacao: situarMomento(m, inicioUtc, hojeUtc, cobertura),
      deEm: inicioUtc === null ? null : dia(inicioUtc, m.de),
      ateEm: inicioUtc === null ? null : dia(inicioUtc, m.ate),
    };
  });

  const conta = (p: (x: MomentoAvaliado) => boolean) => momentos.filter(p).length;

  return {
    inicio,
    momentos,
    resumo: {
      total: momentos.length,
      cobertos: conta((x) => x.cobertura === "coberto"),
      descobertos: conta((x) => x.cobertura === "descoberto"),
      atrasados: conta((x) => x.situacao === "atrasado"),
      emCurso: conta((x) => x.situacao === "vence_hoje"),
    },
    lacunas: momentos.filter((x) => x.cobertura === "descoberto").map((x) => x.momento.rotulo),
  };
}

/** A frase de abertura da régua D31-D365 — mesmo espírito da D0-D30. */
export function leituraD31D365(l: LeituraD31D365): string {
  if (l.resumo.descobertos > 0) {
    const quais = l.lacunas.join(", ");
    return l.resumo.descobertos === 1
      ? `O plano deste caso não prevê nada em ${quais}, que a régua universal pede.`
      : `O plano deste caso não prevê nada em ${quais} — ${l.resumo.descobertos} das ${l.resumo.total} janelas da régua.`;
  }
  if (!l.inicio)
    return "O plano cobre as seis janelas de D31 a D365. As datas aparecem quando o onboarding começar.";
  if (l.resumo.emCurso > 0) {
    return `${l.resumo.emCurso} ${l.resumo.emCurso === 1 ? "janela aberta" : "janelas abertas"} hoje.`;
  }
  return "O plano cobre as seis janelas de D31 a D365, e nenhuma está aberta hoje.";
}

/** Rótulo e sinal por situação — reaproveita a paleta já validada. */
export const TOM_D31_D365 = TOM_CADENCIA;
