import { validateEvidence, parseReservation } from './pr-evidence.mjs';
export async function revalidateOpenPrs(api, repo) {
  const prs = [];
  for (let page=1;;page++) {
    const batch = await api('GET', `/repos/${repo}/pulls?state=open&per_page=100&page=${page}`);
    prs.push(...batch);
    if(batch.length<100) break;
  }
  for (const pr of prs) {
    const files=[];
    for(let page=1;;page++) {
      const batch=await api('GET',`/repos/${repo}/pulls/${pr.number}/files?per_page=100&page=${page}`);
      files.push(...batch.map(f=>f.filename));if(batch.length<100)break;
    }
    const result=validateEvidence(pr.body,pr.head.sha,files,prs.filter(p=>p.number!==pr.number).map(p=>parseReservation(p.body,p.number)));
    let record;
    try { record=JSON.parse((pr.body??'').match(/```json\s*\n([\s\S]*?)\n```/)?.[1]??'null'); }
    catch { record=null; }
    if(record?.base_sha!==pr.base.sha)result.errors.push('Base declarada difere da base atual da PR.');
    await api('POST',`/repos/${repo}/statuses/${pr.head.sha}`,{
      state:result.errors.length||result.pending.length?'failure':'success',context:'reservation-sync',
      description:`PR #${pr.number}: ${result.errors.length} divergências, ${result.pending.length} pendências`.slice(0,140),
      target_url:pr.html_url,
    });
  }
  return prs.length;
}