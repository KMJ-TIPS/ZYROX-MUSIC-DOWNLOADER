(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const soundToggle = document.getElementById('sound-toggle');
  const gallery = document.getElementById('screenshot-gallery');
  let tapSounds = false;
  let audioContext;

  const setMenu = (open, restoreFocus = false) => {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
    if (event.matches) setMenu(false);
  });

  const playTap = () => {
    if (!tapSounds || document.hidden) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioContext ||= new AudioContextClass();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(760, now);
      oscillator.frequency.exponentialRampToValueAtTime(980, now + 0.06);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
    } catch (_) { /* Sound is optional; navigation remains available. */ }
  };
  soundToggle.addEventListener('click', () => {
    tapSounds = !tapSounds;
    soundToggle.setAttribute('aria-pressed', String(tapSounds));
    soundToggle.setAttribute('aria-label', tapSounds ? 'Disable website tap sounds' : 'Enable website tap sounds');
    soundToggle.querySelector('.sound-state').textContent = tapSounds ? 'Sound on' : 'Sound off';
    soundToggle.querySelector('use').setAttribute('href', tapSounds ? '#i-sound' : '#i-mute');
    if (tapSounds) playTap();
  });
  document.addEventListener('click', event => {
    if (event.isTrusted && event.target.closest('a,button,summary') && !event.target.closest('#sound-toggle')) playTap();
  });

  const scrollGallery = target => {
    gallery.scrollTo({left: target, behavior: motion.matches ? 'auto' : 'smooth'});
  };
  const moveGallery = direction => {
    const first = gallery.querySelector('.screen-card');
    const gap = parseFloat(getComputedStyle(gallery).columnGap) || 25;
    scrollGallery(gallery.scrollLeft + direction * (first.getBoundingClientRect().width + gap));
  };
  document.getElementById('gallery-prev').addEventListener('click', () => moveGallery(-1));
  document.getElementById('gallery-next').addEventListener('click', () => moveGallery(1));
  document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
    const card = gallery.querySelectorAll('.screen-card')[Number(button.dataset.screen)];
    if (card) scrollGallery(card.offsetLeft - gallery.offsetLeft);
  }));
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveGallery(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
})();
