(function(){'use strict';const $=id=>document.getElementById(id),api=window.HACER_API;const params=new URLSearchParams(location.search);const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));let exam,name='',step=0,tries=0,locked=false,current=null,records=[],difficulty=1,buddy='fox';
const show=s=>{['welcome','quiz','mid','report','loading'].forEach(id=>$(id).classList.toggle('hidden',id!==s));window.scrollTo({top:0,behavior:'instant'})};
const score=rs=>Math.round(100*rs.reduce((t,x)=>t+x.score,0)/(10*Math.max(1,rs.length)));

// v5.3: instantaneous, decorative feedback, with automatic cleanup.
// No remote assets, no sound, and no input-blocking overlay.
let answerFxTimer=null;
function clearAnswerFx(){
 if(answerFxTimer!==null){clearTimeout(answerFxTimer);answerFxTimer=null;}
 const host=$('answer-fx');if(host)host.replaceChildren();
}
function answerEffect(result){
 clearAnswerFx();
 const host=$('answer-fx');if(!host)return;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const ok=result==='correct';
 if(ok&&!reduced){
   const colors=['#7156e8','#ffb937','#ff668a','#35bca0','#62bde9','#f8e26c'];
   const pieces=window.innerWidth<500?36:52;
   for(let n=0;n<pieces;n++){
     const part=document.createElement('span');
     part.className='fx-confetti'+(n%4===0?' round':'');
     part.style.backgroundColor=colors[n%colors.length];
     const angle=(-Math.PI)+2*Math.PI*n/pieces+(Math.random()-.5)*.35;
     const reach=(window.innerWidth<500?105:170)+Math.random()*(window.innerWidth<500?135:235);
     part.style.setProperty('--dx',Math.round(Math.cos(angle)*reach)+'px');
     part.style.setProperty('--dy',Math.round(Math.sin(angle)*reach+120)+'px');
     part.style.setProperty('--turn',Math.round((Math.random()-.5)*1050)+'deg');
     part.style.setProperty('--duration',(1.5+Math.random()*.6).toFixed(2)+'s');
     part.style.setProperty('--delay',Math.round(Math.random()*120)+'ms');
     host.appendChild(part);
   }
 }
 const banner=document.createElement('div');
 banner.className='fx-banner'+(ok?'':' fx-sad');
 const face=document.createElement('span');face.className='fx-face';face.textContent=ok?'🥳':'😢';
 const words=document.createElement('span');words.textContent=ok?'Harika, başardın!':'Üzülme, tekrar deneyebilirsin!';
 banner.append(face,words);
 if(!ok&&!reduced){
   for(let n=0;n<2;n++){
     const tear=document.createElement('span');tear.className='fx-tear '+(n===0?'one':'two');
     tear.textContent='💧';tear.style.setProperty('--tear-delay',n===0?'130ms':'410ms');
     banner.appendChild(tear);
   }
 }
 host.appendChild(banner);
 answerFxTimer=setTimeout(()=>{host.replaceChildren();answerFxTimer=null;},reduced?1050:2250);
}


// New Nesil Kesirler-style interactive visuals: only data controls the geometry.
// Never inject model-generated HTML, SVG, URLs or script into the document.
const SVG_NS='http://www.w3.org/2000/svg';
const BUDDIES={fox:['🦊','Pati'],robot:['🤖','Robo'],unicorn:['🦄','Işıl']};
function sceneElement(tag,attrs={},parent){const node=document.createElementNS(SVG_NS,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));if(parent)parent.append(node);return node;}
function sceneText(parent,x,y,text,size=14){const node=sceneElement('text',{x,y,'text-anchor':'middle','font-size':size,'font-weight':800,fill:'#514783'},parent);node.textContent=text;return node;}
function visualData(v){
 if(!v||typeof v!=='object')return null;
 const kind=String(v.kind||'');const parts=Number(v.parts),shaded=Number(v.shaded);
 if(!['pizza','bar','battery','grid','line','objects'].includes(kind)||!Number.isInteger(parts)||!Number.isInteger(shaded)||parts<2||parts>24||shaded<0||shaded>parts)return null;
 if(kind==='pizza'&&(parts>12||parts<2))return null;
 if(kind==='line'&&parts>12)return null;
 return {kind,parts,shaded,caption:String(v.caption||'').slice(0,150)};
}
function drawVisual(){
 const host=$('visual');host.replaceChildren();const data=visualData(current.visual);
 if(!data){host.textContent=current.emoji||'🧩';host.classList.remove('has-diagram');$('visual-caption').textContent='';return;}
 const {kind,parts,shaded}=data;host.classList.add('has-diagram');
 const svg=sceneElement('svg',{viewBox:'0 0 360 190',role:'img','aria-label':data.caption||'Sorunun görsel modeli'});
 host.append(svg);sceneElement('rect',{x:0,y:0,width:360,height:190,rx:16,fill:'#f8f6ff'},svg);
 const primary='#7161db',secondary='#f0dcab',line='#b5acd9';
 if(kind==='pizza'){
   sceneElement('circle',{cx:175,cy:90,r:78,fill:'#edc88e'},svg);
   for(let i=0;i<parts;i++){
    const a=i*2*Math.PI/parts-Math.PI/2,b=(i+1)*2*Math.PI/parts-Math.PI/2;
    const x1=175+72*Math.cos(a),y1=90+72*Math.sin(a),x2=175+72*Math.cos(b),y2=90+72*Math.sin(b);
    const d=`M 175 90 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 72 72 0 ${b-a>Math.PI?1:0} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
    sceneElement('path',{d,fill:i<shaded?primary:secondary,stroke:'#fff', 'stroke-width':2.5},svg);
   }
   sceneElement('circle',{cx:175,cy:90,r:3,fill:'#fff'},svg);
 }else if(kind==='line'){
   sceneElement('line',{x1:37,y1:104,x2:322,y2:104,stroke:primary,'stroke-width':4,'stroke-linecap':'round'},svg);
   sceneElement('polygon',{points:'322,104 311,97 311,111',fill:primary},svg);
   for(let i=0;i<=parts;i++){
    const x=39+i*278/parts;
    sceneElement('line',{x1:x,y1:94,x2:x,y2:114,stroke:line,'stroke-width':3},svg);
    if(i===0||i===parts)sceneText(svg,x,139,i===0?'0':'1',14);
    if(i===shaded){sceneElement('circle',{cx:x,cy:104,r:9,fill:'#ed8f75',stroke:'#fff','stroke-width':2},svg);sceneText(svg,x,78,`${i}/${parts}`,13);}
   }
 }else if(kind==='grid'){
   const cols=Math.ceil(Math.sqrt(parts)),rows=Math.ceil(parts/cols),cell=Math.min(35,138/cols,130/rows),gap=4;
   const x0=180-(cols*cell+(cols-1)*gap)/2,y0=87-(rows*cell+(rows-1)*gap)/2;
   for(let i=0;i<parts;i++)sceneElement('rect',{x:x0+(i%cols)*(cell+gap),y:y0+Math.floor(i/cols)*(cell+gap),width:cell,height:cell,rx:5,fill:i<shaded?primary:'#e4dcf6',stroke:'#fff','stroke-width':1.5},svg);
 }else if(kind==='objects'){
   const cols=Math.min(8,parts),rows=Math.ceil(parts/cols),cell=32,gap=8;
   const x0=180-(cols*cell+(cols-1)*gap)/2,y0=91-(rows*cell+(rows-1)*gap)/2;
   for(let i=0;i<parts;i++){
    const cx=x0+(i%cols)*(cell+gap)+cell/2,cy=y0+Math.floor(i/cols)*(cell+gap)+cell/2;
    sceneElement('circle',{cx,cy,r:cell/2-2,fill:i<shaded?primary:'#e6dff5',stroke:'#fff','stroke-width':2},svg);
   }
 }else{
   const width=300,gap=3,cell=(width-gap*(parts-1))/parts,x0=30;
   if(kind==='battery'){
    sceneElement('rect',{x:x0-11,y:58,width:322,height:68,rx:13,fill:'#fff',stroke:line,'stroke-width':3},svg);
    sceneElement('rect',{x:340,y:79,width:8,height:27,rx:3,fill:line},svg);
   }
   for(let i=0;i<parts;i++)sceneElement('rect',{x:x0+i*(cell+gap),y:kind==='battery'?69:76,width:cell,height:kind==='battery'?46:48,rx:Math.min(6,cell/3),fill:i<shaded?primary:'#e4dcf6'},svg);
 }
 if(kind!=='line')sceneText(svg,180,174,`${shaded} / ${parts} ${kind==='objects'?'nesne':'eş parça'}`,12);
 $('visual-caption').textContent=data.caption;
}
function renderBadges(){const host=$('badges');if(!host)return;host.replaceChildren();
 for(let i=0;i<exam.questions.length;i++){
  const el=document.createElement('span');const record=records[i];el.className='badge-unit '+(record?(record.score?'earned':'missed'):(i===step?'current':''));el.textContent=record?(record.score?'★':'·'):'☆';el.title=`${i+1}. aşama: `+(record?(record.score?'rozet kazanıldı':'alıştırma tamamlandı'):'henüz tamamlanmadı');host.append(el);
 }
}
function buddyMessage(message){const n=BUDDIES[buddy]||BUDDIES.fox;$('buddy-status').textContent=n[0]+' '+n[1]+': '+message;}

function choices(q){const desired=Math.max(1,Math.min(5,Math.ceil((step+1)/4)+(records.slice(-2).length===2&&records.slice(-2).every(x=>x.score===10)?1:records.slice(-2).length===2&&records.slice(-2).every(x=>x.score<=6)?-1:0)));let ranked=q.variants.map(x=>({v:x,d:Math.abs((x.level||q.difficulty||desired)-desired)}));const min=Math.min(...ranked.map(x=>x.d));const picks=ranked.filter(x=>x.d===min);return picks[step%picks.length].v}
async function init(){try{if(params.has('demo')){const r=await fetch('../data/ornek-kesirler-20.json',{cache:'no-store'});if(!r.ok)throw Error('Örnek bulunamadı');exam=await r.json();$('mode-label').textContent='Örnek'}else if(params.get('preview')==='1'){exam=JSON.parse(localStorage.getItem('hacer_preview_v3')||'null')}else if(params.has('id')){exam=await api.getAssessment(params.get('id'));if(exam.status!=='published')throw Error('Sınav henüz yayında değil')}else throw Error('Sınav adresi eksik');// Also handle cached older API adapters and legacy JSONB records.
if(exam&&typeof exam.questions==='string'){
 let parsed=exam.questions;
 for(let i=0;i<3&&typeof parsed==='string';i++){
  try{parsed=JSON.parse(parsed);}catch{break;}
 }
 if(Array.isArray(parsed))exam={...exam,questions:parsed};
}
if(!exam||!Array.isArray(exam.questions)||!exam.questions.length)throw Error('Sınav dosyası geçersiz');$('exam-title').textContent=exam.title;show('welcome')}catch(e){$('loading').textContent='Sınav açılamadı: '+e.message;show('loading')}}
function render(){clearAnswerFx();tries=0;locked=false;let q=exam.questions[step];current={...choices(q),skill:q.skill||'Düşünme',type:q.type||'normal'};$('stage').textContent=(step+1)+' / '+exam.questions.length+' · Aşama';$('skill').textContent=current.skill;$('level').textContent='Zorluk '+(current.level||q.difficulty||1)+'/5';$('bar').style.width=(100*step/exam.questions.length)+'%';$('scene-title').textContent=current.title||q.skill||'Yeni nesil düşünme görevi';drawVisual();renderBadges();buddyMessage('Görseli incele, ipuçlarını fark et!');$('qtext').textContent=current.prompt;$('reason').value='';$('reason').disabled=false;$('method-error').textContent='';$('reason-panel').open=current.type==='tasarim';$('reason-summary').textContent=current.type==='tasarim'?'✏️ Tasarım fikrini açıkla (zorunlu)':'✏️ Çözümünü anlatmak ister misin? (isteğe bağlı)';$('reason-label').textContent=current.type==='tasarim'?'Seçtiğin fikrin neden işe yarayacağını anlat (en az 20 karakter).':'Cevabını nasıl bulduğunu kendi cümlenle yazabilirsin.';$('feedback').classList.add('hidden');$('next').classList.add('hidden');$('options').replaceChildren();current.options.forEach((label,i)=>{const b=document.createElement('button');b.textContent='ABC'[i]+' · '+label;b.onclick=()=>answer(i);$('options').append(b)});show('quiz')}
function feedback(html){$('feedback').innerHTML=html;$('feedback').classList.remove('hidden')}
function answer(i){if(locked)return;const reason=$('reason').value.trim();if(current.type==='tasarim'&&reason.length<20){$('reason-panel').open=true;$('method-error').textContent='Tasarım fikrini en az 20 karakterle açıkla.';$('reason').focus();return}$('method-error').textContent='';tries++;const bs=[...$('options').querySelectorAll('button')];bs.forEach(b=>b.disabled=true);if(i!==current.correct&&tries===1){answerEffect('wrong');bs[i].classList.add('bad');buddyMessage('Yanılmak öğrenmenin bir parçası. İpucuna bak!');feedback('<strong>İpucuyla tekrar düşünelim!</strong><p>'+esc(current.hint)+'</p><button id="retry" type="button" class="secondary block">Yeniden dene</button>');$('retry').onclick=()=>{bs.forEach((b,j)=>{b.disabled=j===i});$('feedback').classList.add('hidden')};return}locked=true;const pts=i===current.correct?(tries===1?10:6):0;answerEffect(pts?'correct':'wrong');bs[i].classList.add(pts?'good':'bad');bs[current.correct].classList.add('good');records.push({score:pts,skill:current.skill,reason,prompt:current.prompt,answer:current.options[current.correct],explanation:current.explanation,creative:current.type==='tasarim',takeaway:current.takeaway||'',steps:Array.isArray(current.steps)?current.steps.slice(0,4):[]});renderBadges();buddyMessage(pts===10?'Harika! Rozetini kazandın!':pts===6?'İpucunu iyi değerlendirdin!':'Çözümü inceleyip öğrenmeye devam edelim!');const steps=Array.isArray(current.steps)?current.steps.filter(x=>typeof x==='string'&&x.trim()).slice(0,4):[];const diagnose=Array.isArray(current.diagnose)&&typeof current.diagnose[i]==='string'?current.diagnose[i]:'';feedback('<strong>'+(pts===10?'Harika!':pts===6?'İpucuyla çözdün!':'Öğrenmeye devam!')+'</strong><p><b>Doğru cevap:</b> '+esc(current.options[current.correct])+'</p>'+(steps.length?'<ol class="solution-steps">'+steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>':'<p>'+esc(current.explanation)+'</p>')+(steps.length&&current.explanation?'<p>'+esc(current.explanation)+'</p>':'')+(!pts&&diagnose?'<p class="diagnosis">'+esc(diagnose)+'</p>':'')+(current.takeaway?'<p class="takeaway">💡 '+esc(current.takeaway)+'</p>':'')+(reason?'<p class="small">Yazdığın açıklama otomatik puanlanmadı; örnek çözümle karşılaştırabilirsin.</p>':'')+(current.type==='tasarim'?'<p class="small">Yazılı tasarım fikrin otomatik puanlanmaz; öğretmenin ayrıca değerlendirebilir.</p>':''));$('reason').disabled=true;$('next').textContent=(step+1)%5===0?'Ara değerlendirmem →':'Sonraki aşama →';$('next').classList.remove('hidden')}
function next(){if(!locked)return;step++;if(step===exam.questions.length)return report();if(step%5===0){let recent=records.slice(-5);$('mid-title').textContent=step+'. aşama tamamlandı';$('mid-point').textContent=score(recent)+' / 100';$('mid-note').textContent='İlk denemede '+recent.filter(x=>x.score===10).length+', ipucuyla '+recent.filter(x=>x.score===6).length+' soru çözdün. Genel puanın '+score(records)+'/100.';$('mid-skills').textContent='Çalışılan beceriler: '+[...new Set(recent.map(x=>x.skill))].join(', ');show('mid')}else render()}
function report(){$('report-name').textContent=name;$('final-points').textContent=score(records)+'/100';$('first-correct').textContent=records.filter(x=>x.score===10).length;$('hint-correct').textContent=records.filter(x=>x.score===6).length;$('to-improve').textContent=records.filter(x=>x.score===0).length;let sk=[...new Set(records.map(x=>x.skill))].map(k=>({name:k,rs:records.filter(r=>r.skill===k)}));$('summary').textContent='Güçlü beceriler: '+(sk.filter(x=>score(x.rs)>=70).map(x=>x.name).join(', ')||'Öğrenme çaban')+'. Geliştirilecek beceriler: '+(sk.filter(x=>score(x.rs)<70).map(x=>x.name).join(', ')||'Şimdilik belirgin alan yok')+'. Bu puanlar seçmeli yanıtları ölçer; yazılı düşünce ve yaratıcı fikirler otomatik değerlendirilmedi.';const host=$('analysis');host.replaceChildren();records.forEach((r,i)=>{let el=document.createElement('article');el.className='report-item';el.innerHTML='<strong>'+(i+1)+'. '+esc(r.skill)+' · '+r.score+' / 10</strong><p>'+esc(r.prompt)+'</p><p class="small">Doğru: '+esc(r.answer)+'</p><p>'+esc(r.explanation)+'</p>'+(r.takeaway?'<p class="small">Öğrenme notu: '+esc(r.takeaway)+'</p>':'')+(r.reason?'<p class="small"><strong>Öğrencinin açıklaması (otomatik değerlendirilmedi):</strong> '+esc(r.reason)+'</p>':'');host.append(el)});show('report')}
document.querySelectorAll('[data-buddy]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-buddy]').forEach(x=>{x.classList.toggle('chosen',x===b);x.setAttribute('aria-pressed',String(x===b));});buddy=b.dataset.buddy;}));$('begin').onclick=()=>{const v=$('student').value.trim().replace(/\s+/g,' ');if(v.length<5||v.split(' ').length<2){$('name-error').textContent='Ad ve soyadını gir.';return}$('name-error').textContent='';name=v;step=0;records=[];buddy=document.querySelector('[data-buddy].chosen')?.dataset.buddy||'fox';render()};$('reason').addEventListener('input',()=>{$('method-error').textContent=''});$('next').onclick=next;$('continue').onclick=render;$('restart').onclick=()=>{clearAnswerFx();show('welcome')};$('print').onclick=()=>window.print();$('share').onclick=()=>{const t=name+' · '+exam.title+' · '+$('final-points').textContent;if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>$('share-note').textContent='Karne özeti kopyalandı.').catch(()=>$('share-note').textContent=t);else $('share-note').textContent=t};init();})();