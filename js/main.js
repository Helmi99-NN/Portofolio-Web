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

  // Content Videos Auto-Pause on Scroll & Exclusive Play
  const contentVideos = document.querySelectorAll('.content-video');
  if (contentVideos.length > 0) {
    const contentVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // Jika video keluar layar, otomatis pause
          if (!entry.target.paused) {
            entry.target.pause();
          }
        }
      });
    }, { threshold: 0.05 }); // Terpicu saat video hampir sepenuhnya hilang dari layar
    
    contentVideos.forEach(video => {
      contentVideoObserver.observe(video);
      
      // Eksklusif: Pause video lain saat satu video diputar
      video.addEventListener('play', () => {
        contentVideos.forEach(otherVideo => {
          if (otherVideo !== video && !otherVideo.paused) {
            otherVideo.pause();
          }
        });
      });
    });
  }

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
