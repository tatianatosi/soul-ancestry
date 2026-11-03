import {
  ANEXOS_TRES_CAMADAS,
  type CamadaJuridica,
  type EstadoReconciliacao,
  type LinhaTresCamadas,
} from "@/lib/anexos-tres-camadas";
import type { InstanciaPersistida } from "@/lib/anexos-instancia";

/**
 * As três camadas dos Anexos I–V para UM caso, a partir das instâncias que
 * existem de verdade em `contract_annexes` para ele (31/10/2026).
 *
 * O retrato estático de 22/08 (`ANEXOS_TRES_CAMADAS`) tinha o caso da Ana fixo
 * no código. Aqui só duas coisas vêm dele, por não dependerem de caso: o nome
 * do anexo e a camada B (conteúdo jurídico homologado no repositório).
 * Camadas A e C saem das linhas do caso; sem linha, é "sem registro" — nada
 * é inferido nem herdado de outro caso.
 */

export type LinhaDoCaso = {
  codigo: LinhaTresCamadas["codigo"];
  nome: string;
  annexCode: string;
  tecnica: {
    presente: boolean;
    versao: number | null;
    modelVersion: string | null;
    status: string | null;
    temConteudo: boolean;
    temHash: boolean;
    atualizadoEm: string | null;
    ehTeste: boolean;
  };
  juridica: CamadaJuridica;
  parametrosAusentes: string[];
  situacaoDoCaso: "ausente" | "parcial" | "presente";
  estados: EstadoReconciliacao[];
};

export type TresCamadasDoCaso = {
  linhas: LinhaDoCaso[];
  /** Anexos do caso fora do conjunto I–V (por exemplo anexos internos). Só código e status. */
  outrosAnexos: { annexCode: string; status: string }[];
  totalInstancias: number;
};

const STATUS_PENDENTE = new Set(["missing", "pending", "draft_missing", "required"]);

function maisRecente(lista: InstanciaPersistida[]): InstanciaPersistida | null {
  if (lista.length === 0) return null;
  return [...lista].sort((a, b) => b.annex_version - a.annex_version)[0] ?? null;
}

export function montarTresCamadasDoCaso(instancias: InstanciaPersistida[]): TresCamadasDoCaso {
  const conhecidos = new Set(ANEXOS_TRES_CAMADAS.map((a) => a.annexCode));

  const linhas = ANEXOS_TRES_CAMADAS.map((base): LinhaDoCaso => {
    const doAnexo = instancias.filter((i) => i.annex_code === base.annexCode);
    const atual = maisRecente(doAnexo);
    const estados: EstadoReconciliacao[] = [];

    if (atual) estados.push("TECNICAMENTE_EXISTE");
    if (!base.juridica.presente) estados.push("MODELO_JURIDICO_NAO_LOCALIZADO");

    let situacaoDoCaso: LinhaDoCaso["situacaoDoCaso"] = "ausente";
    if (atual) {
      const incompleta = STATUS_PENDENTE.has(atual.status) || !atual.tem_conteudo;
      situacaoDoCaso = incompleta ? "parcial" : "presente";
    }
    if (situacaoDoCaso === "ausente") estados.push("INSTANCIA_DO_CASO_AUSENTE");
    if (situacaoDoCaso === "parcial") estados.push("INSTANCIA_DO_CASO_PARCIAL");
    if (atual?.tem_conteudo) estados.push("PRONTO_PARA_PREVIA_INTERNA");
    if (!base.juridica.presente) estados.push("AGUARDA_MATERIALIZACAO");

    return {
      codigo: base.codigo,
      nome: base.nome,
      annexCode: base.annexCode,
      tecnica: {
        presente: Boolean(atual),
        versao: atual?.annex_version ?? null,
        modelVersion: atual?.model_version ?? null,
        status: atual?.status ?? null,
        temConteudo: Boolean(atual?.tem_conteudo),
        temHash: Boolean(atual?.file_hash),
        atualizadoEm: atual?.atualizado_em ?? null,
        ehTeste: Boolean(atual?.is_test),
      },
      juridica: base.juridica,
      parametrosAusentes: situacaoDoCaso === "presente" ? [] : base.caso.parametrosAusentes,
      situacaoDoCaso,
      estados,
    };
  });

  return {
    linhas,
    outrosAnexos: instancias
      .filter((i) => !conhecidos.has(i.annex_code))
      .map((i) => ({ annexCode: i.annex_code, status: i.status })),
    totalInstancias: instancias.length,
  };
}
