(() => {
  const $ = (id) => document.getElementById(id);
  const ROUND_SIZE = 8;

  // ---------- Клавиатура и пальцы ----------
  const ROWS = [
    "qwertyuiop".split(""),
    "asdfghjkl'".split(""),
    "zxcvbnm,./".split(""),
    [" "]
  ];
  const FINGER_OF = {};
  const assign = (f, keys) => keys.split("").forEach((k) => (FINGER_OF[k] = f));
  assign("lp", "qaz"); assign("lr", "wsx"); assign("lm", "edc"); assign("li", "rfvtgb");
  assign("ri", "yhnujm"); assign("rm", "ik,"); assign("rr", "ol."); assign("rp", "p;'/");
  FINGER_OF[" "] = "rt";
  const FINGER_COLOR = {
    lp: "#f472b6", lr: "#fb923c", lm: "#facc15", li: "#4ade80", lt: "#38bdf8",
    rt: "#38bdf8", ri: "#22d3ee", rm: "#818cf8", rr: "#c084fc", rp: "#fb7185"
  };
  const LEFT = ["lp", "lr", "lm", "li", "lt"];
  const RIGHT = ["rt", "ri", "rm", "rr", "rp"];

  const LEVELS = {
    easy:   { name: "Лёгкий",  keyHint: true,  fingerHint: true,  hands: true,  timePerChar: 0,    baseTime: 0, onError: "mark",    penalty: 0 },
    medium: { name: "Средний", keyHint: true,  fingerHint: false, hands: true,  timePerChar: 0.9,  baseTime: 5, onError: "mark",    penalty: 5 },
    hard:   { name: "Сложный", keyHint: false, fingerHint: false, hands: false, timePerChar: 0.55, baseTime: 3, onError: "restart", penalty: 30 }
  };

  const norm = (c) => {
    c = c.toLowerCase();
    return c === "?" ? "/" : c;
  };

  // строим клавиатуру
  const kbEl = $("keyboard");
  const keyEls = {};
  ROWS.forEach((row) => {
    const r = document.createElement("div");
    r.className = "krow";
    row.forEach((k) => {
      const el = document.createElement("div");
      el.className = "key finger" + (k === " " ? " space" : "");
      el.style.setProperty("--fc", FINGER_COLOR[FINGER_OF[k]]);
      el.innerHTML = '<span class="lbl">' + (k === " " ? "space" : k === "/" ? "/?" : k) + "</span>";
      keyEls[k] = el;
      r.appendChild(el);
    });
    kbEl.appendChild(r);
  });

  // ---------- Руки: контурный силуэт (по референсу — ладонь, раскрытые пальцы, ногти) ----------
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "hands-svg");
  kbEl.appendChild(svg);
  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };
  const HOME = { lp: "a", lr: "s", lm: "d", li: "f", ri: "j", rm: "k", rr: "l", rp: "'" };
  const DROP = { p: 0.6, r: 0.15, m: 0, i: 0.12 };       // основания пальцев: мизинец ниже всех
  const ORDER = { l: ["lp", "lr", "lm", "li", "lt"], r: ["rt", "ri", "rm", "rr", "rp"] }; // слева направо
  const ALL_FINGERS = [...LEFT, ...RIGHT];
  const F = {};
  const HANDS = {};
  let KC = {};
  let keyW = 40;

  ["l", "r"].forEach((s) => {
    const g = mk("g", { class: "hand" }, svg);
    HANDS[s] = {
      fill: mk("path", { class: "hand-fill" }, g),
      glow: mk("g", {}, g),
      line: mk("path", { class: "hand-line" }, g),
      nails: mk("g", {}, g)
    };
  });
  ALL_FINGERS.forEach((id) => {
    const h = HANDS[id[0]];
    F[id] = {
      id, color: FINGER_COLOR[id],
      glow: mk("path", { class: "f-glow" }, h.glow),
      nail: mk("path", { class: "nail" }, h.nails),
      cur: null, home: null, base: null, target: null, temp: null
    };
  });

  function layout() {
    const kb = kbEl.getBoundingClientRect();
    if (!kb.width) return;
    KC = {};
    for (const k in keyEls) {
      const r = keyEls[k].getBoundingClientRect();
      KC[k] = { x: r.left - kb.left + r.width / 2, y: r.top - kb.top + r.height / 2, w: r.width, h: r.height };
    }
    const k = (keyW = KC.a.w);
    const space = KC[" "];
    const knY = space.y + k * 0.05;      // линия костяшек — под пробелом
    ["l", "r"].forEach((s) => {
      const dir = s === "l" ? 1 : -1;                  // направление к центру клавиатуры
      const four = ORDER[s].filter((id) => id[1] !== "t");
      const cx = four.reduce((a, id) => a + KC[HOME[id]].x, 0) / 4 + dir * k * 0.2;
      four.forEach((id, i) => {
        const f = F[id];
        f.home = { x: KC[HOME[id]].x, y: KC[HOME[id]].y };
        f.base = { x: cx + (i - 1.5) * k * 0.9, y: knY + DROP[id[1]] * k };
        f.rb = k * (id[1] === "p" ? 0.37 : 0.42);
        f.rt = k * (id[1] === "p" ? 0.31 : 0.35);
      });
      const th = F[s + "t"], idx = F[s + "i"];
      th.home = { x: space.x - dir * space.w * 0.17, y: space.y };
      th.base = { x: idx.base.x + dir * k * 0.55, y: knY + k * 1.25 };
      th.rb = k * 0.5;
      th.rt = k * 0.4;
      const wc = cx + dir * k * 0.15;
      HANDS[s].wl = { x: wc - k * 1.7, y: kb.height };
      HANDS[s].wr = { x: wc + k * 1.7, y: kb.height };
    });
    ALL_FINGERS.forEach((id) => { if (!F[id].cur) F[id].cur = { ...F[id].home }; });
  }

  function setTarget(k) {
    ALL_FINGERS.forEach((id) => (F[id].target = null));
    if (k && G && G.cfg.fingerHint && FINGER_OF[k]) F[FINGER_OF[k]].target = k;
  }
  function strike(k, kind) {
    const f = F[FINGER_OF[k]];
    if (!f || !KC[k]) return;
    f.temp = { k, kind, until: performance.now() + (kind === "err" ? 360 : 200) };
  }

  const P = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  const add = (a, b, m = 1) => ({ x: a.x + b.x * m, y: a.y + b.y * m });

  // контур одного пальца: левый бок → закруглённый кончик → правый бок
  function geom(f) {
    const B = f.base, T = f.cur;
    const d = Math.hypot(T.x - B.x, T.y - B.y) || 1;
    const u = { x: (T.x - B.x) / d, y: (T.y - B.y) / d };
    const n = { x: u.y, y: -u.x };                       // «левая» нормаль
    return {
      u, n, T,
      L0: add(B, n, f.rb), L1: add(T, n, f.rt),
      R1: add(T, n, -f.rt), R0: add(B, n, -f.rb)
    };
  }

  function drawHand(s) {
    const h = HANDS[s];
    const ids = ORDER[s];
    const gs = ids.map((id) => geom(F[id]));
    const k = keyW;
    const first = gs[0], last = gs[gs.length - 1];
    let d = `M${P(h.wl)} C${P({ x: h.wl.x, y: h.wl.y - k * 0.9 })} ${P({ x: first.L0.x - k * 0.12, y: first.L0.y + k * 1.4 })} ${P(first.L0)}`;
    gs.forEach((g, i) => {
      const f = F[ids[i]];
      d += ` L${P(g.L1)} A${f.rt.toFixed(1)} ${f.rt.toFixed(1)} 0 0 1 ${P(g.R1)} L${P(g.R0)}`;
      const nx = gs[i + 1];
      if (nx) {
        // межпальцевая складка — мягкая «V» как на референсе
        const mid = { x: (g.R0.x + nx.L0.x) / 2, y: (g.R0.y + nx.L0.y) / 2 };
        const back = { x: -(g.u.x + nx.u.x) / 2, y: -(g.u.y + nx.u.y) / 2 };
        d += ` Q${P(add(mid, back, k * 0.32))} ${P(nx.L0)}`;
      }
      // ноготь
      const fr = F[ids[i]];
      const rn = fr.rt * 0.6;
      const c = add(g.T, g.u, fr.rt - rn - fr.rt * 0.1);
      const a1 = add(c, g.n, rn), a2 = add(c, g.n, -rn);
      const b2 = add(a2, g.u, -rn * 1.25), b1 = add(a1, g.u, -rn * 1.25);
      fr.nail.setAttribute("d", `M${P(a1)} A${rn.toFixed(1)} ${rn.toFixed(1)} 0 0 1 ${P(a2)} L${P(b2)} Q${P(add(c, g.u, -rn * 1.75))} ${P(b1)} Z`);
      // подсветка пальца
      fr.glow.setAttribute("d", `M${P(g.L0)} L${P(g.L1)} A${fr.rt.toFixed(1)} ${fr.rt.toFixed(1)} 0 0 1 ${P(g.R1)} L${P(g.R0)} Z`);
    });
    d += ` C${P(add(last.R0, last.u, -k * 0.9))} ${P({ x: h.wr.x, y: h.wr.y - k * 0.9 })} ${P(h.wr)}`;
    h.line.setAttribute("d", d);
    h.fill.setAttribute("d", d + " Z");
  }

  function frame(now) {
    if (G && G.cfg.hands && KC.a) {
      ALL_FINGERS.forEach((id) => {
        const f = F[id];
        if (f.temp && now > f.temp.until) f.temp = null;
        const key = (f.temp && f.temp.k) || f.target;
        let gx = f.home.x, gy = f.home.y;
        if (key && KC[key]) { gx = KC[key].x; gy = KC[key].y; }
        if (f.temp && f.temp.kind === "hit") gy += keyW * 0.08;   // палец «вдавливает» клавишу
        f.cur.x += (gx - f.cur.x) * 0.22;
        f.cur.y += (gy - f.cur.y) * 0.22;
        const st = f.temp ? f.temp.kind : f.target ? "hint" : "";
        if (f.state !== st) {
          f.state = st;
          f.glow.setAttribute("class", "f-glow" + (st ? " on " + st : ""));
          f.glow.style.fill = st === "hint" ? f.color : "";
        }
      });
      drawHand("l");
      drawHand("r");
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener("resize", layout);

  // ---------- Звук ----------
  let soundOn = true;
  let actx;
  function tone(freq, dur, type = "sine", vol = 0.12, when = 0) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime + when;
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination);
      o.start(t);
      o.stop(t + dur);
    } catch (e) { /* аудио недоступно */ }
  }
  const sfx = {
    key: () => tone(880, 0.06, "triangle", 0.06),
    err: () => { tone(160, 0.18, "sawtooth", 0.14); tone(120, 0.2, "sawtooth", 0.14, 0.08); },
    done: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.12, i * 0.08)),
    end: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, "square", 0.07, i * 0.1))
  };
  $("btnSound").onclick = () => {
    soundOn = !soundOn;
    $("btnSound").textContent = soundOn ? "🔊" : "🔇";
  };

  // ---------- Состояние ----------
  let G = null; // состояние раунда
  let timerId = null;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };
  const best = () => JSON.parse(store.get("tl_best") || "{}");
  function showBest(level) {
    $("bestScore").textContent = Math.max(0, ...Object.values(best()), 0);
  }

  function show(screen) {
    ["Menu", "Game", "Result", "Books", "Reader", "Vocab"].forEach((s) => $("screen" + s).classList.toggle("hidden", s !== screen));
    const nav = { Books: "navBooks", Reader: "navBooks", Vocab: "navVocab" }[screen] || "navGame";
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.id === nav));
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startRound(level) {
    const cfg = LEVELS[level];
    G = {
      level, cfg,
      list: shuffle(PHRASES[level]).slice(0, ROUND_SIZE),
      idx: 0, pos: 0, score: 0, combo: 0, maxCombo: 0,
      typed: 0, errors: 0, startTime: performance.now(), correctChars: 0,
      learned: [], phraseErrors: 0, locked: false
    };
    $("lvlBadge").textContent = cfg.name;
    $("phraseTotal").textContent = G.list.length;
    kbEl.parentElement.classList.toggle("kb-hide-wrap", !cfg.keyHint);
    kbEl.classList.toggle("kb-hide", !cfg.keyHint);
    kbEl.classList.toggle("kb-plain", !cfg.fingerHint);
    svg.style.display = cfg.hands ? "" : "none";
    $("screenGame").appendChild($("kbWrap"));   // клавиатура могла остаться в читалке
    show("Game");
    layout();
    loadPhrase();
    focusInput();
  }

  function loadPhrase() {
    const [en, ru] = G.list[G.idx];
    G.text = en;
    G.pos = 0;
    G.phraseErrors = 0;
    G.locked = false;
    $("phraseNum").textContent = G.idx + 1;
    $("translation").textContent = ru;
    const p = $("phrase");
    p.innerHTML = "";
    G.chars = [...en].map((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      p.appendChild(s);
      return s;
    });
    buildAnalysis();
    renderCursor();
    updateHud();
    startTimer();
    autoSpeak(en);
  }

  function renderCursor() {
    G.chars.forEach((s, i) => {
      s.classList.toggle("cur", i === G.pos);
      s.classList.toggle("space", s.textContent === " ");
      if (i >= G.pos) s.classList.remove("ok", "bad");
    });
    clearHints();
    updateAnalysis();
    const c = G.text[G.pos];
    if (c === undefined) return setTarget(null);
    const k = norm(c);
    setTarget(k);
    if (G.cfg.keyHint && keyEls[k]) keyEls[k].classList.add("target");
  }

  function clearHints() {
    setTarget(null);
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
  }

  function updateHud() {
    $("score").textContent = G.score;
    $("combo").textContent = G.combo;
  }

  // ---------- Разбор предложения ----------
  const anBody = $("analysisBody");
  function buildAnalysis() {
    anBody.innerHTML = "";
    G.words = [];
    G.groups = [];
    const groups = G.list[G.idx][2] || [];
    let cur = 0;
    groups.forEach(([tag, str]) => {
      const t = TAGS[tag] || TAGS.Subject;
      const gEl = document.createElement("div");
      gEl.className = "an-group";
      gEl.style.setProperty("--tc", t.color);
      gEl.style.setProperty("--tb", t.bg);
      gEl.innerHTML = `<span class="an-tag">${tag}</span>`;
      const row = document.createElement("div");
      row.className = "an-words";
      gEl.appendChild(row);
      const grp = { el: gEl, words: [] };
      str.split(" ").forEach((tok) => {
        const [text, ov] = tok.split("=");
        const key = ov || text.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");
        const [ipa, pos] = WORDS[key] || ["", ""];
        const start = G.text.indexOf(text, cur);
        const end = start + text.length;
        cur = end;
        const w = document.createElement("div");
        w.className = "an-word";
        w.style.setProperty("--pc", POS_COLOR[pos] || "#94a3b8");
        const label = text.replace(/[.,?!]+$/, "");
        w.innerHTML = `<span class="an-ipa">${ipa}</span><span class="an-text">${label}</span><i class="an-line"></i><span class="an-pos">${pos}</span>`;
        w.addEventListener("mouseenter", () => hlWord(rec, true));
        w.addEventListener("mouseleave", () => hlWord(rec, false));
        row.appendChild(w);
        const rec = { el: w, start, end, group: grp };
        grp.words.push(rec);
        G.words.push(rec);
      });
      G.groups.push(grp);
      anBody.appendChild(gEl);
    });
  }
  function hlWord(rec, on) {
    for (let i = rec.start; i < rec.end; i++) G.chars[i] && G.chars[i].classList.toggle("hl", on);
  }
  function updateAnalysis() {
    if (!G || !G.words) return;
    const active = G.words.find((w) => w.end > G.pos);
    G.words.forEach((w) => {
      w.el.classList.toggle("done", w.end <= G.pos);
      w.el.classList.toggle("active", w === active);
    });
    G.groups.forEach((g) => {
      g.el.classList.toggle("active", !!active && g.words.includes(active));
      g.el.classList.toggle("done", g.words.every((w) => w.end <= G.pos));
    });
  }
  $("btnAnalysis").onclick = () => {
    const hide = !anBody.hidden;
    anBody.hidden = hide;
    $("btnAnalysis").textContent = hide ? "Показать" : "Скрыть";
  };

  // ---------- Таймер ----------
  function startTimer() {
    clearInterval(timerId);
    const bar = $("timerBar");
    bar.style.background = "";
    if (!G.cfg.timePerChar) {
      bar.style.width = "100%";
      bar.style.background = "#bef264";
      G.limit = 0;
      return;
    }
    G.limit = (G.cfg.baseTime + G.text.length * G.cfg.timePerChar) * 1000;
    G.phraseStart = performance.now();
    timerId = setInterval(() => {
      const left = 1 - (performance.now() - G.phraseStart) / G.limit;
      bar.style.width = Math.max(0, left * 100) + "%";
      bar.style.background = left > 0.5 ? "#a3e635" : left > 0.25 ? "#fbbf24" : "#ef4444";
      if (left <= 0) timeout();
    }, 50);
  }

  function timeout() {
    clearInterval(timerId);
    if (G.locked) return;
    G.locked = true;
    G.score = Math.max(0, G.score - G.cfg.penalty * 2);
    G.combo = 0;
    feedbackError();
    G.chars.forEach((s, i) => i >= G.pos && s.classList.add("bad"));
    updateHud();
    setTimeout(nextPhrase, 900);
  }

  // ---------- Ввод ----------
  function onChar(ch) {
    if (!G || G.locked) return;
    const want = G.text[G.pos];
    const k = norm(ch);
    G.typed++;
    if (k === norm(want)) {
      G.correctChars++;
      G.combo++;
      G.maxCombo = Math.max(G.maxCombo, G.combo);
      G.score += 10 + Math.min(G.combo, 20);
      G.chars[G.pos].classList.remove("bad");
      G.chars[G.pos].classList.add("ok");
      flashKey(norm(want), "hit");
      strike(norm(want), "hit");
      sfx.key();
      G.pos++;
      updateHud();
      if (G.pos >= G.text.length) return finishPhrase();
      renderCursor();
    } else {
      G.errors++;
      G.phraseErrors++;
      G.combo = 0;
      G.score = Math.max(0, G.score - G.cfg.penalty);
      flashKey(k, "miss");
      strike(k, "err");
      feedbackError();
      if (G.cfg.onError === "restart") {
        G.chars.forEach((s) => s.classList.add("bad"));
        G.locked = true;
        updateHud();
        setTimeout(() => {
          G.pos = 0;
          G.locked = false;
          renderCursor();
        }, 350);
      } else {
        G.chars[G.pos].classList.add("bad");
        updateHud();
      }
    }
  }

  function flashKey(k, cls) {
    const el = keyEls[k];
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 160);
  }

  function feedbackError() {
    sfx.err();
    const card = $("phraseCard");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    const f = $("flash");
    f.className = "fixed inset-0 pointer-events-none z-50";
    void f.offsetWidth;
    f.classList.add("err");
  }

  function finishPhrase() {
    clearInterval(timerId);
    updateAnalysis();
    clearHints();
    G.locked = true;
    let bonus = 50;
    if (G.limit) {
      const left = Math.max(0, G.limit - (performance.now() - G.phraseStart));
      bonus += Math.round(left / 100);
    }
    if (G.phraseErrors === 0) bonus += 30;
    G.score += bonus;
    G.learned.push(G.list[G.idx]);
    updateHud();
    sfx.done();
    const f = $("flash");
    f.className = "fixed inset-0 pointer-events-none z-50";
    void f.offsetWidth;
    f.classList.add("good");
    $("phraseCard").classList.remove("pop");
    void $("phraseCard").offsetWidth;
    $("phraseCard").classList.add("pop");
    setTimeout(nextPhrase, 900);
  }

  function nextPhrase() {
    G.idx++;
    if (G.idx >= G.list.length) return endRound();
    loadPhrase();
  }

  function endRound() {
    clearInterval(timerId);
    stopSpeech();
    clearHints();
    const mins = (performance.now() - G.startTime) / 60000;
    const wpm = Math.round(G.correctChars / mins);
    const acc = G.typed ? Math.round((G.correctChars / G.typed) * 100) : 0;
    const b = best();
    const record = G.score > (b[G.level] || 0);
    if (record) { b[G.level] = G.score; store.set("tl_best", JSON.stringify(b)); }
    showBest();

    $("resScore").textContent = G.score;
    $("resWpm").textContent = wpm;
    $("resAcc").textContent = acc + "%";
    $("resCombo").textContent = G.maxCombo;
    $("resEmoji").textContent = acc >= 95 ? "🏆" : acc >= 80 ? "🎉" : "💪";
    $("resTitle").textContent = record ? "Новый рекорд!" : acc >= 80 ? "Отличная работа!" : "Хорошая тренировка!";
    $("resSub").textContent = `Уровень: ${G.cfg.name}. Выучено фраз: ${G.learned.length} из ${G.list.length}.`;
    $("resList").innerHTML = G.learned
      .map(([en, ru]) => `<li class="bg-lime-50 rounded-xl px-3 py-2"><b>${en}</b> <span class="text-slate-500">— ${ru}</span></li>`)
      .join("") || '<li class="text-slate-400">Пока ни одной — попробуй ещё раз!</li>';
    sfx.end();
    show("Result");
  }

  // ---------- Режим чтения книг ----------
  let R = null;                         // состояние читалки (используется и руками через G)
  const readerText = $("readerText");
  const readerView = $("readerView");
  const bookProgress = () => JSON.parse(store.get("tl_books") || "{}");
  const saveBookProgress = (key, val) => {
    const p = bookProgress();
    p[key] = val;
    store.set("tl_books", JSON.stringify(p));
  };
  // оставляем только символы, которые есть на клавиатуре тренажёра
  const cleanText = (t) => t
    .replace(/[“”"«»]/g, "").replace(/[‘’]/g, "'").replace(/[!;:]/g, ".")
    .replace(/\s*[—–-]\s*/g, " ").replace(/[^A-Za-z .,?']/g, "").replace(/\s+/g, " ").trim();

  let currentBook = BOOKS[0];

  function renderBooks() {
    const prog = bookProgress();
    $("bookGrid").innerHTML = BOOKS.map((b) => {
      const done = b.chapters.filter((_, i) => prog[b.id + ":" + i] === "done").length;
      return `<button class="book-card${b === currentBook ? " sel" : ""}" data-book="${b.id}"
        style="--c1:${b.cover[0]};--c2:${b.cover[1]}">
        <span class="book-cover"><span class="book-icon">${b.icon}</span><span class="book-spine"></span></span>
        <span class="book-info">
          <b>${b.title}</b>
          <span class="book-ru">${b.ru} · ${b.author}</span>
          <span class="book-meta"><span class="book-lvl">${b.level}</span> ${done}/${b.chapters.length} глав</span>
        </span>
      </button>`;
    }).join("");
    $("bookGrid").querySelectorAll(".book-card").forEach((el) => {
      el.onclick = () => {
        currentBook = BOOKS.find((b) => b.id === el.dataset.book);
        renderBooks();
      };
    });
    renderChapters();
  }

  function renderChapters() {
    const b = currentBook;
    const prog = bookProgress();
    $("chapterPanel").innerHTML = `<h3 class="text-lg font-extrabold mb-3">${b.icon} ${b.title} <span class="text-slate-400 font-semibold">— главы</span></h3>
      <div class="chapter-list">${b.chapters.map((c, i) => {
        const total = cleanText(c.text.join(" ")).length;
        const p = prog[b.id + ":" + i];
        const words = cleanText(c.text.join(" ")).split(" ").length;
        const pct = p === "done" ? 100 : Math.round(((+p || 0) / total) * 100);
        const state = p === "done" ? `<span class="ch-done">✓ прочитано</span>` : pct ? `<span class="ch-pct">${pct}%</span>` : "";
        return `<button class="chapter-row" data-ch="${i}">
          <span class="ch-num">${i + 1}</span>
          <span class="ch-name"><b>${c.title}</b><span>${c.ru} · ${words} слов</span></span>
          ${state}
          <span class="ch-bar"><i style="width:${pct}%"></i></span>
        </button>`;
      }).join("")}</div>`;
    $("chapterPanel").querySelectorAll(".chapter-row").forEach((el) => {
      el.onclick = () => openChapter(currentBook, +el.dataset.ch);
    });
  }

  function openBooks() {
    stopSpeech();
    markSpoken(null);
    R = null;
    G = null;
    renderBooks();
    show("Books");
  }

  function openChapter(book, chIdx) {
    const ch = book.chapters[chIdx];
    const paras = ch.text.map(cleanText);
    const text = paras.join(" ");
    const key = book.id + ":" + chIdx;
    const saved = bookProgress()[key];
    R = {
      cfg: { hands: true, fingerHint: $("rdHints").checked, keyHint: true },
      book, chIdx, key, text, pos: 0,
      chars: [], words: [], wordOf: [], active: -1,
      typed: 0, correct: 0, startT: 0, scrollY: -1
    };
    G = R;  // руки и клавиатура читают состояние из G

    // разметка: абзацы → слова (inline-block) → буквы; пробел после слова входит в слово
    readerText.innerHTML = "";
    let i = 0;
    R.paras = paras;
    R.paraStart = [];
    R.paraOf = [];
    R.para = -1;
    paras.forEach((p, pi) => {
      R.paraStart.push(i);
      const pEl = document.createElement("p");
      const tokens = p.split(" ");
      tokens.forEach((t, ti) => {
        const last = ti === tokens.length - 1;
        const sep = last ? (pi < paras.length - 1 ? " " : "") : " ";
        const wEl = document.createElement("span");
        wEl.className = "rw";
        const w = { el: wEl, start: i, end: i + t.length + sep.length };
        [...(t + sep)].forEach((c, ci) => {
          const s = document.createElement("span");
          s.className = "rc" + (c === " " ? (last ? " nl" : " sp") : "");
          s.textContent = c;
          wEl.appendChild(s);
          R.chars.push(s);
          R.wordOf.push(R.words.length);
          R.paraOf.push(pi);
          i++;
        });
        R.words.push(w);
        pEl.appendChild(wEl);
      });
      readerText.appendChild(pEl);
    });

    // продолжение с сохранённого места
    if (saved && saved !== "done") R.pos = Math.min(+saved || 0, text.length - 1);
    for (let j = 0; j < R.pos; j++) R.chars[j].classList.add("ok");

    $("rdTitle").textContent = `${book.icon} ${book.title}`;
    $("rdChapter").textContent = `Глава ${chIdx + 1}. ${ch.title} — ${ch.ru}`;
    $("rdDone").classList.add("hidden");
    $("readerKbSlot").appendChild($("kbWrap"));
    kbEl.classList.remove("kb-hide");
    kbEl.classList.toggle("kb-plain", !R.cfg.fingerHint);
    svg.style.display = "";
    show("Reader");
    layout();
    readerText.style.transition = "none";
    R.active = -1;
    readerUpdate();
    void readerText.offsetHeight;
    readerText.style.transition = "";
    readerStats();
    focusInput();
  }

  // активное слово, подсказки и плавная прокрутка
  function readerUpdate() {
    let paraChanged = false;
    const pi = R.paraOf[R.pos] ?? R.paras.length - 1;
    if (pi !== R.para) {
      R.para = pi;
      paraChanged = true;
      speakParagraph(pi);
    }
    const idx = R.wordOf[R.pos] ?? R.words.length - 1;
    if (idx !== R.active) {
      R.words.forEach((w, j) => {
        w.el.classList.toggle("done", j < idx);
        w.el.classList.toggle("active", j === idx);
      });
      R.active = idx;
      readerScroll();
      if (R.pos > 0) saveBookProgress(R.key, R.pos);
    }
    R.chars.forEach((c) => c.classList.remove("cur"));
    if (R.chars[R.pos]) R.chars[R.pos].classList.add("cur");
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
    const k = norm(R.text[R.pos] || "");
    if (keyEls[k]) keyEls[k].classList.add("target");
    setTarget(k);
    return paraChanged;
  }

  // держим строку с активным словом второй сверху; сдвиг — CSS transition на transform
  function readerScroll() {
    const w = R.words[R.active];
    if (!w) return;
    const lh = parseFloat(getComputedStyle(readerText).lineHeight) || 40;
    const y = Math.max(0, w.el.offsetTop - lh * 1.1);
    if (Math.abs(y - R.scrollY) < 2) return;
    R.scrollY = y;
    readerText.style.transform = `translateY(${-y}px)`;
  }

  function readerStats() {
    const mins = R.startT ? (performance.now() - R.startT) / 60000 : 0;
    $("rdWpm").textContent = mins > 0.05 ? Math.round(R.correct / mins) : 0;
    $("rdAcc").textContent = R.typed ? Math.round((R.correct / R.typed) * 100) : 100;
    $("rdBar").style.width = (R.pos / R.text.length) * 100 + "%";
  }

  function readerChar(ch) {
    if (!R || R.finished) return;
    if (!R.startT) R.startT = performance.now();
    const want = R.text[R.pos];
    const k = norm(ch);
    R.typed++;
    if (k === norm(want)) {
      R.correct++;
      R.chars[R.pos].classList.remove("bad");
      R.chars[R.pos].classList.add("ok");
      flashKey(norm(want), "hit");
      strike(norm(want), "hit");
      sfx.key();
      R.pos++;
      if (R.pos >= R.text.length) return readerFinish();
      const paraChanged = readerUpdate();
      if (want === " " && !paraChanged) speakWord(R.active);
    } else {
      R.chars[R.pos].classList.add("bad");
      const wEl = R.words[R.active].el;
      wEl.classList.remove("shake-w");
      void wEl.offsetWidth;
      wEl.classList.add("shake-w");
      flashKey(k, "miss");
      strike(k, "err");
      sfx.err();
    }
    readerStats();
  }

  function readerKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1) {
      e.preventDefault();
      readerChar(e.key);
    } else if (e.key === "Tab") {
      e.preventDefault();
      speakSentence();
    } else if (e.key === "Escape") {
      openChapters();
    }
  }

  // текущее предложение — от последней точки/вопроса до следующей
  // ---- озвучка читалки: абзац перед набором, слово после пробела ----
  let rdVoice = store.get("tl_rdvoice") !== "0";
  $("rdVoice").checked = rdVoice;
  $("rdVoice").onchange = (e) => {
    rdVoice = e.target.checked;
    store.set("tl_rdvoice", rdVoice ? "1" : "0");
    if (!rdVoice) rdStopVoice();
  };
  let spokenEl = null;
  function markSpoken(el) {
    if (spokenEl) spokenEl.classList.remove("spoken");
    spokenEl = el;
    if (el) el.classList.add("spoken");
  }
  function rdStopVoice() {
    if (tts) tts.cancel();
    markSpoken(null);
    $("rdSpeak").classList.remove("speaking");
  }
  function rdSay(text, rate, onBoundary) {
    if (!tts || !text) return;
    tts.cancel();                      // новое слово/абзац прерывает предыдущую речь мгновенно
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (enVoice) u.voice = enVoice;
    u.rate = 1;
    u.pitch = 1;
    const btn = $("rdSpeak");
    u.onstart = () => btn.classList.add("speaking");
    u.onend = u.onerror = () => { btn.classList.remove("speaking"); markSpoken(null); };
    if (onBoundary) u.onboundary = onBoundary;
    tts.speak(u);
  }
  // весь абзац; слово, которое сейчас звучит, подсвечивается в тексте
  function speakParagraph(pi) {
    if (!rdVoice || !R) return;
    const start = R.paraStart[pi];
    const r = R;
    rdSay(R.paras[pi], 1, (e) => {
      if (e.name && e.name !== "word") return;
      if (R !== r) return;
      const w = R.words[R.wordOf[start + e.charIndex]];
      markSpoken(w && !w.el.classList.contains("active") ? w.el : null);
    });
  }
  // одно слово без знаков препинания
  function speakWord(wi) {
    if (!rdVoice || !R || !R.words[wi]) return;
    const w = R.words[wi];
    const word = R.text.slice(w.start, w.end).replace(/[^A-Za-z']/g, "");
    markSpoken(null);
    rdSay(word, 1);
  }

  function speakSentence() {
    if (!R) return;
    const t = R.text;
    let s = R.pos;
    while (s > 0 && !/[.?]/.test(t[s - 1])) s--;
    let e = R.pos;
    while (e < t.length && !/[.?]/.test(t[e])) e++;
    const sentence = t.slice(s, e + 1).trim();
    if (!tts || !sentence) return;
    tts.cancel();
    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = "en-US";
    if (enVoice) u.voice = enVoice;
    u.rate = 1;
    u.pitch = 1;
    const btn = $("rdSpeak");
    u.onstart = () => btn.classList.add("speaking");
    u.onend = u.onerror = () => btn.classList.remove("speaking");
    tts.speak(u);
  }

  function readerFinish() {
    R.finished = true;
    rdStopVoice();
    readerStats();
    R.words.forEach((w) => { w.el.classList.add("done"); w.el.classList.remove("active"); });
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
    setTarget(null);
    saveBookProgress(R.key, "done");
    sfx.end();
    const mins = R.startT ? (performance.now() - R.startT) / 60000 : 0;
    $("rdDoneWpm").textContent = mins ? Math.round(R.correct / mins) : 0;
    $("rdDoneAcc").textContent = (R.typed ? Math.round((R.correct / R.typed) * 100) : 100) + "%";
    $("rdDoneWords").textContent = R.words.length;
    const ch = R.book.chapters[R.chIdx];
    $("rdDoneSub").textContent = `${R.book.title} · ${ch.title}`;
    const hasNext = R.chIdx < R.book.chapters.length - 1;
    $("rdNext").style.display = hasNext ? "" : "none";
    $("rdDone").classList.remove("hidden");
  }

  function openChapters() {
    if (R) currentBook = R.book;
    openBooks();
  }

  $("btnBooks").onclick = openBooks;
  $("btnBooksBack").onclick = () => show("Menu");
  $("btnReaderBack").onclick = openChapters;
  $("rdToBooks").onclick = openChapters;
  $("rdNext").onclick = () => {
    openChapter(R.book, R.chIdx + 1);
  };
  $("rdSpeak").onclick = (e) => { e.stopPropagation(); speakSentence(); };
  $("rdHints").onchange = (e) => {
    if (!R) return;
    R.cfg.fingerHint = e.target.checked;
    kbEl.classList.toggle("kb-plain", !R.cfg.fingerHint);
    setTarget(norm(R.text[R.pos] || ""));
  };
  readerView.addEventListener("click", focusInput);
  window.addEventListener("resize", () => {
    if (R && !$("screenReader").classList.contains("hidden")) { layout(); R.scrollY = -1; readerScroll(); }
  });

  // ---------- Словарь: топ-1000 слов ----------
  const VC_BLOCK = 50;                   // слова разбиты на блоки по частоте: 1–50, 51–100, …
  const VC_SESSION = 10;                 // слов за одну тренировку
  let V = null;                          // состояние тренировки (руки читают его через G)
  let vcBlock = +(store.get("tl_vc_block") || 0);
  let vcMode = store.get("tl_vc_mode") || "ru";
  let vcTab = "train";
  let vcLevel = +(store.get("tl_vc_level") || 1);
  const vcStats = () => JSON.parse(store.get("tl_vocab") || "{}");   // слово → [верно, ошибок, выучено]
  function vcRecord(word, ok, learned) {
    const s = vcStats();
    const r = s[word] || [0, 0, 0];
    if (ok) r[0]++; else r[1]++;
    if (learned) r[2] = 1;
    s[word] = r;
    store.set("tl_vocab", JSON.stringify(s));
  }
  function vcExampleHtml(w, ex, exRu) {
    const re = new RegExp("(^|[^A-Za-z'])(" + w.replace(/'/g, "'") + "[a-z]*)", "i");
    const m = re.exec(ex);
    let en = esc(ex);
    if (m) {
      const at = m.index + m[1].length;
      en = esc(ex.slice(0, at)) + '<mark class="vc-target">' + esc(m[2]) + "</mark>" + esc(ex.slice(at + m[2].length));
    }
    return `<div class="vc-example">
        <span class="vc-ex-label">Пример</span>
        <div class="vc-ex-en">${en}</div>
        ${exRu ? `<div class="vc-ex-ru">${esc(exRu)}</div>` : ""}
        <div class="vc-ex-bar">
          <select class="vc-ex-voice" aria-label="Голос для примера">${exVoiceOptions()}</select>
          <button type="button" class="vc-ex-play" data-ex="${esc(ex)}" aria-label="Прослушать пример">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><span>Play</span>
          </button>
        </div>
        ${exVoiceNote()}
      </div>`;
  }

  // ----- голоса для примеров (отдельно от голоса слова) -----
  const FEMALE = /female|google us english|zira|aria|jenny|samantha|susan|hazel|libby|sonia|emma|ava|allison|karen|moira|tessa|fiona|victoria|kate|serena|michelle|natasha|clara|joanna|salli|kimberly|ivy|amy|olivia|ana\b|catherine|heera|veena|linda|heather|eva/i;
  const MALE = /\bmale|david|mark|guy|ryan|daniel|alex\b|fred|george|thomas|christopher|eric|roger|steffan|brian|andrew|matthew|joey|justin|russell|james|william|liam|richard|ravi|sean|aaron|arthur|oliver|rishi/i;
  const voiceKind = (v) => (FEMALE.test(v.name) && !/\bmale\b/i.test(v.name) ? "female" : MALE.test(v.name) ? "male" : "other");
  function exVoices() {
    const all = usVoices();
    // голос слова исключаем, только если американских голосов достаточно
    const list = all.length > 3 && enVoice ? all.filter((v) => v.name !== enVoice.name) : all;
    const g = { male: [], female: [], other: [], foreign: [], usCount: all.length };
    list.forEach((v) => g[voiceKind(v)].push(v));
    // мало US-голосов (часто в Chrome на русской Windows) — добавляем другие английские акценты отдельной группой
    if (all.length < 3 && window.speechSynthesis) {
      g.foreign = speechSynthesis.getVoices()
        .filter((v) => /^en/i.test(v.lang) && !isUS(v) && !NOVELTY.test(v.name))
        .sort((x, y) => voiceScore(y) - voiceScore(x));
    }
    return g;
  }
  function exVoiceNote() {
    const n = usVoices().length;
    if (n >= 3) return "";
    return `<div class="vc-ex-note">В этом браузере ${n ? "только " + n + " американск" + (n === 1 ? "ий голос" : "их голоса") : "нет американских голосов"}.
      Больше естественных US-голосов (мужских и женских) есть в Microsoft Edge.</div>`;
  }
  let exVoiceSel = store.get("tl_ex_voice") || "";
  let exVoicesSig = "";
  const voicesSig = () => usVoices().map((v) => v.name).join("|") + "#" + (enVoice ? enVoice.name : "");
  function findExVoice(sel) {
    if (!sel || !window.speechSynthesis) return null;
    const name = sel.startsWith("v:") ? null : sel;
    return speechSynthesis.getVoices().find((x) => (name ? x.name === name : x.voiceURI === sel.slice(2))) || null;
  }
  // американский английский: en-US (в некоторых браузерах en_US)
  function isUS(v) { return /^en[-_]us/i.test(v.lang); }
  // «весёлые» и роботизированные голоса macOS/Linux с искажённым тоном — не используем
  const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|princess|junior|ralph|fred|kathy|eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley|espeak|mbrola|robot|\bana\b/i;   // Ana (Microsoft) — детский голос
  // чем выше балл, тем естественнее голос
  function voiceScore(v) {
    const n = v.name;
    if (/Natural|Neural|Online/i.test(n)) return 5;                         // нейронные голоса Microsoft (Edge)
    if (/Premium|Enhanced/i.test(n)) return 4;                              // улучшенные голоса Apple
    if (/Google US English/i.test(n)) return 4;                             // Google (Chrome)
    if (/Samantha|Alex|Ava|Allison|Susan|Tom|Nicky|Evan|Joelle|Nathan|Noelle|Zoe/i.test(n)) return 3; // стандартные Apple
    if (/Zira|David|Mark|Aria|Jenny|Guy/i.test(n)) return 2;                // системные Microsoft
    return 1;
  }
  function usVoices() {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    return vs.filter((v) => isUS(v) && !NOVELTY.test(v.name)).sort((x, y) => voiceScore(y) - voiceScore(x));
  }
  function exVoiceOptions() {
    const g = exVoices();
    const opt = (val, label) => `<option value="${esc(val)}"${val === exVoiceSel ? " selected" : ""}>${esc(label)}</option>`;
    exVoicesSig = voicesSig();
    const short = (v) => v.name.replace(/^(Microsoft|Google)\s+/i, "").replace(/\s*-\s*English.*$/i, "").replace(/\s*Online.*$/i, "") + " · " + v.lang;
    let n = 0;
    const tag = { male: " (Male)", female: " (Female)", other: "" };
    // пустые группы не выводим — иначе в списке видны «заголовки без голосов»
    const group = (label, list) => {
      if (!list.length) return "";
      return `<optgroup label="${label}">` +
        list.map((v) => opt(v.name, `Voice ${++n}${tag[voiceKind(v)]} — ${short(v)}`)).join("") + "</optgroup>";
    };
    const html = group("Мужские голоса (US)", g.male) + group("Женские голоса (US)", g.female) +
      group("Другие голоса (US)", g.other) + group("Другие акценты (не US)", g.foreign);
    return html || '<option value="">Голос по умолчанию</option>';
  }
  function playExample(text, btn) {
    if (!tts || !text) return;
    tts.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    u.pitch = 1;
    const selEl = btn.closest(".vc-example") && btn.closest(".vc-example").querySelector(".vc-ex-voice");
    const sel = selEl ? selEl.value : exVoiceSel;
    const v = findExVoice(sel) || usVoices()[0] || enVoice || null;
    if (v) { u.voice = v; u.lang = v.lang; }     // голос назначается до speak()
    btn.classList.add("playing");
    u.onend = u.onerror = () => btn.classList.remove("playing");
    tts.speak(u);
  }
  // делегирование: блок примера пересоздаётся для каждого слова
  $("vcFeedback").addEventListener("click", (e) => {
    const b = e.target.closest(".vc-ex-play");
    if (!b) return;
    e.stopPropagation();
    b.blur();                                // чтобы набор продолжал работать
    playExample(b.dataset.ex, b);
  });
  ["mousedown", "click", "pointerdown"].forEach((t) =>
    $("vcFeedback").addEventListener(t, (e) => { if (e.target.closest(".vc-ex-voice")) e.stopPropagation(); }));
  $("vcFeedback").addEventListener("input", (e) => {
    if (!e.target.classList.contains("vc-ex-voice")) return;
    exVoiceSel = e.target.value;
    store.set("tl_ex_voice", exVoiceSel);
  });
  $("vcFeedback").addEventListener("change", (e) => {
    if (!e.target.classList.contains("vc-ex-voice")) return;
    exVoiceSel = e.target.value;
    store.set("tl_ex_voice", exVoiceSel);
  });
  // клавиши в селекторе не должны попадать в тренажёр
  $("vcFeedback").addEventListener("keydown", (e) => { if (e.target.tagName === "SELECT") e.stopPropagation(); });
  if (window.speechSynthesis) speechSynthesis.addEventListener("voiceschanged", () => {
    if (voicesSig() === exVoicesSig) return;
    document.querySelectorAll(".vc-ex-voice").forEach((s) => {
      if (document.activeElement === s) return;
      s.innerHTML = exVoiceOptions();
    });
  });
  const vcStatus = (s, w) => (s[w] && s[w][2] ? "learned" : s[w] ? "seen" : "new");
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function vcHeader() {
    const s = vcStats();
    const learned = VOCAB.filter(([w]) => s[w] && s[w][2]).length;
    let right = 0, wrong = 0;
    Object.values(s).forEach((r) => { right += r[0]; wrong += r[1]; });
    $("vcLearned").textContent = learned;
    $("vcPracticed").textContent = VOCAB.filter(([w]) => s[w] && s[w][3]).length;
    document.querySelectorAll(".vc-level").forEach((b) => {
      const on = +b.dataset.level === vcLevel;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on);
    });
    $("vcModes").classList.toggle("hidden", vcLevel !== 2);
    $("vcHint").classList.toggle("hidden", vcLevel !== 2);
    $("vcCheck").classList.toggle("hidden", vcLevel !== 2);
    $("vcSkip").textContent = vcLevel === 1 ? "Пропустить →" : "Не знаю";
    $("vcPrev").classList.toggle("hidden", vcLevel !== 1);
    $("vcTotal").textContent = VOCAB.length;
    $("vcRight").textContent = right;
    $("vcWrong").textContent = wrong;
    $("vcBar").style.width = (learned / VOCAB.length) * 100 + "%";
    const blocks = Math.ceil(VOCAB.length / VC_BLOCK);
    let html = "";
    for (let b = 0; b < blocks; b++) {
      const part = VOCAB.slice(b * VC_BLOCK, (b + 1) * VC_BLOCK);
      const done = part.filter(([w]) => s[w] && s[w][2]).length;
      const pct = Math.round((done / part.length) * 100);
      html += `<button class="vc-block${b === vcBlock ? " sel" : ""}${done === part.length ? " full" : ""}" data-b="${b}" style="--p:${pct}%">
        <b>${b * VC_BLOCK + 1}–${b * VC_BLOCK + part.length}</b><span>${done}/${part.length}</span></button>`;
    }
    $("vcBlocks").innerHTML = html;
    $("vcBlocks").querySelectorAll(".vc-block").forEach((el) => {
      el.onclick = () => {
        vcBlock = +el.dataset.b;
        store.set("tl_vc_block", vcBlock);
        vcTab === "train" ? vcStartSession() : vcRenderList();
        vcHeader();
      };
    });
    document.querySelectorAll("input[name=vcMode]").forEach((r) => (r.checked = r.value === vcMode));
  }

  function openVocab() {
    stopSpeech();
    R = null;
    $("vcKbSlot").appendChild($("kbWrap"));
    kbEl.classList.remove("kb-hide", "kb-plain");
    svg.style.display = "";
    show("Vocab");
    vcHeader();
    vcSetTab(vcTab);
    layout();
  }

  function vcSetTab(t) {
    vcTab = t;
    document.querySelectorAll(".vc-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === t));
    $("vcTrain").classList.toggle("hidden", t !== "train");
    $("vcList").classList.toggle("hidden", t !== "list");
    if (t === "train") { vcStartSession(); layout(); }
    else { G = null; V = null; vcRenderList(); }
  }

  // ----- тренировка -----
  function vcStartSession() {
    vcLevel === 1 ? vcStartLearn() : vcStartRecall();
  }

  // ----- Уровень 1: обучение и ввод — слово, транскрипция и перевод видны, слово звучит -----
  const l1Pos = () => JSON.parse(store.get("tl_vc_l1") || "{}");     // блок → с какого слова продолжить
  function vcPractice(word) {
    const s = vcStats();
    const r = s[word] || [0, 0, 0, 0];
    r[3] = (r[3] || 0) + 1;
    s[word] = r;
    store.set("tl_vocab", JSON.stringify(s));
  }
  function vcStartLearn() {
    const blockLen = VOCAB.slice(vcBlock * VC_BLOCK, (vcBlock + 1) * VC_BLOCK).length;
    let start = l1Pos()[vcBlock] || 0;
    if (start >= blockLen) start = 0;
    V = {
      level: 1, cfg: { hands: true, fingerHint: true, keyHint: true },
      idx: vcBlock * VC_BLOCK + start, pos: 0, phase: "input", streak: 0, timer: 0
    };
    G = V;
    $("vcDone").classList.add("hidden");
    vcShowLearn(false);
  }
  function vcShowLearn(animate, back) {
    const [w, ipa, ru, ex, exRu] = VOCAB[V.idx];
    const card = $("vcCard");
    const fill = () => {
      V.word = w;
      V.pos = 0;
      V.phase = "input";
      const first = vcBlock * VC_BLOCK;
      const blockLen = VOCAB.slice(first, first + VC_BLOCK).length;
      $("vcCounter").textContent = `Слово ${V.idx - first + 1} из ${blockLen} · блок ${first + 1}–${first + blockLen}`;
      $("vcSession").textContent = `Подряд: ${V.streak}`;
      $("vcPrompt").className = "vc-prompt vc-word";
      $("vcPrompt").innerHTML = [...w].map((c) => `<span class="lt">${esc(c)}</span>`).join("");
      $("vcSub").innerHTML = `<span class="vc-ipa big">${esc(ipa)}</span><span class="vc-ru-big">${esc(ru)}</span>`;
      $("vcSlots").innerHTML = "";
      $("vcFeedback").innerHTML = vcExampleHtml(w, ex, exRu);
      card.classList.remove("ok", "bad");
      $("vcPrev").disabled = V.idx === 0;
      vcL1Cursor();
      speak(w);                               // автоозвучка при открытии карточки
    };
    if (!animate) return fill();
    const out = back ? "vc-out-back" : "vc-out", inn = back ? "vc-in-back" : "vc-in";
    card.classList.add(out);
    setTimeout(() => {
      fill();
      card.classList.remove(out);
      card.classList.add(inn);
      setTimeout(() => card.classList.remove(inn), 320);
    }, 220);
  }
  function vcL1Cursor() {
    $("vcPrompt").querySelectorAll(".lt").forEach((el, i) => {
      el.classList.toggle("ok", i < V.pos);
      el.classList.toggle("cur", i === V.pos && V.phase === "input");
    });
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
    const k = V.phase === "input" ? norm(V.word[V.pos] || "") : "";
    if (keyEls[k]) keyEls[k].classList.add("target");
    setTarget(k || null);
  }
  function vcL1Type(ch) {
    if (!V || V.level !== 1 || V.phase !== "input") return;
    const k = norm(ch);
    if (k === norm(V.word[V.pos])) {
      flashKey(k, "hit");
      strike(k, "hit");
      sfx.key();
      V.pos++;
      if (V.pos >= V.word.length) return vcL1Done();
      vcL1Cursor();
    } else {
      V.streak = 0;
      flashKey(k, "miss");
      strike(k, "err");
      sfx.err();
      const el = $("vcPrompt").querySelectorAll(".lt")[V.pos];
      el.classList.remove("bad");
      void el.offsetWidth;
      el.classList.add("bad");
    }
  }
  function vcL1Done() {
    V.phase = "result";
    V.streak++;
    vcL1Cursor();
    $("vcCard").classList.add("ok");
    sfx.done();
    vcPractice(V.word);
    V.timer = setTimeout(vcL1Next, 650);     // автопереход к следующему слову по цепочке
  }
  function vcL1Next() {
    clearTimeout(V.timer);
    V.idx = (V.idx + 1) % VOCAB.length;
    const b = Math.floor(V.idx / VC_BLOCK);
    const p = l1Pos();
    p[vcBlock] = V.idx - vcBlock * VC_BLOCK;  // при переходе в новый блок старый помечается пройденным
    if (b !== vcBlock) { vcBlock = b; store.set("tl_vc_block", b); }
    p[vcBlock] = V.idx - vcBlock * VC_BLOCK;
    store.set("tl_vc_l1", JSON.stringify(p));
    vcHeader();
    vcShowLearn(true);
  }

  // к предыдущему слову (через границу блока — тоже)
  function vcL1Prev() {
    if (!V || V.level !== 1 || V.idx === 0) return;
    clearTimeout(V.timer);
    V.idx--;
    const b = Math.floor(V.idx / VC_BLOCK);
    if (b !== vcBlock) { vcBlock = b; store.set("tl_vc_block", b); }
    const p = l1Pos();
    p[vcBlock] = V.idx - vcBlock * VC_BLOCK;
    store.set("tl_vc_l1", JSON.stringify(p));
    vcHeader();
    vcShowLearn(true, true);
  }

  // ----- Уровень 2: проверка по памяти -----
  function vcStartRecall() {
    const s = vcStats();
    const part = VOCAB.slice(vcBlock * VC_BLOCK, (vcBlock + 1) * VC_BLOCK);
    const fresh = shuffle(part.filter(([w]) => !(s[w] && s[w][2])));
    const known = shuffle(part.filter(([w]) => s[w] && s[w][2]));
    const queue = [...fresh, ...known].slice(0, VC_SESSION);
    V = {
      level: 2, cfg: { hands: true, fingerHint: false, keyHint: true },
      queue, idx: 0, total: queue.length, typed: "", hinted: false, phase: "input",
      right: 0, wrong: 0, mistakes: [], requeued: new Set(), timer: 0
    };
    G = V;
    $("vcDone").classList.add("hidden");
    vcShowWord();
  }

  function vcShowWord() {
    clearTimeout(V.timer);
    const [w, ipa, ru] = V.queue[V.idx];
    V.word = w;
    V.typed = "";
    V.hinted = false;
    V.phase = "input";
    $("vcCounter").textContent = `Слово ${Math.min(V.idx + 1, V.queue.length)} из ${V.queue.length}`;
    $("vcSession").textContent = `✔ ${V.right}  ✘ ${V.wrong}`;
    if (vcMode === "ru") {
      $("vcPrompt").textContent = ru;
      $("vcSub").textContent = `${w.length} ${w.length === 1 ? "буква" : w.length < 5 ? "буквы" : "букв"}`;
    } else {
      $("vcPrompt").textContent = ipa;
      $("vcSub").textContent = "Напиши слово по транскрипции";
    }
    $("vcPrompt").className = "vc-prompt" + (vcMode === "ipa" ? " ipa" : "");
    $("vcFeedback").innerHTML = "";
    $("vcCard").classList.remove("ok", "bad");
    $("vcCheck").textContent = "Проверить ⏎";
    vcClearKeys();
    vcRenderSlots();
  }

  function vcRenderSlots(state) {
    const w = V.word, t = V.typed;
    const n = Math.max(w.length, t.length);
    let html = "";
    for (let i = 0; i < n; i++) {
      const c = t[i] || "";
      let cls = "vc-slot";
      if (i === t.length && V.phase === "input") cls += " cur";
      if (i >= w.length) cls += " extra";
      if (state === "ok") cls += " ok";
      if (state === "bad") cls += c && c.toLowerCase() === (w[i] || "").toLowerCase() ? " ok" : " bad";
      html += `<span class="${cls}">${esc(c)}</span>`;
    }
    $("vcSlots").innerHTML = html;
  }

  function vcClearKeys() {
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
    setTarget(null);
  }

  function vcType(ch) {
    if (V && V.level === 1) return vcL1Type(ch);
    if (!V || V.phase !== "input") return;
    if (!/^[a-zA-Z']$/.test(ch)) return;
    if (V.typed.length >= V.word.length + 4) return;
    V.typed += ch;
    const k = norm(ch);
    flashKey(k, "hit");
    strike(k, "hit");
    sfx.key();
    Object.values(keyEls).forEach((e) => e.classList.remove("target"));
    setTarget(null);
    vcRenderSlots();
  }

  function vcBackspace() {
    if (!V || V.phase !== "input" || !V.typed) return;
    V.typed = V.typed.slice(0, -1);
    vcRenderSlots();
  }

  // подсказка: стираем неверный хвост и подсвечиваем следующую клавишу и палец
  function vcHint() {
    if (!V || V.phase !== "input") return;
    const w = V.word.toLowerCase();
    let p = 0;
    while (p < V.typed.length && V.typed[p].toLowerCase() === w[p]) p++;
    V.typed = V.typed.slice(0, p);
    vcRenderSlots();
    if (p >= w.length) return;
    V.hinted = true;
    const k = norm(w[p]);
    Object.values(keyEls).forEach((el) => el.classList.remove("target"));
    if (keyEls[k]) keyEls[k].classList.add("target");
    V.cfg.fingerHint = true;
    setTarget(k);
    V.cfg.fingerHint = false;
  }

  function vcCheck(skip) {
    if (!V) return;
    if (V.phase === "result") return vcNext();
    if (!skip && !V.typed) return;
    const [w, ipa, ru, ex, exRu] = V.queue[V.idx];
    const ok = !skip && V.typed.toLowerCase() === w.toLowerCase();
    V.phase = "result";
    vcClearKeys();
    vcRecord(w, ok, ok && !V.hinted);
    const card = $("vcCard");
    if (ok) {
      V.right++;
      card.classList.add("ok");
      vcRenderSlots("ok");
      sfx.done();
      $("vcFeedback").innerHTML = `<div class="vc-ans ok">✓ Верно${V.hinted ? " (с подсказкой)" : ""}</div>`;
    } else {
      V.wrong++;
      V.mistakes.push(V.queue[V.idx]);
      card.classList.remove("bad");
      void card.offsetWidth;
      card.classList.add("bad");
      if (!V.typed) V.typed = "";
      vcRenderSlots("bad");
      sfx.err();
      // слово вернётся в конец тренировки один раз
      if (!V.requeued.has(w)) { V.requeued.add(w); V.queue.push(V.queue[V.idx]); }
      $("vcFeedback").innerHTML = `<div class="vc-ans bad">✘ ${skip ? "Пропущено" : "Неверно"}. Правильно: <b>${esc(w)}</b></div>`;
    }
    $("vcFeedback").innerHTML += `<div class="vc-info"><b>${esc(w)}</b> <span class="vc-ipa">${esc(ipa)}</span> — ${esc(ru)}</div>` + vcExampleHtml(w, ex, exRu);
    $("vcSession").textContent = `✔ ${V.right}  ✘ ${V.wrong}`;
    $("vcCheck").textContent = "Дальше ⏎";
    speak(w);
    vcHeader();
    if (ok) V.timer = setTimeout(vcNext, 1600);
  }

  function vcNext() {
    clearTimeout(V.timer);
    V.idx++;
    if (V.idx >= V.queue.length) return vcFinish();
    vcShowWord();
  }

  function vcFinish() {
    V.phase = "done";
    const total = V.right + V.wrong;
    $("vcDoneAcc").textContent = (total ? Math.round((V.right / total) * 100) : 0) + "%";
    $("vcDoneRight").textContent = V.right;
    $("vcDoneWrong").textContent = V.wrong;
    $("vcDoneList").innerHTML = V.mistakes.length
      ? V.mistakes.map(([w, ipa, ru]) => `<li><b>${esc(w)}</b> <span class="vc-ipa">${esc(ipa)}</span> — ${esc(ru)}</li>`).join("")
      : `<li class="text-slate-500">Ошибок нет — отлично!</li>`;
    $("vcDone").classList.remove("hidden");
    sfx.end();
  }

  function vocabKey(e) {
    if (e.target && e.target.id === "vcSearch") return;      // поиск в списке — обычный ввод
    if (vcTab !== "train" || !V || V.phase === "done") return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (V.level === 1) {
      if (e.key === "Tab") { e.preventDefault(); speak(V.word); }
      else if (e.key === "Escape" || e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); vcL1Next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); vcL1Prev(); }
      else if (e.key.length === 1) { e.preventDefault(); vcL1Type(e.key); }
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); vcCheck(); }
    else if (e.key === "Backspace") { e.preventDefault(); vcBackspace(); }
    else if (e.key === "Tab") { e.preventDefault(); speak(V.word); }
    else if (e.key === "Escape") { e.preventDefault(); vcCheck(true); }
    else if (e.key.length === 1) { e.preventDefault(); vcType(e.key); }
  }

  // ----- список слов -----
  function vcRenderList() {
    const s = vcStats();
    const q = $("vcSearch").value.trim().toLowerCase();
    let rows = VOCAB.map((r, i) => [i, r]);
    rows = q
      ? rows.filter(([, [w, , ru]]) => w.toLowerCase().includes(q) || ru.toLowerCase().includes(q)).slice(0, 100)
      : rows.slice(vcBlock * VC_BLOCK, (vcBlock + 1) * VC_BLOCK);
    $("vcListTitle").textContent = q ? `Найдено: ${rows.length}${rows.length === 100 ? "+" : ""}` : `Слова ${vcBlock * VC_BLOCK + 1}–${vcBlock * VC_BLOCK + rows.length}`;
    $("vcTable").innerHTML = rows.map(([i, [w, ipa, ru, ex, exRu]]) => `
      <div class="vc-row ${vcStatus(s, w)}" data-w="${esc(w)}" title="Нажми, чтобы послушать">
        <span class="vc-n">${i + 1}</span>
        <span class="vc-dot"></span>
        <span class="vc-w"><b>${esc(w)}</b><span class="vc-ipa">${esc(ipa)}</span></span>
        <span class="vc-ru">${esc(ru)}<span class="vc-ex">${esc(ex)} — ${esc(exRu || "")}</span></span>
        <span class="vc-play">🔈</span>
      </div>`).join("") || `<p class="text-slate-500 p-4">Ничего не найдено.</p>`;
    $("vcTable").querySelectorAll(".vc-row").forEach((el) => (el.onclick = () => speak(el.dataset.w)));
  }

  $("btnVocab").onclick = openVocab;
  const leaveAll = () => { if (V) clearTimeout(V.timer); V = null; toMenu(); };
  $("navGame").onclick = leaveAll;
  $("navBooks").onclick = () => { leaveAll(); openBooks(); };
  $("navVocab").onclick = () => { leaveAll(); openVocab(); };
  $("vcBack").onclick = () => { G = null; V = null; show("Menu"); };
  document.querySelectorAll(".vc-tab").forEach((b) => (b.onclick = () => vcSetTab(b.dataset.tab)));
  document.querySelectorAll("input[name=vcMode]").forEach((r) => (r.onchange = () => {
    vcMode = r.value;
    store.set("tl_vc_mode", vcMode);
    if (V && V.level === 2 && V.phase === "input") vcShowWord();
  }));
  $("vcCheck").onclick = () => vcCheck();
  $("vcPrev").onclick = (e) => { e.currentTarget.blur(); vcL1Prev(); };
  $("vcSkip").onclick = () => (V && V.level === 1 ? vcL1Next() : vcCheck(true));
  document.querySelectorAll(".vc-level").forEach((b) => (b.onclick = () => {
    if (V) clearTimeout(V.timer);
    vcLevel = +b.dataset.level;
    store.set("tl_vc_level", vcLevel);
    vcHeader();
    vcSetTab("train");
  }));
  $("vcHint").onclick = vcHint;
  $("vcSpeak").onclick = (e) => { e.stopPropagation(); if (V) speak(V.word); };
  $("vcAgain").onclick = vcStartSession;
  $("vcToList").onclick = () => { $("vcDone").classList.add("hidden"); vcSetTab("list"); };
  $("vcSearch").addEventListener("input", vcRenderList);
  $("vcCard").addEventListener("click", (e) => { if (!e.target.closest("select, button")) focusInput(); });

  // ---------- События ----------
  window.addEventListener("keydown", (e) => {
    if (!$("screenVocab").classList.contains("hidden")) return vocabKey(e);
    if (R && !$("screenReader").classList.contains("hidden")) return readerKey(e);
    if (!G || $("screenGame").classList.contains("hidden")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length === 1) {
      e.preventDefault();
      onChar(e.key);
    } else if (e.key === "Tab") {
      e.preventDefault();
      speak(G.text);
    } else if (e.key === "Escape") {
      toMenu();
    }
  });

  // мобильный ввод
  const mi = $("mobileInput");
  mi.addEventListener("input", () => {
    [...mi.value].forEach((c) => {
      if (!$("screenVocab").classList.contains("hidden")) vcType(c);
      else if (R && !$("screenReader").classList.contains("hidden")) readerChar(c);
      else onChar(c);
    });
    mi.value = "";
  });
  function focusInput() {
    if (matchMedia("(pointer: coarse)").matches) mi.focus();
  }
  $("phraseCard").addEventListener("click", focusInput);

  // ---------- Озвучка (Web Speech API, en-US) ----------
  const tts = window.speechSynthesis;
  let enVoice = null;
  function pickVoice() {
    const us = usVoices();
    enVoice = us.find((v) => /Aria|Jenny|Ava|Samantha|Google US/i.test(v.name)) || us[0] || null;
  }
  if (tts) {
    pickVoice();
    tts.addEventListener("voiceschanged", pickVoice);
  }
  let autoVoice = store.get("tl_voice") !== "0";
  $("autoVoice").checked = autoVoice;
  $("autoVoice").onchange = (e) => {
    autoVoice = e.target.checked;
    store.set("tl_voice", autoVoice ? "1" : "0");
  };

  function speak(text) {
    if (!tts || !text) return;
    tts.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (enVoice) u.voice = enVoice;
    u.rate = 1;
    u.pitch = 1;
    const btn = $("btnSpeak");
    u.onstart = () => btn.classList.add("speaking");
    u.onend = u.onerror = () => btn.classList.remove("speaking");
    tts.speak(u);
  }
  function stopSpeech() {
    if (tts) tts.cancel();
    $("btnSpeak").classList.remove("speaking");
  }
  // автоматически — при показе новой фразы (вызывается из loadPhrase)
  function autoSpeak(text) {
    if (!autoVoice) return;
    setTimeout(() => G && G.text === text && speak(text), 250);
  }
  $("btnSpeak").onclick = (e) => {
    e.stopPropagation();
    if (G) speak(G.text);
    focusInput();
  };

  function toMenu() {
    clearInterval(timerId);
    stopSpeech();
    G = null;
    show("Menu");
  }
  document.querySelectorAll(".level").forEach((b) => (b.onclick = () => startRound(b.dataset.level)));
  $("btnQuit").onclick = toMenu;
  $("btnMenu").onclick = toMenu;
  $("btnAgain").onclick = () => startRound(G.level);

  showBest();
})();
