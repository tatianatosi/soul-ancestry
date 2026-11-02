import { it, expect } from 'vitest';
import { auditPullRequests } from '../../../scripts/audit-pr-completion.mjs';
it('separa merge, CI e ausência de prova real nas PRs antigas', async () => {
  const result = await auditPullRequests(async path => {
    if (path.includes('/files')) return [{filename:'src/a.ts'}];
    if (path.includes('/check-runs')) return {check_runs:[{name:'typecheck-test-build',head_sha:'a'.repeat(40),status:'completed',conclusion:'success'}]};
    return [{number:1,merged_at:'2026-11-02',body:'Sem evidências',head:{sha:'a'.repeat(40)},merge_commit_sha:'b'.repeat(40)}];
  }, 'owner','repo');
  expect(result[0].integrated).toBe(true);
  expect(result[0].code_checks).toBe('PASSOU');
  expect(result[0].evidence).toBe('NAO_VERIFICADA');
  expect(result[0].publication).toBe('NAO_VERIFICADA');
});
it('não inventa CI aprovado quando checks históricos estão indisponíveis', async () => {
  const result = await auditPullRequests(async path => {
    if (path.includes('/files')) return [];
    if (path.includes('/check-runs')) throw new Error('404');
    return [{number:2,merged_at:'2026-11-02',body:'',head:{sha:'a'.repeat(40)},merge_commit_sha:'b'.repeat(40)}];
  }, 'owner','repo');
  expect(result[0].code_checks).toBe('NAO_VERIFICADO');
  expect(result[0].pending).toContain('Checks indisponíveis para o SHA histórico');
});