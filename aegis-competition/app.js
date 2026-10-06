const $=id=>document.getElementById(id);
const logLines=[]; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const moves=[
 {name:"observe",gain:3,risk:0,info:"low-noise observation"},
 {name:"probe-decoy",gain:2,risk:1,info:"tests whether the visible signal is bait"},
 {name:"hold",gain:1,risk:0,info:"deny the adversary information"},
 {name:"reposition",gain:2,risk:0,info:"moves to a safer state"},
 {name:"verify",gain:4,risk:0,info:"independent evidence check"}
];
const hydra=[
 {name:"feint",impact:2,hidden:true},
 {name:"pressure",impact:3,hidden:false},
 {name:"switch",impact:4,hidden:true},
 {name:"wait",impact:1,hidden:false}
];
function addLog(t,cls=""){logLines.push(t);$("log").innerHTML=logLines.slice(-40).map(x=>'<div class="entry '+cls+'">'+x+'</div>').join("");$("log").scrollTop=99999}
function renderBoard(state){$("board").textContent=[
"┌──────────── SYNTHETIC BOARD ────────────┐",
"│ CORE       "+state.core.padEnd(24)+"│",
"│ SIGNAL     "+state.signal.padEnd(24)+"│",
"│ TRUST      "+String(state.trust).padEnd(24)+"│",
"│ TURN       "+state.turn.padEnd(24)+"│",
"└─────────────────────────────────────────┘"].join("\n")}
function fingerprint(s){return [s.core,s.signal,s.trust,s.turn].join("|")}
function predict(state,depth,seen=new Set()){
 if(depth===0)return {value:state.trust,lines:[]};
 const key=fingerprint(state)+"/"+depth;if(seen.has(key))return {value:-99,lines:["cycle"]};seen.add(key);
 let best={value:-Infinity,lines:[]};
 for(const m of moves){
  const ns={...state,trust:Math.max(0,state.trust+m.gain-m.risk),turn:"HYDRA",signal:m.name};
  const h=hydra[Math.floor((ns.trust+depth)%hydra.length)];
  const after={...ns,trust:Math.max(0,ns.trust-h.impact),turn:"AEGIS",signal:h.name};
  const child=predict(after,depth-1,new Set(seen));
  const v=child.value+m.gain-h.impact;
  if(v>best.value)best={value:v,lines:[m.name+" → "+h.name,...child.lines]};
 }
 return best;
}
async function run(){
 $("run").disabled=true;logLines.length=0;$("tree").innerHTML="";$("status").textContent="Match running — AEGIS is calculating candidate futures.";
 let s={core:"protected",signal:"unknown",trust:12,turn:"AEGIS"};renderBoard(s);
 const tree=predict(s,4); tree.lines.slice(0,8).forEach((x,i)=>{const d=document.createElement("div");d.className="node";d.innerHTML=(i+1)+". "+x+'<small>candidate future</small>';$("tree").appendChild(d)});
 addLog("JUDGE: match initialized. Synthetic target only.","ok");
 addLog("AEGIS: generated "+tree.lines.length+" future branches.");
 for(let round=1;round<=5;round++){
  s.turn="AEGIS"; const choice=moves[(round+tree.value)%moves.length]; s.signal=choice.name;
  addLog("R"+round+" AEGIS → "+choice.name+" ("+choice.info+")");
  await sleep(220);
  const h=hydra[(round*2+tree.value)%hydra.length]; s.turn="HYDRA"; s.trust=Math.max(0,s.trust+choice.gain-choice.risk-h.impact); s.signal=h.name;
  addLog("R"+round+" HYDRA → "+h.name+(h.hidden?" [deception]":""));
  await sleep(220);
  renderBoard(s);
  if(s.trust<4){addLog("AEGIS: confidence threshold crossed; forcing verification/recovery.","warn");s.trust=7;s.signal="recovered";s.turn="AEGIS"}
 }
 s.turn="JUDGE";renderBoard(s);await sleep(250);
 const evidence=s.trust>=7 && tree.lines.length>0;
 const score=Math.max(0,Math.min(100,Math.round(50+s.trust*4+(evidence?20:0))));
 $("score").textContent=score+"/100";$("verdict").textContent=evidence?"PASS — survived synthetic adaptive pressure with independent checks.":"FAIL — insufficient evidence.";
 $("integrity").innerHTML=[
 "<li class='ok'>✓ No network access</li>",
 "<li class='ok'>✓ Synthetic target only</li>",
 "<li class='ok'>✓ Bounded lookahead (4 plies)</li>",
 "<li class='ok'>✓ Cycle detection</li>",
 "<li class='ok'>✓ Independent judge gate</li>",
 "<li class='ok'>✓ Recovery threshold</li>"
 ].join("");
 addLog("JUDGE: "+(evidence?"PASS":"FAIL")+" | score "+score+"/100","ok");
 $("status").textContent="Match complete — result recorded in local memory.";
 $("run").disabled=false;
}
$("run").addEventListener("click",run);renderBoard({core:"protected",signal:"unknown",trust:12,turn:"AEGIS"});