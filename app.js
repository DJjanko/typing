// Typing Practice – Slovene/Croatian QWERTZ
// Training mode (ON): wrong letters don't move forward.
// Racer mode (Training OFF): word-by-word, TypeRacer-like.

(() => {
  'use strict';

  // ========= DATA =========
  const TEXTS = {
    sl: [
      "Danes vadim pisanje na tipkovnici. Počasi in natančno — brez hitenja!",
      "Č, š in ž so del slovenskega jezika. Vadi jih v stavkih in besedah.",
      "Vsaka črka šteje. Najprej pravilnost, potem hitrost.",
      "Ko tipkaš, poglej naprej v besedilo in ohrani ritem."
    ],
    en: [
      "Practice typing with steady rhythm. Accuracy first, speed later.",
      "Keep your hands relaxed and your eyes on the next characters.",
      "Small progress every day becomes big progress over time.",
      "Type the text exactly as shown, including punctuation and spaces."
    ]
  };

  const KEYBOARD = [
    [
      { k: 'Escape', l: 'Esc', w: 1.1 },
      { k: '1', l: '1' }, { k: '2', l: '2' }, { k: '3', l: '3' }, { k: '4', l: '4' }, { k: '5', l: '5' },
      { k: '6', l: '6' }, { k: '7', l: '7' }, { k: '8', l: '8' }, { k: '9', l: '9' }, { k: '0', l: '0' },
      { k: '-', l: '-' }, { k: '=', l: '=' },
      { k: 'Backspace', l: '⌫', w: 2.0 }
    ],
    [
      { k: 'Tab', l: 'Tab', w: 1.5 },
      { k: 'q', l: 'Q' }, { k: 'w', l: 'W' }, { k: 'e', l: 'E' }, { k: 'r', l: 'R' }, { k: 't', l: 'T' },
      { k: 'z', l: 'Z' }, { k: 'u', l: 'U' }, { k: 'i', l: 'I' }, { k: 'o', l: 'O' }, { k: 'p', l: 'P' },
      { k: 'š', l: 'Š' }, { k: 'đ', l: 'Đ' },
      { k: 'Enter', l: '⏎', w: 1.7 }
    ],
    [
      { k: 'CapsLock', l: 'Caps', w: 1.8 },
      { k: 'a', l: 'A' }, { k: 's', l: 'S' }, { k: 'd', l: 'D' }, { k: 'f', l: 'F' }, { k: 'g', l: 'G' },
      { k: 'h', l: 'H' }, { k: 'j', l: 'J' }, { k: 'k', l: 'K' }, { k: 'l', l: 'L' },
      { k: 'č', l: 'Č' }, { k: 'ć', l: 'Ć' }, { k: 'ž', l: 'Ž' },
      { k: "'", l: "'", w: 1.0 }
    ],
    [
      { k: 'Shift', l: 'Shift', w: 2.2 },
      { k: 'y', l: 'Y' }, { k: 'x', l: 'X' }, { k: 'c', l: 'C' }, { k: 'v', l: 'V' }, { k: 'b', l: 'B' },
      { k: 'n', l: 'N' }, { k: 'm', l: 'M' }, { k: ',', l: ',' }, { k: '.', l: '.' }, { k: '/', l: '/' },
      { k: 'Shift', l: 'Shift', w: 2.3 }
    ],
    [
      { k: 'Control', l: 'Ctrl', w: 1.4 },
      { k: 'Alt', l: 'Alt', w: 1.2 },
      { k: 'Space', l: 'Space', w: 6.8 },
      { k: 'AltGraph', l: 'AltGr', w: 1.3 },
      { k: 'Control', l: 'Ctrl', w: 1.4 }
    ]
  ];

  // ========= DOM =========
  const elTextWrap = document.getElementById('textWrap');
  const elTextInner = document.getElementById('textInner');
  const elNextChar = document.getElementById('nextChar');
  const elProgress = document.getElementById('progress');
  const elOk = document.getElementById('ok');
  const elBad = document.getElementById('bad');
  const elTimeLeft = document.getElementById('timeLeft');
  const elStatus = document.getElementById('status');
  const elKeyboard = document.getElementById('keyboard');

  const elLang = document.getElementById('lang');
  const elSource = document.getElementById('source');
  const elTopic = document.getElementById('topic');
  const elTextLen = document.getElementById('textLen');
  const elStyle = document.getElementById('style');
  const elCodeLang = document.getElementById('codeLang');
  const elCodeLevel = document.getElementById('codeLevel');

  const elTrainingWrap = document.getElementById('trainingWrap');
  const elTrainingToggle = document.getElementById('trainingToggle');
  const elKeyboardToggle = document.getElementById('keyboardToggle');
  const elFingerOverlay = document.getElementById('fingerOverlay');
  const elSideGlowL = document.getElementById('sideGlowL');
  const elSideGlowR = document.getElementById('sideGlowR');
  const elKbdArea = document.getElementById('kbdArea');

  const elRacerRow = document.getElementById('racerRow');
  const elRacerInput = document.getElementById('racerInput');

  // Finish stats UI
  const elKbdLegend = document.getElementById('kbdLegend');
  const elKbdLegendRight = document.getElementById('kbdLegendRight');

  const elFinishModal = document.getElementById('finishModal');
  const elMCpm = document.getElementById('mCpm');
  const elMWpm = document.getElementById('mWpm');
  const elMMiss = document.getElementById('mMiss');
  const elMAcc = document.getElementById('mAcc');
  const elMTime = document.getElementById('mTime');
  const elMMsg = document.getElementById('mMsg');
  const elSpeedChart = document.getElementById('speedChart');

  // ========= STATE =========
  let target = '';
  let spans = []; // per-character spans (1:1 with target chars)
  let wordUnits = []; // [{el, start, len, text}]

  let index = 0; // caret position in target (char index)
  let ok = 0;
  let bad = 0;

  let TAB_VIS = 4;
  let codeMode = false;

  let trainingMode = true; // toggle
  let keyboardVisible = true; // toggle
  let fingerOverlayAnchor = null;
  let textAnchorOffset = 0;
  let waitingForEnter = true;
  let timeLimitMs = 0;
  let timeDeadline = null;
  let timeTimer = null;
  let timeUp = false;

  // Racer mode state
  const racer = {
    wordIdx: 0,
    typed: '',
    states: [], // true/false per typed char
    hasError: false,
    finished: false
  };

  // Timing + finish state
  let startedAt = null;
  let endedAt = null;
  let finishedOnce = false;

  // Speed tracking
  let speedLog = []; // [{t, chars}]

  // Misses counted against expected key
  const missByExpectedKey = new Map();

  const keyEls = new Map();

  // ========= HELPERS =========
  const SETTINGS_COOKIE = 'tp_settings';

  function setCookie(name, value, days){
    const maxAge = Math.max(1, days || 365) * 86400;
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
  }

  function getCookie(name){
    const prefix = `${name}=`;
    const parts = document.cookie ? document.cookie.split('; ') : [];
    for (const part of parts){
      if (part.startsWith(prefix)) return decodeURIComponent(part.slice(prefix.length));
    }
    return '';
  }

  function loadSettings(){
    const raw = getCookie(SETTINGS_COOKIE);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function saveSettings(){
    const data = {
      lang: elLang?.value || 'sl',
      source: elSource?.value || 'wiki',
      topic: elTopic?.value || '',
      textLen: elTextLen?.value || 'short',
      style: elStyle?.value || 'plain',
      codeLang: elCodeLang?.value || 'javascript',
      codeLevel: elCodeLevel?.value || 'easy',
      training: !!elTrainingToggle?.checked,
      keyboard: !!elKeyboardToggle?.checked
    };
    setCookie(SETTINGS_COOKIE, JSON.stringify(data), 365);
  }

  function calcTimeLimitMs(){
    const v = elTextLen?.value || 'short';
    if (v === 'medium') return 7 * 60 * 1000;
    if (v === 'long') return 10 * 60 * 1000;
    return 5 * 60 * 1000;
  }

  function formatTimeLeft(ms){
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateTimeLeftDisplay(ms){
    if (!elTimeLeft) return;
    elTimeLeft.textContent = formatTimeLeft(ms);
  }

  function clearTimeLimit(){
    if (timeTimer){
      clearInterval(timeTimer);
      timeTimer = null;
    }
    timeDeadline = null;
  }

  function startTimeLimit(){
    clearTimeLimit();
    timeLimitMs = timeLimitMs || calcTimeLimitMs();
    timeDeadline = performance.now() + timeLimitMs;
    timeTimer = setInterval(tickTimeLimit, 250);
    tickTimeLimit();
  }

  function tickTimeLimit(){
    if (timeDeadline === null) return;
    const remaining = timeDeadline - performance.now();
    if (remaining <= 0){
      updateTimeLeftDisplay(0);
      triggerTimeUp();
      return;
    }
    updateTimeLeftDisplay(remaining);
  }

  function triggerTimeUp(){
    if (timeUp) return;
    timeUp = true;
    clearTimeLimit();
    endedAt = performance.now();
    finishedOnce = true;
    renderHeatmap();
    showFinishModal(computeFinishStats());
    elStatus.textContent = "Time's up. Press Enter for a new text.";
    elNextChar.textContent = '—';
  }

  function queueNewText(){
    waitingForEnter = true;
    timeUp = false;
    clearTimeLimit();
    timeLimitMs = calcTimeLimitMs();
    updateTimeLeftDisplay(timeLimitMs);
    setText('');
    elStatus.textContent = 'Press Enter to load a new text.';
    elNextChar.textContent = '—';
    clearExpected();
  }
  function randInt(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
  }

  function shuffleInPlace(arr){
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickText(lang){
    const arr = TEXTS[lang] ?? TEXTS.en;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function isWhitespaceChar(ch){
    return ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r' || ch === '\f' || ch === '\v';
  }

  function cleanSentence(str){
    if (!str) return '';
    return String(str)
      .replace(/\s+/g, ' ')
      .replace(/\[[^\]]*]/g, '')
      .replace(/\s*\([^)]*\)/g, '')
      .trim();
  }

  function splitIntoSentences(text){
    const t = cleanSentence(text);
    if (!t) return [];
    // Simple sentence split; good enough for wiki extracts.
    const parts = t.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    return parts.map(s => s.trim()).filter(Boolean);
  }

  function pickNiceSentence(text){
    const candidates = splitIntoSentences(text);
    if (!candidates.length) return '';

    let best =
      candidates.find(s => s.length >= 45 && s.length <= 170) ||
      candidates.find(s => s.length >= 25 && s.length <= 220) ||
      candidates[0];

    best = best.trim();
    if (best.length > 260){
      best = best.slice(0, 260).replace(/\s+\S*$/, '') + '…';
    }
    return best;
  }

  // ===== Normalization / filtering =====
  const KEEP_SL = new Set(['č','š','ž','đ','ć','Č','Š','Ž','Đ','Ć']);

  // Lightweight folding for comparisons (diacritics/macrons/dash variants)
  function foldForCompare(s){
    if (s === null || s === undefined) return '';
    let out = String(s);
    // Normalize common punctuation variants that often come from Wikipedia
    out = out
      .replace(/[\u2013\u2014\u2212]/g, '-')
      .replace(/[“”„«»]/g, '"')
      .replace(/[‘’‚‹›]/g, "'")
      .replace(/\u2026/g, '...');

    // Fold diacritics/macrons/accents
    out = out.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

    // Special cases that don't decompose as users expect
    out = out
      .replace(/ß/g, 'ss')
      .replace(/Æ/g, 'AE').replace(/æ/g, 'ae')
      .replace(/Œ/g, 'OE').replace(/œ/g, 'oe')
      .replace(/Ø/g, 'O').replace(/ø/g, 'o');

    return out;
  }

  function normalizePracticeText(raw, { isCode } = { isCode:false }){
    let s = String(raw ?? '');

    // Remove invisible junk
    s = s
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\u00AD/g, '')
      .replace(/[\u202A-\u202E\u2066-\u2069]/g, '');

    // Normalize dashes
    s = s.replace(/[\u2013\u2014\u2212]/g, '-');

    // Quotes
    s = s
      .replace(/[“”„«»]/g, '"')
      .replace(/[‘’‚‹›]/g, "'");

    // Ellipsis
    s = s.replace(/\u2026/g, '...');

    if (isCode){
      return s;
    }

    // Preserve Slovene/Croatian letters through diacritics folding
    const placeholders = new Map();
    let pi = 0;
    for (const ch of KEEP_SL){
      const token = `__KEEP_${pi++}__`;
      placeholders.set(token, ch);
      s = s.split(ch).join(token);
    }

    // Fold common diacritics (for "a with dots" etc.)
    // Use NFKD remove combining marks.
    s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

    // Special cases
    s = s
      .replace(/ß/g, 'ss')
      .replace(/Æ/g, 'AE').replace(/æ/g, 'ae')
      .replace(/Œ/g, 'OE').replace(/œ/g, 'oe')
      .replace(/Ø/g, 'O').replace(/ø/g, 'o');

    // Restore keep letters
    for (const [token, ch] of placeholders.entries()){
      s = s.split(token).join(ch);
    }

    // Filter to printable ASCII + HR/SL letters + whitespace/newlines
    let out = '';
    for (const ch of s){
      const code = ch.codePointAt(0);
      const isAllowedHrsl = KEEP_SL.has(ch);
      const isAllowedWs = (ch === '\n' || ch === '\t' || ch === ' ');
      const isAllowedAscii = (code >= 32 && code <= 126);
      if (isAllowedHrsl || isAllowedWs || isAllowedAscii) out += ch;
    }

    // Collapse weird spacing a bit (but keep newlines)
    out = out
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/ *\n */g, '\n');

    return out.trim();
  }

  // ========= OVERLAY (hands + left/right glow + key dots) =========
  const kbdDots = new Map();
  let handL = null, handR = null, glowL = null, glowR = null;

  function initFingerOverlay(){
    kbdDots.clear();
    document.querySelectorAll('.kbdDot[data-key], .kbdBar[data-key]').forEach(el => {
      const k = el.getAttribute('data-key');
      if (k) kbdDots.set(k, el);
    });
    handL = document.getElementById('handL');
    handR = document.getElementById('handR');
    glowL = document.getElementById('sideGlowL');
    glowR = document.getElementById('sideGlowR');
  }

  function setActiveKeyDot(key){
    kbdDots.forEach(el => el.classList.remove('active'));
    const el = kbdDots.get(key);
    if (el) el.classList.add('active');
  }

  function setActiveHand(which){
    if (handL) handL.classList.remove('active');
    if (handR) handR.classList.remove('active');
    if (glowL) glowL.classList.remove('active');
    if (glowR) glowR.classList.remove('active');

    if (which === 'L'){
      if (handL) handL.classList.add('active');
      if (glowL) glowL.classList.add('active');
    }
    if (which === 'R'){
      if (handR) handR.classList.add('active');
      if (glowR) glowR.classList.add('active');
    }
    if (which === 'B'){
      if (handL) handL.classList.add('active');
      if (handR) handR.classList.add('active');
      if (glowL) glowL.classList.add('active');
      if (glowR) glowR.classList.add('active');
    }
  }

  // Touch-typing approximation for HR/SL QWERTZ
  const LP = new Set(['q','a','y','1']);
  const LR = new Set(['w','s','x','2']);
  const LM = new Set(['e','d','c','3']);
  const LI = new Set(['r','t','f','g','v','b','4','5']);
  const RI = new Set(['z','u','h','j','n','m','6','7']);
  const RM = new Set(['i','k',',','8']);
  const RR = new Set(['o','l','.','9']);
  const RP = new Set(['p','š','đ','č','ć','ž','/','0','-','=']);

  function isUppercaseLetter(ch){
    return ch && ch.toLowerCase() !== ch && ch.toUpperCase() === ch;
  }

  function updateFingerOverlayForKey(keyId, ch){
    if (!keyId) {
      setActiveKeyDot('');
      setActiveHand('');
      return;
    }

    const k = String(keyId).toLowerCase();
    const dotKey = (k === 'space') ? 'space' : k;
    setActiveKeyDot(dotKey);

    let hand = '';
    if (k === 'space') hand = 'B';
    else if (LP.has(k) || LR.has(k) || LM.has(k) || LI.has(k)) hand = 'L';
    else if (RI.has(k) || RM.has(k) || RR.has(k) || RP.has(k)) hand = 'R';
    setActiveHand(hand);

    if (isUppercaseLetter(ch) && hand) setActiveHand('B');
  }

  // ========= KEYBOARD UI =========
  function buildKeyboard(){
    elKeyboard.innerHTML = '';
    keyEls.clear();

    for (const row of KEYBOARD){
      const rowEl = document.createElement('div');
      rowEl.className = 'row';

      for (const key of row){
        const kEl = document.createElement('div');
        kEl.className = 'key';
        kEl.style.setProperty('--w', key.w ?? 1);
        kEl.dataset.k = key.k;

        const label = document.createElement('span');
        label.textContent = key.l;
        kEl.appendChild(label);

        if (key.k === 'Backspace') {
          const sub = document.createElement('div');
          sub.className = 'sub';
          sub.textContent = 'Backspace';
          kEl.appendChild(sub);
        }
        if (key.k === 'Enter' && key.l === '⏎') {
          const sub = document.createElement('div');
          sub.className = 'sub';
          sub.textContent = 'Enter';
          kEl.appendChild(sub);
        }
        if (key.k === 'Space') {
          const sub = document.createElement('div');
          sub.className = 'sub';
          sub.textContent = '␠';
          kEl.appendChild(sub);
        }

        // Heatmap overlay elements
        const mf = document.createElement('div');
        mf.className = 'missFill';
        kEl.appendChild(mf);

        const mp = document.createElement('div');
        mp.className = 'missPct';
        mp.textContent = '';
        kEl.appendChild(mp);

        rowEl.appendChild(kEl);

        const prev = keyEls.get(key.k);
        if (!prev) keyEls.set(key.k, [kEl]);
        else prev.push(kEl);
      }

      elKeyboard.appendChild(rowEl);
    }
  }

  // ========= SOURCES =========

  // AI backend (Python server)
  const API_BASE = 'http://127.0.0.1:8001';

  async function fetchAiSentence(lang, topic, style){
    const res = await fetch(`${API_BASE}/api/sentence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, topic: topic || '', style: style || 'plain' })
    });

    let data = null;
    try { data = await res.json(); } catch { data = null; }

    if (!res.ok){
      const detail = data?.detail;
      const msg =
        (typeof detail === 'string' && detail) ||
        detail?.message ||
        data?.message ||
        `HTTP ${res.status}`;

      const err = new Error(msg);
      err.status = res.status;
      err.type = detail?.type || data?.type || 'error';
      err.hint = detail?.hint || '';
      throw err;
    }

    return String(data?.text || '');
  }

  // Wikipedia topic deck
  const wikiDeck = {
    lang: '',
    topic: '',
    titles: [],
    pos: 0,
    lastTitle: ''
  };

  async function refillWikiDeck(wikiLang, topic){
    const q = encodeURIComponent(topic.trim());
    const url =
      `https://${wikiLang}.wikipedia.org/w/api.php?origin=*` +
      `&action=query&list=search&format=json&srlimit=30&srsearch=${q}`;

    const res = await fetch(url, { headers: { accept: 'application/json' }});
    if (!res.ok) throw new Error('Wiki search failed: ' + res.status);
    const data = await res.json();
    const hits = data?.query?.search || [];

    const titles = hits.map(h => h?.title).filter(Boolean);
    const uniq = Array.from(new Set(titles));
    shuffleInPlace(uniq);

    wikiDeck.lang = wikiLang;
    wikiDeck.topic = topic.trim();
    wikiDeck.titles = uniq;
    wikiDeck.pos = 0;
    wikiDeck.lastTitle = '';

    if (!wikiDeck.titles.length) throw new Error('No wiki results');
  }

  function nextWikiTitle(wikiLang, topic){
    const t = topic.trim();
    if (wikiDeck.lang !== wikiLang || wikiDeck.topic !== t || !wikiDeck.titles.length || wikiDeck.pos >= wikiDeck.titles.length){
      return null; // caller should refill
    }
    const title = wikiDeck.titles[wikiDeck.pos++];
    wikiDeck.lastTitle = title;
    return title;
  }

  async function fetchWikiExtractPlain(wikiLang, title){
    const url =
      `https://${wikiLang}.wikipedia.org/w/api.php?origin=*` +
      `&action=query&prop=extracts&explaintext=1&exintro=1&format=json&titles=${encodeURIComponent(title)}`;

    const res = await fetch(url, { headers: { accept: 'application/json' }});
    if (!res.ok) throw new Error('Wiki extract failed: ' + res.status);
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];
    return String(page?.extract || '');
  }

  async function fetchWikiRandomExtract(wikiLang){
    const url = `https://${wikiLang}.wikipedia.org/api/rest_v1/page/random/summary`;
    const res = await fetch(url, { headers: { accept: 'application/json' }});
    if (!res.ok) throw new Error('Wiki random failed: ' + res.status);
    const data = await res.json();
    wikiDeck.lastTitle = String(data?.title || 'Wikipedia');
    return String(data?.extract || '');
  }

  async function fetchWikiText(lang, topic, wantedSentences){
    const wikiLang = (lang === 'sl') ? 'sl' : 'en';
    const topicTrim = (topic || '').trim();

    const sentences = [];
    const usedTitles = [];

    // Topic mode: go through a shuffled deck of search results.
    if (topicTrim){
      if (wikiDeck.lang !== wikiLang || wikiDeck.topic !== topicTrim || !wikiDeck.titles.length || wikiDeck.pos >= wikiDeck.titles.length){
        await refillWikiDeck(wikiLang, topicTrim);
      }

      while (sentences.length < wantedSentences){
        let title = nextWikiTitle(wikiLang, topicTrim);
        if (!title){
          await refillWikiDeck(wikiLang, topicTrim);
          title = nextWikiTitle(wikiLang, topicTrim);
        }
        if (!title) break;

        usedTitles.push(title);
        const extract = await fetchWikiExtractPlain(wikiLang, title);
        const pool = splitIntoSentences(extract)
          .map(s => s.trim())
          .filter(s => s.length >= 25 && s.length <= 240);

        if (!pool.length) continue;
        shuffleInPlace(pool);

        while (pool.length && sentences.length < wantedSentences){
          sentences.push(pool.pop());
        }
      }

      const txt = sentences.length
        ? sentences.join(' ')
        : pickNiceSentence(await fetchWikiExtractPlain(wikiLang, usedTitles[0] || title));

      return { text: txt, title: usedTitles[0] || wikiDeck.lastTitle || 'Wikipedia' };
    }

    // Random mode: pull random summaries until enough sentences
    while (sentences.length < wantedSentences){
      const extract = await fetchWikiRandomExtract(wikiLang);
      const pool = splitIntoSentences(extract)
        .map(s => s.trim())
        .filter(s => s.length >= 25 && s.length <= 240);

      if (!pool.length){
        const one = pickNiceSentence(extract);
        if (one) sentences.push(one);
        continue;
      }

      shuffleInPlace(pool);
      while (pool.length && sentences.length < wantedSentences){
        sentences.push(pool.pop());
      }
    }

    return { text: sentences.join(' '), title: wikiDeck.lastTitle || 'Wikipedia' };
  }

  // ========= CODE SNIPPETS =========
  const CODE_SNIPPETS = {
    python: {
      easy: [
`numbers = [2, 4, 6]
total = 0

for n in numbers:
    total += n

print(total)`,
`def greet(name):
    return f"Hello, {name}!"

print(greet("Nina"))`,
`text = "slovenia"
print(text.upper())`
      ],
      medium: [
`def is_even(n):
    return n % 2 == 0

vals = [3, 6, 9, 12]
evens = [v for v in vals if is_even(v)]
print(evens)`,
`from math import pi

r = 3.5
area = pi * r * r
print(round(area, 2))`
      ]
    },

    javascript: {
      easy: [
`const nums = [1, 2, 3];
let sum = 0;

for (const n of nums) {
  sum += n;
}

console.log(sum);`,
`function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

console.log(clamp(12, 0, 10));`
      ],
      medium: [
`const counts = new Map();
const words = "red blue red green".split(" ");

for (const w of words) {
  counts.set(w, (counts.get(w) ?? 0) + 1);
}

console.log(Object.fromEntries(counts));`,
`const arr = [5, 2, 9, 1];
arr.sort((a, b) => a - b);

for (const x of arr) {
  console.log(x);
}`
      ]
    },

    c: {
      easy: [
`#include <stdio.h>

int main(void) {
  int x = 7;
  printf("%d\n", x * x);
  return 0;
}`,
`#include <stdio.h>

int main(void) {
  for (int i = 1; i <= 5; i++) {
    printf("%d ", i);
  }
  printf("\n");
  return 0;
}`
      ],
      medium: [
`#include <stdio.h>

int add(int a, int b) {
  return a + b;
}

int main(void) {
  int s = add(4, 9);
  printf("sum=%d\n", s);
  return 0;
}`,
`#include <stdio.h>
#include <string.h>

int main(void) {
  char s[] = "hello";
  printf("%zu\n", strlen(s));
  return 0;
}`
      ]
    },

    cpp: {
      easy: [
`#include <iostream>

int main() {
  int x = 7;
  std::cout << (x * x) << "\n";
  return 0;
}`,
`#include <iostream>
#include <vector>

int main() {
  std::vector<int> v = {1, 2, 3};
  int sum = 0;

  for (int n : v) sum += n;

  std::cout << sum << "\n";
  return 0;
}`
      ],
      medium: [
`#include <iostream>

int fib(int n) {
  int a = 0, b = 1;
  for (int i = 0; i < n; i++) {
    int t = a + b;
    a = b;
    b = t;
  }
  return a;
}

int main() {
  std::cout << fib(10) << "\n";
  return 0;
}`
      ]
    },

    java: {
      easy: [
`public class Main {
  public static void main(String[] args) {
    int x = 7;
    System.out.println(x * x);
  }
}`,
`public class Main {
  static int add(int a, int b) {
    return a + b;
  }

  public static void main(String[] args) {
    System.out.println(add(4, 9));
  }
}`
      ],
      medium: [
`import java.util.Arrays;

public class Main {
  public static void main(String[] args) {
    int[] a = {5, 2, 9, 1};
    Arrays.sort(a);

    for (int x : a) {
      System.out.println(x);
    }
  }
}`
      ]
    },

    csharp: {
      easy: [
`using System;

class Program {
  static void Main() {
    int x = 7;
    Console.WriteLine(x * x);
  }
}`,
`using System;

class Program {
  static int Add(int a, int b) {
    return a + b;
  }

  static void Main() {
    Console.WriteLine(Add(4, 9));
  }
}`
      ],
      medium: [
`using System;
using System.Linq;

class Program {
  static void Main() {
    int[] a = { 5, 2, 9, 1 };
    var sorted = a.OrderBy(x => x).ToArray();

    foreach (var x in sorted) {
      Console.WriteLine(x);
    }
  }
}`
      ]
    }
  };

  function pickCodeSnippet(lang, level){
    const L = CODE_SNIPPETS[lang] || CODE_SNIPPETS.python;
    const arr = (L[level] && L[level].length) ? L[level] : (L.easy || []);
    return arr[Math.floor(Math.random() * arr.length)] || "print('Hello')";
  }

  // ========= SPEED CHART (finish popup) =========
  function recordSpeedPoint(){
    if (startedAt === null) return;
    const t = (performance.now() - startedAt) / 1000;
    const chars = index;
    const last = speedLog[speedLog.length - 1];
    if (last && last.chars === chars) return;
    speedLog.push({ t, chars });
  }

  function buildRollingWpmSeries(log, windowSec = 5){
    if (!Array.isArray(log) || log.length < 2) return [];
    const pts = [];
    let j = 0;
    for (let i = 0; i < log.length; i++){
      const ti = log[i].t;
      while (j < i && (ti - log[j].t) > windowSec) j++;
      const tj = log[j].t;
      const cj = log[j].chars;
      const dt = Math.max(1, ti - tj);
      const dc = Math.max(0, log[i].chars - cj);
      const wpm = (dc / 5) / (dt / 60);
      pts.push({ t: ti, y: wpm });
    }
    return pts;
  }

  function niceCeil(v){
    const x = Math.max(1, v);
    const p = Math.pow(10, Math.floor(Math.log10(x)));
    const n = x / p;
    const m = (n <= 1) ? 1 : (n <= 2) ? 2 : (n <= 5) ? 5 : 10;
    return m * p;
  }

  function drawSpeedChart(series){
    if (!elSpeedChart) return;
    const ctx = elSpeedChart.getContext('2d');
    if (!ctx) return;

    const cssW = Math.max(260, elSpeedChart.clientWidth || 0);
    const cssH = Math.max(110, elSpeedChart.clientHeight || 0);
    const dpr = window.devicePixelRatio || 1;

    elSpeedChart.width = Math.floor(cssW * dpr);
    elSpeedChart.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (!series || series.length < 2){
      ctx.fillStyle = 'rgba(233,236,255,.65)';
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Not enough data for a chart yet', cssW / 2, cssH / 2);
      return;
    }

    const pad = { l: 36, r: 10, t: 10, b: 22 };
    const plotW = cssW - pad.l - pad.r;
    const plotH = cssH - pad.t - pad.b;

    const xMax = Math.max(1, series[series.length - 1].t);
    let yMaxRaw = 0;
    for (const p of series) yMaxRaw = Math.max(yMaxRaw, p.y || 0);
    const yMax = Math.max(20, niceCeil(yMaxRaw));

    const xScale = (t) => pad.l + (t / xMax) * plotW;
    const yScale = (y) => pad.t + plotH - (y / yMax) * plotH;

    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.lineWidth = 1;
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++){
      const y = pad.t + (plotH / yTicks) * i;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + plotW, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(233,236,255,.60)';
    ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= yTicks; i++){
      const v = Math.round(yMax * (1 - i / yTicks));
      const y = pad.t + (plotH / yTicks) * i;
      ctx.fillText(String(v), pad.l - 6, y);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xLabels = [0, xMax / 2, xMax];
    for (const v of xLabels){
      const x = xScale(v);
      ctx.fillText(`${Math.round(v)}s`, x, pad.t + plotH + 4);
    }

    ctx.strokeStyle = 'rgba(34,211,238,.90)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < series.length; i++){
      const p = series[i];
      const x = xScale(p.t);
      const y = yScale(p.y);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const last = series[series.length - 1];
    ctx.fillStyle = 'rgba(34,211,238,.95)';
    ctx.beginPath();
    ctx.arc(xScale(last.t), yScale(last.y), 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function hideFinishModal(){
    if (!elFinishModal) return;
    elFinishModal.classList.remove('show');
    elFinishModal.setAttribute('aria-hidden', 'true');

    if (elSpeedChart){
      const ctx = elSpeedChart.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, elSpeedChart.width, elSpeedChart.height);
    }
  }

  function showFinishModal(stats){
    if (!elFinishModal) return;

    elMCpm.textContent = String(stats.cpm);
    if (elMWpm) elMWpm.textContent = String(stats.wpm ?? Math.round(stats.cpm / 5));
    elMMiss.textContent = String(stats.misses);
    elMAcc.textContent = `${stats.acc}%`;
    elMTime.textContent = stats.timeText;
    elMMsg.textContent = stats.message;

    elFinishModal.classList.add('show');
    elFinishModal.setAttribute('aria-hidden', 'false');

    if (elSpeedChart){
      requestAnimationFrame(() => drawSpeedChart(stats.speedSeries || []));
    }
  }

  function clearHeatmap(){
    if (elKbdLegend) elKbdLegend.classList.remove('show');
    if (elKbdLegendRight) elKbdLegendRight.textContent = 'Misses: 0';

    document.querySelectorAll('.key').forEach(k => {
      k.classList.remove('showMiss');
      const fill = k.querySelector('.missFill');
      const pct = k.querySelector('.missPct');
      if (fill) fill.style.height = '0%';
      if (pct) pct.textContent = '';
    });

    missByExpectedKey.clear();
  }

  function renderHeatmap(){
    let totalMisses = 0;
    for (const v of missByExpectedKey.values()) totalMisses += v;

    if (!totalMisses){
      if (elKbdLegend) elKbdLegend.classList.remove('show');
      if (elKbdLegendRight) elKbdLegendRight.textContent = 'Misses: 0';
      return;
    }

    if (elKbdLegend) elKbdLegend.classList.add('show');
    if (elKbdLegendRight) elKbdLegendRight.textContent = `Misses: ${totalMisses}`;

    for (const [keyId, els] of keyEls.entries()){
      const c = missByExpectedKey.get(keyId) || 0;
      const pct = (c / totalMisses) * 100;

      els.forEach(el => {
        const fill = el.querySelector('.missFill');
        const label = el.querySelector('.missPct');
        if (!fill || !label) return;

        if (c > 0){
          el.classList.add('showMiss');
          fill.style.height = `${pct.toFixed(1)}%`;
          label.textContent = `${Math.round(pct)}%`;
        } else {
          el.classList.remove('showMiss');
          fill.style.height = '0%';
          label.textContent = '';
        }
      });
    }
  }

  function computeFinishStats(){
    const end = endedAt ?? performance.now();
    const start = startedAt ?? end;

    const ms = Math.max(1, end - start);
    const minutes = ms / 60000;

    const correctChars = ok;
    const misses = bad;
    const attempts = correctChars + misses;

    const cpm = Math.round(correctChars / minutes);
    const wpm = Math.round((correctChars / 5) / minutes);
    const acc = attempts ? Math.round((correctChars / attempts) * 100) : 100;

    const secs = Math.round(ms / 1000);
    const timeText = secs < 60 ? `${secs}s` : `${Math.floor(secs/60)}m ${secs%60}s`;

    let message = 'Keep going.';
    if (acc >= 98) message = 'Perfect accuracy — now keep the rhythm steady.';
    else if (acc >= 95) message = 'Great! Speed up slightly without losing control.';
    else if (acc >= 90) message = 'Good — slow down a bit and aim for cleaner hits.';
    else if (acc >= 80) message = 'Nice start — focus on accuracy first, speed later.';
    else message = 'Go slower and watch the next character; accuracy will improve fast.';

    const speedSeries = buildRollingWpmSeries(speedLog, 5);
    return { cpm, wpm, acc, misses, timeText, message, speedSeries };
  }

  // ========= LOADER =========
  let isLoadingText = false;

  function pickWantedSentences(){
    const v = elTextLen?.value || 'short';
    if (v === 'medium') return randInt(3, 5);
    if (v === 'long') return randInt(5, 10);
    return 1;
  }

  async function loadNewText(){
    if (isLoadingText) return;
    isLoadingText = true;
    waitingForEnter = false;
    timeUp = false;
    timeLimitMs = calcTimeLimitMs();
    updateTimeLeftDisplay(timeLimitMs);

    const btnNew = document.getElementById('newText');
    const btnRestart = document.getElementById('restart');
    const prevLabel = btnNew.textContent;

    btnNew.textContent = 'Loading…';
    btnNew.disabled = true;
    btnRestart.disabled = true;
    elStatus.textContent = 'Loading…';
    elNextChar.textContent = '…';

    const lang = elLang.value;
    const source = elSource.value;
    const topic = (elTopic.value || '').trim();
    const style = elStyle.value || 'plain';

    syncControls();

    const wanted = (source === 'code') ? 1 : pickWantedSentences();

    let txt = '';
    let label = '';

    try {
      if (source === 'code'){
        txt = pickCodeSnippet(elCodeLang.value, elCodeLevel.value);
      } else if (source === 'ai'){
        const parts = [];
        for (let i = 0; i < wanted; i++){
          const s = await fetchAiSentence(lang, topic, style);
          const one = pickNiceSentence(s) || cleanSentence(s);
          if (one) parts.push(one);
        }
        txt = parts.join(' ');
      } else {
        const out = await fetchWikiText(lang, topic, wanted);
        txt = out.text;
        label = out.title ? `Wikipedia: ${out.title}` : 'Wikipedia';
      }

      if (!txt || txt.length < 10) throw new Error('Too short');

    } catch (e) {
      // If AI failed, show why and try Wikipedia next
      if (source === 'ai'){
        const extra = e?.hint ? ` (${e.hint})` : '';
        elStatus.textContent = `AI unavailable: ${e?.type || 'error'} – ${e?.message || ''}${extra}  Using Wikipedia.`;
        try {
          const out = await fetchWikiText(lang, topic, wanted);
          txt = out.text;
          label = out.title ? `Wikipedia: ${out.title}` : 'Wikipedia';
        } catch {
          elStatus.textContent = 'AI unavailable and Wikipedia failed. Using local fallback.';
          txt = pickText(lang);
        }
      } else {
        elStatus.textContent = 'Wikipedia fetch failed. Using local fallback.';
        txt = pickText(lang);
      }
    }

    txt = normalizePracticeText(txt, { isCode: (source === 'code') });

    setText(txt);

    if (label) elStatus.textContent = `${label} • Press keys to start`;

    btnNew.textContent = prevLabel;
    btnNew.disabled = false;
    btnRestart.disabled = false;
    isLoadingText = false;
  }

  function syncControls(){
    const source = elSource.value;
    const prevKeyboardVisible = keyboardVisible;

    codeMode = (source === 'code');
    elTextWrap.classList.toggle('codeMode', codeMode);

    // Code controls
    document.querySelectorAll('[data-only="code"]').forEach(el => {
      el.style.display = (source === 'code') ? '' : 'none';
    });

    // Text-length only for wiki/ai
    if (elTextLen){
      elTextLen.style.display = (source === 'code') ? 'none' : '';
    }

    // Topic input only for Wiki/AI
    elTopic.style.display = (source === 'code') ? 'none' : '';

    // Style only for AI
    elStyle.disabled = (source !== 'ai');
    elStyle.style.opacity = (source === 'ai') ? '1' : '.55';

    // Training toggle hidden/forced on in code mode
    if (elTrainingWrap && elTrainingToggle){
      if (source === 'code'){
        elTrainingWrap.style.display = 'none';
        elTrainingToggle.checked = true;
        elTrainingToggle.disabled = true;
        trainingMode = true;
      } else {
        elTrainingWrap.style.display = '';
        elTrainingToggle.disabled = false;
        trainingMode = !!elTrainingToggle.checked;
      }
    }

    // Racer input visible only when training OFF and not code
    if (elRacerRow){
      elRacerRow.style.display = (!codeMode && !trainingMode) ? '' : 'none';
    }

    // Style hooks
    if (elTextWrap){
      elTextWrap.classList.toggle('racerMode', (!codeMode && !trainingMode));
    }
    if (codeMode || trainingMode){
      resetTextAnchor();
    }

    // Finger guide overlay exists in DOM only in training mode.
    if (elFingerOverlay && elTextWrap){
      if (trainingMode){
        if (!elFingerOverlay.isConnected){
          if (fingerOverlayAnchor && fingerOverlayAnchor.parentNode === elTextWrap){
            elTextWrap.insertBefore(elFingerOverlay, fingerOverlayAnchor);
            fingerOverlayAnchor.remove();
          } else if (elTextInner && elTextInner.parentNode === elTextWrap){
            elTextWrap.insertBefore(elFingerOverlay, elTextInner);
          } else {
            elTextWrap.appendChild(elFingerOverlay);
          }
        }
        elFingerOverlay.style.display = '';
        elFingerOverlay.style.height = '';
        if (elSideGlowL) elSideGlowL.style.display = '';
        if (elSideGlowR) elSideGlowR.style.display = '';
      } else {
        if (!fingerOverlayAnchor){
          fingerOverlayAnchor = document.createComment('finger-overlay-anchor');
        }
        if (elFingerOverlay.parentNode === elTextWrap){
          elTextWrap.insertBefore(fingerOverlayAnchor, elFingerOverlay);
          elTextWrap.removeChild(elFingerOverlay);
        }
        // Also hide side glows while training is off.
        if (elSideGlowL) elSideGlowL.style.display = 'none';
        if (elSideGlowR) elSideGlowR.style.display = 'none';
      }
    }

    // Bottom on-screen keyboard visibility toggle.
    if (elKeyboardToggle){
      keyboardVisible = !!elKeyboardToggle.checked;
    }
    if (elKbdArea){
      elKbdArea.style.display = keyboardVisible ? '' : 'none';
    }
    document.body.classList.toggle('kbdTight', trainingMode && keyboardVisible);
    if (prevKeyboardVisible !== keyboardVisible){
      requestAnimationFrame(() => {
        if (!keyboardVisible) scrollCurrentIntoView();
        else scrollCurrentIntoView();
      });
    }
  }

  // ========= TYPING ENGINE =========

  function normalizeCodeIndentToTabs(code){
    const lines = String(code).split('\n');
    const leading = [];
    for (const ln of lines){
      if (!ln.trim()) continue;
      if (ln.startsWith('\t')) continue;
      const m = ln.match(/^ +/);
      if (m && m[0].length > 0) leading.push(m[0].length);
    }
    const unit = leading.length ? Math.min(...leading) : 4;
    const safeUnit = (unit >= 2 && unit <= 8) ? unit : 4;

    const out = lines.map(ln => {
      let i = 0;
      while (ln.startsWith(' '.repeat(safeUnit), i)) i += safeUnit;
      if (i === 0) return ln;
      const tabs = '\t'.repeat(Math.floor(i / safeUnit));
      const restSpaces = ' '.repeat(i % safeUnit);
      return tabs + restSpaces + ln.slice(i);
    }).join('\n');

    return { text: out, unit: safeUnit };
  }

  function clearAllRacerClasses(){
    for (const w of wordUnits){
      w.el.classList.remove('wordDone', 'wordBad', 'wordActive');
    }
    for (const s of spans){
      s.classList.remove('typedOk', 'typedBad');
    }
  }

  function setText(raw){
    const isCode = (elSource && elSource.value === 'code');
    let str = String(raw ?? '');

    if (isCode){
      const norm = normalizeCodeIndentToTabs(str);
      str = norm.text;
      TAB_VIS = norm.unit;
      document.documentElement.style.setProperty('--tabw', TAB_VIS + 'ch');
    } else {
      TAB_VIS = 4;
      document.documentElement.style.setProperty('--tabw', '4ch');
      // Avoid racer-mode starting far down when source text begins with hidden whitespace/newlines.
      str = str.replace(/^[\s\u200E\u200F\u2060]+/, '');
    }

    target = str;
    index = 0;
    ok = 0;
    bad = 0;

    racer.wordIdx = 0;
    racer.typed = '';
    racer.states = [];
    racer.hasError = false;
    racer.finished = false;

    startedAt = null;
    endedAt = null;
    finishedOnce = false;
    speedLog = [];
    timeUp = false;
    clearTimeLimit();
    timeLimitMs = calcTimeLimitMs();
    updateTimeLeftDisplay(timeLimitMs);
    hideFinishModal();
    clearHeatmap();

    elOk.textContent = '0';
    elBad.textContent = '0';
    elStatus.innerHTML = 'Press keys to start <span class="blink" aria-hidden="true"></span>';

    elTextInner.innerHTML = '';
    spans = [];
    wordUnits = [];

    // Render with word wrappers so words don't split across lines.
    const frag = document.createDocumentFragment();
    const tokens = String(target).split(/(\s+)/);

    let charPos = 0;

    for (const tok of tokens){
      if (!tok) continue;

      if (/^\s+$/.test(tok)){
        for (const ch of tok){
          const s = document.createElement('span');
          const isNL = ch === '\n';
          const isTAB = ch === '\t';
          const isSpace = ch === ' ';
          s.className = 'char pending' + (isNL ? ' nl' : '') + (isTAB ? ' tab' : '') + (isSpace ? ' ws' : '');

          if (isTAB) s.style.width = `${TAB_VIS}ch`;
          s.textContent = isNL ? '' : (isTAB ? ' '.repeat(TAB_VIS) : ch);

          frag.appendChild(s);
          spans.push(s);
          charPos++;
          if (isNL) frag.appendChild(document.createElement('br'));
        }
      } else {
        const w = document.createElement('span');
        w.className = 'word';
        const start = spans.length;
        for (const ch of tok){
          const s = document.createElement('span');
          s.className = 'char pending';
          s.textContent = ch;
          w.appendChild(s);
          spans.push(s);
          charPos++;
        }
        wordUnits.push({ el: w, start, len: tok.length, text: tok, normText: foldForCompare(tok) });
        frag.appendChild(w);
      }
    }

    elTextInner.appendChild(frag);
      if (elTextWrap){
        elTextWrap.scrollTop = 0;
      }
      resetTextAnchor();

    // Place caret
    if (spans.length){
      spans[0].classList.remove('pending');
      spans[0].classList.add('current');
    }

    syncControls();

    if (!codeMode && !trainingMode){
      initRacerMode();
    } else {
      clearAllRacerClasses();
    }

    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
  }

  function resetTextAnchor(){
    textAnchorOffset = 0;
    if (elTextInner) elTextInner.style.transform = '';
  }

  function anchorTextToOffsetLines(linesAbove){
    if (!elTextWrap || !elTextInner) return;
    const s = spans[index] || spans[spans.length - 1];
    if (!s){
      resetTextAnchor();
      return;
    }
    elTextInner.style.transform = textAnchorOffset ? `translateY(${textAnchorOffset}px)` : '';
    const wrapRect = elTextWrap.getBoundingClientRect();
    const curRect = s.getBoundingClientRect();
    const styles = getComputedStyle(elTextWrap);
    const padTop = parseFloat(styles.paddingTop || '0') || 0;
    const lh = parseFloat(styles.lineHeight || '0') || 0;
    const targetTop = wrapRect.top + padTop + (Math.max(0, linesAbove) * lh);
    const dy = curRect.top - targetTop;
    textAnchorOffset -= dy;
    if (Math.abs(textAnchorOffset) < 0.5) textAnchorOffset = 0;
    elTextInner.style.transform = textAnchorOffset ? `translateY(${textAnchorOffset}px)` : '';
  }

  function scrollCurrentIntoView(){
    if (!elTextWrap) return;
    // Racer mode: keep a couple lines above the current line for context.
    if (!codeMode && !trainingMode){
      anchorTextToOffsetLines(2);
      return;
    }
    // Training mode: keep at least 2 lines of upcoming text visible.
    if (trainingMode && !codeMode){
      ensureLinesAhead(2);
      return;
    }
    if (index <= 0){
      elTextWrap.scrollTop = 0;
      return;
    }
    const s = spans[index];
    if (!s) return;
    const canScroll = (elTextWrap.scrollHeight > elTextWrap.clientHeight + 2);
    if (!canScroll) return;
    // "nearest" keeps text naturally higher and avoids jumping to the middle.
    s.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function ensureLinesAhead(linesAhead){
    if (!elTextWrap) return;
    const s = spans[index];
    if (!s) return;

    const wrapRect = elTextWrap.getBoundingClientRect();
    const sRect = s.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(elTextWrap).lineHeight || '0') || 0;
    if (!lh) return;

    const needed = linesAhead * lh;
    const distanceBelow = wrapRect.bottom - sRect.bottom;
    if (distanceBelow < needed){
      elTextWrap.scrollTop += (needed - distanceBelow);
    }

    const distanceAbove = sRect.top - wrapRect.top;
    if (distanceAbove < 0){
      elTextWrap.scrollTop += distanceAbove;
    }
  }

  function keepTopAtStart(){
    if (!elTextWrap) return;
    if (index <= 1){
      elTextWrap.scrollTop = 0;
    }
  }

  function normalizedKeyFromEvent(e){
    if (e.key === ' ') return 'Space';
    if (e.key === 'Escape') return 'Escape';
    if (e.key === 'Backspace') return 'Backspace';
    if (e.key === 'Enter') return 'Enter';
    if (e.key === 'Tab') return 'Tab';
    if (e.key === 'CapsLock') return 'CapsLock';
    if (e.key === 'Shift') return 'Shift';
    if (e.key === 'Control') return 'Control';
    if (e.key === 'AltGraph') return 'AltGraph';
    if (e.key === 'Alt') return 'Alt';
    if (typeof e.key === 'string' && e.key.length === 1) return e.key.toLowerCase();
    return e.key;
  }

  function expectedChar(){ return target[index] ?? ''; }

  function isInLineIndent(pos){
    const lineStart = target.lastIndexOf('\n', pos - 1) + 1;
    for (let i = lineStart; i < pos; i++){
      const c = target[i];
      if (c !== ' ' && c !== '\t') return false;
    }
    return true;
  }

  function consumeIndentSpaces(){
    if (!isInLineIndent(index)) return 0;
    let count = 0;
    while (true){
      const c = target[index + count];
      if (c === ' ' || c === '\t') count++;
      else break;
    }
    if (!count) return 0;

    let counted = false;
    for (let i = 0; i < count; i++){
      const prev = spans[index];
      if (prev){
        prev.classList.remove('current');
        prev.classList.add('done');
      }
      index++;

      if (!counted){
        ok++;
        counted = true;
      }
      const cur = spans[index];
      if (cur){
        cur.classList.remove('pending');
        cur.classList.add('current');
      }
    }

    recordSpeedPoint();
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
    return count;
  }

  function expectedKeyForChar(ch){
    if (ch === '') return null;
    if (ch === ' ') return 'Space';
    if (ch === '\n') return 'Enter';
    if (ch === '\t') return 'Tab';
    return ch.toLowerCase();
  }

  function clearExpected(){
    document.querySelectorAll('.key.expected').forEach(k => k.classList.remove('expected'));
  }

  function updateExpectedKey(){
    clearExpected();
    const ch = expectedChar();
    const key = expectedKeyForChar(ch);
    if (!key) { elNextChar.textContent = '—'; return; }

    elNextChar.textContent = (ch === ' ') ? '␠ (space)' : (ch === '\n') ? '⏎ (enter)' : (ch === '\t') ? '⇥ (tab)' : ch;

    const els = keyEls.get(key);
    if (els && els.length) els.forEach(el => el.classList.add('expected'));

    if (ch.toUpperCase() === ch && ch.toLowerCase() !== ch){
      const sh = keyEls.get('Shift');
      if (sh) sh.forEach(el => el.classList.add('expected'));
    }

    updateFingerOverlayForKey(key, ch);
  }

  function updateUI(){
    const pct = target.length ? Math.floor((index / target.length) * 100) : 0;
    elProgress.textContent = pct + '%';
    elOk.textContent = String(ok);
    elBad.textContent = String(bad);

    const canFinish = (codeMode || trainingMode) ? true : !!racer.finished;
    if (index >= target.length && target.length && canFinish){
      elStatus.innerHTML = '<span class="success">Finished!</span> Press <span class="hintStrong">Enter</span> for a new text, or click “New text”.';
      elNextChar.textContent = '✅';
      clearExpected();

      if (!finishedOnce){
        finishedOnce = true;
        endedAt = performance.now();
        if (timeDeadline !== null){
          updateTimeLeftDisplay(Math.max(0, timeDeadline - performance.now()));
        }
        clearTimeLimit();
        renderHeatmap();
        showFinishModal(computeFinishStats());
      }
    }
  }

  function setCaret(pos){
    // remove current
    const cur = spans[index];
    if (cur) cur.classList.remove('current');
    index = Math.max(0, Math.min(target.length, pos));
    const now = spans[index];
    if (now){
      now.classList.remove('pending');
      now.classList.add('current');
    }
  }

  function markCharCorrect(){
    const prev = spans[index];
    if (prev){
      prev.classList.remove('current');
      prev.classList.add('done');
    }
    index++;
    const cur = spans[index];
    if (cur){
      cur.classList.remove('pending');
      cur.classList.add('current');
    }
    ok++;
    recordSpeedPoint();
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
    requestAnimationFrame(keepTopAtStart);
  }

  function handleBackspaceTraining(){
    if (index <= 0) return;
    const cur = spans[index];
    if (cur){
      cur.classList.remove('current');
      cur.classList.add('pending');
    }
    index--;
    const prev = spans[index];
    if (prev){
      prev.classList.remove('done');
      prev.classList.remove('pending');
      prev.classList.add('current');
    }
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
  }

  function flashKey(keyId, kind){
    const els = keyEls.get(keyId);
    if (!els) return;
    els.forEach(el => {
      el.classList.add('press');
      el.classList.add(kind);
      setTimeout(() => { el.classList.remove('press'); }, 60);
      setTimeout(() => { el.classList.remove(kind); }, 170);
    });
  }

  function countMissAgainstExpected(){
    const exp = expectedChar();
    const expKey = expectedKeyForChar(exp);
    if (expKey && keyEls.get(expKey)){
      missByExpectedKey.set(expKey, (missByExpectedKey.get(expKey) || 0) + 1);
    }
  }

  // ========= RACER MODE =========
  function currentWordUnit(){
    return wordUnits[racer.wordIdx] || null;
  }

  function findWordIdxByStart(startPos){
    const i = wordUnits.findIndex(w => w.start === startPos);
    if (i >= 0) return i;
    // fallback: first word whose start is after startPos
    for (let k = 0; k < wordUnits.length; k++){
      if (wordUnits[k].start > startPos) return k;
    }
    return wordUnits.length - 1;
  }

  function skipWhitespaceForward(){
    while (index < target.length && isWhitespaceChar(target[index])){
      const s = spans[index];
      if (s){
        s.classList.remove('current');
        s.classList.remove('pending');
        s.classList.add('done');
      }
      index++;
    }
  }

  function initRacerMode(){
    clearAllRacerClasses();

    // Reset all chars to pending (except keep line breaks as is)
    spans.forEach(s => {
      s.classList.remove('done', 'current');
      if (!s.classList.contains('pending')) s.classList.add('pending');
    });

    // Skip leading whitespace
    index = 0;
    skipWhitespaceForward();

    racer.wordIdx = findWordIdxByStart(index);
    racer.typed = '';
    racer.states = [];
    racer.hasError = false;
    racer.finished = false;

    // Set caret at start of word
    if (spans[index]){
      spans[index].classList.remove('pending');
      spans[index].classList.add('current');
    }

    // Activate word classes
    updateRacerWordClasses();
    updateRacerInput();
    updateExpectedKey();
    // In racer mode, anchor the first active char a few lines below the top.
    const cur = spans[index];
    if (cur){
      anchorTextToOffsetLines(2);
    } else {
      scrollCurrentIntoView();
    }
    requestAnimationFrame(keepTopAtStart);
  }

  function updateRacerWordClasses(){
    for (let i = 0; i < wordUnits.length; i++){
      const w = wordUnits[i];
      w.el.classList.toggle('wordActive', i === racer.wordIdx);
      if (i === racer.wordIdx){
        w.el.classList.toggle('wordBad', racer.hasError);
      }
    }
  }

  function updateRacerInput(){
    if (!elRacerInput) return;
    elRacerInput.value = racer.typed;
    // keep it focused in racer mode
    if (!trainingMode && !codeMode){
      try { elRacerInput.focus({ preventScroll: true }); } catch {}
    }
  }

  function applyTypedStateToSpan(globalPos, isOk){
    const s = spans[globalPos];
    if (!s) return;
    s.classList.remove('pending', 'current');
    s.classList.toggle('typedOk', !!isOk);
    s.classList.toggle('typedBad', !isOk);
  }

  function clearTypedStateAt(globalPos){
    const s = spans[globalPos];
    if (!s) return;
    s.classList.remove('typedOk', 'typedBad', 'done');
    s.classList.add('pending');
  }

  function moveCaretWithinWord(word, typedLen){
    // Remove current from whatever span had it
    document.querySelectorAll('.char.current').forEach(el => el.classList.remove('current'));

    const pos = Math.min(word.start + typedLen, word.start + word.len);
    index = pos;
    const s = spans[index];
    if (s){
      s.classList.remove('pending');
      s.classList.add('current');
    }
  }

  function commitCurrentWord(){
    const word = currentWordUnit();
    if (!word) return false;

    // Mark word chars as done
    for (let i = 0; i < word.len; i++){
      const p = word.start + i;
      const s = spans[p];
      if (!s) continue;
      s.classList.remove('typedOk', 'typedBad', 'pending', 'current');
      s.classList.add('done');
    }

    word.el.classList.remove('wordBad', 'wordActive');
    word.el.classList.add('wordDone');

    // Advance across the word
    index = word.start + word.len;

    // Consume whitespace after the word
    while (index < target.length && isWhitespaceChar(target[index])){
      const s = spans[index];
      if (s){
        s.classList.remove('pending', 'current');
        s.classList.add('done');
      }
      index++;
    }

    // Next word
    racer.wordIdx = findWordIdxByStart(index);
    racer.typed = '';
    racer.states = [];
    racer.hasError = false;

    // Set caret
    if (spans[index]){
      spans[index].classList.remove('pending');
      spans[index].classList.add('current');
    }

    if (index >= target.length){
      racer.finished = true;
    }

    updateRacerWordClasses();
    updateRacerInput();
    recordSpeedPoint();
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
    return true;
  }

  function handleRacerBackspace(){
    const word = currentWordUnit();
    if (!word) return;

    const typedLen = racer.typed.length;
    if (typedLen <= 0){
      flashKey('Backspace', 'neutral');
      return;
    }

    const pos = word.start + typedLen - 1;
    racer.typed = racer.typed.slice(0, -1);
    racer.states.pop();
    racer.hasError = racer.states.includes(false);

    clearTypedStateAt(pos);

    moveCaretWithinWord(word, racer.typed.length);
    updateRacerWordClasses();
    updateRacerInput();
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
  }

  function handleRacerChar(typedChar){
    const word = currentWordUnit();
    if (!word) return;

    const typedLen = racer.typed.length;
    if (typedLen >= word.len){
      flashKey('Space', 'neutral');
      return;
    }

    const exp = word.text[typedLen];
    const isOk = foldForCompare(typedChar) === foldForCompare(exp);

    racer.typed += typedChar;
    racer.states.push(isOk);
    racer.hasError = racer.states.includes(false);

    if (isOk) ok++;
    else {
      bad++;
      // expected key heatmap counts against expected char at this position
      const expKey = expectedKeyForChar(exp);
      if (expKey && keyEls.get(expKey)){
        missByExpectedKey.set(expKey, (missByExpectedKey.get(expKey) || 0) + 1);
      }
    }

    applyTypedStateToSpan(word.start + typedLen, isOk);

    moveCaretWithinWord(word, racer.typed.length);

    const wordComplete = racer.typed.length === word.len;
    const wordExact = !racer.hasError && foldForCompare(racer.typed) === (word.normText ?? foldForCompare(word.text));
    const isLastWord = wordUnits.length && word === wordUnits[wordUnits.length - 1];
    if (wordComplete && wordExact && isLastWord){
      commitCurrentWord();
      return;
    }

    updateRacerWordClasses();
    updateRacerInput();
    recordSpeedPoint();
    updateUI();
    updateExpectedKey();
    scrollCurrentIntoView();
  }

  function handleRacerSpace(){
    const word = currentWordUnit();
    if (!word) return;

    const typedLen = racer.typed.length;

    // Only allow advance if word is complete AND exact
    if (typedLen === word.len && !racer.hasError && foldForCompare(racer.typed) === (word.normText ?? foldForCompare(word.text))){
      flashKey('Space', 'correct');
      commitCurrentWord();
      return;
    }

    // Otherwise: keep you on the word
    racer.hasError = true;
    updateRacerWordClasses();
    flashKey('Space', 'neutral');
    updateUI();
  }

  // ========= TRAINING MODE HANDLER =========
  function onKeyDownTraining(e){
    if (e.metaKey || (e.ctrlKey && !['Control','AltGraph'].includes(e.key))) return;

    // prevent scroll & focus jumping
    if ([' ', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

    // Start timer on first meaningful key
    if (startedAt === null){
      const meaningful =
        e.key === 'Backspace' ||
        e.key === 'Enter' ||
        e.key === 'Tab' ||
        e.key === ' ' ||
        (typeof e.key === 'string' && e.key.length === 1);
      if (meaningful){
        startedAt = performance.now();
        speedLog = [{ t: 0, chars: index }];
      }
    }

    // Finished state: Enter closes popup + loads next
    if (index >= target.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        flashKey('Enter', 'neutral');
        hideFinishModal();
        loadNewText();
      }
      return;
    }

    const pressedKeyId = normalizedKeyFromEvent(e);

    if (e.key === 'Backspace'){
      flashKey('Backspace', 'neutral');
      handleBackspaceTraining();
      return;
    }

    const exp = expectedChar();

    if (e.key === 'Enter' && exp !== '\n'){
      flashKey('Enter', 'neutral');
      return;
    }

    if (e.key === 'Tab'){
      e.preventDefault();
      if (codeMode && isInLineIndent(index) && (exp === '\t' || exp === ' ')){
        flashKey('Tab', 'correct');
        consumeIndentSpaces();
      } else if (exp === '\t'){
        flashKey('Tab', 'correct');
        markCharCorrect();
      } else {
        flashKey('Tab', 'neutral');
      }
      return;
    }

    let typed = null;
    if (e.key === 'Enter') typed = '\n';
    else if (e.key === 'Tab') typed = '\t';
    else if (e.key === ' ') typed = ' ';
    else if (typeof e.key === 'string' && e.key.length === 1) typed = e.key;
    else {
      flashKey(pressedKeyId, 'neutral');
      return;
    }

    elStatus.textContent = 'Typing…';

    if (foldForCompare(typed) === foldForCompare(exp)){
      flashKey(pressedKeyId, 'correct');
      markCharCorrect();
    } else {
      bad++;
      countMissAgainstExpected();

      flashKey(pressedKeyId, 'neutral');

      const expKey = expectedKeyForChar(exp);
      if (expKey) flashKey(expKey, 'correct');

      updateUI();
    }
  }

  // ========= MODE ROUTER =========
  function isEditingControl(){
    const ae = document.activeElement;
    if (!ae) return false;
    if (ae === elRacerInput) return false; // racer handled by us

    const tag = (ae.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (ae.isContentEditable) return true;
    return false;
  }

  function onKeyDown(e){
    if (isEditingControl()) return;
    if (timeUp){
      if (e.key === 'Enter'){
        e.preventDefault();
        loadNewText();
      }
      return;
    }
    if (waitingForEnter){
      if (e.key === 'Enter'){
        e.preventDefault();
        loadNewText();
      }
      return;
    }

    // Start timer (shared)
    if (startedAt === null){
      const meaningful =
        e.key === 'Backspace' ||
        e.key === 'Enter' ||
        e.key === 'Tab' ||
        e.key === ' ' ||
        (typeof e.key === 'string' && e.key.length === 1);
      if (meaningful){
        startedAt = performance.now();
        speedLog = [{ t: 0, chars: index }];
        startTimeLimit();
      }
    }

    // Finished state: Enter closes popup + loads next
    const canFinish = (codeMode || trainingMode) ? true : !!racer.finished;
    if (index >= target.length && target.length && canFinish) {
      if (e.key === 'Enter'){
        e.preventDefault();
        flashKey('Enter', 'neutral');
        hideFinishModal();
        loadNewText();
      }
      return;
    }

    if (codeMode || trainingMode){
      onKeyDownTraining(e);
      return;
    }

    // ===== Racer mode =====
    if ([' ', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();

    const pressedKeyId = normalizedKeyFromEvent(e);

    if (e.key === 'Backspace'){
      flashKey('Backspace', 'neutral');
      handleRacerBackspace();
      return;
    }

    if (e.key === ' '){
      handleRacerSpace();
      return;
    }

    if (e.key === 'Enter'){
      flashKey('Enter', 'neutral');
      return;
    }

    if (typeof e.key === 'string' && e.key.length === 1){
      const ch = e.key;
      // Don't allow actual spaces here; handled above
      flashKey(pressedKeyId, 'neutral');
      handleRacerChar(ch);
      return;
    }

    flashKey(pressedKeyId, 'neutral');
  }

  // ========= CONTROLS =========
  document.getElementById('newText').addEventListener('click', () => loadNewText());
  document.getElementById('restart').addEventListener('click', () => setText(target));
  elLang.addEventListener('change', () => { queueNewText(); saveSettings(); });
  elSource.addEventListener('change', () => { queueNewText(); saveSettings(); });
  elTextLen?.addEventListener('change', () => {
    if (elSource.value !== 'code') queueNewText();
    saveSettings();
  });

  elCodeLang.addEventListener('change', () => {
    if (elSource.value === 'code') queueNewText();
    saveSettings();
  });
  elCodeLevel.addEventListener('change', () => {
    if (elSource.value === 'code') queueNewText();
    saveSettings();
  });
  elStyle.addEventListener('change', () => {
    if (elSource.value === 'ai') queueNewText();
    saveSettings();
  });

  elTrainingToggle?.addEventListener('change', () => {
    trainingMode = !!elTrainingToggle.checked;
    syncControls();
    // restart current text in new mode
    setText(target);
    saveSettings();
  });

  elKeyboardToggle?.addEventListener('change', () => {
    syncControls();
    saveSettings();
  });

  // Press Enter in topic field loads immediately
  elTopic.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
      e.preventDefault();
      loadNewText();
      saveSettings();
    }
  });
  elTopic.addEventListener('change', () => { queueNewText(); saveSettings(); });

  // Don't let racerInput change by native input editing (we drive it)
  elRacerInput?.addEventListener('beforeinput', (e) => {
    if (!trainingMode && !codeMode){
      e.preventDefault();
    }
  });

  // ========= INIT =========
  const saved = loadSettings();
  if (saved){
    if (saved.lang && elLang) elLang.value = saved.lang;
    if (saved.source && elSource) elSource.value = saved.source;
    if (saved.topic !== undefined && elTopic) elTopic.value = saved.topic;
    if (saved.textLen && elTextLen) elTextLen.value = saved.textLen;
    if (saved.style && elStyle) elStyle.value = saved.style;
    if (saved.codeLang && elCodeLang) elCodeLang.value = saved.codeLang;
    if (saved.codeLevel && elCodeLevel) elCodeLevel.value = saved.codeLevel;
    if (saved.training !== undefined && elTrainingToggle) elTrainingToggle.checked = !!saved.training;
    if (saved.keyboard !== undefined && elKeyboardToggle) elKeyboardToggle.checked = !!saved.keyboard;
  }

  buildKeyboard();
  initFingerOverlay();
  syncControls();
  window.scrollTo(0, 0);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  queueNewText();

})();
