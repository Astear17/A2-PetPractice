import {tests,libraryFiles} from './data.js';
import {gradePart} from './grader.js';
import {remainingSeconds,formatTime,crossedWarning} from './timer.js';
import {read,write,remove} from './storage.js';

const app=document.querySelector('#app');
const timerEl=document.querySelector('#timer');
const announcement=document.querySelector('#announcement');
let active=null;
let timerHandle=null;
let audioHandle=null;
let audioObjectUrl=null;
let lastTimerValue=Infinity;

const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sessionKey=(testId,paperId,mode)=>`session:${testId}:${paperId}:${mode}`;
const findTest=id=>tests.find(t=>t.id===id);
const findPaper=(test,id)=>test?.papers.find(p=>p.id===id);

function stopRuntime(){
  clearInterval(timerHandle);timerHandle=null;timerEl.hidden=true;timerEl.className='timer';
  if(audioHandle){audioHandle.pause();audioHandle=null}
  if(audioObjectUrl){URL.revokeObjectURL(audioObjectUrl);audioObjectUrl=null}
  active=null;
}

function go(route){location.hash=route}

function home(){
  stopRuntime();
  app.innerHTML=`<section class="hero"><div class="eyebrow">Local exam practice</div><h1>Practise clearly.<br>Review quickly.</h1><p>Choose a paper and mode. Full Exam uses strict timing; Practice has no timer.</p></section>
  <section class="grid">${tests.map(test=>`<article class="card"><span class="status">${test.noOfficialKey?'Self-check':'Answer key included'}</span><h2>${escapeHtml(test.title)}</h2><p>${escapeHtml(test.subtitle)}</p>${test.noOfficialKey?'<p class="note">No official key: answers are saved but not scored.</p>':''}<div>${test.papers.map(p=>`<div class="actions"><strong>${escapeHtml(p.title)}</strong><button class="btn primary" data-start="${test.id}|${p.id}|exam">Full Exam</button><button class="btn secondary" data-start="${test.id}|${p.id}|practice">Practice</button></div>`).join('')}</div></article>`).join('')}</section>`;
}

function library(){
  stopRuntime();
  app.innerHTML=`<div class="paper-head"><div><div class="eyebrow">Source archive</div><h1>Library</h1><p>Cambridge A2 sample files included with this site.</p></div></div><div class="library-list">${libraryFiles.map(name=>{const ext=name.split('.').pop().toUpperCase();const href=`materials/${encodeURIComponent(name)}`;return `<article class="library-item"><span class="status">${ext}</span><div><strong>${escapeHtml(name)}</strong><a href="${href}" target="_blank" rel="noopener">Open file</a></div></article>`}).join('')}</div>`;
}

function startPaper(testId,paperId,mode){
  stopRuntime();
  const test=findTest(testId);const paper=findPaper(test,paperId);if(!paper)return home();
  const key=sessionKey(testId,paperId,mode);
  const existing=read(key,null);
  const duration=paper.durationSeconds??(paperId==='rw'?3600:null);
  const session=existing&&!existing.submitted?existing:{testId,paperId,mode,answers:{},startedAt:Date.now(),endsAt:mode==='exam'&&duration?Date.now()+duration*1000:null,audioTime:0,submitted:false};
  active={test,paper,session,key};write(key,session);
  renderPaper();
  if(mode==='exam'&&session.endsAt)startTimer();
  if(paper.audio)setupAudio();
}

function sourcePages(part){return `${part.sourceText?`<div class="passage">${escapeHtml(part.sourceText)}</div>`:''}<div class="source-pages">${(part.sourcePages||[]).map((src,i)=>`<img class="source-page" src="${src}" alt="Source page ${i+1} for ${escapeHtml(part.title)}">`).join('')}</div>`}

function renderQuestion(q){
  const value=active.session.answers[q.id]??'';
  if(q.type==='choice')return `<fieldset class="question" id="question-${q.id}"><legend>Question ${q.number}</legend>${q.options.map(o=>`<label class="option"><input type="radio" name="${q.id}" value="${o}" ${value===o?'checked':''}><span><strong>${o}</strong></span></label>`).join('')}</fieldset>`;
  if(q.type==='gap')return `<div class="question" id="question-${q.id}"><label for="input-${q.id}"><strong>Question ${q.number}</strong></label><input id="input-${q.id}" name="${q.id}" type="text" value="${escapeHtml(value)}" autocomplete="off" spellcheck="false"></div>`;
  const count=wordCount(value);return `<div class="question" id="question-${q.id}"><label for="input-${q.id}"><strong>Writing task ${q.number}</strong></label><textarea id="input-${q.id}" name="${q.id}">${escapeHtml(value)}</textarea><div class="word-count" data-count-for="${q.id}">${count} word${count===1?'':'s'}${q.minimumWords?` · minimum ${q.minimumWords}`:''}</div></div>`;
}

function renderPaper(){
  const {test,paper,session}=active;const allQuestions=paper.parts.flatMap(p=>p.questions);
  app.innerHTML=`<section class="paper-head"><div><div class="eyebrow">${session.mode==='exam'?'Full Exam':'Practice'}</div><h1>${escapeHtml(test.title)}</h1><p>${escapeHtml(paper.title)} · answers save automatically</p>${paper.keyNote?`<p class="note">${escapeHtml(paper.keyNote)}</p>`:''}</div><button class="btn secondary" data-action="home">Exit</button></section>
  ${paper.audio?'<section id="audio-panel" class="audio-panel"></section>':''}
  <div class="exam-layout"><div class="paper-content">${paper.parts.map(part=>`<section data-part="${part.id}"><h2>${escapeHtml(part.title)}</h2><p>${escapeHtml(part.instructions)}</p>${sourcePages(part)}${part.questions.map(renderQuestion).join('')}</section>`).join('')}</div>
  <aside class="palette"><strong>Questions</strong><p>Saved locally as you work.</p><div class="chips">${allQuestions.map(q=>`<button class="chip ${session.answers[q.id]!==undefined&&session.answers[q.id]!==''?'answered':''}" data-jump="${q.id}" aria-label="Go to question ${q.number}">${q.number}</button>`).join('')}</div></aside></div>
  <div class="submitbar"><button class="btn primary" data-action="submit">Submit paper</button></div>`;
}

function wordCount(value){return String(value??'').trim()?String(value).trim().split(/\s+/).length:0}

function saveAnswer(target){
  if(!active||!target.name)return;
  active.session.answers[target.name]=target.value;write(active.key,active.session);
  const chip=document.querySelector(`[data-jump="${CSS.escape(target.name)}"]`);chip?.classList.toggle('answered',target.value.trim()!=='');
  if(target.tagName==='TEXTAREA'){const el=document.querySelector(`[data-count-for="${CSS.escape(target.name)}"]`);const q=active.paper.parts.flatMap(p=>p.questions).find(x=>x.id===target.name);const count=wordCount(target.value);if(el)el.textContent=`${count} word${count===1?'':'s'}${q.minimumWords?` · minimum ${q.minimumWords}`:''}`}
}

function startTimer(){
  lastTimerValue=remainingSeconds(active.session.endsAt);
  timerEl.hidden=false;
  const tick=()=>{
    if(!active)return;const current=remainingSeconds(active.session.endsAt);timerEl.textContent=formatTime(current);timerEl.classList.toggle('warn',current<=600&&current>300);timerEl.classList.toggle('danger',current<=300);
    const warning=crossedWarning(lastTimerValue,current);if(warning){announcement.textContent=`${warning/60} minute${warning===60?'':'s'} remaining`}
    lastTimerValue=current;if(current<=0)submitPaper(true);
  };tick();timerHandle=setInterval(tick,250);
}

function setupAudio(){
  const panel=document.querySelector('#audio-panel');const {session,paper}=active;
  const audio=document.createElement('audio');audio.preload='metadata';audioHandle=audio;
  if(session.mode==='practice'){audio.controls=true;audio.playbackRate=session.audioRate||1;panel.innerHTML='<strong>Practice audio</strong><p class="audio-status">Checking streaming support…</p>';audio.hidden=true;panel.append(audio);const speed=document.createElement('select');speed.setAttribute('aria-label','Playback speed');speed.disabled=true;[.75,1,1.25].forEach(rate=>{const option=new Option(`${rate}×`,rate,rate===(session.audioRate||1),rate===(session.audioRate||1));speed.add(option)});speed.addEventListener('change',()=>{audio.playbackRate=Number(speed.value);session.audioRate=Number(speed.value);write(active.key,session)});panel.append(speed);fetch(paper.audio,{headers:{Range:'bytes=0-0'}}).then(async response=>{if(!response.ok)throw new Error('missing audio');if(!active||audioHandle!==audio)return;if(response.status===206){audio.src=paper.audio;panel.querySelector('.audio-status').textContent='Seek normally and choose a playback speed.'}else{const blob=await response.blob();if(!active||audioHandle!==audio)return;audioObjectUrl=URL.createObjectURL(blob);audio.src=audioObjectUrl;panel.querySelector('.audio-status').textContent='Loaded the complete recording for reliable seeking.'}audio.hidden=false;speed.disabled=false}).catch(()=>{audio.src=paper.audio;audio.hidden=false;speed.disabled=false;panel.querySelector('.audio-status').textContent='Could not test range support; using direct playback.'});
  }else{audio.src=paper.audio;panel.innerHTML='<strong>Official recording</strong><p>Exam mode plays straight through. Browser autoplay rules require one press to start or resume.</p><button class="btn primary" id="start-audio">Start / resume audio</button> <span class="audio-time">Loading…</span>';panel.querySelector('#start-audio').addEventListener('click',()=>audio.play().catch(()=>{panel.querySelector('.audio-time').textContent='Audio could not start. Check that the MP3 exists.'}));let safeTime=session.audioTime||0;audio.addEventListener('loadedmetadata',()=>{audio.currentTime=Math.min(safeTime,audio.duration||safeTime)});audio.addEventListener('seeking',()=>{if(Math.abs(audio.currentTime-safeTime)>1)audio.currentTime=safeTime});audio.addEventListener('timeupdate',()=>{safeTime=audio.currentTime});audio.addEventListener('play',()=>panel.querySelector('#start-audio').hidden=true);audio.addEventListener('pause',()=>{if(!audio.ended)panel.querySelector('#start-audio').hidden=false});}
  audio.addEventListener('timeupdate',()=>{if(!active)return;session.audioTime=audio.currentTime;write(active.key,session);const label=panel.querySelector('.audio-time');if(label&&Number.isFinite(audio.duration))label.textContent=`${formatTime(audio.duration-audio.currentTime)} remaining`});
  audio.addEventListener('error',()=>{panel.insertAdjacentHTML('beforeend','<p class="wrong-text">Audio file is missing or unreadable.</p>')});
}

function submitPaper(automatic=false){
  if(!active)return;clearInterval(timerHandle);if(audioHandle)audioHandle.pause();active.session.submitted=true;active.session.submittedAt=Date.now();write(active.key,active.session);
  const history=read('history',[]);history.push({testId:active.test.id,paperId:active.paper.id,mode:active.session.mode,startedAt:active.session.startedAt,submittedAt:active.session.submittedAt,automatic});write('history',history.slice(-100));
  renderResults(false);
}

function renderResults(wrongOnly){
  timerEl.hidden=true;const {test,paper,session}=active;const results=paper.parts.map(part=>({part,...gradePart(part,session.answers)}));const total=results.reduce((n,r)=>n+r.total,0);const correct=results.reduce((n,r)=>n+r.correct,0);
  app.innerHTML=`<section class="paper-head"><div><div class="eyebrow">Results</div><h1>${escapeHtml(test.title)}</h1><p>${total?`${correct} / ${total} automatically graded questions correct.`:'No official key is available. Use the source pages to self-check your saved answers.'} Writing is not scored.</p></div><button class="btn" data-action="home">Tests</button></section>
  ${total?`<label class="filter"><input type="checkbox" id="wrong-only" ${wrongOnly?'checked':''}> Show wrong answers only</label>`:''}
  ${results.map(({part,rows,correct,total})=>{const visible=wrongOnly?rows.filter(r=>r.graded&&!r.correct):rows;return `<section class="results-part"><h2>${escapeHtml(part.title)}</h2><p>${total?`${correct} / ${total}`:'Self-check only · no official key'}</p>${visible.length?visible.map(r=>`<div class="result-row ${r.graded?(r.correct?'correct':'wrong'):''}"><strong>Question ${r.question.number}</strong><div class="answer">Your answer: <span class="${r.correct?'correct-text':r.graded?'wrong-text':''}">${escapeHtml(r.value||'Not answered')}</span></div>${r.graded?`<div class="answer">Key: <span class="correct-text">${escapeHtml(r.question.answers.join(' / '))}</span></div>`:'<div class="answer">No official key / writing not scored</div>'}</div>`).join(''):'<p>No wrong graded answers in this part.</p>'}</section>`}).join('')}`;
  document.querySelector('#wrong-only')?.addEventListener('change',e=>renderResults(e.target.checked));
}

function route(){
  const hash=location.hash.slice(1)||'/';if(hash==='/library')return library();
  const match=hash.match(/^\/paper\/([^/]+)\/([^/]+)\/(exam|practice)$/);if(match)return startPaper(match[1],match[2],match[3]);home();
}

document.addEventListener('click',event=>{
  const start=event.target.closest('[data-start]');if(start){const [test,paper,mode]=start.dataset.start.split('|');return go(`/paper/${test}/${paper}/${mode}`)}
  const jump=event.target.closest('[data-jump]');if(jump)return document.querySelector(`#question-${CSS.escape(jump.dataset.jump)}`)?.scrollIntoView({behavior:'smooth'});
  const action=event.target.closest('[data-action]')?.dataset.action;if(action==='home')go('/');if(action==='library')go('/library');if(action==='submit')submitPaper(false);
});
document.addEventListener('input',e=>{if(e.target.matches('input[type=text],textarea'))saveAnswer(e.target)});
document.addEventListener('change',e=>{if(e.target.matches('input[type=radio]'))saveAnswer(e.target)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active?.session.endsAt){lastTimerValue=remainingSeconds(active.session.endsAt)+1}});
window.addEventListener('hashchange',route);route();
