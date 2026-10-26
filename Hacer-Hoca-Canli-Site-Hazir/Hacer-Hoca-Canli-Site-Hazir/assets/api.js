/* Hacer Hoca Railway API adapter. API public URL only, never secrets. */
(function(){'use strict';
const cfg=window.HACER_CONFIG||{},url=String(cfg.apiUrl||'').replace(/\/$/,'');
const store='hacer_hoca_teacher_railway_v1';let session=null;
function configured(){try{const u=new URL(url);return u.protocol==='https:'&&u.username===''&&u.password===''&&u.search===''&&u.hash===''&&u.pathname==='/';}catch{return false;}}
async function request(path,opt={},token){
  if(!configured())throw new Error('Railway API bağlantısı henüz yapılandırılmadı.');
  const response=await fetch(url+path,{...opt,cache:'no-store',headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{}),...(opt.headers||{})}});
  const s=await response.text();let j;try{j=s?JSON.parse(s):null;}catch{j={error:'Sunucu geçersiz yanıt döndürdü.'};}
  if(!response.ok)throw new Error(j?.error||j?.message||`Sunucu hatası (${response.status})`);return j;
}
function remember(s){session=s?.access_token?s:null;if(session)sessionStorage.setItem(store,JSON.stringify({...session,expires_at:Date.now()+Math.max(0,(session.expires_in||28800)-30)*1000}));else sessionStorage.removeItem(store);}
function restore(){if(!session){try{session=JSON.parse(sessionStorage.getItem(store)||'null');}catch{session=null;}}if(!session||!session.access_token||session.expires_at<Date.now()){remember(null);return null;}return session;}
async function login(email,password){const r=await request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});remember(r);return r;}
function logout(){remember(null);}
async function teacher(){const s=restore();return s?await request('/api/auth/me',{},s.access_token):null;}
async function published(){return await request('/api/assessments');}
async function getAssessment(id){const s=restore();return await request('/api/assessments/'+encodeURIComponent(id),{},s?.access_token);}
async function mine(){const s=restore();if(!s)throw new Error('Önce giriş yapın.');return await request('/api/mine',{},s.access_token);}
async function upsert(data){const s=restore();if(!s)throw new Error('Oturum sona erdi.');const id=data.id;const {id:discard,...payload}=data;const r=await request(id?'/api/assessments/'+encodeURIComponent(id):'/api/assessments',{method:id?'PATCH':'POST',body:JSON.stringify(payload)},s.access_token);return [r];}
async function generate(data){const s=restore();if(!s)throw new Error('Önce giriş yapın.');return await request('/api/ai/generate',{method:'POST',body:JSON.stringify(data)},s.access_token);}
window.HACER_API=Object.freeze({configured,login,logout,restore,teacher,published,getAssessment,mine,upsert,generate});
})();
