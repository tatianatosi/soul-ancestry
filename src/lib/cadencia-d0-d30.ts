/**
 * Cadência MVP D0–D30 — a norma, e o quanto o plano do caso a honra.
 *
 * Prioridade 2 da Proprietária. A escada não é invenção desta camada: está
 * decidida e escrita em
 * `docs/governanca/CA-DECISOES-CANONICAS-CRM-CATALOGO-PLANEJADOR-JORNADA-v1.0.md`
 * (§10.3, Cadência MVP), com seis momentos e duas colunas — o que a equipe faz
 * por dentro e o que chega ao cliente, sempre "se aprovada".
 *
 * Como isto difere da `cadencia-onboarding`, que é o vizinho mais próximo:
 *
 *   cadencia-onboarding  →  o que o plano DAQUELE caso diz, virado em datas.
 *   cadencia-d0-d30      →  o que a norma MANDA, e se o plano daquele caso
 *                           cobre cada momento.
 *
 * Uma responde "o que combinamos com este cliente"; a outra, "o combinado
 * atende ao padrão da casa". Sem a segunda, um caso pode estar perfeitamente
 * em dia com um plano que esqueceu metade da escada — e foi o que os dados
 * mostraram: os touchpoints da Ana Luiza cobrem D7, D10 e D14, e não há nada
 * em D0, D1–D3 nem D30.
 *
 * Duas regras que a norma impõe e este módulo não pode afrouxar:
 *
 * 1. Nada sai sem aprovação humana. A coluna de entrega ao cliente é sempre
 *    condicional; este módulo descreve o que PODE ser preparado, nunca o que
 *    será enviado. Não agenda, não enfileira, não cria rascunho.
 * 2. O NPS de D30 depende de aprovação específica, e por isso vem marcado
 *    à parte do resto do check-in.
 *
 * Camada pura: sem I/O.
 */
import {
  TOM_CADENCIA,
  type CadenciaOnboarding,
  type SituacaoCadencia,
} from "./cadencia-onboarding";

/** Como o momento se posiciona no calendário. */
export type TipoMomento =
  /** Um dia exato: D0, D10, D14, D30. */
  | "ponto"
  /** Um intervalo com começo e fim: D1–D3. */
  | "janela"
  /** Um teto: "até D7" — vale qualquer dia até lá. */
  | "limite";

export type MomentoCadencia = {
  id: string;
  rotulo: string;
  tipo: TipoMomento;
  /** Primeiro dia do momento, contado a partir do D0. */
  de: number;
  /** Último dia do momento. Igual a `de` quando é ponto. */
  ate: number;
  acaoInterna: string;
  /** O que PODE chegar ao cliente — sempre dependente de aprovação humana. */
  entregaAoCliente: string;
  /** Aprovação adicional e específica, além da aprovação de envio. */
  aprovacaoExtra?: string;
  /** Evidência/gate de saída da janela, quando a norma declara um (D31–D365). */
  evidenciaSaida?: string;
};

/**
 * Os seis momentos, transcritos da tabela canônica §10.3.
 *
 * A transcrição é literal de propósito: se a norma mudar, muda aqui, e o
 * diff mostra exatamente o que mudou. Nada aqui é derivado nem inferido.
 */
export const CADENCIA_D0_D30: MomentoCadencia[] = [
  {
    id: "d0",
    rotulo: "D0",
    tipo: "ponto",
    de: 0,
    ate: 0,
    acaoInterna: "Criar checklist e responsável",
    entregaAoCliente: "Boas-vindas preparada para aprovação",
  },
  {
    id: "d1_d3",
    rotulo: "D1–D3",
    tipo: "janela",
    de: 1,
    ate: 3,
    acaoInterna: "Revisar plano inicial",
    entregaAoCliente: "Guia, responsável e próximos passos",
  },
  {
    id: "ate_d7",
    rotulo: "Até D7",
    tipo: "limite",
    de: 0,
    ate: 7,
    acaoInterna: "Registrar primeiro valor verificável",
    entregaAoCliente: "Plano, checklist, confirmação de documento ou achado aprovado",
  },
  {
    id: "d10",
    rotulo: "D10",
    tipo: "ponto",
    de: 10,
    ate: 10,
    acaoInterna: "Alerta interno de ausência de touchpoint",
    entregaAoCliente: "Revisar atualização contextualizada",
  },
  {
    id: "d14",
    rotulo: "D14",
    tipo: "ponto",
    de: 14,
    ate: 14,
    acaoInterna: "Alerta crítico",
    entregaAoCliente: "Preparar comunicação contextualizada",
  },
  {
    id: "d30",
    rotulo: "D30",
    tipo: "ponto",
    de: 30,
    ate: 30,
    acaoInterna: "Tarefa de check-in humano",
    entregaAoCliente: "Check-in humano",
    aprovacaoExtra: "NPS somente se aprovado",
  },
];

/** O plano do caso cobre este momento, e como. */
export type Cobertura =
  /** Há entrada do plano caindo dentro do momento. */
  | "coberto"
  /** A norma pede, o plano do caso não tem nada ali. */
  | "descoberto";

export type MomentoAvaliado = {
  momento: MomentoCadencia;
  situacao: SituacaoCadencia;
  cobertura: Cobertura;
  /** Rótulos das entradas do plano que caem neste momento. */
  cobertoPor: string[];
  /** Data de início do momento (ISO), quando há D0. */
  deEm: string | null;
  /** Data de fim do momento (ISO), quando há D0. */
  ateEm: string | null;
};

export type LeituraD0D30 = {
  inicio: string | null;
  momentos: MomentoAvaliado[];
  resumo: {
    total: number;
    cobertos: number;
    descobertos: number;
    atrasados: number;
    emCurso: number;
  };
  /** Os momentos que a norma pede e o plano não previu. */
  lacunas: string[];
};

/**
 * Exportadas para `cadencia-d31-d365.ts` reaproveitar sem duplicar: a régua
 * D0–D365 é uma escada só, transcrita em dois arquivos por causa do tamanho
 * das duas normas-fonte (§10.3 e o Mapa de Cadências), não duas lógicas.
 */
export function soODia(valor: string | Date): number | null {
  const d = valor instanceof Date ? valor : new Date(valor);
  const t = d.getTime();
  if (Number.isNaN(t)) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function dia(baseUtc: number, offset: number): string {
  return new Date(baseUtc + offset * 86400000).toISOString().slice(0, 10);
}

/**
 * Situação de um momento da norma.
 *
 * A janela ("D1–D3") e o teto ("até D7") não são pontos: entre o começo e o
 * fim, o momento está ABERTO — não vencido nem futuro. Tratar janela como
 * ponto colocaria D1–D3 em atraso já no dia 2, o que é falso.
 */
export function situarMomento(
  m: MomentoCadencia,
  inicioUtc: number | null,
  hojeUtc: number,
  cobertura: Cobertura,
): SituacaoCadencia {
  if (inicioUtc === null) return "aguardando_inicio";

  const deUtc = inicioUtc + m.de * 86400000;
  const ateUtc = inicioUtc + m.ate * 86400000;

  if (hojeUtc < deUtc) return "previsto";
  if (hojeUtc > ateUtc) {
    /*
      Passou do momento. Se o plano cobria, quem sabe se foi cumprido é o
      registro da entrega, não este módulo — e afirmar "cumprido" sem esse
      registro seria inventar. A resposta honesta para um momento coberto e
      vencido é "no prazo do plano": a norma foi prevista; a execução é
      responsabilidade da cadência do próprio caso.
    */
    return cobertura === "coberto" ? "previsto" : "atrasado";
  }
  // Dentro do momento: hoje é dia de agir.
  return "vence_hoje";
}

/**
 * Confronta a norma D0–D30 com o plano de um caso.
 *
 * Recebe a cadência já lida do caso (`lerCadenciaOnboarding`) para não ler
 * banco nem repetir a conversão de prazos — a fonte de "o que o plano prevê"
 * continua sendo uma só.
 */
export function lerCadenciaD0D30(args: {
  cadenciaDoCaso: CadenciaOnboarding;
  hoje?: Date | string;
}): LeituraD0D30 {
  const { cadenciaDoCaso } = args;
  const hojeUtc = soODia(args.hoje ?? new Date()) ?? 0;
  const inicio = cadenciaDoCaso.inicio;
  const inicioUtc = inicio ? soODia(inicio) : null;

  const datadas = cadenciaDoCaso.entradas.filter(
    (e): e is typeof e & { dias: number } => typeof e.dias === "number",
  );

  const momentos: MomentoAvaliado[] = CADENCIA_D0_D30.map((m) => {
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

/**
 * A frase de abertura da escada — o que dizer antes de qualquer número.
 *
 * Nunca afirma atraso sem âncora. Quando o plano não cobre a norma, isso é o
 * que importa dizer, com ou sem data de início: a lacuna existe desde já.
 */
export function leituraD0D30(l: LeituraD0D30): string {
  if (l.resumo.descobertos > 0) {
    const quais = l.lacunas.join(", ");
    return l.resumo.descobertos === 1
      ? `O plano deste caso não prevê nada em ${quais}, que a norma pede.`
      : `O plano deste caso não prevê nada em ${quais} — ${l.resumo.descobertos} dos ${l.resumo.total} momentos da norma.`;
  }
  if (!l.inicio)
    return "O plano cobre os seis momentos da norma. As datas aparecem quando o onboarding começar.";
  if (l.resumo.emCurso > 0) {
    return `${l.resumo.emCurso} ${l.resumo.emCurso === 1 ? "momento aberto" : "momentos abertos"} hoje.`;
  }
  return "O plano cobre os seis momentos da norma, e nenhum está aberto hoje.";
}

/** Rótulo e sinal por situação — reaproveita a paleta já validada. */
export const TOM_D0_D30 = TOM_CADENCIA;
