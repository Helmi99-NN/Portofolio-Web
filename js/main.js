document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('navToggle');
  const navbarNav = document.getElementById('navbarNav');
  
  if (navToggle && navbarNav) {
    navToggle.addEventListener('click', () => {
      navbarNav.classList.toggle('active');
      const spans = navToggle.querySelectorAll('span');
      
      if (navbarNav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Smooth Scrolling for Anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      if (navbarNav.classList.contains('active')) {
        navbarNav.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active Navigation Tracking on Scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNav() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);

  // Gallery Filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      galleryCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.animate-on-scroll');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
        observer.unobserve(entry.target);
      }
    });
  };
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Profile Video Autoplay & Mute Control on Scroll
  const profileVideo = document.getElementById('profile-video');
  if (profileVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Video masuk layar: coba hidupkan suara (unmute) dan play
          profileVideo.muted = false;
          let playPromise = profileVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              // Jika browser menolak (karena user belum klik apapun), tetap putar tapi tanpa suara
              profileVideo.muted = true;
              profileVideo.play();
            });
          }
        } else {
          // Video keluar layar: matikan suara (mute)
          profileVideo.muted = true;
        }
      });
    }, { threshold: 0.5 }); // Terpicu saat 50% video terlihat
    
    videoObserver.observe(profileVideo);
  }

  // Content Videos observer logic is now initialized after data is loaded
  // see initDynamicVideoObservers() called in loadCMSData()

  // Carousel Scroll Logic
  const scrollLeftBtn = document.getElementById('scrollLeftBtn');
  const scrollRightBtn = document.getElementById('scrollRightBtn');
  const contentGrid = document.getElementById('contentGrid');

  if (scrollLeftBtn && scrollRightBtn && contentGrid) {
    const scrollAmount = window.innerWidth > 768 ? 400 : 300; 
    
    scrollLeftBtn.addEventListener('click', () => {
      contentGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    scrollRightBtn.addEventListener('click', () => {
      contentGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // Load CMS Data
  loadCMSData();
});

// WhatsApp Contact Form Submission
window.sendToWhatsApp = function(event) {
  event.preventDefault();
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;
  
  // Nomor WA tanpa awalan 0 atau +, langsung gunakan kode negara 62
  const waNumber = "6285736737773";
  
  // Susun teks pesan
  const text = `Halo Helmi, saya tertarik untuk terhubung dengan Anda dari portofolio Anda.%0A%0A*Nama:* ${firstName} ${lastName}%0A*Email:* ${email}%0A*No. HP:* ${phone}%0A%0A*Pesan:*%0A${message}`;
  
  // Buka tab baru ke WhatsApp
  const waURL = `https://wa.me/${waNumber}?text=${text}`;
  window.open(waURL, '_blank');
};

// --- CMS Data Fetching & Rendering ---
async function loadCMSData() {
  try {
    // Fetch from API
    let res;
    try {
      res = await fetch('/api/data');
    } catch (e) {
      // Network error (e.g. API not running)
    }

    // Fallback to data.json if API is not available or returns HTML (e.g. static hosting returning index.html for unknown routes)
    if (!res || !res.ok || !res.headers.get('content-type')?.includes('application/json')) {
      // Tambahkan timestamp untuk menghindari browser me-load file data.json yang tersimpan di cache lama
      res = await fetch('data.json?t=' + new Date().getTime());
    }

    if (!res.ok) {
      throw new Error(`Failed to load data: ${res.status}`);
    }

    const data = await res.json();
    
    renderExperiences(data.experiences || []);
    renderOrganizations(data.organizations || []);
    renderCertifications(data.certifications || []);
    renderContents(data.contents || []);
    
    // Re-initialize animations after rendering
    initScrollAnimations();
    // Initialize dynamic video observers
    initDynamicVideoObservers();
  } catch (err) {
    console.error('Error loading CMS data:', err);
  }
}

function renderExperiences(exps) {
  const container = document.getElementById('galleryGrid');
  if (!container) return;
  
  let html = '';
  exps.forEach((exp, index) => {
    let delay = (index % 3) * 100;
    let delayClass = delay > 0 ? `delay-${delay}` : '';
    let svgIcon = exp.category === 'education' 
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;
      
    let listItems = exp.points.map(p => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${p}</li>`).join('');
    
    html += `
      <div class="gallery-card animate-on-scroll ${delayClass}" data-category="${exp.category}">
        <div class="card-icon">${svgIcon}</div>
        <div class="card-badge" ${exp.category === 'education' ? 'style="background-color: var(--surface-container); color: var(--on-surface-variant);"' : ''}>${exp.date}</div>
        <h3 class="card-title">${exp.title}</h3>
        <p class="card-role">${exp.role}</p>
        <ul class="card-list">${listItems}</ul>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderOrganizations(orgs) {
  const container = document.getElementById('timelineGrid');
  if (!container) return;
  
  let html = '';
  orgs.forEach((org, index) => {
    let delay = (index % 3) * 100;
    let delayClass = delay > 0 ? `delay-${delay}` : '';
    let listItems = org.points.map(p => `<li>${p}</li>`).join('');
    
    html += `
      <div class="timeline-item animate-on-scroll ${delayClass}">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-date">${org.date}</div>
          <h3 class="timeline-title">${org.title}</h3>
          <h4 class="timeline-org">${org.org}</h4>
          <ul class="timeline-list">${listItems}</ul>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderCertifications(certs) {
  const container = document.getElementById('certGrid');
  if (!container) return;
  
  let html = '';
  certs.forEach((cert, index) => {
    let delay = (index % 3) * 100;
    let delayClass = delay > 0 ? `delay-${delay}` : '';
    
    html += `
      <div class="cert-card animate-on-scroll ${delayClass}">
        <div class="cert-icon" style="width: 48px; height: 48px;">${cert.svgIcon}</div>
        <div class="cert-info">
          <span class="cert-issuer">${cert.issuer}</span>
          <h3 style="margin-top: 12px; font-size: 18px;">${cert.title}</h3>
          <p>${cert.desc}</p>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderContents(contents) {
  const container = document.getElementById('contentGrid');
  if (!container) return;
  
  let html = '';
  contents.forEach((c, index) => {
    let delay = (index % 4) * 100;
    let delayClass = delay > 0 ? `delay-${delay}` : '';
    
    let mediaHTML = c.type === 'video'
      ? `<video controls preload="metadata" class="content-video"><source src="${c.src}">Browser Anda tidak mendukung pemutaran video.</video>`
      : `<iframe src="${c.src}" class="content-video" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      
    html += `
      <div class="content-card animate-on-scroll ${delayClass}">
        <div class="content-video-wrapper">${mediaHTML}</div>
        <div class="content-info">
          <h3 class="content-title">${c.title}</h3>
          <p class="content-desc">${c.desc}</p>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.animate-on-scroll:not(.animate-slide-up)');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  
  revealElements.forEach(el => revealObserver.observe(el));
}

function initDynamicVideoObservers() {
  const contentVideos = document.querySelectorAll('.content-video');
  if (contentVideos.length === 0) return;
  
  const contentVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        if (entry.target.tagName === 'VIDEO' && !entry.target.paused) {
          entry.target.pause();
        } else if (entry.target.tagName === 'IFRAME') {
          entry.target.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
      }
    });
  }, { threshold: 0.05 });
  
  contentVideos.forEach(video => {
    contentVideoObserver.observe(video);
    
    if (video.tagName === 'VIDEO') {
      video.addEventListener('play', () => {
        contentVideos.forEach(otherVideo => {
          if (otherVideo !== video) {
            if (otherVideo.tagName === 'VIDEO' && !otherVideo.paused) {
              otherVideo.pause();
            } else if (otherVideo.tagName === 'IFRAME') {
              otherVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
          }
        });
      });
    }
  });
}
