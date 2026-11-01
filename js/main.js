/* =========================================================
   Markway – interactions & animations
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const WHATSAPP_NUMBER = "2348075769997";

  /* ---------- Preloader ---------- */
  const preloader = $("#preloader");
  const hidePreloader = () => preloader.classList.add("hidden");
  window.addEventListener("load", () => setTimeout(hidePreloader, 300));
  setTimeout(hidePreloader, 3000); // fallback if images are slow

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Toast ---------- */
  const toast = $("#toast");
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
  };

  /* ---------- Sticky header + back-to-top ---------- */
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 60);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Active nav link on scroll ---------- */
  const navLinks = $$(".nav__link[href^='#']").filter(a => a.getAttribute("href").length > 1);
  const sections = navLinks.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const MOBILE_NAV = 1100;
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  $$(".nav a").forEach(a => a.addEventListener("click", e => {
    const parent = a.parentElement;
    if (parent.classList.contains("has-dropdown") && window.innerWidth <= MOBILE_NAV) {
      e.preventDefault();
      parent.classList.toggle("open");
      return;
    }
    burger.classList.remove("open");
    nav.classList.remove("open");
  }));

  /* ---------- Hero slider ---------- */
  const slides = $$(".hero__slide");
  const progress = $("#heroProgress");
  const HERO_DELAY = 6000;
  let heroIndex = 0;
  let heroTimer;

  const restartProgress = () => {
    progress.classList.remove("run");
    void progress.offsetWidth; // force reflow so the animation restarts
    progress.classList.add("run");
  };
  const goToSlide = i => {
    slides[heroIndex].classList.remove("active");
    heroIndex = (i + slides.length) % slides.length;
    slides[heroIndex].classList.add("active");
    restartProgress();
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => goToSlide(heroIndex + 1), HERO_DELAY);
  };
  $("#heroNext").addEventListener("click", () => goToSlide(heroIndex + 1));
  $("#heroPrev").addEventListener("click", () => goToSlide(heroIndex - 1));
  goToSlide(0);

  /* ---------- Scroll reveal ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.style.transitionDelay = (el.dataset.delay || 0) + "ms";
      el.classList.add("revealed");
      // clear the delay afterwards so hover transitions stay snappy
      setTimeout(() => { el.style.transitionDelay = ""; }, 1000 + Number(el.dataset.delay || 0));
      obs.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$("[data-reveal]").forEach(el => revealObserver.observe(el));

  /* ---------- Process line draw ---------- */
  const processGrid = $(".process__grid");
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    processGrid.classList.add("drawn");
    obs.disconnect();
  }, { threshold: 0.4 }).observe(processGrid);

  /* ---------- Counter ---------- */
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const duration = 1800;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".counter").forEach(el => counterObserver.observe(el));

  /* ---------- Services carousel + tabs ---------- */
  const track = $("#svcTrack");
  const cards = [...track.children];
  const svcTabs = $$(".services__tab");
  const perView = () => (window.innerWidth <= 680 ? 1 : 2);
  const maxIndex = () => Math.max(0, cards.length - perView());
  let svcIndex = 0;   // first visible card
  let activeTab = 0;  // highlighted service

  const renderServices = () => {
    svcIndex = Math.min(svcIndex, maxIndex());
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transform = `translateX(-${svcIndex * (cards[0].offsetWidth + gap)}px)`;
    svcTabs.forEach((t, n) => t.classList.toggle("active", n === activeTab));
  };
  const showService = i => {
    activeTab = (i + cards.length) % cards.length;
    svcIndex = Math.min(activeTab, maxIndex());
    renderServices();
  };
  svcTabs.forEach(tab => tab.addEventListener("click", () => showService(+tab.dataset.index)));
  $("#svcNext").addEventListener("click", () => showService(activeTab + 1));
  $("#svcPrev").addEventListener("click", () => showService(activeTab - 1));
  window.addEventListener("resize", renderServices);

  // Menu / footer links that point to a specific service
  $$("a[data-service]").forEach(a => a.addEventListener("click", () => showService(+a.dataset.service)));

  /* ---------- Why choose us switcher ---------- */
  const whyData = [
    { title: "End-to-End Service", text: "We handle the entire import and export process, from documentation and regulatory compliance to customs clearance, transportation and final delivery." },
    { title: "Accuracy & Compliance", text: "Form M, PAAR, SONCAP, NAFDAC and customs documents are prepared carefully and correctly, helping you avoid documentation errors, penalties and hold-ups." },
    { title: "Transparency", text: "Clear communication on processes, requirements and costs, so there are no surprises and no unnecessary additional charges." },
    { title: "Timely Processing", text: "We move quickly on documentation, assessment and release, helping you avoid unnecessary delays and demurrage at the port or airport." },
    { title: "Reliable Communication", text: "You are kept informed at every stage, from documentation to delivery, by a team that is easy to reach by phone, WhatsApp and email." },
  ];
  const whyItems = $$(".projects__item");
  const whyImgs = $$(".projects__image img");
  const whyCard = $("#projectCard");
  whyItems.forEach(item => item.addEventListener("click", () => {
    const i = +item.dataset.index;
    if (item.classList.contains("active")) return;
    whyItems.forEach(p => p.classList.toggle("active", p === item));
    whyImgs.forEach((img, n) => img.classList.toggle("active", n === i));
    whyCard.classList.add("swap");
    setTimeout(() => {
      $("#projectTitle").textContent = whyData[i].title;
      $("#projectText").textContent = whyData[i].text;
      whyCard.classList.remove("swap");
    }, 350);
  }));

  /* ---------- FAQ accordion ---------- */
  const faqItems = $$(".faq-item");
  const setHeight = (item, open) => {
    const a = $(".faq-item__a", item);
    a.style.height = open ? a.scrollHeight + "px" : "0px";
  };
  faqItems.forEach(item => {
    setHeight(item, item.classList.contains("open"));
    $(".faq-item__q", item).addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      faqItems.forEach(other => { other.classList.remove("open"); setHeight(other, false); });
      if (willOpen) { item.classList.add("open"); setHeight(item, true); }
    });
  });
  window.addEventListener("resize", () => faqItems.forEach(i => setHeight(i, i.classList.contains("open"))));

  /* ---------- Request a quote → WhatsApp ---------- */
  const quoteForm = $("#quoteForm");
  quoteForm.addEventListener("submit", e => {
    e.preventDefault();
    const fields = $$("[required]", quoteForm);
    const missing = fields.filter(f => !f.value.trim());
    fields.forEach(f => f.classList.toggle("invalid", missing.includes(f)));
    if (missing.length) {
      missing[0].focus();
      showToast("Please fill in the required fields.");
      return;
    }
    const d = Object.fromEntries(new FormData(quoteForm));
    const lines = [
      "*Quote Request – Markway Website*",
      `Name: ${d.name}`,
      d.company && `Company: ${d.company}`,
      `Phone: ${d.phone}`,
      d.email && `Email: ${d.email}`,
      `Service: ${d.service}`,
      `Shipment: ${d.type}`,
      d.origin && `Origin: ${d.origin}`,
      d.destination && `Destination: ${d.destination}`,
      `Cargo: ${d.cargo}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
    showToast("Opening WhatsApp with your quote request…");
    quoteForm.reset();
  });
  $$("[required]", quoteForm).forEach(f => f.addEventListener("input", () => f.classList.remove("invalid")));
});
