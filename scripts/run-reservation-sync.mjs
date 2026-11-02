import { revalidateOpenPrs } from './revalidate-open-prs.mjs';
const token=process.env.GITHUB_TOKEN,repo=process.env.GITHUB_REPOSITORY;
if(!token||!repo)throw new Error('Configuração GitHub ausente.');
await revalidateOpenPrs(async(method,path,body)=>{
  const response=await fetch(`https://api.github.com${path}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw new Error(`GitHub ${response.status}: ${await response.text()}`);
  return response.json();
},repo);