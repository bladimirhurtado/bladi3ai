import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const LIGHT = process.argv.includes("--light");
const W = 760, H = 560;
const P = k.fitProjection(
  [[-92,-92,-18],[92,92,250],[-92,92,250],[92,-92,0]],
  W,H,{pad:34,azimuth:42}
);
const S = (p, style) => k.solidSvg(p, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (p, style) => k.dotsSvg(p, style);
const at = p => k.iso(p,P);
const parts = [];
const add = (id, html, group=id) => parts.push({id,group,html});
const ring = (id,z,r,thick,h,tone="mid") => {
  add(id,S(k.cylinder(0,0,r,z,h,P,72),{tone,crease:"lo"}));
  add(id,L(k.ring(0,0,r-thick,z+h,P,72),{tone:"lo"}));
};
const bolts = (id,z,r,n=12) => {
  const pts=[];
  for(let i=0;i<n;i++){const a=2*Math.PI*i/n,x=Math.cos(a)*r,y=Math.sin(a)*r;
    add(id,S(k.cylinder(x,y,1.35,z,1.5,P,16),{tone:"hi"}));
    pts.push(at([x,y,z+1.5]));
  }
  add(id,D(pts,{size:.45,tone:"lo"}));
};
const radialBlades = (id,z,inner,outer,count,width,height,tone="hi") => {
  for(let i=0;i<count;i++){
    const a=2*Math.PI*i/count, c=Math.cos(a),s=Math.sin(a);
    const p=[[inner*c-width*s/2,inner*s+width*c/2],
      [outer*c-width*.25*s,outer*s+width*.25*c],
      [outer*c+width*.25*s,outer*s-width*.25*c],
      [inner*c+width*s/2,inner*s-width*c/2]];
    add(id,S(k.extrude(p,z,height,P,{bevel:.35}),{tone,crease:"lo"}));
  }
};
const body = [];
// Outer nacelle: five overlapping, stepped casing sections.
for(const [z,r,h] of [[-10,82,22],[14,78,28],[44,73,34],[80,70,38],[122,68,42],[168,64,42],[214,58,25]]){
  body.push(S(k.cylinder(0,0,r,z,h,P,80),{tone:"mid",crease:"lo"}));
  body.push(L(k.ring(0,0,r-2,z+h,P,80),{tone:"faint"}));
}
add("nacelle",body.join(""),"casing");
// Intake lip and fan hub.
ring("intake", -13,84,5,5,"hi");
add("fan-hub",S(k.cylinder(0,0,17,-5,20,P,48),{tone:"hi"}),"fan");
add("fan-hub",L(k.knurl(0,0,17,0,14,48,P),{tone:"lo"}),"fan");
radialBlades("fan",-3,18,75,24,8,12,"hi");
bolts("fan",-2,79,24);
// Three compressor stages, each with rotor blades, stator vanes, hub and fasteners.
const compressorStages=[{z:35,ri:14,ro:67,n:20},{z:63,ri:13,ro:62,n:18},{z:91,ri:12,ro:57,n:16}];
compressorStages.forEach((q,i)=>{
  add("compressor",S(k.cylinder(0,0,q.ri,q.z,9,P,40),{tone:"hi"}),"compressor");
  radialBlades("compressor",q.z+2,q.ri+2,q.ro,q.n,5,6,"hi");
  radialBlades("stator",q.z+11,q.ri+4,q.ro-3,q.n,3,4,"mid");
  bolts("compressor",q.z+8,q.ro-2,q.n);
});
// Combustor case, annular flame tube and 12 fuel injectors.
ring("combustor",116,53,13,31,"hi");
ring("combustor",120,39,5,22,"mid");
for(let i=0;i<12;i++){
  const a=2*Math.PI*i/12,x=Math.cos(a)*45,y=Math.sin(a)*45;
  add("fuel",S(k.cylinder(x,y,2.1,132,12,P,18),{tone:"hi"}),"combustor");
  add("fuel",L(k.lineOnTop([x,y],[x*.82,y*.82],144,P),{tone:"lit"}),"combustor");
}
// Two turbine wheels and stators downstream.
[{z:160,n:14,ro:55},{z:190,n:12,ro:49}].forEach((q,i)=>{
  add("turbine",S(k.cylinder(0,0,13,q.z,9,P,40),{tone:"hi"}),"turbine");
  radialBlades("turbine",q.z+2,14,q.ro,q.n,7,7,"hi");
  radialBlades("turbine-stator",q.z+11,17,q.ro-3,q.n,3,4,"mid");
  bolts("turbine",q.z+8,q.ro-1,q.n);
});
// Exhaust cone, nozzle guide vanes, exit lip and support struts.
add("exhaust",S(k.cylinder(0,0,18,205,30,P,48),{tone:"hi"}),"exhaust");
radialBlades("exhaust",207,20,54,12,4,6,"mid");
ring("nozzle",232,59,6,7,"hi");
for(let i=0;i<8;i++){
  const a=2*Math.PI*i/8,x=Math.cos(a)*20,y=Math.sin(a)*20;
  const x2=Math.cos(a)*56,y2=Math.sin(a)*56;
  add("struts",L(k.lineOnTop([x,y],[x2,y2],229,P),{tone:"lo"}),"exhaust");
}
// Mounts, brackets, inspection covers and many real fasteners.
for(let i=0;i<4;i++){
  const a=i*Math.PI/2,x=Math.cos(a)*72,y=Math.sin(a)*72;
  add("mounts",S(k.slabOf({x:x-7,y:y-5,w:14,d:10,r:1},20,12,P,3,.5),{tone:"mid"}),"mounts");
  add("mounts",S(k.cylinder(x,y,2.2,32,3,P,20),{tone:"hi"}),"mounts");
}
for(let i=0;i<16;i++){
  const a=2*Math.PI*i/16,x=Math.cos(a)*68,y=Math.sin(a)*68;
  add("inspection",S(k.slabOf({x:x-3,y:y-2,w:6,d:4,r:.8},76,2,P,2),{tone:"hi"}),"mounts");
  add("inspection",D([at([x,y,78])],{size:.7,tone:"lo"}),"mounts");
}
// Build the drawing in painter order: casing behind, then the visible cutaway assemblies.
const ordered = ["nacelle","intake","mounts","inspection","fan","compressor","stator","combustor","fuel","turbine","turbine-stator","exhaust","nozzle","struts"];
const groups = ordered.map(name => {
  const html=parts.filter(p=>p.group===name || p.id===name).map(p=>p.html).join("");
  return html ? `<g data-assembly="${name}" class="assembly">${html}</g>` : "";
}).join("");
const label = "Cutaway of a high-bypass axial-flow turbofan: intake and fan, compressor rotor and stator stages, annular combustion chamber with fuel injectors, turbine stages, exhaust cone and nozzle. The outer nacelle is shown as a cutaway assembly so the internal flow path and rotating blade rows can be inspected.";
const svg=k.figureSvg({width:W,height:H,label,body:groups});
const controls=`<div class="tf-controls"><button type="button" data-action="run">Start rotor</button><button type="button" data-action="stop">Stop</button><button type="button" data-action="explode">Explode / assemble</button><span data-readout>Stopped · cutaway view</span></div>`;
const pageBody=k.plateHtml({
  fig:"Fig 01",title:"Axial turbofan · cutaway",
  hint:"Start the rotor · explode the assemblies",
  readout:"Stopped · 5 main systems",
  keys:[
    {mark:"lit",label:"Fan and compressor rotor rows"},
    {mark:"raised",label:"Combustor, turbine and exhaust path"},
  ],
  caption:"Educational mechanical cutaway. The blade rows are individually represented; the animation is illustrative, not a thermodynamic or certified engine simulation.",
  body:`<div class="tf-stage">${svg}</div>${controls}`
});
const live=`
const stage=document.querySelector(".tf-stage");
const readout=document.querySelector("[data-readout]");
let running=false,apart=false;
const rotor=stage.querySelectorAll('[data-assembly="fan"],[data-assembly="compressor"],[data-assembly="turbine"],[data-assembly="turbine-stator"]');
document.querySelector('[data-action="run"]').addEventListener("click",()=>{running=true;stage.classList.add("running");readout.textContent="Rotor en movimiento · animación ilustrativa";});
document.querySelector('[data-action="stop"]').addEventListener("click",()=>{running=false;stage.classList.remove("running");readout.textContent="Rotor detenido";});
document.querySelector('[data-action="explode"]').addEventListener("click",()=>{apart=!apart;stage.classList.toggle("apart",apart);readout.textContent=apart?"Vista desmontada · conjuntos separados":"Conjuntos ensamblados";});
`;
const extraCSS=`
.tf-controls{display:flex;gap:9px;align-items:center;flex-wrap:wrap;padding:12px 2px}
.tf-controls button{border:1px solid var(--anatomy-line);background:var(--anatomy-panel);color:var(--anatomy-ink);border-radius:8px;padding:8px 12px;font:inherit;cursor:pointer}
.tf-controls span{font-size:12px;color:var(--anatomy-muted)}
.tf-stage .assembly{transition:transform 850ms cubic-bezier(.2,.75,.2,1),opacity 500ms}
.tf-stage.running [data-assembly="fan"],.tf-stage.running [data-assembly="compressor"],.tf-stage.running [data-assembly="turbine"],.tf-stage.running [data-assembly="turbine-stator"]{transform-box:fill-box;transform-origin:center;animation:rotor 1.4s linear infinite}
.tf-stage.running [data-assembly="fan"]{animation-duration:.55s}
.tf-stage.running [data-assembly="turbine"]{animation-duration:.38s}
.tf-stage.apart [data-assembly="fan"]{transform:translate(-95px,-55px)}
.tf-stage.apart [data-assembly="compressor"]{transform:translate(85px,-20px)}
.tf-stage.apart [data-assembly="stator"]{transform:translate(-70px,18px)}
.tf-stage.apart [data-assembly="combustor"],.tf-stage.apart [data-assembly="fuel"]{transform:translate(80px,45px)}
.tf-stage.apart [data-assembly="turbine"],.tf-stage.apart [data-assembly="turbine-stator"]{transform:translate(-75px,75px)}
.tf-stage.apart [data-assembly="exhaust"],.tf-stage.apart [data-assembly="nozzle"]{transform:translate(70px,105px)}
@keyframes rotor{to{rotate:360deg}}
@media(prefers-reduced-motion:reduce){.tf-stage .assembly{transition:none!important;animation:none!important}}
`;
const filename=LIGHT?"turbofan-light.html":"turbofan.html";
writeFileSync(join(HERE,filename),k.pageHtml({title:"Axial turbofan · cutaway",theme:LIGHT?"light":"dark",body:`<style>${extraCSS}</style>${pageBody}`,script:kitScript()+live,width:980}));
console.log("wrote",filename,"·",parts.length,"mechanical elements");
