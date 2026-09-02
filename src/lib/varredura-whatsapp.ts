/**
 * Varredura de conversa do WhatsApp — o dump vira material de Discovery.
 *
 * A Proprietária descreveu o descompasso:
 *
 *   "o painel de calls discovery hoje está em puro form ok dropdown, mas na
 *    realidade o que vinha acontecendo era eu fazia um dump do WhatsApp do
 *    prospect."
 *
 * O Desk pedia campos estruturados; a vida entrega conversa. Este módulo fica
 * no meio: lê a conversa, aponta o que parece responder a cada campo do
 * roteiro, e mostra o TRECHO de onde tirou.
 *
 * Três limites que o desenho respeita, e que não são timidez:
 *
 * 1. Nada é preenchido sozinho. A saída é candidato com evidência, para um
 *    humano aceitar ou descartar. Preencher `geracao_ascendente` porque
 *    alguém escreveu "meu avô" seria transformar menção em fato.
 * 2. Nada aqui conclui elegibilidade, via jurídica, prazo ou preço. O próprio
 *    roteiro de Discovery diz que toda triagem é preliminar e interna.
 * 3. Precisão acima de cobertura. Seis achados sólidos com trecho valem mais
 *    que trinta palpites — porque trinta palpites obrigam a conferir tudo, e
 *    aí some a economia de tempo que era o objetivo.
 *
 * Camada pura: não lê banco, não grava, não envia. A conversa é dado pessoal
 * de terceiro e este módulo não a persiste em lugar nenhum.
 */

export type MensagemWhatsApp = {
  /** ISO, quando a data do dump é legível. */
  quando: string | null;
  /** Como veio no dump, sem normalizar — é nome de gente. */
  autor: string | null;
  texto: string;
  /** Posição na conversa, para ordenar quando não há data. */
  ordem: number;
};

/**
 * Formatos de exportação que o WhatsApp usa hoje.
 *
 * O app varia por plataforma e idioma: iOS usa colchetes, Android usa hífen; a
 * hora vem com ou sem segundos, em 24h ou com AM/PM. Cada variação abaixo saiu
 * de um formato real, não de suposição.
 */
const PADROES: RegExp[] = [
  // [26/08/2026, 14:32:05] Fulano: texto      (iOS)
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\]\s*([^:]{1,80}?):\s*([\s\S]*)$/,
  // 26/08/2026 14:32 - Fulano: texto          (Android)
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\s*[-–]\s*([^:]{1,80}?):\s*([\s\S]*)$/,
];

function quatroDigitos(ano: string): number {
  const n = Number(ano);
  return n < 100 ? 2000 + n : n;
}

/**
 * Lê o dump linha a linha.
 *
 * Linha que não casa com nenhum padrão é continuação da mensagem anterior —
 * mensagem com quebra de linha é comum, e descartá-la perderia justamente as
 * respostas longas, que são as que interessam.
 */
export function lerConversa(bruto: string): MensagemWhatsApp[] {
  const linhas = String(bruto ?? "").split(/\r?\n/);
  const mensagens: MensagemWhatsApp[] = [];

  for (const linha of linhas) {
    let casou = false;
    for (const padrao of PADROES) {
      const m = padrao.exec(linha.trim());
      if (!m) continue;
      const [, d, mes, ano, hora, min, seg, meridiano, autor, texto] = m;
      let h = Number(hora);
      if (meridiano) {
        const pm = /p/i.test(meridiano);
        if (pm && h < 12) h += 12;
        if (!pm && h === 12) h = 0;
      }
      const data = new Date(
        Date.UTC(quatroDigitos(ano), Number(mes) - 1, Number(d), h, Number(min), Number(seg ?? 0)),
      );
      mensagens.push({
        quando: Number.isNaN(data.getTime()) ? null : data.toISOString(),
        autor: autor.trim() || null,
        texto: texto.trim(),
        ordem: mensagens.length,
      });
      casou = true;
      break;
    }
    if (!casou && mensagens.length && linha.trim()) {
      // Continuação: a mensagem anterior tinha quebra de linha.
      mensagens[mensagens.length - 1].texto += `\n${linha.trim()}`;
    }
  }

  return mensagens;
}

/** Campos do roteiro de Discovery que esta varredura sabe procurar. */
export type CampoVarrido =
  | "nacionalidades_interesse"
  | "geracao_ascendente"
  | "linha_transmissao"
  | "documentos_chave"
  | "estrutura_familiar"
  | "objecao_predominante";

export type Achado = {
  campo: CampoVarrido;
  /** O valor candidato, já normalizado para o vocabulário do Desk. */
  valor: string;
  /** O trecho exato da conversa. A evidência viaja junto, sempre. */
  trecho: string;
  autor: string | null;
  quando: string | null;
  /** Quantas vezes o sinal apareceu. Repetição é sinal, não certeza. */
  ocorrencias: number;
};

type Regra = { campo: CampoVarrido; valor: string; padrao: RegExp };

/*
  As regras são explícitas e conservadoras. Cada uma nasceu de uma pergunta do
  roteiro, e nenhuma tenta adivinhar o que a conversa não disse com todas as
  letras. Localidade e data ficaram DE FORA de propósito: "Santa Maria" pode
  ser cidade, paróquia ou nome de pessoa, e um palpite errado aqui manda a
  pesquisa para o lugar errado — custo alto demais para um ganho pequeno.
*/
/*
  Fronteira que entende acento.

  `\b` do JavaScript é ASCII: para o motor, "ô" já é caractere de NÃO-palavra.
  Então `/\bbisav[ô]\b/` nunca casa com "bisavô" — não há transição entre
  palavra e não-palavra depois do "ô". O mesmo vale para "óbito", que começa
  com acento. O teste pegou isto: a varredura achava "avós" (termina em s) e
  perdia "bisavô".

  Estes lookarounds substituem `\b` onde há acento envolvido: exigem que não
  haja outra letra colada, incluindo as acentuadas.
*/
const ANTES = "(?<![a-zà-öø-ÿ])";
const DEPOIS = "(?![a-zà-öø-ÿ])";
const re = (corpo: string) => new RegExp(`${ANTES}(?:${corpo})${DEPOIS}`, "i");

const REGRAS: Regra[] = [
  // Países — o roteiro pergunta "há algum país como ponto de partida?".
  { campo: "nacionalidades_interesse", valor: "Itália", padrao: re("it[áa]lia|italian[ao]s?") },
  {
    campo: "nacionalidades_interesse",
    valor: "Portugal",
    padrao: re("portugal|portugu[êe]s(?:a|es)?"),
  },
  {
    campo: "nacionalidades_interesse",
    valor: "Espanha",
    padrao: re("espanha|espanh[óo]l(?:a|es)?"),
  },
  { campo: "nacionalidades_interesse", valor: "Alemanha", padrao: re("alemanha|alem[ãa][on]?s?") },
  {
    campo: "nacionalidades_interesse",
    valor: "Áustria",
    padrao: re("[áa]ustria|austr[íi]ac[ao]s?"),
  },
  {
    campo: "nacionalidades_interesse",
    valor: "Polônia",
    padrao: re("pol[ôo]nia|polon[êe]s(?:a|es)?"),
  },

  // Grau do ascendente. A ordem importa: "bisavô" contém "avô", então o mais
  // específico precisa ser testado — e é por isso que cada padrão exige que
  // nada venha colado antes.
  {
    campo: "geracao_ascendente",
    valor: "trisavô ou tataravô",
    padrao: re("trisav[ôoó]s?|tatarav[ôoó]s?"),
  },
  { campo: "geracao_ascendente", valor: "bisavô ou bisavó", padrao: re("bisav[ôoó]s?") },
  { campo: "geracao_ascendente", valor: "avô ou avó", padrao: re("av[ôoó]s?") },
  { campo: "geracao_ascendente", valor: "pai ou mãe", padrao: re("meu pai|minha m[ãa]e") },

  // Linha de transmissão — "paterna, materna ou a confirmar?".
  {
    campo: "linha_transmissao",
    valor: "paterna",
    padrao: re("paterna|(?:lado|linha|parte) do (?:meu )?pai"),
  },
  {
    campo: "linha_transmissao",
    valor: "materna",
    padrao: re("materna|(?:lado|linha|parte) da (?:minha )?m[ãa]e"),
  },

  // Documentos — "quais documentos a família já possui?".
  {
    campo: "documentos_chave",
    valor: "certidão de nascimento",
    padrao: re("certid[ãa]o de nascimento|nascimento"),
  },
  {
    campo: "documentos_chave",
    valor: "certidão de casamento",
    padrao: re("certid[ãa]o de casamento|casamento"),
  },
  {
    campo: "documentos_chave",
    valor: "certidão de óbito",
    padrao: re("certid[ãa]o de [óo]bito|[óo]bito"),
  },
  {
    campo: "documentos_chave",
    valor: "naturalização",
    padrao: re("naturaliza[çc][ãa]o|naturalizad[oa]"),
  },
  { campo: "documentos_chave", valor: "passaporte", padrao: re("passaporte") },
  {
    campo: "documentos_chave",
    valor: "registro de batismo",
    padrao: re("batismo|batizad[oa]|par[óo]quia"),
  },
  {
    campo: "documentos_chave",
    valor: "registro de imigração",
    padrao: re("imigra[çc][ãa]o|imigrou|navio|desembarque|desembarcou"),
  },

  // Estrutura familiar — "existem menores, outros titulares?".
  {
    campo: "estrutura_familiar",
    valor: "há menores envolvidos",
    padrao: re("menor(?:es)?|filhos? menor(?:es)?"),
  },
  {
    campo: "estrutura_familiar",
    valor: "mais de um requerente",
    padrao: re(
      "meus irm[ãa]os|minha irm[ãa]|meu irm[ãa]o|(?:para )?(?:a )?fam[íi]lia toda|toda a fam[íi]lia",
    ),
  },

  // Objeção — o roteiro pede "objecao_predominante".
  {
    campo: "objecao_predominante",
    valor: "preço",
    padrao: re("quanto custa|qual o valor|pre[çc]o|caro|or[çc]amento"),
  },
  {
    campo: "objecao_predominante",
    valor: "prazo",
    padrao: re("quanto tempo|demora|prazo|at[ée] quando"),
  },
  {
    campo: "objecao_predominante",
    valor: "decisão adiada",
    padrao: re("vou pensar|preciso conversar com|depois eu (?:vejo|falo|retorno)"),
  },
];

/** Só o que o prospect disse conta para o Discovery — não o que a equipe disse. */
function ehDoProspect(m: MensagemWhatsApp, autoresDaCasa: string[]): boolean {
  if (!m.autor) return true;
  const a = m.autor.trim().toLowerCase();
  return !autoresDaCasa.some((casa) => a.includes(casa.trim().toLowerCase()));
}

function recortar(texto: string, padrao: RegExp): string {
  const m = padrao.exec(texto);
  if (!m) return texto.slice(0, 160);
  const meio = m.index + m[0].length / 2;
  const de = Math.max(0, Math.floor(meio - 80));
  const ate = Math.min(texto.length, Math.floor(meio + 80));
  return `${de > 0 ? "…" : ""}${texto.slice(de, ate).trim()}${ate < texto.length ? "…" : ""}`;
}

export type ResultadoVarredura = {
  mensagens: number;
  /** Quem falou, na ordem em que aparecem. Ajuda a apontar quem é a casa. */
  autores: string[];
  de: string | null;
  ate: string | null;
  achados: Achado[];
  /** Campos do roteiro que a conversa não respondeu. Dito, não omitido. */
  camposSemAchado: CampoVarrido[];
};

export const CAMPOS_VARRIDOS: CampoVarrido[] = [
  "nacionalidades_interesse",
  "geracao_ascendente",
  "linha_transmissao",
  "documentos_chave",
  "estrutura_familiar",
  "objecao_predominante",
];

/**
 * Varre a conversa e devolve candidatos com evidência.
 *
 * `autoresDaCasa` permite excluir as mensagens da própria equipe: quando a
 * Proprietária escreve "você tem certidão de casamento?", isso é pergunta, não
 * resposta, e contá-la como achado inverteria o sentido da conversa.
 */
export function varrerConversa(
  bruto: string,
  opcoes: { autoresDaCasa?: string[] } = {},
): ResultadoVarredura {
  const mensagens = lerConversa(bruto);
  const autoresDaCasa = opcoes.autoresDaCasa ?? [];
  const doProspect = mensagens.filter((m) => ehDoProspect(m, autoresDaCasa));

  const porChave = new Map<string, Achado>();

  for (const m of doProspect) {
    for (const regra of REGRAS) {
      if (!regra.padrao.test(m.texto)) continue;
      const chave = `${regra.campo}::${regra.valor}`;
      const existente = porChave.get(chave);
      if (existente) {
        existente.ocorrencias += 1;
        continue;
      }
      porChave.set(chave, {
        campo: regra.campo,
        valor: regra.valor,
        trecho: recortar(m.texto, regra.padrao),
        autor: m.autor,
        quando: m.quando,
        ocorrencias: 1,
      });
    }
  }

  const achados = [...porChave.values()].sort(
    (a, b) =>
      CAMPOS_VARRIDOS.indexOf(a.campo) - CAMPOS_VARRIDOS.indexOf(b.campo) ||
      b.ocorrencias - a.ocorrencias ||
      a.valor.localeCompare(b.valor),
  );

  const comAchado = new Set(achados.map((a) => a.campo));
  const datas = mensagens
    .map((m) => m.quando)
    .filter((d): d is string => !!d)
    .sort();
  const autores = [...new Set(mensagens.map((m) => m.autor).filter((a): a is string => !!a))];

  return {
    mensagens: mensagens.length,
    autores,
    de: datas[0] ?? null,
    ate: datas[datas.length - 1] ?? null,
    achados,
    camposSemAchado: CAMPOS_VARRIDOS.filter((c) => !comAchado.has(c)),
  };
}

export const ROTULO_CAMPO: Record<CampoVarrido, string> = {
  nacionalidades_interesse: "País de interesse",
  geracao_ascendente: "Geração do ascendente",
  linha_transmissao: "Linha de transmissão",
  documentos_chave: "Documentos citados",
  estrutura_familiar: "Estrutura familiar",
  objecao_predominante: "Objeção",
};

/**
 * De-para do valor normalizado do achado (rótulo em português, lido da
 * conversa) para o código de opção controlada do lead (`crm-desk.ts`).
 *
 * Só entra aqui o que tem correspondência inequívoca — na dúvida, fica de
 * fora e o achado continua só como sinal para leitura humana, sem botão de
 * aplicar. Confiança acima de cobertura, mesmo critério do resto do módulo.
 *
 * Os campos de lista (`nacionalidades_interesse`, `documentos_chave`) somam
 * ao que já existe no lead; os demais substituem o valor único do campo.
 */
export const CAMPO_LEAD_POR_VARREDURA: Record<CampoVarrido, { campoLead: string; multi: boolean }> = {
  nacionalidades_interesse: { campoLead: "nacionalidades_interesse", multi: true },
  geracao_ascendente: { campoLead: "geracao_ascendente", multi: false },
  linha_transmissao: { campoLead: "linha_transmissao", multi: false },
  documentos_chave: { campoLead: "documentos_chave", multi: true },
  estrutura_familiar: { campoLead: "estrutura_familiar", multi: false },
  objecao_predominante: { campoLead: "objecao_predominante", multi: false },
};

const CODIGO_POR_CHAVE: Record<string, string> = {
  // nacionalidades_interesse
  "nacionalidades_interesse::Itália": "italiana",
  "nacionalidades_interesse::Portugal": "portuguesa",
  "nacionalidades_interesse::Espanha": "espanhola",
  "nacionalidades_interesse::Alemanha": "alema",
  "nacionalidades_interesse::Áustria": "austriaca",
  "nacionalidades_interesse::Polônia": "polonesa",
  // geracao_ascendente
  "geracao_ascendente::trisavô ou tataravô": "trisavo",
  "geracao_ascendente::bisavô ou bisavó": "bisavo",
  "geracao_ascendente::avô ou avó": "avo",
  "geracao_ascendente::pai ou mãe": "pai_mae",
  // linha_transmissao
  "linha_transmissao::paterna": "paterna",
  "linha_transmissao::materna": "materna",
  // documentos_chave
  "documentos_chave::certidão de nascimento": "certidao_nascimento",
  "documentos_chave::certidão de casamento": "certidao_casamento",
  "documentos_chave::certidão de óbito": "certidao_obito",
  "documentos_chave::naturalização": "naturalizacao_negativa",
  "documentos_chave::passaporte": "passaporte",
  "documentos_chave::registro de batismo": "registro_religioso",
  "documentos_chave::registro de imigração": "registro_imigracao",
  // estrutura_familiar
  "estrutura_familiar::há menores envolvidos": "linha_com_menores",
  // objecao_predominante
  "objecao_predominante::preço": "preco",
  "objecao_predominante::prazo": "prazo",
};

/** Código de opção controlada para o achado, ou `null` quando não há de-para confiável. */
export function codigoLeadDoAchado(achado: Pick<Achado, "campo" | "valor">): string | null {
  return CODIGO_POR_CHAVE[`${achado.campo}::${achado.valor}`] ?? null;
}
