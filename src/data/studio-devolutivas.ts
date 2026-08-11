/**
 * Studio de Devolutivas — mock local de interface (preview interno).
 * Sem persistência, sem integração, sem envio. Apenas dados demonstrativos.
 */

export type EstadoValidacao =
  | "familia"
  | "pesquisa"
  | "validacao_documental"
  | "validado_documento"
  | "pendente";

export const ESTADOS_VALIDACAO: { id: EstadoValidacao; label: string; tom: string }[] = [
  { id: "familia", label: "Informação compartilhada pela família", tom: "border-areia bg-areia/70 text-navy" },
  { id: "pesquisa", label: "Dado de pesquisa inicial", tom: "border-navy/25 bg-navy/5 text-navy" },
  {
    id: "validacao_documental",
    label: "Referência de pesquisa — em validação documental",
    tom: "border-gold/50 bg-gold/15 text-navy",
  },
  { id: "validado_documento", label: "Validado por documento", tom: "border-sage/40 bg-sage/10 text-sage" },
  { id: "pendente", label: "Pendente de confirmação", tom: "border-navy/15 bg-navy/[0.03] text-navy/70" },
];

export const rotuloEstado = (e: EstadoValidacao) =>
  ESTADOS_VALIDACAO.find((x) => x.id === e)?.label ?? "Pendente de confirmação";

export const tomEstado = (e: EstadoValidacao) =>
  ESTADOS_VALIDACAO.find((x) => x.id === e)?.tom ?? "border-navy/15 bg-navy/5 text-navy/70";

export type Prioridade = "alta" | "media" | "baixa";

export type AchadoStudio = {
  id: string;
  titulo: string;
  descricao: string;
  estado: EstadoValidacao;
  ordem: number;
  aprovado: boolean;
  alertaDadoPessoal: boolean;
  revisor: string;
  revisadoEm: string;
};

export type PendenciaStudio = {
  id: string;
  descricao: string;
  prioridade: Prioridade;
  ordem: number;
  aprovado: boolean;
  proximoPasso: string;
};

export type WorkflowEstado =
  | "rascunho"
  | "aguardando_revisao"
  | "ajustes"
  | "aprovado_externo"
  | "pronto_diagramacao"
  | "arquivado";

export const WORKFLOW: { id: WorkflowEstado; label: string }[] = [
  { id: "rascunho", label: "Rascunho interno" },
  { id: "aguardando_revisao", label: "Aguardando revisão" },
  { id: "ajustes", label: "Ajustes solicitados" },
  { id: "aprovado_externo", label: "Aprovado para comunicação externa" },
  { id: "pronto_diagramacao", label: "Pronto para diagramação" },
  { id: "arquivado", label: "Arquivado" },
];

export const CHECKLIST_SEGURANCA: { id: string; label: string }[] = [
  { id: "externo", label: "Conteúdo aprovado para comunicação externa" },
  { id: "estados", label: "Todo achado possui estado de validação" },
  { id: "fonte", label: "Não há fonte técnica, URL ou mecanismo exposto" },
  { id: "sensivel", label: "Não há documento cru ou dado sensível" },
  { id: "juridico", label: "Não há conclusão jurídica" },
  { id: "comercial", label: "Não há preço, SKU, link ou cobrança" },
  { id: "prazo", label: "Não há prazo ou garantia" },
  { id: "consentimento", label: "Consentimento aplicável confirmado" },
  { id: "disclaimer", label: "Disclaimer presente" },
  { id: "revisao", label: "Responsável e data de revisão registrados" },
  { id: "termos", label: "Termos proibidos não detectados" },
];

export const TERMOS_PROIBIDOS = [
  "cidadania garantida",
  "elegível",
  "elegivel",
  "viável",
  "viavel",
  "chance de sucesso",
  "percentual de chance",
  "rota garantida",
  "prazo garantido",
  "cura ancestral",
  "trauma herdado",
  "constelação familiar",
  "constelacao familiar",
  "terapia sistêmica",
  "terapia sistemica",
  "personalidade herdada",
  "destino familiar",
];

export function detectarTermos(textos: string[]): string[] {
  const alvo = textos.join(" \n ").toLowerCase();
  return TERMOS_PROIBIDOS.filter((t) => alvo.includes(t));
}

export type DevolutivaStudio = {
  nome: string;
  linha: string;
  contexto: string;
  titulo: string;
  atualizadoEm: string;
  leituraInicial: string;
  achados: AchadoStudio[];
  pendencias: PendenciaStudio[];
  relevancia: string;
  proximaEtapa: {
    titulo: string;
    descricao: string;
    acoes: string[];
    convite: string;
    semPressa: string;
  };
  disclaimer: string;
};

export const DISCLAIMER_PADRAO =
  "Esta é uma leitura inicial baseada nas informações disponíveis até aqui. A continuidade da pesquisa e qualquer estratégia dependem de validação documental e análise humana.";

export const DEVOLUTIVA_DEMO: DevolutivaStudio = {
  nome: "Guilherme Antonio da Silva",
  linha: "Linha familiar italiana Ceronatto em análise",
  contexto: "Brasil e Itália",
  titulo: "Resultado Inicial de Pesquisa",
  atualizadoEm: "Atualizado nesta leitura inicial",
  leituraInicial:
    "Organizamos os primeiros sinais da linha Ceronatto da sua família. Esta leitura é um ponto de partida e ainda depende de confirmação por documentos oficiais antes de indicar qualquer caminho.",
  achados: [
    {
      id: "a1",
      titulo: "Identificação familiar organizada",
      descricao:
        "Os nomes e vínculos iniciais da família foram organizados a partir do que foi compartilhado por vocês.",
      estado: "familia",
      ordem: 1,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a2",
      titulo: "Avós maternos como ponto de partida",
      descricao: "Os avós maternos aparecem como referência inicial para a continuidade da pesquisa.",
      estado: "familia",
      ordem: 2,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a3",
      titulo: "Gaetano Ceronatto",
      descricao: "Aparece como possível ascendente da linha italiana, ainda a confirmar documentalmente.",
      estado: "pesquisa",
      ordem: 3,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a4",
      titulo: "Montecchio Precalcino, Vicenza",
      descricao: "Localidade inicial a confirmar documentalmente.",
      estado: "pesquisa",
      ordem: 4,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a5",
      titulo: "Maria Luisa Budel e Bortolo Ceronato",
      descricao: "Referências familiares iniciais da geração anterior.",
      estado: "pesquisa",
      ordem: 5,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a6",
      titulo: "Cadeia familiar em organização",
      descricao:
        "Possível cadeia Gaetano → Bortolo → Natal → Marilda → Guilherme, ainda em organização e confirmação.",
      estado: "pesquisa",
      ordem: 6,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
    {
      id: "a7",
      titulo: "Ceronatto / Ceronato / Seronato",
      descricao: "Variação de grafia é um ponto de atenção documental entre registros.",
      estado: "validacao_documental",
      ordem: 7,
      aprovado: true,
      alertaDadoPessoal: false,
      revisor: "Equipe de pesquisa",
      revisadoEm: "—",
    },
  ],
  pendencias: [
    {
      id: "p1",
      descricao: "Registro italiano de nascimento do possível ascendente",
      prioridade: "alta",
      ordem: 1,
      aprovado: true,
      proximoPasso: "Pesquisa de registros prioritários",
    },
    {
      id: "p2",
      descricao: "Registros das gerações anteriores, se aplicável",
      prioridade: "media",
      ordem: 2,
      aprovado: true,
      proximoPasso: "Organização da cadeia documental",
    },
    {
      id: "p3",
      descricao: "Certidões brasileiras da cadeia familiar",
      prioridade: "alta",
      ordem: 3,
      aprovado: true,
      proximoPasso: "Organização da cadeia documental",
    },
    {
      id: "p4",
      descricao: "Confirmação das grafias entre registros",
      prioridade: "media",
      ordem: 4,
      aprovado: true,
      proximoPasso: "Validação de grafias e vínculos",
    },
    {
      id: "p5",
      descricao: "Continuidade entre as gerações, sem lacunas",
      prioridade: "baixa",
      ordem: 5,
      aprovado: true,
      proximoPasso: "Mapa de pendências",
    },
  ],
  relevancia:
    "A linha organizada cria um ponto de partida para a pesquisa. Agora, precisamos confirmar os documentos e vínculos entre as gerações.",
  proximaEtapa: {
    titulo: "Estratégia e validação documental da linha familiar",
    descricao:
      "Vamos organizar a cadeia familiar, investigar registros prioritários e entender os próximos caminhos a partir de evidências oficiais.",
    acoes: [
      "Organização da cadeia documental",
      "Pesquisa de registros prioritários",
      "Validação de grafias e vínculos",
      "Mapa de pendências",
    ],
    convite: "Se fizer sentido, posso te explicar como funcionaria esta próxima etapa.",
    semPressa: "Sem pressa e sem compromisso: você decide o ritmo depois de entender o cenário.",
  },
  disclaimer: DISCLAIMER_PADRAO,
};
