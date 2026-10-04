/* =========================================================
   Abhinandha K — portfolio interactions
   No dependencies. Everything degrades: without JS the page
   is fully visible and static.
   ========================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var root = document.documentElement;

  /* ---------- split text ----------
     [data-split="words"] → each word in a masked box, rises on reveal.
     [data-split="chars"] → each character rises and un-blurs, staggered.
     Runs before the first sweep so the spans exist when .is-in lands. */
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var box = document.createElement("span"); box.className = "w";
      var inner = document.createElement("span"); inner.className = "w__i";
      inner.style.setProperty("--i", i); inner.textContent = w;
      box.appendChild(inner); el.appendChild(box);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  function splitChars(el) {
    var text = el.textContent; el.textContent = "";
    var k = 0;
    Array.prototype.forEach.call(text, function (ch) {
      if (ch === " ") { el.appendChild(document.createTextNode(" ")); return; }
      var s = document.createElement("span"); s.className = "c";
      s.style.setProperty("--i", k++); s.textContent = ch; el.appendChild(s);
    });
  }

  if (!reduced) {
    document.querySelectorAll('[data-split="words"]').forEach(splitWords);
    document.querySelectorAll('[data-split="chars"]').forEach(splitChars);
  }

  /* nav links: an original layer and a clone layer, char by char,
     so hover slides one out and the other in (the trionn nav) */
  document.querySelectorAll("[data-swap]").forEach(function (a) {
    var text = a.textContent.trim(); a.textContent = "";
    var word = document.createElement("span"); word.className = "nl__w";
    ["original", "clone"].forEach(function (kind) {
      var layer = document.createElement("span"); layer.className = "nl__l " + kind;
      if (kind === "clone") layer.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(text, function (ch, i) {
        var s = document.createElement("span"); s.className = "c-nav";
        s.style.setProperty("--i", i); s.textContent = ch; layer.appendChild(s);
      });
      word.appendChild(layer);
    });
    a.appendChild(word);
  });

  /* ---------- reveal sweep ----------
     Deterministic: driven by scroll/load/resize plus a bounded poll, so
     nothing is ever skipped the way an IntersectionObserver callback can be. */
  var pendingReveal = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function sweep() {
    var vh = window.innerHeight;
    var holdHero = root.classList.contains("is-loading");
    for (var i = pendingReveal.length - 1; i >= 0; i--) {
      if (holdHero && pendingReveal[i].closest(".hero")) continue;
      if (pendingReveal[i].getBoundingClientRect().top < vh * .92) {
        pendingReveal[i].classList.add("is-in");
        pendingReveal.splice(i, 1);
      }
    }
  }

  if (reduced) {
    pendingReveal.forEach(function (el) { el.classList.add("is-in"); });
    pendingReveal = [];
  }

  /* ---------- preloader: "hello" flies into the sticker ----------
     The letters bounce in on their own (CSS). Once fonts and the hero image
     are ready (1.2s at the latest) and the letters have landed, the word is
     measured against the sticker text beside "I'm" and transformed onto its
     centre, size and tilt. On arrival the flyer is removed and the sticker's
     box grows in around its text (.is-landed). sweep() holds the hero while
     html.is-loading is set. */
  var pl = document.getElementById("pl");
  var plWord = document.getElementById("plWord");
  var helloStarted = false;

  function leave() {
    if (!root.classList.contains("is-loading")) return;
    root.classList.remove("is-loading");          // scrollbar returns first, so the target is measured in its final place
    root.classList.add("is-leaving");
    var hi = document.getElementById("hi");
    var hiText = hi && hi.querySelector(".tag__t");
    if (plWord && hiText) {
      var a = plWord.getBoundingClientRect(), b = hiText.getBoundingClientRect();
      var s = hiText.offsetWidth / plWord.offsetWidth;
      var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      var rot = getComputedStyle(hi).getPropertyValue("--rot").trim() || "0deg";
      plWord.style.transition = "transform .9s cubic-bezier(.76, 0, .24, 1)";
      plWord.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) scale(" + s.toFixed(4) + ") rotate(" + rot + ")";
    }
    window.setTimeout(sweep, 380);
    window.setTimeout(function () {
      if (hi) hi.classList.add("is-landed");
      root.classList.remove("is-leaving");
      if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
    }, 920);
  }

  var plStart = Date.now();
  function sayHello() {
    if (helloStarted) return; helloStarted = true;
    // the five letters need ~1.2s to bounce in; then a short beat before the word flies
    window.setTimeout(leave, Math.max(250, 1550 - (Date.now() - plStart)));
  }

  if (root.classList.contains("is-loading")) {
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var heroImg = document.querySelector(".shot-card img");
    var imgReady = new Promise(function (res) {
      if (!heroImg || heroImg.complete) return res();
      heroImg.addEventListener("load", res); heroImg.addEventListener("error", res);
    });
    Promise.all([ready, imgReady]).then(sayHello);
    window.setTimeout(sayHello, 1200);
  } else if (pl && pl.parentNode) {
    pl.parentNode.removeChild(pl);
  }

  /* ---------- scroll: sticky nav, active link, sweep, parallax ---------- */
  var nav = document.getElementById("nav");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  var paras = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var leaners = Array.prototype.slice.call(document.querySelectorAll(".shot:not(.shot--flat) > .shot__frame, .feature__shot, .video"));
  var zones = Array.prototype.slice.call(document.querySelectorAll("[data-zone]"));
  var track = document.getElementById("track");
  var lastScroll = 0, boostTimer = null;

  function parallax() {
    if (reduced) return;
    var vh = window.innerHeight;
    leaners.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var centre = (r.top + r.height / 2 - vh / 2) / vh;        // -0.5 … 0.5 while on screen
      el.style.setProperty("--lean", (centre * 16).toFixed(2) + "deg");
    });
    paras.forEach(function (box) {
      var img = box.firstElementChild; if (!img) return;
      var r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var f = parseFloat(box.getAttribute("data-parallax")) || .1;
      var centre = (r.top + r.height / 2 - vh / 2) / vh;        // -1 … 1
      var progress = Math.min(1, Math.max(0, 1 - (r.top - vh * .15) / (vh * .7)));
      var scale = 1.06 - progress * .06;
      img.style.transform = "translateY(" + (-centre * f * 100).toFixed(1) + "px) scale(" + scale.toFixed(3) + ")";
    });
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-stuck", y > 20);

    var line = y + window.innerHeight * .35, current = -1;
    for (var i = 0; i < targets.length; i++) if (targets[i].offsetTop <= line) current = i;
    for (var j = 0; j < links.length; j++) links[j].classList.toggle("is-active", j === current);

    // page background morphs to the zone of the section under the reading line
    var zone = "a";
    for (var k = 0; k < zones.length; k++) {
      var z = zones[k].getAttribute("data-zone");
      if (z !== "foot" && zones[k].offsetTop <= line - window.innerHeight * .15) zone = z;   // the footer keeps the last section's colour
    }
    if (root.getAttribute("data-zone") !== zone) root.setAttribute("data-zone", zone);

    if (track) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      track.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    }

    parallax();
  }

  function boost() {
    if (reduced) return;
    root.classList.add("is-boost");
    window.clearTimeout(boostTimer);
    boostTimer = window.setTimeout(function () { root.classList.remove("is-boost"); }, 400);
  }

  // Everything here runs straight from the scroll event, throttled by time
  // rather than requestAnimationFrame: rAF is starved in background tabs and
  // headless runs, and a stuck "ticking" guard would freeze the zone colour,
  // progress bar and active nav link until the next frame finally fired.
  window.addEventListener("scroll", function () {
    if (pendingReveal.length) sweep();
    boost();
    var now = Date.now();
    if (now - lastScroll < 16) return;
    lastScroll = now;
    onScroll();
  }, { passive: true });

  onScroll(); sweep();
  window.addEventListener("load", function () { sweep(); onScroll(); });
  window.addEventListener("resize", function () { sweep(); onScroll(); }, { passive: true });

  var settle = window.setInterval(function () {
    sweep(); parallax();
    if (!pendingReveal.length) window.clearInterval(settle);
  }, 400);
  window.setTimeout(function () { window.clearInterval(settle); }, 8000);

  /* ---------- rotating words in the hero ---------- */
  var rot = document.getElementById("rot");
  if (rot && !reduced) {
    var words = Array.prototype.slice.call(rot.querySelectorAll(".rot__w"));
    var idx = 0;

    window.setInterval(function () {
      var cur = words[idx]; idx = (idx + 1) % words.length; var nxt = words[idx];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      nxt.classList.remove("is-out"); nxt.classList.add("is-on");
      window.setTimeout(function () { cur.classList.remove("is-out"); }, 800);
    }, 2600);
  }

  /* ---------- hero scene parallax ----------
     Two numbers (--mx, --my in -1..1) on the scene; CSS composes them per
     element, so the hello sticker and My-work tag slide by their own depth and the card tilts. */
  var scene = document.getElementById("scene");
  if (scene && fine && !reduced) {
    var sPending = false, sx = 0, sy = 0;
    window.addEventListener("pointermove", function (e) {
      if (window.scrollY > window.innerHeight) return;
      sx = (e.clientX / window.innerWidth) * 2 - 1;
      sy = (e.clientY / window.innerHeight) * 2 - 1;
      if (sPending) return;
      sPending = true;
      window.requestAnimationFrame(function () {
        sPending = false;
        scene.style.setProperty("--mx", sx.toFixed(3));
        scene.style.setProperty("--my", sy.toFixed(3));
      });
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      scene.style.setProperty("--mx", "0"); scene.style.setProperty("--my", "0");
    });
  }

  /* ---------- pointer tilt on screenshots, spotlight on cards ---------- */
  if (fine && !reduced) {
    document.querySelectorAll(".shot, .feature__shot, .tile, .card").forEach(function (box) {
      var MAX = box.classList.contains("card") ? 5 : 7;
      box.addEventListener("pointermove", function (e) {
        var r = box.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        box.style.setProperty("--px", (px * 100).toFixed(1) + "%");
        box.style.setProperty("--py", (py * 100).toFixed(1) + "%");
        box.style.transform = "perspective(1200px) rotateX(" + (-(py - .5) * MAX).toFixed(2) + "deg) rotateY(" +
                              ((px - .5) * MAX).toFixed(2) + "deg) translateY(-4px)";
      });
      box.addEventListener("pointerleave", function () { box.style.transform = ""; });
    });
  }

  /* ---------- custom cursor ---------- */
  var cur = document.getElementById("cur");
  var curLabel = document.getElementById("curLabel");

  if (cur && fine && !reduced) {
    root.classList.add("cur-on");
    var dot = cur.querySelector(".cur__dot"), ring = cur.querySelector(".cur__ring");
    var mx = -100, my = -100, rx = -100, ry = -100, moving = false;

    function loop() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      if (Math.abs(mx - rx) > .1 || Math.abs(my - ry) > .1) window.requestAnimationFrame(loop);
      else moving = false;
    }

    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
      cur.classList.add("is-live"); cur.classList.remove("is-off");
      if (!moving) { moving = true; window.requestAnimationFrame(loop); }

      var t = e.target.closest ? e.target.closest("[data-cursor], a, button, [data-shot]") : null;
      var label = t && t.getAttribute("data-cursor");
      if (!label && t) { var p = t.closest("[data-cursor]"); label = p && p.getAttribute("data-cursor"); }
      cur.classList.toggle("is-label", !!label);
      cur.classList.toggle("is-hover", !!t && !label);
      cur.classList.toggle("is-dark", !!(e.target.closest && e.target.closest(".foot")));
      if (curLabel && label) curLabel.textContent = label;
    }, { passive: true });

    window.addEventListener("pointerdown", function () { cur.classList.add("is-down"); });
    window.addEventListener("pointerup", function () { cur.classList.remove("is-down"); });
    document.addEventListener("pointerleave", function () { cur.classList.add("is-off"); });

    // An iframe swallows pointer events, so the drawn cursor used to freeze on
    // top of the player — a dead "PLAY" disc until you clicked again. Hide it
    // the moment the pointer crosses into one; the next move brings it back.
    document.addEventListener("pointerover", function (e) {
      if (e.target && e.target.tagName === "IFRAME") cur.classList.add("is-off");
    }, true);
    window.addEventListener("blur", function () { cur.classList.add("is-off"); });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduced) {
    document.querySelectorAll("[data-magnet]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * .22;
        var dy = (e.clientY - (r.top + r.height / 2)) * .22;
        b.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- side projects: expand / collapse ----------
     Collapsed bodies are inert, so their links and images stay out of the
     tab order until the card is opened. */
  document.querySelectorAll(".card__more").forEach(function (btn) {
    var card = btn.closest(".card");
    var body = document.getElementById(btn.getAttribute("aria-controls"));
    var label = btn.querySelector(".card__more-t");
    if (body) body.inert = true;
    btn.addEventListener("click", function () {
      var open = !card.classList.contains("is-open");
      card.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Show less" : "Read more";
      if (body) body.inert = !open;
    });
  });

  /* ---------- copy email ----------
     Clicking the address copies it: Clipboard API where available (localhost
     and https), a hidden textarea otherwise; a small pill above confirms. */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    var copyTip = copyBtn.querySelector(".copy__tip"), copyTimer = null;
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      function done(ok) {
        copyTip.textContent = ok ? "Copied!" : "Press Ctrl+C to copy";
        copyBtn.classList.add("is-copied");
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () { copyBtn.classList.remove("is-copied"); }, 1800);
      }
      function fallback() {
        var t = document.createElement("textarea");
        t.value = email; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(t);
        if (!ok) {                                   // leave the address selected so Ctrl+C works
          var range = document.createRange(), sel = window.getSelection();
          range.selectNodeContents(copyBtn.querySelector(".copy__addr"));
          sel.removeAllRanges(); sel.addRange(range);
        }
        done(ok);
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(email).then(function () { done(true); }, fallback);
      else fallback();
    });
  }

  /* ---------- screenshot lightbox ---------- */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbClose = document.getElementById("lbClose");
  var lastFocus = null;

  function openLb(img) {
    if (!lb || !lbImg) return;
    lastFocus = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbImg.hidden = false;
    if (lbDia) { lbDia.hidden = true; lbDia.innerHTML = ""; }
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    lbImg.removeAttribute("src");
    if (lbDia) { lbDia.hidden = true; lbDia.innerHTML = ""; }
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var lbDia = document.getElementById("lbDia");

  function openLbDia(svg) {
    if (!lb || !lbDia) return;
    lastFocus = document.activeElement;
    lbDia.innerHTML = "";
    lbDia.appendChild(svg.cloneNode(true));
    lbDia.hidden = false;
    if (lbImg) lbImg.hidden = true;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  // Diagrams sit small in the page; this is how they are read.
  document.querySelectorAll(".shot__frame--dia").forEach(function (box) {
    var svg = box.querySelector("svg.dia");
    if (!svg) return;
    box.setAttribute("tabindex", "0");
    box.setAttribute("role", "button");
    box.setAttribute("data-cursor", "Zoom");
    var title = svg.querySelector("title");
    box.setAttribute("aria-label", "Enlarge diagram" + (title ? ": " + title.textContent : ""));
    box.addEventListener("click", function () { openLbDia(svg); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLbDia(svg); }
    });
  });

  document.querySelectorAll("[data-shot] img").forEach(function (img) {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.addEventListener("click", function () { openLb(img); });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(img); }
    });
  });

  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "Tab") { e.preventDefault(); if (lbClose) lbClose.focus(); }
  });

  /* ---------- click-to-load embeds (must not load on page view) ----------
     Any [data-embed] with data-loom or data-youtube gets its iframe only
     when its play button is pressed. */
  document.querySelectorAll("[data-embed]").forEach(function (box) {
    var btn = box.querySelector(".video__play");
    if (!btn) return;

    // Warm the connection on intent, so the click isn't also paying for DNS + TLS.
    var warmed = false;
    function warm() {
      if (warmed) return; warmed = true;
      ["https://www.loom.com", "https://cdn.loom.com"].forEach(function (href) {
        var l = document.createElement("link");
        l.rel = "preconnect"; l.href = href; l.crossOrigin = "";
        document.head.appendChild(l);
      });
    }
    btn.addEventListener("pointerenter", warm);
    btn.addEventListener("focus", warm);

    btn.addEventListener("click", function () {
      var loom = box.getAttribute("data-loom"), yt = box.getAttribute("data-youtube"), src = null, href = null;
      if (loom) { src = "https://www.loom.com/embed/" + loom + "?autoplay=1"; href = "https://www.loom.com/share/" + loom; }
      else if (yt) { src = "https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&rel=0"; href = "https://youtu.be/" + yt; }
      if (!src) return;

      var frame = document.createElement("iframe");
      frame.src = src;
      frame.title = box.getAttribute("data-title") || "Video";
      frame.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      frame.setAttribute("allowfullscreen", "");

      // Loom's player takes a few seconds to boot. Show a progress bar over it
      // meanwhile — pointer-events: none, so a click always reaches the player
      // and never pauses or restarts what is already running.
      var wait = document.createElement("div");
      wait.className = "video__wait";
      wait.innerHTML = '<span class="video__bar"><i class="video__fill" id="videoFill"></i></span>' +
                       '<span class="video__wait-t">Rolling the tape…</span>' +
                       '<a class="video__alt" href="' + href + '" target="_blank" rel="noopener">Taking a while? Open it on Loom ↗</a>';
      box.innerHTML = "";
      box.removeAttribute("data-cursor");
      box.appendChild(frame);
      box.appendChild(wait);
      if (cur) cur.classList.add("is-off");     // the drawn cursor has no business over a player

      // Creep towards 90% while we wait; the load event finishes the bar.
      var fill = wait.querySelector(".video__fill"), pct = 0, done = false;
      var creep = window.setInterval(function () {
        pct += (90 - pct) * .08 + .4;
        if (fill) fill.style.width = Math.min(pct, 90) + "%";
      }, 140);

      function clear() {
        if (done) return;
        done = true;
        window.clearInterval(creep);
        if (fill) fill.style.width = "100%";
        wait.classList.add("is-done");
        window.setTimeout(function () { if (wait.parentNode) wait.parentNode.removeChild(wait); }, 420);
      }
      frame.addEventListener("load", function () { setTimeout(clear, 300); });
      setTimeout(function () { wait.classList.add("is-slow"); }, 4000);   // reveals the way out
      setTimeout(clear, 20000);                                          // never leave it stuck
    });
  });
})();
