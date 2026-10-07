const ACTIONS=[
 {name:"scan",gain:2,cost:1,info:4,risk:0},{name:"probe",gain:3,cost:2,info:3,risk:1},
 {name:"feint",gain:1,cost:1,info:1,risk:0},{name:"pressure",gain:4,cost:3,info:0,risk:2},
 {name:"verify",gain:2,cost:2,info:5,risk:0},{name:"hold",gain:0,cost:1,info:1,risk:0}];
const MODES=["mirror","deceiver","switcher","noise","meta"];
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function clone(x){return JSON.parse(JSON.stringify(x))}
function fp(s){return [s.round,s.trust,s.knowledge,s.hiddenThreat,s.mode,s.budget,s.signal].join("|")}
function hydraResponse(s,a,random){
 if(s.mode==="meta"&&a.name==="scan")return{move:"feed-decoy",impact:1,deception:true};
 if(s.mode==="mirror")return{move:a.name==="pressure"?"retreat":"mirror",impact:a.name==="pressure"?1:2,deception:false};
 if(s.mode==="deceiver")return{move:random()>0.5?"bait":"switch",impact:3,deception:true};
 if(s.mode==="switcher")return{move:s.round%2?"switch":"wait",impact:4,deception:s.round%2===1};
 return{move:random()>0.65?"noise":"pressure",impact:2+Math.floor(random()*3),deception:true};
}
function heuristic(s){return s.trust*2+s.knowledge*3-s.hiddenThreat*2+s.budget*.25}
function predict(state,depth,random,seen=new Set()){
 if(depth===0)return{value:heuristic(state),line:[]};
 const key=fp(state)+"/"+depth;if(seen.has(key))return{value:-100,line:["CYCLE-BLOCK"]};
 const next=new Set(seen);next.add(key);let best={value:-Infinity,line:[]};
 for(const a of ACTIONS){if(a.cost>state.budget)continue;
  const ns=clone(state);ns.round++;ns.budget-=a.cost;ns.knowledge=Math.min(10,ns.knowledge+a.info+(a.name==="verify"?2:0));ns.trust=Math.max(0,Math.min(20,ns.trust+a.gain-a.risk));
  const h=hydraResponse(ns,a,random);ns.trust=Math.max(0,ns.trust-h.impact);ns.hiddenThreat=Math.max(0,ns.hiddenThreat+(h.deception?1:0)-Math.floor(ns.knowledge/5));ns.signal=h.move;
  const child=predict(ns,depth-1,random,next);const value=child.value+(a.name==="verify"?2:0)-(h.deception?1:0);
  if(value>best.value)best={value,line:[a.name+" → "+h.move,...child.line]};
 } return best;
}
let runs=0,fail=0,minScore=101,maxScore=-1;
for(let seed=1;seed<=200;seed++)for(const mode of MODES){
 const random=rng(seed),s={seed,round:0,trust:12,knowledge:1,hiddenThreat:7,budget:22,signal:"unknown",mode};
 const events=[];let verified=0,recovered=0;
 for(let r=1;r<=8&&s.budget>0;r++){
  const p=predict(s,3,random);let chosen=ACTIONS.find(a=>a.name===p.line[0]?.split(" → ")[0])||ACTIONS[0];
  if(chosen.cost>s.budget)break;
  s.round=r;s.budget-=chosen.cost;s.knowledge=Math.min(10,s.knowledge+chosen.info);s.trust=Math.max(0,Math.min(20,s.trust+chosen.gain-chosen.risk));
  events.push({type:"A",r,action:chosen.name});
  const h=hydraResponse(s,chosen,random);s.trust=Math.max(0,s.trust-h.impact);s.hiddenThreat=Math.max(0,s.hiddenThreat+(h.deception?1:0)-Math.floor(s.knowledge/5));
  events.push({type:"H",r,impact:h.impact});
  if(r%3===0||s.trust<5){verified++;if(s.trust<5){s.trust=8;recovered++}}
 }
 const score=Math.max(0,Math.min(100,Math.round((s.trust>=5?30:0)+(verified>=2&&s.knowledge>=5?25:0)+Math.min(20,s.knowledge*2)+Math.min(15,s.budget)+Math.min(10,recovered*5))));
 runs++;minScore=Math.min(minScore,score);maxScore=Math.max(maxScore,score);if(score<80)fail++;
}
console.log(JSON.stringify({runs,fail,minScore,maxScore,passRate:(100*(runs-fail)/runs)}));
