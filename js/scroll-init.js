/**
 * Ensures the landing always opens on the very first (Hero) screen.
 * Prevents "random" restoration to other sections after refresh / BFCache.
 *
 * Note: We intentionally DO NOT re-force scroll on window "load" to avoid
 * pulling the user back to Hero after they already clicked an anchor.
 */
(() => {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const forceHeroTop = () => {
    const container = document.querySelector(".page-container");
    if (!container) return;

    container.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // Remove hash to avoid jumping into a section on reload
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  };

  // Run immediately (defer-script runs after HTML parsing)
  forceHeroTop();

  // And once more after DOM is ready
  document.addEventListener("DOMContentLoaded", forceHeroTop, { once: true });

  // Handle BFCache (Safari/Chrome) where element scroll positions can be restored
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) forceHeroTop();
  });
})();
