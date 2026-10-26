(() => {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  const pauseButton = document.querySelector('.hero-pause');
  const showcase = document.querySelector('.hero-showcase');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (slides.length < 2 || dots.length !== slides.length) return;

  let current = 0;
  let timer = null;
  let paused = reduceMotion;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('ativo', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('ativo', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (!paused) timer = window.setInterval(() => show(current + 1), 5200);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    show(index);
    start();
  }));

  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? '▶' : 'Ⅱ';
      pauseButton.setAttribute('aria-label', paused ? 'Retomar rotação das imagens' : 'Pausar rotação das imagens');
      start();
    });
  }

  showcase?.addEventListener('mouseenter', stop);
  showcase?.addEventListener('mouseleave', start);
  showcase?.addEventListener('focusin', stop);
  showcase?.addEventListener('focusout', start);

  show(0);
  start();
})();
