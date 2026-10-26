(function(){'use strict';
 const $=id=>document.getElementById(id);const api=window.HACER_API;
 let teacherUser=null,currentId=null,questions=[];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function status(text,error=false){$('work-status').textContent=text;$('work-status').className='status '+(error?'error':'good');}
 function tdata(){return {grade:Number($('grade').value),subject:$('subject').value,title:$('topic').value.trim(),description:$('description').value.trim(),emoji:$('emoji').value,status:'draft',questions};}
 function validQuestions(qs){if(!Array.isArray(qs)||![10,15,20].includes(qs.length))return '10, 15 veya 20 soru olmalı.';
 for(let i=0;i<qs.length;i++){const q=qs[i];if(!q||!Array.isArray(q.variants)||q.variants.length<1)return `${i+1}. sorunun seçenekleri eksik.`;
 for(const v of q.variants){if(!v||typeof v.prompt!=='string'||v.prompt.trim().length<10||!Array.isArray(v.options)||v.options.length!==3||v.options.some(x=>typeof x!=='string'||!x.trim())||![0,1,2].includes(v.correct)||typeof v.explanation!=='string'||v.explanation.trim().length<5||typeof v.hint!=='string'||!v.hint.trim())return `${i+1}. sorudaki metin, üç seçenek, ipucu veya çözüm eksik.`;}}
 return '';
 }
 function renderEditor(){const host=$('questions');host.replaceChildren();$('editor-wrap').classList.toggle('hidden',!questions.length);$('qcount').textContent=questions.length+' soru';questions.forEach((q,i)=>{
 const v=q.variants[0];const div=document.createElement('details');div.className='question';div.open=i===0;div.innerHTML=`<summary class="qhead"><strong>🧩 ${i+1}. Aşama · ${esc(q.skill||'Düşünme')}</strong><span class="pill">${Number(q.difficulty)||1}/5</span></summary><div class="question-body"><div class="field"><label>Soru metni</label><textarea data-q="${i}" data-key="prompt">${esc(v.prompt)}</textarea></div><div class="fields">${v.options.map((o,j)=>`<div class="field"><label>${'ABC'[j]} seçeneği</label><input data-q="${i}" data-option="${j}" value="${esc(o)}"></div>`).join('')}<div class="field"><label>Doğru seçenek</label><select data-q="${i}" data-key="correct">${[0,1,2].map(n=>`<option value="${n}" ${n===v.correct?'selected':''}>${'ABC'[n]}</option>`).join('')}</select></div></div><div class="quest-grid"><div class="field"><label>İpucu</label><textarea data-q="${i}" data-key="hint">${esc(v.hint||'')}</textarea></div><div class="field"><label>Çözüm açıklaması</label><textarea data-q="${i}" data-key="explanation">${esc(v.explanation||'')}</textarea></div></div><p class="hint">${q.variants.length>1?'Bu soruda '+q.variants.length+' öğrenci varyantı bulunuyor. Burada ilk varyant düzenlenir; diğerleri korunur.':'Bu sorunun bir varyantı var.'}</p></div>`;host.append(div);});
 host.querySelectorAll('[data-q]').forEach(input=>input.addEventListener('change',e=>{const el=e.currentTarget;const i=Number(el.dataset.q),v=questions[i].variants[0];if(el.dataset.option!==undefined)v.options[Number(el.dataset.option)]=el.value;else if(el.dataset.key==='correct')v.correct=Number(el.value);else v[el.dataset.key]=el.value;}));
 }
 async function demo(){const b=$('demo');b.disabled=true;try{const r=await fetch('../data/ornek-kesirler-20.json',{cache:'no-store'});if(!r.ok)throw Error('Örnek dosyası yüklenmedi');const a=await r.json();questions=a.questions;currentId=null;$('grade').value=a.grade;$('subject').value=a.subject;$('topic').value=a.title;$('description').value=a.description;$('emoji').value=a.emoji;$('count').value=20;renderEditor();status('20 aşamalı Kesirler örneği yüklendi. Soruları kontrol et; hazır olduğunda taslak kaydet.');}catch(e){status('Hata: '+e.message,true)}finally{b.disabled=false}}
 // Daha once GitHub Pages uzerinde yayinlanan etkinlikler de ogretmen listesinde gorunur.
 // Eski oyunlarin ozel yapisini, kisisellestirmesini veya ogrenci karnesini degistirmez.
 async function publishedLegacyActivities(){
  try{
   const response=await fetch('../data/konular.json',{cache:'no-store'});
   if(!response.ok)throw new Error('Katalog okunamadi');
   const catalog=await response.json();
   const activities=Array.isArray(catalog.activities)?catalog.activities:[];
   return activities.filter(a=>a&&a.status==='ready'&&Number.isInteger(a.grade)&&a.grade>=1&&a.grade<=4&&
    typeof a.title==='string'&&typeof a.path==='string'&&/^\.\/etkinlikler\/[a-z0-9/_-]+\/index\.html$/.test(a.path));
  }catch(e){console.warn('Eski etkinlik kataloğu okunamadı:',e);return [];}
 }
 async function copyOrShow(link){
  try{await navigator.clipboard.writeText(link);status('Öğrenci bağlantısı kopyalandı.');}
  catch{status('Etkinlik bağlantısı: '+link);}
 }
 const SUBJECT_LABELS={math:'Matematik',turkish:'Türkçe',life:'Hayat Bilgisi',science:'Fen Bilimleri',social:'Sosyal Bilgiler'};
 const PAGE_SIZE=5;
 let assessments=[],page=0;
 const filters={query:'',grade:'',subject:'',status:''};
 function libraryStyles(){
  if(document.getElementById('hacer-library-styles'))return;
  const style=document.createElement('style');style.id='hacer-library-styles';
  style.textContent=`
  .library-controls{display:grid;gap:9px;margin:0 0 13px}
  .library-controls input,.library-controls select{font-size:13px;padding:9px 10px;border-radius:10px}
  .library-controls .library-pair{display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px}
  .library-controls .library-count{color:#6d6289;font-size:12px;font-weight:650}
  .library-tabs{display:flex;flex-wrap:wrap;gap:5px}
  .library-tabs button{padding:6px 9px;border-radius:99px;background:#f3f0fc;color:#655a86;font-size:11px;white-space:nowrap}
  .library-tabs button[aria-pressed="true"]{background:#6652ce;color:white}
  .library-results{display:grid;gap:7px;margin-top:4px;min-width:0}
  .library-card{border:1px solid #e8e3f3;border-radius:12px;background:#fff;overflow:hidden;min-width:0}
  .library-card[open]{border-color:#c4b9f6;box-shadow:0 4px 16px #47319312}
  .library-card summary{list-style:none;display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 9px;min-height:58px}
  .library-card summary::-webkit-details-marker{display:none}
  .library-card summary:hover{background:#f9f7ff}
  .library-card .library-icon{display:grid;place-items:center;flex:0 0 28px;height:28px;border-radius:9px;background:#f1ecff;font-size:17px}
  .library-card .library-copy{min-width:0;flex:1}
  .library-card .library-title{display:block;font-size:12px;font-weight:850;line-height:1.35;color:#292148;overflow-wrap:anywhere}
  .library-card .library-sub{display:block;font-size:10.5px;color:#867d97;margin-top:3px;line-height:1.3}
  .library-card .library-badge{font-size:10px;font-weight:750;white-space:nowrap;border-radius:99px;padding:4px 6px;background:#eaf7f2;color:#188062}
  .library-card .library-badge.draft{background:#fff4dd;color:#91601b}
  .library-card .library-chevron{font-size:15px;color:#7b70aa;line-height:1;transition:transform .18s}
  .library-card[open] .library-chevron{transform:rotate(180deg)}
  .library-card .library-body{padding:0 11px 12px 45px;border-top:1px solid #f1ecf7}
  .library-card .library-note{font-size:11px;color:#73698c;margin:9px 0 10px;line-height:1.5}
  .library-card .library-actions{display:flex;gap:6px;flex-wrap:wrap}
  .library-card .library-actions button{font-size:11px;padding:8px 10px;border-radius:9px;white-space:normal}
  .library-pages{display:flex;justify-content:space-between;align-items:center;gap:7px;margin:12px 0 0}
  .library-pages button{font-size:11px;padding:7px 9px;background:#f1edfc;color:#5744a6;border-radius:9px}
  .library-pages button:disabled{opacity:.35}
  .library-pages span{font-size:11px;color:#73698c;white-space:nowrap}
  .library-empty{font-size:12px;color:#77738c;padding:14px 8px;border:1px dashed #e3ddef;border-radius:11px}
  @media(max-width:360px){.library-controls .library-pair{grid-template-columns:1fr}.library-card .library-badge{font-size:9px;padding:3px 5px}}
  `;
  document.head.append(style);
 }
 function ensureLibraryUI(){
  libraryStyles();
  let controls=document.getElementById('assessment-controls');
  if(!controls){
   controls=document.createElement('div');controls.id='assessment-controls';controls.className='library-controls';
   controls.innerHTML=`<div class="library-count" id="assessment-count" aria-live="polite"></div>
   <input type="search" id="assessment-query" placeholder="Konu ara..." aria-label="Değerlendirmelerde ara" maxlength="110">
   <div class="library-pair"><select id="assessment-grade" aria-label="Sınıfa göre filtrele"><option value="">Tüm sınıflar</option><option value="1">1. sınıf</option><option value="2">2. sınıf</option><option value="3">3. sınıf</option><option value="4">4. sınıf</option></select>
   <select id="assessment-subject" aria-label="Derse göre filtrele"><option value="">Tüm dersler</option>${Object.entries(SUBJECT_LABELS).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></div>
   <div class="library-tabs" role="group" aria-label="Yayın durumuna göre filtrele"><button type="button" data-status="" aria-pressed="true">Tümü</button><button type="button" data-status="published" aria-pressed="false">Yayında</button><button type="button" data-status="draft" aria-pressed="false">Taslak</button></div>`;
   $('my-list').before(controls);
   controls.querySelector('#assessment-query').addEventListener('input',e=>{filters.query=e.target.value.trim().toLocaleLowerCase('tr-TR');page=0;renderLibrary();});
   controls.querySelector('#assessment-grade').addEventListener('change',e=>{filters.grade=e.target.value;page=0;renderLibrary();});
   controls.querySelector('#assessment-subject').addEventListener('change',e=>{filters.subject=e.target.value;page=0;renderLibrary();});
   controls.querySelectorAll('[data-status]').forEach(btn=>btn.addEventListener('click',()=>{filters.status=btn.dataset.status;page=0;controls.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));renderLibrary();}));
  }
  controls.classList.toggle('hidden',!teacherUser);
 }
 function editAssessment(a){
  currentId=a.id;questions=JSON.parse(JSON.stringify(a.questions));
  $('grade').value=a.grade;$('subject').value=a.subject;$('topic').value=a.title;
  $('description').value=a.description||'';$('emoji').value=a.emoji||'📘';
  $('count').value=String(questions.length);renderEditor();
  window.scrollTo({top:0,behavior:'smooth'});
  status('Kayıt açıldı. Değişiklikleri kaydederek güncelleyebilirsin.');
 }
 function renderLibrary(){
  const list=$('my-list');list.replaceChildren();
  const matching=assessments.filter(a=>(!filters.grade||String(a.grade)===filters.grade)&&
   (!filters.subject||a.subject===filters.subject)&&(!filters.status||a.status===filters.status)&&
   (!filters.query||(a.title+' '+a.grade+' '+(SUBJECT_LABELS[a.subject]||a.subject)).toLocaleLowerCase('tr-TR').includes(filters.query)));
  const count=document.getElementById('assessment-count');
  if(count)count.textContent=`${assessments.length} değerlendirme · ${assessments.filter(a=>a.status==='published').length} yayında · ${assessments.filter(a=>a.status==='draft').length} taslak`;
  if(!matching.length){const el=document.createElement('p');el.className='library-empty';el.textContent=assessments.length?'Aramana uygun değerlendirme bulunamadı.':'Henüz kayıtlı değerlendirme yok.';list.append(el);return;}
  const maxPages=Math.ceil(matching.length/PAGE_SIZE);page=Math.min(page,maxPages-1);
  const results=document.createElement('div');results.className='library-results';
  for(const a of matching.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE)){
   const details=document.createElement('details');details.className='library-card';
   const summary=document.createElement('summary');
   const icon=document.createElement('span');icon.className='library-icon';icon.textContent=a.icon||'📘';icon.setAttribute('aria-hidden','true');
   const copy=document.createElement('span');copy.className='library-copy';
   const title=document.createElement('strong');title.className='library-title';title.textContent=a.title;
   const meta=document.createElement('small');meta.className='library-sub';meta.textContent=`${a.grade}. sınıf · ${SUBJECT_LABELS[a.subject]||a.subject}${a.legacy?' · İnteraktif oyun':''}`;
   copy.append(title,meta);
   const badge=document.createElement('span');badge.className='library-badge'+(a.status==='draft'?' draft':'');badge.textContent=a.status==='draft'?'Taslak':'Yayında';
   const arrow=document.createElement('span');arrow.className='library-chevron';arrow.textContent='⌄';arrow.setAttribute('aria-hidden','true');
   summary.append(icon,copy,badge,arrow);details.append(summary);
   const body=document.createElement('div');body.className='library-body';
   const note=document.createElement('p');note.className='library-note';note.textContent=a.legacy?'Bu çalışmanın özgün görselleri ve kişiye özel soru sistemi korunur. Düzenleme henüz bu panelde desteklenmiyor.':a.status==='draft'?'Bu sınav henüz öğrencilere açık değil. Düzenleyip yayınlayabilirsin.':`${a.questions?.length||0} soruluk değerlendirme öğrencilere açık.`;
   const actions=document.createElement('div');actions.className='library-actions';
   function button(text,cls,handler){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',handler);actions.append(b);}
   const link=a.legacy?new URL('../'+a.path.substring(2),location.href).href:new URL('../sinav/index.html?id='+encodeURIComponent(a.id),location.href).href;
   if(a.legacy){button('Etkinliği aç','secondary',()=>window.open(link,'_blank','noopener,noreferrer'));button('Bağlantıyı kopyala','ghost',()=>copyOrShow(link));}
   else{button('Düzenle','secondary',()=>editAssessment(a));if(a.status==='published'){button('Sınavı aç','ghost',()=>window.open(link,'_blank','noopener,noreferrer'));button('Bağlantıyı kopyala','ghost',()=>copyOrShow(link));}}
   body.append(note,actions);details.append(body);
   details.addEventListener('toggle',()=>{if(details.open)for(const other of results.querySelectorAll('details[open]'))if(other!==details)other.open=false;});
   results.append(details);
  }
  list.append(results);
  if(maxPages>1){
   const nav=document.createElement('nav');nav.className='library-pages';nav.setAttribute('aria-label','Değerlendirme sayfaları');
   const prev=document.createElement('button');prev.type='button';prev.textContent='← Önceki';prev.disabled=page===0;prev.onclick=()=>{page--;renderLibrary();};
   const mid=document.createElement('span');mid.textContent=`${page+1} / ${maxPages}`;
   const next=document.createElement('button');next.type='button';next.textContent='Sonraki →';next.disabled=page===maxPages-1;next.onclick=()=>{page++;renderLibrary();};
   nav.append(prev,mid,next);list.append(nav);
  }
 }
 async function refreshList(){
  if(!teacherUser)return;
  const list=$('my-list');list.textContent='Yükleniyor…';ensureLibraryUI();
  try{
   const [rows,legacy]=await Promise.all([api.mine(),publishedLegacyActivities()]);
   assessments=[...rows.map(a=>({...a,icon:a.emoji||'📘',legacy:false})),
    ...legacy.map(a=>({...a,legacy:true,status:'published'}))];
   renderLibrary();
  }catch(e){list.textContent='Liste alınamadı: '+e.message;}
 }
 async function session(){if(!api.configured()){ $('config-warning').classList.remove('hidden');$('login').disabled=true;return;}
 try{teacherUser=await api.teacher();}catch(e){$('login-status').textContent='Oturum doğrulanamadı.';api.logout();}
 $('login-view').classList.toggle('hidden',!!teacherUser);$('login-ok').classList.toggle('hidden',!teacherUser);$('logout').classList.toggle('hidden',!teacherUser);
 if(teacherUser){$('signed-user').textContent='✅ Giriş: '+(teacherUser.email||'Yetkili öğretmen');await refreshList();}
 }
 $('login').onclick=async()=>{const btn=$('login');btn.disabled=true;$('login-status').textContent='Giriş yapılıyor…';try{await api.login($('email').value.trim(),$('password').value);await session();if(!teacherUser){api.logout();throw new Error('Bu hesap henüz yetkili öğretmen olarak tanımlanmamış.');}$('password').value='';$('login-status').textContent='Giriş başarılı.';}catch(e){$('login-status').textContent=e.message;}finally{btn.disabled=false;}};
 $('logout').onclick=()=>{api.logout();teacherUser=null;$('my-list').textContent='Giriş yaptıktan sonra burada görünecek.';document.getElementById('assessment-controls')?.classList.add('hidden');session();};
 $('demo').onclick=demo;
 $('generate').onclick=async()=>{if(!api.configured()||!teacherUser){status('Yapay zekâ üretimi için önce Railway API ve öğretmen girişini etkinleştirmeliyiz. Şimdilik “Örnek soru seti” ile arayüzü deneyebilirsin.',true);return;}
 const btn=$('generate');btn.disabled=true;status('Sorular oluşturuluyor…');try{const result=await api.generate({grade:Number($('grade').value),subject:$('subject').value,title:$('topic').value.trim(),count:Number($('count').value)});const output=result.questions||[];const err=validQuestions(output);if(err)throw new Error(err);questions=output;currentId=null;renderEditor();status('Sorular oluşturuldu. Önizlemeden önce doğru cevapları ve açıklamaları kontrol edin.');}catch(e){status('Oluşturulamadı: '+e.message,true);}finally{btn.disabled=false;}};
 $('preview').onclick=()=>{const err=validQuestions(questions);if(err){status(err,true);return;}const data=tdata();localStorage.setItem('hacer_preview_v3',JSON.stringify(data));window.open('../sinav/index.html?preview=1','_blank','noopener');};
 async function save(publish){if(!api.configured()||!teacherUser){status('Yayınlama için Railway API ve yetkili öğretmen girişi gerekli.',true);return;}
 const err=validQuestions(questions);if(err){status(err,true);return;}const data=tdata();if(!data.title||data.title.length<3){status('Konu başlığı en az üç karakter olmalı.',true);return;}
 data.status=publish?'published':'draft';if(currentId)data.id=currentId;const btn=publish?$('publish'):$('draft');btn.disabled=true;
 try{const rows=await api.upsert(data);if(!rows||!rows[0])throw new Error('Sunucu kayıt yanıtı alınamadı.');currentId=rows[0].id;status(publish?'✅ Yayınlandı! Öğrenci portalında yeni konu artık görünecek.':'✅ Taslak kaydedildi.');await refreshList();}catch(e){status('Kaydedilemedi: '+e.message,true);}finally{btn.disabled=false;}}
 $('draft').onclick=()=>save(false);$('publish').onclick=()=>save(true);
 session();
})();
