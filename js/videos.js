/**
 * Video autoplay logic for the "Live моменты" section.
 * - Mobile: unlock autoplay after first user interaction and never pause.
 * - Desktop: play/pause based on visibility.
 */
document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll(".video-item video");
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let unlocked = !isMobile;

  // PREP
  videos.forEach((v) => {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
  });

  // UNLOCK AUTOPLAY (MOBILE)
  if (isMobile) {
    const unlock = () => {
      unlocked = true;

      videos.forEach((v) => {
        v.play().catch(() => {});
      });

      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
  }

  // INTERSECTION
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (!unlocked) return;

        if (isMobile) {
          // MOBILE — never pause
          if (video.paused) video.play().catch(() => {});
        } else {
          // DESKTOP — normal behavior
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      });
    },
    { threshold: 0.6 }
  );

  videos.forEach((v) => observer.observe(v));
});
