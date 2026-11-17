/* Upgrade landing page – GSAP + ScrollTrigger
   Structure: helpers → motion (respects reduced-motion) → always-on interactions */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- always-on, non-motion behaviour ---------- */

  // smooth in-page anchors + close the mobile menu
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      if (id === "#main") { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      var menu = $("#mainNav");
      if (menu && menu.classList.contains("show") && window.bootstrap) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  // cursor spotlight on cards (hover feedback) – pure CSS variables, no layout cost
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".spot");
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left) + "px");
    el.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  // back to top
  var toTop = $(".to-top");
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  if (!window.gsap || !window.ScrollTrigger) { // content stays fully visible without GSAP
    window.addEventListener("scroll", function () { if (toTop) toTop.classList.toggle("is-on", scrollY > 700); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (/[?&]static/.test(location.search)) gsap.globalTimeline.timeScale(60); // QA: settle animations instantly

  var nav = $(".site-nav");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      nav.classList.toggle("is-scrolled", self.scroll() > 60);
      if (toTop) toTop.classList.toggle("is-on", self.scroll() > 700);
    }
  });

  /* ---------- About accordion (click / hover / focus) ---------- */
  var list = $("#accList");
  if (list) {
    var items = $$(".acc__item", list);
    var fill = $(".acc__fill", list);
    var bars = $(".chart__bars");
    var months = $$(".mo");
    var monthFor = [2, 1, 3];
    var current = 0;
    window.__aboutPin = null;
    var activate = function (i, animate) {
      current = i;
      items.forEach(function (el, n) { el.classList.toggle("is-active", n === i); el.setAttribute("aria-pressed", String(n === i)); });
      months.forEach(function (m, n) { m.classList.toggle("is-on", n === monthFor[i]); });
      var y = items[i].offsetTop - items[0].offsetTop;
      gsap.to(fill, { y: y, height: items[i].offsetHeight, duration: animate ? .6 : 0, ease: "power3.inOut", overwrite: true });
      if (animate) gsap.fromTo(bars, { scaleY: .82 }, { scaleY: 1, duration: .8, ease: "elastic.out(1,.6)", overwrite: true });
    };
    window.__aboutActivate = activate;
    items.forEach(function (el, i) {
      ["click", "focus", "mouseenter"].forEach(function (ev) {
        el.addEventListener(ev, function () {
          var st = window.__aboutPin;
          if (st) { // pinned mode: scroll drives the steps, so jump the page to that step
            if (ev === "mouseenter") return;
            window.scrollTo({ top: st.start + (i + .5) / items.length * (st.end - st.start), behavior: "smooth" });
            return;
          }
          if (current !== i) activate(i, true);
        });
      });
    });
    window.addEventListener("resize", function () { activate(current, false); });
  }

  /* ---------- Motion (skipped entirely for reduced-motion users) ---------- */
  var mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", function () {

    /* helper: split text into masked words, preserving nested markup */
    var splitWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            var mask = document.createElement("span"); mask.className = "w-mask";
            var w = document.createElement("span"); w.className = "w"; w.textContent = part;
            mask.appendChild(w); frag.appendChild(mask);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains("w-mask")) { splitWords(n); }
      });
    };

    /* scroll progress bar – tells users how far they are (goal-gradient) */
    gsap.to(".progress__bar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .2 } });

    /* ===== Hero intro ===== */
    var title = $('[data-hero="title"]');
    if (title) { splitWords(title); title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim()); }

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .from(".site-nav", { y: -40, opacity: 0, duration: .7 })
      .from('.pill[data-hero="fade"]', { y: 20, opacity: 0, duration: .6 }, "-=.3")
      .from(".hero__title .w", { yPercent: 115, duration: .9, stagger: .07 }, "-=.3")
      .from('.hero__lead, .hero__copy .cta', { y: 24, opacity: 0, duration: .7, stagger: .12 }, "-=.5")
      .from(".hv-phone", { y: 90, opacity: 0, duration: 1.1 }, "-=1.1")
      .from(".hv-card", { x: -70, y: 50, opacity: 0, rotate: -8, duration: .95 }, "-=.7")
      .from(".hv-app--green", { x: 50, opacity: 0, duration: .7 }, "-=.6")
      .from(".hv-app--lime", { x: 50, opacity: 0, duration: .7 }, "-=.55")
      .from(".brands", { yPercent: 100, duration: .8, ease: "power2.out" }, "-=.6")
      .from(".brands .brand, .brand-spherule", { y: 12, opacity: 0, duration: .5, stagger: .06 }, "-=.4");

    /* hero scroll-scrub: copy drifts up & fades, visual rises slower, grid lags (depth) */
    var heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero__copy", { yPercent: -14, opacity: .25, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero-visual", { yPercent: -8, ease: "none", scrollTrigger: heroST });
    gsap.to(".hv-phone", { rotation: 4, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__grid", { yPercent: 14, ease: "none", scrollTrigger: heroST });
    /* hero sits under the next section: it recedes and dims as the content slides over it */
    gsap.to(".hero", { "--hero-dim": .6, ease: "none", scrollTrigger: heroST });
    gsap.to(".hero__body", { scale: .94, transformOrigin: "50% 0", ease: "none", scrollTrigger: heroST });

    /* ===== Section headings: masked word reveal on scroll ===== */
    $$(".t-h2").forEach(function (h) {
      splitWords(h);
      gsap.from($$(".w", h), { yPercent: 110, duration: .85, ease: "power3.out", stagger: .05, scrollTrigger: { trigger: h, start: "top 88%" } });
    });

    /* ===== Directional reveals, batched so siblings stagger ===== */
    var dirs = { up: { y: 56 }, left: { x: -70 }, right: { x: 70 } };
    ["up", "left", "right"].forEach(function (d) {
      var els = $$('[data-reveal="' + d + '"]');
      if (!els.length) return;
      gsap.set(els, Object.assign({ opacity: 0 }, dirs[d]));
      ScrollTrigger.batch(els, {
        start: "top 90%", once: true,
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: .9, ease: "power3.out", stagger: .14, overwrite: true }); }
      });
    });

    /* ===== About: chart grows on enter, counter, light parallax ===== */
    var chartTl = gsap.timeline({ scrollTrigger: { trigger: ".chart-card", start: "top 80%" }, defaults: { ease: "power3.out" } });
    chartTl.from(".chart__bars", { scaleY: 0, duration: 1.2, ease: "elastic.out(1,.7)" })
           .from(".chart__tip", { opacity: 0, y: 10, scale: .8, duration: .5 }, "-=.35");
    var amount = $(".cc-amount"), counter = { v: 0 };
    gsap.to(counter, { v: 1852, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: ".chart-card", start: "top 80%" },
      onUpdate: function () { amount.textContent = "$ " + Math.round(counter.v) + ",00"; } });
    /* About: pin the section; scrolling steps the list 1 → 2 → 3, then releases to the next section (desktop) */
    if (matchMedia("(min-width: 992px) and (min-height: 700px)").matches && list) {
      var steps = items.length, last = -1;
      window.__aboutPin = ScrollTrigger.create({
        trigger: ".about", start: "top top", end: "+=" + Math.round(innerHeight * 0.55 * steps),
        pin: true, anticipatePin: 1, refreshPriority: 1,
        onUpdate: function (self) {
          var i = Math.min(steps - 1, Math.floor(self.progress * steps));
          if (i !== last) { last = i; activate(i, true); }
        }
      });
    }

    /* ===== Features: two screens drift in opposite directions ===== */
    var featST = { trigger: ".features", start: "top bottom", end: "bottom top", scrub: .8 };
    gsap.fromTo(".feat-shot__a", { yPercent: 8 }, { yPercent: -10, ease: "none", scrollTrigger: featST });
    gsap.fromTo(".feat-shot__b", { yPercent: -8 }, { yPercent: 10, ease: "none", scrollTrigger: featST });

    /* ===== Trust: background + layers parallax ===== */
    var trustST = { trigger: ".trust", start: "top bottom", end: "bottom top", scrub: true };
    gsap.fromTo(".trust", { backgroundPositionY: "20%" }, { backgroundPositionY: "80%", ease: "none", scrollTrigger: trustST });
    gsap.fromTo(".trust__phone", { y: 50 }, { y: -50, ease: "none", scrollTrigger: trustST });
    gsap.fromTo(".trust__card", { y: 90, x: 20 }, { y: -70, x: -10, ease: "none", scrollTrigger: trustST });

    /* ===== Services: shots slide against each other; balance counts up ===== */
    var wideST = { trigger: ".bcard--wide", start: "top bottom", end: "bottom top", scrub: .6 };
    gsap.fromTo(".bw-a", { y: 40 }, { y: -30, ease: "none", scrollTrigger: wideST });
    gsap.fromTo(".bw-b", { y: -10 }, { y: 50, ease: "none", scrollTrigger: wideST });
    $$(".bcard__home, .bcard__dash").forEach(function (el) {
      gsap.fromTo(el, { yPercent: 6 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: el.closest(".bcard"), start: "top bottom", end: "bottom top", scrub: .6 } });
    });
    var bal = $("[data-count]");
    if (bal) {
      var tgt = parseFloat(bal.dataset.count), c = { v: 0 };
      gsap.to(c, { v: tgt, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: bal, start: "top 90%" },
        onUpdate: function () { bal.textContent = "$" + c.v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } });
    }

    /* ===== Testimonials: slight rotation settles as each card arrives ===== */
    $$(".tcard").forEach(function (card, i) { gsap.from(card, { rotation: (i - 1) * 2, duration: 1, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 90%" } }); });

    /* ===== CTA: box scales up as it arrives, phones rise, glow breathes ===== */
    gsap.fromTo(".cta-box", { scale: .94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".cta-sec", start: "top bottom", end: "top 30%", scrub: true } });
    gsap.from(".cp-a", { y: 90, opacity: 0, duration: 1, scrollTrigger: { trigger: ".cta-sec", start: "top 60%" } });
    gsap.from(".cp-b", { y: 120, opacity: 0, duration: 1, delay: .15, scrollTrigger: { trigger: ".cta-sec", start: "top 60%" } });
    gsap.to(".cta-box__glow--1", { x: -40, y: 30, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });

    /* ===== Footer ===== */
    gsap.from(".footer .container > *", { y: 24, opacity: 0, duration: .7, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".footer", start: "top 92%" } });

    /* ===== Hover-capable devices only ===== */
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {

      // hero mouse parallax (on children, so it composes with the scroll scrub on their parents)
      if (matchMedia("(min-width: 992px)").matches) {
        var hero = $(".hero");
        var setters = $$("[data-parallax]").map(function (el) {
          return { x: gsap.quickTo(el, "x", { duration: .9, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: .9, ease: "power3" }), k: parseFloat(el.dataset.parallax) };
        });
        hero.addEventListener("mousemove", function (e) {
          var r = hero.getBoundingClientRect();
          var dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
          setters.forEach(function (s) { s.x(-dx * s.k); s.y(-dy * s.k); });
        });
        hero.addEventListener("mouseleave", function () { setters.forEach(function (s) { s.x(0); s.y(0); }); });
      }

      // 3D tilt on showcase blocks
      $$("[data-tilt]").forEach(function (el) {
        var max = parseFloat(el.dataset.tilt) || 6;
        gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
        var rx = gsap.quickTo(el, "rotationX", { duration: .6, ease: "power3" });
        var ry = gsap.quickTo(el, "rotationY", { duration: .6, ease: "power3" });
        el.addEventListener("mousemove", function (e) {
          var r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - .5) * max * 2);
          rx(-((e.clientY - r.top) / r.height - .5) * max * 2);
        });
        el.addEventListener("mouseleave", function () { rx(0); ry(0); });
      });

      // magnetic CTA circle
      $$(".cta").forEach(function (cta) {
        var dot = $(".cta__dot", cta);
        var qx = gsap.quickTo(dot, "x", { duration: .4, ease: "power3" }), qy = gsap.quickTo(dot, "y", { duration: .4, ease: "power3" });
        cta.addEventListener("mousemove", function (e) {
          var r = cta.getBoundingClientRect();
          qx((e.clientX - r.left - r.width / 2) * .1); qy((e.clientY - r.top - r.height / 2) * .25);
        });
        cta.addEventListener("mouseleave", function () { gsap.to(dot, { x: 0, y: 0, duration: .6, ease: "elastic.out(1,.5)" }); });
      });

      // social icon wobble + logo pulse
      $$(".footer__social a").forEach(function (a) {
        a.addEventListener("mouseenter", function () { gsap.fromTo($("img", a), { rotation: -20 }, { rotation: 0, duration: .6, ease: "elastic.out(1,.4)" }); });
      });
      var logo = $(".footer__logo");
      if (logo) logo.addEventListener("mouseenter", function () { gsap.fromTo(logo, { scale: 1 }, { scale: 1.05, duration: .35, yoyo: true, repeat: 1, ease: "power2.inOut" }); });
    }

    ScrollTrigger.refresh();
  });
})();
