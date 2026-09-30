(function(root){
  'use strict';
  function tripDate(now){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
  function currentDay(now,dates){var date=tripDate(now);return dates.indexOf(date)>=0?date:null;}
  if(typeof module==='object'&&module.exports)module.exports={tripDate:tripDate,currentDay:currentDay};
  if(!root.document)return;
  var doc=root.document,days=Array.from(doc.querySelectorAll('#p-plan > details.day'));
  var today=currentDay(new Date(),days.map(function(d){return d.dataset.date;}));
  var todayCard=days.find(function(d){return d.dataset.date===today;});
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  function showPanel(id){doc.querySelectorAll('.panel').forEach(function(p){p.classList.toggle('active',p.id===id);});doc.querySelectorAll('.tabbar button').forEach(function(b){b.classList.toggle('active',b.dataset.p===id);});}
  function closeDays(){days.forEach(function(d){d.open=false;});}
  function scrollToTarget(el){requestAnimationFrame(function(){el.scrollIntoView({block:'start',behavior:'auto'});});}
  function focusToday(){showPanel('p-plan');closeDays();if(todayCard){todayCard.open=true;scrollToTarget(todayCard);}else scrollToTarget(doc.getElementById('p-plan'));}
  function reveal(){
    var id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){id='';}
    var target=id&&doc.getElementById(id);
    if(!target){focusToday();return;}
    var panel=target.closest('.panel');if(!panel){focusToday();return;}
    if(target.id==='p-plan'){focusToday();return;}
    showPanel(panel.id);closeDays();
    for(var p=target;p&&p!==panel;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
    scrollToTarget(target);
  }
  function resetInitial(){days.forEach(function(d){d.open=false;d.querySelectorAll('details').forEach(function(s){s.open=false;});d.toggleAttribute('data-today',d===todayCard);});reveal();}
  doc.querySelectorAll('.tabbar button').forEach(function(b){b.addEventListener('click',function(){history.replaceState(null,'','#'+b.dataset.p);if(b.dataset.p==='p-plan')focusToday();else{showPanel(b.dataset.p);scrollToTarget(doc.getElementById(b.dataset.p));}});});
  doc.querySelectorAll('[data-plan-action]').forEach(function(b){b.addEventListener('click',function(){var action=b.dataset.planAction;if(action==='today'){history.replaceState(null,'','#p-plan');focusToday();return;}days.forEach(function(d){d.open=action==='expand';});});});
  var status=doc.getElementById('plan-date-status');if(status)status.textContent=todayCard?'北京时间 '+today+' · '+todayCard.querySelector('.dnum em').textContent+' 今天':'非行程日期 · 点任一天查看';
  var todayButton=doc.querySelector('[data-plan-action="today"]');if(todayButton)todayButton.disabled=!todayCard;
  root.addEventListener('hashchange',reveal);
  root.addEventListener('pageshow',function(e){if(e.persisted)resetInitial();});
  doc.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(a&&a.hash===location.hash)reveal();});
  resetInitial();
})(typeof window==='object'?window:globalThis);
