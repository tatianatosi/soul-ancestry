/** Dados exclusivamente visuais. Nunca importar em rotas operacionais. */
export const KIT_PREVIEW_FIXTURE = {
  label: "Dados demonstrativos",
  people: [
    { id: "preview-person-1", name: "Pessoa demonstrativa", role: "Requerente" },
    { id: "preview-person-2", name: "Ascendente demonstrativo", role: "Ascendente" },
  ],
  journey: [
    { id: "preview-step-1", title: "Diagnóstico", state: "done" as const },
    { id: "preview-step-2", title: "Pesquisa", state: "current" as const },
    { id: "preview-step-3", title: "Preparação", state: "next" as const },
  ],
} as const;