/**
 * Norma de identificadores canônicos do Clube Ancestral — referência somente leitura.
 *
 * Este módulo é dicionário: não gera, não valida em runtime, não renomeia caso
 * existente e não altera o gerador transacional já implantado (G-01).
 */

export const FORMATO_CASO = "CA-CID-[MODELO]-[ANO]-[SEQUENCIA]";
export const FORMATO_LEAD = "CA-LEAD-[ANO]-[SEQUENCIA]";
export const PREFIXO_FIXTURE = "CA-DEMO-";

export const MODELOS = [
  { codigo: "IND", nome: "Individual", descricao: "Caso de cidadania com um único requerente titular." },
  { codigo: "FAM", nome: "Familiar", descricao: "Núcleo familiar com contratante, participantes e dependentes." },
  { codigo: "MULTI", nome: "Multinúcleo", descricao: "Mais de um núcleo familiar sob a mesma linhagem ou projeto." },
  { codigo: "PESQ", nome: "Pesquisa", descricao: "Pesquisa genealógica contratada sem pedido de cidadania em curso." },
  { codigo: "LEG", nome: "Legado", descricao: "Caso migrado de base anterior, com identificador histórico preservado como alias." },
  { codigo: "POS", nome: "Pós-cidadania", descricao: "Serviços posteriores ao reconhecimento (registros, documentos, mudança)." },
] as const;

export type ExemploIdentificador = {
  codigo: string;
  contexto: string;
  leitura: string;
  fixture: boolean;
};

/** Exemplos normativos de referência (20/08/2026). */
export const EXEMPLOS: ExemploIdentificador[] = [
  {
    codigo: "CA-LEAD-2026-0001",
    contexto: "Lead em triagem",
    leitura: "Lead ainda em triagem comercial: não é caso, não abre pasta, não gera contrato nem cobrança.",
    fixture: false,
  },
  {
    codigo: "CA-CID-IND-2026-002",
    contexto: "Caso individual após abertura formal",
    leitura: "Caso individual de cidadania criado após abertura formal, com sequência anual própria.",
    fixture: false,
  },
  {
    codigo: "CA-CID-FAM-2026-001",
    contexto: "Caso familiar",
    leitura: "Caso familiar de cidadania: um núcleo, um contratante, participantes e dependentes representados.",
    fixture: false,
  },
  {
    codigo: "CA-DEMO-CID-FAM-2026-001",
    contexto: "Fixture de teste",
    leitura: "Registro de demonstração. Sinalizado como fixture nas telas e fora de qualquer leitura operacional real.",
    fixture: true,
  },
];

export const REGRAS_LEITURA = [
  "O identificador canônico é atribuído na abertura formal do caso; antes disso o registro vive como lead.",
  "Identificadores históricos não são apagados: permanecem como alias auditável do caso canônico.",
  "A sequência é anual e por modelo; nunca é reaproveitada após arquivamento.",
  "O prefixo CA-DEMO- marca fixture de teste e é apenas sinalizado nas telas, sem valor operacional.",
  "Códigos legados já em uso permanecem como estão: esta referência não renomeia caso existente.",
] as const;

/** Sinalização de fixture (apenas rótulo de tela; nenhuma trava adicional). */
export function ehFixture(codigo?: string | null): boolean {
  return Boolean(codigo && codigo.toUpperCase().startsWith(PREFIXO_FIXTURE));
}

export const ROTULO_FIXTURE = "Fixture de teste";
