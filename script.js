/**
 * AUPP TRADING CLUB - PRESENTATION ENGINE
 * Interactive 16:9 Slide Presentation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlideIndex = 0;

  const stage = document.getElementById('presentationStage');
  const viewport = document.getElementById('presentationViewport');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('slideCounter');
  const progressBar = document.getElementById('progressBar');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const gridBtn = document.getElementById('gridBtn');
  const printBtn = document.getElementById('printBtn');
  const modalOverlay = document.getElementById('overviewModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalThumbnails');

  // Auto scale stage to fit window while keeping 16:9 aspect ratio
  function resizeStage() {
    if (!stage || !viewport) return;
    const baseWidth = 1440;
    const baseHeight = 810;
    const windowWidth = viewport.clientWidth;
    const windowHeight = viewport.clientHeight;

    const scaleX = windowWidth / baseWidth;
    const scaleY = windowHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY) * 0.96; // 96% fit for elegant padding

    stage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', resizeStage);
  resizeStage();

  // Populate Slide Grid Overview
  function buildOverviewGrid() {
    if (!modalBody) return;
    modalBody.innerHTML = '';

    slides.forEach((slide, idx) => {
      const titleElem = slide.querySelector('.slide-title') || slide.querySelector('.cover-title') || slide.querySelector('.qa-title');
      const title = titleElem ? titleElem.innerText.replace('\n', ' ') : `Slide ${idx + 1}`;
      
      const thumb = document.createElement('div');
      thumb.className = `slide-thumbnail ${idx === currentSlideIndex ? 'current' : ''}`;
      thumb.innerHTML = `
        <div class="thumbnail-num">Slide ${String(idx + 1).padStart(2, '0')}</div>
        <div class="thumbnail-title">${title}</div>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(idx);
        closeOverviewModal();
      });
      modalBody.appendChild(thumb);
    });
  }

  // Go to specific slide
  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;

    slides.forEach((s, idx) => {
      if (idx === index) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    currentSlideIndex = index;
    updateUI();

    // Sync hash
    window.location.hash = `slide-${index + 1}`;
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  function updateUI() {
    if (counter) {
      counter.innerText = `${String(currentSlideIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
    }
    if (progressBar) {
      const progressPercent = ((currentSlideIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
    if (prevBtn) {
      prevBtn.disabled = currentSlideIndex === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = currentSlideIndex === totalSlides - 1;
    }

    // Highlight current thumbnail in overview if open
    const thumbs = modalBody?.querySelectorAll('.slide-thumbnail');
    thumbs?.forEach((t, i) => {
      if (i === currentSlideIndex) {
        t.classList.add('current');
      } else {
        t.classList.remove('current');
      }
    });
  }

  // Modal handlers
  function openOverviewModal() {
    buildOverviewGrid();
    modalOverlay.classList.add('active');
  }

  function closeOverviewModal() {
    modalOverlay.classList.remove('active');
  }

  // Fullscreen toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Button Listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
  if (gridBtn) gridBtn.addEventListener('click', openOverviewModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeOverviewModal);
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeOverviewModal();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // If modal is open, ESC closes it
    if (modalOverlay.classList.contains('active')) {
      if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
        closeOverviewModal();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
      case 'j':
      case 'J':
      case 'l':
      case 'L':
        nextSlide();
        e.preventDefault();
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'k':
      case 'K':
      case 'h':
      case 'H':
      case 'Backspace':
        prevSlide();
        e.preventDefault();
        break;

      case 'Home':
        goToSlide(0);
        e.preventDefault();
        break;

      case 'End':
        goToSlide(totalSlides - 1);
        e.preventDefault();
        break;

      case 'f':
      case 'F':
        toggleFullscreen();
        e.preventDefault();
        break;

      case 'g':
      case 'G':
        openOverviewModal();
        e.preventDefault();
        break;

      case 'p':
      case 'P':
        if (e.ctrlKey || e.metaKey) {
          // let default print trigger
        } else {
          window.print();
          e.preventDefault();
        }
        break;

      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  });

  // Check URL Hash for initial slide
  if (window.location.hash) {
    const match = window.location.hash.match(/slide-(\d+)/);
    if (match && match[1]) {
      const slideNum = parseInt(match[1], 10) - 1;
      goToSlide(slideNum);
    } else {
      goToSlide(0);
    }
  } else {
    goToSlide(0);
  }

  // Interactive Quiz on Slide 16
  window.toggleInteractiveLayer = function(layerId, btnElement) {
    const layer = document.getElementById(layerId);
    if (!layer) return;

    const isVisible = layer.style.display !== 'none';
    if (isVisible) {
      layer.style.display = 'none';
      btnElement.classList.remove('active');
    } else {
      layer.style.display = 'block';
      btnElement.classList.add('active');
    }
  };

  window.resetInteractiveLayers = function() {
    const layers = ['layerSwings', 'layerBOS', 'layerCHoCH', 'layerEntry'];
    layers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    document.querySelectorAll('.interactive-toggle-btn').forEach(btn => btn.classList.remove('active'));
  };

  window.revealAllInteractiveLayers = function() {
    const layers = ['layerSwings', 'layerBOS', 'layerCHoCH', 'layerEntry'];
    layers.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'block';
    });
    document.querySelectorAll('.interactive-toggle-btn').forEach(btn => {
      if (btn.innerText.includes('Show') || btn.innerText.includes('Layer')) {
        btn.classList.add('active');
      }
    });
  };
});
