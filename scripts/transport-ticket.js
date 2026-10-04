(function(root){
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function stop(name,url){return /^https?:\/\//i.test(url||'')?'<a class="d7-ticket-stop" href="'+esc(url)+'">'+esc(name)+'</a>':'<span class="d7-ticket-stop">'+esc(name)+'</span>';}
  function render(t){
    for(const key of ['number','origin','destination','depart','arrive','date'])if(!t[key])throw new Error('Missing ticket field: '+key);
    return '<article class="exec-edge d7-train"><div class="d7-ticket"><div class="d7-ticket-head"><span class="d7-rail-mark" aria-hidden="true"></span><div><span class="d7-ticket-kicker">'+esc(t.title||'列车发车提醒')+'</span><strong class="d7-ticket-number"><span class="d7-train-glyph" aria-hidden="true"></span>'+esc(t.number)+'</strong></div></div><div class="d7-ticket-info"><span>座位 <b>'+esc([t.carriage,t.seat].filter(Boolean).join(' ')||'待确认')+'</b></span><span>检票口 <b>'+esc(t.gate||'待确认')+'</b></span></div><div class="d7-ticket-divider" aria-hidden="true"></div><div class="d7-ticket-route"><div class="d7-ticket-terminal">'+stop(t.origin,t.originUrl)+'<time>'+esc(t.depart)+'</time></div><div class="d7-ticket-center">'+esc(t.date)+(t.duration?'<small>'+esc(t.duration)+'</small>':'')+'</div><div class="d7-ticket-terminal">'+stop(t.destination,t.destinationUrl)+'<time>'+esc(t.arrive)+'</time></div></div>'+(t.status?'<span class="d7-ticket-status">'+esc(t.status)+'</span>':'')+'</div>'+(t.note?'<p class="d7-train-note"><b>注意：</b>'+esc(t.note)+'</p>':'')+'</article>';
  }
  if(typeof module==='object'&&module.exports)module.exports={render};else root.GuideTransportTicket={render};
})(typeof window==='object'?window:globalThis);
