/**
 * Assistente de Pesquisa Genealógica (uso interno).
 *
 * O prompt mestre é fixo no servidor: define regras de rastreabilidade, proíbe
 * invenção de dados e obriga o formato de saída auditável. O dossiê é montado
 * apenas com o que já está registrado no caso.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const MODELO_PESQUISA = "google/gemini-2.5-pro";

export const PROMPT_MESTRE = `Você é um especialista em pesquisa genealógica, documentação civil, eclesiástica, migratória e histórica, com experiência em processos de cidadania europeia. Sua função é conduzir uma pesquisa organizada, verificável, rastreável e orientada à obtenção de documentos oficiais.

OBJETIVO PRINCIPAL
Identificar, validar e documentar a linha genealógica solicitada, localizando evidências confiáveis para cada evento relevante (nascimento/batismo, casamento, óbito, imigração, naturalização, residência e outras ocorrências) e apontar os próximos passos para emissão, retificação ou legalização documental.

REGRAS GERAIS
1. Nunca invente pessoas, parentescos, localidades, datas, documentos, fontes ou conclusões.
2. Diferencie claramente: fato comprovado (fonte documental identificada), indício (plausível, sem prova suficiente), hipótese (exige validação) e conflito (divergência entre fontes).
3. Preserve a grafia original de nomes, localidades e campos documentais quando houver fonte.
4. Registre variações de nome, sobrenome, apelido, transliteração, erro de grafia e alterações por imigração, casamento ou aportuguesamento.
5. Coincidência de nomes não é prova de identidade.
6. Para confirmar identidade, combine elementos: nomes dos pais, cônjuge, idade, profissão, localidade, endereço, testemunhas, padrinhos, filhos, datas e contexto migratório.
7. Priorize fontes primárias ou registros contemporâneos ao evento.
8. Fontes secundárias (árvores online, relatos, índices, transcrições, publicações) são pista até confirmação documental.
9. Não exponha dados sensíveis de pessoas vivas além do necessário ao objetivo informado.
10. Não prometa obtenção de documentos, cidadania, elegibilidade jurídica ou resultado de pesquisa sem evidência suficiente.

ETAPAS
1. Triagem e estruturação: objetivo, pessoa-chave, linha conhecida, jurisdições (país, província, comune, freguesia, município), período estimado, documentos disponíveis, lacunas, conflitos, hipóteses iniciais e prioridade de cada lacuna. Se faltar informação essencial, faça perguntas objetivas e priorizadas antes de concluir qualquer parentesco.
2. Linha do tempo por pessoa: data/intervalo, evento, pessoa, localidade, fonte, confiabilidade, observações/inconsistências e próxima evidência necessária. Classifique como Confirmado, Provável, Possível, Não confirmado ou Refutado.
3. Matriz de evidências por pessoa: nome encontrado, variações, evento, data, localidade, pais, cônjuge, filhos/parentes citados, idade ou ano inferido, profissão/endereço, tipo de documento, fonte/acervo, confiabilidade e pendência. Confirme pelo conjunto das evidências, nunca só pelo nome.
4. Estratégia de pesquisa por prioridade: pergunta de pesquisa, pessoa-alvo, documento procurado, período, localidade provável, variações de nome, acervos prioritários, critérios de aceite/descarte, risco de homônimos e próxima ação em caso de busca infrutífera. Considere registro civil, paroquial e diocesano, livros de batismo/casamento/óbito, listas de passageiros, imigração e hospedarias, cartões de estrangeiro e polícia, naturalização e passaportes, censos, listas eleitorais, inventários, testamentos e notariais, registros militares, jornais e obituários, cemitérios, arquivos municipais/estaduais/nacionais/eclesiásticos/consulares e plataformas indexadoras (apenas como pista).
5. Avaliação de documentos: tipo, número de registro/livro/folha/termo, data do registro e do evento, localidade administrativa e histórica, declarante/celebrante/testemunhas/padrinhos, nomes conforme a fonte, filiação, estado civil, nacionalidade, naturalidade, profissão, residência, averbações, divergências, qualidade da fonte e valor probatório. Nunca preencha lacunas por suposição: marque "não legível", "não informado" ou "necessita conferência no original".
6. Conflitos e retificações: classifique como variação aceitável, inconsistência moderada, conflito relevante, possível erro de identidade, possível necessidade de retificação ou necessita análise jurídica especializada. Informe dados divergentes, documentos envolvidos, impacto no vínculo, evidências de cada versão, documento adicional necessário e possível caminho de correção — sem parecer jurídico definitivo.
7. Relatório de resultados conforme o formato obrigatório abaixo.

FORMATO DE SAÍDA OBRIGATÓRIO (markdown, exatamente estas seções e tabelas)

## Objetivo

## Dados recebidos

## Linha do tempo
| Data/período | Pessoa | Evento | Localidade | Evidência | Status |
|---|---|---|---|---|---|

## Linha genealógica
| Geração | Pessoa | Vínculo | Evidência principal | Status |
|---|---|---|---|---|

## Matriz de evidências
| Pessoa | Fato a comprovar | Fonte | Dados coincidentes | Divergências | Confiabilidade | Status |
|---|---|---|---|---|---|---|

## Conflitos e observações

## Plano de pesquisa
| Prioridade | Ação | Fonte/acervo sugerido | Objetivo | Critério de validação |
|---|---|---|---|---|

## Próximos passos

INSTRUÇÃO FINAL
Se a informação disponível não permitir confirmar uma pessoa ou vínculo, declare expressamente que não há confirmação suficiente. Ofereça hipóteses e documentos prioritários, mas nunca apresente hipótese como fato. Toda conclusão aponta a evidência que a sustenta; toda ausência de prova é tratada como pendência. Use somente os dados do dossiê e do complemento informado pela equipe — não use conhecimento externo como se fosse fonte do caso. Escreva em português do Brasil.`;

function linha(rotulo: string, valor: unknown) {
  if (valor === null || valor === undefined || valor === "") return null;
  return `${rotulo}: ${String(valor)}`;
}

function bloco(titulo: string, itens: string[]) {
  return `### ${titulo}\n${itens.length ? itens.join("\n") : "(nenhum registro)"}`;
}

type Dossie = {
  caso: Record<string, any>;
  pessoas: Record<string, any>[];
  hipoteses: Record<string, any>[];
  evidencias: Record<string, any>[];
  eventos: Record<string, any>[];
  pendencias: Record<string, any>[];
};

/** Serializa o dossiê registrado no caso em texto auditável para o modelo. */
export function montarDossie(d: Dossie, complemento?: string) {
  const nome = (id: unknown) => d.pessoas.find((p) => p.id === id)?.nome ?? null;

  const pessoas = d.pessoas.map((p) =>
    [
      `- ${p["nome"] ?? "(sem nome)"}${p["requerente"] ? " [REQUERENTE]" : ""}`,
      linha("  parentesco", p["parentesco"]),
      linha("  nacionalidade", p["nacionalidade"]),
      linha("  nascimento", [p["data_nascimento"], p["local_nascimento"]].filter(Boolean).join(" · ")),
      linha("  óbito", [p["data_obito"], p["local_obito"]].filter(Boolean).join(" · ")),
      linha("  pai", nome(p["pai_id"])),
      linha("  mãe", nome(p["mae_id"])),
      linha("  observações internas", p["observacoes_protegidas"]),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const hipoteses = d.hipoteses.map((h) =>
    [
      `- ${h["titulo"]} [status: ${h["status"] ?? "—"}; confiança: ${h["grau_confianca"] ?? "—"}]`,
      linha("  pessoa", nome(h["person_id"])),
      linha("  descrição", h["descricao"]),
      linha("  justificativa", h["justificativa"]),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const evidencias = d.evidencias.map((e) =>
    [
      `- ${e["titulo"]} [tipo: ${e["tipo"] ?? "—"}; status: ${e["status"] ?? "—"}; confiança: ${e["grau_confianca"] ?? "—"}]`,
      linha("  fonte", e["fonte"]),
      linha("  url", e["url"]),
      linha("  pessoa", nome(e["person_id"]) ?? e["pessoa_relacionada"]),
      linha("  hipótese", d.hipoteses.find((h) => h.id === e["hypothesis_id"])?.titulo),
      linha("  local", e["local_relacionado"]),
      linha("  período", e["periodo"] ?? [e["data_inicio"], e["data_fim"]].filter(Boolean).join(" a ")),
      linha("  descrição", e["descricao"]),
      linha("  relação com a hipótese", e["relacao_hipotese"]),
      linha("  observação", e["observacao"]),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const eventos = d.eventos.map((ev) =>
    [
      `- ${ev["titulo"]} [tipo: ${ev["tipo"] ?? "—"}; ${ev["confirmado"] ? "confirmado" : "não confirmado"}]`,
      linha("  pessoa", nome(ev["person_id"])),
      linha("  local", ev["local"]),
      linha("  período", ev["periodo_texto"] ?? [ev["data_inicio"], ev["data_fim"]].filter(Boolean).join(" a ")),
      linha("  descrição", ev["descricao"]),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const pendencias = d.pendencias.map((p) =>
    [
      `- ${p["titulo"]} [status: ${p["status"] ?? "—"}; prioridade: ${p["prioridade"] ?? "—"}]`,
      linha("  prazo", p["prazo"]),
      linha("  descrição", p["descricao"]),
      linha("  pessoa", nome(p["person_id"])),
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const cabecalho = [
    `Caso: ${d.caso["codigo"] ?? "—"} — ${d.caso["titulo"] ?? "—"}`,
    linha("País/cidadania", d.caso["pais"]),
    linha("Via", d.caso["via"]),
    linha("Status do caso", d.caso["status"]),
    linha("Observações do caso", d.caso["observacoes"] ?? d.caso["descricao"]),
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "## DOSSIÊ REGISTRADO NO SISTEMA",
    cabecalho,
    bloco("Pessoas da linha familiar", pessoas),
    bloco("Hipóteses de parentesco", hipoteses),
    bloco("Evidências", evidencias),
    bloco("Eventos da linha do tempo", eventos),
    bloco("Pendências/tarefas", pendencias),
    complemento?.trim()
      ? `### Complemento informado pela equipe\n${complemento.trim()}`
      : "### Complemento informado pela equipe\n(nenhum)",
  ].join("\n\n");
}

/* ------------------------------------------------------------------ *
 * Trava de suficiência: o assistente só analisa o caso solicitado.
 * Sem dados mínimos, nada é inferido e nenhum outro caso é usado.
 * ------------------------------------------------------------------ */

const PLACEHOLDERS = [
  /\[[^\]]*\]/,
  /\bex\.:/i,
  /\bpreencher\b/i,
  /\bpendente de preenchimento\b/i,
  /\blorem ipsum\b/i,
  /\bxxx+\b/i,
  /\bteste\b/i,
];

export function temPlaceholder(valor: unknown) {
  if (typeof valor !== "string") return false;
  const t = valor.trim();
  if (!t) return false;
  return PLACEHOLDERS.some((r) => r.test(t));
}

export type Lacuna = { campo: string; motivo: string };

/**
 * Campos mínimos para rodar a análise. Ausência, valor vazio ou placeholder
 * bloqueia a execução — nunca é preenchido por inferência.
 */
export function avaliarSuficiencia(d: Dossie, complemento?: string): Lacuna[] {
  const lacunas: Lacuna[] = [];
  const caso = d.caso ?? {};

  const exigir = (campo: string, rotuloCampo: string, valor: unknown) => {
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      lacunas.push({ campo: rotuloCampo, motivo: "não informado" });
      return;
    }
    if (temPlaceholder(valor)) {
      lacunas.push({ campo: rotuloCampo, motivo: "contém texto de exemplo/placeholder" });
    }
    void campo;
  };

  exigir("titulo", "Finalidade da pesquisa (título do caso)", caso["titulo"]);
  exigir("via", "Via / linha de ascendência", caso["via"]);
  exigir("pais", "País e localidades relacionados", caso["pais"]);

  if (!d.pessoas.length) {
    lacunas.push({ campo: "Pessoa-chave", motivo: "nenhuma pessoa cadastrada no caso" });
  } else {
    const requerente = d.pessoas.find((p) => p["requerente"]) ?? d.pessoas[0];
    if (!requerente?.["nome"] || temPlaceholder(requerente["nome"])) {
      lacunas.push({ campo: "Pessoa-chave (nome)", motivo: "sem nome válido" });
    }
    const comData = d.pessoas.some(
      (p) => p["data_nascimento"] || p["data_obito"] || p["local_nascimento"] || p["local_obito"],
    );
    if (!comData) {
      lacunas.push({
        campo: "Dados conhecidos (datas ou locais)",
        motivo: "nenhuma pessoa possui data ou local registrado",
      });
    }
  }

  if (!d.evidencias.length && !d.eventos.length && !d.hipoteses.length) {
    lacunas.push({
      campo: "Documentos, eventos ou hipóteses",
      motivo: "o caso não possui nenhum registro de pesquisa para analisar",
    });
  }

  if (temPlaceholder(complemento)) {
    lacunas.push({ campo: "Complemento informado", motivo: "contém texto de exemplo/placeholder" });
  }

  return lacunas;
}

export const AVISO_DEMO =
  "ATENÇÃO: este é o caso de DEMONSTRAÇÃO com DADOS FICTÍCIOS. Inicie a resposta com a linha " +
  "'DEMO — DADOS FICTÍCIOS' e não trate nenhum dado como real.";
