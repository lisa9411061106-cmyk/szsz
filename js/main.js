// Personal Portfolio & Introduction Site - Interactive Scripts
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLightbox();
  initMusicPlayer();
  initShareActions();
});

/* ----------------------------------------------------
 * 1. Desktop Navigation & Active Scroll Tracking
 * ---------------------------------------------------- */
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-pill-btn');
  const sections = document.querySelectorAll('.website-section');

  if (!navBtns.length) return;

  // Click smooth scroll
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      e.preventDefault();

      if (targetId === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.replaceState(null, '', ' ');
      } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + targetId);
        }
      }

      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Active pill highlight on scroll
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navBtns.forEach(btn => {
          if (btn.getAttribute('data-target') === id) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* ----------------------------------------------------
 * 2. Fullscreen Lightbox Image Viewer
 * ---------------------------------------------------- */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');

  if (!modal || !modalImg) return;

  const triggerImages = document.querySelectorAll('[data-zoomable]');
  triggerImages.forEach(img => {
    img.addEventListener('click', () => {
      const src = img.getAttribute('data-zoomable') || img.src;
      const caption = img.getAttribute('data-caption') || img.alt || '';
      modalImg.src = src;
      modalCaption.textContent = caption;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ----------------------------------------------------
 * 3. Interactive Pop Vinyl Music Player
 * ---------------------------------------------------- */
function initMusicPlayer() {
  const playBtn = document.getElementById('player-play-btn');
  const disc = document.getElementById('vinyl-disc');
  const songTitle = document.getElementById('player-song-title');
  const artistName = document.getElementById('player-artist-name');
  const progressFill = document.getElementById('player-progress-fill');
  const progressBarWrap = document.getElementById('player-progress-bar-wrap');
  const artistRows = document.querySelectorAll('.artist-row-item');

  if (!playBtn) return;

  let isPlaying = false;
  let progress = 35;
  let progressInterval = null;
  let audioCtx = null;

  // Web Audio Synth Chimes for delightful user feedback
  function playMelody(notes) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.09, audioCtx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.12);
        osc.stop(audioCtx.currentTime + index * 0.12 + 0.35);
      });
    } catch (e) {
      // AudioContext unavailable or restricted
    }
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      disc.classList.remove('paused');
      playBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
      playMelody([440, 554.37, 659.25]); // A major chord
      progressInterval = setInterval(() => {
        progress = (progress + 0.4) % 100;
        if (progressFill) progressFill.style.width = progress + '%';
      }, 250);
      showToast('▶ 正在試聽精選歌曲...');
    } else {
      disc.classList.add('paused');
      playBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
      clearInterval(progressInterval);
    }
  }

  playBtn.addEventListener('click', togglePlay);

  if (progressBarWrap) {
    progressBarWrap.addEventListener('click', (e) => {
      const rect = progressBarWrap.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      progress = Math.max(0, Math.min(100, clickPos * 100));
      if (progressFill) progressFill.style.width = progress + '%';
      playMelody([523.25]);
    });
  }

  artistRows.forEach(row => {
    row.addEventListener('click', () => {
      const artist = row.getAttribute('data-artist');
      const song = row.getAttribute('data-song');
      if (songTitle && song) songTitle.textContent = song;
      if (artistName && artist) artistName.textContent = artist;
      progress = 0;
      if (progressFill) progressFill.style.width = '0%';
      
      if (!isPlaying) {
        togglePlay();
      } else {
        playMelody([587.33, 739.99, 880]);
      }
      showToast(`已切換曲目：${artist} - ${song}`);
    });
  });
}

/* ----------------------------------------------------
 * 4. Share Actions & Toast Message
 * ---------------------------------------------------- */
function initShareActions() {
  const shareBtn = document.getElementById('quick-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl).then(() => {
          showToast('📋 網站連結已複製到剪貼簿！');
        }).catch(() => {
          showToast('已複製網址！');
        });
      } else {
        showToast('已複製網址！');
      }
    });
  }
}

// Global Toast notification
function showToast(message) {
  let toast = document.getElementById('toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}
