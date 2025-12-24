/**
 * Horizontal "Атмосфера" carousel with infinite loop.
 * IMPORTANT: we DO NOT use scrollIntoView() to avoid vertical page jumps on load.
 */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const carousel = document.querySelector(".carousel");
  const dotsRoot = document.querySelector(".carousel-dots");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (!track) return;

  // ---------------- INFINITE LOOP VIA CLONES ----------------
  let items = Array.from(track.children);
  const realCount = items.length;
  const cloneCount = realCount;

  items.forEach((item) => {
    track.appendChild(item.cloneNode(true));
    track.insertBefore(item.cloneNode(true), track.firstChild);
  });

  items = Array.from(track.children);

  const normalizeIndex = (index) => {
    // Keep index in the "real" window [cloneCount, cloneCount+realCount)
    while (index < cloneCount) index += realCount;
    while (index >= cloneCount + realCount) index -= realCount;
    return index;
  };

  const realIndexOf = (index) => {
    // Map any clone index to [0..realCount-1]
    const rel = (index - cloneCount) % realCount;
    return (rel + realCount) % realCount;
  };

  let activeIndex = cloneCount + Math.floor(realCount / 2);
  let ticking = false;
  let scrollEndTimer = null;

  // ---------------- DOTS ----------------
  let dots = [];
  if (dotsRoot) {
    dotsRoot.innerHTML = "";
    dots = Array.from({ length: realCount }, (_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "carousel-dot";
      btn.setAttribute("aria-label", `Фото ${i + 1} из ${realCount}`);
      btn.addEventListener("click", () => {
        stopAutoplay(true);
        activeIndex = cloneCount + i;
        centerTo(activeIndex);
        scheduleAutoplayResume();
      });
      dotsRoot.appendChild(btn);
      return btn;
    });
  }

  const setActive = (index) => {
    items.forEach((item, i) => item.classList.toggle("active", i === index));
    const r = realIndexOf(index);
    dots.forEach((d, i) => d.classList.toggle("active", i === r));
  };

  // ---------------- CENTERING HELPERS ----------------
  const getScrollLeftForIndex = (index) => {
    const item = items[index];
    if (!item) return track.scrollLeft;

    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    return Math.max(0, itemCenter - track.clientWidth / 2);
  };

  const centerTo = (index, behavior = "smooth") => {
    const left = getScrollLeftForIndex(index);
    track.scrollTo({ left, behavior });
    setActive(index);
  };

  // INIT (no vertical scrolling side-effects)
  requestAnimationFrame(() => {
    activeIndex = normalizeIndex(activeIndex);
    centerTo(activeIndex, "auto");
  });

  // ---------------- AUTOPLAY ----------------
  const AUTOPLAY_MS = 4500;
  const RESUME_AFTER_MS = 5000;
  let autoplayTimer = null;
  let resumeTimer = null;
  let isInView = true;

  const startAutoplay = () => {
    if (autoplayTimer || !isInView) return;
    autoplayTimer = window.setInterval(() => {
      activeIndex += 1;
      centerTo(activeIndex);
      // Fix clones in a microtask AFTER smooth scroll is started
      window.setTimeout(() => {
        activeIndex = normalizeIndex(activeIndex);
        centerTo(activeIndex, "auto");
      }, 0);
    }, AUTOPLAY_MS);
  };

  const stopAutoplay = (keepPaused = false) => {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    if (!keepPaused) scheduleAutoplayResume();
  };

  const scheduleAutoplayResume = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => startAutoplay(), RESUME_AFTER_MS);
  };

  // Pause when carousel is offscreen
  if (carousel && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        isInView = entries.some((e) => e.isIntersecting);
        if (!isInView) stopAutoplay(true);
        else startAutoplay();
      },
      { threshold: 0.35 }
    );
    io.observe(carousel);
  }

  // Start by default (will be stopped by IO if needed)
  startAutoplay();

  // ---------------- CONTROLS ----------------
  const userInteracted = () => {
    stopAutoplay(true);
    scheduleAutoplayResume();
  };

  prevBtn?.addEventListener("click", () => {
    userInteracted();
    activeIndex -= 1;
    centerTo(activeIndex);
  });

  nextBtn?.addEventListener("click", () => {
    userInteracted();
    activeIndex += 1;
    centerTo(activeIndex);
  });

  // Pointer/touch interaction pauses autoplay (important for mobile)
  track.addEventListener("pointerdown", userInteracted, { passive: true });
  track.addEventListener("touchstart", userInteracted, { passive: true });
  track.addEventListener("wheel", userInteracted, { passive: true });
  carousel?.addEventListener("mouseenter", () => stopAutoplay(true));
  carousel?.addEventListener("mouseleave", () => startAutoplay());

  // ---------------- SCROLL / SWIPE (STABLE) ----------------
  const settle = () => {
    // After momentum ends: jump out of clones (no animation) and snap to center
    activeIndex = normalizeIndex(activeIndex);
    centerTo(activeIndex, "auto");
    // Then gently snap (optional) to avoid micro-off-centers
    requestAnimationFrame(() => centerTo(activeIndex, "smooth"));
  };

  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const center = track.scrollLeft + track.clientWidth / 2;

      let closest = activeIndex;
      let min = Infinity;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < min) {
          min = dist;
          closest = i;
        }
      }

      activeIndex = closest;
      setActive(activeIndex);

      // Debounced settle — prevents "бешеные" прыжки на мобильном при сильном флике
      if (scrollEndTimer) window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(settle, 140);

      ticking = false;
    });
  });

  // Re-center after resize (safe: horizontal only)
  window.addEventListener("resize", () => {
    activeIndex = normalizeIndex(activeIndex);
    centerTo(activeIndex, "auto");
  });
});
