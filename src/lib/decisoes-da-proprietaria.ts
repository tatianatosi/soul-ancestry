/**
 * Decisões D-02…D-12 do Adendo Bloco 5A — registradas em código para que
 * `/governanca/decisoes` tenha uma fonte viva, em vez de só o arquivo
 * `docs/decisoes/DECISOES-PENDENTES-DA-PROPRIETARIA-2026-10-01.md`.
 *
 * Por que este módulo existe: a Proprietária reclamou duas vezes ("não
 * estou tendo acesso à lista que depende das minhas decisões") — o doc
 * vivia fora do working dir na primeira vez, e depois de versionado
 * continuava sendo markdown, sem uma tela do Desk para abrir. Este módulo
 * é o mesmo conteúdo, em código, para uma rota poder ler.
 *
 * D-01/D-04/D-05/D-06 (Piloto 5A.1) ficam em `piloto-5a1-decisoes-pendentes.ts`
 * — não duplicados aqui. Este módulo cobre só D-02…D-12.
 *
 * Decididas em 02/10/2026, pela autorização literal da Proprietária
 * ("minhas decisões execute" + "d01 em diante"), registrada por ela mesma
 * (tati@pluggedresearch.com). Fonte: a mensagem de autorização da sessão de
 * 02/10/2026 + `docs/decisoes/DECISOES-PENDENTES-DA-PROPRIETARIA-2026-10-01.md`
 * §2 (lista literal dos 8 códigos D-02/D-03/D-07..D-12).
 */

export type StatusDecisaoProprietaria = "decidida" | "aguardando_decisao_humana";

export type CodigoDecisaoProprietaria =
  | "D-02"
  | "D-03"
  | "D-07"
  | "D-08"
  | "D-09"
  | "D-10"
  | "D-11"
  | "D-12";

export type DecisaoProprietaria = {
  codigo: CodigoDecisaoProprietaria;
  titulo: string;
  area: string;
  pendencia: string;
  status: StatusDecisaoProprietaria;
  valorDecidido: string | null;
  decididoPor: string | null;
  decididoEm: string | null;
};

export const DECISOES_DA_PROPRIETARIA: readonly DecisaoProprietaria[] = [
  {
    codigo: "D-02",
    titulo: "Fonte piloto — qual base do Brasil e qual da Itália começa primeiro",
    area: "Pesquisa",
    pendencia: "Definir o foco inicial do piloto 5A.1 entre as fontes já catalogadas.",
    status: "decidida",
    valorDecidido:
      "Brasil + Itália como piloto técnico de fontes — primeiro par a validar o fluxo " +
      "de catálogo/pesquisa antes de expandir aos demais países do Grupo A.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-03",
    titulo: "País piloto — confirmar Brasil + Itália ou outro par",
    area: "Comercial/Pesquisa",
    pendencia: "Confirmar as nacionalidades do piloto.",
    status: "decidida",
    valorDecidido:
      "Brasil + Itália confirmado como piloto técnico. Áustria + Hungria + Croácia formam " +
      "o primeiro grupo comercial-operacional, em seguida.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-07",
    titulo: "Quem aprova PDF, qual conteúdo e qual template",
    area: "Produto",
    pendencia: "Geração de PDF ao cliente — aprovação, conteúdo e template.",
    status: "decidida",
    valorDecidido: "PDF privado aprovado pela Proprietária — nenhum PDF sai sem essa aprovação explícita.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-08",
    titulo: "Uso de imagem de terceiro em PDF/Caderno",
    area: "Legal",
    pendencia: "Quando uma imagem de acervo de terceiro pode entrar em material do cliente.",
    status: "decidida",
    valorDecidido: "Imagem de terceiro só entra com licença, domínio público comprovado, ou autorização explícita do titular.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-09",
    titulo: "Quais fontes podem virar M3-APROVADA",
    area: "Técnico/Legal",
    pendencia: "Critério para qualquer integração futura (Bloco 5B) ser autorizada.",
    status: "decidida",
    valorDecidido:
      "M3 só avança para M3-APROVADA quando a fonte é oficial, institucional, ou arquivo público " +
      "reconhecido — nunca fonte colaborativa ou de terceiro não verificado.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-10",
    titulo: "Quais etapas/famílias comerciais liberam entrega",
    area: "Comercial",
    pendencia: "Matriz produto × entregável — o que libera uma entrega ao cliente.",
    status: "decidida",
    valorDecidido: "Entrega liberada por caso + publicação aprovada — nunca por SKU isolado. \"SKU nunca bloqueia Ana\" (nem nenhum outro cliente).",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-11",
    titulo: "Glossário final de termos permitidos e proibidos",
    area: "Linguagem",
    pendencia: "Checker de conteúdo narrativo ao cliente.",
    status: "decidida",
    valorDecidido:
      "Linguagem proibida no App/comunicação ao cliente: \"garantido\", \"elegível\", \"direito assegurado\", " +
      "\"resultado certo\" — e qualquer sinônimo que prometa resultado jurídico.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
  {
    codigo: "D-12",
    titulo: "Política de cache e TTL por tipo de dado",
    area: "Técnico",
    pendencia: "Backend futuro — por quanto tempo um dado pode ficar em cache.",
    status: "decidida",
    valorDecidido:
      "TTL de 24h para catálogo/referência pública. Dado de caso, acesso, contrato, publicação ou " +
      "status de cliente é invalidado imediatamente — nunca cacheado com TTL.",
    decididoPor: "tati@pluggedresearch.com",
    decididoEm: "2026-10-02",
  },
] as const;

export function decisaoDaProprietaria(codigo: CodigoDecisaoProprietaria): DecisaoProprietaria | undefined {
  return DECISOES_DA_PROPRIETARIA.find((d) => d.codigo === codigo);
}

export function decisoesPendentesDaProprietaria(): readonly DecisaoProprietaria[] {
  return DECISOES_DA_PROPRIETARIA.filter((d) => d.status === "aguardando_decisao_humana");
}

/**
 * Bloqueios estruturais que continuam abertos em 02/10/2026 — não são um
 * código D-xx do Adendo, mas são exatamente o que a Proprietária pediu para
 * enxergar numa tela: "o que ainda depende de mim". Fonte:
 * `docs/decisoes/DECISOES-PENDENTES-DA-PROPRIETARIA-2026-10-01.md` §1 e §4,
 * mais os achados do Corte PAÍSES (02/10).
 */
export type BloqueioAbertoDaProprietaria = {
  tema: string;
  oQueTrava: string;
  registradoEm: string;
};

export const BLOQUEIOS_ABERTOS_DA_PROPRIETARIA: readonly BloqueioAbertoDaProprietaria[] = [
  {
    tema: "43 marcos jurídicos em 'a_revisar'",
    oQueTrava:
      "Promover marco para 'vigente' é ato de revisão jurídica com responsável e data — não feito em massa. " +
      "Falta indicar quais dos 43 já têm revisão de fato feita, por quem.",
    registradoEm: "2026-10-01",
  },
  {
    tema: "Base de pesquisa para Bélgica, Eslovênia, Estônia, França, Hungria, Irlanda, Letônia, Lituânia, Luxemburgo, Países Baixos, Romênia",
    oQueTrava:
      "Trilha jurídica existe, fonte de pesquisa não documentada. Entram como 'Fontes em preparação' " +
      "(Corte PAÍSES) até indicação de fonte real.",
    registradoEm: "2026-10-01",
  },
  {
    tema: "product_catalog.produto_pai_id vazio nos 46 SKUs",
    oQueTrava: "Falta o de-para SKU → PP-01..09 explícito; não se preenche sem decisão do mapa.",
    registradoEm: "2026-10-01",
  },
  {
    tema: "Percentual no 4º eixo Elegibilidade do Radar",
    oQueTrava:
      "Percentual liberado no heatmap de aderência e, em 02/10, nas 6 dimensões do Radar como progresso de aba " +
      "— nunca como parecer jurídico, chance ou prazo.",
    registradoEm: "2026-10-02",
  },
  {
    tema: "Preços no App (R$ 269 / 19 / 39 do mockup)",
    oQueTrava: "Exige autorização escrita explícita (A7). Enquanto não vier, o App fica sem preço.",
    registradoEm: "2026-09-29",
  },
  {
    tema: "painel-dia.tsx × /painel (golive)",
    oQueTrava: "Qual é a fonte viva do Painel Hoje — nenhum agente toca nos dois arquivos sem decisão.",
    registradoEm: "2026-09-26",
  },
  {
    tema: "Taxonomia do Desk: 6 grupos vigentes × 8 do texto da memória permanente",
    oQueTrava: "Menu do Desk. Confirmado em 02/10: \"redesenho não vamos tocar agora\".",
    registradoEm: "2026-10-02",
  },
  {
    tema: "Fatos humanos do caso Ana",
    oQueTrava:
      "Representação de Felipe (menor), via do lead × via do caso, Maria como ancestral × contratante, " +
      "dossiê-mãe com duas referências, CPF/RG/telefone de Alice e Felipe desconhecidos.",
    registradoEm: "2026-09-27",
  },
  {
    tema: "Integração externa (Drive, Dropbox, FamilySearch, Antenati, Asaas)",
    oQueTrava: "Qualquer envio, assinatura ou cobrança para fora do sistema — fora do alcance desta sessão.",
    registradoEm: "2026-09-10",
  },
  {
    tema: "Declarar COMPROVADO_EM_USO",
    oQueTrava: "Só a Proprietária autenticada, com prints inicial/ação/confirmação/releitura/integração.",
    registradoEm: "2026-09-10",
  },
] as const;

/**
 * D-05 executada (03/10/2026), não só registrada.
 *
 * A decisão diz: "responsável pela validação: Tatiana Melani Tosi, com
 * 'equipe Clube Ancestral' como forma institucional. Vira default de
 * `responsavel_validacao` e do responsável de elevação de evidência."
 *
 * Até 03/10 isso existia só como texto em `valorDecidido`: nenhuma constante,
 * nenhum default, e `responsavel_validacao` estava NULO nas 23 fontes do
 * catálogo. Marcar a decisão como "decidida" num módulo não é executá-la —
 * executá-la é esta constante entrar no escritor e no dado.
 */
export const RESPONSAVEL_VALIDACAO_PADRAO = "Tatiana Melani Tosi";

/** Forma institucional aceita quando a validação é da equipe, não de uma pessoa. */
export const RESPONSAVEL_VALIDACAO_INSTITUCIONAL = "equipe Clube Ancestral";
