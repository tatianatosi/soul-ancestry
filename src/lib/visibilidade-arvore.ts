/**
 * Os três eixos que decidem se uma pessoa pode ir para a Árvore do App — e
 * qual deles é o que realmente manda.
 *
 * Por que este módulo existe (04/10/2026): a Proprietária relatou estar
 * bloqueada — "por mais que eu queira publicar os parentes da Ana que estão
 * como restrito, altamente restrito e padrão, eu não consigo nem mudar o
 * status e tampouco sei qual status é entre verificado, aprovado e confirmado,
 * que na verdade estão dizendo a mesma coisa". Medido no código e no banco: os
 * três nomes NÃO dizem a mesma coisa, moram em colunas diferentes e só UM
 * libera a árvore. A confusão era real e o bloqueio também — o formulário do
 * Perfil 360° não tinha seletor de visibilidade, então `client_visibility`
 * ficava `interna` para sempre e a publicação era impossível pela tela.
 *
 * | Eixo                  | Tabela.coluna                                        | Valores                                                      | O que decide |
 * |-----------------------|------------------------------------------------------|--------------------------------------------------------------|---|
 * | Visibilidade ao cliente | `genealogical_person_profiles.client_visibility`   | interna · sanitizada · aprovada                              | **É O GATE DA ÁRVORE**: só `aprovada` publica |
 * | Sensibilidade         | `research_people.sensitivity_level`                   | standard (padrão) · restricted (restrito) · highly_restricted | só `highly_restricted` bloqueia; `restricted` NÃO bloqueia |
 * | Status de verificação | `genealogical_person_profiles.status_verificacao`     | confirmado · provável · hipótese · pendente · não aplicável   | estado epistêmico da identidade — **não** gateia a árvore |
 *
 * Onde o "confirmado" manda de fato: nos módulos históricos/eventos
 * (`validarRegistroModulo`, `genealogia-modulos.ts`), em que
 * `client_visibility = aprovada` exige `status_verificacao = confirmado`. Na
 * árvore de pessoas essa exigência nunca existiu — e não a invento aqui.
 */

const t = (v: unknown) => (v == null ? "" : String(v).trim());

export type EixoVisibilidade = {
  chave: "client_visibility" | "sensitivity_level" | "status_verificacao";
  rotulo: string;
  onde: string;
  valores: string[];
  gateiaArvore: boolean;
  resumo: string;
  ondeMudar: string;
};

export const EIXOS_VISIBILIDADE_PESSOA: EixoVisibilidade[] = [
  {
    chave: "client_visibility",
    rotulo: "Visibilidade ao cliente",
    onde: "genealogical_person_profiles.client_visibility",
    valores: ["interna", "sanitizada", "aprovada"],
    gateiaArvore: true,
    resumo: "Único eixo que libera a Árvore do App: precisa estar “aprovada”.",
    ondeMudar: "Ficha genealógica › Perfil 360° › campo “Visibilidade ao cliente”",
  },
  {
    chave: "sensitivity_level",
    rotulo: "Sensibilidade",
    onde: "research_people.sensitivity_level",
    valores: ["standard", "restricted", "highly_restricted"],
    gateiaArvore: false,
    resumo: "Só “altamente restrita” impede publicar. “Restrita” e “padrão” publicam normalmente.",
    ondeMudar: "Pesquisa › módulo do caso › pessoa de pesquisa › campo “Sensibilidade”",
  },
  {
    chave: "status_verificacao",
    rotulo: "Status de verificação",
    onde: "genealogical_person_profiles.status_verificacao",
    valores: ["confirmado", "provavel", "hipotese", "pendente", "nao_aplicavel"],
    gateiaArvore: false,
    resumo:
      "Estado da identidade (confirmado, provável, hipótese…). Não bloqueia a árvore de pessoas; bloqueia só módulo histórico aprovado ao cliente.",
    ondeMudar: "Ficha genealógica › Perfil 360° › campo “Status de verificação”",
  },
];

/** Frase única usada na tela, para não haver duas explicações diferentes. */
export const RESUMO_GATE_ARVORE =
  "Para ir à Árvore do App, a pessoa precisa de “Visibilidade ao cliente = Aprovada”. " +
  "“Confirmado” é outro eixo (estado da identidade) e não é exigido aqui; " +
  "“restrito” também não impede — só “altamente restrita” impede.";

export type EntradaProntidaoArvore = {
  clientVisibility?: string | null;
  sensitivityLevel?: string | null;
  temPessoaPesquisa?: boolean;
};

export type BloqueioArvore = { chave: string; texto: string; ondeResolver: string };

/**
 * Por que esta pessoa (não) pode ser publicada — com o nome do bloqueio e
 * onde resolvê-lo. Nunca devolve "não pode" sem dizer o porquê.
 */
export function prontidaoParaArvore(e: EntradaProntidaoArvore): {
  pode: boolean;
  bloqueios: BloqueioArvore[];
  observacoes: string[];
} {
  const bloqueios: BloqueioArvore[] = [];
  const observacoes: string[] = [];
  const visibilidade = t(e.clientVisibility) || "interna";
  const sensibilidade = t(e.sensitivityLevel);

  if (visibilidade !== "aprovada") {
    bloqueios.push({
      chave: "client_visibility",
      texto:
        visibilidade === "sanitizada"
          ? "Visibilidade ao cliente está “sanitizada” (aguarda aprovação) — falta aprovar."
          : "Visibilidade ao cliente está “interna” — nada interno vai ao App.",
      ondeResolver: "Perfil 360° › Visibilidade ao cliente → “Aprovada para o App Cliente”",
    });
  }
  if (sensibilidade === "highly_restricted") {
    bloqueios.push({
      chave: "sensitivity_level",
      texto: "Pessoa marcada como “altamente restrita” — nunca é publicada no App.",
      ondeResolver: "Pesquisa › pessoa de pesquisa › Sensibilidade (decisão humana, com motivo)",
    });
  }
  if (e.temPessoaPesquisa === false) {
    bloqueios.push({
      chave: "research_person_id",
      texto: "O perfil não está ligado a uma pessoa de pesquisa — a publicação lê menor de idade e sensibilidade de lá.",
      ondeResolver: "Pesquisa › módulo do caso › criar/ligar a pessoa de pesquisa",
    });
  }
  if (sensibilidade === "restricted") {
    observacoes.push("Sensibilidade “restrita” não impede publicar: só o conteúdo publicado é sanitizado.");
  }
  return { pode: bloqueios.length === 0, bloqueios, observacoes };
}
