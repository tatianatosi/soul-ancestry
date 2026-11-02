import { validateEvidence } from './pr-evidence.mjs';

/** Read-only provider audit. Inject API so tests never need credentials. */
export async function auditPullRequests(api, owner, repo) {
  const rows = [];
  for (let page = 1; ; page++) {
    const prs = await api(`/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}`);
    for (const pr of prs.filter(p => p.merged_at)) {
      const files = [];
      for (let n = 1; ; n++) {
        const batch = await api(`/repos/${owner}/${repo}/pulls/${pr.number}/files?per_page=100&page=${n}`);
        files.push(...batch.map(f => f.filename));
        if (batch.length < 100) break;
      }
      const evidence = validateEvidence(pr.body, pr.head.sha, files);
      const checks = await api(`/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs?per_page=100`);
      const relevant = checks.check_runs?.filter(c => c.name === 'typecheck-test-build') ?? [];
      const ci = relevant.length > 0 && relevant.every(c => c.head_sha === pr.head.sha && c.status === 'completed' && c.conclusion === 'success');
      rows.push({ number:pr.number, sha:pr.head.sha, merge_sha:pr.merge_commit_sha, integrated:true, code_checks:ci ? 'PASSOU' : 'NAO_VERIFICADO', evidence:evidence.state, pending:[...evidence.errors,...evidence.pending], execution:'EVIDENCIA_EXIGE_REVISAO_HUMANA', publication:'NAO_VERIFICADA' });
    }
    if (prs.length < 100) break;
  }
  return rows;
}