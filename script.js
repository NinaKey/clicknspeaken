/**********************
 * 1) LEKCIJE / TTS
 **********************/
document.addEventListener("DOMContentLoaded", function() {
  const sentence = document.getElementById("sentence");
  let mode = "simple";
  let voices = [];

  // Dugmići za izbor moda
  document.querySelectorAll("#mode-select button").forEach(btn => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
    });
  });

  // Učitaj glasove jednom
  function loadVoices() { voices = speechSynthesis.getVoices(); }
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  // a/an
  function getIndefiniteArticle(word) {
    if (!word) return 'a';
    const w = word.trim().toLowerCase();
    const silentH = ['hour','honest','honour','heir'];
    if (silentH.some(s => w.startsWith(s))) return 'an';
    const vowels = ['a','e','i','o','u'];
    return vowels.includes(w[0]) ? 'an' : 'a';
  }

  // Glavna funkcija za govor i prikaz
  function speakWord(word, elem = null) {
    if (!word) return;
    let speakText = "";
    if (mode === "sentences") {
      const prefix = (elem && elem.dataset && elem.dataset.prefix) ? elem.dataset.prefix.trim() : "";

      if (prefix === "number") {
        speakText = `This is number ${word.toLowerCase()}.`;
      } else if (prefix === "letter") {
        speakText = `This is letter ${word.toLowerCase()}.`;
      } else {
        let article = "";
        if (elem && elem.dataset && typeof elem.dataset.article !== "undefined") {
          article = elem.dataset.article.trim(); // "", "a", "an", "the"
        } else if (elem && elem.classList.contains("animal-box")) {
          article = getIndefiniteArticle(word);
        } else {
          article = "";
        }
        speakText = article ? `This is ${article} ${word.toLowerCase()}.` : `This is ${word.toLowerCase()}.`;
      }
      if (sentence) sentence.textContent = speakText;
    } else {
      if (sentence) sentence.textContent = "";
      speakText = word;
    }
    const utterance = new SpeechSynthesisUtterance(speakText);
    const britishFemale = voices.find(v => v.lang === "en-GB" && v.name && v.name.toLowerCase().includes("female"));
    if (britishFemale) utterance.voice = britishFemale;
    else {
      const britishAny = voices.find(v => v.lang === "en-GB");
      if (britishAny) utterance.voice = britishAny; else utterance.lang = "en-GB";}
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);}

  // Klikovi
  document.querySelectorAll(".color-box").forEach(box => {
    box.addEventListener("click", () => speakWord(box.innerText, box));
  });
  document.querySelectorAll(".animal-box").forEach(box => {
    const w = box.dataset.word || box.innerText;
    box.addEventListener("click", () => speakWord(w, box));
  });

  // Fade-in
  document.body.classList.add("fade-in");
});

/**********************
 * 2) KONTAKT FORMA
 **********************/
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const msg = document.createElement("p");
        msg.textContent = "✅ Hvala na javljanju! Odgovorićemo vam uskoro.";
        msg.classList.add("thanks-msg");
        msg.style.color = "#4CAF50";
        msg.style.fontWeight = "bold";
        msg.style.marginTop = "15px";
        contactForm.after(msg);
        contactForm.reset();
      } else {
        alert("❌ Došlo je do greške. Pokušajte ponovo.");
      }
    } catch (error) {
      alert("⚠️ Greška u komunikaciji sa serverom.");
    }
  });
});

/**********************
 * 3) PESMICE
 **********************/
const songCards = document.querySelectorAll(".song-card");
const videoPlayer = document.getElementById("video-player");
if (songCards.length && videoPlayer) {
  songCards.forEach(card => {
    card.addEventListener("click", () => {
      const videoUrl = card.dataset.video || "";
      const rawLyrics = card.dataset.lyrics || "";
      const lyricsHtml = rawLyrics.replace(/\n/g, "<br>");
      videoPlayer.innerHTML = `
        <div class="song-block">
          <div class="video">
            <iframe src="${videoUrl}" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen></iframe>
          </div>
          <div class="lyrics">
            <h4>Lyrics:</h4>
            <details>
              <summary>Prikaži / sakrij tekst</summary>
              <div class="lyrics-text">${lyricsHtml || "—"}</div>
            </details>
          </div>
        </div>`;
    });
  });
}

/**********************
 * 4) GAMES – MENI
 **********************/
document.addEventListener("DOMContentLoaded", function(){
  const menu = document.getElementById("gamesMenu");
  const panels = document.querySelectorAll(".game-panel");
  if (!menu) return;

  function openPanel(id){
    menu.classList.add("hidden");
    panels.forEach(p => p.classList.add("hidden"));
    const t = document.getElementById(id);
    if (t) t.classList.remove("hidden");
  }
  function backToMenu(){
    panels.forEach(p => p.classList.add("hidden"));
    menu.classList.remove("hidden");
  }

  menu.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openPanel(btn.dataset.open));
  });
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", backToMenu);
  });

  // START dugmad + TTS dugmad
  const cs = document.getElementById("c-start");
  const ns = document.getElementById("n-start");
  const as = document.getElementById("a-start");
  const ls = document.getElementById("l-start");
  const aSay = document.getElementById("a-say");
  const lSay = document.getElementById("l-say");

  if (cs) cs.addEventListener("click", startColors);
  if (ns) ns.addEventListener("click", startNumbers);
  if (as) as.addEventListener("click", startAnimals);
  if (ls) ls.addEventListener("click", startLetters);

  if (aSay) aSay.addEventListener("click", sayAnimal);
  if (lSay) lSay.addEventListener("click", sayLetter);
});

/**********************
 * 5) GAMES – SFX
 **********************/
function playTone(freq = 660, ms = 180, type = "sine"){
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms/1000);
    o.start();
    o.stop(ctx.currentTime + ms/1000 + 0.02);
  } catch(e) {}
}
function soundOk(){ playTone(660,140,"triangle"); setTimeout(()=>playTone(880,120,"triangle"),120); }
function soundErr(){ playTone(220,220,"sawtooth"); }

function setResult(id, text, ok){
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "result " + (ok ? "ok" : "err");
}
function endMessage(containerId, score, max){
  const el = document.getElementById(containerId);
  if (!el) return;
  const msg = score === max ? "🎉 Odlično! Maksimalan rezultat!" :
              score >= Math.ceil(max*0.6) ? "👏 Bravo! Sjajan rezultat!" :
              "💪 Dobar trud! Probaj ponovo i biće još bolje!";
  el.innerHTML = `Kraj igre — rezultat: <b>${score}/${max}</b> • ${msg} <button class="btn" style="margin-left:10px" onclick="this.closest('.game-card').querySelector('.btn').click()">Igraj opet</button>`;
}

/**********************
 * 6) GAMES – TTS
 **********************/
let voicesCache = [];
try { speechSynthesis.onvoiceschanged = () => { voicesCache = speechSynthesis.getVoices(); }; } catch(e){}
voicesCache = speechSynthesis.getVoices();
function sayEN(text){
  try{
    const u = new SpeechSynthesisUtterance(text);
    const femaleGB = voicesCache.find(v => v.lang === "en-GB" && v.name && v.name.toLowerCase().includes("female"));
    if (femaleGB) u.voice = femaleGB;
    else {
      const anyGB = voicesCache.find(v => v.lang === "en-GB");
      if (anyGB) u.voice = anyGB; else u.lang = "en-GB";
    }
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }catch(e){}
}

/**********************
 * 7) IGRA 1: BOJE
 **********************/
const COLORS = ["red","blue","green","yellow","orange","purple","pink","black","white","brown","grey"];
let cTry = 0, cScore = 0, cAnswer = "", cUsed = new Set();
const C_MAX = 5;

function startColors(){
  cTry = 0; cScore = 0; cUsed.clear();
  const r = document.getElementById("c-result"); if (r) r.textContent="";
  nextColorTry();
}
function nextColorTry(){
  cTry++;
  updateColorHeader();
  if (cTry > C_MAX){
    endMessage("c-task", cScore, C_MAX);
    const b = document.getElementById("colorsBoard"); if (b) b.innerHTML = "";
    return;
  }
  const available = COLORS.filter(c => !cUsed.has(c));
  if (!available.length) { cUsed.clear(); available.push(...COLORS); }
  const answer = available[Math.floor(Math.random()*available.length)];
  cUsed.add(answer);
  cAnswer = answer;

  const others = COLORS.filter(x => x !== answer).sort(()=>Math.random()-0.5).slice(0,5);
  const pool = [answer, ...others].sort(()=>Math.random()-0.5);

  const task = document.getElementById("c-task");
  if (task) task.innerHTML = `Pokušaj: <b>${cTry}/${C_MAX}</b> • Klikni na boju: <b>${cAnswer.toUpperCase()}</b>`;

  const board = document.getElementById("colorsBoard");
  if (!board) return;
  board.innerHTML = "";
  pool.forEach(color => {
    const d = document.createElement("div");
    d.className = "color-card";
    d.style.background = color;
    d.addEventListener("click", () => {
      if (color === cAnswer){ cScore++; setResult("c-result","Tačno! ✅",true); soundOk(); }
      else { setResult("c-result","Pokušaj ponovo. ❌",false); soundErr(); }
      setTimeout(nextColorTry, 650);
    });
    board.appendChild(d);
  });
}
function updateColorHeader(){
  const el = document.getElementById("c-round");
  if (el) el.textContent = `Pokušaj: ${Math.min(cTry,C_MAX)}/${C_MAX} • Poeni: ${cScore}`;
}

/**********************
 * 8) IGRA 2: BROJEVI
 **********************/
const NUM_WORDS = {1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",10:"ten"};
let nTry = 0, nScore = 0, nAnswer = 0, nUsed = new Set();
const N_MAX = 5;

function startNumbers(){
  nTry = 0; nScore = 0; nUsed.clear();
  const r = document.getElementById("n-result"); if (r) r.textContent="";
  nextNumberTry();
}
function nextNumberTry(){
  nTry++;
  updateNumberHeader();
  if (nTry > N_MAX){
    endMessage("n-task", nScore, N_MAX);
    const b = document.getElementById("numbersBoard"); if (b) b.innerHTML = "";
    return;
  }
  const all = [1,2,3,4,5,6,7,8,9,10];
  let available = all.filter(x => !nUsed.has(x));
  if (!available.length) { nUsed.clear(); available = all.slice(); }
  const answer = available[Math.floor(Math.random()*available.length)];
  nUsed.add(answer);
  nAnswer = answer;

  const others = all.filter(x => x !== answer).sort(()=>Math.random()-0.5).slice(0,5);
  const pool = [answer, ...others].sort(()=>Math.random()-0.5);

  const task = document.getElementById("n-task");
  if (task) task.innerHTML = `Pokušaj: <b>${nTry}/${N_MAX}</b> • Klikni na broj: <b>${nAnswer}</b>`;

  const board = document.getElementById("numbersBoard");
  if (!board) return;
  board.innerHTML = "";
  pool.forEach(num => {
    const card = document.createElement("div");
    card.className = "word-card";
    card.textContent = NUM_WORDS[num];
    card.title = String(num);
    card.addEventListener("click", () => {
      if (num === nAnswer){ nScore++; setResult("n-result","Tačno! ✅",true); soundOk(); }
      else { setResult("n-result","Nije taj broj. ❌",false); soundErr(); }
      setTimeout(nextNumberTry, 650);
    });
    board.appendChild(card);
  });
}
function updateNumberHeader(){
  const el = document.getElementById("n-round");
  if (el) el.textContent = `Pokušaj: ${Math.min(nTry,N_MAX)}/${N_MAX} • Poeni: ${nScore}`;
}


/**********************
 * 9) IGRA 3: ŽIVOTINJE
 **********************/
// Ako u src-ovima nema "name", izdvoji iz fajl imena:
function nameFromSrc(src){
  const m = (src||"").match(/([a-z]+)\.png$/i);
  return m ? m[1].toLowerCase() : "";
}
const ANIMAL_IMAGES = [
  {src:"animals/cat.png"},
  {src:"animals/dog.png"},
  {src:"animals/rabbit.png"},
  {src:"animals/bird.png"},
  {src:"animals/horse.png"},
  {src:"animals/fish.png"},
  {src:"animals/lion.png"},
  {src:"animals/tiger.png"},
  {src:"animals/duck.png"},
  {src:"animals/monkey.png"}
].map(o => ({...o, name: o.name || nameFromSrc(o.src)}));

let aTry = 0, aScore = 0, aAnswer = "", aUsed = new Set();
const A_MAX = 5;

function sayAnimal(){ if (aAnswer) sayEN(aAnswer); }

function startAnimals(){
  aTry = 0; aScore = 0; aUsed.clear();
  const r = document.getElementById("a-result"); if (r) r.textContent="";
  nextAnimalTry();
}
function nextAnimalTry(){
  aTry++;
  updateAnimalHeader();
  if (aTry > A_MAX){
    endMessage("a-task", aScore, A_MAX);
    const b = document.getElementById("animalsBoard"); if (b) b.innerHTML = "";
    return;
  }
  let available = ANIMAL_IMAGES.filter(x => !aUsed.has(x.name));
  if (!available.length){ aUsed.clear(); available = ANIMAL_IMAGES.slice(); }
  const answer = available[Math.floor(Math.random()*available.length)];
  aUsed.add(answer.name);
  aAnswer = answer.name;

  const others = ANIMAL_IMAGES.filter(x => x.name !== aAnswer).sort(()=>Math.random()-0.5).slice(0,5);
  const pool = [answer, ...others].sort(()=>Math.random()-0.5);

  const task = document.getElementById("a-task");
  if (task) task.innerHTML = `Pokušaj: <b>${aTry}/${A_MAX}</b> • Slušaj i klikni na tačnu sliku.`;

  sayAnimal();

  const board = document.getElementById("animalsBoard");
  if (!board) return;
  board.innerHTML = "";
  pool.forEach(item => {
    const card = document.createElement("div");
    card.className = "animal-card";
    const img = document.createElement("img");
    img.src = item.src; img.alt = item.name; img.loading = "eager";
    const cap = document.createElement("div");
    cap.className = "caption"; cap.textContent = item.name;
    card.appendChild(img); card.appendChild(cap);
    card.addEventListener("click", () => {
      if (item.name === aAnswer){ aScore++; setResult("a-result","Bravo! ✅",true); soundOk(); }
      else { setResult("a-result","Pokušaj ponovo. ❌",false); soundErr(); }
      setTimeout(nextAnimalTry, 650);
    });
    board.appendChild(card);
  });
}
function updateAnimalHeader(){
  const el = document.getElementById("a-round");
  if (el) el.textContent = `Pokušaj: ${Math.min(aTry,A_MAX)}/${A_MAX} • Poeni: ${aScore}`;
}
function updateAnimalHeader(){
  const el = document.getElementById("a-round");
  if (el) el.textContent = `Pokušaj: ${Math.min(aTry,A_MAX)}/${A_MAX} • Poeni: ${aScore}`;
}

/**********************
 * 10) IGRA 4: SLOVA
 **********************/
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let lTry = 0, lScore = 0, lAnswer = "", lUsed = new Set();
const L_MAX = 5;

function sayLetter(){ if (lAnswer) sayEN(lAnswer); }

function startLetters(){
  lTry = 0; lScore = 0; lUsed.clear();
  const r = document.getElementById("l-result"); if (r) r.textContent="";
  nextLetterTry();
}
function nextLetterTry(){
  lTry++;
  updateLetterHeader();
  if (lTry > L_MAX){
    endMessage("l-task", lScore, L_MAX);
    const b = document.getElementById("lettersBoard"); if (b) b.innerHTML = "";
    return;
  }
  let available = LETTERS.filter(ch => !lUsed.has(ch));
  if (!available.length){ lUsed.clear(); available = LETTERS.slice(); }
  const answer = available[Math.floor(Math.random()*available.length)];
  lUsed.add(answer);
  lAnswer = answer;

  const others = LETTERS.filter(ch => ch !== answer).sort(()=>Math.random()-0.5).slice(0,11);
  const pool = [answer, ...others].sort(()=>Math.random()-0.5);

  const task = document.getElementById("l-task");
  if (task) task.innerHTML = `Pokušaj: <b>${lTry}/${L_MAX}</b> • Slušaj i klikni na slovo:`;
  sayLetter();

  const board = document.getElementById("lettersBoard");
  if (!board) return;
  board.innerHTML = "";
  pool.forEach(ch => {
    const card = document.createElement("div");
    card.className = "letter-card";
    card.textContent = ch;
    card.addEventListener("click", () => {
      if (ch === lAnswer){ lScore++; setResult("l-result","Tačno! ✅",true); soundOk(); }
      else { setResult("l-result","Pokušaj ponovo. ❌",false); soundErr(); }
      setTimeout(nextLetterTry, 650);
    });
    board.appendChild(card);
  });
}
function updateLetterHeader(){
  const el = document.getElementById("l-round");
  if (el) el.textContent = `Pokušaj: ${Math.min(lTry,L_MAX)}/${L_MAX} • Poeni: ${lScore}`;
}

/**********************
 * 11) MEMORY
 **********************/
(function(){
  const board   = document.getElementById('memoryBoard');
  const info    = document.getElementById('m-info');
  const result  = document.getElementById('m-result');
  const startBtn= document.getElementById('m-start');
  if(!board || !startBtn) return;

  const symbols = ['🔴','🔵','🟢','🟡','🟣','🟠'];
  let first=null, second=null, lock=false, pairs=0, moves=0;

  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr; }

  function renderNew(){
    board.innerHTML = '';
    result.textContent = '';
    pairs=0; moves=0; updateInfo();
    const deck = shuffle([...symbols, ...symbols]);
    deck.forEach((sym)=>{
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.key = sym;
      card.innerHTML = `
        <div class="inner">
          <div class="mc-front"></div>
          <div class="mc-back">${sym}</div>
        </div>`;
      card.addEventListener('click', ()=>onFlip(card));
      board.appendChild(card);
    });
    first=second=null; lock=false;
  }
  function updateInfo(){ if (info) info.textContent = `Potezi: ${moves} • Parovi: ${pairs}/6`; }
  function onFlip(card){
    if(lock) return;
    if(card.classList.contains('flipped')) return;
    card.classList.add('flipped');
    if(!first){ first=card; return; }
    second = card; lock=true; moves++; updateInfo();
    if(first.dataset.key === second.dataset.key){
      pairs++; lock=false; first=null; second=null; updateInfo();
      if(pairs===6){ result.className='result ok'; result.textContent='🎉 Bravo! Sve parove si spojio/la!'; }
    }else{
      setTimeout(()=>{ first.classList.remove('flipped'); second.classList.remove('flipped'); first=null; second=null; lock=false; }, 700);
    }
  }
  startBtn.addEventListener('click', renderNew);
})();



/**********************
 * 12b) PUZZLE (složi reč)
 **********************/
(function(){
  // Reči za slaganje – slobodno menjaj/dodaj
  const words = ['cat','dog','fish','horse','rabbit','red','blue','green','yellow','ten','three'];

  // Hookovi – moraju postojati u games.html (section #game-puzzle)
  const tiles  = document.getElementById('p-tiles');
  const box    = document.getElementById('p-answer');
  const task   = document.getElementById('p-task');
  const btnNew = document.getElementById('p-start');
  const btnChk = document.getElementById('p-check');
  const btnBk  = document.getElementById('p-backspace');
  const result = document.getElementById('p-result');

  if(!tiles || !btnNew) return; // ako panel nije na ovoj stranici, izađi tiho

  let current = '';
  let built   = [];

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function newWord(){
    result.textContent = '';
    built = [];
    box.innerHTML = '';

    const w = words[Math.floor(Math.random()*words.length)];
    current = w;

    // prikaži broj slova kao _ _ _
    task.textContent = `Reč: ${'_ '.repeat(w.length).trim()}`;

    // napravi razbacane pločice
    const letters = shuffle(w.toUpperCase().split(''));
    tiles.innerHTML = '';
    letters.forEach((ch, idx)=>{
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'tile';
      t.textContent = ch;
      t.dataset.index = idx;
      t.addEventListener('click', ()=>pickLetter(t, ch));
      tiles.appendChild(t);
    });
  }

  function pickLetter(btn, ch){
    if(btn.disabled) return;
    btn.disabled = true;
    btn.style.opacity = .5;

    built.push(ch);

    const span = document.createElement('span');
    span.className = 'answer-letter';
    span.textContent = ch;
    span.dataset.index = btn.dataset.index;
    box.appendChild(span);
  }

  function backspace(){
    if(!built.length) return;
    const last = box.querySelector('.answer-letter:last-child');
    const idx  = last?.dataset.index;
    if(idx !== undefined){
      const tile = tiles.querySelector(`.tile[data-index="${idx}"]`);
      if(tile){ tile.disabled = false; tile.style.opacity = 1; }
    }
    built.pop();
    last?.remove();
  }

  function check(){
    const got = built.join('').toLowerCase();
    if(!current) return;
    if(got === current){
      result.className = 'result ok';
      result.textContent = '🎉 Tačno!';
    }else{
      result.className = 'result err';
      result.textContent = `Nije tačno. Pokušaj ponovo. (Traženo: ${current.toUpperCase()})`;
    }
  }

  btnNew.addEventListener('click', newWord);
  btnChk.addEventListener('click', check);
  btnBk.addEventListener('click', backspace);

  // Ako želiš da odmah prikaže reč kada otvoriš panel, otkomentariši:
  // newWord();
})();


/**********************
 * 13) TESTOVI ZNANJA — STABILNA (jedna verzija!)
 **********************/
document.addEventListener('DOMContentLoaded', function () {
  var root = document.querySelector('.tests-layout');
  if (!root) return;

  var QUIZZES = {
    animals: {
      title: "🐾 Test — Životinje",
      items: [
        { q: "Koja je ovo životinja?", image: "animals/cat.png",    type: "text",  answers: ["cat","dog","rabbit","horse"],  correct: 0 },
        { q: "Koja je ovo životinja?", image: "animals/dog.png",    type: "text",  answers: ["lion","monkey","dog","fish"],  correct: 2 },
        { q: "Koja je ovo životinja?", image: "animals/rabbit.png", type: "text",  answers: ["rabbit","tiger","bear","horse"], correct: 0 },
        { q: "Koja je ovo životinja?", image: "animals/fish.png",   type: "text",  answers: ["cat","fish","bird","monkey"],  correct: 1 },
        { q: "Koja je ovo životinja?", image: "animals/lion.png",   type: "text",  answers: ["lion","tiger","bear","dog"],    correct: 0 }
      ]
    },
    letters: { // audio red iznad opcija
      title: "🔤 Test — Slova",
      items: [
        { q: "Koje je ovo slovo?", image: "letters/letter-a.png", type: "audioLetters", answers: ["A","B","C","D"], correct: 0 },
        { q: "Koje je ovo slovo?", image: "letters/letter-m.png", type: "audioLetters", answers: ["N","M","W","H"], correct: 1 },
        { q: "Koje je ovo slovo?", image: "letters/letter-e.png", type: "audioLetters", answers: ["F","E","A","B"], correct: 1 },
        { q: "Koje je ovo slovo?", image: "letters/letter-s.png", type: "audioLetters", answers: ["S","Z","X","Q"], correct: 0 },
        { q: "Koje je ovo slovo?", image: "letters/letter-t.png", type: "audioLetters", answers: ["L","J","T","I"], correct: 2 }
      ]
    },
    numbers: {
      title: "🔢 Test — Brojevi",
      items: [
        { q: "Koji je broj?", image: "numbers/number3.png",  type: "text", answers: ["two","three","five","eight"], correct: 1 },
        { q: "Koji je broj?", image: "numbers/number7.png",  type: "text", answers: ["nine","seven","one","six"],   correct: 1 },
        { q: "Koji je broj?", image: "numbers/number10.png", type: "text", answers: ["ten","five","three","two"],   correct: 0 },
        { q: "Koji je broj?", image: "numbers/number4.png",  type: "text", answers: ["eight","six","four","one"],   correct: 2 },
        { q: "Koji je broj?", image: "numbers/number1.png",  type: "text", answers: ["three","two","one","ten"],    correct: 2 }
      ]
    },
    colors: {
      title: "🎨 Test — Boje",
      items: [
        { q: "Koja je ovo boja?", color: "red",    type: "text", answers: ["Red","Blue","Green","Yellow"], correct: 0 },
        { q: "Koja je ovo boja?", color: "green",  type: "text", answers: ["Purple","Green","Orange","Black"], correct: 1 },
        { q: "Koja je ovo boja?", color: "yellow", type: "text", answers: ["Yellow","Pink","Brown","Grey"], correct: 0 },
        { q: "Koja je ovo boja?", color: "blue",   type: "text", answers: ["Blue","Red","Orange","White"], correct: 0 },
        { q: "Koja je ovo boja?", color: "pink",   type: "text", answers: ["Brown","Pink","Black","Green"], correct: 1 }
      ]
    }
  };

  // UI
  var elIntro   = document.getElementById("testsIntro");
  var elPanel   = document.getElementById("quizPanel");
  var elTitle   = document.getElementById("quizTitle");
  var elQ       = document.getElementById("quizQuestion");
  var elImgWrap = document.querySelector(".quiz-image-wrap");
  var elImg     = document.getElementById("quizImage");
  var elOpts    = document.getElementById("quizOptions");
  var elFb      = document.getElementById("quizFeedback");
  var elProg    = document.getElementById("quizProgress");
  var btnNext   = document.getElementById("nextQuestion");
  var btnRetry  = document.getElementById("retryQuiz");
  var btnBack   = document.getElementById("backToMenu");

  if (!elIntro || !elPanel || !elTitle || !elQ || !elImgWrap || !elImg || !elOpts || !elFb || !elProg || !btnNext || !btnRetry || !btnBack) return;

  // STATE
  var currentKey = null, questions = [], index = 0, score = 0, answered = false, audioRow = null;

  // Sidebar
  [].forEach.call(document.querySelectorAll("[data-quiz]"), function(btn){
    btn.addEventListener("click", function(){
      startQuiz(btn.dataset.quiz);
      elPanel.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });

  btnBack.addEventListener("click", function(){
    elPanel.classList.add("hidden");
    elIntro.classList.remove("hidden");
    elIntro.style.display = "block";
  });
  btnNext.addEventListener("click", nextQuestion);
  btnRetry.addEventListener("click", function(){ if (currentKey) startQuiz(currentKey); });

  // TTS
  function speakEN(text){
    try{
      var u = new SpeechSynthesisUtterance(text);
      var voices = speechSynthesis.getVoices();
      var gbF=null, gb=null;
      for (var k=0;k<voices.length;k++){
        var v = voices[k];
        if (v.lang === "en-GB"){
          if (!gb) gb = v;
          if (v.name && v.name.toLowerCase().indexOf("female") !== -1){ gbF=v; break; }
        }
      }
      if (gbF) u.voice = gbF; else if (gb) u.voice = gb; else u.lang = "en-GB";
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  }
  try { speechSynthesis.onvoiceschanged = function(){}; } catch(e){}

  function ensureColorBox(){
    var box = elImgWrap.querySelector(".color-box-vis");
    if (!box){
      box = document.createElement("div");
      box.className = "color-box-vis";
      box.style.width = "180px";
      box.style.height = "180px";
      box.style.border = "3px solid #ff80ab";
      box.style.borderRadius = "20px";
      box.style.boxShadow = "0 4px 12px rgba(0,0,0,.12)";
      elImgWrap.appendChild(box);
    }
    return box;
  }
  function ensureSpeakBtn(){
    var b = elImgWrap.querySelector(".speak-btn");
    if (!b){
      b = document.createElement("button");
      b.type = "button";
      b.className = "btn speak-btn";
      b.textContent = "🔈 Pusti izgovor";
      b.style.marginLeft = "12px";
      elImgWrap.appendChild(b);
    }
    return b;
  }
  function clearAudioRow(){
    if (audioRow && audioRow.parentNode){ audioRow.parentNode.removeChild(audioRow); }
    audioRow = null;
  }

  function startQuiz(key){
    var pack = QUIZZES[key];
    if (!pack) return;
    currentKey = key;
    questions = pack.items.slice();
    index = 0; score = 0; answered = false;

    elIntro.classList.add("hidden");
    elPanel.classList.remove("hidden");
    elPanel.style.display = "block";

    elTitle.textContent = pack.title;
    renderQuestion();
  }

  function renderQuestion(){
    var item = questions[index];
    if (!item){ showFinal(); return; }

    answered = false;
    elFb.textContent = ""; elFb.className = "quiz-feedback";
    elProg.textContent = "Pitanje " + (index+1) + "/" + questions.length + " • Poeni: " + score;
    elQ.textContent = item.q || "";

    elImgWrap.style.display = "flex";
    elImgWrap.style.alignItems = "center";
    elImgWrap.style.justifyContent = "center";
    elImgWrap.style.gap = "12px";

    if (currentKey === "colors"){
      elImg.style.display = "none";
      var box = ensureColorBox();
      box.style.display = "block";
      box.style.background = item.color || "transparent";
    } else {
      var cbox = elImgWrap.querySelector(".color-box-vis");
      if (cbox) cbox.style.display = "none";
      elImg.src = item.image || "";
      elImg.alt = "Question";
      elImg.style.display = "block";
      elImg.style.width = "200px";
      elImg.style.height = "200px";
      elImg.style.objectFit = "contain";
    }

    // “Pusti izgovor” dugme koristi se za generična audio pitanja (ovde ga krijemo).
    var speakBtn = ensureSpeakBtn();
    speakBtn.style.display = "none";
    speakBtn.onclick = null;

    // Audio red za SLOVA
    clearAudioRow();
    if (item.type === "audioLetters"){
      audioRow = document.createElement("div");
      audioRow.style.display = "flex";
      audioRow.style.flexWrap = "wrap";
      audioRow.style.gap = "10px";
      audioRow.style.justifyContent = "center";
      audioRow.style.margin = "10px 0 4px";

      for (var i=0; i<item.answers.length; i++){
        (function(idx){
          var ab = document.createElement("button");
          ab.type = "button";
          ab.className = "btn";
          ab.textContent = "🔈 Opcija " + (idx+1);
          ab.addEventListener("click", function(){ speakEN(item.answers[idx]); });
          audioRow.appendChild(ab);
        })(i);
      }
      elOpts.parentNode.insertBefore(audioRow, elOpts);
    }

    // Opcije — 2 kolone
    elOpts.innerHTML = "";
    elOpts.style.display = "grid";
    elOpts.style.gridTemplateColumns = "repeat(2, minmax(220px, 1fr))";
    elOpts.style.gap = "12px";
    elOpts.style.justifyItems = "center";

    for (var a=0; a<item.answers.length; a++){
      (function(idx){
        var b = document.createElement("button");
        b.type = "button";
        b.className = "quiz-opt";
        b.textContent = (item.type === "audioLetters") ? ("Opcija " + (idx+1)) : item.answers[idx];
        b.style.minWidth = "220px";
        b.style.padding = "12px 14px";
        b.style.borderRadius = "12px";
        b.style.border = "2px solid #ff80ab";
        b.style.background = "#fff";
        b.style.fontWeight = "bold";
        b.style.cursor = "pointer";
        b.style.boxShadow = "0 4px 10px rgba(0,0,0,.08)";
        b.addEventListener("click", function(){ onAnswer(idx); });
        elOpts.appendChild(b);
      })(a);
    }

    btnNext.disabled = true;
    btnRetry.classList.add("hidden");
  }

  function onAnswer(choice){
    if (answered) return;
    answered = true;

    var item = questions[index];
    var btns = elOpts.querySelectorAll("button");
    for (var k=0; k<btns.length; k++){
      var b = btns[k];
      b.disabled = true;
      if (k === item.correct){ b.style.background = "#eafbe7"; b.style.borderColor = "#5dbb63"; }
      if (k === choice && k !== item.correct){ b.style.background = "#fde2e2"; b.style.borderColor = "#e57373"; }
    }

    if (choice === item.correct){
      score++;
      elFb.textContent = "✅ Tačno!";
      elFb.className = "quiz-feedback ok";
    } else {
      var shown = (item.type === "audioLetters") ? ("Opcija " + (item.correct+1)) : item.answers[item.correct];
      elFb.textContent = "❌ Netačno. Tačno: " + shown;
      elFb.className = "quiz-feedback err";
    }

    btnNext.disabled = false;
    elProg.textContent = "Pitanje " + (index+1) + "/" + questions.length + " • Poeni: " + score;
  }

  function nextQuestion(){
    if (!answered) return;
    index++;
    if (index >= questions.length) showFinal();
    else renderQuestion();
  }

  function showFinal(){
    elQ.textContent = "🎯 Rezultat: " + score + "/" + questions.length;
    var cbox = elImgWrap.querySelector(".color-box-vis");
    if (cbox) cbox.style.display = "none";
    elImg.style.display = "none";
    var sp = elImgWrap.querySelector(".speak-btn");
    if (sp) sp.style.display = "none";
    clearAudioRow();
    elOpts.innerHTML = "";
    elFb.textContent = "";
    btnNext.disabled = true;
    btnRetry.classList.remove("hidden");
  }
});
