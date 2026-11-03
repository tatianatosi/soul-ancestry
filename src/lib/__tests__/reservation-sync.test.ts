import { expect,it } from 'vitest';
import { revalidateOpenPrs } from '../../../scripts/revalidate-open-prs.mjs';
it('revalida todas as PRs abertas e detecta sobreposição sem fazer merge',async()=>{
  const writes: {path:string;body:any}[]=[];
  const prs=[1,2].map(number=>({number,html_url:`https://github.com/o/r/pull/${number}`,head:{sha:String(number).repeat(40)},base:{sha:'b'.repeat(40)},body:'```json\n'+JSON.stringify({agent:number===1?'Claude':'Lovable',base_sha:'b'.repeat(40),tested_sha:String(number).repeat(40),files:['src/a.ts'],criteria:[]})+'\n```'}));
  const count=await revalidateOpenPrs(async(method:string,path:string,body:any)=>{
    if(method==='POST'){writes.push({path,body});return {};}
    return path.includes('/files')?[{filename:'src/a.ts'}]:prs;
  },'o/r');
  expect(count).toBe(2);expect(writes.map(w=>w.body.state)).toEqual(['failure','failure']);
  expect(writes.every(w=>w.path.includes('/statuses/'))).toBe(true);
});
it('nenhuma PR fechada permanece reservada',async()=>{
  let writes=0;
  expect(await revalidateOpenPrs(async(method:string)=>{if(method==='POST')writes++;return [];},'o/r')).toBe(0);
  expect(writes).toBe(0);
});