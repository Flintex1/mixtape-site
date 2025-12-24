/**
 * Horizontal "Атмосфера" carousel with infinite loop.
 * IMPORTANT: we DO NOT use scrollIntoView() to avoid vertical page jumps on load.
 */
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".carousel-track");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (!track) return;

  let items = Array.from(track.children);
  const realCount = items.length;
  const cloneCount = realCount;

  // CLONE FOR LOOP (prepend + append)
  items.forEach((item) => {
    track.appendChild(item.cloneNode(true));
    track.insertBefore(item.cloneNode(true), track.firstChild);
  });

  items = Array.from(track.children);

  let activeIndex = cloneCount + Math.floor(realCount / 2);
  let ticking = false;

  const setActive = (index) => {
    items.forEach((item, i) => item.classList.toggle("active", i === index));
  };

  const getScrollLeftForIndex = (index) => {
    const item = items[index];
    if (!item) return track.scrollLeft;

    // Center the item in the track viewport (horizontal only)
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    return Math.max(0, itemCenter - track.clientWidth / 2);
  };

  const centerTo = (index, behavior = "smooth") => {
    const left = getScrollLeftForIndex(index);
    track.scrollTo({ left, behavior });
    setActive(index);
  };

  // INIT (no vertical scrolling side-effects)
  requestAnimationFrame(() => centerTo(activeIndex, "auto"));

  // CONTROLS
  prevBtn?.addEventListener("click", () => {
    activeIndex -= 1;
    centerTo(activeIndex);
  });

  nextBtn?.addEventListener("click", () => {
    activeIndex += 1;
    centerTo(activeIndex);
  });

  // SCROLL / SWIPE
  track.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const center = track.scrollLeft + track.clientWidth / 2;

      let closest = activeIndex;
      let min = Infinity;

      items.forEach((item, i) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const dist = Math.abs(center - itemCenter);
        if (dist < min) {
          min = dist;
          closest = i;
        }
      });

      activeIndex = closest;
      setActive(activeIndex);

      // LOOP FIX (jump without animation when we reach clones)
      if (activeIndex < cloneCount) {
        activeIndex += realCount;
        centerTo(activeIndex, "auto");
      }

      if (activeIndex >= cloneCount + realCount) {
        activeIndex -= realCount;
        centerTo(activeIndex, "auto");
      }

      ticking = false;
    });
  });

  // Re-center after resize (safe: horizontal only)
  window.addEventListener("resize", () => centerTo(activeIndex, "auto"));
});
