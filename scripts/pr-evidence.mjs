/** Pure validation: PR text is data, never executable code. */
export function validateEvidence(body, sha, changedFiles = [], reservations = []) {
  const errors = [], pending = [];
  const block = (body ?? '').match(/```json\s*\n([\s\S]*?)\n```/);
  let record;
  try { record = JSON.parse(block?.[1] ?? ''); } catch { return { errors: ['Matriz JSON de evidências ausente ou inválida.'], pending, state: 'NAO_VERIFICADA' }; }
  if (!record || typeof record !== 'object') return { errors: ['Matriz inválida.'], pending, state: 'NAO_VERIFICADA' };
  if (!['Claude', 'Lovable'].includes(record.agent)) errors.push('Responsável deve ser Claude ou Lovable.');
  if (!/^[a-f0-9]{40}$/.test(record.base_sha ?? '')) errors.push('SHA-base inválido.');
  if (record.tested_sha !== sha) errors.push('Evidências não correspondem ao SHA da PR.');
  const files = Array.isArray(record.files) ? record.files : [];
  for (const f of changedFiles) if (!files.includes(f)) errors.push(`Arquivo não declarado: ${f}`);
  for (const reservation of reservations) {
    const overlap = files.filter(f => reservation.files?.includes(f));
    if (overlap.length) errors.push(`Sobreposição com PR #${reservation.number}: ${overlap.join(', ')}`);
  }
  const valid = ['PASSOU', 'FALHOU', 'BLOQUEADO_POR_DADO', 'BLOQUEADO_POR_DECISAO', 'ERRO_DE_FONTE', 'NAO_LOCALIZADO'];
  const criteria = Array.isArray(record.criteria) ? record.criteria : [];
  if (!criteria.length) errors.push('Nenhum critério de aceite declarado.');
  const ids = new Set();
  for (const c of criteria) {
    if (!c || typeof c !== 'object') { errors.push('Critério inválido.'); continue; }
    if (!c.id || ids.has(c.id)) errors.push('Critério sem ID único.');
    ids.add(c.id);
    if (!valid.includes(c.status)) errors.push(`Estado inválido: ${c.id ?? '?'}`);
    if (!Array.isArray(c.kinds) || !c.kinds.length || c.kinds.some(k => !['code','ui','write','access','contract','payment','publication'].includes(k))) errors.push(`Tipo de critério inválido: ${c.id}`);
    if (!c.requirement || !c.test) errors.push(`Requisito/teste ausente: ${c.id}`);
    if (c.status !== 'PASSOU') {
      pending.push(`${c.id}: ${c.status}`);
      if (!c.reason || !c.owner) errors.push(`Pendência sem motivo/responsável: ${c.id}`);
    } else {
      const required = ['test'];
      if (c.kinds?.includes('ui')) required.push('desktop','mobile');
      if (c.kinds?.includes('write')) required.push('action','readback');
      if (c.kinds?.some(k => ['access','contract','payment','publication'].includes(k))) required.push('flow');
      for (const key of required) {
        if (!/^https:\/\/\S+$/.test(c.evidence?.[key] ?? '')) errors.push(`Evidência HTTPS ${key} ausente: ${c.id}`);
      }
    }
  }
  return { errors, pending, state: errors.length ? 'NAO_VERIFICADA' : pending.length ? 'PARCIAL' : 'EVIDENCIAS_DECLARADAS' };
}

export function parseReservation(body, number) {
  try {
    const block = body?.match(/```json\s*\n([\s\S]*?)\n```/);
    const value = JSON.parse(block?.[1] ?? '');
    return { number, files: Array.isArray(value.files) ? value.files.filter(f => typeof f === 'string') : [] };
  } catch { return { number, files: [] }; }
}