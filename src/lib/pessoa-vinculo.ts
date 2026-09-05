/**
 * Vínculo pessoa → cliente por nome: usado onde uma pessoa (núcleo,
 * checklist, contrato) precisa ser ligada ao cadastro canônico em
 * `clientes` sem que o operador precise escolher manualmente. Só liga
 * quando exatamente um cliente ativo da organização bate por igualdade ou
 * por um nome ser prefixo do outro seguido de espaço (cobre nome curto vs.
 * nome completo — ex.: "Ana Luiza" e "Ana Luiza Gomes Silveira Rodrigues",
 * causa raiz da fragmentação da Ana em nucleo_membros/contract_parties).
 * Ambíguo (mais de um candidato) devolve null — nunca escolhe ao acaso.
 * Mesma regra usada no backfill SQL (migration
 * 20260904140000_pessoa360_vinculo_case_members_e_backfill_cliente_id).
 */
export function clienteCorrespondentePorNome(nome: string, clientes: { id: string; nome: string }[]): string | null {
  const alvo = nome.trim().toLowerCase();
  const candidatos = clientes.filter((c) => {
    const cn = c.nome.trim().toLowerCase();
    return cn === alvo || alvo.startsWith(`${cn} `) || cn.startsWith(`${alvo} `);
  });
  return candidatos.length === 1 ? candidatos[0].id : null;
}
