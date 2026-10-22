/* Partizan Sesi web sitesi: ortak yardımcılar */
const PS_URL = 'https://jdpotpmmyrebuucarpkg.supabase.co', PS_KEY = 'sb_publishable_4hZ8aN3orv4z2Rkp8dhjCQ_7k-Ntubx';
const sb = supabase.createClient(PS_URL, PS_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ps-site' } });
const SIRA = ['KURAM','EMEK','KADIN','KÜLTÜR – SANAT','EKONOMİ','EKOLOJİ','BİLİM – TEKNOLOJİ','DÜNYA','AVRUPA','KÜRDİSTAN – TÜRKİYE'];
const CEV = {
  'KURAM':['THEORIE','THEORY'],'EMEK':['ARBEIT','LABOUR'],'KADIN':['FRAUEN','WOMEN'],
  'KÜLTÜR – SANAT':['KULTUR – KUNST','CULTURE – ARTS'],'EKONOMİ':['ÖKONOMIE','ECONOMY'],
  'EKOLOJİ':['ÖKOLOGIE','ECOLOGY'],'BİLİM – TEKNOLOJİ':['WISSENSCHAFT – TECHNIK','SCIENCE – TECHNOLOGY'],
  'DÜNYA':['WELT','WORLD'],'AVRUPA':['EUROPA','EUROPE'],'KÜRDİSTAN – TÜRKİYE':['KURDISTAN – TÜRKEI','KURDISTAN – TURKEY'],
  'ANA SAYFA':['START','HOME'],'GÜNDEM':['AKTUELL','LATEST'],'YAZARLAR':['AUTOR*INNEN','WRITERS'],
  'ÖNE ÇIKANLAR':['IM FOKUS','FEATURED'],'TÜMÜ →':['ALLE →','ALL →'],'Yükleniyor…':['Wird geladen…','Loading…'],
  'Bu bölümde henüz yazı yok.':['In dieser Rubrik gibt es noch keine Artikel.','No articles in this section yet.'],
  'Yazı bulunamadı ya da yayından kaldırılmış.':['Artikel nicht gefunden oder nicht mehr verfügbar.','Article not found or no longer available.'],
  'Kaynak':['Quelle','Source'],'Gizlilik':['Datenschutz','Privacy'],'dk okuma':['Min. Lesezeit','min read'],
  'sol ve sosyalist basından okuma':['Lektüre aus der linken und sozialistischen Presse','reading from the left and socialist press'],
  'YAZI':['TEXTE','ARTICLES'],
};
let DIL = 'tr';
try { const d = localStorage.getItem('ps-dil'); if (d === 'de' || d === 'en') DIL = d; } catch (e) {}
const qp = new URLSearchParams(location.search);
if (['tr','de','en'].includes(qp.get('dil'))) { DIL = qp.get('dil'); try { localStorage.setItem('ps-dil', DIL); } catch (e) {} }
const t = s => (CEV[s] ? (DIL === 'de' ? CEV[s][0] : DIL === 'en' ? CEV[s][1] : s) : s);
const AY = {tr:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December']};
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sade = s => String(s ?? '').toLowerCase().replace(/[^a-z0-9À-ɏ]/g, '');
const tarih = iso => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getDate()}${DIL==='de'?'.':''} ${AY[DIL][d.getMonth()]} ${d.getFullYear()}`; };
const SELECT = 'id,title,excerpt,body,published_at,featured,yazar_id,dil,media:media!articles_cover_media_fk(public_url,thumbnail_url),categories!articles_primary_category_id_fkey(name),article_sources(source_url,sources(name))';
function kaynakAdi(a) { return a.article_sources?.[0]?.sources?.name || 'Partizan Sesi'; }
function gorsel(a) { return a.media?.thumbnail_url || a.media?.public_url || ''; }
function okuma(a) { const dk = Math.max(1, Math.round(String(a.body || '').length / 1100)); return dk + ' ' + t('dk okuma'); }
function ozetBasliksiz(baslik, ozet) {
  const b = String(baslik || '').trim(), o = String(ozet || '').trim();
  if (b && o.toLowerCase().startsWith(b.toLowerCase())) return o.slice(b.length).replace(/^[\s.:;,–—-]+/, '').trim();
  return o;
}
function kart(a, yazarlar) {
  const g = gorsel(a), ad = (a.yazar_id && yazarlar?.[a.yazar_id]) || kaynakAdi(a);
  return `<a class="kart" href="yazi.html?id=${a.id}">
    ${g ? `<img src="${esc(g)}" alt="" loading="lazy">` : '<div class="bos"></div>'}
    <div><div class="kk">${esc(ad)}</div><h3>${esc(a.title)}</h3><div class="km">${tarih(a.published_at)} · ${okuma(a)}</div></div></a>`;
}
async function yazarAdlari() {
  const { data } = await sb.from('yazarlar').select('id,name,photo_url,sort_order').order('sort_order').order('name');
  const m = {}; (data || []).forEach(y => m[y.id] = y.name);
  const { data: say } = await sb.from('articles').select('yazar_id').eq('status', 'published').eq('dil', DIL).not('yazar_id', 'is', null).limit(5000);
  const yazisiOlan = new Set((say || []).map(x => x.yazar_id));
  return { liste: (data || []).filter(y => yazisiOlan.has(y.id)), ad: m };
}
function ustKisim(aktif) {
  const sekme = (h, ad, k) => `<a href="${h}" class="${aktif === k ? 'on' : ''}">${t(ad)}</a>`;
  document.getElementById('ust').innerHTML = `
    <div class="ust1"><a class="logo" href="./">PARTİZAN<span>SESİ</span></a>
      <div class="dil">${['tr','de','en'].map(d => `<a href="?${new URLSearchParams({...Object.fromEntries(qp), dil: d})}" class="${DIL===d?'on':''}">${d.toUpperCase()}</a>`).join('')}</div></div>
    <nav class="serit">${sekme('./','ANA SAYFA','ana')}${sekme('gundem.html','GÜNDEM','gundem')}${sekme('yazarlar.html','YAZARLAR','yazarlar')}
      ${SIRA.map(b => sekme('bolum.html?b=' + encodeURIComponent(b), b, b)).join('')}</nav>`;
  document.getElementById('alt').innerHTML = `Partizan Sesi · ${t('sol ve sosyalist basından okuma')} · <a href="gizlilik.html">${t('Gizlilik')}</a>`;
  document.documentElement.lang = DIL;
}
