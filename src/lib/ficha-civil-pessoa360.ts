/**
 * Dados civis do caso lidos da Pessoa 360 (`clientes`) — nunca redigitados em
 * `case_members`. Função pura: monta, para a titular e cada membro, os campos
 * civis com o estado real. Campo ausente mostra "sem dados suficientes" (ou
 * "pendente de validação" quando há dado cru ainda não conferido); nenhum
 * valor é inventado e nenhuma frase de preenchimento é usada.
 */
import { TEXTO_ESTADO_CAMPO } from "@/lib/ficha-master-estado-campos";

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type CampoCivil = { rotulo: string; exibicao: string; preenchido: boolean };

export type PessoaCivil = {
  chave: string;
  papel: "titular" | "membro";
  nome: string;
  /** Id em `clientes` para abrir Pessoa 360; null = membro ainda sem vínculo. */
  clienteId: string | null;
  campos: CampoCivil[];
};

function mascararCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, "");
  return d.length === 11 ? `•••.•••.•••-${d.slice(9)}` : "pendente de validação";
}

function dataPtBr(valor: string): string {
  const [a, m, d] = valor.slice(0, 10).split("-");
  return a && m && d ? `${d}/${m}/${a}` : valor;
}

const CAMPOS: { rotulo: string; chave: string; formatar?: (v: string) => string }[] = [
  { rotulo: "Data de nascimento", chave: "data_nascimento", formatar: dataPtBr },
  { rotulo: "Cidade de nascimento", chave: "cidade_nascimento" },
  { rotulo: "Nacionalidade", chave: "nacionalidade" },
  { rotulo: "Estado civil", chave: "estado_civil" },
  { rotulo: "CPF", chave: "cpf", formatar: mascararCpf },
  { rotulo: "Mãe", chave: "nome_mae" },
  { rotulo: "Pai", chave: "nome_pai" },
  { rotulo: "Cônjuge", chave: "nome_conjuge" },
  { rotulo: "E-mail", chave: "email" },
  { rotulo: "Telefone", chave: "telefone" },
];

function camposDe(pessoa: Linha | null): CampoCivil[] {
  return CAMPOS.map((c) => {
    const bruto = pessoa ? String(pessoa[c.chave] ?? "").trim() : "";
    if (!bruto) {
      return { rotulo: c.rotulo, exibicao: TEXTO_ESTADO_CAMPO.sem_dados_suficientes, preenchido: false };
    }
    return { rotulo: c.rotulo, exibicao: c.formatar ? c.formatar(bruto) : bruto, preenchido: true };
  });
}

export function montarCivilDoCaso(params: {
  clienteId: string | null | undefined;
  pessoas360: Linha[];
  membros: Linha[];
}): PessoaCivil[] {
  const porId = new Map(params.pessoas360.map((p) => [String(p["id"]), p]));
  const saida: PessoaCivil[] = [];
  const jaListados = new Set<string>();

  const titular = params.clienteId ? (porId.get(params.clienteId) ?? null) : null;
  if (params.clienteId) {
    jaListados.add(params.clienteId);
    saida.push({
      chave: `titular-${params.clienteId}`,
      papel: "titular",
      nome: String(titular?.["nome"] ?? "Titular (Pessoa 360 não encontrada)"),
      clienteId: params.clienteId,
      campos: camposDe(titular),
    });
  }

  for (const m of params.membros) {
    const cid = m["cliente_id"] ? String(m["cliente_id"]) : null;
    if (cid && jaListados.has(cid)) continue;
    if (cid) jaListados.add(cid);
    const pessoa = cid ? (porId.get(cid) ?? null) : null;
    saida.push({
      chave: `membro-${String(m["id"] ?? m["nome"])}`,
      papel: "membro",
      nome: String(pessoa?.["nome"] ?? m["nome"] ?? "Membro sem nome"),
      clienteId: cid,
      campos: camposDe(pessoa),
    });
  }
  return saida;
}
