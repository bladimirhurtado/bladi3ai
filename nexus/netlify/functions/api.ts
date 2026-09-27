import type { Handler } from '@netlify/functions';

const roles:Record<string,string>={general:'Eres Nexus: directo, preciso, honesto y práctico. No inventes datos.',architect:'Eres el arquitecto de Nexus. Divide problemas en capas, dependencias, riesgos y pruebas verificables.',analyst:'Eres analista técnico. Separa hechos, supuestos, incertidumbres y riesgos.',critic:'Eres el crítico. Busca fallos, supuestos débiles y puntos únicos de fallo.'};
const env=(k:string)=>process.env[k]||'';
const firecrawlHeaders=()=>{const h:Record<string,string>={'Content-Type':'application/json'};const k=env('FIRECRAWL_API_KEY');if(k)h.Authorization='Bearer '+k;return h};

async function llm(provider:string,model:string,system:string,prompt:string){
 const key=env(provider==='openrouter'?'OPENROUTER_API_KEY':provider==='gemini'?'NEXUS_GEMINI_API_KEY':provider==='groq'?'NEXUS_GROQ_API_KEY':provider==='mistral'?'NEXUS_MISTRAL_API_KEY':provider==='kimi'?'NEXUS_KIMI_API_KEY':'NEXUS_OPENAI_API_KEY');
 if(!key) throw Error('Falta la clave de '+provider+'.');
 if(provider==='openrouter'){
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','HTTP-Referer':'https://nexus-ai-hub-wfrk.netlify.app','X-Title':'Nexus AI Hub'},body:JSON.stringify({model,temperature:0.2,messages:[{role:'system',content:system},{role:'user',content:prompt}]})});
  const d=JSON.parse(await r.text());if(!r.ok)throw Error('OpenRouter HTTP '+r.status);return d.choices?.[0]?.message?.content||'';
 }\n if(provider==='gemini'){
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:prompt}]}]})});
  const d=JSON.parse(await r.text());if(!r.ok)throw Error('Gemini HTTP '+r.status);return d.candidates?.[0]?.content?.parts?.map((x:any)=>x.text||'').join('')||'';
 }
 const u=provider==='openai'?'https://api.openai.com/v1/responses':provider==='groq'?'https://api.groq.com/openai/v1/chat/completions':provider==='mistral'?'https://api.mistral.ai/v1/chat/completions':'https://api.moonshot.ai/v1/chat/completions';
 const body=provider==='openai'?{model,instructions:system,input:prompt}:{model,messages:[{role:'system',content:system},{role:'user',content:prompt}]};
 const r=await fetch(u,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const d=JSON.parse(await r.text());if(!r.ok)throw Error(provider+' HTTP '+r.status);return provider==='openai'?(d.output_text||''):(d.choices?.[0]?.message?.content||'');
}

async function tavily(q:string){
 const key=env('TAVILY_API_KEY');if(!key)throw Error('Falta TAVILY_API_KEY.');
 const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,query:q,search_depth:'advanced',max_results:8,include_answer:true})});
 const d=JSON.parse(await r.text());if(!r.ok)throw Error('Tavily HTTP '+r.status);
 return(d.results||[]).map((x:any)=>({title:x.title,url:x.url,content:x.content,score:x.score}));
}

async function firecrawlSearch(q:string){
 const r=await fetch('https://api.firecrawl.dev/v2/search',{method:'POST',headers:firecrawlHeaders(),body:JSON.stringify({query:q,limit:8,scrapeOptions:{formats:['markdown']}})});
 const d=JSON.parse(await r.text());if(!r.ok||d.success===false)throw Error('Firecrawl Search HTTP '+r.status);
 const data=d.data||d;
 const items=data.web||data.results||[];
 return items.map((x:any)=>({title:x.title||'',url:x.url||'',content:x.markdown||x.description||x.content||x.snippet||'',score:x.score??null,description:x.description||''}));
}

async function webSearch(q:string){
 try{return{engine:'firecrawl',results:await firecrawlSearch(q)}}catch(e){
  try{return{engine:'tavily-fallback',results:await tavily(q),warning:'Firecrawl no respondió; se usó Tavily como respaldo.'}}
  catch{return{engine:'none',results:[],warning:e instanceof Error?e.message:'No hay motor web disponible.'}}
 }
}

async function firecrawlScrape(url:string){
 const r=await fetch('https://api.firecrawl.dev/v2/scrape',{method:'POST',headers:firecrawlHeaders(),body:JSON.stringify({url,formats:['markdown']})});
 const d=JSON.parse(await r.text());if(!r.ok||d.success===false)throw Error('Firecrawl Scrape HTTP '+r.status);
 const data=d.data||d;return{title:data.metadata?.title||url,text:data.markdown||data.html||'',status:200,engine:'firecrawl'};
}

async function scrape(url:string){return await firecrawlScrape(url)}

export const handler:Handler=async(event)=>{
 try{
  const p=event.path.replace(/^\/.netlify\/functions\/api/,'')||'/';
  const b=event.body?JSON.parse(event.body):{};
  const provider=b.provider==='core'?'openrouter':b.provider||'openrouter';

  if(event.httpMethod==='GET'&&p==='/status')return{statusCode:200,body:JSON.stringify({status:'ready',providers:{core:!!env('OPENROUTER_API_KEY'),openrouter:!!env('OPENROUTER_API_KEY'),openai:!!env('NEXUS_OPENAI_API_KEY'),groq:!!env('NEXUS_GROQ_API_KEY'),mistral:!!env('NEXUS_MISTRAL_API_KEY'),kimi:!!env('NEXUS_KIMI_API_KEY'),gemini:!!env('NEXUS_GEMINI_API_KEY'),tavily:!!env('TAVILY_API_KEY'),firecrawl:true,firecrawlKeyConfigured:!!env('FIRECRAWL_API_KEY')}})};
  if(event.httpMethod==='GET'&&p==='/_healthcheck')return{statusCode:200,body:JSON.stringify({ok:true,service:'nexus'})};
  if(event.httpMethod==='GET'&&p==='/mcp/servers'){const q=event.queryStringParameters?.search||'';const r=await fetch('https://registry.modelcontextprotocol.io/v0.1/servers?limit=20&version=latest'+(q?'&search='+encodeURIComponent(q):''));return{statusCode:r.ok?200:502,body:await r.text()}};
  if(event.httpMethod==='POST'&&p==='/chat'){const prompt=String(b.prompt||'').trim();if(!prompt)return{statusCode:400,body:JSON.stringify({error:'prompt is required'})};return{statusCode:200,body:JSON.stringify({text:await llm(provider,b.model||'gpt-5',roles[b.role||'general'],prompt),provider:b.provider||'core',model:b.model||'gpt-5'})}};
  if(event.httpMethod==='POST'&&p==='/web-search'){const q=String(b.query||'').trim();if(!q)return{statusCode:400,body:JSON.stringify({error:'query is required'})};return{statusCode:200,body:JSON.stringify(await webSearch(q))}};
  if(event.httpMethod==='POST'&&p==='/scrape'){const url=String(b.url||'').trim();if(!/^https?:\/\//i.test(url))return{statusCode:400,body:JSON.stringify({error:'URL inválida'})};return{statusCode:200,body:JSON.stringify(await scrape(url))}};
  if(event.httpMethod==='POST'&&p==='/team'){const prompt=String(b.prompt||'').trim(),ctx=String(b.webContext||'').slice(0,16000);const[architect,researcher,critic]=await Promise.all([llm('openrouter','openai/gpt-5',roles.architect,prompt+'\n'+ctx),llm('openrouter','openai/gpt-5',roles.analyst,prompt+'\n'+ctx),llm('openrouter','openai/gpt-5',roles.critic,prompt+'\n'+ctx)]);const final=await llm('openrouter','openai/gpt-5','Eres el coordinador final de Nexus. No ocultes contradicciones ni inventes datos.','Integra estos informes y responde de forma práctica.\nARQUITECTO:\n'+architect+'\nINVESTIGADOR:\n'+researcher+'\nCRÍTICO:\n'+critic+'\nPREGUNTA:\n'+prompt);return{statusCode:200,body:JSON.stringify({architect,researcher,critic,final})}};
  return{statusCode:404,body:JSON.stringify({error:'Not found'})};
 }catch(e){return{statusCode:500,body:JSON.stringify({error:e instanceof Error?e.message:'Server error'})}}
};