/* ==========================================================================
   Tcongs Infotech — Home Page Redesign
   Vanilla JS. No dependencies. All motion respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

  /* ------------------------------------------------------------------ *
   * 1. Header — sticky state + back-to-top visibility
   * ------------------------------------------------------------------ */
  const header = $("#header");
  const toTop = $("#toTop");

  function onScrollChrome() {
    const y = window.scrollY;
    header.classList.toggle("is-stuck", y > 12);
    toTop.classList.toggle("is-shown", y > window.innerHeight * 0.9);
  }
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" })
  );

  /* ------------------------------------------------------------------ *
   * 2. Mega menu (desktop)
   * ------------------------------------------------------------------ */
  const megaItem = $("[data-mega]");
  if (megaItem) {
    const trigger = $(".nav-link", megaItem);
    let closeTimer;

    const open = () => {
      clearTimeout(closeTimer);
      megaItem.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      megaItem.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };
    const closeSoon = () => {
      closeTimer = setTimeout(close, 180);
    };

    // Pointer intent on desktop, plain toggle everywhere else.
    megaItem.addEventListener("mouseenter", () => isDesktop() && open());
    megaItem.addEventListener("mouseleave", () => isDesktop() && closeSoon());
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      megaItem.classList.contains("is-open") ? close() : open();
    });

    // Close on Escape, on outside click, and after picking a link.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && megaItem.classList.contains("is-open")) {
        close();
        trigger.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!megaItem.contains(e.target)) close();
    });
    $$(".mega a", megaItem).forEach((a) => a.addEventListener("click", close));
    // Keyboard users tabbing out of the panel should close it too.
    megaItem.addEventListener("focusout", (e) => {
      if (!megaItem.contains(e.relatedTarget)) close();
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Mobile drawer + its accordion
   * ------------------------------------------------------------------ */
  const burger = $("#burger");
  const drawer = $("#drawer");

  function setDrawer(open) {
    drawer.classList.toggle("is-open", open);
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
  // Any navigation from the drawer should dismiss it.
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      setDrawer(false);
      burger.focus();
    }
  });
  // Resizing up to desktop must not leave the body scroll-locked.
  window.addEventListener("resize", () => {
    if (isDesktop() && drawer.classList.contains("is-open")) setDrawer(false);
  });

  $$(".drawer-acc").forEach((acc) => {
    const btn = $(".drawer-link", acc);
    btn.addEventListener("click", () => {
      const open = acc.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ------------------------------------------------------------------ *
   * 4. Scroll reveal
   * ------------------------------------------------------------------ */
  const revealables = $$("[data-reveal]");
  if (REDUCED || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * 5. Count-up numbers
   *    Values like "7–15" keep their suffix and only animate the lead number.
   * ------------------------------------------------------------------ */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (Number.isNaN(target)) return;
    if (REDUCED) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(countUp);
  }

  /* ------------------------------------------------------------------ *
   * 6. Sparkline bars in the hero float card
   * ------------------------------------------------------------------ */
  $$("[data-spark]").forEach((wrap) => {
    wrap.dataset.spark.split(",").forEach((v, i) => {
      const bar = document.createElement("i");
      bar.style.height = Math.max(8, parseFloat(v)) + "%";
      bar.style.animationDelay = i * 70 + "ms";
      wrap.appendChild(bar);
    });
  });

  /* ------------------------------------------------------------------ *
   * 7. Seamless marquee — clone the track so a -50% shift loops cleanly
   * ------------------------------------------------------------------ */
  const track = $("[data-marquee-track]");
  if (track) {
    const clone = track.cloneNode(true);
    clone.removeAttribute("data-marquee-track");
    clone.setAttribute("aria-hidden", "true");
    track.parentNode.appendChild(clone);
  }

  /* ------------------------------------------------------------------ *
   * 8. Process — scroll-spy driving the sticky figure + progress rail
   * ------------------------------------------------------------------ */
  const steps = $$(".step");
  const figures = $$(".process-figure img");
  const bars = $$(".process-progress i");
  const figNum = $("[data-fig-num]");
  const figTitle = $("[data-fig-title]");
  const figSub = $("[data-fig-sub]");
  let activeStep = 0;

  function syncProcess() {
    if (!steps.length) return;
    const mid = window.innerHeight * 0.52;
    let idx = 0;
    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= mid) idx = i;
    });
    if (idx === activeStep) return;
    activeStep = idx;

    steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
    figures.forEach((f, i) => f.classList.toggle("is-active", i === idx));
    bars.forEach((b, i) => b.classList.toggle("is-done", i <= idx));

    const body = $(".step-body", steps[idx]);
    if (figNum) figNum.textContent = String(idx + 1).padStart(2, "0");
    if (figTitle) figTitle.textContent = $("h3", body).textContent;
    if (figSub) figSub.textContent = $(".st-sub", body).textContent;
  }

  /* ------------------------------------------------------------------ *
   * 9. Nav scroll-spy
   * ------------------------------------------------------------------ */
  const spyLinks = $$(".nav-link[data-spy]");
  const spyTargets = spyLinks
    .map((link) => ({ link, el: document.getElementById(link.dataset.spy) }))
    .filter((t) => t.el);

  function syncNav() {
    const probe = window.scrollY + window.innerHeight * 0.3;
    let current = null;
    spyTargets.forEach((t) => {
      if (t.el.offsetTop <= probe) current = t;
    });
    spyLinks.forEach((l) => l.classList.remove("is-active"));
    if (current) current.link.classList.add("is-active");
  }

  /* ------------------------------------------------------------------ *
   * 10. Single rAF-throttled scroll handler for everything above
   * ------------------------------------------------------------------ */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScrollChrome();
      syncProcess();
      syncNav();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScrollChrome();
  syncNav();
  // Deep links (#process) can load the page already scrolled past a step.
  window.addEventListener("load", syncProcess);

  /* ------------------------------------------------------------------ *
   * 11. FAQ accordion — one open at a time
   * ------------------------------------------------------------------ */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    const btn = $(".faq-q", item);
    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      faqItems.forEach((other) => {
        other.classList.remove("is-open");
        $(".faq-q", other).setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * 12. Card spotlight — feed cursor position to the CSS gradient
   * ------------------------------------------------------------------ */
  if (!REDUCED && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 13. Inquiry form validation
   *     Front-end only — nothing is transmitted anywhere.
   * ------------------------------------------------------------------ */
  const form = $("#inquiry");
  const success = $("#success");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;

  function validateField(input) {
    const field = input.closest(".field");
    const value = input.value.trim();
    let ok = true;

    if (input.required && !value) ok = false;
    else if (input.type === "email" && value) ok = EMAIL_RE.test(value);
    else if (input.type === "tel" && value) ok = PHONE_RE.test(value);

    field.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  if (form) {
    const inputs = $$("input, select, textarea", form);

    inputs.forEach((input) => {
      // Validate on blur, then clear the error as soon as they start fixing it.
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstBad = null;
      inputs.forEach((input) => {
        if (!validateField(input) && !firstBad) firstBad = input;
      });
      if (firstBad) {
        firstBad.focus();
        firstBad.scrollIntoView({ block: "center", behavior: REDUCED ? "auto" : "smooth" });
        return;
      }
      success.classList.add("is-shown");
      form.reset();
    });

    $("#reset-form").addEventListener("click", () => {
      success.classList.remove("is-shown");
      $$(".field", form).forEach((f) => f.classList.remove("has-error"));
      $("#f-name").focus();
    });
  }

  /* ------------------------------------------------------------------ *
   * 14. Footer year
   * ------------------------------------------------------------------ */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
