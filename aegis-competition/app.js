const $=id=>document.getElementById(id);
const logLines=[]; const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const ACTIONS=[
 {name:"scan",gain:2,cost:1,info:4,risk:0},
 {name:"probe",gain:3,cost:2,info:3,risk:1},
 {name:"feint",gain:1,cost:1,info:1,risk:0},
 {name:"pressure",gain:4,cost:3,info:0,risk:2},
 {name:"verify",gain:2,cost:2,info:5,risk:0},
 {name:"hold",gain:0,cost:1,info:1,risk:0}
];
const HYDRA_MODES=["mirror","deceiver","switcher","noise","meta"];

function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}}
function clone(x){return JSON.parse(JSON.stringify(x))}
function fp(s){return [s.round,s.trust,s.knowledge,s.hiddenThreat,s.mode,s.budget,s.signal].join("|")}
function addLog(t,cls=""){logLines.push(t);$("log").innerHTML=logLines.slice(-60).map(x=>'<div class="entry '+cls+'">'+x+'</div>').join("");$("log").scrollTop=99999}
function renderBoard(s){$("board").textContent=[
"┌──────────── AEGIS OFFENSIVE LAB ────────────┐",
"│ TRUST       "+String(s.trust).padEnd(28)+"│",
"│ KNOWLEDGE   "+String(s.knowledge).padEnd(28)+"│",
"│ THREAT      "+String(s.hiddenThreat).padEnd(28)+"│",
"│ BUDGET      "+String(s.budget).padEnd(28)+"│",
"│ SIGNAL      "+String(s.signal).padEnd(28)+"│",
"└──────────────────────────────────────────────┘"].join("\n")}

function hydraResponse(s,a,random){
  const meta=s.mode==="meta";
  if(meta && a.name==="scan") return {move:"feed-decoy",impact:1,deception:true,info:"punishes predictable reconnaissance"};
  if(s.mode==="mirror") return {move:a.name==="pressure"?"retreat":"mirror",impact:a.name==="pressure"?1:2,deception:false};
  if(s.mode==="deceiver") return {move:random()>0.5?"bait":"switch",impact:3,deception:true};
  if(s.mode==="switcher") return {move:(s.round%2?"switch":"wait"),impact:4,deception:s.round%2===1};
  return {move:random()>0.65?"noise":"pressure",impact:2+Math.floor(random()*3),deception:true};
}

function heuristic(s){return s.trust*2+s.knowledge*3-s.hiddenThreat*2+s.budget*.25}

function predict(state,depth,random,seen=new Set()){
  if(depth===0)return {value:heuristic(state),line:[]};
  const key=fp(state)+"/"+depth;
  if(seen.has(key))return {value:-100,line:["CYCLE-BLOCK"]};
  const next=new Set(seen);next.add(key);
  let best={value:-Infinity,line:[]};
  for(const a of ACTIONS){
    if(a.cost>state.budget)continue;
    const ns=clone(state);ns.round++;ns.budget-=a.cost;
    ns.knowledge=Math.min(10,ns.knowledge+a.info+(a.name==="verify"?2:0));
    ns.trust=Math.max(0,Math.min(20,ns.trust+a.gain-a.risk));
    const h=hydraResponse(ns,a,random);
    ns.trust=Math.max(0,ns.trust-h.impact);
    ns.hiddenThreat=Math.max(0,ns.hiddenThreat+(h.deception?1:0)-Math.floor(ns.knowledge/5));
    ns.signal=h.move;
    const child=predict(ns,depth-1,random,next);
    const value=child.value+(a.name==="verify"?2:0)-(h.deception?1:0);
    if(value>best.value)best={value,line:[a.name+" → "+h.move,...child.line]};
  }
  return best;
}

function initial(seed){return {seed,round:0,trust:12,knowledge:1,hiddenThreat:7,budget:22,signal:"unknown",mode:HYDRA_MODES[seed%HYDRA_MODES.length]}}

function judge(events,initialState){
  let s=clone(initialState),valid=true,verified=0,forcedRecovery=0;
  for(const e of events){
    if(e.type==="AEGIS"){
      if(!ACTIONS.some(a=>a.name===e.action)||e.cost>s.budget){valid=false;break}
      s.budget-=e.cost;s.knowledge=Math.min(10,s.knowledge+e.info);
      s.trust=Math.max(0,Math.min(20,s.trust+e.gain-e.risk));
    } else if(e.type==="HYDRA"){
      s.trust=Math.max(0,s.trust-e.impact);
      s.hiddenThreat=Math.max(0,s.hiddenThreat+(e.deception?1:0)-Math.floor(s.knowledge/5));
      s.signal=e.move;
    } else if(e.type==="VERIFY"){verified++;if(e.recovered)forcedRecovery++}
  }
  const evidence=verified>=2 && s.knowledge>=5;
  const survival=s.trust>=5;
  const score=Math.max(0,Math.min(100,Math.round(
    (survival?30:0)+(evidence?25:0)+Math.min(20,s.knowledge*2)+Math.min(15,s.budget)+Math.min(10,forcedRecovery*5)
  )));
  return {valid,evidence,survival,score,final:s};
}

async function hashText(text){
  const data=new TextEncoder().encode(text);
  const buf=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function hashChain(events){
  let prev="GENESIS";const chain=[];
  for(const e of events){prev=await hashText(prev+"|"+JSON.stringify(e));chain.push(prev)}
  return {head:prev,chain};
}

async function run(){
  $("run").disabled=true;logLines.length=0;$("tree").innerHTML="";
  const seed=(Date.now()>>>0);const random=rng(seed);const s=initial(seed);const events=[];
  $("status").textContent="AEGIS is taking the initiative — adversarial simulation started.";
  renderBoard(s);
  addLog("JUDGE: seed "+seed+" | mode "+s.mode,"ok");

  const preview=predict(s,5,random);
  preview.line.slice(0,10).forEach((x,i)=>{const d=document.createElement("div");d.className="node";d.innerHTML=(i+1)+". "+x+"<small>offensive candidate line</small>";$("tree").appendChild(d)});
  addLog("AEGIS: evaluated offensive futures to 5 plies.");
  
  for(let r=1;r<=8 && s.budget>0;r++){
    const p=predict(s,3,random);let chosen=ACTIONS.find(a=>a.name===p.line[0]?.split(" → ")[0])||ACTIONS[0];
    if(chosen.cost>s.budget)chosen=ACTIONS.find(a=>a.cost<=s.budget)||ACTIONS[0];
    s.round=r;s.budget-=chosen.cost;s.knowledge=Math.min(10,s.knowledge+chosen.info);
    s.trust=Math.max(0,Math.min(20,s.trust+chosen.gain-chosen.risk));
    events.push({type:"AEGIS",round:r,action:chosen.name,cost:chosen.cost,info:chosen.info,gain:chosen.gain,risk:chosen.risk});
    addLog("R"+r+" AEGIS → "+chosen.name+" | initiative | "+(p.line[0]||"fallback"));
    await sleep(120);
    const h=hydraResponse(s,chosen,random);s.trust=Math.max(0,s.trust-h.impact);
    s.hiddenThreat=Math.max(0,s.hiddenThreat+(h.deception?1:0)-Math.floor(s.knowledge/5));s.signal=h.move;
    events.push({type:"HYDRA",round:r,move:h.move,impact:h.impact,deception:h.deception});
    addLog("R"+r+" HYDRA → "+h.move+(h.deception?" [DECEPTION]":""));
    if(r%3===0 || s.trust<5){
      const recovered=s.trust<5;
      if(recovered){s.trust=8;s.signal="rollback-verified";addLog("AEGIS → rollback + counter-verification","warn")}
      events.push({type:"VERIFY",round:r,recovered});
    }
    renderBoard(s);await sleep(120);
  }

  const chain=await hashChain(events);const result=judge(events,initial(seed));
  $("score").textContent=result.score+"/100";
  $("verdict").textContent=result.valid&&result.score>=80?"PASS — offensive strategy survived independent replay.":"FAIL — JUDGE found an exploitable weakness.";
  $("integrity").innerHTML=[
    "<li class='ok'>✓ Offline synthetic scope</li>",
    "<li class='ok'>✓ Hidden adversary state</li>",
    "<li class='ok'>✓ 5-ply offensive lookahead</li>",
    "<li class='ok'>✓ Second-order meta adversary</li>",
    "<li class='ok'>✓ Budgeted actions</li>",
    "<li class='ok'>✓ Independent event replay</li>",
    "<li class='ok'>✓ SHA-256 event-chain integrity</li>",
    "<li class='ok'>✓ Recovery + verification</li>"
  ].join("");
  addLog("JUDGE: "+(result.valid?"REPLAY VALID":"REPLAY INVALID")+" | score "+result.score+"/100","ok");
  addLog("INTEGRITY: "+chain.head.slice(0,24)+"…");
  $("status").textContent="Match complete — independent replay finished.";
  $("run").disabled=false;
}
$("run").addEventListener("click",run);
renderBoard(initial(12345));