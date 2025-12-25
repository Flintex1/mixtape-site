(() => {
  const nav = document.querySelector('.side-nav');
  if (!nav) return;

  const sections = Array.from(document.querySelectorAll('section.page[id]'))
    .filter(s => s.id && s.getAttribute('data-nav'));

  if (!sections.length) return;

  // Build nav
  nav.innerHTML = sections.map(sec => {
    const label = sec.getAttribute('data-nav') || sec.id;
    return `
      <a href="#${sec.id}" data-target="${sec.id}" aria-current="false">
        <span class="label">${label}</span>
      </a>
    `;
  }).join('');

  const links = Array.from(nav.querySelectorAll('a[data-target]'));
  const linkById = new Map(links.map(a => [a.dataset.target, a]));

  // Smooth scroll (respects scroll-snap)
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-target]');
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.target);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Highlight current section
  const setActive = (id) => {
    links.forEach(a => a.setAttribute('aria-current', a.dataset.target === id ? 'true' : 'false'));
  };

  const io = new IntersectionObserver((entries) => {
    // Choose the most visible entry
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActive(visible.target.id);
  }, { threshold: [0.35, 0.5, 0.65] });

  sections.forEach(s => io.observe(s));

  // Set initial state
  setActive(sections[0].id);
})();
