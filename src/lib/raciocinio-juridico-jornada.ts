/**
 * Motor jurídico — raciocínio explicável por fase da jornada (P12, 25/09/2026).
 *
 * Pedido da Proprietária: "construa e execute o raciocínio do motor jurídico
 * não necessariamente precisa ter Score pois é algo interno, quando me referi
 * a contexto leia novamente o material do planejador de cidadania lá traz o
 * contexto jurídico de cada país em conjunto com a sua jornada." Fonte:
 * docs/arquitetura/contexto-motor-cidadania-v1.0.md (02/09/2026) — seções
 * "Regras de execução", "Painel do caso" e "Registro jurídico".
 *
 * Camada pura: só reorganiza o que já existe. Não recalcula pendências (usa
 * o resultado de `avaliarValidacaoJuridicaCaso`), não cria tabela nova, não
 * calcula placar/percentual/veredito — o próprio documento-fonte proíbe
 * "percentual de chance jurídica". `case_plans.fase_jornada` (8 valores do
 * CHECK real, `FASES_JORNADA` de `onboarding-jornada.ts`) é a jornada única;
 * "ato formal" (`AtoFormal`) é o mesmo vocabulário de
 * `validacao-juridica-caso.ts`, nenhuma taxonomia nova.
 */
import type { AtoFormal, PendenciaJuridicaCaso, ResultadoValidacaoJuridicaCaso } from "@/lib/validacao-juridica-caso";
import { FASES_JORNADA, type FaseJornada } from "@/lib/onboarding-jornada";

/**
 * Ato(s) formal(is) predominante(s) esperado(s) em cada fase da jornada —
 * organiza o vocabulário já existente de `AtoFormal`, não inventa um novo.
 * Correlação feita a partir do próprio pipeline do documento-fonte: aceite/
 * formalização → assinatura; pesquisa → conteúdo jurídico publicável;
 * preparação documental/protocolo → marcos de procedimento; reconhecimento →
 * decisão humana registrada antes de liberar qualquer conteúdo.
 */
export const ATOS_PREDOMINANTES_POR_FASE: Record<FaseJornada, readonly AtoFormal[]> = {
  aceite_e_formalizacao: ["assinatura", "acesso_sensivel_menor"],
  onboarding: ["acesso_sensivel_menor"],
  pesquisa_inicial: ["publicacao_juridica"],
  pesquisa_e_validacao: ["publicacao_juridica"],
  preparacao_documental: ["publicacao_juridica", "protocolo"],
  protocolo_e_acompanhamento: ["protocolo"],
  reconhecimento: ["publicacao_juridica", "protocolo"],
  pos_reconhecimento: ["publicacao_juridica"],
};

export type FocoJuridicoFase = { foco: string; fonte: string };

/**
 * Foco jurídico típico de cada fase — transcrito das seções "Regras de
 * execução" (itens 1–11), "Painel do caso" e "Registro jurídico" do
 * documento-fonte. Descreve o que a fase pede verificar, nunca conclui
 * elegibilidade nem substitui revisão humana.
 */
export const FOCO_JURIDICO_POR_FASE: Record<FaseJornada, FocoJuridicoFase> = {
  aceite_e_formalizacao: {
    foco: "Confirmar hipótese-país declarada e resolver pendências de tema contratual/representação de menor antes da assinatura — o Planejador não cria SKU, preço ou link.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Comercial' e 'Regras de execução' (item 11)",
  },
  onboarding: {
    foco: "Registrar pessoas, locais, datas, documentos e objetivo da hipótese-país inicial (estado DECLARADA/INDICIO_GENEALOGICO) — ainda sem revisão jurídica formal.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Regras de execução' (itens 1–3) e 'Estados'",
  },
  pesquisa_inicial: {
    foco: "Selecionar rota versionada compatível com a hipótese e montar a transmissão por geração, sem presumir continuidade sem prova.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Regras de execução' (itens 4–6)",
  },
  pesquisa_e_validacao: {
    foco: "Testar os eventos críticos do país (naturalização, perda, renúncia, casamento, filiação, adoção, idioma, residência, exílio, prazo) e encontrar o menor conjunto de provas que reduz incerteza.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Regras de execução' (itens 7–8) e 'Matriz jurídica inicial'",
  },
  preparacao_documental: {
    foco: "Reunir a evidência prioritária da rota (grade documental: documento, força probatória, regra desbloqueada) já listada para o país.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Grade documental' e documentos prioritários da trilha",
  },
  protocolo_e_acompanhamento: {
    foco: "Confirmar marcos de procedimento/prazo vigentes junto à autoridade antes do protocolo formal.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Registro jurídico' (autoridade e canal) e 'Bloqueios'",
  },
  reconhecimento: {
    foco: "Exigir revisão humana e decisão registrada (VALIDADA_HUMANAMENTE) antes de liberar qualquer conteúdo ou escopo comercial ligado ao reconhecimento.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Estados' e 'Regras de execução' (itens 9–11)",
  },
  pos_reconhecimento: {
    foco: "Verificar marcos residuais do país após o reconhecimento (ex.: renúncia, dupla cidadania, registros derivados) ainda pendentes de revisão.",
    fonte: "contexto-motor-cidadania-v1.0.md — 'Registro jurídico' (aquisição, perda, renúncia e dupla cidadania)",
  },
};

export type RaciocinioJuridicoFase = {
  faseId: FaseJornada | null;
  faseRotulo: string;
  focoJuridico: FocoJuridicoFase | null;
  pendenciasDaFase: PendenciaJuridicaCaso[];
  pendenciasDeOutrasFases: PendenciaJuridicaCaso[];
  alertaInternoPais: string | null;
  semRotaAplicavel: boolean;
};

function faseValida(valor: string | null | undefined): FaseJornada | null {
  if (!valor) return null;
  const encontrada = FASES_JORNADA.find((f) => f.id === valor);
  return encontrada ? (encontrada.id as FaseJornada) : null;
}

/**
 * Conecta o resultado já calculado de `avaliarValidacaoJuridicaCaso` à fase
 * atual da jornada do caso. `alertaInternoPais` é o texto já registrado em
 * `citizenship_tracks.riscos_internos` — nunca recombinado num indicador
 * único, sempre exibido como está.
 */
export function raciocinarJuridicoPorFase(entrada: {
  faseJornada: string | null | undefined;
  validacao: ResultadoValidacaoJuridicaCaso;
  alertaInternoPais: string | null;
}): RaciocinioJuridicoFase {
  const faseId = faseValida(entrada.faseJornada);
  const faseRotulo = faseId
    ? (FASES_JORNADA.find((f) => f.id === faseId)?.rotulo ?? faseId)
    : "Sem fase da jornada registrada";
  const focoJuridico = faseId ? FOCO_JURIDICO_POR_FASE[faseId] : null;
  const atosDaFase = faseId ? ATOS_PREDOMINANTES_POR_FASE[faseId] : [];

  const pendenciasDaFase = entrada.validacao.pendencias.filter((p) => atosDaFase.includes(p.atoAfetado));
  const pendenciasDeOutrasFases = entrada.validacao.pendencias.filter((p) => !atosDaFase.includes(p.atoAfetado));

  return {
    faseId,
    faseRotulo,
    focoJuridico,
    pendenciasDaFase,
    pendenciasDeOutrasFases,
    alertaInternoPais: entrada.alertaInternoPais,
    semRotaAplicavel: entrada.validacao.semRotaAplicavel,
  };
}
