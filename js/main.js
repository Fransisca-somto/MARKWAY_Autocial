/* =========================================================
   Markway – interactions & animations
   Shared by every page; each block only runs when its markup exists.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const WHATSAPP_NUMBER = "2348075769997";

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

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const MOBILE_NAV = 1100;
  const closeNav = () => {
    burger.classList.remove("open");
    nav.classList.remove("open");
  };
  burger.addEventListener("click", e => {
    e.stopPropagation();
    burger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  $("#navClose").addEventListener("click", closeNav);
  // tapping the dimmed page outside the panel closes it
  document.addEventListener("click", e => {
    if (nav.classList.contains("open") && !nav.contains(e.target)) closeNav();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
  $$(".nav a").forEach(a => a.addEventListener("click", e => {
    const parent = a.parentElement;
    if (parent.classList.contains("has-dropdown") && window.innerWidth <= MOBILE_NAV) {
      e.preventDefault();
      parent.classList.toggle("open");
      return;
    }
    closeNav();
  }));

  /* ---------- Hero slider (home) ---------- */
  const slides = $$(".hero__slide");
  if (slides.length) {
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
  }

  /* ---------- Services carousel + tabs (home) ---------- */
  const track = $("#svcTrack");
  if (track) {
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

    // Swipe (touch) or drag (mouse) the cards to change service
    const svcViewport = track.parentElement;
    let startX = 0, startY = 0, dragX = 0, dragging = false, horizontal = false, suppressClick = false;
    const baseOffset = () => svcIndex * (cards[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 0));

    svcViewport.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; horizontal = false; dragX = 0;
      startX = e.clientX; startY = e.clientY;
    });
    svcViewport.addEventListener("pointermove", e => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (!horizontal) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // let the page scroll
        horizontal = true;
        track.style.transition = "none";
        svcViewport.classList.add("dragging");
        svcViewport.setPointerCapture(e.pointerId);
      }
      dragX = dx;
      // resist past the first and last card
      const atEdge = (svcIndex === 0 && dx > 0) || (svcIndex === maxIndex() && dx < 0);
      track.style.transform = `translateX(${-baseOffset() + (atEdge ? dx / 3 : dx)}px)`;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      svcViewport.classList.remove("dragging");
      if (!horizontal) return;
      suppressClick = Math.abs(dragX) > 6;
      const threshold = Math.min(70, cards[0].offsetWidth * 0.18);
      if (dragX < -threshold && activeTab < cards.length - 1) showService(activeTab + 1);
      else if (dragX > threshold && activeTab > 0) showService(activeTab - 1);
      else renderServices(); // snap back
    };
    svcViewport.addEventListener("pointerup", endDrag);
    svcViewport.addEventListener("pointercancel", endDrag);
    // a drag that ends over a card's button should not count as a click
    svcViewport.addEventListener("click", e => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
    }, true);
  }

  /* ---------- Why choose us switcher (home) ---------- */
  const whyItems = $$(".projects__item");
  if (whyItems.length) {
    const whyData = [
      { title: "End-to-End Service", text: "We handle the entire import and export process, from documentation and regulatory compliance to customs clearance, transportation and final delivery." },
      { title: "Accuracy & Compliance", text: "Form M, PAAR, SONCAP, NAFDAC and customs documents are prepared carefully and correctly, helping you avoid documentation errors, penalties and hold-ups." },
      { title: "Transparency", text: "Clear communication on processes, requirements and costs, so there are no surprises and no unnecessary additional charges." },
      { title: "Timely Processing", text: "We move quickly on documentation, assessment and release, helping you avoid unnecessary delays and demurrage at the port or airport." },
      { title: "Reliable Communication", text: "You are kept informed at every stage, from documentation to delivery, by a team that is easy to reach by phone, WhatsApp and email." },
    ];
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
  }

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

  /* ---------- Quote & contact forms → WhatsApp ---------- */
  // Each field's label text becomes its line in the message, e.g. "Full Name: Ada"
  const fieldLabel = f => f.closest("label").firstChild.textContent.replace("*", "").trim();

  $$("form[data-whatsapp]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const fields = $$("[required]", form);
      const missing = fields.filter(f => !f.value.trim());
      fields.forEach(f => f.classList.toggle("invalid", missing.includes(f)));
      if (missing.length) {
        missing[0].focus();
        showToast("Please fill in the required fields.");
        return;
      }
      const lines = [
        `*${form.dataset.whatsapp} – Markway Website*`,
        ...$$("[name]", form).filter(f => f.value.trim()).map(f => `${fieldLabel(f)}: ${f.value.trim()}`),
      ];
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
      showToast("Opening WhatsApp with your message…");
      form.reset();
    });
    $$("[required]", form).forEach(f => f.addEventListener("input", () => f.classList.remove("invalid")));
  });
});
