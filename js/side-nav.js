(() => {
  const run = () => {
    let nav = document.querySelector('.side-nav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.className = 'side-nav';
      nav.setAttribute('aria-label', 'Навигация по секциям');
      document.body.appendChild(nav);
    }

    // Берём любые элементы с классом page и id — не важно section или div
    const sections = Array.from(document.querySelectorAll('.page[id]'));

    if (!sections.length) return;

    nav.innerHTML = sections.map(sec => {
      const label = sec.getAttribute('data-nav') || sec.id;
      return `
        <a href="#${sec.id}" data-target="${sec.id}" aria-current="false">
          <span class="label">${label}</span>
        </a>
      `;
    }).join('');

    const links = Array.from(nav.querySelectorAll('a[data-target]'));
    const setActive = (id) => {
      links.forEach(a => a.setAttribute('aria-current', a.dataset.target === id ? 'true' : 'false'));
    };

    nav.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-target]');
      if (!a) return;
      e.preventDefault();
      const el = document.getElementById(a.dataset.target);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(en => en.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    }, { threshold: [0.35, 0.5, 0.65] });

    sections.forEach(s => io.observe(s));
    setActive(sections[0].id);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
